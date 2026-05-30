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
| `seed.sql` | Phase 2b: service_role が使えない環境向け。MCP / SQL Editor から流す seed（`seed.ts` と同内容を SQL に焼き直し・決定的 UUID・冪等） |
| `cleanup.sql` | Phase 2b: 同じく MCP / SQL Editor から流す cleanup |

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

---

## SQL 版（MCP 実行 / Phase 2b）

`service_role` キーが使えない環境では `seed.ts` / `cleanup.ts`（admin API 依存）が走らない。
その代わりに `seed.sql` / `cleanup.sql` を Supabase MCP（`execute_sql`）または Supabase SQL Editor から
直接流す。投入内容・タグ付けは tsx 版と同一。

### tsx 版との違い

- ユーザー UUID は決定的（`extensions.uuid_generate_v5(DNS名前空間, 'logic-dogfood-20260530:pNN')`）。
  同じペルソナは何度流しても同じ UUID になり、再実行・cleanup と一意に対応する。
- `auth.users` / `auth.identities` を直接 INSERT する（admin API を使わない）。
  `email_confirmed_at = now()` 済み、`encrypted_password` はダミー固定（マジックリンク方針でパスワードログイン不使用）。
- `auth.users` への INSERT で `public.handle_new_user` トリガが profiles の骨組みを先に作るため、
  profiles は `ON CONFLICT (id) DO UPDATE` で正しい値に上書きする。
- 冪等手段はテーブルごとに使い分け:
  - UNIQUE/PK のあるもの（users / identities / profiles / user_progress / user_placement / subscriptions / admin_overrides）→ `ON CONFLICT ... DO NOTHING|UPDATE`
  - serial PK で重複判定列が本文のもの（fermi_answers / feedback）→ `WHERE NOT EXISTS`（`[DOGFOOD:pNN]` prefix で判定）

### p01 だけ先に流す手順

`seed.sql` はペルソナ毎に `-- ===== pNN =====` のコメント区切りがある。検証目的でまず p01 だけ流す場合:

1. ファイル冒頭の「ヘッダ: 拡張」ブロック（`create extension if not exists ...`）を1回流す。
2. `-- ===== p01 =====` から `-- ===== p02 =====` の直前までを選択して流す。
3. 検証クエリ（ファイル末尾のコメント、`-- select count(*) ...`）で p01 の行が入ったか確認:
   - `select * from auth.users where email='dogfood+p01@logic-test.local';`（1 行）
   - `select * from public.profiles where nickname='佐藤ハル';`（occupation=学生 / birth_year=2003）
   - `select count(*) from public.fermi_answers where question_text like '[DOGFOOD:p01]%';`（3 行）
4. 問題なければ p02〜p20 のブロックを続けて流す（全文を一括でも可。冪等なので p01 を再度含めても重複しない）。

### MCP からの実行例

```text
mcp Supabase execute_sql
  project_id = yctlelmlwjwlcpcxvmgx
  query      = <seed.sql の該当ブロック>
```

SQL Editor を使う場合はファイルを貼り付けて Run。`cleanup.sql` も同様に丸ごと流せば全テストユーザーが消える。

### 投入予定の行数（テーブル別・全 20 体）

| テーブル | 行数 |
|---|---|
| auth.users | 20 |
| auth.identities | 20 |
| profiles | 20（トリガ生成を上書き） |
| user_progress | 20 |
| user_placement | 20 |
| fermi_answers | 117 |
| subscriptions | 9（有料 9 体: p02,p04,p06,p09,p12,p13,p15,p18,p20 … trial 含む） |
| admin_overrides | 9 |
| feedback | 20 |

※ subscriptions / admin_overrides は「有料扱い（paid_monthly / paid_yearly / trial）」のペルソナのみ。
  対象は p02(trial), p04, p06, p09, p12, p13, p15, p18, p20 の **9 体**。
