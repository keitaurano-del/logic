/**
 * ProfileScreenV3 - Logic v3 redesign
 * 仕様: docs/DESIGN_V3.md §3.6
 */
import { useEffect, useState, useId } from 'react'
import { getCompletedCount, getLessonStreak, getXp, getCompletedLessons, getXpLogThisMonth, XP_EVENT_LABEL } from '../stats'
import { getAllLessonsFlat } from '../lessonData'
import { getCurrentLevel, getXpProgress } from './homeHelpers'
import { logout } from '../supabase'
import { getSubscriptionState } from '../subscription'
import { getStudyDates as _getStudyDatesArr } from '../stats'
import LessonIcon from '../LessonIcon'
import { StarIcon } from '../icons'
import { t, getLocale, localizedHtmlPath } from '../i18n'

function getPlanLabel(): string {
  const state = getSubscriptionState()
  if (state.plan === 'paid_yearly') return t('profile.planPaidYearly')
  if (state.plan === 'paid_monthly') return t('profile.planPaidMonthly')
  return t('profile.planFree')
}

interface ProfileScreenV3Props {
  userName: string
  assistantName?: string
  onUpdateAssistantName?: (name: string) => Promise<void>
  onOpenSettings: (section?: 'account' | 'notifications' | 'plan') => void
  onOpenFeedback?: () => void
  onOpenPricing?: () => void
  onOpenPlacementTest?: () => void
  onOpenLesson?: (lessonId: number) => void
  onOpenLanguage?: () => void
}

type Sheet = null | 'streak' | 'lessons' | 'xp'

export function ProfileScreenV3(props: ProfileScreenV3Props) {
  const { userName, assistantName, onUpdateAssistantName, onOpenSettings, onOpenFeedback, onOpenPricing, onOpenPlacementTest, onOpenLesson, onOpenLanguage } = props
  const [sheet, setSheet] = useState<Sheet>(null)
  const streak = getLessonStreak()
  const completed = getCompletedCount()
  const xp = getXp()
  const lv = getCurrentLevel(xp)
  const { pct: levelPct, current: levelXp, needed } = getXpProgress(xp)

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
          <div className="profile-avatar" style={{ width: 64, height: 64, borderRadius: '50%', background: `linear-gradient(135deg, var(--brand), var(--brand-light))`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter Tight', sans-serif", fontSize: 26, fontWeight: 900, color: 'var(--text-on-hero)', boxShadow: `0 0 24px rgba(108,142,245,0.4)` }}>
            {(userName || 'G').slice(0, 1).toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <div className="profile-hero-name" style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: 22, fontWeight: 900, letterSpacing: '-.02em', marginBottom: 2, color: 'var(--text-on-hero)' }}>{userName}</div>
            <div style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 500 }}>{t('profile.userTraineeRole')}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, position: 'relative', zIndex: 1 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '.12em', textTransform: 'uppercase' }}>{t('profile.level')}</span>
          <span style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: 18, fontWeight: 900, letterSpacing: '-.02em', color: 'var(--text-on-hero)' }}>Lv.{lv.level}</span>
        </div>
        <div style={{ height: 12, background: 'rgba(255,255,255,.1)', borderRadius: 99, overflow: 'hidden', marginBottom: 8, position: 'relative', zIndex: 1 }}>
          <div style={{ height: '100%', width: `${levelPct}%`, background: 'var(--brand)', borderRadius: 99, boxShadow: '0 0 12px rgba(108,142,245,0.5)' }}></div>
        </div>
        <div style={{ fontSize: 14, color: 'var(--text-secondary)', fontWeight: 500, textAlign: 'right', position: 'relative', zIndex: 1 }}>{t('profile.toNextLevel', { xp: String(Math.max(0, needed - levelXp)) })}</div>
      </div>

      {/* Stats grid — タップで詳細シート */}
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginTop: -28, position: 'relative', zIndex: 2, padding: '0 20px' }}>
        <StatCard val={String(streak)} label={t('profile.statStreakDays')} highlight={streak > 0} onClick={() => setSheet('streak')} />
        <StatCard val={String(completed)} label={t('profile.statCompleted')} onClick={() => setSheet('lessons')} />
        <StatCard val={xp.toLocaleString()} label={t('profile.totalXp')} onClick={() => setSheet('xp')} />
      </div>

      <div style={{ flex: 1, padding: '16px 16px 100px', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* 今週の学習サマリー */}
        {(() => {
          const week = getStudiedThisWeek()
          const studiedCount = week.filter(Boolean).length
          const todayDow = (new Date().getDay() + 6) % 7
          return (
            <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', padding: 18, boxShadow: 'var(--shadow-v3-card-inset)', border: '1px solid rgba(255,255,255,.06)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div style={{ fontSize: 14, color: 'var(--text-primary)', fontWeight: 700 }}>{t('profile.weekSummary')}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 800, color: studiedCount > 0 ? 'var(--streak-flame)' : 'var(--text-muted)' }}>
                  <FlameIcon size={16} dim={studiedCount === 0} />
                  <span>{t('profile.studiedDaysOf7', { n: String(studiedCount) })}</span>
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
                        borderRadius: 12,
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
                      <span style={{ fontSize: 12, color: studied ? 'var(--text-on-hero)' : 'var(--text-muted)', fontWeight: studied ? 700 : 500 }}>{d}</span>
                    </div>
                  )
                })}
              </div>
            </div>
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
              <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{t('profile.assessmentTitle')}</div>
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>{t('profile.assessmentDesc')}</div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={'var(--text-muted)'} strokeWidth="2.5" aria-hidden="true"><polyline points="9 18 15 12 9 6" /></svg>
          </button>
        )}

        {/* アシスタント設定 */}
        {assistantName !== undefined && onUpdateAssistantName && (
          <AssistantNameCard
            currentName={assistantName}
            onUpdate={onUpdateAssistantName}
          />
        )}

        {/* 設定 */}
        <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-lg)', overflow: 'hidden', boxShadow: 'var(--shadow-v3-card-inset)' }}>
          <SettingRow icon="user" name={t('profile.account')} sub={userName || t('home.guestName')} onClick={() => onOpenSettings('account')} />
          <SettingRow icon="bell" name={t('profile.notifications')} sub="" onClick={() => onOpenSettings('notifications')} />
          <SettingRow icon="globe" name={t('profile.languageTitle')} sub={getLocale() === 'ja' ? t('profile.languageJa') : t('profile.languageEn')} onClick={onOpenLanguage} />
          <SettingRow icon="card" name={t('profile.plan')} sub={getPlanLabel()} onClick={onOpenPricing} />
          <SettingRow icon="message" name={t('profile.feedbackName')} sub={t('profile.feedbackSub')} onClick={onOpenFeedback} />
          <SettingRow icon="doc" name={t('profile.terms')} sub="" onClick={() => window.open(localizedHtmlPath('terms'), '_blank')} />
          <SettingRow icon="shield" name={t('profile.privacy')} sub="" onClick={() => window.open(localizedHtmlPath('privacy'), '_blank')} />
          <SettingRow icon="scale" name={t('profile.tokushoho')} sub="" onClick={() => window.open(localizedHtmlPath('tokushoho'), '_blank')} />
        </div>
        <button type="button" onClick={handleLogout}
          style={{ background: 'transparent', border: '1px solid rgba(252,165,165,.4)', borderRadius: 14, padding: 13, textAlign: 'center', fontSize: 14, fontWeight: 700, color: 'var(--md-sys-color-error)', cursor: 'pointer', font: 'inherit', width: '100%', minHeight: 44 }}>
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

            <button onClick={() => setSheet(null)} style={{ marginTop: 20, width: '100%', background: 'var(--bg-tertiary)', border: 'none', borderRadius: 12, padding: '13px', fontSize: 14, fontWeight: 700, color: 'var(--text-secondary)', cursor: 'pointer' }}>{t('profile.close')}</button>
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
      <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 16 }}>{t('profile.streakDaysHeading')}</div>
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <div style={{ fontSize: 72, fontWeight: 900, color: 'var(--brand)', letterSpacing: '-0.04em', lineHeight: 1 }}>{streak}</div>
        <div style={{ fontSize: 18, color: 'var(--text-secondary)', marginTop: 8, fontWeight: 600 }}>{t('profile.streakDaysUnit')}</div>
      </div>
      <div style={{ background: 'var(--bg-primary)', borderRadius: 14, padding: '14px 16px' }}>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
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
      <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 16 }}>{t('profile.completedLessonsTitle', { n: String(completedLessons.length) })}</div>
      {completedLessons.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '32px 0', fontSize: 14 }}>{t('profile.noLessonsYet')}</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {completedLessons.map(l => (
            <button
              type="button"
              key={l.id}
              onClick={() => onOpenLesson(l.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'var(--bg-primary)', borderRadius: 12, cursor: 'pointer', border: 'none', textAlign: 'left', width: '100%', font: 'inherit', color: 'inherit' }}
            >
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: 'var(--brand)' }}>
                <LessonIcon id={l.id} action="lesson" size={20} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{l.title}</div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 2 }}>{l.category || ''}</div>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={'var(--text-muted)'} strokeWidth="2.5" aria-hidden="true"><polyline points="9 18 15 12 9 6" /></svg>
            </button>
          ))}
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
      <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
        <StarIcon width={20} height={20} aria-hidden="true" />
        <span>{t('profile.totalXp')}</span>
      </div>
      <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 16 }}>{t('profile.monthBreakdown', { month: monthLabel })}</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 36, fontWeight: 900, color: 'var(--brand)' }}>{totalXp.toLocaleString()}</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{t('profile.cumulativeXp')}</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 36, fontWeight: 900, color: 'var(--brand-light)' }}>+{thisMonthTotal}</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{t('profile.thisMonthEarned')}</div>
        </div>
      </div>
      {entries.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '16px 0', fontSize: 14 }}>{t('profile.noXpThisMonth')}</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {entries.map(([label, xp]) => {
            const pct = thisMonthTotal > 0 ? Math.round(xp / thisMonthTotal * 100) : 0
            return (
              <div key={label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 600 }}>{label}</span>
                  <span style={{ fontSize: 13, color: 'var(--brand)', fontWeight: 700 }}>+{xp} XP</span>
                </div>
                <div style={{ height: 6, background: 'var(--bg-tertiary)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: 'var(--brand)', borderRadius: 4 }} />
                </div>
              </div>
            )
          })}
        </div>
      )}
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
    const iso = d.toISOString().slice(0, 10)
    return studyDates.has(iso)
  })
}

function AssistantNameCard({ currentName, onUpdate }: { currentName: string; onUpdate: (name: string) => Promise<void> }) {
  const [input, setInput] = useState(currentName)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState(false)

  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setInput(currentName) }, [currentName])

  const handleSave = async () => {
    setSaving(true)
    await onUpdate(input)
    setSaving(false)
    setToast(true)
    setTimeout(() => setToast(false), 2000)
  }

  const dirty = input.trim() !== currentName.trim() && input.trim().length > 0

  return (
    <div style={{
      background: 'var(--bg-card)',
      borderRadius: 'var(--radius-lg)',
      padding: 18,
      boxShadow: 'var(--shadow-v3-card-inset)',
      border: '1px solid rgba(255,255,255,.06)',
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
    }}>
      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>{t('profile.assistantSettings')}</div>
      <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{t('profile.assistantNameCurrent', { name: currentName })}</div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={t('journal.assistantNameDefault')}
        aria-label={t('profile.assistantSettings')}
        maxLength={30}
        style={{
          padding: '10px 12px',
          background: 'var(--bg-primary)',
          border: '1px solid var(--border, rgba(255,255,255,.08))',
          borderRadius: 10,
          color: 'var(--text-primary)',
          font: 'inherit',
          fontSize: 14,
        }}
      />
      <button
        type="button"
        onClick={handleSave}
        disabled={!dirty || saving}
        style={{
          padding: '12px',
          background: 'var(--brand)',
          color: 'var(--accent-fg, #fff)',
          border: 'none',
          borderRadius: 10,
          font: 'inherit',
          fontSize: 14,
          fontWeight: 700,
          cursor: dirty && !saving ? 'pointer' : 'not-allowed',
          opacity: dirty && !saving ? 1 : 0.5,
          minHeight: 44,
        }}
      >
        {saving ? t('common.loading') : t('common.save')}
      </button>
      {toast && (
        <div style={{
          textAlign: 'center',
          fontSize: 13,
          fontWeight: 600,
          color: 'var(--brand)',
        }}>{t('profile.assistantSaved')}</div>
      )}
    </div>
  )
}

function StatCard({ val, label, onClick, highlight }: { val: string; label: string; onClick: () => void; highlight?: boolean }) {
  return (
    <button
      type="button"
      className="stat"
      onClick={onClick}
      style={{ background: 'var(--bg-card)', borderRadius: 16, padding: '14px 8px', textAlign: 'center', boxShadow: '0 6px 20px rgba(0,0,0,.32), inset 0 1px 0 rgba(255,255,255,.05)', cursor: 'pointer', position: 'relative', border: '1px solid rgba(255,255,255,.06)', font: 'inherit', color: 'inherit', width: '100%' }}
    >
      <div style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: 22, fontWeight: 900, color: 'var(--brand)', letterSpacing: '-.03em', lineHeight: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}>
        {highlight && <FlameIcon size={18} />}
        {val}
      </div>
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', marginTop: 5 }}>{label}</div>
      <div style={{ position: 'absolute', bottom: 6, right: 8, fontSize: 10, color: 'var(--text-muted)' }}>›</div>
    </button>
  )
}

function FlameIcon({ size = 20, dim = false }: { size?: number; dim?: boolean }) {
  const uid = useId()
  const outerId = `pf-flame-out-${uid}`
  const innerId = `pf-flame-in-${uid}`
  const coreId = `pf-flame-core-${uid}`

  if (dim) {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <path
          d="M19 2.5 C17.5 5 18.5 7.5 18 10 C20.5 9 23 11.5 24 15 C26 18.5 25.5 23.5 22.5 26.5 C18.5 30 12 30 8 26 C5 23 4 17.5 6 13.5 C7.5 11 10 10 12 8 C11 5.5 13 3 15.5 2 C15.5 4 16.5 4.5 18 3 C18.5 2 18.5 2 19 2.5 Z"
          fill="#2E3550"
          stroke="#3F4760"
          strokeWidth="1"
        />
        <path
          d="M16.5 12 C14.5 14.5 13 17 13.5 20 C14 23 16.5 23.5 18 22.5 C20.5 21 21 17.5 19 14.5 C18 13 17 12 16.5 12 Z"
          fill="#3F4760"
        />
      </svg>
    )
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      style={{ filter: 'drop-shadow(0 2px 8px rgba(255,107,0,.55))' }}
    >
      <defs>
        <linearGradient id={outerId} x1="16" y1="1" x2="16" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FFC42E" />
          <stop offset=".30" stopColor="#FF8A1A" />
          <stop offset=".70" stopColor="#FF3D00" />
          <stop offset="1" stopColor="#9F1A0B" />
        </linearGradient>
        <linearGradient id={innerId} x1="16" y1="10" x2="16" y2="26" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FFF176" />
          <stop offset=".5" stopColor="#FFB300" />
          <stop offset="1" stopColor="#FF6F00" stopOpacity=".7" />
        </linearGradient>
        <radialGradient id={coreId} cx="16.5" cy="21" r="3.5" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset=".4" stopColor="#FFF59D" />
          <stop offset="1" stopColor="#FFEB3B" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Outer flame: asymmetric tear-drop with curl on the top */}
      <path
        d="M19 2.5 C17.5 5 18.5 7.5 18 10 C20.5 9 23 11.5 24 15 C26 18.5 25.5 23.5 22.5 26.5 C18.5 30 12 30 8 26 C5 23 4 17.5 6 13.5 C7.5 11 10 10 12 8 C11 5.5 13 3 15.5 2 C15.5 4 16.5 4.5 18 3 C18.5 2 18.5 2 19 2.5 Z"
        fill={`url(#${outerId})`}
      />

      {/* Inner flame: brighter, smaller */}
      <path
        d="M16.5 11 C14.5 13.5 12.5 16.5 13 20 C13.5 23 16 24 17.5 23.5 C20.5 22 21 18 19 15 C17.5 13 16.5 12 16.5 11 Z"
        fill={`url(#${innerId})`}
      />

      {/* White-hot core */}
      <ellipse cx="16.8" cy="20.5" rx="1.8" ry="2.6" fill={`url(#${coreId})`} />
    </svg>
  )
}

function SettingRow({ icon, name, sub, onClick }: { icon: string; name: string; sub: string; onClick?: () => void }) {
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
  }

  return (
    <button type="button" onClick={onClick}
      aria-label={sub ? `${name}: ${sub}` : name}
      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', cursor: 'pointer', borderBottom: `1px solid ${'var(--border)'}`, background: 'transparent', border: 'none', borderTop: 'none', borderLeft: 'none', borderRight: 'none', color: 'inherit', font: 'inherit', textAlign: 'left', width: '100%', minHeight: 44 }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--accent-soft)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{iconSvg[icon]}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2, color: 'var(--text-primary)' }}>{name}</div>
        {sub && <div style={{ fontSize: 13, color: 'var(--text-secondary)', fontWeight: 500 }}>{sub}</div>}
      </div>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={'var(--text-muted)'} strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><polyline points="9 18 15 12 9 6" /></svg>
    </button>
  )
}
