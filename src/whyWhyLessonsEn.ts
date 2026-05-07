import type { LessonData } from './lessonData'

// ========================================
// 5 Whys / Why-Why Analysis Lessons (ID: 340-346)
// English version
// ========================================

// ── Lesson 340: Intro ──────────────────────────────────────
const whyWhyIntro: LessonData = {
  id: 340,
  title: '5 Whys 101 — from symptom relief to root-cause cure',
  category: 'Why-Why Analysis',
  steps: [
    {
      type: 'explain',
      title: 'Symptom relief vs. root-cause cure',
      content:
        'You have a recurring headache. Two options:\n\nSymptom relief: take a painkiller (silence the pain temporarily)\nRoot-cause cure: find why the headache keeps coming back and remove the cause (sleep? posture? eyesight?)\n\nBusiness works the same way.\nJump on surface symptoms and they keep returning.\nReach the root cause and you can stop the recurrence.\n\n5 Whys is the most fundamental technique for getting from a surface symptom to its true cause.',
      visual: 'WhyWhySymptomVsRootDiagram',
    },
    {
      type: 'quiz',
      question: 'Which of these is symptom relief, not a root-cause approach, for "meetings keep running over"?',
      options: [
        { label: 'Set a hard alarm at the meeting end time', correct: true },
        { label: 'Ask 5 times why the agenda is not respected', correct: false },
        { label: 'Redesign how decisions are made and share the criteria in advance', correct: false },
        { label: 'Make attendance optional for non-essential participants', correct: false },
      ],
      explanation:
        'A hard alarm temporarily caps the symptom but never asks why meetings overrun. If the cause is "vague agendas" or "no decision-maker present," the alarm changes nothing — the same problem recurs next week.',
    },
    {
      type: 'explain',
      title: 'Why "5" times?',
      content:
        '5 Whys uses "five" as a rough target, not a magic number. It is a heuristic.\n\n• 1–2 whys: you usually only restate the symptom\n• 3 whys: you reach the immediate cause\n• 4–5 whys: you reach the structural / system level\n• 6+ whys: often beyond your team\'s control (economy, society)\n\n"5" is a rough indicator that you have reached a layer where you can actually act.\nThe goal is not to hit five mechanically — it is to stop where your team has the authority to fix the structure.',
      visual: 'WhyWhyChainDiagram',
    },
    {
      type: 'quiz',
      question: 'What does "5 times" really mean?',
      options: [
        { label: 'A magic number Toyota discovered that always lands on the answer', correct: false },
        { label: 'A rule-of-thumb target for reaching a structural layer your team can act on', correct: true },
        { label: 'An industry-wide standard below which analysis is considered insufficient', correct: false },
        { label: 'The rough limit of human attention', correct: false },
      ],
      explanation:
        'Five is just a heuristic. Sometimes three whys are enough; sometimes you need seven. The point is reaching a layer where your team can actually act.',
    },
    {
      type: 'explain',
      title: '5 Whys vs. a Why-tree (logic tree)',
      content:
        'They look similar but serve different goals.\n\n【5 Whys】\nDrill down a single phenomenon vertically.\nWhy → Why → Why in a single chain.\nGoal: pin down one root cause.\n\n【Why-tree (logic tree)】\nFan out a single phenomenon horizontally.\nList possible causes MECE-style.\nGoal: enumerate candidate causes and prioritize.\n\nIn practice you combine the two.\nFirst expand the Why-tree to surface candidates, then drill the most likely one with 5 Whys.',
      visual: 'WhyWhyVsLogicTreeDiagram',
    },
    {
      type: 'quiz',
      question: 'Sales on your e-commerce site dropped. What should you do first?',
      options: [
        { label: 'Pick one cause hypothesis and drill it 5 times immediately', correct: false },
        { label: 'Use a Why-tree to enumerate candidates, then drill the strongest one with 5 Whys', correct: true },
        { label: 'Apply symptom relief by raising ad spend', correct: false },
        { label: 'Escalate to leadership and wait for direction', correct: false },
      ],
      explanation:
        'When several causes are plausible, jumping into one chain wastes time on the wrong drill. A Why-tree first surfaces options; then 5 Whys deepens the most promising candidate.',
    },
  ],
}

// ── Lesson 341: Toyota and the classic example ──────────
const whyWhyToyota: LessonData = {
  id: 341,
  title: 'The Toyota Production System — Ohno\'s "machine stopped"',
  category: 'Why-Why Analysis',
  steps: [
    {
      type: 'explain',
      title: 'TPS and the 5 Whys',
      content:
        '5 Whys was codified by Taiichi Ohno inside the Toyota Production System (TPS).\n\nTwo pillars of TPS:\n• Just-In-Time (the right thing, in the right amount, at the right time)\n• Jidoka (autonomation — stop the machine the moment something is abnormal)\n\nOnly when Jidoka makes abnormalities visible can you ask "why did it stop?" at all.\n\nIn other words, 5 Whys requires a system that surfaces abnormalities. In a culture of cover-ups, 5 Whys cannot work.',
    },
    {
      type: 'explain',
      title: 'Classic example: the machine stopped',
      content:
        'Ohno\'s most famous example:\n\nQ1: Why did the machine stop?\nA1: A fuse blew because of an overload.\n\nQ2: Why was there an overload?\nA2: The bearing was not lubricated enough.\n\nQ3: Why wasn\'t it lubricated enough?\nA3: The lubrication pump wasn\'t pumping enough oil.\n\nQ4: Why wasn\'t the pump pumping enough?\nA4: The pump shaft was worn and rattling.\n\nQ5: Why was the shaft worn?\nA5: There was no strainer attached, so metal scraps got in.\n\n→ Real fix: install a strainer.',
      visual: 'WhyWhyToyotaDiagram',
    },
    {
      type: 'quiz',
      question: 'Why is "just replace the fuse" (stopping at Q1) not enough?',
      options: [
        { label: 'Because fuses run out of stock', correct: false },
        { label: 'Without a strainer, metal scraps keep entering and the same failure recurs', correct: true },
        { label: 'Because repair costs are not logged', correct: false },
        { label: 'Because TPS forbids fuse replacements', correct: false },
      ],
      explanation:
        'Fuse replacement is symptom relief. The root cause (no strainer → metal scraps → shaft wear) is untouched, so the failure recurs cyclically and machine life shortens.',
    },
    {
      type: 'explain',
      title: 'Jidoka and the Andon cord',
      content:
        'For 5 Whys to work, Toyota needs a system that makes abnormalities visible immediately.\n\n• Jidoka: machines auto-stop when they detect abnormality\n• Andon: a worker pulling a cord lights a board so the whole line knows something is wrong\n\nIn a culture of "stopping the line gets you in trouble," nothing gets reported.\nWhen "stopping the line is the right thing to do," the targets of 5 Whys finally surface.\n\nIn short: psychological safety and 5 Whys come as a pair.',
    },
    {
      type: 'quiz',
      question: 'What is the most important precondition for 5 Whys to work in an organization?',
      options: [
        { label: 'The analyst is trained in formal logic', correct: false },
        { label: 'A culture of psychological safety where abnormalities can be stopped and shared without blame', correct: true },
        { label: 'A dedicated tool or template is rolled out company-wide', correct: false },
        { label: 'Leadership reviews analysis results weekly', correct: false },
      ],
      explanation:
        'No matter how good the technique, nothing flows in if abnormalities are hidden. Toyota\'s Jidoka and Andon are mechanisms for surfacing abnormalities — the bedrock that makes 5 Whys work.',
    },
  ],
}

// ── Lesson 342: Basic steps and stopping criteria ─────────
const whyWhyBasicSteps: LessonData = {
  id: 342,
  title: 'Basic steps and how to judge "this is the root cause"',
  category: 'Why-Why Analysis',
  steps: [
    {
      type: 'explain',
      title: 'Step 1 — write the phenomenon concretely',
      content:
        'A vague start makes every following why vague.\n\nBad: "Sales are down."\nGood: "Brand A\'s in-store March sales dropped 15% YoY (women in their 40s drove 25% of the decline)."\n\nChecklist:\n• When, where, who, what, how much\n• Are numbers in there?\n• Are you using "who" to identify the situation, not to hunt a culprit?\n\nThe more concrete the start, the more concrete every layer becomes.',
    },
    {
      type: 'quiz',
      question: 'Which of these phenomena is the best starting point for 5 Whys?',
      options: [
        { label: 'Employee morale is dropping', correct: false },
        { label: 'The company is heading the wrong way', correct: false },
        { label: 'Three early-career sales reps (2nd-year) resigned consecutively in April', correct: true },
        { label: 'Something feels off lately', correct: false },
      ],
      explanation:
        'The more "when, who, what, how much" is pinned down, the easier the drill. "Three 2nd-year reps in April" lets you cut by team, manager, work content, peer relationships — concrete drill paths.',
    },
    {
      type: 'explain',
      title: 'Step 2 — does the causation actually hold?',
      content:
        'Check each "why" answer against causation.\n\nTwo checks:\n① Forward: does "A causes B" read naturally?\n② Counterfactual: if we removed A, would B still happen?\n\nExample: "Missed the train → arrived late"\n① "Because I missed the train, I was late" — natural\n② "If I had not missed the train, would I have been on time?" — Yes, natural\n\nIf the counterfactual fails ("we removed A, but B still happens"), A is not really the cause.\n\nExample: "It rained → sales dropped"\n→ If sales also drop on dry days, rain is not the main driver.',
    },
    {
      type: 'quiz',
      question: 'Which is the right counterfactual to test "exit rate up → revenue down"?',
      options: [
        { label: '"If exit rate had not risen, would revenue have stayed flat?"', correct: true },
        { label: '"If revenue had not dropped, would exit rate have stayed flat?"', correct: false },
        { label: '"Is there an industry benchmark where both are dropping?"', correct: false },
        { label: '"Did exit rate rise before revenue dropped in time?"', correct: false },
      ],
      explanation:
        'The counterfactual is "remove A and B no longer happens." Reversing cause and effect, or only checking time order, are not enough to establish causation.',
    },
    {
      type: 'explain',
      title: 'Step 3 — when to stop',
      content:
        'Drilling too deep or too shallow both fail.\n\nStopping rule:\n• Have we reached a layer where our team has authority to act?\n• Are we hitting external factors ("the economy is bad," "population is shrinking")? — too deep\n\nExample: "Repeat rate dropped"\n→ Our product lost appeal (✓ actionable)\n→ Customers\' disposable income shrank (✗ external)\n\nWhen you hit external factors, accept them as a precondition and step back to the actionable layer.\n\nToo shallow:\n"Mr. A made a mistake" → unless you ask "why was there no system to catch it," it recurs.',
      visual: 'WhyWhyStopRuleDiagram',
    },
    {
      type: 'quiz',
      question: 'Quality complaints are up. Where is it appropriate to stop?',
      options: [
        { label: '"The on-site staff is inexperienced" (blames a person)', correct: false },
        { label: '"The OJT process for new hires has no inspection checklist" (a system you can fix)', correct: true },
        { label: '"The whole industry has a worsening labor shortage" (external)', correct: false },
        { label: '"Japanese manufacturing is in decline" (societal)', correct: false },
      ],
      explanation:
        'Stopping at "a person" produces blame. Stopping at "industry" or "society" leaves no actionable lever. "No checklist in OJT" is a system gap your team can fix — the right stopping point.',
    },
  ],
}

// ── Lesson 343: Pitfalls ──────────────────────────────────
const whyWhyPitfalls: LessonData = {
  id: 343,
  title: 'Pitfalls — blaming people, leaping, abstracting',
  category: 'Why-Why Analysis',
  steps: [
    {
      type: 'explain',
      title: 'Pitfall ① stopping at a person',
      content:
        'The most common failure: ending at "Mr. A was careless" or "the operator missed a check."\n\nWhen people are the cause:\n• It becomes blame, not prevention\n• Replace the person → the same issue returns\n• Future abnormalities go unreported because reporters get blamed\n\nFix: translate "a person did it" into "the system was missing X."\n\n× "Operator B mistyped a value"\n○ "There was no auto-validation on the input field"\n○ "There was no double-check process"\n○ "The manual was outdated and never updated"\n\nAsk the system, not the person. This is the iron rule of 5 Whys.',
      visual: 'WhyWhyPitfallsDiagram',
    },
    {
      type: 'quiz',
      question: 'A 5-Whys analysis stopped at "Ms. C forgot to reply to a customer." What is the right next question?',
      options: [
        { label: 'Why does Ms. C have a forgetful personality?', correct: false },
        { label: 'Who else should be punished instead?', correct: false },
        { label: 'Why did the system have no way to catch a missed reply?', correct: true },
        { label: 'How many mistakes has Ms. C made historically?', correct: false },
      ],
      explanation:
        'Translate the personal lapse into a structural gap: missing reminder, no escalation alert, no visibility of pending replies. Now systems-level fixes become available.',
    },
    {
      type: 'explain',
      title: 'Pitfall ② logical leaps',
      content:
        'A leap is when two consecutive whys skip layers in between.\n\nExample (with leap):\nQ1: Why did sales drop?\nA1: Customer purchase intent dropped.\nQ2: Why did intent drop?\nA2: Because we posted less on social media. ← leap\n\nMissing layers: less posting → lower awareness → fewer recall → lower intent.\n\nHow to check:\nFor each pair, ask "does A alone produce B, even with no other factors?" If yes, it holds.\n\nTips to prevent leaps:\n• Move only one step at a time (no two-step jumps)\n• When the wording goes abstract, force one step of concretization\n• Explain the chain to a third party and let them flag the leap',
    },
    {
      type: 'quiz',
      question: '"Sales close rate dropped → reps\' motivation is low" — what is the issue?',
      options: [
        { label: 'It ignores variation across reps', correct: false },
        { label: 'It skips the layers in between (activity volume, deal quality, lead quality) and jumps to emotion', correct: true },
        { label: 'Motivation cannot be measured, so it cannot be analyzed', correct: false },
        { label: 'It looks at sellers, not customers', correct: false },
      ],
      explanation:
        'Many layers sit between close rate and motivation: activity volume, deal quality, deal difficulty, lead source. Jumping straight to emotion masks the real structural causes (lead quality, product fit, competition).',
    },
    {
      type: 'explain',
      title: 'Pitfall ③ over-abstraction',
      content:
        'Are you stopping at "communication issues," "lack of training," "cultural problem"?\n\nAbstract terms feel comfortable, but they do not lead to action.\n\nWhen an answer goes abstract, force one step of concretization.\n\nQ: Why is cross-team alignment poor?\n× A: Communication is lacking (no concreteness)\n○ A: Sales and engineering meet only quarterly, so spec changes take 2 weeks to propagate\n\nConcretization tips:\n• Add when / where / how\n• Insert numbers (frequency, duration, percentage)\n• Ask "in which exact situation does this show up?"',
    },
    {
      type: 'quiz',
      question: 'Which "why" answer below is too abstract to act on?',
      options: [
        { label: 'Each team uses a different task tool, so progress is not visible in one place', correct: false },
        { label: 'The team lacks a sense of unity', correct: true },
        { label: 'No decision-maker is in the room, so every meeting ends with "let me bring it back"', correct: false },
        { label: 'Estimates are routinely 15% optimistic at the proposal stage', correct: false },
      ],
      explanation:
        '"Sense of unity" tells you nothing about what to fix. The other answers point to concrete systems or behaviors with available levers.',
    },
  ],
}

// ── Lesson 344: Parallel branches and lateral spread ─────
const whyWhyParallel: LessonData = {
  id: 344,
  title: 'Parallel branches and lateral spread — beyond a single chain',
  category: 'Why-Why Analysis',
  steps: [
    {
      type: 'explain',
      title: 'The limit of a single chain',
      content:
        'Textbooks draw 5 Whys as a single chain Q1→A1→Q2→A2…\nReal problems are usually multi-causal.\n\nExample: "Repeat rate dropped" likely has multiple causes:\n• Product appeal weakened\n• Delivery delays\n• Customer support quality dropped\n• Competitor pricing\n\nThese are independent. A single chain misses the other branches.\n\nFix: list multiple "whys" in parallel at each layer.',
    },
    {
      type: 'explain',
      title: 'How to run a parallel branch',
      content:
        'At Why1, list candidate causes in parallel.\n\nRepeat rate ↓\n├ Product appeal ↓\n├ Delivery delays\n├ Support quality ↓\n└ Competitor pricing\n\nDrill each branch independently.\n\nHow to focus:\n• Rank branches by impact × feasibility\n• Factor in verification difficulty (how fast can you get evidence?)\n• You do not have to drill all branches 5 layers deep — start with the strongest\n\n5 Whys is a tree, not a line.',
      visual: 'WhyWhyParallelDiagram',
    },
    {
      type: 'quiz',
      question: 'You want to analyze "the app\'s churn rate is up" with parallel branches. Which is the best Why1 set?',
      options: [
        { label: 'Increase push notifications / send more email / launch a campaign', correct: false },
        { label: 'Lower motivation to keep using / migration to alternatives / failed onboarding / pricing dissatisfaction', correct: true },
        { label: 'Year-over-year churn / competitor churn / industry average / our 3-year average', correct: false },
        { label: 'CEO direction / engineering org / marketing budget / customer support team', correct: false },
      ],
      explanation:
        'Why1 is for candidate causes, not actions, not data slices, not org charts. Choose hypotheses you can drill further.',
    },
    {
      type: 'explain',
      title: 'Lateral spread — does this happen elsewhere?',
      content:
        'Finding a root cause is not the end.\nAsk whether the same root cause hides in other phenomena.\n\nExample: Factory A had "no strainer" on its line.\n→ Check Factory B and C\'s same-model machines for missing strainers.\n\nThis is "lateral spread" (横展開, yokotenkai).\n\nBenefits:\n• One analysis prevents many failures\n• "Only the team that found it knows" becomes "the org knows"\n• Organizational learning accelerates\n\n5 Whys without lateral spread is whack-a-mole.',
    },
    {
      type: 'quiz',
      question: 'Which is the right "lateral spread" question?',
      options: [
        { label: 'Restart the 5 Whys from the top', correct: false },
        { label: 'Check whether the same root cause is latent in other products, departments, or regions', correct: true },
        { label: 'Survey whether competitors face the same problem', correct: false },
        { label: 'Check whether the same person made other mistakes', correct: false },
      ],
      explanation:
        'Lateral spread means scanning your own organization for the same structural gap in similar contexts (same machine model, same process type, same conditions).',
    },
    {
      type: 'think',
      question: 'Pick a small operational issue you ran into recently. List 3 or more parallel candidate causes at the Why1 layer.',
      hint: 'Do not chain yet — first ask "what other causes could there be?" Vary the axes: product, people, process, environment, timing.',
      modelAnswer:
        'Phenomenon: "Last week\'s client proposal slipped 3 days past the deadline."\n\nWhy1 (parallel):\n① Manager review took 3× the expected time\n② Pulling the necessary internal data took 2 days\n③ The client added requirements twice mid-engagement\n④ My initial estimate was too optimistic on hours\n\nYou do not need the right answer yet. Listing them in parallel makes it clear that "if ① is the cause, set up a recurring review; if ② is, fix internal data access; if ④ is, reform the estimating procedure" — different roots imply different fixes.',
      points: [
        'List several branches in parallel before drilling',
        'Do not rush to pick the right one',
        'Vary the axes: product / people / process / environment / timing',
      ],
    },
  ],
}

// ── Lesson 345: Verifying each layer with evidence ────────
const whyWhyEvidence: LessonData = {
  id: 345,
  title: 'Backing each layer with evidence',
  category: 'Why-Why Analysis',
  steps: [
    {
      type: 'explain',
      title: '5 Whys is a chain of inferences',
      content:
        'Even if Q→A repeats logically 5 times, every step might still be conjecture.\n\nExample: "Because the bearing was not lubricated enough."\n→ Did anyone actually verify the lubrication state? With what?\n\nEach layer is a hypothesis, not a fact.\nActing on unverified hypotheses risks burning time and money on the wrong fix.\n\nThe work of "backing each layer with evidence" is verification.\n5 Whys and hypothesis verification come as a pair.',
      visual: 'WhyWhyEvidenceDiagram',
    },
    {
      type: 'quiz',
      question: 'What is the risk of a 5 Whys analysis with no evidence?',
      options: [
        { label: 'It looks plausible, but the first hypothesis is wrong and the chosen fix misses entirely', correct: true },
        { label: 'The analysis takes too little time', correct: false },
        { label: 'You cannot report it to leadership', correct: false },
        { label: 'Lateral spread becomes harder', correct: false },
      ],
      explanation:
        'Even a beautifully written chain can be wrong from layer 1, and then 4 more layers compound the error. The fix is rolled out boldly but produces no result. Unverified 5 Whys produces "elegant wrong answers."',
    },
    {
      type: 'explain',
      title: 'Verification methods by layer',
      content:
        'Different layers call for different evidence.\n\nSurface layer (concrete events):\n• Sales data, KPIs, logs\n\nMiddle layer (operations, behaviors):\n• Direct observation on the floor\n• Interviews with operators\n• Logs of activity, email trails\n\nDeep layer (systems, policies):\n• Document/regulation review\n• Hearing from people who set the rule\n• Comparison with similar phenomena\n\nTip: write the supporting evidence next to each layer.\nLayers with empty evidence boxes are still hypotheses.',
    },
    {
      type: 'quiz',
      question: 'Best way to verify the layer "the on-site team is moving slowly"?',
      options: [
        { label: 'Ask the manager whether the floor is slow', correct: false },
        { label: 'Spend half a day on the floor and measure footpaths, wait time, and changeover counts', correct: true },
        { label: 'Ask the operators "do you think you are slow?"', correct: false },
        { label: 'Look up industry-average operation speeds', correct: false },
      ],
      explanation:
        '"Slow" can be due to actual motion speed, or wait time, or changeover loss. Direct measurement reveals which one — only then do you know the real driver.',
    },
    {
      type: 'explain',
      title: 'Falsifiability — "what would I see if this were wrong?"',
      content:
        'Good hypotheses are falsifiable. Write the falsification condition next to each one.\n\nExample: "Product A doesn\'t sell because the price is too high."\nFalsification: "If we drop the price 10% and sales don\'t move, price is not the main driver."\n\nWriting the falsification first lets you:\n• Avoid post-hoc convenient interpretations\n• Move to the next branch quickly when a hypothesis fails\n• Make verification a clean yes/no\n\nA hypothesis with no falsification path is not a hypothesis.\nIt is a belief — and beliefs cannot be analyzed.',
    },
    {
      type: 'quiz',
      question: 'Which hypothesis is too unfalsifiable to use in analysis?',
      options: [
        { label: 'When delivery delays exceed 15%, repeat rate falls', correct: false },
        { label: 'The product does not match the customer\'s lifestyle', correct: true },
        { label: 'Below 10% awareness among women in their 20s, sales stall', correct: false },
        { label: 'When first-response time exceeds 30 minutes, satisfaction drops', correct: false },
      ],
      explanation:
        '"Doesn\'t match the lifestyle" cannot be measured cleanly and can always be reinterpreted after the fact. The other options carry numeric falsification thresholds.',
    },
  ],
}

// ── Lesson 346: Practice cases ────────────────────────────
const whyWhyPractice: LessonData = {
  id: 346,
  title: 'Practice cases — defects, services, organizations',
  category: 'Why-Why Analysis',
  steps: [
    {
      type: 'case',
      title: 'Scenario ① rising defect rate on the factory floor',
      situation:
        'You manage production at a parts factory. Last month, the defect rate of part X rose from 0.5% to 2.1%. You are still hitting deadlines, but scrap costs are up by 2M JPY/month. Leadership asks for cause and countermeasure.',
      phases: [
        {
          info: 'Concretizing: the defect rate started rising 3 weeks ago. Of lines A, B, and C producing X, only line A is affected. The defects appear on a single inspection criterion (dimensional precision) on line A.',
          question: 'What should the very first "why" focus on?',
          options: [
            { label: 'Why is quality declining across the manufacturing industry?', correct: false, feedback: 'Industry-level reasoning is outside the scope (line A, dimensional precision). General talk is the wrong starting point.' },
            { label: 'Why is the dimensional defect happening only on line A and not on B or C?', correct: true, feedback: 'Right. Scoping it lets you compare A vs. B/C across man/machine/material/method/environment.' },
            { label: 'Why are the line A operators careless?', correct: false, feedback: 'You have just blamed the people. Translate it into a system question first.' },
            { label: 'Why is the scrap cost exactly 2M JPY?', correct: false, feedback: 'Cost framing is useful for prioritization but not for cause analysis.' },
          ],
        },
        {
          info: 'Observation: machine, material, and method on line A match B and C. The only difference: 3 weeks ago, line A\'s operator changed (veteran → new hire).',
          question: 'Is "the new hire is causing it" a valid stopping point?',
          options: [
            { label: 'Yes — root cause confirmed: lack of new-hire skill', correct: false, feedback: 'Stopping at "the person" means swapping people will not solve it. You must ask why the system breaks when a new hire arrives.' },
            { label: 'No — drill further into "why does quality drop when a new hire is assigned?"', correct: true, feedback: 'Right. The real problem is missing safeguards for new-hire transitions: OJT checklist, reinforced inspection in early periods, etc.' },
            { label: 'Yes — rotate the new hire out and the issue is fixed', correct: false, feedback: 'Symptom relief. The next new hire reproduces the problem.' },
            { label: 'No — investigate the new hire\'s personality', correct: false, feedback: 'You are blaming the individual. Ask the system instead.' },
          ],
        },
        {
          info: 'Drilling further: line A\'s dimensional inspection relied on the veteran\'s "intuition." The new hire follows the formal checklist but lacks the experience to detect subtle anomalies by feel.',
          question: 'What is the cleanest way to write the root cause?',
          options: [
            { label: 'New hire lacks experience', correct: false, feedback: 'This blames the person. Rewrite as a system gap.' },
            { label: 'Dimensional inspection criteria are tacit knowledge and have never been encoded into a measurement-based checklist', correct: true, feedback: 'Right. This invites concrete fixes: numeric thresholds, instruments, sample comparison sheets.' },
            { label: 'The HR decision to rotate the veteran out', correct: false, feedback: 'HR sequencing is upstream of the operational gap; not the working layer.' },
            { label: 'The defect-rate threshold was set too leniently', correct: false, feedback: 'Thresholds judge the symptom; they do not cause defects.' },
          ],
        },
      ],
      conclusion:
        '【Lessons】\n• Scoping (line A only, dimensional precision only) makes the drill concrete.\n• Even when "a person" looks like the cause, translate it into "a missing system that supports the person."\n• Lateral spread: check whether B and C also have tacit-knowledge inspection, and whether other parts repeat the same gap.',
    },
    {
      type: 'case',
      title: 'Scenario ② SaaS churn is rising',
      situation:
        'You run customer success at a B2B SaaS. Monthly churn rose from 2.0% to 4.2% over the last 3 months. The CEO wants cause and countermeasure by next month.',
      phases: [
        {
          info: 'Data shows churn is concentrated in users with <3 months of tenure. Long-term users (1+ year) churn at the same rate as before.',
          question: 'What is the right next "why"?',
          options: [
            { label: 'Why is industry-wide SaaS churn rising?', correct: false, feedback: 'External; no actionable lever for your team.' },
            { label: 'Why is churn rising specifically among <3-month-tenure new users?', correct: true, feedback: 'Right. The scope opens up onboarding and time-to-value hypotheses.' },
            { label: 'Why is the CEO impatient?', correct: false, feedback: 'Internal politics, not cause analysis.' },
            { label: 'Why are long-term users not leaving?', correct: false, feedback: 'Useful as a comparison but drifts from the actual problem (new-user churn).' },
          ],
        },
        {
          info: 'Among new users, those who used core feature X in their first month churn at 2%. Those who did not use X churn at 7%. You shipped a major UI overhaul to X 3 months ago.',
          question: 'Which set of parallel cause hypotheses is best?',
          options: [
            { label: 'UI overhaul made entry to X harder for beginners / onboarding docs are outdated / early support coverage changed', correct: true, feedback: 'Right. Independent candidates that can each be verified.' },
            { label: 'Drop the price / run a campaign / build a competitor comparison page', correct: false, feedback: 'These are actions, not causes. 5 Whys deepens "why," not "what to do."' },
            { label: 'Ask CEO, CFO, CTO for opinions', correct: false, feedback: 'Internal opinions instead of user-side phenomena.' },
            { label: 'Read every churn-survey freeform comment', correct: false, feedback: 'A reasonable action, but not a Why1 hypothesis.' },
          ],
        },
        {
          info: '10 user interviews: 7 of them describe being unable to find the entry point for feature X after the redesign and giving up before activation.',
          question: 'Best root-cause + countermeasure pair?',
          options: [
            { label: 'Cause: "no beginner-flow validation in the UI-change release process" / Fix: "make onboarding test mandatory pre-release"', correct: true, feedback: 'Right. A system-level fix. Lateral spread: audit other UI changes for the same gap.' },
            { label: 'Cause: "the UI overhaul" / Fix: "revert the UI"', correct: false, feedback: 'Symptom relief. The cause is the missing validation step, not the change itself.' },
            { label: 'Cause: "too many beginners" / Fix: "target only advanced users"', correct: false, feedback: 'Extreme; redefines the business away from the actual issue.' },
            { label: 'Cause: "CS is undersupplied at onboarding" / Fix: "hire more CS"', correct: false, feedback: 'Hiring may help, but it does not address the missing pre-release validation gap.' },
          ],
        },
      ],
      conclusion:
        '【Lessons】\n• Use parallel branches (UI / docs / support coverage) at Why1.\n• Verify each layer with data and interviews.\n• The root cause is not "the UI overhaul" itself but "the absence of beginner-flow validation in the release process."\n• Lateral spread: audit other releases for the same gap.',
    },
    {
      type: 'think',
      question: 'A manager says decision-making in the org has slowed down recently and asks you to run 5 Whys. Holding the rule "ask the system, not the person," write 3 parallel candidate causes at Why1.',
      hint: 'Avoid "Mr. X cannot decide." Think in terms of "the venue / the criteria / the information / the authority" — system levers.',
      modelAnswer:
        'Why1 (parallel) example:\n\n① The decision venue (recurring meeting) runs on agendas and attendees only — the decision criteria and deadlines are not pre-shared.\n→ Verification: in the last 10 meeting minutes, what % had pre-shared criteria and deadlines?\n\n② The information needed for a call is not ready until the meeting starts, so decisions get "tabled."\n→ Verification: classify recent "tabled" items by reason.\n\n③ Authority is ambiguous — unclear which decisions need executives vs. on-site managers.\n→ Verification: classify the last 30 decisions as "field-decided" vs. "exec-decided" and see what % of field-eligible items were escalated.\n\nEach branch carries a falsifiable verification path. After verification, drill the strongest branch deeper.',
      points: [
        'Frame causes as system gaps, not personal traits',
        'Attach a falsifiable verification method to each branch',
        'Avoid abstract stops like "communication issues"',
      ],
    },
    {
      type: 'explain',
      title: 'Course wrap-up — five principles',
      content:
        'Across the 7 lessons, the five principles of 5 Whys:\n\n①【Concretize】write the phenomenon with 5W1H and numbers\n②【Causation check】for every layer, run "remove A and would B still happen?"\n③【Stop where it acts】halt at a structural layer your team can act on\n④【System, not person】translate "Ms. A did X" into "the system did not catch X"\n⑤【Falsifiable】write "what would I see if this is wrong?" beside each layer\n\nPlus three extensions:\n• Parallel branches: list multiple whys at the same layer\n• Verification: back each layer with observation, data, interviews\n• Lateral spread: check whether the same root cause hides elsewhere\n\nWith these, 5 Whys turns from whack-a-mole into a real recurrence-prevention technique.',
    },
  ],
}

export const whyWhyLessonMapEn: Record<number, LessonData> = {
  340: whyWhyIntro,
  341: whyWhyToyota,
  342: whyWhyBasicSteps,
  343: whyWhyPitfalls,
  344: whyWhyParallel,
  345: whyWhyEvidence,
  346: whyWhyPractice,
}
