import './visuals-phase2.css'

/**
 * グラフの罠 3 種図解 — Y軸ゼロカット / 相関≠因果 / サンプル偏り
 * lesson-42, lesson-401, lesson-406 で流用
 * 想定 visualId: 'GraphPitfallsDiagram'
 *
 * A 案適用 (2026-05-24, §3.1 §2.4 準拠):
 *   - hint fontSize 11→13, padding/lineHeight 拡大
 *   - card title 14→15, body 13→14, tag 11→12 (CSS 側で底上げ)
 *   - warm accent: hint ボックスの背景を terracotta soft に格上げ
 *     （3 つの罠を踏まえた「実践の起点」=  1 visual 内 1 箇所アクセント）
 *     既存 danger 色の NG タグはそのまま維持（罠の意味色なので変更不可）
 */

export type GraphPitfallsProps = {
  sectionLabel?: string
  hint?: string
}

const DEFAULT_PROPS: Required<GraphPitfallsProps> = {
  sectionLabel: 'グラフでよく見る 3 つの罠',
  hint: '見せ方一つで印象が変わる。データを見たら「軸・関係・サンプル」を疑う',
}

export function GraphPitfallsVisual(props: GraphPitfallsProps = {}) {
  const { sectionLabel, hint } = { ...DEFAULT_PROPS, ...props }

  return (
    <div className="vz-stagger">
      <div className="vz-section-label" style={{ marginBottom: 10 }}>{sectionLabel}</div>

      <div className="vz-gp-grid">
        {/* 罠 1: Y 軸ゼロカット */}
        <div className="vz-gp-card">
          <svg className="vz-gp-svg" viewBox="0 0 84 60" aria-hidden="true">
            <line x1="10" y1="6" x2="10" y2="52" stroke="var(--text-muted)" strokeWidth="1" />
            <line x1="10" y1="52" x2="78" y2="52" stroke="var(--text-muted)" strokeWidth="1" />
            {/* 圧縮された Y 軸（ゼロから始まらない） */}
            <text x="6" y="14" fontSize="6" fill="var(--text-muted)" textAnchor="end">100</text>
            <text x="6" y="32" fontSize="6" fill="var(--text-muted)" textAnchor="end">98</text>
            <text x="6" y="52" fontSize="6" fill="var(--text-muted)" textAnchor="end">96</text>
            {/* 急上昇に見える棒グラフ */}
            <rect x="18" y="42" width="10" height="10" fill="var(--danger)" opacity="0.7" />
            <rect x="32" y="28" width="10" height="24" fill="var(--danger)" opacity="0.8" />
            <rect x="46" y="14" width="10" height="38" fill="var(--danger)" />
            {/* ジグザグでゼロカット表現 */}
            <path d="M 8 50 L 12 48 L 8 46 L 12 44" stroke="var(--danger)" strokeWidth="1" fill="none" />
          </svg>
          <div className="vz-gp-meta">
            <span className="vz-gp-tag">NG ① 軸の罠</span>
            <div className="vz-gp-title">Y 軸ゼロカット</div>
            <div className="vz-gp-body">起点を切ると 2% の差が劇的に見える</div>
          </div>
        </div>

        {/* 罠 2: 相関 ≠ 因果 */}
        <div className="vz-gp-card">
          <svg className="vz-gp-svg" viewBox="0 0 84 60" aria-hidden="true">
            {/* 隠れた共通原因（Z）— 中央上 */}
            <circle cx="42" cy="14" r="9" fill="var(--warning-soft)" stroke="var(--warning)" strokeWidth="1.2" />
            <text x="42" y="17" textAnchor="middle" fontSize="7" fontWeight="700" fill="var(--warning)">Z</text>
            {/* A と B */}
            <circle cx="18" cy="46" r="9" fill="var(--bg-card)" stroke="var(--brand)" strokeWidth="1.2" />
            <text x="18" y="49" textAnchor="middle" fontSize="7" fontWeight="700" fill="var(--brand)">A</text>
            <circle cx="66" cy="46" r="9" fill="var(--bg-card)" stroke="var(--brand)" strokeWidth="1.2" />
            <text x="66" y="49" textAnchor="middle" fontSize="7" fontWeight="700" fill="var(--brand)">B</text>
            {/* Z → A, Z → B 矢印 */}
            <line x1="36" y1="22" x2="22" y2="38" stroke="var(--warning)" strokeWidth="1.2" />
            <line x1="48" y1="22" x2="62" y2="38" stroke="var(--warning)" strokeWidth="1.2" />
            {/* A — B 偽の相関 (点線) */}
            <line x1="27" y1="46" x2="57" y2="46" stroke="var(--danger)" strokeWidth="1.2" strokeDasharray="2,2" />
            <text x="42" y="58" textAnchor="middle" fontSize="6" fontWeight="700" fill="var(--danger)">見かけの相関</text>
          </svg>
          <div className="vz-gp-meta">
            <span className="vz-gp-tag">NG ② 関係の罠</span>
            <div className="vz-gp-title">相関 ≠ 因果</div>
            <div className="vz-gp-body">A と B の裏に共通原因 Z が潜む</div>
          </div>
        </div>

        {/* 罠 3: サンプル偏り */}
        <div className="vz-gp-card">
          <svg className="vz-gp-svg" viewBox="0 0 84 60" aria-hidden="true">
            {/* 全体集団: 薄い円群 */}
            {[
              [12, 12], [22, 18], [32, 10], [44, 16], [56, 12], [68, 20],
              [16, 30], [28, 36], [42, 30], [56, 36], [70, 30],
              [14, 48], [26, 50], [40, 46], [54, 50], [68, 46],
            ].map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r="2.5" fill="var(--text-muted)" opacity="0.4" />
            ))}
            {/* 偏ったサンプル: 一部だけ赤くハイライト */}
            {[[12, 12], [22, 18], [32, 10], [16, 30]].map(([x, y], i) => (
              <circle key={`s-${i}`} cx={x} cy={y} r="3.2" fill="var(--danger)" />
            ))}
            {/* 選択範囲を示す枠 */}
            <rect x="6" y="4" width="32" height="32" rx="3"
              fill="none" stroke="var(--danger)" strokeWidth="1.2" strokeDasharray="3,2" />
            <text x="50" y="56" textAnchor="middle" fontSize="6" fontWeight="700" fill="var(--text-muted)">全体</text>
          </svg>
          <div className="vz-gp-meta">
            <span className="vz-gp-tag">NG ③ 標本の罠</span>
            <div className="vz-gp-title">サンプル偏り</div>
            <div className="vz-gp-body">一部だけ見て全体を語る</div>
          </div>
        </div>
      </div>

      {hint ? (
        <div style={{
          marginTop: 14,
          padding: '10px 12px',
          background: 'var(--visual-warm-primary-soft)',
          borderRadius: 8,
          fontSize: 13,
          fontWeight: 600,
          color: 'var(--visual-warm-primary-deep)',
          textAlign: 'center',
          lineHeight: 1.45,
        }}>
          💡 {hint}
        </div>
      ) : null}
    </div>
  )
}
