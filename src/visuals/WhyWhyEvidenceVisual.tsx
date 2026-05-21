import './visuals-whywhy.css'
import { useStepReveal } from './hooks/useStepReveal'

type EvidenceRow = {
  layer: string
  method: string
}

const rows: EvidenceRow[] = [
  { layer: '事象', method: 'KPI・ログ' },
  { layer: '直接原因', method: '行動データ' },
  { layer: '運用', method: '現場観察' },
  { layer: '仕組み', method: '規定・ヒアリング' },
  { layer: '構造', method: '過去経緯・比較' },
]

type Props = {
  /** 'interactive'（default）= ボタンで段階表示 / 'static' = 全部表示 */
  revealMode?: 'interactive' | 'static'
}

/**
 * なぜなぜ各層の裏付け — 層ごとに「事実の検証手段」を併記
 * lesson-345 step.visual='WhyWhyEvidenceDiagram'
 */
export function WhyWhyEvidenceVisual({ revealMode = 'interactive' }: Props = {}) {
  const { step, isLast, controls } = useStepReveal({ totalSteps: rows.length, mode: revealMode })

  return (
    <div className="vz-stagger">
      <div className="vz-section-label" style={{ marginBottom: 10 }}>
        各層に「事実の裏付け」を併記する
      </div>

      <div className="vz-ww-evidence">
        {rows.slice(0, step).map((r, i) => (
          <div key={i} className={`vz-ww-evidence-row t-${i + 1}`}>
            <div className="vz-ww-evidence-layer">{r.layer}</div>
            <div className="vz-ww-evidence-arrow">↔</div>
            <div className="vz-ww-evidence-method">
              <span className="vz-ww-evidence-method-tag">検証手段</span>
              <span className="vz-ww-evidence-method-text">{r.method}</span>
            </div>
          </div>
        ))}
      </div>

      {controls}

      {isLast && (
        <div
          style={{
            marginTop: 12,
            padding: '8px 10px',
            background: 'var(--warning-soft)',
            borderRadius: 8,
            fontSize: 11,
            fontWeight: 600,
            color: 'var(--warning)',
            textAlign: 'center',
          }}
        >
          ⚠ 空欄の層は「仮説のまま」 — 打ち手の前に裏付けを取る
        </div>
      )}
    </div>
  )
}
