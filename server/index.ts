import express from 'express'
import cors from 'cors'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import Anthropic from '@anthropic-ai/sdk'
import Stripe from 'stripe'

const stripeKey = process.env.STRIPE_SECRET_KEY
const stripe = stripeKey ? new Stripe(stripeKey) : null

type PlanKey = 'monthly' | 'yearly'
const PLANS: Record<PlanKey, { priceId: string; amount: number; interval: 'month' | 'year' }> = {
  monthly: {
    priceId: process.env.STRIPE_PRICE_MONTHLY || '',
    amount: 500,
    interval: 'month',
  },
  yearly: {
    priceId: process.env.STRIPE_PRICE_YEARLY || '',
    amount: 3500,
    interval: 'year',
  },
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
app.use(cors())
app.use(express.json({ limit: '1mb' }))

const client = new Anthropic()

// =============================================
// ロールプレイ会話
// =============================================
app.post('/api/roleplay/chat', async (req, res) => {
  const { messages, setup } = req.body
  const { template, format, partner, goal, context } = setup

  const formatLabel = format === 'online' ? 'オンライン会議' : '対面'

  const systemPrompt = template.mode === 'presentation'
    ? `あなたはプレゼンテーションの聴衆役です。
設定:
- 聴衆: ${partner.name}（${partner.role}）
- 形式: ${formatLabel}
- 聴衆の関心: ${partner.interests}
- 聴衆の懸念: ${partner.concerns}
${goal ? `- プレゼンのテーマ: ${goal}` : ''}
${context ? `- 補足情報: ${context}` : ''}

ルール:
- 聴衆として自然に振る舞う
- プレゼンの途中で適切な質問やツッコミを入れる
- 良い点があれば相槌を打つ
- 曖昧な部分には具体化を求める
- 1回の発言は2〜4文程度に抑える
- 日本語で応答する`
    : `あなたは「${partner.name}」というロールプレイキャラクターです。
設定:
- 役職: ${partner.role}${partner.company ? `（${partner.company}）` : ''}
- 性格: ${partner.personality}
- 関心事: ${partner.interests}
- 懸念事項: ${partner.concerns}
- 場面: ${template.title}
- 形式: ${formatLabel}
${goal ? `- ユーザーのゴール: ${goal}` : ''}
${context ? `- 補足情報: ${context}` : ''}

ルール:
- ${partner.name}として自然に振る舞う
- キャラクターの性格・関心・懸念を反映した応答をする
- 相手の発言に対して具体的な質問やフィードバックを返す
- 簡単に同意せず、相手の主張を試すような質問もする
- 1回の発言は2〜4文程度に抑える
- 日本語で応答する`

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 400,
      system: systemPrompt,
      messages,
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    res.json({ role: 'assistant', content: text })
  } catch (error) {
    console.error('Chat API error:', error)
    res.status(500).json({ error: 'AI応答の生成に失敗しました' })
  }
})

// =============================================
// ロールプレイ採点
// =============================================
app.post('/api/roleplay/score', async (req, res) => {
  const { messages, setup, historySummary } = req.body
  const { template, partner, goal } = setup

  const categories = template.mode === 'presentation'
    ? ['論理構成', '説得力', '簡潔さ', '対応力', '印象']
    : ['コミュニケーション', '論理性', '交渉力', '具体性', '目標達成']

  const historySection = historySummary
    ? `\n\n## ユーザーの過去の練習履歴\n${historySummary}\n\n上記の履歴を踏まえて、ユーザーの癖や傾向にも言及してください。改善している点は褒め、繰り返し指摘されている課題には具体的な改善方法を提案してください。`
    : ''

  const systemPrompt = `あなたはビジネスコミュニケーションの採点者です。以下のロールプレイ会話を採点してください。

## シナリオ情報
- 場面: ${template.title}
- 相手: ${partner.name}（${partner.role}）
- 相手の性格: ${partner.personality}
- 相手の関心: ${partner.interests}
${goal ? `- ユーザーのゴール: ${goal}` : ''}
${historySection}

## 採点基準
以下の${categories.length}カテゴリを各10点満点で採点してください:
${categories.map((c, i) => `${i + 1}. ${c}`).join('\n')}

## 出力形式
必ず以下のJSON形式のみで出力してください（前後に余計なテキストを含めないでください）:
{
  "scores": [
    {"name": "カテゴリ名", "score": 数字, "maxScore": 10, "feedback": "具体的なフィードバック（1〜2文）"}
  ],
  "overall": "総合フィードバック（3〜5文。良い点、改善点、次回へのアドバイスを含める。過去の履歴がある場合は傾向や成長にも言及する）"
}`

  const conversationText = messages
    .map((m: { role: string; content: string }) =>
      m.role === 'user' ? `【ユーザー】${m.content}` : `【${partner.name}】${m.content}`
    )
    .join('\n')

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      system: systemPrompt,
      messages: [{ role: 'user', content: `以下の会話を採点してください:\n\n${conversationText}` }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0])
      res.json(result)
    } else {
      throw new Error('Invalid JSON response')
    }
  } catch (error) {
    console.error('Score API error:', error)
    res.status(500).json({ error: '採点に失敗しました' })
  }
})

// =============================================
// フラッシュカードAI生成
// =============================================
app.post('/api/flashcards/generate', async (req, res) => {
  const { wrongAnswers, category, lessonTitle } = req.body

  const systemPrompt = `あなたは学習支援AIです。ユーザーが間違えた問題や苦手な分野をもとに、復習用のフラッシュカードを生成してください。

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

  const wrongList = wrongAnswers
    .map((w: { question: string; correctAnswer: string }, i: number) =>
      `${i + 1}. 問題: ${w.question}\n   正解: ${w.correctAnswer}`)
    .join('\n')

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      system: systemPrompt,
      messages: [{
        role: 'user',
        content: `カテゴリ: ${category}\nレッスン: ${lessonTitle}\n\n間違えた問題:\n${wrongList}\n\nこれらの苦手分野に基づいて、復習用フラッシュカードを生成してください。`,
      }],
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
    res.status(500).json({ error: 'カード生成に失敗しました' })
  }
})

// =============================================
// 会話サマリー生成
// =============================================
app.post('/api/roleplay/summary', async (req, res) => {
  const { messages, setup } = req.body
  const { template, partner, goal } = setup

  const conversationText = messages
    .map((m: { role: string; content: string }) =>
      m.role === 'user' ? `【ユーザー】${m.content}` : `【${partner.name}】${m.content}`
    )
    .join('\n')

  const systemPrompt = `あなたはビジネスコミュニケーションのコーチです。以下のロールプレイ会話を分析し、整理されたサマリーを作成してください。

## シナリオ
- 場面: ${template.title}
- 相手: ${partner.name}（${partner.role}）
${goal ? `- ゴール: ${goal}` : ''}

## 出力形式（JSONのみ）
{
  "summary": "会話の要約（3〜5文で、何が話し合われたか、どんな結論に至ったかを簡潔に）",
  "keyPoints": ["ユーザーが主張した重要なポイント（3〜5個）"],
  "improvements": ["次回に活かせる改善ポイント（2〜3個）"],
  "goodPoints": ["良かった点（2〜3個）"]
}`

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: systemPrompt,
      messages: [{ role: 'user', content: `以下の会話をサマリーしてください:\n\n${conversationText}` }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      res.json(JSON.parse(jsonMatch[0]))
    } else {
      throw new Error('Invalid JSON')
    }
  } catch (error) {
    console.error('Summary API error:', error)
    res.status(500).json({ error: 'サマリー生成に失敗しました' })
  }
})

// =============================================
// 学習ジャーナル生成
// =============================================
app.post('/api/journal/generate', async (req, res) => {
  try {
    const { date, completedLessons = [], flashcardStats = { correct: 0, total: 0 }, studyMinutes = 0 } = req.body || {}

    const lessonsList = completedLessons.length ? completedLessons.join(', ') : '（なし）'
    const cardInfo = flashcardStats.total > 0
      ? `フラッシュカード: ${flashcardStats.correct}枚習得 / 全${flashcardStats.total}枚`
      : 'フラッシュカード: なし'

    const prompt = `あなたは温かく寄り添う学習コーチです。以下の今日の学習内容を見て、ユーザーの学びを100文字程度で振り返り、明日への具体的なアドバイスを1文添えてください。励ましの口調で、絵文字は使わないでください。

【日付】${date}
【完了レッスン】${lessonsList}
【${cardInfo}】
【学習時間】${studyMinutes}分`

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 400,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = response.content
      .filter((b: any) => b.type === 'text')
      .map((b: any) => (b as any).text)
      .join('')

    res.json({ summary: text.trim() })
  } catch (e: any) {
    console.error('journal generate error:', e)
    res.status(500).json({ error: e.message || 'failed' })
  }
})

// =============================================
// AI問題ジェネレーター
// =============================================
app.post('/api/generate-problems', async (req, res) => {
  try {
    const { prompt = '' } = req.body || {}
    if (!prompt || prompt.length < 5) {
      return res.status(400).json({ error: 'prompt is required' })
    }

    const systemPrompt = `あなたは簿記・会計・ビジネス学習問題の作成プロフェッショナルです。
ユーザーのリクエストに基づいて、4択クイズ問題を作成します。

必ず以下のJSON形式のみで返してください。他のテキストは一切含めないでください:

{
  "title": "問題セットのタイトル（30文字以内）",
  "category": "カテゴリー（例: 簿記2級）",
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
      "explanation": "なぜこの答えが正しいかの解説（100文字程度）"
    }
  ]
}

ルール:
- 各問題は必ず4つの選択肢を持つ
- 正解は1つだけ
- 解説は教育的で、なぜ他の選択肢が違うかも触れる
- ユーザーが指定した数だけ問題を作る（指定がなければ3問）
- 専門用語は正確に
- 日本語で出力`

    const response = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = response.content
      .filter((b: any) => b.type === 'text')
      .map((b: any) => b.text)
      .join('')
      .trim()

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return res.status(500).json({ error: 'AI response parse failed' })
    }
    const data = JSON.parse(jsonMatch[0])

    res.json({
      title: data.title || 'AI生成問題',
      category: data.category || 'AI生成',
      steps: data.steps || [],
    })
  } catch (e: any) {
    console.error('generate-problems error:', e)
    res.status(500).json({ error: e.message || 'failed' })
  }
})

// Serve Vite build output in production
const distPath = path.resolve(__dirname, '..', 'dist')
app.use(express.static(distPath))
app.get('/{*splat}', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'))
})

const REPORTS_FILE = path.join(process.cwd(), 'reports.json')

app.post('/api/report-problem', async (req, res) => {
  try {
    const { lessonTitle, lessonId, question, options, issueType, comment } = req.body || {}

    if (!question || !issueType) {
      return res.status(400).json({ error: 'question and issueType are required' })
    }

    const report = {
      id: 'r_' + Date.now(),
      timestamp: new Date().toISOString(),
      lessonTitle: lessonTitle || '',
      lessonId: lessonId || null,
      question,
      options: options || [],
      issueType,
      comment: comment || '',
    }

    let reports: any[] = []
    try {
      if (fs.existsSync(REPORTS_FILE)) {
        reports = JSON.parse(fs.readFileSync(REPORTS_FILE, 'utf-8'))
      }
    } catch { /* ignore */ }

    reports.push(report)
    fs.writeFileSync(REPORTS_FILE, JSON.stringify(reports, null, 2))

    console.log('[REPORT]', issueType, '-', lessonTitle, '-', question.slice(0, 50))
    res.json({ ok: true, id: report.id })
  } catch (e: any) {
    console.error('report-problem error:', e)
    res.status(500).json({ error: e.message || 'failed' })
  }
})

app.get('/api/reports', (_req, res) => {
  try {
    if (!fs.existsSync(REPORTS_FILE)) return res.json([])
    const reports = JSON.parse(fs.readFileSync(REPORTS_FILE, 'utf-8'))
    res.json(reports)
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

// =============================================
// Stripe Checkout
// =============================================
app.post('/api/checkout', async (req, res) => {
  if (!stripe) return res.status(503).json({ error: 'Stripe not configured' })
  try {
    const { plan, guestId } = req.body as { plan: PlanKey; guestId?: string }
    if (!PLANS[plan]) return res.status(400).json({ error: 'invalid plan' })
    const planConfig = PLANS[plan]
    if (!planConfig.priceId) return res.status(503).json({ error: 'price not configured' })

    const origin = (req.headers.origin as string) || `http://${req.headers.host}`
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: planConfig.priceId, quantity: 1 }],
      success_url: `${origin}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?checkout=cancel`,
      metadata: { guestId: guestId || '', plan },
      client_reference_id: guestId || undefined,
    })
    res.json({ url: session.url })
  } catch (e: any) {
    console.error('checkout error:', e)
    res.status(500).json({ error: e.message })
  }
})

app.get('/api/checkout-verify', async (req, res) => {
  if (!stripe) return res.status(503).json({ error: 'Stripe not configured' })
  try {
    const sessionId = req.query.session_id as string
    if (!sessionId) return res.status(400).json({ error: 'session_id required' })
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    const plan = (session.metadata?.plan as PlanKey) || 'monthly'
    const expiresAt = new Date()
    if (plan === 'yearly') expiresAt.setFullYear(expiresAt.getFullYear() + 1)
    else expiresAt.setMonth(expiresAt.getMonth() + 1)
    res.json({
      paid: session.payment_status === 'paid',
      plan,
      expiresAt: expiresAt.toISOString(),
    })
  } catch (e: any) {
    console.error('checkout-verify error:', e)
    res.status(500).json({ error: e.message })
  }
})

// =============================================
// 今日の1問
// =============================================
app.post('/api/daily-problem', async (_req, res) => {
  try {
    const themes = [
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
    const theme = themes[Math.floor(Math.random() * themes.length)]

    const prompt = `「${theme}」について、ビジネスパーソンの論理的思考力を鍛える4択問題を1問だけ作ってください。
日常のビジネスシーンを想定した実践的な問題にしてください。`

    const systemPrompt = `あなたは論理的思考力を鍛える問題作成AIです。
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

    const response = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 2048,
      system: systemPrompt,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = response.content
      .filter((b: any) => b.type === 'text')
      .map((b: any) => b.text)
      .join('')
      .trim()

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return res.status(500).json({ error: 'parse failed' })
    res.json(JSON.parse(jsonMatch[0]))
  } catch (e: any) {
    console.error('daily-problem error:', e)
    res.status(500).json({ error: e.message })
  }
})

const PORT = parseInt(process.env.PORT || '3001', 10)
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
