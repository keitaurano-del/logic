/**
 * 過去の誤答（間違えた問題）の永続化レイヤー
 *
 * フラッシュカードの裏に解説が混ぜ込まれているだけだった誤答情報を、
 * 独立したレコードとして localStorage に保存する。
 * 構造は将来 Supabase に同期できる粒度（id / lessonId / question / wrongAt …）で持たせる。
 */
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
