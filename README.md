# GitHub Contribution Graph Text Generator

Convert text into GitHub contribution graph pixel art using backdated git commits.

## Quick Start

```bash
# Install dependencies
npm install

# Preview text in console (no commits)
node index.js --text "HELLO" --preview

# AUTOMATED: init, commit, and push in one go!
node index.js --text "PRANEETH" --remote https://github.com/YOU/REPO.git

# Generate commits in current repo (manual push later)
node index.js --text "HELLO"

# Generate with darker green (more commits per pixel)
node index.js --text "HI" --intensity 3

# Shift text position in timeline
node index.js --text "HI" --offset 5

# Target a specific repo
node index.js --text "HI" --repo ./my-repo

# Export as shell script
node index.js --text "HI" --export commits.sh
```

## Features

- **Automated Push** — One command to init, commit, and push via `--remote`
- **Interactive .bat Support** — Windows scripts will prompt for a Repo URL if not provided
- **5×7 Dot-Matrix Font** — A–Z, 0–9, space, and punctuation
- **Console Preview** — See your text before committing
- **Intensity Control** — 1 (light green) to 4 (dark green)
- **Week Offset** — Position text anywhere in the 52-week window
- **Shell Script Export** — Download/run manually
- **Web UI** — Open `web/index.html` for a live visual editor

## How It Works

1. Text is converted to a 7-row binary pixel grid using dot-matrix fonts
2. Each column maps to a week, each row to a day (Sun–Sat)
3. Filled pixels become empty git commits with backdated timestamps
4. Push to GitHub — the contribution graph renders your text

## Project Structure

```
├── index.js              # CLI entry point
├── fonts/index.js        # 5×7 character matrices
├── utils/
│   ├── grid.js           # Text → pixel grid
│   └── dateMapper.js     # Grid → date mapping
├── scripts/generate.js   # Git commit generator
└── web/index.html        # Web UI (standalone)
```

## Usage Guide

### Step 1: Preview

```bash
node index.js --text "PRANEETH" --preview
```

### Step 2: Create a fresh repo and generate commits

```bash
mkdir my-graph-art && cd my-graph-art
git init
node ../index.js --text "PRANEETH" --repo .
```

### Step 3: Push to GitHub

```bash
git remote add origin https://github.com/YOUR_USER/YOUR_REPO.git
git branch -M main
git push -u origin main
```

Wait a few minutes for the contribution graph to update.

## Constraints

- GitHub shows the last 52 weeks — text must fit within this window
- Dates must be in the past (future dates are skipped)
- Each character is 5 columns wide + 1 column spacing
- Maximum ~8–9 characters for a 52-week window

## License

MIT
