/**
 * Lesson slides type definitions and conversion utilities
 * 仕様: docs/DESIGN_V3.md §3.3, §4
 */

export type LessonSlide =
  | { kind: 'hero'; image: string; lessonId?: number; category: string; title: string; meta: string }
  | { kind: 'intro'; tag: string; title: string; body: string }
  | { kind: 'concept'; tag?: string; title: string; body: string; example?: string }
  | { kind: 'diagram'; title: string; nodes: { label: string; kind: 'premise' | 'conclusion' }[] }
  | { kind: 'compare'; title: string; left: { label: string; body: string }; right: { label: string; body: string } }
  | { kind: 'quote'; author: string; quote: string }
  | { kind: 'quiz'; question: string; choices: string[]; correctIndex: number; explain: string }
  | { kind: 'summary'; title: string; points: string[] }

export interface LessonV3 {
  id: number
  category: string
  title: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  durationMin: number
  slides: LessonSlide[]
  xp: number
}

/**
 * Split a long text body into multiple shorter slides for Story-style reading.
 * Splits at double newlines, then groups paragraphs to keep each slide under maxChars.
 */
function splitBody(text: string, maxChars = 200): string[] {
  if (!text) return ['']
  // 改行を整える
  const normalized = text.replace(/\\n/g, '\n').trim()
  // 段落分割
  const paragraphs = normalized.split(/\n\n+/).map(p => p.trim()).filter(Boolean)
  if (paragraphs.length === 0) return ['']

  const chunks: string[] = []
  let current = ''
  for (const p of paragraphs) {
    // 単独で長すぎる段落はそのまま1スライドに（さらに分割は意味的に難しいので）
    if (p.length > maxChars && current === '') {
      chunks.push(p)
      continue
    }
    if (current.length + p.length + 2 <= maxChars) {
      current = current ? current + '\n\n' + p : p
    } else {
      if (current) chunks.push(current)
      current = p
    }
  }
  if (current) chunks.push(current)
  return chunks
}

/**
 * Format text body for HTML rendering: preserve line breaks, escape HTML.
 */
function formatBody(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br/>')
}

/**
 * Map lesson.category → hero image filename (without extension)
 */
/** レッスンID → 個別画像マッピング */
const LESSON_IMAGES: Record<number, string> = {
  // ロジカルシンキング
  20: '/images/v3/lesson-20.webp',  // MECE
  21: '/images/v3/lesson-21.webp',  // ロジックツリー
  22: '/images/v3/lesson-22.webp',  // So What / Why So
  23: '/images/v3/lesson-23.webp',  // ピラミッド原則
  24: '/images/v3/lesson-24.webp',  // ケーススタディ
  25: '/images/v3/lesson-25.webp',  // 演繹法
  26: '/images/v3/lesson-26.webp',  // 帰納法
  27: '/images/v3/lesson-27.webp',  // 形式論理
  68: '/images/v3/lesson-68.webp',  // 具体と抽象
  // ケース面接
  28: '/images/v3/lesson-28.webp',  // ケース面接入門
  29: '/images/v3/lesson-29.webp',  // プロフィタビリティ
  35: '/images/v3/lesson-35.webp',  // 新市場参入
  36: '/images/v3/lesson-36.webp',  // M&A
  // クリティカルシンキング
  40: '/images/v3/lesson-40.webp',  // クリティカルシンキング入門
  41: '/images/v3/lesson-41.webp',  // 論理的誤謬
  42: '/images/v3/lesson-42.webp',  // データを読む
  43: '/images/v3/lesson-43.webp',  // 問いを立てる
  69: '/images/v3/lesson-69.webp',  // 認知バイアス
  71: '/images/v3/lesson-71.webp',  // 相関と因果
  // 仮説思考
  50: '/images/v3/lesson-50.webp',  // 仮説思考入門
  51: '/images/v3/lesson-51.webp',  // 仮説の立て方
  52: '/images/v3/lesson-52.webp',  // 仮説ドリブン
  70: '/images/v3/lesson-70.webp',  // 仮説の検証設計
  // 課題設定
  53: '/images/v3/lesson-53.webp',  // 課題設定入門
  54: '/images/v3/lesson-54.webp',  // イシュー分析
  55: '/images/v3/lesson-55.webp',  // 課題設定実践
  // デザインシンキング
  56: '/images/v3/lesson-56.webp',  // デザインシンキング入門
  57: '/images/v3/lesson-57.webp',  // 共感マップ
  58: '/images/v3/lesson-58.webp',  // デザインシンキング実践
  // ラテラルシンキング
  59: '/images/v3/lesson-59.webp',  // ラテラルシンキング入門
  60: '/images/v3/lesson-60.webp',  // ラテラル技法
  61: '/images/v3/lesson-61.webp',  // ラテラル実践
  // アナロジー思考
  62: '/images/v3/lesson-62.webp',  // アナロジー思考入門
  63: '/images/v3/lesson-63.webp',  // アナロジー技法
  64: '/images/v3/lesson-64.webp',  // アナロジー実践
  // システムシンキング
  65: '/images/v3/lesson-65.webp',  // システムシンキング入門
  66: '/images/v3/lesson-66.webp',  // システム原型
  67: '/images/v3/lesson-67.webp',  // システム実践
  // 提案・伝える技術
  72: '/images/v3/lesson-72.webp',  // 提案書の目的
  73: '/images/v3/lesson-73.webp',  // 相手の立場
  74: '/images/v3/lesson-74.webp',  // ストーリーライン
  75: '/images/v3/lesson-75.webp',  // メッセージを磨く
  76: '/images/v3/lesson-76.webp',  // 反論を先読み
  // 哲学
  77: '/images/v3/lesson-77.webp',  // ソクラテス
}

function getHeroImage(category: string, lessonId?: number): string {
  // IDが指定されていれば個別画像を優先
  if (lessonId != null && LESSON_IMAGES[lessonId]) {
    return LESSON_IMAGES[lessonId]
  }
  // フォールバック: カテゴリ別
  const c = (category || '').toLowerCase()
  if (c.includes('ロジカル') || c.includes('logical')) return '/images/v3/hero-deduction.webp'
  if (c.includes('ケース面接') || c === 'business') return '/images/v3/course-business.webp'
  if (c.includes('哲学') || c === 'philosophy') return '/images/v3/course-philosophy.webp'
  if (c.includes('提案') || c.includes('伝える')) return '/images/v3/lesson-proposal.webp'
  if (c.includes('フェルミ') || c.includes('fermi')) return '/images/v3/home-daily-fermi.webp'
  if (c.includes('クリティカル')) return '/images/v3/lesson-critical-thinking.webp'
  if (c.includes('仮説')) return '/images/v3/lesson-hypothesis.webp'
  if (c.includes('課題')) return '/images/v3/lesson-issue-setting.webp'
  if (c.includes('デザイン')) return '/images/v3/lesson-design-thinking.webp'
  if (c.includes('ラテラル')) return '/images/v3/lesson-lateral-thinking.webp'
  if (c.includes('アナロジー') || c.includes('analogy')) return '/images/v3/lesson-analogy.webp'
  if (c.includes('システム')) return '/images/v3/lesson-systems-thinking.webp'
  if (c.includes('思考法') || c.includes('thinking')) return '/images/v3/course-thinking.webp'
  if (c.includes('coffee') || c.includes('コーヒー')) return '/images/v3/home-daily-question.webp'
  return '/images/v3/hero-deduction.webp'
}

/**
 * Convert legacy lesson.steps to v3 slides.
 * - 'explain' / 'intro' steps → 'concept' slides (split if too long)
 * - 'quiz' steps → 'quiz' slides
 * - Auto-summary appended at end
 */
export function convertLessonToSlides(lesson: any): LessonSlide[] {
  if (!lesson?.steps || !Array.isArray(lesson.steps)) return []

  const slides: LessonSlide[] = []
  // Add hero slide as first
  const stepCount = lesson.steps.length
  slides.push({
    kind: 'hero',
    image: getHeroImage(lesson.category, lesson.id),
    lessonId: lesson.id,
    category: lesson.category || '',
    title: lesson.title || '',
    meta: `${stepCount}ステップ · ${lesson.difficulty || '初級'}`,
  })

  for (const step of lesson.steps) {
    const stepType = step.type || step.kind

    if (stepType === 'explain' || stepType === 'explanation' || stepType === 'intro') {
      const title = step.title || lesson.title || ''
      const content = step.content || step.text || step.body || ''
      const chunks = splitBody(content, 220)
      chunks.forEach((chunk, idx) => {
        slides.push({
          kind: 'concept',
          tag: idx === 0 ? undefined : '続き',
          title: idx === 0 ? title : '',
          body: formatBody(chunk),
        })
      })
    } else if (stepType === 'quiz') {
      // Convert legacy options format to choices/correctIndex
      let choices: string[] = []
      let correctIndex = 0
      if (Array.isArray(step.options)) {
        choices = step.options.map((o: any) => typeof o === 'string' ? o : o.label || o.text || '')
        correctIndex = step.options.findIndex((o: any) => o.correct === true)
        if (correctIndex < 0) correctIndex = step.correctIndex ?? step.answer ?? 0
      } else if (Array.isArray(step.choices)) {
        choices = step.choices
        correctIndex = step.correctIndex ?? step.answer ?? 0
      }

      // 選択肢をシャッフルして正解位置の偏りを解消
      const correctText = choices[correctIndex]
      const shuffled = [...choices]
        .map((c, i) => ({ c, i }))
        .sort(() => Math.random() - 0.5)
      // 一致しないよう元の正解位置とが同じ場合は再シャッフル
      const finalChoices = shuffled.map(x => x.c)
      // 正解位置が元と同じだったら小さい方とswap
      const newCorrect = finalChoices.indexOf(correctText)
      if (newCorrect === correctIndex && finalChoices.length > 1) {
        const swapIdx = (correctIndex + 1) % finalChoices.length
        ;[finalChoices[newCorrect], finalChoices[swapIdx]] = [finalChoices[swapIdx], finalChoices[newCorrect]]
      }

      slides.push({
        kind: 'quiz',
        question: step.question || step.text || '',
        choices: finalChoices,
        correctIndex: finalChoices.indexOf(correctText),
        explain: step.explanation || step.explain || '',
      })
    } else if (stepType === 'example') {
      slides.push({
        kind: 'concept',
        tag: '例',
        title: step.title || '例',
        body: formatBody(step.content || step.text || step.body || ''),
      })
    }
    // 不明なtypeは無視
  }

  // 末尾にsummaryを追加（既にあれば追加しない）
  const last = slides[slides.length - 1]
  if (last && last.kind !== 'summary') {
    slides.push({
      kind: 'summary',
      title: 'お疲れさまでした',
      points: [
        `「${lesson.title}」を学びました`,
        '次のレッスンへ進みましょう',
      ],
    })
  }

  return slides
}
