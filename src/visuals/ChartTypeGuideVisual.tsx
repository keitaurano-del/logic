import './visuals-docs.css'

/**
 * ChartTypeGuideVisual — チャート 4 種の使い分けガイド
 * lesson-726 で利用
 *
 * 2x2 グリッドで「棒 / 折れ線 / 円 / 散布図」を並べ、それぞれ用途のラベルと
 * シンプルな SVG サンプルを描画する。チャート選びの判断軸を直感化する。
 *
 * A 案 Phase 2 適用済 (2026-05-24, §3.1 §2.4 準拠):
 *   - vz-chart-card-name 13→14, vz-chart-card-use 10→12, vz-chart-card-body 11→13
 *   - warm accent: vz-chart-card-use (用途ラベル = チャート選びの起点) を terracotta
 *     （4 ラベルすべて同色だが意味的に「用途」という 1 カテゴリ = 1 visual 内 1 軸）
 */

export type ChartTypeGuideVisualProps = {
  sectionLabel?: string
}

export function ChartTypeGuideVisual({
  sectionLabel = '4 種類のチャートの使い分け',
}: ChartTypeGuideVisualProps = {}) {
  return (
    <div className="vz-stagger">
      <div className="vz-section-label" style={{ marginBottom: 10 }}>
        {sectionLabel}
      </div>

      <div className="vz-chart-grid">
        {/* 棒グラフ */}
        <div className="vz-chart-card">
          <span className="vz-chart-card-use">比較したい時</span>
          <span className="vz-chart-card-name">棒グラフ</span>
          <svg className="vz-chart-svg" viewBox="0 0 100 56" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
            <line className="axis" x1="8" y1="48" x2="92" y2="48" />
            <line className="axis" x1="8" y1="6" x2="8" y2="48" />
            <rect className="data" x="16" y="30" width="10" height="18" rx="1.5" />
            <rect className="data" x="32" y="20" width="10" height="28" rx="1.5" />
            <rect className="data" x="48" y="14" width="10" height="34" rx="1.5" />
            <rect className="data" x="64" y="24" width="10" height="24" rx="1.5" />
            <rect className="data" x="80" y="34" width="10" height="14" rx="1.5" />
          </svg>
          <span className="vz-chart-card-body">部門別 / 製品別の大小比較</span>
        </div>

        {/* 折れ線 */}
        <div className="vz-chart-card">
          <span className="vz-chart-card-use">変化を見たい時</span>
          <span className="vz-chart-card-name">折れ線グラフ</span>
          <svg className="vz-chart-svg" viewBox="0 0 100 56" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
            <line className="axis" x1="8" y1="48" x2="92" y2="48" />
            <line className="axis" x1="8" y1="6" x2="8" y2="48" />
            <polyline
              className="data-line"
              points="14,38 28,30 42,33 56,22 70,18 84,10"
            />
            <circle className="data-point" cx="14" cy="38" r="2" />
            <circle className="data-point" cx="28" cy="30" r="2" />
            <circle className="data-point" cx="42" cy="33" r="2" />
            <circle className="data-point" cx="56" cy="22" r="2" />
            <circle className="data-point" cx="70" cy="18" r="2" />
            <circle className="data-point" cx="84" cy="10" r="2" />
          </svg>
          <span className="vz-chart-card-body">時系列 / 推移 / トレンド</span>
        </div>

        {/* 円グラフ */}
        <div className="vz-chart-card">
          <span className="vz-chart-card-use">構成比を見たい時</span>
          <span className="vz-chart-card-name">円グラフ</span>
          <svg className="vz-chart-svg" viewBox="0 0 100 56" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
            {/* 円を 4 つの sector に分割。中心 (50,28), 半径 22 */}
            {/* slice 1: 0° → 144° (40%) */}
            <path
              className="data-pie-1"
              d="M50,28 L50,6 A22,22 0 0,1 62.94,46.93 Z"
            />
            {/* slice 2: 144° → 252° (30%) */}
            <path
              className="data-pie-2"
              d="M50,28 L62.94,46.93 A22,22 0 0,1 23.21,38.41 Z"
            />
            {/* slice 3: 252° → 324° (20%) */}
            <path
              className="data-pie-3"
              d="M50,28 L23.21,38.41 A22,22 0 0,1 37.06,9.07 Z"
            />
            {/* slice 4: 324° → 360° (10%) */}
            <path
              className="data-pie-4"
              d="M50,28 L37.06,9.07 A22,22 0 0,1 50,6 Z"
            />
          </svg>
          <span className="vz-chart-card-body">全体に対する割合 / シェア</span>
        </div>

        {/* 散布図 */}
        <div className="vz-chart-card">
          <span className="vz-chart-card-use">相関を見たい時</span>
          <span className="vz-chart-card-name">散布図</span>
          <svg className="vz-chart-svg" viewBox="0 0 100 56" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
            <line className="axis" x1="8" y1="48" x2="92" y2="48" />
            <line className="axis" x1="8" y1="6" x2="8" y2="48" />
            <circle className="data-point" cx="18" cy="42" r="2.2" />
            <circle className="data-point" cx="26" cy="36" r="2.2" />
            <circle className="data-point" cx="34" cy="38" r="2.2" />
            <circle className="data-point" cx="42" cy="30" r="2.2" />
            <circle className="data-point" cx="50" cy="28" r="2.2" />
            <circle className="data-point" cx="58" cy="22" r="2.2" />
            <circle className="data-point" cx="66" cy="20" r="2.2" />
            <circle className="data-point" cx="74" cy="14" r="2.2" />
            <circle className="data-point" cx="82" cy="12" r="2.2" />
            {/* 回帰線っぽい補助線 */}
            <line className="data-line" x1="14" y1="44" x2="86" y2="10" />
          </svg>
          <span className="vz-chart-card-body">2 変量の相関 / 関係性</span>
        </div>
      </div>
    </div>
  )
}
