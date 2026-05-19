/**
 * Sample generator for the new hand-drawn notebook lesson thumbnail style.
 *
 * Generates one image (lesson-20 MECE) for Keita to approve before
 * we expand the prompts to all 49 lesson thumbnails.
 *
 * Usage:
 *   npx tsx scripts/generate-lesson-sample.ts
 *
 * Output: docs/handdrawn-pilot/lesson-20-mece-v2-sample.png
 */

import { writeFile, mkdir, readFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const STYLE = `
Hand-drawn 2D illustration on cream-colored ruled notebook paper.
Background: warm beige cream paper, with thin light coral pink horizontal ruled lines spaced evenly across, three small round binder holes on the left margin, very subtle paper texture.

Aesthetic: a thoughtful student's clean study notebook page. Drawn entirely with a black marker pen — clean confident line work with slight natural ink variation. Title hand-lettered in marker (NOT a typeface, NOT printed letters — every letter must look hand-drawn with a marker, including all uppercase letters), with a bold coral red underline swoosh below. Body annotations in casual cursive handwriting.

Color palette (use as accents only, not as labels):
- Warm cream beige paper base
- Coral red (for underlines and small accent marks)
- Sage green, navy blue, mustard yellow (use sparingly for small accent fills)
Primarily black-line drawing with light color accents. Do not fill large areas with bright color.

CRITICAL — do NOT write any hex color codes, RGB values, color names, or any other technical reference text inside the image. The image must contain only the title, the diagram labels, and the handwritten annotations described — nothing else.

Composition: square (1:1). Central diagram occupies about 60-70% of the canvas. Title at top-left. Optional short handwritten note at bottom.

NO decorative elements: NO stars, NO sparkles, NO scattered ink dots, NO floating doodles, NO ornamental marks of any kind. The page should look clean and purposeful — every element must serve the diagram.

Do NOT include: photorealism, 3D rendering, isometric perspective, dark backgrounds, gradients, cinematic lighting, busy textures, glow effects, computer-graphics polish, decorative borders.

Text rules: every visible text — including the title — must be hand-lettered with a marker, drawn letter-by-letter. No printed/typeset/computer fonts whatsoever. Spelling must be perfectly correct (re-check every word). Maximum 3-4 short handwritten annotations near the diagram (max 5 English words each).
`.trim()

const LESSON_20_PROMPT = `
Topic: MECE (Mutually Exclusive, Collectively Exhaustive) — a fundamental logical thinking principle for categorization.

Top-left of the page: hand-lettered title "MECE" — four large uppercase letters, each letter drawn individually with a thick black marker (NOT a printed font, NOT a typeface — every letter must look hand-drawn, with slight natural variation in stroke width and angle). Below the title: a thick coral red underline swoosh, hand-drawn.

Below the title in smaller cursive handwriting (also hand-lettered, not typeset): "Mutually Exclusive, Collectively Exhaustive" (spell every word exactly: M-U-T-U-A-L-L-Y, E-X-C-L-U-S-I-V-E, C-O-L-L-E-C-T-I-V-E-L-Y, E-X-H-A-U-S-T-I-V-E).

Center of the page: a hand-drawn 2x2 grid (about 55% of canvas width) with four labeled cells:
- Top-left cell labeled "A"
- Top-right cell labeled "B"
- Bottom-left cell labeled "C"
- Bottom-right cell labeled "D"
Drawn with thick black marker borders. Each cell label is a single large hand-lettered marker letter, centered in its cell.

Just above the grid: a short hand-drawn down-arrow with the handwritten annotation "no overlaps" (cursive, dark ink).

Just below the grid: a short hand-drawn up-arrow with the handwritten annotation "no gaps either" (cursive, dark ink).

That is the entire content. The page contains only: the MECE title, its coral underline, the subtitle, the 2x2 grid with A/B/C/D labels, and the two short annotations above and below the grid. Nothing else. No icons, no stars, no extra doodles, no decorative dots, no borders.
`.trim()

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
        parameters: { sampleCount: 1, aspectRatio: '1:1', safetyFilterLevel: 'block_only_high' },
      }
    : {
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

async function main() {
  const env = await loadEnv()
  const apiKey = env.GEMINI_API_KEY || process.env.GEMINI_API_KEY
  if (!apiKey) {
    console.error('GEMINI_API_KEY not found in .env or environment')
    process.exit(1)
  }

  const modelArg = process.argv.find((a) => a.startsWith('--model='))
  const model = modelArg ? modelArg.slice('--model='.length) : 'gemini-2.5-flash-image'

  const fullPrompt = `${STYLE}\n\n---\n\n${LESSON_20_PROMPT}`

  console.log(`[gen] model=${model}, prompt chars=${fullPrompt.length}`)
  console.log(`[gen] calling Gemini API...`)

  const r = await generate(fullPrompt, apiKey, model)
  if (!r.ok) {
    console.error(r.error)
    process.exit(1)
  }

  const __filename = fileURLToPath(import.meta.url)
  const __dirname = dirname(__filename)
  const outDir = resolve(__dirname, '..', 'docs', 'handdrawn-pilot')
  await mkdir(outDir, { recursive: true })
  const slug = model.replace(/[^a-z0-9]+/gi, '-')
  const outFile = resolve(outDir, `lesson-20-mece-v2-${slug}.png`)
  await writeFile(outFile, r.bytes)

  console.log(`[ok] wrote ${outFile} (${r.bytes.length} bytes)`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
