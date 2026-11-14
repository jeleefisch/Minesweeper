export const preventContextMenu = (event) => {
  const target = event.target
  if (target instanceof Element && target.closest('input, textarea, [contenteditable="true"]')) return false
  event.preventDefault()
  return true
}

if (import.meta.env.DEV) {
  const check = new MouseEvent('contextmenu', { cancelable: true })
  preventContextMenu(check)
  console.assert(check.defaultPrevented, 'contextmenu default is prevented outside text inputs')
}
