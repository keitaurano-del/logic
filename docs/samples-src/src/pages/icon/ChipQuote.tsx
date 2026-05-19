import { SamplePage } from '../../components/SamplePage'

const sections = [
  {
    chip: '💡 ポイント',
    chipBg: 'var(--brand-soft)',
    chipFg: 'var(--brand)',
    title: '構造で考える',
    body: '問題を要素に分解し、関係性を整理することで「どこから手を打つべきか」が見えてきます。',
    quote: 'すぐ施策に飛びつかず、まず構造を捉えよ。',
  },
  {
    chip: '⚠️ 注意',
    chipBg: '#FBE9E7',
    chipFg: 'var(--accent)',
    title: 'MECE の落とし穴',
    body: 'MECE は手段であって目的ではありません。完璧なMECEより、意思決定に効く粗いMECEの方が価値が高いことも多いです。',
    quote: '「漏れなくダブりなく」より「意思決定の役に立つ」が先。',
  },
  {
    chip: '🌱 アクション',
    chipBg: '#E7F4EA',
    chipFg: '#2E7D32',
    title: '明日からやること',
    body: 'まずは「問題を3要素に分けて言語化する」だけでOK。完璧を目指さず、構造化の習慣を作りましょう。',
    quote: '小さく分けて、毎日試す。',
  },
]

export function ChipQuote() {
  return (
    <SamplePage title="6-C Chip + Quote" subtitle="チップ式タグ+左に縦バーの引用枠">
      <h2 className="step-title">ロジカル思考 3つのレッスン</h2>

      {sections.map((s, i) => (
        <div key={i} style={{ marginBottom: 16 }}>
          <span
            style={{
              display: 'inline-block',
              background: s.chipBg,
              color: s.chipFg,
              borderRadius: 999,
              padding: '4px 10px',
              fontFamily: 'var(--font-jp)',
              fontSize: 11,
              fontWeight: 700,
              marginBottom: 6,
            }}
          >
            {s.chip}
          </span>
          <div style={{ fontFamily: 'var(--font-jp)', fontWeight: 700, fontSize: 16, color: 'var(--ink)', marginBottom: 4 }}>
            {s.title}
          </div>
          <div style={{ fontFamily: 'var(--font-jp)', fontSize: 13, color: 'var(--ink)', lineHeight: 1.7, marginBottom: 8 }}>
            {s.body}
          </div>
          <blockquote
            style={{
              margin: 0,
              padding: '6px 12px',
              borderLeft: `4px solid ${s.chipFg}`,
              fontFamily: 'var(--font-en)',
              fontSize: 15,
              color: s.chipFg,
              background: 'rgba(0,0,0,0.02)',
              borderRadius: '0 8px 8px 0',
            }}
          >
            "{s.quote}"
          </blockquote>
        </div>
      ))}

      <button className="btn-primary" style={{ width: '100%', marginTop: 8 }}>
        次へ進む →
      </button>
    </SamplePage>
  )
}
