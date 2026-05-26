import './visuals-phase2-1.css'

/**
 * FalsePositiveGridDiagram — 偽陽性パラドックスを母集団ドット格子で可視化
 *
 * Phase 2-1 新規部品（2026-05-26）。numeracy「偽陽性のパラドックス / 精度99%」step に割当。
 * 想定 visualId: 'FalsePositiveGridDiagram'
 *
 * 構図:
 *   - totalDots 個のドット格子で母集団を表現
 *   - truePositives 個を「真陽性」（success）、falsePositives 個を「偽陽性」（warning）に色付け
 *   - 残りは「陰性」（中立グレー）
 *   - 下の集計バーで「陽性のうち本当に病気なのは何 % か」を示す
 *
 * design rationale:
 *   - 「健康な人の母数が圧倒的に多い → 少しの誤検出で偽陽性が真陽性を上回る」を
 *     真陽性(緑)と偽陽性(橙)の点数の差で一目で伝える
 *   - 緑(真陽性) vs 橙(偽陽性) の意味色は固定。warm accent は結論バーの 1 箇所のみ
 *   - 各色の意味は凡例テキストで担保（ドットは aria-hidden な装飾）
 *
 * Props（lesson データ側 `step.visualProps` で指定。default で典型例を描く）:
 *   sectionLabel?: string    — 上部の見出し
 *   totalDots?: number       — 格子全体のドット数（default 110 = 陽性者の縮図）
 *   truePositives?: number   — 真陽性の数（default 10）
 *   falsePositives?: number  — 偽陽性の数（default 100）
 *   hint?: string            — 結論ヒント（電球マーク付き、warm accent）
 *
 * 注: default は「陽性と判定された 110 人の内訳」を 1 ドット 1 人で描く縮図。
 *     truePositives + falsePositives ≦ totalDots を満たすこと（残りは陰性扱い）。
 */

export type FalsePositiveGridProps = {
  sectionLabel?: string
  totalDots?: number
  truePositives?: number
  falsePositives?: number
  hint?: string
  /** 真陽性凡例ラベル。{n} が人数に置換される。未指定なら ja */
  trueLabel?: string
  /** 偽陽性凡例ラベル。{n} が人数に置換される。未指定なら ja */
  falseLabel?: string
  /** 結論バーのラベル（「陽性のうち本当に病気なのは」相当）。未指定なら ja */
  resultLabel?: string
  /** 結果値の接頭辞（「約」相当）。未指定なら ja */
  approxPrefix?: string
}

const DEFAULTS = {
  sectionLabel: '「陽性」110 人の正体',
  totalDots: 110,
  truePositives: 10,
  falsePositives: 100,
  hint: '精度99%でも、病気がまれなら陽性の大半は健康な人（偽陽性）です',
  trueLabel: '真陽性（本当に病気）{n} 人',
  falseLabel: '偽陽性（実は健康）{n} 人',
  resultLabel: '陽性のうち本当に病気なのは',
  approxPrefix: '約',
}

type DotKind = 'true' | 'false' | 'negative'

export function FalsePositiveGridDiagram(props: FalsePositiveGridProps = {}) {
  const sectionLabel = props.sectionLabel ?? DEFAULTS.sectionLabel
  const totalDots = props.totalDots ?? DEFAULTS.totalDots
  const truePositives = props.truePositives ?? DEFAULTS.truePositives
  const falsePositives = props.falsePositives ?? DEFAULTS.falsePositives
  const hint = props.hint ?? DEFAULTS.hint
  const trueLabel = props.trueLabel ?? DEFAULTS.trueLabel
  const falseLabel = props.falseLabel ?? DEFAULTS.falseLabel
  const resultLabel = props.resultLabel ?? DEFAULTS.resultLabel
  const approxPrefix = props.approxPrefix ?? DEFAULTS.approxPrefix

  const tp = Math.max(0, Math.min(truePositives, totalDots))
  const fp = Math.max(0, Math.min(falsePositives, totalDots - tp))
  const negatives = Math.max(0, totalDots - tp - fp)
  const positives = tp + fp
  const ppv = positives > 0 ? Math.round((tp / positives) * 100) : 0

  // ラベル内の {n} を人数に展開し、強調する数値だけ <strong> でラップする
  const renderLabel = (template: string, n: number) => {
    const [head, tail = ''] = template.split('{n}')
    return (
      <>
        {head}
        <strong>{n}</strong>
        {tail}
      </>
    )
  }

  const dots: DotKind[] = [
    ...Array<DotKind>(tp).fill('true'),
    ...Array<DotKind>(fp).fill('false'),
    ...Array<DotKind>(negatives).fill('negative'),
  ]

  return (
    <div className="vz-stagger">
      <div className="vz-section-label" style={{ marginBottom: 10 }}>
        {sectionLabel}
      </div>

      <div className="vz-fpg-card">
        <div
          className="vz-fpg-grid"
          role="img"
          aria-label={`${resultLabel} ${approxPrefix} ${ppv}% (${trueLabel.replace('{n}', String(tp))} / ${falseLabel.replace('{n}', String(fp))})`}
        >
          {dots.map((kind, i) => (
            <span key={i} className={`vz-fpg-dot ${kind}`} aria-hidden="true" />
          ))}
        </div>

        <div className="vz-fpg-legend">
          <div className="vz-fpg-legend-item">
            <span className="vz-fpg-dot true" aria-hidden="true" />
            <span className="vz-fpg-legend-text">{renderLabel(trueLabel, tp)}</span>
          </div>
          <div className="vz-fpg-legend-item">
            <span className="vz-fpg-dot false" aria-hidden="true" />
            <span className="vz-fpg-legend-text">{renderLabel(falseLabel, fp)}</span>
          </div>
        </div>
      </div>

      <div className="vz-fpg-result">
        <span className="vz-fpg-result-label">{resultLabel}</span>
        <span className="vz-fpg-result-value">
          {approxPrefix} {ppv}%
        </span>
      </div>

      {hint ? (
        <div className="vz-acd-hint">
          <span className="vz-acd-hint-mark" aria-hidden="true">
            💡
          </span>
          <span>{hint}</span>
        </div>
      ) : null}
    </div>
  )
}
