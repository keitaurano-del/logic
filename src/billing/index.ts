/**
 * Google Play Billing abstraction layer (SCRUM-116)
 *
 * Plugin packages were unavailable at install time, so this module provides
 * TypeScript stubs that log in dev mode. When a compatible plugin is available
 * the `getPlugin()` helper should return it instead of null.
 */

import { API_BASE } from '../apiBase'
import type { BillingProduct, PurchaseResult, BillingVerifyRequest } from './types'

// Re-export types for consumers
export type { BillingProduct, PurchaseResult, BillingVerifyRequest }

// ---------------------------------------------------------------------------
// Plugin detection
// ---------------------------------------------------------------------------

/**
 * Minimal interface describing the subset of a Capacitor in-app-purchases
 * plugin that this module uses. Typed loosely enough to work with multiple
 * potential plugin packages while remaining free of `any`.
 */
interface InAppPurchasePlugin {
  getProducts(opts: { productIds: string[] }): Promise<{ products: BillingProduct[] }>
  purchaseProduct(opts: { productId: string }): Promise<{ purchase: PurchaseResult }>
  restorePurchases(): Promise<{ purchases: PurchaseResult[] }>
}

/**
 * Try to resolve the native in-app-purchase plugin from the Capacitor global.
 * Returns `null` when running on web or when no plugin is registered.
 */
function getPlugin(): InAppPurchasePlugin | null {
  try {
    const cap = (window as unknown as Record<string, unknown>).Capacitor as
      | { Plugins?: Record<string, unknown> }
      | undefined

    const plugin = cap?.Plugins?.['InAppPurchases'] as InAppPurchasePlugin | undefined
    if (plugin && typeof plugin.purchaseProduct === 'function') {
      return plugin
    }
  } catch {
    // ignore
  }
  return null
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Initialize the billing client.
 * On web / when the plugin is absent this is a no-op (dev log only).
 */
export async function initBilling(): Promise<void> {
  const plugin = getPlugin()
  if (!plugin) {
    if (import.meta.env.DEV) {
      console.debug('[billing] Plugin not available — running in stub mode')
    }
    return
  }
  // Plugin-specific initialisation would go here if the plugin requires it.
  if (import.meta.env.DEV) {
    console.debug('[billing] Plugin initialised')
  }
}

/**
 * Fetch product details for the given product IDs from Google Play.
 * Returns an empty array in stub mode.
 */
export async function getProducts(productIds: string[]): Promise<BillingProduct[]> {
  const plugin = getPlugin()
  if (!plugin) {
    if (import.meta.env.DEV) {
      console.debug('[billing] getProducts() stub — returning []', productIds)
    }
    return []
  }
  const result = await plugin.getProducts({ productIds })
  return result.products
}

/**
 * Initiate a purchase flow for the given product ID.
 * Throws in stub mode so callers can handle the "not available" case.
 */
export async function purchaseProduct(productId: string): Promise<PurchaseResult> {
  const plugin = getPlugin()
  if (!plugin) {
    if (import.meta.env.DEV) {
      console.debug('[billing] purchaseProduct() stub called with', productId)
    }
    throw new Error('Google Play Billingプラグインが利用できません。')
  }
  const result = await plugin.purchaseProduct({ productId })
  return result.purchase
}

/**
 * Restore previously completed purchases.
 * Returns an empty array in stub mode.
 */
export async function restorePurchases(): Promise<PurchaseResult[]> {
  const plugin = getPlugin()
  if (!plugin) {
    if (import.meta.env.DEV) {
      console.debug('[billing] restorePurchases() stub — returning []')
    }
    return []
  }
  const result = await plugin.restorePurchases()
  return result.purchases
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
    const err = await res.json().catch(() => ({})) as { error?: string }
    throw new Error(err.error ?? '購入の検証に失敗しました')
  }
}
