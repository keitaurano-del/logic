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
        { label: 'Gather all the data, then form a conclusion', correct: false },
        { label: 'State a tentative answer first, then gather information to verify it', correct: true },
        { label: 'Decide by intuition without verifying', correct: false },
        { label: 'Listen to your manager\'s opinion first, then gather data', correct: false },
      ],
      explanation:
        'The hypothesis-driven approach is "form a tentative answer (hypothesis) first, then efficiently gather only the information you need to verify it." Pure intuition is not enough — the verification process is essential.',
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
        { label: 'Performance is bad because the economy is bad', correct: false },
        { label: 'If we just try harder, revenue should rise', correct: false },
        { label: 'The driver of high enterprise-customer churn is weak onboarding; assigning a dedicated success manager will reduce churn from 30% to 15%', correct: true },
        { label: 'Our company has many problems', correct: false },
      ],
      explanation:
        'A good hypothesis is specific, verifiable, and actionable. The "enterprise-customer churn..." statement contains a cause, an intervention, and a numeric target — you can move directly to verification.',
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
        { label: 'Start over from scratch because the hypothesis was wrong', correct: false },
        { label: 'Assume the data is wrong and look for friendlier data', correct: false },
        { label: 'Analyze why the hypothesis was wrong, form a new one, and continue verifying', correct: true },
        { label: 'Conclude that hypothesis-driven thinking does not work and switch to bottom-up research', correct: false },
      ],
      explanation:
        'Even when a hypothesis is wrong, analyzing "why was it wrong?" is a major source of learning. You then refine the hypothesis and run the next cycle. Hypothesis-driven thinking is "hypothesis -> verify -> refine," repeated.',
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
        { label: 'Immediately analyze all of Google Analytics', correct: false },
        { label: 'Decompose revenue into Visits x Conversion Rate x Average Ticket and form hypotheses about which dropped', correct: true },
        { label: 'Check competitor pricing', correct: false },
        { label: 'Increase ad spend and see what happens', correct: false },
      ],
      explanation:
        'In the structured-decomposition method, first split revenue into its components. With "Revenue = Visits x CVR x Average Ticket," you can form specific hypotheses like "Did visits fall?" or "Did CVR fall?".',
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
        { label: 'Gathering as much data as possible', correct: false },
        { label: 'Selecting only data that proves the hypothesis correct', correct: false },
        { label: 'Setting the decision criteria before looking at the data', correct: true },
        { label: 'Asking experts for their opinions', correct: false },
      ],
      explanation:
        'Setting the criteria in advance prevents confirmation bias (the tendency to only collect data that flatters your hypothesis). It is the same principle as scientific experimental design.',
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
        { label: 'The food got worse', correct: false },
        { label: 'Google Maps rating dropped, reducing web-driven new customers', correct: true },
        { label: 'The economy is bad', correct: false },
        { label: 'Employee morale is low', correct: false },
      ],
      explanation:
        'A sub-hypothesis under "decline in customer count" should be a specific, verifiable hypothesis about new-customer inflow channels. "Google Maps rating drop -> fewer new customers" can be verified with actual review scores and visit trends.',
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
        { label: 'A: Competitor analysis takes time but the impact is large', correct: false },
        { label: 'C: You can verify by simply matching the promo end date against the order-decline start date', correct: true },
        { label: 'B: Delivery time data exists internally, but the impact is unclear', correct: false },
        { label: 'Verify all three simultaneously', correct: false },
      ],
      explanation:
        'Hypothesis C can be initially verified just by matching the "promo end date" with the "start date of the order decline," and the data is already in-house. The rule is to start with hypotheses that are cheap to verify and easy to causally test.',
    },
    {
      type: 'explain',
      title: 'The art of "Quick & Dirty" verification',
      content:
        'Perfect analysis is not required. Techniques for quickly verifying "Quick & Dirty":\n\n[1. The 80/20 rule]\n20% of the data tells you 80% of the story.\nExample: instead of analyzing every customer, look only at the top 20.\n\n[2. Triangulation]\nUse not one data source but three different angles.\nExample: revenue data + customer survey + sales-team interviews.\n\n[3. Minimum-viable-test verification]\nBefore a large rollout, try small.\nExample: before nationwide expansion, run a 2-week test in one store.\n\nThe reason consultants can produce hypotheses in the first week is not perfect data — it is the skill of Quick & Dirty verification.',
    },
    {
      type: 'quiz',
      question: 'Which best describes the "Quick & Dirty verification" mindset?',
      options: [
        { label: 'Data accuracy doesn\'t matter, just throw out a conclusion', correct: false },
        { label: 'Without waiting for perfect data, quickly form a directional view from limited information', correct: true },
        { label: 'Speed matters, so skip verification altogether', correct: false },
        { label: 'Ask your boss to reach a quick conclusion', correct: false },
      ],
      explanation:
        '"Quick & Dirty" is not "sloppy" — it is "efficiently directional with limited data." By using initial verification to confirm direction and then deepening only the promising hypotheses, you raise overall efficiency.',
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
        { label: 'Whatever you say on day 1 should be the final conclusion', correct: false },
        { label: 'You should not produce an answer until you have done thorough research', correct: false },
        { label: 'Produce a tentative answer from limited information and refine it as you verify', correct: true },
        { label: 'Tell the client nothing until verification is complete', correct: false },
      ],
      explanation:
        'The Day 1 Answer is by definition tentative and is expected to be revised as you verify. The point is to have a hypothesis early so that investigation efficiency and decision speed both go up.',
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
        { label: 'The subject "we" is unclear', correct: false },
        { label: 'It is not falsifiable, has no numeric criteria, and does not lead to action — so it cannot be verified', correct: true },
        { label: 'You can find out just by asking users directly', correct: false },
        { label: 'The vague phrasing "seems to be"', correct: false },
      ],
      explanation:
        '"Seems to be providing value" gives you no way to know what counts as right or wrong — it is unfalsifiable. Only when you make it numeric (e.g., "more than 40% of all users use the app at least once a week") can you verify it.',
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
        { label: 'Cut prices 10% on all products and compare monthly revenue', correct: false },
        { label: 'Cut prices 10% only on a subset of categories, and during the same period compare conversion against the other categories', correct: true },
        { label: 'Compute the historical correlation between price and conversion rate', correct: false },
        { label: 'Ask users in a survey, "would you buy if it were 10% cheaper?"', correct: false },
      ],
      explanation:
        'Cutting prices in only some categories and comparing same-period conversion against the other categories gives you a near-causal conclusion at minimal cost. Cutting all prices at once mixes in too many other factors, historical correlation cannot establish causation, and "would you buy?" surveys diverge from actual purchase behavior.',
    },
  ],
}

export const hypothesisLessonMapEn: Record<number, LessonData> = {
  50: hypothesisIntro,
  51: hypothesisBuilding,
  52: hypothesisProblemSolving,
  70: hypothesisValidation,
}
