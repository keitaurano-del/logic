import { useRef, useState, type KeyboardEvent } from 'react'
import { t } from '../../i18n'

interface TagInputProps {
  value: string[]
  onChange: (tags: string[]) => void
  placeholder?: string
  max?: number
}

const MAX_TAG_LENGTH = 24

export function TagInput({ value, onChange, placeholder, max = 8 }: TagInputProps) {
  const [draft, setDraft] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const addTag = (raw: string) => {
    const tag = raw.trim().replace(/[\r\n\t]/g, '').slice(0, MAX_TAG_LENGTH)
    if (!tag) return
    if (value.includes(tag)) return
    if (value.length >= max) return
    onChange([...value, tag])
    setDraft('')
  }

  const removeTag = (tag: string) => {
    onChange(value.filter((t) => t !== tag))
  }

  const handleKey = (e: KeyboardEvent<HTMLInputElement>) => {
    // IME 変換中の Enter は除外
    const composing = (e.nativeEvent as unknown as { isComposing?: boolean }).isComposing
    if (composing) return
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(draft)
    } else if (e.key === 'Backspace' && draft === '' && value.length > 0) {
      e.preventDefault()
      removeTag(value[value.length - 1])
    }
  }

  return (
    <div className="journal-tag-input">
      <div className="journal-tag-list">
        {value.map((tag) => (
          <span key={tag} className="journal-tag-chip">
            <span className="journal-tag-chip__text">{tag}</span>
            <button
              type="button"
              className="journal-tag-chip__remove"
              onClick={() => removeTag(tag)}
              aria-label={t('journal.tagRemoveAria', { tag })}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </span>
        ))}
        {value.length < max && (
          <input
            ref={inputRef}
            type="text"
            className="journal-tag-input__field"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKey}
            onBlur={() => { if (draft.trim()) addTag(draft) }}
            placeholder={value.length === 0 ? placeholder : ''}
            aria-label={t('journal.tagAddAria')}
            maxLength={MAX_TAG_LENGTH}
          />
        )}
      </div>
      <div className="journal-tag-help">{t('journal.tagHelp')}</div>
    </div>
  )
}
