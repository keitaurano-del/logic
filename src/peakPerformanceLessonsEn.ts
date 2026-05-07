/**
 * Peak Performance Habits course
 * Category: 'Peak Performance Habits'
 * Lesson IDs: 410+
 *
 * Systematizes "how to deliver your best work at your peak" across five
 * lessons covering sleep, exercise, chronotype, the wave of focus, and
 * self-measurement.
 */
import type { LessonData } from './lessonData'

// ── Lesson 410: Know your chronotype ─────────────────────────
const peakPerformanceLesson410: LessonData = {
  id: 410,
  title: 'Know your chronotype — morning vs. night is written in your DNA',
  category: 'Peak Performance Habits',
  steps: [
    {
      type: 'explain',
      title: '"Night people are lazy" is scientifically wrong',
      content:
        'When a person feels sleepy and when they can focus is not decided only by willpower or lifestyle. Genes such as **PER3 / CLOCK / BMAL1** — so-called "clock genes" — determine your innate body rhythm (chronotype).\n\nTwin studies show that **about 40–50% of the morning/evening tendency can be explained by genetics**. The rest moves with age, light, and social pressure, but the underlying base does not change.\n\n**In other words:**\n- "Up at 5 a.m. = virtuous" is a cultural story, not a biological one\n- People who schedule their most important work outside their chronotype fight every day with a handicap\n- Knowing "when is my peak time?" is the starting line — earlier than effort',
    },
    {
      type: 'explain',
      title: 'Four chronotypes — Lion, Bear, Wolf, Dolphin',
      content:
        'A simple four-way classification proposed by clinical psychologist Michael Breus.\n\n**Lion (morning person / about 15%)**\n- Naturally up at 5–6 a.m. Peak performance in the morning\n- Tackle hard work in the morning; evening sleepiness comes early\n\n**Bear (daytime / about 50%)**\n- The majority. Moves with the sun. Up at 7–8 a.m., peak between 10 a.m. and 2 p.m.\n- Most adapted to a standard 9–6 workday\n\n**Wolf (night owl / about 15–20%)**\n- Mornings are genuinely awful. Real start late morning; peak from late afternoon into evening\n- Creative work goes better at night\n\n**Dolphin (insomnia-prone / about 10%)**\n- Light, fragile sleep; perfectionist tendencies\n- Sensitive to ambient noise; strongly affected by sleep hygiene\n\nNo type is "better." The goal is to **know your type and place important work inside your peak time**.',
    },
    {
      type: 'explain',
      title: 'Three questions to estimate your type',
      content:
        'Formal instruments include the MEQ (Morningness-Eveningness Questionnaire) and the MCTQ, but you can get a rough read with these three questions.\n\n**Q1: On weekends, with no alarm, what time do you wake up naturally?**\n- Before 6 → leaning Lion\n- 7–8 → leaning Bear\n- After 9 → leaning Wolf\n\n**Q2: How long after waking up does your head start working clearly?**\n- Within 30 minutes → Lion / Bear\n- 1–2 hours → Bear / Wolf-leaning\n- Over 3 hours → Wolf\n\n**Q3: At 10–11 p.m., how alert is your head?**\n- Crushing sleepiness; can\'t hold on → Lion\n- Normally getting sleepy → Bear\n- More alert, work flows → Wolf\n\nIf your three answers point the same way, that is your basic type.\n\n**Note:** It shifts with age. Late teens to early 20s lean globally toward Wolf; from the 40s onward people drift back toward Bear/Lion.',
    },
    {
      type: 'explain',
      title: '"Reforming a night owl into a morning lark" tops out around two hours',
      content:
        'Pumped up by "the early bird gets the worm," a night owl who forces 5 a.m. wake-ups will fall into **chronic sleep loss + cognitive decline**.\n\nThe research consensus:\n- Chronotype can be shifted **±1–2 hours** through light management\n- Anything more aggressive creates social jet lag, raising risks for depressive symptoms and metabolic disorders\n- **Forcing a 9 a.m. start on a night owl drops productivity by 10–15%** (Roenneberg et al.)\n\n**Practical tactics:**\n- Design "when to do heavy work" around your chronotype (later lessons)\n- If morning meetings are unavoidable, get strong light right after waking and dim light from late afternoon onward\n- Stop labeling yourself as "a hopeless night person." This is innate wiring',
    },
    {
      type: 'quiz',
      question: 'Which is the most accurate description of chronotypes?',
      options: [
        { label: 'Chronotype is strongly influenced by genetics, and forcing it the wrong way can backfire', correct: true },
        { label: 'Anyone can become a morning person if they commit for 30 days', correct: false },
        { label: 'Being a night owl is the result of laziness; you should fix it through willpower', correct: false },
        { label: 'Chronotype is fixed and does not change with age', correct: false },
      ],
      explanation:
        'As shown by twin studies, 40–50% of chronotype is genetic. You can shift ±1–2 hours through light management, but forcing it further produces social jet lag and harms both productivity and health. It is also important that chronotype changes naturally with age (adolescents move toward night, middle-aged people toward morning).',
    },
    {
      type: 'quiz',
      question: 'Which is the most sensible way to estimate your own chronotype?',
      options: [
        { label: 'Observe both your natural alarm-free wake-up time on weekends and how alert you are at night', correct: true },
        { label: 'Judge purely by your weekday wake-up time', correct: false },
        { label: 'Assume you have the same type as the person you most respect', correct: false },
        { label: 'Decide by what time you can wake up after a morning with zero caffeine', correct: false },
      ],
      explanation:
        'Weekday wake-ups are forced by social obligations and hide your true rhythm. Use both your **alarm-free natural wake-up time on weekends** and your **alertness at night**. Questionnaires like the MEQ and MCTQ are designed around the same two axes.',
    },
  ],
}

// ── Lesson 411: Sleep determines the quality of thought ─────
const peakPerformanceLesson411: LessonData = {
  id: 411,
  title: 'Sleep determines the quality of thought — the link between 7 hours and cognitive performance',
  category: 'Peak Performance Habits',
  steps: [
    {
      type: 'explain',
      title: 'Sleep deprivation is the same as "working drunk"',
      content:
        'Strong wording, but it is what the research shows.\n\n**Dawson & Reid (1997, *Nature*)**: After 17 hours of continuous wakefulness, cognitive performance is **equivalent to a blood-alcohol concentration of 0.05% (about 1–2 cans of beer)**. After 24 hours of wakefulness, it falls to 0.10% — the level of an impaired driver.\n\n**Van Dongen et al. (2003, *Sleep*)**: Two weeks of 6 hours of sleep produced cognitive deficits **equivalent to two consecutive all-nighters**. And the participants thought "I\'ve adjusted to it."\n\n**What follows:**\n- "I pulled an all-nighter and powered through" is making decisions at the level of someone drunk in a strategy meeting\n- The most frightening thing about sleep deprivation is that **the person doesn\'t notice it**. They feel fine while their judgment quietly fails\n- Sleep is not "wasted time" — it is **the single largest investment in cognitive performance**',
    },
    {
      type: 'explain',
      title: 'How much sleep you actually need — true short-sleepers are under 1%',
      content:
        'The U.S. National Sleep Foundation\'s guideline for adults is **7–9 hours**.\n\nMost people who feel "5–6 hours is enough for me" are simply **acclimated to sleep deprivation**.\n\n- People genetically able to function on short sleep (variants in DEC2 / ADRB1, for example) are **about 1% of the population**\n- For everyone else, six hours or less progressively erodes attention, memory, and emotional regulation\n- Because there is no felt symptom, **the very person degrading is the worst-positioned to notice it**\n\n**Targets:**\n- For peak performance, hold the line at **7–8 hours**\n- Sanity-check your "I\'m fine on short sleep" by seeing how many hours you sleep on a weekend with no alarm. The natural sleep duration is closer to your true requirement\n- During life stages with forced short sleep (childcare, night shifts), a 20–30 minute power nap can partially compensate',
    },
    {
      type: 'explain',
      title: 'Deep sleep builds memory; REM builds creativity',
      content:
        'Sleep is not merely "rest." It is a time when the brain actively processes.\n\n**Slow-wave sleep (deep non-REM, mostly first half of the night)**\n- Memory transfer from hippocampus to cortex (= long-term consolidation)\n- Consolidation of learned content; fixation of motor learning\n- Growth-hormone release; physical repair\n\n**REM sleep (mostly the second half)**\n- Emotional processing; relabeling of stressful memories\n- Linking unrelated memories → **creative ideas, breakthroughs in problem-solving**\n- "Sleep on it" works thanks to REM sleep\n\n**Implications:**\n- Waking after 4–5 hours cuts most of REM → creativity and emotional regulation drop\n- Forced early waking directly damages thinking power\n- Especially do not skimp the night after intensive learning or creative work',
    },
    {
      type: 'explain',
      title: 'You cannot pay back sleep debt on the weekend',
      content:
        'Many people balance "5 hours weekdays, 10 hours on weekends." Research shows **the recovery is not complete**.\n\n- Sleeping in restores some insulin sensitivity and a fraction of attention, but cognitive performance does not return to baseline\n- Worse, social jet lag (a 2+ hour gap between weekday and weekend bedtimes) correlates with **depressive symptoms, obesity, and cardiovascular risk**\n\n**Practice:**\n- Keep **the gap between weekday and weekend bedtimes/wake times within 1 hour**\n- When you fall short, compensate the next day with a short nap (within 20 minutes); recover from an all-nighter over several days, not by sleeping super-long the next day\n- Don\'t aim for "weekend catch-up." Aim for **an average of 7–8 hours**',
    },
    {
      type: 'explain',
      title: 'Three high-leverage practices for falling asleep',
      content:
        'Three practices that improve quality, not just quantity, with high cost-effectiveness.\n\n**① Cut bright light from one hour before bed**\n- Drop phone brightness to minimum; switch room lighting to orange tones if possible\n- Blue light can suppress melatonin secretion by up to 50%\n- "Phone in bed" delays sleep onset by 15–30 minutes\n\n**② Avoid food and caffeine within 3 hours of bedtime**\n- Caffeine\'s half-life is **5–6 hours**. A 3 p.m. coffee is still active at 11 p.m.\n- Alcohol shortens sleep onset but destroys later REM sleep (quality drops)\n\n**③ Anchor your sleep and wake times**\n- Your body clock is anchored by **wake time**. Wake up at the same time on both weekdays and weekends\n- Get outdoor light right after waking (5–10 minutes stops melatonin and helps sleepiness arrive in the evening)',
    },
    {
      type: 'quiz',
      question: 'Which is the most accurate statement about sleep and cognitive performance?',
      options: [
        { label: 'Continued 6-hour sleep produces large drops in judgment that the person doesn\'t notice', correct: true },
        { label: 'About half of people genuinely need only 4 hours of sleep', correct: false },
        { label: 'Sleep debt can be fully repaid by sleeping in on weekends', correct: false },
        { label: 'After an all-nighter, coffee can restore concentration to fully rested levels', correct: false },
      ],
      explanation:
        'In Van Dongen et al., subjects on 6 hours of sleep for two weeks slowed to all-nighter levels in reaction time — while reporting "I\'ve adjusted." Genuine short-sleepers are about 1% of the population, you cannot fully recover by sleeping in, and caffeine only masks the felt sleepiness without restoring cognitive function.',
    },
    {
      type: 'quiz',
      question: 'Which improves sleep quality the most?',
      options: [
        { label: 'Keep wake-up time the same on weekdays and weekends, and get outdoor light right after waking', correct: true },
        { label: 'Sip a hot coffee right before bed to wind down', correct: false },
        { label: 'Use a nightcap to shorten time to fall asleep', correct: false },
        { label: 'Scroll your phone in bed until sleep arrives', correct: false },
      ],
      explanation:
        'Your body clock anchors to wake time. Outdoor light at waking shuts off melatonin, and natural sleepiness arrives 14–16 hours later. Caffeine, alcohol, and blue light are all classic ways to degrade sleep quality.',
    },
  ],
}

// ── Lesson 412: Boost the brain through exercise ────────────
const peakPerformanceLesson412: LessonData = {
  id: 412,
  title: 'Boost the brain through exercise — frequency, duration, and intensity that work',
  category: 'Peak Performance Habits',
  steps: [
    {
      type: 'explain',
      title: 'Exercise is the strongest cognitive enhancer',
      content:
        'Popularized by neuroscientist John Ratey in *Spark*, the evidence base is solid.\n\n**How exercise affects the brain:**\n- Increased **BDNF (brain-derived neurotrophic factor)** secretion → neurogenesis (especially in the hippocampus); better memory\n- Greater blood flow to the prefrontal cortex → improved executive function and attentional control\n- Release of noradrenaline, dopamine, and serotonin → focus, motivation, and mood stabilization\n\n**Results:**\n- Learning and memory consolidation on a workout day improve by **about 20%** (multiple meta-analyses)\n- Reductions in anxiety/depressive symptoms can be **comparable to medication** for mild-to-moderate depression in some studies\n- Older adults\' dementia risk falls by **about 30%** with regular exercise\n\nExercise is not just "for health" — it directly raises the quality of your work that day.',
    },
    {
      type: 'explain',
      title: 'Optimal dose — 150 minutes per week at moderate intensity',
      content:
        'WHO and American Heart Association guidelines roughly converge.\n\n**Aerobic:**\n- **150 minutes/week of moderate intensity** or **75 minutes/week of vigorous intensity**\n- Moderate = can talk but not sing (brisk walking, light jogging, cycling)\n- Vigorous = conversation breaks up (running, HIIT)\n\n**Strength training:**\n- **At least twice a week, covering major muscle groups** (squats, push-ups, etc., are sufficient with bodyweight)\n\n**Important findings:**\n- Effects appear even from a **single 20–30 minute session**. "Better than nothing" is correct\n- 10 minutes × 3 vs. one 30-minute block — the effect is roughly the same\n- The cognitive boost peaks **about 1 hour post-exercise**. Front-loading important work after exercise pays off\n\n**To start:** A 20-minute brisk walk in the morning. That alone meets the minimum line of many studies.',
    },
    {
      type: 'explain',
      title: 'Time of day shifts which effects you get',
      content:
        'The same workout hits the brain differently depending on when you do it.\n\n**Morning (after waking, through the late morning)**\n- Big boost to focus and mood baseline\n- Effective for body-clock anchoring (light + exercise nudges chronotype slightly earlier)\n- Doing it before heavy thinking work makes the day\'s peak even sharper\n\n**Lunchtime (around 1–3 p.m.) — light exercise**\n- Counters post-lunch sleepiness and focus dip\n- Even a 10–15 minute walk restores afternoon cognitive performance\n\n**Evening (around 5–7 p.m.)**\n- Body temperature and strength peak — **physically the best time**\n- Most effective for stress relief and emotional reset\n- However, hard exercise within 3 hours of bedtime impairs sleep onset\n\n**Late night (9 p.m. and later) — high-intensity exercise**\n- Activates sympathetic nervous system, delaying sleep onset\n- Stick to stretching or gentle yoga',
    },
    {
      type: 'explain',
      title: 'Strength training is the foundation of mental stability',
      content:
        'If aerobic exercise "lifts you up," strength training "keeps you from falling."\n\n- Multiple meta-analyses confirm that resistance training **reduces depressive symptoms** (Gordon et al. 2018, *JAMA Psychiatry*)\n- Muscles secrete **myokines**, which suppress brain inflammation and lower depression and dementia risk\n- The boost to self-efficacy ("I can do this") translates directly into stress resilience\n\n**Minimal protocol:**\n- Twice a week, 20 minutes each, mostly bodyweight\n- Squats / push-ups / rowing motion (with a towel or band) / planks cover the whole body\n- About 6–12 reps × 3 sets at 80% of full effort\n\n**Mindset:** Position it not as muscle hypertrophy but as **infrastructure for mental stability and performance**.',
    },
    {
      type: 'quiz',
      question: 'Which is the most accurate statement about exercise and cognitive performance?',
      options: [
        { label: 'A 20–30 minute moderate-intensity session can already produce BDNF release and improved attention', correct: true },
        { label: 'You must do at least an hour of vigorous exercise daily to see benefits', correct: false },
        { label: 'The cognitive effects of exercise show up only several days later', correct: false },
        { label: 'Strength training works on the body but has no link to the brain or mental health', correct: false },
      ],
      explanation:
        'Exercise has both acute (same-day) and chronic (cumulative) cognitive effects, and even a single 20–30 minute session boosts focus and memory that day. 150 minutes/week of moderate aerobic + 2 strength sessions is a realistic optimal dose. Strength training also has meta-analytic evidence for reducing depressive symptoms.',
    },
    {
      type: 'quiz',
      question: 'Which is the most sensible placement of exercise across the day?',
      options: [
        { label: 'A 20-minute brisk walk in the morning to set the tone, plus stress-busting exercise in the evening', correct: true },
        { label: 'High-intensity running 1 hour before bedtime to wear yourself out', correct: false },
        { label: 'Three hours on the weekend and zero on weekdays', correct: false },
        { label: 'Long, high-intensity, fasted training every day', correct: false },
      ],
      explanation:
        'Morning exercise lifts focus and anchors the body clock; evening matches the physical peak and is great for stress relief. High-intensity exercise just before bed blocks sleep onset, weekend-only batching loses the midweek effect, and daily long fasted high-intensity sessions risk overtraining.',
    },
  ],
}

// ── Lesson 413: Match work to your wave of focus ────────────
const peakPerformanceLesson413: LessonData = {
  id: 413,
  title: 'Match work to your wave of focus — assigning tasks to peaks and troughs',
  category: 'Peak Performance Habits',
  steps: [
    {
      type: 'explain',
      title: 'Focus is not flat across the day — it is a wave',
      content:
        'Focus, mood, and executive function rise and fall in big waves over the course of a day.\n\nDaniel Pink\'s *When* organizes the **pattern most people share**.\n\n**Peak (often 2–4 hours after waking)**\n- Best for analysis, logic, and hard decisions\n- Fewer slips; deep thinking flows\n\n**Trough (after lunch, into early afternoon)**\n- Attention and mood at their daily low\n- Suited to routine work, email, and tidying tasks\n- Hospitals see medical errors peak in this window too\n\n**Recovery (late afternoon)**\n- Sharp focus does not return, but mood lifts\n- Good for **creative and divergent thinking** (a slightly tired brain associates more freely)\n\n**For night types (Wolves), the order flips**: morning trough → afternoon peak → late-night recovery.\n\nThe point is not "the average person" — it is **knowing your own wave**.',
    },
    {
      type: 'explain',
      title: 'Ultradian rhythms — work 90, rest 15',
      content:
        'Inside the day-long wave there are **smaller 90–120 minute waves** (ultradian rhythms).\n\n- Sustained focus tops out around **90 minutes**\n- Beyond that, attention, blood sugar, and mood drop\n- A short break (10–20 minutes) recovers a great deal\n\n**Practice:**\n- Block the calendar in **"90 minutes focus + 15 minutes break"** units\n- During breaks, **leave the screen** (walk, look at a far point, drink water)\n- Phone breaks don\'t actually rest the brain — they accumulate attention residue\n\n**Pomodoro (25 min + 5 min)** is the chopped-up version of this 90-minute cycle. For short tasks, 25 minutes is fine; for deep thinking, 90 is better.',
    },
    {
      type: 'explain',
      title: 'Creative work goes better with "a slightly tired brain"',
      content:
        'Counterintuitive but well-supported.\n\n- Morning peaks excel at **convergent thinking** (logic, analysis, finding the right answer)\n- Afternoon-to-evening recovery excels at **divergent thinking** (association, novel combinations, ideas)\n- A tired brain has weaker prefrontal inhibition, allowing seemingly unrelated concepts to connect\n\n**Wieth & Zacks (2011)**: People solved insight problems more often **at the time of day opposite to their peak**.\n\n**Tactics:**\n- Morning peak: strategy work, hard decisions, papers/reports, debugging\n- Afternoon trough: email, meetings, routine work, light reading\n- Evening recovery: brainstorming, new initiatives, sketching, free conversation\n\n**"Heavy work in the morning, creative work at night"** holds up scientifically.',
    },
    {
      type: 'explain',
      title: 'Sort work into 3 types and assign by time of day',
      content:
        'A practical operating frame. Today\'s work is sorted into three:\n\n**A. Thinking tasks (deep work)**\n- Strategy, design, analysis, hard writing, complex decisions\n- → Block your **peak** (around 9 a.m.–noon for morning types; 6–10 p.m. for night types)\n- Don\'t fragment with meetings\n\n**B. Execution tasks (hands-on)**\n- Known procedures, email replies, doc cleanup, routine processing\n- → Cluster these in your **trough** (e.g., after lunch)\n- These don\'t require thinking energy, so they progress even at the bottom of the wave\n\n**C. Relational tasks (people)**\n- 1-on-1s, casual chats, interviews, hiring, sales meetings\n- → Place these during **recovery** (evening) where mood is rising\n- Better-than-baseline mood supports idea generation\n\n**Most important rule:** **Block your peak time on the calendar first** (for type A). Slot meetings into what remains. This single change reshapes how you spend cognitive resources.',
    },
    {
      type: 'quiz',
      question: 'Which is the most accurate description of the wave of focus?',
      options: [
        { label: 'Focus and mood follow a daily wave of peak/trough/recovery, and you should assign work to match your wave', correct: true },
        { label: 'With enough motivation, focus can stay flat all day', correct: false },
        { label: 'Creative work is best done at the morning peak when you are sharpest', correct: false },
        { label: 'Meetings are most lively if scheduled during peak time', correct: false },
      ],
      explanation:
        'Focus, mood, and executive function move in big waves: peak (analysis) → trough (chores) → recovery (creativity). Push meetings into the trough, place creative work in the evening, and pre-block your peak for deep thinking.',
    },
    {
      type: 'quiz',
      question: 'Which is the most sensible way to use the ultradian rhythm at work?',
      options: [
        { label: 'Run 3–4 cycles of 90-min focus + 15-min screen-off break', correct: true },
        { label: 'Push from morning to night with no breaks', correct: false },
        { label: 'Use breaks to scroll social media to "reset"', correct: false },
        { label: 'Whenever focus drops, slam another caffeine to fix it', correct: false },
      ],
      explanation:
        'The ultradian cycle is roughly 90–120 minutes. Aligning the focus block to 90 minutes with short screen-off breaks is best for brain recovery. Social media adds attention residue rather than restoring you, and stacking caffeine wrecks tonight\'s sleep, killing tomorrow\'s peak.',
    },
  ],
}

// ── Lesson 414: Measure your own condition ──────────────────
const peakPerformanceLesson414: LessonData = {
  id: 414,
  title: 'Measure your own condition — find your optimum with N=1 experiments',
  category: 'Peak Performance Habits',
  steps: [
    {
      type: 'explain',
      title: 'Population averages are starting points; your optimum is yours alone',
      content:
        'The numbers cited earlier (7 hours of sleep, 150 minutes of weekly exercise, peak 2–4 hours after waking…) are **averages**.\n\nIn reality:\n- Required sleep duration varies between 6 and 9 hours depending on genetics, age, and season\n- Caffeine metabolism varies widely with the CYP1A2 gene; the half-life ranges from 2 to 10 hours by individual\n- Some thrive on morning workouts; others stick with it only when it\'s in the afternoon\n\nSo your optimum can only be found through **N=1 experimentation**.\n\n**Important framing:**\n- What top athletes and executives share is not flashy techniques but "measuring their own bodies"\n- Not "willpower and grit" — **look at the data and tune**\n- Judge by the **trend over 2 weeks to a month**, not by a single day',
    },
    {
      type: 'explain',
      title: 'Four variables to measure — keep it simple',
      content:
        'No fancy tools needed. One spreadsheet or one notebook is enough.\n\n**① Inputs (things you can control)**\n- **Sleep**: bed/wake times, perceived quality (10-point scale)\n- **Exercise**: type (aerobic/strength) and duration\n- **Food/caffeine**: time of last coffee, time of dinner, alcohol amount\n\n**② Outputs (things you feel)**\n- **Focus**: how well work flowed today (10-point scale)\n- **Mood/energy**: simple morning, midday, and evening readings\n\nIf you have a smartwatch, **HRV (heart-rate variability), resting heart rate, and a sleep score** can give a more objective view of condition.\n\n**Key:** Don\'t become a perfectionist. Keep the granularity to **30 seconds per day**. Measurement that doesn\'t stick is meaningless.',
    },
    {
      type: 'explain',
      title: 'Log for 2 weeks, then look for correlations',
      content:
        'Two weeks or more of records reveals trends unique to you.\n\n**Common discoveries:**\n- "Below 7.5 hours of sleep, focus drops reliably by 2 points the next day"\n- "After coffee after 5 p.m., my mood is always lower the next day"\n- "HRV the morning after the gym is 1.5×"\n- "After 3+ drinks at a dinner, I cannot do any deep thinking the next day"\n\n**How to read:**\n- Plot inputs (e.g., sleep duration) on the **horizontal axis**, outputs (e.g., focus) on the **vertical axis**\n- Faster: look for the common factors among **bad days**, rather than averages\n- Even just listing the "top 3 best days" and "bottom 3 worst days" side by side reveals patterns\n\n**At this stage, the goal is not "rules" but "hypotheses."**',
    },
    {
      type: 'explain',
      title: 'A/B testing — change one thing at a time for two weeks',
      content:
        'Correlation isn\'t causation. Once you have a hypothesis, **change exactly one thing** and test it.\n\n**Procedure:**\n1. Pick one hypothesis (e.g., "moving bedtime from 23:00 to 22:30 will improve focus")\n2. **Hold other variables constant as much as possible** (exercise, food, work content)\n3. Sustain it for 2 weeks (1 week minimum, 2–4 weeks ideal)\n4. Compare focus and mood averages before and after\n\n**Cautions:**\n- Changing 3 things at once leaves you unable to tell what worked\n- Placebo effects are powerful — give it at least 2 weeks\n- Don\'t evaluate purely by numbers; include "was it sustainable / pleasant?"\n\n**Candidates to try:**\n- Same wake-up time on weekdays and weekends\n- 20-minute morning walk\n- No caffeine after 3 p.m.\n- Pre-blocked 90-minute deep-work blocks on the calendar',
    },
    {
      type: 'explain',
      title: 'Distill into a one-page "best-self protocol"',
      content:
        'Document the rules you discovered through experimentation in one page. This becomes **your personal owner\'s manual**.\n\n**Example: a Wolf-leaning person\'s protocol**\n\n```\n● Chronotype: Wolf-leaning (mornings rough, sharp at night)\n● Sleep: 23:30 → 7:30 (8 hours) / weekend deviation within ±1h\n● Exercise: 20-min brisk walk at 7:50 + 2 bodyweight strength sessions/week\n● Focus: 10:30–12:00 / 14:30–16:00 / 20:00–21:30 are peak blocks\n● Cluster meetings into 13:00–14:00 and 16:00–17:00\n● Caffeine: 1 cup AM + 1 cup midday max; zero after 15:00\n● Warning signs: HRV ≤ 30 / focus ≤ 3 for 2 days running\n  → Next day, reduce meetings; sleep an extra hour\n```\n\n**Operation:**\n- Review monthly. As life changes, the protocol changes\n- When you feel persistently off, the first check is "have I been following the protocol?"\n- Too many rules = you won\'t stick. Cap at **5 items**.\n\n**The ultimate goal:** Stop relying on willpower; **let the system produce a reasonably good version of you every day**.',
    },
    {
      type: 'quiz',
      question: 'Which is the most sensible approach for finding your optimal performance habits?',
      options: [
        { label: 'Log sleep, exercise, and focus for 2 weeks, then change one variable at a time and observe', correct: true },
        { label: 'Copy a respected executive\'s routine wholesale', correct: false },
        { label: 'Try once, and if it doesn\'t work overnight, switch to the next method', correct: false },
        { label: 'Wait until you can buy the perfect measuring tool before changing anything', correct: false },
      ],
      explanation:
        'Optima vary with genetics, age, and work content, so N=1 experimentation is essential. One night to a few days is buried in noise and placebo effects; changing 3 things at once destroys causal clarity. Starting with paper-and-pen at 30 seconds/day will outperform waiting for the perfect device.',
    },
    {
      type: 'quiz',
      question: 'Which is the most appropriate way to build a "best-self protocol"?',
      options: [
        { label: 'Distill what experimentation showed into 5 items max, and review monthly', correct: true },
        { label: 'Write out 20+ ideal-life rules and try to follow them all', correct: false },
        { label: 'Build it once, and never change it', correct: false },
        { label: 'Ignore subjective feeling; rely solely on gadget numbers', correct: false },
      ],
      explanation:
        'Too many items always break down under operational load. Cap at 5 items and review monthly to track life-stage and work-content changes. Objective data (wearables) and subjective data (focus/mood) are insufficient on their own — combining them is the basic move.',
    },
  ],
}

export const peakPerformanceLessonMapEn: Record<number, LessonData> = {
  410: peakPerformanceLesson410,
  411: peakPerformanceLesson411,
  412: peakPerformanceLesson412,
  413: peakPerformanceLesson413,
  414: peakPerformanceLesson414,
}
