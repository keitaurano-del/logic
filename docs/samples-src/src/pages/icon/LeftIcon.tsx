import { SamplePage } from '../../components/SamplePage'

const blocks = [
  { icon: '💡', title: '仮説思考とは', body: '最初に仮説を立て、検証しながら進む。手当たり次第に情報を集めるより、ずっと早く結論に近づけます。', color: 'var(--brand)' },
  { icon: '🔍', title: 'MECE 分解', body: '漏れなくダブりなく要素を切り分ける考え方。「全体感」と「個別の深さ」を両立できます。', color: 'var(--accent)' },
  { icon: '⚖️', title: '優先度づけ', body: 'インパクトの大きい論点に時間を集中投下。すべてに同じ重みをかけてはいけません。', color: 'var(--sticky-shadow)' },
]

export function LeftIcon() {
  return (
    <SamplePage title="6-A Left Icon" subtitle="左上アイコン+太い左ボーダーのハイライト枠">
      <h2 className="step-title">ケース面接 3つの柱</h2>
      <p className="step-body" style={{ marginBottom: 14 }}>
        テキストブロックを「アイコン+太い左ボーダー」で視覚的に区切るだけでも、読みやすさが大きく変わります。
      </p>

      {blocks.map((b, i) => (
        <div
          key={i}
          style={{
            position: 'relative',
            background: 'white',
            borderLeft: `5px solid ${b.color}`,
            borderRadius: 12,
            padding: '14px 14px 14px 56px',
            marginBottom: 12,
            boxShadow: '0 4px 12px -4px rgba(31,42,68,0.18)',
          }}
        >
          <div
            style={{
              position: 'absolute',
              left: 12,
              top: 12,
              width: 32,
              height: 32,
              borderRadius: 8,
              background: `${b.color}22`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 18,
            }}
          >
            {b.icon}
          </div>
          <div style={{ fontFamily: 'var(--font-jp)', fontWeight: 700, fontSize: 14, color: b.color, marginBottom: 4 }}>
            {b.title}
          </div>
          <div style={{ fontFamily: 'var(--font-jp)', fontSize: 13, color: 'var(--ink)', lineHeight: 1.7 }}>
            {b.body}
          </div>
        </div>
      ))}

      <button className="btn-primary" style={{ width: '100%', marginTop: 12 }}>
        次へ進む →
      </button>
    </SamplePage>
  )
}
