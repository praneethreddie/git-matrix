/**
 * Commit Generator
 * Creates empty git commits with backdated timestamps to paint
 * the GitHub contribution graph.
 */

import { simpleGit } from 'simple-git';
import { existsSync } from 'fs';
import { resolve } from 'path';

/**
 * Generate backdated empty commits in the target git repository.
 *
 * @param {{ date: string, commits: number }[]} dates - Array of commit targets
 * @param {string} repoPath - Path to the git repository
 * @param {object} opts
 * @param {function} [opts.onProgress] - Callback(current, total) for progress updates
 * @returns {Promise<{ totalCommits: number, repoPath: string }>}
 */
export async function generateCommits(dates, repoPath, opts = {}) {
  const { onProgress } = opts;
  const absPath = resolve(repoPath);

  // Validate repo path exists
  if (!existsSync(absPath)) {
    throw new Error(`Repository path does not exist: ${absPath}`);
  }

  const git = simpleGit(absPath);

  // Check if it's a git repo; if not, initialize one
  const isRepo = await git.checkIsRepo();
  if (!isRepo) {
    await git.init();
    // Create initial commit so the branch exists
    await git.commit('init', { '--allow-empty': null });
  }

  // Sort dates chronologically so commits appear in order
  const sorted = [...dates].sort((a, b) => a.date.localeCompare(b.date));

  // Flatten: each entry may produce multiple commits (for intensity)
  const allCommits = [];
  for (const entry of sorted) {
    for (let i = 0; i < entry.commits; i++) {
      allCommits.push(entry.date);
    }
  }

  const total = allCommits.length;
  let current = 0;

  for (const dateStr of allCommits) {
    current++;

    // Set both author and committer date via environment variables
    // simple-git allows passing env via .env()
    await git
      .env('GIT_AUTHOR_DATE', dateStr)
      .env('GIT_COMMITTER_DATE', dateStr)
      .commit(`pixel ${current}/${total}`, { '--allow-empty': null });

    if (onProgress) {
      onProgress(current, total);
    }
  }

  // If a remote is provided, handle pushing
  if (opts.remote) {
    try {
      const remotes = await git.getRemotes();
      if (!remotes.find((r) => r.name === 'origin')) {
        await git.addRemote('origin', opts.remote);
      } else {
        // Update existing remote if different
        const originUrl = (await git.remote(['get-url', 'origin'])).trim();
        if (originUrl !== opts.remote) {
          await git.remote(['set-url', 'origin', opts.remote]);
        }
      }

      await git.push(['-u', 'origin', 'main', '--force']);
    } catch (err) {
      throw new Error(`Failed to push to remote: ${err.message}`);
    }
  }

  return { totalCommits: total, repoPath: absPath };
}

/**
 * Generate a Windows Batch script (.bat) for manual use.
 *
 * @param {{ date: string, commits: number }[]} dates
 * @returns {string}
 */
export function generateBatScript(dates) {
  const sorted = [...dates].sort((a, b) => a.date.localeCompare(b.date));
  const lines = [
    '@echo off',
    'REM GitHub Contribution Graph Text Generator',
    'REM Automatically created commit script',
    '',
    'setlocal enabledelayedexpansion',
    '',
  ];

  let count = 0;
  for (const entry of sorted) {
    for (let i = 0; i < entry.commits; i++) {
      count++;
      // On Windows cmd, we use SET to set env vars for the command
      lines.push(
        `set GIT_AUTHOR_DATE=${entry.date}&& set GIT_COMMITTER_DATE=${entry.date}&& git commit --allow-empty -m "pixel ${count}"`
      );
    }
  }

  lines.push('', 'echo Done! Created ' + count + ' commits.', 'pause');
  return lines.join('\r\n');
}

/**
 * Generate a shell script of git commands (for download / manual use).
 *
 * @param {{ date: string, commits: number }[]} dates
 * @returns {string}
 */
export function generateScript(dates) {
  const sorted = [...dates].sort((a, b) => a.date.localeCompare(b.date));
  const lines = [
    '#!/bin/bash',
    '# GitHub Contribution Graph Text Generator',
    '# Generated commit script — run inside a git repo.',
    '',
    'set -e',
    '',
  ];

  let count = 0;
  for (const entry of sorted) {
    for (let i = 0; i < entry.commits; i++) {
      count++;
      lines.push(
        `GIT_AUTHOR_DATE="${entry.date}" GIT_COMMITTER_DATE="${entry.date}" ` +
        `git commit --allow-empty -m "pixel ${count}"`
      );
    }
  }

  lines.push('', `echo "Done! Created ${count} commits."`, '');
  return lines.join('\n');
}
