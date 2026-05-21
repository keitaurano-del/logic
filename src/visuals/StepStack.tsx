import { Fragment, type ReactNode } from 'react'
import { useStepReveal } from './hooks/useStepReveal'

/**
 * StepStack — 3 段以上の縦並びステップ + ↓ 矢印 共通コンポーネント
 *
 * SCR / WhereWhyHow など「縦並びの 3 段カード + 間に矢印 + 最終ステップに gradient」
 * の構造を持つ visual で利用。各カードの内部レイアウトは呼び出し側で自由に組める。
 *
 * 使い方:
 *   <StepStack
 *     items={[<MyCard className="vz-scr-step situation" />, <MyCard className="vz-scr-step complication" />]}
 *     final={<MyCard className="vz-scr-step resolution" />}
 *   />
 *
 * - `items`: 中段までのカード（任意数、各カードの className は呼び出し側で指定）
 * - `final`: 最終ステップ（必須）。視覚的に強調される gradient ベース (.vz-step-stack-final と同等のクラス) を持たせる想定
 * - `containerClassName`: 外側 wrapper のクラス。SCR なら "vz-scr"、WWW なら "vz-www" を渡す
 * - `arrowClassName`: 矢印のクラス。デフォルトは visuals.css 共通の "vz-step-stack-arrow"
 * - `arrowGlyph`: 矢印グリフ。デフォルト "↓"
 * - `revealMode`: 'interactive'（default）= ボタンで段階表示 / 'static' = 全部表示
 *
 * 注: 各カードの内側構造（label / title / body の組み方や、icon を含む grid レイアウト）
 *     は visual 固有なので children として渡す方式を採る。
 */

export type StepStackProps = {
  items: ReactNode[]
  final: ReactNode
  containerClassName?: string
  arrowClassName?: string
  arrowGlyph?: string
  /** 'interactive' = useStepReveal で 1 段ずつ開示 / 'static' = 最初から全表示（default は static で後方互換性確保） */
  revealMode?: 'interactive' | 'static'
}

export function StepStack({
  items,
  final,
  containerClassName,
  arrowClassName = 'vz-step-stack-arrow',
  arrowGlyph = '↓',
  revealMode = 'static',
}: StepStackProps) {
  // step count = items.length + 1 (final)
  const totalSteps = items.length + 1
  const { step, controls } = useStepReveal({ totalSteps, mode: revealMode })

  // step >= n のとき、items[n-1] までを表示。step === totalSteps で final も出す
  const visibleItemsCount = revealMode === 'static' ? items.length : Math.min(step, items.length)
  const showFinal = revealMode === 'static' ? true : step >= totalSteps

  return (
    <>
      <div className={containerClassName}>
        {items.slice(0, visibleItemsCount).map((item, i) => {
          // 矢印は次のステップが見えるとき、または final が見えるときに描画
          const showArrow = i < visibleItemsCount - 1 || showFinal
          return (
            <Fragment key={`step-${i}`}>
              {item}
              {showArrow && <span className={arrowClassName}>{arrowGlyph}</span>}
            </Fragment>
          )
        })}
        {showFinal && final}
      </div>
      {revealMode === 'interactive' && controls}
    </>
  )
}
