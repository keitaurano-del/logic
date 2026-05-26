import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { getVisualComponent, renderVisual } from '../visuals'

/**
 * Phase 2-1 新規部品（AnswerContrastDiagram / NormalDistribution68Diagram /
 * FalsePositiveGridDiagram）の registry 解決と最低限の描画を検証する。
 * 既存 visuals/registry の作法（getVisualComponent / renderVisual）に倣う。
 */

const PHASE2_1_IDS = [
  'AnswerContrastDiagram',
  'NormalDistribution68Diagram',
  'FalsePositiveGridDiagram',
] as const

describe('visuals Phase 2-1 registry', () => {
  it.each(PHASE2_1_IDS)('resolves "%s" from the registry', (id) => {
    expect(getVisualComponent(id)).not.toBeNull()
  })

  it('returns null for an unknown visual id (fallback path intact)', () => {
    expect(getVisualComponent('NoSuchDiagramXYZ')).toBeNull()
    expect(renderVisual('NoSuchDiagramXYZ')).toBeNull()
  })

  it.each(PHASE2_1_IDS)('renders "%s" with default props', (id) => {
    const el = renderVisual(id)
    expect(el).not.toBeNull()
    const { container } = render(el!)
    // ルートに stagger コンテナが出る（全 Visual 共通の枠）
    expect(container.querySelector('.vz-stagger')).not.toBeNull()
  })

  it('AnswerContrastDiagram renders bad/good columns and custom items', () => {
    const el = renderVisual('AnswerContrastDiagram', {
      bad: { title: '悪い例', items: ['事実の羅列'] },
      good: { title: '良い例', items: ['主張を一文で'] },
    })
    const { container, getByText } = render(el!)
    expect(container.querySelector('.vz-acd-col.bad')).not.toBeNull()
    expect(container.querySelector('.vz-acd-col.good')).not.toBeNull()
    expect(getByText('事実の羅列')).toBeInTheDocument()
    expect(getByText('主張を一文で')).toBeInTheDocument()
  })

  it('NormalDistribution68Diagram draws three σ bands and localizable legend', () => {
    const el = renderVisual('NormalDistribution68Diagram', {
      legendLabels: ['A', 'B', 'C'],
    })
    const { container } = render(el!)
    expect(container.querySelector('.vz-nd-band.band1')).not.toBeNull()
    expect(container.querySelector('.vz-nd-band.band2')).not.toBeNull()
    expect(container.querySelector('.vz-nd-band.band3')).not.toBeNull()
    expect(container.querySelectorAll('.vz-nd-swatch')).toHaveLength(3)
  })

  it('FalsePositiveGridDiagram dot count = totalDots and PPV is computed', () => {
    const el = renderVisual('FalsePositiveGridDiagram', {
      totalDots: 110,
      truePositives: 10,
      falsePositives: 100,
      resultLabel: 'PPV:',
    })
    const { container } = render(el!)
    // grid 内のドット数 = totalDots（凡例ドットは grid 外なので含まれない）
    expect(container.querySelectorAll('.vz-fpg-grid .vz-fpg-dot')).toHaveLength(110)
    // 10 / 110 ≒ 9%
    expect(container.querySelector('.vz-fpg-result-value')?.textContent).toContain('9%')
  })
})
