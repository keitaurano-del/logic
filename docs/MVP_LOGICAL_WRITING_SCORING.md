# ロジカルライティング即採点エージェント — MVP 設計書

作成: 2026-06-06
担当エージェント: dev-logic (蓮)

---

## 1. 機能概要

### 背景

Logic の「専門特化 AI フィードバックエージェント」として、最有望領域のロジカルライティング添削を MVP 化する。マーケティング上の打ち出しは「AI フィードバック」ではなく **「即採点 / 論理スコア」**。

### ユーザー体験フロー

1. レッスン内の think ステップに到達
2. **テキストエリアが出現**し、ユーザーが 200 字程度の文章（メール書き直し・報告書一段落等）を入力
3. 「採点する」ボタンをタップ → API を叩く（Haiku、1〜2 秒）
4. **スコアカード**が表示される（総合スコア + 軸別コメント）
5. 「模範解答を見る」で従来の modelAnswer + points を開示（既存機能をそのまま温存）
6. 「次へ」で先に進む

### 対象コース

`logical-writing-01`（ID: 910〜917）— PREP / BLUF / 一文一義 / 接続詞 / 抽象具体 を扱う全 8 レッスン

現状の確認: `src/logicalWritingLessons.ts` には think ステップが 0 件。
Phase 1 では **新規 think ステップを 1 つ追加**（lesson 911: 結論ファースト）して採点が動くことを確認する。

---

## 2. 採点設計

### 採点軸（ルーブリック）

軸ごとの配点を固定し、モデルに裁量を持たせない。

| 軸 | 満点 | 評価対象 |
|---|---|---|
| 結論先出し (Point) | 25 点 | 冒頭1〜2文で主張が明示されているか |
| 根拠・理由 (Reason) | 25 点 | 主張に「なぜ」が紐づいているか |
| 具体例・データ (Example) | 20 点 | 抽象主張が具体で裏付けられているか |
| 結論回帰 (Point 回帰) | 10 点 | 末尾で主張を再言及しているか |
| 一文の長さ | 10 点 | 1 文 40 字前後、主語が明確か |
| 接続詞の適切使用 | 5 点 | 論理関係が接続詞で可視化されているか |
| 抽象-具体の往復 | 5 点 | 抽象→具体→抽象 の往復があるか |

合計 100 点。

### 設計の鉄則

**内容の正誤判定をしない。構造だけ見る。**

採点プロンプトには以下を明示する。

- 「この文章の主張が正しいか間違いかは採点しない。PREP の各要素が構造として揃っているかだけを見る」
- 「"ケースバイケース" "状況による" での逃げは禁止。軸ごとのスコアを必ず数字で出す」
- 「低スコア時は "ここを足せばこうなる" の前向き言語化をする。"構造が崩れています" で終わらない」

### 励まし方のキャリブレーション

フェルミ推定の fermi.ts に実装済みのパターンを流用する（server/routes/fermi.ts line 82〜91 参照）。

- 「減点主義でなく加点主義。筋が通っている部分にはしっかり加点」
- 「全員満点にはしないが、初学者が萎えない点数設計（最低でも 30 点台後半は出る感覚）」
- 「PREP の 1 要素でも揃っていれば、その要素の点は出す」

---

## 3. 技術構成

### バックエンド: 新規エンドポイント

#### ファイル

`server/routes/writing-score.ts` を新設する。

#### エンドポイント

```
POST /api/writing-score
```

#### リクエスト body

```json
{
  "lessonId": 911,
  "question": "以下のメールを PREP 構造で書き直してください。...",
  "userInput": "ユーザーが書いた200字の文章",
  "locale": "ja",
  "userId": "uuid-or-null",
  "guestId": "g_xxxx"
}
```

#### レスポンス

```json
{
  "score": 72,
  "scoreBreakdown": "結論先出し 20/25 · 根拠 20/25 · 具体例 12/20 · 結論回帰 8/10 · 一文 8/10 · 接続詞 3/5 · 抽象具体 1/5",
  "scoreDetails": {
    "point": "冒頭1文で「〜を依頼します」と主張が明示されている",
    "reason": "理由が2点挙げられているが、1つは根拠が薄い",
    "example": "具体的な数字や事例がない",
    "pointReturn": "末尾で主張に戻っている",
    "sentenceLength": "一文が50字超の文が1つある",
    "connective": "逆接の接続詞が適切に使われている",
    "abstractConcrete": "抽象→具体の往復がない"
  },
  "feedback": "## 良かった点\n- ...\n\n## もっと伸ばすには\n- ..."
}
```

#### tool 定義スキーマ（疑似コード）

フェルミ推定の SCORE_JSON 正規表現パース方式（fermi.ts line 295〜309）は崩れやすい。
writing-score では Claude `tools`（tool_use）で構造化出力を取る。

```typescript
const tools = [
  {
    name: 'score_writing',
    description: 'PREP構造に基づいてロジカルライティングを採点する',
    input_schema: {
      type: 'object',
      properties: {
        scores: {
          type: 'object',
          properties: {
            point:         { type: 'number', description: '結論先出し 0-25点' },
            reason:        { type: 'number', description: '根拠・理由 0-25点' },
            example:       { type: 'number', description: '具体例・データ 0-20点' },
            pointReturn:   { type: 'number', description: '結論回帰 0-10点' },
            sentenceLength:{ type: 'number', description: '一文の長さ 0-10点' },
            connective:    { type: 'number', description: '接続詞 0-5点' },
            abstractConcrete:{ type: 'number', description: '抽象-具体往復 0-5点' },
          },
          required: ['point','reason','example','pointReturn','sentenceLength','connective','abstractConcrete'],
        },
        details: {
          type: 'object',
          description: '各軸の採点理由（40〜80字の日本語1文）',
          properties: {
            point:          { type: 'string' },
            reason:         { type: 'string' },
            example:        { type: 'string' },
            pointReturn:    { type: 'string' },
            sentenceLength: { type: 'string' },
            connective:     { type: 'string' },
            abstractConcrete: { type: 'string' },
          },
        },
        feedbackText: {
          type: 'string',
          description: '「良かった点」「もっと伸ばすには」を含む日本語テキスト（400〜600字）',
        },
      },
      required: ['scores', 'details', 'feedbackText'],
    },
  },
]
```

呼び出し時は `tool_choice: { type: 'tool', name: 'score_writing' }` を指定して tool_use を必ず発火させる。

#### Router ファクトリパターン

fermi.ts と同じ `createWritingScoreRouter(client, supabase, writingScoreLimiter)` パターンで実装し、server/index.ts に1行追加する。

```typescript
// server/index.ts に追加する行
app.use('/api/writing-score', createWritingScoreRouter(client, supabase, writingScoreLimiter))
```

#### レート制限

```typescript
const writingScoreLimiter = makeLimiter({
  windowMs: 60 * 1000,
  max: 10,
  msgJa: '採点のリクエストが多すぎます。1分待ってからお試しください。',
  msgEn: 'Too many scoring requests. Please wait a minute.',
  useUserId: true,
})
```

#### モデル選定

コスト最小化のため **claude-haiku-4-5-20251001** を使う（fermi.ts と同じ）。

System prompt は `cache_control: { type: 'ephemeral' }` でキャッシュする（採点ルーブリックは全リクエスト共通なので効く）。

### バックエンド: DB 保存（任意、後回し可）

採点結果は `writing_score_answers` テーブルに保存することを Phase 2 で検討する。
Phase 1 では DB 保存なし、レスポンスを返すだけでよい。

### フロントエンド: ThinkSlide の拡張

#### 現状の ThinkSlide（LessonStoriesScreen.tsx line 1362〜1443）

現状は:

1. 問いを表示
2. 「考える時間のプレースホルダー」（dashed border の静的 div）
3. 「模範解答を見る」ボタン → `revealed` を true にして modelAnswer + points を開示

**入力機能がない**。ユーザーは「心の中で考えて」から答えを見るだけの受動的なフロー。

#### 変更方針

think ステップのデータ型に `scoringEnabled?: boolean` フラグを追加する（既存 think ステップへの影響ゼロ）。

`scoringEnabled: true` の場合のみ、プレースホルダー div をテキストエリアに置き換え、採点フローを有効にする。

#### 変更後の UI フロー（scoringEnabled: true 時）

```
[問いの表示]
[ヒント（任意）]
[テキストエリア: 200字程度を目安に書いてください]
[「採点する」ボタン]
     ↓ ローディング中はスピナー
[スコアカード表示（総合スコア + 軸別コメント + feedbackText）]
[「模範解答を見る」ボタン]
     ↓
[modelAnswer + points（既存 revealed フロー）]
[「次へ」ボタン]
```

#### ThinkStep 型への追加

```typescript
// src/lessonData.ts
export type ThinkStep = {
  type: 'think'
  question: string
  hint?: string
  modelAnswer: string
  points: string[]
  scoringEnabled?: boolean   // ← 追加。true の場合のみ採点 UI を有効化
}
```

`lessonSlides.ts` の think スライド生成箇所（line 445〜452）に `scoringEnabled` の passthrough を追加する。

```typescript
// src/lessonSlides.ts (変更後)
} else if (stepType === 'think') {
  slides.push({
    kind: 'think',
    question: step.question || '',
    hint: step.hint,
    modelAnswer: step.modelAnswer || '',
    points: step.points || [],
    scoringEnabled: step.scoringEnabled ?? false,   // ← 追加
  })
}
```

`LessonSlide` union 型の think 定義にも `scoringEnabled?: boolean` を追加する。

#### スコアカード UI（ワイヤーフレーム）

```
┌─────────────────────────────────────────┐
│  論理スコア                              │
│                                         │
│      ┌──────┐                          │
│      │  72  │   /100                   │
│      └──────┘                          │
│                                         │
│  結論先出し    ████████░░   20/25       │
│  根拠・理由    ████████░░   20/25       │
│  具体例        ██████░░░░   12/20       │
│  結論回帰      ████████░░    8/10       │
│  一文の長さ    ████████░░    8/10       │
│  接続詞        ███░░░░░░░    3/5        │
│  抽象-具体     █░░░░░░░░░    1/5        │
│                                         │
│  良かった点                              │
│  ─────────────────────────────         │
│  冒頭で「〜を依頼します」と             │
│  主張が明示されている点が良い           │
│                                         │
│  もっと伸ばすには                        │
│  ─────────────────────────────         │
│  具体的な数字（例: 予算 ¥xx 万円）を    │
│  加えると例示点が大きく伸びる           │
│                                         │
│  [模範解答を見る]                        │
└─────────────────────────────────────────┘
```

スコアカードはストアのスクリーンショット素材として使えるデザインにする。
色使いは CSS 変数 `var(--brand)` / `var(--brand-soft)` / `var(--text-primary)` のみ使用。

### コスト分散オプション（技術選択肢）

旧箱（keita.urano2@gmail.com）の Claude を裏で使う案:

`/home/dev/cron-scripts/notebook-claude-ob.sh` に実装済みの SSH ラッパーパターン（新箱から旧箱に SSH して claude --print を叩く）を流用することで、Anthropic アカウントの容量を 2 アカウントで分散できる。

ただし SSH ラッパーはレイテンシが増えるため、1〜2 秒以内に結果を返したい採点 API には不向き。
旧箱 claude の活用は「非同期バッチ処理（採点ログの分析 / フィードバック集計）」に限定し、ユーザー向けリアルタイム採点は本箱の通常 API で処理する設計が現実的。

---

## 4. MVP スコープ

### Phase 1（今月中に動く）

目標: **lesson 911（結論ファースト）の think ステップ 1 つで採点が動く**

- `src/logicalWritingLessons.ts` の lesson 911 に `scoringEnabled: true` の think ステップを 1 つ追加
- `server/routes/writing-score.ts` を新設（tool_use 採点、Haiku）
- `server/index.ts` にエンドポイント登録 + writingScoreLimiter 追加
- `src/lessonData.ts` に `scoringEnabled` フィールド追加
- `src/lessonSlides.ts` に passthrough 追加
- `LessonStoriesScreen.tsx` の ThinkSlide を拡張（scoringEnabled: true 時のみテキストエリア + 採点 UI）
- i18n: ja / en 両方に採点 UI 用文字列を追加

マイルストーン: 6 月末までに Playwright E2E で採点レスポンスが返ることを確認。

### Phase 2（来月以降）

- logical-writing-01 の全 think ステップ（lesson 910〜917）に採点を展開
- DB 保存（`writing_score_answers` テーブル + マイグレーション）
- スコア履歴画面（ユーザーが過去の採点を振り返れる）
- ストア向けスクリーンショット撮影

---

## 5. UI/UX スケッチ

### 採点フロー画面遷移

```
[ThinkSlide — 問い表示]
          |
          v
[テキストエリア入力中]
          |
          v
[「採点する」タップ → ローディング 1〜2秒]
          |
          v
[スコアカード: 総合 + 軸別バー + feedbackText]
     [模範解答を見る] ← タップで revealed=true
          |
          v
[modelAnswer + points（既存 UI そのまま）]
     [次へ]
```

### マーケ訴求ポイント

ストアのスクリーンショットで「論理スコア 72 / 100」「結論先出し 20/25」のバーチャートが見える画面は、「AI が採点してくれる」というプロダクトの核が一目で伝わる絵になる。

---

## 6. リスク・未解決事項

### 戦略リスク

**論理思考カテゴリ自体の市場教育コスト**（Masayoshi 指摘）:
「ロジカルライティングを鍛えたい」というニーズがユーザーにどれだけ顕在化しているか。
「即採点」「論理スコア」の打ち出しは、ニーズが潜在層にも刺さりやすい表現。ただし「何の点数なの?」という疑問に答えるオンボーディングが必要。

対策: Phase 1 の 1 ステップ限定リリースでコンバージョン（採点ボタンのタップ率）を計測し、市場反応を見てから全展開を判断する。

### 技術リスク

**think ステップの既存データ構造との整合**:
`ThinkStep` に `scoringEnabled` を追加することで、既存の think ステップ（scoringEnabled なし = undefined = false 扱い）は影響を受けない。lessonSlides.ts の passthrough で `?? false` を使えばデフォルトが保たれる。ただし LessonSlide union 型 の think バリアントにフィールドを追加するので型チェックが必要。

**採点の公平感**:
tool_use による構造化スコア出力は SCORE_JSON 正規表現パースより堅牢だが、採点軸の配点とプロンプトのキャリブレーションが甘いと「なぜこのスコアか分からない」という UX になる。Phase 1 はまず動くものを出し、数件の実際の文章で採点結果を見て調整する（フェルミ採点のキャリブレーション経験を活用）。

**レイテンシ**:
Haiku + tool_use で概ね 1〜2 秒。入力が長い（200字超）場合や混雑時に 3〜4 秒になるケースを想定し、フロント側でローディングスピナーを必ず出す。

---

## 実装参照ポイント（ファイル:行）

- fermi.ts の feedback エンドポイントのパターン全体: `server/routes/fermi.ts:58-343`
- SCORE_JSON 正規表現パース（改善対象）: `server/routes/fermi.ts:295-309`
- makeLimiter の使い方: `server/index.ts:115-143`
- fermiLimiter の登録例: `server/index.ts:154-160, 254`
- ThinkStep 型定義: `src/lessonData.ts:53-59`
- lessonSlides.ts の think パススルー: `src/lessonSlides.ts:445-452`
- ThinkSlide コンポーネント全体: `src/screens/LessonStoriesScreen.tsx:1362-1443`
- ThinkSlide の revealed フロー: `src/screens/LessonStoriesScreen.tsx:1400-1422`
