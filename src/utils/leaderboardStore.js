const key = 'minesweeper-leaderboard'
export const getScores = () => JSON.parse(localStorage.getItem(key) || '{"beginner":[],"intermediate":[],"expert":[]}')
export const addScore = (difficulty, score) => {
  const current = getScores()
  current[difficulty] = [...(current[difficulty] || []), score].sort((a, b) => a.time - b.time || new Date(a.date) - new Date(b.date)).slice(0, 10)
  localStorage.setItem(key, JSON.stringify(current))
  return score
}
export const clear = () => localStorage.setItem(key, '{"beginner":[],"intermediate":[],"expert":[]}')
