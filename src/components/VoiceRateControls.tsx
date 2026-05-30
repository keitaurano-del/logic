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
import { useEffect, useMemo, useState } from 'react'
import { t } from '../i18n'
import * as tts from '../ttsService'

const RATE_OPTIONS = [0.75, 1.0, 1.25, 1.5, 2.0]

export interface VoiceRateControlsProps {
  rate: number
  voiceId: string | null
  lang: 'ja-JP' | 'en-US'
  onChangeRate: (rate: number) => void
  onChangeVoice: (voiceId: string | null) => void
  /**
   * （後方互換のため残す）ボイスメニューを上下どちらに開くか。
   * 現在は女性/男性の 2 択トグルになりドロップダウンを廃止したため未使用。
   */
  voiceMenuPlacement?: 'up' | 'down'
}

export function VoiceRateControls(props: VoiceRateControlsProps) {
  const { rate, voiceId, lang, onChangeRate, onChangeVoice } = props
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

  // 当該 lang の女性 / 男性ボイスを 1 つずつ抽出する。
  // cloud catalog は lang ごとに女性 1 / 男性 1 のみ。native/web フォールバックでも
  // gender 推定で女性 / 男性を 1 つずつ拾う（無ければ非表示）。
  const { female, male, selectedGender } = useMemo(() => {
    const langPrefix = lang.slice(0, 2).toLowerCase()
    const matched = allVoices.filter(v => v.lang.toLowerCase().startsWith(langPrefix))
    const f = matched.find(v => v.gender === 'female')
    const m = matched.find(v => v.gender === 'male')

    // 現在の選択がどちらか（id 一致で判定。未選択 = 既定 = 女性扱い）
    let sel: 'female' | 'male' = 'female'
    if (voiceId) {
      if (m && voiceId === m.id) sel = 'male'
      else if (f && voiceId === f.id) sel = 'female'
    }
    return { female: f, male: m, selectedGender: sel }
  }, [allVoices, lang, voiceId])

  return (
    <>
      {/* 速度ボタン群 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.7333rem', fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '.04em', flexShrink: 0 }}>
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
                  fontSize: '0.8667rem', fontWeight: 700,
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

      {/* ボイス選択: 女性 / 男性 の 2 択トグル */}
      {(female || male) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.7333rem', fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '.04em', flexShrink: 0 }}>
            {t('tts.voice.label')}
          </span>
          <div style={{ display: 'flex', gap: 4, flexWrap: 'nowrap' }}>
            {female && (
              <button
                type="button"
                onPointerDown={(e) => { e.stopPropagation(); onChangeVoice(female.id) }}
                aria-label={t('tts.voice.female')}
                aria-pressed={selectedGender === 'female'}
                style={{
                  minWidth: 64, height: 36,
                  padding: '0 14px',
                  borderRadius: 99,
                  background: selectedGender === 'female' ? 'var(--brand)' : 'var(--bg-tertiary, rgba(255,255,255,0.08))',
                  color: selectedGender === 'female' ? '#FFFFFF' : 'var(--text-primary)',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.8667rem', fontWeight: 700,
                  fontFamily: "'Noto Sans JP', sans-serif",
                  WebkitTapHighlightColor: 'transparent',
                  flexShrink: 0,
                }}
              >
                {t('tts.gender.female')}
              </button>
            )}
            {male && (
              <button
                type="button"
                onPointerDown={(e) => { e.stopPropagation(); onChangeVoice(male.id) }}
                aria-label={t('tts.voice.male')}
                aria-pressed={selectedGender === 'male'}
                style={{
                  minWidth: 64, height: 36,
                  padding: '0 14px',
                  borderRadius: 99,
                  background: selectedGender === 'male' ? 'var(--brand)' : 'var(--bg-tertiary, rgba(255,255,255,0.08))',
                  color: selectedGender === 'male' ? '#FFFFFF' : 'var(--text-primary)',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '0.8667rem', fontWeight: 700,
                  fontFamily: "'Noto Sans JP', sans-serif",
                  WebkitTapHighlightColor: 'transparent',
                  flexShrink: 0,
                }}
              >
                {t('tts.gender.male')}
              </button>
            )}
          </div>
        </div>
      )}
    </>
  )
}
