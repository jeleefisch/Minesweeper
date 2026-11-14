import { useRef, useState } from 'react'

const distance = (first, second) => Math.hypot(first.clientX - second.clientX, first.clientY - second.clientY)

export default function usePinchZoom(onZoom) {
  const pointersRef = useRef(new Map())
  const startDistanceRef = useRef(0)
  const startZoomRef = useRef(100)
  const [pinching, setPinching] = useState(false)

  const onPointerDown = (event, zoom) => {
    if (event.pointerType !== 'touch' && event.pointerType !== 'pen') return
    pointersRef.current.set(event.pointerId, { clientX: event.clientX, clientY: event.clientY })
    if (pointersRef.current.size === 2) {
      const points = [...pointersRef.current.values()]
      startDistanceRef.current = distance(points[0], points[1])
      startZoomRef.current = Number.isFinite(zoom) ? zoom : 100
      setPinching(true)
    }
  }

  const onPointerMove = (event) => {
    if (event.pointerType !== 'touch' && event.pointerType !== 'pen') return
    if (!pointersRef.current.has(event.pointerId)) return
    pointersRef.current.set(event.pointerId, { clientX: event.clientX, clientY: event.clientY })
    if (pointersRef.current.size !== 2) return
    const points = [...pointersRef.current.values()]
    const scale = distance(points[0], points[1]) / startDistanceRef.current
    const nextZoom = Math.round((startZoomRef.current * scale) / 10) * 10
    onZoom(nextZoom - startZoomRef.current)
    startZoomRef.current = nextZoom
  }

  const finish = (event) => {
    if (event.pointerType !== 'touch' && event.pointerType !== 'pen') return
    pointersRef.current.delete(event.pointerId)
    if (pointersRef.current.size < 2) setPinching(false)
  }

  return {
    pinching,
    pinchHandlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: finish,
      onPointerCancel: finish,
    },
  }
}
