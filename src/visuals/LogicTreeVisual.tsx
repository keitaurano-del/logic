import { useState } from 'react'

type Node = {
  label: string
  children?: Node[]
}

const tree: Node = {
  label: '朝起きられない',
  children: [
    {
      label: '夜更かしをしている',
      children: [
        { label: 'スマホを見すぎ' },
        { label: '仕事が遅くまで' },
      ],
    },
    {
      label: '睡眠の質が悪い',
      children: [
        { label: '寝室が明るい' },
        { label: 'カフェイン摂取' },
      ],
    },
  ],
}

/**
 * ロジックツリー — タップで段階展開
 * lesson-21 step.visual='LogicTreeDiagram'
 */
export function LogicTreeVisual() {
  const [depth, setDepth] = useState(1)
  const max = 3

  return (
    <div>
      <div className="vz-section-label" style={{ marginBottom: 10 }}>
        Why ツリー — 「なぜ？」を{depth}層まで展開
      </div>

      <div className="vz-tree-root">
        {/* L1 */}
        <div className="vz-tree-node">{tree.label}</div>

        {depth >= 2 && tree.children && (
          <>
            <svg viewBox="0 0 200 16" width="100%" height="14" preserveAspectRatio="none">
              <line x1="100" y1="0" x2="50" y2="16" stroke="#9BB3FA" strokeWidth="1.5" />
              <line x1="100" y1="0" x2="150" y2="16" stroke="#9BB3FA" strokeWidth="1.5" />
            </svg>
            <div className="vz-tree-children vz-stagger">
              {tree.children.map((c, i) => (
                <div key={i}>
                  <div className="vz-tree-leaf">{c.label}</div>
                  {depth >= 3 && c.children && (
                    <div className="vz-tree-leaves">
                      {c.children.map((leaf, j) => (
                        <div key={j}>↳ {leaf.label}</div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div style={{ display: 'flex', gap: 6, marginTop: 14 }}>
        <button
          className="vz-ladder-btn"
          onClick={() => setDepth(Math.max(1, depth - 1))}
          disabled={depth === 1}
        >
          ← 戻す
        </button>
        <button
          className="vz-ladder-btn primary"
          onClick={() => setDepth(Math.min(max, depth + 1))}
          disabled={depth === max}
        >
          {depth < max ? '次の層を開く →' : '完了'}
        </button>
      </div>

      <div style={{
        marginTop: 12,
        padding: '8px 10px',
        background: 'rgba(217, 119, 6, 0.10)',
        borderRadius: 8,
        fontSize: 11,
        fontWeight: 600,
        color: '#92400E',
      }}>
        💡 Why（なぜ？）と How（どうすれば？）は混ぜない
      </div>
    </div>
  )
}
