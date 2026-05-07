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
    },
    {
      type: 'quiz',
      question: 'What is the first step of Design Thinking?',
      options: [
        { label: 'Brainstorming solutions', correct: false },
        { label: 'Empathizing with and understanding the user', correct: true },
        { label: 'Market research and data analysis', correct: false },
        { label: 'Creating a prototype', correct: false },
      ],
      explanation:
        'Design Thinking starts with Empathize. You first deeply understand a user\'s behavior, emotions, and context, and only then identify the real problem. It values "how people feel," which data analysis alone cannot reveal.',
    },
    {
      type: 'explain',
      title: 'Empathize — Find the unspoken truth',
      content:
        'In the empathize step, observation is everything.\n\nWhat users say ≠ what users actually need\n\nFamous IDEO example:\nA hospital waiting-room redesign project.\nIn surveys, "long wait time" was the #1 complaint.\n\nBut when the team observed users…\n• Patients were less troubled by the wait itself than by "not knowing how long they\'d wait"\n• Family members were stressed by "not knowing what was happening to the patient"\n\nThe right solution wasn\'t "shorter waits" — it was "make information visible."\n\nMethods of empathy:\n1. Observe — Watch behavior\n2. Interview — Ask "why?" five times\n3. Immerse — Become the user yourself',
    },
    {
      type: 'quiz',
      question: 'In a user interview, someone says "this app\'s search is hard to use." What is the most appropriate Design Thinking response?',
      options: [
        { label: 'Improve the search UI', correct: false },
        { label: 'Dig into the context: "In what situations do you use search?"', correct: true },
        { label: 'Replace search with a category list', correct: false },
        { label: 'Benchmark search in competing apps', correct: false },
      ],
      explanation:
        'When a user says "search is hard," the real problem may not be the search UI at all. The real issue might be "I can\'t find the product I want," and the answer might be recommendations, not search. Digging into the context is the heart of empathize.',
    },
    {
      type: 'explain',
      title: 'Prototype and Test — Build, break, repeat',
      content:
        'The essence of Design Thinking is "fast, cheap, many iterations."\n\nPrototype levels:\n\nLevel 1: Paper and pen (30 minutes)\n→ Hand-drawn screen sketches, storyboards\n\nLevel 2: Wireframes (half a day)\n→ Clickable mockups in Figma, etc.\n\nLevel 3: Working prototype (a few days)\n→ MVP with only the minimum features implemented\n\nWhat matters in testing:\n• Testing with 5 users typically surfaces about 75-85% of the problems (Nielsen & Landauer)\n• Don\'t ask "is this easy to use?" — say "please do X" and observe\n• Don\'t hunt for praise — hunt for the points where users get stuck\n\nDon\'t aim for perfection.\n"Building the wrong thing perfectly" is 100x worse than\n"trying the right thing roughly."',
    },
    {
      type: 'quiz',
      question: 'What is the most important thing in a prototype user test?',
      options: [
        { label: 'Making the prototype as polished as possible', correct: false },
        { label: 'Testing with as many people as possible', correct: false },
        { label: 'Finding the points where users get stuck', correct: true },
        { label: 'Getting users to say "this is easy to use"', correct: false },
      ],
      explanation:
        'The point of a prototype is not to be praised — it\'s to discover problems. The places where users stumble, hesitate, or behave unexpectedly are where the most valuable insights live.',
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
    },
    {
      type: 'quiz',
      question: 'You are building an empathy map for a job-search site. The user says "I still want to give it my all at my current company" (Say) but checks the job site every night (Do). What insight does this gap suggest?',
      options: [
        { label: 'The user is just killing time on the site', correct: false },
        { label: 'The user has no interest in changing jobs', correct: false },
        { label: 'The user wants to switch jobs but is anxious about taking the leap and worried about how others will see it', correct: true },
        { label: 'The site\'s UX is so good they\'re addicted', correct: false },
      ],
      explanation:
        'The gap between Say and Do is the key insight. "I want to give it my all" while checking every night = there is latent intent to switch, but psychological barriers stand in the way. A service that meets users at that emotional spot creates real value.',
    },
    {
      type: 'explain',
      title: 'Persona Design — "For everyone" means "for no one"',
      content:
        'A persona is a concrete, specific portrait of an ideal user.\n\nBad persona:\n"Men in their 20s-30s, interested in IT" → too vague\n\nGood persona:\nName: Taro Tanaka, 28\nJob: 3rd-year web engineer at an IT company\nChallenge: Unsure about his career direction; considering a switch to PM\nBehavior: Reads Qiita 30 min every morning; attends one meetup a month\nWorry: Is it OK to move into PM while my technical skills are still mid-level?\nIdeal: Increase my market value as a "PM who understands tech"\n\nPersona rules:\n• Base it on a real person (interviews, not imagination)\n• Keep it to 1-3 personas (don\'t try to cover everyone)\n• Make sure the whole team shares the same persona',
    },
    {
      type: 'quiz',
      question: 'Which statement about persona design is correct?',
      options: [
        { label: 'Make as many personas as possible to cover every user segment', correct: false },
        { label: 'Personas should be built from real user interviews and limited to 1-3 people', correct: true },
        { label: 'Developers can imagine personas on their own — that\'s good enough', correct: false },
        { label: 'Demographic info (age, gender) is the most important part of a persona', correct: false },
      ],
      explanation:
        'Personas come from real user interviews and observations. Limiting the number of personas creates focus — "we are building for this person" — and prevents a sprawl of half-baked features.',
    },
    {
      type: 'explain',
      title: 'Jobs to be Done — Users want to get a job done',
      content:
        'Professor Christensen\'s Jobs to be Done (JTBD) theory:\n\n"People don\'t buy products. They hire them to get a job done."\n\nThe famous milkshake example:\nWhy does McDonald\'s milkshake sell so well in the morning?\n\nThe job: "Make my long morning commute less boring."\n→ One-handed, lasts a long time, fills me up\n→ The competitors are not other drinks — they\'re bananas, bagels, and boredom\n\nJTBD framework:\n"In [situation], in order to [motivation], I want to get [job] done."\n\nExample: "On my morning commute, in order to use the spare time well, I want a 3-minute lesson I can take."\n\n→ That is exactly Logic\'s JTBD!',
    },
    {
      type: 'quiz',
      question: 'From a Jobs to be Done perspective, what is the most essential "job" of someone who joins a fitness gym?',
      options: [
        { label: 'Using the weight machines', correct: false },
        { label: 'Paying a monthly fee to use the facility', correct: false },
        { label: 'Getting the job of "becoming a healthy, confident version of myself" done', correct: true },
        { label: 'Going to the same gym as a friend', correct: false },
      ],
      explanation:
        'A gym\'s "job" is not "use the machines" — it\'s "become a healthy, confident me." That is why online fitness apps and personal-trainer apps can become real competitors. Once you understand the job, you can see the real competition and the true points of differentiation.',
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
    },
    {
      type: 'quiz',
      question: 'For the problem "older adults can\'t use online banking," which is the best HMW question?',
      options: [
        { label: 'How might we teach older adults to use smartphones?', correct: false },
        { label: 'How might we let people who are unfamiliar with digital tools handle financial transactions with confidence?', correct: true },
        { label: 'How might we increase the UI font size?', correct: false },
        { label: 'How might we get older adults to come into bank branches?', correct: false },
      ],
      explanation:
        '"Teach smartphones" and "increase font size" are too close to specific solutions. "Come into branches" sidesteps the problem. "Let digitally unfamiliar people handle transactions with confidence" is wide enough to spark a range of solutions (voice UI, family connections, simplified app, etc.).',
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
        { label: 'Reject it as unrealistic', correct: false },
        { label: '"Interesting! Can we capture the essence of that experience inside an app?" — and build on it', correct: true },
        { label: 'Ignore it and move to the next idea', correct: false },
        { label: 'Explain the budget constraints', correct: false },
      ],
      explanation:
        'In brainstorming, the rules are "defer judgment" and "build on others\' ideas." A wild-sounding idea often contains an essence that, when extracted, leads to a realistic and innovative solution.',
    },
    {
      type: 'explain',
      title: 'Design Thinking — recap',
      content:
        'The essence of Design Thinking:\n\n1. Human-centered\nStart from people\'s behavior and emotions, not technology or numbers.\n\n2. Diverge and converge, repeatedly\nEmpathize → Define (converge) → Ideate (diverge) → Prototype (converge) → Test (diverge)\n\n3. Iteration\nDon\'t try to hit the right answer on the first try — build, test, improve.\n\n4. Make it visual\nThink with prototypes and diagrams, not just words.\n\n5. The power of teams\nA diverse team produces better answers than a single genius.\n\nWhere Design Thinking shines:\n• New product or service planning\n• UX improvements to existing services\n• Internal business process improvement\n• Career decisions ("design thinking for yourself")',
    },
    {
      type: 'quiz',
      question: 'Which statement about Design Thinking is correct?',
      options: [
        { label: 'It is a skill only designers use', correct: false },
        { label: 'It rejects data analysis and relies on intuition', correct: false },
        { label: 'Its core is the iteration of observing user behavior and rapid prototyping/testing', correct: true },
        { label: 'It aims to deliver the perfect answer on the first try', correct: false },
      ],
      explanation:
        'The core of Design Thinking is the loop of "observing user behavior (empathize), building prototypes fast (prototype), testing with users and improving (test)." You don\'t aim for perfect on day one — you converge through learning.',
    },
  ],
}

export const designThinkingLessonMapEn: Record<number, LessonData> = {
  56: designThinkingIntro,
  57: designThinkingEmpathy,
  58: designThinkingPractice,
}
