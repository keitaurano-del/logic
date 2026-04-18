// Logic v3 — full app shell with all screens
import { useEffect, useState } from 'react'
import { AppShell, type Tab } from './components/AppShell'
import { HomeScreen } from './screens/HomeScreen'
import { LessonScreen } from './screens/LessonScreen'
import { ProfileScreen } from './screens/ProfileScreen'
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
import { CompletedLessonsScreen } from './screens/CompletedLessonsScreen'
import { StudyTimeScreen } from './screens/StudyTimeScreen'
import { LanguageScreen } from './screens/LanguageScreen'
import { RankScreen } from './screens/RankScreen'
import { LoginScreen } from './screens/LoginScreen'
import { RoadmapScreen } from './screens/RoadmapScreen'
import type { AIProblemSet } from './aiProblemStore'
import { loadTheme, applyTheme } from './theme'
import { loadGuestUser } from './guestUser'
import { getCompletedCount } from './stats'
import { isAdmin } from './admin'
import { onAuthChange, logout, getInitialUser, type User } from './supabase'

const ONBOARDED_KEY = 'logic-onboarded'

type Screen =
  | { type: 'home' }
  | { type: 'lessons' }
  | { type: 'roadmap' }
  | { type: 'profile' }
  | { type: 'lesson'; lessonId: number }
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
  | { type: 'settings' }
  | { type: 'completed-lessons' }
  | { type: 'study-time' }
  | { type: 'language' }
  | { type: 'rank' }
  | { type: 'login' }
  | { type: 'report-problem'; context: { lessonId?: number; lessonTitle?: string; question?: string } }
  | { type: 'onboarding' }

// LESSON_LIST is now managed within RoadmapScreen

function getInitialScreen(user: User | null): Screen {
  // ログイン済みユーザーはオンボーディングをスキップ
  if (user) return { type: 'home' }
  if (localStorage.getItem(ONBOARDED_KEY) !== '1') {
    return { type: 'onboarding' }
  }
  return { type: 'home' }
}

function AppV3() {
  const [tab, setTab] = useState<Tab>('home')
  const [screen, setScreen] = useState<Screen>(() => getInitialScreen(null))
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [authReady, setAuthReady] = useState(false)
  void isAdmin() // reserved for future admin checks

  useEffect(() => {
    applyTheme(loadTheme())
    // 初回起動時にセッションを取得し、ログイン済ならホームへ
    getInitialUser().then((user) => {
      setCurrentUser(user)
      setScreen(getInitialScreen(user))
      setAuthReady(true)
    })
    const unsub = onAuthChange((user) => {
      setCurrentUser(user)
      if (user) setScreen((s) => s.type === 'onboarding' ? { type: 'home' } : s)
    })
    return unsub
  }, [])

  const userName = currentUser?.user_metadata?.full_name
    ?? currentUser?.user_metadata?.name
    ?? currentUser?.email
    ?? loadGuestUser().id
  const completed = getCompletedCount()
  const xp = completed * 100
  const level = Math.floor(xp / 1000) + 1

  const handleTabChange = (next: Tab) => {
    setTab(next)
    setScreen({ type: next })
  }

  const handleOpenLesson = (lessonId: number) => {
    setScreen({ type: 'lesson', lessonId })
  }

  const handleBack = () => {
    setScreen({ type: tab })
  }

  const handleComplete = () => {
    setScreen({ type: tab })
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
          setScreen({ type: 'home' })
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
    >
      {screen.type === 'home' && (
        <HomeScreen
          userName={userName}
          onOpenLesson={handleOpenLesson}
          onOpenCategory={(cat) => {
            if (cat === 'fermi') setScreen({ type: 'daily-fermi' })
            else setScreen({ type: 'roadmap' })
          }}
          onOpenRank={() => setScreen({ type: 'rank' })}
          onOpenDeviation={() => setScreen({ type: 'deviation' })}
          onOpenRanking={() => setScreen({ type: 'ranking' })}
          onOpenStreak={() => setScreen({ type: 'streak' })}
          onOpenRoleplay={() => setScreen({ type: 'roleplay' })}
          onOpenFlashcards={() => setScreen({ type: 'flashcards' })}
          onOpenAIGen={() => setScreen({ type: 'ai-problem-gen' })}
          onOpenPricing={() => setScreen({ type: 'pricing' })}
          onOpenFeedback={() => setScreen({ type: 'feedback' })}
        />
      )}

      {screen.type === 'lessons' && (
        <RoadmapScreen onOpenLesson={handleOpenLesson} />
      )}

      {screen.type === 'roadmap' && (
        <RoadmapScreen onOpenLesson={handleOpenLesson} />
      )}

      {screen.type === 'flashcards' && <FlashcardsScreen onBack={handleBack} />}
      {screen.type === 'fermi' && <FermiScreen onBack={handleBack} onReport={(ctx) => setScreen({ type: 'report-problem', context: ctx })} />}
      {screen.type === 'daily-fermi' && <DailyFermiScreen onBack={handleBack} onReport={(ctx) => setScreen({ type: 'report-problem', context: ctx })} />}
      {screen.type === 'journal-input' && <JournalInputScreen onBack={handleBack} />}
      {screen.type === 'worksheet' && <WorksheetScreen onBack={handleBack} />}

      {screen.type === 'feedback' && <FeedbackScreen onBack={handleBack} />}
      {screen.type === 'pricing' && <PricingScreen onBack={handleBack} />}
      {screen.type === 'ai-problem-gen' && (
        <AIProblemGenScreen
          onBack={handleBack}
          onPlay={(problem) => setScreen({ type: 'ai-problem', problem })}
          onUpgrade={() => setScreen({ type: 'pricing' })}
        />
      )}

      {screen.type === 'ai-problem' && (
        <AIProblemScreen
          problem={screen.problem}
          onBack={() => setScreen({ type: 'ai-problem-gen' })}
          onReport={(ctx) => setScreen({ type: 'report-problem', context: ctx })}
        />
      )}

      {screen.type === 'deviation' && (
        <DeviationScreen
          onBack={handleBack}
          onRetakeTest={() => setScreen({ type: 'placement-test' })}
          onStartLesson={handleOpenLesson}
        />
      )}

      {screen.type === 'ranking' && (
        <RankingScreen
          onBack={handleBack}
          onTakeTest={() => setScreen({ type: 'placement-test' })}
        />
      )}

      {screen.type === 'placement-test' && (
        <PlacementTestScreen
          onBack={handleBack}
          onComplete={() => setScreen({ type: 'deviation' })}
          onSkip={handleBack}
        />
      )}

      {screen.type === 'roleplay' && (
        <RoleplaySelectScreen
          onBack={handleBack}
          onStart={(situationId) => setScreen({ type: 'roleplay-chat', situationId })}
          onUpgrade={() => setScreen({ type: 'pricing' })}
        />
      )}

      {screen.type === 'roleplay-chat' && (
        <RoleplayChatScreen
          situationId={screen.situationId}
          onBack={() => setScreen({ type: 'roleplay' })}
        />
      )}

      {screen.type === 'profile' && (
        <ProfileScreen
          userName={userName}
          onOpenStreak={() => setScreen({ type: 'streak' })}
          onOpenSettings={() => setScreen({ type: 'settings' })}
          onOpenCompleted={() => setScreen({ type: 'completed-lessons' })}
          onOpenStudyTime={() => setScreen({ type: 'study-time' })}
          onOpenRank={() => setScreen({ type: 'rank' })}
          onOpenRanking={() => setScreen({ type: 'ranking' })}
        />
      )}
      {screen.type === 'rank' && <RankScreen onBack={handleBack} />}
      {screen.type === 'streak' && <StreakScreen onBack={handleBack} />}
      {screen.type === 'completed-lessons' && <CompletedLessonsScreen onBack={handleBack} />}
      {screen.type === 'study-time' && <StudyTimeScreen onBack={handleBack} />}
      {screen.type === 'settings' && (
        <SettingsScreen
          onBack={handleBack}
          onOpenLanguage={() => setScreen({ type: 'language' })}
          onOpenLogin={() => setScreen({ type: 'login' })}
          onOpenPricing={() => setScreen({ type: 'pricing' })}
          currentUser={currentUser ? { email: currentUser.email ?? '' } : null}
          onLogout={async () => { await logout(); setCurrentUser(null) }}
        />
      )}
      {screen.type === 'login' && (
        <LoginScreen
          onLoginSuccess={(user) => { setCurrentUser(user); setScreen({ type: 'settings' }) }}
        />
      )}
      {screen.type === 'language' && <LanguageScreen onBack={() => setScreen({ type: 'settings' })} />}

      {screen.type === 'report-problem' && (
        <ReportProblemScreen
          context={screen.context}
          onBack={handleBack}
        />
      )}

      {screen.type === 'lesson' && (
        <LessonScreen
          lessonId={screen.lessonId}
          onBack={handleBack}
          onComplete={handleComplete}
          onReport={(ctx) => setScreen({ type: 'report-problem', context: ctx })}
        />
      )}
    </AppShell>
  )
}

export default AppV3
