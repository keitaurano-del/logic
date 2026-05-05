import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
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
