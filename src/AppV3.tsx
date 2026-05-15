// Logic v3 — full app shell with all screens
import { useEffect, useState, useRef, useCallback, lazy, Suspense } from 'react'
import { AppShell, type Tab } from './components/AppShell'
import { HomeScreenV3 } from './screens/HomeScreenV3'
import { LoginGate } from './components/LoginGate'
import { RoadmapScreenV3 } from './screens/RoadmapScreenV3'
import { ProfileScreenV3 } from './screens/ProfileScreenV3'
import { LessonStoriesScreen } from './screens/LessonStoriesScreen'
import { LessonCompleteScreen } from './screens/LessonCompleteScreen'

// Lazy-load lower-frequency screens to keep initial bundle small.
const FlashcardsScreen = lazy(() => import('./screens/FlashcardsScreen').then(m => ({ default: m.FlashcardsScreen })))
const ReviewHubScreen = lazy(() => import('./screens/ReviewHubScreen').then(m => ({ default: m.ReviewHubScreen })))
const WrongAnswerListScreen = lazy(() => import('./screens/WrongAnswerListScreen').then(m => ({ default: m.WrongAnswerListScreen })))
const FermiScreen = lazy(() => import('./screens/FermiScreen').then(m => ({ default: m.FermiScreen })))
const DailyFermiScreen = lazy(() => import('./screens/DailyFermiScreen').then(m => ({ default: m.DailyFermiScreen })))
const FermiRankingScreen = lazy(() => import('./screens/FermiRankingScreen').then(m => ({ default: m.FermiRankingScreen })))
const RoleplaySelectScreen = lazy(() => import('./screens/RoleplaySelectScreen').then(m => ({ default: m.RoleplaySelectScreen })))
const RoleplayChatScreen = lazy(() => import('./screens/RoleplayChatScreen').then(m => ({ default: m.RoleplayChatScreen })))
const ReportProblemScreen = lazy(() => import('./screens/ReportProblemScreen').then(m => ({ default: m.ReportProblemScreen })))
const OnboardingScreen = lazy(() => import('./screens/OnboardingScreen').then(m => ({ default: m.OnboardingScreen })))
const BetaCodeScreen = lazy(() => import('./screens/BetaCodeScreen').then(m => ({ default: m.BetaCodeScreen })))
const AIProblemGenScreen = lazy(() => import('./screens/AIProblemGenScreen').then(m => ({ default: m.AIProblemGenScreen })))
const AIProblemScreen = lazy(() => import('./screens/AIProblemScreen').then(m => ({ default: m.AIProblemScreen })))
const FeedbackScreen = lazy(() => import('./screens/FeedbackScreen').then(m => ({ default: m.FeedbackScreen })))
const PlacementTestScreen = lazy(() => import('./screens/PlacementTestScreen').then(m => ({ default: m.PlacementTestScreen })))
const PersonalCourseScreen = lazy(() => import('./screens/PersonalCourseScreen').then(m => ({ default: m.PersonalCourseScreen })))
const PricingScreen = lazy(() => import('./screens/PricingScreen').then(m => ({ default: m.PricingScreen })))
const StreakScreen = lazy(() => import('./screens/StreakScreen').then(m => ({ default: m.StreakScreen })))
const SettingsScreen = lazy(() => import('./screens/SettingsScreen').then(m => ({ default: m.SettingsScreen })))
const AccountSettingsScreen = lazy(() => import('./screens/AccountSettingsScreen').then(m => ({ default: m.AccountSettingsScreen })))
const NotificationSettingsScreen = lazy(() => import('./screens/NotificationSettingsScreen').then(m => ({ default: m.NotificationSettingsScreen })))
const CompletedLessonsScreen = lazy(() => import('./screens/CompletedLessonsScreen').then(m => ({ default: m.CompletedLessonsScreen })))
const StudyTimeScreen = lazy(() => import('./screens/StudyTimeScreen').then(m => ({ default: m.StudyTimeScreen })))
const LanguageScreen = lazy(() => import('./screens/LanguageScreen').then(m => ({ default: m.LanguageScreen })))
const RankScreen = lazy(() => import('./screens/RankScreen').then(m => ({ default: m.RankScreen })))
const LoginScreen = lazy(() => import('./screens/LoginScreen').then(m => ({ default: m.LoginScreen })))
const DailyProblemScreen = lazy(() => import('./screens/DailyProblemScreen').then(m => ({ default: m.DailyProblemScreen })))
const JournalScreen = lazy(() => import('./screens/JournalScreen').then(m => ({ default: m.JournalScreen })))
import { allLessons, getAllLessonsFlat } from './lessonData'
import { getCurrentLevel } from './screens/homeHelpers'


import type { AIProblemSet } from './aiProblemStore'
import { loadTheme, applyTheme } from './theme'
// import { loadGuestUser } from './guestUser'
import { getCompletedCount, getXp, getDisplayName, setDisplayName, recordCompletion, addStudyTime } from './stats'
import { recordActivity } from './activityLog'
import { updateDisplayName } from './supabase'
import { isAdmin } from './admin'
import { onAuthChange, logout, getInitialUser, type User } from './supabase'
import { hideSplash } from './platform'
import { SnackbarProvider } from './components/Snackbar'
import { syncOnLogin, syncOnLogout } from './syncService'
import { TutorialOverlay, TutorialFAB } from './components/TutorialOverlay'
import { tutorial } from './tutorial/tutorialStorage'
import { SparklesIcon, MessageSquareIcon, BookOpenIcon } from './icons'
import { t } from './i18n'
import { useAssistantName } from './hooks/useAssistantName'

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
  | { type: 'lesson'; lessonId: number }
  | { type: 'lesson-complete'; lessonId: number; durationSec: number; prevLevel: number }
  | { type: 'flashcards'; mode?: 'due' | 'weak' }
  | { type: 'review-hub' }
  | { type: 'wrong-answers' }
  | { type: 'fermi' }
  | { type: 'daily-fermi' }
  | { type: 'fermi-ranking' }
  | { type: 'roleplay' }
  | { type: 'roleplay-chat'; situationId: string }
  | { type: 'daily-problem' }
  | { type: 'ai-problem-gen' }
  | { type: 'ai-problem'; problem: AIProblemSet }
  | { type: 'feedback' }
  | { type: 'placement-test' }
  | { type: 'personal-course' }
  | { type: 'pricing' }
  | { type: 'streak' }
  | { type: 'settings'; section?: 'account' | 'notifications' | 'plan' }
  | { type: 'account-settings' }
  | { type: 'notification-settings' }
  | { type: 'completed-lessons' }
  | { type: 'study-time' }
  | { type: 'language' }
  | { type: 'rank' }
  | { type: 'login'; tab?: 'google' | 'email' }
  | { type: 'report-problem'; context: { lessonId?: number; lessonTitle?: string; question?: string } }
  | { type: 'onboarding' }
  | { type: 'login-gate'; feature: 'ai-gen' | 'roleplay' | 'advanced-lessons' }
  | { type: 'beta-code' }
  | { type: 'journal'; sub?: 'today' | 'calendar' | 'goals' | 'search' }

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
    if (preview === 'settings') return { type: 'settings' }
    if (preview === 'account') return { type: 'account-settings' }
    if (preview === 'notifications') return { type: 'notification-settings' }
    if (preview === 'roleplay-select') return { type: 'roleplay' }
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
  // popstate ハンドラ内でscreen stateを参照するための ref
  const screenRef = useRef<Screen>(screen)
  // popstate による遷移かどうかのフラグ（push 抑制用）
  const isPopNavRef = useRef(false)
  void isAdmin() // reserved for future admin checks

  // SCRUM-200: 新規インストール時にlocalStorageリセット（アンインストール後のデータ残留対策）
  // useEffect に移すことで React Strict Mode の二重レンダリングでの意図しない複数回実行を防ぐ
  useEffect(() => { checkAndInitInstall() }, [])

  // screenRef を常に最新の screen と同期させる（コンカレントレンダリング対策）
  useEffect(() => { screenRef.current = screen }, [screen])

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
    // SplashScreen は launchAutoHide:false 設定。auth 解決後または 1500ms タイムアウトで必ず消す。
    const splashTimer = setTimeout(() => { void hideSplash() }, 1500)
    // 初回起動時にセッションを取得し、ログイン済ならホームへ
    getInitialUser().then(async (user) => {
      setCurrentUser(user)
      if (user) await syncOnLogin(user.id)
      const initial = getInitialScreen(user)
      setScreen(initial)
      window.history.replaceState({ screen: initial }, '')
      setAuthReady(true)
      clearTimeout(splashTimer)
      void hideSplash()
    }).catch(() => {
      // ネットワークエラー等でも必ずSplashを閉じてホームへ遷移させる
      clearTimeout(splashTimer)
      setAuthReady(true)
      void hideSplash()
    })
    const unsub = onAuthChange(async (user) => {
      setCurrentUser(user)
      if (user) {
        await syncOnLogin(user.id)
        // preview=onboarding 中はホームに戻さない
        const isPreview = typeof location !== 'undefined' && new URL(location.href).searchParams.get('preview') === 'onboarding'
        if (!isPreview) {
          setScreen((s) => s.type === 'onboarding' ? { type: 'home' } : s)
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
      const elapsedMs = Date.now() - lessonStartTimeRef.current
      const durationSec = Math.max(60, Math.floor(elapsedMs / 1000))
      const prevLevel = getCurrentLevel(getXp() - 50).level  // before XP add
      recordCompletion(`lesson-${lessonId}`)
      const lessonTitle = allLessons[lessonId]?.title
      recordActivity({
        type: 'lesson',
        id: String(lessonId),
        title: lessonTitle,
        meta: { durationSec },
      })
      if (elapsedMs > 5000) addStudyTime(elapsedMs)
      navigate({ type: 'lesson-complete', lessonId, durationSec, prevLevel })
    } else if (tab === 'ranking') {
      navigate({ type: 'fermi-ranking' }, true)
    } else if (tab === 'journal') {
      navigate({ type: 'journal' }, true)
    } else {
      navigate({ type: tab }, true)
    }
  }

  // 認証完了前はスプラッシュ表示
  if (!authReady) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100dvh', background: 'var(--bg-base)' }}>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', letterSpacing: '0.05em' }}>LOGIC</div>
      </div>
    )
  }

  // LoginGate: full-screen, no AppShell
  if (screen.type === 'login-gate') {
    const GATE_CONFIG = {
      'ai-gen': {
        featureName: t('loginGate.feature.aiGen'),
        featureIcon: <SparklesIcon width={36} height={36} />,
        featureDesc: t('loginGate.feature.aiGenDesc'),
      },
      'roleplay': {
        featureName: t('loginGate.feature.roleplay'),
        featureIcon: <MessageSquareIcon width={36} height={36} />,
        featureDesc: t('loginGate.feature.roleplayDesc'),
      },
      'advanced-lessons': {
        featureName: t('loginGate.feature.advancedLessons'),
        featureIcon: <BookOpenIcon width={36} height={36} />,
        featureDesc: t('loginGate.feature.advancedLessonsDesc'),
      },
    } as const
    const cfg = GATE_CONFIG[screen.feature]
    return (
      <LoginGate
        featureName={cfg.featureName}
        featureIcon={cfg.featureIcon}
        featureDesc={cfg.featureDesc}
        onLogin={() => navigate({ type: 'login' })}
        onBack={handleBack}
      />
    )
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

  // BetaCode: show full-screen, no AppShell
  if (screen.type === 'beta-code') {
    return (
      <Suspense fallback={null}>
        <BetaCodeScreen
          onSuccess={() => navigate({ type: 'home' })}
          onSkip={() => navigate({ type: 'home' })}
        />
      </Suspense>
    )
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
          onOpenRoleplay={() => currentUser ? navigate({ type: 'roleplay' }) : navigate({ type: 'login-gate', feature: 'roleplay' })}
          onOpenAIGen={() => currentUser ? navigate({ type: 'ai-problem-gen' }) : navigate({ type: 'login-gate', feature: 'ai-gen' })}
          onOpenRoadmap={() => { setTab('lessons'); navigate({ type: 'lessons' }, true) }}
          onNavigateToDailyFermi={() => navigate({ type: 'daily-fermi' })}
          onOpenPlacementTest={() => navigate({ type: 'placement-test' })}
          onOpenReviewHub={() => navigate({ type: 'review-hub' })}
          onOpenPricing={() => navigate({ type: 'pricing' })}
        />
      )}


      {screen.type === 'lessons' && (
        <RoadmapScreenV3
          onOpenLesson={handleOpenLesson}
          onOpenCategory={(cat) => navigate({ type: 'roadmap', category: cat })}
          onOpenPersonalCourse={() => navigate({ type: 'personal-course' })}
          onOpenPlacementTest={() => navigate({ type: 'placement-test' })}
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

      {screen.type === 'flashcards' && <FlashcardsScreen onBack={handleBack} mode={screen.mode} />}
      {screen.type === 'review-hub' && (
        <ReviewHubScreen
          onBack={handleBack}
          onOpenFlashcards={(mode) => navigate({ type: 'flashcards', mode })}
          onOpenWrongAnswers={() => navigate({ type: 'wrong-answers' })}
        />
      )}
      {screen.type === 'wrong-answers' && (
        <WrongAnswerListScreen
          onBack={handleBack}
          onOpenLesson={handleOpenLesson}
        />
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
        <JournalScreen
          userId={currentUser?.id ?? null}
          assistantName={assistantName}
          initialSub={screen.sub}
          onRequestLogin={() => navigate({ type: 'login' })}
        />
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

      {screen.type === 'roleplay' && (
        <RoleplaySelectScreen
          onBack={() => navigate({ type: 'lessons' }, true)}
          onStart={(situationId) => navigate({ type: 'roleplay-chat', situationId })}
          onUpgrade={() => navigate({ type: 'pricing' })}
        />
      )}

      {screen.type === 'roleplay-chat' && (
        <RoleplayChatScreen
          situationId={screen.situationId}
          onBack={() => navigate({ type: 'roleplay' })}
        />
      )}

      {screen.type === 'profile' && (
        <ProfileScreenV3
          userName={userName}
          assistantName={assistantName}
          onUpdateAssistantName={updateAssistantName}
          onOpenSettings={(section) => navigate(section === 'account' ? { type: 'account-settings' } : section === 'notifications' ? { type: 'notification-settings' } : { type: 'settings' })}
          onOpenFeedback={() => navigate({ type: 'feedback' })}
          onOpenPricing={() => navigate({ type: 'pricing' })}
          onOpenPlacementTest={() => navigate({ type: 'placement-test' })}
          onOpenLesson={(id) => navigate({ type: 'lesson', lessonId: id })}
          onOpenLanguage={() => navigate({ type: 'language' })}
        />
      )}
      {screen.type === 'rank' && <RankScreen onBack={handleBack} />}
      {screen.type === 'streak' && <StreakScreen onBack={handleBack} />}
      {screen.type === 'completed-lessons' && <CompletedLessonsScreen onBack={handleBack} />}
      {screen.type === 'study-time' && <StudyTimeScreen onBack={handleBack} />}
      {screen.type === 'settings' && (
        <SettingsScreen
          onBack={handleBack}
          onOpenLanguage={() => navigate({ type: 'language' })}
          onOpenLogin={() => navigate({ type: 'login' })}
          onOpenPricing={() => navigate({ type: 'pricing' })}
          currentUser={currentUser ? { email: currentUser.email ?? '' } : null}
          onLogout={async () => { await logout(); setCurrentUser(null) }}
          initialSection={screen.section}
        />
      )}
      {screen.type === 'login' && (
        <LoginScreen
          initialTab={screen.tab}
          onLoginSuccess={(user) => {
            setCurrentUser(user)
            // 名前が未設定の場合はポップアップ表示
            const hasName = user?.user_metadata?.full_name || user?.user_metadata?.name || getDisplayName()
            if (!hasName) { setShowNamePopup(true) }
            navigate({ type: 'home' })
          }}
        />
      )}
      {screen.type === 'language' && <LanguageScreen onBack={() => navigate({ type: 'settings' })} />}
      {screen.type === 'account-settings' && (
        <AccountSettingsScreen
          onBack={handleBack}
          currentUser={currentUser ? { email: currentUser.email ?? '' } : null}
          onOpenLogin={(tab) => navigate({ type: 'login', tab })}
          onLogout={() => { setCurrentUser(null); navigate({ type: 'profile' }) }}
        />
      )}
      {screen.type === 'notification-settings' && (
        <NotificationSettingsScreen onBack={handleBack} />
      )}

      {screen.type === 'report-problem' && (
        <ReportProblemScreen
          context={screen.context}
          onBack={handleBack}
        />
      )}

      {screen.type === 'lesson' && (
        <LessonStoriesScreen
          lessonId={screen.lessonId}
          onComplete={handleComplete}
          onClose={handleBack}
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
                navigate({ type: 'lesson', lessonId: nextLesson.id })
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

function AppV3WithProviders() {
  return (
    <SnackbarProvider>
      <AppV3 />
    </SnackbarProvider>
  )
}

export default AppV3WithProviders
