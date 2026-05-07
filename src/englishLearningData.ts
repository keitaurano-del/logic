// English learning annotations for lesson content.
// When premium users switch to English locale, lessons show optional
// Japanese translations and phrase-by-phrase explanations. Phrases the
// learner studies are auto-added to their flashcard deck.
//
// Annotations are indexed by lessonId, then by the step index inside
// `lesson.steps`. A lesson without annotations gracefully degrades —
// the translation/phrase buttons simply don't appear.

import { addCards } from './flashcardData'

export type Phrase = {
  en: string
  ja: string
  note?: string
}

export type StepAnnotation = {
  titleJa?: string
  contentJa?: string
  questionJa?: string
  optionsJa?: string[]
  explanationJa?: string
  phrases?: Phrase[]
}

export type LessonAnnotations = {
  steps: StepAnnotation[]
}

// MECE (lesson 20) — full annotation as the flagship example.
const mece: LessonAnnotations = {
  steps: [
    // Step 0: "What is MECE?"
    {
      titleJa: 'MECE（ミーシー）とは？',
      contentJa:
        'MECE（「ミーシー」と発音）は "Mutually Exclusive, Collectively Exhaustive"（モレなく、ダブりなく）の略です。ビジネスで情報を分析・整理する最も基本的なフレームワークです。\n\n■ Mutually Exclusive（重複なし）\nカテゴリー同士が重ならない。同じ項目が複数のバケツに入ることはない。\n\n■ Collectively Exhaustive（漏れなし）\nすべてが網羅されている。抜けや見落としがない。\n\nMECEが大事な理由：\n① 死角を防ぐ → よい意思決定\n② 重複を排除する → 効率的な資源配分\n③ コミュニケーションが明確 → チームの足並みが揃う',
      phrases: [
        { en: 'stands for', ja: '〜の略', note: '略語の元の意味を説明する定型表現。"MECE stands for ..."' },
        { en: 'Mutually Exclusive', ja: '相互に排他的（重複なし）', note: 'mutually = お互いに、exclusive = 排他的' },
        { en: 'Collectively Exhaustive', ja: '網羅的（漏れなし）', note: 'collectively = 全体として、exhaustive = 徹底的・すべて尽くす' },
        { en: 'no overlap between', ja: '〜の間に重複なし' },
        { en: 'blind spots', ja: '死角', note: '気づいていない欠点・見落とし' },
        { en: 'team alignment', ja: 'チームの足並みが揃うこと', note: 'align = 一致させる、整列する' },
      ],
    },
    // Step 1: "Four ways to break things down MECE"
    {
      titleJa: 'MECEに分解する4つの方法',
      contentJa:
        'MECE分解には4つの代表的なパターンがあります。\n\n[1] 要素分解（数式型）\n全体を数式の構成要素に分ける。\n例：売上 = 顧客数 × 平均客単価／利益 = 売上 − コスト\n\n[2] 時系列\n時間の段階で分ける。\n例：購買ジャーニー = 認知 → 興味 → 検討 → 購入 → リピート\n\n[3] 対立概念\n二項対立または近い分類で分ける。\n例：国内／海外、既存／新規、オンライン／オフライン\n\n[4] 既存フレームワーク\n既知のフレームワークで切る。\n例：3C（顧客・競合・自社）、4P（製品・価格・流通・販促）\n\n問題に対して最も明確で、重複の少ない切り口を選ぼう。',
      phrases: [
        { en: 'break things down', ja: '物事を分解する', note: 'break A down または break down A。MECE分解の文脈で頻出' },
        { en: 'component breakdown', ja: '要素分解', note: '数式のように分解する手法' },
        { en: 'time sequence', ja: '時系列' },
        { en: 'opposing concepts', ja: '対立概念' },
        { en: 'established framework', ja: '既存フレームワーク', note: 'establish = 確立する、established = 確立された' },
        { en: 'whichever ... gives', ja: '〜を提供するものはどれでも', note: '関係詞 whichever。"pick whichever pattern gives the clearest cut"' },
      ],
    },
    // Step 2: Quiz "What does Mutually Exclusive mean?"
    {
      questionJa: 'MECEの「Mutually Exclusive（重複なし）」の意味は？',
      optionsJa: [
        '漏れなくすべて網羅されている',
        'カテゴリー同士が重ならない',
        '構造が階層的になっている',
        '時系列順に並んでいる',
      ],
      explanationJa:
        '「Mutually Exclusive」とはカテゴリー同士が重ならないこと。同じ項目が2つのバケツに同時に入ることはありません。「漏れなく網羅」のほうはMECEのもう半分「Collectively Exhaustive」です。',
      phrases: [
        { en: 'half of', ja: '〜の半分・片方', note: '"the Mutually Exclusive half of MECE" = MECEの片方' },
        { en: 'never lives in', ja: '〜には決して存在しない', note: 'live in = （比喩的に）〜に位置する／属する' },
      ],
    },
    // Step 3: Case 1 - sales falling
    {
      titleJa: '【ケース1】なぜ売上が落ちている？— 3C分析をMECEで',
      contentJa:
        '■ 状況設定\nあなたは中堅アパレル会社の戦略アナリスト。売上が3四半期連続で前年比15%減。経営陣に根本原因分析を提示する必要があります。\n\n■ 3CでのMECE分解\n\n[Customer：顧客]\n・20-35歳層の購買行動の変化\n・可処分所得の低下 → 価格意識が高まる\n・ファストファッションブランドへの流出\n・カテゴリ内のEC化進展\n\n[Competitor：競合]\n・大手SPAブランドの積極的な価格戦略\n・SNSマーケティングに強いD2Cブランドの台頭\n・海外ブランドの国内市場参入\n・アプリ・パーソナライゼーションへの大型投資\n\n[Company：自社]\n・競合に比べ商品開発サイクルが遅い\n・店舗立地が顧客の動線とズレている\n・マーケ予算が紙媒体に偏重\n・EC比率が業界平均の半分\n\n■ なぜ機能するか\n3Cは問題を3つの重ならない角度から見ることを強制します。競合だけ、内部だけ、と偏ることがありません。',
      phrases: [
        { en: 'year over year', ja: '前年比（YoY）', note: 'ビジネスで頻出。"sales dropped 15% year over year"' },
        { en: 'three quarters in a row', ja: '3四半期連続で', note: 'in a row = 連続して' },
        { en: 'root-cause analysis', ja: '根本原因分析', note: '問題の本質を探る分析手法' },
        { en: 'shifting purchase behavior', ja: '購買行動の変化', note: 'shift = 変化する、shifting = 変化している' },
        { en: 'disposable income', ja: '可処分所得', note: '使える自由なお金' },
        { en: 'price-conscious', ja: '価格に敏感な', note: '-conscious = 〜を意識した（health-conscious 健康志向 など）' },
        { en: 'over-indexed on', ja: '〜に偏重している', note: 'インデックスが基準より高い → 比重が大きすぎる' },
        { en: 'half of industry average', ja: '業界平均の半分' },
      ],
    },
    // Step 4: Quiz "competitor lowered prices"
    {
      questionJa: '売上減少に3C MECEを当てはめるとき、「競合が値下げしたので顧客が離れた」はどのバケツに入る？',
      optionsJa: ['Customer（顧客）', 'Competitor（競合）', 'Company（自社）', '3つすべて'],
      explanationJa:
        '見えている結果ではなく、根本の原因で分類する。引き金は競合の価格戦略なので Competitor に入る。3つすべてに入れると「重複なし」のルールに違反します。',
      phrases: [
        { en: 'fits in', ja: '〜に当てはまる', note: '"which bucket fits ..."（どのバケツが当てはまるか）' },
        { en: 'visible effect', ja: '目に見える結果', note: 'visible = 目に見える' },
        { en: 'violates the rule', ja: 'ルールに違反する' },
      ],
    },
    // Step 5: Case 2 - B2B SaaS channels
    {
      titleJa: '【ケース2】B2B SaaSの新規顧客獲得チャネルマップ',
      contentJa:
        '■ 状況設定\nB2B SaaSのマーケティングチームが、予算を再配分する前に、新規顧客獲得のチャネルをすべてマップ化したい。\n\n■ MECE分解（対立概念 → 要素分解）\n\n[オンラインチャネル]\n├─ インバウンド\n│  ├─ SEO／コンテンツマーケ\n│  ├─ SNS（LinkedIn, X, Facebook）\n│  └─ ウェビナー\n├─ アウトバウンド\n│  ├─ 検索広告（Google, Bing）\n│  ├─ ディスプレイ／リターゲティング\n│  ├─ コールドメール\n│  └─ SNS広告（LinkedIn Ads など）\n└─ リファラル／口コミ\n   ├─ アフィリエイトプログラム\n   └─ レビューサイト（G2, Capterra）\n\n[オフラインチャネル]\n├─ インバウンド\n│  ├─ 展示会出展\n│  └─ 自社主催セミナー\n├─ アウトバウンド\n│  ├─ コールドコール（電話営業）\n│  ├─ ダイレクトメール\n│  └─ 飛び込み訪問\n└─ リファラル／口コミ\n   ├─ パートナーチャネル\n   └─ 既存顧客紹介\n\n■ パターン\n第1段：オンライン vs オフライン（対立概念）。第2段：インバウンド vs アウトバウンド vs リファラル（対立概念）。多階層の分解で、重複なく完全なマップが作れる。',
      phrases: [
        { en: 'reallocating budget', ja: '予算を再配分する', note: 're- = 再び、allocate = 配分する' },
        { en: 'word-of-mouth', ja: '口コミ', note: '直訳すると「口の言葉」' },
        { en: 'cold email', ja: '面識のない相手へのメール営業' },
        { en: 'cold calling', ja: '電話営業（飛び込み）', note: '"cold" = アポなし' },
        { en: 'multi-level decomposition', ja: '多階層の分解' },
      ],
    },
    // Step 6: Quiz online/offline pattern
    {
      questionJa: 'チャネルを「オンライン／オフライン」、次に「インバウンド／アウトバウンド」で分けた——どのMECEパターン？',
      optionsJa: [
        '要素分解 → 時系列',
        '対立概念 → 対立概念',
        '既存フレームワーク → 要素分解',
        '時系列 → 既存フレームワーク',
      ],
      explanationJa:
        'オンライン／オフラインも、インバウンド／アウトバウンドも、二項対立的な切り口。要素分解は「売上 = 価格 × 数量」のような数式型のことです。',
    },
    // Step 7: Case 3 - coffee chain revenue
    {
      titleJa: '【ケース3】コーヒーチェーンの売上分解',
      contentJa:
        '■ 状況設定\nあなたは10店舗のコーヒーチェーンの経営者。月間総売上が目標を20%下回っている。漏れを見つけるため、売上をMECEに分解する。\n\n■ 多階層の要素分解\n\n売上 = 顧客数 × 平均客単価\n\n[顧客数]\n├─ 新規顧客\n│  ├─ 通行客（立地）\n│  ├─ 広告経由\n│  ├─ 口コミ\n│  └─ レビューサイト経由\n├─ リピート顧客\n│  ├─ ヘビーユーザー（週3回以上）\n│  ├─ ミドルユーザー（週1-2回）\n│  └─ ライトユーザー（月1-3回）\n└─ 時間帯\n   ├─ 朝（7-10時）\n   ├─ ランチ（11-14時）\n   ├─ 午後（14-17時）\n   └─ 夕方（17-21時）\n\n[平均客単価]\n├─ ドリンク価格 × ドリンク付帯率\n├─ フード価格 × フード付帯率\n├─ デザート価格 × デザート付帯率\n└─ テイクアウト vs イートインの差\n\n■ データが示すもの\n調べると、リピート顧客は変わらず、新規顧客が30%減、特にレビューサイト経由の流入が激減。競合チェーンのレビュー評価上昇で初回客を奪われていた。\n\n■ なぜ機能するか\n「売上 = 顧客数 × 客単価」は古典的な要素分解。さらに1階層下げることで、分析を具体的なアクションに繋げられる。',
      phrases: [
        { en: 'find the leak', ja: '漏れ（穴）を見つける', note: 'leak = 漏れ。問題の原因の比喩' },
        { en: 'foot traffic', ja: '通行人・来店客数', note: '直訳「足の交通」' },
        { en: 'attach rate', ja: '付帯率・併売率', note: 'メイン商品に何かが追加される率' },
        { en: 'dig in', ja: '深掘りする', note: '直訳「掘り進める」' },
        { en: 'held steady', ja: '横ばいだった、安定していた' },
        { en: 'connect ... to specific actions', ja: '〜を具体的なアクションに繋げる' },
      ],
    },
    // Step 8: Quiz Customers × Ticket
    {
      questionJa: '売上を「顧客数 × 平均客単価」で分けた——どのMECEパターン？',
      optionsJa: ['時系列', '対立概念', '要素分解', '既存フレームワーク'],
      explanationJa: '全体を A × B や A + B のように数式の構成要素に分けるのが要素分解です。',
    },
    // Step 9: Quiz NOT MECE
    {
      questionJa: '次のうちMECEでないものは？',
      optionsJa: [
        '性別：男性／女性／その他',
        '年齢：10代／20代／30代／40代／50代以上',
        '地域：北部／南部／東部／都市部／郊外',
        '購入頻度：初回／2回目／3回目以上',
      ],
      explanationJa:
        '地域の選択肢は、地理（北部／南部／東部）と人口密度（都市部／郊外）という2つの異なる切り口を混ぜている。北部にも都市部・郊外があるので、カテゴリーが重複してしまいます。',
      phrases: [
        { en: 'mixes two different cuts', ja: '2つの異なる切り口を混ぜている', note: 'cut = 分類の切り口' },
      ],
    },
    // Step 10: Quiz missing categories
    {
      questionJa: 'ある会社が従業員を「正社員／契約社員／パート」と分類している。派遣・フリーランスが含まれていない。これはどのMECEの問題？',
      optionsJa: ['カテゴリーの重複', 'カテゴリーの抜け', '重複と抜けの両方', '問題なし'],
      explanationJa: '派遣やフリーランスが含まれていない「抜け」がある。MECEの片割れ「Collectively Exhaustive（網羅）」を満たしていません。',
      phrases: [
        { en: 'fails the rule', ja: 'ルールを満たさない', note: 'fail = 満たさない・落ちる' },
      ],
    },
    // Step 11: Quiz best approach
    {
      questionJa: 'MECE分解を作る最も効果的な進め方は？',
      optionsJa: [
        '思いついた順に列挙する',
        '最上位の切り口を先に決め、段階的に細分化する',
        '競合の分析をコピーする',
        '項目数を最大化する',
      ],
      explanationJa: '良いMECE分解は、まず最上位の切り口（例：3Cで切る、オンライン／オフラインで切る）を決め、それから1段ずつ細かくしていきます。トップダウン的アプローチです。',
      phrases: [
        { en: 'top-level cut', ja: '最上位の切り口' },
        { en: 'progressively subdivide', ja: '段階的に細分化する', note: 'progressively = 段階的に' },
      ],
    },
  ],
}

// Deduction (lesson 25) — additional annotation example
const deduction: LessonAnnotations = {
  steps: [
    {
      titleJa: '演繹法 — 一般から個別へ',
      contentJa:
        '演繹的推論は、一般的な原則から始め、具体的な結論を導きます。古典的な構造は三段論法です：\n\n大前提：すべての人間は死ぬ運命にある\n小前提：ソクラテスは人間である\n結論：ゆえに、ソクラテスは死ぬ運命にある\n\n両方の前提が真であれば、結論は必ず真である。これが演繹の力です — 完全に厳密で、論理的に確実。\n\nビジネスでは、演繹はあなたの推論が確固たる原則の上に立っていることを示すために使われます。',
      phrases: [
        { en: 'general to specific', ja: '一般から具体へ' },
        { en: 'syllogism', ja: '三段論法', note: '大前提・小前提・結論からなる演繹推論' },
        { en: 'major premise', ja: '大前提' },
        { en: 'minor premise', ja: '小前提' },
        { en: 'mortal', ja: '死ぬ運命の・必滅の' },
        { en: 'rests on', ja: '〜の上に立っている、〜に基づいている', note: 'rest on = 〜に依存・基づく' },
        { en: 'airtight', ja: '完璧な・隙のない', note: '直訳「空気が漏れない」→ 論理的に隙がない' },
      ],
    },
  ],
}

export const englishLearningAnnotations: Record<number, LessonAnnotations> = {
  20: mece,
  25: deduction,
}

export function getLessonAnnotation(lessonId: number): LessonAnnotations | undefined {
  return englishLearningAnnotations[lessonId]
}

export function getStepAnnotation(lessonId: number, stepIndex: number): StepAnnotation | undefined {
  return englishLearningAnnotations[lessonId]?.steps[stepIndex]
}

export function hasAnyAnnotation(lessonId: number): boolean {
  const a = englishLearningAnnotations[lessonId]
  return !!a && a.steps.some((s) => s.titleJa || s.contentJa || s.questionJa || (s.phrases && s.phrases.length > 0))
}

export function savePhraseToFlashcards(phrase: Phrase, lessonId: number, lessonTitle: string) {
  const back = phrase.note ? `${phrase.ja}\n\n${phrase.note}` : phrase.ja
  addCards([
    {
      front: phrase.en,
      back,
      category: lessonTitle,
      source: `english-${lessonId}`,
    },
  ])
}
