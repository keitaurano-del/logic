import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { contrastRatio } from '../colorContrast'

/**
 * T-U「selection/active ハイライト × その上に乗る文字」コントラスト回帰ロック。
 *
 * 背景: 選択中チップ・アクティブタブ・ピル・CTA などは背景に var(--brand) を敷き、
 * その上にラベル文字を載せる。従来これらは var(--accent-fg) を流用していたが、
 * --accent-fg は applyTheme() がユーザー選択アクセント色（ACCENT swatch）に応じて
 * <html> へ inline 上書きする「アクセント塗り用」トークンで、--brand 塗りの可読性を
 * 保証しない。とりわけ dark テーマでは --brand=#6C8EF5（明るい青）に白文字が乗り
 * 3.08:1 と本文 AA(4.5:1) 未達だった。
 *
 * 是正: --brand 塗り専用の前景トークン --brand-fg を tokens.css に分離し、各テーマで
 * 本文 AA を満たす値を固定（light 系=白、dark/forest/indigo=近黒）。highlight 消費側を
 * var(--accent-fg) → var(--brand-fg) に付け替えた。
 *
 * 本テストは (A) tokens.css の各テーマの (--brand × --brand-fg) ペアが本文 AA を満たす
 * ことを WCAG 式で検算し、(B) ベタ塗り --brand を敷く highlight 消費側が --brand-fg を
 * 参照していること（--accent-fg へ巻き戻していないこと）を静的検査でロックする。
 * 将来トークンや結線を動かしたら気づけるようにする。
 */

const here = dirname(fileURLToPath(import.meta.url))
const srcDir = resolve(here, '..')

function readSrc(relPath: string): string {
  return readFileSync(resolve(srcDir, relPath), 'utf8')
}

const AA_BODY = 4.5

/**
 * 各テーマの --brand / --brand-fg の確定 hex。
 * tokens.css の各テーマブロックの実値（コメントの算定根拠と一致）。
 * テストはこの期待値が tokens.css に実在することも assert するので、
 * トークンを動かしたら下のペア表と tokens.css の双方を更新する必要がある。
 */
const PAIRS: ReadonlyArray<{ theme: string; brand: string; brandFg: string }> = [
  { theme: 'light/default', brand: '#2E45A8', brandFg: '#FFFFFF' },
  { theme: 'sepia', brand: '#A8542F', brandFg: '#FFFFFF' },
  { theme: 'forest', brand: '#6FB89A', brandFg: '#0B1813' },
  { theme: 'indigo', brand: '#8FA9D6', brandFg: '#0F1622' },
  { theme: 'rose', brand: '#8E4054', brandFg: '#FFFFFF' },
  { theme: 'slate', brand: '#2E565A', brandFg: '#FFFFFF' },
  { theme: 'v3-dark', brand: '#6C8EF5', brandFg: '#0D1220' },
  { theme: 'legacy-dark', brand: '#6C8EF5', brandFg: '#0D1220' },
]

describe('T-U: selection/active ハイライト (--brand 塗り × --brand-fg 文字) は本文 AA を満たす', () => {
  for (const { theme, brand, brandFg } of PAIRS) {
    it(`${theme}: ${brandFg} on ${brand} >= ${AA_BODY}:1`, () => {
      const ratio = contrastRatio(brandFg, brand)
      expect(ratio).toBeGreaterThanOrEqual(AA_BODY)
    })
  }

  it('回帰の番人: 白文字を明るい青 --brand(#6C8EF5) に直接乗せると本文 AA 未達であること（=なぜ --brand-fg を分離したか）', () => {
    // dark の --brand に白を乗せた旧実装は 3.08:1。これが 4.5 未満であることを固定し、
    // 「白に戻す」変更が AA を割ることを明示する。
    expect(contrastRatio('#FFFFFF', '#6C8EF5')).toBeLessThan(AA_BODY)
  })
})

describe('T-U: tokens.css に --brand-fg が全テーマで定義されている', () => {
  const css = readSrc('styles/tokens.css')

  it(':root に --brand-fg トークンが存在する', () => {
    expect(css).toMatch(/--brand-fg:\s*#FFFFFF/)
  })

  for (const { theme, brandFg } of PAIRS) {
    it(`${theme} 相当の --brand-fg 値 ${brandFg} が tokens.css に存在する`, () => {
      // 値ごとの存在チェック（テーマブロック特定までは静的には厳密にできないが、
      // 期待 hex が消えたら検知できる）。
      const re = new RegExp(`--brand-fg:\\s*${brandFg}`, 'i')
      expect(css).toMatch(re)
    })
  }

  it('dark 系の --brand-fg は濃紺 #0D1220（白へ巻き戻していない）', () => {
    expect(css).toMatch(/--brand-fg:\s*#0D1220/)
  })
})

describe('T-U: ベタ塗り --brand を敷く highlight 消費側は --brand-fg を参照する（--accent-fg へ巻き戻さない）', () => {
  // 各ファイルで「background: var(--brand) を伴う active/CTA の文字色が --brand-fg」を確認する。
  // --accent-fg は applyTheme の inline 上書きで --brand 塗り上の AA を保証しないため、
  // これらの行が --accent-fg に戻っていないことを回帰ロックする。
  it('SavedItemsScreen: brand 塗りの選択中ピル文字は --brand-fg（3 箇所すべて）', () => {
    const src = readSrc('screens/SavedItemsScreen.tsx')
    const matches = src.match(/color: active \? 'var\(--brand-fg\)' : 'var\(--text-secondary\)'/g) ?? []
    expect(matches.length).toBe(3)
    // 巻き戻り検知: brand 塗りの active 行に --accent-fg が残っていない
    expect(src).not.toMatch(/color: active \? 'var\(--accent-fg\)' : 'var\(--text-secondary\)'/)
  })

  it('journal.css: --brand ベタ塗り (summarize / goal-work active) は --brand-fg', () => {
    const css = readSrc('components/journal/journal.css')
    // .journal-summarize-btn は background: var(--brand)
    expect(css).toMatch(/background: var\(--brand\);\s*\n\s*\/\*[\s\S]*?\*\/\s*\n\s*color: var\(--brand-fg\)/)
    // goal-cat-work active (= var(--brand) alias) は --brand-fg
    expect(css).toMatch(/color: var\(--brand-fg, #fff\)/)
  })

  it('LevelUpModal: brand 塗りボタン文字は --brand-fg', () => {
    const src = readSrc('components/LevelUpModal.tsx')
    expect(src).toMatch(/background: 'var\(--brand\)',\s*\n\s*color: 'var\(--brand-fg, #fff\)'/)
  })

  it('CustomCourseSheet: brand 塗り生成ボタン文字は --brand-fg', () => {
    const src = readSrc('components/CustomCourseSheet.tsx')
    expect(src).toMatch(/'var\(--brand\)'[\s\S]{0,80}?color: prompt\.trim\(\) \? 'var\(--brand-fg\)'/)
  })

  it('AppV3: brand 塗り名前確定ボタン文字は --brand-fg', () => {
    const src = readSrc('AppV3.tsx')
    expect(src).toMatch(/color: nameInput\.trim\(\) \? 'var\(--brand-fg\)'/)
  })
})
