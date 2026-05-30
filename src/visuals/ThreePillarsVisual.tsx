import './visuals-phase2.css'
import { useStepReveal } from './hooks/useStepReveal'

/**
 * 3 列カード（汎用）— 「3 つの柱」「3 つの目的」など
 * lesson-28, lesson-72, lesson-89, lesson-96, lesson-315, lesson-358 など 6 レッスン以上で流用
 * 想定 visualId: 'ThreePillarsDiagram'
 *
 * A 案適用 (2026-05-24, §3.1 §2.4 準拠):
 *   - hint fontSize 11→13, padding/lineHeight 拡大
 *   - card title 14→16, body 13→14, num 15→16 (CSS 側)
 *   - warm accent: 3 番目の柱 (.vz-3p-card:nth-child(3)) の num を terracotta に格上げ
 *     （右端 = 最終ピース = 1 visual 内 1 箇所アクセント）
 *
 * default: lesson-28 step.1「ケース面接で問われる 3 つの思考の柱」
 *
 * Props で内容差し替え可能（lesson データ側 `step.visualProps` で指定）:
 *   sectionLabel?: string         — 上部の見出し
 *   pillars?: [Pillar, Pillar, Pillar]
 *                                 — 3 本の柱（title / body / icon?）
 *   hint?: string                 — 完了時に表示するヒント（💡 マーク付き）
 *   revealMode?: 'interactive' | 'static'
 *                                 — interactive (default) は段階開示、static は全表示
 *
 * 未指定フィールドは default 値（ケース面接 3 つの柱）が使われ、後方互換が保たれる。
 *
 * 3 段階で開示:
 *   Step 1 — 柱 1
 *   Step 2 — 柱 1+2
 *   Step 3 — 全 3 本
 */

export type Pillar = {
  title: string
  body: string
  /** 任意：左上に置く 1〜2 文字のラベル (例: 「仮」「M」「U」) */
  icon?: string
}

export type ThreePillarsProps = {
  sectionLabel?: string
  pillars?: [Pillar, Pillar, Pillar]
  hint?: string
  /** 'interactive'（default）= ボタンで段階表示 / 'static' = 全部表示 */
  revealMode?: 'interactive' | 'static'
}

const DEFAULT_PROPS: Required<Omit<ThreePillarsProps, 'revealMode'>> = {
  sectionLabel: 'ケース面接で問われる 3 つの思考の柱',
  pillars: [
    { title: '仮説思考', body: '少ない情報からまず仮の答えを置く' },
    { title: 'MECE', body: '漏れなくダブりなく切り口を整理する' },
    { title: '優先度づけ', body: 'インパクトで打ち手を絞る' },
  ],
  hint: 'この 3 つが揃って初めて、ケース面接の議論が前に進む',
}

export function ThreePillarsVisual(props: ThreePillarsProps = {}) {
  const { revealMode = 'interactive', ...rest } = props
  const { sectionLabel, pillars, hint } = { ...DEFAULT_PROPS, ...rest }
  const { step, isLast, controls } = useStepReveal({ totalSteps: pillars.length, mode: revealMode })

  return (
    <div className="vz-stagger">
      <div className="vz-section-label" style={{ marginBottom: 10 }}>
        {sectionLabel}
      </div>

      <div className="vz-3p-grid">
        {pillars.map((p, i) =>
          i < step ? (
            <div key={i} className="vz-3p-card">
              <div className="vz-3p-num">{p.icon ?? i + 1}</div>
              <div className="vz-3p-title">{p.title}</div>
              <div className="vz-3p-body">{p.body}</div>
            </div>
          ) : null
        )}
      </div>

      {controls}

      {hint && isLast ? (
        <div
          style={{
            marginTop: 14,
            padding: '10px 12px',
            background: 'var(--brand-soft)',
            borderRadius: 8,
            fontSize: '0.8667rem',
            fontWeight: 600,
            color: 'var(--brand)',
            textAlign: 'center',
            lineHeight: 1.45,
          }}
        >
          💡 {hint}
        </div>
      ) : null}
    </div>
  )
}
