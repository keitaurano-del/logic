# Apollo AI提案 → 承認 → Jira起票 自動化フロー (SCRUM-90)

## 概要

ApolloがLogicアプリの改善を提案し、Keita-sanの承認を経てJiraへ自動起票されるフロー。

---

## フロー図

```
Apollo提案
   ↓
Teamsの💡プロダクトチャンネルに投稿
   ↓
Keita-sanが「承認」または「却下」でリアクション or 返信
   ↓
Power Automate Webhook → /api/jira-create エンドポイント
   ↓
Jira SCRUM プロジェクトに自動起票
   ↓
Teamsの🔨ビルド管理チャンネルに「起票完了」通知
```

---

## 起票ルール

| 提案タイプ | Jira Issue Type | 優先度 |
|-----------|----------------|--------|
| バグ修正提案 | Bug (10007) | High |
| 新機能提案 | Story (10004) | Medium |
| UX改善 | Story (10004) | Medium |
| 技術的負債 | Story (10004) | Low |

---

## server/index.ts エンドポイント仕様

```
POST /api/jira-create
Authorization: Bearer <JIRA_WEBHOOK_SECRET>

Body:
{
  "summary": "チケットタイトル",
  "description": "詳細説明（ADF形式 or plain text）",
  "issueType": "Story" | "Bug",
  "priority": "High" | "Medium" | "Low",
  "labels": ["apollo-proposal"],
  "proposedBy": "apollo"
}

Response:
{
  "key": "SCRUM-XXX",
  "url": "https://logic.atlassian.net/browse/SCRUM-XXX"
}
```

---

## 実装状況

- [ ] server/index.ts に `/api/jira-create` エンドポイント追加
- [ ] Jira API Token を環境変数 `JIRA_API_TOKEN` / `JIRA_EMAIL` に設定（Render環境変数）
- [ ] Teams Power Automate フローの設定（承認リアクション検知）
- [ ] `/api/jira-create` への認証トークン設定

---

## 環境変数（Render + .env.local）

```
JIRA_EMAIL=keita.urano@gmail.com
JIRA_API_TOKEN=<Jira API Token>
JIRA_URL=https://logic.atlassian.net
JIRA_PROJECT_KEY=SCRUM
JIRA_WEBHOOK_SECRET=<ランダム文字列>
```

---

## Apollo運用ルール

1. 提案はTeamsの💡プロダクトチャンネルに投稿する
2. 投稿フォーマット:
   ```
   【提案】<タイトル>
   タイプ: 新機能 / バグ修正 / UX改善 / 技術的負債
   
   <詳細説明>
   
   期待効果: <ユーザー影響・ビジネス価値>
   工数見積: <小 / 中 / 大>
   ```
3. Keita-sanの承認後（Teams返信「承認」または👍リアクション）、自動起票
4. 起票されたチケットIDをメモリに記録し、実装時に紐付ける
