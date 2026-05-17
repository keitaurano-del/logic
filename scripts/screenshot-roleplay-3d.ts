import { chromium, devices } from '@playwright/test'

async function main() {
  const browser = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
  })
  const ctx = await browser.newContext({
    ...devices['Pixel 5'],
  })
  const page = await ctx.newPage()

  // 新規インストール検知の短絡 + onboarded
  await page.addInitScript(() => {
    localStorage.setItem('logic-install-id', 'e2e-fixed-id')
    localStorage.setItem('logic-onboarded', '1')
    localStorage.setItem('logic-locale', 'ja')
    localStorage.setItem('logic-tutorial-home-done', '1')
    localStorage.setItem('logic-tutorial-lessons-done', '1')
    localStorage.setItem('logic-tutorial-roleplay-done', '1')
  })

  // /api/** を stub
  await page.route(/\/api\/.+/, async (route) => {
    const url = route.request().url()
    if (url.includes('/api/roleplay/turn')) {
      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          partner: 'David だ。今忙しいから3分でまとめてくれ。プロジェクトの状況はどうなってる？',
          choices: [
            '結論からお伝えします。今月末のリリースは予定通り完了できる見込みです。',
            'えっと、いくつか課題があって、その一つが……',
            '先週から対応を進めていまして、現在の進捗は70%です。',
          ],
        }),
      })
    }
    return route.fulfill({ status: 200, contentType: 'application/json', body: '{}' })
  })

  const variants = [
    { id: 'why-so-report', label: 'david' },
    { id: 'pyramid-client', label: 'carter' },
    { id: 'logic-tree-sub', label: 'alex' },
    { id: 'mece-meeting', label: 'team' },
    { id: 'socrates-dialog', label: 'socrates' },
    { id: 'descartes-doubt', label: 'descartes' },
    { id: 'nietzsche-values', label: 'nietzsche' },
  ]
  for (const v of variants) {
    await page.goto(`http://localhost:5173/?preview=roleplay-chat&id=${v.id}`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(5500)
    const out = `/tmp/roleplay-3d-${v.label}.png`
    await page.screenshot({ path: out, fullPage: false })
    console.log(`Saved ${v.label}: ${out}`)
  }

  await browser.close()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
