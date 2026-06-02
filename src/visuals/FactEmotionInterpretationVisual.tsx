import './visuals-listening.css'

/**
 * 構造化リスニング 3 層分解 — 事実 / 感情 / 解釈
 * lesson-730 系（listening コース）で利用想定
 * visualId: 'FactEmotionInterpretationDiagram'
 *
 * 「相手の発言」を 3 層に切り分けて聴く構造の可視化。
 *  - Fact (事実)        : 何が実際に起きたか
 *  - Emotion (感情)     : 相手が何を感じているか
 *  - Interpretation (解釈) : 相手がそれをどう意味づけているか
 *
 * 構図: 縦積みカード 3 段（モバイル可読性優先）。
 *   各段に「ラベル + タイトル + body」を縦に並べる。
 *   3 段目（解釈）に warm accent (terracotta) を 1 箇所だけ差す
 *   ＝「解釈は最も深い層・聴き手の判断が問われる箇所」を意味付け。
 *
 * Props で内容差し替え可能:
 *   sectionLabel? — 上部見出し
 *   fact?        — { title, body }
 *   emotion?     — { title, body }
 *   interpretation? — { title, body }
 *   hint?        — 末尾の💡 ヒント
 */

export type FeiLayer = {
  title: string
  body: string
}

export type FactEmotionInterpretationProps = {
  sectionLabel?: string
  fact?: FeiLayer
  emotion?: FeiLayer
  interpretation?: FeiLayer
  hint?: string
}

const DEFAULT_PROPS: Required<FactEmotionInterpretationProps> = {
  sectionLabel: '相手の発言を 3 層で聴く',
  fact: {
    title: '事実 — 何が起きたか',
    body: '時刻・場所・行動など、誰が見ても同じになる客観情報。',
  },
  emotion: {
    title: '感情 — 何を感じているか',
    body: '不安・怒り・喜びなど、相手の内側で動いている状態。',
  },
  interpretation: {
    title: '解釈 — どう意味づけているか',
    body: '相手がその事実と感情から導いている結論や信念。',
  },
  hint: '事実だけ受け取って終わると関係は深まらない。感情と解釈まで聴くと信頼が生まれる',
}

function FeiCard({
  variant,
  label,
  layer,
}: {
  variant: 'fact' | 'emotion' | 'interpretation'
  label: string
  layer: FeiLayer
}) {
  return (
    <div className={`vz-fei-layer ${variant}`}>
      <div className="vz-fei-label">{label}</div>
      <div className="vz-fei-title">{layer.title}</div>
      <div className="vz-fei-body">{layer.body}</div>
    </div>
  )
}

export function FactEmotionInterpretationVisual(props: FactEmotionInterpretationProps = {}) {
  const { sectionLabel, fact, emotion, interpretation, hint } = { ...DEFAULT_PROPS, ...props }

  return (
    <div className="vz-stagger">
      <div className="vz-section-label" style={{ marginBottom: 10 }}>
        {sectionLabel}
      </div>

      <div className="vz-fei">
        <FeiCard variant="fact" label="LAYER 1 / FACT" layer={fact} />
        <div className="vz-fei-arrow" aria-hidden>↓</div>
        <FeiCard variant="emotion" label="LAYER 2 / EMOTION" layer={emotion} />
        <div className="vz-fei-arrow" aria-hidden>↓</div>
        <FeiCard variant="interpretation" label="LAYER 3 / INTERPRETATION" layer={interpretation} />
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
            color: 'var(--brand-on-soft, var(--brand))',
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
