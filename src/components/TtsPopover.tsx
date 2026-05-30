/**
 * TtsPopover — ヘッドホンアイコンのボタン + タップで開く軽量ポップオーバー。
 *
 * 用途: コースを再生（カテゴリ表示モードのヘッダー）。
 * 中身:
 *   - 再生 / 停止ボタン（コースのレッスン本文を読み上げ・停止）
 *   - 速度（rate）選択 + ボイス選択（女性 / 男性。VoiceRateControls 共有コンポ）
 *
 * seek は含めない（起動前のポップオーバーには再生位置が無いため）。
 *
 * 設計:
 *   - 再生状態（playing）と再生/停止トグルは親が制御する（onTogglePlay）。
 *     コース一覧では同一グループの連鎖再生・active id 管理を親（RoadmapScreenV3）が持つため。
 *   - rate / voiceId はこのコンポ内で tts.loadRate/saveRate・loadVoiceId/saveVoiceId に直接読み書きする。
 *   - 端末が TTS 非サポートなら何も描画しない。
 *   - ポップオーバーは外側タップ / × で閉じる。カードの onClick と干渉しないよう stopPropagation する。
 *
 * 文言は中立的な丁寧体（feedback_app_copy_neutral）。
 */
import { useCallback, useRef, useState } from 'react'
import { t } from '../i18n'
import * as tts from '../ttsService'
import { HeadphonesIcon, XIcon } from '../icons'
import { VoiceRateControls } from './VoiceRateControls'

export interface TtsPopoverProps {
  lang: 'ja-JP' | 'en-US'
  /** このポップオーバーの対象が現在再生中か（親が制御）。 */
  playing: boolean
  /** 再生 / 停止トグル。親が連鎖再生・active id 管理を行う。 */
  onTogglePlay: () => void
  /** ヘッドホンボタンの追加スタイル（ヘッダーでは inline など）。 */
  buttonStyle?: React.CSSProperties
  /** ヘッドホンアイコンのサイズ（px）。既定 16。 */
  iconSize?: number
}

export function TtsPopover(props: TtsPopoverProps) {
  const { lang, playing, onTogglePlay, buttonStyle, iconSize = 16 } = props
  const [open, setOpen] = useState(false)
  const [rate, setRate] = useState<number>(() => tts.loadRate())
  const [voiceId, setVoiceId] = useState<string | null>(() => tts.loadVoiceId())
  const rootRef = useRef<HTMLDivElement>(null)

  const handleChangeRate = useCallback((r: number) => {
    tts.saveRate(r)
    setRate(r)
  }, [])

  const handleChangeVoice = useCallback((id: string | null) => {
    tts.saveVoiceId(id)
    setVoiceId(id)
  }, [])

  if (!tts.isSupported()) return null

  return (
    <div ref={rootRef} style={{ position: 'relative', ...(buttonStyle?.position ? {} : { display: 'inline-flex' }) }}>
      {/* ヘッドホンボタン */}
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setOpen(v => !v) }}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={t('tts.headphonesAria')}
        title={t('tts.headphonesAria')}
        style={{
          width: 32, height: 32, borderRadius: '50%',
          background: playing ? 'var(--brand)' : 'var(--bg-tertiary, rgba(255,255,255,0.08))',
          border: 'none',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
          color: playing ? '#FFFFFF' : 'var(--text-secondary)',
          WebkitTapHighlightColor: 'transparent',
          boxShadow: playing ? `0 2px 10px color-mix(in srgb, var(--brand) 50%, transparent)` : 'none',
          ...buttonStyle,
        }}
      >
        <HeadphonesIcon width={iconSize} height={iconSize} />
      </button>

      {open && (
        <>
          {/* 外側タップで閉じる透明オーバーレイ */}
          <button
            type="button"
            aria-label={t('common.close')}
            onClick={(e) => { e.stopPropagation(); setOpen(false) }}
            onPointerDown={(e) => e.stopPropagation()}
            style={{ position: 'fixed', inset: 0, background: 'transparent', border: 'none', zIndex: 40, padding: 0, cursor: 'default' }}
          />
          {/* ポップオーバー本体 */}
          <div
            role="dialog"
            aria-label={t('tts.controlPanel.title')}
            onPointerDown={(e) => e.stopPropagation()}
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              width: 248,
              maxWidth: '78vw',
              background: 'var(--bg-card)',
              borderRadius: 16,
              padding: 14,
              boxShadow: '0 12px 38px rgba(0,0,0,0.45)',
              zIndex: 41,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              fontFamily: "'Noto Sans JP', sans-serif",
              color: 'var(--text-primary)',
              textAlign: 'left',
            }}
          >
            {/* 上段: タイトル + 閉じる */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8667rem', fontWeight: 700 }}>{t('tts.coursePlay.title')}</span>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); setOpen(false) }}
                aria-label={t('common.close')}
                title={t('common.close')}
                style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: 'var(--bg-tertiary, rgba(255,255,255,0.08))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: 'none', cursor: 'pointer',
                  color: 'var(--text-secondary)',
                  WebkitTapHighlightColor: 'transparent',
                }}
              >
                <XIcon width={12} height={12} />
              </button>
            </div>

            {/* 再生 / 停止ボタン */}
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onTogglePlay() }}
              aria-label={playing ? t('tts.coursePlay.stop') : t('tts.coursePlay.play')}
              aria-pressed={playing}
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                width: '100%', height: 46,
                borderRadius: 99,
                background: 'var(--brand)',
                color: '#FFFFFF',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.9333rem', fontWeight: 700,
                boxShadow: `0 4px 16px color-mix(in srgb, var(--brand) 36%, transparent)`,
                WebkitTapHighlightColor: 'transparent',
              }}
            >
              {playing ? (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="6" y="6" width="12" height="12" rx="1.5" /></svg>
                  {t('tts.coursePlay.stop')}
                </>
              ) : (
                <>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>
                  {t('tts.coursePlay.play')}
                </>
              )}
            </button>

            {/* 速度 + ボイス選択（女性 / 男性） */}
            <VoiceRateControls
              rate={rate}
              voiceId={voiceId}
              lang={lang}
              onChangeRate={handleChangeRate}
              onChangeVoice={handleChangeVoice}
            />
          </div>
        </>
      )}
    </div>
  )
}
