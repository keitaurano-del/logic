import type { LessonData } from './lessonData'

// ========================================
// Critical Thinking Lessons (ID: 40-46)
// ========================================

// Lesson 40: Introduction to Critical Thinking
const criticalIntro: LessonData = {
  id: 40,
  title: 'Introduction to Critical Thinking',
  category: 'Critical Thinking',
  steps: [
    {
      type: 'explain',
      title: 'What is critical thinking?',
      content:
        'Critical thinking is a mode of thought that refuses to take information or opinions at face value and instead asks, "Is that really true?"\n\nThink of an everyday example.\n\nA friend says, "This diet product works — I saw it on a TV ad!"\n\nThe lazy reaction: "Oh really? Maybe I should try it."\nThe critical reaction: "Who said so? What is the evidence? Are there other studies?"\n\nCritical thinking is not about doubting everything. It is about reaching your own judgment based on evidence.\n\nThree everyday workplace situations where it pays off:\n- Pressing your manager for the rationale behind an instruction\n- Reading data or reports\n- Hearing opinions in meetings',
    },
    {
      type: 'quiz',
      question: 'Which best describes the essence of critical thinking?',
      options: [
        { label: 'Argue against every opinion you hear to keep the debate sharp', correct: false },
        { label: 'Reach your own judgment by checking evidence, logic, and proof', correct: true },
        { label: 'Defer to recognized experts and famous voices as a starting point', correct: false },
        { label: 'Trust any conclusion that is supported by a large enough dataset', correct: false },
      ],
      explanation:
        'Critical thinking is judgment grounded in evidence and reasoning — not contrarianism, not authority deference, not data-volume worship. "Argue against everything" mistakes friction for thinking; expert deference outsources judgment; data volume without quality is a quantity-over-quality trap. The goal is better decisions, not winning arguments.',
    },
    {
      type: 'explain',
      title: 'Separate claim, evidence, and assumption',
      content:
        'A core toolkit of critical thinking:\n\n[Claim]\nThe conclusion or opinion: "X is true" or "we should do X."\nExample: "Our company should end remote work."\n\n[Evidence]\nThe facts, data, and reasons that support the claim.\nExample: "Revenue dropped 20% last year." "Team coordination has weakened."\n\n[Assumption]\nUnstated conditions that the claim depends on to hold.\nExample: "The cause of the revenue drop is remote work." -- is that actually true?\n\nPractical tip:\nWhen you hear a claim, decompose it into these three parts. Assumptions, in particular, are usually unspoken — watch for them.',
    },
    {
      type: 'quiz',
      question: 'When critically examining the claim "we ran a new marketing campaign, so revenue went up," which assumption should you check first?',
      options: [
        { label: 'How experienced the marketing team is and their track record', correct: false },
        { label: 'Whether the campaign actually caused the revenue rise (causation)', correct: true },
        { label: 'The campaign cost and ROI calculation', correct: false },
        { label: 'What competitors and the broader market were doing in the same period', correct: false },
      ],
      explanation:
        'The whole claim hinges on the "campaign → revenue" causal link. If that link is just correlation, the team\'s skill and the ROI math become moot. Competitor activity is one input to confirming causation, but checking it before challenging the causal claim itself means analyzing under a foregone conclusion — the wrong order.',
    },
  ],
}

// Lesson 41: Spotting logical fallacies
const criticalFallacy: LessonData = {
  id: 41,
  title: 'Spotting Logical Fallacies',
  category: 'Critical Thinking',
  steps: [
    {
      type: 'explain',
      title: 'Catching "convincing-sounding lies"',
      content:
        'A logical fallacy is an argument that sounds reasonable but is actually built on broken logic.\n\nFive fallacies that show up often in business:\n\n[1] Appeal to authority\n"That famous CEO said the same thing."\n-> What matters is whether the content is correct, not who said it.\n\n[2] Ad hominem\n"You are saying that, but you have failed before."\n-> The speaker\'s character is unrelated to whether the claim is correct.\n\n[3] Appeal to popularity (bandwagon)\n"Everyone is saying so."\n-> Majority opinion is not necessarily correct.\n\n[4] Strawman\nDistorting the opponent\'s argument to attack a weaker version.\n"I proposed cost cuts and was told \'so you want to throw away quality?\'"\n\n[5] Causal fallacy (post hoc)\n"B happened after A, so A caused B."\n-> Sequence in time is not the same as causation.',
    },
    {
      type: 'quiz',
      question: 'In a meeting someone says "this proposal matches what was in a major consulting firm\'s report." Which fallacy might this be?',
      options: [
        { label: 'Ad hominem — attacking the speaker to dismiss the claim', correct: false },
        { label: 'Appeal to authority — using the source\'s prestige as proof', correct: true },
        { label: 'Strawman — distorting an opponent\'s argument to attack a weaker version', correct: false },
        { label: 'Causal fallacy — confusing temporal order with cause and effect', correct: false },
      ],
      explanation:
        '"A famous firm said it" leans on prestige as evidence — the textbook appeal to authority. The report still needs its content and fit-to-context validated. Ad hominem points the other way (attacking the speaker), strawman distorts the argument, and causal fallacy is about time-order mistakes — none of which describe this case.',
    },
    {
      type: 'explain',
      title: 'Beware of confirmation bias',
      content:
        'Confirmation bias:\nThe tendency to gather only information that supports what you already believe and to ignore information that contradicts it.\n\nEveryday example:\nIf you are convinced "this new venture will succeed,"\nSuccess stories and positive data -> you accept them quickly.\nFailure stories and risk data -> you dismiss them as "exceptions."\n\nCountermeasures:\n(1) Actively look for disconfirming evidence.\nAlways ask, "What is the weakness of this proposal?"\n\n(2) Appoint a Devil\'s Advocate.\nDesignate someone whose job is to argue the opposite.\n\n(3) Set decision criteria in advance.\n"If conditions X are met, we go." Decide before you see the data.',
    },
    {
      type: 'quiz',
      question: 'What is the most effective countermeasure against confirmation bias?',
      options: [
        { label: 'Gather as much data as possible to build a complete picture', correct: false },
        { label: 'Deliberately ask "what if I am wrong?" and hunt for disconfirming evidence', correct: true },
        { label: 'Defer to expert opinion to anchor your conclusion firmly', correct: false },
        { label: 'Vote within the team to make the decision objective', correct: false },
      ],
      explanation:
        'Confirmation bias is "absorb only friendly data," so gathering more data alone just expands the friendly subset. Deliberately seeking counter-evidence is the actual antidote. Expert deference and voting abdicate the personal-judgment goal of critical thinking — they avoid the bias rather than counter it.',
    },
  ],
}

// Lesson 42: Reading information correctly — data literacy
const criticalData: LessonData = {
  id: 42,
  title: 'Reading Data Correctly',
  category: 'Critical Thinking',
  steps: [
    {
      type: 'explain',
      title: 'Do graphs lie?',
      content:
        'Data and charts look objective, but how they are presented changes the impression dramatically.\n\nThree common "data traps":\n\n[1] Truncated Y-axis\nA change of "$95K -> $100K -> $105K" can be made to look like 3x growth if you start the Y-axis at $95K.\n-> Always check whether the axis is zero-based.\n\n[2] Confusing correlation with causation\n"Ice cream sales correlate with drowning incidents."\n-> The hidden third factor (temperature) drives both.\n-> Correlation does not imply causation.\n\n[3] Sample bias\n"Customer survey shows 90% satisfaction."\n-> Unsatisfied customers may already have churned and never responded.\n-> Always check who actually answered.',
    },
    {
      type: 'quiz',
      question: 'Data shows "people who drink more coffee perform better at work." What can you legitimately conclude?',
      options: [
        { label: 'Drinking coffee improves performance (a causal claim)', correct: false },
        { label: 'There may be a correlation between coffee intake and performance', correct: true },
        { label: 'High performers share a personality trait that includes liking coffee', correct: false },
        { label: 'Distributing coffee to all employees will raise overall performance', correct: false },
      ],
      explanation:
        'Data only shows co-occurrence; jumping to causation, personality theory, or intervention effect all overreach the evidence. A third variable (long hours, high motivation) could drive both. Correlation-to-causation leaps are the most common business analytics mistake, and they especially hurt when they fund expensive "let\'s do it" interventions.',
    },
    {
      type: 'explain',
      title: 'Absolute values vs relative values',
      content:
        'When you look at numbers, the question "compared to what?" matters.\n\n[Relative-value trick]\n"Risk has doubled!"\n-> Maybe it just went from 0.001% to 0.002%.\n\n[Absolute-value trick]\n"100 more deaths."\n-> The meaning is completely different in a country of 100 million versus a town of 10,000.\n\nHow to read correctly:\n- When you see a relative value (% or multiplier), check the absolute value.\n- When you see an absolute value, check the denominator (the whole).\n- When you see a change in level, check the rate of change (and vice versa).\n\nWorked example:\n"New drug cuts cancer death risk by 50%."\n-> Check the absolute values: from what % to what %?',
    },
    {
      type: 'quiz',
      question: 'An ad claims "80% of users said they were satisfied with our product." When evaluating this critically, what should you check first?',
      options: [
        { label: 'Competitor satisfaction scores for a relative benchmark', correct: false },
        { label: 'The number of respondents and any sample bias (who actually answered)', correct: true },
        { label: 'The product price range and price-to-satisfaction match', correct: false },
        { label: 'The product release date and market maturity stage', correct: false },
      ],
      explanation:
        '80% is meaningless without knowing the denominator and the composition of respondents. "8 of 10" and "8,000 of 10,000" carry very different signal; and if unhappy users already churned, you have classic survivorship bias. Price, release date, and competitor scores are secondary — sample quality comes first.',
    },
  ],
}

// Lesson 43: The skill of asking the right question
const criticalQuestion: LessonData = {
  id: 43,
  title: 'The Skill of Asking the Right Question',
  category: 'Critical Thinking',
  steps: [
    {
      type: 'explain',
      title: 'A good question beats a good answer',
      content:
        'It is harder, and more valuable, to ask the right question than to find the right answer.\n\nThe quality of the question determines the quality of the answer.\n\nExample: drilling into "why did sales drop?"\n\nLevel 1: "What is the problem?"\n-> "Sales are down." (state the situation)\n\nLevel 2: "Why did they drop?"\n-> "We are getting fewer new customers." (proximate cause)\n\nLevel 3: "Why are new customers down?"\n-> "Our brand awareness is low." (root cause)\n\nLevel 4: "What should we do to raise awareness?"\n-> "Social, PR, referrals..." (solutions)\n\nKey:\nFor the same problem, the question shapes what you can see. Repeat "why?" to get to the essence.',
    },
    {
      type: 'quiz',
      question: 'Your boss says "sales are low — how do we fix it?" From a critical-thinking perspective, what should you do first?',
      options: [
        { label: 'Quickly draft three improvement ideas to show initiative', correct: false },
        { label: 'Clarify which sales, since when, and why — redefine the question first', correct: true },
        { label: 'Research what competitors are doing to find quick wins', correct: false },
        { label: 'Propose cost cuts because sales are unlikely to recover fast', correct: false },
      ],
      explanation:
        'Solutions before problem definition lead to a flood of off-target ideas. Splitting "which sales, since when, why" produces a sharper question and far better hypotheses. Competitor research and cost cuts can be valid downstream moves, but jumping there before defining the problem is exactly what critical thinking warns against.',
    },
    {
      type: 'explain',
      title: 'Open vs closed questions',
      content:
        'In critical thinking, the type of question matters too.\n\n[Closed question]\nCan be answered yes/no or with a fixed set of options.\nExample: "Do you agree with this proposal?"\n-> The reasoning behind the answer remains hidden.\n\n[Open question]\nThe respondent can answer freely.\nExample: "What do you think of this proposal?"\n-> Surfaces assumptions, concerns, and perspectives.\n\nApplied: question design\n"Will this project succeed?"\n"What is the biggest risk to this project?"\n\n"Under what conditions would it succeed?"\n\nOpen questions are especially powerful in meetings, interviews, and consulting.',
    },
    {
      type: 'quiz',
      question: 'In a customer interview aimed at "understanding what to improve about our service," which question is more useful?',
      options: [
        { label: '"Is our service easy to use?" — direct usability check', correct: false },
        { label: '"Last time you used it, was there anything that gave you trouble?" — concrete experience probe', correct: true },
        { label: '"On a 5-point scale, how would you rate our service?" — quantified rating', correct: false },
        { label: '"Are there features you\'d like us to improve?" — direct feature wishlist', correct: false },
      ],
      explanation:
        'Open questions about a specific recent experience surface the most insight. Yes/no usability checks and rating scales collapse to a single signal with no follow-up. "What features would you improve?" sounds open but frames the answer to feature requests, missing experience-level issues users haven\'t named — a leading-question trap.',
    },
  ],
}

// ========================================
// Lesson 69: Removing cognitive biases
// ========================================
const criticalBias: LessonData = {
  id: 69,
  title: 'Removing Cognitive Biases',
  category: 'Critical Thinking',
  steps: [
    {
      type: 'explain',
      title: 'What is a cognitive bias?',
      content:
        'A cognitive bias is a "shortcut" the brain uses to economize on judgment.\n\nThe brain cannot process every piece of information, so it shortcuts using past experience, emotion, and assumptions. This is a survival instinct, but it is a leading source of errors in business decisions.\n\nThree common biases:\n\n(1) Confirmation bias\n"You collect only the information that supports what you want to believe."\nExample: convinced "this strategy is right," you unconsciously ignore disconfirming data.\n\n(2) Anchoring\n"You are pulled toward the first number you saw."\nExample: when you hear "$5,000" first, "$3,000" suddenly feels cheap.\n\n(3) Sunk cost\n"You let costs already spent distort your judgment."\nExample: "We have invested this much in development — we cannot stop now."',
      visual: 'ThreePillarsDiagram',
      visualProps: {
        sectionLabel: 'Three common cognitive biases',
        pillars: [
          { icon: 'C', title: 'Confirmation', body: 'You collect only what supports the belief you want. Disconfirming data is ignored' },
          { icon: 'A', title: 'Anchoring', body: 'The first number drags later judgment. After "$5,000," "$3,000" feels cheap' },
          { icon: 'S', title: 'Sunk cost', body: 'Past spending blocks rational exit. "We invested so much, we cannot stop"' },
        ],
        hint: 'Pause before deciding and name which bias is active — that single beat cuts errors',
      },
    },
    {
      type: 'quiz',
      question: 'For a market study on a new product, you only interviewed users who already favor your company and concluded "there is demand." Which bias is this?',
      options: [
        { label: 'Anchoring — judgment dragged by the first number or impression', correct: false },
        { label: 'Confirmation bias — gathering only data that supports the hypothesis', correct: true },
        { label: 'Sunk cost — past spending prevents rational exit', correct: false },
        { label: 'Normalcy bias — treating abnormal events as if they were routine', correct: false },
      ],
      explanation:
        'Filtering for friendly users to validate a thesis is the textbook confirmation bias. Anchoring is about numeric judgment, sunk cost is about past investments, and normalcy bias is about crisis response — different structures even though the names sound similar. Matching the bias to its trigger pattern is the key skill.',
    },
    {
      type: 'explain',
      title: 'How to remove biases',
      content:
        'You cannot fully eliminate biases. The point is to know they exist and consciously counteract them.\n\nThree practical methods:\n\n(1) Deliberately seek opposing views (devil\'s advocate)\nIn a meeting, assign someone the role of "argue against this proposal."\n\n(2) Predict the number first, then look it up\nAnchoring countermeasure. Write down your own estimate before checking the actual data, free of preconceptions.\n\n(3) Verbalize "why can\'t we stop now?"\nSunk-cost countermeasure. Ask: "If I were starting from zero today, would I make the same choice?"',
    },
    {
      type: 'quiz',
      question: 'For which bias is the question "would I make the same choice if I were starting from zero today?" most effective?',
      options: [
        { label: 'Confirmation bias — gathering only supporting evidence', correct: false },
        { label: 'Anchoring — judgment fixed by the first number seen', correct: false },
        { label: 'Sunk cost — past investments preventing rational exit', correct: true },
        { label: 'Optimism bias — assuming bad outcomes will not happen to you', correct: false },
      ],
      explanation:
        'The "from zero today" frame deliberately strips past investment from the decision — a precision tool for sunk cost. Confirmation bias responds to counter-evidence searches, anchoring to pre-commitment estimates, and optimism bias to pre-mortems. Question form and target bias should be learned as paired sets.',
    },
  ],
}

// ========================================
// Lesson 71: Distinguishing correlation from causation
// ========================================
const criticalCorrelation: LessonData = {
  id: 71,
  title: 'Correlation vs Causation',
  category: 'Critical Thinking',
  steps: [
    {
      type: 'explain',
      title: 'Correlation is not causation',
      content:
        '"A and B are related" is different from "A causes B."\n\nMixing them up leads to pointless initiatives or to overlooking the real cause.\n\nExample 1: a famous "spurious correlation"\nIce cream sales rise as drowning incidents rise.\n-> Ice cream does not cause drowning.\n-> A common cause (high temperature) drives both.\n\nExample 2: a business pitfall\n"Revenue rose in months when ad spend rose."\n-> Did ad spend cause it? Or did "the season was strong, so we could afford more ad spend"?\n\nThree conditions for claiming causation:\n(1) A occurred before B in time.\n(2) A and B are correlated.\n(3) No third variable explains the relationship.',
    },
    {
      type: 'quiz',
      question: 'A company finds that "employees who drink coffee perform better" and decides to give everyone free coffee. What is wrong with this reasoning?',
      options: [
        { label: 'Coffee consumption was not measured with a standardized method', correct: false },
        { label: 'Correlation is treated as causation; possible third variables are ignored', correct: true },
        { label: 'It underestimates the pharmacological effect of caffeine', correct: false },
        { label: 'Performance is defined too loosely to support any analysis', correct: false },
      ],
      explanation:
        'The core error is the leap from correlation to causation while ignoring third variables (motivation, hours worked) that could drive both. Measurement issues and effect-size debates miss the structural problem; calling the analysis impossible because of fuzzy definitions overstates the case. "Correlation → causation → intervention" is the trap to name explicitly.',
    },
    {
      type: 'explain',
      title: 'Practical causal inference',
      content:
        'How real businesses establish causation:\n\nA/B test (randomized controlled experiment)\nThe most reliable method. Change one condition only and compare randomly assigned groups.\nExample: show landing pages A and B to 50/50 of traffic and compare conversion rates.\n\nBefore/after comparison alone is not enough\n"Revenue rose after the change" is not proof. You have not ruled out other factors (season, competitors, the economy) changing in the same period.\n\nImagine "what if we had done nothing?"\nThe counterfactual. Only by comparing to a control group can you measure true effect.\n\nDay-to-day practice:\nAny time you want to claim "A -> B," ask yourself: "Is there a third variable?" "Could it actually be B -> A?"',
    },
    {
      type: 'quiz',
      question: 'You launched a new feature, and DAU (daily active users) rose 15% the following week. What is missing before you can conclude "the new feature drove DAU up"?',
      options: [
        { label: 'The 15% lift is too small to count as a meaningful effect', correct: false },
        { label: 'The release timing was too late relative to the market opportunity', correct: false },
        { label: 'A control group that did not receive the new feature for comparison', correct: true },
        { label: 'One week of data is too short to be statistically reliable', correct: false },
      ],
      explanation:
        'Without a control group, you cannot separate the feature\'s impact from other things happening in the same week (push, seasonality, social buzz). Sample size and effect magnitude are secondary; the structural missing piece is a comparison baseline. A/B testing or difference-in-differences is the standard fix.',
    },
    {
      type: 'think',
      question: 'Your boss reports: "We boosted social ads last month and revenue jumped 18% — the causation is obvious." What questions would you raise, and what would you check?',
      hint: 'Use "the three conditions of correlation vs. causation" and "the possibility of a third variable."',
      modelAnswer: 'Key things to check:\n(1) Were other initiatives running in the same period (newsletter, press releases, seasonal effects)?\n(2) Is there a comparison against an unexposed control group?\n(3) Is the direction "ad spend -> revenue," or could it be reversed: "the busy season made it possible to spend more on ads"?\n\nIn one sentence: "Without quantifying co-occurring changes in the same period and comparing against a non-exposed group, you cannot claim causation."',
      points: [
        'Before/after alone cannot rule out third variables',
        'Always check direction (A -> B or B -> A)',
        'A control group (a comparison set) is the key to causal inference',
      ],
    },
  ],
}
// ========================================
// Map
// ========================================
export const criticalLessonMapEn: Record<number, LessonData> = {
  40: criticalIntro,
  41: criticalFallacy,
  42: criticalData,
  43: criticalQuestion,
  69: criticalBias,
  71: criticalCorrelation,
}
