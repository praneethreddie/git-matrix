#!/usr/bin/env node

/**
 * GitHub Contribution Graph Text Generator
 * ─────────────────────────────────────────
 * CLI entry point: converts text into backdated git commits
 * that render as pixel art on the GitHub contribution graph.
 *
 * Usage:
 *   node index.js --text "HELLO"                  # generate commits in cwd
 *   node index.js --text "HELLO" --preview         # preview grid only
 *   node index.js --text "HI" --intensity 3        # darker green
 *   node index.js --text "HI" --offset 2           # shift 2 weeks right
 *   node index.js --text "HI" --year 2024          # target year 2024
 *   node index.js --text "HI" --remote https://github.com/YOU/REPO.git # auto-push
 *   node index.js --text "HI" --repo ./my-repo     # target another repo
 *   node index.js --text "HI" --export script.sh   # export shell script
 */

import { Command } from 'commander';
import chalk from 'chalk';
import { resolve } from 'path';
import { writeFileSync } from 'fs';

import { textToGrid, gridToString } from './utils/grid.js';
import { gridToDates, getDateRange } from './utils/dateMapper.js';
import { generateCommits, generateScript } from './scripts/generate.js';

// ───────── CLI Definition ─────────

const program = new Command();

program
  .name('git-matrix')
  .description('Convert text into GitHub contribution graph pixel art')
  .version('1.0.0')
  .requiredOption('-t, --text <string>', 'Text to render on the contribution graph')
  .option('-p, --preview', 'Preview the pixel grid in the console (no commits)', false)
  .option('-i, --intensity <number>', 'Commits per pixel: 1=light, 4=dark green', '1')
  .option('-o, --offset <number>', 'Shift text by N weeks (0 = rightmost)', '0')
  .option('-y, --year <number>', 'Target year (e.g. 2024). Omit for last 52 weeks.')
  .option('-v, --remote <url>', 'Automatic: initialize, commit, and push to this GitHub URL')
  .option('-r, --repo <path>', 'Target git repository path', '.')
  .option('-e, --export <file>', 'Export a shell script instead of committing')
  .parse(process.argv);

const opts = program.opts();

// ───────── Main ─────────

async function main() {
  const text      = opts.text;
  const preview   = opts.preview;
  const intensity = parseInt(opts.intensity, 10);
  const offset    = parseInt(opts.offset, 10);
  const year      = opts.year ? parseInt(opts.year, 10) : undefined;
  const remote    = opts.remote;
  const repoPath  = resolve(opts.repo);
  const exportFile = opts.export;

  // ── Banner ──
  console.log('');
  console.log(chalk.bold.green('  ██  GitHub Contribution Graph Text Generator  ██'));
  console.log(chalk.dim('  ─────────────────────────────────────────────────'));
  console.log('');

  // ── Step 1: Text → Pixel Grid ──
  console.log(chalk.cyan('  ▸ Rendering text: ') + chalk.bold.white(`"${text}"`) + (year ? chalk.dim(` → targeting year ${year}`) : chalk.dim(' → last 52 weeks')));

  let result;
  try {
    result = textToGrid(text);
  } catch (err) {
    console.error(chalk.red(`\n  ✖ ${err.message}`));
    process.exit(1);
  }

  const { grid, width } = result;
  console.log(chalk.dim(`    Grid size: ${width} columns × 7 rows`));
  console.log('');

  // ── Step 2: Show Preview ──
  console.log(chalk.cyan('  ▸ Preview:'));
  console.log('');

  // Render with green blocks
  const previewLines = grid.map((row) =>
    '    ' + row.map((v) => (v ? chalk.green('█') : chalk.gray('·'))).join(' ')
  );
  console.log(previewLines.join('\n'));
  console.log('');

  if (preview) {
    console.log(chalk.yellow('  ℹ  Preview mode — no commits generated.'));
    console.log('');
    return;
  }

  // ── Step 3: Grid → Dates ──
  console.log(chalk.cyan('  ▸ Mapping pixels to dates...'));

  let dateResult;
  try {
    dateResult = gridToDates(grid, { offset, intensity, year });
  } catch (err) {
    console.error(chalk.red(`\n  ✖ ${err.message}`));
    process.exit(1);
  }

  const { dates, totalCommits, weeksNeeded } = dateResult;
  const range = getDateRange(dates);

  console.log(chalk.dim(`    Weeks needed : ${weeksNeeded}`));
  console.log(chalk.dim(`    Date range   : ${range.start} → ${range.end}`));
  console.log(chalk.dim(`    Total commits: ${totalCommits} (intensity ×${intensity})`));
  console.log('');

  // ── Step 4a: Export script if requested ──
  if (exportFile) {
    console.log(chalk.cyan(`  ▸ Exporting shell script to ${exportFile}...`));
    const script = generateScript(dates);
    writeFileSync(exportFile, script, 'utf-8');
    console.log(chalk.green(`  ✔ Script saved to ${exportFile}`));
    console.log('');
    return;
  }

  // ── Step 4b: Generate Commits ──
  console.log(chalk.cyan(`  ▸ Generating ${totalCommits} commits in: ${repoPath}`));
  console.log('');

  try {
    const startTime = Date.now();

    await generateCommits(dates, repoPath, {
      remote,
      onProgress: (current, total) => {
        const pct = Math.round((current / total) * 100);
        const bar = '█'.repeat(Math.round(pct / 2.5)) + '░'.repeat(40 - Math.round(pct / 2.5));
        process.stdout.write(
          `\r    [${chalk.green(bar)}] ${pct}%  (${current}/${total})`
        );
      },
    });

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log('');
    console.log('');
    console.log(chalk.green.bold(`  ✔ Done! Created ${totalCommits} commits in ${elapsed}s`));
    console.log('');
    console.log(chalk.dim('  Next steps:'));
    console.log(chalk.white('    1. Create a new GitHub repo (or use an existing one)'));
    console.log(chalk.white('    2. git remote add origin https://github.com/YOU/REPO.git'));
    console.log(chalk.white('    3. git push -u origin main'));
    console.log(chalk.white('    4. Wait a few minutes for the contribution graph to update'));
    console.log('');
  } catch (err) {
    console.error(chalk.red(`\n  ✖ ${err.message}`));
    process.exit(1);
  }
}

main();
