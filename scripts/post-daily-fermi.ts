/**
 * 毎日 X（Twitter）にフェルミ問題を自動投稿するスクリプト
 * GitHub Actions の daily-x-post.yml から呼ばれる
 *
 * 必要な環境変数:
 *   X_API_KEY, X_API_SECRET, X_ACCESS_TOKEN, X_ACCESS_SECRET
 *   ANTHROPIC_API_KEY
 */

import Anthropic from '@anthropic-ai/sdk'
import { readFileSync, writeFileSync, existsSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const LOG_PATH = join(__dirname, 'post-log.json')

// ── ログ管理 ──────────────────────────────────────────────
type PostLog = { date: string; tweetId: string; problem: string }[]

function loadLog(): PostLog {
  if (!existsSync(LOG_PATH)) return []
  try { return JSON.parse(readFileSync(LOG_PATH, 'utf-8')) } catch { return [] }
}

function saveLog(log: PostLog) {
  writeFileSync(LOG_PATH, JSON.stringify(log, null, 2))
}

function todayJST(): string {
  return new Date().toLocaleDateString('ja-JP', { timeZone: 'Asia/Tokyo' })
}

// ── フェルミ問題生成 ──────────────────────────────────────
async function generateFermiProblem(): Promise<string> {
  const client = new Anthropic()
  const msg = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 200,
    messages: [{
      role: 'user',
      content: `日本のビジネスパーソン向けのフェルミ推定問題を1問作ってください。
条件:
- 日本の日常・ビジネスシーンに関連した問題
- 例: 「東京都内のコンビニの1日の売上合計は？」「日本中のタクシーが1日に走る距離の合計は？」
- 問題文のみ（解答・ヒントは不要）
- 80文字以内
- 「？」で終わること
- 余計な説明は不要、問題文だけ返してください`
    }]
  })
  const text = msg.content[0].type === 'text' ? msg.content[0].text.trim() : ''
  if (!text) throw new Error('問題の生成に失敗しました')
  return text
}

// ── X への投稿 ────────────────────────────────────────────
async function postToX(text: string): Promise<string> {
  // X API v2 を直接 fetch で叩く（twitter-api-v2 パッケージ不要）
  const { createHmac, createHash } = await import('crypto')

  const url = 'https://api.twitter.com/2/tweets'
  const method = 'POST'
  const timestamp = Math.floor(Date.now() / 1000).toString()
  const nonce = createHash('sha1').update(Math.random().toString()).digest('hex')

  const oauthParams: Record<string, string> = {
    oauth_consumer_key: process.env.X_API_KEY!,
    oauth_nonce: nonce,
    oauth_signature_method: 'HMAC-SHA1',
    oauth_timestamp: timestamp,
    oauth_token: process.env.X_ACCESS_TOKEN!,
    oauth_version: '1.0',
  }

  const paramString = Object.entries(oauthParams)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join('&')

  const baseString = [
    method,
    encodeURIComponent(url),
    encodeURIComponent(paramString),
  ].join('&')

  const signingKey = `${encodeURIComponent(process.env.X_API_SECRET!)}&${encodeURIComponent(process.env.X_ACCESS_SECRET!)}`
  const signature = createHmac('sha1', signingKey).update(baseString).digest('base64')

  const authHeader = 'OAuth ' + Object.entries({ ...oauthParams, oauth_signature: signature })
    .map(([k, v]) => `${encodeURIComponent(k)}="${encodeURIComponent(v)}"`)
    .join(', ')

  const res = await fetch(url, {
    method,
    headers: {
      'Authorization': authHeader,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`X API エラー: ${res.status} ${err}`)
  }

  const data = await res.json() as { data: { id: string } }
  return data.data.id
}

// ── メイン ────────────────────────────────────────────────
async function main() {
  const today = todayJST()
  const log = loadLog()

  if (log.some(e => e.date === today)) {
    console.log(`[skip] 本日(${today})は投稿済みです`)
    return
  }

  const problem = await generateFermiProblem()
  console.log(`[問題] ${problem}`)

  const tweetText = `【今日のフェルミ問題】

${problem}

あなたの考え方をリプライで教えてね 💡
論理思考トレーニングアプリ「Logic」で毎日練習できます。

#フェルミ推定 #論理思考 #ビジネス思考`

  const tweetId = await postToX(tweetText)
  console.log(`[投稿完了] tweet ID: ${tweetId}`)

  log.push({ date: today, tweetId, problem })
  saveLog(log)
}

main().catch(err => {
  console.error('[エラー]', err)
  process.exit(1)
})
