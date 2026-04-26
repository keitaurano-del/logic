/**
 * RoadmapScreenV3 - Logic v3 redesign
 * 仕様: docs/DESIGN_V3.md §3.2
 * モックアップ: lv3-courses.html
 */
import { v3 } from '../styles/tokensV3'

const IMG = '/images/v3'

interface RoadmapScreenV3Props {
  onOpenLesson: (id: number) => void
  onOpenCategory: (cat: string) => void
}

export function RoadmapScreenV3(props: RoadmapScreenV3Props) {
  return (
    <div style={{ background: v3.color.bg, minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Noto Sans JP', sans-serif", color: v3.color.text }}>
      <div style={{ padding: 'calc(env(safe-area-inset-top, 44px) + 4px) 20px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontSize: 24, fontWeight: 700, letterSpacing: '-.005em' }}>レッスン</div>
        <div style={{ width: 36, height: 36, borderRadius: '50%', background: v3.color.card, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={v3.color.accent} strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
        </div>
      </div>

      <div style={{ flex: 1, padding: '0 16px 100px', display: 'flex', flexDirection: 'column', gap: v3.spacing.gap }}>

        <div style={{ padding: '4px 4px 8px' }}>
          <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.45, letterSpacing: '-.005em' }}>どこから<br />はじめましょうか。</div>
          <div style={{ fontSize: 13, color: v3.color.text2, marginTop: 6, lineHeight: 1.6 }}>目的に合ったコースを選ぶか、<br />気になるカテゴリから始められます。</div>
        </div>

        <SectionLabel>ラーニングパス</SectionLabel>

        <PathCard
          image={`${IMG}/hero-deduction.webp`}
          tag="入門 · 推奨"
          name="Logic 入門コース"
          meta="6レッスン · 約2週間で完走"
          progress={50}
          done={3}
          total={6}
          accent={v3.color.accent}
          onClick={() => props.onOpenLesson(20)}
        />
        <PathCard
          image={`${IMG}/course-business.webp`}
          tag="中〜上級"
          name="ビジネス強化コース"
          meta="8レッスン · ケース面接 + 提案技術"
          progress={25}
          done={2}
          total={8}
          accent={v3.color.warm}
          onClick={() => props.onOpenCategory('case')}
        />
        <PathCard
          image={`${IMG}/course-philosophy.webp`}
          tag="上級"
          name="哲学・深掘りコース"
          meta="8レッスン · 哲学 + 対話形式"
          progress={0}
          done={0}
          total={8}
          accent="#A5B4FC"
          onClick={() => props.onOpenCategory('philosophy')}
        />

        <SectionLabel>すべてのカテゴリ</SectionLabel>

        <CategoryCard
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill={v3.color.accent}><rect x="3" y="3" width="8" height="8" rx="1.5" /><rect x="13" y="3" width="8" height="8" rx="1.5" /><rect x="3" y="13" width="8" height="8" rx="1.5" /><rect x="13" y="13" width="8" height="8" rx="1.5" /></svg>}
          iconBg="rgba(112,216,189,.14)"
          name="ロジカルシンキング"
          meta="5レッスン · 初〜中級"
          progress="3/5"
          onClick={() => props.onOpenCategory('logic')}
        />
        <CategoryCard
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill={v3.color.warm}><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" fill="none" stroke={v3.color.warm} strokeWidth="2" /></svg>}
          iconBg="rgba(244,162,97,.14)"
          name="ケース面接"
          meta="4レッスン · 中〜上級"
          progress="1/4"
          onClick={() => props.onOpenCategory('case')}
        />
        <CategoryCard
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="#A5B4FC"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>}
          iconBg="rgba(165,180,252,.14)"
          name="思考法"
          meta="22レッスン · 全レベル"
          progress="3/22"
          onClick={() => props.onOpenCategory('thinking')}
        />
        <CategoryCard
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="#C4B5FD"><circle cx="12" cy="12" r="4" /><circle cx="12" cy="12" r="9" fill="none" stroke="#C4B5FD" strokeWidth="2" strokeDasharray="4 3" /></svg>}
          iconBg="rgba(196,181,253,.14)"
          name="哲学・思考の原理"
          meta="5レッスン · 上級"
          progress="0/5"
          onClick={() => props.onOpenCategory('philosophy')}
        />
      </div>
    </div>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 13, color: v3.color.text2, fontWeight: 600, padding: '8px 4px 0', marginBottom: -6 }}>{children}</div>
}

function PathCard({ image, tag, name, meta, progress, done, total, accent, onClick }: { image: string; tag: string; name: string; meta: string; progress: number; done: number; total: number; accent: string; onClick: () => void }) {
  return (
    <div onClick={onClick} style={{ borderRadius: v3.radius.card, overflow: 'hidden', cursor: 'pointer', background: v3.color.card, boxShadow: v3.shadow.card }}>
      <div style={{ height: 140, overflow: 'hidden' }}>
        <img src={image} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </div>
      <div style={{ padding: '18px 20px' }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'rgba(255,255,255,.08)', borderRadius: v3.radius.pill, padding: '4px 10px', fontSize: 11, fontWeight: 600, color: v3.color.text2, marginBottom: 10 }}>{tag}</span>
        <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 6, lineHeight: 1.3 }}>{name}</div>
        <div style={{ fontSize: 12, color: v3.color.text2, fontWeight: 500, marginBottom: 14 }}>{meta}</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: v3.color.text2 }}>{done > 0 ? `${done} / ${total} 完了` : '未着手'}</span>
          <span style={{ fontSize: 12, fontWeight: 600, color: accent }}>{progress}%</span>
        </div>
        <div style={{ height: 5, background: v3.color.cardSoft, borderRadius: 99, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: accent, borderRadius: 99 }}></div>
        </div>
      </div>
    </div>
  )
}

function CategoryCard({ icon, iconBg, name, meta, progress, onClick }: { icon: React.ReactNode; iconBg: string; name: string; meta: string; progress: string; onClick: () => void }) {
  return (
    <div onClick={onClick} style={{ background: v3.color.card, borderRadius: v3.radius.card, padding: 14, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, boxShadow: v3.shadow.card }}>
      <div style={{ width: 48, height: 48, borderRadius: 14, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 3 }}>{name}</div>
        <div style={{ fontSize: 12, color: v3.color.text2, fontWeight: 500 }}>{meta}</div>
      </div>
      <div style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: 13, fontWeight: 700, color: v3.color.accent }}>{progress}</div>
    </div>
  )
}
