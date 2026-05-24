/**
 * Generate the 34 new Lv 101-500 badge tiers via Gemini Nano Banana.
 *
 * Output: public/images/v3/badges/badge-<key>.png  (direct production location)
 *         tmp/badges/v1/badge-<key>.png  (working copy for retry / archive)
 *
 * Usage:
 *   npx tsx scripts/generate-badge-set-v1.ts                  # all 34
 *   npx tsx scripts/generate-badge-set-v1.ts --only=apex-2    # one by key
 *   npx tsx scripts/generate-badge-set-v1.ts --force          # overwrite existing
 *
 * By default, tiers whose target PNG already exists are skipped (resume mode).
 */

import { writeFile, mkdir, readFile, copyFile, stat } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { BADGE_TIERS_V1, buildPromptForV1, type BadgeTierV1 } from './badgePromptsV1.js'

async function loadEnv(): Promise<Record<string, string>> {
  const envPath = resolve(process.cwd(), '.env')
  const text = await readFile(envPath, 'utf-8')
  const env: Record<string, string> = {}
  for (const line of text.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq < 0) continue
    env[trimmed.slice(0, eq).trim()] = trimmed.slice(eq + 1).trim()
  }
  return env
}

type GenResult = { ok: true; bytes: Buffer } | { ok: false; error: string }

async function generate(prompt: string, apiKey: string, model: string): Promise<GenResult> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: { responseModalities: ['IMAGE', 'TEXT'] },
  }
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const errText = await res.text().catch(() => '')
    return { ok: false, error: `HTTP ${res.status}: ${errText.slice(0, 800)}` }
  }
  const json = (await res.json()) as Record<string, unknown>
  const cands = (json as { candidates?: { content?: { parts?: { inlineData?: { data?: string } }[] } }[] }).candidates
  const inline = cands?.[0]?.content?.parts?.find((p) => p.inlineData?.data)?.inlineData
  if (!inline?.data) return { ok: false, error: `no image: ${JSON.stringify(json).slice(0, 400)}` }
  return { ok: true, bytes: Buffer.from(inline.data, 'base64') }
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await stat(path)
    return true
  } catch {
    return false
  }
}

async function main() {
  const env = await loadEnv()
  const apiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY
  if (!apiKey) {
    console.error('GEMINI_API_KEY not found in .env or environment')
    process.exit(1)
  }

  const onlyArg = process.argv.find((a) => a.startsWith('--only='))
  const onlyKey = onlyArg ? onlyArg.slice('--only='.length) : null
  const force = process.argv.includes('--force')

  const tiers: BadgeTierV1[] = onlyKey
    ? BADGE_TIERS_V1.filter((t) => t.key === onlyKey)
    : BADGE_TIERS_V1

  if (tiers.length === 0) {
    console.error(`No tier matched --only=${onlyKey}`)
    process.exit(1)
  }

  const here = dirname(fileURLToPath(import.meta.url))
  const tmpDir = resolve(here, '..', 'tmp', 'badges', 'v1')
  const publicDir = resolve(here, '..', 'public', 'images', 'v3', 'badges')
  await mkdir(tmpDir, { recursive: true })
  await mkdir(publicDir, { recursive: true })

  console.log(`[gen-v1] generating ${tiers.length} badge(s)... force=${force}`)
  let okCount = 0
  let failCount = 0
  let skipCount = 0
  const failures: string[] = []

  for (const tier of tiers) {
    const publicPath = resolve(publicDir, `badge-${tier.key}.png`)
    const tmpPath = resolve(tmpDir, `badge-${tier.key}.png`)

    if (!force && (await fileExists(publicPath))) {
      console.log(`[gen-v1] ${tier.key} — SKIP (exists)`)
      skipCount++
      continue
    }

    const prompt = buildPromptForV1(tier)
    let attempt = 0
    let success = false
    const maxAttempts = 3

    while (attempt < maxAttempts && !success) {
      attempt++
      process.stdout.write(`[gen-v1] ${tier.key} (Lv${tier.minLevel}-${tier.maxLevel}, ${tier.titleJa}) try${attempt}... `)
      const r = await generate(prompt, apiKey, 'gemini-2.5-flash-image')
      if (!r.ok) {
        console.log(`FAIL: ${r.error.slice(0, 160)}`)
        if (attempt < maxAttempts) {
          await new Promise((res) => setTimeout(res, 3000))
          continue
        }
        failures.push(tier.key)
        failCount++
        break
      }
      await writeFile(tmpPath, r.bytes)
      await copyFile(tmpPath, publicPath)
      console.log(`ok (${(r.bytes.length / 1024).toFixed(0)} KB)`)
      okCount++
      success = true
      // pace requests
      await new Promise((res) => setTimeout(res, 1500))
    }
  }

  console.log(`\n[gen-v1] done — ${okCount} ok / ${failCount} fail / ${skipCount} skip`)
  if (failures.length > 0) {
    console.log(`[gen-v1] failed keys: ${failures.join(', ')}`)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
