import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import useLocalStorage from './useLocalStorage'
import { checkWin, createBoard, floodReveal, getNeighbors, placeMines } from '../utils/board'
import { isSolvable } from '../utils/solver'
import { getHint } from '../utils/hint'
import { playBomb, playClick, playFlagPlace, playFlagRemove, playWin } from '../utils/sound'

const PRESETS = {
  easy: { rows: 9, columns: 9, mines: 10, label: 'Beginner' },
  medium: { rows: 16, columns: 16, mines: 40, label: 'Intermediate' },
  hard: { rows: 16, columns: 30, mines: 99, label: 'Expert' },
}
const initialCustom = { rows: 12, columns: 12, mines: 25, label: 'Custom' }

const generateBoard = (settings, row, column, noGuess) => new Promise((resolve) => {
  let attempt = 0
  let generated
  const runChunk = () => {
    for (let chunkAttempt = 0; chunkAttempt < 5 && attempt < 200; chunkAttempt += 1, attempt += 1) {
      generated = placeMines(createBoard(settings.rows, settings.columns), settings.mines, row, column)
      if (!noGuess || isSolvable(generated, row, column)) {
        resolve({ board: generated, solvable: true })
        return
      }
    }
    if (attempt < 200) window.setTimeout(runChunk, 0)
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
  const settings = difficulty === 'custom' ? customSettings : PRESETS[difficulty]
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
  const hintTimer = useRef()
  const startedAtRef = useRef(null)
  const moveLogRef = useRef([])
  const noGuessWarning = difficulty === 'custom' && settings.mines > settings.rows * settings.columns - 9

  const sound = useCallback((effect) => {
    if (!muted) effect()
  }, [muted])

  const restart = useCallback(() => {
    generationRef.current += 1
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
    if (import.meta.env.DEV) console.assert(moveLogRef.current.length === 0, 'replay move log resets on new game')
  }, [settings.columns, settings.rows])

  useEffect(() => { restart() }, [difficulty, settings.columns, settings.mines, settings.rows, restart])
  useEffect(() => {
    if (status !== 'playing' || time === 0) return undefined
    const timer = setInterval(() => setTime((current) => current + 1), 1000)
    return () => clearInterval(timer)
  }, [status, time])

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

  const finish = useCallback((nextBoard, nextStatus) => {
    if (import.meta.env.DEV) console.assert(Array.isArray(moveLogRef.current), 'replay move log exists when game finishes')
    const result = {
      id: `${Date.now()}-${Math.random()}`,
      board: nextBoard,
      status: nextStatus,
      time,
      hints,
      mines: settings.mines,
      difficulty,
      difficultyLabel: settings.label,
      rows: nextBoard.length,
      columns: nextBoard[0]?.length || 0,
      minePositions: nextBoard.flat().filter((cell) => cell.isMine).map((cell) => [cell.row, cell.column]),
      moveLog: moveLogRef.current,
    }
    setBoard(nextBoard)
    setStatus(nextStatus)
    setFinishedGame(result)
    sound(nextStatus === 'won' ? playWin : playBomb)
  }, [difficulty, hints, settings.label, settings.mines, sound, time])

  const revealBoard = useCallback((generatedBoard, row, column) => {
    const before = generatedBoard
    let nextBoard = generatedBoard
    if (nextBoard[row][column].isMine) {
      recordMove('reveal', [[row, column]])
      finish(nextBoard.map((line) => line.map((cell) => ({
        ...cell, isRevealed: cell.isMine || (cell.isFlagged && !cell.isMine),
      }))), 'lost')
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
      const generationId = generationRef.current + 1
      generationRef.current = generationId
      setIsGenerating(true)
      setGenerationMessage('')
      sound(playClick)
      generateBoard(settings, row, column, noGuess && !noGuessWarning).then((result) => {
        if (generationRef.current !== generationId) return
        setIsGenerating(false)
        setGenerationMessage(result.solvable ? '' : "Couldn't find a guess-free board, so this one may need a guess")
        revealBoard(result.board, row, column)
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
        finish(nextBoard.map((line) => line.map((item) => ({
          ...item, isRevealed: item.isMine || (item.isFlagged && !item.isMine),
        }))), 'lost')
        return
      }
      hiddenNeighbors.forEach(([r, c]) => { nextBoard = floodReveal(nextBoard, r, c) })
      recordMove('reveal', getNewRevealOrder(board, nextBoard, hiddenNeighbors))
      sound(playClick)
    } else if (cell.isMine) {
      recordMove('reveal', [[row, column]])
      finish(nextBoard.map((line) => line.map((item) => ({
        ...item, isRevealed: item.isMine || (item.isFlagged && !item.isMine),
      }))), 'lost')
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
  }, [board, finish, isGenerating, noGuess, noGuessWarning, recordMove, revealBoard, settings, sound, status])

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
    hintTimer.current = window.setTimeout(() => setHintCell(null), 2000)
    return true
  }, [board, isGenerating, status])

  return useMemo(() => ({
    board, status, time, flags, hints, hintCell, quickFlag, setQuickFlag,
    mines: settings.mines, customSettings, setCustomSettings, restart, reveal,
    toggleFlag, requestHint, muted, setMuted, noGuess, setNoGuess,
    noGuessWarning, isGenerating, generationMessage, finishedGame,
  }), [board, customSettings, finishedGame, flags, generationMessage, hintCell,
    hints, isGenerating, muted, noGuess, noGuessWarning, quickFlag, requestHint,
    restart, reveal, setMuted, setNoGuess, setQuickFlag, settings.mines, status, time,
    toggleFlag])
}
