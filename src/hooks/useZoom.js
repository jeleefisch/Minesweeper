import { useCallback } from 'react'
import useLocalStorage from './useLocalStorage'

export default function useZoom() {
  const [zoom, setZoom] = useLocalStorage('minesweeper-zoom', 100)
  const changeZoom = useCallback((amount) => setZoom((value) => {
    const current = Number.isFinite(Number(value)) ? Number(value) : 100
    const next = Math.min(200, Math.max(50, Math.round((current + amount) / 10) * 10))
    return next
  }), [setZoom])
  const resetZoom = useCallback(() => setZoom(100), [setZoom])
  const normalizedZoom = Math.min(200, Math.max(50, Math.round(Number(zoom) / 10) * 10)) || 100
  if (import.meta.env.DEV) console.assert(normalizedZoom >= 50 && normalizedZoom <= 200, 'zoom clamped to 50-200%')
  return { zoom: normalizedZoom, changeZoom, resetZoom }
}

export const runZoomCheck = () => {
  const clamp = (value) => Math.min(200, Math.max(50, value))
  console.assert(clamp(210) === 200, 'zoom upper clamp')
  console.assert(clamp(40) === 50, 'zoom lower clamp')
}
