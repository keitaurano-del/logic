import { useState, useEffect, useMemo, useRef } from 'react'
import './Knowledge.css'

export type KnowledgeEntry = {
  id: string
  text: string
  tags: string[]
  category: string
  createdAt: string
  aiComment?: string
  aiMood?: 'empathy' | 'advice' | 'motivate'
  sourceType?: 'text' | 'file-text' | 'file-audio' | 'file-image'
  fileName?: string
  audioUrl?: string
  imageUrl?: string
}

const STORAGE_KEY = 'logic-knowledge'

// デモ用: テキストからタグを自動推定
function autoTags(text: string): string[] {
  const tagMap: Record<string, string[]> = {
    '上司': ['上司', '人間関係'], '部下': ['部下', 'マネジメント'],
    'クライアント': ['クライアント', '営業'], '交渉': ['交渉', '営業'],
    '会議': ['会議', 'コミュニケーション'], 'プレゼン': ['プレゼン', 'コミュニケーション'],
    '売上': ['売上', '数字'], '目標': ['目標', '計画'], 'KPI': ['KPI', '数字'],
    'プロジェクト': ['プロジェクト', '管理'], '反省': ['振り返り'], '学び': ['学び'],
    '失敗': ['失敗', '振り返り'], '成功': ['成功', '振り返り'],
    'フィードバック': ['フィードバック', 'コミュニケーション'],
    '1on1': ['1on1', 'マネジメント'], '簿記': ['簿記', '会計'],
    '財務': ['財務', '会計'], '決算': ['決算', '会計'],
  }
  const found: string[] = []
  for (const [keyword, tags] of Object.entries(tagMap)) {
    if (text.includes(keyword)) found.push(...tags)
  }
  return [...new Set(found)].slice(0, 5)
}

function autoCategory(text: string): string {
  if (/営業|クライアント|交渉|提案|売上/.test(text)) return '営業・交渉'
  if (/上司|部下|チーム|マネジメント|1on1/.test(text)) return 'マネジメント'
  if (/プロジェクト|進捗|スケジュール|タスク/.test(text)) return 'プロジェクト管理'
  if (/会議|プレゼン|報告|コミュニケーション/.test(text)) return 'コミュニケーション'
  if (/簿記|財務|決算|会計|原価/.test(text)) return '財務・会計'
  if (/技術|開発|コード|設計/.test(text)) return '技術・スキル'
  if (/学び|気づき|反省|成長/.test(text)) return '気づき・学び'
  return 'その他'
}

function generateAiComment(text: string): { comment: string; mood: 'empathy' | 'advice' | 'motivate' } {
  if (/辛い|難しい|悩|困|不安|うまくいかな|失敗|ミス|怒られ|落ち込|しんどい|疲れ/.test(text)) {
    const c = [
      'それは大変でしたね。でも、こうやって振り返れていること自体が成長の証です。自分を責めすぎないでください。',
      'よく頑張っていますね。壁にぶつかるのは、チャレンジしている証拠です。一つずつ乗り越えていきましょう。',
      'その気持ち、よくわかります。すぐに答えが出なくても大丈夫。こうして言語化できていること自体が、次への一歩です。',
    ]
    return { comment: c[Math.floor(Math.random() * c.length)], mood: 'empathy' }
  }
  if (/できた|成功|達成|うまくいっ|褒め|認め|嬉し|良かっ|成果|成長|受注|契約/.test(text)) {
    const c = [
      'おめでとうございます！その成功体験を忘れずに記録しておくことで、次の自信につながります。この調子で！',
      '素晴らしいですね！うまくいった要因を言語化できると、再現性のあるスキルになります。今日の経験は財産です。',
      'いい結果が出ましたね！努力が実を結んだ瞬間です。この感覚を覚えておいてください。次もきっとうまくいきます。',
    ]
    return { comment: c[Math.floor(Math.random() * c.length)], mood: 'motivate' }
  }
  if (/学び|気づ|わかっ|理解|改善|工夫|試し|やってみ|ヒアリング|分析|振り返/.test(text)) {
    const c = [
      'いい気づきですね。次のアクションとして、この学びを具体的な行動ルールに落とし込んでみましょう。「次から〇〇する」と決めるだけで定着率が上がります。',
      'この経験から得たことは大きいですね。似たような場面で使えるように、ポイントを3つに絞って整理してみるといいかもしれません。',
      '実践から学ぶ姿勢が素晴らしいです。この知見をチームにも共有すると、さらに価値が広がりますよ。',
    ]
    return { comment: c[Math.floor(Math.random() * c.length)], mood: 'advice' }
  }
  if (/上司|部下|チーム|同僚|クライアント|関係|信頼|コミュニケーション/.test(text)) {
    const c = [
      '人との関わりは仕事の土台ですね。相手の立場で考える視点を持てていることが伝わります。その姿勢を大切にしてください。',
      '対人関係の経験は、蓄積するほど判断力が上がります。今回のケースをパターンとして覚えておくと、似た場面で迷わなくなりますよ。',
    ]
    return { comment: c[Math.floor(Math.random() * c.length)], mood: 'advice' }
  }
  if (/売上|数字|目標|KPI|予算|計画|戦略/.test(text)) {
    const c = [
      '数字に向き合う姿勢がいいですね。定量的に振り返ることで、次のアクションが明確になります。引き続きトラッキングしていきましょう。',
      '目標を意識できている時点で、すでに成長のサイクルに入っています。小さな進捗も記録していくと、モチベーション維持に効きますよ。',
    ]
    return { comment: c[Math.floor(Math.random() * c.length)], mood: 'motivate' }
  }
  const c = [
    '記録してくれてありがとうございます。日々の小さな気づきの積み重ねが、大きな成長につながります。続けていきましょう！',
    'こうして自分の経験を言語化することはとても大切です。振り返りの習慣が、あなたの一番の武器になりますよ。',
    'いい記録ですね。あとで読み返したとき、きっと新しい発見があるはずです。この習慣を大事にしてください。',
  ]
  return { comment: c[Math.floor(Math.random() * c.length)], mood: 'motivate' }
}

function loadEntries(): KnowledgeEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function saveEntries(entries: KnowledgeEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
}

function toDateKey(iso: string): string {
  const d = new Date(iso)
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`
}

function moodLabel(mood?: string) {
  switch (mood) {
    case 'empathy': return '共感'
    case 'advice': return 'アドバイス'
    case 'motivate': return '応援'
    default: return ''
  }
}

// エントリーカード（共通）
function EntryCard({ entry, onDelete }: { entry: KnowledgeEntry; onDelete: (id: string) => void }) {
  return (
    <div className="kn-entry">
      <div className="kn-entry-top">
        <div className="kn-entry-top-left">
          <span className="kn-entry-cat">{entry.category}</span>
          {entry.sourceType === 'file-image' && <span className="kn-source-badge image">📷 写真</span>}
          {entry.sourceType === 'file-audio' && <span className="kn-source-badge audio">🎙️ 音声</span>}
          {entry.sourceType === 'file-text' && <span className="kn-source-badge file">📄 ファイル</span>}
        </div>
        <span className="kn-entry-date">{formatDate(entry.createdAt)}</span>
      </div>
      {entry.fileName && (
        <p className="kn-entry-filename">{entry.fileName}</p>
      )}
      {entry.imageUrl && (
        <img className="kn-entry-image" src={entry.imageUrl} alt={entry.fileName || '添付画像'} />
      )}
      {entry.audioUrl && (
        <audio controls className="kn-audio-player" src={entry.audioUrl} />
      )}
      <p className="kn-entry-text">{entry.text}</p>
      {entry.aiComment && (
        <div className={`kn-ai-comment ${entry.aiMood || ''}`}>
          <div className="kn-ai-comment-header">
            <span className="kn-ai-mood-label">{moodLabel(entry.aiMood)}</span>
          </div>
          <p className="kn-ai-comment-text">{entry.aiComment}</p>
        </div>
      )}
      <div className="kn-entry-bottom">
        <div className="kn-entry-tags">
          {entry.tags.map((tag) => (
            <span key={tag} className="kn-tag">{tag}</span>
          ))}
        </div>
        <button className="kn-delete" onClick={() => onDelete(entry.id)}>削除</button>
      </div>
    </div>
  )
}

type View = 'list' | 'add' | 'saved'
type ListMode = 'timeline' | 'category' | 'calendar' | 'tag'

export default function Knowledge() {
  const [entries, setEntries] = useState<KnowledgeEntry[]>(loadEntries)
  const [view, setView] = useState<View>('list')
  const [listMode, setListMode] = useState<ListMode>('timeline')
  const [text, setText] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [category, setCategory] = useState('')
  const [aiComment, setAiComment] = useState<{ comment: string; mood: 'empathy' | 'advice' | 'motivate' } | null>(null)
  const [aiLoading, setAiLoading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<{ name: string; type: 'text' | 'audio' | 'image'; audioUrl?: string; imageUrl?: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isListening, setIsListening] = useState(false)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const [search, setSearch] = useState('')
  const [filterTag, setFilterTag] = useState<string | null>(null)
  const [filterCategory, setFilterCategory] = useState<string | null>(null)
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`
  })
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  useEffect(() => { saveEntries(entries) }, [entries])

  // Speech recognition
  const startListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) return

    navigator.mediaDevices?.getUserMedia({ audio: true })
      .then((stream) => {
        stream.getTracks().forEach((t) => t.stop())

        const recognition = new SR()
        recognition.lang = 'ja-JP'
        recognition.interimResults = true
        recognition.continuous = false
        recognitionRef.current = recognition

        const baseText = text

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
          setText(baseText ? baseText + '\n' + transcript : transcript)
        }
        recognition.onend = () => setIsListening(false)
        recognition.onerror = () => setIsListening(false)
        recognition.start()
        setIsListening(true)
      })
      .catch(() => { /* permission denied */ })
  }

  const stopListening = () => {
    recognitionRef.current?.stop()
  }

  useEffect(() => {
    if (text.length <= 5) { setTags([]); setCategory(''); return }
    const timer = setTimeout(() => {
      setTags(autoTags(text))
      setCategory(autoCategory(text))
    }, 400)
    return () => clearTimeout(timer)
  }, [text])

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // テキストファイル
    if (file.type.startsWith('text/') || file.name.endsWith('.txt') || file.name.endsWith('.md') || file.name.endsWith('.csv')) {
      const reader = new FileReader()
      reader.onload = (ev) => {
        const content = ev.target?.result as string
        setText((prev) => prev ? prev + '\n\n' + content : content)
        setUploadedFile({ name: file.name, type: 'text' })
      }
      reader.readAsText(file)
    }
    // 画像ファイル
    else if (file.type.startsWith('image/') || file.name.match(/\.(jpg|jpeg|png|gif|webp|heic)$/i)) {
      const url = URL.createObjectURL(file)
      setUploadedFile({ name: file.name, type: 'image', imageUrl: url })
      if (!text.trim()) {
        setText(`[写真メモ] ${file.name}`)
      }
    }
    // 音声ファイル
    else if (file.type.startsWith('audio/') || file.name.match(/\.(mp3|wav|m4a|ogg|webm|aac)$/i)) {
      const url = URL.createObjectURL(file)
      setUploadedFile({ name: file.name, type: 'audio', audioUrl: url })
      if (!text.trim()) {
        setText(`[音声メモ] ${file.name}`)
      }
    }

    // input をリセット
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleSave = async () => {
    if (!text.trim()) return
    setAiLoading(true)
    await new Promise((r) => setTimeout(r, 600 + Math.random() * 600))
    const ai = generateAiComment(text)
    setAiComment(ai)
    setAiLoading(false)
    const entry: KnowledgeEntry = {
      id: Date.now().toString(), text: text.trim(),
      tags: tags.length > 0 ? tags : ['未分類'],
      category: category || 'その他',
      createdAt: new Date().toISOString(),
      aiComment: ai.comment, aiMood: ai.mood,
      sourceType: uploadedFile?.type === 'image' ? 'file-image' : uploadedFile?.type === 'audio' ? 'file-audio' : uploadedFile?.type === 'text' ? 'file-text' : 'text',
      fileName: uploadedFile?.name,
      audioUrl: uploadedFile?.audioUrl,
      imageUrl: uploadedFile?.imageUrl,
    }
    setEntries([entry, ...entries])
    setView('saved')
  }

  const handleBackToList = () => {
    setText(''); setTags([]); setCategory(''); setAiComment(null); setUploadedFile(null); setView('list')
  }

  const handleDelete = (id: string) => {
    setEntries(entries.filter((e) => e.id !== id))
  }

  // 検索フィルタ
  const searched = useMemo(() => entries.filter((e) => {
    if (search && !e.text.includes(search) && !e.tags.some((t) => t.includes(search))) return false
    return true
  }), [entries, search])

  // カテゴリ別グループ
  const byCategory = useMemo(() => {
    const map: Record<string, KnowledgeEntry[]> = {}
    for (const e of searched) {
      if (!map[e.category]) map[e.category] = []
      map[e.category].push(e)
    }
    return map
  }, [searched])

  // タグ別カウント
  const tagCounts = useMemo(() => {
    const map: Record<string, number> = {}
    for (const e of searched) {
      for (const t of e.tags) {
        map[t] = (map[t] || 0) + 1
      }
    }
    return Object.entries(map).sort((a, b) => b[1] - a[1])
  }, [searched])

  // カレンダー用
  const [calYear, calMonth] = calendarMonth.split('-').map(Number)
  const daysInMonth = new Date(calYear, calMonth, 0).getDate()
  const firstDayOfWeek = new Date(calYear, calMonth - 1, 1).getDay()

  const entriesByDate = useMemo(() => {
    const map: Record<string, KnowledgeEntry[]> = {}
    for (const e of searched) {
      const key = toDateKey(e.createdAt)
      if (!map[key]) map[key] = []
      map[key].push(e)
    }
    return map
  }, [searched])

  const prevMonth = () => {
    const d = new Date(calYear, calMonth - 2, 1)
    setCalendarMonth(`${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`)
    setSelectedDate(null)
  }
  const nextMonth = () => {
    const d = new Date(calYear, calMonth, 1)
    setCalendarMonth(`${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`)
    setSelectedDate(null)
  }

  const filteredByTag = filterTag ? searched.filter((e) => e.tags.includes(filterTag)) : []
  const filteredByCategory = filterCategory ? (byCategory[filterCategory] || []) : []
  const filteredByDate = selectedDate ? (entriesByDate[selectedDate] || []) : []

  return (
    <div className="knowledge">
      {view === 'list' && (
        <>
          <div className="kn-header">
            <h2>ナレッジ</h2>
            <span className="kn-count">{entries.length}件</span>
          </div>

          {/* Search */}
          <div className="kn-search-area">
            <input
              className="kn-search" type="text" placeholder="キーワードで検索..."
              value={search} onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* View mode tabs */}
          <div className="kn-mode-tabs">
            {([
              ['timeline', 'タイムライン'],
              ['category', 'カテゴリ'],
              ['calendar', 'カレンダー'],
              ['tag', 'タグ'],
            ] as const).map(([mode, label]) => (
              <button
                key={mode}
                className={`kn-mode-tab ${listMode === mode ? 'active' : ''}`}
                onClick={() => { setListMode(mode); setFilterTag(null); setFilterCategory(null); setSelectedDate(null) }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* === Timeline View === */}
          {listMode === 'timeline' && (
            <div className="kn-entries">
              {searched.length === 0 ? (
                <div className="kn-empty">
                  <p>{entries.length === 0 ? '最初のナレッジを記録しましょう！' : '該当する記録がありません'}</p>
                </div>
              ) : (
                searched.map((entry) => (
                  <EntryCard key={entry.id} entry={entry} onDelete={handleDelete} />
                ))
              )}
            </div>
          )}

          {/* === Category View === */}
          {listMode === 'category' && !filterCategory && (
            <div className="kn-category-grid">
              {Object.entries(byCategory).map(([cat, items]) => (
                <button key={cat} className="kn-category-card" onClick={() => setFilterCategory(cat)}>
                  <span className="kn-category-card-count">{items.length}</span>
                  <span className="kn-category-card-name">{cat}</span>
                </button>
              ))}
              {Object.keys(byCategory).length === 0 && (
                <div className="kn-empty">
                  <p>まだナレッジがありません</p>
                </div>
              )}
            </div>
          )}
          {listMode === 'category' && filterCategory && (
            <div className="kn-entries">
              <button className="kn-filter-back" onClick={() => setFilterCategory(null)}>
                ← {filterCategory}（{filteredByCategory.length}件）
              </button>
              {filteredByCategory.map((entry) => (
                <EntryCard key={entry.id} entry={entry} onDelete={handleDelete} />
              ))}
            </div>
          )}

          {/* === Calendar View === */}
          {listMode === 'calendar' && (
            <>
              <div className="kn-calendar">
                <div className="kn-cal-header">
                  <button className="kn-cal-nav" onClick={prevMonth}>‹</button>
                  <span className="kn-cal-month">{calYear}年{calMonth}月</span>
                  <button className="kn-cal-nav" onClick={nextMonth}>›</button>
                </div>
                <div className="kn-cal-weekdays">
                  {['日', '月', '火', '水', '木', '金', '土'].map((d) => (
                    <span key={d} className="kn-cal-wd">{d}</span>
                  ))}
                </div>
                <div className="kn-cal-days">
                  {Array.from({ length: firstDayOfWeek }, (_, i) => (
                    <span key={`empty-${i}`} className="kn-cal-day empty" />
                  ))}
                  {Array.from({ length: daysInMonth }, (_, i) => {
                    const day = i + 1
                    const dateKey = `${calYear}-${calMonth.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`
                    const count = entriesByDate[dateKey]?.length || 0
                    const isSelected = selectedDate === dateKey
                    return (
                      <button
                        key={day}
                        className={`kn-cal-day ${count > 0 ? 'has-entries' : ''} ${isSelected ? 'selected' : ''}`}
                        onClick={() => setSelectedDate(isSelected ? null : dateKey)}
                      >
                        <span className="kn-cal-day-num">{day}</span>
                        {count > 0 && <span className="kn-cal-dot">{count}</span>}
                      </button>
                    )
                  })}
                </div>
              </div>
              <div className="kn-entries">
                {selectedDate ? (
                  filteredByDate.length > 0 ? (
                    filteredByDate.map((entry) => (
                      <EntryCard key={entry.id} entry={entry} onDelete={handleDelete} />
                    ))
                  ) : (
                    <div className="kn-empty-small"><p>この日の記録はありません</p></div>
                  )
                ) : (
                  <div className="kn-empty-small"><p>日付を選んでください</p></div>
                )}
              </div>
            </>
          )}

          {/* === Tag View === */}
          {listMode === 'tag' && !filterTag && (
            <div className="kn-tag-grid">
              {tagCounts.map(([tag, count]) => (
                <button key={tag} className="kn-tag-card" onClick={() => setFilterTag(tag)}>
                  <span className="kn-tag-card-name">{tag}</span>
                  <span className="kn-tag-card-count">{count}</span>
                </button>
              ))}
              {tagCounts.length === 0 && (
                <div className="kn-empty">
                  <p>まだナレッジがありません</p>
                </div>
              )}
            </div>
          )}
          {listMode === 'tag' && filterTag && (
            <div className="kn-entries">
              <button className="kn-filter-back" onClick={() => setFilterTag(null)}>
                ← {filterTag}（{filteredByTag.length}件）
              </button>
              {filteredByTag.map((entry) => (
                <EntryCard key={entry.id} entry={entry} onDelete={handleDelete} />
              ))}
            </div>
          )}

          <button className="kn-add-btn" onClick={() => { setView('add'); setAiComment(null) }}>+</button>
        </>
      )}

      {view === 'add' && (
        <>
          <div className="kn-header">
            <button className="kn-back" onClick={handleBackToList}>←</button>
            <h2>記録する</h2>
            <div />
          </div>
          <div className="kn-add-content">
            <div className="kn-add-dragon">
              <p className="kn-add-hint">テキストを入力するか、ファイルをアップロードしてください</p>
            </div>

            {/* File upload area */}
            <div className="kn-upload-area">
              <input
                ref={fileInputRef}
                type="file"
                accept=".txt,.md,.csv,text/*,audio/*,.mp3,.wav,.m4a,.ogg,.webm,.aac,image/*,.jpg,.jpeg,.png,.gif,.webp,.heic"
                onChange={handleFileUpload}
                className="kn-file-input"
              />
              <button className="kn-upload-btn" onClick={() => fileInputRef.current?.click()}>
                <span className="kn-upload-icon">📎</span>
                ファイルを添付
              </button>
              <span className="kn-upload-hint">写真 / テキスト / 音声</span>
            </div>

            {/* Uploaded file indicator */}
            {uploadedFile && (
              <div className={`kn-uploaded-file ${uploadedFile.type}`}>
                <span className="kn-uploaded-icon">{uploadedFile.type === 'image' ? '📷' : uploadedFile.type === 'audio' ? '🎙️' : '📄'}</span>
                <span className="kn-uploaded-name">{uploadedFile.name}</span>
                <button className="kn-uploaded-remove" onClick={() => setUploadedFile(null)}>✕</button>
              </div>
            )}

            {/* Image preview */}
            {uploadedFile?.imageUrl && (
              <img className="kn-image-preview" src={uploadedFile.imageUrl} alt="プレビュー" />
            )}

            {/* Audio player */}
            {uploadedFile?.audioUrl && (
              <audio controls className="kn-audio-player" src={uploadedFile.audioUrl} />
            )}

            <div className="kn-textarea-area">
              <textarea
                className="kn-textarea"
                placeholder={isListening
                  ? '話してください...'
                  : uploadedFile?.type === 'audio'
                    ? '音声の内容やメモを入力してください...'
                    : '例：今日のクライアントとの交渉で、最初に相手の課題を深掘りしてから提案したら、すんなり受け入れてもらえた。'}
                value={text} onChange={(e) => setText(e.target.value)} rows={6}
                disabled={isListening}
              />
              <button
                className={`kn-mic ${isListening ? 'active' : ''}`}
                type="button"
                onClick={isListening ? stopListening : startListening}
              >
                {isListening ? (
                  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                    <rect x="6" y="6" width="12" height="12" rx="2" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" y1="19" x2="12" y2="23" />
                    <line x1="8" y1="23" x2="16" y2="23" />
                  </svg>
                )}
              </button>
            </div>
            {tags.length > 0 && (
              <div className="kn-suggested">
                <p className="kn-suggested-label">AIが提案したタグ：</p>
                <div className="kn-suggested-tags">
                  {tags.map((tag) => (<span key={tag} className="kn-tag suggested">{tag}</span>))}
                </div>
              </div>
            )}
            {category && (
              <div className="kn-suggested">
                <p className="kn-suggested-label">カテゴリ：</p>
                <span className="kn-auto-category">{category}</span>
              </div>
            )}
            <button className="kn-save-btn" onClick={handleSave} disabled={!text.trim() || aiLoading}>
              {aiLoading ? '記録中...' : '保存する'}
            </button>
          </div>
        </>
      )}

      {view === 'saved' && aiComment && (
        <>
          <div className="kn-header"><div /><h2>記録しました</h2><div /></div>
          <div className="kn-saved-content">
            <div className={`kn-saved-bubble ${aiComment.mood}`}>
              <span className="kn-saved-mood">{moodLabel(aiComment.mood)}</span>
              <p>{aiComment.comment}</p>
            </div>
            <button className="kn-save-btn" onClick={handleBackToList}>OK</button>
          </div>
        </>
      )}
    </div>
  )
}
