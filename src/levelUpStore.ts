/**
 * Level Up / Rank Up イベント検知・通知用ストア
 *
 * レッスン完了時 (handleComplete) に `recordLessonCompleteEvent(prevXp, newXp)` を呼ぶと
 * - レベルが上がった → pending levelUp イベントを sessionStorage に積む
 * - 称号 (TitleKey) が変わった → pending rankUp イベントを sessionStorage に積む
 *
 * AppV3 の useEffect が pending イベントを監視し、LevelUpModal / RankUpModal を表示する。
 * モーダルを閉じると consumeXxxEvent() で消費。
 *
 * Phase 4: ホーム画面のトーストは pending toast キーで別管理 (1度表示したら消す)。
 */
import { getCurrentLevel, getTitleKeyForLevel, type TitleKey } from './screens/homeHelpers'

const LEVEL_UP_KEY = 'logic-pending-levelup'
const RANK_UP_KEY = 'logic-pending-rankup'
const TOAST_KEY = 'logic-pending-levelup-toast'

export type LevelUpEvent = {
  prevLevel: number
  newLevel: number
  newXp: number
}

export type RankUpEvent = {
  prevTitleKey: TitleKey
  newTitleKey: TitleKey
  newLevel: number
  newXp: number
}

export type LevelUpToastEvent = {
  prevLevel: number
  newLevel: number
  newRankKey?: TitleKey // ランクも変わったかどうか
}

// ── 内部ヘルパー ───────────────────────────────────────────
function readJson<T>(key: string): T | null {
  try {
    const raw = sessionStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

function writeJson<T>(key: string, value: T): void {
  try {
    sessionStorage.setItem(key, JSON.stringify(value))
  } catch {
    /* SSR / private mode: ignore */
  }
}

function clearKey(key: string): void {
  try {
    sessionStorage.removeItem(key)
  } catch {
    /* ignore */
  }
}

// ── レッスン完了イベント記録 ────────────────────────────────
/**
 * レッスン完了で XP が prevXp → newXp に変化した時に呼ぶ。
 * レベル変化・ランク変化があれば pending イベントを記録する。
 *
 * @returns 検出された変化のサマリ（呼び出し側が即時演出を出すかどうかの判定に使える）
 */
export function recordLessonCompleteEvent(
  prevXp: number,
  newXp: number,
): { leveledUp: boolean; rankedUp: boolean } {
  const prevLv = getCurrentLevel(prevXp)
  const newLv = getCurrentLevel(newXp)
  const prevTitleKey = getTitleKeyForLevel(prevLv.level)
  const newTitleKey = getTitleKeyForLevel(newLv.level)

  const leveledUp = newLv.level > prevLv.level
  const rankedUp = newTitleKey !== prevTitleKey && newLv.level > prevLv.level

  if (leveledUp) {
    const evt: LevelUpEvent = {
      prevLevel: prevLv.level,
      newLevel: newLv.level,
      newXp,
    }
    writeJson(LEVEL_UP_KEY, evt)

    // ホーム画面トースト用にも積む（ランクアップ情報込み）
    const toastEvt: LevelUpToastEvent = {
      prevLevel: prevLv.level,
      newLevel: newLv.level,
      newRankKey: rankedUp ? newTitleKey : undefined,
    }
    writeJson(TOAST_KEY, toastEvt)
  }

  if (rankedUp) {
    const evt: RankUpEvent = {
      prevTitleKey,
      newTitleKey,
      newLevel: newLv.level,
      newXp,
    }
    writeJson(RANK_UP_KEY, evt)
  }

  return { leveledUp, rankedUp }
}

// ── レベルアップ ─────────────────────────────────────────
export function peekLevelUpEvent(): LevelUpEvent | null {
  return readJson<LevelUpEvent>(LEVEL_UP_KEY)
}

export function consumeLevelUpEvent(): LevelUpEvent | null {
  const evt = peekLevelUpEvent()
  clearKey(LEVEL_UP_KEY)
  return evt
}

// ── ランクアップ ─────────────────────────────────────────
export function peekRankUpEvent(): RankUpEvent | null {
  return readJson<RankUpEvent>(RANK_UP_KEY)
}

export function consumeRankUpEvent(): RankUpEvent | null {
  const evt = peekRankUpEvent()
  clearKey(RANK_UP_KEY)
  return evt
}

// ── ホーム画面トースト ──────────────────────────────────
export function peekLevelUpToast(): LevelUpToastEvent | null {
  return readJson<LevelUpToastEvent>(TOAST_KEY)
}

export function consumeLevelUpToast(): LevelUpToastEvent | null {
  const evt = peekLevelUpToast()
  clearKey(TOAST_KEY)
  return evt
}

// テスト・開発用に手動でセットできるようグローバル公開はしない方針。
// 必要なら ?devMode=1 等を組んで AppV3.tsx 内で呼び出す。
