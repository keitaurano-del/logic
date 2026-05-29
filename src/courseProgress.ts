// courseProgress.ts — コース単位の進捗（完了レッスン数 / 総レッスン数 → ％）算出
//
// 進捗の集計は完了レッスンの Set（stats.getCompletedLessons() を Set 化したもの。
// `lesson-<id>` 形式のキー）と courseData の lessonIds から行う。新規 DB は不要。

import type { Course } from './courseData'

/**
 * コースの完了レッスン数 / 総レッスン数から進捗率（％）を算出する純関数。
 * - done: 完了レッスン数（lessonIds のうち `lesson-<id>` が completed に含まれる数）
 * - total: 総レッスン数
 * - percent: round(done/total*100)。total が 0 のときは 0（0除算回避）。
 */
export function courseProgress(
  course: Pick<Course, 'lessonIds'>,
  completed: Set<string>,
): { done: number; total: number; percent: number } {
  const total = course.lessonIds.length
  const done = course.lessonIds.filter(id => completed.has(`lesson-${id}`)).length
  const percent = total > 0 ? Math.round((done / total) * 100) : 0
  return { done, total, percent }
}
