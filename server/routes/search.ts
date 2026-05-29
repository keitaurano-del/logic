import { Router, type Request, type Response } from 'express'
import type Anthropic from '@anthropic-ai/sdk'
import type { RequestHandler } from 'express'

// =============================================
// AI セマンティック検索 (POST /api/search)
// =============================================
// 自然言語クエリで、レッスン／コースのカタログから意味ベースに合致するものを
// Claude に選ばせ、関連度順に id + 理由を返す。
//
// 方式はプロンプトベース（embedding 基盤は新設コストが大きいので不採用）。
// カタログはフロント側で courseData / lessonData から組んで送る（新規 DB 不要）。
// カタログは {id, title, category} の軽量データなので数百件でも数十 KB に収まる。

// クライアントが送ってくるカタログ項目の型
export type CatalogCourse = { id: string; title: string; category: string; description?: string }
export type CatalogLesson = { id: number; title: string; category: string }
export type SearchCatalog = { courses: CatalogCourse[]; lessons: CatalogLesson[] }

// Claude が返す 1 件分の結果
export type SearchHit = { kind: 'course' | 'lesson'; id: string | number; reason: string }

// 入力カタログの上限（プロンプト肥大とコスト暴走を防ぐ）
const MAX_COURSES = 80
const MAX_LESSONS = 400
const MAX_QUERY_LEN = 200
const MAX_RESULTS = 12

// =============================================
// カタログ整形（テスト対象）
// =============================================
// 受け取った catalog をサニタイズし、Claude に渡せる安全な形へ整える。
// - 配列でない／壊れた項目は捨てる
// - title / category は trim、空なら捨てる
// - 件数上限でクランプ
export function sanitizeCatalog(input: unknown): SearchCatalog {
  const raw = (input && typeof input === 'object' ? input : {}) as Record<string, unknown>
  const rawCourses = Array.isArray(raw.courses) ? raw.courses : []
  const rawLessons = Array.isArray(raw.lessons) ? raw.lessons : []

  const courses: CatalogCourse[] = []
  for (const c of rawCourses) {
    if (!c || typeof c !== 'object') continue
    const o = c as Record<string, unknown>
    const id = typeof o.id === 'string' ? o.id.trim() : ''
    const title = typeof o.title === 'string' ? o.title.trim() : ''
    const category = typeof o.category === 'string' ? o.category.trim() : ''
    if (!id || !title) continue
    const description = typeof o.description === 'string' ? o.description.trim().slice(0, 120) : undefined
    courses.push({ id, title, category, ...(description ? { description } : {}) })
    if (courses.length >= MAX_COURSES) break
  }

  const lessons: CatalogLesson[] = []
  const seen = new Set<number>()
  for (const l of rawLessons) {
    if (!l || typeof l !== 'object') continue
    const o = l as Record<string, unknown>
    const id = typeof o.id === 'number' && Number.isFinite(o.id) ? o.id : NaN
    const title = typeof o.title === 'string' ? o.title.trim() : ''
    const category = typeof o.category === 'string' ? o.category.trim() : ''
    if (!Number.isFinite(id) || !title || seen.has(id)) continue
    seen.add(id)
    lessons.push({ id, title, category })
    if (lessons.length >= MAX_LESSONS) break
  }

  return { courses, lessons }
}

// =============================================
// プロンプト生成（テスト対象）
// =============================================
export function buildSearchPrompt(query: string, locale: string, catalog: SearchCatalog): string {
  const isEn = locale === 'en'
  const courseLines = catalog.courses
    .map(c => `C:${c.id} | ${c.title} | ${c.category}${c.description ? ` | ${c.description}` : ''}`)
    .join('\n')
  const lessonLines = catalog.lessons
    .map(l => `L:${l.id} | ${l.title} | ${l.category}`)
    .join('\n')

  if (isEn) {
    return `You are a search assistant for a logical-thinking training app. The user typed a natural-language query. From the catalog below, pick the lessons and courses that best match the user's intent, ordered by relevance (most relevant first). Consider meaning and intent, not just literal word matches.

Return ONLY a JSON array (no prose, no code fence). Each element:
{"kind":"lesson"|"course","id":<the id after the L:/C: prefix>,"reason":"<one short English sentence (max 80 chars) on why it matches>"}

Rules:
- Use ONLY ids that appear in the catalog. Never invent ids.
- For courses, "id" is the string after "C:" (e.g. "logic-01"). For lessons, "id" is the number after "L:" (e.g. 23).
- Return at most ${MAX_RESULTS} items. If nothing reasonably matches, return [].
- Prefer a mix of the single best course and the most relevant lessons when both fit.

User query: "${query}"

Courses (format "C:id | title | category | description"):
${courseLines || '(none)'}

Lessons (format "L:id | title | category"):
${lessonLines || '(none)'}`
  }

  return `あなたはロジカルシンキング学習アプリの検索アシスタントです。ユーザーが自然言語のクエリを入力しました。下のカタログから、ユーザーの意図に最も合致するレッスンとコースを、関連度の高い順に選んでください。字面の一致だけでなく、意味や意図を汲んで選んでください。

出力は JSON 配列のみ（説明文やコードフェンス不要）。各要素は次の形式:
{"kind":"lesson"|"course","id":<L:/C: の後ろの id>,"reason":"<合致する理由を 80 字以内の日本語1文で>"}

ルール:
- カタログに存在する id だけを使う。id を創作しない。
- コースの "id" は "C:" の後ろの文字列（例 "logic-01"）。レッスンの "id" は "L:" の後ろの数値（例 23）。
- 最大 ${MAX_RESULTS} 件まで。妥当な候補が無ければ [] を返す。
- コースとレッスンの両方が合致するなら、最も合うコース1件と関連レッスンを織り交ぜる。

ユーザーのクエリ: 「${query}」

コース（形式 "C:id | title | category | description"）:
${courseLines || '(なし)'}

レッスン（形式 "L:id | title | category"）:
${lessonLines || '(なし)'}`
}

// =============================================
// 結果パース（テスト対象）
// =============================================
// Claude の生テキストから JSON 配列を抜き出し、カタログに実在する id だけに絞る。
// 不正・幻覚 id は捨てる。重複も除去。順序は Claude の返した関連度順を維持。
export function parseSearchResults(rawText: string, catalog: SearchCatalog): SearchHit[] {
  if (!rawText) return []
  const match = rawText.match(/\[[\s\S]*\]/)
  if (!match) return []

  let parsed: unknown
  try {
    parsed = JSON.parse(match[0])
  } catch {
    return []
  }
  if (!Array.isArray(parsed)) return []

  const courseIds = new Set(catalog.courses.map(c => c.id))
  const lessonIds = new Set(catalog.lessons.map(l => l.id))

  const out: SearchHit[] = []
  const seen = new Set<string>()
  for (const item of parsed) {
    if (!item || typeof item !== 'object') continue
    const o = item as Record<string, unknown>
    const kind = o.kind === 'course' ? 'course' : o.kind === 'lesson' ? 'lesson' : null
    if (!kind) continue
    const reason = typeof o.reason === 'string' ? o.reason.trim().slice(0, 120) : ''

    if (kind === 'course') {
      const id = typeof o.id === 'string' ? o.id.trim() : ''
      if (!id || !courseIds.has(id)) continue
      const key = `c:${id}`
      if (seen.has(key)) continue
      seen.add(key)
      out.push({ kind, id, reason })
    } else {
      // lesson id は数値。文字列で来ても数値化を試みる。
      const idNum = typeof o.id === 'number' ? o.id : typeof o.id === 'string' ? Number(o.id) : NaN
      if (!Number.isFinite(idNum) || !lessonIds.has(idNum)) continue
      const key = `l:${idNum}`
      if (seen.has(key)) continue
      seen.add(key)
      out.push({ kind, id: idNum, reason })
    }
    if (out.length >= MAX_RESULTS) break
  }
  return out
}

// =============================================
// createSearchRouter
// =============================================
export function createSearchRouter(client: Anthropic, searchLimiter: RequestHandler): Router {
  const router = Router()

  // POST /api/search
  router.post('/', searchLimiter, async (req: Request, res: Response) => {
    try {
      const body = (req.body ?? {}) as { query?: unknown; locale?: unknown; catalog?: unknown }
      const query = typeof body.query === 'string' ? body.query.trim() : ''
      const locale = body.locale === 'en' ? 'en' : 'ja'

      if (!query) {
        return res.status(400).json({ error: locale === 'en' ? 'query is required' : 'クエリが必要です' })
      }
      if (query.length > MAX_QUERY_LEN) {
        return res.status(400).json({ error: locale === 'en' ? 'query too long' : 'クエリが長すぎます' })
      }

      const catalog = sanitizeCatalog(body.catalog)
      if (catalog.courses.length === 0 && catalog.lessons.length === 0) {
        return res.status(400).json({ error: locale === 'en' ? 'catalog is required' : 'カタログが必要です' })
      }

      const prompt = buildSearchPrompt(query, locale, catalog)
      const response = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1024,
        messages: [{ role: 'user', content: prompt }],
      })
      const rawText = response.content[0]?.type === 'text' ? response.content[0].text : ''
      const results = parseSearchResults(rawText, catalog)

      res.json({ results, query })
    } catch (e: unknown) {
      console.error('search error:', e)
      res.status(500).json({ error: e instanceof Error ? e.message : String(e) })
    }
  })

  return router
}
