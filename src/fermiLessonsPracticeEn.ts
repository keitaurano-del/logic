/**
 * Fermi Estimation Practice Course (fermi-03)
 * Lesson IDs: 220-226
 * Category: 'Fermi Estimation'
 *
 * Difficulty ladder: very easy (daily) → easy (familiar business) → mid (industry)
 * → mid-hard (compound decomposition) → hard (demand ÷ supply)
 * → very hard (MBB case-interview level) → very hard (abstract / advanced)
 */
import type { LessonData } from './lessonData'

// -- Lesson 220: Level 1 — Daily estimates ----------------------------
const fermiLesson220: LessonData = {
  id: 220,
  title: 'Level 1: Daily estimates (very easy)',
  category: 'Fermi Estimation',
  steps: [
    {
      type: 'explain',
      title: 'Start with things you can see',
      content: 'The first Fermi-estimation practice should use targets you can verify on the spot.\n\nTraits of the very-easy level:\n- Answers can be checked (count them yourself)\n- Zero or one base-fact required\n- One or two factors are enough\n\nWhat you build at this level:\n- The feel of "decomposing into factors"\n- A sense of magnitude (the difference between 10 / 100 / 1,000)\n- The satisfaction of confirming a calculation against reality\n\nThree examples today:\n1. Students in a classroom\n2. Sales of a school-festival takoyaki stand\n3. Passengers on a rush-hour train\n\nAll three are "you can look and count" topics, so you can spin the estimate → verify loop quickly.',
    },
    {
      type: 'explain',
      title: 'Example 1: students in a high-school classroom',
      content: 'Question: how many students are in a standard high-school class?\n\nStep 1: decompose\n- Use room area × area per student, or\n- Use desk rows × desk columns\n- Either works — pick whichever is easier\n\nStep 2: factors (desk-based)\n- Rows (from blackboard to back wall): 6\n- Columns (from window side to corridor): 6\n\nStep 3: calculate\n```\n6 × 6 = 36 students\n```\n\nActual: Japanese high-school classes are standardised at 35-40 students\n→ Spot on.\n\nTakeaway:\n- Physically arranged objects only need two factors (rows × columns)\n- Practicing "6 × 6 = 36" in your head is great mental-warmup for estimation',
    },
    {
      type: 'explain',
      title: 'Example 2: takoyaki stand at the school festival',
      content: 'Question: how much does a school-festival takoyaki stand make in one day?\n\nStep 1: decompose\n```\nrevenue = customers × ticket price\n```\n\nStep 2: decompose customers\n- Hours open: 6 (10:00-16:00)\n- Customers per hour: 30 (one every 2 minutes)\n- Total: 180 customers\n\nStep 3: ticket price\n- One pack: ¥300\n- One pack per customer\n- Average ticket: ¥300\n\nStep 4: calculate\n```\n180 × 300 = ¥54,000\n```\n\n→ A booming day at 60 customers/hour adds ¥36,000 → ~¥90,000\n\nTakeaway:\n- Starting from "per unit time" makes the customer count easy to build\n- Subtracting cost (ingredients + labour) reveals the underlying business shape',
    },
    {
      type: 'explain',
      title: 'Example 3: passengers on a rush-hour train',
      content: 'Question: how many people ride a packed 10-car commuter train?\n\nStep 1: decompose\n- Passengers per car × number of cars\n\nStep 2: per car\n- Car dimensions: 20m × 3m = 60 m²\n- Standing area (excluding aisles/seats): about 40 m²\n- Packed density: 4 people per m² (congestion rate 200%)\n- Standing: 40 × 4 = 160\n- Seats: two long benches × 7 + four 3-person end seats = 26 seats (E233-style)\n- Per car: about 186\n\nStep 3: full train\n- 10 cars: 186 × 10 = about 1,860 people\n\nActual: Yamanote 11-car capacity 1,752; at 150% congestion ~2,600\n→ The answer changes depending on whether you mean "capacity," "actual riders," or "max sustainable load." Define the premise.\n\nTakeaway:\n- Practice combining physical size × density\n- Understand industry terms like "capacity" and "200% congestion"',
    },
    {
      type: 'think',
      question: 'Estimate the daily customer count of a small neighborhood supermarket (sales floor 200 m²).',
      hint: 'Splitting the day into time bands (morning, midday, evening, night) makes it easier to build. Each band has a different peak.',
      modelAnswer: 'Answer: ~500 customers/day\n\nStep 1: customers by time band (small store)\n- Morning (07:00-10:00, 3h): 20/h = 60\n- Midday (10:00-15:00, 5h): 30/h = 150\n- Evening (15:00-19:00, 4h, peak): 60/h = 240\n- Night (19:00-22:00, 3h): 20/h = 60\n\nStep 2: total\n```\n60 + 150 + 240 + 60 ≈ ~510 customers\n```\n\nActual: Japanese supermarkets average 1,500-3,000/day\n→ That is the large-store average. A 200 m² small store at 300-600/day matches our estimate.\n\nTakeaway:\n- Splitting peak vs off-peak gives a realistic answer\n- Time-band decomposition beats one flat average',
      points: [
        'Account for how crowding varies by time of day',
        'Build peak (evening) and off-peak (morning) separately',
        'Store size changes the customer-count expectation (200 m² → 500-800/day)',
      ],
    },
    {
      type: 'quiz',
      explanation: 'A packed Yamanote-style car at 150% congestion holds about 200 people. Option 1 (~50) is just the seat count; option 3 (~500) is dangerous overload territory; option 4 (~1,000) exceeds the physical capacity. Memorise "one packed car ≈ 200 people" — you can flex with car count and congestion later.',
      question: 'Which is closest to the number of passengers in one car of a packed train (150% congestion)?',
      options: [
        { label: 'About 50 people', correct: false },
        { label: 'About 200 people', correct: true },
        { label: 'About 500 people', correct: false },
        { label: 'About 1,000 people', correct: false },
      ],
    },
    {
      type: 'quiz',
      explanation: 'Daily estimates should start from "physical quantities you can count" (rows × columns, time × tickets). Option 1 is right. Option 2 is the unknown you are solving for. Option 3 is technically usable but not for mental math. Option 4 over-engineers precision. Counting from observable physical quantities is the very-easy-level habit.',
      question: 'At the very-easy level, what is the most appropriate starting factor for a Fermi estimate?',
      options: [
        { label: 'A physically countable quantity (rows × columns, time × price, etc.)', correct: true },
        { label: 'The number you are trying to estimate', correct: false },
        { label: 'A detailed government index value', correct: false },
        { label: 'A coefficient calibrated to several decimal places', correct: false },
      ],
    },
    {
      type: 'quiz',
      explanation: 'The biggest value at this level is starting from "verifiable daily targets" where the gap between estimate and reality is short. Option 1 misses the Fermi point (no data needed → no estimation). Option 3 over-engineers. Option 4 is data collection, not estimation. Drilling the "estimate → measure → diagnose" loop is the purpose of the very-easy level.',
      question: 'What is the biggest learning value of very-easy Fermi estimates (level 1)?',
      options: [
        { label: 'Carefully gather upfront data to maximise precision', correct: false },
        { label: 'Spin the "estimate → verify → diagnose the gap" loop at high speed', correct: true },
        { label: 'Calculate to three decimal places', correct: false },
        { label: 'Include many uncertain factors to broaden the thinking', correct: false },
      ],
    },
  ],
}

// -- Lesson 221: Level 2 — Familiar business --------------------------
const fermiLesson221: LessonData = {
  id: 221,
  title: 'Level 2: Familiar business (easy)',
  category: 'Fermi Estimation',
  steps: [
    {
      type: 'explain',
      title: 'Estimate the economics of stores you actually use',
      content: 'At level 2 you estimate the revenue of stores you experience as a customer.\n\nTraits of the easy level:\n- You know the store as a customer (you can feel ticket price and crowding)\n- Factors grow to three or four\n- Answers can be checked against industry estimates or listed-company filings\n\nWhat you build:\n- The equation: revenue = customers × ticket × operating days\n- A "yardstick" for store-level economics (annual revenue per store)\n- The ability to convert industry size into gut-feel numbers\n\nThree examples today:\n1. Starbucks: revenue per store\n2. Local hair salon: monthly revenue\n3. Convenience store: customer count',
      visual: 'FermiFormulaDiagram',
      visualProps: {
        sectionLabel: 'Per-store revenue — customers × ticket × days',
        factors: [
          { label: 'Customers / day', value: 'count', unit: 'people' },
          { label: 'Ticket', value: 'price', unit: 'yen' },
          { label: 'Operating days', value: 'days', unit: 'days / yr' },
        ],
        result: { label: 'Annual revenue', value: '?', unit: 'yen' },
        hint: '"chairs × turn rate" is the shared move across beauty / dining / massage',
      },
    },
    {
      type: 'explain',
      title: 'Example 1: annual revenue of one Starbucks',
      content: 'Question: what is the annual revenue of one Starbucks store?\n\nStep 1: decompose\n```\nannual revenue = customers/day × ticket × operating days\n```\n\nStep 2: factors\n- Customers/day: peak 50/h × 14h open × peak ratio 0.5 = 350\n- Ticket: drink ¥500 + food add-on = ¥600\n- Operating days: 360/yr (closed only rarely)\n\nStep 3: calculate\n```\n350 × 600 × 360 ≈ ~¥75.6M\n```\n\n→ Per-store annual revenue just under ¥100M\n\nActual: Starbucks Japan averages ~¥100-120M per store (¥200B revenue ÷ 1,800 stores)\n→ Matches.\n\nTakeaway:\n- "¥100M per store" is the Starbucks-class yardstick\n- Same method lets you compare Doutor (¥60M/store) and Saint Marc (¥50M/store)',
      visual: 'FermiFormulaDiagram',
      visualProps: {
        sectionLabel: 'Starbucks — revenue per store / year',
        factors: [
          { label: 'Customers / day', value: '350', unit: 'people' },
          { label: 'Ticket', value: '600', unit: 'yen' },
          { label: 'Operating days', value: '360', unit: 'days' },
        ],
        result: { label: 'Annual revenue', value: '~75.6', unit: 'M yen' },
        hint: 'Actual avg ¥100-120M / store. "¥100M per store" is the yardstick',
      },
    },
    {
      type: 'explain',
      title: 'Example 2: monthly revenue of a local hair salon',
      content: 'Question: monthly revenue of a typical owner-run salon (3 chairs)?\n\nStep 1: decompose\n```\nmonthly revenue = customers/day × ticket × operating days\n```\n\nStep 2: factors\n- Customers/day: 3 chairs × 4 turns = 12 → weekdays half-full = 8\n- Ticket: cut ¥5,000 / colour ¥10,000 — average ¥6,000\n- Operating days: closed one day/week → 26/month\n\nStep 3: calculate\n```\n8 × 6,000 × 26 ≈ ~¥1.25M/month\n→ ~¥15M/year\n```\n\nActual: owner-run salons average ¥15-20M/year (industry survey)\n→ Matches.\n\nTakeaway:\n- "chairs × turn rate" for daily customers is shared with beauty / dining / massage\n- Subtracting cost (rent ¥300K + labour + materials) reveals owner take-home',
      visual: 'FermiFormulaDiagram',
      visualProps: {
        sectionLabel: 'Owner-run hair salon (3 chairs) — monthly revenue',
        factors: [
          { label: 'Customers / day', value: '8', unit: 'people' },
          { label: 'Ticket', value: '6,000', unit: 'yen' },
          { label: 'Operating days', value: '26', unit: 'days / mo' },
        ],
        result: { label: 'Monthly revenue', value: '~1.25', unit: 'M yen / mo' },
        hint: 'Annualises to ~¥15M, matching the industry avg ¥15-20M',
      },
    },
    {
      type: 'think',
      question: 'Estimate the daily customer count of a single convenience store. Start from your feel as a customer.',
      hint: 'Split the day into morning, midday, evening, night, and late night. Convenience stores run 24/7 and have extreme time-band variation.',
      modelAnswer: 'Answer: ~1,000 customers/day\n\nStep 1: customers by time band (urban standard store)\n- Morning (06-10, 4h): commuter rush at 80/h = 320\n- Midday (10-14, 4h): lunch demand at 100/h = 400\n- Evening (14-19, 5h): 40/h = 200\n- Night (19-23, 4h): 30/h = 120\n- Late night (23-06, 7h): 10/h = 70\n\nStep 2: total\n```\n320 + 400 + 200 + 120 + 70 ≈ ~1,100 customers\n```\n\nActual: Japanese convenience stores average 900-1,200/day (industry data)\n→ Matches.\n\nTakeaway:\n- Morning + midday accounts for 65% of total customers\n- 1,000 customers × ¥700 ticket = ¥700K/day = ¥250M/year\n- 1,000/14h ≈ 45/h ≈ one transaction every 1-2 minutes',
      points: [
        'Split peaks and troughs by time band (morning + midday are twin peaks)',
        '"1,000 customers/store/day" is the convenience-store yardstick',
        'Get into the habit of converting to annual revenue (customers × ticket × 365)',
      ],
    },
    {
      type: 'quiz',
      explanation: 'A Starbucks store earns about ¥100M/year. Option 1 (~¥10M) is independent-cafe territory; option 3 (~¥1B) only fits flagship megastores; option 4 (~¥10B) is whole-business scale. Memorise "Starbucks store ≈ ¥100M/year" and you can estimate other chains fast.',
      question: 'Which is closest to a Starbucks store\'s annual revenue?',
      options: [
        { label: 'About ¥10M', correct: false },
        { label: 'About ¥100M', correct: true },
        { label: 'About ¥1B', correct: false },
        { label: 'About ¥10B', correct: false },
      ],
    },
    {
      type: 'quiz',
      explanation: 'An urban convenience store averages about 1,000 customers/day (industry average). Option 1 (~100) is a rural micro-store; option 3 (~5,000) is a star location at a major terminal; option 4 (~10,000) is physically impossible (400/h = one every 9 seconds). The yardstick is "convenience store: 1,000 customers × ¥700 ticket = ¥700K/day."',
      question: 'Which is closest to the daily average customers of one convenience store?',
      options: [
        { label: 'About 100', correct: false },
        { label: 'About 1,000', correct: true },
        { label: 'About 5,000', correct: false },
        { label: 'About 10,000', correct: false },
      ],
    },
    {
      type: 'quiz',
      explanation: 'The salon yardstick is "monthly revenue per chair: ¥300-400K." Three chairs → ¥1-1.2M/month → ¥15-18M/year, the standard for owner-run shops. Option 1 underestimates (less than one chair); option 3 (~¥100M) is large or chain scale; option 4 (~¥5B) is a listed cafe chain.',
      question: 'Which is closest to the annual revenue of a typical 3-chair owner-run salon?',
      options: [
        { label: 'About ¥2M', correct: false },
        { label: 'About ¥15M', correct: true },
        { label: 'About ¥100M', correct: false },
        { label: 'About ¥5B', correct: false },
      ],
    },
  ],
}

// -- Lesson 222: Level 3 — Industry scale -----------------------------
const fermiLesson222: LessonData = {
  id: 222,
  title: 'Level 3: Industry scale (medium)',
  category: 'Fermi Estimation',
  steps: [
    {
      type: 'explain',
      title: 'Estimate an industry size in five minutes',
      content: 'At level 3 you estimate annual market size for a specific industry. New-business planning, sales targeting, and investment decisions ask this every day.\n\nTraits of the medium level:\n- Includes industries you are not a direct customer of\n- Four or five factors\n- Can be compared against industry reports (METI, Yano Research, etc.)\n\nUniversal formula:\n```\nindustry size = target population × usage rate × frequency × ticket\n```\n\nThree examples today:\n1. Pet-food market (B2C)\n2. Wedding market (rare-life-event market)\n3. Golf market (hobby / sports market)\n\nEach one needs a different way to narrow the target population.',
      visual: 'FermiFormulaDiagram',
      visualProps: {
        sectionLabel: 'Universal industry-size formula',
        factors: [
          { label: 'Target population', value: '?', unit: 'people' },
          { label: 'Usage rate', value: '?', unit: '%' },
          { label: 'Frequency', value: '?', unit: '/year' },
          { label: 'Ticket', value: '?', unit: '¥' },
        ],
        result: { label: 'Industry size', value: '?', unit: '¥/year' },
        hint: 'Fill 4 factors to get an order-of-magnitude size. Apply to 3 industries in this lesson',
      },
    },
    {
      type: 'explain',
      title: 'Example 1: Japanese pet-food market',
      content: 'Question: annual market size for dog & cat food in Japan?\n\nStep 1: decompose\n```\nmarket = animals owned × annual food cost per animal\n```\n\nStep 2: estimate animals owned\n- Households: 57M\n- Dog ownership rate 12%, cat 10%\n- Dogs: 57M × 0.12 × 1.2/household = ~8.2M\n- Cats: 57M × 0.10 × 1.5/household = ~8.55M\n- Total: ~16.75M animals\n\nStep 3: food cost per animal\n- ¥3,000/month × 12 = ¥36,000/year\n\nStep 4: calculate\n```\n16.75M × ¥36,000 = ~¥600B\n```\n\nActual: pet-food market ~¥500-600B (Pet Food Association)\n→ Matches.\n\nKey point: B2C markets follow "target households × consumption per unit" as the standard build.',
      visual: 'FermiFormulaDiagram',
      visualProps: {
        sectionLabel: 'Japanese pet-food market',
        factors: [
          { label: 'Pets owned', value: '16.75', unit: 'M animals' },
          { label: 'Annual food cost', value: '36,000', unit: '¥/animal' },
        ],
        result: { label: 'Market size', value: '~600', unit: '¥B/year' },
        hint: 'Pet Food Association ~¥500-600B matches. B2C: target count × per-unit consumption',
      },
    },
    {
      type: 'explain',
      title: 'Example 2: Japanese wedding market',
      content: 'Question: annual size of the Japanese wedding market?\n\nStep 1: decompose\n```\nmarket = annual marriages × ceremony rate × cost per ceremony\n```\n\nStep 2: factors\n- Annual marriages: 500K (declining with population)\n- Ceremony rate: 50% (no-ceremony weddings are rising — about half)\n- Cost per ceremony: ¥3M (reception + dress + photo + favours)\n\nStep 3: calculate\n```\n500K × 0.5 × ¥3M = ~¥750B\n```\n\nActual: Japanese wedding market ~¥500-600B (bridal industry)\n→ Slightly high; trimming average cost to ¥2.5M matches.\n\nKey point:\n- Build with "event count × rate," not "population × usage rate" — special pattern\n- High-ticket markets (¥3M each) become huge even with few events',
      visual: 'FermiFormulaDiagram',
    },
    {
      type: 'think',
      question: 'Estimate the annual size of the Japanese golf market (play fees + gear + lessons).',
      hint: 'Build the golf population and per-person annual spend. Play fees (8-10 rounds × ¥15K) + gear (¥50K refresh/year) + lessons (a subset at ¥10K/month) is a natural build.',
      modelAnswer: 'Answer: ~¥1.5T/year\n\nStep 1: golf population\n- Population 124M × golf participation 8% = ~10M people\n\nStep 2: annual spend per person\n- Play fees: 8 rounds × ¥15K = ¥120K/year\n- Gear (clubs, balls, wear): ¥30K/year\n- Lessons (a small share): ¥10K/year on average\n- Total: ~¥160K/person/year\n\nStep 3: calculate\n```\n10M × ¥160K = ~¥1.6T\n```\n\nActual: Japanese golf market ~¥1.4-1.5T (Golf Equipment Association + play-market estimate)\n→ Matches.\n\nTakeaway:\n- Golf is built by stacking three segments: play, gear, lessons\n- You can refine further by tiering users (heavy / light / very light)\n- Hobby markets live or die on participant-population scoping',
      points: [
        'Hobby markets: participants × annual spend per participant',
        'Segment decomposition (play / gear / lessons) raises precision',
        'Tiered segmentation (heavy / light) refines further',
      ],
    },
    {
      type: 'quiz',
      explanation: 'The Japanese pet-food market is ~¥500-600B. Option 1 (~¥10B) is one segment of children\'s toys; option 3 (~¥30T) is the entire dining-out market; option 4 (~¥300T) is half of GDP, physically impossible. Memorise "pets ≈ hundreds of billions of yen."',
      question: 'Which is closest to the annual size of the Japanese pet-food market?',
      options: [
        { label: 'About ¥10B', correct: false },
        { label: 'About ¥600B', correct: true },
        { label: 'About ¥30T', correct: false },
        { label: 'About ¥300T', correct: false },
      ],
    },
    {
      type: 'quiz',
      explanation: 'The right base population for pet ownership is "households." Households (option 1) is correct. Counting per individual double-counts shared pets. Option 3 (corporates) makes no sense — corporates rarely own pets. Option 4 is unrelated.',
      question: 'Which base population is most appropriate for estimating the pet market?',
      options: [
        { label: 'Households: 57M', correct: true },
        { label: 'Population: 124M', correct: false },
        { label: 'Corporates: 2.8M', correct: false },
        { label: 'Workforce: 69M', correct: false },
      ],
    },
    {
      type: 'quiz',
      explanation: 'For industry-scale estimates, the factor that drives precision the most is "how you scope the target population (base)." Option 1 is right. Option 2 (decimal-place precision) is over-engineering. Option 3 (look up the report) defeats estimation. Option 4 (frequency) matters after you scope the base.',
      question: 'At the medium industry-size level, which factor most determines precision?',
      options: [
        { label: 'How you scope the target population (base)', correct: true },
        { label: 'Two-decimal-place ticket-price precision', correct: false },
        { label: 'Looking up the industry report directly', correct: false },
        { label: 'How finely you slice frequency (monthly vs daily)', correct: false },
      ],
    },
  ],
}

// -- Lesson 223: Level 4 — Compound decomposition ---------------------
const fermiLesson223: LessonData = {
  id: 223,
  title: 'Level 4: Compound decomposition — segments (mid-hard)',
  category: 'Fermi Estimation',
  steps: [
    {
      type: 'explain',
      title: 'Push precision higher with "segment splits"',
      content: 'Level 4 introduces splitting one market into multiple segments and stacking them.\n\nWhy segment splits matter:\n- A "national average" averages non-users and super-heavy users into one wrong number\n- By age, gender, income — groups with different consumption patterns must be split\n\nStandard segmentation axes:\n- Age (20s / 30s / 40s / 50+)\n- Gender (female / male)\n- Income (<¥3M / ¥3-6M / ¥6-10M / >¥10M)\n- Usage intensity (heavy / light / non-user)\n\nTwo examples today:\n1. E-commerce market (by product category)\n2. Cosmetics market (by age × gender)',
      visual: 'FermiMacroMicroSplitDiagram',
    },
    {
      type: 'explain',
      title: 'Example 1: e-commerce market by product category',
      content: 'Question: Japanese B2C EC market, by category\n\n### Category A: physical goods\n- Users: population 124M × EC usage 60% = 74M\n- Annual spend: ¥80K (books, clothing, food, etc.)\n- Size: ~¥5.9T\n\n### Category B: services (travel, tickets, etc.)\n- Users: 124M × 30% = 37M\n- Annual spend: ¥50K\n- Size: ~¥1.85T\n\n### Category C: digital (e-books, streaming, games)\n- Users: 124M × 50% = 62M\n- Annual spend: ¥15K\n- Size: ~¥930B\n\n### Total: ~¥8.7T\n\nActual: Japanese B2C EC ~¥22T (METI 2023)\n→ Bump physical to ~¥14T, services to ~¥5T (travel recovery), and the numbers align.\n\nTakeaway:\n- Vary "users × usage rate × ticket" per segment and stack\n- Single averages miss things like the rapid growth of the services segment',
      visual: 'FermiMacroMicroSplitDiagram',
    },
    {
      type: 'case',
      title: 'Case: segment analysis of the cosmetics market',
      situation: 'You are a marketer for a cosmetics brand considering new entry. You must estimate the Japanese cosmetics market by age × gender segment and identify the most promising target segment.',
      phases: [
        {
          info: 'Phase 1: To estimate the total cosmetics market, split female population by age. Japanese female population is ~63M, and women aged 20-50 (~27M) are the core target.',
          question: 'Which segmentation axis adds the most precision to a cosmetics market estimate?',
          options: [
            { label: 'Split by prefecture (47 prefectures)', correct: false, feedback: 'Urban vs rural differences exist, but age and gender drive product category and purchase frequency far more strongly.' },
            { label: 'Cross-segment by age × gender (two axes)', correct: true, feedback: 'Correct. Product mix (skincare / makeup / anti-ageing) varies by age, and usage rate by gender differs greatly — these two axes hit hardest.' },
            { label: 'Weekday vs weekend purchase ratio', correct: false, feedback: 'Cosmetics purchases are low-frequency (a few times per month at most); the day-of-week split contributes very little to market size.' },
            { label: 'Split products by colour (red / blue / green …)', correct: false, feedback: 'A product-level split, far too granular as a market-size segmentation axis.' },
          ],
        },
        {
          info: 'Phase 2: Using age × gender, assume 20-30s women (12M) × ¥60K/year, 40-50s women (15M) × ¥100K/year, 20-50s men (28M) × ¥10K/year.',
          question: 'At this stage, which is closest to the total cosmetics market size?',
          options: [
            { label: 'About ¥50B', correct: false, feedback: 'Calculate first: 12M × ¥60K + 15M × ¥100K + 28M × ¥10K. Approximate the sum.' },
            { label: 'About ¥2.5T', correct: true, feedback: 'Correct. 12M × ¥60K = ¥720B, 15M × ¥100K = ¥1.5T, 28M × ¥10K = ¥280B → total ~¥2.5T.' },
            { label: 'About ¥20T', correct: false, feedback: '3% of GDP (¥600T) is too large for cosmetics. Actual is ¥2-3T.' },
            { label: 'About ¥200T', correct: false, feedback: 'One-third of GDP — physically impossible. Always sanity-check magnitudes.' },
          ],
        },
        {
          info: 'Phase 3: Actual Japanese cosmetics market is ~¥2.5-3T (Japan Cosmetic Industry Association). Of the three segments, 40-50s women contribute the most (¥1.5T, 60% of market). Now plan entry strategy.',
          question: 'Which entry strategy best fits the market structure shown by the estimate?',
          options: [
            { label: '20-30s women, value-priced lineup (segment ¥720B)', correct: false, feedback: 'Attractive but a red ocean dominated by Shiseido, Kose, foreign brands. Size-wise it loses to 40-50s women.' },
            { label: '40-50s women, anti-ageing focus (segment ¥1.5T)', correct: true, feedback: 'Correct. Largest segment (60% share) plus high ticket (¥100K/year). Anti-ageing has differentiation room — a rational entry priority.' },
            { label: 'Men\'s cosmetics (segment ¥280B)', correct: false, feedback: 'Growing fast but market size is small. Too tight as a primary entry target.' },
            { label: 'Spread marketing evenly across all segments', correct: false, feedback: 'Resource fragmentation = lose everywhere. Segmentation exists to choose where to concentrate.' },
          ],
        },
      ],
      conclusion: 'Takeaway: the real value of segment splits\n\n- The "largest / highest-ticket segment" is invisible in a flat average\n- In cosmetics, 40-50s women account for 60% of the market\n- Entry strategy = "biggest segment × differentiation room"\n\nOperating rules:\n1. Limit to two axes (more = complexity)\n2. Set usage rate and ticket independently per segment\n3. Extract biggest / fastest-growing segments to fuel strategy debates',
    },
    {
      type: 'think',
      question: 'Use segment splits to estimate the Japanese SVOD market (Netflix, Amazon Prime, Disney+, etc.). Choose either age-based or household-based, and split into 3-4 segments.',
      hint: 'Household-based: subscriptions × monthly fee × 12. Age-based: usage rate by age × monthly fee. Three or four segments is easiest.',
      modelAnswer: 'Answer: ~¥500B/year\n\n### Household-based segmentation\n- Households: 57M\n\nSubscription rate by segment:\n- 20-30s households (12M): subscription rate 60% = 7.2M subs × ¥1,500/mo × 12 = ¥130B\n- 40-50s households (20M): subscription rate 40% = 8M subs × ¥1,500/mo × 12 = ¥144B\n- 60+ households (25M): subscription rate 15% = 3.75M subs × ¥1,500/mo × 12 = ¥67.5B\n- Single younger households (excl. 5-15): 3M subs × ¥1,500/mo × 12 = ¥54B\n\nTotal: ~¥400B\n\nActual: Japanese SVOD ~¥500-600B (GEM Partners 2023)\n→ Matches.\n\nTakeaway:\n- Subscription rate by age (young high / old low) improves precision\n- Adding "multi-service subscription" (1.5 subs/household) refines further',
      points: [
        'Cross household × age subscription rate (two axes)',
        'Subscription rate differs 4x between young and old',
        'Multi-subs (1.5/household) push the estimate higher',
      ],
    },
    {
      type: 'quiz',
      explanation: 'Segment splits make visible "the structure (largest segment, highest-ticket segment) hidden by a flat average." Option 1 is right. Option 2 is the opposite of simplification. Option 3 is a different pattern (macro/micro). Option 4 misses the point.',
      question: 'What is the biggest value of segment splits?',
      options: [
        { label: 'Reveals segment-level structure (biggest / highest-ticket) hidden by averages', correct: true },
        { label: 'Simplifies calculations', correct: false },
        { label: 'Lets you compute both demand and supply sides', correct: false },
        { label: 'Raises precision from 2 to 5 significant digits', correct: false },
      ],
    },
    {
      type: 'quiz',
      explanation: 'The largest cosmetics segment is 40-50s women. About 60% of the ¥2.5-3T market. 20-30s women have lower ticket and smaller scale (~¥720B); men is growing but still small (~¥300B); 60+ women is a narrower slice.',
      question: 'Which segment contributes the most to the cosmetics market?',
      options: [
        { label: '20-30s women', correct: false },
        { label: '40-50s women', correct: true },
        { label: '20-50s men', correct: false },
        { label: '60+ women only', correct: false },
      ],
    },
  ],
}

// -- Lesson 224: Level 5 — Demand ÷ Supply (hard) ---------------------
const fermiLesson224: LessonData = {
  id: 224,
  title: 'Level 5: Demand ÷ Supply applied (hard)',
  category: 'Fermi Estimation',
  steps: [
    {
      type: 'explain',
      title: 'Apply demand ÷ supply to harder problems',
      content: 'Level 5 puts the demand ÷ supply pattern from fermi-02 into harder, applied problems.\n\nDifference from levels 1-4:\n- The output is "headcount needed," not "market size"\n- The demand side becomes multi-stage\n- The hidden labour structure of an industry becomes visible\n\nTypical problem traits:\n- "How many [profession] are there in Japan?"\n- "How much labour does industry X need?"\n- You must estimate annual throughput per person from a sense of the field\n\nTwo examples today:\n1. Piano tuners (the canonical Fermi problem, Japan edition)\n2. Medical office clerks\n\nBoth apply the technique from fermi-02 lesson 215.',
      visual: 'FermiDemandDivSupplyDiagram',
    },
    {
      type: 'explain',
      title: 'Applied: medical office clerks in Japan',
      content: 'Question: how many medical office clerks are there in Japan?\n\n### Macro demand: annual claim-processing volume\n- Hospitals & clinics: 170K facilities\n- Monthly patient visits per facility:\n  - Hospitals (8K): 1,500/month\n  - Clinics (162K): 200/month\n- Monthly claims:\n  - Hospitals: 8K × 1,500 = 12M\n  - Clinics: 162K × 200 = 32.4M\n- Monthly total: ~44.4M\n- Annual: 44.4M × 12 = ~530M claims\n\n### Micro supply: throughput per clerk\n- Per day: 100 claims (chart management + reception + billing)\n- Working days: 240/year (healthcare standard)\n- Per clerk: 100 × 240 = 24,000 claims/year\n\n### Headcount\n```\n530M ÷ 24,000 ≈ ~22,000 people\n```\n\n→ Hmm. Actual is wider.\n\nActual: Japanese medical clerks ~250-300K (MHLW stats, certification holders)\n→ Our estimate is 10-15x low. The "throughput per person" was too high — claims-handling includes verification, refile cycles, training, leave, etc.\n- Recalc: 30 claims/day × 240 days = 7,200/year → 530M ÷ 7,200 ≈ 73K, still low.\n- Demand side needs widening too: outpatient clerks also handle non-claim work (reception, scheduling) → roughly tripling headcount.\n\nTakeaway: demand ÷ supply makes "industry labour structures you don\'t live in" visible.',
      visual: 'FermiDemandDivSupplyDiagram',
    },
    {
      type: 'case',
      title: 'Case: quantifying the delivery-driver shortage',
      situation: 'You are head of strategy at a logistics company. EC growth has triggered cries of "driver shortage" — you must quantify the gap. Use demand ÷ supply to compare "needed" vs "actual" headcount.',
      phases: [
        {
          info: 'Phase 1: Build the demand side. Japanese EC market ¥25T at ¥10K average order = 2.5B orders/year. Add non-EC (gifts, documents, etc.) at 5B and small-parcel / new-year cards at 1.5B → total annual delivery volume.',
          question: 'Which is closest to Japan\'s annual delivery volume?',
          options: [
            { label: 'About 0.5B parcels', correct: false, feedback: 'EC alone is 2.5B — too low. Build EC + non-EC together.' },
            { label: 'About 5B parcels', correct: false, feedback: 'Still low. EC 2.5B + non-EC 5B + other 1.5B ≈ 9B/year.' },
            { label: 'About 9B parcels', correct: true, feedback: 'Correct. 2.5 + 5 + 1.5 = 9B/year. This is the quantitative size of the Japanese delivery market.' },
            { label: 'About 50B parcels', correct: false, feedback: 'Too high. 400 parcels/person/year is impossible (household of 3 → 1,200/year = 25/week).' },
          ],
        },
        {
          info: 'Phase 2: Build the micro supply. One driver: 100 parcels/day × 250 working days/year = 25,000 parcels/driver/year. This matches the fermi-02 lesson 215 calculation.',
          question: 'Demand 9B ÷ supply 25,000 — which is the needed driver count?',
          options: [
            { label: 'About 50K', correct: false, feedback: 'Calculate: 9B / 25,000 = 360K. One digit low.' },
            { label: 'About 360K', correct: true, feedback: 'Correct. 9B / 25,000 = 360,000. That is the headcount "needed" to meet demand.' },
            { label: 'About 1M', correct: false, feedback: 'Too high. At 100 parcels/day, 1M drivers would mean 35 parcels/day per driver — overstaffed.' },
            { label: 'About 5M', correct: false, feedback: '7%+ of the workforce. Close to the entire logistics industry — too large.' },
          ],
        },
        {
          info: 'Phase 3: Actual truck / delivery drivers are 300-400K (MHLW). Needed ~360K vs actual 300-400K = roughly balanced. Yet the industry shouts "shortage." Why?',
          question: 'Calculations show "needed ≈ actual" — what most plausibly explains the industry-reported shortage?',
          options: [
            { label: 'The calc is wrong; there is no shortage', correct: false, feedback: 'The calc is roughly right. The issue lies elsewhere.' },
            { label: 'Demand growth (EC up) + ageing drivers retiring → 5-year shortage looms', correct: true, feedback: 'Correct. Today balances, but trends (demand +, ageing-driven attrition) project a 10-20% shortage in 5 years. This kind of "Why" structure is what makes Fermi useful.' },
            { label: 'Half of drivers are incompetent so only half effectively work', correct: false, feedback: 'Individual variance exists, but halving an entire industry is unrealistic.' },
            { label: 'The shortage is fake; there is actually a surplus', correct: false, feedback: 'Multiple signals (delays, redelivery rates, 3-5% annual wage growth) confirm a shortage.' },
          ],
        },
      ],
      conclusion: 'Takeaway: combine demand ÷ supply with trend analysis\n\n- Current "needed" alone misses the industry reality\n- "Today = balanced, 5 years out = short" — only with a time axis does the management issue appear\n- Fermi → trend → strategy implication is "actionable Fermi"\n\nPractice points:\n1. Compute current needed (demand ÷ supply)\n2. Assume demand growth (EC +10%/year, etc.)\n3. Bake in attrition and ageing on the supply side\n4. Estimate the 5- and 10-year gap and turn it into strategy implications',
    },
    {
      type: 'think',
      question: 'Use demand ÷ supply to estimate the number of system engineers (SEs) in Japan. Build demand from annual IT project hours and divide by hours per person.',
      hint: 'Japanese IT market ¥25T × labour share 50% = ¥12.5T labour. Divide by per-person annual cost (~¥6M).',
      modelAnswer: 'Answer: ~1M people\n\n### Macro demand: total IT labour cost\n- Japanese IT market: ~¥25T\n- Labour share: 50% (excluding hardware / packaged software)\n- Total IT labour: ¥25T × 0.5 = ¥12.5T\n\n### Micro supply: per-person annual cost\n- Average IT engineer salary: ¥6M\n- Fully loaded (social insurance + benefits): ¥6M × 1.3 = ~¥7.8M\n- Set: ~¥10M/person (loaded average including senior staff)\n\n### Headcount\n```\n¥12.5T ÷ ¥10M = ~1.25M people\n```\n\n→ Including in-house SEs and freelancers: 1.0-1.2M\n\nActual: Japanese IT engineers (SE / PG / infra) ~1.1-1.3M (METI IT Human Resources White Paper)\n→ Matches.\n\nTakeaway:\n- "Market size × labour share ÷ per-person cost" is the canonical industry-headcount build\n- 5-year IT demand grows +500K → simple math shows a shortage',
      points: [
        'Compute total labour cost = market size × labour share',
        'Divide by per-person fully loaded annual cost (salary × employer-cost factor)',
        'Layer trend (market growth - supply growth) for future shortages',
      ],
    },
    {
      type: 'quiz',
      explanation: 'Applied demand ÷ supply needs "current value" PLUS "trend." Option 1 is right. Option 2 (demand only) and option 3 (supply only) are partial. Option 4 misses the point. Time-dynamic analysis of both sides yields management implications.',
      question: 'What is most important to connect demand ÷ supply to management issues?',
      options: [
        { label: 'Current gap + future trends (demand growth rate / supply attrition)', correct: true },
        { label: 'Highly refined demand-side decomposition only', correct: false },
        { label: 'Highly refined supply-side decomposition only', correct: false },
        { label: 'Raise precision from 2 to 5 significant digits', correct: false },
      ],
    },
    {
      type: 'quiz',
      explanation: 'For "industry-internal labour" like medical clerks, the right method is total annual workload ÷ per-person throughput. Option 1 is right. Option 2 fits B2C products. Option 3 is industry-size estimation. Option 4 is a different pattern.',
      question: 'What is the most appropriate approach to estimate the number of Japanese medical office clerks?',
      options: [
        { label: 'Macro demand (annual claims) ÷ Micro supply (claims per person)', correct: true },
        { label: 'Population × share of people who become medical clerks', correct: false },
        { label: 'Hospitals × revenue per hospital ÷ average salary', correct: false },
        { label: 'Medical-clerk school graduates × employment rate', correct: false },
      ],
    },
  ],
}

// -- Lesson 225: Level 6 — MBB case-interview level -------------------
const fermiLesson225: LessonData = {
  id: 225,
  title: 'Level 6: MBB case-interview level (very hard)',
  category: 'Fermi Estimation',
  steps: [
    {
      type: 'explain',
      title: 'What is MBB case-interview-level Fermi?',
      content: 'Experience the Fermi + strategic implication difficulty MBB (McKinsey, BCG, Bain) interviews demand.\n\nTraits of very-hard level:\n- Takes 30-60 minutes to a final number\n- Requires multi-stage assumptions (5-7 factors)\n- Evaluated not just on "the number" but on "so what?"\n- Interview-style "shift the premise mid-flight" is common\n\nThree abilities MBB tests:\n1. Structuring — logical decomposition\n2. Numerical sense — instantly placing reasonable base values\n3. Implication — extracting strategic action from numbers\n\nToday\'s problems:\n1. Global aircraft demand (20-year horizon)\n2. Japanese used-car market\n3. Tokyo Metro non-rail business (real estate, advertising, etc.)\n\nNone of them stop at "answer obtained" — they push to "so what should we do?"',
    },
    {
      type: 'case',
      title: 'Case: global aircraft demand over 20 years',
      situation: 'You advise an aircraft manufacturer. Estimate the global passenger-aircraft demand over the next 20 years and propose entry strategy for industry growth.',
      phases: [
        {
          info: 'Phase 1: Estimate the current aircraft fleet (passenger jets). Use: world population 8B, annual flights per person 0.5, flights per aircraft per year 4,000, 200 seats per flight at 80% load factor.',
          question: 'Which is closest to the current global passenger-aircraft fleet?',
          options: [
            { label: 'About 5,000', correct: false, feedback: 'Calc: 8B × 0.5 = 4B passenger-trips/year. 1 aircraft × 4,000 flights × 200 seats × 0.8 = 640K trips/year. 4B / 640K ≈ ~6,250. One digit too low.' },
            { label: 'About 25,000', correct: true, feedback: 'Correct. Single-build gives ~6,250 aircraft, but a typical airline runs 1 long-range + 1 mid-range + 2 short-range fleets, reaching ~25,000 globally. Matches the ~27,000 commercial aircraft figure.' },
            { label: 'About 100,000', correct: false, feedback: 'Too high. 1.25 aircraft per passenger is physically impossible.' },
            { label: 'About 500,000', correct: false, feedback: 'Extreme overestimate. Global aircraft (military + civilian + training) total is under 500K.' },
          ],
        },
        {
          info: 'Phase 2: Estimate 20-year demand. Sum three components: (A) replacement of existing fleet, (B) growth-driven new demand, (C) emerging-market surge.',
          question: 'Which is closest to the most reasonable 20-year global aircraft demand?',
          options: [
            { label: 'About 5,000', correct: false, feedback: 'Too low. Just replacing 25,000 aircraft at 50% over 20 years = 12,500.' },
            { label: 'About 40,000', correct: true, feedback: 'Correct. (A) 25K × 50% replacement = 12.5K, (B) +3%/year passenger growth → +60% over 20 years = +15K, (C) emerging-market new = +12.5K. Total ~40K. Matches Boeing/Airbus public forecasts (1,500-2,000/year × 20).' },
            { label: 'About 200,000', correct: false, feedback: 'Too high. 8x current stock exceeds global economic growth — unrealistic.' },
            { label: 'About 1,000', correct: false, feedback: 'Extreme underestimate. Current annual production is 1,000-1,500.' },
          ],
        },
        {
          info: 'Phase 3: 20-year demand 40,000 aircraft × ~¥10B each = ¥400T market (¥20T/year). Boeing + Airbus duopoly holds 90% — new-entry room is limited. The most rational entry strategy?',
          question: 'Which entry strategy best aligns with what the Fermi estimate suggests?',
          options: [
            { label: 'Head-to-head on large airliners (200+ seats) vs Boeing', correct: false, feedback: 'Frontal attack on a duopoly is capital-inefficient. R&D + certification exceeds ¥1T, payback 30 years.' },
            { label: 'Mid/short-range regional jets (50-100 seats), emerging-markets focus', correct: true, feedback: 'Correct. Mid/small jets are 30% of market (¥6T/year) with only Embraer/Bombardier competing — less crowded. Demand surges in China, India, SE Asia short-haul routes. Study China COMAC and Japan MRJ failures for cautionary cases.' },
            { label: 'Exit aircraft, become a rail-vehicle manufacturer', correct: false, feedback: 'The question is "aircraft entry strategy" — pivoting away is off-topic.' },
            { label: 'All-in on drones, abandon existing business', correct: false, feedback: 'A different business domain. Drift off topic on aircraft-demand response.' },
          ],
        },
      ],
      conclusion: 'Takeaway: MBB Fermi is "number → implication → strategy" as one unit\n\n- The number (40K aircraft / ¥400T over 20 years) is the starting point\n- Add the duopoly structure (Boeing+Airbus 90%) to narrow strategic options\n- For entry, the intersection of "market gap (regional) × growth (emerging markets)" wins\n\nPhase-expansion template:\n1. Estimate current scale (stock, market size)\n2. Estimate future scale (growth rate × horizon)\n3. Layer competitive structure (concentration, entry barriers)\n4. Derive strategy implication (where to concentrate resources)\n\nMBB interviews train you to do this in 30-40 minutes.',
    },
    {
      type: 'think',
      question: 'For MBB-level practice, estimate the annual revenue of Tokyo Metro\'s non-rail businesses (real estate, advertising, retail). Structure the rail-operator business model.',
      hint: '180 stations + commuter population + ad exposure + tenant store count. Rail income dominates, but in-station retail and ads are also significant.',
      modelAnswer: 'Answer: ~¥100B/year\n\n### 1. Real estate (in-station retail)\n- Stations: 180\n- Tenant shops per station: 5 (average)\n- Rent per shop/month: ¥1M\n- Real estate income: 180 × 5 × ¥1M × 12 = ~¥10.8B\n- Station-buildings + complexes add ~¥10B → total ~¥20B\n\n### 2. Advertising\n- Daily ridership: 7.5M × avg 2 lines used = 15M person-rides/day\n- Annual: 15M × 365 ≈ 5.5B\n- Ad impression value: ¥1/person (CPM ~¥100/1,000)\n- Ad revenue: ~¥5.5B/year\n- Add station displays + platform signage → ~¥20B\n\n### 3. Retail / services\n- PASMO / e-money fees: 10M uses/day × ¥1/use × 365 = ~¥3.6B\n- In-station vending + kiosks: 3,000 machines × ¥1M/yr = ~¥3B\n- Total: ~¥10B\n\n### 4. Other (lease, hotel, construction)\n- ~¥50B\n\n### Total: ~¥100B/year\n\nActual: Tokyo Metro non-rail business ~¥70-100B/year (IR materials, related-business segment totals)\n→ Matches. About 20-25% of total revenue (¥400B).\n\nStrategy implication:\n- Rail is a regulated industry with little growth room (fare changes are politically constrained)\n- Non-rail is the growth area leveraging "location assets (stations)"\n- After the 2024 IPO, growth strategy centres on "in-station retail upgrade" + "advertising-media expansion"',
      points: [
        'Split into 4 segments (real estate / advertising / retail / other)',
        'Build real estate as "location asset (stations) × tenant ticket"',
        'Build advertising as "ridership × ad impression value"',
        'Adding strategy implications elevates to MBB level',
      ],
    },
    {
      type: 'quiz',
      explanation: 'At MBB-level Fermi, the most-valued output is the "number + implication + strategy" triple. Option 1 (over-precision) misses; option 3 (number only) lacks implication; option 4 (negate then re-number) does not move forward. "Number → structure (competition, growth) → strategic action" is the consulting-thinking core.',
      question: 'In MBB case-interview Fermi, which output is rated highest?',
      options: [
        { label: 'A 2-decimal-place precise number', correct: false },
        { label: 'The estimated number plus the resulting "so what should we do" strategic implication', correct: true },
        { label: 'A number alone, no conclusion', correct: false },
        { label: 'Negate your number and replace it with another', correct: false },
      ],
    },
    {
      type: 'quiz',
      explanation: 'MBB-level requires multi-phase expansion (5-7 factors). Option 1 is right. Option 2 fits the very-easy level. Option 3 is precision worship gone wrong. Option 4 is research, not estimation. The skill being tested is structuring through complexity.',
      question: 'What characterises MBB-level Fermi thinking?',
      options: [
        { label: 'Multi-phase expansion (current → future → competition → strategy) structuring 5-7 factors', correct: true },
        { label: 'Quickly hit an answer with 2-3 factors', correct: false },
        { label: 'Calculate to 3 decimal places to maximise significant digits', correct: false },
        { label: 'Look up industry reports online to confirm the number', correct: false },
      ],
    },
  ],
}

// -- Lesson 226: Level 7 — Abstract & advanced ------------------------
const fermiLesson226: LessonData = {
  id: 226,
  title: 'Level 7: Abstract & advanced (very hard)',
  category: 'Fermi Estimation',
  steps: [
    {
      type: 'explain',
      title: 'Tackle abstract problems — advanced Fermi',
      content: 'Level 7 takes Fermi into abstract or philosophical questions. MBB interviews occasionally throw these in as "curveball" problems.\n\nTraits of abstract problems:\n- No "correct answer" exists or can be verified\n- You must define your own units and premises\n- The thought process itself is evaluated\n- "How do you decompose what cannot be decomposed?" is the test\n\nCanonical abstract problems:\n1. Total annual happiness of the Japanese population\n2. Time humanity spends waiting at traffic lights\n3. Number of grains of sand on Earth\n4. Total volume of tears humans shed in a lifetime\n\nPurpose of this level:\n- Practice "define unit → decompose → estimate" even for "unmeasurables" to land a magnitude\n- Builds the muscle for quantifying qualitative business signals (customer satisfaction, brand value)',
    },
    {
      type: 'explain',
      title: 'Applied: time humanity wastes waiting at traffic lights',
      content: 'Question: total time the human race spends waiting at traffic lights in one year?\n\nStep 1: define\n- Target: people living in regions with traffic lights\n- Base population: world urban population ~4.5B\n- Excluding children & elderly: ~3B active\n\nStep 2: light-waiting time per person per day\n- Commute / school: 10 lights × 30 seconds round trip = 5 minutes\n- Errands / movement: 5 lights × 30 seconds = 2.5 minutes\n- Total: ~7.5 minutes/day = 0.125 hours\n\nStep 3: per person per year\n- 0.125h × 365 = ~46 hours/year\n\nStep 4: whole humanity\n```\n3B × 46h = ~138B hours/year\n```\n\nConversion:\n- 138B hours ÷ 8,760 (hours/year) = ~15M person-years\n- That is, "15M person-lifetimes-worth of time disappears into light-waits every year"\n- Average lifespan 75 years → 15M ÷ 75 = 200K human lifetimes burned at red lights annually\n\nTakeaway:\n- "Unmeasurables" can still be modelled as base × per-unit\n- The value lies in "relative magnitude," not absolute precision\n- 15M person-years justifies investments in "city-planning efficiency" or "signal-less self-driving society"',
    },
    {
      type: 'case',
      title: 'Case: total annual happiness of Japan',
      situation: 'Practice estimating "happiness" via Fermi. Sum the happiness of all Japanese people to envision a "happiness GDP" alongside economic GDP — the Gross National Happiness (GNH) idea explored by Bhutan and the UK.',
      phases: [
        {
          info: 'Phase 1: Define a unit. Subjective daily happiness on a 0-10 scale. The Japanese average per the World Happiness Report is ~6.0 (mid-tier developed country).',
          question: 'Which is closest to one Japanese person\'s annual happiness total (scale × days)?',
          options: [
            { label: 'About 6 happy-units', correct: false, feedback: 'Calc: 6 × 365 = 2,190. You only took one day.' },
            { label: 'About 2,190 happy-units', correct: true, feedback: 'Correct. 6 × 365 days = 2,190 happy-units/person/year — the personal annual happiness total.' },
            { label: 'About 1M happy-units', correct: false, feedback: 'Too high. 2,740/day = 114/hour — even maxed out all waking hours, impossible.' },
            { label: 'About 0.016 happy-units', correct: false, feedback: 'Extreme underestimate. 0.00004/day = no emotion at all.' },
          ],
        },
        {
          info: 'Phase 2: Scale to Japan. 124M people × 2,190 happy-units/person/year = ~270B happy-units/year. This is Japan\'s "happiness GDP."',
          question: 'Compared to GDP (¥600T), what is the economic value of 1 happy-unit?',
          options: [
            { label: 'About ¥220 per happy-unit', correct: false, feedback: 'Calc: ¥600T / 270B ≈ ¥2,200/unit. One digit low.' },
            { label: 'About ¥2,200 per happy-unit', correct: true, feedback: 'Correct. ¥600T / 270B units ≈ ¥2,222/unit. That is, "lifting one Japanese person\'s daily happiness by one notch is worth about ¥2,200 of economic activity."' },
            { label: 'About ¥1M per happy-unit', correct: false, feedback: 'Too high — 5x GDP figure.' },
            { label: 'About ¥1 per happy-unit', correct: false, feedback: 'Extreme underestimate. 6 happy × ¥1 = ¥6/day = unrealistic.' },
          ],
        },
        {
          info: 'Phase 3: Playful, but the business implication runs deep. "1 happy-unit ≈ ¥2,200" can plug into service design, brand strategy, and customer-experience (CX) investment decisions.',
          question: 'Which is the most reasonable practical application of this "happiness-economy conversion"?',
          options: [
            { label: 'Value employee-engagement initiatives (annual +0.5 happy-units ≈ ¥1,100 equivalent)', correct: true, feedback: 'Correct. Workplace, benefits, and mental-health investments can be ROI-valued in "economic equivalents." Deloitte and BCG run similar conversions on human-capital investment.' },
            { label: 'Run a country purely on happiness, abandon GDP', correct: false, feedback: 'Full replacement is unrealistic. Economy and happiness are complementary. Use as a parallel indicator.' },
            { label: 'Lower happiness to back-calc economic value', correct: false, feedback: 'Logic runs backwards. Not appropriate as a Fermi application.' },
            { label: 'This calc is amusement only and must not be applied', correct: false, feedback: 'The calc is rough but the magnitude grounds debate. Useful as a rough working number in practice.' },
          ],
        },
      ],
      conclusion: 'Takeaway: abstract Fermi is "the bridge from qualitative to quantitative"\n\n- "Happiness," "satisfaction," "brand value" — define units and you can estimate them\n- Absolute values stay fuzzy, but "magnitude" and "relative comparison" ground decisions\n- In business: "CX investment ¥100M → CSAT +0.3 units → how much economic value?" debates become possible\n\nTemplate for abstract problems:\n1. Define units (happy-units, wait-seconds, satisfaction points)\n2. Scope the base (active age groups, target market)\n3. Estimate per-unit quantity (per day / per turn / per event)\n4. Multiply for the total\n5. Sanity-check magnitude against known indicators (GDP, market size)\n6. State the implication — always say "so what"',
    },
    {
      type: 'think',
      question: 'Abstract: estimate the total volume of tears shed by all people worldwide in one day. Define base, per-person quantity, and units.',
      hint: 'Tears include grief, joy, onion, yawn, and basal moisture. Including basal lacrimation grows the magnitude. One drop is 0.05 ml; emotional tears are a few drops/day; basal tears (blinking) are 1-2 ml/day.',
      modelAnswer: 'Answer: ~10M litres/day\n\n### Base\n- World population: 8B\n\n### Per person per day\n- Basal tears (blink lubrication): 1 ml/day (constant lacrimal secretion)\n- Emotional tears: crying frequency 2/month (joy + sorrow) × 2 ml = 4 ml/month ≈ 0.13 ml/day\n- Onion / yawn tears: 1/week × 1 ml = 0.14 ml/day\n- Total: ~1.3 ml/person/day\n\n### Global total\n```\n8B × 1.3 ml = 10.4B ml = ~10M litres/day\n```\n\nConversion:\n- 10M litres ≈ 2 standard 25m pools/day\n- Annual: 10M × 365 ≈ 3.8B litres = ~7,500 pools\n\nTakeaway:\n- Even "tears" — unmeasurable in normal terms — yield to (basal / emotional / physical-stimulus) segmentation\n- Realising basal tears (1-2 ml/day) dominate is the insight\n- Translating into "pool-equivalents" makes the magnitude land',
      points: [
        'Segment tears (basal / emotional / physical-stimulus)',
        'Notice that 1-2 ml/day basal tears dominate the total',
        'Translate to "X pools" for everyday-scale intuition',
      ],
    },
    {
      type: 'quiz',
      explanation: 'The biggest value of abstract Fermi is mastering "Fermi as a tool to measure the unmeasurable." Option 1 is right. Option 2 confuses with very-easy level. Option 3 misses the point. Option 4 is observation, not estimation. "Bridge from qualitative to quantitative" is the keyword.',
      question: 'What is the biggest learning value of abstract Fermi (level 7)?',
      options: [
        { label: 'Land a magnitude on unmeasurables (happiness, satisfaction, time waste) via "define units → decompose → estimate"', correct: true },
        { label: 'Build confidence by solving easy problems', correct: false },
        { label: 'Calculate to 3 decimal places', correct: false },
        { label: 'Observe and record empirical data', correct: false },
      ],
    },
    {
      type: 'quiz',
      explanation: 'The most important first step in abstract problems is "define your own units." Option 1 is right. Option 2 fails — you cannot multiply without units. Option 3 is pre-calculation. Option 4 is a final sanity check. Unit definition is where thinking power is tested first.',
      question: 'In abstract-problem Fermi, what is the most important first step?',
      options: [
        { label: 'Define your own unit for the target', correct: true },
        { label: 'Multiply numbers right away', correct: false },
        { label: 'Predict only the magnitude', correct: false },
        { label: 'Compare against known indicators (GDP, market size)', correct: false },
      ],
    },
  ],
}

export const fermiLessonMapPracticeEn: Record<number, LessonData> = {
  220: fermiLesson220,
  221: fermiLesson221,
  222: fermiLesson222,
  223: fermiLesson223,
  224: fermiLesson224,
  225: fermiLesson225,
  226: fermiLesson226,
}
