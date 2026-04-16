import { useState } from 'react'
import { getCompletedCount } from '../stats'
import { getPoints, RANK_TIERS, getCurrentTier, type RankTier } from './homeHelpers'
import { ArrowLeftIcon, StarIcon, CheckIcon } from '../icons'
import { IconButton } from '../components/IconButton'
import { RankIllustration } from '../components/RankIllustration'
import { t, getLocale } from '../i18n'

interface RankScreenProps {
  onBack: () => void
}

export function RankScreen({ onBack }: RankScreenProps) {
  const completed = getCompletedCount()
  const points = getPoints()
  const xp = completed * 100
  const level = Math.floor(xp / 1000) + 1
  const levelXp = xp % 1000
  const levelPct = (levelXp / 1000) * 100
  const tier = getCurrentTier(xp)
  const isJa = getLocale() === 'ja'
  const title = isJa ? tier.title : tier.titleEn

  const [selectedTier, setSelectedTier] = useState<RankTier | null>(null)

  const nextTier = RANK_TIERS.find((t) => t.level === tier.level + 1)
  const xpToNext = nextTier ? nextTier.minXp - xp : 0

  return (
    <div className="stack">
      <div className="screen-header">
        <IconButton aria-label={t('common.back')} onClick={onBack}>
          <ArrowLeftIcon />
        </IconButton>
        <div className="progress-text">{t('rank.title')}</div>
      </div>

      {/* Current rank hero */}
      <section className="profile-hero" style={{ textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 'var(--s-3)' }}>
          <RankIllustration level={level} size={160} />
        </div>
        <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.55)', marginBottom: 4 }}>
          Lv.{level}
        </div>
        <div style={{ fontSize: 24, fontWeight: 800, color: '#fff', marginBottom: 'var(--s-4)', letterSpacing: '-0.02em' }}>
          {title}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)' }}>
            {t('home.levelProgress')}
          </span>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>
            {levelXp} / 1,000 XP
          </span>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.14)', height: 10, borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
          <div style={{ background: 'var(--brand-light)', height: '100%', width: `${levelPct}%`, borderRadius: 'var(--radius-full)' }} />
        </div>
        {nextTier && (
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 'var(--s-3)' }}>
            {isJa ? `次のランク「${nextTier.title}」まで ${xpToNext} XP` : `${xpToNext} XP to "${nextTier.titleEn}"`}
          </div>
        )}
      </section>

      {/* Points summary */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-4)', padding: 'var(--s-4)' }}>
        <span style={{ color: 'var(--brand)', display: 'flex', alignItems: 'center' }}>
          <StarIcon width={24} height={24} />
        </span>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 2 }}>
            {t('rank.totalPoints')}
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, color: 'var(--brand)', letterSpacing: '-0.02em' }}>
            {points.toLocaleString()} <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-muted)' }}>pt</span>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 11, color: 'var(--text-faint)', marginBottom: 2 }}>{t('rank.completedLessons')}</div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{completed}</div>
        </div>
      </div>

      {/* How to earn points */}
      <div className="card" style={{ padding: 'var(--s-4)' }}>
        <h2 style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 'var(--s-3)' }}>
          {t('rank.howToEarn')}
        </h2>
        {[
          { label: t('rank.earn.lesson'), value: `+50 ${t('label.ptUnit')}` },
          { label: t('rank.earn.studyMin'), value: t('label.ptPerMin') },
        ].map(({ label, value }, i) => (
          <div key={i}>
            {i > 0 && <div style={{ height: 1, background: 'var(--border)', margin: 'var(--s-2) 0' }} />}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 'var(--s-1) 0' }}>
              <span style={{ fontSize: 14, color: 'var(--text)' }}>{label}</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--brand)' }}>{value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* All rank tiers */}
      <div>
        <div style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 'var(--s-3)' }}>
          {t('rank.allRanks')}
        </div>
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          {RANK_TIERS.map((r, i) => {
            const isCurrent = r.level === tier.level
            const isUnlocked = xp >= r.minXp
            return (
              <div key={r.level}>
                {i > 0 && <div style={{ height: 1, background: 'var(--border)', marginLeft: 'var(--s-4)' }} />}
                <button
                  onClick={() => setSelectedTier(r)}
                  style={{
                    display: 'flex', alignItems: 'center', width: '100%',
                    padding: 'var(--s-3) var(--s-4)', gap: 'var(--s-3)',
                    background: isCurrent ? 'var(--brand-soft)' : 'transparent',
                    border: 'none', cursor: 'pointer', textAlign: 'left',
                  }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                    overflow: 'hidden', opacity: isUnlocked ? 1 : 0.35,
                    outline: isCurrent ? '2px solid var(--brand)' : 'none', outlineOffset: 2,
                  }}>
                    <RankIllustration level={r.level} size={44} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: isCurrent ? 700 : 400, color: isCurrent ? 'var(--brand)' : isUnlocked ? 'var(--text)' : 'var(--text-faint)' }}>
                      {isJa ? r.title : r.titleEn}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 1 }}>
                      {r.minXp.toLocaleString()} XP~
                    </div>
                  </div>
                  {isCurrent ? (
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--brand)', background: 'var(--brand-soft)', border: '1px solid var(--brand)', borderRadius: 'var(--radius-full)', padding: '2px 8px' }}>
                      {t('rank.currentBadge')}
                    </span>
                  ) : isUnlocked ? (
                    <CheckIcon width={16} height={16} style={{ color: 'var(--success)', flexShrink: 0 }} />
                  ) : (
                    <span style={{ fontSize: 11, color: 'var(--text-faint)' }}>🔒</span>
                  )}
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* 哲学者詳細ボトムシート */}
      {selectedTier && (
        <div
          onClick={() => setSelectedTier(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
            zIndex: 200, display: 'flex', alignItems: 'flex-end',
            animation: 'fade-in-up 0.2s ease-out both',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--bg-card)',
              borderRadius: '28px 28px 0 0',
              padding: '28px 24px 40px',
              width: '100%', maxHeight: '80vh', overflow: 'auto',
              animation: 'fade-in-up 0.25s ease-out both',
            }}
          >
            {/* 閉じるハンドル */}
            <div style={{ width: 40, height: 4, background: 'var(--border)', borderRadius: 99, margin: '0 auto 20px' }} />

            {/* イラスト + タイトル */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
              <div style={{ borderRadius: 20, overflow: 'hidden', flexShrink: 0, boxShadow: 'var(--shadow-md)' }}>
                <RankIllustration level={selectedTier.level} size={88} />
              </div>
              <div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--brand)', marginBottom: 4 }}>
                  Lv.{selectedTier.level}
                </div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 26, fontWeight: 900, color: 'var(--text)', letterSpacing: '-0.02em' }}>
                  {isJa ? selectedTier.title : selectedTier.titleEn}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                  {selectedTier.minXp.toLocaleString()} XP~
                </div>
              </div>
            </div>

            {/* 名言 */}
            <div style={{
              background: 'linear-gradient(145deg, #0D1B3E, #1E2D5C)',
              borderRadius: 18, padding: '16px 18px', marginBottom: 16,
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', top: -30, right: -30, width: 120, height: 120,
                background: 'radial-gradient(circle, rgba(158,179,240,0.25) 0%, transparent 70%)',
                pointerEvents: 'none',
              }} />
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--brand-light)', marginBottom: 8 }}>
                名言
              </div>
              <div style={{ fontSize: 16, fontStyle: 'italic', color: '#fff', lineHeight: 1.6 }}>
                {isJa ? selectedTier.quoteJa : selectedTier.quoteEn}
              </div>
            </div>

            {/* 説明 */}
            <div style={{ fontSize: 15, color: 'var(--text-secondary)', lineHeight: 1.75 }}>
              {isJa ? selectedTier.descJa : selectedTier.descEn}
            </div>

            {/* レッスンヒント */}
            <div style={{
              marginTop: 16,
              background: 'var(--brand-soft)', borderRadius: 14, padding: '12px 14px',
            }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--brand)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                学習ヒント
              </div>
              <div style={{ fontSize: 13, color: 'var(--brand-hover)', lineHeight: 1.6 }}>
                {isJa ? selectedTier.tipJa : selectedTier.tipEn}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
