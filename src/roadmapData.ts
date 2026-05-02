// ===== Roadmap Data =====
// Defines learning goals (roadmaps) and their step sequences.

export type RoadmapStep = {
  lessonId: number
  title: string
  description: string
}

export type RoadmapDef = {
  id: string
  title: string
  subtitle: string
  emoji: string
  color: string
  steps: RoadmapStep[]
}

export const roadmaps: RoadmapDef[] = [
  {
    id: 'logic',
    title: 'ロジカルシンキング',
    subtitle: 'MECEからケーススタディまで',
    emoji: '🧠',
    color: '#FF8C00',
    steps: [
      { lessonId: 20, title: 'MECE', description: '情報を漏れなくダブりなく整理するフレームワーク' },
      { lessonId: 21, title: 'ロジックツリー', description: '問題を階層的に分解するWhyツリーとHowツリー' },
      { lessonId: 22, title: 'So What / Why So', description: '「だから何？」「なぜそう言える？」で論理をチェック' },
      { lessonId: 23, title: 'ピラミッド原則', description: '結論→理由→根拠の順で伝えるPREP法とSCR' },
      { lessonId: 24, title: 'ケーススタディ', description: '実践的なビジネスケースで全フレームワークを総合演習' },
    ],
  },
  {
    id: 'case',
    title: 'ケース面接',
    subtitle: '戦略ケースの解き方',
    emoji: '💼',
    color: '#F79009',
    steps: [
      { lessonId: 28, title: 'ケース面接入門', description: 'ケース面接の基本的な進め方とフレームワーク' },
      { lessonId: 29, title: 'プロフィタビリティケース', description: '収益性分析のフレームワークと解き方' },
      { lessonId: 35, title: '新市場参入ケース', description: '市場規模・競合・参入障壁の分析' },
      { lessonId: 36, title: 'M&Aケース', description: '企業価値評価とシナジー分析' },
    ],
  },
  {
    id: 'critical',
    title: 'クリティカルシンキング',
    subtitle: '情報を魜呪みにせず判断する',
    emoji: '🔍',
    color: '#059669',
    steps: [
      { lessonId: 40, title: 'クリティカルシンキング入門', description: '根拠をもとに自分の頭で判断する' },
      { lessonId: 41, title: '論理的誤謬を見破る', description: '「正しそうな嘘」に騙されない' },
      { lessonId: 42, title: 'データを正しく読む', description: '統計やグラフのトリックを見抑く' },
      { lessonId: 43, title: '問いを立てる力', description: '良い問いが良い答えを生む' },
    ],
  },
  {
    id: 'hypothesis',
    title: '仮説思考',
    subtitle: '考えてから調べる',
    emoji: '🎯',
    color: '#DC2626',
    steps: [
      { lessonId: 50, title: '仮説思考入門', description: 'まず仮の答えを立ててから検証する' },
      { lessonId: 51, title: '仮説の立て方と検証', description: '良い仮説の3条件と検証設計' },
      { lessonId: 52, title: '仮説ドリブンの課題解決', description: 'Day 1 AnswerとQuick & Dirty検証' },
    ],
  },
  {
    id: 'problem-setting',
    title: '課題設定',
    subtitle: '正しい問いを立てる',
    emoji: '💡',
    color: '#7C3AED',
    steps: [
      { lessonId: 53, title: '課題設定入門', description: 'Where → Why → Howのフレームワーク' },
      { lessonId: 54, title: 'イシュー分析', description: '解くべき問いを見極める' },
      { lessonId: 55, title: '課題設定実践', description: '空・雨・傘で事実→解釈→行動' },
    ],
  },
  {
    id: 'design-thinking',
    title: 'デザインシンキング',
    subtitle: '共感から始める問題解決',
    emoji: '🎨',
    color: '#0891B2',
    steps: [
      { lessonId: 56, title: 'デザインシンキング入門', description: '共感→定義→発想→試作→検証の5ステップ' },
      { lessonId: 57, title: '共感マップとペルソナ', description: 'ユーザーの頭の中を可視化する' },
      { lessonId: 58, title: 'デザインシンキング実践', description: 'How Might Weとブレインストーミング' },
    ],
  },
  {
    id: 'lateral',
    title: 'ラテラルシンキング',
    subtitle: '常識の外へ — 水平思考',
    emoji: '🚀',
    color: '#DB2777',
    steps: [
      { lessonId: 59, title: 'ラテラルシンキング入門', description: 'リフレーミングと逆転の発想' },
      { lessonId: 60, title: 'ラテラルの技法', description: 'SCAMPER法・ランダム刺激・6つの帽子' },
      { lessonId: 61, title: 'ラテラル実践', description: '前提を書き換えてイノベーションを生む' },
    ],
  },
  {
    id: 'analogy',
    title: 'アナロジー思考',
    subtitle: '異分野からヒントを得る',
    emoji: '🔗',
    color: '#D97706',
    steps: [
      { lessonId: 62, title: 'アナロジー思考入門', description: '構造的類似性を見抜く' },
      { lessonId: 63, title: 'アナロジーの技法', description: '抽象化と具体化で異分野をつなぐ' },
      { lessonId: 64, title: 'アナロジー実践', description: '異業種アナロジーチャレンジ' },
    ],
  },
  {
    id: 'systems',
    title: 'システムシンキング',
    subtitle: '全体を見て根本から変える',
    emoji: '🔄',
    color: '#2563EB',
    steps: [
      { lessonId: 65, title: 'システムシンキング入門', description: 'フィードバックループと氷山モデル' },
      { lessonId: 66, title: 'システム原型', description: 'よくあるパターンで問題を診断' },
      { lessonId: 67, title: 'システムシンキング実践', description: '因果ループ図とレバレッジポイント' },
    ],
  },
  {
    id: 'strategy',
    title: '経営戦略の進化',
    subtitle: '古典から共進化まで',
    emoji: '📈',
    color: '#6C8EF5',
    steps: [
      { lessonId: 320, title: '戦略の起源', description: 'テイラー・フォードと「計画する経営」の誕生' },
      { lessonId: 321, title: 'アンゾフのマトリクス', description: '製品×市場で成長の方向を決める' },
      { lessonId: 322, title: 'PPM', description: 'BCGマトリクスで事業ポートフォリオを管理する' },
      { lessonId: 323, title: 'ポーターの5フォース', description: '業界構造から収益性を読み解く' },
      { lessonId: 324, title: '3つの基本戦略', description: 'コストリーダーシップ・差別化・集中' },
      { lessonId: 325, title: 'RBVとVRIO', description: '内部資源で競争優位を説明する' },
      { lessonId: 326, title: 'コアコンピタンス', description: '組織能力を競争源泉に' },
      { lessonId: 327, title: 'ブルーオーシャン戦略', description: '競争のない市場をERRCで創る' },
      { lessonId: 328, title: 'ダイナミック・ケイパビリティ', description: '変化に適応するSense・Seize・Transform' },
      { lessonId: 329, title: 'プラットフォーム戦略', description: 'エコシステムと共進化で勝つ' },
    ],
  },
]

/** Look up a roadmap by its id */
export function getRoadmap(id: string): RoadmapDef | undefined {
  return roadmaps.find((r) => r.id === id)
}
