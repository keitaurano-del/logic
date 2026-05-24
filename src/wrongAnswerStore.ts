/**
 * 過去の誤答（間違えた問題）の永続化レイヤー
 *
 * フラッシュカードの裏に解説が混ぜ込まれているだけだった誤答情報を、
 * 独立したレコードとして localStorage に保存する。
 * 構造は将来 Supabase に同期できる粒度（id / lessonId / question / wrongAt …）で持たせる。
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { getSupabaseClient } from './db/index'

const STORAGE_KEY = 'logic-wrong-answers'

export type WrongAnswerOption = { label: string; correct: boolean }

export type WrongAnswer = {
  id: string
  lessonId: number
  lessonTitle: string
  category: string
  question: string
  correctAnswer: string
  selectedAnswer: string
  explanation: string
  /** 4択再出題用。記録できなかった古いカードでは undefined */
  options?: WrongAnswerOption[]
  wrongAt: string         // ISO datetime
  resolvedAt: string | null  // ISO datetime, 復習で正解できた日時
  retryCount: number
  retryCorrectCount: number
}

export type WrongAnswerInput = Omit<
  WrongAnswer,
  'id' | 'wrongAt' | 'resolvedAt' | 'retryCount' | 'retryCorrectCount'
>

export function loadWrongAnswers(): WrongAnswer[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function saveWrongAnswers(items: WrongAnswer[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
}

export function addWrongAnswers(inputs: WrongAnswerInput[]): WrongAnswer[] {
  if (inputs.length === 0) return []
  const existing = loadWrongAnswers()
  const now = new Date().toISOString()
  const added: WrongAnswer[] = []
  for (const item of inputs) {
    // 同レッスン・同問題は最新のもの1件に集約（解決済みなら未解決に戻す）
    const dupIdx = existing.findIndex(
      (e) => e.lessonId === item.lessonId && e.question === item.question,
    )
    if (dupIdx >= 0) {
      const dup = existing[dupIdx]
      dup.selectedAnswer = item.selectedAnswer
      dup.correctAnswer = item.correctAnswer
      dup.explanation = item.explanation
      if (item.options) dup.options = item.options
      dup.wrongAt = now
      dup.resolvedAt = null
      added.push(dup)
      continue
    }
    const fresh: WrongAnswer = {
      ...item,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      wrongAt: now,
      resolvedAt: null,
      retryCount: 0,
      retryCorrectCount: 0,
    }
    existing.push(fresh)
    added.push(fresh)
  }
  saveWrongAnswers(existing)
  return added
}

export function markRetryResult(id: string, correct: boolean): WrongAnswer | null {
  const items = loadWrongAnswers()
  const item = items.find((i) => i.id === id)
  if (!item) return null
  item.retryCount += 1
  if (correct) {
    item.retryCorrectCount += 1
    if (!item.resolvedAt) item.resolvedAt = new Date().toISOString()
  } else {
    item.resolvedAt = null
  }
  saveWrongAnswers(items)
  return item
}

export function setResolved(id: string, resolved: boolean): void {
  const items = loadWrongAnswers()
  const item = items.find((i) => i.id === id)
  if (!item) return
  item.resolvedAt = resolved ? new Date().toISOString() : null
  saveWrongAnswers(items)
}

export function deleteWrongAnswer(id: string): void {
  const items = loadWrongAnswers().filter((i) => i.id !== id)
  saveWrongAnswers(items)
}

export type WrongAnswerStats = {
  total: number
  resolved: number
  unresolved: number
  byCategory: Record<string, number>   // 未解決のみのカテゴリ別カウント
}

export function getWrongAnswerStats(): WrongAnswerStats {
  const items = loadWrongAnswers()
  const byCategory: Record<string, number> = {}
  let resolved = 0
  for (const it of items) {
    if (it.resolvedAt) resolved += 1
    else byCategory[it.category] = (byCategory[it.category] ?? 0) + 1
  }
  return {
    total: items.length,
    resolved,
    unresolved: items.length - resolved,
    byCategory,
  }
}

export type WrongAnswerFilter = {
  status?: 'all' | 'unresolved' | 'resolved'
  category?: string | null
  lessonId?: number | null
}

export function filterWrongAnswers(filter: WrongAnswerFilter = {}): WrongAnswer[] {
  const { status = 'all', category = null, lessonId = null } = filter
  let items = loadWrongAnswers()
  if (status === 'unresolved') items = items.filter((i) => !i.resolvedAt)
  else if (status === 'resolved') items = items.filter((i) => !!i.resolvedAt)
  if (category) items = items.filter((i) => i.category === category)
  if (lessonId != null) items = items.filter((i) => i.lessonId === lessonId)
  // 直近の誤答を上に
  return items.sort((a, b) => (a.wrongAt < b.wrongAt ? 1 : -1))
}

// =============================================
// Supabase 同期 (Phase 1: Device Sync)
// =============================================

type WrongAnswerRow = {
  lesson_id: number
  lesson_title: string | null
  category: string | null
  question: string
  correct_answer: string
  selected_answer: string | null
  explanation: string | null
  options: WrongAnswerOption[] | null
  wrong_at: string
  resolved_at: string | null
  retry_count: number
  retry_correct_count: number
}

function rowToWrongAnswer(row: WrongAnswerRow): WrongAnswer {
  return {
    id: `${row.lesson_id}:${row.question}`,
    lessonId: row.lesson_id,
    lessonTitle: row.lesson_title ?? '',
    category: row.category ?? '',
    question: row.question,
    correctAnswer: row.correct_answer,
    selectedAnswer: row.selected_answer ?? '',
    explanation: row.explanation ?? '',
    options: row.options ?? undefined,
    wrongAt: row.wrong_at,
    resolvedAt: row.resolved_at,
    retryCount: row.retry_count,
    retryCorrectCount: row.retry_correct_count,
  }
}

function wrongAnswerToRow(userId: string, w: WrongAnswer): Record<string, unknown> {
  return {
    user_id: userId,
    lesson_id: w.lessonId,
    lesson_title: w.lessonTitle,
    category: w.category,
    question: w.question,
    correct_answer: w.correctAnswer,
    selected_answer: w.selectedAnswer,
    explanation: w.explanation,
    options: w.options ?? null,
    wrong_at: w.wrongAt,
    resolved_at: w.resolvedAt,
    retry_count: w.retryCount,
    retry_correct_count: w.retryCorrectCount,
    updated_at: new Date().toISOString(),
  }
}

async function fetchWrongAnswersFromDB(userId: string): Promise<WrongAnswer[] | null> {
  const db = getSupabaseClient()
  if (!db) return null
  try {
    const { data, error } = await (db as any)
      .from('user_wrong_answers')
      .select('lesson_id, lesson_title, category, question, correct_answer, selected_answer, explanation, options, wrong_at, resolved_at, retry_count, retry_correct_count')
      .eq('user_id', userId)
    if (error) {
      console.warn('[wrongAnswerStore] fetchWrongAnswersFromDB error:', error.message)
      return null
    }
    return (data || []).map((r: WrongAnswerRow) => rowToWrongAnswer(r))
  } catch (e) {
    console.warn('[wrongAnswerStore] fetchWrongAnswersFromDB exception:', e)
    return null
  }
}

/** 1 件 push */
export async function pushWrongAnswerToDB(userId: string, w: WrongAnswer): Promise<void> {
  const db = getSupabaseClient()
  if (!db) return
  try {
    const { error } = await (db as any)
      .from('user_wrong_answers')
      .upsert([wrongAnswerToRow(userId, w)], { onConflict: 'user_id,lesson_id,question' })
    if (error) console.warn('[wrongAnswerStore] pushWrongAnswerToDB error:', error.message)
  } catch (e) {
    console.warn('[wrongAnswerStore] pushWrongAnswerToDB exception:', e)
  }
}

async function pushWrongAnswersToDB(userId: string, items: WrongAnswer[]): Promise<void> {
  if (items.length === 0) return
  const db = getSupabaseClient()
  if (!db) return
  try {
    const rows = items.map((w) => wrongAnswerToRow(userId, w))
    const CHUNK = 500
    for (let i = 0; i < rows.length; i += CHUNK) {
      const chunk = rows.slice(i, i + CHUNK)
      const { error } = await (db as any)
        .from('user_wrong_answers')
        .upsert(chunk, { onConflict: 'user_id,lesson_id,question' })
      if (error) {
        console.warn('[wrongAnswerStore] pushWrongAnswersToDB error:', error.message)
        return
      }
    }
  } catch (e) {
    console.warn('[wrongAnswerStore] pushWrongAnswersToDB exception:', e)
  }
}

/** ローカル + DB から削除 */
export async function deleteWrongAnswerForUser(userId: string, w: WrongAnswer): Promise<void> {
  deleteWrongAnswer(w.id)
  const db = getSupabaseClient()
  if (!db) return
  try {
    const { error } = await (db as any)
      .from('user_wrong_answers')
      .delete()
      .eq('user_id', userId)
      .eq('lesson_id', w.lessonId)
      .eq('question', w.question)
    if (error) console.warn('[wrongAnswerStore] deleteWrongAnswerForUser error:', error.message)
  } catch (e) {
    console.warn('[wrongAnswerStore] deleteWrongAnswerForUser exception:', e)
  }
}

/**
 * ログイン時の同期。
 * 戦略: Union + 衝突時は resolved_at の新しい方を採用。
 */
export async function syncWrongAnswers(userId: string): Promise<void> {
  const db = getSupabaseClient()
  if (!db) return
  try {
    const remote = await fetchWrongAnswersFromDB(userId)
    if (remote == null) return
    const local = loadWrongAnswers()

    const keyOf = (w: WrongAnswer) => `${w.lessonId}:${w.question}`
    const remoteByKey = new Map(remote.map((r) => [keyOf(r), r]))
    const merged = new Map<string, WrongAnswer>()
    const toPush: WrongAnswer[] = []

    for (const r of remote) merged.set(keyOf(r), r)

    for (const l of local) {
      const k = keyOf(l)
      const r = remoteByKey.get(k)
      if (!r) {
        merged.set(k, l)
        toPush.push(l)
        continue
      }
      let chosen: WrongAnswer = r
      if (l.resolvedAt && r.resolvedAt) {
        chosen = l.resolvedAt > r.resolvedAt ? l : r
      } else if (l.resolvedAt && !r.resolvedAt) {
        chosen = l
      } else if (!l.resolvedAt && r.resolvedAt) {
        chosen = r
      } else {
        chosen = l.wrongAt > r.wrongAt ? l : r
      }
      chosen = {
        ...chosen,
        retryCount: Math.max(l.retryCount, r.retryCount),
        retryCorrectCount: Math.max(l.retryCorrectCount, r.retryCorrectCount),
        options: chosen.options ?? l.options ?? r.options,
      }
      merged.set(k, chosen)
      if (chosen !== r) toPush.push(chosen)
    }

    const mergedArr = [...merged.values()]
    saveWrongAnswers(mergedArr)
    await pushWrongAnswersToDB(userId, toPush)

    if (import.meta.env.DEV) {
      console.log(
        '[wrongAnswerStore] syncWrongAnswers complete:',
        `remote=${remote.length}`,
        `local=${local.length}`,
        `merged=${mergedArr.length}`,
        `pushed=${toPush.length}`,
      )
    }
  } catch (e) {
    console.warn('[wrongAnswerStore] syncWrongAnswers failed:', e)
  }
}
