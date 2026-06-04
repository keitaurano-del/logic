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

/** サーバーが UTC で動いていても JST (UTC+9) の今日の日付文字列を返す。 */
function todayJST(): string {
  return new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10)
}

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

      // ペナルティは「萎えさせない」方針で控えめに設定する。
      // ヒント使用 10→5、時間ペナルティ 5min:10/3min:5 → 5min:5/3min:3 に緩和（2026-05-26）。
      const hintPenalty = hintUsed ? 5 : 0
      const timePenalty = elapsedMin >= 5 ? 5 : elapsedMin >= 3 ? 3 : 0

      const systemPromptJa = `あなたはロジカルシンキングのコーチです。フェルミ推定を学ぶユーザーの分解プロセスにフィードバックを返し、スコアを算出し、基本的な前提データだけから答えに至る模範解答を示し、**解説をすべて読み終えた最後に必ず1つの代表的な答えを断言**します。

採点基準 (合計100点):
- 論理的分解の構造 (50点): 要素の網羅性・MECEさ、そして**使った数字に妥当な仮説が立てられているか**（「なぜその値か」をある程度説明できていれば加点する）
- 思考の独自性 (30点): 新鮮な切り口・意外な視点
- 回答の明確さ (20点): 結論が明確か・計算が追いやすいか
- ヒント使用・解答時間ペナルティ: ユーザーメッセージ末尾の[採点調整]を参照
- 最終スコア = 論理+独自性+明確さ - ペナルティ合計 (0〜100に収める)

**採点の姿勢（重要）— 励まし、伸ばす採点をする**:
- 完璧主義で減点しすぎない。**部分的にでも筋が通っていれば、その部分はしっかり加点する**。
- 特に論理点(50点)は「使った数字に根拠と仮説があるか」を厳しく見すぎない。**妥当な仮説立てができていれば論理点を出す**（完璧な根拠付けでなくてよい）。雑な仮定が一部混じっていても、全体の分解の筋が通っていれば十分加点する。
- 数字がズレていること自体は減点理由にしない。あくまで「分解の構造」と「仮説の立て方」を見る。
- 初学者が極端に低い点で萎えないようにする。**ただし全員満点にはしない** — 良い回答と荒い回答にはきちんと差をつける。減点ではなく「ここを足せばもっと伸びる」という前向きな視点で評価する。

採点で見るロジックの弱点（「## 点数を伸ばすには」で前向きに指摘する）:
- 数字を出すときに「どこから来たのか」「なぜその値が妥当か」の仮説がまったく無い
- 例: 「1人 1日 3個食べる」とだけ書いて仮説が無い → もう一歩
- 例: 「平均的なオフィスワーカーは仕事中に集中して食べないので 1日 1〜2個と仮定。週末は倍と見て…」→ 良い
- ただし上記はあくまで「伸びしろ」として扱い、断罪しない。

**最重要ルール① — 答えを必ず断言すること（ぼかし禁止・ただし位置は末尾）**:
フェルミ推定は「最後に1つの代表値で答え切る」競技。
- **答えは本文の一番最後の「## 答え」セクションに出す**。冒頭や途中には答えの数値を先出ししない（解説を読み進めた末尾で答え合わせができる構成にする）。
- 「ケースバイケース」「一概には言えない」「条件による」などでぼかして答えを出さずに終わるのは**禁止**。最後の「## 答え」で必ず1つの代表値を断言する。
- 不確実でも、最も妥当な代表値を**1つ選んで断言する**。幅で答えたいときも代表値を1つ決めて言い切る。
- 模範解答内の「概算結果」の数値と、末尾「## 答え」の数値は**必ず一致させる**こと。

**最重要ルール② — 模範解答は「基本前提だけ知っている人」が辿れる道筋にすること**:
模範解答は、学習者が**誰でも知っている／調べればすぐ分かる基礎数値**（日本の人口 1.2 億人、GDP、世帯数の概算、身の回りの観察など）**だけ**を知っている前提で書く。
個別の業界データ（「美容室は◯万店」のような専門的な実数）を最初から知っている前提にはしない。
**各前提値には必ず「なぜその値か＝どの公知データから来たか」を明示する**。

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
- 励まし (「いいですね」「素晴らしい」) で必ず始める（答えは末尾の「## 答え」に置くので、冒頭では出さない）
- 評価の主軸は「分解の構造」と「仮説の立て方」。前向き・建設的に。
- 数値の正誤を断罪しない (「ここを ◯◯ にするとより精度が上がる」のように建設的に)
- **必ず「模範解答」セクションで、各前提値ごとに「どの公知データから推測したか」を明示する**
- **必ず「点数を伸ばすには」セクションを出す**(後述のフォーマット参照)
- 日本語で、合計 900〜1100 字程度

出力フォーマット (この見出しと並びを必ず使う。答えは一番最後に置く):

## 良かった視点
- (1〜2 個、具体的にどこが良いか)

## 別の視点
- (1 個、見落としやすい切り口を提案)

## 模範解答
基本的な前提データ（人口・世帯数・身の回りの観察など、誰でも知っている／調べればすぐ分かる数値）だけを知っている人が、理想的な分解でこの答えに辿り着く手本を示す。

### 前提値の推測ロジック
それぞれの前提値について、**どの公知データからどう推測したか**を明示する。

- (値の名前): 約 ◯◯
  - 出発点: (誰でも知っている公知の数字 — 人口・GDP・自分の周りの観察など)
  - 推測手順: (どの倍率・割合で派生させたか、1〜2 文)
- (値の名前): 約 ◯◯
  - 出発点: (同上)
  - 推測手順: (同上)
- (必要な前提値の数だけ、3〜5 個を目安に)

### 計算
1. (式の第 1 ステップ + 数字)
2. (第 2 ステップ + 数字)
3. (第 3 ステップ + 数字)
4. (第 4 ステップ、必要なら)

概算結果: 約 ◯◯◯ (単位) ← 冒頭の「答え:」と必ず同じ数値にする

実際の値 (参考): 約 ◯◯◯ (出典が分かれば併記、不明なら省略可)

ひとこと: (前提を変えるとどうなるか、精度をどう上げられるか、1〜2 文)

## 点数を伸ばすには
- (回答の伸びしろを **2〜3 個**、前向きに具体的に列挙する)
- 各項目は「現状: 〇〇 → こうするともっと良い: 〇〇」の形で書く
- 「仮説の立て方」に踏み込む (例: 「現状: 1人 3個と置いた → こうするともっと良い: 平日は仕事中なので 1個、週末は 4個、平均すると週 11個 ≒ 1日 1.6個、のように生活リズムから根拠を付ける」)
- 抽象的なアドバイス (「もっと深く考えましょう」など) は禁止。具体的に書く

## 答え
約 ◯◯◯ (単位)  ← 模範解答内の「概算結果」と必ず同じ数値にする。1つの代表値で言い切る（ぼかし禁止）

最初の行に必ず以下のJSONを出力してください（マークダウンコードブロック不要、そのまま1行で）。
**details の各値は 40〜80 字の日本語1文**で、その点数になった具体的な理由を書く。改行・ダブルクオート（"）は禁止：
SCORE_JSON:{"score":<0-100の整数>,"breakdown":"論理性 <x>/50 · 独自性 <y>/30 · 明確さ <z>/20","details":{"logic":"<論理性の点数理由・40〜80字>","originality":"<独自性の点数理由・40〜80字>","clarity":"<明確さの点数理由・40〜80字>"}}
SCORE_JSON の次の行から「## 良かった視点」以降のフィードバック本文を書き、**答えの数値は一番最後の「## 答え」セクションでのみ**断言してください（冒頭や途中で答えを先出ししない）。

---`

      const systemPromptEn = `You are a logical-thinking coach. Provide feedback on a user's Fermi estimation, **show a model answer that reaches the result using only basic common-knowledge data**, AND **commit to one representative answer only at the very end, after all the explanation**.

Scoring (out of 100):
- Logical decomposition (50 pts): coverage, MECE-ness, and **whether each number rests on a reasonable hypothesis** (a plausible "why this value" is enough — it does not need to be perfect)
- Originality (30 pts): fresh angles
- Clarity (20 pts): conclusion + math are easy to follow
- Hint / time penalty: see [Scoring adjustment] at the end of the user message

**Grading stance (important) — encourage and grow the learner**:
- Don't be a perfectionist. **Reward partial reasoning: if a part of the logic holds up, give it real credit.**
- For the logic score (50 pts) especially, do NOT be too strict about "is every number rigorously justified". **If the learner forms reasonable hypotheses, award logic points** even if the justification is imperfect or a few rough assumptions are mixed in. A sound overall decomposition deserves solid credit.
- Numerical inaccuracy by itself is not a reason to deduct. Judge the decomposition structure and how hypotheses are formed.
- Don't let beginners get demoralized by extremely low scores. **But do not give everyone full marks** — clearly differentiate strong answers from rough ones. Frame gaps as "add this and you'll go further", not as deductions.

Logic weaknesses to flag constructively (in "How to score higher"):
- A number appears with NO hypothesis at all (e.g. "3 per person per day" with no reasoning)
- Needs work: "3/day" with no basis
- Good: "Office workers don't snack at desks → ~1/day; weekends double → avg ≈1.6/day"
- Treat these as "room to grow", never as something to condemn.

**Critical rule #1 — commit to a definite answer (no hedging), but place it LAST**:
Fermi estimation is about landing on ONE representative number.
- **Put the answer in the final "## Answer" section at the very end of the body.** Do NOT reveal the answer number up front or mid-way (the reader should reach the answer only after working through the explanation).
- It is **forbidden** to hedge with "it depends", "it varies", "case by case" and end without giving a number. The final "## Answer" must commit to one representative value.
- Even under uncertainty, **pick the single most reasonable representative value and state it decisively.** If you want to give a range, still commit to one representative value.
- The "Estimate" number inside the model answer MUST match the final "## Answer" number exactly.

**Critical rule #2 — the model answer must be reachable by someone who only knows basic facts**:
Write the model answer assuming the learner knows **only common-knowledge / easily-lookup-able basics** (world population ≈ 8B, US population ≈ 330M, rough household counts, everyday observation).
Do NOT assume the learner already knows specialized industry figures (e.g. "there are X thousand salons").
**For each assumption, state WHY that value — i.e. which piece of common knowledge it derives from.**

Good example:
- US population ≈ 330M (common knowledge)
  → average household has ~2.5 people
  → households ≈ 330M ÷ 2.5 ≈ 130M
- Smartphone adoption ≈ 80% (own observation, adjusted lower for elderly)
  → adult population ~250M × 0.8 ≈ 200M phones

Bad example (never do this):
- "Households: 58M" — no derivation
- "Smartphone adoption: 80%" — pulled out of thin air

Rules:
- Always begin with encouragement (the answer goes in the final "## Answer" section, so do NOT state it up front)
- Focus on decomposition structure AND how hypotheses are formed — be positive and constructive
- Don't bluntly grade numerical accuracy; suggest tighter assumptions instead
- **You MUST include a "How assumptions are derived" sub-section showing each assumption with its derivation path from public knowledge**
- **You MUST include a "How to score higher" section** (see format below)
- Respond in English, ~700-900 words total

Output format (use these exact headings and order; the answer comes last):

## Strong points
- (1-2 specific things the user did well)

## Another angle
- (1 perspective that is easy to miss)

## Model answer
Show how someone who knows only basic common-knowledge data (population, household counts, everyday observation) reaches this answer with an ideal decomposition.

### How assumptions are derived
For each assumption, show HOW it was inferred from public knowledge.

- (value name): ~ N
  - Starting point: (common-knowledge anchor — population, GDP, personal observation, etc.)
  - Derivation: (which ratio / step gives the final value, 1-2 sentences)
- (value name): ~ N
  - Starting point: (same)
  - Derivation: (same)
- (3-5 assumptions as needed)

### Calculation
1. (Step 1 with the math)
2. (Step 2 with the math)
3. (Step 3 with the math)
4. (Step 4 if needed)

Estimate: ~ N (unit) ← must equal the final "## Answer" number

Real value (reference): ~ N (cite if known, otherwise omit)

One note: (how would the answer shift if one assumption changed; 1-2 sentences)

## How to score higher
- (2-3 concrete areas to grow, each in "Now: X → Even better: Y" form)
- Drill into "how the hypothesis is formed" (e.g. "Now: assumed 3/day with no basis → Even better: weekdays 1/day (busy), weekends 4/day (relaxed) → avg ≈1.6/day grounded in daily routine")
- No vague advice ("think more deeply") — be specific

## Answer
~ N (unit)  ← must match the "Estimate" inside the model answer. Commit to one representative value (no hedging).

The very first line of your response MUST be this JSON (no code block, single line).
**Each value in "details" must be a single English sentence, 40-80 characters**, explaining why the user got that score. No line breaks, no double quotes (") inside:
SCORE_JSON:{"score":<integer 0-100>,"breakdown":"Logic <x>/50 · Originality <y>/30 · Clarity <z>/20","details":{"logic":"<reason for logic score, 40-80 chars>","originality":"<reason for originality score, 40-80 chars>","clarity":"<reason for clarity score, 40-80 chars>"}}
On the line after SCORE_JSON, start with the "## Strong points" section and continue the feedback body. **State the answer number ONLY in the final "## Answer" section** (never up front or mid-body).

---`

      const userMessage = isEn
        ? `Question: ${question}\n\nUser's decomposition:\n${userInput}\n\nPlease give feedback on this decomposition.\n\n[Scoring adjustment: hint penalty −${hintPenalty}pts, time penalty −${timePenalty}pts (${elapsedMin} min elapsed)]`
        : `問題: ${question}\n\nユーザーの分解:\n${userInput}\n\nこの分解にフィードバックをお願いします。\n\n[採点調整: ヒントペナルティ −${hintPenalty}点, 時間ペナルティ −${timePenalty}点 (${elapsedMin}分経過)]`

      const response = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 2400,
        system: [{ type: 'text' as const, text: isEn ? systemPromptEn : systemPromptJa, cache_control: { type: 'ephemeral' as const } }],
        messages: [{ role: 'user', content: userMessage }],
      })
      // 切れ検知: max_tokens で打ち切られたらログに残す（将来の調整用）
      if (response.stop_reason === 'max_tokens') {
        console.warn('[fermi/feedback] response truncated at max_tokens — consider raising limit or tightening prompt')
      }
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
        const today = todayJST()
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
        system: [{ type: 'text' as const, text: systemPrompt, cache_control: { type: 'ephemeral' as const } }],
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
      const today = todayJST()
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
      const today = todayJST() // YYYY-MM-DD

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
    // ダミーデータ（実データが足りないときの穴埋め＋ランキングに動きを出す用）。
    // AM-P (2026-05-29): 以前は固定スコア（最大98）だったため、累計の多いユーザー
    // （管理者）が常にダントツ1位で「張り合いがない」状態だった。そこでダミー上位の
    // スコアを「その期間のトップ実スコア（無ければ period 別の下限）× 日次シードの倍率」
    // で算出する。これにより (a) 実トップと毎日張り合う水準へ自動追従し、(b) JST 日付
    // シードで毎日 deterministically に変動する（同一日内は安定＝リロードで動かない）。
    // 実データ（isMock:false）の値は一切変更しない。
    const MOCK_PROFILES: Array<{ name: string; occupation: string | null }> = [
      { name: 'Taro M.', occupation: 'consultant' },
      { name: 'Yuki S.', occupation: 'strategy' },
      { name: 'Hana K.', occupation: 'engineering' },
      { name: 'Ryo T.', occupation: 'sales_marketing' },
      { name: 'Ami F.', occupation: 'professional' },
      { name: 'Ken N.', occupation: 'admin' },
      { name: 'Saki I.', occupation: 'executive' },
      { name: 'Jiro W.', occupation: 'student' },
      { name: 'Mika O.', occupation: null },
    ]
    // 各順位の倍率 [base, span]: score = anchor * (base + span * rand)。上位ほど 1.0 付近で
    // トップ実スコアと拮抗し（base+span 最大 1.12 で時々上回る）、下位ほど低くなる。
    const MOCK_FACTORS: Array<[number, number]> = [
      [0.92, 0.20], [0.80, 0.16], [0.68, 0.15], [0.57, 0.14], [0.47, 0.13],
      [0.38, 0.12], [0.30, 0.11], [0.22, 0.10], [0.14, 0.09],
    ]
    // period 別の anchor 下限（実データが乏しくてもボードが寂しくならないように）
    const ANCHOR_FLOOR: Record<string, number> = { week: 140, month: 300, all: 340 }
    // 決定論的 PRNG（mulberry32）— 同じ seed なら必ず同じ値。
    const mulberry32 = (seed: number) => {
      let a = seed >>> 0
      return () => {
        a |= 0; a = (a + 0x6d2b79f5) | 0
        let t = Math.imul(a ^ (a >>> 15), 1 | a)
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
      }
    }
    // JST の通算日数（同一日内は同値 → スコアは日替わりで変動）
    const jstDayIndex = Math.floor((Date.now() + 9 * 3600 * 1000) / 86400000)
    const buildMockRanking = (periodKey: string, topReal: number) => {
      const pk = periodKey === 'week' ? 'week' : periodKey === 'month' ? 'month' : 'all'
      const periodOffset = pk === 'week' ? 0 : pk === 'month' ? 1 : 2
      const anchor = Math.max(topReal, ANCHOR_FLOOR[pk])
      return MOCK_PROFILES.map((p, i) => {
        const rnd = mulberry32(jstDayIndex * 1000 + periodOffset * 100 + i)
        const [base, span] = MOCK_FACTORS[i]
        const score = Math.max(1, Math.round(anchor * (base + span * rnd())))
        return { name: p.name, score, isMock: true, occupation: p.occupation }
      })
    }

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

      // ダミーは「期間トップ実スコア × 日次シード倍率」で動的生成（AM-P）
      const topReal = realRanking.length > 0 ? realRanking[0].score : 0
      const MOCK_RANKING = buildMockRanking(period, topReal)

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
