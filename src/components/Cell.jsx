import { memo, useRef, useState } from 'react'
import { getRevealOrigin, setRevealOrigin } from '../utils/animation'
import useLongPress from '../hooks/useLongPress'
import { Flag, Mine } from './icons/Icons'
import { preventContextMenu } from '../utils/dom'

function Cell({ cell, status, onReveal, onFlag, quickFlag = false, hintCell, revealDepth = 0, mineIndex = 0, pinching = false }) {
  const lastTap = useRef(0)
  const [pressing, setPressing] = useState(false)
  const origin = getRevealOrigin()
  const clickedMine = cell.isMine && status === 'lost' && origin
    && origin.row === cell.row && origin.column === cell.column
  const displayState = cell.isRevealed
    ? (cell.adjacent ? 'revealed-number' : 'revealed-empty')
    : cell.isHit
      ? 'hit-mine'
      : cell.isMine && status === 'lost' && !cell.isFlagged
        ? 'mine'
        : cell.isFlagged && status === 'lost' && !cell.isMine
          ? 'wrong'
          : cell.isFlagged
            ? 'flag'
            : 'hidden'
  if (import.meta.env.DEV && displayState.startsWith('revealed')) {
    console.assert(!['mine', 'hit-mine', 'wrong', 'flag'].includes(displayState), 'revealed tiles never render an X or mine layer')
  }
  const className = [
    'cell',
    (cell.row + cell.column) % 2 === 0 ? 'tile-a' : 'tile-b',
    displayState,
    displayState.startsWith('revealed') ? 'revealed' : '',
    displayState === 'revealed-number' ? `number-${cell.adjacent}` : '',
    clickedMine ? 'clicked-mine' : '',
    displayState === 'mine' || displayState === 'hit-mine' ? 'mine-stagger' : '',
    status === 'won' ? 'win-wave' : '',
    hintCell?.row === cell.row && hintCell?.column === cell.column ? 'hint' : '',
    quickFlag && !cell.isRevealed ? 'quick-flag' : '',
    pressing ? 'pressing' : '',
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
      onContextMenu={(event) => { if (preventContextMenu(event)) onFlag(cell.row, cell.column) }}
      onClick={(event) => event.preventDefault()}
      aria-label={cell.isFlagged ? 'Flagged cell' : cell.isRevealed ? `Revealed cell ${cell.adjacent}` : 'Hidden cell'}
    >
      {displayState === 'flag' ? <span className="cell-content flag-content"><Flag label="Flag" /></span>
        : displayState === 'mine' || displayState === 'hit-mine' ? <span className="cell-content mine-content"><Mine label="Mine" /></span>
          : displayState === 'revealed-number' ? <span className="cell-content number-content">{cell.adjacent}</span> : ''}
    </button>
  )
}

export default memo(Cell)
