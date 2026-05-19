/**
 * Generate home tile thumbnails (v2 — Caveat-style 16:9 hand-drawn notebook)
 * via Gemini API.
 *
 * Usage:
 *   npx tsx scripts/generate-home-thumbnails-v2.ts                    # all home tiles
 *   npx tsx scripts/generate-home-thumbnails-v2.ts --only=home-roleplay
 *   npx tsx scripts/generate-home-thumbnails-v2.ts --skip-existing
 *   npx tsx scripts/generate-home-thumbnails-v2.ts --model=imagen-4.0-generate-001
 *   npx tsx scripts/generate-home-thumbnails-v2.ts --concurrency=2
 *   npx tsx scripts/generate-home-thumbnails-v2.ts --out=tmp/home-batch
 *
 * Default output: public/images/v3/{slug}.png (overwrites existing).
 * Default model: gemini-2.5-flash-image (Nano Banana).
 */

import { writeFile, mkdir, access, readFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildCoursePrompt } from './careerPromptsV2.ts'
import { HOME_PROMPTS_V2 } from './homePromptsV2.ts'
import type { LessonPromptEntry } from './lessonPromptsV2.ts'

type Args = {
  only: string[] | null
  skipExisting: boolean
  model: string
  concurrency: number
  out: string
}

function parseArgs(argv: string[]): Args {
  const get = (k: string) => argv.find((a) => a.startsWith(`--${k}=`))?.slice(`--${k}=`.length)
  const has = (k: string) => argv.includes(`--${k}`)
  const only = get('only')?.split(',').map((s) => s.trim()).filter(Boolean) ?? null
  return {
    only,
    skipExisting: has('skip-existing'),
    model: get('model') ?? 'gemini-2.5-flash-image',
    concurrency: Number(get('concurrency') ?? 2),
    out: get('out') ?? 'public/images/v3',
  }
}

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
  const isImagen = model.startsWith('imagen-')
  const url = isImagen
    ? `https://generativelanguage.googleapis.com/v1beta/models/${model}:predict?key=${apiKey}`
    : `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

  const body = isImagen
    ? {
        instances: [{ prompt }],
        parameters: { sampleCount: 1, aspectRatio: '16:9', safetyFilterLevel: 'block_only_high' },
      }
    : {
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseModalities: ['IMAGE', 'TEXT'],
          imageConfig: { aspectRatio: '16:9' },
        },
      }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const errText = await res.text().catch(() => '')
    return { ok: false, error: `HTTP ${res.status}: ${errText.slice(0, 400)}` }
  }

  const json = (await res.json()) as Record<string, unknown>

  if (isImagen) {
    const preds = (json as { predictions?: { bytesBase64Encoded?: string }[] }).predictions
    const b64 = preds?.[0]?.bytesBase64Encoded
    if (!b64) return { ok: false, error: `no image: ${JSON.stringify(json).slice(0, 400)}` }
    return { ok: true, bytes: Buffer.from(b64, 'base64') }
  }
  const cands = (json as { candidates?: { content?: { parts?: { inlineData?: { data?: string } }[] } }[] }).candidates
  const inline = cands?.[0]?.content?.parts?.find((p) => p.inlineData?.data)?.inlineData
  if (!inline?.data) return { ok: false, error: `no image: ${JSON.stringify(json).slice(0, 400)}` }
  return { ok: true, bytes: Buffer.from(inline.data, 'base64') }
}

async function runConcurrent<T>(tasks: (() => Promise<T>)[], n: number): Promise<T[]> {
  const results: T[] = new Array(tasks.length)
  let next = 0
  async function worker() {
    while (next < tasks.length) {
      const i = next++
      results[i] = await tasks[i]()
    }
  }
  await Promise.all(Array.from({ length: Math.max(1, n) }, () => worker()))
  return results
}

async function fileExists(path: string): Promise<boolean> {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2))
  const env = await loadEnv()
  const apiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY
  if (!apiKey) {
    console.error('GEMINI_API_KEY not found in .env or environment')
    process.exit(1)
  }

  const __filename = fileURLToPath(import.meta.url)
  const __dirname = dirname(__filename)
  const repoRoot = resolve(__dirname, '..')
  const outDir = resolve(repoRoot, args.out)
  await mkdir(outDir, { recursive: true })

  const allJobs = HOME_PROMPTS_V2.filter(
    (e: LessonPromptEntry) => !args.only || args.only.includes(e.slug),
  )
  if (allJobs.length === 0) {
    console.error('no jobs matched --only filter')
    process.exit(1)
  }

  console.log(`[gen] model=${args.model} concurrency=${args.concurrency} jobs=${allJobs.length} out=${outDir}`)

  let done = 0
  let skipped = 0
  let failed = 0
  const failures: string[] = []

  const tasks = allJobs.map((entry) => async () => {
    const outFile = resolve(outDir, `${entry.slug}.png`)
    if (args.skipExisting && (await fileExists(outFile))) {
      skipped++
      console.log(`[skip] ${entry.slug} (exists)`)
      return
    }
    const prompt = buildCoursePrompt(entry)
    const r = await generate(prompt, apiKey, args.model)
    if (!r.ok) {
      failed++
      failures.push(entry.slug)
      console.error(`[fail] ${entry.slug}: ${r.error}`)
      return
    }
    await writeFile(outFile, r.bytes)
    done++
    console.log(`[ok]   ${entry.slug} → ${entry.slug}.png (${r.bytes.length} bytes)`)
  })

  await runConcurrent(tasks, args.concurrency)

  console.log(`\n[done] ok=${done} skipped=${skipped} failed=${failed}`)
  if (failures.length) {
    console.log(`failed slugs: ${failures.join(',')}`)
    console.log(`re-run failed: npx tsx scripts/generate-home-thumbnails-v2.ts --only=${failures.join(',')}`)
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
