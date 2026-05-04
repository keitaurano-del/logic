import { getLocale } from './i18n'
import { pushPlacement, getSyncUser } from './syncService'

// ───────────────────────────────────────────────────────────────
// 実力診断テスト（旧: プレースメントテスト）
// 5つのスキル軸 × 4問ずつ（計20問）の問題プールから、
// 適応的に10問を出題し、軸ごとの理解度をレーダーチャート化する。
// ───────────────────────────────────────────────────────────────

export type SkillAxis =
  | 'structuring'   // 構造化（MECE / ロジックツリー / ピラミッド）
  | 'reasoning'     // 論証力（演繹 / 帰納 / 形式論理 / 対偶）
  | 'critical'      // 批判的思考（バイアス / 因果 / 論理的誤謬）
  | 'hypothesis'    // 仮説・課題設定（仮説思考 / イシュー）
  | 'business'      // ビジネス応用（フェルミ / 数字 / ケース）

export type Difficulty = 'easy' | 'medium' | 'hard'

export type PlacementQuestion = {
  id: string
  axis: SkillAxis
  difficulty: Difficulty
  topic: string
  question: string
  options: { label: string; correct: boolean }[]
  explanation: string
}

export type PlacementAnswer = {
  questionId: string
  axis: SkillAxis
  difficulty: Difficulty
  correct: boolean
  /** ユーザーが選択した選択肢のインデックス（旧データでは undefined） */
  selectedIndex?: number
}

export type AxisScore = {
  axis: SkillAxis
  level: 1 | 2 | 3 | 4 | 5   // 5段階レベル
  raw: number                 // 内部スコア
  correctCount: number        // 軸内の正答数
}

export type PlacementResult = {
  // 後方互換フィールド
  deviation: number
  correctCount: number
  totalCount: number
  completedAt: string
  recommendedLessonIds: number[]
  // 新フィールド
  axisScores: AxisScore[]
  recommendedCourseIds: string[]
  answers: PlacementAnswer[]
}

const STORAGE_KEY = 'logic-placement'

// 軸ラベル
export function axisLabel(axis: SkillAxis): { label: string; short: string; description: string } {
  const en = getLocale() === 'en'
  switch (axis) {
    case 'structuring':
      return en
        ? { label: 'Structuring', short: 'Structure', description: 'MECE, logic trees, pyramid principle' }
        : { label: '構造化', short: '構造', description: 'MECE / ロジックツリー / ピラミッド原則' }
    case 'reasoning':
      return en
        ? { label: 'Reasoning', short: 'Logic', description: 'Deduction, induction, formal logic' }
        : { label: '論証力', short: '論証', description: '演繹 / 帰納 / 対偶 / 形式論理' }
    case 'critical':
      return en
        ? { label: 'Critical thinking', short: 'Critical', description: 'Bias, fallacies, causation' }
        : { label: '批判的思考', short: '批判', description: 'バイアス / 因果 / 論理的誤謬' }
    case 'hypothesis':
      return en
        ? { label: 'Hypothesis & Issue', short: 'Hypothesis', description: 'Hypothesis-driven, issue framing' }
        : { label: '仮説・課題設定', short: '仮説', description: '仮説思考 / イシュー / 課題設定' }
    case 'business':
      return en
        ? { label: 'Business application', short: 'Business', description: 'Fermi, numeracy, cases' }
        : { label: 'ビジネス応用', short: '応用', description: 'フェルミ / 数字 / ケース' }
  }
}

export const SKILL_AXES: SkillAxis[] = [
  'structuring',
  'reasoning',
  'critical',
  'hypothesis',
  'business',
]

// ───────────────────────────────────────────────────────────────
// 問題プール（日本語）— 5軸 × 4問（easy / medium×2 / hard）
// ───────────────────────────────────────────────────────────────

const QUESTIONS_JA: PlacementQuestion[] = [
  // ── 構造化 ────────────────────────────────────────────
  {
    id: 'st-e1', axis: 'structuring', difficulty: 'easy', topic: 'MECE',
    question: 'MECE（漏れなくダブりなく）の観点から、最も適切でない分類はどれか？',
    options: [
      { label: '社員: 男性 / 女性 / その他', correct: false },
      { label: '会社: 上場企業 / 非上場企業', correct: false },
      { label: '飲み物: 温かい / 冷たい / コーヒー', correct: true },
      { label: '購入頻度: 初回 / リピーター', correct: false },
    ],
    explanation: '「コーヒー」は「温かい/冷たい」と切り口が違うので重なりが発生する（ダブり）。',
  },
  {
    id: 'st-m1', axis: 'structuring', difficulty: 'medium', topic: 'ロジックツリー',
    question: '「売上が伸び悩んでいる」原因を分解する第一階層として最も適切なものは？',
    options: [
      { label: '営業の頑張り / マーケの頑張り', correct: false },
      { label: '客数 × 客単価', correct: true },
      { label: '商品Aの売上 / 商品Bの売上 / 商品Cの売上', correct: false },
      { label: '景気が悪い / 競合が強い', correct: false },
    ],
    explanation: '売上 = 客数 × 客単価 はMECEな第一分解。商品別は重要だが「原因の構造」ではない。',
  },
  {
    id: 'st-m2', axis: 'structuring', difficulty: 'medium', topic: 'ピラミッド原則',
    question: '上司への報告で、ピラミッド原則に最も沿った構造はどれか？',
    options: [
      { label: '結論 → 根拠（3点） → 各根拠の事実・データ', correct: true },
      { label: '背景 → 経緯 → 詳細データ → 最後に結論', correct: false },
      { label: '事実を時系列に並べ、聞き手に判断を委ねる', correct: false },
      { label: '結論のみ、根拠は質問されたら答える', correct: false },
    ],
    explanation: 'ピラミッドは「結論→複数の根拠→根拠を支える事実」のトップダウン構造。',
  },
  {
    id: 'st-h1', axis: 'structuring', difficulty: 'hard', topic: 'So What / Why So',
    question: '「自社ECの売上は前年比120%」という事実に対し、最も筋の良いSo What?は？',
    options: [
      { label: '前年は1億円だった', correct: false },
      { label: '業界平均は115%である', correct: false },
      { label: 'ECシフトが加速しており、EC人員増強と店舗戦略の見直しが必要', correct: true },
      { label: '来年も同じ施策を続けるべきだ', correct: false },
    ],
    explanation: 'So What?は「だから何が言えるか・何をすべきか」を導く。事実の言い換えではなく示唆と打ち手につなぐ。',
  },

  // ── 論証力 ────────────────────────────────────────────
  {
    id: 'rs-e1', axis: 'reasoning', difficulty: 'easy', topic: '演繹法',
    question: '次のうち、演繹法による推論はどれか？',
    options: [
      { label: '過去5年12月の売上が高かった。今年の12月も伸びるだろう', correct: false },
      { label: '利益率5%未満の事業は撤退する方針。本件は2%なので撤退対象', correct: true },
      { label: '3人の顧客から好評だった。市場全体に受けるはずだ', correct: false },
      { label: '競合がやっているので、当社もやるべきだ', correct: false },
    ],
    explanation: '一般原則（5%未満は撤退）を個別事例に適用する→演繹。',
  },
  {
    id: 'rs-m1', axis: 'reasoning', difficulty: 'medium', topic: '帰納法',
    question: '20代女性5人にアンケートし「20代女性はブランドXが好き」と結論。最大の問題点は？',
    options: [
      { label: 'ブランドXの定義が曖昧', correct: false },
      { label: 'サンプル数が少なく、偏りもチェックされていない', correct: true },
      { label: '20代男性のデータがない', correct: false },
      { label: 'インタビューでなくアンケートだから', correct: false },
    ],
    explanation: '帰納の妥当性はサンプルサイズと代表性に依存する。5人では一般化はできない。',
  },
  {
    id: 'rs-m2', axis: 'reasoning', difficulty: 'medium', topic: '対偶',
    question: '「優秀な営業担当者は数字に強い」の対偶として正しいものは？',
    options: [
      { label: '数字に強い人は優秀な営業担当者である', correct: false },
      { label: '優秀でない営業担当者は数字に弱い', correct: false },
      { label: '数字に弱い人は優秀な営業担当者ではない', correct: true },
      { label: '数字に強くないなら優秀な営業担当者でない可能性がある', correct: false },
    ],
    explanation: '「AならばB」の対偶は「BでないならAでない」。逆や裏と混同しないこと。',
  },
  {
    id: 'rs-h1', axis: 'reasoning', difficulty: 'hard', topic: '形式論理（モーダス・トレンス）',
    question: '次のうち、論理的に正しい推論（モーダス・トレンス）はどれか？',
    options: [
      { label: '雨が降れば地面が濡れる。地面が濡れている。だから雨が降った', correct: false },
      { label: 'サーバが落ちればアラートが鳴る。アラートが鳴っていない。だからサーバは落ちていない', correct: true },
      { label: '優秀な人は早く帰る。彼は早く帰った。だから彼は優秀だ', correct: false },
      { label: '雨が降れば傘を持つ人が増える。雨は降っていない。だから傘を持つ人は増えていない', correct: false },
    ],
    explanation: '「AならばB」と「Bでない」から「Aでない」を導くのがモーダス・トレンス（後件否定）。他は後件肯定の誤謬等。',
  },

  // ── 批判的思考 ─────────────────────────────────────────
  {
    id: 'cr-e1', axis: 'critical', difficulty: 'easy', topic: '相関と因果',
    question: '「アイスの売上が伸びると水難事故が増える」というデータから言えることは？',
    options: [
      { label: 'アイスを食べると水難事故に遭いやすくなる', correct: false },
      { label: 'アイスの売上を抑えれば事故は減る', correct: false },
      { label: '気温という第3の要因で両方が同時に増えている可能性が高い', correct: true },
      { label: 'アイスと水難事故は無関係である', correct: false },
    ],
    explanation: '相関は因果を意味しない。共通原因（交絡因子）の存在を疑う必要がある。',
  },
  {
    id: 'cr-m1', axis: 'critical', difficulty: 'medium', topic: '確証バイアス',
    question: '新商品の検証で陥りがちな確証バイアスの典型例は？',
    options: [
      { label: '失敗事例ばかり集めて中止を決める', correct: false },
      { label: '自分の仮説を支持するデータばかり集めて反証データを軽視する', correct: true },
      { label: '社内の意見より顧客の意見を優先する', correct: false },
      { label: '定量データより定性データを重視する', correct: false },
    ],
    explanation: '確証バイアスは「信じたい仮説を支持する情報だけを選択的に集める」傾向。反証可能性のチェックが必要。',
  },
  {
    id: 'cr-m2', axis: 'critical', difficulty: 'medium', topic: '論理的誤謬',
    question: '「Aさんは前職で失敗した。だからAさんの提案は採用すべきでない」これに含まれる誤謬は？',
    options: [
      { label: '人身攻撃（ad hominem）', correct: true },
      { label: '権威への訴え', correct: false },
      { label: '滑り坂論法', correct: false },
      { label: '藁人形論法', correct: false },
    ],
    explanation: '提案の中身ではなく提案者の属性を攻撃するのが人身攻撃。論点をすり替えている。',
  },
  {
    id: 'cr-h1', axis: 'critical', difficulty: 'hard', topic: 'サンクコスト',
    question: '5億円投じたプロジェクトで、追加2億円が必要。残り価値の見込みは1.5億円。最も合理的な判断は？',
    options: [
      { label: 'すでに5億かけたので、ここでやめると無駄になる。続行', correct: false },
      { label: '残り価値1.5億 < 追加投資2億なので、撤退すべき', correct: true },
      { label: '5億 + 2億 = 7億回収できれば続行', correct: false },
      { label: '社内の士気を考えて続行', correct: false },
    ],
    explanation: '5億は埋没費用。今後の意思決定では「これからの追加投資 vs これから得られる価値」だけを比較する。',
  },

  // ── 仮説・課題設定 ─────────────────────────────────────
  {
    id: 'hp-e1', axis: 'hypothesis', difficulty: 'easy', topic: '仮説思考',
    question: '仮説思考の最も適切な進め方は？',
    options: [
      { label: 'まず網羅的にデータを集めてから考え始める', correct: false },
      { label: '先に「答えはこうだろう」と仮置きし、検証で磨いていく', correct: true },
      { label: '関係者全員にヒアリングしてから方向性を決める', correct: false },
      { label: '前例を踏襲し、変えるべきところだけ変える', correct: false },
    ],
    explanation: '仮説思考は「先に仮の答え→検証→修正」を高速に回す思考法。網羅型は時間切れになりやすい。',
  },
  {
    id: 'hp-m1', axis: 'hypothesis', difficulty: 'medium', topic: 'イシュー（問いの質）',
    question: '「自社の売上を伸ばすには？」を、より良いイシュー（解くべき問い）に書き換えるなら？',
    options: [
      { label: '営業の人数を増やすには？', correct: false },
      { label: '主力商品Aの離脱率が高い既存顧客を、半年でどう取り戻すか？', correct: true },
      { label: '今年中に売上を倍にする方法は？', correct: false },
      { label: '景気回復を待つべきか？', correct: false },
    ],
    explanation: '良いイシューは「答えが出る」「具体的」「インパクトが大きい」の3条件を満たす。漠然とした問いは打ち手につながらない。',
  },
  {
    id: 'hp-m2', axis: 'hypothesis', difficulty: 'medium', topic: '課題と問題',
    question: '「課題」と「問題」の違いを最も正しく表しているのは？',
    options: [
      { label: '同じ意味で、使い分ける必要はない', correct: false },
      { label: '問題=現状とあるべき姿のギャップ、課題=ギャップを埋めるためにやるべきこと', correct: true },
      { label: '課題=未来のもの、問題=過去のもの', correct: false },
      { label: '問題=数値で測れるもの、課題=測れないもの', correct: false },
    ],
    explanation: '問題はギャップそのもの、課題は埋めるための取り組み。混同すると「現象の解消」と「打ち手」が混ざる。',
  },
  {
    id: 'hp-h1', axis: 'hypothesis', difficulty: 'hard', topic: '仮説の検証設計',
    question: '「若年層の離脱率が高いのはアプリのUIが古いからだ」という仮説を検証する最良の方法は？',
    options: [
      { label: '若年ユーザーに「UIは古いと感じますか」とアンケート', correct: false },
      { label: 'UIを刷新したA案と現状B案でA/Bテストし、若年層の継続率を比較', correct: true },
      { label: '社内デザイナーにレビューしてもらう', correct: false },
      { label: '競合アプリのUIと比較する', correct: false },
    ],
    explanation: '仮説検証は「原因を変えたら結果が変わるか」を測ること。アンケートは認知バイアスが入りやすく、A/Bテストの方が因果に迫れる。',
  },

  // ── ビジネス応用 ────────────────────────────────────────
  {
    id: 'bs-e1', axis: 'business', difficulty: 'easy', topic: '結論ファースト',
    question: '上司への報告で最も伝わりやすい順番は？',
    options: [
      { label: '結論 → 理由 → 詳細', correct: true },
      { label: '背景 → 経緯 → 詳細 → 結論', correct: false },
      { label: '詳細 → 詳細 → 結論', correct: false },
      { label: '結論なしで事実だけ', correct: false },
    ],
    explanation: '忙しい相手には結論ファースト。「結論→理由→詳細」（PREP）が定石。',
  },
  {
    id: 'bs-m1', axis: 'business', difficulty: 'medium', topic: 'フェルミ推定',
    question: '日本国内のコンビニ店舗数を概算する際の最も筋の良い分解は？',
    options: [
      { label: '人口 ÷ 1店舗あたり想定顧客数', correct: true },
      { label: '47都道府県 × 各県の主要都市数', correct: false },
      { label: '主要チェーン3社の店舗数を足す', correct: false },
      { label: '日本の面積 ÷ 1店舗の床面積', correct: false },
    ],
    explanation: 'フェルミ推定は「需要側の式」が筋が良いことが多い。1.2億人 ÷ 想定2,000人/店 ≈ 6万店、で実数（約5.5万）に近づく。',
  },
  {
    id: 'bs-m2', axis: 'business', difficulty: 'medium', topic: '前年比・成長率',
    question: '売上が3年で1.5倍になった。年平均成長率（CAGR）の概算は？',
    options: [
      { label: '約50%', correct: false },
      { label: '約17%', correct: false },
      { label: '約14%', correct: true },
      { label: '約5%', correct: false },
    ],
    explanation: 'CAGR = (1.5)^(1/3) − 1 ≒ 0.144 ≒ 14%。1.5を3年で割って50/3≒17%とするのは単利の誤り。',
  },
  {
    id: 'bs-h1', axis: 'business', difficulty: 'hard', topic: 'ケース（利益分解）',
    question: '飲食チェーンの利益が下がった。原因分解として最も筋の良い切り口は？',
    options: [
      { label: '本社費 / 店舗費', correct: false },
      { label: '売上要因（客数 × 客単価）と コスト要因（変動費 / 固定費）に分解', correct: true },
      { label: '直営店 / FC店', correct: false },
      { label: 'コロナ前 / コロナ後', correct: false },
    ],
    explanation: '利益 = 売上 − コスト。まず「売上が落ちたのか / コストが上がったのか」をMECEに切り分けるのが定石。',
  },
]

// ───────────────────────────────────────────────────────────────
// 問題プール（英語）
// ───────────────────────────────────────────────────────────────

const QUESTIONS_EN: PlacementQuestion[] = [
  {
    id: 'st-e1', axis: 'structuring', difficulty: 'easy', topic: 'MECE',
    question: 'Which grouping violates MECE (Mutually Exclusive, Collectively Exhaustive)?',
    options: [
      { label: 'Employees: men / women / other', correct: false },
      { label: 'Companies: public / private', correct: false },
      { label: 'Drinks: hot / cold / coffee', correct: true },
      { label: 'Purchase frequency: first-time / repeat', correct: false },
    ],
    explanation: '"Coffee" overlaps with hot/cold — different cut, causing duplication.',
  },
  {
    id: 'st-m1', axis: 'structuring', difficulty: 'medium', topic: 'Logic tree',
    question: 'For "sales are stagnating," what is the best first-level decomposition?',
    options: [
      { label: 'Sales effort vs marketing effort', correct: false },
      { label: '# of customers × revenue per customer', correct: true },
      { label: 'Revenue from product A / B / C', correct: false },
      { label: 'Bad economy / strong competitor', correct: false },
    ],
    explanation: 'Revenue = customers × ARPU is the MECE first cut. Per-product is useful, but is not a structural cause.',
  },
  {
    id: 'st-m2', axis: 'structuring', difficulty: 'medium', topic: 'Pyramid principle',
    question: 'Which structure best follows the pyramid principle?',
    options: [
      { label: 'Conclusion → 3 supporting reasons → facts/data per reason', correct: true },
      { label: 'Background → history → details → conclusion at end', correct: false },
      { label: 'Chronological facts; let listener decide', correct: false },
      { label: 'Conclusion only; reasons if asked', correct: false },
    ],
    explanation: 'Pyramid is top-down: conclusion → reasons → supporting facts.',
  },
  {
    id: 'st-h1', axis: 'structuring', difficulty: 'hard', topic: 'So What / Why So',
    question: '"E-commerce revenue is up 120% YoY." What is the strongest "So What?"',
    options: [
      { label: 'Last year it was $10M', correct: false },
      { label: 'Industry average is 115%', correct: false },
      { label: 'Digital shift is accelerating; grow the e-com team and rethink retail', correct: true },
      { label: 'We should keep doing what we did this year', correct: false },
    ],
    explanation: '"So What?" extracts implications and actions, not just restatement.',
  },

  {
    id: 'rs-e1', axis: 'reasoning', difficulty: 'easy', topic: 'Deduction',
    question: 'Which of the following is deductive reasoning?',
    options: [
      { label: 'December peaked the last 5 years; this December will too', correct: false },
      { label: 'Policy: exit any unit under 5% margin. This unit is at 2%, so exit', correct: true },
      { label: '3 customers loved it, so the whole market will', correct: false },
      { label: 'Competitor does it, so we should too', correct: false },
    ],
    explanation: 'Applying a general rule to a specific case is deduction.',
  },
  {
    id: 'rs-m1', axis: 'reasoning', difficulty: 'medium', topic: 'Induction',
    question: 'A marketer surveyed 5 women in their 20s and concluded "women in their 20s love Brand X." Biggest issue?',
    options: [
      { label: 'Definition of "Brand X" is vague', correct: false },
      { label: 'Sample size too small; bias not checked', correct: true },
      { label: 'No data on men in their 20s', correct: false },
      { label: 'Survey instead of interview', correct: false },
    ],
    explanation: 'Inductive validity depends on sample size and representativeness.',
  },
  {
    id: 'rs-m2', axis: 'reasoning', difficulty: 'medium', topic: 'Contrapositive',
    question: 'What is the contrapositive of "Excellent salespeople are strong with numbers"?',
    options: [
      { label: 'People strong with numbers are excellent salespeople', correct: false },
      { label: 'Salespeople who are not excellent are weak with numbers', correct: false },
      { label: 'People weak with numbers are not excellent salespeople', correct: true },
      { label: 'If not strong with numbers, may not be an excellent salesperson', correct: false },
    ],
    explanation: 'Contrapositive of "If A then B" is "If not B then not A."',
  },
  {
    id: 'rs-h1', axis: 'reasoning', difficulty: 'hard', topic: 'Modus tollens',
    question: 'Which is a logically valid inference (modus tollens)?',
    options: [
      { label: 'Rain → wet ground. Ground is wet. So it rained.', correct: false },
      { label: 'Server down → alert fires. Alert is not firing. So server is not down.', correct: true },
      { label: 'Excellent people leave early. He left early. So he is excellent.', correct: false },
      { label: 'Rain → more umbrellas. No rain. So no umbrellas.', correct: false },
    ],
    explanation: '"If A then B" + "Not B" → "Not A" is modus tollens. Others are invalid (affirming the consequent, etc.).',
  },

  {
    id: 'cr-e1', axis: 'critical', difficulty: 'easy', topic: 'Correlation vs causation',
    question: 'Ice cream sales rise as drowning incidents rise. What can you conclude?',
    options: [
      { label: 'Ice cream causes drowning', correct: false },
      { label: 'Reducing ice cream sales reduces drowning', correct: false },
      { label: 'A third factor (temperature) likely drives both', correct: true },
      { label: 'They are unrelated', correct: false },
    ],
    explanation: 'Correlation is not causation. Always check for a confounding variable.',
  },
  {
    id: 'cr-m1', axis: 'critical', difficulty: 'medium', topic: 'Confirmation bias',
    question: 'Classic example of confirmation bias when validating a new product?',
    options: [
      { label: 'Collecting only failure cases and killing the project', correct: false },
      { label: 'Collecting data that supports your hypothesis while downplaying disconfirming data', correct: true },
      { label: 'Trusting customer voice over internal voice', correct: false },
      { label: 'Trusting qualitative over quantitative', correct: false },
    ],
    explanation: 'Confirmation bias = selectively gathering evidence that confirms what you already believe.',
  },
  {
    id: 'cr-m2', axis: 'critical', difficulty: 'medium', topic: 'Logical fallacy',
    question: '"A failed at her last job, so we should reject her proposal." Which fallacy?',
    options: [
      { label: 'Ad hominem (personal attack)', correct: true },
      { label: 'Appeal to authority', correct: false },
      { label: 'Slippery slope', correct: false },
      { label: 'Straw man', correct: false },
    ],
    explanation: 'Attacking the person rather than the argument is ad hominem.',
  },
  {
    id: 'cr-h1', axis: 'critical', difficulty: 'hard', topic: 'Sunk cost',
    question: 'A project has consumed $5M. $2M more is needed. Expected remaining value is $1.5M. What is rational?',
    options: [
      { label: 'We already spent $5M; quitting wastes it. Continue.', correct: false },
      { label: 'Remaining value $1.5M < $2M required. Stop.', correct: true },
      { label: 'Continue if total $7M can be recouped', correct: false },
      { label: 'Continue for team morale', correct: false },
    ],
    explanation: '$5M is a sunk cost. Decisions should compare future cost vs future value only.',
  },

  {
    id: 'hp-e1', axis: 'hypothesis', difficulty: 'easy', topic: 'Hypothesis-driven',
    question: 'What is the right way to do hypothesis-driven thinking?',
    options: [
      { label: 'Collect all data exhaustively, then start thinking', correct: false },
      { label: 'Set a tentative answer first, then sharpen it through testing', correct: true },
      { label: 'Interview every stakeholder before deciding direction', correct: false },
      { label: 'Stick to precedent; only change what must change', correct: false },
    ],
    explanation: 'Hypothesis-driven = tentative answer first, then iterate through fast verification.',
  },
  {
    id: 'hp-m1', axis: 'hypothesis', difficulty: 'medium', topic: 'Issue framing',
    question: 'Which is a better-framed issue than "How do we grow revenue?"',
    options: [
      { label: 'How do we hire more salespeople?', correct: false },
      { label: 'How do we win back high-churn existing customers of flagship product A in 6 months?', correct: true },
      { label: 'How do we double revenue this year?', correct: false },
      { label: 'Should we wait for the market to recover?', correct: false },
    ],
    explanation: 'A good issue is answerable, specific, and impactful. Vague questions don\'t lead to action.',
  },
  {
    id: 'hp-m2', axis: 'hypothesis', difficulty: 'medium', topic: 'Issue vs problem',
    question: 'Which best captures the difference between "problem" and "issue/task" (課題)?',
    options: [
      { label: 'They mean the same; no need to distinguish', correct: false },
      { label: 'Problem = gap between current and desired state; issue = what to do to close it', correct: true },
      { label: 'Issue = future, problem = past', correct: false },
      { label: 'Problem = measurable, issue = not', correct: false },
    ],
    explanation: 'Problem is the gap. Issue/task is the action to bridge it. Mixing them confuses cause and remedy.',
  },
  {
    id: 'hp-h1', axis: 'hypothesis', difficulty: 'hard', topic: 'Hypothesis testing',
    question: 'Hypothesis: "Young users churn because the UI is outdated." Best test?',
    options: [
      { label: 'Survey: "Do you find the UI outdated?"', correct: false },
      { label: 'A/B test new UI (A) vs current (B); compare young-user retention', correct: true },
      { label: 'Have internal designers review', correct: false },
      { label: 'Compare with competitor UIs', correct: false },
    ],
    explanation: 'A/B testing changes the cause and observes the effect — closest to causal evidence.',
  },

  {
    id: 'bs-e1', axis: 'business', difficulty: 'easy', topic: 'Conclusion-first',
    question: 'Most effective order for reporting to your manager?',
    options: [
      { label: 'Conclusion → reasons → details', correct: true },
      { label: 'Background → history → details → conclusion', correct: false },
      { label: 'Details → details → conclusion', correct: false },
      { label: 'No conclusion, only facts', correct: false },
    ],
    explanation: 'Busy listeners: conclusion first, then reasons, then details (PREP).',
  },
  {
    id: 'bs-m1', axis: 'business', difficulty: 'medium', topic: 'Fermi estimation',
    question: 'Best decomposition for estimating # of convenience stores in Japan?',
    options: [
      { label: 'Population ÷ assumed customers-per-store', correct: true },
      { label: '47 prefectures × major cities each', correct: false },
      { label: 'Sum of top-3 chains', correct: false },
      { label: 'Land area ÷ store footprint', correct: false },
    ],
    explanation: 'Demand-side decomposition usually generalizes best. ~120M / ~2,000 ≈ 60K, near actual ~55K.',
  },
  {
    id: 'bs-m2', axis: 'business', difficulty: 'medium', topic: 'CAGR',
    question: 'Sales grew 1.5× in 3 years. Approximate CAGR?',
    options: [
      { label: '~50%', correct: false },
      { label: '~17%', correct: false },
      { label: '~14%', correct: true },
      { label: '~5%', correct: false },
    ],
    explanation: 'CAGR = 1.5^(1/3) − 1 ≈ 14%. Dividing 50% by 3 (= ~17%) is the simple-interest fallacy.',
  },
  {
    id: 'bs-h1', axis: 'business', difficulty: 'hard', topic: 'Profit decomposition',
    question: 'A restaurant chain\'s profit dropped. Best first decomposition?',
    options: [
      { label: 'HQ cost / store cost', correct: false },
      { label: 'Revenue (customers × ARPU) and Cost (variable / fixed)', correct: true },
      { label: 'Owned stores / franchise stores', correct: false },
      { label: 'Pre-COVID / post-COVID', correct: false },
    ],
    explanation: 'Profit = revenue − cost. First split: did revenue fall, or did cost rise?',
  },
]

function getQuestionPool(): PlacementQuestion[] {
  return getLocale() === 'en' ? QUESTIONS_EN : QUESTIONS_JA
}

// 全問題エクスポート（テスト・デバッグ用途）
export const PLACEMENT_QUESTIONS = new Proxy([] as PlacementQuestion[], {
  get(_target, prop) {
    const arr = getQuestionPool()
    const value = arr[prop as unknown as number]
    if (value !== undefined) return value
    return (arr as unknown as Record<string | symbol, unknown>)[prop as string | symbol]
  },
})

// ───────────────────────────────────────────────────────────────
// 適応型出題ロジック
// 10問構成: 5軸 × 2問
// Phase A (Q1-Q5): 各軸からmedium 1問（軸の順番はランダム化）
// Phase B (Q6-Q10): 各軸2問目を、Phase Aの正誤に応じて出し分け
//   - Phase A正解 → hard
//   - Phase A不正解 → easy（基礎確認）
// ───────────────────────────────────────────────────────────────

export type PlacementSession = {
  plan: { axis: SkillAxis; phase: 'A' | 'B'; difficulty: Difficulty; questionId: string }[]
  answers: PlacementAnswer[]
  cursor: number
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function pickQuestion(axis: SkillAxis, difficulty: Difficulty, exclude: Set<string>): PlacementQuestion | null {
  const pool = getQuestionPool().filter(
    q => q.axis === axis && q.difficulty === difficulty && !exclude.has(q.id),
  )
  if (pool.length === 0) {
    // フォールバック: 同じ軸の別難度
    const alt = getQuestionPool().filter(q => q.axis === axis && !exclude.has(q.id))
    return alt[0] ?? null
  }
  return pool[Math.floor(Math.random() * pool.length)]
}

export function startSession(): PlacementSession {
  const axisOrder = shuffle([...SKILL_AXES])
  const used = new Set<string>()
  const plan: PlacementSession['plan'] = []
  // Phase A: 各軸 medium
  for (const axis of axisOrder) {
    const q = pickQuestion(axis, 'medium', used)
    if (q) {
      used.add(q.id)
      plan.push({ axis, phase: 'A', difficulty: 'medium', questionId: q.id })
    }
  }
  // Phase B はプレースホルダー（実際の難度は答えに応じて再計算）
  for (const axis of axisOrder) {
    plan.push({ axis, phase: 'B', difficulty: 'medium', questionId: '' })
  }
  return { plan, answers: [], cursor: 0 }
}

export function getCurrentQuestion(session: PlacementSession): PlacementQuestion | null {
  const slot = session.plan[session.cursor]
  if (!slot) return null
  // 既に問題が確定していればキャッシュを返す（Phase A/B共通）。
  // 過去にPhase Bでは毎回再抽選しており、再レンダーで問題が変わる不具合があった。
  if (slot.questionId) {
    return getQuestionPool().find(q => q.id === slot.questionId) ?? null
  }
  // Phase B 初回: その軸のPhase A結果を見て難度確定
  const aAnswer = session.answers.find(a => a.axis === slot.axis && session.plan.find(p => p.questionId === a.questionId)?.phase === 'A')
  const difficulty: Difficulty = aAnswer?.correct ? 'hard' : 'easy'
  const used = new Set(session.answers.map(a => a.questionId).concat(session.plan.filter(p => p.questionId).map(p => p.questionId)))
  const q = pickQuestion(slot.axis, difficulty, used)
  if (q) {
    slot.questionId = q.id
    slot.difficulty = difficulty
  }
  return q
}

export function recordAnswer(session: PlacementSession, q: PlacementQuestion, optionIndex: number): PlacementSession {
  const correct = q.options[optionIndex]?.correct === true
  const next: PlacementSession = {
    ...session,
    answers: [...session.answers, { questionId: q.id, axis: q.axis, difficulty: q.difficulty, correct, selectedIndex: optionIndex }],
    cursor: session.cursor + 1,
  }
  return next
}

// 問題IDから問題定義を取得（解説表示用）
export function getQuestionById(id: string): PlacementQuestion | undefined {
  return getQuestionPool().find(q => q.id === id)
}

// ───────────────────────────────────────────────────────────────
// スコア計算
// ───────────────────────────────────────────────────────────────

const DIFF_VALUE: Record<Difficulty, number> = { easy: 1, medium: 2, hard: 3 }

export function computeAxisScores(answers: PlacementAnswer[]): AxisScore[] {
  return SKILL_AXES.map(axis => {
    const axisAns = answers.filter(a => a.axis === axis)
    const correctAns = axisAns.filter(a => a.correct)
    const phaseA = axisAns[0]
    const phaseB = axisAns[1]

    // 厳しめスコアリング:
    //  - medium正解 + hard正解 → Lv.5 (卓越)
    //  - medium正解 + easyフォールバック正解 → Lv.4 (上級)
    //  - medium正解 + hard不正解 → Lv.3 (中級: 基礎は理解、応用で詰まる)
    //  - medium不正解 + easy正解 → Lv.2 (基礎: 基礎のみ)
    //  - medium不正解 + easy不正解 → Lv.1 (入門)
    //  - phase B未回答（暫定）はphase A結果で評価
    let level: 1 | 2 | 3 | 4 | 5 = 1
    if (phaseA?.correct && phaseB?.correct) {
      level = phaseB.difficulty === 'hard' ? 5 : 4
    } else if (phaseA?.correct && phaseB && !phaseB.correct) {
      level = 3 // medium正解だが応用でつまずく → 中級
    } else if (phaseA?.correct) {
      level = 3 // 暫定: medium正解のみ
    } else if (phaseB?.correct) {
      level = 2 // 基礎のみ正解
    } else {
      level = 1
    }

    const raw = axisAns.reduce((sum, a) => sum + (a.correct ? DIFF_VALUE[a.difficulty] : 0), 0)

    return { axis, level, raw, correctCount: correctAns.length }
  })
}

export function calcDeviation(answers: PlacementAnswer[]): number {
  if (answers.length === 0) return 50
  const totalRaw = answers.reduce((sum, a) => sum + (a.correct ? DIFF_VALUE[a.difficulty] : 0), 0)
  // 最大スコア: 5 medium(2) + 5 hard(3) = 25 → 偏差値75
  // 全問不正解: 0 → 偏差値22 (厳しめ下限)
  // 旧式は28起点・47幅で底上げが大きかった。22起点・53幅に変更。
  const dev = Math.round(22 + (totalRaw / 25) * 53)
  return Math.max(20, Math.min(78, dev))
}

// 後方互換: 旧APIシグネチャ
export function calcDeviationLegacy(correctCount: number, total: number): number {
  if (total === 0) return 50
  return Math.round(30 + (correctCount / total) * 40)
}

export function rankLabel(dev: number): { label: string; color: string; comment: string } {
  const en = getLocale() === 'en'
  if (dev >= 65) return en
    ? { label: 'Top tier', color: '#F4A261', comment: 'You\'ve mastered logic deeply. Time for advanced cases and strategy.' }
    : { label: 'トップクラス', color: '#F4A261', comment: '論理思考の応用まで習得済み。ケース・戦略系コースへ進みましょう。' }
  if (dev >= 55) return en
    ? { label: 'Advanced', color: '#10B981', comment: 'Strong fundamentals. Apply them to hypothesis-driven and critical thinking.' }
    : { label: '上級', color: '#10B981', comment: '基礎は十分。仮説思考や批判的思考の応用へ進みましょう。' }
  if (dev >= 45) return en
    ? { label: 'Intermediate', color: '#6C8EF5', comment: 'You grasp core frameworks. Sharpen application and weak axes.' }
    : { label: '中級', color: '#6C8EF5', comment: '主要フレームは理解済み。弱い軸を補強しつつ応用力を磨きましょう。' }
  if (dev >= 35) return en
    ? { label: 'Beginner', color: '#9B8E7E', comment: 'Start with MECE and logic trees to build foundation.' }
    : { label: '初級', color: '#9B8E7E', comment: 'まずはMECEとロジックツリーで土台を作りましょう。' }
  return en
    ? { label: 'Starter', color: '#9B8E7E', comment: 'Begin with the fundamentals of logical thinking, step by step.' }
    : { label: '入門', color: '#9B8E7E', comment: 'ロジカルシンキングの基礎から順番に学びましょう。' }
}

// 5段階レベル → 言葉ラベル
export function levelLabel(level: number): string {
  switch (level) {
    case 5: return '卓越'
    case 4: return '上級'
    case 3: return '中級'
    case 2: return '基礎'
    default: return '入門'
  }
}

// 軸ごとの強み・弱みコメント（言語化）
function axisDetailComment(axis: SkillAxis, level: 1 | 2 | 3 | 4 | 5): string {
  const a = axisLabel(axis).label
  if (level >= 5) return `${a}は卓越レベル。応用問題でも論点を即座に押さえられている。`
  if (level >= 4) return `${a}は上級レベル。フレームを使いこなし、実務でも安定して活用できる。`
  if (level >= 3) return `${a}は中級レベル。基礎は理解しているが、応用問題で抜け漏れが出やすい。`
  if (level >= 2) return `${a}は基礎レベル。基本問題は解けるが、応用への橋渡しが課題。`
  return `${a}は入門レベル。まずはこの軸の基本概念から押さえ直す必要がある。`
}

// 詳細な診断コメント（複数行）
export function detailedDiagnosis(axisScores: AxisScore[], deviation: number): string[] {
  const sorted = [...axisScores].sort((a, b) => a.level - b.level)
  const weakest = sorted[0]
  const second = sorted[1]
  const strongest = sorted[sorted.length - 1]
  const avgLevel = axisScores.reduce((s, a) => s + a.level, 0) / Math.max(1, axisScores.length)
  const lines: string[] = []

  // 全体評価
  if (deviation >= 65) {
    lines.push('全体としてトップクラスの論理思考力。基本〜応用まで安定して解けており、実務でも複雑な論点を整理できる段階にあります。')
  } else if (deviation >= 55) {
    lines.push('全体として上級レベル。論理の基礎は完成しており、応用問題でも筋の良い切り口を選べています。あと一歩で「使いこなす側」に到達します。')
  } else if (deviation >= 45) {
    lines.push('全体として中級レベル。主要フレームは理解できていますが、応用問題で論点を一段深く詰める力がもう一段必要です。')
  } else if (deviation >= 35) {
    lines.push('全体として初級〜基礎レベル。基本概念の理解にバラつきが残っており、まずは土台となる「型」を一つずつ確実にしましょう。')
  } else {
    lines.push('全体として入門レベル。論理思考の用語・フレームが定着していない段階です。焦らず基本問題から順に積み上げていきましょう。')
  }

  // 強み・弱み
  if (strongest && strongest.level >= 3 && strongest.axis !== weakest?.axis) {
    lines.push(`強みは「${axisLabel(strongest.axis).label}」（${levelLabel(strongest.level)}）。${axisDetailComment(strongest.axis, strongest.level)}`)
  }
  if (weakest) {
    lines.push(`最大の伸びしろは「${axisLabel(weakest.axis).label}」（${levelLabel(weakest.level)}）。${axisDetailComment(weakest.axis, weakest.level)}`)
  }
  if (second && second.axis !== weakest?.axis && second.level <= 2) {
    lines.push(`次の課題は「${axisLabel(second.axis).label}」（${levelLabel(second.level)}）。ここを底上げすることで全体の安定感が増します。`)
  }

  // バランス・偏り
  const minLv = Math.min(...axisScores.map(a => a.level))
  const maxLv = Math.max(...axisScores.map(a => a.level))
  if (maxLv - minLv >= 3) {
    lines.push('軸間の差が大きく、得意・不得意がはっきり分かれています。総合力を上げるには、最も弱い軸を優先的に底上げするのが近道です。')
  } else if (avgLevel >= 4 && maxLv - minLv <= 1) {
    lines.push('5軸とも高水準で揃っており、バランス型の論理思考力です。今後はケース・戦略など実務応用で更に磨きをかけられます。')
  } else if (avgLevel <= 2 && maxLv - minLv <= 1) {
    lines.push('まだ全体的に基礎が固まりきっていない段階です。1日1レッスン、優先順位を絞って積み上げていきましょう。')
  }

  // 学習方針
  if (weakest) {
    lines.push(`次のアクション: 「${axisLabel(weakest.axis).label}」を補強するレッスンから着手。あなた専用のパーソナルコース（弱点優先順）を自動生成しています。`)
  }

  return lines
}

// ───────────────────────────────────────────────────────────────
// コース推薦
// 弱い軸 → コース直結 / 偏差値レベルでも調整
// ───────────────────────────────────────────────────────────────

const AXIS_COURSE_MAP: Record<SkillAxis, { primary: string; advanced?: string }> = {
  structuring: { primary: 'logic-01', advanced: 'logic-02' },
  reasoning:   { primary: 'logic-02', advanced: 'philosophy-01' },
  critical:    { primary: 'critical-01', advanced: 'critical-02' },
  hypothesis:  { primary: 'hypothesis-01', advanced: 'problem-01' },
  business:    { primary: 'numeracy-01', advanced: 'fermi-01' },
}

const AXIS_LESSON_MAP: Record<SkillAxis, number[]> = {
  structuring: [20, 21, 23],   // MECE / ロジックツリー / ピラミッド
  reasoning:   [25, 26, 27],   // 演繹 / 帰納 / 形式論理
  critical:    [40, 41, 71],   // クリティカル入門 / 誤謬 / 因果
  hypothesis:  [50, 53, 54],   // 仮説 / 課題設定 / イシュー
  business:    [22, 200, 401], // So What / フェルミ / 数字に強くなる
}

export function recommendCourses(axisScores: AxisScore[], deviation: number): string[] {
  // 弱い順
  const sorted = [...axisScores].sort((a, b) => a.level - b.level)
  const weakest = sorted[0]
  const second = sorted[1]
  const set = new Set<string>()

  // 1. 一番弱い軸のコースを推薦
  if (weakest) {
    set.add(AXIS_COURSE_MAP[weakest.axis].primary)
  }
  // 2. 全体レベルに応じて2件目
  if (deviation >= 60) {
    // 上級: 応用コース
    set.add('case-01')
    set.add('strategy-01')
  } else if (deviation >= 50) {
    // 中級: 2番目に弱い軸 or 応用
    if (second) set.add(AXIS_COURSE_MAP[second.axis].advanced ?? AXIS_COURSE_MAP[second.axis].primary)
  } else {
    // 初〜中級: 2番目に弱い軸の基礎
    if (second) set.add(AXIS_COURSE_MAP[second.axis].primary)
  }
  return Array.from(set).slice(0, 3)
}

export function recommendedLessons(devOrAxes: number | AxisScore[]): number[] {
  // 後方互換: 数値が来たら旧ロジック
  if (typeof devOrAxes === 'number') {
    const dev = devOrAxes
    if (dev >= 60) return [27, 24, 26, 25]
    if (dev >= 50) return [25, 26, 23, 24]
    if (dev >= 40) return [22, 23, 25, 26]
    return [20, 21, 22, 23]
  }
  // 軸スコアから弱い順にレッスンを集める
  const sorted = [...devOrAxes].sort((a, b) => a.level - b.level)
  const ids: number[] = []
  for (const a of sorted) {
    for (const id of AXIS_LESSON_MAP[a.axis]) {
      if (!ids.includes(id)) ids.push(id)
      if (ids.length >= 4) break
    }
    if (ids.length >= 4) break
  }
  return ids
}

// ───────────────────────────────────────────────────────────────
// ストレージ
// ───────────────────────────────────────────────────────────────

export function loadPlacementResult(): PlacementResult | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<PlacementResult>
    // 旧データの場合は新フィールドを補完
    return {
      deviation: parsed.deviation ?? 50,
      correctCount: parsed.correctCount ?? 0,
      totalCount: parsed.totalCount ?? 0,
      completedAt: parsed.completedAt ?? new Date().toISOString(),
      recommendedLessonIds: parsed.recommendedLessonIds ?? [],
      axisScores: parsed.axisScores ?? [],
      recommendedCourseIds: parsed.recommendedCourseIds ?? [],
      answers: parsed.answers ?? [],
    }
  } catch {
    return null
  }
}

export function savePlacementResult(r: PlacementResult): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(r))
  if (getSyncUser()) {
    pushPlacement({
      deviation: r.deviation,
      correctCount: r.correctCount,
      totalCount: r.totalCount,
      completedAt: r.completedAt,
      recommendedLessonIds: r.recommendedLessonIds,
    })
  }
}

export function hasCompletedPlacement(): boolean {
  const r = loadPlacementResult()
  return r !== null && r.totalCount > 0
}

export function skipPlacement(): void {
  savePlacementResult({
    deviation: 50,
    correctCount: 0,
    totalCount: 0,
    completedAt: new Date().toISOString(),
    recommendedLessonIds: recommendedLessons(50),
    axisScores: [],
    recommendedCourseIds: [],
    answers: [],
  })
}

export function buildResultFromSession(session: PlacementSession): PlacementResult {
  const axisScores = computeAxisScores(session.answers)
  const deviation = calcDeviation(session.answers)
  const recommendedCourseIds = recommendCourses(axisScores, deviation)
  const correctCount = session.answers.filter(a => a.correct).length
  return {
    deviation,
    correctCount,
    totalCount: session.answers.length,
    completedAt: new Date().toISOString(),
    recommendedLessonIds: recommendedLessons(axisScores),
    axisScores,
    recommendedCourseIds,
    answers: session.answers,
  }
}

// ───────────────────────────────────────────────────────────────
// パーソナルコース（既存レッスンの組み合わせ）
// ───────────────────────────────────────────────────────────────

export type PersonalCourse = {
  id: 'personal'
  title: string
  description: string
  lessonIds: number[]
  axisOrder: SkillAxis[]
  createdAt: string
}

const PERSONAL_COURSE_KEY = 'logic-personal-course'
// パーソナルコース内で使うレッスンIDの拡張プール（弱い軸ごとに3〜5件用意）
const AXIS_LESSON_POOL: Record<SkillAxis, number[]> = {
  structuring: [20, 21, 23, 22, 68],
  reasoning:   [25, 26, 27, 68, 23],
  critical:    [40, 41, 71, 42, 43, 69],
  hypothesis:  [50, 51, 52, 53, 54, 70],
  business:    [200, 201, 401, 400, 89, 90],
}

export function buildPersonalCourse(axisScores: AxisScore[], deviation: number): PersonalCourse {
  const sorted = [...axisScores].sort((a, b) => a.level - b.level)
  const axisOrder = sorted.map(a => a.axis)
  const ids: number[] = []
  // 弱い軸から優先して2レッスンずつ拾う
  for (const a of sorted) {
    let picked = 0
    for (const id of AXIS_LESSON_POOL[a.axis]) {
      if (ids.includes(id)) continue
      ids.push(id)
      picked++
      if (picked >= 2) break
    }
    if (ids.length >= 8) break
  }
  // 8件未満なら他軸から穴埋め
  if (ids.length < 6) {
    for (const a of sorted) {
      for (const id of AXIS_LESSON_POOL[a.axis]) {
        if (ids.includes(id)) continue
        ids.push(id)
        if (ids.length >= 8) break
      }
      if (ids.length >= 8) break
    }
  }
  const limit = Math.min(8, Math.max(5, ids.length))
  const lessonIds = ids.slice(0, limit)
  const weakestLabel = sorted[0] ? axisLabel(sorted[0].axis).label : ''
  const title = weakestLabel
    ? `あなた専用コース：${weakestLabel}を軸に底上げ`
    : 'あなた専用パーソナルコース'
  const description = weakestLabel
    ? `診断結果（偏差値${deviation}）に基づき、最も伸びしろのある「${weakestLabel}」から優先的に学べる${lessonIds.length}レッスン構成のあなた専用コースです。`
    : `診断結果（偏差値${deviation}）に基づき、あなたの弱点軸を優先的に補強する${lessonIds.length}レッスン構成のコースです。`
  return {
    id: 'personal',
    title,
    description,
    lessonIds,
    axisOrder,
    createdAt: new Date().toISOString(),
  }
}

export function savePersonalCourse(c: PersonalCourse): void {
  try {
    localStorage.setItem(PERSONAL_COURSE_KEY, JSON.stringify(c))
  } catch { /* silent */ }
}

export function loadPersonalCourse(): PersonalCourse | null {
  try {
    const raw = localStorage.getItem(PERSONAL_COURSE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<PersonalCourse>
    if (!parsed.lessonIds || !Array.isArray(parsed.lessonIds)) return null
    return {
      id: 'personal',
      title: parsed.title ?? 'あなた専用パーソナルコース',
      description: parsed.description ?? '',
      lessonIds: parsed.lessonIds,
      axisOrder: parsed.axisOrder ?? [],
      createdAt: parsed.createdAt ?? new Date().toISOString(),
    }
  } catch {
    return null
  }
}

export function clearPersonalCourse(): void {
  try { localStorage.removeItem(PERSONAL_COURSE_KEY) } catch { /* silent */ }
}
