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
    },
    {
      type: 'quiz',
      question: 'For the question "How can we shorten pizza delivery times?" which answer is lateral thinking?',
      options: [
        { label: 'Hire more delivery riders', correct: false },
        { label: 'Switch to faster motorbikes', correct: false },
        { label: 'Reduce cooking time', correct: false },
        { label: 'Stop delivering. Show the kitchen on a live camera so customers come to pick up a fresh-from-the-oven pizza', correct: true },
      ],
      explanation:
        'The first three options improve "delivery" within the existing premise (vertical thinking). The last option questions the premise of "delivering" itself. That is the heart of lateral thinking — change the frame of the problem.',
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
        { label: 'Attract a large shopping mall', correct: false },
        { label: 'Use subsidies to keep existing shops alive', correct: false },
        { label: 'Sell "few people = quiet and pleasant" as a strength and turn the area into a workation hub for remote workers', correct: true },
        { label: 'Run a campaign to encourage young people to move back', correct: false },
      ],
      explanation:
        'The other options stay inside the "depopulation is bad" frame. The reframe takes "few people" — a weakness — and recasts it as a strength (peace and quiet) tied to a different demand (remote workers).',
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
        { label: 'Capsule hotels', correct: false },
        { label: 'Airbnb (renting individuals\' spare rooms as accommodation)', correct: true },
        { label: 'Business-hotel chains', correct: false },
        { label: 'Luxury resort hotels', correct: false },
      ],
      explanation:
        'Airbnb reversed "hotels should own rooms" into "individuals can rent out their spare rooms," and disrupted the hospitality industry. It is a textbook case of reversal producing a new business model.',
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
        { label: 'Sell books at the convenience store', correct: false },
        { label: 'Install "15-minute focus booths" inside convenience stores', correct: true },
        { label: 'Add barcode-scannable book-review links on products', correct: false },
        { label: 'Play soft background music in the store', correct: false },
      ],
      explanation:
        'The essence of a library is not "books" but "a space for focus." Convenience-store accessibility x library focus space yields the "15-minute focus booth" — a fresh service for remote workers and busy professionals.',
    },
    {
      type: 'explain',
      title: 'SCAMPER — Seven transformations',
      content:
        'SCAMPER is a technique for transforming an existing thing through seven lenses:\n\nS — Substitute\nCould you swap a part for something else?\nExample: Teacher → AI tutor\n\nC — Combine\nCan you merge two or more things?\nExample: Phone + wallet → mobile payments\n\nA — Adapt\nCan you borrow an idea from another field?\nExample: Game leveling → XP system in a learning app\n\nM — Modify\nWhat if you change the size, shape, or order?\nExample: 30-minute class → 3-minute micro-lesson\n\nP — Put to other use\nCould it be used for a different purpose?\nExample: Factory waste heat → heated swimming pool\n\nE — Eliminate\nWhat if you remove something?\nExample: Menu → omakase course only\n\nR — Reverse\nWhat if you reverse roles or order?\nExample: Teacher → student → peer-to-peer teaching',
    },
    {
      type: 'quiz',
      question: 'Apply E (Eliminate) of SCAMPER to "traditional business-card exchange." Which result fits?',
      options: [
        { label: 'Make the card design more elaborate', correct: false },
        { label: 'Add a QR code to the card', correct: false },
        { label: 'Eliminate the card entirely; share profiles instantly by tapping phones together', correct: true },
        { label: 'Make the card bigger so it stands out', correct: false },
      ],
      explanation:
        'Eliminate asks "what if this element disappeared?" Removing the paper card and sharing profiles instantly via NFC/QR keeps only the essential function — exchanging information — and represents a real innovation.',
    },
    {
      type: 'explain',
      title: 'Six Thinking Hats',
      content:
        'De Bono\'s "Six Thinking Hats" is a framework for thinking from multiple angles as a team.\n\n* White hat (facts)\n"What does the data say?"\nState only objective facts and figures.\n\n* Red hat (emotion)\n"How do you feel intuitively?"\nShare gut reactions without justifying them.\n\n* Black hat (caution)\n"What are the risks? Why might this fail?"\nSurface problems from a pessimistic angle.\n\n* Yellow hat (optimism)\n"What good could come of it?"\nFocus on possibilities and benefits.\n\n* Green hat (creativity)\n"What other ways are there?"\nGenerate new ideas and alternatives.\n\n* Blue hat (process)\n"How do we run the discussion?"\nManage the process and summarize conclusions.\n\nWhen everyone wears the same hat at once, conversation becomes collaborative rather than adversarial.',
    },
    {
      type: 'quiz',
      question: 'In a planning meeting for a new service, an idea comes up: "Interesting, but the risk feels big." Using Six Thinking Hats, which hat should you put on next?',
      options: [
        { label: 'Red hat (emotion) — survey the team\'s gut reactions', correct: false },
        { label: 'Black hat (caution) — list the risks concretely', correct: true },
        { label: 'Green hat (creativity) — brainstorm more ideas', correct: false },
        { label: 'White hat (facts) — research the success rate of similar past projects', correct: false },
      ],
      explanation:
        'The vague concern "the risk feels big" calls for the black hat: spell out and quantify the risks concretely. Once you know "what is risky and how," you can move to the yellow and green hats to find ways to mitigate.',
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
        { label: 'Make taxi interiors more luxurious', correct: false },
        { label: 'Cut wait times with a dispatch app', correct: false },
        { label: 'Drop the assumption that "taxi companies own the cars and the drivers" and let everyday people drive their own cars to give rides', correct: true },
        { label: 'Cut taxi fares', correct: false },
      ],
      explanation:
        'That is exactly the Uber/Lyft idea. They overturned the industry-defining assumption that "a taxi company owns vehicles and employs professional drivers." Lateral thinking does not improve the game — it changes the rules of the game.',
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
        { label: 'Don Quijote (massive assortment plus a treasure-hunt feel)', correct: false },
        { label: 'Costco (limited SKUs, bulk buying, low prices)', correct: true },
        { label: 'Convenience stores (limited selection but 24-hour operation)', correct: false },
        { label: 'Online grocery (no store, unlimited assortment)', correct: false },
      ],
      explanation:
        'Costco flips "more variety = better." It curates around 4,000 SKUs (about a tenth of a typical supermarket) and uses bulk buying to drive down prices, securing margin through a membership model.',
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
        { label: 'If you have lateral thinking, you do not need logical thinking', correct: false },
        { label: 'Logical thinking matters more in business', correct: false },
        { label: 'They complement each other; lateral discovers the question, logical solves it', correct: true },
        { label: 'They are opposing modes and cannot be used at the same time', correct: false },
      ],
      explanation:
        'Use lateral thinking to find "the right question to solve," then use logical thinking to "solve that question correctly." Knowing when to switch modes leads to the most effective problem solving.',
    },
  ],
}

export const lateralThinkingLessonMapEn: Record<number, LessonData> = {
  59: lateralIntro,
  60: lateralTechniques,
  61: lateralPractice,
}
