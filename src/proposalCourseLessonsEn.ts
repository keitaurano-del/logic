/**
 * Proposal Writing Course: A practical course refined with hypothesis thinking and verification
 * SCRUM-170-177 (Lesson IDs: 82-88)
 * English version
 */
import type { LessonData } from './lessonData'

// ── Lesson 82: Course intro ─────────────────────────────────────────
const proposalIntro: LessonData = {
  id: 82,
  title: 'Course intro — a proposal is a "thinking artifact"',
  category: 'Proposal Writing',
  steps: [
    {
      type: 'explain',
      title: 'Understand what a proposal really is',
      content: 'A proposal is not a "document-creation task."\nIt is a thinking artifact — the output of finding an issue, forming a hypothesis, testing it, and shaping the action.\n\nIn this course we train the thinking process for assembling proposal content, not the techniques for making slides look pretty.',
    },
    {
      type: 'explain',
      title: 'What "consultant-style" means',
      content: 'Great proposals share one trait: hypothesis-first thinking.\n\nBefore gathering information, form a hypothesis ("isn\'t it like this?") and deepen your thinking by verifying it.\n\nThe hypothesis → research → verification → update cycle is what raises proposal quality.',
    },
    {
      type: 'quiz',
      question: 'What matters most when creating a proposal?',
      options: [
        { label: 'The visual design and polish of the slides', correct: false },
        { label: 'The process of forming a hypothesis and verifying it', correct: true },
        { label: 'A thick stack of supporting data exhibits', correct: false },
        { label: 'Polite, carefully formal language for the client', correct: false },
      ],
      explanation: 'A proposal\'s value lies in the process. Proposals that pass through hypothesis → research → verification gain stronger logic and persuasive force. Options 1, 3, and 4 are all surface polish — improving them does not improve the core argument.',
    },
    {
      type: 'explain',
      title: 'What you\'ll gain from this course',
      content: 'Form a hypothesis before research begins\nUse hypothesis verification to raise proposal quality\nProduce solid proposals even on unfamiliar topics\nLogically connect issue framing to action proposals\n\nSeven lessons total. Each lesson includes exercises so you can internalize the patterns of thinking.',
    },
    {
      type: 'quiz',
      question: 'Which describes the "hypothesis-first" approach correctly?',
      options: [
        { label: 'Gather a massive data set first, then start thinking', correct: false },
        { label: 'Begin field research without any explicit hypothesis', correct: false },
        { label: 'Form an initial hypothesis, then research and verify', correct: true },
        { label: 'Execute the client\'s stated requests as-is without question', correct: false },
      ],
      explanation: '"Hypothesis-first" forms a hypothesis before researching, focusing the investigation and producing deep insight efficiently. Option 1 inflates time and cost, option 2 lacks focus and goes nowhere, option 4 is the order-taker trap.',
    },
  ],
}

// ── Lesson 83: Foundations of hypothesis thinking ────────────────────────
const proposalHypothesis: LessonData = {
  id: 83,
  title: 'Foundations of hypothesis thinking — 5 Whys and separating issues',
  category: 'Proposal Writing',
  steps: [
    {
      type: 'explain',
      title: 'What a hypothesis is',
      content: 'A hypothesis is "a candidate answer derived from current information that should be tested."\n\nWhat matters is not "producing the right hypothesis" but "rapidly producing a testable one."\n\nEven if a hypothesis is wrong, testing it moves you toward the right direction.',
    },
    {
      type: 'explain',
      title: 'Using 5 Whys analysis',
      content: 'To dig into an issue, repeat "why?"\n\nExample: "Sales are falling"\n→ Why? "New customer count dropped"\n→ Why? "Brand awareness declined"\n→ Why? "Social media posting decreased"\n\nThe closer you get to root cause, the more precisely your action can target it.',
    },
    {
      type: 'quiz',
      question: 'A restaurant\'s customer count is declining. What is the most appropriate first hypothesis to form?',
      options: [
        { label: 'A rival opened nearby and is pulling our customers', correct: true },
        { label: 'Wait until detailed data is gathered before deciding', correct: false },
        { label: 'Start posting on social media and see what happens', correct: false },
        { label: 'Lowering prices will surely solve it — execute now', correct: false },
      ],
      explanation: '"A rival opened nearby" is a concrete, testable hypothesis. Option 2 inverts hypothesis-first (you never move). Options 3 and 4 are actions, not hypotheses — picking an action without identifying the cause is the classic backward order.',
    },
    {
      type: 'explain',
      title: 'Separating issue, cause, and action',
      content: 'Three things that often get confused:\n\nIssue: the problem to solve (e.g., 30% sales drop)\nCause: why the issue is happening (e.g., repeat customer churn)\nAction: a measure that resolves the cause (e.g., launch a loyalty program)\n\nThinking in this order — issue → cause → action — keeps you from picking off-target actions.',
    },
    {
      type: 'quiz',
      question: 'You have an issue: "customer satisfaction is low." What\'s the right next step?',
      options: [
        { label: 'Immediately execute service-improvement initiatives and test', correct: false },
        { label: 'Form a hypothesis about the cause, then investigate', correct: true },
        { label: 'Design and distribute a survey without a hypothesis', correct: false },
        { label: 'Copy a competitor\'s popular service as-is into your own', correct: false },
      ],
      explanation: 'Once you identify an issue, first form a hypothesis about its cause. Acting without a cause leads to off-target initiatives, surveys without a hypothesis return mush, and borrowing competitor moves ignores your context — all classic failure patterns.',
    },
  ],
}

// ── Lesson 84: Research design ─────────────────────────────────────────
const proposalResearch: LessonData = {
  id: 84,
  title: 'Research design — what to verify to test the hypothesis',
  category: 'Proposal Writing',
  steps: [
    {
      type: 'explain',
      title: 'Frame the question before researching',
      content: 'Once you have a hypothesis, the next step is "what do I need to find out to test it?"\n\nWrong: "Just do market research."\nRight: "If hypothesis A is true, X data should rise. So I\'ll measure X."\n\nResearch without purpose wastes time and budget.',
    },
    {
      type: 'explain',
      title: 'Understand information source types',
      content: 'Research information comes in two big types.\n\nPrimary: data you collect yourself (interviews, surveys, observation)\nSecondary: existing reports, statistics, papers\n\nFor hypothesis testing, sweep the landscape with secondary sources first; dig deeper with primary sources only when needed. That\'s the efficient path.',
    },
    {
      type: 'quiz',
      question: 'To test the hypothesis "young people\'s café usage has declined," which research is most appropriate?',
      options: [
        { label: 'Collect overall café industry sales data without age breakdown', correct: false },
        { label: 'Investigate young people\'s dining-out spend and use of café alternatives', correct: true },
        { label: 'Count café-related social media posts as a proxy signal', correct: false },
        { label: 'Look up overall coffee consumption (including at-home)', correct: false },
      ],
      explanation: 'Verify a hypothesis by going directly at the target (young people) and the alternative options. Option 1 can\'t isolate the age segment, option 3 is a proxy too far from the question, and option 4 mixes in at-home use, missing the point of "café usage."',
    },
    {
      type: 'explain',
      title: 'The research design sheet',
      content: 'When designing research, organize four things:\n\n1. Hypothesis: what to test\n2. Required information: data needed to support or reject the hypothesis\n3. Sources: where you\'ll obtain it\n4. Decision criteria: what result counts as supporting the hypothesis\n\nClarifying these four before starting reduces waste.',
    },
    {
      type: 'quiz',
      question: 'Why decide on decision criteria in advance during research design?',
      options: [
        { label: 'To lower data collection cost and effort', correct: false },
        { label: 'To prevent confirmation bias when interpreting results', correct: true },
        { label: 'To make the final client report flow more smoothly', correct: false },
        { label: 'To shorten the overall research timeline', correct: false },
      ],
      explanation: 'Setting criteria up front blocks "seeing only the results you want." Options 1 (cost) and 4 (timeline) are at best side effects, option 3 is downstream consequence — none touch the core purpose of bias prevention.',
    },
  ],
}

// ── Lesson 85: Hypothesis verification process ─────────────────────────
const proposalVerification: LessonData = {
  id: 85,
  title: 'Hypothesis verification process — read the data and update the hypothesis',
  category: 'Proposal Writing',
  steps: [
    {
      type: 'explain',
      title: 'Hypotheses are meant to be changed',
      content: 'Many people think "changing your hypothesis = losing." It\'s the opposite.\n\nRevising and updating hypotheses based on research findings IS the essence of hypothesis thinking.\n\nUpdate patterns:\nSupported → dig deeper as-is\nPartially modified → re-test the modified hypothesis\nRejected → switch to a different hypothesis',
    },
    {
      type: 'quiz',
      question: 'You hypothesized "the cause of new customer decline is lower social media awareness." But research showed awareness was unchanged and repeat customer churn had increased. What\'s the next action?',
      options: [
        { label: 'Stick with the original hypothesis and propose a social media boost', correct: false },
        { label: 'Update to "repeat customer churn is the main issue" and re-investigate', correct: true },
        { label: 'Ignore the findings and proceed with the original plan', correct: false },
        { label: 'Forming new hypotheses wastes time — push a conclusion through', correct: false },
      ],
      explanation: 'When a hypothesis is rejected, recast the new fact (churn) as the new hypothesis — that\'s the verification loop. Option 1 clings to a dead hypothesis, option 3 ignores reality, and option 4 is the sunk-cost trap ("we already invested, force a conclusion").',
    },
    {
      type: 'explain',
      title: 'Be careful about interpreting information',
      content: 'When looking at data, separate "facts" from "interpretation."\n\nFact: sales down 15% YoY\nInterpretation 1: prices are too high\nInterpretation 2: the overall market is shrinking\nInterpretation 3: competitors stole customers\n\nThe same data supports multiple interpretations. Choose the one most consistent with your hypothesis.',
    },
    {
      type: 'quiz',
      question: 'You see the data "20% YoY decline in usage among twenty-somethings." Which is the correct hypothesis-verification approach?',
      options: [
        { label: 'Immediately launch a marketing campaign targeting twenty-somethings', correct: false },
        { label: 'Form multiple "why" hypotheses and gather evidence for/against each', correct: true },
        { label: 'Send a survey to every twenty-something and wait for full responses', correct: false },
        { label: 'Treat this data as low-priority and focus on other themes', correct: false },
      ],
      explanation: 'Data only says "something is happening." Multiple "why" hypotheses tested in parallel is the verification process. Option 1 acts without a hypothesis, option 3 surveys without a hypothesis (mountains of unfiltered data), option 4 ignores an important signal.',
    },
    {
      type: 'explain',
      title: 'Keep asking "So What?"',
      content: 'Once you collect information, build the habit of asking "So What?"\n\nInfo: "Market size grows 5% annually."\n→ So What? "This may be the time to enter."\n→ So What? "But competitors will also increase."\n→ So What? "We should lead in a differentiated area."\n\nA chain of "So What?" strengthens the logic of the proposal.',
    },
  ],
}

// ── Lesson 86: Issue structuring and action design ────────────────────
const proposalStructure: LessonData = {
  id: 86,
  title: 'Issue structuring and action design — issue maps and action design',
  category: 'Proposal Writing',
  steps: [
    {
      type: 'explain',
      title: 'Organize issues with a tree structure',
      content: 'When multiple issues are tangled, organize with a logic tree.\n\nIssue tree example:\nSales decline\n├── Decline in new customers\n│   ├── Lower brand awareness\n│   └── Switching to competitors\n└── Decline in repeat customers\n    ├── Quality dissatisfaction\n    └── Loss of price competitiveness\n\nA tree shows "where the highest-leverage solve point is."',
    },
    {
      type: 'quiz',
      question: 'What\'s the main benefit of using an issue tree?',
      options: [
        { label: 'All issues can be solved at the same priority level', correct: false },
        { label: 'The full picture and action priorities become visible', correct: true },
        { label: 'Client-facing communication automatically becomes simpler', correct: false },
        { label: 'Research effort and time required are reduced overall', correct: false },
      ],
      explanation: 'A tree separates root issues from derivative ones, showing where solving has biggest impact and revealing priorities. Option 1 is the "treat everything equally" trap that prevents focus, option 3 is a side effect, option 4 is wrong (trees usually deepen the research agenda).',
    },
    {
      type: 'explain',
      title: 'Action design principles',
      content: 'Actions must logically connect along the line "issue → cause → action."\n\nGood:\nIssue: repeat customer decline → Cause: quality dissatisfaction → Action: strengthen quality control process\n\nBad:\nIssue: repeat customer decline → Action: ramp up social media advertising (no link to cause)\n\nWhen asked "why this action?" you must be able to answer.',
    },
    {
      type: 'quiz',
      question: 'For the issue "long customer wait times," which action is most logical?',
      options: [
        { label: 'Improve staff customer-service manners through training', correct: false },
        { label: 'Distribute coupons to encourage more customer visits', correct: false },
        { label: 'Analyze the process, identify bottlenecks, and improve them', correct: true },
        { label: 'Broadcast real-time crowding status on social media', correct: false },
      ],
      explanation: 'The cause of "long wait times" is process bottlenecks. Option 1 raises satisfaction but doesn\'t shorten waits, option 2 actually increases visits, option 4 manages expectations rather than the wait itself. Only option 3 addresses the cause directly.',
    },
    {
      type: 'explain',
      title: 'Evaluate actions on feasibility and impact',
      content: 'When multiple actions emerge, evaluate them on two axes.\n\nImpact: how much it contributes to solving the issue\nFeasibility: can it be done given cost, time, and resources\n\nClassify on a 2×2 grid for clear priority:\n- High impact × Easy → execute immediately (Quick Win)\n- High impact × Hard → tackle medium-to-long term\n- Low impact × Easy → do if time permits\n- Low impact × Hard → drop',
    },
  ],
}

// ── Lesson 87: Proposal outline creation ───────────────────────────────
const proposalOutline: LessonData = {
  id: 87,
  title: 'Proposal outline — storyline and slide outlines',
  category: 'Proposal Writing',
  steps: [
    {
      type: 'explain',
      title: 'Design the storyline',
      content: 'In a proposal, the logical flow (storyline) is everything.\n\nBasic structure:\n1. Current state and issue (As-Is)\n2. Cause of the issue (Why)\n3. Target state (To-Be)\n4. Proposed action (How)\n5. Expected impact (So What)\n\nThis flow leads the reader through "understanding → conviction → action."',
    },
    {
      type: 'quiz',
      question: 'In a proposal storyline, which part explains "why solve this problem now"?',
      options: [
        { label: 'Current state and issue (As-Is) alone shows the problem', correct: false },
        { label: 'Cause of the issue (Why) alone shows the causal chain', correct: false },
        { label: 'The combination of As-Is and Why creates the urgency', correct: true },
        { label: 'Proposed action (How) — explain urgency alongside the solution', correct: false },
      ],
      explanation: '"Why now" emerges when "what is wrong (As-Is)" combines with "why it\'s wrong (Why)." Either alone reads as "issue exists but not urgent" or "cause is known but impact is unclear." Option 4 mixes urgency into the solution slides, where it tends to get lost.',
    },
    {
      type: 'explain',
      title: 'Apply the Pyramid Principle',
      content: 'The "lead with the conclusion" Pyramid Principle is the foundation of proposals.\n\nTop-Down (conclusion first): conclusion → reason 1, reason 2, reason 3\n→ Used in most business proposals\n\nBottom-Up (reasons first): reason 1, reason 2, reason 3 → conclusion\n→ Suited for data analysis reports\n\nProposals respect the reader\'s time by leading with the conclusion.',
    },
    {
      type: 'quiz',
      question: 'What\'s the most appropriate content for an Executive Summary (the opening summary page)?',
      options: [
        { label: 'Detailed data and a walk-through of the analytical process', correct: false },
        { label: 'A summary of background, key issues, actions, and expected impact', correct: true },
        { label: 'Company profile and historical track record introduction', correct: false },
        { label: 'A list of research methods and underlying information sources', correct: false },
      ],
      explanation: 'The exec summary aims to let the reader "understand the whole in 5 minutes." Compress problem, issue, action, and effect into 1-2 pages. Options 1 and 4 belong in the appendix, option 3 is sales-pitch content that doesn\'t earn the opening slot.',
    },
    {
      type: 'explain',
      title: 'One slide, one message',
      content: 'Each slide should carry exactly ONE claim (message).\n\nMake the slide title the message itself.\n\n"Market environment analysis" (topic title)\n"The market is maturing; competitors without differentiation will be culled" (message title)\n\nThe ideal proposal lets you grasp the entire story by reading just the message titles.',
    },
  ],
}

// ── Lesson 88: Proposal exercise ─────────────────────────────────────
const proposalPractice: LessonData = {
  id: 88,
  title: 'Proposal exercise — end-to-end case practice',
  category: 'Proposal Writing',
  steps: [
    {
      type: 'explain',
      title: 'Case: Sales recovery for a regional supermarket',
      content: 'Case setup\nA mid-sized regional supermarket "Company A." Sales have declined 15% per year for three years.\nTwo large discount stores opened nearby.\nStaff interviews indicate "regular customers visit less often."\n\nIn this case, practice the hypothesis → research → verification → proposal process.',
    },
    {
      type: 'quiz',
      question: 'Which is the most appropriate "initial hypothesis"?',
      options: [
        { label: 'Loss of price competitiveness pushes price-sensitive customers to the competitor', correct: true },
        { label: 'Poor staff customer service is dragging satisfaction down', correct: false },
        { label: 'Insufficient social media marketing limits young-customer awareness', correct: false },
        { label: 'Limited product assortment is the primary blocker', correct: false },
      ],
      explanation: '"Discount stores opened" + "regular customers visit less" most logically point to a price-competitiveness issue. Options 2-4 are generic plausible causes but cannot be derived from the given facts — they\'re guesses without anchor.',
    },
    {
      type: 'explain',
      title: 'Designing the research',
      content: 'To test the initial hypothesis "loss of price competitiveness," we need:\n\n1. Price comparison on key items vs. competitors\n2. Customer purchase history (avg. ticket, visit frequency trend)\n3. Interviews with churned customers (why they left)\n4. Local population and purchasing-power changes (market environment)\n\nItems 2 and 3 are direct evidence.',
    },
    {
      type: 'quiz',
      question: 'Research finds "price gap is within 5%, and regular customers actually prioritize local products and freshness." How should you update the hypothesis?',
      options: [
        { label: 'Maintain the price-competitiveness hypothesis and push price cuts', correct: false },
        { label: 'Update to "local-product and freshness appeal may be eroding"', correct: true },
        { label: 'Decide the research must be wrong and rerun the study', correct: false },
        { label: 'Conclude non-price factors are unimportant and end the inquiry', correct: false },
      ],
      explanation: 'When research rejects the hypothesis, update to the new fact. Option 1 clings to the old hypothesis, option 3 dodges the result by doubting the data, option 4 cherry-picks results to preserve the original belief — classic confirmation bias.',
    },
    {
      type: 'explain',
      title: 'Assembling the proposal',
      content: 'Build the proposal around the updated hypothesis "we are not maintaining freshness and local-product appeal."\n\nIssue: Decline in regular customer visit frequency\nCause: Reduced appeal of local products and freshness\nActions:\n1. Strengthen direct-from-farm sourcing (direct contracts with local farms)\n2. Revisit freshness control processes\n3. POP and communications that lead with "the local taste"\n\nExpected impact: Recovery of regular customer visit frequency → 5% annual sales improvement (year 1)',
    },
    {
      type: 'quiz',
      question: 'In the final proposal, which storyline order is most appropriate?',
      options: [
        { label: 'Action → expected impact → current issue → cause', correct: false },
        { label: 'Current state / issue → cause → target state → action → expected impact', correct: true },
        { label: 'Cause → action → current state → expected impact', correct: false },
        { label: 'Expected impact → action → current issue → cause', correct: false },
      ],
      explanation: 'The proposal golden rule: issue (what\'s wrong) → cause (why) → target state (what should be) → action (how) → expected impact (why it\'s worth it). Options 1 and 4 front-load the conclusion before justifying it; option 3 jumps straight to cause without setting the problem context.',
    },
  ],
}

export const proposalCourseLessonMapEn: Record<number, LessonData> = {
  82: proposalIntro,
  83: proposalHypothesis,
  84: proposalResearch,
  85: proposalVerification,
  86: proposalStructure,
  87: proposalOutline,
  88: proposalPractice,
}
