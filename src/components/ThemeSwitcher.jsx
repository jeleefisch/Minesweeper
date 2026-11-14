const themes = [
  ['pastel-purple', 'Pastel Purple'],
  ['classic-gray', 'Classic Gray'],
  ['classic-green', 'Classic Green'],
]

export default function ThemeSwitcher({ value, onChange }) {
  return (
    <label className="theme-picker">
      Theme
      <select value={value} onChange={(event) => onChange(event.target.value)}>
        {themes.map(([key, label]) => <option key={key} value={key}>{label}</option>)}
      </select>
    </label>
  )
}
