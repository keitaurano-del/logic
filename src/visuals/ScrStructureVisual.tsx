import './visuals-phase3b.css'

/**
 * SCR Structure — Situation / Complication / Resolution
 * 提案ストーリーの 3 段構造
 * lesson-74 step.0 等で利用
 */

export type ScrStep = {
  label: string
  title: string
  body: string
}

type Props = {
  sectionLabel?: string
  situation?: ScrStep
  complication?: ScrStep
  resolution?: ScrStep
  hint?: string
}

const defaultSituation: ScrStep = {
  label: 'Situation',
  title: '前提となる状況',
  body: '相手が同意できる現状認識。事実とデータで合意点を作る。',
}

const defaultComplication: ScrStep = {
  label: 'Complication',
  title: '問題・障害',
  body: 'そのまま放置すると困ることや、新たに生じた変化。緊張感を提示。',
}

const defaultResolution: ScrStep = {
  label: 'Resolution',
  title: '提案する答え',
  body: '相手の疑問に対する明確な解。次のアクションへつなぐ。',
}

export function ScrStructureVisual({
  sectionLabel = 'SCR ストーリー構造',
  situation = defaultSituation,
  complication = defaultComplication,
  resolution = defaultResolution,
  hint = '💡 相手の頭の中に「で、どうすればいい？」を作ってから答える',
}: Props) {
  return (
    <div className="vz-stagger">
      <div className="vz-section-label" style={{ marginBottom: 10 }}>
        {sectionLabel}
      </div>

      <div className="vz-scr">
        <div className="vz-scr-step situation">
          <span className="vz-scr-label">S — {situation.label}</span>
          <span className="vz-scr-title">{situation.title}</span>
          <span className="vz-scr-body">{situation.body}</span>
        </div>
        <span className="vz-scr-arrow">↓</span>
        <div className="vz-scr-step complication">
          <span className="vz-scr-label">C — {complication.label}</span>
          <span className="vz-scr-title">{complication.title}</span>
          <span className="vz-scr-body">{complication.body}</span>
        </div>
        <span className="vz-scr-arrow">↓</span>
        <div className="vz-scr-step resolution">
          <span className="vz-scr-label">R — {resolution.label}</span>
          <span className="vz-scr-title">{resolution.title}</span>
          <span className="vz-scr-body">{resolution.body}</span>
        </div>
      </div>

      <div
        style={{
          marginTop: 12,
          padding: '8px 10px',
          background: 'var(--brand-soft)',
          borderRadius: 8,
          fontSize: 11,
          fontWeight: 600,
          color: 'var(--brand)',
          textAlign: 'center',
        }}
      >
        {hint}
      </div>
    </div>
  )
}
