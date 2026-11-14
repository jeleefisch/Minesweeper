export const getNeighbors = (row, column, rows, columns) => {
  const neighbors = []
  for (let rowOffset = -1; rowOffset <= 1; rowOffset += 1) {
    for (let columnOffset = -1; columnOffset <= 1; columnOffset += 1) {
      if (rowOffset === 0 && columnOffset === 0) continue
      const nextRow = row + rowOffset
      const nextColumn = column + columnOffset
      if (nextRow >= 0 && nextRow < rows && nextColumn >= 0 && nextColumn < columns) {
        neighbors.push([nextRow, nextColumn])
      }
    }
  }
  return neighbors
}

export const createBoard = (rows, columns) => Array.from(
  { length: rows },
  (_, row) => Array.from({ length: columns }, (_, column) => ({
    row, column, isMine: false, adjacent: 0, isRevealed: false, isFlagged: false,
  })),
)

export const placeMines = (board, mineCount, safeRow, safeColumn, protectSafeZone = true) => {
  const rows = board.length
  const columns = board[0].length
  const safeZone = getNeighbors(safeRow, safeColumn, rows, columns)
    .concat([[safeRow, safeColumn]])
  const safeKeys = new Set(safeZone.map(([row, column]) => `${row}-${column}`))
  const available = []
  const shouldProtectZone = protectSafeZone && board.length * columns - safeZone.length >= mineCount
  board.forEach((line, row) => line.forEach((_, column) => {
    // Dense boards cannot fit the full 3x3 safe zone, so fall back to protecting only the clicked cell.
    const key = `${row}-${column}`
    if (shouldProtectZone ? !safeKeys.has(key) : (row !== safeRow || column !== safeColumn)) {
      available.push([row, column])
    }
  }))
  const nextBoard = board.map((line) => line.map((cell) => ({ ...cell })))
  for (let index = available.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    ;[available[index], available[swapIndex]] = [available[swapIndex], available[index]]
  }
  available.slice(0, Math.min(mineCount, available.length)).forEach(([row, column]) => {
    nextBoard[row][column].isMine = true
  })
  return nextBoard.map((line, row) => line.map((cell, column) => ({
    ...cell,
    adjacent: cell.isMine ? 0 : getNeighbors(row, column, rows, columns)
      .filter(([neighborRow, neighborColumn]) => nextBoard[neighborRow][neighborColumn].isMine).length,
  })))
}

export const countAdjacent = (board, row, column) => getNeighbors(
  row, column, board.length, board[0].length,
).filter(([neighborRow, neighborColumn]) => board[neighborRow][neighborColumn].isMine).length

export const floodReveal = (board, startRow, startColumn) => {
  const nextBoard = board.map((line) => line.map((cell) => ({ ...cell })))
  const queue = [[startRow, startColumn]]
  const visited = new Set()
  while (queue.length) {
    const [row, column] = queue.shift()
    const key = `${row}-${column}`
    if (visited.has(key) || nextBoard[row][column].isFlagged || nextBoard[row][column].isMine) continue
    visited.add(key)
    nextBoard[row][column].isRevealed = true
    if (nextBoard[row][column].adjacent === 0 && !nextBoard[row][column].isMine) {
      getNeighbors(row, column, nextBoard.length, nextBoard[0].length).forEach(([nextRow, nextColumn]) => {
        if (!nextBoard[nextRow][nextColumn].isRevealed) queue.push([nextRow, nextColumn])
      })
    }
  }
  return nextBoard
}

export const checkWin = (board) => board.every((line) => line.every((cell) => cell.isMine || cell.isRevealed))
