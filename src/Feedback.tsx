import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { getLocale } from './i18n'
import './Feedback.css'

const CATEGORIES = ['機能追加', 'バグ報告', 'UI改善', 'その他'] as const

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''
const _supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null

export default function Feedback({ onBack }: { onBack: () => void }) {
  const [category, setCategory] = useState<string>(CATEGORIES[0])
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!message.trim()) return
    setLoading(true)
    setError('')
    try {
      if (_supabase) {
        const { error: dbErr } = await _supabase.from('feedback').insert({
          category,
          message: message.trim(),
          locale: getLocale(),
        })
        if (dbErr) throw new Error(dbErr.message)
      } else {
        // Supabase未設定時のフォールバック
        const subject = encodeURIComponent(`[Logic フィードバック] ${category}`)
        const body = encodeURIComponent(`カテゴリ: ${category}\n\n${message.trim()}`)
        window.location.href = `mailto:keita.urano@gmail.com?subject=${subject}&body=${body}`
      }
      setSent(true)
    } catch (e: unknown) {
      setError((e as Error).message || '送信に失敗しました。もう一度お試しください')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fb-screen">
      <header className="fb-header">
        <button className="fb-back" onClick={onBack}>← 戻る</button>
        <h2>💡 ご要望・フィードバック</h2>
      </header>

      {sent ? (
        <div className="fb-success">
          <div className="fb-success-icon">✅</div>
          <h3>ありがとうございます！</h3>
          <p>メールアプリが開きます。送信ボタンを押してフィードバックを送ってください。</p>
          <button className="fb-done-btn" onClick={onBack}>ホームに戻る</button>
        </div>
      ) : (
        <div className="fb-body">
          <label className="fb-label">カテゴリ</label>
          <div className="fb-cats">
            {CATEGORIES.map(c => (
              <button key={c} className={`fb-cat ${category === c ? 'active' : ''}`} onClick={() => setCategory(c)}>{c}</button>
            ))}
          </div>

          <label className="fb-label">内容</label>
          <textarea
            className="fb-textarea"
            placeholder="アプリの改善点やほしい機能を教えてください..."
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows={6}
          />

          {error && <p style={{ color: 'var(--danger, #EF4444)', fontSize: 13, marginTop: 8 }}>{error}</p>}
          <button className="fb-submit" onClick={handleSubmit} disabled={!message.trim() || loading}>
            {loading ? '送信中...' : '📩 フィードバックを送信'}
          </button>
        </div>
      )}
    </div>
  )
}
