import { useState } from 'react'
import { recordCompletion } from '../stats'
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon } from '../icons'
import { Button } from '../components/Button'
import { IconButton } from '../components/IconButton'

interface JournalInputScreenProps {
  onBack: () => void
}

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
]

export function JournalInputScreen({ onBack }: JournalInputScreenProps) {
  const [current, setCurrent] = useState(0)
  const [debitAccount, setDebitAccount] = useState('')
  const [debitAmount, setDebitAmount] = useState('')
  const [creditAccount, setCreditAccount] = useState('')
  const [creditAmount, setCreditAmount] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [correctCount, setCorrectCount] = useState(0)
  const [finished, setFinished] = useState(false)

  const p = problems[current]
  const progress = ((current + 1) / problems.length) * 100

  const isCorrectField = (field: 'da' | 'dam' | 'ca' | 'cam') => {
    if (!submitted) return undefined
    switch (field) {
      case 'da': return debitAccount === p.answer.debitAccount
      case 'dam': return parseInt(debitAmount) === p.answer.debitAmount
      case 'ca': return creditAccount === p.answer.creditAccount
      case 'cam': return parseInt(creditAmount) === p.answer.creditAmount
    }
  }

  const isFullyCorrect = submitted &&
    isCorrectField('da') && isCorrectField('dam') &&
    isCorrectField('ca') && isCorrectField('cam')

  const checkAnswer = () => {
    const correct =
      debitAccount === p.answer.debitAccount &&
      parseInt(debitAmount) === p.answer.debitAmount &&
      creditAccount === p.answer.creditAccount &&
      parseInt(creditAmount) === p.answer.creditAmount
    if (correct) setCorrectCount((c) => c + 1)
    setSubmitted(true)
  }

  const handleNext = () => {
    if (current + 1 >= problems.length) {
      recordCompletion('journal-input')
      setFinished(true)
    } else {
      setCurrent((c) => c + 1)
      setDebitAccount('')
      setDebitAmount('')
      setCreditAccount('')
      setCreditAmount('')
      setSubmitted(false)
    }
  }

  const fieldStyle = (ok: boolean | undefined): React.CSSProperties => {
    if (ok === undefined) return {}
    return {
      borderColor: ok ? 'var(--success)' : 'var(--danger)',
      background: ok ? 'rgba(16,185,129,0.05)' : 'rgba(220,38,38,0.05)',
    }
  }

  if (finished) {
    const pct = Math.round((correctCount / problems.length) * 100)
    const passed = pct >= 70
    return (
      <div className="stack">
        <div className="screen-header">
          <IconButton aria-label="Back" onClick={onBack}><ArrowLeftIcon /></IconButton>
          <div className="progress-text">RESULT</div>
        </div>
        <div className="eyebrow accent">DRILL RESULT</div>
        <h1 style={{ fontSize: 28, letterSpacing: '-0.025em' }}>仕訳ドリル結果</h1>
        <section className="profile-hero" style={{ textAlign: 'center' }}>
          <div className="eyebrow" style={{ color: 'rgba(255,255,255,0.65)', marginBottom: 'var(--s-3)' }}>SCORE</div>
          <div className="display" style={{ fontSize: 80, lineHeight: 0.9, letterSpacing: '-0.04em', color: '#fff' }}>{pct}%</div>
          <div style={{ marginTop: 'var(--s-3)', fontSize: 14, color: 'rgba(255,255,255,0.85)', fontWeight: 600 }}>
            {correctCount} / {problems.length} 問正解
          </div>
          <div className="badge" style={{
            marginTop: 'var(--s-3)',
            background: passed ? 'var(--success)' : 'rgba(255,255,255,0.16)',
            color: '#fff', border: 'none', fontSize: 12, padding: '6px 14px',
          }}>
            {passed ? '合格' : '不合格（70% 必要）'}
          </div>
        </section>
        {passed && (
          <div className="feedback-card">
            <div className="feedback-head">
              <div className="feedback-check"><CheckIcon /></div>
              <div className="feedback-title">よくできました！</div>
            </div>
            <div className="feedback-text">仕訳の基本パターンを習得しています。</div>
          </div>
        )}
        <Button variant="default" size="lg" block onClick={() => {
          setCurrent(0); setDebitAccount(''); setDebitAmount(''); setCreditAccount(''); setCreditAmount('');
          setSubmitted(false); setCorrectCount(0); setFinished(false)
        }}>もう一度</Button>
        <Button variant="primary" size="lg" block onClick={onBack}>戻る</Button>
      </div>
    )
  }

  return (
    <div className="stack">
      <div className="screen-header">
        <IconButton aria-label="Back" onClick={onBack}><ArrowLeftIcon /></IconButton>
        <div className="progress-text"><b>{current + 1}</b> / {problems.length}</div>
      </div>

      <div className="progress">
        <div className="progress-fill" style={{ width: `${progress}%` }} />
      </div>

      <div className="eyebrow accent" style={{ marginTop: 'var(--s-4)' }}>仕訳ドリル</div>
      <h2 style={{ fontSize: 18, lineHeight: 1.6, fontFamily: 'var(--font-display)' }}>{p.question}</h2>

      <div className="card" style={{ marginTop: 'var(--s-3)', padding: 'var(--s-4)' }}>
        <div className="eyebrow" style={{ marginBottom: 'var(--s-3)' }}>仕訳を入力してください</div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 'var(--s-3)', alignItems: 'start' }}>
          {/* Debit */}
          <div className="stack-sm">
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--brand)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              借方
            </div>
            <select
              className="input"
              value={debitAccount}
              onChange={(e) => setDebitAccount(e.target.value)}
              disabled={submitted}
              style={fieldStyle(isCorrectField('da'))}
            >
              <option value="">勘定科目を選択</option>
              {p.accountChoices.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
            <input
              className="input"
              type="number"
              placeholder="金額"
              value={debitAmount}
              onChange={(e) => setDebitAmount(e.target.value)}
              disabled={submitted}
              style={fieldStyle(isCorrectField('dam'))}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 36, color: 'var(--text-muted)', fontSize: 18, fontWeight: 300 }}>
            /
          </div>

          {/* Credit */}
          <div className="stack-sm">
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--success)', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              貸方
            </div>
            <select
              className="input"
              value={creditAccount}
              onChange={(e) => setCreditAccount(e.target.value)}
              disabled={submitted}
              style={fieldStyle(isCorrectField('ca'))}
            >
              <option value="">勘定科目を選択</option>
              {p.accountChoices.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
            <input
              className="input"
              type="number"
              placeholder="金額"
              value={creditAmount}
              onChange={(e) => setCreditAmount(e.target.value)}
              disabled={submitted}
              style={fieldStyle(isCorrectField('cam'))}
            />
          </div>
        </div>
      </div>

      {submitted && (
        <div className="feedback-card">
          <div className="feedback-head">
            <div className="feedback-check">
              {isFullyCorrect ? <CheckIcon /> : <span style={{ fontSize: 16 }}>✕</span>}
            </div>
            <div className="feedback-title">{isFullyCorrect ? '正解！' : '不正解'}</div>
          </div>
          <div className="feedback-text">
            <b>正解：</b> （借方）{p.answer.debitAccount} {p.answer.debitAmount.toLocaleString()} ／（貸方）{p.answer.creditAccount} {p.answer.creditAmount.toLocaleString()}
          </div>
          <div style={{ marginTop: 'var(--s-2)', fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6 }}>
            {p.explanation}
          </div>
        </div>
      )}

      {!submitted ? (
        <Button
          variant="primary" size="lg" block
          onClick={checkAnswer}
          disabled={!debitAccount || !debitAmount || !creditAccount || !creditAmount}
        >
          解答する
        </Button>
      ) : (
        <Button variant="primary" size="lg" block onClick={handleNext}>
          {current + 1 >= problems.length ? '結果を見る' : '次の問題'}
          <ArrowRightIcon width={16} height={16} />
        </Button>
      )}
    </div>
  )
}
