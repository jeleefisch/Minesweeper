import { memo, useRef } from 'react'
import { getRevealOrigin, setRevealOrigin } from '../utils/animation'
import { Flag, Mine } from './icons/Icons'

function Cell({ cell, status, onReveal, onFlag, quickFlag = false, hintCell, revealDepth = 0, mineIndex = 0, animationsEnabled = true }) {
  const timer = useRef()
  const longPressed = useRef(false)
  const origin = getRevealOrigin()
  const clickedMine = cell.isMine && status === 'lost' && origin
    && origin.row === cell.row && origin.column === cell.column
  const className = [
    'cell',
    (cell.row + cell.column) % 2 === 0 ? 'tile-a' : 'tile-b',
    cell.isRevealed ? 'revealed' : '',
    cell.isFlagged ? 'flagged' : '',
    cell.isMine && status === 'lost' ? 'mine' : '',
    cell.isFlagged && status === 'lost' && !cell.isMine ? 'wrong' : '',
    cell.isRevealed && cell.adjacent ? `number-${cell.adjacent}` : '',
    clickedMine ? 'clicked-mine' : '',
    cell.isMine && status === 'lost' ? 'mine-stagger' : '',
    status === 'won' ? 'win-wave' : '',
    hintCell?.row === cell.row && hintCell?.column === cell.column ? 'hint' : '',
    quickFlag && !cell.isRevealed ? 'quick-flag' : '',
    !animationsEnabled ? 'animation-disabled' : '',
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
      style={{ '--depth': revealDepth, '--mine-index': mineIndex }}
      onPointerDown={() => setRevealOrigin(cell.row, cell.column)}
      onClick={() => !longPressed.current && (quickFlag ? onFlag(cell.row, cell.column) : onReveal(cell.row, cell.column))}
      onContextMenu={(event) => { event.preventDefault(); onFlag(cell.row, cell.column) }}
      onTouchStart={handleTouchStart}
      onTouchEnd={clearTimer}
      onTouchMove={clearTimer}
      aria-label={cell.isFlagged ? 'Flagged cell' : cell.isRevealed ? `Revealed cell ${cell.adjacent}` : 'Hidden cell'}
    >
      {cell.isFlagged && status !== 'lost' ? <span className="cell-content flag-content"><Flag label="Flag" /></span>
        : cell.isMine && status === 'lost' ? <span className="cell-content mine-content"><Mine label="Mine" /></span>
          : cell.isRevealed && cell.adjacent ? <span className="cell-content number-content">{cell.adjacent}</span> : ''}
    </button>
  )
}

export default memo(Cell)
