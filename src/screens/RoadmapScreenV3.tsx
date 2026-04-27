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
  initialCategory?: string
  onBack?: () => void
}

export function RoadmapScreenV3(props: RoadmapScreenV3Props) {
  if (props.initialCategory) {
    return <CategoryDetailView category={props.initialCategory} onOpenLesson={props.onOpenLesson} onBack={props.onBack} />
  }
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
          image={`${IMG}/course-logical.webp`}
          onClick={() => props.onOpenCategory('logic')}
        />
        <CategoryCard
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill={v3.color.warm}><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2" fill="none" stroke={v3.color.warm} strokeWidth="2" /></svg>}
          iconBg="rgba(244,162,97,.14)"
          name="ケース面接"
          meta="4レッスン · 中〜上級"
          progress="1/4"
          image={`${IMG}/course-business.webp`}
          onClick={() => props.onOpenCategory('case')}
        />
        <CategoryCard
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="#A5B4FC"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>}
          iconBg="rgba(165,180,252,.14)"
          name="思考法"
          meta="22レッスン · 全レベル"
          progress="3/22"
          image={`${IMG}/course-thinking.webp`}
          onClick={() => props.onOpenCategory('thinking')}
        />
        <CategoryCard
          icon={<svg width="22" height="22" viewBox="0 0 24 24" fill="#C4B5FD"><circle cx="12" cy="12" r="4" /><circle cx="12" cy="12" r="9" fill="none" stroke="#C4B5FD" strokeWidth="2" strokeDasharray="4 3" /></svg>}
          iconBg="rgba(196,181,253,.14)"
          name="哲学・思考の原理"
          meta="5レッスン · 上級"
          progress="0/5"
          image={`${IMG}/course-philosophy.webp`}
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


import { getAllLessonsFlat } from '../lessonData'
import { getCompletedLessons } from '../stats'

const CATEGORY_ID_TO_NAMES: Record<string, string[]> = {
  logic: ['ロジカルシンキング', 'Logical Thinking'],
  case: ['ケース面接'],
  thinking: ['思考法', 'クリティカルシンキング', '仮説思考', '課題設定', 'デザインシンキング', 'ラテラルシンキング', 'アナロジー思考', 'システムシンキング'],
  philosophy: ['哲学・思考の原理', 'philosophy'],
  proposal: ['提案・伝える技術'],
  fermi: ['フェルミ推定'],
  critical: ['クリティカルシンキング'],
  hypothesis: ['仮説思考'],
}

const CATEGORY_LABEL_JP: Record<string, string> = {
  fermi: 'フェルミ推定',
  logic: 'ロジカルシンキング',
  case: 'ケース面接',
  thinking: '思考法',
  critical: 'クリティカルシンキング',
  pm: 'プロジェクト管理',
  'formal-logic': '論理学',
  hypothesis: '仮説思考',
  'problem-setting': '課題設定',
  'design-thinking': 'デザインシンキング',
  lateral: 'ラテラルシンキング',
  analogy: 'アナロジー思考',
  systems: 'システムシンキング',
  proposal: '提案・伝える技術',
  philosophy: '哲学・思考の原理',
}


function CategoryCard({ icon, iconBg, name, meta, progress, onClick, image }: { icon: React.ReactNode; iconBg: string; name: string; meta: string; progress: string; onClick: () => void; image?: string }) {
  return (
    <div onClick={onClick} style={{ background: v3.color.card, borderRadius: v3.radius.card, overflow: 'hidden', cursor: 'pointer', boxShadow: v3.shadow.card }}>
      {image && (
        <div style={{ height: 100, overflow: 'hidden' }}>
          <img src={image} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        </div>
      )}
      <div style={{ padding: 14, display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: v3.color.text, marginBottom: 3 }}>{name}</div>
          <div style={{ fontSize: 12, color: v3.color.text2, fontWeight: 500 }}>{meta}</div>
        </div>
        <div style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: 13, fontWeight: 700, color: v3.color.accent }}>{progress}</div>
      </div>
    </div>
  )
}

function CategoryDetailView({ category, onOpenLesson, onBack }: { category: string; onOpenLesson: (id: number) => void; onBack?: () => void }) {
  const flat = getAllLessonsFlat()
  const completed = new Set(getCompletedLessons())
  const candidates = CATEGORY_ID_TO_NAMES[category] || [CATEGORY_LABEL_JP[category] || category, category]
  const lessons = Object.values(flat).filter((l: any) => {
    if (!l) return false
    return candidates.includes(l.category)
  }).sort((a: any, b: any) => a.id - b.id)
  const label = CATEGORY_LABEL_JP[category] || category
  return (
    <div style={{ background: v3.color.bg, minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Noto Sans JP', sans-serif", color: v3.color.text }}>
      <div style={{ padding: 'calc(env(safe-area-inset-top, 44px) + 4px) 20px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <div onClick={onBack} style={{ width: 36, height: 36, borderRadius: '50%', background: v3.color.card, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={v3.color.accent} strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6" /></svg>
        </div>
        <div style={{ fontSize: 20, fontWeight: 700, color: v3.color.text }}>{label}</div>
      </div>
      <div style={{ flex: 1, padding: '16px 16px 100px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {lessons.length === 0 && (
          <div style={{ padding: 32, textAlign: 'center', color: v3.color.text2 }}>このカテゴリにはまだレッスンがありません。</div>
        )}
        {lessons.map((lesson: any) => {
          const isDone = completed.has(`lesson-${lesson.id}`)
          // カテゴリごとに画像をマッピング（既存 v3 画像を活用）
          // ID別個別画像マッピング
          const LESSON_IMG_MAP: Record<number, string> = {
            20: '/images/v3/lesson-20.webp', 21: '/images/v3/lesson-21.webp',
            22: '/images/v3/lesson-22.webp', 23: '/images/v3/lesson-23.webp',
            24: '/images/v3/lesson-24.webp', 25: '/images/v3/lesson-25.webp',
            26: '/images/v3/lesson-26.webp', 27: '/images/v3/lesson-27.webp',
            28: '/images/v3/lesson-28.webp', 29: '/images/v3/lesson-29.webp',
            35: '/images/v3/lesson-35.webp', 36: '/images/v3/lesson-36.webp',
            40: '/images/v3/lesson-40.webp', 41: '/images/v3/lesson-41.webp',
            42: '/images/v3/lesson-42.webp', 43: '/images/v3/lesson-43.webp',
            50: '/images/v3/lesson-50.webp', 51: '/images/v3/lesson-51.webp',
            52: '/images/v3/lesson-52.webp', 53: '/images/v3/lesson-53.webp',
            54: '/images/v3/lesson-54.webp', 55: '/images/v3/lesson-55.webp',
            56: '/images/v3/lesson-56.webp', 57: '/images/v3/lesson-57.webp',
            58: '/images/v3/lesson-58.webp', 59: '/images/v3/lesson-59.webp',
            60: '/images/v3/lesson-60.webp', 61: '/images/v3/lesson-61.webp',
            62: '/images/v3/lesson-62.webp', 63: '/images/v3/lesson-63.webp',
            64: '/images/v3/lesson-64.webp', 65: '/images/v3/lesson-65.webp',
            66: '/images/v3/lesson-66.webp', 67: '/images/v3/lesson-67.webp',
            68: '/images/v3/lesson-68.webp', 69: '/images/v3/lesson-69.webp',
            70: '/images/v3/lesson-70.webp', 71: '/images/v3/lesson-71.webp',
            72: '/images/v3/lesson-72.webp', 73: '/images/v3/lesson-73.webp',
            74: '/images/v3/lesson-74.webp', 75: '/images/v3/lesson-75.webp',
            76: '/images/v3/lesson-76.webp', 77: '/images/v3/lesson-77.webp',
          }
          const lessonImage = LESSON_IMG_MAP[lesson.id] ?? (() => {
            const cat = (lesson.category || '').toLowerCase()
            if (cat.includes('哲学') || cat === 'philosophy') return '/images/v3/course-philosophy.webp'
            if (cat.includes('ケース') || cat === 'business') return '/images/v3/course-business.webp'
            if (cat.includes('ロジカル') || cat.includes('logical')) return '/images/v3/hero-deduction.webp'
            return '/images/v3/course-thinking.webp'
          })()
          return (
            <div key={lesson.id} onClick={() => onOpenLesson(lesson.id)} style={{ background: v3.color.card, borderRadius: 16, padding: 0, cursor: 'pointer', display: 'flex', alignItems: 'stretch', gap: 0, overflow: 'hidden' }}>
              {/* サムネイル画像 */}
              <div style={{ width: 88, flexShrink: 0, position: 'relative', background: '#0F2C2B' }}>
                <img src={lessonImage} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(8,33,33,0) 60%, rgba(26,58,57,.7) 100%)' }} />
              </div>
              <div style={{ padding: '14px 14px 14px 14px', display: 'flex', alignItems: 'center', gap: 12, flex: 1, minWidth: 0 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', border: `1.5px solid ${isDone ? v3.color.accent : v3.color.text3}`, background: isDone ? v3.color.accent : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {isDone && <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={v3.color.bg} strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: v3.color.text, marginBottom: 3, lineHeight: 1.4 }}>{lesson.title}</div>
                  <div style={{ fontSize: 12, color: v3.color.text2, fontWeight: 500 }}>{lesson.steps?.length ?? 0}ステップ · {lesson.difficulty || '初級'}</div>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={v3.color.text3} strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
