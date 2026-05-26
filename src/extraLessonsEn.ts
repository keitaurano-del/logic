// extraLessonsEn.ts — additional lessons for course expansion (IDs 300-316)
// English version
import type { LessonData } from './lessonData'

// ── Critical Thinking Course 2 ──────────────────────
const criticalBias2: LessonData = {
  id: 300,
  title: 'Escape confirmation bias',
  category: 'Critical Thinking',
  steps: [
    { type: 'explain', title: 'What confirmation bias is', content: 'People tend to gather only information that supports their beliefs and ignore evidence that refutes them. This is confirmation bias. [icon:bad] Hoarding supporting information, [icon:good] versus hunting for counter-evidence — switching to the latter stance is the core of critical thinking.\n\n:::point\nThe habit of intentionally seeking counter-evidence is what breaks confirmation bias.\n:::' },
    { type: 'quiz', question: 'What\'s the most effective way to prevent confirmation bias?', options: [
      { label: 'Hold no opinions', correct: false },
      { label: 'Intentionally seek counterarguments and counter-evidence', correct: true },
      { label: 'Collect more data', correct: false },
      { label: 'Rely only on expert opinions', correct: false },
    ], explanation: 'The remedy for confirmation bias is acting as a Devil\'s Advocate — intentionally hunting counterarguments. Quality and diversity matter more than data volume.' },
  ],
}

const criticalAnchor: LessonData = {
  id: 301,
  title: 'Notice the anchoring effect',
  category: 'Critical Thinking',
  steps: [
    { type: 'explain', title: 'What anchoring is', content: 'A cognitive bias where the first number or piece of information presented (the anchor) disproportionately shapes subsequent judgment. Especially important in negotiation and decision-making.' },
    { type: 'quiz', question: 'In the ad "regularly $100, now only $30," which part is the anchor?', options: [
      { label: 'The "now only" framing of urgency', correct: false },
      { label: 'The opening "$100" number', correct: true },
      { label: 'The actual "$30" price', correct: false },
      { label: 'The discount rate (70% off)', correct: false },
    ], explanation: 'The "$100" anchor makes "$30" feel like a deal. The first number becomes the reference point ahead of any independent value judgment.' },
  ],
}

const criticalFraming: LessonData = {
  id: 302,
  title: 'See through framing effects',
  category: 'Critical Thinking',
  steps: [
    { type: 'explain', title: 'What framing is', content: 'A phenomenon where the same content is judged differently depending on how it is "framed." "90% survival rate" and "10% mortality rate" are the same fact, but feel very different.' },
    { type: 'quiz', question: 'What\'s the most effective way to avoid being misled by framing?', options: [
      { label: 'Trust intuition over numbers', correct: false },
      { label: 'Rephrase the wording and check if the content is the same', correct: true },
      { label: 'Assume the speaker\'s intent', correct: false },
      { label: 'Always pick the positively framed version', correct: false },
    ], explanation: 'Rephrase "90% survival" as "10% mortality." If it\'s the same fact, judgment shouldn\'t change. The habit of conversion to confirm essence is key.' },
  ],
}

const criticalSunk: LessonData = {
  id: 303,
  title: 'Escape the sunk-cost trap',
  category: 'Critical Thinking',
  steps: [
    { type: 'explain', title: 'What sunk cost is', content: 'A bias where past, irrecoverable time, money, and effort drag you into irrational decisions.\n\n:::warn\nThe feeling of "wasting it" obstructs sound judgment. Decide on future value, not the past you can\'t recover.\n:::' },
    { type: 'quiz', question: 'A new feature you spent two years developing turns out to lack market demand. Which decision avoids the sunk-cost trap?', options: [
      { label: 'Release it because we spent two years on it', correct: false },
      { label: 'Ignore past costs; judge purely on future value', correct: true },
      { label: 'Spend another six months refining it — surely it will work', correct: false },
      { label: 'Release it for team morale', correct: false },
    ], explanation: 'Past costs don\'t come back regardless of your decision. What matters is the value judgment from "this point forward." Prioritize rational future judgment over emotional regret.' },
  ],
}

// ── Hypothesis Thinking Course 1 add-on ─────────────────────────────
const hypothesisAbduction: LessonData = {
  id: 304,
  title: 'Leap with abduction',
  category: 'Hypothesis Thinking',
  steps: [
    { type: 'explain', title: 'What abduction (inference to the best explanation) is', content: 'Not deduction or induction, but "selecting the hypothesis that best explains the current situation." Proposed by C.S. Peirce and also called "Inference to the Best Explanation." It\'s the process of choosing, among multiple candidate hypotheses, the one that most reasonably accounts for current observations — the kind of instant narrowing-down that consultants and doctors perform when they see one data point and intuit "the cause is probably XX."\n\n:::point\nRather than waiting for complete data, abduction picks the most explanatory hypothesis first, from the information you already have.\n:::' },
    { type: 'quiz', question: 'Sales suddenly dropped 20%. Which is the most appropriate abductive approach?', options: [
      { label: 'Collect all data before considering the cause', correct: false },
      { label: 'Among multiple possible causes, select the one that best explains current conditions as the hypothesis', correct: true },
      { label: 'Repeat past success patterns', correct: false },
      { label: 'Report to your boss and wait for instructions', correct: false },
    ], explanation: 'Abduction doesn\'t wait for "data to be complete." From current information, choose the hypothesis that best explains the situation. The core is narrowing among candidates (competitor product, internal quality issue, seasonality, etc.) to the best explanation.' },
  ],
}

// ── Problem Setting Course 1 add-on ─────────────────────────────
const problemDoubleLoop: LessonData = {
  id: 305,
  title: 'Change the "way you ask," not the "way you solve"',
  category: 'Problem Setting',
  steps: [
    { type: 'explain', title: 'What double-loop learning is', content: 'Single-loop improves "how to solve" the problem. Double-loop changes "the premise / the question itself." Essential problem-solving emerges from the double loop.\n\n:::tip\nWhen improvements keep stalling, question the premise itself rather than the way you solve.\n:::' },
    { type: 'quiz', question: 'You\'ve been running initiatives on the assumption "more sales visits → more sales," but nothing improves. Which is the most appropriate double-loop reframing?', options: [
      { label: 'Increase visit count further', correct: false },
      { label: 'Introduce tools that boost visit efficiency', correct: false },
      { label: 'Question the premise that "visit count correlates with sales"', correct: true },
      { label: 'Swap out the sales rep', correct: false },
    ], explanation: 'Improving the initiative (single loop) vs. questioning the premise itself (double loop). Doubting the premise reveals an entirely different solution.' },
  ],
}

const problemReframe: LessonData = {
  id: 306,
  title: 'Reframe the question to find a breakthrough',
  category: 'Problem Setting',
  steps: [
    { type: 'explain', title: 'What question reframing is', content: 'For the same situation, changing "how you ask" changes the solution. "Why is the phone hold time long?" is closer to root cause than "how do we shorten phone hold times?" — but reframing to "Why do customers need to call at all?" goes further.' },
    { type: 'quiz', question: 'Which reframe of "why does our team have so much overtime?" is most useful?', options: [
      { label: '"How can we reduce overtime?"', correct: false },
      { label: '"Who is doing the most overtime?"', correct: false },
      { label: '"What should we drop to deliver the same outcome without overtime?"', correct: true },
      { label: '"What is the cost of overtime in dollars?"', correct: false },
    ], explanation: 'Reframing changes the premise of the question. From "how to reduce overtime" to "what to change to produce results without overtime." Different question → broader solution space.' },
  ],
}

// ── Design Thinking Course 1 add-on ───────────────────
const designHMW: LessonData = {
  id: 307,
  title: 'Frame questions as "How Might We?"',
  category: 'Design Thinking',
  steps: [
    { type: 'explain', title: 'What HMW (How Might We) is', content: 'A question pattern — "How might we... ?" — that converts a problem into a solvable inquiry. It transforms constraint-statements ("we can\'t...") into possibility-expanding questions.', visual: 'ThreePillarsDiagram', visualProps: {
      sectionLabel: 'HMW — the three words that frame the question',
      pillars: [
        { icon: 'H', title: 'How (in what way)', body: 'Point toward a solution and make it action-oriented' },
        { icon: 'M', title: 'Might (could we)', body: 'Stay open, not decisive. Allow many possible answers' },
        { icon: 'W', title: 'We (the team)', body: 'Set a subject who owns the problem' },
      ],
      hint: 'Recast a constraint as "how might we... ?" and possibilities open up',
    } },
    { type: 'quiz', question: 'Reframe the issue "users don\'t stay in the app" as an HMW. Which is best?', options: [
      { label: '"Why don\'t users stay?"', correct: false },
      { label: '"How might we make users want to use this every day?"', correct: true },
      { label: '"How do we raise retention by 30%?"', correct: false },
      { label: '"What\'s the retention rate of competing apps?"', correct: false },
    ], explanation: 'HMW converts a question to a positive, action-able form. Not "why is X not happening" (cause-seeking) but "how might we make Y happen" (possibility exploration) — the latter unlocks creative solutions.' },
  ],
}

const designTest: LessonData = {
  id: 308,
  title: 'Test fast, learn fast',
  category: 'Design Thinking',
  steps: [
    { type: 'explain', title: 'The importance of testing and iterating', content: 'The core of design thinking is not "build it perfectly, then test" but "test rough, then polish." Failure is learning. The cheaper and faster you test, the faster you reach the essential answer.', visual: 'DesignThinkingCycleDiagram' },
    { type: 'quiz', question: 'Which is the most design-thinking approach to validating a new feature idea?', options: [
      { label: 'Fully build it, then user-test', correct: false },
      { label: 'Sketch the screens on paper and show users', correct: true },
      { label: 'Confirm needs through a survey', correct: false },
      { label: 'Release if it\'s well-received internally', correct: false },
    ], explanation: 'Paper prototypes take hours and let you check user reactions immediately. The cheap-test, fast-learn, iterate cycle is the heart of design thinking.' },
  ],
}

// ── Lateral Thinking Course 1 add-on ───────────────────
const lateralPMI: LessonData = {
  id: 309,
  title: 'Use PMI to expand perspective deliberately',
  category: 'Lateral Thinking',
  steps: [
    { type: 'explain', title: 'What PMI is', content: 'Plus / Minus / Interesting — evaluating an idea from these three angles. Proposed by Edward de Bono. Adding "Interesting" produces thinking that goes beyond fixed binary opposition.', visual: 'ThreePillarsDiagram', visualProps: {
      sectionLabel: 'PMI — three angles on an idea',
      pillars: [
        { icon: 'P', title: 'Plus', body: 'List the upsides and benefits of the idea' },
        { icon: 'M', title: 'Minus', body: 'List the downsides, risks, and drawbacks' },
        { icon: 'I', title: 'Interesting', body: 'List what is intriguing, beyond good or bad' },
      ],
      hint: 'Adding "Interesting" lets you think past the for-or-against binary',
    } },
    { type: 'quiz', question: 'Apply PMI to "make all employees work from home 3 days a week." Which is the best Interesting?', options: [
      { label: 'Reduced commuting costs (cost savings)', correct: false },
      { label: 'Communication may decrease (risk)', correct: false },
      { label: 'Possibility opens up to hire excellent talent in regional areas', correct: true },
      { label: 'Office electricity bill drops', correct: false },
    ], explanation: 'Interesting is not good or bad — it\'s "new possibilities or noticings." Hiring outside major cities only becomes realistic because of remote work. That\'s the new possibility.' },
  ],
}

const lateralRandom: LessonData = {
  id: 310,
  title: 'Use random input to leap',
  category: 'Lateral Thinking',
  steps: [
    { type: 'explain', title: 'What random input is', content: 'A creative-thinking method that forcibly combines totally unrelated random words or images with the problem you\'re trying to solve. It deliberately breaks the brain\'s existing patterns and produces unexpected ideas.' },
    { type: 'quiz', question: 'When brainstorming "a new coffee shop concept," which idea best fits a random input of "library"?', options: [
      { label: 'Add more coffee varieties', correct: false },
      { label: 'A members-only café where you can stay long, read, and stay quiet', correct: true },
      { label: 'Make it takeout-only', correct: false },
      { label: 'Design it to be social-media-photogenic', correct: false },
    ], explanation: 'The unrelated input "library" evokes "quiet, long stays, knowledge" — and produces the concept of a members-only intellectual-space café. Forced association is the heart of lateral thinking.' },
  ],
}

// ── Analogical Thinking Course 1 add-on ───────────────────────
const analogyMapping: LessonData = {
  id: 311,
  title: 'Map structure to borrow solutions',
  category: 'Analogical Thinking',
  steps: [
    { type: 'explain', title: 'What structural mapping is', content: 'The core of analogy is finding structural similarity, not surface similarity. [icon:bad] Looks alike, [icon:good] versus works the same way — aim for the latter. "Military supply systems" and "supply chain management" share structure across very different fields. Explicitly mapping structure makes the analogy usable.' },
    { type: 'quiz', question: 'Apply the analogy of "the immune system (the body\'s defense)" to organizational security. Which has the most structural correspondence?', options: [
      { label: 'White blood cells → all employees', correct: false },
      { label: 'Immune memory → past incident records and response playbooks', correct: true },
      { label: 'Fever → server load', correct: false },
      { label: 'Skeleton → office buildings', correct: false },
    ], explanation: 'Immune memory (faster response based on remembered past attacks) corresponds structurally to incident-response history feeding security improvement. Match by functional role, not surface.' },
  ],
}

const analogyCross: LessonData = {
  id: 312,
  title: 'Bring success patterns from distant fields',
  category: 'Analogical Thinking',
  steps: [
    { type: 'explain', title: 'The power of cross-field analogy', content: 'The most powerful analogies come from "distant fields." Nearby fields are mostly already referenced. Sport, military, biology, architecture — borrowing success patterns from unrelated fields produces solutions competitors won\'t think of.' },
    { type: 'quiz', question: 'Which cross-field concept structurally most resembles a startup\'s "pivot" strategy?', options: [
      { label: 'Architectural design changes', correct: false },
      { label: 'Biological adaptive evolution (changing traits in response to environmental change)', correct: true },
      { label: 'Recipe revision in cooking', correct: false },
      { label: 'Military retreat', correct: false },
    ], explanation: 'Adaptive evolution has the structure "environmental change → trait change → survival." A pivot follows "market change → business model change → growth." Adaptation and change form the essential similarity.' },
  ],
}

// ── Systems Thinking Course 1 add-on ───────────────────
const systemsArchetype: LessonData = {
  id: 313,
  title: 'Use system archetypes to spot common traps',
  category: 'Systems Thinking',
  steps: [
    { type: 'explain', title: 'What system archetypes are', content: 'Recurring structural patterns that appear in organizations and society are called system archetypes. Examples: "Limits to Growth," "Fixes that Fail," "Shifting the Burden," "Tragedy of the Commons." Knowing the archetypes lets you quickly see the essence of complex problems.', visual: 'SystemArchetypeDiagram' },
    { type: 'quiz', question: 'A pattern where "applying a symptomatic fix produces a side effect that, in turn, worsens the original problem" — which system archetype is this?', options: [
      { label: 'Limits to Growth', correct: false },
      { label: 'Fixes that Fail', correct: true },
      { label: 'Tragedy of the Commons', correct: false },
      { label: 'Drifting Goals', correct: false },
    ], explanation: '"Fixes that Fail" is the structure where a symptomatic fix temporarily eases the problem, but its side effects accumulate and worsen the original problem — e.g., bug fixes that breed new bugs in an architecturally fragile system. Note that "Shifting the Burden" — where symptomatic treatment delays root-cause work — is a similar but distinct archetype.' },
  ],
}

const systemsLeverage: LessonData = {
  id: 314,
  title: 'Find leverage points to drive change',
  category: 'Systems Thinking',
  steps: [
    { type: 'explain', title: 'What leverage points are', content: 'Places in a system where "small changes produce large effects" are called leverage points. Proposed by Donella Meadows. Goals, rules, information flows, and feedback structures carry high leverage. Changing system purpose or structure has greater impact than changing surface-level numbers.', visual: 'LeveragePointsDiagram' },
    { type: 'quiz', question: 'Which is expected to be the highest-leverage move to change an underperforming organization?', options: [
      { label: 'Raise everyone\'s salary by 10%', correct: false },
      { label: 'Change the evaluation metric (KPI) from sales to customer satisfaction', correct: true },
      { label: 'Ban overtime', correct: false },
      { label: 'Change the office layout', correct: false },
    ], explanation: 'Changing evaluation metrics fundamentally changes "what counts as success" — the organization\'s information flow and behavior baseline. Changing goal-setting and information flow is higher leverage than changing numbers or rules.' },
  ],
}

// ── Client Work Course 2 add-on ───────────────────
const clientPresentation: LessonData = {
  id: 315,
  title: 'Convey the situation in 30 seconds — the elevator pitch',
  category: 'Client Work',
  steps: [
    { type: 'explain', title: 'What an elevator pitch is', content: 'An exercise that imagines accidentally meeting an executive in an elevator and conveying your proposal in 30 seconds. Compress "issue → solution → expected impact → next action" into 30 seconds. In client work the basics are "short, clear, action-driving."' },
    { type: 'quiz', question: 'A client asks you in the hallway, "How\'s the recent investigation going?" Which elevator pitch response is best?', options: [
      { label: 'It\'s not organized yet — I\'ll email later', correct: false },
      { label: 'A 3-company comparison shows your NPS is the lowest in the industry. Next week I\'ll bring a proposal with improvement actions', correct: true },
      { label: 'Looking at the data there are various trends, so first from angle A I\'m considering B…', correct: false },
      { label: 'Going well — thank you', correct: false },
    ], explanation: 'In one sentence: "finding (NPS lowest) → implication (a problem) → next action (proposal next week)." Hallway moments are also important opportunities. Sharp and short, with a clear next step.' },
  ],
}

// ── Case Interview Course 1 add-on ───────────────────────────
const caseSynthesis: LessonData = {
  id: 316,
  title: 'Synthesize the analysis into a recommendation',
  category: 'Case Interview',
  steps: [
    { type: 'explain', title: 'The case interview\'s final step: synthesis and recommendation', content: 'Case interviews are not graded only on analytical skill. The most important point is "can you synthesize your analysis and produce a clear recommendation?" The required closing structure is "Therefore... we should... For three reasons: (1) (2) (3)."', visual: 'PyramidDiagram', visualProps: {
      conclusion: { label: 'Recommendation', body: 'We recommend entering the market' },
      claims: [
        { label: 'Reason 1', body: 'Market size' },
        { label: 'Reason 2', body: 'Competitive edge' },
        { label: 'Reason 3', body: 'Feasibility' },
      ],
      evidence: [
        ['The market is growing', 'Latent demand is large'],
        ['Our strengths apply', 'We can differentiate'],
        ['Resources are secured', 'Exit risk is low'],
      ],
      hint: 'Lead with the conclusion, support it with three reasons. A vague close is the biggest deduction',
    } },
    { type: 'quiz', question: 'At the end of a market-entry case, you\'re asked "should we enter or not?" What\'s the best closing?', options: [
      { label: 'Balance pros and cons; conclude that the final decision is up to the company', correct: false },
      { label: '"I recommend entry. Three reasons: market size, competitive advantage, and feasibility."', correct: true },
      { label: 'Say more data is needed before judging', correct: false },
      { label: 'Introduce multiple analogous past cases and end', correct: false },
    ], explanation: 'In case interviews, "fuzzy conclusions" are the biggest deduction. Even with uncertainty, produce a clear recommendation and structure the rationale.' },
  ],
}

export const extraLessonMapEn: Record<number, LessonData> = {
  300: criticalBias2,
  301: criticalAnchor,
  302: criticalFraming,
  303: criticalSunk,
  304: hypothesisAbduction,
  305: problemDoubleLoop,
  306: problemReframe,
  307: designHMW,
  308: designTest,
  309: lateralPMI,
  310: lateralRandom,
  311: analogyMapping,
  312: analogyCross,
  313: systemsArchetype,
  314: systemsLeverage,
  315: clientPresentation,
  316: caseSynthesis,
}
