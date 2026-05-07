import { useState } from 'react'
import { recordCompletion } from '../stats'
import { ArrowRightIcon, CheckIcon } from '../icons'
import { Button } from '../components/Button'
import { Header } from '../components/platform/Header'
import { haptic } from '../platform/haptics'
import { t } from '../i18n'

interface WorksheetScreenProps {
  onBack: () => void
}

type Cell = { row: number; col: number; answer: number }

type WorksheetProblem = {
  id: number
  title: string
  instructions: string
  accounts: string[]
  data: (number | null)[][]
  blanks: Cell[]
  explanation: string
}

const problems: WorksheetProblem[] = [
  {
    id: 1,
    title: '精算表（基本）',
    instructions: '以下の精算表の空欄を埋めてください。決算整理：期末商品棚卸高40,000円、減価償却費（備品）30,000円。',
    accounts: ['現金', '売掛金', '繰越商品', '備品', '買掛金', '資本金', '売上', '仕入', '給料', '減価償却費', '備品減価償却累計額', '当期純利益'],
    data: [
      [100000, null, null, null, null, null, 100000, null],
      [80000, null, null, null, null, null, 80000, null],
      [50000, null, null, 50000, null, null, 40000, null],
      [200000, null, null, null, null, null, 200000, null],
      [null, 60000, null, null, null, null, null, 60000],
      [null, 200000, null, null, null, null, null, 200000],
      [null, 500000, null, null, null, 500000, null, null],
      [330000, null, 50000, null, 340000, null, null, null],
      [50000, null, null, null, 50000, null, null, null],
      [null, null, 30000, null, 30000, null, null, null],
      [null, 100000, null, 30000, null, null, null, 130000],
      [null, null, null, null, null, 80000, 80000, null],
    ],
    blanks: [
      { row: 2, col: 2, answer: 40000 },
      { row: 7, col: 3, answer: 40000 },
      { row: 11, col: 5, answer: 80000 },
      { row: 11, col: 6, answer: 80000 },
    ],
    explanation: '売上原価＝期首50,000＋仕入330,000−期末40,000＝340,000。売上500,000−費用(340,000+50,000+30,000)＝80,000が当期純利益。',
  },
  {
    id: 2,
    title: '精算表（貸倒引当金）',
    instructions: '決算整理：売掛金200,000円に対し3%の貸倒引当金を差額補充法で設定（既存残高2,000円）。',
    accounts: ['現金', '売掛金', '貸倒引当金', '貸倒引当金繰入'],
    data: [
      [150000, null, null, null, null, null, 150000, null],
      [200000, null, null, null, null, null, 200000, null],
      [null, 2000, null, null, null, null, null, 6000],
      [null, null, null, null, 4000, null, null, null],
    ],
    blanks: [
      { row: 2, col: 3, answer: 4000 },
      { row: 3, col: 2, answer: 4000 },
    ],
    explanation: '設定額＝200,000×3%＝6,000円。既存2,000円との差額4,000円を繰入。',
  },
  {
    id: 3,
    title: '精算表（経過勘定）',
    instructions: '決算整理：保険料36,000円（12ヶ月分）のうち未経過3ヶ月分を繰り延べる。',
    accounts: ['保険料', '前払保険料'],
    data: [
      [36000, null, null, null, 27000, null, null, null],
      [null, null, null, null, null, null, 9000, null],
    ],
    blanks: [
      { row: 0, col: 3, answer: 9000 },
      { row: 1, col: 2, answer: 9000 },
    ],
    explanation: '未経過分＝36,000÷12×3＝9,000円。（借方）前払保険料9,000 ／（貸方）保険料9,000',
  },
]

const COL_HEADER_KEYS = ['worksheet.col.tbDr', 'worksheet.col.tbCr', 'worksheet.col.adjDr', 'worksheet.col.adjCr', 'worksheet.col.plDr', 'worksheet.col.plCr', 'worksheet.col.bsDr', 'worksheet.col.bsCr']

export function WorksheetScreen({ onBack }: WorksheetScreenProps) {
  const [current, setCurrent] = useState(0)
  const [inputs, setInputs] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [finished, setFinished] = useState(false)
  const [correctCells, setCorrectCells] = useState(0)
  const [totalCells, setTotalCells] = useState(0)

  const p = problems[current]
  const progress = ((current + 1) / problems.length) * 100

  const cellKey = (row: number, col: number) => `${current}-${row}-${col}`
  const isBlank = (row: number, col: number) => p.blanks.some((b) => b.row === row && b.col === col)
  const getAnswer = (row: number, col: number) => p.blanks.find((b) => b.row === row && b.col === col)?.answer

  const handleSubmit = () => {
    haptic.light()
    let correct = 0
    for (const b of p.blanks) {
      if (parseInt(inputs[cellKey(b.row, b.col)] || '0') === b.answer) correct++
    }
    setCorrectCells((c) => c + correct)
    setTotalCells((c) => c + p.blanks.length)
    setSubmitted(true)
  }

  const handleNext = () => {
    if (current + 1 >= problems.length) {
      recordCompletion('worksheet')
      setFinished(true)
    } else {
      setCurrent((c) => c + 1)
      setInputs({})
      setSubmitted(false)
    }
  }

  if (finished) {
    const pct = totalCells > 0 ? Math.round((correctCells / totalCells) * 100) : 0
    return (
      <div className="stack">
        <Header title={t('worksheet.resultTitle')} onBack={onBack} />
        <div className="eyebrow accent">{t('worksheet.resultEyebrow')}</div>
        <h1 style={{ fontSize: 32, letterSpacing: '-0.025em' }}>{t('worksheet.resultHeading')}</h1>
        <section className="profile-hero" style={{ textAlign: 'center' }}>
          <div className="eyebrow" style={{ color: 'rgba(255,255,255,0.65)', marginBottom: 'var(--s-3)' }}>{t('worksheet.scoreLabel')}</div>
          <div className="display" style={{ fontSize: 80, lineHeight: 0.9, letterSpacing: '-0.04em', color: '#fff' }}>{pct}%</div>
          <div style={{ marginTop: 'var(--s-3)', fontSize: 16, color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>
            {t('worksheet.scoreLine', { correct: correctCells, total: totalCells })}
          </div>
        </section>
        {pct >= 80 && (
          <div className="feedback-card">
            <div className="feedback-head">
              <div className="feedback-check"><CheckIcon /></div>
              <div className="feedback-title">{t('worksheet.greatTitle')}</div>
            </div>
          </div>
        )}
        <Button variant="default" size="lg" block onClick={() => {
          setCurrent(0); setInputs({}); setSubmitted(false); setCorrectCells(0); setTotalCells(0); setFinished(false)
        }}>{t('worksheet.retry')}</Button>
        <Button variant="primary" size="lg" block onClick={onBack}>{t('worksheet.back')}</Button>
      </div>
    )
  }

  return (
    <div className="stack">
      <Header title={`${current + 1} / ${problems.length}`} onBack={onBack} />

      <div className="progress">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="eyebrow accent" style={{ marginTop: 'var(--s-4)' }}>{t('worksheet.eyebrow')}</div>
      <h2 style={{ fontSize: 22, fontFamily: 'var(--font-display)' }}>{p.title}</h2>

      <div className="card" style={{ padding: 'var(--s-3)', marginTop: 'var(--s-3)' }}>
        <p style={{ fontSize: 16, lineHeight: 1.6, color: 'var(--text-muted)' }}>{p.instructions}</p>
      </div>

      <div style={{ marginTop: 'var(--s-3)', overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <table style={{ borderCollapse: 'collapse', fontSize: 14, minWidth: 600, width: '100%' }}>
          <thead>
            <tr>
              <th style={thStyle(true)}>{t('worksheet.account')}</th>
              {COL_HEADER_KEYS.map((key, i) => (
                <th key={i} style={thStyle()}>
                  {t(key).split('\n').map((line, j) => (
                    <span key={j} style={{ display: 'block' }}>{line}</span>
                  ))}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {p.accounts.map((acct, row) => (
              <tr key={row}>
                <td style={tdStyle(true)}>{acct}</td>
                {p.data[row].map((val, col) => {
                  if (isBlank(row, col)) {
                    const key = cellKey(row, col)
                    const userVal = parseInt(inputs[key] || '0')
                    const answer = getAnswer(row, col)!
                    const isCorrect = submitted ? userVal === answer : undefined
                    return (
                      <td key={col} style={tdStyle()}>
                        <div style={{ position: 'relative' }}>
                          <input
                            type="number"
                            aria-label={t('worksheet.cellAria', { row: row + 1, col: col + 1 })}
                            value={inputs[key] || ''}
                            onChange={(e) => setInputs((prev) => ({ ...prev, [key]: e.target.value }))}
                            disabled={submitted}
                            style={{
                              width: '100%',
                              padding: '4px 6px',
                              fontSize: 14,
                              border: `1px solid ${isCorrect === undefined ? 'var(--border)' : isCorrect ? 'var(--success)' : 'var(--danger)'}`,
                              borderRadius: 4,
                              background: isCorrect === undefined ? 'var(--bg-secondary)' : isCorrect ? 'rgba(16,185,129,0.06)' : 'rgba(220,38,38,0.06)',
                              outline: 'none',
                              textAlign: 'right',
                            }}
                          />
                          {submitted && !isCorrect && (
                            <div style={{ fontSize: 13, color: 'var(--success)', fontWeight: 600, textAlign: 'right', marginTop: 2 }}>
                              {answer.toLocaleString()}
                            </div>
                          )}
                        </div>
                      </td>
                    )
                  }
                  return (
                    <td key={col} style={{ ...tdStyle(), textAlign: 'right', color: 'var(--text)' }}>
                      {val !== null ? val.toLocaleString() : ''}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {submitted && (
        <div className="feedback-card" style={{ marginTop: 'var(--s-3)' }}>
          <div className="feedback-head">
            <div className="feedback-check"><CheckIcon /></div>
            <div className="feedback-title">{t('worksheet.explanation')}</div>
          </div>
          <div className="feedback-text">{p.explanation}</div>
        </div>
      )}

      <div style={{ marginTop: 'var(--s-3)' }}>
        {!submitted ? (
          <Button variant="primary" size="lg" block onClick={handleSubmit}>
            {t('worksheet.submit')}
          </Button>
        ) : (
          <Button variant="primary" size="lg" block onClick={handleNext}>
            {current + 1 >= problems.length ? t('worksheet.viewResult') : t('worksheet.nextQuestion')}
            <ArrowRightIcon width={16} height={16} />
          </Button>
        )}
      </div>
    </div>
  )
}

function thStyle(wide = false): React.CSSProperties {
  return {
    padding: '6px 8px',
    background: 'var(--bg-secondary)',
    borderBottom: '1px solid var(--border)',
    borderRight: '1px solid var(--border)',
    fontWeight: 700,
    fontSize: 14,
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    whiteSpace: 'nowrap',
    textAlign: wide ? 'left' : 'center',
    minWidth: wide ? 100 : 72,
  }
}

function tdStyle(wide = false): React.CSSProperties {
  return {
    padding: '6px 8px',
    borderBottom: '1px solid var(--border)',
    borderRight: '1px solid var(--border)',
    fontSize: 14,
    textAlign: wide ? 'left' : 'right',
    color: 'var(--text-muted)',
    minWidth: wide ? 100 : 72,
  }
}
