import { useState, useCallback } from 'react'
import type { SyntheticEvent } from 'react'

/**
 * 段階開示用の共通フック。
 * 各 Visual に組み込んで「次へ／戻る」で段階的に図解を展開できるようにする。
 *
 * - `step` は 1..totalSteps の範囲（1 ベース）。レンダリング側は `step >= n` で表示判定する。
 * - `revealMode = 'static'` の場合は最初から最終ステップを表示する（リハーサル/プレビュー用）。
 * - `revealMode = 'interactive'`（default）の場合は step 1 から開始してユーザー操作で進める。
 *
 * 2026-05-22 — UI 刷新:
 *   従来の「← 戻す / 1 / 3 / 次へ →」フルラベルボタンは、LessonStoriesScreen 側の
 *   左右タップゾーン（スライド送り）と視覚的に被って "2セット並ぶ" 問題があった。
 *   - ボタンを矢印アイコンのみの 36×36 円形に縮小
 *   - 中央は「• ○ ○」型のドットインジケーター
 *   - Visual コンテナ内のフロー配置（margin: auto で水平中央寄せ）
 *   ことで、スライド送りボタンとは明確に役割が分離されるデザインに変更。
 *
 * 使い方の例：
 * ```
 * const { step, isLast, next, prev, controls } = useStepReveal(3)
 * return (
 *   <div style={{ position: 'relative' }}>
 *     <Layer1 />
 *     {step >= 2 && <Layer2 />}
 *     {step >= 3 && <Layer3 />}
 *     {controls}
 *   </div>
 * )
 * ```
 */
export type RevealMode = 'interactive' | 'static'

export type UseStepRevealOptions = {
  /** 全段階数（1..totalSteps）。1 を指定すると単一ステップで controls は出ない */
  totalSteps: number
  /** 初期表示モード。デフォルト 'interactive'（step 1 から） */
  mode?: RevealMode
  /** prev ボタンの aria-label。デフォルト '前のステップ' */
  prevLabel?: string
  /** next ボタンの aria-label。デフォルト '次のステップ' */
  nextLabel?: string
  /** 完了状態の aria-label。デフォルト '完了しました' */
  doneLabel?: string
}

export type UseStepRevealResult = {
  /** 現在のステップ番号（1..totalSteps） */
  step: number
  /** 全ステップ数 */
  totalSteps: number
  /** 現在が最終ステップか */
  isLast: boolean
  /** 次へ進める */
  next: () => void
  /** ひとつ戻す */
  prev: () => void
  /** 任意のステップへジャンプ */
  goTo: (n: number) => void
  /** リセット（step を 1 に戻す） */
  reset: () => void
  /** 段階開示コントロール（戻す・次へ）。`static` モードでは null */
  controls: React.ReactNode
}

import { createElement, Fragment } from 'react'

export function useStepReveal(opts: UseStepRevealOptions | number): UseStepRevealResult {
  const options: UseStepRevealOptions = typeof opts === 'number' ? { totalSteps: opts } : opts
  const {
    totalSteps,
    mode = 'interactive',
    prevLabel = '前のステップ',
    nextLabel = '次のステップ',
    doneLabel = '完了しました',
  } = options

  // static モードは最終ステップを表示
  const initial = mode === 'static' ? totalSteps : 1
  const [step, setStep] = useState(initial)

  const next = useCallback(() => {
    setStep((s) => Math.min(totalSteps, s + 1))
  }, [totalSteps])

  const prev = useCallback(() => {
    setStep((s) => Math.max(1, s - 1))
  }, [])

  const goTo = useCallback(
    (n: number) => {
      setStep(Math.min(totalSteps, Math.max(1, n)))
    },
    [totalSteps]
  )

  const reset = useCallback(() => {
    setStep(1)
  }, [])

  const isLast = step >= totalSteps

  // 親コンテナ（LessonStoriesScreen 等）の swipe / tap zone に
  // ボタンタップが伝播してスライド遷移が起きないよう、touch / pointer を全部止める。
  const stopAll = useCallback((e: { stopPropagation: () => void }) => {
    e.stopPropagation()
  }, [])

  const handlePrev = useCallback(
    (e: SyntheticEvent) => {
      e.stopPropagation()
      prev()
    },
    [prev]
  )
  const handleNext = useCallback(
    (e: SyntheticEvent) => {
      e.stopPropagation()
      next()
    },
    [next]
  )

  // 矢印 SVG（左 / 右）
  const arrowLeft = createElement(
    'svg',
    {
      width: 16,
      height: 16,
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: 2.5,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      'aria-hidden': true,
    },
    createElement('polyline', { points: '15 18 9 12 15 6' })
  )
  const arrowRight = createElement(
    'svg',
    {
      width: 16,
      height: 16,
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: 'currentColor',
      strokeWidth: 2.5,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      'aria-hidden': true,
    },
    createElement('polyline', { points: '9 18 15 12 9 6' })
  )

  // ドット
  const dots = Array.from({ length: totalSteps }, (_, i) => {
    const n = i + 1
    const active = n === step
    const past = n < step
    return createElement('span', {
      key: `dot-${n}`,
      className: `vz-reveal-dot${active ? ' is-active' : ''}${past ? ' is-past' : ''}`,
      'aria-hidden': true,
    })
  })

  // static モードや単一ステップの場合は controls を出さない
  const controls =
    mode === 'static' || totalSteps <= 1
      ? null
      : createElement(
          'div',
          {
            className: 'vz-reveal-controls',
            role: 'group',
            'aria-label': '段階開示コントロール',
            // 親の swipe ハンドラ・タップゾーンより上に出して、touch も pointer も止める
            onTouchStart: stopAll,
            onTouchMove: stopAll,
            onTouchEnd: stopAll,
            onPointerDown: stopAll,
            onPointerUp: stopAll,
            onClick: stopAll,
          },
          createElement(
            'button',
            {
              type: 'button',
              className: 'vz-reveal-btn',
              onClick: handlePrev,
              onPointerDown: stopAll,
              onTouchStart: stopAll,
              onTouchEnd: stopAll,
              disabled: step === 1,
              'aria-label': prevLabel,
            },
            arrowLeft
          ),
          createElement(
            'div',
            {
              className: 'vz-reveal-dots',
              role: 'progressbar',
              'aria-valuenow': step,
              'aria-valuemin': 1,
              'aria-valuemax': totalSteps,
              'aria-valuetext': `${step} / ${totalSteps}`,
            },
            createElement(Fragment, null, ...dots)
          ),
          createElement(
            'button',
            {
              type: 'button',
              className: 'vz-reveal-btn primary',
              onClick: handleNext,
              onPointerDown: stopAll,
              onTouchStart: stopAll,
              onTouchEnd: stopAll,
              disabled: isLast,
              'aria-label': isLast ? doneLabel : nextLabel,
            },
            arrowRight
          )
        )

  return {
    step,
    totalSteps,
    isLast,
    next,
    prev,
    goTo,
    reset,
    controls,
  }
}
