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
  // ジャーナル — 目標振り返りフィードバック
  // =============================================
  router.post('/goal-feedback', journalLimiter, async (req: Request, res: Response) => {
    try {
      const { goal, journals, assistantName, locale } = req.body || {}
      const isEn = locale === 'en'

      if (!goal || typeof goal !== 'object') {
        return res.status(400).json({ error: isEn ? 'goal required' : 'goal が必要です' })
      }
      const { periodType, title, description } = goal as { periodType?: string; title?: string; description?: string }
      if (!periodType || !title) {
        return res.status(400).json({ error: isEn ? 'goal.periodType and goal.title required' : 'goal.periodType と goal.title が必要です' })
      }

      const name = sanitizeAssistantName(assistantName, isEn ? 'your assistant' : 'パーソナルアシスタント')

      const periodLabel = isEn
        ? (PERIOD_LABELS_EN[periodType] || periodType)
        : (PERIOD_LABELS_JA[periodType] || periodType)

      const journalList: JournalEntry[] = Array.isArray(journals) ? journals.slice(0, 60) : []
      const journalContext = journalList.length === 0
        ? (isEn ? 'No journal entries during this period.' : '期間中の記録はありません。')
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

      const systemPrompt = isEn
        ? `You are "${name}", a personal assistant inside the Logic app for a first-year consultant.
Given the user's ${periodLabel} goal and their journal entries during that period, provide concrete and constructive feedback.

Output (within 300 English words):
- Achievement read (how close they got)
- What went well
- Concrete improvement points for the next period

Stay supportive and grounded in the journal evidence.`
        : `あなたは Logic アプリのパーソナルアシスタント「${name}」です。
コンサルタント1年目のユーザーの ${periodLabel} 目標と期間中のジャーナル記録をもとに、具体的で建設的なフィードバックをしてください。

以下の形式でまとめてください（300字以内）:
- 達成度の評価
- 良かった点
- 次期に向けた改善点

ジャーナルの記述を根拠に、励ましつつ的確に。`

      const userMessage = isEn
        ? `Goal (${periodLabel}):
${title}
${(description || '').toString().trim()}

Journal entries during this period:
${journalContext}`
        : `【目標 (${periodLabel})】
${title}
${(description || '').toString().trim()}

【期間中のジャーナル記録】
${journalContext}`

      const response = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 800,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
      })
      const feedback = response.content[0].type === 'text' ? response.content[0].text.trim() : ''
      res.json({ feedback })
    } catch (e: unknown) {
      console.error('journal goal-feedback error:', e)
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

      const systemPrompt = isEn
        ? `You are a text cleanup tool. The user gives you a raw text (often dictated by voice and full of fillers, missing punctuation, or typos). Your ONLY job is to clean it up:

- Fix typos and obvious spelling errors
- Add appropriate punctuation and paragraph breaks
- Remove filler words ("um", "uh", "like", "you know", repetitions)
- Normalize whitespace
- Keep the EXACT meaning, tone, and information

DO NOT:
- Summarize or shorten
- Add new content, opinions, or interpretation
- Change the writer's voice or style
- Translate

Output ONLY the cleaned text. No preamble, no explanation, no quotes around it.`
        : `あなたはテキスト整形ツールです。ユーザーは未整形のテキスト（多くは音声入力で、フィラー・句読点抜け・誤字を含む）を渡してきます。あなたの仕事は **整形のみ**:

- 誤字脱字を直す
- 適切な句読点と段落分けを入れる
- フィラー（「えーと」「あの」「まあ」「なんていうか」、繰り返し）を除去
- 余分な空白・改行を正規化
- 意味・トーン・情報は **完全に保つ**

禁止事項:
- 要約・短縮
- 内容の追加・意見・解釈
- 書き手の口調・スタイルの変更
- 翻訳

出力は **整形済みテキストのみ**。前置き・説明・引用符は付けない。`

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
