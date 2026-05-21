import { useState } from 'react'

export type LogicTreeNode = {
  label: string
  children?: LogicTreeNode[]
}

const defaultTree: LogicTreeNode = {
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

type Props = {
  /** ツリーデータ。省略時は default の「朝起きられない」例を使う */
  data?: LogicTreeNode
  /** section label を上書き。`{depth}` プレースホルダで現在の深さを埋め込み可能 */
  sectionLabel?: string
  /** ヒント文（💡）を上書き。null 指定で非表示 */
  hint?: string | null
  /** 最大深さ。デフォルト 3（ルート + 2 階層）。データの実深さと max(min) で扱う */
  maxDepth?: number
  /** ヒントブロックのトーン（warning = 黄、brand = 青） */
  hintTone?: 'warning' | 'brand'
}

/** ツリーの実深さを再帰計算 */
function computeTreeDepth(node: LogicTreeNode): number {
  if (!node.children || node.children.length === 0) return 1
  return 1 + Math.max(...node.children.map(computeTreeDepth))
}

/**
 * ロジックツリー — タップで段階展開
 * lesson-21 step.visual='LogicTreeDiagram'
 * 任意の {label, children} ツリーを props で渡せる。default は「朝起きられない」例。
 */
export function LogicTreeVisual({
  data = defaultTree,
  sectionLabel = 'Why ツリー — 「なぜ？」を{depth}層まで展開',
  hint = '💡 Why（なぜ？）と How（どうすれば？）は混ぜない',
  maxDepth,
  hintTone = 'warning',
}: Props = {}) {
  const actualDepth = computeTreeDepth(data)
  const effectiveMax = Math.min(actualDepth, maxDepth ?? 3)
  const [depth, setDepth] = useState(1)

  const labelText = sectionLabel.replace('{depth}', String(depth))

  const hintStyle =
    hintTone === 'brand'
      ? {
          background: 'var(--brand-soft)',
          color: 'var(--brand)',
        }
      : {
          background: 'var(--warning-soft)',
          color: 'var(--warning)',
        }

  return (
    <div>
      <div className="vz-section-label" style={{ marginBottom: 10 }}>
        {labelText}
      </div>

      <div className="vz-tree-root">
        {/* L1 — ルート */}
        <div className="vz-tree-node">{data.label}</div>

        {depth >= 2 && data.children && data.children.length > 0 && (
          <>
            <svg
              viewBox="0 0 200 16"
              width="100%"
              height="14"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              <line x1="100" y1="0" x2="50" y2="16" stroke="var(--brand-light)" strokeWidth="1.5" />
              <line x1="100" y1="0" x2="150" y2="16" stroke="var(--brand-light)" strokeWidth="1.5" />
            </svg>
            <div className="vz-tree-children vz-stagger">
              {data.children.map((c, i) => (
                <div key={i}>
                  <div className="vz-tree-leaf">{c.label}</div>
                  {depth >= 3 && c.children && c.children.length > 0 && (
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

      {effectiveMax > 1 && (
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
            onClick={() => setDepth(Math.min(effectiveMax, depth + 1))}
            disabled={depth === effectiveMax}
          >
            {depth < effectiveMax ? '次の層を開く →' : '完了'}
          </button>
        </div>
      )}

      {hint && (
        <div
          style={{
            marginTop: 12,
            padding: '8px 10px',
            borderRadius: 8,
            fontSize: 11,
            fontWeight: 600,
            ...hintStyle,
          }}
        >
          {hint}
        </div>
      )}
    </div>
  )
}
