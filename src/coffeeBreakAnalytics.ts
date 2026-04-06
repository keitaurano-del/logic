const KEY = 'logic-coffeebreak-events'

type Event = { type: 'scene_started' | 'scenario_completed' | 'share_button_tapped'; sceneId: string; ts: number }

function append(e: Event) {
  try {
    const raw = localStorage.getItem(KEY)
    const arr: Event[] = raw ? JSON.parse(raw) : []
    arr.push(e)
    if (arr.length > 500) arr.splice(0, arr.length - 500)
    localStorage.setItem(KEY, JSON.stringify(arr))
  } catch { /* */ }
}

export function logSceneStarted(sceneId: string) {
  append({ type: 'scene_started', sceneId, ts: Date.now() })
}
export function logScenarioCompleted(sceneId: string) {
  append({ type: 'scenario_completed', sceneId, ts: Date.now() })
}
export function logShareTapped(sceneId: string) {
  append({ type: 'share_button_tapped', sceneId, ts: Date.now() })
}
