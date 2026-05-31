import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { t } from '../i18n'

/**
 * FB-08 回帰ロック。
 *
 * DailyProblemScreen は生成中（state==='loading'）に、従来の
 * プレーン1行テキスト `t('dailyProblem.loading')` を ProblemGenLoader の
 * フルスクリーン演出へ差し替えた。この差し替えがリグレッションしないことを保証する。
 *
 * - loading 状態でレンダーすると ProblemGenLoader の step1 文言が出る
 * - 旧プレーンテキスト（dailyProblem.loading）は出ない
 *
 * loading に入る条件は isDailyCompleted() === false。generateTodayProblem を
 * 永遠に pending な Promise にして loading 状態を維持する。
 */
vi.mock('../dailyProblem', () => ({
  isDailyCompleted: () => false,
  generateTodayProblem: () => new Promise(() => {}),
  markDailyCompleted: () => {},
}))

import { DailyProblemScreen } from '../screens/DailyProblemScreen'

describe('DailyProblemScreen loading (FB-08)', () => {
  it('shows the ProblemGenLoader step1 text while generating', () => {
    render(<DailyProblemScreen onBack={() => {}} />)
    expect(screen.getByText(t('aiProblemGen.loader.step1'))).toBeInTheDocument()
  })

  it('does not show the old plain loading text (regression guard)', () => {
    render(<DailyProblemScreen onBack={() => {}} />)
    // 差し替え前の旧文言は表示されないこと
    expect(screen.queryByText(t('dailyProblem.loading'))).not.toBeInTheDocument()
    // 念のため、新旧の文言が別物であることも確認しておく
    expect(t('aiProblemGen.loader.step1')).not.toBe(t('dailyProblem.loading'))
  })
})
