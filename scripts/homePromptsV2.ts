/**
 * Home tile thumbnail prompts (v2 — Caveat-style hand-drawn notebook).
 *
 * 2 home tiles (AI Problem Generator, Roleplay), 16:9 landscape.
 * Used by scripts/generate-home-thumbnails-v2.ts and shares the
 * `buildCoursePrompt` helper from careerPromptsV2.ts (same 16:9 style).
 *
 * Style requirements come from feedback_logic_course_thumbnails.md
 * and feedback_gemini_prompt_tricks.md.
 *
 * Slugs match the existing public/images/v3/home-*.png filenames
 * referenced by src/screens/HomeScreenV3.tsx so the regenerated PNGs
 * drop in without code changes.
 */

import type { LessonPromptEntry } from './lessonPromptsV2.ts'

export const HOME_PROMPTS_V2: LessonPromptEntry[] = [
  {
    slug: 'home-daily-question',
    title: 'AI Problems',
    subtitle: 'Fresh quiz by theme',
    diagram:
      'on the right two-thirds of the cream notebook page, three small hand-drawn flashcard rectangles fanned out across the area, each card outlined with a thick black marker border and containing one large hand-lettered coral red question mark "?" centered inside. To the left of the fanned cards, a small oval labeled "AI" in cursive handwriting, with a single coral red arrow flowing from the AI oval to the first card. Above the cards, a short cursive handwritten annotation "new each time".',
    spell: ['AI Problems', 'Fresh quiz by theme', 'AI', 'new each time'],
  },
]
