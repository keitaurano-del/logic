// courseData.ts — コース定義（1コース = 5レッスン）

export type CourseGroupId =
  | 'foundations'    // 思考の基礎
  | 'problem-solving'// 課題発見・解決
  | 'creative'       // 発想・創造
  | 'communication'  // 伝える・提案する
  | 'business'       // ビジネス実践

export type Course = {
  id: string
  title: string           // Doingタイトル
  category: string        // カテゴリ（大分類）
  group: CourseGroupId    // コース一覧でのグルーピング
  lessonIds: number[]     // 5件のレッスンID
  level: '初級' | '中級' | '上級'
  description: string
  image?: string          // コース固有の画像（省略時はカテゴリの画像にフォールバック）
}

export type CourseGroup = {
  id: CourseGroupId
  label: string
  description: string
}

export const COURSE_GROUPS: CourseGroup[] = [
  { id: 'foundations',     label: '論理的に考える',  description: '論理・批判・哲学で土台を固める' },
  { id: 'problem-solving', label: '課題を解決する',  description: '仮説と構造で本質に迫る' },
  { id: 'creative',        label: '発想を広げる',    description: '常識を超えて、新しい切り口を生む' },
  { id: 'communication',   label: '相手を動かす',    description: '提案・面接・ヒアリングで論理を届ける' },
  { id: 'business',        label: '現場で実践する',  description: '戦略・数字・クライアント実務に活かす' },
]

export const COURSES: Course[] = [
  // ── ロジカルシンキング ──────────────────────────────
  {
    id: 'logic-01',
    title: 'ロジカルに考えて、整理する',
    category: 'ロジカルシンキング',
    group: 'foundations',
    lessonIds: [20, 21, 22, 23, 24],
    level: '初級',
    description: 'MECEとロジックツリーで、考えを漏れなく・ダブりなく整理する力を身につける。',
  },
  {
    id: 'logic-02',
    title: '論理を組み立て、相手を動かす',
    category: 'ロジカルシンキング',
    group: 'foundations',
    lessonIds: [25, 26, 27, 68, 23],
    level: '初級',
    description: 'So What / Why Soで論理を検証し、ピラミッド構造で伝わる話し方を習得する。',
    image: '/images/v3/course-logic-02.svg',
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
  },
  {
    id: 'critical-02',
    title: 'バイアスを外し、客観的に見る',
    category: 'クリティカルシンキング',
    group: 'foundations',
    lessonIds: [71, 300, 301, 302, 303],
    level: '中級',
    description: '確証バイアスをはじめとした認知の歪みを理解し、より精度の高い判断をする。',
    image: '/images/v3/course-critical-02.svg',
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
    image: '/images/v3/course-eastern-01.svg',
  },
  {
    id: 'eastern-02',
    title: '古代中国思想で、戦略と決断を見る',
    category: '東洋思想',
    group: 'foundations',
    lessonIds: [355, 356, 357, 358, 359],
    level: '上級',
    description: '老子・荘子・韓非子・孫子を通じ、無為・しなやかさ・視点・仕組み・戦わずして勝つ戦略を学ぶ。',
    image: '/images/v3/course-eastern-02.svg',
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
  },

  // ── 提案書作成 ──────────────────────────────────────
  {
    id: 'proposal-course-01',
    title: '仮説と検証で、提案書を仕上げる',
    category: '提案書作成',
    group: 'communication',
    lessonIds: [82, 83, 84, 86, 87],
    level: '上級',
    description: 'コンサル的アプローチで仮説を立て、検証しながら説得力のある提案書を完成させる。',
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
  },
  {
    id: 'client-02',
    title: '論点を定め、深く引き出す',
    category: 'クライアントワーク',
    group: 'communication',
    lessonIds: [93, 94, 95, 96, 315],
    level: '中級',
    description: '正しい論点設定とヒアリング技術で、クライアントの本質的な課題を引き出す。',
    image: '/images/v3/course-client-02.svg',
  },
  {
    id: 'client-03',
    title: '未経験の業界で、短期間で立ち上がる',
    category: 'クライアントワーク',
    group: 'business',
    lessonIds: [330, 331, 332, 333, 334, 335],
    level: '上級',
    description: '本・事例・有識者・仮説を総動員し、新しい案件で「専門家」として価値発揮するキャッチアップの技術を学ぶ。',
    image: '/images/v3/course-client-03.svg',
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
  },
  {
    id: 'strategy-02',
    title: '資源・能力・共進化の戦略へ',
    category: '経営戦略',
    group: 'business',
    lessonIds: [325, 326, 327, 328, 329],
    level: '上級',
    description: 'RBV・コアコンピタンスからブルーオーシャン、ダイナミック・ケイパビリティ、プラットフォーム戦略まで現代の進化を学ぶ。',
    image: '/images/v3/course-strategy-02.svg',
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
    image: '/images/v3/course-numeracy.svg',
  },
]

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
