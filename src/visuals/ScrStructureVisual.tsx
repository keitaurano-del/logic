import './visuals-phase3b.css'
import { StepStack } from './StepStack'

/**
 * SCR Structure — Situation / Complication / Resolution
 * 提案ストーリーの 3 段構造
 * lesson-74 step.0 等で利用
 *
 * 構造は <StepStack> 共通コンポーネントを使って組む。SCR 固有の差分（label/title/body
 * の文字スタイル、各 step の border-color、resolution の gradient 背景）は visuals.css / visuals-phase3b.css 側。
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

function ScrCard({ variant, prefix, step }: { variant: 'situation' | 'complication' | 'resolution'; prefix: string; step: ScrStep }) {
  return (
    <div className={`vz-scr-step ${variant}`}>
      <span className="vz-scr-label">{prefix} — {step.label}</span>
      <span className="vz-scr-title">{step.title}</span>
      <span className="vz-scr-body">{step.body}</span>
    </div>
  )
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

      <StepStack
        containerClassName="vz-scr"
        arrowClassName="vz-scr-arrow"
        items={[
          <ScrCard key="s" variant="situation" prefix="S" step={situation} />,
          <ScrCard key="c" variant="complication" prefix="C" step={complication} />,
        ]}
        final={<ScrCard variant="resolution" prefix="R" step={resolution} />}
      />

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
