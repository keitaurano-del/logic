export type PlacementQuestion = {
  id: number
  question: string
  options: { label: string; correct: boolean }[]
  topic: string
  difficulty: 'easy' | 'medium' | 'hard'
}

export type PlacementResult = {
  deviation: number
  correctCount: number
  totalCount: number
  completedAt: string
  recommendedLessonIds: number[]
}

const STORAGE_KEY = 'logic-placement'

export const PLACEMENT_QUESTIONS: PlacementQuestion[] = [
  // ===== Easy: 概念の基本理解 =====
  {
    id: 1,
    topic: 'MECE',
    difficulty: 'easy',
    question: 'MECE(漏れなくダブりなく)の観点から、最も適切でない分類はどれか?',
    options: [
      { label: '社員: 男性 / 女性 / その他', correct: false },
      { label: '会社: 上場企業 / 非上場企業', correct: false },
      { label: '飲み物: 温かい / 冷たい / コーヒー', correct: true },
      { label: '購入頻度: 初回 / リピーター', correct: false },
    ],
  },
  {
    id: 2,
    topic: '結論ファースト',
    difficulty: 'easy',
    question: '上司への報告で最も伝わりやすいのはどの順番か?',
    options: [
      { label: '結論 → 理由 → 詳細', correct: true },
      { label: '背景 → 経緯 → 詳細 → 結論', correct: false },
      { label: '詳細 → 詳細 → 結論', correct: false },
      { label: '結論なしで事実だけ', correct: false },
    ],
  },
  // ===== Medium: フレームワーク使い分け =====
  {
    id: 3,
    topic: 'Why/Howツリー',
    difficulty: 'medium',
    question: '「売上が下がった原因を分析したい」とき、最適なツールは?',
    options: [
      { label: 'How ツリー', correct: false },
      { label: 'Why ツリー', correct: true },
      { label: 'PREP 法', correct: false },
      { label: 'SCR 法', correct: false },
    ],
  },
  {
    id: 4,
    topic: 'So What',
    difficulty: 'medium',
    question: '「当社のEC売上は前年比 120% で伸びている」という事実に対する最も良い So What? は?',
    options: [
      { label: 'EC 売上は 1.2 億円である', correct: false },
      { label: '前年は 1 億円だった', correct: false },
      { label: 'EC シフトが加速しており、EC チーム増員と店舗戦略の見直しが必要', correct: true },
      { label: '業界平均は 115% である', correct: false },
    ],
  },
  // ===== Medium-Hard: 演繹/帰納 =====
  {
    id: 5,
    topic: '演繹法',
    difficulty: 'medium',
    question: '次のうち、演繹法による推論はどれか?',
    options: [
      { label: '過去 5 年間 12 月の売上が高かった。今年も 12 月は伸びるだろう', correct: false },
      { label: '利益率 5% 未満の事業は撤退する方針。本件は 2% なので撤退対象', correct: true },
      { label: '3 人の顧客から好評だったので、市場全体に受ける', correct: false },
      { label: '競合がやっているので、当社もやるべきだ', correct: false },
    ],
  },
  {
    id: 6,
    topic: '帰納法の落とし穴',
    difficulty: 'hard',
    question: '20 代女性 5 人にアンケートして「20 代女性はブランド X が好き」と結論した。この帰納の最大の問題は?',
    options: [
      { label: 'ブランド X の定義が曖昧', correct: false },
      { label: 'サンプル数が少なく、偏りもチェックされていない', correct: true },
      { label: '20 代男性のデータがない', correct: false },
      { label: 'インタビューでなくアンケートだから', correct: false },
    ],
  },
  // ===== Hard: 形式論理 =====
  {
    id: 7,
    topic: '対偶',
    difficulty: 'hard',
    question: '「優秀な営業担当者は数字に強い」の対偶として正しいものは?',
    options: [
      { label: '数字に強い人は優秀な営業担当者である', correct: false },
      { label: '優秀でない営業担当者は数字に弱い', correct: false },
      { label: '数字に弱い人は優秀な営業担当者ではない', correct: true },
      { label: '数字に強くないなら優秀な営業担当者ではない可能性がある', correct: false },
    ],
  },
  {
    id: 8,
    topic: 'モーダス・トレンス',
    difficulty: 'hard',
    question: '次のうち、論理的に正しい推論(モーダス・トレンス)はどれか?',
    options: [
      { label: '雨が降れば地面が濡れる。地面が濡れている。だから雨が降った', correct: false },
      { label: 'サーバーが落ちればアラートが鳴る。アラートが鳴っていない。だからサーバーは落ちていない', correct: true },
      { label: '優秀な人は早く帰る。彼は早く帰った。だから彼は優秀だ', correct: false },
      { label: '雨が降れば傘を持つ人が増える。雨は降っていない。だから傘を持つ人は増えていない', correct: false },
    ],
  },
]

export function calcDeviation(correctCount: number, total: number): number {
  // 0/8 → 30, 4/8 → 50, 8/8 → 70 のリニアスケール
  if (total === 0) return 50
  const ratio = correctCount / total
  return Math.round(30 + ratio * 40)
}

export function rankLabel(dev: number): { label: string; color: string; comment: string } {
  if (dev >= 65) return { label: 'トップクラス', color: '#D4915A', comment: '形式論理まで含めて理解しています。応用編に進みましょう。' }
  if (dev >= 55) return { label: '上級', color: '#10B981', comment: '基礎は十分。演繹/帰納/形式論理の応用へ進みましょう。' }
  if (dev >= 45) return { label: '中級', color: '#5B7FB8', comment: 'MECE や Why/So What は理解済み。フレームワークの応用力を磨きましょう。' }
  if (dev >= 35) return { label: '初級', color: '#9B8E7E', comment: 'まずは MECE とロジックツリーから始めましょう。' }
  return { label: '入門', color: '#9B8E7E', comment: 'ロジカルシンキングの基礎から順番に学びましょう。' }
}

export function recommendedLessons(dev: number): number[] {
  // Logic lessons: 20=MECE, 21=LogicTree, 22=SoWhat, 23=Pyramid, 24=CaseStudies, 25=Deduction, 26=Induction, 27=FormalLogic
  if (dev >= 60) return [27, 24, 26, 25] // 上級: 形式論理 → 総合演習 → 帰納/演繹
  if (dev >= 50) return [25, 26, 23, 24] // 中級: 演繹 → 帰納 → ピラミッド → 総合
  if (dev >= 40) return [22, 23, 25, 26] // 初級: So What → ピラミッド → 演繹/帰納
  return [20, 21, 22, 23] // 入門: MECE → ロジックツリー → So What → ピラミッド
}

export function loadPlacementResult(): PlacementResult | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* */ }
  return null
}

export function savePlacementResult(r: PlacementResult): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(r))
}

export function hasCompletedPlacement(): boolean {
  return loadPlacementResult() !== null
}

export function skipPlacement(): void {
  // Mark as skipped with neutral score so we don't ask again
  savePlacementResult({
    deviation: 50,
    correctCount: 0,
    totalCount: 0,
    completedAt: new Date().toISOString(),
    recommendedLessonIds: recommendedLessons(50),
  })
}
