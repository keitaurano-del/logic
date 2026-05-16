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
  descJa: string
  descEn: string
  quoteJa: string
  quoteEn: string
  tipJa: string   // レッスン内の哲学者ヒント
  tipEn: string
}

// 2026-05-16: ランク名を「石」テーマに刷新。10段階で、原石 → 宝石 へと磨かれていくイメージ。
export const RANK_TIERS: RankTier[] = [
  {
    level: 1, title: '砂', titleEn: 'Sand', minXp: 0,
    descJa: '思考の世界に踏み出したばかりの一粒。風に運ばれる頼りない存在だが、すべての石はここから始まる。',
    descEn: 'A single grain just stepping into the world of thinking. Light enough to be carried by the wind — but every stone begins here.',
    quoteJa: '「千里の道も一歩から」',
    quoteEn: '"A journey of a thousand miles begins with a single step."',
    tipJa: 'まずは疑問を持つことから始めよう。「なぜ？」と問い続けることが思考の第一歩だ。',
    tipEn: 'Start by asking questions. Wondering "why?" is the first step of thinking.',
  },
  {
    level: 2, title: '小石', titleEn: 'Pebble', minXp: 500,
    descJa: '水に流され、角が取れ始めた石。まだ形は不揃いだが、自分なりの重みを持ち始めている。',
    descEn: 'A small stone whose edges are starting to smooth out. Still irregular, but with weight of its own.',
    quoteJa: '「点滴石を穿つ」',
    quoteEn: '"Constant dripping wears away the stone."',
    tipJa: '毎日少しでもいい。継続した思考の積み重ねが、原石を磨き上げる。',
    tipEn: 'A little every day is enough. Repeated thinking is what polishes a raw stone.',
  },
  {
    level: 3, title: '燧石', titleEn: 'Flint', minXp: 1500,
    descJa: '叩き合わせると火花を散らす石。鈍く見えても、ぶつけるだけで光を放つ瞬間がある。',
    descEn: 'A stone that throws sparks when struck. Dull at rest, but able to ignite the moment it meets resistance.',
    quoteJa: '「鉄は熱いうちに打て」',
    quoteEn: '"Strike while the iron is hot."',
    tipJa: '思いついたらすぐ書き留めろ。アイデアは衝撃で生まれ、放っておくと消える。',
    tipEn: 'Capture ideas the moment they spark. They\'re born from friction, and they fade when ignored.',
  },
  {
    level: 4, title: '黒曜石', titleEn: 'Obsidian', minXp: 3000,
    descJa: 'ケイ酸に富む溶岩が結晶化せず急冷して固まった、漆黒のガラス質の石。割れ口は刃のように鋭く、古代では刃物として使われた。',
    descEn: 'A jet-black, glassy stone formed when silica-rich lava cools too fast to crystallize. Its fractures are sharp as a blade — ancient peoples shaped it into weapons.',
    quoteJa: '「快刀乱麻を断つ」',
    quoteEn: '"Cut through the tangled knot with a sharp blade."',
    tipJa: '論点を絞れ。あれもこれもと拡げず、最も切れる一点で勝負することを覚えよ。',
    tipEn: 'Narrow the issue. Don\'t spread thin — learn to win on the single sharpest point.',
  },
  {
    level: 5, title: '水晶', titleEn: 'Crystal', minXp: 5000,
    descJa: '六角柱の整った結晶構造を持つ透明な石。光を通し、何が中にあるかをはっきりと示す。',
    descEn: 'A transparent stone with a perfect hexagonal structure. Light passes through it, revealing exactly what lies inside.',
    quoteJa: '「明鏡止水」',
    quoteEn: '"A mind like a clear mirror, still as water."',
    tipJa: '構造を整理せよ。透明な論理は、相手にあなたの思考を「見せる」ことができる。',
    tipEn: 'Structure your thought. Transparent logic lets others see straight through to your reasoning.',
  },
  {
    level: 6, title: '瑪瑙', titleEn: 'Agate', minXp: 7500,
    descJa: '幾重もの縞模様を内に持つ石。鉱液が空洞の中に層をなして沈着し、複雑な美しさを獲得した。',
    descEn: 'A banded stone whose stripes were laid down by mineral fluids precipitating layer by layer inside a cavity. Complexity built through repetition.',
    quoteJa: '「継続は力なり」',
    quoteEn: '"Persistence is power."',
    tipJa: '一度学んだことを別の文脈で再利用せよ。重なる経験が、自分だけの模様を作る。',
    tipEn: 'Reuse what you\'ve learned in new contexts. Layered experience is what creates a pattern only yours.',
  },
  {
    level: 7, title: '翡翠', titleEn: 'Jade', minXp: 10500,
    descJa: '東洋で「玉」と呼ばれ、最高の徳を象徴した緑の石。硬く粘り強く、簡単には砕けない。',
    descEn: 'A green stone revered in the East as the embodiment of virtue. Hard, tough, and not easily broken.',
    quoteJa: '「玉磨かざれば光なし」',
    quoteEn: '"Even jade must be polished to shine."',
    tipJa: '困難な問題こそ正面から向き合え。硬い石ほど磨きがいがあり、深い光を放つ。',
    tipEn: 'Face hard problems head-on. The hardest stones reward polishing with the deepest light.',
  },
  {
    level: 8, title: '琥珀', titleEn: 'Amber', minXp: 14000,
    descJa: '数千万年前の樹脂が固まった石。中に閉じ込められた古代の昆虫が、当時のままの姿を伝える。',
    descEn: 'Tree resin hardened over tens of millions of years. Ancient insects preserved inside still tell their original story.',
    quoteJa: '「温故知新」',
    quoteEn: '"Learn from the past, discover something new."',
    tipJa: '過去の判断を振り返れ。記録は時間が経ったときに最も価値が生まれる。',
    tipEn: 'Revisit past decisions. Records gain their true value once time has passed.',
  },
  {
    level: 9, title: '真珠', titleEn: 'Pearl', minXp: 18000,
    descJa: '貝が体内に入った異物を何年もかけて包み込み、生み出す唯一無二の球体。違和感を核にして、ゆっくりと美が結晶していく。',
    descEn: 'A unique sphere formed when a shell wraps an irritant for years. Beauty crystallized around discomfort.',
    quoteJa: '「忍耐は苦いが、その実は甘い」',
    quoteEn: '"Patience is bitter, but its fruit is sweet."',
    tipJa: '違和感を放置せず、何度も向き合え。引っかかりを抱え続けた人だけが、自分だけの答えを生み出す。',
    tipEn: 'Don\'t ignore what nags you — return to it. Only those who hold onto discomfort produce something singular.',
  },
  {
    level: 10, title: '金剛石', titleEn: 'Diamond', minXp: 23000,
    descJa: '地球上で最も硬い鉱物。深い地中で高温と高圧に耐え抜いた炭素だけが、この透き通った輝きにたどり着く。',
    descEn: 'The hardest mineral on earth. Only carbon that has endured the deepest heat and pressure achieves this clarity.',
    quoteJa: '「金剛不壊」',
    quoteEn: '"Diamond, indestructible."',
    tipJa: '論理は道具ではなく、生き方だ。思考すること自体が、世界を照らす光となる。',
    tipEn: 'Logic is not a tool but a way of being. Thinking itself becomes a light that illuminates the world.',
  },
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

// ============================================================
// NEW LEVEL SYSTEM (SCRUM-130) — Lv1〜99, 名称なし
// XP閾値: minXp(n) = 50 * n * (n-1) / 2
// Lv2=50, Lv5=500, Lv10=2250, Lv20=9500, Lv50=61250, Lv99=242550
// ============================================================

export type LevelInfo = {
  level: number
  minXp: number
  nextXp: number
  color: string
}

export const LEVEL_TABLE: LevelInfo[] = [
  { level:  1, minXp:      0, nextXp:     50, color: 'var(--md-sys-color-primary)' },
  { level:  2, minXp:     50, nextXp:    150, color: 'var(--md-sys-color-primary)' },
  { level:  3, minXp:    150, nextXp:    300, color: 'var(--md-sys-color-primary)' },
  { level:  4, minXp:    300, nextXp:    500, color: 'var(--md-sys-color-primary)' },
  { level:  5, minXp:    500, nextXp:    750, color: 'var(--md-sys-color-primary)' },
  { level:  6, minXp:    750, nextXp:   1050, color: 'var(--md-sys-color-primary)' },
  { level:  7, minXp:   1050, nextXp:   1400, color: 'var(--md-sys-color-primary)' },
  { level:  8, minXp:   1400, nextXp:   1800, color: 'var(--md-sys-color-primary)' },
  { level:  9, minXp:   1800, nextXp:   2250, color: 'var(--md-sys-color-primary)' },
  { level: 10, minXp:   2250, nextXp:   2750, color: 'var(--md-sys-color-primary)' },
  { level: 11, minXp:   2750, nextXp:   3300, color: 'var(--md-sys-color-primary)' },
  { level: 12, minXp:   3300, nextXp:   3900, color: 'var(--md-sys-color-primary)' },
  { level: 13, minXp:   3900, nextXp:   4550, color: 'var(--md-sys-color-primary)' },
  { level: 14, minXp:   4550, nextXp:   5250, color: 'var(--md-sys-color-primary)' },
  { level: 15, minXp:   5250, nextXp:   6000, color: 'var(--md-sys-color-primary)' },
  { level: 16, minXp:   6000, nextXp:   6800, color: 'var(--md-sys-color-primary)' },
  { level: 17, minXp:   6800, nextXp:   7650, color: 'var(--md-sys-color-primary)' },
  { level: 18, minXp:   7650, nextXp:   8550, color: 'var(--md-sys-color-primary)' },
  { level: 19, minXp:   8550, nextXp:   9500, color: 'var(--md-sys-color-primary)' },
  { level: 20, minXp:   9500, nextXp:  10500, color: 'var(--md-sys-color-primary)' },
  { level: 21, minXp:  10500, nextXp:  11550, color: '#7B5EA7' },
  { level: 22, minXp:  11550, nextXp:  12650, color: '#7B5EA7' },
  { level: 23, minXp:  12650, nextXp:  13800, color: '#7B5EA7' },
  { level: 24, minXp:  13800, nextXp:  15000, color: '#7B5EA7' },
  { level: 25, minXp:  15000, nextXp:  16250, color: '#7B5EA7' },
  { level: 26, minXp:  16250, nextXp:  17550, color: '#7B5EA7' },
  { level: 27, minXp:  17550, nextXp:  18900, color: '#7B5EA7' },
  { level: 28, minXp:  18900, nextXp:  20300, color: '#7B5EA7' },
  { level: 29, minXp:  20300, nextXp:  21750, color: '#7B5EA7' },
  { level: 30, minXp:  21750, nextXp:  23250, color: '#7B5EA7' },
  { level: 31, minXp:  23250, nextXp:  24800, color: '#7B5EA7' },
  { level: 32, minXp:  24800, nextXp:  26400, color: '#7B5EA7' },
  { level: 33, minXp:  26400, nextXp:  28050, color: '#7B5EA7' },
  { level: 34, minXp:  28050, nextXp:  29750, color: '#7B5EA7' },
  { level: 35, minXp:  29750, nextXp:  31500, color: '#7B5EA7' },
  { level: 36, minXp:  31500, nextXp:  33300, color: '#7B5EA7' },
  { level: 37, minXp:  33300, nextXp:  35150, color: '#7B5EA7' },
  { level: 38, minXp:  35150, nextXp:  37050, color: '#7B5EA7' },
  { level: 39, minXp:  37050, nextXp:  39000, color: '#7B5EA7' },
  { level: 40, minXp:  39000, nextXp:  41000, color: '#7B5EA7' },
  { level: 41, minXp:  41000, nextXp:  43050, color: '#1A7A5E' },
  { level: 42, minXp:  43050, nextXp:  45150, color: '#1A7A5E' },
  { level: 43, minXp:  45150, nextXp:  47300, color: '#1A7A5E' },
  { level: 44, minXp:  47300, nextXp:  49500, color: '#1A7A5E' },
  { level: 45, minXp:  49500, nextXp:  51750, color: '#1A7A5E' },
  { level: 46, minXp:  51750, nextXp:  54050, color: '#1A7A5E' },
  { level: 47, minXp:  54050, nextXp:  56400, color: '#1A7A5E' },
  { level: 48, minXp:  56400, nextXp:  58800, color: '#1A7A5E' },
  { level: 49, minXp:  58800, nextXp:  61250, color: '#1A7A5E' },
  { level: 50, minXp:  61250, nextXp:  63750, color: '#1A7A5E' },
  { level: 51, minXp:  63750, nextXp:  66300, color: '#1A7A5E' },
  { level: 52, minXp:  66300, nextXp:  68900, color: '#1A7A5E' },
  { level: 53, minXp:  68900, nextXp:  71550, color: '#1A7A5E' },
  { level: 54, minXp:  71550, nextXp:  74250, color: '#1A7A5E' },
  { level: 55, minXp:  74250, nextXp:  77000, color: '#1A7A5E' },
  { level: 56, minXp:  77000, nextXp:  79800, color: '#1A7A5E' },
  { level: 57, minXp:  79800, nextXp:  82650, color: '#1A7A5E' },
  { level: 58, minXp:  82650, nextXp:  85550, color: '#1A7A5E' },
  { level: 59, minXp:  85550, nextXp:  88500, color: '#1A7A5E' },
  { level: 60, minXp:  88500, nextXp:  91500, color: '#1A7A5E' },
  { level: 61, minXp:  91500, nextXp:  94550, color: '#B8860B' },
  { level: 62, minXp:  94550, nextXp:  97650, color: '#B8860B' },
  { level: 63, minXp:  97650, nextXp: 100800, color: '#B8860B' },
  { level: 64, minXp: 100800, nextXp: 104000, color: '#B8860B' },
  { level: 65, minXp: 104000, nextXp: 107250, color: '#B8860B' },
  { level: 66, minXp: 107250, nextXp: 110550, color: '#B8860B' },
  { level: 67, minXp: 110550, nextXp: 113900, color: '#B8860B' },
  { level: 68, minXp: 113900, nextXp: 117300, color: '#B8860B' },
  { level: 69, minXp: 117300, nextXp: 120750, color: '#B8860B' },
  { level: 70, minXp: 120750, nextXp: 124250, color: '#B8860B' },
  { level: 71, minXp: 124250, nextXp: 127800, color: '#B8860B' },
  { level: 72, minXp: 127800, nextXp: 131400, color: '#B8860B' },
  { level: 73, minXp: 131400, nextXp: 135050, color: '#B8860B' },
  { level: 74, minXp: 135050, nextXp: 138750, color: '#B8860B' },
  { level: 75, minXp: 138750, nextXp: 142500, color: '#B8860B' },
  { level: 76, minXp: 142500, nextXp: 146300, color: '#B8860B' },
  { level: 77, minXp: 146300, nextXp: 150150, color: '#B8860B' },
  { level: 78, minXp: 150150, nextXp: 154050, color: '#B8860B' },
  { level: 79, minXp: 154050, nextXp: 158000, color: '#B8860B' },
  { level: 80, minXp: 158000, nextXp: 162000, color: '#B8860B' },
  { level: 81, minXp: 162000, nextXp: 166050, color: '#C0392B' },
  { level: 82, minXp: 166050, nextXp: 170150, color: '#C0392B' },
  { level: 83, minXp: 170150, nextXp: 174300, color: '#C0392B' },
  { level: 84, minXp: 174300, nextXp: 178500, color: '#C0392B' },
  { level: 85, minXp: 178500, nextXp: 182750, color: '#C0392B' },
  { level: 86, minXp: 182750, nextXp: 187050, color: '#C0392B' },
  { level: 87, minXp: 187050, nextXp: 191400, color: '#C0392B' },
  { level: 88, minXp: 191400, nextXp: 195800, color: '#C0392B' },
  { level: 89, minXp: 195800, nextXp: 200250, color: '#C0392B' },
  { level: 90, minXp: 200250, nextXp: 204750, color: '#C0392B' },
  { level: 91, minXp: 204750, nextXp: 209300, color: '#C0392B' },
  { level: 92, minXp: 209300, nextXp: 213900, color: '#C0392B' },
  { level: 93, minXp: 213900, nextXp: 218550, color: '#C0392B' },
  { level: 94, minXp: 218550, nextXp: 223250, color: '#C0392B' },
  { level: 95, minXp: 223250, nextXp: 228000, color: '#C0392B' },
  { level: 96, minXp: 228000, nextXp: 232800, color: '#C0392B' },
  { level: 97, minXp: 232800, nextXp: 237650, color: '#C0392B' },
  { level: 98, minXp: 237650, nextXp: 242550, color: '#C0392B' },
  { level: 99, minXp: 242550, nextXp: 242550, color: '#C0392B' },
]

export function getCurrentLevel(xp: number): LevelInfo {
  return [...LEVEL_TABLE].reverse().find(l => xp >= l.minXp) ?? LEVEL_TABLE[0]
}

export function getXpProgress(xp: number): { pct: number; current: number; needed: number } {
  const lv = getCurrentLevel(xp)
  if (lv.level === 99) return { pct: 100, current: 0, needed: 0 }
  const current = xp - lv.minXp
  const needed = lv.nextXp - lv.minXp
  return { pct: Math.min(100, Math.round((current / needed) * 100)), current, needed }
}
