export type V2Sample = {
  slug: string
  number: string
  title: string
  lessonRef: string
  desc: string
}

export const samplesV2: V2Sample[] = [
  {
    slug: 'deduction-induction',
    number: 'v2-1',
    title: '演繹法 vs 帰納法',
    lessonRef: 'lesson-25 / lesson-26',
    desc: '論理が上から流れ落ちる演繹と、サンプルが法則化されて吸い上げられる帰納を、矢印アニメで対比',
  },
  {
    slug: 'correlation-causation',
    number: 'v2-2',
    title: '相関 ≠ 因果（lurking variable）',
    lessonRef: 'lesson-71',
    desc: '散布図に第三変数 Z がフェードインして登場。X も Y も Z に引っ張られているのが線で可視化',
  },
  {
    slug: 'abstraction-ladder',
    number: 'v2-3',
    title: '抽象ラダー（具体 ↔ 抽象）',
    lessonRef: 'lesson-68',
    desc: '縦のはしご UI で犬→哺乳類→動物→生物を上下移動。抽象度メーターと連動して、共通点が増えていく感覚',
  },
  {
    slug: 'pyramid-principle',
    number: 'v2-4',
    title: 'ピラミッド原則',
    lessonRef: 'lesson-23',
    desc: '結論を頂点に、主張・根拠・事実が下から積み上がるアニメ。各段タップで詳細スライドオーバー',
  },
  {
    slug: 'bayes-update',
    number: 'v2-5',
    title: 'ベイズ更新',
    lessonRef: '統計・確率コース',
    desc: '事前確率バーに証拠カードを落とすと事後確率に動く。複数証拠で連続更新できる確率の感覚',
  },
  {
    slug: 'systems-feedback-loop',
    number: 'v2-6',
    title: 'システム思考フィードバックループ',
    lessonRef: 'systems-03',
    desc: '円環矢印で「在庫↑→価格↓→需要↑→在庫↓」が循環するアニメ。増強ループ／均衡ループの色分け',
  },
]
