export const buildBoardMap = (board, maxSize = 20) => {
  const rowStep = Math.max(1, Math.ceil(board.length / maxSize))
  const columnStep = Math.max(1, Math.ceil((board[0]?.length || 0) / maxSize))
  return board.filter((_, row) => row % rowStep === 0).map((line) => line.filter((_, column) => column % columnStep === 0))
}

export const buildShareText = ({ difficulty, status, time, streak, hints }) => {
  const formatted = typeof time === 'number' ? `${Math.floor(time / 60)}:${String(time % 60).padStart(2, '0')}` : time
  return `Minesweeper (${difficulty}) ${status === 'won' ? 'WIN' : 'GAME OVER'} in ${formatted}, Streak ${streak}, Hints ${hints}`
}

export const runShareCheck = () => {
  const text = buildShareText({ difficulty: 'Expert', status: 'won', time: 62, streak: 3, hints: 0 })
  console.assert(text.split('').every((character) => character.charCodeAt(0) < 128), 'share text has no emojis')
}
