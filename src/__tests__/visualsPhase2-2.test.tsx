import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { getVisualComponent, renderVisual } from '../visuals'
import { computeWaterfall, overall, rate, doublingYears } from '../visuals/numeracyMath'

/**
 * Phase 2-2 新規部品（ContributionWaterfallDiagram / SimpsonsParadoxDiagram /
 * RuleOf72Diagram）の registry 解決・主要描画・数値算出を検証する。
 * 数値は割当先 numeracy 本文と一致させること（捏造防止）。
 */

const PHASE2_2_IDS = [
  'ContributionWaterfallDiagram',
  'SimpsonsParadoxDiagram',
  'RuleOf72Diagram',
] as const

describe('visuals Phase 2-2 registry', () => {
  it.each(PHASE2_2_IDS)('resolves "%s" from the registry', (id) => {
    expect(getVisualComponent(id)).not.toBeNull()
  })

  it.each(PHASE2_2_IDS)('renders "%s" with default props', (id) => {
    const el = renderVisual(id)
    expect(el).not.toBeNull()
    const { container } = render(el!)
    expect(container.querySelector('.vz-stagger')).not.toBeNull()
  })
})

describe('ContributionWaterfallDiagram', () => {
  // 本文: A +12, B -3, C +1 → 合計 +10（100億→110億 の 10% 成長）
  it('computeWaterfall sums contributions to the total (matches lesson: +12 −3 +1 = +10)', () => {
    const { total, steps } = computeWaterfall([
      { label: 'A事業', value: 12 },
      { label: 'B事業', value: -3 },
      { label: 'C事業', value: 1 },
    ])
    expect(total).toBe(10)
    // 累計の推移: 0→12→9→10
    expect(steps.map((s) => s.end)).toEqual([12, 9, 10])
    expect(steps[0].rising).toBe(true)
    expect(steps[1].rising).toBe(false)
  })

  it('avoids floating-point drift on the total', () => {
    const { total } = computeWaterfall([
      { label: 'x', value: 0.1 },
      { label: 'y', value: 0.2 },
    ])
    expect(total).toBe(0.3)
  })

  it('renders one bar per item plus a total bar', () => {
    const el = renderVisual('ContributionWaterfallDiagram')
    const { container } = render(el!)
    // 3 items + 1 total = 4 bars
    expect(container.querySelectorAll('.vz-cw-bar')).toHaveLength(4)
    expect(container.querySelector('.vz-cw-bar.rise')).not.toBeNull()
    expect(container.querySelector('.vz-cw-bar.fall')).not.toBeNull()
    expect(container.querySelector('.vz-cw-bar.total')).not.toBeNull()
  })
})

describe('SimpsonsParadoxDiagram', () => {
  const SEGMENTS = [
    { name: '軽症', a: { num: 90, denom: 100 }, b: { num: 9, denom: 10 } },
    { name: '重症', a: { num: 3, denom: 10 }, b: { num: 35, denom: 100 } },
  ]

  it('rate() matches lesson segment percentages', () => {
    expect(rate(SEGMENTS[0].a)).toBe(90) // 90/100
    expect(rate(SEGMENTS[0].b)).toBe(90) // 9/10
    expect(rate(SEGMENTS[1].a)).toBe(30) // 3/10
    expect(rate(SEGMENTS[1].b)).toBe(35) // 35/100
  })

  it('overall aggregation reproduces the paradox (A 84.5% > B 40%)', () => {
    const a = overall(SEGMENTS, 'a')
    const b = overall(SEGMENTS, 'b')
    expect(a).toEqual({ num: 93, denom: 110 })
    expect(b).toEqual({ num: 44, denom: 110 })
    expect(rate(a)).toBe(84.5) // (90+3)/110
    expect(rate(b)).toBe(40) // (9+35)/110
    // セグメント別では A は B を上回らないのに、全体では逆転する
    expect(rate(SEGMENTS[1].a)).toBeLessThan(rate(SEGMENTS[1].b))
    expect(rate(a)).toBeGreaterThan(rate(b))
  })

  it('renders segment rows plus an overall row', () => {
    const el = renderVisual('SimpsonsParadoxDiagram')
    const { container, getByText } = render(el!)
    // 2 segments + 1 overall
    expect(container.querySelectorAll('.vz-sp-segment')).toHaveLength(3)
    expect(container.querySelector('.vz-sp-segment.overall')).not.toBeNull()
    expect(getByText('84.5%')).toBeInTheDocument()
    expect(getByText('40%')).toBeInTheDocument()
  })
})

describe('RuleOf72Diagram', () => {
  it('doublingYears = 72 / rate (matches lesson examples)', () => {
    expect(doublingYears(1)).toBe(72)
    expect(doublingYears(2)).toBe(36)
    expect(doublingYears(3)).toBe(24)
    expect(doublingYears(5)).toBe(14.4)
    expect(doublingYears(6)).toBe(12)
    expect(doublingYears(8)).toBe(9)
    expect(doublingYears(10)).toBe(7.2)
    expect(doublingYears(12)).toBe(6)
  })

  it('respects a custom constant', () => {
    expect(doublingYears(10, 70)).toBe(7)
  })

  it('renders a row per rate and a data point per row', () => {
    const el = renderVisual('RuleOf72Diagram')
    const { container, getByText } = render(el!)
    // default rows = 7
    expect(container.querySelectorAll('.vz-r72-table tbody tr')).toHaveLength(7)
    expect(container.querySelectorAll('.vz-r72-dot')).toHaveLength(7)
    // 本文の代表値が表に出る
    expect(getByText('72年')).toBeInTheDocument()
    expect(getByText('7.2年')).toBeInTheDocument()
  })

  it('auto-computes years when omitted in rows', () => {
    const el = renderVisual('RuleOf72Diagram', {
      rows: [{ rate: 4 }, { rate: 9, years: 8 }],
    })
    const { getByText } = render(el!)
    expect(getByText('18年')).toBeInTheDocument() // 72/4
    expect(getByText('8年')).toBeInTheDocument() // explicit override
  })
})
