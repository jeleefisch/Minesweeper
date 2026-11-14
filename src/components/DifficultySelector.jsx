import { useState } from 'react'
import { preventContextMenu } from '../utils/dom'
import { DIFFICULTIES } from '../config/difficulties'
import { Skull } from './icons/Icons'

const presets = [...Object.entries(DIFFICULTIES), ['custom', { label: 'Custom' }]]

export default function DifficultySelector({ value, customSettings, onChange, onCustomChange }) {
  const [draft, setDraft] = useState(customSettings)
  const update = (key, rawValue) => {
    const next = { ...draft, [key]: Number(rawValue) }
    setDraft(next)
    if (next.rows >= 5 && next.rows <= 30 && next.columns >= 5 && next.columns <= 40
      && next.mines >= 1 && next.mines < next.rows * next.columns) onCustomChange(next)
  }
  return (
    <div className="difficulty" onContextMenu={preventContextMenu}>
      <div className="difficulty-tabs">
        {presets.map(([key, config]) => <button key={key} className={`${value === key ? 'active' : ''} ${key === 'god' ? 'god-difficulty' : ''}`} onClick={() => onChange(key)}>{key === 'god' && <span className="difficulty-icon"><Skull label="God difficulty" /></span>}{config.label}{config.badge && <small>{config.badge}</small>}</button>)}
      </div>
      {value === 'custom' && (
        <div className="custom-fields">
          {['rows', 'columns', 'mines'].map((key) => (
            <label key={key}>{key}<input type="number" min={key === 'mines' ? 1 : 5} max={key === 'rows' ? 30 : key === 'columns' ? 40 : 1199} value={draft[key]} onChange={(event) => update(key, event.target.value)} /></label>
          ))}
          <span className="validation">5–30 rows · 5–40 columns · mines below board size</span>
        </div>
      )}
    </div>
  )
}
