/**
 * /api/study-sessions
 *
 * - POST  /api/study-sessions          単一セッションを記録（mount→unmount 1サイクル）
 * - GET   /api/study-sessions/stats    user_id 指定で集計を返す（日別 / activity_type 別）
 *
 * 設計:
 * - 認証は今のところクライアントから渡される user_id を信頼する軽量モデル。
 *   将来 access token verify に差し替える前提（RLS が server-side では効かないため、
 *   service role key 経由で書く今の構成では client から user_id を受け取る）。
 * - duration_ms の妥当性は (0 < x < 3h) で server 側でもクランプ。
 * - failure は 200 で no-op に倒さず、4xx / 5xx を返すが、クライアント側は
 *   fire-and-forget なので UX をブロックしない。
 */

import { Router, type Request, type Response } from 'express'
import type { SupabaseClient } from '@supabase/supabase-js'

type SupabaseLike = SupabaseClient | null

const ACTIVITY_TYPES = new Set([
  'lesson',
  'fermi',
  'journal',
  'flashcard',
  'ai_problem',
  'daily_problem',
])

const MAX_DURATION_MS = 3 * 60 * 60 * 1000

function isUuid(s: unknown): s is string {
  return typeof s === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s)
}

function isIso(s: unknown): s is string {
  if (typeof s !== 'string') return false
  const d = new Date(s)
  return !Number.isNaN(d.getTime())
}

export function createStudySessionsRouter(supabase: SupabaseLike): Router {
  const router = Router()

  // ── POST /api/study-sessions ──────────────────────────
  router.post('/study-sessions', async (req: Request, res: Response) => {
    if (!supabase) return res.status(503).json({ error: 'Supabase not configured' })
    try {
      const body = (req.body ?? {}) as Record<string, unknown>
      const user_id = body.user_id
      const activity_type = body.activity_type
      const activity_id = body.activity_id ?? null
      const started_at = body.started_at
      const ended_at = body.ended_at
      const duration_ms = Number(body.duration_ms)
      const metadata = (body.metadata && typeof body.metadata === 'object') ? body.metadata : {}

      if (!isUuid(user_id)) return res.status(400).json({ error: 'invalid user_id' })
      if (typeof activity_type !== 'string' || !ACTIVITY_TYPES.has(activity_type)) {
        return res.status(400).json({ error: 'invalid activity_type' })
      }
      if (!isIso(started_at) || !isIso(ended_at)) {
        return res.status(400).json({ error: 'invalid timestamps' })
      }
      if (!Number.isFinite(duration_ms) || duration_ms <= 0 || duration_ms > MAX_DURATION_MS) {
        return res.status(400).json({ error: 'invalid duration_ms' })
      }
      if (activity_id !== null && typeof activity_id !== 'string') {
        return res.status(400).json({ error: 'invalid activity_id' })
      }

      const { error } = await supabase.from('study_sessions').insert({
        user_id,
        activity_type,
        activity_id,
        started_at,
        ended_at,
        duration_ms: Math.floor(duration_ms),
        metadata,
      })
      if (error) {
        // テーブル未作成（42P01）は warn のみで 503 を返す（migration 適用前）
        if (error.code === '42P01') {
          console.warn('[study-sessions] table not found — apply 020_study_sessions.sql')
          return res.status(503).json({ error: 'table not migrated' })
        }
        console.error('[study-sessions] insert error:', error.message)
        return res.status(500).json({ error: error.message })
      }
      return res.json({ ok: true })
    } catch (e) {
      console.error('[study-sessions] handler error:', e)
      return res.status(500).json({ error: 'internal_error' })
    }
  })

  // ── GET /api/study-sessions/stats ─────────────────────
  // クエリ: ?user_id=...&days=30
  router.get('/study-sessions/stats', async (req: Request, res: Response) => {
    if (!supabase) return res.status(503).json({ error: 'Supabase not configured' })
    try {
      const user_id = req.query.user_id
      if (!isUuid(user_id)) return res.status(400).json({ error: 'invalid user_id' })
      const days = Math.min(Math.max(parseInt(String(req.query.days ?? '30'), 10) || 30, 1), 365)

      const since = new Date(Date.now() - days * 86400_000).toISOString()

      const { data, error } = await supabase
        .from('study_sessions')
        .select('activity_type, activity_id, started_at, duration_ms')
        .eq('user_id', user_id)
        .gte('started_at', since)
        .order('started_at', { ascending: false })
        .limit(5000)

      if (error) {
        if (error.code === '42P01') {
          return res.status(503).json({ error: 'table not migrated' })
        }
        return res.status(500).json({ error: error.message })
      }

      // ── 集計 ───────────────────────────────
      const byDay: Record<string, number> = {}
      const byType: Record<string, number> = {}
      const byActivity: Record<string, number> = {}
      let total = 0
      for (const row of data ?? []) {
        const ms = row.duration_ms ?? 0
        total += ms
        const dateStr = (row.started_at ?? '').slice(0, 10)
        if (dateStr) byDay[dateStr] = (byDay[dateStr] ?? 0) + ms
        const at = row.activity_type ?? 'unknown'
        byType[at] = (byType[at] ?? 0) + ms
        if (row.activity_id) {
          const key = `${at}:${row.activity_id}`
          byActivity[key] = (byActivity[key] ?? 0) + ms
        }
      }

      // raw セッション一覧（最大 1000 件）も返す。
      // StudyTimeScreen の「日付タップ → その日の学習内訳」で、
      // JST 集計やアクティビティ別内訳を組み立てるのに使う。
      // 余分なペイロードを避けるため、必要最小限のフィールドのみ。
      const sessions = (data ?? []).slice(0, 1000).map((r) => ({
        activity_type: r.activity_type ?? null,
        activity_id: r.activity_id ?? null,
        started_at: r.started_at ?? null,
        duration_ms: r.duration_ms ?? 0,
      }))

      return res.json({
        total_ms: total,
        days,
        by_day: byDay,
        by_type: byType,
        by_activity: byActivity,
        session_count: (data ?? []).length,
        sessions,
      })
    } catch (e) {
      console.error('[study-sessions/stats] error:', e)
      return res.status(500).json({ error: 'internal_error' })
    }
  })

  return router
}
