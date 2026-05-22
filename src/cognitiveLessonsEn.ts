import type { LessonData } from './lessonData'

// ========================================
// Cognitive Science Lessons (ID: 700-704, 710-714)
// Course A: cognitive-01 — Working memory (700-704)
// Course B: cognitive-02 — Applied cognitive biases (710-714)
// ========================================

// ── Course A: cognitive-01 ──────────────────────────

const workingMemoryLimit: LessonData = {
  id: 700,
  title: 'Working Memory: The 7±2 Limit',
  category: 'Cognitive Science',
  steps: [
    {
      type: 'explain',
      title: "The magical number 7±2",
      content:
        "Working memory is the brain's 'work desk' where you hold and process information temporarily.\n\nIn 1956, psychologist George Miller published 'The Magical Number Seven, Plus or Minus Two,' showing that humans can hold only 5–9 chunks of information at once.\n\nEveryday examples:\n• Phone numbers split into chunks (e.g., 090-1234-5678)\n• Postal codes broken into blocks (e.g., 12345-6789)\n• Credit cards grouped in sets of 4 digits\n\nWhy split them up?\nPeople cannot remember 11 random digits in a row, but 3–4-digit groups stay within capacity. The unit of capacity is 'chunk count,' not 'digit count.'\n\nBusiness implications:\n• Cap meeting topics at 5 items\n• Keep presentation messages to 3\n• If your to-do list passes 10 items, reorganize",
      visual: 'ThreePillarsDiagram',
    },
    {
      type: 'quiz',
      question: 'What does the 7±2 rule refer to?',
      options: [
        { label: 'The total number of characters or digits you can hold', correct: false },
        { label: 'The number of meaningful chunks you can hold at once', correct: true },
        { label: 'The minutes for short-term to transfer to long-term', correct: false },
        { label: 'The number of visual elements you can attend to simultaneously', correct: false },
      ],
      explanation:
        "Miller's limit is about chunk count, not raw digits or characters. The same 11-digit number is hard as '09012345678' but easy as '090-1234-5678' because the 3 chunks fit in capacity. Option 1 (counting raw data before chunking) is the most common misreading.",
    },
    {
      type: 'explain',
      title: 'Modern research suggests 4±1',
      content:
        "Miller's 7±2 is famous, but research since the 2000s (notably Cowan 2001) puts pure working memory capacity closer to 4±1.\n\nWhy 7±2 looked larger:\n• Participants silently rehearsed (subvocal repetition)\n• They chunked already-known words\n• Long-term memory assisted retrieval\n\nPure capacity is smaller than people think:\n• Meaningless words → break down around 4 items\n• Abstract concepts → the 4th tends to slip when you list 3\n• Digits → 4–5 without rehearsal\n\nPractical implications:\n• Three points stick best\n• More than 5 options slow decision-making\n• Slide bullets are best at 3–4\n\nDesign around 3–4, not 7. That is the modern cognitive-science answer.",
    },
    {
      type: 'quiz',
      question: 'For a presentation, what number of main points lands best with the audience?',
      options: [
        { label: 'About 2 — minimize content and sharpen contrast', correct: false },
        { label: 'About 3 — fits within pure working memory capacity', correct: true },
        { label: 'About 7 — follow the older 7±2 theory baseline', correct: false },
        { label: 'About 10 — prioritize comprehensive coverage', correct: false },
      ],
      explanation:
        'Pure working memory is around 4±1. Without listener rehearsal, three points is optimal. Option 3 is the trap of using the older Miller framing without updating; option 1 sharpens contrast but sacrifices coverage; option 4 ignores capacity entirely.',
    },
    {
      type: 'explain',
      title: 'What happens when capacity is exceeded',
      content:
        "When working memory overflows:\n\n[1] Older items get pushed out (first-in, first-out)\nAdding an 8th item bumps the 1st.\n\n[2] Processing speed drops sharply\nHolding takes resources, leaving less for judgment and reasoning.\n\n[3] Error rates spike\nAttention-switching cost grows, causing oversights and mistakes.\n\n[4] Stress rises\nThe pressure to 'remember everything' makes the cognitive load worse.\n\nTypical workplace examples:\n• 10 topics in one meeting → no decisions in the second half\n• 5 simultaneous Slack DMs → every reply ends up sloppy\n• 7 instructions at once → something always falls through\n\nThe fix is not 'remember more.' The fix is 'externalize and chunk.'",
    },
    {
      type: 'quiz',
      question: 'Which is NOT a real symptom of exceeded working memory capacity?',
      options: [
        { label: 'Older items get pushed out in FIFO fashion', correct: false },
        { label: 'Processing speed drops and judgment slows', correct: false },
        { label: 'Established long-term memories also get erased', correct: true },
        { label: 'Attention-switching cost rises and errors increase', correct: false },
      ],
      explanation:
        'Working memory (temporary) and long-term memory are separate systems. Overflow only loses currently held items; established long-term memories are unaffected. The "brain shuts down entirely" intuition creates the false impression of long-term erasure.',
    },
  ],
}

const chunking: LessonData = {
  id: 701,
  title: 'Chunking — Expanding Capacity',
  category: 'Cognitive Science',
  steps: [
    {
      type: 'explain',
      title: 'What chunking is',
      content:
        "Chunking groups information into meaningful units (chunks) so that working memory capacity effectively expands.\n\nTry remembering these 10 letters:\nN H K B B C C N N H\n\nRaw: 10 separate items.\nGrouped: 'NHK / BBC / CNN / NH' = 4 chunks.\nMeaningful: 'Japan's NHK / UK's BBC / US's CNN / ANA's NH code' = 4 easy chunks.\n\nHow chunking works:\n• Linking new input to known patterns\n• Re-grouping items into meaningful clusters\n• Building hierarchies\n\nBusiness applications:\n• MECE grouping → 10 issues compressed into 3 themes\n• Logic trees → hierarchy = instant whole-picture view\n• Frameworks (3C / 4P / SWOT) → reusable conceptual chunks",
    },
    {
      type: 'quiz',
      question: 'Which is the most effective use of chunking?',
      options: [
        { label: 'Read 11 digits one at a time at even pace', correct: false },
        { label: 'Split 11 digits into 3 blocks with meaningful rhythm', correct: true },
        { label: 'Repeat the full 11-digit number aloud over and over', correct: false },
        { label: 'Convert all 11 digits into one elaborate story', correct: false },
      ],
      explanation:
        'Splitting 11 digits into 3 blocks compresses chunk count from 11 to 3, fitting in capacity. Option 3 (rehearsal) holds temporarily but doesn\'t reduce load. Option 4 (mnemonic story) works as an advanced technique but isn\'t the pure "chunking" definition here.',
    },
    {
      type: 'explain',
      title: 'Three types of chunking',
      content:
        "There are three main patterns:\n\n[Type 1] Grouping (horizontal aggregation)\nPut items of the same nature into one bucket.\nExample: 12 initiatives → 'Acquisition,' 'Retention,' 'Monetization' (3 buckets).\n\n[Type 2] Hierarchy (vertical aggregation)\nWhole → mid-categories → details, as a tree.\nExample: Company issue tree (business / org / finance → subdivided).\n\n[Type 3] Pattern matching (mapping to known concepts)\nMatch to existing frameworks or phrases.\nExample: 'We win through differentiation and low cost' → Porter's generic strategies.\n\nAs business people get more experienced, their library of 'conceptual chunks' grows. Beginners process items one by one. Veterans recognize the situation chunk-by-chunk: 'This is a classic X case.'\n\nThat is why experienced people have spare capacity in meetings. Same number of items, but larger chunks means more total content.",
      visual: 'LogicTreeDiagram',
    },
    {
      type: 'quiz',
      question: 'Organizing 20 ideas into "Acquisition 5 / Retention 6 / Monetization 9" — which chunking type?',
      options: [
        { label: 'Grouping — same-nature items collected in one bucket', correct: true },
        { label: 'Hierarchy — break the whole into nested sub-categories', correct: false },
        { label: 'Pattern matching — map onto an existing framework', correct: false },
        { label: 'Abstraction — replace specifics with higher-order concepts', correct: false },
      ],
      explanation:
        "Same-nature items collected into a bucket = grouping. Hierarchy would subdivide each bucket; pattern matching would map the 3 buckets to a framework like AARRR; abstraction replaces specifics with broader categories — none of those have happened here.",
    },
    {
      type: 'explain',
      title: 'Training chunking deliberately',
      content:
        'Chunking is a trainable skill. Three ways to build it:\n\n[1] Expand your framework library\n3C / 4P / SWOT / 7S / AARRR / STP / 5 Whys / Five Forces ...\nFrameworks are reusable conceptual chunks. The more you know, the more situations you can compress into a single label like "this is an AARRR retention problem."\n\n[2] Always group after divergent thinking\nWhen brainstorming produces 30 items, force yourself to group them into 3–5 clusters. The act of grouping itself trains chunking.\n\n[3] Move up and down the abstraction ladder\nConcrete → abstract → concrete (elsewhere). Skilled abstraction lets you recognize "same structure" across different surfaces.\n\nExperts in meetings can take 30 points and say "really there are only 3 questions here." That compression is what effectively raises the working memory ceiling.',
    },
    {
      type: 'quiz',
      question: 'Which is the LEAST effective practice for building chunking skill?',
      options: [
        { label: 'Catalog every idea you have into a comprehensive log', correct: true },
        { label: 'Deliberately expand your library of frameworks', correct: false },
        { label: 'Always group brainstorm outputs into clusters', correct: false },
        { label: 'Cycle between concrete examples and abstract concepts', correct: false },
      ],
      explanation:
        'The essence of chunking is "compress." Listing items exhaustively forms no chunks and doesn\'t raise effective capacity. "Just write everything down" is useful as external memory but does not train chunking — you must add a grouping / hierarchy / conceptual move.',
    },
  ],
}

const cognitiveLoad: LessonData = {
  id: 702,
  title: 'Cognitive Load Theory — Three Load Types',
  category: 'Cognitive Science',
  steps: [
    {
      type: 'explain',
      title: 'The three loads',
      content:
        "John Sweller's cognitive load theory (1988) divides working-memory load into three types:\n\n[1] Intrinsic load\nDifficulty inherent to the task.\nExamples: solving a complex equation, parsing an unfamiliar language.\n→ Cannot be reduced without changing the task itself.\n\n[2] Extraneous load\nLoad from poor design or presentation, unrelated to the task.\nExamples: confusing slides, typos, noise, bad layout.\n→ Can and should be cut first.\n\n[3] Germane load\n'Good load' that builds understanding and retention.\nExamples: paraphrasing, applying to new problems.\n→ Worth adding deliberately.\n\nWhen the sum exceeds capacity, both learning and judgment break down. Trim extraneous load, increase germane load.",
      visual: 'ThreePillarsDiagram',
    },
    {
      type: 'quiz',
      question: '"This slide deck has inconsistent fonts and is hard to read." Which load is that?',
      options: [
        { label: 'Intrinsic — load from the inherent difficulty of the task', correct: false },
        { label: 'Extraneous — wasted load from poor presentation or design', correct: true },
        { label: 'Germane — good load that supports learning and retention', correct: false },
        { label: 'Sensory — fatigue load from raw visual stimulation', correct: false },
      ],
      explanation:
        'Font/layout/typo are presentation-side issues = extraneous load. They eat resources without serving content and should be cut first. Option 4 "sensory load" doesn\'t exist in CLT — it\'s a distractor that confuses appearance issues with fatigue.',
    },
    {
      type: 'explain',
      title: 'Cutting extraneous load',
      content:
        'Extraneous load can be driven near zero through good design. Common business examples:\n\n[Documents]\n• Inconsistent font sizes\n• More than 5 colors\n• Too much information per slide\n• Inconsistent arrow directions\n\n[Meetings]\n• No agenda or time allocation\n• Off-topic detours\n• Hard-to-read screen shares\n• Audio and video out of sync\n\n[Email / Chat]\n• Subject lines that mismatch content\n• Conclusion at the bottom\n• Quotes that are too long\n\nReduction principles:\n1. One message per slide\n2. Same information always in the same place\n3. Consistent formatting\n4. Subtract before adding\n\nGetting extraneous load close to zero dramatically improves comprehension.',
    },
    {
      type: 'quiz',
      question: 'Which slide-making habit increases extraneous load the MOST?',
      options: [
        { label: 'Highlight only key points with a single accent color', correct: false },
        { label: 'Assign a different color to every item across the deck', correct: true },
        { label: 'Lead with the conclusion, place evidence afterward', correct: false },
        { label: 'Keep heading position consistent across all slides', correct: false },
      ],
      explanation:
        'Heavy color use scatters attention and starves essential processing. "Color-coding every item" looks careful but is a textbook extraneous-load trap. Cap colors at 3 (main / accent / suppression) for clean cognitive flow.',
    },
    {
      type: 'explain',
      title: 'Adding germane load',
      content:
        'Germane load is the "good load" that strengthens understanding and retention. Adding a little load on purpose deepens learning.\n\nWays to add germane load:\n\n1. Summarize in your own words\n3-line summaries triple retention vs. passive reading.\n\n2. Compare with related cases\n"This is like the X we learned before."\n\n3. Solve applied problems\nTwisted problems beat verbatim repetition.\n\n4. Teach someone else\nThe Feynman technique — teaching is the strongest learning move.\n\n5. Self-questioning\n"What does this really mean?" "What if conditions change?"\n\nCaution:\nGermane load only helps when intrinsic + extraneous load have room left. First cut extraneous, then add germane. That order is critical.',
    },
    {
      type: 'quiz',
      question: 'Which training-design sequence aligns best with cognitive load theory?',
      options: [
        { label: 'Open with hard applied problems to force concentration', correct: false },
        { label: 'Cut extraneous load first, then add germane load via exercises', correct: true },
        { label: 'Pack in maximum information to maximize germane load', correct: false },
        { label: 'Simplify the task itself to minimize intrinsic load', correct: false },
      ],
      explanation:
        'Cut extraneous → add germane is the canonical order. Option 3 confuses "information volume" with germane load (which is about processing depth — summarizing, applying). Option 4 incorrectly tries to reduce intrinsic load, which is the essence of the task.',
    },
  ],
}

const externalMemory: LessonData = {
  id: 703,
  title: 'Externalize Your Memory',
  category: 'Cognitive Science',
  steps: [
    {
      type: 'explain',
      title: 'Get it out of your head',
      content:
        "Working memory capacity barely grows even with training. That is why high performers offload information outside their head — external memory.\n\nExamples of external memory:\n• Notes and notebooks\n• Task tools (Todoist, Notion)\n• Calendars\n• Whiteboards\n• Diagrams and mind maps\n• Files and folder structures\n\nBenefits:\n1. Capacity is unlimited\n2. No risk of forgetting\n3. Search and reuse\n4. Frees you from the stress of 'I have to remember everything'\n\nCommon traits of business veterans:\n• Always write tasks into an external tool (never just 'remember' them)\n• Externalize thinking on paper or whiteboard (not just in your head)\n• Document past decisions (make them reproducible)\n\nIn modern work, 'building systems that let you forget' beats 'memorizing.'",
    },
    {
      type: 'quiz',
      question: 'What is the biggest benefit of external memory?',
      options: [
        { label: 'It expands the biological capacity of working memory itself', correct: false },
        { label: 'It offloads storage so working memory can spend on judgment and reasoning', correct: true },
        { label: 'It lets you recall every stored item simultaneously and instantly', correct: false },
        { label: 'It automatically transfers stored info into long-term memory', correct: false },
      ],
      explanation:
        'External memory doesn\'t expand brain capacity. By moving storage outside, it frees working memory for processing (judgment, reasoning, creativity). Option 4 is a common myth — writing things down doesn\'t auto-encode them into long-term memory; that requires deliberate review and elaboration.',
    },
    {
      type: 'explain',
      title: "GTD (Getting Things Done)",
      content:
        "David Allen's GTD is a systematized form of external memory.\n\nThe flow:\n\n1. Capture\nWrite every 'thing on your mind' into one place (Inbox). Get them out of your head.\n\n2. Clarify\nFor each item:\n• Is action required?\n• Will it take less than 2 minutes?\n• What is the next action?\n\n3. Organize\n• Under 2 minutes → do it now\n• Mine → next-action list\n• Delegate → waiting-for list\n• Maybe someday → holding list\n• Reference only → file it\n\n4. Reflect\nWeekly review of all lists.\n\n5. Engage\nWork the next-action list based on context.\n\nGTD's essence: 'do not hold it in your head' + 'next action is always explicit.' That alone collapses cognitive load.",
    },
    {
      type: 'quiz',
      question: 'Which is the FIRST step of GTD?',
      options: [
        { label: 'Capture — dump every concern from your head into one place', correct: true },
        { label: 'Clarify — decide whether each item requires action', correct: false },
        { label: 'Organize — sort items into category lists', correct: false },
        { label: 'Prioritize — rank items by urgency and importance', correct: false },
      ],
      explanation:
        'GTD starts with Capture: get everything out of your head into one place to free cognitive load. Option 4 ("Prioritize") isn\'t in GTD\'s standard steps — GTD emphasizes "next-action clarity" over priority ranking.',
    },
    {
      type: 'explain',
      title: 'Diagrams = dynamic external memory',
      content:
        "Among external memory tools, diagrams are uniquely powerful.\n\nWhy diagrams beat text:\n\n1. Spatial overview\nIn text you process sequentially. A diagram shows 5 elements at once.\n\n2. Relationships are visible\n'A causes B, B causes C' is far faster as arrows than as prose.\n\n3. Gaps are obvious\nEmpty spots in a diagram intuitively ask 'something should go here.'\n\n4. Diagrams force chunking\nThe act of drawing compresses concepts into chunks.\n\nCommon diagram patterns:\n• Logic tree → structural decomposition\n• 2x2 matrix → comparison\n• Flow → time / steps\n• Venn diagram → overlap, relationships\n• Pyramid → hierarchy, priority\n\nWhen a meeting stalls, just asking 'can I sketch this on the whiteboard?' changes the entire quality of the discussion. Diagrams are dynamic external memory that speed up thinking.",
      visual: 'LogicTreeDiagram',
    },
    {
      type: 'quiz',
      question: 'In a meeting with 5 unresolved topics swirling, which action lowers cognitive load most?',
      options: [
        { label: 'Re-poll every attendee\'s opinion verbally', correct: false },
        { label: 'Take a longer break and reconvene afterward', correct: false },
        { label: 'Sketch all 5 topics with their relationships on the whiteboard', correct: true },
        { label: 'Hold an immediate vote to force a decision', correct: false },
      ],
      explanation:
        "Holding 5 topics purely in working memory breaks down. Externalizing visually lowers everyone's load and surfaces relationships and gaps. Option 1 adds more verbal input (more load), option 2 just defers the problem, option 4 short-circuits the unresolved structure.",
    },
  ],
}

const multitaskingMyth: LessonData = {
  id: 704,
  title: 'The Multitasking Illusion',
  category: 'Cognitive Science',
  steps: [
    {
      type: 'explain',
      title: 'There is no such thing as multitasking',
      content:
        "Many people believe they can multitask. Cognitive science disagrees — the human brain cannot truly multitask.\n\nWhat actually happens is task switching:\n• Attend to task A\n• Switch to task B\n• Switch back to A\n• ...\n\nEach switch incurs a context-switching cost:\n• Save the prior task's information\n• Reload the new task's information\n• Rebuild focus\n\nThe cost is bigger than people realize:\n• ~23 minutes to fully refocus after a switch (UC Irvine)\n• Up to 40% drop in productivity with heavy switching (APA)\n• Errors roughly double\n\nWhat feels 'efficient' is often the least efficient way to work — that is the verdict of cognitive science.",
    },
    {
      type: 'quiz',
      question: 'Which best explains what really happens when you "multitask"?',
      options: [
        { label: 'The brain processes multiple tasks in true parallel, reducing fatigue', correct: false },
        { label: 'Rapid task switching, with a cost paid on every switch', correct: true },
        { label: 'With training the brain can unlock genuine parallel processing', correct: false },
        { label: 'Younger people are structurally better at multitasking', correct: false },
      ],
      explanation:
        "The brain can't run multiple cognitive tasks in parallel — it switches, paying ~23 minutes of refocus cost each time. Options 1 and 3 reflect the wishful belief in true parallelism; option 4 is the digital-native myth (no neurological evidence).",
    },
    {
      type: 'explain',
      title: 'Real cost of switching',
      content:
        "Hidden costs of multitasking:\n\n[Example 1] Quick email check during writing\n30 seconds of email → but ~23 min to refocus on the original task.\n→ 10 switches/day ≈ 230 minutes (almost 4 hours) lost.\n\n[Example 2] Instant Slack replies\nResponding to every ping prevents deep focus.\n→ Feels 'cooperative,' but kills both sides' productivity.\n\n[Example 3] Laptop work during meetings\nFeels like you're handling both. In reality, both have low quality.\n→ You miss key points; the laptop work has more errors.\n\n[Example 4] Studying with TV on\nExperiments confirm both activities drop 50%+ in quality.\n\nPractical countermeasures:\n1. Build single-task blocks (25–90 minutes)\n2. Disable notifications (Slack, mail, social)\n3. Close the laptop in meetings\n4. Decide 'the one thing' and commit",
    },
    {
      type: 'quiz',
      question: 'Which action maximizes focus the most?',
      options: [
        { label: 'Check email every 5 minutes to keep things moving efficiently', correct: false },
        { label: 'Turn off notifications and protect 25–90-minute single-task blocks', correct: true },
        { label: 'Do other PC work during meetings to stay alert and productive', correct: false },
        { label: 'Run 3 tasks simultaneously to compress total elapsed time', correct: false },
      ],
      explanation:
        'Each switch costs ~23 minutes of refocus. Protected single-task windows of 25–90 minutes are the highest-leverage focus strategy in knowledge work. Options 1, 3, and 4 all add switching cost while feeling productive — the classic illusion.',
    },
    {
      type: 'explain',
      title: 'Exceptions — tasks you CAN combine',
      content:
        "Not everything is mutually exclusive. Some combinations are cognitively safe.\n\n[Condition]\nDifferent brain regions, one task automated, low cognitive load.\n\n[Can combine]\n• Walking + thinking (motor cortex vs. prefrontal cortex)\n• Dishwashing + podcast (hand motion automated)\n• Commute + reading (passive movement + active reading)\n• Simple chores + listening to music\n\n[Cannot combine — same resources]\n• Listening in a meeting + replying to email (both language)\n• Coding + watching Slack (both logical reasoning)\n• Writing a deck + phone call (both language)\n\nThe rule:\n'Tasks that share brain resources cannot truly run in parallel.'\n'If one task is fully automated, parallel is possible.'\n\nMastering this distinction lets you graduate from 'pretend-busy' multitasking.",
    },
    {
      type: 'quiz',
      question: 'Which combination can actually run in parallel from a cognitive-science view?',
      options: [
        { label: 'Coding + monitoring Slack for instant replies', correct: false },
        { label: 'Listening to an online meeting + replying to email', correct: false },
        { label: 'Walking + brainstorming new ideas in your head', correct: true },
        { label: 'Writing a presentation + holding a phone call', correct: false },
      ],
      explanation:
        "Walking is automated by the motor cortex; thinking uses the prefrontal cortex — different regions, no resource conflict. The classic 'good ideas come while walking' has cognitive-science backing. Options 1, 2, 4 all share language/logic resources, so both halves degrade.",
    },
  ],
}

// ── Course B: cognitive-02 ──────────────────────────

const availabilityHeuristic: LessonData = {
  id: 710,
  title: 'Availability Heuristic',
  category: 'Cognitive Science',
  steps: [
    {
      type: 'explain',
      title: 'Mistaking ease of recall for frequency',
      content:
        "The availability heuristic (Tversky & Kahneman, 1973) is the tendency to treat 'easily recalled' events as 'more frequent / more likely.'\n\nEveryday examples:\n• After news of a plane crash, flying feels dangerous (cars are statistically far worse)\n• If someone you know is divorced, divorce feels more common\n• Seeing startup success stories on social media inflates your sense of success rate\n\nWhy it happens:\n• Vivid events are easy to pull from working memory\n• The brain misreads 'ease of recall' as 'higher base rate'\n• Statistical reasoning is expensive, so the brain shortcuts via recall\n\nTypical business pitfalls:\n• Letting a recent complaint reshape the whole strategy\n• Making decisions based on one striking competitor case\n• Treating a 3-month run as the annual trend",
    },
    {
      type: 'quiz',
      question: 'Which is the clearest example of the availability heuristic?',
      options: [
        { label: 'Calmly analyzing long-term statistical data sets', correct: false },
        { label: 'A vivid recent incident makes the whole category feel dangerous', correct: true },
        { label: 'Interviewing multiple subject-matter experts over time', correct: false },
        { label: 'Reaching a decision based on multi-year base-rate data', correct: false },
      ],
      explanation:
        'Vivid recent events are easy to recall, so the brain inflates their frequency. That is exactly the availability heuristic. The other three are deliberate, data-driven approaches that bypass the bias.',
    },
    {
      type: 'explain',
      title: 'Workplace traps',
      content:
        "The availability heuristic fires often in business decisions.\n\n[1] Recent complaint > overall trend\nOne big complaint flips the whole process.\n→ But it may be exceptional, and the rebuild may create new problems.\n\n[2] Striking success story > statistical average\n'Apple did X' applied directly to your company.\n→ One success out of thousands, mixed with survivorship bias.\n\n[3] Nearby opinions > data\nOne comment from your boss overrides 1,000 survey responses.\n→ Sample size of 1 overwriting hundreds.\n\n[4] Latest news > long-term trend\n'This tech is hot now' shifting a 5-year strategy.\n→ Media coverage frequency ≠ actual importance.\n\nCountermeasures:\n• Separate 'what you recalled' from 'statistical reality'\n• Look at the past 3 years, not just the past month\n• Always check sample size, however vivid the example",
    },
    {
      type: 'quiz',
      question: '"A striking recent complaint — let\'s rebuild the whole UI." Best response?',
      options: [
        { label: 'Begin rebuild work immediately to show responsiveness', correct: false },
        { label: 'First check overall occurrence rate before deciding scope', correct: true },
        { label: 'Hunt for more similar complaints to confirm the impression', correct: false },
        { label: 'Treat this complaint as the absolute top priority above all', correct: false },
      ],
      explanation:
        "However vivid the case, without checking overall frequency you can't judge fairly. Option 3 is the trap of confirmation bias on top of availability bias — actively hunting for supporting cases doesn't reveal base rates.",
    },
    {
      type: 'explain',
      title: 'The upside — using it well',
      content:
        "The availability heuristic has positive sides too. Rather than rejecting it, learn to use it.\n\n[Upside 1] Fast decisions\nPulling statistics takes time. In emergencies, recall-based action is the only option.\n\n[Upside 2] Expertise\nA veteran's 'gut' is just a high-quality availability heuristic — vast, well-balanced experience.\n\n[Upside 3] Communication\nVivid stories in presentations and sales exploit the audience's availability heuristic. That is the standard playbook.\n\nDefender vs. user:\n● When you decide → suspect the temptation\n● When you persuade others → use vivid stories\n\nBusiness is a cognitive arena. Doubt your own availability bias; activate it in your audience. Masters work both sides.",
    },
    {
      type: 'quiz',
      question: 'What is the smartest way to live with the availability heuristic?',
      options: [
        { label: 'Eliminate all cognitive heuristics from your thinking entirely', correct: false },
        { label: 'Doubt it in your own decisions, but use vivid cases to persuade others', correct: true },
        { label: 'Always rely on statistics alone and ignore vivid anecdotes', correct: false },
        { label: 'Trust whatever comes to mind first as the most important signal', correct: false },
      ],
      explanation:
        "Heuristics are an unavoidable brain energy-saver. The mature stance is asymmetric: suspect them when you decide, deploy them when you communicate. Option 1 is unrealistic, option 3 ignores how human persuasion works, option 4 surrenders to the bias.",
    },
  ],
}

const haloEffect: LessonData = {
  id: 711,
  title: 'The Halo Effect',
  category: 'Cognitive Science',
  steps: [
    {
      type: 'explain',
      title: 'One trait casts a halo on the whole',
      content:
        "The halo effect is when one prominent trait distorts the overall impression of the whole. 'Halo' refers to the ring of light depicted above saints. Edward Thorndike named it in 1920.\n\nEveryday examples:\n• Good-looking people are assumed to be nice\n• Brand-name school graduates are assumed to be highly competent\n• Luxury-brand goods are assumed to be high quality\n• Fluent English speakers are assumed to be deeply knowledgeable\n\nWhy it happens:\n• The brain uses one strong trait as a shortcut for overall evaluation\n• Evaluating each dimension separately is cognitively expensive\n• The brain prefers consistency (avoiding cognitive dissonance)\n\nCommon at work:\n• Polished presenters are rated as strategic thinkers\n• One big success makes everything that person says feel correct\n• Beautifully designed proposals look like better proposals",
    },
    {
      type: 'quiz',
      question: 'Which is the clearest example of the halo effect?',
      options: [
        { label: 'Evaluating each axis (achievements, ability) separately', correct: false },
        { label: 'Judging someone\'s personality based solely on their looks', correct: true },
        { label: 'Making decisions strictly from quantitative data', correct: false },
        { label: 'Combining multiple metrics for a multi-axis evaluation', correct: false },
      ],
      explanation:
        "One prominent trait (appearance) inflates an unrelated dimension (personality). Classic halo effect. The other three options describe deliberate de-biasing approaches that explicitly counter halo.",
    },
    {
      type: 'explain',
      title: 'In hiring interviews',
      content:
        "Hiring interviews are one of the most halo-prone settings.\n\n[How it manifests]\n• First 7-second impression sets the whole evaluation\n• Impressive credentials inflate scores on every later question\n• A second language makes someone look smarter overall\n• Sharp clothing inflates assumed expertise\n\nHiring research results:\n• Unstructured interview predictive validity: 0.2–0.3 (near random)\n• Once a first impression forms, dissenting questions rarely come\n• 'Hire the impressive ones' happens unconsciously\n\nCountermeasures:\n\n1. Structured interviews\nSame questions, same rubric for everyone.\n\n2. STAR method\nSeparate 'Situation, Task, Action, Result.'\n\n3. Separate the rubric\nLeadership / expertise / communication / culture fit scored individually.\n\n4. Independent scores from multiple interviewers\nScore independently before discussion.\n\n5. Back-test after hire\nAt 1 year, did the interview score match reality?",
    },
    {
      type: 'quiz',
      question: 'Which hiring practice most effectively reduces halo effect?',
      options: [
        { label: 'Let each interviewer ask freely chosen questions in their own style', correct: false },
        { label: 'Score each axis separately, with independent scores before discussion', correct: true },
        { label: 'Weight first impressions heavily — they\'re usually accurate', correct: false },
        { label: 'Judge mainly on academic and career credentials at this stage', correct: false },
      ],
      explanation:
        'Separated rubric + independent scores decouple traits so a single impression can\'t inflate the whole. Options 1, 3, 4 actively amplify halo (free-form invites bias, first-impression worship is the bias itself, credentials are the classic halo trigger).',
    },
    {
      type: 'explain',
      title: 'The horn effect — halo in reverse',
      content:
        "The halo effect runs in the negative direction too — called the 'horn effect.'\n\nNegative examples:\n• Sloppy dress → assumed sloppy work\n• One mistake → all later proposals distrusted\n• A shaky answer → assumed shallow knowledge overall\n• A typo-laden document → conclusions feel suspect\n\nCommon at work:\n• Stumbling at the start of a presentation → the rest is downgraded\n• A typo in a report to your boss → the content is doubted\n• Failing the first project → all subsequent work undervalued\n• One late arrival → significant trust loss\n\nCountermeasures:\n\n● As evaluator\nAsk: 'Am I judging the whole from one bad impression?'\n'Strip the impression — what would the evaluation be?'\n\n● As evaluated\n• Invest in first impressions: opening of meetings, day 1\n• After a mistake, deliberately show wins in another context\n• Do not dismiss small slips (typos, lateness)\n\nHalo and horn are two sides of the same coin. Understand both, and you can correct evaluation distortions.",
    },
    {
      type: 'quiz',
      question: 'Which is the clearest example of the horn effect?',
      options: [
        { label: 'A beautifully designed deck makes the content seem credible', correct: false },
        { label: 'Typos throughout a deck make the conclusion itself feel suspect', correct: true },
        { label: 'Scoring multiple evaluation axes independently of each other', correct: false },
        { label: 'Separating academic credentials from demonstrated ability', correct: false },
      ],
      explanation:
        "One negative trait (typos) drags down an unrelated dimension (conclusion validity). Classic horn effect — same mechanism as halo, inverted. Option 1 is the positive halo direction; options 3 and 4 are de-biasing techniques.",
    },
  ],
}

const hindsightBias: LessonData = {
  id: 712,
  title: 'Hindsight Bias',
  category: 'Cognitive Science',
  steps: [
    {
      type: 'explain',
      title: '"I knew it all along"',
      content:
        "Hindsight bias makes outcomes feel predictable after you know them. Also called the 'I knew it all along' effect.\n\nEveryday examples:\n• After the election: 'Of course this candidate won'\n• After a market crash: 'Obviously a bubble'\n• After a project fails: 'I knew it was hopeless from the start'\n• After a match: 'No way that coach could win'\n\nWhy it happens:\n• Once you know the outcome, the brain selects only consistent memories\n• Uncertain past judgments get rewritten as 'I knew'\n• Admitting 'I didn't know' is less comfortable than 'I knew'\n\nCommon at work:\n• Retrospectives where everyone says 'it was obvious from day 1'\n• Post-mortems where past leaders are unfairly blamed\n• Success stories rewritten as 'the strategy was clearly right'",
    },
    {
      type: 'quiz',
      question: 'Which best captures hindsight bias?',
      options: [
        { label: 'It activates more strongly in people skilled at forecasting', correct: false },
        { label: 'Once you know the outcome, you feel it was always predictable', correct: true },
        { label: 'People with better long-term memory are largely immune to it', correct: false },
        { label: 'It tends to affect young people more strongly than older ones', correct: false },
      ],
      explanation:
        'Hindsight bias unconsciously rewrites past judgments after outcomes are known. Options 1, 3, 4 all suggest some group is immune — none are. The bias is near-universal regardless of skill, memory, or age.',
    },
    {
      type: 'explain',
      title: 'How it corrodes organizations',
      content:
        "Hindsight bias seriously degrades the quality of retrospectives.\n\n[Typical problems]\n\n[1] Blame attribution\nAfter failure: 'Choosing plan A was clearly wrong.'\n→ But at the time, plans B and C were equally reasonable.\n→ Judging with hindsight makes everyone risk-averse.\n\n[2] Wrong lessons\n'Same pattern next time will work too.'\n→ Apply the success-case structure to a different situation and fail.\n\n[3] Underestimating risk\n'It was predictable' means future risks also feel predictable.\n→ Real uncertainty gets chronically underestimated.\n\n[4] Shallow learning\nWith 'I knew' as a premise, true lessons stay invisible.\n\nCountermeasures:\n• In retrospectives, always list 'what options existed when the outcome was unknown'\n• Keep a record of decisions at the time of decision (pre-decision logs)\n• Ask: 'If the outcome were reversed, how would we judge that decision?'",
    },
    {
      type: 'quiz',
      question: 'Which retrospective question best avoids hindsight bias?',
      options: [
        { label: 'Whose specific decision was the one that went wrong?', correct: false },
        { label: 'Given only the info available then, what other options were reasonable?', correct: true },
        { label: 'Knowing what we know now, what would have been the optimal plan?', correct: false },
        { label: 'Who in the organization should take responsibility for this outcome?', correct: false },
      ],
      explanation:
        '"Only with the info at the time" decouples hindsight bias. Options 1 and 4 head straight into blame; option 3 explicitly invites hindsight reasoning ("knowing what we know now") — the very thing we want to avoid.',
    },
    {
      type: 'explain',
      title: 'Pre-mortem — using hindsight on the future',
      content:
        "The pre-mortem flips hindsight bias on its head. Decision researcher Gary Klein proposed it.\n\n[Normal retrospective]\nAfter the project, look back at 'why we failed.'\n→ Distorted by hindsight bias.\n\n[Pre-mortem]\nBefore the project: 'Imagine 1 year from now this project has failed disastrously. Why?'\n→ Use the hindsight-bias mechanism on a 'future failure.'\n→ Assuming the outcome surfaces risks that are currently invisible.\n\nProcedure:\n1. Give everyone 5 minutes to write 'failure scenarios 1 year out'\n2. Share and surface common failure causes\n3. Add countermeasures to the project plan\n\nEffects:\n• Cancels optimism bias\n• Surfaces concerns people hesitate to raise\n• Significantly raises risk coverage\n\nHindsight can be foe or friend. Pre-mortem is applied cognitive science — recognize the bias, then turn it to your advantage.",
    },
    {
      type: 'quiz',
      question: "What is the essential function of a pre-mortem?",
      options: [
        { label: 'After failure, identify which individuals are responsible', correct: false },
        { label: 'Before kickoff, imagine a future failure to surface hidden risks', correct: true },
        { label: 'Audit past misjudgments and assign accountability for them', correct: false },
        { label: 'Collect outcome data after the project finishes to learn', correct: false },
      ],
      explanation:
        "Pre-mortem repurposes hindsight bias BEFORE kickoff — assume a future failure and let the mechanism surface risks you'd otherwise miss. Options 1, 3, 4 all happen AFTER outcomes — pre-mortem is uniquely forward-looking.",
    },
  ],
}

const dunningKruger: LessonData = {
  id: 713,
  title: 'The Dunning-Kruger Effect',
  category: 'Cognitive Science',
  steps: [
    {
      type: 'explain',
      title: 'The less you know, the more confident',
      content:
        "The Dunning-Kruger effect: low-skill individuals overestimate their ability while high-skill individuals tend to underestimate theirs. Published by Dunning & Kruger (Cornell) in 1999.\n\nThe shape on a graph:\n• Beginner (zero knowledge) → cannot see own limits → overconfident\n• Just-learned → discovers the unknowns → confidence crashes ('valley of despair')\n• Intermediate → learning advances, confidence recovers\n• Master → aware of the limits of own knowledge → humble\n\nEveryday examples:\n• One book read → 'I get this field now'\n• Three YouTube videos → 'I'm an investing expert'\n• New employees making bold proposals; veterans being cautious\n\nWhy:\n• 'Knowing what you don't know' itself requires some knowledge\n• With shallow knowledge, you don't have a ruler\n• 'Knowing that you don't know' is the entry to meta-cognition",
    },
    {
      type: 'quiz',
      question: 'Which best describes the Dunning-Kruger effect?',
      options: [
        { label: 'Beginners systematically underestimate their own knowledge level', correct: false },
        { label: 'Beginners are overconfident while masters are humble and cautious', correct: true },
        { label: 'Veterans become increasingly overconfident with more experience', correct: false },
        { label: 'Knowledge and self-confidence rise perfectly in proportion to each other', correct: false },
      ],
      explanation:
        "The core paradox: 'recognizing your own ignorance' itself requires some knowledge. Options 1 and 3 reverse the effect; option 4 ignores the bias entirely with a tidy-but-wrong linear model.",
    },
    {
      type: 'explain',
      title: 'The meta-cognition staircase',
      content:
        "Escape from Dunning-Kruger runs through meta-cognition (cognition about your own cognition).\n\n[Four stages]\n\n[1] Unknown unknowns\n'Looks simple' / 'I already get it'\n→ Overconfident. Cannot see own role in failure.\n\n[2] Known unknowns\n'Harder than I thought' / 'I really did not understand'\n→ Where many people quit (valley of despair).\n\n[3] Known knowns\n'I can do this part' / 'I'm weak here'\n→ Learning becomes structured.\n\n[4] Unknown knowns\n'I do it without thinking'\n→ Automated mastery. Craftsman's level.\n\nWhat to do at each stage:\n• Stage 1 → ask, be coachable\n• Stage 2 → don't quit, stack small wins\n• Stage 3 → target weak points and improve\n• Stage 4 → re-structure by teaching others\n\nGrowing meta-cognition step-by-step lets you exit the Dunning-Kruger trap.",
    },
    {
      type: 'quiz',
      question: 'At the "known unknowns" stage, what should you absolutely NOT do?',
      options: [
        { label: 'Ask experts in the field for guidance and feedback', correct: false },
        { label: 'Stack small wins gradually to rebuild confidence', correct: false },
        { label: 'Give up entirely with "I\'m not cut out for this field"', correct: true },
        { label: 'Surface your weak points and target them deliberately', correct: false },
      ],
      explanation:
        "The 'known unknowns' stage is the 'valley of despair' where most learners give up — and quitting here freezes you in Dunning-Kruger. Pushing through with small wins (option 2), expert help (option 1), and targeted practice (option 4) is the exit route.",
    },
    {
      type: 'explain',
      title: 'Workplace applications',
      content:
        "The Dunning-Kruger effect creates real workplace problems.\n\n[Typical issues]\n\n[1] Junior overreach\nProposing big changes without fundamentals.\n→ Overconfident; cannot see history or risk.\n\n[2] Veteran hesitancy\nKnowing too much makes them too cautious.\n→ 'There's so much I don't know' freezes action.\n\n[3] Manager overgeneralization\n'I understand every area' and dismissing experts.\n→ Judging the whole from partial knowledge.\n\n[Countermeasures]\n\n1. Self-check\n• Maintain a 'list of unknowns'\n• Write 5 things you cannot do in this domain\n• Don't hesitate to ask experts\n\n2. Organizational check\n• Require risk coverage on junior proposals\n• Respect veterans' caution as accumulated experience\n• 360-degree reviews to surface self vs. other gaps\n\n3. Cultural moves\n• Psychological safety to say 'I don't know'\n• Make 'asking' uncomplicated\n• Veterans publicly state 'I'm still learning'",
    },
    {
      type: 'quiz',
      question: 'What is the most effective response to the Dunning-Kruger effect?',
      options: [
        { label: 'Maintain a list of what you don\'t know and ask experts without hesitation', correct: true },
        { label: 'Always project full confidence in every domain to look competent', correct: false },
        { label: 'Never question your existing knowledge — second-guessing wastes time', correct: false },
        { label: 'Treat asking basic questions as embarrassing to your professional image', correct: false },
      ],
      explanation:
        "Meta-cognition — knowing what you don't know — is the root cure. Options 2, 3, 4 each lock you deeper into Dunning-Kruger: false confidence, blocked self-questioning, and silencing of clarifying questions all prevent the unknowns from surfacing.",
    },
  ],
}

const outcomeVsProcessBias: LessonData = {
  id: 714,
  title: 'Outcome Bias vs. Process Bias',
  category: 'Cognitive Science',
  steps: [
    {
      type: 'explain',
      title: 'Judging by outcome alone',
      content:
        "Outcome bias is judging the quality of a decision by the quality of its outcome.\n\nEveryday examples:\n• Running a red light and making it: 'quick-thinking'\n• Running a red light and crashing: 'reckless'\n→ Same decision, opposite evaluations.\n\nAt work:\n• Sales went up → 'right strategy'\n• Sales went down → 'wrong strategy'\n→ But market conditions and luck also play roles.\n\nWhy:\n• Outcomes are clear and easy to evaluate; decision quality is hidden\n• 'Good outcome = good decision' feels intuitively consistent\n• Re-evaluating past decisions is cognitively expensive\n\nDangers:\n• Luck-driven success looks like skill\n• Sound decisions with bad outcomes get marked as 'mistakes'\n• Organizations promote the lucky, and reproducibility suffers",
    },
    {
      type: 'quiz',
      question: 'Which most accurately describes the truth about outcome bias?',
      options: [
        { label: 'A bad outcome does not necessarily mean a bad decision was made', correct: true },
        { label: 'A good outcome inherently means the underlying decision was correct', correct: false },
        { label: 'Outcomes and decision quality always align in the long run anyway', correct: false },
        { label: 'Decisions should always be judged primarily by their outcomes', correct: false },
      ],
      explanation:
        'Outcomes and decision quality are independent dimensions — good decisions can yield bad luck, bad decisions can yield good luck. Options 2, 3, 4 are all versions of outcome-bias thinking ("outcome IS decision quality"), which is exactly the trap.',
    },
    {
      type: 'explain',
      title: 'Evaluating the process',
      content:
        "The antidote to outcome bias is evaluating the process. Poker pros call result-based evaluation 'resulting' and warn against it.\n\n[Process-evaluation matrix]\n\n           Good outcome    Bad outcome\nGood call  ◎ best          ○ unlucky\nBad call   △ lucky         × worst\n\nApplied at work:\n• Don't punish 'good call + bad outcome'\n  → Otherwise you suppress healthy risk-taking\n\n• Don't celebrate 'bad call + good outcome'\n  → Otherwise you mistake luck for skill\n\n• Make 'good call' criteria explicit\n  - Sufficient information gathered\n  - Multiple options compared\n  - Surprises prepared for\n  - Stakeholders aligned\n\nCore idea:\n'You can do little to control outcomes, but you can improve decision quality.'\n'Repeated good decisions converge to good results in the long run.'\n\nProcess focus is the foundation of reproducible performance.",
      visual: 'Two2MatrixDiagram',
    },
    {
      type: 'quiz',
      question: "Outcome is poor but the decision process was sound. Healthiest organizational response?",
      options: [
        { label: 'Assign blame to someone because the outcome ultimately failed', correct: false },
        { label: 'Evaluate the process positively and allow the same decision pattern', correct: true },
        { label: 'Replace the project lead to send a message about accountability', correct: false },
        { label: 'Ignore the process entirely and judge purely by the bad result', correct: false },
      ],
      explanation:
        'Punishing "good call + bad outcome" (bad luck) suppresses risk-taking and erodes decision quality over time. Options 1, 3, 4 all punish unluck, which trains the organization to play it safe — exactly the wrong long-term incentive.',
    },
    {
      type: 'explain',
      title: 'Designing evaluation systems',
      content:
        "Outcome bias vs. process bias maps directly onto how you design performance evaluation.\n\n[Common distortions]\n\n[1] Pure outcome (KPI hits only)\n+ Simple, objective\n- Luck-sensitive, weak process incentive, short-termist\n\n[2] Pure process (effort only)\n+ Builds reproducibility, encourages risk-taking\n- No outcome accountability; intensity drops\n\n[Hybrid — better]\nWeight outcomes and process:\n\n1. Outcome: KPI achievement (70%)\n2. Process: decision quality, learning posture, contribution (30%)\n\nAlso:\n• 'No penalty if bad outcome was due to unforeseeable conditions'\n• 'Good outcome with sloppy process has a ceiling on rating'\n• 'Learning from failure' rated on a separate axis\n\n[Leadership implications]\n• Don't judge team decisions by outcome alone\n• Ask: 'What other options were available at that moment?'\n• Score 'learning posture from failure' separately from outcome\n\nOrganizations that separate outcome from process build long-term reproducible performance.",
    },
    {
      type: 'quiz',
      question: 'Which evaluation design best corrects outcome bias?',
      options: [
        { label: 'Outcome only — judge purely by KPI achievement and bottom-line', correct: false },
        { label: 'Process only — measure effort and decision quality, ignore results', correct: false },
        { label: 'Hybrid — evaluate both, plus a separate axis for situational difficulty', correct: true },
        { label: 'Stop formal evaluation entirely and rely on managerial intuition', correct: false },
      ],
      explanation:
        'Outcome-only is luck-driven; process-only loses intensity; no-evaluation surrenders fairness entirely. The hybrid plus a difficulty/learning axis yields reproducible team performance by separating skill from luck.',
    },
  ],
}

// ========================================
// Map
// ========================================
export const cognitiveLessonMapEn: Record<number, LessonData> = {
  700: workingMemoryLimit,
  701: chunking,
  702: cognitiveLoad,
  703: externalMemory,
  704: multitaskingMyth,
  710: availabilityHeuristic,
  711: haloEffect,
  712: hindsightBias,
  713: dunningKruger,
  714: outcomeVsProcessBias,
}
