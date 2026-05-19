/**
 * Take a full-page screenshot of the lesson grid preview HTML
 * to share with Keita for batch QA.
 */
import { chromium } from 'playwright'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

async function main() {
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = dirname(__filename)
  const repoRoot = resolve(__dirname, '..')
  const htmlPath = resolve(repoRoot, 'tmp', 'lesson-grid-preview.html')
  const outPath = resolve(repoRoot, 'tmp', 'lesson-grid-preview.png')

  const browser = await chromium.launch()
  const context = await browser.newContext({
    viewport: { width: 1000, height: 1200 },
    deviceScaleFactor: 1.5,
  })
  const page = await context.newPage()
  await page.goto(`file://${htmlPath}`)
  await page.waitForLoadState('networkidle')
  await page.screenshot({ path: outPath, fullPage: true })
  await browser.close()

  console.log(`[ok] wrote ${outPath}`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
