import { getSupabaseClient } from '../../supabase'
import type { JournalImage } from './types'

const BUCKET = 'journal-images'
const SIGNED_URL_TTL_SEC = 3600
const MAX_DIMENSION = 1920
const COMPRESS_QUALITY = 0.85
// iOS は HEIC/HEIF を accept に含めると変換せずそのまま返すが、HEIC は Canvas で
// decode できないため compress で失敗する。accept には JPEG/PNG/WebP のみ並べ、
// 受け取り側で空 type の許可（iOS は HEIC→JPEG 変換後に type が空になることがある）
// と合わせて緩めに判定する。
const ALLOWED_MIME = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp'])

export class ImageUploadError extends Error {
  code: 'invalid-type' | 'too-large' | 'compress-failed' | 'upload-failed' | 'no-auth'
  constructor(code: ImageUploadError['code'], message: string) {
    super(message)
    this.code = code
    this.name = 'ImageUploadError'
  }
}

/**
 * File / Blob を最大 1920px の JPEG (quality 0.85) に圧縮する。
 * - 既に短辺がそれ以下なら長辺を 1920 に合わせる程度のリサイズに留める
 * - 失敗した場合は ImageUploadError を投げる
 */
async function compressToJpeg(file: File): Promise<{ blob: Blob; width: number; height: number }> {
  const dataUrl: string = await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result as string)
    reader.onerror = () => reject(new ImageUploadError('compress-failed', 'failed to read file'))
    reader.readAsDataURL(file)
  })

  const img: HTMLImageElement = await new Promise((resolve, reject) => {
    const i = new Image()
    i.onload = () => resolve(i)
    i.onerror = () => reject(new ImageUploadError('compress-failed', 'failed to decode image'))
    i.src = dataUrl
  })

  let { width, height } = img
  const longest = Math.max(width, height)
  if (longest > MAX_DIMENSION) {
    const scale = MAX_DIMENSION / longest
    width = Math.round(width * scale)
    height = Math.round(height * scale)
  }

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new ImageUploadError('compress-failed', 'no canvas context')
  ctx.drawImage(img, 0, 0, width, height)

  const blob: Blob | null = await new Promise((resolve) => {
    canvas.toBlob((b) => resolve(b), 'image/jpeg', COMPRESS_QUALITY)
  })
  if (!blob) throw new ImageUploadError('compress-failed', 'canvas.toBlob returned null')
  return { blob, width, height }
}

function makeObjectPath(userId: string, date: string): string {
  // crypto.randomUUID は Capacitor WebView / モダンブラウザの両方で利用可能。
  const uuid = (typeof crypto !== 'undefined' && 'randomUUID' in crypto)
    ? crypto.randomUUID()
    : Math.random().toString(36).slice(2) + Date.now().toString(36)
  return `${userId}/${date}/${uuid}.jpg`
}

export async function uploadJournalImage(
  userId: string,
  date: string,
  file: File,
): Promise<{ image?: JournalImage; error?: ImageUploadError }> {
  // iOS の写真ピッカー由来だと file.type が空文字で来ることがある（HEIC→JPEG 変換時など）。
  // 空 type は許容、それ以外は許可リストでチェック。
  if (file.type && !ALLOWED_MIME.has(file.type)) {
    return { error: new ImageUploadError('invalid-type', `unsupported mime: ${file.type}`) }
  }
  if (file.size > 20 * 1024 * 1024) {
    return { error: new ImageUploadError('too-large', `file too large: ${file.size} bytes`) }
  }

  const supabase = getSupabaseClient()
  if (!supabase) return { error: new ImageUploadError('no-auth', 'supabase not configured') }

  let compressed: { blob: Blob; width: number; height: number }
  try {
    compressed = await compressToJpeg(file)
  } catch (e) {
    const err = e instanceof ImageUploadError ? e : new ImageUploadError('compress-failed', String(e))
    console.warn('[journal-image] compress failed:', err.code, err.message, 'file:', { name: file.name, type: file.type, size: file.size })
    return { error: err }
  }

  const path = makeObjectPath(userId, date)
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, compressed.blob, { contentType: 'image/jpeg', upsert: false })
  if (error) {
    console.warn('[journal-image] storage upload failed:', error.message, 'path:', path)
    return { error: new ImageUploadError('upload-failed', error.message) }
  }

  return {
    image: {
      path,
      uploaded_at: new Date().toISOString(),
      width: compressed.width,
      height: compressed.height,
    },
  }
}

export async function deleteJournalImage(path: string): Promise<{ error?: string }> {
  const supabase = getSupabaseClient()
  if (!supabase) return { error: 'supabase not configured' }
  const { error } = await supabase.storage.from(BUCKET).remove([path])
  if (error) return { error: error.message }
  return {}
}

/**
 * 複数 path に対する signed URL をまとめて発行する。失敗した path は値が null で返る。
 */
export async function getJournalImageUrls(paths: string[]): Promise<Record<string, string | null>> {
  const result: Record<string, string | null> = {}
  if (paths.length === 0) return result
  const supabase = getSupabaseClient()
  if (!supabase) {
    for (const p of paths) result[p] = null
    return result
  }
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrls(paths, SIGNED_URL_TTL_SEC)
  if (error || !data) {
    for (const p of paths) result[p] = null
    return result
  }
  for (const entry of data) {
    const p = entry.path
    if (!p) continue
    result[p] = entry.signedUrl ?? null
  }
  for (const p of paths) if (!(p in result)) result[p] = null
  return result
}
