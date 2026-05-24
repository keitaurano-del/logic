# 端末間データ同期 設計書

最終更新: 2026-05-23
ステータス: ドラフト（実装着手前、Keita 確認待ち）

別端末で同じアカウントにログインしても、SRS フラッシュカード・誤答リスト・notebook ジャーナル・カテゴリ別 progress・roadmap goals・saved items が引き継がれない問題を解消するための同期実装設計。

---

## 1. 現状の整理

### 1.1 同期対象データ棚卸し

| localStorage キー | 内容 | 既存 DB 同期 | 主な参照箇所 |
|---|---|---|---|
| `logic-stats` | `completedLessons[]` / `studyDates[]` / `studyTimeMs` | あり (`user_progress`) | `syncService.ts:208` で `syncOnLogin` が処理 |
| `logic-placement` | プレースメント結果 + 推奨レッスン | あり (`user_placement`) | 同上 |
| `logic-display-name` | プロフィール表示名 | あり (`profiles.nickname`) | 同上 |
| (Supabase `subscriptions`) | 課金状態 | あり (pull のみ) | `syncSubscriptionFromRemote` |
| `logic-flashcards` | **SRS カード本体** (`interval` / `ease` / `nextReview` / `correctCount` / `wrongCount`) | **なし** | `src/flashcardData.ts:1` |
| `logic-wrong-answers` | 誤答リスト（再出題用 options 含む） | **なし** | `src/wrongAnswerStore.ts:8` |
| `logic-notebook` | ジャーナル AI サマリー + ユーザーメモ | スタブのみ (`getNotebook` / `saveNotebook`) callsite ゼロ | `src/notebookStore.ts:102, 178` |
| `logic-progress` | カテゴリ別進捗（`ロジカルシンキング` の `totalCards` / `completedCards`） | スタブのみ | `src/progressStore.ts:148, 190` |
| `logic-roadmap` | `goals[]` + `setupDone` | スタブのみ | `src/roadmapStore.ts:161, 268` |
| `logic-saved-items` | レッスン・コース・AI問題のブックマーク | **なし** | `src/savedItemsStore.ts:8` |
| `logic-daily-problem` | 当日のデイリー問題 + 解答状態 | **なし** | `src/dailyProblem.ts` |
| `logic-ai-problems` | AI 生成問題履歴 | あり (`user_ai_problems`) | `src/aiProblemStore.ts` |
| `logic-activity-log` | 学習アクティビティ | **なし**（クライアント分析用） | `src/activityLog.ts` |
| `logic-locale` / `logic-theme` / `logic-v3-preview` / `logic-install-id` / `logic-dev-mode` 他 | UI 設定・端末固有 | 同期不要（端末ローカルで OK） | `syncService.ts:303-323` KEEP_KEYS |

### 1.2 既存スタブ関数（実装済みだが callsite ゼロ）

| 関数 | ファイル | 呼び出し元 |
|---|---|---|
| `loadProgressFromDB(userId)` | `src/progressStore.ts:148` | **ゼロ** |
| `incrementCompletedForUser(userId, category)` | `src/progressStore.ts:167` | **ゼロ** |
| `migrateLocalStorageToSupabase(userId)` | `src/progressStore.ts:190` | **ゼロ** |
| `loadEntriesFromDB(userId)` | `src/notebookStore.ts:102` | **ゼロ** |
| `upsertEntryForUser(userId, entry)` | `src/notebookStore.ts:119` | **ゼロ** |
| `deleteEntryForUser(userId, id, date)` | `src/notebookStore.ts:139` | **ゼロ** |
| `getEntryByDateFromDB(userId, date)` | `src/notebookStore.ts:158` | **ゼロ** |
| `migrateLocalStorageToSupabase(userId)` (notebook) | `src/notebookStore.ts:178` | **ゼロ** |
| `loadRoadmapFromDB(userId)` | `src/roadmapStore.ts:161` | **ゼロ** |
| `selectGoalForUser` / `removeGoalForUser` / `completeStepForUser` / `setTargetDateForUser` / `setDailyMinutesForUser` | `src/roadmapStore.ts:178-262` | **ゼロ** |
| `migrateLocalStorageToSupabase(userId)` (roadmap) | `src/roadmapStore.ts:268` | **ゼロ** |

これらは「2025-Q4 の DB ハイブリッド化準備」として書かれたが、その後の機能追加（SRS 強化・ジャーナルリッチ化）がすべて localStorage 専用で進んだため、結局統合されないまま塩漬けになっている。

### 1.3 既存 DB スキーマと実装のミスマッチ

`supabase/migrations/001_initial_schema.sql:27-32` の `notebooks` テーブル定義:

```sql
create table if not exists public.notebooks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles on delete cascade not null,
  content jsonb default '[]'::jsonb,
  updated_at timestamptz default now()
);
```

これに対し、スタブ実装 `src/db/notebookDb.ts:13-21` が前提とするカラム:

```ts
type NotebookRow = {
  user_id: string
  date: string          // ← schema に存在しない
  ai_summary: string    // ← schema に存在しない
  user_memo: string     // ← schema に存在しない
}
```

**現状の `notebooks` テーブルは実装で前提とするカラムを持っていない。** 仮に `loadEntriesFromDB` を呼び出してもクエリエラーで黙って失敗する（`catch` で握り潰される）。同期実装に着手するなら notebooks スキーマ刷新が前提となる。

`roadmap_progress` テーブルも `node_id text` / `status text` の単純 K-V 形式で、現在の `GoalEntry`（`targetDate` / `dailyMinutes` / `completedSteps[]`）の構造には合わない。

---

## 2. 同期対象データの優先度分け

### クリティカル（マルチデバイス体験の核）

- **SRS フラッシュカード** (`logic-flashcards`) — 端末を変えると SM-2 状態がリセットされる体験が最悪。復習の継続性そのもの
- **誤答リスト** (`logic-wrong-answers`) — 「弱点復習」機能の入口。失われると過去の誤答にアクセスできない
- **カテゴリ別 progress** (`logic-progress`) — マスタリー表示の基礎

### 高（学習継続のために重要）

- **ジャーナル** (`logic-notebook`) — Plus プラン訴求機能。書いた内容が消えるとサブスク解約理由になる
- **roadmap goals** (`logic-roadmap`) — オンボーディング直後に設定する、ユーザー初期投資の高いデータ

### 中（あると嬉しい）

- **saved items** (`logic-saved-items`) — ブックマーク。手動で作り直せるが面倒
- **daily problem** (`logic-daily-problem`) — 日付ベースで毎日リフレッシュされるので消失影響は当日のみ

### 低（端末ローカルで OK）

- `logic-locale` / `logic-theme` / `logic-dev-mode` / `logic-onboarded` 系 / `logic-install-id` — 端末固有の UI / セットアップ状態。同期しない

---

## 3. DB スキーマ設計

### 3.1 新規テーブル

#### `user_flashcards`

SM-2 状態を含む SRS カード本体。

```sql
create table if not exists public.user_flashcards (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  card_key text not null,            -- 既存 client-side id (`${ts}-${rand}`) または `${source}:${front_hash}`
  source text not null,              -- "lesson-21" / "ai-weak" 等
  category text not null,
  front text not null,
  back text not null,
  -- SM-2 state
  interval_days integer not null default 0,
  ease real not null default 2.5,
  next_review date not null,
  correct_count integer not null default 0,
  wrong_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(user_id, card_key)
);
create index user_flashcards_user_due_idx on public.user_flashcards (user_id, next_review);
```

#### `user_wrong_answers`

```sql
create table if not exists public.user_wrong_answers (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  lesson_id integer not null,
  lesson_title text,
  category text,
  question text not null,
  correct_answer text not null,
  selected_answer text,
  explanation text,
  options jsonb,                     -- WrongAnswerOption[] そのまま
  wrong_at timestamptz not null default now(),
  resolved_at timestamptz,
  retry_count integer not null default 0,
  retry_correct_count integer not null default 0,
  unique(user_id, lesson_id, question)
);
create index user_wrong_answers_user_idx on public.user_wrong_answers (user_id, resolved_at, wrong_at desc);
```

#### `user_saved_items`

```sql
create table if not exists public.user_saved_items (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  item_type text not null,           -- 'lesson' | 'course' | 'lesson-step' | 'ai-problem' | 'fermi'
  ref_id text not null,
  title text not null,
  subtitle text,
  image text,
  step_index integer,
  parent_lesson_id integer,
  saved_at timestamptz not null default now(),
  unique(user_id, item_type, ref_id)
);
create index user_saved_items_user_idx on public.user_saved_items (user_id, saved_at desc);
```

### 3.2 既存テーブルの扱い

- **`notebooks`** — 現スキーマは `content jsonb` 単一カラムで実装と不整合。**カラム追加マイグレーション** で `date date` / `ai_summary text` / `user_memo text` を追加し、`unique(user_id, date)` を張る。既存の `content` カラムは削除せず将来削除可能フラグだけ立てる（生本番データ消失防止）
- **`roadmap_progress`** — 現スキーマ (`node_id` + `status`) は使い物にならないので新テーブル `user_roadmap_goals` を新設し、旧 `roadmap_progress` は deprecated として残置
- **`user_progress`** — `logic-stats` はすでに同期済み。`logic-progress`（カテゴリ別マスタリー）は別概念なので JSONB カラム `category_progress` を `user_progress` に追加して相乗りさせる

### 3.3 RLS ポリシー（全新規テーブル共通）

```sql
alter table public.user_flashcards enable row level security;
create policy "flashcards: self only"
  on public.user_flashcards for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
-- user_wrong_answers / user_saved_items / user_roadmap_goals も同じパターン
```

`for all using (auth.uid() = user_id) with check (auth.uid() = user_id)` の 1 ポリシーで select/insert/update/delete を網羅。既存 `001_initial_schema.sql:92` と同じスタイルで統一。

---

## 4. Sync Orchestration 設計

### 4.1 全体方針

- **localStorage は永続キャッシュ**（オフライン対応・初回表示高速化）
- **DB が source of truth**（複数端末間の同期点）
- 書き込み: 「localStorage 先・DB 後（fire-and-forget）」を維持。既存パターン踏襲
- 読み出し（起動時）: 並列 `pullXxx` → ローカルとマージ → 表示

### 4.2 `syncOnLogin` 拡張

現状 `syncService.ts:208` の `syncOnLogin` は 4 種類だけを順次 push/pull する。これを拡張:

```ts
export async function syncOnLogin(userId: string) {
  setSyncUser(userId)
  if (!supabase) return

  // 既存（変更なし）
  await syncSubscriptionFromRemote()
  await syncProgressStats()       // logic-stats ⇔ user_progress
  await syncDisplayName()
  await syncPlacement()

  // 新規: 並列で fetch（network ラウンドトリップ削減）
  await Promise.all([
    syncFlashcards(userId),       // logic-flashcards ⇔ user_flashcards
    syncWrongAnswers(userId),     // logic-wrong-answers ⇔ user_wrong_answers
    syncSavedItems(userId),       // logic-saved-items ⇔ user_saved_items
    syncNotebook(userId),         // logic-notebook ⇔ notebooks (改修後)
    syncRoadmap(userId),          // logic-roadmap ⇔ user_roadmap_goals
    syncCategoryProgress(userId), // logic-progress ⇔ user_progress.category_progress
  ])
}
```

各 `syncXxx` は **その store 内に実装**（既存スタブ `loadXxxFromDB` + `migrateLocalStorageToSupabase` を結合した形）。`syncService.ts` には UI 層の薄い orchestrator だけ残す。

### 4.3 並列 vs 直列の判断

- **並列**: subscription/progress/placement の 3 件は既に直列。追加 6 件を並列で叩く（PostgREST は同一クライアントで複数 HTTP/2 multiplexing が効く）
- **想定 row 数**: ヘビーユーザーで flashcards 500 / wrong_answers 200 / saved 100 / notebook 90 / goals 5 程度。1 リクエスト数十 KB に収まる。ページネーション不要
- **タイムアウト**: 各 `syncXxx` は内部で 10s タイムアウトを持ち、失敗しても他をブロックしない（`Promise.allSettled` 採用候補）

### 4.4 Conflict resolution 戦略

データ性質ごとに異なる戦略を採用する。

| データ | 戦略 | 理由 |
|---|---|---|
| flashcards (SRS state) | **Last-write-wins by `updated_at`** | 別端末で復習した結果を尊重。古い localStorage で上書きしてはいけない |
| wrong_answers | **Union + Last-write-wins for resolved_at** | 誤答は追加されるだけ。`resolved_at` が両側にある場合は新しい方 |
| saved_items | **Union** | 追加 / 削除のみ。tombstone は持たず、削除時は両端で同期 |
| notebook | **per-date last-write-wins by `updated_at`** | 1 日 1 レコード。ユーザーが意図的に書き直した最新を採用 |
| roadmap goals | **Union of `completedSteps` + last-write for metadata** | 別端末で進めたステップは加算的にマージ |
| category_progress | **Max value** | `completedCards` は単調増加。`Math.max(local, remote)` で安全 |

### 4.5 初回ログイン時の 4 ケース

| local データ | DB データ | 挙動 |
|---|---|---|
| あり | なし | localStorage を DB に push（migration） |
| なし | あり | DB を localStorage に pull（hydrate） |
| あり | あり | 上記 4.4 の戦略でマージ → 両側に書き戻し |
| なし | なし | 何もしない |

---

## 5. localStorage → Supabase 移行戦略

### 5.1 既存ユーザー（v1.0.0 リリース後の購入者）への対応

1. **初回マジックリンクログイン直後**に `syncOnLogin` 拡張版を実行
2. 各 store の `migrateLocalStorageToSupabase` を呼び、DB に既存 row があれば 4.4 のマージ戦略、なければ全件 insert
3. 移行完了後、localStorage に `logic-sync-migrated-at: <ISO>` を書き込み、次回以降は通常の `syncOnLogin` ルートに合流

### 5.2 移行中の UI

- 一般ケース（小規模データ）は 1〜2 秒で完了するので **無音**で OK
- ヘビーユーザー判定（flashcards > 200 件 or notebook > 30 件）の場合は `WelcomeScreen` 上にトースト「学習データを同期しています…」を表示
- 移行失敗時もエラー表示はせず、localStorage は維持して次回再試行（既存 catch-and-warn パターン踏襲）

### 5.3 ロールバック

- Phase 1 は **feature flag** (`logic-sync-v2-enabled`) で OFF/ON 切替可能に
- 重大バグ発覚時は `LaunchDarkly` 相当の仕組みがないため、`server/index.ts` で配信する `/api/feature-flags` JSON エンドポイントを新設し、クライアントが起動時にフェッチして判定する設計を別途検討（要 Keita 判断）
- DB 側のロールバックは `truncate user_flashcards / user_wrong_answers / user_saved_items / user_roadmap_goals` で素の状態に戻せる（既存 `notebooks.content` カラムは残しているので最悪 revert 可）

---

## 6. 段階的ロールアウト計画

### Phase 1 — スキーマ追加 + 実装（feature flag OFF）

- 期間: 1.5 週間
- 成果物: migration 022–025、`syncXxx` 関数群、feature flag 機構
- 成功条件: dev/staging で feature flag を手動 ON にして E2E 通過、型チェック / lint クリーン
- ロールバック条件: migration 失敗時のみ。コードは flag OFF なら影響ゼロ

### Phase 2 — 内部テスター限定 ON + dry-run

- 期間: 1 週間
- 対象: Keita 含む内部テスター（Android 内部トラック）
- 成果物: 移行ログを `server/routes/sync-telemetry.ts` で受け取り、Supabase に件数 / レイテンシ / エラーを記録
- 成功条件: 7 日間で同期エラー率 < 1%、ユーザー報告ゼロ
- ロールバック条件: エラー率 > 5% / データ消失報告 1 件以上 → flag OFF へ即切り替え

### Phase 3 — 全ユーザー段階公開

- 期間: 2 週間（25% → 50% → 100%）
- ロールアウトトリガー: `server/index.ts` の feature flag エンドポイントで `userId` hash ベースの割合判定
- 成功条件: 各段階で 48 時間エラー率 < 1% / Crashlytics に新規 crash ゼロ
- ロールバック条件: Phase 2 と同じ閾値

---

## 7. 工数見積もり

| 作業 | 規模 | 期間目安 |
|---|---|---|
| DB スキーマ + RLS（新規 4 テーブル + 既存 2 テーブル改修） | M | 1 週間 |
| 各 store の sync 関数実装 + callsite 統合 | L | 2 週間 |
| 移行戦略 + 進捗 UI + feature flag | M | 1 週間 |
| E2E テスト（multi-device シナリオ）+ 内部テスター検証 | M | 1 週間 |
| **合計** | **L〜XL** | **5〜6 週間** |

---

## 8. リスク・懸念事項

1. **localStorage と DB の整合性破綻** — 書き込みが片側だけ成功するパターン。対策: 全 write を `pushXxx` の戻り値で成否確認し、失敗時は localStorage に `pending` フラグを立てて次回 sync で再試行
2. **Capacitor オフライン挙動** — 現状 `navigator.onLine` チェックなし。flight モードで起動するとあらゆる sync が catch で握り潰される。対策: `@capacitor/network` 導入は CLAUDE.md で禁止されているので、`navigator.onLine` + retry queue で代替
3. **初回 fetch 時間** — ヘビーユーザー（flashcards 1000+）で初回ログインに 3〜5 秒。対策: スプラッシュ後の Welcome 画面で同期完了を待たず非同期に進行させる
4. **Supabase free tier の row 制限** — 500 MB ストレージ上限。ヘビーユーザー 1 万人 × 平均 300 row × 数十バイトで数十 MB 程度。当面問題なし。1 万人を超える前に Pro tier 移行
5. **既存 `notebooks.content` カラムへの書き込み** — 過去のバージョンが書き込んでいる可能性がある。**事前に Supabase で `select count(*) from notebooks where content != '[]'::jsonb` を確認**してデータ有無を判定する必要あり
6. **マルチデバイス同時書き込み**（端末 A・B で同時にカード復習）— 後勝ち。Phase 2 で実例が出れば WebSocket / Realtime 採用を検討。Phase 1 のスコープ外
7. **GDPR / データ削除要求** — `auth.users` 削除で cascade。新規テーブルすべて `on delete cascade` を付与済み（設計）

---

## 9. 実装着手前の確認事項（Keita 判断ポイント）

1. **`notebooks` テーブル改修方針** — カラム追加で対応 vs 新テーブル `user_notebooks` 新設。既存 row のデータ有無確認後に判断
2. **`roadmap_progress` 廃止判断** — `user_roadmap_goals` 新設で OK か、`roadmap_progress` を破棄して同名で作り直すか
3. **feature flag 配信方法** — クライアント側ハードコード環境変数 vs サーバー API `/api/feature-flags` の新設（後者は工数 +0.5 週間）
4. **ヘビーユーザー閾値** — 同期中トースト表示の閾値（flashcards 200 / notebook 30）は妥当か
5. **Phase 3 ロールアウトの割合段階** — 25/50/100 で 2 週間の想定。もっと早めるか遅らせるか
6. **Capacitor オフライン retry queue** — Phase 1 に含めるかフォローアップに回すか
7. **既存ユーザー数の確認** — 移行対象が現時点で何人いるか（Production 公開済みなので Supabase ダッシュボードで確認可能）
8. **同期エラーの可観測性** — `console.warn` 止まりで OK か、Sentry 連携を Phase 1 に含めるか（`src/sentry.ts` は no-op スタブ）

---

## 10. 運用メモ (Phase 3 補記)

### sync_telemetry の insert 経路は API 経由のみ

- `sync_telemetry` テーブルへの insert は `/api/sync-telemetry` (service_role) **のみ** から行う。
- 028 migration では `auth.uid() = user_id` の insert policy が設定されていたが、029 で削除した。クライアントから直接 `supabase.from('sync_telemetry').insert(...)` する経路は禁止。
- 理由: 検証ロジック (userId と token の一致、payload バリデーション、レート制限) を二重メンテにしないため。
- 新しい sync 種別を追加する際は `server/routes/sync-telemetry.ts` の `VALID_SYNC_TYPES` に追加し、クライアントは `sendSyncTelemetry()` 経由で呼ぶ。

### rollout 反映タイミング

- `refreshDeviceSyncFlag` は sessionStorage に 1 回しか fetch しないため、`DEVICE_SYNC_ROLLOUT_PCT` を 25 → 50 → 100 に上げても既ログインユーザーは次のセッション再起動まで反映されない。
- Capacitor アプリは端末再起動か `Force Stop` までセッションが維持される。「rollout 反映は次セッションから」が前提。
- 緊急ロールバック (rolloutPct → 0) でも同様に時間差がある点に注意。

---

## 関連

- 既存 sync 実装: `src/syncService.ts`（progress / placement / displayName / subscription）
- スタブ群: `src/progressStore.ts:148-226`, `src/notebookStore.ts:102-199`, `src/roadmapStore.ts:161-299`
- DB helper: `src/db/progressDb.ts`, `src/db/notebookDb.ts`, `src/db/roadmapDb.ts`
- 既存スキーマ: `supabase/migrations/001_initial_schema.sql`, `supabase/migrations/005_user_progress_sync.sql`
- localStorage キー一覧: `CLAUDE.md` Section "localStorage keys"
