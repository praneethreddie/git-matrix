/**
 * Grid-to-Date Mapper
 * Maps each filled pixel in the grid to a real past date that corresponds
 * to the correct cell in the GitHub contribution graph.
 *
 * GitHub's contribution graph:
 *   - 7 rows: Sunday (0) → Saturday (6)
 *   - ~52 columns: weeks
 *   - When viewing a specific year, it shows Jan 1 → Dec 31 of that year
 *   - When viewing "last 12 months", rightmost column = current week
 */

import dayjs from 'dayjs';

/** Maximum weeks in a year's contribution graph */
const MAX_WEEKS = 53;

/**
 * Map a pixel grid to commit dates.
 *
 * @param {number[][]} grid - 7-row binary pixel grid
 * @param {object}   opts
 * @param {number}   [opts.offset=0]    - Week offset from the right edge
 * @param {number}   [opts.intensity=1] - Commits per filled pixel (1–4)
 * @param {number}   [opts.year]        - Target year (e.g. 2025). If omitted, uses last 52 weeks.
 * @returns {{ dates: { date: string, commits: number }[], totalCommits: number, weeksNeeded: number }}
 */
export function gridToDates(grid, opts = {}) {
  const { offset = 0, intensity = 1, year } = opts;
  const clampedIntensity = Math.max(1, Math.min(4, Math.round(intensity)));

  const gridHeight = grid.length;    // should be 7
  const gridWidth  = grid[0].length; // number of columns (weeks)

  if (gridWidth > MAX_WEEKS) {
    throw new Error(
      `Text is too wide (${gridWidth} weeks). Maximum is ${MAX_WEEKS} weeks. ` +
      'Use shorter text.'
    );
  }

  const today = dayjs();
  let refSunday;   // The Sunday that anchors the rightmost column of the graph
  let maxWeeks;    // Total available weeks in the graph window
  let yearEnd;     // Latest allowed date (for future-date filtering)

  if (year) {
    // ── Year Mode ──
    // GitHub's year view shows Jan 1 → Dec 31 of that year.
    // The first column starts on the Sunday on or before Jan 1.
    // The last column ends on the Saturday on or after Dec 31.
    const jan1 = dayjs(`${year}-01-01`);
    const dec31 = dayjs(`${year}-12-31`);

    // First Sunday on or before Jan 1
    const graphStart = jan1.subtract(jan1.day(), 'day');
    // Last Saturday on or after Dec 31
    const graphEnd = dec31.add(6 - dec31.day(), 'day');

    maxWeeks = Math.ceil(graphEnd.diff(graphStart, 'day') / 7) + 1;
    // The reference Sunday for the rightmost column
    refSunday = graphEnd.subtract(graphEnd.day(), 'day');
    yearEnd = dec31;

    if (gridWidth > maxWeeks) {
      throw new Error(
        `Text is too wide (${gridWidth} weeks) for year ${year} (${maxWeeks} weeks available).`
      );
    }
  } else {
    // ── Rolling Mode (last 52 weeks) ──
    const currentDayOfWeek = today.day();
    refSunday = today.subtract(currentDayOfWeek, 'day');
    maxWeeks = 52;
    yearEnd = today; // no future dates
  }

  // Place text: rightmost column of text aligns to (maxWeeks - 1 - offset)
  const rightmostWeekIndex = maxWeeks - 1 - offset;
  const leftmostWeekIndex  = rightmostWeekIndex - (gridWidth - 1);

  if (leftmostWeekIndex < 0) {
    throw new Error(
      `Offset ${offset} pushes text outside the ${maxWeeks}-week window. ` +
      `Decrease offset or use shorter text.`
    );
  }

  const dates = [];

  for (let col = 0; col < gridWidth; col++) {
    const weeksAgo = rightmostWeekIndex - col;
    const weekSunday = refSunday.subtract(weeksAgo, 'week');

    for (let row = 0; row < gridHeight; row++) {
      if (grid[row][col] === 1) {
        const commitDate = weekSunday.add(row, 'day');

        // Skip future dates
        if (commitDate.isAfter(today, 'day')) {
          continue;
        }

        // In year mode: skip dates outside the target year
        if (year) {
          if (commitDate.year() !== year) {
            continue;
          }
        } else {
          // Rolling mode: skip dates older than 1 year
          const oneYearAgo = today.subtract(1, 'year');
          if (commitDate.isBefore(oneYearAgo, 'day')) {
            continue;
          }
        }

        dates.push({
          date: commitDate.format('YYYY-MM-DDTHH:mm:ss'),
          commits: clampedIntensity,
        });
      }
    }
  }

  const totalCommits = dates.reduce((sum, d) => sum + d.commits, 0);

  return { dates, totalCommits, weeksNeeded: gridWidth };
}

/**
 * Get summary info about how the text will appear.
 */
export function getDateRange(dates) {
  if (dates.length === 0) return { start: null, end: null };
  const sorted = [...dates].sort((a, b) => a.date.localeCompare(b.date));
  return {
    start: sorted[0].date.split('T')[0],
    end:   sorted[sorted.length - 1].date.split('T')[0],
  };
}
