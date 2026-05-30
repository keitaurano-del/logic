import { useState } from 'react'

/**
 * 共感マップ — 4 象限 (Think&Feel / See / Hear / Say&Do)
 * 中央にユーザーアイコン、4 象限でユーザー視点を整理する
 * lesson-57 step.0 step.visual='EmpathyMapDiagram'
 *
 * interactive モード: 4 象限のうち選択中だけハイライト。
 *
 * Props で内容差し替え可能（lesson データ側 `step.visualProps` で指定）:
 *   sectionLabel?: string                           — 上部の見出し
 *   thinkFeel? / see? / hear? / sayDo?: Quadrant    — 4 象限 (label / title / body)
 *   centerLabel?: string                            — 中央の表示 (default 'USER')
 *   hint?: string                                   — 下部のヒント
 *   revealMode?: 'interactive' | 'static'
 *
 * 未指定フィールドは default 値が使われ、後方互換が保たれる。
 */

export type EmpathyQuadrant = {
  label?: string
  title?: string
  body?: string
}

export type EmpathyMapProps = {
  /** 'interactive'（default）= タップで強調 / 'static' = 全部表示 */
  revealMode?: 'interactive' | 'static'
  sectionLabel?: string
  thinkFeel?: EmpathyQuadrant
  see?: EmpathyQuadrant
  hear?: EmpathyQuadrant
  sayDo?: EmpathyQuadrant
  centerLabel?: string
  hint?: string
}

const DEFAULT_PROPS = {
  sectionLabel: '共感マップ — ユーザーの 4 視点を整理する',
  thinkFeel: {
    label: 'Think & Feel',
    title: '頭の中で考えてること',
    body: '不安・期待・本音。声に出していない感情も含む',
  },
  see: {
    label: 'See',
    title: '目に入ってる環境',
    body: '職場・SNS・周囲の人・触れる情報源',
  },
  hear: {
    label: 'Hear',
    title: '耳に入ってること',
    body: '同僚・家族・上司の言葉。影響力のある声',
  },
  sayDo: {
    label: 'Say & Do',
    title: '口に出す・実際の行動',
    body: '発言・SNS 投稿・購買行動。観察できる証拠',
  },
  centerLabel: 'USER',
  hint: '本人が言葉にしない領域（Think&Feel）こそ最大の発見ポイント',
} as const

export function EmpathyMapVisual(props: EmpathyMapProps = {}) {
  const { revealMode = 'interactive' } = props
  const merged = {
    sectionLabel: props.sectionLabel ?? DEFAULT_PROPS.sectionLabel,
    thinkFeel: { ...DEFAULT_PROPS.thinkFeel, ...(props.thinkFeel ?? {}) },
    see: { ...DEFAULT_PROPS.see, ...(props.see ?? {}) },
    hear: { ...DEFAULT_PROPS.hear, ...(props.hear ?? {}) },
    sayDo: { ...DEFAULT_PROPS.sayDo, ...(props.sayDo ?? {}) },
    centerLabel: props.centerLabel ?? DEFAULT_PROPS.centerLabel,
    hint: props.hint ?? DEFAULT_PROPS.hint,
  }
  const { sectionLabel, thinkFeel, see, hear, sayDo, centerLabel, hint } = merged

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
        {sectionLabel}{isInteractive && '（タップで切り替え）'}
      </div>

      <div className="vz-empathy vz-stagger">
        <div
          className="vz-empathy-cell"
          style={cellStyle(0, { borderTopLeftRadius: 14, cursor: isInteractive ? 'pointer' : undefined })}
          {...cellProps(0)}
        >
          <span className="label">{thinkFeel.label}</span>
          <span className="title">{thinkFeel.title}</span>
          <span className="body">{thinkFeel.body}</span>
        </div>
        <div
          className="vz-empathy-cell"
          style={cellStyle(1, { borderTopRightRadius: 14, cursor: isInteractive ? 'pointer' : undefined })}
          {...cellProps(1)}
        >
          <span className="label">{see.label}</span>
          <span className="title">{see.title}</span>
          <span className="body">{see.body}</span>
        </div>
        <div
          className="vz-empathy-cell"
          style={cellStyle(2, { borderBottomLeftRadius: 14, cursor: isInteractive ? 'pointer' : undefined })}
          {...cellProps(2)}
        >
          <span className="label">{hear.label}</span>
          <span className="title">{hear.title}</span>
          <span className="body">{hear.body}</span>
        </div>
        <div
          className="vz-empathy-cell"
          style={cellStyle(3, { borderBottomRightRadius: 14, cursor: isInteractive ? 'pointer' : undefined })}
          {...cellProps(3)}
        >
          <span className="label">{sayDo.label}</span>
          <span className="title">{sayDo.title}</span>
          <span className="body">{sayDo.body}</span>
        </div>

        {/* 中央：ユーザー */}
        <div className="vz-empathy-center" aria-label="ユーザー">
          {centerLabel}
        </div>
      </div>

      {hint ? (
        <div
          style={{
            marginTop: 12,
            padding: '8px 10px',
            background: 'var(--brand-soft)',
            borderRadius: 8,
            fontSize: '0.7333rem',
            fontWeight: 600,
            color: 'var(--brand)',
            textAlign: 'center',
          }}
        >
          {hint}
        </div>
      ) : null}
    </div>
  )
}
