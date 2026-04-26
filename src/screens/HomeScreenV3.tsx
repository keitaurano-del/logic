/**
 * HomeScreenV3 - Logic v3 redesign
 * 仕様: docs/DESIGN_V3.md §3.1
 * モックアップ: lv3-home.html
 */
import { useMemo } from 'react'
import { getXp, getStreak, getCompletedCount, getStudyDates } from '../stats'
import { v3 } from '../styles/tokensV3'
import { getCurrentLevel, getXpProgress } from './homeHelpers'

interface HomeScreenV3Props {
  userName: string
  onOpenLesson: (lessonId: number) => void
  onOpenCategory: (cat: string) => void
  onOpenRoadmap?: () => void
  onOpenAIGen: () => void
  onOpenRoleplay: () => void
  onOpenRank: () => void
  onNavigateToDailyFermi?: () => void
}

const IMG = '/images/v3'

export function HomeScreenV3(props: HomeScreenV3Props) {
  const { userName, onOpenLesson, onOpenAIGen, onOpenRoleplay, onOpenRank, onNavigateToDailyFermi } = props

  const streak = getStreak()
  const completed = getCompletedCount()
  const xp = getXp()
  const lv = getCurrentLevel(xp)
  const { pct: levelPct, current: levelXp, needed: nextThreshold } = getXpProgress(xp)
  const xpToNext = Math.max(0, nextThreshold - levelXp)

  // 今週カレンダー
  const todayDow = (new Date().getDay() + 6) % 7
  const weekDays = ['月', '火', '水', '木', '金', '土', '日']
  const studyDateSet = useMemo(() => new Set(getStudyDates()), [])
  const thisWeekDates = useMemo(() => {
    const today = new Date()
    const monday = new Date(today)
    monday.setDate(today.getDate() - todayDow)
    return weekDays.map((_, i) => {
      const d = new Date(monday)
      d.setDate(monday.getDate() + i)
      return d.toISOString().slice(0, 10)
    })
  }, [todayDow])
  const thisWeekStudied = thisWeekDates.filter(d => studyDateSet.has(d)).length

  return (
    <div style={{ background: v3.color.bg, minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Noto Sans JP', sans-serif", color: v3.color.text }}>
      {/* Navbar */}
      <div style={{ padding: 'calc(env(safe-area-inset-top, 44px) + 4px) 20px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: v3.font.logo.family, fontSize: v3.font.logo.size, fontWeight: v3.font.logo.weight, letterSpacing: '-.02em' }}>
          Logic<span style={{ color: v3.color.accent }}>.</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: v3.color.card, borderRadius: v3.radius.pill, padding: '7px 14px' }}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill={v3.color.accent}><path d="M12 2c0 0-5 4-5 10a5 5 0 0 0 10 0c0-6-5-10-5-10z" /></svg>
            <span style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: 14, fontWeight: 700, color: v3.color.accent }}>{streak}</span>
            <span style={{ fontSize: 12, fontWeight: 500, color: v3.color.text2 }}>日</span>
          </div>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: `linear-gradient(135deg, ${v3.color.card2}, ${v3.color.card})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter Tight', sans-serif", fontSize: 14, fontWeight: 700, color: v3.color.accent }}>
            {(userName || 'G').slice(0, 1).toUpperCase()}
          </div>
        </div>
      </div>

      {/* Scrollable content */}
      <div style={{ flex: 1, padding: '0 16px 100px', display: 'flex', flexDirection: 'column', gap: v3.spacing.gap }}>

        {/* Greeting */}
        <div style={{ padding: '4px 4px 8px' }}>
          <div style={{ fontSize: 13, color: v3.color.text2, marginBottom: 4, fontWeight: 500 }}>こんにちは、{userName || 'ゲスト'} さん</div>
          <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.45, letterSpacing: '-.005em' }}>今日も論理を、<br />ひとつ深めましょう。</div>
        </div>

        {/* Hero Recommend */}
        <div
          onClick={() => onOpenLesson(20)}
          style={{ background: 'linear-gradient(140deg, #1A3A39 0%, #2C5856 100%)', borderRadius: v3.radius.card, overflow: 'hidden', cursor: 'pointer', boxShadow: v3.shadow.hero, flexShrink: 0 }}
        >
          <div style={{ height: 160, position: 'relative', overflow: 'hidden' }}>
            <img src={`${IMG}/hero-deduction.webp`} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
          <div style={{ padding: '18px 20px 20px' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, background: v3.color.accentSoft, borderRadius: v3.radius.pill, padding: '4px 11px', fontSize: 11, fontWeight: 600, color: v3.color.accent, marginBottom: 10 }}>ロジカルシンキング · 初級</span>
            <div style={{ fontSize: 19, fontWeight: 700, marginBottom: 6, lineHeight: 1.35, letterSpacing: '-.005em' }}>演繹法と帰納法</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: v3.color.text2, fontSize: 12, fontWeight: 500, marginBottom: 16 }}>
              <span>3分</span><div style={{ width: 3, height: 3, borderRadius: '50%', background: v3.color.text3 }}></div>
              <span>5スライド</span><div style={{ width: 3, height: 3, borderRadius: '50%', background: v3.color.text3 }}></div>
              <span>+50 XP</span>
            </div>
            <div style={{ background: v3.color.accent, color: v3.color.bg, borderRadius: v3.radius.pill, padding: '13px 18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, fontSize: 14, fontWeight: 700, boxShadow: v3.shadow.cta }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill={v3.color.bg}><polygon points="5 3 19 12 5 21 5 3" /></svg>
              レッスンをはじめる
            </div>
          </div>
        </div>

        {/* Today's routine */}
        <div style={{ background: v3.color.card, borderRadius: v3.radius.card, overflow: 'hidden', flexShrink: 0, boxShadow: v3.shadow.card }}>
          <div style={{ padding: '16px 18px 8px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 14, fontWeight: 600 }}>今日のルーティン</span>
            <span style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: 13, color: v3.color.accent, fontWeight: 700 }}>1 / 2</span>
          </div>
          <div style={{ margin: '0 18px 14px', height: 4, background: 'rgba(112,216,189,.12)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: '50%', background: v3.color.accent, borderRadius: 99, boxShadow: `0 0 8px ${v3.color.accentGlow}` }}></div>
          </div>
          <div onClick={onNavigateToDailyFermi} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 18px', cursor: 'pointer' }}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', background: v3.color.accent, border: `1.5px solid ${v3.color.accent}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 0 8px ${v3.color.accentGlow}` }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={v3.color.bg} strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: v3.color.text2, textDecoration: 'line-through' }}>今日のフェルミ推定</div>
              <div style={{ fontSize: 12, color: v3.color.text2, marginTop: 2 }}>東京のコンビニの数</div>
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: v3.color.accent, fontFamily: "'Inter Tight', sans-serif", background: v3.color.accentSoft, borderRadius: 8, padding: '5px 9px', whiteSpace: 'nowrap' }}>+30</span>
          </div>
          <div onClick={() => onOpenLesson(20)} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 18px', cursor: 'pointer', borderTop: `1px solid ${v3.color.line}` }}>
            <div style={{ width: 24, height: 24, borderRadius: '50%', border: `1.5px solid ${v3.color.text3}`, flexShrink: 0 }}></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 15, fontWeight: 600 }}>レッスンを1つ完了</div>
              <div style={{ fontSize: 12, color: v3.color.text2, marginTop: 2 }}>演繹法と帰納法 · 3分</div>
            </div>
            <span style={{ fontSize: 12, fontWeight: 700, color: v3.color.accent, fontFamily: "'Inter Tight', sans-serif", background: v3.color.accentSoft, borderRadius: 8, padding: '5px 9px', whiteSpace: 'nowrap' }}>+50</span>
          </div>
        </div>

        {/* Week */}
        <div style={{ background: v3.color.card, borderRadius: v3.radius.card, padding: 18, flexShrink: 0, boxShadow: v3.shadow.card }}>
          <div style={{ fontSize: 13, color: v3.color.text2, fontWeight: 500, marginBottom: 14 }}>
            今週は <b style={{ color: v3.color.text, fontWeight: 700 }}>{thisWeekStudied}日</b> 学習しました
          </div>
          <div style={{ display: 'flex', gap: 6, justifyContent: 'space-between' }}>
            {weekDays.map((d, i) => {
              const studied = studyDateSet.has(thisWeekDates[i])
              const isToday = i === todayDow
              return (
                <div key={d} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 7, flex: 1 }}>
                  <span style={{ fontSize: 11, color: v3.color.text3, fontWeight: 500 }}>{d}</span>
                  <div style={{ width: 30, height: 30, borderRadius: '50%', background: studied ? v3.color.accent : v3.color.cardSoft, border: isToday && !studied ? `1.5px solid ${v3.color.accent}` : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: studied ? `0 0 10px ${v3.color.accentGlow}` : 'none' }}>
                    {studied && <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={v3.color.bg} strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12" /></svg>}
                    {isToday && !studied && <div style={{ width: 6, height: 6, borderRadius: '50%', background: v3.color.accent, boxShadow: `0 0 6px ${v3.color.accentGlow}` }}></div>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Courses horizontal scroll */}
        <div style={{ margin: '0 -16px', padding: '0 16px', overflowX: 'auto', display: 'flex', gap: 12, scrollSnapType: 'x mandatory', scrollPaddingLeft: 16 }}>
          <CourseCard name="ロジカル<br>シンキング" image={`${IMG}/course-logical.webp`} progress={60} accent={v3.color.accent} meta="5レッスン · 60%" onClick={() => props.onOpenCategory('logic')} />
          <CourseCard name="ケース面接" image={`${IMG}/course-business.webp`} progress={25} accent={v3.color.warm} meta="4レッスン · 25%" onClick={() => props.onOpenCategory('case')} />
          <CourseCard name="思考法" image={`${IMG}/course-thinking.webp`} progress={15} accent="#A5B4FC" meta="22レッスン · 15%" onClick={() => props.onOpenCategory('thinking')} />
          <CourseCard name="哲学・<br>思考の原理" image={`${IMG}/course-philosophy.webp`} progress={0} accent="#C4B5FD" meta="5レッスン · 0%" onClick={() => props.onOpenCategory('philosophy')} />
        </div>

        {/* AI grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <AICard image={`${IMG}/ai-bot.webp`} name="AI問題生成" sub="テーマ別オリジナル問題" onClick={onOpenAIGen} />
          <AICard image={`${IMG}/ai-chat.webp`} name="ロールプレイ" sub="対話形式で論理訓練" onClick={onOpenRoleplay} />
        </div>

        {/* XP */}
        <div onClick={onOpenRank} style={{ background: v3.color.card, borderRadius: v3.radius.card, padding: 18, cursor: 'pointer', position: 'relative', overflow: 'hidden', boxShadow: v3.shadow.card }}>
          <div style={{ position: 'absolute', right: -40, top: -40, width: 140, height: 140, borderRadius: '50%', background: v3.color.accentGlow, filter: 'blur(36px)', pointerEvents: 'none' }}></div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14, position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: v3.color.accentSoft, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: `0 0 16px ${v3.color.accentGlow}` }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={v3.color.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
              </div>
              <div>
                <div style={{ fontSize: 11, color: v3.color.text2, fontWeight: 500, marginBottom: 3 }}>レベル</div>
                <div style={{ fontFamily: "'Inter Tight', sans-serif", fontSize: 22, fontWeight: 800, letterSpacing: '-.02em', lineHeight: 1 }}>Lv.{lv.level}</div>
              </div>
            </div>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={v3.color.text3} strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6" /></svg>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 7, position: 'relative', zIndex: 1 }}>
            <span style={{ fontSize: 12, color: v3.color.text2, fontWeight: 500 }}>経験値</span>
            <span style={{ fontSize: 12, fontWeight: 600, fontFamily: "'Inter Tight', sans-serif" }}>{levelXp} / {nextThreshold} XP</span>
          </div>
          <div style={{ height: 5, background: 'rgba(255,255,255,.06)', borderRadius: 99, overflow: 'hidden', position: 'relative', zIndex: 1 }}>
            <div style={{ height: '100%', width: `${levelPct}%`, background: v3.color.accent, borderRadius: 99, boxShadow: `0 0 8px ${v3.color.accentGlow}` }}></div>
          </div>
          <div style={{ fontSize: 11, color: v3.color.text3, marginTop: 7, position: 'relative', zIndex: 1 }}>次のレベルまで {xpToNext} XP</div>
        </div>
      </div>
    </div>
  )
}

function CourseCard({ name, image, progress, accent, meta, onClick }: { name: string; image: string; progress: number; accent: string; meta: string; onClick: () => void }) {
  return (
    <div onClick={onClick} style={{ flexShrink: 0, width: 180, background: v3.color.card, borderRadius: v3.radius.card, overflow: 'hidden', cursor: 'pointer', scrollSnapAlign: 'start', boxShadow: v3.shadow.card }}>
      <div style={{ height: 90, overflow: 'hidden' }}>
        <img src={image} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </div>
      <div style={{ padding: '14px 16px 16px' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: v3.color.text, marginBottom: 5, lineHeight: 1.3, minHeight: 18 }} dangerouslySetInnerHTML={{ __html: name }}></div>
        <div style={{ fontSize: 11, color: v3.color.text2, fontWeight: 500, marginBottom: 12 }}>{meta}</div>
        <div style={{ height: 4, background: 'rgba(255,255,255,.06)', borderRadius: 99, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: accent, borderRadius: 99 }}></div>
        </div>
      </div>
    </div>
  )
}

function AICard({ image, name, sub, onClick }: { image: string; name: string; sub: string; onClick: () => void }) {
  return (
    <div onClick={onClick} style={{ background: v3.color.card, borderRadius: v3.radius.card, overflow: 'hidden', cursor: 'pointer', boxShadow: v3.shadow.card }}>
      <div style={{ height: 80, overflow: 'hidden' }}>
        <img src={image} alt="" loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
      </div>
      <div style={{ padding: '12px 14px 16px' }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 3 }}>{name}</div>
        <div style={{ fontSize: 11, color: v3.color.text2, fontWeight: 500, lineHeight: 1.5 }}>{sub}</div>
      </div>
    </div>
  )
}
