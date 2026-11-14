const key = 'minesweeper-leaderboard'
const emptyScores = { beginner: [], intermediate: [], expert: [], god: [] }
export const getScores = () => {
  try {
    const stored = localStorage.getItem(key)
    const parsed = stored ? JSON.parse(stored) : emptyScores
    return parsed && typeof parsed === 'object' ? { ...emptyScores, ...parsed } : emptyScores
  } catch {
    return emptyScores
  }
}
export const addScore = (difficulty, score) => {
  const current = getScores()
  current[difficulty] = [...(current[difficulty] || []), score].sort((a, b) => a.time - b.time || new Date(a.date) - new Date(b.date)).slice(0, 10)
  localStorage.setItem(key, JSON.stringify(current))
  return score
}
export const clear = () => localStorage.setItem(key, JSON.stringify(emptyScores))
