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
 *
 * A 案 Phase 3 適用済 (2026-05-24, §3.1 §2.4 準拠):
 *   - inline hint 11→13, padding/lineHeight 拡大、warning token 化済
 *   - CSS: vz-ww-evidence-method-tag 11→12, method-text 13.5→14, layer 13→14
 *   - warm accent: vz-ww-evidence-arrow ↔ を terracotta
 *     (層と検証手段を結ぶ「裏付け」の動きを示す矢印 = 1 visual 内 1 箇所)
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
            marginTop: 14,
            padding: '10px 12px',
            background: 'var(--warning-soft)',
            borderRadius: 8,
            fontSize: '0.8667rem',
            fontWeight: 600,
            color: 'var(--warning)',
            textAlign: 'center',
            lineHeight: 1.45,
          }}
        >
          ⚠ 空欄の層は「仮説のまま」 — 打ち手の前に裏付けを取る
        </div>
      )}
    </div>
  )
}
