/** Thinking blocks may precede text, so collect text by block type. */
export function anthropicText(content: readonly { type: string; text?: string }[]): string {
  return content.filter((block) => block.type === 'text').map((block) => block.text ?? '').join('')
}
