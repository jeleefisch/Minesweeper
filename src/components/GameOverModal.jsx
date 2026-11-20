import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Copy, Close, Pause, Play, Rewind, Share } from './icons/Icons'
import { formatTime } from '../hooks/useStats'
import { buildBoardMap, buildShareText } from '../utils/share'
import { countAdjacent, createBoard } from '../utils/board'
import { preventContextMenu } from '../utils/dom'

const buildReplayBoard = (result, stepIndex, partialCount) => {
  if (stepIndex >= result.moveLog.length) return result.board
  const board = createBoard(result.rows, result.columns).map((line) => line.map((cell) => ({
    ...cell,
    isMine: result.minePositions.some(([row, column]) => row === cell.row && column === cell.column),
  })))
  const withCounts = board.map((line, row) => line.map((cell, column) => ({
    ...cell,
    adjacent: cell.isMine ? 0 : countAdjacent(board, row, column),
  })))
  result.moveLog.slice(0, stepIndex + 1).forEach((step, index) => {
    const cells = step.type === 'reveal' && index === stepIndex
      ? step.cells.slice(0, partialCount)
      : step.cells
    cells.forEach(([row, column]) => {
      const cell = withCounts[row][column]
      if (step.type === 'reveal') cell.isRevealed = true
      if (step.type === 'flag') cell.isFlagged = true
      if (step.type === 'unflag') cell.isFlagged = false
    })
  })
  return withCounts
}

export default function GameOverModal({ result, stats, onClose, onReplay, onChangeDifficulty, leaderboard, onSaveScore }) {
  const dialogRef = useRef(null)
  const frameRef = useRef(null)
  const stepRef = useRef(Array.isArray(result.moveLog) ? result.moveLog.length : 0)
  const [copied, setCopied] = useState(false)
  const [replaying, setReplaying] = useState(false)
  const [replayStep, setReplayStepState] = useState(() => Array.isArray(result.moveLog) ? result.moveLog.length : 0)
  const [replayPartial, setReplayPartial] = useState(0)
  const [speed, setSpeed] = useState(1)
  const [name, setName] = useState(leaderboard.lastName)
  const steps = useMemo(() => (Array.isArray(result.moveLog) ? result.moveLog : []), [result.moveLog])
  const animationsAllowed = useMemo(() => {
    try {
      return !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    } catch {
      return true
    }
  }, [])
  const setReplayStep = useCallback((value) => {
    const next = typeof value === 'function' ? value(stepRef.current) : value
    stepRef.current = Math.max(0, Math.min(steps.length, next))
    setReplayStepState(stepRef.current)
    setReplayPartial(0)
  }, [steps.length])
  const replayBoard = buildReplayBoard(result, replayStep, replayPartial)
  const map = buildBoardMap(replayBoard)
  const summary = buildShareText({ ...result, streak: stats.currentStreak })

  useEffect(() => {
    if (!replaying || !steps.length) return undefined
    if (!animationsAllowed) {
      const timer = window.setTimeout(() => {
        setReplayStep(steps.length)
        setReplaying(false)
      }, 0)
      return () => window.clearTimeout(timer)
    }
    let last = performance.now()
    let elapsed = 0
    const tick = (now) => {
      const index = stepRef.current
      if (index >= steps.length) {
        setReplaying(false)
        return
      }
      const step = steps[index]
      const duration = step.type === 'reveal'
        ? Math.min(300, Math.max(40, step.cells.length * 22)) / speed
        : Math.min(450, Math.max(70, (step.t || 0) / 4)) / speed
      elapsed += now - last
      last = now
      if (step.type === 'reveal') {
        setReplayPartial(Math.min(step.cells.length, Math.max(1, Math.ceil((elapsed / duration) * step.cells.length))))
      }
      if (elapsed >= duration) {
        stepRef.current += 1
        setReplayStepState(stepRef.current)
        setReplayPartial(0)
        elapsed = 0
      }
      frameRef.current = requestAnimationFrame(tick)
    }
    frameRef.current = requestAnimationFrame(tick)
    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
    }
  }, [animationsAllowed, replaying, setReplayStep, speed, steps])

  useEffect(() => {
    dialogRef.current?.focus()
    const esc = (event) => { if (event.key === 'Escape') onClose() }
    document.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('keydown', esc)
      if (frameRef.current) cancelAnimationFrame(frameRef.current)
      frameRef.current = null
      if (import.meta.env.DEV) console.assert(frameRef.current === null, 'replay timer is cleaned up on close')
    }
  }, [onClose])

  if (!result) return null
  const revealedCount = result.board.flat().filter((cell) => cell.isRevealed).length
  const totalSafe = result.board.flat().filter((cell) => !cell.isMine).length
  const copy = async () => {
    await navigator.clipboard.writeText(summary)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1200)
  }
  const saveImage = () => {
    const canvas = document.createElement('canvas')
    const size = 16
    canvas.width = map[0].length * size
    canvas.height = map.length * size
    const context = canvas.getContext('2d')
    map.forEach((line, row) => line.forEach((cell, column) => {
      context.fillStyle = cell.isMine ? '#e57373' : cell.isRevealed ? '#e5c29f' : '#aad751'
      context.fillRect(column * size, row * size, size, size)
    }))
    const link = document.createElement('a')
    link.download = 'minesweeper-board.png'
    link.href = canvas.toDataURL('image/png')
    link.click()
  }
  const toggleReplay = () => {
    if (!steps.length) return
    if (replayStep >= steps.length) setReplayStep(0)
    setReplaying((value) => !value)
  }
  return <div className="modal-backdrop" onContextMenu={preventContextMenu} onClick={(event) => { if (event.target === event.currentTarget) onClose() }}><section className="game-modal" onContextMenu={preventContextMenu} role="dialog" aria-modal="true" tabIndex="-1" ref={dialogRef}>
    <button className="modal-close" onClick={onClose} title="Close" aria-label="Close"><Close /></button>
    <h2>{result.status === 'won' ? 'WIN' : 'GAME OVER'}</h2>
    <p className="modal-time">{formatTime(result.time)} · {result.difficultyLabel}{result.difficultyBadge && <small className="difficulty-badge"> {result.difficultyBadge}</small>}</p>
    <div className="result-grid"><span>Correct flags <strong>{result.board.flat().filter((cell) => cell.isMine && cell.isFlagged).length}/{result.mines}</strong></span><span>Cells revealed <strong>{totalSafe ? Math.round((revealedCount / totalSafe) * 100) : 100}%</strong></span><span>Hints used <strong>{result.hints}</strong></span><span>Streak <strong>{stats.currentStreak}</strong></span></div>
    {result.newBest && <p className="new-best">New best time!</p>}{result.hints > 0 && <p className="modal-note">Hints count toward wins and streaks, but not best time.</p>}
    {result.status === 'won' && <div className="leaderboard-entry"><label>Player name <input maxLength="16" autoComplete="off" autoCapitalize="words" enterKeyHint="done" value={name} onChange={(event) => setName(event.target.value)} /></label><button onClick={() => onSaveScore(name)}>Save score</button>{leaderboard.rank && <strong>New leaderboard entry: #{leaderboard.rank}</strong>}</div>}
    <svg className="board-map" viewBox={`0 0 ${map[0].length} ${map.length}`} shapeRendering="crispEdges">{map.map((line, row) => line.map((cell, column) => {
      const state = cell.isRevealed ? 'map-revealed' : cell.isHit ? 'map-hit-mine' : cell.isMine && !cell.isFlagged ? 'map-mine' : cell.isFlagged && !cell.isMine ? 'map-wrong' : cell.isFlagged ? 'map-flag' : 'map-hidden'
      return <g key={`${row}-${column}`}><rect x={column} y={row} width="1" height="1" className={state} />{cell.isFlagged && !cell.isMine && <path className="map-wrong-mark" d={`M${column + .2} ${row + .2}L${column + .8} ${row + .8}M${column + .8} ${row + .2}L${column + .2} ${row + .8}`} />}{cell.isFlagged && cell.isMine && <path className="map-flag-mark" d={`M${column + .35} ${row + .8}V${row + .2}h.45l.25.2-.25.2h-.45`} />}</g>
    }))}</svg>
    {steps.length > 0 && <div className="replay-controls">
      <div className="modal-actions"><button onClick={toggleReplay} title="Play or pause replay" aria-label="Play or pause replay">{replaying ? <Pause /> : <Play />}</button><button onClick={() => { setReplayStep(0); setReplaying(false) }} title="Rewind replay" aria-label="Rewind replay"><Rewind /></button><button onClick={() => setSpeed((value) => value === 4 ? 1 : value * 2)} title="Replay speed">Speed {speed}x</button></div>
      <input type="range" min="0" max={steps.length} value={replayStep} onChange={(event) => { setReplaying(false); setReplayStep(Number(event.target.value)) }} aria-label="Replay progress" />
    </div>}
    <div className="modal-actions"><button onClick={copy} title="Copy summary" aria-label="Copy summary"><Copy />{copied ? 'Copied' : ''}</button>{navigator.share && <button onClick={async () => navigator.share({ title: 'Minesweeper result', text: summary })} title="Share" aria-label="Share"><Share /></button>}<button onClick={saveImage}>Save image</button><button onClick={onClose}>View board</button><button onClick={onReplay}>Play Again</button><button onClick={onChangeDifficulty}>Change Difficulty</button></div>
  </section></div>
}
