import { useCallback, useEffect, useRef, useState } from 'react'
import Board from './components/Board'
import DifficultySelector from './components/DifficultySelector'
import Footer from './components/Footer'
import GameOverModal from './components/GameOverModal'
import Header from './components/Header'
import StatsHeader from './components/StatsHeader'
import ThemeSwitcher from './components/ThemeSwitcher'
import useLocalStorage from './hooks/useLocalStorage'
import useMinesweeper from './hooks/useMinesweeper'
import useStats from './hooks/useStats'
import useZoom from './hooks/useZoom'
import useLeaderboard from './hooks/useLeaderboard'
import LeaderboardModal from './components/LeaderboardModal'
import './App.css'

const themeColors = {
  'pastel-purple': '#eadff7',
  'classic-gray': '#c0c0c0',
  'classic-green': '#dce8c8',
}
const darkThemeColors = {
  'pastel-purple': '#241d2d',
  'classic-gray': '#202020',
  'classic-green': '#182017',
}

const getSystemMode = () => window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'

function App() {
  const [difficulty, setDifficulty] = useState('easy')
  const [theme, setTheme] = useLocalStorage('minesweeper-theme', 'classic-green')
  const [modalResult, setModalResult] = useState(null)
  const [hintMessage, setHintMessage] = useState('')
  const [leaderboardOpen, setLeaderboardOpen] = useState(false)
  const [leaderboardRank, setLeaderboardRank] = useState(null)
  const [mode, setMode] = useLocalStorage('minesweeper-mode', getSystemMode())
  const game = useMinesweeper(difficulty)
  const stats = useStats()
  const zoom = useZoom()
  const leaderboard = useLeaderboard()
  const previousResult = useRef(null)
  const { restart } = game
  const restartGame = useCallback(() => {
    setModalResult(null)
    setLeaderboardRank(null)
    restart()
  }, [restart])

  useEffect(() => {
    document.documentElement.dataset.mode = mode
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', mode === 'dark'
      ? darkThemeColors[theme] || darkThemeColors['classic-green']
      : themeColors[theme] || themeColors['classic-green'])
  }, [mode, theme])

  useEffect(() => {
    const modalOpen = Boolean(modalResult || leaderboardOpen)
    document.body.classList.toggle('modal-open', modalOpen)
    return () => document.body.classList.remove('modal-open')
  }, [leaderboardOpen, modalResult])

  useEffect(() => {
    if (!game.finishedGame || previousResult.current === game.finishedGame.id) return
    previousResult.current = game.finishedGame.id
    stats.recordGame(game.finishedGame)
    const newBest = game.finishedGame.status === 'won' && game.finishedGame.hints === 0
      && (stats.bestTimes[{ easy: 'beginner', medium: 'intermediate', hard: 'expert' }[difficulty]] === null
        || game.finishedGame.time < stats.bestTimes[{ easy: 'beginner', medium: 'intermediate', hard: 'expert' }[difficulty]])
    const result = { ...game.finishedGame, newBest }
    const timer = window.setTimeout(() => setModalResult(result), 800)
    return () => window.clearTimeout(timer)
  }, [difficulty, game.finishedGame, stats])

  useEffect(() => {
    const handleKey = (event) => {
      if (['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return
      if (event.key.toLowerCase() === 'r') restartGame()
      if (event.key.toLowerCase() === 'm') game.setMuted((value) => !value)
      if (event.key.toLowerCase() === 'f') game.setQuickFlag((value) => !value)
      if (event.key.toLowerCase() === 'h') {
        const found = game.requestHint()
        setHintMessage(found ? '' : 'No safe move found, you may need to guess')
        if (!found) window.setTimeout(() => setHintMessage(''), 2200)
      }
      if (event.key === '+' || event.key === '=') zoom.changeZoom(10)
      if (event.key === '-') zoom.changeZoom(-10)
      if (event.key === '0') zoom.resetZoom()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [game, restartGame, zoom])

  const handleHint = () => {
    const found = game.requestHint()
    setHintMessage(found ? '' : 'No safe move found, you may need to guess')
    if (!found) window.setTimeout(() => setHintMessage(''), 2200)
  }

  return (
    <main className="app" data-theme={theme} data-mode={mode}>
      <section className="game-shell">
        <div className="topline">
          <div><p className="eyebrow">Classic puzzle</p><h1>Minesweeper</h1></div>
          <div className="top-controls"><ThemeSwitcher value={theme} onChange={setTheme} /></div>
        </div>
        <StatsHeader stats={stats} difficulty={difficulty} onReset={() => {
          if (window.confirm('Reset all Minesweeper statistics?')) stats.resetStats()
        }} />
        <DifficultySelector
          value={difficulty}
          customSettings={game.customSettings}
          onChange={setDifficulty}
          onCustomChange={game.setCustomSettings}
        />
        <Header
          flags={game.flags}
          mines={game.mines}
          time={game.time}
          status={game.status}
          mode={mode}
          onToggleMode={() => setMode(mode === 'dark' ? 'light' : 'dark')}
          onRestart={restartGame}
          muted={game.muted}
          onToggleMute={game.setMuted}
          noGuess={game.noGuess}
          onToggleNoGuess={game.setNoGuess}
          noGuessWarning={game.noGuessWarning}
          generationMessage={game.isGenerating ? 'Generating...' : game.generationMessage}
          quickFlag={game.quickFlag}
          onToggleQuickFlag={game.setQuickFlag}
          hints={game.hints}
          onHint={handleHint}
          hintMessage={hintMessage}
          onLeaderboard={() => setLeaderboardOpen(true)}
        />
        <div className="board-scroll">
          <Board
            board={game.board}
            status={game.status}
            onReveal={game.reveal}
            onFlag={game.toggleFlag}
            quickFlag={game.quickFlag}
            onToggleQuickFlag={game.setQuickFlag}
            hintCell={game.hintCell}
            zoom={zoom.zoom}
            onZoom={zoom.changeZoom}
            onResetZoom={zoom.resetZoom}
          />
        </div>
        {game.finishedGame && !modalResult && (
          <button className="reopen-result" onClick={() => setModalResult(game.finishedGame)}>View result</button>
        )}
        <Footer />
      </section>
      {modalResult && (
        <GameOverModal
          result={modalResult}
          stats={stats}
          onClose={() => setModalResult(null)}
          onReplay={restartGame}
          onChangeDifficulty={() => setModalResult(null)}
          leaderboard={{ ...leaderboard, rank: leaderboardRank }}
          onSaveScore={(name) => {
            const key = { easy: 'beginner', medium: 'intermediate', hard: 'expert' }[difficulty]
            if (!key || modalResult.hints > 0 || modalResult.status !== 'won') return
            const scores = leaderboard.scores[key] || []
            const rank = scores.filter((score) => score.time <= modalResult.time).length + 1
            leaderboard.addScore(key, { name, time: modalResult.time, date: new Date().toISOString(), noGuess: game.noGuess })
            setLeaderboardRank(rank <= 10 ? rank : null)
          }}
        />
      )}
      {leaderboardOpen && <LeaderboardModal leaderboard={{ ...leaderboard, latestId: leaderboard.latestId }} difficulty={difficulty} onClose={() => setLeaderboardOpen(false)} onClear={() => { if (window.confirm('Clear leaderboard?')) leaderboard.clear() }} />}
    </main>
  )
}

export default App
