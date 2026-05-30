/**
 * HomeScreenV3 - Logic v3 redesign (Responsive Design対応)
 * 仕様: docs/DESIGN_V3.md §3.1
 * モックアップ: lv3-home.html
 */
import { useRef, useState } from 'react'
import { FERMI_POOL } from '../fermiData'
import { getDailyFermiDoneIndexes, getHomeFermiIndex, setHomeFermiIndex } from './dailyFermiState'
import { getCardStats } from '../flashcardData'
import { getWrongAnswerStats } from '../wrongAnswerStore'
import { isPaid } from '../subscription'
import { HomeCoachmark, useShouldShowHomeCoachmark } from '../tutorial/coachmark'
import { tutorial } from '../tutorial/tutorialStorage'
import { loadPlacementResult, skipPlacement, buildPersonalCourse, recommendedLessons, type PlacementResult } from '../placementData'
import { useWindowSize, BREAKPOINTS } from '../hooks/useResponsive'
import { allLessons } from '../lessonData'
import { getStudyTimeMs, getStudyDates, localDateStr } from '../stats'
import { ClockIcon } from '../icons'
import { TrialEndingBanner } from '../components/TrialStatus'
import { shouldShowTrialEndingBanner } from '../trialStatus'
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

// id → メタ（level / image）の逆引き。診断のおすすめレッスンが META に無い場合も
// lesson PNG のパス規約 `/images/v3/lesson-{id}.png` でフォールバックする。
const META_BY_ID: Record<number, RecommendedLessonMeta> = Object.fromEntries(
  RECOMMENDED_LESSON_META.map(m => [m.id, m]),
)

type HeroLesson = { id: number; title: string; category: string; level: string; image: string }

function buildHeroLesson(id: number): HeroLesson {
  const data = allLessons[id]
  const meta = META_BY_ID[id]
  return {
    id,
    title: data?.title ?? '',
    category: data?.category ?? '',
    level: meta ? t(LEVEL_KEY[meta.level] ?? meta.level) : '',
    image: meta?.image ?? `${IMG}/lesson-${id}.png`,
  }
}

function getRandomLesson(): HeroLesson {
  const meta = RECOMMENDED_LESSON_META[Math.floor(Math.random() * RECOMMENDED_LESSON_META.length)]
  return buildHeroLesson(meta.id)
}

// 日替わりローテ用の擬似乱数シード（その日の日付＋件数で安定的に index を回す）。
// 弱点上位 N のレッスンを毎日ローテし、再訪 Hero が毎回同じになる単調化を避ける。
function dailyRotateIndex(len: number): number {
  if (len <= 0) return 0
  const d = new Date()
  const seed = d.getFullYear() * 372 + d.getMonth() * 31 + d.getDate()
  return seed % len
}

// 再訪／スキップ済みユーザーの Hero に出すおすすめレッスンを決める。
//  - 診断済み（totalCount>0）: recommendedLessonIds（弱点上位順）を日替わりでローテ。
//    空なら buildPersonalCourse の先頭にフォールバック。
//  - スキップ済み（totalCount===0）: recommendedLessons(50) の中庸推薦を日替わりローテ。
function resolveHeroLesson(result: PlacementResult | null): HeroLesson {
  if (result && result.totalCount > 0) {
    const ids = result.recommendedLessonIds.length > 0
      ? result.recommendedLessonIds
      : buildPersonalCourse(result.axisScores, result.deviation).lessonIds
    if (ids.length > 0) {
      const id = ids[dailyRotateIndex(ids.length)]
      const hero = buildHeroLesson(id)
      // タイトルが解決できない（未知ID）場合はランダム中庸推薦へ退避
      if (hero.title) return hero
    }
    return getRandomLesson()
  }
  // スキップ済み or まだ Hero を出す段階（中庸推薦の日替わりローテ）
  const fallbackIds = recommendedLessons(50)
  const id = fallbackIds[dailyRotateIndex(fallbackIds.length)]
  const hero = buildHeroLesson(id)
  return hero.title ? hero : getRandomLesson()
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
  isLoggedIn?: boolean
}

const IMG = '/images/v3'

export function HomeScreenV3(props: HomeScreenV3Props) {
  const { userName, onOpenLesson, onOpenAIGen, onNavigateToDailyFermi, onOpenPlacementTest, onOpenReviewHub, onOpenStudyTime, onOpenPricing, isLoggedIn = false, onOpenCategory: _onOpenCategory, onOpenRank: _onOpenRank, onOpenStats: _onOpenStats, onOpenRoadmap: _onOpenRoadmap } = props
  const dailyCardRef = useRef<HTMLButtonElement>(null)
  const placementHeroRef = useRef<HTMLButtonElement>(null)
  const [showCoachmark, dismissCoachmark] = useShouldShowHomeCoachmark()
  const { width } = useWindowSize()
  const isTablet = width >= BREAKPOINTS.md
  const isLargeTablet = width >= BREAKPOINTS.lg

  // ── DF-F16 案A: ホームを「診断 → おすすめ」の2モードで出し分ける ──
  // モード判定（マウント時に1回確定）:
  //   - placementResult === null            … 真の初回（診断も未スキップ）→ 診断ヒーロー単一化
  //   - totalCount > 0                       … 診断済み → おすすめ Hero（弱点上位ローテ）
  //   - totalCount === 0（skipPlacement 済み）… スキップ済み → 中庸推薦 Hero
  const [placementResult] = useState<PlacementResult | null>(loadPlacementResult)
  // 真の初回（診断ヒーローを唯一の大型 CTA に昇格）か。スキップ済みは Hero 側へ寄せる。
  const showPlacementHero = placementResult === null && !!onOpenPlacementTest
  const [placementHeroDismissed, setPlacementHeroDismissed] = useState(false)
  const handleSkipPlacementHero = () => {
    // totalCount===0 を永続化（中庸推薦モード）。これで再起動後も診断ヒーローが復活しない。
    skipPlacement()
    tutorial.markPlacementDismissed()
    setPlacementHeroDismissed(true)
  }

  // Hero のおすすめレッスン（マウント時に1回決定）。診断済み/スキップ済みでのみ使う。
  const [recommendedLesson] = useState<HeroLesson>(() => resolveHeroLesson(placementResult))
  // fermiIndex は null の場合「今日の問題を全部解いた」状態。
  // getHomeFermiIndex() は dailyFermiState.ts の単一の真実源。決定した index を
  // 共有 session キーへ永続化するので、タップ後の Daily 画面と必ず同じ問題になる。
  const [fermiIndex, setFermiIndex] = useState<number | null>(getHomeFermiIndex)
  const fermiQuestion = fermiIndex != null ? FERMI_POOL[fermiIndex].question : ''
  const allFermiDone = fermiIndex == null
  const cardStats = getCardStats()
  const wrongStats = getWrongAnswerStats()
  // 2026-05-15 単一有料プラン化:
  //   復習・誤答リストは無料解放。プラン昇格時の祝福トーストはここで判定する。
  const paid = isPaid()
  const showUpgradeToast = useUpgradeWelcomeToast(paid)

  const handleRerollFermi = () => {
    if (FERMI_POOL.length <= 1) return
    // 未完了の問題プールから選ぶ（完了済みは除外）。
    const done = new Set(getDailyFermiDoneIndexes())
    const available: number[] = []
    for (let i = 0; i < FERMI_POOL.length; i++) {
      if (!done.has(i) && i !== fermiIndex) available.push(i)
    }
    if (available.length === 0) return
    const next = available[Math.floor(Math.random() * available.length)]
    setFermiIndex(next)
    // 共有 session キーへ書く（Daily 画面が同じ問題を開くため）
    setHomeFermiIndex(next)
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

        {/* DF-F11: トライアル終了間際バナー（残り2日以下）。グリーティング直下に控えめに表示。 */}
        {shouldShowTrialEndingBanner(isLoggedIn) && <TrialEndingBanner onUpgrade={onOpenPricing} />}

        {/* DF-F16: 初回ユーザーは「実力診断」を画面最上段の唯一の大型ヒーロー CTA に昇格。
            視線を診断1点に集約するため、今日の1問・復習・学習時間・AI はこの下に従属配置する。 */}
        {showPlacementHero && !placementHeroDismissed && onOpenPlacementTest && (
          <PlacementHero
            heroRef={placementHeroRef}
            onTakeTest={onOpenPlacementTest}
            onSkip={handleSkipPlacementHero}
          />
        )}

        {/* 今日の1問 (Daily Fermi) */}
        {/* a11y: 外側 div は非インタラクティブ。中の「カード本体」と「別の問題」は兄弟の <button> として配置し、nested-interactive を回避 */}
        <div id="home-fermi-card" style={{ position: 'relative', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: '0 12px 28px color-mix(in srgb, var(--accent) 24%, transparent)', flexShrink: 0 }}>
          <button
            type="button"
            ref={dailyCardRef}
            onClick={onNavigateToDailyFermi}
            aria-label={allFermiDone ? t('home.allFermiDoneTitle') : t('home.dailyOpenAria')}
            style={{ background: 'var(--accent-btn)', padding: '20px', cursor: 'pointer', position: 'relative', overflow: 'hidden', minHeight: 180, border: 'none', textAlign: 'left', color: 'inherit', font: 'inherit', display: 'block', width: '100%', borderRadius: 'inherit' }}
          >
            {/* フェルミ推定イメージ画像 */}
            <img src="/images/v3/fermi-card.png" alt="" loading="lazy" style={{ position: 'absolute', right: 0, top: 0, width: '55%', height: '100%', objectFit: 'cover', opacity: 0.14, pointerEvents: 'none', maskImage: 'linear-gradient(to left, rgba(0,0,0,0.8) 0%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,0.8) 0%, transparent 100%)' }} />
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, paddingRight: 96 }}>
                <span style={{ fontSize: 14, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'color-mix(in srgb, var(--accent-btn-fg) 92%, transparent)' }}>{t('home.todayProblem')}</span>
              </div>
              <div style={{ fontFamily: "'Noto Sans JP', sans-serif", fontSize: 19, fontWeight: 700, color: 'var(--accent-btn-fg)', lineHeight: 1.4, letterSpacing: '-.005em', marginBottom: 8 }}>
                {allFermiDone ? t('home.allFermiDoneTitle') : fermiQuestion}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'color-mix(in srgb, var(--accent-btn-fg) 82%, transparent)', fontSize: 14, fontWeight: 500, marginBottom: 16 }}>
                <span>{allFermiDone ? t('home.allFermiDoneDesc') : t('home.dailyUpdate')}</span>
              </div>
              <div style={{ background: 'color-mix(in srgb, var(--accent-btn) 78%, #000)', color: 'var(--accent-btn-fg)', borderRadius: 'var(--radius-pill)', padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, fontSize: 14, fontWeight: 700, boxShadow: '0 6px 18px rgba(0,0,0,.14)' }}>
                {allFermiDone ? (
                  <>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={'var(--accent-btn-fg)'} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="20 6 9 17 4 12" /></svg>
                    {t('home.allFermiDoneCta')}
                  </>
                ) : (
                  <>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill={'var(--accent-btn-fg)'} aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                    {t('home.dailyChallenge')}
                  </>
                )}
              </div>
            </div>
          </button>
          {/* 別の問題ボタン (絶対配置・カード本体の兄弟) — 全完了時は非表示 */}
          {!allFermiDone && (
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
          )}
        </div>

        {/* Hero Recommend - 診断済みは弱点上位ローテ、スキップ済みは中庸推薦。
            初回（診断ヒーロー表示中）は視線集約のため非表示。 */}
        {!(showPlacementHero && !placementHeroDismissed) && (
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
              <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'var(--brand)', marginBottom: 6 }}>{t('home.recommendEyebrow')}</div>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: 'var(--accent-soft)', borderRadius: 'var(--radius-pill)', padding: '4px 11px', fontSize: 14, fontWeight: 600, color: 'var(--brand)', marginBottom: 10 }}>{recommendedLesson.category}{recommendedLesson.level ? ` · ${recommendedLesson.level}` : ''}</span>
              <div style={{ fontSize: 19, fontWeight: 700, marginBottom: 16, lineHeight: 1.35, letterSpacing: '-.005em' }}>{recommendedLesson.title}</div>
              <div style={{ background: 'var(--accent-btn)', color: 'var(--accent-btn-fg)', borderRadius: 'var(--radius-pill)', padding: '12px 18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, fontSize: 14, fontWeight: 700 }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                {t('home.lessonStart')}
              </div>
            </div>
          </button>
        )}

        {/* 復習カード - フラッシュカード + 過去の誤答リストへの導線（全プラン解放） */}
        {onOpenReviewHub && (
          <ReviewCard
            due={cardStats.due}
            weak={cardStats.weak}
            total={cardStats.total}
            unresolved={wrongStats.unresolved}
            paid={paid}
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

    {/* ホームコーチマーク（初回のみ・オーバーレイ）。
        DF-F16: 初回ユーザーは診断ヒーローを最上段に出すので、コーチマークの指す先も
        診断ヒーローに張り替える（再訪・スキップ後は従来どおり今日の1問を指す）。 */}
    {showCoachmark && (
      <HomeCoachmark
        targetRef={showPlacementHero && !placementHeroDismissed ? placementHeroRef : dailyCardRef}
        body={showPlacementHero && !placementHeroDismissed ? t('coachmark.placementBody') : undefined}
        cta={showPlacementHero && !placementHeroDismissed ? t('coachmark.placementCta') : undefined}
        onDismiss={() => {
          dismissCoachmark()
          if (showPlacementHero && !placementHeroDismissed) {
            onOpenPlacementTest?.()
          } else {
            onNavigateToDailyFermi?.()
          }
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
  // paid はマウント直後に false で、購買検証が非同期に確定してから true に変わる
  // ケースがある。useState の初期化子だけで判定すると、マウント時点で paid=false
  // だった場合に「初回有料化の祝福」を取りこぼす。
  // そのため visible は毎レンダーで paid を再評価して導出する（= paid が
  // false→true に変わった最初のレンダーで自然に表示される）。閉じたかどうかだけを
  // セッション内の state で持ち、dismiss 時に UPGRADE_SEEN_KEY を永続化することで
  // 「初回有料化の1回だけ表示し、閉じたら二度と出ない」を保証する。
  const [dismissed, setDismissed] = useState(false)
  const visible = !dismissed && shouldShowUpgradeToast(paid)

  const dismiss = () => {
    // 表示済みフラグを必ず永続化してから閉じる（リロード・再マウント後も再表示しない）。
    try { localStorage.setItem(UPGRADE_SEEN_KEY, '1') } catch { /* */ }
    setDismissed(true)
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
              border: 'none', background: 'var(--accent-btn)', color: 'var(--accent-btn-fg)',
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

function ReviewCard({ due, weak, total, unresolved, paid, onOpen }: {
  due: number
  weak: number
  total: number
  unresolved: number
  paid: boolean
  onOpen: () => void
}) {
  const hasContent = total > 0 || unresolved > 0
  // 無料ユーザーで復習データが無いときは、データ無しの空表示ではなく
  // 復習ハブ（誤答復習・間隔反復SRS）が有料機能であることと価値を情報提示する
  // （プレビュー→誘導: タップでハブ/プランの案内へ進める）。
  const showPaidPreview = !paid && !hasContent
  const headline = hasContent
    ? (due > 0
        ? t('home.reviewTodayCount', { n: String(due) })
        : unresolved > 0
          ? t('home.reviewUnresolvedCount', { n: String(unresolved) })
          : weak > 0
            ? t('home.reviewWeakCount', { n: String(weak) })
            : t('home.reviewAllDone'))
    : showPaidPreview
      ? t('home.reviewPaidHeadline')
      : t('home.reviewEmptyHeadline')
  const sub = hasContent
    ? buildReviewSub(due, weak, total, unresolved)
    : showPaidPreview
      ? t('home.reviewPaidSub')
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

// DF-F16: 初回ユーザー向けの実力診断ヒーロー。画面最上段の唯一の大型 CTA。
// 「今はスキップ」導線（placementCard.later 相当）を維持する。
function PlacementHero({ heroRef, onTakeTest, onSkip }: {
  heroRef: React.RefObject<HTMLButtonElement | null>
  onTakeTest: () => void
  onSkip: () => void
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 4, flexShrink: 0 }}>
      <button
        type="button"
        ref={heroRef}
        onClick={onTakeTest}
        aria-label={`${t('placementCard.heroTitle')}: ${t('placementCard.heroDesc')}`}
        style={{ background: 'var(--accent-btn)', padding: '22px 20px 20px', cursor: 'pointer', position: 'relative', overflow: 'hidden', minHeight: 188, border: 'none', textAlign: 'left', color: 'inherit', font: 'inherit', display: 'block', width: '100%', borderRadius: 'var(--radius-lg)', boxShadow: '0 12px 28px color-mix(in srgb, var(--accent) 24%, transparent)' }}
      >
        <div style={{ position: 'relative', zIndex: 1 }}>
          {/* eyebrow + 時計アイコン（診断＝所要時間の短さを示す） */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 10 }}>
            <span style={{
              width: 28, height: 28, borderRadius: 9,
              background: 'color-mix(in srgb, var(--accent-btn-fg) 18%, transparent)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={'var(--accent-btn-fg)'} strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
                <circle cx="12" cy="12" r="10"/><path d="M12 8v4l3 3"/>
              </svg>
            </span>
            <span style={{ fontSize: 13, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: 'color-mix(in srgb, var(--accent-btn-fg) 92%, transparent)' }}>{t('placementCard.heroEyebrow')}</span>
          </div>
          <div style={{ fontFamily: "'Noto Sans JP', sans-serif", fontSize: 21, fontWeight: 800, color: 'var(--accent-btn-fg)', lineHeight: 1.35, letterSpacing: '-.01em', marginBottom: 8 }}>
            {t('placementCard.heroTitle')}
          </div>
          <div style={{ color: 'color-mix(in srgb, var(--accent-btn-fg) 84%, transparent)', fontSize: 14, fontWeight: 500, lineHeight: 1.55, marginBottom: 18 }}>
            {t('placementCard.heroDesc')}
          </div>
          <div style={{ background: 'color-mix(in srgb, var(--accent-btn) 78%, #000)', color: 'var(--accent-btn-fg)', borderRadius: 'var(--radius-pill)', padding: '13px 18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, fontSize: 14, fontWeight: 700, boxShadow: '0 6px 18px rgba(0,0,0,.14)' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill={'var(--accent-btn-fg)'} aria-hidden="true"><polygon points="5 3 19 12 5 21 5 3" /></svg>
            {t('placementCard.heroCta')}
          </div>
        </div>
      </button>
      {/* 今はスキップ導線（カード本体の兄弟ボタン・nested-interactive 回避） */}
      <button
        type="button"
        onClick={onSkip}
        style={{
          width: '100%', background: 'transparent', border: 'none',
          padding: '12px 0 4px', cursor: 'pointer',
          color: 'var(--text-secondary)', fontSize: 13, fontWeight: 600,
          fontFamily: 'inherit',
        }}
      >
        {t('placementCard.heroSkip')}
      </button>
    </div>
  )
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

