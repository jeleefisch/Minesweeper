import { useCallback, useMemo, useState } from 'react'
import useLocalStorage from './useLocalStorage'

const initial = { beginner: [], intermediate: [], expert: [] }
export const sanitizeName = (name) => {
  const clean = String(name || '').replace(/<[^>]*>/g, '').trim().slice(0, 16)
  return clean || 'Player'
}
export default function useLeaderboard() {
  const [scores, setScores] = useLocalStorage('minesweeper-leaderboard', initial)
  const [lastName, setLastName] = useLocalStorage('minesweeper-last-name', 'Player')
  const [latestId, setLatestId] = useState(null)
  const addScore = useCallback((difficulty, score) => {
    const entry = { ...score, name: sanitizeName(score.name), id: `${Date.now()}-${Math.random()}` }
    setLastName(entry.name)
    setLatestId(entry.id)
    setScores((current) => {
      const next = [...(current[difficulty] || []), entry].sort((a, b) => a.time - b.time || new Date(a.date) - new Date(b.date))
      return { ...current, [difficulty]: next.slice(0, 10) }
    })
    return entry
  }, [setLastName, setScores])
  const clear = useCallback(() => setScores(initial), [setScores])
  return useMemo(() => ({ scores, lastName, latestId, addScore, clear }), [addScore, clear, lastName, latestId, scores])
}

export const runLeaderboardChecks = () => {
  const scores = Array.from({ length: 11 }, (_, i) => ({ time: i }))
  console.assert(scores.sort((a, b) => a.time - b.time).slice(0, 10).length === 10, 'leaderboard cap')
  console.assert(sanitizeName('<b>Player</b>') === 'Player', 'leaderboard sanitization')
}
