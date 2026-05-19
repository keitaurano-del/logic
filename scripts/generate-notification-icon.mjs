#!/usr/bin/env node
// Android status bar small icon (`ic_stat_icon.png`) を全密度向けに生成する。
// Android 5+ では small icon は白いシルエット + 透明背景しか使えない。
// （他の色は OS が一律で白にマスクするため。背景円のティントは
//  capacitor.config.ts の LocalNotifications.iconColor `#A8C0FF` が当たる。）
//
// usage: node scripts/generate-notification-icon.mjs

import sharp from 'sharp'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO = path.resolve(__dirname, '..')
const RES_BASE = path.join(REPO, 'android/app/src/main/res')

// 24dp ベースの白シルエット SVG。viewBox 内に 10〜15% のセーフエリアを残してある。
// 円の半径と線幅は Logic アイコンと同じ比率を保ちつつ、小サイズでも潰れないよう調整。
const SOURCE_SVG = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24">
  <g fill="#FFFFFF" stroke="#FFFFFF" stroke-linecap="round">
    <line x1="12" y1="7" x2="6.5" y2="17" stroke-width="2.2"/>
    <line x1="12" y1="7" x2="17.5" y2="17" stroke-width="2.2"/>
    <circle cx="12" cy="7" r="3.2"/>
    <circle cx="6.5" cy="17" r="3.2"/>
    <circle cx="17.5" cy="17" r="3.2"/>
  </g>
</svg>
`

// Android 標準の status bar icon サイズ
const SIZES = [
  { dir: 'drawable-mdpi',    px: 24 },
  { dir: 'drawable-hdpi',    px: 36 },
  { dir: 'drawable-xhdpi',   px: 48 },
  { dir: 'drawable-xxhdpi',  px: 72 },
  { dir: 'drawable-xxxhdpi', px: 96 },
]

async function main() {
  const svgBuf = Buffer.from(SOURCE_SVG)

  for (const { dir, px } of SIZES) {
    const outDir = path.join(RES_BASE, dir)
    await fs.mkdir(outDir, { recursive: true })
    const outPath = path.join(outDir, 'ic_stat_icon.png')

    await sharp(svgBuf, { density: 384 })
      .resize(px, px, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toFile(outPath)

    console.log(`✓ ${dir}/ic_stat_icon.png  ${px}x${px}`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
