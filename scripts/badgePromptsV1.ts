/**
 * Badge prompt definitions V1 — 34 NEW tier emblems for Lv 101-500 (奥義 → 極致).
 *
 * Generated 2026-05-24 to fill the badge gap created by the Lv 101-500 expansion
 * (commit e9ee131). Stylistically continues the heraldic emblem language from
 * badgePrompts.ts (16 tiers, Lv 1-100) but escalates ornamentation, mystic
 * elements, and color saturation as the tier rises toward zenith.
 *
 * Output filename convention: badge-<key>.png (1024×1024 transparent PNG),
 * placed under public/images/v3/badges/.
 *
 * Generation script: scripts/generate-badge-set-v1.ts
 *   npx tsx scripts/generate-badge-set-v1.ts --only=apex-2   # one
 *   npx tsx scripts/generate-badge-set-v1.ts                  # all 34
 */

export type BadgeTierV1 = {
  /** key for filename and i18n lookup, kebab-case */
  key: string
  /** title in Japanese (for log readability) */
  titleJa: string
  /** title in English (used inside the prompt for symbolic guidance) */
  titleEn: string
  /** inclusive lower bound of the level range */
  minLevel: number
  /** inclusive upper bound of the level range */
  maxLevel: number
  /** broader "band" name — used to pick palette + frame style */
  band:
    | 'apex' // 奥義 — peak / mountain
    | 'wisdom' // 叡智 — ancient book / quill / scroll
    | 'virtuoso' // 巨匠 — master craftsman tools
    | 'enlightened' // 悟達 — lotus / halo
    | 'luminary' // 黎明 — sun / star / lantern
    | 'sovereign' // 覇者 — crown / throne / shield
    | 'transcend' // 超越 — cosmos / galaxy / infinity
    | 'divine' // 神格 — temple / sacred geometry
    | 'eternal' // 永遠 — clock / infinity loop
    | 'zenith' // 極致 — ultimate fusion
  /** position within the band (1=entry, 4=top); null for unique tiers (zenith) */
  subRank: 1 | 2 | 3 | 4 | null
  /** the central motif inside the shield */
  motifPrompt: string
}

export const BADGE_TIERS_V1: BadgeTierV1[] = [
  // ============================================================
  // 奥義帯 (Apex extension) — Lv 101-136 — ゴールド継続
  // 既存 apex (Lv 100) の黒鉄+金光背を引き継ぎ、山岳モチーフを軸に
  // ============================================================
  {
    key: 'apex-2',
    titleJa: '静観の達人',
    titleEn: 'Calm Observer',
    minLevel: 101, maxLevel: 112, band: 'apex', subRank: 2,
    motifPrompt: 'A single tall mountain peak with a calm crescent moon above it, rendered in dark steel and gold inlay. A serene cloud-band wraps the lower slopes. Echoes the Lv100 apex emblem but with quieter, observant energy.',
  },
  {
    key: 'apex-3',
    titleJa: '究理の徒',
    titleEn: 'Reason Devotee',
    minLevel: 113, maxLevel: 124, band: 'apex', subRank: 3,
    motifPrompt: 'Twin mountain peaks flanking a small radiant star at the saddle, dark steel + gold inlay. A subtle geometric compass-rose engraved at the base. The devotee climbing higher to seek pure reason.',
  },
  {
    key: 'apex-4',
    titleJa: '不動の論士',
    titleEn: 'Steadfast Logician',
    minLevel: 125, maxLevel: 136, band: 'apex', subRank: 4,
    motifPrompt: 'A monumental mountain range — three peaks, the central one tallest, crowned by a six-pointed star. Dark steel base with full gold inlay tracing every ridge. Phoenix-feather flourishes at the shield base. Unshakeable, immovable.',
  },

  // ============================================================
  // 叡智帯 (Wisdom) — Lv 137-184 — 薄紫プラチナ
  // 古代書・羽根ペン・スクロール
  // ============================================================
  {
    key: 'wisdom-1',
    titleJa: '思考の練達',
    titleEn: 'Adept Thinker',
    minLevel: 137, maxLevel: 148, band: 'wisdom', subRank: 1,
    motifPrompt: 'An open ancient tome with a single feather quill resting across its pages. Soft violet enamel inside the book. Platinum shield. Simple, scholarly.',
  },
  {
    key: 'wisdom-2',
    titleJa: '知慮の士',
    titleEn: 'Mindful Strategist',
    minLevel: 149, maxLevel: 160, band: 'wisdom', subRank: 2,
    motifPrompt: 'An open tome below a pair of crossed quills (X-shape). Above the book, a small geometric eye-of-thought. Pale-violet enamel pages, platinum frame.',
  },
  {
    key: 'wisdom-3',
    titleJa: '達観の賢者',
    titleEn: 'Clear-Eyed Sage',
    minLevel: 161, maxLevel: 172, band: 'wisdom', subRank: 3,
    motifPrompt: 'A grand open codex with two scrolls unrolling from its sides, a single faceted violet gem floating above. Platinum + violet enamel. Wisdom radiating.',
  },
  {
    key: 'wisdom-4',
    titleJa: '玲瓏の智者',
    titleEn: 'Crystal Mind',
    minLevel: 173, maxLevel: 184, band: 'wisdom', subRank: 4,
    motifPrompt: 'A central faceted violet crystal floating above an open book, flanked by two upright quills. Subtle hexagonal sacred-geometry behind. Platinum filigree, violet enamel.',
  },

  // ============================================================
  // 巨匠帯 (Virtuoso) — Lv 185-232 — シアンプラチナ
  // 工房・道具を極めた職人
  // ============================================================
  {
    key: 'virtuoso-1',
    titleJa: '論考の名手',
    titleEn: 'Master of Reasoning',
    minLevel: 185, maxLevel: 196, band: 'virtuoso', subRank: 1,
    motifPrompt: 'A pair of finely crafted dividers (drawing compass) crossed over a small open book. Cyan-teal enamel face, platinum frame. The artisan of thought.',
  },
  {
    key: 'virtuoso-2',
    titleJa: '思索の巨匠',
    titleEn: 'Grand Thinker',
    minLevel: 197, maxLevel: 208, band: 'virtuoso', subRank: 2,
    motifPrompt: 'A precise blueprint grid in the background with a hammer-and-chisel crossed centrally, plus a small open book at the base. Cyan-teal enamel, polished platinum, gold accent on the chisel.',
  },
  {
    key: 'virtuoso-3',
    titleJa: '智慧の巨匠',
    titleEn: 'Grand Sage',
    minLevel: 209, maxLevel: 220, band: 'virtuoso', subRank: 3,
    motifPrompt: 'A central faceted cyan gem on top of a small geometric pyramid (3-step), flanked by two engraved gears. Cyan enamel, ornate platinum filigree.',
  },
  {
    key: 'virtuoso-4',
    titleJa: '論理の名工',
    titleEn: 'Logic Maestro',
    minLevel: 221, maxLevel: 232, band: 'virtuoso', subRank: 4,
    motifPrompt: 'A regal toolset: crossed hammer and dividers behind a central faceted cyan gemstone, with a discreet laurel-wreath ribbon. Cyan + platinum + light gold trim.',
  },

  // ============================================================
  // 悟達帯 (Enlightened) — Lv 233-280 — オレンジゴールド
  // 蓮花・光輪・覚醒
  // ============================================================
  {
    key: 'enlightened-1',
    titleJa: '目覚めの賢者',
    titleEn: 'Awakened Sage',
    minLevel: 233, maxLevel: 244, band: 'enlightened', subRank: 1,
    motifPrompt: 'A single open lotus flower at center with a soft golden halo behind. Warm amber enamel petals. Gold shield. Awakening, dawn of insight.',
  },
  {
    key: 'enlightened-2',
    titleJa: '透徹の智者',
    titleEn: 'Lucid Mind',
    minLevel: 245, maxLevel: 256, band: 'enlightened', subRank: 2,
    motifPrompt: 'A lotus flower cradling a small radiant orb at its center, halo of light rays behind. Amber + gold. A discreet eye-of-clarity etched inside the orb.',
  },
  {
    key: 'enlightened-3',
    titleJa: '静謐の悟人',
    titleEn: 'Tranquil Seer',
    minLevel: 257, maxLevel: 268, band: 'enlightened', subRank: 3,
    motifPrompt: 'A lotus flower below a meditating crescent (calm crescent moon-shape), full radiant halo of fine golden rays. Two small lotus buds flank the shield. Warm amber + polished gold.',
  },
  {
    key: 'enlightened-4',
    titleJa: '識見の達人',
    titleEn: 'Insight Master',
    minLevel: 269, maxLevel: 280, band: 'enlightened', subRank: 4,
    motifPrompt: 'A grand lotus throne motif with a faceted amber gem at its heart, encircled by a radiant golden halo and twelve fine light rays. Lotus petals fan outward. Amber enamel, rich gold.',
  },

  // ============================================================
  // 黎明帯 (Luminary) — Lv 281-328 — ロイヤルパープル
  // 朝日・星・灯火
  // ============================================================
  {
    key: 'luminary-1',
    titleJa: '智慧の燈',
    titleEn: 'Light of Wisdom',
    minLevel: 281, maxLevel: 292, band: 'luminary', subRank: 1,
    motifPrompt: 'A simple hanging lantern with a glowing flame inside. Royal-purple enamel face, silver-platinum frame, gold flame. A single small star above the lantern.',
  },
  {
    key: 'luminary-2',
    titleJa: '啓蒙の士',
    titleEn: 'Enlightener',
    minLevel: 293, maxLevel: 304, band: 'luminary', subRank: 2,
    motifPrompt: 'A torch held upright at center with a vivid golden flame, two small stars flanking the shield. Royal-purple enamel, platinum frame, gold flame and stars.',
  },
  {
    key: 'luminary-3',
    titleJa: '黎明の賢者',
    titleEn: 'Dawnbringer Sage',
    minLevel: 305, maxLevel: 316, band: 'luminary', subRank: 3,
    motifPrompt: 'A rising sun cresting a horizon line at center, with six radiant rays fanning upward. A small five-pointed star above. Royal-purple sky enamel, gold sun, platinum frame.',
  },
  {
    key: 'luminary-4',
    titleJa: '知の灯火',
    titleEn: 'Lantern of Thought',
    minLevel: 317, maxLevel: 328, band: 'luminary', subRank: 4,
    motifPrompt: 'A grand lantern at center emitting concentric rings of golden light, with a constellation of seven stars arranged in a small arc above. Royal-purple enamel, ornate platinum filigree, brilliant gold flame.',
  },

  // ============================================================
  // 覇者帯 (Sovereign) — Lv 329-376 — プラチナ
  // 王冠・玉座・盾
  // ============================================================
  {
    key: 'sovereign-1',
    titleJa: '思索の覇王',
    titleEn: 'Sovereign Thinker',
    minLevel: 329, maxLevel: 340, band: 'sovereign', subRank: 1,
    motifPrompt: 'A regal crown set above the center, with a single open book below it. Cool platinum, deep indigo enamel, small ruby red accent on the crown.',
  },
  {
    key: 'sovereign-2',
    titleJa: '論理の宗師',
    titleEn: 'Patriarch of Logic',
    minLevel: 341, maxLevel: 352, band: 'sovereign', subRank: 2,
    motifPrompt: 'A crown above a central faceted indigo gem, with two crossed scepters behind. Polished platinum, indigo enamel, ruby and sapphire flecks.',
  },
  {
    key: 'sovereign-3',
    titleJa: '知の盟主',
    titleEn: 'Lord of Knowledge',
    minLevel: 353, maxLevel: 364, band: 'sovereign', subRank: 3,
    motifPrompt: 'A throne silhouette at center (simple geometric throne) with a crown floating above it and an open book engraved on the throne base. Platinum with indigo enamel and gold edge trim.',
  },
  {
    key: 'sovereign-4',
    titleJa: '智慧の王者',
    titleEn: 'Wisdom Monarch',
    minLevel: 365, maxLevel: 376, band: 'sovereign', subRank: 4,
    motifPrompt: 'A grand crown set above the shield, a central faceted indigo gemstone, two smaller side gems, crossed scepters behind, full laurel wreath. Ornate platinum + gem regalia, royal feel.',
  },

  // ============================================================
  // 超越帯 (Transcend) — Lv 377-424 — 翡翠グリーン
  // 宇宙・銀河・無限
  // ============================================================
  {
    key: 'transcend-1',
    titleJa: '超然の論士',
    titleEn: 'Transcendent Logician',
    minLevel: 377, maxLevel: 388, band: 'transcend', subRank: 1,
    motifPrompt: 'A simple planet orbited by a thin elliptical ring, with one small star above. Jade-green enamel sky, platinum frame with gold orbit ring.',
  },
  {
    key: 'transcend-2',
    titleJa: '達人の境地',
    titleEn: 'Realm of Mastery',
    minLevel: 389, maxLevel: 400, band: 'transcend', subRank: 2,
    motifPrompt: 'A planet with two orbital rings forming a crossed pattern, plus three small stars scattered above. Jade enamel, polished platinum, gold rings.',
  },
  {
    key: 'transcend-3',
    titleJa: '無我の智者',
    titleEn: 'Selfless Mind',
    minLevel: 401, maxLevel: 412, band: 'transcend', subRank: 3,
    motifPrompt: 'A spiral galaxy at center (clean two-arm spiral), a single bright star at its core, three small stars around the spiral. Jade enamel sky, gold galaxy arms, platinum frame.',
  },
  {
    key: 'transcend-4',
    titleJa: '円通の賢者',
    titleEn: 'Boundless Sage',
    minLevel: 413, maxLevel: 424, band: 'transcend', subRank: 4,
    motifPrompt: 'A large infinity loop encircling a small radiant central star, with a galaxy spiral motif faintly behind. Jade-green enamel, ornate platinum filigree, gold infinity loop.',
  },

  // ============================================================
  // 神格帯 (Divine) — Lv 425-472 — ピンクパープル
  // 神殿・神器・三角錐
  // ============================================================
  {
    key: 'divine-1',
    titleJa: '神算の士',
    titleEn: 'Divine Strategist',
    minLevel: 425, maxLevel: 436, band: 'divine', subRank: 1,
    motifPrompt: 'A small geometric temple silhouette (pediment with two columns) at center, a small radiant star above its roof. Pink-violet enamel sky, polished gold columns, platinum frame.',
  },
  {
    key: 'divine-2',
    titleJa: '神慮の賢者',
    titleEn: 'Divine Insight',
    minLevel: 437, maxLevel: 448, band: 'divine', subRank: 2,
    motifPrompt: 'A sacred eye of insight inside a triangular pediment, with two columns flanking. A small radiant halo behind the eye. Pink-violet enamel, gold eye + halo, platinum frame.',
  },
  {
    key: 'divine-3',
    titleJa: '智慧の権化',
    titleEn: 'Embodiment of Wisdom',
    minLevel: 449, maxLevel: 460, band: 'divine', subRank: 3,
    motifPrompt: 'A geometric tetrahedron (three visible faces) at center with a sacred eye on its front face, encircled by a thin halo. Pink-violet enamel, ornate gold detailing, platinum filigree.',
  },
  {
    key: 'divine-4',
    titleJa: '思索の神格',
    titleEn: 'Divine Thinker',
    minLevel: 461, maxLevel: 472, band: 'divine', subRank: 4,
    motifPrompt: 'A grand temple facade with a central sacred eye in a triangular pediment, two columns on each side, a radiant halo of fine rays behind the whole structure. Pink-violet enamel, lavish gold, ornate platinum.',
  },

  // ============================================================
  // 永遠帯 (Eternal) — Lv 473-496 — ピュアゴールド
  // 時計・無限ループ
  // ============================================================
  {
    key: 'eternal-1',
    titleJa: '不滅の論士',
    titleEn: 'Eternal Logician',
    minLevel: 473, maxLevel: 484, band: 'eternal', subRank: 1,
    motifPrompt: 'A vintage round pocket-watch face at center (no numbers, just simple ornate tick marks and two hands pointing up forming a V), encircled by a thin gold ring. Pure gold metalwork, ivory enamel watch face, subtle indigo accent.',
  },
  {
    key: 'eternal-2',
    titleJa: '永遠の賢者',
    titleEn: 'Eternal Sage',
    minLevel: 485, maxLevel: 496, band: 'eternal', subRank: 2,
    motifPrompt: 'A horizontal infinity loop at center, a small radiant star above, ornate clockwork gears faintly etched behind the loop. Pure polished gold, soft cream enamel, deep indigo accent inside the loop.',
  },

  // ============================================================
  // 極致 (Zenith) — Lv 497-500 — 純白 — UNIQUE ULTIMATE
  // 全要素融合の最高峰
  // ============================================================
  {
    key: 'zenith',
    titleJa: '叡智の極致',
    titleEn: 'Pinnacle of Wisdom',
    minLevel: 497, maxLevel: 500, band: 'zenith', subRank: null,
    motifPrompt: 'A unique fusion emblem: a central radiant sun above a mountain peak, an open book at the mountain base, a small lotus flower below, a crown floating above the sun, and an infinity loop encircling the entire composition. A subtle halo of fine white light radiates from behind the whole emblem. Pure white-platinum metalwork with gold and faint iridescent accents. The most ornate, most unique design in the entire 50-tier set — visibly different from every other rank.',
  },
]

export const BAND_FRAME_STYLE: Record<BadgeTierV1['band'], string> = {
  apex: 'Material: dark gunmetal black iron base with rich gold inlay tracing the heater shield outline. A subtle radiant golden halo emanates from behind the emblem. Full laurel-wreath border in gold. Echoes the Lv 100 apex emblem.',
  wisdom: 'Material: cool white platinum with soft violet enamel face. Heater shield slightly taller. Laurel wreath in platinum with tiny violet accents. Scholarly, refined.',
  virtuoso: 'Material: polished platinum with cyan-teal enamel face. Heater shield with engineered edge detailing. Laurel wreath with subtle gear etching woven in. Master-craftsman feel.',
  enlightened: 'Material: warm polished gold with amber enamel face. Heater shield surrounded by a soft golden halo of fine light rays. Laurel wreath with lotus-petal flourishes. Spiritual awakening tone.',
  luminary: 'Material: polished platinum with deep royal-purple enamel face. Heater shield encircled by a thin gold ring suggesting illumination. Laurel wreath with small star accents. Dawn / illumination tone.',
  sovereign: 'Material: ornate platinum with deep indigo enamel face. Heater shield with a tall crown ornament integrated above. Full laurel wreath with ribbon banner. Regal, monarchical.',
  transcend: 'Material: cool platinum with jade-green enamel sky face. Heater shield encircled by a thin gold orbit ring. Laurel wreath with tiny star scatter. Cosmic, transcendent tone.',
  divine: 'Material: ornate platinum with pink-violet enamel face. Heater shield framed by two slim engraved columns at its sides and a triangular pediment ornament above. Sacred-temple feel.',
  eternal: 'Material: pure rich polished gold with cream enamel face. Heater shield encircled by a thin ornate gold ring suggesting timelessness. Laurel wreath in deep gold. Timeless, classical.',
  zenith: 'Material: pure white-platinum with iridescent mother-of-pearl shimmer accents and rich gold inlay. A radiant aureole of fine white light surrounds the entire emblem. Full ornate laurel wreath in white-platinum with gold tips. The most ornate, most unique frame in the entire badge set.',
}

export const COMMON_STYLE_PREAMBLE_V1 = `
Heraldic emblem badge in the style of a premium modern-RPG rank insignia.
Western coat-of-arms design language: oblong heater shield + laurel-wreath border + optional ribbon banner.
Highly detailed metallic engraving — slightly worn surface, like a championship medallion or dignified guild seal.

CRITICAL TECHNICAL RULES:
- Transparent background. No background color, no rectangle behind the emblem — alpha channel cutout, PNG.
- The emblem is the only element on the canvas, centered. Square 1:1 ratio.
- Photoreal metallic shading, soft inner shadows, no flat cartoon coloring.
- NO text, NO letters, NO numerals, NO Roman numerals, NO Arabic numerals, NO words anywhere in the image. The badge is pure visual symbology.
- Any ribbon banner is completely BLANK — no text on it.
- The Logic brand accent color (subtle purple-blue glow, hex roughly #3D5FC4) may appear as a faint enamel highlight on lower tiers; upper tiers shift to band-specific palettes.
- This is part of a 50-tier RPG rank badge collection. The emblem should feel cohesive with classic heraldic medallions but escalate in ornamentation, mystic elements, and color saturation as the tier rises.
`.trim()

export function buildPromptForV1(tier: BadgeTierV1): string {
  const rankNote =
    tier.subRank === null
      ? 'the unique ultimate rank — the apex of the entire 50-tier collection'
      : `the ${tier.subRank === 1 ? 'entry' : tier.subRank === 2 ? 'mid-lower' : tier.subRank === 3 ? 'mid-upper' : 'top'} variant of the ${tier.band} band`
  return `${COMMON_STYLE_PREAMBLE_V1}

---

Band frame style (${tier.band}):
${BAND_FRAME_STYLE[tier.band]}

Center motif inside the shield:
${tier.motifPrompt}

This badge symbolizes ${rankNote}. The emblem reads as a high-rank ${tier.band} insignia without using any words. Photoreal heraldic medallion, transparent PNG, 1:1.`
}
