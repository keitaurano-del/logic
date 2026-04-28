# レビューログ

## 2026-04-19 — 初回ビジュアルレビュー（Apollo）

### 発見・修正したバグ

| # | 場所 | 問題 | 修正 |
|---|------|------|------|
| 1 | `server/index.ts` | `/api/daily-fermi` 等が HTML を返す（APIルートより前にキャッチオールが存在） | キャッチオールを全APIルートの後に移動、`/api/` prefix に 404 ガード追加 |
| 2 | `RoadmapScreen.tsx` | PATHS の lessonID が全てずれていた（フェルミ路に So What/Why So 等が入っていた） | 正しい lessonId に修正（20=MECE, 21=ロジックツリー, 22=SoWhat, 23=ピラミッド, 24-27=ケース/演繹/帰納/形式論理） |
| 3 | `RoadmapScreen.tsx` | 進捗カウンターが更新されない（`"lesson-22"` vs `"22"` のキー形式不一致） | completedSet に両形式を格納 |
| 4a | `RankingScreen.tsx` | 今週の記録が `i < todayDow` で常に過去日全チェック | `getStudyDates()` と実日付照合に修正 |
| 4b | `HomeScreen.tsx` | 同上 | 同様に修正、`getStudyDates` import 追加 |
| 5 | `ProfileScreen.tsx` | プランが常に「Standard — ¥500/月」とハードコード | `getSubscriptionState()` から動的に取得 |
| 6 | `RankingScreen.tsx` | 最近の活動がダミーデータ固定（今日の一問フェルミ / MECE 入門） | `getCompletedLessons()` 実データから生成 |
| 7 | `server/index.ts` | デイリーフェルミのヒントが「問題が存在しません」と返る（コンテキストなし） | 問題文を先に生成してからヒントプロンプトに含める形に変更 |
| 8 | `HomeScreen.tsx` | カテゴリカードの lessonIds が誤マッピング（フェルミ推定路に So What 等） | fermi: [25,26,27,24]、logic: [20,21,22,23] に修正 |
| 9 | `RankingScreen.tsx`, `ProfileScreen.tsx` | プレースメントテスト未完了でも「Top 50%」表示（deviation デフォルト値 50 が原因） | deviation デフォルトを null に変更、topPct も null で非表示 |

### コミット履歴
- `3169083` fix: critical bugs from Apollo visual review (Bug 1-4)
- `4f94028` fix: more bugs from Apollo visual review (Bug 5-6, 4b)
- `df5a3d2` fix: daily-fermi hint uses question as context + HomeScreen lessonIds (Bug 7-8)
- `894af67` fix: Top 50% shown for users without placement test result (Bug 9)

### 残課題
- Supabase にキャッシュされた壊れたヒントは手動で削除済み（2026-04-19）
- `weekProgress = Math.min(7, streak)` がstreakベース — 今週の実学習日数に変えるとより正確（軽微）

---

## 2026-04-28 15:20 JST — 自律チェック（Apollo）

### 状況
- developブランチ最新コミット: `04b9916`（fix: catch any→unknown全22箇所）
- REVIEW_20260428_v3.md: **APPROVED**（2026-04-28 09:15 JST）
- mainとの差分: 242 files changed, +19,032 / -1,611

### アクション
- Keita-sanへ本番デプロイ承認リクエストをSlack DMに送信済み
- 承認待ち状態

## 2026-04-28 15:37 JST — 自律チェック（Cron Apollo）

### 状況
- developブランチ最新コミット: `04b9916`（前回チェックから変化なし）
- REVIEW_20260428_v3.md: **APPROVED**（変化なし）
- フェーズ: **本番デプロイ承認待ち**

### アクション
- Keita-sanへSlack DMで本番デプロイ承認を再度リクエスト送信済み（15:37 JST）
- Keita-sanの「承認」を受け次第、develop → main マージ＋デプロイ実行予定

---

## 2026-04-28 16:38 JST — 自律チェック（Cron Apollo）

### 状況
- developブランチ最新コミット: `04b9916`（変化なし、3回連続同一）
- REVIEW_20260428_v3.md: **APPROVED**（09:15 JST から変化なし）
- フェーズ: **本番デプロイ承認待ち（7時間以上）**
- 直近Slack通知: 15:20、15:37 JST に送信済み

### アクション
- 承認待ち状態が長期化しているため、16:38 JSTに改めてSlack DMへエスカレーション送信
- 次のcronチェックまでに承認なければ次の判断を行う

---

## 2026-04-28 17:39 JST — 自律チェック（Cron Apollo）

### 状況
- developブランチ最新コミット: `04b9916`（変化なし、4回連続同一）
- REVIEW_20260428_v3.md: **APPROVED**（09:15 JST から約8時間半変化なし）
- フェーズ: **本番デプロイ承認待ち（長期化）**
- 送信済み通知: 15:20、15:37、16:38、17:39 JST（計4回）

### アクション
- 17:39 JSTにSlack DMへ4回目のエスカレーション送信
- 承認待ち継続中。Keita-sanの返答を待つ。

