/**
 * TitleBadgeSheet — 称号の道のりモーダル
 *
 * プロフィール画面のバッチ・Lv・XP タップで開く。現在の称号、次の称号までの XP/Lv、
 * 全 16 称号一覧（未到達はグレースケール + ロック表示）を見せる。
 */
import { useEffect } from 'react'
import {
  TITLE_TIERS,
  getTitleKeyForLevel,
  getTitleI18nKey,
  getBadgeImagePath,
  getCurrentLevel,
  MAX_LEVEL,
  MAX_XP,
  type TitleKey,
} from '../screens/homeHelpers'
import { t } from '../i18n'
import { XIcon } from '../icons'
import './levelup.css'

interface TitleBadgeSheetProps {
  xp: number
  onClose: () => void
}

export function TitleBadgeSheet({ xp, onClose }: TitleBadgeSheetProps) {
  const lv = getCurrentLevel(xp)
  const currentKey = getTitleKeyForLevel(lv.level)
  const currentIdx = TITLE_TIERS.findIndex((t) => t.key === currentKey)
  const nextTier = currentIdx >= 0 && currentIdx < TITLE_TIERS.length - 1
    ? TITLE_TIERS[currentIdx + 1]
    : null
  const xpToNext = nextTier ? Math.max(0, nextTier.min * 101 - Math.min(xp, MAX_XP)) : 0
  const lvToNext = nextTier ? Math.max(0, nextTier.min - lv.level) : 0
  const isMaxed = lv.level >= MAX_LEVEL

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [onClose])

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: 'rgba(8, 10, 24, 0.72)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 560,
          maxHeight: '92dvh',
          background: 'var(--bg-primary)',
          color: 'var(--text-primary)',
          borderRadius: '20px 20px 0 0',
          boxShadow: '0 -8px 32px rgba(0,0,0,0.4)',
          display: 'flex', flexDirection: 'column',
          fontFamily: "'Noto Sans JP', sans-serif",
          overflow: 'hidden',
        }}
      >
        {/* Sticky header: グリップ + 見出し + 閉じるボタン */}
        <div style={{
          position: 'relative',
          flexShrink: 0,
          padding: 'calc(env(safe-area-inset-top, 0px) + 10px) 18px 10px',
          background: 'var(--bg-primary)',
          borderBottom: '1px solid var(--border)',
        }}>
          {/* グリップ */}
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 10 }}>
            <div style={{ width: 36, height: 4, borderRadius: 99, background: 'var(--border)' }} />
          </div>

          <div style={{
            fontSize: 11, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase',
            color: 'var(--text-muted)', textAlign: 'center',
            paddingRight: 36, paddingLeft: 36,
          }}>
            {t('profile.titleSheet.heading')}
          </div>

          {/* 閉じるボタン（右上、44x44 タップエリア） */}
          <button
            type="button"
            aria-label={t('common.close')}
            onClick={onClose}
            style={{
              position: 'absolute',
              top: 'calc(env(safe-area-inset-top, 0px) + 6px)',
              right: 8,
              width: 44, height: 44,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'transparent',
              border: 'none',
              borderRadius: 12,
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              padding: 0,
            }}
          >
            <XIcon width={22} height={22} />
          </button>
        </div>

        {/* スクロール可能なコンテンツ */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          padding: '16px 18px calc(env(safe-area-inset-bottom, 0px) + 24px)',
        }}>

        {/* 現在称号 ヒーロー */}
        <div style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center',
          padding: '8px 16px 20px',
        }}>
          <div
            className="lvup-badge-glow"
            style={{
              width: 156, height: 156,
              background: `radial-gradient(circle, ${lv.color}22 0%, transparent 70%)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: 12,
            }}
          >
            <img
              src={getBadgeImagePath(currentKey)}
              alt={t(getTitleI18nKey(currentKey))}
              style={{ width: 140, height: 140, objectFit: 'contain', filter: `drop-shadow(0 4px 16px ${lv.color}66)` }}
            />
          </div>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>
            {t('profile.titleSheet.currentLabel')}
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, color: lv.color, marginBottom: 2 }}>
            {t(getTitleI18nKey(currentKey))}
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
            Lv. {lv.level}{isMaxed ? ' · MAX' : ` / ${MAX_LEVEL}`}
          </div>
        </div>

        {/* 次称号までの道のり */}
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: 16,
          padding: '14px 16px',
          marginBottom: 18,
          border: `1px solid var(--border)`,
        }}>
          {isMaxed ? (
            <div style={{ textAlign: 'center', fontSize: 14, fontWeight: 700, color: 'var(--brand)', padding: '6px 0' }}>
              ★ {t('profile.titleSheet.maxed')}
            </div>
          ) : nextTier ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <img
                src={getBadgeImagePath(nextTier.key)}
                alt={t(getTitleI18nKey(nextTier.key))}
                style={{ width: 56, height: 56, objectFit: 'contain', opacity: 0.55, filter: 'grayscale(0.6)' }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 3 }}>
                  {t('profile.titleSheet.nextLabel')}
                </div>
                <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 3 }}>
                  {t(getTitleI18nKey(nextTier.key))}
                </div>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                  {t('profile.titleSheet.toNext', { xp: String(xpToNext), lv: String(lvToNext) })}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* 全 16 称号グリッド */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 10,
          marginBottom: 8,
        }}>
          {TITLE_TIERS.map((tier) => {
            const unlocked = lv.level >= tier.min
            const isCurrent = tier.key === currentKey
            return (
              <TierCell
                key={tier.key}
                tierKey={tier.key}
                min={tier.min}
                max={tier.max}
                unlocked={unlocked}
                isCurrent={isCurrent}
              />
            )
          })}
        </div>
        </div>
      </div>
    </div>
  )
}

function TierCell({ tierKey, min, max, unlocked, isCurrent }: {
  tierKey: TitleKey
  min: number
  max: number
  unlocked: boolean
  isCurrent: boolean
}) {
  return (
    <div
      style={{
        background: isCurrent ? 'color-mix(in srgb, var(--brand) 12%, var(--bg-card))' : 'var(--bg-card)',
        border: `1.5px solid ${isCurrent ? 'var(--brand)' : 'var(--border)'}`,
        borderRadius: 12,
        padding: '10px 6px 8px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        textAlign: 'center',
        opacity: unlocked ? 1 : 0.55,
      }}
    >
      <img
        src={getBadgeImagePath(tierKey)}
        alt={t(getTitleI18nKey(tierKey))}
        style={{
          width: 64, height: 64, objectFit: 'contain',
          marginBottom: 6,
          filter: unlocked ? 'none' : 'grayscale(0.85) brightness(0.85)',
        }}
      />
      <div style={{
        fontSize: 11, fontWeight: 700,
        color: unlocked ? 'var(--text-primary)' : 'var(--text-muted)',
        lineHeight: 1.25,
        marginBottom: 2,
        wordBreak: 'keep-all',
      }}>
        {t(getTitleI18nKey(tierKey))}
      </div>
      <div style={{
        fontSize: 10, fontWeight: 600,
        color: 'var(--text-muted)',
      }}>
        {t('profile.titleSheet.levelRange', { min: String(min), max: String(max) })}
      </div>
    </div>
  )
}
