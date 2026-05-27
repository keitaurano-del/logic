/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * AI カスタムコース永続化レイヤー
 *
 * 「あなた専用コース」（AI 生成）の保存・取得・削除と、Claude API 呼び出し。
 *
 * 設計:
 * - localStorage（logic-custom-courses）をキャッシュ兼オフラインソースに使う。
 * - 認証済みなら Supabase user_custom_courses と同期（roadmapStore のパターンに倣う）。
 * - 複数コースを保持。各コースに削除 UI。
 * - 課金: 無料は月 3 回、有料は無制限。回数の権威集計はサーバ（user_ai_course_usage）。
 */
import { getAllLessonsFlat } from './lessonData'
import { getLocale, localeBody } from './i18n'
import { isPaid } from './subscription'
import { API_BASE } from './apiBase'
import { getSyncUser } from './syncService'
import { getSupabaseClient } from './db/index'

const STORAGE_KEY = 'logic-custom-courses'

export type CustomCourse = {
  id: string
  title: string
  description: string
  lessonIds: number[]
  prompt: string
  createdAt: string
}

export const FREE_MONTHLY_LIMIT = 3

// =============================================
// localStorage
// =============================================

function load(): CustomCourse[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        return parsed.filter((c): c is CustomCourse =>
          !!c && typeof c.id === 'string' && Array.isArray(c.lessonIds))
      }
    }
  } catch { /* ignore */ }
  return []
}

function save(courses: CustomCourse[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(courses)) } catch { /* ignore */ }
}

/** 新しい順（createdAt 降順）でカスタムコースを返す */
export function loadCustomCourses(): CustomCourse[] {
  return load().sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export function getCustomCourse(id: string): CustomCourse | undefined {
  return load().find(c => c.id === id)
}

export function deleteCustomCourse(id: string): void {
  save(load().filter(c => c.id !== id))
  const userId = getSyncUser()
  if (userId) void deleteCustomCourseFromDB(userId, id)
}

/**
 * 生成済みのカスタムコースを保存（localStorage + Supabase）。
 * 生成（generateCustomCourse）とは分離してあるので、プレビューで「作り直す」を
 * 選んだ場合に未保存の試作を残さずに済む。
 */
export function saveCustomCourse(course: CustomCourse): void {
  const courses = load()
  if (courses.some(c => c.id === course.id)) return
  courses.unshift(course)
  save(courses)
  const userId = getSyncUser()
  if (userId) void pushCustomCourseToDB(userId, course)
}

// =============================================
// 生成（Claude API）
// =============================================

function genId(): string {
  try {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  } catch { /* ignore */ }
  return `cc-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
}

/**
 * ユーザーの自然文から AI でカスタムコースを生成して返す（保存はしない）。
 * 保存は呼び出し側でプレビュー確定後に saveCustomCourse() を呼ぶ。
 * 無料ユーザーの月次上限到達時は limitReached エラーを投げる。
 */
export async function generateCustomCourse(prompt: string): Promise<CustomCourse> {
  const isEn = getLocale() === 'en'
  const flat = getAllLessonsFlat()
  // 候補は id/title/category のみ（トークン節約・サーバ側でも再正規化される）
  const lessons = Object.values(flat).map(l => ({ id: l.id, title: l.title, category: l.category }))

  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  // 認証ユーザーは Bearer token を付けてサーバ側の課金回数チェックを有効化
  try {
    const db = getSupabaseClient()
    if (db) {
      const { data } = await (db as any).auth.getSession()
      const token = data?.session?.access_token
      if (token) headers['Authorization'] = `Bearer ${token}`
    }
  } catch { /* token なしでも続行（ゲスト扱い） */ }

  const res = await fetch(`${API_BASE}/api/generate-course`, {
    method: 'POST',
    headers,
    body: JSON.stringify(localeBody({ prompt, lessons })),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    const e = new Error(err.error || `HTTP ${res.status}`) as Error & { limitReached?: boolean }
    if (err.limitReached) e.limitReached = true
    throw e
  }
  const data = await res.json() as { title: string; description: string; lessonIds: number[] }

  const course: CustomCourse = {
    id: genId(),
    title: data.title || (isEn ? 'Your custom course' : 'あなた専用コース'),
    description: data.description || '',
    lessonIds: Array.isArray(data.lessonIds) ? data.lessonIds : [],
    prompt,
    createdAt: new Date().toISOString(),
  }
  // 生成成功＝サーバ側で 1 回消費されるので、クライアント概算カウンタも進める。
  // 保存（saveCustomCourse）はプレビュー確定後に別途呼ぶ。
  bumpGenCount()

  return course
}

// =============================================
// 無料プランの残り回数（クライアント表示用の概算）
// =============================================
// 権威ソースはサーバの user_ai_course_usage（保存有無に関わらず生成成功で消費）。
// クライアントでは当月の「生成成功回数」を localStorage カウンタに記録して残り回数を
// 概算表示する（厳密な enforcement はしない＝サーバが 429 を返す）。有料は無制限（-1）。
const USAGE_KEY = 'logic-custom-courses-usage'

function monthKey(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function readUsage(): { month: string; count: number } {
  try {
    const raw = localStorage.getItem(USAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as { month?: string; count?: number }
      if (parsed && typeof parsed.month === 'string' && typeof parsed.count === 'number') {
        return { month: parsed.month, count: parsed.count }
      }
    }
  } catch { /* ignore */ }
  return { month: monthKey(), count: 0 }
}

function bumpGenCount(): void {
  const mk = monthKey()
  const cur = readUsage()
  const count = cur.month === mk ? cur.count + 1 : 1
  try { localStorage.setItem(USAGE_KEY, JSON.stringify({ month: mk, count })) } catch { /* ignore */ }
}

export function getRemainingFreeGenerations(): number {
  if (isPaid()) return -1
  const cur = readUsage()
  const used = cur.month === monthKey() ? cur.count : 0
  return Math.max(0, FREE_MONTHLY_LIMIT - used)
}

// =============================================
// Supabase 同期（user_custom_courses）
// =============================================

type CustomCourseRow = {
  id: string
  title: string
  description: string
  lesson_ids: number[]
  prompt: string
  created_at: string
}

function rowToCourse(row: CustomCourseRow): CustomCourse {
  return {
    id: row.id,
    title: row.title ?? '',
    description: row.description ?? '',
    lessonIds: Array.isArray(row.lesson_ids) ? row.lesson_ids : [],
    prompt: row.prompt ?? '',
    createdAt: row.created_at || new Date().toISOString(),
  }
}

async function pushCustomCourseToDB(userId: string, course: CustomCourse): Promise<void> {
  const db = getSupabaseClient()
  if (!db) return
  try {
    const { error } = await (db as any)
      .from('user_custom_courses')
      .upsert(
        {
          id: course.id,
          user_id: userId,
          title: course.title,
          description: course.description,
          lesson_ids: course.lessonIds,
          prompt: course.prompt,
          created_at: course.createdAt,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' },
      )
    if (error) console.warn('[customCourseStore] push error:', error.message)
  } catch (e) {
    console.warn('[customCourseStore] push exception:', e)
  }
}

async function deleteCustomCourseFromDB(userId: string, id: string): Promise<void> {
  const db = getSupabaseClient()
  if (!db) return
  try {
    const { error } = await (db as any)
      .from('user_custom_courses')
      .delete()
      .eq('user_id', userId)
      .eq('id', id)
    if (error) console.warn('[customCourseStore] delete error:', error.message)
  } catch (e) {
    console.warn('[customCourseStore] delete exception:', e)
  }
}

/**
 * ログイン時の同期。
 * 戦略: id 単位で union（last-write-wins ではなく和集合）。
 * - リモートのみ存在 → ローカルに取り込む
 * - ローカルのみ存在 → リモートへ push
 * - 削除はクライアント操作時に即 DB 反映するので、ここでは「両方の和集合」を採る。
 */
export async function syncCustomCourses(userId: string): Promise<void> {
  const db = getSupabaseClient()
  if (!db) return
  try {
    const { data, error } = await (db as any)
      .from('user_custom_courses')
      .select('id, title, description, lesson_ids, prompt, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) {
      console.warn('[customCourseStore] sync fetch error:', error.message)
      return
    }
    const remote: CustomCourse[] = (data as CustomCourseRow[] | null ?? []).map(rowToCourse)
    const local = load()
    const remoteById = new Map(remote.map(c => [c.id, c]))
    const localById = new Map(local.map(c => [c.id, c]))

    // 和集合
    const mergedMap = new Map<string, CustomCourse>()
    for (const c of remote) mergedMap.set(c.id, c)
    for (const c of local) if (!mergedMap.has(c.id)) mergedMap.set(c.id, c)
    const merged = Array.from(mergedMap.values())
    save(merged)

    // ローカルにしかないものを DB へ push
    const toPush = local.filter(c => !remoteById.has(c.id))
    for (const c of toPush) {
      await pushCustomCourseToDB(userId, c)
    }

    if (import.meta.env.DEV) {
      console.log(
        '[customCourseStore] sync complete:',
        `remote=${remote.length}`,
        `local=${localById.size}`,
        `merged=${merged.length}`,
        `pushed=${toPush.length}`,
      )
    }
  } catch (e) {
    console.warn('[customCourseStore] sync failed:', e)
  }
}
