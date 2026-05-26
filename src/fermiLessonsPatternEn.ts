/**
 * Fermi Estimation Patterns Course (fermi-02)
 * Lesson IDs: 210-216
 * Category: 'Fermi Estimation'
 *
 * Six decomposition patterns + cross-check, one pattern per lesson.
 */
import type { LessonData } from './lessonData'

// -- Lesson 210: Individual / Household-based pattern -----------------
const fermiLesson210: LessonData = {
  id: 210,
  title: 'Individual / Household-based: Build up from people',
  category: 'Fermi Estimation',
  steps: [
    {
      type: 'explain',
      title: 'What is the individual / household-based pattern?',
      content: 'The individual / household-based pattern decomposes the target volume as "individuals (or households) × ownership/usage rate".\n\nFormula:\n```\nTotal = base population (individuals or households) × ownership rate × units per person/household\n```\n\nWhen to use:\n- When the target is consumed or owned at home / by individuals\n- Examples: pianos, air conditioners, cars, TVs, pets, smartphones\n\nWhy distinguish individual vs household:\n- Individual base: items owned 1-per-person (smartphone, bicycle, wallet)\n- Household base: items shared by a family (fridge, AC, TV, car)\n\nMixing them up — counting a shared item per individual — is the classic mistake that lands you 2-3x off.',
      visual: 'FermiPatternMatrixDiagram',
    },
    {
      type: 'explain',
      title: 'Example 1: number of pianos in Japan',
      content: 'Question: how many household pianos exist in Japan?\n\nA piano is shared at home → use the household base.\n\nStep 1: confirm base population\n- Japanese households = 57M (from your base-fact set)\n\nStep 2: estimate ownership rate\n- Out of households around you, what share owns a piano?\n- From classmates and colleagues, roughly 5-10% feels right\n- Set: ownership rate 5%\n\nStep 3: units per household\n- Households that own a piano usually own 1\n- Set: 1 per household\n\nStep 4: combine\n```\n57M × 0.05 × 1 = about 2.85M pianos\n```\n\nActual: about 2.5-3M units (industry estimate)\n→ Nearly spot-on. A clean win for household-base.',
      visual: 'FermiFormulaDiagram',
      visualProps: {
        sectionLabel: 'Pianos in Japanese households — household-base',
        factors: [
          { label: 'Households', value: '57', unit: 'M' },
          { label: 'Ownership', value: '5', unit: '%' },
          { label: 'Per household', value: '1', unit: 'unit' },
        ],
        result: { label: 'Estimated count', value: '~2.85', unit: 'M units' },
        hint: 'Industry estimate 2.5-3M — nearly spot-on. Clean win for household-base',
      },
    },
    {
      type: 'explain',
      title: 'Example 2: home air conditioners in Japan',
      content: 'Question: how many ACs sit in Japanese homes?\n\nMultiple units per household are common → use household base × units per household.\n\nStep 1: base population\n- Households: 57M\n\nStep 2: ownership rate\n- Japanese AC penetration is over 90%\n- Set: 90%\n\nStep 3: units per household\n- Living room + bedroom + kids room — average 2.5 per household\n\nStep 4: combine\n```\n57M × 0.9 × 2.5 ≈ about 128M\n```\n\nActual: about 120M units (METI)\n→ 7% off. A textbook case for "household base × multiple units".\n\nKey insight:\nFor pianos, "1 per household or 0". For ACs, "0-several per household". When units per household varies, separate it out as its own factor — that is the precision lever.',
      visual: 'FermiFormulaDiagram',
      visualProps: {
        sectionLabel: 'Home ACs in Japan — households × multiple units',
        factors: [
          { label: 'Households', value: '57', unit: 'M' },
          { label: 'Ownership', value: '90', unit: '%' },
          { label: 'Per household', value: '2.5', unit: 'units' },
        ],
        result: { label: 'Estimated count', value: '~128', unit: 'M units' },
        hint: 'METI actual 120M, 7% off. When per-household count varies, factor it out separately',
      },
    },
    {
      type: 'explain',
      title: 'Three common failure modes',
      content: 'Failure 1: confusing individual vs household base\n- "ACs = population × ownership rate" (individual base)\n- → 124M × 0.9 = 111M (number is close by accident, but the logic is broken)\n- → Shared items: count by household. Personal items: count by population.\n\nFailure 2: mixing "ever used" into the ownership rate\n- "30% of people have played a piano" → overstates ownership (played ≠ owns)\n- → Use "currently owns" as your rate.\n\nFailure 3: hard-coding 1-per-household\n- Smartphones are personal; bikes and cars can be multiple per household\n- → Decide based on your own family/relatives\' typical count.',
    },
    {
      type: 'think',
      question: 'Using the individual / household-based pattern, estimate "the number of microwave ovens in Japan". Build the equation, plug in numbers, and arrive at a final answer.',
      hint: 'First decide individual or household. Pick an ownership rate from gut feel (any household without one?). Decide if "1 per household" is reasonable.',
      modelAnswer: 'Answer: about 54M units\n\nStep 1: classify\nKitchen appliance shared by the family → household base.\n\nStep 2: equation\n```\nTotal = households × ownership rate × units per household\n```\n\nStep 3: factors\n- Households: 57M\n- Ownership rate: 95% (even single-person households mostly have one)\n- Units per household: 1\n\nStep 4: calculate\n```\n57M × 0.95 × 1 ≈ about 54M units\n```\n\nActual: Cabinet Office consumer survey, microwave penetration 96%\n→ Matches. For "essentially 1 per household" appliances, "households × ownership rate" is enough.',
      points: [
        'Microwave is a shared household appliance → household base',
        '95% ownership reflects penetration even into single-person households',
        'For "1 per household" appliances, two factors (households × rate) suffice',
      ],
    },
    {
      type: 'quiz',
      explanation: 'Refrigerators are shared at home, so the household base is correct. Option 1 uses individual base and over-counts by 2-3x in multi-person households. Option 3 uses the wrong base population. Option 4 is a market-size formula, not a unit count.',
      question: 'When estimating "the number of home refrigerators in Japan," which formula is most appropriate?',
      options: [
        { label: 'Population 124M × ownership 0.99 × 1 unit', correct: false },
        { label: 'Households 57M × ownership 0.99 × 1 unit', correct: true },
        { label: 'Working population 69M × ownership 0.5 × 1 unit', correct: false },
        { label: 'Households 57M × annual sales 5M units', correct: false },
      ],
    },
    {
      type: 'quiz',
      explanation: 'The point of this pattern is identifying "household-shared" vs "individually-owned." Smartphones are personal (1-per-person standard) → individual base. Cars and washing machines are household-shared. Alarm clocks are mixed but lean personal in modern households. The clearest individual-base case is the smartphone.',
      question: 'Which is most appropriate to count using the "individual" base?',
      options: [
        { label: 'Smartphone', correct: true },
        { label: 'Car', correct: false },
        { label: 'Washing machine', correct: false },
        { label: 'Microwave oven', correct: false },
      ],
    },
  ],
}

// -- Lesson 211: Corporate-based pattern ------------------------------
const fermiLesson211: LessonData = {
  id: 211,
  title: 'Corporate-based: Build up from companies',
  category: 'Fermi Estimation',
  steps: [
    {
      type: 'explain',
      title: 'What is the corporate-based pattern?',
      content: 'The corporate-based pattern decomposes the target as "number of companies (or business sites) × units per company".\n\nFormula:\n```\nTotal = number of companies × size factor × units per company\n```\n\nWhen to use:\n- When the target is used or purchased by companies\n- Examples: multi-function printers, business PCs, company cars, office chairs, business cards\n\nBase facts: Japanese corporations\n- Corporations: about 2.8M\n- Large (capital ≥ ¥100M or 300+ employees): about 12K (0.4%)\n- SMEs: about 2.8M (99.6%)\n- Including sole proprietors: about 4M business operators\n\nHow to use the size factor:\nLarge vs SME differ by orders of magnitude. Averaging tanks precision. Split into size tiers and stack them — that\'s the core technique.',
      visual: 'FermiPatternMatrixDiagram',
    },
    {
      type: 'explain',
      title: 'Example 1: office multi-function printers in Japan',
      content: 'Question: how many multi-function printers (MFPs) are installed across Japanese offices?\n\nStep 1: split companies\n- All companies: 2.8M\n- Filter to those large enough to own an MFP:\n  - Micro (≤10 staff, about 2M): no MFP, uses home printer\n  - Small (10-50 staff, about 600K): 1 MFP\n  - Mid (50-300 staff, about 180K): 3 MFPs\n  - Large (about 12K): 30 MFPs\n\nStep 2: multiply by tier\n- Micro: 2M × 0 = 0\n- Small: 600K × 1 = 600K\n- Mid: 180K × 3 = 540K\n- Large: 12K × 30 = 360K\n\nStep 3: total\n```\n600K + 540K + 360K ≈ about 1.5M\n```\n\nActual: about 1.5-2M MFPs installed nationwide (industry estimate)\n→ Within 25% via tiered stacking. Textbook execution.',
      visual: 'FermiFormulaDiagram',
      visualProps: {
        sectionLabel: 'Japan office MFPs — tier-stacked by company size',
        factors: [
          { label: 'Small companies', value: '600', unit: 'K × 1 unit' },
          { label: 'Mid-size', value: '180', unit: 'K × 3 units' },
          { label: 'Large', value: '12', unit: 'K × 30 units' },
        ],
        result: { label: 'Total', value: '~1.5', unit: 'M units' },
        hint: 'Never average across all 2.8M companies. Tier-split keeps error within 25%',
      },
    },
    {
      type: 'explain',
      title: 'Example 2: number of doors in Japanese company offices',
      content: 'Question: how many doors exist in Japanese corporate offices?\n\nWhimsical, but excellent practice for "companies × per-company count".\n\nStep 1: narrow to "companies with a physical office"\n- Drop sole-proprietors and remote-only businesses → about 2.5M\n\nStep 2: doors per company by size\n- Single-room office (2M small): 2 doors (entry + restroom)\n- Mid-size (450K): 10 doors (floor entry + meeting rooms + storage + restroom)\n- Large (12K): 200 doors (multiple floors × departments × meeting rooms)\n\nStep 3: total\n- 2M × 2 = 4M\n- 450K × 10 = 4.5M\n- 12K × 200 = 2.4M\n- Total: about 11M doors\n\nAbout the answer:\nThis is a problem WITHOUT an answer. No official statistic or industry estimate counts the total number of office doors, so there is no unique correct value. That is exactly why the lesson is the decomposition path — "split companies by size and stack them up" — rather than the number itself. The 11M figure is just one example of where that path lands once you fix your premises.\n\nKey insight:\n- Avoid the "average trap" by stacking by size tier\n- Sanity-check "doors per company" against your own office experience\n- For unverifiable problems, value "can you justify your premises?" over the final number',
    },
    {
      type: 'explain',
      title: 'Pitfalls of the corporate-based pattern',
      content: 'Pitfall 1: treating all 2.8M companies as equivalent\n- Average-based math underweights large firms\n- → Always tier-split and stack\n\nPitfall 2: confusing companies with business sites\n- One company ≠ one site (chains span many locations)\n- For "store count" or "location count," use companies × locations per company\n- Example: Aeon, 1 company, hundreds of stores\n\nPitfall 3: trying corporate base for B2C products\n- "Number of snacks sold at convenience stores" is meaningless via corporate base\n- → Use corporate base only when companies are the buyers. For end consumers, switch to individual/household.\n\nPitfall 4: including or excluding sole proprietors\n- Strict legal definition: 2.8M corporations. Including sole proprietors: 4M\n- → Decide based on whether the target applies to sole proprietors (e.g., MFPs: mostly corporate; business laptops: also sole proprietors)',
    },
    {
      type: 'think',
      question: 'Use the corporate-based pattern to estimate "annual A4 copy-paper consumption across Japanese offices".',
      hint: 'Split companies by size and estimate annual prints per company. Sheets per company differ by an order of magnitude across tiers.',
      modelAnswer: 'Answer: about 450 billion sheets/year\n\nStep 1: split by size\n- Micro (≤10): 2M companies, 5K sheets/year (about 400/month)\n- Small (10-50): 600K, 50K sheets/year\n- Mid (50-300): 180K, 300K sheets/year\n- Large (300+): 12K, 10M sheets/year\n\nStep 2: multiply\n- 2M × 5K = 10B\n- 600K × 50K = 30B\n- 180K × 300K = 54B\n- 12K × 10M = 120B\n\nStep 3: total\n```\n10 + 30 + 54 + 120 ≈ about 214B sheets\n→ pre-digital era doubles this to 400-500B\n```\n\nActual: about 450B sheets/year for office paper in Japan (Japan Paper Association estimate)\n\nKey insight:\n- 4-tier split gives precision\n- Use "my office monthly use × 12" as the seed for per-company sheets\n- Large companies contribute a quarter of total despite being 0.4% of company count',
      points: [
        'Split companies into 4 size tiers and stack',
        'Sheets per company differs by orders of magnitude across tiers',
        'Few large companies, but each contributes massively',
      ],
    },
    {
      type: 'quiz',
      explanation: 'Business cards are printed per individual, so a population-based approach is more natural. Option 1 uses corporations as the base, but cards are individual. Option 3 omits sole proprietors. Option 4 uses "1,000 cards per company" which ignores headcount inside the company.',
      question: 'For estimating "business cards printed per year in Japan," which approach is best?',
      options: [
        { label: 'Corporations 2.8M × print runs per year × cards per run', correct: false },
        { label: 'Working population × share of card-using roles × cards per person per year', correct: true },
        { label: 'Corporations 2.8M × 100 cards', correct: false },
        { label: 'Corporations 2.8M × 1,000 cards/year', correct: false },
      ],
    },
    {
      type: 'quiz',
      explanation: 'Japan has about 2.8M corporations (excluding sole proprietors). Option 1 is half. Option 3 confuses with the 5.4M business-site count (which includes branches). Option 4 mixes with the 69M working population. Hold "2.8M corporations / 5.4M sites / 4M including sole props" as a triplet.',
      question: 'Which is closest to the number of Japanese corporations (excluding sole proprietors)?',
      options: [
        { label: 'About 1M', correct: false },
        { label: 'About 2.8M', correct: true },
        { label: 'About 10M', correct: false },
        { label: 'About 69M', correct: false },
      ],
    },
  ],
}

// -- Lesson 212: Area-based pattern -----------------------------------
const fermiLesson212: LessonData = {
  id: 212,
  title: 'Area-based: Slice up the country',
  category: 'Fermi Estimation',
  steps: [
    {
      type: 'explain',
      title: 'What is the area-based pattern?',
      content: 'The area-based pattern uses "area × density per unit area" as the equation.\n\nFormula:\n```\nTotal = target area × density per unit area\n```\n\nWhen to use:\n- For things "distributed across the country"\n- Examples: gas stations, traffic lights, post offices, train stations, convenience stores, streetlights\n- Where geographic placement (not headcount or company count) drives presence\n\nBase facts: Japan area\n- National area: 380K km²\n- Flat land: about 110K km² (30% of area)\n- DID (Densely Inhabited Districts): about 14K km² (4% of area but 70% of population)\n- Average prefecture: about 8,000 km²\n\nTip: density × area converts to people\n- Whole country: 124M / 380K ≈ 325 people/km²\n- DID: 124M × 0.7 / 14K ≈ 6,200 people/km²\n- "Back out from population density" gives you a second check route.',
      visual: 'FermiAreaApproachDiagram',
    },
    {
      type: 'explain',
      title: 'Example 1: gas stations in Japan',
      content: 'Question: how many gas stations exist in Japan?\n\nStep 1: split by area\n- 30% of land is inhabited flat land → 110K km²\n- Mountains and uninhabited zones excluded\n\nStep 2: estimate density\n- Gut feel: "in town I see one every 5km drive"\n- One per 5km × 5km square → 0.04 stations/km²\n- Urban denser, rural sparser, take an average\n\nStep 3: combine\n```\n110K × 0.04 = about 4,400\n```\n\nIf denser, try 5km × 3km = 15 km²/station:\n```\n110K / 15 ≈ about 7,300\n```\n\nActual: about 28,000 gas stations\n→ 3-4x undershoot. Density should have been pulled in tighter\n- Urban areas: 1 per km drive — needs a separate urban-density tier\n- → Lesson: area-based depends on "anchor density in everyday experience"',
      visual: 'FermiAreaApproachDiagram',
    },
    {
      type: 'explain',
      title: 'Example 2: traffic lights in Japan',
      content: 'Question: how many traffic lights exist in Japan?\n\nStep 1: narrow to "intersections"\n- Convert area × density → intersection count × lights per intersection\n\nStep 2: intersection density\n- DID: 200m × 200m block per intersection → 25/km²\n- DID 14K km² × 25 ≈ 350K intersections\n- Rural: 1/km², (380K - 14K) × 1 ≈ 366K intersections\n- Total: about 700K intersections\n\nNot every intersection has lights. Light-equipped rate 30%.\n- Lit intersections: 700K × 0.3 ≈ 210K\n\nStep 3: lights per intersection\n- 4 directions × 1-2 lights (car + pedestrian) ≈ 6 lights average\n\nStep 4: combine\n```\n210K × 6 ≈ about 1.26M traffic lights\n```\n\nActual: about 1.3M traffic lights in Japan\n→ 3% error. Splitting area-based further into urban vs rural is a massive precision lever.',
      visual: 'FermiAreaApproachDiagram',
    },
    {
      type: 'explain',
      title: 'Tips and pitfalls of the area-based pattern',
      content: 'Tip 1: split area into at least 2 zones\n- Never use uniform national density\n- Urban vs rural, DID vs non-DID — 2-3x precision boost\n\nTip 2: anchor density in everyday units\n- "Do I see one per 500m walk?" as a starting point\n- Use your commute and neighborhood as the seed\n\nTip 3: relate to population density\n- Commercial sites cluster where people are → tied to population density\n- 70-80% concentrate in DID (4% of land)\n\nPitfall 1: ignoring terrain\n- Including 70% mountains → overshoot\n- → Anchor on "30% inhabited" or "4% DID"\n\nPitfall 2: density biased by personal experience\n- Tokyo residents overestimate density 2x\n- → Cross-check against national average (325/km²)\n\nPitfall 3: assuming uniform distribution\n- Gas stations skew suburban (land cost + demand), not uniform\n- → Adjust for industry-specific distribution patterns',
    },
    {
      type: 'think',
      question: 'Use the area-based pattern to estimate "the number of post offices in Japan". Split zones, pick densities, calculate, then cross-check.',
      hint: 'Post offices are public infrastructure — one per population cluster. Use municipality count (1,700) and population distribution. Split urban vs rural.',
      modelAnswer: 'Answer: about 22,000 offices\n\nStep 1: 2-zone split\n- DID: 14K km²\n- Rural: 366K km²\n\nStep 2: density\n- DID: 1 per km² in residential urban → 1/km²\n- Rural: 5km × 5km → 0.04/km²\n\nStep 3: calculate\n- DID: 14K × 1 = 14,000\n- Rural: 366K × 0.04 ≈ 14,600\n- Total: about 28,000 (slightly overshoots)\n\nStep 4: cross-check by population\n- Municipality count: 1,700. ~13 offices/municipality → 22,000\n- Population-anchored: 1 per 5,000 people\n- 124M / 5,000 ≈ about 25,000\n\nActual: about 24,000 post offices in Japan (including simple post offices)\n→ Area-based + population-based converge at 22,000-25,000.\n\nLesson: After area-based math, cross-check with "1 per X people" to catch order-of-magnitude errors.',
      points: [
        'Use separate densities for DID and rural',
        'Cross-check area-based output with population-based (1 per N people)',
        'Public infrastructure correlates very strongly with population density',
      ],
    },
    {
      type: 'quiz',
      explanation: 'Area-based fits "geographically distributed public infrastructure" best. Option 1 (gas stations) is the textbook case. Smartphones are individual-based, neighborhood bakeries are demand/population-based, GDP is a macro economic indicator unrelated to area.',
      question: 'Which is most naturally calculated with the area-based pattern?',
      options: [
        { label: 'Number of gas stations in Japan', correct: true },
        { label: 'Smartphones owned in Japan', correct: false },
        { label: 'Independent bakery store count in Tokyo', correct: false },
        { label: 'Japan\'s nominal GDP', correct: false },
      ],
    },
    {
      type: 'quiz',
      explanation: 'Japan\'s land area is about 380K km². Option 1 confuses with Hokkaido (about 80K). Option 3 is 3x reality (France-sized). Option 4 is mainland China scale. Pair "Japan 380K / Tokyo 2,000 / Hokkaido 80K km²" in memory.',
      question: 'Which is closest to the area of Japan?',
      options: [
        { label: 'About 80K km²', correct: false },
        { label: 'About 380K km²', correct: true },
        { label: 'About 1.2M km²', correct: false },
        { label: 'About 5M km²', correct: false },
      ],
    },
  ],
}

// -- Lesson 213: Unit-based pattern -----------------------------------
const fermiLesson213: LessonData = {
  id: 213,
  title: 'Unit-based: Scale up from a single facility',
  category: 'Fermi Estimation',
  steps: [
    {
      type: 'explain',
      title: 'What is the unit-based pattern?',
      content: 'The unit-based pattern decomposes the target as "number of unit facilities × items per facility".\n\nFormula:\n```\nTotal = number of unit facilities × multiplier per facility\n```\n\nWhen to use:\n- When the target is tied to specific facilities or sites\n- Examples: vending machines at stations, supermarket registers, ATMs in convenience stores, airport gates, hospital beds\n- Targets describable as "per X facility"\n\nVs. individual/household and corporate base:\n- Individual/household: people (consumers) as base\n- Corporate: companies (buyer organizations) as base\n- Unit: facilities or sites (where things are placed) as base\n\nBase facts: facility counts to memorize\n- Train stations: 9,500\n- Supermarkets: about 22,000\n- Convenience stores: about 57,000\n- Hospitals: about 8,000 (170K including clinics)\n- Schools (K-12): about 35,000\n- Gas stations: about 28,000',
      visual: 'FermiPatternMatrixDiagram',
    },
    {
      type: 'explain',
      title: 'Example 1: vending machines at Japanese stations',
      content: 'Question: total vending machines across Japanese train stations?\n\nStep 1: confirm unit base\n- Stations: 9,500\n- Wide size variation requires decomposition\n\nStep 2: vending machines per station by size\n- Major hubs (100K+ riders, about 100 stations): 30/station (platforms + outside × multiple)\n- Mid stations (about 1,000): 10/station\n- Small stations (about 8,000): 3/station\n- Unstaffed / tiny (about 400): 0-1, average 0.5\n\nStep 3: multiply\n- 100 × 30 = 3,000\n- 1,000 × 10 = 10,000\n- 8,000 × 3 = 24,000\n- 400 × 0.5 = 200\n\nStep 4: total\n```\n3,000 + 10,000 + 24,000 + 200 ≈ about 37,000 units\n```\n\nCross-check:\n- National vending total: about 4M\n- Station share: 1-2%\n- 4M × 0.01 = 40K\n→ Aligns.\n\nLesson: split unit facilities into 3-4 size tiers for precision.',
      visual: 'FermiFormulaDiagram',
      visualProps: {
        sectionLabel: 'Vending machines at JP stations — size-tiered',
        factors: [
          { label: 'Major hubs', value: '100', unit: '× 30 units' },
          { label: 'Mid stations', value: '1,000', unit: '× 10 units' },
          { label: 'Small stations', value: '8,000', unit: '× 3 units' },
        ],
        result: { label: 'Total', value: '~37', unit: 'K units' },
        hint: '9,500 stations split by size. Per-station counts differ by 1 order — never average',
      },
    },
    {
      type: 'explain',
      title: 'Example 2: supermarket registers in Japan',
      content: 'Question: total registers in Japanese supermarkets?\n\nStep 1: unit base\n- Supermarkets: about 22,000\n\nStep 2: registers per store by size\n- Large (Aeon, Ito-Yokado, about 2,000): 15/store (5 manned + 10 self-checkout)\n- Mid (about 8,000): 8/store\n- Small/regional (about 12,000): 4/store\n\nStep 3: multiply\n- 2,000 × 15 = 30,000\n- 8,000 × 8 = 64,000\n- 12,000 × 4 = 48,000\n\nStep 4: total\n```\n30,000 + 64,000 + 48,000 ≈ about 142,000 registers\n```\n\nActual: about 150-180K registers in Japanese supermarkets (POS industry estimate)\n→ About 10% error. Strong precision.\n\nKey insight: "unit facility size × items per unit" generalizes infinitely.\n- Supermarket × register → retail IT investment estimate\n- Hospital × bed → medical capacity\n- School × classroom → ed-tech market\n- Station × ticket gate → rail infrastructure refresh need',
      visual: 'FermiFormulaDiagram',
      visualProps: {
        sectionLabel: 'Supermarket registers in Japan — by store size',
        factors: [
          { label: 'Large stores', value: '2,000', unit: '× 15 units' },
          { label: 'Mid stores', value: '8,000', unit: '× 8 units' },
          { label: 'Small stores', value: '12,000', unit: '× 4 units' },
        ],
        result: { label: 'Total', value: '~142', unit: 'K units' },
        hint: 'Same "unit × per-unit count" formula applies to hospital × bed, school × classroom',
      },
    },
    {
      type: 'explain',
      title: 'Pitfalls of the unit-based pattern',
      content: 'Pitfall 1: averaging too coarsely\n- 22,000 × avg 8 = 176,000 — loses precision\n- → Always 3-4 tier size split\n\nPitfall 2: vague facility definition\n- "Supermarket" — pure grocery? Includes home centers and drugstores?\n- Define scope before starting\n- Answer shifts 2-3x based on inclusion\n\nPitfall 3: per-facility numbers anchored to personal experience\n- Frequent Aeon shoppers overestimate national register count\n- → Mentally include shopping-district independents and regional chains\n\nPitfall 4: confusing the base facility count\n- Mixing up supermarkets (22K) with convenience stores (57K)\n- → Memorize main facility counts via your base-fact set',
    },
    {
      type: 'think',
      question: 'Use the unit-based pattern to estimate "the number of ATMs in Japanese convenience stores".',
      hint: 'Start from convenience-store count (57,000) and estimate ATMs per store. Note: not every store has one.',
      modelAnswer: 'Answer: about 53,000 units\n\nStep 1: unit base\n- Convenience stores: about 57,000\n\nStep 2: ATM installation rate\n- Big 3 (7-Eleven, Lawson, FamilyMart) install ATMs in nearly all locations → 95%\n- Exceptions: mini-format, airport stores\n\nStep 3: ATMs per store\n- Mostly 1, large stations 2\n- Average: 1/store\n\nStep 4: calculate\n```\n57,000 × 0.95 × 1 ≈ about 54,000\n```\n\nActual: Seven Bank ATMs about 27K + Lawson Bank about 14K + others (Aeon Bank, Japan Post linkage etc.) about 10-20K = over 50K total\n→ Estimate aligns.\n\nKey insight:\n- Installation rate hinges on "is it part of the chain\'s standard spec?"\n- Cross-check: published Seven Bank ATM count vs estimate\n- ATM refresh cycle (7 years) × ¥2M/unit → market scale ¥150B per cycle',
      points: [
        '3-stage formula: convenience-store count 57K × install rate × ATMs per store',
        'Install rate driven by "is it chain standard?"',
        'Multiply by unit price and refresh cycle to convert to business impact',
      ],
    },
    {
      type: 'quiz',
      explanation: 'Unit-based fits "unit facilities × items per facility" math. Vending machines at stations is the textbook case. Smartphones are individual base, household electricity is household base, GDP is macro and unrelated to facilities.',
      question: 'Which is most naturally calculated with the unit-based pattern?',
      options: [
        { label: 'Vending machines at Japanese stations', correct: true },
        { label: 'Smartphones owned in Japan', correct: false },
        { label: 'Annual household electricity consumption', correct: false },
        { label: 'Japan\'s nominal GDP', correct: false },
      ],
    },
    {
      type: 'quiz',
      explanation: 'The biggest precision lever in unit-based is "split unit facilities by size tier." Option 1 falls into the averaging trap. Option 3 applies an arbitrary 0.8 multiplier without basis. Option 4 retreats to a different pattern. Tier-splitting wins.',
      question: 'What is the most effective technique for boosting precision in the unit-based pattern?',
      options: [
        { label: 'Split unit facilities into large/medium/small tiers and stack', correct: true },
        { label: 'Keep things simple by using a single average', correct: false },
        { label: 'Multiply the estimate by 0.8 to err conservative', correct: false },
        { label: 'Drop external facility-count data and rely on personal experience', correct: false },
      ],
    },
  ],
}

// -- Lesson 214: Macro/Micro sales pattern ----------------------------
const fermiLesson214: LessonData = {
  id: 214,
  title: 'Macro / Micro Sales: Squeeze from above and below',
  category: 'Fermi Estimation',
  steps: [
    {
      type: 'explain',
      title: 'What is the macro / micro sales pattern?',
      content: 'The macro / micro sales pattern decomposes "revenue = price × quantity" from both macro (industry total) and micro (per-store / per-customer) directions, then squeezes the answer between them.\n\nFormula:\n```\nIndustry revenue = industry customers × industry avg price = sum of store revenues\nStore revenue = daily customers × spend × open days\n```\n\nWhen to use:\n- When you want both "industry size" and "per-store revenue"\n- When you want to cross-check macro and micro for consistency\n- Examples: total Starbucks Japan revenue, per-store Uniqlo revenue, total convenience-store industry\n\nCharacteristics:\n- Same revenue computed from both macro and micro views\n- If both align, confidence is high\n- If they diverge, you can pinpoint where your assumption was wrong',
      visual: 'FermiMacroMicroSplitDiagram',
    },
    {
      type: 'explain',
      title: 'Example 1: total Starbucks Japan daily revenue',
      content: 'Question: total daily revenue across all Starbucks stores in Japan?\n\n### Macro view (top-down)\nStep 1: annual industry revenue\n- Starbucks Japan revenue: about ¥200B/year (industry estimate)\n\nStep 2: convert to daily\n- ¥200B / 365 ≈ about ¥550M/day\n\n### Micro view (bottom-up)\nStep 1: stores\n- Starbucks Japan stores: about 1,800\n\nStep 2: daily customers per store\n- Peak-quiet average: 30/hour × 12 hours = 360/day\n\nStep 3: spend\n- Drink ¥500 + occasional food → average ¥600\n\nStep 4: per-store daily revenue\n- 360 × ¥600 = about ¥216K/day\n\nStep 5: total daily\n- 1,800 × ¥216K ≈ about ¥390M/day\n\n### Consistency check\n- Macro: ¥550M\n- Micro: ¥390M\n- 30% gap → roughly aligned\n- Explainable by location/store-size mix and weekday/weekend variance\n\nReference value (actual): Starbucks Coffee Japan reports roughly ¥200-250B/year, i.e. about ¥550-680M/day.\n→ The macro estimate (¥550M/day) is right on; the micro estimate (¥390M/day) runs a touch low. Nudging up either daily customers or ticket size brings the two into line.',
      visual: 'FermiMacroMicroSplitDiagram',
    },
    {
      type: 'explain',
      title: 'Example 2: cross-check Japanese convenience-store industry',
      content: 'Question: annual size of the Japanese convenience-store industry?\n\n### Macro view: population-based\n- Users: 124M × usage 0.6 = 74M\n- Frequency: 2x/week = 100/year\n- Spend: ¥700\n- Macro revenue: 74M × 100 × ¥700 = about ¥5.2T\n\n### Micro view: store-based\n- Stores: 57,000\n- Daily customers/store: 1,000\n- Spend: ¥700\n- Daily store revenue: 1,000 × ¥700 = ¥700K\n- Annual store revenue: ¥700K × 365 = ¥255M\n- Industry total: 57,000 × ¥255M = about ¥14.5T\n\n### Consistency check\n- Macro: ¥5.2T\n- Micro: ¥14.5T\n- 3x gap — error somewhere\n\n### Diagnose\n- Macro "100/year" assumes 2x/week, but heavy users hit 5-10/week (lunch/dinner)\n- Split heavy 25% (300/year) vs light 75% (50/year):\n  - 74M × (0.25 × 300 + 0.75 × 50) × ¥700 ≈ ¥6.5T\n- Micro "1,000/day/store" overstates urban; avg 700/day → about ¥10T\n\nActual: convenience-store industry about ¥12T\n→ Macro and micro both converge after correction.\n\nLesson:\n- This pattern\'s real value: compute both → spot gap → fix the wrong assumption\n- Misaligned numbers are an opportunity to find distortions in your own assumptions',
      visual: 'FermiMacroMicroSplitDiagram',
    },
    {
      type: 'explain',
      title: 'Tips for the macro / micro sales pattern',
      content: 'Tip 1: compute the two independently\n- If you do macro first, you\'ll bend micro to fit (confirmation bias)\n- → Write on opposite sides of the page or compute at separate times\n\nTip 2: categorize gaps into 3\n- (a) Base population error: wrong users or store count\n- (b) Frequency error: 100/year vs 200/year\n- (c) Spend error: ¥600 vs ¥800 per ticket\n- → Habit: hypothesize the cause, then verify\n\nTip 3: take the midpoint as the answer\n- If errors run both directions, the average is often closest\n- Lean toward the side with stronger grounding (public data, store visits)\n\nTip 4: memorize per-store revenue benchmarks\n- Starbucks per store/day: about ¥300K (annual ¥100M)\n- Convenience per store/day: about ¥500-700K (annual ¥200M)\n- McDonald\'s per store/day: about ¥600K (annual ¥220M)\n- Use these as rulers for other chain estimates',
    },
    {
      type: 'think',
      question: 'Use the macro/micro sales pattern to compute both "annual McDonald\'s Japan total revenue" and "per-store daily revenue", and cross-check.',
      hint: 'Macro: foodservice market × MCD share, or population × usage × spend. Micro: stores × per-store revenue × 365.',
      modelAnswer: 'Answer: macro and micro both around ¥300B/year, per-store daily about ¥280K\n\n### Macro: demand side\n- Users: 124M × monthly-once 0.4 = about 50M\n- Frequency: 2/month → 24/year\n- Ticket: ¥700\n- Macro: 50M × 24 × ¥700 = about ¥840B\n\n→ But that\'s "all fast-food incl. MCD". MCD share 30%:\n- ¥840B × 0.3 = about ¥250B\n\n### Micro: store side\n- Stores: about 2,900\n- Daily customers: peak 200/hour × 14 hours × peak factor 0.25 = 700/day\n- Spend: ¥700\n- Daily store revenue: 700 × ¥700 = ¥490K (overstates)\n- Annual store: ¥490K × 365 = ¥180M\n- Industry: 2,900 × ¥180M = about ¥520B\n\n### Consistency check\n- Macro: ¥250B\n- Micro: ¥520B\n- 2x gap\n\n→ Adjust micro daily customers to 350 (peak factor 0.125):\n- Daily store: 350 × ¥700 = about ¥245K\n- Total: 2,900 × ¥245K × 365 = about ¥260B\n\nActual: McDonald\'s Holdings Japan revenue about ¥350B\n→ Macro and micro converge at ¥250-260B after correction.\n\nLesson:\n- Build per-store daily customers as "peak × hours × factor" for precision\n- Macro-micro gaps usually trace to over-estimated customer counts',
      points: [
        'Macro from demand side, micro from supply side, independently',
        'Diagnose gaps via "base / frequency / spend" buckets',
        'Per-store daily customers is the most precision-critical assumption',
      ],
    },
    {
      type: 'quiz',
      explanation: 'The biggest value of macro/micro is finding wrong assumptions via the gap. Option 1 is mere efficiency. Option 3 is a different pattern (cross-check). Option 4 hurts precision.',
      question: 'What is the biggest value of the macro / micro sales pattern?',
      options: [
        { label: 'Keeping calculations simple', correct: false },
        { label: 'Spotting wrong assumptions from the gap between the two', correct: true },
        { label: 'Solving the same problem with completely different patterns', correct: false },
        { label: 'Raising significant figures from 2 to 3', correct: false },
      ],
    },
    {
      type: 'quiz',
      explanation: 'Per-store daily revenue as a ruler accelerates other chain estimates. Starbucks about ¥300K, convenience about ¥500-700K, McDonald\'s about ¥250-300K. Option 1 (¥30K) is one order too low and means a loss-making store. Option 3 (¥2M) is a flagship urban store, not generalizable. Option 4 (¥15M) implies revenue over ¥1B/year per store, no real chain hits that.',
      question: 'Which is closest to average Starbucks per-store daily revenue?',
      options: [
        { label: 'About ¥30K', correct: false },
        { label: 'About ¥300K', correct: true },
        { label: 'About ¥2M', correct: false },
        { label: 'About ¥15M', correct: false },
      ],
    },
  ],
}

// -- Lesson 215: Macro demand / micro supply pattern ------------------
const fermiLesson215: LessonData = {
  id: 215,
  title: 'Macro Demand / Micro Supply: Back out headcount',
  category: 'Fermi Estimation',
  steps: [
    {
      type: 'explain',
      title: 'What is the macro demand / micro supply pattern?',
      content: 'The macro demand / micro supply pattern divides "total demand needed" by "supply capacity per unit" to back out the required number of supply units (people or facilities).\n\nFormula:\n```\nRequired supply count = macro demand / supply capacity per unit\n```\n\nWhen to use:\n- For estimating "how many people work in X profession"\n- The original Fermi problem ("Chicago piano tuners") is exactly this pattern\n- Examples: piano tuners, delivery drivers, medical clerks, hairdressers, sushi chefs\n\nCharacteristics:\n- Combines demand (macro) and supply (micro) from different angles\n- "Annual capacity per person" is the key\n- Builds intuition for occupational productivity data',
      visual: 'FermiDemandDivSupplyDiagram',
    },
    {
      type: 'explain',
      title: 'Example 1: piano tuners in Japan (Fermi\'s original problem, Japan edition)',
      content: 'Question: how many piano tuners work in Japan?\n\n### Macro demand: annual tunings\n- Pianos: 2.5M (per lesson 210)\n- Tuning frequency: 0.5/year (typical home: every 2 years)\n- Annual tunings: 2.5M × 0.5 = 1.25M/year\n\n### Micro supply: tunings per tuner\n- 3/day (1hr work + 1hr travel, 6hr workday → 3 tunings)\n- 200 work days/year (weekends off, freelance)\n- 1 tuner/year: 3 × 200 = 600 tunings/year\n\n### Required count\n```\n1.25M / 600 ≈ about 2,100 people\n```\n\nActual: about 6,000-7,000 piano tuners (Japan Piano Tuners Association etc.)\n→ Estimate is 1/3. Overstated micro supply\n- Including travel/prospecting/bookkeeping → real 1-2 tunings/day\n- 1 tuner/year = 1.5 × 200 = 300 tunings → 1.25M / 300 = 4,200 people\n\nLesson: don\'t inflate "per-person productivity" — that\'s the key precision lever.',
      visual: 'FermiDemandDivSupplyDiagram',
    },
    {
      type: 'explain',
      title: 'Example 2: delivery drivers in Japan',
      content: 'Question: how many delivery drivers (last-mile) work in Japan?\n\n### Macro demand: annual deliveries\n- E-commerce market ¥25T / ¥10K per order = 2.5B orders\n- Non-EC (gifts, docs) 5B\n- Total: about 7.5-10B/year\n- Set: 9B\n\n### Micro supply: deliveries per driver per year\n- 100/day (peak season 200)\n- 250 work days/year\n- 1 driver: 100 × 250 = 25,000/year\n\n### Required count\n```\n9B / 25,000 ≈ about 360,000 drivers\n```\n\nActual: about 300-400K truck/delivery drivers (MHLW stats: Yamato/Sagawa/Japan Post + sole proprietors)\n→ Within 10% — excellent.\n\nKey insight:\n- Demand side: split "EC + non-EC"\n- Micro supply: honestly estimate "actual deliveries per driver per day"\n- Result: demand / supply = required headcount',
      visual: 'FermiDemandDivSupplyDiagram',
    },
    {
      type: 'explain',
      title: 'Tips and pitfalls of macro demand / micro supply',
      content: 'Tip 1: estimate demand and supply independently\n- Demand: "how much is needed in Japan?"\n- Supply: "how many can one person physically handle?"\n- Don\'t mix\n\nTip 2: keep per-person productivity conservative\n- "8hr workday, 1hr/case → 8 cases/day" overstates\n- Real productivity drops to 40-60% with travel, prep, records, breaks\n- → Multiply by 0.5\n\nTip 3: working days = 200-250/year\n- 365 - 105 weekends = 250 standard\n- Freelance or seasonal: 200\n- Professional (training/break): 180\n\nPitfall 1: confusing "required" and "actual"\n- "Needed to meet demand" ≠ "actually employed in that role"\n- Regulated industries can have surplus; understaffed industries have shortage\n- → Acknowledge the labor-market bias in your answer\n\nPitfall 2: supply unit choice\n- "Per person" vs "per company" change the answer\n- Example: delivery → individual drivers vs delivery companies\n- → Define the minimum unit explicitly',
    },
    {
      type: 'think',
      question: 'Use macro demand / micro supply to estimate "yoga instructors in Japan". Build demand side, then divide by annual lessons per instructor.',
      hint: 'Yoga participants (population × participation rate), annual visits, participants per lesson (about 10), annual lessons per instructor (weekly × 50 weeks).',
      modelAnswer: 'Answer: about 50,000-60,000\n\n### Macro demand: annual participations (person-visits)\n- Participants: 124M × 5% = 6.2M\n- Annual visits per person: 2/month × 12 = 24\n- Annual person-visits: 6.2M × 24 = 149M person-visits/year\n\n### Micro supply: per instructor\n- Participants per lesson: 10\n- Per lesson: handles "10 person-visits"\n- 3 lessons/day × 4 days/week = 12 lessons/week\n- Year 50 weeks = 600 lessons\n- Annual person-visits: 600 × 10 = 6,000/year\n\n### Required\n```\n149M / 6,000 ≈ about 25,000 people\n```\n\n→ Many instructors work part-time at gyms rotating across staff. Adjust × 2 for side-hustle:\n- About 50,000 people\n\nActual: about 50,000-80,000 yoga instructors / trainers in Japan (industry estimate)\n→ Aligns.\n\nLesson:\n- Watch for double-counting (1 lesson × 1 instructor × multiple participants)\n- Side-hustle vs full-time definition shifts the answer 2x',
      points: [
        'Build demand in "person-visit" units (people × visits)',
        'Build supply in "annual person-visits per instructor"',
        'Explicit "side-hustle vs full-time" definition is required',
      ],
    },
    {
      type: 'quiz',
      explanation: 'Macro demand / micro supply is "back out the required headcount". Option 1 (barbers) is the textbook case. Option 2 is revenue estimation. Option 3 is household-based. Option 4 is market sizing.',
      question: 'Which is most naturally calculated with the macro demand / micro supply pattern?',
      options: [
        { label: 'Number of barbers in Japan', correct: true },
        { label: 'Starbucks store revenue', correct: false },
        { label: 'Japanese household refrigerator count', correct: false },
        { label: 'Japanese automotive market size', correct: false },
      ],
    },
    {
      type: 'quiz',
      explanation: 'Per-person annual capacity is the biggest precision lever. "8/day × 250 days = 2,000" overstates — real productivity is 40-60% after travel/records. "Cap productivity at 0.5x computed" is the golden rule.',
      question: 'What is the most important technique for boosting precision in macro demand / micro supply?',
      options: [
        { label: 'Cap per-person productivity around 0.5x the textbook computation', correct: true },
        { label: 'Keep demand decomposition coarse, divide by a single number', correct: false },
        { label: 'Set working days to 365', correct: false },
        { label: 'Assume actual headcount = 2x required in shortage industries', correct: false },
      ],
    },
  ],
}

// -- Lesson 216: Cross-check ------------------------------------------
const fermiLesson216: LessonData = {
  id: 216,
  title: 'Cross-check: Verify with two independent equations',
  category: 'Fermi Estimation',
  steps: [
    {
      type: 'explain',
      title: 'What is cross-checking?',
      content: 'Cross-checking solves the same question via two independent paths and verifies whether the results align.\n\nHow:\n1. Path A: e.g., build from the demand side\n2. Path B: e.g., build from the supply side\n3. Check that both fall in the same order of magnitude\n4. If they diverge significantly, diagnose which assumption is off\n\nWhy it matters:\n- A single path has its own biases\n- Two paths squeeze out scale errors and logic errors\n- In interviews and consulting cases, "logical depth" gets scored\n\nPicking 2 of the 6 patterns (individual, corporate, area, unit, macro/micro sales, macro/micro supply) is the classic cross-check setup.',
      visual: 'FermiCrossCheckDiagram',
    },
    {
      type: 'explain',
      title: 'Example 1: cross-check Japanese beauty salon market',
      content: 'Question: annual revenue of Japan\'s beauty salon market?\n\n### Path A: demand side (individual base)\n- Women 60M × 4 visits/year × ¥5,000 = ¥1.2T\n- Men 60M × 6 visits/year × ¥1,500 = ¥0.54T\n- A total: about ¥1.7T\n\n### Path B: supply side (unit base)\n- Salons: 250K\n- Daily store revenue: ¥50K (5 customers × ¥10K)\n- Open days: 300/year\n- Annual store: ¥50K × 300 = ¥15M\n- Industry: 250K × ¥15M = about ¥3.75T\n\n### Cross-check\n- A: ¥1.7T\n- B: ¥3.75T\n- About 2x gap\n\n### Diagnose\n- B "¥50K/day" overstates price (real avg: ¥3,000 × 7 customers = ¥21K)\n- Adjust B: 250K × ¥21K × 300 = ¥1.6T\n- After adjustment: A ¥1.7T, B ¥1.6T → aligned\n\n### Visit-count assumption (unit aligned)\n- Path A uses this course\'s shared assumption: women = 4 visits/year, men = 6 visits/year (about 5/year averaged).\n- Total visits = women 240M + men 360M = about 600M/year → about 5 visits/person/year.\n- To avoid confusing this with "X times per month," always normalize to "visits / person / year" before checking.\n\nActual: Japan beauty salon market about ¥1.5-2T (Recruit, Yano Research)\n→ Cross-check revealed "overstated unit-price assumption on path B".',
      visual: 'FermiCrossCheckDiagram',
    },
    {
      type: 'explain',
      title: 'Example 2: cross-check Japanese taxi industry',
      content: 'Question: annual revenue of Japan\'s taxi industry?\n\n### Path A: demand side (individual)\n- Users: 124M × 20% taxi-using = 25M\n- Annual rides per user: 6\n- Average fare: ¥2,000\n- A: 25M × 6 × ¥2,000 = about ¥300B\n\n### Path B: supply side (unit)\n- Taxis: 220K\n- Daily revenue per cab: ¥30K (10 rides × ¥3,000, occupancy 50%)\n- Working days: 300\n- Annual per cab: ¥30K × 300 = ¥9M\n- Industry: 220K × ¥9M = about ¥2T\n\n### Cross-check\n- A: ¥300B\n- B: ¥2T\n- About 6x gap — too wide\n\n### Diagnose\n- A "20% user share" understates: business, tourism, night use push it up\n- Adjust A: 50% × 10 rides × ¥2,000 = ¥1.24T\n- B "¥30K/day" is reasonable at 50% occupancy; working days 250 → 220K × ¥30K × 250 = ¥1.65T\n- After: A ¥1.24T, B ¥1.65T → aligned\n\nActual: Japan taxi industry about ¥1.5-1.7T (National Hire-Taxi Association)\n→ Cross-check revealed "user-share assumption was too low on path A".',
      visual: 'FermiCrossCheckDiagram',
    },
    {
      type: 'explain',
      title: 'Practical techniques for cross-checking',
      content: 'Technique 1: pick 2 of the 6 patterns\n- Individual / corporate / area / unit / macro-micro sales / macro-micro supply — choose 2\n- Recommended pairings:\n  - "Demand ↔ supply" (most universal)\n  - "Individual ↔ unit" (retail / services)\n  - "Macro ↔ micro" (industry ↔ store)\n  - "Macro demand ↔ corporate" (B2B sizing)\n\nTechnique 2: categorize gaps by direction\n- A > B: demand overstated or supply understated\n  - One of "usage/frequency/spend" inflated on demand side\n- A < B: demand understated or supply overstated\n  - "Per-unit productivity" inflated on supply side\n\nTechnique 3: "same order of magnitude" is success\n- Fermi prioritizes order, not exact match\n- 2-3x gap = aligned\n- Revisit only at 5x+ gaps\n\nTechnique 4: how to narrate in interviews\n- "Demand gives ¥X-trillion, supply gives ¥Y-trillion. The 3x gap suggests the demand-side usage rate is off, so…" — voice out gap recognition → root cause → correction\n- Even if the final number isn\'t perfect, you signal "logical thinker"',
    },
    {
      type: 'think',
      question: 'Use cross-check to estimate "annual Japanese fitness gym market" via two paths. Label A and B, then diagnose the gap.',
      hint: 'Path A: individual (members × monthly fee × 12). Path B: corporate or unit (gym count × per-store revenue). Compute both and compare.',
      modelAnswer: 'Answer: about ¥500-600B/year\n\n### Path A: individual (demand)\n- Population 124M × member rate 6% = about 7.5M\n- Monthly fee: avg ¥8,000 (midpoint between 24-hour gyms at ¥5K and majors at ¥12K)\n- Annual: ¥8K × 12 = ¥96K/year\n- A: 7.5M × ¥96K = about ¥720B\n\n### Path B: unit (supply)\n- Gyms: about 8,000\n- Members per gym: avg 1,000\n- Annual revenue per gym: 1,000 × ¥96K = ¥96M\n- B: 8,000 × ¥96M = about ¥770B\n\n### Cross-check\n- A: ¥720B\n- B: ¥770B\n- 7% gap, near-perfect alignment\n\nActual: Japan fitness market about ¥520B (METI Specified Service Industry Survey, 2023)\n→ Overstates by 30%, but correct order. Adjust monthly fee to ¥6,500 → aligns.\n\nKey insight:\n- A-B alignment depends on shared assumption (monthly fee ¥96K)\n- For truer cross-check, rebuild B as "members × spend × frequency" with independent factors\n- Either way, "fitness ≈ hundreds of billions" survives both paths',
      points: [
        'Compute demand (people × price) and supply (stores × price) in two paths',
        'Near-perfect alignment = high confidence',
        'Truly independent paths require restructuring one side\'s decomposition',
      ],
    },
    {
      type: 'quiz',
      explanation: 'The biggest value of cross-check is "discover wrong assumptions via the gap." Option 1 just doubles work. Option 3 mixes with a different pattern (macro/micro sales). Option 4 misunderstands "precision" in Fermi.',
      question: 'What is the biggest value of cross-checking?',
      options: [
        { label: 'Doubles the calculation work for show', correct: false },
        { label: 'Reveals wrong assumptions from the gap between two paths', correct: true },
        { label: 'Lets you size demand and supply markets separately', correct: false },
        { label: 'Increases significant figures from 2 to 3', correct: false },
      ],
    },
    {
      type: 'quiz',
      explanation: 'Cross-check works best when the two paths use truly independent assumptions. "Demand × demand" with different bases isn\'t truly independent. Geography is a side issue, not a path. Same path with rounding differences isn\'t a check.',
      question: 'Which is the best pair of paths for cross-checking?',
      options: [
        { label: 'Demand (population-based) and demand (household-based)', correct: false },
        { label: 'Demand (individual × frequency) and supply (stores × revenue)', correct: true },
        { label: 'All of Japan and Tokyo only', correct: false },
        { label: 'With decimals and without decimals', correct: false },
      ],
    },
  ],
}

export const fermiLessonMapPatternEn: Record<number, LessonData> = {
  210: fermiLesson210,
  211: fermiLesson211,
  212: fermiLesson212,
  213: fermiLesson213,
  214: fermiLesson214,
  215: fermiLesson215,
  216: fermiLesson216,
}
