// Helpers for v3 HomeScreen: streak recovery, points calculation, ranking percentile
import { getStreak, getStudyDates, getCompletedCount, getStudyTimeMs } from '../stats'

/** Returns streak state: 'none' | 'active' | 'at-risk' */
export function getStreakState(): 'none' | 'active' | 'at-risk' {
  const s = getStreak()
  if (s === 0) return 'none'
  const dates = getStudyDates().sort()
  if (dates.length === 0) return 'none'
  const last = dates[dates.length - 1]
  const todayStr = new Date().toISOString().slice(0, 10)
  return last === todayStr ? 'active' : 'at-risk'
}

/** Hours remaining until midnight local time. For the "streak protection" banner. */
export function hoursUntilMidnight(): { hours: number; minutes: number } {
  const now = new Date()
  const midnight = new Date(now)
  midnight.setHours(24, 0, 0, 0)
  const ms = midnight.getTime() - now.getTime()
  return {
    hours: Math.floor(ms / 3600000),
    minutes: Math.floor((ms % 3600000) / 60000),
  }
}

/** Points = completed lessons * 50 + study minutes * 2 (authentic to existing stats data) */
export function getPoints(): number {
  const lessons = getCompletedCount()
  const studyMin = Math.floor(getStudyTimeMs() / 60000)
  return lessons * 50 + studyMin * 2
}

/** Approximate percentile (top %) from deviation score using the standard normal table.
 *  dev 50 → 50%, 60 → 16%, 70 → 2%. Uses a rational approximation of 1 - Φ(z). */
export function deviationToTopPercent(deviation: number): number {
  const z = (deviation - 50) / 10
  if (z <= 0) return Math.round(100 - standardNormalCdf(z) * 100)
  return Math.max(1, Math.round((1 - standardNormalCdf(z)) * 100))
}

/** Rational approximation of the standard normal CDF (Abramowitz & Stegun 26.2.17). */
function standardNormalCdf(x: number): number {
  const t = 1 / (1 + 0.2316419 * Math.abs(x))
  const d = 0.3989422804014327 * Math.exp(-(x * x) / 2)
  const p =
    d *
    t *
    (0.31938153 +
      t *
        (-0.356563782 +
          t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))))
  return x > 0 ? 1 - p : p
}

/** Build a 12-week × 7-day (84 days) activity grid from study dates. */
export function buildActivityGrid(dates: string[]): number[] {
  const set = new Set(dates)
  const grid: number[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  // Start 83 days ago
  for (let i = 83; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const iso = d.toISOString().slice(0, 10)
    grid.push(set.has(iso) ? 4 : 0) // binary for now; 1-4 levels if study time available per day
  }
  return grid
}

// ============================================================
// Level / Rank system
// ============================================================

export type RankTier = {
  level: number
  title: string
  titleEn: string
  minXp: number
}

export const RANK_TIERS: RankTier[] = [
  { level: 1,  title: '哲学の卵',       titleEn: 'Philosophical Egg',   minXp: 0    },
  { level: 2,  title: 'ソフィスト',     titleEn: 'Sophist',             minXp: 1000 },
  { level: 3,  title: 'ソクラテス',     titleEn: 'Socrates',            minXp: 2000 },
  { level: 4,  title: 'プラトン',       titleEn: 'Plato',               minXp: 3000 },
  { level: 5,  title: 'アリストテレス', titleEn: 'Aristotle',           minXp: 4000 },
  { level: 6,  title: 'デカルト',       titleEn: 'Descartes',           minXp: 5000 },
  { level: 7,  title: 'カント',         titleEn: 'Kant',                minXp: 6000 },
  { level: 8,  title: 'ヘーゲル',       titleEn: 'Hegel',               minXp: 7000 },
  { level: 9,  title: 'ニーチェ',       titleEn: 'Nietzsche',           minXp: 8000 },
  { level: 10, title: 'ロゴスの神',     titleEn: 'God of Logos',        minXp: 9000 },
]

export function getLevelTitle(xp: number, locale: 'ja' | 'en' = 'ja'): string {
  const tier = [...RANK_TIERS].reverse().find((t) => xp >= t.minXp) ?? RANK_TIERS[0]
  return locale === 'en' ? tier.titleEn : tier.title
}

export function getCurrentTier(xp: number): RankTier {
  return [...RANK_TIERS].reverse().find((t) => xp >= t.minXp) ?? RANK_TIERS[0]
}

/** Greeting by local time of day, locale-aware. */
export function timeBasedGreeting(locale: 'ja' | 'en' = 'ja'): { eyebrow: string; greeting: string } {
  const h = new Date().getHours()
  if (locale === 'en') {
    if (h < 5)  return { eyebrow: 'GOOD NIGHT',     greeting: 'Still up?' }
    if (h < 11) return { eyebrow: 'GOOD MORNING',   greeting: 'Good morning' }
    if (h < 17) return { eyebrow: 'GOOD AFTERNOON', greeting: 'Good afternoon' }
    if (h < 22) return { eyebrow: 'GOOD EVENING',   greeting: 'Good evening' }
    return       { eyebrow: 'GOOD NIGHT',            greeting: 'Good night' }
  }
  if (h < 5)  return { eyebrow: 'GOOD NIGHT',     greeting: 'まだ起きてる?' }
  if (h < 11) return { eyebrow: 'GOOD MORNING',   greeting: 'おはよう' }
  if (h < 17) return { eyebrow: 'GOOD AFTERNOON', greeting: 'こんにちは' }
  if (h < 22) return { eyebrow: 'GOOD EVENING',   greeting: 'こんばんは' }
  return       { eyebrow: 'GOOD NIGHT',            greeting: 'お疲れさま' }
}
