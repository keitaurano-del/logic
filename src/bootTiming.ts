/**
 * LR-32: 起動 BootLoadingScreen の最低表示時間（MIN_BOOT_MS）を、
 * 初回起動だけ長く、2回目以降は短くするための純粋ロジック。
 *
 * 初回はブランドを認識してもらう余白として 2000ms 確保するが、
 * 2回目以降のユーザーはブランドを既に知っているため 400ms に短縮し、
 * 起動を体感的に速くする。
 *
 * localStorage が使えない環境（プライベートモード / SSR 等）では、
 * 判定を「初回扱い（安全側 = 長め）」に倒す。短縮は失敗しても害が小さい
 * 方向に倒す方針。
 */

/** 初回起動時の BootLoadingScreen 最低表示 ms */
export const FIRST_LAUNCH_MIN_BOOT_MS = 2000
/** 2回目以降の BootLoadingScreen 最低表示 ms */
export const REPEAT_LAUNCH_MIN_BOOT_MS = 400

/** 一度でも boot 完了したかを記録する localStorage キー */
export const BOOTED_ONCE_KEY = 'logic-booted-once'

/**
 * 起動最低表示 ms を返す。
 * @param isFirstLaunch 初回起動なら true
 */
export function getMinBootMs(isFirstLaunch: boolean): number {
  return isFirstLaunch ? FIRST_LAUNCH_MIN_BOOT_MS : REPEAT_LAUNCH_MIN_BOOT_MS
}

/**
 * 初回起動かどうかを判定する。
 * localStorage が読めない場合は安全側で初回扱い（= true）を返す。
 */
export function isFirstLaunch(): boolean {
  try {
    return localStorage.getItem(BOOTED_ONCE_KEY) !== '1'
  } catch {
    // localStorage 不可環境は初回扱い（長めの boot に倒す）
    return true
  }
}

/**
 * boot 完了を記録する。次回以降 isFirstLaunch() が false を返すようになる。
 * localStorage が書けない場合は黙って無視（次回も初回扱いになるだけ）。
 */
export function markBooted(): void {
  try {
    localStorage.setItem(BOOTED_ONCE_KEY, '1')
  } catch {
    /* localStorage 不可環境は記録できない（毎回初回扱い）。害はないので無視 */
  }
}
