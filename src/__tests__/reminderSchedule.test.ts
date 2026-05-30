// DF-F8: daily reminder の frequency / quietHours スケジュール分岐の unit test。
// 純粋関数（isWithinQuietHours / resolveReminderWeekdays）のみを対象にする。
import { describe, it, expect } from 'vitest'
import { isWithinQuietHours, resolveReminderWeekdays } from '../notifications'
import type { QuietHours, ReminderPref } from '../notifications'

const quiet = (over: Partial<QuietHours> = {}): QuietHours => ({
  enabled: true, start: '22:00', end: '07:00', ...over,
})

const pref = (over: Partial<ReminderPref> = {}): ReminderPref => ({
  enabled: true,
  hour: 20,
  minute: 0,
  frequency: 'daily',
  weeklyDays: [1, 2, 3, 4, 5],
  quietHours: { enabled: false, start: '22:00', end: '07:00' },
  ...over,
})

describe('isWithinQuietHours', () => {
  it('disabled なら常に false', () => {
    expect(isWithinQuietHours(quiet({ enabled: false }), 23, 0)).toBe(false)
  })

  it('日跨ぎ範囲 (22:00-07:00): 深夜 23:00 は範囲内', () => {
    expect(isWithinQuietHours(quiet(), 23, 0)).toBe(true)
  })

  it('日跨ぎ範囲 (22:00-07:00): 早朝 06:30 は範囲内', () => {
    expect(isWithinQuietHours(quiet(), 6, 30)).toBe(true)
  })

  it('日跨ぎ範囲 (22:00-07:00): 昼 12:00 は範囲外', () => {
    expect(isWithinQuietHours(quiet(), 12, 0)).toBe(false)
  })

  it('日跨ぎ範囲: start(22:00) は範囲内（境界含む）', () => {
    expect(isWithinQuietHours(quiet(), 22, 0)).toBe(true)
  })

  it('日跨ぎ範囲: end(07:00) は範囲外（境界含まない）', () => {
    expect(isWithinQuietHours(quiet(), 7, 0)).toBe(false)
  })

  it('通常範囲 (09:00-17:00): 12:00 は範囲内', () => {
    expect(isWithinQuietHours(quiet({ start: '09:00', end: '17:00' }), 12, 0)).toBe(true)
  })

  it('通常範囲 (09:00-17:00): 08:00 は範囲外', () => {
    expect(isWithinQuietHours(quiet({ start: '09:00', end: '17:00' }), 8, 0)).toBe(false)
  })

  it('start === end は範囲ゼロ扱いで false', () => {
    expect(isWithinQuietHours(quiet({ start: '10:00', end: '10:00' }), 10, 0)).toBe(false)
  })
})

describe('resolveReminderWeekdays', () => {
  it('daily は全曜日 [0..6]', () => {
    expect(resolveReminderWeekdays(pref({ frequency: 'daily' }))).toEqual([0, 1, 2, 3, 4, 5, 6])
  })

  it('weekdays は月〜金 [1..5]', () => {
    expect(resolveReminderWeekdays(pref({ frequency: 'weekdays' }))).toEqual([1, 2, 3, 4, 5])
  })

  it('weekly は weeklyDays をソートして返す', () => {
    expect(resolveReminderWeekdays(pref({ frequency: 'weekly', weeklyDays: [6, 0, 3] }))).toEqual([0, 3, 6])
  })

  it('weekly で空配列なら通知ゼロ（空配列）', () => {
    expect(resolveReminderWeekdays(pref({ frequency: 'weekly', weeklyDays: [] }))).toEqual([])
  })

  it('DND 範囲内なら frequency に関わらず空配列', () => {
    const p = pref({
      frequency: 'daily',
      hour: 23,
      minute: 0,
      quietHours: { enabled: true, start: '22:00', end: '07:00' },
    })
    expect(resolveReminderWeekdays(p)).toEqual([])
  })

  it('DND 有効でも範囲外なら通常どおりスケジュール', () => {
    const p = pref({
      frequency: 'weekdays',
      hour: 20,
      minute: 0,
      quietHours: { enabled: true, start: '22:00', end: '07:00' },
    })
    expect(resolveReminderWeekdays(p)).toEqual([1, 2, 3, 4, 5])
  })
})
