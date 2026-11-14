import { Hint, QuickFlag, Trophy, Volume, VolumeOff } from './icons/Icons'
import FaceCool from './icons/FaceCool'
import FaceDead from './icons/FaceDead'
import FaceHappy from './icons/FaceHappy'

export default function Header({
  flags, mines, time, status, bestTime, onRestart, muted, onToggleMute,
  noGuess, onToggleNoGuess, noGuessWarning, generationMessage, quickFlag,
  onToggleQuickFlag, hints, onHint, hintMessage, onLeaderboard,
}) {
  const face = status === 'won' ? <FaceCool label="Won" /> : status === 'lost' ? <FaceDead label="Lost" /> : <FaceHappy label="Playing" />
  return (
    <header className="game-header">
      <div className="counter"><span>MINES</span><strong>{String(Math.max(0, mines - flags)).padStart(3, '0')}</strong></div>
      <button className="restart" onClick={onRestart} title="Restart" aria-label="Restart">{face}</button>
      <div className="counter"><span>TIME</span><strong>{String(time).padStart(3, '0')}</strong></div>
      <div className="header-actions">
        <button className="header-action icon-button" onClick={() => onToggleMute(!muted)} title={muted ? 'Unmute' : 'Mute'} aria-label={muted ? 'Unmute sounds' : 'Mute sounds'}>{muted ? <VolumeOff label="Muted" /> : <Volume label="Sound on" />}</button>
        <button className={`header-action ${noGuess ? 'selected' : ''}`} onClick={() => onToggleNoGuess(!noGuess)}>No-Guess</button>
        <button className={`header-action quick-flag ${quickFlag ? 'selected' : ''}`} onClick={() => onToggleQuickFlag(!quickFlag)} title="Toggle quick flag"><QuickFlag label="Quick flag" /> {quickFlag ? 'ON' : 'OFF'}</button>
        <button className="header-action" onClick={onHint} title="Find a safe move"><Hint label="Hint" /> {hints}</button>
        <button className="header-action icon-button" onClick={onLeaderboard} title="Leaderboard" aria-label="Leaderboard"><Trophy label="Leaderboard" /></button>
      </div>
      {bestTime !== undefined && <div className="best-time">Best: {bestTime}s</div>}
      {generationMessage && <div className="generation-message">{generationMessage}</div>}
      {noGuessWarning && <div className="generation-message">No-Guess may be unavailable on dense boards.</div>}
      {hintMessage && <div className="generation-message">{hintMessage}</div>}
    </header>
  )
}
