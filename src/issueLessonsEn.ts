import type { LessonData } from './lessonData'

// ========================================
// Issue Setting Lessons (ID: 500-506)
// ========================================
// Course: issue-01 "Surface the Issues, Reach the Answer with Logic"
// Even in unfamiliar territory, master the thinking process of surfacing
// issues, structuring them, validating with numbers and logic, and stacking
// interpretations to reach the essence.

// ── Lesson 500: What an Issue Is ─────────────────────────────
const issueWhatIs: LessonData = {
  id: 500,
  title: 'What Is an Issue — Tackling Unfamiliar Questions with Logic',
  category: 'Issue Setting',
  steps: [
    {
      type: 'explain',
      title: 'Problem, Issue, and Question — three different things',
      content:
        'These three terms get blurred in everyday use. Distinguishing them is step one.\n\n[Problem]\nThe gap between "what should be" and "what is."\nExample: Next year\'s revenue target is $10M, current forecast is $7M.\n\n[Issue / Theme]\nThe theme you choose to tackle to close that gap.\nExample: "Customer acquisition cost is too high." "Retention among existing customers is weak."\n\n[Question to Answer]\nThe question you must answer right now in order to move the issue forward.\nExample: "Is the main driver of retention drop delivery delays, or dissatisfaction with the product?"\n\nProblem is the phenomenon, issue is the direction, question is what gets answered.\nDiscussions and validation only move forward once the right question is on the table.',
    },
    {
      type: 'quiz',
      question:
        'For the problem "our profit target for next year looks like it will miss," which most resembles a true "question to answer"?',
      options: [
        { label: 'We should cut costs aggressively', correct: false },
        { label: 'Is the main driver of the profit miss the revenue drop, or the gross margin decline?', correct: true },
        { label: 'The market environment is tough right now', correct: false },
        { label: 'We should reorganize the company', correct: false },
      ],
      explanation:
        '"We should cut/reorganize" are solutions, and "the market is tough" is a feeling. A good question is one whose answer unlocks the next decision. Knowing whether the driver is revenue or gross margin narrows the next move dramatically.',
    },
    {
      type: 'explain',
      title: 'Reach the answer with logic, not experience',
      content:
        'For familiar topics, intuition gets you 80% there.\nBut most real work comes from territory you have no experience in.\n\nA SaaS startup in an industry you know nothing about.\nA regional manufacturer you have never touched.\nA market entry no one in the company has done before.\n\nIn those moments, the only thing you can rely on is logic, not experience.\nLogic that reaches the answer can be broken into four steps:\n\n1. Surface the issues (coverage).\n2. Structure the issues (build a coherent tree).\n3. Attach hypotheses and reasoning (deductive and inductive).\n4. Validate with numbers and facts (test).\n\nFollowing this sequence, you can reach a coherent answer even in territory you have never seen. That is the backbone of this course.',
    },
    {
      type: 'quiz',
      question:
        'On a brand-new industry client engagement, what is the most valuable first move to reach the answer with logic?',
      options: [
        { label: 'Stay silent because you have no first-hand information', correct: false },
        { label: 'Tell stories from your previous industry as the tentative answer', correct: false },
        { label: 'Comprehensively surface possible issues, structure them, then validate', correct: true },
        { label: 'Just repeat your manager\'s opinion', correct: false },
      ],
      explanation:
        'Unfamiliar territory is exactly when "surface then structure then validate" pays off. Silence or talking about your old industry are both shortcuts that bypass the actual issue-setting work.',
    },
    {
      type: 'explain',
      title: 'Good issues vs. bad issues',
      content:
        'Same theme, different framing — and the quality of the discussion changes completely.\n\n[Conditions for a good issue]\n1. The answer can be tested (verifiable).\n2. Answering it moves a decision (impact).\n3. Now is the right moment to answer it (timing).\n\n[Classic bad issues]\n- Vague: "What should our growth strategy be?" -> nowhere to start.\n- Disguised solution: "Should we increase ad spend?" -> the answer is yes/no, not a real question.\n- Outside your control: "Will the economy improve?" -> even if answered, you cannot act.\n- Already obvious: "Are new customers more important than existing ones?" -> the answer is known without a discussion.\n\nA good issue is sharpened by asking: "If we answer this now, do we move forward?"',
    },
    {
      type: 'quiz',
      question: 'Which is closest to a "good issue"?',
      options: [
        { label: 'Should we reduce the attrition rate of young employees?', correct: false },
        { label: 'Among the 15% three-year attrition of young employees, which factor is the dominant driver — "sense of growth" or "compensation"?', correct: true },
        { label: "Is it just that today's generation is like this?", correct: false },
        { label: 'How should we redesign HR systems?', correct: false },
      ],
      explanation:
        '"Should we reduce..." has a self-evident yes answer, "the generation is like this" is outside your control, and "how should we redesign..." is too broad. Narrowing to "growth or compensation" makes the issue testable with data and decision-driving.',
    },
  ],
}

// ── Lesson 501: Surface Issues Comprehensively ───────────────
const issueExhaustive: LessonData = {
  id: 501,
  title: 'Surface Issues Comprehensively — Fill the Blind Spots',
  category: 'Issue Setting',
  steps: [
    {
      type: 'explain',
      title: 'MECE: no gaps, no overlaps',
      content:
        'The first rule when surfacing issues is MECE — Mutually Exclusive, Collectively Exhaustive.\n\nExample: "E-commerce revenue is dropping."\n\n[By revenue structure]\nRevenue = Visits × Conversion × Average ticket\n-> Issues on visits / conversion / average ticket.\n\n[By customer phase]\nNew / Repeat / Reactivated\n-> Which phase is dropping?\n\n[By product category]\nFlagship A / Adjacent B / Long tail\n-> Where is the impact concentrated?\n\nWhat matters is checking that any single cut is MECE on its own dimension. Mixing three dimensions in the same list silently creates both gaps and overlaps.',
      visual: 'MeceVennDiagram',
      outro:
        'The iron rule of MECE is "stay inside one cut." Mix three dimensions and you create gaps and overlaps simultaneously. Taking a moment to ask "what dimension am I cutting on right now?" before listing issues is exactly the small habit that lifts the quality of your thinking.',
    },
    {
      type: 'quiz',
      question: 'Which list of issues is the least MECE?',
      options: [
        { label: 'New customers / repeat customers / reactivated customers (customer phase)', correct: false },
        { label: 'Hokkaido / Tohoku / Kanto / Chubu / Kansai / Chugoku-Shikoku / Kyushu-Okinawa (region)', correct: false },
        { label: 'Young / female / married / city-dweller (mixed attributes)', correct: true },
        { label: 'YoY up / flat / down (direction of change)', correct: false },
      ],
      explanation:
        '"Young / female / married / city-dweller" mixes cuts and counts the same person multiple times across dimensions. MECE works only when you stay on one cut at a time.',
    },
    {
      type: 'explain',
      title: 'Change perspective with 5W1H',
      content:
        'Structural cuts alone still miss themes.\nWhen you sense a blind spot, run 5W1H to broaden the surface.\n\n[Who]\nWho is moving / not moving? Who is the decision-maker / opposition?\n\n[What]\nWhat is happening? What has changed?\n\n[When]\nSince when? Is it seasonal, or structural?\n\n[Where]\nWhich market / channel / step of the process?\n\n[Why]\nNot the surface reason — what is the structural one?\n\n[How]\nThrough what mechanism did the situation come about?\n\n5W1H is less a coverage tool than a self-check: "Am I leaning all in one direction?"',
    },
    {
      type: 'quiz',
      question:
        'For "sales productivity is dropping," which 5W1H question best corrects perspective bias as your first move?',
      options: [
        { label: 'When: when exactly did it start dropping?', correct: true },
        { label: 'How: what training should we run?', correct: false },
        { label: 'Why: jump straight to the root cause of one hypothesis', correct: false },
        { label: 'Where: should we expand overseas?', correct: false },
      ],
      explanation:
        'Without knowing "since when," you cannot tell whether you face a structural shift or short-term noise. In the early issue-surfacing phase, framing the contours (When/Where/Who) beats diving into root cause.',
    },
    {
      type: 'explain',
      title: 'Use stakeholder perspectives to close gaps',
      content:
        'Another strong coverage tool is the stakeholder view.\n\nList everyone connected to the theme first.\n\nExample: a B2B SaaS where churn is rising.\n\nStakeholders:\n- End users (the people doing the daily work)\n- Buyers (managers, executives)\n- Internal support / customer success\n- Integration partners\n- Your own company\'s decision-makers\n\nIssues per stakeholder:\n- User view: Are they actually using it daily?\n- Buyer view: How is ROI being measured?\n- Support view: Has the type of inquiries changed?\n- Partner view: Were there API changes upstream?\n- Internal view: How did the recent price change land?\n\nList the cast first, then write the issues. It breaks the habit of seeing only from your own seat.',
    },
    {
      type: 'explain',
      title: '"Reverse," "zero-base," and "extreme" to clear blind spots',
      content:
        'The final polish for coverage is three shake-ups.\n\n[The reverse question]\nNormal: "Why are revenues falling?"\nReverse: "Why are revenues still this high despite everything?"\n-> The remaining strengths often point to the next lever.\n\n[Zero-base]\nNormal: "What should we change in the current org?"\nZero-base: "If there were no org at all, what would we build now?"\n-> Lets you escape sunk constraints.\n\n[Extremes]\n"If we had 10x the budget, what would we do?"\n"If we had half the staff, what would we cut?"\n-> Forces the actual priorities to surface.\n\nCoverage is not just MECE.\nIt is structure cuts × perspectives (5W1H, stakeholders) × shake-ups (reverse, zero-base, extremes).',
    },
    {
      type: 'quiz',
      question:
        'Your client is worried "we are not winning new customers." Which is a true "reverse question" issue?',
      options: [
        { label: 'Why are new customers decreasing?', correct: false },
        { label: 'Conversely, why are existing customers still here — what value is locking them in?', correct: true },
        { label: 'Conversely, should we cut the price?', correct: false },
        { label: 'If new is hard, just focus on repeat', correct: false },
      ],
      explanation:
        'A reverse question flips the framing, not the policy. "Why are existing customers still here?" reveals the latent value, which often becomes the hook for new-customer acquisition.',
    },
  ],
}

// ── Lesson 502: Structure the Issues ─────────────────────────
const issueStructure: LessonData = {
  id: 502,
  title: 'Structure the Issues — Build a Coherent Issue Tree',
  category: 'Issue Setting',
  steps: [
    {
      type: 'explain',
      title: 'Layer issues into main and sub-issues',
      content:
        'A flat list of 10-20 issues still signals shallow thinking.\nReorganizing them into main issues -> sub-issues -> validation questions makes the logic legible.\n\nExample: Risk of missing next year\'s profit target (top question)\n+- Main A: Could revenue come in below plan?\n|  +- Sub A1: Will repeat rates among existing customers drop?\n|  +- Sub A2: Will new acquisition slow?\n|  +- Sub A3: Will the price change cool demand?\n+- Main B: Could the cost base balloon?\n   +- Sub B1: Wage inflation?\n   +- Sub B2: Material and logistics cost increases?\n\nThis is an "issue tree."\nIf parent-child relationships can be explained both ways via "Why so / How so," the structure is sound.',
      visual: 'LogicTreeDiagram',
      outro:
        'The quality test for an issue tree is whether each parent-child link survives both "Why so" and "How so." Simply layering a flat list into main, sub, and validation issues automatically settles your priority order and the sequence in which you should verify them.',
    },
    {
      type: 'quiz',
      question: 'How do you best test whether your issue tree\'s parent-child relationships are coherent?',
      options: [
        { label: 'Apply "How so?" (parent -> child) and "Why so?" (child -> parent) on every branch', correct: true },
        { label: 'Start filling in numbers from the leaves immediately', correct: false },
        { label: 'Avoid editing until your manager reviews', correct: false },
        { label: 'Run interviews with everyone involved first', correct: false },
      ],
      explanation:
        'Healthy structure passes the bidirectional check: parents can be specified by children (How so), and children can ladder back to parents (Why so). Branches that fail either side are not properly layered.',
    },
    {
      type: 'explain',
      title: 'Keep granularity consistent',
      content:
        'The classic structure-breaker is uneven granularity.\n\nBad: drivers of next year\'s revenue drop\n+- Drop in repeat rate (mid-level)\n+- Demotivation of representative A (too narrow)\n+- Stagnation of the Japanese economy (too broad)\n\nThis state makes it impossible to choose the focus of the discussion.\n\nGood (same granularity):\n+- Drop in repeat rate\n+- Slowdown in new acquisition\n+- Decline in unit price\n\nIssues at a different level (macro environment, individual motivation) belong on a separate branch, or as upstream assumptions. Even granularity alone makes the discussion feel completely different.',
    },
    {
      type: 'quiz',
      question:
        'For "E-commerce revenue is falling," which sub-issue list has inconsistent granularity?',
      options: [
        { label: 'Visits / conversion / average ticket', correct: false },
        { label: 'New / repeat / reactivated', correct: false },
        { label: 'Ad KPIs / SEO / color of banner A / corporate strategy', correct: true },
        { label: 'PC / mobile / app', correct: false },
      ],
      explanation:
        '"Ad KPIs" and "SEO" sit at a strategic level; "color of banner A" is an execution detail; "corporate strategy" is macro. Consistent granularity lets all participants share the same vantage point.',
    },
    {
      type: 'explain',
      title: 'Stack logic with deduction and induction',
      content:
        'Once issues are structured, attach the logic for reaching the answer on each branch.\nThe basics are deduction and induction.\n\n[Deduction]\nGeneral principle -> specific case.\n"Raising price tends to push some demand away (principle)" + "We raised price by 10%"\n-> "Some churn should occur as a result."\n\nStrength: fast reasoning. Weakness: if a premise breaks, the whole chain breaks.\n\n[Induction]\nStack specific cases -> generalize.\n"Companies A, B, and C all saw churn rise after a price increase."\n-> "We are likely to see churn too."\n\nStrength: data-anchored. Weakness: blind to exceptions.\n\nMatch the right tool to each branch — "is this a deductive branch, or an inductive one?" — and the logic visibly tightens.',
    },
    {
      type: 'quiz',
      question:
        'What is the most rigorous deductive support for "Our churn should rise after the price increase"?',
      options: [
        { label: 'Cite three competitors whose churn rose after a price increase', correct: false },
        { label: 'Combine the principle that "goods with nonzero price elasticity lose some demand on a price rise" with the fact that our product fits that condition', correct: true },
        { label: '"Most people internally feel this is true"', correct: false },
        { label: 'Quote a supportive executive', correct: false },
      ],
      explanation:
        'Deduction needs a broadly true principle plus a fact tying your case to it. Three competitor examples are induction; sentiment and quotes are not evidence at all.',
    },
  ],
}

// ── Lesson 503: Attach Hypotheses and Reasoning ──────────────
const issueHypothesis: LessonData = {
  id: 503,
  title: 'Attach Hypotheses and Reasoning — Answer Without Experience',
  category: 'Issue Setting',
  steps: [
    {
      type: 'explain',
      title: 'Place a tentative answer on every issue',
      content:
        'Once issues are surfaced, attach a tentative answer to each — that is the hypothesis.\n\nThe trap to avoid: "I will think once the data is in."\nThat path gets you lost in the data and timed out of the discussion.\n\nThe right move: "Here is my tentative answer," then sharpen it through validation.\n\nExample: "What is the main driver of the retention drop?"\n-> Tentative: "Likely delivery delays, especially among heavy users."\n-> Validation: cancellation survey, delivery-delay data, free-text analysis of churn reasons.\n\nA hypothesis is "fast if right, learning if wrong."\nWithout a hypothesis, research runs out the clock before reaching an answer.',
    },
    {
      type: 'quiz',
      question: 'What is the real purpose of placing a hypothesis on an issue?',
      options: [
        { label: 'To guess the right answer', correct: false },
        { label: 'To narrow data collection and maximize efficiency and learning', correct: true },
        { label: 'To impress your manager', correct: false },
        { label: 'To make a meeting look pre-decided', correct: false },
      ],
      explanation:
        'The hypothesis is not about being right — it is about focusing data collection. Even a wrong hypothesis leaves a trail of evidence that becomes the next clue.',
    },
    {
      type: 'explain',
      title: 'Build reasoning with deduction and induction',
      content:
        'A hypothesis gains weight only through reasoning.\n\nDeductive reasoning:\n- Principle: price and demand have a negative relationship.\n- Premise: our price increase is 10%, competitors are flat.\n- Conclusion: churn will be pushed up by several percentage points.\n\nInductive reasoning:\n- Case 1: Company A — churn +3% after a price rise.\n- Case 2: Company B — churn +2%.\n- Case 3: Company C — churn +4%.\n-> Our churn likely lands in the +2 to +4 range.\n\nEither way, keep "claim," "reasoning," and "fact" as separate pieces.\n\nThe sloppy version:\n"Retention is dropping because of delivery delays" -> followed by "therefore we should fix delivery delays."\nThat is circular — claim restated as reasoning.\n\nReal reasoning is what turns an issue into a "decision-driving" answer.',
    },
    {
      type: 'quiz',
      question: 'Which claim-and-reasoning pair is the most logically clean?',
      options: [
        { label: 'Claim: churn rises with a price increase / Reasoning: because churn rises with a price increase', correct: false },
        { label: 'Claim: churn rises with a price increase / Reasoning: goods with sub-zero price elasticity lose demand on price rises, and our SaaS product fits this profile', correct: true },
        { label: 'Claim: churn rises with a price increase / Reasoning: most people internally agree', correct: false },
        { label: 'Claim: churn rises with a price increase / Reasoning: I feel it from experience', correct: false },
      ],
      explanation:
        'Repeating the claim is circular. "Internal agreement" is argument from authority. Combining a general principle (elasticity) with a property of your own product yields a repeatable explanation.',
    },
    {
      type: 'explain',
      title: 'Separate facts from assumptions',
      content:
        'The most common collision when building reasoning is conflating facts and assumptions.\n\n[Fact]\nObservable and shared: "Last month\'s churn was 8.0%." "Foot traffic was 20,000."\n\n[Assumption]\nA tentative truth used to argue: "Customers are price-sensitive." "The market doubles in five years."\n\n[Opinion]\nJudgment or projection: "The trend will continue."\n\nReasoning that holds together follows: fact + assumption -> conclusion.\n\nCommon accidents:\n- Assumptions written as facts -> they go untested.\n- One fact generalized too far -> never argue from a single point.\n- Facts and opinions in the same sentence -> they bleed together.\n\nIn decks and memos, labeling each line "fact / assumption / opinion" tightens the argument noticeably.',
    },
    {
      type: 'explain',
      title: 'Use "So What" in three layers to reach the essence',
      content:
        'Data alone is not yet an answer.\nApply "So what?" three times to ladder from surface to essence — this is the heart of the course.\n\nExample: "New signups +30% last month, free-to-paid conversion 7%."\n\nSo What level 1 (surface):\n-> New is strong, but the conversion bottleneck is large.\n\nSo What level 2 (middle):\n-> Closing the gap to industry average (15%) would roughly double paid members from the same acquisition.\n\nSo What level 3 (essence):\n-> Investment priority shifts from "more acquisition" to "better free-to-paid experience design."\n-> Competitive advantage concentrates in the first 14 days of onboarding.\n\nOnly with three layers does an issue turn into a "decision in motion."\nThe gap between people who stop at level 1 and those who push to level 3 is exactly what "depth of thinking" means.',
      visual: 'SoWhatDiagram',
      outro:
        'Stack three layers of "So What" and data transforms into a "decision in motion." The gap between people who stop at the surface and people who push to essence is what "depth of thinking" really means. Getting in the habit of asking "so what?" three times in a row every time you look at data is the first step.',
    },
    {
      type: 'quiz',
      question:
        '"Heavy-user churn doubled from 3% to 7% in the last three months." Which is the deepest So What?',
      options: [
        { label: 'Churn among heavy users is rising', correct: false },
        { label: 'Heavy-user churn is rising, so we need to act', correct: false },
        { label: 'High-LTV core customers are leaking, and patching the hole with new acquisition will pull in lower-ROI cohorts', correct: true },
        { label: 'We should send heavy users a coupon', correct: false },
      ],
      explanation:
        'The first two are restatements of the fact; the last is a tactic. The middle option explains the structural cost — patching with new acquisition degrades ROI — which is what moves the next decision.',
    },
  ],
}

// ── Lesson 504: Weight Issues with Fermi Intuition ───────────
const issueFermi: LessonData = {
  id: 504,
  title: 'Weight Issues with Fermi Intuition — Validate with Numbers',
  category: 'Issue Setting',
  steps: [
    {
      type: 'explain',
      title: 'Score each issue on the order of magnitude it moves',
      content:
        'Coverage easily produces 5-10 issues.\nValidating all of them with equal energy burns through any timebox.\n\nThis is where "Fermi intuition" comes in: estimate each issue\'s impact at the order-of-magnitude level.\n\nExample: four issues on improving SaaS churn.\n\nIssue A: change the price\n-> Impact range: churn moves 1-2 pts × annual revenue ~ $1-2M.\n\nIssue B: redesign onboarding\n-> Impact range: first-month drop-off down 10 pts × new flow × LTV ~ $3M.\n\nIssue C: full UI redesign\n-> Impact: 20-pt improvement potential, but six-month build -> small in the short term.\n\nIssue D: support quality\n-> Impact: a few % via inquiry volume ~ $500K per year.\n\nIssues that differ by an order of magnitude do not need a debate to be prioritized.\nFermi is not about being "accurate," it is about aligning the room on relative size.',
    },
    {
      type: 'quiz',
      question: 'What is the best reason to use Fermi intuition when prioritizing issues?',
      options: [
        { label: 'To pin down exact numbers and silence the room', correct: false },
        { label: 'To align the discussion on the order-of-magnitude impact of each issue', correct: true },
        { label: 'To look fast at math', correct: false },
        { label: 'To avoid asking the data team', correct: false },
      ],
      explanation:
        'Fermi\'s value is shared sense of scale. Once everyone agrees "this is a $1M issue, that is a $10M issue, the other is $100M," the priority order takes care of itself.',
    },
    {
      type: 'explain',
      title: 'Sharpen issues with sensitivity analysis',
      content:
        'Any Fermi estimate ultimately leans on assumptions.\nSensitivity analysis is what makes those assumptions accountable.\n\nSteps:\n1. Sweep each assumption in conservative / base / optimistic cases.\n2. Identify the assumption whose movement changes the order of magnitude of the answer.\n3. Promote that assumption to a "most important issue."\n\nExample: onboarding-improvement impact estimate.\n- New monthly inflow: 3,000 (fact).\n- Drop-off improvement: 3 / 10 / 20 pts (conservative / base / optimistic).\n-> Tiny in the conservative case, large in the optimistic one.\n\nThat spread is the uncertainty in the lever.\nThe right move to close it is researching "the actual improvement range competitors achieved with onboarding work."\n\nSensitivity makes the next research target self-evident.',
    },
    {
      type: 'quiz',
      question:
        'For "next year — labor cost +1% -> profit +5%; market size +1% -> profit +0.2%," what does the sensitivity analysis say?',
      options: [
        { label: 'Market size matters more than labor cost', correct: false },
        { label: 'Labor cost has 5x higher sensitivity and is therefore the leading candidate for top issue', correct: true },
        { label: 'They are equally important', correct: false },
        { label: 'Sensitivity analysis is a numerical game and not useful', correct: false },
      ],
      explanation:
        'Sensitivity surfaces the assumptions that swing the answer. With labor cost driving profit five times harder than market size, it carries the heavier issue weight and deserves priority research.',
    },
    {
      type: 'explain',
      title: 'Not estimation as a standalone skill — but as issue weighting',
      content:
        'Worth contrasting with the Fermi course explicitly.\n\n[fermi-01 (Fermi Estimation course)]\n-> Build the standalone skill: set up equations, decompose, and estimate market size or demand.\n\n[This lesson]\n-> Use Fermi to weight which issue to investigate, not to estimate something for its own sake.\n\nIn consulting and corporate strategy, Fermi is a means, not an end.\nIt is the sense of scale that determines which issue moves the order of magnitude of the decision — and it leads directly into validation and decisions afterwards.\n\nPeople who skip the estimation step end up with every issue marked "looks important." Putting orders of magnitude on the page is what unlocks real discussion.',
    },
    {
      type: 'quiz',
      question:
        'A new-business memo says "market size is reasonably large" and stops there. What would you add?',
      options: [
        { label: 'Ask your manager for an opinion', correct: false },
        { label: 'Place the core assumptions (customers × price × frequency), produce an order-of-magnitude estimate ($10M / $100M / $1B), and call out the highest-sensitivity assumption', correct: true },
        { label: 'Argue from gut feel whether to enter the market', correct: false },
        { label: 'Substitute a single competitor case for market size', correct: false },
      ],
      explanation:
        '"Reasonably large" does not move an issue. Add tentative assumptions, an order of magnitude, and the most sensitive driver — and the memo turns into something a decision can run on.',
    },
  ],
}

// ── Lesson 505: Tackling Unfamiliar Themes ───────────────────
const issueUnfamiliar: LessonData = {
  id: 505,
  title: 'Tackling Unfamiliar Themes — Patterns for Setting Issues',
  category: 'Issue Setting',
  steps: [
    {
      type: 'explain',
      title: 'The first move when entering an unfamiliar industry',
      content:
        'The procedure for setting issues in a new industry, a new business, or a social problem is roughly the same every time.\n\n1. Sketch the rough map of the industry (players, money flows, key KPIs).\n2. Lock in "who is taking the decision" (your company / client position).\n3. Place common cross-industry issues (entry, differentiation, profit structure).\n4. Overwrite with the situation\'s unique issues.\n5. Structure how those issues relate to each other.\n\nDo not aim for completeness in the sketch stage.\nA single industry report + one experienced contact + the client\'s financial statements is more than enough for the first day.\n\nWith this pattern, you can move hands from day one even in unfamiliar territory.',
    },
    {
      type: 'quiz',
      question:
        'On day one of a client engagement in a brand-new industry, which is the highest-value move?',
      options: [
        { label: 'Immediately start gathering detailed data', correct: false },
        { label: 'In 30 minutes, sketch the players, money flows, and key KPIs, then place three tentative issues', correct: true },
        { label: 'Say "please teach me" and stay silent', correct: false },
        { label: 'Talk about your previous industry to fill air time', correct: false },
      ],
      explanation:
        'Day one\'s highest leverage is sketching the rough map. Once a rough map exists, decisions about what to ask and what to dig into become trivial — and day two and beyond accelerates fast.',
    },
    {
      type: 'explain',
      title: 'Borrow from structurally similar cases',
      content:
        'A real superpower in unfamiliar territory is spotting "known cases with the same shape."\n\nExample: a regional traditional-craft maker wants to grow on e-commerce.\n\nNo direct experience needed — similar-shape cases are everywhere:\n- Niche-publisher EC launches.\n- Regional specialty foods sold direct online.\n- Artisanal-food D2C brands.\n\nShared issues:\n- Low-volume, high-ticket fulfilment operations.\n- Pairing story content with the SKU.\n- Surfacing and retaining existing fans.\n\nDifferent industries can share the same underlying structure.\nThe habit of asking "what known case shares this shape?" is the strongest tool in unfamiliar work.',
    },
    {
      type: 'quiz',
      question: 'What matters most when using analogies for issue setting?',
      options: [
        { label: 'Only borrow from the same industry', correct: false },
        { label: 'Check whether the structure (players, cost base, axis of differentiation) actually matches', correct: true },
        { label: 'Drop in the successful precedent as-is', correct: false },
        { label: 'Avoid overseas cases', correct: false },
      ],
      explanation:
        'Analogy works when structure matches, not when the surface industry matches. Compare cost base, customer behavior, and differentiation axis — that is where transferable lessons live.',
    },
    {
      type: 'explain',
      title: 'The courage to place tentative answers without first-hand data',
      content:
        'In new territory, you usually do not have data on hand.\nThe people who freeze waiting for data and the people who place a tentative answer and then validate are visibly different by day three.\n\nHow to place a tentative answer:\n- Flag it as tentative ("Market size ~$500M (mid-point of Source A\'s estimate — needs validation)").\n- Show a confidence range ("growth rate 5-10%").\n- Always pair it with a validation step ("confirm with three expert interviews").\n\nA tentative answer is not a guess.\n"Given what I have today, this is what I can say. I will update once X comes in" is how you keep the discussion moving.\n\nBetter than silence: a tentative answer.\nBetter than that: a tentative answer with a validation step attached.',
    },
    {
      type: 'quiz',
      question: 'Which is the best-formed tentative answer when first-hand data is missing?',
      options: [
        { label: '"I don\'t know yet, so I won\'t write anything"', correct: false },
        { label: 'State "market size $500M" with no caveats', correct: false },
        { label: '"Market size ~$500M (mid-point of Source A report, expert interviews scheduled next week)"', correct: true },
        { label: 'Use your manager\'s gut number as-is', correct: false },
      ],
      explanation:
        'A useful tentative answer is the three-pack: number, source, validation action. With those three present, you move from "guessing" to "moving forward responsibly."',
    },
    {
      type: 'explain',
      title: 'How this differs from client-03',
      content:
        'Ramping up in a new industry is also covered in client-03 ("Ramp up fast in an unfamiliar industry").\n\nclient-03: how to ramp up using books, cases, experts, and hypotheses overall.\nThis lesson: once you are ramping up, narrow specifically to the pattern of "how to set issues."\n\nThink of client-03 as the wide-angle view of stepping into new territory, and this lesson as the narrow, high-precision view of issue setting.\nWhen you can move between the two, day-one starts (client-03) flow seamlessly into week-one and week-two issue design (this lesson), and then into validation and output.',
    },
  ],
}

// ── Lesson 506: Lead the Room — Issue Paper and Facilitation ─
const issueFacilitate: LessonData = {
  id: 506,
  title: 'Lead the Room — Issue Paper and Facilitation Practice',
  category: 'Issue Setting',
  steps: [
    {
      type: 'explain',
      title: 'Consolidate issues, hypotheses, reasoning, and interpretation onto one page',
      content:
        'All of the issues, hypotheses, reasoning, and So-Whats from the previous lessons land, in the end, on a single "issue paper."\n\nBasic structure of an issue paper:\n\n1. Top-level question (what decision is this paper for).\n2. Three to five main issues (top branches of the issue tree).\n3. Current hypothesis for each issue.\n4. Main reasoning (deductive or inductive).\n5. Order-of-magnitude weight (Fermi intuition).\n6. So What (what to do as a result).\n7. Remaining items to verify (what comes next).\n\nOn one page, "what needs to be decided to move forward" is instantly visible.\nIf a meeting deck runs to 10-20 slides, that is a signal that issues are not yet defined.',
    },
    {
      type: 'quiz',
      question: 'Which is the strongest condition for a good issue paper?',
      options: [
        { label: 'Pack in as much information as possible', correct: false },
        { label: '"What needs to be decided to move forward" is obvious at first glance', correct: true },
        { label: 'It conveys how hard the author worked', correct: false },
        { label: 'It uses many specialist terms', correct: false },
      ],
      explanation:
        'An issue paper is a tool to move discussion. Its value is measured not in volume but in whether the reader instantly sees the question and the current placeholder answer.',
    },
    {
      type: 'explain',
      title: 'Run meetings issue-first',
      content:
        'Once an issue paper exists, meetings change shape.\n\nBefore:\n- Read through the deck from the top.\n- "Wait, what are we deciding?" mid-meeting.\n- End with no one sure what got decided.\n\nAfter (issue-first):\n1. In the first minute, name the issue this meeting will decide ("Today we decide whether to raise prices for next year").\n2. Share the hypothesis and reasoning (5-10 minutes).\n3. Receive pushback "as which branch of the issue tree it lands on."\n4. Close by confirming what was decided, what was not, and what is next.\n\nIssue-first meetings are faster — and kinder to everyone in the room.',
    },
    {
      type: 'quiz',
      question: 'In an issue-first meeting, what is the very first thing the facilitator must do?',
      options: [
        { label: 'Read out the entire deck', correct: false },
        { label: 'State explicitly the issue this meeting will answer', correct: true },
        { label: 'Cut off long talkers', correct: false },
        { label: 'Announce the conclusion up front', correct: false },
      ],
      explanation:
        'When the room does not share "the issue we are answering today" up front, the meeting almost certainly drifts. A 30-60 second framing of the issue changes the quality of every subsequent statement.',
    },
    {
      type: 'explain',
      title: 'Bring tangents back to the issue',
      content:
        'Real meetings always drift. Bringing them back to the issue is where facilitation actually lives.\n\nUseful phrases:\n- "Interesting issue — that sits on this branch of the tree."\n  -> Repositions the tangent rather than rejecting it.\n- "What we are discussing now is actually issue B rather than A. Shall we close A later and finish B first?"\n  -> Explicit permission to swap parallel issues.\n- "Let\'s park that as a separate issue on the open-items list."\n  -> Preserves the discussion without losing the main thread.\n\nNever villainize the tangent.\n"Your issue matters — it is just not today\'s issue" is the phrase that keeps meetings productive.',
    },
    {
      type: 'think',
      question:
        '[Workshop — produce a one-page issue paper for a real theme]\n\nFor the situation below, write the three to five main issues you would put on a one-page issue paper, and the tentative answer you would place on each.\n\nSituation:\nYou run a monthly-subscription online learning service.\n- Recent metrics: monthly signups +30%, free-to-paid conversion 7% (industry average 15%), monthly churn 5% (industry average 3%).\n- The leadership team is starting to say "double the ad budget to push new acquisition."\n- You sense something is off.\n\nUse a one-page issue paper to steer the leadership discussion in a healthier direction.',
      hint: 'Think in four blocks per issue: "issue," "hypothesis," "reasoning (numbers)," "So What." Weight the bottleneck across acquisition / conversion / retention using Fermi intuition first, then narrow to three to five main issues.',
      modelAnswer:
        '[Top-level question]\nShould we double the ad budget as-is, or shift investment weight elsewhere?\n\n[Three main issues]\n\nIssue 1: Is the biggest bottleneck right now acquisition, conversion, or retention?\n  Hypothesis: Not acquisition — the bottleneck is "conversion + retention."\n  Reasoning: New inflow is +30% YoY (plenty of firepower). Free-to-paid 7% is half of the industry average of 15%, and churn 5% is ~1.7x the industry average of 3%. We are pouring water into a leaky bucket.\n  So What: Doubling ads is "more water," and ROI is likely to deteriorate.\n\nIssue 2: What moves conversion from 7% toward 15%?\n  Hypothesis: First-month experience design (onboarding, first success) is the main driver.\n  Reasoning: Industry case studies show onboarding overhauls lift conversion by +5 to +10 pts across multiple cases.\n  So What: Investing in experience design could roughly double paid members from the same inflow.\n\nIssue 3: What moves churn from 5% toward 3%?\n  Hypothesis: The dominant driver is likely "lack of continued-learning mechanisms" or "support quality."\n  Reasoning: Cancellation survey not yet collected — placeholder. Survey + data analysis needed to firm up.\n  So What: Pulling churn toward the industry average lifts LTV materially, which also lifts ad ROI automatically.\n\n[Overall So What]\nInvestment priority is not "double ads," but "(1) onboarding experience design (2) churn-reason analysis + continuation support." Ads regain leverage after those two are in place.\n\n[Next validation steps]\n- Design the cancellation survey -> identify top three churn reasons within one week.\n- Benchmark conversion-improvement cases at peer companies -> firm up the improvement range within two weeks.\n- Revisit the investment-allocation decision once both inputs are in.',
      points: [
        'MECE-split into acquisition / conversion / retention before weighting',
        'Compare conversion and churn against industry averages to surface order-of-magnitude bottlenecks',
        'Make explicit that "doubling ads" lives on a different layer than conversion and retention',
        'Flag the churn line as "survey not yet collected" — the placeholder plus a validation action',
        'Close with "what to do" plus "what to validate next"',
      ],
    },
    {
      type: 'explain',
      title: 'Course wrap — the power to reach the answer through issues',
      content:
        'Four steps you have built in this course:\n\n1. Surface issues comprehensively (MECE, 5W1H, stakeholders, shake-ups).\n2. Structure the issues (issue tree, granularity, deduction / induction).\n3. Attach hypotheses and reasoning (So What in three layers to reach the essence).\n4. Validate with numbers (Fermi intuition and sensitivity).\n\nIn this lesson, all four came together in an issue paper and meeting practice.\n\nThe through-line is this: you now have a pattern that reaches a coherent answer with logic, even in territory you have no experience in.\n\nDepth of thinking = coverage of issues × precision of structure × sharpness of interpretation.\n\nWith the pattern in hand, every real-world rep at the office will sharpen the precision further.',
    },
  ],
}

export const issueLessonMapEn: Record<number, LessonData> = {
  500: issueWhatIs,
  501: issueExhaustive,
  502: issueStructure,
  503: issueHypothesis,
  504: issueFermi,
  505: issueUnfamiliar,
  506: issueFacilitate,
}
