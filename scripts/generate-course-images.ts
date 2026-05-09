/**
 * Generate course / lesson illustration images via Gemini API.
 *
 * 使い方:
 *   GEMINI_API_KEY=xxx npx tsx scripts/generate-course-images.ts
 *
 * オプション:
 *   --target=courses|lessons|all   生成対象 (default: courses)
 *   --only=<id1>,<id2>             特定IDのみ生成 (例: logic-01,critical-01 / 20,21)
 *   --skip-existing                既存ファイルをスキップ (default: false → 上書き)
 *   --model=<model>                Gemini モデル指定
 *                                  (default: imagen-4.0-generate-preview-06-06)
 *                                  例: imagen-3.0-generate-002,
 *                                      gemini-2.5-flash-image-preview
 *   --aspect=<ratio>               アスペクト比 (default: 16:9)
 *                                  imagen系: 1:1, 3:4, 4:3, 9:16, 16:9
 *   --concurrency=<n>              並列実行数 (default: 2)
 *   --out=<dir>                    出力ディレクトリ
 *                                  (default: public/images/v3)
 *   --dry-run                      プロンプトを表示するだけで API を呼ばない
 *
 * 環境変数:
 *   GEMINI_API_KEY (必須)
 *
 * 出力ファイル名:
 *   コース: course-{id}.png    例: course-logic-01.png
 *   レッスン: lesson-{id}.png  例: lesson-20.png
 *
 * プロンプトは scripts/imagePrompts.ts に集約されている。
 */

import { writeFile, mkdir, access } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  STYLE_SUFFIX,
  COURSE_PROMPTS,
  LESSON_PROMPTS,
  type ImagePromptEntry,
} from './imagePrompts.ts'

// ────────────────────────────────────────────────────────────────────────────
// CLI 引数パース
// ────────────────────────────────────────────────────────────────────────────
type Args = {
  target: 'courses' | 'lessons' | 'all'
  only: string[] | null
  skipExisting: boolean
  model: string
  aspect: string
  concurrency: number
  out: string
  dryRun: boolean
}

function parseArgs(argv: string[]): Args {
  const get = (key: string): string | undefined => {
    const arg = argv.find((a) => a.startsWith(`--${key}=`))
    return arg ? arg.slice(`--${key}=`.length) : undefined
  }
  const has = (key: string): boolean => argv.includes(`--${key}`)

  const target = (get('target') ?? 'courses') as Args['target']
  if (!['courses', 'lessons', 'all'].includes(target)) {
    throw new Error(`invalid --target: ${target}`)
  }
  const only = get('only')?.split(',').map((s) => s.trim()).filter(Boolean) ?? null

  return {
    target,
    only,
    skipExisting: has('skip-existing'),
    model: get('model') ?? 'imagen-4.0-generate-preview-06-06',
    aspect: get('aspect') ?? '16:9',
    concurrency: Number(get('concurrency') ?? 2),
    out: get('out') ?? 'public/images/v3',
    dryRun: has('dry-run'),
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Gemini API 呼び出し
// ────────────────────────────────────────────────────────────────────────────
type GenResult = { ok: true; bytes: Buffer } | { ok: false; error: string }

async function generateImage(
  prompt: string,
  apiKey: string,
  model: string,
  aspect: string,
): Promise<GenResult> {
  const fullPrompt = `${prompt}, ${STYLE_SUFFIX}`

  // Imagen 系 (predict) と Gemini Flash Image 系 (generateContent) で
  // エンドポイント形式が違うので分岐
  const isImagen = model.startsWith('imagen-')
  const url = isImagen
    ? `https://generativelanguage.googleapis.com/v1beta/models/${model}:predict?key=${apiKey}`
    : `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`

  const body = isImagen
    ? {
        instances: [{ prompt: fullPrompt }],
        parameters: {
          sampleCount: 1,
          aspectRatio: aspect,
          personGeneration: 'allow_adult',
          safetyFilterLevel: 'block_only_high',
        },
      }
    : {
        contents: [{ parts: [{ text: fullPrompt }] }],
        generationConfig: {
          responseModalities: ['IMAGE', 'TEXT'],
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
    type Pred = { bytesBase64Encoded?: string }
    const preds = (json as { predictions?: Pred[] }).predictions
    const b64 = preds?.[0]?.bytesBase64Encoded
    if (!b64) {
      return {
        ok: false,
        error: `no image in response: ${JSON.stringify(json).slice(0, 300)}`,
      }
    }
    return { ok: true, bytes: Buffer.from(b64, 'base64') }
  } else {
    type Cand = {
      content?: { parts?: { inlineData?: { data?: string; mimeType?: string } }[] }
    }
    const cands = (json as { candidates?: Cand[] }).candidates
    const parts = cands?.[0]?.content?.parts ?? []
    const inline = parts.find((p) => p.inlineData?.data)?.inlineData
    if (!inline?.data) {
      return {
        ok: false,
        error: `no image in response: ${JSON.stringify(json).slice(0, 300)}`,
      }
    }
    return { ok: true, bytes: Buffer.from(inline.data, 'base64') }
  }
}

// ────────────────────────────────────────────────────────────────────────────
// 並列実行ユーティリティ
// ────────────────────────────────────────────────────────────────────────────
async function runConcurrent<T>(
  tasks: (() => Promise<T>)[],
  concurrency: number,
): Promise<T[]> {
  const results: T[] = new Array(tasks.length)
  let next = 0
  async function worker() {
    while (next < tasks.length) {
      const i = next++
      results[i] = await tasks[i]()
    }
  }
  const workers = Array.from({ length: Math.max(1, concurrency) }, () => worker())
  await Promise.all(workers)
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

// ────────────────────────────────────────────────────────────────────────────
// main
// ────────────────────────────────────────────────────────────────────────────
type Job = {
  kind: 'course' | 'lesson'
  id: string
  prompt: string
  outFile: string
}

function buildJobs(args: Args, outDir: string): Job[] {
  const jobs: Job[] = []
  const push = (kind: Job['kind'], entries: ImagePromptEntry[]) => {
    for (const e of entries) {
      if (args.only && !args.only.includes(e.id)) continue
      jobs.push({
        kind,
        id: e.id,
        prompt: e.prompt,
        outFile: resolve(outDir, e.filename),
      })
    }
  }

  if (args.target === 'courses' || args.target === 'all') {
    push('course', COURSE_PROMPTS)
  }
  if (args.target === 'lessons' || args.target === 'all') {
    push('lesson', LESSON_PROMPTS)
  }

  return jobs
}

async function main() {
  const args = parseArgs(process.argv.slice(2))

  const __filename = fileURLToPath(import.meta.url)
  const __dirname = dirname(__filename)
  const repoRoot = resolve(__dirname, '..')
  const outDir = resolve(repoRoot, args.out)
  await mkdir(outDir, { recursive: true })

  const jobs = buildJobs(args, outDir)

  if (jobs.length === 0) {
    console.error('no jobs to run (check --target / --only)')
    process.exit(1)
  }

  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey && !args.dryRun) {
    console.error('error: GEMINI_API_KEY is not set')
    process.exit(1)
  }

  console.log(
    `[gen] model=${args.model} aspect=${args.aspect} concurrency=${args.concurrency} jobs=${jobs.length}`,
  )

  let done = 0
  let skipped = 0
  let failed = 0

  const tasks = jobs.map((job) => async () => {
    if (args.skipExisting && (await fileExists(job.outFile))) {
      skipped++
      console.log(`[skip] ${job.kind}/${job.id} (exists)`)
      return
    }
    if (args.dryRun) {
      console.log(`[dry-run] ${job.kind}/${job.id}\n  prompt: ${job.prompt}\n`)
      done++
      return
    }
    try {
      const r = await generateImage(job.prompt, apiKey!, args.model, args.aspect)
      if (!r.ok) {
        failed++
        console.error(`[fail] ${job.kind}/${job.id}: ${r.error}`)
        return
      }
      await writeFile(job.outFile, r.bytes)
      done++
      console.log(`[ok]   ${job.kind}/${job.id} → ${job.outFile} (${r.bytes.length} bytes)`)
    } catch (e) {
      failed++
      console.error(`[err]  ${job.kind}/${job.id}:`, (e as Error).message)
    }
  })

  await runConcurrent(tasks, args.concurrency)

  console.log(`\n[done] ok=${done} skipped=${skipped} failed=${failed}`)
  if (failed > 0) process.exit(1)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
