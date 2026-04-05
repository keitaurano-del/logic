import { useState, useEffect, useMemo } from 'react'
import './Tasks.css'

type Task = {
  id: string
  text: string
  category: string
  done: boolean
  createdAt: string
  dueDate?: string
}

type View = 'active' | 'done'

const STORAGE_KEY = 'logic-tasks'
const CATEGORIES = ['学習', '仕事', 'プライベート', 'その他']

function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function saveTasks(tasks: Task[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
}

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>(loadTasks)
  const [view, setView] = useState<View>('active')
  const [showAdd, setShowAdd] = useState(false)
  const [newText, setNewText] = useState('')
  const [newCategory, setNewCategory] = useState('学習')
  const [newDue, setNewDue] = useState('')
  const [editId, setEditId] = useState<string | null>(null)
  const [editText, setEditText] = useState('')
  const [filter, setFilter] = useState<string | null>(null)

  useEffect(() => { saveTasks(tasks) }, [tasks])

  const activeTasks = useMemo(() => {
    let t = tasks.filter(t => !t.done)
    if (filter) t = t.filter(t => t.category === filter)
    // Sort: due date first (ascending), then createdAt descending
    return t.sort((a, b) => {
      if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate)
      if (a.dueDate) return -1
      if (b.dueDate) return 1
      return b.createdAt.localeCompare(a.createdAt)
    })
  }, [tasks, filter])

  const doneTasks = useMemo(() => {
    let t = tasks.filter(t => t.done)
    if (filter) t = t.filter(t => t.category === filter)
    return t.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }, [tasks, filter])

  const displayTasks = view === 'active' ? activeTasks : doneTasks

  const addTask = () => {
    const text = newText.trim()
    if (!text) return
    const task: Task = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      text,
      category: newCategory,
      done: false,
      createdAt: new Date().toISOString(),
      dueDate: newDue || undefined,
    }
    setTasks(prev => [task, ...prev])
    setNewText('')
    setNewDue('')
    setShowAdd(false)
  }

  const toggleDone = (id: string) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, done: !t.done } : t))
  }

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  const startEdit = (task: Task) => {
    setEditId(task.id)
    setEditText(task.text)
  }

  const saveEdit = () => {
    if (!editId) return
    const text = editText.trim()
    if (!text) return
    setTasks(prev => prev.map(t => t.id === editId ? { ...t, text } : t))
    setEditId(null)
    setEditText('')
  }

  const isOverdue = (task: Task) => {
    if (!task.dueDate || task.done) return false
    return task.dueDate < new Date().toISOString().slice(0, 10)
  }

  const isDueToday = (task: Task) => {
    if (!task.dueDate) return false
    return task.dueDate === new Date().toISOString().slice(0, 10)
  }

  const formatDate = (iso: string) => {
    const d = new Date(iso + 'T00:00:00')
    return `${d.getMonth() + 1}/${d.getDate()}`
  }

  return (
    <div className="tk-container">
      {/* Header */}
      <div className="tk-header">
        <h2 className="tk-title">タスク</h2>
        <button className="tk-add-btn" onClick={() => setShowAdd(true)}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14" /></svg>
        </button>
      </div>

      {/* View tabs */}
      <div className="tk-tabs">
        <button className={`tk-tab ${view === 'active' ? 'active' : ''}`} onClick={() => setView('active')}>
          未完了 <span className="tk-tab-count">{activeTasks.length}</span>
        </button>
        <button className={`tk-tab ${view === 'done' ? 'active' : ''}`} onClick={() => setView('done')}>
          完了 <span className="tk-tab-count">{doneTasks.length}</span>
        </button>
      </div>

      {/* Category filter */}
      <div className="tk-filters">
        <button className={`tk-filter ${filter === null ? 'active' : ''}`} onClick={() => setFilter(null)}>すべて</button>
        {CATEGORIES.map(cat => (
          <button key={cat} className={`tk-filter ${filter === cat ? 'active' : ''}`} onClick={() => setFilter(f => f === cat ? null : cat)}>{cat}</button>
        ))}
      </div>

      {/* Task list */}
      <div className="tk-list">
        {displayTasks.length === 0 && (
          <div className="tk-empty">
            {view === 'active' ? 'タスクがありません' : '完了したタスクはありません'}
          </div>
        )}
        {displayTasks.map(task => (
          <div key={task.id} className={`tk-item ${task.done ? 'done' : ''} ${isOverdue(task) ? 'overdue' : ''}`}>
            {editId === task.id ? (
              <div className="tk-edit-row">
                <input className="tk-edit-input" value={editText} onChange={e => setEditText(e.target.value)} onKeyDown={e => e.key === 'Enter' && saveEdit()} autoFocus />
                <button className="tk-edit-save" onClick={saveEdit}>保存</button>
                <button className="tk-edit-cancel" onClick={() => setEditId(null)}>取消</button>
              </div>
            ) : (
              <>
                <button className={`tk-check ${task.done ? 'checked' : ''}`} onClick={() => toggleDone(task.id)}>
                  {task.done && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6L9 17l-5-5" /></svg>}
                </button>
                <div className="tk-item-body" onClick={() => !task.done && startEdit(task)}>
                  <span className="tk-item-text">{task.text}</span>
                  <div className="tk-item-meta">
                    <span className="tk-item-cat">{task.category}</span>
                    {task.dueDate && (
                      <span className={`tk-item-due ${isOverdue(task) ? 'overdue' : ''} ${isDueToday(task) ? 'today' : ''}`}>
                        {isOverdue(task) ? '期限切れ' : isDueToday(task) ? '今日' : formatDate(task.dueDate)}
                      </span>
                    )}
                  </div>
                </div>
                <button className="tk-delete" onClick={() => deleteTask(task.id)}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                </button>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Add task modal */}
      {showAdd && (
        <div className="tk-overlay" onClick={() => setShowAdd(false)}>
          <div className="tk-modal" onClick={e => e.stopPropagation()}>
            <h3 className="tk-modal-title">新しいタスク</h3>
            <input
              className="tk-input"
              placeholder="タスクを入力..."
              value={newText}
              onChange={e => setNewText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addTask()}
              autoFocus
            />
            <div className="tk-modal-row">
              <label className="tk-label">カテゴリ</label>
              <div className="tk-cat-options">
                {CATEGORIES.map(cat => (
                  <button key={cat} className={`tk-cat-btn ${newCategory === cat ? 'active' : ''}`} onClick={() => setNewCategory(cat)}>{cat}</button>
                ))}
              </div>
            </div>
            <div className="tk-modal-row">
              <label className="tk-label">期限</label>
              <input type="date" className="tk-date-input" value={newDue} onChange={e => setNewDue(e.target.value)} />
            </div>
            <div className="tk-modal-actions">
              <button className="tk-btn-cancel" onClick={() => setShowAdd(false)}>キャンセル</button>
              <button className="tk-btn-add" onClick={addTask} disabled={!newText.trim()}>追加</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
