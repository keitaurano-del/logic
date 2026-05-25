/**
 * TtsControlPanel — レッスン / コース読み上げ中に表示するミュージックプレーヤー風の制御バー
 *
 * 表示位置: 画面下部 fixed (safe-area 考慮)
 * 構成:
 *   - シークバー (読み上げ対象スライド単位の現在位置 + ドラッグで頭出し)
 *   - トランスポート行: 10秒戻る / 一時停止・再開 (中央・大) / 10秒進む
 *   - 速度ボタン群 (0.75x 〜 2.0x) + ボイス選択 (女性 / 男性) — VoiceRateControls 共有
 *   - 閉じる (右上)
 *
 * ±10秒の挙動 (要件 9):
 *   - クラウド音声 (HTMLAudio, MP3) のときは時間シーク (audio.currentTime ±= 10)。
 *   - native / web TTS (時間軸なし) のときは前/次スライドへのジャンプにフォールバック。
 *   実際の判定・フォールバックは親 (LessonStoriesScreen) の onSkip 内で行う。
 *
 * ピッチ調整はこのバーには出さない (要件 11: 下部バーは男女2ボイス+速度+±10秒を優先)。
 *   ピッチはヘッドホンのポップオーバー (TtsPopover) 側に置く。
 *
 * 文言は中立的な丁寧体 (feedback_app_copy_neutral)。
 */
import { useCallback, useRef, useState } from 'react'
import { t } from '../i18n'
import { XIcon, RewindArrowIcon, ForwardArrowIcon } from '../icons'
import { VoiceRateControls } from './VoiceRateControls'

export interface TtsControlPanelProps {
  playing: boolean
  paused: boolean
  rate: number
  voiceId: string | null
  lang: 'ja-JP' | 'en-US'
  /** 読み上げ対象スライドの中での現在位置 (0-based)。range は [0, readableTotal - 1]。 */
  readableIndex: number
  /** 読み上げ対象スライドの総数。0 のときはシークバーを非表示にする。 */
  readableTotal: number
  /** シークバーから新しい位置が選ばれたときに親へ通知。 */
  onSeek: (readableIndex: number) => void
  onTogglePause: () => void
  onChangeRate: (rate: number) => void
  onChangeVoice: (voiceId: string | null) => void
  /** ±10秒スキップ。seconds は +10 / -10。クラウドは時間シーク、native/web はスライド送りにフォールバック (親で判断)。 */
  onSkip: (seconds: number) => void
  onExit: () => void
}

export function TtsControlPanel(props: TtsControlPanelProps) {
  const {
    playing, paused, rate, voiceId, lang,
    readableIndex, readableTotal,
    onSeek, onTogglePause, onChangeRate, onChangeVoice, onSkip, onExit,
  } = props
  // ドラッグ中の暫定値。確定 (pointerup) で onSeek を呼ぶ。
  const [draftIndex, setDraftIndex] = useState<number | null>(null)
  const sliderRef = useRef<HTMLDivElement>(null)
  const draggingRef = useRef(false)

  // 表示する位置: ドラッグ中なら draftIndex、それ以外は親から渡された readableIndex
  const displayIndex = draftIndex ?? readableIndex
  const isDragging = draftIndex !== null
  const maxIndex = Math.max(0, readableTotal - 1)
  const ratio = maxIndex > 0 ? Math.min(1, Math.max(0, displayIndex / maxIndex)) : 0

  const calcIndexFromClientX = useCallback((clientX: number): number => {
    const el = sliderRef.current
    if (!el || maxIndex <= 0) return 0
    const rect = el.getBoundingClientRect()
    const r = (clientX - rect.left) / Math.max(1, rect.width)
    const clamped = Math.min(1, Math.max(0, r))
    return Math.round(clamped * maxIndex)
  }, [maxIndex])

  const handleSliderPointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    e.stopPropagation()
    if (maxIndex <= 0) return
    draggingRef.current = true
    try { (e.target as Element).setPointerCapture?.(e.pointerId) } catch { /* */ }
    const next = calcIndexFromClientX(e.clientX)
    setDraftIndex(next)
  }, [calcIndexFromClientX, maxIndex])

  const handleSliderPointerMove = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return
    e.stopPropagation()
    const next = calcIndexFromClientX(e.clientX)
    setDraftIndex(next)
  }, [calcIndexFromClientX])

  const handleSliderPointerUp = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return
    e.stopPropagation()
    draggingRef.current = false
    const next = calcIndexFromClientX(e.clientX)
    setDraftIndex(null)
    onSeek(next)
  }, [calcIndexFromClientX, onSeek])

  const handleSliderKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (maxIndex <= 0) return
    let next: number | null = null
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') next = Math.max(0, readableIndex - 1)
    else if (e.key === 'ArrowRight' || e.key === 'ArrowUp') next = Math.min(maxIndex, readableIndex + 1)
    else if (e.key === 'Home') next = 0
    else if (e.key === 'End') next = maxIndex
    if (next != null) {
      e.preventDefault()
      e.stopPropagation()
      onSeek(next)
    }
  }, [maxIndex, onSeek, readableIndex])

  // ±10秒スキップボタンの共通スタイル（矢印 + 中央に「10」を重ねる）
  const skipBtnStyle: React.CSSProperties = {
    position: 'relative',
    width: 52, height: 52, borderRadius: '50%',
    background: 'var(--bg-tertiary, rgba(255,255,255,0.08))',
    color: 'var(--text-primary)',
    border: 'none', cursor: 'pointer',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    WebkitTapHighlightColor: 'transparent',
    flexShrink: 0,
  }
  const skipNumStyle: React.CSSProperties = {
    position: 'absolute',
    top: '50%', left: '50%', transform: 'translate(-50%, -42%)',
    fontSize: 10, fontWeight: 800,
    fontFamily: "'Inter Tight', sans-serif",
    pointerEvents: 'none',
  }

  return (
    <div
      role="region"
      aria-label={t('tts.controlPanel.title')}
      onPointerDown={(e) => e.stopPropagation()}
      onTouchStart={(e) => e.stopPropagation()}
      onTouchEnd={(e) => e.stopPropagation()}
      style={{
        position: 'fixed',
        left: 12,
        right: 12,
        bottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)',
        zIndex: 25,
        background: 'var(--bg-card)',
        borderRadius: 20,
        padding: '14px 16px 16px',
        boxShadow: '0 10px 36px rgba(0,0,0,0.45)',
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        fontFamily: "'Noto Sans JP', sans-serif",
        color: 'var(--text-primary)',
      }}
    >
      {/* 上段: タイトル + 閉じる */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: playing && !paused ? 'var(--brand)' : 'var(--text-muted)', boxShadow: playing && !paused ? `0 0 8px var(--brand)` : 'none' }} />
          <span style={{ fontSize: 13, fontWeight: 700 }}>{t('tts.modeOn')}</span>
          <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{t('tts.modeOnHint')}</span>
        </div>
        <button
          type="button"
          onPointerDown={(e) => { e.stopPropagation(); onExit() }}
          aria-label={t('tts.closePanel')}
          title={t('tts.closePanel')}
          style={{
            width: 32, height: 32, borderRadius: '50%',
            background: 'var(--bg-tertiary, rgba(255,255,255,0.08))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: 'none', cursor: 'pointer',
            color: 'var(--text-secondary)',
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          <XIcon width={14} height={14} />
        </button>
      </div>

      {/* シークバー: 読み上げ対象スライド内の現在位置を表示 + ドラッグで頭出し */}
      {readableTotal > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <div
            ref={sliderRef}
            role="slider"
            tabIndex={0}
            aria-label={t('tts.seek.label')}
            aria-valuemin={0}
            aria-valuemax={maxIndex}
            aria-valuenow={displayIndex}
            aria-valuetext={`${displayIndex + 1} / ${readableTotal}`}
            onPointerDown={handleSliderPointerDown}
            onPointerMove={handleSliderPointerMove}
            onPointerUp={handleSliderPointerUp}
            onPointerCancel={handleSliderPointerUp}
            onKeyDown={handleSliderKeyDown}
            style={{
              position: 'relative',
              width: '100%',
              height: 28,
              display: 'flex', alignItems: 'center',
              touchAction: 'none',
              cursor: maxIndex > 0 ? 'pointer' : 'default',
              outline: 'none',
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            {/* trail */}
            <div
              aria-hidden="true"
              style={{
                position: 'absolute', left: 0, right: 0, top: '50%', transform: 'translateY(-50%)',
                height: 4, borderRadius: 99,
                background: 'var(--bg-tertiary, rgba(255,255,255,0.12))',
              }}
            />
            {/* filled */}
            <div
              aria-hidden="true"
              style={{
                position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)',
                width: `${ratio * 100}%`, height: 4, borderRadius: 99,
                background: 'var(--brand)',
                transition: isDragging ? 'none' : 'width .15s ease',
              }}
            />
            {/* thumb */}
            <div
              aria-hidden="true"
              style={{
                position: 'absolute', left: `calc(${ratio * 100}% - 8px)`, top: '50%', transform: 'translateY(-50%)',
                width: 16, height: 16, borderRadius: '50%',
                background: 'var(--brand)',
                boxShadow: `0 2px 8px color-mix(in srgb, var(--brand) 50%, transparent)`,
                transition: isDragging ? 'none' : 'left .15s ease',
              }}
            />
          </div>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)',
            fontFamily: "'Inter Tight', sans-serif",
          }}>
            <span>{displayIndex + 1}</span>
            <span>{readableTotal}</span>
          </div>
        </div>
      )}

      {/* トランスポート行: 10秒戻る / 一時停止・再開 / 10秒進む */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 18 }}>
        <button
          type="button"
          onPointerDown={(e) => { e.stopPropagation(); onSkip(-10) }}
          aria-label={t('tts.skipBack')}
          title={t('tts.skipBack')}
          style={skipBtnStyle}
        >
          <RewindArrowIcon width={28} height={28} />
          <span aria-hidden="true" style={skipNumStyle}>10</span>
        </button>

        <button
          type="button"
          onPointerDown={(e) => { e.stopPropagation(); onTogglePause() }}
          aria-label={paused ? t('tts.resumeAria') : t('tts.pauseAria')}
          aria-pressed={paused}
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 64, height: 64,
            borderRadius: '50%',
            background: 'var(--brand)',
            color: '#FFFFFF',
            border: 'none',
            cursor: 'pointer',
            boxShadow: `0 4px 18px color-mix(in srgb, var(--brand) 38%, transparent)`,
            WebkitTapHighlightColor: 'transparent',
            flexShrink: 0,
          }}
        >
          {paused ? (
            <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
          ) : (
            <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <rect x="6" y="5" width="4" height="14" rx="1" />
              <rect x="14" y="5" width="4" height="14" rx="1" />
            </svg>
          )}
        </button>

        <button
          type="button"
          onPointerDown={(e) => { e.stopPropagation(); onSkip(10) }}
          aria-label={t('tts.skipForward')}
          title={t('tts.skipForward')}
          style={skipBtnStyle}
        >
          <ForwardArrowIcon width={28} height={28} />
          <span aria-hidden="true" style={skipNumStyle}>10</span>
        </button>
      </div>

      {/* 速度 + ボイス選択（VoiceRateControls 共有コンポ）。TtsPopover と実装共有。 */}
      <VoiceRateControls
        rate={rate}
        voiceId={voiceId}
        lang={lang}
        onChangeRate={onChangeRate}
        onChangeVoice={onChangeVoice}
      />
    </div>
  )
}
