// LR-40: In-App Review 依頼（成功の瞬間に1回・低評価はフィードバックへ二段）
//
// 設計方針:
//  - Google Play の In-App Review API は「ユーザーが何点付けたか」をアプリに返さない。
//    そのため「低評価ならフィードバックへ」はネイティブ評価ダイアログ単体では実現できない。
//    一般的パターンに従い、アプリ内のカスタム事前プロンプト（Yes/No）で二段にする:
//      Yes（楽しんでいる） → ネイティブ In-App Review を要求
//      No（イマイチ）       → 既存のフィードバック導線へ誘導
//  - プラグイン（@capacitor-community/in-app-review）が未導入でもビルドが壊れないよう、
//    動的 import で呼び出し、解決できなければ no-op にフォールバックする。
//    Web / 非対応環境でも no-op。
//  - 一度プロンプトを出したら localStorage にフラグを立て、二度と表示しない（上限1回）。
//
// 導入手順（報告参照）:
//   npm install @capacitor-community/in-app-review
//   npx cap sync android
// を行うとネイティブの In-App Review が有効になる。未導入時は requestNativeReview() が no-op。

import { isNative } from './platform'

const PROMPTED_KEY = 'logic-review-prompted'

/** 成功判定のしきい値（控えめ＝達成感が確実にある瞬間だけ出す）。 */
export const REVIEW_MIN_COMPLETED_LESSONS = 3
export const REVIEW_MIN_STREAK_DAYS = 3

export interface ReviewStats {
  completedLessons: number
  streakDays: number
}

/**
 * 「成功の瞬間」に達したかを判定する純粋関数。
 * 3レッスン完了 かつ ストリーク3日 を満たしたら true。
 * （どちらか一方では出さない＝偶発ではなく継続が伴った達成に限定）
 */
export function isSuccessMoment(stats: ReviewStats): boolean {
  return (
    stats.completedLessons >= REVIEW_MIN_COMPLETED_LESSONS &&
    stats.streakDays >= REVIEW_MIN_STREAK_DAYS
  )
}

/** 過去にレビュー事前プロンプトを表示済みか。 */
export function hasPromptedReview(): boolean {
  try {
    return localStorage.getItem(PROMPTED_KEY) === '1'
  } catch {
    return false
  }
}

/** 事前プロンプトを表示済みとして記録する（再表示防止・上限1回）。 */
export function markReviewPrompted(): void {
  try {
    localStorage.setItem(PROMPTED_KEY, '1')
  } catch {
    /* localStorage 不可は無視 */
  }
}

/**
 * 事前プロンプトを出すべきかの総合判定。
 *  - まだ一度も出していない
 *  - かつ「成功の瞬間」に達している
 * Web/非対応はこの後の requestNativeReview が no-op なので、ここでは native 限定にする。
 */
export function shouldRequestReview(stats: ReviewStats): boolean {
  if (!isNative()) return false
  if (hasPromptedReview()) return false
  return isSuccessMoment(stats)
}

/**
 * ネイティブの In-App Review ダイアログを要求する。
 *  - native 以外は no-op。
 *  - プラグイン未導入（動的 import 失敗）でも握り潰して no-op。
 * 注: Google Play 側のクォータ等により実際にダイアログが出ないことがある（正常動作）。
 */
export async function requestNativeReview(): Promise<void> {
  if (!isNative()) return
  try {
    // 動的 import: 未導入でもバンドル/型解決を壊さない。
    const mod = await import(
      /* @vite-ignore */ '@capacitor-community/in-app-review'
    ).catch(() => null)
    const InAppReview = (mod as { InAppReview?: { requestReview: () => Promise<unknown> } } | null)?.InAppReview
    if (InAppReview?.requestReview) {
      await InAppReview.requestReview()
    }
  } catch {
    /* プラグイン未導入 / ネイティブ未実装は no-op */
  }
}
