import type { LessonData } from './lessonData'

// ========================================
// Lateral Thinking Lessons (ID: 59-61)
// ========================================

const lateralIntro: LessonData = {
  id: 59,
  title: 'Lateral Thinking Basics — Step Outside the Norm',
  category: 'Lateral Thinking',
  steps: [
    {
      type: 'explain',
      title: 'What is lateral thinking?',
      content:
        'Lateral thinking, coined by Edward de Bono, is "horizontal" thinking.\n\n[Logical thinking — vertical]\nDig deeper from a known set of premises.\nExample: Revenue = customers x average ticket → To grow customers...\n\n[Lateral thinking — horizontal]\nQuestion the premises themselves; look from a different angle.\nExample: Is "growing revenue" even the right goal?\n→ Maybe raising margin matters more.\n→ What if we switched to a subscription model?\n\nClassic example:\nElevator wait times trigger complaints.\nVertical thinking: Add more elevators (expensive).\nLateral thinking: Put mirrors in the lobby — people groom themselves while waiting and the time feels shorter.\n\nLogical and lateral are not opposites; they complement each other.',
      visual: 'VerticalVsLateralDiagram',
      outro:
        'Picture vertical thinking as "digging deep inside the frame" and lateral thinking as "sliding the frame itself sideways." Using the two in alternation gives you both depth and breadth, and the freedom of your thinking jumps at once.',
    },
    {
      type: 'quiz',
      question: 'For the question "How can we shorten pizza delivery times?" which answer is lateral thinking?',
      options: [
        { label: 'Hire more delivery riders to increase simultaneous capacity', correct: false },
        { label: 'Switch to faster motorbikes or e-vehicles to speed transit', correct: false },
        { label: 'Streamline cooking workflow to cut kitchen-side wait time', correct: false },
        { label: 'Drop the "delivery" premise — make fresh in-store pickup the experience itself', correct: true },
      ],
      explanation:
        'The first three improve "delivery" within the existing premise (vertical thinking). Only the last option drops the premise of "delivering" itself, which is the heart of lateral thinking. The distinction between "optimizing inside the frame" and "rewriting the frame" is what to look for.',
    },
    {
      type: 'explain',
      title: 'Reframing — Change the frame',
      content:
        'The most powerful technique in lateral thinking is reframing.\n\nLook at the same situation through a different frame.\n\nExample 1: "A competitor cut prices."\nFrame A: "Should we cut prices too?" (price-war frame)\nFrame B: "Can we turn our inability to cut prices into a high-value pitch?"\n→ Position high price as high quality.\n\nExample 2: "Young people don\'t read."\nFrame A: "How do we get them to read books?"\nFrame B: "How do we meet them in the formats they already use (video, audio)?"\n→ Audiobooks, video summaries.\n\nExample 3: "Employee attrition is high."\nFrame A: "How do we keep people from leaving?"\nFrame B: "Can we leverage them as alumni after they leave?"\n→ Alumni network programs.',
    },
    {
      type: 'quiz',
      question: 'Which is the best reframe of "rural depopulation is killing the local shopping street"?',
      options: [
        { label: 'Attract a large shopping mall to recreate a draw', correct: false },
        { label: 'Use subsidies to keep existing shops alive longer', correct: false },
        { label: 'Recast "few people = quiet" as a strength and pitch the area as a remote-work hub', correct: true },
        { label: 'Run a campaign encouraging young people to move back home', correct: false },
      ],
      explanation:
        'The other three stay inside the "depopulation = bad" frame and look for fixes. The reframe takes "few people" — a stated weakness — and recasts it as a strength (low density, quiet) tied to a different demand pool. Reframing changes the frame, not the actions inside the frame.',
    },
    {
      type: 'explain',
      title: 'Reversal — "What if we flipped it?"',
      content:
        'A core lateral-thinking technique: reversal.\n\nFlip the "obvious."\n\nObvious: At a restaurant, the chef cooks for the customer.\nReversed: The customer cooks for themselves → cooking-class restaurants, BBQ.\n\nObvious: Insurance pays out after an accident.\nReversed: It pays out when accidents do not happen → wellness/health-points insurance.\n\nObvious: Ads bring in users.\nReversed: Users make the ads → user-generated content (UGC).\n\nObvious: Failure should be avoided.\nReversed: Failure becomes an asset → a "failure database" that drives organizational learning.\n\nHow to do it:\n1. Write down the "should X" assumptions.\n2. Reverse them: "X should NOT happen."\n3. Look for feasible ideas inside the reversal.',
    },
    {
      type: 'quiz',
      question: 'Reversing "hotels should own their own rooms" gave rise to which business model?',
      options: [
        { label: 'Capsule hotels — minimizing per-room size for high turnover', correct: false },
        { label: 'Airbnb — turning individually-owned rooms into a platformized inventory', correct: true },
        { label: 'Business-hotel chains — standardize and scale for operating efficiency', correct: false },
        { label: 'Luxury resort hotels — limit room count and earn through premium pricing', correct: false },
      ],
      explanation:
        'Airbnb reversed the "operator owns the rooms" premise — distributing ownership and centralizing it in a platform layer. The others all preserve the "operator owns rooms" frame and optimize operations on top of it. Reversal of premise vs operational optimization is what to listen for.',
    },
  ],
}

const lateralTechniques: LessonData = {
  id: 60,
  title: 'Lateral Thinking Techniques',
  category: 'Lateral Thinking',
  steps: [
    {
      type: 'explain',
      title: 'Random stimulation — Spark ideas from the unrelated',
      content:
        'A technique that forces fresh ideas by injecting an unrelated word or image.\n\nProcedure:\n1. Set the problem: "A new note-taking app concept."\n2. Pick a random word: "aquarium."\n3. List traits of the word: transparent, depth, schools (of fish), feeding, soothing.\n4. Force connections to the problem:\n\n- "Transparent" → notes others can partially see-through, for collaboration\n- "Depth" → an outliner that lets you drill down\n- "Schools" → automatic clustering of related notes\n- "Feeding" → periodic prompts to revisit and review\n- "Soothing" → a journaling mode where the act of writing is calming\n\nForcing unrelated things together produces ideas you could never reach by pure logic.',
    },
    {
      type: 'quiz',
      question: 'Problem: "A new convenience-store service" x random word: "library." Which combination is the most interesting?',
      options: [
        { label: 'Sell books inside the convenience store (surface "book" association)', correct: false },
        { label: 'Install "15-minute focus booths" — extract the essence of focus space', correct: true },
        { label: 'Add barcode-scannable book-review links on products (indirect link to books)', correct: false },
        { label: 'Play soft background music to mimic the library atmosphere', correct: false },
      ],
      explanation:
        'Reading "library" as "books" leads to surface-merchandise answers. Abstracting it as "a space for focus" lets you combine it with convenience-store accessibility to create a real new offering. The skill in random stimulation is separating surface associations from essential abstractions.',
    },
    {
      type: 'explain',
      title: 'SCAMPER — Seven transformations',
      content:
        'SCAMPER is a technique for transforming an existing thing through seven lenses:\n\nS — Substitute\nCould you swap a part for something else?\nExample: Teacher → AI tutor\n\nC — Combine\nCan you merge two or more things?\nExample: Phone + wallet → mobile payments\n\nA — Adapt\nCan you borrow an idea from another field?\nExample: Game leveling → XP system in a learning app\n\nM — Modify\nWhat if you change the size, shape, or order?\nExample: 30-minute class → 3-minute micro-lesson\n\nP — Put to other use\nCould it be used for a different purpose?\nExample: Factory waste heat → heated swimming pool\n\nE — Eliminate\nWhat if you remove something?\nExample: Menu → omakase course only\n\nR — Reverse\nWhat if you reverse roles or order?\nExample: Teacher → student → peer-to-peer teaching',
      visual: 'ScamperDiagram',
      outro:
        'SCAMPER is a "template set of transformations." When you are stuck, run the seven verbs over your existing idea one by one. That alone hands you far more options than trying to squeeze something out of nothing.',
    },
    {
      type: 'quiz',
      question: 'Apply E (Eliminate) of SCAMPER to "traditional business-card exchange." Which result fits?',
      options: [
        { label: 'Refine the card design with elaborate visuals (Modify)', correct: false },
        { label: 'Add a QR code on top of the paper card (Combine)', correct: false },
        { label: 'Eliminate the paper card entirely — share profiles instantly via NFC/QR (Eliminate)', correct: true },
        { label: 'Enlarge the card to make it stand out (Modify)', correct: false },
      ],
      explanation:
        'Eliminate removes the element entirely, retaining only the underlying function. Adding a QR is Combine, design upgrades and size changes are Modify — distinct SCAMPER moves that look like Eliminate but are not. Naming which SCAMPER lens applies to each option is the discrimination skill.',
    },
    {
      type: 'explain',
      title: 'Six Thinking Hats',
      content:
        'De Bono\'s "Six Thinking Hats" is a framework for thinking from multiple angles as a team.\n\n* White hat (facts)\n"What does the data say?"\nState only objective facts and figures.\n\n* Red hat (emotion)\n"How do you feel intuitively?"\nShare gut reactions without justifying them.\n\n* Black hat (caution)\n"What are the risks? Why might this fail?"\nSurface problems from a pessimistic angle.\n\n* Yellow hat (optimism)\n"What good could come of it?"\nFocus on possibilities and benefits.\n\n* Green hat (creativity)\n"What other ways are there?"\nGenerate new ideas and alternatives.\n\n* Blue hat (process)\n"How do we run the discussion?"\nManage the process and summarize conclusions.\n\nWhen everyone wears the same hat at once, conversation becomes collaborative rather than adversarial.',
      visual: 'SixHatsDiagram',
      outro:
        'The six hats are a device for "switching, in turn, between perspectives that would otherwise collide all at once." Just by carving out time where everyone wears the same color, emotion and fact stop mixing, and the discussion toward a conclusion gets remarkably organized.',
    },
    {
      type: 'quiz',
      question: 'In a planning meeting for a new service, an idea comes up: "Interesting, but the risk feels big." Using Six Thinking Hats, which hat should you put on next?',
      options: [
        { label: 'Red hat (emotion) — surface the team\'s gut reactions to the idea', correct: false },
        { label: 'Black hat (caution) — list the risks concretely and quantify them', correct: true },
        { label: 'Green hat (creativity) — generate alternative ideas to compare', correct: false },
        { label: 'White hat (facts) — research success rates of similar past projects', correct: false },
      ],
      explanation:
        '"The risk feels big" is a vague concern; the black hat\'s job is to make it concrete. Emotion-sharing keeps the concern vague, generating alternatives skips assessing the current one, and fact research is a support tool for the black hat — useful, but downstream of the diagnosis itself.',
    },
  ],
}

const lateralPractice: LessonData = {
  id: 61,
  title: 'Lateral Thinking in Practice',
  category: 'Lateral Thinking',
  steps: [
    {
      type: 'explain',
      title: 'Lateral thinking applied to business',
      content:
        'Innovations born from lateral thinking:\n\n[Netflix]\nObvious: You watch movies in theaters / rent DVDs from a store.\nReversal: The movie comes to your house → mail-in DVDs → streaming.\n\n[Southwest Airlines]\nObvious: Airlines grow by adding more routes.\nReframing: Position as "an alternative to the bus."\n→ Low fares, high frequency, point-to-point.\n\n[Nintendo Wii]\nObvious: Game consoles compete on graphical horsepower.\nReversal: Drop the horsepower; commit to "play with movement."\n→ Opened up the non-gamer audience.\n\nThe common thread:\nAll three questioned the "industry common sense" and changed the premise.\nNot a technological breakthrough — a thinking breakthrough.',
    },
    {
      type: 'quiz',
      question: 'Applying lateral thinking to "disrupt the taxi industry," which approach is the most lateral?',
      options: [
        { label: 'Upgrade taxi interiors to a premium tier (premiumization)', correct: false },
        { label: 'Cut wait times with a dispatch app (operational improvement)', correct: false },
        { label: 'Drop the "company owns vehicles and drivers" premise — match private drivers to riders directly', correct: true },
        { label: 'Cut fares uniformly to lower the barrier to use (price strategy)', correct: false },
      ],
      explanation:
        'The correct option is the Uber/Lyft move — overturning the industry-defining premise that operators own the vehicles and employ professional drivers. The other three are improvements within the existing premise. Distinguishing improvement from game-rule-rewriting is the key habit.',
    },
    {
      type: 'explain',
      title: '[Exercise] Rewrite the premise',
      content:
        'Try reframing the following industry truisms:\n\nTruism 1: "A university takes 4 years."\n→ A 3-month bootcamp focused only on the skills you need.\n→ A lifelong-learning subscription (one subject per year).\n\nTruism 2: "You go to a hospital after you get sick."\n→ A preventive-care subscription you use while you are healthy.\n→ AI that detects early warning signs in your daily data.\n\nTruism 3: "Insurance is for emergencies."\n→ Incentive insurance: lower premiums for healthy behavior.\n→ Micro-insurance switched on/off by the day, only when needed.\n\nWhat are the "truisms" of your industry?\nIf you flipped them, what would emerge?',
    },
    {
      type: 'quiz',
      question: 'Truism: "A supermarket should have a wide assortment." Which success story reverses this through lateral thinking?',
      options: [
        { label: 'Don Quijote — maximize variety and lean into a treasure-hunt experience', correct: false },
        { label: 'Costco — curate ~4,000 SKUs, buy in bulk, price aggressively', correct: true },
        { label: 'Convenience stores — narrow selection but win on access and 24-hour ops', correct: false },
        { label: 'Online grocery — no physical store, theoretically unlimited assortment', correct: false },
      ],
      explanation:
        'Costco flips "more variety = better" by curating ~10% of a typical supermarket\'s SKU count, then leveraging bulk buying and a membership model. Don Quijote and online grocery preserve or amplify the variety premise; convenience stores narrow assortment via a different lens (access/time). Only Costco performs the actual reversal.',
    },
    {
      type: 'explain',
      title: 'Lateral thinking — recap',
      content:
        'Lateral thinking is "thinking past the frame":\n\nReframing — change the frame of the problem.\nReversal — flip the obvious.\nRandom stimulation — borrow ideas from the unrelated.\nSCAMPER — evolve the existing through seven transformations.\nSix Thinking Hats — examine from multiple angles.\n\nWhen to use which:\n- Logical thinking → "solve the problem correctly"\n- Lateral thinking → "find the right problem to solve"\n\nA top-tier business professional uses both.\n\nDaily practice:\n- Make "Is there another way?" a default question.\n- When you read the news, ask: "What if it were reversed?"\n- Try mapping another industry\'s business model onto yours.',
    },
    {
      type: 'quiz',
      question: 'Which statement about logical and lateral thinking is correct?',
      options: [
        { label: 'Lateral thinking alone is enough — logical thinking becomes optional', correct: false },
        { label: 'Logical thinking is more reproducible, so it should take priority in business', correct: false },
        { label: 'They complement each other — lateral finds the right question, logical solves it', correct: true },
        { label: 'They are opposing modes and cannot be used in the same project', correct: false },
      ],
      explanation:
        'They have different goals and combine well: lateral finds the right question, logical solves it correctly. "Lateral is enough," "logical wins," and "they cannot coexist" all force a false binary that downgrades one of the two — a common trap when learning either one in isolation.',
    },
  ],
}

export const lateralThinkingLessonMapEn: Record<number, LessonData> = {
  59: lateralIntro,
  60: lateralTechniques,
  61: lateralPractice,
}
