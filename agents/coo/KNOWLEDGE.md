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

---

## UIリデザイン レビュー（2026-04-18）

### COO意見：UI_REDESIGN_PROPOSAL.md への回答

**デプロイサイクルの推奨**
- フェーズごとに develop push → SIT確認 → Keita承認 → 次フェーズ
- まとめてリリースはリスクが高い（どの変更が問題か特定しにくい）
- Phase 2（HomeScreen）だけで1回Keitaに確認を取る

**運用リスク**
1. リデザイン中に既存ユーザーがいる場合（ベータテスター）、大きな変化で混乱する可能性
   → 今はユーザー数が少ないので問題ない。むしろ今やるべき
2. トークン変数名変更はCSSの全ファイルに影響する
   → CTO提案のalias方式で移行期間を設ける

**KPI影響の観測方法**
- リデザイン前後でD1リテンションを比較（feedback tableへの送信数も指標に）
- HomeScreen滞在時間の変化（サーバーログで推測可能）
