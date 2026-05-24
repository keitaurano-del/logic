/**
 * src/featureFlags.ts
 *
 * Phase 1 では Vite ビルド時の環境変数だけで判定する単純実装。
 * Phase 2 以降でサーバー配信 API (/api/feature-flags) に拡張する予定。
 *
 * 環境変数:
 *   VITE_ENABLE_DEVICE_SYNC=true|false
 *     - 未設定 or 'false' のとき OFF (デフォルト OFF)
 *     - 'true' のとき Phase 1 同期処理を起動
 *
 * 注意:
 *   Vite の import.meta.env は文字列で入る。boolean 化は明示的に判定する。
 */

function readEnvFlag(key: string, defaultValue: boolean): boolean {
  try {
    const raw = (import.meta.env as Record<string, string | undefined>)[key]
    if (raw == null) return defaultValue
    const v = String(raw).trim().toLowerCase()
    if (v === 'true' || v === '1' || v === 'on' || v === 'yes') return true
    if (v === 'false' || v === '0' || v === 'off' || v === 'no') return false
    return defaultValue
  } catch {
    return defaultValue
  }
}

/**
 * Phase 1 デバイス間同期 (flashcards / wrong_answers / saved_items / notebook /
 * roadmap / category_progress) を有効にするか。
 *
 * Phase 1 ではデフォルト OFF。内部テスター環境 (.env で VITE_ENABLE_DEVICE_SYNC=true)
 * だけ ON にして dry-run する。
 */
export function isDeviceSyncEnabled(): boolean {
  return readEnvFlag('VITE_ENABLE_DEVICE_SYNC', false)
}

/**
 * ヘビーユーザー閾値 (移行時のトレースログ用)。
 * 設計書 Section 5.2 と確認事項 4 で flashcards 200 / notebook 30 維持と確定済。
 */
export const HEAVY_USER_THRESHOLDS = {
  flashcards: 200,
  notebook: 30,
} as const
