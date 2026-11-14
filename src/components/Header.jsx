const faces = { playing: '🙂', won: '😎', lost: '😵' }

export default function Header({
  flags, mines, time, status, bestTime, onRestart, muted, onToggleMute,
  noGuess, onToggleNoGuess, noGuessWarning, generationMessage,
}) {
  return (
    <header className="game-header">
      <div className="counter"><span>MINES</span><strong>{String(Math.max(0, mines - flags)).padStart(3, '0')}</strong></div>
      <button className="restart" onClick={onRestart} aria-label="Restart game">{faces[status]}</button>
      <div className="counter"><span>TIME</span><strong>{String(time).padStart(3, '0')}</strong></div>
      <div className="header-actions">
        <button className="header-action" onClick={() => onToggleMute(!muted)} aria-label={muted ? 'Unmute sounds' : 'Mute sounds'}>{muted ? '🔇' : '🔊'}</button>
        <button className={`header-action ${noGuess ? 'selected' : ''}`} onClick={() => onToggleNoGuess(!noGuess)}>No-Guess</button>
      </div>
      {bestTime !== undefined && <div className="best-time">Best: {bestTime}s</div>}
      {generationMessage && <div className="generation-message">{generationMessage}</div>}
      {noGuessWarning && <div className="generation-message">No-Guess may be unavailable on dense boards.</div>}
    </header>
  )
}
