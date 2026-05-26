import type { LessonData } from './lessonData'

// ========================================
// Proposal / Communication Lessons (ID: 72-76)
// English version
// ========================================

// Lesson 72: Define the purpose of the proposal
const proposalPurpose: LessonData = {
  id: 72,
  title: 'Define the purpose of your proposal',
  category: 'Proposal & Communication',
  steps: [
    {
      type: 'explain',
      title: 'A proposal is a tool for getting decisions',
      content:
        'Before you start writing a proposal, answer one question.\n\n"What do I want the reader to decide after reading this?"\n\nIf this is fuzzy when you start writing, you end up with a proposal that has lots of information but leaves the reader thinking "so what are you actually saying?"\n\nProposal purposes fall into three buckets:\n\n(1) Approval\n"Approve this budget" / "Give us permission to execute this initiative"\n→ Build around the information needed for the decision and the risk mitigations.\n\n(2) Alignment / Understanding\n"Get on the same page about the current state" / "Share a sense of urgency"\n→ Use data and examples to make the situation visible and create shared concern or empathy.\n\n(3) Action\n"Start moving today" / "Decide the next step"\n→ Clearly specify next actions, owners, and deadlines.\n\nOnce you pick one purpose, treat everything else as supporting context. This single decision changes the density of your proposal.',
      visual: 'ThreePillarsDiagram',
      visualProps: {
        sectionLabel: 'The 3 purposes of a proposal — pick one first',
        pillars: [
          { icon: 'App', title: 'Approval', body: 'Center on the decision and risk mitigations. "Approve the budget" / "Permit execution"' },
          { icon: 'Align', title: 'Alignment', body: 'Use data and cases to share urgency. "Align on the current state" / "Share the issue"' },
          { icon: 'Act', title: 'Action', body: 'Specify next steps, owners, and deadlines. "Start moving today"' },
        ],
        hint: 'Pick one purpose and everything else becomes supporting context. Density changes instantly.',
      },
      outro:
        'Approval, alignment, and action are the three proposal purposes — picking just one is where every proposal should start. Once the purpose is settled, the center of gravity of the structure falls into place on its own. The courage to drop "I want it all in there" is what produces a high-density proposal.',
    },
    {
      type: 'quiz',
      question: 'For a proposal seeking approval of a new business initiative, what should be the top priority content?',
      options: [
        { label: 'Every market data point plus a detailed competitor list', correct: false },
        { label: 'Evidence and risk mitigations the decision-maker needs', correct: true },
        { label: 'Team member backgrounds and past project accomplishments', correct: false },
        { label: 'A comprehensive sweep of industry trends and forecasts', correct: false },
      ],
      explanation:
        'When the goal is approval, center on "why do this," "what are the risks," and "how will we handle them." Comprehensive data makes decisions harder and pushes approval further away. Team intros and trend sweeps can support but should not lead.',
    },
    {
      type: 'explain',
      title: 'Reverse-engineer from the reader\'s decision criteria',
      content:
        'Once you know the purpose, imagine the reader\'s decision criteria.\n\nManagers, clients, and executives all judge on different axes:\n\n[Manager (department head, business unit lead)]\n"What\'s the cost and effort? Are the risks manageable? Will it conflict with our other priorities?"\n\n[Client (external)]\n"Why hire this firm? What\'s the ROI? What support comes after delivery?"\n\n[Executives / board]\n"Is this strategically the right direction? Can we beat the competition? Does it matter in the medium-to-long term?"\n\n:::tip\nBefore writing, put yourself in the reader\'s shoes and write down the three things you would check if asked to approve this. A proposal that answers those three head-on is the one that lands.\n:::',
    },
    {
      type: 'quiz',
      question: 'When pitching a cost-cutting initiative to executives, what should appear first?',
      options: [
        { label: 'A detailed execution plan with task-by-task owners', correct: false },
        { label: 'Current cost-structure problem plus the impact of inaction', correct: true },
        { label: 'Peer-company case studies and industry benchmark comparisons', correct: false },
        { label: 'A line-item table listing every cost to be cut', correct: false },
      ],
      explanation:
        'Executives need conviction that "this must happen now" before they engage with execution. Lead with the current issue and the cost of inaction, then move to the plan. Execution detail feels concrete to the writer but reads as "already decided" to the audience, breaking the order of persuasion.',
    },
  ],
}

// Lesson 73: Think from the other person's perspective
const proposalStakeholder: LessonData = {
  id: 73,
  title: 'Think from the reader\'s perspective',
  category: 'Proposal & Communication',
  steps: [
    {
      type: 'explain',
      title: 'Imagine the reader as a person',
      content:
        'A great proposal answers the question already in the reader\'s head — before they ask.\n\nStakeholder analysis basics:\n\n(1) Who reads it (decision-makers, influencers, hands-on operators)\n(2) What they care about (cost, quality, speed, risk, reputation)\n(3) What worries them (resistance to change, scope of responsibility, past failures)\n\nTypical reader concerns:\n\n[Finance / CFO]\n"What\'s the ROI? What\'s the payback period?"\n\n[Operations / front-line]\n"What\'s the actual workload? Impact on existing work? Who will do it?"\n\n[Marketing / business]\n"What\'s our competitive advantage? How will customers perceive it? What\'s the growth potential?"\n\nPeople interpret the same information through their own lens. Adjusting emphasis based on who you\'re showing the same proposal to is the mark of a pro.',
      visual: 'ThreePillarsDiagram',
      visualProps: {
        sectionLabel: 'Reader analysis — Who × What × Worry',
        pillars: [
          { icon: 'Who', title: 'Who reads it', body: 'Decision-maker / influencer / hands-on operator. Each judges on a different axis' },
          { icon: 'What', title: 'What they care about', body: 'Cost, quality, speed, risk, reputation. Priorities shift by role' },
          { icon: 'Risk', title: 'What worries them', body: 'Change resistance, responsibility scope, past failures. Disarm them up-front' },
        ],
        hint: 'Same proposal, different emphasis per reader — the mark of a pro.',
      },
      outro:
        'Finance, operations, and business roles each carry a different center of gravity, so the move of swapping emphasis on the same proposal is the mark of a pro. Picture your reader as a person and answer the question they will silently ask first — that is what makes a proposal land.',
    },
    {
      type: 'quiz',
      question: 'When showing the same new-system proposal to a CFO and an operations manager, which combination of emphasis is best?',
      options: [
        { label: 'CFO: feature details / Ops manager: ROI calculation', correct: false },
        { label: 'CFO: ROI and payback / Ops manager: workload and migration plan', correct: true },
        { label: 'CFO: competitor comparison / Ops manager: market trend analysis', correct: false },
        { label: 'Both readers get the same materials — content does not change', correct: false },
      ],
      explanation:
        'The CFO cares about cost and recovery; the ops manager cares about real-world impact and migration burden. Option 1 swaps the two axes (a classic mistake); option 3 gives both readers secondary topics; option 4 is the "one-size-fits-all" trap that flattens persuasion.',
    },
    {
      type: 'explain',
      title: 'Think about the dissenters first',
      content:
        'The biggest reason proposals fail is failing to anticipate objections.\n\nBefore you propose, write down "who will object, and why." Your weak spots will become visible.\n\nTypical objection patterns:\n\n[Cost concern] "We don\'t have the budget" / "Can\'t we do it cheaper?"\n→ Counter: Show concrete ROI, and show the cost of NOT doing it.\n\n[Feasibility concern] "Can we really pull this off?" / "Similar past initiatives failed"\n→ Counter: Show analogous cases, pilot results, risk-mitigation plans.\n\n[Priority concern] "We have other things to do" / "Doesn\'t need to be now"\n→ Counter: Show why now (seasonal, market, competitive timing).\n\n[Accountability concern] "Who takes responsibility?"\n→ Counter: Make the project owner and decision flow explicit.\n\n:::point\nObjections aren\'t something to field in the meeting — they\'re something to disarm preemptively inside the proposal. The more you get ahead of them, the less pushback you face on the day.\n:::',
    },
    {
      type: 'quiz',
      question: 'What\'s the most effective way to handle the objection "we don\'t have budget"?',
      options: [
        { label: 'Emphasize that "we kept costs as low as possible"', correct: false },
        { label: 'Note that "other companies are making similar investments"', correct: false },
        { label: 'Quantify the opportunity cost and risk of NOT acting', correct: true },
        { label: 'Promise that "we can secure the budget later"', correct: false },
      ],
      explanation:
        'Budget objections crumble when you contrast "the cost of investing" with "the cost of NOT investing." Option 1 invites endless haggling on price, option 2 leans on social proof without creating ownership, and option 4 defers responsibility (a dangerous IOU).',
    },
  ],
}

// Lesson 74: Designing the storyline
const proposalStoryline: LessonData = {
  id: 74,
  title: 'Designing the storyline',
  category: 'Proposal & Communication',
  steps: [
    {
      type: 'explain',
      title: 'Design with the SCR structure',
      content:
        'There\'s a template for the flow of a proposal. The most usable one is SCR.\n\n[S] Situation\nConfirm the current state — something the reader already knows or agrees with.\nExample: "Our customer acquisition cost (CAC) is currently 1.5× the industry average."\n\n[C] Complication\nShow the problem, contradiction, or change that situation creates.\nExample: "Left alone, this puts us at risk of losing price competitiveness within three years."\n\n[R] Resolution\nPresent the answer that solves the problem.\nExample: "Shifting to digital marketing channels can cut CAC by 30%."\n\nWhy this order matters:\nSharing the "problem" before the "solution" creates the feeling of "so that\'s why we need this." Leading with the solution invites resistance ("why do we need this?").',
      visual: 'ScrStructureDiagram',
      outro:
        'Situation → Complication → Resolution builds the reader\'s conviction in steps. Because they meet the solution after they have already felt the problem, it lands as "so this is why we need this." Run the order backwards and you start from resistance, which costs you persuasive power.',
    },
    {
      type: 'quiz',
      question: 'Which corresponds to the Complication in SCR?',
      options: [
        { label: 'A SWOT table laying out strengths / weaknesses / opportunities / threats', correct: false },
        { label: '"This proposal will reduce costs by 20%" — the solution statement', correct: false },
        { label: '"Left alone, we risk losing 5% market share next quarter" — problem framing', correct: true },
        { label: '"Today\'s agenda is as follows" — table-of-contents slide', correct: false },
      ],
      explanation:
        'Complication answers "what is wrong, and why must we act now." Option 1 belongs to Situation framing (current-state analysis), option 2 is Resolution, and option 4 is structural meta-content. Only option 3 builds the urgency that primes the reader to accept Resolution.',
    },
    {
      type: 'explain',
      title: 'Can you say the storyline in one sentence?',
      content:
        'Whether you can express the entire proposal\'s story in ONE sentence is the litmus test of logical strength.\n\nTemplate:\n"Given [Situation], [Complication] is happening, so we propose [Resolution]. This will achieve [Effect]."\n\nExample:\n"Customer inquiry response takes 2 days on average and customer satisfaction is dropping, so we propose deploying a chatbot. This shortens response time to under 4 hours and improves CS satisfaction by 15 points."\n\nIf you can\'t say it in one sentence, the story isn\'t organized yet.\n\nPractical flow:\n(1) Write the one-sentence story first\n(2) Gather the evidence and data that support it\n(3) Expand into slides\n\n:::warn\nMost people jump straight to (3) and build slides, which is why their proposals are dense yet directionless. Start at (1), the one sentence, and the whole thing stays on rails.\n:::',
    },
    {
      type: 'quiz',
      question: 'Which one-sentence proposal is the most logically structured?',
      options: [
        { label: '"Digitalization matters. The market is changing. We should respond too."', correct: false },
        { label: '"Competitor A grew sales 30%. We should do something similar."', correct: false },
        { label: '"Online sales are 20pt below industry avg, leaking revenue — rebuild EC for +¥200M/yr"', correct: true },
        { label: '"This initiative has benefits across cost, quality, and speed."', correct: false },
      ],
      explanation:
        'A strong one-sentence pitch chains situation → problem → solution → effect. Option 1 is claim-only with no evidence or expected effect, option 2 leans on competitors but never surfaces our own problem, and option 4 hides behind a generic "all benefits" platitude. Only option 3 carries the full structure.',
    },
  ],
}

// Lesson 75: Sharpening the message
const proposalMessage: LessonData = {
  id: 75,
  title: 'Sharpen the message',
  category: 'Proposal & Communication',
  steps: [
    {
      type: 'explain',
      title: 'Topic title vs. message title',
      content:
        'Slide titles come in two flavors:\n\n[icon:bad] Topic title (weak) — tells you only what the slide is about\nExamples: "Market trends" / "Cost comparison" / "Implementation schedule"\n\n[icon:good] Message title (strong) — tells you what the slide is saying\nExamples: "The market will double in 3 years; early entry creates competitive advantage"\n"Costs are 20% below competitors and payback completes within 18 months"\n\nMost proposals are filled with topic titles. That forces the reader to read the slide and interpret it themselves — low transmission efficiency.\n\nThree benefits of message titles:\n- The claim lands before reading (time efficiency)\n- You can spot mismatches between claim and evidence (logic check)\n- The reader doesn\'t end up asking "so what\'s the point?" (persuasion)\n\n:::point\nEvery slide title should state the claim in one sentence, not name the topic. That single move erases the reader\'s interpretation cost.\n:::',
    },
    {
      type: 'quiz',
      question: 'Convert the topic title "Sales data (2020-2024)" to a message title. Which is best?',
      options: [
        { label: '"A detailed analysis of sales data"', correct: false },
        { label: '"Since 2022, sales have grown 15% annually and momentum continues"', correct: true },
        { label: '"Sales data overview and future direction"', correct: false },
        { label: '"Sales trend and remaining issues going forward"', correct: false },
      ],
      explanation:
        'A message title states "what we are claiming" in one complete sentence. Options 1, 3, and 4 only tell you the slide\'s topic without taking any position. Only option 2 makes concrete claims ("growing 15%" and "momentum continues"). Phrasing like "analysis of," "overview," or "trends and issues" is a telltale sign of a topic title.',
    },
    {
      type: 'explain',
      title: 'Sharpen claims with "So What?"',
      content:
        'You can find weak proposal messages by asking "So What?"\n\n[icon:bad] Weak message (a list of data)\n"Company A entered the new market. Company B entered. Company C entered."\n\n[icon:good] Message with So What applied (an implication)\n"New-market entry is accelerating across the industry, and our delay is becoming a competitive risk."\n\nListing data alone never produces an "implication."\nData → (add interpretation) → implication → (point to action) → proposal\n\nMaking that conversion sharpens the claim dramatically.\n\nPractical checklist:\n- Ask "So What?" of this slide\'s message — does a meaningful answer come out?\n- Are there any "leaps" between data and conclusion?\n- Does the conclusion lead to actionable implication?',
    },
    {
      type: 'quiz',
      question: 'For the data point "customer survey average satisfaction was 3.8 / 5," what\'s the best So What?',
      options: [
        { label: '"Customer satisfaction was 3.8 points." — restating the data', correct: false },
        { label: '"Customer satisfaction details — see appendix." — deferring', correct: false },
        { label: '"3.8 is below the industry average of 4.2, indicating room to improve CX vs. peers."', correct: true },
        { label: '"Some initiative may be needed to improve satisfaction." — vague', correct: false },
      ],
      explanation:
        'So What states what the data MEANS. 3.8 alone is meaningless. Option 1 just repeats the number, option 2 punts to an appendix, and option 4 hides behind "may be needed" — a classic spineless message. Option 3 anchors the data to a benchmark and produces a clear implication.',
    },
  ],
}

// Lesson 76: Anticipate objections
const proposalQA: LessonData = {
  id: 76,
  title: 'Anticipate objections',
  category: 'Proposal & Communication',
  steps: [
    {
      type: 'explain',
      title: 'The goal is to get the proposal approved',
      content:
        'The purpose of a proposal is to win approval. No matter how correct the content, if it stalls on objections it doesn\'t get approved.\n\nProfessional proposers re-read their own proposal from a critical reviewer\'s seat before presenting.\n\nQ&A preparation flow:\n\n(1) For each stakeholder, write down "what will this person ask?"\n(2) For each question, prepare an answer + supporting evidence pair\n(3) Identify hard-to-answer questions (your weak spots) and address them proactively in the body of the proposal\n\n"Address proactively" means:\nCovering the point in the proposal itself before the objection arises ("On this point, we believe..."). This builds the "they\'ve thought it through" trust signal and lowers the approval bar.\n\nThree topics that especially deserve preemptive coverage:\n- Cost / ROI evidence\n- Feasibility (team, schedule)\n- Risks and mitigations\n\n:::point\nWeak spots draw suspicion when hidden and earn trust when raised first. Signaling "we have thought this through" lowers the bar to approval.\n:::',
    },
    {
      type: 'quiz',
      question: 'Which best describes the effect of adding a "Risks and Mitigations" slide to a proposal?',
      options: [
        { label: 'Naming risks exposes weaknesses and makes approval harder', correct: false },
        { label: 'Surfacing risks early dissolves concerns and lowers the approval bar', correct: true },
        { label: 'Page count goes up, making the proposal look more substantial', correct: false },
        { label: 'Risks can be covered verbally; they do not need to be on a slide', correct: false },
      ],
      explanation:
        'Hiding risks creates suspicion ("did they think about risk?"). Showing risks plus mitigations preemptively earns the "they\'ve thought it through" trust signal. Option 1 is the intuitive but wrong "never show weakness" belief, option 3 confuses thickness with quality, and option 4 invites surprise objections after the meeting because nothing is on the record.',
    },
    {
      type: 'explain',
      title: 'Make the "why now" explicit',
      content:
        'Another reason proposals get rejected: the reader thinks "doesn\'t have to be now."\n\n"Timing rationale" is the most-forgotten component of proposals.\n\nFour angles for showing timing:\n\n(1) Market change\n"Competitors will launch a new feature next year. If we don\'t move now we lose first-mover advantage."\n\n(2) Cost change\n"Raw material prices rise next quarter. Locking in this quarter keeps the old price."\n\n(3) Internal cycle\n"If we don\'t decide before the next mid-term plan is finalized, budget gets pushed out a full year."\n\n(4) Customer / regulatory change\n"New regulations take effect next year. Delay creates legal risk."\n\n:::warn\nTiming rationale is the most-forgotten component of any proposal. If even one angle applies — market, cost, internal cycle, or regulation — weave it in to block the "let\'s defer this" decision pattern.\n:::',
    },
    {
      type: 'quiz',
      question: 'What\'s the biggest benefit of including a "why now" in a proposal?',
      options: [
        { label: 'Adds page count, making the proposal look more substantial', correct: false },
        { label: 'Blocks the "let\'s defer this" instinct, raising in-quarter approval odds', correct: true },
        { label: 'Including competitor info conveys our competitive advantage', correct: false },
        { label: 'Provides evidence that the proposal content is accurate', correct: false },
      ],
      explanation:
        '"Doesn\'t have to be now" is a more common loss than outright rejection. Timing rationale (market, cost, internal cycle, regulation) closes that escape hatch. Options 3 and 4 are about content quality — useful, but a different axis from timing.',
    },
  ],
}

// ========================================
// Map
// ========================================
export const proposalLessonMapEn: Record<number, LessonData> = {
  72: proposalPurpose,
  73: proposalStakeholder,
  74: proposalStoryline,
  75: proposalMessage,
  76: proposalQA,
}
