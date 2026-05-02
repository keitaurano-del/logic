/**
 * HomeScreenV3 - Logic v3 redesign (Responsive Design対応)
 * 仕様: docs/DESIGN_V3.md §3.1
 * モックアップ: lv3-home.html
 */
import { useMemo, useRef } from 'react'
import { getDailyFermi } from '../fermiData'
import { getStudyDates } from '../stats'
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
  onOpenCategory: (cat: string) => void
  onOpenRoadmap?: () => void
  onOpenAIGen: () => void
  onOpenRoleplay: () => void
  onOpenRank: () => void
  onOpenStats?: () => void
  onNavigateToDailyFermi?: () => void
  onOpenPlacementTest?: () => void
}

const IMG = '/images/v3'

export function HomeScreenV3(props: HomeScreenV3Props) {
  const { userName, onOpenLesson, onOpenAIGen, onOpenRoleplay, onNavigateToDailyFermi, onOpenPlacementTest } = props
  const dailyCardRef = useRef<HTMLDivElement>(null)
  const [showCoachmark, dismissCoachmark] = useShouldShowHomeCoachmark()
  const { width } = useWindowSize()
  const isTablet = width >= BREAKPOINTS.md
  const isLargeTablet = width >= BREAKPOINTS.lg

  // ランダムレッスン・フェルミ問題（マウント時に1回決定）
  const recommendedLesson = useRef(getRandomLesson()).current
  const dailyFermi = getDailyFermi()
  const fermiQuestion = dailyFermi.question


  // 今週カレンダー
  const todayDow = (new Date().getDay() + 6) % 7
  const weekDays = ['月', '火', '水', '木', '金', '土', '日']
  const studyDateSet = useMemo(() => new Set(getStudyDates()), [])
  const thisWeekDates = useMemo(() => {
    const today = new Date()
    const monday = new Date(today)
    monday.setDate(today.getDate() - todayDow)
    return weekDays.map((_, i) => {
      const d = new Date(monday)
      d.setDate(monday.getDate() + i)
      return d.toISOString().slice(0, 10)
    })
  }, [todayDow])
  const thisWeekStudied = thisWeekDates.filter(d => studyDateSet.has(d)).length

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
        <div ref={dailyCardRef} onClick={onNavigateToDailyFermi} style={{ background: 'linear-gradient(135deg, #1E2540 0%, #252C40 100%)', borderRadius: v3.radius.card, padding: '20px', cursor: 'pointer', position: 'relative', overflow: 'hidden', boxShadow: v3.shadow.hero, flexShrink: 0, minHeight: 180 }}>
          {/* フェルミ推定イメージ画像 */}
          <img src="/images/v3/fermi-card.png" alt="" loading="lazy" style={{ position: 'absolute', right: 0, top: 0, width: '55%', height: '100%', objectFit: 'cover', opacity: 0.28, pointerEvents: 'none', maskImage: 'linear-gradient(to left, rgba(0,0,0,0.8) 0%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,0.8) 0%, transparent 100%)' }} />
          <div style={{ position: 'absolute', right: -30, top: -30, width: 140, height: 140, borderRadius: '50%', background: 'rgba(108,142,245,0.25)', filter: 'blur(36px)', pointerEvents: 'none' }}></div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: v3.color.accent }}></div>
              <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: v3.color.accent }}>今日の1問</span>
            </div>
            <div style={{ fontFamily: "'Noto Sans JP', sans-serif", fontSize: 19, fontWeight: 700, color: v3.color.text, lineHeight: 1.4, letterSpacing: '-.005em', marginBottom: 8 }}>
              {fermiQuestion}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: v3.color.text2, fontSize: 14, fontWeight: 500, marginBottom: 16 }}>
              <span>毎日更新</span>
              <div style={{ width: 3, height: 3, borderRadius: '50%', background: v3.color.text3 }}></div>
              <span>+30 XP</span>
            </div>
            <div style={{ background: v3.color.accent, color: v3.color.bg, borderRadius: v3.radius.pill, padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, fontSize: 14, fontWeight: 700, boxShadow: v3.shadow.cta }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill={v3.color.bg}><polygon points="5 3 19 12 5 21 5 3" /></svg>
              チャレンジする
            </div>
          </div>
        </div>

        {/* Hero Recommend - ランダム表示 */}
        <div
          onClick={() => onOpenLesson(recommendedLesson.id)}
          style={{ background: v3.color.card, borderRadius: v3.radius.card, overflow: 'hidden', cursor: 'pointer', boxShadow: v3.shadow.card, flexShrink: 0 }}
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
            <div style={{ background: v3.color.accent, color: v3.color.bg, borderRadius: v3.radius.pill, padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, fontSize: 14, fontWeight: 700 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill={v3.color.bg}><polygon points="5 3 19 12 5 21 5 3" /></svg>
              レッスンをはじめる
            </div>
          </div>
        </div>



        {/* Week */}
        <div style={{ background: v3.color.card, borderRadius: v3.radius.card, padding: 18, flexShrink: 0, boxShadow: v3.shadow.card }}>
          <div style={{ fontSize: 14, color: v3.color.text2, fontWeight: 500, marginBottom: 14 }}>
            今週は <b style={{ color: v3.color.text, fontWeight: 700 }}>{thisWeekStudied}日</b> 学習しました
          </div>
          <div style={{ display: 'flex', gap: 6, justifyContent: 'space-between' }}>
            {weekDays.map((d, i) => {
              const studied = studyDateSet.has(thisWeekDates[i])
              const isToday = i === todayDow
              return (
                <div key={d} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, flex: 1 }}>
                  <span style={{ fontSize: 14, color: v3.color.text3, fontWeight: 500 }}>{d}</span>
                  <div style={{ width: 30, height: 30, borderRadius: '50%', background: studied ? v3.color.accent : v3.color.cardSoft, border: isToday && !studied ? `1.5px solid ${v3.color.accent}` : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: studied ? `0 0 10px ${v3.color.accentGlow}` : 'none' }}>
                    {studied && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={v3.color.bg} strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>}
                    {isToday && !studied && <div style={{ width: 6, height: 6, borderRadius: '50%', background: v3.color.accent, boxShadow: `0 0 6px ${v3.color.accentGlow}` }}></div>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* AI practice cards (large, vertical) */}
        <AILargeCard image={`${IMG}/home-daily-question.webp`} name="AIで自分だけの問題を作る" sub="テーマ別のオリジナル問題で練習" onClick={onOpenAIGen} beta />
        <AILargeCard image={`${IMG}/home-roleplay.webp`} name="ロールプレイ" sub="ビジネス・哲学のシナリオで対話練習" onClick={onOpenRoleplay} beta />

        {/* SCRUM-178: ベータ版注意バナー（偏差値ランキング堆導線を削除し置換） */}
        <div style={{ background: `${v3.color.warm}14`, border: `1px solid ${v3.color.warm}40`, borderRadius: v3.radius.card, padding: '14px 18px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ fontSize: 18, flexShrink: 0, lineHeight: 1 }}>⚠️</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: v3.color.warm, marginBottom: 4, letterSpacing: '.04em' }}>BETA版</div>
            <div style={{ fontSize: 14, color: v3.color.text2, lineHeight: 1.6 }}>一部機能は正常に動作しない場合があります。問題を見つけたらフィードバックを送ってね。</div>
          </div>
        </div>
      </div>

      {/* SCRUM-228: プレースメント誘導バナー（未完了の場合は常に表示） */}
      {!hasCompletedPlacement() && onOpenPlacementTest && (
        <div style={{ padding: '0 16px 16px' }}>
          <PlacementCard onTakeTest={onOpenPlacementTest} />
        </div>
      )}
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

function AILargeCard({ image, name, sub, onClick, beta }: { image: string; name: string; sub: string; onClick: () => void; beta?: boolean }) {
  return (
    <div onClick={onClick} style={{ background: v3.color.card, borderRadius: v3.radius.card, overflow: 'hidden', cursor: 'pointer', boxShadow: v3.shadow.card, flexShrink: 0, position: 'relative' }}>
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
    </div>
  )
}

