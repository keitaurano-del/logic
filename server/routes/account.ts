/**
 * account.ts — アカウント削除ルート（LR-5 / Google Play データ削除要件）
 *
 * createAccountRouter(deps) を呼び出して Router を取得する。
 * 依存する supabase（service-role クライアント）は引数で受け取る（server/index.ts が注入する）。
 *
 * 登録されるルート:
 *   POST /api/account/delete — 認証ユーザー本人のアカウント＋所有データを削除
 *
 * 削除モデル（supabase/migrations/ を実調査して決定）:
 * - public.profiles は auth.users(id) を `on delete cascade` で参照しており、
 *   profiles を親に持つ user_id テーブル群（progress / notebooks / roadmap_progress /
 *   subscriptions / placement_results / admin_overrides 等）と、auth.users(id) を
 *   直接 cascade 参照するテーブル群（user_progress / user_placement / user_settings /
 *   daily_journals / goals / goal_reviews / user_ai_problems / user_ai_problem_ratings /
 *   study_sessions / user_flashcards / user_wrong_answers / user_saved_items /
 *   user_roadmap_goals / sync_telemetry / journal_assistant_conversations /
 *   user_custom_courses / user_ai_course_usage / saved_item_folders / daily_activity）は、
 *   service-role の supabase.auth.admin.deleteUser(user.id) を呼べば DB の FK CASCADE で
 *   自動削除される（= ここで明示削除しない）。
 * - 例外: public.fermi_scores は user_id が TEXT（FK 無し・auth.users を参照しない）で、
 *   認証ユーザーの場合は auth UUID を文字列として保持する。CASCADE が効かないため、
 *   admin.deleteUser の前後で明示的に delete().eq('user_id', user.id) する。
 * - public.reports は user_id が `on delete set null`（匿名化して保持する設計）なので削除しない。
 */

import { Router, type Request, type Response } from 'express'
import rateLimit from 'express-rate-limit'
import type { SupabaseClient } from '@supabase/supabase-js'
import { resolveAuthedUser } from '../auth.js'

interface AccountDeps {
  supabase: SupabaseClient | null
}

/**
 * CASCADE が効かず、明示削除が必要なテーブルと所有列の定義。
 * - fermi_scores.user_id は TEXT（auth.users への FK が無い）ため CASCADE 対象外。
 *   実在するテーブル/列のみを列挙している（憶測で追加しない）。
 */
const EXPLICIT_DELETE_TARGETS: ReadonlyArray<{ table: string; column: string }> = [
  { table: 'fermi_scores', column: 'user_id' },
]

// /api/account/delete 専用 limiter: 1 分あたり 5 回 / IP。
// 通常は本人が一度だけ叩く操作なので、既存の軽量 limiter パターンに倣って軽く制限する。
const accountDeleteLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many account deletion requests. Please wait a minute.' },
})

export function createAccountRouter(deps: AccountDeps): Router {
  const { supabase } = deps
  const router = Router()

  // ------------------------------------------
  // アカウント削除（LR-5）
  // ------------------------------------------
  // - Authorization: Bearer <Supabase access_token> を service-role で検証して本人を解決。
  // - 認証ユーザー本人だけが自分のアカウントを削除できる（body の userId 等は信用しない）。
  // - admin.deleteUser で auth ユーザーを削除 → FK CASCADE で所有データが連鎖削除される。
  // - CASCADE が効かないテーブル（fermi_scores）は明示削除する。
  // - 部分失敗に強く、各 delete の error はログに残しつつ処理を継続する（冪等運用）。
  router.post('/delete', accountDeleteLimiter, async (req: Request, res: Response) => {
    const user = await resolveAuthedUser(req, supabase)
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' })
    }
    // resolveAuthedUser が user を返した時点で supabase は非 null だが、
    // 型を狭めるために明示チェックする。
    if (!supabase) {
      return res.status(503).json({ error: 'Supabase not configured' })
    }

    const userId = user.id

    // 1) CASCADE 対象外テーブルの明示削除（admin.deleteUser の前に実施）。
    //    部分失敗してもアカウント本体の削除は続行する。
    for (const target of EXPLICIT_DELETE_TARGETS) {
      try {
        const { error } = await supabase
          .from(target.table)
          .delete()
          .eq(target.column, userId)
        if (error) {
          console.error(`[account/delete] ${target.table} delete error:`, error.message)
        }
      } catch (e) {
        console.error(`[account/delete] ${target.table} delete threw:`, e)
      }
    }

    // 2) 認証ユーザー本体を削除。FK CASCADE により profiles 配下・auth.users 直参照の
    //    所有データが連鎖削除される。
    try {
      const { error } = await supabase.auth.admin.deleteUser(userId)
      if (error) {
        console.error('[account/delete] auth.admin.deleteUser error:', error.message)
        return res.status(500).json({ error: error.message })
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e)
      console.error('[account/delete] auth.admin.deleteUser threw:', e)
      return res.status(500).json({ error: message })
    }

    return res.json({ ok: true })
  })

  return router
}
