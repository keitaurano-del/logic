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
      } = req.body || {}
      const isEn = locale === 'en'
      const name = sanitizeAssistantName(assistantName, isEn ? 'your assistant' : 'パーソナルアシスタント')

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

      const systemPrompt = isEn
        ? `You are "${name}", a personal assistant inside the Logic app for a first-year consultant.
Look at the user's recent activity holistically — active goals, journal entries, lesson progress, and Fermi-estimation practice — and give grounded, encouraging feedback in 250 English words or less.

Structure:
- 1-2 lines: read of current momentum
- 2-3 lines: what's going well across the signals
- 2-3 lines: one or two concrete next steps that connect goals, journal patterns, and lesson activity

Stay warm and specific. Never lecture. Use the user's evidence, not generic advice.`
        : `あなたは Logic アプリのパーソナルアシスタント「${name}」です。
ユーザー（コンサル1年目）の最近の活動 — アクティブな目標・ジャーナル・レッスン進捗・フェルミ推定の実施状況 — を総合的に見て、根拠のある励ましのフィードバックを 300 字以内でしてください。

構成:
- 1〜2行：今のモメンタムの読み取り
- 2〜3行：複数シグナルから見て良い点
- 2〜3行：目標・ジャーナル・レッスンを結びつけた具体的な次の一歩を1〜2つ

温かく具体的に。一般論ではなくユーザー自身のデータを根拠に。説教しない。`

      const userMessage = isEn
        ? `## Active goals
${goalsText}

## Recent journals (up to last 30 days)
${journalText}

## Lesson progress by category
${progressText}

## Fermi sessions this month: ${fermi}
## Lesson streak: ${streak} days
## Total study days: ${sDays}`
        : `## アクティブな目標
${goalsText}

## 最近のジャーナル（直近 30 日まで）
${journalText}

## カテゴリ別レッスン進捗
${progressText}

## 今月のフェルミ実施: ${fermi} 回
## レッスン連続日数: ${streak} 日
## 累計学習日数: ${sDays} 日`

      const response = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
      })
      const feedback = response.content[0].type === 'text' ? response.content[0].text.trim() : ''
      res.json({ feedback })
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
