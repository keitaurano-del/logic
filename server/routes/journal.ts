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
Summarize the user's morning check-in warmly, concisely, and forward-looking.

Output format (within 200 English words):
- A one-line read on today's condition
- 1-2 bullet points on what to focus on today
- A short, supportive cheer message at the end

Stay positive, never judgmental. Don't repeat raw inputs verbatim.`
        : `あなたは Logic アプリのパーソナルアシスタント「${name}」です。
コンサルタント1年目のユーザーが入力した今日の情報を、温かく・前向きに・簡潔にまとめてください。

以下の形式でまとめてください（200字以内）:
- 今日のコンディション一言
- 今日意識すべきポイント（箇条書き1〜2点）
- アシスタントからの一言応援メッセージ

ポジティブに、決めつけずに。入力をそのままコピーしないでください。`

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
        max_tokens: 600,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
      })
      const summary = response.content[0].type === 'text' ? response.content[0].text.trim() : ''
      res.json({ summary })
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

  return router
}
