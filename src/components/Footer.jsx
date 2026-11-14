import { useState } from 'react'

const controls = [['Left click', 'Reveal'], ['Right click', 'Flag'], ['Long-press', 'Flag (touch)'], ['Click a number', 'Chord'], ['H', 'Hint'], ['F', 'Quick Flag'], ['R', 'Restart'], ['M', 'Mute']]

export default function Footer() {
  const [open, setOpen] = useState(false)
  return (
    <footer className="controls-footer">
      <button className="controls-toggle" onClick={() => setOpen((value) => !value)} aria-expanded={open}>Controls</button>
      <div className={`controls-list ${open ? 'open' : ''}`}>
        {controls.map(([key, action]) => <span key={key}><kbd>{key}</kbd> {action}</span>)}
        <span className="touch-controls">Tap = reveal · Long-press = flag · Double-tap a number = chord</span>
      </div>
    </footer>
  )
}
