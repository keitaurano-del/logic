import { SamplePage } from '../../components/SamplePage'

export function HeaderIcon() {
  return (
    <SamplePage title="6-B Header Icon" subtitle="タイトル左に大きめイラスト+背景に薄い水玉">
      <div
        style={{
          position: 'relative',
          background: 'var(--brand-soft)',
          borderRadius: 16,
          padding: '18px 18px 22px',
          marginBottom: 14,
          overflow: 'hidden',
          backgroundImage:
            'radial-gradient(circle, rgba(61, 95, 196, 0.18) 1.5px, transparent 1.5px)',
          backgroundSize: '14px 14px',
        }}
      >
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', position: 'relative', zIndex: 1 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: 'white',
              border: '2px solid var(--brand)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 30,
              boxShadow: '2px 2px 0 var(--brand)',
              flexShrink: 0,
            }}
          >
            🧠
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-jp)', fontSize: 11, color: 'var(--brand)', letterSpacing: 2 }}>
              CHAPTER 03
            </div>
            <h2 style={{ fontFamily: 'var(--font-jp)', margin: '4px 0 0', fontSize: 20, color: 'var(--ink)' }}>
              仮説思考の力
            </h2>
          </div>
        </div>
      </div>

      <div
        style={{
          background: 'white',
          borderRadius: 14,
          padding: 16,
          marginBottom: 14,
          border: '1.5px solid var(--rule)',
        }}
      >
        <p className="step-body" style={{ marginBottom: 12 }}>
          優秀なコンサルタントは「先に当たりをつける」習慣を持ちます。手を動かす前に結論の仮説を立てておくと、調査の精度が圧倒的に上がります。
        </p>
        <div
          style={{
            background: 'var(--sticky)',
            borderRadius: 10,
            padding: 10,
            fontFamily: 'var(--font-jp)',
            fontSize: 13,
            color: 'var(--ink)',
            boxShadow: '2px 3px 0 var(--sticky-shadow)',
          }}
        >
          💡 仮説 = いまの情報で出せる最良の仮の結論
        </div>
      </div>

      <div
        style={{
          background: 'white',
          borderRadius: 14,
          padding: 16,
          border: '1.5px solid var(--rule)',
          display: 'flex',
          gap: 10,
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: 'var(--accent)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
            flexShrink: 0,
          }}
        >
          🎯
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-jp)', fontWeight: 700, fontSize: 14, color: 'var(--accent)', marginBottom: 4 }}>
            実践のコツ
          </div>
          <div style={{ fontFamily: 'var(--font-jp)', fontSize: 12, color: 'var(--ink)', lineHeight: 1.6 }}>
            仮説は「外す」前提でOK。修正のしやすさが速度を生みます。
          </div>
        </div>
      </div>

      <button className="btn-primary" style={{ width: '100%', marginTop: 14 }}>
        次へ進む →
      </button>
    </SamplePage>
  )
}
