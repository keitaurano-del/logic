/** AI models can be overridden on Render without changing application code. */
export const DEFAULT_AI_MODEL_LIGHT = 'claude-haiku-5-5'
export const DEFAULT_AI_MODEL_GRADING = 'claude-sonnet-5-5'

function readModel(raw: string | undefined, fallback: string): string {
  const trimmed = raw?.trim()
  return trimmed || fallback
}

export function aiModelLight(env: NodeJS.ProcessEnv = process.env): string {
  return readModel(env.AI_MODEL_LIGHT, DEFAULT_AI_MODEL_LIGHT)
}

/** Haiku 5.5 can skip thinking for short, latency-sensitive requests. */
export function aiLightRequest(env: NodeJS.ProcessEnv = process.env) {
  const model = aiModelLight(env)
  return model === DEFAULT_AI_MODEL_LIGHT
    ? { model, thinking: { type: 'disabled' as const } }
    : { model }
}

export function aiModelGrading(env: NodeJS.ProcessEnv = process.env): string {
  return readModel(env.AI_MODEL_GRADING, DEFAULT_AI_MODEL_GRADING)
}

/** Medium effort keeps grading responsive while leaving room for feedback text. */
export function aiGradingRequest(env: NodeJS.ProcessEnv = process.env) {
  const model = aiModelGrading(env)
  return model === DEFAULT_AI_MODEL_GRADING
    ? { model, output_config: { effort: 'medium' as const } }
    : { model }
}
