/**
 * GET /api/entitlement のテスト（LR-2）。
 *
 * createEntitlementHandler を実 express アプリにマウントし node:http で叩く。
 * Supabase はモック:
 *   - auth.getUser でトークン検証
 *   - from('subscriptions').select().eq().maybeSingle() で行を返す
 * 検証項目:
 *   - 未認証 → 401
 *   - active + 未期限 → { isPaid: true }
 *   - active + 期限切れ → { isPaid: false }
 */
import { describe, it, expect, vi } from 'vitest'
import express from 'express'
import http from 'node:http'
import type { AddressInfo } from 'node:net'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createEntitlementHandler } from '../../auth'

function makeSupabase(opts: {
  getUser: (token: string) => unknown
  subRow?: unknown
  subError?: { message: string } | null
}): SupabaseClient {
  const maybeSingle = vi.fn(async () => ({ data: opts.subRow ?? null, error: opts.subError ?? null }))
  const eq = vi.fn(() => ({ maybeSingle }))
  const select = vi.fn(() => ({ eq }))
  return {
    auth: { getUser: vi.fn(async (token: string) => opts.getUser(token)) },
    from: vi.fn(() => ({ select })),
  } as unknown as SupabaseClient
}

function startServer(supabase: SupabaseClient): Promise<{ url: string; close: () => void }> {
  const app = express()
  app.get('/api/entitlement', createEntitlementHandler(supabase))
  return new Promise((resolve) => {
    const server = app.listen(0, () => {
      const port = (server.address() as AddressInfo).port
      resolve({ url: `http://127.0.0.1:${port}`, close: () => server.close() })
    })
  })
}

function get(url: string, headers: Record<string, string> = {}): Promise<{ status: number; json: unknown }> {
  return new Promise((resolve, reject) => {
    const req = http.request(url, { method: 'GET', headers }, (res) => {
      let chunks = ''
      res.on('data', (c) => { chunks += c })
      res.on('end', () => {
        let parsed: unknown = null
        try { parsed = JSON.parse(chunks) } catch { /* non-json */ }
        resolve({ status: res.statusCode ?? 0, json: parsed })
      })
    })
    req.on('error', reject)
    req.end()
  })
}

const authedUser = { data: { user: { id: 'user-1', email: 'u@example.com' } }, error: null }
const noUser = { data: { user: null }, error: { message: 'invalid' } }

describe('GET /api/entitlement (LR-2)', () => {
  it('未認証は 401', async () => {
    const sb = makeSupabase({ getUser: () => noUser })
    const srv = await startServer(sb)
    try {
      const res = await get(`${srv.url}/api/entitlement`)
      expect(res.status).toBe(401)
    } finally { srv.close() }
  })

  it('active + 未期限 → isPaid:true', async () => {
    const future = new Date(Date.now() + 30 * 86400000).toISOString()
    const sb = makeSupabase({ getUser: () => authedUser, subRow: { status: 'active', current_period_end: future } })
    const srv = await startServer(sb)
    try {
      const res = await get(`${srv.url}/api/entitlement`, { Authorization: 'Bearer good' })
      expect(res.status).toBe(200)
      expect(res.json).toEqual({ isPaid: true })
    } finally { srv.close() }
  })

  it('active + 期限切れ → isPaid:false', async () => {
    const past = new Date(Date.now() - 86400000).toISOString()
    const sb = makeSupabase({ getUser: () => authedUser, subRow: { status: 'active', current_period_end: past } })
    const srv = await startServer(sb)
    try {
      const res = await get(`${srv.url}/api/entitlement`, { Authorization: 'Bearer good' })
      expect(res.status).toBe(200)
      expect(res.json).toEqual({ isPaid: false })
    } finally { srv.close() }
  })

  it('行が無い（無料ユーザー） → isPaid:false', async () => {
    const sb = makeSupabase({ getUser: () => authedUser, subRow: null })
    const srv = await startServer(sb)
    try {
      const res = await get(`${srv.url}/api/entitlement`, { Authorization: 'Bearer good' })
      expect(res.status).toBe(200)
      expect(res.json).toEqual({ isPaid: false })
    } finally { srv.close() }
  })
})
