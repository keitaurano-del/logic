// Helpers for v3 HomeScreen: streak recovery, points calculation, ranking percentile
import { getStreak, getStudyDates, getCompletedCount, getStudyTimeMs, localDateStr } from '../stats'

/** Returns streak state: 'none' | 'active' | 'at-risk' */
export function getStreakState(): 'none' | 'active' | 'at-risk' {
  const s = getStreak()
  if (s === 0) return 'none'
  const dates = getStudyDates().sort()
  if (dates.length === 0) return 'none'
  const last = dates[dates.length - 1]
  // ローカル日付で比較。toISOString は UTC 基準で JST 朝にズレるため使わない。
  const todayStr = localDateStr()
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
    // ローカル日付で比較。toISOString は UTC 基準で JST 朝にズレるため使わない。
    const iso = localDateStr(d)
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
// LEVEL SYSTEM — Lv1〜500, MAX XP 50,399
// XP閾値: minXp(n) = (n-1) * 101 で Lv500 = 50,399 ちょうど
// Lv1=0 / Lv2=101 / Lv100=9,999 / Lv250=25,149 / Lv500=50,399
//
// 設計方針 (2026-05-24):
//   - 1 レベルあたりの XP 幅は従来通り 101 (線形カーブ維持)
//   - 上限を 100 → 500 に拡張することで、長期エンゲージメント余地を 5 倍に
//   - 「すぐ Lv100 到達」問題は MAX_LEVEL 拡張で自然に解消
//   - 既存ユーザー XP は補正しない (新カーブで lv 表示が下がるユーザーは出ない、
//     旧 Lv100 ピーク到達者は新 Lv100 のまま、上を目指すフェーズに移行する)
//
// 旧仕様(MAX 242550 XP)からのマイグレーションは stats.ts の migrateLegacyXp() を参照
// ============================================================

export type LevelInfo = {
  level: number
  minXp: number
  nextXp: number
  color: string
}

export const MAX_LEVEL = 500
const XP_PER_LEVEL = 101 // (MAX_LEVEL - 1) * 101 = 50,399
export const MAX_XP = (MAX_LEVEL - 1) * XP_PER_LEVEL // 50,399

// 20 レベル刻みで色帯を切り替え。Lv 100 までは旧仕様 (青→紫→緑→金→赤)、
// Lv 101 以降は称号システム (奥義→叡智→巨匠→…→極致) と歩調を合わせるため
// 色を段階的に高貴系 (ゴールド→薄紫→シアン→オレンジ→ロイヤルパープル→プラチナ→ルビー) に寄せる。
// インデックス算出は Math.floor((level - 1) / 20) のため、Lv 1-20→0, Lv 21-40→1, ... Lv 481-500→24。
const LEVEL_COLORS: string[] = [
  'var(--md-sys-color-primary)', // Lv  1- 20  見習い帯  (青)
  '#7B5EA7',                      // Lv 21- 40  ロジック使い (紫)
  '#1A7A5E',                      // Lv 41- 60  思考剣士  (緑)
  '#B8860B',                      // Lv 61- 80  魔導士    (金)
  '#C0392B',                      // Lv 81-100  賢者・覇者 (赤)
  '#D4AF37',                      // Lv 101-120 奥義 (apex 派生) ／ ゴールド
  '#D4AF37',                      // Lv 121-140 奥義 ／ ゴールド継続
  '#C792EA',                      // Lv 141-160 叡智 (wisdom) ／ 薄紫
  '#C792EA',                      // Lv 161-180 叡智 ／ 薄紫継続
  '#5DBCD2',                      // Lv 181-200 巨匠 (virtuoso) ／ シアン
  '#5DBCD2',                      // Lv 201-220 巨匠 ／ シアン継続
  '#F2A65A',                      // Lv 221-240 黎明 (luminary 前段) ／ オレンジ
  '#F2A65A',                      // Lv 241-260 悟達 (enlightened) ／ オレンジ継続
  '#9E5BFF',                      // Lv 261-280 悟達 後段 ／ ロイヤルパープル
  '#9E5BFF',                      // Lv 281-300 黎明 ／ ロイヤルパープル継続
  '#E0E0E0',                      // Lv 301-320 黎明 後段 ／ プラチナ
  '#E0E0E0',                      // Lv 321-340 覇者 (sovereign) ／ プラチナ継続
  '#FF6B6B',                      // Lv 341-360 覇者 ／ ルビーレッド
  '#FF6B6B',                      // Lv 361-380 覇者 後段 ／ ルビー継続
  '#A8E6CF',                      // Lv 381-400 超越 (transcend) ／ 翡翠グリーン
  '#A8E6CF',                      // Lv 401-420 超越 ／ 翡翠継続
  '#F4A8FF',                      // Lv 421-440 神格 (divine) ／ ピンクパープル
  '#F4A8FF',                      // Lv 441-460 神格 ／ ピンクパープル継続
  '#FFD700',                      // Lv 461-480 永遠 (eternal) ／ ピュアゴールド
  '#FFD700',                      // Lv 481-499 永遠 ／ ピュアゴールド継続
]
const LEVEL_MAX_COLOR = '#FFFFFF' // Lv 500 叡智の極致 (zenith) ／ 純白

function colorForLevel(level: number): string {
  if (level >= MAX_LEVEL) return LEVEL_MAX_COLOR
  return LEVEL_COLORS[Math.min(LEVEL_COLORS.length - 1, Math.floor((level - 1) / 20))]
}

export const LEVEL_TABLE: LevelInfo[] = Array.from({ length: MAX_LEVEL }, (_, i) => {
  const level = i + 1
  const minXp = (level - 1) * XP_PER_LEVEL
  const nextXp = level === MAX_LEVEL ? minXp : level * XP_PER_LEVEL
  return { level, minXp, nextXp, color: colorForLevel(level) }
})

export function getCurrentLevel(xp: number): LevelInfo {
  const capped = Math.min(Math.max(0, xp), MAX_XP)
  const level = Math.min(MAX_LEVEL, Math.floor(capped / XP_PER_LEVEL) + 1)
  return LEVEL_TABLE[level - 1]
}

export function getXpProgress(xp: number): { pct: number; current: number; needed: number } {
  const lv = getCurrentLevel(xp)
  if (lv.level === MAX_LEVEL) return { pct: 100, current: 0, needed: 0 }
  const current = Math.min(xp, MAX_XP) - lv.minXp
  const needed = lv.nextXp - lv.minXp
  return { pct: Math.min(100, Math.round((current / needed) * 100)), current, needed }
}

// ============================================================
// 称号システム — 50 段階
// バッジ画像は public/images/v3/badges/badge-<key>.png
// 称号文言は i18n の profile.title.<key> （key の "-" は "_" に置換）
//
// 2026-05-24 拡張:
//   - 旧仕様 16 段階 (Lv 1-100) はそのまま維持し、apex を Lv 100 のみで保持
//   - Lv 101-500 を 34 帯追加 (12 lv 刻みで 33 帯 + 最終帯 Lv 497-500)
//   - 新帯名は「奥義→叡智→巨匠→悟達→黎明→覇者→超越→神格→永遠→極致」と段階的に格上げ
//   - バッジ画像は 16 種しか実物がないため、新帯は既存帯 (apex/sage-3/mage-3 等) を
//     getBadgeImagePath() で循環マッピングして再利用する
// ============================================================
export type TitleKey =
  | 'novice-1' | 'novice-2' | 'novice-3'         // Lv  1-19  銅/ブロンズ帯
  | 'logician-1' | 'logician-2' | 'logician-3'    // Lv 20-39  銀帯
  | 'knight-1' | 'knight-2' | 'knight-3'          // Lv 40-59  磨銀+淡金帯
  | 'mage-1' | 'mage-2' | 'mage-3'                // Lv 60-79  金+翼帯
  | 'sage-1' | 'sage-2' | 'sage-3'                // Lv 80-99  プラチナ+宝石帯
  | 'apex'                                         // Lv 100    頂 (旧 MAX)
  // ── Lv 101-500 拡張帯 (2026-05-24 追加) ──
  | 'apex-2' | 'apex-3' | 'apex-4'                                // Lv 101-136 奥義帯
  | 'wisdom-1' | 'wisdom-2' | 'wisdom-3' | 'wisdom-4'             // Lv 137-184 叡智帯
  | 'virtuoso-1' | 'virtuoso-2' | 'virtuoso-3' | 'virtuoso-4'     // Lv 185-232 巨匠帯
  | 'enlightened-1' | 'enlightened-2' | 'enlightened-3' | 'enlightened-4' // Lv 233-280 悟達帯
  | 'luminary-1' | 'luminary-2' | 'luminary-3' | 'luminary-4'     // Lv 281-328 黎明帯
  | 'sovereign-1' | 'sovereign-2' | 'sovereign-3' | 'sovereign-4' // Lv 329-376 覇者帯
  | 'transcend-1' | 'transcend-2' | 'transcend-3' | 'transcend-4' // Lv 377-424 超越帯
  | 'divine-1' | 'divine-2' | 'divine-3' | 'divine-4'             // Lv 425-472 神格帯
  | 'eternal-1' | 'eternal-2'                                     // Lv 473-496 永遠帯
  | 'zenith'                                                       // Lv 497-500 叡智の極致

export const TITLE_TIERS: ReadonlyArray<{ key: TitleKey; min: number; max: number }> = [
  { key: 'novice-1',     min:   1, max:   6 },
  { key: 'novice-2',     min:   7, max:  13 },
  { key: 'novice-3',     min:  14, max:  19 },
  { key: 'logician-1',   min:  20, max:  26 },
  { key: 'logician-2',   min:  27, max:  33 },
  { key: 'logician-3',   min:  34, max:  39 },
  { key: 'knight-1',     min:  40, max:  46 },
  { key: 'knight-2',     min:  47, max:  53 },
  { key: 'knight-3',     min:  54, max:  59 },
  { key: 'mage-1',       min:  60, max:  66 },
  { key: 'mage-2',       min:  67, max:  73 },
  { key: 'mage-3',       min:  74, max:  79 },
  { key: 'sage-1',       min:  80, max:  86 },
  { key: 'sage-2',       min:  87, max:  93 },
  { key: 'sage-3',       min:  94, max:  99 },
  { key: 'apex',         min: 100, max: 100 },
  // ── Lv 101-500 拡張帯 ──
  { key: 'apex-2',       min: 101, max: 112 },
  { key: 'apex-3',       min: 113, max: 124 },
  { key: 'apex-4',       min: 125, max: 136 },
  { key: 'wisdom-1',     min: 137, max: 148 },
  { key: 'wisdom-2',     min: 149, max: 160 },
  { key: 'wisdom-3',     min: 161, max: 172 },
  { key: 'wisdom-4',     min: 173, max: 184 },
  { key: 'virtuoso-1',   min: 185, max: 196 },
  { key: 'virtuoso-2',   min: 197, max: 208 },
  { key: 'virtuoso-3',   min: 209, max: 220 },
  { key: 'virtuoso-4',   min: 221, max: 232 },
  { key: 'enlightened-1', min: 233, max: 244 },
  { key: 'enlightened-2', min: 245, max: 256 },
  { key: 'enlightened-3', min: 257, max: 268 },
  { key: 'enlightened-4', min: 269, max: 280 },
  { key: 'luminary-1',   min: 281, max: 292 },
  { key: 'luminary-2',   min: 293, max: 304 },
  { key: 'luminary-3',   min: 305, max: 316 },
  { key: 'luminary-4',   min: 317, max: 328 },
  { key: 'sovereign-1',  min: 329, max: 340 },
  { key: 'sovereign-2',  min: 341, max: 352 },
  { key: 'sovereign-3',  min: 353, max: 364 },
  { key: 'sovereign-4',  min: 365, max: 376 },
  { key: 'transcend-1',  min: 377, max: 388 },
  { key: 'transcend-2',  min: 389, max: 400 },
  { key: 'transcend-3',  min: 401, max: 412 },
  { key: 'transcend-4',  min: 413, max: 424 },
  { key: 'divine-1',     min: 425, max: 436 },
  { key: 'divine-2',     min: 437, max: 448 },
  { key: 'divine-3',     min: 449, max: 460 },
  { key: 'divine-4',     min: 461, max: 472 },
  { key: 'eternal-1',    min: 473, max: 484 },
  { key: 'eternal-2',    min: 485, max: 496 },
  { key: 'zenith',       min: 497, max: 500 },
]

export function getTitleKeyForLevel(level: number): TitleKey {
  for (const t of TITLE_TIERS) {
    if (level >= t.min && level <= t.max) return t.key
  }
  return level >= MAX_LEVEL ? 'zenith' : 'novice-1'
}

/**
 * 新規 34 帯にはバッジ画像が無いため、既存 16 枚 (badge-<key>.png) を循環マッピングする。
 * 帯の格 (apex/sage/mage etc) と色味で揃え、デザイナーが将来差し替える前提。
 */
const BADGE_FALLBACK_MAP: Record<string, TitleKey> = {
  // 奥義帯 — apex 派生 (ゴールド)
  'apex-2': 'apex',
  'apex-3': 'apex',
  'apex-4': 'apex',
  // 叡智帯 — sage 系を再利用 (落ち着いた賢者バッジ)
  'wisdom-1': 'sage-1',
  'wisdom-2': 'sage-2',
  'wisdom-3': 'sage-3',
  'wisdom-4': 'sage-3',
  // 巨匠帯 — mage 系 (魔導士バッジ)
  'virtuoso-1': 'mage-1',
  'virtuoso-2': 'mage-2',
  'virtuoso-3': 'mage-3',
  'virtuoso-4': 'mage-3',
  // 悟達帯 — sage を再利用
  'enlightened-1': 'sage-1',
  'enlightened-2': 'sage-2',
  'enlightened-3': 'sage-3',
  'enlightened-4': 'apex',
  // 黎明帯 — knight 系 (騎士バッジ)
  'luminary-1': 'knight-1',
  'luminary-2': 'knight-2',
  'luminary-3': 'knight-3',
  'luminary-4': 'apex',
  // 覇者帯 — sage 巡回
  'sovereign-1': 'sage-1',
  'sovereign-2': 'sage-2',
  'sovereign-3': 'sage-3',
  'sovereign-4': 'apex',
  // 超越帯 — mage 巡回
  'transcend-1': 'mage-1',
  'transcend-2': 'mage-2',
  'transcend-3': 'mage-3',
  'transcend-4': 'apex',
  // 神格帯 — sage 上位巡回
  'divine-1': 'sage-2',
  'divine-2': 'sage-3',
  'divine-3': 'apex',
  'divine-4': 'apex',
  // 永遠帯
  'eternal-1': 'apex',
  'eternal-2': 'apex',
  // 極致
  zenith: 'apex',
}

/** 実バッジ画像が存在する 16 帯のキー集合 (循環マッピング判定用) */
const REAL_BADGE_KEYS = new Set<TitleKey>([
  'novice-1', 'novice-2', 'novice-3',
  'logician-1', 'logician-2', 'logician-3',
  'knight-1', 'knight-2', 'knight-3',
  'mage-1', 'mage-2', 'mage-3',
  'sage-1', 'sage-2', 'sage-3',
  'apex',
])

export function getBadgeImagePath(key: TitleKey): string {
  // 実画像がある 16 帯はそのまま、それ以外は fallback マップで既存帯を再利用
  const resolved: TitleKey = REAL_BADGE_KEYS.has(key)
    ? key
    : (BADGE_FALLBACK_MAP[key] ?? 'apex')
  return `/images/v3/badges/badge-${resolved}.png`
}

/** i18n キー名は kebab → underscore（例: 'novice-1' → 'profile.title.novice_1'） */
export function getTitleI18nKey(key: TitleKey): string {
  return `profile.title.${key.replace(/-/g, '_')}`
}
