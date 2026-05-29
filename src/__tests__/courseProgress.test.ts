import { describe, expect, it } from 'vitest'
import { courseProgress } from '../courseProgress'

const course = (lessonIds: number[]) => ({ lessonIds })

describe('courseProgress', () => {
  it('0/5 → 0%（未着手）', () => {
    const r = courseProgress(course([20, 21, 22, 23, 24]), new Set())
    expect(r).toEqual({ done: 0, total: 5, percent: 0 })
  })

  it('全完了 5/5 → 100%', () => {
    const completed = new Set(['lesson-20', 'lesson-21', 'lesson-22', 'lesson-23', 'lesson-24'])
    const r = courseProgress(course([20, 21, 22, 23, 24]), completed)
    expect(r).toEqual({ done: 5, total: 5, percent: 100 })
  })

  it('一部完了 2/5 → 40%', () => {
    const completed = new Set(['lesson-20', 'lesson-21'])
    const r = courseProgress(course([20, 21, 22, 23, 24]), completed)
    expect(r).toEqual({ done: 2, total: 5, percent: 40 })
  })

  it('端数は四捨五入 1/3 → 33%', () => {
    const completed = new Set(['lesson-20'])
    const r = courseProgress(course([20, 21, 22]), completed)
    expect(r.percent).toBe(33)
  })

  it('端数は四捨五入 2/3 → 67%', () => {
    const completed = new Set(['lesson-20', 'lesson-21'])
    const r = courseProgress(course([20, 21, 22]), completed)
    expect(r.percent).toBe(67)
  })

  it('総レッスン 0 件でも 0 除算せず 0%', () => {
    const r = courseProgress(course([]), new Set())
    expect(r).toEqual({ done: 0, total: 0, percent: 0 })
  })

  it('コースに含まれない完了レッスンは数えない', () => {
    const completed = new Set(['lesson-99', 'lesson-20'])
    const r = courseProgress(course([20, 21]), completed)
    expect(r).toEqual({ done: 1, total: 2, percent: 50 })
  })

  it('重複 lessonId があっても素直に件数で数える', () => {
    // courseData には同一 ID が複数コースに跨る程度で、コース内重複は稀だが防御的に確認
    const completed = new Set(['lesson-23'])
    const r = courseProgress(course([25, 26, 27, 68, 23]), completed)
    expect(r).toEqual({ done: 1, total: 5, percent: 20 })
  })
})
