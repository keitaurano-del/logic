export type SampleVariant = {
  slug: string
  title: string
  blurb: string
}

export type SampleCategory = {
  id: string
  number: string
  title: string
  desc: string
  variants: SampleVariant[]
}

export const categories: SampleCategory[] = [
  {
    id: 'tree',
    number: '01',
    title: '構造ツリー動的レンダリング',
    desc: 'ロジックツリー・3C・Why-Whyを「展開アニメ」で見せて、構造が育っていく実感を作る案。',
    variants: [
      { slug: 'profit', title: '1-A 利益分解ツリー', blurb: '売上−コストを段階展開' },
      { slug: '3c', title: '1-B 3Cフレーム', blurb: '中央問いから放射状に展開' },
      { slug: 'whywhy', title: '1-C Why-Why分析', blurb: 'なぜを下方向に5回繰り返す' },
    ],
  },
  {
    id: 'whiteboard',
    number: '02',
    title: '白板風 explain',
    desc: '解説ステップを「先生がノートに書き起こす」演出に。テキストの重みづけが視覚で伝わる案。',
    variants: [
      { slug: 'pen', title: '2-A ペン書きアニメ', blurb: 'SVGでタイトルを描く' },
      { slug: 'fade', title: '2-B 段階フェードイン', blurb: '箇条書きが滑り込む' },
    ],
  },
  {
    id: 'chat',
    number: '03',
    title: '吹き出し対話モード',
    desc: 'ケース面接・1on1のフェーズをLINE風チャットに分解。会話のテンポで学べる案。',
    variants: [
      { slug: 'interview', title: '3-A 面接官との対話', blurb: '左右に分かれた吹き出し' },
      { slug: '1on1', title: '3-B 上司との1on1', blurb: '表情アイコン付き上司との対話' },
    ],
  },
  {
    id: 'dnd',
    number: '04',
    title: 'ドラッグ&ドロップ分解',
    desc: '項目を自分の手で振り分ける体験で、MECE・原因階層を体に染み込ませる案。',
    variants: [
      { slug: 'mece', title: '4-A MECE分類', blurb: '売上 / コストに振り分け' },
      { slug: 'whywhy-build', title: '4-B Why-Why組立', blurb: '原因カードで階層を組む' },
    ],
  },
  {
    id: 'fermi',
    number: '05',
    title: 'フェルミ推定電卓',
    desc: 'スライダー・入力に応じて推定値が動くインタラクティブ電卓案。',
    variants: [
      { slug: 'salons', title: '5-A 日本の美容院数', blurb: '人口→世帯→…を順に入力' },
      { slug: 'cafe', title: '5-B カフェ日次売上', blurb: '席×回転率×単価をスライダー' },
    ],
  },
  {
    id: 'icon',
    number: '06',
    title: 'アイコン+ハイライト枠',
    desc: '既存のテキスト中心UIを最小工数で「読みやすい教科書」化する案。',
    variants: [
      { slug: 'left', title: '6-A 左上アイコン+カラー枠', blurb: '太い左ボーダー+アイコン' },
      { slug: 'header', title: '6-B ヘッダーアイコン+背景パターン', blurb: '水玉背景+大アイコン' },
      { slug: 'chip', title: '6-C チップ式タグ+引用枠', blurb: 'タグ+縦バー引用' },
    ],
  },
]
