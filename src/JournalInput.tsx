import { useState } from 'react'
import './JournalInput.css'

type JournalEntry = {
  debitAccount: string
  debitAmount: number
  creditAccount: string
  creditAmount: number
}

type JournalProblem = {
  id: number
  question: string
  answer: JournalEntry
  accountChoices: string[]
  explanation: string
}

const problems: JournalProblem[] = [
  { id: 1, question: '現金200,000円を当座預金に預け入れた。',
    answer: { debitAccount: '当座預金', debitAmount: 200000, creditAccount: '現金', creditAmount: 200000 },
    accountChoices: ['現金', '当座預金', '普通預金', '売掛金', '買掛金', '仕入', '売上'],
    explanation: '当座預金（資産）が増加→借方、現金（資産）が減少→貸方。' },
  { id: 2, question: '商品300,000円を掛けで仕入れた。',
    answer: { debitAccount: '仕入', debitAmount: 300000, creditAccount: '買掛金', creditAmount: 300000 },
    accountChoices: ['仕入', '売上', '買掛金', '売掛金', '現金', '当座預金', '未払金'],
    explanation: '仕入（費用）が増加→借方、買掛金（負債）が増加→貸方。' },
  { id: 3, question: '商品500,000円を売り上げ、代金は掛けとした。',
    answer: { debitAccount: '売掛金', debitAmount: 500000, creditAccount: '売上', creditAmount: 500000 },
    accountChoices: ['売上', '売掛金', '現金', '買掛金', '仕入', '受取手形', '前受金'],
    explanation: '売掛金（資産）が増加→借方、売上（収益）が増加→貸方。' },
  { id: 4, question: '備品150,000円を購入し、代金は月末払いとした。',
    answer: { debitAccount: '備品', debitAmount: 150000, creditAccount: '未払金', creditAmount: 150000 },
    accountChoices: ['備品', '消耗品費', '未払金', '買掛金', '現金', '当座預金', '借入金'],
    explanation: '備品（資産）が増加→借方。商品以外の掛け払いは未払金（負債）→貸方。' },
  { id: 5, question: '銀行から400,000円を借り入れ、当座預金に入金された。',
    answer: { debitAccount: '当座預金', debitAmount: 400000, creditAccount: '借入金', creditAmount: 400000 },
    accountChoices: ['当座預金', '普通預金', '借入金', '貸付金', '未払金', '現金', '資本金'],
    explanation: '当座預金（資産）が増加→借方、借入金（負債）が増加→貸方。' },
  { id: 6, question: '売掛金の回収として、現金80,000円を受け取った。',
    answer: { debitAccount: '現金', debitAmount: 80000, creditAccount: '売掛金', creditAmount: 80000 },
    accountChoices: ['現金', '売掛金', '売上', '受取手形', '当座預金', '前受金', '買掛金'],
    explanation: '現金（資産）が増加→借方、売掛金（資産）が減少→貸方。' },
  { id: 7, question: '買掛金250,000円を小切手を振り出して支払った。',
    answer: { debitAccount: '買掛金', debitAmount: 250000, creditAccount: '当座預金', creditAmount: 250000 },
    accountChoices: ['買掛金', '当座預金', '現金', '支払手形', '未払金', '仕入', '売掛金'],
    explanation: '買掛金（負債）が減少→借方、当座預金（資産）が減少→貸方。' },
  { id: 8, question: '給料180,000円を現金で支払った。うち源泉所得税20,000円を差し引いた。',
    answer: { debitAccount: '給料', debitAmount: 180000, creditAccount: '現金', creditAmount: 160000 },
    accountChoices: ['給料', '現金', '預り金', '未払金', '仮払金', '当座預金', '立替金'],
    explanation: '（借方）給料180,000 ／（貸方）現金160,000・預り金20,000。源泉税は預り金。' },
  { id: 9, question: '商品を売り上げ、約束手形120,000円を受け取った。',
    answer: { debitAccount: '受取手形', debitAmount: 120000, creditAccount: '売上', creditAmount: 120000 },
    accountChoices: ['受取手形', '支払手形', '売上', '売掛金', '現金', '手形貸付金', '仕入'],
    explanation: '受取手形（資産）が増加→借方、売上（収益）が増加→貸方。' },
  { id: 10, question: '家賃60,000円を現金で支払った。',
    answer: { debitAccount: '支払家賃', debitAmount: 60000, creditAccount: '現金', creditAmount: 60000 },
    accountChoices: ['支払家賃', '前払家賃', '現金', '当座預金', '未払家賃', '受取家賃', '水道光熱費'],
    explanation: '支払家賃（費用）が増加→借方、現金（資産）が減少→貸方。' },
  { id: 11, question: '収入印紙5,000円を現金で購入した。',
    answer: { debitAccount: '租税公課', debitAmount: 5000, creditAccount: '現金', creditAmount: 5000 },
    accountChoices: ['租税公課', '通信費', '消耗品費', '現金', '当座預金', '雑費', '支払手数料'],
    explanation: '収入印紙は「租税公課」で処理します。' },
  { id: 12, question: '商品100,000円を仕入れ、引取運賃3,000円を現金で支払った。',
    answer: { debitAccount: '仕入', debitAmount: 103000, creditAccount: '現金', creditAmount: 103000 },
    accountChoices: ['仕入', '発送費', '現金', '買掛金', '未払金', '当座預金', '支払運賃'],
    explanation: '引取運賃は仕入原価に含めます。仕入100,000＋運賃3,000＝103,000円。' },
  { id: 13, question: '貸付金の利息8,000円を現金で受け取った。',
    answer: { debitAccount: '現金', debitAmount: 8000, creditAccount: '受取利息', creditAmount: 8000 },
    accountChoices: ['現金', '受取利息', '支払利息', '貸付金', '当座預金', '未収利息', '雑益'],
    explanation: '現金（資産）が増加→借方、受取利息（収益）が増加→貸方。' },
  { id: 14, question: '従業員の出張にあたり、旅費の概算額40,000円を現金で渡した。',
    answer: { debitAccount: '仮払金', debitAmount: 40000, creditAccount: '現金', creditAmount: 40000 },
    accountChoices: ['仮払金', '旅費交通費', '立替金', '現金', '前払金', '未払金', '仮受金'],
    explanation: '精算前の概算払いは「仮払金」で処理します。' },
  { id: 15, question: '商品の注文を受け、手付金50,000円を現金で受け取った。',
    answer: { debitAccount: '現金', debitAmount: 50000, creditAccount: '前受金', creditAmount: 50000 },
    accountChoices: ['現金', '前受金', '売上', '仮受金', '売掛金', '前払金', '預り金'],
    explanation: '商品引渡前の手付金は「前受金」（負債）。' },
  { id: 16, question: '決算にて、保険料の前払い分24,000円を計上する。',
    answer: { debitAccount: '前払保険料', debitAmount: 24000, creditAccount: '保険料', creditAmount: 24000 },
    accountChoices: ['前払保険料', '保険料', '未払保険料', '現金', '前受保険料', '支払保険料', '消耗品'],
    explanation: '（借方）前払保険料 ／（貸方）保険料。費用を減らして資産に繰り延べます。' },
  { id: 17, question: '売掛金残高800,000円に対し、2%の貸倒引当金を設定する（差額補充法、残高0円）。',
    answer: { debitAccount: '貸倒引当金繰入', debitAmount: 16000, creditAccount: '貸倒引当金', creditAmount: 16000 },
    accountChoices: ['貸倒引当金繰入', '貸倒引当金', '貸倒損失', '売掛金', '受取手形', '雑損', '現金'],
    explanation: '800,000×2%＝16,000円。繰入（費用）→借方、引当金（負債）→貸方。' },
  { id: 18, question: '建物（取得原価6,000,000円、残存価額0円、耐用年数30年）の減価償却を間接法で記帳する。',
    answer: { debitAccount: '減価償却費', debitAmount: 200000, creditAccount: '建物減価償却累計額', creditAmount: 200000 },
    accountChoices: ['減価償却費', '建物減価償却累計額', '建物', '修繕費', '備品', '減損損失', '現金'],
    explanation: '6,000,000÷30＝200,000円。間接法なので累計額を貸方に。' },
  { id: 19, question: '小口現金係に小切手30,000円を振り出して補給した。',
    answer: { debitAccount: '小口現金', debitAmount: 30000, creditAccount: '当座預金', creditAmount: 30000 },
    accountChoices: ['小口現金', '当座預金', '現金', '仮払金', '消耗品費', '雑費', '通信費'],
    explanation: '小口現金（資産）が増加→借方、当座預金（資産）が減少→貸方。' },
  { id: 20, question: '車両（帳簿価額350,000円）を400,000円で売却し、現金を受け取った。',
    answer: { debitAccount: '現金', debitAmount: 400000, creditAccount: '車両', creditAmount: 350000 },
    accountChoices: ['現金', '車両', '固定資産売却益', '固定資産売却損', '車両減価償却累計額', '未収入金', '備品'],
    explanation: '売却額400,000−帳簿350,000＝50,000円の売却益。（貸方）車両350,000・固定資産売却益50,000' },
]

type Props = { onBack: () => void; onComplete?: () => void }

export default function JournalInput({ onBack, onComplete }: Props) {
  const [current, setCurrent] = useState(0)
  const [debitAccount, setDebitAccount] = useState('')
  const [debitAmount, setDebitAmount] = useState('')
  const [creditAccount, setCreditAccount] = useState('')
  const [creditAmount, setCreditAmount] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [finished, setFinished] = useState(false)

  const p = problems[current]

  const checkAnswer = () => {
    const isDebitAccCorrect = debitAccount === p.answer.debitAccount
    const isDebitAmtCorrect = parseInt(debitAmount) === p.answer.debitAmount
    const isCreditAccCorrect = creditAccount === p.answer.creditAccount
    const isCreditAmtCorrect = parseInt(creditAmount) === p.answer.creditAmount

    if (isDebitAccCorrect && isDebitAmtCorrect && isCreditAccCorrect && isCreditAmtCorrect) {
      setCorrectCount((c) => c + 1)
    }
    setSubmitted(true)
  }

  const handleNext = () => {
    if (current + 1 >= problems.length) {
      setFinished(true)
      onComplete?.()
    } else {
      setCurrent((c) => c + 1)
      setDebitAccount('')
      setDebitAmount('')
      setCreditAccount('')
      setCreditAmount('')
      setSubmitted(false)
    }
  }

  const isCorrectField = (field: 'da' | 'dam' | 'ca' | 'cam') => {
    if (!submitted) return undefined
    switch (field) {
      case 'da': return debitAccount === p.answer.debitAccount
      case 'dam': return parseInt(debitAmount) === p.answer.debitAmount
      case 'ca': return creditAccount === p.answer.creditAccount
      case 'cam': return parseInt(creditAmount) === p.answer.creditAmount
    }
  }

  if (finished) {
    const pct = Math.round((correctCount / problems.length) * 100)
    return (
      <div className="ji-screen">
        <header className="ji-header">
          <button className="ji-back" onClick={onBack}>←</button>
          <span>仕訳入力ドリル</span>
          <div />
        </header>
        <div className="ji-complete">
          <h2>完了！</h2>
          <p className="ji-score">{correctCount} / {problems.length} 問正解（{pct}%）</p>
          <div className="ji-score-bar"><div className="ji-score-fill" style={{ width: `${pct}%` }} /></div>
          <p className="ji-msg">
            {pct >= 90 ? '素晴らしい！仕訳は完璧です。' :
             pct >= 70 ? 'よくできました！間違えた仕訳を復習しましょう。' :
             '繰り返し練習して仕訳パターンを覚えましょう。'}
          </p>
          <button className="ji-done-btn" onClick={onBack}>戻る</button>
        </div>
      </div>
    )
  }

  return (
    <div className="ji-screen">
      <header className="ji-header">
        <button className="ji-back" onClick={onBack}>←</button>
        <span>仕訳入力ドリル</span>
        <span className="ji-progress">{current + 1}/{problems.length}</span>
      </header>
      <div className="ji-progress-bar"><div className="ji-progress-fill" style={{ width: `${((current + 1) / problems.length) * 100}%` }} /></div>

      <div className="ji-content">
        <div className="ji-question">
          <p>{p.question}</p>
        </div>

        <div className="ji-entry-table">
          {/* Debit side */}
          <div className="ji-side">
            <span className="ji-side-label debit">借方</span>
            <select
              className={`ji-select ${submitted ? (isCorrectField('da') ? 'correct' : 'wrong') : ''}`}
              value={debitAccount}
              onChange={(e) => setDebitAccount(e.target.value)}
              disabled={submitted}
            >
              <option value="">勘定科目を選択</option>
              {p.accountChoices.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
            <input
              className={`ji-amount ${submitted ? (isCorrectField('dam') ? 'correct' : 'wrong') : ''}`}
              type="number"
              placeholder="金額"
              value={debitAmount}
              onChange={(e) => setDebitAmount(e.target.value)}
              disabled={submitted}
            />
          </div>

          <div className="ji-slash">/</div>

          {/* Credit side */}
          <div className="ji-side">
            <span className="ji-side-label credit">貸方</span>
            <select
              className={`ji-select ${submitted ? (isCorrectField('ca') ? 'correct' : 'wrong') : ''}`}
              value={creditAccount}
              onChange={(e) => setCreditAccount(e.target.value)}
              disabled={submitted}
            >
              <option value="">勘定科目を選択</option>
              {p.accountChoices.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
            <input
              className={`ji-amount ${submitted ? (isCorrectField('cam') ? 'correct' : 'wrong') : ''}`}
              type="number"
              placeholder="金額"
              value={creditAmount}
              onChange={(e) => setCreditAmount(e.target.value)}
              disabled={submitted}
            />
          </div>
        </div>

        {submitted && (
          <div className="ji-feedback">
            <div className="ji-correct-answer">
              <strong>正解：</strong>
              <span className="ji-ca-debit">（借方）{p.answer.debitAccount} {p.answer.debitAmount.toLocaleString()}</span>
              <span className="ji-ca-sep">／</span>
              <span className="ji-ca-credit">（貸方）{p.answer.creditAccount} {p.answer.creditAmount.toLocaleString()}</span>
            </div>
            <p className="ji-explanation">{p.explanation}</p>
          </div>
        )}

        {!submitted ? (
          <button
            className="ji-submit-btn"
            onClick={checkAnswer}
            disabled={!debitAccount || !debitAmount || !creditAccount || !creditAmount}
          >
            解答する
          </button>
        ) : (
          <button className="ji-next-btn" onClick={handleNext}>
            {current + 1 >= problems.length ? '結果を見る' : '次の問題'}
          </button>
        )}
      </div>
    </div>
  )
}
