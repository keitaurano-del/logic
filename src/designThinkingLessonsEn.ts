import type { LessonData } from './lessonData'

// ========================================
// Design Thinking Lessons (ID: 56-58)
// ========================================

const designThinkingIntro: LessonData = {
  id: 56,
  title: 'Intro to Design Thinking — Start with Empathy',
  category: 'Design Thinking',
  steps: [
    {
      type: 'explain',
      title: 'What is Design Thinking?',
      content:
        'Design Thinking is a problem-solving methodology systematized by Stanford d.school.\n\nThe traditional approach:\nEngineer: "Look at this amazing technology!" → Build the product → Nobody buys it…\n\nThe Design Thinking approach:\n"What problems do users actually have?" → Empathize → Define → Solve\n\nFive steps:\n1. Empathize — Deeply understand the user\n2. Define — Pin down the real problem\n3. Ideate — Generate many possible solutions\n4. Prototype — Make it tangible quickly\n5. Test — Put it in front of users\n\nKey traits:\n• Look for the "best answer," not "the right answer"\n• Don\'t fear failure — try fast\n• Watch what users do, not just what they say',
      visual: 'DesignThinkingCycleDiagram',
      outro:
        'The five steps are a device for running the loop of "understand the user → make something → learn." Rather than starting from technology or a bright idea, always walk the steps in order beginning with empathy — that is how you get closer to something people actually use.',
    },
    {
      type: 'quiz',
      question: 'What is the first step of Design Thinking?',
      options: [
        { label: 'Brainstorm a wide range of possible solutions', correct: false },
        { label: 'Empathize with users through observation, interview, and immersion', correct: true },
        { label: 'Run market research and quantitative data analysis', correct: false },
        { label: 'Build a prototype quickly to test reactions', correct: false },
      ],
      explanation:
        'Design Thinking opens with Empathize. Brainstorming is Ideate, market research is the business-check side, and prototyping is the Prototype phase — all of which come after empathy. The first move is to immerse yourself in user behavior and context before reaching for solutions.',
    },
    {
      type: 'explain',
      title: 'Empathize — Find the unspoken truth',
      content:
        'In the empathize step, observation is everything.\n\nWhat users say ≠ what users actually need\n\nFamous IDEO example:\nA hospital waiting-room redesign project.\nIn surveys, "long wait time" was the #1 complaint.\n\nBut when the team observed users…\n• Patients were less troubled by the wait itself than by "not knowing how long they\'d wait"\n• Family members were stressed by "not knowing what was happening to the patient"\n\nThe right solution wasn\'t "shorter waits" — it was "make information visible."\n\n:::warn\nTurning survey wording straight into requirements leads to off-target solutions. Use observation to confirm the real trouble hiding beneath the stated complaint.\n:::\n\nMethods of empathy:\n1. Observe — Watch behavior\n2. Interview — Ask "why?" five times\n3. Immerse — Become the user yourself',
    },
    {
      type: 'quiz',
      question: 'In a user interview, someone says "this app\'s search is hard to use." What is the most appropriate Design Thinking response?',
      options: [
        { label: 'Immediately redesign the search UI (jump straight to solution)', correct: false },
        { label: 'Dig into context and behavior: "In what situations do you search, and how?"', correct: true },
        { label: 'Replace search with a category list (another solution)', correct: false },
        { label: 'Benchmark search behavior in competing apps (external reference)', correct: false },
      ],
      explanation:
        'Jumping straight to the literal words is the classic failure mode. "Search is hard" is a symptom; the real job might be "I can\'t reach the product I want" and the right fix could be recommendations or refined filters. Design Thinking digs into context and behavior, not the literal complaint, to surface the actual job.',
    },
    {
      type: 'explain',
      title: 'Prototype and Test — Build, break, repeat',
      content:
        'The essence of Design Thinking is "fast, cheap, many iterations."\n\nPrototype levels:\n\nLevel 1: Paper and pen (30 minutes)\n→ Hand-drawn screen sketches, storyboards\n\nLevel 2: Wireframes (half a day)\n→ Clickable mockups in Figma, etc.\n\nLevel 3: Working prototype (a few days)\n→ MVP with only the minimum features implemented\n\nWhat matters in testing:\n• Testing with 5 users typically surfaces about 75-85% of the problems (Nielsen & Landauer)\n• Don\'t ask "is this easy to use?" — say "please do X" and observe\n• Don\'t hunt for praise — hunt for the points where users get stuck\n\nDon\'t aim for perfection.\n[icon:bad] Bad approach: build the wrong thing perfectly\n[icon:good] Good approach: try the right thing roughly and fast\nThe latter is 100x more valuable.\n\n:::point\nEarly testing is a place to discover problems. Value concentrates not in polish or praise, but in collecting the moments where users get stuck.\n:::',
    },
    {
      type: 'quiz',
      question: 'What is the most important thing in a prototype user test?',
      options: [
        { label: 'Polish the prototype to feel close to the final product', correct: false },
        { label: 'Run the test with as many people as possible for statistical confidence', correct: false },
        { label: 'Find the moments where users get stuck, hesitate, or behave unexpectedly', correct: true },
        { label: 'Collect "this is easy to use" praise to validate the team\'s direction', correct: false },
      ],
      explanation:
        'The goal is problem discovery, not polish or praise. The Nielsen/Landauer rule of thumb says ~75-85% of usability problems surface with just 5 users — so early testing rarely needs large samples. The stumbles are the gold.',
    },
  ],
}

const designThinkingEmpathy: LessonData = {
  id: 57,
  title: 'Empathy Maps and Personas',
  category: 'Design Thinking',
  steps: [
    {
      type: 'explain',
      title: 'Empathy Map — Visualize what\'s in the user\'s head',
      content:
        'An Empathy Map is a tool for organizing the user\'s experience across four lenses:\n\n┌─────────────┐\n│  Think & Feel │ — What are they thinking and feeling?\n│  (worries, hopes, motivations) │\n├─────────────┤\n│  See         │ — What do they see?\n│  (environment, surrounding people) │\n├─────────────┤\n│  Hear        │ — What do they hear?\n│  (friends\' opinions, media) │\n├─────────────┤\n│  Say & Do    │ — What do they say and do?\n│  (actual behavior and statements) │\n└─────────────┘\n  Pain / Gain\n\nThe gap between Say & Do and Think & Feel is\nwhere the real insight lives.',
      visual: 'EmpathyMapDiagram',
      outro:
        'On an empathy map, the iron rule is to focus on the gap between what users "say" and what they "do." Judging by statements alone loses the real motive, so fill in all four quadrants and surface the contradictions between Say and Do — that is where hidden needs appear.',
    },
    {
      type: 'quiz',
      question: 'You are building an empathy map for a job-search site. The user says "I still want to give it my all at my current company" (Say) but checks the job site every night (Do). What insight does this gap suggest?',
      options: [
        { label: 'The user is just killing time on the site (downplays the behavior)', correct: false },
        { label: 'The Say reflects the truth and the user is not interested in switching (downplays the Do)', correct: false },
        { label: 'There is real switching intent, but psychological barriers prevent action (integrates the gap)', correct: true },
        { label: 'The site\'s UX is so engaging it is addictive (externalizes the cause)', correct: false },
      ],
      explanation:
        'The Say-Do gap is the most valuable signal in an empathy map. "Want to stay" + "checks nightly" = latent intent blocked by psychological barriers. Dismissing the behavior, ignoring it, or attributing it to UX all rely on only one side of the information rather than integrating the contradiction.',
    },
    {
      type: 'explain',
      title: 'Persona Design — "For everyone" means "for no one"',
      content:
        'A persona is a concrete, specific portrait of an ideal user.\n\n[icon:bad] Bad persona:\n"Men in their 20s-30s, interested in IT" → too vague\n\n[icon:good] Good persona:\nName: Taro Tanaka, 28\nJob: 3rd-year web engineer at an IT company\nChallenge: Unsure about his career direction; considering a switch to PM\nBehavior: Reads Qiita 30 min every morning; attends one meetup a month\nWorry: Is it OK to move into PM while my technical skills are still mid-level?\nIdeal: Increase my market value as a "PM who understands tech"\n\nPersona rules:\n• Base it on a real person (interviews, not imagination)\n• Keep it to 1-3 personas (don\'t try to cover everyone)\n• Make sure the whole team shares the same persona\n\n:::point\nA working persona needs "a specific name + behavior + motivation." More than demographics, the behavior and motivation drawn from observing real users are the core.\n:::',
    },
    {
      type: 'quiz',
      question: 'Which statement about persona design is correct?',
      options: [
        { label: 'Create as many personas as possible to cover every user segment', correct: false },
        { label: 'Base personas on real user interviews/observation and keep them to 1-3 people', correct: true },
        { label: 'Developers can imagine personas internally — that is good enough', correct: false },
        { label: 'Demographic info (age, gender) is the most important element of a persona', correct: false },
      ],
      explanation:
        'Personas live or die on grounding in real users, with a tight focus of 1-3 to keep "we are building for this person" honest. Many personas dilute focus ("for everyone = for no one"), imagined personas codify assumptions, and demographic emphasis misses behavior and motivation — the parts that actually drive design choices.',
    },
    {
      type: 'explain',
      title: 'Jobs to be Done — Users want to get a job done',
      content:
        'Professor Christensen\'s Jobs to be Done (JTBD) theory:\n\n"People don\'t buy products. They hire them to get a job done."\n\nThe famous milkshake example:\nWhy does McDonald\'s milkshake sell so well in the morning?\n\nThe job: "Make my long morning commute less boring."\n→ One-handed, lasts a long time, fills me up\n→ The competitors are not other drinks — they\'re bananas, bagels, and boredom\n\nJTBD framework:\n"In [situation], in order to [motivation], I want to get [job] done."\n\nExample: "On my morning commute, in order to use the spare time well, I want a 3-minute lesson I can take."\n\n→ That is exactly Logic\'s JTBD!',
      visual: 'JtbdDiagram',
      outro:
        'JTBD is a tool for re-framing your real competitors and value through a three-part set: situation, motivation, and the job to be done. Once you realize the true competitor is not a same-industry rival but "another way to get the same job done," your strategic options widen at once.',
    },
    {
      type: 'quiz',
      question: 'From a Jobs to be Done perspective, what is the most essential "job" of someone who joins a fitness gym?',
      options: [
        { label: 'Use the weight machines and complete a workout (the action itself)', correct: false },
        { label: 'Pay a monthly membership fee and access the facility (the transaction)', correct: false },
        { label: 'Become a healthy, confident version of myself (the underlying job)', correct: true },
        { label: 'Spend time with a friend at the same gym (a social side-effect)', correct: false },
      ],
      explanation:
        'The essential JTBD is the desired end-state, not the action or transaction. Identifying "become healthy and confident" as the job clarifies that online fitness apps and trainer apps are real competitors, even though their actions and transactions look very different. Stopping at the action level hides the actual competitive map.',
    },
  ],
}

const designThinkingPractice: LessonData = {
  id: 58,
  title: 'Design Thinking in Practice',
  category: 'Design Thinking',
  steps: [
    {
      type: 'explain',
      title: 'How Might We — Ask creative questions',
      content:
        'Once you have defined the problem, frame your question as a "How Might We" (HMW).\n\nWriting an HMW question:\n\nProblem: "Busy professionals can\'t keep up a learning habit."\n\nHMW examples:\n• "How might we make learning fit into a daily routine?"\n• "How might we design a learning experience that delivers a sense of accomplishment in 3 minutes?"\n• "How might we make learning feel like a game?"\n\nHMW tips:\n• Not too broad: "How might we improve the world?" → too wide\n• Not too narrow: "How might we pick a button color?" → too tight\n• Just right: a level that yields 3-5 directional solution ideas',
      visual: 'ThreePillarsDiagram',
      visualProps: {
        sectionLabel: 'Tuning the "breadth" of an HMW question — 3 levels',
        pillars: [
          {
            icon: 'W',
            title: 'Too broad',
            body: 'Questions like "How might we improve the world?" are too abstract. You can diverge but never converge or descend to implementation.',
          },
          {
            icon: '◎',
            title: 'Just right',
            body: 'A grain that yields 3-5 directional solutions. Broad enough to attack from many angles, like "fit it into a daily routine" or "make it feel like a game."',
          },
          {
            icon: 'N',
            title: 'Too narrow',
            body: 'Questions like "pick a button color" lock the answer to one. Effectively just a task, with no room to diverge.',
          },
        ],
        hint: 'Breadth determines how much a brainstorm diverges. After writing one, always check "can this produce 3-5 directions?"',
      },
      outro:
        'The power of an HMW question is in tuning its "breadth." Rewrite the question until it sits at a grain where solutions split into 3-5 directions, and your brainstorm diverges more — making it easier to surface ideas from interesting angles.',
    },
    {
      type: 'quiz',
      question: 'For the problem "older adults can\'t use online banking," which is the best HMW question?',
      options: [
        { label: 'How might we efficiently teach older adults to use smartphones? (too solution-specific)', correct: false },
        { label: 'How might we let digitally unfamiliar people handle financial transactions with confidence? (right breadth)', correct: true },
        { label: 'How might we maximize the UI font size? (too tactic-specific)', correct: false },
        { label: 'How might we bring older adults back to bank branches? (sidesteps the problem)', correct: false },
      ],
      explanation:
        'A good HMW question is broad enough to permit 3-5 distinct solution directions. Smartphone teaching and font sizing collapse to single tactics; "back to branches" retreats from the problem entirely. "Handle transactions with confidence" leaves room for voice UI, family pairing, simplified apps, and more — the right level of abstraction.',
    },
    {
      type: 'explain',
      title: 'Doing brainstorms right',
      content:
        'IDEO\'s 7 rules of brainstorming:\n\n1. Defer judgment\n→ Ban "that won\'t work." Accept every idea.\n\n2. Encourage wild ideas\n→ "What if we had unlimited budget?" "What if magic were real?"\n\n3. Build on others\' ideas\n→ "Yes, and…" "Building on that…"\n\n4. One conversation at a time\n→ Listening is part of creativity.\n\n5. Be visual\n→ Use sketches and gestures, not just words.\n\n6. Go for quantity\n→ Aim for 100 ideas in 30 minutes.\n\n7. Stay focused on the topic\n→ Keep the HMW statement on the whiteboard.',
    },
    {
      type: 'quiz',
      question: 'In a brainstorm, a colleague says "let\'s build a $1 billion theme park." What is the right response?',
      options: [
        { label: 'Reject it as unrealistic to save discussion time', correct: false },
        { label: '"Interesting! Can we capture the essence of that experience inside an app?" — build on it', correct: true },
        { label: 'Stay silent and move on to the next idea suggestion', correct: false },
        { label: 'Explain the actual budget constraints before continuing', correct: false },
      ],
      explanation:
        'Brainstorm rules from IDEO: defer judgment, build on others\' ideas. Pull the essence out of the wild idea and translate it into something realistic. Rejection, silence, and constraint explanations are all forms of judgment that belong to the converge phase, not the diverge phase. Separating diverge from converge is the skill.',
    },
    {
      type: 'explain',
      title: 'Design Thinking — recap',
      content:
        'The essence of Design Thinking:\n\n1. Human-centered\nStart from people\'s behavior and emotions, not technology or numbers.\n\n2. Diverge and converge, repeatedly\nEmpathize → Define (converge) → Ideate (diverge) → Prototype (converge) → Test (diverge)\n\n3. Iteration\nDon\'t try to hit the right answer on the first try — build, test, improve.\n\n4. Make it visual\nThink with prototypes and diagrams, not just words.\n\n5. The power of teams\nA diverse team produces better answers than a single genius.\n\nWhere Design Thinking shines:\n• New product or service planning\n• UX improvements to existing services\n• Internal business process improvement\n• Career decisions ("design thinking for yourself")\n\n:::point\nIt is not a methodology for nailing the right answer in one shot. The basic stance is to observe, build, test, and close in while you learn.\n:::',
    },
    {
      type: 'quiz',
      question: 'Which statement about Design Thinking is correct?',
      options: [
        { label: 'It is a specialized skill that only professional designers use', correct: false },
        { label: 'It rejects data analysis and runs purely on intuition and taste', correct: false },
        { label: 'Its core is the iterative loop of observing users and rapidly prototyping/testing', correct: true },
        { label: 'It is a rigorous methodology aimed at producing the perfect answer on the first attempt', correct: false },
      ],
      explanation:
        'The core is observe → prototype → test, repeated, available to anyone — not just designers. Data analysis is a complement, not the opposite; intuition-only is a strawman. "Perfect on first try" inverts the iterative learning premise. Each wrong option captures the discipline one-sidedly while missing the loop.',
    },
  ],
}

export const designThinkingLessonMapEn: Record<number, LessonData> = {
  56: designThinkingIntro,
  57: designThinkingEmpathy,
  58: designThinkingPractice,
}
