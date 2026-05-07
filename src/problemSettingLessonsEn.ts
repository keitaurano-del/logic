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
        { label: 'Decide whether to ban overtime by policy', correct: false },
        { label: 'Identify the root cause of the overtime (workload? skill? process?)', correct: true },
        { label: 'Calculate the cost of overtime pay', correct: false },
        { label: 'Research how other companies cut overtime', correct: false },
      ],
      explanation:
        'Before jumping to "how do we cut overtime?", problem-setting means identifying "why is there so much overtime?". The fix changes completely — more headcount if it is workload, training if it is skill, automation if it is process.',
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
        { label: 'Should we increase ad spend?', correct: false },
        { label: 'Should we redesign the site?', correct: false },
        { label: 'Identify the drivers of the revenue drop and act on the highest-impact one', correct: true },
        { label: 'Should we study competitor e-commerce sites?', correct: false },
      ],
      explanation:
        '"Increase ad spend" or "redesign the site" are solutions, not issue-setting. Proper issue-setting starts with "what is the largest driver of the revenue drop?" Once the driver is known, the right fix follows naturally.',
    },
    {
      type: 'explain',
      title: 'The Where -> Why -> How framework',
      content:
        'For problem setting, the order "Where -> Why -> How" works well.\n\n[Where] Where is the problem?\nRevenue = Customers x Average ticket x Purchase frequency\n-> "Customers" are dropping (locate the problem)\n\n[Why] Why is that problem happening?\n-> New customers are growing, but existing customers are repeating less\n-> Repeat decline is caused by dissatisfaction with delivery delays\n\n[How] How do we fix it?\n-> Re-evaluate delivery partners\n-> Real-time delivery status notifications\n-> Auto-issue coupons on delays\n\nIf you skip Where/Why and jump to How,\nyou waste time and money on solutions that miss the target.',
    },
    {
      type: 'quiz',
      question: 'For the problem "DAU (daily active users) of our app is low," in a Where -> Why -> How analysis, what should you check at the Where stage?',
      options: [
        { label: 'Interview users about why they don\'t use it', correct: false },
        { label: 'Send more push notifications to drive usage', correct: false },
        { label: 'Decompose: are new users dropping off on day one, or are existing users using it less often?', correct: true },
        { label: 'Compare DAU to a competitor app', correct: false },
      ],
      explanation:
        'Where is "locate the problem." Whether the cause of low DAU is "new-user day-one drop-off" or "lower frequency among existing users" completely changes which Why to dig into and which How to apply.',
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
        { label: 'How to lay out the office', correct: false },
        { label: 'Who is the target customer for this business', correct: true },
        { label: 'What the market size will be 5 years out', correct: false },
        { label: 'How to design the logo', correct: false },
      ],
      explanation:
        'Until you know the target customer, you cannot decide product, price, or distribution. The other items should be discussed only after the target is set. Issue priority is judged by "what blocks all downstream decisions until it is settled."',
    },
    {
      type: 'explain',
      title: 'Prioritizing issues — a 2x2 matrix',
      content:
        'When there are many issues, working on all of them is inefficient.\nA 2x2 matrix to set priorities:\n\n           High Impact\n        ┌────────┬────────┐\n  Easy  │ Quick  │  Top   │\n        │  Win   │ Priority│\n        ├────────┼────────┤\n  Hard  │ Defer  │ Strategic│\n        │        │  Plan  │\n        └────────┴────────┘\n           Low Impact\n\n(1) Top priority (high impact x easy) -> do immediately\n(2) Quick win (low impact x easy) -> do if you have spare cycles\n(3) Strategic plan (high impact x hard) -> work on over the medium/long term\n(4) Defer (low impact x hard) -> don\'t do',
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
      question: 'Which of the following is a properly set "problem"?',
      options: [
        { label: 'Adopt Slack to improve internal communication', correct: false },
        { label: 'Cross-team information sharing is slow; on average it takes 5 days to make a decision', correct: true },
        { label: 'The whole industry is in a downturn', correct: false },
        { label: 'Increase revenue', correct: false },
      ],
      explanation:
        '"Adopt Slack" is a solution; "industry downturn" is uncontrollable; "increase revenue" is too vague. "5-day decision-making delay due to slow info sharing" is concrete and quantified — you can move from there to designing fixes.',
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
        { label: 'Improve the trial-to-paid experience and lift conversion toward the industry average of 15%', correct: true },
        { label: 'Raise instructor wages to improve lesson quality', correct: false },
        { label: 'Survey competitor pricing and cut prices', correct: false },
      ],
      explanation:
        'New sign-ups are strong (+30%), but trial-to-paid conversion is half the industry average (8% vs 15%). That is the bottleneck. Investing more in acquisition is lower ROI than "converting 8% of those 5,000 visitors to 15%." Plug the leak before pouring more water in.',
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
        { label: 'The quality of the solution matters more than the problem setting', correct: false },
        { label: 'The problem does not need to be quantified', correct: false },
        { label: 'When you set the right problem, the solution becomes obvious', correct: true },
        { label: 'Spending too much time on problem setting is inefficient', correct: false },
      ],
      explanation:
        'As Einstein said, most of problem solving rests on "setting the right question." If the problem is set wrong, even an excellent solution misses the target.',
    },
  ],
}

export const problemSettingLessonMapEn: Record<number, LessonData> = {
  53: problemSettingIntro,
  54: problemSettingFramework,
  55: problemSettingPractice,
}
