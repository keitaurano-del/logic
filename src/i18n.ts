// Lightweight i18n: flat key-value lookup with locale auto-detection.
// Switching locale persists to localStorage and reloads the page (simplest reactivity).

export type Locale = 'ja' | 'en'

const STORAGE_KEY = 'logic-locale'

function detectLocale(): Locale {
  try {
    const saved = localStorage.getItem(STORAGE_KEY) as Locale | null
    if (saved === 'ja' || saved === 'en') return saved
  } catch { /* */ }
  // Browser language detection
  const lang = (typeof navigator !== 'undefined' && navigator.language) || 'en'
  return lang.toLowerCase().startsWith('ja') ? 'ja' : 'en'
}

let currentLocale: Locale = detectLocale()

export function getLocale(): Locale {
  return currentLocale
}

export function setLocale(loc: Locale): void {
  try {
    localStorage.setItem(STORAGE_KEY, loc)
  } catch { /* */ }
  currentLocale = loc
  // Nuclear but reliable: full reload to re-render every component with new strings
  window.location.reload()
}

// ============================================================
// Translation strings
// ============================================================
type Strings = Record<string, string>

const STRINGS: Record<Locale, Strings> = {
  ja: {
    // Common
    'common.back': '戻る',
    'common.next': '次へ',
    'common.skip': 'スキップ',
    'common.start': 'はじめる',
    'common.complete': '完了',
    'common.cancel': 'キャンセル',
    'common.confirm': '確認',
    'common.delete': '削除',
    'common.save': '保存',
    'common.loading': '読み込み中...',
    'common.error': 'エラーが発生しました',
    'common.retry': 'もう一度試す',

    // Navigation
    'nav.home': 'ホーム',
    'nav.lessons': 'レッスン',
    'nav.profile': 'プロフィール',

    // Home
    'home.welcomeTitle': 'Logic へようこそ',
    'home.welcomeDesc': 'ロジカルシンキング・簿記・PM を 3 分から学べます。今日の 1 問から始めよう →',
    'home.welcomeBadge': 'START',
    'home.continueTitle': '続きから',
    'home.placementTitle': '偏差値 {score} のおすすめ',
    'home.todayProblem': '今日の1問',
    'home.todayProblemDone': '✓ 完了',
    'home.todayProblemNew': 'NEW',
    'home.todayProblemLoading': '準備中...',
    'home.streakDays': '日連続学習中',
    'home.streakStart': '今日から始めよう',
    'home.completedLessons': '完了レッスン',
    'home.totalStudyTime': '総学習時間',
    'home.flashcardTitle': '今日のおすすめ',
    'home.flashcardEmpty': 'レッスンを完了するとカードが作られます',
    'home.flashcardDue': '{count}枚の復習待ち',
    'home.flashcardDone': '今日の復習完了!',
    'home.aiGenTitle': 'AIに問題を作ってもらう',
    'home.aiGenDesc': 'あなた専用の練習問題を生成',
    'home.roleplayTitle': 'AIロールプレイで練習',
    'home.roleplayDesc': '論理思考フレームワークを実務シーンで',
    'home.coffeebreakTitle': 'コーヒーブレイク',
    'home.coffeebreakDesc': '3分で読める日常シーンの小話',
    'home.fermiTitle': 'フェルミ推定',
    'home.fermiDesc': '分解思考を実践する練習',
    'home.badgeNew': 'NEW',
    'home.badgeRec': 'REC',

    // Onboarding
    'onboarding.slide1.title': 'ロジカルシンキングを毎日 3 分で',
    'onboarding.slide1.body': 'MECE・ロジックツリー・演繹/帰納・形式論理。ビジネスで使える論理思考のフレームワークを、短いレッスンで体系的に学べます。',
    'onboarding.slide2.title': 'AI が「あなた専用」で練習相手に',
    'onboarding.slide2.body': 'ロールプレイ、フェルミ推定、AI 問題生成、コーヒーブレイクの日常シーン。座学だけでなく、実践しながら身につけられます。',
    'onboarding.slide3.title': 'まずは偏差値テストで現在地を知る',
    'onboarding.slide3.body': '8 問のプレイスメントテストであなたの論理思考レベルを判定し、あなたに合った学習ルートをおすすめします。3 分で終わります。',
    'onboarding.toPlacement': 'プレイスメントテストへ',

    // Placement test
    'placement.title': 'プレイスメントテスト',
    'placement.lead': 'あなたの論理思考力を 8 問でチェックします。所要時間は約 3 分。\n結果から偏差値を出し、レベルに合ったおすすめレッスンを表示します。',
    'placement.questionCount': '{count} 問・約 3 分',
    'placement.topicLine': 'MECE / 演繹 / 帰納 / 形式論理',
    'placement.nicknameLabel': 'ランキング表示名',
    'placement.nicknamePlaceholder': 'ニックネーム',
    'placement.startButton': 'はじめる',
    'placement.skipButton': 'あとでやる',
    'placement.questionPrefix': 'Q{n} / {total}',
    'placement.correct': '✓ 正解',
    'placement.wrong': '✗ 不正解',
    'placement.nextQuestion': '次の問題へ',
    'placement.viewResult': '結果を見る',
    'placement.resultTitle': 'あなたの偏差値',
    'placement.correctCount': '{correct} / {total} 問正解',
    'placement.recommended': 'あなたへのおすすめレッスン',
    'placement.recommendedDesc': 'レベルに合わせて、この順番で学ぶのがおすすめです。',
    'placement.beginButton': '始める',

    // Profile
    'profile.title': 'プロフィール',
    'profile.deviation': '📊 偏差値を見る',
    'profile.theme': '🎨 テーマ設定',
    'profile.ranking': '🏆 偏差値ランキング',
    'profile.privacy': '📄 プライバシーポリシー',
    'profile.terms': '📑 利用規約',
    'profile.deleteData': '🗑 全データを削除',
    'profile.deleteConfirm': '全ての学習データ・偏差値・ニックネーム・テーマ設定を削除します。\n\nこの操作は取り消せません。本当に削除しますか?',
    'profile.deleteSuccess': '全データを削除しました。アプリを再読み込みします。',
    'profile.feedback': '💡 ご要望・フィードバック',
    'profile.planLabel': 'プラン',
    'profile.planBeta': 'ベータ版 — 全機能無料',
    'profile.reminder': '🔔 今日の1問リマインダー',
    'profile.reminderTime': '毎日の通知時刻',
    'profile.reminderWebNote': '(アプリ版でのみ通知が届きます)',
    'profile.reminderNoPermission': '通知の許可が必要です。設定アプリから Logic の通知を許可してください。',
    'profile.languageTitle': '言語',
    'profile.languageJa': '日本語',
    'profile.languageEn': 'English',

    // Lesson
    'lesson.startQuiz': 'クイズに答える',
    'lesson.next': '次へ',
    'lesson.previous': '前へ',
    'lesson.checkAnswer': '回答する',
    'lesson.correct': '正解!',
    'lesson.wrong': '不正解',
    'lesson.completedTitle': 'レッスン完了!',
    'lesson.completedScore': '{correct}/{total} 問正解',
    'lesson.continueButton': 'ホームに戻る',

    // Categories
    'category.logical': 'ロジカルシンキング',
    'category.boki3': '簿記3級',
    'category.boki2c': '簿記2級 商業',
    'category.boki2i': '簿記2級 工業',
    'category.boki3practice': '簿記3級 実践',
    'category.exam': '模擬試験',
    'category.pm': 'プロジェクトマネジメント',
  },

  en: {
    // Common
    'common.back': 'Back',
    'common.next': 'Next',
    'common.skip': 'Skip',
    'common.start': 'Start',
    'common.complete': 'Done',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.delete': 'Delete',
    'common.save': 'Save',
    'common.loading': 'Loading...',
    'common.error': 'Something went wrong',
    'common.retry': 'Try again',

    // Navigation
    'nav.home': 'Home',
    'nav.lessons': 'Lessons',
    'nav.profile': 'Profile',

    // Home
    'home.welcomeTitle': 'Welcome to Logic',
    'home.welcomeDesc': 'Master logical thinking in 3-minute lessons. Start with today\'s problem →',
    'home.welcomeBadge': 'START',
    'home.continueTitle': 'Continue learning',
    'home.placementTitle': 'For your level ({score})',
    'home.todayProblem': 'Today\'s problem',
    'home.todayProblemDone': '✓ Done',
    'home.todayProblemNew': 'NEW',
    'home.todayProblemLoading': 'Loading...',
    'home.streakDays': 'day streak',
    'home.streakStart': 'Start today',
    'home.completedLessons': 'Completed',
    'home.totalStudyTime': 'Study time',
    'home.flashcardTitle': 'Recommended for today',
    'home.flashcardEmpty': 'Complete a lesson to create flashcards',
    'home.flashcardDue': '{count} cards to review',
    'home.flashcardDone': 'All caught up for today!',
    'home.aiGenTitle': 'AI-generated problems',
    'home.aiGenDesc': 'Practice problems tailored to you',
    'home.roleplayTitle': 'AI roleplay practice',
    'home.roleplayDesc': 'Use logic frameworks in real workplace scenarios',
    'home.coffeebreakTitle': 'Coffee Break',
    'home.coffeebreakDesc': '3-minute everyday-life logic stories',
    'home.fermiTitle': 'Fermi estimation',
    'home.fermiDesc': 'Practice decomposition thinking',
    'home.badgeNew': 'NEW',
    'home.badgeRec': 'REC',

    // Onboarding
    'onboarding.slide1.title': 'Logical thinking, 3 minutes a day',
    'onboarding.slide1.body': 'MECE, logic trees, deduction & induction, formal logic — the frameworks consultants and analysts use, learned in short, focused lessons.',
    'onboarding.slide2.title': 'AI as your personal sparring partner',
    'onboarding.slide2.body': 'Roleplay scenarios, Fermi estimation, AI problem generation, coffee-break stories. Learn by doing, not just reading.',
    'onboarding.slide3.title': 'Start with a placement test',
    'onboarding.slide3.body': '8 questions in about 3 minutes. We\'ll find your current level and recommend the right learning path for you.',
    'onboarding.toPlacement': 'Take placement test',

    // Placement test
    'placement.title': 'Placement Test',
    'placement.lead': 'Test your logical thinking with 8 questions in about 3 minutes.\nWe\'ll calculate your score and recommend lessons that match your level.',
    'placement.questionCount': '{count} questions · ~3 min',
    'placement.topicLine': 'MECE / Deduction / Induction / Formal logic',
    'placement.nicknameLabel': 'Ranking display name',
    'placement.nicknamePlaceholder': 'Nickname',
    'placement.startButton': 'Start',
    'placement.skipButton': 'Skip for now',
    'placement.questionPrefix': 'Q{n} of {total}',
    'placement.correct': '✓ Correct',
    'placement.wrong': '✗ Incorrect',
    'placement.nextQuestion': 'Next question',
    'placement.viewResult': 'See results',
    'placement.resultTitle': 'Your score',
    'placement.correctCount': '{correct} of {total} correct',
    'placement.recommended': 'Recommended lessons for you',
    'placement.recommendedDesc': 'Learn in this order, matched to your level.',
    'placement.beginButton': 'Begin',

    // Profile
    'profile.title': 'Profile',
    'profile.deviation': '📊 Your stats',
    'profile.theme': '🎨 Theme',
    'profile.ranking': '🏆 Ranking',
    'profile.privacy': '📄 Privacy Policy',
    'profile.terms': '📑 Terms of Service',
    'profile.deleteData': '🗑 Delete all data',
    'profile.deleteConfirm': 'This will delete all your learning data, score, nickname, and theme settings.\n\nThis cannot be undone. Are you sure?',
    'profile.deleteSuccess': 'All data deleted. Reloading the app.',
    'profile.feedback': '💡 Send feedback',
    'profile.planLabel': 'Plan',
    'profile.planBeta': 'Beta — all features free',
    'profile.reminder': '🔔 Daily problem reminder',
    'profile.reminderTime': 'Notification time',
    'profile.reminderWebNote': '(notifications work in the app version only)',
    'profile.reminderNoPermission': 'Notification permission is required. Please enable notifications for Logic in your settings.',
    'profile.languageTitle': 'Language',
    'profile.languageJa': '日本語',
    'profile.languageEn': 'English',

    // Lesson
    'lesson.startQuiz': 'Start quiz',
    'lesson.next': 'Next',
    'lesson.previous': 'Previous',
    'lesson.checkAnswer': 'Submit',
    'lesson.correct': 'Correct!',
    'lesson.wrong': 'Incorrect',
    'lesson.completedTitle': 'Lesson complete!',
    'lesson.completedScore': '{correct} of {total} correct',
    'lesson.continueButton': 'Back to home',

    // Categories
    'category.logical': 'Logical Thinking',
    'category.boki3': 'Bookkeeping 3 (JP)',
    'category.boki2c': 'Bookkeeping 2 Commercial (JP)',
    'category.boki2i': 'Bookkeeping 2 Industrial (JP)',
    'category.boki3practice': 'Bookkeeping 3 Practice (JP)',
    'category.exam': 'Mock Exam (JP)',
    'category.pm': 'Project Management',
  },
}

/**
 * Translate a key with optional {placeholder} substitutions.
 * Falls back to English, then to the key itself if not found.
 */
export function t(key: string, params?: Record<string, string | number>): string {
  let value = STRINGS[currentLocale]?.[key] ?? STRINGS.en[key] ?? key
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      value = value.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v))
    }
  }
  return value
}

export function isJapaneseLocale(): boolean {
  return currentLocale === 'ja'
}
