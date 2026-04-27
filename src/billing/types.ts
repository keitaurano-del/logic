export interface BillingProduct {
  productId: string
  title: string
  description: string
  price: string
  priceAmountMicros: number
  priceCurrencyCode: string
}

export interface PurchaseResult {
  purchaseToken: string
  productId: string
  orderId: string
  purchaseTime: number
}

export interface BillingVerifyRequest {
  purchaseToken: string
  productId: string
  userId?: string
}
