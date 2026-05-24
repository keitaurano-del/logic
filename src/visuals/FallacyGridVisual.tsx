import './visuals-phase3c.css'

/**
 * 5 つの誤謬グリッド — 権威 / 人身攻撃 / 多数決 / 藁人形 / 因果の誤り
 * lesson-41 step.visual='FallacyGridDiagram'
 *
 * 構図: 縦並びカード 5 枚、各カードに記号アイコン + 名称 + 1 行説明
 *
 * A 案 Phase 3 適用済 (2026-05-24, §3.1 §2.4 準拠):
 *   - inline hint 11→13, padding/lineHeight 拡大、warning-deep token 化
 *   - CSS: fg-name 14px / fg-desc 13px は既に底上げ済 (調整不要)
 *   - warm accent: hint ボックスを terracotta soft 背景に
 *     (5 カード全部 rose 系で警告色統一、注意喚起 1 箇所のみ温度感色)
 */

type Fallacy = {
  glyph: string
  name: string
  desc: string
}

const fallacies: Fallacy[] = [
  {
    glyph: '★',
    name: '権威に訴える誤謬',
    desc: '「専門家がそう言ったから正しい」— 根拠ではなく肩書きで判断してしまう。',
  },
  {
    glyph: '×',
    name: '人身攻撃（アド・ホミネム）',
    desc: '主張ではなく相手の人格を攻撃する。論点をすり替えるすり抜け技。',
  },
  {
    glyph: '∞',
    name: '多数決の誤謬',
    desc: '「みんながそう言ってるから正しい」— 数の多さは真偽の根拠にならない。',
  },
  {
    glyph: '⌐',
    name: '藁人形論法',
    desc: '相手の主張を歪めて弱体化させた上で反論する。実際の主張には触れていない。',
  },
  {
    glyph: '⇒',
    name: '因果の誤り',
    desc: '相関を因果と取り違える、または前後関係だけで原因と断定する。',
  },
]

export function FallacyGridVisual() {
  return (
    <div className="vz-stagger">
      <div className="vz-section-label" style={{ marginBottom: 10 }}>
        よくある 5 つの論理的誤謬
      </div>

      <div className="vz-fg-grid">
        {fallacies.map((f) => (
          <div key={f.name} className="vz-fg-card">
            <div className="vz-fg-icon">{f.glyph}</div>
            <div className="vz-fg-body">
              <div className="vz-fg-name">{f.name}</div>
              <div className="vz-fg-desc">{f.desc}</div>
            </div>
          </div>
        ))}
      </div>

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
        ⚠ 自分が使ってしまっていないかも合わせて点検する
      </div>
    </div>
  )
}
