/**
 * /api/writing-score ルートのユニットテスト。
 *
 * Claude API を実際に叩く部分は呼ばず、pure helper の境界を検証する:
 * - validateWritingInput: 空・undefined・長すぎる→invalid、正常→valid
 * - parseToolUseResult: 正常な tool input→ScoringResult、範囲外→null、必須欠落→null
 */
import { describe, it, expect } from 'vitest'
import { validateWritingInput, parseToolUseResult, type ScoringResult } from '../writing-score'

describe('validateWritingInput', () => {
  it('空文字は invalid', () => {
    const result = validateWritingInput('')
    expect(result.valid).toBe(false)
    if (!result.valid) expect(result.error).toBeTruthy()
  })

  it('空白のみは invalid', () => {
    const result = validateWritingInput('   ')
    expect(result.valid).toBe(false)
  })

  it('undefined は invalid', () => {
    const result = validateWritingInput(undefined)
    expect(result.valid).toBe(false)
  })

  it('null は invalid', () => {
    const result = validateWritingInput(null)
    expect(result.valid).toBe(false)
  })

  it('2001文字は invalid', () => {
    const result = validateWritingInput('a'.repeat(2001))
    expect(result.valid).toBe(false)
    if (!result.valid) expect(result.error).toContain('2000')
  })

  it('2000文字はちょうど valid', () => {
    const result = validateWritingInput('a'.repeat(2000))
    expect(result.valid).toBe(true)
  })

  it('正常な文字列は valid', () => {
    const result = validateWritingInput('リモートワークを推進すべきだ。なぜなら通勤時間が削減できるからだ。')
    expect(result.valid).toBe(true)
  })

  it('数値は invalid', () => {
    const result = validateWritingInput(42)
    expect(result.valid).toBe(false)
  })
})

const validToolInput = {
  scores: { point: 4, reason: 3, example: 3, overall: 70 },
  comments: { ja: 'Point（主張）は明確に述べられています。', en: 'Your Point is clearly stated.' },
  strengths: { ja: '主張が一文で端的に述べられています。', en: 'Concise main claim.' },
  improvements: { ja: 'Reasonをもう少し具体的に。', en: 'Add more specific reasons.' },
}

describe('parseToolUseResult', () => {
  it('正常な tool input から ScoringResult を返す', () => {
    const result = parseToolUseResult(validToolInput)
    expect(result).not.toBeNull()
    const r = result as ScoringResult
    expect(r.scores.point).toBe(4)
    expect(r.scores.reason).toBe(3)
    expect(r.scores.example).toBe(3)
    expect(r.scores.overall).toBe(70)
    expect(r.comments.ja).toBe('Point（主張）は明確に述べられています。')
    expect(r.comments.en).toBe('Your Point is clearly stated.')
    expect(r.strengths.ja).toBe('主張が一文で端的に述べられています。')
    expect(r.improvements.en).toBe('Add more specific reasons.')
  })

  it('point が範囲外（6）は null', () => {
    const input = { ...validToolInput, scores: { ...validToolInput.scores, point: 6 } }
    expect(parseToolUseResult(input)).toBeNull()
  })

  it('point が負数は null', () => {
    const input = { ...validToolInput, scores: { ...validToolInput.scores, point: -1 } }
    expect(parseToolUseResult(input)).toBeNull()
  })

  it('overall が 100 超は null', () => {
    const input = { ...validToolInput, scores: { ...validToolInput.scores, overall: 101 } }
    expect(parseToolUseResult(input)).toBeNull()
  })

  it('overall が 0 は valid（境界値）', () => {
    const input = { ...validToolInput, scores: { ...validToolInput.scores, overall: 0 } }
    const result = parseToolUseResult(input)
    expect(result).not.toBeNull()
    expect(result!.scores.overall).toBe(0)
  })

  it('scores フィールドが欠落は null', () => {
    const { scores: _scores, ...withoutScores } = validToolInput
    expect(parseToolUseResult(withoutScores)).toBeNull()
  })

  it('comments フィールドが欠落は null', () => {
    const { comments: _comments, ...withoutComments } = validToolInput
    expect(parseToolUseResult(withoutComments)).toBeNull()
  })

  it('strengths フィールドが欠落は null', () => {
    const { strengths: _strengths, ...withoutStrengths } = validToolInput
    expect(parseToolUseResult(withoutStrengths)).toBeNull()
  })

  it('improvements フィールドが欠落は null', () => {
    const { improvements: _improvements, ...withoutImprovements } = validToolInput
    expect(parseToolUseResult(withoutImprovements)).toBeNull()
  })

  it('comments.ja が欠落は null', () => {
    const input = { ...validToolInput, comments: { en: 'ok' } }
    expect(parseToolUseResult(input)).toBeNull()
  })

  it('comments.en が欠落は null', () => {
    const input = { ...validToolInput, comments: { ja: 'ok' } }
    expect(parseToolUseResult(input)).toBeNull()
  })

  it('null 入力は null', () => {
    expect(parseToolUseResult(null)).toBeNull()
  })

  it('非オブジェクト入力は null', () => {
    expect(parseToolUseResult('string')).toBeNull()
    expect(parseToolUseResult(42)).toBeNull()
    expect(parseToolUseResult(undefined)).toBeNull()
  })

  it('スコアが文字列（型不整合）は null', () => {
    const input = { ...validToolInput, scores: { point: '4', reason: 3, example: 3, overall: 70 } }
    expect(parseToolUseResult(input)).toBeNull()
  })

  it('point=5 overall=100 は valid（上限境界値）', () => {
    const input = {
      ...validToolInput,
      scores: { point: 5, reason: 5, example: 5, overall: 100 },
    }
    const result = parseToolUseResult(input)
    expect(result).not.toBeNull()
    expect(result!.scores.overall).toBe(100)
  })
})
