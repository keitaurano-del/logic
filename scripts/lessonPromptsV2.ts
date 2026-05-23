/**
 * Lesson thumbnail prompts (v2 — hand-drawn notebook style).
 *
 * Approved sample (lesson 20 MECE) generated 2026-05-19 with
 * gemini-2.5-flash-image. Keita signed off on this style/composition.
 *
 * Used by scripts/generate-lesson-thumbnails-v2.ts.
 */

export const STYLE = `
Hand-drawn 2D illustration on cream-colored ruled notebook paper.
Background: warm beige cream paper, with thin light coral pink horizontal ruled lines spaced evenly across, three small round binder holes on the left margin, very subtle paper texture.

Aesthetic: a thoughtful student's clean study notebook page. Drawn entirely with a black marker pen — clean confident line work with slight natural ink variation. Body annotations in casual cursive handwriting.

TITLE STYLE — most important rule:
The main title at top-left must be hand-lettered in a chunky relaxed marker handwriting like the Google font "Caveat" — friendly, semi-bold, slightly playful, with naturally flowing strokes. Use Title Case (mixed upper and lower case letters, e.g. "Logic Tree" or "Ramp Up Fast"), NOT all uppercase block letters. The letters lean slightly to the right with a casual rhythm, the strokes have slight thickness variation as a marker would produce, and consecutive letters may touch or nearly touch without being a full cursive joined script. It should feel like a quick, confident hand-lettering — not a typed font, not block capital letters, not formal calligraphy.

UNDERLINE STYLE — second most important rule:
Below the title, draw a single hand-drawn coral red underline as one flowing marker swipe. It must look like a quick brush gesture: slightly tapered at one or both ends, with natural ink variation in thickness along the length, never a perfectly straight ruler-drawn line. The underline can curve very subtly or swoosh upward at the tail. It is one continuous stroke, not multiple lines.

Color palette (use as accents only, not as labels):
- Warm cream beige paper base
- Coral red (for underlines and small accent marks)
- Sage green, navy blue, mustard yellow (use sparingly for small accent fills)
Primarily black-line drawing with light color accents. Do not fill large areas with bright color.

CRITICAL — do NOT write any hex color codes, RGB values, color names, or any other technical reference text inside the image. The image must contain only the title, the diagram labels, and the handwritten annotations described — nothing else.

Composition: square (1:1). Central diagram occupies about 60-70% of the canvas. Title at top-left. Optional short handwritten note at bottom.

NO decorative elements: NO stars, NO sparkles, NO scattered ink dots, NO floating doodles, NO ornamental marks of any kind. The page should look clean and purposeful — every element must serve the diagram.

Do NOT include: photorealism, 3D rendering, isometric perspective, dark backgrounds, gradients, cinematic lighting, busy textures, glow effects, computer-graphics polish, decorative borders.

Text rules: every visible text — including the title — must be hand-lettered with a marker, drawn letter-by-letter. No printed/typeset/computer fonts whatsoever. Spelling must be perfectly correct (re-check every word). Maximum 3-4 short handwritten annotations near the diagram (max 5 English words each). All titles use Title Case (e.g. "Logic Tree", "Ramp Up Fast"), not ALL CAPS.
`.trim()

export type LessonPromptEntry = {
  /** Output filename without extension, e.g. "lesson-20" */
  slug: string
  /** Hand-lettered title at top-left, all caps Latin/English */
  title: string
  /** Subtitle just below the title, regular case English */
  subtitle: string
  /** Diagram description (the core of the page) */
  diagram: string
  /**
   * Critical English words/phrases whose exact spelling and order
   * MUST be preserved in the generated image. Gemini tends to corrupt
   * long English words when hand-lettering, so we explicitly list
   * every word that appears as visible text.
   */
  spell?: string[]
}

/**
 * Acronyms that must stay in ALL CAPS even when the surrounding title is
 * rendered as Title Case. Add to this set whenever a new acronym appears.
 */
const ACRONYM_WHITELIST = new Set([
  'MECE', 'STAR', 'ATS', 'SPI', 'GAB', 'WFH', 'PTO', 'IMAGES', 'M&A',
  'EN', 'PRE-EMPT', 'JP', 'NOT', 'AND', 'OR', 'WHY', 'SO', 'AI', 'GDP',
  'ADHD',
  'A', 'B', 'C', 'D', 'P', 'Q', 'R', 'S', 'T',
])

/**
 * Convert an ALL CAPS title (e.g. "LOGIC TREE") into Title Case
 * (e.g. "Logic Tree"), while preserving acronyms (MECE, STAR, etc.)
 * and mixed-case titles. Used to coax Gemini into Caveat-style
 * Title Case rendering without rewriting every entry.
 */
export function titleCase(s: string): string {
  return s
    .split(/(\s+|\/|≠|=)/)
    .map((token) => {
      const trimmed = token.trim()
      if (!trimmed) return token
      if (/^[\s/≠=]+$/.test(token)) return token
      if (ACRONYM_WHITELIST.has(trimmed)) return token
      if (/[a-z]/.test(trimmed)) return token
      if (/^[A-Z]+(-[A-Z]+)*$/.test(trimmed)) {
        return trimmed
          .split('-')
          .map((part) =>
            ACRONYM_WHITELIST.has(part)
              ? part
              : part.charAt(0) + part.slice(1).toLowerCase(),
          )
          .join('-')
      }
      return token
    })
    .join('')
}

export function buildPrompt(entry: LessonPromptEntry): string {
  const displayTitle = titleCase(entry.title)
  const spellSection = entry.spell?.length
    ? `

CRITICAL SPELLING ENFORCEMENT — every one of the following words MUST appear in the image with its letters in exactly this order, no missing letters, no extra letters, no swapped letters:
${entry.spell.map((w) => `  • "${w}"`).join('\n')}
If you cannot draw a word with perfect spelling, leave it out rather than misspell it.
`
    : ''

  return `${STYLE}

---

Topic: ${displayTitle} — a hand-drawn notebook thumbnail.

Top-left of the page: hand-lettered title "${displayTitle}" rendered in Caveat-style chunky marker handwriting (Title Case with mixed upper and lower case letters — e.g. "Logic Tree" or "Ramp Up Fast" — NOT all uppercase block letters). The strokes are semi-bold marker with slight playful rightward slant. Below the title: a single flowing hand-drawn coral red underline marker swipe with slightly tapered ends and natural ink variation (NOT a perfectly straight ruler line).

Below the title in smaller hand-lettered cursive: "${entry.subtitle}" (spelling must be perfect).

Center of the page: ${entry.diagram}

That is the entire content. The page contains only: the title, its coral underline, the subtitle, and the diagram described above with its labels and 2-3 short annotations. Nothing else. No icons, no stars, no extra doodles, no decorative dots, no borders.${spellSection}
`.trim()
}

export const LESSON_PROMPTS: LessonPromptEntry[] = [
  // ── ロジカルシンキング ──────────────────────────────────────────
  {
    slug: 'lesson-20',
    title: 'MECE',
    subtitle: 'No overlaps, no gaps',
    diagram: `a hand-drawn 2x2 grid (about 55% of canvas width) with four labeled cells — top-left "A", top-right "B", bottom-left "C", bottom-right "D" — drawn with thick black marker borders, each cell label a single large hand-lettered marker letter centered in its cell. Above the grid: a short down-arrow with handwritten annotation "no overlaps" (cursive). Below the grid: a short up-arrow with handwritten annotation "no gaps" (cursive).`,
    spell: ['MECE', 'No overlaps, no gaps', 'A', 'B', 'C', 'D', 'no overlaps', 'no gaps'],
  },
  {
    slug: 'lesson-21',
    title: 'Logic Tree',
    subtitle: 'Break it down into pieces',
    diagram: `a hand-drawn tree diagram with a single rectangular root box at the top labeled "Issue", branching down with thick black lines to three middle boxes labeled "Why A", "Why B", "Why C", then each branching further down to two small leaf boxes labeled "a1 / a2", "b1 / b2", "c1 / c2". To the right of the root: handwritten annotation "break it down" (cursive). All boxes hand-drawn with thick marker borders.`,
  },
  {
    slug: 'lesson-22',
    title: 'SO WHAT / WHY SO',
    subtitle: 'Connect facts and conclusions',
    diagram: `two horizontal layered shelves of three small rectangles each, stacked vertically. The top shelf is labeled "Conclusion" (single rectangle, wider). The bottom shelf is labeled "Facts" (three smaller rectangles side by side). Between the two shelves: two vertical arrows side by side — left arrow pointing up labeled "So What?", right arrow pointing down labeled "Why So?". All hand-drawn with marker, labels in cursive handwriting.`,
  },
  {
    slug: 'lesson-23',
    title: 'PYRAMID',
    subtitle: 'Top first, then reasons',
    diagram: `a hand-drawn three-tier pyramid built from rectangular boxes: a single wide box at the top labeled "Main", three medium boxes in the middle row labeled "Reason 1", "Reason 2", "Reason 3", and five small boxes at the bottom labeled "Fact". Thick marker borders, light cream interior. A coral down-arrow runs along the right side from Main to the Facts row labeled "from top".`,
    spell: ['PYRAMID', 'Top first, then reasons', 'Main', 'Reason 1', 'Reason 2', 'Reason 3', 'Fact', 'from top'],
  },
  {
    slug: 'lesson-24',
    title: 'CASE STUDY',
    subtitle: 'Learn from concrete examples',
    diagram: `three rectangular cards laid out left-to-right, connected by short right-pointing arrows: first card labeled "Problem", second card labeled "Analysis", third card labeled "Solution". Below the cards a single handwritten cursive annotation "case → insight". Hand-drawn with thick black marker.`,
  },
  {
    slug: 'lesson-25',
    title: 'DEDUCTION',
    subtitle: 'From general principle to specific conclusion',
    diagram: `three stacked rectangular boxes connected by short downward arrows: top box labeled "All A are B", middle box labeled "X is A", bottom box labeled "X is B". To the right: handwritten cursive annotation "syllogism". Thick marker borders.`,
  },
  {
    slug: 'lesson-26',
    title: 'INDUCTION',
    subtitle: 'From specific cases to general pattern',
    diagram: `four small rectangular boxes at the bottom of the diagram in a row, each labeled "case 1", "case 2", "case 3", "case 4", with upward-converging arrows pointing to a single larger box at the top labeled "Pattern". Hand-drawn with thick marker. Cursive annotation to the side: "find the pattern".`,
  },
  {
    slug: 'lesson-27',
    title: 'FORMAL LOGIC',
    subtitle: 'If P then Q',
    diagram: `a hand-drawn implication chain on cream notebook paper: two stacked rectangular boxes connected vertically by a coral downward arrow. The top box is labeled "P" (a single large hand-lettered marker letter centered in the box). The bottom box is labeled "Q" (a single large hand-lettered marker letter centered in the box). The coral arrow between them is labeled with the cursive annotation "implies" alongside it. To the right of the boxes: the cursive note "P → Q". Below the chain: the cursive annotation "if P, then Q".`,
    spell: ['FORMAL LOGIC', 'If P then Q', 'P', 'Q', 'implies', 'P → Q', 'if P, then Q'],
  },
  {
    slug: 'lesson-68',
    title: 'CONCRETE & ABSTRACT',
    subtitle: 'Move up and down the ladder',
    diagram: `a vertical ladder drawn with thick black marker, with three rungs. Top rung labeled "Abstract" (cursive), bottom rung labeled "Concrete" (cursive), middle rung unlabeled. A double-headed vertical arrow runs alongside the ladder showing motion both up and down. To the side: cursive annotation "zoom in / zoom out".`,
  },

  // ── ケース面接 ────────────────────────────────────────────────
  {
    slug: 'lesson-28',
    title: 'CASE INTERVIEW',
    subtitle: 'Structure your thinking on the spot',
    diagram: `a hand-drawn equation "Profit = Revenue − Cost" written in marker at the top, with a tree branching downward from each term: "Revenue" splits into "Price × Volume", "Cost" splits into "Fixed + Variable". All boxes hand-drawn with thick marker borders.`,
  },
  {
    slug: 'lesson-29',
    title: 'PROFITABILITY',
    subtitle: 'Decompose profit into drivers',
    diagram: `a hand-drawn profit decomposition tree: "Profit" at the top, splitting downward into "Revenue" and "Cost". "Revenue" further splits into "Price" and "Quantity". "Cost" further splits into "Fixed" and "Variable". Thick marker rectangle boxes connected by short line segments.`,
  },
  {
    slug: 'lesson-35',
    title: 'NEW MARKET ENTRY',
    subtitle: 'Decide where and how to enter',
    diagram: `a hand-drawn left-to-right arrow stretching across the page, starting from a small island labeled "Current" on the left, ending at a large continent labeled "New Market" on the right. Along the arrow path: three checkpoint circles labeled "Why", "Where", "How". Hand-drawn with thick marker.`,
  },
  {
    slug: 'lesson-36',
    title: 'M & A',
    subtitle: 'Mergers and acquisitions basics',
    diagram: `two hand-drawn rectangular boxes on the left, one labeled "Company A" and one labeled "Company B", connected by a plus sign "+", followed by an equals sign "=", followed by a single larger rectangular box on the right labeled "A + B". Cursive annotation below: "value creation".`,
  },

  // ── クリティカルシンキング ──────────────────────────────────────
  {
    slug: 'lesson-40',
    title: 'CRITICAL THINKING',
    subtitle: 'Examine, weigh, decide',
    diagram: `a hand-drawn magnifying glass on the left examining a rectangular document labeled "Claim". To the right of the document: a small balance scale weighing two pan rectangles labeled "for" and "against". Cursive annotation below: "question every claim".`,
  },
  {
    slug: 'lesson-41',
    title: 'LOGICAL FALLACIES',
    subtitle: 'Spot the broken arguments',
    diagram: `a hand-drawn vertical list of four rows. Each of the top three rows starts with a coral red "X" mark on the left, then a short fallacy name in cursive marker: row 1 "X attack person", row 2 "X straw man", row 3 "X bad cause". The bottom (fourth) row starts with a green check "V" mark and the cursive label "good logic". All hand-drawn with thick marker.

CRITICAL — the three fallacies (rows 1, 2, 3) MUST all have the red X mark (they are wrong). Only the bottom "good logic" row has the green check. Never put a green check next to a fallacy.`,
    spell: ['LOGICAL FALLACIES', 'Spot the broken arguments', 'attack person', 'straw man', 'bad cause', 'good logic'],
  },
  {
    slug: 'lesson-42',
    title: 'READING DATA',
    subtitle: 'See past the headline number',
    diagram: `a hand-drawn bar chart with four vertical bars of varying heights, drawn with thick marker outlines. Above the tallest bar: a coral red arrow pointing down at it with cursive annotation "really?". Below the chart: cursive annotation "look behind the bars".`,
  },
  {
    slug: 'lesson-43',
    title: 'ASK BETTER',
    subtitle: 'Frame the right question',
    diagram: `a large hand-drawn question mark "?" filling most of the canvas, drawn with thick black marker. Inside the negative space around the question mark: three small horizontal lines suggesting hand-written sub-questions. Below: cursive annotation "frame the question".`,
  },
  {
    slug: 'lesson-69',
    title: 'BIAS',
    subtitle: 'Filters bend your thinking',
    diagram: `a hand-drawn side-profile of a human head (simple outline), with two translucent rectangular filter panels in front of the eye. An arrow shows one panel being lifted away. To the side: cursive annotation "remove filter".`,
    spell: ['BIAS', 'Filters bend your thinking', 'remove filter'],
  },
  {
    slug: 'lesson-71',
    title: 'LINK is NOT CAUSE',
    subtitle: 'Two patterns rising together',
    diagram: `two hand-drawn line graphs side by side, both rising in similar wave patterns. Below the left graph: cursive label "A". Below the right graph: cursive label "B". A coral red question-mark arrow connects A to B. Cursive annotation below the graphs: "looks linked, not caused".

CRITICAL — the title at top-left must be exactly the four English words: LINK is NOT CAUSE. The middle word "NOT" must be hand-lettered in BOLD capital letters AND underlined with a coral red marker stroke beneath it. Do NOT use any equals sign "=". Do NOT use the "≠" symbol. Spell each word as: L-I-N-K, i-s, N-O-T, C-A-U-S-E. Four words total, with the word NOT visually emphasized.`,
    spell: ['LINK is NOT CAUSE', 'Two patterns rising together', 'A', 'B', 'looks linked, not caused'],
  },

  // ── 仮説思考 ──────────────────────────────────────────────────
  {
    slug: 'lesson-50',
    title: 'HYPOTHESIS',
    subtitle: 'Start with a smart guess',
    diagram: `three stages arranged left to right, connected by short right-pointing arrows: first a hand-drawn thought bubble labeled "Guess", then a beaker labeled "Test", then a small flag labeled "Insight". Hand-drawn with thick marker, cursive labels.`,
    spell: ['HYPOTHESIS', 'Start with a smart guess', 'Guess', 'Test', 'Insight'],
  },
  {
    slug: 'lesson-51',
    title: 'IDEAS FIRST',
    subtitle: 'List candidates, then pick',
    diagram: `three thought bubbles drawn side by side, each containing a short cursive label "Idea 1", "Idea 2", "Idea 3". A coral red circle is drawn around "Idea 2" with a cursive annotation "best one" pointing to it. Hand-drawn with thick marker.`,
    spell: ['IDEAS FIRST', 'List candidates, then pick', 'Idea 1', 'Idea 2', 'Idea 3', 'best one'],
  },
  {
    slug: 'lesson-52',
    title: 'TEST IDEAS',
    subtitle: 'Loop guess and verify',
    diagram: `a hand-drawn circular feedback loop with three nodes: top node labeled "Idea", right node labeled "Test", left node labeled "Refine". Curved arrows connect them clockwise forming a loop. Cursive annotation in the center: "loop".`,
    spell: ['TEST IDEAS', 'Loop guess and verify', 'Idea', 'Test', 'Refine', 'loop'],
  },
  {
    slug: 'lesson-70',
    title: 'TEST DESIGN',
    subtitle: 'Plan how to verify',
    diagram: `a vertical list of three short rows hand-drawn with marker, each row a labeled rectangle: top row "Hypothesis", second row "Method", third row "Expected Result". Each row connected by a short downward arrow. Cursive annotation to the side: "design before testing".`,
  },

  // ── 課題設定 ─────────────────────────────────────────────────
  {
    slug: 'lesson-53',
    title: 'AIM TRUE',
    subtitle: 'Find the real target',
    diagram: `a hand-drawn concentric target circle (three rings, centered) with a single arrow hitting the bullseye center. Two smaller "decoy" target shapes drawn faintly to the left and right with cursive label "fake" beneath each. Cursive annotation below the main target: "aim true".`,
    spell: ['AIM TRUE', 'Find the real target', 'fake', 'aim true'],
  },
  {
    slug: 'lesson-54',
    title: 'ISSUE ANALYSIS',
    subtitle: 'Break the issue into parts',
    diagram: `a hand-drawn large rectangular box at the top labeled "Big Issue", with three downward arrows branching to three smaller rectangles below labeled "Sub-issue A", "Sub-issue B", "Sub-issue C". Each sub-issue further split with shorter arrows into two even smaller boxes labeled "factor". Hand-drawn marker outlines.`,
  },
  {
    slug: 'lesson-55',
    title: 'FOCUS',
    subtitle: 'Pick the one that matters',
    diagram: `five hand-drawn rectangular issue cards arranged in a fan layout on the left, each with a short cursive label: "slow", "cost", "risk", "team", "data". A coral red curved arrow points from the cluster to a single highlighted card on the right labeled "pick this". Cursive annotation: "focus".`,
    spell: ['FOCUS', 'Pick the one that matters', 'slow', 'cost', 'risk', 'team', 'data', 'pick this', 'focus'],
  },

  // ── デザインシンキング ──────────────────────────────────────────
  {
    slug: 'lesson-56',
    title: 'DESIGN',
    subtitle: 'A five-stage cycle',
    diagram: `a hand-drawn circular flow of five small connected circles arranged in a pentagon, each labeled in cursive with ONE short word only: top "Feel", upper-right "Frame", lower-right "Ideas", lower-left "Make", upper-left "Test". Curved clockwise arrows connect them. Thick black marker outlines.\n\nUse only these 5 short words (Feel, Frame, Ideas, Make, Test) — do NOT write "Empathize", "Define", "Ideate", or "Prototype" anywhere.`,
    spell: ['DESIGN', 'A five-stage cycle', 'Feel', 'Frame', 'Ideas', 'Make', 'Test'],
  },
  {
    slug: 'lesson-57',
    title: 'USER LENS',
    subtitle: 'See it through their eyes',
    diagram: `a hand-drawn 2x2 grid (about 60% of canvas), each quadrant labeled in cursive: top-left "Says", top-right "Thinks", bottom-left "Does", bottom-right "Feels". A small circle in the very center of the grid labeled "User". Thick marker borders.`,
    spell: ['USER LENS', 'See it through their eyes', 'Says', 'Thinks', 'Does', 'Feels', 'User'],
  },
  {
    slug: 'lesson-58',
    title: 'BUILD & TEST',
    subtitle: 'Make small, test fast',
    diagram: `a hand-drawn paper mockup (a small rectangle with two interface lines on it) being shown to a simple stick figure on the right. A speech bubble from the figure contains a cursive "feedback". Cursive annotation below: "loop it".`,
    spell: ['BUILD & TEST', 'Make small, test fast', 'feedback', 'loop it'],
  },

  // ── ラテラルシンキング ─────────────────────────────────────────
  {
    slug: 'lesson-59',
    title: 'LATERAL THINKING',
    subtitle: 'Step out of the box',
    diagram: `a hand-drawn rectangular box with a lightbulb shape breaking out through the top of the box at an angle. Around the lightbulb: three short outward arrows pointing in unconventional directions (sideways, diagonal). Cursive annotation: "break out".`,
  },
  {
    slug: 'lesson-60',
    title: 'LATERAL TECHNIQUES',
    subtitle: 'Split one idea into many',
    diagram: `a hand-drawn triangular prism on the left, with a single horizontal arrow entering from the left. Three colored arrows fan out to the right of the prism. Cursive annotation: "split & explore".`,
  },
  {
    slug: 'lesson-61',
    title: 'LATERAL PRACTICE',
    subtitle: 'Flip perspective on purpose',
    diagram: `a hand-drawn cube outline on the left labeled "problem", then a curved rotation arrow pointing right, then the same cube outline on the right but rotated to show a hidden face labeled "new angle". Cursive annotation: "rotate the view".`,
  },

  // ── アナロジー思考 ────────────────────────────────────────────
  {
    slug: 'lesson-62',
    title: 'ANALOGY',
    subtitle: 'Borrow patterns from outside',
    diagram: `two hand-drawn small islands at the bottom of the canvas, connected by an arched bridge spanning between them. The left island labeled "Domain A", the right labeled "Domain B". A small cursive annotation on the bridge: "pattern".`,
    spell: ['ANALOGY', 'Borrow patterns from outside', 'Domain A', 'Domain B', 'pattern'],
  },
  {
    slug: 'lesson-63',
    title: 'BORROW',
    subtitle: 'Carry the structure across',
    diagram: `a hand-drawn rectangular "pattern" card on the left with three small marker shapes inside (circle, triangle, square), with a curved arrow lifting it and placing it onto a different rectangular frame on the right labeled "new place". Cursive annotation: "move it".`,
    spell: ['BORROW', 'Carry the structure across', 'pattern', 'new place', 'move it'],
  },
  {
    slug: 'lesson-64',
    title: 'ANALOGY PRACTICE',
    subtitle: 'Match structures, not surfaces',
    diagram: `two parallel horizontal flows drawn one above the other. Top flow: three connected boxes labeled "A → B → C". Bottom flow: three connected boxes labeled "X → Y → Z". Vertical dashed lines connect A↔X, B↔Y, C↔Z showing structural mapping. Cursive annotation: "same shape".`,
  },

  // ── システムシンキング ─────────────────────────────────────────
  {
    slug: 'lesson-65',
    title: 'SYSTEMS',
    subtitle: 'See the loops, not the parts',
    diagram: `a hand-drawn circular feedback loop with three labeled node circles arranged in a triangle: top "A", bottom-right "B", bottom-left "C". Curved arrows connect them clockwise forming a closed loop. Cursive annotation inside: "loop".`,
  },
  {
    slug: 'lesson-66',
    title: 'SYSTEM ARCHETYPES',
    subtitle: 'Reinforcing and balancing',
    diagram: `two hand-drawn circles side by side. The left circle has a curved clockwise arrow inside labeled "R" with cursive "reinforcing". The right circle has a curved arrow with a small bar across it labeled "B" with cursive "balancing". Thick marker outlines.`,
  },
  {
    slug: 'lesson-67',
    title: 'SYSTEMS PRACTICE',
    subtitle: 'Iceberg view of behavior',
    diagram: `a hand-drawn iceberg shape with four horizontal layers from top to bottom, each labeled in cursive: top tip above water "Events", just below water "Patterns", deeper "Structures", deepest "Mental Models". A wavy waterline crosses near the top. Thick marker outlines.`,
  },

  // ── 提案・伝える技術 ──────────────────────────────────────────
  {
    slug: 'lesson-72',
    title: 'ASK FOR ACTION',
    subtitle: 'Decide what the reader does',
    diagram: `a hand-drawn rectangular document on the left, with a thick coral arrow pointing right to a small bullseye labeled "do this". Cursive annotation below the document: "make it clear".`,
    spell: ['ASK FOR ACTION', 'Decide what the reader does', 'do this', 'make it clear'],
  },
  {
    slug: 'lesson-73',
    title: 'THEIR SHOES',
    subtitle: 'Read from the other side',
    diagram: `two simple stick figures facing each other across a horizontal document in the middle. Each figure has a dashed sight line drawn from its eye to the document. Cursive annotation: "see it as they do".`,
  },
  {
    slug: 'lesson-74',
    title: 'STORYLINE',
    subtitle: 'Lead the reader step by step',
    diagram: `four rectangular story panels arranged left to right, connected by short right-pointing arrows, labeled in cursive: "Setup", "Tension", "Insight", "Action". Hand-drawn with thick marker.`,
  },
  {
    slug: 'lesson-75',
    title: 'POLISH THE MESSAGE',
    subtitle: 'Cut, sharpen, repeat',
    diagram: `a hand-drawn rectangular message card in the center with a long sentence drawn as squiggle lines inside, with two of the lines crossed out by short strikethroughs in coral red. Below the card: a shorter, cleaner version with only two squiggle lines. Cursive annotation: "less is more".`,
  },
  {
    slug: 'lesson-76',
    title: 'PRE-EMPT',
    subtitle: 'Answer back before they ask',
    diagram: `a hand-drawn round shield in the center of the canvas, with three incoming arrows from the upper-left, upper-right, and right side bouncing off the shield. Behind the shield: a small rectangular document labeled "your case". Cursive annotation below: "ready".`,
    spell: ['PRE-EMPT', 'Answer back before they ask', 'your case', 'ready'],
  },

  // ── 哲学 ────────────────────────────────────────────────────
  {
    slug: 'lesson-77',
    title: 'SOCRATES',
    subtitle: 'Ask, do not tell',
    diagram: `a hand-drawn ancient Greek stone column on the left side. Above the column: three rising question marks "?" of increasing size. To the right of the column: cursive annotation "I know that I know nothing".`,
  },
  {
    slug: 'lesson-78',
    title: 'TEST IT',
    subtitle: 'A claim you can prove wrong',
    diagram: `a hand-drawn rectangular card in the upper-left labeled in cursive "Claim", with a short squiggle line of text inside. From the card, a thick coral arrow points right to a small hand-drawn beaker / test tube on the right side. Below the beaker: two small outcome marks side by side — a coral check mark and a coral X mark. Cursive annotation along the bottom: "could it fail?". Hand-drawn with thick marker, simple and clean.`,
    spell: ['TEST IT', 'A claim you can prove wrong', 'Claim', 'could it fail?'],
  },

  // ── 数字感覚・クライアントワーク ─────────────────────────────
  {
    slug: 'lesson-89',
    title: 'DIGIT SENSE',
    subtitle: 'Read the size of a number',
    diagram: `a hand-drawn horizontal number line across the middle of the page. Four evenly spaced tick marks labeled in cursive from left to right: "10K", "1M", "100M", "1B". Above each tick, a small upward arrow. Below the leftmost tick a tiny person icon, below the rightmost tick a tiny globe icon, suggesting scale grows from small to huge. Cursive annotation at bottom: "count the zeros". Hand-drawn with thick marker, simple and clean.`,
    spell: ['DIGIT SENSE', 'Read the size of a number', '10K', '1M', '100M', '1B', 'count the zeros'],
  },

  // ── フォールバック（カテゴリ別の代表画像） ──────────────────────
  {
    slug: 'lesson-critical-thinking',
    title: 'CRITICAL',
    subtitle: 'Question every claim',
    diagram: `a hand-drawn magnifying glass examining a small rectangular card labeled "?". To the right: a small balance scale with two pans. Three small question marks float between them. Cursive annotation: "examine, weigh, decide".`,
  },
  {
    slug: 'lesson-design-thinking',
    title: 'DESIGN',
    subtitle: 'Start with people',
    diagram: `a hand-drawn circular flow of exactly four small connected circles arranged in a square shape (one at top, one at right, one at bottom, one at left). The four circles are labeled in cursive with these short words IN CLOCKWISE ORDER: 1) top circle "Feel", 2) right circle "Plan", 3) bottom circle "Make", 4) left circle "Test". Curved clockwise arrows connect them in this exact order Feel → Plan → Make → Test → (back to Feel). Draw EXACTLY FOUR circles, no more. Do NOT add a fifth circle. Do NOT add any extra word between the circles. Hand-drawn with thick marker.`,
    spell: ['DESIGN', 'Start with people', 'Feel', 'Plan', 'Make', 'Test'],
  },
  {
    slug: 'lesson-lateral-thinking',
    title: 'LATERAL',
    subtitle: 'Think wide, not down',
    diagram: `a hand-drawn lightbulb shape breaking out through the top of a rectangular box. Three short outward arrows fan out in unconventional directions. Cursive annotation: "break out".`,
    spell: ['LATERAL', 'Think wide, not down', 'break out'],
  },
  {
    slug: 'lesson-analogy',
    title: 'ANALOGY',
    subtitle: 'Bridge two worlds',
    diagram: `two small hand-drawn islands at the bottom of the canvas connected by an arched bridge. Left island labeled "A", right island labeled "B". Cursive annotation on the bridge: "shared pattern".`,
  },
  {
    slug: 'lesson-systems-thinking',
    title: 'SYSTEMS',
    subtitle: 'Everything connects back',
    diagram: `a hand-drawn closed feedback loop with three labeled node circles arranged in a triangle: top "A", bottom-right "B", bottom-left "C". Curved arrows clockwise. Cursive annotation: "loop".`,
  },

  // ── 認知科学 / cognitive-01 ──────────────────────────
  {
    slug: 'lesson-700',
    title: 'WORKING MEMORY',
    subtitle: 'The 7 plus or minus 2 rule',
    diagram: `a hand-drawn human head outline in profile facing right, with the brain area exposed showing a small horizontal "tray" or "desk" inside the head. On the desk: seven small circle tokens lined up in a row, each unlabeled. Above the tokens: a small cursive annotation "7 ± 2". Below the head: cursive annotation "chunks, not digits". Hand-drawn with thick black marker, clean and simple.`,
    spell: ['WORKING MEMORY', 'The 7 plus or minus 2 rule', '7 ± 2', 'chunks, not digits'],
  },
  {
    slug: 'lesson-701',
    title: 'CHUNKING',
    subtitle: 'Group items into meaningful sets',
    diagram: `two horizontal rows centered on the page. Top row: nine small unlabeled circle tokens in a single straight line, evenly spaced, all drawn as plain marker circles with no numbers or letters inside. A single coral downward arrow centered between the two rows, with the cursive label "group" written next to the arrow. Bottom row: three larger rectangular boxes drawn side by side, each box enclosing three of the same plain circle tokens. Each rectangular box has a small cursive label "set" written directly underneath it. Hand-drawn with thick black marker.

CRITICAL — do NOT write any numbers (no "3", no "4", no "330") inside the circles or boxes. The only handwritten text on the diagram itself is the word "group" near the arrow and the three labels "set" under the bottom rectangles.`,
    spell: ['CHUNKING', 'Group items into meaningful sets', 'group', 'set'],
  },
  {
    slug: 'lesson-702',
    title: 'COGNITIVE LOAD',
    subtitle: 'Three kinds of mental load',
    diagram: `three horizontal stacked rectangular bars drawn with thick black marker, labeled in cursive from top to bottom: top bar "Task", middle bar "Noise", bottom bar "Build". A coral down-arrow on the right side labeled "load". Below the stack: cursive annotation "cut the noise".`,
    spell: ['COGNITIVE LOAD', 'Three kinds of mental load', 'Task', 'Noise', 'Build', 'load', 'cut the noise'],
  },
  {
    slug: 'lesson-703',
    title: 'EXTERNAL MEMORY',
    subtitle: 'Offload to paper and tools',
    diagram: `on the left: a hand-drawn human head outline in profile facing right. From the head, a coral arrow flows outward to the right toward two small icons drawn side by side: a small open notebook page and a small rectangular laptop screen. Cursive annotation above the arrow: "offload". Cursive annotation below the icons: "free the desk".`,
    spell: ['EXTERNAL MEMORY', 'Offload to paper and tools', 'offload', 'free the desk'],
  },
  {
    slug: 'lesson-704',
    title: 'TASK SWITCH',
    subtitle: 'Multitasking is an illusion',
    diagram: `two hand-drawn square boxes side by side. Left box labeled "A" with a single large hand-lettered marker letter centered inside. Right box labeled "B" with a single large hand-lettered marker letter centered inside. Between the boxes: a curved double-headed arrow swinging back and forth between A and B. Above the arrow: cursive annotation "switch cost". Below the boxes: cursive annotation "not parallel".`,
    spell: ['TASK SWITCH', 'Multitasking is an illusion', 'A', 'B', 'switch cost', 'not parallel'],
  },

  // ── 認知科学 / cognitive-02 ──────────────────────────
  {
    slug: 'lesson-710',
    title: 'RECALL BIAS',
    subtitle: 'Easy to recall feels frequent',
    diagram: `a hand-drawn human head outline in profile facing right, with the brain area showing one bright bold marker icon (a small lightbulb) labeled in cursive "vivid". Behind the bulb, three faint dotted-line bulb shapes labeled "faded". A coral arrow points from the bright bulb outward to the right labeled "feels common". Below the head: cursive annotation "not really true".

CRITICAL — the small annotation below the head must read exactly the three English words "not really true". Do NOT write "memory = truth" or any equals-sign phrase, since this lesson teaches that recall does NOT equal truth. Spell the three words as: n-o-t, r-e-a-l-l-y, t-r-u-e.`,
    spell: ['RECALL BIAS', 'Easy to recall feels frequent', 'vivid', 'faded', 'feels common', 'not really true'],
  },
  {
    slug: 'lesson-711',
    title: 'HALO EFFECT',
    subtitle: 'One trait paints the whole',
    diagram: `a hand-drawn simple stick-figure person in the center. Above the head: a small five-point star labeled in cursive "smart". From the star, three coral arrows fan outward to three small cursive labels around the figure: "kind?", "honest?", "skilled?". Below the figure: cursive annotation "one trait spreads".`,
    spell: ['HALO EFFECT', 'One trait paints the whole', 'smart', 'kind?', 'honest?', 'skilled?', 'one trait spreads'],
  },
  {
    slug: 'lesson-712',
    title: 'KNEW IT BIAS',
    subtitle: 'Looks obvious after the fact',
    diagram: `a hand-drawn horizontal timeline with three tick marks labeled in cursive left to right: "before", "event", "after". Above the "after" tick: a thought bubble containing the short cursive text "I knew it". A coral curved arrow loops back from "after" to "before" labeled in cursive "rewrite". Hand-drawn with thick marker.`,
    spell: ['KNEW IT BIAS', 'Looks obvious after the fact', 'before', 'event', 'after', 'I knew it', 'rewrite'],
  },
  {
    slug: 'lesson-713',
    title: 'DUNNING KRUGER',
    subtitle: 'Low skill, high confidence',
    diagram: `a hand-drawn line graph with a horizontal axis labeled "skill" in cursive and a vertical axis labeled "confidence" in cursive. The curve rises sharply at the far left to a peak labeled "peak of fool", drops down to a valley labeled "valley", then slowly rises to the right ending at a plateau labeled "expert". Hand-drawn with thick marker.`,
    spell: ['DUNNING KRUGER', 'Low skill, high confidence', 'skill', 'confidence', 'peak of fool', 'valley', 'expert'],
  },
  {
    slug: 'lesson-714',
    title: 'RESULT vs PROCESS',
    subtitle: 'Judge the path, not just the end',
    diagram: `two horizontal arrow paths drawn one above the other across the canvas. Top path labeled in cursive "good path" with a coral check mark at the end. Bottom path labeled "lucky path" with a coral X mark at the end, even though it also reaches a small flag labeled "win". Cursive annotation below: "look at the path".`,
    spell: ['RESULT vs PROCESS', 'Judge the path, not just the end', 'good path', 'lucky path', 'win', 'look at the path'],
  },

  // ── ドキュメンテーション ──────────────────────────
  {
    slug: 'lesson-720',
    title: 'STRUCTURE FIRST',
    subtitle: 'Outline wins before design',
    diagram: `a hand-drawn document outline drawn as a large rectangle divided into three labeled rows from top to bottom: top row "Why" (in cursive), middle row "Who", bottom row "Key Msg". To the left of the document: cursive annotation "before design". Thick marker borders.`,
    spell: ['STRUCTURE FIRST', 'Outline wins before design', 'Why', 'Who', 'Key Msg', 'before design'],
  },
  {
    slug: 'lesson-721',
    title: 'ONE MESSAGE',
    subtitle: 'One slide, one idea',
    diagram: `a hand-drawn rectangular slide frame in the center of the canvas. Inside the slide at the top: a single short cursive sentence "main idea here". Below it: a small simple diagram of two connected boxes. To the right of the slide: a coral X mark next to a smaller cluster of three messy lines labeled in cursive "too much". Below: cursive annotation "one idea".`,
    spell: ['ONE MESSAGE', 'One slide, one idea', 'main idea here', 'too much', 'one idea'],
  },
  {
    slug: 'lesson-722',
    title: 'TEXT TO VISUAL',
    subtitle: 'When to use a diagram',
    diagram: `on the left: a hand-drawn rectangular block of three short squiggle text lines labeled in cursive "text". A coral right-arrow points across the canvas to the right. On the right: a small hand-drawn diagram of three connected boxes in a tree shape labeled in cursive "visual". Below the arrow: cursive annotation "when relations matter".`,
    spell: ['TEXT TO VISUAL', 'When to use a diagram', 'text', 'visual', 'when relations matter'],
  },
  {
    slug: 'lesson-723',
    title: 'WHITE SPACE',
    subtitle: 'Margins guide the eye',
    diagram: `a hand-drawn large rectangular page frame taking up most of the canvas, with thick marker border. Inside the page, only a single small rectangle in the upper-left corner labeled in cursive "focus". The rest of the page is intentionally empty (white). Dashed line arrows around the edges show the wide margins. Below the page: cursive annotation "less is more".`,
    spell: ['WHITE SPACE', 'Margins guide the eye', 'focus', 'less is more'],
  },
  {
    slug: 'lesson-724',
    title: 'TYPE BASICS',
    subtitle: 'Readable beats fancy',
    diagram: `three lines of hand-lettered marker text stacked vertically, each line at a different size from large to small: top line "TITLE" in large bold marker capitals, middle line "Subtitle" in medium marker, bottom line "body text" in small marker. To the right: a small ruler-like vertical scale with cursive annotations "big", "mid", "small". Below: cursive annotation "size = rank".`,
    spell: ['TYPE BASICS', 'Readable beats fancy', 'TITLE', 'Subtitle', 'body text', 'big', 'mid', 'small', 'size = rank'],
  },
  {
    slug: 'lesson-725',
    title: 'THREE COLORS',
    subtitle: 'The 70 25 5 rule',
    diagram: `three hand-drawn rectangular swatches lined up horizontally side by side, each labeled with a percentage and a cursive role: leftmost large swatch "70% base", middle medium swatch "25% main", rightmost small swatch "5% accent". The leftmost swatch is outlined only (empty inside), the middle swatch is lightly filled with sage green, the rightmost is lightly filled with coral. Below: cursive annotation "limit to three".`,
    spell: ['THREE COLORS', 'The 70 25 5 rule', '70% base', '25% main', '5% accent', 'limit to three'],
  },
  {
    slug: 'lesson-726',
    title: 'CHART CHOICE',
    subtitle: 'Pick the right shape',
    diagram: `a hand-drawn 2x2 grid (about 60% of canvas) with four small marker sketches inside the cells: top-left a simple line graph labeled in cursive "trend", top-right a vertical bar chart labeled "compare", bottom-left a pie chart with one wedge highlighted labeled "share", bottom-right a scatter of three dots labeled "spread". Hand-drawn with thick marker.`,
    spell: ['CHART CHOICE', 'Pick the right shape', 'trend', 'compare', 'share', 'spread'],
  },

  // ── フェルミ推定 ──────────────────────────
  {
    slug: 'lesson-200',
    title: 'FERMI',
    subtitle: 'Estimate without exact data',
    diagram: `a hand-drawn human head outline in profile facing right. From the head, a coral arrow flows out to a small handwritten cursive equation "≈ 1.4 trillion ¥" on the right side of the canvas. Above the head: cursive annotation "no data". Below: cursive annotation "use logic, not guess".`,
    spell: ['FERMI', 'Estimate without exact data', 'no data', 'use logic, not guess'],
  },
  {
    slug: 'lesson-201',
    title: 'BREAK DOWN',
    subtitle: 'Turn the goal into a product',
    diagram: `a hand-drawn equation centered on the page, flowing left to right: a large rectangular box on the left labeled in cursive "Goal", followed by an equals sign "=", followed by four small rectangular boxes in a row, each connected by a multiplication sign "×". The four small boxes are labeled in cursive, one short word per box: "users", "rate", "buys", "yen". Hand-drawn with thick black marker.`,
    spell: ['BREAK DOWN', 'Turn the goal into a product', 'Goal', 'users', 'rate', 'buys', 'yen'],
  },
  {
    slug: 'lesson-202',
    title: 'CITY SCALE',
    subtitle: 'Use lines and grids you know',
    diagram: `a hand-drawn simple subway map: three roughly drawn curved lines crossing on the canvas (one horizontal, one diagonal, one vertical), with five small dot stations along each. Above the map: a cursive annotation "≈ 300 km". Below: cursive annotation "rough is fine".`,
    spell: ['CITY SCALE', 'Use lines and grids you know', '≈ 300 km', 'rough is fine'],
  },
  {
    slug: 'lesson-203',
    title: 'MARKET SIZE',
    subtitle: 'Estimate a business at scale',
    diagram: `a hand-drawn vertical equation stack centered on the canvas. Four short rows stacked top to bottom, each row a rectangular box with a cursive label: "users", "× spend", "× months", "= market". Each row connected to the next by a short downward marker line. Hand-drawn with thick black marker.`,
    spell: ['MARKET SIZE', 'Estimate a business at scale', 'users', '× spend', '× months', '= market'],
  },
  {
    slug: 'lesson-204',
    title: 'FERMI TRAPS',
    subtitle: 'Spot the common mistakes',
    diagram: `a hand-drawn vertical list of three rows on the left side, each row starting with a coral red "X" mark followed by a short cursive marker label: row 1 "X everyone uses it", row 2 "X mixed units", row 3 "X round too fast". On the right side of the canvas: a single row with a green check "V" and the cursive label "good check". Hand-drawn with thick marker.

CRITICAL — the three trap rows on the left must all have the red X mark. Only the "good check" row on the right has the green V check. Never put a green check next to a trap.`,
    spell: ['FERMI TRAPS', 'Spot the common mistakes', 'everyone uses it', 'mixed units', 'round too fast', 'good check'],
  },
  {
    slug: 'lesson-205',
    title: 'BASE DATA',
    subtitle: 'Numbers to keep in your head',
    diagram: `a hand-drawn human head outline in profile facing right, with the brain area exposed showing a small grid of three rows by three columns of tiny rectangular tiles inside the head. Each tile has a short cursive label such as "pop", "GDP", "house". A coral arrow points outward labeled in cursive "ready to use". Below the head: cursive annotation "know the base".`,
    spell: ['BASE DATA', 'Numbers to keep in your head', 'pop', 'GDP', 'house', 'ready to use', 'know the base'],
  },

  // ── 構造化リスニング (listening-01) ──────────────────────────
  {
    slug: 'lesson-730',
    title: 'STRUCTURED LISTENING',
    subtitle: 'Beyond passive hearing',
    diagram: `on the left side: a small hand-drawn human head outline in profile facing right, with the brain area exposed showing only one wavy line inside (passive). On the right side: another small head outline facing right, with the brain area showing three short horizontal layers stacked inside, labeled in tiny cursive "fact", "feel", "view". Between the two heads: a coral right-arrow with the cursive annotation "structure" above it. Below both heads: cursive annotation "decode, not just hear".`,
    spell: ['STRUCTURED LISTENING', 'Beyond passive hearing', 'fact', 'feel', 'view', 'structure', 'decode, not just hear'],
  },
  {
    slug: 'lesson-731',
    title: 'FACT FEEL VIEW',
    subtitle: 'Split what they really said',
    diagram: `a hand-drawn thought bubble at the top of the canvas containing a single short squiggle line (representing a person's mixed speech). Below the bubble: three downward arrows fan out to three separate rectangular boxes lined up in a row. Each box has a short cursive label inside: leftmost "fact" (with a small underline icon), middle "feel" (with a small heart-outline icon), rightmost "view" (with a small eye-outline icon). Cursive annotation below: "split it".`,
    spell: ['FACT FEEL VIEW', 'Split what they really said', 'fact', 'feel', 'view', 'split it'],
  },
  {
    slug: 'lesson-732',
    title: 'PARAPHRASE',
    subtitle: 'Echo back what you heard',
    diagram: `two hand-drawn simple stick figures facing each other. The left figure has a speech bubble with several squiggle lines (a long message). The right figure has a smaller speech bubble with just three short squiggle lines (a tight summary). Between them: a coral right-arrow labeled "echo" and a coral return-arrow labeled "check". Cursive annotation below: "shorter, cleaner".`,
    spell: ['PARAPHRASE', 'Echo back what you heard', 'echo', 'check', 'shorter, cleaner'],
  },
  {
    slug: 'lesson-733',
    title: 'OPEN vs CLOSED',
    subtitle: 'Question shapes the answer',
    diagram: `a hand-drawn 2x2 grid on cream notebook paper. Top row labels: "open" (left), "closed" (right). Left column labels: "fact" (top), "feel" (bottom). Inside the four cells, a short cursive sample question each: top-left "what happened?", top-right "did it?", bottom-left "how do you feel?", bottom-right "are you ok?". Thick marker borders. Cursive annotation below: "mix them right".`,
    spell: ['OPEN vs CLOSED', 'Question shapes the answer', 'open', 'closed', 'fact', 'feel', 'what happened', 'did it', 'how do you feel', 'are you ok', 'mix them right'],
  },
  {
    slug: 'lesson-734',
    title: 'SILENCE',
    subtitle: 'Wait, do not fill it',
    diagram: `a hand-drawn horizontal timeline arrow running left to right with three tick marks. Above the left tick: cursive label "ask". Above the middle tick (the gap between two ticks): the large hand-drawn dots "·  ·  ·" with the cursive label "wait" beneath. Above the right tick: cursive label "real answer". Below the timeline: cursive annotation "5 seconds gold".`,
    spell: ['SILENCE', 'Wait, do not fill it', 'ask', 'wait', 'real answer', '5 seconds gold'],
  },
  {
    slug: 'lesson-735',
    title: 'ONE ON ONE',
    subtitle: 'Coach by listening',
    diagram: `a hand-drawn upward staircase of four steps on cream notebook paper, rising from lower-left to upper-right. A small stick figure stands on the bottom step. Each step has a short cursive label written above it: step 1 "fact", step 2 "feel", step 3 "view", step 4 "want" (with a coral filled dot on step 4). Cursive annotation upper-right: "climb slowly".`,
    spell: ['ONE ON ONE', 'Coach by listening', 'fact', 'feel', 'view', 'want', 'climb slowly'],
  },
  {
    slug: 'lesson-736',
    title: 'SALES LISTEN',
    subtitle: 'Find the real budget',
    diagram: `a hand-drawn inverted funnel on cream notebook paper. Top wide opening labeled in cursive "what they say". Funnel narrows downward through three rings labeled "S P I N" (four small letters stacked vertically along the inside of the funnel). Bottom narrow tip drips into a small box labeled "BANT". Cursive annotation upper-right: "deeper layers".`,
    spell: ['SALES LISTEN', 'Find the real budget', 'what they say', 'S', 'P', 'I', 'N', 'BANT', 'deeper layers'],
  },

  // ── ADHD レバレッジ (adhd-leverage-01) ──────────────────────────
  {
    slug: 'lesson-800',
    title: 'REFRAME',
    subtitle: 'Trait, not disorder',
    diagram: `a hand-drawn 2x2 grid of four boxes on cream notebook paper. Each box contains one short cursive label in marker handwriting, with a small coral icon above the label. Top-left: a small flame icon, label "focus". Top-right: a small starburst icon, label "ideas". Bottom-left: a small lightning-bolt icon, label "speed". Bottom-right: a small compass icon, label "new". Above the grid: cursive annotation "four assets". Below the grid: cursive annotation "use them well".`,
    spell: ['REFRAME', 'Trait, not disorder', 'focus', 'ideas', 'speed', 'new', 'four assets', 'use them well'],
  },
  {
    slug: 'lesson-801',
    title: 'IGNITION MAP',
    subtitle: 'Log your focus zones',
    diagram: `a hand-drawn 3x4 grid on cream notebook paper. Top header row has four cursive labels for time slots: "morn", "noon", "eve", "night". Left header column has three cursive labels for environment variables stacked vertically: "place", "sound", "task". Inside the 12 cells: a few cells are lightly shaded coral (filled), a few have a small "X" mark, and the rest are empty. Cursive annotation upper-right: "2 weeks". Below: cursive annotation "find your zone".`,
    spell: ['IGNITION MAP', 'Log your focus zones', 'morn', 'noon', 'eve', 'night', 'place', 'sound', 'task', '2 weeks', 'find your zone'],
  },
  {
    slug: 'lesson-802',
    title: 'DESK SETUP',
    subtitle: 'Let the room hold your focus',
    diagram: `a hand-drawn top-down view of a clean rectangular desk on cream notebook paper. On the desk: a single laptop in the center labeled in cursive "task". To the left of the desk, outside its border: a small phone icon with a coral X mark on it labeled "phone". Above the desk: a small clock icon labeled "block". To the right: a small bell icon with a coral X mark labeled "off". Cursive annotation upper-right: "no noise".`,
    spell: ['DESK SETUP', 'Let the room hold your focus', 'task', 'phone', 'block', 'off', 'no noise'],
  },
  {
    slug: 'lesson-803',
    title: 'TASK SHAPE',
    subtitle: 'Cut the friction to start',
    diagram: `on the left: a large hand-drawn rectangular box labeled in cursive "big task" with a small coral X mark next to it. A coral right-arrow points across to the right side, where five small connected rectangular sub-boxes are drawn in a horizontal chain, each labeled with a tiny cursive number "1", "2", "3", "4", "5". Above the chain: cursive annotation "5 min start". Below: cursive annotation "tiny first step".`,
    spell: ['TASK SHAPE', 'Cut the friction to start', 'big task', '1', '2', '3', '4', '5', '5 min start', 'tiny first step'],
  },
  {
    slug: 'lesson-804',
    title: 'ROLE FIT',
    subtitle: 'Pick where you shine',
    diagram: `a hand-drawn 2x2 grid on cream notebook paper. X-axis label below: "your fit" with "low" left and "high" right. Y-axis label rotated on left: "energy" with "low" bottom and "high" top. Each cell has a short cursive label: top-left "drain" with coral X, top-right "shine" with coral star, bottom-left "avoid" with coral X, bottom-right "ok" with cursive check. Cursive annotation upper-right: "match it".`,
    spell: ['ROLE FIT', 'Pick where you shine', 'your fit', 'energy', 'low', 'high', 'drain', 'shine', 'avoid', 'ok', 'match it'],
  },
  {
    slug: 'lesson-805',
    title: 'PARTNER UP',
    subtitle: 'Borrow what you lack',
    diagram: `two hand-drawn puzzle-piece shapes on cream notebook paper, side by side, interlocking in the middle. Left piece labeled in cursive "you" with a coral starburst icon above. Right piece labeled "ally" with a small gear icon above. Below the joined pieces: a single rectangular bar labeled "team" stretching the full width. Cursive annotation upper-right: "fill the gap".`,
    spell: ['PARTNER UP', 'Borrow what you lack', 'you', 'ally', 'team', 'fill the gap'],
  },
  {
    slug: 'lesson-806',
    title: 'BURN PROOF',
    subtitle: 'Protect the next sprint',
    diagram: `a hand-drawn horizontal sine wave on cream notebook paper, with two clear peaks and two clear valleys. Above each peak: a small flame icon with the cursive label "peak". Below each valley: a small bed icon with the cursive label "rest". Below the wave: cursive annotation "ride, then rest".`,
    spell: ['BURN PROOF', 'Protect the next sprint', 'peak', 'rest', 'ride, then rest'],
  },
  {
    slug: 'lesson-807',
    title: 'ROLE MODELS',
    subtitle: 'Steal their playbook',
    diagram: `a hand-drawn open book in the center of the canvas on cream notebook paper. The left page has three short cursive labels stacked vertically: "trait", "env", "team". The right page shows a small arrow path pointing into a coral star labeled "lesson". A small magnifying glass hovers over the right page. Cursive annotation upper-right: "what works?".`,
    spell: ['ROLE MODELS', 'Steal their playbook', 'trait', 'env', 'team', 'lesson', 'what works'],
  },
]
