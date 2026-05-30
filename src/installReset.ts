// SCRUM-200 / DF-F11: 新規インストール検知と localStorage の選択的初期化。
//
// Capacitor Android はアンインストールしても WebView データが残る場合があるため、
// インストール識別子（logic-install-id）が無ければ「新規インストール」とみなして
// 初期化する。再インストール後に onboarding をスキップしてしまう問題（SCRUM-200）の
// 対策が元の目的。
//
// DF-F11: かつては localStorage.clear() で全データを消していたが、アプリ更新・
// WebView キャッシュクリア等で install-id だけ消える場面でも全消しが走り、
// ユーザー設定（文字サイズ・テーマ・言語等）や購読/トライアル状態まで巻き込んで
// リセットされていた（Keita の「設定しても戻る」体感の隠れ要因）。
// そこで全消しをやめ、ユーザーが明示的に設定したものと課金状態は保護し、
// それ以外の進行状態（onboarding マーカー・チュートリアル既読など）だけを消す。

export const INSTALL_ID_KEY = 'logic-install-id'

// 新規インストール初期化時に消さずに残すキー（ユーザーが設定したもの・課金状態など）。
export const PRESERVE_ON_REINSTALL: readonly string[] = [
  INSTALL_ID_KEY,        // logic-install-id（このあと再発行する）
  'logic-font-scale',    // 文字サイズ設定（DF-F2）
  'logic-theme',         // テーマ
  'logic-locale',        // 表示言語
  'logic-subscription',  // 課金状態 + ジャーナルトライアル起算（install-id 由来）
  'logic-device-id',     // 匿名・安定デバイス ID（フィードバック等で再利用）
  'logic-notifications', // リマインダー時刻
  'logic-reminder',      // リマインダー設定
  'logic-journal-reminder',
  'logic-notif-extra',
  'logic-tts-autoplay',  // TTS（読み上げ）設定群
  'logic-tts-rate',
  'logic-tts-voice',
  'logic-tts-cloud-v1',    // 注: localStorage キーではなく Cache API のキャッシュ名。このリストは localStorage 専用なので実害なし（dead entry、誤解防止のため明記）
  'logic-tts-course-play', // 注: localStorage キーではなく sessionStorage キー。このリストは localStorage 専用なので実害なし（dead entry、誤解防止のため明記）
]

function generateInstallId(): string {
  return `install-${Date.now()}-${Math.random().toString(36).slice(2)}`
}

/**
 * install-id が存在しなければ新規インストールとみなし、保護対象“以外”のキーを
 * 個別に削除したうえで install-id を再発行する。
 * 既に install-id があれば何もしない。
 */
export function checkAndInitInstall(): void {
  let installId: string | null = null
  try {
    installId = localStorage.getItem(INSTALL_ID_KEY)
  } catch {
    return // localStorage 不可環境では何もしない
  }
  if (installId) return

  try {
    const keysToRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && !PRESERVE_ON_REINSTALL.includes(key)) keysToRemove.push(key)
    }
    for (const key of keysToRemove) localStorage.removeItem(key)
    localStorage.setItem(INSTALL_ID_KEY, generateInstallId())
  } catch { /* localStorage 不可環境では何もしない */ }
}
