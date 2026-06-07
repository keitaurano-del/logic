import express, { type Request } from 'express'
import cors from 'cors'
import { timingSafeEqual } from 'node:crypto'
import path from 'path'
import { fileURLToPath } from 'url'
import Anthropic from '@anthropic-ai/sdk'
import rateLimit from 'express-rate-limit'
import { createClient } from '@supabase/supabase-js'
import nodemailer from 'nodemailer'
import { createFermiRouter } from './routes/fermi.js'
import { createBillingRouter } from './routes/billing.js'
import { createProblemsRouter } from './routes/problems.js'
import { createCustomCourseRouter } from './routes/custom-course.js'
import { createJournalRouter } from './routes/journal.js'
import { createFeatureFlagsRouter } from './routes/feature-flags.js'
import { createSyncTelemetryRouter } from './routes/sync-telemetry.js'
import { createTtsRouter } from './routes/tts.js'
import { createSearchRouter } from './routes/search.js'
import { createWritingScoreRouter } from './routes/writing-score.js'
import { createStudySessionsRouter } from './routes/study-sessions.js'

// Supabase サーバーサイドクライアント（service role key 使用）
const supabaseUrl = process.env.SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
if (!supabaseUrl) console.warn('[WARN] SUPABASE_URL is not set — Supabase features will be disabled')
if (supabaseUrl && !supabaseKey) console.warn('[WARN] SUPABASE_SERVICE_ROLE_KEY is not set — Supabase features will be disabled')
const supabase = supabaseUrl && supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null

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

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

// Render / proxied environments: trust the first hop so X-Forwarded-For is honored
// (without this all requests look like they come from the load balancer = no per-IP limiting).
app.set('trust proxy', 1)

// 定数時間で string を比較する。長さ不一致 / 値不一致のいずれも false。
// header 由来の値（string | string[] | undefined）は string 限定で受ける。
function safeEqual(provided: unknown, expected: string | undefined): boolean {
  if (typeof provided !== 'string') return false
  if (!expected) return false
  const a = Buffer.from(provided)
  const b = Buffer.from(expected)
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}

// CORS オリジン: カンマ区切りで複数指定可能。制御文字・引用符・前後空白は除去。
// 例: "capacitor://localhost,https://localhost,https://logic-u5wn.onrender.com"
function parseCorsOrigins(raw: string | undefined): string[] {
  const fallback = ['http://localhost:5173']
  if (!raw) return fallback
  const cleaned = raw
    .split(',')
    // eslint-disable-next-line no-control-regex
    .map(s => s.replace(/[\x00-\x1f\x7f"']/g, '').trim())
    .filter(Boolean)
  if (cleaned.length === 0) {
    console.warn('[WARN] CORS_ORIGIN contained no valid entries — falling back to default')
    return fallback
  }
  return cleaned
}
const corsOrigins = parseCorsOrigins(process.env.CORS_ORIGIN)
console.log('[CORS] allowed origins:', corsOrigins.join(', '))
app.use(cors({ origin: corsOrigins }))

// Google Play Billing 検証ルート
if (supabase) {
  app.use(createBillingRouter({ supabase }))
} else {
  console.warn('[WARN] Billing routes disabled: SUPABASE_URL not set')
}

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
  msgJa?: string
  msgEn?: string
  useUserId?: boolean
}) {
  return rateLimit({
    windowMs: opts.windowMs,
    max: opts.max,
    standardHeaders: true,
    legacyHeaders: false,
    // AI エンドポイントはユーザーID 単位で制限する（IP 単位だと同一ネットワークの
    // 別ユーザーが巻き添えを食い、逆に別 IP からの連打を防げない）。
    keyGenerator: opts.useUserId
      ? (req: Request) => {
          const userId = (req.body as { userId?: string } | undefined)?.userId
          return userId ?? req.ip ?? 'unknown'
        }
      : undefined,
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

// 重い AI エンドポイント用（useUserId: true でユーザーID 単位に制限）
const fermiLimiter = makeLimiter({
  windowMs: 60 * 1000,
  max: 15,
  msgJa: 'フェルミ推定のリクエストが多すぎます。1 分待ってからお試しください。',
  msgEn: 'Too many Fermi requests. Please wait a minute and try again.',
  useUserId: true,
})

const generateProblemsLimiter = makeLimiter({
  windowMs: 60 * 60 * 1000,
  max: 30,
  msgJa: '問題生成のリクエストが多すぎます。しばらく待ってからお試しください。',
  msgEn: 'Too many problem generation requests. Please try again later.',
  useUserId: true,
})

const dailyProblemLimiter = makeLimiter({
  windowMs: 24 * 60 * 60 * 1000,
  max: 5,
  msgJa: '今日のデイリー問題は既に取得済みです。明日また挑戦してください。',
  msgEn: 'You have already fetched today\'s daily problem. Try again tomorrow.',
  useUserId: true,
})

const flashcardsLimiter = makeLimiter({
  windowMs: 60 * 60 * 1000,
  max: 20,
  msgJa: 'フラッシュカード生成のリクエストが多すぎます。しばらく待ってからお試しください。',
  msgEn: 'Too many flashcard generation requests. Please try again later.',
  useUserId: true,
})

const journalLimiter = makeLimiter({
  windowMs: 60 * 1000,
  max: 15,
  msgJa: 'ジャーナルのリクエストが多すぎます。1 分待ってからお試しください。',
  msgEn: 'Too many journal requests. Please wait a minute and try again.',
  useUserId: true,
})

// AI カスタムコース生成用: 1 時間 20 回（重い AI 呼び出し。回数制限自体は
// custom-course.ts 側で課金プラン別に厳密にチェックするので、ここは保険）
const generateCourseLimiter = makeLimiter({
  windowMs: 60 * 60 * 1000,
  max: 20,
  msgJa: 'コース生成のリクエストが多すぎます。しばらく待ってからお試しください。',
  msgEn: 'Too many course generation requests. Please try again later.',
  useUserId: true,
})

// 管理者エンドポイント用: 1時間10回
const adminLimiter = makeLimiter({
  windowMs: 60 * 60 * 1000,
  max: 10,
  msgJa: '管理者APIのリクエストが多すぎます。しばらく待ってからお試しください。',
  msgEn: 'Too many admin requests. Please try again later.',
})

// ウェルカムメール送信用: 1時間5回
const welcomeEmailLimiter = makeLimiter({
  windowMs: 60 * 60 * 1000,
  max: 5,
  msgJa: 'メール送信のリクエストが多すぎます。しばらく待ってからお試しください。',
  msgEn: 'Too many email requests. Please try again later.',
})

// Cloud TTS 用: 1 分 60 リクエスト（スライド連続読み上げを許容しつつスパムは抑える。
// クライアント側のハッシュキャッシュで重複合成は避ける前提）
const ttsLimiter = makeLimiter({
  windowMs: 60 * 1000,
  max: 60,
  msgJa: '読み上げのリクエストが多すぎます。少し待ってからお試しください。',
  msgEn: 'Too many speech requests. Please wait a moment and try again.',
})

// AI セマンティック検索用: 1 分 20 回（haiku 呼び出し1回。連打は抑えつつ試行は許容）
const searchLimiter = makeLimiter({
  windowMs: 60 * 1000,
  max: 20,
  msgJa: '検索のリクエストが多すぎます。少し待ってからお試しください。',
  msgEn: 'Too many search requests. Please wait a moment and try again.',
})

// ロジカルライティング採点用: 1 分 10 回（tool_use 呼び出し1回）
const writingScoreLimiter = makeLimiter({
  windowMs: 60 * 1000,
  max: 10,
  msgJa: 'ライティング採点のリクエストが多すぎます。少し待ってからお試しください。',
  msgEn: 'Too many writing score requests. Please wait a moment and try again.',
  useUserId: true,
})

// グローバル制限を /api/* に適用 (ヘルスチェックは除外)
app.use((req, res, next) => {
  if (req.path === '/api/health') return next()
  if (req.path.startsWith('/api/')) return globalApiLimiter(req, res, next)
  return next()
})


app.get('/api/health', (_req, res) => { res.json({ ok: true }) })

// Problems (flashcards/journal/generate-problems/user-problems/daily-problem)
app.use(createProblemsRouter(client, supabase, flashcardsLimiter, generateProblemsLimiter, dailyProblemLimiter))

// AI カスタムコース生成（POST /api/generate-course）
app.use(createCustomCourseRouter(client, supabase, generateCourseLimiter))

// フェルミ推定
app.use('/api/fermi', createFermiRouter(client, supabase, fermiLimiter))

// ジャーナル & 目標
app.use('/api/journal', createJournalRouter(client, journalLimiter))

// Device Sync Phase 3: 段階公開のための feature flag 配信
app.use('/api/feature-flags', createFeatureFlagsRouter())

// Device Sync Phase 3: sync 完了テレメトリ受信
app.use('/api/sync-telemetry', createSyncTelemetryRouter({ supabase }))

// Cloud TTS proxy（Google Cloud Text-to-Speech、キー未設定なら 503 でクライアントが端末 TTS にフォールバック）
app.use('/api/tts', createTtsRouter(ttsLimiter))

// AI セマンティック検索（POST /api/search）
app.use('/api/search', createSearchRouter(client, searchLimiter))

// ロジカルライティング採点（POST /api/writing-score）
app.use('/api/writing-score', createWritingScoreRouter(client, writingScoreLimiter))

// 学習時間ログ（POST /api/study-sessions, GET /api/study-sessions/stats）
app.use('/api', createStudySessionsRouter(supabase))


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
// プレイスメントテスト — Supabase 版
// =============================================

app.post('/api/placement/submit', async (req, res) => {
  try {
    const { guestId, nickname, deviation, correctCount, totalCount, xp } = req.body || {}
    if (!guestId || typeof deviation !== 'number') {
      return res.status(400).json({ error: 'guestId and deviation required' })
    }

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      // Supabase 未設定時はファイルベースにフォールバック
      return res.status(503).json({ error: 'Supabase not configured' })
    }

    const basePayload = {
      guest_id: guestId,
      nickname: (nickname || 'ゲスト').slice(0, 20),
      deviation,
      correct_count: correctCount || 0,
      total_count: totalCount || 0,
      completed_at: new Date().toISOString(),
    }
    const fullPayload = { ...basePayload, xp: typeof xp === 'number' && xp >= 0 ? xp : 0 }

    let { error } = await supabase.from('placement_results').upsert(fullPayload, { onConflict: 'guest_id' })
    // Migration 008 未適用環境では xp 列が無いためエラーになる。基本ペイロードで再試行。
    if (error && /xp/i.test(error.message)) {
      const retry = await supabase.from('placement_results').upsert(basePayload, { onConflict: 'guest_id' })
      error = retry.error
    }

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
      .select('guest_id, nickname, deviation, correct_count, total_count, xp')
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
      const ids = top50.map((e: { guest_id: string }) => e.guest_id)
      const xpRes = await supabase
        .from('user_stats')
        .select('guest_id, xp')
        .in('guest_id', ids)
      if (xpRes.error) {
        console.warn('[placement/ranking] user_stats join failed (migration 009 未適用?):', xpRes.error.message)
      } else {
        for (const row of (xpRes.data || []) as { guest_id: string; xp: number }[]) {
          xpMap.set(row.guest_id, row.xp || 0)
        }
      }
    }

    const top = top50.map((e: { guest_id: string; nickname: string; deviation: number }, i: number) => ({
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
      const idx = placements.findIndex((e: { guest_id: string }) => e.guest_id === guestId)
      if (idx >= 0) {
        yourRank = idx + 1
        yourDeviation = (placements[idx] as { deviation: number }).deviation
        // top50 外でも自分の XP は別途取得
        yourXp = xpMap.get(guestId) ?? 0
        if (!xpMap.has(guestId)) {
          const yourXpRes = await supabase
            .from('user_stats')
            .select('xp')
            .eq('guest_id', guestId)
            .maybeSingle()
          if (!yourXpRes.error && yourXpRes.data) {
            yourXp = (yourXpRes.data as { xp: number }).xp || 0
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
  const webhookSecret = process.env.APOLLO_FEEDBACK_SECRET
  if (!webhookUrl) {
    console.log('[apollo] APOLLO_WEBHOOK_URL not set — skipping real-time notification')
    return
  }
  if (!webhookSecret) {
    console.error('[apollo] APOLLO_FEEDBACK_SECRET not configured — aborting notification (fail closed)')
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
    } catch (emailErr: unknown) {
      console.warn('[REPORT] Email send failed (non-fatal):', emailErr instanceof Error ? emailErr.message : String(emailErr))
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

app.get('/api/reports', async (req, res) => {
  if (!safeEqual(req.headers['x-admin-secret'], process.env.ADMIN_SECRET)) {
    res.status(401).json({ error: 'Unauthorized' }); return
  }
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
// 管理者: Premium 付与
// =============================================
app.post('/api/admin/grant-premium', adminLimiter, async (req, res) => {
  if (!safeEqual(req.headers['x-admin-secret'], process.env.ADMIN_SECRET)) {
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
    const { category = 'その他', message = '', locale, device_id, app_version } = req.body || {}
    if (!message || message.trim().length === 0) {
      return res.status(400).json({ error: '内容を入力してください' })
    }
    const isEn = locale === 'en'
    // 匿名・安定の端末識別子 / アプリバージョン (DF-F21)。個人情報は含まない。
    // 値が無い・型が不正な場合は null にして既存挙動を壊さない。
    const deviceId = typeof device_id === 'string' && device_id.trim() ? device_id.trim().slice(0, 64) : null
    const appVersion = typeof app_version === 'string' && app_version.trim() ? app_version.trim().slice(0, 32) : null

    // Supabase に保存
    let insertedId: string | null = null
    if (supabase) {
      const appSource = process.env.APP_ENV === 'sit' ? 'sit' : 'production'
      // NOTE(DF-F21): device_id / app_version 列は supabase/migrations/034_feedback_device.sql
      // を本番適用してから有効化される。未適用環境では insert がカラム不在で失敗するが、
      // 下の `if (error)` で warn にとどめ Jira 起票・レスポンスは継続するため既存挙動は壊れない。
      const { data, error } = await supabase
        .from('feedback')
        .insert({
          category,
          message: message.trim(),
          locale: locale || 'ja',
          created_at: new Date().toISOString(),
          source: appSource,
          device_id: deviceId,
          app_version: appVersion,
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
  // 認証: JIRA_WEBHOOK_SECRETが未設定の場合はエンドポイントを無効化
  if (!process.env.JIRA_WEBHOOK_SECRET) {
    res.status(503).json({ error: 'Not configured' }); return
  }
  const expected = `Bearer ${process.env.JIRA_WEBHOOK_SECRET}`
  if (!safeEqual(req.headers.authorization, expected)) {
    return res.status(401).json({ error: 'Unauthorized' })
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
app.post('/api/send-welcome-email', welcomeEmailLimiter, async (req, res) => {
  const { email } = req.body as { email: string }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'valid email required' })
  }

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
