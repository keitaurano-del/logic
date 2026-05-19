/**
 * Badge prompt definitions — 16 tier emblems (5 metal-tiers × 3 sub-ranks + Apex).
 *
 * Decoration layers grow gradually within each tier; the metal/color shifts at tier boundaries.
 * Each emblem is generated independently via Gemini Nano Banana, transparent-background PNG, 1:1.
 */

export type BadgeTier = {
  /** key for filename and i18n lookup, kebab-case */
  key: string
  /** title in Japanese */
  titleJa: string
  /** title in English */
  titleEn: string
  /** inclusive lower bound of the level range */
  minLevel: number
  /** inclusive upper bound of the level range */
  maxLevel: number
  /** "metal tier" — 1..6 */
  metal:
    | 'copper-bronze' // tier 1: 1-19
    | 'silver' // tier 2: 20-39
    | 'polished-silver-gold' // tier 3: 40-59
    | 'gold-winged' // tier 4: 60-79
    | 'platinum-gemmed' // tier 5: 80-99
    | 'black-iron-halo' // tier 6: 100
  /** how rich the decoration is within the metal tier (1 = simplest, 3 = most ornate) */
  subRank: 1 | 2 | 3 | null
  /** the central motif inside the shield */
  motifPrompt: string
}

export const BADGE_TIERS: BadgeTier[] = [
  // ===== Copper / Bronze tier — 見習い帯 =====
  {
    key: 'novice-1',
    titleJa: 'ロジック見習い',
    titleEn: 'Logic Novice',
    minLevel: 1, maxLevel: 6, metal: 'copper-bronze', subRank: 1,
    motifPrompt: 'A simple open page with a single line of an inscribed straight rule on it. Nothing else inside the shield. Symbolizing the very first lesson.',
  },
  {
    key: 'novice-2',
    titleJa: '探究者',
    titleEn: 'Seeker',
    minLevel: 7, maxLevel: 13, metal: 'copper-bronze', subRank: 2,
    motifPrompt: 'An engraved lantern — the seeker shining a light into the unknown. Simple bronze etching.',
  },
  {
    key: 'novice-3',
    titleJa: '論理学徒',
    titleEn: 'Logic Student',
    minLevel: 14, maxLevel: 19, metal: 'copper-bronze', subRank: 3,
    motifPrompt: 'An open book paired with a quill behind it. Bronze relief, modest scale. The student earning their first formal mark.',
  },

  // ===== Silver tier — 使い手帯 =====
  {
    key: 'logician-1',
    titleJa: 'ロジック使い',
    titleEn: 'Logician',
    minLevel: 20, maxLevel: 26, metal: 'silver', subRank: 1,
    motifPrompt: 'Three interlocking circles (Venn diagram) engraved in silver. Clean geometric logic-set imagery.',
  },
  {
    key: 'logician-2',
    titleJa: '推論術師',
    titleEn: 'Deduction Adept',
    minLevel: 27, maxLevel: 33, metal: 'silver', subRank: 2,
    motifPrompt: 'A pair of crossed quills behind a small open book, with a small geometric compass-rose above. Silver relief.',
  },
  {
    key: 'logician-3',
    titleJa: '分析の士',
    titleEn: 'Analyst',
    minLevel: 34, maxLevel: 39, metal: 'silver', subRank: 3,
    motifPrompt: 'An elegant pair of dividers (drawing compass) over a partial blueprint grid. Engraved silver. Suggests structured analysis.',
  },

  // ===== Polished silver + gold accent — 剣士〜マスター帯 =====
  {
    key: 'knight-1',
    titleJa: '思考剣士',
    titleEn: 'Thought Knight',
    minLevel: 40, maxLevel: 46, metal: 'polished-silver-gold', subRank: 1,
    motifPrompt: 'A heraldic sword pointing upward, with a small open book at its hilt. Polished silver with subtle gold trim on the sword guard.',
  },
  {
    key: 'knight-2',
    titleJa: 'ロジックマスター',
    titleEn: 'Logic Master',
    minLevel: 47, maxLevel: 53, metal: 'polished-silver-gold', subRank: 2,
    motifPrompt: 'An elegant open book, two crossed quills behind it (X-shape), with faintly etched AND/OR logic-gate symbols on the pages. A small six-pointed star above the shield. Polished silver with deep indigo enamel, gold star.',
  },
  {
    key: 'knight-3',
    titleJa: '構造の達人',
    titleEn: 'Structure Adept',
    minLevel: 54, maxLevel: 59, metal: 'polished-silver-gold', subRank: 3,
    motifPrompt: 'A precise pyramid-shaped logic tree (one node branching into three) engraved at the center. Crossed quills behind. Polished silver with gold filigree on the wreath.',
  },

  // ===== Gold + winged ornaments — 魔導士帯 =====
  {
    key: 'mage-1',
    titleJa: '思考の魔導士',
    titleEn: 'Mind Mage',
    minLevel: 60, maxLevel: 66, metal: 'gold-winged', subRank: 1,
    motifPrompt: 'A crescent moon cradling a small star, with two outstretched feather wings flanking the shield (left and right). Polished gold.',
  },
  {
    key: 'mage-2',
    titleJa: '知慧の幻術師',
    titleEn: 'Sage Illusionist',
    minLevel: 67, maxLevel: 73, metal: 'gold-winged', subRank: 2,
    motifPrompt: 'An eye-of-insight set inside an arcane geometric circle (subtle hexagram), with feathered wings on both sides. Gold with deep indigo enamel iris.',
  },
  {
    key: 'mage-3',
    titleJa: '賢者見習い',
    titleEn: 'Sage Apprentice',
    minLevel: 74, maxLevel: 79, metal: 'gold-winged', subRank: 3,
    motifPrompt: 'An open arcane book emanating light rays, flanked by wings, with a small crown floating above. Rich gold work, deep indigo enamel page interior.',
  },

  // ===== Platinum + gemstones — 賢者・覇者帯 =====
  {
    key: 'sage-1',
    titleJa: '知の賢者',
    titleEn: 'Wise Sage',
    minLevel: 80, maxLevel: 86, metal: 'platinum-gemmed', subRank: 1,
    motifPrompt: 'A central faceted dark-indigo gemstone surrounded by a wreath of small radiating quill marks. Platinum shield, single gem.',
  },
  {
    key: 'sage-2',
    titleJa: '哲理の賢者',
    titleEn: 'Philosopher Sage',
    minLevel: 87, maxLevel: 93, metal: 'platinum-gemmed', subRank: 2,
    motifPrompt: 'A central indigo gemstone, two smaller flanking sapphires, an open book engraved on the lower field. A discreet crown above the shield. Platinum with crystal accents.',
  },
  {
    key: 'sage-3',
    titleJa: '知の覇者',
    titleEn: 'Mind Sovereign',
    minLevel: 94, maxLevel: 99, metal: 'platinum-gemmed', subRank: 3,
    motifPrompt: 'A regal crown set above the shield, a large central indigo gemstone, two smaller side-gems, crossed scepters behind the shield. Full platinum + gem regalia.',
  },

  // ===== Apex — Lv 100 only =====
  {
    key: 'apex',
    titleJa: '思考の頂',
    titleEn: 'Apex Thinker',
    minLevel: 100, maxLevel: 100, metal: 'black-iron-halo', subRank: null,
    motifPrompt: 'A unique black-iron shield with a radiant halo of golden light behind the entire emblem. Center motif: a single mountain peak with a star above it, engraved in dark steel and gold inlay. Crowned by a regal halo. Phoenix-feather flourishes at the base. Visibly different from every other badge — the ultimate rank.',
  },
]

export const METAL_STYLE: Record<BadgeTier['metal'], string> = {
  'copper-bronze': 'Material: warm bronze and copper, with a slightly weathered patina. Shield is heater-shaped but compact. Wreath is minimal — just two small olive branches at the bottom. Modest scale, beginner feel.',
  'silver': 'Material: brushed silver with a hint of pewter. Shield is heater-shaped, slightly larger. Wreath of laurel half-encircles the shield. Clean and clear.',
  'polished-silver-gold': 'Material: highly polished mirror silver with subtle gold trim on the edges. Heater shield with deep indigo enamel face. Full laurel wreath. Premium hand-forged feel.',
  'gold-winged': 'Material: rich polished gold. Heater shield with deep indigo enamel face. Two outstretched feathered wings extend from the sides of the shield. Decorative scrollwork around the wreath.',
  'platinum-gemmed': 'Material: white-platinum metalwork, slightly cool tone. Heater shield with deep indigo enamel face. Faceted gemstones (dark sapphire-indigo) integrated into the composition. Ornate filigree.',
  'black-iron-halo': 'Material: dark gunmetal black iron with gold inlay. A radiant golden halo emanates from behind the entire emblem. The most ornate and unique design in the whole set — visibly different from every other rank.',
}

export const COMMON_STYLE_PREAMBLE = `
Heraldic emblem badge in the style of a premium modern-RPG rank insignia.
Western coat-of-arms design language: oblong heater shield + laurel-wreath border + optional ribbon banner.
Highly detailed metallic engraving — slightly worn surface, like a championship medallion or dignified guild seal.

CRITICAL TECHNICAL RULES:
- Transparent background. No background color, no rectangle behind the emblem — alpha channel cutout, PNG.
- The emblem is the only element on the canvas, centered. Square 1:1 ratio.
- Photoreal metallic shading, soft inner shadows, no flat cartoon coloring.
- NO text, NO letters, NO numerals, NO Roman numerals, NO Arabic numerals, NO words anywhere in the image. The badge is pure visual symbology.
- Any ribbon banner is completely BLANK — no text on it.
- The Logic brand accent color (subtle purple-blue glow, hex roughly #3D5FC4) only appears on highlights and enamel, not as flat fill.
`.trim()

export function buildPromptFor(tier: BadgeTier): string {
  return `${COMMON_STYLE_PREAMBLE}

---

Tier metal & frame style:
${METAL_STYLE[tier.metal]}

Center motif inside the shield:
${tier.motifPrompt}

This badge symbolizes the rank "${tier.titleEn}" — the ${tier.subRank === null ? 'unique ultimate' : `${tier.subRank === 1 ? 'entry' : tier.subRank === 2 ? 'mid' : 'top'} variant of its tier`}. The emblem reads as ${tier.titleEn} without using any words.`
}
