import { ZoomIn, ZoomOut, Refresh } from './icons/Icons'
export default function ZoomControls({ zoom, onChange, onReset }) {
  return <div className="zoom-controls"><button onClick={() => onChange(-10)} title="Zoom out" aria-label="Zoom out"><ZoomOut /></button><span>{zoom}%</span><button onClick={onReset} title="Reset zoom" aria-label="Reset zoom"><Refresh /></button><button onClick={() => onChange(10)} title="Zoom in" aria-label="Zoom in"><ZoomIn /></button></div>
}
