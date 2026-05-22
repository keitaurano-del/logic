import type { LessonData } from './lessonData'

// ========================================
// Lesson 28: Case Interview Introduction
// ========================================
const caseIntro: LessonData = {
  id: 28,
  title: 'Introduction to Case Interviews',
  category: 'Case Interview',
  steps: [
    {
      type: 'explain',
      title: 'What is a case interview?',
      content:
        'A case interview is a hands-on problem-solving test that consulting firms (McKinsey, BCG, Bain, etc.) use in their hiring process.\n\nA prompt like "A client\'s revenue dropped 30%. Diagnose the cause and propose a fix" is given, and you work through it in dialogue with the interviewer.\n\nWhat is graded is the thought process, not the final answer.',
    },
    {
      type: 'explain',
      title: 'Three pillars of thinking',
      content:
        '(1) Hypothesis-driven thinking: state up front "the cause is probably X" and progress by testing it.\n\n(2) MECE decomposition: break the problem down "Mutually Exclusive, Collectively Exhaustive" so you see the whole picture.\n\n(3) Prioritization: focus on the parts of the decomposition with the largest impact.\n\nThe core skill of case interviews is combining these three to reach a conclusion within tight time limits.',
    },
    {
      type: 'quiz',
      question: 'What is most highly valued in a case interview?',
      options: [
        { label: 'Memorizing exact industry figures and benchmarks', correct: false },
        { label: 'Logical thought process and hypothesis-building skill', correct: true },
        { label: 'Depth of industry knowledge and domain expertise', correct: false },
        { label: 'Sheer mental calculation speed and accuracy', correct: false },
      ],
      explanation:
        'In case interviews, "how you thought" is what matters. Option 1 (memorization) and option 3 (knowledge) overweight raw recall; option 4 (speed) is a technique that without structure leads nowhere. The decisive skill is structured thinking + hypothesis to steer the conversation.',
    },
    {
      type: 'explain',
      title: 'How to choose a framework',
      content:
        'Common frameworks:\n\n- Profitability problems -> Revenue / Cost decomposition\n- Market entry -> 3C (Customer, Competitor, Company)\n- Strategy formulation -> SWOT / Porter\'s Five Forces\n\nBut "applying a framework" is not the goal.\nWhat is required is the ability to see the essence of the problem and pick the right cut yourself.',
    },
    {
      type: 'quiz',
      question: 'In an "improve the client\'s profit" case, what should you do first?',
      options: [
        { label: 'Immediately propose several initiatives and gauge reactions', correct: false },
        { label: 'Decompose Profit = Revenue − Cost and locate the broken branch', correct: true },
        { label: 'Gather a comprehensive sweep of competitor financials', correct: false },
        { label: 'Survey overall industry trends and macro economics first', correct: false },
      ],
      explanation:
        'First decompose profit into Revenue vs Cost to find which side broke. Option 1 leaps to actions without diagnosis, option 3 retreats into external research, option 4 starts high and never lands on the specific problem.',
    },
  ],
}

// ========================================
// Lesson 29: Profitability Case
// ========================================
const caseProfitability: LessonData = {
  id: 29,
  title: 'Profitability Case',
  category: 'Case Interview',
  steps: [
    {
      type: 'explain',
      title: 'Decomposing the profit structure',
      content:
        'Profitability cases are the most frequent case type.\n\nProfit = Revenue - Cost\n\nRevenue = Price x Quantity\nQuantity = Customers x Purchase frequency x Items per purchase\n\nCost = Fixed costs (rent, payroll, etc.) + Variable costs (materials, etc.)\n\nKeep this tree in your head. The first step is to identify which branch is broken.',
    },
    {
      type: 'think',
      question: 'An electronics manufacturer\'s operating profit fell 30% YoY. As the consultant, you start the analysis. What do you decompose first, and what information do you collect?',
      hint: 'Start with the Profit = Revenue - Cost tree. First, settle the binary "did revenue fall, or did cost rise?"',
      modelAnswer: 'Decompose into "Profit = Revenue - Cost" and first check "is revenue up / flat / down?" Then check "are costs up / down / flat?" Decompose each branch further depending on direction.\n\nRevenue decomposition: revenue trend by product line 1-3 / by region / by customer segment\nCost decomposition: breakdown of cost drivers (materials, manufacturing, SG&A)',
      points: [
        'Narrowing the entry point with a binary cut (revenue vs cost) is step one',
        'Repeat "why?" against each branch',
        'Eventually anchor your recommendation in concrete numbers',
      ],
    },
    {
      type: 'case',
      title: 'Profit decline at a restaurant chain',
      situation: 'A mid-sized cafe chain (200 stores nationwide) saw operating profit drop 35% YoY. The CEO has asked you to "find the cause and propose a fix."',
      phases: [
        {
          info: 'Revenue data: average ticket is up 5% YoY. But customer count is down 15% YoY.',
          question: 'Based on this information, what is the most accurate conclusion about revenue?',
          options: [
            { label: 'Price increase is the main driver - average ticket is up, so no problem', correct: false, feedback: 'You cannot decide on the +5% ticket alone. Customer count is down 15%, so total revenue is roughly -11% YoY (1.05 x 0.85 ≈ 0.89). Revenue actually fell.' },
            { label: 'Prices rose but customer count fell more, so total revenue dropped', correct: true, feedback: 'Correct! Because (1.05 x 0.85 = 0.89), revenue is down ~11%. Confirmed: revenue decline is one driver of the profit drop.' },
            { label: 'We have not seen costs yet, so we cannot decide', correct: false, feedback: 'A consultant draws conclusions about what can be concluded from the available evidence first. Don\'t wait for everything before saying anything.' },
          ],
        },
        {
          info: 'Additional info: on the cost side, baseline fixed costs (rent, payroll) have not moved much. But beverage raw materials are up 28% YoY.',
          question: 'What is the most accurate diagnosis of the core profit issue?',
          options: [
            { label: 'Customer drop is the main cause, so we need stronger marketing', correct: false, feedback: 'The customer drop is one factor but does not fully explain the profit decline. Pay attention to the +28% in raw materials.' },
            { label: 'Both revenue decline (customers) and cost increase (materials) are stacking up', correct: true, feedback: 'Correct! It is a combined driver. -15% customers depressing revenue x +28% materials squeezing margin. The fix needs to attack both axes.' },
            { label: 'Cutting fixed cost should be the top priority', correct: false, feedback: 'Fixed cost has not changed much, so it is not the "top priority" issue. Get the facts straight first.' },
          ],
        },
      ],
      conclusion: 'Structure of this case: "Profit decline = Revenue drop (fewer customers) + Cost rise (raw materials)" — a combined driver.\n\nDirection of the fix:\n- Average ticket already up but customers fell -> stress-test price elasticity, deploy retention initiatives\n- Materials up 28% -> diversify suppliers, renegotiate volume terms\n\n[Framework] Profit decomposition tree -> fact-check -> identify combined drivers -> prioritize fixes',
    },
  ],
}

// ========================================
// Lesson 35: Market Entry Case
// ========================================
const caseMarketEntry: LessonData = {
  id: 35,
  title: 'Market Entry Case',
  category: 'Case Interview',
  steps: [
    {
      type: 'explain',
      title: 'Framework for market entry decisions',
      content:
        'To answer "Should Company A enter market X?", analyze along three axes.\n\n(1) Market attractiveness\n- Are market size and growth rate sufficient?\n- Is structural profitability healthy (Porter\'s Five Forces)?\n\n(2) Our competitive advantage\n- Can we clear the entry barriers?\n- Can we leverage existing assets (technology, customers, brand)?\n\n(3) Feasibility of entry\n- Are capital, talent, and timeline realistic?',
    },
    {
      type: 'quiz',
      question: 'Which case argues for skipping entry even when market growth is high?',
      options: [
        { label: 'When competition is light and the field looks open', correct: false },
        { label: 'When we lack advantage and large incumbents are already entrenched', correct: true },
        { label: 'When the market is small with limited upside ceiling', correct: false },
        { label: 'When entry costs are low and exit would be easy', correct: false },
      ],
      explanation:
        'A growing market doesn\'t guarantee a win — without competitive edge against entrenched giants, you lose. Options 1 and 4 are actually pro-entry signals, option 3 contradicts the premise (high growth). Always ask "Can we win?" before "Should we enter?"',
    },
    {
      type: 'explain',
      title: 'Choosing an entry mode',
      content:
        'Once entry is decided, you choose the "how."\n\n- Build organically (greenfield): slow, but full control\n- M&A / acquisition: instant market position, high cost\n- Joint venture (JV): risk and return shared. Often used in emerging markets where local partners are essential\n- Licensing: lowest entry cost, but limited upside\n\nPick the mode that fits your strategy and balance sheet.',
    },
    {
      type: 'quiz',
      question: 'A Japanese company entering Indonesia for the first time faces complex regulation and unfamiliar business norms. Which entry mode is most realistic?',
      options: [
        { label: 'Full greenfield build from scratch with own resources', correct: false },
        { label: 'Joint venture with a local company to share risk and knowledge', correct: true },
        { label: 'Whole-market acquisition to gain instant scale and share', correct: false },
        { label: 'Licensing only — provide rights without operational presence', correct: false },
      ],
      explanation:
        'In emerging markets with complex regulation, a JV with a local partner shares risk while leveraging local network and knowledge. Option 1 demands huge upfront learning, option 3 often blocked by foreign ownership caps, option 4 returns too little to build advantage. JV is the standard playbook for Japanese firms in Southeast Asia.',
    },
  ],
}

// ========================================
// Lesson 36: M&A Case
// ========================================
const caseMnA: LessonData = {
  id: 36,
  title: 'M&A Case',
  category: 'Case Interview',
  steps: [
    {
      type: 'explain',
      title: 'Three axes for evaluating M&A',
      content:
        'When asked in a case interview "Is this acquisition the right call?", evaluate along three axes.\n\n(1) Strategic Fit\nDoes the target match our strategy?\n\n(2) Synergy\n- Revenue synergy: cross-sell, access to new markets\n- Cost synergy: consolidating duplicate functions, procurement savings\n\n(3) Valuation (is the price reasonable?)\nDoes the present value of synergies exceed the premium paid?',
    },
    {
      type: 'quiz',
      question: 'What is the most accurate description of the danger of overestimating "synergy" in M&A?',
      options: [
        { label: 'Revenue ends up higher than forecast, disrupting plans', correct: false },
        { label: 'Integration costs and org friction are underweighted; synergy never materializes', correct: true },
        { label: 'Shareholders are more likely to oppose, delaying the deal', correct: false },
        { label: 'Regulatory review becomes stricter and approval is slowed', correct: false },
      ],
      explanation:
        'Most M&A failures stem from synergy overestimation. Hidden costs (culture clash, system integration, attrition) pile up. Option 1 is upside (the opposite problem); options 3 and 4 are deal-stage process risks unrelated to the core "synergy doesn\'t materialize" thesis.',
    },
    {
      type: 'explain',
      title: 'Valuation basics',
      content:
        'Two main methods to evaluate whether the acquisition price is fair.\n\n(1) DCF (Discounted Cash Flow)\nDiscount future cash flows to present value to compute enterprise value.\n\n(2) Comparable transactions\nCompare against multiples (e.g., EV/EBITDA) of similar peer acquisitions.\n\nIn an interview, what matters is whether you can answer: "Can the acquisition premium be recouped through synergies?"',
    },
    {
      type: 'quiz',
      question: 'Company A (food) is acquiring Company B (logistics). Which is the most compelling strategic rationale?',
      options: [
        { label: 'A personal relationship between A\'s leadership and B\'s founder', correct: false },
        { label: 'In-housing B cuts shipping cost, strengthening A\'s product price competitiveness', correct: true },
        { label: 'B has many employees, allowing the group to scale headcount', correct: false },
        { label: 'Other peers are doing similar deals, so we should match them', correct: false },
      ],
      explanation:
        'A clear value-creation logic (cost synergy here) makes the rationale strategic. Option 1 (personal relationships) is governance-risky, option 3 conflates size with value, option 4 is the "follow the herd" trap — common but never a strategic rationale.',
    },
  ],
}

export const caseLessonMapEn: Record<number, LessonData> = {
  28: caseIntro,
  29: caseProfitability,
  35: caseMarketEntry,
  36: caseMnA,
}
