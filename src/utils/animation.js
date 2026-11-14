let revealOrigin = null

export const setRevealOrigin = (row, column) => {
  revealOrigin = { row, column }
}

export const getRevealDepth = (row, column) => {
  if (!revealOrigin) return 0
  const distance = Math.max(Math.abs(row - revealOrigin.row), Math.abs(column - revealOrigin.column))
  return Math.min(distance, 24)
}

export const getMineIndex = (index) => index

export const getRevealOrigin = () => revealOrigin
