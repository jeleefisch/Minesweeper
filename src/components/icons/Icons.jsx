const Icon = ({ children, label, title }) => <svg viewBox="0 0 24 24" width="24" height="24" aria-label={label} role="img" title={title || label} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{children}</svg>
export const Flag = (props) => <Icon {...props}><path d="M6 21V4m0 1h10l-3 3 3 3H6" fill="currentColor" stroke="none"/><path d="M6 21V4" stroke="#333"/></Icon>
export const Mine = (props) => <Icon {...props}><path d="M12 3v3m0 12v3M3 12h3m12 0h3M5.6 5.6l2.1 2.1m8.6 8.6l2.1 2.1m0-12.8l-2.1 2.1m-8.6 8.6l-2.1 2.1"/><circle cx="12" cy="12" r="5" fill="currentColor"/></Icon>
export const Volume = (props) => <Icon {...props}><path d="M4 10v4h4l5 4V6l-5 4H4m12 0c1 1 1 3 0 4m2-6c2 2 2 6 0 8"/></Icon>
export const VolumeOff = (props) => <Icon {...props}><path d="M4 10v4h4l5 4V6l-5 4H4m11 1l5 5m0-5l-5 5"/></Icon>
export const Sun = (props) => <Icon {...props}><circle cx="12" cy="12" r="4" fill="currentColor"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M4.9 4.9l1.4 1.4m11.4 11.4l1.4 1.4m0-14.2l-1.4 1.4M6.3 17.7l-1.4 1.4"/></Icon>
export const Moon = (props) => <Icon {...props}><path d="M20 15.5A8 8 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5z" fill="currentColor"/></Icon>
export const Hint = (props) => <Icon {...props}><path d="M9 18h6M10 21h4"/><path d="M8 14c-3-4 0-9 4-9s7 5 4 9l-1 1H9l-1-1z" fill="currentColor" opacity=".25"/></Icon>
export const QuickFlag = (props) => <Icon {...props}><path d="M6 21V4m0 1h10l-3 3 3 3H6" fill="currentColor" opacity=".35"/><path d="M6 21V4"/></Icon>
export const ZoomIn = (props) => <Icon {...props}><circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l5 5M10.5 7.5v6m-3-3h6"/></Icon>
export const ZoomOut = (props) => <Icon {...props}><circle cx="10.5" cy="10.5" r="6"/><path d="M15 15l5 5M7.5 10.5h6"/></Icon>
export const Share = (props) => <Icon {...props}><circle cx="18" cy="5" r="2" fill="currentColor"/><circle cx="6" cy="12" r="2" fill="currentColor"/><circle cx="18" cy="19" r="2" fill="currentColor"/><path d="M8 11l8-5m-8 7l8 5"/></Icon>
export const Copy = (props) => <Icon {...props}><rect x="8" y="8" width="11" height="12" rx="1"/><path d="M16 8V5H5v12h3"/></Icon>
export const Trophy = (props) => <Icon {...props}><path d="M8 4h8v5a4 4 0 0 1-8 0V4z" fill="currentColor" opacity=".25"/><path d="M8 6H4v2a4 4 0 0 0 4 4m8-6h4v2a4 4 0 0 1-4 4M12 13v5m-4 2h8"/></Icon>
export const Close = (props) => <Icon {...props}><path d="M6 6l12 12M18 6L6 18"/></Icon>
export const Refresh = (props) => <Icon {...props}><path d="M20 11a8 8 0 1 0 1 4"/><path d="M20 5v6h-6"/></Icon>
export const Play = (props) => <Icon {...props}><path d="M8 5l10 7-10 7V5z" fill="currentColor"/></Icon>
export const Pause = (props) => <Icon {...props}><path d="M8 5v14m8-14v14"/></Icon>
