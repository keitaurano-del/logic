import { useState, useEffect, useRef, useCallback } from 'react'
import Lesson from './Lesson'
import Profile from './Profile'
import Flashcards from './Flashcards'
import GoalSelect from './GoalSelect'
import Roadmap from './Roadmap'
import Feedback from './Feedback'
import AIProblemGen from './AIProblemGen'
import Pricing from './Pricing'
import DeviationScore from './DeviationScore'
import Roleplay from './Roleplay'
import RoleplayChat from './RoleplayChat'
import CoffeeBreak from './CoffeeBreak'
import ThemeSettings from './ThemeSettings'
import PlacementTest from './PlacementTest'
import { hasSeenOnboarding, markOnboardingDone } from './Onboarding'
import { OnboardingScreen } from './screens/OnboardingScreen'
import Ranking from './Ranking'
import FermiLesson from './FermiLesson'
import { hasCompletedPlacement, loadPlacementResult } from './placementData'
import { t, getLocale } from './i18n'
import { getAIProblem, type AIProblemSet } from './aiProblemStore'
import { getInitialUser, onAuthChange } from './supabase'
import { getTodayProblem, generateTodayProblem, isDailyCompleted, markDailyCompleted } from './dailyProblem'
import { allLessons } from './lessonData'
import { recordCompletion, addStudyTime, getCompletedCount, getStreak, getStudyHours, getCompletedLessons } from './stats'
import { getCardStats } from './flashcardData'
import { initFromFlashcards } from './progressStore'
import { loadTheme, applyTheme } from './theme'
import { loadRoadmapState, completeStep } from './roadmapStore'
import LessonIcon from './LessonIcon'
import './App.css'

const lessons = [
  {
    id: 20,
    category: 'ロジカルシンキング',
    title: 'MECE — 漏れなくダブりなく',
    description: '情報を漏れなくダブりなく整理するフレームワーク',
    progress: 0,
    action: 'lesson' as const,
  },
  {
    id: 21,
    category: 'ロジカルシンキング',
    title: 'ロジックツリー — 問題を分解する',
    description: '問題を階層的に分解するWhyツリーとHowツリー',
    progress: 0,
    action: 'lesson' as const,
  },
  {
    id: 22,
    category: 'ロジカルシンキング',
    title: 'So What / Why So — 論理の検証',
    description: '「だから何？」「なぜそう言える？」で論理をチェック',
    progress: 0,
    action: 'lesson' as const,
  },
  {
    id: 23,
    category: 'ロジカルシンキング',
    title: 'ピラミッド原則 — 伝わる話し方',
    description: '結論→理由→根拠の順で伝えるPREP法とSCR',
    progress: 0,
    action: 'lesson' as const,
  },
  {
    id: 24,
    category: 'ロジカルシンキング',
    title: 'ケーススタディ — 総合演習',
    description: '実践的なビジネスケースで全フレームワークを総合演習',
    progress: 0,
    action: 'lesson' as const,
  },
  {
    id: 25,
    category: 'ロジカルシンキング',
    title: '演繹法 — 一般から個別を導く',
    description: '三段論法・大前提と小前提・ビジネスでの活用と落とし穴',
    progress: 0,
    action: 'lesson' as const,
  },
  {
    id: 26,
    category: 'ロジカルシンキング',
    title: '帰納法 — 個別事例から法則を見つける',
    description: '事例から仮説を立てる方法・サンプルバイアス・反例リスク',
    progress: 0,
    action: 'lesson' as const,
  },
  {
    id: 27,
    category: 'ロジカルシンキング',
    title: '形式論理 — 「A ならば B」の世界',
    description: '条件文・逆裏対偶・モーダスポネンス・哲学クラスの論理学',
    progress: 0,
    action: 'lesson' as const,
  },
  // クリティカルシンキング
  { id: 40, category: 'クリティカルシンキング', title: 'クリティカルシンキング入門', description: '根拠をもとに自分の頭で判断する', progress: 0, action: 'lesson' as const },
  { id: 41, category: 'クリティカルシンキング', title: '論理的誤謬を見破る', description: '「正しそうな嘘」に騙されない', progress: 0, action: 'lesson' as const },
  { id: 42, category: 'クリティカルシンキング', title: 'データを正しく読む', description: 'グラフや統計のトリックを見抜く', progress: 0, action: 'lesson' as const },
  { id: 43, category: 'クリティカルシンキング', title: '問いを立てる力', description: '良い問いが良い答えを生む', progress: 0, action: 'lesson' as const },
  // 仮説思考
  { id: 50, category: '仮説思考', title: '仮説思考入門', description: 'まず仮の答えを立ててから検証する', progress: 0, action: 'lesson' as const },
  { id: 51, category: '仮説思考', title: '仮説の立て方と検証', description: '良い仮説の3条件と検証設計', progress: 0, action: 'lesson' as const },
  { id: 52, category: '仮説思考', title: '仮説ドリブンの課題解決', description: 'Day 1 AnswerとQuick & Dirty検証', progress: 0, action: 'lesson' as const },
  // 課題設定
  { id: 53, category: '課題設定', title: '課題設定入門', description: 'Where → Why → Howで正しい問いを立てる', progress: 0, action: 'lesson' as const },
  { id: 54, category: '課題設定', title: 'イシュー分析', description: '解くべき問いを見極める', progress: 0, action: 'lesson' as const },
  { id: 55, category: '課題設定', title: '課題設定実践', description: '空・雨・傘で事実→解釈→行動', progress: 0, action: 'lesson' as const },
  // デザインシンキング
  { id: 56, category: 'デザインシンキング', title: 'デザインシンキング入門', description: '共感から始める問題解決の5ステップ', progress: 0, action: 'lesson' as const },
  { id: 57, category: 'デザインシンキング', title: '共感マップとペルソナ', description: 'ユーザーの頭の中を可視化する', progress: 0, action: 'lesson' as const },
  { id: 58, category: 'デザインシンキング', title: 'デザインシンキング実践', description: 'How Might Weとブレスト', progress: 0, action: 'lesson' as const },
  // ラテラルシンキング
  { id: 59, category: 'ラテラルシンキング', title: 'ラテラルシンキング入門', description: 'リフレーミングと逆転の発想', progress: 0, action: 'lesson' as const },
  { id: 60, category: 'ラテラルシンキング', title: 'ラテラルの技法', description: 'SCAMPER法・ランダム刺激・6つの帽子', progress: 0, action: 'lesson' as const },
  { id: 61, category: 'ラテラルシンキング', title: 'ラテラル実践', description: '前提を書き換えてイノベーションを生む', progress: 0, action: 'lesson' as const },
  // アナロジー思考
  { id: 62, category: 'アナロジー思考', title: 'アナロジー思考入門', description: '構造的類似性を見抜く', progress: 0, action: 'lesson' as const },
  { id: 63, category: 'アナロジー思考', title: 'アナロジーの技法', description: '抽象化と具体化で異分野をつなぐ', progress: 0, action: 'lesson' as const },
  { id: 64, category: 'アナロジー思考', title: 'アナロジー実践', description: '異業種アナロジーチャレンジ', progress: 0, action: 'lesson' as const },
  // システムシンキング
  { id: 65, category: 'システムシンキング', title: 'システムシンキング入門', description: 'フィードバックループと氷山モデル', progress: 0, action: 'lesson' as const },
  { id: 66, category: 'システムシンキング', title: 'システム原型', description: 'よくあるパターンで問題を診断', progress: 0, action: 'lesson' as const },
  { id: 67, category: 'システムシンキング', title: 'システムシンキング実践', description: '因果ループ図とレバレッジポイント', progress: 0, action: 'lesson' as const },
]

// English overlay for logic lesson titles/descriptions (logic IDs only).
// Bookkeeping/PMBOK lessons are filtered out of EN locale lists entirely,
// so they don't need translations here.
const LESSON_OVERLAY_EN: Record<number, { title: string; description: string; category: string }> = {
  20: { title: 'MECE — Mutually Exclusive, Collectively Exhaustive', description: 'Organize information without gaps or overlaps', category: 'Logical Thinking' },
  21: { title: 'Logic Tree — Decomposing Problems', description: 'Why trees and How trees for hierarchical problem solving', category: 'Logical Thinking' },
  22: { title: 'So What / Why So — Validating Logic', description: 'Stress-test arguments with two simple questions', category: 'Logical Thinking' },
  23: { title: 'Pyramid Principle — Communicating Clearly', description: 'Conclusion → reasons → evidence with PREP and SCR', category: 'Logical Thinking' },
  24: { title: 'Case Studies — Applied Practice', description: 'Combine all frameworks on realistic business cases', category: 'Logical Thinking' },
  25: { title: 'Deduction — From the General to the Specific', description: 'Syllogisms, validity vs. soundness, business applications', category: 'Logical Thinking' },
  26: { title: 'Induction — From Cases to Patterns', description: 'Forming hypotheses from observations, sample bias, black swans', category: 'Logical Thinking' },
  27: { title: 'Formal Logic — The World of "A Implies B"', description: 'Conditionals, contrapositive, modus ponens & tollens', category: 'Logical Thinking' },
}

function localizeLessons<T extends { id: number; title: string; description: string; category: string }>(arr: T[]): T[] {
  if (getLocale() !== 'en') return arr
  return arr.map(l => {
    const overlay = LESSON_OVERLAY_EN[l.id]
    return overlay ? { ...l, title: overlay.title, description: overlay.description, category: overlay.category } : l
  })
}

type Tab = 'home' | 'lessons' | 'profile'
type Screen =
  | { type: 'home' }
  | { type: 'lesson'; lessonId: number }
  | { type: 'flashcards' }
  | { type: 'goal-select' }
  | { type: 'roadmap'; goalId: string }
  | { type: 'feedback' }
  | { type: 'ai-gen' }
  | { type: 'ai-problem'; problemId: number }
  | { type: 'pricing' }
  | { type: 'deviation' }
  | { type: 'daily-problem' }
  | { type: 'roleplay' }
  | { type: 'roleplay-chat'; situationId: string }
  | { type: 'coffee-break' }
  | { type: 'theme' }
  | { type: 'ranking' }
  | { type: 'fermi' }

function App() {
  const [showOnboarding, setShowOnboarding] = useState(!hasSeenOnboarding())
  const [_userName, setUserName] = useState('')
  const [showPlacement, setShowPlacement] = useState(!hasCompletedPlacement())
  const [placementResult, setPlacementResult] = useState(loadPlacementResult())
  const [screen, setScreen] = useState<Screen>({ type: 'home' })
  const [tab, setTab] = useState<Tab>('home')
  const [lessonSearch, setLessonSearch] = useState('')

  // Hide bottom nav on scroll down, show on scroll up
  const [navHidden, setNavHidden] = useState(false)
  const lastScrollY = useRef(0)
  useEffect(() => {
    const threshold = 10
    const onScroll = () => {
      const y = window.scrollY
      if (y > lastScrollY.current + threshold) setNavHidden(true)
      else if (y < lastScrollY.current - threshold) setNavHidden(false)
      lastScrollY.current = y
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // History stack for swipe-back support
  const screenHistoryRef = useRef<Screen[]>([])

  const navigateTo = useCallback((next: Screen) => {
    screenHistoryRef.current.push(screen)
    window.history.pushState({ screenIndex: screenHistoryRef.current.length }, '')
    setScreen(next)
  }, [screen])

  const navigateBack = useCallback((target: Screen = { type: 'home' }) => {
    setScreen(target)
  }, [])

  useEffect(() => {
    const handlePopState = () => {
      const prev = screenHistoryRef.current.pop()
      setScreen(prev ?? { type: 'home' })
    }
    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [])
  const [completedCount, setCompletedCount] = useState(getCompletedCount())
  const [streak, setStreak] = useState(getStreak())
  const [studyHours, setStudyHours] = useState(getStudyHours())
  const [, setRoadmapState] = useState(loadRoadmapState())
  const screenEnteredAt = useRef<number>(Date.now())
  const [dailyProblem, setDailyProblem] = useState<AIProblemSet | null>(getTodayProblem())
  const [loadingDaily, setLoadingDaily] = useState(false)

  useEffect(() => {
    // Play Store Billing では Stripe の決済検証は不要（2026-05-01削除）
    window.history.replaceState({}, '', window.location.pathname)
  }, [])

  useEffect(() => {
    if (!getTodayProblem()) {
      setLoadingDaily(true)
      generateTodayProblem()
        .then(p => setDailyProblem(p))
        .catch(console.error)
        .finally(() => setLoadingDaily(false))
    }
  }, [])

  // Apply saved theme on mount
  useEffect(() => { applyTheme(loadTheme()) }, [])

  // Init progress from flashcards on mount
  useEffect(() => { initFromFlashcards() }, [])

  // SCRUM-160: Supabaseユーザー名を取得
  useEffect(() => {
    getInitialUser().then(user => {
      if (user) setUserName(user.user_metadata?.full_name || user.user_metadata?.name || user.email || '')
    })
    const unsub = onAuthChange(user => {
      setUserName(user ? (user.user_metadata?.full_name || user.user_metadata?.name || user.email || '') : '')
    })
    return unsub
  }, [])

  const refreshStats = useCallback(() => {
    setCompletedCount(getCompletedCount())
    setStreak(getStreak())
    setStudyHours(getStudyHours())
    setRoadmapState(loadRoadmapState())
  }, [])

  // Track study time when leaving a sub-screen
  const goHome = useCallback(() => {
    const elapsed = Date.now() - screenEnteredAt.current
    if (elapsed > 5000) { // only count if spent more than 5 seconds
      addStudyTime(elapsed)
    }
    screenHistoryRef.current = []
    setScreen({ type: 'home' })
    refreshStats()
  }, [refreshStats])

  // Reset timer when entering a sub-screen
  useEffect(() => {
    if (screen.type !== 'home') {
      screenEnteredAt.current = Date.now()
    }
  }, [screen])

  const handleComplete = useCallback((key: string, _title: string) => {
    const elapsed = Date.now() - screenEnteredAt.current
    if (elapsed > 5000) addStudyTime(elapsed)
    recordCompletion(key)
    // Also mark the step complete in roadmap if applicable
    const match = key.match(/^lesson-(\d+)$/)
    if (match) completeStep(parseInt(match[1], 10))
    setScreen({ type: 'home' })
    refreshStats()
  }, [refreshStats])

  if (showOnboarding) {
    return <OnboardingScreen onComplete={() => {
      markOnboardingDone()
      setShowOnboarding(false)
    }} />
  }

  if (showPlacement) {
    return <PlacementTest
      onComplete={() => {
        setPlacementResult(loadPlacementResult())
        setShowPlacement(false)
      }}
      onSkip={() => {
        setPlacementResult(loadPlacementResult())
        setShowPlacement(false)
      }}
    />
  }

  if (screen.type === 'feedback') {
    return <Feedback onBack={goHome} />
  }

  if (screen.type === 'pricing') {
    return <Pricing onBack={goHome} />
  }

  if (screen.type === 'deviation') {
    return <DeviationScore onBack={goHome} />
  }

  if (screen.type === 'roleplay') {
    return <Roleplay
      onBack={goHome}
      onStart={(situationId) => navigateTo({ type: 'roleplay-chat', situationId })}
      onUpgrade={() => navigateTo({ type: 'pricing' })}
    />
  }

  if (screen.type === 'roleplay-chat') {
    return <RoleplayChat
      situationId={screen.situationId}
      onBack={() => navigateBack({ type: 'roleplay' })}
    />
  }

  if (screen.type === 'coffee-break') {
    return <CoffeeBreak onBack={goHome} />
  }

  if (screen.type === 'theme') {
    return <ThemeSettings
      onBack={goHome}
      onUpgrade={() => navigateTo({ type: 'pricing' })}
    />
  }

  if (screen.type === 'ranking') {
    return <Ranking
      onBack={goHome}
      onTakeTest={() => { setScreen({ type: 'home' }); setShowPlacement(true) }}
    />
  }

  if (screen.type === 'fermi') {
    return <FermiLesson
      onBack={goHome}
      onUpgrade={() => navigateTo({ type: 'pricing' })}
    />
  }

  if (screen.type === 'daily-problem' && dailyProblem) {
    return <Lesson
      lesson={dailyProblem}
      onBack={goHome}
      onComplete={() => {
        markDailyCompleted()
        handleComplete(`daily-${dailyProblem.id}`, dailyProblem.title)
      }}
    />
  }

  if (screen.type === 'goal-select') {
    return (
      <GoalSelect
        onComplete={() => {
          setRoadmapState(loadRoadmapState())
          setScreen({ type: 'home' })
        }}
      />
    )
  }

  if (screen.type === 'roadmap') {
    return (
      <Roadmap
        goalId={screen.goalId}
        onBack={() => { refreshStats(); goHome() }}
        onStartLesson={(lessonId) => {
          navigateTo({ type: 'lesson', lessonId })
        }}
      />
    )
  }

  if (screen.type === 'flashcards') {
    return <Flashcards onBack={goHome} />
  }

  if (screen.type === 'ai-gen') {
    return <AIProblemGen
      onBack={goHome}
      onPlayProblem={(p) => navigateTo({ type: 'ai-problem', problemId: p.id })}
    />
  }

  if (screen.type === 'ai-problem') {
    const problem = getAIProblem(screen.problemId)
    if (problem) {
      return <Lesson
        lesson={problem}
        onBack={() => navigateBack({ type: 'ai-gen' })}
        onComplete={() => handleComplete(`ai-${problem.id}`, problem.title)}
      />
    }
  }

  if (screen.type === 'lesson') {
    const lessonData = allLessons[screen.lessonId]
    if (lessonData) {
      // 同カテゴリの次の未完了レッスンを探す
      const nextLesson = (() => {
        const completed = new Set(getCompletedLessons())
        const sameCat = lessons.filter(l => l.category === lessonData.category && l.id !== screen.lessonId)
        return sameCat.find(l => !completed.has(`lesson-${l.id}`) && l.id in allLessons) ?? null
      })()
      return <Lesson
        lesson={lessonData}
        onBack={goHome}
        onComplete={() => handleComplete(`lesson-${screen.lessonId}`, lessonData.title)}
        onNextLesson={nextLesson ? () => {
          handleComplete(`lesson-${screen.lessonId}`, lessonData.title)
          navigateTo({ type: 'lesson', lessonId: nextLesson.id })
        } : undefined}
      />
    }
  }

  const getCatKey = (category: string) => {
    if (/ロジカル/.test(category)) return 'logic'
    if (/クリティカル/.test(category)) return 'critical'
    if (/ケース/.test(category)) return 'case'
    return ''
  }

  const handleCardClick = (lesson: (typeof lessons)[number]) => {
    if (lesson.id in allLessons) {
      navigateTo({ type: 'lesson', lessonId: lesson.id })
    }
  }

  const isFirstTime = completedCount === 0 && streak === 0
  const nextLesson = (() => {
    if (completedCount === 0) return null
    const completed = new Set(getCompletedLessons())
    const visible = localizeLessons(lessons)
    return visible.find(l => !completed.has(`lesson-${l.id}`)) || null
  })()

  return (
    <div className="app">
      {/* Tab Content */}
      {tab === 'home' && (
        <>
          <div className="home-highlights">
          {/* Welcome card for first-time visitors */}
          {isFirstTime && (
            <div className="daily-card welcome" onClick={() => dailyProblem && navigateTo({ type: 'daily-problem' })}>
              <div className="daily-icon">👋</div>
              <div className="daily-text">
                <strong>{t('home.welcomeTitle')}</strong>
                <span>{t('home.welcomeDesc')}</span>
              </div>
              <span className="daily-badge new">{t('home.welcomeBadge')}</span>
            </div>
          )}

          {/* Continue from card */}
          {nextLesson && (
            <div className="daily-card continue" onClick={() => handleCardClick(nextLesson)}>
              <div className="daily-icon">▶️</div>
              <div className="daily-text">
                <strong>{t('home.continueTitle')}</strong>
                <span>{nextLesson.title}</span>
              </div>
              <span className="daily-badge new">NEXT</span>
            </div>
          )}

          {/* Placement recommendation card */}
          {placementResult && placementResult.totalCount > 0 && (() => {
            const firstRecId = placementResult.recommendedLessonIds.find(
              id => !getCompletedLessons().includes(`lesson-${id}`)
            )
            const recLesson = firstRecId ? lessons.find(l => l.id === firstRecId) : null
            if (!recLesson) return null
            return (
              <div className="daily-card placement" onClick={() => handleCardClick(recLesson)}>
                <div className="daily-icon">🎯</div>
                <div className="daily-text">
                  <strong>{t('home.placementTitle', { score: placementResult.deviation })}</strong>
                  <span>{recLesson.title}</span>
                </div>
                <span className="daily-badge new">{t('home.badgeRec')}</span>
              </div>
            )
          })()}

          {/* Today's Problem */}
          {dailyProblem && (
            <div className="daily-card" onClick={() => navigateTo({ type: 'daily-problem' })}>
              <div className="daily-icon">✨</div>
              <div className="daily-text">
                <strong>{t('home.todayProblem')}</strong>
                <span>{dailyProblem.title}</span>
              </div>
              {isDailyCompleted() ? (
                <span className="daily-badge done">{t('home.todayProblemDone')}</span>
              ) : (
                <span className="daily-badge new">{t('home.todayProblemNew')}</span>
              )}
            </div>
          )}
          {loadingDaily && !dailyProblem && (
            <div className="daily-card daily-loading">
              <div className="daily-icon">⏳</div>
              <div className="daily-text">
                <strong>{t('home.todayProblem')}</strong>
                <span>{t('home.todayProblemLoading')}</span>
              </div>
            </div>
          )}
          </div>

          {/* Streak */}
          <section className="hero">
            <div className="hero-content">
              <div className="streak-hero">
                <div className="streak-flame">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2C10.5 6 6 8 6 13a6 6 0 0 0 12 0c0-5-4.5-7-6-11Z" fill="url(#flame-grad)" />
                    <path d="M12 10c-1 2-3 3-3 5.5a3 3 0 0 0 6 0c0-2.5-2-3.5-3-5.5Z" fill="#FFEB3B" />
                    <defs>
                      <linearGradient id="flame-grad" x1="12" y1="2" x2="12" y2="19" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#FF8C00" />
                        <stop offset="1" stopColor="#FF3D00" />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
                <span className="streak-count">{streak}</span>
                <span className="streak-label">{streak > 0 ? t('home.streakDays') : t('home.streakStart')}</span>
                {streak >= 7 && <span className="streak-badge">{streak >= 30 ? 'MASTER' : streak >= 14 ? 'ON FIRE' : 'GREAT'}</span>}
              </div>
              <div className="hero-stats">
                <div className="stat">
                  <span className="stat-value">{completedCount}</span>
                  <span className="stat-label">{t('home.completedLessons')}</span>
                </div>
                <div className="stat-divider" />
                <div className="stat">
                  <span className="stat-value">{studyHours}</span>
                  <span className="stat-label">{t('home.totalStudyTime')}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Today's Recommendation */}
          {(() => {
            const fc = getCardStats()
            return (
              <div className="flashcard-banner" onClick={() => navigateTo({ type: 'flashcards' })}>
                <div className="flashcard-banner-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="14" height="18" rx="2" /><path d="M8 4V2" /><path d="M22 8v12a2 2 0 0 1-2 2" /><path d="M18 2v2" /><rect x="8" y="2" width="14" height="18" rx="2" opacity="0.3" /></svg></div>
                <div className="flashcard-banner-text">
                  <strong>{t('home.flashcardTitle')}</strong>
                  <span>{fc.total === 0 ? t('home.flashcardEmpty') : fc.due > 0 ? t('home.flashcardDue', { count: fc.due }) : t('home.flashcardDone')}</span>
                </div>
                <span className="flashcard-banner-arrow">›</span>
              </div>
            )
          })()}

          <div className="home-cta-grid">
          {/* AI Problem Generator entry */}
          <div className="ai-gen-card" onClick={() => navigateTo({ type: 'ai-gen' })}>
            <div className="ai-gen-icon">✨</div>
            <div className="ai-gen-text">
              <strong>{t('home.aiGenTitle')}</strong>
              <span>{t('home.aiGenDesc')}</span>
            </div>
            <span className="ai-gen-arrow">›</span>
          </div>

          {/* Roleplay entry */}
          <div className="ai-gen-card" onClick={() => navigateTo({ type: 'roleplay' })}>
            <div className="ai-gen-icon">💬</div>
            <div className="ai-gen-text">
              <strong>{t('home.roleplayTitle')}</strong>
              <span>{t('home.roleplayDesc')} <span className="ai-gen-badge">{t('home.badgeNew')}</span></span>
            </div>
            <span className="ai-gen-arrow">›</span>
          </div>

          {/* Coffee Break entry */}
          <div className="ai-gen-card" onClick={() => navigateTo({ type: 'coffee-break' })}>
            <div className="ai-gen-icon">☕</div>
            <div className="ai-gen-text">
              <strong>{t('home.coffeebreakTitle')}</strong>
              <span>{t('home.coffeebreakDesc')} <span className="ai-gen-badge">{t('home.badgeNew')}</span></span>
            </div>
            <span className="ai-gen-arrow">›</span>
          </div>

          {/* Fermi estimation entry */}
          <div className="ai-gen-card" onClick={() => navigateTo({ type: 'fermi' })}>
            <div className="ai-gen-icon">🔢</div>
            <div className="ai-gen-text">
              <strong>{t('home.fermiTitle')}</strong>
              <span>{t('home.fermiDesc')} <span className="ai-gen-badge">{t('home.badgeNew')}</span></span>
            </div>
            <span className="ai-gen-arrow">›</span>
          </div>
          </div>

          {/* Lessons */}
          {(() => {
            const visible = localizeLessons(lessons)
            return (
          <section className="section">
            <div className="lesson-list">
              {visible.slice(0, 6).map((lesson) => (
                <div
                  key={lesson.id}
                  className="lesson-card clickable"
                  data-cat={getCatKey(lesson.category)}
                  onClick={() => handleCardClick(lesson)}
                >
                  <div className="lesson-emoji"><LessonIcon id={lesson.id} action={lesson.action} /></div>
                  <div className="lesson-info">
                    <span className="lesson-category">{lesson.category}</span>
                    <h4 className="lesson-title">{lesson.title}</h4>
                    <p className="lesson-desc">{lesson.description}</p>
                  </div>
                  <div className="lesson-arrow">›</div>
                </div>
              ))}
            </div>
          </section>
            )
          })()}
        </>
      )}

      {tab === 'lessons' && (
        <div className="lessons-tab">
          {/* SCRUM-161: 検索ボックス */}
          <div style={{ padding: '12px 16px 0' }}>
            <div style={{ position: 'relative' }}>
              <input
                type="search"
                placeholder="レッスンを検索..."
                value={lessonSearch}
                onChange={e => setLessonSearch(e.target.value)}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  padding: '10px 16px 10px 36px',
                  borderRadius: 12, border: '1px solid var(--color-line, #2a2a3a)',
                  background: 'var(--color-card, #1a1a2e)', color: 'var(--color-text, #fff)',
                  fontSize: 14, outline: 'none',
                }}
              />
              <svg style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', opacity: 0.4 }}
                width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
            </div>
          </div>
          {/* SCRUM-169: レッスンタブの重複フラッシュカードバナーを削除（ホームタブに集約） */}
          {Object.entries(
            localizeLessons(lessons)
              .filter(l => {
                if (!lessonSearch.trim()) return true
                const q = lessonSearch.toLowerCase()
                return l.title.toLowerCase().includes(q) || (l.description || '').toLowerCase().includes(q)
              })
              .reduce<Record<string, typeof lessons>>((acc, l) => {
                const cat = l.category
                if (!acc[cat]) acc[cat] = []
                acc[cat].push(l)
                return acc
              }, {})
          ).sort(([a], [b]) => {
            const order = (c: string) => {
              if (c.includes('ロジカル')) return 0
              return 1
            }
            return order(a) - order(b)
          }).map(([cat, items]) => (
            <section key={cat} className="section">
              <div className="section-header">
                <h3 className="section-title">
                  {cat}
                </h3>
                <span className="section-count">{items.length}</span>
              </div>
              <div className="lesson-list">
                {items.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="lesson-card clickable"
                    data-cat={getCatKey(lesson.category)}
                    onClick={() => handleCardClick(lesson)}
                  >
                    <div className="lesson-emoji"><LessonIcon id={lesson.id} action={lesson.action} /></div>
                    <div className="lesson-info">
                      <span className="lesson-category">{lesson.category}</span>
                      <h4 className="lesson-title">{lesson.title}</h4>
                      <p className="lesson-desc">{lesson.description}</p>
                    </div>
                    <div className="lesson-arrow">›</div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      {tab === 'profile' && <Profile
        onFeedback={() => navigateTo({ type: 'feedback' })}
        onPricing={() => navigateTo({ type: 'pricing' })}
        onDeviation={() => navigateTo({ type: 'deviation' })}
        onTheme={() => navigateTo({ type: 'theme' })}
        onRanking={() => navigateTo({ type: 'ranking' })}
      />}

      {/* Bottom Navigation */}
      <nav className={`bottom-nav${navHidden ? ' bottom-nav--hidden' : ''}`}>
        <button className={`nav-item ${tab === 'home' ? 'active' : ''}`} onClick={() => setTab('home')}>
          <svg className="nav-icon" viewBox="0 0 24 24" fill={tab === 'home' ? 'currentColor' : 'none'} stroke={tab === 'home' ? 'none' : 'currentColor'} strokeWidth="2">
            <path d="M3 13h1v7c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-7h1a1 1 0 0 0 .7-1.7l-9-9a1 1 0 0 0-1.4 0l-9 9A1 1 0 0 0 3 13z" />
          </svg>
          <span>{t('nav.home')}</span>
        </button>
        <button className={`nav-item ${tab === 'lessons' ? 'active' : ''}`} onClick={() => { setTab('lessons') }}>
          <svg className="nav-icon" viewBox="0 0 24 24" fill={tab === 'lessons' ? 'currentColor' : 'none'} stroke={tab === 'lessons' ? 'none' : 'currentColor'} strokeWidth="2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
          <span>{t('nav.lessons')}</span>
        </button>
        <button className={`nav-item ${tab === 'profile' ? 'active' : ''}`} onClick={() => { setTab('profile'); refreshStats() }}>
          <svg className="nav-icon" viewBox="0 0 24 24" fill={tab === 'profile' ? 'currentColor' : 'none'} stroke={tab === 'profile' ? 'none' : 'currentColor'} strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span>{t('nav.profile')}</span>
        </button>
      </nav>
    </div>
  )
}

export default App
