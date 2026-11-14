import { useState } from 'react'
import Cell from './Cell'
import { getMineIndex, getRevealDepth } from '../utils/animation'
import { QuickFlag } from './icons/Icons'
import useBoardCellSize from '../hooks/useBoardCellSize'
import usePinchZoom from '../hooks/usePinchZoom'
import ZoomControls from './ZoomControls'

export default function Board({ board, status, onReveal, onFlag, quickFlag, onToggleQuickFlag, hintCell, zoom, onZoom, onResetZoom }) {
  const [scrollElement, setScrollElement] = useState(null)
  const cellSize = useBoardCellSize(scrollElement, board[0]?.length || 1, zoom)
  const { pinching, pinchHandlers } = usePinchZoom((delta) => onZoom(delta))
  const [animationsEnabled, setAnimationsEnabled] = useState(() => {
    try {
      return localStorage.getItem('minesweeper-animations') !== 'false'
    } catch {
      return true
    }
  })
  const mineIndexes = new Map(
    board.flat().filter((cell) => cell.isMine).map((cell, index) => [`${cell.row}-${cell.column}`, index]),
  )

  const toggleAnimations = () => {
    const nextValue = !animationsEnabled
    setAnimationsEnabled(nextValue)
    try {
      localStorage.setItem('minesweeper-animations', String(nextValue))
    } catch {
      // The visual preference still applies for this session if storage is unavailable.
    }
  }

  return (
    <div className={`board-shell ${animationsEnabled ? '' : 'animations-off'}`}>
      <ZoomControls zoom={zoom} onChange={onZoom} onReset={onResetZoom} />
      <button className="animation-toggle" onClick={toggleAnimations} aria-pressed={animationsEnabled}>
        Animations: {animationsEnabled ? 'On' : 'Off'}
      </button>
      <button className={`mobile-quick-flag ${quickFlag ? 'selected' : ''}`} onClick={() => onToggleQuickFlag(!quickFlag)} aria-pressed={quickFlag} title="Toggle Quick Flag">
        <QuickFlag label="Quick Flag" /> {quickFlag ? 'Flag mode on' : 'Quick Flag'}
      </button>
      {board[0]?.length > 20 && <p className="wide-board-hint">Rotate your phone or zoom out for the full board</p>}
      <div className="board-clip" ref={setScrollElement} {...pinchHandlers}>
        <div className={`board ${status === 'won' ? 'board-won' : ''}`} onWheel={(event) => {
          if (event.ctrlKey) { event.preventDefault(); onZoom(event.deltaY > 0 ? -10 : 10) }
        }} style={{ '--cols': board[0]?.length, '--cell-size': cellSize }}>
          {board.flat().map((cell) => (
            <Cell
              key={`${cell.row}-${cell.column}`}
              cell={cell}
              status={status}
              onReveal={onReveal}
              onFlag={onFlag}
              quickFlag={quickFlag}
              hintCell={hintCell}
              animationsEnabled={animationsEnabled}
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
