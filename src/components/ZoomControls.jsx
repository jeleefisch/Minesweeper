import { ZoomIn, ZoomOut, OneToOne } from './icons/Icons'
export default function ZoomControls({ zoom, onChange, onReset }) {
  if (import.meta.env.DEV) console.assert(!onReset || onReset !== onChange, 'zoom buttons do not trigger game reset')
  return <div className="zoom-controls" data-testid="zoom-controls"><button onClick={() => onChange(-10)} title="Zoom out" aria-label="Zoom out"><ZoomOut /></button><span>{zoom}%</span><button onClick={() => onChange(10)} title="Zoom in" aria-label="Zoom in"><ZoomIn /></button><button onClick={onReset} title="Reset zoom to 100%" aria-label="Reset zoom to 100%"><OneToOne /> <span>100%</span></button></div>
}
