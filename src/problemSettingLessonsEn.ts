import type { LessonData } from './lessonData'

// ========================================
// Problem Setting Lessons (ID: 53-55)
// ========================================

const problemSettingIntro: LessonData = {
  id: 53,
  title: 'Introduction to Problem Setting — Asking the Right Question',
  category: 'Problem Setting',
  steps: [
    {
      type: 'explain',
      title: 'Why problem setting matters most',
      content:
        'A famous Einstein quote:\n"If I had an hour to solve a problem, I would spend 55 minutes thinking about the problem and 5 minutes solving it."\n\nThe trap most people fall into:\nThey jump straight to "solutions."\nFirst, they should ask "what is the real problem?"\n\nExample:\nSurface problem: "Our sales close rate is low."\n-> Easy fix: "Run a sales training program."\n\nDigging deeper:\n- Maybe the target customers are wrong in the first place?\n- Maybe the product\'s pricing is off-market?\n- Maybe the leads are bad — we are pitching to people who were never going to buy?\n\nWhen you set the right problem, the solution becomes obvious.',
    },
    {
      type: 'quiz',
      question: 'For the issue "employees work too much overtime," what is the best way to set the problem?',
      options: [
        { label: 'Decide whether to ban overtime by policy and enforce it', correct: false },
        { label: 'Identify the root cause of overtime (workload, skill, process)', correct: true },
        { label: 'Calculate the current cost of overtime pay company-wide', correct: false },
        { label: 'Research how other companies have cut overtime and copy them', correct: false },
      ],
      explanation:
        'Before "how do we cut overtime?" comes "why is there so much?" Option 1 jumps to one specific solution and narrows your options; option 3 is cost accounting that doesn\'t reveal causes; option 4 borrows external playbooks without diagnosing the local cause. The fix changes completely depending on the root cause — workload, skill, or process.',
    },
    {
      type: 'explain',
      title: 'Problem vs Issue (Problem-set)',
      content:
        '[Problem]\nThe gap between "what should be" and "what is."\nExample: revenue target $10M, current $7M.\n-> Gap = $3M.\n\n[Issue]\nThe theme you choose to work on in order to close the gap.\nExample: "New customer acquisition cost is too high — we should solve that."\n\nA problem is a phenomenon. An issue is a decision about what to work on.\n\nFor the same problem, how you set the issue changes everything:\n\nProblem: "Young employees have a high attrition rate."\nIssue A: "Should we raise salaries?" -> Costs explode\nIssue B: "Should we increase the sense of growth?" -> Mentorship program\nIssue C: "Should we change hiring criteria?" -> Better matching\n\nWhich issue you pick is the difference between business success and failure.',
    },
    {
      type: 'quiz',
      question: 'Problem: "E-commerce revenue is down 20% YoY." Which is the best-formulated issue?',
      options: [
        { label: 'Should we increase ad spend to drive more traffic?', correct: false },
        { label: 'Should we redesign the site to refresh the experience?', correct: false },
        { label: 'Identify revenue-drop drivers and act on the highest-impact one', correct: true },
        { label: 'Should we benchmark and study competitor e-commerce sites?', correct: false },
      ],
      explanation:
        'Options 1 and 2 leap to specific solutions before knowing the cause; option 4 burns time on external benchmarking that won\'t reveal which internal lever to pull. Proper issue-setting starts with "what is the largest driver?" — once known, the fix follows.',
    },
    {
      type: 'explain',
      title: 'The Where -> Why -> How framework',
      content:
        'For problem setting, the order "Where -> Why -> How" works well.\n\n[Where] Where is the problem?\nRevenue = Customers x Average ticket x Purchase frequency\n-> "Customers" are dropping (locate the problem)\n\n[Why] Why is that problem happening?\n-> New customers are growing, but existing customers are repeating less\n-> Repeat decline is caused by dissatisfaction with delivery delays\n\n[How] How do we fix it?\n-> Re-evaluate delivery partners\n-> Real-time delivery status notifications\n-> Auto-issue coupons on delays\n\nIf you skip Where/Why and jump to How,\nyou waste time and money on solutions that miss the target.',
      visual: 'WhereWhyHowDiagram',
      outro:
        'Holding to Where -> Why -> How in that order is the iron rule of problem setting. Skip the Where and rush to the How, and you watch time and budget melt into solutions that miss the mark. Pinning down where the problem actually lives before designing actions is what makes the whole exercise efficient.',
    },
    {
      type: 'quiz',
      question: 'For the problem "DAU (daily active users) of our app is low," in a Where -> Why -> How analysis, what should you check at the Where stage?',
      options: [
        { label: 'Interview users to understand why they don\'t use the app', correct: false },
        { label: 'Send more push notifications immediately to drive usage', correct: false },
        { label: 'Decompose: day-one new-user drop-off vs lower existing-user frequency', correct: true },
        { label: 'Compare your DAU to a leading competitor app and benchmark', correct: false },
      ],
      explanation:
        'Where is for locating the problem. Option 1 is Why (reason-finding) — premature; option 2 jumps straight to How (action) — even worse; option 4 looks outward when the problem could be located inside. Internal decomposition is the essence of Where.',
    },
  ],
}

const problemSettingFramework: LessonData = {
  id: 54,
  title: 'Issue Analysis — Identifying the Question Worth Solving',
  category: 'Problem Setting',
  steps: [
    {
      type: 'explain',
      title: 'What is an issue?',
      content:
        'From Kazuto Ataka (Yahoo CSO)\'s book "Issue Driven":\n\n"Issue" = a question worth answering.\n\nNot every problem is an issue.\nConditions for an issue:\n- It can be answered (verifiable)\n- Answering it lets you move forward (actionable)\n- It needs to be answered now (timing is right)\n\nWhat distinguishes effective people:\nThey don\'t just chew through every task in front of them.\nThey identify "what issue must we answer right now?".\n\nWhen issue identification is weak,\nyou wander into "the dog\'s path" (low-productivity busywork).',
    },
    {
      type: 'quiz',
      question: 'A new-business planning meeting raises four discussion points. Which has the highest issue priority (must be answered immediately)?',
      options: [
        { label: 'How to design and lay out the new business\'s office space', correct: false },
        { label: 'Who exactly is the target customer for this business', correct: true },
        { label: 'What the market size will look like 5 years from now', correct: false },
        { label: 'How to design the brand logo and visual identity', correct: false },
      ],
      explanation:
        'Until you know the target customer, you cannot decide product, price, distribution, or marketing. Options 1 and 4 can wait until after launch; option 3 matters but cannot be accurately forecast now and doesn\'t block the decision. "What blocks every downstream decision" is the issue-priority test.',
    },
    {
      type: 'explain',
      title: 'Prioritizing issues — a 2x2 matrix',
      content:
        'When there are many issues, working on all of them is inefficient.\nA 2x2 matrix to set priorities:\n\n           High Impact\n        ┌────────┬────────┐\n  Easy  │ Quick  │  Top   │\n        │  Win   │ Priority│\n        ├────────┼────────┤\n  Hard  │ Defer  │ Strategic│\n        │        │  Plan  │\n        └────────┴────────┘\n           Low Impact\n\n(1) Top priority (high impact x easy) -> do immediately\n(2) Quick win (low impact x easy) -> do if you have spare cycles\n(3) Strategic plan (high impact x hard) -> work on over the medium/long term\n(4) Defer (low impact x hard) -> don\'t do',
      visual: 'Two2MatrixDiagram',
      outro:
        'An impact × feasibility 2×2 sorts issues into top priority, quick wins, strategic plan, and defer at a glance. "Do everything" amounts to "do nothing" in practice. Make the priority visible and concentrate resources on the quadrant with the highest payoff.',
    },
    {
      type: 'quiz',
      question: 'A SaaS product has four improvement issues. Which should be the top priority?\nA: Full UI redesign (3 months effort, expected to reduce churn 20%)\nB: Onboarding email overhaul (1 week effort, expected to reduce 1st-month drop-off 10%)\nC: Add a new chart to the dashboard (2 weeks effort, expected +3% usage)\nD: API integration feature (6 months effort, potential to win large new customers)',
      options: [
        { label: 'A: Full UI redesign', correct: false },
        { label: 'B: Onboarding email overhaul', correct: true },
        { label: 'C: New dashboard chart', correct: false },
        { label: 'D: API integration', correct: false },
      ],
      explanation:
        'B has the best ROI: medium-to-large impact x easy execution (1 week). A has high impact but takes 3 months; D has high uncertainty. Take the Quick Win first while planning A and D as strategic projects.',
    },
    {
      type: 'explain',
      title: '"Sky/Rain/Umbrella" — from issue to action',
      content:
        'A McKinsey framework: "Sky/Rain/Umbrella."\n\n[Sky (Fact)] The sky is getting cloudy.\n-> Objective fact / data.\n\n[Rain (Interpretation/Issue)] It looks like it will rain.\n-> The implication or issue derived from the fact.\n\n[Umbrella (Action)] Bring an umbrella.\n-> A specific action to take in response.\n\nApplied example:\nSky: "Last month\'s churn rate was 2x normal (8%)."\nRain: "The recent feature change is unpopular, especially among heavy users, and they are leaving."\nUmbrella: "Bring back a legacy-UI option for heavy users and provide a transition period."\n\nMost people stop at "Sky." People who can deliver "Sky -> Rain -> Umbrella" together get trusted.',
    },
    {
      type: 'quiz',
      question: 'Which of the following is the "Rain (interpretation/issue)" element?\n\nFact: New-graduate applications fell 40% YoY\n??: STEM students\' job-search timing has shifted earlier; our hiring window starts too late\nAction: Move internships from summer to spring',
      options: [
        { label: 'This is "Sky (fact)"', correct: false },
        { label: 'This is "Rain (interpretation/issue)"', correct: true },
        { label: 'This is "Umbrella (action)"', correct: false },
        { label: 'It is none of these', correct: false },
      ],
      explanation:
        '"Hiring window too late" is the interpretation/cause analysis (Rain) of the fact (Sky) "applications fell." This interpretation is what links to the action (Umbrella) "move internships earlier."',
    },
  ],
}

const problemSettingPractice: LessonData = {
  id: 55,
  title: 'Problem-Setting Practice Workshop',
  category: 'Problem Setting',
  steps: [
    {
      type: 'explain',
      title: 'Common pitfalls in problem setting',
      content:
        'Five common pitfalls in problem setting:\n\n[1. Mistaking a solution for a problem]\n"We should adopt a CRM" <- this is a means.\n"Customer information is siloed and not shared" <- this is the issue.\n\n[2. Scope too broad]\n"We should drive DX" <- could mean anything.\n"Sales team takes 3 hours on average to write a quote" <- specific.\n\n[3. Confusing cause and effect]\n"Employee motivation is low" <- this is an effect.\n"The evaluation system is opaque and effort doesn\'t pay off" <- this is the cause.\n\n[4. Picking issues you cannot influence]\n"The exchange rate is unfavorable" <- not under our control.\n"We have no FX risk hedging instruments" <- actionable.\n\n[5. Avoiding quantification]\n"Improve customer satisfaction" <- not measurable.\n"Lift NPS from current +20 to +35" <- measurable.',
    },
    {
      type: 'quiz',
      question: 'Which of the following is a properly set "issue"?',
      options: [
        { label: 'Adopt Slack to improve internal communication speed', correct: false },
        { label: 'Cross-team info sharing is slow; decisions take 5 days on average', correct: true },
        { label: 'The entire industry is in a deep economic downturn this year', correct: false },
        { label: 'Significantly increase revenue across the company this quarter', correct: false },
      ],
      explanation:
        'Option 1 leaps to "Slack" — a specific solution; option 3 names an uncontrollable external factor; option 4 is a vague goal with no quantification. Only option 2 is concrete, quantified, and actionable — the prerequisites for a usable problem statement.',
    },
    {
      type: 'explain',
      title: '[Workshop] Problem-setting challenge',
      content:
        'Try setting the problem for the case below.\n\n[Case]\nYou run an online English-conversation service.\n\nData:\n- Monthly new sign-ups: 5,000 (+30% YoY)\n- Free trial -> paid conversion: 8% (industry average 15%)\n- Monthly paid-customer churn: 5% (industry average 3%)\n- NPS: +10 (industry average +30)\n\nAt first glance, new sign-ups are healthy. But conversion and churn are weak.\n\nFrom this data, set the single most important issue using "Where -> Why -> How."\n\nLet\'s check the answer in the next quiz.',
    },
    {
      type: 'quiz',
      question: 'For the online English-conversation service above, what should be the top-priority issue?',
      options: [
        { label: 'Double the marketing budget to push new sign-ups even higher', correct: false },
        { label: 'Improve trial-to-paid experience design, targeting 15% industry-average conversion', correct: true },
        { label: 'Raise instructor wages to improve overall lesson quality and NPS', correct: false },
        { label: 'Survey competitor pricing and cut prices aggressively to compete', correct: false },
      ],
      explanation:
        'Sign-ups are healthy (+30%) but trial-to-paid is half the industry average (8% vs 15%) — that\'s the bottleneck. Option 1 pours more water into a leaking bucket; option 3 adds cost without directly fixing conversion; option 4 simply erodes margin. Plugging the conversion leak first delivers the best ROI.',
    },
    {
      type: 'explain',
      title: 'Problem-setting summary',
      content:
        'Key takeaways for problem setting:\n\nDistinguish problem (gap) from issue (theme to work on).\nThink in the order Where -> Why -> How.\nUse Sky/Rain/Umbrella to bind fact -> interpretation -> action.\nPrioritize by issue level ("must this be answered now?").\nFrame as a question, not a solution.\nMake it specific, quantified, and actionable.\n\nProblem setting is the entry point of all thinking.\nHypothesis-driven thinking, critical thinking, and design thinking all begin with "asking the right question."\n\nThose who can do this can solve any problem.',
    },
    {
      type: 'quiz',
      question: 'Which is correct about problem setting?',
      options: [
        { label: 'Solution quality matters more than problem-setting quality', correct: false },
        { label: 'A problem can be qualitative and does not need to be quantified', correct: false },
        { label: 'When you set the right problem, the solution becomes obvious', correct: true },
        { label: 'Spending much time on problem setting is inefficient — move fast', correct: false },
      ],
      explanation:
        'Einstein: "55 of every 60 minutes goes to defining the problem." Option 1 is the typical solution-worship error; option 2 ditches measurability and gives up verification; option 4 mistakes speed for value and produces rework. A well-set problem makes the solution self-evident.',
    },
  ],
}

export const problemSettingLessonMapEn: Record<number, LessonData> = {
  53: problemSettingIntro,
  54: problemSettingFramework,
  55: problemSettingPractice,
}
