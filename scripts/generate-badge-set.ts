/**
 * Generate all 16 title badges via Gemini Nano Banana.
 *
 * Usage:
 *   npx tsx scripts/generate-badge-set.ts                  # all 16
 *   npx tsx scripts/generate-badge-set.ts --only=master    # one tier by key
 *
 * Output: tmp/badges/badge-<key>.png  AND  docs/badges-preview/badge-<key>.png
 */

import { writeFile, mkdir, readFile, copyFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { BADGE_TIERS, buildPromptFor, type BadgeTier } from './badgePrompts.js'

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

async function main() {
  const env = await loadEnv()
  const apiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY
  if (!apiKey) {
    console.error('GEMINI_API_KEY not found')
    process.exit(1)
  }

  const onlyArg = process.argv.find((a) => a.startsWith('--only='))
  const onlyKey = onlyArg ? onlyArg.slice('--only='.length) : null

  const tiers: BadgeTier[] = onlyKey
    ? BADGE_TIERS.filter((t) => t.key === onlyKey)
    : BADGE_TIERS

  if (tiers.length === 0) {
    console.error(`No tier matched --only=${onlyKey}`)
    process.exit(1)
  }

  const here = dirname(fileURLToPath(import.meta.url))
  const tmpDir = resolve(here, '..', 'tmp', 'badges')
  const previewDir = resolve(here, '..', 'docs', 'badges-preview')
  await mkdir(tmpDir, { recursive: true })
  await mkdir(previewDir, { recursive: true })

  console.log(`[gen] generating ${tiers.length} badge(s)...`)
  let okCount = 0
  let failCount = 0

  for (const tier of tiers) {
    const prompt = buildPromptFor(tier)
    process.stdout.write(`[gen] ${tier.key} (Lv${tier.minLevel}-${tier.maxLevel}, ${tier.titleJa})... `)
    const r = await generate(prompt, apiKey, 'gemini-2.5-flash-image')
    if (!r.ok) {
      console.log(`FAIL: ${r.error.slice(0, 200)}`)
      failCount++
      continue
    }
    const tmpPath = resolve(tmpDir, `badge-${tier.key}.png`)
    const previewPath = resolve(previewDir, `badge-${tier.key}.png`)
    await writeFile(tmpPath, r.bytes)
    await copyFile(tmpPath, previewPath)
    console.log(`ok (${(r.bytes.length / 1024).toFixed(0)} KB)`)
    okCount++
    // Small pause so we don't trip rate limit
    await new Promise((res) => setTimeout(res, 1500))
  }

  console.log(`\n[gen] done — ${okCount} ok / ${failCount} fail`)
}

main().catch((e) => { console.error(e); process.exit(1) })
