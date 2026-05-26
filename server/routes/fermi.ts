import { Router, type Request, type Response } from 'express'
import type Anthropic from '@anthropic-ai/sdk'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { RequestHandler } from 'express'

// =============================================
// フェルミ推定 問題プール（20問、日付ローテーション）
// =============================================
const FERMI_QUESTION_POOL_JA: Array<{ question: string; hint: string }> = [
  { question: '日本全国に自動販売機は何台あるか？', hint: '人口÷自販機の密度で考えてみよう。コンビニより多いか少ないかを基準に。' },
  { question: '東京タワーの重さは何トンか？', hint: '高さ333mの鉄骨構造物。1mあたりの重量×高さで分解してみよう。' },
  { question: '日本で1年間に消費されるカップラーメンの個数は？', hint: '人口×世帯数×週の消費頻度×52週で計算できる。' },
  { question: '日本全国の美容室の数はコンビニより多いか少ないか？その数は？', hint: 'コンビニ約6万店が基準。美容室は需要（何人に1軒）から推定しよう。' },
  { question: '東京ドームに水を満たすと何リットル入るか？', hint: 'ドームの体積は約124万㎥。㎥とリットルの変換を使おう。' },
  { question: '日本人が1年間に食べるおにぎりの総数は？', hint: '1人が週に何個食べるか×人口×52週で分解できる。コンビニ販売分も含めよう。' },
  { question: '日本全国の信号機は何基あるか？', hint: '交差点の数×信号機の数で考えよう。市区町村数×平均交差点数が出発点。' },
  { question: '日本のタクシーは全部で何台あるか？', hint: '大都市と地方で密度が違う。東京の台数を基準に全国へ外挿しよう。' },
  { question: 'スーパーのレジを通過する商品は1日何品か（全国合計）？', hint: 'スーパーの数×1店舗の1日の来客数×1人の購入品数で計算しよう。' },
  { question: '日本の道路の総延長は何kmか？', hint: '高速・国道・県道・市区町村道の4段階で分解しよう。面積あたりの密度を使うと便利。' },
  { question: 'Youtubeに毎分アップロードされる動画は何分か？', hint: '世界中のクリエイター数×1人あたりのアップロード頻度×平均動画時間で分解。' },
  { question: '東京→大阪間を徒歩で歩いたら何日かかるか？', hint: '距離約500km÷1日の歩行距離で計算。1日何km歩けるかを考えよう。' },
  { question: '日本のコンビニが1日に捨てる食品廃棄物は何トンか？', hint: '店舗数×1店舗の1日の廃棄量。廃棄率とメニュー数から推定しよう。' },
  { question: '日本人の平均的なスマホ使用時間は1日何時間か。全国合計すると？', hint: '個人の平均時間は統計的に4〜5時間。人口×時間で総量を出そう。' },
  { question: '日本全国の学校の数（小中高大合計）は？', hint: '小学校から大学まで段階ごとに分けて計算。人口÷1校あたりの生徒数が使える。' },
  { question: '新幹線は開業以来、何人の乗客を運んだか？', hint: '1964年開業。年間利用者数×60年で概算できる。利用者数は人口と路線数から推定。' },
  { question: '日本で1日に送受信されるメールの総数は？', hint: 'ビジネスメールと個人メールに分けよう。1人が1日に送受信する数×人口。' },
  { question: '富士山の体積は東京ドーム何個分か？', hint: '円錐の体積＝1/3×底面積×高さ。底面の半径と高さから計算しよう。' },
  { question: '日本の全テレビ局が1日に放送するCMは合計何本か？', hint: 'CM枠は1時間に約12分。チャンネル数×放送時間×CM本数/分で計算。' },
  { question: '日本の電車が1日に走る距離の合計は何kmか？', hint: '路線数×1路線の1日の運行本数×路線距離で分解。JR+私鉄+地下鉄を忘れずに。' },
  // ── ビジネス系 ──
  { question: '日本のスタバ全店舗が1日に売り上げる総額は何円か？', hint: '店舗数×1店舗の客数×客単価で分解。営業時間と回転率も意識しよう。' },
  { question: '従業員50人の中小企業の年間オフィス賃料は何円か？', hint: '1人あたりの必要面積×坪単価×12ヶ月で計算。都心と郊外で大きく異なる。' },
  { question: '日本のビジネスマンが1日に交換する名刺は全国合計で何枚か？', hint: '労働力人口×営業職比率×1人/日の名刺交換数で分解。職種ごとの差が大きい。' },
  { question: 'スターバックスが日本で年間に消費するコーヒー豆は何kgか？', hint: '1杯あたりの豆量×1日の販売杯数×店舗数×365日で計算。' },
  { question: '日本の上場企業の役員報酬は年間で総額いくらか？', hint: '上場企業数×1社あたりの役員数×平均報酬。中央値と平均の差に注意。' },
  { question: '全国のオフィスで1日に印刷されるA4用紙は何枚か？', hint: '労働力人口×ホワイトカラー比率×1人/日の印刷枚数で分解。ペーパーレス化の影響も考えよう。' },
  { question: '日本国内のSaaS市場の年間売上規模は何円か？', hint: '日本の法人数×SaaS導入率×1社あたりの年間支出で分解。中小と大企業で支出額が違う。' },
  { question: '大手コンサルファームが日本で年間に受注するプロジェクト数は？', hint: '従業員数÷プロジェクトあたりの人数×年間稼働回転数で考えよう。' },
  { question: '居酒屋チェーン（300店舗）の1日の総売上は何円か？', hint: '1店舗の席数×回転率×客単価×店舗数で計算。平日と週末の違いも意識。' },
  { question: '日本の法人が1年に支払う電気代の合計は何円か？', hint: '法人数×1社あたりの平均電気使用量×電力単価で分解。製造業と非製造業で違う。' },
]

export function createFermiRouter(
  client: Anthropic,
  supabase: SupabaseClient | null,
  fermiLimiter: RequestHandler,
): Router {
  const router = Router()

  // =============================================
  // フェルミ推定 — フィードバック
  // =============================================
  router.post('/feedback', fermiLimiter, async (req: Request, res: Response) => {
    try {
      const { question, userInput, locale, hintUsed, elapsedSec } = req.body || {}
      if (!question || !userInput) {
        return res.status(400).json({ error: 'question and userInput required' })
      }
      const isEn = locale === 'en'
      const elapsedMin = Math.round((elapsedSec || 0) / 60)

      const hintPenalty = hintUsed ? 10 : 0
      const timePenalty = elapsedMin >= 5 ? 10 : elapsedMin >= 3 ? 5 : 0

      const systemPromptJa = `あなたはロジカルシンキングのコーチです。フェルミ推定を学ぶユーザーの分解プロセスにフィードバックを返し、スコアを算出し、最後に**実際の概算解と「前提値の推測ロジック」を提示**します。

採点基準 (合計100点):
- 論理的分解の構造 (50点): 要素の網羅性・MECEさ、そして**使った数字に根拠と仮説があるか**（「なぜその値か」を本人の言葉で説明できているか）
- 思考の独自性 (30点): 新鮮な切り口・意外な視点
- 回答の明確さ (20点): 結論が明確か・計算が追いやすいか
- ヒント使用ペナルティ: ${hintPenalty}点減点
- 解答時間ペナルティ: ${timePenalty}点減点 (解答時間 ${elapsedMin}分)
- 最終スコア = 論理+独自性+明確さ - ペナルティ合計 (0〜100に収める)

採点で**特に重視するロジックの弱点**:
- 数字を出すときに「どこから来たのか」「なぜその値が妥当か」の仮説が無い／薄い
- 例: 「1人 1日 3個食べる」とだけ書いて根拠が無い → 弱い
- 例: 「平均的なオフィスワーカーは仕事中に集中して食べないので 1日 1〜2個と仮定。週末は倍と見て…」→ 強い
- このロジックの弱さは「## 点数を伸ばすには」セクションで具体的に指摘すること

**最重要ルール — 前提値の推測ロジックを必ず示すこと**:
フェルミ推定は「個別の業界データを知らない人がロジックで推測する」競技。なので、
答え合わせで「日本の世帯数は 5800 万世帯」と数字を出すだけでは絶対にダメ。
**その数字を、誰でも知っている公知の情報（人口 1.2 億人、平均世帯人数 2 人など）から
どう派生させたかの推測手順を必ず書く**。

良い例:
- 日本の人口 ≈ 1.2 億人（誰でも知っている）
  → 平均世帯人数は単身世帯増加で約 2 人と推測
  → 世帯数 ≈ 1.2億 ÷ 2 ≈ 6000万世帯
- スマホ普及率 ≈ 80%（自分の周りで観察 + 高齢者は低めと補正）
  → 大人 1 億人 × 0.8 ≈ 8000万台

ダメな例（絶対やらない）:
- 「世帯数: 5800万世帯」← なぜそう言えるのかが無い
- 「スマホ普及率: 80%」← どこから来たのか不明

ルール:
- 励まし (「いいですね」「素晴らしい」) で必ず始める
- 評価の主軸は「分解の構造」と「数字の根拠・仮説の質」
- 数値の正誤を断罪しない (「ここを ◯◯ にするとより精度が上がる」のように建設的に)
- **必ず「概算解の組み立て方」セクションで、各前提値ごとに「どう推測したか」を明示する**
- **必ず「点数を伸ばすには」セクションを出す**(後述のフォーマット参照)
- 日本語で、合計 900〜1100 字程度

出力フォーマット (この見出しを必ず使う):

## 良かった視点
- (1〜2 個、具体的にどこが良いか)

## 別の視点
- (1 個、見落としやすい切り口を提案)

## 概算解の組み立て方

### 前提値の推測ロジック
それぞれの前提値について、**公知の情報からどう推測したか**を明示する。

- **(値の名前)**: 約 ◯◯
  - 出発点: (誰でも知っている公知の数字 — 人口・GDP・自分の周りの観察など)
  - 推測手順: (どの倍率・割合で派生させたか、1〜2 文)
- **(値の名前)**: 約 ◯◯
  - 出発点: (同上)
  - 推測手順: (同上)
- (必要な前提値の数だけ、3〜5 個を目安に)

### 計算
1. (式の第 1 ステップ + 数字)
2. (第 2 ステップ + 数字)
3. (第 3 ステップ + 数字)
4. (第 4 ステップ、必要なら)

**概算結果**: 約 ◯◯◯ (単位)

**実際の値 (参考)**: 約 ◯◯◯ (出典が分かれば併記、不明なら省略可)

**ひとこと**: (前提を変えるとどうなるか、精度をどう上げられるか、1〜2 文)

## 点数を伸ばすには
- (回答のロジックの弱点を **2〜3 個**、具体的に列挙する)
- 各項目は「現状: 〇〇 → 改善: 〇〇」の形で書く
- 必ず「数字の根拠・仮説」に踏み込む (例: 「現状: 1人 3個と置いただけ → 改善: 平日は仕事中なので 1個、週末は 4個、平均すると週 11個 ≒ 1日 1.6個、のように生活リズムから根拠を付ける」)
- 抽象的なアドバイス (「もっと深く考えましょう」など) は禁止。具体的に書く

最初の行に必ず以下のJSONを出力してください（マークダウンコードブロック不要、そのまま1行で）。
**details の各値は 40〜80 字の日本語1文**で、その点数になった具体的な理由を書く。改行・ダブルクオート（"）は禁止：
SCORE_JSON:{"score":<0-100の整数>,"breakdown":"論理性 <x>/50 · 独自性 <y>/30 · 明確さ <z>/20","details":{"logic":"<論理性の点数理由・40〜80字>","originality":"<独自性の点数理由・40〜80字>","clarity":"<明確さの点数理由・40〜80字>"}}
その後に改行して、以下のフィードバック本文を続けてください。

---`

      const systemPromptEn = `You are a logical-thinking coach. Provide feedback on a user's Fermi estimation AND **show the worked answer where every assumption is derived from public knowledge, not just quoted as a number**.

Scoring (out of 100):
- Logical decomposition (50 pts): coverage, MECE-ness, and **whether each number has a stated rationale / hypothesis** (does the user explain WHY that value is reasonable?)
- Originality (30 pts): fresh angles
- Clarity (20 pts): conclusion + math are easy to follow
- Hint penalty: −${hintPenalty}
- Time penalty: −${timePenalty} (elapsed ${elapsedMin} min)

Logic weaknesses to actively flag:
- A number appears with no rationale (e.g. "3 per person per day" with no explanation)
- Strong example: "Office workers don't snack at desks → ~1/day; weekends double → avg ≈1.6/day"
- Always surface these weaknesses in the "How to score higher" section

**Critical rule — assumptions must be DERIVED, not quoted**:
Fermi estimation is a logic exercise for people who do NOT know the specific industry numbers.
So in the worked answer, NEVER just say "Japan has 58M households". You MUST show how
that number was inferred from common-knowledge starting points (population, GDP, observation
from daily life, etc).

Good example:
- Japan population ≈ 120M (common knowledge)
  → average household size has been shrinking → assume ~2 people/household
  → households ≈ 120M ÷ 2 ≈ 60M
- Smartphone adoption ≈ 80% (own observation, adjusted lower for elderly)
  → adult population 100M × 0.8 ≈ 80M phones

Bad example (never do this):
- "Households: 58M" — no derivation
- "Smartphone adoption: 80%" — pulled out of thin air

Rules:
- Always begin with encouragement
- Focus on decomposition structure AND the quality of the assumptions behind each number
- Don't bluntly grade numerical accuracy; suggest tighter assumptions instead
- **You MUST include a "How assumptions are derived" sub-section showing each assumption with its derivation path**
- **You MUST include a "How to score higher" section** (see format below)
- Respond in English, ~700-900 words total

Output format (use these exact headings):

## Strong points
- (1-2 specific things the user did well)

## Another angle
- (1 perspective that is easy to miss)

## Worked answer

### How assumptions are derived
For each assumption, show HOW it was inferred from public knowledge.

- **(value name)**: ~ N
  - Starting point: (common-knowledge anchor — population, GDP, personal observation, etc.)
  - Derivation: (which ratio / step gives the final value, 1-2 sentences)
- **(value name)**: ~ N
  - Starting point: (same)
  - Derivation: (same)
- (3-5 assumptions as needed)

### Calculation
1. (Step 1 with the math)
2. (Step 2 with the math)
3. (Step 3 with the math)
4. (Step 4 if needed)

**Estimate**: ~ N (unit)

**Real value (reference)**: ~ N (cite if known, otherwise omit)

**One note**: (how would the answer shift if one assumption changed; 1-2 sentences)

## How to score higher
- (2-3 concrete weaknesses, each in "Now: X → Better: Y" form)
- MUST drill into "number rationale / hypothesis" (e.g. "Now: assumed 3/day with no basis → Better: weekdays 1/day (busy), weekends 4/day (relaxed) → avg ≈1.6/day grounded in daily routine")
- No vague advice ("think more deeply") — be specific

The very first line of your response MUST be this JSON (no code block, single line).
**Each value in "details" must be a single English sentence, 40-80 characters**, explaining why the user got that score. No line breaks, no double quotes (") inside:
SCORE_JSON:{"score":<integer 0-100>,"breakdown":"Logic <x>/50 · Originality <y>/30 · Clarity <z>/20","details":{"logic":"<reason for logic score, 40-80 chars>","originality":"<reason for originality score, 40-80 chars>","clarity":"<reason for clarity score, 40-80 chars>"}}
Then a newline, then the feedback body below.

---`

      const userMessage = isEn
        ? `Question: ${question}\n\nUser's decomposition:\n${userInput}\n\nPlease give feedback on this decomposition.`
        : `問題: ${question}\n\nユーザーの分解:\n${userInput}\n\nこの分解にフィードバックをお願いします。`

      const response = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1400,
        system: isEn ? systemPromptEn : systemPromptJa,
        messages: [{ role: 'user', content: userMessage }],
      })
      const rawText = response.content[0].type === 'text' ? response.content[0].text : ''

      // SCORE_JSON パース
      let score: number | undefined
      let scoreBreakdown: string | undefined
      let scoreDetails: { logic?: string; originality?: string; clarity?: string } | undefined
      let feedbackText = rawText
      const scoreMatch = rawText.match(/SCORE_JSON:\s*({.*?})(?:\n|$)/s)
      if (scoreMatch) {
        try {
          const parsed = JSON.parse(scoreMatch[1])
          score = Math.min(100, Math.max(0, Math.round(parsed.score || 0)))
          scoreBreakdown = parsed.breakdown
          if (parsed.details && typeof parsed.details === 'object') {
            scoreDetails = {
              logic: typeof parsed.details.logic === 'string' ? parsed.details.logic : undefined,
              originality: typeof parsed.details.originality === 'string' ? parsed.details.originality : undefined,
              clarity: typeof parsed.details.clarity === 'string' ? parsed.details.clarity : undefined,
            }
          }
        } catch { /* ignore */ }
        feedbackText = rawText.replace(/SCORE_JSON:[^\n]*/g, '').trimEnd()
      }
      // ======= DB保存 (non-blocking) =======
      // score_breakdown カラムは text。details も含めて JSON 文字列で保存し、後方互換のため
      // 読み出し時に「JSON.parse できれば構造化、そうでなければ生テキスト」とする。
      const breakdownPayload = scoreDetails
        ? JSON.stringify({ breakdown: scoreBreakdown, details: scoreDetails })
        : scoreBreakdown
      const { guestId, userId } = req.body as { guestId?: string; userId?: string }
      if (supabase) {
        const today = new Date().toISOString().slice(0, 10)
        supabase.from('fermi_answers').insert({
          question_date: today,
          question_text: question,
          user_id: userId || null,
          guest_id: guestId || null,
          user_input: userInput,
          hint_used: hintUsed ?? false,
          elapsed_sec: elapsedSec ?? null,
          score: score ?? null,
          score_breakdown: breakdownPayload ?? null,
          ai_feedback: feedbackText,
          locale: locale || 'ja',
        }).then(({ error }) => {
          if (error) console.warn('fermi_answers insert error:', error.message)
        })
      }
      // ==========================================

      res.json({ feedback: feedbackText, score, scoreBreakdown, scoreDetails })
    } catch (e: unknown) {
      console.error('fermi feedback error:', e)
      res.status(500).json({ error: e instanceof Error ? e.message : String(e) })
    }
  })

  // =============================================
  // フェルミ推定 — 前提確認チャット
  // =============================================
  router.post('/chat', fermiLimiter, async (req: Request, res: Response) => {
    try {
      const { question, messages, locale } = req.body || {}
      if (!question || !Array.isArray(messages)) {
        return res.status(400).json({ error: 'question and messages required' })
      }
      const isEn = locale === 'en'

      const systemPrompt = isEn
        ? `You are a Fermi estimation coach. The user is working on the following problem:

"${question}"

Your role is to help the user clarify assumptions and think through their decomposition — but you must NOT give away the answer or the final number. You may:
- Confirm or correct factual assumptions (e.g. population figures, market sizes)
- Suggest what factors or categories to consider
- Ask clarifying questions to help them structure their thinking

Keep responses concise (2-4 sentences). Do not solve the problem for them.`
        : `あなたはフェルミ推定のコーチです。ユーザーは以下の問題に取り組んでいます:

「${question}」

あなたの役割は、ユーザーが前提を整理し、分解思考を進められるよう手助けすることです。ただし、答えや最終的な数字を教えてはいけません。以下のことはOKです:
- 事実に基づく前提の確認・修正（人口・市場規模など）
- 考慮すべき要素やカテゴリの提案
- 思考を構造化する質問

回答は簡潔に（2〜4文程度）。問題を解いてあげないこと。`

      // messages: [{role: 'user'|'assistant', content: string}]
      const response = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
        system: systemPrompt,
        messages: messages.slice(-10), // 直近10往復まで
      })
      const text = response.content[0].type === 'text' ? response.content[0].text.trim() : ''
      res.json({ reply: text })
    } catch (e: unknown) {
      console.error('fermi chat error:', e)
      res.status(500).json({ error: e instanceof Error ? e.message : String(e) })
    }
  })

  // =============================================
  // フェルミ推定 — AI 問題生成 (premium)
  // =============================================
  router.post('/question', fermiLimiter, async (req: Request, res: Response) => {
    try {
      const isEn = req.body?.locale === 'en'
      const today = new Date().toISOString().slice(0, 10)
      const userPrompt = isEn
        ? 'Generate exactly one Fermi estimation problem in English. Pick something from everyday Western/global business or society that is good for decomposition practice. Return only the question on a single line — no preface, no explanation.'
        : `フェルミ推定の問題を1問だけ日本語で出してください。以下のカテゴリからランダムに選んでください：ビジネス規模・インフラ・消費行動・テクノロジー・社会統計・環境・スポーツ。参加者が分解して考えられる、面白くて意外性のある問題を作ってください。難易度は中級〜上級。問題文のみ1行で返してください（前置き・説明不要）。本日の日付ヒント: ${today}`

      const response = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 200,
        messages: [{ role: 'user', content: userPrompt }],
      })
      const text = response.content[0].type === 'text' ? response.content[0].text.trim() : ''
      res.json({ question: text })
    } catch (e: unknown) {
      console.error('fermi question error:', e)
      res.status(500).json({ error: e instanceof Error ? e.message : String(e) })
    }
  })

  // =============================================
  // デイリーフェルミ — Supabase キャッシュ付き
  // =============================================
  router.get('/daily', async (req: Request, res: Response) => {
    try {
      const locale = (req.query.locale as string) || 'ja'
      const isEn = locale === 'en'
      const today = new Date().toISOString().slice(0, 10) // YYYY-MM-DD

      // 日付ベースでプールから問題を選択（毎日変わる）
      const dayIndex = Math.floor(Date.now() / 86400000) % FERMI_QUESTION_POOL_JA.length
      const poolQuestion = FERMI_QUESTION_POOL_JA[dayIndex]

      // Supabase から今日の問題を確認
      if (supabase) {
        const { data: existing } = await supabase
          .from('daily_fermi_problems')
          .select('*')
          .eq('date', today)
          .eq('locale', locale)
          .single()

        if (existing) {
          return res.json({ question: existing.question, hint: existing.hint, date: today, poolIndex: dayIndex })
        }
      }

      // プールから今日の問題を使う（英語の場合はAI生成）
      if (!isEn && poolQuestion) {
        if (supabase) {
          try { await supabase.from('daily_fermi_problems').insert({
            date: today, question: poolQuestion.question, hint: poolQuestion.hint, locale
          }) } catch { /* ignore */ }
        }
        return res.json({ question: poolQuestion.question, hint: poolQuestion.hint, date: today, poolIndex: dayIndex })
      }

      // 存在しない場合は AI で生成
      const userPrompt = isEn
        ? 'Generate exactly one Fermi estimation problem in English for today. Pick something from everyday Western/global business or society that is good for decomposition practice. Return only the question on a single line — no preface, no explanation.'
        : 'フェルミ推定の問題を 1 問だけ日本語で生成してください。日常的な日本の社会・経済に関する問いで、分解思考の練習に適したものを出してください。問題文のみを 1 行で返してください。前置きや説明は不要です。'

      // まず問題を生成し、それを使ってヒントを生成（問題文をコンテキストとして渡す）
      const questionRes = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 200,
        messages: [{ role: 'user', content: userPrompt }],
      })
      const question = questionRes.content[0].type === 'text' ? questionRes.content[0].text.trim() : ''

      const hintPrompt = isEn
        ? `The following is a Fermi estimation problem: "${question}"\n\nProvide a single short hint (1-2 sentences) explaining how to decompose this specific problem. Be concrete and specific to the question. No preface.`
        : `次のフェルミ推定問題に対する分解ヒントを1〜2文で端的に教えてください。問題に固有の具体的な内容を含め、前置き不要です。\n\n問題：「${question}」`

      const hintRes = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 200,
        messages: [{ role: 'user', content: hintPrompt }],
      })

      const hint = hintRes.content[0].type === 'text' ? hintRes.content[0].text.trim() : ''

      // Supabase に保存 (service role key 使用)
      if (supabase && question) {
        await supabase
          .from('daily_fermi_problems')
          .insert({ date: today, question, hint, locale })
      }

      res.json({ question, hint, date: today })
    } catch (e: unknown) {
      console.error('daily-fermi error:', e)
      res.status(500).json({ error: e instanceof Error ? e.message : String(e) })
    }
  })

  // =============================================
  // フェルミ — 別問題を取得（プールからランダム）
  // =============================================
  router.get('/next', async (req: Request, res: Response) => {
    try {
      const exclude = (req.query.exclude as string || '').split(',').map(Number).filter(Boolean)
      const available = FERMI_QUESTION_POOL_JA
        .map((q, i) => ({ ...q, index: i }))
        .filter(q => !exclude.includes(q.index))

      if (available.length === 0) {
        // 全問使い切ったらランダムに返す
        const idx = Math.floor(Math.random() * FERMI_QUESTION_POOL_JA.length)
        const q = FERMI_QUESTION_POOL_JA[idx]
        return res.json({ question: q.question, hint: q.hint, poolIndex: idx })
      }

      const pick = available[Math.floor(Math.random() * available.length)]
      res.json({ question: pick.question, hint: pick.hint, poolIndex: pick.index })
    } catch (e: unknown) {
      res.status(500).json({ error: e instanceof Error ? e.message : String(e) })
    }
  })

  // =============================================
  // フェルミ — スコア記録（ランキング用）
  // =============================================
  router.post('/record-score', async (req: Request, res: Response) => {
    try {
      const { userId, userName, score, questionIndex, elapsedSec, hintUsed } = req.body as {
        userId?: string
        userName?: string
        score: number
        questionIndex?: number
        elapsedSec?: number
        hintUsed?: boolean
      }
      if (typeof score !== 'number' || score < 0 || score > 100) return res.status(400).json({ error: 'score must be a number between 0 and 100' })

      if (supabase) {
        const { error } = await supabase.from('fermi_scores').insert({
          user_id: userId || 'guest',
          user_name: userName || 'ゲスト',
          score,
          question_index: questionIndex ?? -1,
          elapsed_sec: elapsedSec ?? 0,
          hint_used: hintUsed ?? false,
          created_at: new Date().toISOString(),
        })
        if (error) console.warn('fermi_scores insert error:', error.message)
      }

      res.json({ ok: true })
    } catch (e: unknown) {
      res.status(500).json({ error: e instanceof Error ? e.message : String(e) })
    }
  })

  // =============================================
  // フェルミ — ランキング取得（実データ優先 + ダミーで穴埋め）
  // =============================================
  router.get('/ranking', async (req: Request, res: Response) => {
    const DISPLAY_LIMIT = 10
    // ダミーデータ（実データが足りないときの穴埋め用、スコア順）
    // occupation バッジ運用の動作確認も兼ねて、いくつかの mock に職業を割り当てておく。
    const MOCK_RANKING: Array<{ name: string; score: number; isMock: boolean; occupation: string | null }> = [
      { name: 'Taro M.', score: 98, isMock: true, occupation: 'consultant' },
      { name: 'Yuki S.', score: 87, isMock: true, occupation: 'strategy' },
      { name: 'Hana K.', score: 76, isMock: true, occupation: 'engineering' },
      { name: 'Ryo T.', score: 65, isMock: true, occupation: 'sales_marketing' },
      { name: 'Ami F.', score: 54, isMock: true, occupation: 'professional' },
      { name: 'Ken N.', score: 43, isMock: true, occupation: 'admin' },
      { name: 'Saki I.', score: 38, isMock: true, occupation: 'executive' },
      { name: 'Jiro W.', score: 27, isMock: true, occupation: 'student' },
      { name: 'Mika O.', score: 15, isMock: true, occupation: null },
    ]

    try {
      const period = (req.query.period as string) || 'week'
      let since = new Date()
      if (period === 'week') since.setDate(since.getDate() - 7)
      else if (period === 'month') since.setDate(since.getDate() - 30)
      else since = new Date('2020-01-01')

      let realRanking: Array<{ name: string; score: number; isMock: boolean; occupation: string | null }> = []

      if (supabase) {
        const { data, error } = await supabase
          .from('fermi_scores')
          .select('user_id, user_name, score, created_at')
          .gte('created_at', since.toISOString())
          .order('created_at', { ascending: false })
          .limit(500)

        if (!error && data && data.length > 0) {
          // ユーザーごとにスコアを累積（合計）
          // user_id が UUID 形式の場合は profiles から occupation を引けるよう保持しておく
          const byUser: Record<string, { name: string; score: number; userIds: Set<string> }> = {}
          for (const row of data) {
            const name = row.user_name || 'ゲスト'
            if (!byUser[name]) byUser[name] = { name, score: 0, userIds: new Set<string>() }
            byUser[name].score += row.score
            const uid = (row as { user_id?: string | null }).user_id
            if (uid && uid !== 'guest' && /^[0-9a-f-]{20,}$/i.test(uid)) {
              byUser[name].userIds.add(uid)
            }
          }

          // profiles から occupation を一括取得（migration 030 未適用時は空 Map）
          const allIds = new Set<string>()
          for (const u of Object.values(byUser)) for (const id of u.userIds) allIds.add(id)
          const occupationMap = new Map<string, string>()
          if (allIds.size > 0) {
            const profRes = await supabase
              .from('profiles')
              .select('id, occupation')
              .in('id', Array.from(allIds))
            if (profRes.error) {
              // migration 030 未適用環境では列が無いので警告のみで先へ進む
              if (!/occupation/i.test(profRes.error.message)) {
                console.warn('[fermi/ranking] profiles join failed:', profRes.error.message)
              }
            } else {
              for (const row of (profRes.data || []) as { id: string; occupation: string | null }[]) {
                if (row.occupation) occupationMap.set(row.id, row.occupation)
              }
            }
          }

          realRanking = Object.values(byUser)
            .sort((a, b) => b.score - a.score)
            .map((r) => {
              // 同じ name に複数 user_id が紐付くケースは稀。最初に occupation が取れたものを採用
              let occ: string | null = null
              for (const id of r.userIds) {
                const v = occupationMap.get(id)
                if (v) { occ = v; break }
              }
              return { name: r.name, score: r.score, isMock: false, occupation: occ }
            })
        }
      }

      // 実データ + ダミーをマージしてスコア降順、表示上限まで
      // 安定ソート: スコアが同じなら実データを優先
      const merged = [...realRanking, ...MOCK_RANKING]
        .sort((a, b) => {
          if (b.score !== a.score) return b.score - a.score
          if (a.isMock === b.isMock) return 0
          return a.isMock ? 1 : -1
        })
        .slice(0, DISPLAY_LIMIT)

      const source = realRanking.length === 0 ? 'mock' : (realRanking.length >= DISPLAY_LIMIT ? 'real' : 'hybrid')
      res.json({ ranking: merged, source, realCount: realRanking.length })
    } catch (e: unknown) {
      res.status(500).json({ error: e instanceof Error ? e.message : String(e) })
    }
  })

  // =============================================
  // フェルミ — ゲストスコアの auth UUID 継承（恒久対策）
  // =============================================
  // 背景: ゲスト状態で記録したスコアは fermi_scores.user_id が guest 形式 (g_xxxx) の
  // まま残るため、ログイン後の auth UUID (= profiles.id) と join できず、職業バッジが
  // 表示されなかった。この endpoint は認証済みユーザーのリクエストに限り、その端末の
  // guestId で記録された過去スコアを auth UUID へ付け替える。
  //
  // 重複対策の考え方:
  // - fermi_scores は (id BIGSERIAL) のみが PK で、(user_id, question_index) 等の
  //   UNIQUE 制約は無い。同一ユーザーが同じ問題を複数回解いた行も併存しうる。
  // - /ranking は user_name 単位で score を合計表示する設計なので、guest 行を
  //   auth UUID へ単純 UPDATE しても合計値は変わらず、profiles.occupation の join が
  //   効くようになるだけ。行を増やさないので二重カウントは発生しない。
  // - したがって「重複行のマージ／破棄」は不要。素直に user_id を付け替える。
  //
  // セキュリティ:
  // - guestId は端末ローカルの乱数 ID で「知っていること」が所有証明になる脅威モデル。
  // - ただし必ず Authorization Bearer の access token を検証し、認証済みユーザーの
  //   リクエストに限定する（なりすまし・無差別な付け替え防止）。
  router.post('/claim-guest-scores', async (req: Request, res: Response) => {
    if (!supabase) {
      return res.status(503).json({ error: 'Supabase not configured' })
    }

    // ── auth header 検証（sync-telemetry と同じパターン）──
    const auth = req.headers.authorization
    if (typeof auth !== 'string' || !auth.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'missing bearer token' })
    }
    const token = auth.slice(7).trim()
    if (!token) {
      return res.status(401).json({ error: 'invalid bearer token' })
    }

    let authedUserId: string
    try {
      const { data, error } = await supabase.auth.getUser(token)
      if (error || !data?.user) {
        return res.status(401).json({ error: 'invalid bearer token' })
      }
      authedUserId = data.user.id
    } catch {
      return res.status(401).json({ error: 'invalid bearer token' })
    }

    // ── body 検証 ──
    const { guestId } = (req.body ?? {}) as { guestId?: unknown }
    if (typeof guestId !== 'string' || !guestId) {
      return res.status(400).json({ error: 'guestId required' })
    }
    // guestId は guestId.ts の getGuestId() が生成する 'g_xxxx' 形式のみ受け付ける。
    // auth UUID を guestId として渡されても付け替え対象にしない（自爆防止）。
    if (!/^g_[a-z0-9]+$/i.test(guestId)) {
      return res.status(400).json({ error: 'invalid guestId format' })
    }
    if (guestId === authedUserId) {
      // 念のため: guestId が自分の UUID と一致するケースは付け替え不要
      return res.json({ ok: true, claimed: 0 })
    }

    try {
      // guestId で記録された行を auth UUID へ付け替える。
      // user_name は記録時のものを尊重して上書きしない（過去の表示名を保持）。
      const { data, error } = await supabase
        .from('fermi_scores')
        .update({ user_id: authedUserId })
        .eq('user_id', guestId)
        .select('id')
      if (error) {
        console.warn('[fermi/claim-guest-scores] update error:', error.message)
        return res.status(500).json({ error: error.message })
      }
      const claimed = (data || []).length
      return res.json({ ok: true, claimed })
    } catch (e: unknown) {
      console.error('[fermi/claim-guest-scores] handler error:', e)
      return res.status(500).json({ error: e instanceof Error ? e.message : String(e) })
    }
  })

  // =============================================
  // フェルミ推定 — 過去回答履歴取得
  // =============================================
  router.get('/history', async (req: Request, res: Response) => {
    try {
      const guestId = (req.query.guestId as string) || ''
      const userId = (req.query.userId as string) || ''
      const limit = Math.min(parseInt((req.query.limit as string) || '50', 10) || 50, 200)
      if (!guestId && !userId) {
        return res.json({ history: [] })
      }
      if (!supabase) return res.json({ history: [] })

      let query = supabase
        .from('fermi_answers')
        .select('id, question_date, question_text, user_input, score, score_breakdown, ai_feedback, hint_used, elapsed_sec, locale, created_at')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (userId) query = query.eq('user_id', userId)
      else if (guestId) query = query.eq('guest_id', guestId)

      const { data, error } = await query
      if (error) {
        console.warn('fermi history fetch error:', error.message)
        return res.json({ history: [] })
      }
      res.json({ history: data || [] })
    } catch (e: unknown) {
      console.error('fermi history error:', e)
      res.status(500).json({ error: e instanceof Error ? e.message : String(e) })
    }
  })

  return router
}
