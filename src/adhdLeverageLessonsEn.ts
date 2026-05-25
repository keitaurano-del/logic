/**
 * ADHD Leverage Course — English edition
 * Category: 'ADHDレバレッジ' (kept in Japanese to match category routing keys
 *           used across courseData / RoadmapScreen / CompletedLessonsScreen)
 * Lesson IDs: 800–807
 *
 * A course that reframes ADHD traits (hyperfocus, divergent thinking, agility,
 * novelty seeking) not as something to "fix" but as business resources to
 * leverage through environment design, role selection, and complementary
 * collaboration.
 *
 * Audience: business professionals with ADHD traits (diagnosed or self-identified)
 *
 * Important framing kept consistent across all lessons:
 * - This is not medical advice. Diagnosis, treatment, and medication decisions
 *   belong to qualified clinicians.
 * - The goal is not to "cure" or "correct" but to "change the environment,"
 *   "choose the role," and "build complementary support."
 * - Tone respects readers as professionals, not patients. No condescension,
 *   no pity, no excessive cheerleading.
 * - Traits are framed positively. Where a "weakness" framing is unavoidable,
 *   it is reframed as "situations where it does not fit."
 */
import type { LessonData } from './lessonData'

// ── Lesson 800: Reframing the traits — not weaknesses but resources ──
const adhdLesson800: LessonData = {
  id: 800,
  title: 'Reframing Your Traits — From Weaknesses to Business Resources',
  category: 'ADHDレバレッジ',
  steps: [
    {
      type: 'explain',
      title: 'Before we start — what this course is and is not',
      content:
        'This course is a practical playbook for business professionals with ADHD traits to use their own cognitive profile as a business resource — something to leverage, not something to fix.\n\nA few things to make explicit up front:\n- This is not medical advice. Decisions about diagnosis, treatment, and medication should always be made with qualified clinicians (psychiatrists, behavioral health specialists, etc.).\n- The goal is not to "cure" or "correct" ADHD. The goal is "to get the most out of yourself in an environment and role that fit your traits."\n- Both diagnosed individuals and those in the gray zone (traits present but no formal diagnosis) are within scope.\n- Readers are treated as professionals who understand their own cognitive profile and move strategically, not as "people who are struggling."\n- ADHD is classified into (a) hyperactive-impulsive presentation, (b) inattentive presentation (which includes what used to be called ADD), and (c) combined presentation (DSM-5). This course leans on hyperfocus, agility, and novelty seeking — features more typical of the hyperactive-impulsive type — but inattentive presentation (quiet drifting attention, daydreaming, more subdued behavior, internal-only restlessness) readers are equally in scope. Please read with the understanding that "hyperfocus never comes for me" or "my inattention is invisible to others" are valid trait profiles too.\n- This course assumes ADHD alone. If you also live with depression, anxiety, autism spectrum traits, sleep disorders, or other co-occurring conditions, please prioritize speaking with a qualified clinician before applying material in this course.\n- The scope is the business context. For school life, parenting, and life-overall support, please combine this course with other resources (clinical care, support organizations, peer communities).\n\nCourse structure:\n- Lesson 800–801: Self-understanding (reframing the traits, observation log)\n- Lesson 802–803: Environment design (physical environment, task design)\n- Lesson 804–805: Role and collaboration (job fit, complementary teams)\n- Lesson 806–807: Sustainability and role models (preventing burnout, studying predecessors)\n\nIf some items along the way do not apply to you, that is fine. How ADHD traits show up varies from person to person. Take only the tools that fit, and leave the rest.',
    },
    {
      type: 'explain',
      title: 'From a "deficit" model to a "trait" model',
      content:
        'ADHD has long been framed as "Attention Deficit / Hyperactivity Disorder" — a name that starts from "what is missing" or "what is wrong." Over the past two decades, both research and self-advocacy from the community have opened a different view.\n\nThe neurodiversity perspective:\n- Brains come in many configurations\n- Every configuration shows strengths in fitting environments and difficulties in mismatched ones\n- Some people frame ADHD-type cognition as "optimized for changing environments" or "tuned for novelty" (the hunter-gatherer hypothesis from Hartmann 1993 and similar). Some individuals find this framing useful for self-acceptance, but the evolutionary-psychology evidence is weak and there is no scientific consensus. Treat it as "one possible reframing," not as an established fact\n\nMuch of what looks like "deficit" is actually "mismatch":\n- Cannot stay focused → the task and environment are mismatched with your interest profile\n- Acts impulsively → in settings where speed and improvisation create value, this becomes a strength\n- Forgets things → attention is allocated to "what is in front of you now"\n- Hyperactive → a side effect of parallel idea generation and divergent thinking\n\nThe stance of this course:\nRather than trying to suppress traits as "defects," we design which environment and which role flips those traits into strengths.\n\nA caveat: this is not "ignore your difficulties." The difficulties are real. But the order of operations is "change the environment / choose the role / build complementarity" first, before "change yourself."',
    },
    {
      type: 'explain',
      title: 'Four ADHD traits, recast as business resources',
      content:
        'Instead of listing isolated characteristics, it helps to organize them as resources you can deploy.\n\nResource 1: Hyperfocus\n- The ability to lock onto a topic you find interesting for an extended stretch. The length varies widely: 30 minutes for some, several hours for others, half a day or more for others (4–8 hours is not a standard. Some individuals do not experience hyperfocus at all. Use the observation in Lesson 801 to find your own pattern)\n- Highly effective for build-it-in-one-go work, deep problem solving, research, coding, and writing\n- Hard to summon on command, but if you build an environment that "pulls it out when it comes," it can contribute meaningfully to your output\n\nResource 2: Divergent thinking\n- Branching from one question into wide associations and combining unrelated information\n- A strength for ideation, strategy, new business, copywriting, design\n- Where the value is "explode the option space," not "pick one right answer"\n\nResource 3: Agility (impulsivity, repositioned)\n- "Think of it, move on it." Take risk, act first\n- A weapon in sales, negotiation, emergency response, early-stage startups\n- Can decide faster than an "analyze-then-act" colleague ever could\n\nResource 4: Novelty seeking\n- Strong pull toward new things and change; intolerance for boredom\n- A strength in new ventures, new client development, picking up new technology, trend research\n- The trait of disliking "the same as yesterday" becomes an advantage in change-heavy domains\n\nKey point: each of these four has two sides — "a strength when controlled, a difficulty when left alone." The whole course is about how to intentionally ignite them while minimizing the side effects.',
    },
    {
      type: 'explain',
      title: 'Why "change the environment" beats "fix yourself"',
      content:
        'There are roughly three levels of response to difficulties.\n\nLevel 1: Change yourself (willpower, discipline)\n- "Train your focus," "stop procrastinating through grit," "try harder not to forget"\n- Returns are low, the toll is high. Behavioral effort does not fully change the underlying trait\n- Spending time here has poor ROI\n\nLevel 2: Change the tools and environment (the core of this course)\n- Reminders, timers, task systems, external memory (notes, "second brain")\n- Desk layout, notification blackouts, time blocks, routines that pull out hyperfocus\n- Often a 2–3× increase in output with the same person\n\nLevel 3: Change the role and place (the biggest leverage)\n- Move away from jobs full of fine-grained admin, long monotonous work, parallel case management\n- Shift toward roles where strengths shine: ideation, new business development, emergency response, creative work\n- Instead of doing it all alone, build a team or partnership that complements your gaps\n- Change the environment and the same traits stop being "problems" and start being "individuality"\n\nSame structure as leverage in business: rather than "force yourself to work 1.2× harder," "change the length of the lever (environment, role) and triple the output."\n\nThis course focuses on Levels 2 and 3. Level 1 (willpower) barely comes up.',
      visual: 'LeveragePointsDiagram',
      visualProps: {
        sectionLabel: 'Three levels of response — where to intervene',
        revealMode: 'static',
        tiers: [
          {
            label: 'Level 1',
            name: 'Change yourself',
            desc: 'Fix the symptom through willpower. High toll, low returns.',
          },
          {
            label: 'Level 2',
            name: 'Change tools & environment',
            desc: 'Notification blackouts, time blocks, external memory. 2-3x output, same person.',
          },
          {
            label: 'Level 3',
            name: 'Change role & place',
            desc: 'Move to a role where traits shine; build complementarity. The biggest leverage.',
          },
        ],
        hint: 'Rather than working 1.2x harder, lengthen the lever (environment, role) and triple the output',
      },
    },
    {
      type: 'quiz',
      question: 'Which option best describes the approach this course takes?',
      options: [
        {
          label: 'Treat ADHD traits as business resources and maximize output through environment design and role selection',
          correct: true,
        },
        {
          label: 'Center attention training and lifestyle reform to reduce the ADHD characteristics themselves',
          correct: false,
        },
        {
          label: 'Systematically learn medical treatment and medication planning to manage symptoms more precisely',
          correct: false,
        },
        {
          label: 'Share struggles among individuals with ADHD and support each other through empathy-based peer groups',
          correct: false,
        },
      ],
      explanation:
        'The course centers "change the environment and role (leverage)" rather than "change yourself (reduce the trait)." Reducing the trait itself and medication planning are medical territory and out of scope here. Peer support has value at a different layer, but is not the main purpose of this course (using the traits in business). "Reduce the symptoms" and "learn medication" are common misreadings that conflate this course with clinical care — the very confusion the opening lesson works to separate.',
    },
    {
      type: 'quiz',
      question:
        'Below are four labels for ADHD traits-as-resources. Which one does this course not treat as an ADHD trait (or has a different nature)?',
      options: [
        {
          label: 'Perfectionist quality control — the precision to catch every single detail miss',
          correct: true,
        },
        { label: 'Hyperfocus — long-haul concentration on topics you find interesting', correct: false },
        { label: 'Divergent thinking — combining unrelated information into expanded ideas', correct: false },
        { label: 'Agility — the speed to take risk and act first', correct: false },
      ],
      explanation:
        'The four traits commonly framed as ADHD strengths in this course are hyperfocus, divergent thinking, agility, and novelty seeking. "Perfectionist quality control" tends to be described under a different cognitive profile and is not what this course means by an ADHD trait. They get mixed up easily, so it helps to separate them at the start.',
    },
  ],
}

// ── Lesson 801: Self-understanding map — observing what ignites and what shuts down ──
const adhdLesson801: LessonData = {
  id: 801,
  title: 'Self-Understanding Map — Observing What Ignites and What Shuts You Down',
  category: 'ADHDレバレッジ',
  steps: [
    {
      type: 'explain',
      title: 'Why observation comes first',
      content:
        'ADHD traits show up differently across people, situations, and days.\n\n- Person A gets hyperfocus most often in the morning; Person B only late at night\n- Even the same Person A might focus easily on Mondays but be unable to start on Fridays\n- One person works best in a cafe; another cannot work at all in one\n\nApplying the generic "ADHD is like X" advice directly to yourself often produces the wrong prescription. To make the environment design in this course work, you need to know your own specific pattern.\n\nThe task is simple:\nFor two weeks, log "the conditions under which your focus ignites" and "the conditions under which it breaks."\n\nWe will call this the ignition map. After two weeks, surprisingly repeatable patterns start to emerge. Most people end up with the realization "this was not a problem with me — it was a mismatch of conditions."',
      visual: 'IgnitionMapDiagram',
    },
    {
      type: 'explain',
      title: 'Ignition conditions — breaking down the moment hyperfocus arrives',
      content:
        'Even when hyperfocus seems to arrive randomly, observation reveals combinations of triggers. The main variables to watch:\n\nTime variables\n- Within 90 minutes of waking / morning / afternoon / evening / late night\n- Before vs after meals\n- Distance to deadline (a week out vs tomorrow morning)\n\nBody variables\n- Drinks (after caffeine, herbal tea, water only, etc. If caffeine does not agree with you or is medically contraindicated, treat this row as not applicable)\n- Just after exercise (the 15–30 minute window is often peak)\n- Sleep length (under 6 hours / 7–8 hours / over 9 hours)\n- If you are on medication: observe its effective time window only in consultation with your prescriber. ADHD medication (such as methylphenidate or atomoxetine) is strictly regulated and sits on a different layer from self-selected items like caffeine — do not treat them as parallel\n\nEnvironment variables\n- Place (home desk / cafe / library / office / back room of a shop or factory / on the move / inside a car / kitchen table after the kids are asleep, etc. — list candidates that match your actual life: remote work, hard-to-leave-home situations, shift work, frontline work, parenting, etc.)\n- Sound (silent / white noise / ambient / music / conversation)\n- Sight line (cluttered desk / clear desk / facing a wall / facing a window)\n- Presence of others (alone / someone next to you / a sense of being watched)\n\nTask variables\n- Content (interesting / obligatory / new / routine)\n- Deadline (yes / no)\n- Visibility of completion (clear / unclear)\n- Input vs output ratio (reading / writing / making / speaking)\n\nFor two weeks, record these variables alongside a daily focus score (0–10). You do not have to capture every variable every day — jot down what you notice and review on the weekend. Over time, your personal ignition conditions become visible.',
    },
    {
      type: 'explain',
      title: 'Shutdown conditions — common patterns that break focus',
      content:
        'Knowing what breaks your focus matters as much as knowing what ignites it. Instead of lumping things together as "I just have no motivation," break down what is actually happening.\n\nCommon shutdown conditions:\n- Interest trough: the content is too monotonous or too familiar → the brain searches elsewhere for stimulation\n- Unclear completion: no visible end → cannot even start\n- Notification intrusion: Slack / email / SMS pings → attention scatters\n- Recent sleep debt: under 5 hours → hyperfocus does not arrive, errors increase\n- Hunger or post-meal sugar spike: big blood-sugar swings disrupt focus\n- Five-plus parallel projects: your inner work desk overflows\n- Gaps between meetings (30–60 minutes): "just until the next meeting" is too short to engage\n- Perfectionism mode: aiming at the finished form from the first stroke delays starting\n- Other peoples moods / atmosphere: relational stress hijacks attention\n\nA caveat:\nShutdown conditions often feel like "personal weaknesses," but when the conditions are removed, you can usually function normally. Reframe it as "not a capability problem — these conditions just happen to be stacked against me right now," and the direction of response shifts (away from self-blame, toward changing the conditions).\n\nExample: "I have no motivation today" → observation: "I only slept 5 hours, came in hungry, and chat notifications are on" → change the conditions: "15–30 minute nap → water and a light snack → notifications DND" → I can move. (Choice of drink varies per person; you do not have to default to caffeine.)',
    },
    {
      type: 'explain',
      title: 'A 2-week log — start at minimum cost',
      content:
        'If the act of logging becomes a heavy chore, it stops. Many people with ADHD traits find "consistent record-keeping" itself hard, so we strip the format to the bare minimum.\n\nRecommended format (writeable in 30 seconds):\n```\nDate: 5/22 (Thu)\nFocus score: 7/10\nWhen it came: 10:00–13:00\nEnvironment notes: place, sound, drink, any recent exercise (e.g., home desk / instrumental on earbuds / had breakfast / walked to commute)\nWhat broke it: post-lunch sleepiness + chat ping on another project\n```\n\nTips:\n- Paper or app — whichever you will actually keep up with\n- Do not punish yourself on days you forget. Gaps still leave readable trends\n- Log both weekdays and weekends (weekend-only patterns matter too)\n- You do not have to keep a perfect 2-week streak. Even 3 days in a row starts to show trends. Writing it down once over the weekend from memory is enough\n- After two weeks, skim it and pull out "top 3 conditions when focus ignited" and "top 3 conditions when it broke"\n\nWhat you have after two weeks:\n- Candidates for your "golden time" become visible (e.g., morning 9–12 or evening 21–24 — varies by person)\n- Candidates for "conditions worth avoiding for me" become visible (e.g., sleep debt + notifications on)\n\nWith these two visible, every subsequent lesson on environment design and task placement becomes far more effective — because you are working from a personal prescription, not a generic one.',
    },
    {
      type: 'quiz',
      question:
        'Which option best matches the purpose of keeping an ignition map, as described in this lesson?',
      options: [
        {
          label: 'Identify your own ignition and shutdown patterns so that later environment design can be sharper',
          correct: true,
        },
        {
          label: 'Objectively prove that you have ADHD and use the log as material for a clinical diagnosis',
          correct: false,
        },
        {
          label: 'Visualize the days you could not focus, in order to raise your own standards higher',
          correct: false,
        },
        {
          label: 'Measure the gap between general ADHD tendencies and your own pattern, in order to move closer to the average',
          correct: false,
        },
      ],
      explanation:
        'The purpose is gathering raw material for your own prescription. Clinical diagnosis is medical territory and not in scope. "Raise your standards" frames the work as self-blame, the opposite of this course stance. "Move closer to the average" frames the work as correction — this course searches for your personal optimum, not the average.',
    },
    {
      type: 'quiz',
      question:
        'When you notice "I just have no motivation lately," which response best matches the observation approach in this lesson?',
      options: [
        {
          label: 'Check recent conditions one by one — sleep, caffeine, notifications, task type',
          correct: true,
        },
        {
          label: 'Acknowledge "my willpower is weak" and resolve to do better starting tomorrow',
          correct: false,
        },
        {
          label: 'Accept "this is just ADHD" and wait until things naturally recover',
          correct: false,
        },
        {
          label: 'Search social media for people in similar situations and collect posts that resonate',
          correct: false,
        },
      ],
      explanation:
        'The lesson frame is "observe it as a conditions problem, not a capability problem." Attributing it to weak will (self-blame) or to "just ADHD" (helplessness) both forfeit the chance to change conditions. Searching for resonating posts has value as peer support, but it is not the same act as identifying your own ignition conditions.',
    },
  ],
}

// ── Lesson 802: Environment design (physical) — desk, notifications, time blocks ──
const adhdLesson802: LessonData = {
  id: 802,
  title: 'Physical Environment Design — Desk, Notifications, and Time Blocks',
  category: 'ADHDレバレッジ',
  steps: [
    {
      type: 'explain',
      title: 'Your physical environment becomes your "extended brain"',
      content:
        'People with ADHD traits are often described as having narrower and more volatile working memory (the temporary work desk in your head) than neurotypical people. Rather than treating this as a defect, design around it as "a setup built to lean on external support."\n\nA key shift in framing:\nNot "try harder to not forget" but "build an environment where forgetting does not cause damage."\nNot "try harder to not get distracted" but "physically remove the things that distract you."\n\nThis lesson is about arranging the physical environment so that you do not have to spend cognitive resources on the basics. Same person, much higher output.\n\nThree areas we will cover:\n- Desk and sight line design (stop attention from leaking out)\n- Notifications and interruptions (stop attention from being broken in)\n- Time block design (reserve how attention gets allocated)',
    },
    {
      type: 'explain',
      title: 'Desk and sight line — stop attention from leaking out',
      content:
        'Many people with ADHD traits describe being pulled toward whatever is in their visual field. Just having your phone in sight, even powered off, can claim part of your cognitive resources (whether or not you notice).\n\nMinimum-cost, high-impact moves:\n\n1. On your desk, keep only the tools for the current task\n- Move unrelated papers, books, and small objects into a drawer or another space\n- Have one "put it here for now" box you can deal with later\n- You do not need perfect organization. It just needs to be out of sight\n\n2. Put your phone where you have to physically get up to reach it\n- Same room is fine, as long as you have to stand up\n- Notifications off is not enough — the visible screen still pulls attention\n- During hyperfocus windows, put it in another room or a drawer\n\n3. Narrow your visual field with a wall, partition, or monitor\n- Open offices can carry too much information\n- Avoid having moving things or moving people inside your visual frame\n- At home, face a wall; at work, use a large monitor as a physical screen\n\n4. Hide things that "remind you of something else when you see them"\n- The half-read book, the unfinished paperwork, the note for a different project — remove from sight\n- Each one in view occupies a full task slot in your inner work desk\n\nA warning against overdoing it:\nThe goal is not "perfect silence and a blank field" but "only the current task in view." Once perfectionism mode kicks in, environment cleanup itself becomes a procrastination excuse.',
    },
    {
      type: 'explain',
      title: 'Notifications and interruptions — stop attention from being broken in',
      content:
        'Even after you enter a focused state, the standard finding is that one notification costs 15–25 minutes of recovery (Mark et al., see Gloria Marks "Attention Span"). For people with ADHD traits, the recovery cost tends to be even longer.\n\nA tiered approach to notifications:\n\nTier 1: Off at all times\n- All social media notifications (X / Instagram / TikTok / LinkedIn)\n- News apps, shopping apps\n- Email push notifications (badge icons off too)\n\nTier 2: On or off by time of day\n- Slack, Teams, business chat\n- Calendar (only the 5-minute meeting reminder)\n- Fully off during focus windows (see the time-block section)\n\nTier 3: On at all times\n- Phone calls (emergency contact only)\n- Trusted close contacts (family, manager, partner)\n- Security alerts (2FA, etc.)\n\nImplementation tools:\n- iOS / Android "Focus mode" or DND scheduled by time\n- macOS Focus mode, Windows Focus Assist scheduled by time\n- Slack notification schedules (off 9–12, on 12–13, etc.)\n\nManaging the human side:\n- In remote-friendly or autonomous workplaces, you can tell your manager and coworkers in advance that you will respond slowly during focus blocks\n- In workplaces with a strong immediate-response culture, it is more realistic to first negotiate one-on-one with a single trusted manager or coworker, then expand the practice gradually\n- Set the rule "phone for urgent / chat for normal (reply within half a day)"\n- If your environment expects "always immediately responsive," that itself is likely mismatched with your cognitive profile. This is a role design issue, covered in Lessons 804–805\n\nFallbacks when you cannot change the environment:\nIn workplaces where reading the room, immediate-response culture, or rigid hierarchy makes it hard to "declare focus time," you can still work from your own side: (a) use the lunch break as a hyperfocus window, (b) come in 30 minutes early, (c) move physically to a different space (meeting room, cafe area), (d) split your week so deep work lands on remote days. Changing the broader culture takes time — for now, fight inside what you can control.\n\nDo not aim for 100%:\nYou do not need to block all notifications. Blocking 3–4 hours when you want to pull out hyperfocus is enough.',
    },
    {
      type: 'explain',
      title: 'Time blocks — reserve how attention gets allocated',
      content:
        'The strongest time-management approach is not "a to-do list" but "calendar blocks." The to-do list is a particularly dangerous trap for people with ADHD traits:\n\n- Morning: list 10 items → cannot decide which to start → start the easiest → important ones get left → roll over to tomorrow → list inflates → motivation collapses\n\nCalendar-block approach:\nPut tasks in your calendar with a "when" — turn the list into an appointment.\n\nFour principles for block design:\n\n1. Hardest task in your golden time\n- In your peak window from Lesson 801, schedule the work that needs the most focus\n- Mark this block "higher priority than meetings" and "no interruptions"\n- Aim for 90–120 minutes (or 3–4 hours for the hyperfocus type)\n\n2. Low-focus tasks in low-energy windows\n- Email replies, expense reports, deck polishing, light meetings\n- Stack them in the post-lunch slump (often 14:00–16:00)\n\n3. Bundle meetings\n- Scattered meetings make the gaps useless (30 minutes often is not enough time to ramp into focus)\n- Set your own rule: "meetings only in the afternoon" or "meetings only Tuesday and Thursday"\n- You may need to negotiate with coworkers, but it is worth it\n\n4. Always include buffers\n- Schedule a 15–30 minute break after each 90-minute focus block\n- Hyperfocus types forget breaks and crash. Use timers and calendar notifications to enforce them\n- A bufferless schedule breaks down within days\n\nWhy calendar blocks work:\n- The cognitive cost of "what do I do next?" disappears (it is already on the calendar)\n- The "where do I start with my procrastination?" problem dissolves\n- Whatever you do not finish slides to tomorrow — reducing the guilt loop',
    },
    {
      type: 'quiz',
      question:
        'Which option best matches the main message of physical environment design in this lesson?',
      options: [
        {
          label: 'Design sight line, notifications, and time allocation physically so the environment carries the load of staying focused',
          correct: true,
        },
        {
          label: 'Train your focus itself so you can keep up productivity in any environment',
          correct: false,
        },
        {
          label: 'Organize your desk perfectly and keep every paper and tool arranged in proper order at all times',
          correct: false,
        },
        {
          label: 'Completely cut off your phone, social media, and all notifications and switch to an ascetic lifestyle',
          correct: false,
        },
      ],
      explanation:
        'The core message is "let the environment carry the load." Training focus itself (changing yourself) goes against the course stance. Perfect organization easily becomes its own procrastination excuse — "only the current task in view" is enough. Total blackout is not sustainable; what is needed is "blackout only during the windows when you want to pull out hyperfocus."',
    },
    {
      type: 'quiz',
      question:
        'Which best matches this lesson argument for why calendar blocks outperform to-do lists?',
      options: [
        {
          label: 'Reserving "when" in advance removes the cognitive cost of deciding what to do next',
          correct: true,
        },
        {
          label: 'A fixed schedule generates strong responsibility and pressure that eliminates procrastination',
          correct: false,
        },
        {
          label: 'A packed calendar signals busyness to others and improves how you are perceived',
          correct: false,
        },
        {
          label: 'To-do lists are paper-based while calendars are digital, so the technology is simply better',
          correct: false,
        },
      ],
      explanation:
        'The key advantage is "pay the decision cost up front." Working from pressure is not sustainable and accelerates burnout. "How you look to others" and "paper vs digital" are beside the point. Many people with ADHD traits report derailing whenever they have to decide "what do I do next" — pre-booking eliminates the entry point for that derailment.',
    },
  ],
}

// ── Lesson 803: Environment design (tasks) — pulling out hyperfocus, removing friction ──
const adhdLesson803: LessonData = {
  id: 803,
  title: 'Task Design — Pulling Out Hyperfocus and Removing the Friction to Start',
  category: 'ADHDレバレッジ',
  steps: [
    {
      type: 'explain',
      title: 'The "shape" of a task decides how focusable it is',
      content:
        'Same person, same environment — yet the wording and shape of a task changes how easy it is to start. Many people with ADHD traits report being especially sensitive to "the friction up to the point of starting." They share the experience of being able to sprint once they begin, but finding the very act of starting absurdly heavy.\n\nThis lesson has two pillars:\n- Task design that pulls out hyperfocus: shape the task so that once you ride it, you can run to the end\n- Removing the friction that causes procrastination: lower the physical and psychological bar to starting\n\nThe approach is not "produce motivation" but "shape the task so that you can start without needing motivation."',
    },
    {
      type: 'explain',
      title: 'Five conditions that pull out hyperfocus',
      content:
        'Hyperfocus is not just "something to wait for" — it is something you can summon by stacking the conditions. From observation, these five conditions repeatedly trigger it:\n\nCondition 1: There is a tilt toward interest\n- A task that is 100% obligation does not start\n- It needs at least some connection to what you care about\n- If no connection exists, reframe at least part of the task to tie it to interest\n  - Example: "process expenses" → "analyze my own spending patterns"\n\nCondition 2: Completion is visible\n- "Write the proposal" is too vague to start\n- "Write the first 500-word section (Background) of the proposal" is concrete enough to start\n- The brain moves more easily when "distance to done" is visible\n\nCondition 3: The deadline is at medium range\n- Too far (3 months out) → cannot start\n- Too close (1 hour out) → panic kills quality\n- "24–72 hours out" is often described as the sweet spot by many with ADHD traits (individual variation is large)\n\nCondition 4: The bar to starting is low\n- "I will count it as done if I just name the file" — that low\n- Decide "I will only do 5 minutes." In most cases, you do not stop at 5 minutes and end up working for hours\n\nCondition 5: No interruptions\n- The notification and sight-line blackouts from Lesson 802 are prerequisites\n- Hyperfocus is fragile. Once broken, it often does not return the same day\n\nApplication: for important tasks, rewrite the task itself to meet these five conditions, then drop it into the calendar. Instead of "I do not feel motivated, so I will not start," try "the conditions are not stacked yet — let me stack them."',
    },
    {
      type: 'explain',
      title: 'Procrastination, decoded — it is "friction," not "laziness"',
      content:
        'Procrastination is one of the largest pain points for many with ADHD traits, but breaking it down often reveals it is "a friction problem, not a motivation problem."\n\nTypical sources of procrastination friction:\n\n1. The task is too large\n- "Write the paper," "build the business plan" — too abstract, no visible end\n- Friction removal: break it down to chunks that finish in 30 minutes or less\n\n2. The first action is not specified\n- "Prepare the materials" → which file do I open?\n- Friction removal: specify to the level of "open a new PowerPoint file"\n\n3. Cost of launching tools\n- Find the file, log in, authenticate, open the folder\n- Friction removal: set things up the day before (file open, PC asleep)\n\n4. Anticipation of failure\n- "I might not write it well," "I might get scolded" → avoid starting\n- Friction removal: give yourself permission for "a draft is fine," "fix it later"\n\n5. Perfectionism\n- Aiming for the finished version from the first stroke → delays starting\n- Friction removal: split "the zero-to-one phase" and "the polishing phase" across different days\n\n6. The point of the task is unclear\n- "Why am I even doing this?" is not internalized\n- Friction removal: write one sentence on what it does for you (30 seconds)\n\nThe 5-minute starting rule:\nGive yourself permission: "5 minutes only — I can stop after 5 minutes." In most cases you do not stop at 5 and end up running for hours. Get past the friction of starting and hyperfocus takes you the rest of the way.',
    },
    {
      type: 'explain',
      title: 'Task templates — write them in a shape that is easy to start',
      content:
        'Whether you use a task app (Todoist / Asana / Notion / etc.) or paper, how you write the task changes your start rate.\n\nHard-to-start examples:\n- "Proposal"\n- "Sales prep"\n- "Email processing"\n- "Create materials"\n\nEasy-to-start examples:\n- "Write the opening 500 words (Background section) of the proposal in Word"\n- "Sales prep: read Company As website for 15 minutes and write down 3 insights"\n- "Email processing: of the 20 unread, reply only to the 3 from my manager"\n- "Materials: write a bullet-list outline (5 section titles) for the PowerPoint"\n\nFour elements of an easy-to-start task (in this course we call it the YODA format — a course-specific mnemonic that sits alongside existing frameworks like SMART or GTD):\n- Y: Yourself doing — concrete verb ("write," "send," "read," not "think")\n- O: Open — the very first action ("open Word," "go to Company As website")\n- D: Document — the form of the output ("a Word file," "3 lines of notes")\n- A: About how long — rough duration ("15 min," "30 min")\n\nOne task, one file:\n- For each task, link one file (or one URL)\n- "Where are the materials?" or "Which folder has the data?" generates a lot of starting friction\n- Adding [link] to the task name dramatically improves start rate\n\nDo not aim for perfection:\nYou do not have to convert every task to this format. Start with the tasks that have been stalling the longest — that is where the impact shows.',
    },
    {
      type: 'explain',
      title: 'Three escape routes for tasks you really cannot start',
      content:
        'Even with these tricks, some tasks just will not start. The point here is not to spiral into self-blame, but to have three escape routes ready.\n\nEscape route 1: Pull other people in\n- "Do it together," "have someone watch you" — this is called body doubling in the English-language ADHD community\n- A file you cannot open alone, you can open with someone next to you. Many people with ADHD traits share this experience\n- Works online too: Zoom audio kept on, a Discord voice channel kept open, dedicated co-working services like focusmate.com — pick whichever fits your home setup and connection\n\nEscape route 2: Create or remove a deadline\n- No deadline → set one yourself (promise someone "I will send it by Friday")\n- Deadline too far → create a midpoint (schedule a review next week)\n- Deadline too pressured → negotiate to push it out (results over guilt)\n\nEscape route 3: Delegate, outsource, or automate\n- Always check first: "is there a version where I do not do this myself?"\n- Accounting software, AI writing, tool automation, outsourcing, internal handoff\n- Continuing to absorb tasks that drain you is the most inefficient long-term\n- Covered in detail in Lesson 805 (complementary collaboration)\n\n"Escaping" is a strategy:\nGritting through tasks you are bad at until you burn out produces less value — for you and for the people around you — than deciding up front "I am not the one to do this."\n\nOne exception: tasks only you can do that are strategically critical (e.g., the founder deciding the company direction). Do not escape these — combine the environment design from Lesson 802 and the task design from this lesson to make starting possible.',
    },
    {
      type: 'quiz',
      question:
        'Which option best matches how this lesson reframes "procrastination" for people with ADHD traits?',
      options: [
        {
          label: 'Not a sign of laziness, but a state where the shape of the task contains friction that prevents starting',
          correct: true,
        },
        {
          label: 'A sign of weak focus that should be cured at the root through meditation and exercise',
          correct: false,
        },
        {
          label: 'A failure of prioritization that should be overcome through more advanced task management techniques',
          correct: false,
        },
        {
          label: 'A lack of responsibility — fix it by motivating yourself through guilt about its impact on others',
          correct: false,
        },
      ],
      explanation:
        'The core reframe is "procrastination is not laziness, it is friction." Meditation and exercise (changing yourself) go against the course stance. "More advanced task management" is also a change-yourself approach, and complex systems often add friction rather than remove it for people with ADHD traits. Guilt-based motivation works short term but is a top cause of burnout.',
    },
    {
      type: 'quiz',
      question:
        'Compared to writing "sales prep" on a task list, which alternative best matches the easy-to-start format?',
      options: [
        {
          label: '"Read Company A website for 15 minutes and write down 3 insights"',
          correct: true,
        },
        { label: '"Important: finish all sales prep perfectly by tomorrow"', correct: false },
        { label: '"Sales prep (Company A / Company B / Company C)"', correct: false },
        { label: '"Sales account pre-research and document organization, full set"', correct: false },
      ],
      explanation:
        'The essence of easy-to-start is "concrete verb + visible duration + clear first action." "Finish perfectly" invites perfectionism mode and delays starting. "Three companies in parallel" is too large a chunk to start. "Pre-research and document organization, full set" is too abstract — the "where do I even start?" state that many with ADHD traits find especially hard.',
    },
  ],
}

// ── Lesson 804: Career strategy — spotting roles that fit and roles that drain ──
const adhdLesson804: LessonData = {
  id: 804,
  title: 'Career Strategy — Spotting Roles That Fit and Roles That Drain',
  category: 'ADHDレバレッジ',
  steps: [
    {
      type: 'explain',
      title: 'Choosing the role is the biggest career leverage',
      content:
        'Environment design (Lesson 802) and task design (Lesson 803) reliably raise output. But if you stay long in a role where your traits structurally do not fit, no amount of environment work outpaces the drain.\n\nIn business strategy, the biggest lever for "the same effort, three times the result" is "what you choose to do (strategy)." The same is true for careers.\n\nThe purpose of this lesson:\n- Understand which roles structurally activate ADHD traits and which structurally do not\n- Diagnose where your current role sits\n- If you are on the wrong side, have a framework for the decision (change tasks / change role / change company)\n\nA caveat:\n"Roles that do not fit" does not mean "roles you must not do." There are times when one is a necessary stage to pass through. The point is to be aware whether the current place fits your cognitive profile or not.',
    },
    {
      type: 'explain',
      title: 'Characteristics of roles where ADHD traits structurally fit',
      content:
        'Roles that share many of these features tend to let ADHD traits become leverage:\n\nFeature 1: Frequent change and novelty\n- New business launches, new client development, new product planning\n- M&A, venture capital, consulting (engagements turn over constantly)\n- Founders, early-stage startup members\n→ The trait of disliking "the same as yesterday" flips into a strength in change-heavy domains\n\nFeature 2: Idea generation and divergent thinking create value\n- Planning, strategy, creative direction, copywriting\n- Editorial, journalism, research (hypothesis generation)\n- Design, art, music production\n→ The ability to generate many options and select beats narrow-funnel work\n\nFeature 3: Crisis and emergency response is daily\n- Emergency medicine, disaster response, IT troubleshooting, server incidents\n- Quick-response sales, crisis communications, trading, news desks\n→ Agility and the ability to focus under adrenaline pay off\n\nFeature 4: High autonomy and discretion\n- You build your own schedule; no micromanagement from above\n- Freelance, researcher, professional specialist, remote-heavy roles\n→ You can fully apply the environment design from Lesson 802 on your own terms\n\nFeature 5: Evaluated on outcomes\n- Judged on "did the result happen" rather than "did the process look right"\n- Sales, founding, investing, writing, consulting, engineering\n→ A world that adds points for outcomes makes it easier to translate the traits into value than a world that deducts points for procedural slips\n\nNote on E-1-a: there are roles beyond founder and creative work where the traits also activate\n- Research roles: postdocs, independent researchers, think-tank analysts — work that needs hypothesis generation, novel-area exploration, and cross-disciplinary thinking\n- Education roles: instructors, prep-school teachers, university tutors — anywhere the content shifts each session and you have to bring the audience along\n- Specialized technical roles: emergency medicine, surgery, ER nursing, IT infrastructure operations, cybersecurity incident response\n- Craft roles: chefs (especially those developing new menus), traditional crafts, stage direction, site supervision in construction\n- Sales / marketing: enterprise new-business development, PR, community management\n- Public / non-profit: policy advocacy, disaster relief NGOs, journalism\n→ The shared elements are "change is daily," "you can act autonomously," and "you can speak through outcomes or finished work" — and they do not necessarily require independence or founding\n\nExamples of publicly self-identified individuals (note the heavy skew toward Western founders):\n- Western: Ingvar Kamprad (founder of IKEA), Richard Branson (founder of Virgin), David Neeleman (founder of JetBlue), Simon Cowell (music producer)\n- Japan: Rui Kuribayashi (actor, publicly identified with ADHD), Fukase (frontman of SEKAI NO OWARI, publicly identified with ADHD), Kazuyo Katsuma (economic commentator, publicly identified with ADHD), Takuji Ichikawa (novelist, publicly identified with ADHD)\n- Fields with publicly identified individuals span acting, music, writing, research, founding, freelance work, and engineering\n\nA caveat: the names above are examples of publicly self-identified individuals, and their current self-understanding may shift over time. Readers should check the recency of the source themselves. It is also true that the publicly silent majority is far larger than the publicly identified group — do not read this list as "these few are the only role models."\n\nThe common thread: positions with some room to make your own decisions, in change-heavy domains, in worlds evaluated on outcomes or finished work.',
      visual: 'TraitEnvironmentMatrixDiagram',
    },
    {
      type: 'explain',
      title: 'Characteristics of roles where ADHD traits structurally do not fit',
      content:
        'Conversely, roles with many of these features tend to chronically drain people with ADHD traits:\n\nFeature 1: Detail errors are catastrophic\n- Accounting, audit, contract review, quality control, medical administration\n- High-volume invoice processing, data entry, proofreading, inspection\n→ Attention lapses cause direct damage. The complementary system in Lesson 805 becomes essential\n\nFeature 2: Monotonous, repetitive, long-running\n- The same task for 8 hours, the same daily steps, the same customer scripts\n- Routine-centric admin, call centers (identical scripts), assembly lines\n→ Novelty seeking is starved; focus chronically breaks\n\nFeature 3: Parallel management of many cases\n- Tracking 10 projects in parallel, juggling fine-grained requests from many clients\n- Manager roles (individual oversight of 10–20 reports), large-scale PM work\n→ Constantly above working-memory ceiling; gaps become unavoidable\n\nFeature 4: Perfect planning and predictability\n- Move months ahead exactly to plan; no schedule changes allowed\n- Large-company management track, traditional admin, regulated procedural work\n→ Agility and novelty seeking become liabilities rather than assets\n\nFeature 5: Process-heavy evaluation with invisible outcomes\n- Evaluated on "did you follow the right procedure," "did the report go out on time"\n- A world that accumulates deductions for procedural details\n→ Results may be there, but evaluation drops on the edges; self-efficacy erodes\n\nImportant:\nThese roles are not "bad." It is the mismatch with the traits that is large. Even in the same role, complementary systems (Lesson 805) and environment design (Lesson 802) can minimize the drain. If the drain stays high for long, you can use it as material — together with finances, family, and career context — to discuss with someone you trust whether changing role or company is realistic for you. The decision is yours.',
    },
    {
      type: 'explain',
      title: 'Is your current job a fit? — four diagnostic axes',
      content:
        'Changing jobs or roles is a major decision. Acting on feel alone leads to regret. Use these four axes:\n\nAxis 1: Energy balance\n- After work, does the "drained" feeling outweigh the "satisfied" feeling?\n- Even after a weekend off, does the fatigue stay?\n- Does thinking about work in the morning make you nauseous?\n→ Even one sustained "yes" suggests a large mismatch with the role\n\nAxis 2: Frequency of strengths activated\n- How often per month do your divergent thinking, agility, or hyperfocus actually engage in this job?\n- When was the last time you felt "I am glad I did that"?\n→ If less than once a month, you are barely using your strengths\n\nAxis 3: Structure of failures\n- What kind of failure or criticism recurs?\n  - A) Attention lapses, gaps, forgetfulness → directly tied to ADHD traits; large room for environment-side fixes\n  - B) Lack of skill or knowledge → addressable through learning\n  - C) Interpersonal friction → a different problem\n→ If A dominates overwhelmingly, suspect a role mismatch\n\nAxis 4: The 5-year horizon\n- On the current trajectory, in five years, will you be more alive or more drained?\n- Look at the managers and seniors above you on the same path — do you want to become that?\n→ If "no," the time to change direction is while you can still choose\n\nDecision frame:\n- All four healthy → go deeper in your current spot (further optimization through environment and task design)\n- 1–2 axes at risk → try a role shift, reorganized responsibilities, or a stronger complementary setup\n- 3–4 axes at risk → consider larger options including a change of company or independence\n\nDo not rush:\nAgility is a strength for short-cycle decisions (quick sales response, crisis work, catching new ideas) but tends to backfire on decisions with long-tail impact such as resigning or moving jobs. The safe sequence is 3 months of observation → 1 month of consideration → action. The point is not to suppress agility itself — it is to separate function from use case.',
    },
    {
      type: 'quiz',
      question:
        'Which option best matches a role where ADHD traits structurally fit, as described in this lesson?',
      options: [
        {
          label: 'Domains rich in change and novelty, where agility creates value and outcomes are the evaluation',
          correct: true,
        },
        {
          label: 'Roles where work proceeds exactly to long-term plans and every detail of process is managed perfectly',
          correct: false,
        },
        {
          label: 'Positions that manage many parallel cases at once and keep progress flawless across all of them',
          correct: false,
        },
        {
          label: 'Jobs that repeat the same work at high precision over the long term to maintain stable quality',
          correct: false,
        },
        {
          label: 'Roles that follow a manager instructions precisely and stick strictly to defined processes',
          correct: false,
        },
      ],
      explanation:
        'Change, agility, and outcome-based evaluation are the conditions under which the four resources (hyperfocus, divergent thinking, agility, novelty seeking) flip into strengths. The other options (long-term planning, parallel management, repetition, follow-instructions) are exactly the conditions where the traits become liabilities — they map to the "roles that do not fit" set this lesson laid out.',
    },
    {
      type: 'quiz',
      question:
        'Which of these is not one of the four axes this lesson uses to diagnose fit between your current job and your traits?',
      options: [
        {
          label: 'How you are perceived by colleagues and managers (external evaluation)',
          correct: true,
        },
        { label: 'Energy balance (the ratio of drain to satisfaction)', correct: false },
        { label: 'Frequency of strengths activated (how often hyperfocus and divergent thinking engage)', correct: false },
        { label: 'Structure of failures (whether criticism stems from traits or from skill)', correct: false },
      ],
      explanation:
        'The four axes in this lesson are "energy balance," "frequency of strengths activated," "structure of failures," and "the 5-year horizon." "External evaluation" looks plausible as an axis, but people with ADHD traits tend to be over-swayed by external evaluation, and it does not function as a measure of fit between cognitive profile and environment. This course makes the call from internal coherence, not external view.',
    },
  ],
}

// ── Lesson 805: Complementary collaboration — partners, delegation, team design ──
const adhdLesson805: LessonData = {
  id: 805,
  title: 'Complementary Collaboration — Partners, Delegation, and Team Design',
  category: 'ADHDレバレッジ',
  steps: [
    {
      type: 'explain',
      title: 'Drop the "I will do everything myself" mindset',
      content:
        '"I burned out trying to do it all myself" is an experience many people with ADHD traits share. The combination of novelty seeking and hyperfocus makes you good at starting new things. But carrying the follow-through, operations, detail-level quality assurance, and ongoing progress tracking alone almost always breaks.\n\nThe business perspective:\nStrong companies are not "everyone can do everything." They split the work by strengths and complete the whole through complementarity. Apple was Jobs (vision and new ideas) and Wozniak (implementation and detail). Jobs and Cook (operations) followed the same structure.\n\nThe same applies to an individual career:\nStructurally offloading what you are bad at to people, tools, or systems who are good at it maximizes both long-term sustainability and output.\n\nThere are also seasons when you cannot build complementarity:\nSparse relationships, no budget for outsourcing, no allies at work, a life arrangement that leaves no one to lean on — these happen to everyone. During those periods, leaning more heavily on Lesson 802 (environment design) and Lesson 803 (task design), inside what you can control, is also a sound strategy. Come back to this lesson when complementarity becomes available again.\n\nThis lesson designs complementarity in three layers:\n- Partner (one-on-one complementarity)\n- Delegation (move work to another person or tool)\n- Team design (role division across multiple people)',
    },
    {
      type: 'explain',
      title: 'Partner — one-on-one complementarity',
      content:
        'A combination that often gets described as working well is "ADHD-type × someone who plays a complementary role." Many historically successful business partnerships share this complementary structure.\n\nRoles a complementary partner often plays (described as behaviors and roles, not as identity labels):\n- Catches detail-level checks and proofreading\n- Sequences, schedules, and tracks progress without finding it draining\n- Completion-oriented (finishes what gets started)\n- Moves stepwise and on plan\n- Willing to pause an impulsive decision long enough to check the risk\n- Does not break down repeating the same thing over long periods\n\nA note: this is not meant to fix "complementary type = autistic-spectrum" or "complementary type = detail-strong person." Two people with ADHD traits can complement each other, and teams of all-ADHD-traits members can work too. What matters is not the label, but the role and the behavior the person actually performs.\n\nWhat the ADHD side provides:\n- New direction, breakthroughs, quantity and speed of ideas\n- Crisis response, improvisation, energy, ability to bring people along\n- Openly asks the partner to take on the routine work the ADHD side has no interest in\n- Consciously names appreciation for the role the partner is carrying (often described as one of the elements that keeps the relationship sustainable)\n\nBusiness examples of partnerships:\n- Founding: CEO (vision, sales) × COO (operations, implementation)\n- Freelance: you (creative) × agent (admin, accounting)\n- Sales: you (new development) × support (existing-client follow-up)\n- Research: you (hypothesis generation) × collaborator or postdoc (running experiments)\n\nCautions:\n- The partner must get value too (purely one-way complementarity does not last)\n- The relationship must be open enough that you can share your weaknesses honestly (hiding them prevents complementarity from working)\n- Saying out loud "I am genuinely bad at this and I am truly grateful for this strength of yours" is what keeps the relationship sustainable\n\nSupport in personal life (across diverse life arrangements):\nOutside of work, many people with ADHD traits are partially complemented by people they can rely on: a spouse, a household member, a partner living separately, housemates, long-term friends, coaches, local support workers, paid household help, and so on. Life arrangements vary widely — single, single parent, separated marriage, same-sex couples, residential care, and so on. Rather than assuming "the spouse is the support," it is more realistic to build support from multiple directions that fit your actual life arrangement.\n\nAlso check, consciously, that personal-life support does not slide into uncompensated care work. Is the relationship genuinely valuable for the other person too? Is there compensation or role exchange that makes it balanced? Framed as "functional division of labor" rather than "dependence," it stays healthier for both sides.',
    },
    {
      type: 'explain',
      title: 'Delegation — move work to another person or tool',
      content:
        'When a partnership is not available, or when you want to let go of specific tasks only, delegation is the lever.\n\nDelegation priority (in order of how much it drains you):\n\nFor solo founders, freelancers, and small businesses:\n1. Expense processing and bookkeeping → accounting software (QuickBooks, Xero, Freshbooks) or hand it to an accountant\n2. Receipt management → scanner app + auto-categorization\n3. Detailed scheduling → assistant or tools like Calendly\n4. First-pass email response → AI draft reply tools, canned templates\n5. Meeting notes → AI note tools (Otter, tl;dv, Fireflies, etc. — pick by feature, not brand)\n6. Final document polishing → designer or template usage\n\nFor employees (especially at large companies):\nAccounting tools, AI meeting-note services, and external scheduling tools are often blocked due to IT approval requirements or data-leak concerns. In that case, combine personal-level workarounds that complete inside your own boundary.\n- Accounting tools → keep work memos in your personal Notion or Excel template, while leaving the official submission on paper or in the internal system\n- Meeting-note AI → use a voice recorder app for your own personal notes, while keeping official minutes minimal and handwritten\n- Scheduling → use your own Outlook or Google Calendar to pre-decide candidate windows, and offer them in replies\n- First-pass emails → maintain your own template library in Notion or Word\n- Use the approved internal tools your company does provide, to the maximum extent\n\nConsider delegating next:\n7. Data entry and transcription\n8. Detailed copyediting and proofreading\n9. Customer list maintenance and updates\n10. Facilitation of recurring meetings (if you tend to let discussions drift)\n\nKeep doing yourself:\n- Strategy and direction decisions\n- New idea generation\n- Crisis response and breakthroughs\n- Major outputs that go out under your name\n- Building important relationships\n\nPsychological hurdles to delegation:\n- "Can I trust someone else with this?" → trust the capability of the person you delegate to (and if not, pick someone else)\n- "It would be faster if I did it myself" → calculate how many hours per month you actually spend on it. Annualized, the delegation cost is dwarfed\n- "I want to stay aware of everything" → "awareness" itself is an oversized cost for people with ADHD traits. A summary from the person you delegated to is enough\n\nTool delegation (AI and automation):\nAs of 2026, delegation to AI is expanding rapidly.\n- Draft writing, research summaries, meeting notes, email replies, code completion, image generation\n- For "not big enough to hire someone but eating your time," try AI first',
    },
    {
      type: 'explain',
      title: 'Team design — absorb your weaknesses through structure',
      content:
        'If you are in a manager or project lead position, you can build complementarity directly into the team composition.\n\nExample of a complementary team:\n\nCase: you (ADHD-type leader) + 5 members\n- You: strategy, new client development, external relations, breakthrough work\n- Member A (operations type): progress tracking, sequencing, scheduling\n- Member B (quality type): detail-level checks on outputs, proofreading, contract clauses\n- Member C (record type): notes, knowledge management, documentation\n- Member D (execution type): steady implementation, ongoing work, routine tasks\n- Member E (empathy type): relationship management, internal care, motivation\n\nIn this structure, the areas where you are weak (detail, persistence, sequencing) are covered by other members, leaving you free to focus on where you are strong.\n\nPrinciples of team design:\n\nPrinciple 1: Hire for complementarity\n- Do not collect copies of yourself\n- Intentionally hire "people who are good at what I am bad at"\n- Align on values, but diversify on thinking styles\n\nPrinciple 2: Make roles and evaluation explicit\n- Not "everyone can do everything" but "each person carries their role"\n- Build a culture that values complementary members work as "invisible but indispensable"\n- Keep both outcome evaluation and process evaluation\n\nPrinciple 3: Do not hide your weaknesses as the leader\n- When the leader admits weaknesses, complementary members feel safe to act\n- Make it explicit: "I am bad at this, so I need your help"\n- If you pretend to be strong, the team complementary function does not engage\n\nPrinciple 4: Never run out of gratitude\n- Complementary-type work is quiet and easy to miss. Express thanks intentionally\n- Make it a habit to say "thanks to you, I can move at all"\n- ADHD-type leaders are usually being helped far more than they realize',
      visual: 'EmpathyMapDiagram',
    },
    {
      type: 'explain',
      title: 'How to share your traits with others',
      content:
        'In complementary collaboration, the final practical question is: "how much, and in what form, do I disclose my traits?"\n\nThree levels of disclosure:\n\nLevel 1: Behavior level (most pragmatic and broadly applicable)\n- "I cannot focus with a lot of notifications, so I respond slowly on Slack in the morning"\n- "I am not good at detailed number checks, so I always have someone else do the final pass"\n- "I tend to forget tasks — please remind me via Slack DM rather than email"\n→ No diagnostic label. Just behavior and requests. The most usable level\n\nLevel 2: Tendency level (for trusted partners)\n- "I tend to be weak at multitasking, so could we cap parallel cases at three?"\n- "I am good at ideation but weak at running operations on the details. I would love to hand that part off"\n→ Share your cognitive profile in generalized language\n\nLevel 3: Diagnostic-label level (only for highly trusted close contacts)\n- "I actually have an ADHD diagnosis, and these are my specific traits"\n→ Only for partners, spouses, long-term close friends with deep trust\n→ Workplace disclosure depends heavily on context. Because the possibility of discriminatory treatment exists, judge carefully\n\nMaterial to consider before workplace disclosure at the diagnostic-label level:\n- First, try Level 1 (behaviors and requests only) with a single trusted manager and see how the relationship responds\n- Consult with occupational health or HR before going further. If your company has no occupational health, use an external EAP (Employee Assistance Program)\n- If considering moving to a disability-employment track (where it exists locally), check changes to salary, career path, and job scope in advance\n- Anticipate the effect on transfers, promotions, and evaluations after disclosure. Research prior cases inside your current company if any\n- In Japan-style workplaces especially, the consequences depend heavily on seniority systems, evaluation practices, and norms in the labor market — temperature varies widely by company and industry\n- Disclosure is hard to walk back. Compare multiple options before committing\n\nDisclosure principles:\n- Get the most complementarity from the least disclosure (Level 1 is often enough)\n- Frame it as a proposal — "this setup produces better results" — rather than "I am struggling, please help me"\n- Always add the benefit to the other person (your output goes up)\n- Not a one-way reveal; share what is needed, in dialogue\n\nA note on diagnosis and disclosure:\nWhether to seek a diagnosis and whether to disclose are deeply personal decisions. This lesson is purely a practical approach to building complementary support — it is not a recommendation to seek diagnosis or to disclose.',
    },
    {
      type: 'quiz',
      question:
        'Which option best matches the foundational idea of complementary collaboration in this lesson?',
      options: [
        {
          label: 'Focus on your strengths and structurally offload weak areas to people, tools, or team design',
          correct: true,
        },
        {
          label: 'Consciously practice your weak areas until eventually you can handle every task on your own',
          correct: false,
        },
        {
          label: 'Hide your weaknesses, do not lean on those around you, and stick to a self-contained way of working',
          correct: false,
        },
        {
          label: 'Lean on others temporarily, and after a while transition to doing it all yourself',
          correct: false,
        },
      ],
      explanation:
        'The essence is "drop the idea of doing everything yourself." Practicing until you can do everything alone, hiding weaknesses, and treating help as temporary all assume "eventually I will do it all myself" — the opposite of "structurally offload" that this lesson argues for.',
    },
    {
      type: 'quiz',
      question:
        'When sharing your traits with others, which approach does this lesson most recommend?',
      options: [
        {
          label: 'Disclose at the level of behaviors and requests, framed as a proposal that also benefits the other person',
          correct: true,
        },
        {
          label: 'Lead with the diagnostic label and systematically explain the details of your trait profile to gain understanding',
          correct: false,
        },
        {
          label: 'Disclose nothing — absorb the weak areas yourself and never show them to those around you',
          correct: false,
        },
        {
          label: 'Speak frankly about the difficulties and build the relationship on the other person goodwill and support',
          correct: false,
        },
      ],
      explanation:
        'Level 1 (behavior + request + mutual benefit) is the most broadly usable approach. Leading with the diagnostic label is a territory to handle carefully (workplace discrimination remains a real risk). Total non-disclosure prevents complementarity from forming. "Build on goodwill" lacks sustainability and tends to slide from a peer relationship into an asymmetric "the helper and the helped" dynamic.',
    },
  ],
}

// ── Lesson 806: Preventing burnout — managing the cost of hyperfocus, recovery routines ──
const adhdLesson806: LessonData = {
  id: 806,
  title: 'Preventing Burnout — Managing the Cost of Hyperfocus and Building Recovery Routines',
  category: 'ADHDレバレッジ',
  steps: [
    {
      type: 'explain',
      title: 'Hyperfocus always has a cost',
      content:
        'This course has emphasized hyperfocus, divergent thinking, and agility as strengths. But hyperfocus always carries a cost. Refusing to look at it produces short-term high performance and burnout within months or years.\n\nWhat the cost of hyperfocus actually looks like:\n- Body shutdown: not drinking water, not going to the bathroom, skipping meals, not changing posture → chronic dehydration, back pain, malnutrition\n- Broken sleep rhythm: hyperfocus arriving at night and running until morning → wiped-out performance for days after\n- Erosion of relationships: attention to family and coworkers vanishes completely → relational damage\n- Post-hyperfocus emptiness: abnormal exhaustion and loss of motivation for days or weeks after finishing a project\n- Chronic fatigue and depressive symptoms: repeated hyperfocus cycles eventually outrun your recovery\n\nImportant:\nPeople with hyperfocus-type ADHD traits often have a wider swing between "absolutely on" and "completely stopped" than neurotypical people. Maintaining "average normal" is structurally harder. That is exactly why you need intentional systems for leveling.\n\nThis lesson is not "suppress hyperfocus." It is "design what comes before and after hyperfocus so that the cycle can repeat without burning out."',
    },
    {
      type: 'explain',
      title: 'Early warning signs of burnout — hard to notice yourself',
      content:
        'A characteristic of burnout in people with ADHD traits is that they are the last to notice. As long as hyperfocus keeps pulling them through, they feel "I can still keep going" — and then collapse all at once after the limit.\n\nEarly-warning checklist (three or more items sustained = pay attention):\n\nBody signs:\n- Wake up tired even after a full night sleep (two-plus weeks)\n- Chronic headaches, shoulder stiffness, or stomach issues\n- Difficulty falling asleep or waking up mid-sleep\n- Extreme increase or decrease in appetite\n- Caffeine intake noticeably higher than before\n\nCognitive signs:\n- Hyperfocus stops arriving (or arrives but does not last)\n- Even small decisions (what to eat for lunch) drain you\n- Everything you cared about feels grayed out\n- New ideas stop appearing\n\nEmotional signs:\n- Quick to irritation, anger at minor things\n- Tears, or emotions going flat\n- The feeling "nothing matters whatever I do"\n- The morning trip to work feels abnormally heavy\n\nInterpersonal signs:\n- Returning messages feels like a chore\n- Do not want to see anyone, even family conversation gets avoided\n- All hobbies have stopped\n\nIf these persist, see a clinician:\nIf several of the signs above have continued for more than two weeks, we strongly recommend seeing a psychiatrist or behavioral health specialist. This course is not medical advice. Burnout overlaps heavily with depression and adjustment disorder, and early intervention dramatically changes the prognosis. Brushing it off as "just tired" can lead to a six-month-to-multi-year recovery.\n\nNot trying to handle it alone, and treating healthcare as "a resource you can use," is itself a form of leverage.',
    },
    {
      type: 'explain',
      title: 'Recovery routines — design what comes after hyperfocus',
      content:
        'Pulling out hyperfocus is not enough. The key to long-term sustainability is designing buffers before and after.\n\nDesign for "before":\n- Eat, drink, and use the bathroom before starting\n- Physically block phones and notifications\n- Set a 90-minute timer (so that even when hyperfocus comes, you cut once at the timer)\n- Decide in advance "what I will eat or drink when this ends" (create an exit)\n\nDesign for "during":\n- A timer forces a cut → stand for 5 minutes, drink water, use the bathroom\n- The right cut length varies by person. Use your observation from Lesson 801 to learn how long you tend to focus, and pick from options like 45, 60, 90, or 120 minutes. "90 is the standard" is not true\n- Even if it feels "almost done," cut once at the set time\n- Without the cut, body shutdown advances\n\nDesign for "after":\n- For the 24 hours after a hyperfocus session, do only light work\n- Avoid important decisions (HR, contracts, purchases)\n- Make sleep the top priority (especially after hyperfocus)\n- Add light exercise (a 20-minute walk)\n- Do not skip meals (eat lightly even without appetite)\n\nWeekly and monthly recovery design:\n\nWeekly:\n- Put one full off-day on the calendar (no work, no social media, no tasks)\n- Treat it as the day to refill what hyperfocus burned — rest without guilt\n\nMonthly:\n- Take 1–2 reset days per month\n- Get into nature, take long walks, hot baths, read only books, etc.\n- Intentionally refuel the inputs that feed hyperfocus\n\nQuarterly:\n- Put 3–5 days of consecutive vacation on the calendar once a quarter\n- Fully disconnect from work\n- People with ADHD traits especially need rest on the calendar — otherwise they do not take it\n\nThe "I do not know how to rest" problem:\nMany people with ADHD traits say "I do not know how to rest." Doing nothing produces guilt; scrolling social media exhausts you further. Resting is a skill that needs training. Use the same observation log approach from Lesson 801 to find what restores you (walking, hot baths, reading, nature, exercise, cooking, etc.).',
    },
    {
      type: 'explain',
      title: 'Risk diversification for the long haul',
      content:
        'People with ADHD traits who work in startup or project-style environments often "bet everything on one thing." This is the flip side of the strength, and it threatens long-term sustainability.\n\nA classic risk-concentration pattern:\n- Pour all your time, money, and attention into a single project\n- If that project fails, burnout is almost unavoidable\n- No energy left for pivoting or for the next venture\n\nDiversification thinking:\n\nPortfolio careers (where side work is allowed):\n- Allocate roughly 70% main / 20% side / 10% exploratory\n- Use side and exploratory work to plant seeds for what could become the next main\n- If one fails, others provide footing\n\nAlternatives when your workplace prohibits side work:\nMany workplaces (in Japan and elsewhere) still prohibit paid side work. Even without a side job, you can plant seeds for "the next main."\n- Check employment regulations, tax handling, and conflict-of-interest rules in advance\n- Off-hours learning (online courses, self-study, certifications)\n- External community participation (industry study groups, volunteering, local activities)\n- Public output (blogs, talks, social posts, OSS contributions)\n- Internal mobility programs or external secondment programs where they exist\n- Even with no direct cash income, diversifying your network and expertise widens the next set of options\n\nFinancial buffer:\n- Cash to live for 6 months without work\n- A safety net when impulsive decisions strike\n- Agility is a strength for short-cycle decisions (quick sales response, crisis work) but tends to backfire on large-impact decisions like resigning, moving, or major purchases. Set yourself a rule scaled to decision weight: "wait 24–72 hours" or "talk it over with family or someone I trust before acting"\n\nRelationship diversification:\n- Do not let your entire social life come from work\n- Maintain relationships that do not collapse if you leave your job\n- Hobbies communities, family, long-term friends — keep multiple layers\n\nDomain diversification:\n- Do not narrow to a single specialty; keep a foot in adjacent areas\n- "This is the only thing I can do" runs counter to novelty seeking\n- Lower the cost of moving into a new domain in advance\n\nShort-term vs long-term:\n- Hyperfocus pouring everything into "next week deliverable" → short-term OK\n- Doing the same thing for three years straight → long-term not OK\n- Long-term sustainability requires intentional multi-axis design',
    },
    {
      type: 'quiz',
      question:
        'Which "cost of hyperfocus" does this lesson not cover?',
      options: [
        {
          label: 'Long-term memory loss — events during hyperfocus become unreachable later',
          correct: true,
        },
        {
          label: 'Body shutdown — water, bathroom, meals, and posture changes all drop out',
          correct: false,
        },
        {
          label: 'Post-hyperfocus emptiness — abnormal fatigue and loss of motivation after a project finishes',
          correct: false,
        },
        {
          label: 'Erosion of relationships — sustained periods where attention to family and coworkers vanishes',
          correct: false,
        },
      ],
      explanation:
        'The costs this lesson names are body shutdown, broken sleep, erosion of relationships, post-hyperfocus emptiness, and chronic fatigue / depressive symptoms. "Long-term memory loss" is not typically discussed in the ADHD context and is not framed as a cost of hyperfocus (events during hyperfocus tend to be remembered deeply, if anything). Plausible-sounding but outside this course framework.',
    },
    {
      type: 'quiz',
      question:
        'When early-warning signs of burnout have persisted for over two weeks, what does this lesson recommend?',
      options: [
        {
          label: 'Consider seeing a psychiatrist or behavioral health specialist',
          correct: true,
        },
        {
          label: 'Double your recovery routines and bring everything under your own control',
          correct: false,
        },
        {
          label: 'Quit your job immediately and start a long vacation first',
          correct: false,
        },
        {
          label: 'Identify the source of stress and directly confront the people involved to resolve it',
          correct: false,
        },
      ],
      explanation:
        'Because "burnout overlaps with depression and adjustment disorder, and early intervention significantly improves the prognosis," this lesson strongly recommends seeing a clinician. Strengthening recovery routines helps for prevention, but once the signs have persisted, healthcare comes before more self-management. Immediate resignation or direct confrontation are exactly the kind of long-impact decisions where impulsive moves tend to backfire — they should come after, not before, talking to a clinician.',
    },
  ],
}

// ── Lesson 807: Role-model research — analyzing publicly identified individuals ──
const adhdLesson807: LessonData = {
  id: 807,
  title: 'Role-Model Research — Analyzing How Publicly Identified Individuals Work',
  category: 'ADHDレバレッジ',
  steps: [
    {
      type: 'explain',
      title: 'Why role-model research works',
      content:
        'Recognizing your traits as resources is one thing. Figuring out how to actually operate them so they produce value over the long term is another — and not something you can fully work out alone. There are people who went before you.\n\nWhat role-model research gives you:\n- Concrete examples of "you can carry ADHD traits and still produce value in this kind of domain"\n- Visibility into failure patterns (past burnouts, the cost of impulsive decisions)\n- A template to think through your own career strategy\n\nCautions:\n- This is not for "optimistically assuming you can become the same person"\n- Public self-disclosure from a given individual needs to be read with their context attached (it may not apply to you)\n- Do not use it as grounds for self-diagnosis or self-labeling\n\nThis lesson is not a profile gallery. It pulls out the structural commonalities in how publicly identified individuals work — the patterns of what made them succeed and what made them fail.',
    },
    {
      type: 'explain',
      title: 'Five common patterns among publicly identified individuals',
      content:
        'Looking at business professionals, founders, and specialists who have publicly identified themselves, five common features recur:\n\nPattern 1: Early awareness that "I am not standard"\n- They later understood school-era mismatches and failures as "because of my traits"\n- Self-awareness lets you build a personal strategy\n- Nearly all of them had long stretches of struggle before that awareness\n\nPattern 2: Chose roles where they make the decisions (founder, independent, specialist)\n- Richard Branson (Virgin), Ingvar Kamprad (IKEA), David Neeleman (JetBlue) — many built their own companies\n- Comparatively few publicly identified individuals built long careers as employees of large bureaucracies\n- Instinctively avoid environments where "I am micromanaged from above"\n\nPattern 3: Have a complementary partner or team\n- Jobs × Cook, Branson × supporting roles, IKEA Kamprad × the COO layer\n- Someone who covers their weaknesses is close by\n- Many recall "the period I tried to do it all alone was especially draining" (some also speak of times when no complementarity was available — keep in mind that not everyone can have a team from day one)\n\nPattern 4: Turn disclosure into a strength\n- Instead of hiding, they disclose, building a brand of "unusual but produces value"\n- Hiring follows — people who fit them gather\n- Most do this only after the career is already established (early disclosure carries risk and needs care)\n\nPattern 5: Have gone through cycles of burnout and recovery\n- Many publicly identified individuals had a major burnout earlier in their career\n- From it, they learned "self-management of hyperfocus and recovery" and built a sustainable form\n- People who never go through one tend to have shorter careers afterward\n\nImplication:\nThese five patterns map cleanly onto Lessons 800–806. Real successful examples embody the very structure the course teaches.',
    },
    {
      type: 'explain',
      title: 'A template for role-model analysis',
      content:
        'A template for reading autobiographies, biographies, and interview articles. It works for anyone.\n\nAnalysis items:\n\n1. How the cognitive traits show up\n- Of hyperfocus, divergent thinking, agility, and novelty seeking, which is strongest?\n- How did the weaknesses (detail, persistence, parallel management) appear?\n\n2. Environment design choices\n- What physical environment did they work in (office, home, on the move)?\n- Routine and scheduling characteristics?\n- How did they handle notifications and interruptions?\n\n3. Complementary support\n- Who is the partner, spouse, or co-founder?\n- What was the role split?\n- Characteristics of how they built teams?\n\n4. Failure and recovery\n- What was the major past failure or burnout?\n- How did they recover?\n- What did they change in order not to repeat the same pattern?\n\n5. Transfer to your own situation\n- Of this person strategies, which can you imitate in your situation?\n- Which cannot be imitated (era, field, element of luck)?\n- If you had to pick only one to adopt, which would it be?\n\nReading tips:\n- Interviews that talk about failure, and autobiographies that include failure, teach more than pure success stories\n- Discount content in "bragging mode"\n- Separate what the individual themselves says from what observers (biographers, reporters) say\n- The same person strategy often changes between youth, mid-career, and late career → observe each phase separately',
    },
    {
      type: 'explain',
      title: 'Concrete learning resources',
      content:
        'Trustworthy resources for studying how publicly identified individuals work, organized by category.\n\nBook category:\n- Autobiographies by publicly identified individuals: their own words on self-awareness and coping\n- Biographies and critical studies: third-party observation of behavior patterns (more objective than autobiography)\n- Career books for individuals with ADHD: practical compilations of multiple cases\n\nMedia category:\n- Long-form interviews (YouTube, podcasts): over an hour tends to surface honesty and traits more\n- Documentaries: you see their working day in motion (more information than a magazine piece)\n- Trade press features: pick the ones that talk about failure, not only success\n\nAcademic category:\n- Qualitative research on individuals (interview studies): analyzes the structure of individual cases\n- Review articles on ADHD and entrepreneurship: macro tendencies\n\nFilters for choosing sources:\n- Is the author or speaker publicly self-disclosed? (Speculation-based "that person is probably ADHD" is low-trust)\n- Can you cross-check with multiple sources? (Do not swallow single-article claims whole)\n- Does it include failure and difficulty? (Pure success stories teach little)\n- Is it recent? (Career strategies from over ten years ago often do not fit current work)\n\nFind people close to your situation:\n- Industry (IT / sales / creative / manufacturing / services)\n- Position (founder / middle manager / specialist / freelance)\n- Life stage (20s / 30s / 40s and beyond)\n→ The closer their position to yours, the higher the transfer rate of their strategies',
    },
    {
      type: 'explain',
      title: 'Course wrap-up — write your own prescription',
      content:
        'A one-page summary of everything across the seven lessons.\n\nStep 1: Self-understanding (Lesson 800–801)\n- Reframe ADHD traits as four resources (hyperfocus, divergent thinking, agility, novelty seeking)\n- Run a 2-week ignition map to find your own pattern\n\nStep 2: Environment design (Lesson 802–803)\n- Set up the physical environment (desk, notifications, time blocks)\n- Reshape tasks to pull out hyperfocus and remove starting friction\n\nStep 3: Role selection (Lesson 804)\n- Distinguish roles where ADHD traits fit from roles where they do not\n- Diagnose where you are now with the four axes (energy balance, strengths frequency, failure structure, 5-year horizon)\n\nStep 4: Complementary support (Lesson 805)\n- Use partner, delegation, and team design to structurally offload your weak areas\n- Disclose starting from the behavior level\n\nStep 5: Sustainability (Lesson 806)\n- Track the cost of hyperfocus and design recovery routines\n- Notice early warning signs of burnout and use healthcare when needed\n\nStep 6: Studying predecessors (Lesson 807)\n- Analyze publicly identified individuals with the analysis template\n- Adopt one or two transferable elements for your own career\n\nClosing:\nThe point of this course is not "you are special because you have ADHD." It is simply this: anyone with any cognitive profile can more readily produce their own kind of value once they understand their profile and build the environment, role, and complementary support that fits.\n\nADHD traits tend to translate into value in environments that fit them, and tend to drain you in environments that do not. That is exactly why "building or choosing the environment that fits you" is the largest leverage available.\n\nThis course is less a textbook and more a set of materials for writing your own prescription. You do not have to adopt all of it. Start with one item that looks effective for where you are now, observe, and adjust. That is enough.',
    },
    {
      type: 'quiz',
      question:
        'Which option best matches the purpose of role-model research in this lesson?',
      options: [
        {
          label: 'Learn the structural commonalities in how publicly identified individuals operate and transfer them into your own career design',
          correct: true,
        },
        {
          label: 'Decide whether you have ADHD based on similarity to publicly identified individuals',
          correct: false,
        },
        {
          label: 'Compare yourself to successful individuals and set goals to compensate for what you lack',
          correct: false,
        },
        {
          label: 'Join the community of individuals with ADHD as a starting point for building mutual support',
          correct: false,
        },
      ],
      explanation:
        'The purpose is "extract the structure of success patterns and transfer them." Using it as grounds for self-diagnosis is medical territory and out of scope. "Compare to fill in what is lacking" is self-blaming and goes against the course stance. Community participation has value at another layer but is not the same act as extracting the strategic structure from predecessors.',
    },
    {
      type: 'quiz',
      question:
        'When reading autobiographies and interviews of publicly identified individuals, which approach best matches this lesson?',
      options: [
        {
          label: 'Weight the failures and difficulties, cross-check across multiple sources, and observe by life phase',
          correct: true,
        },
        {
          label: 'Read mostly success stories and reproduce that person strategy as faithfully as possible',
          correct: false,
        },
        {
          label: 'Pick the bestselling autobiography and accept its content with full trust',
          correct: false,
        },
        {
          label: 'Read comprehensively across executives in the same industry to grasp overall industry trends',
          correct: false,
        },
      ],
      explanation:
        'The lesson emphasized "failure-heavy material teaches more," "cross-check across multiple sources," and "observe by life phase." Pure success stories teach little, faithful reproduction breaks down across differences in era, field, and luck, and accepting a bestseller uncritically risks overtrust. Comprehensive reading is poor time-for-value; selecting people whose positions are close to yours raises transfer rates.',
    },
  ],
}

// ========================================
// Map
// ========================================
export const adhdLeverageLessonMapEn: Record<number, LessonData> = {
  800: adhdLesson800,
  801: adhdLesson801,
  802: adhdLesson802,
  803: adhdLesson803,
  804: adhdLesson804,
  805: adhdLesson805,
  806: adhdLesson806,
  807: adhdLesson807,
}
