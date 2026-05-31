import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * UI-28「文字サイズ変更をテーマ設定と別出しにする」回帰ロック。
 *
 * 目的: 実装は既に本番反映済（REVIEW）。その結線（独立画面化・ルート結線・
 * プロフィール独立行・i18n・AppearanceSettings からの文字サイズ設定 UI 削除・
 * DF-F2 保存/適用の非破壊）を、ソースファイルの静的検査で恒久ロックする。
 *
 * 方式: レンダリングせず fs でソースを読み、結線文字列の「存在/不在」を assert する。
 * visualPropsIntegrity.test.ts の静的走査スタイルを踏襲（レンダリング不要で安定）。
 *
 * 固定する結線（すべて既に存在・検証済み）:
 *  1. src/screens/FontSizeSettingsScreen.tsx が存在し FontSizeSettingsScreen を export
 *  2. src/AppV3.tsx に font-size-settings ルート型・onOpenFontSize 結線・描画分岐
 *  3. src/screens/ProfileScreenV3.tsx に文字サイズ独立 SettingRow
 *  4. src/i18n.ts に profile.fontSize / fontSizeSettings.title が ja/en 両方
 *  5. src/screens/AppearanceSettingsScreen.tsx から文字サイズ「設定」UI が削除
 *     （CSS の fontSize スタイルプロパティは誤検知しないこと）
 *  6. DF-F2 保存/適用（src/fontScale.ts / localStorage キー logic-font-scale）が非破壊
 */

const here = dirname(fileURLToPath(import.meta.url))
const srcDir = resolve(here, '..')

function readSrc(relPath: string): string {
  return readFileSync(resolve(srcDir, relPath), 'utf8')
}

describe('UI-28 文字サイズ独立化 回帰ロック', () => {
  describe('1. FontSizeSettingsScreen 独立画面', () => {
    const src = readSrc('screens/FontSizeSettingsScreen.tsx')

    it('FontSizeSettingsScreen を named export している', () => {
      expect(src).toMatch(/export function FontSizeSettingsScreen\b/)
    })

    it('fontScale モジュール（保存/適用ロジック）を利用している', () => {
      expect(src).toContain("from '../fontScale'")
      expect(src).toContain('FONT_SCALES')
      expect(src).toContain('setFontScale')
      expect(src).toContain('loadFontScale')
    })

    it('文字サイズ専用タイトル fontSizeSettings.title を表示する', () => {
      expect(src).toContain("t('fontSizeSettings.title')")
    })
  })

  describe('2. AppV3 ルート結線', () => {
    const src = readSrc('AppV3.tsx')

    it("Screen union に { type: 'font-size-settings' } がある", () => {
      expect(src).toMatch(/\{\s*type:\s*'font-size-settings'\s*\}/)
    })

    it('FontSizeSettingsScreen を import している', () => {
      expect(src).toContain('FontSizeSettingsScreen')
      expect(src).toContain("import('./screens/FontSizeSettingsScreen')")
    })

    it("onOpenFontSize で font-size-settings へ navigate する結線がある", () => {
      expect(src).toContain('onOpenFontSize')
      expect(src).toMatch(/onOpenFontSize=\{\(\)\s*=>\s*navigate\(\{\s*type:\s*'font-size-settings'\s*\}\)\}/)
    })

    it("screen.type === 'font-size-settings' の描画分岐がある", () => {
      expect(src).toContain("screen.type === 'font-size-settings'")
      expect(src).toMatch(/<FontSizeSettingsScreen\b/)
    })
  })

  describe('3. ProfileScreenV3 文字サイズ独立行', () => {
    const src = readSrc('screens/ProfileScreenV3.tsx')

    it('onOpenFontSize prop を受ける', () => {
      expect(src).toContain('onOpenFontSize')
    })

    it('文字サイズ独立 SettingRow（profile.fontSize / icon=fontSize / onOpenFontSize）がある', () => {
      // 1 つの SettingRow に 3 要素が揃っていることを確認する。
      const settingRow = /<SettingRow[^>]*icon="fontSize"[^>]*name=\{t\('profile\.fontSize'\)\}[^>]*onClick=\{onOpenFontSize\}/
      expect(src).toMatch(settingRow)
    })

    it('fontSize アイコンが定義されている', () => {
      expect(src).toMatch(/fontSize:\s*</)
    })
  })

  describe('4. i18n に文字サイズ独立キーが ja/en 両方', () => {
    const src = readSrc('i18n.ts')

    it("profile.fontSize が ja/en で 2 回定義されている", () => {
      const matches = src.match(/'profile\.fontSize':/g) ?? []
      expect(matches.length).toBe(2)
    })

    it("fontSizeSettings.title が ja/en で 2 回定義されている", () => {
      const matches = src.match(/'fontSizeSettings\.title':/g) ?? []
      expect(matches.length).toBe(2)
    })
  })

  describe('5. AppearanceSettings から文字サイズ「設定」UI が削除済み', () => {
    const src = readSrc('screens/AppearanceSettingsScreen.tsx')

    it('テーマ画面である（テーマ選択 UI を保持）', () => {
      expect(src).toContain('export function AppearanceSettingsScreen')
      expect(src).toContain('MODES')
      expect(src).toContain('ThemeCard')
    })

    it('fontScale 設定ロジック（FONT_SCALES / setFontScale / loadFontScale）を含まない', () => {
      // CSS の `fontSize` スタイルプロパティは誤検知しないよう、fontScale 固有の
      // シンボルだけを不在 assert の対象にする。
      expect(src).not.toContain('FONT_SCALES')
      expect(src).not.toContain('setFontScale')
      expect(src).not.toContain('loadFontScale')
      expect(src).not.toContain("from '../fontScale'")
    })

    it('文字サイズ選択 UI（FontSizeCard / 文字サイズ見出し）を含まない', () => {
      expect(src).not.toContain('FontSizeCard')
      expect(src).not.toContain("t('appearanceSettings.fontSizeHeading')")
      expect(src).not.toContain("t('appearanceSettings.fontSizeHint')")
    })
  })

  describe('6. DF-F2 保存/適用が非破壊', () => {
    const src = readSrc('fontScale.ts')

    it('localStorage キー logic-font-scale を維持している', () => {
      expect(src).toContain("'logic-font-scale'")
    })

    it('保存/適用 API（setFontScale / applyFontScale / loadFontScale）を export している', () => {
      expect(src).toMatch(/export function setFontScale\b/)
      expect(src).toMatch(/export function applyFontScale\b/)
      expect(src).toMatch(/export function loadFontScale\b/)
    })

    it('FONT_SCALES（標準/大/特大）を export している', () => {
      expect(src).toMatch(/export const FONT_SCALES\b/)
      expect(src).toContain("id: 'standard'")
      expect(src).toContain("id: 'large'")
      expect(src).toContain("id: 'xlarge'")
    })
  })
})
