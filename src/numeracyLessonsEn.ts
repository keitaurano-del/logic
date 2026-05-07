/**
 * Numeracy course
 * Category: 'Numeracy'
 * Lesson IDs: 400+
 */
import type { LessonData } from './lessonData'

// ── Lesson 400: Train your mental-math muscles ──────────────
const numeracyLesson400: LessonData = {
  id: 400,
  title: 'Train your mental-math muscles',
  category: 'Numeracy',
  steps: [
    {
      type: 'explain',
      title: 'Mental math is decided by the "drawer of techniques"',
      content: 'People who do quick mental math aren\'t especially fast thinkers. They simply have a reflex that says, on seeing the numbers, "which technique makes this easy?"\n\n**What you will pick up here:**\n- Major patterns for 2-digit × 2-digit (distribution, cross-multiply, rounding, difference of squares, shortcut trick)\n- Multiplication tricks for special numbers (×11, ×25, ×9, etc.)\n- Mental math for percentages and ratios\n- Judgment for "which technique fits when"\n\n**Note:** You don\'t need to memorize everything. As long as your brain reacts to "common number patterns," you\'re fine. Practice makes the judgment fast.',
    },
    {
      type: 'explain',
      title: '【2-digit × 2-digit ①】Master the distributive law',
      content: 'The most general-purpose mental method is the **distributive law**. It works on any 2-digit × 2-digit problem.\n\n**Idea:** Split one number into "tens + ones," multiply each part, and add.\n\n**Example: 23 × 47**\n1. Split 23 into "20 + 3"\n2. 20 × 47 = 940\n3. 3 × 47 = 141\n4. 940 + 141 = **1,081**\n\n**Why it helps:** "20 × 47" rounds to a clean number and is easy to compute mentally.\n\n**When to use:**\n- Ordinary 2-digit × 2-digit cases that don\'t fit the special patterns below\n- When in doubt, this is your default. The most general technique',
    },
    {
      type: 'explain',
      title: '【2-digit × 2-digit ②】Cross multiplication: sum four products',
      content: 'Decompose both numbers and add up all four products. Sometimes called the "Indian-style" method.\n\n**Idea:** (a + b) × (c + d) = ac + ad + bc + bd\n\n**Example: 23 × 47**\n- 20 × 40 = 800\n- 20 × 7 = 140\n- 3 × 40 = 120\n- 3 × 7 = 21\n- Total = 800 + 140 + 120 + 21 = **1,081**\n\n**When to use:**\n- When the intermediate step of the distributive law (e.g., 20 × 47) is hard to do mentally\n- When you want to write things down and stay organized\n- When you want to start from a "800 base" and add up to get a quick estimate',
    },
    {
      type: 'explain',
      title: '【2-digit × 2-digit ③】Round to a clean number, then subtract',
      content: 'When one number is near a clean multiple like 9X or 5X, round and adjust — it\'s faster.\n\n**Example 1: 98 × 47**\n1. Treat 98 as "100 − 2"\n2. 100 × 47 = 4,700\n3. 2 × 47 = 94\n4. 4,700 − 94 = **4,606**\n\n**Example 2: 49 × 38**\n1. Treat 49 as "50 − 1"\n2. 50 × 38 = 1,900\n3. 1 × 38 = 38\n4. 1,900 − 38 = **1,862**\n\n**When to use:**\n- One side is close to a clean number like 100, 50, or 10 (within 1–3)\n- Multiplications like ×100 or ×50 are easy mentally\n- Effective for shopping math like "$1.98 × 12 items"',
    },
    {
      type: 'explain',
      title: '【2-digit × 2-digit ④】Difference of squares for symmetric pairs',
      content: 'When two numbers are "symmetric around some center," the difference-of-squares formula gives the answer in one shot.\n\n**Formula:** (a − b) × (a + b) = a² − b²\n\n**Example 1: 47 × 53**\n- Centered at 50, with −3 and +3\n- 50² − 3² = 2,500 − 9 = **2,491**\n\n**Example 2: 38 × 42**\n- Centered at 40, with −2 and +2\n- 40² − 2² = 1,600 − 4 = **1,596**\n\n**Example 3: 96 × 104**\n- Centered at 100, with −4 and +4\n- 100² − 4² = 10,000 − 16 = **9,984**\n\n**When to use:**\n- When the average of the two numbers is a clean number (their sum is even and the average is 10, 50, or 100)\n- Pairs like "47 and 53," "18 and 22," "96 and 104"\n- If you can recall a², the answer is instant',
    },
    {
      type: 'explain',
      title: '【2-digit × 2-digit ⑤】Same tens digit + ones summing to 10 trick',
      content: 'For a specific pattern, you can blurt out the answer instantly.\n\n**Conditions:**\n- The tens digits are the same\n- The ones digits sum to exactly 10\n\n**Procedure:**\n1. Tens × (Tens + 1) ← upper part\n2. Ones × Ones ← lower two digits\n3. Concatenate\n\n**Example 1: 23 × 27** (both tens are 2; ones 3 + 7 = 10)\n- 2 × 3 = 6\n- 3 × 7 = 21\n- → **621**\n\n**Example 2: 64 × 66** (both tens are 6; ones 4 + 6 = 10)\n- 6 × 7 = 42\n- 4 × 6 = 24\n- → **4,224**\n\n**Example 3: 85 × 85** (both tens are 8; ones 5 + 5 = 10)\n- 8 × 9 = 72\n- 5 × 5 = 25\n- → **7,225**\n\n**When to use:**\n- Squares ending in 5 (35×35, 75×75, etc.)\n- Any pair with the same tens and ones summing to 10\n- Once learned, never forgotten',
    },
    {
      type: 'explain',
      title: '【Special numbers ①】×11, ×25, ×50 tricks',
      content: 'Frequent special numbers each have their own tricks. They speed up business arithmetic dramatically.\n\n**×11 trick:** Add the two digits of a 2-digit number and place the sum between them.\n- 35 × 11 → 3, (3+5)=8, 5 → **385**\n- 72 × 11 → 7, (7+2)=9, 2 → **792**\n- Watch out for carry: 57 × 11 → 5, 12, 7 → **627**\n\n**×25 trick:** ×100 ÷ 4\n- 36 × 25 → 3,600 ÷ 4 → **900**\n- 48 × 25 → 4,800 ÷ 4 → **1,200**\n\n**×50 trick:** ×100 ÷ 2\n- 84 × 50 → 8,400 ÷ 2 → **4,200**\n\n**×125 trick:** ×1,000 ÷ 8\n- 16 × 125 → 16,000 ÷ 8 → **2,000**\n\n**When to use:**\n- Common business patterns like "$19.80 × 25 units"\n- The instant you see ×11, ×25, ×50, ×125 — fire the trick',
    },
    {
      type: 'explain',
      title: '【Special numbers ②】×9, ×5, ×4 and ÷5 decompositions',
      content: 'Decompositions using "near," "half," or "double" of clean numbers.\n\n**×9 = ×10 − ×1**\n- 47 × 9 → 470 − 47 → **423**\n- 63 × 9 → 630 − 63 → **567**\n\n**×5 = ×10 ÷ 2**\n- 84 × 5 → 840 ÷ 2 → **420**\n- 37 × 5 → 370 ÷ 2 → **185**\n\n**×4 = ×2 ×2**\n- 75 × 4 → 150 × 2 → **300**\n\n**÷5 = ×2 ÷ 10**\n- 130 ÷ 5 → 260 ÷ 10 → **26**\n- 85 ÷ 5 → 170 ÷ 10 → **17**\n\n**When to use:**\n- The instant you see ×9 or ×5, transform reflexively\n- Lower mental load than long multiplication\n- Handle ÷5 or ÷25 quickly via "×2 ÷ 10" or "×4 ÷ 100"',
    },
    {
      type: 'explain',
      title: '【Percentages】Combine standard anchors',
      content: 'Percent calculations move faster when you combine anchors like 10%, 25%, 50%, and 1%.\n\n**Anchors:**\n- **10%** = ÷10 (move the decimal point one to the left)\n- **25%** = ÷4\n- **50%** = ÷2\n- **1%** = ÷100\n\n**Example 1: 30% of 800**\n- 10% = 80\n- 30% = 80 × 3 = **240**\n\n**Example 2: 75% of 1,200**\n- 25% = 300\n- 75% = 300 × 3 = **900**\n(Or 50% = 600 and 25% = 300 added together)\n\n**Example 3: 17% of 2,500**\n- 10% = 250\n- 1% = 25\n- 17% = 250 + 25 × 7 = 250 + 175 = **425**\n\n**Example 4: ×0.99 (1% off)**\n- 4,800 × 0.99 → 4,800 − 48 → **4,752**\n\n**When to use:**\n- Discounts, tax-included calculations, share comparisons\n- Remember "percentages = combinations of anchors" and you won\'t get lost',
    },
    {
      type: 'explain',
      title: 'A pattern-selection cheat sheet to remove hesitation',
      content: 'Order of checks for selecting techniques live.\n\n**A. 2-digit × 2-digit multiplication (check from the top):**\n1. Same tens + ones summing to 10? → Trick — instant\n2. Symmetric around a clean number? → Difference of squares\n3. One side near a clean number? → Round and adjust\n4. Otherwise → Distribution / cross multiplication\n\n**B. Multiplication by special numbers:**\n- ×11 → Add the digits, place between\n- ×25 → ×100 ÷ 4\n- ×50 → ×100 ÷ 2\n- ×125 → ×1,000 ÷ 8\n- ×9 → ×10 − ×1\n- ×5 → ×10 ÷ 2\n\n**C. Percentages:**\n- Combine anchors of 10%, 25%, 50%, 1%\n- "Almost ×1" cases like ×0.99 → use subtraction\n\n**Tip:** No need to memorize every rule. Aim for the state where "something fires the moment you see the numbers." Decision time will start at slow and tighten to half a second with practice.',
    },
    {
      type: 'quiz',
      explanation: 'For 34 × 26 with the distributive law, split one side and multiply across the whole. 30×26 = 780, 4×26 = 104, total 884. A common mistake is "30×20 + 4×6 = 624" — forgetting the cross terms.',
      question: 'Compute 34 × 26 with the distributive law (30×26 + 4×26).',
      options: [
        { label: '624', correct: false },
        { label: '804', correct: false },
        { label: '884', correct: true },
        { label: '904', correct: false },
      ],
    },
    {
      type: 'quiz',
      explanation: '47×53 is symmetric around 50 (−3 and +3). 50² − 3² = 2,500 − 9 = 2,491 — instant. The other choices don\'t center on a clean number, so the difference-of-squares trick has no benefit.',
      question: 'For which pair is the "difference of squares" formula most useful?',
      options: [
        { label: '23 × 47', correct: false },
        { label: '47 × 53', correct: true },
        { label: '98 × 13', correct: false },
        { label: '71 × 58', correct: false },
      ],
    },
    {
      type: 'quiz',
      explanation: 'The ×11 trick: add the two digits of the number and place the sum between them. 35 → 3, (3+5)=8, 5 → 385. Sanity check: 35×10 + 35 = 350 + 35 = 385. Watch for carry when the digits sum to 10 or more.',
      question: 'Using the ×11 trick, what is 35 × 11?',
      options: [
        { label: '305', correct: false },
        { label: '350', correct: false },
        { label: '385', correct: true },
        { label: '405', correct: false },
      ],
    },
    {
      type: 'quiz',
      explanation: '36 × 25 uses the "×100 ÷ 4" trick: 3,600 ÷ 4 = 900. The distributive law also works, but the moment you see ×25 the trick is overwhelmingly faster.',
      question: 'What is the fastest way to compute 36 × 25 mentally?',
      options: [
        { label: 'Compute as 36 × 100 ÷ 4', correct: true },
        { label: 'Compute as 30 × 25 + 6 × 25', correct: false },
        { label: 'Add 36 × 5 five times', correct: false },
        { label: 'Split 25 into 20 + 5 and use distribution', correct: false },
      ],
    },
  ],
}

// ── Lesson 401: Communicate accurately with numbers ─────────
const numeracyLesson401: LessonData = {
  id: 401,
  title: 'Communicate accurately with numbers',
  category: 'Numeracy',
  steps: [
    {
      type: 'explain',
      title: 'Same fact, different framing — different conclusion',
      content: '"Sales up 3%" and "$10.0B → $10.3B (+$300M YoY)" are the same fact, but the audience\'s impression differs. **How you display numbers determines half of your message.**\n\n**What you will pick up here:**\n- How to choose the comparison axis (vs. what?)\n- When to use absolute values vs. ratios\n- Always disclose the denominator\n- Avoiding misleading graphs\n- How to choose units and precision\n- Use metaphors and reference points to engage intuition\n\n**Premise:** Not "twisting facts," but "communicating the same fact more accurately and clearly."',
    },
    {
      type: 'explain',
      title: 'What you compare against changes the meaning',
      content: 'Numbers have no meaning on their own. **What you compare against** flips the conclusion 180°.\n\n**Common comparison axes:**\n- **Year-on-year (YoY)**: for growth/contraction trends\n- **Versus plan**: for tracking attainment\n- **Industry average**: for positioning\n- **Competitors**: for relative advantage\n- **Natural baseline**: for measuring intervention impact\n\n**Example: "10,000 users"**\n- Competitor has 100,000 → "9% share, losing"\n- Last year was 100 → "100× growth, surging"\n- Plan was 15,000 → "Below plan, needs lift"\n\n**Point:** The same "10,000" yields different conclusions across axes. **Hand-picking only the favorable axis** misleads the audience. The honest move is to display multiple axes side by side.',
    },
    {
      type: 'explain',
      title: 'Use absolute and relative values appropriately',
      content: 'For the same fact, the impression varies dramatically depending on whether you state an absolute value or a ratio.\n\n**Example 1: $30 discount**\n- $100 product → "30% off" lands hard\n- $10,000 product → "$30 off" feels weak; "$10,000 → $9,970" is unmoving\n\n**Example 2: Sales up by $1B**\n- Base of $10B → "10% growth" feels meaningful\n- Base of $1T → must say "+$1B" (0.1% doesn\'t communicate)\n\n**Principles for choosing:**\n- **Small base × big change** → use **ratios** (high impact)\n- **Large base × small change** → use **absolute** (concrete)\n- **State both** → most honest (lets the reader judge)\n\n**Caution:** Phrases like "Click-through rate up 200%!" need a closer look. 0.1% → 0.3% is also "up 200%." A textbook case where pure ratio overstates the picture.',
    },
    {
      type: 'explain',
      title: 'Always disclose the denominator',
      content: 'Percentages and ratios mean nothing without the **denominator**. Hiding it is the single biggest pitfall.\n\n**Example 1: "50% improved in the trial"**\n- Denominator 4 → 2 improved (anecdote)\n- Denominator 4,000 → 2,000 improved (reliable)\n\n**Example 2: "200% YoY"**\n- From 0.1% → 0.3% (essentially flat)\n- From 10,000 → 30,000 (real expansion)\n\n**Example 3: "Halved attrition"**\n- Denominator 20: 4 → 2 (individual factors dominate)\n- Denominator 2,000: 400 → 200 (structural improvement)\n\n**Rules:**\n- When showing a percentage, always write the denominator (n = ◯)\n- Convert vague phrases like "majority" or "vast majority" into concrete ratios with denominators\n- If the audience asks for the denominator, that\'s a danger sign (your framing was insufficient)\n\n**Best practice:** Present "72% (86 of 120) supported it" — denominator, ratio, and absolute count as a 3-piece set.',
    },
    {
      type: 'explain',
      title: '5 graph-misleading patterns to avoid',
      content: 'Graphs are powerful, but easily produce unintentional misunderstanding.\n\n**① Hidden non-zero Y-axis**\n- A bar chart that starts the Y-axis at 100 makes a 102 → 105 difference look like "30% growth"\n- Bar charts should start at zero. Mark exceptions explicitly\n\n**② Twin-axis charts with arbitrary scales**\n- Two unrelated series can be made to look correlated by tuning each axis\n- When using twin axes, state explicitly that no correlation is being claimed\n\n**③ Silent log axes**\n- Exponential growth can be made to look linear\n- Always label the use of a log axis\n\n**④ Scaling diameter (not area) of circles**\n- Doubling the diameter to show "2×" actually quadruples the area\n- Visual impression follows area, so the picture overstates\n\n**⑤ Cherry-picked time windows**\n- Stock chart showing only the rising portion\n- Window selection is the highest-stakes choice. Show both long and short windows\n\n**Check:** If swapping the axes changes the impression of your own graph, your current axes may be exaggerating.',
    },
    {
      type: 'explain',
      title: 'Pick units and precision to suit the audience',
      content: 'Even the same number changes the reader\'s load dramatically with the choice of units and precision.\n\n**Choosing units:**\n- "12,345,678 yen" vs. "approx. 12.3M yen" (denser)\n- Executive reports: **billions/millions**; operational reports: **tens-of-thousands**; accounting: **single yen** — use layered units\n- International comparisons: **$M units**\n\n**Choosing precision:**\n- For estimates, 2–3 significant digits is enough\n- "Growth rate is 17.3429%" loses trust by overstating precision\n- Don\'t exceed the precision of the source data\n\n**Example: revenue 1,234,567,890 yen**\n- Executive report → "**approx. 1.23B yen**" (3-digit precision)\n- Department report → "**1.234B yen** / 1,234M yen"\n- Accounting → "**1,234,567,890 yen**" (single yen mandatory)\n\n**Point:** Find "the precision the audience needs." Anything beyond is noise.',
    },
    {
      type: 'explain',
      title: 'Use metaphors and reference points to reach intuition',
      content: 'Abstract big numbers only land when translated into the audience\'s lived sense of scale.\n\n**Common reference points:**\n- Area: "X Tokyo Domes"; "the area inside the Yamanote loop"\n- Population: "X% of Japan\'s population"; "X times the population of Tokyo"\n- Time: "X months of annual income"; "X% of a lifetime"\n- Distance: "X laps of Earth"; "X round trips between Tokyo and Osaka"\n- Money: "X cups of coffee"; "X months of rent"\n\n**Example 1: "1M tons of annual emissions"**\n→ "About 250 Tokyo Towers (≈4,000 tons each) by mass"\n\n**Example 2: "10TB of data"**\n→ "About 2,000 DVDs"; "About 5,000 movies"\n\n**Example 3: "$2B in sales"**\n→ "About $7 per Japanese resident"\n\n**Point:** Choose reference points **close to the audience\'s lived experience**. For executives, "ratio to annual revenue"; for the front line, "hours saved per day"; pick references that fit the audience.',
    },
    {
      type: 'explain',
      title: 'A pre-publish checklist for self-checking',
      content: 'Before sharing numbers, ask yourself the following — most pitfalls die here.\n\n**Comparison axis check:**\n- Have I stated what I\'m comparing against?\n- Am I cherry-picking only convenient axes?\n\n**% vs. absolute check:**\n- Did I choose the appropriate one?\n- Should I display both?\n\n**Denominator check:**\n- Have I disclosed the denominator (n = ◯)?\n- Have I converted vague phrases like "majority" or "almost everyone" into concrete numbers?\n\n**Graph check:**\n- Is the Y-axis at zero? Have I marked exceptions?\n- Is the time window honestly chosen?\n\n**Unit/precision check:**\n- Have I trimmed to the precision the audience needs?\n- Am I overstating precision?\n\n**Intuition check:**\n- Have I added reference points to large numbers?\n\n**Final check:** "If I were the reader, would I feel deceived?" — that\'s the standard.',
    },
    {
      type: 'quiz',
      explanation: 'Showing both growth rate and absolute amount, plus the scale gap, is honest. Highlighting only one is a classic mislead. "2× growth" alone hides the fact that the base is only $1M; "+$1M" alone hides A\'s relative momentum.',
      question: 'Company A\'s profit grew $1M → $2M YoY. In the same period, Company B grew $100M → $105M. Which framing is most honest?',
      options: [
        { label: 'A grew 2× — leading the industry', correct: false },
        { label: 'A\'s growth rate (100%) far exceeds B\'s (5%), but B\'s profit remains over 50× larger in absolute terms', correct: true },
        { label: 'A is healthy with $1M added', correct: false },
        { label: 'Both A and B are growing above the industry average', correct: false },
      ],
    },
    {
      type: 'quiz',
      explanation: 'When most of the population is vaccinated, deaths among vaccinated will naturally exceed unvaccinated in absolute count. Without comparing **rates** (deaths per vaccinated vs. per unvaccinated), causation appears reversed. A textbook trap of ignoring the denominator.',
      question: 'A claim is presented: "Deaths among vaccinated > deaths among unvaccinated." What is the most concerning issue?',
      options: [
        { label: 'It ignores the difference in vaccination rates and compares absolute counts rather than rates', correct: true },
        { label: 'The Y-axis is not at zero', correct: false },
        { label: 'It uses a log axis', correct: false },
        { label: 'The time window is too short', correct: false },
      ],
    },
  ],
}

// ── Lesson 402: Master ratios, YoY, and growth rates ────────
const numeracyLesson402: LessonData = {
  id: 402,
  title: 'Master ratios, YoY, and growth rates',
  category: 'Numeracy',
  steps: [
    {
      type: 'explain',
      title: 'Percentage operations have unique pitfalls',
      content: '"X% growth" and "YoY" are everyday tools, but they hide several pitfalls.\n\n**What you will pick up here:**\n- The meaning of YoY and other base indicators\n- Instant conversion from "X% increase" to ×1.X\n- Correct computation of chained changes (20% up, then 10% down)\n- The trap that "50% down + 50% up" doesn\'t restore the original\n- Decomposing total growth into per-element contributions\n- Avoiding confusion between percentage points (ppt) and percent change\n\n**Premise:** Builds on the percentage basics from Lesson 400 — applied to time series, chains, and decompositions.',
    },
    {
      type: 'explain',
      title: 'Pin down YoY exactly',
      content: 'YoY is the most common indicator in business reporting, but expressions vary — be careful.\n\n**"YoY 120%" and "YoY +20%" mean the same thing**\n- Last year 100 → this year 120\n- Both express "increased by 20%"\n\n**"YoY 2×" and "YoY 200%" mean the same thing**\n- Last year 100 → this year 200\n\n**Common indicators:**\n- **YoY (Year over Year)**: same period, last year\n- **MoM (Month over Month)**: previous month\n- **QoQ (Quarter over Quarter)**: previous quarter\n- **YTD (Year to Date)**: cumulative since start of year\n\n**Example: "YoY +15%"**\n- Last April\'s sales were 100 → this April\'s are 115\n- Same-month comparison removes seasonal effects\n\n**Cautions:**\n- "YoY 100%" means **no change** (often misread as "100% increase")\n- Some organizations are sloppy with phrasing — on first mention, "YoY 120% (+20%)" is safe',
    },
    {
      type: 'explain',
      title: 'Convert "X% increase" instantly to ×1.X',
      content: 'Percent changes become much easier when converted to multipliers.\n\n**Conversion rules:**\n- **X% increase** → **×(1 + X/100)**\n- **X% decrease** → **×(1 − X/100)**\n\n**Common conversions:**\n- 5% up → ×1.05\n- 10% up → ×1.10\n- 20% up → ×1.20\n- 50% up → ×1.50\n- 5% down → ×0.95\n- 10% down → ×0.90\n- 20% down → ×0.80\n- 50% down → ×0.50\n\n**Example 1: 20% increase on 1,200**\n- 1,200 × 1.20 = **1,440**\n\n**Example 2: 15% decrease on 800**\n- 800 × 0.85 = **680**\n\n**Benefits:**\n- Chained applications (next chapter) become trivial\n- Faster on calculators and Excel too',
    },
    {
      type: 'explain',
      title: 'Chained percent changes — multiply, do not add',
      content: 'When percent changes occur in sequence, **multiply** the multipliers — **don\'t add** them.\n\n**Example 1: 20% up, then 10% down**\n- 1.20 × 0.90 = **1.08** → 8% up\n- ❌ Not "20% − 10% = 10% up"\n\n**Example 2: 30% up, then 30% down**\n- 1.30 × 0.70 = **0.91** → 9% down\n- ❌ Not "back to ±0%"\n\n**Example 3: 10% growth for 3 years in a row**\n- 1.10 × 1.10 × 1.10 = **1.331** → 33.1% up by year 4\n- ❌ Not "30% up"\n\n**Point:** When dealing with percent changes, the rule is "don\'t add." Chain them as multiplications.',
    },
    {
      type: 'explain',
      title: 'Understand "50% down + 50% up ≠ back to original"',
      content: 'The biggest pitfall of percent changes: **decreases and increases are not symmetric**.\n\n**Example: 100 → 50% down → 50 → 50% up → 75**\n- 1.00 × 0.50 × 1.50 = **0.75**\n- Not back to original\n\n**Example: 100 → 30% down → 70 → 30% up → 91**\n- 1.00 × 0.70 × 1.30 = **0.91**\n- Still 9% down\n\n**Rule:** After a multiplier r decrease, restoring the original requires a multiplier of 1/r increase.\n- 50% down (×0.5) → restore via ×2 = **100% up**\n- 25% down (×0.75) → restore via ×(4/3) = **33.3% up**\n- 10% down (×0.9) → restore via ×(1/0.9) ≈ **11.1% up**\n\n**Application:** Same in equity markets. After a 50% drop, recovery requires a 100% rise. "Recovering from a fall is harder than rising in the first place" — this asymmetry is why.',
    },
    {
      type: 'explain',
      title: 'Decompose total growth into contributions',
      content: 'Decompose company-wide sales growth across business units or geographies.\n\n**Contribution formula:** Each element\'s absolute change ÷ total original amount\n\n**Example: company sales grew $10B → $11B (+10%)**\n- Business A: $6B → $7.2B (+$1.2B, growth 20%, contribution +12%)\n- Business B: $3B → $2.7B (−$0.3B, growth −10%, contribution −3%)\n- Business C: $1B → $1.1B (+$0.1B, growth 10%, contribution +1%)\n- Total: $10B → $11B (+$1B, contribution sum +10%)\n\n**Reading:**\n- The 10% top-line growth is the sum "Business A +12% − Business B 3% + Business C 1%"\n- Looking only at growth rates (20%, −10%, 10%) doesn\'t tell you total impact\n- Structurally, **contribution = growth rate × weight**\n\n**When to use:**\n- Explaining "what drove the total" in executive reporting\n- Comparing departments\' contributions objectively\n- A cool-headed view that doesn\'t over-credit a small business with a high growth rate',
    },
    {
      type: 'explain',
      title: 'Don\'t confuse percentage points (ppt) with percent change',
      content: 'There\'s a special unit, **percentage point (ppt)**, for comparing percentages. Mixing them up reverses the meaning.\n\n**Example 1: market share grew from 30% to 36%**\n- **+6 percentage points (+6 ppt)** ← difference of percentages\n- **20% increase** ← relative change with 30% as the base\n\n**Example 2: unemployment rose from 5% to 6%**\n- **+1 ppt**\n- **20% increase** (5% → 6% is a 20% rise)\n- "Unemployment up 20%" sounds excessive. "+1 ppt" is accurate\n\n**Example 3: interest rates rose from 2% to 3%**\n- **+1 ppt**\n- **+50%** (2% → 3%)\n- "Rates up 50%" is misleading. "+1 ppt" is accurate\n\n**Principle:**\n- **Differences between percentages** → percentage points (ppt)\n- **Comparison with absolute base** → ordinary percent change\n\n**Caution:** Indicators that are themselves percentages — share, rate, margin — are dangerous. Confusing the two in news or executive reports leads to exaggeration and misdirection.',
    },
    {
      type: 'quiz',
      explanation: '×1.20 × 0.80 = 0.96, so 4% lower. Percent changes are not added but multiplied. The textbook case showing "+20% then −20%" doesn\'t restore the original.',
      question: 'A product\'s price went "up 20%, then down 20%." Versus the original price, where does it stand?',
      options: [
        { label: 'Same as original', correct: false },
        { label: '4% lower', correct: true },
        { label: '4% higher', correct: false },
        { label: '8% lower', correct: false },
      ],
    },
    {
      type: 'quiz',
      explanation: 'After a 50% drop (×0.5), restoring the original requires ×2 = 100% up. Decreases and increases are not symmetric. "Drop 50, recover 50" only reaches 75% — you don\'t get back to original.',
      question: 'A stock fell 50%. To return to its original price, what increase is needed?',
      options: [
        { label: '50% up', correct: false },
        { label: '75% up', correct: false },
        { label: '100% up', correct: true },
        { label: '200% up', correct: false },
      ],
    },
    {
      type: 'quiz',
      explanation: 'Differences between percentages should be expressed in **percentage points (ppt)**. "Up 2%" is ambiguous; "up 20%" is the relative change against a 10% base (10×1.2 = 12) — different meaning. The most accurate phrasing is "+2 percentage points."',
      question: 'A company\'s operating margin improved from 10% to 12%. What is the most accurate phrasing?',
      options: [
        { label: 'Operating margin up 2%', correct: false },
        { label: 'Operating margin up 2 percentage points (+2 ppt)', correct: true },
        { label: 'Operating margin up 20%', correct: false },
        { label: 'All have the same meaning', correct: false },
      ],
    },
  ],
}

// ── Lesson 403: Unit conversions and a sense of scale ───────
const numeracyLesson403: LessonData = {
  id: 403,
  title: 'Unit conversions and a sense of scale',
  category: 'Numeracy',
  steps: [
    {
      type: 'explain',
      title: 'Unit conversions speed up with "factors" and "digit shifts"',
      content: 'In business you frequently compare numbers across different units.\n\n**What you will pick up here:**\n- Currency conversion using FX rates (yen ↔ dollar)\n- Time-axis conversion (year/month/day/hour)\n- Area conversion (m²/tsubo/km²)\n- Scale conversion (person-month, person-day, person-year)\n- How to avoid digit-shift mistakes\n\n**Premise:** Builds on the digit-sense (10K → 100M → 1B in Japanese, equivalents in English) from Lesson 89 (Client Work) and adds cross-unit conversions.',
    },
    {
      type: 'explain',
      title: 'Yen ↔ dollar: instant via approximate FX',
      content: 'FX rates change, so for mental math, use a "clean rate."\n\n**Common approximate rates (late-2020s baseline):**\n- 1 USD = **about 150 yen**\n- 1 EUR = **about 160 yen**\n- 1 CNY (yuan) = **about 20 yen**\n- 1 KRW (won) = **about 0.1 yen**\n\n**Example 1: How many yen is $1M?**\n- 1M × 150 = **150M yen**\n\n**Example 2: How many dollars is 1 trillion yen?**\n- 1T ÷ 150 ≈ **about $6.67B**\n\n**Example 3: How many yen is a $300K budget?**\n- 300K × 150 = **45M yen**\n\n**Tips:**\n- Compute first at "1 USD = 100 yen" then multiply by 1.5 for easier mental math\n- 2-digit precision is enough for estimates (deviation from real rate is just a few %)\n- Rates shift by era — substitute the current real rate to keep your sense fresh',
    },
    {
      type: 'explain',
      title: 'Time-axis conversion is instant once you memorize a few base values',
      content: 'Year/month/day/hour conversions are easy with a handful of base values.\n\n**Base values (memorize):**\n- 1 year = **365 days** = **about 52 weeks**\n- Working days/year = **about 240 days** (ex weekends/holidays/PTO)\n- Working days/month = **about 20 days**\n- Working hours/day = **8 hours**\n- Working hours/month = **about 160 hours**\n- Working hours/year = **about 2,000 hours**\n\n**Example 1: Sales of 3.6B yen/year → per day?**\n- 3.6B ÷ 365 ≈ **about 10M yen/day**\n\n**Example 2: Hourly rate 5,000 yen → monthly equivalent?**\n- 5,000 × 160 = **800K yen/month**\n\n**Example 3: Annual contract 30M yen → monthly?**\n- 30M ÷ 12 = **2.5M yen/month**\n\n**Tips:**\n- "Year → day" is ÷300 (rough) or ÷365 (precise)\n- "Year → working hours" is ÷2,000\n- "Month → working hours" is ×160\n- Memorize "365 ÷ 7 ≈ 52 weeks" so weeks become a base value too',
    },
    {
      type: 'explain',
      title: 'Area conversion comes up constantly in real estate and geography',
      content: 'Real estate and development plans mix many area units.\n\n**Basic conversions:**\n- **1 tsubo ≈ 3.3 m²** (two tatami mats)\n- **1 jō (tatami mat) ≈ 1.62 m²** (≈ half a tsubo)\n- **1 m² ≈ 0.3 tsubo**\n- **1 hectare (ha) = 100m × 100m = 10,000 m²**\n- **1 km² = 100 ha = 1,000,000 m²**\n\n**Example 1: 500 m² office → how many tsubo?**\n- 500 × 0.3 = **about 150 tsubo**\n\n**Example 2: 2,000 tsubo lot → how many m²?**\n- 2,000 × 3.3 = **6,600 m²**\n\n**Example 3: Tokyo Dome ≈ 47,000 m²**\n- = about 14,000 tsubo = about 4.7 ha\n\n**Example 4: Inside the Yamanote loop ≈ 63 km²**\n- = 6,300 ha = 63M m²\n\n**Tips:**\n- Real-estate site work uses "tsubo"; design drawings use "m²"; geography uses "km²/ha" — switch by layer\n- For estimates, "1 tsubo ≈ 3 m²" / "1 m² ≈ 1/3 tsubo" (within ~10% error) is enough',
    },
    {
      type: 'explain',
      title: 'Use person-months / person-days / person-years to gauge team size',
      content: 'Compound units like "person-month" and "person-hour" appear constantly in project planning.\n\n**Concepts:**\n- **1 person-month** = 1 person working for 1 month (~160 hours)\n- **1 person-day** = 1 person working for 1 day (8 hours)\n- **1 person-year** = 1 person working for 1 year (~2,000 hours)\n\n**Example 1: project requires "20 person-months"**\n- 5-person team → 20 ÷ 5 = **4 months**\n- 10-person team → 20 ÷ 10 = **2 months**\n- ※ In reality, doubling people doesn\'t halve the schedule (communication overhead grows)\n\n**Example 2: $1M annual budget → per month?**\n- $1M ÷ 12 ≈ **about $83.3K/month**\n\n**Example 3: 1M yen per person-month → 10-person team annual cost?**\n- 1M × 10 × 12 = **120M yen/year**\n\n**Tips:**\n- Person-effort is "people × time." Change one and the other changes\n- The schedule-people tradeoff is non-linear (*The Mythical Man-Month*). Useful as a rough sense, but real plans need a buffer',
    },
    {
      type: 'explain',
      title: '4 checks for avoiding digit-shift errors in unit conversion',
      content: 'The most common mistake in unit conversion is the **digit shift** — one digit off means 10× off.\n\n**① Pre-estimate the order of magnitude**\nGuess "roughly how many digits" before computing\n- $1M × 150 yen → 1M × 100 = 100M-yen order\n- 150M yen is fine; 1.5B or 15M yen → digit error\n\n**② Write the units in the equation**\n- 1M [USD] × 150 [JPY/USD] = 150M [JPY]\n- "USD × JPY/USD = JPY" — check unit consistency\n\n**③ Sanity-check with extreme values**\nPlug in big and small to see if the answer is sensible\n- 1 USD → 150 yen (sensible)\n- 1M USD → 150M yen (sensible)\n- 0.01 USD → 1.5 yen (sensible)\n\n**④ Confirm the direction of the conversion factor**\n"Multiply or divide?" is easy to get wrong\n- USD → JPY: ×150 (yen has bigger magnitude)\n- JPY → USD: ÷150 (USD has smaller magnitude)\n- **Intuition: bigger unit direction means divide; smaller unit direction means multiply**\n\n**Summary:** Most digit errors die with "order pre-estimate" and "unit equations."',
    },
    {
      type: 'quiz',
      explanation: '450M ÷ 150 = 3M. 450M yen ÷ 150 yen/USD = 3M USD. Easier: anchor on "150M yen = $1M," then 450M = 3 × 150M → $3M.',
      question: '450M yen is about how many dollars? (Use 1 USD = 150 yen)',
      options: [
        { label: 'About $300K', correct: false },
        { label: 'About $3M', correct: true },
        { label: 'About $30M', correct: false },
        { label: 'About $300M', correct: false },
      ],
    },
    {
      type: 'quiz',
      explanation: '1.8B ÷ 365 ≈ 5M yen/day. Even rough: 1.8B÷300 = 6M; 1.8B÷400 = 4.5M — "5M yen order" is visible. For year→day, default to ÷365 (or ÷300) reflexively.',
      question: 'For a shop with 1.8B yen annual sales, what is the approximate "daily sales"?',
      options: [
        { label: 'About 500K yen', correct: false },
        { label: 'About 5M yen', correct: true },
        { label: 'About 50M yen', correct: false },
        { label: 'About 50K yen', correct: false },
      ],
    },
    {
      type: 'quiz',
      explanation: '30 person-months ÷ 6 people = 5 months. "Person-month" is a "people × month" product, so adding people reduces months. In reality, more people raises communication cost and the timeline doesn\'t shrink linearly (*The Mythical Man-Month*).',
      question: 'A project requires 30 person-months. With a 6-person team, how many months does it take? (Ignore communication overhead.)',
      options: [
        { label: '3 months', correct: false },
        { label: '5 months', correct: true },
        { label: '6 months', correct: false },
        { label: '30 months', correct: false },
      ],
    },
  ],
}

// ── Lesson 404: CAGR, compounding, and exponential growth ───
const numeracyLesson404: LessonData = {
  id: 404,
  title: 'CAGR, compounding, and exponential growth',
  category: 'Numeracy',
  steps: [
    {
      type: 'explain',
      title: 'Compounding is the strongest "time-on-your-side" leverage',
      content: 'Even at the same "10% annual growth," simple and compound interest produce wildly different outcomes.\n\n**Example: 1M yen at 10% annual return, 10 years later**\n- Simple: 1M + 100K × 10 years = **2M yen**\n- Compound: 1M × 1.10^10 ≈ **2.59M yen**\n- → Compound is **about 30% higher**\n\n**What you will pick up here:**\n- Difference between simple and compound interest\n- The meaning and computation of CAGR (annual compound growth rate)\n- The Rule of 72 (mental "doubling time")\n- An intuition for exponential growth\n- When to leverage / when to avoid compounding\n\n**Premise:** The chained applications of percent change from Lesson 402 are exactly the essence of compounding.',
    },
    {
      type: 'explain',
      title: 'Compounding is "interest on interest"',
      content: 'The core of compounding is **the interest from one period is folded into the principal of the next**.\n\n**Example: 10% annual rate for 3 years**\n- Year start: 1M yen\n- After 1 year: 1M × 1.10 = 1.10M\n- After 2 years: 1.10M × 1.10 = 1.21M\n- After 3 years: 1.21M × 1.10 = **1.331M**\n- Compactly: 1M × 1.10³ = 1.331M\n\n**Versus simple interest:**\n- Simple: 100K added each year → 300K added in 3 years → **1.3M**\n- Compound: **1.331M** (gap of 31K)\n\nThe gap is small over short horizons but explodes exponentially over long ones.\n\n**Example: 1M yen at 10% annual, long-term**\n- After 7 years: ≈ 1.95M yen (about 2×)\n- After 14 years: ≈ 3.80M yen (about 4×)\n- After 30 years: ≈ 17.45M yen (about 17×)\n\n**Point:** Compounding gaps grow explosively as "time × rate." Long-horizon value creation is all compounding applied.',
    },
    {
      type: 'explain',
      title: 'Use the Rule of 72 to mental-math "doubling time"',
      content: 'Compound math is intrinsically tedious — but for **doubling time** there\'s an instant rule.\n\n**Rule of 72:**\n**Doubling years ≈ 72 ÷ annual rate (%)**\n\n**Examples:**\n- 1% → 72÷1 = **72 years** to double\n- 2% → 72÷2 = **36 years**\n- 3% → 72÷3 = **24 years**\n- 5% → 72÷5 ≈ **14.4 years**\n- 6% → 72÷6 = **12 years**\n- 8% → 72÷8 = **9 years**\n- 10% → 72÷10 = **7.2 years**\n- 12% → 72÷12 = **6 years**\n\n**Application: years to 4×, 8×, 10×**\n- 4× = double × double → **2× the years**\n- 8× = double × double × double → **3× the years**\n- 10× ≈ **3.3× the years** (precisely log₂(10) ≈ 3.32)\n\n**Example: at 10%, when do you reach 10×?**\n- Doubling at 7.2 years → 10× at 7.2 × 3.32 ≈ **24 years**\n\n**Tip:** For investment, growth, and population dynamics — anything "exponentially increasing" — this rule is universal.',
    },
    {
      type: 'explain',
      title: 'Express multi-year growth in one number with CAGR',
      content: 'CAGR (compound annual growth rate) expresses multi-year growth as a "per-year average."\n\n**Definition:**\n**CAGR = (end value ÷ start value)^(1/years) − 1**\n\n**Example 1: sales 10B → 20B over 3 years**\n- Multiplier = 2.0, years = 3\n- CAGR = 2.0^(1/3) − 1 ≈ 1.260 − 1 = **about 26%/year**\n\n**Example 2: 10B → 15B over 5 years**\n- Multiplier = 1.5, years = 5\n- CAGR = 1.5^(1/5) − 1 ≈ 1.084 − 1 = **about 8.4%/year**\n\n**Mental approximation (inverse Rule of 72):**\n- "Doubles in 3 years → CAGR ≈ 72÷3 = 24%" (actual is 26%, close enough)\n- "Doubles in 7 years → 72÷7 ≈ 10%"\n\n**Caution: not the simple average**\n- Year 1 +50%, Year 2 +50%, Year 3 −50%\n- Simple average: (50 + 50 − 50) ÷ 3 ≈ 16.7%\n- CAGR: (1.5 × 1.5 × 0.5)^(1/3) − 1 = 1.125^(1/3) − 1 ≈ **4%**\n- Simple averages overstate via the chain trap. CAGR is the true annual growth rate\n\n**When to use:**\n- IR/M&A: state "the past 3 years\' growth" in a single number\n- Compare with competitors and the market on a per-year basis\n- Set "target CAGR" in a mid-term plan',
    },
    {
      type: 'explain',
      title: 'Exponential growth violates intuition',
      content: 'The human brain handles linear growth fine but consistently underestimates exponential growth.\n\n**Famous example: how much after 30 days?**\n- A: "Get 1M yen each day" → 30 × 1M = **30M yen**\n- B: "Start with 1 yen, double each day" → 1, 2, 4, 8, … day 30 = 2^29 ≈ **540M yen**\n- Intuition says A wins; in fact B is 10×+ larger\n\n**Doubling power:**\n- Infections double every 3 days → 30 days = 2^10 = **1,024×**\n- Linear thinking gets blindsided just before it\'s too late\n\n**Spotting exponential growth:**\n- Phenomena that "double on a regular schedule" are exponential\n- A graph with a log Y-axis indicates exponential growth\n- "Suddenly grew a lot recently" = late-stage exponential\n\n**Business application:**\n- Exponential user growth captures markets terrifyingly fast (network-effect startups)\n- Conversely, exponential cost growth (credit-card interest, subscription stacking) follows the same mechanic\n- "Compounding things" can be ally or enemy\n\n**Point:** The essence of exponential growth is "current value × multiplier" determines next. Step one is leaving linear thinking behind.',
    },
    {
      type: 'explain',
      title: 'Identify when compounding works for you and against you',
      content: 'Sort situations where compounding helps versus where it hurts.\n\n**Where compounding helps (use as ally):**\n- Investing/asset management (long-term effects of regular contributions)\n- Talent development (skill-acquisition cascades)\n- User acquisition (referrals and word-of-mouth)\n- Knowledge accumulation (reading, experience)\n- Trust-building (track record → next opportunity)\n\n**Where compounding doesn\'t help much:**\n- One-shot transactions (no carry-over)\n- Short horizons (compounding ≈ simple)\n- High volatility (a big mid-period drop neutralizes compounding)\n\n**Where compounding hurts (avoid):**\n- Debt and credit-card interest\n- Technical debt (fix cost balloons)\n- Health decay (lifestyle disease progression)\n- Postponed problems (response cost grows with time)\n\n**Tips for judgment:**\n- "Does an effect generate the next effect?" If yes → compounding territory\n- "Does today\'s 0.1% improvement become a big gap long-term?"\n- Build the habit of "can I make this compound for me?"\n\n**Point:** Compounding is the strongest "time-on-your-side" leverage. Continuous small wins beat one-time big bets in the long run.',
    },
    {
      type: 'quiz',
      explanation: 'By the Rule of 72: 72÷6 = 12 years. At 6%, you double in 12 years. Reflex use of this rule is invaluable for long-term investment thinking.',
      question: 'At a 6% annual rate, how many years until your principal doubles?',
      options: [
        { label: 'About 6 years', correct: false },
        { label: 'About 12 years', correct: true },
        { label: 'About 20 years', correct: false },
        { label: 'About 36 years', correct: false },
      ],
    },
    {
      type: 'quiz',
      explanation: 'Doubles in 4 years; inverse Rule of 72: 72÷4 = 18%. Precisely, 2^(1/4) − 1 ≈ 0.189 = 18.9%. Saying "100%÷4 years = 25%" overstates (ignores compounding).',
      question: 'Sales went from 10B to 20B over 4 years. What is the approximate CAGR?',
      options: [
        { label: 'About 10%', correct: false },
        { label: 'About 18%', correct: true },
        { label: 'About 25%', correct: false },
        { label: 'About 50%', correct: false },
      ],
    },
    {
      type: 'quiz',
      explanation: 'Doubles each day, so half → full takes exactly 1 day. If half on day 30, full on day 31. The classic "you only realize when it\'s too late" property of exponential growth. Linear thinking guesses "60 days."',
      question: 'A pond\'s algae starts at 1 unit on day 1, doubling each day. On day 30 it covers half. On which day does it cover the entire pond?',
      options: [
        { label: 'Day 31', correct: true },
        { label: 'Day 45', correct: false },
        { label: 'Day 60', correct: false },
        { label: 'Day 90', correct: false },
      ],
    },
  ],
}

// ── Lesson 405: Mean, median, distribution — see the essence ─
const numeracyLesson405: LessonData = {
  id: 405,
  title: 'Mean, median, distribution — see the essence',
  category: 'Numeracy',
  steps: [
    {
      type: 'explain',
      title: 'The "mean" alone misleads you about the essence',
      content: '"Average income," "average stock price" — when summarizing data into a single number, "mean" is what comes out first. But mean alone often misses the essence.\n\n**Example: 5 people\'s annual income**\n- 4M, 5M, 6M, 7M, 50M\n- Mean = 14.4M yen\n- Median = 6M yen (closer to reality)\n\n**What you will pick up here:**\n- When to use mean / median / mode\n- How outliers warp the mean\n- Use variance and standard deviation to see "spread"\n- The normal distribution and the 68-95-99.7 rule\n- Reading skewed distributions\n\n**Premise:** An application of "communicate with numbers" from Lesson 401. The choice of measure decides the framing.',
    },
    {
      type: 'explain',
      title: 'Three central tendencies — pick the right one',
      content: 'Three ways to represent data with a single number.\n\n**① Mean**\n- Sum of all values divided by count\n- Reflects all data, but is sensitive to outliers\n\n**② Median**\n- The "middle" value when data is sorted\n- Robust to outliers, often closer to reality\n\n**③ Mode**\n- The most frequently occurring value\n- Shows the "typical" value\n\n**Example: 6 firms\' headcount: 3, 5, 5, 5, 8, 120**\n- Mean: (3+5+5+5+8+120) ÷ 6 = **about 24.3**\n- Median: **5** (average of the 3rd and 4th sorted values)\n- Mode: **5** (occurs 3 times)\n\n**Selection principles:**\n- Mean: when the distribution is symmetric (few outliers)\n- Median: when the distribution is skewed or has outliers (income, housing prices)\n- Mode: for categorical data; when you want the typical example\n\n**Point:** People often think "mean is most representative" — wrong. Choose based on the situation.',
    },
    {
      type: 'explain',
      title: 'Outliers warp the mean dramatically',
      content: 'Because the mean is a "sum of all data," a single extreme value pulls the whole thing.\n\n**Example: 5 people\'s savings**\n- 0, 1M, 2M, 3M, 100M yen\n- Mean: (0+1M+2M+3M+100M) ÷ 5 = **21.2M**\n- Median: **2M**\n\nA mean of "21.2M" represents nobody.\n\n**Real-world examples:**\n- **Income**: top 1% lifts the mean → median is closer to lived reality\n- **Housing prices**: luxury homes lift the mean → median answers "roughly how much?"\n- **Hospital wait times**: occasional multi-hour waits worsen the mean → median tells you the typical experience\n\n**Outlier-detection guides:**\n- Look at the distribution; obvious "islands" away from the rest\n- Big gap between mean and median → suspect outlier influence\n- Mean > median → upward outliers (right-skewed)\n- Mean < median → downward outliers (left-skewed)\n\n**Tip:** When mean and median diverge, always inspect the shape of the distribution.',
    },
    {
      type: 'explain',
      title: 'Measure "spread" with variance and standard deviation',
      content: 'Central tendency alone doesn\'t tell you "how consistent the data is." **Spread** is measured by variance and standard deviation.\n\n**Example: monthly sales for shops A and B**\n- A: 100, 100, 100, 100, 100 (mean 100, no spread)\n- B: 50, 75, 100, 125, 150 (mean 100, large spread)\n\nMean is the same 100, but stability is wildly different.\n\n**Standard deviation (σ, sigma):**\n- A measure of spread around the mean\n- Small σ → data clusters around the mean\n- Large σ → data is broadly spread\n\n**Variance:**\n- The square of the standard deviation (computational intermediate)\n- Variance = σ²\n\n**Intuitive use:**\n- "Mean ± 1σ" is the main range of the data\n- E.g., mean income 5M with σ = 1M → most people are between 4M and 6M\n\n**When comparing:**\n- Same mean with different spread → decision changes\n- Investing: same expected return, smaller σ = lower risk\n- Product quality: same mean lifespan, smaller σ = more dependable\n\n**Point:** Mean is just the center. The professional sense of numbers also looks at "how far from the mean things spread."',
    },
    {
      type: 'explain',
      title: 'Memorize the normal distribution and the 68-95-99.7 rule',
      content: 'Many natural phenomena and measurement errors follow a "normal distribution (bell curve)."\n\n**Properties of the normal distribution:**\n- Mean is the most common value; symmetric\n- Frequency tapers off as you move from the mean\n- Mean = median = mode\n\n**68-95-99.7 rule:**\n- Mean ± 1σ contains **68%** of the data\n- Mean ± 2σ contains **95%** of the data\n- Mean ± 3σ contains **99.7%** of the data\n\n**Example: Japanese male heights (illustrative: mean 170cm, σ = 6cm)**\n- 164–176 cm contains 68%\n- 158–182 cm contains 95%\n- 152–188 cm contains 99.7%\n- Above 190 cm is about 0.15% (very rare)\n\n**Example: hensachi (Japanese standardized test score)**\n- hensachi = (score − mean) ÷ σ × 10 + 50\n- hensachi 60 → top ~16% (mean + 1σ)\n- hensachi 70 → top ~2.5% (mean + 2σ)\n- hensachi 80 → top ~0.15% (mean + 3σ)\n\n**Application: Six-Sigma quality management**\n- Quality bar of fewer than 3.4 defects per million\n- Beyond 6σ, the probability is astronomically small\n\n**Point:** When you can instantly compute "what % is within mean ± Xσ," you can read "rarity" off the data.',
    },
    {
      type: 'explain',
      title: 'For skewed distributions, the median rules',
      content: 'Real-world data is often not normal. With skew, the mean misleads.\n\n**Right-skewed (long right tail):**\n- Examples: income, stock returns, social-media follower counts\n- A small number of high values lifts the mean\n- **Mean > median**\n- → Use the median for reality\n\n**Left-skewed (long left tail):**\n- Examples: lifespan, exam scores when most are near full marks\n- A small number of low values pulls the mean down\n- **Mean < median**\n- → Use the median for reality\n\n**Power law (Pareto):**\n- Extreme skew where the top 20% accounts for 80%\n- Examples: book sales (a few bestsellers dominate), website traffic\n- The mean is meaningless; describe with "top X%," "median," or "Gini coefficient"\n\n**How to detect:**\n- Compare mean vs. median\n- Plot a histogram (symmetric or one-sided?)\n- A mean-to-median ratio of 1.5× or more suggests heavy skew\n\n**Common mistake in practice:**\n- Reading "mean income 5M" and expecting "I should also be at 5M"\n- Reality: median is 4M, mean inflated by upper layer\n- Same data, different impression based on which measure you choose\n\n**Point:** Receiving "the mean" without inspecting the distribution gives a sense of reality at odds with reality.',
    },
    {
      type: 'quiz',
      explanation: 'A mean of 20M is dragged by one person\'s 90M and doesn\'t represent reality. The median 3M describes "the middle person\'s savings." For skewed data like income, housing, or savings, the median is the rule.',
      question: '5 people\'s savings: 1M, 2M, 3M, 4M, 90M yen. Which measure most reflects reality?',
      options: [
        { label: 'Mean (20M)', correct: false },
        { label: 'Median (3M)', correct: true },
        { label: 'Mode (not identifiable)', correct: false },
        { label: 'The remainder after subtracting the max from the all-data average', correct: false },
      ],
    },
    {
      type: 'quiz',
      explanation: '182 cm = mean 170 + 2σ (6×2 = 12). By 68-95-99.7, "mean ± 2σ" contains 95%, leaving 5% in the two tails combined. The upper-only tail is half: about 2.5%.',
      question: 'Japanese male heights: mean 170 cm, SD 6 cm (assume normal). What % are 182 cm or taller?',
      options: [
        { label: 'About 16%', correct: false },
        { label: 'About 2.5%', correct: true },
        { label: 'About 0.15%', correct: false },
        { label: 'About 50%', correct: false },
      ],
    },
    {
      type: 'quiz',
      explanation: 'Mean > median signals a "right-skewed distribution." A small number of high earners pulls the mean up. Reality is closer to the median 5M. A common pattern in income, assets, sales.',
      question: 'A dataset has mean income 8M and median income 5M. What is the most plausible interpretation?',
      options: [
        { label: 'There are right-side (high-income) outliers and the mean is inflated', correct: true },
        { label: 'There are left-side (low-income) outliers and the mean is depressed', correct: false },
        { label: 'There is most likely a calculation error', correct: false },
        { label: 'The mean is more trustworthy', correct: false },
      ],
    },
  ],
}

// ── Lesson 406: Spot the pitfalls in numbers ────────────────
const numeracyLesson406: LessonData = {
  id: 406,
  title: 'Spot the pitfalls in numbers',
  category: 'Numeracy',
  steps: [
    {
      type: 'explain',
      title: 'Numbers have characteristic traps',
      content: 'Statistics and numbers contain countless traps that betray human intuition. The presenter may produce them unintentionally — or deliberately mislead.\n\n**What you will pick up here:**\n- Survivorship bias (the trap of looking only at survivors)\n- Simpson\'s paradox (the trap where parts and the whole disagree)\n- Correlation ≠ causation (the trap of arrows you draw yourself)\n- The denominator trick (the trap of hidden bases)\n- The false-positive paradox (the pitfall of "99% accurate tests")\n\n**Premise:** The flip side of Lesson 401 ("communicate accurately"). This is "as a recipient, don\'t be deceived."',
    },
    {
      type: 'explain',
      title: 'Don\'t look only at "the success cases" — survivorship bias',
      content: 'Drawing conclusions from only the survivors paints a picture far from reality.\n\n**Famous example: WWII fighter aircraft**\n- Analysts looked at where returning aircraft had been hit → concentrated on the wings\n- Intuition: "reinforce the wings"\n- Statistician Abraham Wald\'s conclusion: **"reinforce the engines"**\n- Reason: planes hit in the engines crashed and never returned (excluded from the sample)\n\n**Common business cases:**\n- "Common traits of successful entrepreneurs"\n  → Failed entrepreneurs may have had the same traits\n- "Analysis of bestsellers"\n  → Books that didn\'t sell may have used the same techniques\n- "Hit-product design analysis"\n  → Without comparing failed products, the analysis is meaningless\n\n**Questions to avoid survivorship bias:**\n- "Do we have data on the failure side?"\n- "Is the sample composed only of successes?"\n- "Are we comparing against failure cases as well?"\n\n**Point:** "Interview successful people and look for commonalities" is often the textbook survivorship bias. Comparison with failures is mandatory.',
    },
    {
      type: 'explain',
      title: 'Simpson\'s paradox: watch for whole-vs-part reversals',
      content: 'Within parts the trend is one way; aggregated, it reverses — that\'s Simpson\'s paradox.\n\n**Example: which treatment is more effective, A or B?**\n\nMild patients:\n- A: 90 successes in 100 (90%)\n- B: 9 successes in 10 (90%)\n\nSevere patients:\n- A: 3 successes in 10 (30%)\n- B: 35 successes in 100 (35%)\n\n**Within parts:**\n- Mild: A 90% = B 90% (same)\n- Severe: A 30% < B 35% (B better)\n- → "B is better" — apparently\n\n**Aggregated:**\n- A: (90+3) ÷ 110 = **about 84.5%**\n- B: (9+35) ÷ 110 = **40%**\n- → A is overwhelmingly better in totals\n\n**Why?**\n- A has many mild cases; B has many severe cases\n- "Differences in the patient mix" warp the comparison\n\n**Real cases:**\n- Promotion rates within departments show no gender gap, but company-wide men dominate (department-preference difference)\n- Acceptance rates by university favor women, but overall favor men (different application choices)\n\n**Mitigations:**\n- Don\'t conclude from the aggregate alone\n- Check "is the trend the same when split by segment?"\n- Inspect sample-mix differences before aggregating\n\n**Point:** "Overall mean" and "by segment" can disagree. Cross-checking by aggregation level is the rule.',
    },
    {
      type: 'explain',
      title: 'Correlation and causation are different',
      content: 'When two things move together, one need not cause the other.\n\n**Famous example: ice-cream consumption and drowning incidents**\n- Both rise together\n- Intuition: "ice cream causes drowning?"\n- Reality: a third factor — "summer" — drives both (a confounder)\n\n**Other examples:**\n- More fire engines at fire scenes → "fire engines cause fires?"\n  → Reality: bigger fires summon more fire engines (causation reversed)\n- Nobel laureates correlate with chocolate consumption → "chocolate makes you smarter"?\n  → Reality: being a developed country drives both\n\n**Why correlation alone isn\'t enough:**\n- ① Coincidence (especially in small data)\n- ② Reverse causation (B → A)\n- ③ Third factor (C → A and C → B)\n- ④ Selection bias (only certain people in the sample)\n\n**To assert causation, you need:**\n- Time order: cause precedes effect\n- Association: the two are actually linked\n- Third-factor exclusion: alternative explanations ruled out\n- Mechanism: theory that explains the link\n\n**Best evidence: randomized controlled trials (RCTs)**\n- The gold standard in medicine\n- A/B tests are the applied version\n\n**Point:** "There is correlation" and "there is causation" are different. Before saying "therefore X causes Y," develop the habit of doubting third factors and direction.',
    },
    {
      type: 'explain',
      title: 'See through hidden-denominator tricks',
      content: 'In Lesson 401 you learned to "disclose denominators when sending"; here you learn the receiving-side skill of "spotting hidden ones."\n\n**Trick 1: "Effects 3×!"**\n- Click-through went from 0.1% to just 0.3%\n- "3×" technically — but essentially flat\n- → Always confirm the **base rate**\n\n**Trick 2: "90% of people are satisfied"**\n- Denominator 10 → 9 satisfied (anecdote)\n- Denominator 10,000 → 9,000 satisfied (reliable)\n- → Always confirm the denominator\n\n**Trick 3: "Half of the deceased were vaccinated"**\n- If vaccination rate is 90%, half of deaths being vaccinated means rates are higher among **un**vaccinated\n- A textbook trick that confuses "absolute counts" with "rates"\n\n**Trick 4: country A growth 20% vs country B 5%**\n- A: GDP 10B → 12B; B: 10T → 10.5T\n- By "rate," A wins; by "absolute," B is about 250×\n- → Always pair with scale\n\n**Receiving checklist:**\n- See "X×" or "X% up" → ask for the **base rate**\n- See "X% supported it" → ask **n = ?**\n- Demand both ratios and counts\n- Inspect both "totals" and "breakdowns"\n\n**Point:** As receiver, build the habit of always doubting the denominator. If it isn\'t shared, that itself is reason to doubt.',
    },
    {
      type: 'explain',
      title: 'See through "99% accurate test" via the false-positive paradox',
      content: 'You hear "you tested positive on a 99%-accurate test" and think "I\'m 99% sick" — but there\'s a trap.\n\n**Example: rare disease at 0.1% prevalence, test 99% accurate**\n\nSuppose 10,000 people take the test:\n- Sick: 10 (0.1%)\n  - Test positive (true positive): 9.9 ≈ 10\n- Healthy: 9,990\n  - Test positive (false positive): 9,990 × 1% = 99.9 ≈ 100\n\n**Of those who test positive:**\n- True positives: 10\n- False positives: 100\n- Total: 110\n\n**"Probability of being sick given a positive test" = 10 ÷ 110 = about 9%**\n\nWhen you hear "99%-accurate test, positive," it sounds like "almost certainly sick" — but it\'s actually **only 9%**.\n\n**Why?**\n- Low base rate (prevalence) means the healthy population overwhelms\n- A small false-positive rate yields more false positives than true positives\n\n**Real applications:**\n- Spam filters: 99% accuracy with massive volume produces many false positives\n- Face recognition: 99% accuracy + a rare target = many misidentifications\n- Cancer screening: low base rate in young populations causes most retests to be false alarms\n\n**Mitigations:**\n- Don\'t look only at test accuracy — confirm the **base rate (prevalence)**\n- Use the concept of "positive predictive value (PPV)"\n- For probability intuition, use Bayes\' theorem (Bayesian reasoning)\n\n**Point:** "X% accuracy" alone doesn\'t suffice. **Pair it with prior probability (base rate)** — that\'s the basics of Bayesian thinking.',
    },
    {
      type: 'explain',
      title: 'Maintain a "doubt list" for incoming numbers',
      content: 'When numbers arrive, mechanically check the following.\n\n**Sampling traps:**\n- Are failures and dropouts included? (survivorship bias)\n- Is the sample skewed? (selection bias)\n- Is the time/region/segment cherry-picked?\n\n**Aggregation traps:**\n- Do the whole and parts agree? (Simpson)\n- Same trend at the subgroup level?\n\n**Causation traps:**\n- Are you mistaking correlation for causation?\n- Any third factor (confounder)?\n- Is the direction of causation reversed?\n\n**Denominator traps:**\n- For "X×" or "X%," what is the base rate?\n- What is the sample size (n)?\n- Have you seen both ratios and counts?\n\n**Probability traps:**\n- For "X% accuracy," what is the base rate?\n- Have you considered the absolute numbers of false positives/negatives?\n\n**Meta-questions:**\n- What does the presenter want to claim?\n- Have you also looked for data that argues the opposite conclusion?\n\n**Point:** Beyond "don\'t swallow whole," carry a checklist of "what to doubt" — that\'s how you read numbers critically.',
    },
    {
      type: 'quiz',
      explanation: 'Failed entrepreneurs may also have been early risers. Looking only at survivors and seeking commonalities can\'t distinguish "success cause" from "shared trait." Comparison with the failed group is essential.',
      question: '"100 successful founders interviewed; all wake up early. Therefore early rising is a success secret." What is the biggest issue?',
      options: [
        { label: 'The correlation between early rising and success is weak', correct: false },
        { label: 'There is no data on failed founders (survivorship bias)', correct: true },
        { label: '100 is too small a sample', correct: false },
        { label: 'There is no data on non-founders', correct: false },
      ],
    },
    {
      type: 'quiz',
      explanation: 'Even if departments show no gender gap, men concentrating in "high-promotion-rate departments" makes the company-wide rate higher for men. A textbook case where sample composition warps aggregation. Examining "whole" and "segments" together is the rule.',
      question: 'No gender gap by department, but men have a higher promotion rate company-wide. The most plausible interpretation?',
      options: [
        { label: 'A data-aggregation error', correct: false },
        { label: 'Men are concentrated in departments with higher promotion rates (Simpson\'s paradox)', correct: true },
        { label: 'Men are moving between departments', correct: false },
        { label: 'A statistically meaningless gap', correct: false },
      ],
    },
    {
      type: 'quiz',
      explanation: '0.1% prevalence = 10 of 10,000. With 99% accuracy and 1% false-positive rate, 99.9 of 9,990 healthy test falsely positive. Among 110 positives, only 10 are truly sick → about 9%. Without considering "base rate," intuition is betrayed.',
      question: 'Disease prevalence 0.1%; test 99% accurate. If you test positive, what is the probability you actually have the disease?',
      options: [
        { label: 'About 99%', correct: false },
        { label: 'About 50%', correct: false },
        { label: 'About 9%', correct: true },
        { label: 'About 0.1%', correct: false },
      ],
    },
  ],
}

export const numeracyLessonMapEn: Record<number, LessonData> = {
  400: numeracyLesson400,
  401: numeracyLesson401,
  402: numeracyLesson402,
  403: numeracyLesson403,
  404: numeracyLesson404,
  405: numeracyLesson405,
  406: numeracyLesson406,
}
