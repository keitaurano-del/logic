/**
 * src/lessonAssets.ts
 *
 * AF-06 第1スライス: レッスン/コース画像の URL リゾルバ。
 *
 * バンドルに同梱した `/images/v3/lesson-XX.webp` 等のローカルパスを、設定フラグが
 * ON のときだけ Supabase Storage 公開バケットのリモート URL に変換する。フラグ OFF
 * （デフォルト）では localPath をそのまま返すため、現状の挙動は完全に不変。
 *
 * フラグ:
 *   - VITE_REMOTE_LESSON_ASSETS … 'on'（または true/1/yes）でリモート取得を有効化
 *   - VITE_LESSON_ASSET_BASE_URL … リモートのベース URL（例: Supabase public バケット）
 *
 * 両方そろったときだけリモート URL を組み立てる。フラグ ON でもベース URL 未設定なら
 * 安全側に倒して localPath（bundled フォールバック）を返す。
 *
 * 実際の Storage アップロードやフラグ ON は別ステップ。本スライスはコード経路だけを
 * 用意する（default OFF）。
 */

/** env override を引数で差し込めるようにしたオプション（テスト容易性のため）。 */
export interface ResolveAssetOptions {
  /** VITE_REMOTE_LESSON_ASSETS 相当。未指定なら import.meta.env から読む。 */
  remoteEnabled?: string
  /** VITE_LESSON_ASSET_BASE_URL 相当。未指定なら import.meta.env から読む。 */
  baseUrl?: string
}

function readEnv(key: string): string | undefined {
  try {
    return (import.meta.env as Record<string, string | undefined>)[key]
  } catch {
    return undefined
  }
}

/** フラグ文字列を真偽に解釈する。'on'/'true'/'1'/'yes' を ON とみなす。 */
function isRemoteEnabled(raw: string | undefined): boolean {
  if (raw == null) return false
  const v = String(raw).trim().toLowerCase()
  return v === 'on' || v === 'true' || v === '1' || v === 'yes'
}

/**
 * localPath の末尾ファイル名を取り出す（クエリ/ハッシュは落とす）。
 * 例: '/images/v3/lesson-20.webp' → 'lesson-20.webp'
 */
function fileNameOf(localPath: string): string {
  const noQuery = localPath.split(/[?#]/)[0]
  const parts = noQuery.split('/')
  return parts[parts.length - 1] || ''
}

/** ベース URL とファイル名を二重スラッシュなしで連結する。 */
function joinUrl(base: string, fileName: string): string {
  const trimmedBase = base.replace(/\/+$/, '')
  return `${trimmedBase}/${fileName}`
}

/**
 * リモート化（Storage 取得）対象の拡張子か。
 *
 * AF-06 第2スライス: PNG → WebP 変換後は `.webp` が主フォーマット。
 * ロードマップ一覧の軽量 `.webp`（平均 50KB）はバンドル同梱を維持する設計だったが、
 * 全画像 WebP 化後はリモート化の対象を `.webp` にも広げる（将来の Storage 移行に備え）。
 * 現状はフラグ OFF（デフォルト）のため実際には localPath をそのまま返す。
 * Storage バケットに WebP をアップロードした後でフラグを ON にすることで有効化できる。
 */
function isRemotableAsset(localPath: string): boolean {
  const noQuery = localPath.split(/[?#]/)[0]
  const lower = noQuery.toLowerCase()
  return lower.endsWith('.png') || lower.endsWith('.webp')
}

/**
 * ローカル画像パスを、フラグ ON かつベース URL 設定時のみリモート URL に変換する。
 * それ以外（デフォルト）は localPath をそのまま返す（bundled フォールバック）。
 *
 * @param localPath 既存の bundled パス（例 '/images/v3/lesson-20.webp'）。空や非対象は無変換。
 * @param options   テスト用に env を override できる。未指定なら import.meta.env を読む。
 */
export function resolveAssetUrl(localPath: string, options?: ResolveAssetOptions): string {
  if (!localPath) return localPath

  // PNG 以外（webp 等）は同梱維持のため常に素通し（バケットに PNG しか無い）。
  if (!isRemotableAsset(localPath)) return localPath

  const remoteEnabledRaw = options?.remoteEnabled ?? readEnv('VITE_REMOTE_LESSON_ASSETS')
  if (!isRemoteEnabled(remoteEnabledRaw)) return localPath

  const baseUrl = (options?.baseUrl ?? readEnv('VITE_LESSON_ASSET_BASE_URL') ?? '').trim()
  if (!baseUrl) return localPath

  const fileName = fileNameOf(localPath)
  if (!fileName) return localPath

  return joinUrl(baseUrl, fileName)
}

/**
 * フラグ ON 状態でリモート取得が有効か（baseURL も設定済みか）を返す。
 * LazyAssetImage が「onError 時に bundled へフォールバックすべきか」を判定するのに使う。
 */
export function isRemoteAssetsActive(options?: ResolveAssetOptions): boolean {
  const remoteEnabledRaw = options?.remoteEnabled ?? readEnv('VITE_REMOTE_LESSON_ASSETS')
  if (!isRemoteEnabled(remoteEnabledRaw)) return false
  const baseUrl = (options?.baseUrl ?? readEnv('VITE_LESSON_ASSET_BASE_URL') ?? '').trim()
  return baseUrl.length > 0
}
