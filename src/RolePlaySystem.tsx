import { useState, useRef, useEffect } from 'react'
import {
  scenarioTemplates,
  type ScenarioTemplate,
  type ScenarioSetup,
  type ScenarioFormat,
  type PartnerProfile,
} from './roleplayScenarios'
import {
  addSession,
  updateSession,
  buildHistorySummary,
  loadHistory,
  type RolePlayScore,
  type SessionSummary,
} from './roleplayHistory'
import './RolePlaySystem.css'

const API_BASE = import.meta.env.DEV ? `http://${window.location.hostname}:3001` : ''

type Message = { role: 'user' | 'assistant'; content: string }

type Screen =
  | { type: 'select' }
  | { type: 'setup'; template: ScenarioTemplate }
  | { type: 'chat'; setup: ScenarioSetup }
  | { type: 'score'; setup: ScenarioSetup; messages: Message[] }

export default function RolePlaySystem({ onBack }: { onBack: () => void }) {
  const [screen, setScreen] = useState<Screen>({ type: 'select' })

  if (screen.type === 'select') {
    return <ScenarioSelect onBack={onBack} onSelect={(t) => setScreen({ type: 'setup', template: t })} />
  }
  if (screen.type === 'setup') {
    return (
      <SetupScreen
        template={screen.template}
        onBack={() => setScreen({ type: 'select' })}
        onStart={(setup) => setScreen({ type: 'chat', setup })}
      />
    )
  }
  if (screen.type === 'chat') {
    return (
      <ChatScreen
        setup={screen.setup}
        onBack={() => setScreen({ type: 'select' })}
        onFinish={(msgs) => setScreen({ type: 'score', setup: screen.setup, messages: msgs })}
      />
    )
  }
  if (screen.type === 'score') {
    return (
      <ScoreScreen
        setup={screen.setup}
        messages={screen.messages}
        onBack={() => setScreen({ type: 'select' })}
        onRetry={() => setScreen({ type: 'chat', setup: screen.setup })}
      />
    )
  }
  return null
}

// =============================================
// 1. シナリオ選択画面
// =============================================
function ScenarioSelect({ onBack, onSelect }: { onBack: () => void; onSelect: (t: ScenarioTemplate) => void }) {
  const categories = [...new Set(scenarioTemplates.map((t) => t.category))]
  const history = loadHistory()

  const getScenarioStats = (id: string) => {
    const sessions = history.filter((s) => s.scenarioId === id)
    if (sessions.length === 0) return null
    const last = sessions[sessions.length - 1]
    return { count: sessions.length, lastScore: last.totalScore, maxScore: last.maxScore }
  }

  return (
    <div className="rps-screen">
      <header className="rps-header">
        <button className="rps-back" onClick={onBack}>←</button>
        <span className="rps-header-title">ロールプレイ</span>
        <div />
      </header>

      <div className="rps-select-hero">
        <h2>シナリオを選択</h2>
        <p>練習したい場面を選んでください</p>
      </div>

      {categories.map((cat) => (
        <div key={cat} className="rps-category-section">
          <h3 className="rps-category-title">{cat}</h3>
          <div className="rps-scenario-list">
            {scenarioTemplates.filter((t) => t.category === cat).map((template) => {
              const stats = getScenarioStats(template.id)
              return (
                <button key={template.id} className="rps-scenario-card" onClick={() => onSelect(template)}>
                  <span className="rps-scenario-icon">{template.icon}</span>
                  <div className="rps-scenario-info">
                    <strong>{template.title}</strong>
                    <span>{template.description}</span>
                    {stats && (
                      <span className="rps-scenario-stats">
                        {stats.count}回練習 · 最新 {stats.lastScore}/{stats.maxScore}点
                      </span>
                    )}
                  </div>
                  <span className="rps-scenario-arrow">›</span>
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

// =============================================
// 2. セットアップ画面
// =============================================
function SetupScreen({
  template,
  onBack,
  onStart,
}: {
  template: ScenarioTemplate
  onBack: () => void
  onStart: (setup: ScenarioSetup) => void
}) {
  const [format, setFormat] = useState<ScenarioFormat>('in-person')
  const [partner, setPartner] = useState<PartnerProfile>({ ...template.defaultPartner })
  const [goal, setGoal] = useState('')
  const [context, setContext] = useState('')

  const updatePartner = (key: keyof PartnerProfile, value: string) => {
    setPartner((p) => ({ ...p, [key]: value }))
  }

  return (
    <div className="rps-screen">
      <header className="rps-header">
        <button className="rps-back" onClick={onBack}>←</button>
        <span className="rps-header-title">セットアップ</span>
        <div />
      </header>

      <div className="rps-setup-content">
        <div className="rps-setup-scenario">
          <span className="rps-setup-icon">{template.icon}</span>
          <div>
            <strong>{template.title}</strong>
            <span className="rps-setup-mode-label">
              {template.mode === 'presentation' ? 'プレゼン採点モード' : 'チャットモード'}
            </span>
          </div>
        </div>

        {/* 対面 / オンライン */}
        <div className="rps-field">
          <label className="rps-label">形式</label>
          <div className="rps-format-toggle">
            <button
              className={`rps-format-btn ${format === 'in-person' ? 'active' : ''}`}
              onClick={() => setFormat('in-person')}
            >
              対面
            </button>
            <button
              className={`rps-format-btn ${format === 'online' ? 'active' : ''}`}
              onClick={() => setFormat('online')}
            >
              オンライン
            </button>
          </div>
        </div>

        {/* 相手の情報 */}
        <div className="rps-field">
          <label className="rps-label">相手の情報</label>
          <div className="rps-partner-fields">
            <div className="rps-input-row">
              <input
                className="rps-input" placeholder="名前"
                value={partner.name} onChange={(e) => updatePartner('name', e.target.value)}
              />
              <input
                className="rps-input" placeholder="役職"
                value={partner.role} onChange={(e) => updatePartner('role', e.target.value)}
              />
            </div>
            {template.category === '社外' && (
              <input
                className="rps-input" placeholder="会社名"
                value={partner.company} onChange={(e) => updatePartner('company', e.target.value)}
              />
            )}
            <input
              className="rps-input" placeholder="性格・特徴（例：慎重派、数字を重視）"
              value={partner.personality} onChange={(e) => updatePartner('personality', e.target.value)}
            />
            <input
              className="rps-input" placeholder="関心事（例：コスト削減、生産性向上）"
              value={partner.interests} onChange={(e) => updatePartner('interests', e.target.value)}
            />
            <input
              className="rps-input" placeholder="懸念事項（例：予算制約、リスク）"
              value={partner.concerns} onChange={(e) => updatePartner('concerns', e.target.value)}
            />
          </div>
        </div>

        {/* ゴール */}
        <div className="rps-field">
          <label className="rps-label">今回のゴール</label>
          {template.sampleGoals.length > 0 && (
            <div className="rps-goal-chips">
              {template.sampleGoals.map((g) => (
                <button
                  key={g}
                  className={`rps-goal-chip ${goal === g ? 'active' : ''}`}
                  onClick={() => setGoal(goal === g ? '' : g)}
                >
                  {g}
                </button>
              ))}
            </div>
          )}
          <input
            className="rps-input"
            placeholder="自由にゴールを入力..."
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
          />
        </div>

        {/* 補足情報 */}
        <div className="rps-field">
          <label className="rps-label">補足情報（任意）</label>
          <textarea
            className="rps-textarea"
            placeholder="背景情報や想定されるシチュエーションなど..."
            value={context}
            onChange={(e) => setContext(e.target.value)}
            rows={3}
          />
        </div>

        <button
          className="rps-start-btn"
          onClick={() => onStart({ template, format, partner, goal, context })}
        >
          {template.mode === 'presentation' ? 'プレゼンを始める' : '会話を始める'}
        </button>
      </div>
    </div>
  )
}

// =============================================
// 3. チャット画面（AI接続）
// =============================================
function ChatScreen({
  setup,
  onBack,
  onFinish,
}: {
  setup: ScenarioSetup
  onBack: () => void
  onFinish: (messages: Message[]) => void
}) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [started, setStarted] = useState(false)
  const [error, setError] = useState('')
  const [isListening, setIsListening] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const inputRef = useRef('')

  // Keep ref in sync with state
  useEffect(() => { inputRef.current = input }, [input])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const callAPI = async (msgs: Message[]): Promise<string> => {
    const res = await fetch(`${API_BASE}/api/roleplay/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: msgs, setup }),
    })
    if (!res.ok) throw new Error('API error')
    const data = await res.json()
    return data.content
  }

  const startSession = async () => {
    setStarted(true)
    setIsLoading(true)
    setError('')
    try {
      // Send empty user message to get opening
      const openingPrompt: Message[] = [{ role: 'user', content: '（会話を始めます。最初の挨拶をお願いします。）' }]
      const reply = await callAPI(openingPrompt)
      setMessages([{ role: 'assistant', content: reply }])
    } catch {
      setError('サーバーに接続できませんでした。サーバーが起動しているか確認してください。')
    }
    setIsLoading(false)
  }

  const sendMessage = async (overrideText?: string) => {
    const text = overrideText ?? input
    if (!text.trim() || isLoading) return
    const userMsg = text.trim()
    const newMessages: Message[] = [...messages, { role: 'user', content: userMsg }]
    setMessages(newMessages)
    setInput('')
    setIsLoading(true)
    setError('')
    try {
      const reply = await callAPI(newMessages)
      setMessages([...newMessages, { role: 'assistant', content: reply }])
    } catch {
      setError('応答の取得に失敗しました。もう一度お試しください。')
    }
    setIsLoading(false)
  }

  // Speech recognition
  const manualStopRef = useRef(false)

  const startListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) {
      setError('このブラウザは音声入力に対応していません')
      return
    }

    // Request microphone permission first (needed for mobile)
    navigator.mediaDevices?.getUserMedia({ audio: true })
      .then((stream) => {
        // Stop the stream immediately - we just needed the permission
        stream.getTracks().forEach((t) => t.stop())

        const recognition = new SR()
        recognition.lang = 'ja-JP'
        recognition.interimResults = true
        recognition.continuous = false  // false works better on mobile
        recognitionRef.current = recognition
        manualStopRef.current = false

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          let final = ''
          let interim = ''
          for (let i = 0; i < event.results.length; i++) {
            const result = event.results[i]
            if (result.isFinal) {
              final += result[0].transcript
            } else {
              interim += result[0].transcript
            }
          }
          const transcript = final || interim
          setInput(transcript)
          inputRef.current = transcript
        }

        recognition.onend = () => {
          setIsListening(false)
          // Only auto-send if user manually stopped (not if browser auto-stopped)
          if (manualStopRef.current) {
            const text = inputRef.current.trim()
            if (text) {
              sendMessage(text)
            }
          }
        }

        recognition.onerror = (event: Event) => {
          setIsListening(false)
          const err = event as Event & { error?: string }
          if (err.error === 'not-allowed') {
            setError('マイクのアクセスが許可されていません。ブラウザの設定を確認してください。')
          }
        }

        recognition.start()
        setIsListening(true)
      })
      .catch(() => {
        setError('マイクのアクセスが許可されていません。ブラウザの設定を確認してください。')
      })
  }

  const stopListening = () => {
    manualStopRef.current = true
    recognitionRef.current?.stop()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage()
  }

  const userMessageCount = messages.filter((m) => m.role === 'user').length
  const isPres = setup.template.mode === 'presentation'

  return (
    <div className="rps-chat-screen">
      <header className="rps-header">
        <button className="rps-back" onClick={onBack}>←</button>
        <div className="rps-header-center">
          <span className="rps-header-title">{setup.template.title}</span>
          <span className="rps-header-sub">
            {setup.partner.name} · {setup.format === 'online' ? 'オンライン' : '対面'}
          </span>
        </div>
        {started && userMessageCount >= 2 && (
          <button className="rps-end-btn" onClick={() => onFinish(messages)}>
            終了
          </button>
        )}
      </header>

      {/* Avatar */}
      <div className="rps-chat-avatar">
        <p className="rps-chat-partner-name">{setup.partner.name}</p>
        <p className="rps-chat-partner-role">
          {setup.partner.company ? `${setup.partner.company} ` : ''}{setup.partner.role}
        </p>
      </div>

      {!started ? (
        <div className="rps-chat-start">
          <div className="rps-chat-brief">
            <div className="rps-brief-item">
              <span className="rps-brief-label">形式</span>
              <span>{setup.format === 'online' ? 'オンライン' : '対面'}</span>
            </div>
            {setup.goal && (
              <div className="rps-brief-item">
                <span className="rps-brief-label">ゴール</span>
                <span>{setup.goal}</span>
              </div>
            )}
            <div className="rps-brief-item">
              <span className="rps-brief-label">相手の関心</span>
              <span>{setup.partner.interests}</span>
            </div>
            <div className="rps-brief-item">
              <span className="rps-brief-label">相手の懸念</span>
              <span>{setup.partner.concerns}</span>
            </div>
          </div>
          <button className="rps-start-btn" onClick={startSession}>
            {isPres ? 'プレゼンを始める' : '会話を始める'}
          </button>
        </div>
      ) : (
        <>
          <div className="rps-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`rps-msg ${msg.role}`}>
                <div className="rps-msg-bubble">{msg.content}</div>
              </div>
            ))}
            {isLoading && (
              <div className="rps-msg assistant">
                <div className="rps-msg-bubble rps-typing"><span /><span /><span /></div>
              </div>
            )}
            {error && (
              <div className="rps-error">
                {error}
                <button className="rps-error-retry" onClick={() => {
                  if (messages.length === 0) startSession()
                  else sendMessage(messages[messages.length - 1]?.role === 'user' ? messages[messages.length - 1].content : undefined)
                }}>再試行</button>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form className="rps-input-area" onSubmit={handleSubmit}>
            <button
              className={`rps-mic ${isListening ? 'active' : ''}`}
              type="button"
              onClick={isListening ? stopListening : startListening}
              disabled={isLoading}
            >
              {isListening ? (
                <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
                  <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="22" height="22">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="23" />
                  <line x1="8" y1="23" x2="16" y2="23" />
                </svg>
              )}
            </button>
            <input
              className="rps-input-chat"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={isListening ? '話してください...' : (isPres ? 'プレゼン内容を入力...' : 'メッセージを入力...')}
              disabled={isLoading || isListening}
            />
            <button className="rps-send" type="submit" disabled={!input.trim() || isLoading || isListening}>
              送信
            </button>
          </form>
        </>
      )}
    </div>
  )
}

// =============================================
// 4. 採点画面（AI採点 + 履歴保存）
// =============================================
function ScoreScreen({
  setup,
  messages,
  onBack,
  onRetry,
}: {
  setup: ScenarioSetup
  messages: Message[]
  onBack: () => void
  onRetry: () => void
}) {
  const [scores, setScores] = useState<RolePlayScore[]>([])
  const [overall, setOverall] = useState('')
  const [summary, setSummary] = useState<SessionSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [retryCount, setRetryCount] = useState(0)
  const savedRef = useRef(false)

  useEffect(() => {
    const sessionId = `${Date.now()}`

    const fetchScore = async () => {
      const historySummary = buildHistorySummary(setup.template.id)
      try {
        const res = await fetch(`${API_BASE}/api/roleplay/score`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages, setup, historySummary }),
        })
        if (!res.ok) throw new Error('Score API error')
        const data = await res.json()
        setScores(data.scores)
        setOverall(data.overall)

        // Save to history
        if (!savedRef.current) {
          savedRef.current = true
          const total = data.scores.reduce((s: number, c: RolePlayScore) => s + c.score, 0)
          const max = data.scores.reduce((s: number, c: RolePlayScore) => s + c.maxScore, 0)
          addSession({
            id: sessionId,
            date: new Date().toISOString().slice(0, 10),
            scenarioId: setup.template.id,
            scenarioTitle: setup.template.title,
            mode: setup.template.mode,
            goal: setup.goal,
            messages,
            scores: data.scores,
            overall: data.overall,
            totalScore: total,
            maxScore: max,
          })
        }
      } catch {
        setError('採点に失敗しました。もう一度お試しください。')
      }
      setLoading(false)
    }

    // Fetch summary in parallel
    const fetchSummary = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/roleplay/summary`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages, setup }),
        })
        if (res.ok) {
          const data = await res.json()
          setSummary(data)
          // Update the saved session with summary
          updateSession(sessionId, { sessionSummary: data })
        }
      } catch { /* summary is optional */ }
    }

    fetchScore()
    fetchSummary()
  }, [messages, setup, retryCount])

  const total = scores.reduce((s, c) => s + c.score, 0)
  const max = scores.reduce((s, c) => s + c.maxScore, 0)
  const pct = max > 0 ? Math.round((total / max) * 100) : 0

  if (loading) {
    return (
      <div className="rps-screen">
        <header className="rps-header">
          <button className="rps-back" onClick={onBack}>←</button>
          <span className="rps-header-title">採点中...</span>
          <div />
        </header>
        <div className="rps-score-loading">
          <p>AIが会話を分析しています...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rps-screen">
        <header className="rps-header">
          <button className="rps-back" onClick={onBack}>←</button>
          <span className="rps-header-title">採点結果</span>
          <div />
        </header>
        <div className="rps-score-loading">
          <p className="rps-error">{error}</p>
          <div className="rps-error-actions">
            <button className="rps-error-retry" onClick={() => { setError(''); setLoading(true); setRetryCount(c => c + 1) }}>再試行</button>
            <button className="rps-done-btn" onClick={onBack}>戻る</button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="rps-screen">
      <header className="rps-header">
        <button className="rps-back" onClick={onBack}>←</button>
        <span className="rps-header-title">採点結果</span>
        <div />
      </header>

      <div className="rps-score-content">

        <div className="rps-score-total">
          <span className="rps-score-number">{total}</span>
          <span className="rps-score-max">/ {max}</span>
        </div>

        <div className="rps-score-bar-outer">
          <div className="rps-score-bar-inner" style={{ width: `${pct}%` }} />
        </div>

        <p className="rps-score-overall">{overall}</p>

        <div className="rps-score-details">
          {scores.map((s) => (
            <div key={s.name} className="rps-score-item">
              <div className="rps-score-item-header">
                <span className="rps-score-item-name">{s.name}</span>
                <span className="rps-score-item-value">{s.score}/{s.maxScore}</span>
              </div>
              <div className="rps-score-item-bar">
                <div
                  className={`rps-score-item-fill ${s.score >= 7 ? 'good' : s.score >= 5 ? 'ok' : 'low'}`}
                  style={{ width: `${(s.score / s.maxScore) * 100}%` }}
                />
              </div>
              <p className="rps-score-item-fb">{s.feedback}</p>
            </div>
          ))}
        </div>

        {summary && (
          <div className="rps-summary">
            <h3 className="rps-summary-title">会話サマリー</h3>
            <p className="rps-summary-text">{summary.summary}</p>

            <div className="rps-summary-section">
              <h4 className="rps-summary-label">良かった点</h4>
              <ul className="rps-summary-list good">
                {summary.goodPoints.map((p, i) => <li key={i}>{p}</li>)}
              </ul>
            </div>

            <div className="rps-summary-section">
              <h4 className="rps-summary-label">主要ポイント</h4>
              <ul className="rps-summary-list">
                {summary.keyPoints.map((p, i) => <li key={i}>{p}</li>)}
              </ul>
            </div>

            <div className="rps-summary-section">
              <h4 className="rps-summary-label">次回への改善点</h4>
              <ul className="rps-summary-list improve">
                {summary.improvements.map((p, i) => <li key={i}>{p}</li>)}
              </ul>
            </div>
          </div>
        )}

        <div className="rps-score-actions">
          <button className="rps-retry-btn" onClick={onRetry}>もう一度練習</button>
          <button className="rps-done-btn" onClick={onBack}>シナリオ選択に戻る</button>
        </div>
      </div>
    </div>
  )
}
