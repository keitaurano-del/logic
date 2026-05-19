/**
 * Take an iPhone-sized screenshot of the lesson list preview HTML
 * so Keita can see how the new sample thumbnail looks alongside the
 * existing thumbnails at phone scale.
 *
 * Usage: npx tsx scripts/screenshot-lesson-preview.ts
 */
import { chromium, devices } from 'playwright'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

async function main() {
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = dirname(__filename)
  const repoRoot = resolve(__dirname, '..')
  const htmlPath = resolve(repoRoot, 'tmp', 'lesson-list-preview.html')
  const outPath = resolve(repoRoot, 'tmp', 'lesson-list-preview-iphone.png')

  const browser = await chromium.launch()
  const context = await browser.newContext({
    ...devices['iPhone 13'],
    deviceScaleFactor: 2,
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
