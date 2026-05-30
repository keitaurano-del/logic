import './visuals-phase2.css'

/**
 * MECE 概念図解 — 漏れあり / ダブりあり / MECE の 3 ベン図
 * lesson-20 step.0 で利用、lesson-501 でも流用可
 * 想定 visualId: 'MeceVennDiagram'
 *
 * Props で内容差し替え可能（lesson データ側 `step.visualProps` で指定）:
 *   sectionLabel?: string         — 上部の見出し
 *   missing?: { title, note }     — 漏れあり カード (title=見出し / note=補足)
 *   overlap?: { title, note }     — ダブりあり カード
 *   mece?: { title, note }        — MECE カード
 *   hint?: string                 — 下部のヒント
 *
 * 未指定フィールドは default 値が使われ、後方互換が保たれる。
 * ベン図の SVG 内容（円・ラベル A/B/C/D）は固定。学習対象の概念図そのものなので
 * 内容差し替えはタイトル / 補足テキストのみで十分という想定。
 *
 * A 案 Phase 3 適用済 (2026-05-24, §3.1 §2.4 準拠):
 *   - inline hint 11→13, padding/lineHeight 拡大
 *   - CSS: vz-mv-card-title 13→14, vz-mv-card-note 12→13
 *   - warm accent: hint ボックスを terracotta soft 背景に
 *     (good/bad の success/rose 意味色は §2.3 例外として維持、hint 1 箇所のみ温度感色)
 */

export type MeceVennCard = {
  title?: string
  note?: string
}

export type MeceVennProps = {
  sectionLabel?: string
  missing?: MeceVennCard
  overlap?: MeceVennCard
  mece?: MeceVennCard
  hint?: string
}

const DEFAULT_PROPS: Required<MeceVennProps> = {
  sectionLabel: 'MECE — 漏れなくダブりなく',
  missing: { title: '漏れあり', note: '全体を覆えていない' },
  overlap: { title: 'ダブりあり', note: '同じ要素を二重に数える' },
  mece: { title: 'MECE', note: '全体を漏れなく重複なく' },
  hint: 'すべての要素を「漏れなく・ダブりなく」覆うのが MECE',
}

export function MeceVennDiagram(props: MeceVennProps = {}) {
  const merged = {
    sectionLabel: props.sectionLabel ?? DEFAULT_PROPS.sectionLabel,
    missing: { ...DEFAULT_PROPS.missing, ...(props.missing ?? {}) },
    overlap: { ...DEFAULT_PROPS.overlap, ...(props.overlap ?? {}) },
    mece: { ...DEFAULT_PROPS.mece, ...(props.mece ?? {}) },
    hint: props.hint ?? DEFAULT_PROPS.hint,
  }
  const { sectionLabel, missing, overlap, mece, hint } = merged

  return (
    <div className="vz-stagger">
      <div className="vz-section-label" style={{ marginBottom: 10 }}>{sectionLabel}</div>

      <div className="vz-mv-grid">
        {/* 漏れあり: 2 円が分離 + 外側に取りこぼし */}
        <div className="vz-mv-card bad">
          <div className="vz-mv-card-title">{missing.title}</div>
          <svg className="vz-mv-svg" viewBox="0 0 100 80" aria-hidden="true">
            <rect x="2" y="2" width="96" height="76" rx="4"
              fill="none" stroke="var(--border)" strokeDasharray="3,3" />
            <circle cx="32" cy="38" r="22" fill="rgba(219, 39, 119, 0.18)"
              stroke="#DB2777" strokeWidth="1.5" />
            <circle cx="70" cy="38" r="22" fill="rgba(219, 39, 119, 0.18)"
              stroke="#DB2777" strokeWidth="1.5" />
            <text x="32" y="42" textAnchor="middle" fontSize="9" fontWeight="700" fill="#DB2777">A</text>
            <text x="70" y="42" textAnchor="middle" fontSize="9" fontWeight="700" fill="#DB2777">B</text>
            <text x="50" y="72" textAnchor="middle" fontSize="8" fontWeight="700" fill="var(--text-muted)">取りこぼし</text>
          </svg>
          <div className="vz-mv-card-note">{missing.note}</div>
        </div>

        {/* ダブりあり: 2 円が大きく重なる */}
        <div className="vz-mv-card bad">
          <div className="vz-mv-card-title">{overlap.title}</div>
          <svg className="vz-mv-svg" viewBox="0 0 100 80" aria-hidden="true">
            <rect x="2" y="2" width="96" height="76" rx="4"
              fill="none" stroke="var(--border)" strokeDasharray="3,3" />
            <circle cx="40" cy="38" r="26" fill="rgba(219, 39, 119, 0.18)"
              stroke="#DB2777" strokeWidth="1.5" />
            <circle cx="62" cy="38" r="26" fill="rgba(219, 39, 119, 0.18)"
              stroke="#DB2777" strokeWidth="1.5" />
            <text x="28" y="42" textAnchor="middle" fontSize="9" fontWeight="700" fill="#DB2777">A</text>
            <text x="74" y="42" textAnchor="middle" fontSize="9" fontWeight="700" fill="#DB2777">B</text>
            <text x="51" y="42" textAnchor="middle" fontSize="8" fontWeight="700" fill="#DB2777">×</text>
          </svg>
          <div className="vz-mv-card-note">{overlap.note}</div>
        </div>

        {/* MECE: 隣接して全体をカバー */}
        <div className="vz-mv-card good">
          <div className="vz-mv-card-title">{mece.title}</div>
          <svg className="vz-mv-svg" viewBox="0 0 100 80" aria-hidden="true">
            <rect x="2" y="2" width="96" height="76" rx="4"
              fill="rgba(5, 150, 105, 0.06)" stroke="var(--success)" strokeWidth="1.2" />
            <line x1="50" y1="6" x2="50" y2="74" stroke="var(--success)" strokeWidth="1.5" />
            <line x1="6" y1="40" x2="94" y2="40" stroke="var(--success)" strokeWidth="1.5" />
            <text x="28" y="26" textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--success)">A</text>
            <text x="72" y="26" textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--success)">B</text>
            <text x="28" y="60" textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--success)">C</text>
            <text x="72" y="60" textAnchor="middle" fontSize="9" fontWeight="700" fill="var(--success)">D</text>
          </svg>
          <div className="vz-mv-card-note">{mece.note}</div>
        </div>
      </div>

      {hint ? (
        <div style={{
          marginTop: 14,
          padding: '10px 12px',
          background: 'var(--visual-warm-primary-soft)',
          borderRadius: 8,
          fontSize: '0.8667rem',
          fontWeight: 600,
          color: 'var(--visual-warm-primary-deep)',
          textAlign: 'center',
          lineHeight: 1.45,
        }}>
          💡 {hint}
        </div>
      ) : null}
    </div>
  )
}
