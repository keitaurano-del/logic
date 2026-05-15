import { useEffect, useRef, useState } from 'react'
import { searchJournals } from './journalDb'
import { JournalDetailSheet } from './JournalDetailSheet'
import type { DailyJournal } from './types'
import { t } from '../../i18n'

interface JournalSearchProps {
  userId: string
}

export function JournalSearch({ userId }: JournalSearchProps) {
  const [keyword, setKeyword] = useState('')
  const [results, setResults] = useState<DailyJournal[]>([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    const k = keyword.trim()
    if (!k) {
      setResults([])  // eslint-disable-line react-hooks/set-state-in-effect
      setLoading(false)
      return
    }
    setLoading(true)
    debounceRef.current = setTimeout(async () => {
      const list = await searchJournals(userId, k)
      setResults(list)
      setLoading(false)
    }, 300)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [keyword, userId])

  const handleSaved = (j: DailyJournal) => {
    setResults((rs) => rs.map((r) => r.date === j.date ? { ...r, ...j } : r))
  }

  const buildExcerpt = (j: DailyJournal): string => {
    const k = keyword.trim().toLowerCase()
    const fields = [j.ai_summary, j.evening_reflection, j.schedule_notes, j.morning_memo]
      .filter((s): s is string => !!s && s.length > 0)
    for (const f of fields) {
      if (f.toLowerCase().includes(k)) return f
    }
    return fields[0] ?? ''
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <input
        type="search"
        className="journal-search-input"
        value={keyword}
        onChange={(e) => setKeyword(e.target.value)}
        placeholder={t('journal.searchPlaceholder')}
        aria-label={t('journal.searchPlaceholder')}
      />

      {!keyword.trim() && (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border, rgba(255,255,255,.06))',
          borderRadius: 12,
          padding: 16,
          fontSize: 13,
          color: 'var(--text-secondary)',
          lineHeight: 1.7,
        }}>
          {t('journal.searchEmptyHint')}
        </div>
      )}

      {loading && (
        <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>{t('common.loading')}</div>
      )}

      {!loading && keyword.trim() && results.length === 0 && (
        <div style={{ color: 'var(--text-muted)', fontSize: 13 }}>{t('journal.searchNoResults')}</div>
      )}

      {results.map((r) => (
        <button
          key={r.id ?? r.date}
          type="button"
          className="journal-search-result-row"
          onClick={() => setSelected(r.date)}
        >
          <span className="journal-search-result-row__date">{r.date}</span>
          <span className="journal-search-result-row__excerpt">{buildExcerpt(r)}</span>
        </button>
      ))}

      {selected && (
        <JournalDetailSheet
          userId={userId}
          date={selected}
          initialJournal={results.find((r) => r.date === selected) ?? null}
          onClose={() => setSelected(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  )
}
