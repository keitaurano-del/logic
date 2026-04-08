// Logic v3 — new app shell + 3 mocked screens (Home / Lesson / Profile)
// Phase 2 deliverable. Not yet wired into main.tsx — swap 1 line in main.tsx to activate.
// Other 16 screens will be built in Phase 3-6.
import { useEffect, useState } from 'react'
import { AppShell, type Tab } from './components/AppShell'
import { HomeScreen } from './screens/HomeScreen'
import { LessonScreen } from './screens/LessonScreen'
import { ProfileScreen } from './screens/ProfileScreen'
import { FlashcardsScreen } from './screens/FlashcardsScreen'
import { FermiScreen } from './screens/FermiScreen'
import { DeviationScreen } from './screens/DeviationScreen'
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

const LESSON_LIST = [
  { id: 20, category: 'ロジカルシンキング', title: 'MECE入門', emoji: '🧠' },
  { id: 21, category: 'ロジカルシンキング', title: 'ロジックツリー', emoji: '🌳' },
  { id: 22, category: 'フェルミ推定', title: 'フェルミ推定入門', emoji: '📊' },
  { id: 23, category: 'フェルミ推定', title: '市場規模の推定', emoji: '📈' },
  { id: 24, category: 'フェルミ推定', title: '人数・頻度の推定', emoji: '👥' },
  { id: 25, category: 'フェルミ推定', title: 'セグメント分解', emoji: '🔍' },
  { id: 26, category: 'ロジカルシンキング', title: '構造化思考', emoji: '🧩' },
  { id: 27, category: 'ロジカルシンキング', title: '仮説思考', emoji: '💡' },
  { id: 28, category: 'ケース面接', title: 'ケース面接入門', emoji: '💼' },
  { id: 29, category: 'ケース面接', title: '新規事業ケース', emoji: '🚀' },
  { id: 30, category: 'PM入門', title: 'プロジェクトとは', emoji: '📚' },
  { id: 31, category: 'PM入門', title: 'スコープ管理', emoji: '🎯' },
  { id: 32, category: 'PM入門', title: 'スケジュール管理', emoji: '📅' },
  { id: 33, category: 'PM入門', title: 'リスク管理', emoji: '⚠️' },
  { id: 34, category: 'PM入門', title: 'ステークホルダー', emoji: '🤝' },
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
    alert('レッスン完了!')
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
          onOpenCategory={() => setTab('lessons')}
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
              <button
                className="cat-tile"
                onClick={() => setScreen({ type: 'fermi' })}
                style={{ cursor: 'pointer', textAlign: 'left', border: '1px solid var(--border)' }}
              >
                <div className="cat-tile-icon">📊</div>
                <div className="cat-tile-name">フェルミ推定</div>
                <div className="cat-tile-meta">AI 問題生成</div>
              </button>
              <button
                className="cat-tile"
                onClick={() => setScreen({ type: 'flashcards' })}
                style={{ cursor: 'pointer', textAlign: 'left', border: '1px solid var(--border)' }}
              >
                <div className="cat-tile-icon">🃏</div>
                <div className="cat-tile-name">フラッシュカード</div>
                <div className="cat-tile-meta">SM-2 復習</div>
              </button>
              <button
                className="cat-tile"
                onClick={() => setScreen({ type: 'deviation' })}
                style={{ cursor: 'pointer', textAlign: 'left', border: '1px solid var(--border)' }}
              >
                <div className="cat-tile-icon">📈</div>
                <div className="cat-tile-name">偏差値</div>
                <div className="cat-tile-meta">あなたの実力</div>
              </button>
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
                  <div className="cat-tile-icon">{l.emoji}</div>
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

      {screen.type === 'deviation' && (
        <DeviationScreen
          onBack={handleBack}
          onRetakeTest={() => alert('プレースメントテストは Phase 6 で実装')}
          onStartLesson={handleOpenLesson}
        />
      )}

      {screen.type === 'profile' && (
        <ProfileScreen
          userName={userName}
          onOpenSettings={() => alert('設定画面は Phase 6 で実装')}
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
