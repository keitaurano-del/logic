import type { CSSProperties } from 'react'

export type RadarAxis = {
  key: string
  label: string
  level: 1 | 2 | 3 | 4 | 5
}

interface RadarChartProps {
  axes: RadarAxis[]
  size?: number
  maxLevel?: number
  fillColor?: string
  strokeColor?: string
  gridColor?: string
  labelColor?: string
  style?: CSSProperties
}

/**
 * 5段階スケールのレーダーチャート（SVG）
 * - axes: 5軸推奨（3〜8軸まで対応）
 * - level: 各軸の現在値（1〜5）
 */
export function RadarChart({
  axes,
  size = 280,
  maxLevel = 5,
  fillColor = 'rgba(108,142,245,.32)',
  strokeColor = '#6C8EF5',
  gridColor = 'rgba(255,255,255,.18)',
  labelColor = '#E8ECF4',
  style,
}: RadarChartProps) {
  const cx = size / 2
  const cy = size / 2
  const radius = (size / 2) * 0.7
  const n = axes.length
  const angleStep = (Math.PI * 2) / n

  // 各軸の角度（上から時計回りで開始）
  const angleOf = (i: number) => -Math.PI / 2 + i * angleStep

  // グリッド（同心多角形）
  const gridLevels = Array.from({ length: maxLevel }, (_, i) => i + 1)

  // データポリゴン
  const dataPoints = axes
    .map((a, i) => {
      const r = (a.level / maxLevel) * radius
      const x = cx + r * Math.cos(angleOf(i))
      const y = cy + r * Math.sin(angleOf(i))
      return `${x.toFixed(2)},${y.toFixed(2)}`
    })
    .join(' ')

  return (
    <svg
      viewBox={`0 0 ${size} ${size}`}
      width="100%"
      style={{ display: 'block', maxWidth: size, margin: '0 auto', ...style }}
      aria-label="Skill radar chart"
      role="img"
    >
      {/* グリッド: 同心多角形 */}
      {gridLevels.map((lv) => {
        const r = (lv / maxLevel) * radius
        const points = Array.from({ length: n }, (_, i) => {
          const x = cx + r * Math.cos(angleOf(i))
          const y = cy + r * Math.sin(angleOf(i))
          return `${x.toFixed(2)},${y.toFixed(2)}`
        }).join(' ')
        return (
          <polygon
            key={lv}
            points={points}
            fill="none"
            stroke={gridColor}
            strokeWidth={lv === maxLevel ? 1.4 : 0.8}
            opacity={lv === maxLevel ? 0.9 : 0.5}
          />
        )
      })}

      {/* 軸線 */}
      {axes.map((_, i) => {
        const x = cx + radius * Math.cos(angleOf(i))
        const y = cy + radius * Math.sin(angleOf(i))
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={x.toFixed(2)}
            y2={y.toFixed(2)}
            stroke={gridColor}
            strokeWidth={0.8}
            opacity={0.4}
          />
        )
      })}

      {/* データ領域 */}
      <polygon
        points={dataPoints}
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth={2}
        strokeLinejoin="round"
      />

      {/* データ点 */}
      {axes.map((a, i) => {
        const r = (a.level / maxLevel) * radius
        const x = cx + r * Math.cos(angleOf(i))
        const y = cy + r * Math.sin(angleOf(i))
        return (
          <circle
            key={a.key}
            cx={x.toFixed(2)}
            cy={y.toFixed(2)}
            r={4}
            fill={strokeColor}
            stroke="#fff"
            strokeWidth={1.5}
          />
        )
      })}

      {/* ラベル */}
      {axes.map((a, i) => {
        const labelDist = radius + 22
        const x = cx + labelDist * Math.cos(angleOf(i))
        const y = cy + labelDist * Math.sin(angleOf(i))
        const cos = Math.cos(angleOf(i))
        const anchor: 'start' | 'middle' | 'end' =
          Math.abs(cos) < 0.2 ? 'middle' : cos > 0 ? 'start' : 'end'
        return (
          <g key={`label-${a.key}`}>
            <text
              x={x.toFixed(2)}
              y={y.toFixed(2)}
              textAnchor={anchor}
              dominantBaseline="middle"
              fontSize={12}
              fontWeight={700}
              fill={labelColor}
              style={{ letterSpacing: '0.02em' }}
            >
              {a.label}
            </text>
            <text
              x={x.toFixed(2)}
              y={(y + 14).toFixed(2)}
              textAnchor={anchor}
              dominantBaseline="middle"
              fontSize={10}
              fontWeight={600}
              fill={strokeColor}
              opacity={0.85}
            >
              Lv.{a.level}
            </text>
          </g>
        )
      })}
    </svg>
  )
}
