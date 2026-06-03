/**
 * localStorage 使用量の実測 + クォータガード (FB-23)
 *
 * 背景:
 * - localStorage はオリジンあたり概ね 5MB 上限（ブラウザ実装依存）。
 * - Logic は成長キー（logic-ai-problems / logic-flashcards / logic-notebook /
 *   logic-progress / logic-stats / logic-activity-log 等）がユーザーの利用で
 *   肥大していく。上限に達すると setItem が QuotaExceededError を投げる。
 * - 既存コードの多くは try/catch で握り潰しており、上限到達で書き込みが
 *   黙って失敗し、データが消える / 反映されない事故になりうる。
 *
 * このモジュールが提供するもの:
 *  1. measureStorageUsage(): 全 `logic-*` キーの byte サイズを実測し、合計 /
 *     キー別内訳 / 上限に対する使用率を返す。dev/admin で内訳を可視化する土台。
 *  2. safeSetItem(): setItem のラッパ。QuotaExceeded を捕捉したら、握り潰さず
 *     「再取得・再生成できるキャッシュ」だけを古い順に間引いて再試行する。
 *     耐久データ（XP / プロフィール / 進捗 / studyDates / 保存コンテンツ等）は
 *     絶対に消さない。間引いてもダメなら最後は握るが console.warn で記録する。
 */

/** localStorage の概算上限（byte）。多くのブラウザで ~5MB（5,242,880 byte）。 */
export const STORAGE_QUOTA_BYTES = 5 * 1024 * 1024

/**
 * 1 文字を 2 byte（UTF-16）として概算する。
 * localStorage は内部的に UTF-16 で保持されるため、`key.length + value.length`
 * の合計に 2 を掛けたものが実バイト数の良い近似になる。
 */
export function approxByteSize(key: string, value: string): number {
  return (key.length + value.length) * 2
}

export interface KeyUsage {
  key: string
  bytes: number
}

export interface StorageUsageReport {
  /** logic-* キーの合計 byte 数 */
  totalBytes: number
  /** 概算上限に対する使用率 (0..1) */
  ratio: number
  /** 概算上限（byte） */
  quotaBytes: number
  /** キー別内訳（bytes 降順） */
  perKey: KeyUsage[]
}

/**
 * 全 `logic-*` localStorage キーの使用量を実測する。
 * key + value の length 合計を UTF-16 概算（×2）で byte 換算する。
 */
export function measureStorageUsage(quotaBytes: number = STORAGE_QUOTA_BYTES): StorageUsageReport {
  const perKey: KeyUsage[] = []
  let totalBytes = 0
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (!key || !key.startsWith('logic-')) continue
      const value = localStorage.getItem(key) ?? ''
      const bytes = approxByteSize(key, value)
      perKey.push({ key, bytes })
      totalBytes += bytes
    }
  } catch {
    // localStorage 自体が無効化されている等。空レポートを返す。
  }
  perKey.sort((a, b) => b.bytes - a.bytes)
  return {
    totalBytes,
    ratio: quotaBytes > 0 ? totalBytes / quotaBytes : 0,
    quotaBytes,
    perKey,
  }
}

/** 人間可読な byte 表記（dev/admin 表示・ログ用）。 */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}

/**
 * dev/admin 向け: 使用量内訳をコンソールに出す。?admin=1 / logic-dev-mode で
 * 開発者が「実機で実際どのキーがどれだけ食っているか」を確認するための導線。
 */
export function logStorageUsage(): StorageUsageReport {
  const report = measureStorageUsage()
  console.info(
    `[storage] ${formatBytes(report.totalBytes)} / ${formatBytes(report.quotaBytes)} ` +
      `(${(report.ratio * 100).toFixed(1)}%)`,
  )
  console.table(report.perKey.map((k) => ({ key: k.key, size: formatBytes(k.bytes), bytes: k.bytes })))
  return report
}

/**
 * eviction（間引き）対象にしてよいキャッシュ。
 *
 * 原則: 「サーバ再取得 or 再生成できるもの」だけを入れる。ローカルにしか無い
 * 耐久データは入れない。優先度の低い（捨てても害が小さい）順に並べる。
 *
 *  - logic-ai-problems: AI 生成問題。/api/user-problems/save でサーバにも
 *    保存されており、再ログインで再取得可能。古い順に部分的に間引ける。
 *  - logic-activity-log: その日やったことの履歴（最大 1000 件、ローカル専用だが
 *    純粋なログで、消えても XP / 進捗 / コンテンツには影響しない）。古い順に間引ける。
 *  - logic-search-history: 検索履歴。完全に再生成可能（捨てても害なし）。
 *  - logic-nav-snapshot: 復帰用ナビスナップショット。次回起動で再構築される。
 *
 * 注意: logic-flashcards はサーバ同期があるが SRS 進捗（interval/ease/復習日）を
 * 持つ耐久データなので eviction 対象に含めない（LOGOUT_KEEP_KEYS でも保持対象）。
 */
const EVICTABLE_KEYS: readonly string[] = [
  'logic-nav-snapshot',
  'logic-search-history',
  'logic-activity-log',
  'logic-ai-problems',
]

/** 値が「createdAt or ts を持つ配列」なら古い順に半分間引く。それ以外は全削除。 */
function shrinkOrRemove(key: string): boolean {
  const raw = localStorage.getItem(key)
  if (raw == null) return false
  try {
    const parsed = JSON.parse(raw)
    if (Array.isArray(parsed) && parsed.length > 1) {
      // createdAt（ISO 文字列）or ts（unix ms）で新しい順に並べ、上位半分だけ残す。
      const getTime = (e: unknown): number => {
        if (e && typeof e === 'object') {
          const o = e as Record<string, unknown>
          if (typeof o.createdAt === 'string') return Date.parse(o.createdAt) || 0
          if (typeof o.ts === 'number') return o.ts
        }
        return 0
      }
      const sorted = [...parsed].sort((a, b) => getTime(b) - getTime(a))
      const keep = sorted.slice(0, Math.floor(sorted.length / 2))
      localStorage.setItem(key, JSON.stringify(keep))
      return true
    }
  } catch {
    /* 配列でない / parse 不可 → 下の全削除にフォールバック */
  }
  // 配列でない、または 1 件以下 → キーごと削除（再生成・再取得できるもののみ）。
  localStorage.removeItem(key)
  return true
}

/**
 * QuotaExceededError かどうかの判定。ブラウザによって name / code が異なる。
 */
function isQuotaError(e: unknown): boolean {
  if (!e || typeof e !== 'object') return false
  const err = e as { name?: string; code?: number }
  return (
    err.name === 'QuotaExceededError' ||
    err.name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
    err.code === 22 ||
    err.code === 1014
  )
}

/**
 * 安全な setItem。QuotaExceeded を捕捉したら EVICTABLE_KEYS を順に間引いて
 * 再試行する。耐久データは消さない。最終的に書けなければ false を返す
 * （握り潰すが console.warn で記録する）。
 *
 * @param key   書き込むキー
 * @param value 書き込む値
 * @returns 書き込めたら true、間引いても書けなければ false
 */
export function safeSetItem(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value)
    return true
  } catch (e) {
    if (!isQuotaError(e)) {
      // QuotaExceeded 以外（localStorage 無効化等）は eviction しても無意味。
      console.warn(`[storage] setItem("${key}") failed (non-quota):`, e)
      return false
    }
  }

  // QuotaExceeded: 間引ける（再取得・再生成できる）キャッシュを順に削って再試行する。
  for (const evictKey of EVICTABLE_KEYS) {
    // 自分自身を書き込もうとして溢れているなら、自分は間引かない
    // （これから入れ替える新しい値を消すのは無意味）。
    if (evictKey === key) continue
    const changed = shrinkOrRemove(evictKey)
    if (!changed) continue
    try {
      localStorage.setItem(key, value)
      console.warn(`[storage] quota hit — evicted "${evictKey}" to fit "${key}".`)
      return true
    } catch (e2) {
      if (!isQuotaError(e2)) {
        console.warn(`[storage] setItem("${key}") failed after eviction (non-quota):`, e2)
        return false
      }
      // まだ足りない → 次の evict 候補へ
    }
  }

  // 間引いても入らなかった。耐久データは消さない方針なのでここで諦める。
  console.warn(
    `[storage] quota exceeded and could not free enough space for "${key}". ` +
      `Write skipped to protect durable data.`,
  )
  return false
}

/** テスト用に eviction 対象キーの一覧を公開する。 */
export const __EVICTABLE_KEYS_FOR_TEST = EVICTABLE_KEYS
