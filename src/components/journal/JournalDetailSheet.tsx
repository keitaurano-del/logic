import { useEffect, useMemo, useRef, useState } from 'react'
import type { DailyJournal, JournalImage, Mood, Weather } from './types'
import { MoodSelector, WeatherSelector } from './MoodWeatherSelector'
import { MoodIcon, WeatherIcon } from './MoodWeatherIcons'
import { VoiceTextarea } from './VoiceTextarea'
import { TagInput } from './TagInput'
import { JournalActivityList } from './JournalActivityList'
import { JournalHealthCard } from './JournalHealthCard'
import { JournalImageGrid } from './JournalImageGrid'
import type { HealthSnapshot } from '../../platform/health'
import { SparkleIcon } from './MoodWeatherIcons'
import { PencilIcon, XIcon } from '../../icons'
import { fetchJournalByDate, upsertJournal, normalizeTags, tagMatchKey, fetchAllUserTags } from './journalDb'
import { suggestJournalTags } from './journalApi'
import { applyConsolidations, canonicalizeTags } from './tagConsolidation'
import { JournalXpToast } from './JournalXpToast'
import { JournalRichText } from './JournalRichText'
import { awardJournalXp } from '../../stats'
import { t, getLocale } from '../../i18n'

interface JournalDetailSheetProps {
  userId: string
  date: string // YYYY-MM-DD
  initialJournal?: DailyJournal | null
  /** 開いた時点で固定したいフェーズ。指定がなければ既存ロジックで自動判定 */
  initialPhase?: Phase
  onClose: () => void
  onSaved?: (j: DailyJournal) => void
}

type Phase = 'morning' | 'evening'

function emptyJournal(userId: string, date: string): DailyJournal {
  return {
    user_id: userId,
    date,
    mood: null,
    weather: null,
    morning_mood: null,
    morning_weather: null,
    evening_mood: null,
    evening_weather: null,
    morning_memo: null,
    schedule_notes: null,
    evening_reflection: null,
    ai_summary: null,
    tags: [],
    images: [],
  }
}

function hasMorningContent(
  scheduleNotes: string,
  tags: string[],
  morningMood: Mood | null,
  morningWeather: Weather | null,
): boolean {
  return !!(scheduleNotes.trim() || tags.length > 0 || morningMood !== null || morningWeather)
}

function hasEveningContent(mood: Mood | null, weather: Weather | null, reflection: string): boolean {
  return !!(mood !== null || weather || reflection.trim())
}

function hasContent(j: DailyJournal | null | undefined): boolean {
  if (!j) return false
  return !!(
    (j.mood != null) ||
    j.weather ||
    (j.morning_mood != null) ||
    j.morning_weather ||
    (j.evening_mood != null) ||
    j.evening_weather ||
    (j.schedule_notes && j.schedule_notes.trim()) ||
    (j.evening_reflection && j.evening_reflection.trim()) ||
    (j.ai_summary && j.ai_summary.trim()) ||
    (j.tags && j.tags.length > 0) ||
    (j.images && j.images.length > 0)
  )
}

function decideInitialPhase(j: DailyJournal | null): Phase {
  if (j) {
    const mMood = (j.morning_mood as Mood | null) ?? null
    const mWeather = (j.morning_weather as Weather | null) ?? null
    const eMood = (j.evening_mood as Mood | null) ?? (j.mood as Mood | null) ?? null
    const eWeather = (j.evening_weather as Weather | null) ?? (j.weather as Weather | null) ?? null
    const m = hasMorningContent(j.schedule_notes ?? '', j.tags ?? [], mMood, mWeather)
    const e = hasEveningContent(eMood, eWeather, j.evening_reflection ?? '')
    if (m && !e) return 'morning'
    if (e && !m) return 'evening'
  }
  const h = new Date().getHours()
  return h < 16 ? 'morning' : 'evening'
}

export function JournalDetailSheet({ userId, date, initialJournal, initialPhase, onClose, onSaved }: JournalDetailSheetProps) {
  const [journal, setJournal] = useState<DailyJournal | null>(initialJournal ?? null)
  const [morningMood, setMorningMood] = useState<Mood | null>((initialJournal?.morning_mood as Mood | null) ?? null)
  const [morningWeather, setMorningWeather] = useState<Weather | null>((initialJournal?.morning_weather as Weather | null) ?? null)
  // 夜は legacy mood/weather もフォールバックとして取り込む（旧データ互換）
  const [eveningMood, setEveningMood] = useState<Mood | null>(
    (initialJournal?.evening_mood as Mood | null) ?? (initialJournal?.mood as Mood | null) ?? null,
  )
  const [eveningWeather, setEveningWeather] = useState<Weather | null>(
    (initialJournal?.evening_weather as Weather | null) ?? (initialJournal?.weather as Weather | null) ?? null,
  )
  const [scheduleNotes, setScheduleNotes] = useState<string>(initialJournal?.schedule_notes ?? '')
  const [reflection, setReflection] = useState<string>(initialJournal?.evening_reflection ?? '')
  const [tags, setTags] = useState<string[]>(initialJournal?.tags ?? [])
  const [health, setHealth] = useState<HealthSnapshot>(() => ({
    steps: initialJournal?.steps_count ?? null,
    sleepMinutes: initialJournal?.sleep_minutes ?? null,
    sleepStart: initialJournal?.sleep_start ?? null,
    sleepEnd: initialJournal?.sleep_end ?? null,
  }))
  const [images, setImages] = useState<JournalImage[]>(initialJournal?.images ?? [])
  const aiSummary = journal?.ai_summary ?? ''

  const [phase, setPhase] = useState<Phase>(() => initialPhase ?? decideInitialPhase(initialJournal ?? null))

  // initialPhase 指定（FAB 経由）の場合は最初から編集モードで開く
  const startsEditing = !!initialPhase || !hasContent(initialJournal)
  const [editing, setEditing] = useState(startsEditing)

  const [loading, setLoading] = useState(initialJournal === undefined)
  const [saving, setSaving] = useState(false)
  const [savedToast, setSavedToast] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [aiTagToast, setAiTagToast] = useState<string | null>(null)
  const [xpToast, setXpToast] = useState<{ xp: number; label: string } | null>(null)
  // D3 層2: タグ自動統合の undo。統合直前のタグ配列（スナップショット）を保持し、
  // トーストの「元に戻す」で setTags / 再 upsert して非可逆な統合を取り消せるようにする。
  const [tagUndoSnapshot, setTagUndoSnapshot] = useState<string[] | null>(null)

  const modalRef = useRef<HTMLDivElement>(null)
  const closeBtnRef = useRef<HTMLButtonElement>(null)
  const previouslyFocusedRef = useRef<HTMLElement | null>(null)

  // T-N: ヘッダ/ハンドル領域からの下スワイプでシートを閉じる。
  // 入力欄やスクロール領域では誤爆させたくないので、ドラッグの起点はハンドル領域に限定する。
  // dragY > CLOSE_THRESHOLD か、十分な下向きフリック速度を超えたら onClose。未満なら 0 に戻す。
  const CLOSE_THRESHOLD = 110
  const FLICK_VELOCITY = 0.6 // px/ms
  const [dragY, setDragY] = useState(0)
  const [dragging, setDragging] = useState(false)
  const dragStartRef = useRef<{ y: number; t: number } | null>(null)

  const handleDragStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    if (!touch) return
    dragStartRef.current = { y: touch.clientY, t: Date.now() }
    setDragging(true)
  }

  const handleDragMove = (e: React.TouchEvent) => {
    const start = dragStartRef.current
    const touch = e.touches[0]
    if (!start || !touch) return
    const delta = touch.clientY - start.y
    // 下方向のみ追従。上方向は 0 固定（シート内スクロールを邪魔しない）。
    setDragY(delta > 0 ? delta : 0)
  }

  const handleDragEnd = (e: React.TouchEvent) => {
    const start = dragStartRef.current
    dragStartRef.current = null
    setDragging(false)
    if (!start) {
      setDragY(0)
      return
    }
    const touch = e.changedTouches[0]
    const delta = touch ? touch.clientY - start.y : dragY
    const elapsed = Math.max(1, Date.now() - start.t)
    const velocity = delta / elapsed
    if (delta > CLOSE_THRESHOLD || (delta > 40 && velocity > FLICK_VELOCITY)) {
      onClose()
    } else {
      setDragY(0)
    }
  }

  useEffect(() => {
    if (initialJournal !== undefined) return
    let cancelled = false
    ;(async () => {
      const j = await fetchJournalByDate(userId, date)
      if (cancelled) return
      if (j) {
        setJournal(j)
        setMorningMood((j.morning_mood as Mood | null) ?? null)
        setMorningWeather((j.morning_weather as Weather | null) ?? null)
        setEveningMood((j.evening_mood as Mood | null) ?? (j.mood as Mood | null) ?? null)
        setEveningWeather((j.evening_weather as Weather | null) ?? (j.weather as Weather | null) ?? null)
        setScheduleNotes(j.schedule_notes ?? '')
        setReflection(j.evening_reflection ?? '')
        setTags(j.tags ?? [])
        setHealth({
          steps: j.steps_count ?? null,
          sleepMinutes: j.sleep_minutes ?? null,
          sleepStart: j.sleep_start ?? null,
          sleepEnd: j.sleep_end ?? null,
        })
        setImages(j.images ?? [])
        if (!initialPhase) setPhase(decideInitialPhase(j))
        // FAB から開いた場合（initialPhase 指定）は既存データがあっても編集モードのまま
        if (!initialPhase && hasContent(j)) setEditing(false)
      } else {
        setEditing(true)
      }
      setLoading(false)
    })()
    return () => { cancelled = true }
    // initialPhase は初回 mount 時にのみ参照（後から変えてフェーズを上書きしたくない）
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, date, initialJournal])

  useEffect(() => {
    previouslyFocusedRef.current = document.activeElement as HTMLElement | null
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
        return
      }
      if (e.key === 'Tab') {
        const root = modalRef.current
        if (!root) return
        const focusables = root.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select, textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
        if (focusables.length === 0) return
        const first = focusables[0]
        const last = focusables[focusables.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', handleKey)
    closeBtnRef.current?.focus()

    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = prevOverflow
      previouslyFocusedRef.current?.focus?.()
    }
  }, [onClose])

  const moodLabelOf = (m: Mood | null): string | null => {
    if (m === null) return null
    const key = ({
      1: 'journal.moodVeryBad',
      2: 'journal.moodBad',
      3: 'journal.moodNeutral',
      4: 'journal.moodGood',
      5: 'journal.moodGreat',
    } as Record<number, string>)[m]
    return key ? t(key) : null
  }
  const weatherLabelOf = (w: Weather | null): string | null => {
    if (!w) return null
    const key = ({
      sunny: 'journal.weatherSunny',
      cloudy: 'journal.weatherCloudy',
      rainy: 'journal.weatherRainy',
      snowy: 'journal.weatherSnowy',
    } as Record<string, string>)[w]
    return key ? t(key) : null
  }
  const morningMoodLabel = useMemo(() => moodLabelOf(morningMood), [morningMood])
  const morningWeatherLabel = useMemo(() => weatherLabelOf(morningWeather), [morningWeather])
  const eveningMoodLabel = useMemo(() => moodLabelOf(eveningMood), [eveningMood])
  const eveningWeatherLabel = useMemo(() => weatherLabelOf(eveningWeather), [eveningWeather])

  const handleSave = async () => {
    setSaving(true)
    setSaveError(null)
    const trimmedSchedule = scheduleNotes.trim()
    const trimmedReflection = reflection.trim()
    const updated: DailyJournal = {
      ...emptyJournal(userId, date),
      // legacy mood/weather は upsertJournal 内で evening_* に揃える
      mood: eveningMood,
      weather: eveningWeather,
      morning_mood: morningMood,
      morning_weather: morningWeather,
      evening_mood: eveningMood,
      evening_weather: eveningWeather,
      schedule_notes: trimmedSchedule || null,
      evening_reflection: trimmedReflection || null,
      ai_summary: aiSummary.trim() || null,
      tags,
      steps_count: health.steps,
      sleep_minutes: health.sleepMinutes,
      sleep_start: health.sleepStart,
      sleep_end: health.sleepEnd,
      images,
    }
    // 保存前: この保存で「初めて朝/夜が埋まる」かを判定（XP は新規完成時のみ）
    const prevMorningMood = (journal?.morning_mood as Mood | null) ?? null
    const prevMorningWeather = (journal?.morning_weather as Weather | null) ?? null
    const prevEveningMood = (journal?.evening_mood as Mood | null) ?? (journal?.mood as Mood | null) ?? null
    const prevEveningWeather = (journal?.evening_weather as Weather | null) ?? (journal?.weather as Weather | null) ?? null
    const wasMorning = hasMorningContent(journal?.schedule_notes ?? '', journal?.tags ?? [], prevMorningMood, prevMorningWeather)
    const wasEvening = hasEveningContent(prevEveningMood, prevEveningWeather, journal?.evening_reflection ?? '')
    const nowMorning = hasMorningContent(trimmedSchedule, tags, morningMood, morningWeather)
    const nowEvening = hasEveningContent(eveningMood, eveningWeather, trimmedReflection)

    const { error } = await upsertJournal(updated)
    setSaving(false)
    if (error) {
      console.error('[journal] upsertJournal failed:', error)
      setSaveError(error)
      return
    }

    setJournal(updated)
    setSavedToast(true)
    onSaved?.(updated)
    setEditing(false)
    setTimeout(() => setSavedToast(false), 1500)

    // 初めて朝/夜が完成した瞬間のみ XP 付与 + アニメーション。
    // awardJournalXp は同日同フェーズで既に付与済みなら 0 を返すので二重付与は起きない。
    if (!wasMorning && nowMorning) {
      const gained = awardJournalXp(date, 'morning')
      if (gained > 0) setXpToast({ xp: gained, label: t('journal.xpMorningLabel') })
    } else if (!wasEvening && nowEvening) {
      const gained = awardJournalXp(date, 'evening')
      if (gained > 0) setXpToast({ xp: gained, label: t('journal.xpEveningLabel') })
    }

    // バックグラウンドで AI タグ提案。既存タグが少なく (<4)、本文がある場合のみ。
    const hasText = trimmedSchedule.length > 5 || trimmedReflection.length > 5
    if (hasText && tags.length < 4) {
      ;(async () => {
        // ユーザーの既存タグ（頻度上位）も渡す。AI は既存タグ再利用を最優先し、
        // 重複している既存タグ同士を consolidations (from=>to) で統合提案できる。
        const userTags = await fetchAllUserTags(userId, 40)
        const { suggestedTags, consolidations } = await suggestJournalTags({
          scheduleNotes: trimmedSchedule,
          eveningReflection: trimmedReflection,
          existingTags: userTags.length > 0 ? userTags : tags,
        })

        // D3 層2: AI の統合提案を「今回保存するタグ + その保存に関係する既存タグ」へ適用。
        // 完全自動。同一 axis ガード・スナップショット・ログを内蔵（applyConsolidations）。
        const locale = getLocale()
        let baseTags = tags
        let didConsolidate = false
        if (consolidations && consolidations.length > 0) {
          const result = applyConsolidations(tags, consolidations, {
            existingTags: userTags,
            locale,
            enforceAxisGuard: true,
          })
          if (result.applied.length > 0) {
            // 結果はログに残す（要件 (c)）。本番反映時は observability に集約余地あり。
            console.info('[journal] tag consolidation applied:', {
              applied: result.applied,
              rejected: result.rejected,
            })
          }
          if (result.changed) {
            baseTags = result.tags
            didConsolidate = result.applied.length > 0
            // undo 用に統合直前の状態（生の tags）を保持。
            if (didConsolidate) setTagUndoSnapshot(result.snapshot)
          }
        }

        const newSuggestions = suggestedTags ?? []
        // 既存タグ（統合適用後の baseTags）と照合キーで重複排除してから補完タグを追加。
        const existingKeys = new Set(baseTags.map((t2) => tagMatchKey(t2)))
        const additions = newSuggestions
          .filter((s) => s && !existingKeys.has(tagMatchKey(s)))
          .slice(0, Math.max(0, 5 - baseTags.length))

        // 統合も追加も無ければ何もしない。
        if (!didConsolidate && additions.length === 0) return

        // 保存・表示で一貫させるため、統制語彙の名寄せ(層1)→T3 正規化を通す。
        const merged = normalizeTags(canonicalizeTags([...baseTags, ...additions], locale))
        // 元の tags と実質変化が無ければ書き込みもトーストもしない。
        const sameAsBefore =
          merged.length === tags.length &&
          merged.every((tg, i) => tagMatchKey(tg) === tagMatchKey(tags[i] ?? ''))
        if (sameAsBefore) return

        const reupdated: DailyJournal = { ...updated, tags: merged }
        const { error: e2 } = await upsertJournal(reupdated)
        if (e2) return
        setTags(merged)
        setJournal(reupdated)
        onSaved?.(reupdated)
        if (didConsolidate) {
          setAiTagToast(t('journal.tagsConsolidated'))
        } else {
          setAiTagToast(t('journal.aiTagsAdded', { n: String(additions.length) }))
        }
        setTimeout(() => setAiTagToast(null), didConsolidate ? 6000 : 2400)
      })()
    }
  }

  // D3 層2: タグ自動統合を取り消す。スナップショット（統合直前の生タグ）へ戻して再保存する。
  const handleUndoConsolidation = async () => {
    if (!tagUndoSnapshot) return
    const snapshot = tagUndoSnapshot
    const base = journal ?? emptyJournal(userId, date)
    const reverted: DailyJournal = { ...base, user_id: userId, date, tags: normalizeTags(snapshot) }
    const { error } = await upsertJournal(reverted)
    if (error) return
    setTags(reverted.tags)
    setJournal(reverted)
    onSaved?.(reverted)
    setTagUndoSnapshot(null)
    setAiTagToast(null)
  }

  const handleEnterEdit = () => setEditing(true)

  const handleCancelEdit = () => {
    if (journal) {
      setMorningMood((journal.morning_mood as Mood | null) ?? null)
      setMorningWeather((journal.morning_weather as Weather | null) ?? null)
      setEveningMood((journal.evening_mood as Mood | null) ?? (journal.mood as Mood | null) ?? null)
      setEveningWeather((journal.evening_weather as Weather | null) ?? (journal.weather as Weather | null) ?? null)
      setScheduleNotes(journal.schedule_notes ?? '')
      setReflection(journal.evening_reflection ?? '')
      setTags(journal.tags ?? [])
      // images は即保存方式（Storage に upload 済み）なのでキャンセル時もそのまま残す
      setEditing(false)
    } else {
      onClose()
    }
  }

  // 画像の追加・削除は Storage への upload/delete が即時走るため、DB の images カラムも
  // ここで即時 upsert して整合を取る（編集モードのキャンセルでは画像変更は巻き戻さない）。
  const handleImagesChange = async (next: JournalImage[]) => {
    setImages(next)
    const base = journal ?? emptyJournal(userId, date)
    const updated: DailyJournal = {
      ...base,
      user_id: userId,
      date,
      images: next,
    }
    const { error } = await upsertJournal(updated)
    if (error) return
    setJournal(updated)
    onSaved?.(updated)
  }

  const morningWritten = hasMorningContent(scheduleNotes, tags, morningMood, morningWeather)
  const eveningWritten = hasEveningContent(eveningMood, eveningWeather, reflection)
  const hasImages = images.length > 0

  const renderImagesSection = (mode: 'edit' | 'view') => (
    <div className="journal-view-section">
      <div className="journal-modal__section-label">{t('journal.imagesLabel')}</div>
      <JournalImageGrid
        userId={userId}
        date={date}
        images={images}
        editing={mode === 'edit'}
        onChange={handleImagesChange}
        disabled={saving}
      />
    </div>
  )

  const renderPhaseTabs = () => (
    <div className="journal-phase-tabs" role="tablist" aria-label={t('journal.phaseTabs')}>
      <button
        type="button"
        role="tab"
        aria-selected={phase === 'morning'}
        className={`journal-phase-tab ${phase === 'morning' ? 'journal-phase-tab--active' : ''}`}
        onClick={() => setPhase('morning')}
      >
        <span className="journal-emoji-icon journal-phase-tab__emoji" aria-hidden="true">☀️</span>
        <span>{t('journal.phaseMorning')}</span>
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={phase === 'evening'}
        className={`journal-phase-tab ${phase === 'evening' ? 'journal-phase-tab--active' : ''}`}
        onClick={() => setPhase('evening')}
      >
        <span className="journal-emoji-icon journal-phase-tab__emoji" aria-hidden="true">🌙</span>
        <span>{t('journal.phaseEvening')}</span>
      </button>
    </div>
  )

  const renderMorningEdit = () => (
    <>
      <div>
        <div className="journal-section__label" style={{ marginBottom: 8 }}>{t('journal.moodLabel')}</div>
        <MoodSelector value={morningMood} onChange={setMorningMood} disabled={saving} />
      </div>
      <div>
        <div className="journal-section__label" style={{ marginBottom: 8 }}>{t('journal.weatherLabel')}</div>
        <WeatherSelector value={morningWeather} onChange={setMorningWeather} disabled={saving} />
      </div>
      <div>
        <div className="journal-section__label" style={{ marginBottom: 8 }}>{t('journal.intentLabel')}</div>
        <VoiceTextarea
          value={scheduleNotes}
          onChange={setScheduleNotes}
          placeholder={t('journal.intentPlaceholder')}
          ariaLabel={t('journal.intentLabel')}
          enableCleanup
          showVoiceHint
        />
      </div>
      <div>
        <div className="journal-section__label" style={{ marginBottom: 8 }}>{t('journal.tagsLabel')}</div>
        <TagInput
          value={tags}
          onChange={setTags}
          placeholder={t('journal.tagsPlaceholder')}
        />
      </div>
    </>
  )

  const renderEveningEdit = () => (
    <>
      <div>
        <div className="journal-section__label" style={{ marginBottom: 8 }}>{t('journal.moodLabel')}</div>
        <MoodSelector value={eveningMood} onChange={setEveningMood} disabled={saving} />
      </div>
      <div>
        <div className="journal-section__label" style={{ marginBottom: 8 }}>{t('journal.weatherLabel')}</div>
        <WeatherSelector value={eveningWeather} onChange={setEveningWeather} disabled={saving} />
      </div>
      <div>
        <div className="journal-section__label" style={{ marginBottom: 8 }}>{t('journal.eveningReflection')}</div>
        <VoiceTextarea
          value={reflection}
          onChange={setReflection}
          placeholder={t('journal.eveningPlaceholder')}
          ariaLabel={t('journal.eveningReflection')}
          minHeight={120}
          enableCleanup
          showVoiceHint
        />
      </div>
      <div>
        <div className="journal-section__label" style={{ marginBottom: 8 }}>{t('journal.healthTitle')}</div>
        <JournalHealthCard date={date} initial={health} onSnapshot={setHealth} />
      </div>
      <div>
        <div className="journal-section__label" style={{ marginBottom: 8 }}>{t('journal.activityTitle')}</div>
        <JournalActivityList date={date} />
      </div>
    </>
  )

  const renderMorningView = () => (
    <div className="journal-view-block">
      <div className="journal-view-block__title">
        <span className="journal-emoji-icon" aria-hidden="true">☀️</span>
        <span>{t('journal.phaseMorning')}</span>
      </div>
      {(morningMoodLabel || morningWeatherLabel) && (
        <div className="journal-view-row">
          {morningMoodLabel && (
            <div className="journal-view-chip">
              <MoodIcon mood={morningMood as Mood} size={18} />
              <span>{morningMoodLabel}</span>
            </div>
          )}
          {morningWeatherLabel && (
            <div className="journal-view-chip">
              <WeatherIcon weather={morningWeather as Weather} size={18} />
              <span>{morningWeatherLabel}</span>
            </div>
          )}
        </div>
      )}
      {scheduleNotes.trim() && (
        <div className="journal-view-section">
          <div className="journal-modal__section-label">{t('journal.intentLabel')}</div>
          <div className="journal-modal__body">{scheduleNotes}</div>
        </div>
      )}
      {tags.length > 0 && (
        <div className="journal-view-section">
          <div className="journal-modal__section-label">{t('journal.tagsLabel')}</div>
          <div className="journal-view-tags">
            {tags.map((tag) => (
              <span key={tag} className="journal-tag-chip">
                <span className="journal-tag-chip__text">{tag}</span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  const renderEveningView = () => (
    <div className="journal-view-block">
      <div className="journal-view-block__title">
        <span className="journal-emoji-icon" aria-hidden="true">🌙</span>
        <span>{t('journal.phaseEvening')}</span>
      </div>
      {(eveningMoodLabel || eveningWeatherLabel) && (
        <div className="journal-view-row">
          {eveningMoodLabel && (
            <div className="journal-view-chip">
              <MoodIcon mood={eveningMood as Mood} size={18} />
              <span>{eveningMoodLabel}</span>
            </div>
          )}
          {eveningWeatherLabel && (
            <div className="journal-view-chip">
              <WeatherIcon weather={eveningWeather as Weather} size={18} />
              <span>{eveningWeatherLabel}</span>
            </div>
          )}
        </div>
      )}
      {reflection.trim() && (
        <div className="journal-view-section">
          <div className="journal-modal__section-label">{t('journal.eveningReflection')}</div>
          <div className="journal-modal__body">{reflection}</div>
        </div>
      )}
      <div className="journal-view-section">
        <div className="journal-modal__section-label">{t('journal.healthTitle')}</div>
        <JournalHealthCard date={date} initial={health} onSnapshot={setHealth} />
      </div>
      <div className="journal-view-section">
        <div className="journal-modal__section-label">{t('journal.activityTitle')}</div>
        <JournalActivityList date={date} />
      </div>
    </div>
  )

  return (
    <div className="journal-modal-overlay" role="dialog" aria-modal="true" aria-label={date}>
      <button
        type="button"
        ref={closeBtnRef}
        aria-label={t('journal.closeSheet')}
        onClick={onClose}
        style={{ position: 'absolute', inset: 0, background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
      />
      <div
        ref={modalRef}
        className="journal-modal"
        style={{
          position: 'relative',
          transform: dragY > 0 ? `translateY(${dragY}px)` : undefined,
          transition: dragging ? 'none' : 'transform 0.22s cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}
      >
        {/* T-N: ハンドル + ヘッダを下スワイプのドラッグ領域にする（入力欄やスクロール本文は対象外） */}
        <div
          className="journal-modal__drag-zone"
          onTouchStart={handleDragStart}
          onTouchMove={handleDragMove}
          onTouchEnd={handleDragEnd}
          onTouchCancel={handleDragEnd}
        >
          <div className="journal-modal__bar" aria-hidden="true" />
          <div className="journal-modal__header">
            <div className="journal-modal__title">{date}</div>
            <div className="journal-modal__header-actions">
              {!editing && !loading && hasContent(journal) && (
                <button
                  type="button"
                  className="journal-modal__edit-btn"
                  onClick={handleEnterEdit}
                  aria-label={t('journal.editEntry')}
                >
                  <PencilIcon width={14} height={14} />
                  <span>{t('common.edit')}</span>
                </button>
              )}
              <button
                type="button"
                className="journal-modal__close-btn"
                onClick={onClose}
                aria-label={t('journal.closeSheet')}
              >
                <XIcon width={24} height={24} />
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="journal-modal__empty">{t('common.loading')}</div>
        ) : editing ? (
          <>
            {aiSummary && (
              <div className="journal-summary-card journal-summary-card--compact" role="region">
                <div className="journal-summary-card__title">
                  <SparkleIcon size={14} />
                  <span>{t('journal.aiSummary')}</span>
                </div>
                <JournalRichText className="journal-summary-card__body" text={aiSummary} />
              </div>
            )}

            {renderPhaseTabs()}

            <div className="journal-today__phase">
              {phase === 'morning' ? renderMorningEdit() : renderEveningEdit()}
            </div>

            {renderImagesSection('edit')}

            {saveError && (
              <div
                role="alert"
                className="journal-save-error"
                style={{
                  marginTop: 8,
                  padding: '10px 12px',
                  borderRadius: 8,
                  background: 'var(--danger-soft, #FEECEC)',
                  color: 'var(--danger, #C0392B)',
                  fontSize: 13,
                  lineHeight: 1.5,
                }}
              >
                <div style={{ fontWeight: 700, marginBottom: 2 }}>{t('journal.saveErrorTitle')}</div>
                <div>{t('journal.saveErrorRetry')}</div>
                <div style={{ marginTop: 6, fontSize: 11, opacity: 0.75, wordBreak: 'break-word' }}>
                  {saveError}
                </div>
              </div>
            )}

            <button
              type="button"
              className="journal-summarize-btn"
              onClick={handleSave}
              disabled={saving}
              style={{ marginTop: 4 }}
            >
              {saving ? t('common.loading') : t('common.save')}
            </button>

            <button
              type="button"
              onClick={handleCancelEdit}
              style={{
                marginTop: 4, width: '100%', background: 'transparent', border: 'none',
                padding: 12, color: 'var(--text-secondary)', fontWeight: 700, fontSize: 14, cursor: 'pointer',
              }}
            >
              {t('common.cancel')}
            </button>
          </>
        ) : (
          <>
            {aiSummary && (
              <div className="journal-summary-card journal-summary-card--compact" role="region">
                <div className="journal-summary-card__title">
                  <SparkleIcon size={14} />
                  <span>{t('journal.aiSummary')}</span>
                </div>
                <JournalRichText className="journal-summary-card__body" text={aiSummary} />
              </div>
            )}

            {morningWritten && eveningWritten ? (
              <div className="journal-view-stack">
                {renderMorningView()}
                {renderEveningView()}
              </div>
            ) : morningWritten ? (
              renderMorningView()
            ) : eveningWritten ? (
              renderEveningView()
            ) : !hasImages ? (
              <div className="journal-modal__empty">{t('journal.emptyEntryHint')}</div>
            ) : null}

            {hasImages && renderImagesSection('view')}
          </>
        )}

        {savedToast && (
          <div className="journal-toast" role="status">{t('journal.savedToast')}</div>
        )}
        {aiTagToast && (
          <div className="journal-toast" role="status">
            <span>{aiTagToast}</span>
            {tagUndoSnapshot && (
              <button
                type="button"
                className="journal-toast__undo"
                onClick={handleUndoConsolidation}
              >
                {t('journal.tagsConsolidatedUndo')}
              </button>
            )}
          </div>
        )}
        {xpToast && (
          <JournalXpToast
            xp={xpToast.xp}
            label={xpToast.label}
            onDone={() => setXpToast(null)}
          />
        )}
      </div>
    </div>
  )
}
