import './visuals-docs.css'

/**
 * LayoutVisual — Z 配置 / F 配置 + 余白の図解
 * lesson-723 で利用
 *
 * 上段：Z 配置（プレゼンスライド）と F 配置（ドキュメント）の視線パスを矢印で図示
 * 下段：余白がない（cramped）と余白がある（airy）の対比
 */

export type LayoutVisualProps = {
  sectionLabel?: string
}

export function LayoutVisual({ sectionLabel = '視線を導くレイアウト' }: LayoutVisualProps = {}) {
  return (
    <div className="vz-stagger">
      <div className="vz-section-label" style={{ marginBottom: 10 }}>
        {sectionLabel}
      </div>

      <div className="vz-layout-wrap">
        {/* 視線パターン 2 種 */}
        <div className="vz-layout-row">
          {/* Z 配置 */}
          <div className="vz-layout-card">
            <span className="vz-layout-card-label">Slide</span>
            <span className="vz-layout-card-title">Z 配置</span>
            <div className="vz-layout-frame">
              <div className="vz-layout-frame-content">
                <div className="vz-layout-block" />
                <div className="vz-layout-block" />
                <div className="vz-layout-block dim" />
                <div className="vz-layout-block" />
              </div>
              <svg
                className="vz-layout-arrow"
                viewBox="0 0 100 56"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                {/* Z パス: 左上 → 右上 → 左下 → 右下 */}
                <polyline
                  points="14,14 86,14 14,44 86,44"
                  fill="none"
                />
                {/* 終点矢印 */}
                <polygon className="vz-layout-arrow-tip" points="86,44 79,40 79,48" />
              </svg>
            </div>
            <span className="vz-layout-card-note">
              左上 → 右上 → 左下 → 右下
              <br />
              結論は右下に
            </span>
          </div>

          {/* F 配置 */}
          <div className="vz-layout-card">
            <span className="vz-layout-card-label">Document</span>
            <span className="vz-layout-card-title">F 配置</span>
            <div className="vz-layout-frame">
              <div className="vz-layout-frame-content">
                <div className="vz-layout-block" />
                <div className="vz-layout-block" />
                <div className="vz-layout-block" />
                <div className="vz-layout-block dim" />
              </div>
              <svg
                className="vz-layout-arrow"
                viewBox="0 0 100 56"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                {/* F パス: 上 → 中段左 → 下に向かう */}
                <polyline points="14,14 86,14 14,28 60,28 14,44" fill="none" />
                <polygon className="vz-layout-arrow-tip" points="14,44 18,38 22,42" />
              </svg>
            </div>
            <span className="vz-layout-card-note">
              上 → 左 → 下に左偏り
              <br />
              重要情報は上と左へ
            </span>
          </div>
        </div>

        {/* 余白 */}
        <div className="vz-layout-space">
          <span className="vz-layout-space-title">余白は最強のデザイン要素</span>
          <div className="vz-layout-space-demos">
            <div className="vz-layout-space-demo cramped">
              <div className="vz-layout-space-frame cramped" aria-label="余白なし" />
              <span className="vz-layout-space-demo-label">✗ 詰め込み</span>
            </div>
            <div className="vz-layout-space-demo airy">
              <div className="vz-layout-space-frame airy" aria-label="余白十分" />
              <span className="vz-layout-space-demo-label">◯ 余白を残す</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
