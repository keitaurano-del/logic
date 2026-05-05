import { useState } from 'react'
import { createClient } from '@supabase/supabase-js'
import { getLocale } from './i18n'
import './Feedback.css'
import { Capacitor } from '@capacitor/core'

const PROD_API = import.meta.env.VITE_API_URL ?? 'https://logic-u5wn.onrender.com'
const _API_BASE = import.meta.env.DEV
  ? `http://${window.location.hostname}:3001`
  : Capacitor.isNativePlatform() ? PROD_API : ''

const CATEGORIES = ['機能追加', 'バグ報告', 'UI改善', 'その他'] as const

const CATEGORY_GUIDE: Record<string, string> = {
  '機能追加': 'どんな機能があると嫌いですか？なぜ必要かも教えてもらえると実現しやすいです。',
  'バグ報告': 'どの画面で、どのような問題が発生しましたか？再現手順があればめちゃくちゃ実際に助かります。',
  'UI改善': 'どの画面のどこが使いにくいですか？具体的な位置や機能を教えてもらえると改善しやすいです。',
  'その他': '何でもお気軽にお書きください。コンテンツや使い心地、感想何でも心待ちしています。',
}

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
      // サーバーサイドAPI経由で送信（Supabase保存 + Jira起票）
      try {
        const res = await fetch(`${_API_BASE}/api/feedback`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ category, message: message.trim(), locale: getLocale() }),
        })
        if (!res.ok) throw new Error('server error')
      } catch {
        // サーバー未接続時はSupabase直接フォールバック
        if (_supabase) {
          const { error: dbErr } = await _supabase.from('feedback').insert({
            category, message: message.trim(), locale: getLocale(),
          })
          if (dbErr) throw new Error(dbErr.message)
        }
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
        <h2>ご要望・フィードバック</h2>
      </header>

      {sent ? (
        <div className="fb-success">
          <div className="fb-success-icon"></div>
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
          {CATEGORY_GUIDE[category] && (
            <p style={{ fontSize: 13, color: 'var(--text-secondary, #7A849E)', margin: '4px 0 8px', lineHeight: 1.6 }}>
              {CATEGORY_GUIDE[category]}
            </p>
          )}
          <textarea
            className="fb-textarea"
            placeholder={category === 'バグ報告' ? '例: レッスン第3問目で「次へ」ボタンを押すと画面が白くなる。iOS 17.2、iPhone 15で発生。' : 'アプリの改善点やほしい機能を教えてください...'}
            value={message}
            onChange={e => setMessage(e.target.value)}
            rows={6}
          />

          {error && <p style={{ color: 'var(--danger, #EF4444)', fontSize: 13, marginTop: 8 }}>{error}</p>}
          <button className="fb-submit" onClick={handleSubmit} disabled={!message.trim() || loading}>
            {loading ? '送信中...' : 'フィードバックを送信'}
          </button>
        </div>
      )}
    </div>
  )
}
