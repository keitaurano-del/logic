/**
 * FB-16 回帰: 実ログアウトボタンが通る経路の保持キーガード
 *
 * 背景: AF-05/07/08 は syncService.syncOnLogout 側の KEEP_KEYS に保持キーを
 * 追加して DONE 化されたが、UI のログアウトボタン (Profile / AccountSettings /
 * ProfileScreenV3) が実際に呼ぶのは supabase.logout() → clearLocalUserData() の
 * 別経路で、こちらの保持リスト (LOGOUT_KEEP_KEYS) には追加が反映されておらず、
 * 実ボタンを押すと XP / ストリークフリーズ / フォルダ / 文字サイズ / TTS 設定が
 * 消える再発バグになっていた (緑すり抜けの原因: 既存テストは syncOnLogout を
 * 直接叩くだけで logout()/clearLocalUserData() を踏んでいなかった)。
 *
 * 本テストは実ログアウト経路の clearLocalUserData() を直接通し、AF-05/07/08 で
 * 保持対象としたキーが実ボタン経路でも残ることをガードする。さらに保持リストが
 * supabase.ts と syncService.ts で単一定義に統合されていること (FB-16) を、
 * 両経路で同一の挙動になることで確認する。
 */
import { beforeEach, describe, expect, it } from 'vitest'

// AF-05/07/08 で保持対象とした「Supabase 同期が無い / 復元コストの高い」キー群。
// 実ログアウト経路でこれらが残らないと再発バグ。
const MUST_KEEP: readonly string[] = [
  'logic-xp',
  'logic-xp-log',
  'logic-journal-xp',
  'logic-user-profile',
  'logic-streak-freeze',
  'logic-saved-folders',
  'logic-font-scale',
  'logic-tts-autoplay',
  'logic-tts-rate',
  'logic-reminder',
  'logic-notif-extra',
  'logic-journal-reminder',
]

// 消えるべき個人データ（KEEP 対象外）。テストが「全保持」で素通りしていない証明。
const MUST_CLEAR: readonly string[] = [
  'logic-notebook',
  'logic-progress',
  'logic-daily-problem',
  'logic-stats',
]

beforeEach(() => {
  localStorage.clear()
})

describe('FB-16: 実ログアウトボタン経路 (clearLocalUserData) の保持キーガード', () => {
  it('AF-05/07/08 の保持キーが clearLocalUserData() でも残る', async () => {
    const { clearLocalUserData } = await import('../supabase')

    for (const k of MUST_KEEP) localStorage.setItem(k, `val-${k}`)
    for (const k of MUST_CLEAR) localStorage.setItem(k, `val-${k}`)

    clearLocalUserData()

    for (const k of MUST_KEEP) {
      expect(localStorage.getItem(k), `${k} は実ログアウト経路で保持されるべき`).toBe(`val-${k}`)
    }
    for (const k of MUST_CLEAR) {
      expect(localStorage.getItem(k), `${k} は実ログアウト経路で削除されるべき`).toBeNull()
    }
  })

  it('実ボタン経路 (clearLocalUserData) と同期サービス経路 (syncOnLogout) の保持判定が一致する', async () => {
    const { clearLocalUserData } = await import('../supabase')
    const { LOGOUT_KEEP_KEYS } = await import('../logoutKeepKeys')

    // 保持キー Set が単一の source of truth であること（二重定義の解消）。
    // supabase.ts / syncService.ts の両方がこの Set を import している前提を、
    // 実経路 (clearLocalUserData) がこの Set の通りに振る舞うことで間接確認する。
    const all = [...MUST_KEEP, ...MUST_CLEAR]
    for (const k of all) localStorage.setItem(k, `val-${k}`)

    clearLocalUserData()

    for (const k of all) {
      const survived = localStorage.getItem(k) !== null
      expect(survived, `${k} の保持判定は LOGOUT_KEEP_KEYS と一致すべき`).toBe(
        LOGOUT_KEEP_KEYS.has(k),
      )
    }
  })

  it('logic- 接頭辞でないキーは clearLocalUserData() の対象外で残る', async () => {
    const { clearLocalUserData } = await import('../supabase')

    localStorage.setItem('other-app-key', 'keep')
    localStorage.setItem('logic-progress', 'clear-me')

    clearLocalUserData()

    expect(localStorage.getItem('other-app-key')).toBe('keep')
    expect(localStorage.getItem('logic-progress')).toBeNull()
  })
})
