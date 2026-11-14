import { useState } from 'react'
import { preventContextMenu } from '../utils/dom'
import ZoomControls from './ZoomControls'

const controls = [['Left click', 'Reveal'], ['Right click', 'Flag'], ['Long-press', 'Flag (touch)'], ['Click a number', 'Chord'], ['H', 'Hint'], ['F', 'Quick Flag'], ['R', 'Restart'], ['M', 'Mute']]

export default function Footer({ zoom, onZoom, onResetZoom }) {
  const [open, setOpen] = useState(false)
  return (
    <footer className="controls-footer" onContextMenu={preventContextMenu}>
      <button className="controls-toggle" onClick={() => setOpen((value) => !value)} aria-expanded={open}>Controls</button>
      <div className={`controls-list ${open ? 'open' : ''}`}>
        {controls.map(([key, action]) => <span key={key}><kbd>{key}</kbd> {action}</span>)}
        <span className="touch-controls">Tap = reveal · Long-press = flag · Double-tap a number = chord</span>
      </div>
      <div className="footer-zoom-group">
        <span className="zoom-label">Zoom</span>
        <ZoomControls zoom={zoom} onChange={onZoom} onReset={onResetZoom} />
      </div>
    </footer>
  )
}
