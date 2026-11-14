import { getNeighbors } from './board'
import { findSafeMove } from './solver'

export const getHint = (board) => {
  const move = findSafeMove(board)
  if (move) return move

  for (let row = 0; row < board.length; row += 1) {
    for (let column = 0; column < board[row].length; column += 1) {
      const cell = board[row][column]
      if (!cell.isRevealed || !cell.adjacent) continue
      const neighbors = getNeighbors(row, column, board.length, board[0].length)
      const flagged = neighbors.filter(([r, c]) => board[r][c].isFlagged).length
      if (flagged === cell.adjacent) {
        const safe = neighbors.find(([r, c]) => !board[r][c].isRevealed && !board[r][c].isFlagged)
        if (safe) return { row: safe[0], column: safe[1] }
      }
    }
  }
  return null
}
