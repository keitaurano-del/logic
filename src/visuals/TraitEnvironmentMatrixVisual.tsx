import './visuals-phase2.css'
import { useStepReveal } from './hooks/useStepReveal'

/**
 * TraitEnvironmentMatrixVisual — 特性 × 環境マトリクス（ADHD コース lesson-804 用）
 *
 * 縦軸: ADHD 特性 4 つ（過集中 / 発散思考 / 即興性 / 新奇探索性）
 * 横軸: 環境タイプ 4 つ（変化大 / 反復 / 並列管理 / 自律高）
 * セル: 「強みに反転 (strength)」/ 「消耗に転じる (drain)」を 2 値で可視化
 *
 * トーン: 同じ特性でも環境次第で「強み」にも「困りごと」にも転じる、という
 * Lesson 804 のメッセージを 1 枚で伝える。矯正・治療ではなく「自分に合う環境
 * を選ぶ」というレバレッジ論の図。
 *
 * A 案 Phase 3 適用済 (2026-05-24, §3.1 §2.4 準拠):
 *   - inline ヘッダー env 10.5→12, trait ラベル 11→12, セル内 label 10→12,
 *     凡例 11→12, hint 11→13, padding/lineHeight 拡大
 *   - warm accent: hint ボックスを terracotta soft 背景に
 *     (strength/drain の brand/accent 意味色は §2.3 例外として維持、hint 1 箇所のみ温度感色)
 */

export type TraitMatrixCell = 'strength' | 'drain' | 'neutral'

export type TraitEnvironmentMatrixProps = {
  sectionLabel?: string
  /** 縦軸: ADHD 特性（4 つ固定） */
  traits?: [string, string, string, string]
  /** 横軸: 環境タイプ（4 つ固定） */
  environments?: [string, string, string, string]
  /**
   * 4 × 4 セル。`cells[traitIndex][envIndex]`。
   * 各セルは "strength" / "drain" / "neutral" のいずれか。
   */
  cells?: [
    [TraitMatrixCell, TraitMatrixCell, TraitMatrixCell, TraitMatrixCell],
    [TraitMatrixCell, TraitMatrixCell, TraitMatrixCell, TraitMatrixCell],
    [TraitMatrixCell, TraitMatrixCell, TraitMatrixCell, TraitMatrixCell],
    [TraitMatrixCell, TraitMatrixCell, TraitMatrixCell, TraitMatrixCell],
  ]
  hint?: string
  /** 'interactive'（default）= 特性行ごとに段階表示 / 'static' = 全表示 */
  revealMode?: 'interactive' | 'static'
}

const DEFAULT_TRAITS: [string, string, string, string] = [
  '過集中',
  '発散思考',
  '即興性',
  '新奇探索性',
]

const DEFAULT_ENVS: [string, string, string, string] = [
  '変化大',
  '反復',
  '並列管理',
  '自律高',
]

const DEFAULT_CELLS: TraitEnvironmentMatrixProps['cells'] = [
  // 過集中 × [変化大 / 反復 / 並列管理 / 自律高]
  ['neutral', 'drain', 'drain', 'strength'],
  // 発散思考
  ['strength', 'drain', 'neutral', 'strength'],
  // 即興性
  ['strength', 'drain', 'neutral', 'strength'],
  // 新奇探索性
  ['strength', 'drain', 'neutral', 'strength'],
]

function cellAppearance(value: TraitMatrixCell): {
  style: React.CSSProperties
  glyph: string
  label: string
} {
  if (value === 'strength') {
    return {
      style: {
        background: 'var(--brand-soft)',
        border: '1.5px solid var(--brand)',
        color: 'var(--brand)',
      },
      glyph: '↑',
      label: '強み',
    }
  }
  if (value === 'drain') {
    return {
      style: {
        background: 'var(--accent-soft)',
        border: '1.5px solid var(--accent)',
        color: 'var(--accent-dark)',
      },
      glyph: '↓',
      label: '消耗',
    }
  }
  return {
    style: {
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      color: 'var(--text-muted)',
    },
    glyph: '·',
    label: 'どちらでも',
  }
}

export function TraitEnvironmentMatrixVisual(
  props: TraitEnvironmentMatrixProps = {},
) {
  const {
    sectionLabel = '特性 × 環境マトリクス — 同じ特性、違う結果',
    traits = DEFAULT_TRAITS,
    environments = DEFAULT_ENVS,
    cells = DEFAULT_CELLS!,
    hint = '同じ特性でも「環境次第で強み・消耗が反転する」のがレバレッジの本質',
    revealMode = 'interactive',
  } = props

  const { step, isLast, controls } = useStepReveal({
    totalSteps: traits.length,
    mode: revealMode,
  })

  return (
    <div className="vz-stagger">
      <div className="vz-section-label" style={{ marginBottom: 10 }}>
        {sectionLabel}
      </div>

      <div
        role="table"
        aria-label="特性 × 環境マトリクス"
        style={{
          display: 'grid',
          gridTemplateColumns: '72px repeat(4, 1fr)',
          gap: 6,
          width: '100%',
        }}
      >
        {/* ヘッダー行 (環境) */}
        <div />
        {environments.map((e) => (
          <div
            key={`env-${e}`}
            style={{
              fontSize: '0.8rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
              color: 'var(--text-muted)',
              textAlign: 'center',
              textTransform: 'uppercase',
              padding: '2px 0',
            }}
          >
            {e}
          </div>
        ))}

        {/* 各 trait 行 */}
        {traits.map((trait, rIdx) => {
          const visible = rIdx < step
          return (
            <div key={`row-${trait}`} style={{ display: 'contents' }}>
              <div
                style={{
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  textAlign: 'right',
                  alignSelf: 'center',
                  paddingRight: 6,
                  opacity: visible ? 1 : 0.25,
                  transition: 'opacity 0.25s',
                }}
              >
                {trait}
              </div>
              {cells[rIdx].map((cell, cIdx) => {
                if (!visible) {
                  return (
                    <div
                      key={`cell-${rIdx}-${cIdx}`}
                      style={{
                        background: 'var(--bg-card)',
                        border: '1px dashed var(--border)',
                        borderRadius: 8,
                        minHeight: 52,
                      }}
                    />
                  )
                }
                const a = cellAppearance(cell)
                return (
                  <div
                    key={`cell-${rIdx}-${cIdx}`}
                    style={{
                      ...a.style,
                      borderRadius: 8,
                      padding: '6px 4px',
                      minHeight: 52,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 2,
                    }}
                  >
                    <span style={{ fontSize: '1.2rem', fontWeight: 800, lineHeight: 1 }}>
                      {a.glyph}
                    </span>
                    <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{a.label}</span>
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>

      {/* 凡例 */}
      <div
        style={{
          marginTop: 12,
          display: 'flex',
          gap: 14,
          justifyContent: 'center',
          fontSize: '0.8rem',
          color: 'var(--text-secondary)',
        }}
      >
        <span>
          <span
            style={{
              display: 'inline-block',
              width: 10,
              height: 10,
              borderRadius: 3,
              background: 'var(--brand)',
              marginRight: 4,
              verticalAlign: 'middle',
            }}
          />
          強みに反転
        </span>
        <span>
          <span
            style={{
              display: 'inline-block',
              width: 10,
              height: 10,
              borderRadius: 3,
              background: 'var(--accent)',
              marginRight: 4,
              verticalAlign: 'middle',
            }}
          />
          消耗に転じる
        </span>
      </div>

      {controls}

      {hint && isLast ? (
        <div
          style={{
            marginTop: 14,
            padding: '10px 12px',
            background: 'var(--visual-warm-primary-soft)',
            borderRadius: 8,
            fontSize: '0.8667rem',
            fontWeight: 600,
            color: 'var(--visual-warm-primary-deep)',
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
