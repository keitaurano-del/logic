import { useState } from 'react'
import { CheckIcon } from '../icons'
import { Header } from '../components/platform/Header'
import { Button } from '../components/Button'
import { ActionSheet } from '../components/ActionSheet'
import { API_BASE } from './apiBase'
import { t } from '../i18n'
import { haptic } from '../platform/haptics'

interface ReportContext {
  lessonId?: number
  lessonTitle?: string
  question?: string
}

interface ReportProblemScreenProps {
  context: ReportContext
  onBack: () => void
}

const ISSUE_TYPES = [
  { value: '誤字/脱字', label: '誤字・脱字' },
  { value: '解説が間違い', label: '解説が間違い' },
  { value: '選択肢が不正確', label: '選択肢が不正確' },
  { value: 'その他', label: 'その他' },
]

export function ReportProblemScreen({ context, onBack }: ReportProblemScreenProps) {
  const [issueType, setIssueType] = useState('')
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [issueSheetOpen, setIssueSheetOpen] = useState(false)
  const issueLabel = ISSUE_TYPES.find(it => it.value === issueType)?.label ?? ''

  const handleSubmit = async () => {
    if (!issueType) return
    haptic.light()
    setSubmitting(true)
    setError('')
    try {
      const res = await fetch(`${API_BASE}/api/report-problem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lessonTitle: context.lessonTitle || '',
          lessonId: context.lessonId,
          question: context.question || '',
          issueType,
          comment,
        }),
      })
      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error || t('common.error'))
      setDone(true)
    } catch (e: unknown) {
      setError((e as Error).message || t('common.error'))
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return (
      <div className="stack">
        <Header title={t('report.title')} onBack={onBack} />
        <div className="feedback-card" style={{ animation: 'scale-in 0.2s ease-out both' }}>
          <div className="feedback-head">
            <div className="feedback-check"><CheckIcon /></div>
            <div className="feedback-title">{t('report.successTitle')}</div>
          </div>
          <div className="feedback-text">{t('report.successBody')}</div>
        </div>
        <Button variant="primary" size="lg" block onClick={onBack}>
          {t('common.back')}
        </Button>
      </div>
    )
  }

  return (
    <div className="stack">
      <Header title={t('report.title')} onBack={onBack} />

      <div className="eyebrow">{t('report.eyebrow')}</div>
      <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: '-0.02em' }}>
        {t('report.heading')}
      </h1>

      {/* コンテキスト表示 */}
      {(context.lessonTitle || context.question) && (
        <div className="card" style={{ background: 'var(--bg-secondary)', fontSize: 16 }}>
          {context.lessonTitle && (
            <div style={{ marginBottom: context.question ? 6 : 0, fontWeight: 600 }}>
              {context.lessonTitle}
            </div>
          )}
          {context.question && (
            <div style={{ color: 'var(--text-muted)', lineHeight: 1.5 }}>
              {context.question.slice(0, 120)}{context.question.length > 120 ? '...' : ''}
            </div>
          )}
        </div>
      )}

      <div className="stack-sm">
        {/* 種別ドロップダウン */}
        <label style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-secondary)' }}>
          {t('report.issueTypeLabel')}
        </label>
        <button
          type="button"
          onClick={() => setIssueSheetOpen(true)}
          aria-haspopup="dialog"
          style={{
            width: '100%',
            padding: '11px 14px',
            borderRadius: 'var(--radius-md)',
            border: '1.5px solid var(--border)',
            background: 'var(--bg-card)',
            color: issueType ? 'var(--text-primary)' : 'var(--text-muted)',
            fontSize: 16,
            outline: 'none',
            cursor: 'pointer',
            textAlign: 'left',
            fontFamily: 'inherit',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
          }}
        >
          <span>{issueLabel || t('report.issueTypePlaceholder')}</span>
          <span aria-hidden="true" style={{ fontSize: 12, opacity: 0.6 }}>▾</span>
        </button>
        <ActionSheet
          open={issueSheetOpen}
          title={t('report.issueTypeLabel')}
          items={ISSUE_TYPES.map(it => ({ id: it.value, label: it.label }))}
          onSelect={(id) => { setIssueType(id); setIssueSheetOpen(false) }}
          onCancel={() => setIssueSheetOpen(false)}
        />

        {/* コメント */}
        <label style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-secondary)', marginTop: 'var(--s-2)' }}>
          {t('report.commentLabel')}
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={t('report.commentPlaceholder')}
          rows={4}
          style={{
            width: '100%',
            padding: '11px 14px',
            borderRadius: 'var(--radius-md)',
            border: '1.5px solid var(--border)',
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            fontSize: 16,
            lineHeight: 1.6,
            resize: 'vertical',
            outline: 'none',
            fontFamily: 'inherit',
          }}
        />

        {error && (
          <div style={{ fontSize: 16, color: 'var(--danger)' }}>{error}</div>
        )}

        <Button
          variant="primary"
          size="lg"
          block
          disabled={!issueType || submitting}
          onClick={handleSubmit}
        >
          {submitting ? t('common.loading') : t('report.submitButton')}
        </Button>
      </div>
    </div>
  )
}
