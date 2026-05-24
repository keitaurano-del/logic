import { useState } from 'react'

/**
 * MECE 切り口 4 種を 1 つずつ表現する pattern。
 * kind ごとに body 部のレンダリングが切り替わる：
 *   - 'elements'  : root → children 2 つ（要素分解の mini-tree）
 *   - 'sequence'  : 矢印つきの stage chain
 *   - 'opposites' : 対立ペア（複数行可）
 *   - 'framework' : 3 つのフレームワークサークル
 */
export type MecePattern =
  | {
      kind: 'elements'
      title: string
      /** 例: '売上' */
      root: string
      /** 例: ['客数', '客単価'] — 2 要素想定 */
      children: [string, string]
    }
  | {
      kind: 'sequence'
      title: string
      /** 例: ['認知', '検討', '購入'] — 3-4 段想定 */
      stages: string[]
    }
  | {
      kind: 'opposites'
      title: string
      /** 例: [['国内', '海外'], ['既存', '新規']] */
      pairs: Array<[string, string]>
    }
  | {
      kind: 'framework'
      title: string
      /** 例: ['顧客', '競合', '自社'] — 3 要素想定 */
      items: [string, string, string]
    }

export type MecePatternsProps = {
  /** 'interactive'（default）= 1 つずつタップで強調 / 'static' = 全部表示 */
  revealMode?: 'interactive' | 'static'
  sectionLabel?: string
  /** 4 種類想定。順番がそのまま表示順 */
  patterns?: MecePattern[]
  hint?: string
}

/**
 * MECE の便利な4切り口を本体トーンで図解
 * lesson-20 step.visual='MecePatternsDiagram'
 *
 * interactive モード: 4 パターンを全て同等に初期表示し、タップした 1 つだけハイライト。
 *   - 以前は初期 active=0 だったため、初回表示時に ②③④ が opacity:0.35 で
 *     ほぼ見えなくなる問題があった（SCRUM 報告 2026-05-24）。
 *   - 初期 active=null に変更し、タップ前は 4 つすべて通常表示する。
 * static モード: 全パターン同等表示（active 操作なし）。
 *
 * Props で内容差し替え可能（lesson データ側 `step.visualProps` で指定）:
 *   sectionLabel?: string         — 上部の見出し
 *   patterns?: MecePattern[]      — 4 種類想定。kind ごとに body 形状が変わる
 *   hint?: string                 — 完了時に表示するヒント
 *   revealMode?: 'interactive' | 'static'
 *
 * 未指定フィールドは default 値（要素分解 / 時系列 / 対立概念 / フレームワーク）が
 * 使われ、後方互換が保たれる。
 *
 * A 案適用 (2026-05-24, §3.1 §2.4 準拠):
 *   - hint fontSize 11→13, padding/lineHeight 拡大
 *   - card-title 13→14, mini-tree 14→14(維持), stages 13→14, pair 14→14(維持)
 *   - warm accent: ① 要素分解の root ノード (vz-mece-mini-tree .root) を terracotta に格上げ
 *     （「迷ったら要素分解」= MECE の出発点 = 1 visual 内 1 箇所アクセント）
 */

const DEFAULT_PATTERNS: MecePattern[] = [
  { kind: 'elements', title: '① 要素分解', root: '売上', children: ['客数', '客単価'] },
  { kind: 'sequence', title: '② 時系列', stages: ['認知', '検討', '購入'] },
  {
    kind: 'opposites',
    title: '③ 対立概念',
    pairs: [
      ['国内', '海外'],
      ['既存', '新規'],
    ],
  },
  { kind: 'framework', title: '④ フレームワーク', items: ['顧客', '競合', '自社'] },
]

const DEFAULT_PROPS: Required<Omit<MecePatternsProps, 'revealMode'>> = {
  sectionLabel: 'MECE の便利な4切り口',
  patterns: DEFAULT_PATTERNS,
  hint: '迷ったら「要素分解」が一番シンプルで確実',
}

function PatternBody({ pattern }: { pattern: MecePattern }) {
  switch (pattern.kind) {
    case 'elements':
      return (
        <div className="vz-mece-mini-tree">
          <div className="root">{pattern.root}</div>
          <svg viewBox="0 0 100 18" width="80" height="14">
            <line x1="50" y1="0" x2="20" y2="18" stroke="var(--brand-mid)" strokeWidth="1.5" />
            <line x1="50" y1="0" x2="80" y2="18" stroke="var(--brand-mid)" strokeWidth="1.5" />
          </svg>
          <div className="children">
            <span>{pattern.children[0]}</span>
            <span className="mul">×</span>
            <span>{pattern.children[1]}</span>
          </div>
        </div>
      )
    case 'sequence':
      return (
        <div className="vz-mece-stages">
          {pattern.stages.map((stage, i) => (
            <span key={i} style={{ display: 'contents' }}>
              <span className="vz-mece-stage">{stage}</span>
              {i < pattern.stages.length - 1 ? <span className="vz-mece-arrow">→</span> : null}
            </span>
          ))}
        </div>
      )
    case 'opposites':
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {pattern.pairs.map((pair, i) => (
            <div className="vz-mece-pair" key={i}>
              <span className="pair-a">{pair[0]}</span>
              <span style={{ color: 'var(--text-muted)' }}>/</span>
              <span className="pair-b">{pair[1]}</span>
            </div>
          ))}
        </div>
      )
    case 'framework':
      return (
        <div className="vz-mece-3c">
          <div className="vz-mece-3c-circle customer">{pattern.items[0]}</div>
          <div className="vz-mece-3c-circle competitor">{pattern.items[1]}</div>
          <div className="vz-mece-3c-circle company">{pattern.items[2]}</div>
        </div>
      )
  }
}

export function MecePatternsVisual(props: MecePatternsProps = {}) {
  const { revealMode = 'interactive', ...rest } = props
  const { sectionLabel, patterns, hint } = { ...DEFAULT_PROPS, ...rest }
  // null = 何も選択されていない（全部通常表示） — interactive でも初期は null
  const [active, setActive] = useState<number | null>(null)
  const isInteractive = revealMode !== 'static'

  const cardStyle = (idx: number): React.CSSProperties => {
    if (!isInteractive || active === null) return {}
    return active === idx
      ? { boxShadow: '0 0 0 2px var(--brand)', transition: 'box-shadow 0.2s, opacity 0.2s' }
      : { opacity: 0.35, transition: 'box-shadow 0.2s, opacity 0.2s' }
  }

  const cardProps = (idx: number) => {
    if (!isInteractive) return {}
    return {
      role: 'button' as const,
      tabIndex: 0,
      onClick: () => setActive(idx),
      onKeyDown: (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          setActive(idx)
        }
      },
      style: { ...cardStyle(idx), cursor: 'pointer' },
      'aria-pressed': active === idx,
    }
  }

  return (
    <div className="vz-stagger">
      <div className="vz-section-label" style={{ marginBottom: 10 }}>
        {sectionLabel}{isInteractive && '（タップで切り替え）'}
      </div>
      <div className="vz-mece-grid">
        {patterns.map((p, i) => (
          <div key={i} className="vz-mece-card" {...cardProps(i)}>
            <div className="vz-mece-card-title">{p.title}</div>
            <PatternBody pattern={p} />
          </div>
        ))}
      </div>

      {hint ? (
        <div
          style={{
            marginTop: 14,
            padding: '10px 12px',
            background: 'var(--brand-soft)',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--brand)',
            textAlign: 'center',
            lineHeight: 1.45,
          }}
        >
          💡 {hint}
        </div>
      ) : null}
    </div>
  )
}
