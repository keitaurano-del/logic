const KEY = 'logic-roleplay-usage'
const FREE_MONTHLY_LIMIT = 3

type Usage = { month: string; count: number }

function currentMonth(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function load(): Usage {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw) {
      const u = JSON.parse(raw) as Usage
      if (u.month === currentMonth()) return u
    }
  } catch { /* */ }
  return { month: currentMonth(), count: 0 }
}

function save(u: Usage) {
  localStorage.setItem(KEY, JSON.stringify(u))
}

export function getRoleplayRemaining(): number {
  return Math.max(0, FREE_MONTHLY_LIMIT - load().count)
}

export function canUseRoleplay(): boolean {
  return load().count < FREE_MONTHLY_LIMIT
}

export function incrementRoleplayUsage(): void {
  const u = load()
  u.count += 1
  save(u)
}

export const ROLEPLAY_FREE_LIMIT = FREE_MONTHLY_LIMIT
