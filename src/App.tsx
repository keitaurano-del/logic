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
import Notebook from './Notebook'
import AIProblemGen from './AIProblemGen'
import Pricing from './Pricing'
import DeviationScore from './DeviationScore'
import { getAIProblem, type AIProblemSet } from './aiProblemStore'
import { verifyCheckout } from './subscription'
import { getTodayProblem, generateTodayProblem, isDailyCompleted, markDailyCompleted } from './dailyProblem'
import { allLessons } from './lessonData'
import { recordCompletion, addStudyTime, getCompletedCount, getStreak, getStudyHours } from './stats'
import { getCardStats } from './flashcardData'
import { loadProgress, initFromFlashcards } from './progressStore'
import { loadTheme, applyTheme } from './theme'
import { loadRoadmapState, needsOnboarding, getProgress as getRoadmapProgress, getCurrentStep, completeStep } from './roadmapStore'
import { getRoadmap } from './roadmapData'
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

type Tab = 'home' | 'lessons' | 'notebook' | 'profile'
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

function App() {
  const [screen, setScreen] = useState<Screen>({ type: 'home' })
  const [tab, setTab] = useState<Tab>('home')
  const [completedCount, setCompletedCount] = useState(getCompletedCount())
  const [streak, setStreak] = useState(getStreak())
  const [studyHours, setStudyHours] = useState(getStudyHours())
  const [progress, setProgress] = useState(loadProgress())
  const [roadmapState, setRoadmapState] = useState(loadRoadmapState())
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
  useEffect(() => { initFromFlashcards(); setProgress(loadProgress()) }, [])

  const refreshStats = useCallback(() => {
    setCompletedCount(getCompletedCount())
    setStreak(getStreak())
    setStudyHours(getStudyHours())
    setProgress(loadProgress())
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

  if (screen.type === 'feedback') {
    return <Feedback onBack={goHome} />
  }

  if (screen.type === 'pricing') {
    return <Pricing onBack={goHome} />
  }

  if (screen.type === 'deviation') {
    return <DeviationScore onBack={goHome} />
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

  return (
    <div className="app">
      {/* Tab Content */}
      {tab === 'home' && (
        <>
          {/* Today's Problem */}
          {dailyProblem && (
            <div className="daily-card" onClick={() => setScreen({ type: 'daily-problem' })}>
              <div className="daily-icon">✨</div>
              <div className="daily-text">
                <strong>今日の1問</strong>
                <span>{dailyProblem.title}</span>
              </div>
              {isDailyCompleted() ? (
                <span className="daily-badge done">✓ 完了</span>
              ) : (
                <span className="daily-badge new">NEW</span>
              )}
            </div>
          )}
          {loadingDaily && !dailyProblem && (
            <div className="daily-card daily-loading">
              <div className="daily-icon">⏳</div>
              <div className="daily-text">
                <strong>今日の1問</strong>
                <span>準備中...</span>
              </div>
            </div>
          )}

          {/* Progress Section */}
          <section className="progress-section">
            <h3 className="progress-section-title">📋 今月の評価シート</h3>
            {(['簿記', 'プロジェクトマネジメント', 'ロジカルシンキング'] as const).map(cat => {
              const p = progress[cat]
              const rate = p.totalCards > 0 ? Math.round((p.completedCards / p.totalCards) * 100) : 0
              return (
                <div key={cat} className="progress-bar-row" onClick={() => {
                  setScreen({ type: 'flashcards' })
                }}>
                  <div className="progress-bar-header">
                    <span className="progress-bar-label">{cat}</span>
                    <span className="progress-bar-stat">{p.completedCards}/{p.totalCards} ({rate}%)</span>
                  </div>
                  <div className="progress-bar-track">
                    <div className="progress-bar-fill" style={{ width: `${rate}%` }} />
                  </div>
                  <span className="progress-bar-cta">続きを始める →</span>
                </div>
              )
            })}
          </section>

          {/* Roadmap Widget */}
          {needsOnboarding() ? (
            <div className="roadmap-widget" onClick={() => setScreen({ type: 'goal-select' })}>
              <div className="roadmap-widget-icon">🎯</div>
              <div className="roadmap-widget-text">
                <strong>学習目標を設定しよう</strong>
                <span>ロードマップで効率的に学習</span>
              </div>
              <span className="roadmap-widget-arrow">›</span>
            </div>
          ) : (
            <>
              {roadmapState.goals.map((g) => {
                const rp = getRoadmapProgress(g.goalId)
                const rm = getRoadmap(g.goalId)
                const nextStep = getCurrentStep(g.goalId)
                if (!rm) return null
                return (
                  <div key={g.goalId} className="roadmap-widget active" onClick={() => setScreen({ type: 'roadmap', goalId: g.goalId })}>
                    <div className="roadmap-widget-icon">{rm.emoji}</div>
                    <div className="roadmap-widget-text">
                      <strong>{rm.title}</strong>
                      <span>
                        {rp.completed === rp.total
                          ? '全ステップ完了!'
                          : `${rp.completed}/${rp.total} 完了 (${rp.percent}%)`}
                      </span>
                      {nextStep != null && (
                        <span className="roadmap-widget-next">
                          次: {rm.steps.find((s) => s.lessonId === nextStep)?.title}
                        </span>
                      )}
                    </div>
                    <div className="roadmap-widget-ring">
                      <svg width="40" height="40" viewBox="0 0 40 40">
                        <circle cx="20" cy="20" r="16" fill="none" stroke="var(--bg-card)" strokeWidth="3" />
                        <circle
                          cx="20" cy="20" r="16" fill="none"
                          stroke={rm.color}
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeDasharray={`${rp.percent} ${100 - rp.percent}`}
                          strokeDashoffset="25"
                          transform="rotate(-90 20 20)"
                        />
                        <text x="20" y="20" textAnchor="middle" dominantBaseline="central"
                          fill="var(--text-primary)" fontSize="11" fontWeight="800">
                          {rp.percent}%
                        </text>
                      </svg>
                    </div>
                  </div>
                )
              })}
              <div className="roadmap-widget" onClick={() => setScreen({ type: 'goal-select' })} style={{ opacity: 0.7 }}>
                <div className="roadmap-widget-icon">＋</div>
                <div className="roadmap-widget-text">
                  <strong>目標を追加</strong>
                  <span>新しい学習目標を設定</span>
                </div>
                <span className="roadmap-widget-arrow">›</span>
              </div>
            </>
          )}

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
                <span className="streak-label">{streak > 0 ? '日連続学習中' : '今日から始めよう'}</span>
                {streak >= 7 && <span className="streak-badge">{streak >= 30 ? 'MASTER' : streak >= 14 ? 'ON FIRE' : 'GREAT'}</span>}
              </div>
              <div className="hero-stats">
                <div className="stat">
                  <span className="stat-value">{completedCount}</span>
                  <span className="stat-label">完了レッスン</span>
                </div>
                <div className="stat-divider" />
                <div className="stat">
                  <span className="stat-value">{studyHours}</span>
                  <span className="stat-label">総学習時間</span>
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
                  <strong>今日のおすすめ</strong>
                  <span>{fc.total === 0 ? 'レッスンを完了するとカードが作られます' : fc.due > 0 ? `${fc.due}枚の復習待ち` : '今日の復習完了！'}</span>
                </div>
                <span className="flashcard-banner-arrow">›</span>
              </div>
            )
          })()}

          {/* AI Problem Generator entry */}
          <div className="ai-gen-card" onClick={() => setScreen({ type: 'ai-gen' })}>
            <div className="ai-gen-icon">✨</div>
            <div className="ai-gen-text">
              <strong>AIに問題を作ってもらう</strong>
              <span>あなた専用の練習問題を生成 <span className="ai-gen-badge">PREMIUM</span></span>
            </div>
            <span className="ai-gen-arrow">›</span>
          </div>

          {/* Document Tray */}
          <section className="section">
            <div className="section-header">
              <h3 className="section-title">📁 書類トレイ</h3>
              <span className="section-count">{lessons.length}</span>
            </div>
            <div className="lesson-list">
              {lessons.slice(0, 6).map((lesson) => (
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
        </>
      )}

      {tab === 'notebook' && <Notebook />}

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
            lessons.reduce<Record<string, typeof lessons>>((acc, l) => {
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
      />}

      {/* Bottom Navigation */}
      <nav className="bottom-nav">
        <button className={`nav-item ${tab === 'home' ? 'active' : ''}`} onClick={() => setTab('home')}>
          <svg className="nav-icon" viewBox="0 0 24 24" fill={tab === 'home' ? 'currentColor' : 'none'} stroke={tab === 'home' ? 'none' : 'currentColor'} strokeWidth="2">
            <path d="M3 13h1v7c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-7h1a1 1 0 0 0 .7-1.7l-9-9a1 1 0 0 0-1.4 0l-9 9A1 1 0 0 0 3 13z" />
          </svg>
          <span>ホーム</span>
        </button>
        <button className={`nav-item ${tab === 'lessons' ? 'active' : ''}`} onClick={() => setTab('lessons')}>
          <svg className="nav-icon" viewBox="0 0 24 24" fill={tab === 'lessons' ? 'currentColor' : 'none'} stroke={tab === 'lessons' ? 'none' : 'currentColor'} strokeWidth="2">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          </svg>
          <span>レッスン</span>
        </button>
        <button className={`nav-item ${tab === 'notebook' ? 'active' : ''}`} onClick={() => setTab('notebook')}>
          <span className="nav-icon" style={{ fontSize: 22, lineHeight: 1 }}>📓</span>
          <span>手帳</span>
        </button>
        <button className={`nav-item ${tab === 'profile' ? 'active' : ''}`} onClick={() => { setTab('profile'); refreshStats() }}>
          <svg className="nav-icon" viewBox="0 0 24 24" fill={tab === 'profile' ? 'currentColor' : 'none'} stroke={tab === 'profile' ? 'none' : 'currentColor'} strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <span>プロフィール</span>
        </button>
      </nav>
    </div>
  )
}

export default App
