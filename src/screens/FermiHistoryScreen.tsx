import React, { useEffect, useMemo, useState } from 'react'
import { Header } from '../components/platform/Header'
import { BarChartIcon, ChevronRightIcon, LightbulbIcon } from '../icons'
import { API_BASE } from './apiBase'
import { getGuestId } from '../guestId'
import { findFermiPoolIndex } from '../fermiData'
import { t, getLocale } from '../i18n'

interface FermiHistoryItem {
  id: string
  question_date: string
  question_text: string
  user_input: string
  score: number | null
  score_breakdown: string | null
  ai_feedback: string | null
  hint_used: boolean
  elapsed_sec: number | null
  locale: string
  created_at: string
}

interface FermiHistoryScreenProps {
  onBack: () => void
  onRetry: (poolIndex: number) => void
}

function boldify(text: string): string {
  return text.replace(/\*\*(.+?)\*\*/g, '<strong style="color:var(--brand)">$1</strong>')
}

function renderFeedbackMarkdown(text: string) {
  const lines = text.split('\n')
  const elements: React.JSX.Element[] = []
  let key = 0
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) { elements.push(<div key={key++} style={{ height: 8 }} />); continue }
    if (trimmed.startsWith('## ')) {
      elements.push(
        <div key={key++} className="eyebrow accent" style={{ marginTop: 'var(--s-3)', marginBottom: 'var(--s-1)', fontSize: 14 }}>
          {trimmed.slice(3)}
        </div>
      )
      continue
    }
    const numMatch = trimmed.match(/^(\d+)\.\s+(.+)/)
    if (numMatch) {
      elements.push(
        <div key={key++} style={{ display: 'flex', gap: 8, fontSize: 14, lineHeight: 1.7, marginBottom: 2 }}>
          <span style={{ color: 'var(--brand)', fontWeight: 700, minWidth: 20 }}>{numMatch[1]}.</span>
          <span dangerouslySetInnerHTML={{ __html: boldify(numMatch[2]) }} />
        </div>
      )
      continue
    }
    if (trimmed.startsWith('- ')) {
      elements.push(
        <div key={key++} style={{ display: 'flex', gap: 8, fontSize: 14, lineHeight: 1.7, marginBottom: 2, paddingLeft: 4 }}>
          <span style={{ color: 'var(--text-muted)' }}>•</span>
          <span dangerouslySetInnerHTML={{ __html: boldify(trimmed.slice(2)) }} />
        </div>
      )
      continue
    }
    elements.push(
      <div key={key++} style={{ fontSize: 14, lineHeight: 1.7 }} dangerouslySetInnerHTML={{ __html: boldify(trimmed) }} />
    )
  }
  return elements
}

function getScoreTone(score: number | null): string {
  if (score == null) return 'var(--text-muted)'
  if (score >= 80) return 'var(--score-excellent)'
  if (score >= 60) return 'var(--score-good)'
  if (score >= 40) return 'var(--score-keep)'
  return 'var(--score-retry)'
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso)
    const localeStr = getLocale() === 'ja' ? 'ja-JP' : 'en-US'
    return d.toLocaleDateString(localeStr, { year: 'numeric', month: 'short', day: 'numeric' })
  } catch {
    return iso
  }
}

function formatElapsed(sec: number | null): string | null {
  if (sec == null || sec <= 0) return null
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return t('fermiHistory.elapsed', { m: String(m).padStart(2, '0'), s: String(s).padStart(2, '0') })
}

export function FermiHistoryScreen({ onBack, onRetry }: FermiHistoryScreenProps) {
  const [items, setItems] = useState<FermiHistoryItem[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const run = async () => {
      try {
        const guestId = getGuestId()
        const res = await fetch(`${API_BASE}/api/fermi/history?guestId=${encodeURIComponent(guestId)}&limit=100`)
        if (!res.ok) throw new Error('Network error')
        const data = await res.json()
        if (cancelled) return
        setItems(Array.isArray(data.history) ? data.history : [])
      } catch (e) {
        if (cancelled) return
        setError((e as Error).message || t('fermiHistory.loadError'))
        setItems([])
      }
    }
    run()
    return () => { cancelled = true }
  }, [])

  const sorted = useMemo(() => {
    if (!items) return []
    return [...items].sort((a, b) => (b.created_at || '').localeCompare(a.created_at || ''))
  }, [items])

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      <Header title={t('fermiHistory.title')} onBack={onBack} />

      <div style={{ padding: '8px 16px 32px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {items === null && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: 14 }}>
            {t('fermiHistory.loading')}
          </div>
        )}

        {error && (
          <div style={{ background: 'rgba(220,38,38,0.06)', borderRadius: 'var(--radius-md)', padding: '12px 14px', color: 'var(--danger)', fontSize: 14 }}>
            {error}
          </div>
        )}

        {items !== null && sorted.length === 0 && !error && (
          <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--text-muted)', fontSize: 14 }}>
            {t('fermiHistory.empty')}
          </div>
        )}

        {sorted.map(item => {
          const expanded = expandedId === item.id
          const poolIndex = findFermiPoolIndex(item.question_text)
          const canRetry = poolIndex >= 0
          const elapsed = formatElapsed(item.elapsed_sec)

          return (
            <article
              key={item.id}
              style={{
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-lg)',
                padding: '14px 16px',
                boxShadow: 'var(--shadow-v3-card-inset)',
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
              }}
            >
              {/* Header row */}
              <button
                type="button"
                onClick={() => setExpandedId(expanded ? null : item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: 12,
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  textAlign: 'left',
                  color: 'inherit',
                  width: '100%',
                  fontFamily: 'inherit',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>
                    {formatDate(item.created_at || item.question_date)}
                    {elapsed && <span style={{ marginLeft: 10, fontWeight: 600 }}>{elapsed}</span>}
                    {item.hint_used && <span style={{ marginLeft: 10, fontWeight: 600 }}>· {t('fermiHistory.hintUsed')}</span>}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.5, color: 'var(--text-primary)' }}>
                    {item.question_text}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
                  <div style={{
                    fontSize: 20,
                    fontWeight: 900,
                    color: getScoreTone(item.score),
                    lineHeight: 1,
                    fontFamily: "'Inter Tight', monospace",
                  }}>
                    {item.score ?? '—'}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600 }}>/100</div>
                  <ChevronRightIcon
                    width={18}
                    height={18}
                    style={{ color: 'var(--text-muted)', transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}
                  />
                </div>
              </button>

              {/* Expanded details */}
              {expanded && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
                  {item.score_breakdown && (() => {
                    // 後方互換: 2026-05-19 以降は { breakdown, details } の JSON 文字列、
                    // それ以前は生テキスト。両方を受け付ける。
                    let breakdown: string | null = item.score_breakdown
                    let details: { logic?: string; originality?: string; clarity?: string } | null = null
                    try {
                      const parsed = JSON.parse(item.score_breakdown)
                      if (parsed && typeof parsed === 'object' && parsed.breakdown) {
                        breakdown = parsed.breakdown
                        details = parsed.details || null
                      }
                    } catch { /* 生テキストとして扱う */ }
                    return (
                      <div style={{ background: 'var(--bg-secondary)', borderRadius: 'var(--radius-sm)', padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-secondary)' }}>{breakdown}</div>
                        {details && (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 4 }}>
                            {[
                              { key: 'logic' as const, label: t('dailyFermi.scoreLogic') },
                              { key: 'originality' as const, label: t('dailyFermi.scoreOriginality') },
                              { key: 'clarity' as const, label: t('dailyFermi.scoreClarity') },
                            ].map(({ key, label }) => {
                              const reason = details?.[key]
                              if (!reason) return null
                              return (
                                <div key={key} style={{ display: 'flex', gap: 8, fontSize: 12, lineHeight: 1.55 }}>
                                  <span style={{ fontWeight: 700, color: 'var(--text-muted)', minWidth: 48 }}>{label}</span>
                                  <span style={{ color: 'var(--text-primary)', flex: 1 }}>{reason}</span>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    )
                  })()}

                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>
                      {t('fermiHistory.yourAnswer')}
                    </div>
                    <div style={{
                      fontSize: 14,
                      lineHeight: 1.7,
                      color: 'var(--text-primary)',
                      whiteSpace: 'pre-wrap',
                      background: 'var(--bg-secondary)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '10px 12px',
                    }}>
                      {item.user_input}
                    </div>
                  </div>

                  {item.ai_feedback && (
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                        <BarChartIcon width={14} height={14} style={{ color: 'var(--brand)' }} />
                        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                          {t('fermiHistory.aiFeedback')}
                        </span>
                      </div>
                      <div style={{ color: 'var(--text-primary)' }}>
                        {renderFeedbackMarkdown(item.ai_feedback)}
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                    {canRetry ? (
                      <button
                        type="button"
                        onClick={() => onRetry(poolIndex)}
                        style={{
                          flex: 1,
                          padding: '12px 14px',
                          borderRadius: 'var(--radius-pill)',
                          border: 'none',
                          background: 'var(--brand)',
                          color: 'var(--accent-fg)',
                          fontSize: 14,
                          fontWeight: 700,
                          cursor: 'pointer',
                          fontFamily: 'inherit',
                          minHeight: 44,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 6,
                        }}
                      >
                        <LightbulbIcon width={16} height={16} />
                        {t('fermiHistory.retry')}
                      </button>
                    ) : (
                      <div style={{
                        flex: 1,
                        padding: '12px 14px',
                        borderRadius: 'var(--radius-pill)',
                        background: 'var(--bg-elevated)',
                        color: 'var(--text-muted)',
                        fontSize: 13,
                        fontWeight: 600,
                        textAlign: 'center',
                        minHeight: 44,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        {t('fermiHistory.retryDisabled')}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </article>
          )
        })}
      </div>
    </div>
  )
}
