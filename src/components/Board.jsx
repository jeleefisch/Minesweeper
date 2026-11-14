import Cell from './Cell'

export default function Board({ board, status, onReveal, onFlag }) {
  return (
    <div className="board" style={{ '--cols': board[0]?.length }}>
      {board.flat().map((cell) => (
        <Cell key={`${cell.row}-${cell.column}`} cell={cell} status={status} onReveal={onReveal} onFlag={onFlag} />
      ))}
    </div>
  )
}
