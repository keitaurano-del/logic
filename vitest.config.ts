import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// Unit test 用設定。
// - jsdom 環境で localStorage / sessionStorage / DOM API を自然に動かす
// - setupFiles で @testing-library/jest-dom と Capacitor のスタブを読み込む
// - e2e (Playwright) は別の e2e/ ディレクトリで動かしているので exclude
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}', 'server/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['node_modules/**', 'dist/**', 'e2e/**', 'android/**', 'ios/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary', 'json'],
      include: [
        'src/stats.ts',
        'src/db/completionCountDb.ts',
        'src/screens/homeHelpers.ts',
        'src/screens/lessonNames.ts',
        'src/featureFlags.ts',
        'src/lessonSlides.ts',
        'src/components/CompletionBadge.tsx',
      ],
    },
  },
})
