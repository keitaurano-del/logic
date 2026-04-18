// Developer mode flag - persisted in localStorage
// When enabled, shows beta features (dev panels)

const STORAGE_KEY = 'logic-dev-mode'

export function isDevMode(): boolean {
  return localStorage.getItem(STORAGE_KEY) === 'on'
}

export function setDevMode(enabled: boolean): void {
  localStorage.setItem(STORAGE_KEY, enabled ? 'on' : 'off')
}

export function toggleDevMode(): boolean {
  const next = !isDevMode()
  setDevMode(next)
  return next
}
