/**
 * Client Work Course (Intermediate)
 * Lesson IDs: 89-97
 * Category: 'Client Work'
 * English version
 */
import type { LessonData } from './lessonData'

// ── Lesson 89: Working with large numbers and rough estimation ──────────
const clientLesson89: LessonData = {
  id: 89,
  title: 'Working with large numbers and rough estimation',
  category: 'Client Work',
  steps: [
    {
      type: 'explain',
      title: 'Build your number sense first',
      content: 'When dealing with large numbers, starting from precise calculations every time is slow.\n\nFirst, build "order-of-magnitude intuition."\n\n10 → 100 → 1,000 → 10K → 100K → 1M → 100M → 1T\n\nIt\'s just a 10× progression.\n\nFor example:\n- Population of Japan ≈ 120 million\n- Japan GDP ≈ 600 trillion yen\n- Tokyo population ≈ 14 million\n\nWith this sense, you can intuitively judge whether a number "looks plausible" the moment you see it.',
    },
    {
      type: 'explain',
      title: 'Count digits to identify the unit',
      content: 'Japanese numbers change unit every 4 digits. If you can count digits, you can mechanically identify the unit.\n\nDigit count → unit (10K and up)\n- 5 digits = 10K (10,000)\n- 6 digits = 100K (100,000)\n- 7 digits = 1M (1,000,000)\n- 8 digits = 10M (10,000,000)\n- 9 digits = 100M (100,000,000)\n- 10 digits = 1B\n- 11 digits = 10B\n- 12 digits = 100B\n- 13 digits = 1T\n\nSummary — every 4 digits the range shifts:\n- 5-8 digits → the "10K" range (in Japanese "man")\n- 9-12 digits → the "100M" range (in Japanese "oku")\n- 13-16 digits → the "1T" range (in Japanese "cho")\n\nIn other words, "count the zeros and divide by 4" instantly tells you which range a number is in.',
    },
    {
      type: 'explain',
      title: 'Derive the unit from digit count',
      content: 'Given a large number, three steps tell you the unit.\n\nProcedure:\n1. Count digits including all zeros\n2. Apply the unit every 4 digits (10K → 100M → 1T)\n3. Read the leading digits\n\nExample 1: 300,000,000,000\n1. Count digits → 12 digits\n2. 12 digits is the "hundred billion" range\n3. Read leading "3" → 300 billion\n\nExample 2: 12,000,000\n1. Count digits → 8 digits\n2. 8 digits is the "ten million" range\n3. Read leading "12" → 12 million\n\nExample 3: 5,400,000,000\n1. Count digits → 10 digits\n2. 10 digits is the "billion" range\n3. Read leading "54" → 5.4 billion\n\nTip: Rather than chunking by 3 digits with commas, chunking by 4 digits matches the Japanese unit system (10K/100M/1T).',
    },
    {
      type: 'quiz',
      explanation: '7,200,000,000 has 10 digits. The 9-12 digit range is "100M." 10 digits is the billion place. Read leading "72" → 7.2 billion. Miscounting digits by one shifts the unit by 10x, so count zeros precisely.',
      question: 'What is 7,200,000,000?',
      options: [
        { label: '720 million', correct: false },
        { label: '7.2 billion', correct: true },
        { label: '72 billion', correct: false },
        { label: '720 billion', correct: false },
      ],
    },
    {
      type: 'explain',
      title: 'Multiply by shifting digits',
      content: 'Multiplying large numbers gets easier when you "shift digits."\n\n1 million × 1 million = ?\n\nThinking:\n- 1 million = 10^6\n- 1 million × 1 million = 10^6 × 10^6 = 10^12\n- 10^12 = 1 trillion\n\nPoint: Just add the powers of 10 (number of zeros).\n- 10K (4 digits) × 10K (4 digits) = 100M (8 digits)\n- 10K (4 digits) × 100M (8 digits) = 1T (12 digits)\n- 1M (6 digits) × 1M (6 digits) = 1T (12 digits)',
    },
    {
      type: 'quiz',
      explanation: '1 million = 10^6. 6 + 6 = 12 → 10^12 = 1 trillion. Memorize "10K × 10K = 100M" and "100M × 10K = 1T" as anchors.',
      question: 'What is 1 million × 1 million?',
      options: [
        { label: '100 million', correct: false },
        { label: '10 billion', correct: false },
        { label: '1 trillion', correct: true },
        { label: '100 trillion', correct: false },
      ],
    },
    {
      type: 'explain',
      title: 'Estimate market size',
      content: 'Market size estimates like "5 million people × 3,000 yen = ?" come up constantly.\n\nCalculation:\n1. 5 million × 3,000\n2. = 5 million × 0.3 × 10K\n3. = 5M × 0.3 × 10K\n4. = 0.3 × 5M × 10K\n5. = 0.3 × 50 billion\n6. = 15 billion yen\n\nTip: Memorizing "10K × 10K = 100M" makes calculations fast.\n\nExample: Japan\'s coffee market\n- Coffee drinkers: ~60 million people\n- Annual spend: ~5,000 yen / person\n- Market size: 60M × 5,000 yen\n\nCalculation:\n1. 60M × 5,000\n2. = 60M × 0.5 × 10K\n3. = 30M × 10K\n4. = 300 billion yen\n5. ≈ 300 billion yen',
      visual: 'FermiFormulaDiagram',
      visualProps: {
        sectionLabel: 'Market sizing — Japan coffee market',
        factors: [
          { label: 'Drinkers', value: '60M', unit: 'people' },
          { label: 'Annual spend', value: '5,000', unit: 'yen / person' },
        ],
        result: { label: 'Market size', value: '300', unit: 'billion yen / yr' },
        hint: 'Burn "10K × 10K = 100M" into muscle memory and digit checks become instant',
      },
      outro:
        'Market size sizing is fundamentally "headcount × spend" — a single multiplication that frames the whole picture. Burn unit-conversion anchors like "10K × 10K = 100M" into muscle memory and digit-sanity checks become instant, so you can put numbers on the table with confidence.',
    },
    {
      type: 'quiz',
      explanation: '3M × 6,000 = 3M × 0.6 × 10K = 1.8 × 100M × 10K… Use "10K × 10K = 100M" mental anchor: 3M × 6,000 = 18 billion yen.',
      question: 'A product has 3 million users with average annual spend of 6,000 yen. What is the annual market size?',
      options: [
        { label: 'About 1.8 billion yen', correct: false },
        { label: 'About 18 billion yen', correct: true },
        { label: 'About 180 billion yen', correct: false },
        { label: 'About 1.8 trillion yen', correct: false },
      ],
    },
  ],
}

// ── Lesson 90: Define the issue ────────────────────────────────────────
const clientLesson90: LessonData = {
  id: 90,
  title: 'Define the issue',
  category: 'Client Work',
  steps: [
    {
      type: 'explain',
      title: 'Question-setting errors are the biggest losses',
      content: '"Answering the right question" matters far more than "answering the wrong question correctly."\n\nA common failure pattern in client work:\n- Client: "Sales are down."\n- You: immediately starts thinking "how do we increase sales?"\n\nBut what is the real question?\n- Which products / regions are down?\n- When did the decline start?\n- What are competitors doing?\n- Maybe cost cutting is the priority\n\nDefining the issue = clarifying "what we should solve"',
    },
    {
      type: 'explain',
      title: 'Use So what? / Why so? to dig deep',
      content: 'To frame the issue correctly, use two questions.\n\nSo what? (so therefore?)\n→ Extract implications from facts\nExample: "Sales fell 10%" → So what? → "At this rate we hit losses in 3 months"\n\nWhy so? (why is that?)\n→ Drill into the cause of facts\nExample: "Sales fell 10%" → Why so? → "New customer acquisition is flat, but churn of existing customers has increased"\n\nRepeating these two takes you from surface symptom to essential issue.',
      visual: 'SoWhatDiagram',
      outro:
        'So what? pulls out implications, Why so? pulls out causes. A report that just lists facts tends to invite "so what?" from your audience, so alternate these two questions like a pair of tools and ride them down to the real issue. That alternation is the move that separates analysts from list-makers.',
    },
    {
      type: 'quiz',
      explanation: 'Before jumping to solutions, first establish "since when, where, why." Defining the issue correctly is the highest priority.',
      question: 'A client says "lately, inquiries have decreased." What should you confirm first?',
      options: [
        { label: 'Immediately propose increasing ad spend', correct: false },
        { label: 'Confirm since when and through which channels they\'re decreasing', correct: true },
        { label: 'Check competitors\' websites', correct: false },
        { label: 'Propose strengthening social media PR', correct: false },
      ],
    },
    {
      type: 'explain',
      title: 'Three questions to narrow down issues',
      content: 'When multiple questions emerge, you need criteria to decide which to solve first.\n\nThree questions for narrowing issues:\n\n1. Is it important?\n   Will answering it significantly affect decisions or outcomes?\n\n2. Can it be solved?\n   Can you produce an answer with the info, resources, and time at hand?\n\n3. Should it be solved now?\n   Does it have to be answered at this timing, or can it wait?\n\nA question that satisfies all three is your issue. This avoids wasted analysis.',
    },
    {
      type: 'quiz',
      explanation: 'Right before a presentation, the priority is identifying weak spots. Solutions come after. Maximize improvement in the limited time available.',
      question: 'Of these four questions, which is highest priority as "the issue to solve now"? (Context: a presentation next month proposing a sales strategy for client\'s product A)',
      options: [
        { label: 'Forecast of overall market trends 5 years out', correct: false },
        { label: 'Why existing customers of product A are churning', correct: true },
        { label: 'Industry-wide digitalization progress', correct: false },
        { label: 'Sales trend analysis since founding', correct: false },
      ],
    },
  ],
}

// ── Lesson 91: Interview techniques ─────────────────────────────────
const clientLesson91: LessonData = {
  id: 91,
  title: 'Interview techniques',
  category: 'Client Work',
  steps: [
    {
      type: 'explain',
      title: 'Ask "what we need to know," not "what we want to ask"',
      content: 'A common interview failure:\n\nBad: "Are there any problems you\'re facing?"\n→ Too vague; the other person can\'t answer\n\nGood: "What\'s the most time-consuming task in your work?"\n→ Concrete; gives information usable for hypothesis testing\n\nInterviews are not "interviews" — they are hypothesis verification.\n\nThinking through "what do I need to confirm to test my hypothesis?" beforehand dramatically changes the quality of information you get.',
    },
    {
      type: 'explain',
      title: 'Use open and closed questions appropriately',
      content: 'Open questions: the other person can answer freely\n- "How do you feel about the current challenges?"\n- "What does the ideal state look like?"\n- When to use: when you want to broaden the conversation, in initial situation grasp\n\nClosed questions: answered yes/no or with options\n- "Does this problem occur monthly?"\n- "Is the priority cost reduction or sales expansion?"\n- When to use: when verifying a hypothesis, when narrowing the conversation\n\nGolden rule: start with open, confirm with closed.',
    },
    {
      type: 'quiz',
      explanation: 'To verify "the cause is support quality, not price," directly ask about support dissatisfaction. Asking about price satisfaction tests a different hypothesis.',
      question: 'You want to verify the hypothesis "customer churn is caused by support quality, not price." Which is the best question?',
      options: [
        { label: '"Are you facing any problems?"', correct: false },
        { label: '"How do you feel about the service\'s pricing?"', correct: false },
        { label: '"When you contacted support, how long until your issue was resolved?"', correct: true },
        { label: '"Have you compared with competitors\' services?"', correct: false },
      ],
    },
    {
      type: 'explain',
      title: 'Don\'t fear silence',
      content: 'A surprisingly important interview skill is the use of "silence."\n\nSilence is a sign that the other person is thinking.\nThrowing the next question immediately when they go quiet stops their thought process.\n\nDevelop the habit of waiting 3 seconds. Often they\'ll share deeper information.\n\n"And then?" / "For example?" / "Could you tell me a little more?"\n→ These small prompts transform interview depth.\n\nVisible note-taking matters too. The other person feels "they\'re really listening" and shares more.',
    },
    {
      type: 'quiz',
      explanation: 'Silence indicates thinking. Rushing to the next question cuts the thought process. Waiting often draws out true feelings or important information.',
      question: 'During an interview, the other person goes "umm..." and falls silent. What\'s the best next move?',
      options: [
        { label: 'Move on with "let\'s go to the next question"', correct: false },
        { label: 'Speak your interpretation: "you mean XX, right?"', correct: false },
        { label: 'Wait about 3 seconds for them to start talking again', correct: true },
        { label: 'Treat it as if you got the answer and move on', correct: false },
      ],
    },
  ],
}

// ── Lesson 92: How to read information ───────────────────────────
const clientLesson92: LessonData = {
  id: 92,
  title: 'How to read information',
  category: 'Client Work',
  steps: [
    {
      type: 'explain',
      title: 'Have a question before you read',
      content: 'Just by deciding "what do I want to confirm from this material?" before reading, your reading speed and accuracy change dramatically.\n\nReading without a question:\n→ Everything seems important → you finish without organized takeaways\n\nReading with a question:\n→ Your eyes naturally lock onto needed information → implications come out faster\n\nExample: "I want to find evidence about cost reduction in this proposal."\n→ Scanning with that lens, you can read in 2 minutes what would normally take 5.',
    },
    {
      type: 'explain',
      title: 'Read by separating claim, reason, and example',
      content: 'When organizing information, splitting it into three elements clears the head.\n\nClaim: what the author wants to convey\nExample: "This service has high implementation impact"\n\nReason: why the claim holds\nExample: "90% of adopting companies cut work hours by 20%"\n\nExample: evidence backing the reason\nExample: "Company A achieved 40 hours/month of effort reduction"\n\nReading split this way also surfaces problems like "claim with no reason" or "weak reason."',
      visual: 'ClaimReasonAssumptionDiagram',
      outro:
        'Splitting writing into claim, reason, and example makes "claims without reasons" and "examples without claims" obvious at a glance. Use the same three-layer lens whether you are reading or writing, and the quality of your arguments climbs a clear notch.',
    },
    {
      type: 'quiz',
      explanation: '"Should..." / "We think..." are claims. "Survey shows..." / "Company X did..." are facts/reasons. Distinguishing claim from reason is foundational logical thinking.',
      question: 'In the following text, which is the "claim"?\n\n"(1) 85% of companies that introduced our tool report improved customer satisfaction. (2) Company B saw NPS rise 15 points within 3 months of adoption. (3) Our tool can improve your customer experience."',
      options: [
        { label: '(1) 85% of companies report improved customer satisfaction', correct: false },
        { label: '(2) Company B saw NPS rise 15 points in 3 months', correct: false },
        { label: '(3) Our tool can improve your customer experience', correct: true },
        { label: 'Both (1) and (3)', correct: false },
      ],
    },
    {
      type: 'explain',
      title: 'Inspect AI output by structure',
      content: 'Using AI for information gathering is increasingly common. Taking AI output as-is creates risks.\n\nCommon problems:\n- Sources are unclear or outdated\n- Numbers "look right" but lack basis\n- Multiple pieces of information mix into illogical leaps\n\nThree checks for AI output:\n1. Does the claim correspond to the reason? (Is reason given for each claim?)\n2. Is the number reasonable in magnitude? (Verify with rough-estimation skills)\n3. Is there a leap to the conclusion? (Are correlation and causation conflated?)\n\nThese three checks alone dramatically raise output quality.',
    },
    {
      type: 'quiz',
      explanation: 'Japan\'s pet market is actually about 1-1.5 trillion yen (per Yano Research and similar). 50 trillion yen is roughly 1/12 of GDP — implausible. AI confidently makes mistakes. Always verify numbers against source data or estimation.',
      question: 'AI outputs "Japan\'s pet market is 50 trillion yen per year." What should you check first?',
      options: [
        { label: 'Look up the breakdown by pet type', correct: false },
        { label: 'Check magnitude reasonableness (Japan GDP is ~600 trillion yen)', correct: true },
        { label: 'Compare with adjacent markets', correct: false },
        { label: 'Use the number as-is in the proposal', correct: false },
      ],
    },
  ],
}

// ── Lesson 93: Structured thinking ─────────────────────────────────────────
const clientLesson93: LessonData = {
  id: 93,
  title: 'Structured thinking',
  category: 'Client Work',
  steps: [
    {
      type: 'explain',
      title: 'How you arrange things changes what gets through',
      content: 'The same information lands very differently depending on how it\'s arranged.\n\nStructuring means:\nOrganizing information and thoughts on the dimensions of "flow, granularity, gaps/duplication, and relationships"\n\nUnstructured example:\n→ "We need cost reduction. Sales should grow. Hiring is also tough. Employee morale is low. We want to push DX."\n\nStructured example:\n→ "Two issues. (1) Financial: cost overruns and stagnant sales. (2) Organizational: hard to hire and low morale. DX is a means to address (2)."\n\nStructure alone makes "what\'s wrong, where to start" obvious at a glance.',
    },
    {
      type: 'explain',
      title: 'Distinguish causation from parallel relationships',
      content: 'In structuring, the most important thing is identifying relationships.\n\nParallel (A, B, C are equal-rank):\n→ "The issues are (1) rising costs, (2) declining sales, (3) labor shortage"\n\nCausal (A leads to B):\n→ "Labor shortage (cause) → slower response (effect) → customer churn (effect)"\n\nMatch the granularity:\n- Bad: "(1) rising costs, (2) staffing in division A, (3) global market changes" (mixed abstraction)\n- Good: "(1) cost structure, (2) staffing, (3) market environment" (same level)',
      visual: 'ThreePillarsDiagram',
      visualProps: {
        sectionLabel: 'Three relationship types to check when structuring',
        pillars: [
          { icon: 'Par', title: 'Parallel', body: '"A, B, and C" sit at equal rank. AND relation. Order matters less' },
          { icon: 'Cau', title: 'Causal', body: '"A leads to B." Cause → effect arrow. Reverse the order and the logic breaks' },
          { icon: 'Gra', title: 'Granularity', body: 'Match the abstraction level. "Market environment" next to "button color" feels off' },
        ],
        hint: 'Structuring = re-sort items by these three lenses: parallel / causal / granularity',
      },
    },
    {
      type: 'quiz',
      explanation: '"New customer drop + competitor price war" → external factors. "CS rating drop + churn rise" → internal factors. Splitting MECE by where the cause sits makes the structure visible.',
      question: 'Group these four facts into two groups. Which grouping is appropriate?\n\nA: New customer count is decreasing\nB: Website traffic is down\nC: Existing customer repeat rate is dropping\nD: Customer support satisfaction is declining',
      options: [
        { label: '(1) Acquisition (A, B) and (2) Retention (C, D)', correct: true },
        { label: '(1) Important issues (A, C) and (2) Less important (B, D)', correct: false },
        { label: '(1) Digital (B) and others (A, C, D)', correct: false },
        { label: '(1) Sales-related (A, C, D) and other (B)', correct: false },
      ],
    },
    {
      type: 'explain',
      title: 'Verify AI output structurally',
      content: 'Lists or proposal outlines from AI also need structural inspection.\n\nChecklist:\n\n(1) Are there gaps?\n→ Is anything important missing? (MECE lens)\n\n(2) Are there duplications?\n→ Same thing said twice in different wording?\n\n(3) Is granularity matched?\n→ Is big-picture mixed with small detail?\n\n(4) Is the order appropriate?\n→ Are causally-linked items reversed?\n\nThese four quickly surface structural problems.',
    },
    {
      type: 'quiz',
      explanation: 'Proposals follow "(1) current state → (2) issue → (3) solution → (4) expected impact." Putting "impact" before "issue" confuses readers.',
      question: 'Which proposal structure has a wrong order?',
      options: [
        { label: '(1) Identify issue → (2) Analyze cause → (3) Propose action', correct: false },
        { label: '(1) Propose action → (2) Identify issue → (3) Analyze cause', correct: true },
        { label: '(1) Grasp current state → (2) Identify issue → (3) Present solution', correct: false },
        { label: '(1) Background and purpose → (2) Analysis → (3) Recommendation', correct: false },
      ],
    },
  ],
}

// ── Lesson 94: Communicating and writing ──────────────────────────
const clientLesson94: LessonData = {
  id: 94,
  title: 'Communicating and writing',
  category: 'Client Work',
  steps: [
    {
      type: 'explain',
      title: 'Lead with the conclusion',
      content: 'In business writing, "conclusion first" is the foundation.\n\nPREP method:\n- P (Point): conclusion / claim\n- R (Reason): rationale\n- E (Example): specific examples / data\n- P (Point): restate the conclusion\n\nBad:\n"We did market research. Competitor A lowered prices. Competitor B added new features. Customer feedback shows price dissatisfaction. Therefore, a pricing strategy review is needed."\n\nGood:\n"We propose a pricing strategy review. Three reasons: (1) competitors cut prices, (2) customer satisfaction surveys show price dissatisfaction, (3) at this rate, next quarter\'s revenue target is at risk."',
      visual: 'PrepDiagram',
      outro:
        'PREP is Point → Reason → Example → Point — a four-beat rhythm. Wrapping the conclusion at the start and end minimizes load on a busy reader. The same pattern works for the opening line of an email, a chat reply, or a one-minute briefing, making it one of the most reusable templates you can carry.',
    },
    {
      type: 'explain',
      title: 'Switch between abstract and concrete',
      content: 'Most ineffective writing is biased toward "abstract only" or "concrete only."\n\nToo abstract:\n"Improving customer experience is important."\n→ The reader doesn\'t know what to do\n\nToo concrete:\n"On Company A\'s XX page, change the button color from orange to blue, and increase font size from 14pt to 16pt."\n→ The reader doesn\'t know why\n\nJust right:\n"We\'ll improve the deciding-moment experience that drives first purchases. Specifically, we\'ll make the CTA button on product pages more prominent and reduce checkout from 3 steps to 2."\n→ Goal and means together',
    },
    {
      type: 'quiz',
      explanation: 'Even for internal audiences, plain wording that reliably lands is the baseline. Avoid overusing vague acronyms, and choose an expression where the conclusion (improved purchase rate) is clear at first read.',
      question: 'Communicating the same content to a manager (internal) — which expression is more appropriate?',
      options: [
        { label: '"UX improvement is expected to improve CVR"', correct: false },
        { label: '"Improving site usability is expected to improve purchase rate"', correct: true },
        { label: '"We will run A/B testing on pages to optimize conversion rate"', correct: false },
        { label: '"Aiming for KPI improvement through UX improvement"', correct: false },
      ],
    },
    {
      type: 'explain',
      title: 'Edit AI writing into your own voice',
      content: 'Using AI-written text as-is creates problems.\n\nCommon AI text traits:\n- Overly polite and verbose ("It is considered important to...")\n- Hedged and vague (filled with "may," "could be considered")\n- Doesn\'t consider who the reader is\n\nHow to edit:\n1. Make subjects explicit ("We will...")\n2. Assert where you can assert ("This works")\n3. Match the reader\'s level (replace jargon with plain words)\n4. Split long sentences (target ~40 characters per sentence in JP, ~20 words in EN)',
    },
    {
      type: 'quiz',
      explanation: '"Considered from various perspectives" is filler. Specifying what was considered and what conclusion was reached strengthens persuasiveness.',
      question: 'Which version best improves the AI-written text?\n\nOriginal: "After considering this initiative from various perspectives, it is considered that a certain level of effect may be expected."',
      options: [
        { label: '"This initiative is effective."', correct: false },
        { label: '"Implementing this initiative is expected to improve sales."', correct: true },
        { label: '"For this initiative, we believe effect can be expected."', correct: false },
        { label: '"This initiative has been considered from various perspectives, and effect may possibly be expected."', correct: false },
      ],
    },
  ],
}

// ── Lesson 95: Storyline design ──────────────────────────────
const clientLesson95: LessonData = {
  id: 95,
  title: 'Storyline design',
  category: 'Client Work',
  steps: [
    {
      type: 'explain',
      title: 'Why a correct proposal still fails to land',
      content: 'Even with sufficient research and correct analysis, you can produce a proposal that "doesn\'t land."\n\nIt\'s because the storyline (the order in which you communicate) is weak.\n\nStoryline means:\nThe flow of "in what order, what to convey" across slides or a report.\n\nListeners decide "is this worth listening to?" within the first few minutes.\n\nBasic flow:\n(1) Current state (what is happening)\n(2) Issue (what is wrong)\n(3) Cause (why the issue is happening)\n(4) Action (how to solve it)\n(5) Expected impact (what changes when solved)',
    },
    {
      type: 'explain',
      title: 'Connect slides with "So what?"',
      content: 'A technique that strengthens storyline: "connect with So what?"\n\nAt the end of each slide, ask "So what?" — and design the next slide to be the answer.\n\nExample:\n- Slide 1: "Competitor A lowered prices by 20%"\n  → So what? →\n- Slide 2: "Our price competitiveness becomes problematic within 3 months"\n  → So what? →\n- Slide 3: "We need to revise pricing strategy this month"\n\nThis flow naturally guides the listener\'s thinking through to "what should we do."',
    },
    {
      type: 'quiz',
      explanation: 'Issue discovery → cause analysis → action proposal → expected impact is the natural flow. The reader can convince themselves "why this proposal" as they read.',
      question: 'Three facts. What\'s the most natural proposal storyline order?\n\nA: As an action, introduce a support-quality improvement program\nB: Customer satisfaction survey shows support response is the top complaint\nC: Existing customer churn rate has risen 15% in the last 6 months',
      options: [
        { label: 'C → B → A', correct: true },
        { label: 'A → B → C', correct: false },
        { label: 'B → C → A', correct: false },
        { label: 'A → C → B', correct: false },
      ],
    },
    {
      type: 'explain',
      title: 'Use the pyramid structure',
      content: 'A tool to organize storyline visually is the pyramid structure.\n\n```\n       [Conclusion / claim]\n      /        |        \\\n [Reason 1] [Reason 2] [Reason 3]\n   |          |           |\n[Fact]      [Fact]      [Fact]\n```\n\nUsage:\n- Top: the conclusion you want to convey (just one)\n- Middle: reasons supporting the conclusion (2-4)\n- Bottom: facts and data backing each reason\n\nOrganizing this way before slide-making naturally surfaces logical leaps and gaps.',
      visual: 'PyramidDiagram',
      visualProps: {
        conclusion: { label: 'Conclusion', body: 'Shift investment toward online channels' },
        claims: [
          { label: 'Reason 1', body: 'Higher acquisition efficiency' },
          { label: 'Reason 2', body: 'Measurable results' },
          { label: 'Reason 3', body: 'Competitors still thin here' },
        ],
        evidence: [
          ['CPA half of in-store', 'Inquiries rising'],
          ['Numbers per ad', 'Faster improvement'],
          ['Few competitor ads', 'Can win branded search'],
        ],
        hint: 'Conclusion on top, 2-4 reasons, each backed by facts',
      },
      outro:
        'A conclusion at the top, supported by two to four reasons, each backed by facts — this three-tier pyramid is the standard shape of an argument. Sketch it on paper before opening a slide tool, and you catch composition wobble and lopsided reasoning early, while editing is still cheap.',
    },
    {
      type: 'quiz',
      explanation: 'Putting solutions before saying "there\'s an issue" is logically backwards. Issue → solution is the basic order. Disrupting this loses reader trust.',
      question: 'Which proposal storyline has a problem?',
      options: [
        { label: '(1) Issue → (2) Cause analysis → (3) Solution → (4) Expected impact', correct: false },
        { label: '(1) Present solution → (2) Why this solution → (3) What was the issue', correct: true },
        { label: '(1) Executive summary → (2) Current analysis → (3) Issue → (4) Recommendation', correct: false },
        { label: '(1) Hypothesis → (2) Verification → (3) Conclusion → (4) Action plan', correct: false },
      ],
    },
  ],
}

// ── Lesson 96: Reporting ──────────────────────────────────────
const clientLesson96: LessonData = {
  id: 96,
  title: 'Reporting',
  category: 'Client Work',
  steps: [
    {
      type: 'explain',
      title: 'Hold to the three elements of a report',
      content: 'Effective reports need three elements.\n\n(1) Fact: what happened\nExample: "New inquiries this month dropped 30% MoM"\n\n(2) Insight: what it means\nExample: "Not seasonal; we estimate the impact comes from last month\'s ad pause"\n\n(3) Next Action: what to do, by when\nExample: "We\'ll restart ads next week and check next month\'s numbers for impact"\n\nReports without all three trigger "so what should I do?" responses.',
      visual: 'ThreePillarsDiagram',
      visualProps: {
        sectionLabel: 'The three elements of a report',
        pillars: [
          { title: 'Fact', body: 'What happened. Show it with numbers and facts' },
          { title: 'Insight', body: 'What it means. The cause or implication' },
          { title: 'Next Action', body: 'What to do, and by when' },
        ],
        hint: 'All three present means no "so what should I do?" follow-up',
      },
      outro:
        'A report that carries fact, insight, and next action as a complete set never invites "so what now?" Spending an extra moment to self-check "are all three present?" before you send is the small habit that compounds into real trust over time.',
    },
    {
      type: 'explain',
      title: 'Write meeting minutes correctly',
      content: 'Post-meeting minutes are not "an information record" — they\'re "action confirmation."\n\nThree elements of good minutes:\n\n1. Decisions (What): what was decided\nExample: "Decided to raise next quarter\'s ad budget by 20%"\n\n2. Action items (Who, What, When): who, what, by when\nExample: "Tanaka-san will draft the budget adjustment plan and share it by 3/15"\n\n3. Open items (Pending): what carries over to the next session\nExample: "Decision on overseas expansion deferred until next month\'s data review"\n\nBad: Minutes that just transcribe who said what.',
    },
    {
      type: 'quiz',
      explanation: 'In minutes, "who, what, by when" must be explicit. "We discussed XX" is not actionable next time. Always record action items.',
      question: 'Which minutes entry most needs improvement?',
      options: [
        { label: '"Decided to switch to monthly sales target tracking starting next quarter"', correct: false },
        { label: '"Yamada-san will create the new proposal by 4/10"', correct: false },
        { label: '"Various opinions came out and a good discussion was had"', correct: true },
        { label: '"Decision on overseas expansion deferred to next meeting (5/1)"', correct: false },
      ],
    },
    {
      type: 'explain',
      title: 'Use quantitative and qualitative together',
      content: 'In reports and emails, distinguishing quantitative from qualitative matters.\n\nQuantitative: information you can express in numbers\n- "Sales rose 10%" / "Average response time shortened by 2 hours"\n- High reliability, easy to compare\n- But numbers alone don\'t explain "why"\n\nQualitative: information expressed in words / customer voice / observation\n- "Customers were observed struggling with the operation"\n- Conveys "why" that doesn\'t show in numbers\n- But subjective\n\nBest practice: show facts quantitatively, explain meaning qualitatively\nExample: "Churn rate up 15% (quant). Interviews show frequent complaints about support (qual)."',
    },
    {
      type: 'quiz',
      explanation: 'A reporting email is easiest to read in "conclusion → current numbers → next month plan" order. Respect the reader\'s time; lead with conclusion — basic business writing.',
      question: 'For a monthly client report email, which structure is best?',
      options: [
        { label: 'Detail this month\'s entire work in chronological order', correct: false },
        { label: '(1) This month\'s results (numbers) → (2) Interpretation / implications → (3) Next month\'s actions', correct: true },
        { label: 'List only the problems', correct: false },
        { label: 'Just write "please review" and attach materials', correct: false },
      ],
    },
  ],
}

// ── Lesson 97: Receiving and using feedback ──────────────────────
const clientLesson97: LessonData = {
  id: 97,
  title: 'Receiving and using feedback',
  category: 'Client Work',
  steps: [
    {
      type: 'explain',
      title: 'Separate emotion from information',
      content: 'When receiving feedback, defensive reactions arise naturally.\n\n"This direction is wrong" → (inner voice) "My proposal got rejected..."\n\nBut feedback is not "an evaluation of you" — it\'s "information about the output."\n\nTips for separating emotion from information:\n1. First, accept it ("Thank you") — don\'t argue\n2. Confirm: "So you\'re saying XX is the issue, right?"\n3. Process emotions later, at home\n\nPeople who can take feedback honestly grow much faster.',
    },
    {
      type: 'explain',
      title: 'Make "what\'s wrong" specific',
      content: 'When a client or manager says "this isn\'t it" or "polish it more," what to actually fix is unclear.\n\nThree questions you can use:\n\n(1) "Specifically, what part bothered you?"\n→ Pinpoint the problem\n\n(2) "Is there an example close to your ideal?"\n→ Align expectations\n\n(3) "What\'s top priority to fix?"\n→ Confirm priority\n\nJust these three make "what to fix" clear.',
    },
    {
      type: 'quiz',
      explanation: 'Vague feedback like "weak" needs clarification on what specifically is weak. Self-judging usually leads to off-target fixes.',
      question: 'Your manager says "this proposal feels weak." What\'s the best next move?',
      options: [
        { label: '"Got it, I\'ll redo it" and immediately return to your desk', correct: false },
        { label: '"Which part feels especially weak?" — confirm', correct: true },
        { label: '"I thought it was good" — push back', correct: false },
        { label: 'Redo the entire thing and resubmit', correct: false },
      ],
    },
    {
      type: 'explain',
      title: 'Turn feedback into an improvement loop',
      content: 'Just receiving feedback and stopping leads to repeating the same mistakes.\n\nFour steps to use feedback:\n\n1. Record: save what was said in notes\n2. Find patterns: if the same point comes up 3+ times, it\'s your issue\n3. Analyze cause: why did the mistake happen (skill? time? perception gap?)\n4. Change next time\'s behavior: decide concretely what changes\n\nCommon trap: ending with "I\'ll be careful"\n→ Convert to a concrete action: "Before submission next time, I\'ll check XX."',
      visual: 'FeedbackLoopDiagram',
      visualProps: {
        sectionLabel: 'Feedback improvement loop — 4 steps',
        loopType: 'R',
        loopName: 'Turn critique into growth',
        nodes: [
          { label: 'Record' },
          { label: 'Find pattern' },
          { label: 'Analyze cause' },
          { label: 'Change behavior' },
        ],
        arrows: [
          { from: 0, to: 1, polarity: '+' },
          { from: 1, to: 2, polarity: '+' },
          { from: 2, to: 3, polarity: '+' },
          { from: 3, to: 0, polarity: '+' },
        ],
        hint: 'Skip "I\'ll be careful." Convert it to a concrete check action — that closes the loop.',
      },
    },
    {
      type: 'quiz',
      explanation: 'Don\'t go defensive; first try to understand. "Thank you. Specifically which part?" is the model response.',
      question: 'Which response to feedback is most appropriate?',
      options: [
        { label: '"I\'m sorry, I\'ll be more careful from now on" — and end there', correct: false },
        { label: '"Thank you for pointing this out. I\'ll fix XX. Just to confirm — should I also revisit YY?"', correct: true },
        { label: '"That\'s not what I intended" — explain', correct: false },
        { label: 'Immediately fix on the spot and show', correct: false },
      ],
    },
  ],
}

// ── Export ────────────────────────────────────────────────────────
export const clientWorkLessonMapEn: Record<number, LessonData> = {
  89: clientLesson89,
  90: clientLesson90,
  91: clientLesson91,
  92: clientLesson92,
  93: clientLesson93,
  94: clientLesson94,
  95: clientLesson95,
  96: clientLesson96,
  97: clientLesson97,
}
