import type { LessonData } from './lessonData'

// English versions of the 8 logical-thinking lessons.
// Cases adapted for an international business audience (no Japan-specific
// cultural references). Same lesson IDs as the Japanese versions so the
// rest of the app (placement test recommendations, completion tracking,
// continue-from card) keeps working.

export const logicMeceEn: LessonData = {
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
        { label: 'Everything is covered with no gaps', correct: false },
        { label: 'Categories do not overlap', correct: true },
        { label: 'The structure is hierarchical', correct: false },
        { label: 'Items are sorted in time order', correct: false },
      ],
      explanation:
        '"Mutually Exclusive" means categories do not overlap — the same item never lives in two buckets. The "everything is covered" part is "Collectively Exhaustive," the other half of MECE.',
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
        { label: 'Customer', correct: false },
        { label: 'Competitor', correct: true },
        { label: 'Company', correct: false },
        { label: 'All three at once', correct: false },
      ],
      explanation:
        'Classify by the root cause, not the visible effect. The trigger here is the competitor\'s pricing move, so it goes in Competitor. Putting it in all three buckets violates the "Mutually Exclusive" rule.',
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
        { label: 'Established framework → Component breakdown', correct: false },
        { label: 'Time sequence → Established framework', correct: false },
      ],
      explanation:
        'Both Online/Offline and Inbound/Outbound are binary, opposing-concept cuts. Component breakdown would be more like Revenue = Price × Quantity.',
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
        { label: 'Time sequence', correct: false },
        { label: 'Opposing concepts', correct: false },
        { label: 'Component breakdown', correct: true },
        { label: 'Established framework', correct: false },
      ],
      explanation:
        'Splitting a whole into mathematical components like A × B or A + B is component breakdown.',
    },
    {
      type: 'quiz',
      question: 'Which of the following is NOT MECE?',
      options: [
        { label: 'Gender: male / female / other', correct: false },
        { label: 'Age: 10s / 20s / 30s / 40s / 50+', correct: false },
        { label: 'Region: North / South / East / urban / rural', correct: true },
        { label: 'Purchase frequency: first-time / 2nd / 3+', correct: false },
      ],
      explanation:
        'The region answer mixes two different cuts: geographic (North/South/East) and population density (urban/rural). North can be either urban or rural, so the categories overlap.',
    },
    {
      type: 'quiz',
      question: 'A company classifies employees as "Full-time / Contract / Part-time." Temporary and freelance workers are missing. What MECE problem is this?',
      options: [
        { label: 'Overlapping categories', correct: false },
        { label: 'Missing categories', correct: true },
        { label: 'Both overlap and gaps', correct: false },
        { label: 'No problem', correct: false },
      ],
      explanation:
        'There is a gap: temps and freelancers are not included. The taxonomy fails the "Collectively Exhaustive" half of MECE.',
    },
    {
      type: 'quiz',
      question: 'What is the most effective approach to producing a MECE breakdown?',
      options: [
        { label: 'List items as they come to mind', correct: false },
        { label: 'Pick a top-level cut first, then progressively subdivide', correct: true },
        { label: 'Copy a competitor\'s analysis', correct: false },
        { label: 'Maximize the number of items listed', correct: false },
      ],
      explanation:
        'MECE works top-down: choose the high-level cut first, then subdivide. This makes both gaps and overlaps easy to spot.',
    },
  ],
}

export const logicTreeEn: LessonData = {
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
        { label: 'Generate as many causes as possible', correct: false },
        { label: 'Keep every level MECE', correct: true },
        { label: 'Stay within 3 levels deep', correct: false },
        { label: 'Use only quantitative data', correct: false },
      ],
      explanation:
        'Logic trees succeed or fail at every level on MECE. Exhaustiveness without overlap matters more than count.',
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
        { label: 'Execute every action simultaneously', correct: false },
        { label: 'Start with the cheapest action', correct: false },
        { label: 'Prioritize by impact and feasibility', correct: true },
        { label: 'Pick whichever your boss prefers', correct: false },
      ],
      explanation:
        'Always score actions on impact (size of effect) AND feasibility (cost, time, difficulty). Then attack high-impact, high-feasibility first.',
    },

    {
      type: 'quiz',
      question: 'When is a Why tree the right tool, vs a How tree?',
      options: [
        { label: 'Why tree for quantitative work, How tree for qualitative', correct: false },
        { label: 'Why tree for finding causes, How tree for designing solutions', correct: true },
        { label: 'Why tree for short-term issues, How tree for long-term', correct: false },
        { label: 'Why tree for individuals, How tree for teams', correct: false },
      ],
      explanation:
        'Why tree = "why is this happening?" (root causes). How tree = "how can we fix it?" (solutions). The normal flow is Why tree first → understand the cause → How tree to design the response.',
    },
    {
      type: 'quiz',
      question: 'How many children per node is a good default for a logic tree?',
      options: [
        { label: 'Always 2', correct: false },
        { label: '3 to 5', correct: true },
        { label: '7 or more', correct: false },
        { label: 'No limit', correct: false },
      ],
      explanation:
        'Two is usually too coarse, seven is too noisy. 3-5 children per node hits the sweet spot of being MECE while staying readable.',
    },
    {
      type: 'quiz',
      question: 'Mid-build, you notice two branches overlap. What is the correct fix?',
      options: [
        { label: 'Leave it; small overlaps are fine', correct: false },
        { label: 'Delete one of the overlapping branches', correct: false },
        { label: 'Reconsider the cut so the overlap disappears', correct: true },
        { label: 'Create a new branch for the overlap', correct: false },
      ],
      explanation:
        'Overlap is a signal that the cut itself is wrong. Don\'t paper over it — pick a new cut.',
    },
  ],
}

export const logicSoWhatEn: LessonData = {
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
        'There are two depths of So What.\n\n[1] Observational So What\n"Given these facts, what is happening?"\n\nExample:\nFact 1: Product A sales down 20% YoY\nFact 2: Product B sales up 30% YoY\nFact 3: Product C flat\n→ So What? Customer demand is shifting from A to B.\n\n[2] Action-oriented So What (insight)\n"Therefore what should we do?"\n\nContinuing the example:\n→ So What? Increase B production and marketing, sunset A on a phased timeline.\n\n■ Common failures\n· Stopping at facts (no So What at all)\n  ✘ "Sales fell 20%."  (period)\n  ✓ "Sales fell 20% → main cause is churn from existing customers → retention is the priority."\n\n· Jumping too fast (no Why So check)\n  ✘ "Sales fell → exit the business."\n  ✓ Analyze the cause first, weigh the responses, then decide.',
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
        { label: 'E-commerce revenue is now $12M', correct: false },
        { label: 'Last year it was $10M', correct: false },
        { label: 'Digital is accelerating; we should grow the e-commerce team and rethink our retail strategy', correct: true },
        { label: 'Industry average growth is 115%', correct: false },
      ],
      explanation:
        'So What turns facts into recommendations. Connecting the e-commerce growth to a concrete organizational and strategic implication is the strongest answer.',
    },

    {
      type: 'explain',
      title: '[Case 2] Stress-testing strategy with "Why So?"',
      content:
        '■ Setup\nYou drafted a new 3-year plan for a food brand. Before the board, you stress-test it with Why So?.\n\n■ Claim\n"International revenue should grow from 10% to 30% in 3 years."\n\n■ Why So? checks\n\n[Reason 1] Domestic market is shrinking with population\n→ Why So?\n· Working-age population shrinks ~500k/year (govt data)\n· Category has shrunk 3% over 5 years (industry data)\n→ ✓ Backed by data\n\n[Reason 2] Asia has demand for our product\n→ Why So?\n· Test sales in Vietnam and Thailand hit 150% of target\n· Inbound inquiries from local buyers (10+/year)\n→ ✓ Real data, but only 2 countries — caution on generalizing\n\n[Reason 3] 30% in 3 years is achievable\n→ Why So?\n· Currently at 10%, requires +7%/year incremental\n· But our international team is 5 people\n· We lack logistics and regulatory know-how\n→ ✗ The feasibility argument is weak\n\n■ Verdict\nReasons 1 and 2 hold up; Reason 3 is unsupported. Either lower the target or add a concrete investment plan to back the 30% figure.\n\n■ Lesson\nWhy So? catches the most dangerous failure mode: claims that sound right but rest on wish-thinking.',
    },
    {
      type: 'quiz',
      question: '"Next year, our new business will reach $10M revenue." Apply Why So? — what is the most important thing to verify?',
      options: [
        { label: 'Whether the CEO believes it', correct: false },
        { label: 'A bottom-up build of market size, share, ASP, and customer count', correct: true },
        { label: 'Whether peers have hit similar numbers', correct: false },
        { label: 'Internal motivation', correct: false },
      ],
      explanation:
        'Why So? at its strongest demands a numerical chain: market size → captured share → customer count → average price. Authority and analogies do not substitute for that build.',
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
        { label: 'So What is induction, Why So is deduction', correct: false },
        { label: 'So What goes from facts to conclusions; Why So goes from conclusions back to evidence', correct: true },
        { label: 'So What is for managers, Why So is for ICs', correct: false },
        { label: 'So What is for qualitative work, Why So for quantitative', correct: false },
      ],
      explanation:
        'So What is bottom-up (facts → conclusion). Why So is top-down (claim → evidence). The two together form a feedback loop that strengthens reasoning.',
    },
    {
      type: 'quiz',
      question: '"Sales fell 10% this quarter, so we need a major layoff." What is wrong with this argument?',
      options: [
        { label: 'Missing a So What', correct: false },
        { label: 'A logical leap — Why So? is not satisfied', correct: true },
        { label: 'The data is stale', correct: false },
        { label: 'It is not MECE', correct: false },
      ],
      explanation:
        'Why So? exposes the leap. Why does a 10% drop necessitate layoffs specifically? What other responses were considered? Has the cost structure even been analyzed? The chain is missing.',
    },
    {
      type: 'quiz',
      question: 'What is the best way to use So What in a business report?',
      options: [
        { label: 'List every fact in bullets', correct: false },
        { label: 'State only the conclusion', correct: false },
        { label: 'Structure as facts → observational So What → action So What', correct: true },
        { label: 'Pick the conclusion first, then back into facts', correct: false },
      ],
      explanation:
        'The 3-layer structure (data → observation → action) lets the reader follow your reasoning without effort.',
    },
    {
      type: 'quiz',
      question: 'Which of the following needs Why So? scrutiny the most?',
      options: [
        { label: '"This month\'s revenue was $1M" (fact report)', correct: false },
        { label: '"We should enter the AI market" (strategy proposal)', correct: true },
        { label: '"Here is the meeting room schedule" (info share)', correct: false },
        { label: '"Next week\'s schedule" (calendar)', correct: false },
      ],
      explanation:
        'Strategy proposals demand rigorous Why So? — why this market, what odds, what risks, what alternatives. Pure information sharing does not need scrutiny.',
    },
  ],
}

export const logicPyramidEn: LessonData = {
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
        { label: 'Otherwise people forget it', correct: false },
        { label: 'A known conclusion gives the audience a frame for understanding the reasons', correct: true },
        { label: 'Bosses demand it', correct: false },
        { label: 'In case time runs out', correct: false },
      ],
      explanation:
        'Cognitive science: people understand details better when they have a "headline" first. Each piece of evidence is interpreted in the context of the conclusion.',
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
        { label: 'A funny anecdote', correct: false },
        { label: 'A concrete example or data point that backs the reason', correct: true },
        { label: 'A personal experience story', correct: false },
        { label: 'A competitor case study', correct: false },
      ],
      explanation:
        '"Example" provides concrete evidence for the reason. Without it, reasons stay abstract and unconvincing.',
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
        { label: 'Reports project progress', correct: false },
        { label: 'Presents the proposed solution', correct: false },
        { label: 'Articulates the problem against the established context', correct: true },
        { label: 'Introduces team members', correct: false },
      ],
      explanation:
        'After Situation establishes shared context, Complication says "but here is the problem." It is the hinge between known context and the new bad news.',
    },
    {
      type: 'quiz',
      question: 'A: speaking up in a team meeting. B: reporting a customer issue and proposed fix. Best framework combo?',
      options: [
        { label: 'A: SCR, B: PREP', correct: false },
        { label: 'A: PREP, B: SCR', correct: true },
        { label: 'A: SDS, B: PREP', correct: false },
        { label: 'A: SCR, B: SDS', correct: false },
      ],
      explanation:
        'Stating your opinion → PREP. Reporting a problem with a proposed solution → SCR.',
    },
    {
      type: 'quiz',
      question: 'How many key lines (top-level supporting points) work best in a pyramid?',
      options: [
        { label: '1 (simplicity)', correct: false },
        { label: '2-4 (not too few, not too many)', correct: true },
        { label: '5-7 (comprehensiveness)', correct: false },
        { label: 'No limit', correct: false },
      ],
      explanation:
        '2-4 hits the sweet spot. Three is the magical number for memorability.',
    },
    {
      type: 'quiz',
      question: 'Which presentation outline best follows the Pyramid Principle?',
      options: [
        { label: 'Background → analysis → discussion → conclusion', correct: false },
        { label: 'Conclusion → reason A → reason B → reason C → wrap', correct: true },
        { label: 'Problem → cases → reflection → proposal', correct: false },
        { label: 'Self-intro → history → details → conclusion', correct: false },
      ],
      explanation:
        'Conclusion-first, then supporting reasons, then close. Anything starting with background is the opposite of Pyramid.',
    },
  ],
}

export const logicCaseStudiesEn: LessonData = {
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
        { label: 'Thailand\'s land area', correct: false },
        { label: 'Real data on Thailand\'s mid-/high-end smartphone market size and competition', correct: true },
        { label: 'Number of foreign tourists in Thailand', correct: false },
        { label: 'Thailand\'s political stability', correct: false },
      ],
      explanation:
        'The conclusion claims Thailand suits a mid-/high-end strategy. The hard evidence required is the actual mid-/high-end market data and competitive landscape — not background facts.',
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
        { label: 'Cut every line item by 2%', correct: false },
        { label: 'Prioritize the largest cost pools first', correct: true },
        { label: 'Start with whichever cuts are easiest', correct: false },
        { label: 'Focus only on labor', correct: false },
      ],
      explanation:
        'Bigger pools have bigger absolute impact. A 1% improvement on $1.3B COGS is $13M; a 10% improvement on a $25M line is $2.5M. Start with the biggest pools.',
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
        { label: 'CEO\'s personal preference', correct: false },
        { label: 'Feasibility (development difficulty, schedule, required resources)', correct: true },
        { label: 'How cool the product name is', correct: false },
        { label: 'Number of similar overseas products', correct: false },
      ],
      explanation:
        'You evaluated market attractiveness and our strengths but not feasibility. Even an attractive opportunity is worthless if you cannot execute it on time and budget.',
    },

    {
      type: 'quiz',
      question: 'For a problem like "sales suddenly fell 30%, present root cause to the executive team," what is the right framework sequence?',
      options: [
        { label: 'PREP first → logic tree to analyze', correct: false },
        { label: 'Why tree to find causes → So What for insights → SCR to report', correct: true },
        { label: 'MECE to classify → PREP to report', correct: false },
        { label: 'Pyramid first to set the conclusion → then collect data', correct: false },
      ],
      explanation:
        'The right order is analyze → conclude → communicate. Why tree finds the cause; So What turns it into an action; SCR communicates context-problem-solution.',
    },
    {
      type: 'quiz',
      question: 'What is the most important mindset when applying these frameworks at work?',
      options: [
        { label: 'Always use one framework all the way through', correct: false },
        { label: 'Frameworks are tools, not the goal — use them in service of better decisions', correct: true },
        { label: 'Memorize the framework names accurately', correct: false },
        { label: 'Always combine all frameworks at once', correct: false },
      ],
      explanation:
        'Frameworks are scaffolding for thought. The point is the decision quality, not framework purity. Pick what fits the situation, combine when useful, and never let the tool become the goal.',
    },
  ],
}

export const logicDeductionEn: LessonData = {
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
        { label: 'Major: All mammals breathe air with lungs / Minor: Whales are mammals / Conclusion: Whales breathe air with lungs', correct: true },
        { label: 'Major: Some fish live in fresh water / Minor: Tuna are fish / Conclusion: Tuna live in fresh water', correct: false },
        { label: 'Major: Company A is profitable / Minor: Company B is also a company / Conclusion: Company B is profitable', correct: false },
      ],
      explanation:
        'The whales option is sound: the major premise is actually true and the form (Barbara: All A are B / X is A / X is B) is valid.\n\nThe birds option is valid in form but has a false major premise (penguins exist).\nThe tuna option is invalid because "some" does not let you deduce about a specific case.\nThe last option is invalid because being "a company" does not put B inside the set "Company A".',
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
        { label: 'Combining multiple minor premises', correct: false },
        { label: 'A premise that is wrong or has unhandled exceptions', correct: true },
        { label: 'Conclusions that are too long', correct: false },
        { label: 'Not using numbers', correct: false },
      ],
      explanation:
        'Deduction guarantees true conclusions IF the premises are true. So almost every wrong deduction is wrong because a premise was wrong, fragile, or had hidden exceptions.',
    },
    {
      type: 'quiz',
      question: 'What is the biggest practical advantage of deduction in business?',
      options: [
        { label: 'You discover new facts', correct: false },
        { label: 'You can apply policies and rules to specific cases quickly', correct: true },
        { label: 'It guarantees agreement and ends debate', correct: false },
        { label: 'It needs little data', correct: false },
      ],
      explanation:
        'Deduction is for "given a rule, what does it say about this specific case?" If your company has a rule like "exit any business with margin under 5%," you can apply it to each business in seconds. New discoveries come from induction, not deduction.',
    },
  ],
}

export const logicInductionEn: LessonData = {
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
        { label: '"December has been our peak month for the last 5 years. December will probably peak this year too."', correct: true },
        { label: '"Anyone who breaks the work rules is disciplined. Sato broke the rules, so Sato will be disciplined."', correct: false },
        { label: '"Projects over budget are cancelled. This one is over budget, so it will be cancelled."', correct: false },
      ],
      explanation:
        'The December answer reasons from multiple specific years to a general pattern — induction. The others all run from a stated rule down to a specific case — deduction.',
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
        { label: 'Sample size is far too small to generalize', correct: true },
        { label: 'No data on men in their 20s', correct: false },
        { label: 'Should have been a survey, not interview', correct: false },
        { label: 'Definition of Brand X is unclear', correct: false },
      ],
      explanation:
        '5 people cannot represent "women in their 20s." On top of that, the selection (probably friends or a single context) is likely biased. Induction lives or dies on sample size and representativeness.',
    },
    {
      type: 'quiz',
      question: 'When using induction, what mindset matters most?',
      options: [
        { label: 'Reach a conclusion as fast as possible', correct: false },
        { label: 'Treat the conclusion as a hypothesis that could be overturned by counter-evidence', correct: true },
        { label: 'More premises always make the conclusion certain', correct: false },
        { label: 'Trust your intuition', correct: false },
      ],
      explanation:
        'The honest stance toward induction: "based on what I have observed so far, X seems likely." Use language like "tends to" or "is likely" instead of definitives, and stay open to disconfirming data.',
    },
  ],
}

export const logicFormalEn: LessonData = {
  id: 27,
  title: 'Formal Logic — The World of "A Implies B"',
  category: 'Logical Thinking',
  steps: [
    {
      type: 'explain',
      title: 'The basics of "A implies B"',
      content:
        'The most fundamental construct in formal logic is the conditional "A implies B" (A → B).\n\nExample: "If it rains, the ground gets wet"\nA = it rains\nB = the ground is wet\n\n■ When is A → B "true"?\n· A true, B true ✓\n· A false, B true ✓\n· A false, B false ✓\n· A true, B false ✗ (the only false case)\n\nThe conditional A → B is false ONLY when A happens but B does not. Anything else makes it true.\n\n■ Critical caveat\n"A → B" is NOT the same as "B → A".\n"If it rains the ground gets wet" can be true while "if the ground is wet then it rained" is false (sprinklers exist).\nThis is "the converse is not necessarily true."',
    },
    {
      type: 'quiz',
      question: '"If you take this medicine, your fever will drop (A → B)" is true. What can you conclude with certainty?',
      options: [
        { label: 'If your fever dropped, you took the medicine', correct: false },
        { label: 'If you took the medicine and your fever did NOT drop, the original claim is false', correct: true },
        { label: 'If you do not take the medicine, your fever will not drop', correct: false },
        { label: 'Your fever did not drop because you did not take the medicine', correct: false },
      ],
      explanation:
        '"A → B" is false only when A is true but B is false. So observing "took medicine but fever still up" disproves the claim. The other options confuse the converse and inverse for the original.',
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
        { label: 'People strong with numbers are excellent salespeople', correct: false },
        { label: 'Salespeople who are not excellent are not strong with numbers', correct: false },
        { label: 'People who are not strong with numbers are not excellent salespeople', correct: true },
        { label: 'If you are not an excellent salesperson, you are not strong with numbers', correct: false },
      ],
      explanation:
        'Original: A=excellent salesperson → B=strong with numbers. Contrapositive: ¬B → ¬A, "not strong with numbers → not excellent salesperson." The other options are converse, inverse, or converse-inverse — none equivalent to the original.',
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
        { label: '"If it rains, more people carry umbrellas. It is not raining. Therefore no one carries umbrellas."', correct: false },
      ],
      explanation:
        'Option 3 is modus tollens (A → B, ¬B, therefore ¬A). Options 1 and 2 affirm the consequent (the classic fallacy). Option 4 confuses the inverse with the original. The combination of contrapositive and modus tollens is one of the strongest tools for ruling out causes in technical and business investigations.',
    },
    {
      type: 'quiz',
      question: 'What is the practical benefit of using the contrapositive?',
      options: [
        { label: 'You can flip the conclusion to win an argument', correct: false },
        { label: 'When the original statement is hard to prove, you can prove its logically equivalent contrapositive instead', correct: true },
        { label: 'You discover new facts without new premises', correct: false },
        { label: 'You silence opponents', correct: false },
      ],
      explanation:
        'Because the contrapositive is logically equivalent to the original, you can prove either one. In math (proof by contradiction) and in business (root-cause investigation), this trick is invaluable.',
    },
  ],
}

export const logicConcreteAbstractEn: LessonData = {
  id: 68,
  title: 'Concrete & Abstract — Moving Between Levels of Thinking',
  category: 'Logical Thinking',
  steps: [
    {
      type: 'explain',
      title: 'What Are Concrete and Abstract?',
      content:
        'Moving between the concrete and the abstract is one of the most important skills in logical thinking.\n\n● Concrete: specific facts, data, individual examples\n● Abstract: patterns, rules, concepts drawn from those specifics\n\nExample:\nConcrete: "A forgot the handout at yesterday\'s meeting"\nAbstract: "Our information-sharing system has a problem"\n\nConcrete alone ends with "so what?" Abstract alone feels vague. When you can move between both, your persuasiveness multiplies.',
    },
    {
      type: 'quiz',
      question: '"Our team has bad communication" — is this concrete or abstract?',
      options: [
        { label: 'Concrete', correct: false },
        { label: 'Abstract', correct: true },
        { label: 'Neither', correct: false },
        { label: 'Both', correct: false },
      ],
      explanation:
        '"Bad communication" is abstract. To make it concrete, you\'d say something like "Weekly reports are written in a way that causes misunderstandings" or "Chat replies take over 24 hours."',
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
        { label: 'Product quality is poor', correct: false },
        { label: 'Market launch is insufficient', correct: true },
        { label: 'Competition is too strong', correct: false },
        { label: 'Price is too high', correct: false },
      ],
      explanation:
        'Awareness, shelf placement, and promotions all relate to "bringing the product to market." Abstracting these gives us "market launch is insufficient." Quality and price can\'t be inferred from these facts.',
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
        { label: 'Work more efficiently', correct: false },
        { label: 'Everyone should change their mindset', correct: false },
        { label: 'Cut weekly meetings from 45 min to 25 min and automate meeting notes', correct: true },
        { label: 'Pursue digital transformation', correct: false },
      ],
      explanation:
        '"Work efficiently," "change mindset," and "DX" are still abstract. "45 min → 25 min" and "automate notes" contain specific numbers and actions — that\'s truly concrete.',
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
        { label: 'Be concrete with both', correct: false },
        { label: 'Be abstract with both', correct: false },
        { label: 'More abstract for the CEO, more concrete for the team', correct: true },
        { label: 'It depends, so you can\'t generalize', correct: false },
      ],
      explanation:
        'The CEO wants the big picture and direction (abstract). Team members need to know what to do (concrete). Adjusting abstraction level to your audience is a core professional skill.',
    },
    {
      type: 'quiz',
      question: 'Which demonstrates concrete → abstract → concrete thinking?',
      options: [
        { label: '"Store A sales dropped, so let\'s fix Store A"', correct: false },
        { label: '"Productivity is low, so let\'s do DX"', correct: false },
        { label: '"Stores A and B both have declining average transaction values. So upselling is weak. Let\'s implement a checkout suggestion script at each store"', correct: true },
        { label: '"Competition is tough, so let\'s differentiate"', correct: false },
      ],
      explanation:
        'Concrete (declining transaction values at A and B) → Abstract (upselling is weak) → Concrete (checkout suggestion script). The other options stay at one level only.',
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
