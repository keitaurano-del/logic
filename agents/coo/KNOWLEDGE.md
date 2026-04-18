# COO KNOWLEDGE

## 運用状況（2026-04-18）

### 未対応の障害・課題
- SMTP未設定 → report-problem のメール通知が動かない
  設定方法: Render に SMTP_HOST/PORT/USER/PASS を追加（Gmail アプリパスワード）
- Stripe本番コンプライアンス3件未対応（支払い停止リスクあり）
  1. 身分証明書提出
  2. セキュリティチェックリスト
  3. ウェブサイト情報提供

### インフラ
- SIT: https://logic-sit.onrender.com（develop, autoDeploy: on）
- 本番: https://logic-u5wn.onrender.com（main, autoDeploy: off）
- Supabase: yctlelmlwjwlcpcxvmgx
- Jira: https://logic.atlassian.net

## KPI定義（未計測、今後設定）

- DAU（日次アクティブユーザー）
- D7リテンション率
- 無料→有料転換率
- 月次チャーン率
