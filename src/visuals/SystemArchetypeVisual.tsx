import { useState } from 'react'

/**
 * システム原型 — 3 種類を切替表示
 * Fixes that Fail / Limits to Growth / Tragedy of the Commons
 * lesson-66 step.0 step.visual='SystemArchetypeDiagram'
 */

type ArchetypeKey = 'fixes' | 'limits' | 'commons'

type ArchetypeNode = {
  text: string
  kind?: 'problem' | 'fix' | 'side' | 'normal'
}

type ArchetypeEdge = {
  label: string
  sign: 'plus' | 'minus'
}

type Archetype = {
  key: ArchetypeKey
  label: string
  summary: string
  nodes: ArchetypeNode[]
  /** 各ノード間を順に繋ぐエッジ。最後のノード → 最初のノードに戻るループ */
  edges: ArchetypeEdge[]
  hint: string
}

const archetypes: Archetype[] = [
  {
    key: 'fixes',
    label: 'Fixes that Fail',
    summary: '応急処置がかえって問題を悪化させる。短期改善が長期の副作用を生む構造',
    nodes: [
      { text: '問題', kind: 'problem' },
      { text: '応急処置', kind: 'fix' },
      { text: '副作用', kind: 'side' },
      { text: '問題の悪化', kind: 'problem' },
    ],
    edges: [
      { label: '対症療法', sign: 'minus' },
      { label: '時間差', sign: 'plus' },
      { label: '深刻化', sign: 'plus' },
      { label: 'さらに必要に', sign: 'plus' },
    ],
    hint: '応急処置の前に副作用を見抜く。根本原因に手を打つ余地を残す',
  },
  {
    key: 'limits',
    label: 'Limits to Growth',
    summary: '順調な成長が制約要因にぶつかって失速する。成長エンジン + 制約のセット',
    nodes: [
      { text: '成長行動', kind: 'fix' },
      { text: '成果', kind: 'normal' },
      { text: '制約条件', kind: 'side' },
      { text: '成長の鈍化', kind: 'problem' },
    ],
    edges: [
      { label: '初期は増加', sign: 'plus' },
      { label: '逼迫', sign: 'plus' },
      { label: 'ブレーキ', sign: 'minus' },
      { label: '頭打ち', sign: 'minus' },
    ],
    hint: '成長施策を増やすより、制約条件を緩める方が効く',
  },
  {
    key: 'commons',
    label: 'Tragedy of the Commons',
    summary: '共有資源を各人が最適化した結果、全体が枯渇する。個別合理 vs 全体合理',
    nodes: [
      { text: '個人の利用', kind: 'fix' },
      { text: '個別利益', kind: 'normal' },
      { text: '共有資源の消耗', kind: 'side' },
      { text: '全員の損失', kind: 'problem' },
    ],
    edges: [
      { label: '直接得る', sign: 'plus' },
      { label: '集積', sign: 'plus' },
      { label: '枯渇', sign: 'minus' },
      { label: '個別利益も減', sign: 'minus' },
    ],
    hint: 'ルール／料金／配分で「使うほど損する」設計に変える',
  },
]

type Props = {
  archetype?: ArchetypeKey
}

export function SystemArchetypeVisual({ archetype = 'fixes' }: Props) {
  const [active, setActive] = useState<ArchetypeKey>(archetype)
  const current = archetypes.find(a => a.key === active) ?? archetypes[0]

  return (
    <div>
      <div className="vz-section-label" style={{ marginBottom: 10 }}>
        システム原型 — 繰り返される構造のパターン
      </div>

      <div className="vz-archetype">
        <div className="vz-archetype-tabs" role="tablist">
          {archetypes.map(a => (
            <button
              key={a.key}
              type="button"
              role="tab"
              aria-selected={a.key === active}
              className={`vz-archetype-tab ${a.key === active ? 'active' : ''}`}
              onClick={() => setActive(a.key)}
            >
              {a.label}
            </button>
          ))}
        </div>

        <div className="vz-archetype-summary">{current.summary}</div>

        <div className="vz-archetype-loop vz-stagger">
          {current.nodes.map((n, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div className={`vz-archetype-node ${n.kind ?? 'normal'}`}>{n.text}</div>
              {i < current.nodes.length - 1 ? (
                <div className="vz-archetype-arrow">
                  <span className={`sign ${current.edges[i]?.sign === 'minus' ? 'minus' : ''}`}>
                    {current.edges[i]?.sign === 'minus' ? '−' : '+'}
                  </span>
                  <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)' }}>
                    {current.edges[i]?.label}
                  </span>
                  <span>↓</span>
                </div>
              ) : (
                <div className="vz-archetype-arrow">
                  <span className={`sign ${current.edges[i]?.sign === 'minus' ? 'minus' : ''}`}>
                    {current.edges[i]?.sign === 'minus' ? '−' : '+'}
                  </span>
                  <span style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)' }}>
                    {current.edges[i]?.label} → 最初のノードへ戻る
                  </span>
                  <span>↺</span>
                </div>
              )}
            </div>
          ))}
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
        {current.hint}
      </div>
    </div>
  )
}
