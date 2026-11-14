import { useState } from 'react'
import Board from './components/Board'
import DifficultySelector from './components/DifficultySelector'
import Header from './components/Header'
import useMinesweeper from './hooks/useMinesweeper'
import './App.css'

function App() {
  const [difficulty, setDifficulty] = useState('easy')
  const [theme, setTheme] = useState('dark')
  const game = useMinesweeper(difficulty)

  const handleDifficultyChange = (nextDifficulty) => {
    setDifficulty(nextDifficulty)
  }

  return (
    <main className={`app theme-${theme}`}>
      <section className="game-shell">
        <div className="topline">
          <div>
            <p className="eyebrow">Classic puzzle</p>
            <h1>Minesweeper</h1>
          </div>
          <label className="theme-picker">
            Theme
            <select value={theme} onChange={(event) => setTheme(event.target.value)}>
              <option value="dark">Dark</option>
              <option value="light">Light</option>
              <option value="retro">Retro</option>
              <option value="neon">Neon</option>
            </select>
          </label>
        </div>
        <DifficultySelector
          value={difficulty}
          customSettings={game.customSettings}
          onChange={handleDifficultyChange}
          onCustomChange={game.setCustomSettings}
        />
        <Header
          flags={game.flags}
          mines={game.mines}
          time={game.time}
          status={game.status}
          bestTime={game.bestTime}
          onRestart={game.restart}
          muted={game.muted}
          onToggleMute={game.setMuted}
          noGuess={game.noGuess}
          onToggleNoGuess={game.setNoGuess}
          noGuessWarning={game.noGuessWarning}
          generationMessage={game.isGenerating ? 'Generating...' : game.generationMessage}
        />
        <div className="board-scroll">
          <Board
            board={game.board}
            status={game.status}
            onReveal={game.reveal}
            onFlag={game.toggleFlag}
          />
        </div>
        <p className="tip">Click to reveal · right-click to flag · click a number to chord</p>
      </section>
    </main>
  )
}

export default App
