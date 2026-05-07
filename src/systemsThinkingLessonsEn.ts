import type { LessonData } from './lessonData'

// ========================================
// Systems Thinking Lessons (ID: 65-67)
// ========================================

const systemsIntro: LessonData = {
  id: 65,
  title: 'Systems Thinking Basics — See the Whole',
  category: 'Systems Thinking',
  steps: [
    {
      type: 'explain',
      title: 'What is systems thinking?',
      content:
        'Systems thinking focuses on the relationships between elements and the patterns of the whole, not the elements in isolation.\n\nThe concept was popularized by Peter Senge ("The Fifth Discipline").\n\nExample: why does traffic congestion happen?\n\nReductionist view: "Too many cars," "narrow roads" → expand the road.\nSystems view: Wider road → more convenient → more cars → congested again.\n→ Long term, expanding the road can make congestion worse (induced demand).\n\nThe opposite of "missing the forest for the trees."\n\nThree elements of a system:\n(1) Stocks — accumulations (inventory, talent, knowledge)\n(2) Flows — what goes in and out (revenue, hiring, learning)\n(3) Feedback — outputs that loop back into inputs',
    },
    {
      type: 'quiz',
      question: 'What perspective does systems thinking surface in hiring?',
      options: [
        { label: 'Hire one excellent person and the problem is solved', correct: false },
        { label: 'Mass hiring will strengthen the organization', correct: false },
        { label: 'Aggressive hiring can trigger a vicious cycle: training cost goes up → existing staff are overloaded → existing staff leave → more hiring needed', correct: true },
        { label: 'Hiring is HR\'s problem; other teams are not involved', correct: false },
      ],
      explanation:
        'Systems thinking exposes the feedback loop "hire → training burden → existing staff burn out → attrition → more hiring." It is the textbook case where local optimization (mass hiring) makes the whole system worse.',
    },
    {
      type: 'explain',
      title: 'Feedback loops — Cycles of cause and effect',
      content:
        'The heart of a system is the feedback loop.\n\n[Reinforcing loop]\nThe output amplifies the input → snowballs.\n\nVirtuous example:\nGreat product → more word of mouth → more sales → more R&D investment → even better product.\n\nVicious example:\nQuality drops → more complaints → more handling cost → less R&D capacity → quality drops further.\n\n[Balancing loop]\nThe output suppresses the input → moves toward equilibrium.\n\nExamples:\nBody temperature rises → sweat → temperature drops.\nService gains popularity → crowds → wait times rise → popularity drops → it empties out.\n\nIn business:\nWhen you find a virtuous loop, push it as hard as you can.\nWhen you find a vicious loop, break the chain.',
    },
    {
      type: 'quiz',
      question: 'Which of the following is a reinforcing loop (virtuous cycle)?',
      options: [
        { label: 'Cut prices → sales rise → margins fall → no more room to cut', correct: false },
        { label: 'More users → more content → even more users (network effect)', correct: true },
        { label: 'More inventory → more storage cost → discount sales → less inventory', correct: false },
        { label: 'More overtime → fatigue → lower productivity → even more overtime', correct: false },
      ],
      explanation:
        'Network effects are the prototypical reinforcing loop: more users beget more content, which beget more users. Facebook, YouTube, and marketplace apps are all powered by this engine. (The last option is also a reinforcing loop, but a vicious one.)',
    },
    {
      type: 'explain',
      title: 'The Iceberg Model — Look beneath the surface',
      content:
        'A core systems-thinking tool, the Iceberg Model:\n\nAbove water — Events\n"Sales dropped 10% last month."\n→ Reactive: "Pressure the sales team."\n\nJust below — Patterns\n"Sales drop every Q3."\n→ Adaptive: "Plan ahead for Q3."\n\nDeeper — Structures\n"Sales incentives are skewed toward Q4, so Q3 activity dies."\n→ Generative: "Redesign the incentive scheme to be even across quarters."\n\nDeepest — Mental Models\n"We can always make it up in Q4." (an organizational belief)\n→ Transformative: "Shift the culture toward steady year-round revenue."\n\nReacting only to events does not solve the problem at the root.\nUnless you change structure and mental models, the same issue keeps recurring.',
    },
    {
      type: 'quiz',
      question: 'You\'re analyzing "every month, work piles up against the end-of-month deadline" with the iceberg model. What belongs at the "structure" level?',
      options: [
        { label: 'The number of overdue projects this month', correct: false },
        { label: 'The pattern of monthly end-of-month crunches', correct: false },
        { label: 'The sales process that commits tight schedules at deal time, plus the internal effort-estimation system', correct: true },
        { label: 'Employees\' time-management skills', correct: false },
      ],
      explanation:
        'At the "structure" level, you look at the mechanisms, policies, and processes producing the issue. The root cause of end-of-month crunches likely lies in a sales process that commits to unrealistic schedules and internal systems that cannot estimate effort accurately.',
    },
  ],
}

const systemsLoops: LessonData = {
  id: 66,
  title: 'System Archetypes — Common Patterns',
  category: 'Systems Thinking',
  steps: [
    {
      type: 'explain',
      title: 'System archetypes',
      content:
        'Knowing the recurring system archetypes lets you diagnose business problems quickly.\n\n[Archetype 1: Fixes that Fail]\nTreat the symptom → improve briefly → side effects → problem worsens.\n\nExample:\nUse overtime to clear a project delay.\n→ Hit the deadline short term.\n→ Staff burn out, attrition rises.\n→ Next project is even more delayed by understaffing.\n\nLesson: A fix only postpones the problem. Address the root cause.\n\n[Archetype 2: Success to the Successful]\nThe successful unit gets more resources → succeeds even more → other units decline.\n\nExample:\nBudget increases for high-performing division A → A grows further.\nB\'s budget shrinks → B underperforms → "B has weak capabilities."\n→ But it is really resource allocation, not capability.',
    },
    {
      type: 'quiz',
      question: 'Which best matches the "Fixes that Fail" pattern?',
      options: [
        { label: 'Establishing a new strategy for long-term improvement', correct: false },
        { label: 'Restarting the server every time the system has issues, without ever fixing the underlying bug', correct: true },
        { label: 'Putting preventive measures in place before problems happen', correct: false },
        { label: 'Analyzing the root cause as a team', correct: false },
      ],
      explanation:
        'Restarting the server is the textbook "fix." It works briefly, but the bug remains and the issue recurs. Each restart costs handling time, and there is a real risk of escalating into a critical outage.',
    },
    {
      type: 'explain',
      title: 'More system archetypes',
      content:
        '[Archetype 3: Limits to Growth]\nGrowth → eventually hits a constraint → growth stalls.\n\nExample:\nA startup grows fast → not enough engineers → development speed drops.\n→ Right move: not "hire more engineers" but "remove the bottleneck constraint."\n\n[Archetype 4: Eroding Goals]\nGoal not met → lower the goal → adapt to the lower goal.\n\nExample:\nQuality target "0.1% defect rate" not met → "0.5% is fine" → next round, "1% is fine."\n→ Quality keeps drifting down.\n\nLesson: Do not lower the goal — solve why you are not hitting it.\n\n[Archetype 5: Tragedy of the Commons]\nIndividuals exhaust a shared resource → everyone loses.\n\nExample: Every department flags requests as "urgent" to IT → IT collapses → every department is delayed.',
    },
    {
      type: 'quiz',
      question: '"Quality standards on each project keep drifting down a little at a time" — which archetype is this?',
      options: [
        { label: 'Fixes that Fail', correct: false },
        { label: 'Limits to Growth', correct: false },
        { label: 'Eroding Goals', correct: true },
        { label: 'Tragedy of the Commons', correct: false },
      ],
      explanation:
        'Eroding Goals is the vicious cycle of revising goals downward to match the reality of missing them. Compromising on quality every time normalizes "this is fine" until a major quality incident eventually surfaces.',
    },
    {
      type: 'explain',
      title: 'Leverage points — Small change, big effect',
      content:
        'Donella Meadows ("Thinking in Systems") proposed leverage points:\n\n"Places in a system where small interventions produce large changes."\n\nThe leverage hierarchy:\n\nweak ← → strong\nParameter changes < Rule changes < Goal changes < Paradigm changes\n\nExample: "Employee motivation is low."\n\nParameter change: 10% bonus increase → temporary effect\nRule change: shift evaluation to 360-degree feedback → behavior changes\nGoal change: from "maximize revenue" to "maximize customer satisfaction" → priorities change\nParadigm change: from "an organization that controls" to "an organization that self-governs" → culture changes\n\nMost companies only adjust parameters.\nIntervening at higher leverage points changes the system at the root.',
    },
    {
      type: 'quiz',
      question: 'To "increase conversion on an e-commerce site," which intervention has the highest leverage?',
      options: [
        { label: 'A/B testing button colors', correct: false },
        { label: 'Running a free-shipping campaign', correct: false },
        { label: 'Building a system that analyzes purchase behavior in real time and automatically delivers a personalized experience to each user', correct: true },
        { label: 'Increasing the resolution of product photos', correct: false },
      ],
      explanation:
        'Button color and free shipping are "parameter changes." A personalization engine is a "rule/structure change." Once built, it keeps producing effect and lifts the entire site\'s conversion. That is what high leverage looks like.',
    },
  ],
}

const systemsPractice: LessonData = {
  id: 67,
  title: 'Systems Thinking in Practice',
  category: 'Systems Thinking',
  steps: [
    {
      type: 'explain',
      title: 'Drawing causal loop diagrams',
      content:
        'A causal loop diagram is a practical systems-thinking tool.\n\nHow to draw one:\n1. List the variables (use nouns whose levels can rise or fall).\n2. Connect them with arrows showing causation.\n3. Mark each arrow with "+" (same direction) or "-" (opposite direction).\n4. Find loops and label them R (reinforcing) or B (balancing).\n\nExample: software development quality\n\n[Dev speed] -→(-) [Test time]\n[Test time] -→(+) [Quality]\n[Quality] -→(-) [Bug-fix time]\n[Bug-fix time] -→(-) [Dev speed]\n\n→ A vicious cycle emerges: "Dev speed up → less test time → quality drops → more bugs → dev speed drops."\n\nCountermeasure: How can we keep test time while raising dev speed?\n→ Automated tests, CI/CD, better code review.',
    },
    {
      type: 'quiz',
      question: 'For the chain "more ad spend → more new customers → more revenue → more budget for ads," what kind of loop is this?',
      options: [
        { label: 'Balancing loop (heading toward equilibrium)', correct: false },
        { label: 'Reinforcing loop (snowballs)', correct: true },
        { label: 'Not a causal relationship (just correlation)', correct: false },
        { label: 'Reverse causation (revenue drives ad spend)', correct: false },
      ],
      explanation:
        'Ad spend → customers → revenue → ad spend → ... and each variable increases the next (all "+" arrows). That is a reinforcing loop, accelerating as long as the virtuous cycle keeps spinning. (It does not last forever — market saturation, a balancing loop, eventually kicks in.)',
    },
    {
      type: 'explain',
      title: '[Case] Why DX is stuck — a systems analysis',
      content:
        'Case study:\nA large company has been pushing "digital transformation" for three years, but it is not progressing.\n\nIceberg analysis:\n\nEvent: "A DX project was canceled because it ran over budget."\n\nPattern: "Three DX projects in the past five years have been canceled."\n\nStructure:\n- IT and business divisions are separated; their requirements never align.\n- Annual-budget cycles make multi-year projects hard to approve.\n- Failure is attributed to individuals, so no one wants to take risks.\n\nMental models:\n- Executives believe "IT is a cost center."\n- The organization believes "the way we work in the field should not change."\n\nLeverage points:\n→ Shift executive perception (IT = investment) and stack up small successes to build belief.',
    },
    {
      type: 'quiz',
      question: 'For an organization where DX is stuck, which intervention has the highest leverage?',
      options: [
        { label: 'Establish a new DX promotion department', correct: false },
        { label: 'Adopt the latest AI / cloud technology', correct: false },
        { label: 'Have executives experience successful DX cases firsthand and shift the mental model from "IT is a cost" to "IT is an investment"', correct: true },
        { label: 'Run DX training for all employees', correct: false },
      ],
      explanation:
        'Changing the mental model ("IT is a cost center") has the highest leverage. When executive perception shifts, budgeting, organizational structure, and evaluation systems shift, and that shifts behavior on the ground. Creating a new department or running training are parameter/rule-level interventions.',
    },
    {
      type: 'explain',
      title: 'Systems thinking — recap',
      content:
        'Key takeaways:\n\nLook at the relationships of the whole, not isolated parts.\nFind the feedback loops (reinforcing / balancing).\nUse the iceberg model to expose deep structures and mental models.\nUse system archetypes to diagnose problem patterns quickly.\nIntervene at leverage points to change things at the root.\nVisualize complex problems with causal loop diagrams.\n\nWhen systems thinking is especially useful:\n- "The same problem keeps coming back."\n- "Our countermeasures aren\'t working."\n- "The conflict between departments will not resolve."\n- "Short-term wins are creating long-term losses."\n\nStop "playing whack-a-mole" and change the mechanism that keeps producing the moles.\nThat is systems thinking.',
    },
    {
      type: 'quiz',
      question: 'Which is the most accurate description of systems thinking\'s essence?',
      options: [
        { label: 'Collecting and analyzing as much data as possible', correct: false },
        { label: 'Understanding the relationships between elements and the feedback structure, not just the individual elements', correct: true },
        { label: 'Solving every problem with a mathematical model', correct: false },
        { label: 'Breaking problems down and solving each piece individually', correct: false },
      ],
      explanation:
        'The essence of systems thinking is "see relationships and feedback structures." Analytical thinking, which focuses on individual elements, is also important — but on its own it cannot tell you what is happening at the level of the whole. The two complement each other.',
    },
  ],
}

export const systemsThinkingLessonMapEn: Record<number, LessonData> = {
  65: systemsIntro,
  66: systemsLoops,
  67: systemsPractice,
}
