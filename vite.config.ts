import { defineConfig } from 'vite'
import type { Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import { readdirSync, rmSync, statSync } from 'node:fs'
import { join } from 'node:path'
import pkg from './package.json'

// AF-06: フラグ ON(リモートアセット有効)時に、Storage 配信に切り替えた重量 PNG を
// ビルド成果物(dist/images/v3/**)から物理的に除外する。Vite は public/ を無変換
// コピーするため、参照を resolveAssetUrl でリモートに切り替えても dist には PNG が
// 残り、Capacitor の webDir=dist 経由で AAB に同梱され続ける。これを断つことで
// 初めて実 DL サイズが減る。
//
// 対象は PNG のみ(resolveAssetUrl と同じ条件)。.webp/.svg は同梱維持。
// フラグ OFF(デフォルト)では何もしない = dist は従来どおり全 PNG を含む(挙動不変)。
function isRemoteAssetsBuild(): boolean {
  const raw = String(process.env.VITE_REMOTE_LESSON_ASSETS ?? '').trim().toLowerCase()
  const enabled = raw === 'on' || raw === 'true' || raw === '1' || raw === 'yes'
  const baseUrl = String(process.env.VITE_LESSON_ASSET_BASE_URL ?? '').trim()
  return enabled && baseUrl.length > 0
}

function stripRemotePngFromDist(): Plugin {
  return {
    name: 'af06-strip-remote-png',
    apply: 'build',
    closeBundle() {
      if (!isRemoteAssetsBuild()) return
      const root = join(process.cwd(), 'dist', 'images', 'v3')
      let removed = 0
      let bytes = 0
      const walk = (dir: string) => {
        let entries: string[]
        try {
          entries = readdirSync(dir)
        } catch {
          return
        }
        for (const name of entries) {
          const full = join(dir, name)
          const st = statSync(full)
          if (st.isDirectory()) {
            walk(full)
          } else if (name.toLowerCase().endsWith('.png')) {
            bytes += st.size
            rmSync(full)
            removed++
          }
        }
      }
      walk(root)
      console.log(
        `[af06] remote assets ON: stripped ${removed} PNG (${(bytes / 1048576).toFixed(1)} MB) from dist/images/v3`,
      )
    },
  }
}

// DF-F21: フィードバックの app_version 用フォールバックを必ずビルドへ焼き込む。
// 優先順位: 明示注入 VITE_APP_VERSION（CI / Render の build env）> package.json
// version + デプロイ環境が提供する commit SHA（Render: RENDER_GIT_COMMIT /
// Vercel: VERCEL_GIT_COMMIT_SHA）。VITE_APP_VERSION 未設定でも 'unknown' には
// ならず、最低でも `web-<pkg version>` まで埋まる。FeedbackScreen 側で
// import.meta.env.VITE_APP_VERSION → __APP_VERSION_FALLBACK__ の順に解決する。
function resolveAppVersionFallback(): string {
  const sha = process.env.RENDER_GIT_COMMIT || process.env.VERCEL_GIT_COMMIT_SHA || ''
  const shortSha = sha ? sha.slice(0, 7) : ''
  const base = `web-${pkg.version}`
  return shortSha ? `${base}+${shortSha}` : base
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), stripRemotePngFromDist()],
  define: {
    __APP_VERSION_FALLBACK__: JSON.stringify(resolveAppVersionFallback()),
  },
  server: {
    host: true,
  },
  build: {
    chunkSizeWarningLimit: 350,
    rollupOptions: {
      output: {
        manualChunks(id) {
          // node_modules を vendor 別 chunk に分離 (cache hit rate 改善)
          if (id.includes('node_modules')) {
            if (id.includes('@capacitor')) return 'vendor-capacitor'
            if (id.includes('@supabase')) return 'vendor-supabase'
            if (id.includes('@sentry')) return 'vendor-sentry'
            if (id.includes('react-dom') || /node_modules\/react\//.test(id)) return 'vendor-react'
          }
          // lessonData をカテゴリ別に分離 (各 ~30-70KB)。
          // allLessons が静的 import で集約しているため初回ロードでまとめて
          // fetch されるが、複数並列 + cache friendly になる。
          if (id.includes('/src/') && /Lessons(?:En)?\.ts$/.test(id)) {
            const m = id.match(/\/src\/(\w+?)Lessons(?:En)?\.ts$/)
            if (m) return `lessons-${m[1].toLowerCase()}`
          }
        },
      },
    },
  },
})
