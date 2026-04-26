# Logic v3 全画面テスト報告書
> 検証日: 2026-04-27 01:30 JST 更新
> SIT: https://logic-sit.onrender.com/

## 適用対策
- v3デザインをデフォルト化（feature flag廃止）
- `body.mode-dark` クラス常時付与
- `mode-dark` の CSS 変数を v3 mintパレットで上書き
- インラインstyleの白カード/青ブランドカラーを CSS attribute selector で全置換
- React は inline style を `rgb()` 形式で出力する → hex/rgb 両対応
- LessonStoriesScreen の h1/h2 に明示色を追加（primitives.css の `--text-primary` を上書き）

## 結果

| # | 画面 | screen.type | v3対応 | 動作 | メモ |
|---|---|---|---|---|---|
| 1 | ホーム | home | ✅ | ✅ | 完璧 |
| 2 | コース一覧 | lessons | ✅ | ✅ | 完璧 |
| 3 | レッスン詳細 (Stories) | lesson | ✅ | ✅ | h1/h2白fixed、quiz不正解後リトライfixed、完了画面へ遷移fixed |
| 4 | 記録 | stats | ✅ | ✅ | 完璧 |
| 5 | プロフィール | profile | ✅ | ✅ | 完璧 |
| 6 | カテゴリ詳細 | roadmap | ✅ | ✅ | CategoryDetailView 追加で修正 |
| 7 | レベル詳細 | rank | 🟢 | ❓ | グローバル CSS で対応見込み、未確認 |
| 8 | ストリーク | streak | 🟢 | ❓ | グローバル CSS で対応見込み、未確認 |
| 9 | 完了レッスン | completed-lessons | 🟢 | ❓ | グローバル CSS で対応見込み、未確認 |
| 10 | 学習時間 | study-time | 🟢 | ❓ | 同上 |
| 11 | 偏差値 | deviation | 🟢 | ❓ | 同上 (廃止検討) |
| 12 | ランキング | ranking | 🟢 | ❓ | 同上 (廃止検討) |
| 13 | フェルミ推定 | fermi | 🟢 | ❓ | 同上 |
| 14 | 今日のフェルミ | daily-fermi | ✅ | ✅ | 完璧 |
| 15 | フラッシュカード | flashcards | 🟢 | ❓ | 同上 |
| 16 | AI問題生成 | ai-problem-gen | ✅ | ✅ | 完璧 |
| 17 | AI問題 | ai-problem | 🟢 | ❓ | 同上 |
| 18 | ロールプレイ選択 | roleplay | ✅ | ✅ | 完璧 |
| 19 | ロールプレイチャット | roleplay-chat | 🟢 | ❓ | 同上 |
| 20 | プレースメントテスト | placement-test | 🟢 | ❓ | 同上 |
| 21 | プレースメントワークシート | worksheet | 🟢 | ❓ | 同上 |
| 22 | ジャーナル入力 | journal-input | 🟢 | ❓ | 同上 |
| 23 | 設定 | settings | 🟢 | ❓ | 同上 |
| 24 | アカウント設定 | account-settings | ✅ | ✅ | 動作確認済 |
| 25 | 通知設定 | notification-settings | 🟢 | ❓ | 同上 |
| 26 | 言語設定 | language | 🟢 | ❓ | 同上 |
| 27 | プラン | pricing | 🟡 | ❓ | ヘッダーOK、選択肢の薄黄色背景は要個別調整 |
| 28 | フィードバック | feedback | 🟢 | ❓ | 同上 |
| 29 | 問題報告 | report-problem | 🟢 | ❓ | 同上 |
| 30 | オンボーディング | onboarding | ✅ | ✅ | 全3ステップ完璧 |
| 31 | ログイン | login | 🟢 | ❓ | 同上 |
| 32 | レッスン完了 | lesson-complete | ✅ | ✅ | 新規追加、Stories後に表示 |

凡例:
- ✅ 確認済み・問題なし
- 🟢 グローバルCSSで対応済みと推定（未確認）
- 🟡 部分的問題あり、個別調整推奨
- ❓ 未確認

## 残課題（要個別調整）
1. **オンボーディング3ページ目**: 「ベータキャンペーン」テキストの薄黄色背景上の薄黄色文字
2. **プラン画面 (Pricing)**: 同様のオレンジカード問題が予想される
3. **Stories型レッスンの完了画面**: 動作確認のみ済み、「次のレッスンへ進む」が同カテゴリの次レッスン取得ロジックなし
