import type { ReactNode } from 'react'
import { Header } from '../components/platform/Header'
import { BookOpenIcon, ChevronRightIcon, ClockIcon, RefreshIcon } from '../icons'
import { getCardStats } from '../flashcardData'
import { t } from '../i18n'
import type { FlashcardMode } from './FlashcardsScreen'

interface Props {
  onBack: () => void
  onStart: (mode: FlashcardMode) => void
}

/**
 * フラッシュカードの開始前に出すモード選択画面（FB-21）。
 * 復習ハブの「フラッシュカード」をタップすると、いきなり開始せずここに来る。
 *   今日する       = 期日到来分（getDueCards）
 *   全部復習する   = 全カード（getAllCards）
 *   ランダムで復習 = 全カードをシャッフル（getShuffledCards）
 */
export function ReviewModeScreen({ onBack, onStart }: Props) {
  const stats = getCardStats()

  return (
    <div style={{ minHeight: '100dvh', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontFamily: "'Noto Sans JP', sans-serif" }}>
      <Header title={t('reviewHub.flashcardsTitle')} onBack={onBack} />

      <div style={{ padding: '8px 20px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ fontSize: '0.9333rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          {t('reviewMode.lead')}
        </div>

        <ModeButton
          icon={<ClockIcon width={24} height={24} />}
          title={t('reviewMode.todayTitle')}
          desc={
            stats.due > 0
              ? t('reviewMode.todayDesc', { n: String(stats.due) })
              : t('reviewMode.todayEmpty')
          }
          disabled={stats.due === 0}
          onClick={() => onStart('due')}
        />

        <ModeButton
          icon={<BookOpenIcon width={24} height={24} />}
          title={t('reviewMode.allTitle')}
          desc={
            stats.total > 0
              ? t('reviewMode.allDesc', { n: String(stats.total) })
              : t('reviewMode.allEmpty')
          }
          disabled={stats.total === 0}
          onClick={() => onStart('all')}
        />

        <ModeButton
          icon={<RefreshIcon width={24} height={24} />}
          title={t('reviewMode.randomTitle')}
          desc={
            stats.total > 0
              ? t('reviewMode.randomDesc', { n: String(stats.total) })
              : t('reviewMode.allEmpty')
          }
          disabled={stats.total === 0}
          onClick={() => onStart('random')}
        />
      </div>
    </div>
  )
}

function ModeButton({ icon, title, desc, onClick, disabled }: {
  icon: ReactNode
  title: string
  desc: string
  onClick: () => void
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        textAlign: 'left',
        padding: '16px 18px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-v3-card-inset)',
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        fontFamily: "'Noto Sans JP', sans-serif",
        color: 'var(--text-primary)',
        minHeight: 72,
      }}
    >
      <div style={{ width: 48, height: 48, borderRadius: 14, background: 'var(--accent-soft)', color: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '1.0667rem', fontWeight: 700, lineHeight: 1.3 }}>{title}</div>
        <div style={{ fontSize: '0.8667rem', color: 'var(--text-secondary)', lineHeight: 1.4, marginTop: 2 }}>{desc}</div>
      </div>
      {!disabled && <ChevronRightIcon width={18} height={18} />}
    </button>
  )
}
