/**
 * 一括ペースト用のプロンプトを 1 つの大きなテキストにまとめて出力する。
 *
 * 使い方:
 *   npx tsx scripts/print-batch-prompt.ts            # 標準出力
 *   npx tsx scripts/print-batch-prompt.ts --write    # docs/BATCH_PROMPT.txt に保存
 */

import { writeFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  STYLE_SUFFIX,
  COURSE_PROMPTS,
  LESSON_PROMPTS,
} from './imagePrompts.ts'

function render(): string {
  const out: string[] = []
  out.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  out.push('画像生成バッチ依頼')
  out.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  out.push('')
  out.push('以下のリストを上から順番に、1 件ずつ画像生成してください。')
  out.push('各画像の生成時は必ず:')
  out.push('  - 共通スタイル（下記）を完全に守る')
  out.push('  - 16:9 のアスペクト比')
  out.push('  - 文字・ロゴ・透かし・数字を一切含めない')
  out.push('  - 出力時に「ファイル名: xxx.png」と一行添える')
  out.push('  - 一回のメッセージで 1 枚ずつ生成 (ペースを守って続けてください)')
  out.push('')
  out.push('完成後、このチャット内のすべての画像を順次保存します。')
  out.push('')
  out.push('━━━ 共通スタイル（全画像共通） ━━━')
  out.push('')
  out.push(STYLE_SUFFIX)
  out.push('')
  out.push(`━━━ コース ${COURSE_PROMPTS.length}枚 ━━━`)
  out.push('')
  let n = 1
  for (const e of COURSE_PROMPTS) {
    out.push(`${String(n).padStart(2, '0')}. ファイル名: ${e.filename}`)
    out.push(`    題材: ${e.title}`)
    out.push(`    プロンプト: ${e.prompt}`)
    out.push('')
    n++
  }
  out.push(`━━━ レッスン ${LESSON_PROMPTS.length}枚 ━━━`)
  out.push('')
  for (const e of LESSON_PROMPTS) {
    out.push(`${String(n).padStart(2, '0')}. ファイル名: ${e.filename}`)
    out.push(`    題材: ${e.title}`)
    out.push(`    プロンプト: ${e.prompt}`)
    out.push('')
    n++
  }
  out.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  out.push(`合計 ${COURSE_PROMPTS.length + LESSON_PROMPTS.length} 枚。準備ができたら 1 番から順に生成を始めてください。`)
  out.push('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  return out.join('\n')
}

async function main() {
  const text = render()
  const write = process.argv.includes('--write')
  if (write) {
    const __filename = fileURLToPath(import.meta.url)
    const __dirname = dirname(__filename)
    const repoRoot = resolve(__dirname, '..')
    const out = resolve(repoRoot, 'docs/BATCH_PROMPT.txt')
    await writeFile(out, text)
    console.log(`written ${out} (${text.length} bytes)`)
  } else {
    process.stdout.write(text)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
