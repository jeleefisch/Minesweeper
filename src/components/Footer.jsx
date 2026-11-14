const controls = [['Left click', 'Reveal'], ['Right click', 'Flag'], ['Long-press', 'Flag (touch)'], ['Click a number', 'Chord'], ['H', 'Hint'], ['F', 'Quick Flag'], ['R', 'Restart'], ['M', 'Mute']]

export default function Footer() {
  return (
    <footer className="controls-footer">
      {controls.map(([key, action]) => <span key={key}><kbd>{key}</kbd> {action}</span>)}
    </footer>
  )
}
