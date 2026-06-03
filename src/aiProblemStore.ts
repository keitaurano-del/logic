import type { LessonData } from './lessonData'
import { isPaid } from './subscription'
import { localeBody, getLocale } from './i18n'
import { safeSetItem } from './storageUsage'

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
  // 成長キャッシュ。QuotaExceeded 時は耐久データを守りつつ古いキャッシュを間引く。
  // logic-ai-problems 自体はサーバ保存済みで再取得可能なので、溢れる場合も
  // safeSetItem 内のフォールバックで他キャッシュを削ってでも書き込みを試みる。
  safeSetItem(STORAGE_KEY, JSON.stringify(sets))
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
  // 2026-05-15 単一有料プラン化:
  //   - 無料プラン: AI 問題生成は利用不可（サーバ側 /api/generate-problems が 403 を返す）
  //   - 有料プラン: 無制限（サーバ側のキャップ未実装）
  // クライアント側でも先に弾いて、UX を改善する。
  if (!isPaid()) {
    throw new Error(isEn
      ? 'AI problem generation is available on the paid plan.'
      : 'AI 問題生成は有料プランの機能です。')
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
  // バックエンドに全件保存（非同期・エラーは無視）
  fetch(`${API_BASE}/api/user-problems/save`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ problem: newSet }),
  }).catch(() => {})
  return newSet
}

// Re-export legacy aliases for backward compatibility with v1 components.
export { isPremium, isPaid } from './subscription'
