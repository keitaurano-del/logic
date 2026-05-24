/* eslint-disable @typescript-eslint/no-explicit-any */
import { getSupabaseClient } from './db/index'
import { localDateStr } from './stats'

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
  // JST 0-9 時で UTC とズレるため localDateStr() を使う (REVIEW_REPORT 高#2)
  const today = localDateStr()
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

  // JST 基準で日付を扱う。UTC 換算の toISOString().slice(0,10) は
  // JST 0-9 時に前日扱いになり、SRS の due 判定が 1 日ズレるため使わない。
  const today = new Date()
  const todayStr = localDateStr(today)

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
    card.nextReview = localDateStr(next)
  } else {
    card.correctCount++
    card.ease = Math.min(3.0, card.ease + 0.15)
    card.interval = card.interval === 0 ? 3 : Math.round(card.interval * card.ease * 1.3)
    const next = new Date(today)
    next.setDate(next.getDate() + card.interval)
    card.nextReview = localDateStr(next)
  }

  saveCards(cards)
}

export function getDueCards(): Flashcard[] {
  const today = localDateStr()
  return loadCards().filter((c) => c.nextReview <= today)
}

/** 過去に間違えたことがあるカード（弱点カード）。間違えた回数が多い順 */
export function getWeakCards(): Flashcard[] {
  return loadCards()
    .filter((c) => c.wrongCount > 0)
    .sort((a, b) => {
      const aScore = b.wrongCount - b.correctCount
      const bScore = a.wrongCount - a.correctCount
      if (aScore !== bScore) return aScore - bScore
      return b.wrongCount - a.wrongCount
    })
}

export function getCardStats() {
  const cards = loadCards()
  const today = localDateStr()
  const due = cards.filter((c) => c.nextReview <= today).length
  const weak = cards.filter((c) => c.wrongCount > 0).length
  const mastered = cards.filter((c) => c.correctCount >= 3 && c.interval >= 7).length
  return { total: cards.length, due, weak, mastered }
}

// =============================================
// Supabase 同期 (Phase 1: Device Sync)
// =============================================

type FlashcardRow = {
  card_key: string
  source: string
  category: string
  front: string
  back: string
  interval_days: number
  ease: number
  next_review: string
  correct_count: number
  wrong_count: number
  created_at: string
  updated_at: string
}

function rowToCard(row: FlashcardRow): Flashcard {
  return {
    id: row.card_key,
    front: row.front,
    back: row.back,
    category: row.category,
    source: row.source,
    createdAt: row.created_at ? row.created_at.slice(0, 10) : localDateStr(),
    interval: row.interval_days ?? 0,
    ease: row.ease ?? 2.5,
    nextReview: row.next_review,
    correctCount: row.correct_count ?? 0,
    wrongCount: row.wrong_count ?? 0,
  }
}

function cardToRow(userId: string, card: Flashcard, updatedAt?: string): Record<string, unknown> {
  return {
    user_id: userId,
    card_key: card.id,
    source: card.source,
    category: card.category,
    front: card.front,
    back: card.back,
    interval_days: card.interval,
    ease: card.ease,
    next_review: card.nextReview,
    correct_count: card.correctCount,
    wrong_count: card.wrongCount,
    updated_at: updatedAt ?? new Date().toISOString(),
  }
}

async function fetchCardsFromDB(userId: string): Promise<Flashcard[] | null> {
  const db = getSupabaseClient()
  if (!db) return null
  try {
    const { data, error } = await (db as any)
      .from('user_flashcards')
      .select('card_key, source, category, front, back, interval_days, ease, next_review, correct_count, wrong_count, created_at, updated_at')
      .eq('user_id', userId)
    if (error) {
      console.warn('[flashcardData] fetchCardsFromDB error:', error.message)
      return null
    }
    return (data || []).map((r: FlashcardRow) => rowToCard(r))
  } catch (e) {
    console.warn('[flashcardData] fetchCardsFromDB exception:', e)
    return null
  }
}

/** 1 枚を DB に upsert (書き込みフック用) */
export async function pushCardToDB(userId: string, card: Flashcard): Promise<void> {
  const db = getSupabaseClient()
  if (!db) return
  try {
    const { error } = await (db as any)
      .from('user_flashcards')
      .upsert([cardToRow(userId, card)], { onConflict: 'user_id,card_key' })
    if (error) console.warn('[flashcardData] pushCardToDB error:', error.message)
  } catch (e) {
    console.warn('[flashcardData] pushCardToDB exception:', e)
  }
}

async function pushCardsToDB(userId: string, cards: Flashcard[]): Promise<void> {
  if (cards.length === 0) return
  const db = getSupabaseClient()
  if (!db) return
  try {
    const now = new Date().toISOString()
    const rows = cards.map((c) => cardToRow(userId, c, now))
    const CHUNK = 500
    for (let i = 0; i < rows.length; i += CHUNK) {
      const chunk = rows.slice(i, i + CHUNK)
      const { error } = await (db as any)
        .from('user_flashcards')
        .upsert(chunk, { onConflict: 'user_id,card_key' })
      if (error) {
        console.warn('[flashcardData] pushCardsToDB error:', error.message)
        return
      }
    }
  } catch (e) {
    console.warn('[flashcardData] pushCardsToDB exception:', e)
  }
}

/** ローカル削除 + DB 削除 */
export async function deleteCardForUser(userId: string, cardKey: string): Promise<void> {
  const cards = loadCards().filter((c) => c.id !== cardKey)
  saveCards(cards)
  const db = getSupabaseClient()
  if (!db) return
  try {
    const { error } = await (db as any)
      .from('user_flashcards')
      .delete()
      .eq('user_id', userId)
      .eq('card_key', cardKey)
    if (error) console.warn('[flashcardData] deleteCardForUser error:', error.message)
  } catch (e) {
    console.warn('[flashcardData] deleteCardForUser exception:', e)
  }
}

/**
 * ログイン時の同期。
 * 戦略: Last-write-wins by 進捗指標 (correctCount + interval)。
 * - 両方にある場合: 進捗が大きい方を採用 (SRS の古い値で復習結果を上書きしない)
 * - 片方だけ: そのまま使う
 */
export async function syncFlashcards(userId: string): Promise<void> {
  const db = getSupabaseClient()
  if (!db) return
  try {
    const remote = await fetchCardsFromDB(userId)
    if (remote == null) return
    const local = loadCards()

    const remoteByKey = new Map(remote.map((r) => [r.id, r]))
    const merged = new Map<string, Flashcard>()
    for (const r of remote) merged.set(r.id, r)

    const toPush: Flashcard[] = []
    for (const l of local) {
      const r = remoteByKey.get(l.id)
      if (!r) {
        merged.set(l.id, l)
        toPush.push(l)
        continue
      }
      const localProgress = l.correctCount + l.interval
      const remoteProgress = r.correctCount + r.interval
      if (localProgress > remoteProgress) {
        merged.set(l.id, l)
        toPush.push(l)
      }
    }

    const mergedArr = [...merged.values()]
    saveCards(mergedArr)
    await pushCardsToDB(userId, toPush)

    if (import.meta.env.DEV) {
      console.log(
        '[flashcardData] syncFlashcards complete:',
        `remote=${remote.length}`,
        `local=${local.length}`,
        `merged=${mergedArr.length}`,
        `pushed=${toPush.length}`,
      )
    }
  } catch (e) {
    console.warn('[flashcardData] syncFlashcards failed:', e)
  }
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
