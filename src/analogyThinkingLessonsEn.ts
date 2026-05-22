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
        { label: 'A survival-of-the-fittest dynamic where strong companies absorb the weak', correct: false },
        { label: 'A network of companies, developers, and users circulating value through interdependence', correct: true },
        { label: 'Companies pursuing environmentally friendly business activities (sustainability)', correct: false },
        { label: 'Corporate CSR programs aimed at protecting the natural environment', correct: false },
      ],
      explanation:
        'The essence of an ecosystem is "many actors making the whole work through interdependence" — that translates to Apple/Amazon-style business ecosystems. "Survival of the fittest" cherry-picks predation; sustainability and CSR are different connotations of the word "eco-" with no structural mapping to the analogy. Confusing word associations with the structural transfer is the typical mistake.',
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
        { label: '"A company" and "a ship" — large organizations where a captain steers', correct: false },
        { label: '"Traffic congestion" and "network congestion" — nodes overload past capacity and flow stalls', correct: true },
        { label: '"The sun" and "the CEO" — others are drawn toward a central figure', correct: false },
        { label: '"Coffee" and "a meeting" — both consumed together inside an office', correct: false },
      ],
      explanation:
        'The correct option has identical mechanisms (throughput concentrates → capacity exceeded → whole system stalls) across very different surface domains (cars vs packets). The others rely on superficial word associations (size, centrality, co-location) without engaging the underlying relationships. Word-level similarity and structural isomorphism are the line to draw.',
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
        { label: 'Other restaurants\' repeat-visit tactics (near analogy)', correct: false },
        { label: 'Mobile game retention mechanics — progress bars, reward loops, achievements', correct: true },
        { label: 'Luxury brand scarcity marketing strategy', correct: false },
        { label: 'Government public-service usage campaigns', correct: false },
      ],
      explanation:
        'Mobile games are the most refined field for engineering repeated engagement — their structure (visible progress + reward loops + achievements) is the ancestral form of stamp cards and loyalty programs. Same-industry tactics rarely differentiate; luxury scarcity and public-service campaigns operate on different retention structures. Aim for "far field, same structure" — that\'s where analogies pay off.',
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
        { label: 'Starbucks importing Italian café culture into the U.S. (within food service)', correct: false },
        { label: 'Shinkansen 500 nose designed after a kingfisher\'s beak — biology to railway engineering', correct: true },
        { label: 'Toyota refining Ford\'s mass-production system (within manufacturing)', correct: false },
        { label: 'LINE referencing WhatsApp\'s messaging features (within messaging apps)', correct: false },
      ],
      explanation:
        'The correct option is the canonical biomimicry case — biology to railway engineering crosses a huge field gap and solved the tunnel-boom noise problem. The others are near-field references inside the same or adjacent industries. "Distance" of an analogy is measured by field separation, not novelty of the move itself.',
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
        { label: 'Let people buy supplements on Amazon (distribution expansion)', correct: false },
        { label: 'A one-tap mechanism to log and share today\'s health data (friction minimization)', correct: true },
        { label: 'Read books about health to raise literacy (knowledge acquisition)', correct: false },
        { label: 'Digitize hospital appointment scheduling (existing-workflow digitization)', correct: false },
      ],
      explanation:
        'Translating the abstract "minimize friction" to health management gives you one-tap logging. The distractors lean on surface-word associations ("Amazon," "health") rather than the abstract structure. The discriminator is whether the answer is structurally the same as Amazon 1-Click — only one-tap logging is.',
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
        { label: 'Office and IT infrastructure — the propulsion body itself', correct: false },
        { label: 'Capital from funding and revenue — consumed to generate thrust', correct: true },
        { label: 'The mission statement — the compass that points the direction', correct: false },
        { label: 'Competitive analysis reports — the map for choosing the flight path', correct: false },
      ],
      explanation:
        'Fuel is "consumed to produce thrust," which maps to cash. Infrastructure is the airframe, the mission is the heading, and competitive analysis is navigation — each maps to a different rocket part. The "run out of fuel and the rocket falls = run out of cash and the company dies" intuition makes burn rate viscerally clear.',
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
        { label: 'Add an end-of-lesson quiz to check comprehension (assessment)', correct: false },
        { label: 'End each lesson with a "next-time" teaser and an unresolved question', correct: true },
        { label: 'Frame the entire lesson as a TV-drama-style story (surface mimicry)', correct: false },
        { label: 'Award a completion badge after each lesson (reward design)', correct: false },
      ],
      explanation:
        'The cliffhanger structure is "unresolved tension that creates pull toward the next." Next-lesson teaser + unresolved question is the precise translation. Drama framing mimics the surface, quizzes are assessment, and badges are reward design — all valid mechanisms, but not the same structure as cliffhangers. Distinguishing structural translation from surface mimicry is the core skill.',
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
        { label: 'Pulling analogies from distant fields (a source of innovation)', correct: false },
        { label: 'Considering multiple analogies in parallel and picking the best (recommended practice)', correct: false },
        { label: 'Applying an analogy by surface similarity, ignoring structural differences', correct: true },
        { label: 'Verifying analogy-generated hypotheses with real data (mandatory step)', correct: false },
      ],
      explanation:
        'The deadliest trap is acting on surface similarity without checking structure. Classic case: "social media likes worked → add likes to our B2B tool" copies the surface and ignores that B2B usage structures differ. The other options are actually recommended practices, easily confused as risks by people who hear the word "danger" near them.',
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
        { label: 'Streamlining routine, repeatable work (existing-process optimization)', correct: false },
        { label: 'Forming the first hypothesis for an unprecedented problem (hypothesis generation)', correct: true },
        { label: 'Documenting existing procedures into a manual (tacit-to-explicit knowledge)', correct: false },
        { label: 'Statistical analysis of accumulated numeric data (quantitative validation)', correct: false },
      ],
      explanation:
        'Analogy is built for "no data, no precedent" situations where you need to plant an initial hypothesis from another field. Streamlining, manualizing, and statistics each have their own dedicated tools (standardization, knowledge management, statistics) that handle their cases better. "First hypothesis for unprecedented problems" is where analogy uniquely wins.',
    },
  ],
}

export const analogyThinkingLessonMapEn: Record<number, LessonData> = {
  62: analogyIntro,
  63: analogyDeepDive,
  64: analogyPractice,
}
