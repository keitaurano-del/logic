export type ScenarioStep = {
  step: number
  question: string
  hint: string
  choices?: string[]
}

export type CoffeeBreakScenario = {
  id: string
  emoji: string
  selectorLabel: string  // "ランチ、また迷ってる" 等
  title: string          // 出口で見せる長文タイトル
  hook: string           // 入口の共感コピー
  framework: string      // さりげなく裏で使われるフレームワーク名
  steps: ScenarioStep[]
  closing: string        // 出口の余韻コピー
  shareText: string
}

export const COFFEE_BREAK_SCENARIOS: CoffeeBreakScenario[] = [
  {
    id: 'lunch-dilemma',
    emoji: '🍱',
    selectorLabel: 'ランチ、また迷ってる',
    title: 'ランチを30秒で決めたら、なぜか午後の仕事もはかどった話',
    hook: '「なんでもいい」って言いつつ、結局15分迷ってる。あれ、昨日の自分だ。',
    framework: '条件を3つに絞るだけ(MECE の入口)',
    steps: [
      {
        step: 1,
        question: 'まず聞きたい。今のあなたの「お腹の空き具合」は?',
        hint: '体感は意思決定の最重要パラメータ。「軽め/普通/がっつり」の3択でOK。',
        choices: ['軽めでいい', '普通に食べたい', 'がっつり食べたい'],
      },
      {
        step: 2,
        question: '次に「今日の予算」と「移動できる距離」を3秒で決めてください。',
        hint: '予算と距離は他の条件を全部消してくれる強力な絞り込み軸。迷う前に外堀を埋める。',
      },
      {
        step: 3,
        question: '残った選択肢の中で「直感で行きたい順」に並べてみて。1位はどれ?',
        hint: '条件を3つ通した時点で、選択肢は2〜3個に絞られているはず。最後は直感に委ねていい。',
      },
      {
        step: 4,
        question: '決めた。じゃあ、もう振り返らずに歩き出そう。',
        hint: '選んだ後に「やっぱり別の方が...」と考えるのが一番のエネルギー浪費。決めたら走る。',
      },
    ],
    closing: '迷う時間がゼロになると、午後のスタートダッシュが違う。これ、全部「お腹・予算・距離」の3条件を先に決めただけ。',
    shareText: 'ランチを30秒で決める方法を試したら、午後の集中力が変わった。',
  },
  {
    id: 'netflix-choice',
    emoji: '🎬',
    selectorLabel: '今夜何観るか決められない',
    title: 'Netflixで2時間迷うのをやめた夜の話',
    hook: '気づいたら作品紹介を読みながら寝落ちしてた。観たかったのはそれじゃない。',
    framework: '選択肢→条件整理→決定(同じテンプレ、シーン違い)',
    steps: [
      {
        step: 1,
        question: '今夜のあなたの「気分」は次のうちどれに近い?',
        hint: '気分は最強のフィルター。「笑いたい/泣きたい/没入したい/何も考えたくない」から1つ選ぶ。',
        choices: ['笑いたい', '泣きたい', '没入したい', '何も考えたくない'],
      },
      {
        step: 2,
        question: '残り時間は何分?(就寝時刻から逆算)',
        hint: '時間軸を先に引くと「2時間映画」か「30分ドラマ」かが自動で決まる。観る前に閉じ込める。',
      },
      {
        step: 3,
        question: 'その条件に合う作品を、トップ画面の上から3つだけ見て。4つ目は見ない。',
        hint: '無限に比較するのが決断疲れの正体。3つに制限すれば脳が「決められる」モードに切り替わる。',
      },
      {
        step: 4,
        question: '3つの中で、タイトルかサムネで一番気になったものを再生。終わり。',
        hint: '気分・時間・3択。これだけで2時間の迷いがゼロになる。',
      },
    ],
    closing: '観たい気分で観る方が、実は深く楽しめる。迷ってる時間で、もう半分観終わってたかもしれない。',
    shareText: 'Netflixで迷う時間をゼロにする方法、地味に効いた。',
  },
  {
    id: 'friend-consultation',
    emoji: '☕',
    selectorLabel: '友達の相談、うまく答えられなかった',
    title: '友達の相談に「で、何が一番つらいの?」と聞いたら泣かれた話',
    hook: '一生懸命アドバイスしたのに、なんか微妙な空気になった。何がダメだったんだろう。',
    framework: '解決策を出す前に、論点を1つに絞る',
    steps: [
      {
        step: 1,
        question: 'まず聞きたい。友達は「解決策」を求めてた? それとも「聞いてほしい」だけだった?',
        hint: '8割の相談は「聞いてほしい」が本音。アドバイスは早くても3周話を聞いてから。',
        choices: ['たぶん聞いてほしかった', '解決策が欲しそうだった', 'よくわからない'],
      },
      {
        step: 2,
        question: '相談の中で、友達が「一番何度も言ってた言葉」は何だった?',
        hint: '繰り返される言葉が真の論点。「上司が」「お金が」「将来が」— その単語の周りに本音がある。',
      },
      {
        step: 3,
        question: '次に会ったら、こう聞いてみて。「結局、一番つらいのはどの部分?」',
        hint: '相手に論点を1つに絞ってもらう質問。考えながら話すうちに、本人の中で整理が始まる。',
      },
      {
        step: 4,
        question: '答えを聞いたら、解決策を出さずに「それはつらいね」とだけ返してみて。',
        hint: '構造的に聞く=冷たい、ではない。論点を絞った上で共感する方が、何倍も深く届く。',
      },
    ],
    closing: '「役に立てなかった」と思ってた相談が、一言の質問で変わる。聞き方は、優しさのスキルだった。',
    shareText: '友達の相談の聞き方、ちょっと変えるだけで全然違った。',
  },
]

export function getScenario(id: string): CoffeeBreakScenario | undefined {
  return COFFEE_BREAK_SCENARIOS.find((s) => s.id === id)
}
