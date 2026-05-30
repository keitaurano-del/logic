import './visuals-listening.css'

/**
 * SPIN ヒアリング — Situation / Problem / Implication / Need-payoff
 * lesson-732 系（listening コース、ヒアリングセールス）で利用想定
 * visualId: 'SPINStructureDiagram'
 *
 * 構図: 4 ステップ funnel（上が広く下に絞り込む）。
 *   各ステップは「番号バッジ + 英語名 + 日本語タイトル + body」。
 *
 *   S — Situation       : 状況質問（事実確認）
 *   P — Problem         : 問題質問（課題の特定）
 *   I — Implication     : 示唆質問（課題の波及）
 *   N — Need-payoff     : 解決質問（解決の価値）
 *
 * warm accent: 最終 step「Need-payoff」の左 4px ボーダー (terracotta)
 *   ＝「価値を相手に語らせる」最重要 step を強調。
 */

export type SpinStep = {
  letter: string   // 'S' | 'P' | 'I' | 'N'
  name: string     // 'Situation' 等
  title: string    // '状況質問'
  body: string     // 説明文
}

export type SPINStructureProps = {
  sectionLabel?: string
  steps?: [SpinStep, SpinStep, SpinStep, SpinStep]
  hint?: string
}

const DEFAULT_PROPS: Required<SPINStructureProps> = {
  sectionLabel: 'SPIN ヒアリング — 4 段階で深掘る',
  steps: [
    {
      letter: 'S',
      name: 'Situation',
      title: '状況質問 — 事実をそろえる',
      body: '相手の現状・体制・使っているものを確認する。会話の地ならし。',
    },
    {
      letter: 'P',
      name: 'Problem',
      title: '問題質問 — 課題を特定する',
      body: '困りごと・不便・うまくいっていない点を言語化してもらう。',
    },
    {
      letter: 'I',
      name: 'Implication',
      title: '示唆質問 — 波及を広げる',
      body: 'その課題を放っておくと何が起きるか、影響範囲を一緒に確認する。',
    },
    {
      letter: 'N',
      name: 'Need-payoff',
      title: '解決質問 — 価値を語らせる',
      body: '解決したら何が変わるかを相手の言葉で引き出す。意思決定の燃料。',
    },
  ],
  hint: 'S → P → I → N の順を守る。いきなり解決質問に飛ぶと押し売りになる',
}

export function SPINStructureVisual(props: SPINStructureProps = {}) {
  const { sectionLabel, steps, hint } = { ...DEFAULT_PROPS, ...props }

  return (
    <div className="vz-stagger">
      <div className="vz-section-label" style={{ marginBottom: 10 }}>
        {sectionLabel}
      </div>

      <div className="vz-spin">
        {steps.map((s, i) => (
          <div
            key={i}
            className={`vz-spin-step${i === steps.length - 1 ? ' final' : ''}`}
            style={{ width: `${100 - i * 6}%` }}
          >
            <div className="vz-spin-letter">{s.letter}</div>
            <div className="vz-spin-body">
              <div className="vz-spin-name">{s.name}</div>
              <div className="vz-spin-title">{s.title}</div>
              <div className="vz-spin-desc">{s.body}</div>
            </div>
          </div>
        ))}
      </div>

      {hint ? (
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
