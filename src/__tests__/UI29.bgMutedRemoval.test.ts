import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * UI-29「DailyFermiScreen の未定義 CSS 変数 var(--bg-muted) 除去」回帰ロック。
 *
 * 背景: DailyFermiScreen.tsx の電卓挿入ボタンと AI チャット送信ボタンの disabled 背景に
 * `var(--bg-muted)` が使われていたが、--bg-muted は src/styles/ のどこにも定義されておらず
 * disabled 背景が無効値に解決していた。UI-27 で submit ボタンを --bg-tertiary に直したのと
 * 同じ要領で、両方を全テーマ定義済みの `var(--bg-tertiary)` に置換した。
 *
 * 方式: visualPropsIntegrity.test.ts / UI28.fontSizeSeparation.test.ts と同じく、
 * レンダリングせず fs でソースを読み、文字列の「不在/存在」を assert する。
 */

const here = dirname(fileURLToPath(import.meta.url))
const srcDir = resolve(here, '..')

function readSrc(relPath: string): string {
  return readFileSync(resolve(srcDir, relPath), 'utf8')
}

describe('UI-29 var(--bg-muted) 除去 回帰ロック', () => {
  const src = readSrc('screens/DailyFermiScreen.tsx')

  it('未定義 CSS 変数 --bg-muted を含まない（0 occurrences）', () => {
    const matches = src.match(/--bg-muted/g) ?? []
    expect(matches.length).toBe(0)
  })

  it('disabled 背景に定義済みの var(--bg-tertiary) を使う（最低 2 箇所）', () => {
    const matches = src.match(/var\(--bg-tertiary\)/g) ?? []
    expect(matches.length).toBeGreaterThanOrEqual(2)
  })
})
