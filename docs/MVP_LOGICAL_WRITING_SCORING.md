# ロジカルライティング即採点エージェント — MVP 設計書

作成: 2026-06-06
改訂: 2026-06-06（RAG ベース設計に拡張）
担当エージェント: dev-logic (蓮)

---

## 1. 機能概要

### 背景

Logic の「専門特化 AI フィードバックエージェント」として、最有望領域のロジカルライティング添削を MVP 化する。マーケティング上の打ち出しは「AI フィードバック」ではなく **「即採点 / 論理スコア」**。

### ユーザー体験フロー

1. レッスン内の think ステップに到達
2. **テキストエリアが出現**し、ユーザーが 200 字程度の文章（メール書き直し・報告書一段落等）を入力
3. 「採点する」ボタンをタップ → API を叩く（Haiku、1〜2 秒）
4. **スコアカード**が表示される（総合スコア + 軸別コメント + 根拠レッスンへのリンク）
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

## 3. RAG アーキテクチャ

### 3.1 RAG を入れる狙い

| 課題 | RAG なしの問題 | RAG で解決 |
|---|---|---|
| Logic の教え方との整合 | 汎用 AI の採点基準が Logic 教材と乖離する | 採点時に Logic 教材のルール・事例を検索で引き、同じ基準で評価 |
| プロンプト肥大化 | レッスンが増えるたびにシステムプロンプトに追記 → 数千字化 | 関連ルール・事例だけを top-K 検索で絞り込む |
| 根拠の透明性 | 「なぜこのスコアか」の根拠が不透明 | どのレッスンの原則に照らして採点したか提示できる |
| 個別最適化 | 全ユーザー共通のフィードバック | ユーザーの過去の弱点（`user_wrong_answers`）を検索し、弱点に即した指摘が可能（Phase 3） |

### 3.2 RAG なし vs RAG ありの比較

```
【Phase 1 — RAG なし（直書き）】

  ユーザー入力
       │
       ▼
  system prompt（ルーブリック直書き、約 500 字固定）
       │
       ▼
  Claude Haiku (tool_use)
       │
       ▼
  スコアカード（根拠なし）

特徴: インフラ最小、追加 DB 不要、latency 最速
制約: Logic 固有の教え方と乖離しやすい、レッスン増で手動保守が必要

---

【Phase 2 — RAG 導入（pgvector + Gemini embedding）】

  ユーザー入力
       │
  ┌────▼─────────────────────────────────────────┐
  │  embed (Gemini text-embedding-004)           │
  │  → query vector (768 次元)                   │
  └────┬─────────────────────────────────────────┘
       │
  ┌────▼──────────────────────────────────────────┐
  │  pgvector 検索                                │
  │  lesson_embeddings (top-3 教材ルール)         │
  │  scoring_example_embeddings (top-2 採点事例)  │
  └────┬──────────────────────────────────────────┘
       │ 検索結果 (content + lesson_id)
  ┌────▼──────────────────────────────────────────┐
  │  system prompt に動的注入                     │
  │  {{retrieved_rules}} + {{retrieved_examples}} │
  └────┬──────────────────────────────────────────┘
       │
  Claude Haiku (tool_use)
       │
  スコアカード + 根拠 lesson_id
       │
  「このレッスンを復習する →」ジャンプ UI
```

### 3.3 段階移行方針

- Phase 1: RAG なし。ルーブリックをシステムプロンプトに直書き。lesson 911 の 1 think ステップで採点が動くことを確認する。
- Phase 2: pgvector + Gemini embedding を導入。Supabase migration 038 を適用してから切り替え。Phase 1 のエンドポイント（`POST /api/writing-score`）のシグネチャは変えない。内部でコンテキストを補強するだけ。
- Phase 3: ユーザー弱点履歴（`user_wrong_answers`）を追加検索ソースとして組み込む。

---

## 4. 技術構成

### 4.1 バックエンド: 採点エンドポイント

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
  "feedback": "## 良かった点\n- ...\n\n## もっと伸ばすには\n- ...",
  "sourceLessons": [
    { "id": 911, "title": "結論ファースト（PREP / BLUF）", "relevance": "PREP 構造のルール参照" }
  ]
}
```

`sourceLessons` フィールドは Phase 2 から追加。Phase 1 は空配列 `[]`。

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
        sourceLessonIds: {
          type: 'array',
          items: { type: 'number' },
          description: '採点根拠として参照したレッスン ID の配列（Phase 2 から使用）',
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

#### バックエンド: DB 保存（Phase 2）

採点結果は `writing_score_answers` テーブルに保存する（migration 038 で追加）。
Phase 1 では DB 保存なし、レスポンスを返すだけでよい。

---

### 4.2 pgvector スキーマ設計（Phase 2）

Supabase は PostgreSQL を内蔵しており、`CREATE EXTENSION vector` で pgvector が有効化できる。
Logic の本番 Supabase プロジェクト ID は `yctlelmlwjwlcpcxvmgx`（ap-southeast-2）。

#### Embedding 次元数の選択

| モデル | 次元数 | 用途 | コスト |
|---|---|---|---|
| `text-embedding-004` | 768 | テキスト類似検索 | $0.000025 / 1k tokens |
| `text-embedding-004` (output_dimensionality=256) | 256 | 軽量版（精度やや低下） | 同上 |

Logic の教材規模（logical-writing-01: 8 レッスン × 2〜4 explain = 30 チャンク程度）では **768 次元のまま使う**。将来全コース展開時も pgvector の ivfflat インデックスで十分スケールする。

#### テーブル設計（SQL スケッチ）

```sql
-- 教材チャンクの埋め込み
CREATE TABLE lesson_embeddings (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id    integer NOT NULL,               -- 例: 911
  chunk_index  integer NOT NULL DEFAULT 0,     -- 1 レッスン内の分割番号
  chunk_type   text NOT NULL,                  -- 'principle' | 'rubric' | 'example_good' | 'example_bad'
  content      text NOT NULL,                  -- 埋め込みの元テキスト
  embedding    vector(768) NOT NULL,
  metadata     jsonb DEFAULT '{}',             -- { "title": "...", "category": "..." }
  created_at   timestamptz DEFAULT now(),
  UNIQUE (lesson_id, chunk_index)
);

-- 採点事例の埋め込み（良い例/悪い例 + スコアのペア）
CREATE TABLE scoring_example_embeddings (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id        integer NOT NULL,
  example_type     text NOT NULL,              -- 'good' | 'bad' | 'corrected'
  score_axis       text,                       -- 'point' | 'reason' | 'example' | null(全体)
  expected_score   integer,                    -- この例が示す典型スコア帯
  content          text NOT NULL,              -- 例文テキスト
  annotation       text,                       -- なぜ good/bad か（採点時にプロンプトに注入）
  embedding        vector(768) NOT NULL,
  metadata         jsonb DEFAULT '{}',
  created_at       timestamptz DEFAULT now()
);

-- 採点結果の保存（Phase 2 DB 保存用）
CREATE TABLE writing_score_answers (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  guest_id      text,
  lesson_id     integer NOT NULL,
  locale        text NOT NULL DEFAULT 'ja',
  user_input    text NOT NULL,
  total_score   integer,
  score_detail  jsonb,                         -- { point, reason, example, ... }
  feedback_text text,
  source_lesson_ids  integer[],               -- RAG で参照したレッスン ID
  created_at    timestamptz DEFAULT now()
);
```

#### RLS ポリシー

```sql
-- lesson_embeddings / scoring_example_embeddings: 全ユーザー read-only（認証不要）
-- 教材は公開データ、RLS は SELECT USING (true) でよい

-- writing_score_answers: 本人のみ
ALTER TABLE writing_score_answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "writing_score: self only"
  ON writing_score_answers FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

#### インデックス

```sql
-- ivfflat (コサイン距離, lists=50 は教材規模で十分)
CREATE INDEX lesson_embeddings_embedding_idx
  ON lesson_embeddings
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 50);

CREATE INDEX scoring_example_embedding_idx
  ON scoring_example_embeddings
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 50);
```

---

### 4.3 Embedding パイプライン

教材テキストは**ビルド時バッチスクリプト**でベクトル化し Supabase に投入する。ユーザーリクエスト時にオンデマンド embed は行わない。

#### スクリプト配置

```
scripts/
  embed-writing-lessons.ts   -- logical-writing-01 の教材を embed して Supabase に upsert
  embeddingUtils.ts          -- Gemini embed API 呼び出しラッパー
```

#### embed 対象チャンクの切り出し方針（疑似コード）

```typescript
// 1 explain ステップ → 複数チャンクに分割
function chunkExplainStep(step: ExplainStep, lessonId: number): ChunkInput[] {
  const chunks: ChunkInput[] = []

  // (a) 原則チャンク: title + content の先頭 300 字
  chunks.push({
    lessonId,
    chunkIndex: 0,
    chunkType: 'principle',
    content: `${step.title}\n\n${step.content.slice(0, 300)}`,
    metadata: { title: step.title },
  })

  // (b) ルーブリックチャンク: content 中に採点軸が含まれる段落
  const rubricParagraphs = extractRubricParagraphs(step.content)
  rubricParagraphs.forEach((para, i) => {
    chunks.push({
      lessonId,
      chunkIndex: 1 + i,
      chunkType: 'rubric',
      content: para,
      metadata: { title: step.title },
    })
  })

  return chunks
}

// Gemini text-embedding-004 で embed
async function embedBatch(texts: string[], apiKey: string): Promise<number[][]> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:batchEmbedContents?key=${apiKey}`
  // requests: texts.map(text => ({ model: 'models/text-embedding-004', content: { parts: [{ text }] } }))
  // レスポンス: embeddings[].values (768 次元 float[])
}
```

#### 実行タイミング

| タイミング | 説明 |
|---|---|
| 初回 Phase 2 移行時 | `npx tsx scripts/embed-writing-lessons.ts` を1回手動実行 |
| 教材更新時 | lesson ファイル変更後、同スクリプトを再実行（upsert で冪等） |
| CI/CD への組み込み | Phase 3 以降検討。頻繁に変わらないので手動で十分 |

---

### 4.4 pgvector コサイン距離クエリ（SQL スケッチ）

採点 API のリクエストを受けたとき、`userInput` を Gemini で embed してからベクトル検索する。

```sql
-- 関連教材ルールを top-3 取得（コサイン距離 <=> が小さいほど類似）
SELECT
  id,
  lesson_id,
  chunk_type,
  content,
  metadata,
  embedding <=> $1::vector AS distance
FROM lesson_embeddings
ORDER BY embedding <=> $1::vector
LIMIT 3;

-- 関連採点事例を top-2 取得
SELECT
  id,
  lesson_id,
  example_type,
  score_axis,
  expected_score,
  content,
  annotation,
  embedding <=> $1::vector AS distance
FROM scoring_example_embeddings
ORDER BY embedding <=> $1::vector
LIMIT 2;
```

`$1` はユーザー入力の embed ベクトル（768 次元）を Postgres の `vector` 型にキャストして渡す。

Supabase からは `supabase.rpc('match_lesson_rules', { query_embedding: [...], match_count: 3 })` 形式の RPC ラッパー関数を用意するか、`supabase.from('lesson_embeddings').select('...')` で生 SQL を使う方法が選べる。実装コストが低い後者（生クエリ）を Phase 2 では採用する。

---

### 4.5 採点プロンプトへの RAG 注入

Phase 2 では、システムプロンプトの末尾に検索結果を動的に差し込む。

#### プロンプト構造（疑似コード）

```
[固定部分: cache_control: ephemeral でキャッシュ]
あなたは Logic アプリのロジカルライティング採点コーチです。
採点はルーブリックに厳密に従い、構造だけを評価する（内容の正誤は見ない）。
...（ルーブリック定義、励まし方針 — 約 500 字）...

[動的部分: リクエストごとに挿入、キャッシュ不可]
---
## Logic 教材の関連ルール（検索結果）

{{retrieved_rules}}
---（上記は Logic の教材原文から取得した採点基準です）

## 関連する採点事例

{{retrieved_examples}}
---（上記の事例スコアを参考に、今回の文章を採点してください）
```

`{{retrieved_rules}}` の展開例:

```
[lesson 911] 結論ファースト（PREP / BLUF）
PREP とは Point→Reason→Example→Point の順に書く型。ビジネス文書では冒頭の 1〜2 文に
結論（Point）を置くことで、読み手が続きを読む判断を冒頭でできる。
（distance: 0.12）

[lesson 914] 接続詞で論理を可視化（順接 / 逆接 / 追加 / 要約）
接続詞は「論理関係を記号化する」機能を持つ。「しかし」は逆接、「そのため」は因果を示す。
接続詞がないと、2 文の関係を読み手が想像する負担が生まれる。
（distance: 0.24）
```

`{{retrieved_examples}}` の展開例:

```
[良い例 / lesson 911 / point 軸]
「今週の会議はキャンセルしてください。理由は〇〇のためです。」
→ 依頼（Point）が冒頭にあり、理由が続く。典型スコア: point 22/25

[悪い例 / lesson 911 / point 軸]
「〇〇という状況があって、□□の懸念もあり、したがって今週の会議を…」
→ 結論が末尾。読み手は最後まで読まないと要件を把握できない。典型スコア: point 8/25
```

#### キャッシュ戦略

| プロンプト部分 | cache_control | 理由 |
|---|---|---|
| 固定ルーブリック部（約 500 字） | ephemeral | 全リクエスト共通、キャッシュ効く |
| RAG 注入部（動的） | なし | リクエストごとに異なる |

固定部はキャッシュされるため、コスト増は RAG 注入部（約 200〜400 字）のみ。

---

### 4.6 根拠レッスンへのジャンプ UI

採点レスポンスの `sourceLessons` を使って、スコアカード下部に「このレッスンを復習する」リンクを表示する。

#### レスポンス形式（Phase 2）

```json
"sourceLessons": [
  {
    "id": 911,
    "title": "結論ファースト（PREP / BLUF）",
    "relevance": "PREP 構造の Point 配置ルール参照"
  },
  {
    "id": 914,
    "title": "接続詞で論理を可視化",
    "relevance": "接続詞スコアの採点根拠"
  }
]
```

#### UI スケッチ（スコアカード下部）

```
┌─────────────────────────────────────────┐
│  ...（スコアバー・feedbackText）...      │
│                                         │
│  採点根拠のレッスン                     │
│  ─────────────────────────────         │
│  📖 結論ファースト（PREP / BLUF）        │
│     PREP 構造の Point 配置ルール参照     │
│                           [復習する →]  │
│                                         │
│  📖 接続詞で論理を可視化                │
│     接続詞スコアの採点根拠              │
│                           [復習する →]  │
│                                         │
│  [模範解答を見る]                        │
└─────────────────────────────────────────┘
```

「復習する →」のタップ: `setScreen({ kind: 'lessonStories', lessonId: sourceLesson.id })` で直接遷移。
Phase 1 では `sourceLessons` が空のため、このセクションは非表示にする（条件レンダリング）。

---

### 4.7 フロントエンド: ThinkSlide の拡張

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
[スコアカード表示（総合スコア + 軸別バー + feedbackText）]
[根拠レッスンへのジャンプリンク（Phase 2 以降）]
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
│  採点根拠のレッスン（Phase 2）          │
│  ─────────────────────────────         │
│  結論ファースト（PREP / BLUF） [復習 →] │
│                                         │
│  [模範解答を見る]                        │
└─────────────────────────────────────────┘
```

スコアカードはストアのスクリーンショット素材として使えるデザインにする。
色使いは CSS 変数 `var(--brand)` / `var(--brand-soft)` / `var(--text-primary)` のみ使用。

---

## 5. Supabase Migration 構成案

次の migration 番号は **038**（現在最新: 037_daily_activity.sql）。

### ファイル構成

```
supabase/migrations/
  038_writing_score_rag.sql    -- pgvector 有効化 + RAG テーブル + 採点結果テーブル
```

### 038_writing_score_rag.sql のスケッチ

```sql
-- ────────────────────────────────────────────────────────────────────────────
-- 038_writing_score_rag.sql
-- 2026-06-xx: ロジカルライティング即採点エージェント — RAG 用 pgvector テーブル
-- ────────────────────────────────────────────────────────────────────────────

-- [1] pgvector 拡張（Supabase は既に pgvector 0.7 対応）
CREATE EXTENSION IF NOT EXISTS vector;

-- [2] 教材チャンクの埋め込みテーブル
CREATE TABLE IF NOT EXISTS public.lesson_embeddings (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id    integer NOT NULL,
  chunk_index  integer NOT NULL DEFAULT 0,
  chunk_type   text NOT NULL,
    -- 'principle': 原則・定義テキスト
    -- 'rubric': 採点基準テキスト
    -- 'example_good': 良い例
    -- 'example_bad': 悪い例
  content      text NOT NULL,
  embedding    vector(768) NOT NULL,
  metadata     jsonb DEFAULT '{}',
  created_at   timestamptz DEFAULT now(),
  UNIQUE (lesson_id, chunk_index)
);

-- [3] 採点事例の埋め込みテーブル
CREATE TABLE IF NOT EXISTS public.scoring_example_embeddings (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id        integer NOT NULL,
  example_type     text NOT NULL, -- 'good' | 'bad' | 'corrected'
  score_axis       text,          -- 'point' | 'reason' | 'example' | null(全体)
  expected_score   integer,
  content          text NOT NULL,
  annotation       text,          -- なぜ good/bad か（プロンプトに注入するコメント）
  embedding        vector(768) NOT NULL,
  metadata         jsonb DEFAULT '{}',
  created_at       timestamptz DEFAULT now()
);

-- [4] 採点結果の保存（Phase 2 DB 保存用）
CREATE TABLE IF NOT EXISTS public.writing_score_answers (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  guest_id            text,
  lesson_id           integer NOT NULL,
  locale              text NOT NULL DEFAULT 'ja',
  user_input          text NOT NULL,
  total_score         integer,
  score_detail        jsonb,
    -- { point: number, reason: number, example: number,
    --   pointReturn: number, sentenceLength: number,
    --   connective: number, abstractConcrete: number }
  score_breakdown     text,
  feedback_text       text,
  source_lesson_ids   integer[],  -- RAG で参照したレッスン ID
  rag_enabled         boolean DEFAULT false,
  created_at          timestamptz DEFAULT now()
);

-- [5] ivfflat インデックス（コサイン距離）
-- lists=50 は教材規模（数百行）で十分。全コース展開時に lists=100 へ上げる
CREATE INDEX IF NOT EXISTS lesson_embeddings_embedding_idx
  ON public.lesson_embeddings
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 50);

CREATE INDEX IF NOT EXISTS scoring_example_embedding_idx
  ON public.scoring_example_embeddings
  USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 50);

-- lesson_id での絞り込み検索用（特定レッスンのみ検索する時に使う）
CREATE INDEX IF NOT EXISTS lesson_embeddings_lesson_id_idx
  ON public.lesson_embeddings (lesson_id);

-- [6] RLS

-- lesson_embeddings: 認証不要で全ユーザーが SELECT 可（教材は公開データ）
ALTER TABLE public.lesson_embeddings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lesson_embeddings: public read"
  ON public.lesson_embeddings FOR SELECT USING (true);
CREATE POLICY "lesson_embeddings: service write"
  ON public.lesson_embeddings FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);  -- バッチ実行時に service_role で INSERT

-- scoring_example_embeddings: 同上
ALTER TABLE public.scoring_example_embeddings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "scoring_examples: public read"
  ON public.scoring_example_embeddings FOR SELECT USING (true);
CREATE POLICY "scoring_examples: service write"
  ON public.scoring_example_embeddings FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- writing_score_answers: 本人のみ
ALTER TABLE public.writing_score_answers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "writing_score: self only"
  ON public.writing_score_answers FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- [7] Metabase 分析用 read-only role への SELECT 付与（021 パターン準拠）
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'metabase_readonly') THEN
    GRANT SELECT ON public.lesson_embeddings TO metabase_readonly;
    GRANT SELECT ON public.scoring_example_embeddings TO metabase_readonly;
    GRANT SELECT ON public.writing_score_answers TO metabase_readonly;
  END IF;
END $$;

-- ────────────────────────────────────────────────────────────────────────────
-- ロールバック手順 (手動):
--   DROP TABLE IF EXISTS public.writing_score_answers;
--   DROP TABLE IF EXISTS public.scoring_example_embeddings;
--   DROP TABLE IF EXISTS public.lesson_embeddings;
--   -- pgvector extension は他機能を壊す可能性があるため DROP しない
-- ────────────────────────────────────────────────────────────────────────────
```

### migration 適用タイミング

- Phase 1 では **038 の適用は不要**（pgvector を使わない）
- Phase 2 移行直前に Supabase SQL Editor で 038 を実行してから、embed バッチスクリプトを走らせる

---

## 6. MVP スコープ

### Phase 1（今月中に動く） — RAG なし

目標: **lesson 911（結論ファースト）の think ステップ 1 つで採点が動く**

- `src/logicalWritingLessons.ts` の lesson 911 に `scoringEnabled: true` の think ステップを 1 つ追加
- `server/routes/writing-score.ts` を新設（tool_use 採点、Haiku、ルーブリック直書き）
- `server/index.ts` にエンドポイント登録 + writingScoreLimiter 追加
- `src/lessonData.ts` に `scoringEnabled` フィールド追加
- `src/lessonSlides.ts` に passthrough 追加
- `LessonStoriesScreen.tsx` の ThinkSlide を拡張（scoringEnabled: true 時のみテキストエリア + 採点 UI）
- i18n: ja / en 両方に採点 UI 用文字列を追加
- `sourceLessons` は空配列を返す（Phase 2 で埋める）

マイルストーン: 6 月末までに Playwright E2E で採点レスポンスが返ることを確認。

### Phase 2（来月以降） — RAG 導入

- `supabase/migrations/038_writing_score_rag.sql` を適用（pgvector + テーブル作成）
- `scripts/embed-writing-lessons.ts` を実装して教材を Supabase に投入
- `writing-score.ts` に RAG 検索フローを追加（embed → pgvector クエリ → プロンプト注入）
- `sourceLessons` フィールドを実データで埋める
- フロントのスコアカードに根拠レッスンジャンプ UI を追加
- DB 保存（`writing_score_answers` テーブル）
- logical-writing-01 の全 think ステップ（lesson 910〜917）に採点を展開

### Phase 3（来月以降） — 弱点個別最適化

- `user_wrong_answers` テーブルからユーザーの弱点傾向を取得（lesson_id 別の miss_count 集計）
- 弱点 lesson_id に対応する教材チャンクを優先的に検索コンテキストに追加
- フィードバック文に「あなたは〇〇が苦手なパターンです」という個別化メッセージを追加
- スコア履歴画面（ユーザーが過去の採点を振り返れる）
- ストア向けスクリーンショット撮影

---

## 7. コスト試算

### Gemini text-embedding-004（embed バッチ）

| 項目 | 試算 |
|---|---|
| logical-writing-01 チャンク数 | 約 30 チャンク（8 レッスン × 平均 4 chunk） |
| 採点事例チャンク数 | 約 40 件（8 レッスン × 5 事例） |
| 合計チャンク | 約 70 チャンク |
| 平均チャンク長 | 200 字 ≈ 180 tokens |
| 初回 embed 総トークン | 約 12,600 tokens |
| コスト | $0.000025/1k tokens × 12.6k ≈ **$0.0003（ほぼ無料）** |

教材更新時の差分 embed: 月 1〜2 回、数チャンク → 無視できるコスト。

### 採点 API 1 回あたりのコスト（Phase 2）

| 項目 | 試算 |
|---|---|
| ユーザー入力 embed（約 200 字） | ~180 tokens → $0.0000045 |
| Claude Haiku (tool_use) — input | ~1,500 tokens（system + RAG 注入 + user） |
| Claude Haiku — output | ~400 tokens |
| Haiku 価格（cache 除く） | $0.80/M input + $4.00/M output → **約 $0.003** |
| system prompt キャッシュ hit | ルーブリック部（約 500 tokens）がキャッシュされれば -$0.0004 |
| **合計 / 1 採点** | **約 $0.003（≈ 0.5 円）** |

月 1,000 回採点: 約 500 円。レート制限（10 回/分）で上限管理済み。

### pgvector 検索コスト

Supabase の pgvector クエリは DB のコンピュートコスト（SQL 実行）のみ。追加の API コール不要。
Supabase Pro プランの compute は既存のテーブル数・クエリ量でほぼ余裕があるため増コストはほぼゼロ。

---

## 8. UI/UX スケッチ

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
[採点根拠レッスンリンク（Phase 2）]
     [模範解答を見る] ← タップで revealed=true
          |
          v
[modelAnswer + points（既存 UI そのまま）]
     [次へ]
```

### マーケ訴求ポイント

ストアのスクリーンショットで「論理スコア 72 / 100」「結論先出し 20/25」のバーチャートが見える画面は、「AI が採点してくれる」というプロダクトの核が一目で伝わる絵になる。Phase 2 以降は「どのレッスンに基づいて採点されたか」も見せることで、Logic 教材とのシナジーを打ち出せる。

---

## 9. リスク・未解決事項

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

**RAG 固有リスク（Phase 2）**:

1. **embed ベクトルの陳腐化**: 教材テキストを大幅に書き換えた場合、古いベクトルが検索される。embed スクリプトを `UNIQUE(lesson_id, chunk_index)` の upsert で冪等に実装し、更新時に再実行する運用で対処。

2. **検索結果の不一致**: ユーザー入力が教材と全く異なるドメイン（英語・詩的表現など）の場合、無関係なチャンクが上位にくる可能性。距離スコア（distance > 0.5）でフィルタリングし、関連性が低い場合はデフォルトのルーブリック文章にフォールバックする。

3. **Supabase pgvector の ivfflat インデックス挙動**: ivfflat は approximate nearest neighbor 検索。exact KNN が必要な場合は `SET enable_indexscan = off` で sequential scan に切り替えられる。教材規模が小さいうちは exact scan の方が速い可能性があるため、初期は `WITH (lists = 10)` など小さい lists で試す。

4. **GEMINI_API_KEY の枠**: embed バッチは一括実行で済み token 量は微量（Section 7 参照）。採点 API の embed（ユーザーリクエスト毎）は Claude に対する embed なので Gemini の別 quota で処理される。両方 `logic/.env` の `GEMINI_API_KEY`（keita.urano2@gmail.com）を使う。Billing 紐付け済みのため Free tier の `limit: 0` 問題は発生しない。

**レイテンシ**:
Phase 2 の採点フロー: embed クエリ（Gemini API ~100ms）+ pgvector 検索（~10ms）+ Claude Haiku（~1,500ms）= 約 1.6〜2.5 秒。Phase 1（Claude のみ）より 100〜200ms 増加するが UX 上許容範囲。フロント側はローディングスピナーを必ず出す。

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
- logicalWritingLessons.ts（対象コース）: `src/logicalWritingLessons.ts:34-`
- user_wrong_answers スキーマ（Phase 3 弱点活用）: `supabase/migrations/023_user_wrong_answers.sql`
- Gemini API キー: `logic/.env` の `GEMINI_API_KEY`（keita.urano2@gmail.com アカウント）
- embed スクリプト配置先（Phase 2 で新設）: `scripts/embed-writing-lessons.ts`
- migration 配置先（Phase 2 で追加）: `supabase/migrations/038_writing_score_rag.sql`
