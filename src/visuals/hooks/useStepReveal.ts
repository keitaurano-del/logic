import { useState, useCallback } from 'react'

/**
 * 段階開示用の共通フック。
 * 各 Visual に組み込んで「次へ／戻る」で段階的に図解を展開できるようにする。
 *
 * - `step` は 1..totalSteps の範囲（1 ベース）。レンダリング側は `step >= n` で表示判定する。
 * - `revealMode = 'static'` の場合は最初から最終ステップを表示する（リハーサル/プレビュー用）。
 * - `revealMode = 'interactive'`（default）の場合は step 1 から開始してユーザー操作で進める。
 *
 * 使い方の例：
 * ```
 * const { step, isLast, next, prev, controls } = useStepReveal(3)
 * return (
 *   <div>
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
  /** prev ボタンのラベル。デフォルト '← 戻す' */
  prevLabel?: string
  /** next ボタンのラベル。デフォルト '次へ →' */
  nextLabel?: string
  /** 完了状態のラベル。デフォルト '完了' */
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

import { createElement } from 'react'

export function useStepReveal(opts: UseStepRevealOptions | number): UseStepRevealResult {
  const options: UseStepRevealOptions = typeof opts === 'number' ? { totalSteps: opts } : opts
  const {
    totalSteps,
    mode = 'interactive',
    prevLabel = '← 戻す',
    nextLabel = '次へ →',
    doneLabel = '完了',
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

  // static モードや単一ステップの場合は controls を出さない
  const controls =
    mode === 'static' || totalSteps <= 1
      ? null
      : createElement(
          'div',
          { className: 'vz-reveal-controls' },
          createElement(
            'button',
            {
              type: 'button',
              className: 'vz-ladder-btn',
              onClick: prev,
              disabled: step === 1,
              'aria-label': prevLabel,
            },
            prevLabel
          ),
          createElement(
            'span',
            { className: 'vz-reveal-progress', 'aria-live': 'polite' },
            `${step} / ${totalSteps}`
          ),
          createElement(
            'button',
            {
              type: 'button',
              className: 'vz-ladder-btn primary',
              onClick: next,
              disabled: isLast,
              'aria-label': isLast ? doneLabel : nextLabel,
            },
            isLast ? doneLabel : nextLabel
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
