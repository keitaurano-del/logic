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

      const systemPromptJa = `あなたはロジカルシンキングのコーチです。フェルミ推定を学ぶユーザーの分解プロセスにフィードバックを返し、スコアを算出し、最後に**実際の概算解と計算ロジックを提示**します。

採点基準 (合計100点):
- 論理的分解の構造 (50点): 要素の網羅性・MECEさ・数値の妥当性
- 思考の独自性 (30点): 新鮮な切り口・意外な視点
- 回答の明確さ (20点): 結論が明確か・計算が追いやすいか
- ヒント使用ペナルティ: ${hintPenalty}点減点
- 解答時間ペナルティ: ${timePenalty}点減点 (解答時間 ${elapsedMin}分)
- 最終スコア = 論理+独自性+明確さ - ペナルティ合計 (0〜100に収める)

ルール:
- 励まし (「いいですね」「素晴らしい」) で必ず始める
- 評価の主軸は「分解の構造」と「視点の網羅性」
- 数値の正誤を断罪しない (「ここを ◯◯ にするとより精度が上がる」のように建設的に)
- **必ず最後に「概算解」セクションで実際の数字と計算式を提示する**
  - 各ステップで使う前提値 (人口、世帯数、頻度など) を明示
  - 掛け算/割り算を順番に展開
  - 最終的な数字 (◯◯ 万、◯◯ 億 など) を太字で結論
  - 既知の実際値 (政府統計・業界データなど) があれば併記し、概算と比較
- 日本語で、合計 600〜800 字程度

出力フォーマット (この見出しを必ず使う):

## 良かった視点
- (1〜2 個、具体的にどこが良いか)

## 別の視点
- (1 個、見落としやすい切り口を提案)

## 概算解と計算ロジック
**前提値**: (使う数字をリスト)

**計算**:
1. (式の第 1 ステップ + 数字)
2. (第 2 ステップ + 数字)
3. (第 3 ステップ + 数字)
4. (第 4 ステップ、必要なら)

**概算結果**: 約 ◯◯◯ (単位)

**実際の値 (参考)**: 約 ◯◯◯ (出典が分かれば併記、不明なら省略可)

**ひとこと**: (前提を変えるとどうなるか、精度をどう上げられるか、1〜2 文)

最初の行に必ず以下のJSONを出力してください（マークダウンコードブロック不要、そのまま1行で）:
SCORE_JSON:{"score":<0-100の整数>,"breakdown":"論理性 <x>/50 · 独自性 <y>/30 · 明確さ <z>/20"}
その後に改行して、以下のフィードバック本文を続けてください。

---`

      const systemPromptEn = `You are a logical-thinking coach. Provide feedback on a user's Fermi estimation, AND finish by **showing the actual estimated answer with the full calculation logic**.

Rules:
- Always begin with encouragement ("Nice work", "Great start")
- Evaluate decomposition structure and breadth of perspectives
- Do not bluntly grade numerical accuracy — instead say "this assumption could be tightened to..."
- **You MUST end with a "Worked answer" section that includes the actual number and the math**
  - List the input assumptions (population, households, frequency, etc.)
  - Show each multiplication/division step in order
  - State the final number in bold (e.g. ~50,000)
  - If a known real value exists (govt or industry data), compare it to your estimate
- Respond in English, ~400-500 words total

Output format (use these exact headings):

## Strong points
- (1-2 specific things the user did well)

## Another angle
- (1 perspective that is easy to miss)

## Worked answer
**Assumptions**: (list the input numbers)

**Calculation**:
1. (Step 1 with the math)
2. (Step 2 with the math)
3. (Step 3 with the math)
4. (Step 4 if needed)

**Estimate**: ~ N (unit)

**Real value (reference)**: ~ N (cite if known, otherwise omit)

**One note**: (how would the answer shift if one assumption changed; 1-2 sentences)`

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
      let feedbackText = rawText
      const scoreMatch = rawText.match(/SCORE_JSON:\s*({.*?})(?:\n|$)/s)
      if (scoreMatch) {
        try {
          const parsed = JSON.parse(scoreMatch[1])
          score = Math.min(100, Math.max(0, Math.round(parsed.score || 0)))
          scoreBreakdown = parsed.breakdown
        } catch { /* ignore */ }
        feedbackText = rawText.replace(/SCORE_JSON:[^\n]*/g, '').trimEnd()
      }
      // ======= DB保存 (non-blocking) =======
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
          score_breakdown: scoreBreakdown ?? null,
          ai_feedback: feedbackText,
          locale: locale || 'ja',
        }).then(({ error }) => {
          if (error) console.warn('fermi_answers insert error:', error.message)
        })
      }
      // ==========================================

      res.json({ feedback: feedbackText, score, scoreBreakdown })
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
  // フェルミ — ランキング取得（実データ + フォールバック）
  // =============================================
  router.get('/ranking', async (req: Request, res: Response) => {
    try {
      const period = (req.query.period as string) || 'week'
      let since = new Date()
      if (period === 'week') since.setDate(since.getDate() - 7)
      else if (period === 'month') since.setDate(since.getDate() - 30)
      else since = new Date('2020-01-01')

      if (supabase) {
        const { data, error } = await supabase
          .from('fermi_scores')
          .select('user_name, score, created_at')
          .gte('created_at', since.toISOString())
          .order('score', { ascending: false })
          .limit(50)

        if (!error && data && data.length >= 3) {
          // ユーザーごとに最高スコアを集計
          const byUser: Record<string, { name: string; score: number }> = {}
          for (const row of data) {
            const name = row.user_name || 'ゲスト'
            if (!byUser[name] || byUser[name].score < row.score) {
              byUser[name] = { name, score: row.score }
            }
          }
          const ranking = Object.values(byUser).sort((a, b) => b.score - a.score).slice(0, 20)
          return res.json({ ranking, source: 'real' })
        }
      }

      // フォールバック: ダミーデータ（100pt以下）
      res.json({
        ranking: [
          { name: 'Taro M.', score: 98 },
          { name: 'Yuki S.', score: 87 },
          { name: 'Hana K.', score: 76 },
          { name: 'Ryo T.', score: 65 },
          { name: 'Ami F.', score: 54 },
          { name: 'Ken N.', score: 43 },
          { name: 'Saki I.', score: 38 },
          { name: 'Jiro W.', score: 27 },
          { name: 'Mika O.', score: 15 },
        ],
        source: 'mock'
      })
    } catch (e: unknown) {
      res.status(500).json({ error: e instanceof Error ? e.message : String(e) })
    }
  })

  return router
}
