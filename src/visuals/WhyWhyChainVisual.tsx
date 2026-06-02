import './visuals-whywhy.css'
import { useStepReveal } from './hooks/useStepReveal'

type Layer = {
  n: number
  label: string
  tag: string
  tone: 'shallow' | 'mid' | 'deep'
}

const layers: Layer[] = [
  { n: 1, label: '事象の言い換え', tag: '表層', tone: 'shallow' },
  { n: 2, label: '直接の症状', tag: '表層', tone: 'shallow' },
  { n: 3, label: '直接の原因', tag: '中層', tone: 'mid' },
  { n: 4, label: '仕組みの問題', tag: '構造', tone: 'deep' },
  { n: 5, label: '打ち手が打てる層', tag: '構造', tone: 'deep' },
]

type Props = {
  /** 'interactive'（default）= ボタンで段階表示 / 'static' = 全部表示 */
  revealMode?: 'interactive' | 'static'
}

/**
 * なぜを5回 — 各層で何に届くか
 * lesson-340 step.visual='WhyWhyChainDiagram'
 *
 * A 案 Phase 2 適用済 (2026-05-24, §3.1 §2.4 準拠):
 *   - inline hint 11→13, padding/lineHeight 拡大
 *   - vz-ww-chain-tag 11→12, label 14 維持
 *   - warm accent: 最深層 deep の最後 (Why 5 = 打ち手が打てる構造) の左ボーダーを terracotta
 *     （他 deep 行は brand-hover、最後の 1 行だけ暖色 = 1 visual 内 1 箇所）
 *
 * 5 段階で開示:
 *   Step 1..5 — Why 1, 2, 3, 4, 5 を 1 段ずつ追加
 */
export function WhyWhyChainVisual({ revealMode = 'interactive' }: Props = {}) {
  const { step, isLast, controls } = useStepReveal({ totalSteps: layers.length, mode: revealMode })

  return (
    <div className="vz-stagger">
      <div className="vz-section-label" style={{ marginBottom: 10 }}>
        「なぜ」を5回 — 各層で何に届くか
      </div>

      <div className="vz-ww-chain">
        {layers.map((l, i) =>
          i < step ? (
            <div key={l.n} className={`vz-ww-chain-row ${l.tone}`}>
              <div className="vz-ww-chain-num">Why {l.n}</div>
              <div className="vz-ww-chain-bar" />
              <div className="vz-ww-chain-body">
                <span className="vz-ww-chain-tag">{l.tag}</span>
                <span className="vz-ww-chain-label">{l.label}</span>
              </div>
            </div>
          ) : null
        )}
      </div>

      {controls}

      {isLast && (
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
          💡 3回前後で「直接原因」、5回前後で「打ち手が打てる構造」に届く
        </div>
      )}
    </div>
  )
}
