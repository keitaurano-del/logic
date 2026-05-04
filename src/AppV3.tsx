// Logic v3 — full app shell with all screens
import { useEffect, useState, useRef, useCallback, lazy, Suspense } from 'react'
import { AppShell, type Tab } from './components/AppShell'
import { HomeScreenV3 } from './screens/HomeScreenV3'
import { RankingScreen } from './screens/RankingScreen'
import { LoginGate } from './components/LoginGate'
import { RoadmapScreenV3 } from './screens/RoadmapScreenV3'
import { ProfileScreenV3 } from './screens/ProfileScreenV3'
import { LessonStoriesScreen } from './screens/LessonStoriesScreen'
import { LessonCompleteScreen } from './screens/LessonCompleteScreen'

// Lazy-load lower-frequency screens to keep initial bundle small.
const FlashcardsScreen = lazy(() => import('./screens/FlashcardsScreen').then(m => ({ default: m.FlashcardsScreen })))
const FermiScreen = lazy(() => import('./screens/FermiScreen').then(m => ({ default: m.FermiScreen })))
const DailyFermiScreen = lazy(() => import('./screens/DailyFermiScreen').then(m => ({ default: m.DailyFermiScreen })))
const DeviationScreen = lazy(() => import('./screens/DeviationScreen').then(m => ({ default: m.DeviationScreen })))
const FermiRankingScreen = lazy(() => import('./screens/FermiRankingScreen').then(m => ({ default: m.FermiRankingScreen })))
const RoleplaySelectScreen = lazy(() => import('./screens/RoleplaySelectScreen').then(m => ({ default: m.RoleplaySelectScreen })))
const RoleplayChatScreen = lazy(() => import('./screens/RoleplayChatScreen').then(m => ({ default: m.RoleplayChatScreen })))
const JournalInputScreen = lazy(() => import('./screens/JournalInputScreen').then(m => ({ default: m.JournalInputScreen })))
const WorksheetScreen = lazy(() => import('./screens/WorksheetScreen').then(m => ({ default: m.WorksheetScreen })))
const ReportProblemScreen = lazy(() => import('./screens/ReportProblemScreen').then(m => ({ default: m.ReportProblemScreen })))
const OnboardingScreen = lazy(() => import('./screens/OnboardingScreen').then(m => ({ default: m.OnboardingScreen })))
const BetaCodeScreen = lazy(() => import('./screens/BetaCodeScreen').then(m => ({ default: m.BetaCodeScreen })))
const AIProblemGenScreen = lazy(() => import('./screens/AIProblemGenScreen').then(m => ({ default: m.AIProblemGenScreen })))
const AIProblemScreen = lazy(() => import('./screens/AIProblemScreen').then(m => ({ default: m.AIProblemScreen })))
const FeedbackScreen = lazy(() => import('./screens/FeedbackScreen').then(m => ({ default: m.FeedbackScreen })))
const FeedbackDashboardScreen = lazy(() => import('./screens/FeedbackDashboardScreen').then(m => ({ default: m.FeedbackDashboardScreen })))
const PlacementTestScreen = lazy(() => import('./screens/PlacementTestScreen').then(m => ({ default: m.PlacementTestScreen })))
const PricingScreen = lazy(() => import('./screens/PricingScreen').then(m => ({ default: m.PricingScreen })))
// PricingV3.tsx は AppV3 では未使用。PricingScreen.tsx が最新・完全な実装（startCheckout 接続済み）であるため、
// PricingV3 は削除せず残しておく（将来参照用）
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
import { allLessons, getAllLessonsFlat } from './lessonData'
import { getCurrentLevel } from './screens/homeHelpers'


import type { AIProblemSet } from './aiProblemStore'
import { loadTheme, applyTheme } from './theme'
// import { loadGuestUser } from './guestUser'
import { getCompletedCount, getXp, getDisplayName, setDisplayName, recordCompletion, addStudyTime } from './stats'
import { updateDisplayName } from './supabase'
import { isAdmin } from './admin'
import { onAuthChange, logout, getInitialUser, type User } from './supabase'
import { syncOnLogin, syncOnLogout } from './syncService'
import { TutorialOverlay, TutorialFAB } from './components/TutorialOverlay'
import { tutorial } from './tutorial/tutorialStorage'

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
  | { type: 'fermi' }
  | { type: 'daily-fermi' }
  | { type: 'deviation' }
  | { type: 'ranking' }
  | { type: 'fermi-ranking' }
  | { type: 'roleplay' }
  | { type: 'roleplay-chat'; situationId: string }
  | { type: 'journal-input' }
  | { type: 'worksheet' }
  | { type: 'daily-problem' }
  | { type: 'ai-problem-gen' }
  | { type: 'ai-problem'; problem: AIProblemSet }
  | { type: 'feedback' }
  | { type: 'feedback-dashboard' }
  | { type: 'placement-test' }
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

// LESSON_LIST is now managed within RoadmapScreen

function getInitialScreen(user: User | null): Screen {
  if (typeof location !== 'undefined') {
    const preview = new URL(location.href).searchParams.get('preview')
    if (preview === 'onboarding') return { type: 'onboarding' }
    if (preview === 'home') return { type: 'home' }
    if (preview === 'lessons') return { type: 'lessons' }
    if (preview === 'ranking') return { type: 'ranking' }
    if (preview === 'profile') return { type: 'profile' }
    if (preview === 'fermi') return { type: 'daily-fermi' }
    if (preview === 'pricing') return { type: 'pricing' }
  }
  // ログイン済みユーザーはオンボーディングをスキップ
  if (user) return { type: 'daily-fermi' }
  // 未ログインは必ずオンボーディングまたはログイン画面へ
  if (localStorage.getItem(ONBOARDED_KEY) !== '1') {
    return { type: 'onboarding' }
  }
  // オンボーディング完了済みだが未ログインの場合はログイン画面へ
  return { type: 'login' }
}

// ── ルート画面かどうか判定 ──
const ROOT_SCREENS = new Set<string>(['home', 'lessons', 'ranking', 'profile'])

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
        if (ROOT_SCREENS.has(s.type)) setTab(s.type as Tab)
        if (s.type === 'fermi-ranking') setTab('ranking')
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

  useEffect(() => {
    applyTheme(loadTheme())
    // 初回起動時にセッションを取得し、ログイン済ならホームへ
    getInitialUser().then(async (user) => {
      setCurrentUser(user)
      if (user) await syncOnLogin(user.id)
      const initial = getInitialScreen(user)
      setScreen(initial)
      window.history.replaceState({ screen: initial }, '')
      setAuthReady(true)
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
    return unsub
  }, [])

  // 表示名: localStorage優先 → user_metadata → email
  const storedName = getDisplayName()
  const userName = storedName
    || currentUser?.user_metadata?.full_name
    || currentUser?.user_metadata?.name
    || currentUser?.email
    || 'ゲスト'
  const completed = getCompletedCount()
  const xp = completed * 100
  const level = Math.floor(xp / 1000) + 1

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
    } else {
      navigate({ type: tab }, true)
    }
  }

  const lessonStartTimeRef = useRef<number>(Date.now())
  const handleComplete = () => {
    if (screen.type === 'lesson') {
      const lessonId = screen.lessonId
      const elapsedMs = Date.now() - lessonStartTimeRef.current
      const durationSec = Math.max(60, Math.floor(elapsedMs / 1000))
      const prevLevel = getCurrentLevel(getXp() - 50).level  // before XP add
      recordCompletion(`lesson-${lessonId}`)
      if (elapsedMs > 5000) addStudyTime(elapsedMs)
      navigate({ type: 'lesson-complete', lessonId, durationSec, prevLevel })
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
        featureName: 'AI問題生成',
        featureIcon: '🤖',
        featureDesc: 'テーマを選ぶだけで、あなた専用の問題をAIが生成します。ロジカルシンキング・フェルミ推定・ケース面接など月30問まで無料で使えます。',
      },
      'roleplay': {
        featureName: 'ロールプレイ',
        featureIcon: '🎭',
        featureDesc: 'ビジネスや哲学のシナリオでAIと対話練習。コンサル面接・プレゼン・ディベートなど実践的なシナリオで思考力を鍛えます。',
      },
      'advanced-lessons': {
        featureName: '中・上級レッスン',
        featureIcon: '📚',
        featureDesc: 'ケース面接・仮説思考・批判的思考など、より実践的で高度なレッスンにアクセスできます。',
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
            else navigate({ type: 'roadmap', category: cat as any })
          }}
          onOpenRank={() => navigate({ type: 'rank' })}
          onOpenStats={() => navigate({ type: 'profile' }, true)}
          onOpenRoleplay={() => currentUser ? navigate({ type: 'roleplay' }) : navigate({ type: 'login-gate', feature: 'roleplay' })}
          onOpenAIGen={() => currentUser ? navigate({ type: 'ai-problem-gen' }) : navigate({ type: 'login-gate', feature: 'ai-gen' })}
          onOpenRoadmap={() => { setTab('lessons'); navigate({ type: 'lessons' }, true) }}
          onNavigateToDailyFermi={() => navigate({ type: 'daily-fermi' })}
          onOpenPlacementTest={() => navigate({ type: 'placement-test' })}
          onOpenFlashcards={(mode) => navigate({ type: 'flashcards', mode })}
        />
      )}


      {screen.type === 'lessons' && (
        <RoadmapScreenV3
          onOpenLesson={handleOpenLesson}
          onOpenCategory={(cat) => navigate({ type: 'roadmap', category: cat as any })}
        />
      )}

      {screen.type === 'roadmap' && (
        <RoadmapScreenV3
          onOpenLesson={handleOpenLesson}
          onOpenCategory={(cat) => navigate({ type: 'roadmap', category: cat as any })}
          initialCategory={screen.category}
          onBack={handleBack}
        />
      )}

      {screen.type === 'flashcards' && <FlashcardsScreen onBack={handleBack} mode={screen.mode} />}
      {screen.type === 'fermi' && <FermiScreen onBack={handleBack} onReport={(ctx) => navigate({ type: 'report-problem', context: ctx })} />}
      {screen.type === 'daily-fermi' && <DailyFermiScreen onBack={handleBack} onReport={(ctx) => navigate({ type: 'report-problem', context: ctx })} />}
      {screen.type === 'journal-input' && <JournalInputScreen onBack={handleBack} />}
      {screen.type === 'worksheet' && <WorksheetScreen onBack={handleBack} />}
      {screen.type === 'daily-problem' && <DailyProblemScreen onBack={handleBack} />}

      {screen.type === 'feedback' && <FeedbackScreen onBack={handleBack} />}
      {screen.type === 'feedback-dashboard' && <FeedbackDashboardScreen onClose={handleBack} />}
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

      {screen.type === 'deviation' && (
        <DeviationScreen
          onBack={handleBack}
          onRetakeTest={() => navigate({ type: 'placement-test' })}
          onStartLesson={handleOpenLesson}
        />
      )}

      {screen.type === 'ranking' && (
        <RankingScreen
          onBack={handleBack}
          onTakeTest={() => navigate({ type: 'placement-test' })}
        />
      )}

      {screen.type === 'fermi-ranking' && (
        <FermiRankingScreen />
      )}

      {screen.type === 'placement-test' && (
        <PlacementTestScreen
          onBack={handleBack}
          onComplete={() => navigate({ type: 'deviation' })}
          onSkip={handleBack}
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
          onOpenSettings={(section) => navigate(section === 'account' ? { type: 'account-settings' } : section === 'notifications' ? { type: 'notification-settings' } : { type: 'settings' })}
          onOpenFeedback={() => navigate({ type: 'feedback' })}
          onOpenPricing={() => navigate({ type: 'pricing' })}
          onOpenPlacementTest={() => navigate({ type: 'placement-test' })}
          onOpenLesson={(id) => navigate({ type: 'lesson', lessonId: id })}
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
              return lesson?.title || 'レッスン'
            } catch { return 'レッスン' }
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
        />
      )}
      </div>
      </Suspense>
    </AppShell>

    {/* SCRUM-195: チュートリアルオーバーレイ */}
    {/* チュートリアルFAB（右下固定ボタン） */}
    {screen.type === 'home' && !showTutorial && showFAB && (
      <TutorialFAB onClick={() => setShowTutorial(true)} onHide={() => { tutorial.markFABDismissed(); setShowFAB(false) }} />
    )}
    {showTutorial && (
      <TutorialOverlay
        onDone={() => setShowTutorial(false)}
        onGoFermi={() => navigate({ type: 'daily-fermi' })}
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
          background: '#252C40', borderRadius: 20, padding: '32px 24px',
          width: '100%', maxWidth: 360, boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(108,142,245,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6C8EF5" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <div style={{ fontSize: 22, fontWeight: 800, color: '#E8ECF4', letterSpacing: '-0.02em' }}>ようこそ！</div>
          </div>
          <div style={{ fontSize: 15, color: '#8FA3C8', marginBottom: 24, lineHeight: 1.6 }}>
            アプリで表示する名前を設定してね
          </div>
          <input
            type="text"
            placeholder="名前を入力（例：田中 太郎）"
            value={nameInput}
            onChange={e => setNameInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && nameInput.trim()) handleSaveName() }}
            autoFocus
            style={{
              width: '100%', padding: '14px 16px', border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: 10, background: 'rgba(255,255,255,0.07)', color: '#E8ECF4',
              fontSize: 16, fontFamily: "'Noto Sans JP', sans-serif",
              outline: 'none', boxSizing: 'border-box', marginBottom: 8,
            }}
          />
          <div style={{ fontSize: 12, color: '#6B82A8', marginBottom: 20 }}>あとで設定画面から変更できるよ</div>
          <button
            onClick={handleSaveName}
            disabled={nameSaving || !nameInput.trim()}
            style={{
              width: '100%', padding: '15px', background: nameInput.trim() ? '#6C8EF5' : '#2E3652',
              border: 'none', borderRadius: 12, fontSize: 16, fontWeight: 700,
              color: nameInput.trim() ? '#1A1F2E' : '#6B82A8',
              cursor: nameInput.trim() ? 'pointer' : 'not-allowed', marginBottom: 10,
            }}
          >{nameSaving ? '保存中…' : '設定する'}</button>
          <button
            onClick={() => setShowNamePopup(false)}
            style={{ width: '100%', background: 'none', border: 'none', color: '#6B82A8', fontSize: 14, cursor: 'pointer', padding: '8px 0' }}
          >あとで設定する</button>
        </div>
      </div>
    )}
    </>
  )
}

export default AppV3
