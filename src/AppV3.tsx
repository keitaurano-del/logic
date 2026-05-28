// Logic v3 — full app shell with all screens
import { useEffect, useState, useRef, useCallback, lazy, Suspense } from 'react'
import { AppShell, type Tab } from './components/AppShell'
import { HomeScreenV3 } from './screens/HomeScreenV3'
import { RoadmapScreenV3 } from './screens/RoadmapScreenV3'
import { ProfileScreenV3 } from './screens/ProfileScreenV3'
import { LessonStoriesScreen } from './screens/LessonStoriesScreen'
import { LessonCompleteScreen } from './screens/LessonCompleteScreen'
import { BootLoadingScreen } from './screens/BootLoadingScreen'

// Lazy-load lower-frequency screens to keep initial bundle small.
const FlashcardsScreen = lazy(() => import('./screens/FlashcardsScreen').then(m => ({ default: m.FlashcardsScreen })))
const ReviewHubScreen = lazy(() => import('./screens/ReviewHubScreen').then(m => ({ default: m.ReviewHubScreen })))
const WrongAnswerListScreen = lazy(() => import('./screens/WrongAnswerListScreen').then(m => ({ default: m.WrongAnswerListScreen })))
const SavedItemsScreen = lazy(() => import('./screens/SavedItemsScreen').then(m => ({ default: m.SavedItemsScreen })))
const FermiScreen = lazy(() => import('./screens/FermiScreen').then(m => ({ default: m.FermiScreen })))
const DailyFermiScreen = lazy(() => import('./screens/DailyFermiScreen').then(m => ({ default: m.DailyFermiScreen })))
const FermiRankingScreen = lazy(() => import('./screens/FermiRankingScreen').then(m => ({ default: m.FermiRankingScreen })))
const FermiHistoryScreen = lazy(() => import('./screens/FermiHistoryScreen').then(m => ({ default: m.FermiHistoryScreen })))
const ReportProblemScreen = lazy(() => import('./screens/ReportProblemScreen').then(m => ({ default: m.ReportProblemScreen })))
const OnboardingScreen = lazy(() => import('./screens/OnboardingScreen').then(m => ({ default: m.OnboardingScreen })))
const AIProblemGenScreen = lazy(() => import('./screens/AIProblemGenScreen').then(m => ({ default: m.AIProblemGenScreen })))
const AIProblemScreen = lazy(() => import('./screens/AIProblemScreen').then(m => ({ default: m.AIProblemScreen })))
const FeedbackScreen = lazy(() => import('./screens/FeedbackScreen').then(m => ({ default: m.FeedbackScreen })))
const PlacementTestScreen = lazy(() => import('./screens/PlacementTestScreen').then(m => ({ default: m.PlacementTestScreen })))
const PersonalCourseScreen = lazy(() => import('./screens/PersonalCourseScreen').then(m => ({ default: m.PersonalCourseScreen })))
const CustomCourseScreen = lazy(() => import('./screens/CustomCourseScreen').then(m => ({ default: m.CustomCourseScreen })))
const PricingScreen = lazy(() => import('./screens/PricingScreen').then(m => ({ default: m.PricingScreen })))
const StreakScreen = lazy(() => import('./screens/StreakScreen').then(m => ({ default: m.StreakScreen })))
const AccountSettingsScreen = lazy(() => import('./screens/AccountSettingsScreen').then(m => ({ default: m.AccountSettingsScreen })))
const ProfileEditScreen = lazy(() => import('./screens/ProfileEditScreen').then(m => ({ default: m.ProfileEditScreen })))
const NotificationSettingsScreen = lazy(() => import('./screens/NotificationSettingsScreen').then(m => ({ default: m.NotificationSettingsScreen })))
const AppearanceSettingsScreen = lazy(() => import('./screens/AppearanceSettingsScreen').then(m => ({ default: m.AppearanceSettingsScreen })))
const CompletedLessonsScreen = lazy(() => import('./screens/CompletedLessonsScreen').then(m => ({ default: m.CompletedLessonsScreen })))
const StudyTimeScreen = lazy(() => import('./screens/StudyTimeScreen').then(m => ({ default: m.StudyTimeScreen })))
const LanguageScreen = lazy(() => import('./screens/LanguageScreen').then(m => ({ default: m.LanguageScreen })))
const RankScreen = lazy(() => import('./screens/RankScreen').then(m => ({ default: m.RankScreen })))
const LoginScreen = lazy(() => import('./screens/LoginScreen').then(m => ({ default: m.LoginScreen })))
const DailyProblemScreen = lazy(() => import('./screens/DailyProblemScreen').then(m => ({ default: m.DailyProblemScreen })))
const JournalScreen = lazy(() => import('./screens/JournalScreen').then(m => ({ default: m.JournalScreen })))
import { allLessons, getAllLessonsFlat } from './lessonData'
import { getCurrentLevel } from './screens/homeHelpers'
import { LevelUpModal } from './components/LevelUpModal'
import { RankUpModal } from './components/RankUpModal'
import { LevelUpToast } from './components/LevelUpToast'
import {
  consumeLevelUpEvent,
  consumeRankUpEvent,
  consumeLevelUpToast,
  peekLevelUpEvent,
  peekRankUpEvent,
  peekLevelUpToast,
  recordLessonCompleteEvent,
  type LevelUpEvent,
  type RankUpEvent,
  type LevelUpToastEvent,
} from './levelUpStore'


import type { AIProblemSet } from './aiProblemStore'
import { loadTheme, applyTheme } from './theme'
// import { loadGuestUser } from './guestUser'
import { getCompletedCount, getXp, getDisplayName, setDisplayName, recordCompletion, XP_REWARDS } from './stats'
import { recordActivity } from './activityLog'
import { updateDisplayName } from './supabase'
import { isAdmin } from './admin'
import { onAuthChange, getInitialUser, type User } from './supabase'
import { setUser as setSentryUser } from './sentry'
import { hideSplash } from './platform'
import { SnackbarProvider } from './components/Snackbar'
import { syncOnLogin, syncOnLogout } from './syncService'
import { canUseJournal, getJournalTrialDaysLeft, isPaid } from './subscription'
import { initBilling } from './billing'
import { Header } from './components/platform/Header'
import { BookOpenIcon, CheckCircleIcon } from './icons'
import { TutorialOverlay, TutorialFAB } from './components/TutorialOverlay'
import { tutorial } from './tutorial/tutorialStorage'
import { t } from './i18n'
import { useAssistantName } from './hooks/useAssistantName'
import { addNotificationTapListener, rescheduleAllReminders } from './notifications'

const ONBOARDED_KEY = 'logic-onboarded'
const INSTALL_ID_KEY = 'logic-install-id'

// SCRUM-200: 新規インストール検知とlocalStorageリセット
// Capacitor AndroidはアンインストールしてもWebViewデータが残る場合があるため、
// インストール識別子がなければ新規インストールとみなしリセットする
function checkAndInitInstall(): void {
  const installId = localStorage.getItem(INSTALL_ID_KEY)
  if (!installId) {
    // 新規インストール: localStorage全前置データをクリア
    const newId = `install-${Date.now()}-${Math.random().toString(36).slice(2)}`
    localStorage.clear()
    localStorage.setItem(INSTALL_ID_KEY, newId)
    // ONBOARDED_KEYを明示的に削除（クリア後なので不要だが念のため）
    localStorage.removeItem(ONBOARDED_KEY)
  }
}

// 同カテゴリの次の未完了レッスンIDを返す（なければ null）
type Screen =
  | { type: 'home' }
  | { type: 'lessons' }
  | { type: 'roadmap'; category?: string }
  | { type: 'profile' }
  | { type: 'lesson'; lessonId: number; startStep?: number }
  | { type: 'lesson-complete'; lessonId: number; durationSec: number; prevLevel: number }
  | { type: 'flashcards'; mode?: 'due' | 'weak' }
  | { type: 'review-hub' }
  | { type: 'wrong-answers' }
  | { type: 'saved-items' }
  | { type: 'fermi' }
  | { type: 'daily-fermi' }
  | { type: 'fermi-ranking' }
  | { type: 'fermi-history' }
  | { type: 'daily-problem' }
  | { type: 'ai-problem-gen' }
  | { type: 'ai-problem'; problem: AIProblemSet }
  | { type: 'feedback' }
  | { type: 'placement-test' }
  | { type: 'personal-course' }
  | { type: 'custom-course'; courseId: string }
  | { type: 'pricing' }
  | { type: 'streak' }
  | { type: 'account-settings' }
  | { type: 'profile-edit' }
  | { type: 'notification-settings' }
  | { type: 'appearance-settings' }
  | { type: 'completed-lessons' }
  | { type: 'study-time' }
  | { type: 'language' }
  | { type: 'rank' }
  | { type: 'login' }
  | { type: 'report-problem'; context: { lessonId?: number; lessonTitle?: string; question?: string } }
  | { type: 'onboarding' }
  | { type: 'journal' }
  | { type: 'welcome' }

// LESSON_LIST is now managed within RoadmapScreen

function getInitialScreen(user: User | null): Screen {
  if (typeof location !== 'undefined') {
    const preview = new URL(location.href).searchParams.get('preview')
    if (preview === 'onboarding') return { type: 'onboarding' }
    if (preview === 'home') return { type: 'home' }
    if (preview === 'lessons') return { type: 'lessons' }
    if (preview === 'profile') return { type: 'profile' }
    if (preview === 'fermi') return { type: 'daily-fermi' }
    if (preview === 'pricing') return { type: 'pricing' }
    if (preview === 'account') return { type: 'account-settings' }
    if (preview === 'profile-edit') return { type: 'profile-edit' }
    if (preview === 'notifications') return { type: 'notification-settings' }
    if (preview === 'appearance') return { type: 'appearance-settings' }
    if (preview === 'journal') return { type: 'journal' }
  }
  // ログイン済みユーザーはオンボーディングをスキップ
  if (user) return { type: 'home' }
  // 未ログインは必ずオンボーディングまたはログイン画面へ
  if (localStorage.getItem(ONBOARDED_KEY) !== '1') {
    return { type: 'onboarding' }
  }
  // オンボーディング完了済みだが未ログインの場合はログイン画面へ
  return { type: 'login' }
}

// ── ルート画面かどうか判定 ──
// 'ranking' タブ ID は Screen.type 'fermi-ranking' に対応する（handleTabChange / popstate 参照）。
const ROOT_SCREENS = new Set<string>(['home', 'lessons', 'fermi-ranking', 'journal', 'profile'])

function AppV3() {
  const [tab, setTab] = useState<Tab>('home')
  const [screen, setScreen] = useState<Screen>(() => getInitialScreen(null))
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [authReady, setAuthReady] = useState(false)
  const [showTutorial, setShowTutorial] = useState(false)
  const [showFAB, setShowFAB] = useState(() => !tutorial.hasFABDismissed())
  const [showNamePopup, setShowNamePopup] = useState(false)
  const [nameInput, setNameInput] = useState('')
  const [nameSaving, setNameSaving] = useState(false)
  // レベルアップ / ランクアップ演出 (Phase 1〜4)
  const [levelUpEvt, setLevelUpEvt] = useState<LevelUpEvent | null>(null)
  const [rankUpEvt, setRankUpEvt] = useState<RankUpEvent | null>(null)
  const [toastEvt, setToastEvt] = useState<LevelUpToastEvent | null>(null)
  // popstate ハンドラ内でscreen stateを参照するための ref
  const screenRef = useRef<Screen>(screen)
  // popstate による遷移かどうかのフラグ（push 抑制用）
  const isPopNavRef = useRef(false)
  void isAdmin() // reserved for future admin checks

  // SCRUM-200: 新規インストール時にlocalStorageリセット（アンインストール後のデータ残留対策）
  // useEffect に移すことで React Strict Mode の二重レンダリングでの意図しない複数回実行を防ぐ
  useEffect(() => {
    checkAndInitInstall()
    // Play Billing 初期化（Android native のみ、Web では no-op）
    void initBilling()
  }, [])

  // screenRef を常に最新の screen と同期させる（コンカレントレンダリング対策）
  useEffect(() => { screenRef.current = screen }, [screen])

  // レベルアップ / ランクアップ演出の pending イベント監視
  //   - lesson-complete 画面に入ったら LevelUpModal / RankUpModal を表示
  //   - home 画面に入ったら LevelUpToast を表示 (lesson-complete を経由しなかった場合の補完)
  // setState は次の tick に defer して cascading render を避ける (react-hooks/set-state-in-effect)
  useEffect(() => {
    let cancelled = false
    const id = setTimeout(() => {
      if (cancelled) return
      if (screen.type === 'lesson-complete') {
        const rank = peekRankUpEvent()
        const level = peekLevelUpEvent()
        if (rank) {
          setRankUpEvt(rank)
        } else if (level) {
          setLevelUpEvt(level)
        }
      } else if (screen.type === 'home') {
        const toast = peekLevelUpToast()
        if (toast) setToastEvt(toast)
      }
    }, 0)
    return () => {
      cancelled = true
      clearTimeout(id)
    }
  }, [screen.type])

  // ── History 連動の setScreen ラッパー ──
  const navigate = useCallback((next: Screen, replace = false) => {
    setScreen(next)
    if (isPopNavRef.current) return // popstate 経由なら push しない
    if (replace || ROOT_SCREENS.has(next.type)) {
      window.history.replaceState({ screen: next }, '')
    } else {
      window.history.pushState({ screen: next }, '')
    }
  }, [])

  // ── popstate (バックスワイプ/戻るボタン) ──
  useEffect(() => {
    const onPop = (e: PopStateEvent) => {
      if (e.state?.screen) {
        isPopNavRef.current = true
        const s = e.state.screen as Screen
        setScreen(s)
        if (s.type === 'fermi-ranking') {
          setTab('ranking')
        } else if (s.type === 'journal') {
          setTab('journal')
        } else if (ROOT_SCREENS.has(s.type)) {
          setTab(s.type as Tab)
        }
        isPopNavRef.current = false
      } else {
        // state がない場合はホームへ
        isPopNavRef.current = true
        setTab('home')
        setScreen({ type: 'home' })
        isPopNavRef.current = false
      }
    }
    window.addEventListener('popstate', onPop)
    // 初期 state をセット
    window.history.replaceState({ screen: screenRef.current }, '')
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  // v3 デザイン用テーマ class を body に付与（tokens.css の .theme-v3 が活性化）
  useEffect(() => {
    document.body.classList.add('theme-v3')
    return () => { document.body.classList.remove('theme-v3') }
  }, [])

  useEffect(() => {
    applyTheme(loadTheme())
    // BootLoadingScreen は最低 2 秒は出す（ユーザーがブランドを認識する余白 + 裏でリモート同期を確実に走らせる）
    const bootStart = Date.now()
    const MIN_BOOT_MS = 2000
    const ensureMinBoot = async () => {
      const elapsed = Date.now() - bootStart
      if (elapsed < MIN_BOOT_MS) {
        await new Promise<void>((resolve) => setTimeout(resolve, MIN_BOOT_MS - elapsed))
      }
    }
    // ネイティブ SplashScreen は 1500ms 後に隠す → React の BootLoadingScreen が引き継ぐ
    const splashTimer = setTimeout(() => { void hideSplash() }, 1500)
    // 初回起動時にセッションを取得し、ログイン済ならホームへ。同時にリモートと同期して最新化。
    getInitialUser().then(async (user) => {
      setCurrentUser(user)
      if (user) await syncOnLogin(user.id)
      const initial = getInitialScreen(user)
      setScreen(initial)
      window.history.replaceState({ screen: initial }, '')
      await ensureMinBoot()
      setAuthReady(true)
      clearTimeout(splashTimer)
      void hideSplash()
    }).catch(async () => {
      // ネットワークエラー等でも必ずSplashを閉じてホームへ遷移させる
      await ensureMinBoot()
      clearTimeout(splashTimer)
      setAuthReady(true)
      void hideSplash()
    })
    const unsub = onAuthChange(async (user) => {
      setCurrentUser(user)
      setSentryUser(user ? { id: user.id, email: user.email ?? null } : null)
      if (user) {
        await syncOnLogin(user.id)
        // preview=onboarding 中はホームに戻さない
        const isPreview = typeof location !== 'undefined' && new URL(location.href).searchParams.get('preview') === 'onboarding'
        if (!isPreview) {
          // ログイン直後（login / onboarding 画面からの遷移）はウェルカム画面を表示
          setScreen((s) => (s.type === 'login' || s.type === 'onboarding') ? { type: 'welcome' } : s)
          // チュートリアルは右下FABから任意で起動
        }
      } else {
        syncOnLogout()
      }
    })
    // splashTimer と authリスナーの両方をcleanup
    return () => {
      clearTimeout(splashTimer)
      unsub()
    }
  }, [])

  // 通知タップ → ホームへ deep link
  // 起動時に全リマインダーを一旦 cancel → 各 pref が enabled なものだけ再 schedule。
  // これで「設定変更で残った古いスケジュール」「重複発火」を防ぐ。
  useEffect(() => {
    let cleanup: (() => void) | undefined
    void (async () => {
      cleanup = await addNotificationTapListener(() => {
        setTab('home')
        navigate({ type: 'home' })
      })
      await rescheduleAllReminders()
    })()
    return () => { cleanup?.() }
  }, [navigate])

  // 表示名: localStorage優先 → user_metadata → email
  const storedName = getDisplayName()
  const userName = storedName
    || currentUser?.user_metadata?.full_name
    || currentUser?.user_metadata?.name
    || currentUser?.email
    || t('home.guestName')
  const completed = getCompletedCount()
  const xp = completed * 100
  const level = Math.floor(xp / 1000) + 1

  // パーソナルアシスタント名（ジャーナル・要約 CTA で使用）
  const { assistantName, updateAssistantName } = useAssistantName(currentUser?.id ?? null)

  const handleSaveName = async () => {
    const name = nameInput.trim()
    if (!name) return
    setNameSaving(true)
    setDisplayName(name)
    if (currentUser) {
      await updateDisplayName(name).catch(() => {})
    }
    setNameSaving(false)
    setShowNamePopup(false)
  }

  const handleTabChange = (next: Tab) => {
    setTab(next)
    // rankingタブはフェルミランキング画面へ
    if (next === 'ranking') {
      navigate({ type: 'fermi-ranking' }, true)
    } else if (next === 'journal') {
      navigate({ type: 'journal' }, true)
    } else {
      navigate({ type: next }, true)
    }
  }

  const handleOpenLesson = (lessonId: number) => {
    lessonStartTimeRef.current = Date.now()
    navigate({ type: 'lesson', lessonId })
  }

  const handleBack = () => {
    // History にエントリがあれば戻る、なければタブルートへ
    if (window.history.state?.screen && !ROOT_SCREENS.has(screenRef.current.type)) {
      window.history.back()
    } else if (tab === 'ranking') {
      navigate({ type: 'fermi-ranking' }, true)
    } else if (tab === 'journal') {
      navigate({ type: 'journal' }, true)
    } else {
      navigate({ type: tab }, true)
    }
  }

  const lessonStartTimeRef = useRef<number>(0)
  const handleComplete = () => {
    if (screen.type === 'lesson') {
      const lessonId = screen.lessonId
      const startedAt = lessonStartTimeRef.current
      // 開始時刻が未設定（直接遷移 / deep link）の場合は計測対象外
      const rawElapsedMs = startedAt > 0 ? Date.now() - startedAt : 0
      const THREE_HOURS_MS = 3 * 60 * 60 * 1000
      const validElapsedMs = rawElapsedMs > 0 && rawElapsedMs < THREE_HOURS_MS ? rawElapsedMs : 0
      // durationSec は LessonComplete 画面の表示用。最低 60 秒で表示する。
      const durationSec = Math.max(60, Math.floor(validElapsedMs / 1000))
      // XP 加算は LessonStoriesScreen 側で addXp('lesson') が走った後に onComplete が呼ばれる。
      // つまりここでの getXp() は既に加算後。prevXp は XP_REWARDS.lesson を引いて算出する。
      const newXp = getXp()
      const prevXp = Math.max(0, newXp - XP_REWARDS.lesson)
      const prevLevel = getCurrentLevel(prevXp).level
      recordCompletion(`lesson-${lessonId}`)
      // レベル / ランクアップ判定 → sessionStorage に pending イベントを積む
      // (LevelUpModal / RankUpModal / LevelUpToast がそれぞれ消費する)
      recordLessonCompleteEvent(prevXp, newXp)
      const lessonTitle = allLessons[lessonId]?.title
      recordActivity({
        type: 'lesson',
        id: String(lessonId),
        title: lessonTitle,
        meta: { durationSec },
      })
      // 注: 学習時間の累計加算（addStudyTime）と study_sessions への記録は
      // LessonStoriesScreen の useStudyTimer hook が onComplete 後のアンマウント時に
      // まとめて実施する。ここでは加算しない（二重計上を避けるため）。
      // 次のレッスンに備えて ref をリセット
      lessonStartTimeRef.current = 0
      navigate({ type: 'lesson-complete', lessonId, durationSec, prevLevel })
    } else if (tab === 'ranking') {
      navigate({ type: 'fermi-ranking' }, true)
    } else if (tab === 'journal') {
      navigate({ type: 'journal' }, true)
    } else {
      navigate({ type: tab }, true)
    }
  }

  // 認証完了前はロゴ + 「読み込んでいます…」のロード画面を表示
  if (!authReady) {
    return <BootLoadingScreen />
  }

  // Onboarding: show full-screen, no AppShell
  if (screen.type === 'onboarding') {
    return (
      <Suspense fallback={null}>
        <OnboardingScreen
          onComplete={() => {
            localStorage.setItem(ONBOARDED_KEY, '1')
            navigate({ type: 'home' })
            // チュートリアルは右下FABから任意で起動
          }}
          onNavigateToLogin={() => navigate({ type: 'login' })}
        />
      </Suspense>
    )
  }

  // Welcome: 認証直後の歓迎画面（全画面・AppShell なし）
  if (screen.type === 'welcome') {
    return <WelcomeScreen userName={userName} onStart={() => navigate({ type: 'home' })} />
  }

  return (
    <>
    <AppShell
      activeTab={tab}
      onTabChange={handleTabChange}
      userName={userName}
      userLevel={`Lv.${level}`}
      hideTabBar={screen.type === 'lesson' || screen.type === 'lesson-complete'}
    >
      {/* スクリーン遷移fade-in: screen.typeが変わるたびにkeyで再マウント */}
      <Suspense fallback={null}>
      <div key={screen.type} className="tab-fade-in" style={{ display: 'contents' }}>
      {screen.type === 'home' && (
        <HomeScreenV3
          userName={userName}
          onOpenLesson={handleOpenLesson}
          onOpenCategory={(cat) => {
            if (cat === 'fermi') navigate({ type: 'daily-fermi' })
            else navigate({ type: 'roadmap', category: cat })
          }}
          onOpenRank={() => navigate({ type: 'rank' })}
          onOpenStats={() => navigate({ type: 'profile' }, true)}
          onOpenAIGen={() => navigate({ type: 'ai-problem-gen' })}
          onOpenRoadmap={() => { setTab('lessons'); navigate({ type: 'lessons' }, true) }}
          onNavigateToDailyFermi={() => navigate({ type: 'daily-fermi' })}
          onOpenPlacementTest={() => navigate({ type: 'placement-test' })}
          onOpenReviewHub={() => navigate({ type: 'review-hub' })}
          onOpenPricing={() => navigate({ type: 'pricing' })}
          onOpenStudyTime={() => navigate({ type: 'study-time' })}
        />
      )}


      {screen.type === 'lessons' && (
        <RoadmapScreenV3
          onOpenLesson={handleOpenLesson}
          onOpenCategory={(cat) => navigate({ type: 'roadmap', category: cat })}
          onOpenPersonalCourse={() => navigate({ type: 'personal-course' })}
          onOpenPlacementTest={() => navigate({ type: 'placement-test' })}
          onOpenReviewHub={() => navigate({ type: 'review-hub' })}
          onOpenCustomCourse={(courseId) => navigate({ type: 'custom-course', courseId })}
          onUpgrade={() => navigate({ type: 'pricing' })}
        />
      )}

      {screen.type === 'roadmap' && (
        <RoadmapScreenV3
          onOpenLesson={handleOpenLesson}
          onOpenCategory={(cat) => navigate({ type: 'roadmap', category: cat })}
          initialCategory={screen.category}
          onBack={handleBack}
        />
      )}

      {screen.type === 'flashcards' && (
        isPaid()
          ? <FlashcardsScreen onBack={handleBack} mode={screen.mode} />
          : <ReviewPaywall onBack={handleBack} onUpgrade={() => navigate({ type: 'pricing' })} />
      )}
      {screen.type === 'review-hub' && (
        isPaid() ? (
          <ReviewHubScreen
            onBack={handleBack}
            onOpenFlashcards={(mode) => navigate({ type: 'flashcards', mode })}
            onOpenWrongAnswers={() => navigate({ type: 'wrong-answers' })}
            onOpenFermiHistory={() => navigate({ type: 'fermi-history' })}
            onOpenSavedItems={() => navigate({ type: 'saved-items' })}
          />
        ) : (
          <ReviewPaywall onBack={handleBack} onUpgrade={() => navigate({ type: 'pricing' })} />
        )
      )}
      {screen.type === 'fermi-history' && (
        isPaid() ? (
          <FermiHistoryScreen
            onBack={handleBack}
            onRetry={(poolIndex) => {
              try {
                sessionStorage.setItem('fermi-replay-index', String(poolIndex))
                sessionStorage.setItem('fermi-replay-mode', '1')
              } catch { /* */ }
              navigate({ type: 'daily-fermi' })
            }}
          />
        ) : (
          <ReviewPaywall onBack={handleBack} onUpgrade={() => navigate({ type: 'pricing' })} />
        )
      )}
      {screen.type === 'wrong-answers' && (
        isPaid() ? (
          <WrongAnswerListScreen
            onBack={handleBack}
            onOpenLesson={handleOpenLesson}
          />
        ) : (
          <ReviewPaywall onBack={handleBack} onUpgrade={() => navigate({ type: 'pricing' })} />
        )
      )}
      {screen.type === 'saved-items' && (
        isPaid() ? (
          <SavedItemsScreen
            onBack={handleBack}
            onOpenLesson={handleOpenLesson}
            onOpenCourse={(cat) => navigate({ type: 'roadmap', category: cat })}
            onOpenLessonStep={(lessonId, stepIndex) => {
              lessonStartTimeRef.current = Date.now()
              navigate({ type: 'lesson', lessonId, startStep: stepIndex })
            }}
          onOpenAiProblem={(problemId) => {
            try {
              // 保存した AI 問題を loadAIProblems から探して開く
              import('./aiProblemStore').then(({ loadAIProblems }) => {
                const found = loadAIProblems().find((p) => String(p.id) === problemId)
                if (found) navigate({ type: 'ai-problem', problem: found })
                else navigate({ type: 'ai-problem-gen' })
              })
            } catch {
              navigate({ type: 'ai-problem-gen' })
            }
          }}
          onOpenFermi={() => navigate({ type: 'daily-fermi' })}
        />
        ) : (
          <ReviewPaywall onBack={handleBack} onUpgrade={() => navigate({ type: 'pricing' })} />
        )
      )}
      {screen.type === 'fermi' && <FermiScreen onBack={handleBack} onReport={(ctx) => navigate({ type: 'report-problem', context: ctx })} />}
      {screen.type === 'daily-fermi' && <DailyFermiScreen onBack={handleBack} onReport={(ctx) => navigate({ type: 'report-problem', context: ctx })} onOpenRanking={() => navigate({ type: 'fermi-ranking' })} />}
      {screen.type === 'daily-problem' && <DailyProblemScreen onBack={handleBack} />}

      {screen.type === 'feedback' && <FeedbackScreen onBack={handleBack} />}
      {screen.type === 'pricing' && <PricingScreen onBack={handleBack} />}
      {screen.type === 'ai-problem-gen' && (
        <AIProblemGenScreen
          onBack={handleBack}
          onPlay={(problem) => navigate({ type: 'ai-problem', problem })}
          onUpgrade={() => navigate({ type: 'pricing' })}
        />
      )}

      {screen.type === 'ai-problem' && (
        <AIProblemScreen
          problem={screen.problem}
          onBack={() => navigate({ type: 'ai-problem-gen' })}
          onReport={(ctx) => navigate({ type: 'report-problem', context: ctx })}
        />
      )}

      {screen.type === 'fermi-ranking' && (
        <FermiRankingScreen />
      )}

      {screen.type === 'journal' && (
        currentUser ? (
          canUseJournal() ? (
            <JournalScreen
              userId={currentUser.id}
              assistantName={assistantName}
              onUpdateAssistantName={updateAssistantName}
              onOpenLesson={handleOpenLesson}
              onOpenCourse={(cat) => navigate({ type: 'roadmap', category: cat })}
            />
          ) : (
            <JournalPaywall onUpgrade={() => navigate({ type: 'pricing' })} />
          )
        ) : (
          <JournalLoginPrompt onLogin={() => navigate({ type: 'login' })} />
        )
      )}

      {screen.type === 'placement-test' && (
        <PlacementTestScreen
          onBack={handleBack}
          onComplete={() => navigate({ type: 'personal-course' })}
        />
      )}

      {screen.type === 'personal-course' && (
        <PersonalCourseScreen
          onStartLesson={handleOpenLesson}
          onExit={() => { setTab('home'); navigate({ type: 'home' }, true) }}
          onBack={handleBack}
        />
      )}

      {screen.type === 'custom-course' && (
        <CustomCourseScreen
          courseId={screen.courseId}
          onStartLesson={handleOpenLesson}
          onBack={handleBack}
        />
      )}

      {screen.type === 'profile' && (
        <ProfileScreenV3
          userName={userName}
          onOpenAccount={() => navigate({ type: 'account-settings' })}
          onOpenProfileEdit={() => navigate({ type: 'profile-edit' })}
          onOpenNotifications={() => navigate({ type: 'notification-settings' })}
          onOpenAppearance={() => navigate({ type: 'appearance-settings' })}
          onOpenFeedback={() => navigate({ type: 'feedback' })}
          onOpenPricing={() => navigate({ type: 'pricing' })}
          onOpenPlacementTest={() => navigate({ type: 'placement-test' })}
          onOpenLesson={(id) => handleOpenLesson(id)}
          onOpenLanguage={() => navigate({ type: 'language' })}
          onOpenStudyTime={() => navigate({ type: 'study-time' })}
        />
      )}
      {screen.type === 'rank' && <RankScreen onBack={handleBack} />}
      {screen.type === 'streak' && <StreakScreen onBack={handleBack} />}
      {screen.type === 'completed-lessons' && <CompletedLessonsScreen onBack={handleBack} />}
      {screen.type === 'study-time' && <StudyTimeScreen onBack={handleBack} />}
      {screen.type === 'login' && (
        <LoginScreen
          onLoginSuccess={(user) => {
            setCurrentUser(user)
            // 名前が未設定の場合はポップアップ表示
            const hasName = user?.user_metadata?.full_name || user?.user_metadata?.name || getDisplayName()
            if (!hasName) { setShowNamePopup(true) }
            navigate({ type: 'home' })
          }}
        />
      )}
      {screen.type === 'language' && <LanguageScreen onBack={() => navigate({ type: 'profile' })} />}
      {screen.type === 'account-settings' && (
        <AccountSettingsScreen
          onBack={handleBack}
          currentUser={currentUser ? { email: currentUser.email ?? '' } : null}
          onOpenLogin={() => navigate({ type: 'login' })}
          onLogout={() => { setCurrentUser(null); navigate({ type: 'profile' }) }}
        />
      )}
      {screen.type === 'profile-edit' && (
        <ProfileEditScreen onBack={handleBack} />
      )}
      {screen.type === 'notification-settings' && (
        <NotificationSettingsScreen onBack={handleBack} />
      )}
      {screen.type === 'appearance-settings' && (
        <AppearanceSettingsScreen
          onBack={handleBack}
          onUpgrade={() => navigate({ type: 'pricing' })}
        />
      )}

      {screen.type === 'report-problem' && (
        <ReportProblemScreen
          context={screen.context}
          onBack={handleBack}
        />
      )}

      {screen.type === 'lesson' && (
        <LessonStoriesScreen
          // lessonId を key にして、コース再生でレッスン間を直接遷移したときも
          // 確実に state を初期化して再 mount させる（index / coursePlayActive 等の reset）。
          key={screen.lessonId}
          lessonId={screen.lessonId}
          startStep={screen.startStep}
          onComplete={handleComplete}
          onClose={handleBack}
          onCoursePlayNext={handleOpenLesson}
        />
      )}

      {screen.type === 'lesson-complete' && (
        <LessonCompleteScreen
          userName={userName}
          lessonTitle={(() => {
            // ロード
            try {
              const lesson = allLessons[screen.lessonId]
              return lesson?.title || t('app.lessonFallback')
            } catch { return t('app.lessonFallback') }
          })()}
          durationSec={screen.durationSec}
          prevLevel={screen.prevLevel}
          autoAdvance={false}
          onNext={() => {
            // 同カテゴリの次レッスンを探して遷移
            const allFlat = getAllLessonsFlat()
            const currentLesson = allFlat[screen.lessonId]
            if (currentLesson) {
              // 同カテゴリのレッスンをID順に並べて次を探す
              const sameCategory = Object.values(allFlat)
                .filter(l => l.category === currentLesson.category)
                .sort((a, b) => a.id - b.id)
              const idx = sameCategory.findIndex(l => l.id === screen.lessonId)
              const nextLesson = sameCategory[idx + 1]
              if (nextLesson) {
                handleOpenLesson(nextLesson.id)
                return
              }
            }
            // 次レッスンなければホームに戻る
            navigate({ type: 'home' }, true)
          }}
          onHome={() => navigate({ type: 'home' }, true)}
          onOpenReview={() => navigate({ type: 'review-hub' })}
        />
      )}
      </div>
      </Suspense>
    </AppShell>

    {/* レベルアップ / ランクアップ演出 (Phase 1〜4) */}
    {rankUpEvt && (
      <RankUpModal
        prevTitleKey={rankUpEvt.prevTitleKey}
        newTitleKey={rankUpEvt.newTitleKey}
        newLevel={rankUpEvt.newLevel}
        onClose={() => {
          consumeRankUpEvent()
          setRankUpEvt(null)
          // ランクアップは大体レベルアップも伴うので、続けて Level モーダルを開く
          const lvEvt = peekLevelUpEvent()
          if (lvEvt) setLevelUpEvt(lvEvt)
        }}
      />
    )}
    {!rankUpEvt && levelUpEvt && (
      <LevelUpModal
        prevLevel={levelUpEvt.prevLevel}
        newLevel={levelUpEvt.newLevel}
        onClose={() => {
          consumeLevelUpEvent()
          // モーダル経由で見たので toast キーは消費しておく (ホームで二重表示しない)
          consumeLevelUpToast()
          setLevelUpEvt(null)
        }}
      />
    )}
    {toastEvt && !rankUpEvt && !levelUpEvt && (
      <LevelUpToast
        prevLevel={toastEvt.prevLevel}
        newLevel={toastEvt.newLevel}
        onTap={() => {
          // toast タップで Phase 1 モーダル再表示
          consumeLevelUpToast()
          setToastEvt(null)
          setLevelUpEvt({
            prevLevel: toastEvt.prevLevel,
            newLevel: toastEvt.newLevel,
            newXp: 0,
          })
        }}
        onDismiss={() => {
          consumeLevelUpToast()
          setToastEvt(null)
        }}
      />
    )}

    {/* SCRUM-195: チュートリアルオーバーレイ */}
    {/* チュートリアルFAB（右下固定ボタン） — Daily Fermi 画面でも常駐 */}
    {(screen.type === 'home' || screen.type === 'daily-fermi') && !showTutorial && showFAB && (
      <TutorialFAB
        onClick={() => {
          // ホームから起動した場合は Daily Fermi 画面に遷移してからオーバーレイを開く
          if (screen.type === 'home') navigate({ type: 'daily-fermi' })
          setShowTutorial(true)
        }}
        onHide={() => { tutorial.markFABDismissed(); setShowFAB(false) }}
      />
    )}
    {showTutorial && (
      <TutorialOverlay
        onDone={() => setShowTutorial(false)}
      />
    )}

    {/* 登録後: 表示名入力ポップアップ */}
    {showNamePopup && (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.7)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', padding: 24,
      }}>
        <div style={{
          background: 'var(--bg-elevated)', borderRadius: 20, padding: '32px 24px',
          width: '100%', maxWidth: 360, boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--brand)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{t('welcomePopup.heading')}</div>
          </div>
          <div style={{ fontSize: 15, color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.6 }}>
            {t('welcomePopup.desc')}
          </div>
          <input
            type="text"
            aria-label={t('welcomePopup.aria')}
            placeholder={t('welcomePopup.placeholder')}
            value={nameInput}
            onChange={e => setNameInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && nameInput.trim()) handleSaveName() }}
            autoFocus
            style={{
              width: '100%', padding: '14px 16px', border: '1px solid var(--border)',
              borderRadius: 10, background: 'var(--bg-card)', color: 'var(--text-primary)',
              fontSize: 16, fontFamily: "'Noto Sans JP', sans-serif",
              outline: 'none', boxSizing: 'border-box', marginBottom: 8,
            }}
          />
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>{t('welcomePopup.note')}</div>
          <button
            onClick={handleSaveName}
            disabled={nameSaving || !nameInput.trim()}
            style={{
              width: '100%', padding: '15px', background: nameInput.trim() ? 'var(--brand)' : 'var(--bg-card)',
              border: 'none', borderRadius: 12, fontSize: 16, fontWeight: 700,
              color: nameInput.trim() ? 'var(--accent-fg)' : 'var(--text-muted)',
              cursor: nameInput.trim() ? 'pointer' : 'not-allowed', marginBottom: 10,
            }}
          >{nameSaving ? t('welcomePopup.saving') : t('welcomePopup.save')}</button>
          <button
            onClick={() => setShowNamePopup(false)}
            style={{ width: '100%', background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: 14, cursor: 'pointer', padding: '8px 0' }}
          >{t('welcomePopup.later')}</button>
        </div>
      </div>
    )}
    </>
  )
}

function WelcomeScreen({ userName, onStart }: { userName: string; onStart: () => void }) {
  return (
    <div style={{
      minHeight: '100dvh',
      background: 'var(--hero-grad-dark, linear-gradient(160deg, #0f172a 0%, #1e293b 100%))',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 28px calc(env(safe-area-inset-bottom, 0px) + 40px)',
      fontFamily: "'Noto Sans JP', sans-serif",
      color: 'var(--text-on-hero, #fff)',
      textAlign: 'center',
      gap: 24,
    }}>
      <div style={{
        width: 96, height: 96, borderRadius: '50%',
        background: 'linear-gradient(135deg, var(--brand), var(--brand-light, #8B5CF6))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 44,
        boxShadow: '0 0 40px rgba(108,142,245,0.55), 0 12px 32px rgba(0,0,0,0.4)',
      }}>
        <span aria-hidden="true">🎉</span>
      </div>
      <div>
        <div style={{ fontSize: 14, letterSpacing: '.16em', fontWeight: 700, color: 'var(--text-on-hero-muted)', marginBottom: 10, textTransform: 'uppercase' }}>
          {t('welcome.eyebrow')}
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 900, lineHeight: 1.35, margin: 0, letterSpacing: '-0.01em' }}>
          {t('welcome.heading', { name: userName })}
        </h1>
      </div>
      <p style={{ fontSize: 15, lineHeight: 1.75, color: 'var(--text-on-hero-muted)', margin: 0, maxWidth: 360 }}>
        {t('welcome.body')}
      </p>
      <button
        type="button"
        onClick={onStart}
        style={{
          marginTop: 12,
          padding: '16px 36px',
          fontSize: 16, fontWeight: 800, letterSpacing: '0.02em',
          background: 'var(--brand-grad-h, linear-gradient(135deg, #6C8EF5, #8B5CF6))',
          color: 'var(--accent-fg, #fff)',
          border: 'none',
          borderRadius: 999,
          cursor: 'pointer',
          boxShadow: '0 8px 24px rgba(108,142,245,0.45)',
          minWidth: 240,
          minHeight: 52,
        }}
      >
        {t('welcome.startCta')}
      </button>
    </div>
  )
}

function JournalPaywall({ onUpgrade }: { onUpgrade: () => void }) {
  const daysLeft = getJournalTrialDaysLeft()
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>
      <div className="journal-hero">
        <div>
          <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-0.02em' }}>{t('journal.title')}</div>
          <div style={{ fontSize: 13, color: 'var(--text-on-hero-muted)', marginTop: 4 }}>{t('journal.subtitle')}</div>
        </div>
      </div>
      <div style={{ flex: 1, padding: '32px 20px 120px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', gap: 20 }}>
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: 16,
          padding: 24,
          maxWidth: 360,
          width: '100%',
          textAlign: 'center',
          boxShadow: 'var(--shadow-v3-card-inset)',
          border: '1px solid rgba(255,255,255,.06)',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            alignSelf: 'center',
            width: 56, height: 56, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--brand), var(--brand-light, #8B5CF6))',
            fontSize: 28,
            marginBottom: 4,
          }}>
            <span aria-hidden="true">✨</span>
          </div>
          <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>
            {daysLeft > 0 ? t('journal.trialActiveTitle', { days: String(daysLeft) }) : t('journal.paywallTitle')}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            {daysLeft > 0 ? t('journal.trialActiveDesc') : t('journal.paywallDesc')}
          </div>
          <button
            type="button"
            onClick={onUpgrade}
            style={{
              marginTop: 8,
              padding: '14px 24px',
              background: 'var(--brand)',
              color: 'var(--accent-fg, #fff)',
              border: 'none',
              borderRadius: 12,
              font: 'inherit',
              fontSize: 15,
              fontWeight: 700,
              cursor: 'pointer',
              minHeight: 48,
            }}
          >
            {t('journal.viewPlansCta')}
          </button>
        </div>
      </div>
    </div>
  )
}

function ReviewPaywall({ onBack, onUpgrade }: { onBack: () => void; onUpgrade: () => void }) {
  const features = [
    t('reviewHub.paywallFeat1'),
    t('reviewHub.paywallFeat2'),
    t('reviewHub.paywallFeat3'),
    t('reviewHub.paywallFeat4'),
  ]
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>
      <Header title={t('reviewHub.title')} onBack={onBack} />
      <div style={{ flex: 1, padding: '32px 20px 120px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', gap: 20 }}>
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: 16,
          padding: 24,
          maxWidth: 380,
          width: '100%',
          textAlign: 'center',
          boxShadow: 'var(--shadow-v3-card-inset)',
          border: '1px solid rgba(255,255,255,.06)',
          display: 'flex',
          flexDirection: 'column',
          gap: 14,
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            alignSelf: 'center',
            width: 56, height: 56, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--brand), var(--brand-light, #8B5CF6))',
            color: 'var(--accent-fg, #fff)',
            marginBottom: 4,
          }}>
            <BookOpenIcon width={28} height={28} />
          </div>
          <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>
            {t('reviewHub.paywallTitle')}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            {t('reviewHub.paywallDesc')}
          </div>
          <ul style={{
            listStyle: 'none', padding: 0, margin: '4px 0 0',
            display: 'flex', flexDirection: 'column', gap: 8, textAlign: 'left',
          }}>
            {features.map((f) => (
              <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5 }}>
                <span style={{ color: 'var(--brand)', flexShrink: 0, marginTop: 2 }}>
                  <CheckCircleIcon width={16} height={16} />
                </span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={onUpgrade}
            style={{
              marginTop: 8,
              padding: '14px 24px',
              background: 'var(--brand)',
              color: 'var(--accent-fg, #fff)',
              border: 'none',
              borderRadius: 12,
              font: 'inherit',
              fontSize: 15,
              fontWeight: 700,
              cursor: 'pointer',
              minHeight: 48,
            }}
          >
            {t('reviewHub.viewPlansCta')}
          </button>
        </div>
      </div>
    </div>
  )
}

function JournalLoginPrompt({ onLogin }: { onLogin: () => void }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>
      <div className="journal-hero">
        <div>
          <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-0.02em' }}>{t('journal.title')}</div>
          <div style={{ fontSize: 13, color: 'var(--text-on-hero-muted)', marginTop: 4 }}>{t('journal.subtitle')}</div>
        </div>
      </div>
      <div style={{ flex: 1, padding: '32px 20px 120px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', gap: 20 }}>
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: 16,
          padding: 24,
          maxWidth: 360,
          width: '100%',
          textAlign: 'center',
          boxShadow: 'var(--shadow-v3-card-inset)',
          border: '1px solid rgba(255,255,255,.06)',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
            {t('journal.loginRequiredTitle')}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            {t('journal.loginRequiredDesc')}
          </div>
          <button
            type="button"
            onClick={onLogin}
            style={{
              marginTop: 8,
              padding: '14px 24px',
              background: 'var(--brand)',
              color: 'var(--accent-fg, #fff)',
              border: 'none',
              borderRadius: 12,
              font: 'inherit',
              fontSize: 15,
              fontWeight: 700,
              cursor: 'pointer',
              minHeight: 48,
            }}
          >
            {t('profile.loginCta')}
          </button>
        </div>
      </div>
    </div>
  )
}

function AppV3WithProviders() {
  return (
    <SnackbarProvider>
      <AppV3 />
    </SnackbarProvider>
  )
}

export default AppV3WithProviders
