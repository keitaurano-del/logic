/**
 * scripts/convert-png-to-webp.ts
 *
 * アプリに同梱される public/ 配下の大きい PNG を WebP に変換する。
 * 変換後は同ディレクトリに同名の .webp を生成し、元 PNG を削除する。
 *
 * 変換対象（ROOTS）:
 *   - public/images/v3/         レッスン/サムネ画像（af06 で初回変換）
 *   - public/ranks/             ランク PNG（perf/app-size-reduction で追加）
 *   - public/review-pyramid.png / review-mece.png 図解 PNG（同上）
 *
 * 実行:
 *   npx tsx scripts/convert-png-to-webp.ts
 *
 * オプション:
 *   --dry-run  変換せずに対象ファイルをリストアップのみ
 */

import sharp from 'sharp'
import { readdir, stat, rm } from 'fs/promises'
import { join, dirname, basename, extname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PUBLIC = join(__dirname, '..', 'public')
// 変換対象（ディレクトリは再帰、ファイルは単体）
const ROOTS = [
  join(PUBLIC, 'images', 'v3'),
  join(PUBLIC, 'ranks'),
  join(PUBLIC, 'review-pyramid.png'),
  join(PUBLIC, 'review-mece.png'),
]
const QUALITY = 80
const DRY_RUN = process.argv.includes('--dry-run')

async function collectPngs(target: string): Promise<string[]> {
  let st
  try {
    st = await stat(target)
  } catch {
    return [] // 既に変換済み等で存在しない場合はスキップ
  }
  if (st.isFile()) {
    return extname(target).toLowerCase() === '.png' ? [target] : []
  }
  const entries = await readdir(target, { withFileTypes: true })
  const results: string[] = []
  for (const entry of entries) {
    const full = join(target, entry.name)
    if (entry.isDirectory()) {
      results.push(...(await collectPngs(full)))
    } else if (entry.isFile() && extname(entry.name).toLowerCase() === '.png') {
      results.push(full)
    }
  }
  return results
}

async function main() {
  const pngs: string[] = []
  for (const root of ROOTS) {
    pngs.push(...(await collectPngs(root)))
  }
  console.log(`\n対象 PNG: ${pngs.length} ファイル`)

  if (DRY_RUN) {
    pngs.forEach(p => console.log(' ', p))
    return
  }

  let converted = 0
  let skipped = 0
  let totalPngBytes = 0
  let totalWebpBytes = 0

  for (const pngPath of pngs) {
    const webpPath = pngPath.replace(/\.png$/i, '.webp')
    const pngStat = await stat(pngPath)
    totalPngBytes += pngStat.size

    try {
      await sharp(pngPath)
        .webp({ quality: QUALITY, lossless: false })
        .toFile(webpPath)

      const webpStat = await stat(webpPath)
      totalWebpBytes += webpStat.size

      const reduction = (((pngStat.size - webpStat.size) / pngStat.size) * 100).toFixed(1)
      console.log(`  ${basename(pngPath)} → ${basename(webpPath)} (${(pngStat.size / 1024).toFixed(0)}KB → ${(webpStat.size / 1024).toFixed(0)}KB, -${reduction}%)`)

      // 変換成功したら元 PNG を削除
      await rm(pngPath)
      converted++
    } catch (err) {
      console.error(`  [ERROR] ${pngPath}:`, err)
      skipped++
    }
  }

  const totalPngMB = (totalPngBytes / 1024 / 1024).toFixed(1)
  const totalWebpMB = (totalWebpBytes / 1024 / 1024).toFixed(1)
  const totalReduction = (((totalPngBytes - totalWebpBytes) / totalPngBytes) * 100).toFixed(1)

  console.log(`\n変換完了: ${converted} ファイル / スキップ: ${skipped} ファイル`)
  console.log(`変換前合計: ${totalPngMB} MB`)
  console.log(`変換後合計: ${totalWebpMB} MB`)
  console.log(`削減率: ${totalReduction}%`)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
