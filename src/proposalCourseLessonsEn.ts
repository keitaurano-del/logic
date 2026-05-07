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
      content: 'A proposal is not a "document-creation task."\nIt is a **thinking artifact** — the output of finding an issue, forming a hypothesis, testing it, and shaping the action.\n\nIn this course we train the **thinking process for assembling proposal content**, not the techniques for making slides look pretty.',
    },
    {
      type: 'explain',
      title: 'What "consultant-style" means',
      content: 'Great proposals share one trait: hypothesis-first thinking.\n\nBefore gathering information, form a hypothesis ("isn\'t it like this?") and deepen your thinking by verifying it.\n\nThe **hypothesis → research → verification → update** cycle is what raises proposal quality.',
    },
    {
      type: 'quiz',
      question: 'What matters most when creating a proposal?',
      options: [
        { label: 'The visual design of the slides', correct: false },
        { label: 'The process of forming and verifying a hypothesis', correct: true },
        { label: 'A thick stack of supporting data', correct: false },
        { label: 'Polite, formal language for the client', correct: false },
      ],
      explanation: 'A proposal\'s value lies in the process. A proposal that has gone through hypothesis → research → verification has stronger logic and more persuasive force. Design and politeness are secondary.',
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
        { label: 'Gather a large amount of data first, then think', correct: false },
        { label: 'Begin field research without any hypothesis', correct: false },
        { label: 'Form an initial hypothesis, then research and verify', correct: true },
        { label: 'Execute the client\'s requests as-is', correct: false },
      ],
      explanation: '"Hypothesis-first" means forming a hypothesis before researching. This focuses your investigation and produces deep insight efficiently.',
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
        { label: 'A rival opened nearby', correct: true },
        { label: 'Wait for detailed data before judging', correct: false },
        { label: 'Just start posting on social media', correct: false },
        { label: 'Lowering prices will solve it', correct: false },
      ],
      explanation: '"A rival opened nearby" is a concrete, testable hypothesis. The principle is: form hypotheses in a verifiable shape. Waiting for data is not hypothesis thinking, and social media or price cuts are actions, not hypotheses.',
    },
    {
      type: 'explain',
      title: 'Separating issue, cause, and action',
      content: 'Three things that often get confused:\n\n**Issue**: the problem to solve (e.g., 30% sales drop)\n**Cause**: why the issue is happening (e.g., repeat customer churn)\n**Action**: a measure that resolves the cause (e.g., launch a loyalty program)\n\nThinking in this order — issue → cause → action — keeps you from picking off-target actions.',
    },
    {
      type: 'quiz',
      question: 'You have an issue: "customer satisfaction is low." What\'s the right next step?',
      options: [
        { label: 'Immediately execute service-improvement initiatives', correct: false },
        { label: 'Form a hypothesis about the cause and investigate', correct: true },
        { label: 'Immediately design a satisfaction survey', correct: false },
        { label: 'Copy a competitor\'s service as-is', correct: false },
      ],
      explanation: 'Once you identify an issue, first form a hypothesis about its cause. Acting without a cause leads to off-target initiatives. Even surveys produce sharper questions when you have a hypothesis.',
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
      content: 'Research information comes in two big types.\n\n**Primary**: data you collect yourself (interviews, surveys, observation)\n**Secondary**: existing reports, statistics, papers\n\nFor hypothesis testing, sweep the landscape with secondary sources first; dig deeper with primary sources only when needed. That\'s the efficient path.',
    },
    {
      type: 'quiz',
      question: 'To test the hypothesis "young people\'s café usage has declined," which research is most appropriate?',
      options: [
        { label: 'Collect overall café industry sales data', correct: false },
        { label: 'Investigate trends in young people\'s dining-out spending and use of café alternatives', correct: true },
        { label: 'Count café-related social media posts', correct: false },
        { label: 'Look up coffee consumption statistics', correct: false },
      ],
      explanation: 'To test "young people\'s café usage has declined," directly investigate behavioral changes among young people and trends in alternatives (home, convenience stores). Social media post counts are a reference but rarely primary evidence.',
    },
    {
      type: 'explain',
      title: 'The research design sheet',
      content: 'When designing research, organize four things:\n\n1. **Hypothesis**: what to test\n2. **Required information**: data needed to support or reject the hypothesis\n3. **Sources**: where you\'ll obtain it\n4. **Decision criteria**: what result counts as supporting the hypothesis\n\nClarifying these four before starting reduces waste.',
    },
    {
      type: 'quiz',
      question: 'Why decide on decision criteria in advance during research design?',
      options: [
        { label: 'To lower the cost of data collection', correct: false },
        { label: 'To prevent the bias of interpreting results conveniently after the fact', correct: true },
        { label: 'To make client reporting smoother', correct: false },
        { label: 'To shorten the research timeline', correct: false },
      ],
      explanation: 'Setting criteria up front blocks confirmation bias — "seeing only the results you wanted." If you set criteria after seeing results, you tend to interpret them in support of your hypothesis.',
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
      content: 'Many people think "changing your hypothesis = losing." It\'s the opposite.\n\nRevising and updating hypotheses based on research findings IS the **essence of hypothesis thinking**.\n\nUpdate patterns:\nSupported → dig deeper as-is\nPartially modified → re-test the modified hypothesis\nRejected → switch to a different hypothesis',
    },
    {
      type: 'quiz',
      question: 'You hypothesized "the cause of new customer decline is lower social media awareness." But research showed awareness was unchanged and repeat customer churn had increased. What\'s the next action?',
      options: [
        { label: 'Stick with the original hypothesis and propose social media boost', correct: false },
        { label: 'Update the hypothesis to "the issue is repeat customer churn" and re-investigate', correct: true },
        { label: 'Ignore the findings and proceed', correct: false },
        { label: 'Forming new hypotheses wastes time, so just conclude', correct: false },
      ],
      explanation: 'When a hypothesis is rejected, recast the new fact (repeat churn) as the new hypothesis. That\'s the verification loop. Clinging to the original produces an off-target proposal.',
    },
    {
      type: 'explain',
      title: 'Be careful about interpreting information',
      content: 'When looking at data, separate "facts" from "interpretation."\n\n**Fact**: sales down 15% YoY\n**Interpretation 1**: prices are too high\n**Interpretation 2**: the overall market is shrinking\n**Interpretation 3**: competitors stole customers\n\nThe same data supports multiple interpretations. Choose the one most consistent with your hypothesis.',
    },
    {
      type: 'quiz',
      question: 'You see the data "20% YoY decline in usage among twenty-somethings." Which is the correct hypothesis-verification approach?',
      options: [
        { label: 'Immediately launch a campaign targeting twenty-somethings', correct: false },
        { label: 'Form multiple hypotheses for "why twenty-somethings left," then collect supporting/refuting evidence for each', correct: true },
        { label: 'Send a survey to all twenty-somethings and wait for full responses', correct: false },
        { label: 'Use this data only as reference and prioritize other things', correct: false },
      ],
      explanation: 'Data only tells you "something is happening." Forming multiple "why" hypotheses and verifying each is the hypothesis-verification process.',
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
      content: 'When multiple issues are tangled, organize with a logic tree.\n\n**Issue tree example:**\nSales decline\n├── Decline in new customers\n│   ├── Lower brand awareness\n│   └── Switching to competitors\n└── Decline in repeat customers\n    ├── Quality dissatisfaction\n    └── Loss of price competitiveness\n\nA tree shows "where the highest-leverage solve point is."',
    },
    {
      type: 'quiz',
      question: 'What\'s the main benefit of using an issue tree?',
      options: [
        { label: 'You can solve all issues equally', correct: false },
        { label: 'The full picture and the priorities become visible', correct: true },
        { label: 'Client communication becomes simpler', correct: false },
        { label: 'Research effort is reduced', correct: false },
      ],
      explanation: 'A tree separates "root issues" from "derivative issues" so you can see where solving has the biggest impact — making priorities visible.',
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
        { label: 'Improve staff customer service manners', correct: false },
        { label: 'Distribute coupons to encourage visits', correct: false },
        { label: 'Analyze the operational process, identify bottleneck steps, and improve them', correct: true },
        { label: 'Broadcast crowding status on social media in real time', correct: false },
      ],
      explanation: 'The cause of "long wait times" is a process bottleneck. The most logical action directly addresses that. Manners or coupons don\'t reduce wait times.',
    },
    {
      type: 'explain',
      title: 'Evaluate actions on feasibility and impact',
      content: 'When multiple actions emerge, evaluate them on two axes.\n\n**Impact**: how much it contributes to solving the issue\n**Feasibility**: can it be done given cost, time, and resources\n\nClassify on a 2×2 grid for clear priority:\n- High impact × Easy → execute immediately (Quick Win)\n- High impact × Hard → tackle medium-to-long term\n- Low impact × Easy → do if time permits\n- Low impact × Hard → drop',
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
      content: 'In a proposal, the **logical flow (storyline)** is everything.\n\nBasic structure:\n1. Current state and issue (As-Is)\n2. Cause of the issue (Why)\n3. Target state (To-Be)\n4. Proposed action (How)\n5. Expected impact (So What)\n\nThis flow leads the reader through "understanding → conviction → action."',
    },
    {
      type: 'quiz',
      question: 'In a proposal storyline, which part explains "why solve this problem now"?',
      options: [
        { label: 'Current state and issue (As-Is)', correct: false },
        { label: 'Cause of the issue (Why)', correct: false },
        { label: 'The combination of As-Is and Why', correct: true },
        { label: 'Proposed action (How)', correct: false },
      ],
      explanation: 'Urgency and importance — "why now" — emerge from "what is wrong (As-Is)" combined with "why it\'s wrong (Why)." Both together create persuasive force.',
    },
    {
      type: 'explain',
      title: 'Apply the Pyramid Principle',
      content: 'The "lead with the conclusion" Pyramid Principle is the foundation of proposals.\n\n**Top-Down (conclusion first)**: conclusion → reason 1, reason 2, reason 3\n→ Used in most business proposals\n\n**Bottom-Up (reasons first)**: reason 1, reason 2, reason 3 → conclusion\n→ Suited for data analysis reports\n\nProposals respect the reader\'s time by leading with the conclusion.',
    },
    {
      type: 'quiz',
      question: 'What\'s the most appropriate content for an Executive Summary (the opening summary page)?',
      options: [
        { label: 'Detailed data and an explanation of the analytical process', correct: false },
        { label: 'A summary of background, key issues, recommended actions, and expected impact', correct: true },
        { label: 'Company profile and track record', correct: false },
        { label: 'A list of research methods and information sources', correct: false },
      ],
      explanation: 'The exec summary aims to let the reader "understand the whole in 5 minutes." Compress problem, issue, action, and effect into 1-2 pages. Details belong in subsequent pages.',
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
      content: '**Case setup**\nA mid-sized regional supermarket "Company A." Sales have declined 15% per year for three years.\nTwo large discount stores opened nearby.\nStaff interviews indicate "regular customers visit less often."\n\nIn this case, practice the hypothesis → research → verification → proposal process.',
    },
    {
      type: 'quiz',
      question: 'Which is the most appropriate "initial hypothesis"?',
      options: [
        { label: 'Loss of price competitiveness drives price-sensitive customers to the competitor', correct: true },
        { label: 'Poor staff customer service is dragging down satisfaction', correct: false },
        { label: 'Insufficient social media marketing', correct: false },
        { label: 'Limited product assortment is the issue', correct: false },
      ],
      explanation: 'The signals "discount stores opened" and "regular customers visit less" most logically point to a price-competitiveness issue as the initial hypothesis. The other options are possible but tie weakly to the given facts.',
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
        { label: 'Stick with the price-competitiveness hypothesis and recommend price cuts', correct: false },
        { label: 'Update to "we may not be maintaining quality on local products and freshness"', correct: true },
        { label: 'Decide the research must be wrong and conduct another study', correct: false },
        { label: 'Ignore non-price factors as unimportant', correct: false },
      ],
      explanation: 'The research rejected the hypothesis. A new hypothesis emerges: "the issue is quality/freshness, not price." That\'s hypothesis updating in practice. The right posture is to follow the data and flexibly revise.',
    },
    {
      type: 'explain',
      title: 'Assembling the proposal',
      content: 'Build the proposal around the updated hypothesis "we are not maintaining freshness and local-product appeal."\n\n**Issue**: Decline in regular customer visit frequency\n**Cause**: Reduced appeal of local products and freshness\n**Actions**:\n1. Strengthen direct-from-farm sourcing (direct contracts with local farms)\n2. Revisit freshness control processes\n3. POP and communications that lead with "the local taste"\n\n**Expected impact**: Recovery of regular customer visit frequency → 5% annual sales improvement (year 1)',
    },
    {
      type: 'quiz',
      question: 'In the final proposal, which storyline order is most appropriate?',
      options: [
        { label: 'Action → impact → issue → cause', correct: false },
        { label: 'Current state / issue → cause → target state → action → expected impact', correct: true },
        { label: 'Cause → action → current state → impact', correct: false },
        { label: 'Impact → action → issue → cause', correct: false },
      ],
      explanation: 'The proposal golden rule: current state / issue (what\'s wrong) → cause (why) → target state (what should be) → action (how to solve) → expected impact (why it\'s worth doing). This flow leads the reader from understanding to conviction to action.',
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
