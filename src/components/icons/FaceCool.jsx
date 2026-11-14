import { facePaths } from './facePaths'

export default function FaceCool({ label = 'Cool' }) {
  return <svg viewBox="0 0 1024 1024" width="36" height="36" aria-label={label} role="img" shapeRendering="crispEdges">
    {facePaths.map(([d, fill]) => <path key={d} d={d} fill={fill} />)}
    <rect x="320" y="330" width="105" height="80" fill="#222" />
    <rect x="600" y="330" width="105" height="80" fill="#222" />
    <rect x="425" y="350" width="175" height="35" fill="#222" />
  </svg>
}
