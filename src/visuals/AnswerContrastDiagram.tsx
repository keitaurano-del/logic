import './visuals-phase2-1.css'

/**
 * AnswerContrastDiagram — 良い例 / 悪い例（良い回答 / 悪い回答・Before / After）の 2 カラム汎用対比
 *
 * Phase 2-1 新規部品（2026-05-26）。career / proposal / designThinking 等を横断して
 * 「悪い回答 vs 良い回答」「Before vs After」が明確な text-heavy step の対比を 1 枚に集約する。
 * 想定 visualId: 'AnswerContrastDiagram'
 *
 * 構図:
 *   左カラム = bad（警告系トーン rose + × バッジ）／右カラム = good（success + ✓ バッジ）
 *   各カラムは title（ラベル）+ items の箇条書き。
 *   good / bad の意味色は固定（§2.3 例外）。アクセント温度感色は hint 1 箇所のみ。
 *
 * design rationale:
 *   - 「悪い→良い」は左から右へ読む自然な流れ。視線誘導で右（good）を到達点に置く
 *   - ✓ / × バッジは aria-hidden、意味は「良い例 / 悪い例」のテキストラベルで担保（TTS / SR 対策）
 *   - 各 item は対の長さがバラついても破綻しないよう align は flex-start
 *
 * Props（lesson データ側 `step.visualProps` で指定。未指定なら default）:
 *   sectionLabel?: string         — 上部の見出し
 *   bad:  { title: string; items: string[] }  — 悪い例カラム
 *   good: { title: string; items: string[] }  — 良い例カラム
 *   hint?: string                 — 結論ヒント（電球マーク付き、warm accent）
 *
 * 未指定フィールドは default 値（汎用の回答対比サンプル）が使われ、後方互換が保たれる。
 */

export type AnswerContrastColumn = {
  title: string
  items: string[]
}

export type AnswerContrastProps = {
  sectionLabel?: string
  bad?: AnswerContrastColumn
  good?: AnswerContrastColumn
  hint?: string
}

const DEFAULT_PROPS: Required<AnswerContrastProps> = {
  sectionLabel: '悪い回答と良い回答',
  bad: {
    title: '悪い例',
    items: [
      '事実をそのまま並べただけで主張がない',
      '「〜について」で終わり、結論が見えない',
      '相手の「で、何が言いたいの？」を残す',
    ],
  },
  good: {
    title: '良い例',
    items: [
      '一文で主張を言い切っている',
      '具体的な数字や根拠とセットで語る',
      '読む前から結論が伝わる',
    ],
  },
  hint: '同じ事実でも、フレームの置き方で印象が決まります',
}

export function AnswerContrastDiagram(props: AnswerContrastProps = {}) {
  const merged = {
    sectionLabel: props.sectionLabel ?? DEFAULT_PROPS.sectionLabel,
    bad: { ...DEFAULT_PROPS.bad, ...(props.bad ?? {}) },
    good: { ...DEFAULT_PROPS.good, ...(props.good ?? {}) },
    hint: props.hint ?? DEFAULT_PROPS.hint,
  }
  const { sectionLabel, bad, good, hint } = merged

  return (
    <div className="vz-stagger">
      <div className="vz-section-label" style={{ marginBottom: 10 }}>
        {sectionLabel}
      </div>

      <div className="vz-acd-wrap">
        {/* BAD（左） */}
        <div className="vz-acd-col bad">
          <div className="vz-acd-head">
            <span className="vz-acd-badge bad" aria-hidden="true">
              ×
            </span>
            <span className="vz-acd-title">{bad.title}</span>
          </div>
          <ul className="vz-acd-items">
            {bad.items.map((it, i) => (
              <li className="vz-acd-item" key={i}>
                <span className="vz-acd-mark bad" aria-hidden="true">
                  ×
                </span>
                <span>{it}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 矢印（悪い → 良い） */}
        <div className="vz-acd-arrow" aria-hidden="true">
          →
        </div>

        {/* GOOD（右） */}
        <div className="vz-acd-col good">
          <div className="vz-acd-head">
            <span className="vz-acd-badge good" aria-hidden="true">
              ✓
            </span>
            <span className="vz-acd-title">{good.title}</span>
          </div>
          <ul className="vz-acd-items">
            {good.items.map((it, i) => (
              <li className="vz-acd-item" key={i}>
                <span className="vz-acd-mark good" aria-hidden="true">
                  ✓
                </span>
                <span>{it}</span>
              </li>
            ))}
          </ul>
        </div>
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
