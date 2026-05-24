import './visuals-docs.css'

/**
 * TypographyVisual — フォント階層 + コントラスト + 行間
 * lesson-724 で利用
 *
 * 1) 階層（H1 / H2 / H3 / Body）を実際のサイズで縦並びに見せる
 * 2) コントラスト OK / NG の対比
 * 3) 行間 1.6 倍 / 1.0 倍の対比
 *
 * A 案 Phase 3 適用済 (2026-05-24, §3.1 §2.4 準拠):
 *   - CSS: typo-section-title 12 維持、typo-tag 10→12、typo-size 10→12、
 *     typo-card-title 11→12、typo-contrast-block 11→13、typo-contrast-mark 11→13、
 *     typo-leading-block 10→13、typo-leading-label 9→12
 *   - h1/h2/h3/body サンプル文字は「実サイズ表示」が教材主旨なので維持
 *   - warm accent: typo-section-title を terracotta deep に
 *     (「ジャンプ率」= タイポ階層の主役 = 1 visual 内 1 箇所、good/bad の success/rose は §2.3 維持)
 */

export type TypographyVisualProps = {
  sectionLabel?: string
}

export function TypographyVisual({
  sectionLabel = 'タイポグラフィの 3 要素',
}: TypographyVisualProps = {}) {
  return (
    <div className="vz-stagger">
      <div className="vz-section-label" style={{ marginBottom: 10 }}>
        {sectionLabel}
      </div>

      <div className="vz-typo-wrap">
        {/* 階層 */}
        <div className="vz-typo-hierarchy">
          <div className="vz-typo-section-title">サイズ階層 — ジャンプ率</div>

          <div className="vz-typo-row h1">
            <span className="vz-typo-tag">タイトル</span>
            <span className="vz-typo-sample">構造が9割</span>
            <span className="vz-typo-size">40pt</span>
          </div>
          <div className="vz-typo-row h2">
            <span className="vz-typo-tag">見出し</span>
            <span className="vz-typo-sample">構成設計</span>
            <span className="vz-typo-size">28pt</span>
          </div>
          <div className="vz-typo-row h3">
            <span className="vz-typo-tag">小見出し</span>
            <span className="vz-typo-sample">読み手と目的</span>
            <span className="vz-typo-size">20pt</span>
          </div>
          <div className="vz-typo-row body">
            <span className="vz-typo-tag">本文</span>
            <span className="vz-typo-sample">良い資料は構成で決まる</span>
            <span className="vz-typo-size">14pt</span>
          </div>
        </div>

        {/* コントラスト + 行間 */}
        <div className="vz-typo-extras">
          {/* コントラスト */}
          <div className="vz-typo-card">
            <div className="vz-typo-card-title">コントラスト比</div>
            <div className="vz-typo-contrast-row">
              <div className="vz-typo-contrast-block ok">
                <span>本文サンプル</span>
                <span className="vz-typo-contrast-mark">◯ 4.5:1</span>
              </div>
              <div className="vz-typo-contrast-block ng">
                <span>本文サンプル</span>
                <span className="vz-typo-contrast-mark">✗ 1.6:1</span>
              </div>
            </div>
          </div>

          {/* 行間 */}
          <div className="vz-typo-card">
            <div className="vz-typo-card-title">行間 (line-height)</div>
            <div className="vz-typo-leading-block good">
              <span className="vz-typo-leading-label">◯ 1.6 倍</span>
              <div className="vz-typo-leading-text">
                良い資料は構成で決まる。
                <br />
                読みやすさの土台
              </div>
            </div>
            <div className="vz-typo-leading-block bad">
              <span className="vz-typo-leading-label">✗ 1.0 倍</span>
              <div className="vz-typo-leading-text">
                良い資料は構成で決まる。
                <br />
                読みやすさの土台
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
