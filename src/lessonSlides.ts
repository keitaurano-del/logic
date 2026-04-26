/**
 * Lesson slides type definitions and conversion utilities
 * 仕様: docs/DESIGN_V3.md §3.3, §4
 */

export type LessonSlide =
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
 * Convert legacy lesson.steps to v3 slides.
 * - 'explain' / 'intro' steps → 'concept' slides (split if too long)
 * - 'quiz' steps → 'quiz' slides
 * - Auto-summary appended at end
 */
export function convertLessonToSlides(lesson: any): LessonSlide[] {
  if (!lesson?.steps || !Array.isArray(lesson.steps)) return []

  const slides: LessonSlide[] = []

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

      slides.push({
        kind: 'quiz',
        question: step.question || step.text || '',
        choices,
        correctIndex,
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
