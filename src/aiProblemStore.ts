import type { LessonData } from './lessonData'

const STORAGE_KEY = 'logic-ai-problems'
const API_BASE = import.meta.env.DEV ? `http://${window.location.hostname}:3001` : ''

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
  const res = await fetch(`${API_BASE}/api/generate-problems`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
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
  return newSet
}

export function isPremium(): boolean {
  return localStorage.getItem('logic-premium') === 'true'
}

export function setPremium(value: boolean): void {
  localStorage.setItem('logic-premium', value ? 'true' : 'false')
}
