import express, { type Request } from 'express'
import cors from 'cors'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import Anthropic from '@anthropic-ai/sdk'
import Stripe from 'stripe'
import rateLimit from 'express-rate-limit'
import { createClient } from '@supabase/supabase-js'
import nodemailer from 'nodemailer'

// Supabase サーバーサイドクライアント（service role key 使用）
const supabaseUrl = process.env.SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
if (!supabaseUrl) console.warn('[WARN] SUPABASE_URL is not set — Supabase features will be disabled')
const supabase = supabaseUrl
  ? createClient(supabaseUrl, supabaseKey)
  : null as unknown as ReturnType<typeof createClient>

const stripeKey = process.env.STRIPE_SECRET_KEY
const stripe = stripeKey ? new Stripe(stripeKey) : null

// 起動時マイグレーション: feedbackテーブルの自動作成 (SCRUM-69)
async function ensureFeedbackTable() {
  if (!supabase) return
  try {
    const { error } = await supabase.from('feedback').select('id').limit(1)
    if (error?.code === '42P01') {
      // テーブルが存在しない → Supabase Management APIで作成するには別途のアクセストークンが必要なためログのみ
      console.warn('[MIGRATION] feedback table not found. Please run supabase/migrations/004_feedback.sql in Supabase Dashboard.')
    } else {
      console.log('[MIGRATION] feedback table: ok')
    }
  } catch (_e) {
    console.warn('[MIGRATION] Could not check feedback table:', _e)
  }
}

// feedbackテーブルの代替チェック
// Supabaseダッシュボードで SQL Editor から実行:
// CREATE TABLE IF NOT EXISTS feedback (
//   id bigserial primary key,
//   category text not null default 'その他',
//   message text not null,
//   locale text not null default 'ja',
//   created_at timestamptz not null default now()
// );
// ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
// CREATE POLICY "Anyone can insert feedback" ON feedback FOR INSERT WITH CHECK (true);
// CREATE POLICY "Service role can read feedback" ON feedback FOR SELECT USING (auth.role() = 'service_role');

type PlanKey = 'monthly' | 'yearly' | 'standard_monthly' | 'standard_yearly' | 'premium_monthly' | 'premium_yearly' | 'beta_campaign'
const PLANS: Record<PlanKey, { priceId: string; amount: number; interval: 'month' | 'year' }> = {
  monthly: {
    priceId: process.env.STRIPE_PRICE_STANDARD_MONTHLY || process.env.STRIPE_PRICE_MONTHLY || '',
    amount: 500,
    interval: 'month',
  },
  yearly: {
    priceId: process.env.STRIPE_PRICE_STANDARD_YEARLY || process.env.STRIPE_PRICE_YEARLY || '',
    amount: 3500,
    interval: 'year',
  },
  standard_monthly: {
    priceId: process.env.STRIPE_PRICE_STANDARD_MONTHLY || process.env.STRIPE_PRICE_MONTHLY || '',
    amount: 500,
    interval: 'month',
  },
  standard_yearly: {
    priceId: process.env.STRIPE_PRICE_STANDARD_YEARLY || process.env.STRIPE_PRICE_YEARLY || '',
    amount: 3500,
    interval: 'year',
  },
  premium_monthly: {
    priceId: process.env.STRIPE_PRICE_PREMIUM_MONTHLY || '',
    amount: 980,
    interval: 'month',
  },
  premium_yearly: {
    priceId: process.env.STRIPE_PRICE_PREMIUM_YEARLY || '',
    amount: 6980,
    interval: 'year',
  },
  // ベータキャンペーン: AI生成包含全機能・年題¥1,980（7日トライアル）
  beta_campaign: {
    priceId: process.env.STRIPE_PRICE_BETA_CAMPAIGN || process.env.STRIPE_PRICE_PREMIUM_YEARLY || '',
    amount: 1980,
    interval: 'year',
  },
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

// Render / proxied environments: trust the first hop so X-Forwarded-For is honored
// (without this all requests look like they come from the load balancer = no per-IP limiting).
app.set('trust proxy', 1)

app.use(cors())

// Stripe Webhook は RAW ボディが必要なので、先にルート定義する
app.post(
  '/api/stripe/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET
    let event: Stripe.Event

    if (webhookSecret) {
      const sig = req.headers['stripe-signature'] as string
      try {
        if (!stripe) return res.status(503).json({ error: 'Stripe not configured' })
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret)
      } catch (err: any) {
        console.error('[webhook] Signature verification failed:', err.message)
        return res.status(400).json({ error: `Webhook error: ${err.message}` })
      }
    } else {
      // STRIPE_WEBHOOK_SECRET 未設定時は署名検証をスキップ（開発用）
      try {
        event = JSON.parse(req.body.toString()) as Stripe.Event
      } catch {
        return res.status(400).json({ error: 'Invalid JSON' })
      }
    }

    try {
      switch (event.type) {
        case 'customer.subscription.created':
        case 'customer.subscription.updated': {
          const sub = event.data.object as Stripe.Subscription
          const customerId = sub.customer as string
          const plan = sub.items.data[0]?.price?.recurring?.interval === 'year' ? 'yearly' : 'monthly'
          const periodEnd = new Date(sub.current_period_end * 1000).toISOString()

          // customer_id → user_id を profiles テーブルから取得
          const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('stripe_customer_id', customerId)
            .single()

          if (profile?.id) {
            await supabase.from('subscriptions').upsert(
              {
                user_id: profile.id,
                stripe_customer_id: customerId,
                stripe_subscription_id: sub.id,
                plan,
                status: sub.status === 'active' ? 'active' : sub.status,
                current_period_end: periodEnd,
              },
              { onConflict: 'user_id' }
            )
          }
          break
        }

        case 'customer.subscription.deleted': {
          const sub = event.data.object as Stripe.Subscription
          const customerId = sub.customer as string

          const { data: profile } = await supabase
            .from('profiles')
            .select('id')
            .eq('stripe_customer_id', customerId)
            .single()

          if (profile?.id) {
            await supabase
              .from('subscriptions')
              .update({ plan: 'free', status: 'inactive' })
              .eq('user_id', profile.id)
          }
          break
        }

        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session
          const customerId = session.customer as string
          const userId = session.metadata?.userId || session.client_reference_id

          if (userId && customerId) {
            await supabase
              .from('profiles')
              .upsert({ id: userId, stripe_customer_id: customerId }, { onConflict: 'id' })
          }
          break
        }

        default:
          console.log(`[webhook] Unhandled event type: ${event.type}`)
      }

      res.json({ received: true })
    } catch (e: any) {
      console.error('[webhook] Handler error:', e)
      res.status(500).json({ error: e.message })
    }
  }
)

app.use(express.json({ limit: '1mb' }))

const client = new Anthropic()

// =============================================
// レート制限ミドルウェア
// =============================================
// すべて IP ベース。`req.body.locale` を見て ja/en メッセージを切り替える。
// クライアント側 src/usageTracker.ts の補完。ブラウザクリアでバイパスできない真のバックストップ。
// メモリストアなので Render の単一インスタンス前提。
function makeLimiter(opts: {
  windowMs: number
  max: number
  msgJa: string
  msgEn: string
}) {
  return rateLimit({
    windowMs: opts.windowMs,
    max: opts.max,
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req: Request, res) => {
      const locale = (req.body && typeof req.body === 'object' && (req.body as { locale?: string }).locale) || 'ja'
      res.status(429).json({
        error: locale === 'en' ? opts.msgEn : opts.msgJa,
        retryAfter: Math.ceil(opts.windowMs / 1000),
      })
    },
  })
}

// グローバル: 全 /api/* に対し 1 分 100 req のスパム防御
const globalApiLimiter = makeLimiter({
  windowMs: 60 * 1000,
  max: 100,
  msgJa: 'リクエストが多すぎます。少し待ってからもう一度お試しください。',
  msgEn: 'Too many requests. Please wait a moment and try again.',
})

// 重い AI エンドポイント用
const roleplayTurnLimiter = makeLimiter({
  windowMs: 60 * 1000,
  max: 20,
  msgJa: 'ロールプレイのリクエストが多すぎます。1 分待ってからお試しください。',
  msgEn: 'Too many roleplay requests. Please wait a minute and try again.',
})

const fermiLimiter = makeLimiter({
  windowMs: 60 * 1000,
  max: 15,
  msgJa: 'フェルミ推定のリクエストが多すぎます。1 分待ってからお試しください。',
  msgEn: 'Too many Fermi requests. Please wait a minute and try again.',
})

const generateProblemsLimiter = makeLimiter({
  windowMs: 60 * 60 * 1000,
  max: 30,
  msgJa: '問題生成のリクエストが多すぎます。しばらく待ってからお試しください。',
  msgEn: 'Too many problem generation requests. Please try again later.',
})

const dailyProblemLimiter = makeLimiter({
  windowMs: 24 * 60 * 60 * 1000,
  max: 5,
  msgJa: '今日のデイリー問題は既に取得済みです。明日また挑戦してください。',
  msgEn: 'You have already fetched today\'s daily problem. Try again tomorrow.',
})

const flashcardsLimiter = makeLimiter({
  windowMs: 60 * 60 * 1000,
  max: 20,
  msgJa: 'フラッシュカード生成のリクエストが多すぎます。しばらく待ってからお試しください。',
  msgEn: 'Too many flashcard generation requests. Please try again later.',
})

// グローバル制限を /api/* に適用 (ヘルスチェックは除外)
app.use((req, res, next) => {
  if (req.path === '/api/health') return next()
  if (req.path.startsWith('/api/')) return globalApiLimiter(req, res, next)
  return next()
})

// =============================================
// ロールプレイ会話
// =============================================
app.post('/api/roleplay/chat', roleplayTurnLimiter, async (req, res) => {
  const { messages, setup, locale } = req.body
  const isEn = locale === 'en'
  const { template, format, partner, goal, context } = setup

  const formatLabel = isEn
    ? (format === 'online' ? 'online meeting' : 'in-person')
    : (format === 'online' ? 'オンライン会議' : '対面')

  const systemPromptJa = template.mode === 'presentation'
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

  const systemPromptEn = template.mode === 'presentation'
    ? `You are playing the role of a presentation audience.
Setup:
- Audience: ${partner.name} (${partner.role})
- Format: ${formatLabel}
- Audience interests: ${partner.interests}
- Audience concerns: ${partner.concerns}
${goal ? `- Presentation topic: ${goal}` : ''}
${context ? `- Additional context: ${context}` : ''}

Rules:
- Behave naturally as an audience member
- Ask appropriate questions or push back during the presentation
- Acknowledge strong points
- Ask for specifics when something is vague
- Keep each turn to 2-4 sentences
- Respond in English`
    : `You are playing the character "${partner.name}" in a roleplay.
Setup:
- Role: ${partner.role}${partner.company ? ` (${partner.company})` : ''}
- Personality: ${partner.personality}
- Interests: ${partner.interests}
- Concerns: ${partner.concerns}
- Scene: ${template.title}
- Format: ${formatLabel}
${goal ? `- User's goal: ${goal}` : ''}
${context ? `- Additional context: ${context}` : ''}

Rules:
- Stay in character as ${partner.name}
- Reflect the personality, interests and concerns in every response
- Ask specific clarifying questions or push back on the user's statements
- Don't agree easily — test the user's logic
- Keep each turn to 2-4 sentences
- Respond in English`

  const systemPrompt = isEn ? systemPromptEn : systemPromptJa

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      system: systemPrompt,
      messages,
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    res.json({ role: 'assistant', content: text })
  } catch (error) {
    console.error('Chat API error:', error)
    res.status(500).json({ error: isEn ? 'Failed to generate AI response' : 'AI応答の生成に失敗しました' })
  }
})

// =============================================
// ロールプレイ自動進行ターン (AI セリフ + ユーザー選択肢)
// =============================================
app.post('/api/roleplay/turn', roleplayTurnLimiter, async (req, res) => {
  const { messages, setup, turnNumber, maxTurns, locale } = req.body as {
    messages: { role: string; content: string }[]
    setup: { template: { title: string }; partner: { name: string; role: string; personality: string; interests: string; concerns: string }; goal: string; context: string }
    turnNumber: number
    maxTurns: number
    locale?: string
  }
  const isEn = locale === 'en'
  const { template, partner, goal, context } = setup
  const isFirst = !messages || messages.length === 0
  const isLast = turnNumber >= maxTurns

  const systemPromptJa = `あなたはロールプレイのナレーター兼キャラクター演者です。場面で「${partner.name}」(${partner.role})を演じます。

## キャラクター設定
- 性格: ${partner.personality}
- 関心事: ${partner.interests}
- 懸念事項: ${partner.concerns}
- 場面: ${template.title}
${goal ? `- ユーザーのゴール: ${goal}` : ''}
${context ? `- 状況: ${context}` : ''}

## ターン情報
- 現在 ${turnNumber}/${maxTurns} ターン目
${isFirst ? '- これは最初のターン。ユーザーへの問いかけや状況提示から始めること。' : ''}
${isLast ? '- これが最後のターン。会話を締めくくるセリフにすること。' : ''}

## 出力ルール
必ず以下の JSON 形式のみで出力 (前後に余計なテキストを入れない):
{
  "partner": "${partner.name}のセリフ (2〜4文、自然な日本語)",
  "choices": [
    "ユーザーの返答候補A (15〜40文字、論理的に良い返答)",
    "ユーザーの返答候補B (15〜40文字、迷いやすい平凡な返答)",
    "ユーザーの返答候補C (15〜40文字、避けたい悪い返答)"
  ]
}

## 選択肢ルール
- 必ず 3 つの選択肢を提示する`

  const systemPromptEn = `You are the narrator and character actor for a roleplay. You will play "${partner.name}" (${partner.role}) in this scene.

## Character setup
- Personality: ${partner.personality}
- Interests: ${partner.interests}
- Concerns: ${partner.concerns}
- Scene: ${template.title}
${goal ? `- User's goal: ${goal}` : ''}
${context ? `- Situation: ${context}` : ''}

## Turn info
- Current turn: ${turnNumber}/${maxTurns}
${isFirst ? '- This is the first turn. Start by setting the scene or asking a question.' : ''}
${isLast ? '- This is the final turn. Wrap up the conversation.' : ''}

## Output rules
Respond ONLY with the following JSON (no extra text before or after):
{
  "partner": "${partner.name}'s line (2-4 sentences, natural English)",
  "choices": [
    "User response option A (15-40 words, the logically strong answer)",
    "User response option B (15-40 words, an average / hesitant answer)",
    "User response option C (15-40 words, the weak / emotional answer to avoid)"
  ]
}

## Choice rules
- Always provide exactly 3 choices`

  const tailJa = `
- 選択肢は「論理的に強い」「中間」「弱い/感情的」のバランスでバリエーションを持たせる
- ${isLast ? '最終ターンでも choices は 3 つ用意する (会話を締めくくる返答案として)' : ''}`
  const tailEn = `
- Vary the choices: "logically strong", "average", "weak/emotional"
- ${isLast ? 'Provide 3 choices even on the final turn (closing-line options)' : ''}`
  const systemPrompt = (isEn ? systemPromptEn : systemPromptJa) + (isEn ? tailEn : tailJa)

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      system: systemPrompt,
      messages: isFirst ? [{ role: 'user', content: '(開始)' }] : messages,
    })
    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('Invalid JSON response')
    const parsed = JSON.parse(jsonMatch[0])
    res.json({ partner: parsed.partner, choices: parsed.choices, done: isLast })
  } catch (error) {
    console.error('Turn API error:', error)
    res.status(500).json({ error: isEn ? 'Failed to generate the next turn' : 'ターン生成に失敗しました' })
  }
})

// =============================================
// ロールプレイ採点
// =============================================
app.post('/api/roleplay/score', roleplayTurnLimiter, async (req, res) => {
  const { messages, setup, historySummary, locale } = req.body
  const isEn = locale === 'en'
  const { template, partner, goal } = setup

  const categoriesJa = template.mode === 'presentation'
    ? ['論理構成', '説得力', '簡潔さ', '対応力', '印象']
    : ['コミュニケーション', '論理性', '交渉力', '具体性', '目標達成']
  const categoriesEn = template.mode === 'presentation'
    ? ['Logical Structure', 'Persuasiveness', 'Conciseness', 'Adaptability', 'Impression']
    : ['Communication', 'Logical Rigor', 'Negotiation', 'Specificity', 'Goal Achievement']
  const categories = isEn ? categoriesEn : categoriesJa

  const historySectionJa = historySummary
    ? `\n\n## ユーザーの過去の練習履歴\n${historySummary}\n\n上記の履歴を踏まえて、ユーザーの癖や傾向にも言及してください。改善している点は褒め、繰り返し指摘されている課題には具体的な改善方法を提案してください。`
    : ''
  const historySectionEn = historySummary
    ? `\n\n## User's past practice history\n${historySummary}\n\nReference this history when scoring. Praise areas of improvement, and offer concrete fixes for recurring weaknesses.`
    : ''
  const historySection = isEn ? historySectionEn : historySectionJa

  const systemPromptJa = `あなたはビジネスコミュニケーションの採点者です。以下のロールプレイ会話を採点してください。

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

  const systemPromptEn = `You are a business communication evaluator. Score the following roleplay conversation.

## Scenario
- Scene: ${template.title}
- Counterpart: ${partner.name} (${partner.role})
- Counterpart personality: ${partner.personality}
- Counterpart interests: ${partner.interests}
${goal ? `- User's goal: ${goal}` : ''}
${historySection}

## Scoring criteria
Score the following ${categories.length} categories on a 10-point scale:
${categories.map((c, i) => `${i + 1}. ${c}`).join('\n')}

## Output format
Respond ONLY with the following JSON (no extra text):
{
  "scores": [
    {"name": "Category name", "score": number, "maxScore": 10, "feedback": "Specific feedback in 1-2 sentences"}
  ],
  "overall": "Overall feedback in 3-5 sentences. Include strengths, weaknesses, and concrete advice for next time. Reference history and growth if history is provided."
}`

  const systemPrompt = isEn ? systemPromptEn : systemPromptJa

  const youLabel = isEn ? '[User]' : '【ユーザー】'
  const conversationText = messages
    .map((m: { role: string; content: string }) =>
      m.role === 'user' ? `${youLabel}${m.content}` : (isEn ? `[${partner.name}]${m.content}` : `【${partner.name}】${m.content}`)
    )
    .join('\n')

  const userInstruction = isEn
    ? `Please score the following conversation:\n\n${conversationText}`
    : `以下の会話を採点してください:\n\n${conversationText}`

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 800,
      system: systemPrompt,
      messages: [{ role: 'user', content: userInstruction }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0])
      res.json(result)
    } else {
      throw new Error('Invalid JSON response')
    }
  } catch (error) {
    console.error('Score API error:', error)
    res.status(500).json({ error: isEn ? 'Failed to score the conversation' : '採点に失敗しました' })
  }
})

// =============================================
// フラッシュカードAI生成
// =============================================
app.post('/api/flashcards/generate', flashcardsLimiter, async (req, res) => {
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
        : `${i + 1}. 問題: ${w.question}\n   正解: ${w.correctAnswer}`)
    .join('\n')

  const userMessage = isEn
    ? `Category: ${category}\nLesson: ${lessonTitle}\n\nWrong answers:\n${wrongList}\n\nBased on these weak areas, please generate review flashcards.`
    : `カテゴリ: ${category}\nレッスン: ${lessonTitle}\n\n間違えた問題:\n${wrongList}\n\nこれらの苦手分野に基づいて、復習用フラッシュカードを生成してください。`

  try {
    const response = await client.messages.create({
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
// 会話サマリー生成
// =============================================
app.post('/api/roleplay/summary', roleplayTurnLimiter, async (req, res) => {
  const { messages, setup, locale } = req.body
  const isEn = locale === 'en'
  const { template, partner, goal } = setup

  const conversationText = messages
    .map((m: { role: string; content: string }) =>
      m.role === 'user'
        ? (isEn ? `[User]${m.content}` : `【ユーザー】${m.content}`)
        : (isEn ? `[${partner.name}]${m.content}` : `【${partner.name}】${m.content}`)
    )
    .join('\n')

  const systemPromptJa = `あなたはビジネスコミュニケーションのコーチです。以下のロールプレイ会話を分析し、整理されたサマリーを作成してください。

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

  const systemPromptEn = `You are a business communication coach. Analyze the following roleplay conversation and produce a structured summary.

## Scenario
- Scene: ${template.title}
- Counterpart: ${partner.name} (${partner.role})
${goal ? `- Goal: ${goal}` : ''}

## Output (JSON only, English)
{
  "summary": "3-5 sentence summary of the conversation, what was discussed, and the conclusion reached",
  "keyPoints": ["3-5 important points the user made"],
  "improvements": ["2-3 areas to improve next time"],
  "goodPoints": ["2-3 strengths"]
}`

  const userInstruction = isEn
    ? `Please summarize the following conversation:\n\n${conversationText}`
    : `以下の会話をサマリーしてください:\n\n${conversationText}`

  try {
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 600,
      system: isEn ? systemPromptEn : systemPromptJa,
      messages: [{ role: 'user', content: userInstruction }],
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
    res.status(500).json({ error: isEn ? 'Failed to summarize the conversation' : 'サマリー生成に失敗しました' })
  }
})

// =============================================
// 学習ジャーナル生成
// =============================================
app.post('/api/journal/generate', generateProblemsLimiter, async (req, res) => {
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

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      messages: [{ role: 'user', content: isEn ? promptEn : promptJa }],
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
// AI生成クォータ管理 (SCRUM-120)
// AI付きプラン: 月300問、ベータキャンペーン: 無制限
const AI_GEN_LIMIT_STANDARD = 30   // スタンダードプラン: 月〉8差に丸めて月30問
const AI_GEN_LIMIT_AI_PLAN  = 300  // AI付きプラン: 月300問

async function checkAndIncrementAIQuota(userId: string | undefined, guestId: string | undefined): Promise<{ allowed: boolean; reason?: string }> {
  // ゲストユーザーは制限あり（日に5問）
  if (!userId && !guestId) return { allowed: true } // レートリミッタがかかる
  if (!userId) return { allowed: true } // ゲスト: レートリミッタのみ

  try {
    const now = new Date()
    const monthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

    // profilesからクォータ情報とプランを取得
    const { data: profile } = await supabase
      .from('profiles')
      .select('ai_gen_count, ai_gen_month, plan')
      .eq('id', userId)
      .single()

    const currentPlan = profile?.plan ?? 'free'
    const isBetaCampaign = currentPlan === 'beta_campaign' || currentPlan === 'premium_yearly'
    const isAIPlan = isBetaCampaign || currentPlan === 'premium_monthly'
    const limit = isAIPlan ? AI_GEN_LIMIT_AI_PLAN : AI_GEN_LIMIT_STANDARD

    // 月をリセット
    const savedMonth = profile?.ai_gen_month ?? ''
    const count = savedMonth === monthKey ? (profile?.ai_gen_count ?? 0) : 0

    if (count >= limit) {
      return { allowed: false, reason: `今月のAI問題生成上限（${limit}問）に達しました。来月またはプランをアップグレードしてください。` }
    }

    // インクリメント
    await supabase.from('profiles').upsert(
      { id: userId, ai_gen_count: count + 1, ai_gen_month: monthKey },
      { onConflict: 'id' }
    )
    return { allowed: true }
  } catch (_e) {
    // DBエラー時は通す（クォータはベストエフォート）
    return { allowed: true }
  }
}

app.post('/api/generate-problems', generateProblemsLimiter, async (req, res) => {
  try {
    const { prompt = '', locale } = req.body || {}
    const userId = (req.body as { userId?: string }).userId
    const guestId = (req.body as { guestId?: string }).guestId

    // クォータチェック (BETA_MODE中はスキップ)
    if (process.env.BETA_MODE !== 'true') {
      const quota = await checkAndIncrementAIQuota(userId, guestId)
      if (!quota.allowed) {
        return res.status(429).json({ error: quota.reason })
      }
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

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1500,
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
      title: data.title || (isEn ? 'AI Problems' : 'AI生成問題'),
      category: data.category || (isEn ? 'AI Generated' : 'AI生成'),
      steps: data.steps || [],
    })
  } catch (e: any) {
    console.error('generate-problems error:', e)
    res.status(500).json({ error: e.message || 'failed' })
  }
})

// 静的ファイル（public/ → dist/）は配信する
const distPath = path.resolve(__dirname, '..', 'dist')
app.use(express.static(distPath))

// Web UI — / と /auth/callback は SPA の index.html を返す
app.get('/', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'))
})
app.get('/auth/callback', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'))
})

// =============================================
// フェルミ推定 — フィードバック生成
// =============================================
app.post('/api/fermi/feedback', fermiLimiter, async (req, res) => {
  try {
    const { question, userInput, locale } = req.body || {}
    if (!question || !userInput) {
      return res.status(400).json({ error: 'question and userInput required' })
    }
    const isEn = locale === 'en'

    const systemPromptJa = `あなたはロジカルシンキングのコーチです。フェルミ推定を学ぶユーザーの分解プロセスにフィードバックを返し、最後に**実際の概算解と計算ロジックを提示**します。

ルール:
- 励まし (「いいですね」「素晴らしい」) で必ず始める
- 評価の主軸は「分解の構造」と「視点の網羅性」
- 数値の正誤を断罪しない (「ここを ◯◯ にするとより精度が上がる」のように建設的に)
- **必ず最後に「概算解」セクションで実際の数字と計算式を提示する**
  - 各ステップで使う前提値 (人口、世帯数、頻度など) を明示
  - 掛け算/割り算を順番に展開
  - 最終的な数字 (◯◯ 万、◯◯ 億 など) を太字で結論
  - 既知の実際値 (政府統計・業界データなど) があれば併記し、概算と比較
- 日本語で、合計 600〜800 字程度

出力フォーマット (この見出しを必ず使う):

## 良かった視点
- (1〜2 個、具体的にどこが良いか)

## 別の視点
- (1 個、見落としやすい切り口を提案)

## 概算解と計算ロジック
**前提値**: (使う数字をリスト)

**計算**:
1. (式の第 1 ステップ + 数字)
2. (第 2 ステップ + 数字)
3. (第 3 ステップ + 数字)
4. (第 4 ステップ、必要なら)

**概算結果**: 約 ◯◯◯ (単位)

**実際の値 (参考)**: 約 ◯◯◯ (出典が分かれば併記、不明なら省略可)

**ひとこと**: (前提を変えるとどうなるか、精度をどう上げられるか、1〜2 文)`

    const systemPromptEn = `You are a logical-thinking coach. Provide feedback on a user's Fermi estimation, AND finish by **showing the actual estimated answer with the full calculation logic**.

Rules:
- Always begin with encouragement ("Nice work", "Great start")
- Evaluate decomposition structure and breadth of perspectives
- Do not bluntly grade numerical accuracy — instead say "this assumption could be tightened to..."
- **You MUST end with a "Worked answer" section that includes the actual number and the math**
  - List the input assumptions (population, households, frequency, etc.)
  - Show each multiplication/division step in order
  - State the final number in bold (e.g. ~50,000)
  - If a known real value exists (govt or industry data), compare it to your estimate
- Respond in English, ~400-500 words total

Output format (use these exact headings):

## Strong points
- (1-2 specific things the user did well)

## Another angle
- (1 perspective that is easy to miss)

## Worked answer
**Assumptions**: (list the input numbers)

**Calculation**:
1. (Step 1 with the math)
2. (Step 2 with the math)
3. (Step 3 with the math)
4. (Step 4 if needed)

**Estimate**: ~ N (unit)

**Real value (reference)**: ~ N (cite if known, otherwise omit)

**One note**: (how would the answer shift if one assumption changed; 1-2 sentences)`

    const userMessage = isEn
      ? `Question: ${question}\n\nUser's decomposition:\n${userInput}\n\nPlease give feedback on this decomposition.`
      : `問題: ${question}\n\nユーザーの分解:\n${userInput}\n\nこの分解にフィードバックをお願いします。`

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 700,
      system: isEn ? systemPromptEn : systemPromptJa,
      messages: [{ role: 'user', content: userMessage }],
    })
    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    res.json({ feedback: text })
  } catch (e: any) {
    console.error('fermi feedback error:', e)
    res.status(500).json({ error: e.message || 'failed' })
  }
})

// =============================================
// フェルミ推定 — AI 問題生成 (premium)
// =============================================
app.post('/api/fermi/question', fermiLimiter, async (req, res) => {
  try {
    const isEn = req.body?.locale === 'en'
    const userPrompt = isEn
      ? 'Generate exactly one Fermi estimation problem in English. Pick something from everyday Western/global business or society that is good for decomposition practice. Return only the question on a single line — no preface, no explanation.'
      : 'フェルミ推定の問題を 1 問だけ日本語で生成してください。日常的な日本の社会・経済に関する問いで、分解思考の練習に適したものを出してください。問題文のみを 1 行で返してください。前置きや説明は不要です。'

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 200,
      messages: [{ role: 'user', content: userPrompt }],
    })
    const text = response.content[0].type === 'text' ? response.content[0].text.trim() : ''
    res.json({ question: text })
  } catch (e: any) {
    console.error('fermi question error:', e)
    res.status(500).json({ error: e.message || 'failed' })
  }
})

// =============================================
// プレイスメントテスト — Supabase 版
// =============================================

app.post('/api/placement/submit', async (req, res) => {
  try {
    const { guestId, nickname, deviation, correctCount, totalCount } = req.body || {}
    if (!guestId || typeof deviation !== 'number') {
      return res.status(400).json({ error: 'guestId and deviation required' })
    }

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      // Supabase 未設定時はファイルベースにフォールバック
      return res.status(503).json({ error: 'Supabase not configured' })
    }

    const { error } = await supabase.from('placement_results').upsert(
      {
        guest_id: guestId,
        nickname: (nickname || 'ゲスト').slice(0, 20),
        deviation,
        correct_count: correctCount || 0,
        total_count: totalCount || 0,
        completed_at: new Date().toISOString(),
      },
      { onConflict: 'guest_id' }
    )

    if (error) {
      console.error('[placement/submit] Supabase error:', error.message)
      return res.status(500).json({ error: error.message })
    }

    res.json({ ok: true })
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

app.post('/api/placement/delete', async (req, res) => {
  try {
    const { guestId } = req.body || {}
    if (!guestId) return res.status(400).json({ error: 'guestId required' })

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return res.status(503).json({ error: 'Supabase not configured' })
    }

    const { error } = await supabase
      .from('placement_results')
      .delete()
      .eq('guest_id', guestId)

    if (error) {
      console.error('[placement/delete] Supabase error:', error.message)
      return res.status(500).json({ error: error.message })
    }

    res.json({ ok: true })
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

app.get('/api/placement/ranking', async (req, res) => {
  try {
    const guestId = (req.query.guestId as string) || ''

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return res.status(503).json({ error: 'Supabase not configured' })
    }

    const { data, error } = await supabase
      .from('placement_results')
      .select('guest_id, nickname, deviation, correct_count, total_count')
      .gt('total_count', 0)  // スキップユーザー除外
      .order('deviation', { ascending: false })

    if (error) {
      console.error('[placement/ranking] Supabase error:', error.message)
      return res.status(500).json({ error: error.message })
    }

    const entries = data || []
    const total = entries.length
    const top = entries.slice(0, 50).map((e: any, i: number) => ({
      rank: i + 1,
      nickname: e.nickname,
      deviation: e.deviation,
      isYou: e.guest_id === guestId,
    }))

    let yourRank = -1
    let yourDeviation = -1
    if (guestId) {
      const idx = entries.findIndex((e: any) => e.guest_id === guestId)
      if (idx >= 0) {
        yourRank = idx + 1
        yourDeviation = (entries[idx] as any).deviation
      }
    }

    res.json({ total, top, yourRank, yourDeviation })
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

// =============================================
// 問題報告 — Supabase 版
// =============================================

// Jira チケット作成ヘルパー
async function jiraCreateIssue(opts: {
  summary: string
  description: string
  issueType?: string
}): Promise<{ key: string } | null> {
  const jiraUrl = process.env.JIRA_URL
  const jiraEmail = process.env.JIRA_EMAIL
  const jiraToken = process.env.JIRA_API_TOKEN
  const jiraProject = process.env.JIRA_PROJECT_KEY

  if (!jiraUrl || !jiraEmail || !jiraToken || !jiraProject) {
    console.log('[jira] JIRA env vars not set — skipping ticket creation')
    return null
  }

  try {
    const auth = Buffer.from(`${jiraEmail}:${jiraToken}`).toString('base64')
    const response = await fetch(`${jiraUrl}/rest/api/3/issue`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        fields: {
          project: { key: jiraProject },
          summary: opts.summary,
          description: {
            type: 'doc',
            version: 1,
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: opts.description }],
              },
            ],
          },
          issuetype: { name: opts.issueType || 'Bug' },
        },
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error('[jira] Failed to create issue:', response.status, errText)
      return null
    }

    const data = (await response.json()) as { key: string }
    console.log('[jira] Created issue:', data.key)
    return data
  } catch (e: any) {
    console.error('[jira] Error creating issue:', e.message)
    return null
  }
}

app.post('/api/report-problem', async (req, res) => {
  try {
    const { lessonTitle, lessonId, question, options, issueType, comment } = req.body || {}

    if (!question || !issueType) {
      return res.status(400).json({ error: 'question and issueType are required' })
    }

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return res.status(503).json({ error: 'Supabase not configured' })
    }

    const { data, error } = await supabase
      .from('reports')
      .insert({
        lesson_title: lessonTitle || '',
        lesson_id: lessonId || null,
        question,
        options: options || [],
        issue_type: issueType,
        comment: comment || '',
      })
      .select('id')
      .single()

    if (error) {
      console.error('[report-problem] Supabase error:', error.message)
      return res.status(500).json({ error: error.message })
    }

    console.log('[REPORT]', issueType, '-', lessonTitle, '-', question.slice(0, 50))

    // メール送信を試みる
    try {
      const smtpHost = process.env.SMTP_HOST
      const smtpUser = process.env.SMTP_USER
      const smtpPass = process.env.SMTP_PASS
      const reportEmail = process.env.REPORT_EMAIL

      if (smtpHost && smtpUser && smtpPass && reportEmail) {
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: parseInt(process.env.SMTP_PORT || '587', 10),
          secure: false,
          auth: { user: smtpUser, pass: smtpPass },
        })
        await transporter.sendMail({
          from: smtpUser,
          to: reportEmail,
          subject: `[Logic] 問題報告: ${issueType} — ${lessonTitle || '不明'}`,
          text: [
            `問題報告が届きました。`,
            ``,
            `レッスン: ${lessonTitle || '不明'} (ID: ${lessonId || '-'})`,
            `種別: ${issueType}`,
            `問題文: ${question}`,
            `コメント: ${comment || '(なし)'}`,
            ``,
            `Supabase report ID: ${data?.id || '-'}`,
          ].join('\n'),
        })
        console.log('[REPORT] Email sent to', reportEmail)
      } else {
        console.log('[REPORT] TODO: configure SMTP_HOST, SMTP_USER, SMTP_PASS, REPORT_EMAIL to enable email notifications')
      }
    } catch (emailErr: any) {
      console.warn('[REPORT] Email send failed (non-fatal):', emailErr.message)
    }

    // Jira チケット作成を試みる
    await jiraCreateIssue({
      summary: `[Logic] ${issueType}: ${(question || '').slice(0, 80)}`,
      description: [
        `レッスン: ${lessonTitle || '不明'} (ID: ${lessonId || '-'})`,
        `種別: ${issueType}`,
        `問題文: ${question}`,
        `コメント: ${comment || '(なし)'}`,
        `Supabase ID: ${data?.id || '-'}`,
      ].join('\n'),
      issueType: 'Bug',
    })

    res.json({ ok: true, id: data?.id })
  } catch (e: any) {
    console.error('report-problem error:', e)
    res.status(500).json({ error: e.message || 'failed' })
  }
})

app.get('/api/reports', async (_req, res) => {
  try {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return res.json([])
    }

    const { data, error } = await supabase
      .from('reports')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[reports] Supabase error:', error.message)
      return res.status(500).json({ error: error.message })
    }

    res.json(data || [])
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
    const { plan: rawPlan, guestId, userId, trial, betaCampaign } = req.body as { plan: PlanKey; guestId?: string; userId?: string; trial?: boolean; betaCampaign?: boolean }
    const plan: PlanKey = betaCampaign ? 'beta_campaign' : rawPlan
    if (!PLANS[plan]) return res.status(400).json({ error: 'invalid plan' })
    const planConfig = PLANS[plan]
    if (!planConfig.priceId) return res.status(503).json({ error: 'price not configured' })

    // 認証済みユーザーの場合、既存の stripe_customer_id を確認して再利用
    let customerId: string | undefined
    if (userId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('stripe_customer_id')
        .eq('id', userId)
        .single()

      if (profile?.stripe_customer_id) {
        customerId = profile.stripe_customer_id
      } else {
        // 新規 Stripe Customer 作成
        const customer = await stripe.customers.create({
          metadata: { userId },
        })
        customerId = customer.id
        // profiles に保存
        await supabase
          .from('profiles')
          .upsert({ id: userId, stripe_customer_id: customerId }, { onConflict: 'id' })
      }
    }

    const origin = (req.headers.origin as string) || `http://${req.headers.host}`
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      payment_method_collection: 'if_required',
      line_items: [{ price: planConfig.priceId, quantity: 1 }],
      ...(trial !== false ? { subscription_data: { trial_period_days: 7 } } : {}),
      success_url: `${origin}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?checkout=cancel`,
      metadata: { guestId: guestId || '', plan, userId: userId || '' },
      client_reference_id: userId || guestId || undefined,
      ...(customerId ? { customer: customerId } : {}),
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
// Stripe Customer Portal
// =============================================
app.post('/api/subscription/portal', async (req, res) => {
  if (!stripe) return res.status(503).json({ error: 'Stripe not configured' })
  try {
    const { userId } = req.body as { userId?: string }
    if (!userId) return res.status(400).json({ error: 'userId required' })

    // profiles から stripe_customer_id を取得
    const { data: profile } = await supabase
      .from('profiles')
      .select('stripe_customer_id')
      .eq('id', userId)
      .single()

    if (!profile?.stripe_customer_id) {
      return res.status(404).json({ error: 'Stripe customer not found' })
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: profile.stripe_customer_id,
      return_url: 'https://logic-taupe.vercel.app',
    })

    res.json({ url: portalSession.url })
  } catch (e: any) {
    console.error('portal error:', e)
    res.status(500).json({ error: e.message })
  }
})

// =============================================
// Stripe Subscription Cancel
// =============================================
app.post('/api/subscription/cancel', async (req, res) => {
  if (!stripe) return res.status(503).json({ error: 'Stripe not configured' })
  try {
    const { userId } = req.body as { userId?: string }
    if (!userId) return res.status(400).json({ error: 'userId required' })

    // subscriptions テーブルから stripe_subscription_id を取得
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('stripe_subscription_id')
      .eq('user_id', userId)
      .single()

    if (!sub?.stripe_subscription_id) {
      return res.status(404).json({ error: 'Subscription not found' })
    }

    // Stripe でサブスクをキャンセル
    await stripe.subscriptions.cancel(sub.stripe_subscription_id)

    // Supabase を更新
    await supabase
      .from('subscriptions')
      .update({ plan: 'free', status: 'inactive' })
      .eq('user_id', userId)

    res.json({ success: true })
  } catch (e: any) {
    console.error('cancel error:', e)
    res.status(500).json({ error: e.message })
  }
})

// =============================================
// 今日の1問
// =============================================
app.post('/api/daily-problem', dailyProblemLimiter, async (req, res) => {
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
      : `「${theme}」について、ビジネスパーソンの論理的思考力を鍛える4択問題を1問だけ作ってください。
日常のビジネスシーンを想定した実践的な問題にしてください。`

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

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1000,
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

// =============================================
// デイリーフェルミ — Supabase キャッシュ付き
// =============================================
app.get('/api/daily-fermi', async (req, res) => {
  try {
    const locale = (req.query.locale as string) || 'ja'
    const isEn = locale === 'en'
    const today = new Date().toISOString().slice(0, 10) // YYYY-MM-DD

    // Supabase から今日の問題を確認
    if (supabase) {
      const { data: existing } = await supabase
        .from('daily_fermi_problems')
        .select('*')
        .eq('date', today)
        .eq('locale', locale)
        .single()

      if (existing) {
        return res.json({ question: existing.question, hint: existing.hint, date: today })
      }
    }

    // 存在しない場合は AI で生成
    const userPrompt = isEn
      ? 'Generate exactly one Fermi estimation problem in English for today. Pick something from everyday Western/global business or society that is good for decomposition practice. Return only the question on a single line — no preface, no explanation.'
      : 'フェルミ推定の問題を 1 問だけ日本語で生成してください。日常的な日本の社会・経済に関する問いで、分解思考の練習に適したものを出してください。問題文のみを 1 行で返してください。前置きや説明は不要です。'

    // まず問題を生成し、それを使ってヒントを生成（問題文をコンテキストとして渡す）
    const questionRes = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 200,
      messages: [{ role: 'user', content: userPrompt }],
    })
    const question = questionRes.content[0].type === 'text' ? questionRes.content[0].text.trim() : ''

    const hintPrompt = isEn
      ? `The following is a Fermi estimation problem: "${question}"\n\nProvide a single short hint (1-2 sentences) explaining how to decompose this specific problem. Be concrete and specific to the question. No preface.`
      : `次のフェルミ推定問題に対する分解ヒントを1〜2文で端的に教えてください。問題に固有の具体的な内容を含め、前置き不要です。\n\n問題：「${question}」`

    const hintRes = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 200,
      messages: [{ role: 'user', content: hintPrompt }],
    })

    const hint = hintRes.content[0].type === 'text' ? hintRes.content[0].text.trim() : ''

    // Supabase に保存 (service role key 使用)
    if (supabase && question) {
      await supabase
        .from('daily_fermi_problems')
        .insert({ date: today, question, hint, locale })
    }

    res.json({ question, hint, date: today })
  } catch (e: any) {
    console.error('daily-fermi error:', e)
    res.status(500).json({ error: e.message || 'failed' })
  }
})

// =============================================
// 管理者: Premium 付与
// =============================================
app.post('/api/admin/grant-premium', async (req, res) => {
  const adminSecret = req.headers['x-admin-secret']
  if (!adminSecret || adminSecret !== process.env.ADMIN_SECRET) {
    return res.status(403).json({ error: 'Forbidden' })
  }

  try {
    const { userId, plan, note } = req.body as { userId: string; plan?: string; note?: string }
    if (!userId) return res.status(400).json({ error: 'userId required' })

    if (!supabase) return res.status(503).json({ error: 'Supabase not configured' })

    const { error } = await supabase
      .from('admin_overrides')
      .upsert(
        {
          user_id: userId,
          plan: plan || 'premium',
          note: note || '',
          granted_by: 'admin-api',
        },
        { onConflict: 'user_id' }
      )

    if (error) {
      console.error('[admin/grant-premium] Supabase error:', error.message)
      return res.status(500).json({ error: error.message })
    }

    console.log('[ADMIN] Granted premium to', userId)
    res.json({ ok: true })
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

// ========================================
// SCRUM-87: In-App フィードバック送信
// ========================================
app.post('/api/feedback', makeLimiter({ windowMs: 60*1000, max: 5 }), async (req, res) => {
  try {
    const { category = 'その他', message = '', locale } = req.body || {}
    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: '内容を入力してください' })
    }
    const isEn = locale === 'en'

    // Supabase に保存
    if (supabase) {
      const { error } = await supabase
        .from('feedback')
        .insert({
          category,
          message: message.trim(),
          locale: locale || 'ja',
          created_at: new Date().toISOString(),
        })
      if (error) {
        // テーブルがなくても無視して成功を返す
        console.warn('[feedback] Supabase insert warning:', error.message)
      }
    }

    res.json({ ok: true, message: isEn ? 'Thank you!' : 'ありがとうございました！' })
  } catch (e: any) {
    console.error('feedback error:', e)
    res.status(500).json({ error: e.message || 'failed' })
  }
})


// それ以外のルート（/api/* 以外）は Play Store 誘導ページを返す
// ※ APIルートが全て定義された後に配置すること（catch-all が先に来るとAPIが塞がれる）
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.keitaurano.logic'
app.get('/{*splat}', (req, res) => {
  // /api/* へのリクエストがここに来た場合は 404 を返す（APIルート未定義の保護）
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' })
  }
  res.send(`<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Logic — ロジカルシンキングを毎日 3 分で</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      display: flex; flex-direction: column; align-items: center;
      justify-content: center; min-height: 100vh;
      background: #F5F1E8; color: #1C1917; text-align: center; padding: 32px 24px;
    }
    .logo { font-size: 3rem; font-weight: 900; letter-spacing: -0.04em; margin-bottom: 12px; }
    .tagline { color: #78716C; font-size: 1.05rem; margin-bottom: 40px; line-height: 1.6; }
    .btn {
      display: inline-block; background: #D4915A; color: #fff; text-decoration: none;
      padding: 16px 36px; border-radius: 14px; font-weight: 700; font-size: 1rem;
    }
    .sub { margin-top: 16px; font-size: 0.8rem; color: #A8A29E; }
  </style>
</head>
<body>
  <div class="logo">Logic</div>
  <p class="tagline">ロジカルシンキングを毎日 3 分で。<br>哲学者たちに学ぶ、論理思考トレーニング。</p>
  <a class="btn" href="${PLAY_STORE_URL}">Google Play でダウンロード</a>
  <p class="sub">Android 向けアプリです</p>
</body>
</html>`)
})

const PORT = parseInt(process.env.PORT || '3001', 10)
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`)
  ensureFeedbackTable().catch(console.warn)
})
