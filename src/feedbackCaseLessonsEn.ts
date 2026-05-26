/**
 * Feedback-handling case studies (English version)
 * Lesson IDs: 336–339
 * Category: 'Client Work'
 *
 * Practical cases for handling manager feedback like "your thinking is shallow,"
 * "your analysis is loose," or "your insights are weak."
 * 336 is the foundational lesson on thinking perspectives, and 337–339 are
 * pattern-specific case studies.
 */
import type { LessonData } from './lessonData'

// ── Lesson 336: Expand your thinking perspectives ────────────────
const feedbackPerspectives: LessonData = {
  id: 336,
  title: 'Expand your thinking perspectives (the foundation of feedback handling)',
  category: 'Client Work',
  steps: [
    {
      type: 'explain',
      title: 'Why "perspectives" matter most',
      content: 'When managers say "your thinking is shallow," "your analysis is loose," or "your insights are weak," the root cause is usually a lack of perspectives (lenses) while thinking.\n\nThe same fact looks different through different lenses.\n\nExample: "Sales fell 20% YoY"\n- Time lens: Has it been declining for 3 years, or did it drop suddenly?\n- Customer lens: New-customer drop, or existing-customer churn?\n- Competitor lens: Industry-wide decline, or our company alone?\n- Structural lens: Is the cause price, product, or channel?\n\nWith only one lens you only see "the surface of the fact." Stack three lenses, and structural causes start to appear.\n\n:::point\n"Expanding perspectives" means re-examining the same fact through multiple lenses. The more lenses you stack, the more the structure beneath the surface comes into view.\n:::',
    },
    {
      type: 'explain',
      title: '9 fundamental business perspectives',
      content: 'If your thinking tends to come out shallow, build a habit of cycling through these 9 lenses. A minimum of 3 per topic is a good baseline.\n\n① Time: Since when / until when / short-term vs long-term impact?\n② Space: Where / company / industry / macro / by region?\n③ Stakeholder: For whom (customers / employees / shareholders / partners)?\n④ Abstract–Concrete: Strategy or tactics / whole or part?\n⑤ Quantitative–Qualitative: Measurable in numbers / qualitative signals?\n⑥ Opportunity–Risk: Have you looked at both upside and downside?\n⑦ Static–Dynamic: Current structure / drivers of change?\n⑧ Insider–Outsider: From within / a step removed?\n⑨ Comparison: Compared to what (past / competitor / industry average)?\n\nWhen a manager says "go one level deeper," they usually mean: "add the perspective you\'re missing from this list."',
      outro:
        'You do not need all nine perspectives every time — combining at least three per topic is the trick. When you hear "go one level deeper," adding just one missing perspective is usually enough to make the discussion three-dimensional.',
    },
    {
      type: 'explain',
      title: '3 steps to expand perspectives',
      content: 'You don\'t need to use all 9 lenses every time. The key is finding the perspectives you\'re missing.\n\nStep 1: Tag which perspectives are present in your analysis\nExample: "We should lower the price" → Abstract-Concrete (concrete) / Opportunity-Risk (only opportunity). 7 lenses untouched.\n\nStep 2: Deliberately list missing perspectives\nExample: "Time (short-term gains vs long-term price-discounting habit)" / "Competitor (price war if rivals follow)" — both missing.\n\nStep 3: Re-examine through the missing lenses, then rebuild the conclusion\nExample: "Short-term: +10% sales / long-term: -5% margin / high competitor-follow risk → propose bundling instead of a price cut."\n\n:::tip\nMake this 3-step routine automatic, and your perspectives expand every time you think. Start by finding which perspective you are missing.\n:::',
    },
    {
      type: 'case',
      title: 'A "non-multidimensional" store-location analysis',
      situation: 'You are leading a new-store strategy for a retail chain. You report: "Site A (downtown / high rent) vs Site B (suburban / low rent). A draws traffic, B has cost advantage." Your manager replies: "That\'s surface-level. Think more multidimensionally."',
      phases: [
        {
          info: 'Looking back, your analysis only contains 2 perspectives: traffic and cost.',
          question: 'What should you do first to identify the "missing perspectives"?',
          options: [
            { label: 'Collect more data to reinforce the analysis', correct: false, feedback: 'It\'s not a data-volume issue but a perspective-count issue. Same data, more lenses, different insights.' },
            { label: 'Inventory your comparison axes and consciously list which of the 9 lenses are missing', correct: true, feedback: 'Correct. Inventory → identify gaps → re-examine. Start by asking "what other axes besides traffic and cost?"' },
            { label: 'Reverse the conclusion (recommend B instead of A)', correct: false, feedback: 'Flipping the conclusion adds no perspective. The issue is missing lenses, not wrong wording.' },
            { label: 'Match the manager\'s preferred conclusion', correct: false, feedback: 'Pleasing the manager doesn\'t create multidimensional thinking. The point is objective expansion of perspectives.' },
          ],
        },
        {
          info: 'Pick 3 perspectives to add for a store-location decision.',
          question: 'Which combination of "added perspectives" is most important?',
          options: [
            { label: '①Store design ②Employee morale ③Signage color', correct: false, feedback: 'These are tactical elements, weak as strategic-level perspectives for location decisions.' },
            { label: '①Competition (same-industry stores within 500m) ②Time (3-year outlook on rent and population) ③Risk (exit cost, regional volatility)', correct: true, feedback: 'Correct. Competitor lens (price-war risk), time lens (rent renewal / demographics), risk lens (exit cost). The three core lenses for location decisions.' },
            { label: '①Social-media appeal ②Trendy formats ③Influencer use', correct: false, feedback: 'Marketing tactics — low priority as a strategic decision lens for location.' },
            { label: '①CEO\'s hometown ②Past success cases ③Intuition', correct: false, feedback: 'Subjective and personal — not objective perspectives.' },
          ],
        },
        {
          info: 'You\'ve re-analyzed with 5 perspectives: traffic, cost, competition, time, risk.',
          question: 'After expanding perspectives, what is the most valuable output?',
          options: [
            { label: 'Display all 5 perspectives in a flat side-by-side table', correct: false, feedback: 'Flat listing is "multidimensional" but produces no "insight." After expanding lenses, you need to integrate them into a conclusion.' },
            { label: 'Score on 5 lenses, surface the trade-offs (e.g. A: traffic ◎ but long-term cost △), and present a clear "decision criterion"', correct: true, feedback: 'Correct. Expand → expose trade-offs → propose the decision criterion. Just expanding lenses is half the job.' },
            { label: 'Defer the decision back to the manager', correct: false, feedback: 'Expanding perspectives that ends in "deferred" defeats the purpose. Push through to the decision criterion.' },
            { label: 'List both as having pros and cons (balanced view)', correct: false, feedback: 'Balanced lists avoid the decision. Integrate the perspectives, then commit to a conclusion.' },
          ],
        },
      ],
      conclusion: 'Structure of this case: "Multidimensional thinking" = perspectives × integration × decision criterion\n\n[Translation] "Multidimensional" = "Stack 3+ perspectives, then show the decision criterion"\n[Response principle] Inventory perspectives → add missing ones → integrate → present decision criterion\n[Next action] Re-analyze with 3-5 lenses, surface trade-offs, then commit to a recommendation\n\n[Perspective checklist]\n- Is the time lens (short / long term) present?\n- Are competitor / third-party moves included?\n- Have you looked at both opportunity and risk?\n- Is there an outsider / overhead view as well as insider?\n- Are comparison anchors (past / competitor / industry) made explicit?\n\n[Framework] Inventory → fill gaps → integrate → state decision criterion',
    },
    {
      type: 'quiz',
      explanation: '"Expanding perspectives" = meta-thinking. Constantly asking "which lens am I using right now? what lenses am I missing?" is the core of deep thinking. Reading more books or memorizing frameworks helps less than meta-awareness of your own thinking.',
      question: 'What habit gives the biggest improvement to people who often hear "shallow" or "weak insights"?',
      options: [
        { label: 'Read as many business books as possible', correct: false },
        { label: 'Before reaching a conclusion, always check "which lens am I using? which one am I missing?"', correct: true },
        { label: 'Memorize many frameworks', correct: false },
        { label: 'Imitate the manager\'s phrasing', correct: false },
      ],
    },
  ],
}

// ── Lesson 337: When told "your thinking is shallow" ─────────────
const feedbackShallow: LessonData = {
  id: 337,
  title: 'Case: when told "your thinking is shallow"',
  category: 'Client Work',
  steps: [
    {
      type: 'explain',
      title: '"Shallow" really means "depth is missing"',
      content: 'When a manager says "your thinking is shallow," they\'re usually pointing to insufficient Why-so? drilling.\n\nTypical "shallow" patterns:\n\n① Why-so? stops at one layer\nExample: "Sales declined because of fewer new customers" — but doesn\'t answer why new customers fell\n\n② Only surface causes are listed\nExample: "Because competitors cut prices" — but skips why competitors could cut, or what the industry structure looks like\n\n③ Stuck in generalities\nExample: "We need more branding" — no client-specific specifics\n\n④ Stating the obvious\nExample: "We need both cost cuts and revenue growth" — no value-add\n\n:::point\nThe key to lifting "shallow" thinking is expanding Why-so? to 3-5 layers in hypothesis form. Do not stop at one layer — keep asking "why, and why that, and why that."\n:::',
    },
    {
      type: 'explain',
      title: 'Three principles for in-the-moment response',
      content: 'When told "your thinking is shallow," apply these three principles immediately.\n\n① Specificity questions, not apologies\n[icon:bad] NG: "Sorry, I\'ll think harder."\n[icon:good] OK: "Specifically, which claim feels shallow — the conclusion, or the reasoning behind it?"\n\n② Pinpoint the location of the issue\n"Generally shallow" gives you nothing to fix. Narrow to "is it especially XX?"\n\n③ Confirm the target depth\n"How deep is deep enough?" / "Down to which layer of hypotheses do you want?"\n→ Confirming the manager\'s mental model of "deep enough" prevents wasted drilling.\n\nThese three alone roughly double the quality of your re-submission.',
      visual: 'ThreePillarsDiagram',
      visualProps: {
        sectionLabel: 'Three principles when told "it\'s shallow"',
        pillars: [
          { title: 'Specificity, not apology', body: 'Ask "which claim is shallow — conclusion or reasoning?"' },
          { title: 'Pinpoint the spot', body: 'Narrow "generally shallow" to "is it especially XX?"' },
          { title: 'Confirm the depth', body: 'Ask how deep is deep enough before drilling' },
        ],
        hint: 'Narrowing what is actually shallow beats another apology',
      },
      outro:
        'Specificity questions, location pinpoints, and goal confirmation — running these three principles cuts the wasted swings on your re-submission dramatically. Narrowing down what is actually shallow is far more valuable to your manager than another apology.',
    },
    {
      type: 'case',
      title: 'A sales-decline diagnosis is called "shallow"',
      situation: 'You\'re on a food-maker\'s sales-decline project. You report: "The cause of the sales decline is fewer new customers." The manager replies: "That\'s shallow. Re-do it." The next meeting is in 30 minutes.',
      phases: [
        {
          info: 'The manager is about to leave the desk. What should you ask?',
          question: 'Before the manager walks away, what is the best question to ask?',
          options: [
            { label: 'Say "Sorry, I\'ll think it through again" and step back', correct: false, feedback: 'Without knowing what to fix, you\'ll likely come back with another version called "shallow."' },
            { label: '"Specifically, which part feels shallow — the conclusion (fewer new customers), or the reasoning behind it?"', correct: true, feedback: 'Correct. The fix differs based on whether the issue is the conclusion or the reasoning. Narrowing "generally shallow" to one layer is a must.' },
            { label: '"Should I gather more data?"', correct: false, feedback: 'Likely a depth issue, not a data-volume issue. More data rarely fixes "shallowness."' },
            { label: '"I\'ll redo it with a fresh framework — I\'ll try 3C this time."', correct: false, feedback: 'Jumping to frameworks is premature. First identify what is "shallow."' },
          ],
        },
        {
          info: 'Manager: "The conclusion is fine. But you don\'t explain why new customers fell. \'Because ad spend dropped\' is one layer; I want 2-3 layers deeper."',
          question: 'What is the essential meaning of this comment?',
          options: [
            { label: 'The conclusion is wrong', correct: false, feedback: 'The manager explicitly said "the conclusion is fine." Don\'t change the conclusion.' },
            { label: 'Why-so? drilling is too shallow — direct cause → structural cause → root cause is not built out', correct: true, feedback: 'Correct. Drilling stopped at layer 1. You need to surface the structure beneath the ad-spend drop (rising media costs / competitive bidding pressure / search-keyword price inflation, etc.).' },
            { label: 'The numbers and rigor are insufficient', correct: false, feedback: 'That would be feedback called "loose analysis." This case is depth, not rigor.' },
            { label: 'The format or wording is poor', correct: false, feedback: 'Not a wording issue — it\'s about the depth of thinking layers.' },
          ],
        },
        {
          info: 'You have 20 minutes left. Available data: "New-customer count YoY -20%", "Ad click-through rate YoY -15%", "CPA YoY +25%", "Competitors A and B increased ad budgets in the same period."',
          question: 'What is the best next action for the re-submission in 30 minutes?',
          options: [
            { label: 'Redo the report as a comprehensive table of all data', correct: false, feedback: 'Volume doesn\'t solve "shallowness." You need depth.' },
            { label: 'Build out Why-so? in 3 layers, in hypothesis form: ①New-customer drop ②Ad efficiency degraded (CPA +25% / CTR -15%) ③Higher media costs + competitor bidding pressure + our own creative fatigue', correct: true, feedback: 'Correct. Three layers minimum, each tagged "fact / hypothesis / unverified" gives visible depth. CPA rise is driven both by external factors (rising media costs + competitor bidding) and internal factors (CTR decline = creative / targeting decay). Covering both sides makes the chain logically robust.' },
            { label: 'Change the conclusion to "marketing strategy review needed"', correct: false, feedback: 'The conclusion was fine. Don\'t fix the conclusion — fix the layers underneath.' },
            { label: 'Add a fresh competitor analysis from scratch', correct: false, feedback: 'Related, but drilling into the data on hand comes first. Drill before you broaden.' },
          ],
        },
      ],
      conclusion: 'Structure of this case: "Shallow" = Why-so? stopped at layer 1\n\n[Translation] "Drill 2-3 more layers, down to structural causes"\n[Response principle] Specificity question first ("which part? conclusion or reasoning?"), not an apology\n[Next action] Build Why-so? in 3 layers, in hypothesis form, tagging each layer fact / hypothesis / unverified\n\n[Drilling tips]\n- Layer 1: direct factor (e.g., ad spend down / CTR down)\n- Layer 2: the structure behind it (CPA up = media costs up + competitor bidding up + creative fatigue)\n- Layer 3: root structure (rising industry-wide ad demand, search-keyword inflation, internal creative-refresh cycle stretched too long)\n- Always tag each layer "fact / hypothesis / unverified"\n\n[Framework] Translate the feedback → layered Why-so? → fact-vs-hypothesis tagging',
    },
    {
      type: 'quiz',
      explanation: '"Shallow" is a depth issue. 3-5 layers down to structural causes makes your thinking visible. But each layer must be linked by hypothesis — stacking unverified guesses leads to "loose analysis" feedback instead.',
      question: 'When told "your thinking is shallow," how many Why-so? layers are a useful baseline?',
      options: [
        { label: '1 layer (direct cause) is enough', correct: false },
        { label: '3-5 layers (down to structural causes)', correct: true },
        { label: 'As many as possible (10+)', correct: false },
        { label: 'Layer count doesn\'t matter — only evidence strength', correct: false },
      ],
    },
  ],
}

// ── Lesson 338: When told "your analysis is loose" ───────────────
const feedbackWeakAnalysis: LessonData = {
  id: 338,
  title: 'Case: when told "your analysis is loose"',
  category: 'Client Work',
  steps: [
    {
      type: 'explain',
      title: '"Loose" really means "rigor is missing"',
      content: 'When a manager says "your analysis is loose," they\'re pointing to a lack of precision and rigor.\n\nDifference vs. "shallow":\n- Shallow = depth issue (Why-so? stopped)\n- Loose = precision issue (structure / numbers / verification all under-built)\n\nTypical "loose" patterns:\n\n① Structure (MECE) is broken: gaps or overlaps; granularity not aligned\n② Numerical foundations are weak: "probably / supposedly" reasoning, no source\n③ Hypotheses unverified: placeholders treated as conclusions\n④ Comparisons are flawed: different baselines or premises\n\n:::point\nThe key to turning "loose" into "sharp" is citing sources, aligning granularity, and adding a verification step. First recognize this is a precision issue, not a depth issue.\n:::',
    },
    {
      type: 'explain',
      title: 'Three diagnostic questions for the moment',
      content: 'When told "your analysis is loose," diagnose with three questions.\n\n① "Is it a structure issue or a numbers issue?"\n→ The fix differs whether the framing (MECE) is bad or whether the source / premise of the numbers is weak.\n\n② "Which element\'s precision falls short most?"\n→ Fixing everything is unrealistic. Identify the highest-priority element first.\n\n③ "What level of granularity do you expect on resubmission?"\n→ Confirm how far the numbers must be pinned down (sources required? ranges acceptable? sensitivity analysis needed?).\n\nThese three almost fully define the direction and depth of your fix.',
      visual: 'ThreePillarsDiagram',
      visualProps: {
        sectionLabel: 'Three questions when told "it\'s loose"',
        pillars: [
          { icon: '1', title: 'Structure or numbers?', body: 'Is the framing (MECE) bad, or the source/premise of numbers weak?' },
          { icon: '2', title: 'Which element?', body: 'Not everything — identify the highest-priority element first' },
          { icon: '3', title: 'What granularity?', body: 'Sources required? Ranges OK? Sensitivity analysis needed?' },
        ],
        hint: 'Three questions almost fully fix the direction and depth of the looseness',
      },
      outro:
        'Structure-vs-numbers, element identification, and granularity confirmation — running these three questions almost fully fixes the direction and required depth of the "looseness." Instead of redoing everything, raising precision only on the highest-priority element is the optimal play under time pressure.',
    },
    {
      type: 'case',
      title: 'A market-size estimate is called "loose"',
      situation: 'In a market-entry pitch, you estimate the target-market size at "~50 billion yen." Calculation: "Japan EC market 20T yen × category share 2.5% = 500B yen. Target-segment share 10% → 50B yen." The senior manager replies: "Loose. We can\'t pitch this."',
      phases: [
        {
          info: 'The senior manager is about to leave.',
          question: 'What is the best response?',
          options: [
            { label: '"I\'ll go deeper" and accept', correct: false, feedback: '"Depth" and "looseness" are different problems. Drilling deeper won\'t fix precision.' },
            { label: '"Specifically, is it the structure (framing) or the numbers (source / premise)?"', correct: true, feedback: 'Correct. Identify the type of "looseness" first. The fix direction completely changes between structure and numbers.' },
            { label: '"I\'ll swap in numbers from a third-party report."', correct: false, feedback: 'Citing reports won\'t fix a bad framing. Diagnose first.' },
            { label: '"I\'ll mark it as a reference figure with a caveat."', correct: false, feedback: 'Disclaimers are a classic NG. Senior wants "numbers we can use."' },
          ],
        },
        {
          info: 'Senior manager: "The sources of \'2.5%\' and \'10%\' are unclear. And what does \'target segment 10%\' mean — by age? by income? by region? Granularity is all over the place."',
          question: 'What is the essence of this "looseness"?',
          options: [
            { label: 'The math is wrong', correct: false, feedback: 'The math itself is fine. The issue is premise sourcing and granularity.' },
            { label: 'Premise values lack sources, and segment definitions have inconsistent granularity (no source × no axis alignment)', correct: true, feedback: 'Correct. "2.5%" and "10%" without sources, "target-segment 10%" without a single defining axis (age? income? region?). Twin looseness in source and granularity.' },
            { label: 'Not enough data', correct: false, feedback: 'More data won\'t fix a sourcing issue. Add source + premise + date to each number first.' },
            { label: 'The conclusion (50B) is too low', correct: false, feedback: 'Magnitude isn\'t the issue. The point is whether the number is "usable."' },
          ],
        },
        {
          info: 'You have 3 hours to resubmit. On hand: METI statistics, two industry reports, internal customer data.',
          question: 'What is the most effective next action?',
          options: [
            { label: 'Switch frameworks (PEST, etc.) and redo the analysis', correct: false, feedback: 'Switching frameworks is escapism. The issue is premise and granularity — improve precision within the same model.' },
            { label: 'Annotate each premise with [source / acquisition date / assumption], and redefine the target segment with aligned axes (e.g., "30-40s / household income 6M+ JPY / Tokyo metro")', correct: true, feedback: 'Correct. Source clarification × unified segment axes. Add range and sensitivity analysis on top, and the analysis becomes pitch-ready.' },
            { label: 'Switch the result to a range (e.g., "20-80B yen")', correct: false, feedback: 'A range helps, but doesn\'t fix the root sourcing issue. Source citation comes first.' },
            { label: 'Have AI re-estimate and paste its numbers', correct: false, feedback: 'AI numbers are also weakly sourced. Use verifiable primary sources (statistics, industry reports).' },
          ],
        },
      ],
      conclusion: 'Structure of this case: "Loose" = precision missing in sourcing and granularity\n\n[Translation] "Cite where the numbers come from, and align segment-definition granularity"\n[Response principle] Diagnose: structure issue or numbers issue, first\n[Next action] Source citation × unified granularity × range + sensitivity analysis\n\n[3-piece set: from "loose" to "sharp"]\n- Annotate each number with [source: ___ / date: ___ / premise: ___]\n- Pick one defining axis for segments (age / income / region) — or explicitly declare a multi-axis combination\n- Show the result as "midpoint + range + sensitivity (how it shifts under premise changes)"\n\n[Framework] Translate feedback → diagnose structure-vs-numbers → align granularity + cite sources + sensitivity',
    },
    {
      type: 'quiz',
      explanation: 'Number reliability = source × explicit premises × verifiability. Adding three pieces of metadata (source / premise / date) to each number transforms "loose" into "usable." AI output and web snippets are weak sources — prefer primary data (statistics, industry reports, internal data).',
      question: 'When told "your analysis is loose," what most effectively raises number credibility?',
      options: [
        { label: 'Pile in as many numbers as possible', correct: false },
        { label: 'Annotate every number with [source / date / premise], then show range + sensitivity', correct: true },
        { label: 'Cite many AI-generated numbers', correct: false },
        { label: 'Supplement numbers verbally', correct: false },
      ],
    },
  ],
}

// ── Lesson 339: When told "your insights are weak" ───────────────
const feedbackWeakInsight: LessonData = {
  id: 339,
  title: 'Case: when told "your insights are weak"',
  category: 'Client Work',
  steps: [
    {
      type: 'explain',
      title: '"Insight" = the meaning of facts',
      content: 'When a manager says "your insights are weak," they\'re asking for the meaning of the facts (So-what?) and a connection to action.\n\nCore chain:\nFact → So-what? → Insight → Action\n\nTypical "weak insight" patterns:\n\n① Stops at fact listing: "A is 30%, B is 40%" — that\'s it\n② So-what? is abstract: "An important trend" / "Worth noting"\n③ Disconnected from action: insights and recommendations float separately\n④ No original viewpoint: only generalities anyone could state\n\nDifference vs. "shallow" / "loose":\n- Shallow = Why-so? (cause-drilling) issue\n- Loose = precision / sourcing issue\n- Weak = So-what? (meaning extraction) issue\n\n:::point\nA strong insight is Fact + Meaning + Action — all three. Listing facts is not enough; only when you connect through to "so what should we do" does it become an insight.\n:::',
    },
    {
      type: 'explain',
      title: 'Three diagnostic questions for the moment',
      content: 'When told "your insights are weak," concretize with three questions.\n\n① "Which part feels especially weak?"\n→ Rare for everything to be weak. Identify the highest-priority section and concentrate there.\n\n② "How far should I push?"\n→ "Far enough that the client can make a decision" is one good standard.\n\n③ "Which action should the insight feed into?"\n→ Insights exist for action. Reverse-engineer from the exit (the decision).\n\nThese three define the "exit" of the insight, which in turn defines how far to push.',
      visual: 'ThreePillarsDiagram',
      visualProps: {
        sectionLabel: 'Three questions when told "the insight is weak"',
        pillars: [
          { title: 'Where', body: 'Which part is especially weak? Concentrate on the top section' },
          { title: 'How far', body: '"Far enough for the client to decide" is a good standard' },
          { title: 'For what', body: 'Which action does it feed? Reverse-engineer from the decision' },
        ],
        hint: 'Insights exist for action — define the exit, then the depth follows',
      },
      outro:
        'Insights exist "for action." Where, how far, and for what — these three questions define the exit, and the required depth of your push appears naturally. The point is to aim for a line that informs a decision, not just a paraphrase of the facts.',
    },
    {
      type: 'case',
      title: 'A churn-reason analysis is called "weak insights"',
      situation: 'For a B2B SaaS company\'s churn analysis, you summarize the survey: "Top 3 reasons: ①Price (35%), ②Feature gap (28%), ③Support quality (20%). Suggests price-sensitive segment is large." The manager replies: "Insights are weak — this isn\'t a pitch."',
      phases: [
        {
          info: 'The manager is about to head into the next meeting.',
          question: 'What is the best response?',
          options: [
            { label: '"I\'ll gather more data and deepen the analysis."', correct: false, feedback: 'Not a data shortage — an extraction issue. First wring meaning from the data on hand.' },
            { label: '"Which action should the insight feed — a price-cut decision, or feature-roadmap prioritization?" — confirm the exit', correct: true, feedback: 'Correct. Reverse-engineering from the exit (action) is the rule. Once the action is clear, the required depth of insight follows.' },
            { label: '"I\'ll rewrite to say \'price is the cause\'" and just adjust phrasing', correct: false, feedback: 'Not a wording issue. The structure (fact → meaning → action) is weak.' },
            { label: '"I\'ll re-run the survey."', correct: false, feedback: 'Wasteful. First mine insight from the data already collected.' },
          ],
        },
        {
          info: 'Manager: "You say price 35% — but is that \'too expensive,\' \'higher than competitors,\' or \'poor cost-performance\'? And you list price / feature / support side-by-side, but how do they relate? It might read as \'the feature gap can\'t be justified by the price.\'"',
          question: 'What is the essence of this "weakness"?',
          options: [
            { label: 'Not enough data', correct: false, feedback: 'Insight not yet wrung out, not data shortage.' },
            { label: 'Facts listed without So-what? (meaning extraction) and without showing relationships between elements', correct: true, feedback: 'Correct. The fact "price = 35%" is on the page, but interpretation ("what about price is the issue?") and structural relationships ("how does it relate to features?") are missing.' },
            { label: 'The conclusion is wrong', correct: false, feedback: 'Not a conclusion issue — a depth-of-interpretation issue.' },
            { label: 'Number sourcing is weak', correct: false, feedback: 'That\'s the "loose analysis" pattern.' },
          ],
        },
        {
          info: 'Re-reading free-text comments from churned customers: many say "Too expensive for the features" or "Support was slow, so I gave up."',
          question: 'What most effectively converts the analysis into "strong insight"?',
          options: [
            { label: 'Rewrite the points more cleanly: "Price, features, support are the churn reasons"', correct: false, feedback: 'Just rephrasing — no meaning extraction, no relational structure.' },
            { label: 'Read "feature-relative price" as the core (from free-text), then build So-what? in 3 stages: ①Price dissatisfaction 35% → ②Free-text shows "feature-relative price" is the real driver → ③Action: prioritize feature improvements OR redefine the value proposition', correct: true, feedback: 'Correct. Fact → 3-stage So-what? → relational structure → action. The interpretive leap to "feature-relative price" instead of jumping to "cut prices" is what makes the insight strong.' },
            { label: 'Conclude flatly: "Lower the price"', correct: false, feedback: 'One-sided. Data already shows "feature-relative" — jumping to a price-only solution misses the read.' },
            { label: 'Make a beautiful pie chart of the top-3 reasons', correct: false, feedback: 'Visualization isn\'t the issue — interpretation depth is.' },
          ],
        },
      ],
      conclusion: 'Structure of this case: "Weak insight" = the chain Fact → So-what? → Action is broken\n\n[Translation] "Push past facts to meaning, show relationships between elements, connect through to action"\n[Response principle] Reverse-engineer from "which action should this insight feed?"\n[Next action] So-what? in 3 stages + show relational structure + connect to action\n\n[Template: weak → strong insight]\n- Fact: "Price dissatisfaction = 35%"\n- So-what? ①: "Not price itself — \'feature-relative price\' is the real driver (backed by free-text)"\n- So-what? ②: "Cutting prices without feature investment hurts margin; deliver feature value first"\n- Action: "Re-prioritize feature roadmap, ship core feature X next release"\n\n[Framework] Reverse from exit → 3-stage So-what? → relational structure → action linkage',
    },
    {
      type: 'quiz',
      explanation: 'Strong insight = Fact + Meaning + Action — three pieces. Insights exist to give decision-makers material to act on. Insights that don\'t lead to action get called "weak." Visualization or rephrasing only smooths the surface; structural weakness remains.',
      question: 'To resolve "weak insights," what must So-what? ultimately connect to?',
      options: [
        { label: 'Beautiful visualization with charts', correct: false },
        { label: 'A specific actionable recommendation a decision-maker can take', correct: true },
        { label: 'Collecting more data', correct: false },
        { label: 'General industry trends', correct: false },
      ],
    },
  ],
}

// ── Export ────────────────────────────────────────────────────────
export const feedbackCaseLessonMapEn: Record<number, LessonData> = {
  336: feedbackPerspectives,
  337: feedbackShallow,
  338: feedbackWeakAnalysis,
  339: feedbackWeakInsight,
}
