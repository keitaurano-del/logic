import { useState } from 'react'

type Props = {
  /** 'interactive'（default）= タップで強調 / 'static' = 全部表示 */
  revealMode?: 'interactive' | 'static'
}

/**
 * 共感マップ — 4 象限 (Think&Feel / See / Hear / Say&Do)
 * 中央にユーザーアイコン、4 象限でユーザー視点を整理する
 * lesson-57 step.0 step.visual='EmpathyMapDiagram'
 *
 * interactive モード: 4 象限のうち選択中だけハイライト。
 */
export function EmpathyMapVisual({ revealMode = 'interactive' }: Props = {}) {
  const [active, setActive] = useState<number | null>(revealMode === 'static' ? null : 0)
  const isInteractive = revealMode !== 'static'

  const cellStyle = (idx: number, base: React.CSSProperties): React.CSSProperties => {
    if (!isInteractive || active === null) return base
    const accent =
      active === idx
        ? { boxShadow: '0 0 0 2px var(--brand)', transition: 'box-shadow 0.2s, opacity 0.2s' }
        : { opacity: 0.35, transition: 'box-shadow 0.2s, opacity 0.2s' }
    return { ...base, ...accent }
  }

  const cellProps = (idx: number) => {
    if (!isInteractive) return {}
    return {
      role: 'button' as const,
      tabIndex: 0,
      onClick: () => setActive(idx),
      onKeyDown: (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          setActive(idx)
        }
      },
      'aria-pressed': active === idx,
    }
  }

  return (
    <div>
      <div className="vz-section-label" style={{ marginBottom: 10, textAlign: 'center' }}>
        共感マップ — ユーザーの 4 視点を整理する{isInteractive && '（タップで切り替え）'}
      </div>

      <div className="vz-empathy vz-stagger">
        <div
          className="vz-empathy-cell"
          style={cellStyle(0, { borderTopLeftRadius: 14, cursor: isInteractive ? 'pointer' : undefined })}
          {...cellProps(0)}
        >
          <span className="label">Think &amp; Feel</span>
          <span className="title">頭の中で考えてること</span>
          <span className="body">不安・期待・本音。声に出していない感情も含む</span>
        </div>
        <div
          className="vz-empathy-cell"
          style={cellStyle(1, { borderTopRightRadius: 14, cursor: isInteractive ? 'pointer' : undefined })}
          {...cellProps(1)}
        >
          <span className="label">See</span>
          <span className="title">目に入ってる環境</span>
          <span className="body">職場・SNS・周囲の人・触れる情報源</span>
        </div>
        <div
          className="vz-empathy-cell"
          style={cellStyle(2, { borderBottomLeftRadius: 14, cursor: isInteractive ? 'pointer' : undefined })}
          {...cellProps(2)}
        >
          <span className="label">Hear</span>
          <span className="title">耳に入ってること</span>
          <span className="body">同僚・家族・上司の言葉。影響力のある声</span>
        </div>
        <div
          className="vz-empathy-cell"
          style={cellStyle(3, { borderBottomRightRadius: 14, cursor: isInteractive ? 'pointer' : undefined })}
          {...cellProps(3)}
        >
          <span className="label">Say &amp; Do</span>
          <span className="title">口に出す・実際の行動</span>
          <span className="body">発言・SNS 投稿・購買行動。観察できる証拠</span>
        </div>

        {/* 中央：ユーザー */}
        <div className="vz-empathy-center" aria-label="ユーザー">
          USER
        </div>
      </div>

      <div
        style={{
          marginTop: 12,
          padding: '8px 10px',
          background: 'var(--brand-soft)',
          borderRadius: 8,
          fontSize: 11,
          fontWeight: 600,
          color: 'var(--brand)',
          textAlign: 'center',
        }}
      >
        本人が言葉にしない領域（Think&amp;Feel）こそ最大の発見ポイント
      </div>
    </div>
  )
}
