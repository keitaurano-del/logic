import { getRoadmap } from './roadmapData'

const STORAGE_KEY = 'logic-roadmap'

export type GoalEntry = {
  goalId: string
  targetDate: string | null
  dailyMinutes: number
  completedSteps: number[]
  createdAt: string
}

export type RoadmapState = {
  goals: GoalEntry[]
  setupDone: boolean
}

const DEFAULT_STATE: RoadmapState = { goals: [], setupDone: false }

function load(): RoadmapState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      // Migrate old single-goal format
      if (parsed.goalId && !parsed.goals) {
        const migrated: RoadmapState = {
          goals: [{
            goalId: parsed.goalId,
            targetDate: parsed.targetDate || null,
            dailyMinutes: parsed.dailyMinutes || 15,
            completedSteps: parsed.completedSteps || [],
            createdAt: new Date().toISOString()
          }],
          setupDone: parsed.setupDone ?? true
        }
        save(migrated)
        return migrated
      }
      return { ...DEFAULT_STATE, ...parsed }
    }
  } catch { /* ignore */ }
  return { ...DEFAULT_STATE }
}

function save(state: RoadmapState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
}

function findGoal(state: RoadmapState, goalId: string): GoalEntry | undefined {
  return state.goals.find(g => g.goalId === goalId)
}

export function loadRoadmapState(): RoadmapState { return load() }

export function selectGoal(goalId: string): RoadmapState {
  const state = load()
  if (state.goals.some(g => g.goalId === goalId)) return state
  state.goals.push({ goalId, targetDate: null, dailyMinutes: 15, completedSteps: [], createdAt: new Date().toISOString() })
  state.setupDone = true
  save(state)
  return state
}

export function removeGoal(goalId: string): RoadmapState {
  const state = load()
  state.goals = state.goals.filter(g => g.goalId !== goalId)
  save(state)
  return state
}

export function setTargetDate(goalId: string, date: string): RoadmapState {
  const state = load()
  const goal = findGoal(state, goalId)
  if (goal) { goal.targetDate = date; save(state) }
  return state
}

export function setDailyMinutes(goalId: string, minutes: number): RoadmapState {
  const state = load()
  const goal = findGoal(state, goalId)
  if (goal) { goal.dailyMinutes = minutes; save(state) }
  return state
}

export function completeStep(lessonId: number): RoadmapState {
  const state = load()
  for (const goal of state.goals) {
    const rm = getRoadmap(goal.goalId)
    if (rm && rm.steps.some(s => s.lessonId === lessonId)) {
      if (!goal.completedSteps.includes(lessonId)) {
        goal.completedSteps.push(lessonId)
      }
    }
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

export function getCurrentStep(goalId: string): number | null {
  const state = load()
  const goal = findGoal(state, goalId)
  if (!goal) return null
  const rm = getRoadmap(goalId)
  if (!rm) return null
  for (const step of rm.steps) {
    if (!goal.completedSteps.includes(step.lessonId)) return step.lessonId
  }
  return null
}

export function getProgress(goalId: string): { completed: number; total: number; percent: number } {
  const state = load()
  const goal = findGoal(state, goalId)
  if (!goal) return { completed: 0, total: 0, percent: 0 }
  const rm = getRoadmap(goalId)
  if (!rm) return { completed: 0, total: 0, percent: 0 }
  const total = rm.steps.length
  const completed = rm.steps.filter(s => goal.completedSteps.includes(s.lessonId)).length
  return { completed, total, percent: total > 0 ? Math.round((completed / total) * 100) : 0 }
}

export function isStepComplete(goalId: string, lessonId: number): boolean {
  const state = load()
  const goal = findGoal(state, goalId)
  return goal ? goal.completedSteps.includes(lessonId) : false
}

export function needsOnboarding(): boolean {
  return load().goals.length === 0
}

export function getActiveGoalIds(): string[] {
  return load().goals.map(g => g.goalId)
}
