const STORAGE_KEY = 'logic-roleplay-history'

export type RolePlayScore = {
  name: string
  score: number
  maxScore: number
  feedback: string
}

export type SessionSummary = {
  summary: string
  keyPoints: string[]
  improvements: string[]
  goodPoints: string[]
}

export type RolePlaySession = {
  id: string
  date: string
  scenarioId: string
  scenarioTitle: string
  mode: 'chat' | 'presentation'
  goal: string
  messages: { role: 'user' | 'assistant'; content: string }[]
  scores: RolePlayScore[]
  overall: string
  totalScore: number
  maxScore: number
  sessionSummary?: SessionSummary
}

export function loadHistory(): RolePlaySession[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* ignore */ }
  return []
}

function saveHistory(sessions: RolePlaySession[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sessions))
}

export function addSession(session: RolePlaySession) {
  const history = loadHistory()
  history.push(session)
  // keep last 50 sessions
  if (history.length > 50) history.splice(0, history.length - 50)
  saveHistory(history)
}

export function updateSession(id: string, updates: Partial<RolePlaySession>) {
  const history = loadHistory()
  const idx = history.findIndex((s) => s.id === id)
  if (idx >= 0) {
    history[idx] = { ...history[idx], ...updates }
    saveHistory(history)
  }
}

export function getSessionsForScenario(scenarioId: string): RolePlaySession[] {
  return loadHistory().filter((s) => s.scenarioId === scenarioId)
}

export function buildHistorySummary(scenarioId: string): string {
  const sessions = getSessionsForScenario(scenarioId)
  if (sessions.length === 0) return ''

  const recent = sessions.slice(-5)
  const lines = recent.map((s, i) => {
    const scoreDetails = s.scores.map((sc) => `${sc.name}: ${sc.score}/${sc.maxScore}`).join(', ')
    return `【${i + 1}回目 ${s.date}】合計${s.totalScore}/${s.maxScore}点 (${scoreDetails})\nフィードバック: ${s.overall}`
  })

  const allScores = sessions.flatMap((s) => s.scores)
  const byName: Record<string, number[]> = {}
  for (const sc of allScores) {
    if (!byName[sc.name]) byName[sc.name] = []
    byName[sc.name].push(sc.score)
  }
  const trends = Object.entries(byName).map(([name, scores]) => {
    const avg = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
    const latest = scores[scores.length - 1]
    const first = scores[0]
    const trend = latest > first ? '改善傾向' : latest < first ? '低下傾向' : '横ばい'
    return `${name}: 平均${avg}点 (${trend})`
  })

  return `## 過去の練習履歴（直近${recent.length}回）\n${lines.join('\n\n')}\n\n## 傾向分析\n${trends.join('\n')}`
}
