import { Router, type Request, type Response } from 'express'
import type Anthropic from '@anthropic-ai/sdk'
import type { RequestHandler } from 'express'

// =============================================
// ロジカルライティング採点 (POST /api/writing-score)
// =============================================
// ユーザーの文章を PREP フレームワークで採点し構造化 JSON を返す。
// Claude API を tool_use 方式で呼び出すことで JSON パースエラーを防ぐ。

const MAX_TEXT_LEN = 2000
const SCORE_TOOL_NAME = 'score_writing'

export type ScoringResult = {
  scores: { point: number; reason: number; example: number; overall: number }
  comments: { ja: string; en: string }
  strengths: { ja: string; en: string }
  improvements: { ja: string; en: string }
}

// =============================================
// バリデーション（テスト対象）
// =============================================
export function validateWritingInput(text: unknown): { valid: true } | { valid: false; error: string } {
  if (text === undefined || text === null || text === '') {
    return { valid: false, error: 'text is required' }
  }
  if (typeof text !== 'string') {
    return { valid: false, error: 'text must be a string' }
  }
  if (text.trim() === '') {
    return { valid: false, error: 'text is required' }
  }
  if (text.length > MAX_TEXT_LEN) {
    return { valid: false, error: `text must be ${MAX_TEXT_LEN} characters or fewer` }
  }
  return { valid: true }
}

// =============================================
// tool_use result パース（テスト対象）
// =============================================
export function parseToolUseResult(toolInput: unknown): ScoringResult | null {
  if (!toolInput || typeof toolInput !== 'object') return null
  const o = toolInput as Record<string, unknown>

  const scores = o.scores
  if (!scores || typeof scores !== 'object') return null
  const s = scores as Record<string, unknown>
  const point = typeof s.point === 'number' ? s.point : NaN
  const reason = typeof s.reason === 'number' ? s.reason : NaN
  const example = typeof s.example === 'number' ? s.example : NaN
  const overall = typeof s.overall === 'number' ? s.overall : NaN

  if (
    !Number.isFinite(point) || point < 0 || point > 5 ||
    !Number.isFinite(reason) || reason < 0 || reason > 5 ||
    !Number.isFinite(example) || example < 0 || example > 5 ||
    !Number.isFinite(overall) || overall < 0 || overall > 100
  ) {
    return null
  }

  const comments = o.comments
  if (!comments || typeof comments !== 'object') return null
  const c = comments as Record<string, unknown>
  if (typeof c.ja !== 'string' || typeof c.en !== 'string') return null

  const strengths = o.strengths
  if (!strengths || typeof strengths !== 'object') return null
  const st = strengths as Record<string, unknown>
  if (typeof st.ja !== 'string' || typeof st.en !== 'string') return null

  const improvements = o.improvements
  if (!improvements || typeof improvements !== 'object') return null
  const im = improvements as Record<string, unknown>
  if (typeof im.ja !== 'string' || typeof im.en !== 'string') return null

  return {
    scores: {
      point: Math.round(point),
      reason: Math.round(reason),
      example: Math.round(example),
      overall: Math.round(overall),
    },
    comments: { ja: c.ja, en: c.en },
    strengths: { ja: st.ja, en: st.en },
    improvements: { ja: im.ja, en: im.en },
  }
}

const FALLBACK_RESULT: ScoringResult & { error: true } = {
  scores: { point: 0, reason: 0, example: 0, overall: 0 },
  comments: { ja: '採点できませんでした。もう一度お試しください。', en: 'Scoring failed. Please try again.' },
  strengths: { ja: '', en: '' },
  improvements: { ja: '', en: '' },
  error: true,
}

const SYSTEM_PROMPT = `あなたは論理的ライティングの採点コーチです。ユーザーが提出した文章を PREP フレームワーク（Point=主張、Reason=理由、Example=具体例、Point再提示=結論）に基づいて採点します。

【採点基準】
- Point（0〜5点）: 主張が冒頭に明確に述べられているか。一文で端的か。
- Reason（0〜5点）: 理由・根拠が論理的か。主張とつながっているか。
- Example（0〜5点）: 具体例・データ・事例が適切に使われているか。
- 総合スコア（0〜100）: 総合的な論理構成の完成度。

【採点の姿勢】
- 初学者を萎えさせない。部分的に良い点は積極的に加点する。
- 論理的に正しい文章を誤って低スコアにしない。
- 改善点は「こうするともっと良い」という前向きな表現で。
- 短い文章（2〜3文）でも、構造が整っていれば点数を出す。
- 採点はツール呼び出しで構造化して返す。`

// =============================================
// createWritingScoreRouter
// =============================================
export function createWritingScoreRouter(client: Anthropic, writingScoreLimiter: RequestHandler): Router {
  const router = Router()

  router.post('/', writingScoreLimiter, async (req: Request, res: Response) => {
    try {
      const body = (req.body ?? {}) as { text?: unknown; locale?: unknown }
      const validation = validateWritingInput(body.text)
      if (!validation.valid) {
        return res.status(400).json({ error: validation.error })
      }

      const text = (body.text as string).trim()
      const locale = body.locale === 'en' ? 'en' : 'ja'

      let result: ScoringResult

      try {
        const response = await client.messages.create({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 1500,
          system: SYSTEM_PROMPT,
          tools: [
            {
              name: SCORE_TOOL_NAME,
              description: 'PREP フレームワークに基づいてライティングを採点し、構造化された結果を返す',
              input_schema: {
                type: 'object' as const,
                properties: {
                  scores: {
                    type: 'object' as const,
                    properties: {
                      point: { type: 'integer' as const, minimum: 0, maximum: 5, description: 'Point（主張）の明確さ（0〜5点）' },
                      reason: { type: 'integer' as const, minimum: 0, maximum: 5, description: 'Reason（理由）の論理性（0〜5点）' },
                      example: { type: 'integer' as const, minimum: 0, maximum: 5, description: 'Example（具体例）の適切さ（0〜5点）' },
                      overall: { type: 'integer' as const, minimum: 0, maximum: 100, description: '総合スコア（0〜100点）' },
                    },
                    required: ['point', 'reason', 'example', 'overall'],
                  },
                  comments: {
                    type: 'object' as const,
                    properties: {
                      ja: { type: 'string' as const, description: '日本語の総評（100〜200字）' },
                      en: { type: 'string' as const, description: '英語の総評（50〜150 words）' },
                    },
                    required: ['ja', 'en'],
                  },
                  strengths: {
                    type: 'object' as const,
                    properties: {
                      ja: { type: 'string' as const, description: '日本語の良かった点（50〜100字）' },
                      en: { type: 'string' as const, description: '英語の良かった点（30〜80 words）' },
                    },
                    required: ['ja', 'en'],
                  },
                  improvements: {
                    type: 'object' as const,
                    properties: {
                      ja: { type: 'string' as const, description: '日本語の改善点（50〜100字）' },
                      en: { type: 'string' as const, description: '英語の改善点（30〜80 words）' },
                    },
                    required: ['ja', 'en'],
                  },
                },
                required: ['scores', 'comments', 'strengths', 'improvements'],
              },
            },
          ],
          tool_choice: { type: 'tool' as const, name: SCORE_TOOL_NAME },
          messages: [
            {
              role: 'user',
              content: locale === 'en'
                ? `Please score the following writing based on the PREP framework:\n\n${text}`
                : `以下の文章を PREP フレームワークで採点してください:\n\n${text}`,
            },
          ],
        })

        const toolUseBlock = response.content.find(b => b.type === 'tool_use')
        if (!toolUseBlock || toolUseBlock.type !== 'tool_use') {
          return res.json(FALLBACK_RESULT)
        }

        const parsed = parseToolUseResult(toolUseBlock.input)
        if (!parsed) {
          return res.json(FALLBACK_RESULT)
        }

        result = parsed
      } catch (e: unknown) {
        console.error('writing-score Claude API error:', e)
        return res.json(FALLBACK_RESULT)
      }

      res.json(result)
    } catch (e: unknown) {
      console.error('writing-score error:', e)
      res.status(500).json({ error: e instanceof Error ? e.message : String(e) })
    }
  })

  return router
}
