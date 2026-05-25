/**
 * VoiceRateControls — 速度（rate）選択 + ボイス選択の共有 UI。
 *
 * TtsControlPanel（レッスン読み上げ下部パネル）と TtsPopover（コース紹介ヘッドホン）の
 * 両方から使う。速度ボタン群とボイス選択ドロップダウンの実装重複を避けるために切り出した。
 *
 * ピッチ（低め/普通/高め）は TtsControlPanel 固有なのでここには含めない。
 * autoplay トグルも文脈依存なので親側で別途描画する。
 *
 * 文言は中立的な丁寧体（feedback_app_copy_neutral）。
 */
import { useCallback, useEffect, useMemo, useState } from 'react'
import { t } from '../i18n'
import * as tts from '../ttsService'
import { ChevronDownIcon } from '../icons'

const RATE_OPTIONS = [0.75, 1.0, 1.25, 1.5, 2.0]

type CategorizedVoice = {
  id: string | null // null = 自動
  name: string
  gender: tts.TtsGender | 'auto'
}

export interface VoiceRateControlsProps {
  rate: number
  voiceId: string | null
  lang: 'ja-JP' | 'en-US'
  onChangeRate: (rate: number) => void
  onChangeVoice: (voiceId: string | null) => void
  /** ボイスメニューを上方向に開くか（下部固定パネルでは上、ポップオーバーでは下）。既定: 下。 */
  voiceMenuPlacement?: 'up' | 'down'
}

export function VoiceRateControls(props: VoiceRateControlsProps) {
  const { rate, voiceId, lang, onChangeRate, onChangeVoice, voiceMenuPlacement = 'down' } = props
  const [voiceMenuOpen, setVoiceMenuOpen] = useState(false)
  const [allVoices, setAllVoices] = useState<tts.TtsVoice[]>([])

  // ボイス一覧をロード（locale / lang 変更で再取得）
  useEffect(() => {
    let alive = true
    void tts.getAvailableVoices().then((vs) => {
      if (!alive) return
      setAllVoices(vs)
    })
    return () => { alive = false }
  }, [lang])

  // 性別ラベル解決ヘルパー。formatVoiceLabel に渡す。
  const genderLabel = useCallback((g: tts.TtsGender): string => {
    if (g === 'female') return t('tts.gender.female')
    if (g === 'male') return t('tts.gender.male')
    return t('tts.gender.unknown')
  }, [])

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

    const others: CategorizedVoice[] = matched.map(v => ({
      id: v.id,
      name: tts.formatVoiceLabel(v, genderLabel),
      gender: v.gender,
    }))

    let displayName = t('tts.voice.auto')
    if (voiceId) {
      const raw = allVoices.find(v => v.id === voiceId)
      if (raw) {
        displayName = tts.formatVoiceLabel(raw, genderLabel)
      } else {
        displayName = t('tts.voice.auto')
      }
    }

    return { quickPicks: picks, otherVoices: others, currentVoice: displayName }
  }, [allVoices, lang, voiceId, genderLabel])

  return (
    <>
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
            <span style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
              <span style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 700, flexShrink: 0 }}>{t('tts.voice.label')}</span>
              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{currentVoice}</span>
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
                  ...(voiceMenuPlacement === 'up'
                    ? { bottom: 'calc(100% + 6px)' }
                    : { top: 'calc(100% + 6px)' }),
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
    </>
  )
}
