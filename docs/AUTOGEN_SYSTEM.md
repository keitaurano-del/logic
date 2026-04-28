# AUTOGEN_SYSTEM.md — AI 問題自動生成システム設計

> SCRUM-83 / 84 / 85 / 68
> 作成日: 2026-04-29

---

## システム概要

LogicアプリのAI問題自動生成システム。**Genspark AI / OpenAI GPT-4o** を使用して、カテゴリ別の論理思考問題を自動生成・蓄積する。

生成された問題は LLM による品質スコア付けを経て、スコアが高い問題は自動承認、低い問題は人間のレビューキューへ流れる。承認済み問題はフロントエンドの `AIProblemGenScreen` から取得・配信される。

---

## アーキテクチャ

```
┌────────────────────┐       ┌──────────────────────┐
│  scripts/          │       │  Supabase            │
│  autogen_problems  │──────▶│  generated_problems  │
│  .py               │ REST  │  (PostgreSQL)        │
│  (Python CLI)      │       └──────────┬───────────┘
└─────────┬──────────┘                  │ approved = true
          │ gsk generate                │
          ▼                             ▼
   Genspark AI /            ┌──────────────────────┐
   OpenAI GPT-4o            │  AIProblemGenScreen  │
   (LLM)                    │  (React Native)      │
                            └──────────────────────┘
```

| コンポーネント | 説明 |
|---|---|
| `scripts/autogen_problems.py` | 生成スクリプト本体 (Python 3.10+) |
| `supabase/migrations/006_generated_problems.sql` | DBマイグレーション |
| `gsk` CLI | Genspark AI へのアクセス |
| Supabase `generated_problems` | 問題ストレージ |
| `AIProblemGenScreen` | フロントエンド配信画面（実装別途） |

---

## Supabase テーブル設計

```sql
CREATE TABLE generated_problems (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  difficulty TEXT CHECK (difficulty IN ('beginner','intermediate','advanced')),
  question TEXT NOT NULL,
  choices JSONB NOT NULL,  -- [{label: string, correct: boolean}]
  explanation TEXT NOT NULL,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  approved BOOLEAN DEFAULT false,
  approved_by TEXT,
  quality_score FLOAT,
  used_count INT DEFAULT 0,
  tags TEXT[]
);
```

### カラム詳細

| カラム | 型 | 説明 |
|---|---|---|
| `id` | UUID | 主キー（自動生成） |
| `category` | TEXT | ロジカルシンキング / ケース面接 / クリティカルシンキング / 仮説思考 |
| `difficulty` | TEXT | `beginner` / `intermediate` / `advanced` |
| `question` | TEXT | 問題文（200文字以内推奨） |
| `choices` | JSONB | `[{label: string, correct: boolean}]` 選択肢4つ、正解1つ |
| `explanation` | TEXT | 解説（300文字以内推奨） |
| `generated_at` | TIMESTAMPTZ | 生成日時（UTC） |
| `approved` | BOOLEAN | 承認済みフラグ（フロントに配信する場合は true のみ） |
| `approved_by` | TEXT | `"auto"` or レビュアーの UID |
| `quality_score` | FLOAT | LLM 自己評価スコア（0.0〜1.0） |
| `used_count` | INT | フロントエンドで表示された回数 |
| `tags` | TEXT[] | 例: `["MECE", "ロジックツリー"]` |

### Row Level Security (RLS)

```sql
-- 承認済み問題は全認証ユーザーが参照可能
CREATE POLICY "approved_problems_select" ON generated_problems
  FOR SELECT
  USING (approved = true);
```

管理操作（INSERT / UPDATE）はサービスロールキー経由でのみ実行。フロントエンドアノンキーからの書き込みは不可。

---

## 生成スクリプト仕様

**ファイル**: `scripts/autogen_problems.py`

### 実行方法

```bash
# 環境変数を設定
export SUPABASE_URL="https://xxxx.supabase.co"
export SUPABASE_SERVICE_KEY="your-service-role-key"

# 5問生成（デフォルト）
python3 autogen_problems.py --category ロジカルシンキング --difficulty intermediate

# 10問生成
python3 autogen_problems.py --category ケース面接 --difficulty advanced --count 10

# dry-run（保存せず確認のみ）
python3 autogen_problems.py --category 仮説思考 --difficulty beginner --dry-run

# 品質チェックをスキップ（高速）
python3 autogen_problems.py --category ロジカルシンキング --difficulty beginner --skip-quality-check
```

### フロー

```
1. argparse で CLI 引数を受け取る
      ↓
2. gsk CLI を subprocess で呼び出して問題生成
   - バッチサイズ: 10問/回
   - JSON 配列形式で出力
      ↓
3. 品質チェック（別プロンプトで LLM 自己評価）
   - quality_score: 0.0〜1.0
      ↓
4. 承認判定
   - quality_score >= 0.8 → approved = true (自動承認)
   - quality_score < 0.8  → approved = false (手動レビュー待ち)
      ↓
5. Supabase REST API で INSERT
```

### 入出力

| 項目 | 内容 |
|---|---|
| **入力** | `--category`, `--difficulty`, `--count` |
| **出力** | Supabase `generated_problems` テーブルへの INSERT |
| **使用モデル** | `gsk generate` コマンド（Genspark AI） |
| **バッチサイズ** | 10問/回（上限）|
| **品質チェック** | 生成後に別プロンプトで自己評価（0〜1スコア） |
| **自動承認閾値** | `quality_score >= 0.8` |

### 必要な環境変数

```bash
SUPABASE_URL         # Supabase プロジェクト URL
SUPABASE_SERVICE_KEY # Supabase サービスロールキー（RLS バイパス）
```

### 依存パッケージ

```
requests  # pip install requests
gsk CLI   # PATH に gsk が必要
```

---

## 自動生成 Cron 設定（設計のみ、実装は別途）

### スケジュール

| 設定 | 値 |
|---|---|
| 実行タイミング | 毎日 **JST 3:00**（= UTC 18:00 前日） |
| 対象カテゴリ | 4カテゴリ（下記） |
| 1カテゴリあたり生成数 | 5問 |
| 合計 | 20問/日 |

### 対象カテゴリ

1. ロジカルシンキング
2. ケース面接
3. クリティカルシンキング
4. 仮説思考

### openclaw cron コマンド例（実装時に使用）

```bash
openclaw cron add \
  --schedule "0 18 * * *" \
  --name "autogen-problems-daily" \
  --command "cd /home/work/.openclaw/workspace/logic && python3 scripts/autogen_problems.py --category ロジカルシンキング --difficulty intermediate --count 5 && python3 scripts/autogen_problems.py --category ケース面接 --difficulty intermediate --count 5 && python3 scripts/autogen_problems.py --category クリティカルシンキング --difficulty intermediate --count 5 && python3 scripts/autogen_problems.py --category 仮説思考 --difficulty intermediate --count 5"
```

> ⚠️ 実際の cron 登録は `SUPABASE_URL` / `SUPABASE_SERVICE_KEY` の設定確認後に行う。

---

## フロントエンド連携（配信側）

`AIProblemGenScreen` から `generated_problems` テーブルを取得する際のクエリ例:

```typescript
const { data } = await supabase
  .from('generated_problems')
  .select('*')
  .eq('approved', true)
  .eq('category', selectedCategory)
  .eq('difficulty', userDifficulty)
  .order('generated_at', { ascending: false })
  .limit(10)
```

表示後は `used_count` をインクリメントして重複表示を避ける:

```typescript
await supabase
  .from('generated_problems')
  .update({ used_count: currentCount + 1 })
  .eq('id', problemId)
```

---

## 手動レビューフロー（pending 問題の確認）

承認待ち問題を確認・承認するための Supabase SQL:

```sql
-- レビュー待ち問題一覧
SELECT id, category, difficulty, question, quality_score, generated_at
FROM generated_problems
WHERE approved = false
ORDER BY quality_score DESC, generated_at DESC;

-- 手動承認
UPDATE generated_problems
SET approved = true, approved_by = 'keita-urano'
WHERE id = 'target-uuid';

-- 低品質問題を削除
DELETE FROM generated_problems
WHERE approved = false AND quality_score < 0.5;
```

---

## 今後の拡張（Backlog）

- [ ] Slack 通知: 日次生成レポートを DM で送信
- [ ] 難易度別 cron: beginner/advanced も定期生成
- [ ] A/B テスト: `used_count` を活用して問題の人気度計測
- [ ] 管理画面: Supabase Studio 以外の承認 UI（低優先度）
- [ ] 多言語対応: 英語問題の自動生成（`category_en` カラム追加）
