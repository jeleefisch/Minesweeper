# Minesweeper

A quick mini game made because of my love for Minesweeper. I wanted to explore a few ideas, and this is the result.

## Features

- Beginner, Intermediate, Expert, and custom boards
- Safe first clicks, flags, hints, themes, sounds, and zoom controls
- Replay support, statistics, and local leaderboards
- Responsive design with touch and keyboard controls

## Run locally

<<<<<<< HEAD
```bash
npm install
npm run dev
```

Open the local URL provided by Vite.
=======
- `src/App.jsx` — application shell, theme state, stats, modal, leaderboard, and keyboard wiring.
- `src/App.css` — theme variables, flat tiles, fixed shell/control radii, animations, modal, and responsive layout.
- `src/components/Board.jsx` — zoom controls, animation preference, board clipping, and cell rendering.
- `src/components/Cell.jsx` — memoized cell with reveal, right-click flagging, quick flag, and touch long-press.
- `src/components/Header.jsx` — mine counter, timer, restart face, mute, hint, Quick Flag, No-Guess, and leaderboard controls.
- `src/components/GameOverModal.jsx` — final result, replay player, scrubber, board map, sharing, and PNG export.
- `src/components/LeaderboardModal.jsx` — leaderboard tabs, scores, and clearing controls.
- `src/components/StatsHeader.jsx` — games, win rate, best time, and streak display.
- `src/components/Footer.jsx` — keyboard and pointer control reference.
- `src/components/ThemeSwitcher.jsx` — the three-theme selector.
- `src/components/ZoomControls.jsx` — zoom out, reset, and zoom in controls.
- `src/components/icons/` — inline SVG controls and pixel-art face components.
- `src/assets/face-happy.svg` — source pixel-art happy-face asset.
- `src/hooks/useMinesweeper.js` — gameplay state, generation, timer, actions, and replay move log.
- `src/hooks/useStats.js` — persisted statistics and hint-free best-time handling.
- `src/hooks/useZoom.js` — persisted, clamped board zoom.
- `src/hooks/useLeaderboard.js` — persisted leaderboard state, sorting, cap, and name handling.
- `src/hooks/useLocalStorage.js` — reusable local-storage state hook.
- `src/utils/board.js` — pure board creation, mine placement, neighbor counting, flood reveal, and win checks.
- `src/utils/solver.js` — pure No-Guess solvability logic.
- `src/utils/sound.js` — lazy Web Audio effects.
- `src/utils/share.js` — plain-text summaries and board-map helpers.
- `src/utils/leaderboardStore.js` — swappable leaderboard storage API.
- `src/utils/animation.js` — reveal-depth and animation metadata helpers.
- `src/hooks/useLongPress.js` — pointer-based tap, long-press, movement cancellation, and vibration handling.
- `src/hooks/usePinchZoom.js` — two-pointer pinch zoom handling.
- `src/hooks/useBoardCellSize.js` — responsive cell sizing with resize/orientation cleanup.
- `public/manifest.webmanifest` — installable web-app metadata.
- `public/sw.js` — production-only offline asset cache.
- `public/icons/` — generated 192px and 512px flat PWA icons.

## Replay notes

Each finished game stores a move log containing reveal, flag, and unflag actions.
Reveal cascades are stored as one action with cells ordered by BFS depth. The
finished result also stores board dimensions and mine positions, allowing the
modal to rebuild the board without reusing mutable gameplay state. If no move
log is available, replay controls are hidden.

## Controls

- Left click/tap: reveal
- Right click: flag
- Long press: flag on touch devices
- Click a revealed number: chord
- `H`: hint
- `F`: Quick Flag
- `R`: restart
- `M`: mute/unmute
- `+` / `-`: zoom
- `0`: reset zoom
- `Esc`: close an open modal

## Mobile testing

Run the development server on the local network:

```bash
npm run dev -- --host
```

Open the displayed network URL on a phone connected to the same Wi-Fi. Test
tap-to-reveal, 350ms long-press flagging, movement cancellation while scrolling,
double-tap chording, Quick Flag, pinch zoom, safe-area spacing, orientation
changes, bottom-sheet modals, and the Controls toggle.

In Chrome DevTools, open **Toggle device toolbar**, choose a phone preset, and
test both portrait and landscape. Use the touch simulation to verify long-press,
double-tap, scrolling, and pinch behavior. Build and preview the production
version to test the service worker and install metadata:

```bash
npm run build
npm run preview
```
>>>>>>> dffcd8a (added mobile portability)
