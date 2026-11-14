import { memo, useRef } from 'react'

function Cell({ cell, status, onReveal, onFlag }) {
  const timer = useRef()
  const longPressed = useRef(false)
  const className = [
    'cell',
    (cell.row + cell.column) % 2 === 0 ? 'tile-a' : 'tile-b',
    cell.isRevealed ? 'revealed' : '',
    cell.isFlagged ? 'flagged' : '',
    cell.isMine && status === 'lost' ? 'mine' : '',
    cell.isFlagged && status === 'lost' && !cell.isMine ? 'wrong' : '',
    cell.isRevealed && cell.adjacent ? `number-${cell.adjacent}` : '',
  ].filter(Boolean).join(' ')

  const handleTouchStart = () => {
    longPressed.current = false
    timer.current = setTimeout(() => {
      longPressed.current = true
      onFlag(cell.row, cell.column)
    }, 450)
  }
  const clearTimer = () => clearTimeout(timer.current)

  return (
    <button
      className={className}
      onClick={() => !longPressed.current && onReveal(cell.row, cell.column)}
      onContextMenu={(event) => { event.preventDefault(); onFlag(cell.row, cell.column) }}
      onTouchStart={handleTouchStart}
      onTouchEnd={clearTimer}
      onTouchMove={clearTimer}
      aria-label={cell.isFlagged ? 'Flagged cell' : cell.isRevealed ? `Revealed cell ${cell.adjacent}` : 'Hidden cell'}
    >
      {cell.isFlagged && status !== 'lost' ? '🚩' : cell.isMine && status === 'lost' ? '💣' : cell.isRevealed && cell.adjacent ? cell.adjacent : ''}
    </button>
  )
}

export default memo(Cell)
