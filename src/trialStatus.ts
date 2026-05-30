/**
 * trialStatus - DF-F11
 * 無料トライアル（ジャーナル 7 日間）の表示判定ヘルパ。
 *
 * 残日数の算出は subscription.ts の getJournalTrialDaysLeft() に一本化し、
 * ここでは表示すべきかの判定だけを行う（二重ロジック回避）。
 *
 * 表示条件: トライアル中（!isPaid かつ残日数>0）かつ「ログイン済み」のときのみ。
 * トライアルは install 時刻基準なので未ログインでも残日数は算出されるが、
 * ジャーナル保存にログインが必須のため、未ログインには出さない。
 */
import { getJournalTrialDaysLeft, isTrialActive } from './subscription'

/** トライアル中バッジを表示すべきかを判定（ログイン済みが前提）。 */
export function shouldShowTrial(isLoggedIn: boolean): boolean {
  return isLoggedIn && isTrialActive()
}

/** 終了間際バナー（残り 2 日以下）を表示すべきかを判定。 */
export function shouldShowTrialEndingBanner(isLoggedIn: boolean): boolean {
  return shouldShowTrial(isLoggedIn) && getJournalTrialDaysLeft() <= 2
}
