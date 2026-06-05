// Logic v3 — full app shell with all screens
import { useEffect, useState, useRef, useCallback, lazy, Suspense } from 'react'
import { AppShell, type Tab } from './components/AppShell'
import { HomeScreenV3 } from './screens/HomeScreenV3'
import { RoadmapScreenV3 } from './screens/RoadmapScreenV3'
import { ProfileScreenV3 } from './screens/ProfileScreenV3'
import { LessonStoriesScreen } from './screens/LessonStoriesScreen'
import { LessonCompleteScreen, type NextCourseInfo } from './screens/LessonCompleteScreen'
import { BootLoadingScreen } from './screens/BootLoadingScreen'

// Lazy-load lower-frequency screens to keep initial bundle small.
const FlashcardsScreen = lazy(() => import('./screens/FlashcardsScreen').then(m => ({ default: m.FlashcardsScreen })))
const ReviewModeScreen = lazy(() => import('./screens/ReviewModeScreen').then(m => ({ default: m.ReviewModeScreen })))
const ReviewHubScreen = lazy(() => import('./screens/ReviewHubScreen').then(m => ({ default: m.ReviewHubScreen })))
const WrongAnswerListScreen = lazy(() => import('./screens/WrongAnswerListScreen').then(m => ({ default: m.WrongAnswerListScreen })))
const SavedItemsScreen = lazy(() => import('./screens/SavedItemsScreen').then(m => ({ default: m.SavedItemsScreen })))
const FermiScreen = lazy(() => import('./screens/FermiScreen').then(m => ({ default: m.FermiScreen })))
const DailyFermiScreen = lazy(() => import('./screens/DailyFermiScreen').then(m => ({ default: m.DailyFermiScreen })))
const FermiRankingScreen = lazy(() => import('./screens/FermiRankingScreen').then(m => ({ default: m.FermiRankingScreen })))
const FermiHistoryScreen = lazy(() => import('./screens/FermiHistoryScreen').then(m => ({ default: m.FermiHistoryScreen })))
const ReportProblemScreen = lazy(() => import('./screens/ReportProblemScreen').then(m => ({ default: m.ReportProblemScreen })))
const OnboardingScreen = lazy(() => import('./screens/OnboardingScreen').then(m => ({ default: m.OnboardingScreen })))
const AIProblemGenScreen = lazy(() => import('./screens/AIProblemGenScreen').then(m => ({ default: m.AIProblemGenScreen })))
const AIProblemScreen = lazy(() => import('./screens/AIProblemScreen').then(m => ({ default: m.AIProblemScreen })))
const FeedbackScreen = lazy(() => import('./screens/FeedbackScreen').then(m => ({ default: m.FeedbackScreen })))
const PlacementTestScreen = lazy(() => import('./screens/PlacementTestScreen').then(m => ({ default: m.PlacementTestScreen })))
const PersonalCourseScreen = lazy(() => import('./screens/PersonalCourseScreen').then(m => ({ default: m.PersonalCourseScreen })))
const CustomCourseScreen = lazy(() => import('./screens/CustomCourseScreen').then(m => ({ default: m.CustomCourseScreen })))
const PricingScreen = lazy(() => import('./screens/PricingScreen').then(m => ({ default: m.PricingScreen })))
const StreakScreen = lazy(() => import('./screens/StreakScreen').then(m => ({ default: m.StreakScreen })))
const AccountSettingsScreen = lazy(() => import('./screens/AccountSettingsScreen').then(m => ({ default: m.AccountSettingsScreen })))
const ProfileEditScreen = lazy(() => import('./screens/ProfileEditScreen').then(m => ({ default: m.ProfileEditScreen })))
const NotificationSettingsScreen = lazy(() => import('./screens/NotificationSettingsScreen').then(m => ({ default: m.NotificationSettingsScreen })))
const AppearanceSettingsScreen = lazy(() => import('./screens/AppearanceSettingsScreen').then(m => ({ default: m.AppearanceSettingsScreen })))
const FontSizeSettingsScreen = lazy(() => import('./screens/FontSizeSettingsScreen').then(m => ({ default: m.FontSizeSettingsScreen })))
const PreferencesScreen = lazy(() => import('./screens/PreferencesScreen').then(m => ({ default: m.PreferencesScreen })))
const CompletedLessonsScreen = lazy(() => import('./screens/CompletedLessonsScreen').then(m => ({ default: m.CompletedLessonsScreen })))
const StudyTimeScreen = lazy(() => import('./screens/StudyTimeScreen').then(m => ({ default: m.StudyTimeScreen })))
const LanguageScreen = lazy(() => import('./screens/LanguageScreen').then(m => ({ default: m.LanguageScreen })))
const RankScreen = lazy(() => import('./screens/RankScreen').then(m => ({ default: m.RankScreen })))
const LoginScreen = lazy(() => import('./screens/LoginScreen').then(m => ({ default: m.LoginScreen })))
const DailyProblemScreen = lazy(() => import('./screens/DailyProblemScreen').then(m => ({ default: m.DailyProblemScreen })))
const JournalScreen = lazy(() => import('./screens/JournalScreen').then(m => ({ default: m.JournalScreen })))
const JournalGuestPreview = lazy(() => import('./screens/JournalScreen').then(m => ({ default: m.JournalGuestPreview })))
import { allLessons, getAllLessonsFlat } from './lessonData'
import { COURSES, getCourseById } from './courseData'
import { loadPlacementResult } from './placementData'
import { getCurrentLevel } from './screens/homeHelpers'
import { LevelUpModal } from './components/LevelUpModal'
import { RankUpModal } from './components/RankUpModal'
import { LevelUpToast } from './components/LevelUpToast'
import {
  consumeLevelUpEvent,
  consumeRankUpEvent,
  consumeLevelUpToast,
  peekLevelUpEvent,
  peekRankUpEvent,
  peekLevelUpToast,
  recordLessonCompleteEvent,
  type LevelUpEvent,
  type RankUpEvent,
  type LevelUpToastEvent,
} from './levelUpStore'


import type { AIProblemSet } from './aiProblemStore'
import type { FlashcardMode } from './screens/FlashcardsScreen'
import { loadTheme, applyTheme } from './theme'
// import { loadGuestUser } from './guestUser'
import { getCompletedCount, getXp, getDisplayName, setDisplayName, recordCompletion, XP_REWARDS } from './stats'
import { recordActivity } from './activityLog'
import { updateDisplayName } from './supabase'
import { isAdmin } from './admin'
import { isDevMode } from './devMode'
import { logStorageUsage } from './storageUsage'
import { onAuthChange, getInitialUser, type User } from './supabase'
import { setUser as setSentryUser } from './sentry'
import { hideSplash } from './platform'
import { SnackbarProvider } from './components/Snackbar'
import { syncOnLogin, syncOnLogout } from './syncService'
import { canUseJournal, getJournalTrialDaysLeft, isPaid } from './subscription'
import { initBilling } from './billing'
import { SparklesIcon } from './icons'
import { TutorialOverlay, TutorialFAB } from './components/TutorialOverlay'
import { tutorial } from './tutorial/tutorialStorage'
import { t } from './i18n'
import { useAssistantName } from './hooks/useAssistantName'
import { addNotificationTapListener, rescheduleAllReminders } from './notifications'
import { checkAndInitInstall } from './installReset'
import { ReviewPreviewScreen } from './screens/ReviewPreviewScreen'
import { ErrorBoundary } from './components/ErrorBoundary'

const ONBOARDED_KEY = 'logic-onboarded'

const NAV_SNAPSHOT_KEY = 'logic-nav-snapshot'

// 再起動時に安全に復元できる Screen 型の集合
// lesson/lesson-complete/ai-problem など揮発状態を持つものは除外
const PERSISTABLE_SCREENS = new Set<string>([
  'home', 'lessons', 'roadmap', 'profile',
  'flashcards', 'review-mode', 'review-hub', 'wrong-answers', 'saved-items',
  'daily-fermi', 'fermi-ranking', 'fermi-history', 'daily-problem',
  'streak', 'completed-lessons', 'study-time', 'rank', 'journal',
])

// SCRUM-200 / DF-F11: 新規インストール検知と localStorage の選択的初期化。
// ロジックは installReset.ts に切り出した（単体テスト容易化 + 全消し副作用の是正）。

// 同カテゴリの次の未完了レッスンIDを返す（なければ null）
type Screen =
  | { type: 'home' }
  | { type: 'lessons' }
  | { type: 'roadmap'; category?: string }
  | { type: 'profile' }
  | { type: 'lesson'; lessonId: number; startStep?: number; returnScreen?: Screen }
  | { type: 'lesson-complete'; lessonId: number; durationSec: number; prevLevel: number; returnScreen?: Screen }
  | { type: 'flashcards'; mode?: FlashcardMode }
  | { type: 'review-mode' }
  | { type: 'review-hub' }
  | { type: 'wrong-answers' }
  | { type: 'saved-items' }
  | { type: 'fermi' }
  | { type: 'daily-fermi' }
  | { type: 'fermi-ranking' }
  | { type: 'fermi-history' }
  | { type: 'daily-problem' }
  | { type: 'ai-problem-gen' }
  | { type: 'ai-problem'; problem: AIProblemSet }
  | { type: 'feedback' }
  | { type: 'placement-test' }
  | { type: 'personal-course' }
  | { type: 'custom-course'; courseId: string }
  | { type: 'pricing' }
  | { type: 'streak' }
  | { type: 'account-settings' }
  | { type: 'profile-edit' }
  | { type: 'notification-settings' }
  | { type: 'appearance-settings' }
  | { type: 'font-size-settings' }
  | { type: 'preferences' }
  | { type: 'completed-lessons' }
  | { type: 'study-time' }
  | { type: 'language' }
  | { type: 'rank' }
  | { type: 'login' }
  | { type: 'report-problem'; context: { lessonId?: number; lessonTitle?: string; question?: string } }
  | { type: 'onboarding' }
  | { type: 'journal' }
  | { type: 'welcome' }

// LESSON_LIST is now managed within RoadmapScreen

function getInitialScreen(user: User | null): Screen {
  if (typeof location !== 'undefined') {
    const preview = new URL(location.href).searchParams.get('preview')
    if (preview === 'onboarding') return { type: 'onboarding' }
    if (preview === 'home') return { type: 'home' }
    if (preview === 'lessons') return { type: 'lessons' }
    if (preview === 'profile') return { type: 'profile' }
    if (preview === 'fermi') return { type: 'daily-fermi' }
    if (preview === 'pricing') return { type: 'pricing' }
    if (preview === 'account') return { type: 'account-settings' }
    if (preview === 'profile-edit') return { type: 'profile-edit' }
    if (preview === 'notifications') return { type: 'notification-settings' }
    if (preview === 'appearance') return { type: 'appearance-settings' }
    if (preview === 'fontsize') return { type: 'font-size-settings' }
    if (preview === 'preferences') return { type: 'preferences' }
    if (preview === 'journal') return { type: 'journal' }
  }
  // ログイン済みユーザーはオンボーディングをスキップ、最後のタブ位置を復元
  if (user) {
    // Stage②: 復帰スナップショットを試みる
    try {
      const raw = localStorage.getItem(NAV_SNAPSHOT_KEY)
      if (raw) {
        const snapshot = JSON.parse(raw) as Screen
        if (snapshot && PERSISTABLE_SCREENS.has(snapshot.type)) {
          return snapshot
        }
      }
    } catch { /* ignore QuotaExceeded / parse error */ }
    // フォールバック: 最後のタブ位置
    const lastTab = localStorage.getItem('logic-last-tab')
    const RESTORABLE_TABS = ['home', 'lessons', 'fermi-ranking', 'journal', 'profile']
    if (lastTab && RESTORABLE_TABS.includes(lastTab)) {
      if (lastTab === 'fermi-ranking') return { type: 'fermi-ranking' }
      return { type: lastTab } as Screen
    }
    return { type: 'home' }
  }
  // 未ログインは必ずオンボーディングまたはログイン画面へ
  if (localStorage.getItem(ONBOARDED_KEY) !== '1') {
    return { type: 'onboarding' }
  }
  // オンボーディング完了済みだが未ログインの場合はログイン画面へ
  return { type: 'login' }
}

// ── ルート画面かどうか判定 ──
// 'ranking' タブ ID は Screen.type 'fermi-ranking' に対応する（handleTabChange / popstate 参照）。
const ROOT_SCREENS = new Set<string>(['home', 'lessons', 'fermi-ranking', 'journal', 'profile'])

// ── Screen.type → Tab ID のマッピング（ROOT_SCREENS 専用）──
// 'ranking' タブは Screen.type 'fermi-ranking' に対応する唯一の例外を1か所に集約。
const SCREEN_TO_TAB: Partial<Record<string, Tab>> = {
  'home': 'home',
  'lessons': 'lessons',
  'fermi-ranking': 'ranking',
  'journal': 'journal',
  'profile': 'profile',
}

function AppV3() {
  const [tab, setTab] = useState<Tab>('home')
  const [screen, setScreen] = useState<Screen>(() => getInitialScreen(null))
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [authReady, setAuthReady] = useState(false)
  const [showTutorial, setShowTutorial] = useState(false)
  const [showFAB, setShowFAB] = useState(() => !tutorial.hasFABDismissed())
  const [showNamePopup, setShowNamePopup] = useState(false)
  const [nameInput, setNameInput] = useState('')
  const [nameSaving, setNameSaving] = useState(false)
  // レベルアップ / ランクアップ演出 (Phase 1〜4)
  const [levelUpEvt, setLevelUpEvt] = useState<LevelUpEvent | null>(null)
  const [rankUpEvt, setRankUpEvt] = useState<RankUpEvent | null>(null)
  const [toastEvt, setToastEvt] = useState<LevelUpToastEvent | null>(null)
  // popstate ハンドラ内でscreen stateを参照するための ref
  const screenRef = useRef<Screen>(screen)
  // popstate による遷移かどうかのフラグ（push 抑制用）
  const isPopNavRef = useRef(false)
  void isAdmin() // reserved for future admin checks

  // subscription:updated イベントで canUseJournal() / isPaid() を再評価するためのチック
  const [, setSubTick] = useState(0)
  useEffect(() => {
    const handler = () => setSubTick(t => t + 1)
    window.addEventListener('subscription:updated', handler)
    return () => window.removeEventListener('subscription:updated', handler)
  }, [])

  // SCRUM-200: 新規インストール時にlocalStorageリセット（アンインストール後のデータ残留対策）
  // useEffect に移すことで React Strict Mode の二重レンダリングでの意図しない複数回実行を防ぐ
  useEffect(() => {
    checkAndInitInstall()
    // Play Billing 初期化（Android native のみ、Web では no-op）
    void initBilling()
    // FB-23: dev/admin モードでは起動時に localStorage 使用量の内訳をコンソールへ。
    // 「実機で実際どのキーがどれだけ食っているか」を測れるようにする土台。
    if (isDevMode() || isAdmin()) logStorageUsage()
  }, [])

  // screenRef を常に最新の screen と同期させる（コンカレントレンダリング対策）
  useEffect(() => { screenRef.current = screen }, [screen])

  // レベルアップ / ランクアップ演出の pending イベント監視
  //   - lesson-complete 画面に入ったら LevelUpModal / RankUpModal を表示
  //   - home 画面に入ったら LevelUpToast を表示 (lesson-complete を経由しなかった場合の補完)
  // setState は次の tick に defer して cascading render を避ける (react-hooks/set-state-in-effect)
  useEffect(() => {
    let cancelled = false
    const id = setTimeout(() => {
      if (cancelled) return
      if (screen.type === 'lesson-complete') {
        const rank = peekRankUpEvent()
        const level = peekLevelUpEvent()
        if (rank) {
          setRankUpEvt(rank)
        } else if (level) {
          setLevelUpEvt(level)
        }
      } else if (screen.type === 'home') {
        const toast = peekLevelUpToast()
        if (toast) setToastEvt(toast)
      }
    }, 0)
    return () => {
      cancelled = true
      clearTimeout(id)
    }
  }, [screen.type])

  // ── History 連動の setScreen ラッパー ──
  // ROOT_SCREENS に遷移するときは tab state も自動で合わせる（手動 setTab 呼び出し不要）。
  const navigate = useCallback((next: Screen, replace = false) => {
    setScreen(next)
    // ROOT_SCREENS への遷移は tab も同期する（SCREEN_TO_TAB で一元管理）
    const nextTab = SCREEN_TO_TAB[next.type]
    if (nextTab !== undefined) {
      setTab(nextTab)
    }
    // Stage②: 安全な screen は localStorage に保存して離脱復帰に備える
    if (PERSISTABLE_SCREENS.has(next.type)) {
      try {
        localStorage.setItem(NAV_SNAPSHOT_KEY, JSON.stringify(next))
      } catch { /* ignore QuotaExceeded */ }
    }
    if (isPopNavRef.current) return // popstate 経由なら push しない
    if (replace || ROOT_SCREENS.has(next.type)) {
      window.history.replaceState({ screen: next }, '')
    } else {
      window.history.pushState({ screen: next }, '')
    }
  }, [])

  // ── popstate (バックスワイプ/戻るボタン) ──
  useEffect(() => {
    const onPop = (e: PopStateEvent) => {
      if (e.state?.screen) {
        isPopNavRef.current = true
        const s = e.state.screen as Screen
        setScreen(s)
        if (s.type === 'fermi-ranking') {
          setTab('ranking')
        } else if (s.type === 'journal') {
          setTab('journal')
        } else if (ROOT_SCREENS.has(s.type)) {
          setTab(s.type as Tab)
        }
        isPopNavRef.current = false
      } else {
        // state がない場合はホームへ
        isPopNavRef.current = true
        setTab('home')
        setScreen({ type: 'home' })
        isPopNavRef.current = false
      }
    }
    window.addEventListener('popstate', onPop)
    // 初期 state をセット
    window.history.replaceState({ screen: screenRef.current }, '')
    return () => window.removeEventListener('popstate', onPop)
  }, [])

  // v3 デザイン用テーマ class を body に付与（tokens.css の .theme-v3 が活性化）
  useEffect(() => {
    document.body.classList.add('theme-v3')
    return () => { document.body.classList.remove('theme-v3') }
  }, [])

  useEffect(() => {
    applyTheme(loadTheme())
    // BootLoadingScreen は最低 2 秒は出す（ユーザーがブランドを認識する余白 + 裏でリモート同期を確実に走らせる）
    const bootStart = Date.now()
    const MIN_BOOT_MS = 2000
    const ensureMinBoot = async () => {
      const elapsed = Date.now() - bootStart
      if (elapsed < MIN_BOOT_MS) {
        await new Promise<void>((resolve) => setTimeout(resolve, MIN_BOOT_MS - elapsed))
      }
    }
    // ネイティブ SplashScreen は 1500ms 後に隠す → React の BootLoadingScreen が引き継ぐ
    const splashTimer = setTimeout(() => { void hideSplash() }, 1500)
    // 初回起動時にセッションを取得し、ログイン済ならホームへ。同時にリモートと同期して最新化。
    getInitialUser().then(async (user) => {
      setCurrentUser(user)
      const initial = getInitialScreen(user)
      setScreen(initial)
      window.history.replaceState({ screen: initial }, '')
      await ensureMinBoot()
      setAuthReady(true)
      clearTimeout(splashTimer)
      void hideSplash()
      if (user) void syncOnLogin(user.id)
    }).catch(async () => {
      // ネットワークエラー等でも必ずSplashを閉じてホームへ遷移させる
      await ensureMinBoot()
      clearTimeout(splashTimer)
      setAuthReady(true)
      void hideSplash()
    })
    const unsub = onAuthChange(async (user) => {
      setCurrentUser(user)
      setSentryUser(user ? { id: user.id, email: user.email ?? null } : null)
      if (user) {
        // preview=onboarding 中はホームに戻さない
        const isPreview = typeof location !== 'undefined' && new URL(location.href).searchParams.get('preview') === 'onboarding'
        if (!isPreview) {
          // ログイン直後（login / onboarding 画面からの遷移）はウェルカム画面を即座に表示
          setScreen((s) => (s.type === 'login' || s.type === 'onboarding') ? { type: 'welcome' } : s)
          // チュートリアルは右下FABから任意で起動
        }
        // syncOnLogin はバックグラウンドで実行（画面遷移をブロックしない）
        void syncOnLogin(user.id)
      } else {
        syncOnLogout()
      }
    })
    // splashTimer と authリスナーの両方をcleanup
    return () => {
      clearTimeout(splashTimer)
      unsub()
    }
  }, [])

  // 通知タップ → ホームへ deep link
  // 起動時に全リマインダーを一旦 cancel → 各 pref が enabled なものだけ再 schedule。
  // これで「設定変更で残った古いスケジュール」「重複発火」を防ぐ。
  useEffect(() => {
    let cleanup: (() => void) | undefined
    void (async () => {
      cleanup = await addNotificationTapListener(() => {
        navigate({ type: 'home' })
      })
      await rescheduleAllReminders()
    })()
    return () => { cleanup?.() }
  }, [navigate])

  // 表示名: localStorage優先 → user_metadata → email
  const storedName = getDisplayName()
  const userName = storedName
    || currentUser?.user_metadata?.full_name
    || currentUser?.user_metadata?.name
    || currentUser?.email
    || t('home.guestName')
  const completed = getCompletedCount()
  const xp = completed * 100
  const level = Math.floor(xp / 1000) + 1

  // パーソナルアシスタント名（ジャーナル・要約 CTA で使用）
  const { assistantName, updateAssistantName } = useAssistantName(currentUser?.id ?? null)

  const handleSaveName = async () => {
    const name = nameInput.trim()
    if (!name) return
    setNameSaving(true)
    setDisplayName(name)
    if (currentUser) {
      await updateDisplayName(name).catch(() => {})
    }
    setNameSaving(false)
    setShowNamePopup(false)
  }

  const handleTabChange = (next: Tab) => {
    setTab(next)
    // 最後のアクティブタブを保存（ログイン済みユーザーの再起動後に復元するため）
    const storageTab = next === 'ranking' ? 'fermi-ranking' : next
    localStorage.setItem('logic-last-tab', storageTab)
    // rankingタブはフェルミランキング画面へ
    if (next === 'ranking') {
      navigate({ type: 'fermi-ranking' }, true)
    } else if (next === 'journal') {
      navigate({ type: 'journal' }, true)
    } else {
      navigate({ type: next }, true)
    }
  }

  const handleOpenLesson = (lessonId: number, returnScreen?: Screen) => {
    lessonStartTimeRef.current = Date.now()
    navigate({ type: 'lesson', lessonId, returnScreen })
  }

  const handleBack = () => {
    // 現在がルート画面（ROOT_SCREENS）の場合はホームへ戻す（home 以外のタブルートから戻す）
    if (ROOT_SCREENS.has(screenRef.current.type)) {
      if (screenRef.current.type !== 'home') {
        navigate({ type: 'home' }, true)
      }
      return
    }
    // スタック上に前画面があれば History を戻す
    if (window.history.state?.screen) {
      window.history.back()
    } else {
      // フォールバック: 現在タブのルート画面へ（SCREEN_TO_TAB の逆引きで tab→screenType）
      if (tab === 'ranking') {
        navigate({ type: 'fermi-ranking' }, true)
      } else if (tab === 'journal') {
        navigate({ type: 'journal' }, true)
      } else {
        navigate({ type: tab }, true)
      }
    }
  }

  const lessonStartTimeRef = useRef<number>(0)
  const handleComplete = () => {
    if (screen.type === 'lesson') {
      const lessonId = screen.lessonId
      const startedAt = lessonStartTimeRef.current
      // 開始時刻が未設定（直接遷移 / deep link）の場合は計測対象外
      const rawElapsedMs = startedAt > 0 ? Date.now() - startedAt : 0
      const THREE_HOURS_MS = 3 * 60 * 60 * 1000
      const validElapsedMs = rawElapsedMs > 0 && rawElapsedMs < THREE_HOURS_MS ? rawElapsedMs : 0
      // durationSec は LessonComplete 画面の表示用。最低 60 秒で表示する。
      const durationSec = Math.max(60, Math.floor(validElapsedMs / 1000))
      // XP 加算は LessonStoriesScreen 側で addXp('lesson') が走った後に onComplete が呼ばれる。
      // つまりここでの getXp() は既に加算後。prevXp は XP_REWARDS.lesson を引いて算出する。
      const newXp = getXp()
      const prevXp = Math.max(0, newXp - XP_REWARDS.lesson)
      const prevLevel = getCurrentLevel(prevXp).level
      recordCompletion(`lesson-${lessonId}`)
      // レベル / ランクアップ判定 → sessionStorage に pending イベントを積む
      // (LevelUpModal / RankUpModal / LevelUpToast がそれぞれ消費する)
      recordLessonCompleteEvent(prevXp, newXp)
      const lessonTitle = allLessons[lessonId]?.title
      recordActivity({
        type: 'lesson',
        id: String(lessonId),
        title: lessonTitle,
        meta: { durationSec },
      })
      // 注: 学習時間の累計加算（addStudyTime）と study_sessions への記録は
      // LessonStoriesScreen の useStudyTimer hook が onComplete 後のアンマウント時に
      // まとめて実施する。ここでは加算しない（二重計上を避けるため）。
      // 次のレッスンに備えて ref をリセット
      lessonStartTimeRef.current = 0
      navigate({ type: 'lesson-complete', lessonId, durationSec, prevLevel, returnScreen: screen.returnScreen })
    } else if (tab === 'ranking') {
      navigate({ type: 'fermi-ranking' }, true)
    } else if (tab === 'journal') {
      navigate({ type: 'journal' }, true)
    } else {
      navigate({ type: tab }, true)
    }
  }

  // 認証完了前はロゴ + 「読み込んでいます…」のロード画面を表示
  if (!authReady) {
    return <BootLoadingScreen />
  }

  // Onboarding: show full-screen, no AppShell
  if (screen.type === 'onboarding') {
    return (
      <ErrorBoundary>
        <Suspense fallback={null}>
          <OnboardingScreen
            onComplete={() => {
              localStorage.setItem(ONBOARDED_KEY, '1')
              navigate({ type: 'home' })
              // チュートリアルは右下FABから任意で起動
            }}
            onNavigateToLogin={() => navigate({ type: 'login' })}
          />
        </Suspense>
      </ErrorBoundary>
    )
  }

  // Welcome: 認証直後の歓迎画面（全画面・AppShell なし）
  if (screen.type === 'welcome') {
    return <WelcomeScreen userName={userName} onStart={() => navigate({ type: 'home' })} />
  }

  return (
    <>
    <AppShell
      activeTab={tab}
      onTabChange={handleTabChange}
      userName={userName}
      userLevel={`Lv.${level}`}
      hideTabBar={screen.type === 'lesson' || screen.type === 'lesson-complete'}
    >
      {/* スクリーン遷移fade-in: screen.typeが変わるたびにkeyで再マウント */}
      <ErrorBoundary>
      <Suspense fallback={null}>
      <div key={screen.type} className="tab-fade-in" style={{ display: 'contents' }}>
      {screen.type === 'home' && (
        <HomeScreenV3
          userName={userName}
          isLoggedIn={!!currentUser}
          onOpenLesson={handleOpenLesson}
          onOpenCategory={(cat) => {
            if (cat === 'fermi') navigate({ type: 'daily-fermi' })
            else { setTab('lessons'); navigate({ type: 'roadmap', category: cat }) }
          }}
          onOpenRank={() => navigate({ type: 'rank' })}
          onOpenStats={() => navigate({ type: 'profile' }, true)}
          onOpenAIGen={() => navigate({ type: 'ai-problem-gen' })}
          onOpenRoadmap={() => { navigate({ type: 'lessons' }, true) }}
          onNavigateToDailyFermi={() => navigate({ type: 'daily-fermi' })}
          onOpenPlacementTest={() => navigate({ type: 'placement-test' })}
          onOpenReviewHub={() => navigate({ type: 'review-hub' })}
          onOpenPricing={() => navigate({ type: 'pricing' })}
          onOpenStudyTime={() => navigate({ type: 'study-time' })}
        />
      )}


      {screen.type === 'lessons' && (
        <RoadmapScreenV3
          onOpenLesson={handleOpenLesson}
          onOpenCategory={(cat) => navigate({ type: 'roadmap', category: cat })}
          onOpenPersonalCourse={() => navigate({ type: 'personal-course' })}
          onOpenPlacementTest={() => navigate({ type: 'placement-test' })}
          onOpenReviewHub={() => navigate({ type: 'review-hub' })}
          onOpenCustomCourse={(courseId) => navigate({ type: 'custom-course', courseId })}
          onUpgrade={() => navigate({ type: 'pricing' })}
        />
      )}

      {screen.type === 'roadmap' && (
        <RoadmapScreenV3
          onOpenLesson={handleOpenLesson}
          onOpenCategory={(cat) => navigate({ type: 'roadmap', category: cat })}
          initialCategory={screen.category}
          onBack={handleBack}
        />
      )}

      {screen.type === 'flashcards' && (
        isPaid() ? (
          <FlashcardsScreen
            onBack={handleBack}
            mode={screen.mode}
          />
        ) : (
          <ReviewPreviewScreen
            feature="flashcards"
            onBack={handleBack}
            onUpgrade={() => navigate({ type: 'pricing' })}
          />
        )
      )}
      {screen.type === 'review-hub' && (
        isPaid() ? (
          <ReviewHubScreen
            onBack={handleBack}
            onOpenFlashcardModes={() => navigate({ type: 'review-mode' })}
            onOpenFlashcards={(mode) => navigate({ type: 'flashcards', mode })}
            onOpenWrongAnswers={() => navigate({ type: 'wrong-answers' })}
            onOpenFermiHistory={() => navigate({ type: 'fermi-history' })}
            onOpenSavedItems={() => navigate({ type: 'saved-items' })}
          />
        ) : (
          <ReviewPreviewScreen
            feature="review-hub"
            onBack={handleBack}
            onUpgrade={() => navigate({ type: 'pricing' })}
          />
        )
      )}
      {screen.type === 'review-mode' && (
        isPaid() ? (
          <ReviewModeScreen
            onBack={handleBack}
            onStart={(mode) => navigate({ type: 'flashcards', mode })}
          />
        ) : (
          <ReviewPreviewScreen
            feature="flashcards"
            onBack={handleBack}
            onUpgrade={() => navigate({ type: 'pricing' })}
          />
        )
      )}
      {screen.type === 'fermi-history' && (
        isPaid() ? (
          <FermiHistoryScreen
            onBack={handleBack}
            onRetry={(poolIndex) => {
              try {
                sessionStorage.setItem('fermi-replay-index', String(poolIndex))
                sessionStorage.setItem('fermi-replay-mode', '1')
              } catch { /* */ }
              navigate({ type: 'daily-fermi' })
            }}
          />
        ) : (
          <ReviewPreviewScreen
            feature="fermi-history"
            onBack={handleBack}
            onUpgrade={() => navigate({ type: 'pricing' })}
          />
        )
      )}
      {screen.type === 'wrong-answers' && (
        isPaid() ? (
          <WrongAnswerListScreen
            onBack={handleBack}
            onOpenLesson={(id) => handleOpenLesson(id, { type: 'wrong-answers' })}
          />
        ) : (
          <ReviewPreviewScreen
            feature="wrong-answers"
            onBack={handleBack}
            onUpgrade={() => navigate({ type: 'pricing' })}
          />
        )
      )}
      {screen.type === 'saved-items' && (
        isPaid() ? (
          <SavedItemsScreen
            onBack={handleBack}
            onOpenLesson={(id) => handleOpenLesson(id, { type: 'saved-items' })}
            onOpenCourse={(cat) => navigate({ type: 'roadmap', category: cat })}
            onOpenLessonStep={(lessonId, stepIndex) => {
              lessonStartTimeRef.current = Date.now()
              navigate({ type: 'lesson', lessonId, startStep: stepIndex, returnScreen: { type: 'saved-items' } })
            }}
            onOpenAiProblem={(problemId) => {
              try {
                // 保存した AI 問題を loadAIProblems から探して開く
                import('./aiProblemStore').then(({ loadAIProblems }) => {
                  const found = loadAIProblems().find((p) => String(p.id) === problemId)
                  if (found) navigate({ type: 'ai-problem', problem: found })
                  else navigate({ type: 'ai-problem-gen' })
                })
              } catch {
                navigate({ type: 'ai-problem-gen' })
              }
            }}
            onOpenFermi={() => navigate({ type: 'daily-fermi' })}
          />
        ) : (
          <ReviewPreviewScreen
            feature="saved-items"
            onBack={handleBack}
            onUpgrade={() => navigate({ type: 'pricing' })}
          />
        )
      )}
      {screen.type === 'fermi' && <FermiScreen onBack={handleBack} onReport={(ctx) => navigate({ type: 'report-problem', context: ctx })} />}
      {screen.type === 'daily-fermi' && <DailyFermiScreen onBack={handleBack} onReport={(ctx) => navigate({ type: 'report-problem', context: ctx })} onOpenRanking={() => navigate({ type: 'fermi-ranking' })} onUpgrade={() => navigate({ type: 'pricing' })} />}
      {screen.type === 'daily-problem' && <DailyProblemScreen onBack={handleBack} />}

      {screen.type === 'feedback' && <FeedbackScreen onBack={handleBack} />}
      {screen.type === 'pricing' && <PricingScreen onBack={handleBack} />}
      {screen.type === 'ai-problem-gen' && (
        <AIProblemGenScreen
          onBack={handleBack}
          onPlay={(problem) => navigate({ type: 'ai-problem', problem })}
          onUpgrade={() => navigate({ type: 'pricing' })}
        />
      )}

      {screen.type === 'ai-problem' && (
        <AIProblemScreen
          problem={screen.problem}
          onBack={() => navigate({ type: 'ai-problem-gen' })}
          onReport={(ctx) => navigate({ type: 'report-problem', context: ctx })}
        />
      )}

      {screen.type === 'fermi-ranking' && (
        <FermiRankingScreen onSolveFermi={() => navigate({ type: 'daily-fermi' })} />
      )}

      {screen.type === 'journal' && (
        currentUser ? (
          canUseJournal() ? (
            <JournalScreen
              userId={currentUser.id}
              assistantName={assistantName}
              onUpdateAssistantName={updateAssistantName}
              onOpenLesson={(id) => handleOpenLesson(id, { type: 'journal' })}
              onOpenCourse={(cat) => navigate({ type: 'roadmap', category: cat })}
            />
          ) : (
            <JournalPaywall onUpgrade={() => navigate({ type: 'pricing' })} />
          )
        ) : (
          // 未ログイン: 課金済みは「ログインしてください」を維持。それ以外は
          // 7日間無料トライアルの価値を体験前に判断できるよう、プレビュー → ログイン誘導。
          isPaid() ? (
            <JournalLoginPrompt paid onLogin={() => navigate({ type: 'login' })} />
          ) : (
            <JournalGuestPreview
              assistantName={assistantName}
              onLogin={() => navigate({ type: 'login' })}
            />
          )
        )
      )}

      {screen.type === 'placement-test' && (
        <PlacementTestScreen
          onBack={handleBack}
          onComplete={() => navigate({ type: 'personal-course' })}
        />
      )}

      {screen.type === 'personal-course' && (
        <PersonalCourseScreen
          onStartLesson={handleOpenLesson}
          onExit={() => { navigate({ type: 'home' }, true) }}
          onBack={handleBack}
        />
      )}

      {screen.type === 'custom-course' && (
        <CustomCourseScreen
          courseId={screen.courseId}
          onStartLesson={handleOpenLesson}
          onBack={handleBack}
        />
      )}

      {screen.type === 'profile' && (
        <ProfileScreenV3
          userName={userName}
          isLoggedIn={!!currentUser}
          onOpenProfileEdit={() => navigate({ type: 'profile-edit' })}
          onOpenNotifications={() => navigate({ type: 'notification-settings' })}
          onOpenPreferences={() => navigate({ type: 'preferences' })}
          onOpenFeedback={() => navigate({ type: 'feedback' })}
          onOpenPricing={() => navigate({ type: 'pricing' })}
          onOpenPlacementTest={() => navigate({ type: 'placement-test' })}
          onOpenLesson={(id) => handleOpenLesson(id)}
          onOpenStudyTime={() => navigate({ type: 'study-time' })}
        />
      )}
      {screen.type === 'rank' && <RankScreen onBack={handleBack} />}
      {screen.type === 'streak' && <StreakScreen onBack={handleBack} />}
      {screen.type === 'completed-lessons' && <CompletedLessonsScreen onBack={handleBack} />}
      {screen.type === 'study-time' && <StudyTimeScreen onBack={handleBack} />}
      {screen.type === 'login' && (
        <LoginScreen
          onLoginSuccess={(user) => {
            setCurrentUser(user)
            // 名前が未設定の場合はポップアップ表示
            const hasName = user?.user_metadata?.full_name || user?.user_metadata?.name || getDisplayName()
            if (!hasName) { setShowNamePopup(true) }
            navigate({ type: 'home' })
          }}
        />
      )}
      {screen.type === 'language' && <LanguageScreen onBack={() => navigate({ type: 'profile' })} />}
      {screen.type === 'account-settings' && (
        <AccountSettingsScreen
          onBack={handleBack}
          currentUser={currentUser ? { email: currentUser.email ?? '' } : null}
          onOpenLogin={() => navigate({ type: 'login' })}
          onLogout={() => { setCurrentUser(null); navigate({ type: 'profile' }) }}
        />
      )}
      {screen.type === 'profile-edit' && (
        <ProfileEditScreen
          onBack={handleBack}
          currentUser={currentUser ? { email: currentUser.email ?? '' } : null}
          onOpenLogin={() => navigate({ type: 'login' })}
          onLogout={() => { setCurrentUser(null); navigate({ type: 'profile' }) }}
        />
      )}
      {screen.type === 'notification-settings' && (
        <NotificationSettingsScreen onBack={handleBack} />
      )}
      {screen.type === 'appearance-settings' && (
        <AppearanceSettingsScreen
          onBack={handleBack}
          onUpgrade={() => navigate({ type: 'pricing' })}
        />
      )}
      {screen.type === 'font-size-settings' && (
        <FontSizeSettingsScreen onBack={handleBack} />
      )}
      {screen.type === 'preferences' && (
        <PreferencesScreen onBack={handleBack} />
      )}

      {screen.type === 'report-problem' && (
        <ReportProblemScreen
          context={screen.context}
          onBack={handleBack}
        />
      )}

      {screen.type === 'lesson' && (
        <LessonStoriesScreen
          // lessonId を key にして、コース再生でレッスン間を直接遷移したときも
          // 確実に state を初期化して再 mount させる（index / coursePlayActive 等の reset）。
          key={screen.lessonId}
          lessonId={screen.lessonId}
          startStep={screen.startStep}
          onComplete={handleComplete}
          onClose={handleBack}
          onCoursePlayNext={handleOpenLesson}
        />
      )}

      {screen.type === 'lesson-complete' && (
        <LessonCompleteScreen
          userName={userName}
          lessonTitle={(() => {
            // ロード
            try {
              const lesson = allLessons[screen.lessonId]
              return lesson?.title || t('app.lessonFallback')
            } catch { return t('app.lessonFallback') }
          })()}
          durationSec={screen.durationSec}
          prevLevel={screen.prevLevel}
          autoAdvance={false}
          nextCourse={(() => {
            // コースの最後のレッスンか判定し、次のおすすめコースを返す
            const lessonId = screen.lessonId
            // このレッスンが属するコースを探す
            const belongingCourse = COURSES.find(c => c.lessonIds.includes(lessonId))
            if (!belongingCourse) return undefined
            // コース内の最後のレッスンか確認
            const lastLessonId = belongingCourse.lessonIds[belongingCourse.lessonIds.length - 1]
            if (lessonId !== lastLessonId) return undefined
            // placement 結果から次のコースを取得、なければ COURSES の次インデックス
            let nextCourseId: string | undefined
            const placement = loadPlacementResult()
            if (placement && placement.recommendedCourseIds.length > 0) {
              // 推薦コースのうち現在コース以外の最初の1件
              nextCourseId = placement.recommendedCourseIds.find(id => id !== belongingCourse.id)
            }
            if (!nextCourseId) {
              // ロードマップ上の次コース（同 group 内 index+1、なければ全体 index+1）
              const sameGroup = COURSES.filter(c => c.group === belongingCourse.group)
              const groupIdx = sameGroup.findIndex(c => c.id === belongingCourse.id)
              const nextInGroup = sameGroup[groupIdx + 1]
              if (nextInGroup) {
                nextCourseId = nextInGroup.id
              } else {
                const globalIdx = COURSES.findIndex(c => c.id === belongingCourse.id)
                const nextGlobal = COURSES[globalIdx + 1]
                nextCourseId = nextGlobal?.id
              }
            }
            if (!nextCourseId) return undefined
            const nextCourseData = getCourseById(nextCourseId)
            if (!nextCourseData) return undefined
            return { id: nextCourseData.id, title: nextCourseData.title, category: nextCourseData.category } satisfies NextCourseInfo
          })()}
          onNext={() => {
            // 同カテゴリの次レッスンを探して遷移
            const allFlat = getAllLessonsFlat()
            const currentLesson = allFlat[screen.lessonId]
            if (currentLesson) {
              // 同カテゴリのレッスンをID順に並べて次を探す
              const sameCategory = Object.values(allFlat)
                .filter(l => l.category === currentLesson.category)
                .sort((a, b) => a.id - b.id)
              const idx = sameCategory.findIndex(l => l.id === screen.lessonId)
              const nextLesson = sameCategory[idx + 1]
              if (nextLesson) {
                handleOpenLesson(nextLesson.id, screen.returnScreen)
                return
              }
            }
            // 次レッスンなし → returnScreen があればそこへ、なければ roadmap か home へ
            const destination: Screen = screen.returnScreen
              ?? (currentLesson ? { type: 'roadmap', category: currentLesson.category } : { type: 'home' })
            navigate(destination, true)
          }}
          onStartNextCourse={(_courseId, category) => {
            navigate({ type: 'roadmap', category }, true)
          }}
          onHome={() => navigate({ type: 'home' }, true)}
          onOpenReview={() => navigate({ type: 'review-hub' })}
        />
      )}
      </div>
      </Suspense>
      </ErrorBoundary>
    </AppShell>

    {/* レベルアップ / ランクアップ演出 (Phase 1〜4) */}
    {rankUpEvt && (
      <RankUpModal
        prevTitleKey={rankUpEvt.prevTitleKey}
        newTitleKey={rankUpEvt.newTitleKey}
        newLevel={rankUpEvt.newLevel}
        onClose={() => {
          consumeRankUpEvent()
          setRankUpEvt(null)
          // ランクアップは大体レベルアップも伴うので、続けて Level モーダルを開く
          const lvEvt = peekLevelUpEvent()
          if (lvEvt) setLevelUpEvt(lvEvt)
        }}
      />
    )}
    {!rankUpEvt && levelUpEvt && (
      <LevelUpModal
        prevLevel={levelUpEvt.prevLevel}
        newLevel={levelUpEvt.newLevel}
        onClose={() => {
          consumeLevelUpEvent()
          // モーダル経由で見たので toast キーは消費しておく (ホームで二重表示しない)
          consumeLevelUpToast()
          setLevelUpEvt(null)
        }}
      />
    )}
    {toastEvt && !rankUpEvt && !levelUpEvt && (
      <LevelUpToast
        prevLevel={toastEvt.prevLevel}
        newLevel={toastEvt.newLevel}
        onTap={() => {
          // toast タップで Phase 1 モーダル再表示
          consumeLevelUpToast()
          setToastEvt(null)
          setLevelUpEvt({
            prevLevel: toastEvt.prevLevel,
            newLevel: toastEvt.newLevel,
            newXp: 0,
          })
        }}
        onDismiss={() => {
          consumeLevelUpToast()
          setToastEvt(null)
        }}
      />
    )}

    {/* SCRUM-195: チュートリアルオーバーレイ */}
    {/* チュートリアルFAB（右下固定ボタン） — Daily Fermi 画面でも常駐 */}
    {(screen.type === 'home' || screen.type === 'daily-fermi') && !showTutorial && showFAB && (
      <TutorialFAB
        onClick={() => {
          // ホームから起動した場合は Daily Fermi 画面に遷移してからオーバーレイを開く
          if (screen.type === 'home') navigate({ type: 'daily-fermi' })
          setShowTutorial(true)
        }}
        onHide={() => { tutorial.markFABDismissed(); setShowFAB(false) }}
      />
    )}
    {showTutorial && (
      <TutorialOverlay
        onDone={() => setShowTutorial(false)}
      />
    )}

    {/* 登録後: 表示名入力ポップアップ */}
    {showNamePopup && (
      <div style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.7)', display: 'flex',
        alignItems: 'center', justifyContent: 'center', padding: 24,
      }}>
        <div style={{
          background: 'var(--bg-elevated)', borderRadius: 20, padding: '32px 24px',
          width: '100%', maxWidth: 360, boxShadow: '0 24px 48px rgba(0,0,0,0.4)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--brand)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
            </div>
            <div style={{ fontSize: '1.4667rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{t('welcomePopup.heading')}</div>
          </div>
          <div style={{ fontSize: '1rem', color: 'var(--text-secondary)', marginBottom: 24, lineHeight: 1.6 }}>
            {t('welcomePopup.desc')}
          </div>
          <input
            type="text"
            aria-label={t('welcomePopup.aria')}
            placeholder={t('welcomePopup.placeholder')}
            value={nameInput}
            onChange={e => setNameInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && nameInput.trim()) handleSaveName() }}
            autoFocus
            style={{
              width: '100%', padding: '14px 16px', border: '1px solid var(--border)',
              borderRadius: 10, background: 'var(--bg-card)', color: 'var(--text-primary)',
              fontSize: '1.0667rem', fontFamily: "'Noto Sans JP', sans-serif",
              outline: 'none', boxSizing: 'border-box', marginBottom: 8,
            }}
          />
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 20 }}>{t('welcomePopup.note')}</div>
          <button
            onClick={handleSaveName}
            disabled={nameSaving || !nameInput.trim()}
            style={{
              width: '100%', padding: '15px', background: nameInput.trim() ? 'var(--brand)' : 'var(--bg-card)',
              border: 'none', borderRadius: 12, fontSize: '1.0667rem', fontWeight: 700,
              color: nameInput.trim() ? 'var(--brand-fg)' : 'var(--text-muted)',
              cursor: nameInput.trim() ? 'pointer' : 'not-allowed', marginBottom: 10,
            }}
          >{nameSaving ? t('welcomePopup.saving') : t('welcomePopup.save')}</button>
          <button
            onClick={() => setShowNamePopup(false)}
            style={{ width: '100%', background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.9333rem', cursor: 'pointer', padding: '8px 0' }}
          >{t('welcomePopup.later')}</button>
        </div>
      </div>
    )}
    </>
  )
}

function WelcomeScreen({ userName, onStart }: { userName: string; onStart: () => void }) {
  return (
    <div style={{
      minHeight: '100dvh',
      background: 'var(--hero-grad-dark, linear-gradient(160deg, #0f172a 0%, #1e293b 100%))',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 28px calc(env(safe-area-inset-bottom, 0px) + 40px)',
      fontFamily: "'Noto Sans JP', sans-serif",
      color: 'var(--text-on-hero, #fff)',
      textAlign: 'center',
      gap: 24,
    }}>
      <div style={{
        width: 96, height: 96, borderRadius: '50%',
        background: 'linear-gradient(135deg, var(--brand), var(--brand-light, #8B5CF6))',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--accent-fg, #fff)',
        boxShadow: '0 0 40px rgba(108,142,245,0.55), 0 12px 32px rgba(0,0,0,0.4)',
      }}>
        <SparklesIcon width={44} height={44} aria-hidden="true" />
      </div>
      <div>
        <div style={{ fontSize: '0.9333rem', letterSpacing: '.16em', fontWeight: 700, color: 'var(--text-on-hero-muted)', marginBottom: 10, textTransform: 'uppercase' }}>
          {t('welcome.eyebrow')}
        </div>
        <h1 style={{ fontSize: '1.8667rem', fontWeight: 900, lineHeight: 1.35, margin: 0, letterSpacing: '-0.01em' }}>
          {t('welcome.heading', { name: userName })}
        </h1>
      </div>
      <p style={{ fontSize: '1rem', lineHeight: 1.75, color: 'var(--text-on-hero-muted)', margin: 0, maxWidth: 360 }}>
        {t('welcome.body')}
      </p>
      <button
        type="button"
        onClick={onStart}
        style={{
          marginTop: 12,
          padding: '16px 36px',
          fontSize: '1.0667rem', fontWeight: 800, letterSpacing: '0.02em',
          background: 'var(--brand-grad-h, linear-gradient(135deg, #6C8EF5, #8B5CF6))',
          color: 'var(--accent-fg, #fff)',
          border: 'none',
          borderRadius: 999,
          cursor: 'pointer',
          boxShadow: '0 8px 24px rgba(108,142,245,0.45)',
          minWidth: 240,
          minHeight: 52,
        }}
      >
        {t('welcome.startCta')}
      </button>
    </div>
  )
}

function JournalPaywall({ onUpgrade }: { onUpgrade: () => void }) {
  const daysLeft = getJournalTrialDaysLeft()
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>
      <div className="journal-hero">
        <div>
          <div style={{ fontSize: '1.4667rem', fontWeight: 900, letterSpacing: '-0.02em' }}>{t('journal.title')}</div>
          <div style={{ fontSize: '0.8667rem', color: 'var(--text-on-hero-muted)', marginTop: 4 }}>{t('journal.subtitle')}</div>
        </div>
      </div>
      <div style={{ flex: 1, padding: '32px 20px 120px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', gap: 20 }}>
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: 16,
          padding: 24,
          maxWidth: 360,
          width: '100%',
          textAlign: 'center',
          boxShadow: 'var(--shadow-v3-card-inset)',
          border: '1px solid rgba(255,255,255,.06)',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            alignSelf: 'center',
            width: 56, height: 56, borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--brand), var(--brand-light, #8B5CF6))',
            color: 'var(--accent-fg, #fff)',
            marginBottom: 4,
          }}>
            <SparklesIcon width={28} height={28} aria-hidden="true" />
          </div>
          <div style={{ fontSize: '1.0667rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            {daysLeft > 0 ? t('journal.trialActiveTitle', { days: String(daysLeft) }) : t('journal.paywallTitle')}
          </div>
          <div style={{ fontSize: '0.8667rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            {daysLeft > 0 ? t('journal.trialActiveDesc') : t('journal.paywallDesc')}
          </div>
          <button
            type="button"
            onClick={onUpgrade}
            style={{
              marginTop: 8,
              padding: '14px 24px',
              background: 'var(--accent-btn)',
              color: 'var(--accent-btn-fg, #fff)',
              border: 'none',
              borderRadius: 12,
              font: 'inherit',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: 'pointer',
              minHeight: 48,
            }}
          >
            {t('journal.viewPlansCta')}
          </button>
        </div>
      </div>
    </div>
  )
}

function JournalLoginPrompt({ paid, onLogin }: { paid: boolean; onLogin: () => void }) {
  // 課金有効・未ログインの場合は「有料なのに使えない」と誤解されないよう、
  // 支払いが有効である旨を区別して伝える。
  const title = paid ? t('journal.paidLoginRequiredTitle') : t('journal.loginRequiredTitle')
  const desc = paid ? t('journal.paidLoginRequiredDesc') : t('journal.loginRequiredDesc')
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>
      <div className="journal-hero">
        <div>
          <div style={{ fontSize: '1.4667rem', fontWeight: 900, letterSpacing: '-0.02em' }}>{t('journal.title')}</div>
          <div style={{ fontSize: '0.8667rem', color: 'var(--text-on-hero-muted)', marginTop: 4 }}>{t('journal.subtitle')}</div>
        </div>
      </div>
      <div style={{ flex: 1, padding: '32px 20px 120px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', gap: 20 }}>
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: 16,
          padding: 24,
          maxWidth: 360,
          width: '100%',
          textAlign: 'center',
          boxShadow: 'var(--shadow-v3-card-inset)',
          border: '1px solid rgba(255,255,255,.06)',
          display: 'flex',
          flexDirection: 'column',
          gap: 12,
        }}>
          <div style={{ fontSize: '1.0667rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {title}
          </div>
          <div style={{ fontSize: '0.8667rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            {desc}
          </div>
          <button
            type="button"
            onClick={onLogin}
            style={{
              marginTop: 8,
              padding: '14px 24px',
              background: 'var(--accent-btn)',
              color: 'var(--accent-btn-fg, #fff)',
              border: 'none',
              borderRadius: 12,
              font: 'inherit',
              fontSize: '1rem',
              fontWeight: 700,
              cursor: 'pointer',
              minHeight: 48,
            }}
          >
            {t('profile.loginCta')}
          </button>
        </div>
      </div>
    </div>
  )
}

function AppV3WithProviders() {
  return (
    <SnackbarProvider>
      <AppV3 />
    </SnackbarProvider>
  )
}

export default AppV3WithProviders
