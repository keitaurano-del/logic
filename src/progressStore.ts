import { loadCards } from './flashcardData'
import { getProgress, saveAllProgress, saveProgressCategory } from './db/progressDb'

const STORAGE_KEY = 'logic-progress'

export type Category = 'ロジカルシンキング'

export type CategoryProgress = {
  totalCards: number
  completedCards: number
}

const LESSON_TO_CATEGORY: Record<number, Category> = {
  20: 'ロジカルシンキング',
  21: 'ロジカルシンキング',
  22: 'ロジカルシンキング',
  23: 'ロジカルシンキング',
  24: 'ロジカルシンキング',
  25: 'ロジカルシンキング',
  26: 'ロジカルシンキング',
  27: 'ロジカルシンキング',
  28: 'ロジカルシンキング',
  29: 'ロジカルシンキング',
  35: 'ロジカルシンキング',
  36: 'ロジカルシンキング',
  40: 'ロジカルシンキング',
  41: 'ロジカルシンキング',
  42: 'ロジカルシンキング',
  43: 'ロジカルシンキング',
}

const DEFAULT_PROGRESS: Record<Category, CategoryProgress> = {
  'ロジカルシンキング': { totalCards: 0, completedCards: 0 },
}

// =============================================
// localStorage ロジック（未ログイン・フォールバック用）
// =============================================

export function loadProgress(): Record<Category, CategoryProgress> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      // Only return keys that exist in DEFAULT_PROGRESS
      const result: Record<Category, CategoryProgress> = structuredClone(DEFAULT_PROGRESS)
      for (const cat of Object.keys(DEFAULT_PROGRESS) as Category[]) {
        if (parsed[cat]) result[cat] = parsed[cat]
      }
      return result
    }
  } catch { /* ignore */ }
  return structuredClone(DEFAULT_PROGRESS)
}

function saveProgress(progress: Record<Category, CategoryProgress>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress))
}

export function incrementCompleted(category: Category): void {
  const progress = loadProgress()
  if (progress[category]) {
    progress[category].completedCards++
    saveProgress(progress)
  }
}

export function setTotalCards(category: Category, total: number): void {
  const progress = loadProgress()
  if (progress[category]) {
    progress[category].totalCards = total
    saveProgress(progress)
  }
}

export function getCompletionRate(category: Category): number {
  const progress = loadProgress()
  const p = progress[category]
  if (!p || p.totalCards === 0) return 0
  return Math.round((p.completedCards / p.totalCards) * 100)
}

/** Parse a source like "lesson-6" into its lesson ID number */
function parseLessonId(source: string): number | null {
  const match = source.match(/^lesson-(\d+)$/)
  return match ? parseInt(match[1], 10) : null
}

/** Map a flashcard source to a category */
export function sourceToCategory(source: string): Category | null {
  const id = parseLessonId(source)
  if (id !== null && id in LESSON_TO_CATEGORY) {
    return LESSON_TO_CATEGORY[id]
  }
  return null
}

/** Read flashcardData to calculate initial totals and completed counts by category */
export function initFromFlashcards(): void {
  const cards = loadCards()
  const counts: Record<Category, { total: number; completed: number }> = {
    'ロジカルシンキング': { total: 0, completed: 0 },
  }

  for (const card of cards) {
    const cat = sourceToCategory(card.source)
    if (cat) {
      counts[cat].total++
      if (card.correctCount >= 3) {
        counts[cat].completed++
      }
    }
  }

  const progress = loadProgress()
  for (const cat of Object.keys(counts) as Category[]) {
    progress[cat].totalCards = counts[cat].total
    progress[cat].completedCards = counts[cat].completed
  }
  saveProgress(progress)
}

// =============================================
// Supabase ハイブリッド関数
// =============================================

/**
 * 認証済みユーザーの進捗を DB から読み込み、localStorage に同期する
 */
export async function loadProgressFromDB(
  userId: string
): Promise<Record<Category, CategoryProgress>> {
  try {
    const dbProgress = await getProgress(userId)
    if (dbProgress) {
      // DB データを localStorage にキャッシュ
      saveProgress(dbProgress)
      return dbProgress
    }
  } catch (e) {
    console.warn('[progressStore] loadProgressFromDB failed, using localStorage:', e)
  }
  return loadProgress()
}

/**
 * 認証済みユーザーの進捗を DB と localStorage の両方に保存
 */
export async function incrementCompletedForUser(
  userId: string,
  category: Category
): Promise<void> {
  // localStorage 更新
  const progress = loadProgress()
  if (progress[category]) {
    progress[category].completedCards++
    saveProgress(progress)
  }

  // DB 更新（失敗しても localStorage は更新済み）
  try {
    await saveProgressCategory(userId, category, progress[category])
  } catch (e) {
    console.warn('[progressStore] DB sync failed:', e)
  }
}

/**
 * localStorage のデータを Supabase DB に移行する
 * ログイン時に一度だけ呼び出す
 */
export async function migrateLocalStorageToSupabase(userId: string): Promise<void> {
  try {
    const local = loadProgress()
    // デフォルト値のみの場合はスキップ
    const hasData = (Object.values(local) as CategoryProgress[]).some(
      (p) => p.totalCards > 0 || p.completedCards > 0
    )
    if (!hasData) return

    // DB に既存データがあるか確認
    const dbProgress = await getProgress(userId)
    if (dbProgress) {
      // DB のほうが新しい値が多ければ統合（大きい方を採用）
      const merged: Record<Category, CategoryProgress> = structuredClone(dbProgress)
      for (const cat of Object.keys(local) as Category[]) {
        merged[cat] = {
          totalCards: Math.max(dbProgress[cat]?.totalCards ?? 0, local[cat].totalCards),
          completedCards: Math.max(
            dbProgress[cat]?.completedCards ?? 0,
            local[cat].completedCards
          ),
        }
      }
      await saveAllProgress(userId, merged)
      saveProgress(merged)
    } else {
      // DB に何もなければ localStorage をそのまま移行
      await saveAllProgress(userId, local)
    }

    console.log('[progressStore] migrated localStorage to Supabase')
  } catch (e) {
    console.warn('[progressStore] migration failed:', e)
  }
}
