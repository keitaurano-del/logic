# フィードバック管理フロー設計 (SCRUM-104)

> **最終更新:** 2026-04-29  
> **オーナー:** Apollo (CEO)  
> **ステータス:** 運用中

---

## 1. フィードバック受信経路

```
ユーザー
  │
  ▼
アプリ内フィードバックフォーム
（設定 > フィードバックを送る）
  │
  ▼
Supabase: feedback テーブル
  │
  ├── カテゴリ自動分類（AI判定）
  ├── タイムスタンプ・ユーザーID記録
  └── 通知トリガー（Webhook → Slack/Teams）
```

### feedback テーブルスキーマ（参考）

| カラム | 型 | 説明 |
|--------|----|------|
| id | uuid | PK |
| user_id | uuid | FK → users |
| category | text | bug / content_error / improvement / other |
| content | text | フィードバック本文 |
| screen_context | text | 送信時の画面（例: lesson_detail） |
| app_version | text | アプリバージョン |
| status | text | new / in_review / jira_created / resolved / closed |
| jira_issue_key | text | 紐づくJiraチケット番号 |
| created_at | timestamptz | 受信日時 |
| updated_at | timestamptz | 最終更新日時 |

---

## 2. フィードバックのカテゴリ分類

| カテゴリ | 定義 | 優先度の目安 |
|----------|------|-------------|
| 🐛 バグ報告 | アプリが正常に動作しない / クラッシュ / 表示崩れ | 高〜緊急 |
| 📝 コンテンツ誤り | レッスン内容の誤り / 問題の正解ミス / 解説の不正確さ | 中〜高 |
| 💡 改善提案 | UX改善 / 新機能要望 / 既存機能の使い勝手向上 | 低〜中 |
| 📌 その他 | 上記に当てはまらないもの / 一般的な問い合わせ | 要判断 |

---

## 3. 対応フロー

```
[受信]
Supabase feedback テーブルに登録 → status: "new"
      │
      ▼
[Jira起票] ← 毎営業日 Apollo が確認（または通知で即対応）
Jira にチケット起票（SCRUM プロジェクト）
feedback.status → "jira_created"
feedback.jira_issue_key に紐づけ
      │
      ▼
[優先度付け]
バグ: Critical/High → スプリント即追加
コンテンツ誤り: High → 次スプリント以内
改善提案: Medium/Low → バックログ精査後
      │
      ▼
[実装・修正]
担当者アサイン → 開発 → PRレビュー → SITテスト
      │
      ▼
[クローズ]
本番デプロイ確認後 Jira Done → feedback.status: "closed"
ユーザーへの返信（任意、重要なバグ報告者には感謝メッセージ）
```

---

## 4. 週次レビュープロセス

**実施タイミング:** 毎週月曜 JST 9:00  
**担当:** Apollo（AI CEO）  
**報告先:** Microsoft Teams — 🔨ビルド管理チャンネル

### 週次サマリー内容

1. **受信件数サマリー**（前週分 / カテゴリ別集計）
2. **対応中チケット一覧**（Jira key / 優先度 / 担当者）
3. **クローズ件数**（前週中に解決したフィードバック数）
4. **未対応件数**（status: "new" が3日以上のもの）
5. **注目フィードバック**（高頻度テーマや重要提案をピックアップ）
6. **今週の対応方針**（優先対応するフィードバックとアクション）

### 自動投稿設定

- cronジョブ: 毎週月曜 `0 0 * * 1` (UTC = JST 9:00)
- タスク: Supabase から前週フィードバックを集計 → Teams投稿
- 担当 session: Apollo's main session

---

## 5. KPI定義

| KPI | 定義 | 目標値 | 計測周期 |
|-----|------|--------|---------|
| フィードバック受信数 | 期間内に受信した feedback レコード数 | — （参考値として追跡） | 週次 |
| Jira起票率 | 受信件数のうち Jira チケット化された割合 | ≥ 90% | 月次 |
| 対応率 | 起票件数のうち status が "closed" の割合 | ≥ 80% | 月次 |
| 平均対応日数 | Jira起票日から Doneまでの平均日数 | ≤ 14日 | 月次 |
| バグ緊急対応率 | Critical/High バグの 3営業日以内クローズ率 | ≥ 95% | 月次 |
| コンテンツ誤り対応率 | コンテンツ誤り報告の 7営業日以内修正率 | ≥ 90% | 月次 |

---

## 6. エスカレーション基準

- **同一バグへの報告が 5件以上** → 即日 Jira Critical 起票、開発チームに即通知
- **コンテンツ誤りが問題の正解ミス** → 24時間以内に修正デプロイ
- **status: "new" が 7日以上** → Apollo がレビューし方針決定

---

## 関連ドキュメント

- [LESSON_REVIEW_OPS.md](./LESSON_REVIEW_OPS.md) — レッスンコンテンツ見直しフロー
- [DEVELOPMENT_PLAN.md](./DEVELOPMENT_PLAN.md) — 開発計画
- [WORKFLOW-SPEC.md](./WORKFLOW-SPEC.md) — 全体ワークフロー仕様
