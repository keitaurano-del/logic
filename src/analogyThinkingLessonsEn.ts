import type { LessonData } from './lessonData'

// ========================================
// Analogy Thinking Lessons (ID: 62-64)
// ========================================

const analogyIntro: LessonData = {
  id: 62,
  title: 'Analogy Basics — Reason by Analogy',
  category: 'Analogy Thinking',
  steps: [
    {
      type: 'explain',
      title: 'What is analogical reasoning?',
      content:
        'Analogical reasoning means finding the structural similarity between A and B, then applying what you know about A to B.\n\nEveryday example: the "human body" as an analogy for a "company."\n- Brain → executives (decision-making)\n- Heart → finance (circulating money like blood)\n- Immune system → risk management (rejecting threats)\n- Nervous system → information systems (transmitting information)\n\nIn business:\nTranslate successful patterns from one industry into your own.\n\nExample: Convenience store "shelf placement" → website "content placement."\n- Bestsellers at eye level → high-CTR content above the fold\n- Impulse buys at the checkout → upsell at the checkout step\n\nWhy analogy is powerful:\nEven in a domain where you know nothing, finding structural similarity lets you generate hypotheses immediately.',
    },
    {
      type: 'quiz',
      question: 'Applying the "ecosystem" analogy to business, which interpretation fits best?',
      options: [
        { label: 'Strong companies acquire weak ones', correct: false },
        { label: 'A "business ecosystem" where multiple companies are interdependent and create value together', correct: true },
        { label: 'Companies pursuing eco-friendly initiatives', correct: false },
        { label: 'Corporate CSR activities to protect the natural environment', correct: false },
      ],
      explanation:
        'In an ecosystem, diverse organisms are interdependent and the whole functions because of those relationships. Translating that to business gives you the "platform + developers + users" ecosystem concept (Apple, Amazon, etc.) where everyone provides value to everyone else.',
    },
    {
      type: 'explain',
      title: 'Spotting structural similarity',
      content:
        'There are two kinds of similarity in analogies: surface similarity and structural similarity.\n\n[Surface similarity — weak analogy]\nThings look alike.\nExample: "The cloud is like clouds in the sky." That alone gets you nothing.\n\n[Structural similarity — strong analogy]\nThe relationships and mechanisms are alike.\nExample: "The immune system" and "security software."\n- Both detect unknown threats.\n- Both use "memory" of past attacks to prevent reinfection/reattack.\n- Both risk overreaction (autoimmune disease / false positives).\n→ Knowledge from immunology can inform security design.\n\nA good analogy:\n1. Has matching structure (mechanism, causality).\n2. Comes from a surface-level different field.\n3. Has validated knowledge in the source field.',
    },
    {
      type: 'quiz',
      question: 'Which of these is the strongest structural analogy?',
      options: [
        { label: '"A company" and "a ship" — both are large organizations', correct: false },
        { label: '"Traffic congestion" and "network congestion" — both involve nodes overloaded so flow stalls', correct: true },
        { label: '"The sun" and "the CEO" — both are at the center of their world', correct: false },
        { label: '"Coffee" and "a meeting" — both happen in the office', correct: false },
      ],
      explanation:
        'Traffic and network congestion look totally different on the surface (cars vs. data packets), but the mechanism is identical: "throughput concentrates at a node, exceeds capacity, the whole system stalls." That is why traffic engineering insights can inform network design.',
    },
    {
      type: 'explain',
      title: 'Use analogy to generate hypotheses',
      content:
        'Practical steps for analogical reasoning:\n\n(1) Extract the "structure" of your problem.\nProblem: "Lower the churn rate of our new SaaS."\nStructure: "A subscription where users start engaged but gradually drop off."\n\n(2) Find another field with the same structure.\n→ This is the same structure as gym membership churn!\n\n(3) Look up successful tactics in that other field.\nGym tactics that work:\n- Required personal-training session in month 1 (great onboarding)\n- Group classes that build community (peer ties)\n- Outreach when members stop showing up (retention nudges)\n\n(4) "Translate" back to your domain.\n→ Required onboarding call in month 1 (initial experience)\n→ Run a user community (peer ties)\n→ Auto-send follow-up emails when usage drops (retention nudges)\n\nAnalogy lets you find original moves by borrowing wisdom from a different industry, instead of copying same-industry best practices.',
    },
    {
      type: 'quiz',
      question: 'For "increase repeat visits to a restaurant," which is the most useful analogy source?',
      options: [
        { label: 'Other restaurants\' success cases (same industry)', correct: false },
        { label: 'Retention tactics from gaming apps (visible progress, reward loops)', correct: true },
        { label: 'Luxury brand marketing strategies', correct: false },
        { label: 'Government campaigns to encourage public-service usage', correct: false },
      ],
      explanation:
        'Gaming apps have highly refined retention mechanics — progress bars, daily bonuses, achievements. Restaurant stamp cards and regular-customer perks share the same structure. Borrowing from a different industry usually produces more original moves than copying neighbors.',
    },
  ],
}

const analogyDeepDive: LessonData = {
  id: 63,
  title: 'Analogy Techniques — Borrow from Far Away',
  category: 'Analogy Thinking',
  steps: [
    {
      type: 'explain',
      title: 'Near vs. far analogies',
      content:
        'The "distance" of an analogy changes what you get out of it.\n\n[Near analogy — same industry / similar field]\nPros: Easy to apply, low risk of failure.\nCons: Hard to differentiate.\nExample: Copying a competitor\'s sales tactics.\n\n[Far analogy — different industry / different field]\nPros: Generates innovative ideas.\nCons: Cannot be applied directly; requires translation.\nExample: Borrowing game mechanics for education.\n\nInnovation often comes from far analogies:\n\n- Dyson vacuum ← industrial cyclonic dust collectors\n- Uber ← "anyone can be a driver" + an app\n- Netflix ← gym\'s "all-you-can-use monthly" model\n\nBuilding up cross-domain knowledge is the fuel of analogical reasoning.',
    },
    {
      type: 'quiz',
      question: 'Which is the example of innovation from the "farthest" analogy?',
      options: [
        { label: 'Starbucks bringing Italian café culture to the U.S.', correct: false },
        { label: 'The shape of the Shinkansen 500 series nose, designed after a kingfisher\'s beak (biomimicry)', correct: true },
        { label: 'Toyota refining Ford\'s mass-production system', correct: false },
        { label: 'LINE drawing on WhatsApp\'s messaging features', correct: false },
      ],
      explanation:
        'The Shinkansen 500 series adopted the kingfisher\'s beak shape (biomimicry). A bird shape → a railway car is an extremely far-field analogy, and it solved the tunnel-boom noise problem. A near analogy could never have produced that solution.',
    },
    {
      type: 'explain',
      title: 'Abstract and instantiate — the core skill',
      content:
        'In practice, the most important skills in analogical reasoning are abstraction and instantiation.\n\n(1) Abstract a concrete case.\n\nCase: "Netflix\'s recommendation system"\n↓ abstract\nStructure: "Predict individual preferences from past behavior data and offer suggestions."\n\n(2) Instantiate the abstract structure in a different domain.\n\n↓ instantiated for hiring\n"Recruiting AI that predicts a candidate\'s likelihood of success from past hiring data."\n\n↓ instantiated for education\n"Adaptive learning that predicts a student\'s weak spots from past data and serves the optimal next problem."\n\n↓ instantiated for healthcare\n"Preventive-care AI that predicts disease risk from past case data and proposes interventions."\n\nThe same abstract structure can spawn ideas across completely different fields.',
    },
    {
      type: 'quiz',
      question: 'Abstracting "Amazon 1-Click" gives you "minimize friction to drive action." Instantiating that in "health management" produces what?',
      options: [
        { label: 'Letting people buy supplements on Amazon', correct: false },
        { label: 'A one-tap mechanism to log and share today\'s health data', correct: true },
        { label: 'Reading books about health', correct: false },
        { label: 'Building a hospital appointment system', correct: false },
      ],
      explanation:
        'Applying "minimize friction to drive action" to health management gives you designs that lower the bar for the action, like one-tap logging. Amazon 1-Click → one-tap health logging — same structure, different domain.',
    },
    {
      type: 'explain',
      title: 'The power of metaphor — accelerate thinking',
      content:
        'Metaphor is a special form of analogy that accelerates both communication and thought.\n\nGreat metaphors:\n\n"Technical debt"\n→ Borrowed from financial "debt"\n→ If you do not repay it (refactoring), interest (bugs, slowdowns) compounds\n→ One phrase makes the seriousness obvious even to non-engineers\n\n"MVP"\nMinimum Viable Product = the smallest thing that still works\n→ "The minimum version of a cake is not a cookie. It is still a cake, just smaller."\n→ Do not strip features — keep only the core.\n\nMetaphor is more than rhetoric.\nA new metaphor reframes the problem,\nand reframes thinking itself.',
    },
    {
      type: 'quiz',
      question: 'If you cast a startup\'s growth as a "rocket," what corresponds best to "rocket fuel"?',
      options: [
        { label: 'Office equipment', correct: false },
        { label: 'Capital (investment, revenue)', correct: true },
        { label: 'The mission statement', correct: false },
        { label: 'Competitive analysis reports', correct: false },
      ],
      explanation:
        'In the rocket metaphor, fuel = thrust. For a startup, capital (cash) is the thrust. Run out of fuel and the rocket falls — run out of capital and the company collapses. The metaphor makes "burn rate" intuitively important.',
    },
  ],
}

const analogyPractice: LessonData = {
  id: 64,
  title: 'Analogy Thinking in Practice',
  category: 'Analogy Thinking',
  steps: [
    {
      type: 'explain',
      title: '[Exercise] Cross-industry analogy challenge',
      content:
        'Try generating solutions for the following challenge using analogies from other industries.\n\nChallenge: "Online learning has a low completion rate (15% on average)."\n\nCandidate analogy sources:\n\n(1) Gaming\n→ Progress bars, daily missions, leaderboards, gacha (random rewards)\n\n(2) Fitness\n→ Personal trainers, group classes, before/after photos\n\n(3) TV / film\n→ Cliffhangers (the next-episode hook), season structure, characters\n\n(4) Religion / community\n→ Regular gatherings, mentorship, sense of belonging\n\nHow does each structure translate to "online learning"?\nThink it through in the next quiz.',
    },
    {
      type: 'quiz',
      question: 'To improve online-learning completion, which is the most faithful analogical translation of a TV cliffhanger?',
      options: [
        { label: 'Add a quiz at the end of each lesson', correct: false },
        { label: 'End each lesson with a peek of the next lesson and an unresolved question', correct: true },
        { label: 'Tell the lesson content as a TV-drama-style story', correct: false },
        { label: 'Award a badge for completing the lesson', correct: false },
      ],
      explanation:
        'A cliffhanger\'s structure is "leave unresolved tension that pulls you to the next." Ending a lesson with "the answer is in the next lesson" creates the same forward pull. The point is to translate the structure, not to copy the surface drama style.',
    },
    {
      type: 'explain',
      title: 'Pitfalls of analogical reasoning',
      content:
        'Watch out for these traps:\n\n[1. Fooled by surface similarity]\n"A and B are both red, so the same method works on both."\n→ Judge on structure (mechanism), not on color (surface).\n\n[2. Ignoring the difference in preconditions]\n"It worked in the U.S., so it will work in Japan."\n→ Markets, cultures, regulations differ. Translation is required.\n\n[3. Using analogy as proof]\n"X is like Y, therefore X is correct."\n→ Analogy is a tool for generating hypotheses; verify separately.\n\n[4. Sticking to a single analogy]\n"The company is a family." → So you cannot fire underperformers?\n→ Try multiple analogies and pick the best fit.\n\nRule of thumb:\nAnalogy is a thinking tool, not an answer.\nAlways pair it with verification.',
    },
    {
      type: 'quiz',
      question: 'Which is the most dangerous trap in analogical reasoning?',
      options: [
        { label: 'Using analogies from far-off fields', correct: false },
        { label: 'Considering several analogies in parallel', correct: false },
        { label: 'Applying an analogy based only on surface similarity, ignoring the structural differences', correct: true },
        { label: 'Verifying hypotheses generated by analogy', correct: false },
      ],
      explanation:
        'The most dangerous trap is being fooled by surface similarity. Example: "Social media succeeded with likes, so add a Like button to our B2B tool and engagement will follow." The surface looks similar, but the underlying usage structures of B2B differ — and the analogy fails.',
    },
    {
      type: 'explain',
      title: 'Analogy thinking — recap',
      content:
        'Key points of analogical reasoning:\n\nLook for "structural" similarity, not surface.\nThe farther the field, the more innovative the analogy.\nThe core process is abstract → translate → instantiate.\nAnalogy is for generating hypotheses, not proof.\nTry multiple analogies and pick the best fit.\n\nDaily habits to sharpen analogical thinking:\n1. Learn one cross-industry business model per week.\n2. When you read news, articulate: "This is the same structure as X."\n3. Ask: "If someone from industry X tackled this problem, how would they?"\n4. Cultivate breadth — history, science, the arts.\n\nThe broader your knowledge, the farther you can reach for a powerful analogy.\n"T-shaped" people (deep expertise + wide breadth) win.',
    },
    {
      type: 'quiz',
      question: 'When does analogical reasoning shine the most?',
      options: [
        { label: 'Streamlining routine work', correct: false },
        { label: 'Forming hypotheses for unprecedented problems', correct: true },
        { label: 'Documenting existing procedures into a manual', correct: false },
        { label: 'Analyzing numerical data', correct: false },
      ],
      explanation:
        'Analogy shines on "unprecedented" problems. When neither data nor prior cases exist, structural similarity from another field gives you a starting hypothesis. It is the perfect tool for new ventures, novel problems, and innovation.',
    },
  ],
}

export const analogyThinkingLessonMapEn: Record<number, LessonData> = {
  62: analogyIntro,
  63: analogyDeepDive,
  64: analogyPractice,
}
