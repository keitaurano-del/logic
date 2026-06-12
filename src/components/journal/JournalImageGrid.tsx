import { useCallback, useEffect, useRef, useState } from 'react'
import { PlusIcon, XIcon, ArrowLeftIcon, ArrowRightIcon, RefreshIcon } from '../../icons'
import { t } from '../../i18n'
import {
  deleteJournalImage,
  getJournalImageUrls,
  uploadJournalImage,
  type ImageUploadError,
  type UploadStage,
} from './journalImages'
import { JOURNAL_IMAGE_MAX_COUNT, type JournalImage } from './types'

interface JournalImageGridProps {
  userId: string
  date: string
  images: JournalImage[]
  editing: boolean
  /** images 配列が変わったとき呼ばれる。親側で DB upsert する。 */
  onChange: (next: JournalImage[]) => void
  /** 親が保存中などで操作を止めたい時に true。 */
  disabled?: boolean
}

// JF-3: 進捗を可視化するためステージを細分化。
//   'compressing' = 圧縮中 / 'uploading' = ストレージ送信中 / 'error' = 失敗
type PendingStatus = 'compressing' | 'uploading' | 'error'

interface PendingUpload {
  id: string
  previewUrl: string
  file: File
  status: PendingStatus
  /** status === 'error' のとき表示する文言キー */
  errorCode?: ImageUploadError['code']
}

// JF-1: 同時アップロード数の上限（Storage への過負荷とメインスレッド占有を避ける）
const MAX_CONCURRENT_UPLOADS = 2

export function JournalImageGrid({ userId, date, images, editing, onChange, disabled }: JournalImageGridProps) {
  const [urls, setUrls] = useState<Record<string, string | null>>({})
  const [pending, setPending] = useState<PendingUpload[]>([])
  const [error, setError] = useState<string | null>(null)
  // JF-2/JF-1: 非同期アップロード完了時に「最新の」images を読むための ref。
  // クロージャに閉じ込めた古い images を onChange に渡して既存画像を取りこぼす事故を防ぐ。
  const imagesRef = useRef<JournalImage[]>(images)
  useEffect(() => { imagesRef.current = images }, [images])
  // pending の最新枚数を frame 計算で参照するための ref（古いクロージャでの枠超過を防ぐ）。
  const pendingRef = useRef<PendingUpload[]>(pending)
  useEffect(() => { pendingRef.current = pending }, [pending])
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  // pending preview の objectURL は unmount 時にクリーンアップする
  const pendingUrlsRef = useRef<Set<string>>(new Set())
  // アップロード成功直後、signed URL を取得し終わるまでローカル preview を保持するためのキャッシュ
  // path → objectURL。signed URL が urls に入ったら revoke する。
  const localPreviewRef = useRef<Map<string, string>>(new Map())
  // ライトボックスのスワイプ判定用（タップ開始座標）
  const touchStartRef = useRef<{ x: number; y: number } | null>(null)

  // images が変わったら signed URL を再フェッチ。
  // 取得中・取得失敗の path には localPreviewRef があれば fallback として使う。
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const paths = images.map((i) => i.path)
      if (paths.length === 0) {
        if (!cancelled) setUrls({})
        return
      }
      const next = await getJournalImageUrls(paths)
      if (cancelled) return
      // signed URL が取れた path はローカル preview を破棄しても OK
      for (const [p, localUrl] of localPreviewRef.current.entries()) {
        if (next[p]) {
          URL.revokeObjectURL(localUrl)
          localPreviewRef.current.delete(p)
        }
      }
      // signed URL が無い path（fetch 失敗 / 取得中）はローカル preview を埋める
      const merged: Record<string, string | null> = { ...next }
      for (const p of paths) {
        if (!merged[p]) {
          const local = localPreviewRef.current.get(p)
          if (local) merged[p] = local
        }
      }
      setUrls(merged)
    })()
    return () => { cancelled = true }
  }, [images])

  useEffect(() => () => {
    for (const url of pendingUrlsRef.current) URL.revokeObjectURL(url)
    pendingUrlsRef.current.clear()
    for (const url of localPreviewRef.current.values()) URL.revokeObjectURL(url)
    localPreviewRef.current.clear()
  }, [])

  const canAddMore = images.length + pending.length < JOURNAL_IMAGE_MAX_COUNT

  // 1 枚アップロードを実行し、結果に応じて pending の状態を更新する。
  // 成功時: localPreview を移管し pending から外して image を返す。
  // 失敗時: status='error' に戻し errorCode を返す。
  // state 更新はすべて関数更新形（prev => ...）。複数枚同時でも古いクロージャを参照しない。
  const runUpload = useCallback(async (
    slot: PendingUpload,
  ): Promise<{ image?: JournalImage; errorCode?: ImageUploadError['code'] }> => {
    const onStage = (stage: UploadStage) => {
      setPending((prev) => prev.map((p) =>
        p.id === slot.id ? { ...p, status: stage, errorCode: undefined } : p,
      ))
    }
    const { image, error: e } = await uploadJournalImage(userId, date, slot.file, onStage)
    if (image) {
      // 成功: signed URL が取れるまで使う暫定 preview を確保（slot.previewUrl を流用）
      localPreviewRef.current.set(image.path, slot.previewUrl)
      pendingUrlsRef.current.delete(slot.previewUrl)
      // ↑ pendingUrlsRef からは外したので unmount 時の revoke 対象は localPreviewRef 側に移管
      setPending((prev) => prev.filter((p) => p.id !== slot.id))
      // 最新 images（ref）に積む。古いクロージャの images を使わない（JF-2 取りこぼし防止）。
      const next = [...imagesRef.current, image]
      imagesRef.current = next
      onChange(next)
      return { image }
    }
    const errorCode = e?.code ?? 'upload-failed'
    setPending((prev) => prev.map((p) =>
      p.id === slot.id ? { ...p, status: 'error' as const, errorCode } : p,
    ))
    return { errorCode }
  }, [date, userId, onChange])

  // 並列数を MAX_CONCURRENT_UPLOADS に制限して slots を消化する簡易ワーカープール。
  const runBatch = useCallback(async (slots: PendingUpload[]) => {
    let cursor = 0
    const worker = async () => {
      while (cursor < slots.length) {
        const slot = slots[cursor++]
        await runUpload(slot)
      }
    }
    const workers = Array.from(
      { length: Math.min(MAX_CONCURRENT_UPLOADS, slots.length) },
      () => worker(),
    )
    await Promise.all(workers)
  }, [runUpload])

  const handleFilesPicked = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setError(null)
    // 最新の images/pending から残り枠を算出（古いクロージャを避けるため ref を参照）。
    // 連続で素早く選択しても pendingRef を同期更新するため枠超過しない。
    const currentImages = imagesRef.current.length
    const remaining = JOURNAL_IMAGE_MAX_COUNT - currentImages - pendingRef.current.length
    if (remaining <= 0) {
      setError(t('journal.imagesLimitReached', { max: String(JOURNAL_IMAGE_MAX_COUNT) }))
      return
    }
    const arr = Array.from(files).slice(0, remaining)
    if (files.length > remaining) {
      setError(t('journal.imagesLimitTrim', { max: String(JOURNAL_IMAGE_MAX_COUNT) }))
    }
    // pending を立てる (compressing 状態でローカル preview 即表示)。id は衝突しない一意値。
    const startedPending: PendingUpload[] = arr.map((f, i) => {
      const previewUrl = URL.createObjectURL(f)
      pendingUrlsRef.current.add(previewUrl)
      return {
        id: `${Date.now()}-${i}-${Math.random().toString(36).slice(2)}`,
        previewUrl,
        file: f,
        status: 'compressing' as const,
      }
    })
    // ref を即時更新してから setState（次の素早い選択が最新の枠を読めるように）。
    pendingRef.current = [...pendingRef.current, ...startedPending]
    setPending((prev) => [...prev, ...startedPending])
    await runBatch(startedPending)
  }, [runBatch])

  // 失敗した pending を再アップロード（JF-2）。runUpload が成功/失敗の state 遷移を一手に担う。
  const handleRetry = useCallback(async (slot: PendingUpload) => {
    setPending((prev) => prev.map((p) =>
      p.id === slot.id ? { ...p, status: 'compressing' as const, errorCode: undefined } : p,
    ))
    await runUpload(slot)
  }, [runUpload])

  // 失敗した pending を破棄
  const handleCancelPending = useCallback((slotId: string) => {
    setPending((prev) => {
      const target = prev.find((p) => p.id === slotId)
      if (target) {
        URL.revokeObjectURL(target.previewUrl)
        pendingUrlsRef.current.delete(target.previewUrl)
      }
      return prev.filter((p) => p.id !== slotId)
    })
  }, [])

  const handleAddClick = () => {
    if (!canAddMore || disabled) return
    fileInputRef.current?.click()
  }

  const handleRemove = async (idx: number) => {
    const target = images[idx]
    if (!target) return
    const next = images.filter((_, i) => i !== idx)
    // in-flight アップロードの完了が imagesRef.current を読んで [...current, image] を作るため、
    // 削除も即時に ref へ反映しておかないと、並行中の追加が削除済み画像を復活させうる。
    imagesRef.current = next
    onChange(next)
    // ローカル preview があれば破棄
    const localUrl = localPreviewRef.current.get(target.path)
    if (localUrl) {
      URL.revokeObjectURL(localUrl)
      localPreviewRef.current.delete(target.path)
    }
    // Storage からも削除（失敗してもユーザー操作はブロックしない。残った場合は孤児として放置）
    await deleteJournalImage(target.path)
    if (lightboxIdx !== null) {
      if (next.length === 0) setLightboxIdx(null)
      else if (lightboxIdx >= next.length) setLightboxIdx(next.length - 1)
    }
  }

  function pendingErrorLabel(code: ImageUploadError['code'] | undefined): string {
    if (code === 'invalid-type') return t('journal.imagesErrorType')
    if (code === 'too-large') return t('journal.imagesErrorSize')
    return t('journal.imagesErrorUpload')
  }

  const openLightbox = (idx: number) => setLightboxIdx(idx)
  const closeLightbox = () => setLightboxIdx(null)
  const lightboxPrev = () => {
    if (lightboxIdx === null) return
    setLightboxIdx((i) => (i === null ? null : (i - 1 + images.length) % images.length))
  }
  const lightboxNext = () => {
    if (lightboxIdx === null) return
    setLightboxIdx((i) => (i === null ? null : (i + 1) % images.length))
  }

  // Lightbox keyboard
  useEffect(() => {
    if (lightboxIdx === null) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.preventDefault(); closeLightbox() }
      else if (e.key === 'ArrowLeft' && images.length > 1) { e.preventDefault(); lightboxPrev() }
      else if (e.key === 'ArrowRight' && images.length > 1) { e.preventDefault(); lightboxNext() }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
    // lightboxPrev / lightboxNext は内部的に setState のみで安定
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightboxIdx, images.length])

  const showEmptyHint = !editing && images.length === 0 && pending.length === 0
  // JF-3: 進行中（圧縮 or 送信）の枚数。バッチ全体の進捗「N/M アップロード中」を出す。
  const inFlightCount = pending.filter((p) => p.status !== 'error').length
  const errorCount = pending.filter((p) => p.status === 'error').length

  return (
    <div className="journal-images">
      {showEmptyHint ? (
        <div className="journal-images__empty">{t('journal.imagesEmpty')}</div>
      ) : (
        <div className="journal-images__grid" role="list">
          {images.map((img, idx) => {
            const url = urls[img.path]
            return (
              <div key={img.path} className="journal-images__cell" role="listitem">
                <button
                  type="button"
                  className="journal-images__thumb-btn"
                  onClick={() => openLightbox(idx)}
                  aria-label={t('journal.imagesOpen', { n: String(idx + 1) })}
                  disabled={!url}
                >
                  {url ? (
                    <img
                      src={url}
                      alt=""
                      className="journal-images__thumb"
                      loading="lazy"
                    />
                  ) : (
                    <div className="journal-images__thumb journal-images__thumb--loading" aria-hidden="true" />
                  )}
                </button>
                {editing && (
                  <button
                    type="button"
                    className="journal-images__remove"
                    onClick={() => handleRemove(idx)}
                    aria-label={t('journal.imagesRemove', { n: String(idx + 1) })}
                    disabled={disabled}
                  >
                    <XIcon width={14} height={14} />
                  </button>
                )}
              </div>
            )
          })}
          {pending.map((p) => (
            <div
              key={p.id}
              className="journal-images__cell"
              role="listitem"
              aria-busy={p.status !== 'error'}
            >
              <div className="journal-images__thumb-btn journal-images__thumb-btn--uploading">
                <img src={p.previewUrl} alt="" className="journal-images__thumb" />
                {p.status !== 'error' && (
                  <>
                    <div className="journal-images__overlay" aria-hidden="true" />
                    {/* JF-3: 進捗インジケータ（indeterminate バー + スピナー）。
                        圧縮 / 送信のステージに応じて文言を出し分ける。 */}
                    <div className="journal-images__spinner" aria-hidden="true" />
                    <div className="journal-images__progress" aria-hidden="true">
                      <div className="journal-images__progress-bar" />
                    </div>
                    <div className="journal-images__status-label" aria-live="polite">
                      {p.status === 'compressing'
                        ? t('journal.imagesCompressing')
                        : t('journal.imagesUploading')}
                    </div>
                  </>
                )}
                {p.status === 'error' && (
                  <>
                    <div className="journal-images__overlay journal-images__overlay--error" aria-hidden="true" />
                    <div className="journal-images__status-label journal-images__status-label--error" role="alert">
                      {pendingErrorLabel(p.errorCode)}
                    </div>
                    <div className="journal-images__pending-actions">
                      <button
                        type="button"
                        className="journal-images__retry"
                        onClick={() => handleRetry(p)}
                        aria-label={t('journal.imagesRetry')}
                        disabled={disabled}
                      >
                        <RefreshIcon width={16} height={16} />
                        <span>{t('journal.imagesRetry')}</span>
                      </button>
                      <button
                        type="button"
                        className="journal-images__cancel"
                        onClick={() => handleCancelPending(p.id)}
                        aria-label={t('journal.imagesCancel')}
                        disabled={disabled}
                      >
                        <XIcon width={14} height={14} />
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
          {editing && canAddMore && (
            <button
              type="button"
              className="journal-images__add"
              onClick={handleAddClick}
              aria-label={t('journal.imagesAdd')}
              disabled={disabled}
            >
              <PlusIcon width={22} height={22} />
              <span className="journal-images__add-count">
                {images.length + pending.length}/{JOURNAL_IMAGE_MAX_COUNT}
              </span>
            </button>
          )}
        </div>
      )}

      {editing && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
          multiple
          onChange={(e) => {
            handleFilesPicked(e.target.files)
            e.target.value = ''
          }}
          style={{ display: 'none' }}
        />
      )}

      {/* JF-3: バッチ全体の進捗。複数枚アップロード中であることが一目で分かる。 */}
      {inFlightCount > 0 && (
        <div className="journal-images__batch-progress" role="status" aria-live="polite">
          {t('journal.imagesBatchProgress', {
            done: String(images.length),
            total: String(images.length + inFlightCount),
          })}
        </div>
      )}
      {inFlightCount === 0 && errorCount > 0 && (
        <div className="journal-images__error" role="alert">
          {t('journal.imagesBatchFailed', { n: String(errorCount) })}
        </div>
      )}

      {error && <div className="journal-images__error" role="alert">{error}</div>}

      {lightboxIdx !== null && images[lightboxIdx] && (
        <div className="journal-image-lightbox" role="dialog" aria-modal="true" aria-label={t('journal.imagesViewer')}>
          <button
            type="button"
            className="journal-image-lightbox__backdrop"
            onClick={closeLightbox}
            aria-label={t('common.close')}
          />
          <button
            type="button"
            className="journal-image-lightbox__close"
            onClick={closeLightbox}
            aria-label={t('common.close')}
          >
            <XIcon width={22} height={22} />
          </button>
          {images.length > 1 && (
            <button
              type="button"
              className="journal-image-lightbox__nav journal-image-lightbox__nav--prev"
              onClick={lightboxPrev}
              aria-label={t('journal.imagesPrev')}
            >
              <ArrowLeftIcon width={24} height={24} />
            </button>
          )}
          <div
            className="journal-image-lightbox__stage"
            onTouchStart={(e) => {
              const t0 = e.touches[0]
              if (t0) {
                touchStartRef.current = { x: t0.clientX, y: t0.clientY }
              }
            }}
            onTouchEnd={(e) => {
              const start = touchStartRef.current
              touchStartRef.current = null
              if (!start || images.length <= 1) return
              const t1 = e.changedTouches[0]
              if (!t1) return
              const dx = t1.clientX - start.x
              const dy = t1.clientY - start.y
              // 横スワイプ判定: 横移動が縦より大きく、しきい値超え
              if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
                if (dx < 0) lightboxNext()
                else lightboxPrev()
              }
            }}
          >
            {urls[images[lightboxIdx].path] ? (
              <img
                src={urls[images[lightboxIdx].path] ?? ''}
                alt=""
                className="journal-image-lightbox__img"
                draggable={false}
              />
            ) : (
              <div className="journal-image-lightbox__loading">{t('common.loading')}</div>
            )}
          </div>
          {images.length > 1 && (
            <button
              type="button"
              className="journal-image-lightbox__nav journal-image-lightbox__nav--next"
              onClick={lightboxNext}
              aria-label={t('journal.imagesNext')}
            >
              <ArrowRightIcon width={24} height={24} />
            </button>
          )}
          {images.length > 1 && (
            <div className="journal-image-lightbox__counter" aria-live="polite">
              {lightboxIdx + 1} / {images.length}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
