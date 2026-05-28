/**
 * Stamina Design course
 * Category: 'Stamina Design'
 * Lesson IDs: 440–444
 *
 * Reframes "building stamina" not as raising total capacity, but as the design
 * of when, where, and how you allocate energy and how you recover it — applied
 * across four settings: studying, working, playing, and parenting.
 */
import type { LessonData } from './lessonData'

// ── Lesson 440: Think in allocation, not total capacity ──────
const staminaLesson440: LessonData = {
  id: 440,
  title: 'Think about stamina as allocation, not total capacity',
  category: 'Stamina Design',
  steps: [
    {
      type: 'explain',
      title: 'What we call "low stamina" is usually a problem of allocation',
      content:
        'When you tire quickly, it is tempting to conclude, "I just don\'t have much stamina." But most fatigue does not come from a shortage of total energy. It comes from putting your limited energy in the wrong place, in the wrong order.\n\nIn this course, we define stamina like this.\n\nStamina is the ability to keep an activity going, at the quality it needs, for as long as it needs. And that ability depends not only on how much energy you have, but on when, where, and how you allocate it and how you recover it.\n\n- You burn your sharpest morning hour on email and small chores.\n- You don\'t notice you are tired until you collapse at the limit.\n\nBoth are problems of allocation, not of total energy.\n\n:::point\nMost of your tiredness is not a shortage of total energy but a mistake in allocation. The first thing to train is not willpower, but the design of where your energy goes.\n:::',
    },
    {
      type: 'explain',
      title: 'Stop managing time, and start managing energy',
      content:
        'When we fill our schedules, we tend to think in terms of time: which hours are open. But an hour when your mind is sharp and an hour when you are exhausted are not the same hour. The amount you can do is completely different.\n\nSo the thing to manage is not time, but energy. Once you know which hours of your day are high-energy and which are low, you can place heavy work in the high hours and light work in the low hours. The same 24 hours then hold more.\n\n- Put work that demands focus into your high-energy hours.\n- Push routine or simple tasks into your low-energy hours.\n- Schedule by "when I\'m sharp," not by "when I\'m free."\n\nWhen your energy peaks differs from person to person. Knowing your own curve is the starting point of allocation.\n\n:::tip\nBuild your schedule around energy levels, not open slots. Just moving heavy work into your sharp hours changes what the same day produces.\n:::',
    },
    {
      type: 'explain',
      title: "Don't run energy to empty; top it up early",
      content:
        'Many people rest only after they have used up all their energy, but this is the most expensive way to spend it. Pushing to the limit makes recovery slow, and the fatigue carries over to the next day.\n\nRecovery has two timings.\n\n- Recovery after depletion (recovering once you\'re spent).\n- Recovery before depletion (topping up in small amounts before you run out).\n\nRather than refueling only after the tank is empty, you add a little when it drops to half. That is recovery in advance. A short break before you fully run out keeps you from crashing deeply, and the cost of recovering is smaller.\n\n- Step away for a few minutes at a break, before you burn out after 90 minutes of grinding.\n- Rest briefly while you can still move, not after you\'re already drained.\n\n:::point\nTopping up energy as it starts to drop is cheaper than running to empty and then refilling. Recovery is something you plan in advance, not something you do only afterward.\n:::',
    },
    {
      type: 'explain',
      title: "Resting in a way that doesn't actually restore you",
      content:
        'Sometimes you rest and still feel tired. That is because "resting" is not the same as "doing nothing." Even if your body is still, if your mind keeps churning on work or keeps processing other information, your brain is not resting.\n\nTake the phone during a break. Your hands are still, but while you chase social feeds and notifications, your brain keeps processing new information. That is not recovery; it is just switching to a different task.\n\nRestful rest shares a common feature.\n\n- [icon:good] Restful rest: reduce input (close your eyes, look outside, walk, take your mind off work).\n- [icon:bad] Non-restful rest: change input (phone, looking something else up, thinking about the next work task).\n\nHow to rest in each setting comes later, but the shared principle is to reduce input.\n\n:::warn\nIf your mind keeps moving while your body is still, your brain is not resting. The phone during a break is task-switching, not recovery. To truly recover, cut the input itself.\n:::',
    },
    {
      type: 'explain',
      title: 'Three foundations shared by all four settings',
      content:
        'This course covers four settings: studying, working, playing, and parenting. The tactics differ by setting, but the foundation is shared. In every setting, these three decide the quality of your allocation and recovery.\n\n1. When you allocate (allocation across the day)\nPut heavy activity in high-energy hours and light activity in low-energy hours. The same effort yields different results.\n\n2. Where you allocate (allocation across settings)\nIf you pour full effort into all four settings, something will always get cut. You have to deliberately give more to the setting that matters most right now, and lighten the rest.\n\n3. How you restore (planning recovery)\nInsert small recovery in advance, not after you are spent. Choose ways of resting that reduce input.\n\nFrom the next lesson on, we make these three concrete, one setting at a time.\n\n:::point\nThe setting changes, but the foundation stays the same: when you allocate, where you allocate, and how you restore. Design these three, and you will tire less in any setting.\n:::',
      visual: 'ThreePillarsDiagram',
      visualProps: {
        sectionLabel: 'Three foundations shared by all four settings',
        pillars: [
          {
            icon: '1',
            title: 'When you allocate',
            body: 'Across the day. Put heavy activity in high-energy hours and light activity in low-energy hours.',
          },
          {
            icon: '2',
            title: 'Where you allocate',
            body: 'Across settings. Give more to the setting that matters most now, and deliberately lighten the rest.',
          },
          {
            icon: '3',
            title: 'How you restore',
            body: 'Plan recovery. Insert small recovery in advance, not after you are spent, and choose rest that reduces input.',
          },
        ],
        hint: 'When, where, and how you restore. Design these three and you tire less in any setting.',
      },
      outro:
        "These three pillars are the spine of the whole course. Each setting's lesson is really these three applied to studying, working, playing, or parenting. When a setting-specific tactic confuses you, returning to these three makes things easier to sort out.",
    },
    {
      type: 'quiz',
      question: 'Which best captures what "building stamina" means in this course?',
      options: [
        { label: 'Designing when, where, and how you allocate your limited energy, and how you recover it', correct: true },
        { label: 'Increasing your daily exercise to keep raising your total energy capacity itself', correct: false },
        { label: 'Training the grit to push to the limit, assuming you will feel tired anyway', correct: false },
        { label: 'Pouring equal full effort into every setting and keeping all of them at a high level', correct: false },
      ],
      explanation:
        'Stamina is the ability to sustain quality work over time, and its essence is the design of allocation and recovery, not just total energy. Raising total capacity is not useless, but since much fatigue comes from misallocation, redesigning that pays off first. Pushing on grit tends to backfire because it spends energy to empty and raises the cost of recovery. Pouring equal full effort into all settings always cuts one of them; the heart of allocation is the decision to load up the setting that matters most now.',
    },
    {
      type: 'quiz',
      question: 'Which is closest to the idea of "recovery in advance"?',
      options: [
        { label: 'Rest briefly while you can still move, topping up before energy runs out', correct: true },
        { label: 'Push to the limit until you no longer feel tired, then take one long rest afterward', correct: false },
        { label: 'Keep chasing feeds on your phone during breaks, switching mood while you keep working', correct: false },
        { label: 'Use caffeine to raise alertness when drowsy, and keep working without resting', correct: false },
      ],
      explanation:
        'Recovery comes in two timings, and recovery in advance means topping up in small amounts before you are fully spent. Like adding fuel at half a tank rather than only after it runs dry, you avoid crashing deeply, so the cost of recovering stays small. Pushing to the limit and then resting is recovery after depletion, which is slow and carries over to the next day. Phone breaks don\'t restore you because the brain keeps processing. Caffeine temporarily raises alertness but does not actually restore the energy you spent.',
    },
  ],
}

// ── Lesson 441: Build study stamina ─────────────────────────
const staminaLesson441: LessonData = {
  id: 441,
  title: 'Build study stamina — ride learning on the wave of focus',
  category: 'Stamina Design',
  steps: [
    {
      type: 'explain',
      title: '"Always focused" isn\'t a design; it\'s burnout',
      content:
        'Watching someone sit at a desk for hours, we tend to think, "They have great focus." But human focus is not constant. The brain is thought to have a rhythm in which alertness rises and falls over waves of roughly one to two hours (this is called the ultradian rhythm). The length of the wave varies from person to person.\n\nSo the stamina to study is not the power to hold steady focus forever; it is the skill of riding learning on the rising wave and recovering on the falling one.\n\n- Cling to the desk on willpower and ignore the wave, and the second half fills with time where you read but nothing sticks.\n- Even within the same two hours, breaking them up along the wave changes both how much you remember and how deeply you understand.\n\n:::point\nStudy stamina is not the power to keep sitting through it; it is the skill of riding learning on the wave of focus and recovering in the troughs. What to train first is not your seat, but your allocation.\n:::',
    },
    {
      type: 'explain',
      title: 'The wave differs by person — don\'t swallow "90 minutes" whole',
      content:
        'People often say, "Focus breaks at 90 minutes, so take a break every 90." That figure spread from sleep research; it is a useful reference, but not a fixed rule that fits everyone. As the previous slide noted, the wave length varies by person, and it shifts with that day\'s sleep and condition.\n\nSo rather than borrowing someone else\'s number, observing your own wave for one or two weeks is the shortcut. The method is simple.\n\n- Note the time when, after starting to study, you feel "my focus is dropping."\n- Collect over a few days how many minutes it took for [icon:clock] focus to break.\n- Averaged, the length of wave you can ride at once (say, 40, 60, or 80 minutes) becomes visible.\n\nOnce you know "your one unit," you can build a study-and-break rhythm around it. A 25-minutes-on, 5-minutes-off Pomodoro works for those it suits, but it\'s realistic to use it on the premise that you adjust it to your own unit.\n\n:::warn\nIf you decide "90 minutes is correct" or "Pomodoro is correct" and keep a form that doesn\'t fit you, you\'ll force a stop mid-wave or push on after it breaks, and efficiency actually drops. A form is a tool to be tuned to your own wave.\n:::',
    },
    {
      type: 'explain',
      title: '"Split and return" saves more stamina than cramming',
      content:
        'What drains study stamina the most is, in fact, trying to do it all at once. Cramming the night before an exam may feel like it goes in for the moment, but it doesn\'t stick well, and because it cuts into sleep, it even borrows against the next day\'s focus.\n\nWhat memory research repeatedly supports is spaced learning. For the same total time, spreading it across several sessions with gaps tends to keep things in memory longer than doing it all in one go.\n\n- Three hours in one block → it feels like progress at the time, but you forget fast.\n- One hour over three days → [icon:up] same total time, but it sticks better, and each session costs less.\n\nSeen through stamina, splitting has a double benefit. Each session is short, so you use only the rising wave and don\'t strain in the trough. And because recalling strengthens memory, you approach the same result with less effort.\n\n:::tip\nWhen learning something new, prefer "short, several times" over "long, once." Recalling after a gap both sticks better and costs less stamina.\n:::',
    },
    {
      type: 'explain',
      title: "Clear the brain's desk — reduce cognitive load",
      content:
        'The reason focus breaks early isn\'t always a lack of motivation. It\'s because there\'s a limit to how much information the brain can handle at once. This is called cognitive load. Just as a cluttered desk slows your work, the more irrelevant information and nagging concerns there are, the less capacity is left for the learning itself.\n\nThere are typical things that steal the capacity that should go to learning.\n\n- Phone notifications — each ring pulls your attention, and it costs to get back.\n- The nagging of unfinished tasks: "I have to do that too."\n- The switching cost of moving back and forth between several subjects or books at once.\n\nPut the other way, just clearing these first lengthens the time you can focus with the very same brain.\n\n- Before studying, put the phone in another room or turn off notifications.\n- Write nagging concerns on paper and decide "not now."\n- In one block, narrow to a single thing.\n\n:::point\nFocus often breaks not because you lack grit, but because the brain\'s desk is cluttered. Just moving the clutter aside first lets the same you focus longer.\n:::',
    },
    {
      type: 'explain',
      title: 'Three foundations that support study stamina',
      content:
        "Finally, let's gather all this as your daily foundation. Before any technique, if these three are broken, the wave itself weakens.\n\n1. Don't cut sleep to add study time\nSleep is also the time when memory consolidates. Study time bought by cutting sleep doesn't stick well and lowers the next day's focus, so it tends to be a net loss.\n\n2. Move your body to tune a \"brain that can focus\"\nPeople who keep up aerobic exercise tend to strengthen the very abilities that help studying, such as attention and executive function; this is reported in several meta-analyses. The effect size is moderate and varies across studies. Intense exercise isn't needed; a walk or light movement is fine.\n\n3. Truly recover during breaks\nScrolling social feeds during a break keeps the brain processing other information, so it doesn't rest. Breaks that reduce input, such as closing your eyes, walking a little, or looking out the window, restore the wave more easily.\n\n:::tip\nStudy stamina isn't decided on the desk alone. Sleep, exercise, and rest set the height of the wave, and riding learning on that wave is what makes studying last.\n:::",
      visual: 'ThreePillarsDiagram',
      visualProps: {
        sectionLabel: 'Three foundations that support study stamina',
        pillars: [
          {
            icon: 'S',
            title: "Don't cut sleep",
            body: "Sleep consolidates memory. Study time bought by cutting it sticks poorly and lowers the next day's focus.",
          },
          {
            icon: 'E',
            title: 'Move your body',
            body: 'Aerobic exercise tends to raise attention and executive function (moderate effect, varies by study). A walk is fine.',
          },
          {
            icon: 'R',
            title: 'Recover during breaks',
            body: 'Scrolling feeds keeps the brain processing. Closing your eyes or walking reduces input and restores the wave.',
          },
        ],
        hint: 'Sleep, exercise, and rest set the height of the wave; riding learning on it is what lasts.',
      },
      outro:
        'None of these three are "studying itself," but they are the foundation of study stamina. The higher the foundation, the higher the wave of focus, and the farther the same hour takes you. Before adding techniques, first check whether these three pillars are intact.',
    },
    {
      type: 'quiz',
      question: 'Which is the most appropriate way to think about "building study stamina"?',
      options: [
        { label: 'Grasp the length of your own focus wave, and allocate learning to the rises and recovery to the troughs', correct: true },
        { label: 'Focus can be trained to stay constant, so practice continuing for long stretches without rest', correct: false },
        { label: 'Focus breaks at 90 minutes for everyone, so always take a break every 90 minutes', correct: false },
        { label: 'Maximizing the hours you face the desk on willpower, even when sleepy, is what builds stamina', correct: false },
      ],
      explanation:
        'Human focus is not constant; it is thought to come in waves. Study stamina is not the power to hold the wave steady but the skill of allocating learning to the rises and recovery to the troughs. "Every 90 minutes" is a reference from sleep research, but the wave length varies by person and is not a universal fixed rule. Maximizing hours on willpower increases the "nothing-sticks" time later, and cutting sleep borrows against the next day\'s focus, so it rarely builds stamina.',
    },
    {
      type: 'quiz',
      question: 'For the same total study time, which is more likely to stick and cost less stamina?',
      options: [
        { label: 'Split it into one hour each over three days, recalling with gaps in between', correct: true },
        { label: 'Cram three hours the night before the exam, cutting sleep to memorize it all', correct: false },
        { label: 'Go three hours straight, sitting it out on willpower even after focus breaks', correct: false },
        { label: 'Push through three hours while switching among several subjects every 15 minutes', correct: false },
      ],
      explanation:
        'What memory research repeatedly supports is spaced learning. For the same total time, spreading it across several sessions with gaps tends to keep things in memory longer. The shorter each session, the more you use only the rising wave and avoid straining in the trough, so the cost is smaller too. Cramming cuts sleep and borrows against the next day\'s focus, and it sticks poorly. Sitting it out on willpower increases "nothing-sticks" time. Switching subjects at short intervals raises switching cost (cognitive load), leaving everything half-done.',
    },
  ],
}

// ── Lesson 442: Build work stamina ──────────────────────────
const staminaLesson442: LessonData = {
  id: 442,
  title: 'Build work stamina — design allocation and recovery within constraints',
  category: 'Stamina Design',
  steps: [
    {
      type: 'explain',
      title: "Work stamina is a fight with the schedule you don't control",
      content:
        "With studying, you can decide for yourself, more or less, when and how much to do. Work isn't like that. Deadlines, meetings, and other people's requests fly in from outside, filling your schedule with no regard for your own energy wave.\n\nSo work stamina is not the power to build an ideal allocation; it is the skill of making the most of the parts you can move, inside a schedule you can't.\n\n- Meetings and requests fragment your day, so you can't get a solid block of focus.\n- Things you can't control land right on your peak hour.\n\nYou can't make everything go your way. That's exactly why where you spend the small movable part matters.\n\n:::point\nWork stamina is not the power to build an ideal day. It is the skill of designing where to spend the parts you can move, inside a schedule you can't.\n:::",
    },
    {
      type: 'explain',
      title: 'Defend your peak — one block a day',
      content:
        'You can\'t decline every meeting and request. But you can usually secure one thing a day: your highest-energy stretch, held as a "focus block."\n\nWhat matters here is to put your heaviest work in that one block. Work that requires thinking, deciding, or creating. Force these into an energy trough and they take forever while the quality drops.\n\n- Reserve 60 to 90 minutes of your peak in the calendar first, as "no meetings, no messages."\n- Place exactly one task there: the one that demands the most thought that day.\n- Push light work, like replying to email and chat, into the energy troughs.\n\nTry to defend all your peaks and you\'ll defend none, but one block is realistically defensible.\n\n:::tip\nEven if you can\'t protect every peak, you can defend one block a day. Putting one heaviest task there alone changes the quality of the day\'s output.\n:::',
    },
    {
      type: 'explain',
      title: "Don't rely on willpower; reduce drain through environment",
      content:
        'People tend to think, "Focus is a matter of willpower." The idea that willpower drains as you keep using it (the "willpower is a muscle that depletes" view) is famous, but recent research has not reliably reproduced the effect, and it is being reconsidered. We cannot assert that willpower always decreases when used.\n\nWhat is certain is that arranging your environment drains you less than counting on willpower. Each time a temptation or distraction enters your sight, "resisting" it eats capacity by itself. So build an environment that reduces how often you have to resist.\n\n- Put the phone out of sight (reduce the number of times you resist at all).\n- During the focus block, turn off notifications and chat together.\n- Decide "what to do next" the day before, to cut decisions on the day.\n\nRather than trying to beat temptation with willpower, designing so you don\'t meet temptation in the first place makes your energy last.\n\n:::point\nFocus is decided more by the design of your environment than by the strength of your willpower. The more you rely on resisting, the more you drain, so an environment with fewer occasions to resist makes energy last longer.\n:::',
    },
    {
      type: 'explain',
      title: "A break isn't slacking; it's an investment in the next focus",
      content:
        'When busy, we tend to feel guilty about taking breaks. But cutting breaks to keep working drops your afternoon focus, and by evening even the quality of your decisions falls. A break is not time lost; it is an investment that supports the next focus.\n\nThis is called a strategic break. Rather than resting after you\'re tired, you rest briefly in advance, at the seam of a focus block.\n\n- After a focus block, step away from the screen and walk for 5 to 10 minutes.\n- During the post-lunch sleepy window, insert a light walk or a few minutes of rest.\n- During the break, don\'t chase information on your phone; reduce input (the "restful rest" we saw in 440).\n\nOn the effect of breaks: aerobic exercise tends to raise attention and executive function, as several meta-analyses report, but the effect size is moderate and varies across studies. Even a few minutes\' walk at midday helps you regroup in the afternoon.\n\n:::warn\nThe busier you are, the more you tend to cut breaks, but that is the same as cutting your afternoon focus and decision quality in advance. A break is not time lost; it is an investment that supports the next focus.\n:::',
    },
    {
      type: 'explain',
      title: 'People who keep working are people who plan recovery',
      content:
        "People who keep working at high quality for long stretches don't have more total energy than others. They deliberately run a cycle of depletion and recovery.\n\nWork with focus → energy drops → rest strategically → energy returns. Run this loop several times within a day, and you avoid the end-of-day state of \"I can't think anymore.\"\n\n- In the morning, clear the day's heaviest work in a focus block.\n- Insert short recovery at each seam to keep the troughs shallow.\n- Across the day, add recovery \"little and in advance,\" not \"a lot, later.\"\n\nWhether this loop is running is what separates how much you have left in the evening, even for the same workload.\n\n:::point\nYou keep working not because of total energy, but because you run a loop of depletion and recovery. Alternating focus with strategic breaks changes how much you have left in the evening.\n:::",
      visual: 'FeedbackLoopDiagram',
      visualProps: {
        sectionLabel: 'The strategic-break loop',
        loopType: 'R',
        loopName: 'You work because you rest',
        nodes: [
          { label: 'Work with focus' },
          { label: 'Energy drops' },
          { label: 'Rest strategically' },
          { label: 'Energy returns' },
        ],
        arrows: [
          { from: 0, to: 1, polarity: '+' },
          { from: 1, to: 2, polarity: '+' },
          { from: 2, to: 3, polarity: '+' },
          { from: 3, to: 0, polarity: '+' },
        ],
        hint: 'The more you plan recovery in advance, the faster the loop turns and the longer quality holds.',
      },
      outro:
        'This loop expresses the relationship "you can work because you rest." Cut breaks and stop the loop, and afternoon focus falls, so you end up slower. The more you plan recovery in advance, the faster the loop turns and the longer quality holds into the evening.',
    },
    {
      type: 'quiz',
      question: 'Which is the most appropriate way to think about "building work stamina"?',
      options: [
        { label: "Inside a schedule you can't move, defend one block at your peak for heavy work", correct: true },
        { label: 'Decline every meeting and request, and rebuild the whole day exactly to your ideal', correct: false },
        { label: 'Train your willpower to keep resisting temptation no matter what', correct: false },
        { label: 'Increase working hours even by cutting breaks, and maximize the sheer volume of work', correct: false },
      ],
      explanation:
        "At work, deadlines, meetings, and requests come from outside, so you can't build everything to your ideal. That's exactly why it's realistic to defend the one movable block inside an immovable schedule and place your heaviest work there. Declining everything doesn't hold at work. Counting on willpower to keep resisting is questioned because the effect isn't reliably reproduced, and resisting itself eats capacity, so reducing temptation through environment drains you less. Cutting breaks is the same as cutting afternoon focus and decision quality in advance.",
    },
    {
      type: 'quiz',
      question: 'Which is the soundest way to keep focus during work?',
      options: [
        { label: 'Put the phone out of sight, building an environment that reduces how often you resist', correct: true },
        { label: 'With strong willpower, keep up the effort not to look at the phone in front of you all day', correct: false },
        { label: 'After you feel tired, take one solid long break', correct: false },
        { label: 'When drowsy, add caffeine and keep working without taking a break', correct: false },
      ],
      explanation:
        "We can't assert that willpower always drains when used, but resisting a temptation each time it's in sight does eat capacity. So designing the environment to reduce how often you resist (such as putting the phone out of sight) drains you less. Keeping up the effort not to look is itself a cost. One long break only after you're tired is recovery after depletion, which deepens the trough and raises the cost of recovering. Caffeine temporarily raises alertness but doesn't restore what you spent, so it's no substitute for a strategic break.",
    },
  ],
}

// ── Lesson 443: Build play stamina ──────────────────────────
const staminaLesson443: LessonData = {
  id: 443,
  title: 'Build play stamina — play is the recovery engine',
  category: 'Stamina Design',
  steps: [
    {
      type: 'explain',
      title: '"Too tired to play" is a sign you\'ve put off recovery',
      content:
        'On a day off, you may feel "I don\'t feel like doing anything" or "I don\'t even have the energy to go out." This is not because play is a luxury; it\'s the result of putting off recovery while staying depleted from study and work.\n\nThere\'s a reason play comes last in this course. Play is not a fourth extra; it is the recovery engine that supports the other three: the stamina to study, to work, and to parent.\n\n- Having no energy to play is a sign that the other three kinds of stamina are also worn down.\n- If recovery is short, the next round of study, work, and parenting all drop in quality.\n\nPlay is not "something to do if you have room"; it is the foundation that lets the other activities continue.\n\n:::point\nPlay stamina is not a fourth extra. It is the recovery engine that supports studying, working, and parenting alike. Not being able to play is a sign you\'ve put recovery off.\n:::',
    },
    {
      type: 'explain',
      title: 'The four experiences that create recovery',
      content:
        'Free time doesn\'t recover you just by existing. The psychologists Sonnentag and Fritz organized four experiences that decide whether time away from work actually leads to recovery (the four recovery experiences, 2007).\n\n- Psychological detachment — not thinking about work; cutting work out of your head.\n- Relaxation — heart rate and tension come down; an unhurried state.\n- Mastery — gaining a sense of "getting better at it" in a field apart from work.\n- Control — the feeling that you are spending the time by your own choice.\n\nOf these, psychological detachment in particular is reported to relate consistently to recovery. Even if you rest your body on a day off, if your head keeps churning on work, you can\'t get detachment, so you don\'t fully recover.\n\n:::note\nYou don\'t need to do any one of the four perfectly. The realistic move is to check which of them your play already contains, and consciously add the missing experience.\n:::',
    },
    {
      type: 'explain',
      title: 'Even the same "play" can restore you or drain you',
      content:
        'Even activities you\'d call play can either lead to recovery or tire you out further. The difference is whether the four experiences above are present.\n\n- [icon:good] Restful play: you can lose yourself and forget work, you chose it, mind and body loosen up (a walk, a hobby, exercise, time with friends).\n- [icon:bad] Draining play: you join out of obligation, you keep watching for work messages, you\'re wiped out when it ends (idle phone scrolling, reluctant socializing).\n\nFor example, even the same phone: an absorbing game or piece of content lets you detach, but if you\'re just idly chasing notifications and feeds, the brain keeps processing information and it isn\'t recovery.\n\n:::tip\nWhether play restores you depends less on the kind of activity than on "is your head off work?" and "did you choose it?" Idle scrolling is work in the shape of play.\n:::',
      visual: 'GoodBadSlideDiagram',
      visualProps: {
        sectionLabel: 'Restful play vs. draining play',
        good: {
          title: 'Restful play',
          keyMessage: 'Your head is off work, and you chose it',
          points: [
            'You can lose yourself and forget work',
            'You chose the activity yourself',
            'Mind and body loosen up (a walk, a hobby, exercise, time with friends)',
          ],
        },
        bad: {
          title: 'Draining play',
          clutter: [],
          points: [
            'You join out of obligation',
            'You keep watching for work messages',
            "You're wiped out when it ends (idle scrolling, reluctant socializing)",
          ],
        },
      },
      outro:
        'Whether play restores you depends not on the kind of activity but on "is your head off work?" and "did you choose it?" Even the same phone lets you detach if you\'re absorbed, but idly chasing notifications keeps the brain processing — work in the shape of play.',
    },
    {
      type: 'explain',
      title: 'Active recovery — sometimes moving recovers you more',
      content:
        '"I\'m tired, so I\'ll do nothing" isn\'t always best. Light movement can recover you more than sprawling out and staring at your phone. This is called active recovery.\n\nThe point is not the load of the activity, but whether you get the four experiences.\n\n- A walk or light exercise easily gives detachment and relaxation at once.\n- A hobby or making something readily becomes an experience of mastery and control.\n- Meanwhile, endlessly staring at a screen on the sofa looks passive but often leaves the head unrested.\n\nThe more tired you are, the more "moving is impossible" feels true, but in many situations light active recovery restores mood and energy better than lazing around.\n\n:::point\nRecovery isn\'t always "doing nothing." Active recovery, moving lightly and getting your head off work, often recovers you more than idly staring at a screen.\n:::',
    },
    {
      type: 'explain',
      title: 'Schedule play — "if there\'s time left" never brings recovery',
      content:
        'If you treat play as "something to do once everything\'s done and you have room," that room never comes. Work and chores are endless if you let them be. To keep the recovery engine running, schedule play first.\n\n- Instead of "play if I have time," put recovery time on the calendar first.\n- It can be short. Secure a 15-minute walk or time with something you love.\n- Decide in advance that during that time you take psychological detachment from work messages.\n\nThis is not laziness. Planning recovery is an investment that sustains the other three kinds of stamina: study, work, and parenting. Building play stamina ends up supporting the stamina of every setting.\n\n:::tip\nPlay won\'t come as "if there\'s time left." Put recovery time on the calendar first. Keeping your play stamina supports the stamina of every other setting.\n:::',
      outro:
        'The four settings of this course support one another on a foundation of play as recovery. Study, work, and parenting all drop in quality if recovery runs dry. Building play stamina is the last and first step that lifts the staying power of all four settings.',
    },
    {
      type: 'quiz',
      question: 'Which best captures how this lesson positions "play stamina"?',
      options: [
        { label: 'It is the recovery engine that supports the stamina to study, work, and parent', correct: true },
        { label: 'It is a fourth activity you take up only after all duties are done and you have room', correct: false },
        { label: 'Resting your body and doing nothing is the single most efficient way to recover', correct: false },
        { label: 'As long as you keep time free, you recover automatically regardless of how you spend it', correct: false },
      ],
      explanation:
        'Play is not a fourth extra but the recovery engine that supports the other three kinds of stamina. Having no energy to play signals the others are worn down too, and short recovery lowers the quality of study, work, and parenting. "Once you have room" never arrives, because there\'s always more to do. Doing nothing isn\'t the only recovery; active recovery often restores you better. And even with free time, if you keep thinking about work and can\'t get detachment, you don\'t fully recover.',
    },
    {
      type: 'quiz',
      question: 'For the same day off, which is more likely to lead to recovery?',
      options: [
        { label: 'Get away from work messages and lose yourself in a hobby or walk you chose', correct: true },
        { label: 'Keep watching work chat while idly scrolling your phone on the sofa', correct: false },
        { label: 'Join a reluctant social obligation out of duty and feel wiped out when it ends', correct: false },
        { label: 'Keep thinking about work on your day off, rearranging the plan in your head', correct: false },
      ],
      explanation:
        'Recovery is decided not by the length of time but by whether the four recovery experiences (detachment, relaxation, mastery, control) are present. Losing yourself in a chosen hobby or walk readily becomes detachment and control, leading to recovery. Idle scrolling while watching work chat keeps the brain processing, so you can\'t detach. A social obligation lacks the sense of control and tires you instead. Keeping work in mind on a day off leaves you with the least psychological detachment, the very experience most consistently linked to recovery.',
    },
  ],
}

// ── Lesson 444: Build parenting stamina ─────────────────────
const staminaLesson444: LessonData = {
  id: 444,
  title: 'Build parenting stamina — distributed load and a design to rely on',
  category: 'Stamina Design',
  steps: [
    {
      type: 'explain',
      title: 'Parenting stamina is where special rules apply',
      content:
        "In earlier lessons, we talked about allocating your own energy yourself. Parenting adds a large element you can't move yourself: your child's needs, fragmented sleep, unpredictable interruptions. These aren't things willpower can solve.\n\nAnd parenting circumstances differ greatly from person to person. Whether you have a partner, whether there's someone nearby to rely on, whether you can afford to use services, your child's age and number of children. When the premises differ, what's possible differs too.\n\nThis lesson does not present a correct answer of \"do this and you won't tire.\" Please read it as a way to organize options you can choose from, depending on your situation.\n\n:::note\nThis lesson is not an imposition of one right answer. Premises differ greatly by home environment, finances, and whether you have a partner. Take only what fits your own situation and use that.\n:::",
    },
    {
      type: 'explain',
      title: '"100 points everywhere at once" is a problem of systems, not willpower',
      content:
        'While parenting, you may feel "I\'m hopeless because I can\'t do work, chores, and childcare all properly." But this isn\'t a problem of ability or grit. Resources like attention and focus are limited, and pouring a high level into every setting at the same time is physically impossible.\n\nThe "allocation" theme this course has repeated matters most strongly here. Put full effort into every setting and something will always be cut. So building in, from the start, that something gets cut keeps you from cornering yourself.\n\n- Trying to do everything at a high level leaves attention short and everything half-done.\n- Choosing "where to load up now" reduces the guilt of lightening the rest.\n\nThis is not slacking; it is deliberately allocating limited resources.\n\n:::point\n100 points everywhere at once is physically impossible, not a matter of grit. Attention is limited. Choosing "where to load up now" is allocation, not slacking.\n:::',
    },
    {
      type: 'explain',
      title: 'When sleep is fragmented, recover in pieces, not in one block',
      content:
        'Parenting includes periods when you\'re woken many times at night and can\'t get solid sleep. This is a hard load that your own effort can\'t fix. We won\'t say "power through it" here, nor "endure it, it\'ll end someday." Sleep loss has a real effect on judgment and mood.\n\nWhen you can\'t get solid sleep, one idea to consider is distributed recovery. If you can\'t sleep eight hours in one block, add recovery in pieces wherever you can.\n\n- During the short time your child naps, close your eyes too (a power nap).\n- It doesn\'t have to be perfect rest. Even 20 minutes lying down restores more than not.\n- On days your night sleep was cut, lighten the day\'s plans themselves in advance.\n\nThis does not fully resolve sleep loss. It is only a way to reduce the harm, to get through a period when you can\'t get enough.\n\n:::warn\nFragmented sleep is not something to "power through" or "just endure." It really affects judgment and mood. Distributed recovery is no magic that resolves it; it reduces the harm in a hard period. When the strain continues, not carrying it alone is also an option.\n:::',
    },
    {
      type: 'explain',
      title: 'If you have someone to rely on, design for relying',
      content:
        'Carry parenting entirely alone and the recovery engine stops completely. If there is someone you can rely on, or a system or service you can use, designing to use them in advance lets you act before depletion runs deep.\n\nThat said, whether you have someone or some system to rely on differs greatly by person. Some have a partner or family nearby; some don\'t. Some can afford services; for some it\'s hard. So this is not an instruction to "rely on others"; it\'s a point with the condition "if you have someone to rely on, make use of it."\n\n- If you have someone to rely on, put into words in advance what specifically to ask.\n- If there\'s a system or service you can use, look into it before you need it.\n- Try setting aside, just once, the assumption that "I have to do it all."\n\nIf you have no one to rely on, you don\'t need to blame yourself. The premise of the design is simply different; it is not your fault.\n\n:::note\nRelying is not weakness. But whether you have someone or some system to rely on differs by person. If you do, design to use it in advance; if you don\'t, you don\'t need to blame yourself. The premise is simply different.\n:::',
    },
    {
      type: 'explain',
      title: 'Three ways of thinking that support parenting stamina',
      content:
        "Finally, let's organize this lesson's thinking into three. None are commands to \"do this\"; they are perspectives for choosing according to your situation.\n\n1. Lower expectations\n100 points everywhere at once is physically impossible. Choose where to load up now, and hold the resolve to lighten the rest.\n\n2. Recover in pieces\nIn periods when you can't get solid sleep or rest, add recovery in a distributed way wherever you can. It doesn't have to be perfect.\n\n3. Have something to rely on\nIf there's someone to rely on, or a system or service you can use, design to use it in advance, before depletion runs deep. If you don't, don't blame yourself.\n\nParenting stamina is not decided by the amount of effort. How you allocate limited resources, how you restore them in pieces, and what you can rely on, this design changes the load of a hard period.\n\n:::point\nParenting stamina is not decided by the amount of effort. Lower expectations, recover in pieces, and use what you can rely on if you have it. These three change how heavy a hard period feels.\n:::",
      visual: 'ThreePillarsDiagram',
      visualProps: {
        sectionLabel: 'Three ways of thinking that support parenting stamina',
        pillars: [
          {
            icon: '1',
            title: 'Lower expectations',
            body: '100 everywhere at once is impossible. Choose where to load up now, and hold the resolve to lighten the rest.',
          },
          {
            icon: '2',
            title: 'Recover in pieces',
            body: "When you can't get solid sleep or rest, add recovery in a distributed way wherever you can. It needn't be perfect.",
          },
          {
            icon: '3',
            title: 'Have something to rely on',
            body: "If people or systems are available, design to use them in advance. If they aren't, don't blame yourself.",
          },
        ],
        hint: 'Parenting stamina is not the amount of effort; allocation, distributed recovery, and reliance change the load.',
      },
      outro:
        'These three are the opposite of "try harder." The load of parenting includes much that your own effort can\'t fix. That is exactly why supporting it with systems, allocation, recovery, and reliance, is the realistic path to continuing while protecting yourself.',
    },
    {
      type: 'quiz',
      question: 'Which best captures this lesson\'s idea of "parenting stamina"?',
      options: [
        { label: 'On the premise that 100 everywhere at once is impossible, design allocation, distributed recovery, and reliance', correct: true },
        { label: 'With grit and willpower, complete work, chores, and childcare all at a high level at the same time', correct: false },
        { label: 'A hard period will end someday, so endure it and get through it alone until then', correct: false },
        { label: 'Keep moving without rest until the child sleeps, and make up sleep all at once later', correct: false },
      ],
      explanation:
        'Human attention is limited, so maintaining a high level in every setting at once is physically impossible. So this lesson presents a way to lighten the load through design: allocation (where to load up now), distributed recovery (restore in pieces where you can), and reliance (use it in advance if available). "Do it all on grit" ignores the limit of resources. "Endure and get through alone" downplays the real effect of fragmented sleep and encourages bottling it up. Making up sleep all at once later isn\'t realistic during a fragmented period either.',
    },
    {
      type: 'quiz',
      question: "For a period when you can't get solid sleep, which is closest to this lesson's thinking?",
      options: [
        { label: "Rest in pieces, such as during your child's nap, and lighten the day's plans on days sleep was cut", correct: true },
        { label: 'Sleep loss is a matter of willpower, so keep all plans unchanged even when sleepy', correct: false },
        { label: 'Give up rest until a day you can sleep solidly, and keep going at full effort until then', correct: false },
        { label: 'Suppress drowsiness with caffeine, putting recovery off entirely to get through', correct: false },
      ],
      explanation:
        "When you can't get solid sleep, distributed recovery, adding recovery in pieces where you can, is realistic. Closing your eyes during a nap, and lightening the day's plans on days sleep was cut, reduce the harm. Sleep loss isn't a matter of willpower; it really affects judgment and mood. Giving up rest until a solid-sleep day deepens the trough and worsens depletion. Caffeine temporarily suppresses drowsiness but doesn't restore what you spent, so it's no substitute for recovery.",
    },
  ],
}

export const staminaLessonMapEn: Record<number, LessonData> = {
  440: staminaLesson440,
  441: staminaLesson441,
  442: staminaLesson442,
  443: staminaLesson443,
  444: staminaLesson444,
}
