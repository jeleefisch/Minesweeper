# Minesweeper

A custom React Minesweeper game built with Vite, functional components, hooks,
plain CSS, and inline SVG icons.

## Create and run

For a new Vite project:

```bash
npm create vite@latest minesweeper -- --template react
cd minesweeper
npm install
npm run dev
```

For this checked-out project:

```bash
npm install
npm run dev
```

Open the local URL printed by Vite. Validate the project with:

```bash
npm run build
npm run lint
```

## Features

- Beginner, Intermediate, Expert, and validated Custom boards.
- Safe first click with a protected 3x3 area when the board is not too dense.
- BFS flood reveal, chording, flags, touch long-press flagging, and Quick Flag mode.
- Optional No-Guess generation with a logic solver and a fallback warning.
- Web Audio effects for reveals, flags, bombs, and wins, with a persisted mute setting.
- Three persisted themes: Pastel Purple, Classic Gray, and Classic Green.
- CSS-variable zoom from 50% to 200%, with buttons, keyboard shortcuts, Ctrl+wheel,
  and horizontally scrollable wide boards.
- Fixed 16px game-shell radius. Tiles remain square, gapless, and unrounded in
  every theme; Classic Gray keeps its bevel styling.
- Stats for games played, win rate, best time, and streaks.
- Hint support with timer penalties and hint-free best-time rules.
- Delayed game-over modal with board map, plain-text sharing, copy, PNG export,
  and replay controls.
- Replay playback with Play/Pause, Restart, 1x/2x/4x speed, scrubbing, reduced
  motion support, and deterministic move logs.
- Top-10 hint-free leaderboard per difficulty with name sanitization and
  local-storage persistence.
- Pixel-art SVG restart faces for playing, win, loss, and worried states.
- Responsive layout, reduced-motion support, and persisted animation preference.

## File guide

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

## Five extension ideas

1. Add daily seeded challenges with shareable result codes.
2. Add keyboard navigation and a fully keyboard-operated board.
3. Add online leaderboard synchronization through `leaderboardStore.js`.
4. Add achievements for streaks, speed records, and no-guess wins.
5. Add replay export/import so finished games can be shared and replayed later.
