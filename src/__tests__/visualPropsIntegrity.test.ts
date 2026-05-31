import { describe, expect, it } from 'vitest'
import type { LessonData, LessonStep } from '../lessonData'

/**
 * FB-01 再発防止ガード — 図解と本文の不整合（サイレントフォールバック）を機械的に止める。
 *
 * 背景（docs/CONTENT_AUDIT_20260525.md L116）:
 *   visualProps は `Record<string, unknown>` 型なので、キー名を間違えても tsc を素通りし、
 *   図解が本文と無関係の default 図にサイレントフォールバックする系統的リスクがある。
 *   実害2件:
 *     - FeedbackLoopDiagram に誤って `edges` + 文字列 ID を渡すと default「貯金が貯金を呼ぶ」へ。
 *       正しくは `arrows` + 数値 index（from/to）。
 *     - LeveragePointsDiagram に誤って `points`(3要素) を渡すと default Tier1-4 へ。
 *       正しくは `tiers`(4要素 label/name/desc)。
 *
 * このテストは「正しいキーが使われ、誤キーが使われていない」ことを ja/en 両方の
 * 全レッスンに対して走査ベースで assert し、修正済みの状態をロックする。
 *
 * スコープ: FeedbackLoopDiagram / LeveragePointsDiagram の 2 visual に限定。
 * PyramidDiagram の `layers` 問題は対象外（designer 案件として別管理）。
 *
 * 実装の正しいキーは各 Visual の Props 型で確定:
 *   - src/visuals/FeedbackLoopVisual.tsx … FeedbackLoopProps.arrows (LoopArrow[]; from/to: number)
 *   - src/visuals/LeveragePointsVisual.tsx … Props.tiers ([Tier,Tier,Tier,Tier])
 */

// リポ内の全レッスンモジュール（ja/en 両方）を eager import して走査する。
// locale 切り替え（window.location.reload を伴う setLocale）に依存せず、
// 物理的に存在する全レッスンマップを直接なめることで取りこぼしを防ぐ。
const lessonModules = import.meta.glob('../*Lessons*.ts', { eager: true }) as Record<
  string,
  Record<string, unknown>
>

type StepLocation = {
  module: string
  exportName: string
  lessonId: number | string
  stepIndex: number
  step: LessonStep & { visual?: string; visualProps?: Record<string, unknown> }
}

function isLessonData(v: unknown): v is LessonData {
  return (
    typeof v === 'object' &&
    v !== null &&
    Array.isArray((v as { steps?: unknown }).steps)
  )
}

/** 全モジュールの全レッスンマップから、visual 付き step を平坦化して収集する。 */
function collectVisualSteps(): StepLocation[] {
  const out: StepLocation[] = []
  for (const [modPath, mod] of Object.entries(lessonModules)) {
    for (const [exportName, exported] of Object.entries(mod)) {
      // レッスンマップ（Record<number, LessonData>）の named export のみ対象。
      if (typeof exported !== 'object' || exported === null) continue
      const entries = Object.values(exported as Record<string, unknown>)
      if (entries.length === 0 || !entries.every(isLessonData)) continue

      for (const lesson of entries as LessonData[]) {
        lesson.steps.forEach((step, stepIndex) => {
          const s = step as LessonStep & { visual?: string; visualProps?: Record<string, unknown> }
          if (typeof s.visual === 'string') {
            out.push({ module: modPath, exportName, lessonId: lesson.id, stepIndex, step: s })
          }
        })
      }
    }
  }
  return out
}

const allVisualSteps = collectVisualSteps()

function stepsForVisual(visualId: string): StepLocation[] {
  return allVisualSteps.filter((l) => l.step.visual === visualId)
}

function describeLoc(l: StepLocation): string {
  return `${l.module} :: ${l.exportName} :: lesson ${l.lessonId} step#${l.stepIndex}`
}

describe('visualProps integrity — FB-01 サイレントフォールバック再発防止', () => {
  it('sanity: 走査でレッスンモジュールと visual 付き step を取得できている', () => {
    expect(Object.keys(lessonModules).length).toBeGreaterThan(0)
    expect(allVisualSteps.length).toBeGreaterThan(0)
  })

  describe('FeedbackLoopDiagram', () => {
    const steps = stepsForVisual('FeedbackLoopDiagram')

    it('リポ内に最低 1 件は存在する（空振り検知）', () => {
      expect(steps.length).toBeGreaterThan(0)
    })

    it.each(steps.map((l) => [describeLoc(l), l] as const))(
      '%s は visualProps を持つなら正しいキー arrows を使い、誤キー edges を持たない',
      (_label, l) => {
        const props = l.step.visualProps
        // visualProps 自体が無い場合は default 図にフォールバックするが、
        // それは「キー名ミス」ではないので本テストの対象外（別途 outro/本文で整合）。
        if (!props) return

        // 誤キー edges は絶対に存在してはならない（存在すると arrows が無視され default 化）。
        expect(props, `${_label}: 誤キー "edges" は禁止（正しくは "arrows"）`).not.toHaveProperty(
          'edges',
        )

        // arrows を指定する場合は LoopArrow[] で from/to が数値であること。
        if ('arrows' in props) {
          const arrows = props.arrows
          expect(Array.isArray(arrows), `${_label}: arrows は配列であること`).toBe(true)
          for (const a of arrows as unknown[]) {
            expect(a, `${_label}: arrows 要素はオブジェクト`).toBeTypeOf('object')
            const arrow = a as { from?: unknown; to?: unknown }
            expect(typeof arrow.from, `${_label}: arrows[].from は数値 index`).toBe('number')
            expect(typeof arrow.to, `${_label}: arrows[].to は数値 index`).toBe('number')
          }
        }
      },
    )
  })

  describe('LeveragePointsDiagram', () => {
    const steps = stepsForVisual('LeveragePointsDiagram')

    it('リポ内に最低 1 件は存在する（空振り検知）', () => {
      expect(steps.length).toBeGreaterThan(0)
    })

    it.each(steps.map((l) => [describeLoc(l), l] as const))(
      '%s は visualProps を持つなら正しいキー tiers を使い、誤キー points を持たない',
      (_label, l) => {
        const props = l.step.visualProps
        if (!props) return

        // 誤キー points は絶対に存在してはならない（存在すると tiers が無視され default 化）。
        expect(props, `${_label}: 誤キー "points" は禁止（正しくは "tiers"）`).not.toHaveProperty(
          'points',
        )

        // tiers を指定する場合は配列であること。
        if ('tiers' in props) {
          expect(Array.isArray(props.tiers), `${_label}: tiers は配列であること`).toBe(true)
        }
      },
    )
  })
})
