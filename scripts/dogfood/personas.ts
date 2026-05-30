/**
 * Dogfooding Phase 2a — 20 ペルソナのデータ定義（seed の唯一の source of truth）
 *
 * 出典: docs/dogfooding/personas.md（content-creator 作成・20体 / 代表6体）。
 * ここでは seed.ts が DB 投入に使う構造化データだけを持つ。文章のペルソナ像は md 側を正とする。
 *
 * タグ付け方針（Keita 承認済み・2026-05-30）:
 *   - auth user_metadata = { is_test:true, persona:"pNN", batch:"dogfood-20260530" }
 *   - email = dogfood+pNN@logic-test.local
 *   - feedback 本文 = "[DOGFOOD:pNN] ..." prefix（feedback テーブルに user_id 列が無いため本文で識別）
 */

export const DOGFOOD_BATCH = 'dogfood-20260530'
export const EMAIL_DOMAIN = 'logic-test.local'
export const EMAIL_PREFIX = 'dogfood+'

export type Plan = 'free' | 'paid_monthly' | 'paid_yearly' | 'trial'
export type Locale = 'ja' | 'en'

export interface Persona {
  id: string // p01..p20
  nickname: string
  birthYear: number
  gender: 'male' | 'female'
  /** profiles.occupation に入れる職業ラベル（オンボーディング 9 種に対応） */
  occupation: string
  locale: Locale
  plan: Plan
  /** 習熟度。投入する progress / fermi の量や placement deviation に反映 */
  level: 'beginner' | 'intermediate' | 'advanced'
  /** 何レッスン完了させるか（completed_lessons / user_progress に反映） */
  completedLessons: number
  /** fermi_answers を何件投入するか */
  fermiCount: number
  /** 連続学習日数（study_dates をこの日数ぶん埋める） */
  streakDays: number
  /** placement の偏差値（user_placement.deviation）。null なら placement 未受診 */
  deviation: number | null
  /** アプリ内フィードバック1件（[DOGFOOD:pNN] prefix を seed 側で付与） */
  feedback: { category: string; message: string }
}

/**
 * lesson_id は静的レッスンの実在 ID に依存しないダミー連番で投入する。
 * progress / user_progress は「完了数」を見せるのが目的で、特定レッスンの
 * 正当性検証はドッグフーディングの実走行（手動）側でやるため、ここでは
 * 1..N の連番で十分（cleanup で is_test ユーザーごと消えるので汚染しない）。
 */

export const PERSONAS: Persona[] = [
  {
    id: 'p01', nickname: '佐藤ハル', birthYear: 2003, gender: 'male',
    occupation: '学生', locale: 'ja', plan: 'free', level: 'beginner',
    completedLessons: 6, fermiCount: 3, streakDays: 4, deviation: 48,
    feedback: { category: 'UI改善', message: '就活目的だとSPI・玉手箱・ケース面接コースが別々の場所にあって横断しづらいです。' },
  },
  {
    id: 'p02', nickname: '田中ミオ', birthYear: 2002, gender: 'female',
    occupation: 'その他', locale: 'ja', plan: 'trial', level: 'beginner',
    completedLessons: 4, fermiCount: 2, streakDays: 3, deviation: 46,
    feedback: { category: '課金導線', message: 'ジャーナルの7日トライアルの残り日数や終了予告が分かりづらく、不意に終わりそうで不安です。' },
  },
  {
    id: 'p03', nickname: '鈴木ケンタ', birthYear: 1998, gender: 'male',
    occupation: '営業・マーケ', locale: 'ja', plan: 'free', level: 'intermediate',
    completedLessons: 9, fermiCount: 4, streakDays: 2, deviation: 53,
    feedback: { category: '機能追加', message: '週末しか使えないとストリークが途切れます。週末型でも続けられる猶予や復活の仕組みが欲しいです。' },
  },
  {
    id: 'p04', nickname: '高橋アヤ', birthYear: 1995, gender: 'female',
    occupation: 'コンサルタント', locale: 'ja', plan: 'paid_yearly', level: 'advanced',
    completedLessons: 22, fermiCount: 18, streakDays: 21, deviation: 68,
    feedback: { category: '機能追加', message: 'フェルミのランキングのスコア算出基準と母数が不透明です。上位者の根拠が分かると競争心が湧きます。' },
  },
  {
    id: 'p05', nickname: '伊藤ダイ', birthYear: 1991, gender: 'male',
    occupation: 'エンジニア・IT', locale: 'ja', plan: 'free', level: 'intermediate',
    completedLessons: 8, fermiCount: 5, streakDays: 3, deviation: 55,
    feedback: { category: '内容・説明が間違っている', message: '一部レッスンで図解(SVG)と本文の説明が食い違っている箇所があります。図のラベルが本文と対応していません。' },
  },
  {
    id: 'p06', nickname: '渡辺サキ', birthYear: 2000, gender: 'female',
    occupation: '企画・事業開発', locale: 'ja', plan: 'paid_monthly', level: 'intermediate',
    completedLessons: 11, fermiCount: 8, streakDays: 14, deviation: 57,
    feedback: { category: '機能追加', message: 'AI問題生成の生成中の待ち時間が体感長いです。進捗表示か、生成済みのストックがあると安心します。' },
  },
  {
    id: 'p07', nickname: '山本ジン', birthYear: 1984, gender: 'male',
    occupation: '管理部門', locale: 'ja', plan: 'free', level: 'intermediate',
    completedLessons: 7, fermiCount: 3, streakDays: 2, deviation: 52,
    feedback: { category: 'UI改善', message: 'タブ構成と戻る導線が分かりづらく、なぜなぜ分析コースをカテゴリ名から見つけられませんでした。' },
  },
  {
    id: 'p08', nickname: '中村リカ', birthYear: 2006, gender: 'female',
    occupation: '学生', locale: 'ja', plan: 'free', level: 'beginner',
    completedLessons: 2, fermiCount: 1, streakDays: 1, deviation: 44,
    feedback: { category: 'UI改善', message: '哲学・東洋思想コースの導入の敷居が高く、最初の一歩が分かりませんでした。通知で復帰できると助かります。' },
  },
  {
    id: 'p09', nickname: '小林タク', birthYear: 1988, gender: 'male',
    occupation: 'コンサルタント', locale: 'ja', plan: 'paid_monthly', level: 'advanced',
    completedLessons: 19, fermiCount: 10, streakDays: 6, deviation: 64,
    feedback: { category: 'UI改善', message: 'iPad横画面でカスタムコース作成画面のレイアウトが崩れます。Webとモバイルの同期も確認したいです。' },
  },
  {
    id: 'p10', nickname: '加藤ノゾミ', birthYear: 1997, gender: 'female',
    occupation: '管理部門', locale: 'ja', plan: 'free', level: 'intermediate',
    completedLessons: 10, fermiCount: 4, streakDays: 2, deviation: 54,
    feedback: { category: '機能追加', message: '保存アイテムが増えると一覧が探しづらいです。フォルダ分けや検索・並び替えが欲しいです。' },
  },
  {
    id: 'p11', nickname: '吉田ハヤト', birthYear: 2001, gender: 'male',
    occupation: 'その他', locale: 'ja', plan: 'free', level: 'beginner',
    completedLessons: 5, fermiCount: 6, streakDays: 12, deviation: 49,
    feedback: { category: '機能追加', message: '連続記録が命なので、1日抜けてもストリークが即0になるのは厳しいです。猶予や復活アイテムが欲しいです。' },
  },
  {
    id: 'p12', nickname: '山田エリ', birthYear: 1993, gender: 'female',
    occupation: '専門職', locale: 'ja', plan: 'paid_monthly', level: 'intermediate',
    completedLessons: 9, fermiCount: 5, streakDays: 4, deviation: 53,
    feedback: { category: 'バグ報告', message: '夜間に短時間で中断すると、学習時間の計測が途中離脱時に正しく止まらないことがあります。' },
  },
  {
    id: 'p13', nickname: '佐々木リョウ', birthYear: 2005, gender: 'male',
    occupation: '学生', locale: 'ja', plan: 'paid_yearly', level: 'intermediate',
    completedLessons: 12, fermiCount: 16, streakDays: 18, deviation: 58,
    feedback: { category: 'UI改善', message: 'ランキングの自分の順位とスコアの伸びをもっと見たいです。デイリー上限到達後の物足りなさも感じます。' },
  },
  {
    id: 'p14', nickname: '松本カナ', birthYear: 1999, gender: 'female',
    occupation: '営業・マーケ', locale: 'ja', plan: 'free', level: 'intermediate',
    completedLessons: 8, fermiCount: 3, streakDays: 2, deviation: 54,
    feedback: { category: 'UI改善', message: 'コースを途中で離脱したあと、続きに戻る導線が弱いです。おすすめも当たり外れがあります。' },
  },
  {
    id: 'p15', nickname: '井上ソウ', birthYear: 1981, gender: 'male',
    occupation: '経営・役員', locale: 'ja', plan: 'paid_yearly', level: 'advanced',
    completedLessons: 20, fermiCount: 9, streakDays: 7, deviation: 66,
    feedback: { category: '機能追加', message: 'TTSの読み上げ速度を細かく調整したいです。コース連続再生中の安定性も改善されると効率的です。' },
  },
  {
    id: 'p16', nickname: '木村ユイ', birthYear: 2004, gender: 'female',
    occupation: '学生', locale: 'ja', plan: 'free', level: 'beginner',
    completedLessons: 6, fermiCount: 2, streakDays: 5, deviation: 47,
    feedback: { category: 'UI改善', message: '配置診断のレベル判定の根拠がもう少し見えると、結果が腑に落ちます。完璧主義なので判定に動揺しました。' },
  },
  {
    id: 'p17', nickname: '林タケシ', birthYear: 1974, gender: 'male',
    occupation: 'その他', locale: 'ja', plan: 'free', level: 'beginner',
    completedLessons: 2, fermiCount: 1, streakDays: 1, deviation: 45,
    feedback: { category: 'その他', message: '文字が小さく感じます。文字サイズ調整やコントラスト設定の場所がもっと分かりやすいと助かります。' },
  },
  {
    id: 'p18', nickname: '清水アオイ', birthYear: 1996, gender: 'female',
    occupation: '専門職', locale: 'ja', plan: 'paid_monthly', level: 'intermediate',
    completedLessons: 9, fermiCount: 6, streakDays: 5, deviation: 56,
    feedback: { category: '機能追加', message: '通知が多いと割り込まれて集中が切れます。通知の粒度や時間帯を細かく制御できると助かります。' },
  },
  {
    id: 'p19', nickname: '森ハナ', birthYear: 1990, gender: 'female',
    occupation: 'その他', locale: 'ja', plan: 'free', level: 'beginner',
    completedLessons: 4, fermiCount: 2, streakDays: 3, deviation: 46,
    feedback: { category: 'その他', message: '解説をじっくり読む派です。不正解時のフィードバック文言が責めない中立的なトーンだと安心して続けられます。' },
  },
  {
    id: 'p20', nickname: '岡田ケイ', birthYear: 1986, gender: 'male',
    occupation: 'その他', locale: 'en', plan: 'paid_monthly', level: 'advanced',
    completedLessons: 17, fermiCount: 9, streakDays: 6, deviation: 65,
    feedback: { category: 'バグ報告', message: '[en locale] Some screens have untranslated strings and locale-dependent data (e.g. "Japan population" in Fermi) feels off in English.' },
  },
]

export function personaEmail(id: string): string {
  return `${EMAIL_PREFIX}${id}@${EMAIL_DOMAIN}`
}

export function personaMetadata(p: Persona): Record<string, unknown> {
  return { is_test: true, persona: p.id, batch: DOGFOOD_BATCH, nickname: p.nickname }
}
