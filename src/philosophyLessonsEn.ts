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
          { label: 'To defeat the other person and prove yourself right', correct: false },
          { label: 'Through dialogue, to make both parties aware of their own ignorance', correct: true },
          { label: 'To transmit expert knowledge efficiently', correct: false },
          { label: 'To decide the right answer by majority vote', correct: false },
        ],
        explanation:
          'Socrates was not trying to win an argument. The goal was for both sides to recognize their ignorance through dialogue and to move closer to a more accurate understanding. This is also the practice of "knowing one\'s own ignorance."',
      },
      {
        type: 'quiz',
        question: 'Which is the most appropriate business use of the Socratic method?',
        options: [
          { label: 'Use it in meetings to silence team members', correct: false },
          { label: 'Keep asking "Why do you think this initiative will work?" to test the basis of the hypothesis', correct: true },
          { label: 'Pretend not to know the answer to stall for time', correct: false },
          { label: 'Reject all of the other person\'s opinions and shut down the discussion', correct: false },
        ],
        explanation:
          'The essence of the Socratic method is to keep asking for grounds. In business, this lives on as a habit during hypothesis testing or proposal reviews — repeatedly asking "Why can we say that?" and "Are there counterexamples?"',
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
          { label: 'This app will be loved by users', correct: false },
          { label: 'Sending push notifications increases next-day DAU by 5% or more', correct: true },
          { label: 'If the team mood is good, results will follow', correct: false },
          { label: 'Customers will eventually understand our true value', correct: false },
        ],
        explanation:
          '"Next-day DAU increases by 5% or more" can be tested numerically; if it does not increase, the hypothesis is falsified. The other options are vague and remain "true" no matter what happens.',
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
          'When judging "the right action," philosophy offers two main approaches.\n\n**Utilitarianism**\nJudge actions by their consequences. Aim for the greatest happiness for the greatest number.\nKey figures: Jeremy Bentham, John Stuart Mill\n\n**Deontology**\nJudge by the nature of the act itself, not its consequences. Emphasize rules, duties, and rights.\nKey figure: Immanuel Kant — "Act only according to that maxim whereby you can will that it should become a universal law."',
      },
      {
        type: 'explain',
        title: 'Thinking through the trolley problem',
        content:
          'The "trolley problem" sharpens the contrast between the two views.\n\nA runaway trolley with broken brakes is heading toward five people. Pulling a lever switches it to a side track where one person stands; the five are saved, but the one is killed. Should you pull?\n\n**Utilitarian answer**: Pull. 5 > 1. Maximizing the outcome is right.\n**Deontological answer**: (Possibly) do not pull. Using the one person as a means violates that person\'s rights.\n\nBoth are logical. What matters is being aware of which value system you are judging from.',
      },
      {
        type: 'quiz',
        question: 'Which decision is closest to utilitarian thinking?',
        options: [
          { label: 'Lying is never permitted under any circumstances', correct: false },
          { label: 'Rules must be followed without exception', correct: false },
          { label: 'Even if it inconveniences 1,000 people slightly, if it can save one life, we should do it', correct: true },
          { label: 'Whatever the outcome, what matters is following the right process', correct: false },
        ],
        explanation:
          'Comparing total outcomes (one life vs. minor inconvenience to 1,000 people) is utilitarian. Deontology stresses adherence to process and rules.',
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
          'In the classical definition, "knowledge" must satisfy three conditions:\n\n1. True: it actually corresponds to fact.\n2. Belief: the person believes it to be the case.\n3. Justified: there are grounds for believing it.\n\nExample: "It will rain tomorrow."\n- Just a hunch → no justification = not knowledge.\n- Confirmed via the weather forecast → justified. But if the forecast is wrong, it was not "true."\n\n**Aside — the Gettier problem (1963):**\nPhilosopher Edmund Gettier presented counterexamples that satisfy all three JTB conditions yet still do not seem to count as knowledge, showing the definition is insufficient. For instance, a guess that happens to be correct can satisfy the three conditions. Modern epistemology continues to search for a "fourth condition" in response.\n\nApplication in business: distinguishing "knowing" from "assuming" determines the precision of strategy.',
      },
      {
        type: 'quiz',
        question: 'Which of the following satisfies the three conditions of "knowledge" (truth, belief, justification)?',
        options: [
          { label: 'You believe without basis that "Company A is probably the market leader"', correct: false },
          { label: 'Based on reliable survey data, you are convinced that "Company A\'s market share is 40%," and that perception matches the facts', correct: true },
          { label: 'You believe that "things just feel like the economy will improve"', correct: false },
          { label: 'You are convinced "Company A is the leader" based on incorrect data', correct: false },
        ],
        explanation:
          '"Based on survey data (justification), believing (belief) the actual figure (truth)" satisfies all three conditions. "Just a feeling" lacks justification. Wrong data is not "true."',
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
          'A thought experiment by philosopher John Searle:\n\nYou are inside a room. You do not understand any Chinese. When questions in Chinese come in from outside, you use a thick book of "matching rules" to send back correct Chinese responses. To people outside, it looks as if you understand Chinese.\n\nQuestion: do you "understand Chinese"?\n\n**Searle\'s claim**: No. You are merely processing syntax (rules).\n\nThis connects directly to current debates about AI. Does GPT "understand meaning," or is it just pattern matching?',
      },
      {
        type: 'quiz',
        question: 'Which most accurately describes the original purpose of a thought experiment?',
        options: [
          { label: 'To enjoy daydreaming about things impossible in reality', correct: false },
          { label: 'To test concepts for contradictions and assumptions through hypothetical scenarios', correct: true },
          { label: 'To quantify experimental results and gather data', correct: false },
          { label: 'To confuse the other person with hard words', correct: false },
        ],
        explanation:
          'The purpose of a thought experiment is "testing assumptions." By positing a situation impossible to test in reality, it surfaces contradictions and implications that go unnoticed. It works not just in philosophy but in physics (Schrödinger\'s cat) and business strategy too.',
      },
      {
        type: 'quiz',
        question: 'What theme does the "Swampman" thought experiment ask about?',
        options: [
          { label: 'Environmental issues', correct: false },
          { label: 'What determines personal identity', correct: true },
          { label: 'Competitive principles in markets', correct: false },
          { label: 'Differences between robots and humans', correct: false },
        ],
        explanation:
          'Swampman is the thought experiment: "If a being identical at the molecular level to a human killed by lightning emerges from a swamp, are they the same person?" Memories and appearance are identical, but there is no "past causal history." It probes the essence of personal identity.',
      },
    ],
  },
}
