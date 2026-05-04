import { useState } from 'react'
import {
  loadPlacementResult,
  rankLabel,
  recommendedLessons,
  computeAxisScores,
  axisLabel,
  recommendCourses,
  type AxisScore,
} from '../placementData'
import { getAllLessonsFlat } from '../lessonData'
import { getCourseById } from '../courseData'
import { ArrowLeftIcon, SparklesIcon } from '../icons'
import { Button } from '../components/Button'
import { IconButton } from '../components/IconButton'
import { RadarChart } from '../components/RadarChart'


interface DeviationScreenProps {
  onBack: () => void
  onRetakeTest: () => void
  onStartLesson: (lessonId: number) => void
}

export function DeviationScreen({ onBack, onRetakeTest, onStartLesson }: DeviationScreenProps) {
  const result = loadPlacementResult()
  const [showModal, setShowModal] = useState(false)

  if (!result || result.totalCount === 0) {
    return (
      <div className="stack">
        <div className="screen-header">
          <IconButton aria-label="Back" onClick={onBack}>
            <ArrowLeftIcon />
          </IconButton>
          <div className="progress-text">実力診断</div>
        </div>
        <div className="card empty">
          <h3 style={{ fontSize: 20, marginBottom: 'var(--s-2)' }}>
            実力診断テスト未受検
          </h3>
          <p className="muted" style={{ fontSize: 16 }}>
            診断を受けると偏差値とスキル分布が表示されます
          </p>
          <Button
            variant="primary"
            size="lg"
            onClick={onRetakeTest}
            style={{ marginTop: 'var(--s-4)' }}
          >
            診断を受ける
          </Button>
        </div>
      </div>
    )
  }
  const rank = rankLabel(result.deviation)
  const allLessons = getAllLessonsFlat()
  // 軸スコアは新フィールド優先、なければanswersから再計算（後方互換）
  const axisScores: AxisScore[] = result.axisScores.length
    ? result.axisScores
    : result.answers.length
      ? computeAxisScores(result.answers)
      : []

  // コース推薦
  const courseIds = result.recommendedCourseIds.length
    ? result.recommendedCourseIds
    : axisScores.length
      ? recommendCourses(axisScores, result.deviation)
      : []
  const recommendedCourses = courseIds
    .map(id => getCourseById(id))
    .filter((c): c is NonNullable<typeof c> => !!c)

  // レッスン推薦
  const recommendedLessonIds = result.recommendedLessonIds.length
    ? result.recommendedLessonIds
    : axisScores.length
      ? recommendedLessons(axisScores)
      : recommendedLessons(result.deviation)

  // バーの幅: 偏差値25〜75を 0%〜100% にマップ
  const fill = Math.min(100, Math.max(0, ((result.deviation - 25) / 50) * 100))

  const radarAxes = axisScores.map(a => ({
    key: a.axis,
    label: axisLabel(a.axis).short,
    level: a.level,
  }))
  const weakest = axisScores.length ? [...axisScores].sort((a, b) => a.level - b.level)[0] : null
  const strongest = axisScores.length ? [...axisScores].sort((a, b) => b.level - a.level)[0] : null

  return (
    <div className="stack">
      <div className="screen-header">
        <IconButton aria-label="Back" onClick={onBack}>
          <ArrowLeftIcon />
        </IconButton>
        <div className="progress-text">実力診断</div>
      </div>

      <div className="eyebrow accent">あなたの結果</div>

      <section
        className="profile-hero"
        style={{ marginTop: 'var(--s-3)', cursor: 'pointer' }}
        onClick={() => setShowModal(true)}
      >
        <div
          className="eyebrow"
          style={{
            color: 'rgba(255,255,255,0.65)',
            marginBottom: 'var(--s-3)',
            position: 'relative',
          }}
        >
          推定偏差値
        </div>
        <div
          className="display"
          style={{
            fontSize: 80,
            lineHeight: 0.9,
            letterSpacing: '-0.04em',
            color: '#FFFFFF',
            position: 'relative',
          }}
        >
          {result.deviation}
        </div>
        <div
          style={{
            marginTop: 'var(--s-3)',
            position: 'relative',
            fontSize: 16,
            color: 'rgba(255,255,255,0.78)',
            fontWeight: 500,
          }}
        >
          {result.correctCount} / {result.totalCount} 正解
        </div>
        <div
          style={{
            marginTop: 'var(--s-1)',
            position: 'relative',
            fontSize: 13,
            color: 'rgba(255,255,255,0.5)',
          }}
        >
          タップで偏差値の見方を確認
        </div>
      </section>

      <section className="rank-card">
        <div className="rank-eyebrow">ランク</div>
        <div className="rank-row">
          <div className="rank-num" style={{ fontSize: 28 }}>
            {rank.label}
          </div>
        </div>
        <div className="rank-bar">
          <div className="rank-bar-fill" style={{ width: `${fill}%` }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 12, color: 'var(--text-muted)' }}>
          <span>25</span>
          <span>50</span>
          <span>75</span>
        </div>
      </section>

      {/* ── レーダーチャート ───────────────────────── */}
      {radarAxes.length > 0 && (
        <section className="card">
          <div className="eyebrow" style={{ marginBottom: 'var(--s-2)' }}>5軸スキルマップ（5段階）</div>
          <RadarChart axes={radarAxes} size={300} maxLevel={5} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 'var(--s-3)' }}>
            {axisScores.map(a => (
              <div
                key={a.axis}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 10px',
                  borderRadius: 10,
                  background: 'rgba(108,142,245,.08)',
                  border: '1px solid rgba(108,142,245,.18)',
                }}
              >
                <span style={{ fontSize: 13, fontWeight: 700 }}>{axisLabel(a.axis).label}</span>
                <span style={{ fontSize: 14, fontWeight: 800, color: '#6C8EF5' }}>Lv.{a.level}</span>
              </div>
            ))}
          </div>
          {weakest && strongest && weakest.axis !== strongest.axis && (
            <div style={{ marginTop: 'var(--s-3)', padding: '12px', background: 'var(--bg-page, rgba(0,0,0,.04))', borderRadius: 12 }}>
              <div style={{ fontSize: 13, marginBottom: 4 }}>
                💪 <b>強み:</b> {axisLabel(strongest.axis).label}（Lv.{strongest.level}）
              </div>
              <div style={{ fontSize: 13 }}>
                📈 <b>伸びしろ:</b> {axisLabel(weakest.axis).label}（Lv.{weakest.level}）
              </div>
            </div>
          )}
        </section>
      )}

      {/* 偏差値説明モーダル */}
      {showModal && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: 20,
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            style={{
              background: 'var(--bg-card, #fff)', borderRadius: 20,
              padding: '28px 24px', maxWidth: 360, width: '100%',
              boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ fontSize: 20, fontWeight: 800, marginBottom: 16, color: 'var(--text-primary, #0F1523)' }}>
              偏差値とは？
            </h3>
            <div style={{ fontSize: 15, lineHeight: 1.8, color: 'var(--text-secondary, #4B5563)' }}>
              <p style={{ marginBottom: 12 }}>
                偏差値は、全受験者の中でのあなたの位置を示す指標です。平均が50、標準偏差が10になるように計算されます。
              </p>
              <div style={{ background: 'var(--bg-page, #F9FAFB)', borderRadius: 12, padding: '14px 16px', marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontWeight: 700 }}>65以上</span>
                  <span>トップクラス</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontWeight: 700 }}>55〜64</span>
                  <span>上級</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ fontWeight: 700 }}>45〜54</span>
                  <span>中級</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 700 }}>44以下</span>
                  <span>基礎固め</span>
                </div>
              </div>
              <p style={{ fontSize: 14, color: 'var(--text-muted, #9CA3AF)' }}>
                偏差値は実力診断テストの正答率と問題難易度から算出されます。テストを受け直すと更新されます。
              </p>
            </div>
            <button
              onClick={() => setShowModal(false)}
              style={{
                width: '100%', marginTop: 8, padding: '12px',
                borderRadius: 12, border: 'none', cursor: 'pointer',
                background: 'var(--accent, #3B5BDB)', color: '#fff',
                fontSize: 15, fontWeight: 700, fontFamily: 'inherit',
              }}
            >
              閉じる
            </button>
          </div>
        </div>
      )}

      <div className="card" style={{ marginTop: 'var(--s-3)' }}>
        <div className="eyebrow" style={{ marginBottom: 'var(--s-2)' }}>
          コメント
        </div>
        <p style={{ fontSize: 16, lineHeight: 1.7 }}>{rank.comment}</p>
      </div>

      {/* ── おすすめコース ───────────────────────── */}
      {recommendedCourses.length > 0 && (
        <section style={{ marginTop: 'var(--s-4)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 'var(--s-2)' }}>
            <SparklesIcon width={18} height={18} />
            <h2 style={{ fontSize: 20, margin: 0 }}>
              おすすめコース
            </h2>
          </div>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 'var(--s-3)' }}>
            診断結果に基づくあなたに最適なコース
          </p>
          <div className="stack-sm">
            {recommendedCourses.map((c, idx) => (
              <div
                key={c.id}
                className="card card-compact"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  border: idx === 0 ? '1.5px solid var(--brand, #6C8EF5)' : '1px solid var(--border)',
                  background: idx === 0 ? 'rgba(108,142,245,.06)' : undefined,
                }}
              >
                <div style={{
                  width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                  background: 'rgba(108,142,245,.18)',
                  color: '#6C8EF5',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 800, fontSize: 16,
                }}>{idx + 1}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 2 }}>
                    {c.category} · {c.level}
                  </div>
                  <div style={{ fontSize: 15, fontWeight: 700, lineHeight: 1.4 }}>{c.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 4, lineHeight: 1.5 }}>
                    {c.description}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── 個別レッスン推薦 ─────────────────────── */}
      {recommendedLessonIds.length > 0 && (
        <section style={{ marginTop: 'var(--s-4)' }}>
          <h2 style={{ fontSize: 18, marginBottom: 'var(--s-2)' }}>
            まずはこのレッスンから
          </h2>
          <div className="stack-sm">
            {recommendedLessonIds.slice(0, 4).map((id) => {
              const lesson = allLessons[id]
              if (!lesson) return null
              return (
                <button
                  key={id}
                  className="card card-compact"
                  onClick={() => onStartLesson(id)}
                  style={{
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 'var(--s-3)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <span style={{ fontSize: 15, fontWeight: 600, minWidth: 0, flex: 1 }}>
                    {lesson.title}
                  </span>
                  <span className="badge badge-accent" style={{ flexShrink: 0 }}>おすすめ</span>
                </button>
              )
            })}
          </div>
        </section>
      )}

      <Button
        variant="default"
        size="lg"
        block
        onClick={onRetakeTest}
        style={{ marginTop: 'var(--s-4)' }}
      >
        診断を受け直す
      </Button>
    </div>
  )
}
