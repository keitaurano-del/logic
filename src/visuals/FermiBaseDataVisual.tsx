import { useState } from 'react'
import './visuals-fermi.css'

/**
 * フェルミ前提データ 30 — カテゴリ別インフォグラフィック
 * lesson-205 step.visual='FermiBaseDataDiagram'
 *
 * 構図:
 *   - 6 カテゴリ × 5 数字 = 30 件を、カテゴリチップで切り替えるタブ式グリッドに整理
 *   - 各カテゴリは色違いのアクセントを持ち、本文は数字を大きく + キーワードを下に
 *   - スマホ全画面で 1 カテゴリ 5 枚を 1 画面で見渡せるよう 1 列にまとめる
 *
 * インタラクション:
 *   - カテゴリチップタップで該当カテゴリの 5 件カードを差し替え表示
 *   - 「全部見る」モード（revealMode='static'）では 6 カテゴリ全件を縦に並べる
 *
 * design rationale:
 *   - 数字暗記モノは「読みやすさ > 派手さ」。フォントは大きめ・行間は広く
 *   - カテゴリは color-coded だがいずれもブランド系トーン内（accent カラーは使用しない）
 */

type Entry = {
  /** 例: 「日本の人口」 */
  label: string
  /** 例: 「1.24億」 */
  value: string
  /** 例: 「人」「兆円」 */
  unit?: string
  /** 補足キーワード（任意） */
  note?: string
}

type Category = {
  id: string
  /** カテゴリ表示名 */
  title: string
  /** カテゴリの一言サマリ（チップ非選択時のヒント） */
  summary: string
  /** アクセント用 CSS 変数（vz-fermi-bd-card に inline で渡す） */
  tone: 'brand' | 'success' | 'warning' | 'indigo' | 'teal' | 'plum'
  entries: Entry[]
}

const CATEGORIES: Category[] = [
  {
    id: 'pop',
    title: '人口',
    summary: '国・都市・出生死亡',
    tone: 'brand',
    entries: [
      { label: '日本の人口', value: '1.24', unit: '億人' },
      { label: '東京都', value: '1,400', unit: '万人' },
      { label: '世界人口', value: '80', unit: '億人' },
      { label: '出生数 / 年', value: '70', unit: '万人' },
      { label: '死亡数 / 年', value: '160', unit: '万人' },
    ],
  },
  {
    id: 'household',
    title: '世帯',
    summary: '世帯数・平均人数・構成',
    tone: 'teal',
    entries: [
      { label: '日本の世帯数', value: '5,700', unit: '万世帯' },
      { label: '平均世帯人数', value: '2.17', unit: '人' },
      { label: '単身世帯', value: '38', unit: '%' },
      { label: '夫婦のみ', value: '24', unit: '%' },
      { label: '子ありの世帯', value: '27', unit: '%' },
    ],
  },
  {
    id: 'labor',
    title: '労働',
    summary: '労働力・年収・雇用指標',
    tone: 'indigo',
    entries: [
      { label: '労働力人口', value: '6,900', unit: '万人' },
      { label: 'ホワイトカラー', value: '3,500', unit: '万人' },
      { label: '平均年収', value: '460', unit: '万円' },
      { label: '有効求人倍率', value: '1.3', unit: '倍' },
      { label: '失業率', value: '2.5', unit: '%' },
    ],
  },
  {
    id: 'economy',
    title: '経済',
    summary: 'GDP・予算・家計・広告',
    tone: 'plum',
    entries: [
      { label: 'GDP', value: '600', unit: '兆円' },
      { label: '国家予算', value: '110', unit: '兆円' },
      { label: '家計消費', value: '300', unit: '兆円' },
      { label: '広告費', value: '7', unit: '兆円' },
      { label: '貿易額', value: '200', unit: '兆円' },
    ],
  },
  {
    id: 'infra',
    title: 'インフラ',
    summary: '国土・市区町村・施設密度',
    tone: 'success',
    entries: [
      { label: '国土面積', value: '38', unit: '万 km²' },
      { label: '平地比率', value: '30', unit: '%' },
      { label: '市区町村数', value: '1,700', unit: '自治体' },
      { label: '駅の数', value: '9,500', unit: '駅' },
      { label: '自販機', value: '400', unit: '万台' },
    ],
  },
  {
    id: 'industry',
    title: '業界規模',
    summary: '主要業界の市場サイズ',
    tone: 'warning',
    entries: [
      { label: '自動車', value: '60', unit: '兆円' },
      { label: '小売', value: '155', unit: '兆円' },
      { label: '外食', value: '25', unit: '兆円' },
      { label: 'EC', value: '25', unit: '兆円' },
      { label: 'コンビニ', value: '12', unit: '兆円' },
    ],
  },
]

type Props = {
  /** 'interactive'（default）= タブで切替 / 'static' = 全カテゴリ表示 */
  revealMode?: 'interactive' | 'static'
}

export function FermiBaseDataVisual({ revealMode = 'interactive' }: Props = {}) {
  const [activeId, setActiveId] = useState<string>(CATEGORIES[0].id)
  const isInteractive = revealMode !== 'static'
  const visibleCategories = isInteractive
    ? CATEGORIES.filter((c) => c.id === activeId)
    : CATEGORIES

  const stop = (e: React.SyntheticEvent) => e.stopPropagation()

  return (
    <div
      className="vz-fermi-bd vz-stagger"
      onTouchStart={stop}
      onTouchMove={stop}
      onTouchEnd={stop}
      onPointerDown={stop}
    >
      <div className="vz-section-label" style={{ marginBottom: 8 }}>
        これだけ覚えれば足りる前提データ 30
      </div>

      {isInteractive && (
        <div
          className="vz-fermi-bd-tabs"
          role="tablist"
          aria-label="カテゴリ"
          onPointerDown={stop}
          onTouchStart={stop}
        >
          {CATEGORIES.map((c) => {
            const isActive = c.id === activeId
            return (
              <button
                key={c.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`vz-fermi-bd-tab tone-${c.tone}${isActive ? ' is-active' : ''}`}
                onClick={(e) => {
                  e.stopPropagation()
                  setActiveId(c.id)
                }}
              >
                {c.title}
              </button>
            )
          })}
        </div>
      )}

      <div className="vz-fermi-bd-categories">
        {visibleCategories.map((c) => (
          <div key={c.id} className={`vz-fermi-bd-category tone-${c.tone}`}>
            <div className="vz-fermi-bd-cat-head">
              <span className="vz-fermi-bd-cat-title">{c.title}</span>
              <span className="vz-fermi-bd-cat-summary">{c.summary}</span>
            </div>
            <div className="vz-fermi-bd-grid">
              {c.entries.map((e, i) => (
                <div key={`${c.id}-${i}`} className="vz-fermi-bd-card">
                  <div className="vz-fermi-bd-value-row">
                    <span className="vz-fermi-bd-value">{e.value}</span>
                    {e.unit ? <span className="vz-fermi-bd-unit">{e.unit}</span> : null}
                  </div>
                  <div className="vz-fermi-bd-label">{e.label}</div>
                  {e.note ? <div className="vz-fermi-bd-note">{e.note}</div> : null}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="vz-fermi-bd-hint">
        この 30 個を暗記しておけば、ほとんどの市場規模は組み立てで推定できます。
      </div>
    </div>
  )
}
