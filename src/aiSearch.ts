// AI セマンティック検索のクライアント側ロジック。
// courseData / lessonData から軽量カタログを組み、サーバの POST /api/search に投げ、
// レッスン／コースの id + 理由を関連度順に受け取る。
import { API_BASE } from './screens/apiBase'
import { getLocale } from './i18n'
import { COURSES, type Course } from './courseData'
import { getAllLessonsFlat, type LessonData } from './lessonData'

// サーバが返す 1 件分の結果（server/routes/search.ts の SearchHit と対応）
export type AiSearchHit =
  | { kind: 'course'; id: string; reason: string }
  | { kind: 'lesson'; id: number; reason: string }

// フロント側で解決済みの結果（カードに渡しやすい形）
export type ResolvedCourseHit = { kind: 'course'; course: Course; reason: string }
export type ResolvedLessonHit = { kind: 'lesson'; lesson: LessonData; reason: string }
export type ResolvedAiHit = ResolvedCourseHit | ResolvedLessonHit

// カタログを courseData / lessonData から組む。
// {id, title, category} の軽量データのみ送る（本文は送らない＝ペイロード節約）。
function buildCatalog() {
  const courses = COURSES.map(c => ({
    id: c.id,
    title: c.title,
    category: c.category,
    description: c.description,
  }))
  const lessons = Object.values(getAllLessonsFlat())
    .filter((l): l is LessonData => !!l)
    .map(l => ({ id: l.id, title: l.title, category: l.category }))
  return { courses, lessons }
}

/**
 * 自然言語クエリで AI 検索を実行し、解決済みの結果を関連度順に返す。
 * @throws ネットワーク／サーバエラー時は Error を投げる（呼び出し側で UI に出す）
 */
export async function aiSearch(query: string, signal?: AbortSignal): Promise<ResolvedAiHit[]> {
  const locale = getLocale()
  const catalog = buildCatalog()

  const res = await fetch(`${API_BASE}/api/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, locale, catalog }),
    signal,
  })

  if (!res.ok) {
    let msg = ''
    try {
      const data = (await res.json()) as { error?: string }
      msg = data?.error || ''
    } catch { /* ignore */ }
    throw new Error(msg || `search failed (${res.status})`)
  }

  const data = (await res.json()) as { results?: AiSearchHit[] }
  const hits = Array.isArray(data.results) ? data.results : []

  // id をフロントのデータへ解決（実在しないものは捨てる）
  const courseById = new Map(COURSES.map(c => [c.id, c]))
  const lessons = getAllLessonsFlat()
  const resolved: ResolvedAiHit[] = []
  for (const h of hits) {
    if (h.kind === 'course') {
      const course = courseById.get(h.id)
      if (course) resolved.push({ kind: 'course', course, reason: h.reason })
    } else {
      const lesson = lessons[h.id]
      if (lesson) resolved.push({ kind: 'lesson', lesson, reason: h.reason })
    }
  }
  return resolved
}
