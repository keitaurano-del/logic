/**
 * aiQuota.ts — AI 生成エンドポイント共通の本人別月次クォータ（P1 セキュリティ: LR-10）
 *
 * 目的:
 *  - クライアント申告の body.userId を信頼せず、Authorization: Bearer から解決した
 *    認証済み user id（resolveAuthedUser 由来）で per-user 月次クォータを数える。
 *  - 有料/無料に関わらず月次ハードキャップを設け、userId 偽装による原価青天井を防ぐ。
 *
 * 識別と挙動:
 *  - authedUserId が無い（＝ゲスト）→ クォータは数えず allowed:true を返す。
 *    ゲストは従来どおりレートリミッタ任せ（UX を壊さない・401 で弾かない）。
 *  - 無料プラン → 既存挙動を維持（AI 生成は有料機能なので拒否）。
 *  - 有料プラン → env 設定可能な月次ハードキャップ（AI_MONTHLY_HARD_CAP_PAID、
 *    既定 10000）を超えたら拒否。未満なら許可してカウントを +1 する。
 *
 * カウント保存先は既存の profiles.ai_gen_count / profiles.ai_gen_month を踏襲（新テーブル無し）。
 * DB エラー時はベストエフォートで通す（クォータで生成自体を巻き添えにしない）。
 */

import type { SupabaseClient } from '@supabase/supabase-js'

// 有料プラン判定（problems.ts / custom-course.ts と揃える）。
export const PAID_PLANS = new Set([
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

// 有料プランの月次ハードキャップ既定値。乱用検知向けに十分大きい値（通常利用では到達しない）。
// 本番では env AI_MONTHLY_HARD_CAP_PAID で上書きできる（TTS_DAILY_CHAR_LIMIT と同じ流儀）。
export const DEFAULT_AI_MONTHLY_HARD_CAP_PAID = 10000

/** env から有料の月次ハードキャップを読む。未設定/不正値は既定値にフォールバック。 */
export function paidMonthlyHardCap(env: NodeJS.ProcessEnv = process.env): number {
  const raw = Number(env.AI_MONTHLY_HARD_CAP_PAID)
  if (!Number.isFinite(raw) || raw <= 0) return DEFAULT_AI_MONTHLY_HARD_CAP_PAID
  return Math.floor(raw)
}

export function monthKey(now: Date = new Date()): string {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export interface QuotaResult {
  allowed: boolean
  /** 拒否時のユーザー向け理由（無料プラン拒否 / ハードキャップ超過）。 */
  reason?: string
  /** ハードキャップ超過で拒否したか（呼び出し側が 429 を返す判断に使える）。 */
  capExceeded?: boolean
}

/**
 * 認証済み user id で月次クォータを確認し、許可なら +1 してカウントする。
 *
 * @param supabase service-role クライアント（null なら数えず許可）
 * @param authedUserId resolveAuthedUser 由来の認証済み id。undefined/null はゲスト。
 *
 * body.userId は一切受け取らない（識別はサーバ検証済みの authedUserId のみ）。
 */
export async function checkAndIncrementAIQuota(
  supabase: SupabaseClient | null,
  authedUserId: string | null | undefined,
): Promise<QuotaResult> {
  // ゲスト（認証なし）はレートリミッタに任せる。クライアント申告 userId は使わない。
  if (!supabase || !authedUserId) return { allowed: true }

  try {
    const mk = monthKey()
    const { data: profile } = await supabase
      .from('profiles')
      .select('ai_gen_count, ai_gen_month, plan')
      .eq('id', authedUserId)
      .single()

    const currentPlan = profile?.plan ?? 'free'
    if (!PAID_PLANS.has(currentPlan)) {
      // 無料プランは AI 生成不可（既存挙動を維持）。
      return {
        allowed: false,
        reason: 'AI 問題生成は有料プランの機能です。プランをアップグレードしてください。',
      }
    }

    // 当月のカウントを取り出す（月が変わっていれば 0 にリセット）。
    const savedMonth = profile?.ai_gen_month ?? ''
    const count = savedMonth === mk ? (profile?.ai_gen_count ?? 0) : 0

    // 有料でも月次ハードキャップを超えたら拒否（userId 偽装による原価青天井の防止）。
    const cap = paidMonthlyHardCap()
    if (count >= cap) {
      return {
        allowed: false,
        capExceeded: true,
        reason: '今月の AI 生成回数の上限に達しました。時間をおいて再度お試しください。',
      }
    }

    await supabase.from('profiles').upsert(
      { id: authedUserId, ai_gen_count: count + 1, ai_gen_month: mk },
      { onConflict: 'id' },
    )
    return { allowed: true }
  } catch {
    // DB エラー時は通す（クォータはベストエフォート）。
    return { allowed: true }
  }
}
