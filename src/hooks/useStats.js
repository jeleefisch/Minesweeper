import { useCallback, useRef } from 'react'
import useLocalStorage from './useLocalStorage'
import { getLeaderboardKey } from '../config/difficulties'

const initialStats = {
  played: 0,
  wins: 0,
  currentStreak: 0,
  bestStreak: 0,
  bestTimes: { beginner: null, intermediate: null, expert: null, god: null },
}

export const difficultyKey = getLeaderboardKey

const normalizeStats = (value) => {
  const source = value && typeof value === 'object' ? value : {}
  return {
    ...initialStats,
    ...source,
    bestTimes: { ...initialStats.bestTimes, ...(source.bestTimes || {}) },
  }
}

export const formatTime = (seconds) => {
  if (seconds === undefined || seconds === null) return '--'
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`
}

export default function useStats() {
  const [stats, setStats] = useLocalStorage('minesweeper-stats', initialStats, normalizeStats)
  const recordedGame = useRef(null)
  const recordGame = useCallback((result) => {
    if (recordedGame.current === result.id) return
    recordedGame.current = result.id
    setStats((current) => {
      const currentBestTimes = { ...initialStats.bestTimes, ...(current.bestTimes || {}) }
      const wins = current.wins + (result.status === 'won' ? 1 : 0)
      const currentStreak = result.status === 'won' ? current.currentStreak + 1 : 0
      const key = difficultyKey(result.difficulty)
      const best = key && result.status === 'won' && result.hints === 0
        && (currentBestTimes[key] === null || result.time < currentBestTimes[key])
      return {
        ...current,
        played: current.played + 1,
        wins,
        currentStreak,
        bestStreak: Math.max(current.bestStreak, currentStreak),
        bestTimes: best ? { ...currentBestTimes, [key]: result.time } : currentBestTimes,
      }
    })
  }, [setStats])
  const resetStats = useCallback(() => setStats(initialStats), [setStats])
  return {
    ...stats,
    winRate: stats.played ? Math.round((stats.wins / stats.played) * 100) : 0,
    recordGame,
    resetStats,
  }
}

export const runStatsChecks = () => {
  const base = { ...initialStats, bestTimes: { ...initialStats.bestTimes } }
  const won = { ...base, played: 1, wins: 1, currentStreak: 1, bestStreak: 1 }
  console.assert(Math.round((won.wins / won.played) * 100) === 100, 'win rate math')
  console.assert({ ...won, currentStreak: 0 }.currentStreak === 0, 'streak reset on loss')
  console.assert(base.bestTimes.beginner === null, 'hinted wins do not create a best time')
  console.assert(base.bestTimes.god === null, 'God best time migrates with old stats')
}
