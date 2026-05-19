/**
 * Character portrait prompts (Gemini Nano Banana 生成用).
 *
 * 哲学者 3 体 × 表情 3 種 = 9 枚。立ち絵としてロールプレイ画面の上半分に表示。
 * 既存レッスンサムネと世界観を揃える（クリーム notebook 紙、Caveat 風の手書きトーン）。
 *
 * 使い方:
 *   npx tsx scripts/generate-character-portraits.ts
 *   npx tsx scripts/generate-character-portraits.ts --only=socrates_neutral,nietzsche_smile
 *
 * 出力: public/characters/{slug}.png
 */

export const PORTRAIT_STYLE = `
Hand-drawn ink portrait on warm cream notebook paper (1:1 square).
The portrait shows a head-and-shoulders view, centered, taking up about 70% of the frame.

LINE WORK — clean confident black marker pen lines with slight natural ink variation. Cross-hatching for shading. NO photorealism, NO 3D rendering, NO digital painting polish.

PAPER — warm beige cream paper with very subtle texture, optional faint horizontal ruled lines in light coral pink at the very top and bottom only (not crossing the portrait). NO decorative borders, NO sparkles, NO floating doodles.

COLOR — primarily black line drawing with very light watercolor wash accents (sage green, mustard yellow, dusty blue, or muted coral) used only for clothing shadows and background tinting. NEVER fill the face with bright color. The character's skin remains paper-tone.

NAMEPLATE — a single short name in chunky relaxed marker handwriting (Caveat-like) placed at the lower edge, with one flowing coral red underline beneath. The underline is a single quick brush stroke with natural taper, never ruler-straight.

CRITICAL TEXT RULES:
- Do NOT write any hex color codes, RGB values, color names, instruction labels, or technical text anywhere in the image
- The ONLY visible text must be the philosopher's name at the bottom
- Spelling must be perfectly correct — re-check every letter
- The name uses Title Case (e.g. "Socrates", not "SOCRATES" all caps)

NO: photo realism, 3D, isometric perspective, cinematic lighting, dark moody backgrounds, gradients filling whole image, glow effects, computer-graphics polish, multiple figures, hand gestures dominating the frame, decorative borders, ornamental marks.
`.trim()

export type CharacterPortraitEntry = {
  /** Output filename without extension, e.g. "socrates_neutral" */
  slug: string
  /** The character */
  characterId: 'socrates' | 'descartes' | 'nietzsche'
  /** Expression */
  expression: 'neutral' | 'smile' | 'troubled'
  /** Subject description (head, hair, beard, clothing, era cues) */
  subject: string
  /** Expression detail (eyes, mouth, brow) */
  expressionDetail: string
  /** Nameplate text shown at the bottom */
  nameplate: string
  /** Critical words whose spelling MUST be preserved */
  spell: string[]
}

const SOCRATES_SUBJECT = 'An elderly philosopher with a full curly white beard, a bald shiny round head, a wide flat nose, and a draped ancient Greek tunic (chiton) over one shoulder. Ancient Greek style, 5th century BC.'
const DESCARTES_SUBJECT = 'A 17th-century French gentleman with shoulder-length wavy dark hair, a thin mustache, a small goatee, a long straight nose, and a wide white lace collar over a dark doublet. Calm and analytical bearing.'
const NIETZSCHE_SUBJECT = 'A 19th-century European philosopher with an enormous bushy walrus mustache covering the upper lip and drooping past the mouth, intense piercing eyes under heavy brows, dark hair combed back, and a high-collared dark Victorian-era coat. Imposing and intense.'

const EXPR_NEUTRAL = 'Calm composed expression. Steady level gaze. Mouth closed in a relaxed neutral line. Eyebrows level.'
const EXPR_SMILE = 'Warm slightly amused expression. Subtle upturn at the corners of the mouth, faint crinkle near the eyes. Eyebrows slightly raised in friendly curiosity. Not a wide grin — a knowing gentle smile.'
const EXPR_TROUBLED = 'Concerned thoughtful expression. Slight furrow between the eyebrows. Mouth pressed into a flat line or very slightly downturned. Eyes narrowed in critical consideration.'

export const CHARACTER_PORTRAITS: CharacterPortraitEntry[] = [
  // Socrates
  { slug: 'socrates_neutral', characterId: 'socrates', expression: 'neutral', subject: SOCRATES_SUBJECT, expressionDetail: EXPR_NEUTRAL, nameplate: 'Socrates', spell: ['Socrates'] },
  { slug: 'socrates_smile', characterId: 'socrates', expression: 'smile', subject: SOCRATES_SUBJECT, expressionDetail: EXPR_SMILE, nameplate: 'Socrates', spell: ['Socrates'] },
  { slug: 'socrates_troubled', characterId: 'socrates', expression: 'troubled', subject: SOCRATES_SUBJECT, expressionDetail: EXPR_TROUBLED, nameplate: 'Socrates', spell: ['Socrates'] },
  // Descartes
  { slug: 'descartes_neutral', characterId: 'descartes', expression: 'neutral', subject: DESCARTES_SUBJECT, expressionDetail: EXPR_NEUTRAL, nameplate: 'Descartes', spell: ['Descartes'] },
  { slug: 'descartes_smile', characterId: 'descartes', expression: 'smile', subject: DESCARTES_SUBJECT, expressionDetail: EXPR_SMILE, nameplate: 'Descartes', spell: ['Descartes'] },
  { slug: 'descartes_troubled', characterId: 'descartes', expression: 'troubled', subject: DESCARTES_SUBJECT, expressionDetail: EXPR_TROUBLED, nameplate: 'Descartes', spell: ['Descartes'] },
  // Nietzsche
  { slug: 'nietzsche_neutral', characterId: 'nietzsche', expression: 'neutral', subject: NIETZSCHE_SUBJECT, expressionDetail: EXPR_NEUTRAL, nameplate: 'Nietzsche', spell: ['Nietzsche'] },
  { slug: 'nietzsche_smile', characterId: 'nietzsche', expression: 'smile', subject: NIETZSCHE_SUBJECT, expressionDetail: EXPR_SMILE, nameplate: 'Nietzsche', spell: ['Nietzsche'] },
  { slug: 'nietzsche_troubled', characterId: 'nietzsche', expression: 'troubled', subject: NIETZSCHE_SUBJECT, expressionDetail: EXPR_TROUBLED, nameplate: 'Nietzsche', spell: ['Nietzsche'] },
]

export function buildPortraitPrompt(entry: CharacterPortraitEntry): string {
  return `${PORTRAIT_STYLE}

SUBJECT:
${entry.subject}

EXPRESSION:
${entry.expressionDetail}

NAMEPLATE (the only visible text in the image):
"${entry.nameplate}" — in chunky relaxed marker handwriting (Caveat-like), with one flowing coral red underline beneath it as a single brush stroke.

CRITICAL SPELLING ENFORCEMENT — these strings MUST appear exactly as written, letter-by-letter, no substitutions, no extra letters, no missing letters:
${entry.spell.map((s) => `  - "${s}"`).join('\n')}

If you cannot render the nameplate text correctly, omit the nameplate entirely rather than misspelling it. NO other words may appear in the image.`
}
