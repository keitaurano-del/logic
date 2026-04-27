// Logic v3 — full app shell with all screens
import { useEffect, useState, useRef, useCallback } from 'react'
import { AppShell, type Tab } from './components/AppShell'
import { HomeScreenV3 } from './screens/HomeScreenV3'
import { FlashcardsScreen } from './screens/FlashcardsScreen'
import { FermiScreen } from './screens/FermiScreen'
import { DailyFermiScreen } from './screens/DailyFermiScreen'
import { DeviationScreen } from './screens/DeviationScreen'
import { RankingScreen } from './screens/RankingScreen'
import { RoleplaySelectScreen } from './screens/RoleplaySelectScreen'
import { RoleplayChatScreen } from './screens/RoleplayChatScreen'
import { JournalInputScreen } from './screens/JournalInputScreen'
import { WorksheetScreen } from './screens/WorksheetScreen'
import { ReportProblemScreen } from './screens/ReportProblemScreen'
import { OnboardingScreen } from './screens/OnboardingScreen'

import { AIProblemGenScreen } from './screens/AIProblemGenScreen'
import { AIProblemScreen } from './screens/AIProblemScreen'
import { FeedbackScreen } from './screens/FeedbackScreen'
import { PlacementTestScreen } from './screens/PlacementTestScreen'
import { PricingScreen } from './screens/PricingScreen'
import { StreakScreen } from './screens/StreakScreen'
import { SettingsScreen } from './screens/SettingsScreen'
import { AccountSettingsScreen } from './screens/AccountSettingsScreen'
import { NotificationSettingsScreen } from './screens/NotificationSettingsScreen'
import { CompletedLessonsScreen } from './screens/CompletedLessonsScreen'
import { StudyTimeScreen } from './screens/StudyTimeScreen'
import { LanguageScreen } from './screens/LanguageScreen'
import { RankScreen } from './screens/RankScreen'
import { LoginScreen } from './screens/LoginScreen'
import { RoadmapScreenV3 } from './screens/RoadmapScreenV3'
import { StatsScreenV3 } from './screens/StatsScreenV3'
import { ProfileScreenV3 } from './screens/ProfileScreenV3'
import { LessonStoriesScreen } from './screens/LessonStoriesScreen'
import { LessonCompleteScreen } from './screens/LessonCompleteScreen'
import { allLessons, getAllLessonsFlat } from './lessonData'
import { getCurrentLevel } from './screens/homeHelpers'


import type { AIProblemSet } from './aiProblemStore'
import { loadTheme, applyTheme } from './theme'
// import { loadGuestUser } from './guestUser'
import { getCompletedCount, getXp } from './stats'
import { isAdmin } from './admin'
import { onAuthChange, logout, getInitialUser, type User } from './supabase'
import { syncOnLogin, syncOnLogout } from './syncService'

const ONBOARDED_KEY = 'logic-onboarded'

// 同カテゴリの次の未完了レッスンIDを返す（なければ null）
type Screen =
  | { type: 'home' }
  | { type: 'lessons' }
  | { type: 'stats' }
  | { type: 'roadmap'; category?: string }
  | { type: 'profile' }
  | { type: 'lesson'; lessonId: number }
  | { type: 'lesson-complete'; lessonId: number; durationSec: number; prevLevel: number }
  | { type: 'flashcards' }
  | { type: 'fermi' }
  | { type: 'daily-fermi' }
  | { type: 'deviation' }
  | { type: 'ranking' }
  | { type: 'roleplay' }
  | { type: 'roleplay-chat'; situationId: string }
  | { type: 'journal-input' }
  | { type: 'worksheet' }
  | { type: 'daily-problem' }
  | { type: 'ai-problem-gen' }
  | { type: 'ai-problem'; problem: AIProblemSet }
  | { type: 'feedback' }
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

// LESSON_LIST is now managed within RoadmapScreen

function getInitialScreen(user: User | null): Screen {
  // ?preview=onboarding で強制表示（確認用）
  if (typeof location !== 'undefined' && new URL(location.href).searchParams.get('preview') === 'onboarding') {
    return { type: 'onboarding' }
  }
  // ログイン済みユーザーはオンボーディングをスキップ
  if (user) return { type: 'home' }
  if (localStorage.getItem(ONBOARDED_KEY) !== '1') {
    return { type: 'onboarding' }
  }
  return { type: 'home' }
}

// ── ルート画面かどうか判定 ──
const ROOT_SCREENS = new Set<string>(['home', 'lessons', 'stats', 'profile'])

function AppV3() {
  const [tab, setTab] = useState<Tab>('home')
  const [screen, setScreen] = useState<Screen>(() => getInitialScreen(null))
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [authReady, setAuthReady] = useState(false)
  // popstate ハンドラ内でscreen stateを参照するための ref
  const screenRef = useRef<Screen>(screen)
  screenRef.current = screen
  // popstate による遷移かどうかのフラグ（push 抑制用）
  const isPopNavRef = useRef(false)
  void isAdmin() // reserved for future admin checks

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
        }
      } else {
        syncOnLogout()
      }
    })
    return unsub
  }, [])

  const userName = currentUser?.user_metadata?.full_name
    ?? currentUser?.user_metadata?.name
    ?? currentUser?.email
    ?? '思考トレーニー'
  const completed = getCompletedCount()
  const xp = completed * 100
  const level = Math.floor(xp / 1000) + 1

  const handleTabChange = (next: Tab) => {
    setTab(next)
    if (next === 'stats') navigate({ type: 'stats' }, true)
    else navigate({ type: next }, true)
  }

  const handleOpenLesson = (lessonId: number) => {
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
      const durationSec = Math.max(60, Math.floor((Date.now() - lessonStartTimeRef.current) / 1000))
      const prevLevel = getCurrentLevel(getXp() - 50).level  // before XP add
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

  // Onboarding: show full-screen, no AppShell
  if (screen.type === 'onboarding') {
    return (
      <OnboardingScreen
        onComplete={() => {
          localStorage.setItem(ONBOARDED_KEY, '1')
          navigate({ type: 'home' })
        }}
      />
    )
  }

  return (
    <AppShell
      activeTab={tab}
      onTabChange={handleTabChange}
      userName={userName}
      userLevel={`Lv.${level}`}
      hideTabBar={screen.type === 'lesson' || screen.type === 'lesson-complete'}
    >
      {screen.type === 'home' && (
        <HomeScreenV3
          userName={userName}
          onOpenLesson={handleOpenLesson}
          onOpenCategory={(cat) => {
            if (cat === 'fermi') navigate({ type: 'daily-fermi' })
            else navigate({ type: 'roadmap', category: cat as any })
          }}
          onOpenRank={() => navigate({ type: 'rank' })}
          onOpenStats={() => { setTab('stats'); navigate({ type: 'stats' }, true) }}
          onOpenRoleplay={() => navigate({ type: 'roleplay' })}
          onOpenAIGen={() => navigate({ type: 'ai-problem-gen' })}
          onOpenRoadmap={() => { setTab('lessons'); navigate({ type: 'lessons' }, true) }}
          onNavigateToDailyFermi={() => navigate({ type: 'daily-fermi' })}
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

      {screen.type === 'flashcards' && <FlashcardsScreen onBack={handleBack} />}
      {screen.type === 'fermi' && <FermiScreen onBack={handleBack} onReport={(ctx) => navigate({ type: 'report-problem', context: ctx })} />}
      {screen.type === 'daily-fermi' && <DailyFermiScreen onBack={handleBack} onReport={(ctx) => navigate({ type: 'report-problem', context: ctx })} />}
      {screen.type === 'journal-input' && <JournalInputScreen onBack={handleBack} />}
      {screen.type === 'worksheet' && <WorksheetScreen onBack={handleBack} />}

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

      {screen.type === 'deviation' && (
        <DeviationScreen
          onBack={handleBack}
          onRetakeTest={() => navigate({ type: 'placement-test' })}
          onStartLesson={handleOpenLesson}
        />
      )}

      {screen.type === 'stats' && (
        <StatsScreenV3 onBack={handleBack} />
      )}

      {screen.type === 'ranking' && (
        <RankingScreen
          onBack={handleBack}
          onTakeTest={() => navigate({ type: 'placement-test' })}
        />
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
          onBack={handleBack}
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
          onLoginSuccess={(user) => { setCurrentUser(user); navigate({ type: 'settings' }) }}
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
    </AppShell>
  )
}

export default AppV3
