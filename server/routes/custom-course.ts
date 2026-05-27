import { Router, type Request, type Response } from 'express'
import type Anthropic from '@anthropic-ai/sdk'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { RateLimitRequestHandler } from 'express-rate-limit'

// =============================================
// AI カスタムコース生成
//   POST /api/generate-course
//
// ユーザーの自然文（「こんなことを学びたい」）を受け取り、クライアントから
// 渡された全レッスンの id/title/category 一覧の中から最適なものを Claude に
// 選ばせ、その人専用のカスタムコース（title / description / lessonIds）を返す。
//
// 課金:
//   - 有料（isPaid）: 無制限
//   - 無料: 月 3 回まで（user_ai_course_usage を権威ソースに集計）
//   - 未ログイン（guest）: レートリミッタに委ね、回数集計はしない（problems.ts と同じ思想）
// =============================================

const FREE_MONTHLY_LIMIT = 3

// 有料プラン判定（problems.ts と揃える）
const PAID_PLANS = new Set([
  'paid_monthly',
  'paid_yearly',
  'monthly',
  'yearly',
  'basic_monthly',
  'basic_yearly',
  'standard_monthly',
  'standard_yearly',
  'premium_monthly',
  'premium_yearly',
  'campaign_yearly',
  'beta_campaign',
])

type LessonMeta = { id: number; title: string; category: string }

function monthKey(now = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

/**
 * Authorization Bearer token から認証済み user を解決する（任意）。
 * 取れなければ null（ゲスト扱い）。
 */
async function resolveAuthedUser(
  supabase: SupabaseClient | null,
  req: Request,
): Promise<string | null> {
  if (!supabase) return null
  const auth = req.headers.authorization
  if (typeof auth !== 'string' || !auth.startsWith('Bearer ')) return null
  const token = auth.slice(7).trim()
  if (!token) return null
  try {
    const { data, error } = await supabase.auth.getUser(token)
    if (error || !data?.user) return null
    return data.user.id
  } catch {
    return null
  }
}

/**
 * 認証ユーザーの課金回数チェック。
 * - 有料: 常に allowed（集計はしない）
 * - 無料: 当月の生成回数が上限未満なら allowed
 * DB エラー時はベストエフォートで通す（problems.ts と同じ）。
 */
async function checkCourseQuota(
  supabase: SupabaseClient,
  userId: string,
): Promise<{ allowed: boolean; remaining: number; isPaid: boolean }> {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('plan')
      .eq('id', userId)
      .single()
    const plan = profile?.plan ?? 'free'
    if (PAID_PLANS.has(plan)) {
      return { allowed: true, remaining: -1, isPaid: true }
    }

    const period = monthKey()
    const { data: usage } = await supabase
      .from('user_ai_course_usage')
      .select('count')
      .eq('user_id', userId)
      .eq('period_month', period)
      .single()
    const count = usage?.count ?? 0
    const remaining = Math.max(0, FREE_MONTHLY_LIMIT - count)
    return { allowed: count < FREE_MONTHLY_LIMIT, remaining, isPaid: false }
  } catch {
    // 集計テーブル未適用・読み取り失敗時は通す（ベストエフォート）
    return { allowed: true, remaining: FREE_MONTHLY_LIMIT, isPaid: false }
  }
}

async function incrementCourseUsage(supabase: SupabaseClient, userId: string): Promise<void> {
  try {
    const period = monthKey()
    const { data: usage } = await supabase
      .from('user_ai_course_usage')
      .select('count')
      .eq('user_id', userId)
      .eq('period_month', period)
      .single()
    const count = (usage?.count ?? 0) + 1
    await supabase
      .from('user_ai_course_usage')
      .upsert(
        { user_id: userId, period_month: period, count, updated_at: new Date().toISOString() },
        { onConflict: 'user_id,period_month' },
      )
  } catch {
    /* 集計失敗は無視（生成自体は成功させる） */
  }
}

export function createCustomCourseRouter(
  anthropic: Anthropic,
  supabase: SupabaseClient | null,
  limiter: RateLimitRequestHandler,
): Router {
  const router = Router()

  router.post('/api/generate-course', limiter, async (req: Request, res: Response) => {
    try {
      const body = (req.body ?? {}) as {
        prompt?: unknown
        lessons?: unknown
        locale?: unknown
      }
      const isEn = body.locale === 'en'
      const prompt = typeof body.prompt === 'string' ? body.prompt.trim() : ''

      // ── 入力検証 ──
      if (!prompt || prompt.length < 4) {
        return res.status(400).json({ error: isEn ? 'Please describe what you want to learn.' : '学びたいことを入力してください。' })
      }
      if (prompt.length > 1000) {
        return res.status(400).json({ error: isEn ? 'Your request is too long.' : '入力が長すぎます。' })
      }
      if (!Array.isArray(body.lessons) || body.lessons.length === 0) {
        return res.status(400).json({ error: 'lessons required' })
      }

      // 候補レッスンを id/title/category だけに正規化（トークン節約）。
      // 件数が多すぎるとトークンが膨らむので上限でクランプする。
      const MAX_CANDIDATES = 400
      const lessons: LessonMeta[] = []
      const validIds = new Set<number>()
      for (const raw of body.lessons as unknown[]) {
        if (lessons.length >= MAX_CANDIDATES) break
        if (!raw || typeof raw !== 'object') continue
        const r = raw as Record<string, unknown>
        const id = typeof r.id === 'number' ? r.id : Number(r.id)
        const title = typeof r.title === 'string' ? r.title : ''
        const category = typeof r.category === 'string' ? r.category : ''
        if (!Number.isFinite(id) || !title) continue
        lessons.push({ id, title, category })
        validIds.add(id)
      }
      if (lessons.length === 0) {
        return res.status(400).json({ error: 'no valid lessons' })
      }

      // ── 課金回数チェック（認証ユーザーのみ厳密。ゲストはレートリミッタ任せ）──
      const userId = await resolveAuthedUser(supabase, req)
      if (supabase && userId && process.env.BETA_MODE !== 'true') {
        const quota = await checkCourseQuota(supabase, userId)
        if (!quota.allowed) {
          return res.status(429).json({
            error: isEn
              ? 'You have reached the free monthly limit. Upgrade for unlimited custom courses.'
              : '今月の無料生成回数の上限に達しました。無制限で作るにはアップグレードしてください。',
            limitReached: true,
            remaining: 0,
          })
        }
      }

      // ── Claude へのプロンプト ──
      // レッスン候補は 1 行 1 件の軽量フォーマットで渡す（JSON より省トークン）。
      const catalog = lessons
        .map(l => `${l.id}\t${l.title}${l.category ? `\t(${l.category})` : ''}`)
        .join('\n')

      const systemJa = `あなたは学習設計のプロフェッショナルです。ユーザーが「学びたいこと」を自然文で伝えるので、提示されたレッスン一覧の中から最適なレッスンを選び、その人専用の学習コースを設計してください。

## ルール
- レッスンは必ず「提示された一覧の id」からのみ選ぶ。一覧にない id は絶対に作らない。
- 学ぶ順番として自然な流れ（基礎→応用）に並べる。
- レッスン数は 4〜8 件。ユーザーの希望に合うものが少なければ少なくてよい。
- title はユーザーの目的に沿った「〜する」形の動詞句（30文字以内）。
- description は、このコースで何が身につくかを 2〜3 文（120文字程度）で説明する。中立的な丁寧体（〜です／〜ます）で書く。
- 絵文字は使わない。

## 出力形式（JSONのみ。他のテキストは一切含めない）
{
  "title": "コースタイトル",
  "description": "コースの説明",
  "lessonIds": [12, 34, 56]
}`

      const systemEn = `You are a professional learning designer. The user tells you in natural language what they want to learn. From the provided lesson list, select the most relevant lessons and design a personalized course for them.

## Rules
- Only pick lessons by id from the provided list. Never invent an id that is not in the list.
- Order lessons in a natural learning sequence (fundamentals first, then application).
- Use 4 to 8 lessons. Fewer is fine if few are relevant.
- The title should be an action phrase aligned with the user's goal (30 chars or less).
- The description explains what the user will gain, in 2-3 sentences (~60 words), in plain polite English.
- Do not use emoji.

## Output (JSON only, no other text)
{
  "title": "Course title",
  "description": "Course description",
  "lessonIds": [12, 34, 56]
}`

      const userMessage = isEn
        ? `What I want to learn:\n${prompt}\n\nAvailable lessons (id<TAB>title<TAB>(category)):\n${catalog}`
        : `学びたいこと:\n${prompt}\n\n選べるレッスン一覧（id<TAB>タイトル<TAB>(カテゴリ)）:\n${catalog}`

      const response = await anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 800,
        system: isEn ? systemEn : systemJa,
        messages: [{ role: 'user', content: userMessage }],
      })

      const text = response.content
        .filter((b: { type: string }) => b.type === 'text')
        .map((b: { type: string; text?: string }) => (b as { type: string; text: string }).text)
        .join('')
        .trim()

      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        return res.status(500).json({ error: isEn ? 'Failed to build a course.' : 'コースの生成に失敗しました。' })
      }
      const parsed = JSON.parse(jsonMatch[0]) as {
        title?: unknown
        description?: unknown
        lessonIds?: unknown
      }

      // ── 妥当性検証: 存在しない lesson id を弾く / 重複排除 ──
      const rawIds = Array.isArray(parsed.lessonIds) ? parsed.lessonIds : []
      const lessonIds: number[] = []
      for (const raw of rawIds) {
        const id = typeof raw === 'number' ? raw : Number(raw)
        if (Number.isFinite(id) && validIds.has(id) && !lessonIds.includes(id)) {
          lessonIds.push(id)
        }
      }
      if (lessonIds.length === 0) {
        return res.status(422).json({
          error: isEn
            ? 'Could not find matching lessons. Try rephrasing your request.'
            : '条件に合うレッスンが見つかりませんでした。表現を変えてもう一度お試しください。',
        })
      }

      const title = typeof parsed.title === 'string' && parsed.title.trim()
        ? parsed.title.trim().slice(0, 60)
        : (isEn ? 'Your custom course' : 'あなた専用コース')
      const description = typeof parsed.description === 'string' ? parsed.description.trim().slice(0, 400) : ''

      // ── 成功したので無料ユーザーの回数をインクリメント ──
      let remaining = -1
      if (supabase && userId && process.env.BETA_MODE !== 'true') {
        const quota = await checkCourseQuota(supabase, userId)
        if (!quota.isPaid) {
          await incrementCourseUsage(supabase, userId)
          remaining = Math.max(0, quota.remaining - 1)
        }
      }

      res.json({ title, description, lessonIds, remaining })
    } catch (e: unknown) {
      console.error('generate-course error:', e)
      const isEn = (req.body as { locale?: string } | undefined)?.locale === 'en'
      res.status(500).json({ error: isEn ? 'Failed to build a course.' : 'コースの生成に失敗しました。' })
    }
  })

  return router
}
