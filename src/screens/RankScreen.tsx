import { getCompletedCount } from '../stats'
import { getPoints, RANK_TIERS, getCurrentTier } from './homeHelpers'
import { ArrowLeftIcon, StarIcon, CheckIcon } from '../icons'
import { IconButton } from '../components/IconButton'
import { t } from '../i18n'

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
  const isJa = t('nav.home') === 'ホーム'
  const title = isJa ? tier.title : tier.titleEn

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
        <div style={{ fontSize: 56, fontWeight: 800, lineHeight: 1, letterSpacing: '-0.03em', color: '#fff', marginBottom: 'var(--s-2)' }}>
          Lv.{level}
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, color: 'rgba(255,255,255,0.9)', marginBottom: 'var(--s-4)' }}>
          {title}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.6)' }}>
            LEVEL PROGRESS
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
            {isJa ? `次のランク「${isJa ? nextTier.title : nextTier.titleEn}」まで ${xpToNext} XP` : `${xpToNext} XP to "${nextTier.titleEn}"`}
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
          { label: t('rank.earn.lesson'), value: '+50 pt' },
          { label: t('rank.earn.studyMin'), value: '+2 pt / min' },
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
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: 'var(--s-3) var(--s-4)',
                  gap: 'var(--s-3)',
                  background: isCurrent ? 'var(--brand-soft)' : 'transparent',
                }}>
                  {/* Level badge */}
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                    background: isCurrent ? 'var(--brand)' : isUnlocked ? 'var(--bg-secondary)' : 'var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700,
                    color: isCurrent ? '#fff' : isUnlocked ? 'var(--text)' : 'var(--text-faint)',
                  }}>
                    {r.level}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: isCurrent ? 700 : 400, color: isCurrent ? 'var(--brand)' : isUnlocked ? 'var(--text)' : 'var(--text-faint)' }}>
                      {isJa ? r.title : r.titleEn}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-faint)', marginTop: 1 }}>
                      {r.minXp.toLocaleString()} XP~
                    </div>
                  </div>
                  {isCurrent && (
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--brand)', background: 'var(--brand-soft)', border: '1px solid var(--brand)', borderRadius: 'var(--radius-full)', padding: '2px 8px' }}>
                      NOW
                    </span>
                  )}
                  {isUnlocked && !isCurrent && (
                    <span style={{ color: 'var(--success)', display: 'flex' }}>
                      <CheckIcon width={16} height={16} />
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
