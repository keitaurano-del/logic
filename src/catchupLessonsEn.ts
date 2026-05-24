/**
 * Consultant Catchup Course (Advanced)
 * Design: rapidly stand up as a "specialist" on a new engagement in an unfamiliar industry
 * Lesson IDs: 330-335
 * Category: 'Client Work'
 * English version
 */
import type { LessonData } from './lessonData'

// ── Lesson 330: The catchup big picture ────────────────────────────
const catchupLesson330: LessonData = {
  id: 330,
  title: 'The catchup big picture',
  category: 'Client Work',
  steps: [
    {
      type: 'explain',
      title: 'Consulting starts from "an industry you\'ve never worked in"',
      content: 'Consulting work almost always begins from "first time in this industry, first time on this issue."\n\nFinish a finance engagement, and the next is a manufacturing supply chain. Then a regional government DX project. Industry and issue change every time.\n\nAnd yet the client expects you to bring specialist value.\n\nWhere many people get this wrong:\n- "I have to know more than the company\'s 10-year veteran"\n- ⭕ "I just need to bring perspectives that help the client decide"\n\nThe value of a consultant is not "amount of industry knowledge" but "the ability to structure issues and offer decision-relevant perspectives quickly."\n\nThat\'s why "speed of catchup" and "designing the depth" of catchup are decisive.',
    },
    {
      type: 'explain',
      title: 'Think of catchup in three layers',
      content: 'Gathering information randomly doesn\'t stick. Catchup happens in three layers.\n\nLayer 1: Surface (1-2 days)\n- Industry terms, key players, market size\n- "I can follow what\'s being talked about"\n- Example: "What is reinsurance?" "Who are the three carriers?"\n\nLayer 2: Structure (3-4 days)\n- Business model, revenue structure, KPIs\n- "I understand why money is or isn\'t made"\n- Example: For a telco — relationship of ARPU, churn, capex\n\nLayer 3: Dynamics (Day 5+)\n- Competitive rules, regulation, trends, each player\'s strategy\n- "I can speak to what happens next"\n- Example: "How will MVNOs move over the next 3 years?"\n\nThe order matters. Going to Layer 3 with Layer 1 fuzzy means you sound plausible but the client sees through it.',
      visual: 'ThreePillarsDiagram',
      outro:
        'Stacking surface, structure, and dynamics in order is the basic move for catching up on an unfamiliar industry. Jumping into the deeper layers with Layer 1 still fuzzy makes you sound plausible while the client sees right through it. The patience to refuse shortcuts on the sequence is what produces the actual fastest path.',
    },
    {
      type: 'quiz',
      explanation: 'First Layer 1 (surface). Without grasping terminology, key players, and market size, you can\'t follow deeper conversation. Don\'t skip the order.',
      question: 'You have no manufacturing experience and have been staffed on an automotive parts supplier engagement. The first client meeting is in 3 days. What\'s the priority?',
      options: [
        { label: 'Deep-dive into latest trends (EV transition, autonomy)', correct: false },
        { label: 'Lock down the "full map": key players, industry terms, market size', correct: true },
        { label: 'Independently analyze the client\'s competitive strategy', correct: false },
        { label: 'Generate 10 hypotheses on day one', correct: false },
      ],
    },
    {
      type: 'explain',
      title: 'Goal: "a little broader and a little deeper than the client"',
      content: 'When stuck on "how much is enough?" use this benchmark.\n\nGoal: relative to the client\'s lead person,\n- A little broader perspective (cross-industry, peer cases)\n- A little deeper structural view (numbers, causality)\n\nClients know their own operations well, but often don\'t see the whole industry or other companies\' moves.\n\nIf you can bring "structure visible from outside" into that gap, you create value.\n\nThings to avoid:\n- Trying to win on knowledge volume against a 10-year veteran → you can\'t\n- Trying to know everything → time runs out → the most common failure\n\n"Broad, deep, just a little" is the mantra. Producing that "little bit" in limited time is the essence of catchup.',
    },
    {
      type: 'quiz',
      explanation: 'Knowing more broadly OR more deeply is rarely valuable on its own. "Show structure visible from outside, alongside the client" is the consultant\'s value source. Compete on perspective, not coverage.',
      question: 'When demonstrating "specialist value" as a consultant, what\'s the essence?',
      options: [
        { label: 'Out-knowing the client\'s employees on industry knowledge', correct: false },
        { label: 'Bringing structure and peer cases the client can\'t see, into the issue context', correct: true },
        { label: 'Collecting niche information no one else has', correct: false },
        { label: 'Memorizing the entire industry history', correct: false },
      ],
    },
  ],
}

// ── Lesson 331: Build foundation with books ─────────────────────────
const catchupLesson331: LessonData = {
  id: 331,
  title: 'Build a foundation with books',
  category: 'Client Work',
  steps: [
    {
      type: 'explain',
      title: 'Starting with "books" is the shortest path',
      content: 'Google. Ask AI. Search social. There are many sources.\n\nStill, starting catchup of a new industry from "three books" is the most efficient path.\n\nWhy books:\n- High information density (an editor has been involved)\n- Systematically organized (the chapter map becomes your thinking map)\n- "The whole industry" in one volume\n- Author hypothesis and evidence travel together\n\nLimitations of online articles:\n- Fragmented; takes time to connect them\n- Hard to gauge "importance" (everything looks equal)\n- Mixed in are stale or biased pieces\n\nAsking AI also works, but it\'s most effective as "a complement after building the skeleton from books." Going AI-only first leaves you with fuzzy understanding.',
    },
    {
      type: 'explain',
      title: 'The three-book rule',
      content: 'Pick books not "best-seller first" but on a three-axis purpose, and the picture becomes 3D fast.\n\nBook 1: Introduction (general audience)\n- Written for non-experts of the industry\n- "What is this industry, fundamentally?" — answered fast\n- Examples: "The XX Industry: A Study," "Visual Guide to XX"\n\nBook 2: Systematic (practitioners)\n- Industry experts\' systematic synthesis\n- Business model, KPIs, terminology covered\n- Examples: textbook-style practitioner books, association-supervised guides\n\nBook 3: Latest trends\n- Coverage of changes in the past 2-3 years\n- The industry\'s hot issues, each player\'s moves\n- Examples: "XX DX," "The Future of XX"\n\nThe trick is reading them in parallel. Use (1) for the big picture while (2) provides structure and (3) provides "now." Three angles produce 3D understanding in less time.',
    },
    {
      type: 'quiz',
      explanation: 'Cover three axes: introduction, systematic, latest. Reading three books from the same author or angle doesn\'t add perspectives. Three different angles produce 3D.',
      question: 'You\'re catching up on the insurance industry from zero in one week. What\'s the best way to choose three books?',
      options: [
        { label: 'Read the top three Amazon-best-selling insurance books in order', correct: false },
        { label: 'Pick one each on three axes: intro, systematic practitioner book, and latest trends (DX, regulation)', correct: true },
        { label: 'Read three books in a series by the same author', correct: false },
        { label: 'Read three self-promotional books from insurance companies', correct: false },
      ],
    },
    {
      type: 'explain',
      title: 'Make a book "usable knowledge" in 4 hours',
      content: 'Reading a book "carefully from start to finish" takes 8-10 hours. Catchup doesn\'t have that luxury.\n\n4-hour reading method:\n\nStep 1: Read the table of contents (15 min)\n- See chapter structure to grasp "how the industry is organized"\n- Mark chapters likely relevant to your issue\n\nStep 2: Read intro, conclusion, and chapter openings (45 min)\n- Lock the author\'s claims and conclusions in advance\n- Get the overall map into your head\n\nStep 3: Read marked chapters carefully (2 hours)\n- Deep-read only the necessary chapters\n- Copy numbers, charts, and keywords into notes\n\nStep 4: Summarize and capture (1 hour)\n- Write "three takeaways from this book" in your own words\n- Convert relevant parts into hypothesis form for your engagement\n\nImportant: don\'t try to memorize everything. Build a state where you can "retrieve in usable form."',
    },
    {
      type: 'quiz',
      explanation: 'Drop "I have to read everything." Read in this order: TOC → claims → necessary chapters. In 4 hours you can put a book to work.',
      question: 'When extracting "usable knowledge" from one industry book in 4 hours, what\'s the most effective reading method?',
      options: [
        { label: 'Read carefully from page 1, underlining as you go', correct: false },
        { label: 'TOC → claims (intro / conclusion) → deep-read only necessary chapters', correct: true },
        { label: 'Open random pages and read whatever catches your eye', correct: false },
        { label: 'Skip the book and follow the author\'s social posts', correct: false },
      ],
    },
  ],
}

// ── Lesson 332: Make the industry 3D with cases and data ─────────────────
const catchupLesson332: LessonData = {
  id: 332,
  title: 'Make the industry 3D with cases and data',
  category: 'Client Work',
  steps: [
    {
      type: 'explain',
      title: 'After books, mine the public-information goldmine',
      content: 'Once books have given you the "industry map," fill in concrete numbers and cases from public information.\n\nPublic information consultants rely on:\n\n(1) IR materials and earnings call decks\n- Each company\'s strategy, KPIs, and challenges in their own words\n- The "management challenges" page is especially gold\n\n(2) Annual securities reports\n- Segment-level revenue and profit, risk awareness, competitive position\n- Build a 3D, numeric picture of the industry structure\n\n(3) Industry reports (METI, JETRO, Yano Research, Fuji Keizai, etc.)\n- Market size, growth rate, key player share\n- Citable in proposals\n\n(4) Consulting firm white papers\n- McKinsey, BCG, Bain, Deloitte, PwC, Accenture\n- High-quality structured industry takes — for free\n\n(5) Trade press and specialty media\n- Nikkei industry papers, sector trade journals\n- The "temperature on the ground"\n\n(6) Competitor press releases\n- Recent moves in chronological order',
    },
    {
      type: 'explain',
      title: 'Three-company comparison reveals industry structure',
      content: 'When gathering public information, don\'t scan blindly. Compare three companies in the same industry and structure surfaces.\n\nItems to compare across three companies:\n\n| Item | A | B | C |\n|---|---|---|---|\n| Revenue size | | | |\n| Revenue mix (segments) | | | |\n| Operating margin | | | |\n| Flagship products / target customers | | | |\n| Strategy in past 3 years | | | |\n| Stated challenges (from IR) | | | |\n\nWhat 3-way comparison reveals:\n- All three share an issue → industry-wide structural problem\n- Only one differs → that company\'s unique strategy or weakness\n- Margin gaps → positioning differences within the industry\n\nTip: Looking only at the leader, you can\'t tell whether it represents the industry standard or an outlier. Always lay out at least three.',
    },
    {
      type: 'quiz',
      explanation: 'Start IR analysis with (1) scale (revenue), (2) how they make money (segments, margin), (3) change (YoY). Get the big picture first; details later.',
      question: 'What three numbers should you check first when reading IR materials in a new industry?',
      options: [
        { label: '(1) CEO compensation (2) headcount (3) HQ location', correct: false },
        { label: '(1) Revenue size (2) revenue mix and operating margin by segment (3) YoY growth', correct: true },
        { label: '(1) Stock price (2) dividend yield (3) PER', correct: false },
        { label: '(1) Number of subsidiaries (2) executive backgrounds (3) shareholder mix', correct: false },
      ],
    },
    {
      type: 'explain',
      title: 'Draw the industry map on one page',
      content: 'Roll up your collected cases and data into "a one-page industry map" and your head clears at once.\n\nElements to include:\n\n```\n[Market size] XX trillion yen / Growth XX%\n\n[Value chain]\n  Upstream (raw materials, parts) → Midstream (manufacturing, processing) → Downstream (sales, service)\n   Key players              Key players                 Key players\n\n[Key players]\n  Leader: A (XX% share, traits)\n  Challengers: B, C\n  Niche: D\n\n[Key industry KPIs]\n  e.g. Telco: ARPU, churn, MNP volume\n  e.g. Manufacturing: utilization, defect rate, COGS ratio\n\n[Industry challenges and trends]\n  - XX (regulation / technology / consumer change)\n  - XX\n```\n\nWith this one page:\n- You can locate yourself in any client conversation\n- It becomes the foundation for hypotheses\n- It\'s shareable with team members\n\nImportant: rough is fine at first. With each round of hypothesis verification, it becomes a respectable map within a week.',
    },
    {
      type: 'quiz',
      explanation: 'With one company you can\'t tell "industry standard" from "outlier." Three companies in the same format reveal both shared structure and strategic differences at once.',
      question: 'When catching up on an industry, what\'s the main purpose of comparing three companies\' cases?',
      options: [
        { label: 'Find the best company and copy it', correct: false },
        { label: 'Distinguish industry-common structure (standard) from each company\'s strategic differences (outliers)', correct: true },
        { label: 'Increase proposal page count', correct: false },
        { label: 'Compare share prices across companies', correct: false },
      ],
    },
  ],
}

// ── Lesson 333: Talk to experts and learn from people ────────────────
const catchupLesson333: LessonData = {
  id: 333,
  title: 'Talk to experts and learn from people',
  category: 'Client Work',
  steps: [
    {
      type: 'explain',
      title: 'Get the "ground feel" books and the web can\'t give you',
      content: 'Books and public information let you draw the "industry map." But there are things they cannot give you.\n\nWhat only people can tell you:\n- "Officially we don\'t say it, but on the ground it works like this"\n- "The internal balance of power and human relationships"\n- "Lately, XX has shifted suddenly"\n- "The real reason things don\'t work like the textbook says"\n\nOften called consulting\'s "trick" — but it\'s actually mainstream:\n\n(1) Internal experienced colleagues\n- Senior people who handled prior engagements in this industry\n- A 30-minute interview equals 2 days of catchup progress\n\n(2) Industry alumni\n- Former employees can speak both "official" and "candid"\n- Find them via recruiters or your network\n\n(3) Former client-side people\n- People with operating-company experience\n- They can explain the on-the-ground decision-making mechanics\n\n(4) Expert-network interviews\n- GLG, AlphaSights, Bizscope (Visasq)\n- Roughly 10K-50K yen per hour and up — but the value is large\n\nDon\'t see "asking people" as cheating. A consultant who doesn\'t use this can\'t do good work in limited time.',
    },
    {
      type: 'explain',
      title: '"Pitch your hypothesis" — 10x the information quality',
      content: 'The most wasteful question in expert interviews:\n\nBad: "Tell me about this industry."\n→ Too abstract — they don\'t know what to say\n→ You get general talk\n\n⭕ Good: "I\'m hypothesizing X. Does that match the on-the-ground feel?"\n→ They can judge "yes" or "no"\n→ If "no," they explain why\n→ In 30 minutes you extract deep information\n\nPitching-hypothesis examples:\n\n"My understanding is that in industry XX, over the last 3 years XX has been happening, and players are moving toward XX. How does this match your sense on the ground?"\n\n"My hypothesis is that the biggest issue in your industry is XX. Is that the right issue framing?"\n\nPoints:\n- Surface your hypothesis first (don\'t be shy)\n- Stance is "verify" rather than "assume correct"\n- People find it easier to "correct" than "lecture"',
    },
    {
      type: 'quiz',
      explanation: '"Tell me about it" is the worst — they don\'t know what to say and you get abstract generalities. Without hypotheses or specific questions you can\'t extract deep information.',
      question: 'You\'ve secured a 30-minute interview with a 20-year industry alum. Which question should you most avoid?',
      options: [
        { label: '"My hypothesis on XX is YY — does that match?"', correct: false },
        { label: '"Tell me about this industry"', correct: true },
        { label: '"How do you evaluate Company XX\'s strategy?"', correct: false },
        { label: '"Is there friction you sense on the ground regarding XX?"', correct: false },
      ],
    },
    {
      type: 'explain',
      title: 'Maximizing a 30-minute interview',
      content: 'How to get results from a time-bounded expert interview.\n\nPre (90 min)\n- From books and public info, build three hypotheses\n- Prepare 10 questions (hypothesis-testing and concrete)\n- Look up the interviewee\'s background; identify their strongest area\n\nOpen (3 min)\n- "Today I\'d like to focus on XX, especially from the angle of XX"\n- Narrowing the topic up front makes it easier for them to talk\n\nBody (22 min)\n- Lead with hypothesis-pitching questions\n- "Why do you think so?" to dig one level deeper\n- "Do you have a concrete example?" to capture reality\n- Note only essentials. With permission, record\n\nClose (5 min)\n- "If I were investigating XX, what should I look at next?"\n- "Who else should I talk to?" — get a referral to the next key person\n\nPost (within 30 min)\n- Organize notes while memory is fresh\n- Update hypotheses (X confirmed, Y refuted, Z newly discovered)\n\nIron rule: don\'t feel done after one interview. Only after three can you tell "industry consensus" from "individual opinion."',
    },
    {
      type: 'quiz',
      explanation: 'Building hypotheses up front and pitching them is most effective. Treat interviews not as "be lectured" but "verify and revise my hypotheses" — that changes information quality.',
      question: 'What\'s the most effective way to maximize a 30-minute expert interview?',
      options: [
        { label: 'Don\'t prepare; listen to everything they say on the day', correct: false },
        { label: 'Prepare three hypotheses in advance, pitch them, and use the time to verify and revise', correct: true },
        { label: 'Prepare as many questions as possible; ask all of them in 30 minutes', correct: false },
        { label: 'Let them talk freely; don\'t take notes — just focus', correct: false },
      ],
    },
  ],
}

// ── Lesson 334: Imagine the client and form hypotheses ────────────
const catchupLesson334: LessonData = {
  id: 334,
  title: 'Imagine the client and form hypotheses',
  category: 'Client Work',
  steps: [
    {
      type: 'explain',
      title: 'Even with zero knowledge, "becoming the other" reveals hypotheses',
      content: 'Catchup doesn\'t end with collecting information.\n\nReinterpreting collected information "from the client\'s perspective" is what turns it into usable hypotheses.\n\nThe imagination "become the client\'s CEO":\n\nAssigned to a mid-sized regional manufacturer.\n- "This company has revenue of XX billion and margin of XX%"\n- ⭕ "If I were the CEO of this company, what would scare me most?"\n  → "Labor shortage. If our 40-something employees leave, the factory can\'t run"\n  → "Big-company price pressure. We can\'t win on price"\n  → "Succession. My son works in Tokyo doing something else"\n\nWhether the imagination is right can be tested when you actually meet the client. But there\'s a huge difference between imagining first and showing up empty-handed.\n\nConsultants deliver "specialist value" because of this imagination. Industry knowledge is a means; the goal is 3D understanding of the client\'s situation.',
    },
    {
      type: 'explain',
      title: 'Counterpart analysis reveals real intent',
      content: 'Beyond the client company, the counterpart you\'re actually working with is also an analysis target.\n\nFour axes of counterpart analysis:\n\n(1) KPIs (what they\'re measured on)\n- Director: this period\'s business unit profit\n- Manager: next period\'s budget achievement\n- Lead: project deadline adherence\n- → Each level sees a different landscape\n\n(2) Evaluation axis (who evaluates them)\n- Who is the boss? What\'s the political map?\n- Where can they not afford to fail?\n- → Changes how to land the proposal\n\n(3) Constraints (what they can\'t do)\n- Budget ceilings\n- Resources they can\'t move\n- Past context (relationship to predecessor\'s direction)\n- → Changes proposal feasibility\n\n(4) True wants (what they actually want)\n- The pain behind the surface request\n- "Cost cuts" really means "I need material to explain to executives"\n- → Once you see this, trust accelerates\n\nImportant: form "imagined" answers to all four before the first meeting. Wrong is fine. With your guesses ready, the meeting becomes "answer-checking."',
    },
    {
      type: 'quiz',
      explanation: 'Imagine the counterpart before the first meeting. Holding hypotheses on role, KPIs, constraints, and real want lets the day become "answer-checking" and accelerates trust-building.',
      question: 'For a first-meeting client lead (business unit director), what should you "imagine" beforehand?',
      options: [
        { label: 'University and hobbies', correct: false },
        { label: 'KPIs they\'re measured on, internal politics, constraints, and what they truly want', correct: true },
        { label: 'Age and family', correct: false },
        { label: 'Personality and speech patterns', correct: false },
      ],
    },
    {
      type: 'explain',
      title: 'Five questions to imagine the client\'s situation',
      content: 'To form counterpart understanding as hypotheses, use five questions.\n\nQuestion (1): What are they struggling with?\n- Not the surface request, but what they truly struggle with\n- Behind "raise sales" sits "anxiety about hitting next-period budget"\n\nQuestion (2): What do they want to achieve?\n- Short-term (this period) and mid-term (3 years out) goals differ\n- Personal career goals (promotion, transfer) also matter\n\nQuestion (3): How do internal politics move?\n- Who pushes this project? Who blocks it?\n- "That director argues for a different direction"\n\nQuestion (4): What\'s the evaluation axis?\n- What do they get if this project succeeds (HR, budget, track record)?\n- What do they lose if it fails (responsibility, demotion)?\n\nQuestion (5): What answer do they truly want?\n- "Analysis result" or "deck for the board"?\n- "The right conclusion" or "support for a decision already made"?\n\nAnswer all five with hypotheses before the first meeting. The day\'s conversation and expressions reveal what\'s right and what\'s wrong. With hypotheses ready, the first meeting transforms from "catchup time" into "verification time."',
    },
    {
      type: 'quiz',
      explanation: 'Hypotheses are not finished in one go. Each new piece of information separates "right / wrong / new finding" and updates the hypothesis. Only this iteration produces precision.',
      question: 'What\'s the most effective way to raise the precision of hypotheses about the client?',
      options: [
        { label: 'Never change the first hypothesis — treat it as truth', correct: false },
        { label: 'With each new piece of information, classify "right / wrong / new finding" and keep updating', correct: true },
        { label: 'Hypotheses should be complex — keep adding items', correct: false },
        { label: 'Don\'t share with team members; keep it to yourself', correct: false },
      ],
    },
  ],
}

// ── Lesson 335: 8-day catchup sprint ──────────────
const catchupLesson335: LessonData = {
  id: 335,
  title: '8-day catchup sprint',
  category: 'Client Work',
  steps: [
    {
      type: 'explain',
      title: 'Run books, cases, people, and hypotheses in parallel',
      content: 'Books → cases → experts → hypotheses, in strict sequence, misses the deadline.\n\nConsulting catchup runs in parallel — that\'s the iron rule.\n\nFour parallel tracks:\n\n```\n  Day1  Day2  Day3  Day4  Day5  Day6  Day7\n  ────────────────────────────────────────\nBooks: [Read 3 books----]\nCases:    [IR / reports----]\nPeople:        [Interview][Interview]\nHypothesis: [v0][v1][v2][v3][lock][verify]\n```\n\nWhy parallel:\n- Eliminates wait time (you can read books while waiting on an expert\'s schedule)\n- Hypotheses update continuously\n- You can drop wrong hypotheses early\n\nAnother iron rule: "think while moving"\n- "Don\'t hypothesize until information is perfect" → wrong\n- Start with a rough Day-1 hypothesis; update daily\n- Keep producing output (whiteboard, one-pager)',
    },
    {
      type: 'explain',
      title: 'Concrete 8-day plan',
      content: 'Standard plan: staffed Monday, first client meeting next Monday.\n\nDay 1 (Mon): Draw the map\n- AM: order three industry books for delivery; plan to finish by Day 3\n- AM: read book 1 (intro) in 4 hours\n- PM: draw rough industry map (size, key players)\n- PM: build hypothesis V0 (imagine using the five questions)\n\nDay 2 (Tue): Fill in structure\n- AM: read book 2 (systematic)\n- PM: compare three competitors\' IR and public materials\n- PM: add numbers to the industry map\n- Evening: update hypothesis V1\n\nDay 3 (Wed): Talk to people\n- AM: read book 3 (latest trends)\n- PM: interview internal experienced colleagues (30 min × 2)\n- PM: update hypothesis V2 (reflect ground-feel)\n\nDay 4 (Thu): External experts\n- AM: paid interview with industry alum (1 hour)\n- PM: update hypothesis V3 (reflect external perspective)\n- PM: produce a 2-page issue paper\n\nDay 5 (Fri): Lock the hypothesis\n- AM: team review of the hypothesis\n- PM: finalize the issue paper\n- PM: build a Q&A doc for the first meeting\n\nDay 6 (Sat): Rest or Q&A\n\nDay 7 (Sun): Final check\n- Final review of map, hypothesis, Q&A\n\nDay 8 (Mon): First meeting → verify → update hypothesis\n\nPoint: don\'t aim for perfection. By Day 5, having 70% of the hypothesis is fine. The rest fills in through the client conversation.',
    },
    {
      type: 'quiz',
      explanation: 'In the first two days, "drawing the map" is the priority. Day 1: rough whole picture. Day 2: fill in numbers and structure. Speed of V0 → V1 sets the precision of the rest of catchup.',
      question: 'You\'re staffed Monday with a first client meeting next Monday. What\'s the right priority for Day 1-2?',
      options: [
        { label: 'Visit the client\'s site to feel the atmosphere', correct: false },
        { label: 'Read three industry books while sketching the industry map and producing hypothesis V0 → V1', correct: true },
        { label: 'Start drafting 20 proposal slides', correct: false },
        { label: 'Focus only on collecting information until the perfect hypothesis appears', correct: false },
      ],
    },
    {
      type: 'explain',
      title: 'Pitfalls and the "stay one step ahead" stance',
      content: 'Common pitfalls and how to avoid them.\n\nPitfall (1): Perfectionism\n- "I\'ll act once I understand everything" → never starts moving\n- Avoid: produce a rough hypothesis up front; fix it while moving\n\nPitfall (2): Knowledge flexing\n- Drop industry jargon to look smart\n- → Clients see through "googled it"\n- Avoid: pair "humble learning posture" with "hypothesis-holding posture"\n\nPitfall (3): Going it alone\n- Don\'t ask the team, seniors, or experts; try to do it alone\n- → Time-out plus low quality\n- Avoid: share "what you don\'t know" early, ask for help\n\nPitfall (4): Hypothesis attachment\n- Falling in love with your first hypothesis and refusing counter-evidence\n- Avoid: understand "hypotheses exist to be discarded"\n\nThe "stay one step ahead" stance:\n- Think one step ahead of "what will the client ask next?"\n- Prepare "if they say X, I\'ll respond Y"\n- This alone makes you look much more like a "specialist"\n\nFinal point: catchup is not "learning" — it\'s "preparation for delivering value." How quickly you can bring decision-relevant perspectives to the client — that\'s the consultant\'s craft.',
    },
    {
      type: 'quiz',
      explanation: 'Consulting catchup\'s purpose is not "absorb industry knowledge" but "rapidly bring perspectives that help the client decide." Pursue value-delivery angle, not coverage.',
      question: 'As a consultant, what\'s the "essence" of delivering value through catchup?',
      options: [
        { label: 'Match an industry veteran\'s knowledge volume', correct: false },
        { label: 'Mobilize books, cases, people, and hypotheses to bring decision-relevant perspectives quickly', correct: true },
        { label: 'Master industry jargon perfectly', correct: false },
        { label: 'Collect more information than anyone else', correct: false },
      ],
    },
  ],
}

// ── Export ────────────────────────────────────────────────────────
export const catchupLessonMapEn: Record<number, LessonData> = {
  330: catchupLesson330,
  331: catchupLesson331,
  332: catchupLesson332,
  333: catchupLesson333,
  334: catchupLesson334,
  335: catchupLesson335,
}
