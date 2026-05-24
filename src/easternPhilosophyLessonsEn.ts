import type { LessonData } from './lessonData'

export const easternPhilosophyLessonMapEn: Record<number, LessonData> = {
  350: {
    id: 350,
    title: 'Confucius\' "ren" and "li" — relationships move organizations',
    category: 'Eastern thought',
    steps: [
      {
        type: 'explain',
        title: 'Ren is "concern for others"',
        content:
          'Confucius (551–479 BCE) taught the central concept of "ren (benevolence)."\n\nRen is "the heart that treats people as people" — sincerity and concern for others. Confucius placed it not as a mere emotion but as the root of all virtues.\n\nIn the Analects he answers his disciples differently each time:\n- "To love others"\n- "Do not impose on others what you yourself do not desire"\n- "Subdue the self and return to li (rites) — that is ren"\n\nIn other words, ren is not a fixed definition but an attitude that emerges within relationships.',
      },
      {
        type: 'explain',
        title: 'Li is "the form that gives ren expression"',
        content:
          '"Li (rites)" is the concrete form ren takes in conduct, ritual, and social order. It includes greetings, hierarchy, ceremonies — every form that arranges relationships.\n\nConfucius held: "Without ren there is no li; without li, ren cannot be conveyed."\n- Ren alone → mere goodwill, with no form to reach the other.\n- Li alone → empty ritual, with no substance to win trust.\n\nIn business terms:\n- "Respect for the other person (ren)" + "the wording of an email, the seating in a meeting, the conventions of reporting and consulting (li)"\nOnly when both are present does the trust within an organization actually function.',
      },
      {
        type: 'explain',
        title: 'Why it still works in modern organizations',
        content:
          'Psychologically, "ren and li" are close to the combination of psychological safety and procedural fairness.\n\n- Ren = the feeling that "this person sees me as a human being."\n- Li = the feeling that "this organization has predictable rules and respect."\n\nEmpirical research shows that teams high in psychological safety and procedural fairness perform more consistently. A 2,500-year-old concept resonates with modern management science.',
      },
      {
        type: 'quiz',
        question: 'Which most accurately describes the relationship between Confucius\' "ren" and "li"?',
        options: [
          { label: 'Ren is the inner heart, li is the form that expresses it; both must be present to function', correct: true },
          { label: 'Ren is an old concept; in modern times, observing li alone is enough', correct: false },
          { label: 'If you observe li, ren naturally follows, so start from form', correct: false },
          { label: 'Ren is personal feeling and li is law — they refer to entirely separate things', correct: false },
        ],
        explanation:
          'Ren is inner concern; li is the form that expresses it as conduct or ritual. As taught: "Without ren there is no li; without li ren cannot be conveyed." They are two wheels of one cart. Form alone, or feeling alone, cannot make an organization work.',
      },
      {
        type: 'quiz',
        question: 'Which workplace example most clearly lacks the Confucian "ren and li"?',
        options: [
          { label: 'A call center that follows the manual but never considers the caller\'s situation', correct: true },
          { label: 'A manager who is mindful of a subordinate\'s family situation and offers thoughtful words', correct: false },
          { label: 'Politely asking colleagues to review a proposal before sending it to a customer', correct: false },
          { label: 'Holding a welcome event for a new transferee and creating space for relationship-building', correct: false },
        ],
        explanation:
          'A textbook case: only the formal "li" (the manual) exists, and the "ren" of seeing the other as a person is missing. Confucius criticized "li without ren" as empty. Both form and heart must be present for a relationship to function.',
      },
    ],
  },

  351: {
    id: 351,
    title: 'Confucius\' "rectification of names" — definitions create order',
    category: 'Eastern thought',
    steps: [
      {
        type: 'explain',
        title: 'What does "rectifying names" mean?',
        content:
          'The disciple Zilu asked Confucius: "If the ruler of Wei entrusted government to you, what would you do first?"\n\nConfucius\' answer was: "Surely I would rectify names" (必也正名乎).\n\nIn other words: start by setting the definitions of words straight.\n\nConfucius continued:\n"If names are not correct, then language is not in accord.\nIf language is not in accord, then affairs cannot be accomplished.\nIf affairs cannot be accomplished, then rites and music cannot flourish…"\n\n— If the names (definitions) are wrong, words don\'t connect, work doesn\'t get done, and culture cannot grow.',
      },
      {
        type: 'explain',
        title: 'When "rectification of names" breaks down at work',
        content:
          'Workplaces where "rectification of names" has collapsed share common signs:\n\n- Someone called "manager" who has no authority over performance reviews\n- Someone labeled "leadership candidate" who has been left in that state for three years\n- A project labeled "DX (digital transformation)" that is only tidying up Excel files\n- An organization that proclaims "customer first" but whose internal KPIs are only sales quotas\n\nConfucius would say of such a state: "affairs cannot be accomplished" — decisions and evaluations rot.\n\nWhen a strategy consultant\'s first move is "let\'s align on the definitions of these words," that is the same idea as Confucius\' rectification of names.',
      },
      {
        type: 'quiz',
        question: 'Which is the closest application of Confucius\' "rectification of names" to project management?',
        options: [
          { label: 'A project name can be anything as long as it sounds cool', correct: false },
          { label: 'At the kickoff, document the authority and responsibility scope for each role name (PM, PO, Lead)', correct: true },
          { label: 'Keeping titles ambiguous is desirable because it allows flexibility', correct: false },
          { label: 'Results are everything, so spending time on definitions is a waste', correct: false },
        ],
        explanation:
          '"Rectification of names" means clearly aligning what titles and terms refer to (authority, responsibility, expectations). When role definitions are vague, "language is not in accord and affairs cannot be accomplished" — leading to blame-shifting and delayed decisions. Aligning definitions up front has been a rule for 2,500 years.',
      },
      {
        type: 'quiz',
        question: 'Which is the most typical case of "the name and the reality not matching"?',
        options: [
          { label: 'A company that touts "meritocracy," but where promotions are decided by seniority', correct: true },
          { label: 'Renaming the sales department to "Sales" in English', correct: false },
          { label: 'Calling a meeting room a meeting room', correct: false },
          { label: 'A product name written in katakana that is hard to remember', correct: false },
        ],
        explanation:
          'The name (the proclaimed principle of "meritocracy") does not match the reality (decisions made by seniority). That is the breakdown of rectification of names. Employees no longer know what to believe; behavior and evaluation drift apart. Confucius said this is what must be corrected first.',
      },
    ],
  },

  352: {
    id: 352,
    title: 'Mencius\' theory that human nature is good — the assumption that grows a team',
    category: 'Eastern thought',
    steps: [
      {
        type: 'explain',
        title: 'Human nature is fundamentally "good"',
        content:
          'Mencius (c. 372–289 BCE) inherited Confucius\' teaching and argued that "human nature is good." This is the doctrine of innate goodness.\n\nHis evidence is the famous "four sprouts":\n- The sprout of compassion (惻隠の心) — pain at others\' suffering → seed of ren (benevolence)\n- The sprout of shame (羞悪の心) — shame at injustice → seed of yi (righteousness)\n- The sprout of yielding (辞譲の心) — willingness to defer → seed of li (rites)\n- The sprout of judgment (是非の心) — discerning right from wrong → seed of zhi (wisdom)\n\nMencius argued: "If you see a child about to fall into a well, anyone reflexively tries to save them. Not from calculation. That is proof of human nature."',
      },
      {
        type: 'explain',
        title: 'Why this matters as a managerial premise',
        content:
          'The doctrine of innate goodness is not mere optimism. The way you view people is reflected directly in how you design an organization.\n\n- Manager assuming goodness → delegate authority, trust self-direction, prioritize psychological safety\n- Manager assuming inherent self-interest → surveillance, approval processes, KPI-based control\n\nDouglas McGregor\'s "Theory Y" (people enjoy work by nature) is the modern version of Mencius\' view. The "Freedom & Responsibility" of Google or Netflix is in the same lineage.\n\nNote: assuming goodness does not mean "leave everything alone." It means "people have sprouts that can grow," and we must build environments that water and shine on those sprouts. Sprouts do not grow without water and light.',
      },
      {
        type: 'quiz',
        question: 'Which most accurately describes Mencius\' "four sprouts"?',
        options: [
          { label: 'Four skills people should learn after birth', correct: false },
          { label: 'Four innate sprouts of the heart that can grow into virtues', correct: true },
          { label: 'Four rules for keeping social order', correct: false },
          { label: 'Four norms a ruler should impose on the people', correct: false },
        ],
        explanation:
          'The "sprouts (端)" are innate possibilities. With cultivation they grow into the virtues of ren, yi, li, and zhi. Mencius even said that "to lack these sprouts is like lacking limbs."',
      },
      {
        type: 'quiz',
        question: 'Which management policy aligns most closely with the doctrine of innate goodness?',
        options: [
          { label: 'Use surveillance cameras and severe punishment to prevent misconduct', correct: false },
          { label: 'Hand over autonomy and intentionally design opportunities to learn from failure', correct: true },
          { label: 'Trust everyone and check nothing', correct: false },
          { label: 'Keep only the excellent and weed out the rest', correct: false },
        ],
        explanation:
          'Innate goodness is not "let it run free" but "trust the sprouts of growth and design an environment that grows them." Granting autonomy and learning opportunities is a typical example. "Do nothing" is a misreading; "surveillance and severe punishment" is the opposing assumption.',
      },
    ],
  },

  353: {
    id: 353,
    title: 'Xunzi\'s view that human nature is bad — design thinking via institutions',
    category: 'Eastern thought',
    steps: [
      {
        type: 'explain',
        title: '"Human nature is bad; what is good is artifice"',
        content:
          'Xunzi (c. 313–238 BCE) was, like Mencius, a Confucian — yet took the opposite position.\n\n"人之性悪，其善者偽也" — Human nature is bad; what is good is artifice (人為, deliberate human construction).\n\nHere "bad" does not mean morally evil. It means "left alone, people tend toward private interest." That is precisely why Xunzi proposed:\n\n- Use education (学) to discipline our nature\n- Use rites (礼, social norms) to regulate behavior\n- Use law and institutions to maintain overall order\n\nGoodness is not a gift from heaven; it is a product manufactured by society and education.',
      },
      {
        type: 'explain',
        title: 'Xunzi\'s view as "the design mindset for institutions"',
        content:
          'The modern significance of Xunzi\'s view lies in "building systems that do not depend on individual goodwill."\n\nExamples:\n- Expense reporting → "please don\'t cheat" breaks down on goodwill alone → receipt rules, approval flow, audits.\n- Personal data protection → "be careful" alone leaks data → access permissions, logs, encryption.\n- Governance → "trust the executives" fails → boards of directors, auditors, internal whistleblowing.\n\nThis is Xunzi\'s approach.\n\nWhat is striking is that almost every modern organization runs as a "hybrid of innate-goodness and innate-self-interest." Emphasize psychological safety (innate goodness), and at the same time design systems where misconduct cannot occur (innate self-interest).',
      },
      {
        type: 'explain',
        title: 'Innate goodness vs. innate self-interest — which to adopt',
        content:
          'In management, the question is not "which is correct" but "which to adopt in which situation."\n\n- Areas demanding creativity and self-direction → innate goodness (trust-based, broad autonomy)\n- Areas with large or irreversible risk → innate self-interest (system-based, verification-heavy)\n\nExample: an engineer\'s coding can run on innate goodness, but production deployment runs on innate self-interest with an approval flow. This is the modern division.\n\nFor 2,300 years, Mencius and Xunzi have left us the foundational question: "what assumption do you make about human nature?"',
      },
      {
        type: 'quiz',
        question: 'Which best captures the essence of Xunzi\'s doctrine that human nature is bad?',
        options: [
          { label: 'Humans are evil, and you must never trust them', correct: false },
          { label: 'Left alone, people drift toward private interest, so education and institutions must guide them toward good', correct: true },
          { label: 'If you bind people with laws, their nature too becomes good', correct: false },
          { label: 'The good and the bad are determined at birth', correct: false },
        ],
        explanation:
          'Xunzi\'s "bad" does not mean morally wicked but "the tendency to lean toward self-interest if left untended." That is precisely why "education, rites, and institutions construct the good." It is a constructive doctrine, complementary to the innate-goodness view.',
      },
      {
        type: 'quiz',
        question: 'In organizational design, where is "Xunzi\'s approach" most needed?',
        options: [
          { label: 'When brainstorming ideas', correct: false },
          { label: 'In domains with irreversible and high-risk consequences such as finance, accounting, and personal data', correct: true },
          { label: 'When choosing topics for an internal study session', correct: false },
          { label: 'When picking the restaurant for a team lunch', correct: false },
        ],
        explanation:
          '"Failure is irreversible / risk is large" domains should not depend on individual goodwill — they should be protected by systems. Finance, personal data, production deployment are typical. Conversely, creative work benefits from the innate-goodness approach (autonomy and trust). Switching by context is the modern resolution.',
      },
    ],
  },

  354: {
    id: 354,
    title: 'Mozi\'s universal love and non-aggression — thinking from the whole stakeholder set',
    category: 'Eastern thought',
    steps: [
      {
        type: 'explain',
        title: 'The idea of "loving inclusively"',
        content:
          'Mozi (c. 470–391 BCE) was a contemporary of Confucius but moved in a different direction from the Confucian tradition.\n\nThe key concept is "universal love (jian\'ai, 兼愛)."\n\nConfucian love is graded: parents → siblings → others (parental love > friendship > strangers).\nMozi rejected this and taught: "Love all people equally."\n\nWhy? Mozi\'s logic is simple:\n"Conflict arises precisely because people love only their own family and country, and not others\' families or countries."\n\nIn other words, universal love was not a sentimental ideal but a pragmatic philosophy aimed at reducing war and social loss.',
      },
      {
        type: 'explain',
        title: '"Non-aggression" and utilitarian thinking',
        content:
          'The other pillar of Mozi\'s thought is "non-aggression (非攻)" — the rejection of wars of invasion.\n\nMozi advanced a strikingly modern argument:\n\n"If you steal a single peach from another, you are punished as wicked.\nIf you kill one person, you are sentenced to death.\nThen why is killing thousands and seizing a country praised as a \'great achievement\' in war?\nThe larger the scale, the greater the wickedness should be."\n\nThis is a precursor to utilitarianism. The idea that "the goodness or badness of an act should be measured by total consequences" resonates with Bentham and Mill 2,300 years later.\n\nMozi did not stop at theory: he led the Mohists, an engineering corps that defended small states from invasion. A rare example of thought and action united.',
      },
      {
        type: 'explain',
        title: 'Connection to modern stakeholder thinking',
        content:
          'Universal love connects to modern "stakeholder thinking" and "ESG management."\n\n- Caring only about your own company\'s profit → short-term wins but long-term backlash from society.\n- Considering the interests of customers, partners, employees, and society as a whole "inclusively" → builds durable trust.\n\nExamples: thinking about labor conditions across the supply chain, accounting for environmental impact, cooperating with competitors on standards — these are modern echoes of "universal love."\n\nMohism is less mainstream than Confucianism or Daoism, but in the modern era it has been re-evaluated as a "rational, egalitarian, pragmatic" school of thought.',
      },
      {
        type: 'quiz',
        question: 'What is the biggest difference between Mozi\'s "universal love" and the Confucian "graded love (ren)"?',
        options: [
          { label: 'Universal love does not love one\'s parents', correct: false },
          { label: 'Universal love is loving everyone equally; Confucian love loves those closer to you more strongly', correct: true },
          { label: 'Universal love only loves the state', correct: false },
          { label: 'Universal love is emotional; Confucian love is rational', correct: false },
        ],
        explanation:
          'Confucian benevolence (ren) is "graded love that radiates from the close to the distant." Mohist universal love is "equal love that treats family and strangers alike." Mozi argued that "discrimination breeds conflict," and called for equal love.',
      },
      {
        type: 'quiz',
        question: 'Which modern argument is closest to the logic of Mozi\'s "non-aggression"?',
        options: [
          { label: 'The goodness or badness of an act should be evaluated in proportion to scale; large harms should be treated as large evils (a utilitarian view)', correct: true },
          { label: 'War is a cultural tradition and should not be denied', correct: false },
          { label: 'Small theft should be punished, but war is a different matter', correct: false },
          { label: 'Personal feelings should take priority and outcomes do not matter', correct: false },
        ],
        explanation:
          'Mozi argued: "It is contradictory that stealing one peach is punished while killing thousands in war makes you a hero." This is the utilitarian move of evaluating acts by their total consequences — predating modern ethics.',
      },
    ],
  },

  355: {
    id: 355,
    title: 'Laozi\'s "wu wei (non-action) and naturalness" — management without intervention',
    category: 'Eastern thought',
    steps: [
      {
        type: 'explain',
        title: '"Wu wei" does not mean "doing nothing"',
        content:
          'The core of Laozi\'s thought (dates uncertain, perhaps 6th century BCE) is "wu wei zi ran (無為自然)" — non-action and naturalness.\n\nIt is often misunderstood, but "wu wei (non-action)" does not mean idleness or neglect.\n\nMore precisely:\n- Wu wei = "do not intervene with deliberate force"; "do not obstruct the natural flow."\n- Zi ran = "of itself so" — things move as they ought to in their own being.\n\nIn the Daodejing, Laozi says:\n"By doing nothing, nothing is left undone (無為而無不為)."\n— By not deliberately doing something, everything ends up being done.\n\nA river does not need to be pushed to flow. Remove what blocks it, and it flows of itself. That is Laozi\'s view.',
      },
      {
        type: 'explain',
        title: 'Application to management',
        content:
          'It is widely observed that the better the manager, the fewer the instructions.\n\nIn Laozi\'s words:\n"The best ruler is one whose existence is barely noticed by those below (太上は下これあるを知るのみ)."\n\nExamples of bad intervention:\n- Saying the answer while a subordinate is still thinking it through\n- Micromanaging a project you said you delegated\n- Distorting a discussion that would have settled itself with one comment from above\n\nWu wei management means:\n- Set the environment (premises, goals, resources)\n- Remove obstacles (unnecessary approvals, baggage)\n- Then trust and delegate\n\nThis aligns well with the management style based on innate goodness.',
      },
      {
        type: 'explain',
        title: 'The difficulty of "not doing"',
        content:
          'Wu wei is in fact harder than acting.\n\nHumans are creatures who, when anxious, want to do something.\n\n- The numbers look bad → you want to launch something, anything.\n- A subordinate is troubled → you want to give advice.\n- The meeting is silent → you want to fill it with a comment.\n\nHere Laozi rings the alarm. Intervention for the sake of intervention is noise that disrupts the flow.\n\nPracticing wu wei requires the strength to coexist with anxiety — the strength to discipline yourself. That is why Laozi has been read as a theory of leadership for 2,500 years.',
      },
      {
        type: 'quiz',
        question: 'Which most accurately captures Laozi\'s "wu wei"?',
        options: [
          { label: 'Doing nothing and being lazy', correct: false },
          { label: 'Not intervening deliberately and not obstructing the natural flow', correct: true },
          { label: 'Suppressing emotion and acting cold', correct: false },
          { label: 'Leaving every decision entirely to others', correct: false },
        ],
        explanation:
          'Wu wei is not "doing nothing" but "not intervening unnecessarily." By removing obstacles and following the natural flow, results follow. In management, it is close to "set the environment, trust, and delegate."',
      },
      {
        type: 'quiz',
        question: 'Which is the most appropriate Laozian management practice?',
        options: [
          { label: 'Give subordinates fine-grained instructions and check progress three times a day', correct: false },
          { label: 'Remove unnecessary approval processes and leave decisions to the front line', correct: true },
          { label: 'Communicate nothing and judge purely by results', correct: false },
          { label: 'Always speak first in meetings to set the direction', correct: false },
        ],
        explanation:
          'Wu wei management is "removing obstacles and letting the natural flow do its work." Reducing approvals and delegating to the front line is a typical example. Total neglect is a misreading; fine-grained instructions and constant intervention go in the opposite direction.',
      },
    ],
  },

  356: {
    id: 356,
    title: 'Laozi\'s "the highest good is like water" — winning through suppleness',
    category: 'Eastern thought',
    steps: [
      {
        type: 'explain',
        title: '"The highest good is like water"',
        content:
          'A famous line from Laozi: "上善若水" — "The highest good is like water."\n\nThe highest good resembles water.\n\nQualities of water:\n- It nourishes all things and never claims credit for itself\n- It avoids the high and flows to the low (humility)\n- It has no shape and takes the form of any vessel (flexibility)\n- It is soft, yet wears down rock and rusts iron (resilient strength)\n\n"Nothing in the world is softer than water, yet for attacking the strong and hard, nothing surpasses it."\n— Nothing under heaven is softer than water; yet at breaking the hard and strong, nothing exceeds it.',
      },
      {
        type: 'explain',
        title: 'Suppleness becomes "strength"',
        content:
          'The proverb "the soft overcomes the hard (柔よく剛を制す)" — though originating in the military classic Sanlüe — is in the same lineage as Laozi.\n\nA hard tree breaks in the wind; the willow bends and does not break. Teeth are hard and chip; the tongue is soft and remains.\n\nIn business:\n- An organization rigidly bound by rules → snaps when the environment changes.\n- An organization that flexibly redefines itself → adapts and survives.\n\nBruce Lee\'s "Be water, my friend" belongs to the same family.\n\nSuppleness is not weakness. Laozi taught that "preserving essence while changing form" is the most refined form of strength.',
      },
      {
        type: 'explain',
        title: 'A strategy that avoids head-on collision',
        content:
          'Water rounds rocks rather than colliding with them. The same applies to strategic thinking.\n\n- Charging head-on at competitors on the same ground → war of attrition.\n- Flowing toward where the competitor is weak or absent → blue ocean.\n\nThis is the same family as Sunzi\'s later "win without fighting." Across Chinese thought, the aesthetic is shared: not "push through and win head-on" but "change form and win."\n\nThere is no single right answer. The flexibility to change form according to the situation is, over the long run, the strongest stance.',
      },
      {
        type: 'quiz',
        question: 'What kind of "strength" does "the highest good is like water" point to?',
        options: [
          { label: 'A hard, unmovable strength', correct: false },
          { label: 'A supple strength that wins long-term by preserving essence while changing form', correct: true },
          { label: 'Unbeatable offensive power', correct: false },
          { label: 'A strength that suppresses emotion and stays calm', correct: false },
        ],
        explanation:
          'Strength like water is "soft, but eventually wears down rock." Because it can change form, it lasts longer than the hard. The teaching overturns the assumption that "strong = hard."',
      },
      {
        type: 'quiz',
        question: 'Which is the most appropriate strategic action in the spirit of "the highest good is like water"?',
        options: [
          { label: 'Take the industry leader head-on on the same battleground', correct: false },
          { label: 'Quietly flow into untapped segments where competitors find it hard to operate', correct: true },
          { label: 'Stick to a strategy once chosen, regardless of environmental change', correct: false },
          { label: 'Always follow the majority view', correct: false },
        ],
        explanation:
          'Water bypasses rocks. Rather than waste yourself in arenas where competitors are strong, "flow into" untapped segments. This connects with Blue Ocean and niche strategies.',
      },
    ],
  },

  357: {
    id: 357,
    title: 'Zhuangzi\'s "butterfly dream" — questioning the relativity of viewpoints',
    category: 'Eastern thought',
    steps: [
      {
        type: 'explain',
        title: '"Am I a butterfly, or is the butterfly me?"',
        content:
          'Zhuangzi\'s (c. 369–286 BCE) most famous parable, the "butterfly dream":\n\n"Once Zhuang Zhou dreamed he was a butterfly. He fluttered and was a butterfly through and through; he had forgotten he was Zhuang Zhou.\nWhen he awoke, he was Zhuang Zhou again. But he could not tell —\nhad Zhuang Zhou dreamed he was a butterfly, or was a butterfly now dreaming it was Zhuang Zhou?"\n\nThis is more than a poetic image. It is the radical question: are the boundaries between "self" and "other," "reality" and "dream," really absolute?\n\nZhuangzi called this "transformation of things (物化)" — beings have no fixed boundary; they are constantly shifting.',
      },
      {
        type: 'explain',
        title: 'The relativity of viewpoints — "the equality of all things"',
        content:
          'Zhuangzi\'s central idea is "the equality of all things (万物斉同)."\n\nAll oppositions — beauty/ugliness, good/evil, big/small, right/wrong — are relative; they depend on the viewpoint that judges them.\n\nExamples:\n- Big/small → from a whale\'s view a person is small, from an ant\'s view a person is huge.\n- Useful/useless → the straight tree is felled; the crooked tree survives ("the use of the useless").\n- Right/wrong → change the standpoint and "justice" changes.\n\nZhuangzi says: "Right from there is right; right from here is also right."\n\nThis is not nihilism. It is an epistemic exercise: "doubt the absoluteness of your own viewpoint."',
      },
      {
        type: 'explain',
        title: '"Relativity of viewpoint" in business',
        content:
          'Zhuangzian viewpoint-shifting is highly practical in business too:\n\n- Company view vs. customer view: features that seem obvious to you may be unwanted by the customer.\n- Short-term vs. long-term: a quarter\'s "failure" can be a 3-year setup.\n- Leadership vs. front line: the same initiative looks "rational" or "pointless" depending on where you stand.\n- Competitor view: the true nature of a threat to you is hard to see from inside.\n\nReframing, role-play, customer journey analysis — these are modern updates of a 2,300-year-old Zhuangzian discipline.\n\nA practitioner who keeps the "butterfly dream" in mind never forgets that the world they see is just one point of view.',
      },
      {
        type: 'quiz',
        question: 'What is the essence of the question Zhuangzi\'s "butterfly dream" poses?',
        options: [
          { label: 'Dream and reality are the same thing', correct: false },
          { label: 'Doubt the absoluteness of your own viewpoint and recognition; see things relatively', correct: true },
          { label: 'Believe in messages from your dreams', correct: false },
          { label: 'Always be on guard so as not to lose your sense of self', correct: false },
        ],
        explanation:
          'The butterfly dream is a thought experiment that makes us notice "the boundary between self and other, and between reality and dream, is not absolute." Together with the "equality of all things," its proper reading is as a discipline for "doubting the absoluteness of your own viewpoint."',
      },
      {
        type: 'quiz',
        question: 'Which business technique most uses Zhuangzi\'s "relativity of viewpoint"?',
        options: [
          { label: 'Polishing your own strengths thoroughly — the S in SWOT', correct: false },
          { label: 'Customer-journey mapping that rebuilds the picture from the customer\'s viewpoint', correct: true },
          { label: 'Checking KPIs daily', correct: false },
          { label: 'Standardizing internal rules', correct: false },
        ],
        explanation:
          'A customer journey is "let go of your company\'s viewpoint and re-see things from the customer\'s side." That is exactly the Zhuangzian shift of viewpoint. Reframing and role-play belong to the same lineage.',
      },
    ],
  },

  358: {
    id: 358,
    title: 'Han Feizi\'s "law, technique, and position" — moving people through systems',
    category: 'Eastern thought',
    steps: [
      {
        type: 'explain',
        title: 'The realism of Legalism',
        content:
          'Han Feizi (c. 280–233 BCE) was a pupil of Xunzi but parted from Confucianism to perfect "Legalism (法家)."\n\nLegalism\'s premise is rigorously cold-eyed:\n- People are basically moved by self-interest.\n- A ruler who relies on personal virtue cannot maintain an organization.\n- What is needed is "clear law" and the operation of "rewards and punishments."\n\nWhile Confucius and Mencius idealized "rule by virtue," Han Feizi designed "a system that even a mediocre ruler can use to govern a country." This later became the theoretical basis for the unification of China under the First Emperor of Qin.',
      },
      {
        type: 'explain',
        title: 'The three elements of governance — law, technique, position',
        content:
          'Han Feizi organized governance into three elements:\n\nLaw (法) — published, clear rules\nA standard anyone can see; rewards and punishments must be predictable.\n→ In modern terms: HR systems, compliance, KPI design.\n\nTechnique (術) — the ruler\'s arts of personnel and operation\nThe craft of seeing through people, placing them in the right roles, and quietly supervising.\n→ In modern terms: management techniques, organizational design.\n\nPosition (勢) — the authority and power that come with one\'s rank\nNot personal popularity, but the power that attaches to a position.\n→ In modern terms: delegation of authority and the dynamics of organizational structure.\n\nOnly when all three are present does an organization function stably.',
      },
      {
        type: 'explain',
        title: 'Connections to modern management',
        content:
          'Han Feizi\'s thought is also a prototype of modern institutional design.\n\nExamples:\n- "Law" = explicitly document evaluation criteria; replace vague "effort" reviews with KPIs.\n- "Technique" = use 1-on-1s, 360-degree feedback, and right-person-in-right-role placement.\n- "Position" = give roles clear authority so the structure doesn\'t depend on personal charisma.\n\nThe reason post-Steve-Jobs Apple keeps running is, in the end, that systems (law, technique, position) work, not charisma (a person).\n\nA caveat: pushed too far, the Han Feizi approach becomes inhumane and surveillance-heavy. Combined with the "ren" of Confucianism, it forms the modern resolution.',
      },
      {
        type: 'quiz',
        question: 'Which of Han Feizi\'s "law, technique, position" most closely corresponds to "technique"?',
        options: [
          { label: 'Employment regulations', correct: false },
          { label: 'The budget-approval authority granted to a department head', correct: false },
          { label: 'The HR craft of seeing through subordinates and placing them in the right roles', correct: true },
          { label: 'The company logo design', correct: false },
        ],
        explanation:
          '"Technique" is the ruler\'s (leader\'s) craft of "seeing through, placing, and supervising people." It corresponds to modern management and organizational HR. "Law" is the documented rules; "position" is the authority of rank. Distinguishing the three is the key to understanding.',
      },
      {
        type: 'quiz',
        question: 'Which form of organizational management most embodies Han Feizi\'s thinking?',
        options: [
          { label: 'Leaving every decision to the charismatic CEO', correct: false },
          { label: 'Documenting evaluation criteria so the same outcome is produced no matter who runs the system', correct: true },
          { label: 'Trusting individual goodwill and minimizing rules', correct: false },
          { label: 'Keeping authority vague to preserve flexibility', correct: false },
        ],
        explanation:
          'The essence of Han Feizi is designing "systems even a mediocre successor can run." Documented rules and predictable rewards/punishments are typical examples. Charisma-dependence and vague authority go in the opposite direction and weaken the organization.',
      },
    ],
  },

  359: {
    id: 359,
    title: 'Sunzi\'s "win without fighting" — the strategy of avoiding competition',
    category: 'Eastern thought',
    steps: [
      {
        type: 'explain',
        title: '"A hundred victories in a hundred battles is not the highest excellence"',
        content:
          'Sunzi (c. 6th–5th century BCE) is the strategist who left us "The Art of War (Sunzi Bingfa)." But the core of his thought is not "how to fight skillfully."\n\nIn the chapter "Strategic Attack" we read:\n\n"To win a hundred battles in a hundred fights is not the highest excellence.\nTo subdue the enemy without fighting is the highest excellence."\n\n— A hundred wins out of a hundred battles is not the supreme strategy. The supreme way to win is to make the opponent yield without fighting.\n\nThis is Sunzi\'s starting point. The deep insight lies in placing "avoiding war" highest, despite being a war specialist.',
      },
      {
        type: 'explain',
        title: 'Preparation that wins before the fight — the five matters and seven calculations',
        content:
          'Sunzi held that "victory or defeat is decided before the battle." That is why in the "Calculations" chapter he urges analysis by "five matters and seven calculations."\n\nFive matters: the root factors that decide the outcome\n- Dao (philosophy / cause)\n- Heaven (timing / weather)\n- Earth (terrain / geographic advantage)\n- Generals (leader\'s ability)\n- Method (organization\'s discipline / institutions)\n\nSeven calculations: seven criteria for comparing yourself with the opponent\nThe ruler\'s virtue, the general\'s ability, the advantage of heaven and earth, the enforcement of regulations, the strength of troops, the level of training, the clarity of rewards and punishments\n\nIn modern strategy, this is the prior analysis of external environment (PEST) × internal resources (VRIO).\n\nSunzi continues: "The victorious army first secures victory, then seeks battle; the defeated army first goes to battle, then seeks victory." The winning side first creates a state in which they will win, and only then fights.',
      },
      {
        type: 'explain',
        title: 'Application to modern competitive strategy',
        content:
          '"Win without fighting" is at the core of modern strategy theory as well.\n\n- Porter\'s differentiation strategy → don\'t fight on the same ground.\n- Blue Ocean Strategy → create a market with no competition.\n- M&A → instead of fighting, buy and absorb.\n- Standards / spec wars → become the side that sets the rules.\n\nConversely, the war of attrition — "selling the same product to the same customer at the same price" — is, from Sunzi\'s perspective, the worst form of fighting.\n\nThe core of Sunzi is not "how to win on the opponent\'s ground" but "how to bring the fight to ground that favors you." Even after 2,500 years, this remains the original form of strategic thinking.',
      },
      {
        type: 'quiz',
        question: 'Which best captures the essence of Sunzi\'s "win without fighting"?',
        options: [
          { label: 'Winning spectacularly in actual combat', correct: false },
          { label: 'Achieving the goal while avoiding combat through prior preparation and strategy', correct: true },
          { label: 'Doing nothing and waiting for the opponent to self-destruct', correct: false },
          { label: 'Talking with the opponent to find a compromise', correct: false },
        ],
        explanation:
          '"Win without fighting" means avoiding the war of attrition called combat and deciding the outcome through prior strategy and situation design. It is neither inaction nor compromise. It is the most active and planned form of winning.',
      },
      {
        type: 'quiz',
        question: 'Which managerial decision is closest to Sunzi\'s thinking?',
        options: [
          { label: 'Plunge into a price war with the same product as competitors', correct: false },
          { label: 'Define a new segment with no competition and establish position there', correct: true },
          { label: 'Bet everything on a concentrated advertising blitz', correct: false },
          { label: 'Do nothing and wait for the market to change', correct: false },
        ],
        explanation:
          'The core of Sunzi is "avoid unfavorable fights and bring the battle to favorable ground." Defining a new segment (Blue Ocean) is the typical example. A price war is the very war of attrition to avoid; doing nothing is unlike Sunzi\'s active strategic thought.',
      },
    ],
  },
}
