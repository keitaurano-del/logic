/**
 * scripts/convert-png-to-webp.ts
 *
 * public/images/v3/ 以下の全 PNG を WebP に変換する。
 * 変換後は同ディレクトリに同名の .webp を生成し、元 PNG を削除する。
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
const ROOT = join(__dirname, '..', 'public', 'images', 'v3')
const QUALITY = 85
const DRY_RUN = process.argv.includes('--dry-run')

async function collectPngs(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true })
  const results: string[] = []
  for (const entry of entries) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) {
      results.push(...(await collectPngs(full)))
    } else if (entry.isFile() && extname(entry.name).toLowerCase() === '.png') {
      results.push(full)
    }
  }
  return results
}

async function main() {
  const pngs = await collectPngs(ROOT)
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
