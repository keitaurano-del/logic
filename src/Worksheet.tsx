import { useState } from 'react'
import './Worksheet.css'

type Cell = {
  row: number
  col: number
  answer: number
}

type WorksheetProblem = {
  id: number
  title: string
  instructions: string
  accounts: string[]
  // 8列: 試算表借方, 試算表貸方, 修正借方, 修正貸方, P/L借方, P/L貸方, B/S借方, B/S貸方
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
      // 試算借, 試算貸, 修正借, 修正貸, PL借, PL貸, BS借, BS貸
      [100000, null, null, null, null, null, 100000, null],     // 現金
      [80000, null, null, null, null, null, 80000, null],      // 売掛金
      [50000, null, null, 50000, null, null, 40000, null],     // 繰越商品 ※blank: 修正借方=40000
      [200000, null, null, null, null, null, 200000, null],    // 備品
      [null, 60000, null, null, null, null, null, 60000],      // 買掛金
      [null, 200000, null, null, null, null, null, 200000],    // 資本金
      [null, 500000, null, null, null, 500000, null, null],    // 売上
      [330000, null, 50000, null, 340000, null, null, null],   // 仕入 ※blank: 修正貸方=40000, PL借方=340000
      [50000, null, null, null, 50000, null, null, null],      // 給料
      [null, null, 30000, null, 30000, null, null, null],      // 減価償却費
      [null, 100000, null, 30000, null, null, null, 130000],   // 備品減価償却累計額
      [null, null, null, null, null, 80000, 80000, null],      // 当期純利益 ※blank
    ],
    blanks: [
      { row: 2, col: 2, answer: 40000 },   // 繰越商品 修正借方
      { row: 7, col: 3, answer: 40000 },   // 仕入 修正貸方
      { row: 11, col: 5, answer: 80000 },  // 当期純利益 P/L貸方
      { row: 11, col: 6, answer: 80000 },  // 当期純利益 B/S借方 — これはBS欄ではなく貸方寄り。修正
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
      [null, 2000, null, null, null, null, null, 6000],     // blank: 修正貸方=4000
      [null, null, null, null, 4000, null, null, null],       // blank: 修正借方=4000
    ],
    blanks: [
      { row: 2, col: 3, answer: 4000 },  // 貸倒引当金 修正貸方
      { row: 3, col: 2, answer: 4000 },  // 貸倒引当金繰入 修正借方
    ],
    explanation: '設定額＝200,000×3%＝6,000円。既存2,000円との差額4,000円を繰入。',
  },
  {
    id: 3,
    title: '精算表（経過勘定）',
    instructions: '決算整理：保険料36,000円（12ヶ月分）のうち未経過3ヶ月分を繰り延べる。',
    accounts: ['保険料', '前払保険料'],
    data: [
      [36000, null, null, null, 27000, null, null, null],  // blank: 修正貸方=9000, PL借方=27000
      [null, null, null, null, null, null, 9000, null],    // blank: 修正借方=9000
    ],
    blanks: [
      { row: 0, col: 3, answer: 9000 },   // 保険料 修正貸方
      { row: 1, col: 2, answer: 9000 },   // 前払保険料 修正借方
    ],
    explanation: '未経過分＝36,000÷12×3＝9,000円。（借方）前払保険料9,000 ／（貸方）保険料9,000',
  },
]

const COL_HEADERS = ['試算表\n借方', '試算表\n貸方', '修正\n借方', '修正\n貸方', 'P/L\n借方', 'P/L\n貸方', 'B/S\n借方', 'B/S\n貸方']

type Props = { onBack: () => void; onComplete?: () => void }

export default function Worksheet({ onBack, onComplete }: Props) {
  const [current, setCurrent] = useState(0)
  const [inputs, setInputs] = useState<Record<string, string>>({})
  const [submitted, setSubmitted] = useState(false)
  const [finished, setFinished] = useState(false)
  const [correctCells, setCorrectCells] = useState(0)
  const [totalCells, setTotalCells] = useState(0)

  const p = problems[current]

  const cellKey = (row: number, col: number) => `${current}-${row}-${col}`
  const isBlank = (row: number, col: number) => p.blanks.some((b) => b.row === row && b.col === col)
  const getAnswer = (row: number, col: number) => p.blanks.find((b) => b.row === row && b.col === col)?.answer

  const handleSubmit = () => {
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
      setFinished(true)
      onComplete?.()
    } else {
      setCurrent((c) => c + 1)
      setInputs({})
      setSubmitted(false)
    }
  }

  if (finished) {
    const pct = totalCells > 0 ? Math.round((correctCells / totalCells) * 100) : 0
    return (
      <div className="ws-screen">
        <header className="ws-header"><button className="ws-back" onClick={onBack}>←</button><span>精算表ドリル</span><div /></header>
        <div className="ws-complete">
          <h2>完了！</h2>
          <p className="ws-score">{correctCells} / {totalCells} セル正解（{pct}%）</p>
          <p className="ws-msg">{pct >= 80 ? '精算表の理解はバッチリです！' : '数字の流れを意識して復習しましょう。'}</p>
          <button className="ws-done-btn" onClick={onBack}>戻る</button>
        </div>
      </div>
    )
  }

  return (
    <div className="ws-screen">
      <header className="ws-header">
        <button className="ws-back" onClick={onBack}>←</button>
        <span>精算表ドリル {current + 1}/{problems.length}</span>
        <div />
      </header>

      <div className="ws-content">
        <div className="ws-instructions">
          <p>{p.instructions}</p>
        </div>

        <div className="ws-table-wrapper">
          <table className="ws-table">
            <thead>
              <tr>
                <th className="ws-acct-header">勘定科目</th>
                {COL_HEADERS.map((h, i) => (
                  <th key={i} className="ws-col-header">{h.split('\n').map((l, j) => <span key={j}>{l}</span>)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {p.accounts.map((acct, row) => (
                <tr key={row}>
                  <td className="ws-acct-cell">{acct}</td>
                  {p.data[row].map((val, col) => {
                    if (isBlank(row, col)) {
                      const key = cellKey(row, col)
                      const userVal = parseInt(inputs[key] || '0')
                      const answer = getAnswer(row, col)!
                      const isCorrect = submitted ? userVal === answer : undefined
                      return (
                        <td key={col} className="ws-input-cell">
                          <input
                            className={`ws-cell-input ${submitted ? (isCorrect ? 'correct' : 'wrong') : ''}`}
                            type="number"
                            value={inputs[key] || ''}
                            onChange={(e) => setInputs((prev) => ({ ...prev, [key]: e.target.value }))}
                            disabled={submitted}
                          />
                          {submitted && !isCorrect && (
                            <span className="ws-correct-val">{answer.toLocaleString()}</span>
                          )}
                        </td>
                      )
                    }
                    return (
                      <td key={col} className="ws-val-cell">
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
          <div className="ws-explanation">
            <strong>解説：</strong>
            <p>{p.explanation}</p>
          </div>
        )}

        {!submitted ? (
          <button className="ws-submit-btn" onClick={handleSubmit}>解答する</button>
        ) : (
          <button className="ws-next-btn" onClick={handleNext}>
            {current + 1 >= problems.length ? '結果を見る' : '次の問題'}
          </button>
        )}
      </div>
    </div>
  )
}
