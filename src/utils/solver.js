import { floodReveal, getNeighbors } from './board.js'

const keyFor = (row, column) => `${row}-${column}`

export const findSafeMove = (board) => {
  for (let row = 0; row < board.length; row += 1) {
    for (let column = 0; column < board[row].length; column += 1) {
      const cell = board[row][column]
      if (!cell.isRevealed || !cell.adjacent) continue
      const neighbors = getNeighbors(row, column, board.length, board[0].length)
      const flagged = neighbors.filter(([r, c]) => board[r][c].isFlagged).length
      if (flagged !== cell.adjacent) continue
      const safe = neighbors.find(([r, c]) => !board[r][c].isRevealed && !board[r][c].isFlagged)
      if (safe) return { row: safe[0], column: safe[1] }
    }
  }
  return null
}

export const isSolvable = (board, startRow, startColumn) => {
  let simulation = floodReveal(board, startRow, startColumn)
  const knownMines = new Set()
  let progress = true

  while (progress) {
    progress = false
    const safeCells = new Set()
    const mineCells = new Set()
    const constraints = []

    simulation.forEach((line, row) => line.forEach((cell, column) => {
      if (!cell.isRevealed || !cell.adjacent) return
      const neighbors = getNeighbors(row, column, simulation.length, simulation[0].length)
      const unknown = neighbors.filter(([neighborRow, neighborColumn]) => {
        const key = keyFor(neighborRow, neighborColumn)
        return !simulation[neighborRow][neighborColumn].isRevealed && !knownMines.has(key)
      })
      const knownCount = neighbors.filter(([neighborRow, neighborColumn]) => (
        knownMines.has(keyFor(neighborRow, neighborColumn))
      )).length
      if (unknown.length) constraints.push({ unknown, remaining: cell.adjacent - knownCount })

      // Rule 1: a satisfied number makes every other neighbor safe.
      if (cell.adjacent === knownCount) unknown.forEach(([r, c]) => safeCells.add(keyFor(r, c)))
      // Rule 2: all unknown neighbors are mines when they fill the remaining count.
      if (cell.adjacent - knownCount === unknown.length) unknown.forEach(([r, c]) => mineCells.add(keyFor(r, c)))
    }))

    // Rule 3: subtract a smaller unknown-neighbor set from a larger subset constraint.
    constraints.forEach((first) => constraints.forEach((second) => {
      const firstKeys = new Set(first.unknown.map(([r, c]) => keyFor(r, c)))
      const secondKeys = new Set(second.unknown.map(([r, c]) => keyFor(r, c)))
      const isSubset = [...firstKeys].every((key) => secondKeys.has(key)) && firstKeys.size < secondKeys.size
      if (!isSubset) return
      const difference = second.unknown.filter(([r, c]) => !firstKeys.has(keyFor(r, c)))
      const remaining = second.remaining - first.remaining
      if (remaining === 0) difference.forEach(([r, c]) => safeCells.add(keyFor(r, c)))
      if (remaining === difference.length) difference.forEach(([r, c]) => mineCells.add(keyFor(r, c)))
    }))

    for (const key of mineCells) {
      const [row, column] = key.split('-').map(Number)
      if (!board[row][column].isMine) return false
    }
    const newMineCells = [...mineCells].filter((key) => !knownMines.has(key))
    newMineCells.forEach((key) => knownMines.add(key))
    if (newMineCells.length) progress = true

    for (const key of safeCells) {
      const [row, column] = key.split('-').map(Number)
      if (board[row][column].isMine) return false
      simulation = floodReveal(simulation, row, column)
      progress = true
    }

    const solved = simulation.every((line) => line.every((cell) => cell.isMine || cell.isRevealed))
    if (solved) return true
    if (!progress) return false
  }

  return simulation.every((line) => line.every((cell) => cell.isMine || cell.isRevealed))
}
