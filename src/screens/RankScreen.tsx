import { useState } from 'react'
import { getCompletedCount } from '../stats'
import { getPoints, RANK_TIERS, getCurrentTier, type RankTier } from './homeHelpers'
import { StarIcon, CheckIcon, LockIcon, LightbulbIcon } from '../icons'
import { Header } from '../components/platform/Header'
import { RankIllustration } from '../components/RankIllustration'
import { t, getLocale } from '../i18n'

interface RankScreenProps {
  onBack: () => void
}

export function RankScreen({ onBack }: RankScreenProps) {
  const completed = getCompletedCount()
  const points = getPoints()
  const xp = completed * 100
  const tier = getCurrentTier(xp)
  const isJa = getLocale() === 'ja'
  const title = isJa ? tier.title : tier.titleEn

  const [selectedTier, setSelectedTier] = useState<RankTier | null>(null)

  const nextTier = RANK_TIERS.find((t) => t.level === tier.level + 1)
  const xpToNext = nextTier ? nextTier.minXp - xp : 0
  // 進捗バーは「現在のランク → 次のランク」までの距離を表示する。
  const tierSpan = nextTier ? nextTier.minXp - tier.minXp : 1
  const tierProgress = xp - tier.minXp
  const tierPct = nextTier ? Math.max(2, Math.min(100, Math.round((tierProgress / tierSpan) * 100))) : 100

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', paddingBottom: 40 }}>
      <Header title={t('rank.title')} onBack={onBack} />

      {/* Hero Card */}
      <div style={{
        margin: '0 16px 20px',
        borderRadius: 24,
        background: 'linear-gradient(145deg, #0F1629 0%, #1A2744 50%, #0D1B3E 100%)',
        padding: '32px 24px 28px',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative gradient orbs */}
        <div style={{
          position: 'absolute', top: -40, right: -40, width: 160, height: 160,
          background: 'radial-gradient(circle, rgba(108,142,245,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: -30, left: -30, width: 120, height: 120,
          background: 'radial-gradient(circle, rgba(245,158,11,0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        {/* Avatar */}
        <div style={{
          display: 'flex', justifyContent: 'center', marginBottom: 20,
        }}>
          <div style={{
            borderRadius: 28, overflow: 'hidden',
            boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          }}>
            <RankIllustration level={tier.level} size={140} />
          </div>
        </div>

        {/* Rank badge — tier.level (1〜10) */}
        <div style={{ textAlign: 'center', marginBottom: 6 }}>
          <span style={{
            display: 'inline-block', fontSize: '0.9333rem', fontWeight: 800,
            letterSpacing: '0.15em', textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.45)', background: 'rgba(255,255,255,0.08)',
            borderRadius: 20, padding: '3px 14px',
          }}>
            {t('rank.indicator', { current: String(tier.level), total: String(RANK_TIERS.length) })}
          </span>
        </div>

        {/* Title */}
        <div style={{
          textAlign: 'center', fontSize: '2rem', fontWeight: 900,
          color: '#fff', letterSpacing: '-0.02em',
          fontFamily: "'Inter Tight', 'Inter', sans-serif",
          marginBottom: 24,
        }}>
          {title}
        </div>

        {/* XP Progress（現ランク → 次ランク） */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, padding: '0 2px' }}>
          <span style={{
            fontSize: '0.8667rem', fontWeight: 700, letterSpacing: '0.12em',
            textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)',
          }}>
            {t('home.levelProgress')}
          </span>
          <span style={{ fontSize: '0.9333rem', color: 'rgba(255,255,255,0.75)', fontWeight: 600 }}>
            {nextTier ? `${tierProgress.toLocaleString()} / ${tierSpan.toLocaleString()}` : 'MAX'}
          </span>
        </div>
        <div style={{
          background: 'rgba(255,255,255,0.1)', height: 8, borderRadius: 99, overflow: 'hidden',
        }}>
          <div style={{
            background: 'linear-gradient(90deg, #6C8EF5, #9BB3FA)',
            height: '100%', width: `${tierPct}%`, borderRadius: 99,
            transition: 'width 0.6s ease',
          }} />
        </div>
        {nextTier && (
          <div style={{
            fontSize: '0.9333rem', color: 'rgba(255,255,255,0.4)', marginTop: 10, textAlign: 'center',
          }}>
            {isJa
              ? t('rank.toNextRankJa', { name: nextTier.title, xp: xpToNext.toLocaleString() })
              : t('rank.toNextRankEn', { name: nextTier.titleEn, xp: xpToNext.toLocaleString() })}
          </div>
        )}
      </div>

      {/* Stats Row */}
      <div style={{
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12,
        margin: '0 16px 20px',
      }}>
        <div style={{
          background: 'var(--bg-card)', borderRadius: 16, padding: '16px 18px',
          border: '1px solid var(--border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <StarIcon width={18} height={18} style={{ color: 'var(--brand)' }} />
            <span style={{
              fontSize: '0.8667rem', fontWeight: 700, letterSpacing: '0.1em',
              textTransform: 'uppercase', color: 'var(--text-muted)',
            }}>
              {t('rank.totalPoints')}
            </span>
          </div>
          <div style={{
            fontSize: '2.1333rem', fontWeight: 800, color: 'var(--brand)', letterSpacing: '-0.02em',
          }}>
            {points.toLocaleString()}
            
          </div>
        </div>
        <div style={{
          background: 'var(--bg-card)', borderRadius: 16, padding: '16px 18px',
          border: '1px solid var(--border)',
        }}>
          <div style={{
            fontSize: '0.8667rem', fontWeight: 700, letterSpacing: '0.1em',
            textTransform: 'uppercase', color: 'var(--text-muted)',
            marginBottom: 6,
          }}>
            {t('rank.completedLessons')}
          </div>
          <div style={{
            fontSize: '2.1333rem', fontWeight: 800, color: 'var(--text)', letterSpacing: '-0.02em',
          }}>
            {completed}
            <span style={{ fontSize: '1.0667rem', fontWeight: 500, color: 'var(--text-muted)', marginLeft: 4 }}>{t('rank.lessonsUnit')}</span>
          </div>
        </div>
      </div>

      {/* How to Earn */}
      <div style={{ margin: '0 16px 20px' }}>
        <div style={{
          background: 'var(--bg-card)', borderRadius: 16,
          border: '1px solid var(--border)', overflow: 'hidden',
        }}>
          <div style={{
            padding: '14px 18px 10px', fontSize: '0.9333rem', fontWeight: 700,
            letterSpacing: '0.08em', textTransform: 'uppercase',
            color: 'var(--text-muted)',
          }}>
            {t('rank.howToEarn')}
          </div>
          {[
            { label: t('rank.earn.lesson'), value: `+50 ${t('label.ptUnit')}` },
            { label: t('rank.earn.studyMin'), value: t('label.ptPerMin') },
          ].map(({ label, value }, i) => (
            <div key={i} style={{
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '12px 18px',
              borderTop: '1px solid var(--border)',
            }}>
              <span style={{ fontSize: '1.0667rem', color: 'var(--text)' }}>{label}</span>
              <span style={{
                fontSize: '1.0667rem', fontWeight: 700, color: 'var(--brand)',
                background: 'var(--brand-soft)', borderRadius: 8, padding: '2px 10px',
              }}>{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* All Ranks */}
      <div style={{ margin: '0 16px' }}>
        <div style={{
          fontSize: '0.9333rem', fontWeight: 700, letterSpacing: '0.08em',
          textTransform: 'uppercase', color: 'var(--text-muted)',
          marginBottom: 12, paddingLeft: 4,
        }}>
          {t('rank.allRanks')}
        </div>
        <div style={{
          background: 'var(--bg-card)', borderRadius: 16,
          border: '1px solid var(--border)', overflow: 'hidden',
        }}>
          {RANK_TIERS.map((r, i) => {
            const isCurrent = r.level === tier.level
            const isUnlocked = xp >= r.minXp
            return (
              <div key={r.level}>
                {i > 0 && <div style={{ height: 1, background: 'var(--border)', marginLeft: 72 }} />}
                <button
                  onClick={() => setSelectedTier(r)}
                  style={{
                    display: 'flex', alignItems: 'center', width: '100%',
                    padding: '10px 16px', gap: 14,
                    background: isCurrent ? 'var(--brand-soft)' : 'transparent',
                    border: 'none', cursor: 'pointer', textAlign: 'left',
                  }}
                >
                  <div style={{
                    width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                    overflow: 'hidden', opacity: isUnlocked ? 1 : 0.45,
                    outline: isCurrent ? '2.5px solid var(--brand)' : 'none',
                    outlineOffset: 2,
                    boxShadow: isCurrent ? '0 2px 12px rgba(108,142,245,0.2)' : 'none',
                  }}>
                    <RankIllustration level={r.level} size={48} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: '1.0667rem', fontWeight: isCurrent ? 700 : 500,
                      color: isCurrent ? 'var(--brand)' : isUnlocked ? 'var(--text)' : 'var(--text-faint)',
                    }}>
                      {isJa ? r.title : r.titleEn}
                    </div>
                    <div style={{ fontSize: '0.9333rem', color: 'var(--text-faint)', marginTop: 2 }}>
                      {r.minXp.toLocaleString()}~
                    </div>
                  </div>
                  {isCurrent ? (
                    <span style={{
                      fontSize: '0.8667rem', fontWeight: 700, color: 'var(--brand)',
                      background: 'var(--brand-soft)', border: '1.5px solid var(--brand)',
                      borderRadius: 20, padding: '3px 10px', flexShrink: 0,
                    }}>
                      {t('rank.currentBadge')}
                    </span>
                  ) : isUnlocked ? (
                    <CheckIcon width={16} height={16} style={{ color: 'var(--success)', flexShrink: 0 }} />
                  ) : (
                    <LockIcon width={14} height={14} style={{ color: 'var(--text-faint)', flexShrink: 0 }} />
                  )}
                </button>
              </div>
            )
          })}
        </div>
      </div>

      {/* Tier Detail Bottom Sheet */}
      {selectedTier && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t('rank.detailDialogAria')}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
            zIndex: 200, display: 'flex', alignItems: 'flex-end',
            animation: 'fade-in-up 0.2s ease-out both',
          }}
        >
          <button
            type="button"
            aria-label={t('rank.closeAria')}
            onClick={() => setSelectedTier(null)}
            style={{ position: 'absolute', inset: 0, background: 'transparent', border: 'none', padding: 0, cursor: 'pointer' }}
          />
          <div
            style={{
              position: 'relative',
              background: 'var(--bg-card)',
              borderRadius: '24px 24px 0 0',
              padding: '24px 20px 36px',
              width: '100%', maxHeight: '80vh', overflow: 'auto',
              animation: 'fade-in-up 0.25s ease-out both',
            }}
          >
            {/* Drag handle */}
            <div style={{
              width: 36, height: 4, background: 'var(--border)',
              borderRadius: 99, margin: '0 auto 20px',
            }} />

            {/* Avatar + Title */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
              <div style={{
                borderRadius: 20, overflow: 'hidden', flexShrink: 0,
                boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
              }}>
                <RankIllustration level={selectedTier.level} size={80} />
              </div>
              <div>
                <div style={{
                  fontSize: '0.8667rem', fontWeight: 800, letterSpacing: '0.12em',
                  textTransform: 'uppercase', color: 'var(--brand)', marginBottom: 4,
                }}>
                  {t('rank.indicator', { current: String(selectedTier.level), total: String(RANK_TIERS.length) })}
                </div>
                <div style={{
                  fontFamily: "'Inter Tight', 'Inter', sans-serif",
                  fontSize: '1.8667rem', fontWeight: 900, color: 'var(--text)',
                  letterSpacing: '-0.02em',
                }}>
                  {isJa ? selectedTier.title : selectedTier.titleEn}
                </div>
                <div style={{ fontSize: '0.9333rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  {selectedTier.minXp.toLocaleString()}~
                </div>
              </div>
            </div>

            {/* Quote */}
            <div style={{
              background: 'linear-gradient(145deg, #0F1629, #1A2744)',
              borderRadius: 16, padding: '16px 18px', marginBottom: 16,
              position: 'relative', overflow: 'hidden',
            }}>
              <div style={{
                position: 'absolute', top: -20, right: -20, width: 100, height: 100,
                background: 'radial-gradient(circle, rgba(129,140,248,0.2) 0%, transparent 70%)',
                pointerEvents: 'none',
              }} />
              <div style={{
                fontSize: '0.8667rem', fontWeight: 700, letterSpacing: '0.12em',
                textTransform: 'uppercase', color: 'rgba(255,255,255,0.5)', marginBottom: 8,
              }}>
                {t('rank.quoteLabel')}
              </div>
              <div style={{
                fontSize: '1.2rem', fontStyle: 'italic', color: '#fff', lineHeight: 1.7,
              }}>
                {isJa ? selectedTier.quoteJa : selectedTier.quoteEn}
              </div>
            </div>

            {/* Description */}
            <div style={{
              fontSize: '1.0667rem', color: 'var(--text-secondary)', lineHeight: 1.8,
              marginBottom: 16,
            }}>
              {isJa ? selectedTier.descJa : selectedTier.descEn}
            </div>

            {/* Tip */}
            <div style={{
              background: 'var(--brand-soft)', borderRadius: 14, padding: '14px 16px',
            }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                fontSize: '0.8667rem', fontWeight: 700, color: 'var(--brand)',
                marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.08em',
              }}>
                <LightbulbIcon width={14} height={14} />
                <span>{t('rank.tipLabel')}</span>
              </div>
              <div style={{ fontSize: '1.0667rem', color: 'var(--brand-hover)', lineHeight: 1.7 }}>
                {isJa ? selectedTier.tipJa : selectedTier.tipEn}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
