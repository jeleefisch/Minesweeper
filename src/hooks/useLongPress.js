import { useRef } from 'react'

export default function useLongPress({ onTap, onLongPress, delay = 350, moveThreshold = 8 }) {
  const timerRef = useRef(null)
  const startRef = useRef(null)
  const longPressedRef = useRef(false)

  const clear = () => {
    if (timerRef.current) window.clearTimeout(timerRef.current)
    timerRef.current = null
  }

  const onPointerDown = (event) => {
    if (event.pointerType !== 'touch' && event.pointerType !== 'pen') return
    startRef.current = { x: event.clientX, y: event.clientY }
    longPressedRef.current = false
    clear()
    timerRef.current = window.setTimeout(() => {
      longPressedRef.current = true
      if (navigator.vibrate) navigator.vibrate(15)
      onLongPress()
    }, delay)
  }

  const onPointerMove = (event) => {
    if (event.pointerType !== 'touch' && event.pointerType !== 'pen') return
    if (!startRef.current) return
    const distance = Math.hypot(event.clientX - startRef.current.x, event.clientY - startRef.current.y)
    if (distance > moveThreshold) clear()
  }

  const onPointerUp = (event) => {
    if (event.pointerType !== 'touch' && event.pointerType !== 'pen') return
    clear()
    if (!longPressedRef.current) onTap(event)
    startRef.current = null
  }

  const onPointerCancel = () => {
    clear()
    startRef.current = null
  }

  if (import.meta.env.DEV) {
    console.assert(moveThreshold === 8, 'long-press movement threshold is 8px')
  }

  return { onPointerDown, onPointerMove, onPointerUp, onPointerCancel, longPressedRef }
}
