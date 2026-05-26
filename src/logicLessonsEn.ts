import type { LessonData } from './lessonData'

// English versions of the 8 logical-thinking lessons.
// Cases adapted for an international business audience (no Japan-specific
// cultural references). Same lesson IDs as the Japanese versions so the
// rest of the app (placement test recommendations, completion tracking,
// continue-from card) keeps working.

const logicMeceEn: LessonData = {
  id: 20,
  title: 'MECE — Mutually Exclusive, Collectively Exhaustive',
  category: 'Logical Thinking',
  steps: [
    {
      type: 'explain',
      title: 'What is MECE?',
      content:
        'MECE (pronounced "mee-see") stands for "Mutually Exclusive, Collectively Exhaustive." It is the most fundamental framework for analyzing and organizing information in business.\n\n■ Mutually Exclusive\nNo overlap between categories. The same item never appears in more than one bucket.\n\n■ Collectively Exhaustive\nEverything is covered. No gaps, no missing pieces.\n\nWhy MECE matters:\n① Prevents blind spots → better decisions\n② Eliminates duplication → efficient resource allocation\n③ Clearer communication → team alignment',
    },
    {
      type: 'explain',
      title: 'Four ways to break things down MECE',
      visual: 'MecePatternsDiagram',
      content:
        'There are four common patterns for MECE decomposition.\n\n[1] Component breakdown (formula-style)\nSplit a whole into its mathematical components.\nExamples: Revenue = customers × average order value\nProfit = Revenue − Cost\n\n[2] Time sequence\nSplit by stages over time.\nExample: Buying journey = Awareness → Interest → Consideration → Purchase → Repeat\n\n[3] Opposing concepts\nSplit by binary or near-binary categories.\nExamples: Domestic / International, Existing / New, Online / Offline\n\n[4] Established framework\nUse a known framework as the cut.\nExamples: 3C (Customer, Competitor, Company), 4P (Product, Price, Place, Promotion)\n\nPick whichever pattern gives the clearest, least-overlapping cut for your problem.',
    },
    {
      type: 'quiz',
      question: 'What does the "Mutually Exclusive" half of MECE mean?',
      options: [
        { label: 'Everything is covered with no gaps in the structure', correct: false },
        { label: 'Categories do not overlap — no item lives in two buckets', correct: true },
        { label: 'The structure is hierarchical and tree-shaped', correct: false },
        { label: 'Items are arranged in chronological order', correct: false },
      ],
      explanation:
        '"Mutually Exclusive" specifically means no overlap. The "no gaps" property is "Collectively Exhaustive," the other half of MECE and a common mix-up. Hierarchy and ordering are properties of trees but unrelated to whether categories overlap.',
    },

    {
      type: 'explain',
      title: '[Case 1] Why are sales falling? — 3C analysis as MECE',
      visual: 'MeceCaseDiagram',
      content:
        '■ Setup\nYou are a strategy analyst at a mid-sized apparel company. Sales have dropped 15% year over year for three quarters in a row. You need to present a root-cause analysis to the executive team.\n\n■ MECE breakdown using 3C\n\n[Customer]\n· Shifting purchase behavior in the 20-35 demographic\n· Lower disposable income → more price-conscious\n· Migration to fast fashion brands\n· Growing share of e-commerce in the category\n\n[Competitor]\n· Aggressive pricing from large SPA brands\n· Rise of direct-to-consumer brands with strong social marketing\n· Foreign brands entering the local market\n· Competitors investing heavily in apps and personalization\n\n[Company]\n· Slow product development cycle vs. competitors\n· Store locations no longer match where customers go\n· Marketing budget over-indexed on print media\n· E-commerce share half of industry average\n\n■ Why it works\n3C forces you to look at the problem from three non-overlapping angles. You will not accidentally focus only on competitors or only on internal issues.',
    },
    {
      type: 'quiz',
      question: 'When applying 3C MECE to a sales decline, which bucket fits "competitor lowered prices, so customers left us"?',
      options: [
        { label: 'Customer — because the visible effect is customer churn', correct: false },
        { label: 'Competitor — because the trigger is the competitor\'s pricing move', correct: true },
        { label: 'Company — because we failed to retain price-sensitive buyers', correct: false },
        { label: 'All three — every story touches customer, competitor, and us', correct: false },
      ],
      explanation:
        'Classify by the root cause, not by the visible effect or by self-blame. The triggering event is the competitor\'s pricing move, so it goes in Competitor. Putting one cause into all three buckets is the most common MECE violation — it makes analysis impossible because every event ends up everywhere.',
    },

    {
      type: 'explain',
      title: '[Case 2] Mapping new-customer channels for a B2B SaaS',
      content:
        '■ Setup\nA B2B SaaS marketing team needs to map every possible new-customer acquisition channel before reallocating budget.\n\n■ MECE breakdown (opposing concepts → component breakdown)\n\n[Online channels]\n├─ Inbound\n│  ├─ SEO / content marketing\n│  ├─ Social (LinkedIn, X, Facebook)\n│  └─ Webinars\n├─ Outbound\n│  ├─ Search ads (Google, Bing)\n│  ├─ Display / retargeting\n│  ├─ Cold email\n│  └─ Social ads (LinkedIn Ads, etc.)\n└─ Referral / word-of-mouth\n   ├─ Affiliate program\n   └─ Review sites (G2, Capterra)\n\n[Offline channels]\n├─ Inbound\n│  ├─ Conference booths\n│  └─ Hosted seminars\n├─ Outbound\n│  ├─ Cold calling\n│  ├─ Direct mail\n│  └─ Door-to-door\n└─ Referral / word-of-mouth\n   ├─ Partner channel\n   └─ Existing-customer referrals\n\n■ Pattern\nFirst cut: Online vs Offline (opposing concepts). Second cut: Inbound vs Outbound vs Referral (more opposing concepts). Multi-level decomposition gives you a complete map without overlaps.',
    },
    {
      type: 'quiz',
      question: 'Splitting acquisition channels first by Online/Offline, then by Inbound/Outbound — what MECE patterns are these?',
      options: [
        { label: 'Component breakdown → Time sequence', correct: false },
        { label: 'Opposing concepts → Opposing concepts', correct: true },
        { label: 'Established framework (3C/4P) → Component breakdown', correct: false },
        { label: 'Time sequence → Established framework', correct: false },
      ],
      explanation:
        'Both cuts are binary opposites (Online vs Offline, Inbound vs Outbound), which is the "Opposing concepts" pattern. Component breakdown is mathematical (Revenue = Price × Quantity); time sequence is a chronological flow; established frameworks (3C/4P) come from named models. Confusing "any binary cut" with the latter is a common mix-up.',
    },

    {
      type: 'explain',
      title: '[Case 3] Decomposing a coffee chain\'s revenue',
      content:
        '■ Setup\nYou manage a 10-store coffee chain. Total monthly revenue is 20% below target. To find the leak, you decompose revenue MECE.\n\n■ Multi-level component breakdown\n\nRevenue = Customers × Average ticket\n\n[Customer count]\n├─ New customers\n│  ├─ Foot traffic (location)\n│  ├─ Ad-driven\n│  ├─ Word of mouth\n│  └─ Review-site driven\n├─ Repeat customers\n│  ├─ Heavy users (3+ visits/week)\n│  ├─ Mid users (1-2 visits/week)\n│  └─ Light users (1-3 visits/month)\n└─ Time of day\n   ├─ Morning (7-10am)\n   ├─ Lunch (11-2pm)\n   ├─ Afternoon (2-5pm)\n   └─ Evening (5-9pm)\n\n[Average ticket]\n├─ Drink price × drink attach rate\n├─ Food price × food attach rate\n├─ Dessert price × dessert attach rate\n└─ Takeaway vs. dine-in difference\n\n■ What the data shows\nDigging in: repeat customers held steady but new customers fell 30%, especially review-site traffic. A competing chain\'s rising review scores were stealing first-time visitors.\n\n■ Why it works\n"Revenue = Customers × Ticket" is a classic component breakdown. Going one more level lets you connect the analysis to specific actions.',
    },
    {
      type: 'quiz',
      question: 'Splitting revenue into "Customers × Average ticket" — which MECE pattern is this?',
      options: [
        { label: 'Time sequence — visits happen before the average ticket settles', correct: false },
        { label: 'Opposing concepts — customers vs ticket are two opposing factors', correct: false },
        { label: 'Component breakdown — a whole split into mathematical parts', correct: true },
        { label: 'Established framework — a named model from textbooks', correct: false },
      ],
      explanation:
        'Splitting a whole using a mathematical identity (A × B or A + B) is component breakdown. Time sequence requires a temporal flow, opposing concepts requires binary contrasts, and established frameworks come from named models like 3C/4P. The classic trap is calling any two-part split "opposing concepts" — the test is whether the parts multiply or add up to the whole.',
    },
    {
      type: 'quiz',
      question: 'Which of the following is NOT MECE?',
      options: [
        { label: 'Gender: male / female / other (other absorbs everything else)', correct: false },
        { label: 'Age: 10s / 20s / 30s / 40s / 50+ (contiguous numeric ranges)', correct: false },
        { label: 'Region: North / South / East / urban / rural (mixed cuts)', correct: true },
        { label: 'Purchase frequency: first-time / 2nd / 3+ (contiguous counts)', correct: false },
      ],
      explanation:
        'The region answer mixes two unrelated cuts — geographic direction (North/South/East) and population density (urban/rural). The same area can be "North" AND "rural," so the buckets overlap. The other three keep a single cut and stay MECE. Mixing cuts at the same level is the most common MECE failure in real analyses.',
    },
    {
      type: 'quiz',
      question: 'A company classifies employees as "Full-time / Contract / Part-time." Temporary and freelance workers are missing. What MECE problem is this?',
      options: [
        { label: 'Overlap — full-time and contract include the same people', correct: false },
        { label: 'Gap — temps and freelancers fit in none of the buckets', correct: true },
        { label: 'Both — overlap between contract/part-time AND gaps elsewhere', correct: false },
        { label: 'No issue — the three buckets cover the standard workforce', correct: false },
      ],
      explanation:
        'The categories themselves do not overlap, but they fail the "Collectively Exhaustive" rule because temps and freelancers fit nowhere. "No issue" is the most common workplace error — assuming the conventional three categories cover everyone simply because they are familiar.',
    },
    {
      type: 'quiz',
      question: 'What is the most effective approach to producing a MECE breakdown?',
      options: [
        { label: 'Brainstorm items freely, then sort them into buckets afterwards', correct: false },
        { label: 'Pick a top-level cut first, then progressively subdivide', correct: true },
        { label: 'Copy the analysis structure from a leading competitor', correct: false },
        { label: 'List as many items as possible to ensure exhaustiveness', correct: false },
      ],
      explanation:
        'MECE is engineered top-down: choose the high-level cut, then subdivide. Bottom-up brainstorming feels productive but often produces overlapping buckets that need rework. Copying competitors imports their blind spots, and maximizing item count optimizes for volume rather than the no-overlap / no-gap discipline.',
    },
  ],
}

const logicTreeEn: LessonData = {
  id: 21,
  title: 'Logic Tree — Decomposing Problems',
  category: 'Logical Thinking',
  steps: [
    {
      type: 'explain',
      title: 'What is a logic tree?',
      visual: 'LogicTreeDiagram',
      content:
        'A logic tree breaks a complex problem into a tree of smaller, more manageable parts. By decomposing, you:\n① See the whole problem at once\n② Surface every possible cause or solution\n③ Prioritize what to act on first\n\nThree main flavors:\n\n[Why tree] Asks "Why?" repeatedly. Used to find root causes.\n[How tree] Asks "How?" Used to brainstorm specific solutions.\n[What tree] Decomposes structure ("What is it made of?"). Used for definitions and inventories.\n\nAt every level, MECE applies — children should not overlap and should cover the whole parent.',
    },
    {
      type: 'explain',
      title: 'How to build one',
      content:
        'Step 1. Frame the question precisely. "Why are sales down?" or "How do we cut costs?"\nStep 2. Pick a top-level cut. MECE, 3-5 children.\nStep 3. Recursively decompose each branch. Stop at 3-4 levels typically.\nStep 4. Validate: at every level, is it MECE? Same depth where it matters?\n\n■ Common mistakes\n· Mixed levels of abstraction at the same depth\n· Uneven depth (you can stop a branch early if it is unimportant)\n· Not MECE — children overlap or miss things\n\n■ Tips\n· Start with 2-3 chunks, then expand\n· If stuck, borrow a framework (3C, 4P)\n· Keep asking "So what?" at each branch to make sure it matters',
    },
    {
      type: 'explain',
      title: '[Case 1] Why is turnover so high? — Why tree',
      visual: 'LogicTreeCaseDiagram',
      content:
        '■ Setup\nA 300-person tech company has 25% annual turnover, vs an industry average of 12%. Leadership wants the root cause.\n\nWhy is turnover high?\n├─ [Compensation]\n│  ├─ Base salary below market\n│  │  ├─ Competing offers have risen\n│  │  └─ Internal pay bands have not been refreshed in 5 years\n│  ├─ Bonus / equity not competitive\n│  └─ Benefits feel weak (no remote option, etc.)\n├─ [Career growth]\n│  ├─ Career path unclear\n│  │  ├─ Promotion criteria are vague\n│  │  └─ No senior IC track, only management\n│  ├─ Few learning opportunities\n│  │  ├─ Training budget cut\n│  │  └─ Few projects on new tech\n│  └─ Performance reviews feel unfair\n│     ├─ Criteria are opaque\n│     └─ Strong performance does not translate to pay\n├─ [Work environment]\n│  ├─ Chronic overtime\n│  │  ├─ Persistent understaffing\n│  │  └─ Inefficient processes\n│  ├─ Manager / peer relationships\n│  │  ├─ Managers under-trained\n│  │  └─ Poor cross-team communication\n│  └─ Office and tooling friction\n└─ [External]\n   ├─ Hot job market for engineers\n   ├─ Many startup options\n   └─ Remote work removes geographic barriers\n\n■ How to use it\nAfter you build the tree, gather data — exit interviews, pulse surveys — and pin the largest factors. For this company the top two were unclear career path and below-market pay.',
    },
    {
      type: 'quiz',
      question: 'What is the most important rule when building a Why tree?',
      options: [
        { label: 'Generate as many causes as possible to widen the search', correct: false },
        { label: 'Keep every level MECE — no overlap, no gaps', correct: true },
        { label: 'Stay within 3 levels deep to keep the tree readable', correct: false },
        { label: 'Use only quantitative data to keep branches objective', correct: false },
      ],
      explanation:
        'A logic tree lives or dies on MECE at every level — overlap inflates causes and gaps hide them. Volume of causes is a vanity metric, depth limits are guidelines not rules, and qualitative data is essential when quantitative data is missing. Confusing "more branches" with "better tree" is the most common mistake.',
    },

    {
      type: 'explain',
      title: '[Case 2] How do we cut costs by 15%? — How tree',
      content:
        '■ Setup\nA mid-sized manufacturer is at 2% operating margin (industry: 5%). Goal: cut total cost by 15%.\n\nHow do we cut total cost by 15%?\n├─ [Manufacturing cost] (60% of total)\n│  ├─ Materials\n│  │  ├─ Renegotiate with suppliers\n│  │  ├─ Substitute materials\n│  │  ├─ Volume discounts via consolidation\n│  │  └─ Improve yield / reduce defects\n│  ├─ Labor\n│  │  ├─ Production-line automation\n│  │  ├─ Multi-skilling for flexible staffing\n│  │  └─ Reduce overtime through better planning\n│  └─ Equipment & energy\n│     ├─ Switch to high-efficiency equipment\n│     ├─ Improve uptime (faster changeovers)\n│     └─ Preventive maintenance to reduce downtime\n├─ [Indirect cost] (25%)\n│  ├─ Office\n│  │  ├─ Floor reduction (remote work)\n│  │  ├─ Paperless processes\n│  │  └─ Renegotiate IT and telecom\n│  ├─ Admin functions\n│  │  ├─ RPA for repetitive work\n│  │  ├─ Outsourcing\n│  │  └─ Cut meeting hours\n│  └─ Outsourcing review\n│     ├─ Insource where it makes sense\n│     └─ Consolidate vendors\n└─ [Logistics & sales] (15%)\n   ├─ Logistics\n   │  ├─ Route optimization\n   │  ├─ Warehouse consolidation\n   │  └─ Use 3PL providers\n   └─ Sales & marketing\n      ├─ ROI-based marketing reallocation\n      ├─ Move sales online\n      └─ Exit unprofitable channels\n\n■ Lesson\nGo after the biggest cost pools first. Manufacturing (60% of cost) has the largest potential — even a 1% improvement is bigger than a 10% cut to a small bucket.',
    },
    {
      type: 'quiz',
      question: 'After listing all possible cost-cutting actions in a How tree, what should you do FIRST?',
      options: [
        { label: 'Execute every action simultaneously for maximum total effect', correct: false },
        { label: 'Start with the cheapest, easiest action to build momentum', correct: false },
        { label: 'Score each action by impact and feasibility, then sequence', correct: true },
        { label: 'Defer to your boss\'s preference to ensure buy-in', correct: false },
      ],
      explanation:
        'The right move is to score on impact (size of effect) AND feasibility (cost, time, difficulty), then attack high-impact + high-feasibility first. Doing everything overloads the org and obscures which lever actually worked. "Easiest first" feels productive but optimizes for momentum over results, and deferring to the boss skips the analysis entirely.',
    },

    {
      type: 'quiz',
      question: 'When is a Why tree the right tool, vs a How tree?',
      options: [
        { label: 'Why tree for quantitative analysis, How tree for qualitative ideation', correct: false },
        { label: 'Why tree for finding causes, How tree for designing solutions', correct: true },
        { label: 'Why tree for short-term incidents, How tree for long-term strategy', correct: false },
        { label: 'Why tree for individual coaching, How tree for team workshops', correct: false },
      ],
      explanation:
        'The split is by question type: Why ("what causes this?") vs How ("how do we fix it?"). The normal flow is Why first to understand cause, then How to design the response. The other distinctions confuse the tool\'s shape (cause vs solution) with surface attributes like data type, time horizon, or audience.',
    },
    {
      type: 'quiz',
      question: 'How many children per node is a good default for a logic tree?',
      options: [
        { label: 'Always 2 — binary cuts keep things simple', correct: false },
        { label: '3 to 5 — MECE-friendly and still readable', correct: true },
        { label: '7 or more — matches the Magical Number 7±2 limit', correct: false },
        { label: 'No fixed limit — let the topic dictate the count', correct: false },
      ],
      explanation:
        '3–5 children hits the sweet spot of being MECE while staying within modern working-memory limits (4±1). "7±2" is the outdated Miller figure that overestimates capacity in real conditions. Binary cuts under-segment most topics, and "no limit" abandons the discipline the tree exists to provide.',
    },
    {
      type: 'quiz',
      question: 'Mid-build, you notice two branches overlap. What is the correct fix?',
      options: [
        { label: 'Leave it — small overlaps rarely affect conclusions', correct: false },
        { label: 'Delete the smaller of the overlapping branches', correct: false },
        { label: 'Reconsider the parent cut so the overlap disappears at the source', correct: true },
        { label: 'Add a new branch labeled "shared" for the overlapping portion', correct: false },
      ],
      explanation:
        'Overlap is a signal that the parent cut itself is wrong. Fixing it at the source is the only durable solution. Deleting a branch loses information, leaving overlap quietly inflates causes during analysis, and a "shared" branch is the worst option because it institutionalizes the non-MECE structure.',
    },
  ],
}

const logicSoWhatEn: LessonData = {
  id: 22,
  title: 'So What / Why So — Validating Logic',
  category: 'Logical Thinking',
  steps: [
    {
      type: 'explain',
      title: 'Two questions that strengthen any argument',
      visual: 'SoWhatDiagram',
      content:
        '"So What?" and "Why So?" are the two questions that turn raw facts into solid logic.\n\n■ So What?\nForces you to extract meaning from facts. When you see data, ask "so what does this mean for our decision?" This is how you turn observations into recommendations.\n\nUse it when:\n· Turning data into insight in a report\n· Drafting the headline of a presentation\n· Writing the conclusion of an analysis\n\n■ Why So?\nForces you to verify the basis of a claim. When someone says X, ask "why is that true?" This catches logical leaps.\n\nUse it when:\n· Testing your own argument before presenting\n· Stress-testing a peer\'s claim\n· Pressure-testing an executive proposal\n\n■ The two are mirrors\nFact → (So What?) → Conclusion\nConclusion → (Why So?) → Fact\nGoing back and forth between these directions makes your reasoning solid.',
    },
    {
      type: 'explain',
      title: 'Two flavors of "So What?"',
      content:
        'There are two depths of So What.\n\n[1] Observational So What\n"Given these facts, what is happening?"\n\nExample:\nFact 1: Product A sales down 20% YoY\nFact 2: Product B sales up 30% YoY\nFact 3: Product C flat\n→ So What? Customer demand is shifting from A to B.\n\n[2] Action-oriented So What (insight)\n"Therefore what should we do?"\n\nContinuing the example:\n→ So What? Increase B production and marketing, sunset A on a phased timeline.\n\n■ Common failures\n· Stopping at facts (no So What at all)\n  "Sales fell 20%."  (period)\n  "Sales fell 20% → main cause is churn from existing customers → retention is the priority."\n\n· Jumping too fast (no Why So check)\n  "Sales fell → exit the business."\n  Analyze the cause first, weigh the responses, then decide.',
    },
    {
      type: 'explain',
      title: '[Case 1] Adding "So What?" to a sales report',
      content:
        '■ Setup\nYou lead an enterprise sales team. Your weekly report keeps getting "what is the point?" feedback from your VP.\n\n■ Before (no So What)\n"This week:\n· 32 visits\n· 8 new proposals\n· 2 closes\n· $35k closed\n· vs last week: +5 visits, -1 close"\n\n→ VP reaction: "OK… so?"\n\n■ After (3-layer So What)\n\n[Facts]\n· 32 visits this week (+5) but only 2 closes (-1)\n· Proposal-to-close conversion: 25%, down from 33% last week\n· Two large-deal losses (>$50k)\n\n[Observational So What]\n→ Activity is up but proposal quality is dropping. We are losing the larger-deal contests, suggesting competitors are out-positioning us on enterprise opportunities.\n\n[Action So What]\n→ This week we will:\n  ① Run a loss review on the two large deals (interview the buyer about the winning competitor)\n  ② Add a peer-review step for proposals over $50k\n  ③ Trade visit volume for visit quality on top accounts\n\n■ Lesson\nRaw numbers → Observation → Action. Each layer answers a "so what?" deeper than the last.',
    },
    {
      type: 'quiz',
      question: '"Our e-commerce revenue grew 120% YoY." Your VP asks "So what?" — pick the best response.',
      options: [
        { label: 'E-commerce revenue this year totaled $12M', correct: false },
        { label: 'Last year e-commerce stood at $10M for comparison', correct: false },
        { label: 'Digital is accelerating — grow the e-commerce team and rethink retail', correct: true },
        { label: 'Industry average e-commerce growth landed at 115% YoY', correct: false },
      ],
      explanation:
        'So What turns a fact into an action. Connecting growth to an organizational change and a strategic shift is the only option that answers "so what should we do?" The other three restate or contextualize the number without prescribing a move — a common pattern that feels like analysis but provides zero decision value.',
    },

    {
      type: 'explain',
      title: '[Case 2] Stress-testing strategy with "Why So?"',
      content:
        '■ Setup\nYou drafted a new 3-year plan for a food brand. Before the board, you stress-test it with Why So?.\n\n■ Claim\n"International revenue should grow from 10% to 30% in 3 years."\n\n■ Why So? checks\n\n[Reason 1] Domestic market is shrinking with population\n→ Why So?\n· Working-age population shrinks ~500k/year (govt data)\n· Category has shrunk 3% over 5 years (industry data)\n→ Backed by data\n\n[Reason 2] Asia has demand for our product\n→ Why So?\n· Test sales in Vietnam and Thailand hit 150% of target\n· Inbound inquiries from local buyers (10+/year)\n→ Real data, but only 2 countries — caution on generalizing\n\n[Reason 3] 30% in 3 years is achievable\n→ Why So?\n· Currently at 10%, requires +7%/year incremental\n· But our international team is 5 people\n· We lack logistics and regulatory know-how\n→ The feasibility argument is weak\n\n■ Verdict\nReasons 1 and 2 hold up; Reason 3 is unsupported. Either lower the target or add a concrete investment plan to back the 30% figure.\n\n■ Lesson\nWhy So? catches the most dangerous failure mode: claims that sound right but rest on wish-thinking.',
    },
    {
      type: 'quiz',
      question: '"Next year, our new business will reach $10M revenue." Apply Why So? — what is the most important thing to verify?',
      options: [
        { label: 'Whether the CEO has personally endorsed the number', correct: false },
        { label: 'A bottom-up build: market size × share × ASP × customer count', correct: true },
        { label: 'Whether peer companies have hit similar growth numbers', correct: false },
        { label: 'Whether the team is motivated enough to deliver the target', correct: false },
      ],
      explanation:
        'Why So? at its strongest demands a numerical chain that decomposes the headline into checkable parts. CEO endorsement is authority not evidence, peer analogies are pattern-matching without verification, and team motivation is execution risk not target validity. The classic trap is accepting a number because someone important said it.',
    },

    {
      type: 'explain',
      title: '[Case 3] Pulling insight from data — a 3-step So What',
      content:
        '■ Setup\nYou run analytics for a SaaS product. Data is in. You need to brief the executive team.\n\n■ Raw data\n① Monthly churn: 3.5% (industry: 2.0%)\n② Average tenure of churned customers: 4.2 months\n③ Churn for customers with CSM contact: 1.0%\n④ Churn for customers without CSM contact: 5.5%\n⑤ Onboarding completion rate: 45%\n⑥ Strong negative correlation between first-30-day logins and churn\n\n■ So What — three layers deep\n\n[Layer 1: per-data observations]\n· ①② → Customers churn before they see value (4 months is short)\n· ③④ → CSM contact is highly effective at preventing churn\n· ⑤ → Half of customers never finish onboarding\n· ⑥ → Early habit formation is the strongest churn predictor\n\n[Layer 2: integrated observation]\n→ The root cause of churn is insufficient onboarding. Customers leave before they experience the product\'s value, and CSM intervention is the only thing that prevents it.\n\n[Layer 3: action]\n→ Three proposed initiatives:\n  ① Onboarding redesign (target 80% completion)\n  ② Concentrated 30-day high-touch support program\n  ③ Grow CSM headcount from 3 to 8\n→ Expected impact: churn 3.5% → 2.0%, ~$2M annual ARR retained.\n\n■ Lesson\nReporting raw data is not analysis. Layered So What is what turns numbers into board-level recommendations.',
    },
    {
      type: 'quiz',
      question: 'How are So What and Why So related?',
      options: [
        { label: 'So What is induction; Why So is deduction in formal logic terms', correct: false },
        { label: 'So What runs facts → conclusion; Why So runs conclusion → evidence', correct: true },
        { label: 'So What is for managers and execs; Why So is for individual contributors', correct: false },
        { label: 'So What is for qualitative analysis; Why So is for quantitative analysis', correct: false },
      ],
      explanation:
        'The two are mirror operations on the same reasoning chain — one goes up (facts to claim), one goes down (claim to evidence). The induction/deduction framing borrows formal-logic terms incorrectly, and the role-based or data-type splits invent boundaries that do not exist in either method.',
    },
    {
      type: 'quiz',
      question: '"Sales fell 10% this quarter, so we need a major layoff." What is wrong with this argument?',
      options: [
        { label: 'It is missing a So What — the fact has no implication attached', correct: false },
        { label: 'A logical leap — Why So? for "therefore layoffs" is unsatisfied', correct: true },
        { label: 'The data is stale and the quarter is already over', correct: false },
        { label: 'The argument is not MECE across possible responses', correct: false },
      ],
      explanation:
        'The argument has a So What (the proposed action), but the Why So chain from "10% drop" to "major layoff specifically" is missing — no exploration of alternative responses, cost-structure analysis, or scenario testing. Data staleness and MECE are real concerns but address different failures and miss the central logical leap here.',
    },
    {
      type: 'quiz',
      question: 'What is the best way to use So What in a business report?',
      options: [
        { label: 'List every relevant fact as bullet points for the reader to interpret', correct: false },
        { label: 'State only the final conclusion to avoid overloading the reader', correct: false },
        { label: 'Layer it: facts → observational So What → action So What', correct: true },
        { label: 'Pick the conclusion first, then collect facts that support it', correct: false },
      ],
      explanation:
        'The 3-layer structure (data → observation → recommendation) lets the reader follow your reasoning explicitly. "Facts only" forces the reader to interpret without help; "conclusion only" hides the basis; "conclusion first then back-fill" is confirmation bias by design — selecting facts to fit an already-chosen answer.',
    },
    {
      type: 'quiz',
      question: 'Which of the following needs Why So? scrutiny the most?',
      options: [
        { label: '"This month\'s revenue was $1M" — a factual report', correct: false },
        { label: '"We should enter the AI market" — a strategic proposal', correct: true },
        { label: '"Here is the meeting room schedule" — an information share', correct: false },
        { label: '"Next week\'s team schedule is attached" — a calendar update', correct: false },
      ],
      explanation:
        'Strategy proposals demand rigorous Why So? — why this market, what evidence supports the bet, what alternatives exist, what could go wrong. Facts, schedules, and shared info do not assert a position that requires defending. Confusing "important-sounding statement" with "claim that needs evidence" is what lets shaky strategies sail through.',
    },
  ],
}

const logicPyramidEn: LessonData = {
  id: 23,
  title: 'Pyramid Principle — Communicating Clearly',
  category: 'Logical Thinking',
  steps: [
    {
      type: 'explain',
      title: 'What is the Pyramid Principle?',
      visual: 'PyramidDiagram',
      content:
        'The Pyramid Principle, by Barbara Minto, is a structuring method for clear, persuasive communication.\n\n■ Structure (see diagram)\nThe top of the pyramid is your main message. Below it sit 2-4 key supporting lines, each backed by specific evidence at the next level down. Most abstract at the top, most concrete at the bottom.\n\n■ Three rules\n① Lower elements summarize as higher elements (the parent is the synthesis of its children)\n② Elements at the same level are MECE\n③ Elements at the same level are the same kind of statement\n\n■ Why "conclusion first"?\n· Listeners want the bottom line first\n· With the bottom line in mind, supporting points are easier to follow\n· Respects busy decision-makers\' time\n· Logical flow is easier to track\n\nMost cultures default to "background → context → conclusion." Business communication inverts this: conclusion → reasons → details.',
    },
    {
      type: 'explain',
      title: 'PREP — the simplest application',
      visual: 'PrepDiagram',
      content:
        'PREP is the simplest framework that follows the Pyramid Principle.\n\nP — Point: state the conclusion first\nR — Reason: why is this true\nE — Example: concrete evidence backing the reason\nP — Point: restate the conclusion to anchor it\n\n■ Bad example\n"I tried this new project management tool, the task tracking is great, the team likes it, and it is cheaper than our current one. So I think we should switch."\n→ The conclusion comes last and the message is muddled.\n\n■ PREP version\nP: I propose switching our project management tool to X.\nR: Three concrete advantages over our current tool.\nE:\n  ① Better task visibility (built-in Gantt chart)\n  ② Higher team satisfaction (90% positive in trial)\n  ③ 30% lower cost (~$50k/year savings)\nP: For these reasons, I recommend migrating to X this quarter.\n\n■ Where to use PREP\n· Speaking up in meetings\n· Reporting via email\n· Updates to your manager\n· Each section of a presentation',
    },
    {
      type: 'explain',
      title: 'SCR — for problem → solution',
      content:
        'SCR (Situation - Complication - Resolution) is for framing problems and proposing fixes.\n\nS — Situation: shared context\nC — Complication: what is wrong\nR — Resolution: what to do about it\n\n■ Why it works\n· Aligns the audience on context first\n· Shared understanding of the problem makes the proposal easier to accept\n· Especially powerful for change announcements and bad-news reports\n\n■ PREP vs SCR\n· PREP: when stating your opinion or recommendation\n· SCR: when raising a problem and proposing how to solve it\n\n■ Bonus: SDS\nSummary → Detail → Summary. Use it for long-form content (training, white papers, full presentations).',
    },

    {
      type: 'explain',
      title: '[Case 1] New-business proposal in pyramid form',
      content:
        '■ Setup\nYou are at a large food company. You want to propose entering the pet food market. The board meeting is 15 minutes.\n\n■ Pyramid structure\n\n[Main message]\nWe should enter the pet food market. Initial investment $5M; year-3 target: $30M revenue at 10% operating margin.\n\n├─ [Key line 1: market is attractive]\n│  ├─ Domestic pet food market is $5B, growing 5% annually\n│  ├─ Premiumization driven by humanization of pets\n│  └─ One of the few food categories that grows even with population decline\n│\n├─ [Key line 2: our strengths transfer]\n│  ├─ Quality and safety processes apply directly\n│  ├─ Existing ingredient supply network gives cost advantage\n│  └─ "Made by a food company" credibility\n│\n└─ [Key line 3: risk is bounded]\n   ├─ $5M initial investment uses idle equipment\n   ├─ Distribution leverages existing retail (supermarkets, drugstores)\n   └─ Exit scenario: equipment can return to existing business\n\n■ Time allocation (15 min)\nConclusion (1m) → Market (4m) → Strengths (4m) → Risk (3m) → Plan & close (3m)\n\n■ Why it works\nThe three key lines are MECE (market / company / risk). Each has three concrete supporting points. The audience can verify each branch independently after hearing the conclusion.',
    },
    {
      type: 'quiz',
      question: 'Why does the Pyramid Principle put the conclusion first?',
      options: [
        { label: 'Otherwise the audience forgets the conclusion by the end', correct: false },
        { label: 'A known conclusion gives the audience a frame to interpret the reasons', correct: true },
        { label: 'Senior leaders culturally demand conclusion-first communication', correct: false },
        { label: 'It is a fallback in case the speaker runs out of time', correct: false },
      ],
      explanation:
        'The real reason is cognitive: with a conclusion in hand, the audience interprets each supporting reason in its context. Memory, cultural preference, and time-buffer are downstream effects, not the underlying principle. Confusing a side-benefit with the core mechanism is the typical misunderstanding.',
    },

    {
      type: 'explain',
      title: '[Case 2] Asking for budget with PREP',
      content:
        '■ Setup\nYou are a marketing manager. You want to grow next year\'s digital marketing budget from $300k to $500k. You have a 30-minute 1:1 with the CFO.\n\n■ PREP\n\n[Point]\nIncrease digital marketing to $500k next year. Expected return: $2M in incremental revenue. ROI: 4×.\n\n[Reason]\nThree reasons for the increase:\n\nReason ①: Current digital ROAS is exceptional\n· Digital ROAS this year: 5.2×\n· Print/traditional ROAS: 1.8×\n· Concentrating on digital lifts overall efficiency\n\nReason ②: Competitors are ramping digital\n· Competitor A: 200% YoY in digital ad spend\n· Competitor B: $1M into owned media\n· Holding flat = ceding share\n\nReason ③: Now is the strategic moment\n· New channel (TikTok ads) has launch bonuses\n· CPC is forecast to rise next year\n· Customers acquired this year recoup via LTV\n\n[Example]\nThis year we tested $20k on TikTok ads → 500 new customers (CPA $40). Same customers via Google Ads = $120 CPA. We need to scale this differential.\n\n[Point]\nFor those reasons, please approve $500k. Incremental $200k → $2M new revenue, payback under 6 months.\n\n■ Why it works\nFinance audiences need ROI math. Bracketing the conclusion with specific dollars at the start and end leaves the strongest impression.',
    },
    {
      type: 'quiz',
      question: 'What is the role of the "E" in PREP?',
      options: [
        { label: 'An attention-grabbing anecdote to warm up the audience', correct: false },
        { label: 'A concrete example or data point that backs the stated reason', correct: true },
        { label: 'A personal experience story to add credibility', correct: false },
        { label: 'A competitor case study to position your argument', correct: false },
      ],
      explanation:
        'Example exists to anchor the abstract Reason in something verifiable. Anecdotes, personal stories, and competitor cases can all serve as Examples but defining E by any one form is too narrow — the test is whether the content provides evidence, not whether it follows a particular style.',
    },

    {
      type: 'explain',
      title: '[Case 3] Reporting a delay with SCR',
      content:
        '■ Setup\nYou are PM on a $3M, 18-month system migration. You need to report a 3-month delay to the steering committee.\n\n■ SCR structure\n\n[Situation]\nThe migration is in Phase 3 (integration testing).\n· Planned progress: 65%\n· Actual progress: 50%\n· Budget consumed: 60% (on plan)\n· Team: 15 internal + 20 vendor\n\n[Complication]\nLaunch will slip 3 months. Three causes:\n\nCause ①: Scope creep during requirements\n· Business added 30 new requirements (15% scope expansion)\n· Design + build for these added 2 unplanned months\n\nCause ②: External API integration issues\n· 12 critical bugs found integrating with payment service\n· Payment vendor specification changes need 1 month to absorb\n\nCause ③: Key personnel attrition\n· Design lead and test lead resigned\n· Replacements ramping up\n\n[Resolution]\nWe will operate with a 3-month assumption and execute three offsets:\n\nOffset ①: Re-scope\n· Defer 10 lower-priority items to a Phase 2 release\n· Recovers ~1 month of slip\n\nOffset ②: Reinforce the team\n· Add 5 vendor engineers (+$150k)\n· Hire short-term API specialist\n\nOffset ③: Test efficiency\n· Introduce test automation tooling (50% reduction in regression effort)\n· Prioritize test scenarios ruthlessly\n\n→ Final estimate: slip from 3 months to 1.5 months, with $150k incremental cost (5% of original budget).\n\n■ Why it works\nDelay reports require Situation → Problem → Solution clarity. SCR matches that flow exactly. Even bad news, when structured this way, becomes constructive.',
    },
    {
      type: 'quiz',
      question: 'What does "C" (Complication) do in SCR?',
      options: [
        { label: 'Reports recent project progress against the original plan', correct: false },
        { label: 'Presents the proposed solution and asks for approval', correct: false },
        { label: 'Names the problem that disrupts the established context', correct: true },
        { label: 'Introduces team members and assigns ownership', correct: false },
      ],
      explanation:
        'After Situation sets shared context, Complication is the hinge that introduces what is wrong — without it the audience has no reason to engage with the Resolution. Progress reporting and team intros belong to status updates, and presenting the solution is Resolution\'s job. Skipping the C is what makes bad-news messages land badly.',
    },
    {
      type: 'quiz',
      question: 'A: speaking up in a team meeting. B: reporting a customer issue and proposed fix. Best framework combo?',
      options: [
        { label: 'A: SCR (problem framing) / B: PREP (opinion statement)', correct: false },
        { label: 'A: PREP (opinion statement) / B: SCR (problem + fix)', correct: true },
        { label: 'A: SDS (long-form structure) / B: PREP (opinion statement)', correct: false },
        { label: 'A: SCR (problem framing) / B: SDS (long-form structure)', correct: false },
      ],
      explanation:
        'Stating your opinion → PREP. Reporting a problem with proposed solution → SCR. SDS is for long-form content like training materials, not quick meeting input. The most common mix-up is reaching for SCR when you only need to state an opinion, which adds unnecessary scaffolding.',
    },
    {
      type: 'quiz',
      question: 'How many key lines (top-level supporting points) work best in a pyramid?',
      options: [
        { label: '1 — simplicity beats structure', correct: false },
        { label: '2–4 — balances coverage and cognitive load', correct: true },
        { label: '5–7 — comprehensive, matches the Magical Number 7±2', correct: false },
        { label: 'No fixed limit — let the topic dictate the count', correct: false },
      ],
      explanation:
        '2–4 hits the sweet spot, with 3 being the most memorable. "7±2" is the outdated figure that current working-memory research (4±1) has displaced — applying it here overstates real audience capacity. One point lacks support; "no limit" abandons the discipline that makes pyramids work.',
    },
    {
      type: 'quiz',
      question: 'Which presentation outline best follows the Pyramid Principle?',
      options: [
        { label: 'Background → analysis → discussion → conclusion (chronological)', correct: false },
        { label: 'Conclusion → reason A → reason B → reason C → wrap', correct: true },
        { label: 'Problem → cases → reflection → proposal (storytelling)', correct: false },
        { label: 'Self-intro → company history → product details → conclusion', correct: false },
      ],
      explanation:
        'Pyramid is conclusion-first then supporting reasons. Any outline that buries the conclusion at the end — chronological, storytelling, or context-heavy — is the opposite pattern. The storytelling option feels engaging but forces the audience to wait for the headline, which is exactly what Pyramid is designed to prevent.',
    },
  ],
}

const logicCaseStudiesEn: LessonData = {
  id: 24,
  title: 'Case Studies — Applied Practice',
  category: 'Logical Thinking',
  steps: [
    {
      type: 'explain',
      title: 'How to use this lesson',
      content:
        'In this lesson you will combine the frameworks (MECE, logic trees, So What / Why So, Pyramid Principle) on realistic business cases.\n\nFor each case:\n① Read the situation\n② Decide which frameworks fit\n③ Verify your understanding with the quiz\n\nIn real work, no single framework is enough. The skill is choosing and combining them.',
    },
    {
      type: 'explain',
      title: '[Case 1] Market entry — smartphone OEM into Southeast Asia',
      content:
        '■ Situation\nA #3 domestic smartphone OEM ($3B revenue) is considering entering Southeast Asia. Their home market is saturated and growth must come from abroad.\n\n■ Approach\n\n[Step 1] MECE the market\nBy country:\n· Indonesia (270M people, 68% smartphone penetration)\n· Vietnam (100M, 72%)\n· Thailand (70M, 80%)\n· Philippines (110M, 65%)\n· Malaysia (32M, 88%)\n· Others (Myanmar, Cambodia, etc.)\n\n[Step 2] Logic tree the entry mode (How tree)\nHow do we enter?\n├─ Direct entry under our brand\n│  ├─ Local subsidiary\n│  └─ Local distributor\n├─ Local partnership\n│  ├─ OEM supply\n│  └─ Joint venture\n└─ M&A (acquire a local brand)\n\n[Step 3] Use So What to extract direction\nFact: Indonesia has the largest population but lower penetration (room to grow); Chinese OEMs dominate on price.\n→ So What: We cannot win on price → focus on the mid- to high-end\n→ So What: Best first market is Thailand (higher incomes, mid-/high-end demand, brand-friendly)',
    },
    {
      type: 'quiz',
      question: 'In the entry case above, the team picked Thailand as the first market. Apply Why So? — what is the most important thing to verify?',
      options: [
        { label: 'Thailand\'s land area and population density for distribution coverage', correct: false },
        { label: 'Hard data on Thailand\'s mid-/high-end smartphone segment size and competitors', correct: true },
        { label: 'Number of inbound tourists from your home country (brand familiarity proxy)', correct: false },
        { label: 'Thailand\'s political stability and country-risk profile', correct: false },
      ],
      explanation:
        'The conclusion rests on "mid-/high-end strategy fits Thailand," so the load-bearing evidence is segment-level market data. Land area is barely relevant to smartphone go-to-market, tourist counts proxy brand familiarity but not segment fit, and political stability is a precondition rather than a decision driver. Why So? targets the assumption the conclusion most directly stands on.',
    },

    {
      type: 'explain',
      title: '[Case 2] Cost reduction — large retail chain',
      content:
        '■ Situation\n200-store retail chain ($2B revenue), operating margin 1%. Target: lift it to 3%. Sustainable efficiency, not slash-and-burn.\n\n■ MECE the cost structure\nTotal cost ($1.98B):\n├─ COGS ($1.3B = 65%)\n│  ├─ Merchandise cost\n│  └─ Logistics\n├─ Operating expense ($680M = 34%)\n│  ├─ Labor ($400M)\n│  ├─ Rent ($120M)\n│  ├─ Marketing ($60M)\n│  ├─ Utilities ($40M)\n│  ├─ HQ admin ($35M)\n│  └─ Other ($25M)\n└─ Operating profit ($20M = 1%)\n\nGoal: profit $20M → $60M (+$40M)\n\n■ Logic tree the savings (How tree)\nHow do we generate +$40M?\n├─ COGS improvement (target -$20M)\n│  ├─ Increase private-label share (lower input cost)\n│  ├─ Joint distribution with suppliers (lower logistics)\n│  └─ Reduce shrinkage with AI demand forecasting\n├─ Labor optimization (-$12M)\n│  ├─ Self-checkout (30% fewer cashiers)\n│  ├─ Auto-ordering systems\n│  └─ Smart shift scheduling\n└─ Other opex (-$8M)\n   ├─ LED + energy efficiency (20% utility cut)\n   ├─ Digital marketing shift (15% marketing savings)\n   └─ HQ DX (10% admin savings)\n\n■ So What\nThe biggest lever is COGS (65% of total). Private-label expansion and shrinkage reduction are the highest-leverage moves. Self-checkout and AI forecasting also create durable, not one-shot, savings.',
    },
    {
      type: 'quiz',
      question: 'What is the most logical approach to lifting margin from 1% to 3% in this case?',
      options: [
        { label: 'Cut every line item by 2% for organizational fairness', correct: false },
        { label: 'Prioritize the largest cost pools to maximize absolute impact', correct: true },
        { label: 'Start with the easiest cuts to build early wins and momentum', correct: false },
        { label: 'Concentrate on labor for the fastest visible reduction', correct: false },
      ],
      explanation:
        'A 1% cut on $1.3B COGS yields $13M; a 10% cut on $25M of other opex yields $2.5M. Same effort, very different impact — so prioritize by pool size. Uniform cuts trade impact for the appearance of fairness, "easy first" optimizes for momentum over results, and labor-only concentrates organizational risk in one place.',
    },

    {
      type: 'explain',
      title: '[Case 3] New product portfolio — beverage maker',
      content:
        '■ Situation\nA mid-sized beverage maker ($500M revenue) must pick one of three new product candidates for next year. Development budget cap: $1M.\n\nCandidate A: High-functional protein drink (health market)\nCandidate B: Craft cola (premium carbonated)\nCandidate C: Flavored water (low-calorie)\n\n■ Pyramid the recommendation\n\n[Conclusion] Develop Candidate A (protein drink).\n\n├─ Reason 1: Highest market growth\n│  ├─ Protein category growing 15% annually (others <5%)\n│  ├─ Corporate wellness drives B2B demand\n│  └─ Target buyer (men 30-50) is a customer base we underserve\n│\n├─ Reason 2: Easiest to differentiate\n│  ├─ We hold a patent on a unique ingredient that fits\n│  ├─ Major beverage majors have not entered the segment seriously\n│  └─ First-mover advantage on shelf placement\n│\n└─ Reason 3: Highest profitability\n   ├─ Estimated unit price $3 (B: $2.50, C: $1.50)\n   ├─ Cost ratio 35% (B: 40%, C: 45%)\n   └─ Year-1 revenue forecast $15M (B: $8M, C: $12M)\n\n■ Why it works\nThree MECE evaluation axes (market growth × competitive advantage × profitability) feed three branches. The audience can attack each independently.',
    },
    {
      type: 'quiz',
      question: 'You used "market growth × competitive advantage × profitability" to evaluate the three products. To strengthen the MECE-ness, which axis should you ADD?',
      options: [
        { label: 'CEO\'s personal preference among the three product candidates', correct: false },
        { label: 'Feasibility — development difficulty, schedule, required resources', correct: true },
        { label: 'How memorable or marketable the product name sounds', correct: false },
        { label: 'Number of similar overseas products already in market', correct: false },
      ],
      explanation:
        'The original three axes measure attractiveness and competitive positioning but skip execution. Feasibility closes the gap by asking "can we actually ship this?" Personal preference is not an evaluation axis, name appeal is a marketing tactic not a strategic filter, and overseas competitor count is one input to competitive advantage rather than a new dimension.',
    },

    {
      type: 'quiz',
      question: 'For "sales fell 30% suddenly — present root cause to the exec team," what framework sequence works best?',
      options: [
        { label: 'PREP first to frame the recommendation, then logic tree for analysis', correct: false },
        { label: 'Why tree for causes → So What for insight → SCR to report', correct: true },
        { label: 'MECE to classify the symptoms → PREP to deliver the report', correct: false },
        { label: 'Pyramid first to commit to the conclusion → then collect supporting data', correct: false },
      ],
      explanation:
        'The right flow is analyze → conclude → communicate. Why tree finds causes, So What converts them to actions, SCR delivers context-problem-solution. Starting with PREP or Pyramid commits to a conclusion before analysis (confirmation bias by structure), and MECE-only stops at categorization without producing an insight.',
    },
    {
      type: 'quiz',
      question: 'What is the most important mindset when applying these frameworks at work?',
      options: [
        { label: 'Pick one framework and apply it all the way through for consistency', correct: false },
        { label: 'Frameworks are tools — choose what fits, drop what does not', correct: true },
        { label: 'Master the official names and steps so you can reference them precisely', correct: false },
        { label: 'Combine every framework you know to make the analysis comprehensive', correct: false },
      ],
      explanation:
        'Frameworks are scaffolding for thought. Decision quality is the goal, framework purity is not. Sticking to one framework forces a square peg into a round hole, memorizing names confuses fluency with thinking, and combining everything produces unreadable analyses that obscure rather than clarify.',
    },
  ],
}

const logicDeductionEn: LessonData = {
  id: 25,
  title: 'Deduction — From the General to the Specific',
  category: 'Logical Thinking',
  steps: [
    {
      type: 'explain',
      title: 'What is deduction?',
      visual: 'DeductionDiagram',
      content:
        'Deduction is reasoning from general principles to specific conclusions.\n\nClassic example (the syllogism):\n① Major premise: All humans are mortal\n② Minor premise: Socrates is human\n③ Conclusion: Therefore Socrates is mortal\n\n■ Properties\n· If the premises are true, the conclusion MUST be true\n· No new information is created — you are extracting what is already in the premises\n· Top-down reasoning\n\n■ In business\nMajor premise: We exit any business with margin under 5% (company policy)\nMinor premise: Business A has 2% margin\nConclusion: Business A is exit-eligible\n\n■ Validity vs. Soundness — important!\nLogicians distinguish two concepts:\n\n· Validity: assuming the premises are true, does the conclusion necessarily follow? (Form correctness)\n· Soundness: valid AND the premises are actually true.\n\nExample:\nMajor: "Birds fly" / Minor: "Penguins are birds" / Conclusion: "Penguins fly"\n→ Form is valid (if all A are B, and X is A, then X is B), but the major premise is false. The argument is valid but unsound.\n\nWhen using deduction in business, always check the form AND the truth of the premises.',
    },
    {
      type: 'quiz',
      question: 'Which of the following syllogisms is BOTH valid in form AND has true premises (a "sound" argument)?',
      options: [
        { label: 'Major: Birds fly / Minor: Penguins are birds / Conclusion: Penguins fly', correct: false },
        { label: 'Major: All mammals breathe with lungs / Minor: Whales are mammals / Conclusion: Whales breathe with lungs', correct: true },
        { label: 'Major: Some fish live in fresh water / Minor: Tuna are fish / Conclusion: Tuna live in fresh water', correct: false },
        { label: 'Major: Company A is profitable / Minor: Company B is also a company / Conclusion: Company B is profitable', correct: false },
      ],
      explanation:
        'The whales argument is sound: the major premise is true and the form (Barbara: All A are B / X is A / X is B) is valid. The birds argument is valid in form but has a false major (penguins exist), so it is unsound. The tuna argument fails because "some" cannot be lifted to apply to a specific case. The last argument swaps the middle term — being "a company" does not put B inside the set "Company A," so the form itself breaks.',
    },
    {
      type: 'explain',
      title: 'Where deduction fails',
      content:
        'The form of deduction is foolproof. The premises are not. Most failed deductions fail at the premise.\n\n■ Common failures\n\n[1] Major premise is an assumption\nMajor: "Junior employees are unmotivated" (← assumption)\nMinor: "Tanaka is junior"\nConclusion: "Tanaka is unmotivated" ← unjustified\n\n[2] Major premise has unhandled exceptions\nMajor: "SaaS gross margin is over 70%"\nMinor: "We are SaaS"\nConclusion: "Our margin is over 70%" ← but exceptions exist\n\n[3] Term-swap (middle term shifts meaning)\nMajor: "Healthy people eat breakfast"\nMinor: "Tom eats breakfast"\nConclusion: "Tom is healthy" ← invalid (the converse is not necessarily true)\n\n■ The lesson\nBefore using deduction, check that each premise is fact, not assumption, not wish, not stereotype.',
    },
    {
      type: 'quiz',
      question: 'What is the biggest single source of wrong conclusions in deductive reasoning?',
      options: [
        { label: 'Combining multiple minor premises that complicate the chain', correct: false },
        { label: 'A premise that is false or has unhandled exceptions', correct: true },
        { label: 'Middle terms not matching their Latin formal-logic names', correct: false },
        { label: 'Expressing the argument in words instead of numbers', correct: false },
      ],
      explanation:
        'Deduction guarantees a true conclusion IF the premises are true — so almost every wrong deduction traces back to a bad premise or a missed exception. Premise complexity, terminology, and verbal vs numeric expression are surface attributes that have nothing to do with whether the argument holds, but they look plausible because formal logic feels intimidating.',
    },
    {
      type: 'quiz',
      question: 'What is the biggest practical advantage of deduction in business?',
      options: [
        { label: 'It surfaces new patterns and hypotheses from raw data', correct: false },
        { label: 'It applies policies and rules to specific cases at speed', correct: true },
        { label: 'It guarantees agreement and removes the need for debate', correct: false },
        { label: 'It produces reliable generalizations from very little data', correct: false },
      ],
      explanation:
        'Deduction shines when the rule is set and you need to classify cases fast. Generating new patterns and generalizing from few data points are both jobs of induction — confusing the two reasoning directions is the most common mistake. "Ends debate" is the opposite of true: rigorous deduction sparks debate about whether the premises hold.',
    },
  ],
}

const logicInductionEn: LessonData = {
  id: 26,
  title: 'Induction — From Cases to Patterns',
  category: 'Logical Thinking',
  steps: [
    {
      type: 'explain',
      title: 'What is induction?',
      visual: 'InductionDiagram',
      content:
        'Induction is reasoning from specific observations to general patterns.\n\nExample:\nObservation 1: Company A\'s cheap product breaks often\nObservation 2: Company B\'s cheap product breaks often\nObservation 3: Company C\'s cheap product breaks often\n→ Generalization: "Cheap products tend to break often"\n\n■ Properties\n· Creates new knowledge / hypotheses\n· The conclusion is "probable," not certain\n· Bottom-up reasoning\n\n■ Deduction vs. Induction\n[Direction] Deduction: rule → case / Induction: case → rule\n[Strength] Deduction: certain / Induction: probable\n[New insight] Deduction: none / Induction: yes\n[Risk] Deduction: depends on premise / Induction: always present\n[Use] Deduction: applying rules / Induction: hypotheses, market analysis\n\nNearly all hypothesis generation, market research, and trend reading in business is inductive.',
    },
    {
      type: 'quiz',
      question: 'Which of the following is induction?',
      options: [
        { label: '"All employees must take vacation. Tanaka is an employee, so Tanaka must take vacation."', correct: false },
        { label: '"December has been peak for 5 straight years — December will likely peak again."', correct: true },
        { label: '"Anyone who violates work rules is disciplined. Sato violated rules, so Sato is disciplined."', correct: false },
        { label: '"Over-budget projects get cancelled. This one is over budget, so it will be cancelled."', correct: false },
      ],
      explanation:
        'The December example moves from multiple specific years up to a general pattern — that is induction. The others all start from a stated rule and apply it down to a specific case — that is deduction. The direction of travel (case → rule vs rule → case) is the only reliable test.',
    },
    {
      type: 'explain',
      title: 'Where induction fails',
      content:
        'Induction is useful but never certain. Knowing the failure modes is essential.\n\n[1] Insufficient sample\nAsking 3 people and concluding "Japanese consumers all want X" is fragile. Sample size and diversity matter.\n\n[2] Sample bias\nSurveying your 10 best customers and calling it "market needs" — selection bias.\n\n[3] Ignored counter-examples\nFocusing on 9 successes and ignoring the 1 failure — confirmation bias.\n\n[4] Confusing correlation with causation\n"Ice cream sales rise as drowning rises" — neither causes the other (summer is the common cause).\n\n■ The Black Swan\nFor centuries Europeans inductively believed "all swans are white." When black swans were discovered in Australia, the entire belief flipped overnight. Induction is always vulnerable to a single counter-example.',
    },
    {
      type: 'quiz',
      question: 'A marketer surveyed 5 women in their 20s, found they all liked Brand X, and concluded "Women in their 20s love Brand X." What is the biggest problem?',
      options: [
        { label: 'Sample size is far too small to represent the target population', correct: true },
        { label: 'Missing comparison data from men in their 20s for gender split', correct: false },
        { label: 'Should have used a quantitative survey instead of qualitative interviews', correct: false },
        { label: 'The definition of "liking" Brand X has not been precisely measured', correct: false },
      ],
      explanation:
        'Inductive reliability comes from sample size and representativeness — 5 people cannot absorb variance or selection bias. Gender comparison is a different question and not the central issue. Method choice (interview vs survey) is secondary to sample size, and the definition concern is moot when all 5 unanimously said they liked it.',
    },
    {
      type: 'quiz',
      question: 'When using induction, what mindset matters most?',
      options: [
        { label: 'Commit to a conclusion fast, then look for counter-evidence to test it', correct: false },
        { label: 'Treat the conclusion as a hypothesis open to revision by counter-evidence', correct: true },
        { label: 'Adding more supporting cases eventually makes the conclusion certain', correct: false },
        { label: 'Trust pattern-recognition intuition and assert the generalization directly', correct: false },
      ],
      explanation:
        'Inductive conclusions are "likely so far" — a single counter-example can overturn them (the Black Swan problem). "More cases = certainty" confuses induction with formal proof. "Commit fast then test" looks rigorous but front-loads confirmation bias. Intuition without verification is the exact failure mode induction is meant to discipline.',
    },
  ],
}

const logicFormalEn: LessonData = {
  id: 27,
  title: 'Formal Logic — The World of "A Implies B"',
  category: 'Logical Thinking',
  steps: [
    {
      type: 'explain',
      title: 'The basics of "A implies B"',
      content:
        'The most fundamental construct in formal logic is the conditional "A implies B" (A → B).\n\nExample: "If it rains, the ground gets wet"\nA = it rains\nB = the ground is wet\n\n■ When is A → B "true"?\n· A true, B true \n· A false, B true \n· A false, B false \n· A true, B false (the only false case)\n\nThe conditional A → B is false ONLY when A happens but B does not. Anything else makes it true.\n\n■ Critical caveat\n"A → B" is NOT the same as "B → A".\n"If it rains the ground gets wet" can be true while "if the ground is wet then it rained" is false (sprinklers exist).\nThis is "the converse is not necessarily true."',
    },
    {
      type: 'quiz',
      question: '"If you take this medicine, your fever will drop (A → B)" is true. What can you conclude with certainty?',
      options: [
        { label: 'If your fever dropped, you took the medicine (converse: B → A)', correct: false },
        { label: 'If you took the medicine and fever did NOT drop, the claim is false', correct: true },
        { label: 'If you did not take the medicine, your fever will not drop (inverse: ¬A → ¬B)', correct: false },
        { label: 'Your fever did not drop because you did not take the medicine', correct: false },
      ],
      explanation:
        'A → B is false only in the single case where A is true and B is false — observing "took medicine but fever stayed up" disproves it. The other three are the classic confusions: converse, inverse, and post-hoc causal narration. Only the contrapositive (¬B → ¬A) is logically equivalent to the original.',
    },
    {
      type: 'explain',
      title: 'Converse, inverse, contrapositive',
      visual: 'ContrapositiveDiagram',
      content:
        'Given a statement "A → B," there are three derived statements.\n\n[Original]   A → B  (if A then B)\nExample: If it rains, the ground gets wet.\n\n[Converse]   B → A  (if B then A)\nExample: If the ground is wet, it rained.\n→ Even if the original is true, the converse is not necessarily true.\n\n[Inverse]    ¬A → ¬B  (if not A then not B)\nExample: If it does not rain, the ground does not get wet.\n→ Even if the original is true, the inverse is not necessarily true.\n\n[Contrapositive]  ¬B → ¬A  (if not B then not A)\nExample: If the ground is not wet, it did not rain.\n→ If the original is true, the contrapositive is ALSO necessarily true (logically equivalent).\n\n■ Key rule\nThe contrapositive is logically equivalent to the original. This is a powerful proof tool: when proving the original directly is hard, prove the contrapositive instead.',
    },
    {
      type: 'quiz',
      question: 'What is the contrapositive of "Excellent salespeople are strong with numbers"?',
      options: [
        { label: 'People strong with numbers are excellent salespeople (converse: B → A)', correct: false },
        { label: 'Salespeople who are not excellent are not strong with numbers (inverse: ¬A → ¬B)', correct: false },
        { label: 'People who are not strong with numbers are not excellent salespeople (contrapositive: ¬B → ¬A)', correct: true },
        { label: 'If you are not an excellent salesperson, you are not strong with numbers', correct: false },
      ],
      explanation:
        'Only the contrapositive ¬B → ¬A is logically equivalent to the original. The converse and inverse share words but have different truth values. The last option is the inverse stated in different phrasing — a tempting trap when the contrapositive and inverse swap subject and object without the negation discipline.',
    },
    {
      type: 'explain',
      title: 'Modus ponens and modus tollens',
      content:
        'Two foundational inference rules. Both guarantee a true conclusion if the premises are true.\n\n■ Modus ponens (affirming the antecedent)\nPremise 1: A → B\nPremise 2: A\nConclusion: B\n\nExample:\n· If margin falls below 5%, we exit (A → B)\n· Business A\'s margin is below 5% (A)\n· Therefore Business A is exited (B)\n\n■ Modus tollens (denying the consequent)\nPremise 1: A → B\nPremise 2: ¬B\nConclusion: ¬A\n\nExample:\n· If the burglar was indoors, no footprints would be left (A → B)\n· Footprints were left (¬B)\n· Therefore the burglar was NOT indoors (¬A)\n\n■ Common error: affirming the consequent\nPremise 1: A → B\nPremise 2: B\nConclusion: A ← INVALID\n\nExample:\n· If it rains, the ground gets wet (A → B)\n· The ground is wet (B)\n· Therefore it rained ← unjustified (sprinkler!)',
    },
    {
      type: 'quiz',
      question: 'Which of the following is a logically valid inference?',
      options: [
        { label: '"If she passes, we throw a party. We threw a party. Therefore she passed."', correct: false },
        { label: '"Excellent people leave work early. He left early. Therefore he is excellent."', correct: false },
        { label: '"If the server goes down, the alert fires. The alert is not firing. Therefore the server is not down."', correct: true },
        { label: '"If it rains, umbrella use rises. It is not raining. Therefore no one is using umbrellas."', correct: false },
      ],
      explanation:
        'The server inference is modus tollens (A → B, ¬B, therefore ¬A) — valid. The first two affirm the consequent: B being true does not prove A. The umbrella inference treats the inverse as if it were the original, ignoring all the other reasons people carry umbrellas. The combination of contrapositive + modus tollens is one of the sharpest tools for ruling out causes in technical and business investigations.',
    },
    {
      type: 'quiz',
      question: 'What is the practical benefit of using the contrapositive?',
      options: [
        { label: 'You can flip the conclusion to win an argument by surprise', correct: false },
        { label: 'When the original is hard to prove, prove its equivalent contrapositive instead', correct: true },
        { label: 'You discover new facts without needing any new premises', correct: false },
        { label: 'You silence opponents who cannot follow the formal manipulation', correct: false },
      ],
      explanation:
        'The contrapositive is logically equivalent to the original, so proving either proves both — a routine move in math (proof by contradiction) and in root-cause investigation. Rhetorical wins or silencing opponents are misuses, and no new facts emerge because deduction extracts only what the premises already contain.',
    },
  ],
}

const logicConcreteAbstractEn: LessonData = {
  id: 68,
  title: 'Concrete & Abstract — Moving Between Levels of Thinking',
  category: 'Logical Thinking',
  steps: [
    {
      type: 'explain',
      title: 'What Are Concrete and Abstract?',
      visual: 'AbstractionLadderDiagram',
      content:
        'Moving between the concrete and the abstract is one of the most important skills in logical thinking.\n\n● Concrete: specific facts, data, individual examples\n● Abstract: patterns, rules, concepts drawn from those specifics\n\nExample:\nConcrete: "A forgot the handout at yesterday\'s meeting"\nAbstract: "Our information-sharing system has a problem"\n\nConcrete alone ends with "so what?" Abstract alone feels vague. When you can move between both, your persuasiveness multiplies.',
      outro:
        'The abstract conveys "the big picture and the meaning"; the concrete conveys "the action and the felt reality." Either one alone makes your point thin, so just being conscious of moving both up and down the ladder sharply raises the resolution of your explanation.',
    },

    {
      type: 'quiz',
      question: '"Our team has bad communication" — is this concrete or abstract?',
      options: [
        { label: 'Concrete — naming a specific team makes it a concrete observation', correct: false },
        { label: 'Abstract — a judgment label without observable evidence', correct: true },
        { label: 'Neither — it is a personal complaint, not a thinking statement', correct: false },
        { label: 'Both — it mixes team identity with a broader principle', correct: false },
      ],
      explanation:
        '"Bad communication" is an abstract evaluation label. The "specific team" framing tempts the mistake that a proper noun automatically makes something concrete. Concrete requires observable detail like "weekly reports cause misunderstandings" or "chat replies take 24+ hours." Naming a team is not enough.',
    },
    {
      type: 'explain',
      title: '3 Steps to Abstract',
      content:
        'Going from concrete to abstract:\n\nStep 1: Line up the facts\n"Sales dropped" "Web ad CTR declined" "New inquiries fell"\n\nStep 2: Find the common thread\n→ They all relate to "customer acquisition"\n\nStep 3: Summarize in one statement\n→ "Our acquisition channels are losing efficiency"\n\nThis is abstraction. You lift individual facts up with "So What?" to find the bigger picture.',
    },
    {
      type: 'quiz',
      question: 'Given these 3 facts, what is the best abstraction?\n• New product awareness is 15%\n• Shelf placement rate is 30%\n• Promotions are at an all-time low',
      options: [
        { label: 'Product quality is below market expectations', correct: false },
        { label: 'Market launch (exposure, distribution, promotion) is insufficient', correct: true },
        { label: 'Competition has intensified and is taking share', correct: false },
        { label: 'Pricing has exceeded customer willingness-to-pay', correct: false },
      ],
      explanation:
        'Awareness, shelf placement, and promotions all measure "go-to-market execution," so their common abstraction is launch insufficiency. Quality, competition, and pricing would each require different evidence (trial rates, share movement, demand curves) that the given facts do not provide. Jumping to a familiar narrative beyond the data is the typical abstraction error.',
    },
    {
      type: 'explain',
      title: '3 Steps to Concrete',
      content:
        'Going from abstract to concrete:\n\nStep 1: Identify the abstract claim\n"We should improve customer experience"\n\nStep 2: Break it down with "For example?"\n→ In what situations? For whom? What specifically?\n\nStep 3: Land on concrete actions\n→ "Send follow-up emails within the same day after inquiries"\n→ "Reduce average checkout wait time by 30 seconds"\n\n"Improve customer experience" alone doesn\'t move anything. Concrete actions make things happen.',
    },
    {
      type: 'quiz',
      question: 'Which is the best concrete version of "improve productivity"?',
      options: [
        { label: 'Have everyone work more efficiently across all tasks', correct: false },
        { label: 'Build a productivity-first mindset across the whole team', correct: false },
        { label: 'Cut weekly meetings from 45 to 25 minutes and auto-generate the notes', correct: true },
        { label: 'Pursue digital transformation across all business processes', correct: false },
      ],
      explanation:
        'The correct option specifies both a number and an actionable change. The other three are longer and sound substantive but lack any measurable variable or named action — they are abstract dressed in business language. Sentence length is not the test of concreteness; the test is whether numbers, subjects, and verbs are all pinned down.',
    },
    {
      type: 'explain',
      title: 'The Abstraction Ladder',
      content:
        'Concrete and abstract aren\'t binary — they exist on a gradient.\n\nThe Abstraction Ladder:\n\n[Abstract] "Grow revenue"\n    ↓\n[Mid-level] "Lower new customer acquisition cost"\n    ↓\n[Concrete] "Reduce Instagram ad CPA from $30 to $20"\n\nFor executives, speak at higher abstraction. For team members, go concrete.\nProfessionals adjust the ladder height based on audience and context.\n\nKey takeaways:\n• Abstract up: Ask "So What?"\n• Concrete down: Ask "For example?"\n• Adjust the level to fit your audience',
    },
    {
      type: 'quiz',
      question: 'For reporting to the CEO vs. giving instructions to your team, which is correct?',
      options: [
        { label: 'Be concrete with both — detail builds trust across all audiences', correct: false },
        { label: 'Be abstract with both — high-level framing scales to any audience', correct: false },
        { label: 'Higher abstraction for the CEO, more concrete for the team', correct: true },
        { label: 'It depends on context, so no general rule can be stated', correct: false },
      ],
      explanation:
        'The CEO needs direction and trade-offs (abstract), the team needs tomorrow\'s actions (concrete). "It depends" feels safe but abdicates the principle that the ladder position should match the audience\'s decision-making scope. Uniform abstraction either drowns execs in detail or leaves the team without instructions.',
    },
    {
      type: 'quiz',
      question: 'Which demonstrates concrete → abstract → concrete thinking?',
      options: [
        { label: '"Store A sales dropped, so let\'s fix Store A" (concrete only)', correct: false },
        { label: '"Productivity is low, so let\'s pursue DX" (abstract only)', correct: false },
        { label: '"Stores A and B both show falling tickets → upselling is weak → introduce a checkout suggestion script"', correct: true },
        { label: '"Competition is tough, so let\'s differentiate" (abstract only)', correct: false },
      ],
      explanation:
        'The correct answer moves through three levels: concrete (multi-store ticket data) → abstract (upselling weakness) → concrete (checkout script). The other options stay flat at one ladder rung — diagnosing without lifting up to the pattern, or asserting a pattern without grounding it back down.',
    },
  ],
}

export const logicLessonMapEn: Record<number, LessonData> = {
  20: logicMeceEn,
  21: logicTreeEn,
  22: logicSoWhatEn,
  23: logicPyramidEn,
  24: logicCaseStudiesEn,
  25: logicDeductionEn,
  26: logicInductionEn,
  27: logicFormalEn,
  68: logicConcreteAbstractEn,
}
