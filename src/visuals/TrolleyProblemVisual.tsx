import './visuals-phase3c.css'

/**
 * トロッコ問題 — 功利主義 vs 義務論の古典的思考実験
 * lesson-79 step.visual='TrolleyProblemDiagram'
 *
 * 構図: 線路 (直線 / 分岐) + トロッコ + 5 人 + 1 人 + レバー
 * シンプルなアイコンスタイル（DESIGN_GUIDE 準拠、過度に写実的にしない）
 *
 * A 案 Phase 3 適用済 (2026-05-24, §3.1 §2.4 準拠):
 *   - inline hint 11→13, padding/lineHeight 拡大
 *   - inline SVG text レバー 8→10, トロッコ 8→10, 5人/1人 9→11
 *   - CSS: tp-choice-tag 12px / tp-choice-title 14px / tp-choice-school 12px は既に底上げ済
 *   - warm accent: レバー (SVG circle+line) を terracotta に
 *     (「レバーを引く」決断行為が思考実験の主役 = 1 visual 内 1 箇所、A/B choice の warning/brand は §2.3 維持)
 */

export function TrolleyProblemVisual() {
  return (
    <div className="vz-stagger">
      <div className="vz-section-label" style={{ marginBottom: 10 }}>
        トロッコ問題 — レバーを引くべきか？
      </div>

      <div className="vz-tp-wrap">
        <div className="vz-tp-svg-frame">
          <svg className="vz-tp-svg" viewBox="0 0 320 180" preserveAspectRatio="xMidYMid meet">
            {/* メイン線路 (左→右) */}
            <line x1="10" y1="100" x2="160" y2="100" stroke="var(--text-secondary)" strokeWidth="2.5" />
            {/* 枕木 */}
            {[20, 40, 60, 80, 100, 120, 140].map((x) => (
              <line key={`tie-main-${x}`} x1={x} y1="95" x2={x} y2="105" stroke="var(--text-muted)" strokeWidth="1.5" />
            ))}

            {/* 分岐点 (160, 100) からの 2 ルート */}
            {/* 直進ルート (5 人方向): 160 → 310, y=100 */}
            <line x1="160" y1="100" x2="310" y2="100" stroke="var(--text-secondary)" strokeWidth="2.5" />
            {[180, 200, 220, 240, 260, 280, 300].map((x) => (
              <line key={`tie-straight-${x}`} x1={x} y1="95" x2={x} y2="105" stroke="var(--text-muted)" strokeWidth="1.5" />
            ))}

            {/* 分岐ルート (1 人方向): 160 → 310, y=160 (下にカーブ) */}
            <path
              d="M 160 100 Q 200 100 220 130 T 310 160"
              fill="none"
              stroke="var(--text-secondary)"
              strokeWidth="2.5"
            />

            {/* レバー (分岐点直前)
             * warm accent (A 案 Phase 3): 「レバーを引く」決断行為が思考実験の主役 = terracotta */}
            <circle cx="145" cy="100" r="6" fill="var(--visual-warm-primary)" />
            <line x1="145" y1="100" x2="145" y2="80" stroke="var(--visual-warm-primary)" strokeWidth="3" strokeLinecap="round" />
            <text x="145" y="74" fontSize="10" fill="var(--visual-warm-primary)" textAnchor="middle" fontWeight="700">レバー</text>

            {/* トロッコ (左寄り) */}
            <g transform="translate(40, 80)">
              <rect x="0" y="0" width="36" height="18" rx="3" fill="var(--warning)" />
              <rect x="4" y="-6" width="28" height="8" rx="2" fill="var(--warning-mid)" />
              <circle cx="8" cy="22" r="4" fill="var(--text-primary)" />
              <circle cx="28" cy="22" r="4" fill="var(--text-primary)" />
            </g>
            <text x="58" y="68" fontSize="10" fill="var(--text-secondary)" textAnchor="middle" fontWeight="700">
              暴走トロッコ
            </text>

            {/* 5 人 (直進先、右上) */}
            <g transform="translate(260, 78)">
              {[0, 10, 20, 30, 40].map((dx, i) => (
                <g key={`p5-${i}`} transform={`translate(${dx}, 0)`}>
                  <circle cx="0" cy="0" r="3.5" fill="var(--danger)" />
                  <rect x="-2.5" y="3" width="5" height="9" rx="1" fill="var(--danger)" />
                </g>
              ))}
            </g>
            <text x="280" y="74" fontSize="11" fill="var(--danger)" textAnchor="middle" fontWeight="700">
              5 人
            </text>

            {/* 1 人 (分岐先、右下) */}
            <g transform="translate(280, 152)">
              <circle cx="0" cy="0" r="3.5" fill="var(--danger)" />
              <rect x="-2.5" y="3" width="5" height="9" rx="1" fill="var(--danger)" />
            </g>
            <text x="280" y="148" fontSize="11" fill="var(--danger)" textAnchor="middle" fontWeight="700">
              1 人
            </text>
          </svg>
        </div>

        <div className="vz-tp-choices">
          <div className="vz-tp-choice a">
            <span className="vz-tp-choice-tag">A. 何もしない</span>
            <span className="vz-tp-choice-title">5 人が犠牲になる</span>
            <span className="vz-tp-choice-school">義務論：意図的に殺さない</span>
          </div>
          <div className="vz-tp-choice b">
            <span className="vz-tp-choice-tag">B. レバーを引く</span>
            <span className="vz-tp-choice-title">1 人が犠牲になる</span>
            <span className="vz-tp-choice-school">功利主義：被害を最小化</span>
          </div>
        </div>
      </div>

      <div style={{
        marginTop: 14,
        padding: '10px 12px',
        background: 'var(--brand-soft)',
        borderRadius: 8,
        fontSize: '0.8667rem',
        fontWeight: 600,
        color: 'var(--brand)',
        textAlign: 'center',
        lineHeight: 1.45,
      }}>
        💡 「結果」を重視するか「行為そのもの」を重視するかで答えが変わる
      </div>
    </div>
  )
}
