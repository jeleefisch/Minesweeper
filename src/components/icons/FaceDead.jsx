import { facePaths } from './facePaths'

export default function FaceDead({ label = 'Dead' }) {
  return <svg viewBox="0 0 1024 1024" width="36" height="36" aria-label={label} role="img" shapeRendering="crispEdges">
    {facePaths.map(([d, fill]) => <path key={d} d={d} fill={fill} />)}
    <path d="M325 330h35v35h-35zm70 70h35v35h-35zm0-70h35v35h-35zm-70 70h35v35h-35zm280-70h35v35h-35zm70 70h35v35h-35zm0-70h35v35h-35zm-70 70h35v35h-35z" fill="#222" />
    <path d="M390 690h245v35H390zM425 655h175v35H425z" fill="#222" />
  </svg>
}
