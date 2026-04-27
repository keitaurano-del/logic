export const PLAY_PRODUCTS = {
  basic_monthly: 'logic_basic_monthly',
  basic_yearly: 'logic_basic_yearly',
  standard_monthly: 'logic_standard_monthly',
  standard_yearly: 'logic_standard_yearly',
  premium_monthly: 'logic_premium_monthly',
  premium_yearly: 'logic_premium_yearly',
} as const

export type PlayProductKey = keyof typeof PLAY_PRODUCTS
export type PlayProductId = typeof PLAY_PRODUCTS[PlayProductKey]
