import { facePaths } from './facePaths'

export default function FaceHappy({ label = 'Happy' }) {
  return <svg viewBox="0 0 1024 1024" width="36" height="36" aria-label={label} role="img" shapeRendering="crispEdges">
    {facePaths.map(([d, fill]) => <path key={d} d={d} fill={fill} />)}
  </svg>
}
