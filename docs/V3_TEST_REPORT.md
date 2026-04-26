# Logic v3 全画面テスト報告書
> 検証日: 2026-04-27 01:05 JST
> SIT: https://logic-sit.onrender.com/

## チェック観点
- v3ダーク背景が適用されているか
- BottomNavがv3ダークか
- テキスト色がv3トーン（読める）か
- レイアウトが破綻していないか
- 主要操作が動作するか

## 結果

| # | 画面 | screen.type | v3対応 | 動作 | メモ |
|---|---|---|---|---|---|
| 1 | ホーム | home | ✅ | ✅ | 確認済み |
| 2 | コース一覧 | lessons | ✅ | ✅ | 確認済み |
| 3 | レッスン詳細 (Stories) | lesson | ✅ | ⚠️ | summary/diagram未生成 |
| 4 | 記録 | stats | ✅ | ✅ | 確認済み |
| 5 | プロフィール | profile | ✅ | ✅ | 確認済み |
| 6 | カテゴリ詳細 | roadmap | ⚠️ | ⚠️ | ループする |
| 7 | レベル詳細 | rank | ❓ | ❓ | 未確認 |
| 8 | 偏差値 | deviation | ❓ | ❓ | 未確認(廃止対象?) |
| 9 | ランキング | ranking | ❓ | ❓ | 未確認 |
| 10 | ストリーク | streak | ❓ | ❓ | 未確認 |
| 11 | 完了レッスン | completed-lessons | ❓ | ❓ | 未確認 |
| 12 | 学習時間 | study-time | ❓ | ❓ | 未確認 |
| 13 | フェルミ推定 | fermi | ❓ | ❓ | 未確認 |
| 14 | 今日のフェルミ | daily-fermi | ❓ | ❓ | 未確認 |
| 15 | フラッシュカード | flashcards | ❓ | ❓ | 未確認 |
| 16 | AI問題生成 | ai-problem-gen | ❓ | ❓ | 未確認 |
| 17 | AI問題 | ai-problem | ❓ | ❓ | 未確認 |
| 18 | ロールプレイ選択 | roleplay | ❓ | ❓ | 未確認 |
| 19 | ロールプレイチャット | roleplay-chat | ❓ | ❓ | 未確認 |
| 20 | プレースメントテスト | placement-test | ❓ | ❓ | 未確認 |
| 21 | プレースメントワークシート | worksheet | ❓ | ❓ | 未確認 |
| 22 | ジャーナル入力 | journal-input | ❓ | ❓ | 未確認 |
| 23 | 設定 | settings | ❓ | ❓ | 未確認 |
| 24 | アカウント設定 | account-settings | ❓ | ❓ | 未確認 |
| 25 | 通知設定 | notification-settings | ❓ | ❓ | 未確認 |
| 26 | 言語設定 | language | ❓ | ❓ | 未確認 |
| 27 | プラン | pricing | ❓ | ❓ | 未確認 |
| 28 | フィードバック | feedback | ❓ | ❓ | 未確認 |
| 29 | 問題報告 | report-problem | ❓ | ❓ | 未確認 |
| 30 | オンボーディング | onboarding | ❓ | ❓ | 未確認 |
| 31 | ログイン | login | ❓ | ❓ | 未確認 |
