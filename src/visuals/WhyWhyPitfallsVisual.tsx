import './visuals-whywhy.css'
import { UserIcon, ZapIcon, CloudIcon, XIcon, CheckIcon } from '../icons'
import type { ComponentType, SVGProps } from 'react'

type IconType = ComponentType<SVGProps<SVGSVGElement> & { width?: number; height?: number }>

type Pitfall = {
  Icon: IconType
  title: string
  bad: string
  good: string
}

const pitfalls: Pitfall[] = [
  {
    Icon: UserIcon,
    title: '人で止める',
    bad: '「Aさんが不注意」',
    good: '「気づける仕組みがない」',
  },
  {
    Icon: ZapIcon,
    title: '飛躍する',
    bad: '売上↓ → 意欲↓（途中省略）',
    good: '間の層を埋めて1段ずつ',
  },
  {
    Icon: CloudIcon,
    title: '抽象化しすぎ',
    bad: '「コミュニケーション不足」',
    good: '「定例が四半期1回のみ」',
  },
]

/**
 * なぜなぜ分析の3つの落とし穴
 * lesson-343 step.visual='WhyWhyPitfallsDiagram'
 *
 * A 案 Phase 3 適用済 (2026-05-24, §3.1 §2.4 準拠):
 *   - inline hint 11→13, padding/lineHeight 拡大
 *   - CSS: pitfall は既に 13/14px で底上げ済、調整なし
 *   - warm accent: vz-ww-pitfall-icon (head アイコン) を terracotta に
 *     (落とし穴の象徴アイコン = 注意喚起の動き起点 = 1 visual 内 1 箇所)
 */
export function WhyWhyPitfallsVisual() {
  return (
    <div className="vz-stagger">
      <div className="vz-section-label" style={{ marginBottom: 10 }}>
        3つの落とし穴
      </div>

      <div className="vz-ww-pitfalls">
        {pitfalls.map(({ Icon, title, bad, good }, i) => (
          <div key={i} className="vz-ww-pitfall">
            <div className="vz-ww-pitfall-head">
              <Icon className="vz-ww-pitfall-icon" width={18} height={18} />
              <span className="vz-ww-pitfall-title">{title}</span>
            </div>
            <div className="vz-ww-pitfall-row bad">
              <span className="vz-ww-pitfall-tag" aria-label="bad">
                <XIcon width={12} height={12} />
              </span>
              <span>{bad}</span>
            </div>
            <div className="vz-ww-pitfall-row good">
              <span className="vz-ww-pitfall-tag" aria-label="good">
                <CheckIcon width={12} height={12} />
              </span>
              <span>{good}</span>
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          marginTop: 14,
          padding: '10px 12px',
          background: 'var(--brand-soft)',
          borderRadius: 8,
          fontSize: '0.8667rem',
          fontWeight: 600,
          color: 'var(--brand)',
          textAlign: 'center',
          lineHeight: 1.45,
        }}
      >
        💡 人ではなく仕組み、飛躍させず1段ずつ、具体的に
      </div>
    </div>
  )
}
