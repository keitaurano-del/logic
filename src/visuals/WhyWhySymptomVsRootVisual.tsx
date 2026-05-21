import './visuals-whywhy.css'
import { BandageIcon, SearchIcon } from '../icons'

/**
 * 対症療法 vs 根本治療 — なぜなぜ分析の対立軸
 * lesson-340 step.visual='WhyWhySymptomVsRootDiagram'
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
        💡 「なぜ？」を重ねて根本原因まで降りる
      </div>
    </div>
  )
}
