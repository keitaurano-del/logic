/**
 * Sample generator for the Lv50 "Logic Master" badge.
 *
 * Generates one badge PNG for Keita to approve before we expand to all 11 titles.
 *
 * Usage:
 *   npx tsx scripts/generate-badge-sample.ts
 *
 * Output: tmp/badge-master-sample.png
 */

import { writeFile, mkdir, readFile } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const STYLE = `
Heraldic emblem badge in the style of a premium modern-RPG rank insignia.
Western coat-of-arms design language: oblong shield + circular laurel-wreath border + ribbon banner.
Highly detailed metallic engraving — slightly worn surface, like a championship medallion.

Color metaphor: chrome / brushed-silver metalwork as the primary substrate, with a deep indigo enamel field inside the shield. Accent metal in burnished silver and a subtle Logic brand purple-blue glow (hex roughly #3D5FC4) on the highlights only.

CRITICAL TECHNICAL RULES:
- Transparent background. No background color, no rectangle behind the emblem — alpha channel cutout, PNG.
- The emblem is the only thing on the canvas, centered. Square 1:1 ratio.
- Photoreal metallic shading, soft inner shadows, no flat cartoon coloring.
- NO text, NO letters, NO numerals, NO Roman numerals, NO Arabic numerals, NO words anywhere in the image. The badge is pure visual symbology.
- NO gemstones in cartoonish colors. If a center jewel exists, it is faceted dark indigo.

Composition:
- Outer ring: laurel-wreath border in burnished silver
- Middle: heater-style shield (slightly tapered at bottom) with deep indigo enamel face
- Center motif: described by the prompt below
- Optional ribbon banner below the shield (BLANK — no text on it)
- Optional small star or crown ornament at the top of the wreath
`.trim()

const MASTER_PROMPT = `
Badge tier: MASTER (mid-game rank, ~Lv 50).
Symbolic meaning: mastery of logical thinking — composure, structured reasoning, the practitioner who has internalized the fundamentals.

Center motif inside the shield: an elegant open book rendered in burnished silver, with two crossed quills behind it (X-shape behind the book). On the visible pages of the book, faintly etched logic-gate symbols (AND and OR gate outlines) — engraved into the silver, no color fill.

Top ornament above the shield: a small geometric six-pointed star in silver.

Below the shield: a blank ribbon banner curling left-right, also silver — completely empty, NO TEXT.

Tone: dignified, restrained, slightly arcane. Like a fencing-club championship medal crossed with a wizard's sigil. Premium feel. The emblem reads as "Master" without using any words.
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
    console.error('GEMINI_API_KEY not found in .env or environment')
    process.exit(1)
  }

  const model = 'gemini-2.5-flash-image'
  const fullPrompt = `${STYLE}\n\n---\n\n${MASTER_PROMPT}`

  console.log(`[gen] model=${model}, prompt chars=${fullPrompt.length}`)
  console.log(`[gen] generating Lv50 Master badge sample...`)

  const r = await generate(fullPrompt, apiKey, model)
  if (!r.ok) {
    console.error(r.error)
    process.exit(1)
  }

  const here = dirname(fileURLToPath(import.meta.url))
  const outDir = resolve(here, '..', 'tmp')
  await mkdir(outDir, { recursive: true })
  const outPath = resolve(outDir, 'badge-master-sample.png')
  await writeFile(outPath, r.bytes)
  console.log(`[gen] wrote ${outPath} (${r.bytes.length} bytes)`)
}

main().catch((e) => { console.error(e); process.exit(1) })
