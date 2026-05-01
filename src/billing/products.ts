export const PLAY_PRODUCTS = {
  standard_monthly: 'logic_standard_monthly',
  standard_yearly: 'logic_standard_yearly',
  premium_monthly: 'logic_premium_monthly',
  premium_yearly: 'logic_premium_yearly',
  campaign_yearly: 'logic_campaign_yearly',
} as const

export type PlayProductKey = keyof typeof PLAY_PRODUCTS
export type PlayProductId = typeof PLAY_PRODUCTS[PlayProductKey]
