/**
 * src/components/LazyAssetImage.tsx
 *
 * AF-06 第1スライス: レッスン/コース画像の遅延読込ラッパー。
 *
 * - resolveAssetUrl() で解決した URL を読み込む（フラグ OFF＝デフォルトでは
 *   bundled の localPath をそのまま使うので挙動は不変）。
 * - 読込中は単色プレースホルダ（CSS 変数のみ・ハードコード hex なし）を敷く。
 * - リモート取得失敗時（フラグ ON でリモートが有効なときのみ）は bundled の
 *   localPath へ 1 回だけフォールバックする。既に bundled 表示なら通常どおり。
 * - loading="lazy" を付与する。
 *
 * props は既存 <img> 互換に近づける（className / alt / style 等を踏襲）。画像ソースは
 * src ではなく localPath（bundled パス）で受け取り、内部で解決する。
 */

import { useCallback, useMemo, useState } from 'react'
import type { CSSProperties } from 'react'
import { resolveAssetUrl, isRemoteAssetsActive } from '../lessonAssets'

export interface LazyAssetImageProps {
  /** 既存の bundled パス（例 '/images/v3/lesson-20.png'）。内部で resolveAssetUrl にかける。 */
  localPath: string
  /** 代替テキスト。装飾画像で空文字にしたい場合は明示的に '' を渡す。 */
  alt: string
  className?: string
  style?: CSSProperties
  /** 画像が収まるコンテナのスタイル（プレースホルダ表示にも使う）。 */
  containerStyle?: CSSProperties
  containerClassName?: string
}

export function LazyAssetImage({
  localPath,
  alt,
  className,
  style,
  containerStyle,
  containerClassName,
}: LazyAssetImageProps) {
  // フォールバック済みなら bundled の localPath を強制使用する。
  const [fellBack, setFellBack] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const remoteActive = useMemo(() => isRemoteAssetsActive(), [])
  const resolved = useMemo(() => resolveAssetUrl(localPath), [localPath])
  const src = fellBack ? localPath : resolved

  const handleError = useCallback(() => {
    // リモートが有効で、かつ今表示しているのが localPath でない（＝リモート URL）の
    // ときだけ bundled へフォールバックする。bundled 自体が失敗した場合は無限ループ
    // を避けるため何もしない。
    if (remoteActive && !fellBack && src !== localPath) {
      setFellBack(true)
      setLoaded(false)
    }
  }, [remoteActive, fellBack, src, localPath])

  const handleLoad = useCallback(() => setLoaded(true), [])

  // プレースホルダは単色ブロック（CSS 変数のみ）。読込完了で消す。
  const placeholderStyle: CSSProperties = {
    position: 'absolute',
    inset: 0,
    background: 'var(--bg-secondary)',
    opacity: loaded ? 0 : 1,
    transition: 'opacity 200ms ease',
    pointerEvents: 'none',
  }

  return (
    <div
      className={containerClassName}
      style={{ position: 'relative', overflow: 'hidden', ...containerStyle }}
    >
      <div aria-hidden="true" style={placeholderStyle} />
      <img
        src={src}
        alt={alt}
        loading="lazy"
        onError={handleError}
        onLoad={handleLoad}
        className={className}
        style={style}
      />
    </div>
  )
}

export default LazyAssetImage
