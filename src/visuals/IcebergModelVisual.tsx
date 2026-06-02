import { useStepReveal } from './hooks/useStepReveal'

/**
 * 氷山モデル — システムを 4 層で見る
 * できごと（見える） / パターン / 構造 / メンタルモデル（最深部）
 * lesson-65 step.2 step.visual='IcebergModelDiagram'
 *
 * 4 段階で開示:
 *   Step 1 — できごと
 *   Step 2 — できごと + 水面 + パターン
 *   Step 3 — + 構造
 *   Step 4 — + メンタルモデル
 *
 * Props で内容差し替え可能（lesson データ側 `step.visualProps` で指定）:
 *   sectionLabel?: string                          — 上部の見出し
 *   waterlineLabel?: string                        — 水面のラベル
 *   surface? / pattern? / structure? / mental?:    — 4 層 (label / title / body)
 *   hint?: string                                  — 最終 step で表示するヒント
 *   revealMode?: 'interactive' | 'static'
 *
 * 未指定フィールドは default 値が使われ、後方互換が保たれる。
 */

export type IcebergLayer = {
  label?: string
  title?: string
  body?: string
}

export type IcebergModelProps = {
  /** 'interactive'（default）= ボタンで段階表示 / 'static' = 全部表示 */
  revealMode?: 'interactive' | 'static'
  sectionLabel?: string
  waterlineLabel?: string
  /** Lv.1 できごと（水面より上） */
  surface?: IcebergLayer
  /** Lv.2 パターン */
  pattern?: IcebergLayer
  /** Lv.3 構造 */
  structure?: IcebergLayer
  /** Lv.4 メンタルモデル（最深部） */
  mental?: IcebergLayer
  hint?: string
}

const DEFAULT_PROPS = {
  sectionLabel: '氷山モデル — 見えるのは全体の 10%',
  waterlineLabel: '水面 / Waterline',
  surface: {
    label: 'Lv.1 できごと',
    title: '何が起きたか',
    body: '遅刻が増えた／売上が落ちた',
  },
  pattern: {
    label: 'Lv.2 パターン',
    title: '繰り返し起きること',
    body: '月末に集中／同じ部署で頻発',
  },
  structure: {
    label: 'Lv.3 構造',
    title: '仕組み・関係性',
    body: '評価制度・ワークフロー・人員配置',
  },
  mental: {
    label: 'Lv.4 メンタルモデル',
    title: '前提となる思い込み',
    body: '「残業＝努力」「忙しい人が偉い」',
  },
  hint: '深く潜るほどレバレッジが効く。上っ面のできごとだけ叩いても再発する',
} as const

export function IcebergModelVisual(props: IcebergModelProps = {}) {
  const { revealMode = 'interactive' } = props
  const merged = {
    sectionLabel: props.sectionLabel ?? DEFAULT_PROPS.sectionLabel,
    waterlineLabel: props.waterlineLabel ?? DEFAULT_PROPS.waterlineLabel,
    surface: { ...DEFAULT_PROPS.surface, ...(props.surface ?? {}) },
    pattern: { ...DEFAULT_PROPS.pattern, ...(props.pattern ?? {}) },
    structure: { ...DEFAULT_PROPS.structure, ...(props.structure ?? {}) },
    mental: { ...DEFAULT_PROPS.mental, ...(props.mental ?? {}) },
    hint: props.hint ?? DEFAULT_PROPS.hint,
  }
  const { sectionLabel, waterlineLabel, surface, pattern, structure, mental, hint } = merged

  const { step, isLast, controls } = useStepReveal({ totalSteps: 4, mode: revealMode })

  return (
    <div>
      <div className="vz-section-label" style={{ marginBottom: 10, textAlign: 'center' }}>
        {sectionLabel}
      </div>

      <div className="vz-iceberg vz-stagger">
        {/* 水面より上：できごと */}
        <div className="vz-iceberg-layer top">
          <span className="label">{surface.label}</span>
          <span className="title">{surface.title}</span>
          <span className="body">{surface.body}</span>
        </div>

        {step >= 2 && (
          <>
            <div className="vz-iceberg-water-line">
              <span>{waterlineLabel}</span>
            </div>
            <div className="vz-iceberg-layer upper-mid">
              <span className="label">{pattern.label}</span>
              <span className="title">{pattern.title}</span>
              <span className="body">{pattern.body}</span>
            </div>
          </>
        )}

        {step >= 3 && (
          <div className="vz-iceberg-layer lower-mid">
            <span className="label">{structure.label}</span>
            <span className="title">{structure.title}</span>
            <span className="body">{structure.body}</span>
          </div>
        )}

        {step >= 4 && (
          <div className="vz-iceberg-layer bottom">
            <span className="label">{mental.label}</span>
            <span className="title">{mental.title}</span>
            <span className="body">{mental.body}</span>
          </div>
        )}
      </div>

      {controls}

      {isLast && hint && (
        <div
          style={{
            marginTop: 12,
            padding: '8px 10px',
            background: 'var(--brand-soft)',
            borderRadius: 8,
            fontSize: '0.7333rem',
            fontWeight: 600,
            color: 'var(--brand-on-soft, var(--brand))',
            textAlign: 'center',
          }}
        >
          {hint}
        </div>
      )}
    </div>
  )
}
