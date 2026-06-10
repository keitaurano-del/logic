/**
 * LR-16: 購入検証失敗の回復ロジックのテスト。
 *
 * 副作用（Capacitor / fetch）を持たない純粋ロジックと、依存注入版の回復フローを
 * 検証する。restorePurchases / verifyPurchase はモックする。
 *
 * 検証観点:
 * - 指数バックオフの待機計算（上限・0 クランプ）
 * - リトライ判定（一時的 = リトライ / 恒久的 = 打ち切り）
 * - 「entitlement 未課金（false）時のみ復旧を試みる」判定
 * - verifyWithBackoff: 成功で打ち切り / 恒久失敗は即終了 / 一時失敗はリトライ後上限で終了
 * - runRecoveryFlow: 購入無しは no-op / 複数購入の成功件数集計
 */
import { describe, expect, it, vi } from 'vitest'
import {
  computeBackoffDelay,
  isRetriableError,
  shouldAttemptRecovery,
  verifyWithBackoff,
  runRecoveryFlow,
  DEFAULT_BACKOFF,
  type RecoveryDeps,
} from '../billing/recovery'
import type { PurchaseResult } from '../billing/types'

const PURCHASE: PurchaseResult = {
  purchaseToken: 'tok-1',
  productId: 'logic_paid_monthly',
  orderId: 'order-1',
  purchaseTime: 1_700_000_000_000,
}

function makeDeps(overrides: Partial<RecoveryDeps> = {}): RecoveryDeps {
  return {
    restorePurchases: vi.fn(async () => [PURCHASE]),
    verifyPurchase: vi.fn(async () => ({ currentPeriodEnd: '2027-01-01T00:00:00Z', plan: 'paid_monthly' })),
    // テストでは即時 resolve（実時間を待たない）。
    sleep: vi.fn(async () => {}),
    backoff: { maxAttempts: 4, baseDelayMs: 100, maxDelayMs: 1000 },
    ...overrides,
  }
}

describe('LR-16 computeBackoffDelay', () => {
  it('grows exponentially from the base delay', () => {
    const cfg = { maxAttempts: 5, baseDelayMs: 100, maxDelayMs: 100_000 }
    expect(computeBackoffDelay(0, cfg)).toBe(100)
    expect(computeBackoffDelay(1, cfg)).toBe(200)
    expect(computeBackoffDelay(2, cfg)).toBe(400)
    expect(computeBackoffDelay(3, cfg)).toBe(800)
  })
  it('caps at maxDelayMs', () => {
    const cfg = { maxAttempts: 10, baseDelayMs: 400, maxDelayMs: 5000 }
    expect(computeBackoffDelay(10, cfg)).toBe(5000)
  })
  it('clamps negative attempts to 0', () => {
    expect(computeBackoffDelay(-1)).toBe(0)
  })
  it('uses DEFAULT_BACKOFF when no config given', () => {
    expect(computeBackoffDelay(0)).toBe(DEFAULT_BACKOFF.baseDelayMs)
  })
})

describe('LR-16 isRetriableError', () => {
  it('treats network/timeout errors as retriable', () => {
    expect(isRetriableError(new Error('Network request failed'))).toBe(true)
    expect(isRetriableError(new Error('fetch failed'))).toBe(true)
    expect(isRetriableError(new Error('request timed out'))).toBe(true)
    expect(isRetriableError(new Error('ネットワークエラー'))).toBe(true)
  })
  it('treats 5xx as retriable', () => {
    expect(isRetriableError(new Error('Server responded 503'))).toBe(true)
    expect(isRetriableError(new Error('500 Internal Server Error'))).toBe(true)
  })
  it('treats 4xx / auth / invalid as permanent (no retry)', () => {
    expect(isRetriableError(new Error('401 Unauthorized'))).toBe(false)
    expect(isRetriableError(new Error('購入の検証に失敗しました'))).toBe(false)
    expect(isRetriableError(new Error('invalid purchase token'))).toBe(false)
    expect(isRetriableError(new Error('404 not found'))).toBe(false)
  })
  it('does not retry unknown/empty errors (safe side)', () => {
    expect(isRetriableError(new Error('something weird'))).toBe(false)
    expect(isRetriableError(undefined)).toBe(false)
    expect(isRetriableError(null)).toBe(false)
  })
})

describe('LR-16 shouldAttemptRecovery', () => {
  it('attempts only when the server says unpaid (false)', () => {
    expect(shouldAttemptRecovery(false)).toBe(true)
  })
  it('does not attempt when paid (true)', () => {
    expect(shouldAttemptRecovery(true)).toBe(false)
  })
  it('does not attempt when unknown (null = offline / not logged in)', () => {
    expect(shouldAttemptRecovery(null)).toBe(false)
  })
})

describe('LR-16 verifyWithBackoff', () => {
  it('returns true and does not retry on first success', async () => {
    const deps = makeDeps()
    const ok = await verifyWithBackoff(PURCHASE, deps)
    expect(ok).toBe(true)
    expect(deps.verifyPurchase).toHaveBeenCalledTimes(1)
    expect(deps.sleep).not.toHaveBeenCalled()
  })

  it('stops immediately on a permanent failure (no retry, no sleep)', async () => {
    const verifyPurchase = vi.fn(async () => {
      throw new Error('401 Unauthorized')
    })
    const deps = makeDeps({ verifyPurchase })
    const ok = await verifyWithBackoff(PURCHASE, deps)
    expect(ok).toBe(false)
    expect(verifyPurchase).toHaveBeenCalledTimes(1)
    expect(deps.sleep).not.toHaveBeenCalled()
  })

  it('retries transient failures up to maxAttempts then gives up', async () => {
    const verifyPurchase = vi.fn(async () => {
      throw new Error('Network request failed')
    })
    const deps = makeDeps({ verifyPurchase })
    const ok = await verifyWithBackoff(PURCHASE, deps)
    expect(ok).toBe(false)
    // maxAttempts = 4 → 4 回呼ばれ、間に 3 回 sleep。
    expect(verifyPurchase).toHaveBeenCalledTimes(4)
    expect(deps.sleep).toHaveBeenCalledTimes(3)
  })

  it('succeeds after a transient failure then a success', async () => {
    let calls = 0
    const verifyPurchase = vi.fn(async () => {
      calls++
      if (calls === 1) throw new Error('503 temporarily unavailable')
      return { currentPeriodEnd: '2027-01-01T00:00:00Z', plan: 'paid_monthly' }
    })
    const deps = makeDeps({ verifyPurchase })
    const ok = await verifyWithBackoff(PURCHASE, deps)
    expect(ok).toBe(true)
    expect(verifyPurchase).toHaveBeenCalledTimes(2)
    expect(deps.sleep).toHaveBeenCalledTimes(1)
  })
})

describe('LR-16 runRecoveryFlow', () => {
  it('is a no-op when there are no purchases to restore (permanent, no verify)', async () => {
    const verifyPurchase = vi.fn()
    const deps = makeDeps({ restorePurchases: vi.fn(async () => []), verifyPurchase })
    const recovered = await runRecoveryFlow(deps)
    expect(recovered).toBe(0)
    expect(verifyPurchase).not.toHaveBeenCalled()
  })

  it('returns 0 and swallows when restorePurchases throws', async () => {
    const deps = makeDeps({
      restorePurchases: vi.fn(async () => {
        throw new Error('plugin exploded')
      }),
    })
    await expect(runRecoveryFlow(deps)).resolves.toBe(0)
  })

  it('counts successfully re-verified purchases', async () => {
    const purchases: PurchaseResult[] = [
      { ...PURCHASE, purchaseToken: 'a' },
      { ...PURCHASE, purchaseToken: 'b' },
    ]
    const deps = makeDeps({ restorePurchases: vi.fn(async () => purchases) })
    const recovered = await runRecoveryFlow(deps)
    expect(recovered).toBe(2)
    expect(deps.verifyPurchase).toHaveBeenCalledTimes(2)
  })

  it('counts only the purchases that verify (mixed success/permanent-failure)', async () => {
    const purchases: PurchaseResult[] = [
      { ...PURCHASE, purchaseToken: 'good' },
      { ...PURCHASE, purchaseToken: 'bad' },
    ]
    const verifyPurchase = vi.fn(async (req: { purchaseToken: string; productId: string }) => {
      if (req.purchaseToken === 'bad') throw new Error('invalid purchase token')
      return { currentPeriodEnd: '2027-01-01T00:00:00Z', plan: 'paid_monthly' }
    })
    const deps = makeDeps({ restorePurchases: vi.fn(async () => purchases), verifyPurchase })
    const recovered = await runRecoveryFlow(deps)
    expect(recovered).toBe(1)
  })
})
