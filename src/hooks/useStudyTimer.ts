/**
 * useStudyTimer — 学習セッション計測 hook
 *
 * 目的:
 *   - 画面マウント時に計測開始、アンマウント / 非表示で flush する。
 *   - バックグラウンド時間（visibility=hidden）は計測から除外する。
 *   - 短すぎる滞在（5 秒未満）と長すぎる経過（3 時間超 — 直接遷移 / deep link 対策）は捨てる。
 *   - localStorage `logic-stats` の累計 ms に加算 → 既存の StudyTimeScreen / ProfileScreen と互換維持。
 *   - 同時に server `/api/study-sessions` へ POST して、analytics 用 `study_sessions` テーブルに記録する。
 *     失敗しても fire-and-forget（UX をブロックしない）。
 *
 * 使い方:
 *   useStudyTimer({ type: 'lesson', id: String(lessonId) })
 *
 * 設計ノート:
 *   - hook 内で `addStudyTime` を呼ぶことで localStorage は確実に更新される。
 *   - server 側 POST は best-effort。未ログイン / オフライン / サーバーエラー時は無視。
 *   - 同一ライフタイム内で `flush` が複数回呼ばれても二重計上しないよう、ガードを置く。
 *
 * バックグラウンド除外（FB-02）:
 *   - Web では `visibilitychange`(hidden) でセグメントを閉じて背景時間を除外する。
 *   - Capacitor ネイティブ（iOS/Android）の WebView では、アプリ背景化で
 *     `visibilitychange`(hidden) が確実に発火しない。そのまま放置すると、長時間
 *     背景化したあと復帰 → 画面を閉じた瞬間の flush で `delta = now - segmentStart`
 *     に背景滞在時間まで丸ごと含まれて過大計上になる（FB-02）。
 *   - 対策として、ネイティブ時は `@capacitor/app` の `appStateChange` を正準シグナル
 *     として結線し、`isActive === false` で closeSegment（背景除外）/ `true` で再開する。
 *   - web と native のシグナルが両方発火しても closeSegment / 再開は冪等なので二重計上しない。
 */

import { useEffect, useRef } from 'react'
import { App } from '@capacitor/app'
import type { PluginListenerHandle } from '@capacitor/core'
import { Capacitor } from '@capacitor/core'
import { addStudyTime, appendStudyDaily } from '../stats'
import { getSyncUser } from '../syncService'
import { API_BASE } from '../screens/apiBase'

export type ActivityType =
  | 'lesson'
  | 'fermi'
  | 'journal'
  | 'flashcard'
  | 'ai_problem'
  | 'daily_problem'

interface UseStudyTimerOptions {
  type: ActivityType
  /** activity を一意に識別するサブ ID（lesson-23, fermi-5, characterId 等） */
  id?: string
  /** false の間は計測しない（モーダルが閉じている時など） */
  enabled?: boolean
  /** 追加メタ情報（slideCount 等）。サーバ側 metadata に格納される */
  metadata?: Record<string, unknown>
}

const MIN_DURATION_MS = 5_000          // 5 秒未満は捨てる
const MAX_DURATION_MS = 3 * 60 * 60_000 // 3 時間超は明らかに不正値（バックグラウンド漏れ等）

export function useStudyTimer(opts: UseStudyTimerOptions) {
  const { type, id, enabled = true, metadata } = opts

  // 累計の有効滞在時間（バックグラウンド除外後）
  const accumulatedMsRef = useRef(0)
  // 現在の active セグメントの開始時刻（visibility=visible 中のみ非 0）
  const segmentStartRef = useRef<number>(0)
  // セッション全体の開始時刻（started_at として server に送る）
  const sessionStartIsoRef = useRef<string>('')
  // flush 多重呼び出しガード
  const flushedRef = useRef(false)
  // 最新の opts を flush 時に参照したいので ref に控える（useEffect 内で更新）
  const typeRef = useRef(type)
  const idRef = useRef(id)
  const metadataRef = useRef(metadata)
  useEffect(() => {
    typeRef.current = type
    idRef.current = id
    metadataRef.current = metadata
  }, [type, id, metadata])

  useEffect(() => {
    if (!enabled) return

    // ── 初期化 ─────────────────────────────────────────
    accumulatedMsRef.current = 0
    flushedRef.current = false
    sessionStartIsoRef.current = new Date().toISOString()
    // 初回マウント時に visible だったら segment スタート
    const isVisible = typeof document === 'undefined' || document.visibilityState !== 'hidden'
    segmentStartRef.current = isVisible ? Date.now() : 0

    // ── アクティブセグメント終了を確定 ─────────────────
    const closeSegment = () => {
      if (segmentStartRef.current > 0) {
        const delta = Date.now() - segmentStartRef.current
        if (delta > 0) accumulatedMsRef.current += delta
        segmentStartRef.current = 0
      }
    }

    // ── 計測の確定（最終フラッシュ） ───────────────────
    const flush = () => {
      if (flushedRef.current) return
      closeSegment()
      const elapsedMs = accumulatedMsRef.current
      // ガード: 短すぎる / 長すぎるは捨てる
      if (elapsedMs < MIN_DURATION_MS) {
        flushedRef.current = true
        return
      }
      if (elapsedMs > MAX_DURATION_MS) {
        flushedRef.current = true
        return
      }
      flushedRef.current = true

      // localStorage 累計に加算
      try { addStudyTime(elapsedMs) } catch { /* ignore */ }

      // 日別ログにも記録（StudyTimeScreen の日別グラフ・学習内訳で参照される）
      try {
        const aid = idRef.current
        const key = aid ? `${typeRef.current}:${aid}` : typeRef.current
        appendStudyDaily({ key, ts: Date.now(), ms: elapsedMs })
      } catch { /* ignore */ }

      // サーバへ best-effort で記録
      const userId = getSyncUser()
      if (!userId) return
      const payload = {
        user_id: userId,
        activity_type: typeRef.current,
        activity_id: idRef.current ?? null,
        started_at: sessionStartIsoRef.current,
        ended_at: new Date().toISOString(),
        duration_ms: elapsedMs,
        metadata: metadataRef.current ?? {},
      }
      try {
        // keepalive を使ってアンマウント直後でも POST が完走するように
        void fetch(`${API_BASE}/api/study-sessions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          keepalive: true,
        }).catch(() => { /* fire-and-forget */ })
      } catch { /* ignore */ }
    }

    // ── アクティブ / 非アクティブ遷移の共通ハンドラ ────
    // web の visibilitychange と native の appStateChange で共有する。
    // closeSegment は segmentStartRef を 0 にするので冪等、再開もガード済みなので、
    // 両方のシグナルが発火しても二重計上しない。
    const onBackground = () => {
      closeSegment()
    }
    const onForeground = () => {
      // visible / active に戻ったら新しいセグメントを開始
      if (segmentStartRef.current === 0 && !flushedRef.current) {
        segmentStartRef.current = Date.now()
      }
    }

    // ── visibilitychange でバックグラウンド時間を除外 ──
    const onVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        onBackground()
      } else {
        onForeground()
      }
    }

    // ── unload 系で確実に flush ──────────────────────
    const onPageHide = () => { flush() }
    const onBeforeUnload = () => { flush() }

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', onVisibilityChange)
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('pagehide', onPageHide)
      window.addEventListener('beforeunload', onBeforeUnload)
    }

    // ── Capacitor native: appStateChange を正準シグナルに（FB-02）──
    // native の WebView では visibilitychange(hidden) が確実に発火しないため、
    // App プラグインの appStateChange で背景化 / 復帰を検出する。
    // addListener は Promise<PluginListenerHandle> を返すので、cleanup 時点で
    // 未解決でも確実に remove できるよう handle を保持し、解決後 remove する。
    let appStateHandle: PluginListenerHandle | null = null
    let appStateRemoved = false
    if (Capacitor.isNativePlatform()) {
      void App.addListener('appStateChange', ({ isActive }) => {
        if (isActive) {
          onForeground()
        } else {
          onBackground()
        }
      }).then((handle) => {
        appStateHandle = handle
        // cleanup が先に走っていたら（handle 未解決のレース）解決後に remove する
        if (appStateRemoved) {
          void handle.remove()
        }
      }).catch(() => { /* native 以外 / プラグイン未利用時は無視 */ })
    }

    return () => {
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', onVisibilityChange)
      }
      if (typeof window !== 'undefined') {
        window.removeEventListener('pagehide', onPageHide)
        window.removeEventListener('beforeunload', onBeforeUnload)
      }
      // native listener を確実に remove（リーク防止）。
      // addListener が未解決なら appStateRemoved フラグで then 側に remove を委ねる。
      appStateRemoved = true
      if (appStateHandle) {
        void appStateHandle.remove()
        appStateHandle = null
      }
      // アンマウント時に必ず flush
      flush()
    }
    // enabled が false に切り替わったら cleanup が走り flush される。
    // type / id の変化は次回マウントで別セッション扱いになるべきなので依存に入れる。
  }, [enabled, type, id])
}
