import { describe, expect, it, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { LessonCompleteScreen } from '../screens/LessonCompleteScreen'

vi.mock('../stats', () => ({ getStreak: () => 3, getXp: () => 0 }))
vi.mock('../flashcardData', () => ({ getCardStats: () => ({ due: 0, total: 0 }) }))
vi.mock('../wrongAnswerStore', () => ({ getWrongAnswerStats: () => ({ unresolved: 0 }) }))
vi.mock('../platform/haptics', () => ({ haptic: { success: vi.fn(), light: vi.fn() } }))

const BASE_PROPS = {
  userName: 'Tester',
  lessonTitle: 'テストレッスン',
  durationSec: 120,
  onNext: vi.fn(),
  onHome: vi.fn(),
  autoAdvance: false,
}

describe('LessonCompleteScreen — FB-05 Stage③ 完了後CTA', () => {
  it('nextCourse なし: 通常の次のレッスンボタンが出る', () => {
    render(<LessonCompleteScreen {...BASE_PROPS} />)
    expect(screen.getByText(/次のレッスンへ進む/)).toBeInTheDocument()
    expect(screen.queryByText(/コース完了/)).toBeNull()
  })

  it('nextCourse あり: コース完了バナーと次のコースボタンが出る', () => {
    const nextCourse = { id: 'course-02', title: '批判的思考を深める', category: 'critical' }
    render(<LessonCompleteScreen {...BASE_PROPS} nextCourse={nextCourse} />)
    expect(screen.getByText('コース完了')).toBeInTheDocument()
    expect(screen.getByText('批判的思考を深める を始める →')).toBeInTheDocument()
    expect(screen.queryByText(/次のレッスンへ進む/)).toBeNull()
  })

  it('nextCourse あり: ボタン押下で onStartNextCourse が id と category で呼ばれる', () => {
    const onStartNextCourse = vi.fn()
    const nextCourse = { id: 'course-02', title: '批判的思考を深める', category: 'critical' }
    render(
      <LessonCompleteScreen
        {...BASE_PROPS}
        nextCourse={nextCourse}
        onStartNextCourse={onStartNextCourse}
      />
    )
    fireEvent.click(screen.getByText('批判的思考を深める を始める →'))
    expect(onStartNextCourse).toHaveBeenCalledOnce()
    expect(onStartNextCourse).toHaveBeenCalledWith('course-02', 'critical')
  })
})
