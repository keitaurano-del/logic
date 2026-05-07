import './LessonDiagrams.css'

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
