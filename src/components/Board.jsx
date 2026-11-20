import { useEffect, useState } from 'react'
import Cell from './Cell'
import { getMineIndex, getRevealDepth } from '../utils/animation'
import { QuickFlag } from './icons/Icons'
import useBoardCellSize from '../hooks/useBoardCellSize'
import usePinchZoom from '../hooks/usePinchZoom'
import { preventContextMenu } from '../utils/dom'

export default function Board({ board, status, onReveal, onFlag, quickFlag, onToggleQuickFlag, hintCell, zoom, onZoom }) {
  const [scrollElement, setScrollElement] = useState(null)
  const [isOverflowing, setIsOverflowing] = useState(false)
  const cellSize = useBoardCellSize(scrollElement, board[0]?.length || 1, zoom)
  const { pinching, pinchHandlers } = usePinchZoom((delta) => onZoom(delta))
  useEffect(() => {
    if (!scrollElement) return undefined
    const scrollContainer = scrollElement.closest('.board-scroll')
    const updateOverflow = () => setIsOverflowing(Boolean(scrollContainer && scrollContainer.scrollWidth > scrollContainer.clientWidth + 1))
    updateOverflow()
    const observer = new ResizeObserver(updateOverflow)
    observer.observe(scrollElement)
    if (scrollContainer) observer.observe(scrollContainer)
    window.addEventListener('resize', updateOverflow)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', updateOverflow)
    }
  }, [scrollElement, cellSize])
  const mineIndexes = new Map(
    board.flat().filter((cell) => cell.isMine).map((cell, index) => [`${cell.row}-${cell.column}`, index]),
  )
  return (
    <div className="board-shell">
      <button className={`mobile-quick-flag ${quickFlag ? 'selected' : ''}`} onClick={() => onToggleQuickFlag(!quickFlag)} aria-pressed={quickFlag} title="Toggle Quick Flag">
        <QuickFlag label="Quick Flag" /> {quickFlag ? 'Flag mode on' : 'Quick Flag'}
      </button>
      {board[0]?.length > 20 && <p className="wide-board-hint">Rotate your phone or zoom out for the full board</p>}
      <div
        className="board-clip"
        ref={setScrollElement}
        onContextMenu={preventContextMenu}
        style={{ touchAction: isOverflowing ? 'pan-x pan-y' : 'pan-y' }}
        onPointerDown={(event) => pinchHandlers.onPointerDown(event, zoom)}
        onPointerMove={pinchHandlers.onPointerMove}
        onPointerUp={pinchHandlers.onPointerUp}
        onPointerCancel={pinchHandlers.onPointerCancel}
      >
        <div className={`board ${status === 'won' ? 'board-won' : ''}`} onContextMenu={preventContextMenu} style={{ '--cols': board[0]?.length, '--cell-size': cellSize, touchAction: isOverflowing ? 'pan-x pan-y' : 'pan-y' }} onWheel={(event) => {
          if (event.ctrlKey) { event.preventDefault(); onZoom(event.deltaY > 0 ? -10 : 10) }
        }}>
          {board.flat().map((cell) => (
            <Cell
              key={`${cell.row}-${cell.column}`}
              cell={cell}
              status={status}
              onReveal={onReveal}
              onFlag={onFlag}
              quickFlag={quickFlag}
              hintCell={hintCell}
              revealDepth={getRevealDepth(cell.row, cell.column)}
              mineIndex={getMineIndex(mineIndexes.get(`${cell.row}-${cell.column}`) || 0)}
              pinching={pinching}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
