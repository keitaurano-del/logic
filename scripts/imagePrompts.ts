/**
 * コース／レッスン画像生成のプロンプト定義（単一の真実情報源）
 *
 * このモジュールは以下から参照される:
 * - scripts/generate-course-images.ts  (Gemini API で自動生成)
 * - scripts/wire-images.ts             (生成済 PNG を courseData/lessonSlides に紐付け)
 * - scripts/print-prompts-md.ts        (docs/IMAGE_GENERATION.md を自動生成)
 *
 * すべてのプロンプトには共通スタイル (STYLE_SUFFIX) が付与される。
 */

// ────────────────────────────────────────────────────────────────────────────
// 共通スタイル
// ────────────────────────────────────────────────────────────────────────────
export const STYLE_SUFFIX =
  '3D isometric illustration, clean modern minimalist style, ' +
  'deep navy blue gradient background (#101729 to #1F2942), ' +
  'subtle warm golden glow accent in upper area, ' +
  'soft pastel highlights, professional educational app thumbnail, ' +
  'centered composition, cinematic lighting, octane render style, ' +
  'no text, no captions, no watermarks, no logos, no letters, no numbers'

// ────────────────────────────────────────────────────────────────────────────
// 型
// ────────────────────────────────────────────────────────────────────────────
export type ImagePromptEntry = {
  id: string // 'logic-01' (course) または '20' (lesson)
  title: string // 表示タイトル（ドキュメント用）
  prompt: string // プロンプト本体（STYLE_SUFFIX 抜き）
  filename: string // 保存ファイル名 (e.g. 'course-logic-01.png')
}

// ────────────────────────────────────────────────────────────────────────────
// コース (24件)
// ────────────────────────────────────────────────────────────────────────────
export const COURSE_PROMPTS: ImagePromptEntry[] = [
  // 思考の基礎
  {
    id: 'logic-01',
    title: 'ロジカルに考えて、整理する',
    prompt:
      'four colorful 3D isometric cubes arranged in a 2x2 grid (red, blue, gold, green) representing MECE classification, with a separate floating isometric tree of connected cube nodes branching outward like a logic tree, subtle floating papers with checkmarks',
    filename: 'course-logic-01.png',
  },
  {
    id: 'logic-02',
    title: '論理を組み立て、相手を動かす',
    prompt:
      'a 3D isometric three-tier pyramid built from stacked cubes, with bidirectional vertical arrows on the side representing So What going up and Why So going down, a small figure presenting the pyramid to an audience',
    filename: 'course-logic-02.png',
  },
  {
    id: 'critical-01',
    title: '思い込みを疑い、正しく判断する',
    prompt:
      'a 3D isometric scene of a giant magnifying glass examining a floating document, with question marks transforming into green checkmarks, broken chain links representing logical fallacies floating around',
    filename: 'course-critical-01.png',
  },
  {
    id: 'critical-02',
    title: 'バイアスを外し、客観的に見る',
    prompt:
      'a 3D isometric translucent human brain with several glass filter panels being lifted away, releasing colored prismatic fragments representing cognitive biases drifting off',
    filename: 'course-critical-02.png',
  },
  // 課題発見・解決
  {
    id: 'hypothesis-01',
    title: '仮説を立ててから、調べる',
    prompt:
      'a 3D isometric scene with a floating hypothesis card connected by an arrow loop to a laboratory beaker and a magnifying glass, representing hypothesis-then-verify cycle',
    filename: 'course-hypothesis-01.png',
  },
  {
    id: 'problem-01',
    title: '本当の問題を見極め、定義する',
    prompt:
      'a 3D isometric iceberg cut in half showing a small visible tip above the water and a massive submerged base with glowing root cause spheres inside, target marker on the deep core',
    filename: 'course-problem-01.png',
  },
  {
    id: 'design-01',
    title: 'ユーザーの本音を掘り下げ、解決する',
    prompt:
      'a 3D isometric central persona figure surrounded by an empathy map split into four quadrants on the floor, sticky notes floating, prototype paper shapes, journey path lines',
    filename: 'course-design-01.png',
  },
  {
    id: 'systems-01',
    title: '全体を俯瞰し、根本から変える',
    prompt:
      'a 3D isometric circular feedback loop diagram with connected nodes, large circular arrow flowing through them, an iceberg model integrated below the loop',
    filename: 'course-systems-01.png',
  },
  // 発想・創造
  {
    id: 'lateral-01',
    title: '常識を疑い、突破口を開く',
    prompt:
      'a 3D isometric glowing lightbulb breaking out of a cube box, with sideways arrows pointing in unconventional directions, prism splitting white light into colors',
    filename: 'course-lateral-01.png',
  },
  {
    id: 'analogy-01',
    title: '別分野の知恵を借りて、応用する',
    prompt:
      'a 3D isometric bridge connecting two distinct floating islands - left island shaped like a tree of nature, right island shaped like a business chart - with a glowing lightbulb hovering above the bridge',
    filename: 'course-analogy-01.png',
  },
  {
    id: 'philosophy-01',
    title: '哲学の問いで、思考を深める',
    prompt:
      'a 3D isometric ancient Greek stone column with a contemplative thinker silhouette sitting beside it, an open scroll, abstract thought clouds with question marks above',
    filename: 'course-philosophy-01.png',
  },
  {
    id: 'eastern-01',
    title: '古代中国思想で、人と組織を見る',
    prompt:
      'a 3D isometric Chinese pavilion roof with a wise sage figure seated inside, traditional scrolls, glowing networked relationship lines connecting smaller figures around it, soft mist',
    filename: 'course-eastern-01.png',
  },
  {
    id: 'eastern-02',
    title: '古代中国思想で、戦略と決断を見る',
    prompt:
      'a 3D isometric bamboo grove garden with a floating yin-yang symbol, abstract tao-flow lines like flowing water around stones, strategy chess pieces on a low platform',
    filename: 'course-eastern-02.png',
  },
  // 伝える・提案する
  {
    id: 'proposal-01',
    title: '相手が動く提案をつくる',
    prompt:
      'a 3D isometric professional document with a small presenter figure beside it, golden impact arrows radiating from the document toward a small target, audience silhouettes in front',
    filename: 'course-proposal-01.png',
  },
  {
    id: 'proposal-course-01',
    title: '仮説と検証で、提案書を仕上げる',
    prompt:
      'a 3D isometric workflow from a small hypothesis card on the left to a polished bound proposal document on the right, with checkmark verification steps in between',
    filename: 'course-proposal-course-01.png',
  },
  {
    id: 'client-01',
    title: '数字で状況を素早く読み解く',
    prompt:
      'a 3D isometric floating spreadsheet panel with bar charts and large numerical figures, a calculator, a business person reading the data with a confident posture',
    filename: 'course-client-01.png',
  },
  {
    id: 'client-02',
    title: '論点を定め、深く引き出す',
    prompt:
      'a 3D isometric scene with two figures across a small table, one extracting information through a glowing question stream, structured cards organizing the answers',
    filename: 'course-client-02.png',
  },
  {
    id: 'client-03',
    title: '未経験の業界で、短期間で立ち上がる',
    prompt:
      'a 3D isometric figure climbing a steeply rising learning curve graph, stacked books on the path, expert silhouettes guiding from above',
    filename: 'course-client-03.png',
  },
  // ビジネス実践
  {
    id: 'case-01',
    title: 'ケース面接で、論理力を証明する',
    prompt:
      'a 3D isometric profit equation tree splitting into revenue and cost branches with sub-cubes, a small interview chair scene, structured framework boards',
    filename: 'course-case-01.png',
  },
  {
    id: 'strategy-01',
    title: '戦略の源流と競争戦略を学ぶ',
    prompt:
      'a 3D isometric vintage industrial factory with conveyor belts on a circular platform, surrounded by five large arrows pointing inward representing five forces, a classic strategy book',
    filename: 'course-strategy-01.png',
  },
  {
    id: 'strategy-02',
    title: '資源・能力・共進化の戦略へ',
    prompt:
      'a 3D isometric calm blue ocean with a small sailing ship, glowing resource gems on the seabed, mechanical capability gears interlocking, platform hub with radiating connections',
    filename: 'course-strategy-02.png',
  },
  {
    id: 'fermi-01',
    title: '概算で、世界の規模を掴む',
    prompt:
      'a 3D isometric small earth globe with floating numerical figures around it, calculator, decomposition arrows breaking the globe into smaller cube estimates',
    filename: 'course-fermi-01.png',
  },
  {
    id: 'numeracy-01',
    title: '数字に強くなる',
    prompt:
      'a 3D isometric scene with floating percentage symbol, yen currency sign, bar chart and pie chart, calculator, a person confidently reading numbers, scale balance',
    filename: 'course-numeracy-01.png',
  },
  {
    id: 'peak-performance-01',
    title: '自分史上最高のパフォーマンスで働く',
    prompt:
      'a 3D isometric morning scene with a moon-to-sun cycle arc, an energy graph rising and falling with peaks, an athletic figure stretching, a glowing focus zone marker',
    filename: 'course-peak-performance-01.png',
  },
]

// ────────────────────────────────────────────────────────────────────────────
// レッスン (44件 — 個別画像が割り当てられているもの)
// ────────────────────────────────────────────────────────────────────────────
export const LESSON_PROMPTS: ImagePromptEntry[] = [
  // ロジカルシンキング
  { id: '20', title: 'MECE', prompt: 'a 3D isometric 2x2 grid of four large colored cubes (red, blue, gold, green) showing MECE classification, no overlap no gap', filename: 'lesson-20.png' },
  { id: '21', title: 'ロジックツリー', prompt: 'a 3D isometric tree diagram with a single root cube branching into mid-level cubes and leaf cubes', filename: 'lesson-21.png' },
  { id: '22', title: 'So What / Why So', prompt: 'a 3D isometric pair of vertical arrows side by side, one pointing up and one pointing down, between layered cube stacks, representing So What and Why So', filename: 'lesson-22.png' },
  { id: '23', title: 'ピラミッド原則', prompt: 'a 3D isometric three-tier pyramid built from stacked cubes, conclusion on top supported by reason cubes below', filename: 'lesson-23.png' },
  { id: '24', title: 'ケーススタディ', prompt: 'a 3D isometric briefcase opening with documents flying out, case study notebook, charts', filename: 'lesson-24.png' },
  { id: '25', title: '演繹法', prompt: 'a 3D isometric flow from general principle cube down to specific conclusion cube, deduction arrow', filename: 'lesson-25.png' },
  { id: '26', title: '帰納法', prompt: 'a 3D isometric flow from many small specific data cubes converging upward into a general pattern cube, induction arrow', filename: 'lesson-26.png' },
  { id: '27', title: '形式論理', prompt: 'a 3D isometric formal logic gate diagram with truth state cubes glowing in a connected pattern', filename: 'lesson-27.png' },
  { id: '68', title: '具体と抽象', prompt: 'a 3D isometric ladder of abstraction with concrete object cubes at the bottom and abstract idea cubes at the top, vertical arrow', filename: 'lesson-68.png' },
  // ケース面接
  { id: '28', title: 'ケース面接入門', prompt: 'a 3D isometric interview room with two chairs across a small table, structured frameworks floating between them', filename: 'lesson-28.png' },
  { id: '29', title: 'プロフィタビリティ', prompt: 'a 3D isometric profit equation tree with revenue branch and cost branch breaking into smaller cubes', filename: 'lesson-29.png' },
  { id: '35', title: '新市場参入', prompt: 'a 3D isometric arrow pointing from a small island to a larger market continent, decision flowchart cubes around the arrow', filename: 'lesson-35.png' },
  { id: '36', title: 'M&A', prompt: 'a 3D isometric two companies represented as separate cube clusters merging into one larger cluster, M&A handshake', filename: 'lesson-36.png' },
  // クリティカルシンキング
  { id: '40', title: 'クリティカルシンキング入門', prompt: 'a 3D isometric magnifying glass examining a checklist document, question marks turning into checkmarks', filename: 'lesson-40.png' },
  { id: '41', title: '論理的誤謬', prompt: 'a 3D isometric set of broken chain links labeled as logical fallacies, with a corrected solid chain link beside them', filename: 'lesson-41.png' },
  { id: '42', title: 'データを読む', prompt: 'a 3D isometric data dashboard with floating bar charts and a person carefully reading numbers, hidden patterns highlighted', filename: 'lesson-42.png' },
  { id: '43', title: '問いを立てる', prompt: 'a 3D isometric large question mark cube being polished, surrounded by smaller question marks being filtered into a clearer one', filename: 'lesson-43.png' },
  { id: '69', title: '認知バイアス', prompt: 'a 3D isometric brain with translucent biased glasses being removed, prismatic fragments drifting', filename: 'lesson-69.png' },
  { id: '71', title: '相関と因果', prompt: 'a 3D isometric two correlated wave lines diverging where one is a true cause arrow and the other is just correlation', filename: 'lesson-71.png' },
  // 仮説思考
  { id: '50', title: '仮説思考入門', prompt: 'a 3D isometric thought bubble with a hypothesis card pointing forward to a verification path', filename: 'lesson-50.png' },
  { id: '51', title: '仮説の立て方', prompt: 'a 3D isometric figure drafting hypothesis cards on a desk, multiple options floating up', filename: 'lesson-51.png' },
  { id: '52', title: '仮説ドリブン', prompt: 'a 3D isometric arrow loop from hypothesis card to data verification beaker and back', filename: 'lesson-52.png' },
  { id: '70', title: '仮説の検証設計', prompt: 'a 3D isometric experimental setup with measurement instruments, control versus test cubes', filename: 'lesson-70.png' },
  // 課題設定
  { id: '53', title: '課題設定入門', prompt: 'a 3D isometric target board with concentric rings, an arrow finding the true bullseye among decoys', filename: 'lesson-53.png' },
  { id: '54', title: 'イシュー分析', prompt: 'a 3D isometric large issue card being decomposed downward into smaller sub-issue cubes', filename: 'lesson-54.png' },
  { id: '55', title: '課題設定実践', prompt: 'a 3D isometric workspace with multiple problem cards being prioritized into a focused single card', filename: 'lesson-55.png' },
  // デザインシンキング
  { id: '56', title: 'デザインシンキング入門', prompt: 'a 3D isometric design thinking cycle with five connected stage cubes (empathize, define, ideate, prototype, test)', filename: 'lesson-56.png' },
  { id: '57', title: '共感マップ', prompt: 'a 3D isometric empathy map quadrants on the floor surrounding a central persona figure', filename: 'lesson-57.png' },
  { id: '58', title: 'デザインシンキング実践', prompt: 'a 3D isometric prototype paper model being tested by a user figure with feedback bubbles', filename: 'lesson-58.png' },
  // ラテラルシンキング
  { id: '59', title: 'ラテラルシンキング入門', prompt: 'a 3D isometric lightbulb breaking out of a cube box, sideways arrows in unconventional directions', filename: 'lesson-59.png' },
  { id: '60', title: 'ラテラル技法', prompt: 'a 3D isometric prism splitting a single light beam into multiple colorful diverging directions', filename: 'lesson-60.png' },
  { id: '61', title: 'ラテラル実践', prompt: 'a 3D isometric flipped perspective scene where a problem cube is rotated to reveal a different unexpected facet', filename: 'lesson-61.png' },
  // アナロジー思考
  { id: '62', title: 'アナロジー思考入門', prompt: 'a 3D isometric bridge connecting two distinct floating islands with different visual themes', filename: 'lesson-62.png' },
  { id: '63', title: 'アナロジー技法', prompt: 'a 3D isometric structural pattern card being lifted from one domain and placed onto another domain', filename: 'lesson-63.png' },
  { id: '64', title: 'アナロジー実践', prompt: 'a 3D isometric two parallel scenes side by side with matching structural arrows showing analogy mapping', filename: 'lesson-64.png' },
  // システムシンキング
  { id: '65', title: 'システムシンキング入門', prompt: 'a 3D isometric circular feedback loop with connected node cubes flowing in a circle', filename: 'lesson-65.png' },
  { id: '66', title: 'システム原型', prompt: 'a 3D isometric system archetype diagram with reinforcing and balancing loops shown as gears', filename: 'lesson-66.png' },
  { id: '67', title: 'システム実践', prompt: 'a 3D isometric iceberg model with events on top, patterns mid, structures and mental models at the deep base', filename: 'lesson-67.png' },
  // 提案・伝える技術
  { id: '72', title: '提案書の目的', prompt: 'a 3D isometric professional bound proposal document with a clear target arrow above it', filename: 'lesson-72.png' },
  { id: '73', title: '相手の立場', prompt: 'a 3D isometric two figures facing a document, one offering and one receiving, perspective lines aligning their viewpoints', filename: 'lesson-73.png' },
  { id: '74', title: 'ストーリーライン', prompt: 'a 3D isometric storyline path with sequential narrative cube panels leading to a conclusion', filename: 'lesson-74.png' },
  { id: '75', title: 'メッセージを磨く', prompt: 'a 3D isometric message card being polished and sharpened on a workbench with sparkles', filename: 'lesson-75.png' },
  { id: '76', title: '反論を先読み', prompt: 'a 3D isometric shield deflecting incoming counter-argument arrows, behind it a strong document', filename: 'lesson-76.png' },
  // 哲学
  { id: '77', title: 'ソクラテス', prompt: 'a 3D isometric ancient Greek stone column with a Socrates-like silhouette and a scroll, question marks rising', filename: 'lesson-77.png' },
]
