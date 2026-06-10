/**
 * POST /api/account/delete のテスト（LR-5）。
 *
 * createAccountRouter で実ルータを生成し、express アプリにマウントして
 * node:http で実リクエストを投げる（supertest 非依存、billing-verify.test の流儀に合わせる）。
 *
 * 検証項目:
 *   - Authorization 無し → 401（admin.deleteUser も明示 delete も呼ばれない）
 *   - 不正 Bearer → 401
 *   - 認証成功 → admin.deleteUser(authedUserId) と CASCADE 対象外テーブル
 *     (fermi_scores) の delete().eq('user_id', authedUserId) が呼ばれ {ok:true}
 *   - admin.deleteUser がエラーを返したら 500
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import express from 'express'
import http from 'node:http'
import type { AddressInfo } from 'node:net'
import type { SupabaseClient } from '@supabase/supabase-js'
import { createAccountRouter } from '../account'

const AUTHED_UID = '11111111-1111-1111-1111-111111111111'

// from(table).delete().eq(col, val) のチェーンを記録する spy 群。
const deleteEqSpy = vi.fn(async () => ({ error: null }))
const deleteSpy = vi.fn(() => ({ eq: deleteEqSpy }))
const fromSpy = vi.fn(() => ({ delete: deleteSpy }))
const deleteUserSpy = vi.fn(async () => ({ data: { user: null }, error: null }))

function makeSupabase(getUserImpl: (token: string) => unknown): SupabaseClient {
  return {
    auth: {
      getUser: vi.fn(async (token: string) => getUserImpl(token)),
      admin: { deleteUser: deleteUserSpy },
    },
    from: fromSpy,
  } as unknown as SupabaseClient
}

function startServer(supabase: SupabaseClient | null): Promise<{ url: string; close: () => void }> {
  const app = express()
  app.use('/api/account', createAccountRouter({ supabase }))
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

describe('POST /api/account/delete (LR-5)', () => {
  beforeEach(() => {
    deleteEqSpy.mockClear()
    deleteSpy.mockClear()
    fromSpy.mockClear()
    deleteUserSpy.mockClear()
    deleteEqSpy.mockResolvedValue({ error: null })
    deleteUserSpy.mockResolvedValue({ data: { user: null }, error: null })
  })

  it('Authorization 無しは 401（削除は一切呼ばれない）', async () => {
    const sb = makeSupabase(() => ({ data: { user: null }, error: { message: 'no token' } }))
    const srv = await startServer(sb)
    try {
      const res = await post(`${srv.url}/api/account/delete`, {})
      expect(res.status).toBe(401)
      expect(deleteUserSpy).not.toHaveBeenCalled()
      expect(fromSpy).not.toHaveBeenCalled()
    } finally { srv.close() }
  })

  it('不正 Bearer トークンは 401', async () => {
    const sb = makeSupabase(() => ({ data: { user: null }, error: { message: 'invalid' } }))
    const srv = await startServer(sb)
    try {
      const res = await post(`${srv.url}/api/account/delete`, {}, { Authorization: 'Bearer bad-token' })
      expect(res.status).toBe(401)
      expect(deleteUserSpy).not.toHaveBeenCalled()
    } finally { srv.close() }
  })

  it('認証成功で admin.deleteUser と fermi_scores の明示削除が呼ばれ {ok:true}', async () => {
    const sb = makeSupabase(() => ({ data: { user: { id: AUTHED_UID, email: 'u@example.com' } }, error: null }))
    const srv = await startServer(sb)
    try {
      const res = await post(`${srv.url}/api/account/delete`, {}, { Authorization: 'Bearer good-token' })
      expect(res.status).toBe(200)
      expect(res.json).toEqual({ ok: true })

      // CASCADE 対象外テーブルの明示削除
      expect(fromSpy).toHaveBeenCalledWith('fermi_scores')
      expect(deleteEqSpy).toHaveBeenCalledWith('user_id', AUTHED_UID)

      // auth ユーザー本体の削除（認証で得た uid のみ）
      expect(deleteUserSpy).toHaveBeenCalledTimes(1)
      expect(deleteUserSpy).toHaveBeenCalledWith(AUTHED_UID)
    } finally { srv.close() }
  })

  it('明示削除が失敗してもアカウント削除は続行する（部分失敗耐性）', async () => {
    deleteEqSpy.mockResolvedValueOnce({ error: { message: 'boom' } })
    const sb = makeSupabase(() => ({ data: { user: { id: AUTHED_UID, email: null } }, error: null }))
    const srv = await startServer(sb)
    try {
      const res = await post(`${srv.url}/api/account/delete`, {}, { Authorization: 'Bearer good-token' })
      expect(res.status).toBe(200)
      expect(res.json).toEqual({ ok: true })
      expect(deleteUserSpy).toHaveBeenCalledWith(AUTHED_UID)
    } finally { srv.close() }
  })

  it('admin.deleteUser がエラーを返したら 500', async () => {
    deleteUserSpy.mockResolvedValueOnce({ data: { user: null }, error: { message: 'cannot delete' } })
    const sb = makeSupabase(() => ({ data: { user: { id: AUTHED_UID, email: null } }, error: null }))
    const srv = await startServer(sb)
    try {
      const res = await post(`${srv.url}/api/account/delete`, {}, { Authorization: 'Bearer good-token' })
      expect(res.status).toBe(500)
      expect((res.json as { error?: string }).error).toBe('cannot delete')
    } finally { srv.close() }
  })
})
