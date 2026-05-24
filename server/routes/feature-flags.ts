/**
 * /api/feature-flags
 *
 * 別端末同期 (Device Sync) Phase 3 段階公開のための feature flag 配信 API。
 *
 * 設計:
 * - ロールアウト率は環境変数 DEVICE_SYNC_ROLLOUT_PCT (0-100) で制御。
 *   未設定 or 不正値は 0 (= 全員 OFF) として扱う。
 * - userId を SHA-256 ハッシュして 0-99 のバケットを算出し、
 *   bucket < rolloutPct のときに enabled: true を返す。
 *   → ハッシュベースなので同一ユーザーは常に同じ判定。rolloutPct を上げると
 *     enabled に変わるユーザーが単調増加する (= 段階公開ができる)。
 * - DEVICE_SYNC_FORCE_USER_IDS (カンマ区切り) のユーザーは rolloutPct 無視で常に true。
 *   Phase 2 の内部テスター (Keita 等) を必ず有効化したい場合に使う。
 *
 * 認証:
 * - 公開エンドポイント。userId が必要だが auth token 検証はしない
 *   (起動直後のオフライン同等動作も担保したいため軽量に倒す)。
 * - userId は localStorage 由来の文字列 (Supabase user uuid or guest id) を想定。
 *
 * レスポンス例:
 *   { "enabled": true, "rolloutPct": 25, "hashBucket": 7 }
 */

import { Router, type Request, type Response } from 'express'
import { createHash } from 'node:crypto'

function parseRolloutPct(raw: string | undefined): number {
  if (!raw) return 0
  const n = Number(raw)
  if (!Number.isFinite(n)) return 0
  if (n < 0) return 0
  if (n > 100) return 100
  return Math.floor(n)
}

function parseForcedUserIds(raw: string | undefined): Set<string> {
  if (!raw) return new Set()
  return new Set(
    raw
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean),
  )
}

/**
 * userId を 0-99 のバケットに割り当てる。
 * SHA-256 の上位 4 byte を 32bit 整数として扱い、100 で剰余を取る。
 */
function hashUserToBucket(userId: string): number {
  const h = createHash('sha256').update(userId).digest()
  const n = h.readUInt32BE(0)
  return n % 100
}

export function createFeatureFlagsRouter(): Router {
  const router = Router()

  router.get('/device-sync', (req: Request, res: Response) => {
    const userId = req.query.userId
    if (typeof userId !== 'string' || userId.length === 0 || userId.length > 256) {
      return res.status(400).json({ error: 'invalid userId' })
    }

    const rolloutPct = parseRolloutPct(process.env.DEVICE_SYNC_ROLLOUT_PCT)
    const forced = parseForcedUserIds(process.env.DEVICE_SYNC_FORCE_USER_IDS)
    const hashBucket = hashUserToBucket(userId)

    // Phase 2 内部テスター: rolloutPct を無視して常に true
    if (forced.has(userId)) {
      return res.json({ enabled: true, rolloutPct, hashBucket, forced: true })
    }

    const enabled = hashBucket < rolloutPct
    return res.json({ enabled, rolloutPct, hashBucket })
  })

  return router
}
