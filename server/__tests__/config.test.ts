/**
 * config.ts — AI モデル ID 解決のテスト（LR-25 #47）。
 *
 * 検証する不変条件:
 *  - env 未設定 → 安全な既定値（採点=上位 Sonnet / 軽=Haiku）にフォールバック。
 *  - env 設定 → その値を優先（本番で Render の env から差し替えられる）。
 *  - 空文字 / 空白のみ → 既定値にフォールバック（誤って空モデル ID で API を壊さない）。
 *  - 既定の採点モデルは軽タスクモデルと別物（=ちゃんと上位モデルに振っている）。
 */
import { describe, it, expect } from 'vitest'
import {
  aiModelLight,
  aiLightRequest,
  aiModelGrading,
  aiGradingRequest,
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

  it('軽タスク既定は Haiku 5.5', () => {
    expect(DEFAULT_AI_MODEL_LIGHT).toBe('claude-haiku-5-5')
  })

  it('採点既定は Sonnet 5.5', () => {
    expect(DEFAULT_AI_MODEL_GRADING).toBe('claude-sonnet-5-5')
  })

  it('短い Haiku 処理では思考を省き、応答速度を優先する', () => {
    expect(aiLightRequest({} as NodeJS.ProcessEnv)).toEqual({ model: 'claude-haiku-5-5', thinking: { type: 'disabled' } })
  })

  it('モデルを上書きした場合は互換性のない thinking 設定を付けない', () => {
    expect(aiLightRequest({ AI_MODEL_LIGHT: 'custom-light' } as NodeJS.ProcessEnv)).toEqual({ model: 'custom-light' })
  })

  it('Sonnet 5.5 の採点は medium effort にする', () => {
    expect(aiGradingRequest({} as NodeJS.ProcessEnv)).toEqual({ model: 'claude-sonnet-5-5', output_config: { effort: 'medium' } })
  })

  it('採点モデルを上書きした場合は effort を強制しない', () => {
    expect(aiGradingRequest({ AI_MODEL_GRADING: 'custom-grading' } as NodeJS.ProcessEnv)).toEqual({ model: 'custom-grading' })
  })
})
