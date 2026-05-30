import { useEffect, useState } from 'react'
import { JournalCalendar } from '../components/journal/JournalCalendar'
import { JournalGoalsHeader } from '../components/journal/JournalGoalsHeader'
import { JournalSearch } from '../components/journal/JournalSearch'
import { JournalAssistantSheet } from '../components/journal/JournalAssistantSheet'
import { JournalAssistantHistorySheet } from '../components/journal/JournalAssistantHistorySheet'
import { JournalRecentList } from '../components/journal/JournalRecentList'
import { StreakBadge } from '../components/journal/StreakBadge'
import { fetchJournalStreak } from '../components/journal/journalDb'
import { SearchIcon, XIcon, HistoryIcon, SparklesIcon } from '../icons'
import { t, getLocale } from '../i18n'
import { useStudyTimer } from '../hooks/useStudyTimer'
import '../components/journal/journal.css'

interface JournalScreenProps {
  userId: string
  assistantName: string
  onUpdateAssistantName: (name: string) => Promise<void>
  /** AI アシスタントの推薦レッスンタップから呼ばれる遷移ハンドラ */
  onOpenLesson?: (lessonId: number) => void
  /** AI アシスタントの推薦コースタップから呼ばれる遷移ハンドラ（カテゴリ名で受け取る） */
  onOpenCourse?: (category: string) => void
}

interface JournalGuestPreviewProps {
  assistantName: string
  /** ログイン誘導 CTA タップ時に呼ばれる */
  onLogin: () => void
}

const PREVIEW_DOW_JA = ['日', '月', '火', '水', '木', '金', '土']
const PREVIEW_DOW_EN = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

/**
 * 未ログイン時のジャーナルプレビュー。
 * 7 日間無料トライアルの価値を体験前に判断できるよう、空のカレンダーと
 * AI アシスタントの説明を読み取り専用で見せ、利用しようとした段でログインへ誘導する。
 * 実 API（保存・取得）は一切叩かない。
 */
export function JournalGuestPreview({ assistantName, onLogin }: JournalGuestPreviewProps) {
  const locale = getLocale()
  const dowLabels = locale === 'en' ? PREVIEW_DOW_EN : PREVIEW_DOW_JA
  // 当月のセルだけを静的に描画（前後の埋めは空セル）。データは持たない読み取り専用プレビュー。
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth()
  const firstDow = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (number | null)[] = []
  for (let i = 0; i < firstDow; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>
      <div className="journal-hero">
        <div>
          <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-0.02em' }}>{t('journal.title')}</div>
          <div style={{ fontSize: 13, color: 'var(--text-on-hero-muted)', marginTop: 4 }}>{t('journal.subtitle')}</div>
        </div>
      </div>

      <div style={{ flex: 1, padding: '16px 16px 120px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* 7日間無料トライアル訴求 + ログイン CTA */}
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: 16,
          padding: 20,
          boxShadow: 'var(--shadow-v3-card-inset)',
          border: '1px solid rgba(255,255,255,.06)',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40, height: 40, borderRadius: '50%',
              background: 'linear-gradient(135deg, var(--brand), var(--brand-light, #8B5CF6))',
              color: 'var(--accent-fg, #fff)',
              flexShrink: 0,
            }}>
              <SparklesIcon width={22} height={22} aria-hidden="true" />
            </span>
            <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)' }}>
              {t('journal.previewTrialTitle')}
            </div>
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            {t('journal.previewTrialDesc')}
          </div>
          <button
            type="button"
            onClick={onLogin}
            style={{
              marginTop: 4,
              padding: '14px 24px',
              background: 'var(--accent-btn)',
              color: 'var(--accent-btn-fg, #fff)',
              border: 'none',
              borderRadius: 12,
              font: 'inherit',
              fontSize: 15,
              fontWeight: 700,
              cursor: 'pointer',
              minHeight: 48,
            }}
          >
            {t('journal.previewLoginCta')}
          </button>
        </div>

        {/* AI アシスタントの説明プレビュー */}
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: 16,
          padding: 20,
          boxShadow: 'var(--shadow-v3-card-inset)',
          border: '1px solid rgba(255,255,255,.06)',
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
        }}>
          <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>
            {t('journal.previewAssistantTitle', { name: assistantName })}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            {t('journal.previewAssistantDesc')}
          </div>
          <div style={{
            background: 'var(--bg-primary)',
            borderRadius: 12,
            padding: '12px 14px',
            fontSize: 13,
            color: 'var(--text-secondary)',
            lineHeight: 1.7,
            fontStyle: 'italic',
          }}>
            {t('journal.previewAssistantExample')}
          </div>
        </div>

        {/* 空のカレンダー（読み取り専用プレビュー） */}
        <div
          style={{
            background: 'var(--bg-card)',
            borderRadius: 16,
            padding: 16,
            boxShadow: 'var(--shadow-v3-card-inset)',
            border: '1px solid rgba(255,255,255,.06)',
            position: 'relative',
          }}
          aria-label={t('journal.previewCalendarAria')}
        >
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4, marginBottom: 6 }}>
            {dowLabels.map((d) => (
              <div key={d} style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-tertiary, var(--text-secondary))', fontWeight: 600 }}>
                {d}
              </div>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 4 }}>
            {cells.map((day, i) => (
              <div
                key={i}
                style={{
                  aspectRatio: '1 / 1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 10,
                  fontSize: 12,
                  color: day ? 'var(--text-secondary)' : 'transparent',
                  background: day ? 'var(--bg-primary)' : 'transparent',
                  opacity: 0.6,
                }}
              >
                {day ?? ''}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export function JournalScreen({ userId, assistantName, onOpenLesson, onOpenCourse }: JournalScreenProps) {
  // 学習時間計測 — ジャーナル画面の滞在時間を study_sessions に記録
  useStudyTimer({ type: 'journal' })
  const [streak, setStreak] = useState(0)
  const [searchOpen, setSearchOpen] = useState(false)
  const [assistantOpen, setAssistantOpen] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  // ジャーナル保存のたびにインクリメントして、recent list / streak を再フェッチさせる
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const s = await fetchJournalStreak(userId)
      if (!cancelled) setStreak(s)
    })()
    return () => { cancelled = true }
  }, [userId, refreshKey])

  const bumpRefresh = () => setRefreshKey((k) => k + 1)

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column' }}>
      <div className="journal-hero">
        <div>
          <div style={{ fontSize: 22, fontWeight: 900, letterSpacing: '-0.02em' }}>{t('journal.title')}</div>
          <div style={{ fontSize: 13, color: 'var(--text-on-hero-muted)', marginTop: 4 }}>{t('journal.subtitle')}</div>
        </div>
        <div className="journal-hero__actions">
          <StreakBadge streak={streak} size="sm" />
          <button
            type="button"
            className="journal-ai-btn"
            onClick={() => setAssistantOpen(true)}
            aria-label={t('journal.assistantOpenAria', { name: assistantName })}
          >
            <span className="journal-ai-btn__pulse" aria-hidden="true" />
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="journal-ai-btn__sparkle">
              <path d="M12 2l1.8 5.4L19 9l-5.2 1.6L12 16l-1.8-5.4L5 9l5.2-1.6z" fill="currentColor" />
              <path d="M19 14l.9 2.6L22 17l-2.1.4L19 20l-.9-2.6L16 17l2.1-.4z" fill="currentColor" opacity=".7" />
            </svg>
          </button>
          <button
            type="button"
            className="journal-hero__icon-btn"
            onClick={() => setHistoryOpen(true)}
            aria-label={t('journal.assistantHistoryOpenAria')}
          >
            <HistoryIcon width={20} height={20} />
          </button>
          <button
            type="button"
            className="journal-hero__icon-btn"
            onClick={() => setSearchOpen(true)}
            aria-label={t('journal.tabSearch')}
          >
            <SearchIcon width={20} height={20} />
          </button>
        </div>
      </div>

      <div style={{ flex: 1, padding: '16px 16px 120px', display: 'flex', flexDirection: 'column' }}>
        <JournalGoalsHeader userId={userId} />
        <JournalCalendar userId={userId} assistantName={assistantName} onSaved={bumpRefresh} />
        <JournalRecentList userId={userId} refreshKey={refreshKey} limit={5} />
      </div>

      {assistantOpen && (
        <JournalAssistantSheet
          userId={userId}
          assistantName={assistantName}
          onClose={() => setAssistantOpen(false)}
          onOpenLesson={onOpenLesson}
          onOpenCourse={onOpenCourse}
        />
      )}

      {historyOpen && (
        <JournalAssistantHistorySheet
          userId={userId}
          assistantName={assistantName}
          onClose={() => setHistoryOpen(false)}
          onOpenLesson={onOpenLesson}
          onOpenCourse={onOpenCourse}
        />
      )}

      {searchOpen && (
        <div className="journal-search-overlay" role="dialog" aria-modal="true" aria-label={t('journal.tabSearch')}>
          <div className="journal-search-overlay__sheet">
            <div className="journal-search-overlay__head">
              <div className="journal-search-overlay__title">{t('journal.tabSearch')}</div>
              <button
                type="button"
                className="journal-search-overlay__close"
                onClick={() => setSearchOpen(false)}
                aria-label={t('common.close')}
              >
                <XIcon width={20} height={20} />
              </button>
            </div>
            <div className="journal-search-overlay__body">
              <JournalSearch userId={userId} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
