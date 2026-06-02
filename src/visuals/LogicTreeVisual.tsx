import { useStepReveal } from './hooks/useStepReveal'

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
  /** 'interactive'（default）= ボタンで段階展開 / 'static' = 最初から全層表示 */
  revealMode?: 'interactive' | 'static'
}

/** ツリーの実深さを再帰計算 */
function computeTreeDepth(node: LogicTreeNode): number {
  if (!node.children || node.children.length === 0) return 1
  return 1 + Math.max(...node.children.map(computeTreeDepth))
}

/**
 * ロジックツリー — タップで段階展開
 * lesson-21 step.visual='LogicTreeDiagram'（default）
 * lesson-22, lesson-25, lesson-323 など複数レッスンで流用可能
 *
 * Props で内容差し替え可能（lesson データ側 `step.visualProps` で指定）:
 *   data?: LogicTreeNode          — 任意の {label, children} 再帰ツリー
 *   sectionLabel?: string         — 上部見出し。`{depth}` プレースホルダで現在深さを埋め込み
 *   hint?: string | null          — ヒント文。null で非表示
 *   maxDepth?: number             — 最大展開深さ（default 3）
 *   hintTone?: 'warning' | 'brand' — ヒント色（warning=黄, brand=青）
 *   revealMode?: 'interactive' | 'static'
 *                                 — interactive (default) は段階展開、static は最初から全表示
 *
 * 未指定フィールドは default 値（「朝起きられない」Why ツリー）が使われ、後方互換が保たれる。
 *
 * useStepReveal ベースで Phase 3 の他 Visual と同じ操作感に統一。
 *
 * A 案適用 (2026-05-24, §3.1 §2.4 準拠):
 *   - hint fontSize 11→13, padding/lineHeight 拡大
 *   - tree-node root 15→16, leaf 14→14(維持), leaves 13→13(維持) (CSS 側で底上げ)
 *   - warm accent: 子ノード (vz-tree-leaf) の左ボーダーを terracotta に格上げ
 *     （Why ツリーで「分岐 = 動きの起点」、子ノードがその核 = 1 visual 内 1 箇所）
 */
export function LogicTreeVisual({
  data = defaultTree,
  sectionLabel = 'Why ツリー — 「なぜ？」を{depth}層まで展開',
  hint = '💡 Why（なぜ？）と How（どうすれば？）は混ぜない',
  maxDepth,
  hintTone = 'warning',
  revealMode = 'interactive',
}: Props = {}) {
  const actualDepth = computeTreeDepth(data)
  const effectiveMax = Math.min(actualDepth, maxDepth ?? 3)

  const { step: depth, controls } = useStepReveal({
    totalSteps: effectiveMax,
    mode: revealMode,
    prevLabel: '← 戻す',
    nextLabel: '次の層を開く →',
    doneLabel: '完了',
  })

  const labelText = sectionLabel.replace('{depth}', String(depth))

  const hintStyle =
    hintTone === 'brand'
      ? {
          background: 'var(--brand-soft)',
          color: 'var(--brand-on-soft, var(--brand))',
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

      {controls}

      {hint && (
        <div
          style={{
            marginTop: 14,
            padding: '10px 12px',
            borderRadius: 8,
            fontSize: '0.8667rem',
            fontWeight: 600,
            lineHeight: 1.45,
            ...hintStyle,
          }}
        >
          {hint}
        </div>
      )}
    </div>
  )
}
