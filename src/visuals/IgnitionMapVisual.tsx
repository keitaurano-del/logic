import './visuals-phase2.css'
import { useStepReveal } from './hooks/useStepReveal'

/**
 * IgnitionMapVisual — 発火条件マップ（ADHD コース lesson-801 用）
 *
 * 構造化リスニングと同じ「2 週間ログ」を視覚化する補助図。
 * 横軸: 時間帯 (Morning / Noon / Evening / Night)
 * 縦軸: 環境変数 (Place / Sound / Task)
 * セルの色: 過集中の起きやすさを 3 階調で表現
 *   - 'hot'  = 過集中が来やすい（強み発火ゾーン）
 *   - 'mild' = 普通 / どちらでもない
 *   - 'cold' = 集中が壊れやすい（避けるゾーン）
 *
 * トーン: 矯正・治療ではなく「自分専用の処方箋を作るための材料集め」を示す
 * 図。ADHD 特性を肯定的に扱うコースの方針に従い、HOT セルにポジティブな
 * 短文ラベルを置く。
 */

export type IgnitionCellLevel = 'hot' | 'mild' | 'cold'

export type IgnitionCell = {
  /** 任意の短文ラベル。空文字で「-」相当 */
  label?: string
  level: IgnitionCellLevel
}

export type IgnitionMapProps = {
  sectionLabel?: string
  /** 横軸: 時間帯（4 つ固定） */
  timeSlots?: [string, string, string, string]
  /** 縦軸: 環境変数（3 つ固定） */
  envRows?: [string, string, string]
  /**
   * 各セル — envRows × timeSlots の 3 行 × 4 列。
   * `cells[rowIndex][colIndex]` でアクセス。
   */
  cells?: [
    [IgnitionCell, IgnitionCell, IgnitionCell, IgnitionCell],
    [IgnitionCell, IgnitionCell, IgnitionCell, IgnitionCell],
    [IgnitionCell, IgnitionCell, IgnitionCell, IgnitionCell],
  ]
  hint?: string
  /** 'interactive'（default）= 行ごと段階表示 / 'static' = 全表示 */
  revealMode?: 'interactive' | 'static'
}

const DEFAULT_TIME: [string, string, string, string] = ['朝', '昼', '夕', '夜']
const DEFAULT_ENV: [string, string, string] = ['場所', '音', 'タスク']

const DEFAULT_CELLS: IgnitionMapProps['cells'] = [
  // 場所 (row 0)
  [
    { level: 'hot', label: '自宅デスク' },
    { level: 'mild', label: 'カフェ' },
    { level: 'mild' },
    { level: 'cold', label: 'オフィス' },
  ],
  // 音 (row 1)
  [
    { level: 'mild', label: '無音' },
    { level: 'hot', label: 'ホワイトノイズ' },
    { level: 'cold', label: '人の話し声' },
    { level: 'hot', label: '環境音' },
  ],
  // タスク種別 (row 2)
  [
    { level: 'hot', label: '興味あり' },
    { level: 'mild', label: '新規' },
    { level: 'cold', label: 'ルーチン' },
    { level: 'hot', label: '締切間近' },
  ],
]

function cellStyle(level: IgnitionCellLevel): React.CSSProperties {
  // tokens.css の var を直接使い、3 階調で表現する
  const palette: Record<IgnitionCellLevel, { bg: string; border: string; fg: string }> = {
    hot: {
      // 過集中ゾーン: brand-soft をベースに、border は brand
      bg: 'var(--brand-soft)',
      border: 'var(--brand)',
      fg: 'var(--brand)',
    },
    mild: {
      bg: 'var(--bg-card)',
      border: 'var(--border)',
      fg: 'var(--text-secondary)',
    },
    cold: {
      // 壊れやすいゾーン: accent-soft をやや薄めに、border は accent
      bg: 'var(--accent-soft)',
      border: 'var(--accent)',
      fg: 'var(--accent-dark)',
    },
  }
  const c = palette[level]
  return {
    background: c.bg,
    border: `1.5px solid ${c.border}`,
    color: c.fg,
    borderRadius: 8,
    padding: '8px 6px',
    fontSize: 11,
    fontWeight: 600,
    textAlign: 'center',
    lineHeight: 1.3,
    minHeight: 48,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  }
}

function legendDot(level: IgnitionCellLevel): React.CSSProperties {
  const palette: Record<IgnitionCellLevel, string> = {
    hot: 'var(--brand)',
    mild: 'var(--border)',
    cold: 'var(--accent)',
  }
  return {
    display: 'inline-block',
    width: 10,
    height: 10,
    borderRadius: 3,
    background: palette[level],
    marginRight: 4,
    verticalAlign: 'middle',
  }
}

export function IgnitionMapVisual(props: IgnitionMapProps = {}) {
  const {
    sectionLabel = '発火条件マップ — 自分の過集中ゾーンを見つける',
    timeSlots = DEFAULT_TIME,
    envRows = DEFAULT_ENV,
    cells = DEFAULT_CELLS!,
    hint = '2 週間ログを取ると、自分専用の "過集中ゾーン" が浮かび上がる',
    revealMode = 'interactive',
  } = props

  const { step, isLast, controls } = useStepReveal({ totalSteps: envRows.length, mode: revealMode })

  return (
    <div className="vz-stagger">
      <div className="vz-section-label" style={{ marginBottom: 10 }}>
        {sectionLabel}
      </div>

      <div
        role="table"
        aria-label="発火条件マップ"
        style={{
          display: 'grid',
          gridTemplateColumns: '52px repeat(4, 1fr)',
          gap: 6,
          width: '100%',
        }}
      >
        {/* ヘッダー行 (時間帯) */}
        <div />
        {timeSlots.map((t) => (
          <div
            key={`head-${t}`}
            style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: '0.05em',
              color: 'var(--text-muted)',
              textAlign: 'center',
              textTransform: 'uppercase',
              padding: '2px 0',
            }}
          >
            {t}
          </div>
        ))}

        {/* 各 env 行 */}
        {envRows.map((envLabel, rIdx) => {
          const visible = rIdx < step
          return (
            <div key={`row-${envLabel}`} style={{ display: 'contents' }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  textAlign: 'right',
                  alignSelf: 'center',
                  paddingRight: 4,
                  opacity: visible ? 1 : 0.25,
                  transition: 'opacity 0.25s',
                }}
              >
                {envLabel}
              </div>
              {cells[rIdx].map((cell, cIdx) =>
                visible ? (
                  <div key={`cell-${rIdx}-${cIdx}`} style={cellStyle(cell.level)}>
                    {cell.label || '·'}
                  </div>
                ) : (
                  <div
                    key={`cell-${rIdx}-${cIdx}`}
                    style={{
                      background: 'var(--bg-card)',
                      border: '1px dashed var(--border)',
                      borderRadius: 8,
                      minHeight: 48,
                    }}
                  />
                )
              )}
            </div>
          )
        })}
      </div>

      {/* 凡例 */}
      <div
        style={{
          marginTop: 12,
          display: 'flex',
          gap: 14,
          justifyContent: 'center',
          fontSize: 11,
          color: 'var(--text-secondary)',
        }}
      >
        <span>
          <span style={legendDot('hot')} />
          過集中が来やすい
        </span>
        <span>
          <span style={legendDot('mild')} />
          普通
        </span>
        <span>
          <span style={legendDot('cold')} />
          壊れやすい
        </span>
      </div>

      {controls}

      {hint && isLast ? (
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
          💡 {hint}
        </div>
      ) : null}
    </div>
  )
}
