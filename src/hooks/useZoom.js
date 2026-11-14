import { useCallback } from 'react'
import useLocalStorage from './useLocalStorage'

export default function useZoom() {
  const [zoom, setZoom] = useLocalStorage('minesweeper-zoom', 100)
  const changeZoom = useCallback((amount) => setZoom((value) => Math.min(200, Math.max(50, value + amount))), [setZoom])
  const resetZoom = useCallback(() => setZoom(100), [setZoom])
  return { zoom, changeZoom, resetZoom }
}

export const runZoomCheck = () => {
  const clamp = (value) => Math.min(200, Math.max(50, value))
  console.assert(clamp(210) === 200, 'zoom upper clamp')
  console.assert(clamp(40) === 50, 'zoom lower clamp')
}
