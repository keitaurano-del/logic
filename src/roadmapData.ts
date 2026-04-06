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
    id: 'boki3',
    title: '簿記3級 合格',
    subtitle: '仕訳の基礎から模擬試験まで',
    emoji: '📘',
    color: '#6366F1',
    steps: [
      { lessonId: 6, title: '簿記3級 入門', description: '仕訳・勘定科目・試算表の基礎' },
      { lessonId: 7, title: '決算と財務諸表', description: '精算表・損益計算書・貸借対照表の作成' },
      { lessonId: 11, title: '仕訳問題 50問ドリル', description: '本試験頻出の仕訳を徹底演習' },
      { lessonId: 12, title: '勘定記入・補助簿ドリル', description: '補助簿の選択・伝票・勘定記入を演習' },
      { lessonId: 13, title: '決算・精算表ドリル', description: '決算整理仕訳・精算表・B/S・P/Lを演習' },
      { lessonId: 99, title: '簿記3級 模擬試験', description: '60分・25問・合格ライン70%の本番形式' },
    ],
  },
  {
    id: 'boki2c',
    title: '簿記2級 商業簿記',
    subtitle: '連結会計・税効果会計をマスター',
    emoji: '📗',
    color: '#06B6D4',
    steps: [
      { lessonId: 8, title: '簿記2級 商業簿記', description: '連結会計・税効果会計・リース取引' },
      { lessonId: 14, title: '仕訳入力ドリル', description: '勘定科目と金額を自分で入力する実践演習' },
      { lessonId: 15, title: '精算表穴埋めドリル', description: '精算表の空欄に数字を入力して完成させる' },
    ],
  },
  {
    id: 'boki2i',
    title: '簿記2級 工業簿記',
    subtitle: '原価計算・CVP分析を完全攻略',
    emoji: '📙',
    color: '#F59E0B',
    steps: [
      { lessonId: 9, title: '簿記2級 工業簿記', description: '原価計算・標準原価・CVP分析' },
    ],
  },
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
    id: 'pm',
    title: 'プロジェクトマネジメント',
    subtitle: 'PM基礎からPMBOK試験対策まで',
    emoji: '📊',
    color: '#00C2A8',
    steps: [
      { lessonId: 30, title: 'PM基礎', description: 'プロジェクトの定義・PMの役割・制約条件' },
      { lessonId: 31, title: 'プロセス群', description: '5つのプロセス群・WBS・プロジェクト憲章' },
      { lessonId: 32, title: '知識エリア', description: '統合・スコープ・スケジュール・コスト・品質・EVM' },
      { lessonId: 33, title: 'ツールと技法', description: 'CPM・PERT・リスク分析・品質管理ツール' },
      { lessonId: 34, title: 'PMBOK総合演習', description: 'PMBOK試験レベルのシチュエーション問題・EVM計算' },
    ],
  },
]

/** Look up a roadmap by its id */
export function getRoadmap(id: string): RoadmapDef | undefined {
  return roadmaps.find((r) => r.id === id)
}
