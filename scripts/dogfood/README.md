# Dogfooding seed / cleanup（Phase 2a）

Logic 本番 Supabase（project ref `yctlelmlwjwlcpcxvmgx`）に、20 ペルソナのテストアカウントと
学習データを「厳密にタグ付けして」投入し、終了後に一括クリーンアップするためのスクリプト一式。

## タグ付け方針（Keita 承認済み・2026-05-30）

- auth `user_metadata` = `{ is_test: true, persona: "pNN", batch: "dogfood-20260530" }`
- メール = `dogfood+pNN@logic-test.local`
- フィードバック本文 = `[DOGFOOD:pNN] …` prefix（`feedback` テーブルに user_id 列が無いため本文で識別）+ `source = 'dogfood'`
- 終了後は `is_test` / dogfood メール / `[DOGFOOD:` prefix で一括クリーンアップ可能

## ファイル

| ファイル | 役割 |
|---|---|
| `personas.ts` | 20 ペルソナの投入データ定義（seed の source of truth）。文章像は `docs/dogfooding/personas.md` が正 |
| `seed.ts` | アカウント作成 + progress/fermi/placement + 有料の subscriptions/admin_overrides + feedback を投入 |
| `cleanup.ts` | `is_test` ユーザーと従属データを安全に削除 |

## 必要な環境変数

```
SUPABASE_URL=https://yctlelmlwjwlcpcxvmgx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service role key>   # 環境変数からのみ。ハードコード禁止
```

`seed.ts --dry` は書き込まないので env 不要。`cleanup.ts` はユーザー列挙に service role が要るので
dry でも env 必須。

## 使い方

```bash
# 1) まず投入内容をドライ確認（書き込みゼロ・env 不要）
npx tsx scripts/dogfood/seed.ts --dry

# 2) 本番に1件だけ試す
SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx tsx scripts/dogfood/seed.ts --limit 1

# 3) 問題なければ全20体投入（冪等：再実行しても重複しない）
SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx tsx scripts/dogfood/seed.ts

# クリーンアップ（まず dry で件数確認）
SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx tsx scripts/dogfood/cleanup.ts --dry
SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx tsx scripts/dogfood/cleanup.ts
```

### フラグ

- `--dry` / `--dry-run`: 書き込み/削除をせず、予定内容をログ出力
- `--limit N`（seed のみ）: 先頭 N 体だけ処理

## 冪等性

- `seed.ts` は email で既存ユーザーを探し、いれば再利用（メタデータは最新化）。
- profiles / user_progress / user_placement / subscriptions / admin_overrides は `onConflict` upsert。
- fermi_answers / feedback は「既存 dogfood 分を delete → insert」で重複しない。

## FK 削除挙動（cleanup の根拠）

- ほぼ全テーブルが `auth.users` または `profiles` を `ON DELETE CASCADE` で参照 → user 削除で連鎖削除。
- 例外（user 削除では残る）を cleanup が明示削除する:
  - `fermi_answers.user_id` … `SET NULL`（→ user_id で削除）
  - `reports.user_id` … `SET NULL`（→ user_id で削除。dogfood 未投入だが念のため）
  - `feedback` … user_id 列なし（→ `message like '[DOGFOOD:%'` で削除）

## KPI / feedback への影響

- `feedback` は `source = 'dogfood'` + 本文 `[DOGFOOD:]` prefix。本番 KPI・feedback-watcher・Jira 連携は
  これらを除外すること（`source <> 'dogfood'` / 本文 prefix 除外）。
- 有料 KPI（active subscriptions）は `stripe_customer_id like 'dogfood_%'` で除外できる。
  併せて投入ユーザーは `raw_user_meta_data->>'is_test' = 'true'` で全除外可能。
