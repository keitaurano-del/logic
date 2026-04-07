import express from 'express'
import cors from 'cors'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import Anthropic from '@anthropic-ai/sdk'
import Stripe from 'stripe'

const stripeKey = process.env.STRIPE_SECRET_KEY
const stripe = stripeKey ? new Stripe(stripeKey) : null

type PlanKey = 'monthly' | 'yearly'
const PLANS: Record<PlanKey, { priceId: string; amount: number; interval: 'month' | 'year' }> = {
  monthly: {
    priceId: process.env.STRIPE_PRICE_MONTHLY || '',
    amount: 500,
    interval: 'month',
  },
  yearly: {
    priceId: process.env.STRIPE_PRICE_YEARLY || '',
    amount: 3500,
    interval: 'year',
  },
}

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
app.use(cors())
app.use(express.json({ limit: '1mb' }))

const client = new Anthropic()

// =============================================
// ロールプレイ会話
// =============================================
app.post('/api/roleplay/chat', async (req, res) => {
  const { messages, setup, locale } = req.body
  const isEn = locale === 'en'
  const { template, format, partner, goal, context } = setup

  const formatLabel = isEn
    ? (format === 'online' ? 'online meeting' : 'in-person')
    : (format === 'online' ? 'オンライン会議' : '対面')

  const systemPromptJa = template.mode === 'presentation'
    ? `あなたはプレゼンテーションの聴衆役です。
設定:
- 聴衆: ${partner.name}（${partner.role}）
- 形式: ${formatLabel}
- 聴衆の関心: ${partner.interests}
- 聴衆の懸念: ${partner.concerns}
${goal ? `- プレゼンのテーマ: ${goal}` : ''}
${context ? `- 補足情報: ${context}` : ''}

ルール:
- 聴衆として自然に振る舞う
- プレゼンの途中で適切な質問やツッコミを入れる
- 良い点があれば相槌を打つ
- 曖昧な部分には具体化を求める
- 1回の発言は2〜4文程度に抑える
- 日本語で応答する`
    : `あなたは「${partner.name}」というロールプレイキャラクターです。
設定:
- 役職: ${partner.role}${partner.company ? `（${partner.company}）` : ''}
- 性格: ${partner.personality}
- 関心事: ${partner.interests}
- 懸念事項: ${partner.concerns}
- 場面: ${template.title}
- 形式: ${formatLabel}
${goal ? `- ユーザーのゴール: ${goal}` : ''}
${context ? `- 補足情報: ${context}` : ''}

ルール:
- ${partner.name}として自然に振る舞う
- キャラクターの性格・関心・懸念を反映した応答をする
- 相手の発言に対して具体的な質問やフィードバックを返す
- 簡単に同意せず、相手の主張を試すような質問もする
- 1回の発言は2〜4文程度に抑える
- 日本語で応答する`

  const systemPromptEn = template.mode === 'presentation'
    ? `You are playing the role of a presentation audience.
Setup:
- Audience: ${partner.name} (${partner.role})
- Format: ${formatLabel}
- Audience interests: ${partner.interests}
- Audience concerns: ${partner.concerns}
${goal ? `- Presentation topic: ${goal}` : ''}
${context ? `- Additional context: ${context}` : ''}

Rules:
- Behave naturally as an audience member
- Ask appropriate questions or push back during the presentation
- Acknowledge strong points
- Ask for specifics when something is vague
- Keep each turn to 2-4 sentences
- Respond in English`
    : `You are playing the character "${partner.name}" in a roleplay.
Setup:
- Role: ${partner.role}${partner.company ? ` (${partner.company})` : ''}
- Personality: ${partner.personality}
- Interests: ${partner.interests}
- Concerns: ${partner.concerns}
- Scene: ${template.title}
- Format: ${formatLabel}
${goal ? `- User's goal: ${goal}` : ''}
${context ? `- Additional context: ${context}` : ''}

Rules:
- Stay in character as ${partner.name}
- Reflect the personality, interests and concerns in every response
- Ask specific clarifying questions or push back on the user's statements
- Don't agree easily — test the user's logic
- Keep each turn to 2-4 sentences
- Respond in English`

  const systemPrompt = isEn ? systemPromptEn : systemPromptJa

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 400,
      system: systemPrompt,
      messages,
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    res.json({ role: 'assistant', content: text })
  } catch (error) {
    console.error('Chat API error:', error)
    res.status(500).json({ error: isEn ? 'Failed to generate AI response' : 'AI応答の生成に失敗しました' })
  }
})

// =============================================
// ロールプレイ自動進行ターン (AI セリフ + ユーザー選択肢)
// =============================================
app.post('/api/roleplay/turn', async (req, res) => {
  const { messages, setup, turnNumber, maxTurns, locale } = req.body as {
    messages: { role: string; content: string }[]
    setup: { template: { title: string }; partner: { name: string; role: string; personality: string; interests: string; concerns: string }; goal: string; context: string }
    turnNumber: number
    maxTurns: number
    locale?: string
  }
  const isEn = locale === 'en'
  const { template, partner, goal, context } = setup
  const isFirst = !messages || messages.length === 0
  const isLast = turnNumber >= maxTurns

  const systemPromptJa = `あなたはロールプレイのナレーター兼キャラクター演者です。場面で「${partner.name}」(${partner.role})を演じます。

## キャラクター設定
- 性格: ${partner.personality}
- 関心事: ${partner.interests}
- 懸念事項: ${partner.concerns}
- 場面: ${template.title}
${goal ? `- ユーザーのゴール: ${goal}` : ''}
${context ? `- 状況: ${context}` : ''}

## ターン情報
- 現在 ${turnNumber}/${maxTurns} ターン目
${isFirst ? '- これは最初のターン。ユーザーへの問いかけや状況提示から始めること。' : ''}
${isLast ? '- これが最後のターン。会話を締めくくるセリフにすること。' : ''}

## 出力ルール
必ず以下の JSON 形式のみで出力 (前後に余計なテキストを入れない):
{
  "partner": "${partner.name}のセリフ (2〜4文、自然な日本語)",
  "choices": [
    "ユーザーの返答候補A (15〜40文字、論理的に良い返答)",
    "ユーザーの返答候補B (15〜40文字、迷いやすい平凡な返答)",
    "ユーザーの返答候補C (15〜40文字、避けたい悪い返答)"
  ]
}

## 選択肢ルール
- 必ず 3 つの選択肢を提示する`

  const systemPromptEn = `You are the narrator and character actor for a roleplay. You will play "${partner.name}" (${partner.role}) in this scene.

## Character setup
- Personality: ${partner.personality}
- Interests: ${partner.interests}
- Concerns: ${partner.concerns}
- Scene: ${template.title}
${goal ? `- User's goal: ${goal}` : ''}
${context ? `- Situation: ${context}` : ''}

## Turn info
- Current turn: ${turnNumber}/${maxTurns}
${isFirst ? '- This is the first turn. Start by setting the scene or asking a question.' : ''}
${isLast ? '- This is the final turn. Wrap up the conversation.' : ''}

## Output rules
Respond ONLY with the following JSON (no extra text before or after):
{
  "partner": "${partner.name}'s line (2-4 sentences, natural English)",
  "choices": [
    "User response option A (15-40 words, the logically strong answer)",
    "User response option B (15-40 words, an average / hesitant answer)",
    "User response option C (15-40 words, the weak / emotional answer to avoid)"
  ]
}

## Choice rules
- Always provide exactly 3 choices`

  const tailJa = `
- 選択肢は「論理的に強い」「中間」「弱い/感情的」のバランスでバリエーションを持たせる
- ${isLast ? '最終ターンでも choices は 3 つ用意する (会話を締めくくる返答案として)' : ''}`
  const tailEn = `
- Vary the choices: "logically strong", "average", "weak/emotional"
- ${isLast ? 'Provide 3 choices even on the final turn (closing-line options)' : ''}`
  const systemPrompt = (isEn ? systemPromptEn : systemPromptJa) + (isEn ? tailEn : tailJa)

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 600,
      system: systemPrompt,
      messages: isFirst ? [{ role: 'user', content: '(開始)' }] : messages,
    })
    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('Invalid JSON response')
    const parsed = JSON.parse(jsonMatch[0])
    res.json({ partner: parsed.partner, choices: parsed.choices, done: isLast })
  } catch (error) {
    console.error('Turn API error:', error)
    res.status(500).json({ error: isEn ? 'Failed to generate the next turn' : 'ターン生成に失敗しました' })
  }
})

// =============================================
// ロールプレイ採点
// =============================================
app.post('/api/roleplay/score', async (req, res) => {
  const { messages, setup, historySummary, locale } = req.body
  const isEn = locale === 'en'
  const { template, partner, goal } = setup

  const categoriesJa = template.mode === 'presentation'
    ? ['論理構成', '説得力', '簡潔さ', '対応力', '印象']
    : ['コミュニケーション', '論理性', '交渉力', '具体性', '目標達成']
  const categoriesEn = template.mode === 'presentation'
    ? ['Logical Structure', 'Persuasiveness', 'Conciseness', 'Adaptability', 'Impression']
    : ['Communication', 'Logical Rigor', 'Negotiation', 'Specificity', 'Goal Achievement']
  const categories = isEn ? categoriesEn : categoriesJa

  const historySectionJa = historySummary
    ? `\n\n## ユーザーの過去の練習履歴\n${historySummary}\n\n上記の履歴を踏まえて、ユーザーの癖や傾向にも言及してください。改善している点は褒め、繰り返し指摘されている課題には具体的な改善方法を提案してください。`
    : ''
  const historySectionEn = historySummary
    ? `\n\n## User's past practice history\n${historySummary}\n\nReference this history when scoring. Praise areas of improvement, and offer concrete fixes for recurring weaknesses.`
    : ''
  const historySection = isEn ? historySectionEn : historySectionJa

  const systemPromptJa = `あなたはビジネスコミュニケーションの採点者です。以下のロールプレイ会話を採点してください。

## シナリオ情報
- 場面: ${template.title}
- 相手: ${partner.name}（${partner.role}）
- 相手の性格: ${partner.personality}
- 相手の関心: ${partner.interests}
${goal ? `- ユーザーのゴール: ${goal}` : ''}
${historySection}

## 採点基準
以下の${categories.length}カテゴリを各10点満点で採点してください:
${categories.map((c, i) => `${i + 1}. ${c}`).join('\n')}

## 出力形式
必ず以下のJSON形式のみで出力してください（前後に余計なテキストを含めないでください）:
{
  "scores": [
    {"name": "カテゴリ名", "score": 数字, "maxScore": 10, "feedback": "具体的なフィードバック（1〜2文）"}
  ],
  "overall": "総合フィードバック（3〜5文。良い点、改善点、次回へのアドバイスを含める。過去の履歴がある場合は傾向や成長にも言及する）"
}`

  const systemPromptEn = `You are a business communication evaluator. Score the following roleplay conversation.

## Scenario
- Scene: ${template.title}
- Counterpart: ${partner.name} (${partner.role})
- Counterpart personality: ${partner.personality}
- Counterpart interests: ${partner.interests}
${goal ? `- User's goal: ${goal}` : ''}
${historySection}

## Scoring criteria
Score the following ${categories.length} categories on a 10-point scale:
${categories.map((c, i) => `${i + 1}. ${c}`).join('\n')}

## Output format
Respond ONLY with the following JSON (no extra text):
{
  "scores": [
    {"name": "Category name", "score": number, "maxScore": 10, "feedback": "Specific feedback in 1-2 sentences"}
  ],
  "overall": "Overall feedback in 3-5 sentences. Include strengths, weaknesses, and concrete advice for next time. Reference history and growth if history is provided."
}`

  const systemPrompt = isEn ? systemPromptEn : systemPromptJa

  const youLabel = isEn ? '[User]' : '【ユーザー】'
  const conversationText = messages
    .map((m: { role: string; content: string }) =>
      m.role === 'user' ? `${youLabel}${m.content}` : (isEn ? `[${partner.name}]${m.content}` : `【${partner.name}】${m.content}`)
    )
    .join('\n')

  const userInstruction = isEn
    ? `Please score the following conversation:\n\n${conversationText}`
    : `以下の会話を採点してください:\n\n${conversationText}`

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      system: systemPrompt,
      messages: [{ role: 'user', content: userInstruction }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0])
      res.json(result)
    } else {
      throw new Error('Invalid JSON response')
    }
  } catch (error) {
    console.error('Score API error:', error)
    res.status(500).json({ error: isEn ? 'Failed to score the conversation' : '採点に失敗しました' })
  }
})

// =============================================
// フラッシュカードAI生成
// =============================================
app.post('/api/flashcards/generate', async (req, res) => {
  const { wrongAnswers, category, lessonTitle, locale } = req.body
  const isEn = locale === 'en'

  const systemPromptJa = `あなたは学習支援AIです。ユーザーが間違えた問題や苦手な分野をもとに、復習用のフラッシュカードを生成してください。

## ルール
- 各カードは「表面（質問）」と「裏面（解答+簡潔な解説）」で構成
- 間違えた問題の周辺知識や関連概念もカバーする
- 暗記しやすい短い表現にする
- 似た概念の違いを問うカードも作る
- 5〜8枚生成する

## 出力形式（JSONのみ）
[
  {"front": "質問文", "back": "解答と簡潔な解説"}
]`

  const systemPromptEn = `You are a learning-support AI. Based on the user's wrong answers and weak areas, generate review flashcards.

## Rules
- Each card has a "front" (question) and a "back" (answer + brief explanation)
- Cover related concepts and adjacent knowledge, not just the literal wrong answers
- Use short, memorable phrasing
- Include cards that contrast similar concepts
- Generate 5 to 8 cards
- Respond in English

## Output (JSON only)
[
  {"front": "Question", "back": "Answer with brief explanation"}
]`

  const wrongList = wrongAnswers
    .map((w: { question: string; correctAnswer: string }, i: number) =>
      isEn
        ? `${i + 1}. Question: ${w.question}\n   Correct answer: ${w.correctAnswer}`
        : `${i + 1}. 問題: ${w.question}\n   正解: ${w.correctAnswer}`)
    .join('\n')

  const userMessage = isEn
    ? `Category: ${category}\nLesson: ${lessonTitle}\n\nWrong answers:\n${wrongList}\n\nBased on these weak areas, please generate review flashcards.`
    : `カテゴリ: ${category}\nレッスン: ${lessonTitle}\n\n間違えた問題:\n${wrongList}\n\nこれらの苦手分野に基づいて、復習用フラッシュカードを生成してください。`

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      system: isEn ? systemPromptEn : systemPromptJa,
      messages: [{ role: 'user', content: userMessage }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      const cards = JSON.parse(jsonMatch[0])
      res.json({ cards })
    } else {
      throw new Error('Invalid JSON')
    }
  } catch (error) {
    console.error('Flashcard API error:', error)
    res.status(500).json({ error: isEn ? 'Failed to generate flashcards' : 'カード生成に失敗しました' })
  }
})

// =============================================
// 会話サマリー生成
// =============================================
app.post('/api/roleplay/summary', async (req, res) => {
  const { messages, setup, locale } = req.body
  const isEn = locale === 'en'
  const { template, partner, goal } = setup

  const conversationText = messages
    .map((m: { role: string; content: string }) =>
      m.role === 'user'
        ? (isEn ? `[User]${m.content}` : `【ユーザー】${m.content}`)
        : (isEn ? `[${partner.name}]${m.content}` : `【${partner.name}】${m.content}`)
    )
    .join('\n')

  const systemPromptJa = `あなたはビジネスコミュニケーションのコーチです。以下のロールプレイ会話を分析し、整理されたサマリーを作成してください。

## シナリオ
- 場面: ${template.title}
- 相手: ${partner.name}（${partner.role}）
${goal ? `- ゴール: ${goal}` : ''}

## 出力形式（JSONのみ）
{
  "summary": "会話の要約（3〜5文で、何が話し合われたか、どんな結論に至ったかを簡潔に）",
  "keyPoints": ["ユーザーが主張した重要なポイント（3〜5個）"],
  "improvements": ["次回に活かせる改善ポイント（2〜3個）"],
  "goodPoints": ["良かった点（2〜3個）"]
}`

  const systemPromptEn = `You are a business communication coach. Analyze the following roleplay conversation and produce a structured summary.

## Scenario
- Scene: ${template.title}
- Counterpart: ${partner.name} (${partner.role})
${goal ? `- Goal: ${goal}` : ''}

## Output (JSON only, English)
{
  "summary": "3-5 sentence summary of the conversation, what was discussed, and the conclusion reached",
  "keyPoints": ["3-5 important points the user made"],
  "improvements": ["2-3 areas to improve next time"],
  "goodPoints": ["2-3 strengths"]
}`

  const userInstruction = isEn
    ? `Please summarize the following conversation:\n\n${conversationText}`
    : `以下の会話をサマリーしてください:\n\n${conversationText}`

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: isEn ? systemPromptEn : systemPromptJa,
      messages: [{ role: 'user', content: userInstruction }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      res.json(JSON.parse(jsonMatch[0]))
    } else {
      throw new Error('Invalid JSON')
    }
  } catch (error) {
    console.error('Summary API error:', error)
    res.status(500).json({ error: isEn ? 'Failed to summarize the conversation' : 'サマリー生成に失敗しました' })
  }
})

// =============================================
// 学習ジャーナル生成
// =============================================
app.post('/api/journal/generate', async (req, res) => {
  try {
    const { date, completedLessons = [], flashcardStats = { correct: 0, total: 0 }, studyMinutes = 0, locale } = req.body || {}
    const isEn = locale === 'en'

    const lessonsList = completedLessons.length ? completedLessons.join(', ') : (isEn ? '(none)' : '（なし）')
    const cardInfo = flashcardStats.total > 0
      ? (isEn
          ? `Flashcards: ${flashcardStats.correct} mastered / ${flashcardStats.total} total`
          : `フラッシュカード: ${flashcardStats.correct}枚習得 / 全${flashcardStats.total}枚`)
      : (isEn ? 'Flashcards: none' : 'フラッシュカード: なし')

    const promptJa = `あなたは温かく寄り添う学習コーチです。以下の今日の学習内容を見て、ユーザーの学びを100文字程度で振り返り、明日への具体的なアドバイスを1文添えてください。励ましの口調で、絵文字は使わないでください。

【日付】${date}
【完了レッスン】${lessonsList}
【${cardInfo}】
【学習時間】${studyMinutes}分`

    const promptEn = `You are a warm, supportive learning coach. Look at today's study summary, write a ~50-word reflection on what the user accomplished, and add one concrete piece of advice for tomorrow. Use an encouraging tone. Do not use emoji.

[Date] ${date}
[Completed lessons] ${lessonsList}
[${cardInfo}]
[Study time] ${studyMinutes} minutes`

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 400,
      messages: [{ role: 'user', content: isEn ? promptEn : promptJa }],
    })

    const text = response.content
      .filter((b: any) => b.type === 'text')
      .map((b: any) => (b as any).text)
      .join('')

    res.json({ summary: text.trim() })
  } catch (e: any) {
    console.error('journal generate error:', e)
    res.status(500).json({ error: e.message || 'failed' })
  }
})

// =============================================
// AI問題ジェネレーター
// =============================================
app.post('/api/generate-problems', async (req, res) => {
  try {
    const { prompt = '', locale } = req.body || {}
    if (!prompt || prompt.length < 5) {
      return res.status(400).json({ error: 'prompt is required' })
    }
    const isEn = locale === 'en'

    const systemPromptJa = `あなたは簿記・会計・ビジネス学習問題の作成プロフェッショナルです。
ユーザーのリクエストに基づいて、4択クイズ問題を作成します。

必ず以下のJSON形式のみで返してください。他のテキストは一切含めないでください:

{
  "title": "問題セットのタイトル（30文字以内）",
  "category": "カテゴリー（例: 簿記2級）",
  "steps": [
    {
      "type": "quiz",
      "question": "問題文",
      "options": [
        { "label": "選択肢1", "correct": false },
        { "label": "選択肢2", "correct": true },
        { "label": "選択肢3", "correct": false },
        { "label": "選択肢4", "correct": false }
      ],
      "explanation": "なぜこの答えが正しいかの解説（100文字程度）"
    }
  ]
}

ルール:
- 各問題は必ず4つの選択肢を持つ
- 正解は1つだけ
- 解説は教育的で、なぜ他の選択肢が違うかも触れる
- ユーザーが指定した数だけ問題を作る（指定がなければ3問）
- 専門用語は正確に
- 日本語で出力`

    const systemPromptEn = `You are a professional question writer for business and logical-thinking practice.
Based on the user's request, create 4-choice quiz questions.

Respond ONLY with the following JSON. No other text.

{
  "title": "Quiz set title (30 chars or less)",
  "category": "Category (e.g. Logical Thinking)",
  "steps": [
    {
      "type": "quiz",
      "question": "Question text",
      "options": [
        { "label": "Option 1", "correct": false },
        { "label": "Option 2", "correct": true },
        { "label": "Option 3", "correct": false },
        { "label": "Option 4", "correct": false }
      ],
      "explanation": "Educational explanation (~50 words). Touch on why the wrong options are wrong."
    }
  ]
}

Rules:
- Each question has exactly 4 options
- Exactly one correct answer
- Generate the number requested (default 3)
- Use precise terminology
- Output in English`

    const systemPrompt = isEn ? systemPromptEn : systemPromptJa

    const response = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = response.content
      .filter((b: any) => b.type === 'text')
      .map((b: any) => b.text)
      .join('')
      .trim()

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return res.status(500).json({ error: 'AI response parse failed' })
    }
    const data = JSON.parse(jsonMatch[0])

    res.json({
      title: data.title || (isEn ? 'AI Problems' : 'AI生成問題'),
      category: data.category || (isEn ? 'AI Generated' : 'AI生成'),
      steps: data.steps || [],
    })
  } catch (e: any) {
    console.error('generate-problems error:', e)
    res.status(500).json({ error: e.message || 'failed' })
  }
})

// Serve Vite build output in production
const distPath = path.resolve(__dirname, '..', 'dist')
app.use(express.static(distPath))
app.get('/{*splat}', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'))
})

// =============================================
// フェルミ推定 — フィードバック生成
// =============================================
app.post('/api/fermi/feedback', async (req, res) => {
  try {
    const { question, userInput, locale } = req.body || {}
    if (!question || !userInput) {
      return res.status(400).json({ error: 'question and userInput required' })
    }
    const isEn = locale === 'en'

    const systemPromptJa = `あなたはロジカルシンキングのコーチです。フェルミ推定を学ぶユーザーの分解プロセスにフィードバックを返します。

絶対に守るルール:
- スコアや正誤判定 (◯/✗、◯点 など) は一切出力しない
- 答えの数字が合っているかには触れない
- 評価の対象は「分解の構造」「視点の網羅性」のみ
- 励まし (「いいですね」「素晴らしい」) で必ず始める
- 日本語で、優しく具体的に、合計 350 字以内

出力フォーマット (この見出しを必ず使う):

## 良かった視点
- (1〜2 個、具体的にどこが良いか)

## 別の視点
- (1 個、見落としやすい切り口を提案)

## 模範的な分解例
1. (式の第 1 ステップ)
2. (第 2 ステップ)
3. (第 3 ステップ)`

    const systemPromptEn = `You are a logical-thinking coach. Provide feedback on a user's Fermi estimation decomposition.

Absolute rules:
- NEVER output scores, ✓/✗, or right/wrong judgments
- Do NOT comment on whether the numerical answer is correct
- Evaluate ONLY the decomposition structure and breadth of perspectives
- Always begin with encouragement ("Nice work", "Great start")
- Respond in English, kind and specific, under ~250 words

Output format (use these exact headings):

## Strong points
- (1-2 specific things they did well)

## Another angle
- (1 perspective that is easy to miss)

## A model decomposition
1. (Formula step 1)
2. (Step 2)
3. (Step 3)`

    const userMessage = isEn
      ? `Question: ${question}\n\nUser's decomposition:\n${userInput}\n\nPlease give feedback on this decomposition.`
      : `問題: ${question}\n\nユーザーの分解:\n${userInput}\n\nこの分解にフィードバックをお願いします。`

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 700,
      system: isEn ? systemPromptEn : systemPromptJa,
      messages: [{ role: 'user', content: userMessage }],
    })
    const text = response.content[0].type === 'text' ? response.content[0].text : ''
    res.json({ feedback: text })
  } catch (e: any) {
    console.error('fermi feedback error:', e)
    res.status(500).json({ error: e.message || 'failed' })
  }
})

// =============================================
// フェルミ推定 — AI 問題生成 (premium)
// =============================================
app.post('/api/fermi/question', async (req, res) => {
  try {
    const isEn = req.body?.locale === 'en'
    const userPrompt = isEn
      ? 'Generate exactly one Fermi estimation problem in English. Pick something from everyday Western/global business or society that is good for decomposition practice. Return only the question on a single line — no preface, no explanation.'
      : 'フェルミ推定の問題を 1 問だけ日本語で生成してください。日常的な日本の社会・経済に関する問いで、分解思考の練習に適したものを出してください。問題文のみを 1 行で返してください。前置きや説明は不要です。'

    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 200,
      messages: [{ role: 'user', content: userPrompt }],
    })
    const text = response.content[0].type === 'text' ? response.content[0].text.trim() : ''
    res.json({ question: text })
  } catch (e: any) {
    console.error('fermi question error:', e)
    res.status(500).json({ error: e.message || 'failed' })
  }
})

const REPORTS_FILE = path.join(process.cwd(), 'reports.json')
const PLACEMENT_FILE = path.join(process.cwd(), 'placement.json')

type PlacementEntry = {
  guestId: string
  nickname: string
  deviation: number
  correctCount: number
  totalCount: number
  completedAt: string
}

function loadPlacements(): PlacementEntry[] {
  try {
    if (fs.existsSync(PLACEMENT_FILE)) {
      return JSON.parse(fs.readFileSync(PLACEMENT_FILE, 'utf-8'))
    }
  } catch { /* */ }
  return []
}

function savePlacements(entries: PlacementEntry[]) {
  fs.writeFileSync(PLACEMENT_FILE, JSON.stringify(entries, null, 2))
}

app.post('/api/placement/submit', (req, res) => {
  try {
    const { guestId, nickname, deviation, correctCount, totalCount } = req.body || {}
    if (!guestId || typeof deviation !== 'number') {
      return res.status(400).json({ error: 'guestId and deviation required' })
    }
    const entries = loadPlacements()
    const idx = entries.findIndex((e) => e.guestId === guestId)
    const entry: PlacementEntry = {
      guestId,
      nickname: (nickname || 'ゲスト').slice(0, 20),
      deviation,
      correctCount: correctCount || 0,
      totalCount: totalCount || 0,
      completedAt: new Date().toISOString(),
    }
    if (idx >= 0) entries[idx] = entry
    else entries.push(entry)
    savePlacements(entries)
    res.json({ ok: true })
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

app.post('/api/placement/delete', (req, res) => {
  try {
    const { guestId } = req.body || {}
    if (!guestId) return res.status(400).json({ error: 'guestId required' })
    const entries = loadPlacements().filter((e) => e.guestId !== guestId)
    savePlacements(entries)
    res.json({ ok: true })
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

app.get('/api/placement/ranking', (req, res) => {
  try {
    const guestId = (req.query.guestId as string) || ''
    const entries = loadPlacements()
      .filter((e) => e.totalCount > 0) // skipped users excluded
      .sort((a, b) => b.deviation - a.deviation)
    const total = entries.length
    const top = entries.slice(0, 50).map((e, i) => ({
      rank: i + 1,
      nickname: e.nickname,
      deviation: e.deviation,
      isYou: e.guestId === guestId,
    }))
    let yourRank = -1
    let yourDeviation = -1
    if (guestId) {
      const idx = entries.findIndex((e) => e.guestId === guestId)
      if (idx >= 0) {
        yourRank = idx + 1
        yourDeviation = entries[idx].deviation
      }
    }
    res.json({ total, top, yourRank, yourDeviation })
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

app.post('/api/report-problem', async (req, res) => {
  try {
    const { lessonTitle, lessonId, question, options, issueType, comment } = req.body || {}

    if (!question || !issueType) {
      return res.status(400).json({ error: 'question and issueType are required' })
    }

    const report = {
      id: 'r_' + Date.now(),
      timestamp: new Date().toISOString(),
      lessonTitle: lessonTitle || '',
      lessonId: lessonId || null,
      question,
      options: options || [],
      issueType,
      comment: comment || '',
    }

    let reports: any[] = []
    try {
      if (fs.existsSync(REPORTS_FILE)) {
        reports = JSON.parse(fs.readFileSync(REPORTS_FILE, 'utf-8'))
      }
    } catch { /* ignore */ }

    reports.push(report)
    fs.writeFileSync(REPORTS_FILE, JSON.stringify(reports, null, 2))

    console.log('[REPORT]', issueType, '-', lessonTitle, '-', question.slice(0, 50))
    res.json({ ok: true, id: report.id })
  } catch (e: any) {
    console.error('report-problem error:', e)
    res.status(500).json({ error: e.message || 'failed' })
  }
})

app.get('/api/reports', (_req, res) => {
  try {
    if (!fs.existsSync(REPORTS_FILE)) return res.json([])
    const reports = JSON.parse(fs.readFileSync(REPORTS_FILE, 'utf-8'))
    res.json(reports)
  } catch (e: any) {
    res.status(500).json({ error: e.message })
  }
})

// =============================================
// Stripe Checkout
// =============================================
app.post('/api/checkout', async (req, res) => {
  if (!stripe) return res.status(503).json({ error: 'Stripe not configured' })
  try {
    const { plan, guestId } = req.body as { plan: PlanKey; guestId?: string }
    if (!PLANS[plan]) return res.status(400).json({ error: 'invalid plan' })
    const planConfig = PLANS[plan]
    if (!planConfig.priceId) return res.status(503).json({ error: 'price not configured' })

    const origin = (req.headers.origin as string) || `http://${req.headers.host}`
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: planConfig.priceId, quantity: 1 }],
      success_url: `${origin}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?checkout=cancel`,
      metadata: { guestId: guestId || '', plan },
      client_reference_id: guestId || undefined,
    })
    res.json({ url: session.url })
  } catch (e: any) {
    console.error('checkout error:', e)
    res.status(500).json({ error: e.message })
  }
})

app.get('/api/checkout-verify', async (req, res) => {
  if (!stripe) return res.status(503).json({ error: 'Stripe not configured' })
  try {
    const sessionId = req.query.session_id as string
    if (!sessionId) return res.status(400).json({ error: 'session_id required' })
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    const plan = (session.metadata?.plan as PlanKey) || 'monthly'
    const expiresAt = new Date()
    if (plan === 'yearly') expiresAt.setFullYear(expiresAt.getFullYear() + 1)
    else expiresAt.setMonth(expiresAt.getMonth() + 1)
    res.json({
      paid: session.payment_status === 'paid',
      plan,
      expiresAt: expiresAt.toISOString(),
    })
  } catch (e: any) {
    console.error('checkout-verify error:', e)
    res.status(500).json({ error: e.message })
  }
})

// =============================================
// 今日の1問
// =============================================
app.post('/api/daily-problem', async (req, res) => {
  try {
    const isEn = req.body?.locale === 'en'

    const themesJa = [
      'MECEを使った問題分解',
      'ロジックツリーで原因を特定する',
      'So What / Why So の使い方',
      'ピラミッド原則で結論を伝える',
      '帰納法と演繹法の違い',
      '仮説思考のステップ',
      'クリティカルシンキングの実践',
      'フレームワーク思考の活用',
      '前提を疑う問いの立て方',
      '構造化のテクニック',
      'ロジカルシンキングのケーススタディ',
      '問題の本質を見抜く方法',
    ]
    const themesEn = [
      'Decomposing problems with MECE',
      'Finding root causes with a logic tree',
      'How to use So What / Why So',
      'Communicating conclusions with the Pyramid Principle',
      'The difference between induction and deduction',
      'Steps of hypothesis-driven thinking',
      'Practical critical thinking',
      'Applying framework-based thinking',
      'Asking questions that challenge assumptions',
      'Techniques for structuring information',
      'Logical thinking case studies',
      'How to see the essence of a problem',
    ]
    const themes = isEn ? themesEn : themesJa
    const theme = themes[Math.floor(Math.random() * themes.length)]

    const prompt = isEn
      ? `Create exactly one 4-choice quiz question about "${theme}" that trains a working professional's logical thinking. Use a realistic everyday business scenario.`
      : `「${theme}」について、ビジネスパーソンの論理的思考力を鍛える4択問題を1問だけ作ってください。
日常のビジネスシーンを想定した実践的な問題にしてください。`

    const systemPromptJa = `あなたは論理的思考力を鍛える問題作成AIです。
必ず以下のJSON形式のみで返してください:
{
  "title": "問題タイトル(20文字以内)",
  "category": "ロジカルシンキング",
  "steps": [
    {
      "type": "quiz",
      "question": "問題文",
      "options": [
        { "label": "選択肢1", "correct": false },
        { "label": "選択肢2", "correct": true },
        { "label": "選択肢3", "correct": false },
        { "label": "選択肢4", "correct": false }
      ],
      "explanation": "解説(なぜ正解か、他の選択肢のどこが間違いか)"
    }
  ]
}`

    const systemPromptEn = `You are an AI that creates logical-thinking practice questions.
Respond ONLY with the following JSON:
{
  "title": "Title (20 chars or less)",
  "category": "Logical Thinking",
  "steps": [
    {
      "type": "quiz",
      "question": "Question text",
      "options": [
        { "label": "Option 1", "correct": false },
        { "label": "Option 2", "correct": true },
        { "label": "Option 3", "correct": false },
        { "label": "Option 4", "correct": false }
      ],
      "explanation": "Explanation: why the right answer is right and what the wrong options miss"
    }
  ]
}
Respond in English.`

    const systemPrompt = isEn ? systemPromptEn : systemPromptJa

    const response = await client.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 2048,
      system: systemPrompt,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = response.content
      .filter((b: any) => b.type === 'text')
      .map((b: any) => b.text)
      .join('')
      .trim()

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) return res.status(500).json({ error: 'parse failed' })
    res.json(JSON.parse(jsonMatch[0]))
  } catch (e: any) {
    console.error('daily-problem error:', e)
    res.status(500).json({ error: e.message })
  }
})

const PORT = parseInt(process.env.PORT || '3001', 10)
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
