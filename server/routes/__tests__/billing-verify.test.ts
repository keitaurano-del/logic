/**
 * POST /api/billing/verify の認証束縛テスト（LR-1）。
 *
 * createBillingRouter で実ルータを生成し、express アプリにマウントして
 * node:http で実リクエストを投げる（supertest 非依存）。
 * Supabase / Google Play をモックして認証束縛と検証失敗時の非付与を確認する:
 *   - Authorization 無し → 401
 *   - 偽の body.userId を送っても upsert の user_id は authed userId になる
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import express from 'express'
import http from 'node:http'
import type { AddressInfo } from 'node:net'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createBillingRouter } from '../billing'

const playGet = vi.hoisted(() => vi.fn())
const playAcknowledge = vi.hoisted(() => vi.fn())
vi.mock('googleapis', () => ({
  google: { androidpublisher: () => ({ purchases: { subscriptions: { get: playGet, acknowledge: playAcknowledge } } }) },
}))
vi.mock('google-auth-library', () => ({
  GoogleAuth: class {},
  OAuth2Client: class {},
}))

// upsert に渡った payload を記録するための spy。
const upsertSpy = vi.fn(async () => ({ data: null, error: null }))

function makeSupabase(getUserImpl: (token: string) => unknown): SupabaseClient {
  return {
    auth: { getUser: vi.fn(async (token: string) => getUserImpl(token)) },
    from: vi.fn(() => ({ upsert: upsertSpy })),
  } as unknown as SupabaseClient
}

function startServer(supabase: SupabaseClient): Promise<{ url: string; close: () => void }> {
  const app = express()
  app.use(createBillingRouter({ supabase }))
  app.use(express.json())
  return new Promise((resolve) => {
    const server = app.listen(0, () => {
      const port = (server.address() as AddressInfo).port
      resolve({ url: `http://127.0.0.1:${port}`, close: () => server.close() })
    })
  })
}

function post(url: string, body: unknown, headers: Record<string, string> = {}): Promise<{ status: number; json: unknown }> {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body)
    const req = http.request(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data), ...headers },
    }, (res) => {
      let chunks = ''
      res.on('data', (c) => { chunks += c })
      res.on('end', () => {
        let parsed: unknown = null
        try { parsed = JSON.parse(chunks) } catch { /* non-json */ }
        resolve({ status: res.statusCode ?? 0, json: parsed })
      })
    })
    req.on('error', reject)
    req.write(data)
    req.end()
  })
}

describe('POST /api/billing/verify — auth binding (LR-1)', () => {
  beforeEach(() => {
    upsertSpy.mockClear()
    playGet.mockReset()
    playAcknowledge.mockReset()
    playGet.mockResolvedValue({ data: {
      paymentState: 1,
      expiryTimeMillis: String(Date.now() + 30 * 24 * 60 * 60 * 1000),
      acknowledgementState: 1,
    } })
    process.env.GOOGLE_PLAY_PRIVATE_KEY = '{}'
    process.env.GOOGLE_PLAY_CLIENT_EMAIL = 'svc@example.com'
    process.env.GOOGLE_PLAY_PACKAGE_NAME = 'com.logicalthinking.app'
  })
  afterEach(() => {
    delete process.env.GOOGLE_PLAY_PRIVATE_KEY
    delete process.env.GOOGLE_PLAY_CLIENT_EMAIL
    delete process.env.GOOGLE_PLAY_PACKAGE_NAME
  })

  it('Authorization 無しは 401', async () => {
    const sb = makeSupabase(() => ({ data: { user: null }, error: { message: 'no token' } }))
    const srv = await startServer(sb)
    try {
      const res = await post(`${srv.url}/api/billing/verify`, {
        purchaseToken: 'tok', productId: 'logic_paid_monthly', userId: 'attacker-uid',
      })
      expect(res.status).toBe(401)
      expect(upsertSpy).not.toHaveBeenCalled()
    } finally { srv.close() }
  })

  it('不正 Bearer トークンは 401', async () => {
    const sb = makeSupabase(() => ({ data: { user: null }, error: { message: 'invalid' } }))
    const srv = await startServer(sb)
    try {
      const res = await post(
        `${srv.url}/api/billing/verify`,
        { purchaseToken: 'tok', productId: 'logic_paid_monthly' },
        { Authorization: 'Bearer fake' },
      )
      expect(res.status).toBe(401)
      expect(upsertSpy).not.toHaveBeenCalled()
    } finally { srv.close() }
  })

  it('偽の body.userId を送っても upsert の user_id は authed userId', async () => {
    const sb = makeSupabase(() => ({ data: { user: { id: 'real-user-uuid', email: 'r@example.com' } }, error: null }))
    const srv = await startServer(sb)
    try {
      const res = await post(
        `${srv.url}/api/billing/verify`,
        { purchaseToken: 'tok', productId: 'logic_paid_monthly', userId: 'attacker-uid' },
        { Authorization: 'Bearer good' },
      )
      expect(res.status).toBe(200)
      expect((res.json as { success?: boolean }).success).toBe(true)
      expect(upsertSpy).toHaveBeenCalledOnce()
      const payload = upsertSpy.mock.calls[0][0] as { user_id: string }
      expect(payload.user_id).toBe('real-user-uuid')
      expect(payload.user_id).not.toBe('attacker-uid')
    } finally { srv.close() }
  })

  it('Play の package 名が未設定なら購入を付与しない', async () => {
    delete process.env.GOOGLE_PLAY_PACKAGE_NAME
    const sb = makeSupabase(() => ({ data: { user: { id: 'real-user-uuid' } }, error: null }))
    const srv = await startServer(sb)
    try {
      const res = await post(`${srv.url}/api/billing/verify`,
        { purchaseToken: 'tok', productId: 'logic_paid_monthly' },
        { Authorization: 'Bearer good' })
      expect(res.status).toBe(503)
      expect(playGet).not.toHaveBeenCalled()
      expect(upsertSpy).not.toHaveBeenCalled()
    } finally { srv.close() }
  })

  it('Play が期限切れと返した購入を付与しない', async () => {
    playGet.mockResolvedValue({ data: { paymentState: 1, expiryTimeMillis: String(Date.now() - 1000) } })
    const sb = makeSupabase(() => ({ data: { user: { id: 'real-user-uuid' } }, error: null }))
    const srv = await startServer(sb)
    try {
      const res = await post(`${srv.url}/api/billing/verify`,
        { purchaseToken: 'tok', productId: 'logic_paid_monthly' },
        { Authorization: 'Bearer good' })
      expect(res.status).toBe(400)
      expect(upsertSpy).not.toHaveBeenCalled()
    } finally { srv.close() }
  })

  it('購読の保存に失敗したら成功を返さない', async () => {
    upsertSpy.mockResolvedValueOnce({ data: null, error: { message: 'database unavailable' } })
    const sb = makeSupabase(() => ({ data: { user: { id: 'real-user-uuid' } }, error: null }))
    const srv = await startServer(sb)
    try {
      const res = await post(`${srv.url}/api/billing/verify`,
        { purchaseToken: 'tok', productId: 'logic_paid_monthly' },
        { Authorization: 'Bearer good' })
      expect(res.status).toBe(500)
    } finally { srv.close() }
  })
})
