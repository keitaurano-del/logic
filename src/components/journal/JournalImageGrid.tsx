import { useCallback, useEffect, useRef, useState } from 'react'
import { PlusIcon, XIcon, ArrowLeftIcon, ArrowRightIcon } from '../../icons'
import { t } from '../../i18n'
import {
  deleteJournalImage,
  getJournalImageUrls,
  uploadJournalImage,
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

interface PendingUpload {
  id: string
  previewUrl: string
}

export function JournalImageGrid({ userId, date, images, editing, onChange, disabled }: JournalImageGridProps) {
  const [urls, setUrls] = useState<Record<string, string | null>>({})
  const [pending, setPending] = useState<PendingUpload[]>([])
  const [error, setError] = useState<string | null>(null)
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  // pending preview の objectURL は unmount 時にクリーンアップする
  const pendingUrlsRef = useRef<Set<string>>(new Set())

  // images が変わったら signed URL を再フェッチ
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const paths = images.map((i) => i.path)
      if (paths.length === 0) {
        if (!cancelled) setUrls({})
        return
      }
      const next = await getJournalImageUrls(paths)
      if (!cancelled) setUrls(next)
    })()
    return () => { cancelled = true }
  }, [images])

  useEffect(() => () => {
    for (const url of pendingUrlsRef.current) URL.revokeObjectURL(url)
    pendingUrlsRef.current.clear()
  }, [])

  const canAddMore = images.length + pending.length < JOURNAL_IMAGE_MAX_COUNT

  const handleFilesPicked = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setError(null)
    const remaining = JOURNAL_IMAGE_MAX_COUNT - images.length - pending.length
    if (remaining <= 0) {
      setError(t('journal.imagesLimitReached', { max: String(JOURNAL_IMAGE_MAX_COUNT) }))
      return
    }
    const arr = Array.from(files).slice(0, remaining)
    if (files.length > remaining) {
      setError(t('journal.imagesLimitTrim', { max: String(JOURNAL_IMAGE_MAX_COUNT) }))
    }
    // pending を立てる
    const startedPending: PendingUpload[] = arr.map((f) => {
      const previewUrl = URL.createObjectURL(f)
      pendingUrlsRef.current.add(previewUrl)
      return { id: `${Date.now()}-${Math.random()}`, previewUrl }
    })
    setPending((prev) => [...prev, ...startedPending])

    // 順次アップロード（並列だと Storage 側でレート気になるので直列）
    const successful: JournalImage[] = []
    const failedMsgs: string[] = []
    for (let i = 0; i < arr.length; i++) {
      const file = arr[i]
      const slot = startedPending[i]
      const { image, error: e } = await uploadJournalImage(userId, date, file)
      // 進行中アイテムを 1 つ消す
      setPending((prev) => prev.filter((p) => p.id !== slot.id))
      URL.revokeObjectURL(slot.previewUrl)
      pendingUrlsRef.current.delete(slot.previewUrl)
      if (image) {
        successful.push(image)
      } else if (e) {
        if (e.code === 'invalid-type') failedMsgs.push(t('journal.imagesErrorType'))
        else if (e.code === 'too-large') failedMsgs.push(t('journal.imagesErrorSize'))
        else {
          // upload-failed / compress-failed / no-auth は原因が画面で分からないと
          // 詰むので、コード + メッセージを表示する。
          failedMsgs.push(`${t('journal.imagesErrorUpload')}（${e.code}: ${e.message}）`)
        }
      }
    }
    if (successful.length > 0) {
      onChange([...images, ...successful])
    }
    if (failedMsgs.length > 0) {
      setError(Array.from(new Set(failedMsgs)).join(' / '))
    }
  }, [date, images, onChange, pending.length, userId])

  const handleAddClick = () => {
    if (!canAddMore || disabled) return
    fileInputRef.current?.click()
  }

  const handleRemove = async (idx: number) => {
    const target = images[idx]
    if (!target) return
    const next = images.filter((_, i) => i !== idx)
    onChange(next)
    // Storage からも削除（失敗してもユーザー操作はブロックしない。残った場合は孤児として放置）
    await deleteJournalImage(target.path)
    if (lightboxIdx !== null) {
      if (next.length === 0) setLightboxIdx(null)
      else if (lightboxIdx >= next.length) setLightboxIdx(next.length - 1)
    }
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
            <div key={p.id} className="journal-images__cell" role="listitem" aria-busy="true">
              <div className="journal-images__thumb-btn journal-images__thumb-btn--uploading">
                <img src={p.previewUrl} alt="" className="journal-images__thumb" />
                <div className="journal-images__spinner" aria-hidden="true" />
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
          // HEIC/HEIF を accept に入れない（iOS が JPEG に自動変換するように）。
          // Capacitor / Safari の WebView では HEIC を Canvas でデコードできないため。
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={(e) => {
            handleFilesPicked(e.target.files)
            e.target.value = ''
          }}
          style={{ display: 'none' }}
        />
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
          <div className="journal-image-lightbox__stage">
            {urls[images[lightboxIdx].path] ? (
              <img
                src={urls[images[lightboxIdx].path] ?? ''}
                alt=""
                className="journal-image-lightbox__img"
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
