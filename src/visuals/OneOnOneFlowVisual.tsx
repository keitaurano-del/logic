import './visuals-listening.css'

/**
 * 1on1 30 分テンプレ — 時系列ステップフロー
 * lesson-734 系（listening コース、マネジメント文脈）で利用想定
 * visualId: 'OneOnOneFlowDiagram'
 *
 * 構図: 横並びの時系列ステップ（モバイル幅では横スクロール許容）。
 *   各ステップ「所要時間バッジ + ステップ名 + やること」。
 *
 *   1. Open     (5 分)  : 場を開く・近況の共有
 *   2. Discover (10 分) : 状況・困りごとを聴く
 *   3. Decide   (10 分) : 次にとる行動を決める
 *   4. Close    (5 分)  : 合意と次回約束
 *
 * warm accent: Discover step の minutes バッジ (terracotta)
 *   ＝ 1on1 で「聴く時間」を最も厚く取る、というメッセージの強調。
 */

export type OneOnOneStage = {
  name: string
  minutes: string  // '5 分' などラベル
  body: string
}

export type OneOnOneFlowProps = {
  sectionLabel?: string
  stages?: OneOnOneStage[]
  hint?: string
}

const DEFAULT_PROPS: Required<OneOnOneFlowProps> = {
  sectionLabel: '1on1 30 分テンプレ — 4 ステップ',
  stages: [
    {
      name: 'Open',
      minutes: '5 分',
      body: '雑談で場を開く。話しやすい温度を作る。',
    },
    {
      name: 'Discover',
      minutes: '10 分',
      body: '今の状況・困りごとを聴く。解決を急がない。',
    },
    {
      name: 'Decide',
      minutes: '10 分',
      body: '次に試す一手を本人の言葉で決める。',
    },
    {
      name: 'Close',
      minutes: '5 分',
      body: '合意と次回の約束を残して終わる。',
    },
  ],
  hint: 'Discover を一番厚く取る。Decide は本人に決めさせる',
}

export function OneOnOneFlowVisual(props: OneOnOneFlowProps = {}) {
  const { sectionLabel, stages, hint } = { ...DEFAULT_PROPS, ...props }

  return (
    <div className="vz-stagger">
      <div className="vz-section-label" style={{ marginBottom: 10 }}>
        {sectionLabel}
      </div>

      <div className="vz-1on1-scroll">
        <div className="vz-1on1-track">
          {stages.map((s, i) => (
            <div key={i} className={`vz-1on1-stage${s.name === 'Discover' ? ' accent' : ''}`}>
              <div className="vz-1on1-head">
                <div className="vz-1on1-num">{i + 1}</div>
                <div className="vz-1on1-minutes">{s.minutes}</div>
              </div>
              <div className="vz-1on1-name">{s.name}</div>
              <div className="vz-1on1-body">{s.body}</div>
              {i < stages.length - 1 ? (
                <div className="vz-1on1-arrow" aria-hidden>→</div>
              ) : null}
            </div>
          ))}
        </div>
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
