import { isPremium } from './subscription'

const STORAGE_KEY = 'logic-ai-usage'
const FREE_DAILY_LIMIT = 10
const PREMIUM_MONTHLY_LIMIT = 300

type UsageState = {
  daily: { date: string; count: number }
  monthly: { month: string; count: number }
}

const DEFAULT: UsageState = {
  daily: { date: '', count: 0 },
  monthly: { month: '', count: 0 },
}

function load(): UsageState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return { ...DEFAULT, ...JSON.parse(raw) }
  } catch { /* */ }
  return { ...DEFAULT }
}

function save(s: UsageState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
}

function todayKey() { return new Date().toISOString().slice(0, 10) }
function monthKey() { return new Date().toISOString().slice(0, 7) }

function syncPeriods(s: UsageState): UsageState {
  const today = todayKey()
  const month = monthKey()
  if (s.daily.date !== today) s.daily = { date: today, count: 0 }
  if (s.monthly.month !== month) s.monthly = { month, count: 0 }
  return s
}

export function canGenerate(): boolean {
  const s = syncPeriods(load())
  if (isPremium()) return s.monthly.count < PREMIUM_MONTHLY_LIMIT
  return s.daily.count < FREE_DAILY_LIMIT
}

export function recordGeneration(): void {
  const s = syncPeriods(load())
  s.daily.count++
  s.monthly.count++
  save(s)
}

export function getRemainingToday(): number {
  const s = syncPeriods(load())
  return Math.max(0, FREE_DAILY_LIMIT - s.daily.count)
}

export function getRemainingMonth(): number {
  const s = syncPeriods(load())
  return Math.max(0, PREMIUM_MONTHLY_LIMIT - s.monthly.count)
}

export function getLimits() {
  return {
    freeDaily: FREE_DAILY_LIMIT,
    premiumMonthly: PREMIUM_MONTHLY_LIMIT,
    isPremiumUser: isPremium(),
    remainingToday: getRemainingToday(),
    remainingMonth: getRemainingMonth(),
  }
}
