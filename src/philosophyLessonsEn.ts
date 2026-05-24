import type { LessonData } from './lessonData'

export const philosophyLessonMapEn: Record<number, LessonData> = {
  77: {
    id: 77,
    title: 'The Socratic Method',
    category: 'Philosophy & Principles of Thought',
    steps: [
      {
        type: 'explain',
        title: 'What is the Socratic method?',
        content:
          'Socrates began from "knowledge of one\'s own ignorance" and dismantled others\' assumptions through dialogue.\n\nHis tool was the "Socratic method (elenchus)." When someone made a claim, he kept asking "Is that really so?" and "Are there counterexamples?" — gradually breaking down the underlying premises.\n\nThe same approach is alive today in modern consulting and strategic thinking, in forms like "Ask why five times" or "Construct questions that try to break the hypothesis."',
      },
      {
        type: 'explain',
        title: 'The structure of the elenchus',
        content:
          'The Socratic method runs in three steps.\n\n1. Ask for a definition: get them to state "What is X?"\n2. Hunt for counterexamples: shake the definition with "How do you explain this case?"\n3. Force a redefinition: lead them to a more precise definition.\n\nExample: "Courage is feeling no fear."\n→ "So someone who acts despite feeling fear has no courage?"\n→ "Then is courage perhaps the power to control fear?"\n\nThis cycle of refinement deepens thought.',
      },
      {
        type: 'quiz',
        question: 'What is the main goal of the Socratic method?',
        options: [
          { label: 'To defeat the other person and prove your own correctness', correct: false },
          { label: 'Through dialogue, surface mutual ignorance and deepen understanding', correct: true },
          { label: 'To transmit expert knowledge through the shortest path possible', correct: false },
          { label: 'To decide which opinion is correct by holding a majority vote', correct: false },
        ],
        explanation:
          'Socrates wasn\'t trying to win an argument. Option 1 is the classic win-lose misreading; option 3 treats it as one-way instruction, ignoring dialogue\'s two-way nature; option 4 puts truth to a vote, which has nothing to do with elenchus.',
      },
      {
        type: 'quiz',
        question: 'Which is the most appropriate business use of the Socratic method?',
        options: [
          { label: 'Use it in meetings to logically silence team members', correct: false },
          { label: '"Why do you think this initiative works?" to test hypothesis grounds', correct: true },
          { label: 'Pretend not to know the answer in order to stall for time', correct: false },
          { label: 'Reject all opposing opinions and shut down the discussion', correct: false },
        ],
        explanation:
          'The essence is "keep asking for grounds" — applied to hypothesis testing and reviews. Option 1 turns it into a debate weapon, option 3 trivializes it as a game, option 4 cuts off the dialogue that makes the method work.',
      },
    ],
  },

  78: {
    id: 78,
    title: 'Falsifiability — the line between science and pseudoscience',
    category: 'Philosophy & Principles of Thought',
    steps: [
      {
        type: 'explain',
        title: 'Popper\'s question: what counts as "science"?',
        content:
          'Philosopher Karl Popper asked: "Is a theory that can be called true regardless of any evidence really scientific?"\n\nPopper proposed "falsifiability":\nthe idea that "being possible to prove wrong in principle" is the condition for science.\n\nExamples:\n- "All swans are white" → falsifiable. Spotting one black swan refutes it.\n- "God exists" → not falsifiable. This is the territory of religion and faith.\n- "This medicine only works on those who believe in it" → not falsifiable. A textbook case of pseudoscience.',
      },
      {
        type: 'explain',
        title: 'Falsifiability as a thinking tool',
        content:
          'Falsifiability is not just for philosophy of science. It works in business thinking too.\n\n"A hypothesis you cannot falsify is one you cannot test."\n\nExamples:\n- Weak hypothesis: "Users value ease of use" → no matter what happens, you can blame "ease of use."\n- Strong hypothesis: "If sign-up rate is 20% or higher, we can judge the UI as easy to use" → numerically falsifiable.\n\nA good hypothesis defines from the start "what would have to happen for this hypothesis to be wrong."',
      },
      {
        type: 'quiz',
        question: 'Which of the following is a "falsifiable hypothesis"?',
        options: [
          { label: 'This app will be loved by many users in the long run', correct: false },
          { label: 'Push notifications increase next-day DAU by 5% or more', correct: true },
          { label: 'If the team mood is good, results will naturally follow', correct: false },
          { label: 'Customers will eventually understand our true value', correct: false },
        ],
        explanation:
          '"5% next-day DAU increase" can be tested numerically. Option 1 lacks a "loved" criterion; option 3 allows infinite excuses through its conditional; option 4 pushes "eventually" indefinitely into the future — making it unfalsifiable. Specificity + measurability are the keys.',
      },
    ],
  },

  79: {
    id: 79,
    title: 'Utilitarianism and Deontology — two axes of ethical judgment',
    category: 'Philosophy & Principles of Thought',
    steps: [
      {
        type: 'explain',
        title: 'Two stances for thinking about ethics',
        content:
          'When judging "the right action," philosophy offers two main approaches.\n\nUtilitarianism\nJudge actions by their consequences. Aim for the greatest happiness for the greatest number.\nKey figures: Jeremy Bentham, John Stuart Mill\n\nDeontology\nJudge by the nature of the act itself, not its consequences. Emphasize rules, duties, and rights.\nKey figure: Immanuel Kant — "Act only according to that maxim whereby you can will that it should become a universal law."',
      },
      {
        type: 'explain',
        title: 'Thinking through the trolley problem',
        content:
          'The "trolley problem" sharpens the contrast between the two views.\n\nA runaway trolley with broken brakes is heading toward five people. Pulling a lever switches it to a side track where one person stands; the five are saved, but the one is killed. Should you pull?\n\nUtilitarian answer: Pull. 5 > 1. Maximizing the outcome is right.\nDeontological answer: (Possibly) do not pull. Using the one person as a means violates that person\'s rights.\n\nBoth are logical. What matters is being aware of which value system you are judging from.',
      },
      {
        type: 'quiz',
        question: 'Which decision is closest to utilitarian thinking?',
        options: [
          { label: 'Lying is never permitted under any circumstances at all', correct: false },
          { label: 'Rules must be followed without exception regardless of context', correct: false },
          { label: 'Slight inconvenience for 1,000 vs one life — choose by total welfare', correct: true },
          { label: 'Whatever the outcome, what matters most is the correct process', correct: false },
        ],
        explanation:
          'Comparing total outcomes is utilitarian. Options 1 and 2 are unconditional-rule deontology; option 4 is process-focused deontology — all judge by "the nature of the act itself," not by results. Weighing outcomes is the utilitarian core.',
      },
    ],
  },

  80: {
    id: 80,
    title: 'Introduction to Epistemology — how far can we know?',
    category: 'Philosophy & Principles of Thought',
    steps: [
      {
        type: 'explain',
        title: 'What is epistemology?',
        content:
          'Epistemology is the branch of philosophy that asks "What is knowledge?" and "What can we know?"\n\nDescartes started from "I think, therefore I am (Cogito, ergo sum)" and tried to build knowledge on a foundation that could not be doubted.\n\nKey questions:\n- Can we trust the senses? (illusions, dreams, biases)\n- How is knowledge different from "conviction"?\n- What state are we in when we say we "know" something?',
      },
      {
        type: 'explain',
        title: 'The three conditions for knowledge — Justified True Belief',
        content:
          'In the classical definition, "knowledge" must satisfy three conditions:\n\n1. True: it actually corresponds to fact.\n2. Belief: the person believes it to be the case.\n3. Justified: there are grounds for believing it.\n\nExample: "It will rain tomorrow."\n- Just a hunch → no justification = not knowledge.\n- Confirmed via the weather forecast → justified. But if the forecast is wrong, it was not "true."\n\nAside — the Gettier problem (1963):\nPhilosopher Edmund Gettier presented counterexamples that satisfy all three JTB conditions yet still do not seem to count as knowledge, showing the definition is insufficient. For instance, a guess that happens to be correct can satisfy the three conditions. Modern epistemology continues to search for a "fourth condition" in response.\n\nApplication in business: distinguishing "knowing" from "assuming" determines the precision of strategy.',
      },
      {
        type: 'quiz',
        question: 'Which of the following satisfies the three conditions of "knowledge" (truth, belief, justification)?',
        options: [
          { label: 'You vaguely believe "Company A is probably the market leader" with no basis', correct: false },
          { label: 'Based on reliable survey data, you believe "A holds 40% share" — and it\'s true', correct: true },
          { label: 'You hold the gut feeling "the economy seems like it will improve"', correct: false },
          { label: 'You are convinced "A is the leader" based on incorrect underlying data', correct: false },
        ],
        explanation:
          'The correct option satisfies all three: survey data (justification) → actual figure (truth) → believed (belief). Options 1 and 3 lack justification; option 4 lacks truth — believing wrong data is "mistaken belief," not knowledge.',
      },
    ],
  },

  81: {
    id: 81,
    title: 'Thought Experiments — philosophy\'s laboratory',
    category: 'Philosophy & Principles of Thought',
    steps: [
      {
        type: 'explain',
        title: 'What is a thought experiment?',
        content:
          'A thought experiment runs a hypothetical scenario in your head — one that cannot (or will not) be carried out in reality — to test concepts and assumptions.\n\nIt is used widely in philosophy, physics, ethics, and cognitive science. In philosophy, where there is no physical lab, the thought experiment was the only available form of "experiment."\n\nFamous examples:\n- The trolley problem (ethics)\n- Descartes\' "evil demon" (epistemology)\n- The Chinese Room (consciousness, AI)\n- Swampman (personal identity)',
      },
      {
        type: 'explain',
        title: 'Thinking about AI and understanding via the "Chinese Room"',
        content:
          'A thought experiment by philosopher John Searle:\n\nYou are inside a room. You do not understand any Chinese. When questions in Chinese come in from outside, you use a thick book of "matching rules" to send back correct Chinese responses. To people outside, it looks as if you understand Chinese.\n\nQuestion: do you "understand Chinese"?\n\nSearle\'s claim: No. You are merely processing syntax (rules).\n\nThis connects directly to current debates about AI. Does GPT "understand meaning," or is it just pattern matching?',
      },
      {
        type: 'quiz',
        question: 'Which most accurately describes the original purpose of a thought experiment?',
        options: [
          { label: 'To enjoy daydreaming about scenarios impossible in reality', correct: false },
          { label: 'Through hypothetical scenarios, surface concept contradictions and test assumptions', correct: true },
          { label: 'To quantify experimental results and accumulate reproducible data', correct: false },
          { label: 'To confuse the other person with difficult words and dominate', correct: false },
        ],
        explanation:
          'The goal is "testing assumptions." Option 1 reduces it to entertainment; option 3 confuses it with lab experiments; option 4 misuses it as intellectual posturing. The tool works across philosophy, physics (Schrödinger\'s cat), and business strategy.',
      },
      {
        type: 'quiz',
        question: 'What theme does the "Swampman" thought experiment ask about?',
        options: [
          { label: 'Environmental issues — protecting swamps and wetlands', correct: false },
          { label: 'What determines personal identity across time and matter', correct: true },
          { label: 'Free-market competition and price-discovery principles', correct: false },
          { label: 'The decisive difference between AI robots and humans', correct: false },
        ],
        explanation:
          'Swampman asks: "If a molecular copy of a person killed by lightning emerges from a swamp, are they the same person?" Memories and appearance match, but there\'s no past causal history. Option 1 is a literal misreading of "swamp"; options 3 and 4 have no relation to the experiment.',
      },
    ],
  },
}
