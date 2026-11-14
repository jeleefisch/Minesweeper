import { useEffect, useState } from 'react'

const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, value))

export default function useBoardCellSize(element, columns, zoom) {
  const [availableWidth, setAvailableWidth] = useState(() => (
    typeof window === 'undefined' ? 320 : window.innerWidth
  ))

  useEffect(() => {
    if (!element) return undefined
    const container = element.closest('.board-scroll') || element.parentElement
    const update = () => setAvailableWidth(container?.clientWidth || window.innerWidth)
    update()
    const observer = new ResizeObserver(update)
    observer.observe(container || element)
    window.addEventListener('resize', update)
    window.addEventListener('orientationchange', update)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', update)
      window.removeEventListener('orientationchange', update)
    }
  }, [element])

  const baseSize = columns > 20 && availableWidth < 768
    ? 24
    : clamp(Math.floor(availableWidth / columns), 24, 40)
  const size = baseSize * zoom / 100
  if (import.meta.env.DEV) console.assert(size >= 12 && size <= 80, 'cell size is clamped before zoom')
  return `${size}px`
}
