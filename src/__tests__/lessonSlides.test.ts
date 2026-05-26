import { describe, expect, it } from 'vitest'
import { convertLessonToSlides, type LessonSlide } from '../lessonSlides'

/**
 * lessonSlides.ts の private helpers (getHeroImage / formatBody / splitBody) は
 * convertLessonToSlides 経由で挙動を検証する。
 */

function findHero(slides: LessonSlide[]): Extract<LessonSlide, { kind: 'hero' }> {
  const hero = slides.find((s) => s.kind === 'hero')
  if (!hero || hero.kind !== 'hero') throw new Error('hero slide missing')
  return hero
}

function findConcepts(slides: LessonSlide[]): Extract<LessonSlide, { kind: 'concept' }>[] {
  return slides.filter((s): s is Extract<LessonSlide, { kind: 'concept' }> => s.kind === 'concept')
}

describe('lessonSlides — convertLessonToSlides', () => {
  it('returns [] for null/empty lesson', () => {
    expect(convertLessonToSlides(null)).toEqual([])
    expect(convertLessonToSlides({})).toEqual([])
    expect(convertLessonToSlides({ steps: 'not-array' })).toEqual([])
  })

  it('always prepends a hero slide with category + meta', () => {
    const slides = convertLessonToSlides({
      id: 20,
      title: 'MECE',
      category: 'ロジカルシンキング',
      difficulty: '初級',
      steps: [{ type: 'explain', title: 't', content: 'body' }],
    })
    const hero = findHero(slides)
    expect(hero.title).toBe('MECE')
    expect(hero.category).toBe('ロジカルシンキング')
    expect(hero.meta).toContain('ステップ')
  })

  it('appends a summary slide at the end', () => {
    const slides = convertLessonToSlides({
      id: 1,
      title: 'X',
      category: 'ロジカルシンキング',
      steps: [{ type: 'explain', title: 't', content: 'body' }],
    })
    const last = slides[slides.length - 1]
    expect(last.kind).toBe('summary')
  })

  describe('hero image fallback (getHeroImage)', () => {
    it('uses lesson-specific image when a known id is provided', () => {
      const slides = convertLessonToSlides({
        id: 20,
        title: 'MECE',
        category: 'ロジカルシンキング',
        steps: [{ type: 'explain', title: 't', content: 'b' }],
      })
      expect(findHero(slides).image).toBe('/images/v3/lesson-20.png')
    })

    it.each([
      ['ロジカルシンキング', '/images/v3/course-logic-01.png'],
      ['ケース面接', '/images/v3/course-case-01.png'],
      ['哲学', '/images/v3/course-philosophy-01.png'],
      ['フェルミ推定', '/images/v3/home-daily-fermi.png'],
      ['アナロジー思考', '/images/v3/lesson-analogy.png'],
      ['認知科学', '/images/v3/course-cognitive-01.png'],
      ['ドキュメンテーション', '/images/v3/course-documentation-01.png'],
      ['ADHDレバレッジ', '/images/v3/course-adhd-leverage-01.png'],
      ['構造化リスニング', '/images/v3/course-listening-01.png'],
    ])('falls back by category "%s" → %s', (category, expected) => {
      const slides = convertLessonToSlides({
        id: 99999,
        title: 't',
        category,
        steps: [{ type: 'explain', title: 't', content: 'b' }],
      })
      expect(findHero(slides).image).toBe(expected)
    })

    it('falls back to hero-deduction.png for fully unknown category', () => {
      const slides = convertLessonToSlides({
        id: 99999,
        title: 't',
        category: 'totally-unknown-category-zzz',
        steps: [{ type: 'explain', title: 't', content: 'b' }],
      })
      expect(findHero(slides).image).toBe('/images/v3/hero-deduction.png')
    })
  })

  describe('explain → concept slides (splitBody + formatBody)', () => {
    it('splits long content into multiple ~220-char chunks', () => {
      // 長文 (220 字超え) を 2 段落で渡して、複数 concept slide に割れることを確認
      const para1 = 'あ'.repeat(150)
      const para2 = 'い'.repeat(150)
      const slides = convertLessonToSlides({
        id: 1,
        title: 'long',
        category: 'ロジカルシンキング',
        steps: [{ type: 'explain', title: 'long', content: `${para1}\n\n${para2}` }],
      })
      const concepts = findConcepts(slides)
      expect(concepts.length).toBeGreaterThanOrEqual(2)
      // 2 つ目以降は tag「続き」が付き、title は空になる
      expect(concepts[1].tag).toBe('続き')
      expect(concepts[1].title).toBe('')
    })

    it('keeps a single short paragraph as one slide with original title', () => {
      const slides = convertLessonToSlides({
        id: 1,
        title: 'short',
        category: 'ロジカルシンキング',
        steps: [{ type: 'explain', title: 'short', content: 'hi' }],
      })
      const concepts = findConcepts(slides)
      expect(concepts).toHaveLength(1)
      expect(concepts[0].title).toBe('short')
      expect(concepts[0].tag).toBeUndefined()
    })

    it('keeps body as raw markdown-subset text (no HTML escaping)', () => {
      // リッチテキスト描画へ移行後、body は raw テキストをそのまま載せる
      // （描画は RichLessonText、読み上げは stripMarkup が担当）。
      const slides = convertLessonToSlides({
        id: 1,
        title: 't',
        category: 'ロジカルシンキング',
        steps: [
          {
            type: 'explain',
            title: 't',
            content: '**重要** な話 & more',
          },
        ],
      })
      const concepts = findConcepts(slides)
      expect(concepts[0].body).toContain('**重要**')
      expect(concepts[0].body).toContain('&')
      expect(concepts[0].body).not.toContain('&amp;')
    })

    it('preserves newlines in body (no <br/> conversion)', () => {
      const slides = convertLessonToSlides({
        id: 1,
        title: 't',
        category: 'ロジカルシンキング',
        steps: [{ type: 'explain', title: 't', content: 'line1\nline2' }],
      })
      const concepts = findConcepts(slides)
      expect(concepts[0].body).toContain('\n')
      expect(concepts[0].body).not.toContain('<br/>')
    })
  })

  describe('visual + outro slides', () => {
    it('inserts a visual slide after explain when step.visual is given', () => {
      const slides = convertLessonToSlides({
        id: 1,
        title: 't',
        category: 'ロジカルシンキング',
        steps: [
          {
            type: 'explain',
            title: 't',
            content: 'body',
            visual: 'ThreePillarsDiagram',
            visualTitle: 'Pillars',
          },
        ],
      })
      const visual = slides.find((s) => s.kind === 'visual')
      expect(visual).toBeDefined()
      if (visual && visual.kind === 'visual') {
        expect(visual.visualId).toBe('ThreePillarsDiagram')
        expect(visual.title).toBe('Pillars')
      }
    })

    it('inserts a "まとめ" concept slide after visual when step.outro is given', () => {
      const slides = convertLessonToSlides({
        id: 1,
        title: 't',
        category: 'ロジカルシンキング',
        steps: [
          {
            type: 'explain',
            title: 't',
            content: 'body',
            visual: 'V',
            outro: 'wrap-up',
          },
        ],
      })
      const outro = findConcepts(slides).find((c) => c.tag === 'まとめ')
      expect(outro).toBeDefined()
      expect(outro?.body).toContain('wrap-up')
    })
  })

  describe('quiz slide conversion', () => {
    it('converts options[] with correct=true into choices + correctIndex', () => {
      const slides = convertLessonToSlides({
        id: 1,
        title: 't',
        category: 'ロジカルシンキング',
        steps: [
          {
            type: 'quiz',
            question: 'Q?',
            options: [
              { label: 'A', correct: false },
              { label: 'B', correct: true },
              { label: 'C', correct: false },
            ],
            explanation: 'because',
          },
        ],
      })
      const quiz = slides.find((s) => s.kind === 'quiz')
      expect(quiz).toBeDefined()
      if (quiz && quiz.kind === 'quiz') {
        expect(quiz.choices).toHaveLength(3)
        // シャッフルされるので index は分からないが、正解テキストは "B" のはず
        expect(quiz.choices[quiz.correctIndex]).toBe('B')
        expect(quiz.explain).toBe('because')
      }
    })
  })

  it('ignores unknown step types silently', () => {
    const slides = convertLessonToSlides({
      id: 1,
      title: 't',
      category: 'ロジカルシンキング',
      steps: [{ type: 'wat' }, { type: 'explain', title: 't', content: 'ok' }],
    })
    // hero + concept + summary = 3 枚
    expect(slides).toHaveLength(3)
  })
})
