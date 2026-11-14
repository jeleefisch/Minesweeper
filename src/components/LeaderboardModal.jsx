import { useState } from 'react'
import { Close, Trash } from './icons/Icons'
import { formatTime } from '../hooks/useStats'
import { preventContextMenu } from '../utils/dom'
import { getLeaderboardKey } from '../config/difficulties'
export default function LeaderboardModal({ leaderboard, onClose, difficulty, onClear }) {
  const [tab, setTab] = useState(getLeaderboardKey(difficulty) || 'beginner')
  const labels = { beginner: 'Beginner', intermediate: 'Intermediate', expert: 'Expert', god: 'God · Impossible' }
  return <div className="modal-backdrop" onContextMenu={preventContextMenu} onClick={(event) => { if (event.target === event.currentTarget) onClose() }}><section className="game-modal leaderboard-modal" onContextMenu={preventContextMenu} role="dialog" aria-modal="true" aria-labelledby="leaderboard-title">
    <button className="modal-close" onClick={onClose} title="Close" aria-label="Close"><Close /></button><h2 id="leaderboard-title">Leaderboard</h2>
    <div className="leaderboard-tabs">{Object.keys(labels).map((key) => <button className={tab === key ? 'selected' : ''} key={key} onClick={() => setTab(key)}>{labels[key]}</button>)}</div>
    <ol>{(leaderboard.scores[tab] || []).map((score, index) => <li className={score.id === leaderboard.latestId ? 'latest-score' : ''} key={score.id}><b>#{index + 1}</b><span>{score.name}</span><strong>{formatTime(score.time)}</strong><small>{new Date(score.date).toLocaleDateString()} · {score.noGuess ? 'No-Guess' : 'Guessing'}</small></li>)}</ol>
    <button className="text-button" onClick={onClear}><Trash /> Clear leaderboard</button>
  </section></div>
}
