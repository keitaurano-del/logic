export type Framework = 'why-so' | 'mece' | 'pyramid' | 'logic-tree'

export type Situation = {
  id: string
  framework: Framework
  frameworkLabel: string
  title: string
  emoji: string
  partnerName: string
  partnerRole: string
  partnerPersonality: string
  partnerInterests: string
  partnerConcerns: string
  goal: string
  context: string
  premium: boolean
}

export const SITUATIONS: Situation[] = [
  {
    id: 'why-so-report',
    framework: 'why-so',
    frameworkLabel: 'Why So / So What',
    title: '上司への報告',
    emoji: '📊',
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

export function getSituation(id: string): Situation | undefined {
  return SITUATIONS.find((s) => s.id === id)
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
