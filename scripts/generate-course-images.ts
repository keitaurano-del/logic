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
 */

import { writeFile, mkdir, access } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

// ────────────────────────────────────────────────────────────────────────────
// 共通スタイル: すべてのプロンプトに付与
// ────────────────────────────────────────────────────────────────────────────
const STYLE_SUFFIX =
  '3D isometric illustration, clean modern minimalist style, ' +
  'deep navy blue gradient background (#101729 to #1F2942), ' +
  'subtle warm golden glow accent in upper area, ' +
  'soft pastel highlights, professional educational app thumbnail, ' +
  'centered composition, cinematic lighting, octane render style, ' +
  'no text, no captions, no watermarks, no logos, no letters, no numbers'

// ────────────────────────────────────────────────────────────────────────────
// コース別プロンプト (内容に沿った主題を 1-2 文で記述)
// ────────────────────────────────────────────────────────────────────────────
const COURSE_PROMPTS: Record<string, string> = {
  // 思考の基礎
  'logic-01':
    'four colorful 3D isometric cubes arranged in a 2x2 grid (red, blue, gold, green) representing MECE classification, with a separate floating isometric tree of connected cube nodes branching outward like a logic tree, subtle floating papers with checkmarks',
  'logic-02':
    'a 3D isometric three-tier pyramid built from stacked cubes, with bidirectional vertical arrows on the side representing So What going up and Why So going down, a small figure presenting the pyramid to an audience',
  'critical-01':
    'a 3D isometric scene of a giant magnifying glass examining a floating document, with question marks transforming into green checkmarks, broken chain links representing logical fallacies floating around',
  'critical-02':
    'a 3D isometric translucent human brain with several glass filter panels being lifted away, releasing colored prismatic fragments representing cognitive biases drifting off',
  // 課題発見・解決
  'hypothesis-01':
    'a 3D isometric scene with a floating hypothesis card connected by an arrow loop to a laboratory beaker and a magnifying glass, representing hypothesis-then-verify cycle',
  'problem-01':
    'a 3D isometric iceberg cut in half showing a small visible tip above the water and a massive submerged base with glowing root cause spheres inside, target marker on the deep core',
  'design-01':
    'a 3D isometric central persona figure surrounded by an empathy map split into four quadrants on the floor, sticky notes floating, prototype paper shapes, journey path lines',
  'systems-01':
    'a 3D isometric circular feedback loop diagram with connected nodes, large circular arrow flowing through them, an iceberg model integrated below the loop',
  // 発想・創造
  'lateral-01':
    'a 3D isometric glowing lightbulb breaking out of a cube box, with sideways arrows pointing in unconventional directions, prism splitting white light into colors',
  'analogy-01':
    'a 3D isometric bridge connecting two distinct floating islands - left island shaped like a tree of nature, right island shaped like a business chart - with a glowing lightbulb hovering above the bridge',
  'philosophy-01':
    'a 3D isometric ancient Greek stone column with a contemplative thinker silhouette sitting beside it, an open scroll, abstract thought clouds with question marks above',
  'eastern-01':
    'a 3D isometric Chinese pavilion roof with a wise sage figure seated inside, traditional scrolls, glowing networked relationship lines connecting smaller figures around it, soft mist',
  'eastern-02':
    'a 3D isometric bamboo grove garden with a floating yin-yang symbol, abstract tao-flow lines like flowing water around stones, strategy chess pieces on a low platform',
  // 伝える・提案する
  'proposal-01':
    'a 3D isometric professional document with a small presenter figure beside it, golden impact arrows radiating from the document toward a small target, audience silhouettes in front',
  'proposal-course-01':
    'a 3D isometric workflow from a small hypothesis card on the left to a polished bound proposal document on the right, with checkmark verification steps in between',
  'client-01':
    'a 3D isometric floating spreadsheet panel with bar charts and large numerical figures, a calculator, a business person reading the data with a confident posture',
  'client-02':
    'a 3D isometric scene with two figures across a small table, one extracting information through a glowing question stream, structured cards organizing the answers',
  'client-03':
    'a 3D isometric figure climbing a steeply rising learning curve graph, stacked books on the path, expert silhouettes guiding from above',
  // ビジネス実践
  'case-01':
    'a 3D isometric profit equation tree splitting into revenue and cost branches with sub-cubes, a small interview chair scene, structured framework boards',
  'strategy-01':
    'a 3D isometric vintage industrial factory with conveyor belts on a circular platform, surrounded by five large arrows pointing inward representing five forces, a classic strategy book',
  'strategy-02':
    'a 3D isometric calm blue ocean with a small sailing ship, glowing resource gems on the seabed, mechanical capability gears interlocking, platform hub with radiating connections',
  'fermi-01':
    'a 3D isometric small earth globe with floating numerical figures around it, calculator, decomposition arrows breaking the globe into smaller cube estimates',
  'numeracy-01':
    'a 3D isometric scene with floating percentage symbol, yen currency sign, bar chart and pie chart, calculator, a person confidently reading numbers, scale balance',
  'peak-performance-01':
    'a 3D isometric morning scene with a moon-to-sun cycle arc, an energy graph rising and falling with peaks, an athletic figure stretching, a glowing focus zone marker',
}

// ────────────────────────────────────────────────────────────────────────────
// レッスン別プロンプト (主要レッスンのみ。残りはカテゴリのフォールバックを使う)
// ────────────────────────────────────────────────────────────────────────────
const LESSON_PROMPTS: Record<number, string> = {
  // ロジカルシンキング
  20: 'a 3D isometric 2x2 grid of four large colored cubes (red, blue, gold, green) showing MECE classification, no overlap no gap',
  21: 'a 3D isometric tree diagram with a single root cube branching into mid-level cubes and leaf cubes',
  22: 'a 3D isometric pair of vertical arrows side by side, one pointing up and one pointing down, between layered cube stacks, representing So What and Why So',
  23: 'a 3D isometric three-tier pyramid built from stacked cubes, conclusion on top supported by reason cubes below',
  24: 'a 3D isometric briefcase opening with documents flying out, case study notebook, charts',
  25: 'a 3D isometric flow from general principle cube down to specific conclusion cube, deduction arrow',
  26: 'a 3D isometric flow from many small specific data cubes converging upward into a general pattern cube, induction arrow',
  27: 'a 3D isometric formal logic gate diagram with truth state cubes glowing in a connected pattern',
  68: 'a 3D isometric ladder of abstraction with concrete object cubes at the bottom and abstract idea cubes at the top, vertical arrow',
  // ケース面接
  28: 'a 3D isometric interview room with two chairs across a small table, structured frameworks floating between them',
  29: 'a 3D isometric profit equation tree with revenue branch and cost branch breaking into smaller cubes',
  35: 'a 3D isometric arrow pointing from a small island to a larger market continent, decision flowchart cubes around the arrow',
  36: 'a 3D isometric two companies represented as separate cube clusters merging into one larger cluster, M&A handshake',
  // クリティカルシンキング
  40: 'a 3D isometric magnifying glass examining a checklist document, question marks turning into checkmarks',
  41: 'a 3D isometric set of broken chain links labeled as logical fallacies, with a corrected solid chain link beside them',
  42: 'a 3D isometric data dashboard with floating bar charts and a person carefully reading numbers, hidden patterns highlighted',
  43: 'a 3D isometric large question mark cube being polished, surrounded by smaller question marks being filtered into a clearer one',
  69: 'a 3D isometric brain with translucent biased glasses being removed, prismatic fragments drifting',
  71: 'a 3D isometric two correlated wave lines diverging where one is a true cause arrow and the other is just correlation',
  // 仮説思考
  50: 'a 3D isometric thought bubble with a hypothesis card pointing forward to a verification path',
  51: 'a 3D isometric figure drafting hypothesis cards on a desk, multiple options floating up',
  52: 'a 3D isometric arrow loop from hypothesis card to data verification beaker and back',
  70: 'a 3D isometric experimental setup with measurement instruments, control versus test cubes',
  // 課題設定
  53: 'a 3D isometric target board with concentric rings, an arrow finding the true bullseye among decoys',
  54: 'a 3D isometric large issue card being decomposed downward into smaller sub-issue cubes',
  55: 'a 3D isometric workspace with multiple problem cards being prioritized into a focused single card',
  // デザインシンキング
  56: 'a 3D isometric design thinking cycle with five connected stage cubes (empathize, define, ideate, prototype, test)',
  57: 'a 3D isometric empathy map quadrants on the floor surrounding a central persona figure',
  58: 'a 3D isometric prototype paper model being tested by a user figure with feedback bubbles',
  // ラテラルシンキング
  59: 'a 3D isometric lightbulb breaking out of a cube box, sideways arrows in unconventional directions',
  60: 'a 3D isometric prism splitting a single light beam into multiple colorful diverging directions',
  61: 'a 3D isometric flipped perspective scene where a problem cube is rotated to reveal a different unexpected facet',
  // アナロジー思考
  62: 'a 3D isometric bridge connecting two distinct floating islands with different visual themes',
  63: 'a 3D isometric structural pattern card being lifted from one domain and placed onto another domain',
  64: 'a 3D isometric two parallel scenes side by side with matching structural arrows showing analogy mapping',
  // システムシンキング
  65: 'a 3D isometric circular feedback loop with connected node cubes flowing in a circle',
  66: 'a 3D isometric system archetype diagram with reinforcing and balancing loops shown as gears',
  67: 'a 3D isometric iceberg model with events on top, patterns mid, structures and mental models at the deep base',
  // 提案・伝える技術
  72: 'a 3D isometric professional bound proposal document with a clear target arrow above it',
  73: 'a 3D isometric two figures facing a document, one offering and one receiving, perspective lines aligning their viewpoints',
  74: 'a 3D isometric storyline path with sequential narrative cube panels leading to a conclusion',
  75: 'a 3D isometric message card being polished and sharpened on a workbench with sparkles',
  76: 'a 3D isometric shield deflecting incoming counter-argument arrows, behind it a strong document',
  // 哲学
  77: 'a 3D isometric ancient Greek stone column with a Socrates-like silhouette and a scroll, question marks rising',
}

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
// Gemini Imagen API 呼び出し
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
type Job = { kind: 'course' | 'lesson'; id: string; prompt: string; outFile: string }

async function main() {
  const args = parseArgs(process.argv.slice(2))

  const __filename = fileURLToPath(import.meta.url)
  const __dirname = dirname(__filename)
  const repoRoot = resolve(__dirname, '..')
  const outDir = resolve(repoRoot, args.out)
  await mkdir(outDir, { recursive: true })

  const jobs: Job[] = []

  if (args.target === 'courses' || args.target === 'all') {
    for (const [id, prompt] of Object.entries(COURSE_PROMPTS)) {
      if (args.only && !args.only.includes(id)) continue
      jobs.push({
        kind: 'course',
        id,
        prompt,
        outFile: resolve(outDir, `course-${id}.png`),
      })
    }
  }
  if (args.target === 'lessons' || args.target === 'all') {
    for (const [idStr, prompt] of Object.entries(LESSON_PROMPTS)) {
      if (args.only && !args.only.includes(idStr)) continue
      jobs.push({
        kind: 'lesson',
        id: idStr,
        prompt,
        outFile: resolve(outDir, `lesson-${idStr}.png`),
      })
    }
  }

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
