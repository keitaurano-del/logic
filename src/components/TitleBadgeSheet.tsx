/**
 * TitleBadgeSheet — 称号の道のりモーダル
 *
 * プロフィール画面のバッチ・Lv・XP タップで開く。現在の称号、次の称号までの XP/Lv、
 * 全 50 称号一覧（基礎帯 16 + 拡張帯 34、未到達はグレースケール + 減光表示）を見せる。
 *
 * - グリップ／ヘッダー領域を下方向にドラッグするとボトムシートが指追従、
 *   閾値（高さの 1/4 または 96px）超で onClose、それ未満は spring back。
 * - グリッドは 4 列固定 + minmax(0, 1fr) で長い英語タイトルでも均等幅・横はみ出さず。
 */
import { useEffect, useRef, useState, type TouchEvent as ReactTouchEvent } from 'react'
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

const DISMISS_PX = 96 // この px 数を超えてドラッグしたら閉じる
const DISMISS_RATIO = 0.25 // または sheet 高さの 25% を超えたら閉じる（大きい方を採用）

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

  // ドラッグ dismiss 用
  const sheetRef = useRef<HTMLDivElement | null>(null)
  const dragStartYRef = useRef<number | null>(null)
  const sheetHeightRef = useRef<number>(0)
  const [dragY, setDragY] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [isClosing, setIsClosing] = useState(false)

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

  const handleTouchStart = (e: ReactTouchEvent<HTMLDivElement>) => {
    if (isClosing) return
    dragStartYRef.current = e.touches[0].clientY
    sheetHeightRef.current = sheetRef.current?.getBoundingClientRect().height ?? 0
    setIsDragging(true)
  }

  const handleTouchMove = (e: ReactTouchEvent<HTMLDivElement>) => {
    if (dragStartYRef.current == null) return
    const delta = e.touches[0].clientY - dragStartYRef.current
    // 上方向ドラッグは少しだけ追従（rubber band 風）、下方向は等倍
    const next = delta > 0 ? delta : delta * 0.25
    setDragY(next)
  }

  const handleTouchEnd = () => {
    if (dragStartYRef.current == null) return
    const threshold = Math.max(DISMISS_PX, sheetHeightRef.current * DISMISS_RATIO)
    const shouldClose = dragY > threshold
    dragStartYRef.current = null
    setIsDragging(false)
    if (shouldClose) {
      // 画面外まで滑らせてから onClose
      setIsClosing(true)
      const remaining = (sheetHeightRef.current || window.innerHeight) - dragY + 40
      setDragY(dragY + remaining)
      window.setTimeout(() => { onClose() }, 200)
    } else {
      setDragY(0)
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 1000,
        background: `rgba(8, 10, 24, ${Math.max(0.2, 0.72 - dragY / 600)})`,
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        transition: isDragging ? 'none' : 'background 220ms ease-out',
      }}
    >
      <div
        ref={sheetRef}
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
          transform: `translateY(${Math.max(0, dragY)}px)`,
          transition: isDragging
            ? 'none'
            : isClosing
              ? 'transform 200ms cubic-bezier(0.4, 0, 1, 1)'
              : 'transform 260ms cubic-bezier(0.32, 0.72, 0, 1)',
          touchAction: 'pan-y',
        }}
      >
        {/* Sticky header: グリップ + 見出し + 閉じるボタン。ここがドラッグ起点 */}
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onTouchCancel={handleTouchEnd}
          style={{
            position: 'relative',
            flexShrink: 0,
            padding: 'calc(env(safe-area-inset-top, 0px) + 8px) 18px 12px',
            background: 'var(--bg-primary)',
            borderBottom: '1px solid var(--border)',
            cursor: 'grab',
            touchAction: 'none',
          }}
        >
          {/* グリップ（タップ領域広めで affordance を明示） */}
          <div
            aria-hidden="true"
            style={{
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              height: 20, marginBottom: 6,
            }}
          >
            <div style={{ width: 44, height: 5, borderRadius: 99, background: 'var(--border)' }} />
          </div>

          <div style={{
            fontSize: 13, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase',
            color: 'var(--text-muted)', textAlign: 'center',
            paddingRight: 44, paddingLeft: 44,
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
          overflowX: 'hidden', // 子要素由来の横スクロール完全防止（保険）
          WebkitOverflowScrolling: 'touch',
          padding: '16px 14px calc(env(safe-area-inset-bottom, 0px) + 24px)',
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
          <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 6 }}>
            {t('profile.titleSheet.currentLabel')}
          </div>
          <div style={{ fontSize: 26, fontWeight: 900, color: lv.color, marginBottom: 4 }}>
            {t(getTitleI18nKey(currentKey))}
          </div>
          <div style={{ fontSize: 15, color: 'var(--text-secondary)' }}>
            Lv. {lv.level}{isMaxed ? ' · MAX' : ` / ${MAX_LEVEL}`}
          </div>
        </div>

        {/* 次称号までの道のり */}
        <div style={{
          background: 'var(--bg-card)',
          borderRadius: 16,
          padding: '16px 18px',
          marginBottom: 18,
          border: `1px solid var(--border)`,
        }}>
          {isMaxed ? (
            <div style={{ textAlign: 'center', fontSize: 16, fontWeight: 700, color: 'var(--brand)', padding: '6px 0' }}>
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
                <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>
                  {t('profile.titleSheet.nextLabel')}
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
                  {t(getTitleI18nKey(nextTier.key))}
                </div>
                <div style={{ fontSize: 15, color: 'var(--text-secondary)' }}>
                  {t('profile.titleSheet.toNext', { xp: String(xpToNext), lv: String(lvToNext) })}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* 全 50 称号グリッド — Lv 1-100 (基礎帯 16) と Lv 101-500 (拡張帯 34) で
            セクション区切り、各セクション 5 列で縦長になり過ぎないように調整 */}
        {(() => {
          const basicTiers = TITLE_TIERS.filter((tier) => tier.min <= 100)
          const advancedTiers = TITLE_TIERS.filter((tier) => tier.min > 100)
          return (
            <>
              <SectionHeading label={t('profile.titleSheet.section.basic')} />
              <TierGrid
                tiers={basicTiers}
                currentLevel={lv.level}
                currentKey={currentKey}
              />
              {advancedTiers.length > 0 && (
                <>
                  <SectionHeading
                    label={t('profile.titleSheet.section.advanced')}
                    marginTop={18}
                  />
                  <TierGrid
                    tiers={advancedTiers}
                    currentLevel={lv.level}
                    currentKey={currentKey}
                  />
                </>
              )}
            </>
          )
        })()}
        </div>
      </div>
    </div>
  )
}

function SectionHeading({ label, marginTop = 0 }: { label: string; marginTop?: number }) {
  return (
    <div
      style={{
        marginTop,
        marginBottom: 8,
        fontSize: 12,
        fontWeight: 800,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: 'var(--text-muted)',
      }}
    >
      {label}
    </div>
  )
}

function TierGrid({
  tiers,
  currentLevel,
  currentKey,
}: {
  tiers: ReadonlyArray<{ key: TitleKey; min: number; max: number }>
  currentLevel: number
  currentKey: TitleKey
}) {
  return (
    <div style={{
      display: 'grid',
      // 4 列固定。長い称号名でも各セルが均等幅になるよう minmax(0, 1fr) で minWidth: 0 を保証
      gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
      gap: 8,
      marginBottom: 8,
      width: '100%',
      boxSizing: 'border-box',
    }}>
      {tiers.map((tier) => (
        <TierCell
          key={tier.key}
          tierKey={tier.key}
          min={tier.min}
          max={tier.max}
          unlocked={currentLevel >= tier.min}
          isCurrent={tier.key === currentKey}
        />
      ))}
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
        padding: '10px 6px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        textAlign: 'center',
        opacity: unlocked ? 1 : 0.4,
        minWidth: 0, // grid item 自身も縮小可能にして固有内容で膨張しないようにする
        boxSizing: 'border-box',
        overflow: 'hidden',
      }}
    >
      <img
        src={getBadgeImagePath(tierKey)}
        alt={t(getTitleI18nKey(tierKey))}
        style={{
          width: 56, height: 56, objectFit: 'contain',
          marginBottom: 6,
          // locked はより強めにグレーアウト＋減光して未達状態が明確になるように
          filter: unlocked ? 'none' : 'grayscale(1) brightness(0.7) contrast(0.85)',
        }}
      />
      <div style={{
        fontSize: 11, fontWeight: 700,
        color: unlocked ? 'var(--text-primary)' : 'var(--text-muted)',
        lineHeight: 1.25,
        marginBottom: 2,
        width: '100%',
        // 長い英語タイトルでも cell からはみ出さないよう自然な改行を許可
        overflowWrap: 'anywhere',
        wordBreak: 'normal',
        hyphens: 'auto',
      }}>
        {t(getTitleI18nKey(tierKey))}
      </div>
      <div style={{
        fontSize: 10, fontWeight: 600,
        color: 'var(--text-muted)',
        whiteSpace: 'nowrap',
      }}>
        {t('profile.titleSheet.levelRange', { min: String(min), max: String(max) })}
      </div>
    </div>
  )
}
