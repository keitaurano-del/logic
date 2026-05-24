import './visuals-whywhy.css'
import { useStepReveal } from './hooks/useStepReveal'

type ToyotaLayer = {
  q: string
  a: string
  isRoot?: boolean
}

const layers: ToyotaLayer[] = [
  { q: 'なぜ機械が止まった？', a: 'ヒューズが切れた' },
  { q: 'なぜヒューズが？', a: '過負荷がかかった' },
  { q: 'なぜ過負荷が？', a: 'ベアリング潤滑が不足' },
  { q: 'なぜ潤滑が？', a: 'ポンプ汲み上げ不足' },
  { q: 'なぜ汲み上げ不足？', a: 'ポンプ軸が摩耗' },
  { q: 'なぜ摩耗した？', a: 'ストレーナ未装着で金属粉混入', isRoot: true },
]

type Props = {
  /** 'interactive'（default）= ボタンで段階表示 / 'static' = 全部表示 */
  revealMode?: 'interactive' | 'static'
}

/**
 * トヨタ古典事例 — 「機械が止まった」5回 Why
 * lesson-341 step.visual='WhyWhyToyotaDiagram'
 *
 * A 案 Phase 2 適用済 (2026-05-24, §3.1 §2.4 準拠):
 *   - inline hint 11→13, padding/lineHeight 拡大、warm accent としても兼用
 *   - CSS 側 q / arrow / a は既に新基準内 (13/14/13)
 *   - warm accent: hint ボックスを terracotta soft 背景 + deep 文字に
 *     （root 行の brand-cta は維持 = 1 visual 内 1 箇所 = §2.4）
 *
 * 6 段階で開示（質問 1 つ = 1 ステップ）
 */
export function WhyWhyToyotaVisual({ revealMode = 'interactive' }: Props = {}) {
  const { step, isLast, controls } = useStepReveal({ totalSteps: layers.length, mode: revealMode })

  return (
    <div className="vz-stagger">
      <div className="vz-section-label" style={{ marginBottom: 10 }}>
        古典事例「機械が止まった」
      </div>

      <div className="vz-ww-toyota">
        {layers.map((l, i) =>
          i < step ? (
            <div key={i} className={`vz-ww-toyota-row ${l.isRoot ? 'root' : ''}`}>
              <div className="vz-ww-toyota-q">{l.q}</div>
              <div className="vz-ww-toyota-arrow">→</div>
              <div className="vz-ww-toyota-a">{l.a}</div>
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
            background: 'var(--visual-warm-primary-soft)',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--visual-warm-primary-deep)',
            textAlign: 'center',
            lineHeight: 1.45,
          }}
        >
          💡 真の対策は「ストレーナを取り付ける」（ヒューズ交換では再発する）
        </div>
      )}
    </div>
  )
}
