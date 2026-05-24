import './visuals-docs.css'

/**
 * ColorPaletteVisual — 70:25:5 配色ルール + テーマ見本
 * lesson-725 で利用
 *
 * 1) 70:25:5 の比率を横帯で表現（ベース / メイン / アクセント）
 * 2) 各役割の % と説明
 * 3) 4 種類のテーマパレット見本（ブランド色違いで配色例を表示）
 *
 * A 案 Phase 3 適用済 (2026-05-24, §3.1 §2.4 準拠):
 *   - CSS: palette-rule-title 12px 維持、bar-seg 11→12, legend-label 10→12,
 *     legend-role 11→13, theme-name 11→13, theme-tone 9→12, bar-seg.accent 10→12
 *   - warm accent: palette-bar-seg.accent を terracotta に
 *     (5% accent = 「最重要箇所のみ」の示唆色、配色教材の主役 = 1 visual 内 1 箇所)
 */

type Theme = {
  name: string
  tone: string
  /** 5 段 swatches: base, base-soft, main, main-deep, accent */
  colors: [string, string, string, string, string]
}

export type ColorPaletteVisualProps = {
  sectionLabel?: string
  themes?: Theme[]
}

const DEFAULT_THEMES: Theme[] = [
  {
    name: 'Corporate Navy',
    tone: '誠実 / 信頼',
    colors: ['#FFFFFF', '#F3F4F6', '#1E3A8A', '#0F172A', '#DC2626'],
  },
  {
    name: 'Soft Sage',
    tone: '穏やか / 自然',
    colors: ['#FFFFFF', '#F0F4EE', '#4A7C59', '#1F3D2A', '#D97706'],
  },
  {
    name: 'Coral Modern',
    tone: 'モダン / 軽快',
    colors: ['#FFFFFF', '#FAF5F1', '#475569', '#1E293B', '#F97316'],
  },
  {
    name: 'Mono Sharp',
    tone: 'クール / 高級',
    colors: ['#FFFFFF', '#F4F4F5', '#27272A', '#09090B', '#FACC15'],
  },
]

export function ColorPaletteVisual({
  sectionLabel = '配色 70 : 25 : 5 ルール',
  themes = DEFAULT_THEMES,
}: ColorPaletteVisualProps = {}) {
  return (
    <div className="vz-stagger">
      <div className="vz-section-label" style={{ marginBottom: 10 }}>
        {sectionLabel}
      </div>

      <div className="vz-palette-wrap">
        {/* 70:25:5 ルール */}
        <div className="vz-palette-rule">
          <div className="vz-palette-rule-title">面積比 — 70 : 25 : 5</div>

          <div className="vz-palette-bar" role="img" aria-label="70% ベース、25% メイン、5% アクセント">
            <span className="vz-palette-bar-seg base">70%</span>
            <span className="vz-palette-bar-seg main">25%</span>
            <span className="vz-palette-bar-seg accent">5%</span>
          </div>

          <div className="vz-palette-legend">
            <div className="vz-palette-legend-item">
              <span className="vz-palette-legend-label">Base</span>
              <span className="vz-palette-legend-pct">70%</span>
              <span className="vz-palette-legend-role">背景 / 大面積</span>
            </div>
            <div className="vz-palette-legend-item">
              <span className="vz-palette-legend-label">Main</span>
              <span className="vz-palette-legend-pct">25%</span>
              <span className="vz-palette-legend-role">見出し / 主要要素</span>
            </div>
            <div className="vz-palette-legend-item">
              <span className="vz-palette-legend-label">Accent</span>
              <span className="vz-palette-legend-pct">5%</span>
              <span className="vz-palette-legend-role">最重要箇所のみ</span>
            </div>
          </div>
        </div>

        {/* テーマパレット見本 */}
        <div className="vz-palette-themes">
          {themes.map((t, i) => (
            <div className="vz-palette-theme" key={i}>
              <div className="vz-palette-theme-name">{t.name}</div>
              <div className="vz-palette-theme-tone">{t.tone}</div>
              <div className="vz-palette-swatches">
                {t.colors.map((c, j) => (
                  <div
                    key={j}
                    className="vz-palette-swatch"
                    style={{ background: c }}
                    aria-hidden="true"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
