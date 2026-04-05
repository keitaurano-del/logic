import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'
import Anthropic from '@anthropic-ai/sdk'

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
  const { messages, setup } = req.body
  const { template, format, partner, goal, context } = setup

  const formatLabel = format === 'online' ? 'オンライン会議' : '対面'

  const systemPrompt = template.mode === 'presentation'
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
    res.status(500).json({ error: 'AI応答の生成に失敗しました' })
  }
})

// =============================================
// ロールプレイ採点
// =============================================
app.post('/api/roleplay/score', async (req, res) => {
  const { messages, setup, historySummary } = req.body
  const { template, partner, goal } = setup

  const categories = template.mode === 'presentation'
    ? ['論理構成', '説得力', '簡潔さ', '対応力', '印象']
    : ['コミュニケーション', '論理性', '交渉力', '具体性', '目標達成']

  const historySection = historySummary
    ? `\n\n## ユーザーの過去の練習履歴\n${historySummary}\n\n上記の履歴を踏まえて、ユーザーの癖や傾向にも言及してください。改善している点は褒め、繰り返し指摘されている課題には具体的な改善方法を提案してください。`
    : ''

  const systemPrompt = `あなたはビジネスコミュニケーションの採点者です。以下のロールプレイ会話を採点してください。

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

  const conversationText = messages
    .map((m: { role: string; content: string }) =>
      m.role === 'user' ? `【ユーザー】${m.content}` : `【${partner.name}】${m.content}`
    )
    .join('\n')

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      system: systemPrompt,
      messages: [{ role: 'user', content: `以下の会話を採点してください:\n\n${conversationText}` }],
    })

    const text = response.content[0].type === 'text' ? response.content[0].text : ''

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0])
      res.json(result)
    } else {
      throw new Error('Invalid JSON response')
    }
  } catch (error) {
    console.error('Score API error:', error)
    res.status(500).json({ error: '採点に失敗しました' })
  }
})

// =============================================
// フラッシュカードAI生成
// =============================================
app.post('/api/flashcards/generate', async (req, res) => {
  const { wrongAnswers, category, lessonTitle } = req.body

  const systemPrompt = `あなたは学習支援AIです。ユーザーが間違えた問題や苦手な分野をもとに、復習用のフラッシュカードを生成してください。

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

  const wrongList = wrongAnswers
    .map((w: { question: string; correctAnswer: string }, i: number) =>
      `${i + 1}. 問題: ${w.question}\n   正解: ${w.correctAnswer}`)
    .join('\n')

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      system: systemPrompt,
      messages: [{
        role: 'user',
        content: `カテゴリ: ${category}\nレッスン: ${lessonTitle}\n\n間違えた問題:\n${wrongList}\n\nこれらの苦手分野に基づいて、復習用フラッシュカードを生成してください。`,
      }],
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
    res.status(500).json({ error: 'カード生成に失敗しました' })
  }
})

// =============================================
// 会話サマリー生成
// =============================================
app.post('/api/roleplay/summary', async (req, res) => {
  const { messages, setup } = req.body
  const { template, partner, goal } = setup

  const conversationText = messages
    .map((m: { role: string; content: string }) =>
      m.role === 'user' ? `【ユーザー】${m.content}` : `【${partner.name}】${m.content}`
    )
    .join('\n')

  const systemPrompt = `あなたはビジネスコミュニケーションのコーチです。以下のロールプレイ会話を分析し、整理されたサマリーを作成してください。

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

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: systemPrompt,
      messages: [{ role: 'user', content: `以下の会話をサマリーしてください:\n\n${conversationText}` }],
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
    res.status(500).json({ error: 'サマリー生成に失敗しました' })
  }
})

// Serve Vite build output in production
const distPath = path.resolve(__dirname, '..', 'dist')
app.use(express.static(distPath))
app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'))
})

const PORT = parseInt(process.env.PORT || '3001', 10)
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
