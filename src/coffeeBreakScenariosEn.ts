import type { LessonData } from './lessonData'
import type { CoffeeBreakScenario } from './coffeeBreakScenarios'

// English versions of the 5 Coffee Break mini-lessons.
// Same lesson IDs as the JA versions so completion tracking is shared.

const partnerLessonEn: LessonData = {
  id: 1001,
  title: 'Disagreeing with your partner',
  category: 'Coffee Break',
  steps: [
    {
      type: 'explain',
      title: '"Logical" doesn\'t mean "cold"',
      content:
        'You and your partner disagree about how to spend the weekend. You want to relax at a cafe; they want to go hiking.\n\nThe usual script:\n· "You always get your way!"\n· "I gave in last time too."\n· Awkward silence, miserable day.\n\nThis is exactly where logical thinking helps — not as a way to "win" the argument, but as a tool for surfacing the real point underneath.\n\nWhat is actually behind "I want to go hiking"?\n· They want exercise after a sedentary week?\n· They have been cooped up indoors and need a change?\n· There\'s a specific spot they\'ve wanted to see?\n\nUse Why So? once or twice and the real issue appears. Once you know the real issue, you can usually find an option that satisfies both of you.',
    },
    {
      type: 'quiz',
      question: 'Your partner says "I want to go hiking." What is the most logical (and most relationship-building) way to respond?',
      options: [
        { label: 'Immediately say "I\'d rather go to a cafe"', correct: false },
        { label: 'Demand "Why all of a sudden?"', correct: false },
        { label: 'Ask "Sounds good — what part are you most excited about?"', correct: true },
        { label: 'Quietly go along with their choice', correct: false },
      ],
      explanation:
        '"What part are you most excited about?" is Why So? wearing a friendly outfit. It surfaces the real motivation (exercise? change of scenery? a specific place?), which then opens up options that satisfy both of you (e.g. a park with a cafe nearby). Snapping back, interrogating, or silently giving in all skip the real question.',
    },
    {
      type: 'explain',
      title: 'Separate the demand from the actual need',
      content:
        'When emotions are high, people state demands ("do X" / "don\'t do Y"). But underneath every demand there is a need.\n\nExample:\nDemand: "Text me more often."\nNeed: "I feel forgotten and that makes me anxious."\n\nIf you only argue about the demand, you fight. If you go down to the need, you can solve it together. This is MECE and Why So applied to relationships — and it actually saves them.\n\n■ Three steps to listening logically AND warmly\n① Hear the demand\n② Use Why So? to find the underlying need\n③ Share your own need (not your demand)',
    },
    {
      type: 'quiz',
      question: 'Your partner says "Help out more around the house." What\'s the best Why So? to find the real need?',
      options: [
        { label: '"Which chores specifically?"', correct: false },
        { label: '"Has something been particularly hard for you lately?"', correct: true },
        { label: '"I\'m busy at work too, you know"', correct: false },
        { label: '"OK, I\'ll start tomorrow" (immediate agreement)', correct: false },
      ],
      explanation:
        '"Has something been particularly hard?" surfaces the emotion and context. The real issue might be sheer chore volume — or it might be feeling unseen and unappreciated. The fix is completely different. "Which chores?" stays at the surface. Defensiveness escalates. Empty promises don\'t last.',
    },
    {
      type: 'quiz',
      question: 'What is the right role of logical thinking in relationships?',
      options: [
        { label: 'Win the argument with airtight logic', correct: false },
        { label: 'Suppress emotions and stay calm at all costs', correct: false },
        { label: 'Surface the other person\'s real need and find a solution together', correct: true },
        { label: 'Avoid all friction', correct: false },
      ],
      explanation:
        'Logical thinking is a search tool, not a weapon. Use it to find the real need together. Winning, suppressing, and avoiding all damage the relationship. The takeaway: people who can think logically can be the best, kindest listeners.',
    },
  ],
}

const shoppingLessonEn: LessonData = {
  id: 1002,
  title: 'Don\'t fall for "30% OFF!"',
  category: 'Coffee Break',
  steps: [
    {
      type: 'explain',
      title: 'The trap behind the discount sticker',
      content:
        'Late at night, browsing online: "30% OFF! Only a few left!" Suddenly it\'s in your cart.\n\nTwo logical-thinking concepts work here: deduction and anti-anchoring.\n\n■ Anchoring effect\nOnce you see a "regular price," your sense of value shifts. Even with a 30% discount, the actual price might still be more than what the item is worth to YOU.\n\n■ Deductive approach\nDon\'t evaluate after seeing the discount. Set the rule (your major premise) BEFORE you look:\nMajor premise: "Anything over $50, I think about it for 24 hours"\nMinor premise: This item is $80\nConclusion: I park this for 24 hours before buying\n\nUrgency banners and "only 2 left" exist precisely to make you skip this rule. Setting the rule in advance defeats them.',
    },
    {
      type: 'quiz',
      question: 'You see a "$100 → $65 (35% OFF!)" banner. What is the most logical decision process?',
      options: [
        { label: 'Buy immediately — 35% off!', correct: false },
        { label: 'Decide what YOU would pay for it without looking at the discount', correct: true },
        { label: 'Read 100 reviews before deciding', correct: false },
        { label: 'Ask a friend on chat', correct: false },
      ],
      explanation:
        'Deciding your own valuation BEFORE seeing the discount is the strongest defense against anchoring. If you\'d pay $50 for it, $65 is still a bad deal. If you\'d pay $80, $65 is a steal. Reviews and friends slow you down (good), but the strongest move is having your own price first.',
    },
    {
      type: 'explain',
      title: 'Need / want / impulse',
      content:
        'You can MECE-decompose any purchase into three buckets:\n\n[Need] You will be functionally worse off without it (you\'re out of detergent)\n→ Buy without hesitation\n\n[Want] You can live without it but there\'s a clear reason you want it (a book you\'ve been eyeing)\n→ Compare to your own valuation\n\n[Impulse] You only want it strongly RIGHT NOW (something you saw in a sale)\n→ Wait 24 hours. Half the time you\'ll forget about it.\n\nMost discount-driven purchases fall in bucket 3. Just having the "24-hour rule" cuts impulse spending in half.\n\nThis is deduction + MECE applied to everyday choices. Logical thinking pays its rent in small daily decisions, not just business ones.',
    },
    {
      type: 'quiz',
      question: 'It\'s 11pm and a $80 jacket from a sale is in your cart. What\'s the smartest move?',
      options: [
        { label: 'Buy now to lock in the sale points', correct: false },
        { label: 'Close the tab and reconsider in the morning', correct: true },
        { label: 'Search for a cheaper alternative on another site', correct: false },
        { label: 'Buy before stock runs out', correct: false },
      ],
      explanation:
        '"Reconsider in the morning" is the strongest move. Research shows night-time decisions favor emotion; morning decisions favor reason. And 24 hours later, most "impulse" cravings dissolve. Stock-counter UI is theater. If you really need it, the morning version of you will still buy it.',
    },
  ],
}

const travelLessonEn: LessonData = {
  id: 1003,
  title: 'Don\'t fight on group trips',
  category: 'Coffee Break',
  steps: [
    {
      type: 'explain',
      title: '"Anywhere is fine" is what causes the fights',
      content:
        'Four friends planning a trip. "Where do we go?" "Anywhere is fine." "OK, Hawaii?" "Hmm, my budget…" "Iceland?" "Schedules don\'t line up…"\n\nThis loop happens because nobody has structured the constraints yet. MECE the discussion first.\n\n■ MECE the four constraints\n\n[Dates] How many nights? When?\n→ Lock in everyone\'s overlap first.\n\n[Budget] What is the per-person ceiling?\n→ The lowest ceiling is the group ceiling.\n\n[Travel] Flying ok? Who can drive?\n→ Confirm stamina and licenses.\n\n[Experience] What kind? (nature / food / hot springs / sightseeing)\n→ Each person picks 1 must-have plus 2 nice-to-haves.\n\nWork through these four in order and the candidate list collapses naturally.',
    },
    {
      type: 'quiz',
      question: 'Even with someone who keeps saying "anywhere is fine," what should you decide FIRST?',
      options: [
        { label: 'The destination', correct: false },
        { label: 'The dates and budget ceiling', correct: true },
        { label: 'Who the trip leader is', correct: false },
        { label: 'A packing list', correct: false },
      ],
      explanation:
        'Dates and budget are constraints. Once they\'re fixed, half the destination candidates are filtered automatically. If you pick the destination first, you\'ll just discover later that "schedules don\'t line up" or "it\'s over budget" and start over. The logical-thinking rule: lock constraints first.',
    },
    {
      type: 'explain',
      title: 'Separate "must" from "nice to have"',
      content:
        'The second cause of group-trip arguments: trying to satisfy everyone\'s wishlist completely.\n\nThe logical move:\nAsk each person for two kinds of preferences.\n\n[Must-have] Without this, the trip is meaningless to me (e.g. "must include a beach")\n→ Only candidates that satisfy EVERY must-have are valid.\n\n[Nice-to-have] Bonus if it\'s there (e.g. "would also love a hike")\n→ Used as tiebreakers when multiple candidates remain.\n\nThis simple split converts an impossible game ("satisfy everything") into a solvable one ("satisfy each person\'s minimum"). It\'s essentially the Pyramid Principle applied to group decisions, and it\'ll 10x your group\'s decision speed.',
    },
    {
      type: 'quiz',
      question: 'All four friends say "I want hot springs." Person A also insists on "must see the ocean." Most logical solution?',
      options: [
        { label: 'Pick a hot spring resort (majority rules)', correct: false },
        { label: 'Talk Person A out of the ocean idea', correct: false },
        { label: 'Find a coastal hot spring town that satisfies both', correct: true },
        { label: 'Take separate trips', correct: false },
      ],
      explanation:
        'Find the intersection of everyone\'s must-haves. Majority rule damages relationships, persuasion is slow, separate trips defeat the purpose. The beautiful thing about logical thinking is it can find win-win options. Coastal hot spring towns (Atami, Hakone-with-views, plenty of options) solve it.',
    },
    {
      type: 'quiz',
      question: 'Where does logical thinking shine most in trip planning?',
      options: [
        { label: 'Silencing strong personalities', correct: false },
        { label: 'Pulling real preferences out of people who say "anywhere is fine"', correct: true },
        { label: 'Deciding who knows the most about travel', correct: false },
        { label: 'Calculating costs', correct: false },
      ],
      explanation:
        '"Anywhere is fine" usually means "I don\'t want to do the work of articulating preferences." A gentle Why So? ("just tell me what would be a hard no" / "what\'s the one thing you can\'t skip?") surfaces the preferences they actually have. Logical thinking is a tool for extracting unsaid wishes.',
    },
  ],
}

const consultLessonEn: LessonData = {
  id: 1004,
  title: 'When a friend asks for advice',
  category: 'Coffee Break',
  steps: [
    {
      type: 'explain',
      title: 'Don\'t give advice immediately',
      content:
        'A friend says "I want to quit my job." What do you say?\n\nThe usual reactions:\n· "Great! How\'s the job hunt going?" (instant advice)\n· "Don\'t — just hold on a bit longer" (persuasion)\n· "Oh, I\'ve been feeling that too!" (turning it into your story)\n\nAll of these leave the friend feeling "they didn\'t really hear me." Why? Because the real issue might not be "should I quit?" at all.\n\n■ The Why So chain that finds the real issue\n"I want to quit"\n → why? "I can\'t stand my manager"\n → why does it bother you so much? "He shoots down everything I say"\n → what\'s the worst part of that? "Feeling like my opinions are worthless"\n\nThe real issue isn\'t the manager or the company — it\'s self-worth. Once you\'re there, options other than quitting (transfer, a real conversation with the manager, validation outside work) become visible.\n\nAnd more importantly: just being heard that deeply is itself a kind of relief.',
    },
    {
      type: 'quiz',
      question: 'A friend tells you "I want to quit my job." Best opening response?',
      options: [
        { label: '"Have you looked at job sites yet?"', correct: false },
        { label: '"Don\'t do it, hang in there"', correct: false },
        { label: '"I hear you... what\'s the hardest part right now?"', correct: true },
        { label: '"I\'ve been thinking the same thing about my job"', correct: false },
      ],
      explanation:
        '"What\'s the hardest part?" is Why So? at its softest. It asks them to narrow to a single point, which forces them to organize their own thoughts as they speak. Instant advice, persuasion, and self-projection all skip past the real issue and respond from your perspective.',
    },
    {
      type: 'explain',
      title: 'Listening structurally IS empathy',
      content:
        '"Listening logically" sounds cold. It\'s actually the opposite.\n\nListening logically = receiving the conversation in a structured way\n     ↓\nThe other person feels truly heard\n     ↓\nThey relax and share what\'s really going on\n     ↓\nThe real issue surfaces, and a path forward emerges\n\nThis is the truth that logical = empathetic.\n\n■ Three steps to listening structurally\n① Hear the surface claim ("I want to quit")\n② Drop down to the real issue ("what\'s the hardest part?")\n③ Reflect the issue back ("so the part that\'s killing you is feeling devalued?")\n\nStep ③ is decisive. Most people have an unspoken feeling — when you put it into words for them, they suddenly see what they couldn\'t see themselves. This is a skill, and it is a form of love.',
    },
    {
      type: 'quiz',
      question: 'Your friend says "I\'ve worked so hard and nobody recognizes it." Most empathetic response?',
      options: [
        { label: '"That\'s not true, people totally recognize you" (denial)', correct: false },
        { label: '"What would \'being recognized\' actually look like for you?" (clarifying the real issue)', correct: true },
        { label: '"Just talk to your manager directly" (instant advice)', correct: false },
        { label: '"Honestly, I get even less recognition than you" (one-upping)', correct: false },
      ],
      explanation:
        '"What would recognition look like for you?" asks them to define their own concept. Is it pay? Verbal feedback? Being trusted with bigger responsibility? They probably haven\'t put it into words themselves. Articulating it together is both the most logical AND the most caring act. Denial, advice, and one-upping all skip the real point.',
    },
  ],
}

const restaurantLessonEn: LessonData = {
  id: 1005,
  title: 'Picking a restaurant as a group',
  category: 'Coffee Break',
  steps: [
    {
      type: 'explain',
      title: 'Convert "anywhere is fine" into constraints',
      content:
        'Five people picking a restaurant. Everyone says "anywhere works for me." Thirty minutes later, no decision.\n\nThe core problem: too many candidates, no filters. MECE the constraints and the group can move.\n\n■ Three constraints to pull from each person\n\n[Budget] Per-person ceiling?\n→ Ask for a range ("under $30," "under $50")\n\n[Location] Which area? Max travel time?\n→ "Within 10 minutes of the station," "halfway between us"\n\n[Hard nos] Foods you can\'t or won\'t eat?\n→ Allergies, strong dislikes — must ask explicitly\n\nThose three filters alone take you from thousands of options to dozens. After that, cuisine and reviews handle the rest.\n\nKey trick: don\'t ask what people LIKE. Ask what they WON\'T eat. Even people who say "I\'m flexible" have a definite "absolutely not."',
    },
    {
      type: 'quiz',
      question: 'Five people, restaurant choice. Someone says "anywhere is fine." Most efficient next question?',
      options: [
        { label: '"Japanese or Western?"', correct: false },
        { label: '"Anything you absolutely can\'t / won\'t eat?"', correct: true },
        { label: '"Is $50 per person ok?"', correct: false },
        { label: '"OK, I\'ll just pick"', correct: false },
      ],
      explanation:
        'Asking for the negative is the strongest move. Preferences (positive) are vague; aversions (negative) are concrete and easy to answer. Hard nos collapse the option space immediately. "$50 ok?" is fine but more likely to get a hesitant answer. Just picking solo is bad for the group.',
    },
    {
      type: 'explain',
      title: 'Today\'s takeaway',
      content:
        'The five scenes today (partner, shopping, travel, friend\'s problem, restaurant) all share something.\n\n■ The common shape\n① Don\'t respond to the surface claim — drop to the real issue (Why So)\n② Lock constraints first to shrink the options (deductive)\n③ Separate must-have from nice-to-have (MECE)\n④ Ask questions that surface the other person\'s real need (relational)\n\n■ Logical thinking is not cold\nThe stereotype that "logical = cold" gets it backwards. In practice:\n\nSomeone who can think logically:\n· Listens with structure → makes the speaker feel heard\n· Manages their own emotions → reacts less reactively\n· Offers solutions calmly → builds trust\n· Finds win-win options → preserves relationships\n\nThe end result is that logical thinking improves both the quality of your decisions AND the quality of your relationships.\n\nIt\'s not just a work skill. It\'s a quiet daily-life skill — and you can start using it tonight.',
    },
    {
      type: 'quiz',
      question: 'What is the deepest reason logical thinking helps in personal relationships?',
      options: [
        { label: 'It helps you defeat the other person in arguments', correct: false },
        { label: 'It removes emotion so things stay calm', correct: false },
        { label: 'It surfaces the other person\'s real need so you can find a mutually respectful answer', correct: true },
        { label: 'It proves you\'re right', correct: false },
      ],
      explanation:
        'The richest use of logical thinking is as a lens for understanding people. Why So? to find the real issue, MECE to organize the options, constraints to filter the choices — every one of these is a tool for finding a good answer TOGETHER, not for winning. Try applying it tonight in any conversation, even small ones.',
    },
  ],
}

export const COFFEE_BREAK_SCENARIOS_EN: CoffeeBreakScenario[] = [
  {
    id: 'partner',
    emoji: '',
    selectorLabel: 'Disagreeing with your partner',
    description: 'Logic isn\'t for winning — it\'s a tool for connection',
    lesson: partnerLessonEn,
  },
  {
    id: 'shopping',
    emoji: '',
    selectorLabel: 'Falling for "30% OFF!"',
    description: 'Resist anchoring effects when you shop',
    lesson: shoppingLessonEn,
  },
  {
    id: 'travel',
    emoji: '',
    selectorLabel: 'Group trips that go nowhere',
    description: 'MECE undoes the "anywhere is fine" loop',
    lesson: travelLessonEn,
  },
  {
    id: 'consult',
    emoji: '',
    selectorLabel: 'When a friend asks for advice',
    description: 'The art of NOT giving immediate advice',
    lesson: consultLessonEn,
  },
  {
    id: 'restaurant',
    emoji: '',
    selectorLabel: '5 people, no restaurant decision',
    description: 'Use constraints to collapse the option space',
    lesson: restaurantLessonEn,
  },
]
