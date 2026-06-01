import { describe, expect, it, beforeEach, vi } from 'vitest'
import {
  pickHomeFermiIndexPure,
  getHomeFermiIndex,
  setHomeFermiIndex,
  addDailyFermiDoneIndex,
  getDailyFermiDoneIndexes,
} from '../screens/dailyFermiState'
import { FERMI_POOL, getDailyFermiIndex } from '../fermiData'

// ── フィルタテスト用ヘルパー ──────────────────────────────────────────────────
// テスト用の小さなプール（difficulty/domain バリエーションを含む）を直接参照せず、
// 実際の FERMI_POOL（JA デフォルト）を使う。
// JA プールのインデックスと difficulty/domain は fermiData.ts で定義済み。
// idx 5  = basic / cost
// idx 0  = advanced / market
// idx 22 = basic / unit
// idx 11 = advanced / flow

/**
 * T-A 回帰テスト: ホームの「今日の1問」カードと、タップ後の Daily 画面が
 * 常に同じフェルミ問題を指すことを保証する。
 *
 * 根因だったのは「ホームは未完了プール + 日付シードで選ぶが、Daily は
 * session が無いと生の getDailyFermiIndex() にフォールバックしていた」ズレ。
 * 単一の真実源 getHomeFermiIndex() / pickHomeFermiIndexPure() に集約したので、
 * done セットが非空でも・日付が変わっても・session が揮発しても一致する。
 */

describe('pickHomeFermiIndexPure (純関数・単一の真実源)', () => {
  it('同一入力なら決定的に同じ index を返す（同日・同 done・同 seed）', () => {
    const a = pickHomeFermiIndexPure(10, 3, [], null)
    const b = pickHomeFermiIndexPure(10, 3, [], null)
    expect(a).toBe(b)
    expect(a).toBe(3) // done 空なら seed % length
  })

  it('done セットが非空でもホーム / Daily は同じ index を出す', () => {
    const poolLength = 10
    const seed = 7
    // 1問以上解いて done が非空になった状況を再現
    const done = [0, 5]
    const homePick = pickHomeFermiIndexPure(poolLength, seed, done, null)
    const dailyPick = pickHomeFermiIndexPure(poolLength, seed, done, null)
    expect(homePick).toBe(dailyPick)
    expect(homePick).not.toBeNull()
    // 完了済みの問題は選ばれない
    expect(done).not.toContain(homePick)
  })

  it('done が非空のとき、生の seed%length とは別ロジック（未完了プール基準）で選ぶ', () => {
    // poolLength=5, seed=2, done=[2] のケース。
    // 生の seed%length なら index 2（= done 済み）を指してしまうが、
    // 未完了プール [0,1,3,4] から選ぶので 2 以外になる。
    const pick = pickHomeFermiIndexPure(5, 2, [2], null)
    expect(pick).not.toBe(2)
    expect([0, 1, 3, 4]).toContain(pick)
  })

  it('日付が変わる（seed が変わる）と未完了プールから次の問題に進む', () => {
    const poolLength = 10
    const day1 = pickHomeFermiIndexPure(poolLength, 0, [], null)
    const day2 = pickHomeFermiIndexPure(poolLength, 1, [], null)
    expect(day1).toBe(0)
    expect(day2).toBe(1)
    expect(day1).not.toBe(day2)
  })

  it('session の手動指定（reroll）が未完了ならそれを優先する', () => {
    const pick = pickHomeFermiIndexPure(10, 3, [0, 1], 8)
    expect(pick).toBe(8)
  })

  it('session の手動指定が完了済みなら無視して決定的ロジックへ落ちる', () => {
    // sessionIndex=5 だが done に 5 が含まれる → 5 は使わない
    const pick = pickHomeFermiIndexPure(10, 3, [5], 5)
    expect(pick).not.toBe(5)
    expect(pick).not.toBeNull()
  })

  it('session 指定が範囲外なら無視する', () => {
    expect(pickHomeFermiIndexPure(10, 3, [], 999)).toBe(3)
    expect(pickHomeFermiIndexPure(10, 3, [], -1)).toBe(3)
  })

  it('全問完了なら null を返す', () => {
    const allDone = Array.from({ length: 10 }, (_, i) => i)
    expect(pickHomeFermiIndexPure(10, 3, allDone, null)).toBeNull()
  })

  it('poolLength が 0 以下なら null', () => {
    expect(pickHomeFermiIndexPure(0, 0, [], null)).toBeNull()
  })

  it('seed が負でも安全に剰余を取って範囲内の index を返す', () => {
    const pick = pickHomeFermiIndexPure(10, -3, [], null)
    expect(pick).not.toBeNull()
    expect(pick! >= 0 && pick! < 10).toBe(true)
  })
})

describe('getHomeFermiIndex (ラッパー・ホーム / Daily 統合シナリオ)', () => {
  beforeEach(() => {
    // setup.ts が localStorage/sessionStorage を clear 済み。時刻を固定して
    // getDailyFermiIndex() を安定させる。
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-05-28T09:00:00Z'))
  })

  it('未解答時: ホームと Daily が同じ index を指す', () => {
    // ホームが初期表示で呼ぶ
    const homeIndex = getHomeFermiIndex()
    // Daily が（session 経由で）呼ぶ
    const dailyIndex = getHomeFermiIndex()
    expect(homeIndex).toBe(dailyIndex)
    expect(homeIndex).toBe(getDailyFermiIndex())
  })

  it('ホーム初期表示で必ず共有 session キーに書く（リロール時だけでない）', () => {
    const homeIndex = getHomeFermiIndex()
    const saved = sessionStorage.getItem('home-fermi-index')
    expect(saved).toBe(String(homeIndex))
  })

  it('1問以上解答後（done 非空）でもホームと Daily が一致する', () => {
    // ホームの最初の表示を解く
    const first = getHomeFermiIndex()!
    addDailyFermiDoneIndex(first)
    expect(getDailyFermiDoneIndexes()).toContain(first)

    // 完了済み指定が session に残っているので、次の getHomeFermiIndex は
    // それを破棄して未完了プールから決定的に選び直す。
    const homeNext = getHomeFermiIndex()
    const dailyNext = getHomeFermiIndex()
    expect(homeNext).toBe(dailyNext)
    expect(homeNext).not.toBe(first) // 解いた問題は出ない
  })

  it('session が揮発しても日付シードで再計算して同じ結果に収束する（done 非空）', () => {
    if (FERMI_POOL.length < 3) return // pool が極小なら検証スキップ
    // ある問題を解いて done を非空にする
    addDailyFermiDoneIndex(0)

    // ホームが表示・session に書く
    const homeIndex = getHomeFermiIndex()

    // セッション再起動を模して session だけ消す（localStorage の done は残す）
    sessionStorage.clear()

    // Daily が session 無しで呼ぶ → 同じ done + 同じ日付シードで再計算
    const dailyIndex = getHomeFermiIndex()
    expect(dailyIndex).toBe(homeIndex)
  })

  it('リロール（別の問題）指定が未完了なら維持される', () => {
    if (FERMI_POOL.length < 2) return
    // 1問目とは別の未完了 index をリロール指定
    const first = getHomeFermiIndex()!
    const rerollTarget = (first + 1) % FERMI_POOL.length
    setHomeFermiIndex(rerollTarget)

    // ホームも Daily もリロール先を指す
    expect(getHomeFermiIndex()).toBe(rerollTarget)
    expect(getHomeFermiIndex()).toBe(rerollTarget)
  })

  it('日付が変わると未完了プールから次の1問に進む', () => {
    if (FERMI_POOL.length < 2) return
    const day1 = getHomeFermiIndex()

    // 翌日へ。session は前日のものが残っている状況でも、
    // 完了状態リセット + seed 変化で結果が更新される想定。
    sessionStorage.clear()
    localStorage.clear()
    vi.setSystemTime(new Date('2026-05-29T09:00:00Z'))

    const day2 = getHomeFermiIndex()
    expect(day2).toBe(getDailyFermiIndex())
    // pool が十分あれば日付で index は変わる（連続日なら +1）
    expect(day2).not.toBe(day1)
  })
})

// ── DF-F13: フィルタ機能テスト ────────────────────────────────────────────────
describe('pickHomeFermiIndexPure フィルタ機能', () => {
  it('difficulty フィルタが正しく適用される（basic のみ選ばれる）', () => {
    // 全件 done=空でフィルタ = 'basic' を指定
    const pick = pickHomeFermiIndexPure(FERMI_POOL.length, 0, [], null, 'basic', null)
    expect(pick).not.toBeNull()
    if (pick != null) {
      expect(FERMI_POOL[pick].difficulty).toBe('basic')
    }
  })

  it('domain フィルタが正しく適用される（cost のみ選ばれる）', () => {
    const pick = pickHomeFermiIndexPure(FERMI_POOL.length, 0, [], null, null, 'cost')
    expect(pick).not.toBeNull()
    if (pick != null) {
      expect(FERMI_POOL[pick].domain).toBe('cost')
    }
  })

  it('複合フィルタ（difficulty=advanced + domain=market）が適用される', () => {
    const pick = pickHomeFermiIndexPure(FERMI_POOL.length, 0, [], null, 'advanced', 'market')
    expect(pick).not.toBeNull()
    if (pick != null) {
      expect(FERMI_POOL[pick].difficulty).toBe('advanced')
      expect(FERMI_POOL[pick].domain).toBe('market')
    }
  })

  it('フィルタなし（省略・null）は従来と同じ動作（全件から選ぶ）', () => {
    const withNull = pickHomeFermiIndexPure(FERMI_POOL.length, 3, [], null, null, null)
    const legacy = pickHomeFermiIndexPure(FERMI_POOL.length, 3, [], null)
    // どちらも同じ結果になる
    expect(withNull).toBe(legacy)
  })

  it('フィルタ結果が0件でもフォールバックして null を返さない（全問完了でない限り）', () => {
    // JA pool に 'cost' domain は idx=5 のみ。idx=5 を done にしたうえでフィルタ指定。
    // フォールバックで全未完了から選ぶので非 null になる。
    const costIdx = FERMI_POOL.findIndex(q => q.domain === 'cost')
    const done = costIdx >= 0 ? [costIdx] : []
    const pick = pickHomeFermiIndexPure(FERMI_POOL.length, 0, done, null, null, 'cost')
    // フォールバックが動くので非 null（全問完了でなければ）
    if (done.length < FERMI_POOL.length) {
      expect(pick).not.toBeNull()
    }
  })

  it('全問完了なら null を返す（フィルタあり・なし共通）', () => {
    const allDone = Array.from({ length: FERMI_POOL.length }, (_, i) => i)
    expect(pickHomeFermiIndexPure(FERMI_POOL.length, 0, allDone, null, 'basic', null)).toBeNull()
    expect(pickHomeFermiIndexPure(FERMI_POOL.length, 0, allDone, null, null, null)).toBeNull()
  })
})
