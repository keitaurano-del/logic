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
import { google } from 'googleapis'
import { GoogleAuth } from 'google-auth-library'

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

type PlanKey = 'monthly' | 'yearly' | 'basic_monthly' | 'basic_yearly' | 'standard_monthly' | 'standard_yearly' | 'premium_monthly' | 'premium_yearly' | 'beta_campaign'
const PLANS: Record<PlanKey, { priceId: string; amount: number; interval: 'month' | 'year' }> = {
  monthly: {
    priceId: process.env.STRIPE_PRICE_STANDARD_MONTHLY || process.env.STRIPE_PRICE_MONTHLY || '',
    amount: 650,
    interval: 'month',
  },
  yearly: {
    priceId: process.env.STRIPE_PRICE_STANDARD_YEARLY || process.env.STRIPE_PRICE_YEARLY || '',
    amount: 4550,
    interval: 'year',
  },
  basic_monthly: {
    priceId: process.env.STRIPE_PRICE_BASIC_MONTHLY || '',
    amount: 250,
    interval: 'month',
  },
  basic_yearly: {
    priceId: process.env.STRIPE_PRICE_BASIC_YEARLY || '',
    amount: 1750,
    interval: 'year',
  },
  standard_monthly: {
    priceId: process.env.STRIPE_PRICE_STANDARD_MONTHLY || process.env.STRIPE_PRICE_MONTHLY || '',
    amount: 650,
    interval: 'month',
  },
  standard_yearly: {
    priceId: process.env.STRIPE_PRICE_STANDARD_YEARLY || process.env.STRIPE_PRICE_YEARLY || '',
    amount: 4550,
    interval: 'year',
  },
  premium_monthly: {
    priceId: process.env.STRIPE_PRICE_PREMIUM_MONTHLY || '',
    amount: 980,
    interval: 'month',
  },
  premium_yearly: {
    priceId: process.env.STRIPE_PRICE_PREMIUM_YEARLY || '',
    amount: 6860,
    interval: 'year',
  },
  // ベータキャンペーン: AI生成包含全機能・年題¥1,980（7日トライアル）
  beta_campaign: {
    priceId: process.env.STRIPE_PRICE_BETA_CAMPAIGN || '',
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
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err)
        console.error('[webhook] Signature verification failed:', message)
        return res.status(400).json({ error: `Webhook error: ${message}` })
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
          // Price IDからプランを特定
          const priceId = sub.items.data[0]?.price?.id || ''
          const interval = sub.items.data[0]?.price?.recurring?.interval
          let plan = interval === 'year' ? 'yearly' : 'monthly'
          if (priceId === process.env.STRIPE_PRICE_BASIC_MONTHLY) plan = 'basic_monthly'
          else if (priceId === process.env.STRIPE_PRICE_BASIC_YEARLY) plan = 'basic_yearly'
          else if (priceId === process.env.STRIPE_PRICE_STANDARD_MONTHLY) plan = 'standard_monthly'
          else if (priceId === process.env.STRIPE_PRICE_STANDARD_YEARLY) plan = 'standard_yearly'
          else if (priceId === process.env.STRIPE_PRICE_PREMIUM_MONTHLY) plan = 'premium_monthly'
          else if (priceId === process.env.STRIPE_PRICE_PREMIUM_YEARLY) plan = 'premium_yearly'
          else if (priceId === process.env.STRIPE_PRICE_BETA_CAMPAIGN) plan = 'premium_yearly'
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
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : String(e)
      console.error('[webhook] Handler error:', e)
      res.status(500).json({ error: message })
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

// ─────────────────────────────────────────────
// ロールプレイ固定パターン（AIコスト削減のためパターン化）
// ─────────────────────────────────────────────
const ROLEPLAY_PATTERNS: Record<string, {
  partner: string[]
  choices: string[][]
}> = {
  'why-so-report': {
    partner: [
      'お疲れ様。ちょうど良かった。今進めてる新商品プロジェクト、どうなってる？スケジュール通り進んでるのか、何か問題あるのか、ざっくりで良いから結論をくれ。',
      '82%か。じゃあ残りの18%は何が原因だ？そこが問題の本質だろ。',
      'ニーズの変化はいつ分かったんだ？それを早く教えてくれれば対策もあったんじゃないか。',
      'なるほど。今後どうする？具体的なアクションを聞かせてくれ。',
      '分かった。来週の月曜までに2機能に絞った計画書を持ってきてくれ。以上だ。',
    ],
    choices: [
      [
        '目標の売上見込み1200万円に対し、現在の受注予測が980万円で進捗率は82%です。納期は予定通りですが、顧客ニーズの変化で3機能のうち2機能に絞る必要が出ています。',
        'おおむね順調に進んでいます。チーム一丸となって頑張っていますし、顧客の反応も悪くないと思います。',
        'まだ道半ばという感じで、もう少し時間をいただけると判断できると思います。',
      ],
      [
        '顧客ヒアリングで機能Cは既存ツールで代替できると判明したためです。その分、機能AとBの品質向上に集中できます。',
        '市場環境が変わってきているので、柔軟に対応していく必要があります。',
        'チームの技術的な問題もあり、全部は難しい状況です。',
      ],
      [
        '先週の顧客ヒアリングで判明しました。対策の目処が立ってからご報告しようと考えていましたが、今後は速報ベースで共有します。',
        '少し前から感じていましたが、確信が持てずにいました。',
        'ちょっと様子を見ていました。大丈夫だと思っていたのですが…。',
      ],
      [
        '機能AとBに集中し、来週中に仕様確定。残りのリソースを品質向上に振り向け、納期通りリリースします。機能Cは次フェーズで対応することを顧客にも説明済みです。',
        '引き続き頑張ります。チームと相談しながら最善を尽くします。',
        'もう少し検討させてください。',
      ],
      [
        'ありがとうございます。月曜日に2機能版の計画書と、機能C対応の次フェーズ案もあわせてお持ちします。',
        'はい、準備します。よろしくお願いします。',
        '月曜ですね。なるべく準備します。',
      ],
    ],
  },
  'mece-meeting': {
    partner: [
      '今日の会議のテーマは「来期の売上目標達成策」です。各自意見はあると思いますが、まず論点を整理したいと思います。どこから始めますか？',
      'なるほど。既存顧客と新規顧客に分けて考えるということですね。重複や漏れはないですか？',
      '単価向上の具体的な方法は何が考えられますか？',
      'それらの施策、優先順位はどうつけますか？',
      'では今日のアクションプランをまとめましょう。誰が、何を、いつまでに、という形で。',
    ],
    choices: [
      [
        '売上を「既存顧客」と「新規顧客」に分けて、それぞれ「単価向上」「件数増加」の軸で施策を整理しましょう。漏れなくダブりなく議論できます。',
        'まずは各自が重要だと思う施策を出し合って、そこから絞り込みましょう。',
        'とりあえずブレストから始めて、後で整理しましょうか。',
      ],
      [
        '既存顧客は「アップセル」「クロスセル」「解約防止」の3つ、新規は「リード獲得」「商談化」「成約率向上」で網羅できます。',
        '大体カバーできていると思います。細かいところは後で調整します。',
        '少し重なるところもありますが、まあ大丈夫ではないでしょうか。',
      ],
      [
        '既存顧客へのプレミアムプラン案内と、オプション追加の提案営業が即効性高いです。新規向けには参照価格の見直しも検討できます。',
        '価格を上げるか、付加価値をつけるかのどちらかだと思います。',
        '単価向上は難しいですよね。顧客の反発も考えると慎重にならざるを得ません。',
      ],
      [
        '即効性と実現可能性のマトリクスで評価します。既存顧客アップセルを最優先、次いで成約率向上、単価見直しは中期で取り組みます。',
        '重要なものからやっていく感じで良いと思います。',
        '全部大事なので並行して進めましょう。',
      ],
      [
        '山田さんがアップセル提案書作成（今月末）、田中さんが成約率改善スクリプト見直し（来週金曜）、私がプレミアムプランの価格設計（来週水曜）を担当します。',
        '担当を決めて次回に持ち寄りましょう。',
        'それぞれ頑張りましょう。',
      ],
    ],
  },
  'pyramid-client': {
    partner: [
      'それで、今回の提案の結論は何ですか？最初に教えてください。',
      'コスト削減20%の根拠は何ですか？',
      'リスクはありませんか？導入コストや社内の混乱とか。',
      '競合他社と比べた差別化ポイントは何ですか？',
      '分かりました。次のステップとして何を提案しますか？',
    ],
    choices: [
      [
        '御社の物流コストを年間20%削減し、在庫回転率を1.5倍に改善できます。そのための3つの施策をご提案します。',
        '今日は物流改善の提案を持ってきました。詳しくご説明させてください。',
        '資料を作ってきましたので、順番に説明させてください。',
      ],
      [
        '御社の過去3年のデータと同業他社20社のベンチマークに基づいています。倉庫稼働率が業界平均比15%低く、ここに最大の改善余地があります。',
        '業界の平均的な改善事例から算出しています。',
        '概算ですが、一般的にこのような施策で20%程度の削減が見込めます。',
      ],
      [
        '初期導入コストは約500万円ですが6ヶ月で回収できます。段階的導入と専任サポートで社内混乱を最小化し、移行期間中の生産性低下も試算済みです。',
        'メリットの方が大きいと考えています。一緒に対策を考えましょう。',
        'リスクは低いと思います。他社でも問題なく導入できています。',
      ],
      [
        '既存システムとのシームレスな連携と、導入後12ヶ月の専任サポートです。競合は製品を売って終わりですが、私たちはKPI達成まで伴走します。',
        '価格と品質のバランスが優れていると自負しています。',
        '長年の実績と信頼性が強みです。',
      ],
      [
        '来週中に基幹システムの連携要件を確認させてください。その後2週間で詳細提案書を作成し、月末に意思決定者を交えた場を設けることを提案します。',
        'ご検討いただいて、ご連絡いただければと思います。',
        'またご連絡します。',
      ],
    ],
  },
}

// ロールプレイ自動進行ターン (AI セリフ + ユーザー選択肢)
// =============================================
app.post('/api/roleplay/turn', roleplayTurnLimiter, async (req, res) => {
  const { messages, setup, turnNumber, maxTurns, locale, situationId } = req.body as {
    messages: { role: string; content: string }[]
    setup: { template: { title: string }; category?: string; partner: { name: string; role: string; personality: string; interests: string; concerns: string }; goal: string; context: string }
    turnNumber: number
    maxTurns: number
    locale?: string
    situationId?: string
  }
  // ── パターンモード（AIコスト削減） ──
  const pattern = situationId ? ROLEPLAY_PATTERNS[situationId] : undefined
  if (pattern) {
    const idx = Math.min(turnNumber - 1, pattern.partner.length - 1)
    const partnerLine = pattern.partner[idx] ?? pattern.partner[pattern.partner.length - 1]
    const choiceSet = pattern.choices[idx] ?? pattern.choices[pattern.choices.length - 1]
    const isLast = turnNumber >= maxTurns
    return res.json({ partner: partnerLine, choices: choiceSet, done: isLast })
  }
  const isEn = locale === 'en'
  const { template, partner, goal, context } = setup
  const isPhilosophy = setup.category === 'philosophy'
  const isFirst = !messages || messages.length === 0
  const isLast = turnNumber >= maxTurns

  const philosophyAddendum = isPhilosophy ? `

## 哲学対話モード
- あなたは古代〜近代の著名な哲学者として振る舞う
- 相手の主張に対して必ず「なぜそう言えるか？」「反例はないか？」と問い直す
- 難解な専門用語は使わず、対話形式で深掘りする
- セリフは短く鋭く（2〜3文）
- 選択肢は「深い答え」「無難な答え」「論点をずらす答え」の3種` : ''

  const systemPromptJa = `あなたはロールプレイのナレーター兼キャラクター演者です。場面で「${partner.name}」(${partner.role})を演じます。

## キャラクター設定
- 性格: ${partner.personality}
- 関心事: ${partner.interests}
- 懸念事項: ${partner.concerns}
- 場面: ${template.title}
${goal ? `- ユーザーのゴール: ${goal}` : ''}
${context ? `- 状況: ${context}` : ''}${philosophyAddendum}

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
  } catch (e: unknown) {
    console.error('journal generate error:', e)
    res.status(500).json({ error: e instanceof Error ? e.message : String(e) })
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
  } catch (e: unknown) {
    console.error('generate-problems error:', e)
    res.status(500).json({ error: e instanceof Error ? e.message : String(e) })
  }
})

// =============================================
// AI問題 — ユーザー作成問題を全件保存
// =============================================
app.post('/api/user-problems/save', async (req, res) => {
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
app.post('/api/user-problems/rate', async (req, res) => {
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
    const { question, userInput, locale, hintUsed, elapsedSec } = req.body || {}
    if (!question || !userInput) {
      return res.status(400).json({ error: 'question and userInput required' })
    }
    const isEn = locale === 'en'
    const elapsedMin = Math.round((elapsedSec || 0) / 60)

    const hintPenalty = hintUsed ? 10 : 0
    const timePenalty = elapsedMin >= 5 ? 10 : elapsedMin >= 3 ? 5 : 0

    const systemPromptJa = `あなたはロジカルシンキングのコーチです。フェルミ推定を学ぶユーザーの分解プロセスにフィードバックを返し、スコアを算出し、最後に**実際の概算解と計算ロジックを提示**します。

採点基準 (合計100点):
- 論理的分解の構造 (50点): 要素の網羅性・MECEさ・数値の妥当性
- 思考の独自性 (30点): 新鮮な切り口・意外な視点
- 回答の明確さ (20点): 結論が明確か・計算が追いやすいか
- ヒント使用ペナルティ: ${hintPenalty}点減点
- 解答時間ペナルティ: ${timePenalty}点減点 (解答時間 ${elapsedMin}分)
- 最終スコア = 論理+独自性+明確さ - ペナルティ合計 (0〜100に収める)

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

**ひとこと**: (前提を変えるとどうなるか、精度をどう上げられるか、1〜2 文)

最初の行に必ず以下のJSONを出力してください（マークダウンコードブロック不要、そのまま1行で）:
SCORE_JSON:{"score":<0-100の整数>,"breakdown":"論理性 <x>/50 · 独自性 <y>/30 · 明確さ <z>/20"}
その後に改行して、以下のフィードバック本文を続けてください。

---`

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
      max_tokens: 1400,
      system: isEn ? systemPromptEn : systemPromptJa,
      messages: [{ role: 'user', content: userMessage }],
    })
    const rawText = response.content[0].type === 'text' ? response.content[0].text : ''

    // SCORE_JSON パース
    let score: number | undefined
    let scoreBreakdown: string | undefined
    let feedbackText = rawText
    const scoreMatch = rawText.match(/SCORE_JSON:\s*({.*?})(?:\n|$)/s)
    if (scoreMatch) {
      try {
        const parsed = JSON.parse(scoreMatch[1])
        score = Math.min(100, Math.max(0, Math.round(parsed.score || 0)))
        scoreBreakdown = parsed.breakdown
      } catch { /* ignore */ }
      feedbackText = rawText.replace(/SCORE_JSON:[^\n]*/g, '').trimEnd()
    }
    // ======= DB保存 (non-blocking) =======
    const { guestId, userId } = req.body as { guestId?: string; userId?: string }
    if (supabase) {
      const today = new Date().toISOString().slice(0, 10)
      supabase.from('fermi_answers').insert({
        question_date: today,
        question_text: question,
        user_id: userId || null,
        guest_id: guestId || null,
        user_input: userInput,
        hint_used: hintUsed ?? false,
        elapsed_sec: elapsedSec ?? null,
        score: score ?? null,
        score_breakdown: scoreBreakdown ?? null,
        ai_feedback: feedbackText,
        locale: locale || 'ja',
      }).then(({ error }) => {
        if (error) console.warn('fermi_answers insert error:', error.message)
      })
    }
    // ==========================================

    res.json({ feedback: feedbackText, score, scoreBreakdown })
  } catch (e: unknown) {
    console.error('fermi feedback error:', e)
    res.status(500).json({ error: e instanceof Error ? e.message : String(e) })
  }
})

// =============================================
// フェルミ推定 — 前提確認チャット
// =============================================
app.post('/api/fermi/chat', fermiLimiter, async (req, res) => {
  try {
    const { question, messages, locale } = req.body || {}
    if (!question || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'question and messages required' })
    }
    const isEn = locale === 'en'

    const systemPrompt = isEn
      ? `You are a Fermi estimation coach. The user is working on the following problem:

"${question}"

Your role is to help the user clarify assumptions and think through their decomposition — but you must NOT give away the answer or the final number. You may:
- Confirm or correct factual assumptions (e.g. population figures, market sizes)
- Suggest what factors or categories to consider
- Ask clarifying questions to help them structure their thinking

Keep responses concise (2-4 sentences). Do not solve the problem for them.`
      : `あなたはフェルミ推定のコーチです。ユーザーは以下の問題に取り組んでいます:

「${question}」

あなたの役割は、ユーザーが前提を整理し、分解思考を進められるよう手助けすることです。ただし、答えや最終的な数字を教えてはいけません。以下のことはOKです:
- 事実に基づく前提の確認・修正（人口・市場規模など）
- 考慮すべき要素やカテゴリの提案
- 思考を構造化する質問

回答は簡潔に（2〜4文程度）。問題を解いてあげないこと。`

    // messages: [{role: 'user'|'assistant', content: string}]
    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      system: systemPrompt,
      messages: messages.slice(-10), // 直近10往復まで
    })
    const text = response.content[0].type === 'text' ? response.content[0].text.trim() : ''
    res.json({ reply: text })
  } catch (e: unknown) {
    console.error('fermi chat error:', e)
    res.status(500).json({ error: e instanceof Error ? e.message : String(e) })
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
      : `フェルミ推定の問題を1問だけ日本語で出してください。以下のカテゴリからランダムに選んでください：ビジネス規模・インフラ・消費行動・テクノロジー・社会統計・環境・スポーツ。参加者が分解して考えられる、面白くて意外性のある問題を作ってください。難易度は中級〜上級。問題文のみ1行で返してください（前置き・説明不要）。本日の日付ヒント: ${today}`

    const response = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 200,
      messages: [{ role: 'user', content: userPrompt }],
    })
    const text = response.content[0].type === 'text' ? response.content[0].text.trim() : ''
    res.json({ question: text })
  } catch (e: unknown) {
    console.error('fermi question error:', e)
    res.status(500).json({ error: e instanceof Error ? e.message : String(e) })
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
  } catch (e: unknown) {
    res.status(500).json({ error: e instanceof Error ? e.message : String(e) })
  }
})

// XP・ニックネームの正準ストアを upsert（user_stats）。
// プレースメント未受験のユーザーでも呼べる。
app.post('/api/profile/sync-xp', async (req, res) => {
  try {
    const { guestId, nickname, xp } = req.body || {}
    if (!guestId || typeof xp !== 'number' || xp < 0) {
      return res.status(400).json({ error: 'guestId and non-negative xp required' })
    }

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return res.status(503).json({ error: 'Supabase not configured' })
    }

    const { error } = await supabase.from('user_stats').upsert(
      {
        guest_id: guestId,
        nickname: (nickname || 'ゲスト').slice(0, 20),
        xp,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'guest_id' }
    )

    if (error) {
      console.error('[profile/sync-xp] Supabase error:', error.message)
      return res.status(500).json({ error: error.message })
    }

    res.json({ ok: true })
  } catch (e: unknown) {
    res.status(500).json({ error: e instanceof Error ? e.message : String(e) })
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
  } catch (e: unknown) {
    res.status(500).json({ error: e instanceof Error ? e.message : String(e) })
  }
})

app.get('/api/placement/ranking', async (req, res) => {
  try {
    const guestId = (req.query.guestId as string) || ''

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return res.status(503).json({ error: 'Supabase not configured' })
    }

    const placementsRes = await supabase
      .from('placement_results')
      .select('guest_id, nickname, deviation, correct_count, total_count')
      .gt('total_count', 0)  // スキップユーザー除外
      .order('deviation', { ascending: false })

    if (placementsRes.error) {
      console.error('[placement/ranking] Supabase error:', placementsRes.error.message)
      return res.status(500).json({ error: placementsRes.error.message })
    }

    const placements = placementsRes.data || []
    const total = placements.length
    const top50 = placements.slice(0, 50)

    // user_stats から XP を取得して結合（Migration 009 未適用環境ではフォールバック）
    const xpMap = new Map<string, number>()
    if (top50.length > 0) {
      const ids = top50.map((e: any) => e.guest_id)
      const xpRes = await supabase
        .from('user_stats')
        .select('guest_id, xp')
        .in('guest_id', ids)
      if (xpRes.error) {
        console.warn('[placement/ranking] user_stats join failed (migration 009 未適用?):', xpRes.error.message)
      } else {
        for (const row of (xpRes.data || []) as any[]) {
          xpMap.set(row.guest_id, row.xp || 0)
        }
      }
    }

    const top = top50.map((e: any, i: number) => ({
      rank: i + 1,
      nickname: e.nickname,
      deviation: e.deviation,
      xp: xpMap.get(e.guest_id) || 0,
      isYou: e.guest_id === guestId,
    }))

    let yourRank = -1
    let yourDeviation = -1
    let yourXp = 0
    if (guestId) {
      const idx = placements.findIndex((e: any) => e.guest_id === guestId)
      if (idx >= 0) {
        yourRank = idx + 1
        yourDeviation = (placements[idx] as any).deviation
        // top50 外でも自分の XP は別途取得
        yourXp = xpMap.get(guestId) ?? 0
        if (!xpMap.has(guestId)) {
          const yourXpRes = await supabase
            .from('user_stats')
            .select('xp')
            .eq('guest_id', guestId)
            .maybeSingle()
          if (!yourXpRes.error && yourXpRes.data) {
            yourXp = (yourXpRes.data as any).xp || 0
          }
        }
      }
    }

    res.json({ total, top, yourRank, yourDeviation, yourXp })
  } catch (e: unknown) {
    res.status(500).json({ error: e instanceof Error ? e.message : String(e) })
  }
})

// =============================================
// 問題報告 — Supabase 版
// =============================================

// Jira チケット作成ヘルパー
// Apolloフィードバック通知 — VM上のwebhookサーバーを叫び出し、即座にApolloに分析させる
async function notifyApollo(payload: { category: string; message: string; jiraKey?: string }): Promise<void> {
  const webhookUrl = process.env.APOLLO_WEBHOOK_URL
  const webhookSecret = process.env.APOLLO_FEEDBACK_SECRET || 'apollo-logic-2026'
  if (!webhookUrl) {
    // fallback: 本番環境変数未設定の場合はスキップ
    console.log('[apollo] APOLLO_WEBHOOK_URL not set — skipping real-time notification')
    return
  }
  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-apollo-secret': webhookSecret,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5000), // 5秒タイムアウト（非同期ウェイト）
    })
    console.log('[apollo] notified:', payload.category)
  } catch (e: unknown) {
    console.warn('[apollo] notify failed (non-fatal):', (e as Error).message)
  }
}

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
  } catch (e: unknown) {
    console.error('[jira] Error creating issue:', e instanceof Error ? e.message : String(e))
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

    const appSource = process.env.APP_ENV === 'sit' ? 'sit' : 'production'
    const { data, error } = await supabase
      .from('reports')
      .insert({
        lesson_title: lessonTitle || '',
        lesson_id: lessonId || null,
        question,
        options: options || [],
        issue_type: issueType,
        comment: comment || '',
        source: appSource,
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
    const reportJiraResult = await jiraCreateIssue({
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

    // Apolloに即座通知 — リアルタイム分析・改善提案
    notifyApollo({
      category: issueType,
      message: `レッスン[${lessonTitle || '不明'}] ${question}${comment ? ' / ' + comment : ''}`,
      jiraKey: reportJiraResult?.key,
    }).catch(() => {})

    res.json({ ok: true, id: data?.id })
  } catch (e: unknown) {
    console.error('report-problem error:', e)
    res.status(500).json({ error: e instanceof Error ? e.message : String(e) })
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
  } catch (e: unknown) {
    res.status(500).json({ error: e instanceof Error ? e.message : String(e) })
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
  } catch (e: unknown) {
    console.error('checkout error:', e)
    res.status(500).json({ error: e instanceof Error ? e.message : String(e) })
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
  } catch (e: unknown) {
    console.error('checkout-verify error:', e)
    res.status(500).json({ error: e instanceof Error ? e.message : String(e) })
  }
})

// =============================================
// Google Play Billing Verify (SCRUM-116)
// =============================================
app.post('/api/billing/verify', async (req, res) => {
  try {
    const { purchaseToken, productId, userId } = req.body as {
      purchaseToken: string
      productId: string
      userId?: string
    }

    if (!purchaseToken || !productId) {
      return res.status(400).json({ error: 'purchaseToken and productId are required' })
    }

    // Google Play Developer API による実検証（SCRUM-116）
    const gpPrivateKey = process.env.GOOGLE_PLAY_PRIVATE_KEY
    const gpPackageName = process.env.GOOGLE_PLAY_PACKAGE_NAME
    if (gpPrivateKey && gpPackageName) {
      const auth = new GoogleAuth({
        credentials: JSON.parse(gpPrivateKey) as Record<string, unknown>,
        scopes: ['https://www.googleapis.com/auth/androidpublisher'],
      })
      const androidpublisher = google.androidpublisher({ version: 'v3', auth })
      const result = await androidpublisher.purchases.subscriptions.get({
        packageName: gpPackageName,
        subscriptionId: productId,
        token: purchaseToken,
      })
      const sub = result.data
      const paymentState = sub.paymentState
      const expiryTimeMillis = Number(sub.expiryTimeMillis ?? '0')
      const validPayment = paymentState === 1 || paymentState === 2
      const notExpired = expiryTimeMillis > Date.now()
      if (!validPayment || !notExpired) {
        return res.status(400).json({
          error: 'Purchase verification failed',
          details: `paymentState=${paymentState}, expiryTimeMillis=${expiryTimeMillis}`,
        })
      }
    } else {
      console.log('[BILLING] Google Play verification skipped: env vars not configured')
    }

    // Determine plan from productId
    type PlanType = 'basic_monthly' | 'basic_yearly' | 'standard_monthly' | 'standard_yearly' | 'premium_monthly' | 'premium_yearly'
    const productToPlan: Record<string, PlanType> = {
      logic_basic_monthly: 'basic_monthly',
      logic_basic_yearly: 'basic_yearly',
      logic_standard_monthly: 'standard_monthly',
      logic_standard_yearly: 'standard_yearly',
      logic_premium_monthly: 'premium_monthly',
      logic_premium_yearly: 'premium_yearly',
    }
    const plan = productToPlan[productId]
    if (!plan) {
      return res.status(400).json({ error: `Unknown productId: ${productId}` })
    }

    // Calculate expiry (30 days for monthly, 365 days for yearly)
    const isYearly = plan.endsWith('_yearly')
    const expiryMs = isYearly ? 365 * 24 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000
    const currentPeriodEnd = new Date(Date.now() + expiryMs).toISOString()

    // Upsert subscription in Supabase
    if (supabase && userId) {
      await supabase
        .from('subscriptions')
        .upsert(
          {
            user_id: userId,
            plan,
            status: 'active',
            current_period_end: currentPeriodEnd,
            // Store purchase token for future verification
            stripe_subscription_id: `gp:${purchaseToken}`,
          },
          { onConflict: 'user_id' }
        )
    }

    res.json({ success: true, plan, currentPeriodEnd })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Internal server error'
    console.error('billing/verify error:', e)
    res.status(500).json({ error: message })
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
  } catch (e: unknown) {
    console.error('portal error:', e)
    res.status(500).json({ error: e instanceof Error ? e.message : String(e) })
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
  } catch (e: unknown) {
    console.error('cancel error:', e)
    res.status(500).json({ error: e instanceof Error ? e.message : String(e) })
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
  } catch (e: unknown) {
    console.error('daily-problem error:', e)
    res.status(500).json({ error: e instanceof Error ? e.message : String(e) })
  }
})


// =============================================
// フェルミ推定 問題プール（20問、日付ローテーション）
// =============================================
const FERMI_QUESTION_POOL_JA: Array<{ question: string; hint: string }> = [
  { question: '日本全国に自動販売機は何台あるか？', hint: '人口÷自販機の密度で考えてみよう。コンビニより多いか少ないかを基準に。' },
  { question: '東京タワーの重さは何トンか？', hint: '高さ333mの鉄骨構造物。1mあたりの重量×高さで分解してみよう。' },
  { question: '日本で1年間に消費されるカップラーメンの個数は？', hint: '人口×世帯数×週の消費頻度×52週で計算できる。' },
  { question: '日本全国の美容室の数はコンビニより多いか少ないか？その数は？', hint: 'コンビニ約6万店が基準。美容室は需要（何人に1軒）から推定しよう。' },
  { question: '東京ドームに水を満たすと何リットル入るか？', hint: 'ドームの体積は約124万㎥。㎥とリットルの変換を使おう。' },
  { question: '日本人が1年間に食べるおにぎりの総数は？', hint: '1人が週に何個食べるか×人口×52週で分解できる。コンビニ販売分も含めよう。' },
  { question: '日本全国の信号機は何基あるか？', hint: '交差点の数×信号機の数で考えよう。市区町村数×平均交差点数が出発点。' },
  { question: '日本のタクシーは全部で何台あるか？', hint: '大都市と地方で密度が違う。東京の台数を基準に全国へ外挿しよう。' },
  { question: 'スーパーのレジを通過する商品は1日何品か（全国合計）？', hint: 'スーパーの数×1店舗の1日の来客数×1人の購入品数で計算しよう。' },
  { question: '日本の道路の総延長は何kmか？', hint: '高速・国道・県道・市区町村道の4段階で分解しよう。面積あたりの密度を使うと便利。' },
  { question: 'Youtubeに毎分アップロードされる動画は何分か？', hint: '世界中のクリエイター数×1人あたりのアップロード頻度×平均動画時間で分解。' },
  { question: '東京→大阪間を徒歩で歩いたら何日かかるか？', hint: '距離約500km÷1日の歩行距離で計算。1日何km歩けるかを考えよう。' },
  { question: '日本のコンビニが1日に捨てる食品廃棄物は何トンか？', hint: '店舗数×1店舗の1日の廃棄量。廃棄率とメニュー数から推定しよう。' },
  { question: '日本人の平均的なスマホ使用時間は1日何時間か。全国合計すると？', hint: '個人の平均時間は統計的に4〜5時間。人口×時間で総量を出そう。' },
  { question: '日本全国の学校の数（小中高大合計）は？', hint: '小学校から大学まで段階ごとに分けて計算。人口÷1校あたりの生徒数が使える。' },
  { question: '新幹線は開業以来、何人の乗客を運んだか？', hint: '1964年開業。年間利用者数×60年で概算できる。利用者数は人口と路線数から推定。' },
  { question: '日本で1日に送受信されるメールの総数は？', hint: 'ビジネスメールと個人メールに分けよう。1人が1日に送受信する数×人口。' },
  { question: '富士山の体積は東京ドーム何個分か？', hint: '円錐の体積＝1/3×底面積×高さ。底面の半径と高さから計算しよう。' },
  { question: '日本の全テレビ局が1日に放送するCMは合計何本か？', hint: 'CM枠は1時間に約12分。チャンネル数×放送時間×CM本数/分で計算。' },
  { question: '日本の電車が1日に走る距離の合計は何kmか？', hint: '路線数×1路線の1日の運行本数×路線距離で分解。JR+私鉄+地下鉄を忘れずに。' },
]

// =============================================
// デイリーフェルミ — Supabase キャッシュ付き
// =============================================
app.get('/api/daily-fermi', async (req, res) => {
  try {
    const locale = (req.query.locale as string) || 'ja'
    const isEn = locale === 'en'
    const today = new Date().toISOString().slice(0, 10) // YYYY-MM-DD

    // 日付ベースでプールから問題を選択（毎日変わる）
    const dayIndex = Math.floor(Date.now() / 86400000) % FERMI_QUESTION_POOL_JA.length
    const poolQuestion = FERMI_QUESTION_POOL_JA[dayIndex]

    // Supabase から今日の問題を確認
    if (supabase) {
      const { data: existing } = await supabase
        .from('daily_fermi_problems')
        .select('*')
        .eq('date', today)
        .eq('locale', locale)
        .single()

      if (existing) {
        return res.json({ question: existing.question, hint: existing.hint, date: today, poolIndex: dayIndex })
      }
    }

    // プールから今日の問題を使う（英語の場合はAI生成）
    if (!isEn && poolQuestion) {
      if (supabase) {
        try { await supabase.from('daily_fermi_problems').insert({
          date: today, question: poolQuestion.question, hint: poolQuestion.hint, locale
        }) } catch { /* ignore */ }
      }
      return res.json({ question: poolQuestion.question, hint: poolQuestion.hint, date: today, poolIndex: dayIndex })
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
  } catch (e: unknown) {
    console.error('daily-fermi error:', e)
    res.status(500).json({ error: e instanceof Error ? e.message : String(e) })
  }
})

// =============================================
// フェルミ — 別問題を取得（プールからランダム）
// =============================================
app.get('/api/fermi/next', async (req, res) => {
  try {
    const exclude = (req.query.exclude as string || '').split(',').map(Number).filter(Boolean)
    const available = FERMI_QUESTION_POOL_JA
      .map((q, i) => ({ ...q, index: i }))
      .filter(q => !exclude.includes(q.index))

    if (available.length === 0) {
      // 全問使い切ったらランダムに返す
      const idx = Math.floor(Math.random() * FERMI_QUESTION_POOL_JA.length)
      const q = FERMI_QUESTION_POOL_JA[idx]
      return res.json({ question: q.question, hint: q.hint, poolIndex: idx })
    }

    const pick = available[Math.floor(Math.random() * available.length)]
    res.json({ question: pick.question, hint: pick.hint, poolIndex: pick.index })
  } catch (e: unknown) {
    res.status(500).json({ error: e instanceof Error ? e.message : String(e) })
  }
})

// =============================================
// フェルミ — スコア記録（ランキング用）
// =============================================
app.post('/api/fermi/record-score', async (req, res) => {
  try {
    const { userId, userName, score, questionIndex, elapsedSec, hintUsed } = req.body as {
      userId?: string
      userName?: string
      score: number
      questionIndex?: number
      elapsedSec?: number
      hintUsed?: boolean
    }
    if (typeof score !== 'number') return res.status(400).json({ error: 'score required' })

    if (supabase) {
      const { error } = await supabase.from('fermi_scores').insert({
        user_id: userId || 'guest',
        user_name: userName || 'ゲスト',
        score,
        question_index: questionIndex ?? -1,
        elapsed_sec: elapsedSec ?? 0,
        hint_used: hintUsed ?? false,
        created_at: new Date().toISOString(),
      })
      if (error) console.warn('fermi_scores insert error:', error.message)
    }

    res.json({ ok: true })
  } catch (e: unknown) {
    res.status(500).json({ error: e instanceof Error ? e.message : String(e) })
  }
})

// =============================================
// フェルミ — ランキング取得（実データ + フォールバック）
// =============================================
app.get('/api/fermi/ranking', async (req, res) => {
  try {
    const period = (req.query.period as string) || 'week'
    let since = new Date()
    if (period === 'week') since.setDate(since.getDate() - 7)
    else if (period === 'month') since.setDate(since.getDate() - 30)
    else since = new Date('2020-01-01')

    if (supabase) {
      const { data, error } = await supabase
        .from('fermi_scores')
        .select('user_name, score, created_at')
        .gte('created_at', since.toISOString())
        .order('score', { ascending: false })
        .limit(50)

      if (!error && data && data.length >= 3) {
        // ユーザーごとに最高スコアを集計
        const byUser: Record<string, { name: string; score: number }> = {}
        for (const row of data) {
          const name = row.user_name || 'ゲスト'
          if (!byUser[name] || byUser[name].score < row.score) {
            byUser[name] = { name, score: row.score }
          }
        }
        const ranking = Object.values(byUser).sort((a, b) => b.score - a.score).slice(0, 20)
        return res.json({ ranking, source: 'real' })
      }
    }

    // フォールバック: ダミーデータ（100pt以下）
    res.json({
      ranking: [
        { name: 'Taro M.', score: 98 },
        { name: 'Yuki S.', score: 87 },
        { name: 'Hana K.', score: 76 },
        { name: 'Ryo T.', score: 65 },
        { name: 'Ami F.', score: 54 },
        { name: 'Ken N.', score: 43 },
        { name: 'Saki I.', score: 38 },
        { name: 'Jiro W.', score: 27 },
        { name: 'Mika O.', score: 15 },
      ],
      source: 'mock'
    })
  } catch (e: unknown) {
    res.status(500).json({ error: e instanceof Error ? e.message : String(e) })
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
  } catch (e: unknown) {
    res.status(500).json({ error: e instanceof Error ? e.message : String(e) })
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
    let insertedId: string | null = null
    if (supabase) {
      const appSource = process.env.APP_ENV === 'sit' ? 'sit' : 'production'
      const { data, error } = await supabase
        .from('feedback')
        .insert({
          category,
          message: message.trim(),
          locale: locale || 'ja',
          created_at: new Date().toISOString(),
          source: appSource,
        })
        .select('id')
        .single()
      if (error) {
        console.warn('[feedback] Supabase insert warning:', error.message)
      } else {
        insertedId = data?.id ?? null
      }
    }

    // Jira チケット起票（バグ報告・コンテンツ誤りは Bug、改善提案は Story）
    const isUrgent = category === 'バグ報告' || category === '内容・説明が間違っている' || category === '選択肢の正解が違う'
    const feedbackJiraResult = await jiraCreateIssue({
      summary: `[フィードバック] ${category}: ${message.trim().slice(0, 60)}`,
      description: [
        `カテゴリ: ${category}`,
        `内容: ${message.trim()}`,
        `言語: ${locale || 'ja'}`,
        insertedId ? `Supabase ID: ${insertedId}` : '',
      ].filter(Boolean).join('\n'),
      issueType: isUrgent ? 'Bug' : 'Story',
    })

    // Apolloに即座通知 — 受信後即座に分析・改善提案
    notifyApollo({
      category,
      message: message.trim(),
      jiraKey: feedbackJiraResult?.key,
    }).catch(() => {})

    res.json({ ok: true, message: isEn ? 'Thank you!' : 'ありがとうございました！' })
  } catch (e: unknown) {
    console.error('feedback error:', e)
    res.status(500).json({ error: e instanceof Error ? e.message : String(e) })
  }
})


// それ以外のルート（/api/* 以外）は Play Store 誘導ページを返す
// ※ APIルートが全て定義された後に配置すること（catch-all が先に来るとAPIが塞がれる）
const PLAY_STORE_URL = 'https://play.google.com/store/apps/details?id=com.keitaurano.logic'
// ================================================================
// SCRUM-90: Apollo提案 → Jira自動起票 API
// ================================================================
app.post('/api/jira-create', async (req: Request, res) => {
  // 認証: JIRA_WEBHOOK_SECRETが設定されている場合は検証
  const webhookSecret = process.env.JIRA_WEBHOOK_SECRET
  if (webhookSecret) {
    const authHeader = req.headers.authorization || ''
    if (authHeader !== `Bearer ${webhookSecret}`) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
  }

  const { summary, description, issueType = 'Story', priority = 'Medium', labels = [] } = req.body
  if (!summary) return res.status(400).json({ error: 'summary is required' })

  const jiraEmail = process.env.JIRA_EMAIL
  const jiraToken = process.env.JIRA_API_TOKEN
  const jiraUrl = process.env.JIRA_URL || 'https://logic.atlassian.net'
  const projectKey = process.env.JIRA_PROJECT_KEY || 'SCRUM'

  if (!jiraEmail || !jiraToken) {
    return res.status(503).json({ error: 'Jira credentials not configured' })
  }

  const issueTypeMap: Record<string, { id: string }> = {
    'Story': { id: '10004' },
    'Bug':   { id: '10007' },
  }
  const priorityMap: Record<string, string> = {
    'High': 'High', 'Medium': 'Medium', 'Low': 'Low',
  }

  try {
    const auth = Buffer.from(`${jiraEmail}:${jiraToken}`).toString('base64')
    const body = {
      fields: {
        project: { key: projectKey },
        summary,
        description: {
          type: 'doc', version: 1,
          content: [{ type: 'paragraph', content: [{ type: 'text', text: description || summary }] }],
        },
        issuetype: issueTypeMap[issueType] ?? issueTypeMap['Story'],
        priority: { name: priorityMap[priority] ?? 'Medium' },
        labels: ['apollo-proposal', ...labels],
      },
    }

    const response = await fetch(`${jiraUrl}/rest/api/3/issue`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errText = await response.text()
      return res.status(response.status).json({ error: errText })
    }

    const data = await response.json() as { key: string }
    const issueKey = data.key
    const issueUrl = `${jiraUrl}/browse/${issueKey}`

    console.log(`[JIRA] Created issue: ${issueKey} - ${summary}`)
    return res.json({ key: issueKey, url: issueUrl })
  } catch (err) {
    console.error('[JIRA] Error creating issue:', err)
    return res.status(500).json({ error: 'Failed to create Jira issue' })
  }
})

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

// ─────────────────────────────────────────────
// 登録完了メール送信
// ─────────────────────────────────────────────
app.post('/api/send-welcome-email', async (req, res) => {
  const { email } = req.body as { email: string }
  if (!email) return res.status(400).json({ error: 'email required' })

  const smtpHost = process.env.SMTP_HOST
  const smtpUser = process.env.SMTP_USER
  const smtpPass = process.env.SMTP_PASS

  // SMTP未設定の場合はログのみ
  if (!smtpHost || !smtpUser || !smtpPass) {
    console.log(`[WELCOME-EMAIL] Would send to ${email} (SMTP not configured)`)
    return res.json({ ok: true, note: 'smtp_not_configured' })
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: parseInt(process.env.SMTP_PORT || '587', 10),
      auth: { user: smtpUser, pass: smtpPass },
    })
    await transporter.sendMail({
      from: `"Logic 学習アプリ" <${smtpUser}>`,
      to: email,
      subject: '【Logic】登録完了のお知らせ',
      html: `
        <div style="font-family:'Helvetica Neue',Arial,sans-serif;max-width:520px;margin:0 auto;background:#1A1F2E;color:#E8ECF4;padding:40px 32px;border-radius:16px;">
          <div style="text-align:center;margin-bottom:32px;">
            <div style="font-size:32px;font-weight:900;color:#6C8EF5;letter-spacing:-0.02em;">Logic</div>
            <div style="font-size:13px;color:#8FA3C8;margin-top:4px;">論理思考力トレーニング</div>
          </div>
          <h2 style="font-size:20px;font-weight:700;margin-bottom:12px;color:#E8ECF4;">登録完了しました🎉</h2>
          <p style="font-size:15px;line-height:1.7;color:#8FA3C8;margin-bottom:24px;">
            Logicへようこそ！アカウント登録が完了しました。<br>
            毎日少しずつ、論理思考力を鍛えていきましょう。
          </p>
          <div style="background:#252C40;border-radius:12px;padding:20px;margin-bottom:24px;">
            <div style="font-size:13px;color:#6B82A8;margin-bottom:8px;">登録メールアドレス</div>
            <div style="font-size:16px;font-weight:700;color:#6C8EF5;">${email}</div>
          </div>
          <a href="https://logic-sit.onrender.com" style="display:block;background:#6C8EF5;color:#1A1F2E;text-align:center;padding:16px;border-radius:12px;font-size:15px;font-weight:700;text-decoration:none;margin-bottom:24px;">
            アプリを開く →
          </a>
          <p style="font-size:12px;color:#6B82A8;text-align:center;">
            お問い合わせ: <a href="mailto:support@logic-m.com" style="color:#6C8EF5;">support@logic-m.com</a>
          </p>
        </div>
      `,
    })
    res.json({ ok: true })
  } catch (err) {
    console.error('[WELCOME-EMAIL] send failed:', err)
    res.status(500).json({ error: 'send failed' })
  }
})


const PORT = parseInt(process.env.PORT || '3001', 10)
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`)
  ensureFeedbackTable().catch(console.warn)
})
