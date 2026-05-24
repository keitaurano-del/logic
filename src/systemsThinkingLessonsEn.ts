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
        { label: 'One outstanding hire would resolve the org-level problem', correct: false },
        { label: 'Aggressive mass hiring strengthens the organization by sheer headcount', correct: false },
        { label: 'Rapid hiring triggers a loop: training load up → existing staff burnout → attrition → more hiring needed', correct: true },
        { label: 'Hiring is HR\'s job and other departments have little role to play', correct: false },
      ],
      explanation:
        'Systems thinking watches for loops, not individual moves. The hire → training → burnout → attrition → re-hire feedback is the key insight. "One hire solves it," "headcount equals strength," and "not our problem" all treat hiring as discrete decisions and miss the recurring dynamics that make local optimization globally damaging.',
    },
    {
      type: 'explain',
      title: 'Feedback loops — Cycles of cause and effect',
      content:
        'The heart of a system is the feedback loop.\n\n[Reinforcing loop]\nThe output amplifies the input → snowballs.\n\nVirtuous example:\nGreat product → more word of mouth → more sales → more R&D investment → even better product.\n\nVicious example:\nQuality drops → more complaints → more handling cost → less R&D capacity → quality drops further.\n\n[Balancing loop]\nThe output suppresses the input → moves toward equilibrium.\n\nExamples:\nBody temperature rises → sweat → temperature drops.\nService gains popularity → crowds → wait times rise → popularity drops → it empties out.\n\nIn business:\nWhen you find a virtuous loop, push it as hard as you can.\nWhen you find a vicious loop, break the chain.',
      visual: 'FeedbackLoopDiagram',
      outro:
        'Reinforcing loops amplify, balancing loops settle toward equilibrium. Push a virtuous loop with everything you have, and cut a vicious loop before it gathers momentum — just being able to tell the two apart changes how much your interventions move the system.',
    },
    {
      type: 'quiz',
      question: 'Which of the following is a reinforcing loop (virtuous cycle)?',
      options: [
        { label: 'Cut prices → sales rise → margins fall → no more room to cut (balancing)', correct: false },
        { label: 'More users → more content → even more users (reinforcing / virtuous)', correct: true },
        { label: 'More inventory → higher storage cost → markdown sales → less inventory (balancing)', correct: false },
        { label: 'More overtime → fatigue → lower productivity → even more overtime (reinforcing / vicious)', correct: false },
      ],
      explanation:
        'The correct option is the network-effect virtuous cycle that powers Facebook / YouTube / marketplaces. The overtime example is also a reinforcing loop but vicious side, so it does not count as "virtuous." Price and inventory examples are balancing loops moving toward equilibrium. "Reinforcing" and "virtuous" are not synonyms — reinforcing loops can go either way.',
    },
    {
      type: 'explain',
      title: 'The Iceberg Model — Look beneath the surface',
      content:
        'A core systems-thinking tool, the Iceberg Model:\n\nAbove water — Events\n"Sales dropped 10% last month."\n→ Reactive: "Pressure the sales team."\n\nJust below — Patterns\n"Sales drop every Q3."\n→ Adaptive: "Plan ahead for Q3."\n\nDeeper — Structures\n"Sales incentives are skewed toward Q4, so Q3 activity dies."\n→ Generative: "Redesign the incentive scheme to be even across quarters."\n\nDeepest — Mental Models\n"We can always make it up in Q4." (an organizational belief)\n→ Transformative: "Shift the culture toward steady year-round revenue."\n\nReacting only to events does not solve the problem at the root.\nUnless you change structure and mental models, the same issue keeps recurring.',
      visual: 'IcebergModelDiagram',
      outro:
        'The four layers of the Iceberg Model — events, patterns, structures, mental models — gain leverage as you go deeper. Reacting only at the surface guarantees the issue returns, so the perspective that descends all the way to structure and mental models is what cracks recurring problems open.',
    },
    {
      type: 'quiz',
      question: 'You\'re analyzing "every month, work piles up against the end-of-month deadline" with the iceberg model. What belongs at the "structure" level?',
      options: [
        { label: 'The number of overdue items and the assignee list this month (Event)', correct: false },
        { label: 'The repeated pattern of end-of-month crunches over many months (Pattern)', correct: false },
        { label: 'The sales process that commits unrealistic schedules + the effort-estimation system (Structure)', correct: true },
        { label: 'Individual employees\' time-management skill gaps (Individual factor)', correct: false },
      ],
      explanation:
        'Structure-level analysis targets the mechanisms, policies, and processes producing the issue. The overdue list is an event, the recurring pattern is a pattern, and individual skill is an individual factor. Misplacing the analysis at the wrong layer is exactly what makes "fixes" stop working at the events layer while structure quietly reproduces the problem.',
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
      visual: 'SystemArchetypeDiagram',
      outro:
        'Problems that recur inside organizations almost always map to a known archetype. Carrying patterns like "Fixes that Fail" and "Success to the Successful" in your toolkit lets you diagnose the structure quickly and side-step common traps before they bite.',
    },
    {
      type: 'quiz',
      question: 'Which best matches the "Fixes that Fail" pattern?',
      options: [
        { label: 'Set a new strategy and pursue long-term improvement (root-cause work)', correct: false },
        { label: 'Restart the server each outage without ever fixing the underlying bug', correct: true },
        { label: 'Put preventive measures in place before problems happen (proactive)', correct: false },
        { label: 'Analyze the root cause structurally as a team (root-cause analysis)', correct: false },
      ],
      explanation:
        'Server restarts are the textbook "fix that fails": they work briefly but leave the root bug in place, accumulating handling cost and risking a major outage later. Long-term strategy, prevention, and root-cause analysis all sit on the opposite side of the spectrum. Distinguishing symptomatic vs structural responses is the discriminating skill.',
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
        { label: 'Fixes that Fail — symptomatic relief that defers problems', correct: false },
        { label: 'Limits to Growth — growth stalls at a hard constraint', correct: false },
        { label: 'Eroding Goals — the goal itself drifts downward to match shortfalls', correct: true },
        { label: 'Tragedy of the Commons — shared resources individually overconsumed', correct: false },
      ],
      explanation:
        'Eroding Goals is "lower the goal to match the shortfall" — exactly what stepwise quality compromise produces. The other three archetypes describe different loops (symptomatic relief, constraint binding, resource depletion) that do not involve the goal itself sliding. Naming "what is looping" makes archetype diagnosis immediate.',
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
        { label: 'A/B test button colors and copy to optimize CTAs (parameter)', correct: false },
        { label: 'Run a time-limited free-shipping campaign (parameter)', correct: false },
        { label: 'Build a personalization engine that auto-delivers individualized experiences (structure)', correct: true },
        { label: 'Increase product photo resolution to improve perceived quality (parameter)', correct: false },
      ],
      explanation:
        'Parameter tweaks (color, campaign, photo) yield local, time-bound effects. A personalization engine alters the rules of engagement for every user continuously — a structural change with much higher leverage. Holding the hierarchy (parameter < rule < goal < paradigm) in mind helps direct effort to where it compounds.',
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
      visual: 'CausalLoopDiagram',
      outro:
        'A causal loop diagram is the device that pulls the fuzzy web of relationships out of your head and onto a shared screen. Listing variables, marking each arrow with plus or minus, and surfacing the loops — that act itself is what reveals the vicious cycles and points to the countermeasures.',
    },
    {
      type: 'quiz',
      question: 'For the chain "more ad spend → more new customers → more revenue → more budget for ads," what kind of loop is this?',
      options: [
        { label: 'Balancing loop — outputs suppress inputs and the system heads to equilibrium', correct: false },
        { label: 'Reinforcing loop — outputs amplify inputs and the system snowballs', correct: true },
        { label: 'Not a causal structure — only a coincidental correlation', correct: false },
        { label: 'Reverse causation — revenue actually drives ad spend rather than the other way', correct: false },
      ],
      explanation:
        'Each variable pushes the next in the positive direction (+), which is the reinforcing virtuous pattern. Balancing is suppression, correlation denial rejects the structure entirely, and reverse causation reinterprets the order — none of which fit this chain. In reality a balancing loop (market saturation) eventually kicks in, but the immediate structure is reinforcing.',
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
        { label: 'Stand up a dedicated DX promotion department to lead (rule change)', correct: false },
        { label: 'Adopt the latest AI / cloud tech first, figure out usage later (parameter)', correct: false },
        { label: 'Have executives live through success cases and rewire "IT is cost" into "IT is investment" (paradigm)', correct: true },
        { label: 'Run company-wide DX literacy training (rule change)', correct: false },
      ],
      explanation:
        'Paradigm shift (mental model) has the highest leverage: the "IT = investment" reframe ripples through budgeting, structure, and evaluation. New departments and training are rule changes; tech adoption is parameter level — all valid moves but lower-leverage. "Higher-layer interventions drive lower layers" is the key sequencing rule.',
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
        { label: 'A method for collecting and statistically analyzing as much data as possible', correct: false },
        { label: 'A mode of thought that targets relationships between elements and feedback structure, not isolated parts', correct: true },
        { label: 'A methodology for quantifying every problem in mathematical models', correct: false },
        { label: 'An analytical approach that breaks problems into components and solves each separately', correct: false },
      ],
      explanation:
        'The essence is the relationships-and-feedback view, complementary to analytical thinking. Statistical scale, mathematical modeling, and decomposition are other methodologies (statistics, mathematical science, analytical thinking) that get confused with systems thinking. The distinguishing question is "what does the whole do?"',
    },
  ],
}

export const systemsThinkingLessonMapEn: Record<number, LessonData> = {
  65: systemsIntro,
  66: systemsLoops,
  67: systemsPractice,
}
