import { useStepReveal } from './hooks/useStepReveal'

export type PyramidConclusion = {
  /** ラベル（例: 「結論」） */
  label?: string
  /** 本文（例: 「今期は新規獲得に集中」） */
  body: string
}

export type PyramidClaim = {
  label?: string
  body: string
}

type Props = {
  /** 'interactive'（default）= step ボタンで段階開示 / 'static' = 最初から全層表示 */
  revealMode?: 'interactive' | 'static'
  /**
   * 頂点（結論層）。未指定なら default の「今期は新規獲得に集中」を表示
   */
  conclusion?: PyramidConclusion
  /**
   * 2 段目（主張層、3 つ固定）。未指定なら default の主張 3 つを表示
   */
  claims?: [PyramidClaim, PyramidClaim, PyramidClaim]
  /**
   * 3 段目（根拠層）。主張 3 つに対応する 2 個ずつのカード（合計 6 枚）。
   * 未指定なら default の根拠ペアを表示
   */
  evidence?: [[string, string], [string, string], [string, string]]
  /** 下部ヒント文。null で非表示、未指定で default の Why So?/So What? を表示 */
  hint?: string | null
}

const DEFAULT_CONCLUSION: Required<PyramidConclusion> = {
  label: '結論',
  body: '今期は新規獲得に集中',
}

const DEFAULT_CLAIMS: [Required<PyramidClaim>, Required<PyramidClaim>, Required<PyramidClaim>] = [
  { label: '主張 1', body: 'LTV は飽和' },
  { label: '主張 2', body: 'CAC が下がっている' },
  { label: '主張 3', body: '市場が拡大中' },
]

const DEFAULT_EVIDENCE: [[string, string], [string, string], [string, string]] = [
  ['ARPU 3年横ばい', '解約率 5%安定'],
  ['CAC −30% YoY', '広告枠が割安'],
  ['業界 +15% YoY', '自社シェア 8%'],
]

const DEFAULT_HINT = '↓ Why So?（下に降りる） / ↑ So What?（上に上る）'

/**
 * ピラミッド原則 — 結論→主張→根拠の3層構造
 * lesson-23 step.visual='PyramidDiagram'（default）
 *
 * Props を渡せば multi-lesson 共有可能:
 *   conclusion: { label, body }
 *   claims:     [{label, body} × 3]
 *   evidence:   [[ev1a, ev1b], [ev2a, ev2b], [ev3a, ev3b]]
 *   hint:       string | null
 *
 * 未指定フィールドは default 値（営業戦略の例）が使われ、後方互換が保たれる。
 *
 * 3 段階で開示:
 *   Step 1 — 結論
 *   Step 2 — 結論 + 主張 3 つ
 *   Step 3 — 全層（結論 + 主張 + 根拠）
 *
 * 2026-05-21 — スマホ全画面最適化プロトタイプ。
 *   - VisualSlide 側で fullBleed=true により外側 padding を打ち消し、画面端まで利用
 *   - 各カードを大きく（min-height 80-110px、本文 17-18px、ラベル 14-15px）
 *   - 段階開示は維持。`revealMode='static'` で全層表示モードも後方互換
 */
export function PyramidVisual({
  revealMode = 'interactive',
  conclusion,
  claims,
  evidence,
  hint,
}: Props = {}) {
  const { step, controls } = useStepReveal({ totalSteps: 3, mode: revealMode })

  const c = { ...DEFAULT_CONCLUSION, ...(conclusion ?? {}) }
  const cl = claims ?? DEFAULT_CLAIMS
  const ev = evidence ?? DEFAULT_EVIDENCE
  const hintText = hint === undefined ? DEFAULT_HINT : hint

  // LessonStoriesScreen の swipe / tap-zone への伝播を全部止める。
  // 段階開示中の「戻る」ボタンが親スクリーンの前スライドに遷移してしまう問題を防ぐ。
  const stop = (e: React.SyntheticEvent) => e.stopPropagation()

  return (
    <div
      className="vz-pyramid vz-pyramid-fb vz-stagger"
      onTouchStart={stop}
      onTouchMove={stop}
      onTouchEnd={stop}
      onPointerDown={stop}
    >
      {/* 頂点：結論 (step >= 1) */}
      <div className="vz-pyramid-row r1">
        <div className="vz-pyramid-cell top">
          {c.label ? <span className="vz-pyramid-cell-label">{c.label}</span> : null}
          <span className="vz-pyramid-cell-body">{c.body}</span>
        </div>
      </div>

      {/* 主張 3 つ (step >= 2) */}
      {step >= 2 && (
        <div className="vz-pyramid-row r2">
          {cl.map((claim, i) => (
            <div key={i} className="vz-pyramid-cell mid">
              {claim.label ? <span className="vz-pyramid-cell-label">{claim.label}</span> : null}
              <span className="vz-pyramid-cell-body">{claim.body}</span>
            </div>
          ))}
        </div>
      )}

      {/* 根拠 (step >= 3) */}
      {step >= 3 && (
        <div className="vz-pyramid-row r3">
          {ev.map((pair, i) => (
            <div key={i} className="vz-pyramid-bottom-col">
              <div className="vz-pyramid-cell bottom">{pair[0]}</div>
              <div className="vz-pyramid-cell bottom">{pair[1]}</div>
            </div>
          ))}
        </div>
      )}

      {controls}

      {hintText ? <div className="vz-pyramid-hint">{hintText}</div> : null}
    </div>
  )
}
