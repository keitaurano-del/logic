# Apollo 開発フロー実行手順

## 概要
Keita-san からタスクが来たら、このフローで実装 → QA → レビューを回す。
**絶対に Reviewer APPROVED なしで「完了しました」と言わない。**

---

## フロー実行手順（sessions_spawn を使う）

### Step 1: 実装サブエージェント起動

```
sessions_spawn(
  runtime: "acp",
  agentId: "claude",
  mode: "run",
  task: """
あなたは Logic アプリの CTO (実装担当) です。以下のルールと知識に従ってください。

## あなたのルール
<CTO_RULES の内容をそのまま貼る>

## 過去の知識
<CTO_KNOWLEDGE の内容をそのまま貼る>

## 今回のタスク
<Keita-san の指示をそのまま貼る>

## 作業ディレクトリ
/home/work/.openclaw/workspace/logic

## 完了条件
1. `npm run build` でビルドエラーゼロ
2. develop ブランチへ commit & push 完了
3. 最後に「実装完了 commit: <hash>」と報告すること
"""
)
```

### Step 2: QAサブエージェント起動（実装完了後）

```
sessions_spawn(
  runtime: "acp",
  agentId: "claude",
  mode: "run",
  task: """
あなたは Logic アプリの QAエンジニアです。以下のルールと知識に従ってください。

## あなたのルール
<QA_RULES の内容をそのまま貼る>

## Keita-san 過去指摘（必読）
<QA_KNOWLEDGE の内容をそのまま貼る>

## 今回のテスト対象
- 変更コミット: <Step1で受け取ったcommit hash>
- 変更内容: <タスク説明>
- SIT URL: https://logic-sit.onrender.com

## 完了条件
1. ブラウザで SIT を mobile (390×844) で確認
2. 変更画面 + 主要4タブ（ホーム/レッスン/記録/プロフィール）を全確認
3. スクショを /home/work/.openclaw/workspace/logic/docs/screenshots/ に保存
4. docs/QA_REPORT_<日付>.md を作成
5. 最後に「QA完了 レポート: docs/QA_REPORT_<日付>.md」と報告すること
"""
)
```

### Step 3: レビューサブエージェント起動（QA完了後）

```
sessions_spawn(
  runtime: "acp",
  agentId: "claude",
  mode: "run",
  task: """
あなたは Logic アプリのコードレビューワー（品質ゲートキーパー）です。
以下のルールと知識に従ってください。

## あなたのルール
<REVIEWER_RULES の内容をそのまま貼る>

## レビューワー知識
<REVIEWER_KNOWLEDGE の内容をそのまま貼る>

## Keita-san 過去指摘（必読）
<QA_KNOWLEDGE の内容をそのまま貼る>

## 今回のレビュー対象
- コミット: <Step1のhash>
- QA レポート: <Step2のレポートパス>
- 変更内容: <タスク説明>

## 完了条件
QA レポートとスクショを精査し、以下のいずれかで報告すること：
- APPROVED: 指摘ゼロ、Keita-san に見せられる品質
- REJECTED: QA に差し戻し（理由と再テスト範囲を明示）
- BLOCKED: CTO に修正依頼（バグ内容と修正方針を明示）
"""
)
```

---

## ループ制御

| Reviewer判定 | Apolloのアクション |
|-------------|-----------------|
| APPROVED | Keita-san に「実装完了・SIT確認済み」を報告 |
| REJECTED | QAに差し戻し → Step2からやり直し |
| BLOCKED | 実装に修正依頼 → Step1からやり直し |
| 3ループ超 | Keita-san にエスカレーション（詳細を添えて） |

---

## 注意事項
- ブラウザが起動していない場合は `systemctl --user start openclaw-browser` してから QA を起動する
- スクショ保存先: `/home/work/.openclaw/workspace/logic/docs/screenshots/`
- QAレポート保存先: `/home/work/.openclaw/workspace/logic/docs/QA_REPORT_YYYYMMDD.md`
