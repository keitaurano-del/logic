import { Router, type RequestHandler } from 'express'
import type Anthropic from '@anthropic-ai/sdk'
import type { SupabaseClient } from '@supabase/supabase-js'

// ─────────────────────────────────────────────
// ロールプレイ固定パターン（AIコスト削減のためパターン化）
// ─────────────────────────────────────────────
const ROLEPLAY_PATTERNS: Record<string, {
  partner: string[]
  choices: string[][]
}> = {
  'why-so-report': {
    partner: [
      'お疲れ様。ちょうど良かった。今進めてる新商品プロジェクト、どうなってる？スケジュール通り進んでるのか、何か問題あるのか、ざっくりで良いから結論をくれ。',
      '82%か。じゃあ残りの18%は何が原因だ？そこが問題の本質だろ。',
      'ニーズの変化はいつ分かったんだ？それを早く教えてくれれば対策もあったんじゃないか。',
      'なるほど。今後どうする？具体的なアクションを聞かせてくれ。',
      '分かった。来週の月曜までに2機能に絞った計画書を持ってきてくれ。以上だ。',
    ],
    choices: [
      [
        '目標の売上見込み1200万円に対し、現在の受注予測が980万円で進捗率は82%です。納期は予定通りですが、顧客ニーズの変化で3機能のうち2機能に絞る必要が出ています。',
        'おおむね順調に進んでいます。チーム一丸となって頑張っていますし、顧客の反応も悪くないと思います。',
        'まだ道半ばという感じで、もう少し時間をいただけると判断できると思います。',
      ],
      [
        '顧客ヒアリングで機能Cは既存ツールで代替できると判明したためです。その分、機能AとBの品質向上に集中できます。',
        '市場環境が変わってきているので、柔軟に対応していく必要があります。',
        'チームの技術的な問題もあり、全部は難しい状況です。',
      ],
      [
        '先週の顧客ヒアリングで判明しました。対策の目処が立ってからご報告しようと考えていましたが、今後は速報ベースで共有します。',
        '少し前から感じていましたが、確信が持てずにいました。',
        'ちょっと様子を見ていました。大丈夫だと思っていたのですが…。',
      ],
      [
        '機能AとBに集中し、来週中に仕様確定。残りのリソースを品質向上に振り向け、納期通りリリースします。機能Cは次フェーズで対応することを顧客にも説明済みです。',
        '引き続き頑張ります。チームと相談しながら最善を尽くします。',
        'もう少し検討させてください。',
      ],
      [
        'ありがとうございます。月曜日に2機能版の計画書と、機能C対応の次フェーズ案もあわせてお持ちします。',
        'はい、準備します。よろしくお願いします。',
        '月曜ですね。なるべく準備します。',
      ],
    ],
  },
  'mece-meeting': {
    partner: [
      '今日の会議のテーマは「来期の売上目標達成策」です。各自意見はあると思いますが、まず論点を整理したいと思います。どこから始めますか？',
      'なるほど。既存顧客と新規顧客に分けて考えるということですね。重複や漏れはないですか？',
      '単価向上の具体的な方法は何が考えられますか？',
      'それらの施策、優先順位はどうつけますか？',
      'では今日のアクションプランをまとめましょう。誰が、何を、いつまでに、という形で。',
    ],
    choices: [
      [
        '売上を「既存顧客」と「新規顧客」に分けて、それぞれ「単価向上」「件数増加」の軸で施策を整理しましょう。漏れなくダブりなく議論できます。',
        'まずは各自が重要だと思う施策を出し合って、そこから絞り込みましょう。',
        'とりあえずブレストから始めて、後で整理しましょうか。',
      ],
      [
        '既存顧客は「アップセル」「クロスセル」「解約防止」の3つ、新規は「リード獲得」「商談化」「成約率向上」で網羅できます。',
        '大体カバーできていると思います。細かいところは後で調整します。',
        '少し重なるところもありますが、まあ大丈夫ではないでしょうか。',
      ],
      [
        '既存顧客へのプレミアムプラン案内と、オプション追加の提案営業が即効性高いです。新規向けには参照価格の見直しも検討できます。',
        '価格を上げるか、付加価値をつけるかのどちらかだと思います。',
        '単価向上は難しいですよね。顧客の反発も考えると慎重にならざるを得ません。',
      ],
      [
        '即効性と実現可能性のマトリクスで評価します。既存顧客アップセルを最優先、次いで成約率向上、単価見直しは中期で取り組みます。',
        '重要なものからやっていく感じで良いと思います。',
        '全部大事なので並行して進めましょう。',
      ],
      [
        '山田さんがアップセル提案書作成（今月末）、田中さんが成約率改善スクリプト見直し（来週金曜）、私がプレミアムプランの価格設計（来週水曜）を担当します。',
        '担当を決めて次回に持ち寄りましょう。',
        'それぞれ頑張りましょう。',
      ],
    ],
  },
  'pyramid-client': {
    partner: [
      'それで、今回の提案の結論は何ですか？最初に教えてください。',
      'コスト削減20%の根拠は何ですか？',
      'リスクはありませんか？導入コストや社内の混乱とか。',
      '競合他社と比べた差別化ポイントは何ですか？',
      '分かりました。次のステップとして何を提案しますか？',
    ],
    choices: [
      [
        '御社の物流コストを年間20%削減し、在庫回転率を1.5倍に改善できます。そのための3つの施策をご提案します。',
        '今日は物流改善の提案を持ってきました。詳しくご説明させてください。',
        '資料を作ってきましたので、順番に説明させてください。',
      ],
      [
        '御社の過去3年のデータと同業他社20社のベンチマークに基づいています。倉庫稼働率が業界平均比15%低く、ここに最大の改善余地があります。',
        '業界の平均的な改善事例から算出しています。',
        '概算ですが、一般的にこのような施策で20%程度の削減が見込めます。',
      ],
      [
        '初期導入コストは約500万円ですが6ヶ月で回収できます。段階的導入と専任サポートで社内混乱を最小化し、移行期間中の生産性低下も試算済みです。',
        'メリットの方が大きいと考えています。一緒に対策を考えましょう。',
        'リスクは低いと思います。他社でも問題なく導入できています。',
      ],
      [
        '既存システムとのシームレスな連携と、導入後12ヶ月の専任サポートです。競合は製品を売って終わりですが、私たちはKPI達成まで伴走します。',
        '価格と品質のバランスが優れていると自負しています。',
        '長年の実績と信頼性が強みです。',
      ],
      [
        '来週中に基幹システムの連携要件を確認させてください。その後2週間で詳細提案書を作成し、月末に意思決定者を交えた場を設けることを提案します。',
        'ご検討いただいて、ご連絡いただければと思います。',
        'またご連絡します。',
      ],
    ],
  },
}

export function createRoleplayRouter(
  client: Anthropic,
  _supabase: SupabaseClient,
  roleplayTurnLimiter: RequestHandler,
) {
  const router = Router()

  // =============================================
  // ロールプレイ会話
  // =============================================
  router.post('/chat', roleplayTurnLimiter, async (req, res) => {
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
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 300,
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
  router.post('/turn', roleplayTurnLimiter, async (req, res) => {
    const { messages, setup, turnNumber, maxTurns, locale, situationId } = req.body as {
      messages: { role: string; content: string }[]
      setup: { template: { title: string }; category?: string; partner: { name: string; role: string; personality: string; interests: string; concerns: string }; goal: string; context: string }
      turnNumber: number
      maxTurns: number
      locale?: string
      situationId?: string
    }
    // ── パターンモード（AIコスト削減） ──
    const pattern = situationId ? ROLEPLAY_PATTERNS[situationId] : undefined
    if (pattern) {
      const idx = Math.min(turnNumber - 1, pattern.partner.length - 1)
      const partnerLine = pattern.partner[idx] ?? pattern.partner[pattern.partner.length - 1]
      const choiceSet = pattern.choices[idx] ?? pattern.choices[pattern.choices.length - 1]
      const isLast = turnNumber >= maxTurns
      return res.json({ partner: partnerLine, choices: choiceSet, done: isLast })
    }
    const isEn = locale === 'en'
    const { template, partner, goal, context } = setup
    const isPhilosophy = setup.category === 'philosophy'
    const isFirst = !messages || messages.length === 0
    const isLast = turnNumber >= maxTurns

    const philosophyAddendum = isPhilosophy ? `

## 哲学対話モード
- あなたは古代〜近代の著名な哲学者として振る舞う
- 相手の主張に対して必ず「なぜそう言えるか？」「反例はないか？」と問い直す
- 難解な専門用語は使わず、対話形式で深掘りする
- セリフは短く鋭く（2〜3文）
- 選択肢は「深い答え」「無難な答え」「論点をずらす答え」の3種` : ''

    const systemPromptJa = `あなたはロールプレイのナレーター兼キャラクター演者です。場面で「${partner.name}」(${partner.role})を演じます。

## キャラクター設定
- 性格: ${partner.personality}
- 関心事: ${partner.interests}
- 懸念事項: ${partner.concerns}
- 場面: ${template.title}
${goal ? `- ユーザーのゴール: ${goal}` : ''}
${context ? `- 状況: ${context}` : ''}${philosophyAddendum}

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
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 400,
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
  router.post('/score', roleplayTurnLimiter, async (req, res) => {
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
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 800,
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
  // 会話サマリー生成
  // =============================================
  router.post('/summary', roleplayTurnLimiter, async (req, res) => {
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
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 600,
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

  return router
}
