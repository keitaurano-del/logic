/**
 * AI 生成クォータの認証束縛 / 月次ハードキャップのテスト（P1 LR-10）。
 *
 * 2 層で検証する:
 *  1. checkAndIncrementAIQuota（純粋ロジック）— supabase をモックして
 *     ゲスト素通り / 無料拒否 / 有料許可＋カウント加算 / ハードキャップ超過拒否。
 *  2. createProblemsRouter（実ルータ）を express にマウントし node:http で叩いて、
 *     - body.userId を偽装してもサーバは authed id（resolveAuthedUser 由来）で数える
 *     - 未認証（Bearer 無し）はゲスト経路で拒否されない
 *     - 有料ハードキャップ超過で 429
 *
 * Anthropic / Supabase はモック。実 API は叩かない。
 */
import { describe, it, expect, vi, afterEach } from 'vitest'
import express from 'express'
import http from 'node:http'
import type { AddressInfo } from 'node:net'
import type { SupabaseClient } from '@supabase/supabase-js'
import type Anthropic from '@anthropic-ai/sdk'
import {
  checkAndIncrementAIQuota,
  paidMonthlyHardCap,
  DEFAULT_AI_MONTHLY_HARD_CAP_PAID,
  monthKey,
} from '../../aiQuota'
import { createProblemsRouter } from '../problems'

// ---------------------------------------------------------------------------
// supabase モックビルダ: profiles.select().eq().single() と upsert を制御する。
// ---------------------------------------------------------------------------
function makeQuotaSupabase(opts: {
  getUser?: (token: string) => unknown
  profileRow?: unknown
}): { supabase: SupabaseClient; upsertSpy: ReturnType<typeof vi.fn> } {
  const upsertSpy = vi.fn(async () => ({ data: null, error: null }))
  const single = vi.fn(async () => ({ data: opts.profileRow ?? null, error: null }))
  const eq = vi.fn(() => ({ single }))
  const select = vi.fn(() => ({ eq }))
  const supabase = {
    auth: { getUser: vi.fn(async (token: string) => (opts.getUser ? opts.getUser(token) : { data: { user: null }, error: { message: 'no token' } })) },
    from: vi.fn(() => ({ select, upsert: upsertSpy })),
  } as unknown as SupabaseClient
  return { supabase, upsertSpy }
}

const noopLimiter = ((_req: unknown, _res: unknown, next: () => void) => next()) as never

// Anthropic モック: 常に generate-problems が JSON.parse できる本文を返す。
function makeAnthropic(): Anthropic {
  return {
    messages: {
      create: vi.fn(async () => ({
        content: [{ type: 'text', text: '{"title":"t","category":"c","steps":[]}' }],
        stop_reason: 'end_turn',
      })),
    },
  } as unknown as Anthropic
}

function startServer(supabase: SupabaseClient, anthropic: Anthropic): Promise<{ url: string; close: () => void }> {
  const app = express()
  app.use(express.json())
  app.use(createProblemsRouter(anthropic, supabase, noopLimiter, noopLimiter, noopLimiter))
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

const PAID_ROW = { plan: 'paid_monthly', ai_gen_count: 0, ai_gen_month: monthKey() }

// ===========================================================================
// 1) checkAndIncrementAIQuota 純粋ロジック
// ===========================================================================
describe('checkAndIncrementAIQuota (LR-10)', () => {
  it('authedUserId が無ければゲスト素通り（DB 参照しない）', async () => {
    const { supabase, upsertSpy } = makeQuotaSupabase({ profileRow: PAID_ROW })
    const r = await checkAndIncrementAIQuota(supabase, undefined)
    expect(r.allowed).toBe(true)
    expect(upsertSpy).not.toHaveBeenCalled()
    expect((supabase.from as unknown as ReturnType<typeof vi.fn>)).not.toHaveBeenCalled()
  })

  it('supabase null はゲスト素通り', async () => {
    const r = await checkAndIncrementAIQuota(null, 'user-1')
    expect(r.allowed).toBe(true)
  })

  it('無料プランは拒否（既存挙動・カウントしない）', async () => {
    const { supabase, upsertSpy } = makeQuotaSupabase({ profileRow: { plan: 'free', ai_gen_count: 0, ai_gen_month: monthKey() } })
    const r = await checkAndIncrementAIQuota(supabase, 'user-1')
    expect(r.allowed).toBe(false)
    expect(r.reason).toBeTruthy()
    expect(upsertSpy).not.toHaveBeenCalled()
  })

  it('有料で上限未満は許可＆カウント +1', async () => {
    const { supabase, upsertSpy } = makeQuotaSupabase({ profileRow: { plan: 'paid_monthly', ai_gen_count: 5, ai_gen_month: monthKey() } })
    const r = await checkAndIncrementAIQuota(supabase, 'user-1')
    expect(r.allowed).toBe(true)
    expect(upsertSpy).toHaveBeenCalledOnce()
    const payload = upsertSpy.mock.calls[0][0] as { id: string; ai_gen_count: number; ai_gen_month: string }
    expect(payload.id).toBe('user-1')
    expect(payload.ai_gen_count).toBe(6)
    expect(payload.ai_gen_month).toBe(monthKey())
  })

  it('月が変わっていればカウントを 0 起点にして +1', async () => {
    const { supabase, upsertSpy } = makeQuotaSupabase({ profileRow: { plan: 'paid_monthly', ai_gen_count: 9999, ai_gen_month: '2000-01' } })
    const r = await checkAndIncrementAIQuota(supabase, 'user-1')
    expect(r.allowed).toBe(true)
    const payload = upsertSpy.mock.calls[0][0] as { ai_gen_count: number }
    expect(payload.ai_gen_count).toBe(1)
  })

  it('有料でも月次ハードキャップ到達は拒否（capExceeded）', async () => {
    const { supabase, upsertSpy } = makeQuotaSupabase({
      profileRow: { plan: 'paid_monthly', ai_gen_count: DEFAULT_AI_MONTHLY_HARD_CAP_PAID, ai_gen_month: monthKey() },
    })
    const r = await checkAndIncrementAIQuota(supabase, 'user-1')
    expect(r.allowed).toBe(false)
    expect(r.capExceeded).toBe(true)
    expect(upsertSpy).not.toHaveBeenCalled()
  })
})

describe('paidMonthlyHardCap (env)', () => {
  it('未設定は既定値', () => {
    expect(paidMonthlyHardCap({} as NodeJS.ProcessEnv)).toBe(DEFAULT_AI_MONTHLY_HARD_CAP_PAID)
  })
  it('env 設定値を採用', () => {
    expect(paidMonthlyHardCap({ AI_MONTHLY_HARD_CAP_PAID: '42' } as NodeJS.ProcessEnv)).toBe(42)
  })
  it('不正値は既定値にフォールバック', () => {
    expect(paidMonthlyHardCap({ AI_MONTHLY_HARD_CAP_PAID: 'abc' } as NodeJS.ProcessEnv)).toBe(DEFAULT_AI_MONTHLY_HARD_CAP_PAID)
    expect(paidMonthlyHardCap({ AI_MONTHLY_HARD_CAP_PAID: '0' } as NodeJS.ProcessEnv)).toBe(DEFAULT_AI_MONTHLY_HARD_CAP_PAID)
  })
})

// ===========================================================================
// 2) /api/generate-problems ルータ（認証束縛 + ハードキャップ）
// ===========================================================================
describe('POST /api/generate-problems — auth-bound quota (LR-10)', () => {
  afterEach(() => { delete process.env.AI_MONTHLY_HARD_CAP_PAID })

  const REAL_USER = { data: { user: { id: 'real-user-uuid', email: 'r@example.com' } }, error: null }
  const NO_USER = { data: { user: null }, error: { message: 'no token' } }

  it('body.userId を偽装してもサーバは authed id でカウントする', async () => {
    const { supabase, upsertSpy } = makeQuotaSupabase({ getUser: () => REAL_USER, profileRow: { plan: 'paid_monthly', ai_gen_count: 3, ai_gen_month: monthKey() } })
    const srv = await startServer(supabase, makeAnthropic())
    try {
      const res = await post(`${srv.url}/api/generate-problems`, { prompt: 'logic practice', userId: 'attacker-uid' }, { Authorization: 'Bearer good' })
      expect(res.status).toBe(200)
      expect(upsertSpy).toHaveBeenCalledOnce()
      const payload = upsertSpy.mock.calls[0][0] as { id: string }
      expect(payload.id).toBe('real-user-uuid')
      expect(payload.id).not.toBe('attacker-uid')
    } finally { srv.close() }
  })

  it('未認証（Bearer 無し）はゲスト経路 — 拒否されず生成される、カウントしない', async () => {
    const { supabase, upsertSpy } = makeQuotaSupabase({ getUser: () => NO_USER, profileRow: PAID_ROW })
    const srv = await startServer(supabase, makeAnthropic())
    try {
      // body.userId を送っても無視され、ゲストとして素通りする。
      const res = await post(`${srv.url}/api/generate-problems`, { prompt: 'logic practice', userId: 'attacker-uid' })
      expect(res.status).toBe(200)
      expect(upsertSpy).not.toHaveBeenCalled()
    } finally { srv.close() }
  })

  it('有料ハードキャップ超過で 429', async () => {
    process.env.AI_MONTHLY_HARD_CAP_PAID = '5'
    const { supabase, upsertSpy } = makeQuotaSupabase({ getUser: () => REAL_USER, profileRow: { plan: 'paid_monthly', ai_gen_count: 5, ai_gen_month: monthKey() } })
    const srv = await startServer(supabase, makeAnthropic())
    try {
      const res = await post(`${srv.url}/api/generate-problems`, { prompt: 'logic practice' }, { Authorization: 'Bearer good' })
      expect(res.status).toBe(429)
      expect(upsertSpy).not.toHaveBeenCalled()
    } finally { srv.close() }
  })

  it('有料で上限未満は許可＆カウント加算', async () => {
    process.env.AI_MONTHLY_HARD_CAP_PAID = '5'
    const { supabase, upsertSpy } = makeQuotaSupabase({ getUser: () => REAL_USER, profileRow: { plan: 'paid_monthly', ai_gen_count: 4, ai_gen_month: monthKey() } })
    const srv = await startServer(supabase, makeAnthropic())
    try {
      const res = await post(`${srv.url}/api/generate-problems`, { prompt: 'logic practice' }, { Authorization: 'Bearer good' })
      expect(res.status).toBe(200)
      expect(upsertSpy).toHaveBeenCalledOnce()
      const payload = upsertSpy.mock.calls[0][0] as { ai_gen_count: number }
      expect(payload.ai_gen_count).toBe(5)
    } finally { srv.close() }
  })

  it('無料プランは 429 で拒否（認証あり）', async () => {
    const { supabase } = makeQuotaSupabase({ getUser: () => REAL_USER, profileRow: { plan: 'free', ai_gen_count: 0, ai_gen_month: monthKey() } })
    const srv = await startServer(supabase, makeAnthropic())
    try {
      const res = await post(`${srv.url}/api/generate-problems`, { prompt: 'logic practice' }, { Authorization: 'Bearer good' })
      expect(res.status).toBe(429)
    } finally { srv.close() }
  })
})
