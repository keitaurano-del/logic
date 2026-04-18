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
