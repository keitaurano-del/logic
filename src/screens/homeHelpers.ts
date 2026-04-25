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

export const RANK_TIERS: RankTier[] = [
  {
    level: 1, title: '哲学の卵', titleEn: 'Philosophical Egg', minXp: 0,
    descJa: '哲学の世界に足を踏み入れたばかりの挑戦者。まだ何も知らないからこそ、すべてが新鮮に見える。好奇心こそが最大の武器だ。',
    descEn: 'A challenger who has just stepped into the world of philosophy. Curiosity is your greatest weapon.',
    quoteJa: '「始まりは半ば以上だ」— アリストテレス',
    quoteEn: '"Well begun is half done." — Aristotle',
    tipJa: 'まずは疑問を持つことから始めよう。「なぜ？」と問い続けることが哲学の第一歩だ。',
    tipEn: 'Start by asking questions. Wondering "why?" is the first step of philosophy.',
  },
  {
    level: 2, title: 'ソフィスト', titleEn: 'Sophist', minXp: 1000,
    descJa: '古代ギリシャの弁論術の達人たち。説得のプロだったが、真理よりも勝利を重視した。ソクラテスはこれを批判した。',
    descEn: 'Masters of rhetoric in ancient Greece. Skilled persuaders, but prioritized victory over truth.',
    quoteJa: '「人間は万物の尺度である」— プロタゴラス',
    quoteEn: '"Man is the measure of all things." — Protagoras',
    tipJa: '言葉で相手を説得するには、まず論理的な構造が必要だ。感情だけでは人を動かせない。',
    tipEn: 'To persuade with words, you first need a logical structure. Emotion alone won\'t move people.',
  },
  {
    level: 3, title: 'ソクラテス', titleEn: 'Socrates', minXp: 2000,
    descJa: '「無知の知」を説いたアテナイの哲学者（BC 470-399）。問答法で弟子たちの魂を磨いた。真理のために毒杯を仰いで死んだ。',
    descEn: 'Athenian philosopher (470-399 BC) who taught "I know that I know nothing." He died for the truth.',
    quoteJa: '「汝自身を知れ」',
    quoteEn: '"Know thyself."',
    tipJa: '答えを教えるのではなく、問いを立てることが大切だ。問うことで相手も自分も真理に近づく。',
    tipEn: 'It\'s more important to pose questions than to provide answers. Questioning brings everyone closer to truth.',
  },
  {
    level: 4, title: 'プラトン', titleEn: 'Plato', minXp: 3000,
    descJa: 'ソクラテスの弟子（BC 427-347）。イデア論を確立し、現実の世界を超えた「形相」の存在を説いた。アカデメイアを創設。',
    descEn: 'Disciple of Socrates (427-347 BC) who developed the Theory of Forms and founded the Academy.',
    quoteJa: '「美しいものは難しい」',
    quoteEn: '"Beauty is difficult."',
    tipJa: '表面に見えるものだけが真実ではない。物事の本質——「イデア」——を見抜く眼を養え。',
    tipEn: 'What appears on the surface isn\'t the whole truth. Train your eyes to see the essence of things.',
  },
  {
    level: 5, title: 'アリストテレス', titleEn: 'Aristotle', minXp: 4000,
    descJa: '万学の祖（BC 384-322）。論理学・自然学・政治学・倫理学を体系化し、現代科学の基礎を築いた。アレクサンドロス大王の家庭教師でもある。',
    descEn: 'Father of all sciences (384-322 BC). Systematized logic, natural science, and ethics. Tutor to Alexander the Great.',
    quoteJa: '「人間は本性上、知ることを欲する」',
    quoteEn: '"All men by nature desire knowledge."',
    tipJa: '複雑な問題は分解せよ。フェルミ推定のように、大きな問いを小さな部分に分けることが理解の鍵だ。',
    tipEn: 'Break down complex problems. Like Fermi estimation, dividing big questions into small parts is the key.',
  },
  {
    level: 6, title: 'デカルト', titleEn: 'Descartes', minXp: 5000,
    descJa: '近代哲学の父（1596-1650）。「方法的懐疑」で確実な知識の基礎を探し求め、「我思う、ゆえに我あり」という不動の命題に辿り着いた。',
    descEn: 'Father of modern philosophy (1596-1650) who sought certain knowledge through systematic doubt.',
    quoteJa: '「我思う、ゆえに我あり」（Cogito, ergo sum）',
    quoteEn: '"I think, therefore I am." (Cogito, ergo sum)',
    tipJa: 'まずすべてを疑え。そして証明できることだけを積み上げていけ。確実性こそが強い論理の基盤だ。',
    tipEn: 'First doubt everything. Then build only on what can be proven. Certainty is the foundation of strong logic.',
  },
  {
    level: 7, title: 'カント', titleEn: 'Kant', minXp: 6000,
    descJa: 'ドイツ観念論の巨人（1724-1804）。『純粋理性批判』で哲学に「コペルニクス的転回」をもたらした。規則正しい生活で有名で、隣人は彼の散歩で時計を合わせたという。',
    descEn: 'Giant of German Idealism (1724-1804). His Critique of Pure Reason brought a "Copernican revolution" to philosophy.',
    quoteJa: '「頭上の星空と、内なる道徳法則。この二つのものは私の心を畏敬の念で満たす」',
    quoteEn: '"Two things fill the mind with wonder: the starry sky above, and the moral law within."',
    tipJa: '普遍的なルールとして通用するかを問え。自分の行動の原則が、誰にでも適用できるかどうか考えよ。',
    tipEn: 'Ask whether a rule could be universal. Consider whether your principle could apply to everyone.',
  },
  {
    level: 8, title: 'ヘーゲル', titleEn: 'Hegel', minXp: 7000,
    descJa: 'ドイツ観念論の集大成者（1770-1831）。「正・反・合」の弁証法で歴史と存在の発展を説明した。マルクスはこの思想を「逆さにした」。',
    descEn: 'Culmination of German Idealism (1770-1831). His dialectic (thesis-antithesis-synthesis) explained the development of history.',
    quoteJa: '「理性的なものは現実的であり、現実的なものは理性的である」',
    quoteEn: '"What is rational is real; and what is real is rational."',
    tipJa: '対立するものを統合せよ。ケース面接では、相反する意見や要素を高い次元で「合」に導くことが力だ。',
    tipEn: 'Synthesize opposites. In case interviews, the power lies in uniting contradictory elements at a higher level.',
  },
  {
    level: 9, title: 'ニーチェ', titleEn: 'Nietzsche', minXp: 8000,
    descJa: '孤高の哲人（1844-1900）。「神は死んだ」と宣言し、超人思想・永劫回帰・権力への意志を説いた。既存の価値観を根底から覆した。',
    descEn: 'Lone philosopher (1844-1900) who declared "God is dead" and introduced the Übermensch and will to power.',
    quoteJa: '「神は死んだ。われわれが殺したのだ」',
    quoteEn: '"God is dead. God remains dead. And we have killed him."',
    tipJa: '常識を疑え。他の人が「そうに決まっている」と言うことこそ、最も深く問い直す価値がある。',
    tipEn: 'Question common sense. What everyone assumes to be true is often what deserves the deepest questioning.',
  },
  {
    level: 10, title: 'ロゴスの神', titleEn: 'God of Logos', minXp: 9000,
    descJa: 'ロゴス（λόγος）とはギリシャ語で「理性・言葉・論理」を意味する。あらゆる哲学者の叡智を統合し、論理そのものと一体になった究極の思索者。',
    descEn: 'Logos (λόγος) means reason, word, and logic in Greek. The ultimate thinker who has unified all philosophical wisdom.',
    quoteJa: '「Λ — 万物を貫く理性」',
    quoteEn: '"Λ — Reason that permeates all things."',
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
  { level:  1, minXp:      0, nextXp:     50, color: '#3B5BDB' },
  { level:  2, minXp:     50, nextXp:    150, color: '#3B5BDB' },
  { level:  3, minXp:    150, nextXp:    300, color: '#3B5BDB' },
  { level:  4, minXp:    300, nextXp:    500, color: '#3B5BDB' },
  { level:  5, minXp:    500, nextXp:    750, color: '#3B5BDB' },
  { level:  6, minXp:    750, nextXp:   1050, color: '#3B5BDB' },
  { level:  7, minXp:   1050, nextXp:   1400, color: '#3B5BDB' },
  { level:  8, minXp:   1400, nextXp:   1800, color: '#3B5BDB' },
  { level:  9, minXp:   1800, nextXp:   2250, color: '#3B5BDB' },
  { level: 10, minXp:   2250, nextXp:   2750, color: '#3B5BDB' },
  { level: 11, minXp:   2750, nextXp:   3300, color: '#3B5BDB' },
  { level: 12, minXp:   3300, nextXp:   3900, color: '#3B5BDB' },
  { level: 13, minXp:   3900, nextXp:   4550, color: '#3B5BDB' },
  { level: 14, minXp:   4550, nextXp:   5250, color: '#3B5BDB' },
  { level: 15, minXp:   5250, nextXp:   6000, color: '#3B5BDB' },
  { level: 16, minXp:   6000, nextXp:   6800, color: '#3B5BDB' },
  { level: 17, minXp:   6800, nextXp:   7650, color: '#3B5BDB' },
  { level: 18, minXp:   7650, nextXp:   8550, color: '#3B5BDB' },
  { level: 19, minXp:   8550, nextXp:   9500, color: '#3B5BDB' },
  { level: 20, minXp:   9500, nextXp:  10500, color: '#3B5BDB' },
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
