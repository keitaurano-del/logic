/**
 * LessonStoriesScreen - Logic v3 Stories-style lesson
 * 仕様: docs/DESIGN_V3.md §3.3
 * モックアップ: lv3-lesson.html
 */
import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import { BookmarkIcon, BookmarkFilledIcon, CheckIcon, SparklesIcon, LightbulbIcon, ClipboardListIcon, FlagIcon, HeadphonesIcon } from '../icons'
import type { LessonSlide } from '../lessonSlides'
import { convertLessonToSlides } from '../lessonSlides'
import { RichLessonText } from '../components/RichLessonText'
import { stripMarkup } from '../richText'
import { allLessons } from '../lessonData'
import { addXp } from '../stats'
import { LessonThumbnail } from '../components/LessonThumbnail'
import { resolveAssetUrl } from '../lessonAssets'
import { API_BASE } from './apiBase'
import { t, getLocale } from '../i18n'
import { WritingScoreResult } from '../components/WritingScoreResult'
import * as tts from '../ttsService'
import { TtsControlPanel } from '../components/TtsControlPanel'
import { isCoursePlayCurrent, advanceCoursePlay, clearCoursePlay } from '../ttsCoursePlay'
import { tutorial } from '../tutorial/tutorialStorage'
import { addWrongAnswers } from '../wrongAnswerStore'
import { generateFromLesson } from '../flashcardData'
import { isSaved, toggleSaved } from '../savedItemsStore'
import { haptic } from '../platform/haptics'
import { VisualSlide } from '../visuals/VisualSlide'
import { renderVisual } from '../visuals'
import { useStudyTimer } from '../hooks/useStudyTimer'
import '../visuals/visuals.css'
import '../visuals/visuals-phase3a.css'
import '../visuals/visuals-fullbleed.css'

type WrongAnswerCapture = {
  slideIndex: number
  question: string
  correctAnswer: string
  selectedAnswer: string
  explanation: string
  options: { label: string; correct: boolean }[]
}

// ── TTS helpers ──────────────────────────────────────────────────
// concept スライドの body は markdown サブセットの raw テキスト。
// 読み上げ用には stripMarkup（src/richText.ts）で記法を剥がす。
// 念のため残存する旧 <br/> 由来のタグや連続空白も均しておく。
function stripBodyForSpeech(s: string): string {
  return stripMarkup(s)
    .replace(/<br\s*\/?>/gi, '。')
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

/** スライドから読み上げ用のテキストを抽出。空文字なら読み上げスキップ。 */
function getSpeakableText(slide: LessonSlide): string {
  switch (slide.kind) {
    case 'hero':
      return [slide.category, slide.title, slide.meta].filter(Boolean).join('。 ')
    case 'intro':
    case 'concept': {
      const example = slide.kind === 'concept' && slide.example ? slide.example : ''
      return [slide.title, stripBodyForSpeech(slide.body), example].filter(Boolean).join('。 ')
    }
    case 'diagram':
      return [slide.title, slide.nodes.map(n => n.label).join('。 ')].filter(Boolean).join('。 ')
    case 'compare':
      return [
        slide.title,
        `${slide.left.label}: ${slide.left.body}`,
        `${slide.right.label}: ${slide.right.body}`,
      ].join('。 ')
    case 'quote':
      return `${slide.quote} ${slide.author}`
    case 'quiz':
      return [slide.question, ...slide.choices].join('。 ')
    case 'summary':
      return [slide.title, ...slide.points].join('。 ')
    case 'think':
      return [slide.question, slide.hint ?? ''].filter(Boolean).join('。 ')
    case 'case': {
      const phase = slide.phases[0]
      return [slide.title, slide.situation, phase?.question ?? ''].filter(Boolean).join('。 ')
    }
    case 'visual':
      return [slide.title ?? '', slide.caption ?? ''].filter(Boolean).join('。 ')
    default:
      return ''
  }
}

interface LessonStoriesScreenProps {
  lessonId: number
  startStep?: number
  onComplete: () => void
  onClose: () => void
  /**
   * コース再生中に「次のレッスンへ」自動遷移するためのコールバック。
   * onComplete とは別系統で、レッスンを完了扱いにしない（完了ガード: 要件 5）。
   */
  onCoursePlayNext?: (lessonId: number) => void
}

export function LessonStoriesScreen(props: LessonStoriesScreenProps) {
  const { lessonId, startStep, onComplete, onClose, onCoursePlayNext } = props
  const lesson = allLessons[lessonId]
  // 学習時間計測 — アンマウント時 / visibilitychange で flush。
  // study_sessions テーブル + localStorage `logic-stats.studyTimeMs` 両方を更新する。
  // AppV3 側 handleComplete では addStudyTime を呼ばないため、ここが唯一の経路。
  useStudyTimer({ type: 'lesson', id: `lesson-${lessonId}` })
  const [index, setIndex] = useState(startStep ?? 0)
  const [quizAnswered, setQuizAnswered] = useState<{ correct: boolean; selected: number; selectedMulti?: number[] } | null>(null)
  const [multiSelected, setMultiSelected] = useState<number[]>([])
  const [reportOpen, setReportOpen] = useState(false)
  const [reportSent, setReportSent] = useState(false)
  const [reportText, setReportText] = useState('')
  const [reportDetail, setReportDetail] = useState('')
  // 初回レッスン時のタップヒント（右半分=次/左半分=前）
  const [showTapHint, setShowTapHint] = useState(() => !tutorial.hasSeenLesson())

  // ── タッチガード: スライド遷移後 280ms は全タッチを無視 ──
  const slideEnteredAt = useRef<number>(0)
  const isGuarded = () => Date.now() - slideEnteredAt.current < 280
  useEffect(() => {
    slideEnteredAt.current = Date.now()
  }, [index])

  // ===== Swipe 用 touchRef（早期 return より前で確保し Hooks 順を固定） =====
  const touchRef = useRef<{ x: number; y: number; t: number } | null>(null)

  // 誤答キャプチャ：「最初に間違えた瞬間」だけ記録（Stories型UIは再挑戦できるため）
  const wrongAnswersRef = useRef<WrongAnswerCapture[]>([])
  const capturedSlideIndicesRef = useRef<Set<number>>(new Set())

  // 一時停止→再開の遷移時、自動再生 effect による再 speak を 1 回だけ抑止するフラグ。
  // Web の resume() は中断地点から再生を続けるため、effect が現スライドを頭から
  // 再 speak すると resume を上書きしてしまう。再開直前にこのフラグを立て、effect 側で
  // 消費（リセット）して 1 回だけ skip することで、中断地点からの継続を維持する。
  const resumeSkipSpeakRef = useRef(false)

  // 保存（ブックマーク）状態 — レッスン全体
  const [saved, setSaved] = useState<boolean>(() => isSaved('lesson', lessonId))
  // 保存（ブックマーク）状態 — 現在のページ。state ではなく毎レンダー算出
  const [, bumpSaved] = useState(0)
  const bumpPageSaved = () => bumpSaved((v) => v + 1)
  const pageSaved = isSaved('lesson-step', `${lessonId}:${index}`)

  // TTS 読み上げ状態
  const [ttsPlaying, setTtsPlaying] = useState<boolean>(() => tts.isPlaying())
  const [ttsRate, setTtsRate] = useState<number>(() => tts.loadRate())
  // 読み上げモード: ヘッドホンボタンで ON → スライド自動進行 + クイズスキップ
  const [ttsModeActive, setTtsModeActive] = useState(false)
  const [ttsPaused, setTtsPaused] = useState(false)
  const [ttsVoiceId, setTtsVoiceId] = useState<string | null>(() => tts.loadVoiceId())
  // 読了 → 「クイズを解く」CTA を表示する状態
  const [ttsCompletedReadable, setTtsCompletedReadable] = useState(false)
  // コース再生（カテゴリヘッダーの「コースを再生」）でこのレッスンが開かれたか。
  // true の間は、読了時に「クイズを解く」CTA ではなく次レッスンへ自動遷移する。
  const [coursePlayActive] = useState<boolean>(() => isCoursePlayCurrent(lessonId))
  useEffect(() => tts.subscribe(setTtsPlaying), [])
  // 画面離脱 / unmount 時は必ず停止して取り残しを防ぐ
  useEffect(() => {
    return () => { void tts.stop() }
  }, [])

  // コース再生でこのレッスンが現在対象なら、読み上げモードを自動起動する。
  // （前レッスンの末尾で onCoursePlayNext により遷移してきたケースを含む）
  useEffect(() => {
    if (!coursePlayActive) return
    if (!tts.isSupported()) return
    // 次フレームで開始 (state 初期化と被らせない)
    const tid = setTimeout(() => {
      setTtsCompletedReadable(false)
      setTtsPaused(false)
      setTtsModeActive(true)
    }, 50)
    return () => clearTimeout(tid)
  }, [coursePlayActive, lessonId])

  const slides: LessonSlide[] = useMemo(() => {
    if (!lesson) return []
    return convertLessonToSlides(lesson)
  }, [lesson])

  // 早期 return を回避して Hooks 順序を保つため、空スライドにフォールバックスライドを 1 枚立てる。
  // slides.length === 0 のときは下部で NotFound 表示に切り替える。
  const slide: LessonSlide = useMemo(() => {
    if (slides.length === 0) return { kind: 'hero', image: '', category: '', title: '', meta: '' }
    const safeIndex = Math.min(index, slides.length - 1)
    return slides[safeIndex]
  }, [slides, index])
  const total = slides.length
  const isQuiz = slide.kind === 'quiz'
  // visual スライドは図解自身がタップ展開（タブ切替・前提データ展開等）を持つため、
  // 左右端の絶対配置タップナビ・ゾーンを無効化し、図解の onClick を奪わないようにする。
  // スライド移動はスワイプ（onTouchEnd）と下部の前/次ボタンで担保する。
  const isVisual = slide.kind === 'visual'

  // 読み上げモード用: 読み上げ対象 (quiz / think / case 以外) のインデックス一覧
  // think/case は対話的操作を要求するため自動進行スキップ対象に含める。
  const readableIndices = useMemo(() => {
    return slides
      .map((s, i) => ({ s, i }))
      .filter(({ s }) => s.kind !== 'quiz' && s.kind !== 'think' && s.kind !== 'case')
      .map(({ i }) => i)
  }, [slides])
  // 最初の quiz スライド (なければ undefined)
  const firstQuizIndex = useMemo(() => slides.findIndex(s => s.kind === 'quiz'), [slides])

  const goNext = () => {
    if (isGuarded()) return
    if (index < total - 1) {
      setIndex(index + 1)
      setQuizAnswered(null)
      setMultiSelected([])
    } else {
      // 完了：誤答リストを永続化（最初に間違えた瞬間に記録済み）
      if (lesson && wrongAnswersRef.current.length > 0) {
        addWrongAnswers(
          wrongAnswersRef.current.map((w) => ({
            lessonId,
            lessonTitle: lesson.title,
            category: lesson.category,
            question: w.question,
            correctAnswer: w.correctAnswer,
            selectedAnswer: w.selectedAnswer,
            explanation: w.explanation,
            options: w.options,
          })),
        )
      }
      // 完了：フラッシュカードを生成（誤答 + concept/summary/think スライドから自動でカード化）
      if (lesson) {
        const explainSteps: { title: string; content: string }[] = []
        for (const s of slides) {
          if (s.kind === 'concept' || s.kind === 'intro') {
            explainSteps.push({ title: s.title, content: s.body })
          } else if (s.kind === 'summary') {
            explainSteps.push({ title: s.title, content: s.points.join('\n') })
          } else if (s.kind === 'think') {
            explainSteps.push({ title: s.question, content: s.points.join('\n') })
          }
        }
        const wrongs = wrongAnswersRef.current.map((w) => ({
          question: w.question,
          correctAnswer: w.correctAnswer,
          explanation: w.explanation,
        }))
        if (wrongs.length > 0 || explainSteps.length > 0) {
          generateFromLesson(lessonId, lesson.title, wrongs, explainSteps)
        }
      }
      addXp('lesson')
      onComplete()
    }
  }
  const goPrev = () => {
    if (isGuarded()) return
    if (index > 0) {
      setIndex(index - 1)
      setQuizAnswered(null)
      setMultiSelected([])  // 戻り時もmultiSelectedをリセット
    }
  }

  // ===== 読み上げモード ロジック =====

  // 現在スライド以降の最も近い readable インデックスを探す
  const findNextReadable = useCallback((fromIdx: number): number | null => {
    for (const i of readableIndices) {
      if (i > fromIdx) return i
    }
    return null
  }, [readableIndices])

  // 「次の readable スライド」へ進む。なければ読了状態にする。
  const advanceReadable = useCallback(() => {
    const next = findNextReadable(index)
    if (next != null) {
      setIndex(next)
      setQuizAnswered(null)
      setMultiSelected([])
      return
    }
    // このレッスンの readable を読み終えた。
    // コース再生中なら次のレッスンへ自動遷移する（完了扱いにはしない: 要件 5）。
    if (coursePlayActive) {
      const nextLessonId = advanceCoursePlay()
      if (nextLessonId != null && onCoursePlayNext) {
        // utterance を止めてから遷移（次レッスン側 mount で読み上げ再開）
        void tts.stop()
        onCoursePlayNext(nextLessonId)
        return
      }
      // コースの最後のレッスンを読み終えた → セッション終了。
      clearCoursePlay()
    }
    // 通常の読了。クイズへの導線を表示する。
    setTtsCompletedReadable(true)
  }, [findNextReadable, index, coursePlayActive, onCoursePlayNext])

  // advanceReadable の最新参照を ref で保持（speak の onEnd / skip 系から deps を増やさず呼ぶ）
  const advanceReadableRef = useRef(advanceReadable)
  useEffect(() => { advanceReadableRef.current = advanceReadable }, [advanceReadable])

  // 読み上げモードを開始: 現スライドが readable なら現在地から、そうでなければ最初の readable から
  const startTtsMode = useCallback(() => {
    haptic.light()
    setTtsCompletedReadable(false)
    if (slide.kind === 'quiz' || slide.kind === 'think' || slide.kind === 'case') {
      // 既に対話スライドにいる場合は最初の readable に戻す
      if (readableIndices.length === 0) return
      setIndex(readableIndices[0])
      setQuizAnswered(null)
      setMultiSelected([])
    }
    setTtsPaused(false)
    setTtsModeActive(true)
  }, [slide.kind, readableIndices])

  // 読み上げモード終了 (制御パネル × ボタン / 「クイズを解く」)
  // ユーザーが明示的に終了したらコース再生セッションも解除する（次レッスンへ連れて行かない）。
  const stopTtsMode = useCallback(async () => {
    setTtsModeActive(false)
    setTtsPaused(false)
    setTtsCompletedReadable(false)
    clearCoursePlay()
    await tts.stop()
  }, [])

  // 「クイズを解く」: 読み上げモード OFF + 最初の quiz スライドへ jump
  const handleStartQuiz = useCallback(async () => {
    await tts.stop()
    setTtsModeActive(false)
    setTtsPaused(false)
    setTtsCompletedReadable(false)
    clearCoursePlay()
    if (firstQuizIndex >= 0) {
      setIndex(firstQuizIndex)
      setQuizAnswered(null)
      setMultiSelected([])
    } else {
      // クイズが無い → 最後のスライド (summary 等) へ
      setIndex(total - 1)
    }
  }, [firstQuizIndex, total])

  // 一時停止 / 再開トグル (制御パネルから呼ばれる)
  const handleTogglePause = useCallback(async () => {
    haptic.light()
    if (ttsPaused) {
      // Web は resume() で中断地点から継続できるが、native は新規 speak が必要。
      if (tts.isNative()) {
        // native は現スライドを頭から読み直す仕様。再読み上げは自動再生 effect の
        // ttsPaused deps が担う（ここで手動 speak すると effect と二重 speak になる）。
        // skip フラグは立てない → effect が意図どおり 1 回だけ頭出し speak する。
        setTtsPaused(false)
      } else {
        // Web: effect の再 speak を 1 回抑止し、resume() の中断地点継続を保持する。
        await tts.resume()
        resumeSkipSpeakRef.current = true
        setTtsPaused(false)
      }
    } else {
      await tts.pause()
      setTtsPaused(true)
    }
  }, [ttsPaused])

  // 速度変更 (制御パネルから)
  // 再生中の再読み上げは自動再生 effect の ttsRate deps が担うため、ここでは直接 speak しない
  // (二重 speak による重複/吃りを防ぐ)。
  const handleChangeRate = useCallback((r: number) => {
    setTtsRate(r)
    tts.saveRate(r)
  }, [])

  // シークバー用: 現在地が readableIndices 内で何番目か
  // 非 readable (quiz/think/case) の場合は直前の readable インデックスを返す。
  const ttsReadableCursor = useMemo(() => {
    if (readableIndices.length === 0) return 0
    const exact = readableIndices.indexOf(index)
    if (exact >= 0) return exact
    // index 未満で最大の readable を探す
    let lo = 0
    let hi = readableIndices.length - 1
    let found = 0
    while (lo <= hi) {
      const mid = (lo + hi) >> 1
      if (readableIndices[mid] <= index) {
        found = mid
        lo = mid + 1
      } else {
        hi = mid - 1
      }
    }
    return found
  }, [readableIndices, index])

  // シークバーから新しい位置が来たときの処理
  // - 再生中の utterance を止める
  // - 対象 readable スライドへ jump
  // - tts モードの effect が新規 speak を発火するので、ここでは speak しない
  const handleSeekReadable = useCallback((nextCursor: number) => {
    if (readableIndices.length === 0) return
    const clamped = Math.min(readableIndices.length - 1, Math.max(0, nextCursor))
    const targetSlideIndex = readableIndices[clamped]
    if (targetSlideIndex === index) return
    haptic.light()
    setTtsCompletedReadable(false)
    setQuizAnswered(null)
    setMultiSelected([])
    void tts.stop()
    setIndex(targetSlideIndex)
  }, [readableIndices, index])

  // 現在スライド以前の最も近い readable インデックスを探す
  const findPrevReadable = useCallback((fromIdx: number): number | null => {
    let prev: number | null = null
    for (const i of readableIndices) {
      if (i < fromIdx) prev = i
      else break
    }
    return prev
  }, [readableIndices])

  // 前の readable スライドへ（スライドジャンプ）。先頭なら現スライド頭出し（再読み上げ）。
  const jumpToPrevReadable = useCallback(() => {
    const prev = findPrevReadable(index)
    setTtsCompletedReadable(false)
    setQuizAnswered(null)
    setMultiSelected([])
    void tts.stop()
    if (prev != null) setIndex(prev)
    else {
      // 先頭なら同スライドを再読み上げ（effect の deps は index 不変なので明示再 speak）
      const text = getSpeakableText(slide)
      if (text) {
        void tts.speak(text, {
          lang: getLocale() === 'ja' ? 'ja-JP' : 'en-US',
          rate: ttsRate, voiceId: ttsVoiceId,
          onEnd: () => advanceReadableRef.current(),
        })
      }
    }
  }, [findPrevReadable, index, slide, ttsRate, ttsVoiceId])

  // 次の readable スライドへ（スライドジャンプ）。なければ読了処理（advanceReadable）。
  const jumpToNextReadable = useCallback(() => {
    setTtsCompletedReadable(false)
    setQuizAnswered(null)
    setMultiSelected([])
    void tts.stop()
    advanceReadable()
  }, [advanceReadable])

  // ±10秒スキップ (ミュージックプレーヤーバーの ±10秒ボタン)。
  // - クラウド音声 (HTMLAudio, MP3): まず時間シーク。スライド境界をまたぐ場合は隣スライドへ。
  //   +10: 残り 10 秒未満なら次スライド。-10: 先頭付近 (10 秒未満) なら前スライド。
  // - native/web TTS (時間軸なし): 前/次スライドへのジャンプにフォールバック。
  const handleSkip = useCallback((seconds: number) => {
    haptic.light()
    if (tts.isCloudPlaying()) {
      const cur = tts.getCloudCurrentTime() ?? 0
      const dur = tts.getCloudDuration()
      if (seconds > 0) {
        // 残尺が 10 秒未満ならスライド境界を越える → 次スライド
        if (dur != null && cur + seconds >= dur) { jumpToNextReadable(); return }
        if (tts.skipSeconds(seconds)) return
        jumpToNextReadable()
      } else {
        // 先頭付近で戻すと境界を越える → 前スライド
        if (cur + seconds <= 0) { jumpToPrevReadable(); return }
        if (tts.skipSeconds(seconds)) return
        jumpToPrevReadable()
      }
      return
    }
    // 時間軸が無い native/web TTS: スライド送りにフォールバック
    if (seconds > 0) jumpToNextReadable()
    else jumpToPrevReadable()
  }, [jumpToNextReadable, jumpToPrevReadable])

  // ボイス変更 (制御パネルから)
  // 再生中の再読み上げは自動再生 effect の ttsVoiceId deps が担うため、ここでは直接 speak しない
  // (二重 speak による重複/吃りを防ぐ)。
  const handleChangeVoice = useCallback((id: string | null) => {
    setTtsVoiceId(id)
    tts.saveVoiceId(id)
  }, [])

  // 読み上げモード ON + スライド変化 → 現スライドを自動で読み上げる
  // クイズ等で stop されているとき (ユーザーが手動で進めた場合) も含めて副作用で起動
  useEffect(() => {
    if (!ttsModeActive) return
    if (ttsPaused) return
    if (ttsCompletedReadable) return
    if (slides.length === 0) return
    // 現スライドが non-readable (quiz/think/case) なら自動進行スキップ
    if (slide.kind === 'quiz' || slide.kind === 'think' || slide.kind === 'case') {
      // 次の readable を即時探す。無ければ読了。setState を effect 内で直接呼ばないよう microtask で遅延。
      queueMicrotask(() => {
        const next = findNextReadable(index)
        if (next != null) {
          setIndex(next)
          setQuizAnswered(null)
          setMultiSelected([])
        } else {
          setTtsCompletedReadable(true)
        }
      })
      return
    }
    const text = getSpeakableText(slide)
    if (!text) {
      // 読み上げるテキストが無い → 即次へ
      queueMicrotask(() => advanceReadableRef.current())
      return
    }
    if (resumeSkipSpeakRef.current) {
      // Web の一時停止→再開直後。resume() が中断地点から継続中なので、
      // ここでの再 speak（頭出し）を 1 回だけ抑止しフラグを消費する。
      resumeSkipSpeakRef.current = false
      return
    }
    void tts.speak(text, {
      lang: getLocale() === 'ja' ? 'ja-JP' : 'en-US',
      rate: ttsRate,
      voiceId: ttsVoiceId,
      onEnd: () => advanceReadableRef.current(),
    })
    // 次スライドへの自動遷移時 / unmount 時に stop されると onEnd は呼ばれないので、
    // ここでは return クリーンアップを置かない (advanceReadable 自身が次の effect を発火)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ttsModeActive, ttsPaused, index, ttsRate, ttsVoiceId, slide.kind, slides.length])

  // 通常モード (ttsModeActive=false) で旧来挙動: スライド遷移時に再生中なら止める
  useEffect(() => {
    if (ttsModeActive) return
    if (tts.isPlaying()) void tts.stop()
  }, [index, ttsModeActive])

  // lesson / slides が無いケースの早期 return — 全 hooks 確保後に置く
  if (!lesson || slides.length === 0) {
    return (
      <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Noto Sans JP', sans-serif" }}>
        <div style={{ textAlign: 'center' }}>
          <div>{t('stories.notFound')}</div>
          <button onClick={onClose} style={{ marginTop: 20, padding: '10px 20px', borderRadius: 12, background: 'var(--accent-btn)', color: 'var(--accent-btn-fg)', border: 'none', fontWeight: 700 }}>{t('stories.back')}</button>
        </div>
      </div>
    )
  }

  // ===== Swipe 対応 =====
  const onTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0]
    touchRef.current = { x: t.clientX, y: t.clientY, t: Date.now() }
  }
  const onTouchEnd = (e: React.TouchEvent) => {
    const start = touchRef.current
    if (!start) return
    const t = e.changedTouches[0]
    const dx = t.clientX - start.x
    const dy = t.clientY - start.y
    const dt = Date.now() - start.t
    touchRef.current = null
    // 水平スワイプ識別: 50px以上、垂直より水平が長い、500ms以内
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5 && dt < 500) {
      if (reportOpen) return  // モーダル表示中はスワイプ無効
      // クイズスライドは正解後のみ前進可（不正解時・未回答時は前進禁止）
      if (dx < 0 && isQuiz && !quizAnswered?.correct) return
      if (dx < 0) goNext()
      else goPrev()
    }
  }
  // visual スライド専用: capture フェーズでスワイプを拾う。
  // 図解コンポーネント側（FermiBaseDataVisual 等）が onTouchStart/End を bubble で
  // stopPropagation して自衛しているため、bubble の onTouchEnd には届かない。
  // capture は子の bubble-stop より先に走るので、図解上のスワイプも検知できる。
  // タップ展開（onClick）は touch とは別イベントなので阻害しない（preventDefault しない）。
  // touchRef を消費して null 化し、bubble 側 onTouchEnd の二重処理を防ぐ。
  const onTouchStartCaptureVisual = (e: React.TouchEvent) => {
    const t = e.touches[0]
    touchRef.current = { x: t.clientX, y: t.clientY, t: Date.now() }
  }
  const onTouchEndCaptureVisual = (e: React.TouchEvent) => {
    const start = touchRef.current
    if (!start) return
    const t = e.changedTouches[0]
    const dx = t.clientX - start.x
    const dy = t.clientY - start.y
    const dt = Date.now() - start.t
    touchRef.current = null
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5 && dt < 500) {
      // モーダル・読み上げモード（完了ダイアログ含む）表示中は誤発火を避ける
      if (reportOpen || ttsModeActive) return
      if (dx < 0) goNext()
      else goPrev()
    }
  }

  return (
    <div
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      // visual スライドは左右タップゾーンを無効化している（図解のタップ展開を優先）。
      // その代わりスワイプ移動を capture フェーズで担保する（図解の bubble-stop を貫通）。
      onTouchStartCapture={isVisual ? onTouchStartCaptureVisual : undefined}
      onTouchEndCapture={isVisual ? onTouchEndCaptureVisual : undefined}
      style={{ background: 'var(--bg-primary)', height: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Noto Sans JP', sans-serif", color: 'var(--text-primary)', position: 'relative', touchAction: 'pan-y' }}
    >
      {/* Progress bars — v3 mint accentでコントラストを上げる */}
      <div style={{ display: 'flex', gap: 5, padding: 'calc(env(safe-area-inset-top, 44px) + 8px) 16px 12px' }}>
        {slides.map((_, i) => (
          <div key={i} style={{ flex: 1, height: 4, background: 'rgba(255,255,255,.18)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ height: '100%', background: 'var(--brand)', width: i < index ? '100%' : i === index ? '55%' : '0%', transition: 'width .3s ease', boxShadow: i <= index ? `0 0 8px color-mix(in srgb, var(--brand) 50%, transparent)` : 'none' }}></div>
          </div>
        ))}
      </div>

      {/* Top bar */}
      <div style={{ padding: '0 16px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 10, background: 'var(--accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill={'var(--brand)'} aria-hidden="true"><rect x="3" y="3" width="8" height="8" rx="1.5" /><rect x="13" y="3" width="8" height="8" rx="1.5" /><rect x="3" y="13" width="8" height="8" rx="1.5" /><rect x="13" y="13" width="8" height="8" rx="1.5" /></svg>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.7333rem', fontWeight: 600, color: 'var(--brand)' }}>{lesson.category}</span>
            <span style={{ fontSize: '0.8667rem', fontWeight: 700 }}>{lesson.title}</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            type="button"
            onPointerDown={(e) => {
              e.stopPropagation()
              haptic.light()
              const next = toggleSaved({
                type: 'lesson',
                refId: lessonId,
                title: lesson.title,
                subtitle: lesson.category,
              })
              setSaved(next)
            }}
            aria-label={saved ? t('stories.unsaveAria') : t('stories.saveAria')}
            aria-pressed={saved}
            style={{
              width: 44, height: 44, borderRadius: '50%',
              background: 'var(--bg-card)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
              border: 'none', zIndex: 10, position: 'relative',
              flexShrink: 0,
              color: saved ? 'var(--brand)' : 'var(--text-primary)',
            }}
          >
            {saved ? <BookmarkFilledIcon width={18} height={18} /> : <BookmarkIcon width={18} height={18} />}
          </button>
          {/* TTS 読み上げモード起動ボタン: ヘッドホン形アイコン */}
          {/* タップでモード ON + 制御パネル展開 + 自動再生開始 */}
          {/* レッスン初期画面(hero)を含め全スライドで「このレッスンを読み上げ開始」できる単一の起点 */}
          {/* (スライド単位の再生トリガーは撤去し、ここと下部バーに集約: 要件 7/8)。 */}
          {/* summary は完了画面なので読み上げる意味が薄く非表示。TTS モード中も下部バーに譲って非表示。 */}
          {tts.isSupported() && slide.kind !== 'summary' && !ttsModeActive && (
            <button
              type="button"
              onPointerDown={(e) => {
                e.stopPropagation()
                startTtsMode()
              }}
              aria-label={t('tts.headphonesAria')}
              aria-pressed={false}
              title={t('tts.headphonesAria')}
              style={{
                // タッチターゲットを 44x44 に拡大 (HIG / Material 推奨)
                width: 44, height: 44, borderRadius: '50%',
                background: 'var(--bg-card)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
                border: 'none', zIndex: 10, position: 'relative',
                flexShrink: 0, padding: 0,
                color: 'var(--text-secondary)',
              }}
            >
              <HeadphonesIcon width={18} height={18} />
            </button>
          )}
          {/* SCRUM-215: 誤りを報告 — アイコンのみ円形ボタン、ヘッダー横配置で本文と被らない (2026-05-24) */}
          {/* summary 画面では非表示 (完了画面で報告 UX が不自然なため、従来挙動を維持) */}
          {slide.kind !== 'summary' && (
            <button
              type="button"
              onPointerDown={(e) => { e.stopPropagation(); setReportOpen(true) }}
              aria-label={t('stories.reportTitle')}
              title={t('stories.reportTitle')}
              style={{
                // タッチターゲットを 44x44 に拡大 (HIG / Material 推奨)
                width: 44, height: 44, borderRadius: '50%',
                background: 'var(--bg-card)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
                border: 'none', zIndex: 10, position: 'relative',
                flexShrink: 0, padding: 0,
                color: 'var(--text-secondary)',
              }}
            >
              <FlagIcon width={16} height={16} />
            </button>
          )}
          {/* SCRUM-226: ×ボタン — onClickも追加しzIndexをタップゾーンより上に */}
          {/* 明示クローズ時はコース再生セッションも解除（取り残し防止） */}
          <button
            onPointerDown={(e) => { e.stopPropagation(); e.preventDefault(); clearCoursePlay(); onClose() }}
            onClick={(e) => { e.stopPropagation(); clearCoursePlay(); onClose() }}
            style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', WebkitTapHighlightColor: 'transparent', border: 'none', zIndex: 10, position: 'relative', flexShrink: 0 }}
            aria-label={t('stories.closeAria')}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-primary)" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
          </button>
        </div>
      </div>

      {/* Slide content */}
      <div style={{ flex: 1, padding: '8px 24px 100px', position: 'relative', overflow: 'auto' }}>
        <div style={{ position: 'absolute', top: 8, right: 24, display: 'flex', alignItems: 'center', gap: 8, zIndex: 6 }}>
          <button
            type="button"
            onPointerDown={(e) => {
              e.stopPropagation()
              haptic.light()
              toggleSaved({
                type: 'lesson-step',
                refId: `${lessonId}:${index}`,
                title: lesson.title,
                subtitle: `${lesson.category} · ${index + 1}/${total}`,
                stepIndex: index,
                parentLessonId: lessonId,
              })
              bumpPageSaved()
            }}
            aria-label={pageSaved ? t('savedItems.unsavePageAria') : t('savedItems.savePageAria')}
            aria-pressed={pageSaved}
            style={{
              width: 28, height: 28, borderRadius: '50%',
              background: pageSaved ? `color-mix(in srgb, var(--brand) 18%, transparent)` : 'rgba(255,255,255,0.08)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', WebkitTapHighlightColor: 'transparent',
              border: 'none', padding: 0,
              color: pageSaved ? 'var(--brand)' : 'var(--text-muted)',
            }}
          >
            {pageSaved ? <BookmarkFilledIcon width={14} height={14} /> : <BookmarkIcon width={14} height={14} />}
          </button>
          <span style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: '0.8667rem', fontWeight: 700, color: 'var(--text-muted)' }}>{index + 1} / {total}</span>
        </div>

        <SlideContent
          slide={slide}
          quizAnswered={quizAnswered}
          multiSelected={multiSelected}
          onToggleMulti={(idx) => {
            if (isGuarded() || quizAnswered) return
            setMultiSelected(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx])
          }}
          onSubmitMulti={() => {
            if (slide.kind !== 'quiz' || !slide.multi) return
            if (isGuarded()) return
            const correctSet = new Set(slide.correctIndexes ?? [slide.correctIndex])
            const selectedSet = new Set(multiSelected)
            const correct = correctSet.size === selectedSet.size && [...correctSet].every(i => selectedSet.has(i))
            if (!correct && !capturedSlideIndicesRef.current.has(index)) {
              capturedSlideIndicesRef.current.add(index)
              wrongAnswersRef.current.push({
                slideIndex: index,
                question: slide.question,
                correctAnswer: [...correctSet].map(i => slide.choices[i]).join('、'),
                selectedAnswer: multiSelected.map(i => slide.choices[i]).join('、'),
                explanation: slide.explain,
                options: slide.choices.map((label, i) => ({ label, correct: correctSet.has(i) })),
              })
            }
            setQuizAnswered({ correct, selected: -1, selectedMulti: multiSelected })
          }}
          onSelectQuiz={(idx) => {
            if (slide.kind !== 'quiz') return
            if (isGuarded()) return
            const correct = idx === slide.correctIndex
            if (!correct && !capturedSlideIndicesRef.current.has(index)) {
              capturedSlideIndicesRef.current.add(index)
              wrongAnswersRef.current.push({
                slideIndex: index,
                question: slide.question,
                correctAnswer: slide.choices[slide.correctIndex] ?? '',
                selectedAnswer: slide.choices[idx] ?? '',
                explanation: slide.explain,
                options: slide.choices.map((label, i) => ({ label, correct: i === slide.correctIndex })),
              })
            }
            setQuizAnswered({ correct, selected: idx })
            if (!correct) {
              setTimeout(() => setQuizAnswered(null), 2500)
            }
          }}
          onNext={goNext}
        />
      </div>

      {/* タップゾーン: クイズ以外・左右端20%のみ（コンテンツエリアに干渉しない） */}
      {/* 読み上げモード中はタップゾーン無効化（自動進行と競合するため） */}
      {/* visual スライドではゾーンを描画しない（図解内のタップ展開を奪わないため。移動はスワイプ＋下部ボタンで担保） */}
      {!isQuiz && !ttsModeActive && !isVisual && (
        <div style={{ position: 'absolute', inset: 0, display: 'flex', zIndex: 5, pointerEvents: 'none' }}>
          <button
            type="button"
            aria-label={t('stories.prevSlide')}
            onClick={() => { if (!isGuarded()) goPrev() }}
            style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '22%', cursor: 'pointer', pointerEvents: 'auto', background: 'transparent', border: 'none', padding: 0 }}
          />
          <button
            type="button"
            aria-label={t('stories.nextSlide')}
            onClick={() => { if (!isGuarded()) goNext() }}
            style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '22%', cursor: 'pointer', pointerEvents: 'auto', background: 'transparent', border: 'none', padding: 0 }}
          />
        </div>
      )}

      {/* SCRUM-214: デスクトップ向け明示的な次へ/前へボタン（非クイズ・非最初のスライド） */}
      {/* 2026-05-22: タップしやすさ向上のためサイズアップ（HIG 推奨 56px+） */}
      {/* 読み上げモード中は制御パネルに譲るため非表示 */}
      {!isQuiz && !ttsModeActive && (
        <>
          {index > 0 && (
            <button
              onClick={() => { if (!isGuarded()) goPrev() }}
              style={{ position: 'absolute', left: 16, bottom: 'calc(env(safe-area-inset-bottom, 0px) + 20px)', zIndex: 8, background: 'rgba(255,255,255,0.10)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: '50%', width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', WebkitTapHighlightColor: 'transparent' }}
              aria-label={t('stories.prevAria')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><polyline points="15 18 9 12 15 6" /></svg>
            </button>
          )}
          <button
            onClick={() => { if (!isGuarded()) goNext() }}
            style={{ position: 'absolute', right: 16, bottom: 'calc(env(safe-area-inset-bottom, 0px) + 20px)', zIndex: 8, background: 'var(--brand)', border: 'none', borderRadius: 99, minHeight: 56, minWidth: 140, padding: '16px 28px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, cursor: 'pointer', boxShadow: `0 6px 20px color-mix(in srgb, var(--brand) 42%, transparent)`, WebkitTapHighlightColor: 'transparent', fontSize: '1.1333rem', fontWeight: 700, color: 'var(--accent-fg)', letterSpacing: '0.01em' }}
            aria-label={t('stories.nextAria')}
          >
            {t('stories.next')}
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--accent-fg)" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><polyline points="9 18 15 12 9 6" /></svg>
          </button>
        </>
      )}

      {/* クイズ正解後: 「次へ」ボタン（大） */}
      {isQuiz && quizAnswered?.correct && (
        <button
          onClick={goNext}
          style={{ position: 'absolute', bottom: 'calc(env(safe-area-inset-bottom, 0px) + 28px)', left: '50%', transform: 'translateX(-50%)', display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--brand)', border: 'none', borderRadius: 99, padding: '18px 48px', fontSize: '1.0667rem', fontWeight: 700, color: 'var(--accent-fg)', cursor: 'pointer', zIndex: 6, boxShadow: `0 4px 20px color-mix(in srgb, var(--brand) 44%, transparent)`, WebkitTapHighlightColor: 'transparent' }}
        >
          {t('stories.next')}
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--accent-fg)" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><polyline points="9 18 15 12 9 6" /></svg>
        </button>
      )}

      {/* 読み上げモード: 読了 CTA — 全 readable スライド読了後に「クイズを解く」を中央に表示 */}
      {ttsModeActive && ttsCompletedReadable && (
        <div
          role="dialog"
          aria-label={t('tts.completeTitle')}
          onPointerDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
          onTouchEnd={(e) => e.stopPropagation()}
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 24,
            background: 'var(--bg-card)',
            borderRadius: 20,
            padding: '22px 22px 18px',
            boxShadow: '0 10px 36px rgba(0,0,0,0.5)',
            width: 'min(92%, 360px)',
            textAlign: 'center',
            color: 'var(--text-primary)',
          }}
        >
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 52, height: 52, borderRadius: 16, background: `color-mix(in srgb, var(--brand) 14%, transparent)`, color: 'var(--brand)', marginBottom: 10 }}>
            <CheckIcon width={26} height={26} />
          </div>
          <div style={{ fontSize: '1.0667rem', fontWeight: 800, marginBottom: 6 }}>{t('tts.completeTitle')}</div>
          <div style={{ fontSize: '0.8667rem', color: 'var(--text-secondary)', marginBottom: 18, lineHeight: 1.6 }}>{t('tts.completeDesc')}</div>
          <button
            type="button"
            onPointerDown={(e) => { e.stopPropagation(); haptic.light(); void handleStartQuiz() }}
            style={{
              width: '100%',
              padding: '14px 24px',
              borderRadius: 99,
              background: 'var(--brand)',
              color: 'var(--accent-fg)',
              border: 'none',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: 'pointer',
              boxShadow: `0 4px 18px color-mix(in srgb, var(--brand) 36%, transparent)`,
              WebkitTapHighlightColor: 'transparent',
              marginBottom: 8,
            }}
          >
            {firstQuizIndex >= 0 ? t('tts.startQuizButton') : t('stories.viewResult')}
          </button>
          <button
            type="button"
            onPointerDown={(e) => { e.stopPropagation(); void stopTtsMode() }}
            style={{
              width: '100%',
              padding: '10px 16px',
              borderRadius: 99,
              background: 'transparent',
              color: 'var(--text-secondary)',
              border: 'none',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            {t('tts.closePanel')}
          </button>
        </div>
      )}

      {/* 読み上げモード制御パネル: モード ON 中 + 読了 CTA 未表示時に下部 fixed 表示 */}
      {ttsModeActive && !ttsCompletedReadable && (
        <TtsControlPanel
          playing={ttsPlaying}
          paused={ttsPaused}
          rate={ttsRate}
          voiceId={ttsVoiceId}
          lang={getLocale() === 'ja' ? 'ja-JP' : 'en-US'}
          readableIndex={ttsReadableCursor}
          readableTotal={readableIndices.length}
          onSeek={handleSeekReadable}
          onTogglePause={() => { void handleTogglePause() }}
          onChangeRate={handleChangeRate}
          onChangeVoice={handleChangeVoice}
          onSkip={handleSkip}
          onExit={() => { void stopTtsMode() }}
        />
      )}

      {/* Tap hint — 初回レッスンのみ表示（右半分=次/左半分=前） */}
      {showTapHint && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t('stories.tapHintTitle')}
          tabIndex={-1}
          onClick={() => { tutorial.markLesson(); setShowTapHint(false) }}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === 'Escape' || e.key === ' ') { tutorial.markLesson(); setShowTapHint(false) } }}
          onTouchEnd={(e) => { e.stopPropagation(); tutorial.markLesson(); setShowTapHint(false) }}
          style={{
            position: 'absolute', inset: 0, zIndex: 30,
            background: 'rgba(0,0,0,0.78)',
            display: 'flex', alignItems: 'stretch',
            color: '#fff',
            cursor: 'pointer',
            animation: 'tapHintFadeIn .25s ease-out',
          }}
        >
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 14,
            borderRight: '1px dashed rgba(255,255,255,0.2)',
          }}>
            <div style={{
              width: 60, height: 60, borderRadius: '50%',
              background: 'rgba(255,255,255,0.16)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 0 8px rgba(255,255,255,0.06)',
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </div>
            <div style={{ fontSize: '1.0667rem', fontWeight: 800, letterSpacing: '.02em' }}>{t('stories.tapHintLeftHeading')}</div>
            <div style={{ fontSize: '0.8667rem', opacity: 0.78, textAlign: 'center', padding: '0 24px', lineHeight: 1.55 }}>
              {t('stories.tapHintLeftBody')}
            </div>
          </div>
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 14,
          }}>
            <div style={{
              width: 60, height: 60, borderRadius: '50%',
              background: 'var(--brand)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 0 8px color-mix(in srgb, var(--accent) 18%, transparent)',
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent-fg)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </div>
            <div style={{ fontSize: '1.0667rem', fontWeight: 800, letterSpacing: '.02em' }}>{t('stories.tapHintRightHeading')}</div>
            <div style={{ fontSize: '0.8667rem', opacity: 0.78, textAlign: 'center', padding: '0 24px', lineHeight: 1.55 }}>
              {t('stories.tapHintRightBody')}
            </div>
          </div>
          <div style={{
            position: 'absolute', bottom: 'calc(env(safe-area-inset-bottom, 0px) + 24px)', left: 0, right: 0,
            textAlign: 'center', fontSize: '0.8rem', opacity: 0.6, fontWeight: 600, letterSpacing: '.05em',
          }}>
            {t('stories.tapHintDismiss')}
          </div>
          <style>{`@keyframes tapHintFadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
        </div>
      )}

      {/* 誤り報告モーダル */}
      {reportOpen && (
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 20, display: 'flex', alignItems: 'flex-end' }} onPointerDown={() => setReportOpen(false)}>
          <div
            onPointerDown={(e) => e.stopPropagation()}
            style={{ background: 'var(--bg-primary)', borderRadius: '20px 20px 0 0', padding: '24px 20px calc(env(safe-area-inset-bottom, 0px) + 24px)', width: '100%' }}
          >
            {reportSent ? (
              <>
                <div style={{ textAlign: 'center', marginBottom: 16 }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, borderRadius: '50%', background: `color-mix(in srgb, var(--brand) 12%, transparent)`, color: 'var(--brand)', marginBottom: 10 }}>
                    <CheckIcon width={22} height={22} />
                  </div>
                  <div style={{ fontSize: '1.0667rem', fontWeight: 700, color: 'var(--brand)' }}>{t('stories.reportReceivedTitle')}</div>
                  <div style={{ fontSize: '0.8667rem', color: 'var(--text-secondary)', marginTop: 6 }}>{t('stories.reportReceivedDesc')}</div>
                </div>
                <button onPointerDown={() => { setReportOpen(false); setReportSent(false); setReportText(''); setReportDetail('') }} style={{ width: '100%', background: 'var(--bg-card)', border: 'none', borderRadius: 14, padding: '14px', fontSize: '0.9333rem', fontWeight: 600, color: 'var(--text-primary)', cursor: 'pointer' }}>{t('stories.close')}</button>
              </>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ fontSize: '1.0667rem', fontWeight: 700 }}>{t('stories.reportTitle')}</div>
                  <button
                    onPointerDown={() => setReportOpen(false)}
                    style={{ background: 'var(--bg-card)', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-secondary)', fontSize: '1.2rem', lineHeight: 1 }}
                  >×</button>
                </div>
                <div style={{ fontSize: '0.8667rem', color: 'var(--text-secondary)', marginBottom: 16 }}>{t('stories.reportPrompt')}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
                  {[
                    { value: '内容・説明が間違っている', labelKey: 'stories.reportOpt.contentWrong' },
                    { value: '選択肢の正解が違う', labelKey: 'stories.reportOpt.choiceWrong' },
                    { value: '日本語がおかしい・誤字', labelKey: 'stories.reportOpt.typo' },
                    { value: 'その他', labelKey: 'stories.reportOpt.other' },
                  ].map(opt => (
                    <button key={opt.value} onPointerDown={() => setReportText(opt.value)}
                      style={{ background: reportText === opt.value ? 'var(--accent-soft)' : 'var(--bg-card)', border: `1.5px solid ${reportText === opt.value ? 'var(--brand)' : 'transparent'}`, borderRadius: 12, padding: '12px 14px', fontSize: '0.9333rem', fontWeight: 500, color: 'var(--text-primary)', cursor: 'pointer', textAlign: 'left' }}
                    >{t(opt.labelKey)}</button>
                  ))}
                </div>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: '0.8667rem', color: 'var(--text-secondary)', marginBottom: 8 }}>{t('stories.reportDetailLabel')}</div>
                  <textarea
                    aria-label={t('stories.reportDetailAria')}
                    value={reportDetail}
                    onChange={(e) => setReportDetail(e.target.value)}
                    placeholder={t('stories.reportDetailPlaceholder')}
                    rows={3}
                    style={{ width: '100%', background: 'var(--bg-card)', border: `1px solid ${'var(--border)'}`, borderRadius: 12, padding: '12px 14px', fontSize: '0.9333rem', color: 'var(--text-primary)', resize: 'none', outline: 'none', fontFamily: "'Noto Sans JP', sans-serif", boxSizing: 'border-box' }}
                  />
                </div>
                <button
                  onPointerDown={async () => {
                    if (!reportText) return
                    try {
                      await fetch(`${API_BASE}/api/report-problem`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          lessonTitle: allLessons[lessonId]?.title ?? '',
                          lessonId,
                          question: '',
                          options: [],
                          issueType: reportText,
                          comment: reportDetail,
                        }),
                      })
                    } catch (e) {
                      console.warn('[report] API call failed (non-fatal):', e)
                    }
                    setReportSent(true)
                  }}
                  disabled={!reportText}
                  style={{ width: '100%', background: reportText ? 'var(--brand)' : 'var(--bg-card)', border: 'none', borderRadius: 14, padding: '14px', fontSize: '0.9333rem', fontWeight: 700, color: reportText ? 'var(--accent-fg)' : 'var(--text-muted)', cursor: reportText ? 'pointer' : 'default' }}
                >
                  {t('stories.reportSend')}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function HeroImage({ image, lessonId }: { image: string; lessonId?: number }) {
  const [failed, setFailed] = useState(false)
  const handleError = useCallback(() => setFailed(true), [])
  if (failed && lessonId != null) {
    return <LessonThumbnail lessonId={lessonId} style={{ width: '100%', aspectRatio: '1 / 1' }} />
  }
  // 画像によってアスペクト比が混在（lesson-*.png は 1:1 / course-*.png は 16:9）。
  // どの画像でも切らずに全体を見せたいので、1:1 枠 + objectFit:contain + bg-card で
  // 統一する（HomeScreenV3 の recommended hero と同じ方針）。
  return (
    <div style={{ width: '100%', aspectRatio: '1 / 1', background: 'var(--bg-card)', display: 'block', overflow: 'hidden' }}>
      <img
        src={resolveAssetUrl(image)}
        alt=""
        loading="lazy"
        onError={handleError}
        style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }}
      />
    </div>
  )
}

function SlideContent({ slide, quizAnswered, multiSelected, onToggleMulti, onSubmitMulti, onSelectQuiz, onNext }: {
  slide: LessonSlide
  quizAnswered: { correct: boolean; selected: number; selectedMulti?: number[] } | null
  multiSelected: number[]
  onToggleMulti: (idx: number) => void
  onSubmitMulti: () => void
  onSelectQuiz: (idx: number) => void
  onNext: () => void
}) {
  if (slide.kind === 'hero') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'flex-start' }}>
        <div style={{ marginTop: 8, marginBottom: 24, borderRadius: 18, overflow: 'hidden', boxShadow: 'var(--shadow-v3-hero)' }}>
          <HeroImage image={slide.image} lessonId={slide.lessonId} />
        </div>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--accent-soft)', borderRadius: 99, padding: '6px 12px', fontSize: '0.7333rem', fontWeight: 600, color: 'var(--brand)', marginBottom: 16, width: 'fit-content' }}>{slide.category}</span>
        <h1 style={{ fontFamily: 'Noto Sans JP', fontSize: '2rem', fontWeight: 700, lineHeight: 1.3, marginBottom: 16, color: 'var(--text-primary)' }}>{slide.title}</h1>
        <div style={{ fontSize: '0.9333rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{slide.meta}</div>
      </div>
    )
  }
  if (slide.kind === 'concept' || slide.kind === 'intro') {
    const tag = slide.kind === 'concept' ? slide.tag : slide.tag
    const example = slide.kind === 'concept' ? slide.example : undefined
    return (
      <>
        {slide.kind === 'concept' && tag && <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--accent-soft)', borderRadius: 99, padding: '6px 12px', fontSize: '0.7333rem', fontWeight: 600, color: 'var(--brand)', marginBottom: 24, marginTop: 24 }}>{tag}</span>}
        <h1 style={{ fontFamily: 'Noto Sans JP', fontSize: '1.8667rem', fontWeight: 700, lineHeight: 1.4, marginBottom: 20, marginTop: tag ? 0 : 32, letterSpacing: '.005em', color: 'var(--text-primary)' }}>{slide.title}</h1>
        <RichLessonText content={slide.body} />
        <div style={{ marginBottom: 20 }} />
        {example && (
          <div style={{ background: 'var(--bg-card)', borderRadius: 16, padding: 18 }}>
            <div style={{ fontSize: '0.7333rem', fontWeight: 700, color: 'var(--brand)', letterSpacing: '.08em', marginBottom: 8 }}>EXAMPLE</div>
            <div style={{ fontSize: '1rem', lineHeight: 1.6, color: 'var(--text-primary)' }}>{example}</div>
          </div>
        )}
      </>
    )
  }

  if (slide.kind === 'diagram') {
    return (
      <>
        <h1 style={{ fontSize: '1.7333rem', fontWeight: 700, lineHeight: 1.4, marginBottom: 24, marginTop: 32, color: 'var(--text-primary)' }}>{slide.title}</h1>
        <div style={{ background: 'var(--bg-card)', borderRadius: 16, padding: 20, display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'center' }}>
          {slide.nodes.map((n, i) => (
            <div key={i} style={{ width: '100%' }}>
              <div style={{
                background: n.kind === 'conclusion' ? 'var(--brand)' : 'var(--bg-tertiary)',
                color: n.kind === 'conclusion' ? 'var(--accent-fg)' : 'var(--text-primary)',
                fontWeight: n.kind === 'conclusion' ? 700 : 600,
                borderRadius: 12,
                padding: '12px 18px',
                textAlign: 'center',
                fontSize: '0.9333rem',
              }}>{n.label}</div>
              {i < slide.nodes.length - 1 && <div style={{ color: 'var(--text-muted)', textAlign: 'center', fontSize: '1.2rem' }}>↓</div>}
            </div>
          ))}
        </div>
      </>
    )
  }

  if (slide.kind === 'quiz') {
    const isMulti = !!slide.multi
    const correctSet = new Set(slide.correctIndexes ?? [slide.correctIndex])

    return (
      <>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, marginTop: 24 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'var(--warm-soft)', borderRadius: 99, padding: '6px 12px', fontSize: '0.7333rem', fontWeight: 600, color: 'var(--warm)' }}>{t('stories.checkBadge')}</span>
          {isMulti && <span style={{ fontSize: '0.7333rem', color: 'var(--text-secondary)', background: 'var(--bg-card)', borderRadius: 99, padding: '4px 10px', fontWeight: 600 }}>{t('stories.multiSelect')}</span>}
        </div>
        <h2 style={{ fontSize: '1.4667rem', fontWeight: 700, lineHeight: 1.5, marginBottom: 24, color: 'var(--text-primary)' }}>{slide.question}</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {slide.choices.map((c, i) => {
            const answered = quizAnswered !== null
            const isCorrect = correctSet.has(i)

            if (isMulti) {
              const isPicked = multiSelected.includes(i)
              const wasSelected = quizAnswered?.selectedMulti?.includes(i)
              const bg: string = !answered
                ? (isPicked ? 'var(--accent-soft)' : 'var(--bg-card)')
                : (wasSelected && isCorrect ? 'var(--brand)' : wasSelected && !isCorrect ? '#4A1C1C' : isCorrect ? 'var(--accent-soft)' : 'var(--bg-card)')
              const color: string = !answered ? 'var(--text-primary)' : (wasSelected && isCorrect ? 'var(--accent-fg)' : 'var(--text-primary)')
              const border: string = !answered ? (isPicked ? `2px solid ${'var(--brand)'}` : '2px solid transparent') : 'none'
              return (
                <button type="button" key={i} onClick={() => !answered && onToggleMulti(i)}
                  disabled={answered}
                  role="checkbox"
                  aria-checked={isPicked}
                  style={{ background: bg, color, borderRadius: 14, padding: '14px 18px', fontSize: '1rem', fontWeight: 600, cursor: answered ? 'default' : 'pointer', transition: 'var(--transition-tap)', border: border === 'none' ? 'none' : border, display: 'flex', alignItems: 'center', gap: 10, WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation', font: 'inherit', textAlign: 'left', width: '100%', minHeight: 44 }}
                >
                  <div style={{ width: 20, height: 20, borderRadius: 6, border: `2px solid ${answered ? 'transparent' : isPicked ? 'var(--brand)' : 'var(--text-muted)'}`, background: isPicked && !answered ? 'var(--brand)' : answered && wasSelected && isCorrect ? 'var(--bg-primary)' + '30' : 'transparent', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {(isPicked && !answered) || (answered && wasSelected) ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={answered && wasSelected && isCorrect ? 'var(--bg-primary)' : 'var(--brand)'} strokeWidth="3" strokeLinecap="round" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg> : null}
                  </div>
                  {c}
                </button>
              )
            }

            // 単一選択
            const isSelected = quizAnswered?.selected === i
            const bg: string = !answered ? 'var(--bg-card)' : isSelected && isCorrect ? 'var(--brand)' : isSelected && !isCorrect ? '#4A1C1C' : isCorrect && answered ? 'var(--accent-soft)' : 'var(--bg-card)'
            const color: string = !answered ? 'var(--text-primary)' : isSelected && isCorrect ? 'var(--accent-fg)' : 'var(--text-primary)'
            return (
              <button type="button" key={i} onClick={() => !answered && onSelectQuiz(i)}
                disabled={answered}
                role="radio"
                aria-checked={isSelected ?? false}
                style={{ background: bg, color, borderRadius: 14, padding: '14px 18px', fontSize: '1rem', fontWeight: 600, cursor: answered ? 'default' : 'pointer', transition: 'var(--transition-tap)', WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation', border: 'none', font: 'inherit', textAlign: 'left', width: '100%', minHeight: 44 }}
              >{c}</button>
            )
          })}
        </div>

        {/* 複数選択: 回答ボタン */}
        {isMulti && !quizAnswered && (
          <button
            onClick={onSubmitMulti}
            disabled={multiSelected.length === 0}
            style={{ marginTop: 20, width: '100%', background: multiSelected.length > 0 ? 'var(--brand)' : 'var(--bg-card)', color: multiSelected.length > 0 ? 'var(--accent-fg)' : 'var(--text-muted)', border: 'none', borderRadius: 14, padding: '14px', fontSize: '1rem', fontWeight: 700, cursor: multiSelected.length > 0 ? 'pointer' : 'default' }}
          >
            {multiSelected.length === 0 ? t('stories.pickPrompt') : t('stories.pickedAnswer', { n: multiSelected.length })}
          </button>
        )}

        {quizAnswered && (
          <div style={{ marginTop: 20, padding: 16, background: 'var(--bg-card)', borderRadius: 14, fontSize: '1rem', lineHeight: 1.75 }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: quizAnswered.correct ? 'var(--brand)' : 'var(--md-sys-color-error)', marginBottom: 6 }}>{quizAnswered.correct ? t('stories.correct') : isMulti ? t('stories.wrongMulti', { list: [...correctSet].map(i => slide.choices[i]).join(t('stories.commaSep')) }) : t('stories.wrongSingle')}</div>
            {slide.explain}
          </div>
        )}
      </>
    )
  }

  // ── think スライド: 自由記述思考問題 ──
  if (slide.kind === 'think') {
    return <ThinkSlide slide={slide} onNext={onNext} />
  }

  // ── case スライド: ケース問題（段階開示） ──
  if (slide.kind === 'case') {
    return <CaseSlide slide={slide} onNext={onNext} />
  }

    if (slide.kind === 'summary') {
    return (
      <>
        {/* 完了アイコン */}
        <div style={{ textAlign: 'center', marginTop: 24, marginBottom: 20 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 64, height: 64, borderRadius: 20, background: `color-mix(in srgb, var(--brand) 9%, transparent)`, color: 'var(--brand)', marginBottom: 12 }}>
            <SparklesIcon width={32} height={32} />
          </div>
          <h1 style={{ fontSize: '1.7333rem', fontWeight: 800, lineHeight: 1.4, color: 'var(--text-primary)', marginBottom: 4 }}>{slide.title}</h1>
          <p style={{ fontSize: '0.9333rem', color: 'var(--text-secondary)' }}>{t('stories.completeDesc')}</p>
        </div>
        <ul style={{ display: 'flex', flexDirection: 'column', gap: 12, listStyle: 'none', padding: 0, marginBottom: 28 }}>
          {slide.points.map((p, i) => (
            <li key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', background: 'var(--bg-card)', borderRadius: 14, padding: '14px 16px' }}>
              <div style={{ width: 24, height: 24, borderRadius: '50%', background: 'var(--accent-btn)', color: 'var(--accent-btn-fg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 800, flexShrink: 0 }}>{i + 1}</div>
              <div style={{ fontSize: '1rem', lineHeight: 1.6 }}>{p}</div>
            </li>
          ))}
        </ul>
        {/* 次への導線 CTA */}
        <button
          onClick={onNext}
          style={{
            width: '100%', padding: '16px 0', borderRadius: 99,
            background: 'var(--accent-btn)', color: 'var(--accent-btn-fg)',
            fontSize: '1.0667rem', fontWeight: 700, border: 'none', cursor: 'pointer',
            boxShadow: `0 4px 20px color-mix(in srgb, var(--brand) 27%, transparent)`,
            WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation',
            letterSpacing: '.02em',
          }}
        >
          {t('stories.viewResult')}
        </button>
      </>
    )
  }

  if (slide.kind === 'compare') {
    return (
      <>
        <h1 style={{ fontSize: '1.7333rem', fontWeight: 700, marginBottom: 24, marginTop: 32, color: 'var(--text-primary)' }}>{slide.title}</h1>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ background: 'var(--bg-card)', borderRadius: 14, padding: 16 }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--brand)', marginBottom: 6 }}>{slide.left.label}</div>
            <div style={{ fontSize: '0.9333rem', lineHeight: 1.6 }}>{slide.left.body}</div>
          </div>
          <div style={{ background: 'var(--bg-card)', borderRadius: 14, padding: 16 }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--warm)', marginBottom: 6 }}>{slide.right.label}</div>
            <div style={{ fontSize: '0.9333rem', lineHeight: 1.6 }}>{slide.right.body}</div>
          </div>
        </div>
      </>
    )
  }

  if (slide.kind === 'quote') {
    return (
      <div style={{ marginTop: 80, padding: '0 8px' }}>
        <div style={{ fontSize: '3.7333rem', color: 'var(--brand)', lineHeight: 1, marginBottom: 8 }}>"</div>
        <div style={{ fontSize: '1.4667rem', fontWeight: 600, lineHeight: 1.6, marginBottom: 24 }}>{slide.quote}</div>
        <div style={{ fontSize: '0.9333rem', color: 'var(--text-secondary)' }}>— {slide.author}</div>
      </div>
    )
  }

  if (slide.kind === 'visual') {
    const element = renderVisual(slide.visualId, slide.visualProps)
    if (!element) return null
    // 2026-05-22 — 全 Visual を fullBleed 表示に統一（旧: Pyramid のみ）。
    // 画面端まで広げ、コンテナ側の汎用 `[data-fullbleed="true"]` 底上げ CSS で
    // フォント・spacing をスマホ向けに揃える。
    return (
      <VisualSlide title={slide.title} caption={slide.caption} fullBleed>
        {element}
      </VisualSlide>
    )
  }

  return null
}

// ─────────────────────────────────────────────
// ThinkSlide: 自由記述思考問題 (type: 'think')
// ─────────────────────────────────────────────
type ScoringResult = {
  scores: { point: number; reason: number; example: number; overall: number }
  comments: { ja: string; en: string }
  strengths: { ja: string; en: string }
  improvements: { ja: string; en: string }
}

function ThinkSlide({ slide, onNext }: { slide: Extract<import('../lessonSlides').LessonSlide, { kind: 'think' }>; onNext: () => void }) {
  const [revealed, setRevealed] = useState(false)
  const [userInput, setUserInput] = useState('')
  const [scoring, setScoring] = useState(false)
  const [scoreResult, setScoreResult] = useState<ScoringResult | null>(null)
  const [scoreError, setScoreError] = useState(false)

  const locale = getLocale()

  const handleScore = async () => {
    setScoring(true)
    setScoreError(false)
    try {
      const res = await fetch(`${API_BASE}/api/writing-score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: userInput }),
      })
      if (!res.ok) throw new Error('scoring failed')
      const data = await res.json() as ScoringResult
      setScoreResult(data)
    } catch {
      setScoreError(true)
    } finally {
      setScoring(false)
    }
  }

  return (
    <>
      {/* ヘッダーバッジ */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, marginTop: 24 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: `color-mix(in srgb, var(--warm) 13%, transparent)`, borderRadius: 99, padding: '6px 12px', fontSize: '0.7333rem', fontWeight: 700, color: 'var(--warm)', letterSpacing: '.04em' }}>
          <LightbulbIcon width={12} height={12} />
          {t('stories.thinkPrompt')}
        </span>
      </div>

      {/* 問い */}
      <h2 style={{ fontSize: '1.4rem', fontWeight: 800, lineHeight: 1.55, marginBottom: 20, color: 'var(--text-primary)' }}>
        {slide.question}
      </h2>

      {/* ヒント */}
      {slide.hint && (
        <div style={{ background: `color-mix(in srgb, var(--brand) 7%, transparent)`, border: `1px solid color-mix(in srgb, var(--brand) 19%, transparent)`, borderRadius: 12, padding: '12px 16px', marginBottom: 20, fontSize: '0.8667rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          <span style={{ fontWeight: 700, color: 'var(--brand)' }}>{t('stories.hintPrefix')}</span>{slide.hint}
        </div>
      )}

      {/* テキスト入力エリア（採点前） */}
      {!scoreResult && (
        <div style={{ marginBottom: 20 }}>
          <textarea
            value={userInput}
            onChange={e => setUserInput(e.target.value)}
            placeholder={t('stories.thinkInputPlaceholder')}
            rows={5}
            style={{
              width: '100%',
              boxSizing: 'border-box',
              background: 'var(--bg-card)',
              border: `1.5px solid var(--border)`,
              borderRadius: 12,
              padding: '12px 14px',
              fontSize: '0.9333rem',
              lineHeight: 1.7,
              color: 'var(--text-primary)',
              resize: 'vertical',
              outline: 'none',
              fontFamily: 'inherit',
            }}
          />
          {scoreError && (
            <div style={{ marginTop: 8, fontSize: '0.8rem', color: 'var(--error, #e53e3e)' }}>
              {t('stories.scoreError')}
            </div>
          )}
          <button
            onClick={handleScore}
            disabled={userInput.trim().length === 0 || scoring}
            style={{
              marginTop: 10,
              width: '100%',
              padding: '13px 0',
              borderRadius: 14,
              border: 'none',
              background: userInput.trim().length === 0 || scoring ? 'var(--border)' : 'var(--brand)',
              color: userInput.trim().length === 0 || scoring ? 'var(--text-muted)' : '#fff',
              fontSize: '0.9333rem',
              fontWeight: 700,
              cursor: userInput.trim().length === 0 || scoring ? 'not-allowed' : 'pointer',
              transition: 'background 0.15s',
            }}
          >
            {scoring ? t('stories.scoring') : t('stories.scoreMyAnswer')}
          </button>
        </div>
      )}

      {/* 採点結果カード */}
      {scoreResult && (
        <WritingScoreResult result={scoreResult} locale={locale} />
      )}

      {/* モデル解答（開示後） */}
      {revealed && (
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--brand)', letterSpacing: '.06em', marginBottom: 10 }}>{t('stories.modelAnswer')}</div>
          <div style={{ background: 'var(--bg-card)', borderRadius: 16, padding: '18px 20px', fontSize: '0.9333rem', lineHeight: 1.8, color: 'var(--text-primary)', marginBottom: 14, borderLeft: `3px solid ${'var(--brand)'}` }}>
            {slide.modelAnswer}
          </div>

          {/* 考え方のポイント */}
          {slide.points.length > 0 && (
            <>
              <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '.04em', marginBottom: 8 }}>{t('stories.points')}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {slide.points.map((p, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: 'var(--bg-card)', borderRadius: 12, padding: '12px 14px' }}>
                    <div style={{ width: 20, height: 20, borderRadius: '50%', background: 'var(--accent-soft)', color: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7333rem', fontWeight: 800, flexShrink: 0 }}>{i + 1}</div>
                    <div style={{ fontSize: '0.8667rem', lineHeight: 1.6, color: 'var(--text-secondary)' }}>{p}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* アクションボタン */}
      {!revealed ? (
        <button
          onClick={() => setRevealed(true)}
          style={{ width: '100%', padding: '15px 0', borderRadius: 14, border: `1.5px solid ${'var(--brand)'}`, background: 'transparent', color: 'var(--brand)', fontSize: '1rem', fontWeight: 700, cursor: 'pointer' }}
        >
          {t('stories.viewModel')}
        </button>
      ) : (
        <button
          onClick={onNext}
          style={{ width: '100%', padding: '15px 0', borderRadius: 14, border: 'none', background: 'var(--accent-btn)', color: 'var(--accent-btn-fg)', fontSize: '1rem', fontWeight: 700, cursor: 'pointer' }}
        >
          {t('stories.proceed')}
        </button>
      )}
    </>
  )
}

// ─────────────────────────────────────────────
// CaseSlide: ケース問題（段階開示）(type: 'case')
// ─────────────────────────────────────────────
function CaseSlide({ slide, onNext }: { slide: Extract<import('../lessonSlides').LessonSlide, { kind: 'case' }>; onNext: () => void }) {
  const [phaseIndex, setPhaseIndex] = useState(0)
  const [answered, setAnswered] = useState<{ selected: number; correct: boolean } | null>(null)
  const [concluded, setConcluded] = useState(false)

  const phase = slide.phases[phaseIndex]
  const isLastPhase = phaseIndex === slide.phases.length - 1

  const handleSelect = (i: number) => {
    if (answered) return
    const correct = slide.phases[phaseIndex].options[i].correct
    setAnswered({ selected: i, correct })
  }

  const handleNext = () => {
    if (!answered) return
    if (isLastPhase) {
      setConcluded(true)
    } else {
      setPhaseIndex(p => p + 1)
      setAnswered(null)
    }
  }

  if (concluded) {
    return (
      <>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, marginTop: 24 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: `color-mix(in srgb, var(--brand) 13%, transparent)`, borderRadius: 99, padding: '6px 12px', fontSize: '0.7333rem', fontWeight: 700, color: 'var(--brand)' }}>
            <CheckIcon width={12} height={12} />
            {t('stories.caseDone')}
          </span>
        </div>
        <h2 style={{ fontSize: '1.3333rem', fontWeight: 800, lineHeight: 1.5, marginBottom: 16, color: 'var(--text-primary)' }}>{t('stories.frameworkSummary')}</h2>
        <div style={{ background: 'var(--bg-card)', borderRadius: 16, padding: '18px 20px', fontSize: '0.9333rem', lineHeight: 1.9, color: 'var(--text-secondary)', marginBottom: 28, borderLeft: `3px solid ${'var(--brand)'}`, whiteSpace: 'pre-line' }}>
          {slide.conclusion}
        </div>
        <button
          onClick={onNext}
          style={{ width: '100%', padding: '15px 0', borderRadius: 14, border: 'none', background: 'var(--accent-btn)', color: 'var(--accent-btn-fg)', fontSize: '1rem', fontWeight: 700, cursor: 'pointer' }}
        >
          {t('stories.proceed')}
        </button>
      </>
    )
  }

  return (
    <>
      {/* ヘッダー */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, marginTop: 24 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: `color-mix(in srgb, var(--brand) 9%, transparent)`, borderRadius: 99, padding: '6px 12px', fontSize: '0.7333rem', fontWeight: 700, color: 'var(--brand)' }}>
          <ClipboardListIcon width={12} height={12} />
          {t('stories.casePhase', { n: phaseIndex + 1, total: slide.phases.length })}
        </span>
        <span style={{ fontSize: '0.7333rem', color: 'var(--text-muted)' }}>{slide.title}</span>
      </div>

      {/* 状況説明（Phase 1のみ） */}
      {phaseIndex === 0 && (
        <div style={{ background: `color-mix(in srgb, var(--warm) 8%, transparent)`, border: `1px solid color-mix(in srgb, var(--warm) 19%, transparent)`, borderRadius: 12, padding: '14px 16px', marginBottom: 18, fontSize: '0.8667rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          <div style={{ fontSize: '0.7333rem', fontWeight: 700, color: 'var(--warm)', marginBottom: 6 }}>{t('stories.situation')}</div>
          {slide.situation}
        </div>
      )}

      {/* フェーズ情報（追加開示） */}
      {phaseIndex > 0 && (
        <div style={{ background: 'var(--bg-card)', borderRadius: 12, padding: '14px 16px', marginBottom: 18, fontSize: '0.8667rem', color: 'var(--text-secondary)', lineHeight: 1.7, borderLeft: `3px solid color-mix(in srgb, var(--brand) 31%, transparent)` }}>
          <div style={{ fontSize: '0.7333rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6 }}>{t('stories.extraInfo')}</div>
          {phase.info}
        </div>
      )}
      {phaseIndex === 0 && phase.info && (
        <div style={{ background: 'var(--bg-card)', borderRadius: 12, padding: '14px 16px', marginBottom: 18, fontSize: '0.8667rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          {phase.info}
        </div>
      )}

      {/* 問い */}
      <h2 style={{ fontSize: '1.2667rem', fontWeight: 800, lineHeight: 1.55, marginBottom: 18, color: 'var(--text-primary)' }}>{phase.question}</h2>

      {/* 選択肢 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
        {phase.options.map((opt, i) => {
          const isSelected = answered?.selected === i
          const isCorrect = opt.correct
          const bg = !answered
            ? 'var(--bg-card)'
            : isSelected && isCorrect ? 'var(--brand)'
            : isSelected && !isCorrect ? '#4A1C1C'
            : isCorrect && answered ? 'var(--accent-soft)'
            : 'var(--bg-card)'
          const color = isSelected && isCorrect && answered ? 'var(--accent-fg)' : 'var(--text-primary)'
          return (
            <button type="button" key={i} onClick={() => handleSelect(i)}
              disabled={!!answered}
              role="radio"
              aria-checked={isSelected ?? false}
              style={{ background: bg, color, borderRadius: 14, padding: '14px 18px', fontSize: '1.0667rem', fontWeight: 600, cursor: answered ? 'default' : 'pointer', transition: 'background 0.2s', lineHeight: 1.5, WebkitTapHighlightColor: 'transparent', touchAction: 'manipulation', border: 'none', font: 'inherit', textAlign: 'left', width: '100%', minHeight: 44 }}
            >
              {opt.label}
            </button>
          )
        })}
      </div>

      {/* フィードバック */}
      {answered && (
        <div style={{ background: 'var(--bg-card)', borderRadius: 14, padding: '14px 16px', marginBottom: 16, fontSize: '0.8667rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', fontWeight: 700, color: answered.correct ? 'var(--brand)' : 'var(--md-sys-color-error)', marginBottom: 6 }}>
            {answered.correct ? <CheckIcon width={12} height={12} /> : <LightbulbIcon width={12} height={12} />}
            <span>{answered.correct ? t('stories.goodCall') : t('stories.closeCall')}</span>
          </div>
          {phase.options[answered.selected].feedback}
        </div>
      )}

      {answered && (
        <button
          onClick={handleNext}
          style={{ width: '100%', padding: '15px 0', borderRadius: 14, border: 'none', background: 'var(--accent-btn)', color: 'var(--accent-btn-fg)', fontSize: '1rem', fontWeight: 700, cursor: 'pointer' }}
        >
          {isLastPhase ? t('stories.viewSummary') : t('stories.nextPhase', { n: phaseIndex + 2, total: slide.phases.length })}
        </button>
      )}
    </>
  )
}
