/**
 * auth.ts — サーバーサイドの認証・課金エンタイトルメント共通ヘルパ（P0 セキュリティ: LR-1/2/3）
 *
 * - resolveAuthedUser: Authorization: Bearer <token> を service-role クライアントで検証し
 *   認証済みユーザーを解決する。クライアントが body で送る userId は信用しない。
 * - assertSecureAdminSecret: 本番起動ガード。ADMIN_SECRET が未設定/既定値なら production で exit。
 * - computeIsPaid: subscriptions 行から「有効な有料状態か」を純粋関数で判定する。
 *
 * server/index.ts と server/routes/billing.ts から共通利用する。
 * テスト容易性のため依存（supabase / exit）は引数注入できる形にしている。
 */

import type { Request, RequestHandler } from 'express'
import type { SupabaseClient } from '@supabase/supabase-js'

// ADMIN_SECRET の安全でない既定値（過去にデフォルトとして配布されていた値）。
// 本番でこの値 / 未設定のままだと管理 API が事実上ノーガードになるため起動を拒否する。
export const INSECURE_ADMIN_SECRET_DEFAULT = 'logic-admin-2026'

export interface AuthedUser {
  id: string
  email: string | null
}

/**
 * Bearer トークンを Authorization ヘッダから検証し、認証済みユーザーを解決する。
 * service-role クライアントで supabase.auth.getUser(token) を呼びサーバー側で検証する。
 * 欠落 / 不正 Bearer / 検証失敗 / supabase 未設定はすべて null を返す（throw しない）。
 */
export async function resolveAuthedUser(
  req: Pick<Request, 'headers'>,
  supabase: SupabaseClient | null,
): Promise<AuthedUser | null> {
  if (!supabase) return null
  const header = req.headers.authorization
  if (typeof header !== 'string' || !header.startsWith('Bearer ')) return null
  const token = header.slice(7).trim()
  if (!token) return null
  try {
    const { data, error } = await supabase.auth.getUser(token)
    if (error || !data?.user) return null
    return { id: data.user.id, email: data.user.email ?? null }
  } catch {
    return null
  }
}

/**
 * 本番起動ガード: ADMIN_SECRET が未設定または既定値のままなら production では起動失敗。
 * 非 production では警告ログのみで起動は継続する（ローカル/SIT 開発を壊さない）。
 * exit は注入可能（テストでは throw させて検証する）。
 */
export function assertSecureAdminSecret(
  env: NodeJS.ProcessEnv = process.env,
  onFatal: (msg: string) => never = (msg) => { console.error(msg); process.exit(1) },
): void {
  const secret = env.ADMIN_SECRET
  const insecure = !secret || secret === INSECURE_ADMIN_SECRET_DEFAULT
  if (!insecure) return
  if (env.NODE_ENV === 'production') {
    onFatal('[FATAL] ADMIN_SECRET is unset or uses the insecure default; refusing to start in production')
  } else {
    console.warn('[WARN] ADMIN_SECRET is unset or uses the insecure default. This is allowed outside production, but set a strong random value before deploying.')
  }
}

/**
 * subscriptions 行から「有効な有料状態か」を判定する純粋関数。
 * status==='active' かつ current_period_end > now の場合のみ true。
 */
export function computeIsPaid(
  row: { status?: string | null; current_period_end?: string | null } | null | undefined,
  now: number = Date.now(),
): boolean {
  if (!row) return false
  if (row.status !== 'active') return false
  if (!row.current_period_end) return false
  return new Date(row.current_period_end).getTime() > now
}

/**
 * GET /api/entitlement のハンドラを生成する（LR-2）。
 * - 認証済みユーザーの subscriptions を service-role で参照し { isPaid } を返す。
 * - 未認証は 401、supabase 未設定は 503。
 * index.ts とテストで共通利用するため factory にしている。
 */
export function createEntitlementHandler(supabase: SupabaseClient | null): RequestHandler {
  return async (req, res) => {
    const user = await resolveAuthedUser(req, supabase)
    if (!user) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }
    if (!supabase) {
      res.status(503).json({ error: 'Supabase not configured' })
      return
    }
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('status, current_period_end')
        .eq('user_id', user.id)
        .maybeSingle()

      if (error) {
        console.error('[entitlement] Supabase error:', error.message)
        res.status(500).json({ error: error.message })
        return
      }

      res.json({ isPaid: computeIsPaid(data as { status?: string | null; current_period_end?: string | null } | null) })
    } catch (e: unknown) {
      res.status(500).json({ error: e instanceof Error ? e.message : String(e) })
    }
  }
}
