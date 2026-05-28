// ─── ジャーナル タグ統合ロジック（D3）──────────────────────────────
//
// 目的:
//   AI 自動タグ生成が固有タグを量産する問題（T-D）に対する「意味的統合」層。
//   T3（journalDb の tagMatchKey / normalizeTagDisplay）が「表記ゆれ」を畳むのに対し、
//   ここ（D3）は「意味は同じだが別の語」を 1 つへ寄せる層。完全に別軸で、T3 の上に乗る。
//
// 2 層構成:
//   層1（決定的・静的シード解決）:
//     tagVocabulary の canonicalizeTag を使った名寄せ。語彙にヒットすれば canonical
//     表示形へ、外れれば入力タグをそのまま返す。純粋関数なので vitest でカバーする。
//   層2（動的・自己統合）:
//     D2 で AI が返した consolidations ペア（from→to）を、その保存に関係するタグ集合
//     （今回保存するタグ + 既存タグ）へ適用する。完全自動だが、(a) スナップショット
//     による undo、(b) 同一 axis 内のみ統合許可する誤統合ガード、(c) 結果ログ、を備える。
//
// このファイルは client（JournalDetailSheet の保存フロー）と server（将来の検証）両方から
// import できる純粋モジュール（React / Supabase / Express に依存しない）。
//
// やらないこと（今回スコープ外）:
//   過去の全 daily_journals に対する物理一括バックフィル。あくまで「今後保存される
//   タグ」と「その保存に関係する既存タグ」への随時適用に限定する。

import {
  CANONICAL_TAGS,
  canonicalizeTag,
  matchCanonical,
  type CanonicalTag,
  type TagAxis,
} from './tagVocabulary'

// ─── 型定義 ──────────────────────────────────────────────────────

/**
 * AI（D2）が返す統合ペア。「from タグは to タグに吸収されるべき」を表す。
 * from / to は表示形の文字列（ja / en どちらでも、表記ゆれを含んでいてもよい）。
 */
export interface ConsolidationPair {
  from: string
  to: string
}

/** consolidation 適用の結果。スナップショット（undo 用）と適用ログを含む。 */
export interface ConsolidationResult {
  /** from→to を適用したあとのタグ配列（正規化・重複排除済み・出現順保持）。 */
  tags: string[]
  /** 適用前のタグ配列（undo 用スナップショット）。tags と参照が異なる新配列。 */
  snapshot: string[]
  /** 実際に適用された統合（ガードを通過し、対象タグが存在したものだけ）。 */
  applied: AppliedConsolidation[]
  /** ガード等で却下された統合（理由付き。デバッグ・ログ用）。 */
  rejected: RejectedConsolidation[]
  /** snapshot と tags が実質的に変化したか（トースト / undo 表示の出し分け用）。 */
  changed: boolean
}

export interface AppliedConsolidation {
  from: string
  to: string
  /** 実際に置き換えた表示形（to を canonical 名寄せした後の最終表示）。 */
  toDisplay: string
  /** 同一 axis 判定に使った axis（from / to が同じ canonical 軸の場合のみ値が入る）。 */
  axis: TagAxis | null
}

export type RejectReason =
  | 'same-tag'          // from と to が照合キー上同じ（統合の意味がない）
  | 'axis-mismatch'     // from / to が別 axis の canonical（誤統合ガード）
  | 'from-not-present'  // from タグが対象タグ集合に存在しない（適用しても無意味）
  | 'empty'             // from / to が空

export interface RejectedConsolidation {
  from: string
  to: string
  reason: RejectReason
}

// ─── 内部ヘルパー ────────────────────────────────────────────────
//
// T3 と二重実装しないため、照合キー生成は tagVocabulary の matchCanonical 経由で
// canonical を引いたうえで、canonical が無い素のタグは journalDb と同じ正規化規則で
// 比較キーを作る。journalDb.tagMatchKey を import すると client/server 両用にならない
// （journalDb が supabase に依存する）ため、ここでは同等の正規化を最小再現する。
// （tagVocabulary.ts の vocabKey と同じ規則。T3 が変わったらここも合わせること。）

function matchKey(raw: string): string {
  return raw
    .normalize('NFKC')
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/^[#＃]+/, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase()
}

/** 表示形の正規化（大小文字は畳まない）。journalDb.normalizeTagDisplay と同等。 */
const MAX_TAG_LENGTH = 24
function normalizeDisplay(raw: string): string {
  return raw
    .normalize('NFKC')
    .replace(/[\r\n\t]+/g, ' ')
    .replace(/^[#＃]+/, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, MAX_TAG_LENGTH)
}

/**
 * 2 つのタグが「同じ axis」と判断できるか。
 *   - 両方とも canonical にヒット → それぞれの axis を比較。
 *   - 片方でも canonical 外 → axis を確定できないので「ガードを通す」（= 許可）。
 *     語彙外タグ同士／語彙外と canonical の統合は AI の意味判断に委ねる
 *     （オープン方針。canonical 同士の明確な軸違いだけを誤統合として弾く）。
 * 戻り値: [許可するか, 判定に使った axis（canonical 同士で一致したときのみ）]
 */
function axisGuard(from: string, to: string): { allow: boolean; axis: TagAxis | null } {
  const fromC: CanonicalTag | undefined = matchCanonical(from)
  const toC: CanonicalTag | undefined = matchCanonical(to)
  if (fromC && toC) {
    if (fromC.axis === toC.axis) return { allow: true, axis: fromC.axis }
    return { allow: false, axis: null } // canonical 同士で axis が違う → 誤統合として弾く
  }
  // どちらかが語彙外 → axis を確定できないので許可（AI の意味判断を尊重）
  return { allow: true, axis: null }
}

// ─── 層1: 決定的・静的シード解決 ─────────────────────────────────

/**
 * タグ配列を統制語彙（tagVocabulary）で名寄せする純粋関数（層1）。
 *   - 各タグを canonicalizeTag で canonical 表示形へ寄せる（語彙外はそのまま）。
 *   - 名寄せの結果重複したものは照合キーで畳む（出現順は保持・先勝ち）。
 * T3 の表記ゆれ統合の「上」に乗る意味的名寄せ。tags 保存前に通す想定。
 */
export function canonicalizeTags(tags: string[], locale: 'ja' | 'en' = 'ja'): string[] {
  const out: string[] = []
  const seen = new Set<string>()
  for (const raw of tags) {
    const display = normalizeDisplay(canonicalizeTag(normalizeDisplay(raw), locale))
    if (!display) continue
    const key = matchKey(display)
    if (seen.has(key)) continue
    seen.add(key)
    out.push(display)
  }
  return out
}

// ─── 層2: 動的・自己統合 ──────────────────────────────────────────

/**
 * AI が返した consolidations を、対象タグ集合へ適用する純粋関数（層2）。
 *
 * @param currentTags  今回保存するタグ（このユーザーのこの保存で確定するタグ集合）
 * @param consolidations  AI 提案の from→to ペア
 * @param opts.existingTags  そのユーザーの既存タグ（from がここに居る場合も適用対象に含める）
 * @param opts.locale  名寄せ表示形の言語
 * @param opts.enforceAxisGuard  同一 axis 内のみ統合許可する誤統合ガード（既定 true）
 *
 * 振る舞い:
 *   1. currentTags を層1（canonicalizeTags）で名寄せ。これがベース。
 *   2. consolidations を順に評価。from が「currentTags の名寄せ後」か existingTags に
 *      存在し、ガードを通れば、その from を to（さらに canonical 名寄せ）へ置き換える。
 *      - currentTags 内の from → to へ書き換え。
 *      - to がまだ無ければ追加（from が existingTags 由来で currentTags に無い場合）。
 *   3. 置き換え後にもう一度照合キーで重複排除。
 *
 * スナップショット（result.snapshot）は層1適用前の元の currentTags のコピー。
 * undo はこの snapshot をそのまま setTags / upsert すれば戻せる。
 */
export function applyConsolidations(
  currentTags: string[],
  consolidations: ConsolidationPair[],
  opts: {
    existingTags?: string[]
    locale?: 'ja' | 'en'
    enforceAxisGuard?: boolean
  } = {},
): ConsolidationResult {
  const locale = opts.locale ?? 'ja'
  const enforceAxisGuard = opts.enforceAxisGuard ?? true
  const existingTags = opts.existingTags ?? []

  // undo 用スナップショット（書き換え前の生の currentTags）。
  const snapshot = [...currentTags]

  // 既存タグの照合キー集合（from がユーザーの既存タグに居るかの判定用）。
  // from を層1名寄せして照合するので、existing 側も名寄せ後のキーに揃える。
  const existingKeys = new Set(
    existingTags.map((t) => matchKey(normalizeDisplay(canonicalizeTag(t, locale)))).filter(Boolean),
  )

  // ベース = currentTags を層1で名寄せしたもの。
  let working = canonicalizeTags(currentTags, locale)

  const applied: AppliedConsolidation[] = []
  const rejected: RejectedConsolidation[] = []

  for (const pair of consolidations) {
    const from = normalizeDisplay(pair?.from ?? '')
    const to = normalizeDisplay(pair?.to ?? '')
    if (!from || !to) {
      rejected.push({ from: pair?.from ?? '', to: pair?.to ?? '', reason: 'empty' })
      continue
    }

    // from / to ともに層1名寄せ後の表示形を照合キーにする。working は既に
    // canonicalizeTags 済みなので、from も同じ名寄せを通さないと照合できない
    // （例: from="MTG" は working 内の "会議・打ち合わせ" と突き合わせる必要がある）。
    const fromDisplay = normalizeDisplay(canonicalizeTag(from, locale))
    const fromKey = matchKey(fromDisplay)
    // to は最終的に canonical 名寄せした表示形にする（より良い表現へ寄せる D2 の意図）。
    const toDisplay = normalizeDisplay(canonicalizeTag(to, locale))
    const toKey = matchKey(toDisplay)

    if (fromKey === toKey) {
      // from を名寄せすると to と同じ canonical になる（統合の意味がない）。
      rejected.push({ from, to, reason: 'same-tag' })
      continue
    }

    const guard = axisGuard(fromDisplay, toDisplay)
    if (enforceAxisGuard && !guard.allow) {
      rejected.push({ from, to, reason: 'axis-mismatch' })
      continue
    }

    // from が「今回の working（名寄せ済み）」か「ユーザーの既存タグ（名寄せして照合）」に存在するか。
    const inWorking = working.some((tg) => matchKey(tg) === fromKey)
    const inExisting = existingKeys.has(fromKey)
    if (!inWorking && !inExisting) {
      rejected.push({ from, to, reason: 'from-not-present' })
      continue
    }

    // working 内の from を to へ置換。working に from が無くても existing 由来なら
    // to を末尾に追加（後段の dedup で重複は畳まれる）。
    if (inWorking) {
      working = working.map((tg) => (matchKey(tg) === fromKey ? toDisplay : tg))
    } else {
      working = [...working, toDisplay]
    }

    applied.push({ from, to, toDisplay, axis: guard.axis })
  }

  // 置換後の重複排除（出現順保持・先勝ち）。
  const tags: string[] = []
  const seen = new Set<string>()
  for (const tg of working) {
    const display = normalizeDisplay(tg)
    if (!display) continue
    const key = matchKey(display)
    if (seen.has(key)) continue
    seen.add(key)
    tags.push(display)
  }

  // 変化判定: 生スナップショットを T3 正規化（大小文字・幅ゆれ・先頭#のみ畳む。
  // canonical 名寄せは"しない"）したものと最終結果を照合キーで比較する。
  // これにより、consolidations が空でも層1名寄せ（商談→会議・打ち合わせ等）で
  // 表示形が変わったケースも changed=true として検知できる。
  const baselineKeys = (() => {
    const out: string[] = []
    const seen = new Set<string>()
    for (const raw of snapshot) {
      const key = matchKey(raw)
      if (!key || seen.has(key)) continue
      seen.add(key)
      out.push(key)
    }
    return out
  })()
  const finalKeys = tags.map((tg) => matchKey(tg))
  const changed =
    applied.length > 0 ||
    baselineKeys.length !== finalKeys.length ||
    baselineKeys.some((k, i) => k !== finalKeys[i])

  return { tags, snapshot, applied, rejected, changed }
}

// ─── AI 出力パース（D2 ↔ D3 の橋渡し）────────────────────────────

/**
 * AI 応答に含まれる "CONSOLIDATIONS:" セクションをパースして ConsolidationPair[] にする。
 * D2 のプロンプトは 1 行 1 ペアで "from => to" 形式を出力するよう指示する。
 *   例:
 *     CONSOLIDATIONS:
 *     クライアントMTG => 会議・打ち合わせ
 *     顧客打ち合わせ => 会議・打ち合わせ
 * 形式違反・空・自己参照は安全に無視する（最大件数で打ち切り）。
 */
export function parseConsolidations(raw: string, maxPairs = 8): ConsolidationPair[] {
  if (typeof raw !== 'string' || !raw) return []
  const match = raw.match(/CONSOLIDATIONS:\s*([\s\S]*?)$/i)
  if (!match) return []
  const block = match[1]
  const pairs: ConsolidationPair[] = []
  const seen = new Set<string>()
  for (const line of block.split(/\r?\n/)) {
    if (pairs.length >= maxPairs) break
    const trimmed = line.trim()
    if (!trimmed) continue
    // "from => to" / "from -> to" / "from → to" を許容。
    const m = trimmed.match(/^(.+?)\s*(?:=>|->|→)\s*(.+)$/)
    if (!m) continue
    const from = normalizeDisplay(m[1].replace(/^[-*・]\s*/, '').replace(/["'`「」『』]/g, ''))
    const to = normalizeDisplay(m[2].replace(/["'`「」『』]/g, ''))
    if (!from || !to) continue
    const dedupeKey = `${matchKey(from)}=>${matchKey(to)}`
    if (seen.has(dedupeKey)) continue
    seen.add(dedupeKey)
    pairs.push({ from, to })
  }
  return pairs
}

/**
 * AI 応答末尾の "CONSOLIDATIONS:" セクションを本文から取り除く。
 * /tags は本文（タグ行）と consolidations を同じ応答で返すため、タグ抽出の前に
 * このセクションを剥がす。RECOMMENDED_* と同様、末尾を段階的に剥がす想定。
 */
export function stripConsolidationsSection(raw: string): string {
  if (typeof raw !== 'string') return ''
  const match = raw.match(/\n?\s*CONSOLIDATIONS:\s*[\s\S]*$/i)
  if (!match || match.index === undefined) return raw.trim()
  return raw.slice(0, match.index).trim()
}

/** canonical のうち、ある軸に属する語の表示形を列挙（プロンプト補助・テスト用）。 */
export function canonicalDisplaysByAxis(axis: TagAxis, locale: 'ja' | 'en' = 'ja'): string[] {
  return CANONICAL_TAGS.filter((t) => t.axis === axis).map((t) => (locale === 'en' ? t.en : t.ja))
}
