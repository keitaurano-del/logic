// 成果シェア文言の生成（純粋ロジック・テスト可能）。
//
// 価値訴求型（安さ訴求ではなく「到達した価値」を伝える）。
// i18n の t() を引数で受け取り、ja/en どちらでも同じロジックで生成する。
// share.ts (openShareSheet) に渡す { title, text, url } を組み立てる。

/** 共有リンク先。インストール導線として Play Store のリスティングへ誘導する。
 *  ※独自ドメイン取得後は差し替え可。appId は android/app/build.gradle と一致。 */
export const SHARE_URL = 'https://play.google.com/store/apps/details?id=com.logicalthinking.app'

export interface ShareContent {
  title: string
  text: string
  url: string
}

type TFn = (key: string, params?: Record<string, string | number>) => string

/**
 * 偏差値（実力診断結果）のシェア文言。
 * 例: 「ロジカルシンキングの実力診断で偏差値62を取りました！」
 */
export function buildDeviationShareContent(t: TFn, deviation: number): ShareContent {
  return {
    title: t('share.appName'),
    text: t('share.deviation', { deviation: String(deviation) }),
    url: SHARE_URL,
  }
}

/**
 * 連続学習日数（ストリーク）のシェア文言。
 * 例: 「Logic で7日連続学習を達成！毎日少しずつ思考力を鍛えています。」
 */
export function buildStreakShareContent(t: TFn, streakDays: number): ShareContent {
  return {
    title: t('share.appName'),
    text: t('share.streak', { days: String(streakDays) }),
    url: SHARE_URL,
  }
}

/**
 * プロフィール（レベル・XP）のシェア文言。
 * 例: 「Logic でLv.12・3,200XPまで到達！論理的思考を毎日鍛えています。」
 */
export function buildProfileShareContent(t: TFn, level: number, xp: number): ShareContent {
  return {
    title: t('share.appName'),
    text: t('share.profile', { level: String(level), xp: xp.toLocaleString() }),
    url: SHARE_URL,
  }
}
