/**
 * 保存（ブックマーク）レイヤー
 *
 * レッスン・コース・ロールプレイ・レッスンステップ（画面ごと）・
 * AI 生成問題・フェルミ問題を横断して保存し、後から復習画面で
 * 一覧できるようにする。誤答ストアと同じく localStorage で完結。
 */
const STORAGE_KEY = 'logic-saved-items'

export type SavedItemType =
  | 'lesson'
  | 'course'
  | 'roleplay'
  | 'lesson-step'
  | 'ai-problem'
  | 'fermi'

export type SavedItem = {
  /** type-refId の複合キーをそのまま使ってもいいが、内部 ID も別途持つ */
  id: string
  type: SavedItemType
  /** lessonId は number、course / roleplay は文字列 ID。lesson-step は `${lessonId}:${stepIndex}` */
  refId: string
  title: string
  subtitle?: string
  /** Hero / サムネ画像（任意）。一覧表示で使用 */
  image?: string
  savedAt: string
  /** lesson-step: 何ステップ目か（0-indexed） */
  stepIndex?: number
  /** lesson-step: 親レッスンID（一覧から開くとき必要） */
  parentLessonId?: number
}

function makeId(type: SavedItemType, refId: string): string {
  return `${type}:${refId}`
}

export function loadSavedItems(): SavedItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function persist(items: SavedItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export function isSaved(type: SavedItemType, refId: string | number): boolean {
  const id = makeId(type, String(refId))
  return loadSavedItems().some((i) => i.id === id)
}

export type SaveItemInput = {
  type: SavedItemType
  refId: string | number
  title: string
  subtitle?: string
  image?: string
  stepIndex?: number
  parentLessonId?: number
}

/** 既に保存済みなら何もしない（idempotent）。新規ならリスト先頭に追加 */
export function saveItem(input: SaveItemInput): SavedItem {
  const id = makeId(input.type, String(input.refId))
  const items = loadSavedItems()
  const existing = items.find((i) => i.id === id)
  if (existing) return existing
  const fresh: SavedItem = {
    id,
    type: input.type,
    refId: String(input.refId),
    title: input.title,
    subtitle: input.subtitle,
    image: input.image,
    savedAt: new Date().toISOString(),
    stepIndex: input.stepIndex,
    parentLessonId: input.parentLessonId,
  }
  items.unshift(fresh)
  persist(items)
  return fresh
}

export function unsaveItem(type: SavedItemType, refId: string | number): void {
  const id = makeId(type, String(refId))
  const items = loadSavedItems().filter((i) => i.id !== id)
  persist(items)
}

/** トグル: 未保存なら保存、保存済みなら削除。新しい保存状態を返す */
export function toggleSaved(input: SaveItemInput): boolean {
  if (isSaved(input.type, input.refId)) {
    unsaveItem(input.type, input.refId)
    return false
  }
  saveItem(input)
  return true
}

export function getSavedByType(type: SavedItemType): SavedItem[] {
  return loadSavedItems().filter((i) => i.type === type)
}

export type SavedItemStats = {
  total: number
  byType: Record<SavedItemType, number>
}

export function getSavedItemStats(): SavedItemStats {
  const items = loadSavedItems()
  const byType: Record<SavedItemType, number> = {
    lesson: 0,
    course: 0,
    roleplay: 0,
    'lesson-step': 0,
    'ai-problem': 0,
    fermi: 0,
  }
  for (const it of items) byType[it.type] += 1
  return { total: items.length, byType }
}

/**
 * ロールプレイがシチュエーション軸 → キャラ軸（哲学者3体）に置き換わったため、
 * 旧シチュエーション ID で保存されている roleplay 項目を起動時に一掃する。
 * 2026-05-19 マイグレーション。
 */
const VALID_ROLEPLAY_CHARACTER_IDS = new Set(['socrates', 'descartes', 'nietzsche'])

export function cleanupLegacyRoleplaySaves(): void {
  const items = loadSavedItems()
  const cleaned = items.filter((it) => it.type !== 'roleplay' || VALID_ROLEPLAY_CHARACTER_IDS.has(it.refId))
  if (cleaned.length !== items.length) {
    persist(cleaned)
  }
}
