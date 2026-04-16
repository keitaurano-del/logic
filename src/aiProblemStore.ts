import type { LessonData } from './lessonData'
import { isPremium as subIsPremium } from './subscription'
import { canGenerate, recordGeneration } from './usageTracker'
import { localeBody, getLocale } from './i18n'

const STORAGE_KEY = 'logic-ai-problems'
import { API_BASE } from './apiBase'

// AI-generated lessons use IDs in the 10000+ range to avoid conflicts
const AI_ID_BASE = 10000

export type AIProblemSet = LessonData & {
  prompt: string
  createdAt: string
}

function load(): AIProblemSet[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* */ }
  return []
}

function save(sets: AIProblemSet[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sets))
}

export function loadAIProblems(): AIProblemSet[] {
  return load().sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export function getAIProblem(id: number): AIProblemSet | undefined {
  return load().find(s => s.id === id)
}

export function deleteAIProblem(id: number): void {
  save(load().filter(s => s.id !== id))
}

export async function generateAIProblems(prompt: string): Promise<AIProblemSet> {
  const isEn = getLocale() === 'en'
  if (!canGenerate()) {
    if (subIsPremium()) {
      throw new Error(isEn ? 'You\'ve hit this month\'s limit (300 problems)' : '今月の生成回数の上限(300問)に達しました')
    } else {
      throw new Error(isEn
        ? 'You\'ve hit today\'s free limit (10 problems). Premium gives you 300/month.'
        : '今日の生成回数の上限(10問)に達しました。プレミアムプランで月300問まで生成できます。')
    }
  }
  const res = await fetch(`${API_BASE}/api/generate-problems`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(localeBody({ prompt })),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `HTTP ${res.status}`)
  }
  const data = await res.json()

  const sets = load()
  const newSet: AIProblemSet = {
    id: AI_ID_BASE + Date.now() % 100000,
    title: data.title,
    category: data.category,
    steps: data.steps,
    prompt,
    createdAt: new Date().toISOString(),
  }
  sets.unshift(newSet)
  save(sets)
  recordGeneration()
  return newSet
}

export { isPremium } from './subscription'
