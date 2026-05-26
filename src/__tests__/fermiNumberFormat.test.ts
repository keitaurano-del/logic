import { describe, it, expect } from 'vitest'
import { roundTo1, formatJpUnit, formatResult, applyUnitMultiplier } from '../fermiNumberFormat'

describe('roundTo1', () => {
  it('1桁に丸めて末尾.0を落とす', () => {
    expect(roundTo1(5)).toBe('5')
    expect(roundTo1(5.0)).toBe('5')
    expect(roundTo1(1.234)).toBe('1.2')
    expect(roundTo1(1.25)).toBe('1.3') // 四捨五入
    expect(roundTo1(12)).toBe('12')
    expect(roundTo1(0)).toBe('0')
  })
})

describe('formatJpUnit (ja)', () => {
  it('万未満はそのまま区切り表示', () => {
    expect(formatJpUnit(0)).toBe('0')
    expect(formatJpUnit(5)).toBe('5')
    expect(formatJpUnit(999)).toBe('999')
    expect(formatJpUnit(1234)).toBe('1,234')
    expect(formatJpUnit(9999)).toBe('9,999')
  })

  it('万単位（10^4〜）を1桁丸めで表示', () => {
    expect(formatJpUnit(10000)).toBe('1万')
    expect(formatJpUnit(50000)).toBe('5万')
    expect(formatJpUnit(12345)).toBe('1.2万') // 端数1桁丸め
    expect(formatJpUnit(125000)).toBe('12.5万')
  })

  it('億単位（10^8〜）', () => {
    expect(formatJpUnit(1e8)).toBe('1億')
    expect(formatJpUnit(1.2e8)).toBe('1.2億')
    expect(formatJpUnit(350000000)).toBe('3.5億')
  })

  it('兆単位（10^12〜）', () => {
    expect(formatJpUnit(1e12)).toBe('1兆')
    expect(formatJpUnit(3.5e12)).toBe('3.5兆')
    expect(formatJpUnit(1.2e15)).toBe('1200兆') // 兆を超えても兆で表示し続ける
  })

  it('境界値の扱い', () => {
    expect(formatJpUnit(9999)).toBe('9,999') // 万未満
    expect(formatJpUnit(10000)).toBe('1万') // ちょうど万
    expect(formatJpUnit(99999999)).toBe('10000万') // 億直前は万で表示（< 1e8）
    expect(formatJpUnit(1e8)).toBe('1億') // ちょうど億
  })

  it('負値', () => {
    expect(formatJpUnit(-50000)).toBe('−5万')
    expect(formatJpUnit(-1.2e8)).toBe('−1.2億')
    expect(formatJpUnit(-500)).toBe('-500') // 万未満は toLocaleString のマイナス
  })

  it('小さい小数は単位化しない', () => {
    expect(formatJpUnit(0.5)).toBe('0.5')
    expect(formatJpUnit(0.001)).toBe('0.001')
  })

  it('非有限値はダッシュ', () => {
    expect(formatJpUnit(NaN)).toBe('—')
    expect(formatJpUnit(Infinity)).toBe('—')
  })
})

describe('formatJpUnit (en)', () => {
  it('K / M / B / T 表記（10進ベース）', () => {
    expect(formatJpUnit(5000, 'en')).toBe('5K')
    expect(formatJpUnit(50000, 'en')).toBe('50K')
    expect(formatJpUnit(1.2e6, 'en')).toBe('1.2M')
    expect(formatJpUnit(1.2e8, 'en')).toBe('120M')
    expect(formatJpUnit(3.5e9, 'en')).toBe('3.5B')
    expect(formatJpUnit(3.5e12, 'en')).toBe('3.5T')
  })
  it('千未満はそのまま', () => {
    expect(formatJpUnit(123, 'en')).toBe('123')
    expect(formatJpUnit(999, 'en')).toBe('999')
  })
  it('負値', () => {
    expect(formatJpUnit(-50000, 'en')).toBe('−50K')
  })
})

describe('formatResult', () => {
  it('通常範囲はロケール区切り', () => {
    expect(formatResult(50000)).toBe('50,000')
    expect(formatResult(1234.5)).toBe('1,234.5')
    expect(formatResult(0)).toBe('0')
  })
  it('極端な桁は指数表記', () => {
    expect(formatResult(1e15)).toBe('1.000e+15')
    expect(formatResult(0.00001)).toBe('1.000e-5')
  })
  it('非有限値はダッシュ', () => {
    expect(formatResult(NaN)).toBe('—')
  })
})

describe('applyUnitMultiplier', () => {
  it('末尾の数値に万（1e4）を掛ける', () => {
    expect(applyUnitMultiplier('5', 1e4)).toBe('50000')
    expect(applyUnitMultiplier('1.5', 1e4)).toBe('15000')
    expect(applyUnitMultiplier('12', 1e4)).toBe('120000')
  })

  it('末尾の数値に億（1e8）を掛ける', () => {
    expect(applyUnitMultiplier('3', 1e8)).toBe('300000000')
    expect(applyUnitMultiplier('1.2', 1e8)).toBe('120000000')
  })

  it('式の途中の末尾数値だけに掛ける', () => {
    expect(applyUnitMultiplier('3*2', 1e8)).toBe('3*200000000')
    expect(applyUnitMultiplier('100+5', 1e4)).toBe('100+50000')
  })

  it('小数点始まりの数値', () => {
    expect(applyUnitMultiplier('.5', 1e4)).toBe('5000')
  })

  it('浮動小数誤差が出ないこと', () => {
    expect(applyUnitMultiplier('1.1', 1e8)).toBe('110000000')
    expect(applyUnitMultiplier('2.3', 1e4)).toBe('23000')
  })

  it('末尾が数値でなければ null', () => {
    expect(applyUnitMultiplier('', 1e4)).toBeNull()
    expect(applyUnitMultiplier('5+', 1e4)).toBeNull()
    expect(applyUnitMultiplier('5*', 1e4)).toBeNull()
    expect(applyUnitMultiplier('(', 1e4)).toBeNull()
    expect(applyUnitMultiplier('5)', 1e4)).toBeNull()
  })
})
