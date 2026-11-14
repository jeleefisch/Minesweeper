import { difficultyKey, formatTime } from '../hooks/useStats'
import { preventContextMenu } from '../utils/dom'

export default function StatsHeader({ stats, difficulty, onReset }) {
  const key = difficultyKey(difficulty)
  const label = { easy: 'Beginner', medium: 'Intermediate', hard: 'Expert', custom: 'Custom' }[difficulty]
  return (
    <header className="stats-header" onContextMenu={preventContextMenu}>
      <div><span>Games Played</span><strong>{stats.played}</strong></div>
      <div><span>Win Rate</span><strong>{stats.winRate}%</strong></div>
      <div><span>Best ({label})</span><strong>{formatTime(key ? stats.bestTimes[key] : null)}</strong></div>
      <div><span>Streak</span><strong>{stats.currentStreak} <small>/ {stats.bestStreak}</small></strong></div>
      <button className="text-button" onClick={onReset}>Reset stats</button>
    </header>
  )
}
