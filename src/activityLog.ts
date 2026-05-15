/**
 * その日アプリ上でやったことの履歴。ジャーナルの「カレンダー詳細」「Today」で
 * 「2026-05-15 にやったこと」を逆引きするために使う。
 *
 * 設計メモ:
 * - localStorage 専用（Supabase には現状同期しない）
 * - 最新 MAX 件まで保持。古いものから捨てる
 * - 同一日 × 同一 (type, id) は重複登録しない（複数回やってもログは1件）
 */

const STORAGE_KEY = 'logic-activity-log'
const MAX_ENTRIES = 1000

export type ActivityType = 'lesson' | 'fermi' | 'roleplay' | 'daily-problem' | 'ai-problem'

export interface ActivityEntry {
  ts: number              // unix ms
  type: ActivityType
  id?: string             // lesson id, situation id, problem id 等
  title?: string          // 表示用ラベル
  meta?: { score?: number; durationSec?: number }
}

function load(): ActivityEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function save(entries: ActivityEntry[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
  } catch { /* quota / storage disabled — ignore */ }
}

function dateStr(ts: number): string {
  const d = new Date(ts)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function recordActivity(entry: Omit<ActivityEntry, 'ts'>): void {
  const ts = Date.now()
  const today = dateStr(ts)
  const entries = load()

  // 同日 × 同じ type+id は upsert（タイトル等を最新で上書き）
  if (entry.id) {
    const dupIdx = entries.findIndex(
      (e) => e.type === entry.type && e.id === entry.id && dateStr(e.ts) === today,
    )
    if (dupIdx !== -1) {
      entries[dupIdx] = { ...entries[dupIdx], ...entry, ts }
      save(entries)
      return
    }
  }

  entries.push({ ...entry, ts })
  if (entries.length > MAX_ENTRIES) {
    entries.splice(0, entries.length - MAX_ENTRIES)
  }
  save(entries)
}

export function getActivitiesByDate(date: string): ActivityEntry[] {
  return load()
    .filter((e) => dateStr(e.ts) === date)
    .sort((a, b) => a.ts - b.ts)
}
