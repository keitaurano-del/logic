/**
 * ProfileScreenV3 - Logic v3 redesign
 * 仕様: docs/DESIGN_V3.md §3.6
 */
import { useState } from 'react'
import { getCompletedCount, getLessonStreak, getXp, getCompletedLessons, getXpLogThisMonth, XP_EVENT_LABEL } from '../stats'
import { getAllLessonsFlat } from '../lessonData'
import { getCurrentLevel, getXpProgress } from './homeHelpers'
import { logout } from '../supabase'
import { getSubscriptionState, isPremiumPlan, isStandardPlan, daysLeftInTrial } from '../subscription'
import { v3 } from '../styles/tokensV3'
import { getStudyDates as _getStudyDatesArr } from '../stats'

function getPlanLabel(): string {
  const state = getSubscriptionState()
  if (isPremiumPlan()) {
    if (state.plan === 'trial') {
      const days = daysLeftInTrial()
      return days > 0 ? `トライアル（残り${days}日）` : 'トライアル切れ'
    }
    return 'プレミアム'
  }
  if (isStandardPlan()) {
    return state.plan.includes('yearly') ? 'スタンダード（年）' : 'スタンダード'
  }
  return '無料（キャンペーン中）'
}

interface ProfileScreenV3Props {
  userName: string
  onOpenSettings: (section?: 'account' | 'notifications' | 'plan') => void
  onOpenFeedback?: () => void
  onOpenPricing?: () => void
  onOpenPlacementTest?: () => void
  onOpenLesson?: (lessonId: number) => void
}

type Sheet = null | 'streak' | 'lessons' | 'xp'

export function ProfileScreenV3(props: ProfileScreenV3Props) {
  const { userName, onOpenSettings, onOpenFeedback, onOpenPricing, onOpenPlacementTest, onOpenLesson } = props
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
    <div style={{ background: v3.color.bg, minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Noto Sans JP', sans-serif", color: v3.color.text }}>
      {/* Hero */}
      <div style={{ background: 'linear-gradient(160deg, #1A1F2E 0%, #1E2540 70%, #252C40 100%)', padding: 'calc(env(safe-area-inset-top, 44px) + 14px) 20px 28px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', right: -50, top: -50, width: 200, height: 200, borderRadius: '50%', background: 'rgba(108,142,245,0.2)', filter: 'blur(40px)', pointerEvents: 'none' }}></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 18, position: 'relative', zIndex: 1 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: `linear-gradient(135deg, ${v3.color.accent}, #9BB3FA)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter Tight', sans-serif", fontSize: 26, fontWeight: 900, color: v3.color.bg, boxShadow: `0 0 24px rgba(108,142,245,0.4)` }}>
            {(userName || 'G').slice(0, 1).toUpperCase()}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: 22, fontWeight: 900, letterSpacing: '-.02em', marginBottom: 2, color: '#FFFFFF' }}>{userName || 'ゲスト'}</div>
            <div style={{ fontSize: 14, color: v3.color.text2, fontWeight: 500 }}>{userName ? `ロジカルシンカー トレーニー` : `ログインすると進捗が保存されるよ`}</div>
            {!userName && (
              <button
                onClick={() => onOpenSettings('account')}
                style={{ marginTop: 8, padding: '6px 16px', background: v3.color.accent, color: v3.color.bg, border: 'none', borderRadius: 99, fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
              >
                ログイン / 新規登録
              </button>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, position: 'relative', zIndex: 1 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: v3.color.text2, letterSpacing: '.12em', textTransform: 'uppercase' }}>レベル</span>
          <span style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: 18, fontWeight: 900, letterSpacing: '-.02em', color: '#FFFFFF' }}>Lv.{lv.level}</span>
        </div>
        <div style={{ height: 12, background: 'rgba(255,255,255,.1)', borderRadius: 99, overflow: 'hidden', marginBottom: 8, position: 'relative', zIndex: 1 }}>
          <div style={{ height: '100%', width: `${levelPct}%`, background: v3.color.accent, borderRadius: 99, boxShadow: '0 0 12px rgba(108,142,245,0.5)' }}></div>
        </div>
        <div style={{ fontSize: 14, color: v3.color.text2, fontWeight: 500, textAlign: 'right', position: 'relative', zIndex: 1 }}>次のLvまで {Math.max(0, needed - levelXp)} XP</div>
      </div>

      {/* Stats grid — タップで詳細シート */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginTop: -32, position: 'relative', zIndex: 2, padding: '0 20px' }}>
        <StatCard val={String(streak)} label="連続学習日数" onClick={() => setSheet('streak')} />
        <StatCard val={String(completed)} label="完了レッスン" onClick={() => setSheet('lessons')} />
        <StatCard val={xp.toLocaleString()} label="総XP" onClick={() => setSheet('xp')} />
      </div>

      <div style={{ flex: 1, padding: '16px 16px 100px', display: 'flex', flexDirection: 'column', gap: v3.spacing.gap }}>
        {/* 今週の学習サマリー */}
        <div style={{ background: v3.color.card, borderRadius: v3.radius.card, padding: 18, boxShadow: v3.shadow.card }}>
          <div style={{ fontSize: 14, color: '#FFFFFF', fontWeight: 600, marginBottom: 12 }}>今週の学習サマリー</div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6, height: 70, marginBottom: 8 }}>
            {['月', '火', '水', '木', '金', '土', '日'].map((d, i) => {
              const studied = getStudiedThisWeek()[i]
              return (
                <div key={d} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                  <div style={{ flex: 1, width: '100%', display: 'flex', alignItems: 'flex-end' }}>
                    <div style={{ width: '100%', height: studied ? '100%' : '20%', minHeight: 8, background: studied ? v3.color.accent : v3.color.cardSoft, borderRadius: 5 }}></div>
                  </div>
                  <span style={{ fontSize: 14, color: v3.color.text2, fontWeight: 500 }}>{d}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* プレイスメントテスト */}
        {onOpenPlacementTest && (
          <div onClick={onOpenPlacementTest} style={{
            background: `linear-gradient(135deg, ${v3.color.accentSoft} 0%, rgba(108,142,245,.1) 100%)`,
            border: `1px solid ${v3.color.accent}40`,
            borderRadius: v3.radius.card, padding: '16px 18px',
            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <div style={{ width: 40, height: 40, borderRadius: 12, background: v3.color.accent, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={v3.color.bg} strokeWidth="2.5" strokeLinecap="round"><path d="M9 11l3 3L22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/></svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: '#FFFFFF' }}>プレイスメントテスト</div>
              <div style={{ fontSize: 13, color: v3.color.text2, marginTop: 2 }}>自分のレベルを確認して最適なレッスンを受けよう</div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={v3.color.text3} strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
          </div>
        )}

        {/* 設定 */}
        <div style={{ background: v3.color.card, borderRadius: v3.radius.card, overflow: 'hidden', boxShadow: v3.shadow.card }}>
          <SettingRow icon="user" name="アカウント" sub={userName || 'ゲスト'} onClick={() => onOpenSettings('account')} />
          <SettingRow icon="bell" name="通知設定" sub="" onClick={() => onOpenSettings('notifications')} />
          <SettingRow icon="card" name="プラン" sub={getPlanLabel()} onClick={onOpenPricing} />
          <SettingRow icon="message" name="フィードバック" sub="ご意見をお聞かせください" onClick={onOpenFeedback} />
          <SettingRow icon="doc" name="利用規約" sub="" onClick={() => window.open('/terms.html', '_blank')} />
          <SettingRow icon="shield" name="プライバシーポリシー" sub="" onClick={() => window.open('/privacy.html', '_blank')} />
          <SettingRow icon="scale" name="特定商取引法に基づく表記" sub="" onClick={() => window.open('/tokushoho.html', '_blank')} />
        </div>
        <div onClick={handleLogout} style={{ background: 'transparent', border: '1px solid rgba(252,165,165,.4)', borderRadius: 14, padding: 13, textAlign: 'center', fontSize: 14, fontWeight: 700, color: '#FCA5A5', cursor: 'pointer' }}>
          ログアウト
        </div>
      </div>

      {/* ボトムシート */}
      {sheet && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 100, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'flex-end' }}
          onClick={() => setSheet(null)}
        >
          <div
            style={{ background: v3.color.card, borderRadius: '20px 20px 0 0', width: '100%', maxHeight: '70vh', overflowY: 'auto', padding: '20px 20px 40px' }}
            onClick={e => e.stopPropagation()}
          >
            {/* ドラッグバー */}
            <div style={{ width: 40, height: 4, background: v3.color.cardSoft, borderRadius: 2, margin: '0 auto 20px' }} />

            {sheet === 'streak' && <StreakSheet streak={streak} />}
            {sheet === 'lessons' && <LessonsSheet onOpenLesson={(id) => { setSheet(null); onOpenLesson?.(id) }} />}
            {sheet === 'xp' && <XpSheet totalXp={xp} />}

            <button onClick={() => setSheet(null)} style={{ marginTop: 20, width: '100%', background: v3.color.cardSoft, border: 'none', borderRadius: 12, padding: '13px', fontSize: 14, fontWeight: 700, color: v3.color.text2, cursor: 'pointer' }}>閉じる</button>
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
      <div style={{ fontSize: 18, fontWeight: 800, color: '#FFFFFF', marginBottom: 16 }}>🔥 連続学習日数</div>
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <div style={{ fontSize: 72, fontWeight: 900, color: v3.color.accent, letterSpacing: '-0.04em', lineHeight: 1 }}>{streak}</div>
        <div style={{ fontSize: 18, color: v3.color.text2, marginTop: 8, fontWeight: 600 }}>日連続</div>
      </div>
      <div style={{ background: v3.color.bg, borderRadius: 14, padding: '14px 16px' }}>
        <div style={{ fontSize: 13, color: v3.color.text2, lineHeight: 1.7 }}>
          レッスンを完了した日にカウントされるよ。<br />
          1日サボっても翌日やれば継続できる！
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
      <div style={{ fontSize: 18, fontWeight: 800, color: '#FFFFFF', marginBottom: 16 }}>📚 完了レッスン（{completedLessons.length}件）</div>
      {completedLessons.length === 0 ? (
        <div style={{ textAlign: 'center', color: v3.color.text2, padding: '32px 0', fontSize: 14 }}>まだレッスンを完了していないよ</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {completedLessons.map(l => (
            <div
              key={l.id}
              onClick={() => onOpenLesson(l.id)}
              style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: v3.color.bg, borderRadius: 12, cursor: 'pointer' }}
            >
              <div style={{ width: 36, height: 36, borderRadius: 10, background: v3.color.accentSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>✓</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: '#FFFFFF' }}>{l.title}</div>
                <div style={{ fontSize: 12, color: v3.color.text2, marginTop: 2 }}>{l.category || ''}</div>
              </div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={v3.color.text3} strokeWidth="2.5"><polyline points="9 18 15 12 9 6" /></svg>
            </div>
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
  const monthLabel = `${now.getMonth() + 1}月`

  return (
    <>
      <div style={{ fontSize: 18, fontWeight: 800, color: '#FFFFFF', marginBottom: 4 }}>⭐️ 総XP</div>
      <div style={{ fontSize: 13, color: v3.color.text2, marginBottom: 16 }}>{monthLabel}の獲得内訳</div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 36, fontWeight: 900, color: v3.color.accent }}>{totalXp.toLocaleString()}</div>
          <div style={{ fontSize: 12, color: v3.color.text2 }}>累計XP</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 36, fontWeight: 900, color: '#9BB3FA' }}>+{thisMonthTotal}</div>
          <div style={{ fontSize: 12, color: v3.color.text2 }}>今月獲得</div>
        </div>
      </div>
      {entries.length === 0 ? (
        <div style={{ textAlign: 'center', color: v3.color.text2, padding: '16px 0', fontSize: 14 }}>今月はまだXPを獲得していないよ</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {entries.map(([label, xp]) => {
            const pct = thisMonthTotal > 0 ? Math.round(xp / thisMonthTotal * 100) : 0
            return (
              <div key={label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: 13, color: '#FFFFFF', fontWeight: 600 }}>{label}</span>
                  <span style={{ fontSize: 13, color: v3.color.accent, fontWeight: 700 }}>+{xp} XP</span>
                </div>
                <div style={{ height: 6, background: v3.color.cardSoft, borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: v3.color.accent, borderRadius: 4 }} />
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

function StatCard({ val, label, onClick }: { val: string; label: string; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      style={{ background: v3.color.card, borderRadius: 16, padding: '14px 8px', textAlign: 'center', boxShadow: '0 4px 16px rgba(108,142,245,.08)', cursor: 'pointer', position: 'relative' }}
    >
      <div style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: 22, fontWeight: 900, color: v3.color.accent, letterSpacing: '-.03em', lineHeight: 1 }}>{val}</div>
      <div style={{ fontSize: 11, fontWeight: 600, color: v3.color.text2, marginTop: 5 }}>{label}</div>
      <div style={{ position: 'absolute', bottom: 6, right: 8, fontSize: 10, color: v3.color.text3 }}>›</div>
    </div>
  )
}

function SettingRow({ icon, name, sub, onClick }: { icon: string; name: string; sub: string; onClick?: () => void }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const iconSvg: Record<string, any> = {
    user: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={v3.color.accent} strokeWidth="2" strokeLinecap="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>,
    bell: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={v3.color.accent} strokeWidth="2" strokeLinecap="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>,
    card: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={v3.color.accent} strokeWidth="2" strokeLinecap="round"><rect x="2" y="5" width="20" height="14" rx="2" /><line x1="2" y1="10" x2="22" y2="10" /></svg>,
    message: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={v3.color.accent} strokeWidth="2" strokeLinecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>,
    doc: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={v3.color.accent} strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
    shield: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={v3.color.accent} strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
    scale: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={v3.color.accent} strokeWidth="2" strokeLinecap="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>,
  }

  return (
    <div onClick={onClick} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', cursor: 'pointer', borderBottom: `1px solid ${v3.color.line}` }}>
      <div style={{ width: 36, height: 36, borderRadius: 10, background: v3.color.accentSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{iconSvg[icon]}</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 2, color: '#FFFFFF' }}>{name}</div>
        {sub && <div style={{ fontSize: 13, color: v3.color.text2, fontWeight: 500 }}>{sub}</div>}
      </div>
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={v3.color.text3} strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
    </div>
  )
}
