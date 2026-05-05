import { useState, useEffect, useCallback } from 'react'
import { loadEntries, upsertEntry, updateUserMemo, generateAISummary, type NotebookEntry } from './notebookStore'
import { getCompletedLessons, getStudyHours } from './stats'
import { getCardStats } from './flashcardData'
import './Notebook.css'

export default function Notebook() {
  const [entries, setEntries] = useState<NotebookEntry[]>(loadEntries())
  const [generating, setGenerating] = useState(false)

  const today = new Date().toISOString().slice(0, 10)
  const todayEntry = entries.find(e => e.date === today)

  const generateToday = useCallback(async () => {
    if (todayEntry?.aiSummary) return
    setGenerating(true)
    const completed = getCompletedLessons()
    const fc = getCardStats()
    const studyMin = parseFloat(getStudyHours()) * 60
    await generateAISummary(today, {
      completedLessons: completed.slice(-5),
      flashcardStats: { correct: fc.mastered, total: fc.total },
      studyMinutes: Math.round(studyMin),
    })
    setEntries(loadEntries())
    setGenerating(false)
  }, [today, todayEntry])

  // 当日 entry が無い場合は localStorage に作成し再読込、AI summary 未生成なら生成（外部状態同期）
  useEffect(() => {
    if (!todayEntry) {
      upsertEntry({ date: today })
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEntries(loadEntries())
    }
    if (!todayEntry?.aiSummary) {
      generateToday()
    }
  }, [today, todayEntry, generateToday])

  const handleMemoChange = (date: string, memo: string) => {
    updateUserMemo(date, memo)
    setEntries(loadEntries())
  }

  const formatDate = (date: string) => {
    const d = new Date(date)
    const days = ['日', '月', '火', '水', '木', '金', '土']
    return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日（${days[d.getDay()]}）`
  }

  return (
    <div className="nb-screen">
      <div className="nb-header">
        <h2>手帳（学習ジャーナル）</h2>
        <p>AIがあなたの学習を自動記録します</p>
      </div>

      <div className="nb-list">
        {entries.length === 0 && (
          <div className="nb-empty">まだ記録がありません。レッスンを完了すると自動で記録されます。</div>
        )}
        {entries.map((entry, idx) => (
          <div key={entry.id} className={`nb-card ${idx === 0 && entry.date === today ? 'nb-today' : ''}`}>
            <div className="nb-card-header">
              <span className="nb-date">{formatDate(entry.date)}</span>
              {entry.date === today && <span className="nb-today-badge">今日</span>}
            </div>

            <div className="nb-section">
              <div className="nb-section-label">AI サマリー</div>
              <div className="nb-ai-summary">
                {entry.aiSummary ? (
                  entry.aiSummary
                ) : generating && entry.date === today ? (
                  <span className="nb-skeleton">生成中...</span>
                ) : (
                  <span className="nb-placeholder">まだ記録がありません</span>
                )}
              </div>
            </div>

            <div className="nb-section">
              <div className="nb-section-label">あなたのメモ</div>
              <textarea
                className="nb-memo"
                placeholder="今日の気づきや明日への目標..."
                value={entry.userMemo}
                onChange={e => handleMemoChange(entry.date, e.target.value)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
