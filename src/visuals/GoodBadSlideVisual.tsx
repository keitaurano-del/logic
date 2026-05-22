import './visuals-docs.css'

/**
 * GoodBadSlideVisual — 「1 スライド 1 メッセージ」の良い例 vs 悪い例
 * lesson-721 step.0 で利用
 *
 * 左：良いスライド（明確なタイトル、1 メッセージ、十分な余白、コーラル系の控えめなアンダーライン）
 * 右：悪いスライド（曖昧な名詞止めタイトル、複数主張の bullet 羅列、色多すぎ）
 *
 * 画像不要・HTML/CSS のみで構成。
 */

export type GoodBadSlideProps = {
  sectionLabel?: string
  good?: {
    title?: string
    keyMessage?: string
    points?: string[]
  }
  bad?: {
    title?: string
    clutter?: string[]
    points?: string[]
  }
}

const DEFAULT_PROPS: Required<GoodBadSlideProps> = {
  sectionLabel: '1 スライド 1 メッセージの威力',
  good: {
    title: '当社 EC は 30 代女性で前年比 145%',
    keyMessage: '主力ターゲットは 30 代女性',
    points: [
      '主語と動詞と数字を含む断定タイトル',
      '本文は結論を支える 1 つのグラフだけ',
      '色は 3 色まで（ベース / メイン / 強調）',
    ],
  },
  bad: {
    title: '売上動向・顧客分析・今後の戦略について',
    clutter: [
      '・売上前年比 +12%',
      '・新規顧客 1,240 件',
      '・既存顧客 LTV 上昇',
      '・在庫回転日数の改善',
      '・物流コスト最適化案',
      '・採用計画も並行で検討',
      '・SNS フォロワー +28%',
    ],
    points: [
      'タイトルが名詞止めで主張が不明',
      '複数論点を 1 枚に詰め込んでいる',
      '色 6 色以上で視線が散る',
    ],
  },
}

export function GoodBadSlideVisual(props: GoodBadSlideProps = {}) {
  const merged = {
    sectionLabel: props.sectionLabel ?? DEFAULT_PROPS.sectionLabel,
    good: { ...DEFAULT_PROPS.good, ...(props.good ?? {}) },
    bad: { ...DEFAULT_PROPS.bad, ...(props.bad ?? {}) },
  }
  const { sectionLabel, good, bad } = merged

  return (
    <div className="vz-stagger">
      <div className="vz-section-label" style={{ marginBottom: 10 }}>
        {sectionLabel}
      </div>

      <div className="vz-gbs-wrap">
        {/* GOOD */}
        <div className="vz-gbs-col">
          <span className="vz-gbs-head good">◯ Good</span>
          <div className="vz-gbs-card good">
            <div className="vz-gbs-mini-title">{good.title}</div>
            <div className="vz-gbs-key">{good.keyMessage}</div>
            <div className="vz-gbs-points">
              {(good.points ?? []).map((p, i) => (
                <div className="vz-gbs-points-item" key={i}>
                  <span className="vz-gbs-points-mark">◯</span>
                  <span>{p}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* BAD */}
        <div className="vz-gbs-col">
          <span className="vz-gbs-head bad">✗ Bad</span>
          <div className="vz-gbs-card bad">
            <div className="vz-gbs-mini-title">{bad.title}</div>
            <div className="vz-gbs-clutter">
              {(bad.clutter ?? []).map((c, i) => (
                <span className="vz-gbs-clutter-bullet" key={i}>
                  {c}
                </span>
              ))}
              <div className="vz-gbs-clutter-colors" aria-hidden="true">
                <span className="vz-gbs-color-chip c1" />
                <span className="vz-gbs-color-chip c2" />
                <span className="vz-gbs-color-chip c3" />
                <span className="vz-gbs-color-chip c4" />
                <span className="vz-gbs-color-chip c5" />
                <span className="vz-gbs-color-chip c6" />
                <span className="vz-gbs-color-chip c7" />
              </div>
            </div>
            <div className="vz-gbs-points">
              {(bad.points ?? []).map((p, i) => (
                <div className="vz-gbs-points-item" key={i}>
                  <span className="vz-gbs-points-mark">✗</span>
                  <span>{p}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
