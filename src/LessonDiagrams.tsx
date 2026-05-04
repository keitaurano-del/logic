import './LessonDiagrams.css'

// ==============================
// T字勘定図
// ==============================
export function TAccountDiagram() {
  return (
    <div className="diagram">
      <p className="diagram-label">T字勘定（仕訳の基本構造）</p>
      <svg viewBox="0 0 360 180" className="diagram-svg">
        {/* T-account frame */}
        <line x1="180" y1="10" x2="180" y2="170" stroke="#2a4d76" strokeWidth="2.5" />
        <line x1="30" y1="45" x2="330" y2="45" stroke="#2a4d76" strokeWidth="2.5" />

        {/* Headers */}
        <text x="105" y="35" textAnchor="middle" className="dia-header">借方（Debit）</text>
        <text x="255" y="35" textAnchor="middle" className="dia-header">貸方（Credit）</text>

        {/* Left items */}
        <rect x="45" y="58" width="120" height="32" rx="8" fill="#ecfdf5" stroke="#34d399" strokeWidth="1.5" />
        <text x="105" y="79" textAnchor="middle" className="dia-item green">資産の増加</text>

        <rect x="45" y="98" width="120" height="32" rx="8" fill="#ecfdf5" stroke="#34d399" strokeWidth="1.5" />
        <text x="105" y="119" textAnchor="middle" className="dia-item green">費用の発生</text>

        {/* Right items */}
        <rect x="195" y="58" width="120" height="32" rx="8" fill="#eaf2ff" stroke="#5a9aff" strokeWidth="1.5" />
        <text x="255" y="79" textAnchor="middle" className="dia-item blue">負債の増加</text>

        <rect x="195" y="98" width="120" height="32" rx="8" fill="#eaf2ff" stroke="#5a9aff" strokeWidth="1.5" />
        <text x="255" y="119" textAnchor="middle" className="dia-item blue">収益の発生</text>

        <rect x="195" y="138" width="120" height="32" rx="8" fill="#eaf2ff" stroke="#5a9aff" strokeWidth="1.5" />
        <text x="255" y="159" textAnchor="middle" className="dia-item blue">純資産の増加</text>

        {/* Balance symbol */}
        <text x="180" y="168" textAnchor="middle" className="dia-balance">=</text>
      </svg>
    </div>
  )
}

// ==============================
// 5つの勘定科目グループ
// ==============================
export function AccountGroupsDiagram() {
  return (
    <div className="diagram">
      <p className="diagram-label">5つの勘定科目グループ</p>
      <div className="acct-groups">
        <div className="acct-section">
          <p className="acct-section-title debit-title">借方グループ（左）</p>
          <div className="acct-card green">
            <span className="acct-icon"></span>
            <div>
              <strong>資産</strong>
              <span>現金・売掛金・建物</span>
            </div>
          </div>
          <div className="acct-card green">
            <span className="acct-icon"></span>
            <div>
              <strong>費用</strong>
              <span>仕入・給料・家賃</span>
            </div>
          </div>
        </div>
        <div className="acct-divider-v">
          <div className="acct-divider-line" />
        </div>
        <div className="acct-section">
          <p className="acct-section-title credit-title">貸方グループ（右）</p>
          <div className="acct-card blue">
            <span className="acct-icon"></span>
            <div>
              <strong>負債</strong>
              <span>買掛金・借入金</span>
            </div>
          </div>
          <div className="acct-card blue">
            <span className="acct-icon"></span>
            <div>
              <strong>純資産</strong>
              <span>資本金</span>
            </div>
          </div>
          <div className="acct-card blue">
            <span className="acct-icon"></span>
            <div>
              <strong>収益</strong>
              <span>売上・受取利息</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ==============================
// 仕訳の例（フロー図）
// ==============================
export function JournalEntryDiagram() {
  return (
    <div className="diagram">
      <p className="diagram-label">仕訳の例：商品100円を現金で仕入れた</p>
      <div className="journal-flow">
        <div className="journal-event">
          <span className="journal-event-icon"></span>
          <span>商品を仕入れた</span>
        </div>
        <svg viewBox="0 0 40 30" className="journal-arrow-svg">
          <path d="M20 5 L20 20 M12 14 L20 22 L28 14" stroke="#2a4d76" strokeWidth="2" fill="none" strokeLinecap="round" />
        </svg>
        <div className="journal-entry">
          <div className="journal-side debit">
            <p className="journal-side-label">借方</p>
            <div className="journal-item">
              <span className="journal-name">仕入</span>
              <span className="journal-amount">100</span>
            </div>
            <p className="journal-reason">費用↑ → 左へ</p>
          </div>
          <div className="journal-slash">/</div>
          <div className="journal-side credit">
            <p className="journal-side-label">貸方</p>
            <div className="journal-item">
              <span className="journal-name">現金</span>
              <span className="journal-amount">100</span>
            </div>
            <p className="journal-reason">資産↓ → 右へ</p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ==============================
// 決算の流れ
// ==============================
export function SettlementFlowDiagram() {
  const steps = [
    { icon: '', label: '試算表の作成', desc: '記録の正確性を確認' },
    { icon: '', label: '決算整理仕訳', desc: '期末の修正・調整' },
    { icon: '', label: '精算表の作成', desc: '一覧表で整理' },
    { icon: '', label: 'P/L・B/S作成', desc: '財務諸表を完成' },
    { icon: '', label: '帳簿の締め切り', desc: '次期への繰越' },
  ]

  return (
    <div className="diagram">
      <p className="diagram-label">決算の流れ</p>
      <div className="settlement-flow">
        {steps.map((step, i) => (
          <div key={i} className="settle-step-wrap">
            <div className="settle-step">
              <div className="settle-num">{i + 1}</div>
              <span className="settle-icon">{step.icon}</span>
              <div className="settle-text">
                <strong>{step.label}</strong>
                <span>{step.desc}</span>
              </div>
            </div>
            {i < steps.length - 1 && (
              <div className="settle-arrow">
                <svg viewBox="0 0 24 16" width="24" height="16">
                  <path d="M12 2 L12 10 M6 6 L12 12 L18 6" stroke="#5488b8" strokeWidth="2" fill="none" strokeLinecap="round" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ==============================
// P/L と B/S の構造
// ==============================
export function FinancialStatementsDiagram() {
  return (
    <div className="diagram">
      <p className="diagram-label">損益計算書（P/L）と 貸借対照表（B/S）</p>
      <div className="fs-container">
        {/* P/L */}
        <div className="fs-box">
          <div className="fs-title pl-title">損益計算書（P/L）</div>
          <div className="fs-body">
            <div className="fs-col left">
              <div className="fs-item expense">費用</div>
              <div className="fs-examples">仕入・給料・減価償却費</div>
              <div className="fs-item profit">当期純利益</div>
            </div>
            <div className="fs-divider" />
            <div className="fs-col right">
              <div className="fs-item revenue">収益</div>
              <div className="fs-examples">売上・受取利息</div>
            </div>
          </div>
          <div className="fs-caption">一定期間の経営成績</div>
        </div>

        {/* B/S */}
        <div className="fs-box">
          <div className="fs-title bs-title">貸借対照表（B/S）</div>
          <div className="fs-body">
            <div className="fs-col left">
              <div className="fs-item asset">資産</div>
              <div className="fs-examples">現金・売掛金・建物</div>
            </div>
            <div className="fs-divider" />
            <div className="fs-col right">
              <div className="fs-item liability">負債</div>
              <div className="fs-examples">買掛金・借入金</div>
              <div className="fs-item equity">純資産</div>
              <div className="fs-examples">資本金・繰越利益剰余金</div>
            </div>
          </div>
          <div className="fs-equation">資産 ＝ 負債 ＋ 純資産</div>
          <div className="fs-caption">決算日時点の財政状態</div>
        </div>
      </div>
    </div>
  )
}

// ==============================
// 決算整理事項一覧
// ==============================
export function AdjustmentsDiagram() {
  const items = [
    { icon: '', title: '売上原価の算定', formula: '期首棚卸 ＋ 当期仕入 − 期末棚卸' },
    { icon: '', title: '貸倒引当金', formula: '売掛金 × 貸倒設定率' },
    { icon: '', title: '減価償却', formula: '(取得原価 − 残存価額) ÷ 耐用年数' },
    { icon: '', title: '経過勘定', formula: '前払・未払・前受・未収の調整' },
    { icon: '', title: '消耗品の処理', formula: '未使用分を資産に振替' },
  ]

  return (
    <div className="diagram">
      <p className="diagram-label">主な決算整理事項</p>
      <div className="adj-list">
        {items.map((item, i) => (
          <div key={i} className="adj-item">
            <div className="adj-icon">{item.icon}</div>
            <div className="adj-text">
              <strong>{item.title}</strong>
              <code>{item.formula}</code>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ==============================
// 連結会計フロー図
// ==============================
export function ConsolidationDiagram() {
  const steps = [
    { num: '1', label: '投資と資本の相殺消去', desc: '子会社株式 ↔ 資本金・利益剰余金', color: '#6c8cff' },
    { num: '2', label: '内部取引の相殺消去', desc: 'グループ内の売上・仕入を消去', color: '#a78bfa' },
    { num: '3', label: '未実現利益の消去', desc: 'グループ内取引の利益を除外', color: '#f59e42' },
    { num: '4', label: 'のれんの計上・償却', desc: '取得原価 − 子会社純資産 ＝ のれん', color: '#4edba8' },
  ]
  return (
    <div className="diagram">
      <p className="diagram-label">連結会計の基本手順</p>
      <div className="consol-flow">
        <div className="consol-top">
          <div className="consol-entity parent">
            <span></span><strong>親会社</strong>
          </div>
          <div className="consol-arrow-h">→ 支配 →</div>
          <div className="consol-entity child">
            <span></span><strong>子会社</strong>
          </div>
        </div>
        <div className="consol-steps">
          {steps.map((s, i) => (
            <div key={i} className="consol-step">
              <div className="consol-num" style={{ background: s.color }}>{s.num}</div>
              <div className="consol-step-text">
                <strong>{s.label}</strong>
                <span>{s.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ==============================
// 税効果会計図
// ==============================
export function TaxEffectDiagram() {
  return (
    <div className="diagram">
      <p className="diagram-label">税効果会計のしくみ</p>
      <div className="tax-container">
        <div className="tax-row">
          <div className="tax-box future-deduct">
            <strong>将来減算一時差異</strong>
            <span>会計上の費用 ＞ 税務上の損金</span>
            <div className="tax-result">→ 繰延税金資産（将来、税金↓）</div>
            <div className="tax-example">例：貸倒引当金超過額</div>
          </div>
        </div>
        <div className="tax-row">
          <div className="tax-box future-add">
            <strong>将来加算一時差異</strong>
            <span>会計上の費用 ＜ 税務上の損金</span>
            <div className="tax-result">→ 繰延税金負債（将来、税金↑）</div>
            <div className="tax-example">例：有価証券評価益</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ==============================
// リース取引比較図
// ==============================
export function LeaseDiagram() {
  return (
    <div className="diagram">
      <p className="diagram-label">リース取引の分類</p>
      <div className="lease-compare">
        <div className="lease-type finance">
          <div className="lease-type-header">ファイナンス・リース</div>
          <div className="lease-type-body">
            <p className="lease-key">売買処理（オンバランス）</p>
            <div className="lease-journal">
              <div className="lease-j-row"><span className="j-dr">リース資産</span><span className="j-cr">リース債務</span></div>
              <div className="lease-j-label">↓ 毎期</div>
              <div className="lease-j-row"><span className="j-dr">減価償却費</span><span className="j-cr">累計額</span></div>
            </div>
          </div>
        </div>
        <div className="lease-vs">VS</div>
        <div className="lease-type operating">
          <div className="lease-type-header op">オペレーティング・リース</div>
          <div className="lease-type-body">
            <p className="lease-key">賃貸借処理</p>
            <div className="lease-journal">
              <div className="lease-j-row"><span className="j-dr">支払リース料</span><span className="j-cr">現金</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ==============================
// 有価証券分類図
// ==============================
export function SecuritiesDiagram() {
  const types = [
    { name: '売買目的有価証券', eval: '時価', diff: '当期の損益', color: '#6c8cff' },
    { name: '満期保有目的の債券', eval: '取得原価/償却原価', diff: '—', color: '#a78bfa' },
    { name: '子会社・関連会社株式', eval: '取得原価', diff: '—', color: '#f59e42' },
    { name: 'その他有価証券', eval: '時価', diff: '純資産の部', color: '#4edba8' },
  ]
  return (
    <div className="diagram">
      <p className="diagram-label">有価証券の分類と評価</p>
      <div className="sec-table">
        <div className="sec-header-row">
          <span>分類</span><span>評価方法</span><span>評価差額</span>
        </div>
        {types.map((t, i) => (
          <div key={i} className="sec-row">
            <span className="sec-name" style={{ borderLeftColor: t.color }}>{t.name}</span>
            <span className="sec-eval">{t.eval}</span>
            <span className="sec-diff">{t.diff}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ==============================
// 原価計算フロー図
// ==============================
export function CostFlowDiagram() {
  return (
    <div className="diagram">
      <p className="diagram-label">原価計算の流れ</p>
      <div className="cost-flow">
        <div className="cost-inputs">
          <div className="cost-element mat">材料費</div>
          <div className="cost-element lab">労務費</div>
          <div className="cost-element exp">経費</div>
        </div>
        <div className="cost-arrow-down">▼ 費目別計算</div>
        <div className="cost-stage">
          <div className="cost-split">
            <div className="cost-box direct">直接費</div>
            <div className="cost-box indirect">間接費（配賦）</div>
          </div>
        </div>
        <div className="cost-arrow-down">▼ 部門別 → 製品別計算</div>
        <div className="cost-result">製品原価</div>
      </div>
    </div>
  )
}

// ==============================
// 標準原価差異分析図
// ==============================
export function VarianceAnalysisDiagram() {
  return (
    <div className="diagram">
      <p className="diagram-label">原価差異の分析体系</p>
      <div className="var-tree">
        <div className="var-root">原価差異</div>
        <div className="var-branches">
          <div className="var-branch">
            <div className="var-cat blue">直接材料費差異</div>
            <div className="var-items">
              <span>価格差異 ＝（実際単価−標準単価）×実際量</span>
              <span>数量差異 ＝（実際量−標準量）×標準単価</span>
            </div>
          </div>
          <div className="var-branch">
            <div className="var-cat purple">直接労務費差異</div>
            <div className="var-items">
              <span>賃率差異 ＝（実際賃率−標準賃率）×実際時間</span>
              <span>時間差異 ＝（実際時間−標準時間）×標準賃率</span>
            </div>
          </div>
          <div className="var-branch">
            <div className="var-cat green">製造間接費差異</div>
            <div className="var-items">
              <span>予算差異 / 操業度差異 / 能率差異</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ==============================
// CVP分析図
// ==============================
export function CVPDiagram() {
  return (
    <div className="diagram">
      <p className="diagram-label">CVP分析（損益分岐点）</p>
      <svg viewBox="0 0 340 200" className="diagram-svg">
        {/* Axes */}
        <line x1="50" y1="170" x2="320" y2="170" stroke="var(--text-muted)" strokeWidth="1.5" />
        <line x1="50" y1="170" x2="50" y2="20" stroke="var(--text-muted)" strokeWidth="1.5" />
        <text x="185" y="195" textAnchor="middle" fill="var(--text-muted)" fontSize="11">販売量</text>
        <text x="20" y="95" textAnchor="middle" fill="var(--text-muted)" fontSize="11" transform="rotate(-90,20,95)">金額</text>

        {/* Fixed cost line */}
        <line x1="50" y1="130" x2="310" y2="130" stroke="#f59e42" strokeWidth="2" strokeDasharray="6 3" />
        <text x="315" y="128" fill="#f59e42" fontSize="10">固定費</text>

        {/* Total cost line */}
        <line x1="50" y1="130" x2="310" y2="50" stroke="#f87171" strokeWidth="2" />
        <text x="300" y="42" fill="#f87171" fontSize="10">総原価</text>

        {/* Revenue line */}
        <line x1="50" y1="170" x2="310" y2="30" stroke="#6c8cff" strokeWidth="2" />
        <text x="300" y="25" fill="#6c8cff" fontSize="10">売上高</text>

        {/* BEP */}
        <circle cx="175" cy="93" r="5" fill="#4edba8" />
        <text x="175" y="83" textAnchor="middle" fill="#4edba8" fontSize="11" fontWeight="700">BEP</text>

        {/* Loss / Profit areas */}
        <text x="120" y="150" textAnchor="middle" fill="#f87171" fontSize="11" opacity="0.7">損失</text>
        <text x="240" y="80" textAnchor="middle" fill="#4edba8" fontSize="11" opacity="0.7">利益</text>
      </svg>
      <div className="cvp-formula">
        <code>損益分岐点 ＝ 固定費 ÷ 貢献利益率</code>
      </div>
    </div>
  )
}

// ==============================
// MECEの4つのパターン
// ==============================
export function MecePatternsDiagram() {
  return (
    <div className="diagram">
      <p className="diagram-label">MECEの4つのパターン</p>
      <div className="mece-patterns">
        {/* 要素分解型 */}
        <div className="mece-pattern-card">
          <div className="mece-pattern-title">要素分解型</div>
          <div className="mece-tree-mini">
            <div className="mece-tree-root">売上</div>
            <svg viewBox="0 0 120 24" className="mece-tree-lines">
              <line x1="60" y1="0" x2="30" y2="24" stroke="var(--accent)" strokeWidth="1.5" />
              <line x1="60" y1="0" x2="90" y2="24" stroke="var(--accent)" strokeWidth="1.5" />
            </svg>
            <div className="mece-tree-children">
              <span>客数</span>
              <span className="mece-multiply">×</span>
              <span>客単価</span>
            </div>
          </div>
        </div>

        {/* 時系列型 */}
        <div className="mece-pattern-card">
          <div className="mece-pattern-title">時系列型</div>
          <div className="mece-timeline">
            <span className="mece-stage">認知</span>
            <span className="mece-arrow-r">→</span>
            <span className="mece-stage">検討</span>
            <span className="mece-arrow-r">→</span>
            <span className="mece-stage">購入</span>
            <span className="mece-arrow-r">→</span>
            <span className="mece-stage">継続</span>
          </div>
        </div>

        {/* 対立概念型 */}
        <div className="mece-pattern-card">
          <div className="mece-pattern-title">対立概念型</div>
          <div className="mece-opposites">
            <div className="mece-oppose-pair">
              <span className="mece-oppose-a">国内</span>
              <span className="mece-oppose-vs">/</span>
              <span className="mece-oppose-b">海外</span>
            </div>
            <div className="mece-oppose-pair">
              <span className="mece-oppose-a">既存</span>
              <span className="mece-oppose-vs">/</span>
              <span className="mece-oppose-b">新規</span>
            </div>
          </div>
        </div>

        {/* フレームワーク活用型 */}
        <div className="mece-pattern-card">
          <div className="mece-pattern-title">フレームワーク活用型</div>
          <div className="mece-framework">
            <div className="mece-3c-circle c-customer">顧客</div>
            <div className="mece-3c-circle c-competitor">競合</div>
            <div className="mece-3c-circle c-company">自社</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ==============================
// 3C分析ケース
// ==============================
export function MeceCaseDiagram() {
  const columns = [
    {
      label: 'Customer',
      sub: '顧客',
      color: '#4B8AFF',
      items: ['購買行動の変化', '節約志向の高まり', 'EC購買比率の増加'],
    },
    {
      label: 'Competitor',
      sub: '競合',
      color: '#a78bfa',
      items: ['低価格攻勢', 'D2Cブランド台頭', 'EC・アプリ強化'],
    },
    {
      label: 'Company',
      sub: '自社',
      color: '#34D399',
      items: ['トレンド対応の遅れ', '店舗立地の問題', 'EC化率が低い'],
    },
  ]

  return (
    <div className="diagram">
      <p className="diagram-label">3C分析で売上低下を分解</p>
      <div className="mece-case-cols">
        {columns.map((col, i) => (
          <div key={i} className="mece-case-col">
            <div className="mece-case-header" style={{ borderBottomColor: col.color }}>
              <strong style={{ color: col.color }}>{col.label}</strong>
              <span>{col.sub}</span>
            </div>
            <ul className="mece-case-items">
              {col.items.map((item, j) => (
                <li key={j} style={{ borderLeftColor: col.color }}>{item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}

// ==============================
// ロジックツリー図
// ==============================
export function LogicTreeDiagram() {
  return (
    <div className="diagram">
      <p className="diagram-label">ロジックツリーの2つの型</p>
      <div className="lt-container">
        {/* Why Tree */}
        <div className="lt-section">
          <div className="lt-type-label why">Whyツリー（原因追究）</div>
          <div className="lt-tree">
            <div className="lt-node lt-root">なぜ？</div>
            <div className="lt-connector">
              <svg viewBox="0 0 200 20" className="lt-lines-svg">
                <line x1="100" y1="0" x2="33" y2="20" stroke="var(--accent)" strokeWidth="1.5" />
                <line x1="100" y1="0" x2="100" y2="20" stroke="var(--accent)" strokeWidth="1.5" />
                <line x1="100" y1="0" x2="167" y2="20" stroke="var(--accent)" strokeWidth="1.5" />
              </svg>
            </div>
            <div className="lt-children">
              <div className="lt-node lt-child">原因A</div>
              <div className="lt-node lt-child">原因B</div>
              <div className="lt-node lt-child">原因C</div>
            </div>
          </div>
        </div>

        {/* How Tree */}
        <div className="lt-section">
          <div className="lt-type-label how">Howツリー（解決策）</div>
          <div className="lt-tree">
            <div className="lt-node lt-root">どうする？</div>
            <div className="lt-connector">
              <svg viewBox="0 0 200 20" className="lt-lines-svg">
                <line x1="100" y1="0" x2="33" y2="20" stroke="var(--success)" strokeWidth="1.5" />
                <line x1="100" y1="0" x2="100" y2="20" stroke="var(--success)" strokeWidth="1.5" />
                <line x1="100" y1="0" x2="167" y2="20" stroke="var(--success)" strokeWidth="1.5" />
              </svg>
            </div>
            <div className="lt-children">
              <div className="lt-node lt-child">施策A</div>
              <div className="lt-node lt-child">施策B</div>
              <div className="lt-node lt-child">施策C</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ==============================
// 離職率 Why ツリー ケース
// ==============================
export function LogicTreeCaseDiagram() {
  const branches = [
    { label: '報酬・待遇', color: '#4B8AFF', subs: ['給与水準が低い', '福利厚生が不十分'] },
    { label: 'キャリア・成長', color: '#a78bfa', subs: ['キャリアパスが不明確', '研修機会が少ない'] },
    { label: '労働環境', color: '#f59e42', subs: ['長時間労働', '人間関係の問題'] },
    { label: '外部環境', color: '#34D399', subs: ['売り手市場', 'リモート普及'] },
  ]

  return (
    <div className="diagram">
      <p className="diagram-label">「離職率が高い」のWhyツリー</p>
      <div className="ltc-tree">
        <div className="ltc-root">離職率が高い（25%）</div>
        <div className="ltc-branches">
          {branches.map((b, i) => (
            <div key={i} className="ltc-branch">
              <div className="ltc-branch-label" style={{ borderLeftColor: b.color, color: b.color }}>
                {b.label}
              </div>
              <div className="ltc-subs">
                {b.subs.map((s, j) => (
                  <div key={j} className="ltc-sub">{s}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ==============================
// So What / Why So 図
// ==============================
export function SoWhatDiagram() {
  return (
    <div className="diagram">
      <p className="diagram-label">So What? / Why So? の関係</p>
      <div className="sw-flow">
        <div className="sw-box sw-data">
          <span className="sw-icon"></span>
          <div>
            <strong>データ・事実</strong>
            <span>売上が前年比20%減少した</span>
          </div>
        </div>
        <div className="sw-arrows">
          <div className="sw-arrow-up">
            <span className="sw-arrow-label">So What?</span>
            <svg viewBox="0 0 24 40" width="24" height="40">
              <path d="M12 38 L12 6 M6 14 L12 2 L18 14" stroke="var(--accent)" strokeWidth="2" fill="none" strokeLinecap="round" />
            </svg>
            <span className="sw-arrow-sub">だから何？</span>
          </div>
          <div className="sw-arrow-down">
            <span className="sw-arrow-label">Why So?</span>
            <svg viewBox="0 0 24 40" width="24" height="40">
              <path d="M12 2 L12 34 M6 26 L12 38 L18 26" stroke="var(--warning)" strokeWidth="2" fill="none" strokeLinecap="round" />
            </svg>
            <span className="sw-arrow-sub">なぜそう言える？</span>
          </div>
        </div>
        <div className="sw-box sw-insight">
          <span className="sw-icon"></span>
          <div>
            <strong>示唆・主張</strong>
            <span>リテンション施策が急務である</span>
          </div>
        </div>
      </div>
    </div>
  )
}

// ==============================
// ピラミッド原則図
// ==============================
export function PyramidDiagram() {
  return (
    <div className="diagram">
      <p className="diagram-label">ピラミッドストラクチャー</p>
      <div className="pyr-container">
        {/* Top: Conclusion */}
        <div className="pyr-row">
          <div className="pyr-node pyr-top">結論・主張</div>
        </div>
        <div className="pyr-connector-row">
          <svg viewBox="0 0 300 20" className="pyr-lines-svg">
            <line x1="150" y1="0" x2="50" y2="20" stroke="var(--accent)" strokeWidth="1.5" />
            <line x1="150" y1="0" x2="150" y2="20" stroke="var(--accent)" strokeWidth="1.5" />
            <line x1="150" y1="0" x2="250" y2="20" stroke="var(--accent)" strokeWidth="1.5" />
          </svg>
        </div>
        {/* Middle: Reasons */}
        <div className="pyr-row pyr-mid-row">
          <div className="pyr-node pyr-mid">理由1</div>
          <div className="pyr-node pyr-mid">理由2</div>
          <div className="pyr-node pyr-mid">理由3</div>
        </div>
        <div className="pyr-connector-row">
          <svg viewBox="0 0 300 16" className="pyr-lines-svg">
            <line x1="50" y1="0" x2="25" y2="16" stroke="var(--text-muted)" strokeWidth="1" />
            <line x1="50" y1="0" x2="75" y2="16" stroke="var(--text-muted)" strokeWidth="1" />
            <line x1="150" y1="0" x2="125" y2="16" stroke="var(--text-muted)" strokeWidth="1" />
            <line x1="150" y1="0" x2="175" y2="16" stroke="var(--text-muted)" strokeWidth="1" />
            <line x1="250" y1="0" x2="225" y2="16" stroke="var(--text-muted)" strokeWidth="1" />
            <line x1="250" y1="0" x2="275" y2="16" stroke="var(--text-muted)" strokeWidth="1" />
          </svg>
        </div>
        {/* Bottom: Evidence */}
        <div className="pyr-row pyr-bot-row">
          <div className="pyr-node pyr-bot">根拠</div>
          <div className="pyr-node pyr-bot">根拠</div>
          <div className="pyr-node pyr-bot">根拠</div>
          <div className="pyr-node pyr-bot">根拠</div>
          <div className="pyr-node pyr-bot">根拠</div>
          <div className="pyr-node pyr-bot">根拠</div>
        </div>
        <div className="pyr-annotations">
          <span>各階層で MECE</span>
          <span>下位は上位の根拠</span>
        </div>
      </div>
    </div>
  )
}

// ==============================
// 演繹法 三段論法フロー図
// ==============================
export function DeductionDiagram() {
  return (
    <div className="diagram">
      <p className="diagram-label">演繹法（三段論法）の構造</p>
      <div className="ded-flow">
        <div className="ded-step ded-major">
          <div className="ded-tag">大前提</div>
          <div className="ded-text">人間はみな死ぬ<br /><span className="ded-formula">(全ての A は B)</span></div>
        </div>
        <div className="ded-arrow">＋</div>
        <div className="ded-step ded-minor">
          <div className="ded-tag">小前提</div>
          <div className="ded-text">ソクラテスは人間<br /><span className="ded-formula">(X は A)</span></div>
        </div>
        <div className="ded-arrow">↓</div>
        <div className="ded-step ded-conclusion">
          <div className="ded-tag">結論</div>
          <div className="ded-text">ソクラテスは死ぬ<br /><span className="ded-formula">(X は B)</span></div>
        </div>
        <p className="ded-note">前提が正しければ結論は<strong>必ず</strong>正しい</p>
      </div>
    </div>
  )
}

// ==============================
// 帰納法 ボトムアップ図
// ==============================
export function InductionDiagram() {
  return (
    <div className="diagram">
      <p className="diagram-label">帰納法（個別事例 → 一般法則）</p>
      <div className="ind-container">
        <div className="ind-observations">
          <div className="ind-obs">観察 1<br /><span>白鳥A は白い</span></div>
          <div className="ind-obs">観察 2<br /><span>白鳥B は白い</span></div>
          <div className="ind-obs">観察 3<br /><span>白鳥C は白い</span></div>
        </div>
        <svg viewBox="0 0 240 40" className="ind-arrows-svg">
          <line x1="40" y1="0" x2="120" y2="40" stroke="var(--accent)" strokeWidth="1.5" />
          <line x1="120" y1="0" x2="120" y2="40" stroke="var(--accent)" strokeWidth="1.5" />
          <line x1="200" y1="0" x2="120" y2="40" stroke="var(--accent)" strokeWidth="1.5" />
          <polygon points="115,35 120,42 125,35" fill="var(--accent)" />
        </svg>
        <div className="ind-conclusion">
          <strong>仮説</strong>
          <span>「白鳥はみな白い」</span>
        </div>
        <p className="ind-warning">反例 1 つで覆る (例: 黒い白鳥)</p>
      </div>
    </div>
  )
}

// ==============================
// 対偶 (Contrapositive) 図
// ==============================
export function ContrapositiveDiagram() {
  return (
    <div className="diagram">
      <p className="diagram-label">逆・裏・対偶の関係</p>
      <div className="cp-grid">
        <div className="cp-card cp-original">
          <div className="cp-tag">元の命題</div>
          <div className="cp-formula">A → B</div>
          <div className="cp-example">雨が降れば<br />地面が濡れる</div>
        </div>
        <div className="cp-card cp-converse">
          <div className="cp-tag">逆</div>
          <div className="cp-formula">B → A</div>
          <div className="cp-example">地面が濡れていれば<br />雨が降った</div>
          <div className="cp-mark cp-false">必ずしも真ではない</div>
        </div>
        <div className="cp-card cp-inverse">
          <div className="cp-tag">裏</div>
          <div className="cp-formula">¬A → ¬B</div>
          <div className="cp-example">雨が降らなければ<br />地面は濡れない</div>
          <div className="cp-mark cp-false">必ずしも真ではない</div>
        </div>
        <div className="cp-card cp-contra">
          <div className="cp-tag">対偶</div>
          <div className="cp-formula">¬B → ¬A</div>
          <div className="cp-example">地面が濡れていなければ<br />雨は降らなかった</div>
          <div className="cp-mark cp-true">元と必ず同じ真偽</div>
        </div>
      </div>
    </div>
  )
}

// ==============================
// PREP法フロー図
// ==============================
export function PrepDiagram() {
  const steps = [
    { letter: 'P', label: 'Point', desc: '結論', color: '#4B8AFF' },
    { letter: 'R', label: 'Reason', desc: '理由', color: '#a78bfa' },
    { letter: 'E', label: 'Example', desc: '具体例', color: '#f59e42' },
    { letter: 'P', label: 'Point', desc: '結論（再）', color: '#4B8AFF' },
  ]

  return (
    <div className="diagram">
      <p className="diagram-label">PREP法の流れ</p>
      <div className="prep-flow">
        {steps.map((s, i) => (
          <div key={i} className="prep-step-wrap">
            <div className="prep-step" style={{ borderColor: s.color }}>
              <div className="prep-letter" style={{ background: s.color }}>{s.letter}</div>
              <div className="prep-text">
                <strong>{s.label}</strong>
                <span>{s.desc}</span>
              </div>
            </div>
            {i < steps.length - 1 && (
              <div className="prep-arrow">
                <svg viewBox="0 0 24 16" width="24" height="16">
                  <path d="M12 2 L12 10 M6 6 L12 12 L18 6" stroke="var(--text-muted)" strokeWidth="2" fill="none" strokeLinecap="round" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
