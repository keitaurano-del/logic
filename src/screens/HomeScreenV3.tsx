/**
 * HomeScreenV3 - Logic v3 redesign (Responsive Design対応)
 * 仕様: docs/DESIGN_V3.md §3.1
 * モックアップ: lv3-home.html
 */
import { useRef, useState } from 'react'
import { FERMI_POOL, getDailyFermiIndex } from '../fermiData'
import { getCardStats } from '../flashcardData'
import { getWrongAnswerStats } from '../wrongAnswerStore'
import { isPaid } from '../subscription'
import { HomeCoachmark, useShouldShowHomeCoachmark } from '../tutorial/coachmark'
import { PlacementCard } from '../tutorial/placementCard'
import { hasCompletedPlacement } from '../placementData'
import { useWindowSize, BREAKPOINTS } from '../hooks/useResponsive'
import { allLessons } from '../lessonData'
import { getStudyTimeMs, getStudyDates, localDateStr } from '../stats'
import { ClockIcon } from '../icons'
import { t } from '../i18n'

// フェルミ問題は fermiData.ts の FERMI_POOL を使用（日付ベース共通）

// おすすめレッスンリスト（ランダム表示用）
// title / category は lessonData から取得して ja/en 自動切り替え。
// level / image はレッスン本体に持っていないメタデータなのでここで保持する。
type RecommendedLessonMeta = { id: number; level: '初級' | '中級' | '上級'; image: string }
const RECOMMENDED_LESSON_META: RecommendedLessonMeta[] = [
  { id: 20, level: '初級', image: '/images/v3/lesson-20.png' },
  { id: 21, level: '初級', image: '/images/v3/lesson-21.png' },
  { id: 22, level: '初級', image: '/images/v3/lesson-22.png' },
  { id: 25, level: '初級', image: '/images/v3/lesson-25.png' },
  { id: 26, level: '初級', image: '/images/v3/lesson-26.png' },
  { id: 40, level: '初級', image: '/images/v3/lesson-40.png' },
  { id: 50, level: '中級', image: '/images/v3/lesson-50.png' },
  { id: 56, level: '初級', image: '/images/v3/lesson-56.png' },
  { id: 59, level: '初級', image: '/images/v3/lesson-59.png' },
  { id: 62, level: '中級', image: '/images/v3/lesson-62.png' },
  { id: 65, level: '中級', image: '/images/v3/lesson-65.png' },
  { id: 68, level: '中級', image: '/images/v3/lesson-68.png' },
  { id: 28, level: '中級', image: '/images/v3/lesson-28.png' },
  { id: 77, level: '上級', image: '/images/v3/lesson-77.png' },
  { id: 78, level: '上級', image: '/images/v3/lesson-78.png' },
  { id: 89, level: '中級', image: '/images/v3/lesson-89.png' },
  { id: 200, level: '中級', image: '/images/v3/lesson-200.png' },
  { id: 41, level: '中級', image: '/images/v3/lesson-41.png' },
  { id: 53, level: '中級', image: '/images/v3/lesson-53.png' },
  { id: 23, level: '初級', image: '/images/v3/lesson-23.png' },
  // 認知科学（cognitive-01 / cognitive-02）— ホームのおすすめにも露出させる
  // Hero Recommend は 1:1 表示なので、1024×1024 の lesson PNG を使う（course-*.png は 16:9）
  { id: 700, level: '中級', image: '/images/v3/lesson-700.png' },
  { id: 701, level: '中級', image: '/images/v3/lesson-701.png' },
  { id: 702, level: '中級', image: '/images/v3/lesson-702.png' },
  { id: 710, level: '中級', image: '/images/v3/lesson-710.png' },
  { id: 711, level: '中級', image: '/images/v3/lesson-711.png' },
  { id: 712, level: '中級', image: '/images/v3/lesson-712.png' },
]

const LEVEL_KEY: Record<string, string> = {
  '初級': 'roadmap.levelBeginner',
  '中級': 'roadmap.levelIntermediate',
  '上級': 'roadmap.levelAdvanced',
}

function getRandomLesson() {
  const meta = RECOMMENDED_LESSON_META[Math.floor(Math.random() * RECOMMENDED_LESSON_META.length)]
  const data = allLessons[meta.id]
  return {
    id: meta.id,
    title: data?.title ?? '',
    category: data?.category ?? '',
    level: t(LEVEL_KEY[meta.level] ?? meta.level),
    image: meta.image,
  }
}



// SCRUM-185: グリーティングメッセージ複数パターン (i18n 化)
const GREETING_MESSAGE_KEYS = [
  'home.greetingMsg1',
  'home.greetingMsg2',
  'home.greetingMsg3',
  'home.greetingMsg4',
  'home.greetingMsg5',
  'home.greetingMsg6',
  'home.greetingMsg7',
] as const

function getDailyGreeting(): string {
  const day = new Date().getDate()
  return t(GREETING_MESSAGE_KEYS[day % GREETING_MESSAGE_KEYS.length]).replace('\\n', '\n')
}


interface HomeScreenV3Props {
  userName: string
  onOpenLesson: (lessonId: number) => void
  onOpenCategory?: (cat: string) => void
  onOpenRoadmap?: () => void
  onOpenAIGen: () => void
  onOpenRank?: () => void
  onOpenStats?: () => void
  onNavigateToDailyFermi?: () => void
  onOpenPlacementTest?: () => void
  onOpenReviewHub?: () => void
  onOpenPricing?: () => void
  onOpenStudyTime?: () => void
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
  const { userName, onOpenLesson, onOpenAIGen, onNavigateToDailyFermi, onOpenPlacementTest, onOpenReviewHub, onOpenStudyTime, onOpenPricing: _onOpenPricing, onOpenCategory: _onOpenCategory, onOpenRank: _onOpenRank, onOpenStats: _onOpenStats, onOpenRoadmap: _onOpenRoadmap } = props
  const dailyCardRef = useRef<HTMLButtonElement>(null)
  const [showCoachmark, dismissCoachmark] = useShouldShowHomeCoachmark()
  const { width } = useWindowSize()
  const isTablet = width >= BREAKPOINTS.md
  const isLargeTablet = width >= BREAKPOINTS.lg

  // ランダムレッスン・フェルミ問題（マウント時に1回決定）
  const [recommendedLesson] = useState(getRandomLesson)
  const [fermiIndex, setFermiIndex] = useState<number>(readStoredFermiIndex)
  const fermiQuestion = FERMI_POOL[fermiIndex].question
  const cardStats = getCardStats()
  const wrongStats = getWrongAnswerStats()
  // 2026-05-15 単一有料プラン化:
  //   復習・誤答リストは無料解放。プラン昇格時の祝福トーストはここで判定する。
  const paid = isPaid()
  const showUpgradeToast = useUpgradeWelcomeToast(paid)

  const handleRerollFermi = () => {
    if (FERMI_POOL.length <= 1) return
    let next = Math.floor(Math.random() * FERMI_POOL.length)
    while (next === fermiIndex) next = Math.floor(Math.random() * FERMI_POOL.length)
    setFermiIndex(next)
    try { sessionStorage.setItem(HOME_FERMI_INDEX_KEY, String(next)) } catch { /* */ }
  }





  return (
    <>
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Noto Sans JP', sans-serif", color: 'var(--text-primary)' }}>
      {/* Navbar */}
      <div style={{ padding: 'calc(env(safe-area-inset-top, 44px) + 4px) 20px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: 24, fontWeight: 800, letterSpacing: '-.02em', color: 'var(--logo-color)' }}>
          Logic<span style={{ color: 'var(--brand)' }}>.</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* Streak display削除予定 */}
        </div>
      </div>

      {/* Scrollable content - Responsive */}
      <div style={{ flex: 1, padding: isTablet ? '0 24px 80px' : '0 16px 80px', display: 'flex', flexDirection: 'column', gap: 12, maxWidth: isLargeTablet ? 1200 : undefined, margin: isLargeTablet ? '0 auto' : undefined, width: '100%' }}>

        {/* Greeting */}
        <div style={{ padding: '4px 4px 8px' }}>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 4, fontWeight: 500 }}>{t('home.userGreeting', { name: userName || t('home.guestName') })}</div>
          <div style={{ fontSize: 20, fontWeight: 700, lineHeight: 1.4, letterSpacing: '-.005em' }}>{getDailyGreeting().split('\n').map((line, i) => i === 0 ? <span key={i}>{line}<br /></span> : <span key={i}>{line}</span>)}</div>
        </div>

        {/* 今日の1問 (Daily Fermi) */}
        {/* a11y: 外側 div は非インタラクティブ。中の「カード本体」と「別の問題」は兄弟の <button> として配置し、nested-interactive を回避 */}
        <div id="home-fermi-card" style={{ position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: '0 14px 32px rgba(108,142,245,.32)', flexShrink: 0 }}>
          <button
            type="button"
            ref={dailyCardRef}
            onClick={onNavigateToDailyFermi}
            aria-label={t('home.dailyOpenAria')}
            style={{ background: 'var(--brand-grad-h)', padding: '20px', cursor: 'pointer', position: 'relative', overflow: 'hidden', minHeight: 180, border: 'none', textAlign: 'left', color: 'inherit', font: 'inherit', display: 'block', width: '100%', borderRadius: 'inherit' }}
          >
            {/* フェルミ推定イメージ画像 */}
            <img src="/images/v3/fermi-card.png" alt="" loading="lazy" style={{ position: 'absolute', right: 0, top: 0, width: '55%', height: '100%', objectFit: 'cover', opacity: 0.18, pointerEvents: 'none', mixBlendMode: 'overlay', maskImage: 'linear-gradient(to left, rgba(0,0,0,0.8) 0%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,0.8) 0%, transparent 100%)' }} />
            <div style={{ position: 'absolute', right: -30, top: -30, width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.18)', filter: 'blur(36px)', pointerEvents: 'none' }}></div>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, paddingRight: 96 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'rgba(255,255,255,.85)' }}></div>
                <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'rgba(255,255,255,.92)' }}>{t('home.todayProblem')}</span>
              </div>
              <div style={{ fontFamily: "'Noto Sans JP', sans-serif", fontSize: 19, fontWeight: 700, color: 'var(--accent-fg)', lineHeight: 1.4, letterSpacing: '-.005em', marginBottom: 8 }}>
                {fermiQuestion}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'rgba(255,255,255,.82)', fontSize: 14, fontWeight: 500, marginBottom: 16 }}>
                <span>{t('home.dailyUpdate')}</span>
              </div>
              <div style={{ background: 'var(--accent-fg)', color: 'var(--brand)', borderRadius: 'var(--radius-pill)', padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, fontSize: 14, fontWeight: 700, boxShadow: '0 6px 18px rgba(0,0,0,.14)' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill={'var(--brand)'} aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                {t('home.dailyChallenge')}
              </div>
            </div>
          </button>
          {/* 別の問題ボタン (絶対配置・カード本体の兄弟) */}
          <button
            type="button"
            onClick={handleRerollFermi}
            aria-label={t('home.rerollAria')}
            style={{
              position: 'absolute',
              top: 16, right: 16,
              zIndex: 2,
              display: 'inline-flex', alignItems: 'center', gap: 4,
              background: 'rgba(255,255,255,0.18)',
              border: '1px solid rgba(255,255,255,0.28)',
              borderRadius: 99,
              padding: '5px 10px',
              color: 'var(--accent-fg)',
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
            {t('home.rerollShort')}
          </button>
        </div>

        {/* Hero Recommend - ランダム表示 */}
        <button
          type="button"
          onClick={() => onOpenLesson(recommendedLesson.id)}
          aria-label={`${recommendedLesson.category} ${recommendedLesson.level}: ${recommendedLesson.title}`}
          style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', cursor: 'pointer', boxShadow: 'var(--shadow-v3-card-inset)', flexShrink: 0, border: 'none', textAlign: 'left', color: 'inherit', font: 'inherit', display: 'block', width: '100%' }}
        >
          {/* 1:1 PNG (1024×1024) を切らずに表示するため aspectRatio:1/1 + objectFit:contain。
              背景は bg-card に揃えて letterbox 表示を自然に見せる。 */}
          <div style={{ aspectRatio: '1 / 1', position: 'relative', overflow: 'hidden', background: 'var(--bg-card)' }}>
            <img src={recommendedLesson.image} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
          </div>
          <div style={{ padding: '18px 20px 20px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'var(--accent-soft)', borderRadius: 'var(--radius-pill)', padding: '4px 11px', fontSize: 14, fontWeight: 600, color: 'var(--brand)', marginBottom: 10 }}>{recommendedLesson.category} · {recommendedLesson.level}</span>
            <div style={{ fontSize: 19, fontWeight: 700, marginBottom: 16, lineHeight: 1.35, letterSpacing: '-.005em' }}>{recommendedLesson.title}</div>
            <div style={{ background: 'var(--brand)', color: 'var(--accent-fg)', borderRadius: 'var(--radius-pill)', padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, fontSize: 14, fontWeight: 700 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3" /></svg>
              {t('home.lessonStart')}
            </div>
          </div>
        </button>



        {/* 診断カード（HeroRecommendの直下） */}
        {!hasCompletedPlacement() && onOpenPlacementTest && (
          <PlacementCard onTakeTest={onOpenPlacementTest} />
        )}

        {/* 復習カード - フラッシュカード + 過去の誤答リストへの導線（全プラン解放） */}
        {onOpenReviewHub && (
          <ReviewCard
            due={cardStats.due}
            weak={cardStats.weak}
            total={cardStats.total}
            unresolved={wrongStats.unresolved}
            onOpen={() => onOpenReviewHub?.()}
          />
        )}

        {/* 学習時間ミニカード — 今日の学習有無 + 累計学習時間を表示。タップで StudyTimeScreen へ */}
        {onOpenStudyTime && (
          <StudyTimeCard onOpen={onOpenStudyTime} />
        )}

        {/* AI practice cards (large, vertical) */}
        <AILargeCard image={`${IMG}/home-daily-question.png`} name={t('home.aiGenLargeName')} sub={t('home.aiGenLargeSub')} onClick={onOpenAIGen} />
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

    {/* 有料プラン昇格後の祝福トースト（初回のみ） */}
    {showUpgradeToast.visible && (
      <UpgradeWelcomeToast
        onClose={showUpgradeToast.dismiss}
        onCta={() => {
          showUpgradeToast.dismiss()
          onOpenAIGen()
        }}
      />
    )}
    </>
  )
}

// ─────────────────────────────────────────────────────────────────────
// 有料プランへ昇格したことを最初の HomeScreen 表示時に一度だけ祝福する。
// 判定キー: localStorage['logic-plan-upgrade-seen'] = '1'
// ─────────────────────────────────────────────────────────────────────
const UPGRADE_SEEN_KEY = 'logic-plan-upgrade-seen'
function shouldShowUpgradeToast(paid: boolean): boolean {
  if (!paid) return false
  try {
    if (localStorage.getItem(UPGRADE_SEEN_KEY) === '1') return false
  } catch { /* */ }
  return true
}
function useUpgradeWelcomeToast(paid: boolean): { visible: boolean; dismiss: () => void } {
  // 初期化時に判定するので、effect で setState する必要がない
  const [visible, setVisible] = useState(() => shouldShowUpgradeToast(paid))

  const dismiss = () => {
    try { localStorage.setItem(UPGRADE_SEEN_KEY, '1') } catch { /* */ }
    setVisible(false)
  }
  return { visible, dismiss }
}

function UpgradeWelcomeToast({ onClose, onCta }: { onClose: () => void; onCta: () => void }) {
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="upgrade-toast-title"
      style={{
        position: 'fixed', inset: 0, zIndex: 1100,
        background: 'rgba(0,0,0,0.55)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        padding: '0 0 calc(env(safe-area-inset-bottom, 0) + 24px)',
      }}
    >
      <button
        type="button"
        aria-label="閉じる"
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
      />
      <div style={{
        position: 'relative',
        width: 'min(100%, 480px)',
        background: 'var(--bg-card)',
        borderRadius: 20,
        padding: '24px 22px 22px',
        boxShadow: '0 12px 48px rgba(0,0,0,0.4)',
        border: `1px solid color-mix(in srgb, var(--brand) 28%, transparent)`,
      }}>
        <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--brand)', letterSpacing: '.12em', textTransform: 'uppercase', marginBottom: 6 }}>
          {t('pricing.welcomeToastTitle')}
        </div>
        <div style={{ fontSize: 15, color: 'var(--text-primary)', lineHeight: 1.7, marginBottom: 18 }}>
          {t('pricing.welcomeToastBody')}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="button"
            onClick={onClose}
            style={{
              flex: 1, padding: '13px 0', borderRadius: 12,
              border: `1px solid ${'var(--border)'}`, background: 'transparent',
              color: 'var(--text-secondary)', fontSize: 14, fontWeight: 700, cursor: 'pointer',
            }}
          >
            {t('common.complete')}
          </button>
          <button
            type="button"
            onClick={onCta}
            style={{
              flex: 1, padding: '13px 0', borderRadius: 12,
              border: 'none', background: 'var(--brand)', color: 'var(--accent-fg)',
              fontSize: 14, fontWeight: 800, cursor: 'pointer',
            }}
          >
            {t('pricing.welcomeToastCta')}
          </button>
        </div>
      </div>
    </div>
  )
}

function ReviewCard({ due, weak, total, unresolved, onOpen }: {
  due: number
  weak: number
  total: number
  unresolved: number
  onOpen: () => void
}) {
  const hasContent = total > 0 || unresolved > 0
  const headline = hasContent
    ? (due > 0
        ? t('home.reviewTodayCount', { n: String(due) })
        : unresolved > 0
          ? t('home.reviewUnresolvedCount', { n: String(unresolved) })
          : weak > 0
            ? t('home.reviewWeakCount', { n: String(weak) })
            : t('home.reviewAllDone'))
    : t('home.reviewEmptyHeadline')
  const sub = hasContent
    ? buildReviewSub(due, weak, total, unresolved)
    : t('home.reviewEmptySub')

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen() } }}
      style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        padding: '18px 20px',
        cursor: 'pointer',
        boxShadow: 'var(--shadow-v3-card-inset)',
        flexShrink: 0,
        position: 'relative',
        overflow: 'hidden',
        border: hasContent
          ? `1px solid ${'var(--accent-soft)'}`
          : '1px solid transparent',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{
          width: 44, height: 44, flexShrink: 0,
          borderRadius: 12,
          background: 'var(--accent-soft)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--brand)',
        }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 12a9 9 0 1 0 3-6.7" />
            <path d="M3 4v5h5" />
          </svg>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--brand)' }}>
              {t('home.reviewEyebrow')}
            </span>
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.35, marginBottom: 2 }}>{headline}</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500, lineHeight: 1.4 }}>{sub}</div>
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: 22, fontWeight: 400, lineHeight: 1, paddingLeft: 4 }}>›</div>
      </div>
    </div>
  )
}

// 学習時間ミニカード
// - 今日学習している場合: 「今日 N分 学習しました」 + 累計
// - 未学習の場合: 「今日まだ学習していません」 + 累計（累計が0なら「レッスンを開いて始めましょう」）
// データソース: getStudyTimeMs() (累計), getStudyDates() (今日学習したかの判定)
// タップで StudyTimeScreen に遷移する。デザインは ReviewCard と同じトーン（accent-soft アイコン + 矢印）。
function StudyTimeCard({ onOpen }: { onOpen: () => void }) {
  const totalMs = getStudyTimeMs()
  const dates = getStudyDates()
  const todayStr = localDateStr()
  const studiedToday = dates.includes(todayStr)
  const hasAnyStudy = totalMs > 0

  const totalLabel = formatStudyMs(totalMs)
  const headline = studiedToday
    ? t('home.studyTimeTodayHeadline', { time: totalLabel })
    : t('home.studyTimeStartHeadline')
  const sub = hasAnyStudy
    ? t('home.studyTimeTotalSub', { time: totalLabel })
    : t('home.studyTimeStartSub')

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={t('home.studyTimeCardAria')}
      onClick={onOpen}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onOpen() } }}
      style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        padding: '18px 20px',
        cursor: 'pointer',
        boxShadow: 'var(--shadow-v3-card-inset)',
        flexShrink: 0,
        position: 'relative',
        overflow: 'hidden',
        border: '1px solid transparent',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <div style={{
          width: 44, height: 44, flexShrink: 0,
          borderRadius: 12,
          background: 'var(--accent-soft)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'var(--brand)',
        }}>
          <ClockIcon width={22} height={22} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--brand)' }}>
              {t('home.studyTimeEyebrow')}
            </span>
          </div>
          <div style={{ fontSize: 16, fontWeight: 700, lineHeight: 1.35, marginBottom: 2 }}>{headline}</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500, lineHeight: 1.4 }}>{sub}</div>
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: 22, fontWeight: 400, lineHeight: 1, paddingLeft: 4 }}>›</div>
      </div>
    </div>
  )
}

// 学習時間 ms を翻訳済み文字列に整形（ja/en の数値表記差を i18n キーで吸収）
function formatStudyMs(ms: number): string {
  if (ms < 3600000) {
    const min = Math.max(0, Math.round(ms / 60000))
    return t('home.studyTimeFmtMin', { n: min })
  }
  const h = Math.floor(ms / 3600000)
  const m = Math.round((ms % 3600000) / 60000)
  return m > 0
    ? t('home.studyTimeFmtHourMin', { h, m })
    : t('home.studyTimeFmtHour', { h })
}

function buildReviewSub(due: number, weak: number, total: number, unresolved: number): string {
  const parts: string[] = []
  if (due > 0) parts.push(t('home.reviewSubDue', { n: String(due) }))
  if (weak > 0) parts.push(t('home.reviewSubWeak', { n: String(weak) }))
  if (unresolved > 0) parts.push(t('home.reviewSubWrong', { n: String(unresolved) }))
  if (parts.length === 0 && total > 0) return t('home.reviewSubAll', { total: String(total) })
  return parts.join(' · ')
}

function AILargeCard({ image, name, sub, onClick }: { image: string; name: string; sub: string; onClick: () => void }) {
  // 画像は 16:9 (1600x900) なので、aspectRatio で全体が表示されるようにする。
  // 高さ固定 (140px) + objectFit:cover だと左上の文字が縦方向に切られていた。
  return (
    <button type="button" onClick={onClick} aria-label={`${name}: ${sub}`} style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', cursor: 'pointer', boxShadow: 'var(--shadow-v3-card-inset)', flexShrink: 0, position: 'relative', border: 'none', textAlign: 'left', color: 'inherit', font: 'inherit', display: 'block', width: '100%', padding: 0 }}>
      <div style={{ width: '100%', aspectRatio: '16 / 9', overflow: 'hidden' }}>
        <img src={image} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', display: 'block' }} />
      </div>
      <div style={{ padding: '16px 18px 18px' }}>
        <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 4 }}>{name}</div>
        <div style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 500, lineHeight: 1.5 }}>{sub}</div>
      </div>
    </button>
  )
}

