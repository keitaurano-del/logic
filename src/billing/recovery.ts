/**
 * LR-16: 購入検証失敗の回復（「払ったのに使えない」防止）
 *
 * 起動時・ログイン時に、サーバ権威のエンタイトルメント（/api/entitlement）が
 * 「未課金」を返したにもかかわらず、実際には Google Play で購入済みのユーザーを
 * 救済する。Play の購入を restorePurchases() で取得し、各購入を verifyPurchase()
 * （Bearer 付き = LR-1 方式）で再検証してサーバに記録しなおす。
 *
 * 方針:
 * - 非ブロッキング（起動を止めない）。失敗はログのみで UX を壊さない。
 * - Android ネイティブ以外（web / stub）では no-op。
 * - 一時的失敗（ネットワーク / サーバ 5xx）は指数バックオフでリトライ。
 *   恒久的失敗（購入無し等）はリトライせず終了。
 * - 多重起動防止（in-flight ガード）。
 *
 * 純粋ロジック（バックオフ計算・リトライ判定・回復要否判定）は副作用と切り離して
 * テスト可能にしてある（recovery.test.ts 参照）。
 */

import { restorePurchases, verifyPurchase } from './index'
import { isAndroidNative } from '../subscription'
import type { PurchaseResult } from './types'

// ---------------------------------------------------------------------------
// 設定（純粋ロジック）
// ---------------------------------------------------------------------------

export interface BackoffConfig {
  /** 最大試行回数（初回含む）。 */
  maxAttempts: number
  /** 初回リトライまでの基準待機（ms）。 */
  baseDelayMs: number
  /** 1 回の待機の上限（ms）。 */
  maxDelayMs: number
}

export const DEFAULT_BACKOFF: BackoffConfig = {
  maxAttempts: 4,
  baseDelayMs: 400,
  maxDelayMs: 5000,
}

/**
 * 指数バックオフの待機時間を計算する（純粋関数）。
 * attempt は 0 始まり（0 = 1 回目のリトライ前の待機）。
 * delay = min(base * 2^attempt, max)。負値は 0 にクランプ。
 */
export function computeBackoffDelay(attempt: number, cfg: BackoffConfig = DEFAULT_BACKOFF): number {
  if (attempt < 0) return 0
  const raw = cfg.baseDelayMs * Math.pow(2, attempt)
  return Math.min(raw, cfg.maxDelayMs)
}

/**
 * エラーが「一時的（リトライする価値がある）」か判定する（純粋関数）。
 *
 * リトライ対象（一時的）:
 * - ネットワークエラー（fetch の TypeError 等、message に network/fetch/timeout を含む）
 * - サーバ 5xx（message に 5xx を示す手掛かりがある場合）
 *
 * リトライしない（恒久的）:
 * - それ以外（購入が無効 / 4xx / 認証エラー等）。サーバ側の検証で弾かれたものは
 *   再送しても結果が変わらないため打ち切る。
 */
export function isRetriableError(error: unknown): boolean {
  const message = (error instanceof Error ? error.message : String(error ?? '')).toLowerCase()
  if (!message) return false
  // 明確な恒久的失敗のシグナルが含まれていればリトライしない。
  if (/\b(4\d\d)\b/.test(message)) return false
  if (/unauthor|forbidden|invalid|not found|無効|認証|権限/.test(message)) return false
  // 一時的失敗のシグナル。
  if (/network|fetch|timeout|timed out|econn|enotfound|temporar|unavailable|\b(5\d\d)\b|ネットワーク|タイムアウト/.test(message)) {
    return true
  }
  // 判別不能なものは安全側でリトライしない（無限ループや過剰再送を避ける）。
  return false
}

/**
 * サーバ権威のエンタイトルメント結果から「回復を試みるべきか」を判定する（純粋関数）。
 *
 * - false（サーバが明確に未課金と返した）→ 回復対象（true）。
 * - true（課金済み）→ 不要（false）。
 * - null（未ログイン / オフライン / サーバ未到達）→ 判定不能なので試みない（false）。
 *   未確認の状態で復旧を走らせても verifyPurchase が 401 になるだけなので無駄。
 */
export function shouldAttemptRecovery(entitlement: boolean | null): boolean {
  return entitlement === false
}

// ---------------------------------------------------------------------------
// オーケストレーション（副作用あり）
// ---------------------------------------------------------------------------

/** in-flight ガード。複数の boot/login フックから同時に呼ばれても 1 回だけ走らせる。 */
let inFlight: Promise<void> | null = null

/** テスト用に in-flight ガードをリセットする。 */
export function _resetRecoveryGuard(): void {
  inFlight = null
}

export interface RecoveryDeps {
  restorePurchases: () => Promise<PurchaseResult[]>
  verifyPurchase: (req: { purchaseToken: string; productId: string }) => Promise<{ currentPeriodEnd: string; plan?: string }>
  sleep: (ms: number) => Promise<void>
  backoff?: BackoffConfig
  /** DEV ログ等の差し替え用（省略時 no-op）。 */
  onLog?: (msg: string, detail?: unknown) => void
}

/**
 * 1 件の購入をバックオフ付きで verifyPurchase に通す（純粋ロジック寄りのコア）。
 * 成功で true、恒久的失敗 or リトライ上限で false を返す。例外は投げない。
 */
export async function verifyWithBackoff(
  purchase: PurchaseResult,
  deps: RecoveryDeps,
): Promise<boolean> {
  const cfg = deps.backoff ?? DEFAULT_BACKOFF
  for (let attempt = 0; attempt < cfg.maxAttempts; attempt++) {
    try {
      await deps.verifyPurchase({
        purchaseToken: purchase.purchaseToken,
        productId: purchase.productId,
      })
      return true
    } catch (err) {
      const last = attempt >= cfg.maxAttempts - 1
      if (!isRetriableError(err) || last) {
        deps.onLog?.('[billing] recovery verify failed (giving up)', err)
        return false
      }
      const delay = computeBackoffDelay(attempt, cfg)
      deps.onLog?.(`[billing] recovery verify retrying in ${delay}ms`, err)
      await deps.sleep(delay)
    }
  }
  return false
}

/**
 * restorePurchases → 各購入を verifyWithBackoff で再検証、のコアフロー（DI 版）。
 * 純粋ロジックのテストから副作用を切り離すため、依存は引数で注入する。
 * 戻り値は「サーバに記録しなおせた購入件数」。例外は投げない。
 */
export async function runRecoveryFlow(deps: RecoveryDeps): Promise<number> {
  let purchases: PurchaseResult[]
  try {
    purchases = await deps.restorePurchases()
  } catch (err) {
    deps.onLog?.('[billing] recovery restorePurchases failed', err)
    return 0
  }
  if (!purchases || purchases.length === 0) {
    // 恒久的失敗（購入無し）。リトライせず終了。
    deps.onLog?.('[billing] recovery: no purchases to restore')
    return 0
  }
  let recovered = 0
  for (const p of purchases) {
    const ok = await verifyWithBackoff(p, deps)
    if (ok) recovered++
  }
  return recovered
}

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms))

/**
 * 起動時・ログイン時の回復エントリポイント。
 *
 * @param entitlement refreshEntitlement() の結果（サーバ権威）。
 *   false（未課金）のときだけ回復を試みる。true/null は no-op。
 *
 * - Android ネイティブ以外では no-op。
 * - in-flight ガードで多重実行を防ぐ。
 * - 非ブロッキング前提（呼び出し側は await しなくてよい）。例外は投げない。
 */
export async function recoverEntitlementIfNeeded(entitlement: boolean | null): Promise<void> {
  if (!shouldAttemptRecovery(entitlement)) return
  if (!isAndroidNative()) return
  if (inFlight) return inFlight

  const onLog = (msg: string, detail?: unknown) => {
    if (import.meta.env.DEV) console.debug(msg, detail)
  }

  inFlight = (async () => {
    try {
      const recovered = await runRecoveryFlow({
        restorePurchases,
        verifyPurchase,
        sleep,
        onLog,
      })
      if (recovered > 0) {
        onLog(`[billing] recovery: re-verified ${recovered} purchase(s)`)
        // サーバ記録が更新されたので、最新のエンタイトルメントを取り直す。
        try {
          const { refreshEntitlement } = await import('../subscription')
          await refreshEntitlement()
        } catch { /* noop */ }
      }
    } catch (err) {
      onLog('[billing] recovery flow error', err)
    } finally {
      inFlight = null
    }
  })()

  return inFlight
}
