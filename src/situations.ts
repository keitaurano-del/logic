import { getLocale } from './i18n'

export type Framework = 'why-so' | 'mece' | 'pyramid' | 'logic-tree' | 'philosophy'

export type SituationCategory = 'business' | 'philosophy'
export type Difficulty = 'beginner' | 'intermediate' | 'advanced'

export type TurnScript = {
  partnerLine: string       // AIパートナーのセリフ
  choices: string[]         // ユーザーの選択肢
}

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
  /** ターンスクリプト（定義済みの場合はAPIを使わない） */
  script?: TurnScript[]
}

// ─────────────────────────────────────────────
// ハードコードスクリプト（APIコールなし）
// ターン数 = script.length（最大5ターン）
// ─────────────────────────────────────────────

const SCRIPT_WHY_SO_REPORT: TurnScript[] = [
  {
    partnerLine: 'David だ。今忙しいから3分でまとめてくれ。プロジェクトの状況はどうなってる？',
    choices: [
      '結論からお伝えします。今月末のリリースは予定通り完了できる見込みです。',
      'えっと、いくつか課題があって、その一つが……',
      '先週から対応を進めていまして、現在の進捗は70%です。',
    ],
  },
  {
    partnerLine: 'で、根拠は？なぜそう言い切れる？',
    choices: [
      '残タスクは3件、全て来週中に完了予定で、バッファも2日確保しています。',
      '感覚的にはいけると思っています。',
      'チームメンバーが頑張っているので大丈夫だと思います。',
    ],
  },
  {
    partnerLine: 'リスクはないのか。何かあったときの対策は？',
    choices: [
      'テスト工程の遅延リスクが1件あります。その場合は機能を一部スコープアウトして対応します。',
      '特にリスクはないと思います。',
      'リスクはありますが、何とかなると思います。',
    ],
  },
  {
    partnerLine: 'わかった。それで、私に何を判断してほしいんだ？',
    choices: [
      'スコープアウトの場合、最終判断をいただきたいです。明日14時に5分だけお時間いただけますか？',
      '特に判断は不要です。報告だけです。',
      'どうすればいいか教えていただけますか？',
    ],
  },
  {
    partnerLine: 'わかった。明日14時に5分取る。それだけ言えれば十分だよ。',
    choices: [
      'ありがとうございます。明日の14時に改めてご報告します。',
      'すいません、他にも共有したいことがあって……',
      'ありがとうございます！では今から詳細をお伝えします！',
    ],
  },
]

const SCRIPT_MECE_MEETING: TurnScript[] = [
  {
    partnerLine: '（営業）うちの部門はとにかくリード数が少ないのが問題です！マーケに何とかしてもらわないと。\n（マーケ）いや、リード数は十分出してますよ。営業の追客が遅いんでしょう。\nファシリテーターとして論点を整理してください。',
    choices: [
      '論点を整理します。「なぜ受注が増えないか」を（1）リード数、（2）商談化率、（3）クロージング率の3軸で分けましょう。まずデータを確認しましょうか？',
      '営業さんの言う通り、マーケの問題が大きいと思います。',
      'とりあえず全員の意見を聞いてみましょう。どなたから？',
    ],
  },
  {
    partnerLine: '（営業）確かに数字で見ると商談化率が業界平均より低いですね。でもそれはマーケのリード品質が低いからでは？\nこの重複している論点を整理してください。',
    choices: [
      '「リード品質」は（1）マーケの届け方と（2）営業の初期接触、両方に原因が分かれます。一方を責めても解決しません。まず現状の数値を揃えませんか？',
      '営業さん、少し言い過ぎでは？マーケさんも悪意はないはずです。',
      '議論が白熱してきたので少し休憩しましょうか。',
    ],
  },
  {
    partnerLine: '（全員）ではどこから手をつければいいですか？論点が多すぎて……',
    choices: [
      '影響度×改善速度でマッピングしましょう。まず「商談化率の向上」が最も数字に直結します。そこに絞りませんか？',
      '全部一気にやれば早いと思います。',
      'もう少し話し合ってから決めましょう。時間はまだあります。',
    ],
  },
  {
    partnerLine: '（営業）商談化率に絞るとして、具体的な施策は何ですか？MECE的に出してほしいです。',
    choices: [
      '施策を「スピード」「トーク品質」「情報共有」の3軸で出しましょう。例えば：スピード→即日コール義務化、品質→スクリプト見直し、情報共有→Salesforce入力徹底です。',
      '営業さんが考えてみてください。現場の方が詳しいはずです。',
      'まずブレストで全部出してから整理しましょう。',
    ],
  },
  {
    partnerLine: '（全員）わかりました。ではそれぞれ担当を決めましょう。まとめてもらえますか？',
    choices: [
      '決定事項：商談化率改善に集中。施策3件のオーナーを今決めます。スピード→営業リーダー、品質→マーケ＆営業合同、入力→営業マネージャー。来週月曜に進捗共有しましょう。',
      'では各自で考えてきてください。',
      'もう少し議論が必要な気がします。次回また話し合いましょう。',
    ],
  },
]

const SCRIPT_PYRAMID_CLIENT: TurnScript[] = [
  {
    partnerLine: '今日の提案、要点を聞かせてください。何を提案したいのですか？',
    choices: [
      '結論から申し上げます。御社の営業生産性を3ヶ月で20%向上させる改善案をご提案します。根拠は3点あります。',
      '御社の課題について詳しく調査しましたので、まず背景から説明させてください。',
      'よろしくお願いします。本日は様々な施策をご提案したいと思います。',
    ],
  },
  {
    partnerLine: '20%向上、という根拠は何ですか？なぜその数字なのか。',
    choices: [
      '3つの根拠があります。①同業他社での実績（平均22%改善）、②御社のボトルネック分析（3工程で40%の時間ロス）、③改善施策のROI試算です。資料の2ページをご覧ください。',
      '業界の平均的な数字を参考にしています。',
      '20%は保守的な見積もりで、実際はそれ以上になると思います。',
    ],
  },
  {
    partnerLine: '③ROI試算、見せてもらいましたが、前提が楽観的ではないですか。',
    choices: [
      'ご指摘ありがとうございます。前提は3パターン用意しています。保守案でも12%改善、コスト回収は8ヶ月です。詳細は別紙をご確認ください。',
      '前提は標準的なものを使っています。問題ないはずです。',
      '確かに楽観的かもしれません。再計算します。',
    ],
  },
  {
    partnerLine: '競合他社もよく似た提案をしてきます。差別化ポイントは何ですか？',
    choices: [
      '3点が差別化要因です。①業界特化のテンプレート（実装3週間短縮）、②社内トレーナー育成込み（内製化で追加コストゼロ）、③1年間の成果保証です。',
      '私たちの会社は経験が豊富で、信頼性が高いです。',
      '価格面で競争力があります。',
    ],
  },
  {
    partnerLine: 'わかりました。次のステップを提案してください。',
    choices: [
      '2週間以内に3点をお願いします。①社内ステークホルダーへの承認確認、②パイロット部門の選定、③キックオフ日程の確定。来週火曜に30分いただけますか？',
      '御社でご検討いただき、ご連絡をお待ちしています。',
      'まず契約書を送ります。ご確認ください。',
    ],
  },
]

const SCRIPT_LOGIC_TREE_SUB: TurnScript[] = [
  {
    partnerLine: '先輩、「売上が伸びない」って言われたんですけど、どこから手をつければいいですか？漠然としていて……',
    choices: [
      'まずWhyツリーで原因を分解しよう。売上＝客数×単価×購買頻度、この3つのどれが落ちてる？データを見てみようか。',
      'とにかく行動することが大事。まず電話をかけまくろう。',
      '難しい問題だね。上司に聞いてみたら？',
    ],
  },
  {
    partnerLine: 'データを見たら、客数は変わらないけど単価が3ヶ月前より15%落ちていました。',
    choices: [
      '単価が落ちた原因を分解しよう。①値引き要請が増えた、②高単価商品の比率が下がった、③競合に取られた、どれが当てはまりそう？',
      '単価を上げればいいんじゃないの？値上げを検討しよう。',
      'そうか、じゃあ客数を増やす方向で考えよう。',
    ],
  },
  {
    partnerLine: '確認したら、値引き要請が増えているみたいです。でも断り方がわからなくて……',
    choices: [
      'Howツリーで考えよう。値引き要請への対応策は：①価値を再説明する、②代替案を提示する（数量増で単価据え置き等）、③上長に同席してもらう。まずどれが使えそう？',
      '値引きは断れないよ。お客様は大事にしないと。',
      '値引きに応じてでも売上を維持するのが先決では？',
    ],
  },
  {
    partnerLine: '①の価値再説明、やってみたいです。具体的にどうすればいいですか？',
    choices: [
      '3ステップで整理しよう。（1）競合と比較した数値的差別点を1枚にまとめる、（2）既存顧客の導入効果を事例化する、（3）商談前にこの資料を送る。来週月曜までに（1）を作れそう？',
      '感覚で話せるよ。経験を積めば自然に伝わるようになる。',
      '上司の成功事例を真似すればいいと思う。',
    ],
  },
  {
    partnerLine: 'わかりました！やってみます。ありがとうございます。全体を振り返ると何が大事でしたか？',
    choices: [
      '大事なのは「問題を構造化してから動く」こと。今日やったのは：①売上を3分解→②単価の問題特定→③原因の深掘り→④具体的アクション、というWhyとHowの繰り返しだよ。',
      '行動力が大事！考えすぎず動こう。',
      '経験が全て。とにかくやってみることだよ。',
    ],
  },
]

const SCRIPT_SOCRATES: TurnScript[] = [
  {
    partnerLine: '友よ、問わせてくれ。「勇気」とは何か、君は答えられるか？',
    choices: [
      '勇気とは、恐怖に直面しても前に進む意志のことだと思います。',
      '勇気とは、強い心を持つことです。',
      '勇気とは、危険を顧みずに行動することではないでしょうか。',
    ],
  },
  {
    partnerLine: 'なるほど。しかし「恐怖に直面しても前に進む」とすれば、戦場で逃げる兵士は勇気がないのか？しかし時に撤退こそが賢明ではないか？',
    choices: [
      '確かに。勇気は「何が正しいかを知った上で、それに従う意志」ではないでしょうか。',
      'そうですね、逃げることも勇気の一種かもしれません。',
      'やはり勇気は恐怖への克服だと思います。撤退は別の話です。',
    ],
  },
  {
    partnerLine: '「何が正しいかを知った上で」というのは面白い。では知識なき勇気は勇気ではなく、無謀に過ぎないか？',
    choices: [
      'おっしゃる通りです。勇気は知識と不可分なのかもしれません。「何が正しいか」を知ることなしに真の勇気はあり得ない。',
      '知識がなくても、勇敢に行動できれば勇気だと思います。',
      '勇気と無謀は確かに違いますが、知識が全てではないはずです。',
    ],
  },
  {
    partnerLine: 'するとこうなる。徳（正しいこと）を知ることが勇気の本質だとすれば、勇気は「善とは何か」という問いと切り離せない。君はこの結論に同意するか？',
    choices: [
      '同意します。勇気は単なる感情や行動ではなく、善を知り、それに従う実践的知恵だと理解しました。',
      '難しいですが、勇気は善とは独立した概念だと思います。',
      '部分的には同意しますが、知識より意志の方が重要ではないでしょうか。',
    ],
  },
  {
    partnerLine: '見事だ。君はソクラテスの問答に最後まで向き合った。問いを通じて、君自身が定義を洗練させた。これが対話の目的だ。',
    choices: [
      '対話を通じて自分の思考が深まりました。問いに答えることで、自分が何を知っていて何を知らないかが見えてきました。',
      'まだよくわかりません。もっと考えてみます。',
      '先生のおかげで理解できました。ありがとうございます。',
    ],
  },
]

const SCRIPT_NIETZSCHE: TurnScript[] = [
  {
    partnerLine: 'おまえが今まで信じてきた「良いこと」の基準は、誰が決めたのか？社会か？親か？それとも「みんながそう言っている」からか？',
    choices: [
      '正直に言えば、多くは周囲の価値観を受け入れてきたと思います。自分で選んだかどうか疑問です。',
      '自分の価値観は自分で考えて作ってきました。',
      '社会のルールに従うことが正しいと思っています。',
    ],
  },
  {
    partnerLine: 'そうだ。大半の「道徳」は弱者が強者を縛るために作った道具に過ぎない。それを「善」と思い込まされているだけだ。おまえ自身の意志はどこにある？',
    choices: [
      '私が本当に大切にしていること……それは他者との誠実な関係と、自分の仕事への誇りです。これは外から与えられたものではなく、経験から選んできたと思います。',
      'ニーチェさんの言う通り、私は弱者の道徳に縛られていました。',
      '社会のルールを守ることが、やはり大切だと思います。',
    ],
  },
  {
    partnerLine: '「誠実さ」「誇り」……面白い。しかしそれはおまえが創造したものか？それとも「誠実でなければならない」という義務感から来ているのか？',
    choices: [
      '確かに区別が難しい。でも裏切ることで感じる後悔は、義務感ではなく自分の価値観から来ていると思います。それは私が選んだものです。',
      '義務感かもしれません。でも義務でも大切なことは変わりません。',
      'すべては義務から来ているかもしれません。',
    ],
  },
  {
    partnerLine: 'ならば問う。その価値観に従って生きることで、おまえは成長しているか？それとも安定という名の停滞をしているか？',
    choices: [
      '厳しい問いです。誠実さを守ることで成長もしてきたけれど、それが時に挑戦を避ける言い訳になっていた部分もあります。力への意志、というのはその先を目指すことかもしれません。',
      '成長しています。毎日努力しています。',
      '安定を求めることの何が悪いのですか？',
    ],
  },
  {
    partnerLine: 'そうだ。おまえは今、自分で考えた。「与えられた善」ではなく「創造した価値」に向かって。それが超人への第一歩だ。',
    choices: [
      'この対話で、自分の価値観を問い直すことができました。従うのではなく、自ら創造するという視点を忘れないようにします。',
      'ニーチェの考え方は難しいですが、考えるきっかけをもらいました。',
      'まだ理解しきれていませんが、もっと考えてみます。',
    ],
  },
]

const SITUATIONS_JA: Situation[] = [
  {
    id: 'why-so-report',
    framework: 'why-so',
    frameworkLabel: 'Why So / So What',
    title: '上司への報告',
    emoji: '📊',
    category: 'business' as SituationCategory,
    difficulty: 'beginner' as Difficulty,
    partnerName: 'David Chen',
    partnerRole: 'Business Unit Director',
    partnerPersonality: '結論ファースト派・忙しく時間がない・曖昧な説明には「で、結局何?」と詰める',
    partnerInterests: '数字・意思決定に必要な情報・So What(だから何?)',
    partnerConcerns: '時間の浪費・根拠の薄い提案',
    goal: '3分以内に状況を伝え、意思決定を引き出す',
    context: 'あなたは担当プロジェクトの進捗について部長に報告する場面。部長はWhy So(なぜそう言える?)とSo What(だから何?)で深掘りしてくる。結論から話し、根拠を示すことを意識しよう。',
    premium: false,
    script: SCRIPT_WHY_SO_REPORT,
  },
  {
    id: 'mece-meeting',
    framework: 'mece',
    frameworkLabel: 'MECE',
    title: '会議のファシリテーション',
    emoji: '🗂️',
    category: 'business' as SituationCategory,
    difficulty: 'intermediate' as Difficulty,
    partnerName: 'Meeting Team',
    partnerRole: 'Cross-functional Team',
    partnerPersonality: '議論が脱線しがち・抜け漏れに気づかない・重複した論点を繰り返す',
    partnerInterests: '自部門の都合・個別の事例',
    partnerConcerns: '会議が長引くこと・決まらないこと',
    goal: '論点をMECEに整理して合意形成する',
    context: 'あなたは部門横断会議のファシリテーター。参加者の発言を「漏れなくダブりなく」整理し、論点を構造化する必要がある。MECEを意識して切り口を提示しよう。',
    premium: true,
    script: SCRIPT_MECE_MEETING,
  },
  {
    id: 'pyramid-client',
    framework: 'pyramid',
    frameworkLabel: 'ピラミッド原則',
    title: 'クライアント説明',
    emoji: '💼',
    category: 'business' as SituationCategory,
    difficulty: 'intermediate' as Difficulty,
    partnerName: 'Mr. Carter',
    partnerRole: 'Client Executive',
    partnerPersonality: '論理の飛躍に厳しい・根拠を執拗に求める・経験豊富で見抜く力が強い',
    partnerInterests: '結論の妥当性・根拠の質・投資対効果',
    partnerConcerns: '主張の根拠が弱いこと・話が飛ぶこと',
    goal: 'ピラミッド原則(結論→理由→根拠)で提案を伝え、納得を得る',
    context: 'あなたはクライアントに重要な提案を行う場面。結論を頂点に、3つの理由とその根拠で支える「ピラミッド構造」で話すこと。論理の飛躍は即座に指摘される。',
    premium: true,
    script: SCRIPT_PYRAMID_CLIENT,
  },
  {
    id: 'logic-tree-sub',
    framework: 'logic-tree',
    frameworkLabel: 'ロジックツリー',
    title: '部下への指示',
    emoji: '🌳',
    category: 'business' as SituationCategory,
    difficulty: 'intermediate' as Difficulty,
    partnerName: 'Alex Kim',
    partnerRole: 'Junior Team Member',
    partnerPersonality: '指示待ち・問題を抽象的にしか捉えられない・「どこから手をつければ?」と聞いてくる',
    partnerInterests: '具体的なタスク・進め方・優先順位',
    partnerConcerns: '何から手をつければいいか分からないこと',
    goal: '問題をロジックツリーで分解し、具体的なアクションに落とし込ませる',
    context: 'あなたは後輩に「売上が伸びない」という問題の解決を指示する場面。Whyツリー(なぜ?)とHowツリー(どうやって?)を使って後輩と一緒に問題を分解し、具体的なアクションへ導こう。',
    premium: true,
    script: SCRIPT_LOGIC_TREE_SUB,
  },
  {
    id: 'socrates-dialog',
    framework: 'philosophy',
    frameworkLabel: '問答法',
    title: 'ソクラテスとの対話',
    emoji: '',
    category: 'philosophy' as SituationCategory,
    difficulty: 'intermediate' as Difficulty,
    partnerName: 'ソクラテス',
    partnerRole: '古代アテナイの哲学者',
    partnerPersonality: '問いただけで答えない・相手の主張に「では反例は？」と必ず問う・「私は何も知らない」と言いながら深める',
    partnerInterests: '定義の正確さ・前提の検証・反例の有無',
    partnerConcerns: '曖昧な定義・要証のない主張',
    goal: '「勇気」とは何かを問答法で定義し、ソクラテスの反論を乗り越える',
    context: 'ソクラテスがあなたに問う。「勇気とは何か？」。あなたは自分なりの定義を答えるが、ソクラテスは必ず「ではこういう場合は？」と反例を提示し続ける。問答を繰り返す中で、より正確な定義に辿り着くことを目指せ。',
    premium: true,
    script: SCRIPT_SOCRATES,
  },
  {
    id: 'descartes-doubt',
    framework: 'philosophy',
    frameworkLabel: '方法的懐疑',
    title: 'デカルトとの哲学的対話',
    emoji: '',
    category: 'philosophy' as SituationCategory,
    difficulty: 'advanced' as Difficulty,
    partnerName: 'デカルト',
    partnerRole: '近代哲学の父',
    partnerPersonality: 'すべてを疑う・「それは悪魔が見せた幻覚では？」と問う・確実なるものだけを認める',
    partnerInterests: '確実性の基盤・疑う余地のない命題・誰も否定できない事実',
    partnerConcerns: '疑われない主張・証明なき信念',
    goal: '「我思う、ゆえに我あり」の出発点から、少なくとも1つの確実な命題を積み上げる',
    context: 'デカルトが問いかける。「どんな信念も疑うことができる。それでも疑いきれない一つの事実は何か？」。あなたは知覚・記憶・感覚・信念を一つずつ疑い、疑いきれない確実な事実を導き出せ。',
    premium: true,
    script: undefined, // デカルト・ニーチェはAPIを引き続き使用
  },
  {
    id: 'nietzsche-values',
    framework: 'philosophy',
    frameworkLabel: '価値の転化',
    title: 'ニーチェとの対話',
    emoji: '',
    category: 'philosophy' as SituationCategory,
    difficulty: 'advanced' as Difficulty,
    partnerName: 'ニーチェ',
    partnerRole: 'ドイツの哲学者',
    partnerPersonality: '常識を鋭く射抜く・「それは弱者の道徳だ」と切り捨てる・「そこにおまえの意志はあるか？」と追い込む',
    partnerInterests: '自分の意志・創造性・ニヒリズムの克服',
    partnerConcerns: '「みんながそう言ってる」系の思考停止',
    goal: '自分独自の価値観を述べ、ニーチェの「力への意志」に対抗できる',
    context: 'ニーチェが問いかける。「おまえが今まで信じてきた『良いこと』の基準は、誰が決めたのか？」自分が大切にしてきた価値観を対話の中で洗い出し、「それは自分が選んだ価値か？内面化した常識か？」を問い直せ。',
    premium: true,
    script: SCRIPT_NIETZSCHE,
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
    context: 'You are reporting on the progress of your project. The director will dig in with Why So? (why is that true?) and So What? (so what should we do?). Lead with the conclusion and back it with evidence.',
    premium: false,
    script: SCRIPT_WHY_SO_REPORT, // 日本語スクリプト共用（英語版は後続で拡張可能）
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
    context: 'You are facilitating a cross-functional meeting. You need to organize the participants\' input "with no gaps and no overlaps" and structure the discussion. Keep MECE in mind when proposing how to slice the problem.',
    premium: true,
    script: SCRIPT_MECE_MEETING,
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
    context: 'You are presenting an important proposal to a client. Lead with the conclusion at the top of the pyramid, supported by 3 reasons and their evidence. Logical leaps will be called out immediately.',
    premium: true,
    script: SCRIPT_PYRAMID_CLIENT,
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
    context: 'You are giving your junior teammate the problem "sales aren\'t growing." Use Why trees (why?) and How trees (how?) to decompose the problem together with them and guide them toward concrete actions.',
    premium: true,
    script: SCRIPT_LOGIC_TREE_SUB,
  },
]

export function getSituations(): Situation[] {
  return getLocale() === 'en' ? SITUATIONS_EN : SITUATIONS_JA
}

export const SITUATIONS: Situation[] = SITUATIONS_JA

export function getSituation(id: string): Situation | undefined {
  return getSituations().find((s) => s.id === id)
}

export function buildSetup(s: Situation) {
  return {
    template: { mode: 'conversation', title: s.title },
    format: 'online',
    category: s.category,
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
