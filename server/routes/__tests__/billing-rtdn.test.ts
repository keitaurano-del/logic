/**
 * LR-26: RTDN 検証バイパス封じのユニットテスト。
 * - isProductionEnv: NODE_ENV / APP_ENV による本番判定
 * - verifyPubSubJwt: 本番で RTDN_ENDPOINT_URL 未設定なら 'unconfigured-prod'（フェイルクローズ）、
 *   非本番で未設定なら 'verified'（従来どおり通過）、トークン欠落は 'invalid'。
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { isProductionEnv, verifyPubSubJwt } from '../billing'

const SAVED = {
  NODE_ENV: process.env.NODE_ENV,
  APP_ENV: process.env.APP_ENV,
  RTDN_ENDPOINT_URL: process.env.RTDN_ENDPOINT_URL,
}

function clearEnv() {
  delete process.env.NODE_ENV
  delete process.env.APP_ENV
  delete process.env.RTDN_ENDPOINT_URL
}

describe('isProductionEnv (LR-26)', () => {
  beforeEach(clearEnv)
  afterEach(() => {
    process.env.NODE_ENV = SAVED.NODE_ENV
    process.env.APP_ENV = SAVED.APP_ENV
    process.env.RTDN_ENDPOINT_URL = SAVED.RTDN_ENDPOINT_URL
  })

  it("NODE_ENV='production' は本番", () => {
    process.env.NODE_ENV = 'production'
    expect(isProductionEnv()).toBe(true)
  })

  it("APP_ENV='production'/'prod' は本番", () => {
    process.env.APP_ENV = 'production'
    expect(isProductionEnv()).toBe(true)
    process.env.APP_ENV = 'prod'
    expect(isProductionEnv()).toBe(true)
  })

  it("APP_ENV='sit' は非本番", () => {
    process.env.APP_ENV = 'sit'
    expect(isProductionEnv()).toBe(false)
  })

  it('未設定（開発）は非本番', () => {
    expect(isProductionEnv()).toBe(false)
  })
})

describe('verifyPubSubJwt (LR-26 fail-closed)', () => {
  beforeEach(clearEnv)
  afterEach(() => {
    process.env.NODE_ENV = SAVED.NODE_ENV
    process.env.APP_ENV = SAVED.APP_ENV
    process.env.RTDN_ENDPOINT_URL = SAVED.RTDN_ENDPOINT_URL
  })

  it('本番 × RTDN_ENDPOINT_URL 未設定 → unconfigured-prod（拒否対象）', async () => {
    process.env.NODE_ENV = 'production'
    expect(await verifyPubSubJwt('Bearer whatever')).toBe('unconfigured-prod')
    // トークンが無くても本番未設定なら検証不能として同じ扱い
    expect(await verifyPubSubJwt(undefined)).toBe('unconfigured-prod')
  })

  it('非本番 × 未設定 → verified（従来どおり通過）', async () => {
    expect(await verifyPubSubJwt(undefined)).toBe('verified')
    expect(await verifyPubSubJwt('Bearer x')).toBe('verified')
  })

  it('RTDN_ENDPOINT_URL 設定済 × トークン欠落 → invalid', async () => {
    process.env.RTDN_ENDPOINT_URL = 'https://example.com/api/billing/rtdn'
    expect(await verifyPubSubJwt(undefined)).toBe('invalid')
    expect(await verifyPubSubJwt('NotBearer')).toBe('invalid')
  })

  it('RTDN_ENDPOINT_URL 設定済 × 不正トークン → invalid（検証失敗）', async () => {
    process.env.RTDN_ENDPOINT_URL = 'https://example.com/api/billing/rtdn'
    // 不正な JWT は verifyIdToken が throw → invalid
    expect(await verifyPubSubJwt('Bearer not-a-real-jwt')).toBe('invalid')
  })
})
