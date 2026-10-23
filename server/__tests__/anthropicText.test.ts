import { describe, expect, it } from 'vitest'
import { anthropicText } from '../anthropicText'

describe('anthropicText', () => {
  it('extracts text after a thinking block', () => {
    expect(anthropicText([{ type: 'thinking' }, { type: 'text', text: '回答' }])).toBe('回答')
  })

  it('joins multiple text blocks', () => {
    expect(anthropicText([{ type: 'text', text: 'A' }, { type: 'tool_use' }, { type: 'text', text: 'B' }])).toBe('AB')
  })
})
