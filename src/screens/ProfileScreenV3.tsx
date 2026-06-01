/**
 * ProfileScreenV3 - Logic v3 redesign
 * 仕様: docs/DESIGN_V3.md §3.6
 */
import { useState } from 'react'
import { getCompletedCount, getLessonStreak, getXp, getCompletedLessons, getXpLogThisMonth, XP_EVENT_LABEL, XP_REWARDS, localDateStr } from '../stats'
import { getCompletionCount } from '../db/completionCountDb'
import { getAllLessonsFlat } from '../lessonData'
import { getCurrentLevel, getXpProgress, getTitleKeyForLevel, getTitleI18nKey, getBadgeImagePath, MAX_LEVEL } from './homeHelpers'
import { resolveAssetUrl } from '../lessonAssets'
import { TitleBadgeSheet } from '../components/TitleBadgeSheet'
import { logout } from '../supabase'
import { getSubscriptionState } from '../subscription'
import { getStudyDates as _getStudyDatesArr } from '../stats'
import LessonIcon from '../LessonIcon'
import { StarIcon } from '../icons'
import { t, getLocale, localizedHtmlPath } from '../i18n'
import { getMode } from '../theme'
import { FONT_SCALES, loadFontScale } from '../fontScale'
import { TrialBadge, TrialEndingBanner } from '../components/TrialStatus'
import { shouldShowTrial, shouldShowTrialEndingBanner } from '../trialStatus'
import '../components/levelup.css'

function getFontSizeLabel(): string {
  const id = loadFontScale()
  return FONT_SCALES.find((f) => f.id === id)?.name ?? FONT_SCALES[0].name
}

function getPlanLabel(): string {
  const state = getSubscriptionState()
  if (state.plan === 'paid_yearly') return t('profile.planPaidYearly')
  if (state.plan === 'paid_monthly') return t('profile.planPaidMonthly')
  return t('profile.planFree')
}

interface ProfileScreenV3Props {
  userName: string
  onOpenAccount: () => void
  onOpenProfileEdit?: () => void
  onOpenNotifications: () => void
  onOpenAppearance: () => void
  onOpenFontSize?: () => void
  onOpenFeedback?: () => void
  onOpenPricing?: () => void
  onOpenPlacementTest?: () => void
  onOpenLesson?: (lessonId: number) => void
  onOpenLanguage?: () => void
  onOpenStudyTime?: () => void
  isLoggedIn?: boolean
}

type Sheet = null | 'streak' | 'lessons' | 'xp'

export function ProfileScreenV3(props: ProfileScreenV3Props) {
  const { userName, onOpenAccount, onOpenProfileEdit, onOpenNotifications, onOpenAppearance, onOpenFontSize, onOpenFeedback, onOpenPricing, onOpenPlacementTest, onOpenLesson, onOpenLanguage, onOpenStudyTime, isLoggedIn = false } = props
  const showTrialBadge = shouldShowTrial(isLoggedIn)
  const showTrialBanner = shouldShowTrialEndingBanner(isLoggedIn)
  const [sheet, setSheet] = useState<Sheet>(null)
  const [titleSheetOpen, setTitleSheetOpen] = useState(false)
  const streak = getLessonStreak()
  const completed = getCompletedCount()
  const xp = getXp()
  const lv = getCurrentLevel(xp)
  const { pct: levelPct, current: levelXp, needed } = getXpProgress(xp)
  const currentTitleKey = getTitleKeyForLevel(lv.level)

  const handleLogout = async () => {
    await logout()
    window.location.reload()
  }

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Noto Sans JP', sans-serif", color: 'var(--text-primary)' }}>
      {/* Hero */}
      <div style={{ background: 'var(--hero-grad-dark)', padding: 'calc(env(safe-area-inset-top, 44px) + 14px) 20px 56px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -50, top: -50, width: 200, height: 200, borderRadius: '50%', background: 'rgba(108,142,245,0.10)', filter: 'blur(40px)', pointerEvents: 'none' }}></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18, position: 'relative', zIndex: 1 }}>
          <button
            type="button"
            aria-label={t('profile.titleSheet.heading')}
            onClick={() => setTitleSheetOpen(true)}
            className="lvup-badge-glow"
            style={{
              width: 72, height: 72,
              padding: 0,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <img
              src={resolveAssetUrl(getBadgeImagePath(currentTitleKey))}
              alt={t(getTitleI18nKey(currentTitleKey))}
              style={{ width: 68, height: 68, objectFit: 'contain', filter: `drop-shadow(0 3px 10px ${lv.color}80)` }}
            />
          </button>
          <div style={{ flex: 1 }}>
            <div className="profile-hero-name" style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: '1.4667rem', fontWeight: 900, letterSpacing: '-.02em', marginBottom: 2, color: 'var(--text-on-hero)' }}>{userName}</div>
            <button
              type="button"
              onClick={() => setTitleSheetOpen(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap',
                background: 'none', border: 'none', padding: 0, cursor: 'pointer',
                fontFamily: 'inherit', textAlign: 'left',
              }}
            >
              <span style={{ fontSize: '0.9333rem', color: lv.color, fontWeight: 700, letterSpacing: '.01em' }}>
                {t(getTitleI18nKey(currentTitleKey))}
              </span>
              {lv.level === MAX_LEVEL && (
                <span aria-hidden="true" style={{ fontSize: '0.8667rem' }}>★</span>
              )}
            </button>
          </div>
        </div>
        <button
          type="button"
          aria-label={t('profile.titleSheet.heading')}
          onClick={() => setTitleSheetOpen(true)}
          style={{
            display: 'block', width: '100%',
            padding: 0, border: 'none', background: 'transparent', cursor: 'pointer',
            fontFamily: 'inherit', textAlign: 'left',
            position: 'relative', zIndex: 1,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginBottom: 8 }}>
            <span style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: '1.2rem', fontWeight: 900, letterSpacing: '-.02em', color: 'var(--text-on-hero)' }}>Lv.{lv.level}</span>
          </div>
          <div style={{ height: 12, background: 'var(--border-on-dark)', borderRadius: 99, overflow: 'hidden', marginBottom: 8 }}>
            <div style={{ height: '100%', width: `${levelPct}%`, background: lv.color, borderRadius: 99, boxShadow: `0 0 12px ${lv.color}88` }}></div>
          </div>
          <div style={{ fontSize: '0.9333rem', color: 'var(--text-secondary)', fontWeight: 500, textAlign: 'right' }}>
            {lv.level === MAX_LEVEL
              ? t('profile.maxLevelReached')
              : t('profile.toNextLevel', { xp: String(Math.max(0, needed - levelXp)) })}
          </div>
        </button>
      </div>

      {/* Stats grid — タップで詳細シート */}
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginTop: -28, position: 'relative', zIndex: 2, padding: '0 20px' }}>
        <StatCard val={String(streak)} label={t('profile.statStreakDays')} highlight={streak > 0} onClick={() => setSheet('streak')} />
        <StatCard val={String(completed)} label={t('profile.statCompleted')} onClick={() => setSheet('lessons')} />
        <StatCard val={xp.toLocaleString()} label={t('profile.totalXp')} onClick={() => setTitleSheetOpen(true)} />
      </div>

      {titleSheetOpen && <TitleBadgeSheet xp={xp} onClose={() => setTitleSheetOpen(false)} />}

      <div style={{ flex: 1, padding: '16px 16px 100px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* 今週の学習サマリー — タップで StudyTimeScreen */}
        {(() => {
          const week = getStudiedThisWeek()
          const studiedCount = week.filter(Boolean).length
          const todayDow = (new Date().getDay() + 6) % 7
          return (
            <button
              type="button"
              onClick={onOpenStudyTime}
              disabled={!onOpenStudyTime}
              aria-label={onOpenStudyTime ? t('profile.openStudyTime') : undefined}
              style={{
                background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', padding: 18,
                boxShadow: 'var(--shadow-v3-card-inset)', border: '1px solid rgba(255,255,255,.06)',
                width: '100%', textAlign: 'left', cursor: onOpenStudyTime ? 'pointer' : 'default',
                color: 'inherit', font: 'inherit',
              }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div style={{ fontSize: '0.9333rem', color: 'var(--text-primary)', fontWeight: 700 }}>{t('profile.weekSummary')}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.8667rem', fontWeight: 800, color: studiedCount > 0 ? 'var(--streak-flame)' : 'var(--text-muted)' }}>
                  <FlameIcon size={16} dim={studiedCount === 0} />
                  <span>{t('profile.studiedDaysThisWeek', { n: String(studiedCount) })}</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {[t('profile.dayMon'), t('profile.dayTue'), t('profile.dayWed'), t('profile.dayThu'), t('profile.dayFri'), t('profile.daySat'), t('profile.daySun')].map((d, i) => {
                  const studied = week[i]
                  const isToday = i === todayDow
                  return (
                    <div key={d} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                      <div style={{
                        width: '100%',
                        aspectRatio: '1 / 1',
                        borderRadius: '50%',
                        background: studied ? 'linear-gradient(160deg, rgba(255,140,0,.18) 0%, rgba(255,61,0,.10) 100%)' : 'var(--bg-tertiary)',
                        border: isToday ? `1.5px solid ${'var(--brand)'}` : '1px solid rgba(255,255,255,.04)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        {studied ? (
                          <FlameIcon size={26} />
                        ) : (
                          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-muted)', opacity: .5 }} />
                        )}
                      </div>
                      <span style={{ fontSize: '0.8rem', color: studied ? 'var(--text-primary)' : 'var(--text-muted)', fontWeight: studied ? 700 : 500 }}>{d}</span>
                    </div>
                  )
                })}
              </div>
              {onOpenStudyTime && (
                <div style={{
                  marginTop: 14,
                  paddingTop: 12,
                  borderTop: '1px solid rgba(255,255,255,.06)',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  gap: 6,
                }}>
                  <span style={{ fontSize: '0.8667rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    {t('profile.weekSummarySub')}
                  </span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={'var(--text-muted)'} strokeWidth="2.5" aria-hidden="true"><polyline points="9 18 15 12 9 6" /></svg>
                </div>
              )}
            </button>
          )
        })()}

        {/* 実力診断テスト */}
        {onOpenPlacementTest && (
          <button type="button" onClick={onOpenPlacementTest}
            aria-label={t('profile.assessmentAria')}
            style={{
              background: `linear-gradient(135deg, ${'var(--accent-soft)'} 0%, rgba(108,142,245,.1) 100%)`,
              border: `1px solid color-mix(in srgb, var(--brand) 25%, transparent)`,
              borderRadius: 'var(--radius-lg)', padding: '16px 18px',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14,
              color: 'inherit', font: 'inherit', textAlign: 'left', width: '100%',
            }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--accent-fg)' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.9333rem', fontWeight: 700, color: 'var(--text-primary)' }}>{t('profile.assessmentTitle')}</div>
              <div style={{ fontSize: '0.8667rem', color: 'var(--text-secondary)', marginTop: 2 }}>{t('profile.assessmentDesc')}</div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={'var(--text-muted)'} strokeWidth="2.5" aria-hidden="true"><polyline points="9 18 15 12 9 6" /></svg>
          </button>
        )}

        {/* DF-F11: トライアル終了間際バナー（残り2日以下） */}
        {showTrialBanner && <TrialEndingBanner onUpgrade={onOpenPricing} />}

        {/* 設定 */}
        <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-v3-card-inset)' }}>
          {onOpenProfileEdit && (
            <SettingRow icon="edit" name={t('profile.editProfile')} sub={t('profile.editProfileSub')} onClick={onOpenProfileEdit} />
          )}
          <SettingRow icon="user" name={t('profile.account')} sub={userName || t('home.guestName')} onClick={onOpenAccount} />
          <SettingRow icon="bell" name={t('profile.notifications')} sub="" onClick={onOpenNotifications} />
          <SettingRow icon="globe" name={t('profile.languageTitle')} sub={getLocale() === 'ja' ? t('profile.languageJa') : t('profile.languageEn')} onClick={onOpenLanguage} />
          <SettingRow icon="palette" name={t('profile.theme')} sub={getMode() === 'light' ? t('profile.themeLight') : t('profile.themeDark')} onClick={onOpenAppearance} />
          <SettingRow icon="fontSize" name={t('profile.fontSize')} sub={getFontSizeLabel()} onClick={onOpenFontSize} />
          <SettingRow icon="card" name={t('profile.plan')} sub={getPlanLabel()} onClick={onOpenPricing} extra={showTrialBadge ? <TrialBadge /> : undefined} />
          <SettingRow icon="message" name={t('profile.feedbackName')} sub={t('profile.feedbackSub')} onClick={onOpenFeedback} />
          <SettingRow icon="doc" name={t('profile.terms')} sub="" onClick={() => window.open(localizedHtmlPath('terms'), '_blank')} />
          <SettingRow icon="shield" name={t('profile.privacy')} sub="" onClick={() => window.open(localizedHtmlPath('privacy'), '_blank')} />
          {getLocale() === 'ja' && (
            <SettingRow icon="scale" name={t('profile.tokushoho')} sub="" onClick={() => window.open(localizedHtmlPath('tokushoho'), '_blank')} />
          )}
        </div>
        <button type="button" onClick={handleLogout}
          style={{ background: 'transparent', border: '1px solid rgba(252,165,165,.4)', borderRadius: 14, padding: 13, textAlign: 'center', fontSize: '0.9333rem', fontWeight: 700, color: 'var(--md-sys-color-error)', cursor: 'pointer', font: 'inherit', width: '100%', minHeight: 44 }}>
          {t('profile.logout')}
        </button>
      </div>

      {/* ボトムシート */}
      {sheet && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={t('profile.menu')}
          style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'flex-end' }}
        >
          <button
            type="button"
            aria-label={t('profile.closeSheet')}
            onClick={() => setSheet(null)}
            style={{ position: 'absolute', inset: 0, background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
          />
          <div
            style={{ position: 'relative', background: 'var(--bg-card)', borderRadius: '20px 20px 0 0', width: '100%', maxHeight: '70vh', overflowY: 'auto', padding: '20px 20px 40px' }}
          >
            {/* ドラッグバー */}
            <div style={{ width: 40, height: 4, background: 'var(--bg-tertiary)', borderRadius: 2, margin: '0 auto 20px' }} />

            {sheet === 'streak' && <StreakSheet streak={streak} />}
            {sheet === 'lessons' && <LessonsSheet onOpenLesson={(id) => { setSheet(null); onOpenLesson?.(id) }} />}
            {sheet === 'xp' && <XpSheet totalXp={xp} />}

            <button onClick={() => setSheet(null)} style={{ marginTop: 20, width: '100%', background: 'var(--bg-tertiary)', border: 'none', borderRadius: 12, padding: '13px', fontSize: '0.9333rem', fontWeight: 700, color: 'var(--text-secondary)', cursor: 'pointer' }}>{t('profile.close')}</button>
          </div>
        </div>
      )}
    </div>
  )
}

// ── 連続学習日数シート ──
function StreakSheet({ streak }: { streak: number }) {
  return (
    <>
      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 16 }}>{t('profile.streakDaysHeading')}</div>
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <div style={{ fontSize: '4.8rem', fontWeight: 900, color: 'var(--brand)', letterSpacing: '-0.04em', lineHeight: 1 }}>{streak}</div>
        <div style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginTop: 8, fontWeight: 600 }}>{t('profile.streakDaysUnit')}</div>
      </div>
      <div style={{ background: 'var(--bg-primary)', borderRadius: 14, padding: '14px 16px' }}>
        <div style={{ fontSize: '0.8667rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
          {t('profile.streakNote1')}<br />
          {t('profile.streakNote2')}
        </div>
      </div>
    </>
  )
}

// ── 完了レッスンシート ──
function LessonsSheet({ onOpenLesson }: { onOpenLesson: (id: number) => void }) {
  const allFlat = getAllLessonsFlat()
  const completedKeys = getCompletedLessons()
  const completedLessons = Object.values(allFlat).filter(l => completedKeys.includes(`lesson-${l.id}`))

  return (
    <>
      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 16 }}>{t('profile.completedLessonsTitle', { n: String(completedLessons.length) })}</div>
      {completedLessons.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '32px 0', fontSize: '0.9333rem' }}>{t('profile.noLessonsYet')}</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {completedLessons.map(l => {
            const isRepeated = getCompletionCount(`lesson-${l.id}`) >= 2
            return (
            <button
              type="button"
              key={l.id}
              onClick={() => onOpenLesson(l.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'var(--bg-primary)', borderRadius: 12, cursor: 'pointer', border: 'none', textAlign: 'left', width: '100%', font: 'inherit', color: 'inherit' }}
            >
              <div className={isRepeated ? 'pf-lesson-tile pf-lesson-tile--repeated' : 'pf-lesson-tile'} style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <LessonIcon id={l.id} action="lesson" size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.9333rem', fontWeight: 700, color: 'var(--text-primary)' }}>{l.title}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 2 }}>{l.category || ''}</div>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={'var(--text-muted)'} strokeWidth="2.5" aria-hidden="true"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
            )
          })}
        </div>
      )}
    </>
  )
}

// ── 総XP月別内訳シート ──
function XpSheet({ totalXp }: { totalXp: number }) {
  const log = getXpLogThisMonth()
  const grouped: Record<string, number> = {}
  log.forEach(e => {
    const label = XP_EVENT_LABEL[e.event] || e.event
    grouped[label] = (grouped[label] || 0) + e.xp
  })
  const entries = Object.entries(grouped).sort((a, b) => b[1] - a[1])
  const thisMonthTotal = log.reduce((s, e) => s + e.xp, 0)
  const now = new Date()
  const monthLabel = t('profile.monthLabel', { n: String(now.getMonth() + 1) })

  return (
    <>
      <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
        <StarIcon width={20} height={20} aria-hidden="true" />
        <span>{t('profile.totalXp')}</span>
      </div>
      <div style={{ fontSize: '0.8667rem', color: 'var(--text-secondary)', marginBottom: 16 }}>{t('profile.monthBreakdown', { month: monthLabel })}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.4rem', fontWeight: 900, color: 'var(--brand)' }}>{totalXp.toLocaleString()}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t('profile.cumulativeXp')}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.4rem', fontWeight: 900, color: 'var(--brand-light)' }}>+{thisMonthTotal}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{t('profile.thisMonthEarned')}</div>
        </div>
      </div>
      {entries.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '16px 0', fontSize: '0.9333rem' }}>{t('profile.noXpThisMonth')}</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {entries.map(([label, xp]) => {
            const pct = thisMonthTotal > 0 ? Math.round(xp / thisMonthTotal * 100) : 0
            return (
              <div key={label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: '0.8667rem', color: 'var(--text-primary)', fontWeight: 600 }}>{label}</span>
                  <span style={{ fontSize: '0.8667rem', color: 'var(--brand)', fontWeight: 700 }}>+{xp} XP</span>
                </div>
                <div style={{ height: 6, background: 'var(--bg-tertiary)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: 'var(--brand)', borderRadius: 4 }} />
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* XP獲得ルール一覧 */}
      <div style={{ marginTop: 24, padding: '14px 16px', background: 'var(--bg-primary)', borderRadius: 14 }}>
        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '.08em', textTransform: 'uppercase', marginBottom: 10 }}>
          {t('profile.xpRulesHeading')}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {(Object.keys(XP_REWARDS) as Array<keyof typeof XP_REWARDS>).map((event) => (
            <div key={event} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8667rem' }}>
              <span style={{ color: 'var(--text-primary)' }}>{XP_EVENT_LABEL[event] || event}</span>
              <span style={{ color: 'var(--brand)', fontWeight: 700 }}>+{XP_REWARDS[event]} XP</span>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}

function getStudiedThisWeek(): boolean[] {
  const studyDates = new Set(_getStudyDatesArr())
  const today = new Date()
  const todayDow = (today.getDay() + 6) % 7
  const monday = new Date(today)
  monday.setDate(today.getDate() - todayDow)
  return Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    // ローカル日付（YYYY-MM-DD）で比較。toISOString は UTC 基準で JST 朝にズレるため使わない。
    const iso = localDateStr(d)
    return studyDates.has(iso)
  })
}

function StatCard({ val, label, onClick, highlight }: { val: string; label: string; onClick: () => void; highlight?: boolean }) {
  return (
    <button
      type="button"
      className="stat"
      onClick={onClick}
      style={{ background: 'var(--bg-card)', borderRadius: 16, padding: '14px 8px', textAlign: 'center', boxShadow: '0 6px 20px rgba(0,0,0,.32), inset 0 1px 0 rgba(255,255,255,.05)', cursor: 'pointer', position: 'relative', border: '1px solid rgba(255,255,255,.06)', font: 'inherit', color: 'inherit', width: '100%' }}
    >
      <div style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: '1.4667rem', fontWeight: 900, color: 'var(--brand)', letterSpacing: '-.03em', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
        {highlight && <FlameIcon size={18} />}
        {val}
      </div>
      <div style={{ fontSize: '0.7333rem', fontWeight: 600, color: 'var(--text-secondary)', marginTop: 5 }}>{label}</div>
      <div style={{ position: 'absolute', bottom: 6, right: 8, fontSize: '0.6667rem', color: 'var(--text-muted)' }}>›</div>
    </button>
  )
}

function FlameIcon({ size = 20, dim = false }: { size?: number; dim?: boolean }) {
  // Keita明示指示の例外: 絵文字🔥固定。SVGへ消し戻し禁止(UI-9)
  // size(px)→font-size、dim→opacity で再現。aria-hidden で TTS 対象外。
  return (
    <span
      aria-hidden="true"
      style={{
        display: 'inline-block',
        fontSize: size,
        lineHeight: 1,
        opacity: dim ? 0.35 : 1,
      }}
    >
      🔥
    </span>
  )
}

function SettingRow({ icon, name, sub, onClick, extra }: { icon: string; name: string; sub: string; onClick?: () => void; extra?: React.ReactNode }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const iconSvg: Record<string, any> = {
    user: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={'var(--brand)'} strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
    bell: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={'var(--brand)'} strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>,
    card: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={'var(--brand)'} strokeWidth="2" strokeLinecap="round" aria-hidden="true"><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>,
    message: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={'var(--brand)'} strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>,
    doc: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={'var(--brand)'} strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
    shield: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={'var(--brand)'} strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    scale: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={'var(--brand)'} strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>,
    globe: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={'var(--brand)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>,
    palette: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={'var(--brand)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="13.5" cy="6.5" r="1"/><circle cx="17.5" cy="10.5" r="1"/><circle cx="8.5" cy="7.5" r="1"/><circle cx="6.5" cy="12.5" r="1"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z"/></svg>,
    fontSize: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={'var(--brand)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="4 7 4 4 16 4 16 7"/><line x1="10" y1="4" x2="10" y2="20"/><line x1="7" y1="20" x2="13" y2="20"/><polyline points="16 13 16 11 22 11 22 13"/><line x1="19" y1="11" x2="19" y2="20"/><line x1="17" y1="20" x2="21" y2="20"/></svg>,
    edit: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={'var(--brand)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>,
  }

  return (
    <button type="button" onClick={onClick}
      aria-label={sub ? `${name}: ${sub}` : name}
      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', cursor: 'pointer', borderBottom: `1px solid ${'var(--border)'}`, background: 'transparent', border: 'none', borderTop: 'none', borderLeft: 'none', borderRight: 'none', color: 'inherit', font: 'inherit', textAlign: 'left', width: '100%', minHeight: 44 }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{iconSvg[icon]}</div>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 2 }}>
          <span style={{ fontSize: '0.9333rem', fontWeight: 700, color: 'var(--text-primary)' }}>{name}</span>
          {extra}
        </div>
        {sub && <div style={{ fontSize: '0.8667rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{sub}</div>}
      </div>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={'var(--text-muted)'} strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><polyline points="9 18 15 12 9 6" /></svg>
    </button>
  )
}
