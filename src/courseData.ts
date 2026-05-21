// courseData.ts — コース定義（1コース = 5レッスン）
//
// title / description / グループ label / description は ja / en の両言語版を持ち、
// 起動時の getLocale() に応じて COURSE_GROUPS / COURSES として export する。
//
// category と level は内部識別子（日本語）として保持。表示時は呼び出し側で
// CATEGORY_TO_KEY / levelLabel() 等のマッピングを通して t() で翻訳する。

import { getLocale } from './i18n'

export type CourseGroupId =
  | 'foundations'    // 思考の基礎
  | 'problem-solving'// 課題発見・解決
  | 'creative'       // 発想・創造
  | 'communication'  // 伝える・提案する
  | 'business'       // ビジネス実践
  | 'career'         // 就職・転職

export type Course = {
  id: string
  title: string           // Doingタイトル
  category: string        // カテゴリ（大分類）— 内部識別子（日本語固定）
  group: CourseGroupId    // コース一覧でのグルーピング
  lessonIds: number[]     // コース内のレッスンID（5〜7件）
  level: '初級' | '中級' | '上級'
  description: string
  image?: string          // コース固有の画像（省略時はカテゴリの画像にフォールバック）
}

export type CourseGroup = {
  id: CourseGroupId
  label: string
  description: string
}

const COURSE_GROUPS_JA: CourseGroup[] = [
  { id: 'foundations',     label: '論理的に考える',  description: '論理・批判・哲学で土台を固める' },
  { id: 'problem-solving', label: '課題を解決する',  description: '仮説と構造で本質に迫る' },
  { id: 'creative',        label: '発想を広げる',    description: '常識を超えて、新しい切り口を生む' },
  { id: 'communication',   label: '相手を動かす',    description: '提案・面接・ヒアリングで論理を届ける' },
  { id: 'business',        label: '現場で実践する',  description: '戦略・数字・クライアント実務に活かす' },
  { id: 'career',          label: 'キャリアを築く',  description: '履歴書・適性検査・面接・給与交渉で内定を勝ち取る' },
]

const COURSE_GROUPS_EN: CourseGroup[] = [
  { id: 'foundations',     label: 'Think Logically',       description: 'Build foundations with logic, criticism, and philosophy' },
  { id: 'problem-solving', label: 'Solve Problems',        description: 'Use hypotheses and structure to reach the essence' },
  { id: 'creative',        label: 'Expand Your Thinking',  description: 'Go beyond convention to create new angles' },
  { id: 'communication',   label: 'Move People',           description: 'Deliver logic through proposals, interviews, and listening' },
  { id: 'business',        label: 'Apply in Practice',     description: 'Strategy, numbers, and client work in the real world' },
  { id: 'career',          label: 'Build Your Career',     description: 'Resumes, aptitude tests, interviews, and salary negotiation — land the offer' },
]

const COURSES_JA: Course[] = [
  // ── ロジカルシンキング ──────────────────────────────
  {
    id: 'logic-01',
    title: 'ロジカルに考えて、整理する',
    category: 'ロジカルシンキング',
    group: 'foundations',
    lessonIds: [20, 21, 22, 23, 24],
    level: '初級',
    description: 'MECEとロジックツリーで、考えを漏れなく・ダブりなく整理する力を身につける。',
    image: '/images/v3/course-logic-01.png',
  },
  {
    id: 'logic-02',
    title: '論理を組み立て、相手を動かす',
    category: 'ロジカルシンキング',
    group: 'foundations',
    lessonIds: [25, 26, 27, 68, 23],
    level: '初級',
    description: 'So What / Why Soで論理を検証し、ピラミッド構造で伝わる話し方を習得する。',
    image: '/images/v3/course-logic-02.png',
  },

  // ── クリティカルシンキング ──────────────────────────
  {
    id: 'critical-01',
    title: '思い込みを疑い、正しく判断する',
    category: 'クリティカルシンキング',
    group: 'foundations',
    lessonIds: [40, 41, 42, 43, 69],
    level: '初級',
    description: '批判的思考の基礎から論理的誤謬の見破り方まで、判断力を鍛える。',
    image: '/images/v3/course-critical-01.png',
  },
  {
    id: 'critical-02',
    title: 'バイアスを外し、客観的に見る',
    category: 'クリティカルシンキング',
    group: 'foundations',
    lessonIds: [71, 300, 301, 302, 303],
    level: '中級',
    description: '確証バイアスをはじめとした認知の歪みを理解し、より精度の高い判断をする。',
    image: '/images/v3/course-critical-02.png',
  },

  // ── 仮説思考 ────────────────────────────────────────
  {
    id: 'hypothesis-01',
    title: '仮説を立ててから、調べる',
    category: '仮説思考',
    group: 'problem-solving',
    lessonIds: [50, 51, 52, 70, 304],
    level: '中級',
    description: '仮説を先に立て、検証で磨く思考サイクルを身につける。',
    image: '/images/v3/course-hypothesis-01.png',
  },

  // ── 課題設定 ────────────────────────────────────────
  {
    id: 'problem-01',
    title: '本当の問題を見極め、定義する',
    category: '課題設定',
    group: 'problem-solving',
    lessonIds: [53, 54, 55, 305, 306],
    level: '中級',
    description: '問題と課題の違いを理解し、本質的な問いを設定する力を養う。',
    image: '/images/v3/course-problem-01.png',
  },

  // ── 論点設定 ────────────────────────────────────────
  {
    id: 'issue-01',
    title: '論点を洗い出し、論理で答えに迫る',
    category: '論点設定',
    group: 'business',
    lessonIds: [500, 501, 502, 503, 504, 505, 506],
    level: '中級',
    description: '経験のないテーマでも、論点を網羅的に洗い出し、構造化し、数字と論理で裏取りしながら、解釈を積み上げて本質に到達する思考プロセスを身につける。',
    image: '/images/v3/course-issue-01.png',
  },

  // ── デザインシンキング ──────────────────────────────
  {
    id: 'design-01',
    title: 'ユーザーの本音を掘り下げ、解決する',
    category: 'デザインシンキング',
    group: 'problem-solving',
    lessonIds: [56, 57, 58, 307, 308],
    level: '初級',
    description: '共感からプロトタイプまで、人間中心設計の思考プロセスを実践する。',
    image: '/images/v3/course-design-01.png',
  },

  // ── システムシンキング ──────────────────────────────
  {
    id: 'systems-01',
    title: '全体を俯瞰し、根本から変える',
    category: 'システムシンキング',
    group: 'problem-solving',
    lessonIds: [65, 66, 67, 313, 314],
    level: '上級',
    description: 'フィードバックループと氷山モデルで、問題の根本原因を構造的に捉える。',
    image: '/images/v3/course-systems-01.png',
  },

  // ── なぜなぜ分析 ────────────────────────────────────
  {
    id: 'whywhy-01',
    title: 'なぜなぜ分析で根本原因にたどり着く',
    category: 'なぜなぜ分析',
    group: 'problem-solving',
    lessonIds: [340, 341, 342, 343, 344, 345, 346],
    level: '中級',
    description: '対症療法ではなく根本原因まで掘り下げる思考技術。トヨタ式の古典から、人を責めない・飛躍しない・反証可能の原則まで体系的に学ぶ。',
    image: '/images/v3/course-whywhy-01.png',
  },

  // ── ラテラルシンキング ──────────────────────────────
  {
    id: 'lateral-01',
    title: '常識を疑い、突破口を開く',
    category: 'ラテラルシンキング',
    group: 'creative',
    lessonIds: [59, 60, 61, 309, 310],
    level: '中級',
    description: 'リフレーミングと逆転の発想で、固定観念を超えたアイデアを生み出す。',
    image: '/images/v3/course-lateral-01.png',
  },

  // ── アナロジー思考 ──────────────────────────────────
  {
    id: 'analogy-01',
    title: '別分野の知恵を借りて、応用する',
    category: 'アナロジー思考',
    group: 'creative',
    lessonIds: [62, 63, 64, 311, 312],
    level: '中級',
    description: '構造的類似性を見抜き、異分野の知見を自分の課題に応用する。',
    image: '/images/v3/course-analogy-01.png',
  },

  // ── 哲学 ────────────────────────────────────────────
  {
    id: 'philosophy-01',
    title: '哲学の問いで、思考を深める',
    category: '哲学・思考の原理',
    group: 'foundations',
    lessonIds: [77, 78, 79, 80, 81],
    level: '上級',
    description: 'ソクラテスの問答法と反証可能性を通じて、思考の原理を学ぶ。',
    image: '/images/v3/course-philosophy-01.png',
  },

  // ── 東洋思想 ────────────────────────────────────────
  {
    id: 'eastern-01',
    title: '古代中国思想で、人と組織を見る',
    category: '東洋思想',
    group: 'foundations',
    lessonIds: [350, 351, 352, 353, 354],
    level: '上級',
    description: '孔子・孟子・荀子・墨子を通じ、関係性・定義・人間観・制度設計の原理を学ぶ。',
    image: '/images/v3/course-eastern-01.png',
  },
  {
    id: 'eastern-02',
    title: '古代中国思想で、戦略と決断を見る',
    category: '東洋思想',
    group: 'foundations',
    lessonIds: [355, 356, 357, 358, 359],
    level: '上級',
    description: '老子・荘子・韓非子・孫子を通じ、無為・しなやかさ・視点・仕組み・戦わずして勝つ戦略を学ぶ。',
    image: '/images/v3/course-eastern-02.png',
  },

  // ── 提案・伝える技術 ────────────────────────────────
  {
    id: 'proposal-01',
    title: '相手が動く提案をつくる',
    category: '提案・伝える技術',
    group: 'communication',
    lessonIds: [72, 73, 74, 75, 76],
    level: '中級',
    description: '読み手の判断基準から逆算し、決断を引き出す提案書の構造を習得する。',
    image: '/images/v3/course-proposal-01.png',
  },

  // ── 提案書作成 ──────────────────────────────────────
  {
    id: 'proposal-course-01',
    title: '仮説と検証で、提案書を仕上げる',
    category: '提案書作成',
    group: 'communication',
    lessonIds: [82, 83, 84, 85, 86, 87, 88],
    level: '上級',
    description: 'コンサル的アプローチで仮説を立て、検証しながら説得力のある提案書を完成させる。',
    image: '/images/v3/course-proposal-course-01.png',
  },

  // ── クライアントワーク ──────────────────────────────
  {
    id: 'client-01',
    title: '数字で状況を素早く読み解く',
    category: 'クライアントワーク',
    group: 'business',
    lessonIds: [89, 90, 91, 92, 97],
    level: '中級',
    description: '桁感覚と概算力を鍛え、クライアントの場でも即座に数字を扱えるようになる。',
    image: '/images/v3/course-client-01.png',
  },
  {
    id: 'client-02',
    title: '論点を定め、深く引き出す',
    category: 'クライアントワーク',
    group: 'communication',
    lessonIds: [93, 94, 95, 96, 315],
    level: '中級',
    description: '正しい論点設定とヒアリング技術で、クライアントの本質的な課題を引き出す。',
    image: '/images/v3/course-client-02.png',
  },
  {
    id: 'client-03',
    title: '未経験の業界で、短期間で立ち上がる',
    category: 'クライアントワーク',
    group: 'business',
    lessonIds: [330, 331, 332, 333, 334, 335],
    level: '上級',
    description: '本・事例・有識者・仮説を総動員し、新しい案件で「専門家」として価値発揮するキャッチアップの技術を学ぶ。',
    image: '/images/v3/course-client-03.png',
  },
  {
    id: 'client-04',
    title: 'フィードバックを次の一歩に変える',
    category: 'クライアントワーク',
    group: 'communication',
    lessonIds: [336, 337, 338, 339],
    level: '中級',
    description: '上司やマネージャーから「考えが浅い」「分析が甘い」「示唆が弱い」と言われたとき、その場で何を聞き、どう次のアクションに繋げるかを実戦ケースで学ぶ。',
    image: '/images/v3/course-client-04.png',
  },

  // ── ケース面接 ──────────────────────────────────────
  {
    id: 'case-01',
    title: 'ケース面接で、論理力を証明する',
    category: 'ケース面接',
    group: 'communication',
    lessonIds: [28, 29, 35, 36, 316],
    level: '上級',
    description: '利益構造の分解から市場参入まで、ケース面接の頻出テーマを体系的に攻略する。',
    image: '/images/v3/course-case-01.png',
  },

  // ── 経営戦略 ────────────────────────────────────────
  {
    id: 'strategy-01',
    title: '戦略の源流と競争戦略を学ぶ',
    category: '経営戦略',
    group: 'business',
    lessonIds: [320, 321, 322, 323, 324],
    level: '上級',
    description: 'テイラー・フォードからアンゾフ、PPM、ポーターまで。経営戦略の古典理論を通史的に押さえる。',
    image: '/images/v3/course-strategy-01.png',
  },
  {
    id: 'strategy-02',
    title: '資源・能力・共進化の戦略へ',
    category: '経営戦略',
    group: 'business',
    lessonIds: [325, 326, 327, 328, 329],
    level: '上級',
    description: 'RBV・コアコンピタンスからブルーオーシャン、ダイナミック・ケイパビリティ、プラットフォーム戦略まで現代の進化を学ぶ。',
    image: '/images/v3/course-strategy-02.png',
  },

  // ── フェルミ推定 ────────────────────────────────────
  {
    id: 'fermi-01',
    title: '概算で、世界の規模を掴む',
    category: 'フェルミ推定',
    group: 'business',
    lessonIds: [200, 201, 202, 203, 204],
    level: '中級',
    description: '数式を立てて分解し、正確さより「だいたい正しい」答えを素早く出す力を鍛える。',
    image: '/images/v3/course-fermi-01.png',
  },

  // ── 数字に強くなる ──────────────────────────────────
  {
    id: 'numeracy-01',
    title: '数字に強くなる',
    category: '数字に強くなる',
    group: 'business',
    lessonIds: [401, 400, 402, 403, 404, 405, 406],
    level: '中級',
    description: '伝え方・暗算・割合操作・単位換算・複利・統計・落とし穴の7本立てで、ビジネス数字感覚を体系的に鍛える。',
    image: '/images/v3/course-numeracy-01.png',
  },

  // ── ピークパフォーマンス習慣 ────────────────────────
  {
    id: 'peak-performance-01',
    title: '自分史上最高のパフォーマンスで働く',
    category: 'ピークパフォーマンス習慣',
    group: 'business',
    lessonIds: [410, 411, 412, 413, 414],
    level: '初級',
    description: 'クロノタイプ・睡眠・運動・集中の波・自己計測の5レッスンで、自分の体に合った最高の働き方を設計する。',
    image: '/images/v3/course-peak-performance-01.png',
  },

  // ── 履歴書・職務経歴書 ──────────────────────────────
  {
    id: 'career-resume-01',
    title: '通る職務経歴書を書く',
    category: '履歴書・職務経歴書',
    group: 'career',
    lessonIds: [600, 601, 602, 603, 604, 605, 606],
    level: '初級',
    description: '採用担当の頭の中・STAR法・定量化・志望動機の3層構造・ATS通過まで、書類選考を突破する実践技術を学ぶ。',
    image: '/images/v3/course-career-resume-01.png',
  },

  // ── SPI対策 ─────────────────────────────────────────
  {
    id: 'career-spi-01',
    title: 'SPIを最短で攻略する',
    category: 'SPI対策',
    group: 'career',
    lessonIds: [610, 611, 612, 613, 614, 615, 616],
    level: '中級',
    description: '言語・非言語の出題パターンを型で押さえ、損益算・推論・順列組合せまで頻出問題を体系的に攻略する。',
    image: '/images/v3/course-career-spi-01.png',
  },

  // ── 玉手箱対策 ──────────────────────────────────────
  {
    id: 'career-tamatebako-01',
    title: '玉手箱を時間内に解き切る',
    category: '玉手箱対策',
    group: 'career',
    lessonIds: [620, 621, 622, 623, 624, 625],
    level: '中級',
    description: '四則逆算・図表読み取り・表の空欄推測など、玉手箱特有の出題形式と電卓スピードの作り方を学ぶ。',
    image: '/images/v3/course-career-tamatebako-01.png',
  },

  // ── 面接対策 ────────────────────────────────────────
  {
    id: 'career-interview-01',
    title: '面接で内定を引き寄せる',
    category: '面接対策',
    group: 'career',
    lessonIds: [630, 631, 632, 633, 634, 635, 636, 637],
    level: '中級',
    description: '構造化面接の評価軸・退職理由・志望動機・逆質問まで、面接官の視点から見た「通る回答」を組み立てる。',
    image: '/images/v3/course-career-interview-01.png',
  },

  // ── 給与交渉・退職実務 ──────────────────────────────
  {
    id: 'career-salary-01',
    title: '給与交渉と円満退社を両立する',
    category: '給与交渉・退職実務',
    group: 'career',
    lessonIds: [640, 641, 642, 643, 644, 645, 646],
    level: '上級',
    description: '市場価値の測り方・オファー面談・給与交渉・退職手続きまで、内定後から入社までの実務を抜け漏れなく押さえる。',
    image: '/images/v3/course-career-salary-01.png',
  },

  // ── 認知科学 ────────────────────────────────────────
  {
    id: 'cognitive-01',
    title: 'ワーキングメモリを使いこなす',
    category: '認知科学',
    group: 'foundations',
    lessonIds: [700, 701, 702, 703, 704],
    level: '中級',
    description: '脳の作業机に乗る情報量の限界を知り、チャンキング・認知負荷・外部記憶・マルチタスクを科学的に整理する。',
    image: '/images/v3/course-cognitive-01.png',
  },
  {
    id: 'cognitive-02',
    title: '認知バイアスを実務で乗りこなす',
    category: '認知科学',
    group: 'foundations',
    lessonIds: [710, 711, 712, 713, 714],
    level: '中級',
    description: '利用可能性・ハロー・後知恵・ダニング/クルーガー・結果バイアスの 5 大バイアスを使いこなして判断の精度を上げる。',
    image: '/images/v3/course-cognitive-02.png',
  },
]

// 英訳: id / category / group / lessonIds / level / image は ja と完全に同じ。
// title / description のみ英訳。id をキーに ja → en にマッピングする。
const COURSE_EN_OVERRIDES: Record<string, { title: string; description: string }> = {
  'logic-01': {
    title: 'Think Logically and Organize Your Ideas',
    description: 'Master MECE and logic trees to organize your thinking without gaps or overlaps.',
  },
  'logic-02': {
    title: 'Build Logic to Persuade',
    description: 'Use So What / Why So to test your logic, and master the Pyramid structure to communicate clearly.',
  },
  'critical-01': {
    title: 'Challenge Assumptions, Judge Correctly',
    description: 'From the basics of critical thinking to spotting logical fallacies — sharpen your judgment.',
  },
  'critical-02': {
    title: 'Remove Bias, See Objectively',
    description: 'Understand cognitive distortions starting with confirmation bias for more accurate judgment.',
  },
  'hypothesis-01': {
    title: 'Hypothesize First, Then Investigate',
    description: 'Build a hypothesis first, then sharpen it through validation.',
  },
  'problem-01': {
    title: 'Identify and Define the Real Problem',
    description: 'Understand the difference between problems and issues, and develop the ability to set essential questions.',
  },
  'issue-01': {
    title: 'Surface the Issues, Reach the Answer with Logic',
    description: 'Even in unfamiliar territory, master the thinking process — surface issues comprehensively, structure them, validate with numbers and logic, and stack interpretations to reach the essence.',
  },
  'design-01': {
    title: 'Uncover User Needs and Solve',
    description: 'Practice the human-centered design thinking process from empathy to prototype.',
  },
  'systems-01': {
    title: 'See the Whole, Change at the Root',
    description: 'Use feedback loops and the iceberg model to structurally grasp root causes.',
  },
  'whywhy-01': {
    title: 'Reach Root Causes with the 5 Whys',
    description: 'Dig down to root causes instead of treating symptoms. Learn the Toyota classic with principles like no-blame, no-leaps, and falsifiability.',
  },
  'lateral-01': {
    title: 'Challenge the Obvious, Find Breakthroughs',
    description: 'Use reframing and reverse thinking to generate ideas beyond fixed assumptions.',
  },
  'analogy-01': {
    title: 'Borrow Wisdom from Other Fields',
    description: 'Spot structural similarities and apply insights from other domains to your own challenges.',
  },
  'philosophy-01': {
    title: 'Deepen Thinking with Philosophical Questions',
    description: 'Learn the principles of thinking through Socratic dialogue and falsifiability.',
  },
  'eastern-01': {
    title: 'See People and Organizations through Ancient Chinese Thought',
    description: 'Learn principles of relationships, definitions, human nature, and system design through Confucius, Mencius, Xunzi, and Mozi.',
  },
  'eastern-02': {
    title: 'See Strategy and Decisions through Ancient Chinese Thought',
    description: 'Learn wu wei, suppleness, perspective, systems, and winning without fighting through Laozi, Zhuangzi, Han Feizi, and Sun Tzu.',
  },
  'proposal-01': {
    title: 'Craft Proposals That Move People',
    description: "Work backward from the reader's decision criteria to master the structure that drives action.",
  },
  'proposal-course-01': {
    title: 'Finish Proposals with Hypothesis and Validation',
    description: "Take a consultant's approach: hypothesize, validate, and complete a compelling proposal.",
  },
  'client-01': {
    title: 'Read Situations Quickly with Numbers',
    description: 'Train your sense of scale and estimation so you can handle numbers fluently in client settings.',
  },
  'client-02': {
    title: 'Set the Right Issues, Listen Deeply',
    description: "Use sharp issue-setting and listening techniques to surface clients' real challenges.",
  },
  'client-03': {
    title: 'Ramp Up Fast in an Unfamiliar Industry',
    description: 'Use books, cases, experts, and hypotheses to deliver value as an "expert" on new engagements.',
  },
  'client-04': {
    title: 'Turn Feedback into the Next Step',
    description: 'When a manager says "your thinking is shallow," "your analysis is weak," or "your implications are thin" — learn what to ask and how to convert it into action through real cases.',
  },
  'case-01': {
    title: 'Prove Your Logic in Case Interviews',
    description: 'Systematically tackle frequent case interview themes from profit structure to market entry.',
  },
  'strategy-01': {
    title: 'Learn the Origins and Competitive Strategy',
    description: 'From Taylor and Ford to Ansoff, PPM, and Porter — cover the classics of strategy chronologically.',
  },
  'strategy-02': {
    title: 'Resources, Capabilities, and Co-evolution',
    description: 'From RBV and core competencies to Blue Ocean, dynamic capabilities, and platform strategy — learn modern strategy evolution.',
  },
  'fermi-01': {
    title: "Grasp the World's Scale with Estimation",
    description: 'Build equations, decompose, and produce "roughly right" answers quickly — accuracy comes second.',
  },
  'numeracy-01': {
    title: 'Get Strong with Numbers',
    description: 'Seven lessons — presentation, mental math, ratios, unit conversion, compounding, statistics, and pitfalls — to systematically build business numeracy.',
  },
  'peak-performance-01': {
    title: 'Work at Your Peak Performance',
    description: 'Five lessons on chronotype, sleep, exercise, focus rhythms, and self-tracking — design your best-fit way of working.',
  },
  'career-resume-01': {
    title: 'Write a Resume That Gets Through',
    description: 'Master the recruiter mindset, STAR method, quantification, three-layer motivation, and ATS — pass the document screen.',
  },
  'career-spi-01': {
    title: 'Crack the SPI Aptitude Test',
    description: 'Lock in verbal and non-verbal patterns — profit-loss, inference, permutations, and combinations — by mastering the templates.',
  },
  'career-tamatebako-01': {
    title: 'Finish the Tamatebako in Time',
    description: 'Learn the four-arithmetic reverse, chart reading, and missing-cell inference unique to Tamatebako — plus how to build calculator speed.',
  },
  'career-interview-01': {
    title: 'Win the Interview',
    description: 'From structured-interview rubrics to exit reasons, motivation, and reverse questions — craft answers from the interviewer\'s point of view.',
  },
  'career-salary-01': {
    title: 'Negotiate Salary and Exit Gracefully',
    description: 'Market value, offer meetings, salary negotiation, and resignation — cover the practical work from offer to start date.',
  },
  'cognitive-01': {
    title: 'Master Your Working Memory',
    description: 'Learn the brain\'s working desk limits and apply chunking, cognitive load, external memory, and the multitasking myth scientifically.',
  },
  'cognitive-02': {
    title: 'Wield Cognitive Biases at Work',
    description: 'Use the five workplace biases — availability, halo, hindsight, Dunning-Kruger, and outcome — to sharpen your decision quality.',
  },
}

const COURSES_EN: Course[] = COURSES_JA.map(c => {
  const en = COURSE_EN_OVERRIDES[c.id]
  return en ? { ...c, title: en.title, description: en.description } : c
})

// 起動時の locale で決定（setLocale は window.location.reload を呼ぶので再評価される）
export const COURSE_GROUPS: CourseGroup[] = getLocale() === 'en' ? COURSE_GROUPS_EN : COURSE_GROUPS_JA
export const COURSES: Course[] = getLocale() === 'en' ? COURSES_EN : COURSES_JA

// カテゴリ別コース一覧
export function getCoursesByCategory(category: string): Course[] {
  return COURSES.filter(c => c.category === category)
}

// 全カテゴリ一覧（重複なし・順序保持）
export function getAllCategories(): string[] {
  return [...new Set(COURSES.map(c => c.category))]
}

// グループ別コース一覧
export function getCoursesByGroup(group: CourseGroupId): Course[] {
  return COURSES.filter(c => c.group === group)
}

export function getCourseById(id: string): Course | undefined {
  return COURSES.find(c => c.id === id)
}
