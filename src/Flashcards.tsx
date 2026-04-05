import { useState, useEffect } from 'react'
import { getDueCards, reviewCard, getCardStats, loadCards, type Flashcard } from './flashcardData'
import { incrementCompleted, sourceToCategory } from './progressStore'
import './Flashcards.css'

type Props = { onBack: () => void }

type View = 'home' | 'review' | 'done'

export default function Flashcards({ onBack }: Props) {
  const [view, setView] = useState<View>('home')
  const [dueCards, setDueCards] = useState<Flashcard[]>([])
  const [current, setCurrent] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [stats, setStats] = useState(getCardStats())
  const [sessionCorrect, setSessionCorrect] = useState(0)
  const [sessionTotal, setSessionTotal] = useState(0)

  useEffect(() => {
    setStats(getCardStats())
  }, [view])

  const startReview = () => {
    const cards = getDueCards()
    // Shuffle
    for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]]
    }
    setDueCards(cards)
    setCurrent(0)
    setFlipped(false)
    setSessionCorrect(0)
    setSessionTotal(0)
    setView('review')
  }

  const handleReview = (quality: 'again' | 'good' | 'easy') => {
    const card = dueCards[current]
    const prevCorrect = card.correctCount
    reviewCard(card.id, quality)
    setSessionTotal((t) => t + 1)
    if (quality !== 'again') {
      setSessionCorrect((c) => c + 1)
      // If the card just reached mastery (correctCount === 3), update progress
      if (prevCorrect === 2) {
        const cat = sourceToCategory(card.source)
        if (cat) incrementCompleted(cat)
      }
    }

    if (current + 1 >= dueCards.length) {
      setView('done')
    } else {
      setCurrent((c) => c + 1)
      setFlipped(false)
    }
  }

  const allCards = loadCards()
  const categories = [...new Set(allCards.map((c) => c.category))]

  // Home
  if (view === 'home') {
    return (
      <div className="fc-screen">
        <header className="fc-header">
          <button className="fc-back" onClick={onBack}>←</button>
          <span className="fc-header-title">フラッシュカード</span>
          <div />
        </header>

        <div className="fc-home">
          <div className="fc-hero-card">
            <div className="fc-hero-text">
              {stats.total === 0 ? (
                <>
                  <h3>まだカードがありません</h3>
                  <p>レッスンを完了するとフラッシュカードが自動で作成されます</p>
                </>
              ) : stats.due > 0 ? (
                <>
                  <h3>復習しよう！</h3>
                  <p><strong>{stats.due}枚</strong>のカードが復習待ちです</p>
                </>
              ) : (
                <>
                  <h3>今日の復習は完了！</h3>
                  <p>次の復習日まで待ちましょう</p>
                </>
              )}
            </div>
          </div>

          {stats.due > 0 && (
            <button className="fc-start-btn" onClick={startReview}>
              復習を始める（{stats.due}枚）
            </button>
          )}

          <div className="fc-stats-row">
            <div className="fc-stat-mini">
              <span className="fc-stat-mini-val">{stats.total}</span>
              <span className="fc-stat-mini-lbl">総カード</span>
            </div>
            <div className="fc-stat-mini">
              <span className="fc-stat-mini-val">{stats.due}</span>
              <span className="fc-stat-mini-lbl">復習待ち</span>
            </div>
            <div className="fc-stat-mini">
              <span className="fc-stat-mini-val">{stats.mastered}</span>
              <span className="fc-stat-mini-lbl">習得済み</span>
            </div>
          </div>

          {categories.length > 0 && (
            <div className="fc-categories">
              <h4 className="fc-cat-title">カテゴリ別</h4>
              {categories.map((cat) => {
                const catCards = allCards.filter((c) => c.category === cat)
                const catDue = catCards.filter((c) => c.nextReview <= new Date().toISOString().slice(0, 10)).length
                return (
                  <div key={cat} className="fc-cat-row">
                    <span className="fc-cat-name">{cat}</span>
                    <span className="fc-cat-count">{catCards.length}枚{catDue > 0 ? ` (${catDue}枚復習待ち)` : ''}</span>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Review
  if (view === 'review') {
    const card = dueCards[current]
    return (
      <div className="fc-screen">
        <header className="fc-header">
          <button className="fc-back" onClick={() => setView('home')}>←</button>
          <span className="fc-header-title">{current + 1} / {dueCards.length}</span>
          <div />
        </header>

        <div className="fc-progress-bar">
          <div className="fc-progress-fill" style={{ width: `${((current + 1) / dueCards.length) * 100}%` }} />
        </div>

        <div className="fc-review">
          <span className="fc-card-cat">{card.category}</span>

          <div
            className={`fc-card ${flipped ? 'flipped' : ''}`}
            onClick={() => !flipped && setFlipped(true)}
          >
            <div className="fc-card-inner">
              <div className="fc-card-front">
                <p>{card.front}</p>
                <span className="fc-tap-hint">タップで解答を表示</span>
              </div>
              <div className="fc-card-back">
                {card.back.split('\n').map((line, i) => (
                  <p key={i}>{line || '\u00A0'}</p>
                ))}
              </div>
            </div>
          </div>

          {flipped && (
            <div className="fc-buttons">
              <button className="fc-btn again" onClick={() => handleReview('again')}>
                <span className="fc-btn-icon">✕</span>
                もう一度
              </button>
              <button className="fc-btn good" onClick={() => handleReview('good')}>
                <span className="fc-btn-icon">○</span>
                覚えた
              </button>
              <button className="fc-btn easy" onClick={() => handleReview('easy')}>
                <span className="fc-btn-icon">◎</span>
                簡単
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Done
  return (
    <div className="fc-screen">
      <header className="fc-header">
        <button className="fc-back" onClick={() => setView('home')}>←</button>
        <span className="fc-header-title">復習完了</span>
        <div />
      </header>

      <div className="fc-done">
        <h2>お疲れさま！</h2>
        <p className="fc-done-score">{sessionCorrect} / {sessionTotal} 正解</p>
        <div className="fc-done-bar">
          <div className="fc-done-fill" style={{ width: `${sessionTotal > 0 ? (sessionCorrect / sessionTotal) * 100 : 0}%` }} />
        </div>
        <p className="fc-done-msg">
          {sessionTotal > 0 && sessionCorrect === sessionTotal
            ? '全問正解！素晴らしい記憶力です。'
            : sessionCorrect >= sessionTotal * 0.7
              ? 'いい調子！間違えたカードは明日また出てきます。'
              : '復習を続けて定着させましょう。間違えたカードはすぐにもう一度出てきます。'}
        </p>
        <button className="fc-start-btn" onClick={() => setView('home')}>戻る</button>
      </div>
    </div>
  )
}
