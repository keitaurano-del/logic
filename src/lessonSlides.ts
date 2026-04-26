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
 * Convert legacy lesson.steps to v3 slides.
 * Best-effort conversion, may need manual tweaking for complex lessons.
 */
export function convertLessonToSlides(lesson: any): LessonSlide[] {
  if (!lesson?.steps || !Array.isArray(lesson.steps)) return []

  const slides: LessonSlide[] = []

  for (const step of lesson.steps) {
    if (step.kind === 'explanation' || step.kind === 'intro') {
      slides.push({
        kind: 'concept',
        tag: step.tag,
        title: step.title || lesson.title,
        body: step.text || step.body || '',
        example: step.example,
      })
    } else if (step.kind === 'quiz') {
      slides.push({
        kind: 'quiz',
        question: step.question || step.text || '',
        choices: step.choices || step.options || [],
        correctIndex: step.correctIndex ?? step.answer ?? 0,
        explain: step.explain || step.explanation || '',
      })
    } else if (step.kind === 'example') {
      slides.push({
        kind: 'concept',
        tag: '例',
        title: step.title || '例',
        body: step.text || step.body || '',
      })
    } else {
      // Default: convert as concept
      slides.push({
        kind: 'concept',
        title: step.title || lesson.title,
        body: step.text || step.body || JSON.stringify(step).slice(0, 200),
      })
    }
  }

  // Insert summary at the end if not present
  const last = slides[slides.length - 1]
  if (last && last.kind !== 'summary') {
    slides.push({
      kind: 'summary',
      title: 'まとめ',
      points: [`${lesson.title}を学びました`, '次のレッスンへ進みましょう'],
    })
  }

  return slides
}
