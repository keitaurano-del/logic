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
  'EN', 'PRE-EMPT', 'JP', 'NOT', 'AND', 'OR', 'WHY', 'SO',
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
      if (/^[\s\/≠=]+$/.test(token)) return token
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
    subtitle: 'Mutually Exclusive, Collectively Exhaustive',
    diagram: `a hand-drawn 2x2 grid (about 55% of canvas width) with four labeled cells — top-left "A", top-right "B", bottom-left "C", bottom-right "D" — drawn with thick black marker borders, each cell label a single large hand-lettered marker letter centered in its cell. Above the grid: a short down-arrow with handwritten annotation "no overlaps" (cursive). Below the grid: a short up-arrow with handwritten annotation "no gaps either" (cursive).`,
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
    subtitle: 'Conclusion on top, reasons below',
    diagram: `a hand-drawn three-tier pyramid built from rectangular boxes: a single wide box at the top labeled "Main Idea", three medium boxes in the middle row labeled "Reason 1", "Reason 2", "Reason 3", and five small boxes at the bottom labeled "Fact". Thick marker borders, light cream interior. To the side: handwritten annotation "top-down" (cursive).`,
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
    diagram: `a hand-drawn truth table with three columns and four rows. Column headers: "P", "Q", "P → Q". Row entries: T/T/T, T/F/F, F/T/T, F/F/T. Drawn with thick black marker grid lines, each T or F is a single hand-lettered marker letter. Below the table: cursive annotation "valid implication".`,
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
    diagram: `a hand-drawn vertical list of three rows. Each row contains a short fallacy name in cursive (hand-lettered) marked with a coral red ✗ on the left: "ad hominem", "straw man", "false cause". Below the list: a single row with a green ✓ marking and the cursive label "valid argument". All hand-drawn with thick marker.`,
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
    title: 'DRAFT GUESSES',
    subtitle: 'List candidates, then pick',
    diagram: `three thought bubbles drawn side by side, each containing a short cursive label "Guess 1", "Guess 2", "Guess 3". A coral red circle is drawn around "Guess 2" with a cursive annotation "best one" pointing to it. Hand-drawn with thick marker.`,
    spell: ['DRAFT GUESSES', 'List candidates, then pick', 'Guess 1', 'Guess 2', 'Guess 3', 'best one'],
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
    title: 'DESIGN THINKING',
    subtitle: 'A five-stage cycle',
    diagram: `a hand-drawn circular flow of five connected rectangular boxes arranged in a pentagon-like loop, each labeled in cursive: "Empathize", "Define", "Ideate", "Prototype", "Test". Curved arrows connect them clockwise. Thick black marker outlines.`,
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
    title: 'PROTOTYPE & TEST',
    subtitle: 'Build it small, test it fast',
    diagram: `a hand-drawn paper prototype (a small rectangle with two interface lines on it) being shown to a simple stick figure on the right. A speech bubble from the figure contains a cursive "feedback". Cursive annotation below: "iterate fast".`,
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
    title: 'PROPOSAL PURPOSE',
    subtitle: 'Define what the reader does',
    diagram: `a hand-drawn rectangular bound proposal document on the left, with an arrow pointing right to a small target circle labeled "action". Cursive annotation: "what do they DO?".`,
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
]
