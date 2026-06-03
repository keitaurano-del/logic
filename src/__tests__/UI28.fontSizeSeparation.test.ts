import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * 設定/プロフィール IA 回帰ロック（dogfood-batch-20260603）。
 *
 * 旧 UI-28 は「文字サイズをテーマと別出し」を固定していたが、その後の実機 FB
 * （FB-31 / FB-32 / FB-27）で IA を再編した。本テストは再編後の構成を恒久ロックする:
 *
 *  - FB-31: 「プロフィール編集」と「アカウント」を ProfileEditScreen に統合。
 *           プロフィール画面の独立「アカウント」行は廃止し、editProfile 行に集約。
 *  - FB-32: 言語・テーマ・文字サイズを「環境設定」(PreferencesScreen) に集約。
 *           プロフィール画面の独立 言語/テーマ/文字サイズ 行は廃止し、preferences 行に集約。
 *  - FB-27: 文字サイズ段階の底上げ（default = 旧「大」, id 'large'）と保存値後方互換。
 *           タブバーのラベルは font-scale 非依存の固定 px。
 *
 * 方式: レンダリングせず fs でソースを読み、結線文字列の存在/不在を assert する。
 */

const here = dirname(fileURLToPath(import.meta.url))
const srcDir = resolve(here, '..')

function readSrc(relPath: string): string {
  return readFileSync(resolve(srcDir, relPath), 'utf8')
}

describe('設定/プロフィール IA 再編 回帰ロック', () => {
  describe('FB-32: 環境設定（PreferencesScreen）に集約', () => {
    const pref = readSrc('screens/PreferencesScreen.tsx')

    it('PreferencesScreen を named export している', () => {
      expect(pref).toMatch(/export function PreferencesScreen\b/)
    })

    it('言語・テーマ・文字サイズの 3 モジュールを利用している', () => {
      expect(pref).toContain("from '../theme'")
      expect(pref).toContain("from '../fontScale'")
      expect(pref).toContain('setLocale')
      expect(pref).toContain('setMode')
      expect(pref).toContain('setFontScale')
    })

    it('環境設定タイトル preferences.title を表示する', () => {
      expect(pref).toContain("t('preferences.title')")
    })

    it('3 セクション見出し（言語・テーマ・文字サイズ）を持つ', () => {
      expect(pref).toContain("t('preferences.languageHeading')")
      expect(pref).toContain("t('preferences.themeHeading')")
      expect(pref).toContain("t('preferences.fontSizeHeading')")
    })
  })

  describe('FB-32: AppV3 preferences ルート結線', () => {
    const src = readSrc('AppV3.tsx')

    it("Screen union に { type: 'preferences' } がある", () => {
      expect(src).toMatch(/\{\s*type:\s*'preferences'\s*\}/)
    })

    it('PreferencesScreen を import している', () => {
      expect(src).toContain("import('./screens/PreferencesScreen')")
    })

    it('onOpenPreferences で preferences へ navigate する結線がある', () => {
      expect(src).toMatch(/onOpenPreferences=\{\(\)\s*=>\s*navigate\(\{\s*type:\s*'preferences'\s*\}\)\}/)
    })

    it("screen.type === 'preferences' の描画分岐がある", () => {
      expect(src).toContain("screen.type === 'preferences'")
      expect(src).toMatch(/<PreferencesScreen\b/)
    })
  })

  describe('FB-31 / FB-32: ProfileScreenV3 の設定行が統合済み', () => {
    const src = readSrc('screens/ProfileScreenV3.tsx')

    it('環境設定行（profile.preferences / onOpenPreferences）がある', () => {
      const row = /<SettingRow[^>]*name=\{t\('profile\.preferences'\)\}[^>]*onClick=\{onOpenPreferences\}/
      expect(src).toMatch(row)
    })

    it('独立した 言語/テーマ/文字サイズ 行は廃止されている', () => {
      expect(src).not.toContain('onOpenLanguage')
      expect(src).not.toContain('onOpenAppearance')
      expect(src).not.toContain('onOpenFontSize')
    })

    it('独立した「アカウント」行（onOpenAccount）は廃止され editProfile に集約', () => {
      expect(src).not.toContain('onOpenAccount')
      expect(src).toContain('onOpenProfileEdit')
    })
  })

  describe('FB-31: ProfileEditScreen がアカウント操作を内包', () => {
    const src = readSrc('screens/ProfileEditScreen.tsx')

    it('アカウントセクション見出し profileEdit.sectionAccount を表示する', () => {
      expect(src).toContain("t('profileEdit.sectionAccount')")
    })

    it('メール変更・ログアウトのアカウント操作を持つ', () => {
      expect(src).toContain('updateUserEmail')
      expect(src).toContain('logout')
      expect(src).toContain('onOpenLogin')
      expect(src).toContain('onLogout')
    })

    it('言語フィールドは PreferencesScreen に移管され、ここには無い', () => {
      expect(src).not.toContain("t('profileEdit.language')")
    })
  })

  describe('i18n に新キーが ja/en 両方', () => {
    const src = readSrc('i18n.ts')

    it("preferences.title が ja/en で 2 回定義されている", () => {
      const matches = src.match(/'preferences\.title':/g) ?? []
      expect(matches.length).toBe(2)
    })

    it("profile.preferences が ja/en で 2 回定義されている", () => {
      const matches = src.match(/'profile\.preferences':/g) ?? []
      expect(matches.length).toBe(2)
    })

    it("profileEdit.sectionAccount が ja/en で 2 回定義されている", () => {
      const matches = src.match(/'profileEdit\.sectionAccount':/g) ?? []
      expect(matches.length).toBe(2)
    })
  })

  describe('FB-27: 文字サイズ底上げ + 後方互換', () => {
    const src = readSrc('fontScale.ts')

    it('localStorage キー logic-font-scale を維持している（保存値後方互換）', () => {
      expect(src).toContain("'logic-font-scale'")
    })

    it('内部 id（standard/large/xlarge）と倍率は据え置き', () => {
      expect(src).toContain("id: 'standard'")
      expect(src).toContain("id: 'large'")
      expect(src).toContain("id: 'xlarge'")
      expect(src).toContain('scale: 1.0')
      expect(src).toContain('scale: 1.15')
      expect(src).toContain('scale: 1.3')
    })

    it("デフォルトを新「標準」(= 旧大, id 'large') に底上げ", () => {
      expect(src).toMatch(/const DEFAULT_ID:\s*FontScaleId\s*=\s*'large'/)
    })

    it('保存/適用 API を export している', () => {
      expect(src).toMatch(/export function setFontScale\b/)
      expect(src).toMatch(/export function applyFontScale\b/)
      expect(src).toMatch(/export function loadFontScale\b/)
    })
  })

  describe('FB-27: タブバーは font-scale 非依存（固定 px）', () => {
    const css = readSrc('components/AppShell.css')

    it('.app-tab の font-size が rem ではなく px 固定', () => {
      // .app-tab ブロック内の font-size が px であること（rem だと root スケールに追従して崩れる）
      const block = css.match(/\.app-tab\s*\{[^}]*\}/)?.[0] ?? ''
      expect(block).toMatch(/font-size:\s*\d+px/)
      expect(block).not.toMatch(/font-size:\s*[\d.]+rem/)
    })
  })
})
