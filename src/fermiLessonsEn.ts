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
      content: 'Fermi estimation is a way of estimating quantities logically, without exact data.\n\nThe name comes from the Nobel-laureate physicist Enrico Fermi. He famously estimated the answer to "How many piano tuners are there in Chicago?" using only knowledge and logic.\n\nWhy it matters in business:\n- Consulting, investing, and entrepreneurship all involve "How big is this market?"\n- Critical when perfect data is not available for decision-making\n- The thought process (logic) is what gets evaluated',
    },
    {
      type: 'explain',
      title: 'Three business scenarios where Fermi shines',
      content: 'Fermi estimation is not a number game — it is a practical tool you can use on the job.\n\nScenario 1: Sizing a new customer base or market\nQuickly estimate the universe of prospects. "How many decision-makers are there in this industry nationwide?" — getting a 5-minute answer lets you decide instantly on list purchase budgets and trade-show investments.\n\nScenario 2: Market entry / exit decisions\nRoughly size whether a country or business model is worth entering before commissioning expensive research. A ¥1-trillion market and a ¥10-billion market call for completely different strategies, so grabbing the order of magnitude fast matters most.\n\nScenario 3: ROI and payback gut-checks\nAt the planning stage, multiply expected gross profit against initiative costs (headcount, ad spend) to see the payback multiple. If "ROI is below 1x before we even start" comes out, you save both the proposal time and the meeting time.',
    },
    {
      type: 'explain',
      title: 'Memorize the four basic steps',
      content: 'Step 1: Define the question\nClarify what you are estimating. Lock down the scope: "Japan", "per year", "units", etc.\n\nStep 2: Decompose\nBreak the big number into understandable components (MECE thinking).\nExample: Market size = target population × usage rate × unit price\n\nStep 3: Estimate each component\nUse common sense, statistical knowledge, and analogies to estimate each value.\n\nStep 4: Combine and sanity-check\nMultiply through, get an answer, and ask "is this plausible?".',
      visual: 'FermiStepsDiagram',
    },
    {
      type: 'quiz',
      explanation: 'Fermi estimation\'s value lies in demonstrating a logical thought process, not hitting an exact number. Within 1-2 orders of magnitude is the bar. Option 1 chases perfectionism, option 3 worships rote memorization, option 4 mistakes technique for thinking.',
      question: 'What is most important in Fermi estimation?',
      options: [
        { label: 'Hitting an exactly correct answer', correct: false },
        { label: 'A logical decomposition and verification process', correct: true },
        { label: 'A deep stock of memorized statistical figures', correct: false },
        { label: 'Calculator-grade calculation speed and accuracy', correct: false },
      ],
    },
    {
      type: 'explain',
      title: 'Margin of error, and problems with vs. without an answer',
      content: 'For Fermi estimation, 1-2 orders of magnitude (10x to 100x) is enough precision.\n\n"How many cars are owned in Japan?"\n- Reference value (actual): about 78 million (MLIT vehicle registration data)\n- Acceptable Fermi range: somewhere between 10 million and 1 billion\n\nIn business decision-making, you usually only need to know "is this market on the order of ¥100M, ¥1B, or ¥10B?". The logical chain matters more than precision.\n\nThere is one important premise here: Fermi problems come in two distinct kinds.\n\n1. Problems WITH an answer (verifiable against a reference value)\n- Population, unit counts, market sizes — anything with official statistics or industry estimates\n- e.g. cars owned in Japan, convenience-store market size, number of households\n- After estimating, compare against the "reference value" and review where you drifted\n\n2. Problems WITHOUT a single answer (no unique correct value)\n- e.g. "hours humanity wastes waiting at traffic lights", "total annual happiness of Japan"\n- No verifiable measured value exists, or the answer changes with your premises\n- Here the goal is not the number itself but training your decomposition logic and order-of-magnitude sense\n\nIn this course, problems with an answer come with a reference value, and problems without one are flagged as such. Build the habit of reviewing "was my decomposition logic sound?" rather than "did my number hit?".',
    },
    {
      type: 'quiz',
      explanation: 'What you need from Fermi estimation is the "right order of magnitude." Knowing whether a market is ¥1T-scale or ¥10B-scale is enough for strategy calls. Option 1 falls into perfectionism and delays decisions, option 3 over-engineers precision, option 4 spreads the range so wide that no conclusion can be drawn.',
      question: 'What precision should you realistically aim for in a Fermi estimate used for a business decision?',
      options: [
        { label: 'Within 1% of the actual number', correct: false },
        { label: 'Within the same order of magnitude (within 10x)', correct: true },
        { label: 'Within roughly +/- 20%', correct: false },
        { label: 'Anywhere within 1/1000x to 1000x of the actual', correct: false },
      ],
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
      content: 'The core of Fermi estimation is to convert the target quantity into a multiplication equation.\n\nBasic market-size equation:\n```\nMarket size = target population × usage rate × purchase frequency × unit price\n```\n\nExample: convenience-store market size in Japan\n- Target population: 120 million\n- Usage rate: 60% (people who use a convenience store at least once a week)\n- Purchase frequency: 2 times per week\n- Spend per visit: ¥500\n\n-> 120M × 0.6 × 2 × ¥500 × 52 weeks\n≈ ¥3.7 trillion (actual is about ¥12 trillion — 2-3x off is within the acceptable range)',
      visual: 'FermiFormulaDiagram',
    },
    {
      type: 'explain',
      title: 'Memorize three decomposition patterns',
      content: 'Pattern (1): Stock type (total at a point in time)\nExample: number of traffic signals in Japan\n= number of intersections × signals per intersection\n\nPattern (2): Flow type (volume over a period)\nExample: annual Starbucks revenue\n= number of stores × daily revenue per store × 365 days\n\nPattern (3): Population-based (most generic)\nExample: number of weddings per year\n= population × marriage rate × share that hold a ceremony',
    },
    {
      type: 'explain',
      title: 'Practice: build the equation for "annual cafe market in Japan"',
      content: 'Let us walk through a full population-based decomposition (Pattern 3).\n\nQuestion: what is the annual cafe market (chains + independents) in Japan?\n\nStep 1: list the factors\n```\nmarket size = users × visits per user × spend per visit\n```\n\nStep 2: break each factor down\n- Users = population × share that uses cafes\n  = 120M × 0.5 = 60M\n- Visits = once a week × 52 weeks = 52 per year\n- Spend per visit = average ¥500\n\nStep 3: combine\n```\n60M × 52 × ¥500\n= 6 × 10^7 × 52 × 5 × 10^2\n≈ 1.56 × 10^12 yen\n= about ¥1.5 trillion\n```\n\nActual: about ¥1.3 trillion (Food Service Association, pre-COVID baseline)\n-> roughly 15% off — plenty good for a Fermi answer.\n\nTip: For multi-digit calculations, switching to exponent notation (10^X) is the cleanest way to prevent order-of-magnitude slips.',
      visual: 'FermiFormulaDiagram',
    },
    {
      type: 'quiz',
      explanation: 'Taxis are best sized population-based (demand side). Option 1 requires supply data you likely don\'t have, option 3 uses a denominator far too large to estimate taxi share against, option 4 relies on memory with no logical chain. Demand-side estimation is the most universal pattern.',
      question: 'When estimating the "number of taxis in Japan," what is the most natural starting point?',
      options: [
        { label: 'Build up from the number of taxi companies × cars per company', correct: false },
        { label: 'Calculate from the population that uses taxis × usage frequency', correct: true },
        { label: 'Calculate from the share of taxis among all cars on the road', correct: false },
        { label: 'Estimate from past news articles you happen to remember', correct: false },
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
      content: 'Question: how many kilometers is the Tokyo Metro + Toei Subway combined?\n\nDecomposition:\n1. Number of lines -> Tokyo has roughly 13 subway lines\n2. Average length per line -> roughly 20km (mix of loop and radial)\n3. Total length = 13 lines × 20km = 260km\n\nActual: about 300km (15% off — well within Fermi tolerance)\n\nTip: Picture a line you have ridden, and estimate one line as inter-station distance (~1km) × number of stations.',
      visual: 'FermiFormulaDiagram',
      visualProps: {
        sectionLabel: 'Tokyo subway — total length estimation',
        factors: [
          { label: 'Lines', value: '13', unit: 'lines' },
          { label: 'Per line', value: '20', unit: 'km' },
        ],
        result: { label: 'Estimated total', value: '260', unit: 'km' },
        hint: 'Actual ~300 km. 15% off is well within Fermi tolerance',
      },
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
      content: 'Question: how many bridges are there in Japan?\n\nDecomposition (regional density approach):\n1. Number of municipalities in Japan -> about 1,700\n2. Rural areas have many rivers, hence more bridges per municipality\n3. Assume an average of 100-200 bridges per municipality\n4. Total = 1,700 × 150 = about 250,000 bridges\n\nActual: about 700,000 (counting only road-managed bridges already gives a large number)\n\n-> This time, off by 3x. We missed small bridges on farm roads and forestry roads.\nForm hypothesis -> verify -> spot what was missed is the core learning loop of Fermi estimation.',
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
      content: 'Question: what is Japan\'s annual izakaya (Japanese pub) market size?\n\nDecomposition:\n1. Adults who visit an izakaya at least once a month -> population 120M × adult share 0.8 × usage rate 0.4 = about 38 million\n2. Spend per monthly visit -> ¥3,000\n3. Annual = 38M × ¥3,000 × 12 months = about ¥1.4 trillion\n\nActual: about ¥1.5 trillion (pre-COVID level)\n\nKey: The usage-rate estimate dominates accuracy. "How many times a month do my friends typically go?" is a usable everyday gut feel.',
      visual: 'FermiFormulaDiagram',
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
      content: 'Question: total annual revenue of hair salons in Japan?\n\nDecomposition (supply side):\n1. Number of hair salons -> about 250,000 (more than convenience stores!)\n2. Monthly revenue per salon -> 5 customers/day × ¥3,000 × 25 days = about ¥370,000\n3. Annual revenue = 250,000 × ¥370,000 × 12 months ≈ ¥1.1 trillion\n\nActual: ¥1.5-2 trillion range (varies by source — Recruit\'s "Beauty Census" puts it at about ¥1.4 trillion; Yano Research\'s combined hair-and-beauty figure is about ¥2 trillion)\n\nCross-check from the demand side:\n- Women 60M × 4 visits/year × ¥5,000 ≈ ¥1.2 trillion\n- Men 60M × 6 visits/year × ¥1,500 ≈ ¥0.5 trillion\n- Total ≈ ¥1.7 trillion (close to both supply-side and actual figures)\n\nAlign the visit-count unit:\n- Throughout this course we use one shared assumption for "visits per person per year": women = 4/year, men = 6/year (about 5/year averaged across both).\n- Total visits = women 240M + men 360M = about 600M visits/year. Divide by population 124M → about 5 visits/person/year.\n\nKey: Mixing up "X times per month" and "X times per year" shifts the answer by an order of magnitude. Always normalize everything to a final unit (per year) before sanity-checking.',
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
      title: 'Learn the most common mistakes (first three)',
      content: 'Trap (1): Overestimating by assuming "everyone uses it"\n× Smartphone market = total population × smartphone unit price\n○ Smartphone market = buyer cohort × replacement rate × average unit price\n\n-> There are always non-users by age, region, and income. The "everyone" assumption is the single biggest source of overestimation. Keep age-cohort usage rates in mind (teens / 60+ tend to be lower).\n\nTrap (2): Mixing units\n× Conflating monthly and annual numbers\n○ Always make explicit "per year," "per month," or "per day" in the calculation\n\n-> Writing "once a week" but treating it as "once a year" throws your answer off by 52x. Annotate the unit on every factor, and standardize to annual at the very end.\n\nTrap (3): Double-counting\n× Adding B2B + B2C and double-counting intermediate distribution\n○ Standardize on end-consumption (downstream), or diagram the flow to keep it clean',
      visual: 'ThreePillarsDiagram',
      visualProps: {
        sectionLabel: 'Fermi traps — 3 main overestimation sources',
        pillars: [
          { icon: 'All', title: '"Everyone uses it"', body: 'Population × price with no usage rate. Non-users exist by age/region/income. Biggest overestimation source.' },
          { icon: 'Unit', title: 'Mixed units', body: 'Monthly vs annual mixed. "Once a week" treated as "once a year" throws answer off 52x.' },
          { icon: 'Dbl', title: 'Double-counting', body: 'B2B + B2C added with intermediate distribution counted twice. Use end-consumption (downstream).' },
        ],
        hint: 'Before multiplying: are units aligned? Is "everyone" assumed? Same transaction counted twice?',
      },
    },
    {
      type: 'explain',
      title: 'Learn the most common mistakes (last three)',
      content: 'Trap (4): Order-of-magnitude errors\n× Mixing "10,000s" and "100 millions" mid-calculation\n○ Use exponent notation (10^4, 10^8)\n\n-> 1 trillion = 10^12, 100 million = 10^8, 10,000 = 10^4. Adding the exponents alone gives you the order of magnitude, which makes mental math dramatically easier.\n\nTrap (5): Using too many factors\n× Multiplying 6 or 7 factors together to "improve precision"\n○ Keep it to 3-4 factors. Each factor\'s error compounds — adding more factors *worsens* accuracy.\n\n-> Example: population × usage × frequency × price × seasonality × regional adjustment × ... With ±30% error per factor, the final error can balloon several-fold. "Three core factors plus one coefficient" is the sweet spot.\n\nTrap (6): Abandoning common sense\n× Not noticing that your answer is "2x Japan\'s GDP"\n○ Always perform an order-of-magnitude check at the end. Compare against benchmarks like ¥600T GDP, ¥110T national budget, ¥155T retail market.\n\n-> If "convenience-store coffee market = ¥100 trillion" comes out, immediately flag it: "that\'s 16% of Japan\'s GDP — impossible." Build that gut reflex.',
    },
    {
      type: 'quiz',
      explanation: '"Everyone uses it daily" is the classic overestimation. Real usage varies by age, region, habit — always set a usage rate. Option 1 assumes universal use, option 3 attacks from the supply side without showing demand, option 4 is circular reasoning (you\'d need to know the target answer to derive it).',
      question: 'When estimating "annual Uber Eats orders in Japan," which approach is best?',
      options: [
        { label: 'Population × 365 days (assumes everyone uses it daily)', correct: false },
        { label: 'Users × average orders per month × 12 months', correct: true },
        { label: 'Derive from the number of delivery-capable restaurants × orders/store', correct: false },
        { label: 'Market revenue divided by average order value (circular)', correct: false },
      ],
    },
    {
      type: 'explain',
      title: 'Understand why "cross-checking" matters',
      content: 'After estimating, always run a sanity check.\n\nChecklist:\n1. Order of magnitude — if "trillions" pop out, compare to Japan\'s GDP (¥600 trillion). If "billions," compare to a single large company\'s revenue.\n2. Different angle — if you estimated supply-side, also estimate demand-side.\n3. Real-world experience — does it match your or your peers\' lived sense?\n4. Consistency with the news — does it contradict any industry news you know?\n\nGoal: within 1 order of magnitude (within 10x)',
    },
    {
      type: 'quiz',
      explanation: 'Cross-checking means estimating from a different angle (supply-side vs demand-side) and confirming consistency. Option 1 just repeats the same logic, option 3 looks up the answer (defeats the purpose), option 4 adds precision without changing the source of error — a classic misunderstanding.',
      question: 'Which is the most appropriate "cross-check" in Fermi estimation?',
      options: [
        { label: 'Redo the mental arithmetic of the same equation', correct: false },
        { label: 'Estimate the same quantity from another angle (supply ↔ demand)', correct: true },
        { label: 'Look up the correct answer on the internet for confirmation', correct: false },
        { label: 'Increase significant figures and recalculate more precisely', correct: false },
      ],
    },
  ],
}

// -- Lesson 205: Know These by Heart: 30 Base Facts ------------------
const fermiLesson205: LessonData = {
  id: 205,
  title: 'Know These by Heart: 30 Base Facts',
  category: 'Fermi Estimation',
  steps: [
    {
      type: 'explain',
      title: 'Why "base facts" determine your accuracy',
      content: 'Fermi estimation builds a multiplication equation to reach an answer — but where do the numbers for each factor come from?\n\nThe only honest answer is: from the base facts in your head.\n\nSymptoms of someone without base facts:\n- "Japan\'s population is, what, 50 million? Or 300 million?" — they miss the order of magnitude\n- "I don\'t know household count, so I\'ll just use population" — sloppy substitutions\n- The final answer is off by 1-2 orders of magnitude\n\nSymptoms of someone with base facts:\n- They can rattle off "Japan 124M, households 57M, GDP ¥600T" without thinking\n- They drop the right-order-of-magnitude number into each factor instantly\n- They reach a defensible answer in 5 minutes\n\nIn other words, Fermi estimation is "80% logic + 20% memorization." No matter how strong your logic is, an empty base-fact tank means your reasoning rests on sand.\n\nThis lesson focuses on 6 categories × 5 facts = 30 numbers. Mastering these will carry you through ~90% of business-flavored Fermi problems.',
      visual: 'FermiBaseDataDiagram',
    },
    {
      type: 'explain',
      title: 'The 30 base facts, organized into 6 categories',
      content: '1. Population (5)\n- Japan population: 124M\n- Tokyo (prefecture): 14M\n- World population: 8B\n- Annual births: 700K\n- Annual deaths: 1.6M (net negative due to aging society)\n\n2. Households (5)\n- Number of households: 57M\n- Average household size: 2.17 people\n- Share of single-person households: 38%\n- Share of couple-only households: 24%\n- Share of households with children: 27%\n\n3. Labor (5)\n- Labor force: 69M\n- White-collar workers: 35M\n- Average annual income: ¥4.6M\n- Effective job-opening ratio: 1.3\n- Unemployment rate: 2.5%\n\n4. Economy (5)\n- Nominal GDP: ¥600 trillion\n- National budget (general account): ¥110 trillion\n- Household consumption: ¥300 trillion\n- Total ad spend: ¥7 trillion\n- Trade volume (imports + exports): ¥200 trillion\n\n5. Infrastructure (5)\n- Land area: 380,000 km²\n- Flatland ratio: 30% (70% is mountainous)\n- Number of municipalities: 1,700\n- Number of rail stations: 9,500\n- Vending machines: 4M units\n\n6. Industries (5)\n- Automotive industry: ¥60 trillion\n- Retail: ¥155 trillion\n- Food service: ¥25 trillion\n- E-commerce market: ¥25 trillion\n- Convenience-store market: ¥12 trillion',
      visual: 'FermiBaseDataDiagram',
    },
    {
      type: 'explain',
      title: 'Four memorization tricks (without rote)',
      content: 'Trying to memorize 30 numbers cold-turkey leads to failure. Use associations instead.\n\nTrick 1: Memorize the order of magnitude first\nThe exact figure matters less than whether it lives in "trillions," "hundreds of millions," or "tens of thousands."\n- GDP is on the order of trillions -> ¥100T? ¥600T? ¥6,000T? -> ¥600T\n- Households are tens of millions -> 57M\n\nTrick 2: Memorize as ratios\nA number sticks better as "X% of Y" than as a standalone figure.\n- Labor force 69M ≈ 55% of population\n- White-collar 35M ≈ 50% of labor force\n- Flatland 30% ≈ 1/3 of national territory\n\nTrick 3: Divide to "per person / per household"\nDivision converts macro figures into a tangible feel.\n- GDP ¥600T ÷ population 124M ≈ ¥5M per person\n- Household consumption ¥300T ÷ 57M households ≈ ¥5.3M per household per year\n- Ad spend ¥7T ÷ 124M ≈ ¥56K per person per year\n\nTrick 4: Anchor to international or familiar comparisons\n- Tokyo 14M ≈ Los Angeles metro area\n- Japan GDP ¥600T ≈ 1.5x Germany\n- Convenience-store market ¥12T ≈ about 1/10 of the national budget\n\nPower move: Every time you see a number in the news, mentally convert it: "How many trillion is this? What % of the population?" — this builds intuition over time without forced memorization.',
    },
    {
      type: 'explain',
      title: 'Use base facts in the sanity-check phase',
      content: 'The real payoff of base facts comes at the end of an estimate, during sanity-checking.\n\nExample: estimate the "annual customer visits to hair salons in Japan"\n\nSupply-side estimate:\n- 250K salons × 5 customers/day × 25 business days/month × 12 months\n- = 250K × 1,500 = about 375 million customer-visits / year\n\nIs 375M reasonable? Sanity-check against base facts:\n- Per-person visits = 375M ÷ population 124M ≈ 3 visits / person / year\n- Does "once every 4 months" feel right? -> A bit low. Building it up from the demand side gives women = 4/year and men = 6/year (about 5/year averaged), i.e. 600M visits ÷ population 124M ≈ 5 visits / person / year.\n- Supply side (3/year) and demand side (5/year) bracket the truth at 3-5 visits / person / year. This course adopts about 4-5 visits / person / year as the working figure.\n- Either way, keep the unit as "visits / person / year." Getting the unit wrong is what blows up the order of magnitude.\n\nIf the sanity-check came out at "30 visits/person/year," that\'s 2.5 per month — clearly impossible. You caught a calculation error.\n\nThree sanity-check patterns:\n1. Divide by population (124M) -> per-person scale\n2. Divide by household count (57M) -> per-household scale\n3. Compare to GDP (¥600T) -> share of the whole economy (e.g., convenience-store market ¥12T ÷ GDP ¥600T = 2%, plausible)\n\nBottom line: Adding even one "what is this per person?" check at the end of every estimate catches 90% of order-of-magnitude and logic errors.',
    },
    {
      type: 'quiz',
      explanation: 'Japan has about 57M households (as of 2025). Population 124M divided by average household size 2.17 lands here exactly. Option 1 understates by half, option 3 overstates, option 4 confuses households with population (124M is population). Remember: "households ≈ a bit under half of the population."',
      question: 'Which is closest to the number of households in Japan?',
      options: [
        { label: 'About 30 million', correct: false },
        { label: 'About 57 million', correct: true },
        { label: 'About 80 million', correct: false },
        { label: 'About 120 million', correct: false },
      ],
    },
    {
      type: 'quiz',
      explanation: '124M ÷ 57M ≈ 2.17 people per household. Option 1 only weights single-person households (38%) and undershoots, option 3 over-applies a child-rearing household model to the whole, option 4 confuses with the 1950s-era average (around 4 people). Aging and singularization keep pushing this number down year over year.',
      question: 'Using Japan\'s population of 124M and 57M households, what is the average household size?',
      options: [
        { label: 'About 1.5 people', correct: false },
        { label: 'About 2.2 people', correct: true },
        { label: 'About 3.0 people', correct: false },
        { label: 'About 4.0 people', correct: false },
      ],
    },
    {
      type: 'quiz',
      explanation: '¥600T GDP ÷ 124M population ≈ ¥4.84M/person ≈ about ¥5M. Option 1 vastly overestimates population (would imply ~600M), option 2 confuses GDP with tax revenue (¥70T ÷ 124M ≈ ¥565K), option 4 confuses with household income (¥5M × 2.17 average household ≈ over ¥10M). Memorize the pair: "GDP ≈ ¥5M per capita."',
      question: 'Given Japan\'s GDP of about ¥600 trillion, what is GDP per capita?',
      options: [
        { label: 'About ¥1 million', correct: false },
        { label: 'About ¥3 million', correct: false },
        { label: 'About ¥5 million', correct: true },
        { label: 'About ¥10 million', correct: false },
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
  205: fermiLesson205,
}
