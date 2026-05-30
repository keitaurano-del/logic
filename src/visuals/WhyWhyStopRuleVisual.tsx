import './visuals-whywhy.css'
import { XIcon, CheckIcon, LightbulbIcon } from '../icons'

/**
 * なぜなぜの止めどき — 浅すぎ / 適切 / 深すぎ
 * lesson-342 step.visual='WhyWhyStopRuleDiagram'
 *
 * A 案 Phase 3 適用済 (2026-05-24, §3.1 §2.4 準拠):
 *   - inline hint 11→13, padding/lineHeight 拡大
 *   - CSS: stop-tag/result 12px、stop-ex 13px、stop-label 14px は既に底上げ済
 *   - warm accent: hint ボックスを terracotta soft 背景に
 *     (3 ゾーンの danger/success/warning 意味色は §2.3 例外として維持)
 */
export function WhyWhyStopRuleVisual() {
  return (
    <div className="vz-stagger">
      <div className="vz-section-label" style={{ marginBottom: 10 }}>
        どこで止めるか
      </div>

      <div className="vz-ww-stop">
        {/* 浅すぎ */}
        <div className="vz-ww-stop-zone bad">
          <div className="vz-ww-stop-tag">
            <XIcon width={14} height={14} />
            <span>浅すぎ</span>
          </div>
          <div className="vz-ww-stop-body">
            <span className="vz-ww-stop-label">人で止める</span>
            <span className="vz-ww-stop-ex">「Aさんがミスした」</span>
            <span className="vz-ww-stop-result">再発する</span>
          </div>
        </div>

        {/* 適切 */}
        <div className="vz-ww-stop-zone ok">
          <div className="vz-ww-stop-tag">
            <CheckIcon width={14} height={14} />
            <span>適切</span>
          </div>
          <div className="vz-ww-stop-body">
            <span className="vz-ww-stop-label">仕組みで止める</span>
            <span className="vz-ww-stop-ex">「気づける仕組みがない」</span>
            <span className="vz-ww-stop-result">打ち手が打てる</span>
          </div>
        </div>

        {/* 深すぎ */}
        <div className="vz-ww-stop-zone deep">
          <div className="vz-ww-stop-tag">
            <LightbulbIcon width={14} height={14} />
            <span>深すぎ</span>
          </div>
          <div className="vz-ww-stop-body">
            <span className="vz-ww-stop-label">外部要因で止める</span>
            <span className="vz-ww-stop-ex">「景気・人口減少」</span>
            <span className="vz-ww-stop-result">手が出せない</span>
          </div>
        </div>
      </div>

      <div
        style={{
          marginTop: 14,
          padding: '10px 12px',
          background: 'var(--visual-warm-primary-soft)',
          borderRadius: 8,
          fontSize: '0.8667rem',
          fontWeight: 600,
          color: 'var(--visual-warm-primary-deep)',
          textAlign: 'center',
          lineHeight: 1.45,
        }}
      >
        💡 「自分たちで打ち手が打てる層」で止める
      </div>
    </div>
  )
}
