import { useEffect, useState } from 'react'
import { Header } from '../components/platform/Header'
import { Button } from '../components/Button'
import { CheckIcon, ClockIcon, XIcon } from '../icons'
import { haptic } from '../platform/haptics'
import { t } from '../i18n'
import {
  filterWrongAnswers,
  getWrongAnswerStats,
  markRetryResult,
  setResolved,
  type WrongAnswer,
} from '../wrongAnswerStore'

interface Props {
  onBack: () => void
  onOpenLesson?: (lessonId: number) => void
}

type StatusFilter = 'unresolved' | 'resolved' | 'all'

export function WrongAnswerListScreen({ onBack, onOpenLesson }: Props) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('unresolved')
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  // 書き込み（解決済み切替・retry結果）後の再描画用の触媒
  const [, forceRefresh] = useState(0)
  const bump = () => forceRefresh((v) => v + 1)

  const [retryTarget, setRetryTarget] = useState<WrongAnswer | null>(null)

  // localStorage 読み出しは軽量なのでメモ化不要
  const stats = getWrongAnswerStats()
  const list = filterWrongAnswers({ status: statusFilter, category: categoryFilter })
  const categoryEntries = (() => {
    const map = new Map<string, number>()
    for (const item of filterWrongAnswers({ status: statusFilter })) {
      map.set(item.category, (map.get(item.category) ?? 0) + 1)
    }
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1])
  })()

  const handleResolveToggle = (item: WrongAnswer) => {
    haptic.light()
    setResolved(item.id, !item.resolvedAt)
    bump()
  }

  const handleRetryComplete = (id: string, correct: boolean) => {
    markRetryResult(id, correct)
    setRetryTarget(null)
    bump()
  }

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: "'Noto Sans JP', sans-serif" }}>
      <Header title={t('wrongAnswers.title')} onBack={onBack} />

      <div style={{ padding: '8px 20px 24px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Stats summary */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
          <StatCell label={t('wrongAnswers.statTotal')} value={stats.total} />
          <StatCell label={t('wrongAnswers.statUnresolved')} value={stats.unresolved} accent="warn" />
          <StatCell label={t('wrongAnswers.statResolved')} value={stats.resolved} accent="ok" />
        </div>

        {/* Status filter */}
        <SegmentedControl
          value={statusFilter}
          onChange={setStatusFilter}
          options={[
            { value: 'unresolved', label: t('wrongAnswers.filterUnresolved') },
            { value: 'resolved',   label: t('wrongAnswers.filterResolved') },
            { value: 'all',        label: t('wrongAnswers.filterAll') },
          ]}
        />

        {/* Category filter (chips) */}
        {categoryEntries.length > 0 && (
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
            <Chip
              active={categoryFilter === null}
              label={t('wrongAnswers.allCategories')}
              onClick={() => setCategoryFilter(null)}
            />
            {categoryEntries.map(([cat, n]) => (
              <Chip
                key={cat}
                active={categoryFilter === cat}
                label={`${cat} (${n})`}
                onClick={() => setCategoryFilter(categoryFilter === cat ? null : cat)}
              />
            ))}
          </div>
        )}

        {/* List */}
        {list.length === 0 ? (
          <EmptyState statusFilter={statusFilter} />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {list.map((item) => (
              <WrongAnswerCard
                key={item.id}
                item={item}
                onRetry={() => setRetryTarget(item)}
                onToggleResolved={() => handleResolveToggle(item)}
                onOpenLesson={onOpenLesson}
              />
            ))}
          </div>
        )}
      </div>

      {retryTarget && (
        <RetryModal
          item={retryTarget}
          onClose={() => setRetryTarget(null)}
          onComplete={handleRetryComplete}
        />
      )}
    </div>
  )
}

function StatCell({ label, value, accent }: { label: string; value: number; accent?: 'ok' | 'warn' }) {
  const color =
    accent === 'ok' ? 'var(--success-bright)' :
    accent === 'warn' ? 'var(--warm)' :
    'var(--text-primary)'
  return (
    <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', padding: '12px 14px', textAlign: 'center', boxShadow: 'var(--shadow-v3-card-inset)' }}>
      <div style={{ fontSize: '1.6rem', fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: '0.7333rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '.04em' }}>{label}</div>
    </div>
  )
}

function SegmentedControl<T extends string>({ value, onChange, options }: {
  value: T
  onChange: (v: T) => void
  options: { value: T; label: string }[]
}) {
  return (
    <div role="tablist" style={{ display: 'flex', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-pill)', padding: 4, gap: 2 }}>
      {options.map((opt) => {
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => { haptic.selection(); onChange(opt.value) }}
            style={{
              flex: 1,
              padding: '8px 10px',
              background: active ? 'var(--bg-card)' : 'transparent',
              color: active ? 'var(--text-primary)' : 'var(--text-secondary)',
              border: 'none',
              borderRadius: 'var(--radius-pill)',
              fontSize: '0.8667rem',
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: "'Noto Sans JP', sans-serif",
              boxShadow: active ? 'var(--shadow-v3-card-inset)' : 'none',
              minHeight: 36,
            }}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}

function Chip({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        flexShrink: 0,
        padding: '6px 12px',
        borderRadius: 'var(--radius-pill)',
        border: `1px solid ${active ? 'var(--brand)' : 'var(--border)'}`,
        background: active ? 'var(--accent-soft)' : 'transparent',
        color: active ? 'var(--brand)' : 'var(--text-secondary)',
        fontSize: '0.8667rem',
        fontWeight: 600,
        cursor: 'pointer',
        fontFamily: "'Noto Sans JP', sans-serif",
        minHeight: 32,
      }}
    >
      {label}
    </button>
  )
}

function WrongAnswerCard({ item, onRetry, onToggleResolved, onOpenLesson }: {
  item: WrongAnswer
  onRetry: () => void
  onToggleResolved: () => void
  onOpenLesson?: (lessonId: number) => void
}) {
  const [expanded, setExpanded] = useState(false)
  const isResolved = !!item.resolvedAt
  const dateStr = formatRelativeDate(item.wrongAt)
  return (
    <div
      style={{
        background: 'var(--bg-card)',
        borderRadius: 'var(--radius-lg)',
        padding: '16px 18px',
        boxShadow: 'var(--shadow-v3-card-inset)',
        border: isResolved ? `1px solid ${'var(--success-bright)'}33` : '1px solid transparent',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <span style={{ fontSize: '0.7333rem', fontWeight: 700, color: 'var(--brand)', letterSpacing: '.08em', textTransform: 'uppercase' }}>{item.category}</span>
        <span style={{ fontSize: '0.7333rem', color: 'var(--text-muted)' }}>·</span>
        <span style={{ fontSize: '0.7333rem', color: 'var(--text-muted)' }}>{item.lessonTitle}</span>
        <span style={{ marginLeft: 'auto', fontSize: '0.7333rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: 3 }}>
          <ClockIcon width={11} height={11} />
          {dateStr}
        </span>
      </div>
      <div style={{ fontSize: '1rem', fontWeight: 600, lineHeight: 1.5, marginBottom: 10, whiteSpace: 'pre-wrap' }}>
        {item.question}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 10 }}>
        <MiniLine label={t('wrongAnswers.yourAnswer')} text={item.selectedAnswer} accent="warn" />
        <MiniLine label={t('wrongAnswers.correctAnswer')} text={item.correctAnswer} accent="ok" />
      </div>

      {expanded && (
        <div style={{ background: 'var(--bg-elevated)', borderRadius: 12, padding: '10px 12px', marginBottom: 10, fontSize: '0.8667rem', color: 'var(--text-secondary)', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
          {item.explanation || t('wrongAnswers.noExplanation')}
        </div>
      )}

      {item.retryCount > 0 && (
        <div style={{ fontSize: '0.7333rem', color: 'var(--text-muted)', marginBottom: 8 }}>
          {t('wrongAnswers.retryStats', { correct: item.retryCorrectCount, total: item.retryCount })}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Button variant="primary" size="sm" onClick={onRetry}>{t('wrongAnswers.retry')}</Button>
        <Button variant="ghost" size="sm" onClick={() => setExpanded((x) => !x)}>
          {expanded ? t('wrongAnswers.hideExplanation') : t('wrongAnswers.showExplanation')}
        </Button>
        {onOpenLesson && (
          <Button variant="ghost" size="sm" onClick={() => onOpenLesson(item.lessonId)}>
            {t('wrongAnswers.openLesson')}
          </Button>
        )}
        <Button variant={isResolved ? 'ghost' : 'default'} size="sm" onClick={onToggleResolved}>
          {isResolved ? t('wrongAnswers.markUnresolved') : t('wrongAnswers.markResolved')}
        </Button>
      </div>
    </div>
  )
}

function MiniLine({ label, text, accent }: { label: string; text: string; accent: 'ok' | 'warn' }) {
  const color = accent === 'ok' ? 'var(--success-bright)' : 'var(--warm)'
  return (
    <div style={{ background: 'var(--bg-elevated)', borderRadius: 10, padding: '8px 10px' }}>
      <div style={{ fontSize: '0.6667rem', fontWeight: 700, color, letterSpacing: '.04em', marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: '0.8667rem', color: 'var(--text-primary)', lineHeight: 1.4, wordBreak: 'break-word' }}>{text}</div>
    </div>
  )
}

function EmptyState({ statusFilter }: { statusFilter: StatusFilter }) {
  const msg =
    statusFilter === 'unresolved' ? t('wrongAnswers.emptyUnresolved') :
    statusFilter === 'resolved'   ? t('wrongAnswers.emptyResolved') :
                                     t('wrongAnswers.emptyAll')
  return (
    <div className="card" style={{ padding: 'var(--s-7)', textAlign: 'center' }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 56, height: 56, borderRadius: 16, background: 'var(--accent-soft)', color: 'var(--brand)', marginBottom: 12 }}>
        <CheckIcon width={28} height={28} />
      </div>
      <div style={{ fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{msg}</div>
    </div>
  )
}

function RetryModal({ item, onClose, onComplete }: {
  item: WrongAnswer
  onClose: () => void
  onComplete: (id: string, correct: boolean) => void
}) {
  const [picked, setPicked] = useState<number | null>(null)
  const [revealed, setRevealed] = useState(false)
  const hasOptions = (item.options?.length ?? 0) > 0

  const handlePick = (i: number) => {
    if (revealed) return
    haptic.selection()
    setPicked(i)
    setRevealed(true)
  }

  const correct = hasOptions && picked != null ? !!item.options?.[picked]?.correct : false
  const finish = () => onComplete(item.id, correct)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 90,
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        padding: 0,
      }}
    >
      <button
        type="button"
        aria-label={t('wrongAnswers.close')}
        onClick={onClose}
        style={{
          position: 'absolute', inset: 0,
          background: 'rgba(0,0,0,0.5)',
          border: 'none', padding: 0, cursor: 'pointer',
        }}
      />
      <div
        role="dialog"
        aria-modal="true"
        style={{
          position: 'relative',
          width: '100%', maxWidth: 560,
          background: 'var(--bg-card)',
          borderTopLeftRadius: 20, borderTopRightRadius: 20,
          padding: '20px 20px calc(env(safe-area-inset-bottom) + 24px)',
          maxHeight: '92vh', overflowY: 'auto',
          boxShadow: '0 -10px 30px rgba(0,0,0,0.3)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--brand)', letterSpacing: '.08em' }}>{t('wrongAnswers.retryHeader')}</div>
          <button type="button" onClick={onClose} aria-label={t('wrongAnswers.close')} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}>
            <XIcon width={20} height={20} />
          </button>
        </div>
        <div style={{ fontSize: '1.0667rem', fontWeight: 700, lineHeight: 1.5, marginBottom: 14, whiteSpace: 'pre-wrap' }}>
          {item.question}
        </div>

        {hasOptions ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 16 }}>
            {item.options!.map((opt, i) => {
              const isPicked = picked === i
              const showCorrect = revealed && opt.correct
              const showWrong = revealed && isPicked && !opt.correct
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => handlePick(i)}
                  disabled={revealed}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '12px 14px',
                    borderRadius: 12,
                    border: `1.5px solid ${showCorrect ? 'var(--success-bright)' : showWrong ? 'var(--warm)' : isPicked ? 'var(--brand)' : 'var(--border)'}`,
                    background: showCorrect ? 'rgba(52, 199, 89, 0.08)' : showWrong ? 'rgba(255, 149, 0, 0.08)' : 'var(--bg-elevated)',
                    color: 'var(--text-primary)',
                    fontSize: '0.9333rem',
                    fontWeight: 500,
                    fontFamily: "'Noto Sans JP', sans-serif",
                    cursor: revealed ? 'default' : 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10,
                  }}
                >
                  <span style={{ flex: 1, lineHeight: 1.5 }}>{opt.label}</span>
                  {showCorrect && <CheckIcon width={18} height={18} />}
                  {showWrong && <XIcon width={18} height={18} />}
                </button>
              )
            })}
          </div>
        ) : (
          // 古いカード（options 未保存）の救済: 自己採点
          <SelfAssessment
            correctAnswer={item.correctAnswer}
            onResult={(c) => onComplete(item.id, c)}
            onClose={onClose}
          />
        )}

        {hasOptions && revealed && (
          <>
            <div style={{ background: 'var(--bg-elevated)', borderRadius: 12, padding: '12px 14px', marginBottom: 12, fontSize: '0.8667rem', lineHeight: 1.6, color: 'var(--text-secondary)', whiteSpace: 'pre-wrap' }}>
              <div style={{ fontSize: '0.7333rem', fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6, letterSpacing: '.04em' }}>{t('wrongAnswers.explanationHeader')}</div>
              {item.explanation || t('wrongAnswers.noExplanation')}
            </div>
            <Button variant="primary" size="lg" block onClick={finish}>
              {correct ? t('wrongAnswers.gotIt') : t('wrongAnswers.tryAgainLater')}
            </Button>
          </>
        )}
      </div>
    </div>
  )
}

function SelfAssessment({ correctAnswer, onResult, onClose: _onClose }: {
  correctAnswer: string
  onResult: (correct: boolean) => void
  onClose: () => void
}) {
  const [revealed, setRevealed] = useState(false)
  if (!revealed) {
    return (
      <Button variant="primary" size="lg" block onClick={() => setRevealed(true)}>
        {t('wrongAnswers.showAnswer')}
      </Button>
    )
  }
  return (
    <>
      <div style={{ background: 'var(--bg-elevated)', borderRadius: 12, padding: '12px 14px', marginBottom: 14 }}>
        <div style={{ fontSize: '0.7333rem', fontWeight: 700, color: 'var(--success-bright)', marginBottom: 4, letterSpacing: '.04em' }}>{t('wrongAnswers.correctAnswer')}</div>
        <div style={{ fontSize: '0.9333rem', fontWeight: 600 }}>{correctAnswer}</div>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <Button variant="default" size="lg" block onClick={() => onResult(false)}>{t('wrongAnswers.stillHard')}</Button>
        <Button variant="primary" size="lg" block onClick={() => onResult(true)}>{t('wrongAnswers.understood')}</Button>
      </div>
    </>
  )
}

function formatRelativeDate(iso: string): string {
  const then = new Date(iso).getTime()
  const now = Date.now()
  const diffMin = Math.floor((now - then) / 60000)
  if (diffMin < 1) return t('wrongAnswers.justNow')
  if (diffMin < 60) return t('wrongAnswers.minAgo', { n: diffMin })
  const diffHr = Math.floor(diffMin / 60)
  if (diffHr < 24) return t('wrongAnswers.hourAgo', { n: diffHr })
  const diffDay = Math.floor(diffHr / 24)
  if (diffDay < 7) return t('wrongAnswers.dayAgo', { n: diffDay })
  return new Date(iso).toLocaleDateString()
}
