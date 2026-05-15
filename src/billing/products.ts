/**
 * Play Store / App Store product IDs.
 *
 * 2026-05-15: 単一有料プラン化に伴い `logic_paid_monthly` / `logic_paid_yearly` のみ採用。
 * Legacy product ID（standard_*, premium_*, basic_*, campaign_*）は購入実績が
 * ほぼ無いものの、過去の購読が読み込まれた場合に正しく `paid_monthly` /
 * `paid_yearly` に正規化できるよう mapProductIdToPlan() に残してある。
 */

export const PLAY_PRODUCTS = {
  monthly: 'logic_paid_monthly',
  yearly: 'logic_paid_yearly',
} as const

export type PlayProductKey = keyof typeof PLAY_PRODUCTS
export type PlayProductId = typeof PLAY_PRODUCTS[PlayProductKey]

// productId → SubscriptionPlan のマップ。circular import を避けるため
// ここでは plan 文字列だけを返す。caller 側で normalizeLegacyPlan() を通せば
// 'free' | 'paid_monthly' | 'paid_yearly' の SubscriptionPlan に揃う。
export function mapProductIdToPlan(productId: string): 'paid_monthly' | 'paid_yearly' | null {
  switch (productId) {
    case 'logic_paid_monthly':
    case 'logic_standard_monthly':
    case 'logic_premium_monthly':
    case 'logic_basic_monthly':
      return 'paid_monthly'
    case 'logic_paid_yearly':
    case 'logic_standard_yearly':
    case 'logic_premium_yearly':
    case 'logic_basic_yearly':
    case 'logic_campaign_yearly':
      return 'paid_yearly'
    default:
      return null
  }
}
