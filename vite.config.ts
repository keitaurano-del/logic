import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import pkg from './package.json'

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
  plugins: [react()],
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
