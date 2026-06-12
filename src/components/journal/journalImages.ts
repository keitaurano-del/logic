import { getSupabaseClient } from '../../supabase'
import type { JournalImage } from './types'

const BUCKET = 'journal-images'
const SIGNED_URL_TTL_SEC = 3600
// JF-1: 上限を 1920→1600 に下げてデコード/エンコード負荷とアップロード量を削減。
// 1600px あればサムネ・ライトボックス表示には十分。
const MAX_DIMENSION = 1600
const COMPRESS_QUALITY = 0.82
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif'])

export class ImageUploadError extends Error {
  code: 'invalid-type' | 'too-large' | 'compress-failed' | 'upload-failed' | 'no-auth'
  constructor(code: ImageUploadError['code'], message: string) {
    super(message)
    this.code = code
    this.name = 'ImageUploadError'
  }
}

/** drawImage 元 (ImageBitmap か HTMLImageElement) の自然サイズを取る。 */
type DrawSource = ImageBitmap | HTMLImageElement
function sourceSize(src: DrawSource): { w: number; h: number } {
  if ('width' in src && 'height' in src) {
    // ImageBitmap / HTMLImageElement どちらも width/height を持つ（HTMLImageElement は naturalWidth 優先）
    const w = (src as HTMLImageElement).naturalWidth || src.width
    const h = (src as HTMLImageElement).naturalHeight || src.height
    return { w, h }
  }
  return { w: 0, h: 0 }
}

/**
 * JF-1: createImageBitmap の resize オプションで「デコード時に」縮小する軽量経路。
 * メインスレッドの drawImage 負荷を避け、対応ブラウザ（Capacitor WebView 含む）では大幅に速い。
 * 非対応・失敗時は null を返し、呼び出し側が従来の <img>+canvas 経路へフォールバックする。
 */
async function decodeAndResize(file: File): Promise<DrawSource | null> {
  if (typeof createImageBitmap !== 'function') return null
  try {
    // まず素のサイズを得るためのデコード。resize 指定は元サイズが分からないと比率がずれるので
    // 一旦 imageOrientation のみ補正してデコードし、サイズを見てから縮小判断する。
    const probe = await createImageBitmap(file, { imageOrientation: 'from-image' })
    const longest = Math.max(probe.width, probe.height)
    if (longest <= MAX_DIMENSION) return probe
    // ここから先で probe は不要。リサイズが throw しても確実に close してリークを防ぐ。
    try {
      const scale = MAX_DIMENSION / longest
      const targetW = Math.max(1, Math.round(probe.width * scale))
      const resized = await createImageBitmap(probe, {
        resizeWidth: targetW,
        resizeQuality: 'medium',
      })
      return resized
    } finally {
      probe.close()
    }
  } catch {
    return null
  }
}

/**
 * File / Blob を最大 1600px の JPEG (quality 0.82) に圧縮する。
 * - createImageBitmap が使えるならデコード時リサイズで軽量化（JF-1）
 * - 使えない/失敗時は <img>+canvas の従来経路にフォールバック
 * - 既に長辺がそれ以下なら拡大はしない
 * - 失敗した場合は ImageUploadError を投げる
 */
async function compressToJpeg(file: File): Promise<{ blob: Blob; width: number; height: number }> {
  let source: DrawSource | null = await decodeAndResize(file)

  if (!source) {
    // フォールバック: FileReader → <img> デコード
    const dataUrl: string = await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => reject(new ImageUploadError('compress-failed', 'failed to read file'))
      reader.readAsDataURL(file)
    })
    source = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image()
      i.onload = () => resolve(i)
      i.onerror = () => reject(new ImageUploadError('compress-failed', 'failed to decode image'))
      i.src = dataUrl
    })
  }

  const natural = sourceSize(source)
  let width = natural.w
  let height = natural.h
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
  if (!ctx) {
    if ('close' in source) (source as ImageBitmap).close()
    throw new ImageUploadError('compress-failed', 'no canvas context')
  }
  ctx.drawImage(source, 0, 0, width, height)
  // ImageBitmap はメモリ解放のため明示 close
  if ('close' in source) (source as ImageBitmap).close()

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

/** JF-3: アップロードの進行段階。UI で「圧縮中 / 送信中」を出し分けるために通知する。 */
export type UploadStage = 'compressing' | 'uploading'

export async function uploadJournalImage(
  userId: string,
  date: string,
  file: File,
  onStage?: (stage: UploadStage) => void,
): Promise<{ image?: JournalImage; error?: ImageUploadError }> {
  if (!ALLOWED_MIME.has(file.type)) {
    return { error: new ImageUploadError('invalid-type', `unsupported mime: ${file.type}`) }
  }
  // 10MB を超える元ファイルは弾く（圧縮後は小さくなるが、巨大ファイルのデコードでメモリ圧迫を避ける）
  if (file.size > 20 * 1024 * 1024) {
    return { error: new ImageUploadError('too-large', `file too large: ${file.size} bytes`) }
  }

  const supabase = getSupabaseClient()
  if (!supabase) return { error: new ImageUploadError('no-auth', 'supabase not configured') }

  let compressed: { blob: Blob; width: number; height: number }
  try {
    onStage?.('compressing')
    compressed = await compressToJpeg(file)
  } catch (e) {
    return { error: e instanceof ImageUploadError ? e : new ImageUploadError('compress-failed', String(e)) }
  }

  onStage?.('uploading')
  const path = makeObjectPath(userId, date)
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, compressed.blob, { contentType: 'image/jpeg', upsert: false })
  if (error) {
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
