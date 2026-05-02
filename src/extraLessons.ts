// extraLessons.ts — コース5件化のための追加レッスン（ID 300〜316）
import type { LessonData } from './lessonData'

// ── クリティカルシンキング Course 2 ──────────────────
const criticalBias2: LessonData = {
  id: 300,
  title: '確証バイアスから抜け出す',
  category: 'クリティカルシンキング',
  steps: [
    { type: 'explain', title: '確証バイアスとは何か', content: '人は自分の信念を支持する情報だけを集め、反証する情報を無視しやすい。これを確証バイアスという。意識的に「反証を探す」習慣が批判的思考の核心だ。' },
    { type: 'quiz', question: '確証バイアスを防ぐ最も効果的な方法はどれか？', options: [
      { label: '自分の意見を持たない', correct: false },
      { label: '意図的に反論・反証を探す', correct: true },
      { label: 'データを多く集める', correct: false },
      { label: '専門家の意見だけを参考にする', correct: false },
    ], explanation: '確証バイアスへの対処は「悪魔の代弁者（Devil\'s Advocate）」として意図的に反論を探すこと。データ量より質と多様性が重要。' },
  ],
}

const criticalAnchor: LessonData = {
  id: 301,
  title: 'アンカリング効果に気づく',
  category: 'クリティカルシンキング',
  steps: [
    { type: 'explain', title: 'アンカリング効果とは', content: '最初に提示された数字や情報（アンカー）が、その後の判断に過大な影響を与える認知バイアス。交渉・意思決定の場で特に注意が必要だ。' },
    { type: 'quiz', question: '「定価10万円のところ今なら3万円」という広告。アンカリング効果が働いているのはどの部分か？', options: [
      { label: '「今なら」という限定感', correct: false },
      { label: '「定価10万円」という最初の数字', correct: true },
      { label: '「3万円」という実際の価格', correct: false },
      { label: '割引率（70%オフ）', correct: false },
    ], explanation: '「定価10万円」というアンカーが設定されることで、3万円が「お得」に感じられる。実際の価値判断より最初の数字が基準になってしまう。' },
  ],
}

const criticalFraming: LessonData = {
  id: 302,
  title: 'フレーミング効果を見破る',
  category: 'クリティカルシンキング',
  steps: [
    { type: 'explain', title: 'フレーミング効果とは', content: '同じ内容でも「表現の仕方（フレーム）」によって判断が変わる現象。「90%の生存率」と「10%の死亡率」は同じ事実だが、受ける印象は大きく異なる。' },
    { type: 'quiz', question: 'フレーミング効果に惑わされないための対策として最も有効なものはどれか？', options: [
      { label: '数字より直感を信じる', correct: false },
      { label: '表現を言い換えて同じ内容か確認する', correct: true },
      { label: '発信者の意図を決めつける', correct: false },
      { label: 'ポジティブな表現の方を選ぶ', correct: false },
    ], explanation: '「生存率90%」を「死亡率10%」と言い換えてみる。同じ事実なら判断も変わらないはず。表現を変換して本質を確認する習慣が重要。' },
  ],
}

const criticalSunk: LessonData = {
  id: 303,
  title: 'サンクコストの罠から脱出する',
  category: 'クリティカルシンキング',
  steps: [
    { type: 'explain', title: 'サンクコストとは', content: '過去に投入した時間・お金・労力（回収できないコスト）に引きずられて、合理的でない判断を続けてしまうバイアス。「もったいない」という感情が正しい判断を妨げる。' },
    { type: 'quiz', question: '2年かけて開発した新機能が市場調査でニーズがないと判明した。サンクコストの罠に陥らない判断はどれか？', options: [
      { label: 'せっかく2年かけたのでリリースする', correct: false },
      { label: '過去のコストは無視し、今後の価値だけで判断する', correct: true },
      { label: 'さらに半年かけて改良すれば使えるはずと考える', correct: false },
      { label: 'チームの士気のためにリリースする', correct: false },
    ], explanation: '過去のコストはどう決断しても戻らない。重要なのは「これから」の価値判断のみ。感情的なもったいなさより合理的な将来判断を優先する。' },
  ],
}

// ── 仮説思考 Course 1 追加 ─────────────────────────────
const hypothesisAbduction: LessonData = {
  id: 304,
  title: 'アブダクションで仮説を飛躍させる',
  category: '仮説思考',
  steps: [
    { type: 'explain', title: 'アブダクション（仮説的推論）とは', content: '演繹でも帰納でもなく、「最も合理的な説明」を推論する思考法。限られた情報から大胆な仮説を立て、それを検証するアプローチ。コンサルタントや医師が日常的に使う。' },
    { type: 'quiz', question: '売上が突然20%減少した。アブダクションのアプローチとして最も適切なものはどれか？', options: [
      { label: '全データを収集してから原因を考える', correct: false },
      { label: '「競合の新商品が原因では？」と仮説を立てすぐ検証する', correct: true },
      { label: '過去の成功パターンを繰り返す', correct: false },
      { label: '上司に報告して指示を待つ', correct: false },
    ], explanation: 'アブダクションは「データが揃ってから考える」のではなく、「仮説を先に立てて検証する」。限られた情報でも最も合理的な説明に飛躍するのが特徴。' },
  ],
}

// ── 課題設定 Course 1 追加 ─────────────────────────────
const problemDoubleLoop: LessonData = {
  id: 305,
  title: '「解き方」より「問い方」を変える',
  category: '課題設定',
  steps: [
    { type: 'explain', title: 'ダブルループ学習とは', content: '問題の「解き方」を改善するシングルループと、問題の「前提・問い自体」を変えるダブルループ。本質的な課題解決はダブルループから生まれる。' },
    { type: 'quiz', question: '「営業の訪問件数を増やせば売上が上がる」という前提で施策を打ち続けているが改善しない。ダブルループの問い直しとして最も適切なのはどれか？', options: [
      { label: '訪問件数をさらに増やす', correct: false },
      { label: '訪問効率を上げるツールを導入する', correct: false },
      { label: '「訪問件数と売上の相関」という前提自体を疑う', correct: true },
      { label: '営業担当を交代させる', correct: false },
    ], explanation: '施策の改善（シングルループ）ではなく、「訪問件数＝売上」という前提自体を問い直すのがダブルループ。前提を疑うことで全く別の解が見えてくる。' },
  ],
}

const problemReframe: LessonData = {
  id: 306,
  title: '問いをリフレームして突破口を開く',
  category: '課題設定',
  steps: [
    { type: 'explain', title: '問いのリフレームとは', content: '同じ状況でも「問い方」を変えると解決策が変わる。「なぜ電話の保留時間が長いのか？」より「顧客はなぜ電話する必要があるのか？」の方が根本解決に近い。' },
    { type: 'quiz', question: '「なぜチームの残業が多いのか？」をリフレームした問いとして最も有効なものはどれか？', options: [
      { label: '「どうすれば残業を減らせるか？」', correct: false },
      { label: '「誰が一番残業しているか？」', correct: false },
      { label: '「残業なしで同じ成果を出すには何を捨てるべきか？」', correct: true },
      { label: '「残業代のコストはいくらか？」', correct: false },
    ], explanation: 'リフレームは問いの前提を変える。「残業を減らす方法」から「残業なしで成果を出すために何を変えるか」へ。問いが変わると解決策の選択肢が広がる。' },
  ],
}

// ── デザインシンキング Course 1 追加 ───────────────────
const designHMW: LessonData = {
  id: 307,
  title: '「どうすれば〜できるか？」で問いを立てる',
  category: 'デザインシンキング',
  steps: [
    { type: 'explain', title: 'HMW（How Might We）とは', content: '「どうすれば〜できるか？（How Might We）」という問いの型で、課題を解決可能な問いに変換する。「〜できない」という制約表現を、可能性を広げる問いに変える。' },
    { type: 'quiz', question: '「ユーザーがアプリを継続しない」という課題をHMWで問い直した場合、最も適切なものはどれか？', options: [
      { label: '「なぜユーザーは継続しないのか？」', correct: false },
      { label: '「どうすればユーザーが毎日使いたくなるか？」', correct: true },
      { label: '「継続率を30%上げるには？」', correct: false },
      { label: '「競合アプリの継続率はどのくらいか？」', correct: false },
    ], explanation: 'HMWは問いをポジティブで行動可能な形に変換する。「なぜ〜しないか」（原因追求）ではなく「どうすれば〜できるか」（可能性探索）が創造的解決策を引き出す。' },
  ],
}

const designTest: LessonData = {
  id: 308,
  title: '素早く試して、速く学ぶ',
  category: 'デザインシンキング',
  steps: [
    { type: 'explain', title: 'テストと反復（Iterate）の重要性', content: 'デザインシンキングの核心は「完璧なものを作ってから試す」ではなく「粗くても試してから磨く」こと。失敗は学習。低コストで素早く試すほど、本質的な答えに早く近づく。' },
    { type: 'quiz', question: '新機能のアイデアを検証する最もデザインシンキング的なアプローチはどれか？', options: [
      { label: '完全に開発してからユーザーテストする', correct: false },
      { label: '紙とペンで画面を描いてユーザーに見せる', correct: true },
      { label: 'アンケートでニーズを確認する', correct: false },
      { label: '社内で評判が良ければリリースする', correct: false },
    ], explanation: '紙プロトタイプは数時間で作れ、ユーザーの反応をすぐ確認できる。低コストで試して学ぶ→改善する反復サイクルがデザインシンキングの本質。' },
  ],
}

// ── ラテラルシンキング Course 1 追加 ───────────────────
const lateralPMI: LessonData = {
  id: 309,
  title: 'PMI法で視点を意図的に広げる',
  category: 'ラテラルシンキング',
  steps: [
    { type: 'explain', title: 'PMI法とは', content: 'Plus（良い点）・Minus（悪い点）・Interesting（面白い点）の3視点でアイデアを評価する手法。デボノが提唱。「面白い点」を加えることで、固定的な二項対立を超えた思考が生まれる。' },
    { type: 'quiz', question: '「全社員を週3日テレワークにする」というアイデアにPMI法を適用する。Interesting（面白い点）として最も適切なものはどれか？', options: [
      { label: '通勤コストが減る（コスト削減）', correct: false },
      { label: 'コミュニケーションが減るかもしれない（リスク）', correct: false },
      { label: '地方在住の優秀な人材を採用できる可能性が生まれる', correct: true },
      { label: 'オフィスの電気代が下がる', correct: false },
    ], explanation: 'Interestingは良い・悪いではなく「新しい可能性や気づき」。地方採用という選択肢は、テレワーク化によって初めて現実的になる新たな可能性だ。' },
  ],
}

const lateralRandom: LessonData = {
  id: 310,
  title: 'ランダム入力で発想を飛ばす',
  category: 'ラテラルシンキング',
  steps: [
    { type: 'explain', title: 'ランダム入力法とは', content: '解決しようとしている問題と全く関係のないランダムな単語・画像を強制的に組み合わせる発想法。脳の既存パターンを強制的に壊し、予想外のアイデアを生み出す。' },
    { type: 'quiz', question: '「新しいコーヒーショップのコンセプト」を考える際、ランダム入力「図書館」から生まれそうなアイデアとして最も適切なものはどれか？', options: [
      { label: 'コーヒーの種類を増やす', correct: false },
      { label: '静かに長時間滞在でき、本が読める会員制カフェ', correct: true },
      { label: 'テイクアウト専門にする', correct: false },
      { label: 'SNS映えするデザインにする', correct: false },
    ], explanation: '「図書館」という無関係な入力が「静粛・長時間・知識」という要素を連想させ、会員制の知的空間カフェというコンセプトが生まれる。強制連想がラテラルの核心。' },
  ],
}

// ── アナロジー思考 Course 1 追加 ───────────────────────
const analogyMapping: LessonData = {
  id: 311,
  title: '構造をマッピングして解を借りる',
  category: 'アナロジー思考',
  steps: [
    { type: 'explain', title: '構造マッピングとは', content: 'アナロジーの核心は「表面的な類似」ではなく「構造的な類似」を見つけること。「軍の補給システム」と「サプライチェーン管理」は分野は違っても同じ構造を持つ。構造を明示的にマッピングすることでアナロジーが使える。' },
    { type: 'quiz', question: '「免疫システム（体の防衛機構）」を組織のセキュリティ対策にアナロジーで応用する。最も構造的に対応するものはどれか？', options: [
      { label: '白血球 → 社員全員', correct: false },
      { label: '免疫記憶 → 過去のインシデント記録と対応マニュアル', correct: true },
      { label: '発熱 → サーバーの負荷', correct: false },
      { label: '骨格 → オフィスの建物', correct: false },
    ], explanation: '免疫記憶（一度戦った敵を記憶してより速く対応する機能）は、インシデント対応履歴を元に改善するセキュリティの仕組みと構造的に同じ。表面ではなく機能的役割で対応させる。' },
  ],
}

const analogyCross: LessonData = {
  id: 312,
  title: '異分野の成功パターンを自分の領域に持ち込む',
  category: 'アナロジー思考',
  steps: [
    { type: 'explain', title: '異分野アナロジーの威力', content: '最も強力なアナロジーは「遠い分野」から来る。近い分野は既に参照済みが多い。スポーツ・軍事・生物・建築など、一見無関係な分野の成功パターンを自分の課題に転用することで、競合が思いつかない解が生まれる。' },
    { type: 'quiz', question: 'スタートアップの「ピボット（方向転換）戦略」に最も構造的に近い異分野の概念はどれか？', options: [
      { label: '建築の設計変更', correct: false },
      { label: '生物の適応進化（環境変化に合わせて形質を変える）', correct: true },
      { label: '料理のレシピ改良', correct: false },
      { label: '軍隊の撤退', correct: false },
    ], explanation: '生物の適応進化は「環境変化→特性変更→生存」の構造を持つ。ピボットも「市場変化→ビジネスモデル変更→成長」と同じ構造。適応と変化という本質的な類似が見える。' },
  ],
}

// ── システムシンキング Course 1 追加 ───────────────────
const systemsArchetype: LessonData = {
  id: 313,
  title: 'システム原型で「よくある罠」を見抜く',
  category: 'システムシンキング',
  steps: [
    { type: 'explain', title: 'システム原型とは', content: '組織や社会で繰り返し現れる典型的な構造パターンを「システム原型」という。「成功の限界」「問題のすり替え」「共有地の悲劇」などがある。原型を知ることで、複雑な問題の本質をすばやく見抜ける。' },
    { type: 'quiz', question: '「対症療法を繰り返すことで根本問題が先送りされ続ける」というパターンはどのシステム原型か？', options: [
      { label: '成功の限界', correct: false },
      { label: '問題のすり替え（Fixes that Fail）', correct: true },
      { label: '共有地の悲劇', correct: false },
      { label: '成長と過小投資', correct: false },
    ], explanation: '「問題のすり替え」は、症状を一時的に緩和する対症療法が、根本解決への取り組みを遅らせ問題を長期化させる構造。バグ修正を繰り返しても根本のアーキテクチャを直さない状況などが典型例。' },
  ],
}

const systemsLeverage: LessonData = {
  id: 314,
  title: 'レバレッジポイントを探して変化を起こす',
  category: 'システムシンキング',
  steps: [
    { type: 'explain', title: 'レバレッジポイントとは', content: 'システムの中で「小さな変化が大きな影響を生む」場所をレバレッジポイントという。ドネラ・メドウズが提唱。目標・ルール・情報の流れ・フィードバック構造などが高いレバレッジを持つ。表面的な数値変更より、システムの目的や構造を変えることの方が効果が大きい。' },
    { type: 'quiz', question: '業績不振の組織を変えるためのレバレッジポイントとして最も高い効果が期待できるものはどれか？', options: [
      { label: '全員の給料を10%上げる', correct: false },
      { label: '評価指標（KPI）を売上から顧客満足度に変更する', correct: true },
      { label: '残業禁止ルールを設ける', correct: false },
      { label: 'オフィスレイアウトを変える', correct: false },
    ], explanation: '評価指標の変更は「何が成功か」という組織の情報フローと行動基準を根本から変える。数値や規則より、目標設定と情報の流れを変えることが高いレバレッジポイントになる。' },
  ],
}

// ── クライアントワーク Course 2 追加 ───────────────────
const clientPresentation: LessonData = {
  id: 315,
  title: '30秒で状況を伝えるエレベーターピッチ',
  category: 'クライアントワーク',
  steps: [
    { type: 'explain', title: 'エレベーターピッチとは', content: 'エレベーターで偶然会った重役に30秒で提案を伝える想定の訓練。「課題→解決策→期待効果→次のアクション」を30秒以内に収める。クライアントワークでは「短く、明確に、行動を促す」が基本。' },
    { type: 'quiz', question: 'クライアントの廊下で「最近の調査どう？」と聞かれた。エレベーターピッチとして最も適切な返答はどれか？', options: [
      { label: 'まだまとまっていないので後でメールします', correct: false },
      { label: '競合3社比較で御社のNPSが業界最下位と判明。来週提案書で改善策をお持ちします', correct: true },
      { label: 'データを見てみると色々な傾向があって、まずAという観点からBを検討し……', correct: false },
      { label: '順調に進んでいます、ありがとうございます', correct: false },
    ], explanation: '「発見（NPSが最下位）→示唆（問題あり）→次のアクション（来週提案）」を一文で伝える。クライアントとの偶発的な接触も重要な機会。短く鋭く、次の行動を明示する。' },
  ],
}

// ── ケース面接 Course 1 追加 ───────────────────────────
const caseSynthesis: LessonData = {
  id: 316,
  title: '分析を統合して提言を出す',
  category: 'ケース面接',
  steps: [
    { type: 'explain', title: 'ケース面接の最終ステップ：統合と提言', content: 'ケース面接の評価ポイントは分析力だけでない。「分析結果を統合して明確な提言を出せるか」が最重要。「したがって…すべきです。理由は3点：①②③」という構造で締めくくる力が求められる。' },
    { type: 'quiz', question: '市場参入ケースの最後に「参入すべきか否か」を問われた。最も適切な締め方はどれか？', options: [
      { label: 'メリットとデメリットをバランスよく述べ、最終判断は御社次第と伝える', correct: false },
      { label: '「参入を推奨します。理由は市場規模・競合優位性・実行可能性の3点です」と明言する', correct: true },
      { label: 'さらにデータが必要なため今は判断できないと伝える', correct: false },
      { label: '過去の類似事例を複数紹介して終わる', correct: false },
    ], explanation: 'ケース面接では「曖昧な結論」は最大の減点ポイント。不確実性があっても明確なレコメンデーションを出し、その根拠を構造的に示すことが求められる。' },
  ],
}

export const extraLessonMap: Record<number, LessonData> = {
  300: criticalBias2,
  301: criticalAnchor,
  302: criticalFraming,
  303: criticalSunk,
  304: hypothesisAbduction,
  305: problemDoubleLoop,
  306: problemReframe,
  307: designHMW,
  308: designTest,
  309: lateralPMI,
  310: lateralRandom,
  311: analogyMapping,
  312: analogyCross,
  313: systemsArchetype,
  314: systemsLeverage,
  315: clientPresentation,
  316: caseSynthesis,
}
