import { useState } from 'react'
import './visuals-fermi.css'

/**
 * フェルミ 6 パターン早見表 — 2×3 マトリクス
 * lesson-210 step.visual='FermiPatternMatrixDiagram'
 *
 * A 案適用 (2026-05-24, §3.1 §2.4 準拠):
 *   - cell num 15→16, title 13→14, formula 10→12 など CSS 側で底上げ
 *   - warm accent: 詳細パネルの detail-num (アクティブセルの番号) を terracotta に格上げ
 *     （選択されたパターン = 動きの起点 = 1 visual 内 1 箇所アクセント）
 *
 * 構図:
 *   - 横軸=計算の起点（需要側 / 供給側 / 検算）
 *   - 縦軸=単位（個人＆世帯ベース / 法人＆面積ベース）
 *   - 計6セル：① 個人/世帯  ② 法人  ③ 面積  ④ ユニット  ⑤ マクロ売上  ⑥ ミクロ売上
 *
 * インタラクション:
 *   - セルタップで該当パターンをハイライト＋詳細パネルを下に出す
 *   - revealMode='static' は全セル＋詳細を表示せず、シンプルな一覧モード
 */

type Pattern = {
  id: string
  /** カテゴリ番号 */
  num: string
  /** パターン名 */
  title: string
  /** 起点ラベル */
  axis: '個人 / 世帯' | '法人' | '面積' | 'ユニット' | 'マクロ売上' | 'ミクロ売上'
  /** 代表例 */
  example: string
  /** 計算式の骨格 */
  formula: string
  /** ヒント・補足 */
  hint?: string
}

const PATTERNS: Pattern[] = [
  {
    id: 'p1',
    num: '①',
    title: '個人 / 世帯ベース',
    axis: '個人 / 世帯',
    example: '家庭用炊飯器の市場規模',
    formula: '世帯数 × 保有率 × 買替頻度 × 単価',
    hint: '生活財・家電・住居系はだいたいこれ。',
  },
  {
    id: 'p2',
    num: '②',
    title: '法人ベース',
    axis: '法人',
    example: 'オフィスコピー機の市場規模',
    formula: '企業数 × 導入率 × 平均台数 × 単価',
    hint: 'BtoB の業務機器・SaaS・備品系で使う。',
  },
  {
    id: 'p3',
    num: '③',
    title: '面積ベース',
    axis: '面積',
    example: 'ガソリンスタンドの店舗数',
    formula: '国土・商圏面積 ÷ 1 店舗あたり面積',
    hint: '地理的に密度が決まるサービスで使う。',
  },
  {
    id: 'p4',
    num: '④',
    title: 'ユニットベース',
    axis: 'ユニット',
    example: 'タクシー業界の市場規模',
    formula: '稼働台数 × 稼働時間 × 時間あたり売上',
    hint: '車両・機械・施設など稼働単位で見るやつ。',
  },
  {
    id: 'p5',
    num: '⑤',
    title: 'マクロ売上型',
    axis: 'マクロ売上',
    example: '国内ピザ宅配市場',
    formula: '人口 × 利用率 × 注文頻度 × 客単価',
    hint: '需要側から積み上げる「教科書」フェルミ。',
  },
  {
    id: 'p6',
    num: '⑥',
    title: 'ミクロ売上型',
    axis: 'ミクロ売上',
    example: '街のラーメン屋 1 店舗の年商',
    formula: '客席 × 回転 × 客単価 × 営業日',
    hint: '1 店舗・1 単位の積分で全体を推定する。',
  },
]

type Props = {
  revealMode?: 'interactive' | 'static'
}

export function FermiPatternMatrixVisual({ revealMode = 'interactive' }: Props = {}) {
  const isInteractive = revealMode !== 'static'
  const [activeId, setActiveId] = useState<string>(PATTERNS[0].id)

  const stop = (e: React.SyntheticEvent) => e.stopPropagation()

  const active = isInteractive ? PATTERNS.find((p) => p.id === activeId) : null

  return (
    <div
      className="vz-fermi-pm vz-stagger"
      onTouchStart={stop}
      onTouchMove={stop}
      onTouchEnd={stop}
      onPointerDown={stop}
    >
      <div className="vz-section-label" style={{ marginBottom: 8 }}>
        フェルミ 6 パターン早見表
      </div>

      <div className="vz-fermi-pm-grid">
        {PATTERNS.map((p) => {
          const isActive = isInteractive && p.id === activeId
          return (
            <button
              key={p.id}
              type="button"
              className={`vz-fermi-pm-cell${isActive ? ' is-active' : ''}${
                isInteractive && active && !isActive ? ' is-muted' : ''
              }`}
              onClick={(e) => {
                e.stopPropagation()
                if (isInteractive) setActiveId(p.id)
              }}
              aria-pressed={isActive}
              disabled={!isInteractive}
            >
              <div className="vz-fermi-pm-num">{p.num}</div>
              <div className="vz-fermi-pm-title">{p.title}</div>
              <div className="vz-fermi-pm-formula">{p.formula}</div>
            </button>
          )
        })}
      </div>

      {active && (
        <div className="vz-fermi-pm-detail" aria-live="polite">
          <div className="vz-fermi-pm-detail-head">
            <span className="vz-fermi-pm-detail-num">{active.num}</span>
            <span className="vz-fermi-pm-detail-title">{active.title}</span>
          </div>
          <div className="vz-fermi-pm-detail-row">
            <span className="vz-fermi-pm-detail-label">代表例</span>
            <span className="vz-fermi-pm-detail-value">{active.example}</span>
          </div>
          <div className="vz-fermi-pm-detail-row">
            <span className="vz-fermi-pm-detail-label">骨格式</span>
            <span className="vz-fermi-pm-detail-value mono">{active.formula}</span>
          </div>
          {active.hint && <div className="vz-fermi-pm-detail-hint">{active.hint}</div>}
        </div>
      )}

      {!isInteractive && (
        <div className="vz-fermi-pm-hint">
          6 パターンを覚えれば、ほぼ全ての推定問題はどれかに当てはまります。
        </div>
      )}
    </div>
  )
}
