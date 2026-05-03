import { Router } from 'express'
import type Anthropic from '@anthropic-ai/sdk'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { RateLimitRequestHandler } from 'express-rate-limit'

// =============================================
// AI_GEN クォータ定数
// =============================================
const AI_GEN_LIMIT_STANDARD = 30   // スタンダードプラン: 月30問
const AI_GEN_LIMIT_AI_PLAN  = 300  // AI付きプラン: 月300問

async function checkAndIncrementAIQuota(
  supabase: SupabaseClient,
  userId: string | undefined,
  guestId: string | undefined,
): Promise<{ allowed: boolean; reason?: string }> {
  // ゲストユーザーは制限あり（日に5問）
  if (!userId && !guestId) return { allowed: true }
  if (!userId) return { allowed: true } // ゲスト: レートリミッタのみ

  try {
    const now = new Date()
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

    const { data: profile } = await supabase
      .from('profiles')
      .select('ai_gen_count, ai_gen_month, plan')
      .eq('id', userId)
      .single()

    const currentPlan = profile?.plan ?? 'free'
    const isBetaCampaign = currentPlan === 'beta_campaign' || currentPlan === 'premium_yearly'
    const isAIPlan = isBetaCampaign || currentPlan === 'premium_monthly'
    const limit = isAIPlan ? AI_GEN_LIMIT_AI_PLAN : AI_GEN_LIMIT_STANDARD

    const savedMonth = profile?.ai_gen_month ?? ''
    const count = savedMonth === monthKey ? (profile?.ai_gen_count ?? 0) : 0

    if (count >= limit) {
      return { allowed: false, reason: `今月のAI問題生成上限（${limit}問）に達しました。来月またはプランをアップグレードしてください。` }
    }

    await supabase.from('profiles').upsert(
      { id: userId, ai_gen_count: count + 1, ai_gen_month: monthKey },
      { onConflict: 'id' },
    )
    return { allowed: true }
  } catch {
    // DBエラー時は通す（クォータはベストエフォート）
    return { allowed: true }
  }
}

// =============================================
// createProblemsRouter
// =============================================
export function createProblemsRouter(
  anthropic: Anthropic,
  supabase: SupabaseClient,
  flashcardsLimiter: RateLimitRequestHandler,
  generateProblemsLimiter: RateLimitRequestHandler,
  dailyProblemLimiter: RateLimitRequestHandler,
): Router {
  const router = Router()

  // =============================================
  // フラッシュカードAI生成
  // =============================================
  router.post('/api/flashcards/generate', flashcardsLimiter, async (req, res) => {
    const { wrongAnswers, category, lessonTitle, locale } = req.body
    const isEn = locale === 'en'

    const systemPromptJa = `あなたは学習支援AIです。ユーザーが間違えた問題や苦手な分野をもとに、復習用のフラッシュカードを生成してください。

## ルール
- 各カードは「表面（質問）」と「裏面（解答+簡潔な解説）」で構成
- 間違えた問題の周辺知識や関連概念もカバーする
- 暗記しやすい短い表現にする
- 似た概念の違いを問うカードも作る
- 5〜8枚生成する

## 出力形式（JSONのみ）
[
  {"front": "質問文", "back": "解答と簡潔な解説"}
]`

    const systemPromptEn = `You are a learning-support AI. Based on the user's wrong answers and weak areas, generate review flashcards.

## Rules
- Each card has a "front" (question) and a "back" (answer + brief explanation)
- Cover related concepts and adjacent knowledge, not just the literal wrong answers
- Use short, memorable phrasing
- Include cards that contrast similar concepts
- Generate 5 to 8 cards
- Respond in English

## Output (JSON only)
[
  {"front": "Question", "back": "Answer with brief explanation"}
]`

    const wrongList = wrongAnswers
      .map((w: { question: string; correctAnswer: string }, i: number) =>
        isEn
          ? `${i + 1}. Question: ${w.question}\n   Correct answer: ${w.correctAnswer}`
          : `${i + 1}. 問題: ${w.question}\n   正解: ${w.correctAnswer}`,
      )
      .join('\n')

    const userMessage = isEn
      ? `Category: ${category}\nLesson: ${lessonTitle}\n\nWrong answers:\n${wrongList}\n\nBased on these weak areas, please generate review flashcards.`
      : `カテゴリ: ${category}\nレッスン: ${lessonTitle}\n\n間違えた問題:\n${wrongList}\n\nこれらの苦手分野に基づいて、復習用フラッシュカードを生成してください。`

    try {
      const response = await anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1000,
        system: isEn ? systemPromptEn : systemPromptJa,
        messages: [{ role: 'user', content: userMessage }],
      })

      const text = response.content[0].type === 'text' ? response.content[0].text : ''
      const jsonMatch = text.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        const cards = JSON.parse(jsonMatch[0])
        res.json({ cards })
      } else {
        throw new Error('Invalid JSON')
      }
    } catch (error) {
      console.error('Flashcard API error:', error)
      res.status(500).json({ error: isEn ? 'Failed to generate flashcards' : 'カード生成に失敗しました' })
    }
  })

  // =============================================
  // 学習ジャーナル生成
  // =============================================
  router.post('/api/journal/generate', generateProblemsLimiter, async (req, res) => {
    try {
      const { date, completedLessons = [], flashcardStats = { correct: 0, total: 0 }, studyMinutes = 0, locale } = req.body || {}
      const isEn = locale === 'en'

      const lessonsList = completedLessons.length ? completedLessons.join(', ') : (isEn ? '(none)' : '（なし）')
      const cardInfo = flashcardStats.total > 0
        ? (isEn
            ? `Flashcards: ${flashcardStats.correct} mastered / ${flashcardStats.total} total`
            : `フラッシュカード: ${flashcardStats.correct}枚習得 / 全${flashcardStats.total}枚`)
        : (isEn ? 'Flashcards: none' : 'フラッシュカード: なし')

      const promptJa = `あなたは温かく寄り添う学習コーチです。以下の今日の学習内容を見て、ユーザーの学びを100文字程度で振り返り、明日への具体的なアドバイスを1文添えてください。励ましの口調で、絵文字は使わないでください。

【日付】${date}
【完了レッスン】${lessonsList}
【${cardInfo}】
【学習時間】${studyMinutes}分`

      const promptEn = `You are a warm, supportive learning coach. Look at today's study summary, write a ~50-word reflection on what the user accomplished, and add one concrete piece of advice for tomorrow. Use an encouraging tone. Do not use emoji.

[Date] ${date}
[Completed lessons] ${lessonsList}
[${cardInfo}]
[Study time] ${studyMinutes} minutes`

      const response = await anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 400,
        messages: [{ role: 'user', content: isEn ? promptEn : promptJa }],
      })

      const text = response.content
        .filter((b: { type: string }) => b.type === 'text')
        .map((b: { type: string; text?: string }) => (b as { type: string; text: string }).text)
        .join('')

      res.json({ summary: text.trim() })
    } catch (e: unknown) {
      console.error('journal generate error:', e)
      res.status(500).json({ error: e instanceof Error ? e.message : String(e) })
    }
  })

  // =============================================
  // AI問題ジェネレーター
  // =============================================
  router.post('/api/generate-problems', generateProblemsLimiter, async (req, res) => {
    try {
      const { prompt = '', locale } = req.body || {}
      const userId = (req.body as { userId?: string }).userId
      const guestId = (req.body as { guestId?: string }).guestId

      // クォータチェック (BETA_MODE中はスキップ)
      if (process.env.BETA_MODE !== 'true') {
        const quota = await checkAndIncrementAIQuota(supabase, userId, guestId)
        if (!quota.allowed) {
          return res.status(429).json({ error: quota.reason })
        }
      }
      if (typeof prompt !== 'string' || prompt.length > 2000) {
        return res.status(400).json({ error: 'Prompt too long' })
      }
      if (!prompt || prompt.length < 5) {
        return res.status(400).json({ error: 'prompt is required' })
      }
      const isEn = locale === 'en'

      const systemPromptJa = `あなたはビジネス思考・ロジカルシンキング・フェルミ推定の学習問題作成のプロフェッショナルです。
ユーザーのリクエストに基づいて、実践的な4択クイズ問題を作成します。

必ず以下のJSON形式のみで返してください。他のテキストは一切含めないでください:

{
  "title": "問題セットのタイトル（30文字以内）",
  "category": "カテゴリー（例: ロジカルシンキング）",
  "steps": [
    {
      "type": "explain",
      "title": "概念の確認",
      "content": "この問題セットで扱う概念や考え方の要点（150文字程度）"
    },
    {
      "type": "quiz",
      "question": "問題文（具体的な場面・状況を設定した問題）",
      "options": [
        { "label": "選択肢1", "correct": false },
        { "label": "選択肢2", "correct": true },
        { "label": "選択肢3", "correct": false },
        { "label": "選択肢4", "correct": false }
      ],
      "explanation": "なぜこの答えが正しいかの解説（100文字程度）。他の選択肢が違う理由も含める。"
    }
  ]
}

ルール:
- 最初のステップは必ずexplainで概念を整理する
- 各クイズは必ず4つの選択肢を持つ
- 正解は1つだけ
- 問題は日常・ビジネスの具体的な場面で考えさせる（抽象的な定義問題は避ける）
- 解説は「なぜ他が違うか」まで丁寧に説明する
- ユーザーが指定した数だけ問題を作る（指定がなければ3問）
- 日本語で出力`

      const systemPromptEn = `You are a professional question writer for business and logical-thinking practice.
Based on the user's request, create 4-choice quiz questions.

Respond ONLY with the following JSON. No other text.

{
  "title": "Quiz set title (30 chars or less)",
  "category": "Category (e.g. Logical Thinking)",
  "steps": [
    {
      "type": "quiz",
      "question": "Question text",
      "options": [
        { "label": "Option 1", "correct": false },
        { "label": "Option 2", "correct": true },
        { "label": "Option 3", "correct": false },
        { "label": "Option 4", "correct": false }
      ],
      "explanation": "Educational explanation (~50 words). Touch on why the wrong options are wrong."
    }
  ]
}

Rules:
- Each question has exactly 4 options
- Exactly one correct answer
- Generate the number requested (default 3)
- Use precise terminology
- Output in English`

      const systemPrompt = isEn ? systemPromptEn : systemPromptJa

      const response = await anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1500,
        system: systemPrompt,
        messages: [{ role: 'user', content: prompt }],
      })

      const text = response.content
        .filter((b: { type: string }) => b.type === 'text')
        .map((b: { type: string; text?: string }) => (b as { type: string; text: string }).text)
        .join('')
        .trim()

      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        return res.status(500).json({ error: 'AI response parse failed' })
      }
      const data = JSON.parse(jsonMatch[0])

      res.json({
        title: data.title || (isEn ? 'AI Problems' : 'AI生成問題'),
        category: data.category || (isEn ? 'AI Generated' : 'AI生成'),
        steps: data.steps || [],
      })
    } catch (e: unknown) {
      console.error('generate-problems error:', e)
      res.status(500).json({ error: e instanceof Error ? e.message : String(e) })
    }
  })

  // =============================================
  // AI問題 — ユーザー作成問題を全件保存
  // =============================================
  router.post('/api/user-problems/save', async (req, res) => {
    try {
      const { userId, guestId, problem } = req.body as { userId?: string; guestId?: string; problem: Record<string, unknown> }
      if (!problem) return res.status(400).json({ error: 'problem required' })
      if (supabase) {
        await supabase.from('user_ai_problems').insert({
          user_id: userId || null,
          guest_id: guestId || null,
          problem_json: problem,
          prompt: problem.prompt || '',
          title: problem.title || '',
          created_at: new Date().toISOString(),
        })
      }
      res.json({ ok: true })
    } catch (e: unknown) {
      console.error('user-problems/save error:', e)
      res.status(500).json({ error: e instanceof Error ? e.message : String(e) })
    }
  })

  // =============================================
  // AI問題 — 評価（星・コメント）保存
  // =============================================
  router.post('/api/user-problems/rate', async (req, res) => {
    try {
      const { userId, guestId, problemId, rating, comment } = req.body as { userId?: string; guestId?: string; problemId: number; rating: number; comment?: string }
      if (!problemId || !rating) return res.status(400).json({ error: 'problemId and rating required' })
      if (supabase) {
        await supabase.from('user_ai_problem_ratings').insert({
          user_id: userId || null,
          guest_id: guestId || null,
          problem_id: problemId,
          rating,
          comment: comment || '',
          created_at: new Date().toISOString(),
        })
      }
      res.json({ ok: true })
    } catch (e: unknown) {
      console.error('user-problems/rate error:', e)
      res.status(500).json({ error: e instanceof Error ? e.message : String(e) })
    }
  })

  // =============================================
  // 今日の1問
  // =============================================
  router.post('/api/daily-problem', dailyProblemLimiter, async (req, res) => {
    try {
      const isEn = req.body?.locale === 'en'

      const themesJa = [
        'MECEを使った問題分解',
        'ロジックツリーで原因を特定する',
        'So What / Why So の使い方',
        'ピラミッド原則で結論を伝える',
        '帰納法と演繹法の違い',
        '仮説思考のステップ',
        'クリティカルシンキングの実践',
        'フレームワーク思考の活用',
        '前提を疑う問いの立て方',
        '構造化のテクニック',
        'ロジカルシンキングのケーススタディ',
        '問題の本質を見抜く方法',
      ]
      const themesEn = [
        'Decomposing problems with MECE',
        'Finding root causes with a logic tree',
        'How to use So What / Why So',
        'Communicating conclusions with the Pyramid Principle',
        'The difference between induction and deduction',
        'Steps of hypothesis-driven thinking',
        'Practical critical thinking',
        'Applying framework-based thinking',
        'Asking questions that challenge assumptions',
        'Techniques for structuring information',
        'Logical thinking case studies',
        'How to see the essence of a problem',
      ]
      const themes = isEn ? themesEn : themesJa
      const theme = themes[Math.floor(Math.random() * themes.length)]

      const prompt = isEn
        ? `Create exactly one 4-choice quiz question about "${theme}" that trains a working professional's logical thinking. Use a realistic everyday business scenario.`
        : `「${theme}」について、ビジネスパーソンの論理的思考力を鍛える4択問題を1問だけ作ってください。\n日常のビジネスシーンを想定した実践的な問題にしてください。`

      const systemPromptJa = `あなたは論理的思考力を鍛える問題作成AIです。
必ず以下のJSON形式のみで返してください:
{
  "title": "問題タイトル(20文字以内)",
  "category": "ロジカルシンキング",
  "steps": [
    {
      "type": "quiz",
      "question": "問題文",
      "options": [
        { "label": "選択肢1", "correct": false },
        { "label": "選択肢2", "correct": true },
        { "label": "選択肢3", "correct": false },
        { "label": "選択肢4", "correct": false }
      ],
      "explanation": "解説(なぜ正解か、他の選択肢のどこが間違いか)"
    }
  ]
}`

      const systemPromptEn = `You are an AI that creates logical-thinking practice questions.
Respond ONLY with the following JSON:
{
  "title": "Title (20 chars or less)",
  "category": "Logical Thinking",
  "steps": [
    {
      "type": "quiz",
      "question": "Question text",
      "options": [
        { "label": "Option 1", "correct": false },
        { "label": "Option 2", "correct": true },
        { "label": "Option 3", "correct": false },
        { "label": "Option 4", "correct": false }
      ],
      "explanation": "Explanation: why the right answer is right and what the wrong options miss"
    }
  ]
}
Respond in English.`

      const systemPrompt = isEn ? systemPromptEn : systemPromptJa

      const response = await anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1000,
        system: systemPrompt,
        messages: [{ role: 'user', content: prompt }],
      })

      const text = response.content
        .filter((b: { type: string }) => b.type === 'text')
        .map((b: { type: string; text?: string }) => (b as { type: string; text: string }).text)
        .join('')
        .trim()

      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) return res.status(500).json({ error: 'parse failed' })
      res.json(JSON.parse(jsonMatch[0]))
    } catch (e: unknown) {
      console.error('daily-problem error:', e)
      res.status(500).json({ error: e instanceof Error ? e.message : String(e) })
    }
  })

  return router
}
