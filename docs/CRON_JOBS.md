# cron ジョブ一覧

最終更新: 2026-05-26 JST

このマシン（Logic 運用ホスト）の crontab に登録された自動巡回ジョブの一覧。
タイムゾーンはシステム全体で Asia/Tokyo (JST) に設定済みなので、cron のスケジュール欄はそのまま JST として解釈される。

実行方式: cron + 純シェル + Playwright / claude headless（OAuth 経由、API key 不要）
スクリプト実体: `~/.claude/projects-meta/scripts/`（agent-config で管理・同期）

---

## 稼働中（crontab 登録済み）

### 1. night-patrol — 本番巡回
- スケジュール: 毎日 03:00 JST (`0 3 * * *`)
- スクリプト: `~/.claude/projects-meta/scripts/night-patrol.sh`
- 内容: Logic 本番 (Render) のヘルスチェック（フロント / API の HTTP コード・応答時間）+ Playwright スモーク
- 出力: `obsidian-vault/50-Daily/inspections/YYYY-MM-DD.md`（失敗時スクショは screenshots/ 配下）
- 致命度ラベル: critical（フロント/API が 200 以外）/ high（スモーク失敗）/ normal（全 pass）
- ログ: `/var/log/night-patrol.log`

### 2. feedback-watcher — ユーザフィードバック巡回
- スケジュール: 毎日 06:00 JST (`0 6 * * *`)
- スクリプト: `~/.claude/projects-meta/scripts/feedback-watcher.sh`
- 内容: Supabase の reports / feedback テーブルの直近 24h 新着を取得し構造化。同種クラスタ検出・Issue 化推奨を付す
- 出力: `obsidian-vault/50-Daily/feedback/YYYY-MM-DD.md`
- ログ: `/var/log/feedback-watcher.log`

### 3. morning-briefing — 朝ブリーフィング
- スケジュール: 毎日 07:00 JST (`0 7 * * *`)
- スクリプト: `~/.claude/projects-meta/scripts/morning-briefing.sh`
- 内容: 当日未明の night-patrol (03:00) + 当日朝の feedback-watcher (06:00) の出力 + 各リポの git log + KPI を ceo agent が統合して朝ブリーフィングを生成
- 出力: `obsidian-vault/50-Daily/briefings/YYYY-MM-DD.md`
- ログ: `/var/log/morning-briefing.log`

実行順の前提: 03:00 巡回 → 06:00 フィードバック → 07:00 ブリーフィングが当日分を読み込む。
morning-briefing は night-patrol を当日 (DATE) 日付で参照する（03:00 の巡回は 07:00 と同じ暦日になるため。2026-05-26 に YESTERDAY 参照のバグを修正）。

---

## 運用メモ

- crontab 確認: `crontab -l`
- cron サービス: `systemctl status cron`
- TZ 確認: `timedatectl`（Asia/Tokyo であること）
- 手動テスト実行: 各スクリプトを直接叩けば即実行できる（例: `~/.claude/projects-meta/scripts/night-patrol.sh`）
- 各ジョブは obsidian-vault に成果物を commit + push する（push 失敗は非致命、次回リトライ）

---

## 旧 cron について（廃止）

2026-04 以前は Genspark プラットフォーム側の cron（Notion 日次同期 / モーニングブリーフィング〔コンサル・金融〕/ オンボーディング Day2-7 等、ジョブ ID 管理）を使っていたが、現行のシェル cron + agent 体制に移行済み。旧ジョブ群は廃止扱い。
