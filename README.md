# NeonOS 💜

A fully-featured, browser-based desktop operating system built with React, Zustand, and Tailwind CSS. No installation required — runs entirely in the browser.

**Live Demo:** `https://<your-username>.github.io/NeonOS/`

---

## Features

### Desktop Environment
- **Wallpaper** — Preset gallery + custom URL support via Settings
- **Right-click Context Menu** — Quick access to apps, wallpaper, and settings
- **App Launcher** — Center ⊞ button or right-click → searchable grid of all apps
- **Shelf** — Bottom bar with running-app indicators, clock, and system tray
- **Window Manager** — Draggable, stackable windows with macOS-style traffic lights
- **Desktop Icons** — Double-click to launch any app

### Applications (11 apps)

| App | Description |
|---|---|
| 🦁 **Brave Browser** | Embedded web browser with Brave UI, Shields counter, tab bar |
| 📁 **Files** | Collapsible file tree, sidebar with storage meter |
| ⚙️ **Settings** | Wallpaper picker (8 presets + custom URL), display info |
| 📝 **Notes** | Multi-note editor with **AI features** (summarize, spell-check, improve, translate) |
| 🧮 **Calculator** | iOS-style calculator with proper operator chaining |
| 🕐 **Clock** | SVG analog + digital clock, stopwatch with laps |
| 📊 **System Monitor** | FPS counter, JS heap usage, browser info, network API |
| 💜 **Discord** | Full Discord UI clone — servers, channels, DMs, members list |
| 🎵 **Plexamp** | Music player with waveform visualizer, queue, and audio URL support |
| 🎨 **Paint** | Canvas paint app — pencil, eraser, shapes, fill, text, undo/redo |
| 💻 **Terminal** | Operational terminal — `ls`, `cd`, `cat`, `ping`, `neofetch`, and more |

---

## AI Notes

The Notes app uses the **Anthropic Claude API** directly from your browser.

1. Open **Notes** → click **🔑 Add Key** in the toolbar
2. Enter your `sk-ant-...` API key (stored locally in `localStorage`)
3. Use **✦ AI** to: Summarize, Spell Check, Improve Writing, Translate, Extract Key Points

> **Note:** Direct browser API calls require the `anthropic-dangerous-direct-browser-access` header, which is supported by Anthropic for personal/development use.

---

## Terminal Commands

```bash
ls [path]     # list directory
cd [path]     # change directory
pwd           # print working directory
cat <file>    # show file contents
ping <host>   # ping via HTTP (e.g. ping google.com)
echo <text>   # echo text
date          # current date/time
whoami        # current user
uname -a      # system info
neofetch      # fancy system info
history       # command history
mkdir/touch/rm  # simulated filesystem ops
clear         # clear terminal
```

---

## Hosting on GitHub Pages

### Step 1 — Create the repo
```bash
cd claude-os
git init
git add .
git commit -m "feat: initial NeonOS release"
```

### Step 2 — Push to GitHub
1. Create a new GitHub repository named **NeonOS**
2. Push your code:
```bash
git remote add origin https://github.com/<your-username>/NeonOS.git
git branch -M main
git push -u origin main
```

### Step 3 — Enable GitHub Pages
1. Go to your repo → **Settings** → **Pages**
2. Under **Source**, select **GitHub Actions**
3. The workflow in `.github/workflows/deploy.yml` will auto-deploy on every push to `main`

Your site will be live at: `https://<your-username>.github.io/NeonOS/`

---

## Local Development

```bash
npm install
npm run dev
# Open http://localhost:5173
```

## Build

```bash
npm run build
npm run preview
```

---

## Tech Stack

- **React 18** — UI framework
- **Zustand** — Global state (wallpaper, windows, apps)
- **Tailwind CSS** — Styling + glassmorphism
- **Vite** — Build tool
- **HTML5 Canvas** — Paint app drawing
- **Web Audio API** — Plexamp audio playback
- **Anthropic API** — Notes AI features

---

## License

MIT — feel free to fork, modify, and build on top of NeonOS.

---

*Built with Claude Code · Powered by Anthropic*
