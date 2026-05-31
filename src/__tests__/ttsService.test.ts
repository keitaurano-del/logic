/**
 * ttsService — rate 永続化 / formatVoiceLabel / loadVoiceId のユニットテスト
 *
 * 本ファイルは Web Speech API / Capacitor 非対応の jsdom 環境で実行されるため、
 * 実際に音声を流す speak() / stop() / pause() は検証しない。代わりに
 * localStorage に絡む pure ロジックと表示名ヘルパーだけを対象にする。
 */
import { describe, expect, it, beforeEach, afterEach, vi } from 'vitest'
import {
  loadRate,
  saveRate,
  stepRate,
  loadVoiceId,
  saveVoiceId,
  loadAutoplay,
  saveAutoplay,
  subscribeAutoplay,
  formatVoiceLabel,
  makeCloudVoiceId,
  isCloudVoiceId,
  parseCloudVoiceId,
  isCloudAvailable,
  type TtsVoice,
  type TtsGender,
} from '../ttsService'

const labelFor = (g: TtsGender): string => {
  if (g === 'female') return '女性'
  if (g === 'male') return '男性'
  return 'ボイス'
}

describe('ttsService — rate persistence', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('loadRate: 未設定時はデフォルト 1.0 を返す', () => {
    expect(loadRate()).toBe(1.0)
  })

  it('saveRate → loadRate: 範囲内の値はそのまま保存される', () => {
    saveRate(1.5)
    expect(loadRate()).toBe(1.5)
  })

  it('saveRate: 範囲外の値はクランプされる (上限 2.0)', () => {
    saveRate(10)
    expect(loadRate()).toBe(2.0)
  })

  it('saveRate: 範囲外の値はクランプされる (下限 0.5)', () => {
    saveRate(0.1)
    expect(loadRate()).toBe(0.5)
  })
})

describe('ttsService — stepRate (fine adjust)', () => {
  it('1.0 から +1 ステップで 1.05 になる', () => {
    expect(stepRate(1.0, 1)).toBe(1.05)
  })

  it('1.0 から -1 ステップで 0.95 になる', () => {
    expect(stepRate(1.0, -1)).toBe(0.95)
  })

  it('プリセット 1.25 から +1 ステップで 1.3 になる', () => {
    expect(stepRate(1.25, 1)).toBe(1.3)
  })

  it('上限クランプ: 2.0 から +1 しても 2.0 のまま', () => {
    expect(stepRate(2.0, 1)).toBe(2.0)
  })

  it('下限クランプ: 0.5 から -1 しても 0.5 のまま', () => {
    expect(stepRate(0.5, -1)).toBe(0.5)
  })

  it('結果は 0.05 グリッド / 小数2桁に正規化され float ドリフトしない', () => {
    // 0.1 + 0.05 が 0.15000000000000002 にならないこと
    const r = stepRate(0.1 + 0.6, 1) // 0.7 起点 +0.05 → 0.75
    expect(r).toBe(0.75)
    // 任意の半端な値でも 0.05 グリッドにスナップされる
    expect(stepRate(1.07, 1)).toBe(1.1)
    expect(stepRate(1.13, -1)).toBe(1.1)
    // 2桁を超える小数が残らない
    const v = stepRate(1.0, 1)
    expect(Number(v.toFixed(2))).toBe(v)
  })
})

describe('ttsService — voice id persistence', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('loadVoiceId: 未設定時は null を返す', () => {
    expect(loadVoiceId()).toBe(null)
  })

  it('saveVoiceId → loadVoiceId: 文字列で保存される', () => {
    saveVoiceId('ja-JP|Kyoko')
    expect(loadVoiceId()).toBe('ja-JP|Kyoko')
  })

  it('saveVoiceId(null): localStorage エントリが削除される', () => {
    saveVoiceId('ja-JP|Kyoko')
    saveVoiceId(null)
    expect(loadVoiceId()).toBe(null)
  })
})

describe('ttsService.formatVoiceLabel', () => {
  it('voice.name + 性別 + lang を中黒で連結する (女性)', () => {
    const voice: TtsVoice = {
      id: 'ja-JP|Kyoko',
      name: 'Kyoko',
      lang: 'ja-JP',
      gender: 'female',
    }
    expect(formatVoiceLabel(voice, labelFor)).toBe('Kyoko · 女性 · ja-JP')
  })

  it('voice.name + 性別 + lang を中黒で連結する (男性)', () => {
    const voice: TtsVoice = {
      id: 'ja-JP|Otoya',
      name: 'Otoya',
      lang: 'ja-JP',
      gender: 'male',
    }
    expect(formatVoiceLabel(voice, labelFor)).toBe('Otoya · 男性 · ja-JP')
  })

  it('性別不明のときは性別ラベルが「ボイス」になる', () => {
    const voice: TtsVoice = {
      id: 'en-US|Microsoft David',
      name: 'Microsoft David',
      lang: 'en-US',
      gender: 'unknown',
    }
    expect(formatVoiceLabel(voice, labelFor)).toBe('Microsoft David · ボイス · en-US')
  })

  it('voice.name が空のときは lang をフォールバック名にする', () => {
    const voice: TtsVoice = {
      id: 'ja-JP|',
      name: '',
      lang: 'ja-JP',
      gender: 'female',
    }
    // name が空 → 'ja-JP' を name 代わりに使う → そのあと lang も付くので重複する点は許容
    expect(formatVoiceLabel(voice, labelFor)).toBe('ja-JP · 女性 · ja-JP')
  })

  it('同名・同 lang の複数ボイスでも性別が違えば表示が区別される', () => {
    const a: TtsVoice = { id: 'ja-JP|A', name: 'A', lang: 'ja-JP', gender: 'female' }
    const b: TtsVoice = { id: 'ja-JP|A2', name: 'A', lang: 'ja-JP', gender: 'male' }
    expect(formatVoiceLabel(a, labelFor)).not.toBe(formatVoiceLabel(b, labelFor))
  })
})

describe('ttsService — autoplay persistence', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('loadAutoplay: 未設定時はデフォルト ON (true) を返す', () => {
    expect(loadAutoplay()).toBe(true)
  })

  it('saveAutoplay(false) → loadAutoplay: OFF が保存される', () => {
    saveAutoplay(false)
    expect(loadAutoplay()).toBe(false)
  })

  it('saveAutoplay(true) → loadAutoplay: ON が保存される', () => {
    saveAutoplay(false)
    saveAutoplay(true)
    expect(loadAutoplay()).toBe(true)
  })

  it('loadAutoplay: localStorage に不正値があるときはデフォルト ON に倒す', () => {
    localStorage.setItem('logic-tts-autoplay', 'not-a-bool')
    expect(loadAutoplay()).toBe(true)
  })

  it('subscribeAutoplay: saveAutoplay 呼び出しでコールバックが通知される', () => {
    const seen: boolean[] = []
    const unsub = subscribeAutoplay((v) => { seen.push(v) })
    saveAutoplay(false)
    saveAutoplay(true)
    unsub()
    saveAutoplay(false) // unsub 後は通知されない
    expect(seen).toEqual([false, true])
  })
})

describe('ttsService — cloud voice id helpers', () => {
  it('makeCloudVoiceId: cloud| プレフィックス付きで生成する', () => {
    expect(makeCloudVoiceId('ja-JP', 'ja-JP-Neural2-C')).toBe('cloud|ja-JP|ja-JP-Neural2-C')
  })

  it('isCloudVoiceId: cloud| 始まりだけ true', () => {
    expect(isCloudVoiceId('cloud|ja-JP|ja-JP-Neural2-C')).toBe(true)
    expect(isCloudVoiceId('ja-JP|Kyoko')).toBe(false)
    expect(isCloudVoiceId(null)).toBe(false)
    expect(isCloudVoiceId(undefined)).toBe(false)
  })

  it('parseCloudVoiceId: lang と voiceName を分解する', () => {
    expect(parseCloudVoiceId('cloud|ja-JP|ja-JP-Neural2-C')).toEqual({
      lang: 'ja-JP',
      voiceName: 'ja-JP-Neural2-C',
    })
    expect(parseCloudVoiceId('cloud|en-US|en-US-Neural2-F')).toEqual({
      lang: 'en-US',
      voiceName: 'en-US-Neural2-F',
    })
  })

  it('parseCloudVoiceId: 形式不正 / 非クラウド / 未対応 lang は null', () => {
    expect(parseCloudVoiceId('ja-JP|Kyoko')).toBe(null)
    expect(parseCloudVoiceId('cloud|ja-JP')).toBe(null)
    expect(parseCloudVoiceId('cloud|fr-FR|fr-FR-Voice')).toBe(null)
    expect(parseCloudVoiceId('cloud||name')).toBe(null)
  })

  it('makeCloudVoiceId → parseCloudVoiceId は往復で一致する', () => {
    const id = makeCloudVoiceId('en-US', 'en-US-Neural2-D')
    expect(parseCloudVoiceId(id)).toEqual({ lang: 'en-US', voiceName: 'en-US-Neural2-D' })
  })
})

describe('ttsService — isCloudAvailable', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('navigator.onLine が false のときだけ false', () => {
    vi.stubGlobal('navigator', { onLine: false })
    expect(isCloudAvailable()).toBe(false)
  })

  it('navigator.onLine が true のときは true', () => {
    vi.stubGlobal('navigator', { onLine: true })
    expect(isCloudAvailable()).toBe(true)
  })
})
