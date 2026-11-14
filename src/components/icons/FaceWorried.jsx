import { facePaths } from './facePaths'

export default function FaceWorried({ label = 'Worried' }) {
  return <svg viewBox="0 0 1024 1024" width="36" height="36" aria-label={label} role="img" shapeRendering="crispEdges">
    {facePaths.map(([d, fill]) => <path key={d} d={d} fill={fill} />)}
    <rect x="390" y="650" width="245" height="70" fill="#222" />
    <rect x="425" y="685" width="175" height="35" fill="#35D335" />
  </svg>
}
