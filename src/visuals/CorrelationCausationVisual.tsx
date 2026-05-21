import './visuals-phase3c.css'

/**
 * 相関 ≠ 因果 — 第三変数による疑似相関
 * lesson-71 step.0 visual='CorrelationCausationDiagram'
 *
 * 構図: 3 ノード因果図
 *   気温（第三変数、上）→ アイス販売 / 溺死（下に並ぶ 2 ノード）
 *   アイス販売 ↔ 溺死 の間に「相関あり（×因果ではない）」の点線
 */

export function CorrelationCausationVisual() {
  return (
    <div className="vz-stagger">
      <div className="vz-section-label" style={{ marginBottom: 10 }}>
        相関は因果ではない — 隠れた第三変数を疑う
      </div>

      <div className="vz-cc-wrap">
        <div className="vz-cc-svg-frame">
          <svg className="vz-cc-svg" viewBox="0 0 300 200" preserveAspectRatio="xMidYMid meet">
            {/* 矢印マーカー + gradient 定義 */}
            <defs>
              <marker id="cc-arrow-blue" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="var(--brand)" />
              </marker>
              <linearGradient id="cc-temp-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6C8EF5" />
                <stop offset="100%" stopColor="#2E45A8" />
              </linearGradient>
            </defs>

            {/* 第三変数: 気温（中央上） */}
            <rect x="105" y="14" width="90" height="38" rx="10"
              fill="url(#cc-temp-grad)" />
            <text x="150" y="32" fontSize="10" fill="#fff" textAnchor="middle" fontWeight="700">
              気温（真の原因）
            </text>
            <text x="150" y="46" fontSize="8" fill="#fff" textAnchor="middle" opacity="0.85">
              第三変数
            </text>

            {/* アイス販売（左下） */}
            <rect x="14" y="130" width="100" height="44" rx="10"
              fill="var(--bg-card)" stroke="var(--brand)" strokeWidth="1.5" />
            <text x="64" y="152" fontSize="11" fill="var(--text-primary)" textAnchor="middle" fontWeight="700">
              アイス販売
            </text>
            <text x="64" y="166" fontSize="8" fill="var(--text-secondary)" textAnchor="middle">
              夏に増える
            </text>

            {/* 溺死（右下） */}
            <rect x="186" y="130" width="100" height="44" rx="10"
              fill="var(--bg-card)" stroke="var(--brand)" strokeWidth="1.5" />
            <text x="236" y="152" fontSize="11" fill="var(--text-primary)" textAnchor="middle" fontWeight="700">
              溺死事故
            </text>
            <text x="236" y="166" fontSize="8" fill="var(--text-secondary)" textAnchor="middle">
              夏に増える
            </text>

            {/* 気温 → アイス販売 (真の因果、青矢印) */}
            <line x1="120" y1="56" x2="80" y2="124"
              stroke="var(--brand)" strokeWidth="2"
              markerEnd="url(#cc-arrow-blue)" />
            <text x="86" y="92" fontSize="8" fill="var(--brand)" textAnchor="middle" fontWeight="700"
              transform="rotate(60 86 92)">
              真の原因
            </text>

            {/* 気温 → 溺死 (真の因果、青矢印) */}
            <line x1="180" y1="56" x2="220" y2="124"
              stroke="var(--brand)" strokeWidth="2"
              markerEnd="url(#cc-arrow-blue)" />
            <text x="218" y="92" fontSize="8" fill="var(--brand)" textAnchor="middle" fontWeight="700"
              transform="rotate(-60 218 92)">
              真の原因
            </text>

            {/* アイス販売 ↔ 溺死 (疑似相関、赤点線) */}
            <line x1="114" y1="152" x2="186" y2="152"
              stroke="var(--danger)" strokeWidth="2" strokeDasharray="4 3" />
            <text x="150" y="190" fontSize="8" fill="var(--danger)" textAnchor="middle" fontWeight="700">
              ✗ 因果ではない（疑似相関）
            </text>
          </svg>
        </div>

        <div className="vz-cc-legend">
          <div className="vz-cc-legend-row">
            <span className="vz-cc-arrow-sample cause">→</span>
            <span>真の因果関係（気温が両方を動かしている）</span>
          </div>
          <div className="vz-cc-legend-row">
            <span className="vz-cc-arrow-sample fake">‒‒</span>
            <span>見かけの相関（実は因果ではない）</span>
          </div>
        </div>
      </div>

      <div style={{
        marginTop: 12,
        padding: '8px 10px',
        background: 'var(--brand-soft)',
        borderRadius: 8,
        fontSize: 11,
        fontWeight: 600,
        color: 'var(--brand)',
        textAlign: 'center',
      }}>
        💡 「アイスを売ったら溺死が増えた」ではなく、両方が暑さによる結果
      </div>
    </div>
  )
}
