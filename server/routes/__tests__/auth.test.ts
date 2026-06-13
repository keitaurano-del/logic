/**
 * server/auth.ts のユニットテスト（P0 セキュリティ: LR-1/2/3）。
 *
 * - resolveAuthedUser: Authorization 無し / 不正 Bearer / getUser エラー → null、
 *   正常トークン → { id, email }。supabase.auth.getUser はモックする。
 * - assertSecureAdminSecret: production で未設定/既定値 → fatal、正規値 → 通過、
 *   非 production は警告のみで通過。
 * - computeIsPaid: active+未期限→true / 期限切れ→false / inactive→false / null→false。
 */
import { describe, it, expect, vi } from 'vitest'
import type { Request } from 'express'
import type { SupabaseClient } from '@supabase/supabase-js'
import { resolveAuthedUser, assertSecureAdminSecret, computeIsPaid, INSECURE_ADMIN_SECRET_DEFAULT } from '../../auth'

// supabase.auth.getUser だけを持つ最小モックを作る。
function mockSupabase(getUserImpl: (token: string) => unknown): SupabaseClient {
  return {
    auth: {
      getUser: vi.fn(async (token: string) => getUserImpl(token)),
    },
  } as unknown as SupabaseClient
}

function reqWithAuth(authorization?: string): Pick<Request, 'headers'> {
  return { headers: authorization === undefined ? {} : { authorization } } as Pick<Request, 'headers'>
}

describe('resolveAuthedUser', () => {
  it('Authorization ヘッダが無いと null（getUser は呼ばない）', async () => {
    const sb = mockSupabase(() => ({ data: { user: { id: 'u1' } }, error: null }))
    const result = await resolveAuthedUser(reqWithAuth(), sb)
    expect(result).toBeNull()
    expect(sb.auth.getUser).not.toHaveBeenCalled()
  })

  it('Bearer 以外のスキームは null', async () => {
    const sb = mockSupabase(() => ({ data: { user: { id: 'u1' } }, error: null }))
    expect(await resolveAuthedUser(reqWithAuth('Basic abc'), sb)).toBeNull()
    expect(sb.auth.getUser).not.toHaveBeenCalled()
  })

  it('Bearer はあるがトークン空文字は null', async () => {
    const sb = mockSupabase(() => ({ data: { user: { id: 'u1' } }, error: null }))
    expect(await resolveAuthedUser(reqWithAuth('Bearer '), sb)).toBeNull()
    expect(sb.auth.getUser).not.toHaveBeenCalled()
  })

  it('getUser がエラーを返すと null', async () => {
    const sb = mockSupabase(() => ({ data: { user: null }, error: { message: 'invalid token' } }))
    expect(await resolveAuthedUser(reqWithAuth('Bearer badtoken'), sb)).toBeNull()
  })

  it('getUser が throw しても null（例外は飲み込む）', async () => {
    const sb = mockSupabase(() => { throw new Error('network') })
    expect(await resolveAuthedUser(reqWithAuth('Bearer t'), sb)).toBeNull()
  })

  it('supabase が null だと常に null', async () => {
    expect(await resolveAuthedUser(reqWithAuth('Bearer t'), null)).toBeNull()
  })

  it('正常トークンは { id, email } を返す', async () => {
    const sb = mockSupabase((token) => {
      expect(token).toBe('goodtoken')
      return { data: { user: { id: 'user-123', email: 'a@example.com' } }, error: null }
    })
    expect(await resolveAuthedUser(reqWithAuth('Bearer goodtoken'), sb)).toEqual({
      id: 'user-123',
      email: 'a@example.com',
    })
  })

  it('email 欠落時は email:null', async () => {
    const sb = mockSupabase(() => ({ data: { user: { id: 'user-123' } }, error: null }))
    expect(await resolveAuthedUser(reqWithAuth('Bearer t'), sb)).toEqual({ id: 'user-123', email: null })
  })
})

describe('assertSecureAdminSecret', () => {
  it('production で未設定は fatal', () => {
    const onFatal = vi.fn((msg: string) => { throw new Error(msg) })
    expect(() => assertSecureAdminSecret({ NODE_ENV: 'production' } as NodeJS.ProcessEnv, onFatal as never))
      .toThrow(/refusing to start in production/)
    expect(onFatal).toHaveBeenCalledOnce()
  })

  it('production で既定値は fatal', () => {
    const onFatal = vi.fn((msg: string) => { throw new Error(msg) })
    expect(() => assertSecureAdminSecret(
      { NODE_ENV: 'production', ADMIN_SECRET: INSECURE_ADMIN_SECRET_DEFAULT } as NodeJS.ProcessEnv,
      onFatal as never,
    )).toThrow(/refusing to start in production/)
  })

  it('production で強い値なら通過（fatal 呼ばれない）', () => {
    const onFatal = vi.fn(() => { throw new Error('should not fatal') })
    expect(() => assertSecureAdminSecret(
      { NODE_ENV: 'production', ADMIN_SECRET: 'a-strong-random-value-xyz' } as NodeJS.ProcessEnv,
      onFatal as never,
    )).not.toThrow()
    expect(onFatal).not.toHaveBeenCalled()
  })

  it('非 production では未設定でも警告のみで通過', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const onFatal = vi.fn(() => { throw new Error('should not fatal') })
    expect(() => assertSecureAdminSecret({ NODE_ENV: 'development' } as NodeJS.ProcessEnv, onFatal as never)).not.toThrow()
    expect(onFatal).not.toHaveBeenCalled()
    expect(warn).toHaveBeenCalled()
    warn.mockRestore()
  })
})

describe('computeIsPaid', () => {
  const now = Date.parse('2026-06-10T00:00:00Z')

  it('active かつ未期限なら true', () => {
    expect(computeIsPaid({ status: 'active', current_period_end: '2026-12-31T00:00:00Z' }, now)).toBe(true)
  })

  it('active でも期限切れなら false', () => {
    expect(computeIsPaid({ status: 'active', current_period_end: '2026-01-01T00:00:00Z' }, now)).toBe(false)
  })

  it('status が active でないと false', () => {
    expect(computeIsPaid({ status: 'canceled', current_period_end: '2026-12-31T00:00:00Z' }, now)).toBe(false)
  })

  it('current_period_end 欠落は false', () => {
    expect(computeIsPaid({ status: 'active', current_period_end: null }, now)).toBe(false)
  })

  it('null / undefined 行は false', () => {
    expect(computeIsPaid(null, now)).toBe(false)
    expect(computeIsPaid(undefined, now)).toBe(false)
  })
})
