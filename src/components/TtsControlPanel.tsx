/**
 * TtsControlPanel — レッスン読み上げモード時に表示する制御パネル
 *
 * 表示位置: 画面下部 fixed (safe-area 考慮)
 * 構成:
 *   - シークバー (読み上げ対象スライド単位の現在位置 + ドラッグで頭出し)
 *   - 一時停止 / 再開ボタン (中央、大きめ)
 *   - 速度ボタン群 (0.75x / 1.0x / 1.25x / 1.5x / 2.0x、横スクロール可)
 *   - ボイス選択 (利用可能ボイスから「自動」「男性」「女性」の代表 + その他のリスト)
 *   - 停止ボタン (右上)
 *
 * 親 (LessonStoriesScreen) との連携:
 *   - playing / paused / rate / voiceId / readableIndex / readableTotal は親が管理
 *   - 各操作は親が公開した callback (onTogglePause / onChangeRate / onChangeVoice / onSeek / onExit) を呼ぶ
 *
 * 文言は中立的な丁寧体 (feedback_app_copy_neutral)。
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { t } from '../i18n'
import * as tts from '../ttsService'
import { XIcon, ChevronDownIcon } from '../icons'

const RATE_OPTIONS = [0.75, 1.0, 1.25, 1.5, 2.0]

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
  onExit: () => void
}

type CategorizedVoice = {
  id: string | null  // null = 自動
  name: string
  gender: tts.TtsGender | 'auto'
}

export function TtsControlPanel(props: TtsControlPanelProps) {
  const {
    playing, paused, rate, voiceId, lang,
    readableIndex, readableTotal,
    onSeek, onTogglePause, onChangeRate, onChangeVoice, onExit,
  } = props
  const [voiceMenuOpen, setVoiceMenuOpen] = useState(false)
  const [allVoices, setAllVoices] = useState<tts.TtsVoice[]>([])
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

  // ボイス一覧をロード（locale / lang 変更で再取得）
  useEffect(() => {
    let alive = true
    void tts.getAvailableVoices().then((vs) => {
      if (!alive) return
      setAllVoices(vs)
    })
    return () => { alive = false }
  }, [lang])

  // 表示用に整形: 当該 lang のボイスのみ抽出し、性別ごとに代表を選ぶ
  const { quickPicks, otherVoices, currentVoice } = useMemo(() => {
    const langPrefix = lang.slice(0, 2).toLowerCase()
    const matched = allVoices.filter(v => v.lang.toLowerCase().startsWith(langPrefix))

    const female = matched.find(v => v.gender === 'female')
    const male = matched.find(v => v.gender === 'male')

    const picks: CategorizedVoice[] = [
      { id: null, name: t('tts.voice.auto'), gender: 'auto' },
    ]
    if (female) picks.push({ id: female.id, name: t('tts.voice.female'), gender: 'female' })
    if (male) picks.push({ id: male.id, name: t('tts.voice.male'), gender: 'male' })

    const usedIds = new Set(picks.map(p => p.id).filter((x): x is string => x !== null))
    const others: CategorizedVoice[] = matched
      .filter(v => !usedIds.has(v.id))
      .map(v => ({
        id: v.id,
        name: v.name,
        gender: v.gender,
      }))

    // 現在選択中の表示名を解決
    let displayName = t('tts.voice.auto')
    if (voiceId) {
      const inPicks = picks.find(p => p.id === voiceId)
      const inOthers = others.find(o => o.id === voiceId)
      if (inPicks) displayName = inPicks.name
      else if (inOthers) displayName = inOthers.name
      else {
        // フォールバック: allVoices から名前だけ取り出す
        const raw = allVoices.find(v => v.id === voiceId)
        if (raw) displayName = raw.name
      }
    }

    return { quickPicks: picks, otherVoices: others, currentVoice: displayName }
  }, [allVoices, lang, voiceId])

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

      {/* 中段: 一時停止/再開 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <button
          type="button"
          onPointerDown={(e) => { e.stopPropagation(); onTogglePause() }}
          aria-label={paused ? t('tts.resumeAria') : t('tts.pauseAria')}
          aria-pressed={paused}
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            minWidth: 168, height: 52,
            borderRadius: 99,
            background: 'var(--brand)',
            color: '#FFFFFF',
            border: 'none',
            cursor: 'pointer',
            fontSize: 15, fontWeight: 700,
            boxShadow: `0 4px 18px color-mix(in srgb, var(--brand) 38%, transparent)`,
            WebkitTapHighlightColor: 'transparent',
          }}
        >
          {paused ? (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
              {t('tts.resume')}
            </>
          ) : (
            <>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <rect x="6" y="5" width="4" height="14" rx="1" />
                <rect x="14" y="5" width="4" height="14" rx="1" />
              </svg>
              {t('tts.pause')}
            </>
          )}
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

      {/* 速度ボタン群 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'space-between' }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '.04em', flexShrink: 0 }}>
          {t('tts.speed')}
        </span>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'nowrap', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          {RATE_OPTIONS.map((r) => {
            const active = Math.abs(r - rate) < 0.001
            const label = `${r.toFixed(2).replace(/\.?0+$/, '')}x`
            return (
              <button
                key={r}
                type="button"
                onPointerDown={(e) => { e.stopPropagation(); onChangeRate(r) }}
                aria-label={t('tts.speed') + ' ' + label}
                aria-pressed={active}
                style={{
                  minWidth: 52, height: 36,
                  padding: '0 12px',
                  borderRadius: 99,
                  background: active ? 'var(--brand)' : 'var(--bg-tertiary, rgba(255,255,255,0.08))',
                  color: active ? '#FFFFFF' : 'var(--text-primary)',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 13, fontWeight: 700,
                  fontFamily: "'Inter Tight', sans-serif",
                  WebkitTapHighlightColor: 'transparent',
                  flexShrink: 0,
                }}
              >
                {label}
              </button>
            )
          })}
        </div>
      </div>

      {/* ボイス選択 */}
      {(quickPicks.length > 1 || otherVoices.length > 0) && (
        <div style={{ position: 'relative' }}>
          <button
            type="button"
            onPointerDown={(e) => { e.stopPropagation(); setVoiceMenuOpen(v => !v) }}
            aria-haspopup="listbox"
            aria-expanded={voiceMenuOpen}
            style={{
              width: '100%', minHeight: 42,
              borderRadius: 12,
              background: 'var(--bg-tertiary, rgba(255,255,255,0.08))',
              border: 'none',
              color: 'var(--text-primary)',
              padding: '8px 14px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              cursor: 'pointer',
              fontSize: 13, fontWeight: 600,
              WebkitTapHighlightColor: 'transparent',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 700 }}>{t('tts.voice.label')}</span>
              <span>{currentVoice}</span>
            </span>
            <ChevronDownIcon width={14} height={14} />
          </button>

          {voiceMenuOpen && (
            <>
              <button
                type="button"
                aria-label={t('common.close')}
                onPointerDown={(e) => { e.stopPropagation(); setVoiceMenuOpen(false) }}
                style={{ position: 'fixed', inset: 0, background: 'transparent', border: 'none', zIndex: 26, padding: 0, cursor: 'default' }}
              />
              <div
                role="listbox"
                aria-label={t('tts.voice.label')}
                style={{
                  position: 'absolute',
                  bottom: 'calc(100% + 6px)',
                  left: 0, right: 0,
                  background: 'var(--bg-primary)',
                  borderRadius: 14,
                  padding: 6,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                  zIndex: 27,
                  maxHeight: 240,
                  overflowY: 'auto',
                  display: 'flex', flexDirection: 'column', gap: 2,
                }}
              >
                {quickPicks.map((v) => {
                  const active = (v.id ?? null) === voiceId
                  return (
                    <button
                      key={`pick-${v.id ?? 'auto'}`}
                      type="button"
                      role="option"
                      aria-selected={active}
                      onPointerDown={(e) => {
                        e.stopPropagation()
                        onChangeVoice(v.id)
                        setVoiceMenuOpen(false)
                      }}
                      style={{
                        background: active ? `color-mix(in srgb, var(--brand) 18%, transparent)` : 'transparent',
                        color: active ? 'var(--brand)' : 'var(--text-primary)',
                        border: 'none', borderRadius: 10,
                        padding: '10px 12px', fontSize: 13, fontWeight: active ? 700 : 500,
                        textAlign: 'left', cursor: 'pointer',
                        WebkitTapHighlightColor: 'transparent',
                      }}
                    >
                      {v.name}
                    </button>
                  )
                })}
                {otherVoices.length > 0 && (
                  <>
                    <div style={{ borderTop: '1px solid var(--border, rgba(255,255,255,0.08))', margin: '4px 0' }} />
                    {otherVoices.map((v) => {
                      const active = v.id === voiceId
                      return (
                        <button
                          key={`other-${v.id}`}
                          type="button"
                          role="option"
                          aria-selected={active}
                          onPointerDown={(e) => {
                            e.stopPropagation()
                            onChangeVoice(v.id)
                            setVoiceMenuOpen(false)
                          }}
                          style={{
                            background: active ? `color-mix(in srgb, var(--brand) 18%, transparent)` : 'transparent',
                            color: active ? 'var(--brand)' : 'var(--text-primary)',
                            border: 'none', borderRadius: 10,
                            padding: '10px 12px', fontSize: 12, fontWeight: active ? 700 : 500,
                            textAlign: 'left', cursor: 'pointer',
                            WebkitTapHighlightColor: 'transparent',
                          }}
                        >
                          {v.name}
                        </button>
                      )
                    })}
                  </>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
