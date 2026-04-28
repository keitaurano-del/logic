# ワークフロー仕様書

> Logic モバイル配信プロジェクト | Genspark Workflows / Advanced Workflows 仕様

---

## 概要

| ワークフロー | 種別 | トリガー | アウトプット |
|------------|------|---------|------------|
| `logic-classify-request` | Genspark Workflows | Teams #logic-product 投稿 | 分類結果 → Claw |
| `logic-build-notify` | Genspark Workflows | ビルドスクリプト完了 | #logic-build-ops 通知 |
| `logic-bug-intake` | Genspark Workflows | #logic-bugs 投稿 | 受付確認返信 |
| `logic-release-candidate` | Genspark Workflows | git tag push | #logic-release 通知 |
| `logic-prerelease-check` | Advanced Workflows | #logic-release「リリース準備」 | チェックリスト結果 |
| `logic-store-submit-approval` | Advanced Workflows | Clawからのリリース承認依頼 | 承認待ちフロー |
| `logic-bug-escalation` | Advanced Workflows | P0バグ判定 | Keita-san緊急通知 |
| `logic-exception-handler` | Advanced Workflows | ビルド失敗 / 例外 | エラー対応分岐 |

---

## Genspark Workflows

### 1. `logic-classify-request`

**目的**: Teams に投稿された依頼をCrawlが処理しやすいよう分類する

**トリガー**: `#logic-product` への新規メッセージ

**処理フロー**:
```
1. メッセージ受信
2. 分類判定:
   - 実装依頼 → [implementation]
   - バグ報告 → [bug] → #logic-bugs にリダイレクト
   - 質問/相談 → [question]
   - ビルド依頼 → [build] → #logic-build-ops にリダイレクト
   - リリース依頼 → [release] → #logic-release にリダイレクト
3. Claw に分類結果と元メッセージを渡す
4. 分類結果を #logic-product に返信
```

**Teamsへの返信フォーマット**:
```
📋 受付完了
分類: [実装依頼 / バグ / 質問 / ビルド / リリース]
サイズ: [Small / Medium / Large / 要確認]
Claw が [X分以内] に計画を返します
```

---

### 2. `logic-build-notify`

**目的**: ビルド結果をTeamsに通知する

**トリガー**: `npm run android:release` または手動ビルドスクリプト完了時

**処理フロー**:
```
1. ビルドスクリプトの終了コードを受信
2. 成功の場合:
   - AABファイルサイズ取得
   - versionCode/versionName取得
   - #logic-build-ops に成功通知
3. 失敗の場合:
   - エラーログ取得
   - #logic-build-ops にエラー通知
   - logic-exception-handler を起動
```

**Teams通知フォーマット（成功）**:
```
✅ Android ビルド成功
Version: v{versionName} (vc{versionCode})
AABサイズ: {size}MB
ビルド時刻: {datetime}
次のステップ: Play Console にアップロードしてください
```

**Teams通知フォーマット（失敗）**:
```
❌ Android ビルド失敗
エラー: {error_summary}
ログ: {log_snippet}
Claw が調査します
```

---

### 3. `logic-bug-intake`

**目的**: バグ報告の自動受付確認

**トリガー**: `#logic-bugs` への新規メッセージ

**処理フロー**:
```
1. 投稿受信
2. バグ番号を採番（連番）
3. 受付確認メッセージを返信
4. トリアージのためClaw に通知
```

**Teams返信フォーマット**:
```
🐛 バグ #[番号] 受け付けました
Claw が1時間以内にトリアージ結果を返します
テンプレートに不足がある場合は補足をお願いします
```

---

### 4. `logic-release-candidate`

**目的**: リリース候補をTeamsに通知

**トリガー**: git タグ push (`v*.*.*` 形式)

**処理フロー**:
```
1. git tag 検出
2. CHANGELOG / コミット差分を取得
3. #logic-release に通知
4. Keita-san の承認を待つ
```

**Teams通知フォーマット**:
```
🚀 リリース候補: {version}
主な変更点:
{changelog_summary}

SIT確認URL: https://logic-sit.onrender.com/
承認する場合: 「承認 ✅」と返信してください
```

---

## Advanced Workflows

### 5. `logic-prerelease-check`

**目的**: リリース前の総合チェックを自動実行

**トリガー**: #logic-release に「リリース準備」と投稿

**処理フロー**:
```
START
  │
  ├── [チェック1] SIT の HTTP ステータス確認
  │     200 OK → 続行
  │     エラー → 中断 → エラー通知
  │
  ├── [チェック2] versionCode が前回リリースより大きいか
  │     OK → 続行
  │     NG → 中断 → バージョン更新を促す通知
  │
  ├── [チェック3] Keystore ファイルが存在するか
  │     存在 → 続行
  │     不在 → 中断 → Keystore設定を促す通知
  │
  ├── [チェック4] P0/P1 未対応バグが Jira に残っていないか（要API連携）
  │     なし → 続行
  │     あり → 警告通知（続行可能）
  │
  └── 全チェック完了 → #logic-release に結果通知 → store-submit-approval 起動
```

---

### 6. `logic-store-submit-approval`

**目的**: ストア提出前のKeita-san承認待ちフロー

**トリガー**: prerelease-check 完了後

**処理フロー**:
```
START
  │
  ├── #logic-release に承認依頼メッセージ送信
  │   「ストア提出の承認をお願いします。以下を確認して返信ください。」
  │   + チェックリスト表示
  │
  ├── [待機] Keita-sanの返信を待つ（タイムアウト: 72時間）
  │
  ├── 「承認 ✅」受信
  │   → AAB ビルド起動 → ビルド結果を #logic-build-ops に通知
  │
  ├── 「差し戻し 🔄」受信
  │   → 理由を記録 → Claw に差し戻し内容を通知
  │
  └── タイムアウト（72時間経過）
      → #logic-release にリマインド送信
```

---

### 7. `logic-bug-escalation`

**目的**: P0バグ発生時の緊急エスカレーション

**トリガー**: Claw からの P0 判定通知

**処理フロー**:
```
START
  │
  ├── Keita-san に緊急通知（Teams DM + #logic-bugs）
  │   「🚨 P0バグ発生: {bug_summary}」
  │
  ├── Claw に緊急対応フローを通知
  │
  ├── [待機] Keita-sanの対応確認を待つ（タイムアウト: 1時間）
  │
  ├── 1時間経過で未確認の場合 → リマインド送信（最大3回）
  │
  └── 対応完了通知受信 → #logic-bugs にクローズ通知
```

---

### 8. `logic-exception-handler`

**目的**: ビルド失敗・例外時の対応分岐

**トリガー**: ビルドスクリプトの失敗 or その他エラー

**処理フロー**:
```
ERROR 受信
  │
  ├── エラー種別判定:
  │   ├── Gradle エラー → Gradle キャッシュクリア提案
  │   ├── npm エラー → npm ci 実行提案
  │   ├── Keystore エラー → Keystore 確認依頼
  │   ├── ネットワークエラー → リトライ提案（最大2回）
  │   └── 不明エラー → Claw に詳細解析依頼
  │
  ├── 自動リトライ可能なエラー → リトライ実行
  │     成功 → 通常フロー復帰
  │     失敗（2回） → 手動対応依頼に切り替え
  │
  └── 手動対応依頼:
      → #logic-build-ops にエラー詳細 + 対応手順を通知
      → Claw に解析依頼
```

---

## 実装メモ（Workflows構築時の参考）

### Teams Webhook 設定

```
必要なもの:
- Teams チャネルごとの Incoming Webhook URL
- OpenClaw の Slack Webhook と同様の方式で設定可能
- 設定場所: openclaw config の messaging セクション
```

### ビルドスクリプト統合

```bash
# scripts/build-and-notify.sh（作成予定）
#!/bin/bash
cd /home/work/.openclaw/workspace/logic
git pull
npm run build && \
  node scripts/bump-android-version.js && \
  npx cap sync android && \
  echo "BUILD_SUCCESS" || echo "BUILD_FAILED"
# ビルド結果を Workflows に POST
```

### Jira 連携

```
既存スクリプト: scripts/jira_setup.py, jira_new_backlog.py
バグ番号 → Jira チケット自動作成は既存スクリプトで対応可能
```

---

*管理: Claw | 更新日: 2026-04-28*
