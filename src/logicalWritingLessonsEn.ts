/**
 * Logical Writing Course — English edition
 * Category: 'ロジカルライティング' (kept in Japanese to match category routing keys
 *           used across courseData / RoadmapScreen / CompletedLessonsScreen)
 * Lesson IDs: 910–917
 *
 * NOTE: This file is currently a JA-content fallback. Lesson bodies are still
 * in Japanese — proper EN translation is scheduled for a later phase, matching
 * the ja-fallback approach used for the focus and career lessons (see
 * lessonData.ts `_pickByLocale(focusLessonMap, focusLessonMapEn)` pattern).
 *
 * Re-exporting the JA map under the `*En` name keeps the wiring identical to
 * categories that already have a real EN translation, so swapping in an
 * authored translation later only touches this one file.
 */
import { logicalWritingLessonMap } from './logicalWritingLessons'

export const logicalWritingLessonMapEn = logicalWritingLessonMap
