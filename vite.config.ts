import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
  },
  build: {
    // lessonData の集約 import で 1 chunk が ~550kB になるため。
    // 個別レッスンの lazy 化は別 PR で。
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@capacitor')) return 'vendor-capacitor'
            if (id.includes('@supabase')) return 'vendor-supabase'
            if (id.includes('@sentry')) return 'vendor-sentry'
            if (id.includes('react-dom') || /node_modules\/react\//.test(id)) return 'vendor-react'
          }
        },
      },
    },
  },
})
