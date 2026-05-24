/**
 * Jobs to be Done トライアド — 状況 × 動機 × ジョブ の 3 ベン図
 * 3 つの輪が重なる中心が「真のジョブ」
 * lesson-57 step.2 step.visual='JtbdDiagram'
 *
 * Props で内容差し替え可能（lesson データ側 `step.visualProps` で指定）:
 *   sectionLabel?: string                                       — 上部の見出し
 *   situation? / motivation? / job?: { title?, sub? }           — 3 つの円
 *   centerLabel?: string                                        — 中央テキスト
 *   hint?: string                                               — 下部のヒント
 *
 * 未指定フィールドは default 値が使われ、後方互換が保たれる。
 */

export type JtbdCircle = {
  title?: string
  sub?: string
}

export type JtbdProps = {
  sectionLabel?: string
  situation?: JtbdCircle
  motivation?: JtbdCircle
  job?: JtbdCircle
  centerLabel?: string
  hint?: string
}

const DEFAULT_PROPS = {
  sectionLabel: 'Jobs to be Done — 「片づけたい用事」の構造',
  situation: { title: '状況', sub: 'いつ・どこで' },
  motivation: { title: '動機', sub: '感情・期待' },
  job: { title: '期待される成果', sub: '達成したい結果' },
  centerLabel: '真のジョブ',
  hint: '例：「通勤中に集中したい」+「達成感が欲しい」+「5 分で完結」= ジョブ「スキマ学習」',
} as const

export function JtbdVisual(props: JtbdProps = {}) {
  const merged = {
    sectionLabel: props.sectionLabel ?? DEFAULT_PROPS.sectionLabel,
    situation: { ...DEFAULT_PROPS.situation, ...(props.situation ?? {}) },
    motivation: { ...DEFAULT_PROPS.motivation, ...(props.motivation ?? {}) },
    job: { ...DEFAULT_PROPS.job, ...(props.job ?? {}) },
    centerLabel: props.centerLabel ?? DEFAULT_PROPS.centerLabel,
    hint: props.hint ?? DEFAULT_PROPS.hint,
  }
  const { sectionLabel, situation, motivation, job, centerLabel, hint } = merged

  return (
    <div>
      <div className="vz-section-label" style={{ marginBottom: 10, textAlign: 'center' }}>
        {sectionLabel}
      </div>

      <div className="vz-jtbd vz-stagger">
        <div className="vz-jtbd-circle situation">
          {situation.title}
          {situation.sub ? (
            <>
              <br />
              <span style={{ fontSize: 9, fontWeight: 600, opacity: 0.9 }}>{situation.sub}</span>
            </>
          ) : null}
        </div>
        <div className="vz-jtbd-circle motivation">
          {motivation.title}
          {motivation.sub ? (
            <>
              <br />
              <span style={{ fontSize: 9, fontWeight: 600, opacity: 0.9 }}>{motivation.sub}</span>
            </>
          ) : null}
        </div>
        <div className="vz-jtbd-circle job">
          {job.title}
          {job.sub ? (
            <>
              <br />
              <span style={{ fontSize: 9, fontWeight: 600, opacity: 0.9 }}>{job.sub}</span>
            </>
          ) : null}
        </div>

        <div className="vz-jtbd-center">{centerLabel}</div>
      </div>

      {hint ? (
        <div style={{
          marginTop: 12,
          padding: '8px 10px',
          background: 'var(--brand-soft)',
          borderRadius: 8,
          fontSize: 11,
          fontWeight: 600,
          color: 'var(--brand)',
          textAlign: 'center',
        }}>
          {hint}
        </div>
      ) : null}
    </div>
  )
}
