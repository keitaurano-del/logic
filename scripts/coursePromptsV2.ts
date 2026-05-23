/**
 * Course thumbnail prompts (v2 — Caveat-style hand-drawn notebook).
 *
 * 26 existing courses + 1 new issue-01 = 27 total, 16:9 landscape.
 * Used by scripts/generate-course-thumbnails-v2.ts and shares the
 * `buildCoursePrompt` helper from careerPromptsV2.ts.
 *
 * Style requirements come from feedback_logic_course_thumbnails.md
 * and feedback_gemini_prompt_tricks.md.
 */

import type { LessonPromptEntry } from './lessonPromptsV2.ts'

export const COURSE_PROMPTS_V2: LessonPromptEntry[] = [
  {
    slug: 'course-logic-01',
    title: 'MECE & Logic Tree',
    subtitle: 'Logical thinking, organized',
    diagram: 'a hand-drawn 3-level logic tree on cream notebook paper: a top "Issue" box branches into 3 boxes "Why A", "Why B", "Why C", each branching into 2 small oval leaves (a1, a2, b1, b2, c1, c2). Connecting lines in thin black marker. Coral-red handwritten annotation "break it down" to the right of the top node.',
    spell: ['MECE & Logic Tree', 'Issue', 'Why A', 'Why B', 'Why C', 'break it down'],
  },
  {
    slug: 'course-logic-02',
    title: 'Pyramid Principle',
    subtitle: 'Build logic, move people',
    diagram: 'a hand-drawn pyramid-principle tree on cream notebook paper: top box "Main" branches down to two mid-level boxes "Key A" and "Key B", each branching into two supporting leaf boxes. Black marker boxes connected by thin lines. Coral-red handwritten annotation "so what?" to the upper-right.',
    spell: ['Pyramid Principle', 'Main', 'Key A', 'Key B', 'so what'],
  },
  {
    slug: 'course-critical-01',
    title: 'Critical Thinking',
    subtitle: 'Doubt assumptions, judge well',
    diagram: 'a hand-drawn scatter of large coral-red question marks ("?") floating across the right half of cream notebook paper at varied sizes and angles. Coral-red handwritten annotation "really?" in the upper-right.',
    spell: ['Critical Thinking', 'really'],
  },
  {
    slug: 'course-critical-02',
    title: 'Cognitive Biases',
    subtitle: 'Strip bias, see clearly',
    diagram: 'three overlapping translucent circles on cream notebook paper Venn-style: left coral-pink circle labeled "confirm", right coral-pink circle labeled "frame", center gray circle labeled "anchor". Below the center: a small pair of black eyeglasses. Coral-red handwritten annotation "watch out" upper-right.',
    spell: ['Cognitive Biases', 'confirm', 'frame', 'anchor', 'watch out'],
  },
  {
    slug: 'course-hypothesis-01',
    title: 'Hypothesis First',
    subtitle: 'Guess first, then look',
    diagram: 'a hand-drawn triangular loop on cream notebook paper: three rounded rectangle boxes — "Guess" at top, "Learn" at bottom-left, "Test" at bottom-right — connected by coral-red arrowed lines forming a cycle. The word "loop" in coral handwriting in the middle.',
    spell: ['Hypothesis First', 'Guess', 'Learn', 'Test', 'loop'],
  },
  {
    slug: 'course-problem-01',
    title: 'Define the Problem',
    subtitle: 'Find the real question',
    diagram: 'a hand-drawn iceberg vertical stack on cream notebook paper with a dashed horizontal "surface" line near the top. Above the surface: a small box "Symptom". Below: three progressively wider boxes stacked downward labeled "Root", "Belief", "System". Coral-red annotation "real issue" upper-right.',
    spell: ['Define the Problem', 'Symptom', 'surface', 'Root', 'Belief', 'System', 'real issue'],
  },
  {
    slug: 'course-proposal-01',
    title: 'Persuasive Proposal',
    subtitle: 'Build proposals that move',
    diagram: 'a hand-drawn horizontal flow on cream notebook paper: a "Criteria" box on the left, a coral arrow pointing right to a "Proposal" box, then another coral arrow to a circled black check mark. Coral-red annotation "yes!" above the check.',
    spell: ['Persuasive Proposal', 'Criteria', 'Proposal', 'yes'],
  },
  {
    slug: 'course-proposal-course-01',
    title: 'Proposal Mastery',
    subtitle: 'Hypothesis-driven proposals',
    diagram: 'a hand-drawn document mockup on cream notebook paper: a rectangular page with folded top-right corner, titled "Proposal" with horizontal text lines below. Three coral checkmarks down the left margin. A coral handwritten "done" stamp in the lower-right.',
    spell: ['Proposal Mastery', 'Proposal', 'done'],
  },
  {
    slug: 'course-client-01',
    title: 'Number Sense',
    subtitle: 'Read situations through numbers',
    diagram: 'a hand-drawn approximation equation on cream notebook paper: large handwritten "≈ 120B" in the center with small "ballpark" label below. To the right: a small coral bar chart of 5 ascending bars. Coral-red annotation "feel figures" upper-right.',
    spell: ['Number Sense', 'ballpark', 'feel figures'],
  },
  {
    slug: 'course-client-02',
    title: 'Deep Listening',
    subtitle: 'Define issues, draw them out',
    diagram: 'a hand-drawn inverted trapezoid funnel on cream notebook paper with four labels stacked inside, narrowing downward: "open" (top, bold), "topics", "details", "decide" (bottom, coral). A small coral arrow drops out the bottom. Coral-red annotation "wide to deep" upper-right.',
    spell: ['Deep Listening', 'open', 'topics', 'details', 'decide', 'wide to deep'],
  },
  {
    slug: 'course-client-03',
    title: 'Ramp Up Fast',
    subtitle: 'Get up to speed in a new field',
    diagram: 'a hand-drawn learning curve on cream notebook paper: a coral-red S-curve rising from "Day 1" on the lower-left x-axis to "Day 30" on the right, plateauing at a filled coral dot labeled "expert". Black x and y axes drawn freehand. Coral-red annotation "expert mode" above the endpoint.',
    spell: ['Ramp Up Fast', 'Day 1', 'Day 30', 'expert', 'expert mode'],
  },
  {
    slug: 'course-client-04',
    title: 'Feedback Loop',
    subtitle: 'Turn feedback into next steps',
    diagram: 'a hand-drawn triangular loop on cream notebook paper: three boxes — "Insight" at top, "Feedback" at bottom-left, "Action" at bottom-right — connected by coral arrows. Coral-red annotation "level up" upper-right.',
    spell: ['Feedback Loop', 'Insight', 'Feedback', 'Action', 'level up'],
  },
  {
    slug: 'course-case-01',
    title: 'Case Interview',
    subtitle: 'Prove logical thinking in case interviews',
    diagram: 'a hand-drawn profit tree on cream notebook paper: top box "Profit" branches into "Revenue" and "Cost"; Revenue splits into "Vol" and "Price"; Cost splits into "Fix" and "Var". Coral-red annotation "structure first" upper-right.',
    spell: ['Case Interview', 'Profit', 'Revenue', 'Cost', 'Vol', 'Price', 'Fix', 'Var', 'structure first'],
  },
  {
    slug: 'course-strategy-01',
    title: 'Strategy Classics',
    subtitle: 'Origins of strategy and competition',
    diagram: 'a hand-drawn five-forces diagram on cream notebook paper: a central box labeled "Rivals" with four boxes around it — "Buyers" above, "Sellers" below, "New" left, "Subs" right — each connected to the central Rivals by a coral line. Coral-red label "five forces" sits in the upper-right.\n\nSpell the four outer labels EXACTLY: Buyers (B-U-Y-E-R-S), Sellers (S-E-L-L-E-R-S), New (N-E-W), Subs (S-U-B-S). The center label is Rivals (R-I-V-A-L-S). Use these short safe words; do NOT write Entrants, Suppliers, Substitutes, or Rivalry.',
    spell: ['Strategy Classics', 'Buyers', 'Sellers', 'New', 'Subs', 'Rivals', 'five forces'],
  },
  {
    slug: 'course-strategy-02',
    title: 'Modern Strategy',
    subtitle: 'Resources, capability, co-evolution',
    diagram: 'a hand-drawn hub-and-spoke network on cream notebook paper: a central coral oval labeled "Platform" with six small black ovals radiating outward, connected by thin coral lines. Coral-red annotation "co-evolve" upper-right.',
    spell: ['Modern Strategy', 'Platform', 'co-evolve'],
  },
  {
    slug: 'course-fermi-01',
    title: 'Fermi Estimation',
    subtitle: 'Grasp scale with quick estimates',
    diagram: 'a hand-drawn estimation equation on cream notebook paper: "100M × 0.4 × 300 ≈ 12B" in large handwritten figures, with small labels under each number: "people", "freq", "yen", "per year". A coral underline runs beneath the equation. Coral-red annotation "roughly right" upper-right.',
    spell: ['Fermi Estimation', 'people', 'freq', 'yen', 'per year', 'roughly right'],
  },
  {
    slug: 'course-numeracy-01',
    title: 'Numeracy',
    subtitle: 'Get strong with numbers',
    diagram: 'a hand-drawn bar chart on cream notebook paper: 5 coral bars labeled Q1 through Q5 along the x-axis, with Q5 the tallest. A dashed coral horizontal line crosses the middle labeled "avg". A small coral "+38%" label sits above Q5. Coral-red annotation "feel the math" upper-right.',
    spell: ['Numeracy', 'Q1', 'Q5', 'avg', 'feel the math'],
  },
  {
    slug: 'course-peak-performance-01',
    title: 'Peak Performance',
    subtitle: 'Work at your personal best',
    diagram: 'a hand-drawn sinusoidal energy wave on cream notebook paper running left to right between "morning" and "night" labels on the x-axis. Two filled coral dots at the wave\'s two crests labeled "peak". Coral-red annotation "ride the wave" upper-right.',
    spell: ['Peak Performance', 'morning', 'night', 'peak', 'ride the wave'],
  },
  {
    slug: 'course-eastern-01',
    title: 'Eastern Wisdom I',
    subtitle: 'Ancient Chinese thought on people',
    diagram: 'a hand-drawn 2x2 grid of four boxes on cream notebook paper. Each box contains ONLY an English name in hand-lettered marker, with NO Chinese characters: top-left "Confucius", top-right "Mencius", bottom-left "Xunzi", bottom-right "Mozi". Light dashed connectors link the boxes. Coral-red annotation "relations" upper-right.\n\nIMPORTANT: do NOT draw any Chinese / kanji / hanzi characters anywhere in the image. Only English names in marker handwriting.',
    spell: ['Eastern Wisdom I', 'Confucius', 'Mencius', 'Xunzi', 'Mozi', 'relations'],
  },
  {
    slug: 'course-eastern-02',
    title: 'Eastern Wisdom II',
    subtitle: 'Ancient Chinese thought on strategy',
    diagram: 'a hand-drawn 2x2 grid of four boxes on cream notebook paper. Each box contains ONLY an English name in hand-lettered marker, with NO Chinese characters: top-left "Laozi", top-right "Zhuangzi", bottom-left "Han Fei", bottom-right "Sun Tzu". Light dashed connectors link the boxes. Coral-red annotation "win without war" upper-right.\n\nIMPORTANT: do NOT draw any Chinese / kanji / hanzi characters anywhere in the image. Only English names in marker handwriting.',
    spell: ['Eastern Wisdom II', 'Laozi', 'Zhuangzi', 'Han Fei', 'Sun Tzu', 'win without war'],
  },
  {
    slug: 'course-philosophy-01',
    title: 'Philosophy',
    subtitle: 'Deepen thought with old questions',
    diagram: 'a hand-drawn dialectic triangle on cream notebook paper: a box labeled "Yes" upper-left connected by a dashed line labeled "vs" to a box labeled "No" upper-right; both converge with coral lines down to a box labeled "Truth" at the bottom-center. Coral-red annotation "what is real?" upper-right.\n\nUse the simple short words "Yes", "No", "Truth" only — do NOT attempt to write "Antithesis" or "Synthesis" (Gemini consistently misspells those).',
    spell: ['Philosophy', 'Yes', 'No', 'Truth', 'vs', 'what is real'],
  },
  {
    slug: 'course-design-01',
    title: 'Design Thinking',
    subtitle: 'Dig into users, then solve',
    diagram: 'a hand-drawn horizontal sequence of five rounded pill boxes on cream notebook paper: "Feel" → "Frame" → "Ideas" → "Make" → "Test". A coral bracket arches over the row labeled "iterate". Coral-red annotation "empathy" at the right end of the bracket.',
    spell: ['Design Thinking', 'Feel', 'Frame', 'Ideas', 'Make', 'Test', 'iterate', 'empathy'],
  },
  {
    slug: 'course-lateral-01',
    title: 'Lateral Thinking',
    subtitle: 'Doubt convention, find the gap',
    diagram: 'a hand-drawn detour path on cream notebook paper: a small "obvious" box on the left connected by a dashed horizontal line straight across to a "solution" box on the right. A coral solid line dips down from the obvious box, runs along the bottom, then sharply rises up to the solution box. Coral-red annotation "flip it" above the right peak.',
    spell: ['Lateral Thinking', 'obvious', 'solution', 'flip it'],
  },
  {
    slug: 'course-analogy-01',
    title: 'Analogy Thinking',
    subtitle: 'Borrow wisdom from other fields',
    diagram: 'a hand-drawn two-box mapping on cream notebook paper: left box "Nature" with subtitle "bird wing", coral arrow pointing right labeled "borrow", right box "Business" with subtitle "airplane wing". Coral-red annotation "like that" upper-right.',
    spell: ['Analogy Thinking', 'Nature', 'bird wing', 'Business', 'airplane wing', 'borrow', 'like that'],
  },
  {
    slug: 'course-systems-01',
    title: 'Systems Thinking',
    subtitle: 'See the whole, change the root',
    diagram: 'a hand-drawn causal loop on cream notebook paper: two ovals labeled "cause" left and "effect" right connected by two coral arrows forming a feedback loop — top arrow points right with a "+" label, bottom arrow points left with a "+" label. Below: a short dashed coral segment labeled "lever". Coral-red annotation "see the whole" upper-right.',
    spell: ['Systems Thinking', 'cause', 'effect', 'lever', 'see the whole'],
  },
  {
    slug: 'course-whywhy-01',
    title: '5 Whys',
    subtitle: 'Reach the root by asking why',
    diagram: 'a hand-drawn vertical ladder of five stacked boxes on cream notebook paper: top "Problem", then "Why 1", "Why 2", "Why 3", and bottom "Root" in coral. Coral handwritten "why?" labels between each pair of boxes. Coral-red annotation "dig deeper" upper-right.',
    spell: ['5 Whys', 'Problem', 'Why 1', 'Why 2', 'Why 3', 'Root', 'why', 'dig deeper'],
  },

  // ── 新規追加: issue-01 「論点を洗い出し、論理で答えに迫る」 ──
  {
    slug: 'course-issue-01',
    title: 'Issue Analysis',
    subtitle: 'Find the right questions to answer',
    diagram: 'a hand-drawn issue tree on cream notebook paper: a top box "Main Issue" branches down into three middle boxes "Sub A", "Sub B", "Sub C", each splitting further into two small leaf boxes labeled "fact". Coral underlines run beneath the bottom row of facts. Coral-red annotation "structure it" upper-right.',
    spell: ['Issue Analysis', 'Main Issue', 'Sub A', 'Sub B', 'Sub C', 'fact', 'structure it'],
  },

  // ── 新規追加: cognitive-01 「ワーキングメモリを使いこなす」 ──
  {
    slug: 'course-cognitive-01',
    title: 'Working Memory',
    subtitle: 'Hold less, think more',
    diagram: 'a hand-drawn brain-desk diagram on cream notebook paper: a large rounded rectangle in the center labeled "Brain Desk" (the working desk of the mind), with seven small square slots arranged in a row inside it, each containing a tiny coral dot. Above the row floats a coral handwritten label "7 ± 2". To the right of the box, a stack of three folder-like rectangles labeled "Notes", "Files", "Apps" with a coral arrow pointing from them into the brain-desk, marked "offload". Coral-red annotation "limit your load" upper-right.\n\nUse the simple short labels "Brain Desk", "Notes", "Files", "Apps", "7 ± 2", "offload", "limit your load" only — do NOT attempt to write "working memory capacity", "chunking", "cognitive load", or "external memory" anywhere in the image (Gemini tends to misspell long words).',
    spell: ['Working Memory', 'Hold less, think more', 'Brain Desk', 'Notes', 'Files', 'Apps', '7 ± 2', 'offload', 'limit your load'],
  },

  // ── 新規追加: cognitive-02 「認知バイアスを実務で乗りこなす」 ──
  {
    slug: 'course-cognitive-02',
    title: '5 Biases',
    subtitle: 'Spot 5, decide better',
    diagram: 'a hand-drawn 2x3 grid of six small boxes on cream notebook paper, but only five are filled — each filled box contains one short label in marker handwriting: top-left "Avail", top-middle "Halo", top-right "Hind", bottom-left "D-K", bottom-middle "Outcome". The sixth box (bottom-right) is empty and faintly outlined. Above the grid: a small pair of hand-drawn coral eyeglasses labeled "lens". Coral-red annotation "spot bias" upper-right.\n\nUse ONLY these short safe labels: "Avail", "Halo", "Hind", "D-K", "Outcome", "lens", "spot bias". Do NOT attempt to write "availability", "hindsight", "Dunning-Kruger", "outcome bias", or "cognitive bias" (Gemini consistently misspells long words).',
    spell: ['5 Biases', 'Spot 5, decide better', 'Avail', 'Halo', 'Hind', 'D-K', 'Outcome', 'lens', 'spot bias'],
  },

  // ── 新規追加: documentation-01 「伝わるドキュメンテーション」 ──
  {
    slug: 'course-documentation-01',
    title: 'Slide Craft',
    subtitle: 'Make decks that land',
    diagram: 'a hand-drawn slide deck mockup on cream notebook paper: three rectangular slide frames arranged in a horizontal row, slightly overlapping like a deck. The left slide shows a big bold "Title" line on top and three short text lines below. The middle slide shows a simple bar chart with three coral bars. The right slide shows a 2x2 grid with one cell filled coral. Each slide has a small page number ("1", "2", "3") in the bottom-right corner. Above the deck a coral handwritten label "1 idea / slide". Coral-red annotation "make it land" upper-right.\n\nUse ONLY these short safe labels: "Title", "1 idea / slide", "make it land", "1", "2", "3". Do NOT attempt to write "DOCUMENTATION", "PRESENTATION", "typography", "layout", or any long word (Gemini consistently misspells long words).',
    spell: ['Slide Craft', 'Make decks that land', 'Title', '1 idea / slide', 'make it land', '1', '2', '3'],
  },

  // ── 新規追加: fermi-02 「フェルミ推定の 6 つの分解パターン」 ──
  {
    slug: 'course-fermi-02',
    title: '6 Patterns',
    subtitle: 'Pick the right pattern',
    diagram: 'a hand-drawn 2x3 grid of six small square boxes on cream notebook paper, each containing one simple icon and one short label in marker handwriting below the icon. Top-left: a small stick-figure person with label "people". Top-middle: a tall narrow building with label "biz". Top-right: a small grid mesh square with label "area". Bottom-left: a small "x" multiplication symbol with label "unit". Bottom-middle: an upward arrow with label "macro". Bottom-right: a small magnifying glass with label "micro". Above the grid: a coral handwritten label "decode". Coral-red annotation "pick one" upper-right.\n\nUse ONLY these short safe labels: "people", "biz", "area", "unit", "macro", "micro", "decode", "pick one". Do NOT attempt to write "DECOMPOSITION", "ESTIMATION", "toolkit", "household", "corporate", "cross-check", or any long word (Gemini consistently misspells long words).',
    spell: ['6 Patterns', 'Pick the right pattern', 'Pick', 'right', 'pattern', 'people', 'biz', 'area', 'unit', 'macro', 'micro', 'decode', 'pick one'],
  },

  // ── 新規追加: fermi-03 「実践編：超易〜コンサル級フェルミ」 ──
  {
    slug: 'course-fermi-03',
    title: 'Easy → Hard',
    subtitle: 'Practice sets for Fermi',
    diagram: 'a hand-drawn ascending staircase of five rectangular steps on cream notebook paper, rising from lower-left to upper-right. Each step has a small icon centered on it and a short label in marker handwriting just below the step. Step 1 (lowest, left): a small classroom desk icon, label "L1 class". Step 2: a coffee cup icon, label "L2 cafe". Step 3 (middle): a small bar chart icon, label "L3 biz". Step 4: a briefcase icon, label "L4 firm". Step 5 (highest, upper-right): a small question mark icon, label "L5 idea". A coral arrow runs diagonally up alongside the staircase from lower-left to upper-right, labeled "level up". Coral-red annotation "easy to hard" upper-right.\n\nUse ONLY these short safe labels: "L1 class", "L2 cafe", "L3 biz", "L4 firm", "L5 idea", "level up", "easy to hard". Do NOT attempt to write "PRACTICE", "CONSULTING", "industry", "abstract", or any long word (Gemini consistently misspells long words).',
    spell: ['Easy → Hard', 'Practice sets for Fermi', 'L1 class', 'L2 cafe', 'L3 biz', 'L4 firm', 'L5 idea', 'level up', 'easy to hard'],
  },

  // ── 新規追加: listening-01 「構造化リスニングで本音を引き出す」 ──
  {
    slug: 'course-listening-01',
    title: 'Deep Listen',
    subtitle: 'Beyond passive hearing',
    diagram: 'a hand-drawn diagram on cream notebook paper combining a large ear shape and a three-layer decoder on the right two-thirds. On the left of the right portion: a clearly hand-drawn human ear outline in thick black marker, roughly fist-sized. A coral arrow flows out of the ear to the right toward a small vertical stack of three horizontal labeled rectangles, stacked top to bottom: top "fact", middle "feel", bottom "view" (the "view" box has a slightly thicker coral underline). Above the stack: a small cursive label "decode". Below the stack: cursive annotation "three layers".\n\nUse ONLY these short safe labels: "fact", "feel", "view", "decode", "three layers". Do NOT attempt to write "STRUCTURED LISTENING", "interpretation", "emotion", "paraphrase", or any long word (Gemini consistently misspells long words).',
    spell: ['Deep Listen', 'Beyond passive hearing', 'fact', 'feel', 'view', 'decode', 'three layers'],
  },

  // ── 新規追加: adhd-leverage-01 「ADHD レバレッジ — 特性を資源として活かす」 ──
  // 注: 矯正・治療ニュアンス NG。「凸凹を肯定的に描く」トーン厳守。
  {
    slug: 'course-adhd-leverage-01',
    title: 'ADHD Leverage',
    subtitle: 'Traits as assets',
    diagram: 'a hand-drawn diagram on cream notebook paper showing two interlocking jigsaw puzzle pieces with bumpy edges in the right two-thirds of the page. The left piece is a slightly larger irregular puzzle piece labeled in cursive "you" with four small coral icons arranged inside it: a flame (focus), a starburst (ideas), a lightning bolt (speed), and a compass (new). The right piece is a smaller mirrored puzzle piece labeled in cursive "fit" — representing the right environment that matches the unique shape. The two pieces interlock tightly in the middle. Above the joined pieces: a small cursive label "match". Below: cursive annotation "shape fits shape".\n\nIMPORTANT: the puzzle pieces should look celebratory and clean, NEVER broken or jagged in a negative way. The four icons on the "you" piece must feel like assets / strengths, not symptoms. Avoid any imagery suggesting "fixing", "disorder", or "treatment".\n\nUse ONLY these short safe labels: "you", "fit", "match", "shape fits shape". Do NOT attempt to write "ADHD", "leverage", "neurodiversity", "hyperfocus", or any long word (Gemini consistently misspells long words).',
    spell: ['ADHD Leverage', 'Traits as assets', 'you', 'fit', 'match', 'shape fits shape'],
  },
]
