import { getLocale } from './i18n'

export type Framework = 'why-so' | 'mece' | 'pyramid' | 'logic-tree'

export type SituationCategory = 'business' | 'philosophy'
export type Difficulty = 'beginner' | 'intermediate' | 'advanced'

export type Situation = {
  id: string
  framework: Framework
  frameworkLabel: string
  title: string
  emoji: string
  category: SituationCategory
  difficulty: Difficulty
  partnerName: string
  partnerRole: string
  partnerPersonality: string
  partnerInterests: string
  partnerConcerns: string
  goal: string
  context: string
  premium: boolean
}

const SITUATIONS_JA: Situation[] = [
  {
    id: 'why-so-report',
    framework: 'why-so',
    frameworkLabel: 'Why So / So What',
    title: '上司への報告',
    emoji: '📊',
    category: 'business' as SituationCategory,
    difficulty: 'beginner' as Difficulty,
    partnerName: '田中部長',
    partnerRole: '事業部長',
    partnerPersonality: '結論ファースト派・忙しく時間がない・曖昧な説明には「で、結局何?」と詰める',
    partnerInterests: '数字・意思決定に必要な情報・So What(だから何?)',
    partnerConcerns: '時間の浪費・根拠の薄い提案',
    goal: '3分以内に状況を伝え、意思決定を引き出す',
    context:
      'あなたは担当プロジェクトの進捗について部長に報告する場面。部長はWhy So(なぜそう言える?)とSo What(だから何?)で深掘りしてくる。結論から話し、根拠を示すことを意識しよう。',
    premium: false,
  },
  {
    id: 'mece-meeting',
    framework: 'mece',
    frameworkLabel: 'MECE',
    title: '会議のファシリテーション',
    emoji: '🗂️',
    category: 'business' as SituationCategory,
    difficulty: 'intermediate' as Difficulty,
    partnerName: '会議参加者',
    partnerRole: '複数部門のメンバー',
    partnerPersonality: '議論が脱線しがち・抜け漏れに気づかない・重複した論点を繰り返す',
    partnerInterests: '自部門の都合・個別の事例',
    partnerConcerns: '会議が長引くこと・決まらないこと',
    goal: '論点をMECEに整理して合意形成する',
    context:
      'あなたは部門横断会議のファシリテーター。参加者の発言を「漏れなくダブりなく」整理し、論点を構造化する必要がある。MECEを意識して切り口を提示しよう。',
    premium: true,
  },
  {
    id: 'pyramid-client',
    framework: 'pyramid',
    frameworkLabel: 'ピラミッド原則',
    title: 'クライアント説明',
    emoji: '💼',
    category: 'business' as SituationCategory,
    difficulty: 'intermediate' as Difficulty,
    partnerName: '佐藤様',
    partnerRole: 'クライアント企業の役員',
    partnerPersonality: '論理の飛躍に厳しい・根拠を執拗に求める・経験豊富で見抜く力が強い',
    partnerInterests: '結論の妥当性・根拠の質・投資対効果',
    partnerConcerns: '主張の根拠が弱いこと・話が飛ぶこと',
    goal: 'ピラミッド原則(結論→理由→根拠)で提案を伝え、納得を得る',
    context:
      'あなたはクライアントに重要な提案を行う場面。結論を頂点に、3つの理由とその根拠で支える「ピラミッド構造」で話すこと。論理の飛躍は即座に指摘される。',
    premium: true,
  },
  {
    id: 'logic-tree-sub',
    framework: 'logic-tree',
    frameworkLabel: 'ロジックツリー',
    title: '部下への指示',
    emoji: '🌳',
    category: 'business' as SituationCategory,
    difficulty: 'intermediate' as Difficulty,
    partnerName: '新人後輩',
    partnerRole: '入社2年目のメンバー',
    partnerPersonality: '指示待ち・問題を抽象的にしか捉えられない・「どこから手をつければ?」と聞いてくる',
    partnerInterests: '具体的なタスク・進め方・優先順位',
    partnerConcerns: '何から手をつければいいか分からないこと',
    goal: '問題をロジックツリーで分解し、具体的なアクションに落とし込ませる',
    context:
      'あなたは後輩に「売上が伸びない」という問題の解決を指示する場面。Whyツリー(なぜ?)とHowツリー(どうやって?)を使って後輩と一緒に問題を分解し、具体的なアクションへ導こう。',
    premium: true,
  },
]

const SITUATIONS_EN: Situation[] = [
  {
    id: 'why-so-report',
    framework: 'why-so',
    frameworkLabel: 'Why So / So What',
    title: 'Reporting to your manager',
    emoji: '📊',
    category: 'business' as SituationCategory,
    difficulty: 'beginner' as Difficulty,
    partnerName: 'Director Anderson',
    partnerRole: 'Business unit director',
    partnerPersonality: 'Conclusion-first. Always pressed for time. Cuts off vague explanations with "So what is the point?"',
    partnerInterests: 'Numbers, decision-relevant information, So What',
    partnerConcerns: 'Wasting time, weakly-supported proposals',
    goal: 'In under 3 minutes, get the director to make a decision',
    context:
      'You are reporting on the progress of your project. The director will dig in with Why So? (why is that true?) and So What? (so what should we do?). Lead with the conclusion and back it with evidence.',
    premium: false,
  },
  {
    id: 'mece-meeting',
    framework: 'mece',
    frameworkLabel: 'MECE',
    title: 'Facilitating a cross-functional meeting',
    emoji: '🗂️',
    category: 'business' as SituationCategory,
    difficulty: 'intermediate' as Difficulty,
    partnerName: 'Meeting participants',
    partnerRole: 'Members from multiple departments',
    partnerPersonality: 'Tend to drift off-topic. Miss gaps. Repeat overlapping points.',
    partnerInterests: 'Their own department\'s convenience, individual examples',
    partnerConcerns: 'Long meetings, decisions never being made',
    goal: 'Organize the issues MECE-style and reach consensus',
    context:
      'You are facilitating a cross-functional meeting. You need to organize the participants\' input "with no gaps and no overlaps" and structure the discussion. Keep MECE in mind when proposing how to slice the problem.',
    premium: true,
  },
  {
    id: 'pyramid-client',
    framework: 'pyramid',
    frameworkLabel: 'Pyramid Principle',
    title: 'Presenting to a client',
    emoji: '💼',
    category: 'business' as SituationCategory,
    difficulty: 'intermediate' as Difficulty,
    partnerName: 'Mr. Wright',
    partnerRole: 'Executive at a client company',
    partnerPersonality: 'Strict about logical leaps. Demands evidence. Highly experienced and quick to spot weak arguments.',
    partnerInterests: 'Soundness of conclusions, quality of evidence, ROI',
    partnerConcerns: 'Weakly-supported claims, jumping topics',
    goal: 'Use the Pyramid Principle (conclusion → reasons → evidence) to win the client\'s buy-in',
    context:
      'You are presenting an important proposal to a client. Lead with the conclusion at the top of the pyramid, supported by 3 reasons and their evidence. Logical leaps will be called out immediately.',
    premium: true,
  },
  {
    id: 'logic-tree-sub',
    framework: 'logic-tree',
    frameworkLabel: 'Logic Tree',
    title: 'Giving direction to a junior team member',
    emoji: '🌳',
    category: 'business' as SituationCategory,
    difficulty: 'intermediate' as Difficulty,
    partnerName: 'Junior teammate',
    partnerRole: 'Second-year employee',
    partnerPersonality: 'Waits for instructions. Sees problems only abstractly. Asks "Where do I even start?"',
    partnerInterests: 'Concrete tasks, how to proceed, priority',
    partnerConcerns: 'Not knowing where to begin',
    goal: 'Use a logic tree to decompose the problem with them and turn it into concrete actions',
    context:
      'You are giving your junior teammate the problem "sales aren\'t growing." Use Why trees (why?) and How trees (how?) to decompose the problem together with them and guide them toward concrete actions.',
    premium: true,
  },
]

// Locale-aware list of situations.
export function getSituations(): Situation[] {
  return getLocale() === 'en' ? SITUATIONS_EN : SITUATIONS_JA
}

// Backwards-compat alias for callers that used the old constant.
export const SITUATIONS: Situation[] = SITUATIONS_JA

export function getSituation(id: string): Situation | undefined {
  return getSituations().find((s) => s.id === id)
}

// Build the `setup` object expected by /api/roleplay/chat
export function buildSetup(s: Situation) {
  return {
    template: { mode: 'conversation', title: s.title },
    format: 'online',
    partner: {
      name: s.partnerName,
      role: s.partnerRole,
      personality: s.partnerPersonality,
      interests: s.partnerInterests,
      concerns: s.partnerConcerns,
    },
    goal: s.goal,
    context: s.context,
  }
}
