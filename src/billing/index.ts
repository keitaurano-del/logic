/**
 * Google Play Billing abstraction layer (SCRUM-116)
 *
 * Uses Capacitor native bridge to interface with Google Play Billing Library.
 * On web, returns stub implementations.
 */

import { Capacitor, registerPlugin } from '@capacitor/core'
import { API_BASE } from '../apiBase'
import type { BillingProduct, PurchaseResult, BillingVerifyRequest } from './types'

// Re-export types for consumers
export type { BillingProduct, PurchaseResult, BillingVerifyRequest }

// ---------------------------------------------------------------------------
// Capacitor Plugin Interface
// ---------------------------------------------------------------------------

interface InAppBillingPlugin {
  /**
   * Initialize the billing client. Must be called before using other methods.
   */
  initialize(): Promise<{ success: boolean }>

  /**
   * Fetch product details for the given product IDs.
   * @param productIds Array of product IDs from Play Store Console
   */
  getProducts(options: {
    productIds: string[]
  }): Promise<{ products: BillingProduct[] }>

  /**
   * Launch the purchase flow for a specific product.
   * @param productId Product ID from Play Store Console
   */
  purchaseProduct(options: { productId: string }): Promise<{
    success: boolean
    purchase?: PurchaseResult
    error?: string
  }>

  /**
   * Restore previously purchased items.
   */
  restorePurchases(): Promise<{ purchases: PurchaseResult[] }>

  /**
   * Query purchase history for a specific product.
   */
  queryPurchaseHistory(options: {
    productType: 'subs' | 'inapp'
  }): Promise<{ purchases: PurchaseResult[] }>
}

const plugin = registerPlugin<InAppBillingPlugin>('InAppBillingPlugin', {
  web: () => ({
    initialize: async () => ({ success: true }),
    getProducts: async () => ({ products: [] }),
    purchaseProduct: async () => ({
      success: false,
      error: 'Not available on web',
    }),
    restorePurchases: async () => ({ purchases: [] }),
    queryPurchaseHistory: async () => ({ purchases: [] }),
  }),
})

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Initialize the billing client.
 * Must be called once during app startup.
 */
export async function initBilling(): Promise<void> {
  try {
    const result = await plugin.initialize()
    if (result.success) {
      if (import.meta.env.DEV) {
        console.debug('[billing] Plugin initialized')
      }
    } else {
      console.warn('[billing] Initialization returned false')
    }
  } catch (error) {
    console.error('[billing] Initialization failed:', error)
  }
}

/**
 * Fetch product details for the given product IDs from Google Play.
 */
export async function getProducts(productIds: string[]): Promise<BillingProduct[]> {
  if (!isAndroidNative()) {
    if (import.meta.env.DEV) {
      console.debug('[billing] getProducts() stub — not Android native')
    }
    return []
  }

  try {
    const result = await plugin.getProducts({ productIds })
    return result.products || []
  } catch (error) {
    console.error('[billing] getProducts() failed:', error)
    return []
  }
}

/**
 * Initiate a purchase flow for the given product ID.
 * Throws if purchase fails or if plugin is unavailable.
 */
export async function purchaseProduct(productId: string): Promise<PurchaseResult> {
  if (!isAndroidNative()) {
    throw new Error('Google Play Billing プラグインが利用できません。(Web のみ)')
  }

  try {
    const result = await plugin.purchaseProduct({ productId })
    if (!result.success || !result.purchase) {
      throw new Error(
        result.error || '購入フローが完了しませんでした。別のエラーが発生した可能性があります。'
      )
    }
    return result.purchase
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : '購入処理に失敗しました。もう一度お試しください。'
    throw new Error(message)
  }
}

/**
 * Restore previously completed purchases.
 * Queries billing client for all owned subscriptions.
 */
export async function restorePurchases(): Promise<PurchaseResult[]> {
  if (!isAndroidNative()) {
    if (import.meta.env.DEV) {
      console.debug('[billing] restorePurchases() stub — not Android native')
    }
    return []
  }

  try {
    const result = await plugin.restorePurchases()
    return result.purchases || []
  } catch (error) {
    console.error('[billing] restorePurchases() failed:', error)
    return []
  }
}

/**
 * Send a purchase token to the server for verification and subscription
 * activation. POSTs to `${API_BASE}/api/billing/verify`.
 */
export async function verifyPurchase(request: BillingVerifyRequest): Promise<void> {
  const res = await fetch(`${API_BASE}/api/billing/verify`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request),
  })
  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: string }
    throw new Error(err.error ?? '購入の検証に失敗しました')
  }
}

// ---------------------------------------------------------------------------
// Platform Detection
// ---------------------------------------------------------------------------

/**
 * Check if running on Android native platform.
 */
function isAndroidNative(): boolean {
  return Capacitor.getPlatform() === 'android'
}
