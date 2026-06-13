/**
 * config.ts — AI モデル ID 解決のテスト（LR-25 #47）。
 *
 * 検証する不変条件:
 *  - env 未設定 → 安全な既定値（採点=上位 Sonnet / 軽=現状維持 Haiku）にフォールバック。
 *  - env 設定 → その値を優先（本番で Render の env から差し替えられる）。
 *  - 空文字 / 空白のみ → 既定値にフォールバック（誤って空モデル ID で API を壊さない）。
 *  - 既定の採点モデルは軽タスクモデルと別物（=ちゃんと上位モデルに振っている）。
 */
import { describe, it, expect } from 'vitest'
import {
  aiModelLight,
  aiModelGrading,
  DEFAULT_AI_MODEL_LIGHT,
  DEFAULT_AI_MODEL_GRADING,
} from '../config'

describe('aiModelLight', () => {
  it('env 未設定なら Haiku 既定にフォールバック', () => {
    expect(aiModelLight({} as NodeJS.ProcessEnv)).toBe(DEFAULT_AI_MODEL_LIGHT)
  })

  it('env 設定時はその値を使う', () => {
    expect(aiModelLight({ AI_MODEL_LIGHT: 'custom-light' } as unknown as NodeJS.ProcessEnv)).toBe('custom-light')
  })

  it('空白のみは既定にフォールバック', () => {
    expect(aiModelLight({ AI_MODEL_LIGHT: '   ' } as unknown as NodeJS.ProcessEnv)).toBe(DEFAULT_AI_MODEL_LIGHT)
  })
})

describe('aiModelGrading', () => {
  it('env 未設定なら上位 Sonnet 既定にフォールバック', () => {
    expect(aiModelGrading({} as NodeJS.ProcessEnv)).toBe(DEFAULT_AI_MODEL_GRADING)
  })

  it('env 設定時はその値を使う', () => {
    expect(aiModelGrading({ AI_MODEL_GRADING: 'custom-grading' } as unknown as NodeJS.ProcessEnv)).toBe('custom-grading')
  })

  it('空文字は既定にフォールバック', () => {
    expect(aiModelGrading({ AI_MODEL_GRADING: '' } as unknown as NodeJS.ProcessEnv)).toBe(DEFAULT_AI_MODEL_GRADING)
  })
})

describe('既定モデルの振り分け', () => {
  it('採点既定は軽タスク既定と別の（上位）モデル', () => {
    expect(DEFAULT_AI_MODEL_GRADING).not.toBe(DEFAULT_AI_MODEL_LIGHT)
  })

  it('軽タスク既定は既存コードと同じ Haiku 固定 ID', () => {
    expect(DEFAULT_AI_MODEL_LIGHT).toBe('claude-haiku-4-5-20251001')
  })

  it('採点既定は同梱 SDK の Model 型に含まれる Sonnet 固定 ID', () => {
    expect(DEFAULT_AI_MODEL_GRADING).toBe('claude-sonnet-4-5-20250929')
  })
})
