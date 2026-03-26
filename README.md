# GitHub Contribution Graph Text Generator

**Live Demo: [https://git-matrix-tofc.vercel.app/](https://git-matrix-tofc.vercel.app/)**

Convert any text into GitHub contribution graph pixel art using backdated git commits.

## 🚀 How to Use (3 Simple Methods)

### Method 1: Automated CLI (Fastest for Developers)
If you have **Node.js** installed, this is the easiest way. One command does everything:
1. `npm install` (only once)
2. Run this command:
   ```bash
   node index.js --text "HELLO" --year 2025 --remote https://github.com/YOU/REPO.git
   ```
   *This will initialize a repo, create all commits, and push them to your GitHub automatically.*

---

### Method 2: Web UI + .bat (Easiest for Windows Users)
No coding or CLI knowledge needed:
1. Open [web/index.html](file:///d:/Downloads/git%20matrix/web/index.html) in your browser.
2. Type your **Text** and (optional) **GitHub Repo URL**.
3. Click **"Download .bat"**.
4. Move the `.bat` file into a new empty folder and **double-click it**.
   *It will prompt you for a URL if you didn't provide one, then handle the entire process.*

---

### Method 3: Web UI + .sh (Linux / Mac / Git Bash)
1. Open [web/index.html](file:///d:/Downloads/git%20matrix/web/index.html) in your browser.
2. Enter your text and click **"Download .sh"**.
3. Open your terminal in the target folder and run:
   ```bash
   bash git-matrix.sh
   ```

## ✨ Features

- **Automated Push** — One command to init, commit, and push via `--remote`.
- **Interactive .bat Support** — Windows scripts prompt for a Repo URL if missing.
- **Year Selection** — Target any past year (e.g., 2024, 2025).
- **Intensity Control** — Choose shades of green (1=light, 4=dark).
- **5×7 Dot-Matrix Font** — A–Z, 0–9, space, and punctuation.


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
