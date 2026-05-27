import { getSupabaseClient } from '../../supabase'
import type {
  AssistantConversation,
  AssistantRecommendedCourse,
  AssistantRecommendedLesson,
  DailyJournal,
  Goal,
  GoalCategory,
  PeriodType,
} from './types'

// ─── ハッシュタグの正規化・名寄せ ──────────────────────────────
// 表記ゆれの統一は「明確なゆれ」だけに限定する保守的ルール。
// 曖昧な類似統合（編集距離・部分一致での寄せ）は誤統合の原因になるため一切行わない。
//
// 正規化の対象（= 同一タグとみなす条件）:
//   - 前後の空白・内部の連続空白（タブ/改行含む）
//   - Unicode NFKC（全角英数記号→半角、半角カナ→全角カナなどの幅ゆれ）
//   - 先頭のハッシュ記号（半角 # / 全角 ＃）の有無
//   - ASCII 英字の大文字小文字（例: MECE と mece を同一視）
//
// 注意: 大小文字を畳むのは「照合キー」だけで、画面に出す「表示形」は
// 最初に登録された元の表記を保持する（MECE が mece に書き換わらないように）。

const MAX_TAG_LENGTH = 24

/**
 * タグの「表示形」を正規化する。同一タグ同士で表記を揃えるためのもので、
 * 大小文字は畳まない（MECE のような頭字語の見た目を壊さないため）。
 */
export function normalizeTagDisplay(raw: unknown): string {
  if (typeof raw !== 'string') return ''
  return raw
    .normalize('NFKC')           // 全角英数記号・幅ゆれを統一
    .replace(/[\r\n\t]+/g, ' ')  // 改行・タブは空白へ
    .replace(/^[#＃]+/, '')      // 先頭のハッシュ記号（半角/全角）を剥がす
    .replace(/\s+/g, ' ')        // 連続空白を 1 つに
    .trim()
    .slice(0, MAX_TAG_LENGTH)
}

/**
 * 名寄せ用の「照合キー」。表示形をさらに小文字化して、大小文字ゆれを同一視する。
 * このキーが一致するタグは同じタグとして 1 つにまとめる。
 */
export function tagMatchKey(raw: unknown): string {
  return normalizeTagDisplay(raw).toLowerCase()
}

/**
 * タグ配列を正規化・名寄せする。
 *   - 空タグを除去
 *   - 照合キー（小文字）が同じものは最初に出現した表示形へ寄せて重複排除
 *   - 出現順を保持
 */
export function normalizeTags(tags: unknown): string[] {
  if (!Array.isArray(tags)) return []
  const out: string[] = []
  const seen = new Set<string>()
  for (const raw of tags) {
    const display = normalizeTagDisplay(raw)
    if (!display) continue
    const key = display.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(display)
  }
  return out
}

export async function fetchJournalByDate(userId: string, date: string): Promise<DailyJournal | null> {
  const supabase = getSupabaseClient()
  if (!supabase) return null
  const { data, error } = await supabase
    .from('daily_journals')
    .select('*')
    .eq('user_id', userId)
    .eq('date', date)
    .maybeSingle()
  if (error) {
    console.warn('fetchJournalByDate:', error.message)
    return null
  }
  return data as DailyJournal | null
}

export async function fetchJournalsBetween(
  userId: string,
  startDate: string,
  endDate: string,
): Promise<DailyJournal[]> {
  const supabase = getSupabaseClient()
  if (!supabase) return []
  const { data, error } = await supabase
    .from('daily_journals')
    .select('*')
    .eq('user_id', userId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: false })
  if (error) {
    console.warn('fetchJournalsBetween:', error.message)
    return []
  }
  return (data as DailyJournal[]) ?? []
}

export async function upsertJournal(j: DailyJournal): Promise<{ error?: string }> {
  const supabase = getSupabaseClient()
  if (!supabase) return { error: 'supabase not configured' }
  // 互換: 旧 mood/weather カラムにも evening_* と同じ値を書いておく
  // （旧クライアント or sparkline 等のフォールバック先のため）
  const eveningMood = j.evening_mood ?? null
  const eveningWeather = j.evening_weather ?? null
  const payload = {
    user_id: j.user_id,
    date: j.date,
    mood: eveningMood ?? j.mood ?? null,
    weather: eveningWeather ?? j.weather ?? null,
    morning_mood: j.morning_mood ?? null,
    morning_weather: j.morning_weather ?? null,
    evening_mood: eveningMood,
    evening_weather: eveningWeather,
    morning_memo: j.morning_memo,
    schedule_notes: j.schedule_notes,
    evening_reflection: j.evening_reflection,
    ai_summary: j.ai_summary,
    // 保存時に必ず正規化・名寄せして書き込む。これにより、ユーザーがその日の
    // ジャーナルを開いて保存し直すたびに過去データも遡及的に整う。
    tags: normalizeTags(j.tags),
    steps_count: j.steps_count ?? null,
    sleep_minutes: j.sleep_minutes ?? null,
    sleep_start: j.sleep_start ?? null,
    sleep_end: j.sleep_end ?? null,
    images: Array.isArray(j.images) ? j.images : [],
  }
  const { error } = await supabase
    .from('daily_journals')
    .upsert(payload, { onConflict: 'user_id,date' })
  if (error) {
    // Supabase の PostgrestError は code/details/hint も含む。
    // 「column does not exist」「RLS denied」等の特定に必須なので全部出す。
    console.error('upsertJournal failed:', {
      message: error.message,
      code: (error as { code?: string }).code,
      details: (error as { details?: string }).details,
      hint: (error as { hint?: string }).hint,
    })
    // ユーザー向けには message と code（あれば）を返す
    const code = (error as { code?: string }).code
    return { error: code ? `${error.message} [${code}]` : error.message }
  }
  return {}
}

/**
 * 過去 N 日分のジャーナルを取得（カレンダー / スパークライン用）
 */
export async function fetchRecentJournals(userId: string, days = 30): Promise<DailyJournal[]> {
  const supabase = getSupabaseClient()
  if (!supabase) return []
  const end = new Date()
  const start = new Date(end.getTime() - (days - 1) * 86400000)
  const fmt = (d: Date) => d.toISOString().slice(0, 10)
  return fetchJournalsBetween(userId, fmt(start), fmt(end))
}

/**
 * 連続記録日数（streak）を計算。今日（または昨日まで）から遡って「ジャーナルが書かれた連続日数」を返す。
 * ジャーナルが書かれた = mood / weather / schedule_notes / evening_reflection / tags のどれかが入ってる
 */
export async function fetchJournalStreak(userId: string): Promise<number> {
  const supabase = getSupabaseClient()
  if (!supabase) return 0
  const end = new Date()
  const start = new Date(end.getTime() - 365 * 86400000)
  const fmt = (d: Date) => d.toISOString().slice(0, 10)
  const { data, error } = await supabase
    .from('daily_journals')
    .select('date, mood, weather, morning_mood, morning_weather, evening_mood, evening_weather, schedule_notes, evening_reflection, tags, images')
    .eq('user_id', userId)
    .gte('date', fmt(start))
    .lte('date', fmt(end))
    .order('date', { ascending: false })
  if (error) { console.warn('fetchJournalStreak:', error.message); return 0 }
  const rows = (data as Array<{
    date: string
    mood?: number | null
    weather?: string | null
    morning_mood?: number | null
    morning_weather?: string | null
    evening_mood?: number | null
    evening_weather?: string | null
    schedule_notes?: string | null
    evening_reflection?: string | null
    tags?: string[] | null
    images?: unknown[] | null
  }>) ?? []
  const dateSet = new Set(
    rows
      .filter((r) =>
        r.mood != null || !!r.weather
        || r.morning_mood != null || !!r.morning_weather
        || r.evening_mood != null || !!r.evening_weather
        || !!(r.schedule_notes && r.schedule_notes.trim())
        || !!(r.evening_reflection && r.evening_reflection.trim())
        || (r.tags && r.tags.length > 0)
        || (Array.isArray(r.images) && r.images.length > 0)
      )
      .map((r) => r.date)
  )
  let streak = 0
  let started = false
  for (let i = 0; i < 365; i++) {
    const d = new Date(end.getTime() - i * 86400000)
    if (dateSet.has(fmt(d))) { streak++; started = true }
    else if (!started && i === 0) { /* 今日未入力でも昨日から数える */ continue }
    else break
  }
  return streak
}

export async function searchJournals(userId: string, keyword: string): Promise<DailyJournal[]> {
  const supabase = getSupabaseClient()
  if (!supabase) return []
  const k = keyword.trim()
  if (!k) return []
  // LIKE インジェクション + PostgREST or フィルタ構文対策:
  //   - % _ \ : LIKE のメタ文字
  //   - , ( ) : PostgREST の or フィルタ区切り（含むと別フィルタとしてパースされる）
  //   - * : PostgREST のワイルドカード扱い
  // すべて取り除いて単純な文字列マッチに倒す（最大 100 文字に切り詰め）
  const esc = k
    .slice(0, 100)
    .replace(/[\\%_,()*]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  if (!esc) return []
  const pat = `%${esc}%`
  // タグ完全一致用キーワードは保存形と同じ正規化（NFKC・先頭#除去・空白統一）を適用して
  // 表記ゆれによる取りこぼしを減らす（大小文字は保存表示形に合わせ畳まない）。
  const tagEsc = normalizeTagDisplay(esc)
  // PostgREST の cs (contains) 配列フィルタはカンマ区切り内のカンマと衝突するため別クエリで取得して合成
  const orParts = [
    `morning_memo.ilike.${pat}`,
    `schedule_notes.ilike.${pat}`,
    `ai_summary.ilike.${pat}`,
    `evening_reflection.ilike.${pat}`,
  ]
  const [textRes, tagRes] = await Promise.all([
    supabase
      .from('daily_journals')
      .select('*')
      .eq('user_id', userId)
      .or(orParts.join(','))
      .order('date', { ascending: false })
      .limit(50),
    supabase
      .from('daily_journals')
      .select('*')
      .eq('user_id', userId)
      .contains('tags', [tagEsc || esc])
      .order('date', { ascending: false })
      .limit(50),
  ])
  if (textRes.error) console.warn('searchJournals(text):', textRes.error.message)
  if (tagRes.error) console.warn('searchJournals(tags):', tagRes.error.message)
  const merged = new Map<string, DailyJournal>()
  for (const r of (textRes.data as DailyJournal[] | null) ?? []) merged.set(r.date, r)
  for (const r of (tagRes.data as DailyJournal[] | null) ?? []) merged.set(r.date, r)
  return Array.from(merged.values())
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 50)
}

/**
 * ユーザーが過去に登録したタグの一覧（重複排除・出現回数の多い順）
 */
export async function fetchAllUserTags(userId: string, limit = 30): Promise<string[]> {
  const supabase = getSupabaseClient()
  if (!supabase) return []
  const { data, error } = await supabase
    .from('daily_journals')
    .select('tags')
    .eq('user_id', userId)
    .not('tags', 'is', null)
    .order('date', { ascending: false })
    .limit(365)
  if (error) {
    console.warn('fetchAllUserTags:', error.message)
    return []
  }
  // 照合キー（小文字・幅ゆれ統一）でまとめ、表示形は最頻のものを採用する。
  // これにより過去データに表記ゆれが残っていても読み出し時に名寄せされて見える。
  const counts = new Map<string, number>()                  // key → 合計出現数
  const displayCounts = new Map<string, Map<string, number>>() // key → (表示形 → 出現数)
  for (const row of (data as Array<{ tags: string[] | null }>) ?? []) {
    if (!Array.isArray(row.tags)) continue
    for (const tag of row.tags) {
      const display = normalizeTagDisplay(tag)
      if (!display) continue
      const key = display.toLowerCase()
      counts.set(key, (counts.get(key) ?? 0) + 1)
      const dc = displayCounts.get(key) ?? new Map<string, number>()
      dc.set(display, (dc.get(display) ?? 0) + 1)
      displayCounts.set(key, dc)
    }
  }
  const bestDisplay = (key: string): string => {
    const dc = displayCounts.get(key)
    if (!dc) return key
    // 最頻の表示形を採用。同数なら辞書順で安定させる。
    return Array.from(dc.entries())
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0][0]
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([key]) => bestDisplay(key))
}

/**
 * 指定期間の目標を全件取得（複数 OK）。created_at 昇順で安定表示。
 */
export async function fetchGoals(userId: string, periodType: PeriodType, periodKey: string): Promise<Goal[]> {
  const supabase = getSupabaseClient()
  if (!supabase) return []
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', userId)
    .eq('period_type', periodType)
    .eq('period_key', periodKey)
    .order('created_at', { ascending: true })
  if (error) {
    console.warn('fetchGoals:', error.message)
    return []
  }
  return (data as Goal[]) ?? []
}

/**
 * 「今日」のサマリー表示用に、週次/月次/年次の現在期間の目標を一括取得。
 */
export async function fetchCurrentGoalsAllPeriods(
  userId: string,
  keys: { weekly: string; monthly: string; yearly: string },
): Promise<{ weekly: Goal[]; monthly: Goal[]; yearly: Goal[] }> {
  const supabase = getSupabaseClient()
  if (!supabase) return { weekly: [], monthly: [], yearly: [] }
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', userId)
    .in('period_type', ['weekly', 'monthly', 'yearly'])
    .or(
      [
        `and(period_type.eq.weekly,period_key.eq.${keys.weekly})`,
        `and(period_type.eq.monthly,period_key.eq.${keys.monthly})`,
        `and(period_type.eq.yearly,period_key.eq.${keys.yearly})`,
      ].join(','),
    )
    .order('created_at', { ascending: true })
  if (error) {
    console.warn('fetchCurrentGoalsAllPeriods:', error.message)
    return { weekly: [], monthly: [], yearly: [] }
  }
  const all = (data as Goal[]) ?? []
  return {
    weekly:  all.filter((g) => g.period_type === 'weekly'  && g.period_key === keys.weekly),
    monthly: all.filter((g) => g.period_type === 'monthly' && g.period_key === keys.monthly),
    yearly:  all.filter((g) => g.period_type === 'yearly'  && g.period_key === keys.yearly),
  }
}

export async function createGoal(g: {
  user_id: string
  period_type: PeriodType
  period_key: string
  title: string
  description: string | null
  category: GoalCategory | null
}): Promise<{ goal?: Goal; error?: string }> {
  const supabase = getSupabaseClient()
  if (!supabase) return { error: 'supabase not configured' }
  const { data, error } = await supabase
    .from('goals')
    .insert(g)
    .select('*')
    .maybeSingle()
  if (error) return { error: error.message }
  return { goal: data as Goal }
}

export async function updateGoal(
  id: string,
  patch: { title?: string; description?: string | null; category?: GoalCategory | null; status?: 'active' | 'completed' },
): Promise<{ goal?: Goal; error?: string }> {
  const supabase = getSupabaseClient()
  if (!supabase) return { error: 'supabase not configured' }
  const { data, error } = await supabase
    .from('goals')
    .update(patch)
    .eq('id', id)
    .select('*')
    .maybeSingle()
  if (error) return { error: error.message }
  return { goal: data as Goal }
}

export async function deleteGoal(id: string): Promise<{ error?: string }> {
  const supabase = getSupabaseClient()
  if (!supabase) return { error: 'supabase not configured' }
  const { error } = await supabase
    .from('goals')
    .delete()
    .eq('id', id)
  if (error) return { error: error.message }
  return {}
}

// ─── AI アシスタント会話履歴 ─────────────────────────────────────
// daily_journals / goals と同じく Supabase をストレージにする。Supabase 未設定
// （ゲスト・オフライン）の場合は no-op で握りつぶす（既存ジャーナル機能と同じ方針）。

/** 推薦レッスン配列を保存可能な軽量形へ正規化する（不正値はスキップ）。 */
function sanitizeRecommendedLessons(raw: unknown): AssistantRecommendedLesson[] {
  if (!Array.isArray(raw)) return []
  const out: AssistantRecommendedLesson[] = []
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue
    const r = item as Record<string, unknown>
    const id = typeof r.id === 'number' ? r.id : Number(r.id)
    if (!Number.isFinite(id) || id <= 0) continue
    out.push({
      id,
      title: typeof r.title === 'string' ? r.title : '',
      category: typeof r.category === 'string' ? r.category : '',
    })
  }
  return out
}

/** 推薦コース配列を保存可能な軽量形へ正規化する（不正値はスキップ）。 */
function sanitizeRecommendedCourses(raw: unknown): AssistantRecommendedCourse[] {
  if (!Array.isArray(raw)) return []
  const out: AssistantRecommendedCourse[] = []
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue
    const r = item as Record<string, unknown>
    const id = typeof r.id === 'string' ? r.id : ''
    if (!id) continue
    out.push({
      id,
      title: typeof r.title === 'string' ? r.title : '',
      category: typeof r.category === 'string' ? r.category : '',
      image: typeof r.image === 'string' ? r.image : undefined,
      lessonCount: typeof r.lessonCount === 'number' ? r.lessonCount : 0,
    })
  }
  return out
}

/**
 * AI アシスタントの会話（アドバイス本文 + 推薦レッスン/コース）を1件保存する。
 * 本文が空の場合は保存しない（履歴に空レコードを残さない）。
 */
export async function saveAssistantConversation(
  userId: string,
  conv: { feedback: string; recommendedLessons: AssistantRecommendedLesson[]; recommendedCourses: AssistantRecommendedCourse[] },
): Promise<{ conversation?: AssistantConversation; error?: string }> {
  const supabase = getSupabaseClient()
  if (!supabase) return {}
  const feedback = (conv.feedback || '').trim()
  if (!feedback) return {}
  const payload = {
    user_id: userId,
    feedback,
    recommended_lessons: sanitizeRecommendedLessons(conv.recommendedLessons),
    recommended_courses: sanitizeRecommendedCourses(conv.recommendedCourses),
  }
  const { data, error } = await supabase
    .from('journal_assistant_conversations')
    .insert(payload)
    .select('*')
    .maybeSingle()
  if (error) {
    console.warn('saveAssistantConversation:', error.message)
    return { error: error.message }
  }
  return { conversation: data as AssistantConversation }
}

/**
 * AI アシスタントの会話履歴を新しい順に取得する。
 */
export async function fetchAssistantConversations(userId: string, limit = 50): Promise<AssistantConversation[]> {
  const supabase = getSupabaseClient()
  if (!supabase) return []
  const { data, error } = await supabase
    .from('journal_assistant_conversations')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) {
    console.warn('fetchAssistantConversations:', error.message)
    return []
  }
  return ((data as Array<Record<string, unknown>>) ?? []).map((row) => ({
    id: typeof row.id === 'string' ? row.id : undefined,
    user_id: typeof row.user_id === 'string' ? row.user_id : undefined,
    feedback: typeof row.feedback === 'string' ? row.feedback : '',
    recommended_lessons: sanitizeRecommendedLessons(row.recommended_lessons),
    recommended_courses: sanitizeRecommendedCourses(row.recommended_courses),
    created_at: typeof row.created_at === 'string' ? row.created_at : undefined,
  }))
}

/**
 * AI アシスタントの会話履歴を1件削除する。
 */
export async function deleteAssistantConversation(id: string): Promise<{ error?: string }> {
  const supabase = getSupabaseClient()
  if (!supabase) return { error: 'supabase not configured' }
  const { error } = await supabase
    .from('journal_assistant_conversations')
    .delete()
    .eq('id', id)
  if (error) {
    console.warn('deleteAssistantConversation:', error.message)
    return { error: error.message }
  }
  return {}
}

