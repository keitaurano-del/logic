/**
 * Career category thumbnail prompts.
 *
 * - 5 course thumbnails (course-career-*.png, 16:9 landscape)
 * - 35 lesson thumbnails (lesson-600 to lesson-646, 1:1 square)
 *
 * Same hand-drawn notebook style as the lesson v2 batch (2026-05-19)
 * — cream paper, black marker line work, coral underlines, no decorations.
 */

import { titleCase, type LessonPromptEntry } from './lessonPromptsV2.ts'

// ────────────────────────────────────────────────────────────────────────────
// Landscape (16:9) style for course thumbnails — title-left, diagram-right
// ────────────────────────────────────────────────────────────────────────────
const STYLE_COURSE = `
Hand-drawn 2D illustration on cream-colored ruled notebook paper.
Background: warm beige cream paper, with thin light coral pink horizontal ruled lines spaced evenly across, three small round binder holes on the left margin, very subtle paper texture.

Aesthetic: a thoughtful student's clean study notebook page. Drawn entirely with a black marker pen — clean confident line work with slight natural ink variation. Body annotations in casual cursive handwriting.

TITLE STYLE — most important rule:
The main title at top-left must be hand-lettered in a chunky relaxed marker handwriting like the Google font "Caveat" — friendly, semi-bold, slightly playful, with naturally flowing strokes. Use Title Case (mixed upper and lower case letters, e.g. "Logic Tree" or "Ramp Up Fast"), NOT all uppercase block letters. The letters lean slightly to the right with a casual rhythm, the strokes have slight thickness variation as a marker would produce. Quick confident hand-lettering — not a typed font, not block capital letters, not formal calligraphy.

UNDERLINE STYLE — second most important rule:
Below the title, draw a single hand-drawn coral red underline as one flowing marker swipe. It must look like a quick brush gesture: slightly tapered at one or both ends, with natural ink variation in thickness, never a perfectly straight ruler-drawn line. The underline can curve very subtly or swoosh upward at the tail. One continuous stroke, not multiple lines.

Color palette (use as accents only, not as labels):
- Warm cream beige paper base
- Coral red (for underlines and small accent marks)
- Sage green, navy blue, mustard yellow (use sparingly for small accent fills)
Primarily black-line drawing with light color accents. Do not fill large areas with bright color.

CRITICAL — do NOT write any hex color codes, RGB values, color names, or any other technical reference text inside the image. The image must contain only the title, the diagram labels, and the handwritten annotations described — nothing else.

Composition: landscape 16:9 wide format. Title at the left third of the canvas (top-left, hand-lettered). Diagram occupies the right two-thirds of the canvas. Optional short handwritten note below the title.

NO decorative elements: NO stars, NO sparkles, NO scattered ink dots, NO floating doodles, NO ornamental marks of any kind. The page should look clean and purposeful — every element must serve the diagram.

Do NOT include: photorealism, 3D rendering, isometric perspective, dark backgrounds, gradients, cinematic lighting, busy textures, glow effects, computer-graphics polish, decorative borders.

Text rules: every visible text — including the title — must be hand-lettered with a marker, drawn letter-by-letter. No printed/typeset/computer fonts whatsoever. Spelling must be perfectly correct (re-check every word). Maximum 3-4 short handwritten annotations near the diagram (max 5 English words each).
`.trim()

export function buildCoursePrompt(entry: LessonPromptEntry): string {
  const displayTitle = titleCase(entry.title)
  const spellSection = entry.spell?.length
    ? `

CRITICAL SPELLING ENFORCEMENT — every one of the following words MUST appear in the image with its letters in exactly this order, no missing letters, no extra letters, no swapped letters:
${entry.spell.map((w) => `  • "${w}"`).join('\n')}
If you cannot draw a word with perfect spelling, leave it out rather than misspell it.
`
    : ''
  return `${STYLE_COURSE}

---

Topic: ${displayTitle} — a hand-drawn notebook COURSE thumbnail (16:9 landscape).

Left third of the page: hand-lettered title "${displayTitle}" rendered in Caveat-style chunky marker handwriting (Title Case with mixed upper and lower case letters — e.g. "Logic Tree" or "Ramp Up Fast" — NOT all uppercase block letters). Stack over two lines if needed. Semi-bold marker strokes with slight playful rightward slant. Below the title: a single flowing hand-drawn coral red underline marker swipe with slightly tapered ends and natural ink variation. Just below the underline, the smaller hand-lettered cursive subtitle: "${entry.subtitle}".

Right two-thirds of the page: ${entry.diagram}

That is the entire content. The page contains only: the title, its coral underline, the subtitle, and the diagram described above with its labels and 2-3 short annotations. Nothing else. No icons, no stars, no extra doodles, no decorative dots, no borders.${spellSection}
`.trim()
}

// ────────────────────────────────────────────────────────────────────────────
// 5 Course thumbnails (16:9)
// ────────────────────────────────────────────────────────────────────────────
export const CAREER_COURSE_PROMPTS: LessonPromptEntry[] = [
  {
    slug: 'course-career-resume-01',
    title: 'RESUME',
    subtitle: 'Land the interview',
    diagram: `a hand-drawn rectangular resume document on the right, with three labeled sections stacked from top to bottom: "Summary", "Experience", "Skills". A magnifying glass hovers over the top section. To the left of the resume, three short stacked check marks indicate the document has been refined.`,
    spell: ['RESUME', 'Land the interview', 'Summary', 'Experience', 'Skills'],
  },
  {
    slug: 'course-career-spi-01',
    title: 'SPI',
    subtitle: 'Aptitude test essentials',
    diagram: `a hand-drawn worksheet with a 3x3 grid of small math problems on the upper portion (using simple "+", "−", "×", "÷" symbols and small numbers like "12", "8", "?"), and a small stopwatch icon at the bottom right with the cursive label "speed". A short pencil rests diagonally across the worksheet.`,
    spell: ['SPI', 'Aptitude test essentials', 'speed'],
  },
  {
    slug: 'course-career-tamatebako-01',
    title: 'TAMATEBAKO',
    subtitle: 'Web test mastery',
    diagram: `a hand-drawn computer monitor in the center showing a simplified bar chart inside the screen with the label "data" above it. To the right of the monitor: a small stopwatch with the cursive label "9 min". Below the monitor: cursive annotation "read fast".`,
    spell: ['TAMATEBAKO', 'Web test mastery', 'data', '9 min', 'read fast'],
  },
  {
    slug: 'course-career-interview-01',
    title: 'INTERVIEW',
    subtitle: 'Win the offer',
    diagram: `two hand-drawn simple stick figures facing each other across a small rectangular table. Above the right figure: a speech bubble with a single cursive word "STAR". The left figure has a small notepad in hand. Cursive annotation below: "be specific".`,
    spell: ['INTERVIEW', 'Win the offer', 'STAR', 'be specific'],
  },
  {
    slug: 'course-career-salary-01',
    title: 'SALARY',
    subtitle: 'Negotiate your worth',
    diagram: `a hand-drawn balance scale on the right side, with stacked coin shapes on the left pan (labeled "your value") and a small rectangular card on the right pan (labeled "offer"). Above the scale: cursive annotation "find the fair line".`,
    spell: ['SALARY', 'Negotiate your worth', 'your value', 'offer', 'find the fair line'],
  },
]

// ────────────────────────────────────────────────────────────────────────────
// 35 Lesson thumbnails (1:1) — use lessonPromptsV2's buildPrompt
// ────────────────────────────────────────────────────────────────────────────
export const CAREER_LESSON_PROMPTS: LessonPromptEntry[] = [
  // ── 履歴書 (Resume) 600-606 ─────────────────────────────────
  {
    slug: 'lesson-600',
    title: '6 SECONDS',
    subtitle: 'How HR scans a resume',
    diagram: `a hand-drawn rectangular resume document in the center. Above it: a small stopwatch showing "6 sec" in cursive. To the left of the resume: three horizontal filter bars labeled "skim", "match", "deep" stacked vertically. Cursive annotation: "pass each gate".

CRITICAL — the subtitle MUST be the five English words "How HR scans a resume" with each word fully separated. Do NOT use the word "recruiters" — it is replaced by the two letters "HR".`,
    spell: ['6 SECONDS', 'How HR scans a resume', 'HR', 'scans', 'resume', '6 sec', 'skim', 'match', 'deep', 'pass each gate'],
  },
  {
    slug: 'lesson-601',
    title: 'STAR METHOD',
    subtitle: 'Show the same way you win',
    diagram: `four hand-drawn rectangular boxes arranged vertically, connected by short downward arrows, each labeled with a single bold letter and word in cursive: top box "S — Situation", second "T — Task", third "A — Action", bottom "R — Result". The "A" box is drawn thicker than the others. Cursive annotation: "Action is biggest".`,
    spell: ['STAR METHOD', 'Show the same way you win', 'Situation', 'Task', 'Action', 'Result', 'Action is biggest'],
  },
  {
    slug: 'lesson-602',
    title: 'USE NUMBERS',
    subtitle: 'Turn vague into vivid',
    diagram: `two hand-drawn rectangular cards side by side. Left card labeled "vague" contains a wavy squiggle of text. Right card labeled "vivid" contains short lines with hand-drawn numbers like "20%", "3 months", "5 people". A right-pointing arrow connects left to right. Cursive annotation: "scale shows".`,
    spell: ['USE NUMBERS', 'Turn vague into vivid', 'vague', 'vivid', '20%', '3 months', '5 people', 'scale shows'],
  },
  {
    slug: 'lesson-603',
    title: 'SELF-PR',
    subtitle: 'Match your strength to the role',
    diagram: `two overlapping hand-drawn circles in the center (a simple Venn diagram). Left circle labeled "Strength", right circle labeled "Role". The overlap region is shaded lightly with the cursive label "fit". Cursive annotation: "speak to the overlap".`,
    spell: ['SELF-PR', 'Match your strength to the role', 'Strength', 'Role', 'fit', 'speak to the overlap'],
  },
  {
    slug: 'lesson-604',
    title: 'WHY US',
    subtitle: 'Industry, company, role',
    diagram: `a hand-drawn three-tier pyramid built from rectangular boxes: top label "Role", middle "Company", bottom "Industry". Thick black marker borders, cream interior. Cursive annotation: "make all three true".`,
    spell: ['WHY US', 'Industry, company, role', 'Role', 'Company', 'Industry', 'make all three true'],
  },
  {
    slug: 'lesson-605',
    title: 'PASS ATS',
    subtitle: 'Get past the AI filter',
    diagram: `a hand-drawn rectangular resume document flowing through a vertical filter mesh in the middle of the canvas (drawn as a slatted grid). To the right of the filter: a small robot face icon labeled "ATS". The resume comes out clean on the right side. Cursive annotation: "match the keywords".`,
    spell: ['PASS ATS', 'Get past the AI filter', 'ATS', 'match the keywords'],
  },
  {
    slug: 'lesson-606',
    title: 'CASE PRACTICE',
    subtitle: 'Tune by role',
    diagram: `three hand-drawn resume cards side by side, each labeled at the top in cursive: "Sales", "Planning", "Career change". Each card has slightly different highlight bars on it. Cursive annotation below: "same person, different cut".`,
    spell: ['CASE PRACTICE', 'Tune by role', 'Sales', 'Planning', 'Career change', 'same person, different cut'],
  },

  // ── SPI 610-616 ────────────────────────────────────────────
  {
    slug: 'lesson-610',
    title: 'SPI 101',
    subtitle: 'Formats and timing',
    diagram: `four hand-drawn small computer monitor icons in a 2x2 grid, each labeled in cursive: top-left "Test Center", top-right "Web", bottom-left "Paper", bottom-right "Inhouse". Cursive annotation: "pick your format".`,
    spell: ['SPI 101', 'Formats and timing', 'Test Center', 'Web', 'Paper', 'Inhouse', 'pick your format'],
  },
  {
    slug: 'lesson-611',
    title: 'RATIOS',
    subtitle: 'Percent, profit, splitting cost',
    diagram: `a hand-drawn equation in the center: "Profit = Sale − Cost" written in marker. Below it: a small pie chart with a slice highlighted, labeled "%". To the right: two stick figures with a small bill between them labeled "split".`,
    spell: ['RATIOS', 'Percent, profit, splitting cost', '%', 'split'],
  },
  {
    slug: 'lesson-612',
    title: 'SPEED MATH',
    subtitle: 'Distance, work, age',
    diagram: `three hand-drawn small icons arranged left to right: a runner with a small arrow labeled "speed", a clock face labeled "work", and two age tags labeled "now / later". Connected by short horizontal arrows. Cursive annotation: "set the variable".`,
    spell: ['SPEED MATH', 'Distance, work, age', 'speed', 'work', 'now / later', 'set the variable'],
  },
  {
    slug: 'lesson-613',
    title: 'COMBINATORICS',
    subtitle: 'Permutations and odds',
    diagram: `a hand-drawn pair of dice in the center showing dots, with a small fraction "1/6" floating above them. To the left: three letters "A B C" with curved arrows showing reordering, labeled "order matters". Cursive annotation: "count carefully".`,
    spell: ['COMBINATORICS', 'Permutations and odds', 'A B C', '1/6', 'order matters', 'count carefully'],
  },
  {
    slug: 'lesson-614',
    title: 'INFERENCE',
    subtitle: 'Hardest non-verbal section',
    diagram: `a hand-drawn truth table with three columns labeled "A", "B", "Conclusion" and three rows of T/F entries. To the right: a thinking head silhouette with a small "?" above. Cursive annotation: "deduce only what is given".`,
    spell: ['INFERENCE', 'Hardest non-verbal section', 'A', 'B', 'Conclusion', 'deduce only what is given'],
  },
  {
    slug: 'lesson-615',
    title: 'VERBAL',
    subtitle: 'Word pairs and reading',
    diagram: `a hand-drawn pair of word boxes side by side connected by a double-headed arrow, the left box labeled "dog", the right labeled "animal", with the cursive relation "kind of" between them. Below: a small open book icon with a few squiggle lines labeled "passage".`,
    spell: ['VERBAL', 'Word pairs and reading', 'dog', 'animal', 'kind of', 'passage'],
  },
  {
    slug: 'lesson-616',
    title: 'PERSONALITY',
    subtitle: 'Pacing across the test',
    diagram: `a hand-drawn horizontal timeline running across the canvas with four small segments labeled "verbal", "non-verbal", "personality", "wrap". A small clock at each segment break. Cursive annotation: "spend by section".`,
    spell: ['PERSONALITY', 'Pacing across the test', 'verbal', 'non-verbal', 'personality', 'wrap', 'spend by section'],
  },

  // ── 玉手箱 (Tamatebako) 620-625 ────────────────────────────
  {
    slug: 'lesson-620',
    title: 'TAMATEBAKO',
    subtitle: 'Web test #2 in Japan',
    diagram: `a hand-drawn computer monitor in the center showing a simple grid of test problems inside. To the right of the monitor: a small comparison label "vs SPI" with a short list of two bullet points: "fixed format", "speed wins". Cursive annotation: "fast & rigid".`,
    spell: ['TAMATEBAKO', 'Web test #2 in Japan', 'vs SPI', 'fixed format', 'speed wins', 'fast & rigid'],
  },
  {
    slug: 'lesson-621',
    title: 'INVERSE MATH',
    subtitle: '50 questions, 9 minutes',
    diagram: `a hand-drawn equation in the center: "? × 4 + 8 = 32" written in thick marker, with the "?" enclosed in a small box. To the right: a small stopwatch labeled "9 min". Cursive annotation: "isolate the unknown".`,
    spell: ['INVERSE MATH', '50 questions, 9 minutes', '9 min', 'isolate the unknown'],
  },
  {
    slug: 'lesson-622',
    title: 'READ CHARTS',
    subtitle: 'Question first, chart second',
    diagram: `a hand-drawn bar chart on the left with three vertical bars of different heights. To the right of the chart: a question card with a coral red arrow pointing FROM the question TO the chart. Cursive annotation: "read question first".`,
    spell: ['READ CHARTS', 'Question first, chart second', 'read question first'],
  },
  {
    slug: 'lesson-623',
    title: 'FILL THE BLANK',
    subtitle: 'Spot the pattern',
    diagram: `a hand-drawn 3x3 grid with numbers in 8 cells: "2 4 6 / 8 ? 12 / 14 16 18". The center cell has a "?" inside a small box. Cursive annotation: "find the rule".`,
    spell: ['FILL THE BLANK', 'Spot the pattern', '2 4 6', '8 ? 12', '14 16 18', 'find the rule'],
  },
  {
    slug: 'lesson-624',
    title: 'VERBAL READ',
    subtitle: 'Logical reading and intent',
    diagram: `a hand-drawn open book in the center with a few squiggle lines representing text. Above the book: three small icons stacked vertically labeled "main idea", "tone", "fact". Cursive annotation: "what is the author saying".`,
    spell: ['VERBAL READ', 'Logical reading and intent', 'main idea', 'tone', 'fact', 'what is the author saying'],
  },
  {
    slug: 'lesson-625',
    title: 'ENGLISH READ',
    subtitle: 'GAB and IMAGES formats',
    diagram: `two hand-drawn open book icons side by side. Left book labeled "GAB", right book labeled "IMAGES". Each book shows a few squiggle lines. Below: a small flag with cursive "EN" indicating English passages. Cursive annotation: "skim, then scan".`,
    spell: ['ENGLISH READ', 'GAB and IMAGES formats', 'GAB', 'IMAGES', 'EN', 'skim, then scan'],
  },

  // ── 面接 (Interview) 630-637 ───────────────────────────────
  {
    slug: 'lesson-630',
    title: 'INTERVIEW',
    subtitle: 'Hidden scoring grid',
    diagram: `two hand-drawn simple stick figures facing each other across a small table. Behind the right figure: a hidden clipboard standing upright, large enough to show three clear text rows. The clipboard contains three short cursive words stacked vertically in a vertical list, each word on its own line with generous blank vertical space between lines so the rows never touch or merge. Each line shows ONLY the word itself — no leading bullet, no leading checkbox, no leading symbol, no leading dash, no leading letters. Top line word: "fit". Middle line word: "ability". Bottom line word: "drive". The left figure does not see the clipboard. Cursive annotation to the right of the clipboard: "they score, not chat".

CRITICAL — the clipboard MUST show exactly three plain words with NO checkboxes, NO bullets, NO ampersands, NO leading characters of any kind. Each line is just one clean cursive word and nothing else: line 1 is the three letters f-i-t and nothing more, line 2 is the seven letters a-b-i-l-i-t-y and nothing more, line 3 is the five letters d-r-i-v-e and nothing more. Do NOT prepend "&", "ad", "ft", "fft", or any other characters to any word. Each word stands totally alone on its line.`,
    spell: ['INTERVIEW', 'Hidden scoring grid', 'fit', 'ability', 'drive', 'they score, not chat'],
  },
  {
    slug: 'lesson-631',
    title: 'OPENING 90',
    subtitle: 'First 90 seconds decide the flow',
    diagram: `a hand-drawn horizontal timeline with four small numbered segments labeled "intro", "role", "win", "ask". A small stopwatch above the timeline shows "90 s". Cursive annotation: "plant deep-dive hooks".`,
    spell: ['OPENING 90', 'First 90 seconds decide the flow', 'intro', 'role', 'win', 'ask', '90 s', 'plant deep-dive hooks'],
  },
  {
    slug: 'lesson-632',
    title: 'WHY I LEFT',
    subtitle: 'Turn negative into forward',
    diagram: `a hand-drawn arrow starting from a small rectangular card labeled "old job" on the left, curving upward to a brighter card on the right labeled "next step". Below the arrow: a short coral cross-out on the word "blame". Cursive annotation: "look forward".`,
    spell: ['WHY I LEFT', 'Turn negative into forward', 'old job', 'next step', 'blame', 'look forward'],
  },
  {
    slug: 'lesson-633',
    title: 'WHY YOU',
    subtitle: 'Industry, company, role',
    diagram: `a hand-drawn three-tier pyramid: top box "Role", middle "Company", bottom "Industry". To the right of the pyramid: three short cursive annotations connected by lines: "fit", "match", "story". Cursive annotation: "all three align".`,
    spell: ['WHY YOU', 'Industry, company, role', 'Role', 'Company', 'Industry', 'fit', 'match', 'story', 'all three align'],
  },
  {
    slug: 'lesson-634',
    title: 'STAR REPLY',
    subtitle: 'Show patterns, not luck',
    diagram: `four hand-drawn rectangular boxes arranged vertically, each labeled "S", "T", "A", "R" with a thicker border around the "A" box. To the right: a small thought-bubble labeled "behavior". Cursive annotation: "be concrete".`,
    spell: ['STAR REPLY', 'Show patterns, not luck', 'S', 'T', 'A', 'R', 'behavior', 'be concrete'],
  },
  {
    slug: 'lesson-635',
    title: 'WEAKNESS',
    subtitle: 'Self-awareness wins',
    diagram: `a hand-drawn cursive label "weakness" at the top with a downward arrow pointing to a small rectangular card labeled "what I learned" and a second arrow pointing to "how I improved". Three short horizontal lines under each card. Cursive annotation: "show growth".`,
    spell: ['WEAKNESS', 'Self-awareness wins', 'weakness', 'what I learned', 'how I improved', 'show growth'],
  },
  {
    slug: 'lesson-636',
    title: 'YOUR QUESTIONS',
    subtitle: 'Ask things that score',
    diagram: `a hand-drawn vertical list of three cursive question lines, each ending in a "?": "team flow", "first 90 days", "biggest gap". To the right of the list: a small coral ✓ mark. Cursive annotation: "show your homework".`,
    spell: ['YOUR QUESTIONS', 'Ask things that score', 'team flow', 'first 90 days', 'biggest gap', 'show your homework'],
  },
  {
    slug: 'lesson-637',
    title: 'FINAL ROUND',
    subtitle: 'Executive and culture fit',
    diagram: `two hand-drawn simple silhouette figures: one in business suit on the right (executive), one stick figure on the left (you). Between them: a small thought-bubble with the cursive word "fit". Cursive annotation: "think long-term".`,
    spell: ['FINAL ROUND', 'Executive and culture fit', 'fit', 'think long-term'],
  },

  // ── 給与・キャリア選択 (Salary) 640-646 ─────────────────────
  {
    slug: 'lesson-640',
    title: 'MARKET VALUE',
    subtitle: 'Know the number first',
    diagram: `a hand-drawn vertical thermometer scale on the right with three marks: top "high", middle "fair", bottom "low". To the left of the scale: a small stick figure labeled "you" pointing at the middle mark. Cursive annotation: "set your floor".`,
    spell: ['MARKET VALUE', 'Know the number first', 'high', 'fair', 'low', 'you', 'set your floor'],
  },
  {
    slug: 'lesson-641',
    title: 'OFFER MEETING',
    subtitle: 'The post-offer session',
    diagram: `a hand-drawn vertical checklist on the right with seven empty squares (some checked with ✓) labeled in tiny cursive: "salary", "bonus", "benefits", "title", "team", "start", "WFH". To the left: a stick figure with a notepad. Cursive annotation: "ask everything once".`,
    spell: ['OFFER MEETING', 'The post-offer session', 'salary', 'bonus', 'benefits', 'title', 'team', 'start', 'WFH', 'ask everything once'],
  },
  {
    slug: 'lesson-642',
    title: 'ASK FOR MORE',
    subtitle: 'Bridge the offer gap',
    diagram: `a hand-drawn balance scale in the center. Left pan labeled "offer", right pan labeled "your value". A coral arrow points to the small space between the pans labeled "gap". Cursive annotation below the scale: "bridge it".`,
    spell: ['ASK FOR MORE', 'Bridge the offer gap', 'offer', 'your value', 'gap', 'bridge it'],
  },
  {
    slug: 'lesson-643',
    title: 'ACCEPT OR DECLINE',
    subtitle: 'Handle multiple offers',
    diagram: `two hand-drawn rectangular envelope icons side by side. Left envelope marked with ✓ labeled "Offer A". Right envelope with a small coral cross labeled "Offer B". Cursive annotation: "respect both sides".`,
    spell: ['ACCEPT OR DECLINE', 'Handle multiple offers', 'Offer A', 'Offer B', 'respect both sides'],
  },
  {
    slug: 'lesson-644',
    title: 'GIVE NOTICE',
    subtitle: 'Letter and timing',
    diagram: `a hand-drawn calendar grid in the center showing four weeks, with a small flag marker on a specific day labeled "notice day". To the right: a small letter envelope labeled "letter". Cursive annotation: "two weeks ahead".`,
    spell: ['GIVE NOTICE', 'Letter and timing', 'notice day', 'letter', 'two weeks ahead'],
  },
  {
    slug: 'lesson-645',
    title: 'COUNTER-OFFER',
    subtitle: 'Stay graceful when pressed',
    diagram: `two hand-drawn stick figures facing each other. The right figure (boss) holds a small card labeled "stay?". The left figure (you) faces forward with a calm short arrow labeled "next chapter" pointing right. Cursive annotation: "thank, then leave".`,
    spell: ['COUNTER-OFFER', 'Stay graceful when pressed', 'stay?', 'next chapter', 'thank, then leave'],
  },
  {
    slug: 'lesson-646',
    title: 'HANDOVER',
    subtitle: 'Pay, tax, time off',
    diagram: `a hand-drawn vertical checklist with three rows, each row a small empty checkbox and a cursive label: "insurance", "tax", "PTO". Below the list: a single hand-drawn checkmark "✓" followed by the cursive label "clean exit". Thick marker outlines. Do NOT include any emoji, face, smiley, or pictogram — only marker line-work and cursive text.`,
    spell: ['HANDOVER', 'Pay, tax, time off', 'insurance', 'tax', 'PTO', 'clean exit'],
  },
]
