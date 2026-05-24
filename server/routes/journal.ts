import { Router, type Request, type Response } from 'express'
import type Anthropic from '@anthropic-ai/sdk'
import type { RequestHandler } from 'express'

const MOOD_LABELS_JA: Record<number, string> = {
  1: '最悪', 2: 'イマイチ', 3: '普通', 4: '良い', 5: '最高',
}
const MOOD_LABELS_EN: Record<number, string> = {
  1: 'awful', 2: 'meh', 3: 'okay', 4: 'good', 5: 'great',
}
const WEATHER_LABELS_JA: Record<string, string> = {
  sunny: '晴れ', cloudy: '曇り', rainy: '雨', snowy: '雪',
}
const WEATHER_LABELS_EN: Record<string, string> = {
  sunny: 'sunny', cloudy: 'cloudy', rainy: 'rainy', snowy: 'snowy',
}

const PERIOD_LABELS_JA: Record<string, string> = {
  daily: '日次', weekly: '週次', monthly: '月次', yearly: '年次',
}
const PERIOD_LABELS_EN: Record<string, string> = {
  daily: 'daily', weekly: 'weekly', monthly: 'monthly', yearly: 'yearly',
}

interface JournalEntry {
  date?: string
  mood?: number | null
  weather?: string | null
  schedule_notes?: string | null
  evening_reflection?: string | null
}

interface LessonCatalogEntry {
  id?: number
  title?: string
  category?: string
}

interface CourseCatalogEntry {
  id?: string
  title?: string
  category?: string
  description?: string
  lessonCount?: number
}

// レッスンカタログを prompt 用テキストに整形する。最大件数で切り詰めて
// トークン消費を抑えつつ、AI が id を引けるよう "id|category|title" 形式で渡す。
function buildLessonCatalogText(
  catalog: unknown,
  isEn: boolean,
  maxEntries = 200,
): { text: string; validIds: Set<number> } {
  const validIds = new Set<number>()
  if (!Array.isArray(catalog) || catalog.length === 0) {
    return { text: isEn ? '(no lessons available)' : '（レッスンデータなし）', validIds }
  }
  const lines: string[] = []
  for (const entry of catalog as LessonCatalogEntry[]) {
    if (lines.length >= maxEntries) break
    if (!entry || typeof entry !== 'object') continue
    const id = entry.id
    const title = typeof entry.title === 'string' ? entry.title.trim() : ''
    const category = typeof entry.category === 'string' ? entry.category.trim() : ''
    if (typeof id !== 'number' || !Number.isFinite(id) || id < 0) continue
    if (!title) continue
    validIds.add(id)
    // 区切りは "|" にして AI が混同しないようにする
    const safeTitle = title.replace(/[|\r\n]/g, ' ').slice(0, 80)
    const safeCat = category.replace(/[|\r\n]/g, ' ').slice(0, 40)
    lines.push(safeCat ? `${id}|${safeCat}|${safeTitle}` : `${id}||${safeTitle}`)
  }
  if (lines.length === 0) {
    return { text: isEn ? '(no lessons available)' : '（レッスンデータなし）', validIds }
  }
  return { text: lines.join('\n'), validIds }
}

// AI 出力末尾の "RECOMMENDED_LESSONS: 12, 34" を抽出し、本文からそのセクションを除去する。
function parseRecommendedLessons(
  raw: string,
  validIds: Set<number>,
  maxResults = 2,
): { body: string; ids: number[] } {
  const match = raw.match(/RECOMMENDED_LESSONS:\s*([0-9 ,]*)\s*$/i)
  if (!match) return { body: raw.trim(), ids: [] }
  const list = match[1]
    .split(/[,、\s]+/)
    .map((s) => Number(s.trim()))
    .filter((n) => Number.isFinite(n) && n > 0)
  const seen = new Set<number>()
  const ids: number[] = []
  for (const id of list) {
    if (seen.has(id)) continue
    if (validIds.size > 0 && !validIds.has(id)) continue
    seen.add(id)
    ids.push(id)
    if (ids.length >= maxResults) break
  }
  const body = raw.slice(0, match.index).trim()
  return { body, ids }
}

// コースカタログを prompt 用テキストに整形する。"id|category|title|description" 形式で渡す。
function buildCourseCatalogText(
  catalog: unknown,
  isEn: boolean,
  maxEntries = 60,
): { text: string; validIds: Set<string> } {
  const validIds = new Set<string>()
  if (!Array.isArray(catalog) || catalog.length === 0) {
    return { text: isEn ? '(no courses available)' : '（コースデータなし）', validIds }
  }
  const lines: string[] = []
  for (const entry of catalog as CourseCatalogEntry[]) {
    if (lines.length >= maxEntries) break
    if (!entry || typeof entry !== 'object') continue
    const id = typeof entry.id === 'string' ? entry.id.trim() : ''
    const title = typeof entry.title === 'string' ? entry.title.trim() : ''
    const category = typeof entry.category === 'string' ? entry.category.trim() : ''
    const desc = typeof entry.description === 'string' ? entry.description.trim() : ''
    if (!id || !title) continue
    // id は英数字とハイフン/アンダースコアに制限（インジェクション対策）
    if (!/^[a-zA-Z0-9_-]{1,40}$/.test(id)) continue
    validIds.add(id)
    const safeTitle = title.replace(/[|\r\n]/g, ' ').slice(0, 80)
    const safeCat = category.replace(/[|\r\n]/g, ' ').slice(0, 40)
    const safeDesc = desc.replace(/[|\r\n]/g, ' ').slice(0, 100)
    lines.push(`${id}|${safeCat}|${safeTitle}|${safeDesc}`)
  }
  if (lines.length === 0) {
    return { text: isEn ? '(no courses available)' : '（コースデータなし）', validIds }
  }
  return { text: lines.join('\n'), validIds }
}

// AI 出力末尾の "RECOMMENDED_COURSES: logic-01" を抽出し、本文からそのセクションを除去する。
// RECOMMENDED_LESSONS の解析より先に走らせる必要がある（末尾マッチを段階的に剥がすため）。
function parseRecommendedCourses(
  raw: string,
  validIds: Set<string>,
  maxResults = 1,
): { body: string; ids: string[] } {
  const match = raw.match(/RECOMMENDED_COURSES:\s*([a-zA-Z0-9_,\-\s]*)\s*$/i)
  if (!match) return { body: raw.trim(), ids: [] }
  const list = match[1]
    .split(/[,、\s]+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
  const seen = new Set<string>()
  const ids: string[] = []
  for (const id of list) {
    if (seen.has(id)) continue
    if (validIds.size > 0 && !validIds.has(id)) continue
    seen.add(id)
    ids.push(id)
    if (ids.length >= maxResults) break
  }
  const body = raw.slice(0, match.index).trim()
  return { body, ids }
}

// プロンプトインジェクション対策: assistantName から改行・引用符・記号を除き 30 文字に切り詰める
function sanitizeAssistantName(raw: unknown, fallback: string): string {
  if (typeof raw !== 'string') return fallback
  const cleaned = raw
    .replace(/[\r\n\t"'`「」『』]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 30)
  return cleaned || fallback
}

export function createJournalRouter(
  client: Anthropic,
  journalLimiter: RequestHandler,
): Router {
  const router = Router()

  // =============================================
  // ジャーナル — 今日の要約生成
  // =============================================
  router.post('/summarize', journalLimiter, async (req: Request, res: Response) => {
    try {
      const { mood, weather, scheduleNotes, assistantName, locale } = req.body || {}
      const isEn = locale === 'en'

      const hasAnyInput =
        (typeof mood === 'number' && mood >= 1 && mood <= 5) ||
        (typeof weather === 'string' && weather.length > 0) ||
        (typeof scheduleNotes === 'string' && scheduleNotes.trim().length > 0)
      if (!hasAnyInput) {
        return res.status(400).json({ error: isEn ? 'No input provided' : '入力がありません' })
      }

      const name = sanitizeAssistantName(assistantName, isEn ? 'your assistant' : 'パーソナルアシスタント')

      const moodLabel = (typeof mood === 'number' && mood >= 1 && mood <= 5)
        ? (isEn ? MOOD_LABELS_EN[mood] : MOOD_LABELS_JA[mood])
        : (isEn ? 'not entered' : '未入力')
      const weatherLabel = (typeof weather === 'string' && weather in WEATHER_LABELS_JA)
        ? (isEn ? WEATHER_LABELS_EN[weather] : WEATHER_LABELS_JA[weather])
        : (isEn ? 'not entered' : '未入力')

      const systemPrompt = isEn
        ? `You are "${name}", a personal assistant inside the Logic app for a first-year consultant.
Summarize the user's morning check-in warmly, concisely, and forward-looking, propose one open-ended follow-up question that invites deeper reflection, AND extract up to 4 short tags from the content.

Output STRICTLY in this exact format (no prefix, no extra text):

SUMMARY:
<within 200 English words: 1 line on today's condition + 1-2 bullets on today's focus + a short cheer>

FOLLOW_UP:
<one open-ended question, 1 line, that nudges the user to reflect further on their intentions or today's challenge>

TAGS:
<comma-separated short tags (1-3 words each, total 2-4 tags). Extract themes / actions / context (e.g. "client meeting", "focus", "low energy"). No hashtags, no quotes.>

Stay positive, never judgmental. Don't repeat raw inputs verbatim. The follow-up MUST be a question, not advice.`
        : `あなたは Logic アプリのパーソナルアシスタント「${name}」です。
コンサルタント1年目のユーザーが入力した今日の情報を温かく・前向きに・簡潔にまとめ、深掘りを促す問い1つを提案し、さらに **内容から短いタグを最大 4 つ** 抽出してください。

以下の形式で **厳密に** 出力してください（前置きや余計なテキストは禁止）:

SUMMARY:
<200字以内。今日のコンディション一言 + 今日の意識ポイント1〜2点（箇条書き）+ 一言応援メッセージ>

FOLLOW_UP:
<1行・1問。今日の意図や課題をより深く考えるきっかけになる開放的な問い>

TAGS:
<カンマ区切りの短いタグ（各 1〜10 文字、合計 2〜4 個）。テーマ・行動・状況を抽出（例: "クライアントMTG, 集中, 体調不良"）。ハッシュ記号や引用符は付けない。>

ポジティブに、決めつけずに。入力のコピーは禁止。フォローアップは必ず「問い」の形にすること。`

      const userMessage = isEn
        ? `Mood: ${moodLabel}
Weather: ${weatherLabel}
Today's intentions / schedule:
${(scheduleNotes || '').toString().trim() || '(not entered)'}`
        : `【今日の気分】${moodLabel}
【今日の天気】${weatherLabel}
【今日の意識ポイント・予定】
${(scheduleNotes || '').toString().trim() || '未入力'}`

      const response = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 800,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
      })
      const raw = response.content[0].type === 'text' ? response.content[0].text.trim() : ''

      // SUMMARY: / FOLLOW_UP: / TAGS: をパース。形式違反時は raw 全体を summary に倒す
      let summary = raw
      let followUpQuestion = ''
      let suggestedTags: string[] = []
      const summaryMatch = raw.match(/SUMMARY:\s*([\s\S]*?)(?:\n\s*FOLLOW_UP:|\n\s*TAGS:|$)/i)
      const followMatch = raw.match(/FOLLOW_UP:\s*([\s\S]*?)(?:\n\s*TAGS:|$)/i)
      const tagsMatch = raw.match(/TAGS:\s*([\s\S]*?)$/i)
      if (summaryMatch) summary = summaryMatch[1].trim()
      if (followMatch) followUpQuestion = followMatch[1].trim()
      if (tagsMatch) {
        suggestedTags = tagsMatch[1]
          .split(/[,、]/)
          .map((s) => s.replace(/^#+/, '').replace(/["'`「」『』]/g, '').trim())
          .filter((s) => s.length > 0 && s.length <= 24)
          .slice(0, 4)
      }

      res.json({ summary, follow_up_question: followUpQuestion, suggested_tags: suggestedTags })
    } catch (e: unknown) {
      console.error('journal summarize error:', e)
      res.status(500).json({ error: e instanceof Error ? e.message : String(e) })
    }
  })

  // =============================================
  // ジャーナル — 総合フィードバック
  //   目標・直近ジャーナル・レッスン進捗・フェルミ実施状況を統合し、
  //   今の状態を読み解いた上で次の一歩を提案する。
  // =============================================
  router.post('/holistic-feedback', journalLimiter, async (req: Request, res: Response) => {
    try {
      const {
        goals,
        recentJournals,
        progressSummary,
        fermiCount,
        lessonStreak,
        studyDays,
        assistantName,
        locale,
        lessonCatalog,
        courseCatalog,
      } = req.body || {}
      const isEn = locale === 'en'
      const name = sanitizeAssistantName(assistantName, isEn ? 'your assistant' : 'パーソナルアシスタント')
      const { text: lessonCatalogText, validIds: validLessonIds } = buildLessonCatalogText(lessonCatalog, isEn)
      const { text: courseCatalogText, validIds: validCourseIds } = buildCourseCatalogText(courseCatalog, isEn)

      const goalsList: Array<{ periodType?: string; title?: string; description?: string | null }> =
        Array.isArray(goals) ? goals.slice(0, 30) : []
      const goalsText = goalsList.length === 0
        ? (isEn ? 'No active goals.' : 'アクティブな目標なし。')
        : goalsList.map((g) => {
            const periodLabel = g.periodType
              ? (isEn ? PERIOD_LABELS_EN[g.periodType] || g.periodType : PERIOD_LABELS_JA[g.periodType] || g.periodType)
              : (isEn ? 'goal' : '目標')
            const title = (g.title || '').toString().trim() || (isEn ? '(untitled)' : '（無題）')
            const desc = (g.description || '').toString().trim()
            return desc ? `- [${periodLabel}] ${title}: ${desc}` : `- [${periodLabel}] ${title}`
          }).join('\n')

      const journalList: JournalEntry[] = Array.isArray(recentJournals) ? recentJournals.slice(0, 30) : []
      const journalText = journalList.length === 0
        ? (isEn ? 'No recent entries.' : '最近の記録なし。')
        : journalList.map((j) => {
            const date = j.date ?? '?'
            const m = typeof j.mood === 'number' ? `${isEn ? 'mood' : '気分'}${j.mood}/5` : ''
            const sched = (j.schedule_notes || '').toString().trim()
            const refl = (j.evening_reflection || '').toString().trim()
            const parts = [date, m].filter(Boolean).join(' ')
            const detail = [sched && `${isEn ? 'plan' : '予定'}: ${sched}`, refl && `${isEn ? 'reflect' : '振り返り'}: ${refl}`]
              .filter(Boolean).join(' / ')
            return detail ? `${parts}: ${detail}` : parts
          }).join('\n')

      const progressEntries = (progressSummary && typeof progressSummary === 'object' && !Array.isArray(progressSummary))
        ? Object.entries(progressSummary as Record<string, unknown>)
            .map(([k, v]) => {
              if (v && typeof v === 'object') {
                const completed = (v as { completed?: number }).completed
                const total = (v as { total?: number }).total
                if (typeof completed === 'number' && typeof total === 'number') {
                  return `- ${k}: ${completed}/${total}`
                }
              }
              return null
            })
            .filter((s): s is string => !!s)
        : []
      const progressText = progressEntries.length === 0
        ? (isEn ? 'No lesson data.' : 'レッスンデータなし。')
        : progressEntries.join('\n')

      const fermi = typeof fermiCount === 'number' && fermiCount >= 0 ? Math.floor(fermiCount) : 0
      const streak = typeof lessonStreak === 'number' && lessonStreak >= 0 ? Math.floor(lessonStreak) : 0
      const sDays = typeof studyDays === 'number' && studyDays >= 0 ? Math.floor(studyDays) : 0

      // 2026-05-16: 「コンサル1年目」固定の前提を撤廃。
      // 実際のアプリ利用状況（連続日数・累計学習日数・レッスン完了総数・フェルミ実施数）
      // からユーザーのフェーズを推定し、それに合わせて温度感を変える。
      const totalLessonsCompleted = Object.values(
        (typeof progressSummary === 'object' && progressSummary !== null)
          ? (progressSummary as Record<string, { completed?: number }>)
          : {}
      ).reduce((sum, p) => sum + (typeof p?.completed === 'number' ? p.completed : 0), 0)

      // 利用状況からおおまかなフェーズを決定:
      //   beginner:  学習日数 ≤ 13 or レッスン完了 < 10  (まだ習慣化前)
      //   growing:   学習日数 14〜30 / レッスン完了 10+  (習慣形成中、心理学的な目安 14〜21 日)
      //   committed: 学習日数 31〜89 / レッスン完了 30+
      //   veteran:   学習日数 90+ / レッスン完了 80+
      let phase: 'beginner' | 'growing' | 'committed' | 'veteran'
      if (sDays >= 90 || totalLessonsCompleted >= 80) phase = 'veteran'
      else if (sDays >= 31 || totalLessonsCompleted >= 30) phase = 'committed'
      else if (sDays >= 14 || totalLessonsCompleted >= 10) phase = 'growing'
      else phase = 'beginner'

      const phaseGuidanceJa: Record<typeof phase, string> = {
        beginner: 'ユーザーは Logic を使い始めたばかり（学習日数 ' + sDays + '日 / 累計レッスン ' + totalLessonsCompleted + '件 / 連続 ' + streak + '日）。まずは続けることの価値・小さな勝利を肯定し、無理な高負荷タスクは勧めない。',
        growing:  'ユーザーは習慣を作っている途中（学習日数 ' + sDays + '日 / 累計レッスン ' + totalLessonsCompleted + '件 / 連続 ' + streak + '日）。ここで何が効いているかを言語化し、再現性のある小さな次の一歩を示す。',
        committed:'ユーザーはすでにコミットしている（学習日数 ' + sDays + '日 / 累計レッスン ' + totalLessonsCompleted + '件 / 連続 ' + streak + '日）。応援というより、内省を深める問いや弱点領域への挑戦を促す。',
        veteran:  'ユーザーはベテラン（学習日数 ' + sDays + '日 / 累計レッスン ' + totalLessonsCompleted + '件 / 連続 ' + streak + '日）。称賛より、現在の伸び悩みやマンネリを指摘し、新しい切り口（実務適用・他者への教える等）を提案してよい。',
      }
      const phaseGuidanceEn: Record<typeof phase, string> = {
        beginner: 'User is just starting Logic (' + sDays + ' study days / ' + totalLessonsCompleted + ' lessons / ' + streak + '-day streak). Affirm the value of just showing up and small wins; do not push heavy tasks yet.',
        growing:  'User is building the habit (' + sDays + ' study days / ' + totalLessonsCompleted + ' lessons / ' + streak + '-day streak). Name what is working and suggest one small repeatable next step.',
        committed:'User is committed (' + sDays + ' study days / ' + totalLessonsCompleted + ' lessons / ' + streak + '-day streak). Skip generic praise; ask deeper reflective questions or nudge a weak area.',
        veteran:  'User is a veteran (' + sDays + ' study days / ' + totalLessonsCompleted + ' lessons / ' + streak + '-day streak). Praise sparingly; point out plateaus and suggest fresh angles (real-world application, teaching others, etc).',
      }

      const systemPrompt = isEn
        ? `You are "${name}", a personal assistant inside the Logic app — a thinking-skills training app (logic, case interview, Fermi estimation, philosophy, etc).

Your user context:
${phaseGuidanceEn[phase]}

Look at the user's recent activity holistically — active goals, journal entries, lesson progress, and Fermi-estimation practice — and give grounded feedback in 250 English words or less. The tone must match the user's phase (see above): a beginner gets warm encouragement, a veteran gets sharper challenge.

Structure:
- 1-2 lines: read of current momentum (calibrated to their phase)
- 2-3 lines: what's actually working in the data (be specific — cite numbers / dates / patterns)
- 2-3 lines: one concrete next step that fits their current level

Do not assume any specific job, age, or background — use only the evidence from their app usage and journal entries. Never lecture. Never give generic advice.

A catalog of available Logic lessons AND courses (each course is a curated set of 5-7 related lessons) is provided in the user message. Lessons are listed as "id|category|title" lines. Courses are listed as "id|category|title|description" lines. After your feedback, you MUST recommend BOTH:
1. 1 or 2 individual lessons that match what the user wrote or what would help them most right now.
2. 1 course that fits the broader theme or longer-term direction the user seems to need.

Output format (STRICT):
<feedback body as described above>

RECOMMENDED_LESSONS: <comma-separated lesson IDs, 1-2 items, from the lesson catalog only>
RECOMMENDED_COURSES: <single course ID from the course catalog only>

These two lines MUST be the very last lines, on their own lines, in this exact order. Use only IDs that appear in the provided catalogs. If nothing fits perfectly, still pick the closest 1 lesson and 1 course — do not skip either line.`
        : `あなたは Logic アプリのパーソナルアシスタント「${name}」です。Logic は思考力を鍛えるアプリ（論理思考、ケース面接、フェルミ推定、哲学など）です。

ユーザーの状況:
${phaseGuidanceJa[phase]}

ユーザーの最近の活動 — アクティブな目標・ジャーナル・レッスン進捗・フェルミ推定の実施状況 — を総合的に見て、根拠のあるフィードバックを 300 字以内でしてください。トーンはユーザーのフェーズに合わせること（上記参照）。初心者には温かい励まし、ベテランには鋭めの指摘。

構成:
- 1〜2行：今のモメンタムの読み取り（フェーズに合わせた温度感で）
- 2〜3行：データから実際に機能していること（具体的に — 数字・日付・パターンを引用）
- 2〜3行：今のレベルに合う具体的な次の一歩を1つ

職業・年齢・バックグラウンドを勝手に仮定しない（「コンサル」「新卒」「学生」等と決めつけない）。アプリ利用状況とジャーナルの内容だけを根拠にする。一般論を言わない。説教しない。

利用可能な Logic のレッスン一覧 **と** コース一覧（コースは関連する 5〜7 レッスンをまとめたカリキュラム）が user message に含まれます。レッスンは「id|category|title」形式、コースは「id|category|title|description」形式です。フィードバック本文の **直後に、必ず両方** 推薦してください:
1. ユーザーの記述内容や直近の状況に最も合うレッスンを 1〜2 件
2. もう少し広いテーマ・中長期の方向性として合うコースを 1 件

出力フォーマット（厳守）:
<上記構成のフィードバック本文>

RECOMMENDED_LESSONS: <レッスンカタログ内の lesson ID をカンマ区切りで 1〜2 件>
RECOMMENDED_COURSES: <コースカタログ内の course ID を 1 件>

この 2 行は **必ず最後の行** に、この順番で単独配置。カタログに存在する ID のみ使用。完全に合うものがなくても、最も近いものをそれぞれ 1 件は必ず選ぶこと（どちらの行もスキップしてはいけない）。`

      const userMessage = isEn
        ? `## Active goals
${goalsText}

## Recent journals (up to last 30 days)
${journalText}

## Lesson progress by category
${progressText}

## Fermi sessions this month: ${fermi}
## Lesson streak: ${streak} days
## Total study days: ${sDays}

## Lesson catalog (format: id|category|title)
${lessonCatalogText}

## Course catalog (format: id|category|title|description)
${courseCatalogText}`
        : `## アクティブな目標
${goalsText}

## 最近のジャーナル（直近 30 日まで）
${journalText}

## カテゴリ別レッスン進捗
${progressText}

## 今月のフェルミ実施: ${fermi} 回
## レッスン連続日数: ${streak} 日
## 累計学習日数: ${sDays} 日

## レッスンカタログ（形式: id|category|title）
${lessonCatalogText}

## コースカタログ（形式: id|category|title|description）
${courseCatalogText}`

      const response = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
      })
      const rawText = response.content[0].type === 'text' ? response.content[0].text.trim() : ''
      // 末尾から順に剥がす: 先に RECOMMENDED_COURSES → 次に RECOMMENDED_LESSONS
      const { body: bodyAfterCourses, ids: courseIds } = parseRecommendedCourses(rawText, validCourseIds)
      const { body, ids: lessonIds } = parseRecommendedLessons(bodyAfterCourses, validLessonIds)
      res.json({
        feedback: body,
        recommended_lesson_ids: lessonIds,
        recommended_course_ids: courseIds,
      })
    } catch (e: unknown) {
      console.error('journal holistic-feedback error:', e)
      res.status(500).json({ error: e instanceof Error ? e.message : String(e) })
    }
  })

  // =============================================
  // ジャーナル — 自動タグ抽出
  //   schedule_notes と evening_reflection を入力に
  //   2〜5 個の短いタグを返す。
  // =============================================
  router.post('/tags', journalLimiter, async (req: Request, res: Response) => {
    try {
      const { scheduleNotes, eveningReflection, existingTags, locale } = req.body || {}
      const isEn = locale === 'en'

      const morning = typeof scheduleNotes === 'string' ? scheduleNotes.trim().slice(0, 2000) : ''
      const evening = typeof eveningReflection === 'string' ? eveningReflection.trim().slice(0, 2000) : ''

      if (!morning && !evening) {
        return res.status(400).json({ error: isEn ? 'No text input' : 'テキストが入力されていません' })
      }

      const sanitizedExisting = Array.isArray(existingTags)
        ? existingTags
            .filter((s): s is string => typeof s === 'string')
            .map((s) => s.trim())
            .filter((s) => s.length > 0 && s.length <= 24)
            .slice(0, 12)
        : []

      const systemPrompt = isEn
        ? `You read a daily journal entry and extract short, reusable tags that capture themes / actions / context.

Output STRICTLY a comma-separated list of 2-5 tags. No prefix, no explanation, no hashtags, no quotes. Each tag is 1-3 words (or 1-10 characters in Japanese). Examples: "client meeting", "deep focus", "low energy", "family dinner". Do not repeat the user's existing tags verbatim — instead, complement them.`
        : `あなたは日々のジャーナルから、テーマ・行動・状況を表す短いタグを抽出するツールです。

**カンマ区切りのタグのみ** を出力してください（2〜5 個、各 1〜10 文字程度）。前置き・説明・ハッシュ記号・引用符は禁止。例: "クライアントMTG, 集中, 体調不良, 読書". ユーザーが既に登録しているタグはそのまま繰り返さず、補完するタグを返してください。`

      const userMessage = isEn
        ? `Morning intent / plan:
${morning || '(none)'}

Evening reflection:
${evening || '(none)'}

User's existing tags (do not repeat verbatim): ${sanitizedExisting.length ? sanitizedExisting.join(', ') : '(none)'}`
        : `【朝の予定・意識ポイント】
${morning || '（なし）'}

【夜の振り返り】
${evening || '（なし）'}

【ユーザーの既存タグ（そのまま繰り返さない）】 ${sanitizedExisting.length ? sanitizedExisting.join('、') : '（なし）'}`

      const response = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 200,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
      })
      const raw = response.content[0].type === 'text' ? response.content[0].text.trim() : ''
      const suggested = raw
        .split(/[,、\n]/)
        .map((s) => s.replace(/^#+/, '').replace(/["'`「」『』]/g, '').trim())
        .filter((s) => s.length > 0 && s.length <= 24)
        .slice(0, 5)

      res.json({ suggested_tags: suggested })
    } catch (e: unknown) {
      console.error('journal tags error:', e)
      res.status(500).json({ error: e instanceof Error ? e.message : String(e) })
    }
  })

  // =============================================
  // ジャーナル — テキスト整形 (cleanup)
  //   入力テキストの誤字脱字 / 句読点 / 改行を整えるだけ。
  //   内容の追加・要約・意見・解釈は禁止。
  // =============================================
  router.post('/cleanup', journalLimiter, async (req: Request, res: Response) => {
    try {
      const { text, locale } = req.body || {}
      const isEn = locale === 'en'
      if (typeof text !== 'string' || !text.trim()) {
        return res.status(400).json({ error: isEn ? 'text required' : 'text が必要です' })
      }
      const trimmed = text.slice(0, 5000) // 暴走防御

      // 2026-05-16: 構造化（見出し・箇条書き・段落分け）を許可。意味の追加は引き続き禁止。
      const systemPrompt = isEn
        ? `You are a text cleanup tool. The user gives you a raw text (often dictated by voice and full of fillers, missing punctuation, or typos). Your job is to clean it up AND organize it visually so it's easier to re-read later:

- Fix typos and obvious spelling errors
- Add appropriate punctuation and paragraph breaks
- Remove filler words ("um", "uh", "like", "you know", repetitions)
- Normalize whitespace
- Group related sentences into paragraphs
- Use Markdown when it genuinely helps readability:
  - "## Heading" for distinct topic sections (only if the text has 2+ topics)
  - "- " bullet lists when the user is enumerating items
  - **bold** for emphasis the writer clearly intended
- Keep the EXACT meaning, tone, and information

DO NOT:
- Summarize or shorten
- Add new content, opinions, or interpretation
- Change the writer's voice or style
- Translate
- Force structure on short single-topic text (just clean it up)

Output ONLY the cleaned/structured text. No preamble, no explanation, no quotes around it.`
        : `あなたはテキスト整形ツールです。ユーザーは未整形のテキスト（多くは音声入力で、フィラー・句読点抜け・誤字を含む）を渡してきます。あなたの仕事は **整形 + 後で読みやすくなる構造化**:

- 誤字脱字を直す
- 適切な句読点と段落分けを入れる
- フィラー（「えーと」「あの」「まあ」「なんていうか」、繰り返し）を除去
- 余分な空白・改行を正規化
- 関連する文をひとつの段落にまとめる
- 読みやすさに本当に寄与する場合のみ Markdown を使う:
  - 複数のトピックがあるなら「## 見出し」でセクション分け
  - 列挙しているなら「- 」の箇条書き
  - 書き手が明確に強調したい語は **太字**
- 意味・トーン・情報は **完全に保つ**

禁止事項:
- 要約・短縮
- 内容の追加・意見・解釈
- 書き手の口調・スタイルの変更
- 翻訳
- 短く単一トピックの文を無理に構造化する（その場合はただ整形するだけ）

出力は **整形・構造化済みテキストのみ**。前置き・説明・引用符は付けない。`

      const response = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1200,
        system: systemPrompt,
        messages: [{ role: 'user', content: trimmed }],
      })
      const cleaned = response.content[0].type === 'text' ? response.content[0].text.trim() : ''
      res.json({ cleaned })
    } catch (e: unknown) {
      console.error('journal cleanup error:', e)
      res.status(500).json({ error: e instanceof Error ? e.message : String(e) })
    }
  })

  return router
}
