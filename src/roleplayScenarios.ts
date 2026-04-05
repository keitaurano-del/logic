export type ScenarioFormat = 'in-person' | 'online'
export type ScenarioMode = 'chat' | 'presentation'

export type ScenarioTemplate = {
  id: string
  title: string
  description: string
  icon: string
  mode: ScenarioMode
  defaultPartner: PartnerProfile
  sampleGoals: string[]
  category: string
}

export type PartnerProfile = {
  name: string
  role: string
  company: string
  personality: string
  interests: string
  concerns: string
}

export type ScenarioSetup = {
  template: ScenarioTemplate
  format: ScenarioFormat
  partner: PartnerProfile
  goal: string
  context: string
}

// デモ用応答を生成するための想定質問
export type DemoResponse = {
  triggers: RegExp
  responses: string[]
}

export const scenarioTemplates: ScenarioTemplate[] = [
  {
    id: 'boss-review',
    title: '上司との評価面談',
    description: '四半期/年次の評価面談で成果を報告し、昇進や昇給の交渉をする',
    icon: '👔',
    mode: 'chat',
    category: '社内',
    defaultPartner: {
      name: '田中部長',
      role: '開発部門 部長',
      company: '自社',
      personality: '冷静で論理的。数字を重視する。部下の成長を期待している。',
      interests: 'チームの生産性、KPI達成率、人材育成',
      concerns: '予算超過、離職率',
    },
    sampleGoals: ['自分の成果をアピールしたい', '昇進について相談したい', 'チーム体制の変更を提案したい'],
  },
  {
    id: 'boss-proposal',
    title: '上司への企画提案',
    description: '新しいプロジェクトや施策を上司に提案して承認を得る',
    icon: '💡',
    mode: 'chat',
    category: '社内',
    defaultPartner: {
      name: '鈴木課長',
      role: '企画部 課長',
      company: '自社',
      personality: '慎重派。リスクを気にする。ROIを重視する。',
      interests: '費用対効果、実現可能性、スケジュール',
      concerns: 'リソース不足、前例のない施策への不安',
    },
    sampleGoals: ['新規プロジェクトの承認を得たい', '予算の増額を提案したい', 'ツール導入を提案したい'],
  },
  {
    id: 'client-pitch',
    title: 'クライアントへの提案',
    description: '新規・既存クライアントにサービスや製品を提案する',
    icon: '🤝',
    mode: 'chat',
    category: '社外',
    defaultPartner: {
      name: '山田様',
      role: '経営企画部 部長',
      company: 'ABC株式会社',
      personality: '結論を先に求める。コスト意識が高い。実績を重視する。',
      interests: '業務効率化、コスト削減、競合との差別化',
      concerns: '導入コスト、社内の抵抗、導入後のサポート体制',
    },
    sampleGoals: ['新規契約を獲得したい', 'アップセルの提案をしたい', '競合からの切り替えを提案したい'],
  },
  {
    id: 'client-negotiation',
    title: 'クライアントとの交渉',
    description: '価格、納期、条件について交渉する',
    icon: '⚖️',
    mode: 'chat',
    category: '社外',
    defaultPartner: {
      name: '佐藤様',
      role: '調達部 マネージャー',
      company: 'XYZ商事',
      personality: '交渉上手。値下げを求めてくる。Win-Winを意識する。',
      interests: 'コスト削減、長期的なパートナーシップ、品質保証',
      concerns: '予算制約、社内稟議の通りやすさ',
    },
    sampleGoals: ['価格を維持したまま契約したい', '納期の調整をしたい', '長期契約を提案したい'],
  },
  {
    id: 'presentation',
    title: 'プレゼンテーション',
    description: '社内外でのプレゼンを練習し、構成・話し方・説得力を採点してもらう',
    icon: '🎤',
    mode: 'presentation',
    category: 'プレゼン',
    defaultPartner: {
      name: '聴衆',
      role: '経営層・マネージャー層',
      company: '',
      personality: '多忙。要点を素早く把握したい。',
      interests: 'インパクトのある数字、明確な結論、具体的なアクション',
      concerns: '長すぎるプレゼン、抽象的な話、データの裏付け不足',
    },
    sampleGoals: ['新規事業の提案プレゼン', '四半期の業績報告', '新ツール導入の説明'],
  },
  {
    id: '1on1-subordinate',
    title: '部下との1on1',
    description: '部下の悩みを聞き、成長を支援する1on1ミーティング',
    icon: '🗣️',
    mode: 'chat',
    category: '社内',
    defaultPartner: {
      name: '中村くん',
      role: 'エンジニア（入社2年目）',
      company: '自社',
      personality: '真面目だが自信がない。言いたいことを遠回しに言う。',
      interests: 'スキルアップ、キャリアパス、チームでの役割',
      concerns: '仕事の進め方への不安、先輩との関係',
    },
    sampleGoals: ['部下のモチベーションを上げたい', '課題を一緒に整理したい', 'キャリアの相談に乗りたい'],
  },
]

// シナリオ設定に基づくデモ応答生成
export function generateDemoResponses(setup: ScenarioSetup): {
  opening: string
  responses: DemoResponse[]
  fallback: string[]
} {
  const { template, format, partner } = setup
  const formatNote = format === 'online' ? '（画面越しに）' : ''

  if (template.mode === 'presentation') {
    return {
      opening: `${formatNote}では、プレゼンを始めてください。準備ができたら、最初のスライドから説明をどうぞ。`,
      responses: [
        {
          triggers: /データ|数字|売上|成果|結果/,
          responses: [
            'その数字の根拠をもう少し詳しく教えていただけますか？',
            '前年比でどのくらいの改善でしょうか？',
          ],
        },
        {
          triggers: /提案|施策|プラン|計画/,
          responses: [
            '実現可能性について、もう少し具体的に聞かせてください。',
            'スケジュール感はどのように考えていますか？',
          ],
        },
        {
          triggers: /課題|問題|リスク/,
          responses: [
            'その課題に対する対策は検討されていますか？',
            'リスクヘッジの方法について教えてください。',
          ],
        },
      ],
      fallback: [
        'なるほど。続けてください。',
        'その点について、もう少し掘り下げて説明していただけますか？',
        '聴衆の立場からすると、具体例があるとよりわかりやすいですね。',
        'いいポイントですね。次のスライドに進んでください。',
      ],
    }
  }

  // 社内シナリオ
  if (template.category === '社内') {
    return {
      opening: `${formatNote}${partner.name}です。今日は時間を取ってくれてありがとう。${setup.goal ? `${setup.goal}について話すんだよね？` : 'まず、何から話そうか。'}さっそく始めましょう。`,
      responses: [
        {
          triggers: /成果|実績|達成|KPI|数字/,
          responses: [
            `具体的な数字で見せてもらえると助かる。${partner.interests}の観点ではどうだった？`,
            'それは頑張ったね。ただ、もう少し踏み込んで聞きたいんだけど、当初の目標と比べてどうだった？',
          ],
        },
        {
          triggers: /提案|やりたい|考えて|新しい/,
          responses: [
            `面白い発想だね。ただ、${partner.concerns}という点はどう考えてる？`,
            'その方向性は悪くないと思う。具体的にどのくらいのリソースが必要になる？',
          ],
        },
        {
          triggers: /悩|困|難し|課題|問題/,
          responses: [
            'そうか、それは大変だったね。具体的にどういう場面でそう感じた？',
            `なるほど。チームとして${partner.interests}をどう改善するか、一緒に考えよう。`,
          ],
        },
        {
          triggers: /昇進|昇給|評価|キャリア/,
          responses: [
            '率直に言うと、今の評価はこうだ。まず現状の認識を合わせよう。',
            'キャリアについて真剣に考えているのはいいことだ。会社としてどんなポジションで活躍してほしいか、話そう。',
          ],
        },
      ],
      fallback: [
        'なるほど、よく分かった。もう少し詳しく聞かせてくれる？',
        'その点は重要だね。他に気になっていることはある？',
        `${partner.name}として一つアドバイスすると、もう少し具体的なアクションプランがあるといいかな。`,
        'いい視点だと思う。では、次のステップとしてどう考えている？',
      ],
    }
  }

  // 社外シナリオ
  return {
    opening: `${formatNote}${partner.name}（${partner.company} ${partner.role}）です。本日はお時間いただきありがとうございます。${setup.goal ? `${setup.goal}についてお聞きできればと思います。` : 'さっそくですが、本題に入りましょう。'}`,
    responses: [
      {
        triggers: /価格|費用|コスト|予算|金額/,
        responses: [
          `正直なところ、${partner.concerns}が気になっています。価格の根拠をもう少し説明いただけますか？`,
          '他社と比較した場合の優位性はどこにありますか？',
        ],
      },
      {
        triggers: /実績|事例|導入|他社/,
        responses: [
          '同業種での導入事例はありますか？具体的な成果を教えてください。',
          '導入後のサポート体制はどうなっていますか？',
        ],
      },
      {
        triggers: /納期|スケジュール|いつ|期間/,
        responses: [
          '社内稟議のスケジュールもあるので、もう少し早められませんか？',
          '導入からROIが出るまでの期間はどのくらいですか？',
        ],
      },
      {
        triggers: /メリット|効果|改善|削減/,
        responses: [
          `${partner.interests}の観点で、定量的な効果を教えていただけますか？`,
          '現状の課題に対して、御社のソリューションがどうフィットするのか具体的に教えてください。',
        ],
      },
    ],
    fallback: [
      'なるほど。その点はよく分かりました。他に何かありますか？',
      '社内で検討する際の判断材料として、もう少し詳しい資料はいただけますか？',
      `${partner.concerns}についてはどうお考えですか？`,
      '面白いですね。ただ、弊社の状況に合わせてカスタマイズは可能ですか？',
    ],
  }
}

// プレゼン採点カテゴリ
export type ScoreCategory = {
  name: string
  description: string
  maxScore: number
}

export const presentationScoreCategories: ScoreCategory[] = [
  { name: '論理構成', description: '話の流れが論理的で分かりやすいか', maxScore: 10 },
  { name: '説得力', description: 'データや根拠に基づいた説得力があるか', maxScore: 10 },
  { name: '簡潔さ', description: '要点が絞られていて無駄がないか', maxScore: 10 },
  { name: '対応力', description: '質問への回答が適切か', maxScore: 10 },
  { name: '印象', description: '話し方や態度が好印象か', maxScore: 10 },
]

export const chatScoreCategories: ScoreCategory[] = [
  { name: 'コミュニケーション', description: '相手の話を受け止め、適切に応答できているか', maxScore: 10 },
  { name: '論理性', description: '主張に筋が通っているか', maxScore: 10 },
  { name: '交渉力', description: '自分の立場を守りつつ、相手にも配慮できているか', maxScore: 10 },
  { name: '具体性', description: '抽象論でなく具体的な話ができているか', maxScore: 10 },
  { name: '目標達成', description: '設定したゴールに向かって話を進められたか', maxScore: 10 },
]

// デモ用採点生成
export function generateDemoScores(
  mode: ScenarioMode,
  messageCount: number,
): { scores: { name: string; score: number; maxScore: number; feedback: string }[]; overall: string } {
  const categories = mode === 'presentation' ? presentationScoreCategories : chatScoreCategories
  const base = Math.min(messageCount * 0.8, 6)

  const scores = categories.map((cat) => {
    const score = Math.min(Math.round(base + Math.random() * 3 + 1), cat.maxScore)
    const feedbacks: Record<string, string[]> = {
      '論理構成': ['話の流れが整理されています。', '結論→理由→具体例の順序を意識するとさらに良くなります。'],
      '説得力': ['根拠のある主張ができています。', 'データや数字をもっと使うと説得力が増します。'],
      '簡潔さ': ['要点がまとまっています。', '少し話が長くなる場面がありました。30秒以内を意識しましょう。'],
      '対応力': ['質問に対して的確に回答できています。', '想定外の質問にも落ち着いて対応する練習をしましょう。'],
      '印象': ['丁寧な受け答えができています。', '自信を持って話すとさらに印象が良くなります。'],
      'コミュニケーション': ['相手の話をよく聞けています。', '相手の発言をもう少し受け止めてから自分の意見を述べると良いです。'],
      '論理性': ['筋の通った議論ができています。', '主張の根拠をもう少し明確にすると説得力が増します。'],
      '交渉力': ['バランスの取れた交渉ができています。', '自分の立場をもう少し明確に示しても良いでしょう。'],
      '具体性': ['具体的な例を挙げられています。', '数字や期限を入れるとさらに具体的になります。'],
      '目標達成': ['ゴールに向かって話を進められています。', '途中で話題がそれる場面がありました。ゴールを意識しましょう。'],
    }
    const fb = feedbacks[cat.name] || ['良い取り組みです。']
    return {
      name: cat.name,
      score,
      maxScore: cat.maxScore,
      feedback: score >= 7 ? fb[0] : fb[1] || fb[0],
    }
  })

  const total = scores.reduce((sum, s) => sum + s.score, 0)
  const max = scores.reduce((sum, s) => sum + s.maxScore, 0)
  const pct = Math.round((total / max) * 100)

  let overall: string
  if (pct >= 80) {
    overall = '素晴らしいパフォーマンスです！自信を持って本番に臨んでください。'
  } else if (pct >= 60) {
    overall = '全体的に良い内容です。フィードバックのポイントを意識してもう一度練習すると、さらに良くなります。'
  } else {
    overall = 'いい練習になりましたね。各項目のフィードバックを参考に、ポイントを絞って改善していきましょう。'
  }

  return { scores, overall }
}
