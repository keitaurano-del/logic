/**
 * ログアウト時に localStorage から消さずに残すキーの単一定義 (source of truth)。
 *
 * 背景 (FB-16): かつて supabase.ts (`LOGOUT_KEEP_KEYS`) と syncService.ts
 * (`KEEP_KEYS`) に保持リストが二重定義されており、AF-05/07/08 で syncService
 * 側にだけ保持キーを追加したため、実際の UI ログアウトボタンが通る
 * supabase.logout() → clearLocalUserData() 経路が守られず、XP / ストリーク
 * フリーズ / フォルダ / 文字サイズ / TTS 設定などが消える再発バグになった。
 *
 * 二度と乖離させないため、保持キーはこのファイルだけで定義し、
 * clearLocalUserData (supabase.ts) と syncOnLogout (syncService.ts) の双方が
 * これを import して使う。コメントでの「一致させること」注意書きを構造で担保する。
 *
 * 依存方向: このモジュールは他のアプリモジュールに依存しない (純データ)。
 * supabase.ts / syncService.ts の両方から参照されるため、葉ノードに置く。
 */
export const LOGOUT_KEEP_KEYS: ReadonlySet<string> = new Set([
  // --- UI / インストール永続キー ---
  'logic-locale',
  'logic-theme',
  'logic-v3-preview',
  'logic-install-id',
  'logic-dev-mode',
  'logic-admin',
  'logic-onboarded',
  'logic-onboarding-done',
  'logic-tutorial-home-done',
  'logic-tutorial-daily-done',
  'logic-tutorial-lesson-done',
  'logic-tutorial-placement-dismissed',
  'logic-tutorial-fab-dismissed',

  // --- 次回ログイン時の再構築コストが高いユーザーコンテンツ ---
  // Supabase 同期未整備のうちは消すと完全に失われるので残す。
  'logic-saved-items',
  // フォルダ分けはローカル専用機能 (FB-11)。Supabase 同期未整備のため
  // ログアウト時に消すとユーザーの整理が完全に失われる。保持する。
  'logic-saved-folders',
  'logic-display-name',
  'logic-guest-id',
  'logic-flashcards',
  'logic-wrong-answers',

  // --- XP / レベル系 (AF-05 P0) ---
  // XP / レベルはログアウト時に消すと再ログインで完全消失する。
  // syncOnLogin で profiles.xp と Math.max マージするまでローカルを保持する。
  // 関連: logic-xp-log (履歴) / logic-journal-xp (朝夜付与フラグ) も
  // ローカル専用のため保持し、累積 XP との不整合を防ぐ。
  'logic-xp',
  'logic-xp-log',
  'logic-journal-xp',

  // --- プロフィール属性 (AF-05) ---
  // 生まれ年 / 性別 / 職業 / 目的。profiles へ push 済みだが
  // pull 復元が確実に効くまでの安全側保持。
  'logic-user-profile',

  // --- 通知設定 ---
  // OS スケジュールはログアウト後も残るため、pref を消すと UI 上 OFF 表示なのに
  // 通知だけ来る不整合になる (REVIEW_REPORT_20260524 高#1)。
  'logic-reminder',
  'logic-notif-extra',
  'logic-journal-reminder',

  // --- ストリークフリーズ在庫 (AF-07) ---
  // 無料配布専用アイテム (stats.ts:232) で Supabase 同期は未整備のため、
  // ログアウト時に消すと再ログインで完全消失する。中の consumedDates は
  // ストリーク計算に使われる重要データで、消えるとストリーク退行を招く。
  'logic-streak-freeze',

  // --- 端末ローカル UI 設定 (AF-08) ---
  // 文字サイズ / TTS 自動再生 / TTS 速度。Supabase 同期は不要で端末ごとの
  // 好みのため、logic-locale / logic-theme と同様にログアウト後も保持する。
  // 消すと毎回初期値に戻ってしまう。
  'logic-font-scale',
  'logic-tts-autoplay',
  'logic-tts-rate',
])
