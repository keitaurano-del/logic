#!/usr/bin/env node
// Logic ロゴを背景 #1A1F2E に乗せた splash.png を Capacitor Android の全密度向けに生成する。
// 既存の Capacitor デフォルト「X」を Logic ブランドに差し替える。
//
// usage: node scripts/generate-splash.mjs

import sharp from 'sharp'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO = path.resolve(__dirname, '..')

const BG = '#1A1F2E' // capacitor.config.ts の SURFACE と同じ
const LOGO_SVG_PATH = path.join(REPO, 'public/app-icon.svg')

// Capacitor Android の標準 splash サイズ
const SIZES = [
  { dir: 'drawable',                w: 480,  h: 320 },
  { dir: 'drawable-land-mdpi',      w: 480,  h: 320 },
  { dir: 'drawable-land-hdpi',      w: 800,  h: 480 },
  { dir: 'drawable-land-xhdpi',     w: 1280, h: 720 },
  { dir: 'drawable-land-xxhdpi',    w: 1600, h: 960 },
  { dir: 'drawable-land-xxxhdpi',   w: 1920, h: 1280 },
  { dir: 'drawable-port-mdpi',      w: 320,  h: 480 },
  { dir: 'drawable-port-hdpi',      w: 480,  h: 800 },
  { dir: 'drawable-port-xhdpi',     w: 720,  h: 1280 },
  { dir: 'drawable-port-xxhdpi',    w: 960,  h: 1600 },
  { dir: 'drawable-port-xxxhdpi',   w: 1280, h: 1920 },
]

const RES_BASE = path.join(REPO, 'android/app/src/main/res')

async function main() {
  const logoSvg = await fs.readFile(LOGO_SVG_PATH)

  for (const { dir, w, h } of SIZES) {
    const short = Math.min(w, h)
    // ロゴはキャンバスの短辺の 28% 程度（BootLoadingScreen の 120px ≒ ビューポート短辺の 30% 弱と整合）
    const logoSize = Math.round(short * 0.28)
    const logoPng = await sharp(logoSvg, { density: 384 })
      .resize(logoSize, logoSize, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer()

    const left = Math.round((w - logoSize) / 2)
    const top = Math.round((h - logoSize) / 2)

    const outPath = path.join(RES_BASE, dir, 'splash.png')
    await sharp({
      create: {
        width: w,
        height: h,
        channels: 3,
        background: BG,
      },
    })
      .composite([{ input: logoPng, left, top }])
      .png()
      .toFile(outPath)

    console.log(`✓ ${dir}/splash.png  ${w}x${h}  logo=${logoSize}px`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
