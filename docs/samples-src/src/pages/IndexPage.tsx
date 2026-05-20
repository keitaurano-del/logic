import { Link } from 'react-router-dom'
import { categories } from '../data/samples'
import { samplesV2 } from '../data/samplesV2'

export function IndexPage() {
  return (
    <div className="index-shell">
      <div className="index-hero">
        <h1>Logic Lesson Visualize</h1>
        <div className="jp">レッスンUIをもっとビジュアルに</div>
        <div className="note">for Keita / scratch sandbox</div>
      </div>

      {/* ============== v2 — 本体トーン × 上級レッスン図解 ============== */}
      <div className="v2">
        <div className="v2-section-header">
          <span className="badge">v2 / NEW</span>
          本体トーンで「概念を図解する」上級レッスン
          <span className="sub">Inter × Slate Blue / 全6案</span>
        </div>

        <div className="v2-card-grid">
          {samplesV2.map((s) => (
            <div key={s.slug} className="v2-cat-card">
              <div className="num">{s.number}</div>
              <h2>{s.title}</h2>
              <div className="lesson-ref">{s.lessonRef}</div>
              <p className="desc">{s.desc}</p>
              <Link to={`/v2/${s.slug}`} className="v2-cat-link">
                <span>レッスンを開く</span>
                <span>→</span>
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* ============== v1 — 手書きトーン × 6カテゴリ・14案 ============== */}
      <div className="v2-section-header">
        <span className="badge" style={{ background: 'linear-gradient(135deg, #C8634B 0%, #F4B942 100%)' }}>v1 / 手書き</span>
        手書きノート風サンドボックス
        <span className="sub">Caveat × クリーム / 6カテゴリ・14案</span>
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
        モバイル幅375px想定 / 配色は各バージョンのスタイルガイド準拠
      </div>
    </div>
  )
}
