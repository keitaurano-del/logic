import { useState } from 'react'
import { loadPlacementResult, rankLabel, recommendedLessons } from '../placementData'
import { getAllLessonsFlat } from '../lessonData'
import { ArrowLeftIcon } from '../icons'
import { Button } from '../components/Button'
import { IconButton } from '../components/IconButton'


interface DeviationScreenProps {
  onBack: () => void
  onRetakeTest: () => void
  onStartLesson: (lessonId: number) => void
}

export function DeviationScreen({ onBack, onRetakeTest, onStartLesson }: DeviationScreenProps) {
  const result = loadPlacementResult()
  const [showModal, setShowModal] = useState(false)

  if (!result) {
    return (
      <div className="stack">
        <div className="screen-header">
          <IconButton aria-label="Back" onClick={onBack}>
            <ArrowLeftIcon />
          </IconButton>
          <div className="progress-text">偏差値</div>
        </div>
        <div className="card empty">
          <h3 style={{ fontSize: 20, marginBottom: 'var(--s-2)' }}>
            プレースメントテスト未完了
          </h3>
          <p className="muted" style={{ fontSize: 16 }}>
            テストを受けると偏差値が算出されます
          </p>
          <Button
            variant="primary"
            size="lg"
            onClick={onRetakeTest}
            style={{ marginTop: 'var(--s-4)' }}
          >
            テストを受ける
          </Button>
        </div>
      </div>
    )
  }
  const rank = rankLabel(result.deviation)
  const recommended = recommendedLessons(result.deviation)
  const allLessons = getAllLessonsFlat()
  // バーの幅: 偏差値25〜75を 0%〜100% にマップ
  const fill = Math.min(100, Math.max(0, ((result.deviation - 25) / 50) * 100))

  return (
    <div className="stack">
      <div className="screen-header">
        <IconButton aria-label="Back" onClick={onBack}>
          <ArrowLeftIcon />
        </IconButton>
        <div className="progress-text">偏差値</div>
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
          偏差値スコア
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
                偏差値はプレースメントテストの正答率と問題難易度から算出されます。テストを受け直すと更新されます。
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

      {recommended.length > 0 && (
        <section style={{ marginTop: 'var(--s-4)' }}>
          <h2 style={{ fontSize: 20, marginBottom: 'var(--s-3)' }}>
            おすすめレッスン
          </h2>
          <div className="stack-sm">
            {recommended.map((id) => {
              const lesson = allLessons[id]
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
                  <span style={{ display: 'flex', flexDirection: 'column', gap: 4, minWidth: 0, flex: 1 }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>
                      Lesson #{id}
                    </span>
                    {lesson && (
                      <span style={{ fontSize: 15, fontWeight: 600 }}>
                        {lesson.title}
                      </span>
                    )}
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
        テストを受け直す
      </Button>
    </div>
  )
}
