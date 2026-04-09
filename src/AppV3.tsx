// Logic v3 — full app shell with all screens
import { useEffect, useState, type ReactNode } from 'react'
import { AppShell, type Tab } from './components/AppShell'
import {
  BarChartIcon, TrendingUpIcon, MessageCircleIcon, LayersIcon, CalendarIcon,
  ClipboardListIcon, SparklesIcon, BookOpenIcon, TableIcon, TrophyIcon,
  BrainIcon, BriefcaseIcon, TargetIcon,
} from './icons'
import { HomeScreen } from './screens/HomeScreen'
import { LessonScreen } from './screens/LessonScreen'
import { ProfileScreen } from './screens/ProfileScreen'
import { FlashcardsScreen } from './screens/FlashcardsScreen'
import { FermiScreen } from './screens/FermiScreen'
import { DeviationScreen } from './screens/DeviationScreen'
import { RankingScreen } from './screens/RankingScreen'
import { RoleplaySelectScreen } from './screens/RoleplaySelectScreen'
import { RoleplayChatScreen } from './screens/RoleplayChatScreen'
import { MockExamScreen } from './screens/MockExamScreen'
import { JournalInputScreen } from './screens/JournalInputScreen'
import { WorksheetScreen } from './screens/WorksheetScreen'
import { DailyProblemScreen } from './screens/DailyProblemScreen'
import { AIProblemGenScreen } from './screens/AIProblemGenScreen'
import { AIProblemScreen } from './screens/AIProblemScreen'
import { FeedbackScreen } from './screens/FeedbackScreen'
import { PlacementTestScreen } from './screens/PlacementTestScreen'
import { ThemeSettingsScreen } from './screens/ThemeSettingsScreen'
import { PricingScreen } from './screens/PricingScreen'
import type { AIProblemSet } from './aiProblemStore'
import { loadTheme, applyTheme } from './theme'
import { loadGuestUser } from './guestUser'
import { getCompletedCount } from './stats'

type Screen =
  | { type: 'home' }
  | { type: 'lessons' }
  | { type: 'profile' }
  | { type: 'lesson'; lessonId: number }
  | { type: 'flashcards' }
  | { type: 'fermi' }
  | { type: 'deviation' }
  | { type: 'ranking' }
  | { type: 'roleplay' }
  | { type: 'roleplay-chat'; situationId: string }
  | { type: 'mock-exam' }
  | { type: 'journal-input' }
  | { type: 'worksheet' }
  | { type: 'daily-problem' }
  | { type: 'ai-problem-gen' }
  | { type: 'ai-problem'; problem: AIProblemSet }
  | { type: 'feedback' }
  | { type: 'placement-test' }
  | { type: 'theme-settings' }
  | { type: 'pricing' }

const LESSON_LIST: { id: number; category: string; title: string; icon: ReactNode }[] = [
  { id: 20, category: 'ロジカルシンキング', title: 'MECE入門',        icon: <BrainIcon width={20} height={20} /> },
  { id: 21, category: 'ロジカルシンキング', title: 'ロジックツリー',   icon: <BrainIcon width={20} height={20} /> },
  { id: 22, category: 'フェルミ推定',       title: 'フェルミ推定入門', icon: <BarChartIcon width={20} height={20} /> },
  { id: 23, category: 'フェルミ推定',       title: '市場規模の推定',   icon: <BarChartIcon width={20} height={20} /> },
  { id: 24, category: 'フェルミ推定',       title: '人数・頻度の推定', icon: <TrendingUpIcon width={20} height={20} /> },
  { id: 25, category: 'フェルミ推定',       title: 'セグメント分解',   icon: <BarChartIcon width={20} height={20} /> },
  { id: 26, category: 'ロジカルシンキング', title: '構造化思考',       icon: <BrainIcon width={20} height={20} /> },
  { id: 27, category: 'ロジカルシンキング', title: '仮説思考',         icon: <BrainIcon width={20} height={20} /> },
  { id: 28, category: 'ケース面接',         title: 'ケース面接入門',   icon: <BriefcaseIcon width={20} height={20} /> },
  { id: 29, category: 'ケース面接',         title: '新規事業ケース',   icon: <BriefcaseIcon width={20} height={20} /> },
  { id: 30, category: 'PM入門',            title: 'プロジェクトとは', icon: <TargetIcon width={20} height={20} /> },
  { id: 31, category: 'PM入門',            title: 'スコープ管理',     icon: <TargetIcon width={20} height={20} /> },
  { id: 32, category: 'PM入門',            title: 'スケジュール管理', icon: <CalendarIcon width={20} height={20} /> },
  { id: 33, category: 'PM入門',            title: 'リスク管理',       icon: <ClipboardListIcon width={20} height={20} /> },
  { id: 34, category: 'PM入門',            title: 'ステークホルダー', icon: <BriefcaseIcon width={20} height={20} /> },
]

function AppV3() {
  const [tab, setTab] = useState<Tab>('home')
  const [screen, setScreen] = useState<Screen>({ type: 'home' })

  useEffect(() => {
    applyTheme(loadTheme())
  }, [])

  const userName = loadGuestUser().id
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
            if (cat === 'fermi') setScreen({ type: 'fermi' })
            else setTab('lessons')
          }}
        />
      )}

      {screen.type === 'lessons' && (
        <div className="stack-lg">
          <header>
            <div className="eyebrow">LEARN</div>
            <h1 style={{ fontSize: 28, marginTop: 6 }}>すべてのレッスン</h1>
          </header>

          <section>
            <h2 style={{ fontSize: 15, marginBottom: 'var(--s-3)' }}>Quick access</h2>
            <div className="cat-grid">
              {(
                [
                  { nav: () => setScreen({ type: 'fermi' }),        icon: <BarChartIcon width={20} height={20} />,      name: 'フェルミ推定',    meta: 'AI 問題生成' },
                  { nav: () => setScreen({ type: 'roleplay' }),      icon: <MessageCircleIcon width={20} height={20} />, name: 'ロールプレイ',    meta: 'AI 対話練習' },
                  { nav: () => setScreen({ type: 'flashcards' }),    icon: <LayersIcon width={20} height={20} />,        name: 'フラッシュカード', meta: 'SM-2 復習' },
                  { nav: () => setScreen({ type: 'daily-problem' }), icon: <CalendarIcon width={20} height={20} />,      name: '今日の問題',      meta: '毎日更新' },
                  { nav: () => setScreen({ type: 'mock-exam' }),     icon: <ClipboardListIcon width={20} height={20} />, name: '模擬試験',        meta: '60分・25問' },
                  { nav: () => setScreen({ type: 'ai-problem-gen' }),icon: <SparklesIcon width={20} height={20} />,      name: 'AI問題生成',      meta: 'カスタム問題' },
                  { nav: () => setScreen({ type: 'journal-input' }), icon: <BookOpenIcon width={20} height={20} />,      name: '仕訳ドリル',      meta: '簿記3級' },
                  { nav: () => setScreen({ type: 'worksheet' }),     icon: <TableIcon width={20} height={20} />,         name: '精算表ドリル',    meta: '決算整理' },
                  { nav: () => setScreen({ type: 'ranking' }),       icon: <TrophyIcon width={20} height={20} />,        name: 'ランキング',      meta: '全国順位' },
                  { nav: () => setScreen({ type: 'deviation' }),     icon: <TrendingUpIcon width={20} height={20} />,    name: '偏差値',          meta: 'あなたの実力' },
                ] as { nav: () => void; icon: ReactNode; name: string; meta: string }[]
              ).map((item) => (
                <button
                  key={item.name}
                  className="cat-tile"
                  onClick={item.nav}
                  style={{ cursor: 'pointer', textAlign: 'left', border: '1px solid var(--border)' }}
                >
                  <div className="cat-tile-icon">{item.icon}</div>
                  <div className="cat-tile-name">{item.name}</div>
                  <div className="cat-tile-meta">{item.meta}</div>
                </button>
              ))}
            </div>
          </section>

          <section>
            <h2 style={{ fontSize: 15, marginBottom: 'var(--s-3)' }}>レッスン一覧</h2>
            <div className="cat-grid">
              {LESSON_LIST.map((l) => (
                <button
                  key={l.id}
                  className="cat-tile"
                  onClick={() => handleOpenLesson(l.id)}
                  style={{ cursor: 'pointer', textAlign: 'left', border: '1px solid var(--border)' }}
                >
                  <div className="cat-tile-icon">{l.icon}</div>
                  <div className="cat-tile-name">{l.title}</div>
                  <div className="cat-tile-meta">{l.category}</div>
                </button>
              ))}
            </div>
          </section>
        </div>
      )}

      {screen.type === 'flashcards' && <FlashcardsScreen onBack={handleBack} />}
      {screen.type === 'fermi' && <FermiScreen onBack={handleBack} />}
      {screen.type === 'mock-exam' && <MockExamScreen onBack={handleBack} />}
      {screen.type === 'journal-input' && <JournalInputScreen onBack={handleBack} />}
      {screen.type === 'worksheet' && <WorksheetScreen onBack={handleBack} />}
      {screen.type === 'daily-problem' && <DailyProblemScreen onBack={handleBack} />}
      {screen.type === 'feedback' && <FeedbackScreen onBack={handleBack} />}
      {screen.type === 'pricing' && <PricingScreen onBack={handleBack} />}
      {screen.type === 'theme-settings' && (
        <ThemeSettingsScreen
          onBack={handleBack}
          onUpgrade={() => setScreen({ type: 'pricing' })}
        />
      )}

      {screen.type === 'ai-problem-gen' && (
        <AIProblemGenScreen
          onBack={handleBack}
          onPlay={(problem) => setScreen({ type: 'ai-problem', problem })}
        />
      )}

      {screen.type === 'ai-problem' && (
        <AIProblemScreen
          problem={screen.problem}
          onBack={() => setScreen({ type: 'ai-problem-gen' })}
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
          onOpenSettings={() => setScreen({ type: 'theme-settings' })}
        />
      )}

      {screen.type === 'lesson' && (
        <LessonScreen
          lessonId={screen.lessonId}
          onBack={handleBack}
          onComplete={handleComplete}
        />
      )}
    </AppShell>
  )
}

export default AppV3
