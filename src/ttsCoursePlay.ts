/**
 * ttsCoursePlay — 「コースを再生」セッションの軽量ストア。
 *
 * コース詳細（カテゴリ表示モード）のヘッドホンから「コースを再生」を押すと、
 * そのコースのレッスンをスライド順に読み上げ、各レッスンの末尾で次のレッスンへ
 * 自動遷移する。コース間（cross-course）の連鎖はしない。
 *
 * 設計:
 *   - 再生対象のレッスン ID 列 (lessonIds) と現在の index を sessionStorage に保持する。
 *     画面遷移（LessonStoriesScreen の unmount → 次レッスンの mount）を跨いで状態を引き継ぐため。
 *   - LessonStoriesScreen は mount 時に isCoursePlayActiveFor(lessonId) を見て、
 *     一致すれば TTS 読み上げモードを自動起動する。
 *   - 各レッスンの読了で advanceCoursePlay() を呼び、次のレッスン ID を返す（無ければ null）。
 *   - 「コースを再生」はレッスンを完了扱いにしない（completion とは独立）。
 *     完了は従来どおりクイズ回答で成立する（feedback: 完了ガード）。
 *
 * sessionStorage キー: logic-tts-course-play
 *   値: JSON `{ lessonIds: number[]; index: number }`
 */

const KEY = 'logic-tts-course-play'

export type CoursePlaySession = {
  lessonIds: number[]
  index: number
}

function read(): CoursePlaySession | null {
  try {
    const raw = sessionStorage.getItem(KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<CoursePlaySession>
    if (!Array.isArray(parsed.lessonIds) || typeof parsed.index !== 'number') return null
    if (parsed.lessonIds.length === 0) return null
    return { lessonIds: parsed.lessonIds.map(Number), index: parsed.index }
  } catch {
    return null
  }
}

function write(session: CoursePlaySession | null): void {
  try {
    if (session) sessionStorage.setItem(KEY, JSON.stringify(session))
    else sessionStorage.removeItem(KEY)
  } catch {
    /* sessionStorage 無効環境では何もしない */
  }
}

/** コース再生セッションを開始する。最初のレッスン ID を返す（空なら null）。 */
export function startCoursePlay(lessonIds: number[]): number | null {
  const ids = lessonIds.filter((n) => Number.isFinite(n))
  if (ids.length === 0) return null
  write({ lessonIds: ids, index: 0 })
  return ids[0]
}

/** コース再生セッションを終了（クリア）する。 */
export function clearCoursePlay(): void {
  write(null)
}

/** コース再生セッションが進行中か。 */
export function isCoursePlayActive(): boolean {
  return read() !== null
}

/**
 * 指定レッスンがコース再生の「現在のレッスン」か。
 * LessonStoriesScreen の mount 時に、自動で読み上げモードを起動すべきか判定するのに使う。
 */
export function isCoursePlayCurrent(lessonId: number): boolean {
  const s = read()
  if (!s) return false
  return s.lessonIds[s.index] === lessonId
}

/**
 * 現在のレッスンを読了したので次のレッスンへ進める。
 * 次のレッスン ID を返す。最後のレッスンならセッションをクリアして null を返す。
 */
export function advanceCoursePlay(): number | null {
  const s = read()
  if (!s) return null
  const nextIndex = s.index + 1
  if (nextIndex >= s.lessonIds.length) {
    write(null)
    return null
  }
  write({ lessonIds: s.lessonIds, index: nextIndex })
  return s.lessonIds[nextIndex]
}
