import { describe, expect, it } from 'vitest'
import {
  canonicalizeTags,
  applyConsolidations,
  parseConsolidations,
  stripConsolidationsSection,
  canonicalDisplaysByAxis,
} from '../components/journal/tagConsolidation'

// ─── 層1: 決定的・静的シード解決（canonicalizeTags）────────────────
describe('canonicalizeTags (層1: 統制語彙による名寄せ)', () => {
  it('synonym を canonical 表示形へ寄せる（ja）', () => {
    // 「クライアントMTG」「顧客打ち合わせ」「商談」はすべて meeting canonical（会議・打ち合わせ）。
    expect(canonicalizeTags(['クライアントMTG'], 'ja')).toEqual(['会議・打ち合わせ'])
    expect(canonicalizeTags(['顧客打ち合わせ'], 'ja')).toEqual(['会議・打ち合わせ'])
    expect(canonicalizeTags(['商談'], 'ja')).toEqual(['会議・打ち合わせ'])
  })

  it('意味が同じ複数タグを 1 つに畳む（量産の解消）', () => {
    const result = canonicalizeTags(['クライアントMTG', '顧客打ち合わせ', 'お客さん訪問'], 'ja')
    expect(result).toEqual(['会議・打ち合わせ'])
  })

  it('locale=en では英語 canonical に寄せる', () => {
    expect(canonicalizeTags(['クライアントMTG'], 'en')).toEqual(['meeting'])
    expect(canonicalizeTags(['集中'], 'en')).toEqual(['deep work'])
  })

  it('語彙外タグはそのまま残す（オープン方針）', () => {
    expect(canonicalizeTags(['田中さんとの1on1案件X'], 'ja')).toEqual(['田中さんとの1on1案件X'])
  })

  it('canonical 語と語彙外語が混在しても両方保持（順序維持）', () => {
    const result = canonicalizeTags(['商談', '特命プロジェクトZ', '集中'], 'ja')
    expect(result).toEqual(['会議・打ち合わせ', '特命プロジェクトZ', '集中作業'])
  })

  it('T3 表記ゆれ（全角/大小文字/先頭#）を吸収したうえで名寄せ', () => {
    // ＭＴＧ（全角）→ NFKC で MTG → meeting canonical。先頭 # も剥がす。
    expect(canonicalizeTags(['＃ＭＴＧ'], 'ja')).toEqual(['会議・打ち合わせ'])
    expect(canonicalizeTags(['MEETING'], 'en')).toEqual(['meeting'])
  })

  it('空文字・空白のみは除去する', () => {
    expect(canonicalizeTags(['', '   ', '集中'], 'ja')).toEqual(['集中作業'])
  })

  // ─── 粒度引き上げ: プロセス段階・状態モディファイア派生を親概念へ畳む ───
  it('「X準備 / Xサポート / X進行」などライフイベント派生を親イベントへ畳む', () => {
    // 出産: 準備・サポート・産後・妊娠 → すべて親「出産」
    expect(canonicalizeTags(['出産準備', '出産サポート', '産後'], 'ja')).toEqual(['出産'])
    // 引っ越し: 準備・進行・完了 → すべて親「引っ越し」（1 つに畳む）
    expect(canonicalizeTags(['引っ越し準備', '引っ越し進行', '引っ越し完了'], 'ja')).toEqual(['引っ越し'])
    // 結婚: 準備・入籍 → 親「結婚」
    expect(canonicalizeTags(['結婚準備', '入籍'], 'ja')).toEqual(['結婚'])
    // 育児: 子育て・育休 → 親「育児」
    expect(canonicalizeTags(['子育て', '育休'], 'ja')).toEqual(['育児'])
  })

  it('「仕事多忙 / 仕事完了 / 残業」など状態派生を親「仕事」へ畳む', () => {
    expect(canonicalizeTags(['仕事多忙', '仕事完了', '残業'], 'ja')).toEqual(['仕事'])
    // 繁忙期・激務も仕事へ
    expect(canonicalizeTags(['繁忙期'], 'ja')).toEqual(['仕事'])
  })

  it('状態語の単独形は元の situation/mood canonical を尊重する（複合形だけ親へ）', () => {
    // 「繁忙」単独は situation:多忙 のまま（仕事へは寄せない）
    expect(canonicalizeTags(['繁忙'], 'ja')).toEqual(['多忙'])
    // 「準備」単独は action:計画・段取り のまま（特定イベントへ寄せない）
    expect(canonicalizeTags(['準備'], 'ja')).toEqual(['計画・段取り'])
  })

  it('転職まわりの派生は親「キャリア」へ畳む', () => {
    expect(canonicalizeTags(['転職準備', '転職活動', '就活'], 'ja')).toEqual(['キャリア'])
  })

  it('ライフイベント派生は en locale でも英語 canonical へ寄る', () => {
    expect(canonicalizeTags(['出産準備'], 'en')).toEqual(['childbirth'])
    expect(canonicalizeTags(['引っ越し準備'], 'en')).toEqual(['moving'])
    expect(canonicalizeTags(['残業'], 'en')).toEqual(['work'])
  })
})

// ─── 層2: 動的・自己統合（applyConsolidations）────────────────────
describe('applyConsolidations (層2: AI 統合ペアの適用)', () => {
  it('from→to を currentTags に適用して書き換える', () => {
    const result = applyConsolidations(
      ['プロジェクトA定例', '集中'],
      [{ from: 'プロジェクトA定例', to: '会議・打ち合わせ' }],
      { locale: 'ja' },
    )
    expect(result.tags).toContain('会議・打ち合わせ')
    expect(result.tags).not.toContain('プロジェクトA定例')
    expect(result.applied).toHaveLength(1)
    expect(result.changed).toBe(true)
  })

  it('スナップショットは統合前の生タグを保持する（undo 用）', () => {
    const input = ['プロジェクトA定例', '集中']
    const result = applyConsolidations(
      input,
      [{ from: 'プロジェクトA定例', to: '会議・打ち合わせ' }],
      { locale: 'ja' },
    )
    expect(result.snapshot).toEqual(['プロジェクトA定例', '集中'])
    // snapshot は元配列と参照が異なる（破壊されない）
    expect(result.snapshot).not.toBe(input)
  })

  it('同一 axis ガード: 別 axis の canonical 同士の統合は却下する', () => {
    // 「会議・打ち合わせ」(action) を「前向き」(mood) に吸収させようとする誤統合。
    const result = applyConsolidations(
      ['会議・打ち合わせ'],
      [{ from: '会議・打ち合わせ', to: '前向き' }],
      { locale: 'ja', enforceAxisGuard: true },
    )
    expect(result.applied).toHaveLength(0)
    expect(result.rejected[0]).toMatchObject({ reason: 'axis-mismatch' })
    // 統合されないので元の canonical のまま
    expect(result.tags).toEqual(['会議・打ち合わせ'])
  })

  it('同一 axis 内の canonical 統合は許可し axis を記録する', () => {
    // どちらも action 軸。会議→アウトプット（意味的には極端だが軸は同じなので許可される例）。
    const result = applyConsolidations(
      ['会議・打ち合わせ'],
      [{ from: '会議・打ち合わせ', to: 'アウトプット' }],
      { locale: 'ja', enforceAxisGuard: true },
    )
    expect(result.applied).toHaveLength(1)
    expect(result.applied[0].axis).toBe('action')
  })

  it('片方が語彙外の統合はガードを通す（axis 確定不能なので AI 判断を尊重）', () => {
    const result = applyConsolidations(
      ['特命プロジェクトZ'],
      [{ from: '特命プロジェクトZ', to: '仕事' }],
      { locale: 'ja', enforceAxisGuard: true },
    )
    expect(result.applied).toHaveLength(1)
    expect(result.applied[0].axis).toBeNull()
    expect(result.tags).toContain('仕事')
  })

  it('from が currentTags にも existingTags にも無ければ却下する', () => {
    const result = applyConsolidations(
      ['集中'],
      [{ from: '存在しないタグ', to: '会議・打ち合わせ' }],
      { locale: 'ja' },
    )
    expect(result.applied).toHaveLength(0)
    expect(result.rejected[0]).toMatchObject({ reason: 'from-not-present' })
  })

  it('from が existingTags 由来なら to を追加する', () => {
    const result = applyConsolidations(
      ['集中'],
      [{ from: '古い商談タグ', to: '会議・打ち合わせ' }],
      { locale: 'ja', existingTags: ['古い商談タグ'] },
    )
    // currentTags に from は無いが existing 由来なので to を追加
    expect(result.tags).toContain('会議・打ち合わせ')
    expect(result.applied).toHaveLength(1)
  })

  it('from と to が同一（照合キー一致）なら却下する', () => {
    const result = applyConsolidations(
      ['会議・打ち合わせ'],
      [{ from: 'MTG', to: '会議・打ち合わせ' }], // MTG は meeting synonym = 同じ canonical
      { locale: 'ja' },
    )
    expect(result.applied).toHaveLength(0)
    expect(result.rejected[0]).toMatchObject({ reason: 'same-tag' })
  })

  it('空の from/to は却下する', () => {
    const result = applyConsolidations(
      ['集中'],
      [{ from: '', to: '会議・打ち合わせ' }, { from: '集中', to: '' }],
      { locale: 'ja' },
    )
    expect(result.applied).toHaveLength(0)
    expect(result.rejected).toHaveLength(2)
    expect(result.rejected.every((r) => r.reason === 'empty')).toBe(true)
  })

  it('統合後に重複したタグは畳む', () => {
    // 「商談」「クライアントMTG」両方を「会議・打ち合わせ」に寄せる → 1 つに。
    const result = applyConsolidations(
      ['商談', 'クライアントMTG', '集中'],
      [
        { from: '商談', to: '会議・打ち合わせ' },
        { from: 'クライアントMTG', to: '会議・打ち合わせ' },
      ],
      { locale: 'ja' },
    )
    const meetingCount = result.tags.filter((t) => t === '会議・打ち合わせ').length
    expect(meetingCount).toBe(1)
    expect(result.tags).toContain('集中作業')
  })

  it('consolidations が空でも層1名寄せは効く（changed 判定）', () => {
    // consolidations 無しでも「商談」は層1で「会議・打ち合わせ」に寄るので changed=true。
    const result = applyConsolidations(['商談'], [], { locale: 'ja' })
    expect(result.tags).toEqual(['会議・打ち合わせ'])
    expect(result.changed).toBe(true)
    expect(result.applied).toHaveLength(0)
  })

  it('変化が無ければ changed=false', () => {
    const result = applyConsolidations(['会議・打ち合わせ', '集中作業'], [], { locale: 'ja' })
    expect(result.changed).toBe(false)
  })

  it('enforceAxisGuard=false で軸違いも許可する', () => {
    const result = applyConsolidations(
      ['会議・打ち合わせ'],
      [{ from: '会議・打ち合わせ', to: '前向き' }],
      { locale: 'ja', enforceAxisGuard: false },
    )
    expect(result.applied).toHaveLength(1)
  })
})

// ─── AI 出力パース（parseConsolidations / stripConsolidationsSection）──
describe('parseConsolidations', () => {
  it('CONSOLIDATIONS セクションから from=>to を抽出', () => {
    const raw = `会議、集中
CONSOLIDATIONS:
クライアントMTG => 会議・打ち合わせ
顧客打ち合わせ => 会議・打ち合わせ`
    expect(parseConsolidations(raw)).toEqual([
      { from: 'クライアントMTG', to: '会議・打ち合わせ' },
      { from: '顧客打ち合わせ', to: '会議・打ち合わせ' },
    ])
  })

  it('-> と → 区切りも許容', () => {
    const raw = `CONSOLIDATIONS:
foo -> bar
baz → qux`
    expect(parseConsolidations(raw)).toEqual([
      { from: 'foo', to: 'bar' },
      { from: 'baz', to: 'qux' },
    ])
  })

  it('行頭の箇条書き記号・引用符を除去', () => {
    const raw = `CONSOLIDATIONS:
- "商談" => "会議・打ち合わせ"`
    expect(parseConsolidations(raw)).toEqual([{ from: '商談', to: '会議・打ち合わせ' }])
  })

  it('CONSOLIDATIONS セクションが無ければ空配列', () => {
    expect(parseConsolidations('会議、集中、読書')).toEqual([])
  })

  it('重複ペアは排除する', () => {
    const raw = `CONSOLIDATIONS:
商談 => 会議・打ち合わせ
商談 => 会議・打ち合わせ`
    expect(parseConsolidations(raw)).toHaveLength(1)
  })

  it('maxPairs で打ち切る', () => {
    const lines = Array.from({ length: 20 }, (_, i) => `from${i} => to${i}`).join('\n')
    const raw = `CONSOLIDATIONS:\n${lines}`
    expect(parseConsolidations(raw, 3)).toHaveLength(3)
  })

  it('不正な行（区切り無し）はスキップ', () => {
    const raw = `CONSOLIDATIONS:
これは統合行ではない
foo => bar`
    expect(parseConsolidations(raw)).toEqual([{ from: 'foo', to: 'bar' }])
  })
})

describe('stripConsolidationsSection', () => {
  it('CONSOLIDATIONS セクションを本文から剥がす', () => {
    const raw = `会議、集中、読書
CONSOLIDATIONS:
商談 => 会議・打ち合わせ`
    expect(stripConsolidationsSection(raw)).toBe('会議、集中、読書')
  })

  it('セクションが無ければそのまま返す', () => {
    expect(stripConsolidationsSection('会議、集中')).toBe('会議、集中')
  })
})

describe('canonicalDisplaysByAxis', () => {
  it('指定 axis の canonical 表示形を列挙する', () => {
    const moods = canonicalDisplaysByAxis('mood', 'ja')
    expect(moods).toContain('前向き')
    expect(moods).toContain('疲労')
    // action 軸の語は含まない
    expect(moods).not.toContain('会議・打ち合わせ')
  })
})
