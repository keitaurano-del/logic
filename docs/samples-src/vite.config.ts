import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// GitHub Pages: served from /logic/samples/
export default defineConfig({
  plugins: [react()],
  base: '/logic/samples/',
  build: {
    outDir: fileURLToPath(new URL('../samples', import.meta.url)),
    emptyOutDir: true,
    target: 'es2020',
  },
})
