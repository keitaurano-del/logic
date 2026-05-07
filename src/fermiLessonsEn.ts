/**
 * Fermi Estimation Course (SCRUM-238)
 * Lesson IDs: 200-206
 * Category: 'Fermi Estimation'
 */
import type { LessonData } from './lessonData'

// -- Lesson 200: What is Fermi Estimation -----------------------------
const fermiLesson200: LessonData = {
  id: 200,
  title: 'What is Fermi Estimation?',
  category: 'Fermi Estimation',
  steps: [
    {
      type: 'explain',
      title: 'Understand the essence of Fermi estimation',
      content: 'Fermi estimation is **a way of estimating quantities logically, without exact data**.\n\nThe name comes from the Nobel-laureate physicist Enrico Fermi. He famously estimated the answer to "How many piano tuners are there in Chicago?" using only knowledge and logic.\n\n**Why it matters in business:**\n- Consulting, investing, and entrepreneurship all involve "How big is this market?"\n- Critical when perfect data is not available for decision-making\n- The thought process (logic) is what gets evaluated',
    },
    {
      type: 'explain',
      title: 'Memorize the four basic steps',
      content: '**Step 1: Define the question**\nClarify what you are estimating. Lock down the scope: "Japan", "per year", "units", etc.\n\n**Step 2: Decompose**\nBreak the big number into understandable components (MECE thinking).\nExample: Market size = target population × usage rate × unit price\n\n**Step 3: Estimate each component**\nUse common sense, statistical knowledge, and analogies to estimate each value.\n\n**Step 4: Combine and sanity-check**\nMultiply through, get an answer, and ask "is this plausible?".',
    },
    {
      type: 'quiz',
      explanation: 'The value of Fermi estimation is not "the exactly right answer" but demonstrating a logical thought process. The target is to be within 1-2 orders of magnitude.',
      question: 'What is most important in Fermi estimation?',
      options: [
        { label: 'Producing an exact answer', correct: false },
        { label: 'A logical decomposition process', correct: true },
        { label: 'Memorized statistics', correct: false },
        { label: 'Calculation speed', correct: false },
      ],
    },
    {
      type: 'explain',
      title: 'Understand the acceptable margin of error',
      content: 'For Fermi estimation, **1-2 orders of magnitude (10x to 100x) is enough precision**.\n\n"How many cars are owned in Japan?"\n- Actual: about 78 million\n- Acceptable Fermi range: somewhere between 10 million and 1 billion\n\nIn business decision-making, you usually only need to know "is this market on the order of ¥100M, ¥1B, or ¥10B?".\n\n**The logical chain matters more than precision.**',
    },
    {
      type: 'quiz',
      explanation: 'The population of Japan is about 120 million. Hold this as a base fact — it is the starting point for many Fermi problems.',
      question: 'Which is closest to the population of Japan?',
      options: [
        { label: 'About 30 million', correct: false },
        { label: 'About 80 million', correct: false },
        { label: 'About 120 million', correct: true },
        { label: 'About 200 million', correct: false },
      ],
    },
  ],
}

// -- Lesson 201: The art of decomposition -----------------------------
const fermiLesson201: LessonData = {
  id: 201,
  title: 'The Art of Decomposition: Building the Equation',
  category: 'Fermi Estimation',
  steps: [
    {
      type: 'explain',
      title: 'The trick is to build a "multiplication equation"',
      content: 'The core of Fermi estimation is to convert the target quantity into a **multiplication equation**.\n\n**Basic market-size equation:**\n```\nMarket size = target population × usage rate × purchase frequency × unit price\n```\n\n**Example: convenience-store market size in Japan**\n- Target population: 120 million\n- Usage rate: 60% (people who use a convenience store at least once a week)\n- Purchase frequency: 2 times per week\n- Spend per visit: ¥500\n\n-> 120M × 0.6 × 2 × ¥500 × 52 weeks\n≈ **¥3.7 trillion** (actual is about ¥11 trillion — 2-3x off is within the acceptable range)',
    },
    {
      type: 'explain',
      title: 'Memorize three decomposition patterns',
      content: '**Pattern (1): Stock type (total at a point in time)**\nExample: number of traffic signals in Japan\n= number of intersections × signals per intersection\n\n**Pattern (2): Flow type (volume over a period)**\nExample: annual Starbucks revenue\n= number of stores × daily revenue per store × 365 days\n\n**Pattern (3): Population-based (most generic)**\nExample: number of weddings per year\n= population × marriage rate × share that hold a ceremony',
    },
    {
      type: 'quiz',
      explanation: '"Number of taxis in Japan" can be estimated population-based. Density differs sharply between major cities and rural areas, so splitting by region improves accuracy.',
      question: 'When estimating the "number of taxis in Japan," what is the most natural starting point?',
      options: [
        { label: 'Build up from the number of taxi companies', correct: false },
        { label: 'Calculate from the population that uses taxis × usage frequency', correct: true },
        { label: 'Calculate from the share of cars on the road in a day', correct: false },
        { label: 'Estimate from past news articles', correct: false },
      ],
    },
    {
      type: 'quiz',
      explanation: 'Japan has about 60,000 convenience stores (actual ≈ 57,000). Population ÷ stores ≈ 2,000 people per store — keep it as a useful reference number.',
      question: 'Which is closest to the number of convenience stores in Japan?',
      options: [
        { label: 'About 10,000', correct: false },
        { label: 'About 60,000', correct: true },
        { label: 'About 200,000', correct: false },
        { label: 'About 1,000,000', correct: false },
      ],
    },
  ],
}

// -- Lesson 202: Practice (1) Cities and Infrastructure ---------------
const fermiLesson202: LessonData = {
  id: 202,
  title: 'Practice (1): Cities and Infrastructure',
  category: 'Fermi Estimation',
  steps: [
    {
      type: 'explain',
      title: 'Estimate the "total length of the Tokyo subway system"',
      content: '**Question: how many kilometers is the Tokyo Metro + Toei Subway combined?**\n\n**Decomposition:**\n1. Number of lines -> Tokyo has roughly 13 subway lines\n2. Average length per line -> roughly 20km (mix of loop and radial)\n3. Total length = 13 lines × 20km = 260km\n\n**Actual: about 300km** (15% off — well within Fermi tolerance)\n\n**Tip:** Picture a line you have ridden, and estimate one line as inter-station distance (~1km) × number of stations.',
    },
    {
      type: 'quiz',
      explanation: 'Tokyo Tower is 333m, Tokyo Skytree is 634m. "333 = three threes" makes Tokyo Tower memorable. Skytree is "Musashi" (mu = 6, sa = 3, shi = 4) in the Japanese mnemonic.',
      question: 'Which is closest to the height of Tokyo Skytree?',
      options: [
        { label: 'About 333m', correct: false },
        { label: 'About 450m', correct: false },
        { label: 'About 634m', correct: true },
        { label: 'About 800m', correct: false },
      ],
    },
    {
      type: 'explain',
      title: 'Estimate the "number of bridges in Japan"',
      content: '**Question: how many bridges are there in Japan?**\n\n**Decomposition (regional density approach):**\n1. Number of municipalities in Japan -> about 1,700\n2. Rural areas have many rivers, hence more bridges per municipality\n3. Assume an average of 100-200 bridges per municipality\n4. Total = 1,700 × 150 = about 250,000 bridges\n\n**Actual: about 700,000** (counting only road-managed bridges already gives a large number)\n\n-> This time, off by 3x. We missed small bridges on farm roads and forestry roads.\n**Form hypothesis -> verify -> spot what was missed** is the core learning loop of Fermi estimation.',
    },
    {
      type: 'quiz',
      explanation: 'The Tokaido Shinkansen (Tokyo to Shin-Osaka) is about 515km of revenue track. The Nozomi takes about 2.5 hours (top speed 285 km/h, but average ≈ 220 km/h due to stops and acceleration). This distance sense is also useful for estimating business-travel times.',
      question: 'Which is closest to the distance from Tokyo to Shin-Osaka?',
      options: [
        { label: 'About 200km', correct: false },
        { label: 'About 500km', correct: true },
        { label: 'About 800km', correct: false },
        { label: 'About 1,200km', correct: false },
      ],
    },
  ],
}

// -- Lesson 203: Practice (2) Business Sizing ------------------------
const fermiLesson203: LessonData = {
  id: 203,
  title: 'Practice (2): Sizing a Business',
  category: 'Fermi Estimation',
  steps: [
    {
      type: 'explain',
      title: 'Estimate "the size of the izakaya market in Japan"',
      content: '**Question: what is Japan\'s annual izakaya (Japanese pub) market size?**\n\n**Decomposition:**\n1. Adults who visit an izakaya at least once a month -> population 120M × adult share 0.8 × usage rate 0.4 = about 38 million\n2. Spend per monthly visit -> ¥3,000\n3. Annual = 38M × ¥3,000 × 12 months = **about ¥1.4 trillion**\n\n**Actual: about ¥1.5 trillion** (pre-COVID level)\n\n**Key:** The usage-rate estimate dominates accuracy. "How many times a month do my friends typically go?" is a usable everyday gut feel.',
    },
    {
      type: 'quiz',
      explanation: 'Japan\'s smartphone penetration is about 90%. iOS share is about 60% and Android about 40% — iOS skews high in Japan vs. other countries. "Adults × penetration" is the canonical pattern for sizing a target population.',
      question: 'Which is closest to the number of smartphones in Japan (including SIM)?',
      options: [
        { label: 'About 30 million', correct: false },
        { label: 'About 60 million', correct: false },
        { label: 'About 140 million', correct: true },
        { label: 'About 300 million', correct: false },
      ],
    },
    {
      type: 'explain',
      title: 'Estimate "the total annual revenue of hair salons"',
      content: '**Question: total annual revenue of hair salons in Japan?**\n\n**Decomposition (supply side):**\n1. Number of hair salons -> about 250,000 (more than convenience stores!)\n2. Monthly revenue per salon -> 5 customers/day × ¥3,000 × 25 days = about ¥370,000\n3. Annual revenue = 250,000 × ¥370,000 × 12 months ≈ **¥1.1 trillion**\n\n**Actual: ¥1.5-2 trillion range** (varies by source — Recruit\'s "Beauty Census" puts it at about ¥1.4 trillion; Yano Research\'s combined hair-and-beauty figure is about ¥2 trillion)\n\n**Cross-check from the demand side:**\n- Women 60M × 4 visits/year × ¥5,000 ≈ ¥1.2 trillion\n- Men 60M × 6 visits/year × ¥1,500 ≈ ¥0.5 trillion\n- Total ≈ **¥1.7 trillion** (close to both supply-side and actual figures)\n\n**Key:** Mixing up "X times per month" and "X times per year" shifts the answer by an order of magnitude. Build the habit of normalizing everything to a final unit (per year) for sanity-checking.',
    },
    {
      type: 'quiz',
      explanation: 'Japan\'s GDP is about ¥600 trillion. Lock in "Japan + GDP = ¥600 trillion" as a base fact. The national budget is about ¥100 trillion (~1/6 of GDP).',
      question: 'Which is closest to Japan\'s GDP?',
      options: [
        { label: 'About ¥100 trillion', correct: false },
        { label: 'About ¥300 trillion', correct: false },
        { label: 'About ¥600 trillion', correct: true },
        { label: 'About ¥2,000 trillion', correct: false },
      ],
    },
  ],
}

// -- Lesson 204: Common Traps and Countermeasures --------------------
const fermiLesson204: LessonData = {
  id: 204,
  title: 'Common Traps and Countermeasures',
  category: 'Fermi Estimation',
  steps: [
    {
      type: 'explain',
      title: 'Learn the most common mistakes',
      content: '**Trap (1): Overestimating by assuming "everyone uses it"**\n× Smartphone market = total population × smartphone unit price\n○ Smartphone market = buyer cohort × replacement rate × average unit price\n\n**Trap (2): Mixing units**\n× Conflating monthly and annual numbers\n○ Always make explicit "per year," "per month," or "per day" in the calculation\n\n**Trap (3): Double-counting**\n× Adding B2B + B2C and double-counting intermediate distribution\n○ Standardize on end-consumption (downstream), or diagram the flow to keep it clean\n\n**Trap (4): Order-of-magnitude errors**\n× Mixing "10,000s" and "100 millions" mid-calculation\n○ Use exponent notation (10^4, 10^8)',
    },
    {
      type: 'quiz',
      explanation: '"All citizens use it daily" is a textbook overestimation. Real usage varies hugely by age, region, and habit. Always set a "usage rate."',
      question: 'When estimating "annual Uber Eats orders in Japan," which approach is best?',
      options: [
        { label: 'population × 365 days (assuming everyone uses it daily)', correct: false },
        { label: 'users × average orders per month × 12 months', correct: true },
        { label: 'derive from the number of restaurants that can deliver', correct: false },
        { label: 'revenue divided by average order value', correct: false },
      ],
    },
    {
      type: 'explain',
      title: 'Understand why "cross-checking" matters',
      content: 'After estimating, always run a **sanity check**.\n\n**Checklist:**\n1. **Order of magnitude** — if "trillions" pop out, compare to Japan\'s GDP (¥600 trillion). If "billions," compare to a single large company\'s revenue.\n2. **Different angle** — if you estimated supply-side, also estimate demand-side.\n3. **Real-world experience** — does it match your or your peers\' lived sense?\n4. **Consistency with the news** — does it contradict any industry news you know?\n\n**Goal: within 1 order of magnitude (within 10x)**',
    },
    {
      type: 'quiz',
      explanation: 'Estimating both supply-side (stores × ticket) and demand-side (population × usage rate × spend) and getting close numbers gives you confidence. This is what "cross-checking" means.',
      question: 'Which is the most appropriate "cross-check" in Fermi estimation?',
      options: [
        { label: 'Redo the mental arithmetic', correct: false },
        { label: 'Estimate the same quantity from another angle (supply-side <-> demand-side)', correct: true },
        { label: 'Look up the right answer on the internet', correct: false },
        { label: 'Increase significant figures and calculate more precisely', correct: false },
      ],
    },
  ],
}

export const fermiLessonMapEn: Record<number, LessonData> = {
  200: fermiLesson200,
  201: fermiLesson201,
  202: fermiLesson202,
  203: fermiLesson203,
  204: fermiLesson204,
}
