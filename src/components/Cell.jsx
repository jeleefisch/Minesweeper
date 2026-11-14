import { memo, useRef, useState } from 'react'
import { getRevealOrigin, setRevealOrigin } from '../utils/animation'
import useLongPress from '../hooks/useLongPress'
import { Flag, Mine } from './icons/Icons'

function Cell({ cell, status, onReveal, onFlag, quickFlag = false, hintCell, revealDepth = 0, mineIndex = 0, animationsEnabled = true, pinching = false }) {
  const lastTap = useRef(0)
  const [pressing, setPressing] = useState(false)
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
    pressing ? 'pressing' : '',
    !animationsEnabled ? 'animation-disabled' : '',
  ].filter(Boolean).join(' ')

  const handleTap = (event) => {
    setPressing(false)
    if (pinching) return
    const now = Date.now()
    const isDoubleTap = cell.isRevealed && event.pointerType === 'touch' && now - lastTap.current < 300
    lastTap.current = now
    if (isDoubleTap && import.meta.env.DEV) console.assert(cell.isRevealed, 'double-tap chord targets a revealed number')
    if (!isDoubleTap && cell.isRevealed && event.pointerType === 'touch') {
      onReveal(cell.row, cell.column)
      return
    }
    if (quickFlag) onFlag(cell.row, cell.column)
    else onReveal(cell.row, cell.column)
  }
  const handlePointerDown = (event) => {
    if (event.pointerType === 'mouse') {
      if (event.button === 0) {
        setRevealOrigin(cell.row, cell.column)
        setPressing(true)
      }
      return
    }
    setRevealOrigin(cell.row, cell.column)
    setPressing(true)
    longPress.onPointerDown(event)
  }
  const handlePointerUp = (event) => {
    if (event.pointerType === 'mouse') {
      setPressing(false)
      if (event.button === 0) handleTap(event)
      return
    }
    longPress.onPointerUp(event)
  }
  const longPress = useLongPress({
    onTap: handleTap,
    onLongPress: () => { setPressing(false); onFlag(cell.row, cell.column) },
  })

  return (
    <button
      className={className}
      style={{ '--depth': revealDepth, '--mine-index': mineIndex }}
      onPointerDown={handlePointerDown}
      onPointerMove={longPress.onPointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => { setPressing(false); longPress.onPointerCancel() }}
      onContextMenu={(event) => { event.preventDefault(); onFlag(cell.row, cell.column) }}
      onClick={(event) => event.preventDefault()}
      aria-label={cell.isFlagged ? 'Flagged cell' : cell.isRevealed ? `Revealed cell ${cell.adjacent}` : 'Hidden cell'}
    >
      {cell.isFlagged && status !== 'lost' ? <span className="cell-content flag-content"><Flag label="Flag" /></span>
        : cell.isMine && status === 'lost' ? <span className="cell-content mine-content"><Mine label="Mine" /></span>
          : cell.isRevealed && cell.adjacent ? <span className="cell-content number-content">{cell.adjacent}</span> : ''}
    </button>
  )
}

export default memo(Cell)
