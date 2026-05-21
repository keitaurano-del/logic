import './visuals-phase3b.css'
import { StepStack } from './StepStack'

/**
 * Where → Why → How — 問題解決 3 段フロー
 * 起点（どこで起きてる？）→ 原因（なぜ？）→ 打ち手（どう解く？）
 * lesson-53 step.3 / lesson-95 step.0 等で利用
 *
 * 構造は <StepStack> 共通コンポーネントを使う。WWW 固有の差分（icon ピル + name + desc の
 * grid レイアウト、各 step の左 4px ボーダー色）は visuals-phase3b.css 側。
 */

export type WwwStep = {
  name: string
  desc: string
}

type Props = {
  sectionLabel?: string
  where?: WwwStep
  why?: WwwStep
  how?: WwwStep
  hint?: string
}

const defaultWhere: WwwStep = {
  name: 'Where：どこで起きている？',
  desc: '問題の所在を特定する。範囲・期間・対象を絞り込んで具体化。',
}

const defaultWhy: WwwStep = {
  name: 'Why：なぜ起きている？',
  desc: '原因を分解する。表面的な理由で止めず、構造まで掘り下げる。',
}

const defaultHow: WwwStep = {
  name: 'How：どう解決する？',
  desc: '打ち手を設計する。実行可能性とインパクトで優先順位をつける。',
}

function WwwCard({ variant, icon, step }: { variant: 'where' | 'why' | 'how'; icon: string; step: WwwStep }) {
  return (
    <div className={`vz-www-step ${variant}`}>
      <div className="vz-www-icon">{icon}</div>
      <div className="vz-www-body">
        <span className="vz-www-name">{step.name}</span>
        <span className="vz-www-desc">{step.desc}</span>
      </div>
    </div>
  )
}

export function WhereWhyHowVisual({
  sectionLabel = '問題解決の 3 段フロー',
  where = defaultWhere,
  why = defaultWhy,
  how = defaultHow,
  hint = '💡 Where を飛ばすと Why が広がりすぎ、Why を飛ばすと How が的外れになる',
}: Props) {
  return (
    <div className="vz-stagger">
      <div className="vz-section-label" style={{ marginBottom: 10 }}>
        {sectionLabel}
      </div>

      <StepStack
        containerClassName="vz-www"
        arrowClassName="vz-www-arrow"
        items={[
          <WwwCard key="where" variant="where" icon="Where" step={where} />,
          <WwwCard key="why" variant="why" icon="Why" step={why} />,
        ]}
        final={<WwwCard variant="how" icon="How" step={how} />}
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
