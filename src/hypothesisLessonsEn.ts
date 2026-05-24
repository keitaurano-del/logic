import type { LessonData } from './lessonData'

// ========================================
// Hypothesis-Driven Thinking Lessons (ID: 50-52)
// ========================================

const hypothesisIntro: LessonData = {
  id: 50,
  title: 'Hypothesis-Driven Thinking — Think Before You Investigate',
  category: 'Hypothesis-Driven Thinking',
  steps: [
    {
      type: 'explain',
      title: 'What is hypothesis-driven thinking?',
      content:
        'Hypothesis-driven thinking is "first form a hypothesis about the answer, then verify it."\n\nWhat most people default to:\nGather information -> analyze -> reach a conclusion (bottom-up).\n\nThe hypothesis-driven approach:\nState a tentative conclusion -> gather only the information you need -> verify.\n\nWhy is this effective?\n- In an age of information overload, "investigate everything first" is too slow\n- "What to investigate" becomes clear\n- Decision speed goes up dramatically\n\nA famous McKinsey saying:\n"Have a hypothesis from Day 1."',
    },
    {
      type: 'quiz',
      question: 'Which describes the hypothesis-driven approach correctly?',
      options: [
        { label: 'Collect all relevant data exhaustively, then derive a conclusion', correct: false },
        { label: 'State a tentative answer first, then gather only the information needed to verify it', correct: true },
        { label: 'Trust your intuition, decide quickly, and skip the verification step', correct: false },
        { label: 'Listen to your manager or senior leaders first, then align the data to their view', correct: false },
      ],
      explanation:
        'The approach is "tentative answer → targeted verification → revise." Exhaustive data gathering drowns you in information; intuition without verification skips the engine of the method; and starting with authority\'s view replaces your hypothesis with someone else\'s. The defining mark is that the hypothesis is testable — intuition alone is not.',
    },
    {
      type: 'explain',
      title: 'Three conditions for a good hypothesis',
      content:
        'A good hypothesis meets three conditions:\n\n[1. It must be verifiable]\n"The world is complex" -> too obvious to verify.\n"The main driver of the revenue drop is churn among women in their 20s" -> verifiable with data.\n\n[2. It must be specific]\n"We should strengthen marketing" -> too vague.\n"Lift Instagram CTR from 3% to 5% to grow monthly revenue 20%" -> specific.\n\n[3. It must lead to action]\n"The economy is bad, so revenue dropped" -> not within your control.\n"A 15% price cut on Product A will lift unit sales 1.5x" -> actionable.\n\nThe quality of your hypotheses determines the quality of your work.',
    },
    {
      type: 'quiz',
      question: 'Which of the following best satisfies the conditions for a "good hypothesis"?',
      options: [
        { label: 'Performance is bad because the economy is bad — nothing we can do', correct: false },
        { label: 'If we just try harder, revenue should rise — continue current efforts', correct: false },
        { label: 'Enterprise churn is driven by weak onboarding; a dedicated success manager will move churn from 30% to 15%', correct: true },
        { label: 'Our company has many problems and we need to fix them somehow', correct: false },
      ],
      explanation:
        'The correct option bundles cause, intervention, and a numeric target — verifiable and immediately actionable. The economy excuse blocks both verification and intervention; "try harder" lacks any measurable variable; "many problems" is too vague to start anywhere. Watch for plausible-sounding options that match the length of the right answer but are empty inside.',
    },
    {
      type: 'explain',
      title: 'The hypothesis -> verify cycle',
      content:
        'Hypothesis-driven thinking is not a one-shot process — it is a cycle:\n\n(1) Form a hypothesis\n  "Maybe our customer acquisition cost is too high?"\n\n(2) Design how to verify it\n  "Calculate CAC for the past six months and compare to industry average."\n\n(3) Gather data and check\n  "CAC is ¥15,000 vs. industry average ¥8,000 — about 2x. Hypothesis supported."\n\n(4) Refine and dig deeper\n  "Which channel has the highest CAC?" -> a new hypothesis.\n\nKey:\nA hypothesis being wrong is not a failure.\nLearning "it was wrong" is itself an important step forward.',
    },
    {
      type: 'quiz',
      question: 'You verified your hypothesis and it turned out to be wrong. What should you do next?',
      options: [
        { label: 'Start over from the original problem definition because everything is suspect', correct: false },
        { label: 'Assume the data collection was flawed and search for friendlier datasets', correct: false },
        { label: 'Analyze why it was wrong, fold the learning into a new hypothesis, and continue verifying', correct: true },
        { label: 'Conclude that hypothesis-driven thinking failed and pivot to bottom-up research', correct: false },
      ],
      explanation:
        'A failed hypothesis is information. Restarting from zero discards the learning, searching for nicer data is confirmation bias in disguise, and abandoning the method misunderstands that "hypothesis → verify → refine" is the core cycle. The cycle assumes you will be wrong sometimes — and uses those moments to sharpen the next hypothesis.',
    },
  ],
}

const hypothesisBuilding: LessonData = {
  id: 51,
  title: 'Building and Verifying Hypotheses',
  category: 'Hypothesis-Driven Thinking',
  steps: [
    {
      type: 'explain',
      title: 'Three approaches to forming hypotheses',
      content:
        'How do you actually come up with hypotheses? Three approaches:\n\n[1. Competing-hypothesis method]\nThink in terms of "A or B?"\nExample: "Is the revenue drop caused by price or by quality?"\n-> Form both hypotheses and verify them in parallel.\n\n[2. Structured-decomposition method]\nDecompose with a framework, then form hypotheses.\nExample: Revenue = Customers x Average ticket\n-> "Did the customer count drop?" "Did the average ticket drop?"\n\n[3. Analogy method]\nForm hypotheses from similar cases.\nExample: "Competitor A succeeded with a price cut -> maybe a price strategy works for us too?"\n-> Always check whether the underlying conditions are the same.',
    },
    {
      type: 'quiz',
      question: 'An e-commerce site\'s revenue dropped 15% MoM. What should you do FIRST under the structured-decomposition method?',
      options: [
        { label: 'Analyze all Google Analytics dimensions exhaustively to find anomalies', correct: false },
        { label: 'Decompose Revenue = Visits × CVR × Average Ticket and hypothesize which component dropped', correct: true },
        { label: 'Survey competitor pricing and promotions to find external explanations', correct: false },
        { label: 'Increase ad spend temporarily and observe whether revenue recovers', correct: false },
      ],
      explanation:
        'The structured-decomposition method centers on splitting the whole into components — the 3-variable identity lets you narrow the search instantly. Exhaustive GA analysis is the information-overload trap, competitor research can suggest hypotheses but doesn\'t locate your drop, and "spend money to learn" inverts the discipline of testing before investing.',
    },
    {
      type: 'explain',
      title: 'Designing the verification — what would prove the hypothesis?',
      content:
        'After forming a hypothesis, design "how would we verify this?"\n\nFramework for designing verification:\n\n[Hypothesis] Enterprise-customer churn is caused by poor support quality.\n\n[Required information]\n- Support usage history of churned customers\n- NPS (Net Promoter Score) of churned customers\n- Comparison data with retained customers\n\n[Decision criteria (set in advance)]\n- If churned customers have NPS at least 20pt below retained -> supports the hypothesis\n- If post-support churn rate exceeds 50% -> strongly supports it\n\nThe critical move: set the decision criteria before looking at the data.\nThis prevents you from later interpreting whatever you find as "supporting" the hypothesis.',
    },
    {
      type: 'quiz',
      question: 'What is the most important thing in verification design?',
      options: [
        { label: 'Gather as much data as possible to increase conclusion precision', correct: false },
        { label: 'Preferentially select data that demonstrates the hypothesis is true', correct: false },
        { label: 'Set the support/reject decision criteria BEFORE looking at any data', correct: true },
        { label: 'Consult experts to anchor the direction of the analysis', correct: false },
      ],
      explanation:
        'Pre-committing the criteria is the structural antidote to confirmation bias — the same logic as scientific experimental design. Gathering more data without criteria expands the confirming material; selecting only supporting data IS the bias; expert consultation outsources the verification entirely. "Decide what you would accept as evidence before you see it" is the bright-line rule.',
    },
    {
      type: 'explain',
      title: 'Use issue trees to structure hypotheses',
      content:
        'For complex problems, structuring hypotheses with an issue tree is effective.\n\nExample: "Why isn\'t our new service growing its user base?"\n\n├── Awareness problem?\n│   ├── Are we not reaching the target segment?\n│   └── Is the message not landing?\n├── Acquisition problem?\n│   ├── Is the landing-page CVR low?\n│   └── Is the price too high?\n└── Retention problem?\n    ├── Is the first-use experience bad?\n    └── Is there no reason to come back?\n\nEach leaf becomes a "verifiable hypothesis."\nPrioritize from the top — verify the highest-impact hypotheses first.',
    },
    {
      type: 'quiz',
      question: 'A restaurant\'s monthly revenue dropped 30%. In the issue tree below, what is the best hypothesis for the "?":\n\nRevenue drop\n├── Decline in customer count?\n│   ├── New competitor opened nearby?\n│   └── ?\n└── Decline in average ticket?',
      options: [
        { label: 'The food quality has dropped — repeat-customer driver', correct: false },
        { label: 'Google Maps rating dropped, reducing web-driven new customers', correct: true },
        { label: 'The economy is bad — sector-wide demand contraction', correct: false },
        { label: 'Employee morale is low — service quality impact', correct: false },
      ],
      explanation:
        'Under "decline in customer count" you need a specific, verifiable hypothesis about new-customer channels — Google Maps rating fits perfectly and is testable from review scores and visit trends. Food quality is a repeat-customer driver (wrong tree branch), the economy is a sector-wide story that does not explain this specific outlet, and morale is an abstract internal factor without channel specificity.',
    },
  ],
}

const hypothesisProblemSolving: LessonData = {
  id: 52,
  title: 'Hypothesis-Driven Problem Solving',
  category: 'Hypothesis-Driven Thinking',
  steps: [
    {
      type: 'explain',
      title: 'Practice: solving problems hypothesis-first',
      content:
        'Let us experience hypothesis-driven problem solving in a real business case.\n\n[Case]\nYou are the PM of a food delivery app.\nLast month, orders fell 20%. Identify the cause and propose a fix.\n\nFirst, form hypotheses:\n\nHypothesis A: Users are switching to competing apps (Uber Eats, etc.)\nHypothesis B: Delivery delays are eroding repeat orders\nHypothesis C: A price-sensitive cohort left when a promotion ended\n\nYou cannot verify all three at once, so start with the one that is highest-impact and easiest to verify.',
    },
    {
      type: 'quiz',
      question: 'Food delivery orders fell 20%. Of Hypothesis A (competitor switch), B (delivery delays), and C (promo ended), which should you verify first?',
      options: [
        { label: 'A — competitor analysis takes time but has the largest potential impact', correct: false },
        { label: 'C — matching the promo end date with the order-decline start date verifies it instantly', correct: true },
        { label: 'B — delivery time data exists internally but the impact is unclear', correct: false },
        { label: 'Verify all three in parallel to ensure comprehensive coverage', correct: false },
      ],
      explanation:
        'C is the ideal first target: lowest verification cost (date matching with in-house data) and easiest causal inference. A depends on external data and takes time; B has data but no impact estimate makes deep-dive risky; parallel verification scatters resources. The Quick & Dirty discipline is to knock down the most-likely + cheapest-to-test hypothesis first.',
    },
    {
      type: 'explain',
      title: 'The art of "Quick & Dirty" verification',
      content:
        'Perfect analysis is not required. Techniques for quickly verifying "Quick & Dirty":\n\n[1. The 80/20 rule]\n20% of the data tells you 80% of the story.\nExample: instead of analyzing every customer, look only at the top 20.\n\n[2. Triangulation]\nUse not one data source but three different angles.\nExample: revenue data + customer survey + sales-team interviews.\n\n[3. Minimum-viable-test verification]\nBefore a large rollout, try small.\nExample: before nationwide expansion, run a 2-week test in one store.\n\nThe reason consultants can produce hypotheses in the first week is not perfect data — it is the skill of Quick & Dirty verification.',
      visual: 'ThreePillarsDiagram',
      visualProps: {
        sectionLabel: 'Quick & Dirty — 3 verification techniques',
        pillars: [
          { icon: '80', title: '80/20 rule', body: '20% of data tells 80% of story. Look only at the top 20 customers, not every customer.' },
          { icon: '△', title: 'Triangulation', body: 'Three different angles instead of one source. Revenue + survey + sales interviews.' },
          { icon: 'MVP', title: 'Minimum-viable test', body: 'Before nationwide rollout, run a 2-week test in one store.' },
        ],
        hint: 'Consultants produce hypotheses in week 1 not from perfect data but from Quick & Dirty skill',
      },
    },
    {
      type: 'quiz',
      question: 'Which best describes the "Quick & Dirty verification" mindset?',
      options: [
        { label: 'Data accuracy does not matter — just throw out a conclusion fast', correct: false },
        { label: 'Without waiting for perfect data, form a directional view from limited information', correct: true },
        { label: 'Speed matters, so skip the verification step entirely', correct: false },
        { label: 'Ask your boss or an expert to produce a quick conclusion for you', correct: false },
      ],
      explanation:
        '"Quick & Dirty" trades depth for speed but never trades away verification itself — it is "efficiently directional," not "sloppy." Skipping verification ("just decide") and outsourcing to authority ("ask the boss") are common misunderstandings that strip the discipline out of the method.',
    },
    {
      type: 'explain',
      title: 'Day 1 Answer — have an answer from day one',
      content:
        'In the consulting world there is a concept called the "Day 1 Answer."\n\nOn the first day of a project, with very limited information, you produce a tentative answer.\n\n"What? You have not investigated anything yet?"\n-> Exactly — that is why it is a hypothesis.\n\nWhy Day 1 Answer works:\n- The team aligns on "what we should verify"\n- Investigation does not drift\n- The client sees value early\n\nCaveats:\n- Don\'t cling to the Day 1 Answer. Update it freely as evidence comes in\n- State that it is a "hypothesis." Distinguish it from a conclusion\n- Marshal experience, industry knowledge, and analogies to make it as accurate as possible\n\nPeople who can produce a Day 1 Answer = people who work fast.',
    },
    {
      type: 'quiz',
      question: 'Which is correct about the Day 1 Answer?',
      options: [
        { label: 'The day-1 answer should be locked in as the team\'s committed position', correct: false },
        { label: 'You should not produce any answer until thorough research is complete', correct: false },
        { label: 'Produce a tentative answer from limited information and refine it as evidence comes in', correct: true },
        { label: 'Tell the client nothing about the answer until verification is fully complete', correct: false },
      ],
      explanation:
        'A Day 1 Answer is "tentative → verify → refine" by design — never final, never delayed until you have perfect data. Hiding it from the client defeats the whole point (early alignment). "Produce an answer early" and "lock in an answer early" are different things and the common confusion is collapsing them.',
    },
    {
      type: 'think',
      question: 'You are a Customer Success rep at a SaaS company. Last month, churn suddenly doubled. As a Day 1 Answer, what hypotheses do you form, and what do you check in the first 24 hours?',
      hint: 'Combine "hypothesis-driven" + "Quick & Dirty verification." Try generating at least three hypotheses.',
      modelAnswer: '[Set of hypotheses (example)]\nHypothesis A: Last month\'s big update made the product harder to use -> users left\nHypothesis B: A competitor\'s pricing campaign drove customers to switch\nHypothesis C: Churned users share something in common (industry, plan, usage frequency)\n\n[What to check in 24 hours]\n(1) Pull churned-user activity logs (last login, feature usage)\n(2) Correlate the update release date with the churn dates\n(3) Aggregate the churn-reason survey (if available)\n\n-> Once data is in, start with the hypothesis that is cheapest to verify.',
      points: [
        'Generate multiple hypotheses, then prioritize by "verification cost x impact"',
        'Churn data, logs, and surveys are already in-house -> Quick & Dirty first',
        'Setting a "first 24 hours" timebox makes the actions concrete',
      ],
    },
  ],
}


// ========================================
// Lesson 70: Designing hypothesis verification
// ========================================
const hypothesisValidation: LessonData = {
  id: 70,
  title: 'Designing Hypothesis Verification',
  category: 'Hypothesis-Driven Thinking',
  steps: [
    {
      type: 'explain',
      title: 'Conditions of a good hypothesis',
      content:
        'Forming a hypothesis and forming a "verifiable hypothesis" are different skills.\n\n"Revenue should be growing" is not a hypothesis.\n"For our 20-something female campaign, the 30-day first-purchase rate will rise from the current 8% to 12%" — that is a hypothesis.\n\nThree conditions of a good hypothesis:\n\n(1) Falsifiable (often used interchangeably with "verifiable" in business)\nIt is clear what would happen if the hypothesis were correct, and what would happen if it were wrong.\n\n(2) Specific\nWho, what, and how much will change can be expressed in numbers.\n\n(3) Actionable\nIt is decided what we will do if the hypothesis holds, and what we will stop doing if it does not.\n\nA hypothesis that does not satisfy these three conditions cannot drive a decision even after verification.',
    },
    {
      type: 'quiz',
      question: 'What is wrong with the hypothesis "our product seems to be providing value to users"?',
      options: [
        { label: 'The first-person subject "our" reduces neutrality', correct: false },
        { label: 'It lacks falsifiability, numeric criteria, AND action linkage — verification is impossible', correct: true },
        { label: 'Asking users directly would yield the same information for cheaper', correct: false },
        { label: 'The hedge word "seems to be" makes the statement vague', correct: false },
      ],
      explanation:
        'The statement fails all three good-hypothesis tests: falsifiable, specific, actionable. Subject choice and hedge-word style are surface critiques that miss the structural problem. "Just ask users" is a method suggestion, not a hypothesis critique. Making it numeric ("more than 40% of users open the app weekly") is what unlocks verification.',
    },
    {
      type: 'explain',
      title: 'Minimum-viable verification (MVT)',
      content:
        'When verifying a hypothesis, do not commit large resources upfront.\n\nMinimum Viable Test (MVT) thinking:\n\nDesign the smallest possible test that confirms only the core of the hypothesis.\n\nExample: you want to verify "the new onboarding screen will increase user retention."\n\nBad verification: rebuild every screen and roll out to all users.\nGood verification: show the new screen to only 10% of new users and compare 1-week retention.\n\nFour steps to verification design:\n1. Identify the single Key Assumption you want to verify.\n2. Define the metric (KPI) you can observe if it is true.\n3. Build the test with the minimum possible resources.\n4. Set in advance the timeline and the criteria for reaching a conclusion.',
    },
    {
      type: 'quiz',
      question: 'Which is the lowest-cost way to verify "a 10% price cut raises conversion by 20%"?',
      options: [
        { label: 'Cut prices 10% across all products and compare monthly revenue before/after', correct: false },
        { label: 'Cut prices 10% on a subset of categories only, and compare same-period conversion vs other categories', correct: true },
        { label: 'Compute the historical correlation between price changes and conversion rate', correct: false },
        { label: 'Ask users via survey: "would you buy if the price were 10% lower?"', correct: false },
      ],
      explanation:
        'Cutting only some categories with same-period comparison is essentially an A/B test — near-causal evidence at minimal cost. Cutting everything at once mixes in confounders; historical correlation cannot establish causation; survey intent diverges from actual purchase behavior (the classic "say-do gap"). The discipline is to design for behavior data, not declared intent.',
    },
  ],
}

export const hypothesisLessonMapEn: Record<number, LessonData> = {
  50: hypothesisIntro,
  51: hypothesisBuilding,
  52: hypothesisProblemSolving,
  70: hypothesisValidation,
}
