/**
 * FB-23: localStorage 使用量の実測 + クォータガード
 *
 * 1. measureStorageUsage がキー別 byte と合計・使用率を正しく集計する
 * 2. safeSetItem が QuotaExceeded 時に再生成可能キャッシュを間引いて再試行する
 * 3. eviction が耐久データ（XP / 進捗 / プロフィール / flashcards 等）を消さない
 */
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  measureStorageUsage,
  approxByteSize,
  safeSetItem,
  STORAGE_QUOTA_BYTES,
  __EVICTABLE_KEYS_FOR_TEST,
} from '../storageUsage'

// 耐久データ（消えてはいけない）。LOGOUT_KEEP_KEYS と整合する代表キー。
const DURABLE_KEYS = [
  'logic-xp',
  'logic-progress',
  'logic-stats',
  'logic-user-profile',
  'logic-flashcards',
  'logic-saved-items',
]

afterEach(() => {
  vi.restoreAllMocks()
})

describe('measureStorageUsage', () => {
  beforeEach(() => localStorage.clear())

  it('logic-* キーの byte を集計し、合計と使用率を返す', () => {
    localStorage.setItem('logic-xp', '12345')
    localStorage.setItem('logic-progress', JSON.stringify({ a: 1, b: 2 }))
    // logic- 以外は無視される
    localStorage.setItem('other-key', 'should-be-ignored')

    const report = measureStorageUsage()

    const expectXp = approxByteSize('logic-xp', '12345')
    const expectProg = approxByteSize('logic-progress', JSON.stringify({ a: 1, b: 2 }))
    expect(report.totalBytes).toBe(expectXp + expectProg)
    expect(report.quotaBytes).toBe(STORAGE_QUOTA_BYTES)
    expect(report.ratio).toBeCloseTo((expectXp + expectProg) / STORAGE_QUOTA_BYTES)
    // perKey は bytes 降順
    expect(report.perKey.map((k) => k.key)).toEqual(['logic-progress', 'logic-xp'])
    expect(report.perKey.find((k) => k.key === 'other-key')).toBeUndefined()
  })

  it('approxByteSize は UTF-16 概算（×2）', () => {
    expect(approxByteSize('ab', 'cd')).toBe(8) // (2 + 2) * 2
  })
})

describe('safeSetItem — 通常時', () => {
  beforeEach(() => localStorage.clear())

  it('quota に余裕があればそのまま書く', () => {
    expect(safeSetItem('logic-progress', 'x')).toBe(true)
    expect(localStorage.getItem('logic-progress')).toBe('x')
  })
})

describe('safeSetItem — QuotaExceeded 時の eviction', () => {
  beforeEach(() => localStorage.clear())

  /**
   * jsdom の localStorage は quota を強制しないので、setItem を spy して
   * 「初回は QuotaExceeded、間引いて容量が減ったら成功」を擬似する。
   */
  function mockQuota(opts: { failWhileKeyExists: string }) {
    const real = Storage.prototype.setItem
    const spy = vi.spyOn(Storage.prototype, 'setItem')
    spy.mockImplementation(function (this: Storage, k: string, v: string) {
      // 監視対象キャッシュがまだ存在する間は QuotaExceeded を投げる。
      // eviction（removeItem / 縮小）でそのキーが消えるか縮むと成功に転じる。
      if (localStorage.getItem(opts.failWhileKeyExists) != null && k !== opts.failWhileKeyExists) {
        const err = new DOMException('quota', 'QuotaExceededError')
        throw err
      }
      return real.call(this, k, v)
    })
    return spy
  }

  it('QuotaExceeded で再生成可能キャッシュ（ai-problems）を間引いて書き込む', () => {
    // ai-problems を「重い古いキャッシュ」として用意（複数件の配列）
    const aiProblems = Array.from({ length: 6 }, (_, i) => ({
      id: 10000 + i,
      createdAt: `2026-01-0${i + 1}T00:00:00.000Z`,
      title: `p${i}`,
    }))
    localStorage.setItem('logic-ai-problems', JSON.stringify(aiProblems))

    // ai-problems が「丸ごと残っている間」は quota error。配列が縮むと成功する。
    const real = Storage.prototype.setItem
    const spy = vi.spyOn(Storage.prototype, 'setItem')
    let firstWrite = true
    spy.mockImplementation(function (this: Storage, k: string, v: string) {
      if (k === 'logic-ai-problems' && firstWrite) {
        // 初期セットアップ書き込みは許可
        return real.call(this, k, v)
      }
      // 新規キー書き込み: ai-problems がまだ 6 件のままなら quota
      if (k === 'logic-stats') {
        const cur = localStorage.getItem('logic-ai-problems')
        const len = cur ? JSON.parse(cur).length : 0
        if (len >= 6) throw new DOMException('quota', 'QuotaExceededError')
      }
      return real.call(this, k, v)
    })
    firstWrite = false

    const ok = safeSetItem('logic-stats', 'newvalue')
    expect(ok).toBe(true)
    expect(localStorage.getItem('logic-stats')).toBe('newvalue')
    // ai-problems は古い順に間引かれて件数が減っている（消滅はしていない）
    const remaining = JSON.parse(localStorage.getItem('logic-ai-problems')!)
    expect(remaining.length).toBeLessThan(6)
    expect(remaining.length).toBeGreaterThan(0)
    spy.mockRestore()
  })

  it('eviction しても耐久データ（XP・進捗・プロフィール・flashcards）を消さない', () => {
    for (const k of DURABLE_KEYS) localStorage.setItem(k, `${k}-value`)
    // 間引き候補（nav-snapshot は配列でないので removeItem される）を置く
    localStorage.setItem('logic-nav-snapshot', JSON.stringify({ type: 'home' }))

    // nav-snapshot が存在する間は quota を投げ続けるが、消えれば成功する状況。
    const spy = mockQuota({ failWhileKeyExists: 'logic-nav-snapshot' })

    // 書き込み対象は成長キー（耐久リストには含まれない別キー）。
    const ok = safeSetItem('logic-notebook', 'fresh-notebook')
    expect(ok).toBe(true)
    spy.mockRestore()

    // 新しい値は書けた
    expect(localStorage.getItem('logic-notebook')).toBe('fresh-notebook')
    // 耐久データは全て残っている
    for (const k of DURABLE_KEYS) {
      expect(localStorage.getItem(k)).toBe(`${k}-value`)
    }
  })

  it('間引いても入らなければ false を返し、耐久データは消さない（握るが記録）', () => {
    for (const k of DURABLE_KEYS) localStorage.setItem(k, `${k}-value`)
    localStorage.setItem('logic-search-history', JSON.stringify(['a']))
    localStorage.setItem('logic-activity-log', JSON.stringify([{ ts: 1, type: 'lesson' }]))

    // 常に QuotaExceeded（何を間引いても書けない最悪ケース）
    const real = Storage.prototype.setItem
    const spy = vi.spyOn(Storage.prototype, 'setItem')
    spy.mockImplementation(function (this: Storage, k: string, v: string) {
      // 既存値のセットアップ（removeItem 経由の縮小書き込み含む）は許可、
      // 新規キー logic-stats への書き込みだけ常に失敗させる。
      if (k === 'logic-stats') throw new DOMException('quota', 'QuotaExceededError')
      return real.call(this, k, v)
    })
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})

    const ok = safeSetItem('logic-stats', 'never-fits')
    expect(ok).toBe(false)
    spy.mockRestore()

    // 耐久データは無傷
    for (const k of DURABLE_KEYS) {
      expect(localStorage.getItem(k)).toBe(`${k}-value`)
    }
    expect(warn).toHaveBeenCalled()
  })

  it('EVICTABLE_KEYS に耐久キーが混入していない（防衛的）', () => {
    for (const durable of DURABLE_KEYS) {
      expect(__EVICTABLE_KEYS_FOR_TEST).not.toContain(durable)
    }
  })
})
