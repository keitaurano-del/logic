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
        { label: 'Argue against every opinion you hear', correct: false },
        { label: 'Reach your own judgment based on evidence and reasoning', correct: true },
        { label: 'Always defer to famous people', correct: false },
        { label: 'Treat any conclusion supported by lots of data as correct', correct: false },
      ],
      explanation:
        'Critical thinking is not "criticizing." It is the ability to think and decide for yourself, anchored in evidence, logic, and proof. The point is not winning the argument — it is making a better decision.',
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
        { label: 'How experienced the marketing team is', correct: false },
        { label: 'Whether the revenue rise and the campaign are causally linked', correct: true },
        { label: 'How much the campaign cost', correct: false },
        { label: 'What competitors are doing', correct: false },
      ],
      explanation:
        '"We ran a campaign and revenue rose" is just correlation. Without checking causation, you cannot judge correctly. Seasonal effects and changes in the external environment are also possible explanations.',
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
        { label: 'Ad hominem', correct: false },
        { label: 'Appeal to authority', correct: true },
        { label: 'Strawman', correct: false },
        { label: 'Causal fallacy', correct: false },
      ],
      explanation:
        '"A famous consulting firm said it" is an appeal to authority. Even consulting reports get things wrong, and it still has to be checked whether the recommendation fits your specific situation. Judge by content and evidence, not by who said it.',
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
        { label: 'Gather more data', correct: false },
        { label: 'Deliberately seek out disconfirming evidence', correct: true },
        { label: 'Defer to expert opinion', correct: false },
        { label: 'Take a vote', correct: false },
      ],
      explanation:
        'Just gathering more data risks gathering only data that already favors your view. Deliberately asking "what if my hypothesis is wrong?" and looking for counterexamples is the most effective antidote to confirmation bias.',
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
        { label: 'Drinking coffee improves performance', correct: false },
        { label: 'There may be a correlation between coffee intake and performance', correct: true },
        { label: 'High performers personally enjoy coffee', correct: false },
        { label: 'Forcing employees to drink coffee will improve performance', correct: false },
      ],
      explanation:
        '"Heavier drinkers also perform better" is correlation only. It is possible that "people working long hours drink more coffee" or "highly motivated people do both." A separate factor may drive both. You cannot leap from correlation to causation.',
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
        { label: 'Competitor product satisfaction', correct: false },
        { label: 'The number of respondents and any sample bias', correct: true },
        { label: 'The product\'s price range', correct: false },
        { label: 'The product\'s release date', correct: false },
      ],
      explanation:
        'Sample quality first. "80 of 100" and "8 of 10" have very different reliability. Also consider survivorship bias — unsatisfied users may have already left and never responded.',
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
        { label: 'Propose three improvement ideas', correct: false },
        { label: 'Clarify "which part of sales, since when, and why is it low"', correct: true },
        { label: 'Research what competitors are doing', correct: false },
        { label: 'Propose cost cuts', correct: false },
      ],
      explanation:
        'Producing solutions before the problem is clear is premature. By first nailing down "which sales (new/existing/by product), since when (recent or long-standing), and why (initial cause hypothesis)," you avoid wasted answers to the wrong question.',
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
        { label: '"Is our service easy to use?"', correct: false },
        { label: '"The last time you used it, was there anything that gave you trouble?"', correct: true },
        { label: '"On a scale of 5, how would you rate our service?"', correct: false },
        { label: '"Are there features you would like us to improve?"', correct: false },
      ],
      explanation:
        '"What gave you trouble last time you used it?" pulls out concrete experiences in an open way. "Is it easy to use?" tends to end with yes/no, the 5-point scale gives only a number, and "what would you like improved?" is leading and may miss issues the user has not consciously identified.',
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
    },
    {
      type: 'quiz',
      question: 'For a market study on a new product, you only interviewed users who already favor your company and concluded "there is demand." Which bias is this?',
      options: [
        { label: 'Anchoring', correct: false },
        { label: 'Confirmation bias', correct: true },
        { label: 'Sunk cost', correct: false },
        { label: 'Normalcy bias', correct: false },
      ],
      explanation:
        'Gathering only data that flatters your conclusion is confirmation bias. Without also interviewing users who are skeptical or negative, you cannot see real market demand.',
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
        { label: 'Confirmation bias', correct: false },
        { label: 'Anchoring', correct: false },
        { label: 'Sunk cost', correct: true },
        { label: 'Optimism bias', correct: false },
      ],
      explanation:
        'Sunk-cost bias is the trap where you cannot make a rational decision to walk away because of past costs (time, money). Asking "if I were starting from zero today?" lets you reset the past investment and judge the current decision objectively.',
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
        { label: 'The data on coffee and performance was collected incorrectly', correct: false },
        { label: 'Correlation is being mistaken for causation; a third variable (e.g., motivation) is being ignored', correct: true },
        { label: 'It underestimates the effect of coffee', correct: false },
        { label: 'The definition of "performance" is fuzzy, so the analysis is meaningless', correct: false },
      ],
      explanation:
        'Even if "coffee intake" and "performance" correlate, a third variable like "motivated employees both drink more coffee and perform better" is plausible. Coffee may not directly improve performance, so handing out coffee to everyone may have no effect.',
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
        { label: 'The DAU increase is too small', correct: false },
        { label: 'The new feature was released too late', correct: false },
        { label: 'A control group that did not get the new feature for comparison', correct: true },
        { label: 'One week of data is too short', correct: false },
      ],
      explanation:
        'Even with a one-week DAU lift, other factors during that week (push notifications, seasonality, social buzz) could be at play. Without an A/B test or difference-in-differences comparing groups with and without the feature, you cannot claim causation.',
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
