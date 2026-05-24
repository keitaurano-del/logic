/**
 * /api/sync-telemetry
 *
 * 別端末同期 (Device Sync) Phase 3 段階公開のための観測ログ収集。
 *
 * クライアントが sync 完了時に 1 リクエスト送る軽量な計測 endpoint。
 * Supabase の sync_telemetry テーブル (028 migration) にそのまま insert する。
 *
 * 認証:
 * - Supabase access token (Bearer) を Authorization header で受け取り、
 *   `supabase.auth.getUser(token)` で実 user を取得する。
 * - body の userId は header から得た uid と一致しなければ拒否する。
 *   なりすまし & RLS バイパス対策。
 *
 * レート制限:
 * - ユーザー (uid) 単位で 1 分 60 リクエスト。express-rate-limit の keyGenerator を
 *   uid ベースに切り替える。fallback として IP も保持。
 *
 * ペイロード:
 *   {
 *     userId: string,
 *     syncType: 'flashcards' | 'wrong_answers' | 'saved_items' |
 *               'notebook' | 'roadmap' | 'category_progress' | 'all' | string,
 *     itemCount: number,
 *     durationMs: number,
 *     success: boolean,
 *     errorMsg?: string,
 *   }
 *
 * レスポンス: { ok: true }
 */

import { Router, type Request, type Response } from 'express'
import rateLimit from 'express-rate-limit'
import type { SupabaseClient } from '@supabase/supabase-js'

interface TelemetryDeps {
  supabase: SupabaseClient | null
}

// 1 分 60 req / ユーザー (uid)。Authorization header が無い時は IP fallback。
const telemetryLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => {
    const auth = req.headers.authorization
    if (typeof auth === 'string' && auth.startsWith('Bearer ')) {
      // header 末尾 32 文字 (= JWT signature 末尾) を key にする。
      // 完全な JWT を key にすると long string で memory コストが高い。
      // user uid を取り出すには JWT デコードが必要だが、それは limiter 後のハンドラで実施。
      const token = auth.slice(7)
      return token.slice(-32)
    }
    return req.ip ?? 'unknown'
  },
  message: { error: 'Too many telemetry requests. Please wait a minute.' },
})

const VALID_SYNC_TYPES = new Set([
  'flashcards',
  'wrong_answers',
  'saved_items',
  'notebook',
  'roadmap',
  'category_progress',
  'all',
])

function isUuid(s: unknown): s is string {
  return typeof s === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s)
}

export function createSyncTelemetryRouter(deps: TelemetryDeps): Router {
  const { supabase } = deps
  const router = Router()

  router.post('/', telemetryLimiter, async (req: Request, res: Response) => {
    if (!supabase) {
      return res.status(503).json({ error: 'Supabase not configured' })
    }

    // ── auth header 検証 ──
    const auth = req.headers.authorization
    if (typeof auth !== 'string' || !auth.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'missing bearer token' })
    }
    const token = auth.slice(7).trim()
    if (!token) {
      return res.status(401).json({ error: 'invalid bearer token' })
    }

    let authedUserId: string
    try {
      const { data, error } = await supabase.auth.getUser(token)
      if (error || !data?.user) {
        return res.status(401).json({ error: 'invalid bearer token' })
      }
      authedUserId = data.user.id
    } catch {
      return res.status(401).json({ error: 'invalid bearer token' })
    }

    // ── body 検証 ──
    const body = (req.body ?? {}) as Record<string, unknown>
    const userId = body.userId
    const syncType = body.syncType
    const itemCount = Number(body.itemCount)
    const durationMs = Number(body.durationMs)
    const success = body.success
    const errorMsg = body.errorMsg ?? null

    if (!isUuid(userId)) {
      return res.status(400).json({ error: 'invalid userId' })
    }
    if (userId !== authedUserId) {
      // header の token と body の userId が一致しない場合は拒否。
      // ログにも残してなりすまし試行を検知できるようにする。
      console.warn('[sync-telemetry] userId mismatch', { authed: authedUserId, body: userId })
      return res.status(403).json({ error: 'userId does not match token' })
    }
    if (typeof syncType !== 'string' || syncType.length === 0 || syncType.length > 64) {
      return res.status(400).json({ error: 'invalid syncType' })
    }
    // 未知の syncType も将来追加を考えて拒否はせず warn のみ
    if (!VALID_SYNC_TYPES.has(syncType)) {
      console.warn('[sync-telemetry] unknown syncType:', syncType)
    }
    if (!Number.isFinite(itemCount) || itemCount < 0 || itemCount > 1_000_000) {
      return res.status(400).json({ error: 'invalid itemCount' })
    }
    if (!Number.isFinite(durationMs) || durationMs < 0 || durationMs > 10 * 60 * 1000) {
      return res.status(400).json({ error: 'invalid durationMs' })
    }
    if (typeof success !== 'boolean') {
      return res.status(400).json({ error: 'invalid success' })
    }
    if (errorMsg !== null && (typeof errorMsg !== 'string' || errorMsg.length > 2000)) {
      return res.status(400).json({ error: 'invalid errorMsg' })
    }

    try {
      const { error } = await supabase.from('sync_telemetry').insert({
        user_id: userId,
        sync_type: syncType,
        item_count: Math.floor(itemCount),
        duration_ms: Math.floor(durationMs),
        success,
        error_msg: errorMsg,
      })
      if (error) {
        if (error.code === '42P01') {
          console.warn('[sync-telemetry] table not found — apply 028_sync_telemetry.sql')
          return res.status(503).json({ error: 'table not migrated' })
        }
        console.error('[sync-telemetry] insert error:', error.message)
        return res.status(500).json({ error: error.message })
      }
      return res.json({ ok: true })
    } catch (e) {
      console.error('[sync-telemetry] handler error:', e)
      return res.status(500).json({ error: 'internal_error' })
    }
  })

  return router
}
