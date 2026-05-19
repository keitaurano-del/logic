import { Link } from 'react-router-dom'
import { categories } from '../data/samples'

export function IndexPage() {
  return (
    <div className="index-shell">
      <div className="index-hero">
        <h1>Logic Lesson Visualize</h1>
        <div className="jp">レッスンUIをもっとビジュアルに — 6カテゴリ・14案</div>
        <div className="note">for Keita / scratch sandbox</div>
      </div>

      <div className="category-grid">
        {categories.map((cat) => (
          <div key={cat.id} className="category-card">
            <div className="num">{cat.number}</div>
            <h2>{cat.title}</h2>
            <p className="desc">{cat.desc}</p>
            <div className="variant-list">
              {cat.variants.map((v) => (
                <Link
                  key={v.slug}
                  to={`/${cat.id}/${v.slug}`}
                  className="variant-link"
                >
                  <span>
                    <strong style={{ display: 'block', marginBottom: 2 }}>{v.title}</strong>
                    <span style={{ fontWeight: 400, color: 'var(--ink-soft)' }}>{v.blurb}</span>
                  </span>
                  <span className="arrow">→</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 48, textAlign: 'center', fontFamily: 'var(--font-jp)', fontSize: 13, color: 'var(--ink-soft)' }}>
        全14サンプル / モバイル幅375pxを想定 / 配色は手書きスタイルガイド準拠
      </div>
    </div>
  )
}
