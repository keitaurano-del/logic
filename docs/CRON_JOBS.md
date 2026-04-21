# cronジョブ一覧

最終更新: 2026-04-21 22:25 JST

---

## 稼働中（enabled）

### Notion日次同期
- **ジョブID**: 5a96aa3c
- **スケジュール**: 毎日 05:30 JST
- **内容**: Logic配下のドキュメント変更をNotionに反映。CXO成長トラッカーも更新
- **配信**: announce（チャットに報告）

### モーニングブリーフィング（コンサル・金融）
- **ジョブID**: cd453ab2
- **スケジュール**: 毎日 08:00 JST
- **内容**: コンサル業界・金融業界・AI動向の最新ニュースを調査して報告
- **配信**: webchat
- **⚠️ 状況**: エラー中（複数チャネル設定時のchannel指定エラー。連続5回失敗）

### オンボーディング Day7（1回限り）
- **ジョブID**: 740cd3eb
- **スケジュール**: 2026-04-22 15:08 JST（1回実行後削除）
- **内容**: 最初の7日間の振り返りサマリーをメール送信
- **配信**: email → keita.urano2@gmail.com

---

## 待機中（disabled）

### CMO: X投稿案作成
- **ジョブID**: 43bee06d
- **スケジュール**: 毎日 06:30 JST
- **内容**: X戦略に基づいて当日の投稿案を1〜2本作成し、Slackに送信
- **配信**: なし（Slack webhook直接送信）
- **有効化条件**: X初投稿後

### CTO: SIT環境チェック
- **ジョブID**: 234b0094
- **スケジュール**: 毎日 06:00 JST
- **内容**: SIT環境の動作確認、最新コミット確認、異常検知
- **配信**: なし
- **有効化条件**: X投稿開始と同時期

---

## 終了・エラー停止（disabled, 1回限り）

| ジョブID | 名前 | 予定日 | 状態 |
|---|---|---|---|
| 49450d66 | onboarding-day2 | 4/17 | エラー停止（channel_not_found） |
| 4f7b8b94 | onboarding-day3 | 4/18 | エラー停止（channel_not_found） |
| 17e48acd | onboarding-day4 | 4/19 | エラー停止（channel_not_found） |
| 0e557e46 | onboarding-day5 | 4/20 | エラー停止（channel_not_found） |
| fc45e1e9 | onboarding-day6 | 4/21 | エラー停止（channel_not_found） |
| 1567bb03 | GitHub Actions確認 | 4/16 | エラー停止（配信先未指定） |

---

## 要対応

1. **モーニングブリーフィング**: delivery.channel を修正する必要あり（slack or genspark-im を明示的に指定）
2. **オンボーディング系**: email配信が channel_not_found で全滅。emailチャネルの設定確認が必要
3. **CMO/CTO**: X初投稿後に有効化する
