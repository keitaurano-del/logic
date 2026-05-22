#!/usr/bin/env node
// Capacitor Android の Splash 画面用 PNG を「ロゴ無しの #1A1F2E 単色」で全密度向けに生成する。
// 以前はランチャーアイコンを中央に乗せていたが、Splash → BootLoadingScreen 遷移で
// 形が変わる違和感を避けるため、Splash 画面そのものをスキップ扱いにする方針に変更。
// OS の起動中アクティビティで一瞬表示される可能性があるため、ロゴは載せず背景色のみにする。
//
// usage: node scripts/generate-splash.mjs

import sharp from 'sharp'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const REPO = path.resolve(__dirname, '..')

const BG = '#1A1F2E' // capacitor.config.ts の SURFACE と同じ

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
  for (const { dir, w, h } of SIZES) {
    const outPath = path.join(RES_BASE, dir, 'splash.png')
    await sharp({
      create: {
        width: w,
        height: h,
        channels: 3,
        background: BG,
      },
    })
      .png()
      .toFile(outPath)

    console.log(`✓ ${dir}/splash.png  ${w}x${h}  (solid ${BG})`)
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
