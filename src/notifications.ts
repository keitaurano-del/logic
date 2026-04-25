// Local notification wrapper — 今日の1問リマインダー
// Native: @capacitor/local-notifications で実際にスケジュール
// Web: localStorage 保存のみ（no-op）

const PREF_KEY = 'logic-reminder'
const NOTIF_ID = 1001

// ── 通知メッセージバリエーション ──

const DAILY_MESSAGES: string[] = [
  '今日の1問に取り組んでみよう。5分でいい。',
  '考える習慣は、続けることで身につく。',
  '昨日より少しだけ、論理的に考えてみよう。',
  '問いを立てるだけでも、思考の練習になる。',
  '今日はどんな問いと向き合う？',
  '小さな積み重ねが、長期的な差を生む。',
  '「なぜ？」を1回多く問う習慣をつけよう。',
  '論理的思考は才能ではなく、反復で鍛えられる技術。',
]

const STREAK_MESSAGES: Record<number, string> = {
  3:  '3日連続。継続の力を感じている。',
  7:  '7日連続。1週間たった。習慣になってきた。',
  14: '2週間連続。思考の筋肉がついてきた。',
  30: '1ヶ月連続。本物の継続力。',
  50: '50日連続。論理的思考が確かに変わっている。',
  100: '100日連続。ここまで来た人は少ない。',
}

const LEVEL_UP_MESSAGES: Record<number, string> = {
  5:  'Lv.5に到達。思考の土台が整ってきた。',
  10: 'Lv.10到達。論理の型が身についてきた。',
  20: 'Lv.20到達。複雑な問題も構造化できるようになった。',
  50: 'Lv.50到達。思考の深さが変わっている。',
}

/** 通知本文を生成する。streak・level に応じてメッセージを変える */
export function buildNotificationBody(streak = 0, level = 1): string {
  // レベルアップ通知（ちょうど該当レベルの場合）
  if (LEVEL_UP_MESSAGES[level]) return LEVEL_UP_MESSAGES[level]
  // ストリーク達成通知
  if (STREAK_MESSAGES[streak]) return STREAK_MESSAGES[streak]
  // 曜日ベースでメッセージをローテーション
  const dayIndex = new Date().getDay() // 0=日〜6=土
  return DAILY_MESSAGES[dayIndex % DAILY_MESSAGES.length]
}

export type ReminderPref = {
  enabled: boolean
  hour: number    // 0-23
  minute: number  // 0-59
}

const DEFAULT_PREF: ReminderPref = { enabled: false, hour: 20, minute: 0 }

export function isNative(): boolean {
  try {
    return !!(window as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor?.isNativePlatform?.()
  } catch { return false }
}

export function loadReminderPref(): ReminderPref {
  try {
    const raw = localStorage.getItem(PREF_KEY)
    if (raw) return { ...DEFAULT_PREF, ...JSON.parse(raw) }
  } catch { /* */ }
  return { ...DEFAULT_PREF }
}

export function saveReminderPref(pref: ReminderPref) {
  localStorage.setItem(PREF_KEY, JSON.stringify(pref))
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!isNative()) return false
  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications')
    const { display } = await LocalNotifications.checkPermissions()
    if (display === 'granted') return true
    const result = await LocalNotifications.requestPermissions()
    return result.display === 'granted'
  } catch (e) {
    console.warn('Notification permission error:', e)
    return false
  }
}

export async function scheduleDailyReminder(hour: number, minute: number): Promise<boolean> {
  saveReminderPref({ enabled: true, hour, minute })
  if (!isNative()) return true // web: 保存のみ

  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications')

    // 既存通知をキャンセル
    await LocalNotifications.cancel({ notifications: [{ id: NOTIF_ID }] })

    // 次の通知時刻を計算
    const now = new Date()
    const at = new Date()
    at.setHours(hour, minute, 0, 0)
    if (at <= now) at.setDate(at.getDate() + 1)

    await LocalNotifications.schedule({
      notifications: [{
        id: NOTIF_ID,
        title: 'Logic',
        body: buildNotificationBody(),
        schedule: { at, repeats: true, every: 'day' },
      }],
    })
    return true
  } catch (e) {
    console.warn('Schedule notification error:', e)
    return false
  }
}

export async function cancelDailyReminder(): Promise<void> {
  saveReminderPref({ ...loadReminderPref(), enabled: false })
  if (!isNative()) return

  try {
    const { LocalNotifications } = await import('@capacitor/local-notifications')
    await LocalNotifications.cancel({ notifications: [{ id: NOTIF_ID }] })
  } catch (e) {
    console.warn('Cancel notification error:', e)
  }
}
