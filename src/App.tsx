import { useState, useEffect, useRef, useCallback } from 'react'
import Lesson from './Lesson'
import MockExam from './MockExam'
import JournalInput from './JournalInput'
import Worksheet from './Worksheet'
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
import Onboarding, { hasSeenOnboarding } from './Onboarding'
import Ranking from './Ranking'
import FermiLesson from './FermiLesson'
import { hasCompletedPlacement, loadPlacementResult } from './placementTest'
import { t, getLocale } from './i18n'
import { getAIProblem, type AIProblemSet } from './aiProblemStore'
import { verifyCheckout } from './subscription'
import { getTodayProblem, generateTodayProblem, isDailyCompleted, markDailyCompleted } from './dailyProblem'
import { allLessons } from './lessonData'
import { recordCompletion, addStudyTime, getCompletedCount, getStreak, getStudyHours, getCompletedLessons } from './stats'
import { getCardStats } from './flashcardData'
import { initFromFlashcards } from './progressStore'
import { loadTheme, applyTheme } from './theme'
import { loadRoadmapState, completeStep } from './roadmapStore'
import { isDevMode } from './devMode'
import LessonIcon from './LessonIcon'
import './App.css'

const lessons = [
  {
    id: 6,
    category: '簿記3級',
    title: '簿記3級 入門',
    description: '仕訳・勘定科目・試算表の基礎',
    progress: 0,
    action: 'lesson' as const,
  },
  {
    id: 7,
    category: '簿記3級',
    title: '簿記3級 決算と財務諸表',
    description: '精算表・損益計算書・貸借対照表の作成',
    progress: 0,
    action: 'lesson' as const,
  },
  {
    id: 8,
    category: '簿記2級 商業',
    title: '簿記2級 商業簿記',
    description: '連結会計・税効果会計・リース取引',
    progress: 0,
    action: 'lesson' as const,
  },
  {
    id: 9,
    category: '簿記2級 工業',
    title: '簿記2級 工業簿記',
    description: '原価計算・標準原価・CVP分析',
    progress: 0,
    action: 'lesson' as const,
  },
  {
    id: 11,
    category: '簿記3級',
    title: '仕訳問題 50問ドリル',
    description: '本試験頻出の仕訳を徹底演習',
    progress: 0,
    action: 'lesson' as const,
  },
  {
    id: 12,
    category: '簿記3級',
    title: '勘定記入・補助簿ドリル',
    description: '補助簿の選択・伝票・勘定記入を演習',
    progress: 0,
    action: 'lesson' as const,
  },
  {
    id: 13,
    category: '簿記3級',
    title: '決算・精算表ドリル',
    description: '決算整理仕訳・精算表・B/S・P/Lを演習',
    progress: 0,
    action: 'lesson' as const,
  },
  {
    id: 14,
    category: '簿記3級 実践',
    title: '仕訳入力ドリル',
    description: '勘定科目と金額を自分で入力する実践演習',
    progress: 0,
    action: 'journal-input' as const,
  },
  {
    id: 15,
    category: '簿記3級 実践',
    title: '精算表穴埋めドリル',
    description: '精算表の空欄に数字を入力して完成させる',
    progress: 0,
    action: 'worksheet' as const,
  },
  {
    id: 99,
    category: '模擬試験',
    title: '簿記3級 模擬試験',
    description: '60分・25問・合格ライン70%の本番形式',
    progress: 0,
    action: 'mock-exam' as const,
  },
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
  {
    id: 30,
    category: 'プロジェクトマネジメント',
    title: 'PM基礎 — プロジェクトマネジメントとは',
    description: 'プロジェクトの定義・PMの役割・制約条件',
    progress: 0,
    action: 'lesson' as const,
  },
  {
    id: 31,
    category: 'プロジェクトマネジメント',
    title: 'プロセス群 — 立上げから終結まで',
    description: '5つのプロセス群・WBS・プロジェクト憲章',
    progress: 0,
    action: 'lesson' as const,
  },
  {
    id: 32,
    category: 'プロジェクトマネジメント',
    title: '知識エリア — 10の管理領域',
    description: '統合・スコープ・スケジュール・コスト・品質・EVM',
    progress: 0,
    action: 'lesson' as const,
  },
  {
    id: 33,
    category: 'プロジェクトマネジメント',
    title: 'ツールと技法 — 実践スキル',
    description: 'CPM・PERT・リスク分析・品質管理ツール',
    progress: 0,
    action: 'lesson' as const,
  },
  {
    id: 34,
    category: 'プロジェクトマネジメント',
    title: 'PMBOK総合演習 — 試験対策',
    description: 'PMBOK試験レベルのシチュエーション問題・EVM計算',
    progress: 0,
    action: 'lesson' as const,
  },
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
  | { type: 'mock-exam' }
  | { type: 'journal-input' }
  | { type: 'worksheet' }
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
  const [showPlacement, setShowPlacement] = useState(!hasCompletedPlacement())
  const [placementResult, setPlacementResult] = useState(loadPlacementResult())
  const [screen, setScreen] = useState<Screen>({ type: 'home' })
  const [tab, setTab] = useState<Tab>('home')
  const [completedCount, setCompletedCount] = useState(getCompletedCount())
  const [streak, setStreak] = useState(getStreak())
  const [studyHours, setStudyHours] = useState(getStudyHours())
  const [, setRoadmapState] = useState(loadRoadmapState())
  const [devMode, setDevModeState] = useState(isDevMode())
  const screenEnteredAt = useRef<number>(Date.now())
  const [dailyProblem, setDailyProblem] = useState<AIProblemSet | null>(getTodayProblem())
  const [loadingDaily, setLoadingDaily] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const sessionId = params.get('session_id')
    if (params.get('checkout') === 'success' && sessionId) {
      verifyCheckout(sessionId).then(ok => {
        if (ok) alert('プレミアムにアップグレードしました！')
        window.history.replaceState({}, '', window.location.pathname)
      })
    }
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
    if (key === 'mock-exam') completeStep(99)
    if (key === 'journal-input') completeStep(14)
    if (key === 'worksheet') completeStep(15)
    setScreen({ type: 'home' })
    refreshStats()
  }, [refreshStats])

  if (showOnboarding) {
    return <Onboarding onComplete={() => setShowOnboarding(false)} />
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
      onStart={(situationId) => setScreen({ type: 'roleplay-chat', situationId })}
      onUpgrade={() => setScreen({ type: 'pricing' })}
    />
  }

  if (screen.type === 'roleplay-chat') {
    return <RoleplayChat
      situationId={screen.situationId}
      onBack={() => setScreen({ type: 'roleplay' })}
    />
  }

  if (screen.type === 'coffee-break') {
    return <CoffeeBreak onBack={goHome} />
  }

  if (screen.type === 'theme') {
    return <ThemeSettings
      onBack={goHome}
      onUpgrade={() => setScreen({ type: 'pricing' })}
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
      onUpgrade={() => setScreen({ type: 'pricing' })}
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
        onBack={() => { refreshStats(); setScreen({ type: 'home' }) }}
        onStartLesson={(lessonId) => {
          const lesson = lessons.find((l) => l.id === lessonId)
          if (lesson) {
            if (lesson.action === 'mock-exam') setScreen({ type: 'mock-exam' })
            else if (lesson.action === 'journal-input') setScreen({ type: 'journal-input' })
            else if (lesson.action === 'worksheet') setScreen({ type: 'worksheet' })
            else setScreen({ type: 'lesson', lessonId })
          } else {
            setScreen({ type: 'lesson', lessonId })
          }
        }}
      />
    )
  }

  if (screen.type === 'flashcards') {
    return <Flashcards onBack={goHome} />
  }

  if (screen.type === 'mock-exam') {
    return <MockExam onBack={goHome} onComplete={() => handleComplete('mock-exam', '簿記3級 模擬試験')} />
  }

  if (screen.type === 'journal-input') {
    return <JournalInput onBack={goHome} onComplete={() => handleComplete('journal-input', '仕訳入力ドリル')} />
  }

  if (screen.type === 'worksheet') {
    return <Worksheet onBack={goHome} onComplete={() => handleComplete('worksheet', '精算表穴埋めドリル')} />
  }

  if (screen.type === 'ai-gen') {
    return <AIProblemGen
      onBack={goHome}
      onPlayProblem={(p) => setScreen({ type: 'ai-problem', problemId: p.id })}
    />
  }

  if (screen.type === 'ai-problem') {
    const problem = getAIProblem(screen.problemId)
    if (problem) {
      return <Lesson
        lesson={problem}
        onBack={() => setScreen({ type: 'ai-gen' })}
        onComplete={() => handleComplete(`ai-${problem.id}`, problem.title)}
      />
    }
  }

  if (screen.type === 'lesson') {
    const lessonData = allLessons[screen.lessonId]
    if (lessonData) {
      return <Lesson lesson={lessonData} onBack={goHome} onComplete={() => handleComplete(`lesson-${screen.lessonId}`, lessonData.title)} />
    }
  }

  const getCatKey = (category: string) => {
    if (/簿記3級 実践/.test(category)) return 'practice'
    if (/簿記3級/.test(category)) return 'boki3'
    if (/簿記2級/.test(category)) return 'boki2'
    if (/模擬試験/.test(category)) return 'exam'
    if (/ロジカル/.test(category)) return 'logic'
    if (/プロジェクト/.test(category)) return 'pm'
    return ''
  }

  const handleCardClick = (lesson: (typeof lessons)[number]) => {
    if (lesson.action === 'mock-exam') {
      setScreen({ type: 'mock-exam' })
    } else if (lesson.action === 'journal-input') {
      setScreen({ type: 'journal-input' })
    } else if (lesson.action === 'worksheet') {
      setScreen({ type: 'worksheet' })
    } else if (lesson.action === 'lesson' && lesson.id in allLessons) {
      setScreen({ type: 'lesson', lessonId: lesson.id })
    }
  }

  const isFirstTime = completedCount === 0 && streak === 0
  const nextLesson = (() => {
    if (completedCount === 0) return null
    const completed = new Set(getCompletedLessons())
    const visible = localizeLessons(lessons.filter(l => (getLocale() === 'en' ? !l.category.includes('簿記') && !l.category.includes('プロジェクト') && !l.category.includes('模擬試験') : (devMode || (!l.category.includes('簿記') && !l.category.includes('プロジェクト') && !l.category.includes('模擬試験'))))))
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
            <div className="daily-card welcome" onClick={() => dailyProblem && setScreen({ type: 'daily-problem' })}>
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
            <div className="daily-card" onClick={() => setScreen({ type: 'daily-problem' })}>
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
              <div className="flashcard-banner" onClick={() => setScreen({ type: 'flashcards' })}>
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
          <div className="ai-gen-card" onClick={() => setScreen({ type: 'ai-gen' })}>
            <div className="ai-gen-icon">✨</div>
            <div className="ai-gen-text">
              <strong>{t('home.aiGenTitle')}</strong>
              <span>{t('home.aiGenDesc')}</span>
            </div>
            <span className="ai-gen-arrow">›</span>
          </div>

          {/* Roleplay entry */}
          <div className="ai-gen-card" onClick={() => setScreen({ type: 'roleplay' })}>
            <div className="ai-gen-icon">💬</div>
            <div className="ai-gen-text">
              <strong>{t('home.roleplayTitle')}</strong>
              <span>{t('home.roleplayDesc')} <span className="ai-gen-badge">{t('home.badgeNew')}</span></span>
            </div>
            <span className="ai-gen-arrow">›</span>
          </div>

          {/* Coffee Break entry */}
          <div className="ai-gen-card" onClick={() => setScreen({ type: 'coffee-break' })}>
            <div className="ai-gen-icon">☕</div>
            <div className="ai-gen-text">
              <strong>{t('home.coffeebreakTitle')}</strong>
              <span>{t('home.coffeebreakDesc')} <span className="ai-gen-badge">{t('home.badgeNew')}</span></span>
            </div>
            <span className="ai-gen-arrow">›</span>
          </div>

          {/* Fermi estimation entry */}
          <div className="ai-gen-card" onClick={() => setScreen({ type: 'fermi' })}>
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
            const visible = localizeLessons(lessons.filter(l => (getLocale() === 'en' ? !l.category.includes('簿記') && !l.category.includes('プロジェクト') && !l.category.includes('模擬試験') : (devMode || (!l.category.includes('簿記') && !l.category.includes('プロジェクト') && !l.category.includes('模擬試験'))))))
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
          {/* Flashcards in lessons tab */}
          {(() => {
            const fc = getCardStats()
            return (
              <div className="flashcard-banner lesson-tab-fc" onClick={() => setScreen({ type: 'flashcards' })}>
                <div className="flashcard-banner-icon"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="14" height="18" rx="2" /><path d="M8 4V2" /><path d="M22 8v12a2 2 0 0 1-2 2" /><path d="M18 2v2" /><rect x="8" y="2" width="14" height="18" rx="2" opacity="0.3" /></svg></div>
                <div className="flashcard-banner-text">
                  <strong>フラッシュカード</strong>
                  <span>{fc.total === 0 ? 'レッスンを完了するとカードが作られます' : fc.due > 0 ? `${fc.due}枚の復習待ち` : `${fc.total}枚 (今日の復習完了)`}</span>
                </div>
                <span className="flashcard-banner-arrow">›</span>
              </div>
            )
          })()}
          {Object.entries(
            localizeLessons(lessons
              .filter(l => (getLocale() === 'en' ? !l.category.includes('簿記') && !l.category.includes('プロジェクト') && !l.category.includes('模擬試験') : (devMode || (!l.category.includes('簿記') && !l.category.includes('プロジェクト') && !l.category.includes('模擬試験'))))))
              .reduce<Record<string, typeof lessons>>((acc, l) => {
                const cat = l.category
                if (!acc[cat]) acc[cat] = []
                acc[cat].push(l)
                return acc
              }, {})
          ).sort(([a], [b]) => {
            const order = (c: string) => {
              if (c.includes('ロジカル')) return 0
              if (c.includes('プロジェクト')) return 2
              if (c.includes('簿記')) return 3
              return 1
            }
            return order(a) - order(b)
          }).map(([cat, items]) => (
            <section key={cat} className="section">
              <div className="section-header">
                <h3 className="section-title">
                  {cat}
                  {(cat.includes('簿記') || cat.includes('プロジェクト')) && <span className="beta-badge">BETA</span>}
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
        onFeedback={() => setScreen({ type: 'feedback' })}
        onPricing={() => setScreen({ type: 'pricing' })}
        onDeviation={() => setScreen({ type: 'deviation' })}
        onTheme={() => setScreen({ type: 'theme' })}
        onRanking={() => setScreen({ type: 'ranking' })}
      />}

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <button className={`nav-item ${tab === 'home' ? 'active' : ''}`} onClick={() => setTab('home')}>
          <svg className="nav-icon" viewBox="0 0 24 24" fill={tab === 'home' ? 'currentColor' : 'none'} stroke={tab === 'home' ? 'none' : 'currentColor'} strokeWidth="2">
            <path d="M3 13h1v7c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-7h1a1 1 0 0 0 .7-1.7l-9-9a1 1 0 0 0-1.4 0l-9 9A1 1 0 0 0 3 13z" />
          </svg>
          <span>{t('nav.home')}</span>
        </button>
        <button className={`nav-item ${tab === 'lessons' ? 'active' : ''}`} onClick={() => { setTab('lessons'); setDevModeState(isDevMode()) }}>
          <svg className="nav-icon" viewBox="0 0 24 24" fill={tab === 'lessons' ? 'currentColor' : 'none'} stroke={tab === 'lessons' ? 'none' : 'currentColor'} strokeWidth="2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
          <span>{t('nav.lessons')}</span>
        </button>
        <button className={`nav-item ${tab === 'profile' ? 'active' : ''}`} onClick={() => { setTab('profile'); refreshStats(); setDevModeState(isDevMode()) }}>
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
