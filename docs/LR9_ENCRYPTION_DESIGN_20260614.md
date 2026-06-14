# LR-9 設計案: 機微データの暗号化・保持TTL（2026-06-14 / Son）

> ステータス: **設計提案（実装は Keita の Go 後）**。実装は既存ユーザーデータの不可逆マイグレを伴うため、本書の方針合意後に段階実施する。

## 1. 背景・脅威モデル
改善レビュー #41: `daily_journals` 等のセンシティブ列が**平文・無期限保持**。`set_updated_at` の `search_path` 未固定（linter 赤）。

守りたい脅威:
- **at-rest 漏洩**: DB バックアップ流出、`metabase_readonly` の `BYPASSRLS`（#39 / LR-7 で要レビュー）等、RLS を迂回して全 PII を読まれる経路。
- これらで**日記本文（気分・内省・予定）が平文で読める**のが最大の問題。

## 2. 調査で判明した制約（重要）
- **AI 機能はジャーナル平文を DB から読まない**。`/api/journal/summarize`・`/holistic-feedback` は **`req.body`** でクライアントから本文を受け取り Anthropic に送る（`server/routes/journal.ts:189,325`）。→ **DB を暗号化しても AI 機能は壊れない**（AI はクライアントの平文を使う）。
- **クライアントは `daily_journals` を Supabase で直読みして同期**（`syncService.ts`）。→ 列を暗号文にするなら**クライアントが復号できる必要**がある。
- 認証は**マジックリンク専用**（パスワード無し）＋**複数端末同期**あり。→ 鍵は「端末ローカルのみ」では多端末で破綻。「ユーザのパスワード由来」も不可（パスワード無し）。**鍵はサーバが認証連動で配布する方式が必要**。

## 3. 対象データ
| テーブル.列 | 内容 | 暗号化 |
|---|---|---|
| daily_journals.morning_memo | 朝の予定メモ（自由記述） | ✓ |
| daily_journals.schedule_notes | 予定 | ✓ |
| daily_journals.evening_reflection | 夜の振り返り（内省） | ✓ |
| daily_journals.ai_summary | AI生成要約（本文由来） | ✓ |
| daily_journals.mood / weather | 1-5 / enum | △（単体では機微薄・要否は判断） |
| daily_journals.steps_count/sleep_* | 健康データ（016） | ✓（健康データ＝Play 健康ポリシー対象） |

## 4. 設計オプションと推奨
| 案 | 概要 | at-rest防御 | AI | 多端末 | 鍵管理 | 復旧性 |
|---|---|---|---|---|---|---|
| A. クライアント側暗号＋**サーバ配布DEK**（推奨） | per-user データ鍵(DEK)をサーバが認証連動で配布、暗号/復号は端末。DBは暗号文のみ | 強（DB/バックアップ/BYPASSRLSは暗号文のみ） | ◯（平文はreq.body） | ◯（各端末が同じDEK取得） | エンベロープ（master key in env/Vault→DEK） | ◯（サーバ保持で鍵紛失=全消失を回避） |
| B. at-rest（サーバ保持鍵で復号可） | サーバが暗号/復号、クライアントは journal を**サーバAPI経由**で読む | 強 | ◯ | ◯ | env master key | ◯ |
| C. DB列暗号（pgcrypto / Supabase Vault） | DB層で透過暗号 | 中（鍵がDB近傍だと同時流出リスク） | ◯ | ◯ | DB/Vault | ◯ |

**推奨 = A（クライアント側暗号＋サーバ配布DEK / エンベロープ暗号）**
- 理由: ①現状クライアントが `daily_journals` を直読み同期する構造を維持できる ②AI 非破壊 ③多端末対応 ④DB/バックアップ/BYPASSRLS いずれの at-rest 漏洩でも暗号文のみ ⑤鍵がサーバ保持なのでマジックリンク認証でも復旧可能（端末ローカル鍵のような「鍵紛失=日記全消失」を避けられる）。
- 残存リスク: サーバ（master key + DB 同時）が侵害されると平文復元可能。ただし現状の「BYPASSRLS/バックアップで即平文」よりはるかに高い壁。許容範囲と判断。**ここが主要な判断ポイント**（より強い E2E＝サーバも読めない、にするとパスワード/復旧フローの新設が要り日記消失リスクと UX 負担が大きい）。

## 5. 鍵管理（案A・エンベロープ暗号）
- **Master Key (KEK)**: サーバ env（`JOURNAL_MASTER_KEY`、32バイト）または Supabase Vault。Render env 管理。ローテーション手順を用意。
- **per-user DEK**: ユーザ作成時に乱数生成 → KEK で暗号化して `user_keys`（新規・RLS service-role限定）に保存。
- **配布**: クライアントは認証後 `GET /api/journal/key`（`resolveAuthedUser` で本人のみ）で DEK を取得しメモリ保持（localStorage には平文鍵を置かない／置くなら端末保護下で要検討）。
- **暗号方式**: AES-256-GCM（列ごとに iv＋tag＋ciphertext を base64 で 1 列に格納、もしくは `*_enc` 列を新設）。Web Crypto API（クライアント）。

## 6. マイグレーション戦略（不可逆を避ける段階移行）
1. **スキーマ**: 暗号文用に列追加（`morning_memo_enc text` 等）or 既存列を暗号文で上書き（`*_enc` 追加を推奨＝ロールバック容易）。`user_keys` テーブル新設。`set_updated_at` を `search_path` 固定版に再定義（#41・即実施可）。
2. **デュアルライト期**: アプリ更新後、**新規書込は暗号文（_enc）に**。読みは「_enc あれば復号、無ければ平文列」。既存平文は温存（無停止）。
3. **バックフィル**: バッチで既存行を暗号化（DEK で _enc に書込）。冪等・再開可能・ドライラン付き。完了確認まで平文列は残す（**可逆**）。
4. **平文撤去**: バックフィル＋検証完了後、別マイグレで平文列を drop（ここで初めて不可逆＝最終段で Keita 承認）。
- 各段階は別マイグレ（`039_*` 〜）。**手動適用**（`db:migrate`）なので Keita がレビュー後に流す。

## 7. 保持TTL
- ポリシーを決める（例: 日記は無期限／健康データは N か月）。`scripts/cleanup-retention.js`（LR-5 で雛形あり）に対象を追加し Render cron 化。**TTL 値は Keita 判断**（プロダクト方針）。プライバシーポリシー（LR-4）の保持期間記述と整合させる。

## 8. set_updated_at の search_path 固定（#41・低リスク先行可）
- `012_journal_goals.sql` の `set_updated_at()` が `set search_path` 無し＝可変 search_path 脆弱性。`create or replace function set_updated_at() ... set search_path = public`（or `= ''`）に再定義する 1 マイグレ。**他施策と独立・低リスクなので先行実施可**。

## 9. Keita 判断ポイント
1. **暗号モデル**: 案A（サーバ保持鍵で復旧可・サーバは技術的に読める）で良いか、より強い E2E（サーバも読めない・ただし鍵紛失=日記消失リスク＋復旧フロー新設）を望むか。**推奨は A**。
2. **対象**: mood/weather も暗号化するか（単体では機微薄）。
3. **保持TTL**: 日記・健康データの保持期間（プライバシーポリシーと整合）。
4. **鍵保管**: env (`JOURNAL_MASTER_KEY`) で良いか、Supabase Vault 等を使うか。

## 10. 段階計画（合意後）
- **Phase 0（低リスク・先行可）**: `set_updated_at` search_path 固定（#41）。
- **Phase 1**: スキーマ（_enc 列＋user_keys）、鍵配布 API、クライアント暗号/復号、新規書込を暗号化（デュアルライト）。
- **Phase 2**: 既存行バックフィル暗号化（ドライラン→適用）。
- **Phase 3**: 平文列 drop（最終・要承認）＋保持TTLの cron 化。

---
本書合意後、Phase 0（search_path）から着手します。暗号モデル（案A/E2E）と TTL 方針だけ先に決めていただければ、Phase 1 の実装に進めます。
