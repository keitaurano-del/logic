/**
 * HomeScreenV3 - Logic v3 redesign (Responsive Design対応)
 * 仕様: docs/DESIGN_V3.md §3.1
 * モックアップ: lv3-home.html
 */
import { useRef, useState } from 'react'
import { FERMI_POOL, getDailyFermiIndex } from '../fermiData'
import { getCardStats } from '../flashcardData'
import { v3 } from '../styles/tokensV3'
import { HomeCoachmark, useShouldShowHomeCoachmark } from '../tutorial/coachmark'
import { PlacementCard } from '../tutorial/placementCard'
import { hasCompletedPlacement } from '../placementData'
import { useWindowSize, BREAKPOINTS } from '../hooks/useResponsive'

// フェルミ問題は fermiData.ts の FERMI_POOL を使用（日付ベース共通）

// おすすめレッスンリスト（ランダム表示用）
const RECOMMENDED_LESSONS = [
  { id: 20, title: 'MECE — 漏れなくダブりなく', category: 'ロジカルシンキング', level: '初級', image: '/images/v3/hero-deduction.webp' },
  { id: 21, title: 'ロジックツリー — 問題を分解する', category: 'ロジカルシンキング', level: '初級', image: '/images/v3/course-logical.webp' },
  { id: 22, title: 'So What / Why So — 論理の検証', category: 'ロジカルシンキング', level: '初級', image: '/images/v3/course-logical.webp' },
  { id: 25, title: '演繹法 — 一般から個別を導く', category: 'ロジカルシンキング', level: '初級', image: '/images/v3/hero-deduction.webp' },
  { id: 26, title: '帰納法 — 個別事例から法則を見つける', category: 'ロジカルシンキング', level: '初級', image: '/images/v3/hero-deduction.webp' },
  { id: 40, title: 'クリティカルシンキング入門', category: 'クリティカルシンキング', level: '初級', image: '/images/v3/course-thinking.webp' },
  { id: 50, title: '仮説思考入門 — 考えてから調べる', category: '仮説思考', level: '中級', image: '/images/v3/course-thinking.webp' },
  { id: 56, title: 'デザインシンキング入門', category: 'デザインシンキング', level: '初級', image: '/images/v3/course-thinking.webp' },
  { id: 59, title: 'ラテラルシンキング入門', category: 'ラテラルシンキング', level: '初級', image: '/images/v3/course-thinking.webp' },
  { id: 62, title: 'アナロジー思考入門 — 類推で考える', category: 'アナロジー思考', level: '中級', image: '/images/v3/course-thinking.webp' },
  { id: 65, title: 'システムシンキング入門 — 全体を見る', category: 'システムシンキング', level: '中級', image: '/images/v3/course-thinking.webp' },
  { id: 68, title: '具体と抽象 — 思考の行き来を自在にする', category: 'ロジカルシンキング', level: '中級', image: '/images/v3/course-logical.webp' },
  { id: 28, title: 'ケース面接入門', category: 'ケース面接', level: '中級', image: '/images/v3/course-business.webp' },
  { id: 77, title: 'ソクラテスの問答法', category: '哲学・思考の原理', level: '上級', image: '/images/v3/course-philosophy.webp' },
  { id: 78, title: '反証可能性 — 科学と疑似科学の境界', category: '哲学・思考の原理', level: '上級', image: '/images/v3/course-philosophy.webp' },
  { id: 89, title: '大きい数字の捉え方・概算力', category: 'クライアントワーク', level: '中級', image: '/images/v3/course-client.webp' },
  { id: 200, title: 'フェルミ推定とは何か', category: 'フェルミ推定', level: '中級', image: '/images/v3/fermi-card.png' },
  { id: 41, title: '論理的誤謬を見破る', category: 'クリティカルシンキング', level: '中級', image: '/images/v3/course-thinking.webp' },
  { id: 53, title: '課題設定入門 — 正しい問いを立てる', category: '課題設定', level: '中級', image: '/images/v3/course-thinking.webp' },
  { id: 23, title: 'ピラミッド原則 — 伝わる話し方', category: 'ロジカルシンキング', level: '初級', image: '/images/v3/course-logical.webp' },
]

function getRandomLesson() {
  return RECOMMENDED_LESSONS[Math.floor(Math.random() * RECOMMENDED_LESSONS.length)]
}



// SCRUM-185: グリーティングメッセージ複数パターン
const GREETING_MESSAGES = [
  '今日も論理を、\nひとつ深めましょう。',
  '思考の筋肉を、\n今日も鍛えよう。',
  'ひとつの問いが、\n思考を変える。',
  '考える力は、\n毎日の積み重ね。',
  '今日の1問が、\n明日の洞察になる。',
  '論理的思考は、\n習慣から生まれる。',
  '問い続けることが、\n答えへの道。',
]

function getDailyGreeting(): string {
  const day = new Date().getDate()
  return GREETING_MESSAGES[day % GREETING_MESSAGES.length].replace('\\n', '\n')
}


interface HomeScreenV3Props {
  userName: string
  onOpenLesson: (lessonId: number) => void
  onOpenCategory?: (cat: string) => void
  onOpenRoadmap?: () => void
  onOpenAIGen: () => void
  onOpenRoleplay: () => void
  onOpenRank?: () => void
  onOpenStats?: () => void
  onNavigateToDailyFermi?: () => void
  onOpenPlacementTest?: () => void
  onOpenFlashcards?: (mode?: 'due' | 'weak') => void
}

const IMG = '/images/v3'

const HOME_FERMI_INDEX_KEY = 'home-fermi-index'

function readStoredFermiIndex(): number {
  try {
    const raw = sessionStorage.getItem(HOME_FERMI_INDEX_KEY)
    if (raw != null) {
      const n = parseInt(raw, 10)
      if (Number.isFinite(n) && n >= 0 && n < FERMI_POOL.length) return n
    }
  } catch { /* */ }
  return getDailyFermiIndex()
}

export function HomeScreenV3(props: HomeScreenV3Props) {
  const { userName, onOpenLesson, onOpenAIGen, onOpenRoleplay, onNavigateToDailyFermi, onOpenPlacementTest, onOpenFlashcards, onOpenCategory: _onOpenCategory, onOpenRank: _onOpenRank, onOpenStats: _onOpenStats, onOpenRoadmap: _onOpenRoadmap } = props
  const dailyCardRef = useRef<HTMLDivElement>(null)
  const [showCoachmark, dismissCoachmark] = useShouldShowHomeCoachmark()
  const { width } = useWindowSize()
  const isTablet = width >= BREAKPOINTS.md
  const isLargeTablet = width >= BREAKPOINTS.lg

  // ランダムレッスン・フェルミ問題（マウント時に1回決定）
  const [recommendedLesson] = useState(getRandomLesson)
  const [fermiIndex, setFermiIndex] = useState<number>(readStoredFermiIndex)
  const fermiQuestion = FERMI_POOL[fermiIndex].question
  const cardStats = getCardStats()

  const handleRerollFermi = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (FERMI_POOL.length <= 1) return
    let next = Math.floor(Math.random() * FERMI_POOL.length)
    while (next === fermiIndex) next = Math.floor(Math.random() * FERMI_POOL.length)
    setFermiIndex(next)
    try { sessionStorage.setItem(HOME_FERMI_INDEX_KEY, String(next)) } catch { /* */ }
  }





  return (
    <>
    <div style={{ background: v3.color.bg, minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Noto Sans JP', sans-serif", color: v3.color.text }}>
      {/* Navbar */}
      <div style={{ padding: 'calc(env(safe-area-inset-top, 44px) + 4px) 20px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: v3.font.logo.family, fontSize: v3.font.logo.size, fontWeight: v3.font.logo.weight, letterSpacing: '-.02em' }}>
          Logic<span style={{ color: v3.color.accent }}>.</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Streak display削除予定 */}
        </div>
      </div>

      {/* Scrollable content - Responsive */}
      <div style={{ flex: 1, padding: isTablet ? '0 24px 80px' : '0 16px 80px', display: 'flex', flexDirection: 'column', gap: 12, maxWidth: isLargeTablet ? 1200 : undefined, margin: isLargeTablet ? '0 auto' : undefined, width: '100%' }}>

        {/* Greeting */}
        <div style={{ padding: '4px 4px 8px' }}>
          <div style={{ fontSize: 14, color: v3.color.text2, marginBottom: 4, fontWeight: 500 }}>こんにちは、{userName || 'ゲスト'} さん</div>
          <div style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.4, letterSpacing: '-.005em' }}>{getDailyGreeting().split('\n').map((line, i) => i === 0 ? <span key={i}>{line}<br /></span> : <span key={i}>{line}</span>)}</div>
        </div>

        {/* 今日の1問 (Daily Fermi) */}
        <div
          ref={dailyCardRef}
          role="button"
          tabIndex={0}
          onClick={onNavigateToDailyFermi}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onNavigateToDailyFermi?.() } }}
          aria-label="今日の1問を解く"
          style={{ background: 'linear-gradient(135deg, #6C8EF5 0%, #5478E8 100%)', borderRadius: v3.radius.card, padding: '20px', cursor: 'pointer', position: 'relative', overflow: 'hidden', boxShadow: '0 14px 32px rgba(108,142,245,.32)', flexShrink: 0, minHeight: 180 }}
        >
          {/* フェルミ推定イメージ画像 */}
          <img src="/images/v3/fermi-card.png" alt="" loading="lazy" style={{ position: 'absolute', right: 0, top: 0, width: '55%', height: '100%', objectFit: 'cover', opacity: 0.18, pointerEvents: 'none', mixBlendMode: 'overlay', maskImage: 'linear-gradient(to left, rgba(0,0,0,0.8) 0%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,0.8) 0%, transparent 100%)' }} />
          <div style={{ position: 'absolute', right: -30, top: -30, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.18)', filter: 'blur(36px)', pointerEvents: 'none' }}></div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,.85)' }}></div>
                <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,.92)' }}>今日の1問</span>
              </div>
              <button
                type="button"
                onClick={handleRerollFermi}
                aria-label="別の問題を選ぶ"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  background: 'rgba(255,255,255,0.18)',
                  border: '1px solid rgba(255,255,255,0.28)',
                  borderRadius: 99,
                  padding: '5px 10px',
                  color: '#FFFFFF',
                  fontSize: 11, fontWeight: 700, letterSpacing: '.02em',
                  cursor: 'pointer',
                  fontFamily: 'inherit',
                  backdropFilter: 'blur(4px)',
                }}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                  <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                  <path d="M21 3v5h-5"/>
                  <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                  <path d="M8 16H3v5"/>
                </svg>
                別の問題
              </button>
            </div>
            <div style={{ fontFamily: "'Noto Sans JP', sans-serif", fontSize: 19, fontWeight: 700, color: '#FFFFFF', lineHeight: 1.4, letterSpacing: '-.005em', marginBottom: 8 }}>
              {fermiQuestion}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,.82)', fontSize: 14, fontWeight: 500, marginBottom: 16 }}>
              <span>毎日更新</span>
              <div style={{ width: 3, height: 3, borderRadius: '50%', background: 'rgba(255,255,255,.45)' }}></div>
              <span>+30 XP</span>
            </div>
            <div style={{ background: '#FFFFFF', color: v3.color.accent, borderRadius: v3.radius.pill, padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, fontSize: 14, fontWeight: 700, boxShadow: '0 6px 18px rgba(0,0,0,.14)' }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill={v3.color.accent} aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3" /></svg>
              チャレンジする
            </div>
          </div>
        </div>

        {/* Hero Recommend - ランダム表示 */}
        <button
          type="button"
          onClick={() => onOpenLesson(recommendedLesson.id)}
          aria-label={`${recommendedLesson.category} ${recommendedLesson.level}: ${recommendedLesson.title}`}
          style={{ background: v3.color.card, borderRadius: v3.radius.card, overflow: 'hidden', cursor: 'pointer', boxShadow: v3.shadow.card, flexShrink: 0, border: 'none', textAlign: 'left', color: 'inherit', font: 'inherit', display: 'block', width: '100%' }}
        >
          <div style={{ height: 160, position: 'relative', overflow: 'hidden' }}>
            <img src={recommendedLesson.image} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
          <div style={{ padding: '18px 20px 20px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: v3.color.accentSoft, borderRadius: v3.radius.pill, padding: '4px 11px', fontSize: 14, fontWeight: 600, color: v3.color.accent, marginBottom: 10 }}>{recommendedLesson.category} · {recommendedLesson.level}</span>
            <div style={{ fontSize: 19, fontWeight: 700, marginBottom: 6, lineHeight: 1.35, letterSpacing: '-.005em' }}>{recommendedLesson.title}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: v3.color.text2, fontSize: 14, fontWeight: 500, marginBottom: 16 }}>
              <span>+50 XP</span>
            </div>
            <div style={{ background: v3.color.accent, color: '#FFFFFF', borderRadius: v3.radius.pill, padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, fontSize: 14, fontWeight: 700 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="#FFFFFF" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3" /></svg>
              レッスンをはじめる
            </div>
          </div>
        </button>



        {/* 診断カード（HeroRecommendの直下） */}
        {!hasCompletedPlacement() && onOpenPlacementTest && (
          <PlacementCard onTakeTest={onOpenPlacementTest} />
        )}

        {/* 復習カード - 過去に学んだ内容と間違えた問題を重点復習 */}
        {onOpenFlashcards && cardStats.total > 0 && (
          <ReviewCard
            due={cardStats.due}
            weak={cardStats.weak}
            total={cardStats.total}
            onOpen={(mode) => onOpenFlashcards(mode)}
          />
        )}

        {/* AI practice cards (large, vertical) */}
        <AILargeCard image={`${IMG}/home-daily-question.webp`} name="AIで自分だけの問題を作る" sub="テーマ別のオリジナル問題で練習" onClick={onOpenAIGen} beta />
        <AILargeCard image={`${IMG}/home-roleplay.webp`} name="ロールプレイ" sub="ビジネス・哲学のシナリオで対話練習" onClick={onOpenRoleplay} beta />
      </div>


    </div>

    {/* ホームコーチマーク（初回のみ・オーバーレイ） */}
    {showCoachmark && (
      <HomeCoachmark
        targetRef={dailyCardRef}
        onDismiss={() => {
          dismissCoachmark()
          onNavigateToDailyFermi?.()
        }}
      />
    )}
    </>
  )
}

function ReviewCard({ due, weak, total, onOpen }: { due: number; weak: number; total: number; onOpen: (mode?: 'due' | 'weak') => void }) {
  const hasDue = due > 0
  const hasWeak = weak > 0
  const primaryMode: 'due' | 'weak' = hasDue ? 'due' : 'weak'
  const headline = hasDue
    ? `今日の復習 ${due}枚`
    : hasWeak
      ? `弱点の復習 ${weak}枚`
      : 'すべて完了'
  const sub = hasDue
    ? hasWeak
      ? `うち弱点 ${weak}枚 · 全${total}枚`
      : `全${total}枚`
    : hasWeak
      ? `間違えた問題を重点的に学び直そう`
      : `また明日カードを追加しましょう`

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen(primaryMode)}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen(primaryMode) } }}
      style={{
        background: v3.color.card,
        borderRadius: v3.radius.card,
        padding: '18px 20px',
        cursor: 'pointer',
        boxShadow: v3.shadow.card,
        flexShrink: 0,
        position: 'relative',
        overflow: 'hidden',
        border: hasDue || hasWeak ? `1px solid ${v3.color.accentSoft}` : '1px solid transparent',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{
          width: 44, height: 44, flexShrink: 0,
          borderRadius: 12,
          background: v3.color.accentSoft,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: v3.color.accent,
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 12a9 9 0 1 0 3-6.7" />
            <path d="M3 4v5h5" />
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: v3.color.accent }}>復習</span>
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.35, marginBottom: 2 }}>{headline}</div>
          <div style={{ fontSize: 13, color: v3.color.text2, fontWeight: 500, lineHeight: 1.4 }}>{sub}</div>
        </div>
        <div style={{ color: v3.color.text3, fontSize: 22, fontWeight: 400, lineHeight: 1, paddingLeft: 4 }}>›</div>
      </div>

      {hasDue && hasWeak && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onOpen('weak') }}
          style={{
            marginTop: 12,
            width: '100%',
            background: 'transparent',
            border: `1px solid ${v3.color.line}`,
            borderRadius: v3.radius.pill,
            padding: '10px 14px',
            color: v3.color.text,
            fontSize: 14,
            fontWeight: 600,
            cursor: 'pointer',
            fontFamily: "'Noto Sans JP', sans-serif",
          }}
        >
          弱点だけ復習する（{weak}枚）
        </button>
      )}
    </div>
  )
}

function AILargeCard({ image, name, sub, onClick, beta }: { image: string; name: string; sub: string; onClick: () => void; beta?: boolean }) {
  return (
    <button type="button" onClick={onClick} aria-label={`${name}: ${sub}`} style={{ background: v3.color.card, borderRadius: v3.radius.card, overflow: 'hidden', cursor: 'pointer', boxShadow: v3.shadow.card, flexShrink: 0, position: 'relative', border: 'none', textAlign: 'left', color: 'inherit', font: 'inherit', display: 'block', width: '100%', padding: 0 }}>
      <div style={{ height: 140, overflow: 'hidden' }}>
        <img src={image} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </div>
      {beta && (
        <div style={{
          position: 'absolute', top: 10, left: 10,
          background: 'rgba(0,0,0,.55)', backdropFilter: 'blur(4px)',
          borderRadius: 20, padding: '3px 9px',
          fontSize: 14, fontWeight: 700, color: v3.color.accent,
          letterSpacing: '.08em', textTransform: 'uppercase',
        }}>BETA</div>
      )}
      <div style={{ padding: '16px 18px 18px' }}>
        <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>{name}</div>
        <div style={{ fontSize: 14, color: v3.color.text2, fontWeight: 500, lineHeight: 1.5 }}>{sub}</div>
        {beta && (
          <div style={{ marginTop: 10, fontSize: 14, color: v3.color.warm, background: `${v3.color.warm}14`, borderRadius: 8, padding: '6px 10px', lineHeight: 1.5 }}>
            ベータ版のため、一部機能は正常に動作しない場合があります
          </div>
        )}
      </div>
    </button>
  )
}

