import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import useLocalStorage from './useLocalStorage'
import { checkWin, createBoard, floodReveal, getNeighbors, placeMines } from '../utils/board'
import { isSolvable } from '../utils/solver'
import { getHint } from '../utils/hint'
import { playBomb, playClick, playFlagPlace, playFlagRemove, playWin } from '../utils/sound'
import { CUSTOM_DIFFICULTY, getDifficultyConfig } from '../config/difficulties'

const initialCustom = CUSTOM_DIFFICULTY

const generateBoard = (settings, row, column, noGuess, isCurrent, timerRef, timers) => new Promise((resolve) => {
  let attempt = 0
  let generated
  const runChunk = () => {
    if (!isCurrent()) {
      resolve(null)
      return
    }
    for (let chunkAttempt = 0; chunkAttempt < 5 && attempt < 200; chunkAttempt += 1, attempt += 1) {
      generated = placeMines(createBoard(settings.rows, settings.columns), settings.mines, row, column)
      if (!noGuess || isSolvable(generated, row, column)) {
        resolve({ board: generated, solvable: true })
        return
      }
    }
    if (attempt < 200) {
      timerRef.current = window.setTimeout(() => {
        timers.delete(timerRef.current)
        runChunk()
      }, 0)
      timers.add(timerRef.current)
    }
    else resolve({ board: generated, solvable: false })
  }
  runChunk()
})

const getNewRevealOrder = (before, after, starts) => {
  const queue = starts.map(([row, column]) => [row, column])
  const visited = new Set()
  const cells = []
  while (queue.length) {
    const [row, column] = queue.shift()
    const key = `${row}-${column}`
    if (visited.has(key)) continue
    visited.add(key)
    const nextCell = after[row][column]
    if (!nextCell || nextCell.isMine || !nextCell.isRevealed) continue
    if (!before[row][column].isRevealed) cells.push([row, column])
    if (nextCell.adjacent === 0) {
      getNeighbors(row, column, after.length, after[0].length).forEach((neighbor) => queue.push(neighbor))
    }
  }
  return cells
}

export default function useMinesweeper(difficulty) {
  const [customSettings, setCustomSettings] = useState(initialCustom)
  const settings = difficulty === 'custom' ? customSettings : getDifficultyConfig(difficulty)
  const [board, setBoard] = useState(() => createBoard(settings.rows, settings.columns))
  const [status, setStatus] = useState('playing')
  const [time, setTime] = useState(0)
  const [flags, setFlags] = useState(0)
  const [hints, setHints] = useState(0)
  const [hintCell, setHintCell] = useState(null)
  const [quickFlag, setQuickFlag] = useLocalStorage('minesweeper-quick-flag', false)
  const [muted, setMuted] = useLocalStorage('minesweeper-muted', false)
  const [noGuess, setNoGuess] = useLocalStorage('minesweeper-no-guess', true)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationMessage, setGenerationMessage] = useState('')
  const [finishedGame, setFinishedGame] = useState(null)
  const generationRef = useRef(0)
  const generationTimerRef = useRef(null)
  const gameIdRef = useRef(0)
  const [gameId, setGameId] = useState(0)
  const restartCountRef = useRef(0)
  const timersRef = useRef(new Set())
  const hintTimer = useRef()
  const startedAtRef = useRef(null)
  const moveLogRef = useRef([])
  const noGuessAllowed = settings.noGuessAllowed !== false
  const effectiveNoGuess = noGuessAllowed && noGuess
  const noGuessWarning = difficulty === 'custom' && settings.mines > settings.rows * settings.columns - 9

  const sound = useCallback((effect) => {
    if (!muted) effect()
  }, [muted])

  const restart = useCallback(() => {
    const nextGameId = gameIdRef.current + 1
    restartCountRef.current += 1
    gameIdRef.current = nextGameId
    setGameId(nextGameId)
    generationRef.current += 1
    if (generationTimerRef.current) window.clearTimeout(generationTimerRef.current)
    generationTimerRef.current = null
    timersRef.current.forEach((timer) => window.clearTimeout(timer))
    timersRef.current.clear()
    window.clearTimeout(hintTimer.current)
    setBoard(createBoard(settings.rows, settings.columns))
    setStatus('playing')
    setTime(0)
    setFlags(0)
    setHints(0)
    setHintCell(null)
    setIsGenerating(false)
    setGenerationMessage('')
    setFinishedGame(null)
    startedAtRef.current = null
    moveLogRef.current = []
    if (import.meta.env.DEV && restartCountRef.current >= 10) {
      console.assert(nextGameId > 0 && settings.rows > 0 && settings.columns > 0, '10 fast restarts leave a clean board')
    }
    if (import.meta.env.DEV) console.assert(moveLogRef.current.length === 0, 'replay move log resets on new game')
  }, [settings.columns, settings.rows])

  useEffect(() => { restart() }, [difficulty, settings.columns, settings.mines, settings.rows, restart])
  useEffect(() => () => {
    if (generationTimerRef.current) window.clearTimeout(generationTimerRef.current)
    window.clearTimeout(hintTimer.current)
    timersRef.current.forEach((timer) => window.clearTimeout(timer))
    timersRef.current.clear()
  }, [])
  useEffect(() => {
    if (status !== 'playing' || time === 0) return undefined
    const timer = setInterval(() => {
      if (gameIdRef.current === gameId) setTime((current) => current + 1)
    }, 1000)
    return () => clearInterval(timer)
  }, [gameId, status, time])

  const recordMove = useCallback((type, cells) => {
    if (!cells.length) return
    if (startedAtRef.current === null) startedAtRef.current = Date.now()
    moveLogRef.current = [...moveLogRef.current, {
      type,
      cells,
      t: Date.now() - startedAtRef.current,
    }]
    if (import.meta.env.DEV && type === 'reveal') console.assert(moveLogRef.current[moveLogRef.current.length - 1].cells.length === cells.length, 'cascade is logged as one replay step')
  }, [])

  const finish = useCallback((nextBoard, nextStatus, hitMine = null, currentGameId = gameIdRef.current) => {
    if (gameIdRef.current !== currentGameId) return
    if (import.meta.env.DEV) console.assert(Array.isArray(moveLogRef.current), 'replay move log exists when game finishes')
    const finalBoard = hitMine
      ? nextBoard.map((line) => line.map((cell) => ({
        ...cell,
        isHit: cell.row === hitMine[0] && cell.column === hitMine[1],
      })))
      : nextBoard
    if (import.meta.env.DEV && nextStatus === 'lost') {
      console.assert(finalBoard.flat().filter((cell) => cell.isMine).length === settings.mines, 'all mines are visible on loss')
    }
    const result = {
      id: `${Date.now()}-${Math.random()}`,
      board: finalBoard,
      status: nextStatus,
      time,
      hints,
      mines: settings.mines,
      difficulty,
      difficultyLabel: settings.label,
      difficultyBadge: settings.badge,
      rows: finalBoard.length,
      columns: finalBoard[0]?.length || 0,
      minePositions: finalBoard.flat().filter((cell) => cell.isMine).map((cell) => [cell.row, cell.column]),
      hitMine,
      moveLog: moveLogRef.current,
      gameId: currentGameId,
    }
    setBoard(finalBoard)
    setStatus(nextStatus)
    setFinishedGame(result)
    sound(nextStatus === 'won' ? playWin : playBomb)
  }, [difficulty, hints, settings.badge, settings.label, settings.mines, sound, time])

  const revealBoard = useCallback((generatedBoard, row, column, currentGameId) => {
    if (!generatedBoard || gameIdRef.current !== currentGameId) return
    const before = generatedBoard
    let nextBoard = generatedBoard
    if (nextBoard[row][column].isMine) {
      recordMove('reveal', [[row, column]])
      finish(nextBoard, 'lost', [row, column], currentGameId)
      return
    }
    nextBoard = floodReveal(nextBoard, row, column)
    recordMove('reveal', getNewRevealOrder(before, nextBoard, [[row, column]]))
    if (checkWin(nextBoard)) {
      finish(nextBoard.map((line) => line.map((cell) => cell.isMine ? { ...cell, isFlagged: true } : cell)), 'won')
    } else {
      setBoard(nextBoard)
      setTime((current) => current || 1)
    }
  }, [finish, recordMove])

  const reveal = useCallback((row, column) => {
    if (isGenerating || status !== 'playing' || board[row][column].isFlagged) return
    if (startedAtRef.current === null) startedAtRef.current = Date.now()
    const hasMines = board.some((line) => line.some((cell) => cell.isMine))
    if (!hasMines) {
      const currentGameId = gameIdRef.current
      const generationId = generationRef.current + 1
      generationRef.current = generationId
      setIsGenerating(true)
      setGenerationMessage('')
      sound(playClick)
      generateBoard(settings, row, column, effectiveNoGuess && !noGuessWarning, () => gameIdRef.current === currentGameId && generationRef.current === generationId, generationTimerRef, timersRef.current).then((result) => {
        if (!result || gameIdRef.current !== currentGameId || generationRef.current !== generationId) {
          if (import.meta.env.DEV) console.assert(gameIdRef.current !== currentGameId || result, 'late generation results are ignored')
          return
        }
        setIsGenerating(false)
        setGenerationMessage(result.solvable ? '' : "Couldn't find a guess-free board, so this one may need a guess")
        revealBoard(result.board, row, column, currentGameId)
      })
      return
    }
    let nextBoard = board
    const cell = nextBoard[row][column]
    if (cell.isRevealed) {
      const neighbors = getNeighbors(row, column, nextBoard.length, nextBoard[0].length)
      const adjacentFlags = neighbors.filter(([r, c]) => nextBoard[r][c].isFlagged).length
      if (adjacentFlags !== cell.adjacent) return
      const hiddenNeighbors = neighbors.filter(([r, c]) => !nextBoard[r][c].isFlagged && !nextBoard[r][c].isRevealed)
      if (hiddenNeighbors.some(([r, c]) => nextBoard[r][c].isMine)) {
        recordMove('reveal', hiddenNeighbors)
        finish(nextBoard, 'lost', hiddenNeighbors.find(([r, c]) => nextBoard[r][c].isMine) || null)
        return
      }
      hiddenNeighbors.forEach(([r, c]) => { nextBoard = floodReveal(nextBoard, r, c) })
      recordMove('reveal', getNewRevealOrder(board, nextBoard, hiddenNeighbors))
      sound(playClick)
    } else if (cell.isMine) {
      recordMove('reveal', [[row, column]])
      finish(nextBoard, 'lost', [row, column])
      return
    } else {
      nextBoard = floodReveal(nextBoard, row, column)
      recordMove('reveal', getNewRevealOrder(board, nextBoard, [[row, column]]))
      sound(playClick)
    }
    if (checkWin(nextBoard)) finish(nextBoard.map((line) => line.map((item) => item.isMine ? { ...item, isFlagged: true } : item)), 'won')
    else {
      setBoard(nextBoard)
      setTime((current) => current || 1)
    }
  }, [board, effectiveNoGuess, finish, isGenerating, noGuessWarning, recordMove, revealBoard, settings, sound, status])

  const toggleFlag = useCallback((row, column) => {
    if (status !== 'playing' || isGenerating || board[row][column].isRevealed) return
    const wasFlagged = board[row][column].isFlagged
    setBoard(board.map((line, rowIndex) => line.map((cell, columnIndex) => (
      rowIndex === row && columnIndex === column ? { ...cell, isFlagged: !wasFlagged } : cell
    ))))
    setFlags((current) => current + (wasFlagged ? -1 : 1))
    recordMove(wasFlagged ? 'unflag' : 'flag', [[row, column]])
    sound(wasFlagged ? playFlagRemove : playFlagPlace)
  }, [board, isGenerating, recordMove, sound, status])

  const requestHint = useCallback(() => {
    if (status !== 'playing' || isGenerating) return false
    const move = getHint(board)
    if (!move) return false
    setHintCell(move)
    setHints((current) => current + 1)
    setTime((current) => current + 10)
    window.clearTimeout(hintTimer.current)
    const currentGameId = gameIdRef.current
    hintTimer.current = window.setTimeout(() => {
      timersRef.current.delete(hintTimer.current)
      if (gameIdRef.current === currentGameId) setHintCell(null)
    }, 2000)
    timersRef.current.add(hintTimer.current)
    return true
  }, [board, isGenerating, status])

  return useMemo(() => ({
    board, status, time, flags, hints, hintCell, quickFlag, setQuickFlag,
    mines: settings.mines, customSettings, setCustomSettings, restart, reveal,
    toggleFlag, requestHint, muted, setMuted, noGuess: effectiveNoGuess, setNoGuess,
    noGuessWarning, noGuessAllowed, isGenerating, generationMessage, finishedGame, gameId,
  }), [board, customSettings, finishedGame, flags, generationMessage, hintCell,
    hints, isGenerating, muted, noGuessWarning, quickFlag, requestHint,
    restart, reveal, setMuted, setNoGuess, setQuickFlag, settings.mines, status, time, gameId,
    noGuessAllowed, effectiveNoGuess,
    toggleFlag])
}
