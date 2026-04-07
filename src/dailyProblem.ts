import type { AIProblemSet } from './aiProblemStore'
import { localeBody, getLocale } from './i18n'

const STORAGE_KEY = 'logic-daily-problem'
const API_BASE = import.meta.env.DEV ? `http://${window.location.hostname}:3001` : ''

type DailyState = {
  date: string
  problem: AIProblemSet | null
  completed: boolean
}

function todayKey() { return new Date().toISOString().slice(0, 10) }

function load(): DailyState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* */ }
  return null
}

function save(s: DailyState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
}

export function getTodayProblem(): AIProblemSet | null {
  const s = load()
  if (s && s.date === todayKey()) return s.problem
  return null
}

export function isDailyCompleted(): boolean {
  const s = load()
  return !!(s && s.date === todayKey() && s.completed)
}

export function markDailyCompleted() {
  const s = load()
  if (s && s.date === todayKey()) {
    s.completed = true
    save(s)
  }
}

export async function generateTodayProblem(): Promise<AIProblemSet> {
  const cached = getTodayProblem()
  if (cached) return cached
  const res = await fetch(`${API_BASE}/api/daily-problem`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(localeBody({})),
  })
  if (!res.ok) throw new Error(getLocale() === 'en' ? 'Failed to generate today\'s problem' : '問題の生成に失敗しました')
  const data = await res.json()
  const problem: AIProblemSet = {
    id: 90000 + (Date.now() % 10000),
    title: data.title,
    category: data.category || (getLocale() === 'en' ? 'Logical Thinking' : 'ロジカルシンキング'),
    steps: data.steps,
    prompt: 'daily auto-generated',
    createdAt: new Date().toISOString(),
  }
  save({ date: todayKey(), problem, completed: false })
  return problem
}
