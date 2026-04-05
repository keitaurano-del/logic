const STORAGE_KEY = 'logic-flashcards'

export type Flashcard = {
  id: string
  front: string
  back: string
  category: string
  source: string          // e.g. "lesson-6", "ai-weak"
  createdAt: string
  // Spaced repetition
  interval: number        // days until next review
  ease: number            // easiness factor (2.5 default)
  nextReview: string      // YYYY-MM-DD
  correctCount: number
  wrongCount: number
}

export function loadCards(): Flashcard[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function saveCards(cards: Flashcard[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cards))
}

export function addCards(newCards: Omit<Flashcard, 'id' | 'createdAt' | 'interval' | 'ease' | 'nextReview' | 'correctCount' | 'wrongCount'>[]) {
  const cards = loadCards()
  const today = new Date().toISOString().slice(0, 10)
  for (const c of newCards) {
    // Skip duplicates (same front text + source)
    if (cards.some((e) => e.front === c.front && e.source === c.source)) continue
    cards.push({
      ...c,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      createdAt: today,
      interval: 0,
      ease: 2.5,
      nextReview: today,
      correctCount: 0,
      wrongCount: 0,
    })
  }
  saveCards(cards)
}

// SM-2 inspired review
export function reviewCard(id: string, quality: 'again' | 'good' | 'easy') {
  const cards = loadCards()
  const card = cards.find((c) => c.id === id)
  if (!card) return

  const today = new Date()
  const todayStr = today.toISOString().slice(0, 10)

  if (quality === 'again') {
    card.wrongCount++
    card.interval = 0
    card.ease = Math.max(1.3, card.ease - 0.3)
    card.nextReview = todayStr
  } else if (quality === 'good') {
    card.correctCount++
    card.interval = card.interval === 0 ? 1 : Math.round(card.interval * card.ease)
    const next = new Date(today)
    next.setDate(next.getDate() + card.interval)
    card.nextReview = next.toISOString().slice(0, 10)
  } else {
    card.correctCount++
    card.ease = Math.min(3.0, card.ease + 0.15)
    card.interval = card.interval === 0 ? 3 : Math.round(card.interval * card.ease * 1.3)
    const next = new Date(today)
    next.setDate(next.getDate() + card.interval)
    card.nextReview = next.toISOString().slice(0, 10)
  }

  saveCards(cards)
}

export function getDueCards(): Flashcard[] {
  const today = new Date().toISOString().slice(0, 10)
  return loadCards().filter((c) => c.nextReview <= today)
}

export function getCardStats() {
  const cards = loadCards()
  const today = new Date().toISOString().slice(0, 10)
  const due = cards.filter((c) => c.nextReview <= today).length
  const mastered = cards.filter((c) => c.correctCount >= 3 && c.interval >= 7).length
  return { total: cards.length, due, mastered }
}

// Generate flashcards from lesson quiz results
export function generateFromLesson(
  lessonId: number,
  lessonTitle: string,
  wrongQuestions: { question: string; correctAnswer: string; explanation: string }[],
  explainSteps: { title: string; content: string }[],
) {
  const cards: Omit<Flashcard, 'id' | 'createdAt' | 'interval' | 'ease' | 'nextReview' | 'correctCount' | 'wrongCount'>[] = []
  const source = `lesson-${lessonId}`

  // Cards from wrong answers (priority)
  for (const q of wrongQuestions) {
    cards.push({
      front: q.question,
      back: `${q.correctAnswer}\n\n${q.explanation}`,
      category: lessonTitle,
      source,
    })
  }

  // Cards from explain steps (key concepts)
  for (const step of explainSteps) {
    const lines = step.content.split('\n').filter((l) => l.trim())
    if (lines.length > 0) {
      cards.push({
        front: step.title,
        back: lines.slice(0, 3).join('\n'),
        category: lessonTitle,
        source,
      })
    }
  }

  addCards(cards)
  return cards.length
}
