import { useState } from 'react'
import { Close } from './icons/Icons'
import { formatTime } from '../hooks/useStats'
export default function LeaderboardModal({ leaderboard, onClose, difficulty, onClear }) {
  const [tab, setTab] = useState(difficulty === 'easy' ? 'beginner' : difficulty === 'medium' ? 'intermediate' : 'expert')
  const labels = { beginner: 'Beginner', intermediate: 'Intermediate', expert: 'Expert' }
  return <div className="modal-backdrop" onClick={(event) => { if (event.target === event.currentTarget) onClose() }}><section className="game-modal leaderboard-modal" role="dialog" aria-modal="true" aria-labelledby="leaderboard-title">
    <button className="modal-close" onClick={onClose} title="Close" aria-label="Close"><Close /></button><h2 id="leaderboard-title">Leaderboard</h2>
    <div className="leaderboard-tabs">{Object.keys(labels).map((key) => <button className={tab === key ? 'selected' : ''} key={key} onClick={() => setTab(key)}>{labels[key]}</button>)}</div>
    <ol>{(leaderboard.scores[tab] || []).map((score, index) => <li className={score.id === leaderboard.latestId ? 'latest-score' : ''} key={score.id}><b>#{index + 1}</b><span>{score.name}</span><strong>{formatTime(score.time)}</strong><small>{new Date(score.date).toLocaleDateString()} · {score.noGuess ? 'No-Guess' : 'Guessing'}</small></li>)}</ol>
    <button className="text-button" onClick={onClear}>Clear leaderboard</button>
  </section></div>
}
