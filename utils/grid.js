/**
 * Text-to-Pixel Grid Converter
 * Converts a string into a combined 7-row binary pixel grid
 * with 1-column spacing between characters.
 */

import { getCharMatrix } from '../fonts/index.js';

/** Number of rows in the GitHub contribution graph */
const GRID_HEIGHT = 7;

/** Columns of blank space between characters */
const CHAR_SPACING = 1;

/**
 * Convert a text string into a 2D binary pixel grid.
 *
 * @param {string} text - The input text to render
 * @returns {{ grid: number[][], width: number, height: number }}
 */
export function textToGrid(text) {
  if (!text || typeof text !== 'string') {
    throw new Error('Input text must be a non-empty string.');
  }

  const upperText = text.toUpperCase();
  const charMatrices = [];

  // Gather the matrix for each character
  for (const char of upperText) {
    charMatrices.push(getCharMatrix(char));
  }

  if (charMatrices.length === 0) {
    throw new Error('No renderable characters found in input.');
  }

  // Calculate total grid width:
  // Each char is 5 cols wide, with 1 col spacing between them
  const totalWidth =
    charMatrices.reduce((sum, m) => sum + m[0].length, 0) +
    CHAR_SPACING * (charMatrices.length - 1);

  // Initialize an empty grid (7 rows × totalWidth cols)
  const grid = Array.from({ length: GRID_HEIGHT }, () =>
    Array(totalWidth).fill(0)
  );

  // Stamp each character matrix into the grid
  let colOffset = 0;
  for (let ci = 0; ci < charMatrices.length; ci++) {
    const matrix = charMatrices[ci];
    const charWidth = matrix[0].length;

    for (let row = 0; row < GRID_HEIGHT; row++) {
      for (let col = 0; col < charWidth; col++) {
        grid[row][colOffset + col] = matrix[row][col];
      }
    }

    colOffset += charWidth + CHAR_SPACING;
  }

  return { grid, width: totalWidth, height: GRID_HEIGHT };
}

/**
 * Render the grid as a visual string for console preview.
 *
 * @param {number[][]} grid - 2D binary grid
 * @param {string} filled - Character for filled pixels
 * @param {string} empty - Character for empty pixels
 * @returns {string}
 */
export function gridToString(grid, filled = '█', empty = '·') {
  return grid.map((row) => row.map((v) => (v ? filled : empty)).join(' ')).join('\n');
}
