# Minesweeper

A custom Minesweeper game built with React and Vite. Flat tile design, three themes, and playable on desktop and mobile.

## Features

- **Gameplay:** safe first click (3x3 safe zone), cascade reveal, chording, flags
- **No-Guess mode:** boards are checked by a logic solver so you never have to guess
- **Difficulties:** Beginner (9x9, 10 mines), Intermediate (16x16, 40), Expert (30x16, 99)
- **Stats:** games played, win rate, best time per difficulty, win streak
- **Leaderboard:** top 10 times per difficulty (stored in your browser)
- **Hints and Quick Flag:** hints add a 10 second penalty
- **Game over modal:** summary, replay, and shareable result
- **Themes:** Pastel Purple, Classic Gray, Classic Green
- **Sound effects:** generated with the Web Audio API, with a mute toggle
- **Zoom:** adjustable board size
- **Mobile friendly:** tap to reveal, long-press to flag, pinch zoom, installable as a PWA

## Controls

| Action | Desktop | Mobile |
| --- | --- | --- |
| Reveal | Left click | Tap |
| Flag | Right click | Long-press |
| Chord | Click a number | Double-tap a number |
| Hint | `H` | Hint button |
| Quick Flag | `F` | Quick Flag button |
| Restart | `R` | Face button |
| Mute | `M` | Sound button |

## Getting Started

```bash
npm install
npm run dev
```

Open http://localhost:5173. To test on your phone (same Wi-Fi):

```bash
npm run dev -- --host
```

## Build

```bash
npm run build
npm run preview
```

## Tech Stack

React, Vite, plain CSS, Web Audio API. No UI libraries.

## License

MIT
