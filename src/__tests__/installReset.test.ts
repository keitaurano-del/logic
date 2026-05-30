/**
 * DF-F11: 新規インストール検知の localStorage 初期化テスト。
 *
 * かつて checkAndInitInstall() は install-id 不在時に localStorage.clear() で
 * 全データを消していた。これによりアプリ更新・キャッシュクリア等で install-id
 * だけ消えた場面で、文字サイズ・テーマ等のユーザー設定や購読/トライアル状態まで
 * リセットされていた。修正後は保護キーを残し install-id だけ再発行することを担保する。
 */
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { checkAndInitInstall, INSTALL_ID_KEY, PRESERVE_ON_REINSTALL } from '../installReset'

describe('DF-F11 checkAndInitInstall', () => {
  beforeEach(() => {
    localStorage.clear()
  })
  afterEach(() => {
    localStorage.clear()
  })

  it('install-id が既にあれば何も変更しない（短絡）', () => {
    localStorage.setItem(INSTALL_ID_KEY, 'install-123-existing')
    localStorage.setItem('logic-onboarded', '1')
    localStorage.setItem('logic-font-scale', '1.2')

    checkAndInitInstall()

    expect(localStorage.getItem(INSTALL_ID_KEY)).toBe('install-123-existing')
    expect(localStorage.getItem('logic-onboarded')).toBe('1')
    expect(localStorage.getItem('logic-font-scale')).toBe('1.2')
  })

  it('install-id 不在なら新規 install-id を発行する', () => {
    expect(localStorage.getItem(INSTALL_ID_KEY)).toBeNull()

    checkAndInitInstall()

    const newId = localStorage.getItem(INSTALL_ID_KEY)
    expect(newId).toMatch(/^install-\d+-[a-z0-9]+$/)
  })

  it('install-id 不在時もユーザー設定（保護キー）は保持される', () => {
    // install-id は無いが、ユーザー設定や課金状態は残っている状況をシミュレート
    localStorage.setItem('logic-font-scale', '1.4')
    localStorage.setItem('logic-theme', 'dark')
    localStorage.setItem('logic-locale', 'en')
    localStorage.setItem('logic-subscription', JSON.stringify({ plan: 'paid_monthly', expiresAt: null, playStoreToken: null }))
    localStorage.setItem('logic-device-id', 'device-abc')
    localStorage.setItem('logic-tts-rate', '1.5')

    checkAndInitInstall()

    expect(localStorage.getItem('logic-font-scale')).toBe('1.4')
    expect(localStorage.getItem('logic-theme')).toBe('dark')
    expect(localStorage.getItem('logic-locale')).toBe('en')
    expect(localStorage.getItem('logic-subscription')).toContain('paid_monthly')
    expect(localStorage.getItem('logic-device-id')).toBe('device-abc')
    expect(localStorage.getItem('logic-tts-rate')).toBe('1.5')
  })

  it('保護対象外（進行状態）は初期化で削除される（SCRUM-200 維持）', () => {
    localStorage.setItem('logic-onboarded', '1')
    localStorage.setItem('logic-tutorial-home-done', '1')
    localStorage.setItem('logic-progress', '{"1":{}}')

    checkAndInitInstall()

    expect(localStorage.getItem('logic-onboarded')).toBeNull()
    expect(localStorage.getItem('logic-tutorial-home-done')).toBeNull()
    expect(localStorage.getItem('logic-progress')).toBeNull()
  })

  it('保護キーリストには文字サイズ・テーマ・購読が含まれている', () => {
    expect(PRESERVE_ON_REINSTALL).toContain('logic-font-scale')
    expect(PRESERVE_ON_REINSTALL).toContain('logic-theme')
    expect(PRESERVE_ON_REINSTALL).toContain('logic-subscription')
    expect(PRESERVE_ON_REINSTALL).toContain(INSTALL_ID_KEY)
  })
})
