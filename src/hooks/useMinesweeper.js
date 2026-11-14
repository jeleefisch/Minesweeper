import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import useLocalStorage from './useLocalStorage'
import { checkWin, createBoard, floodReveal, getNeighbors, placeMines } from '../utils/board'
import { isSolvable } from '../utils/solver'
import { playBomb, playClick, playFlagPlace, playFlagRemove, playWin } from '../utils/sound'

const PRESETS = {
  easy: { rows: 9, columns: 9, mines: 10 },
  medium: { rows: 16, columns: 16, mines: 40 },
  hard: { rows: 16, columns: 30, mines: 99 },
}

const initialCustom = { rows: 12, columns: 12, mines: 25 }
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

export default function useMinesweeper(difficulty) {
  const [customSettings, setCustomSettings] = useState(initialCustom)
  const settings = difficulty === 'custom' ? customSettings : PRESETS[difficulty]
  const [board, setBoard] = useState(() => createBoard(settings.rows, settings.columns))
  const [status, setStatus] = useState('playing')
  const [time, setTime] = useState(0)
  const [flags, setFlags] = useState(0)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationMessage, setGenerationMessage] = useState('')
  const [bestTimes, setBestTimes] = useLocalStorage('minesweeper-best-times', {})
  const [muted, setMuted] = useLocalStorage('minesweeper-muted', false)
  const [noGuess, setNoGuess] = useLocalStorage('minesweeper-no-guess', true)
  const generationRef = useRef(0)
  const bestKey = `${difficulty}-${settings.rows}x${settings.columns}-${settings.mines}`
  const noGuessWarning = difficulty === 'custom' && settings.mines > settings.rows * settings.columns - 9

  const sound = useCallback((effect) => {
    if (!muted) effect()
  }, [muted])

  const restart = useCallback(() => {
    generationRef.current += 1
    setBoard(createBoard(settings.rows, settings.columns))
    setStatus('playing')
    setTime(0)
    setFlags(0)
    setIsGenerating(false)
    setGenerationMessage('')
  }, [settings.columns, settings.rows])

  useEffect(() => { restart() }, [difficulty, settings.columns, settings.mines, settings.rows, restart])
  useEffect(() => {
    if (status !== 'playing' || time === 0) return undefined
    const timer = setInterval(() => setTime((current) => current + 1), 1000)
    return () => clearInterval(timer)
  }, [status, time])

  const finish = useCallback((nextBoard, nextStatus) => {
    setBoard(nextBoard)
    setStatus(nextStatus)
    if (nextStatus === 'won') {
      sound(playWin)
      if (!bestTimes[bestKey] || time < bestTimes[bestKey]) {
        setBestTimes((current) => ({ ...current, [bestKey]: time }))
      }
    } else sound(playBomb)
  }, [bestKey, bestTimes, setBestTimes, sound, time])

  const revealBoard = useCallback((generatedBoard, row, column, playRevealSound = true) => {
    let nextBoard = generatedBoard
    const cell = nextBoard[row][column]
    if (cell.isMine) {
      nextBoard = nextBoard.map((line) => line.map((item) => ({
        ...item, isRevealed: item.isMine || (item.isFlagged && !item.isMine),
      })))
      finish(nextBoard, 'lost')
      return
    }
    nextBoard = floodReveal(nextBoard, row, column)
    if (playRevealSound) sound(playClick)
    if (checkWin(nextBoard)) {
      nextBoard = nextBoard.map((line) => line.map((item) => item.isMine ? { ...item, isFlagged: true } : item))
      finish(nextBoard, 'won')
    } else {
      setBoard(nextBoard)
      setTime((current) => current || 1)
    }
  }, [finish, sound])

  const reveal = useCallback((row, column) => {
    if (isGenerating || status === 'lost' || status === 'won' || board[row][column].isFlagged) return
    const hasMines = board.some((line) => line.some((cell) => cell.isMine))
    if (!hasMines) {
      const generationId = generationRef.current + 1
      generationRef.current = generationId
      setIsGenerating(true)
      setGenerationMessage('')
      const startedAt = performance.now()
      const messageTimer = window.setTimeout(() => {
        if (performance.now() - startedAt >= 200) setGenerationMessage('Generating...')
      }, 200)
      sound(playClick)
      generateBoard(settings, row, column, noGuess && !noGuessWarning).then((result) => {
        if (generationRef.current !== generationId) return
        window.clearTimeout(messageTimer)
        setIsGenerating(false)
        setGenerationMessage(result.solvable ? '' : "Couldn't find a guess-free board, so this one may need a guess")
        revealBoard(result.board, row, column, false)
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
        nextBoard = nextBoard.map((line) => line.map((item) => ({
          ...item, isRevealed: item.isMine || (item.isFlagged && !item.isMine),
        })))
        finish(nextBoard, 'lost')
        return
      }
      hiddenNeighbors.forEach(([r, c]) => { nextBoard = floodReveal(nextBoard, r, c) })
      sound(playClick)
    } else if (cell.isMine) {
      nextBoard = nextBoard.map((line) => line.map((item) => ({
        ...item, isRevealed: item.isMine || (item.isFlagged && !item.isMine),
      })))
      finish(nextBoard, 'lost')
      return
    } else {
      nextBoard = floodReveal(nextBoard, row, column)
      sound(playClick)
    }
    if (checkWin(nextBoard)) {
      nextBoard = nextBoard.map((line) => line.map((item) => item.isMine ? { ...item, isFlagged: true } : item))
      finish(nextBoard, 'won')
    } else {
      setBoard(nextBoard)
      setTime((current) => current || 1)
    }
  }, [board, finish, isGenerating, noGuess, noGuessWarning, revealBoard, settings, sound, status])

  const toggleFlag = useCallback((row, column) => {
    if (status !== 'playing' || isGenerating || board[row][column].isRevealed) return
    const wasFlagged = board[row][column].isFlagged
    setBoard(board.map((line, rowIndex) => line.map((cell, columnIndex) => (
      rowIndex === row && columnIndex === column ? { ...cell, isFlagged: !wasFlagged } : cell
    ))))
    setFlags((current) => current + (wasFlagged ? -1 : 1))
    sound(wasFlagged ? playFlagRemove : playFlagPlace)
  }, [board, isGenerating, sound, status])

  return useMemo(() => ({
    board, status, time, flags, mines: settings.mines, bestTime: bestTimes[bestKey],
    customSettings, setCustomSettings, restart, reveal, toggleFlag,
    muted, setMuted, noGuess, setNoGuess, noGuessWarning, isGenerating, generationMessage,
  }), [bestKey, bestTimes, board, customSettings, flags, generationMessage, isGenerating, muted, noGuess,
    noGuessWarning, restart, reveal, setMuted, setNoGuess, settings.mines, status, time, toggleFlag])
}
