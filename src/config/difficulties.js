export const DIFFICULTIES = {
  easy: { label: 'Beginner', rows: 9, columns: 9, mines: 10, leaderboardKey: 'beginner', noGuessAllowed: true },
  medium: { label: 'Intermediate', rows: 16, columns: 16, mines: 40, leaderboardKey: 'intermediate', noGuessAllowed: true },
  hard: { label: 'Expert', rows: 16, columns: 30, mines: 99, leaderboardKey: 'expert', noGuessAllowed: true },
  god: { label: 'God', badge: 'Impossible', rows: 30, columns: 50, mines: 450, leaderboardKey: 'god', noGuessAllowed: false },
}

export const CUSTOM_DIFFICULTY = { label: 'Custom', rows: 12, columns: 12, mines: 25, noGuessAllowed: true }

export const getDifficultyConfig = (difficulty) => DIFFICULTIES[difficulty] || CUSTOM_DIFFICULTY

export const getLeaderboardKey = (difficulty) => getDifficultyConfig(difficulty).leaderboardKey || null

export const runDifficultyChecks = () => {
  const god = DIFFICULTIES.god
  console.assert(god.rows === 30 && god.columns === 50 && god.mines === 450, 'God config is 50x30 with 450 mines')
}

if (import.meta.env.DEV) runDifficultyChecks()
