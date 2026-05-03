// デイリーフェルミ完了状態管理（react-refresh 違反を避けるため DailyFermiScreen.tsx から分離）
const DAILY_FERMI_KEY = 'logic-daily-fermi-done'

export function isDailyFermiDone(): boolean {
  const saved = localStorage.getItem(DAILY_FERMI_KEY)
  if (!saved) return false
  return saved === new Date().toISOString().slice(0, 10)
}

export function markDailyFermiDone(): void {
  localStorage.setItem(DAILY_FERMI_KEY, new Date().toISOString().slice(0, 10))
}
