import './visuals-whywhy.css'
import { BandageIcon, SearchIcon } from '../icons'

/**
 * 対症療法 vs 根本治療 — なぜなぜ分析の対立軸
 * lesson-340 step.visual='WhyWhySymptomVsRootDiagram'
 *
 * A 案 Phase 3 適用済 (2026-05-24, §3.1 §2.4 準拠):
 *   - inline hint 11→13, padding/lineHeight 拡大
 *   - CSS: sr-text strong 14px / sr-text span 13px / sr-result 13px は既に底上げ済
 *   - warm accent: hint ボックスを terracotta soft 背景に
 *     (bad/good の danger/success 意味色は §2.3 例外として維持)
 */
export function WhyWhySymptomVsRootVisual() {
  return (
    <div className="vz-stagger">
      <div className="vz-section-label" style={{ marginBottom: 10 }}>
        対症療法 vs 根本治療
      </div>

      <div className="vz-ww-sr">
        {/* 対症療法 */}
        <div className="vz-ww-sr-col">
          <span className="vz-ww-sr-tag vz-ww-sr-tag-bad">対症療法</span>
          <div className="vz-ww-sr-card bad">
            <BandageIcon className="vz-ww-sr-icon" width={22} height={22} />
            <div className="vz-ww-sr-text">
              <strong>症状を抑える</strong>
              <span>例：頭痛に鎮痛剤</span>
            </div>
          </div>
          <div className="vz-ww-sr-result bad">→ 何度も再発</div>
        </div>

        {/* 根本治療 */}
        <div className="vz-ww-sr-col">
          <span className="vz-ww-sr-tag vz-ww-sr-tag-good">根本治療</span>
          <div className="vz-ww-sr-card good">
            <SearchIcon className="vz-ww-sr-icon" width={22} height={22} />
            <div className="vz-ww-sr-text">
              <strong>原因を取り除く</strong>
              <span>例：睡眠不足を改善</span>
            </div>
          </div>
          <div className="vz-ww-sr-result good">→ 再発を防ぐ</div>
        </div>
      </div>

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
        💡 「なぜ？」を重ねて根本原因まで降りる
      </div>
    </div>
  )
}
