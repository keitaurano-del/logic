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
    'profile.tokushoho': '📜 特定商取引法に基づく表記',
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

    // Categories
    'category.logical': 'ロジカルシンキング',
    'category.boki3': '簿記3級',
    'category.boki2c': '簿記2級 商業',
    'category.boki2i': '簿記2級 工業',
    'category.boki3practice': '簿記3級 実践',
    'category.exam': '模擬試験',
    'category.pm': 'プロジェクトマネジメント',

    // Lesson UI
    'lesson.completedH1': 'レッスン完了！',
    'lesson.completedScoreLine': '{correct} / {total} 問正解',
    'lesson.completedPerfect': 'パーフェクト！素晴らしい理解力です。',
    'lesson.completedGood': 'よくできました！復習して完璧にしましょう。',
    'lesson.completedRetry': 'もう一度復習してみましょう！',
    'lesson.backHome': 'ホームに戻る',
    'lesson.next': '次へ',
    'lesson.viewResult': '結果を見る',
    'lesson.correctMark': '正解！',
    'lesson.wrongMark': '不正解...',
    'lesson.report': '🚩 この問題を報告',

    // Roleplay
    'roleplay.title': 'AIロールプレイ',
    'roleplay.heading': '論理思考を実務で使う練習',
    'roleplay.lead': 'ビジネスシーンでMECE・Why So/So What・ピラミッド原則・ロジックツリーを使い、AI相手に練習しよう。',
    'roleplay.quotaPrefix': '無料: 今月の残り',
    'roleplay.partnerLabel': '相手:',
    'roleplay.notFound': 'シチュエーション未検出',
    'roleplay.finish': '終了',
    'roleplay.turnIndicator': 'ターン {n}/{total}',
    'roleplay.thinking': '考え中...',
    'roleplay.you': 'あなた',
    'roleplay.choicesLabel': 'あなたの返答を選んでください',
    'roleplay.commError': '(通信エラーが発生しました)',
    'roleplay.resultTitle': '結果',
    'roleplay.scoring': '採点中...',
    'roleplay.scoreH3': '採点',
    'roleplay.overallH4': '総評',
    'roleplay.summaryH3': '振り返り',
    'roleplay.goodPointsH4': '👍 良かった点',
    'roleplay.improvementsH4': '💡 改善ポイント',
    'roleplay.backToList': 'シチュエーション一覧へ',

    // Coffee Break
    'coffeebreak.title': 'コーヒーブレイク',
    'coffeebreak.heading': '日常で使える論理思考',
    'coffeebreak.lead': 'パートナー・買い物・旅行・友達との会話。仕事じゃない場面で論理思考がどう効くか、3 分のクイズで体験。',

    // Fermi estimation
    'fermi.title': 'フェルミ推定',
    'fermi.context': 'フェルミ推定は、MECE やロジックツリーで学んだ分解思考を実際に使う練習です。正確な答えより、',
    'fermi.contextStrong': 'どう考えたかのプロセス',
    'fermi.contextEnd': 'が大切です。',
    'fermi.questionTag': 'QUESTION',
    'fermi.hint': '💡 まずは自分なりに分解してみましょう。提出後に概算解と計算ロジックも提示します。',
    'fermi.thinkButton': '考えてみる',
    'fermi.placeholder': '例:\n人口 × 1 世帯あたり人数 × コンビニ利用世帯率 × 1 日の来客数...\n\n思ったように分解してみてください。式でも箇条書きでも OK。',
    'fermi.submitButton': 'AI にフィードバックをもらう',
    'fermi.submitting': 'フィードバックを生成中...',
    'fermi.backButton': '戻る',
    'fermi.recapLabel': 'あなたの分解',
    'fermi.upsellH': 'もっと練習したい?',
    'fermi.upsellBody': 'プレミアムなら毎日新しい AI 生成問題でこの体験を続けられます (¥500/月)。',
    'fermi.upsellBtn': 'プレミアムを試す (7 日間無料)',
    'fermi.nextAi': '次の AI 生成問題へ',
    'fermi.generating': '生成中...',
    'fermi.tryAnother': '別の問題を試す',
    'fermi.relatedLabel': '関連レッスン',
    'fermi.relatedDecompose': '分解をもっと磨きたい → ロジックツリー(レッスン一覧から)',
    'fermi.relatedMece': '網羅性を確認したい → MECE(レッスン一覧から)',
    'fermi.errorFeedback': 'フィードバックの取得に失敗しました。もう一度試してください。',
    'fermi.errorQuestion': 'AI 問題の生成に失敗しました',

    // Theme settings
    'theme.title': 'テーマ設定',
    'theme.modeSection': '背景モード',
    'theme.customSection': 'カスタムカラー',
    'theme.accentSection': 'アクセントカラー',
    'theme.customHint': '入力した色がアクセントカラーとして即座に反映されます',
    'theme.contrastH': 'ボタン文字の読みやすさ',
    'theme.contrastDetail': '白文字 × この色 = コントラスト比 {ratio}:1 ({label})',
    'theme.contrastWarn': '⚠ この色は背景に白文字を重ねると読みにくいため、ボタン上の文字色は自動的に黒に切り替わります(WCAG AA 基準維持)',
    'theme.accentContrastH': 'ℹ アクセントカラーの読みやすさ',
    'theme.accentContrastDetail': '白文字 × {name} = {ratio}:1 ({label})',
    'theme.accentContrastNote': 'ボタン上の文字は自動的に読みやすい色に調整されます(WCAG AA 基準)',
    'theme.customDisabled': 'カスタムモード使用中はアクセントカラーは無効です',
    'theme.currentAccent': '現在: {name}',
    'theme.upgrade': 'プレミアムにアップグレード →',
    // Mode names + descriptions
    'theme.mode.light.name': 'ライト',
    'theme.mode.light.desc': '明るく落ち着いたクリーム系',
    'theme.mode.dark.name': 'ダーク',
    'theme.mode.dark.desc': '目に優しい暗色背景',
    'theme.mode.enterprise.name': 'エンタープライズ',
    'theme.mode.enterprise.desc': 'ネイビー×シルバーの信頼感',
    'theme.mode.startup.name': 'スタートアップ',
    'theme.mode.startup.desc': 'ビビッドなグリーン×オレンジ',
    'theme.mode.custom.name': 'カスタムカラー',
    'theme.mode.custom.desc': '好きな色を HEX で指定',
    // Accent names
    'theme.accent.orange': 'オレンジ',
    'theme.accent.blue': 'インディゴ',
    'theme.accent.purple': 'パープル',
    'theme.accent.green': 'グリーン',
    'theme.accent.pink': 'ピンク',
    'theme.accent.cyan': 'シアン',

    // Ranking
    'ranking.title': '偏差値ランキング',
    'ranking.ctaTitle': 'まだプレイスメントテストを受けていません',
    'ranking.ctaDesc': 'テストを受けると、偏差値ランキングに参加できます。',
    'ranking.ctaButton': 'テストを受ける',
    'ranking.loading': '読み込み中...',
    'ranking.error': 'ランキングの取得に失敗しました',
    'ranking.empty': 'まだ参加者がいません。',
    'ranking.participants': '参加者',
    'ranking.yourRank': 'あなたの順位',
    'ranking.deviation': '偏差値',
    'ranking.unitPeople': '人',
    'ranking.unitRank': '位',
    'ranking.topPercent': '上位 {pct}%',
    'ranking.topListH': 'トップランキング',
    'ranking.youBadge': 'YOU',
    'ranking.deviationLabel': '偏差値',
    'ranking.retake': 'もう一度テストを受ける',
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
    'profile.tokushoho': '📜 Specified Commercial Transaction Act (JP)',
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

    // Categories
    'category.logical': 'Logical Thinking',
    'category.boki3': 'Bookkeeping 3 (JP)',
    'category.boki2c': 'Bookkeeping 2 Commercial (JP)',
    'category.boki2i': 'Bookkeeping 2 Industrial (JP)',
    'category.boki3practice': 'Bookkeeping 3 Practice (JP)',
    'category.exam': 'Mock Exam (JP)',
    'category.pm': 'Project Management',

    // Lesson UI
    'lesson.completedH1': 'Lesson complete!',
    'lesson.completedScoreLine': '{correct} of {total} correct',
    'lesson.completedPerfect': 'Perfect! Excellent understanding.',
    'lesson.completedGood': 'Well done! Review to lock it in.',
    'lesson.completedRetry': 'Try this lesson again!',
    'lesson.backHome': 'Back to home',
    'lesson.next': 'Next',
    'lesson.viewResult': 'See results',
    'lesson.correctMark': 'Correct!',
    'lesson.wrongMark': 'Incorrect...',
    'lesson.report': '🚩 Report this question',

    // Roleplay
    'roleplay.title': 'AI Roleplay',
    'roleplay.heading': 'Practice logical thinking in real scenarios',
    'roleplay.lead': 'Use MECE, So What/Why So, Pyramid Principle, and Logic Trees in business situations against an AI counterpart.',
    'roleplay.quotaPrefix': 'Free this month:',
    'roleplay.partnerLabel': 'Counterpart:',
    'roleplay.notFound': 'Scenario not found',
    'roleplay.finish': 'End',
    'roleplay.turnIndicator': 'Turn {n} of {total}',
    'roleplay.thinking': 'Thinking...',
    'roleplay.you': 'You',
    'roleplay.choicesLabel': 'Choose your response',
    'roleplay.commError': '(A network error occurred)',
    'roleplay.resultTitle': 'Results',
    'roleplay.scoring': 'Scoring...',
    'roleplay.scoreH3': 'Score',
    'roleplay.overallH4': 'Overall feedback',
    'roleplay.summaryH3': 'Summary',
    'roleplay.goodPointsH4': '👍 Strong points',
    'roleplay.improvementsH4': '💡 Areas to improve',
    'roleplay.backToList': 'Back to scenarios',

    // Coffee Break
    'coffeebreak.title': 'Coffee Break',
    'coffeebreak.heading': 'Logical thinking for everyday life',
    'coffeebreak.lead': 'Partners, shopping, travel, conversations with friends — try a 3-minute quiz to see how logic helps outside of work.',

    // Fermi estimation
    'fermi.title': 'Fermi Estimation',
    'fermi.context': 'Fermi estimation puts the decomposition skills from MECE and logic trees to real use. ',
    'fermi.contextStrong': 'How you broke it down',
    'fermi.contextEnd': ' matters more than the exact answer.',
    'fermi.questionTag': 'QUESTION',
    'fermi.hint': '💡 Decompose the problem in your own way. After you submit, you\'ll see the worked answer and logic.',
    'fermi.thinkButton': 'Start thinking',
    'fermi.placeholder': 'Example:\nUS population × households per capita × Starbucks visit rate × daily customers...\n\nDecompose however you like — formulas or bullet points are both fine.',
    'fermi.submitButton': 'Get AI feedback',
    'fermi.submitting': 'Generating feedback...',
    'fermi.backButton': 'Back',
    'fermi.recapLabel': 'Your decomposition',
    'fermi.upsellH': 'Want more practice?',
    'fermi.upsellBody': 'Premium gives you fresh AI-generated problems every day ($5/month).',
    'fermi.upsellBtn': 'Try Premium (7 days free)',
    'fermi.nextAi': 'Next AI-generated problem',
    'fermi.generating': 'Generating...',
    'fermi.tryAnother': 'Try another problem',
    'fermi.relatedLabel': 'Related lessons',
    'fermi.relatedDecompose': 'Sharpen decomposition → Logic Tree (in Lessons)',
    'fermi.relatedMece': 'Check exhaustiveness → MECE (in Lessons)',
    'fermi.errorFeedback': 'Failed to fetch feedback. Please try again.',
    'fermi.errorQuestion': 'Failed to generate an AI problem',

    // Theme settings
    'theme.title': 'Theme',
    'theme.modeSection': 'Background mode',
    'theme.customSection': 'Custom color',
    'theme.accentSection': 'Accent color',
    'theme.customHint': 'The color is applied immediately as your accent',
    'theme.contrastH': 'Button text readability',
    'theme.contrastDetail': 'White text × this color = contrast {ratio}:1 ({label})',
    'theme.contrastWarn': '⚠ White text on this color is hard to read, so button labels are automatically switched to black to keep WCAG AA compliance.',
    'theme.accentContrastH': 'ℹ Accent color readability',
    'theme.accentContrastDetail': 'White text × {name} = {ratio}:1 ({label})',
    'theme.accentContrastNote': 'Button text is automatically adjusted for readability (WCAG AA).',
    'theme.customDisabled': 'Accent color is disabled while in custom mode',
    'theme.currentAccent': 'Current: {name}',
    'theme.upgrade': 'Upgrade to Premium →',
    // Mode names + descriptions
    'theme.mode.light.name': 'Light',
    'theme.mode.light.desc': 'Bright, calm cream tones',
    'theme.mode.dark.name': 'Dark',
    'theme.mode.dark.desc': 'Easy on the eyes',
    'theme.mode.enterprise.name': 'Enterprise',
    'theme.mode.enterprise.desc': 'Navy and silver — confident',
    'theme.mode.startup.name': 'Startup',
    'theme.mode.startup.desc': 'Vivid green and orange',
    'theme.mode.custom.name': 'Custom color',
    'theme.mode.custom.desc': 'Pick any color via HEX',
    // Accent names
    'theme.accent.orange': 'Orange',
    'theme.accent.blue': 'Indigo',
    'theme.accent.purple': 'Purple',
    'theme.accent.green': 'Green',
    'theme.accent.pink': 'Pink',
    'theme.accent.cyan': 'Cyan',

    // Ranking
    'ranking.title': 'Score Ranking',
    'ranking.ctaTitle': 'You haven\'t taken the placement test yet',
    'ranking.ctaDesc': 'Take the test to join the score ranking.',
    'ranking.ctaButton': 'Take the test',
    'ranking.loading': 'Loading...',
    'ranking.error': 'Failed to load the ranking',
    'ranking.empty': 'No participants yet.',
    'ranking.participants': 'Participants',
    'ranking.yourRank': 'Your rank',
    'ranking.deviation': 'Score',
    'ranking.unitPeople': '',
    'ranking.unitRank': '',
    'ranking.topPercent': 'Top {pct}%',
    'ranking.topListH': 'Top ranking',
    'ranking.youBadge': 'YOU',
    'ranking.deviationLabel': 'Score',
    'ranking.retake': 'Retake the test',
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

/**
 * Wrap a fetch body to include the active locale.
 * Server endpoints use this to switch system prompts to the user's language.
 */
export function localeBody<T extends Record<string, unknown>>(body: T): T & { locale: Locale } {
  return { ...body, locale: currentLocale }
}
