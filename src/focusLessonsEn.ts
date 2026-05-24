/**
 * Focus on Now Course — English edition
 * Category: '集中の技術' (kept in Japanese to match category routing keys
 *           used across courseData / RoadmapScreen / CompletedLessonsScreen)
 * Lesson IDs: 900–907
 *
 * NOTE: This file is currently a JA-content fallback. Lesson bodies are still
 * in Japanese — proper EN translation is scheduled for a later phase, matching
 * the ja-fallback approach used for the career lessons (see lessonData.ts
 * `_pickByLocale(careerResumeLessonMap, careerResumeLessonMap)` pattern).
 *
 * Re-exporting the JA map under the `*En` name keeps the wiring identical to
 * categories that already have a real EN translation (e.g. ADHD leverage),
 * so swapping in an authored translation later only touches this one file.
 */
import { focusLessonMap } from './focusLessons'

export const focusLessonMapEn = focusLessonMap
