/**
 * imagePrompts.ts から docs/IMAGE_GENERATION.md を再生成する。
 *
 * 使い方:
 *   npx tsx scripts/print-prompts-md.ts            # 標準出力に書く
 *   npx tsx scripts/print-prompts-md.ts --write    # docs/IMAGE_GENERATION.md に書き出し
 */

import { writeFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  STYLE_SUFFIX,
  COURSE_PROMPTS,
  LESSON_PROMPTS,
  type ImagePromptEntry,
} from './imagePrompts.ts'

function renderEntry(kind: 'コース' | 'レッスン', e: ImagePromptEntry): string {
  return [
    `### ${e.id} — ${e.title}`,
    `**保存先**: \`public/images/v3/${e.filename}\`  `,
    `**種別**: ${kind}`,
    '',
    '```text',
    e.prompt,
    '```',
    '',
  ].join('\n')
}

function render(): string {
  const out: string[] = []
  out.push('# コース・レッスン画像生成ガイド')
  out.push('')
  out.push('Gemini で各コース／レッスンのイラストを生成し、 `public/images/v3/` 以下に')
  out.push('規約のファイル名で保存すれば `npm run wire:images` で自動的に')
  out.push('`courseData.ts` / `lessonSlides.ts` の参照が更新される。')
  out.push('')
  out.push('> このドキュメントは `scripts/imagePrompts.ts` から自動生成されています。')
  out.push('> 編集する場合は `imagePrompts.ts` を直して `npm run prompts:md` を実行してください。')
  out.push('')
  out.push('## 手順')
  out.push('')
  out.push('1. Gemini を開く（推奨: Imagen 4 が使えるモード）')
  out.push('2. 最初に「共通スタイル指示」を一度送る')
  out.push('3. 各コース／レッスンのプロンプトを順次送り、生成された画像を保存先のファイル名でダウンロード')
  out.push('4. `public/images/v3/` 以下に保存')
  out.push('5. リポジトリで `npm run wire:images` を実行 → `courseData.ts` / `lessonSlides.ts` の参照が PNG に切り替わる')
  out.push('')
  out.push('## 共通スタイル指示（最初に Gemini に送る）')
  out.push('')
  out.push('```text')
  out.push('これから複数の画像を生成してもらいます。')
  out.push('全画像とも以下の共通スタイルを必ず守ってください:')
  out.push('')
  out.push(STYLE_SUFFIX)
  out.push('')
  out.push('アスペクト比は 16:9。各回ひとつだけ画像を生成してください。')
  out.push('```')
  out.push('')
  out.push(`## コース (${COURSE_PROMPTS.length}枚)`)
  out.push('')
  out.push('| ID | タイトル | 保存ファイル |')
  out.push('|----|---------|-------------|')
  for (const e of COURSE_PROMPTS) {
    out.push(`| \`${e.id}\` | ${e.title} | \`${e.filename}\` |`)
  }
  out.push('')
  for (const e of COURSE_PROMPTS) {
    out.push(renderEntry('コース', e))
  }
  out.push(`## レッスン (${LESSON_PROMPTS.length}枚)`)
  out.push('')
  out.push('| ID | タイトル | 保存ファイル |')
  out.push('|----|---------|-------------|')
  for (const e of LESSON_PROMPTS) {
    out.push(`| \`${e.id}\` | ${e.title} | \`${e.filename}\` |`)
  }
  out.push('')
  for (const e of LESSON_PROMPTS) {
    out.push(renderEntry('レッスン', e))
  }
  out.push('## 紐付け（自動）')
  out.push('')
  out.push('```bash')
  out.push('# 何が更新されるかプレビュー')
  out.push('npm run wire:images -- --dry-run')
  out.push('')
  out.push('# 実行（src/courseData.ts と src/lessonSlides.ts を書き換え）')
  out.push('npm run wire:images')
  out.push('```')
  out.push('')
  out.push('`public/images/v3/course-{id}.png` または `lesson-{id}.png` が見つかった ID')
  out.push('についてのみ、それぞれの参照を `.png` パスに更新する。')
  out.push('保存していないコース／レッスンの参照は変更されない。')
  out.push('')
  out.push('## 自動 API 経由で一括生成したい場合')
  out.push('')
  out.push('```bash')
  out.push('export GEMINI_API_KEY=AIza...')
  out.push('npm run gen:images -- --target=courses        # コース 24 枚')
  out.push('npm run gen:images -- --target=all            # コース + レッスン 全 ' +
    `${COURSE_PROMPTS.length + LESSON_PROMPTS.length} 枚`)
  out.push('npm run gen:images -- --only=logic-01,fermi-01 # 特定だけ')
  out.push('```')
  out.push('')
  return out.join('\n')
}

async function main() {
  const md = render()
  const write = process.argv.includes('--write')
  if (write) {
    const __filename = fileURLToPath(import.meta.url)
    const __dirname = dirname(__filename)
    const repoRoot = resolve(__dirname, '..')
    const out = resolve(repoRoot, 'docs/IMAGE_GENERATION.md')
    await writeFile(out, md)
    console.log(`written ${out} (${md.length} bytes)`)
  } else {
    process.stdout.write(md)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
