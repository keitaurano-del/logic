/**
 * LR-7 (#38): record-score の identity 束縛のユニットテスト。
 *
 * resolveRecordScoreIdentity:
 * - 認証済みなら user_id をサーバー検証済み UUID に強制束縛し、クライアント申告 userId は無視する。
 * - 未認証ゲストは申告 userId を尊重するが、auth UUID 形式の詐称は 'guest' に倒す。
 * - user_name は申告を尊重しつつ長さキャップ、未指定は 'ゲスト'。
 */
import { describe, it, expect } from 'vitest'
import { resolveRecordScoreIdentity, FERMI_MAX_USERNAME_LEN } from '../fermi'

const AUTHED_UUID = '11111111-1111-4111-8111-111111111111'
const OTHER_UUID = '22222222-2222-4222-8222-222222222222'

describe('resolveRecordScoreIdentity', () => {
  it('認証済みなら user_id を検証済み UUID に強制束縛し、申告 userId を無視する', () => {
    // クライアントが他人の UUID を騙っても、認証済み UUID で上書きされる。
    const r = resolveRecordScoreIdentity(AUTHED_UUID, OTHER_UUID, '攻撃者')
    expect(r.userId).toBe(AUTHED_UUID)
    expect(r.userName).toBe('攻撃者')
  })

  it('認証済みで申告 userId が guest 文字列でも、検証済み UUID を使う', () => {
    const r = resolveRecordScoreIdentity(AUTHED_UUID, 'g_abc123', 'Taro')
    expect(r.userId).toBe(AUTHED_UUID)
  })

  it('未認証ゲストは申告 guestId をそのまま使う', () => {
    const r = resolveRecordScoreIdentity(null, 'g_abc123', 'ゲスト太郎')
    expect(r.userId).toBe('g_abc123')
    expect(r.userName).toBe('ゲスト太郎')
  })

  it('未認証ゲストが auth UUID 形式の userId を騙ると guest に倒す（なりすまし防止）', () => {
    const r = resolveRecordScoreIdentity(null, OTHER_UUID, 'なりすまし')
    expect(r.userId).toBe('guest')
  })

  it('未認証で userId 未指定なら guest', () => {
    expect(resolveRecordScoreIdentity(null, undefined, 'x').userId).toBe('guest')
    expect(resolveRecordScoreIdentity(null, '', 'x').userId).toBe('guest')
    expect(resolveRecordScoreIdentity(null, '   ', 'x').userId).toBe('guest')
  })

  it('userName 未指定 / 空はデフォルト ゲスト', () => {
    expect(resolveRecordScoreIdentity(null, 'g_a', undefined).userName).toBe('ゲスト')
    expect(resolveRecordScoreIdentity(null, 'g_a', '').userName).toBe('ゲスト')
    expect(resolveRecordScoreIdentity(null, 'g_a', '   ').userName).toBe('ゲスト')
    expect(resolveRecordScoreIdentity(null, 'g_a', 42).userName).toBe('ゲスト')
  })

  it('userName は長さ上限でキャップされる', () => {
    const long = 'あ'.repeat(FERMI_MAX_USERNAME_LEN + 50)
    const r = resolveRecordScoreIdentity(AUTHED_UUID, null, long)
    expect(r.userName.length).toBe(FERMI_MAX_USERNAME_LEN)
  })

  it('userName の前後空白はトリムされる', () => {
    expect(resolveRecordScoreIdentity(null, 'g_a', '  Taro  ').userName).toBe('Taro')
  })
})
