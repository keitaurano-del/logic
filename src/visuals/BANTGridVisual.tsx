import './visuals-listening.css'

/**
 * BANT — Budget / Authority / Need / Timing
 * lesson-733 系（listening コース、商談見極め）で利用想定
 * visualId: 'BANTGridDiagram'
 *
 * 構図: 2×2 grid (4 セル)。
 *   各セルは「頭文字バッジ + 英語名 + 日本語タイトル + 確認すべき問い」。
 *
 *   B — Budget    : 予算
 *   A — Authority : 決裁権
 *   N — Need      : 必要性
 *   T — Timing    : 導入時期
 *
 * warm accent: Timing セル（右下）のタイトル色 (terracotta deep)
 *   ＝ 4 つ揃って初めて意味を持つ中の「いつ動くか」が商談を前に進める鍵。
 */

export type BantItem = {
  letter: string  // 'B'|'A'|'N'|'T'
  name: string    // 'Budget' 等
  title: string   // '予算'
  question: string // 確認すべき問い
}

export type BANTGridProps = {
  sectionLabel?: string
  items?: [BantItem, BantItem, BantItem, BantItem]
  hint?: string
}

const DEFAULT_PROPS: Required<BANTGridProps> = {
  sectionLabel: 'BANT — 商談を進める前に揃える 4 要素',
  items: [
    {
      letter: 'B',
      name: 'Budget',
      title: '予算',
      question: 'いくらまでなら動けるか。社内に予算枠はあるか。',
    },
    {
      letter: 'A',
      name: 'Authority',
      title: '決裁権',
      question: '誰が最終判断をするか。今の相手は意思決定者か紹介者か。',
    },
    {
      letter: 'N',
      name: 'Need',
      title: '必要性',
      question: '今すぐ解くべき課題か。痛みの強さはどれくらいか。',
    },
    {
      letter: 'T',
      name: 'Timing',
      title: '導入時期',
      question: 'いつまでに動かす必要があるか。半年後か来週か。',
    },
  ],
  hint: '1 つでも欠けていたら、その情報を埋めることが次のステップになる',
}

export function BANTGridVisual(props: BANTGridProps = {}) {
  const { sectionLabel, items, hint } = { ...DEFAULT_PROPS, ...props }

  return (
    <div className="vz-stagger">
      <div className="vz-section-label" style={{ marginBottom: 10 }}>
        {sectionLabel}
      </div>

      <div className="vz-bant-grid">
        {items.map((it, i) => (
          <div key={i} className={`vz-bant-cell pos-${i}`}>
            <div className="vz-bant-head">
              <div className="vz-bant-letter">{it.letter}</div>
              <div className="vz-bant-name-wrap">
                <div className="vz-bant-name">{it.name}</div>
                <div className="vz-bant-title">{it.title}</div>
              </div>
            </div>
            <div className="vz-bant-question">{it.question}</div>
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
            fontSize: '0.8667rem',
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
