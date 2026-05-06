/**
 * 紐付けスクリプト: 生成済みの PNG を courseData / lessonSlides に反映する
 *
 * 使い方:
 *   npx tsx scripts/wire-images.ts
 *   npx tsx scripts/wire-images.ts --dry-run
 *
 * 動作:
 *   1. public/images/v3/ を走査して course-{id}.png / lesson-{id}.png を検出
 *   2. 検出したコース ID について src/courseData.ts の image: フィールドを
 *      .png パスに更新（image: フィールドがなければ description: の直後に挿入）
 *   3. 検出したレッスン ID について src/lessonSlides.ts の LESSON_IMAGES マップを
 *      .png パスに更新（既存エントリのみ）
 *
 * オプション:
 *   --dry-run        差分プレビューのみ。ファイルを書き換えない
 *   --images-dir=    画像ディレクトリ (default: public/images/v3)
 *
 * imagePrompts.ts に登録されている ID のみが対象。それ以外のファイルは無視。
 */

import { readFile, writeFile, readdir } from 'node:fs/promises'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { COURSE_PROMPTS, LESSON_PROMPTS } from './imagePrompts.ts'

type Args = {
  dryRun: boolean
  imagesDir: string
}

function parseArgs(argv: string[]): Args {
  const get = (key: string): string | undefined => {
    const arg = argv.find((a) => a.startsWith(`--${key}=`))
    return arg ? arg.slice(`--${key}=`.length) : undefined
  }
  const has = (key: string): boolean => argv.includes(`--${key}`)
  return {
    dryRun: has('dry-run'),
    imagesDir: get('images-dir') ?? 'public/images/v3',
  }
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const repoRoot = resolve(__dirname, '..')

// ────────────────────────────────────────────────────────────────────────────
// courseData.ts 更新
// ────────────────────────────────────────────────────────────────────────────
function updateCourseSrc(
  src: string,
  courseId: string,
  newImagePath: string,
): { src: string; action: 'updated' | 'inserted' | 'not-found' } {
  // 1. 既存 image: フィールドを置換
  const reUpdate = new RegExp(
    `(id:\\s*'${escapeRe(courseId)}',[\\s\\S]*?image:\\s*')[^']+(')`,
  )
  if (reUpdate.test(src)) {
    return { src: src.replace(reUpdate, `$1${newImagePath}$2`), action: 'updated' }
  }

  // 2. image: フィールドがなければ description: の直後に挿入
  const reInsert = new RegExp(
    `(id:\\s*'${escapeRe(courseId)}',[\\s\\S]*?description:\\s*'[^']*',)(\\n)(\\s*})`,
  )
  if (reInsert.test(src)) {
    return {
      src: src.replace(reInsert, `$1$2    image: '${newImagePath}',$2$3`),
      action: 'inserted',
    }
  }

  return { src, action: 'not-found' }
}

// ────────────────────────────────────────────────────────────────────────────
// lessonSlides.ts 更新
// ────────────────────────────────────────────────────────────────────────────
function updateLessonSrc(
  src: string,
  lessonId: string,
  newImagePath: string,
): { src: string; action: 'updated' | 'not-found' } {
  // LESSON_IMAGES マップ内の `20: '/images/v3/lesson-20.webp',` 形式を対象
  const re = new RegExp(`(^\\s*${escapeRe(lessonId)}:\\s*')[^']+(',)`, 'm')
  if (re.test(src)) {
    return { src: src.replace(re, `$1${newImagePath}$2`), action: 'updated' }
  }
  return { src, action: 'not-found' }
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// ────────────────────────────────────────────────────────────────────────────
// main
// ────────────────────────────────────────────────────────────────────────────
async function main() {
  const args = parseArgs(process.argv.slice(2))
  const imagesDir = resolve(repoRoot, args.imagesDir)
  const coursePath = resolve(repoRoot, 'src/courseData.ts')
  const lessonPath = resolve(repoRoot, 'src/lessonSlides.ts')

  const allFiles = await readdir(imagesDir).catch(() => [] as string[])
  const filesSet = new Set(allFiles)

  let courseSrc = await readFile(coursePath, 'utf-8')
  let lessonSrc = await readFile(lessonPath, 'utf-8')

  let coursesUpdated = 0
  let coursesInserted = 0
  let coursesMissing = 0
  let coursesNotFound = 0
  let lessonsUpdated = 0
  let lessonsMissing = 0
  let lessonsNotFound = 0

  console.log(`[scan] imagesDir=${imagesDir} (${allFiles.length} files)`)

  // コース
  for (const entry of COURSE_PROMPTS) {
    if (!filesSet.has(entry.filename)) {
      coursesMissing++
      continue
    }
    const newPath = `/images/v3/${entry.filename}`
    const result = updateCourseSrc(courseSrc, entry.id, newPath)
    if (result.action === 'updated') {
      coursesUpdated++
      courseSrc = result.src
      console.log(`[course updated]  ${entry.id} → ${newPath}`)
    } else if (result.action === 'inserted') {
      coursesInserted++
      courseSrc = result.src
      console.log(`[course inserted] ${entry.id} → ${newPath} (image field added)`)
    } else {
      coursesNotFound++
      console.warn(
        `[course MISS]    ${entry.id}: id not found in courseData.ts`,
      )
    }
  }

  // レッスン
  for (const entry of LESSON_PROMPTS) {
    if (!filesSet.has(entry.filename)) {
      lessonsMissing++
      continue
    }
    const newPath = `/images/v3/${entry.filename}`
    const result = updateLessonSrc(lessonSrc, entry.id, newPath)
    if (result.action === 'updated') {
      lessonsUpdated++
      lessonSrc = result.src
      console.log(`[lesson updated]  ${entry.id} → ${newPath}`)
    } else {
      lessonsNotFound++
      console.warn(
        `[lesson MISS]    ${entry.id}: not in LESSON_IMAGES map (manual add required)`,
      )
    }
  }

  // 書き出し
  if (args.dryRun) {
    console.log('\n[dry-run] no files written')
  } else {
    if (coursesUpdated + coursesInserted > 0) {
      await writeFile(coursePath, courseSrc)
    }
    if (lessonsUpdated > 0) {
      await writeFile(lessonPath, lessonSrc)
    }
  }

  console.log(
    [
      '',
      `[summary]`,
      `  courses: updated=${coursesUpdated} inserted=${coursesInserted} ` +
        `missing-png=${coursesMissing} not-found-in-src=${coursesNotFound}`,
      `  lessons: updated=${lessonsUpdated} ` +
        `missing-png=${lessonsMissing} not-in-map=${lessonsNotFound}`,
    ].join('\n'),
  )
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
