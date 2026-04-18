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
]

/** Look up a roadmap by its id */
export function getRoadmap(id: string): RoadmapDef | undefined {
  return roadmaps.find((r) => r.id === id)
}
