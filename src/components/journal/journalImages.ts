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
  // <img> フォールバック経路で確保した data URL / 要素を確実に解放するため保持しておく。
  let fallbackImg: HTMLImageElement | null = null

  if (!source) {
    // フォールバック: FileReader → <img> デコード
    const dataUrl: string = await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = () => reject(new ImageUploadError('compress-failed', 'failed to read file'))
      reader.readAsDataURL(file)
    })
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image()
      i.onload = () => resolve(i)
      i.onerror = () => reject(new ImageUploadError('compress-failed', 'failed to decode image'))
      i.src = dataUrl
    })
    source = img
    fallbackImg = img
  }

  // JF-7: canvas / ImageBitmap / <img> のメモリを「成功・例外を問わず」確実に解放する。
  // モバイル WebView では canvas のバックバッファ（最大 1600px ≒ 約 10MB の RGBA）が
  // GC まで残り、3〜4 枚目で createImageBitmap / canvas.toBlob が失敗し
  // compress-failed（ユーザーには「アップロードに失敗」と表示）になっていた。
  // 一度枯渇するとリロードまで回復しないため再試行も失敗する＝報告症状と一致。
  let canvas: HTMLCanvasElement | null = null
  try {
    const natural = sourceSize(source)
    let width = natural.w
    let height = natural.h
    const longest = Math.max(width, height)
    if (longest > MAX_DIMENSION) {
      const scale = MAX_DIMENSION / longest
      width = Math.round(width * scale)
      height = Math.round(height * scale)
    }

    canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')
    if (!ctx) {
      throw new ImageUploadError('compress-failed', 'no canvas context')
    }
    ctx.drawImage(source, 0, 0, width, height)
    // drawImage 済みなので元ソースは即解放できる（ImageBitmap は明示 close）。
    if ('close' in source) (source as ImageBitmap).close()
    source = null

    const blob: Blob | null = await new Promise((resolve) => {
      // canvas は finally でも参照するので非 null を閉じ込めず外側変数を使う
      canvas!.toBlob((b) => resolve(b), 'image/jpeg', COMPRESS_QUALITY)
    })
    if (!blob) throw new ImageUploadError('compress-failed', 'canvas.toBlob returned null')
    return { blob, width, height }
  } finally {
    // ImageBitmap が drawImage 前に throw した場合も含めて close
    if (source && 'close' in source) (source as ImageBitmap).close()
    // canvas のバックバッファを即時に解放: 1x1 に潰してから参照を切る。
    // iOS/Android WebView で GPU/CPU 側のピクセルバッファ回収を促す常套手段。
    if (canvas) {
      canvas.width = 1
      canvas.height = 1
      canvas = null
    }
    // <img> の data URL（フルサイズ base64）を握り続けないよう src を解放
    if (fallbackImg) {
      fallbackImg.src = ''
      fallbackImg = null
    }
  }
}

// JF-7: 圧縮（デコード→canvas→toBlob）は最もメモリを食う工程。並列で複数走らせると
// 大きな canvas/ImageBitmap が同時に存在しモバイル WebView のヒープを枯渇させる。
// アップロード（ネットワーク）は並列のままにしつつ、CPU/メモリ集約の圧縮だけは
// プロセス内で逐次化（同時に 1 枚だけ）してピークメモリを抑える。
let compressChain: Promise<unknown> = Promise.resolve()
function compressSerialized(file: File): Promise<{ blob: Blob; width: number; height: number }> {
  const run = compressChain.then(() => compressToJpeg(file))
  // チェーンは「順番待ち」だけが目的。失敗しても後続を止めないよう握りつぶした尾を繋ぐ。
  compressChain = run.catch(() => undefined)
  return run
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
    // JF-7: 圧縮は逐次化（同時 1 枚）してモバイルのメモリ枯渇を避ける。
    compressed = await compressSerialized(file)
  } catch (e) {
    const err = e instanceof ImageUploadError ? e : new ImageUploadError('compress-failed', String(e))
    // 本番でもどの段階で落ちたか追えるよう内部ログを残す（ユーザー向け文言は据え置き）。
    console.error('[journalImages] compress failed', { code: err.code, message: err.message, type: file.type, size: file.size })
    return { error: err }
  }

  onStage?.('uploading')
  const path = makeObjectPath(userId, date)
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, compressed.blob, { contentType: 'image/jpeg', upsert: false })
  if (error) {
    console.error('[journalImages] upload failed', { message: error.message })
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
