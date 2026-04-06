// ===== Roadmap Store =====
// Persists user's selected goal, target date, pace, and step completion.

import { getRoadmap } from './roadmapData'

const STORAGE_KEY = 'logic-roadmap'

export type RoadmapState = {
  goalId: string | null
  targetDate: string | null   // ISO date YYYY-MM-DD
  dailyMinutes: number
  completedSteps: number[]    // lessonIds that are done
  setupDone: boolean
}

const DEFAULT_STATE: RoadmapState = {
  goalId: null,
  targetDate: null,
  dailyMinutes: 15,
  completedSteps: [],
  setupDone: false,
}

function load(): RoadmapState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      return { ...DEFAULT_STATE, ...parsed }
    }
  } catch { /* ignore */ }
  return { ...DEFAULT_STATE }
}

function save(state: RoadmapState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

// ---- Public API ----

export function loadRoadmapState(): RoadmapState {
  return load()
}

export function selectGoal(goalId: string): RoadmapState {
  const state = load()
  state.goalId = goalId
  state.completedSteps = []
  state.setupDone = false
  save(state)
  return state
}

export function setTargetDate(date: string): RoadmapState {
  const state = load()
  state.targetDate = date
  save(state)
  return state
}

export function setDailyMinutes(minutes: number): RoadmapState {
  const state = load()
  state.dailyMinutes = minutes
  save(state)
  return state
}

export function completeStep(lessonId: number): RoadmapState {
  const state = load()
  if (!state.completedSteps.includes(lessonId)) {
    state.completedSteps.push(lessonId)
  }
  save(state)
  return state
}

export function completeSetup(): RoadmapState {
  const state = load()
  state.setupDone = true
  save(state)
  return state
}

/** Returns the first incomplete step's lessonId, or null if all done */
export function getCurrentStep(): number | null {
  const state = load()
  if (!state.goalId) return null
  const roadmap = getRoadmap(state.goalId)
  if (!roadmap) return null
  for (const step of roadmap.steps) {
    if (!state.completedSteps.includes(step.lessonId)) {
      return step.lessonId
    }
  }
  return null
}

/** Returns { completed, total, percent } */
export function getProgress(): { completed: number; total: number; percent: number } {
  const state = load()
  if (!state.goalId) return { completed: 0, total: 0, percent: 0 }
  const roadmap = getRoadmap(state.goalId)
  if (!roadmap) return { completed: 0, total: 0, percent: 0 }
  const total = roadmap.steps.length
  const completed = roadmap.steps.filter((s) => state.completedSteps.includes(s.lessonId)).length
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0
  return { completed, total, percent }
}

export function isStepComplete(lessonId: number): boolean {
  const state = load()
  return state.completedSteps.includes(lessonId)
}

export function needsOnboarding(): boolean {
  const state = load()
  return !state.setupDone || !state.goalId
}
