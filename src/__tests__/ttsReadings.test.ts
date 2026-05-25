/**
 * ttsReadings — TTS 読み上げ用テキストの記号正規化 (normalizeForSpeech) のユニットテスト。
 *
 * 表示テキストは変えず、読み上げ用テキストだけを変換する pure 関数を対象にする。
 * 各記号ルールと、過剰変換を避けるための「文脈限定」挙動、通常の日本語文が
 * 無変換であることを検証する。
 */
import { describe, expect, it } from 'vitest'
import { normalizeForSpeech } from '../ttsReadings'

const ja = (s: string) => normalizeForSpeech(s, 'ja-JP')
const en = (s: string) => normalizeForSpeech(s, 'en-US')

describe('normalizeForSpeech — ja-JP 無条件変換ルール', () => {
  it('× → かける（デフォルトはかける）', () => {
    expect(ja('2×3')).toBe('2かける3')
  })

  it('÷ → わる', () => {
    expect(ja('6÷2')).toBe('6わる2')
  })

  it('= / ＝ → イコール', () => {
    expect(ja('1+1=2')).toBe('1+1イコール2')
    expect(ja('1＝1')).toBe('1イコール1')
  })

  it('≠ → ノットイコール', () => {
    expect(ja('A≠B')).toBe('AノットイコールB')
  })

  it('≒ → ニアリーイコール', () => {
    expect(ja('π≒3.14')).toBe('πニアリーイコール3.14')
  })

  it('≦ / ≤ → 以下、≧ / ≥ → 以上', () => {
    expect(ja('x≦5')).toBe('x以下5')
    expect(ja('x≤5')).toBe('x以下5')
    expect(ja('x≧5')).toBe('x以上5')
    expect(ja('x≥5')).toBe('x以上5')
  })

  it('± → プラスマイナス', () => {
    expect(ja('5±1')).toBe('5プラスマイナス1')
  })

  it('% / ％ → パーセント', () => {
    expect(ja('50%')).toBe('50パーセント')
    expect(ja('50％')).toBe('50パーセント')
  })

  it('→ / ⇒ → 読点（やじるしと読ませない）', () => {
    expect(ja('A→B')).toBe('A、B')
    expect(ja('A⇒B')).toBe('A、B')
  })

  it('◯ / ○ → まる、△ → さんかく、□ → しかく', () => {
    expect(ja('◯')).toBe('まる')
    expect(ja('○')).toBe('まる')
    expect(ja('△')).toBe('さんかく')
    expect(ja('□')).toBe('しかく')
  })

  it('& / ＆ → と', () => {
    expect(ja('A&B')).toBe('AとB')
    expect(ja('A＆B')).toBe('AとB')
  })

  it('° → 度', () => {
    expect(ja('90°')).toBe('90度')
  })
})

describe('normalizeForSpeech — ja-JP 文脈限定変換', () => {
  it('< / > は数式文脈（数字を伴う）でのみ変換する', () => {
    expect(ja('3<5')).toBe('3より小さい5')
    expect(ja('5>3')).toBe('5より大きい3')
    expect(ja('a＜3')).toBe('aより小さい3')
  })

  it('< / > は HTML タグ風の文脈では変換しない（過剰変換回避）', () => {
    expect(ja('<div>')).toBe('<div>')
    expect(ja('a < b')).toBe('a < b') // 数字が無いので変換しない
  })

  it('〜 / ~ / ～ は前後が数字のときだけ「から」に変換する', () => {
    expect(ja('3〜5')).toBe('3から5')
    expect(ja('3~5')).toBe('3から5')
    expect(ja('3～5')).toBe('3から5')
  })

  it('〜 は通常の波線（数字を伴わない）では変換しない', () => {
    expect(ja('わーい〜')).toBe('わーい〜')
    expect(ja('お疲れ〜')).toBe('お疲れ〜')
  })
})

describe('normalizeForSpeech — ja-JP 複合・通常文', () => {
  it('5×3=15 → 5かける3イコール15', () => {
    expect(ja('5×3=15')).toBe('5かける3イコール15')
  })

  it('A〜B → AからB（範囲・両端が文字でも数字でなければ無変換のため確認）', () => {
    // 仕様: 〜 は前後が「数字」のときだけ変換する。A〜B は数字でないので無変換。
    expect(ja('A〜B')).toBe('A〜B')
  })

  it('数字に挟まれた範囲チルダは変換される', () => {
    expect(ja('1〜2')).toBe('1から2')
  })

  it('通常の日本語文は一切変換しない', () => {
    const s = 'これは普通の日本語の文章です。ひらがな・カタカナ・漢字には触れません。'
    expect(ja(s)).toBe(s)
  })

  it('空文字はそのまま返す', () => {
    expect(ja('')).toBe('')
  })
})

describe('normalizeForSpeech — en-US（軽め）', () => {
  it('× → times、÷ → divided by', () => {
    expect(en('2×3').replace(/\s+/g, ' ').trim()).toBe('2 times 3')
    expect(en('6÷2').replace(/\s+/g, ' ').trim()).toBe('6 divided by 2')
  })

  it('≠ → not equal to', () => {
    expect(en('A≠B').replace(/\s+/g, ' ').trim()).toBe('A not equal to B')
  })

  it('% → percent', () => {
    expect(en('50%').replace(/\s+/g, ' ').trim()).toBe('50 percent')
  })

  it('通常の英文は一切変換しない', () => {
    const s = 'This is a normal English sentence.'
    expect(en(s)).toBe(s)
  })
})
