# Play Console — 単一有料プラン移行 Runbook

> ブランチ `feature/single-paid-plan-redesign` をリリースする際に Play Console / Supabase 側で実施する作業手順。

## 前提

- 新プラン: 月額 ¥350 / 年額 ¥2,450（年額は約42%OFF）
- 旧プラン（Standard / Premium / Basic / Beta Campaign 計6種）は新規購入停止、既存購読は満了まで維持
- 7日間無料トライアルは Play Store の Introductory Offer に一本化（クライアント側の自動 trial は廃止済み）
- リリース対象は Android のみ（iOS ネイティブプロジェクト未生成）

---

## Phase A. Play Console: 新 product ID の作成

Google Play Console > Logic アプリ > 収益化 > 商品 > 定期購入 で以下を作成。

### A-1. Subscription Group の作成

| 項目 | 値 |
|---|---|
| Group name | `logic_paid` |
| 説明 | Logic 有料プラン（月額／年額の Base Plan を内包） |

### A-2. 月額プラン

| 項目 | 値 |
|---|---|
| Product ID | `logic_paid_monthly` |
| 名称 | Logic 有料プラン（月額） |
| 説明 | AI問題生成が無制限になる月額プラン |
| Base Plan ID | `monthly-autorenew` |
| 課金期間 | 1ヶ月 |
| 価格 | ¥350（税込）|
| 自動更新 | 有効 |

### A-3. 年額プラン

| 項目 | 値 |
|---|---|
| Product ID | `logic_paid_yearly` |
| 名称 | Logic 有料プラン（年額） |
| 説明 | AI問題生成が無制限。年額なら月あたり ¥204 相当（42%OFF） |
| Base Plan ID | `yearly-autorenew` |
| 課金期間 | 1年 |
| 価格 | ¥2,450（税込）|
| 自動更新 | 有効 |

### A-4. Introductory Offer（7日間無料トライアル）

年額プランに紐付ける形で Offer を作成。

| 項目 | 値 |
|---|---|
| Offer ID | `yearly-free-trial-7d` |
| Eligibility | 初回購入者のみ（New customers only） |
| Phase 1 | 無料 7日間 |
| Phase 2 | 通常価格 ¥2,450 / 年 |

> 月額にもトライアルを付けるか要検討。**推奨は年額のみ**（月額にもトライアルを付けると「7日無料 → 1ヶ月 ¥350」で離脱率が高くなる傾向）。

---

## Phase B. Play Console: 旧 product ID の非アクティブ化

> ⚠ 既存購読者の継続課金は維持する。新規購入経路から外すだけ。

対象 product ID:
- `logic_basic_monthly`
- `logic_basic_yearly`
- `logic_standard_monthly`
- `logic_standard_yearly`
- `logic_premium_monthly`
- `logic_premium_yearly`
- `logic_campaign_yearly`

### 手順

各 product について：

1. Play Console > 収益化 > 商品 > 定期購入 > 該当 product を開く
2. 「Base plan を非アクティブ化」（Deactivate base plan）
3. 既存購読者には影響なし。新規購入だけブロックされる
4. ストアリスティング上で表示されなくなる

> ⚠ **削除はしないで**。削除すると過去の購読履歴へのアクセスが失われる。非アクティブ化のみで OK。

---

## Phase C. Supabase: マイグレーション適用

`supabase/migrations/011_plan_simplification.sql` を本番に適用。

### C-1. Supabase Dashboard で確認

1. Supabase Dashboard > プロジェクト > Database > Migrations
2. `011_plan_simplification.sql` が pending 状態であることを確認

### C-2. 本番適用（CLI 経由）

```bash
cd /root/projects/logic
npx supabase db push --linked
```

または Dashboard の SQL Editor で migration ファイルの内容を直接実行。

### C-3. 適用後の検証

```sql
-- subscriptions の plan 分布を確認
SELECT plan, COUNT(*) FROM subscriptions GROUP BY plan;

-- 期待結果: 'free' / 'paid_monthly' / 'paid_yearly' のいずれかのみ
-- legacy plan (standard_* / premium_* / basic_* / monthly / yearly / campaign_yearly / trial) が残っていないこと
```

---

## Phase D. APK ビルド & 内部テスター配信

```bash
cd /root/projects/logic
npm run build
npx cap sync android
cd android
./gradlew bundleRelease  # AAB 生成
```

または GitHub Actions の `deploy-production.yml` を `gh workflow run deploy-production.yml -f confirm=yes` で実行（main push 時の自動配信あり）。

### D-1. 内部テスター向け確認項目

- [ ] 新規ユーザーが無料プランで起動 → AI問題生成画面で「要アップグレード」表示が出るか
- [ ] 課金画面で月¥350 / 年¥2,450 / 「年額42%OFF」訴求が表示されるか
- [ ] 年額購入時に「7日間無料トライアル」が表示・適用されるか（Play Store の Offer 設定が正しく反映されているか）
- [ ] 購入完了 → AI問題生成解放 → 「ようこそ」トーストが1回だけ表示
- [ ] 設定 > サブスクリプション管理で「有料プラン（月額）/（年額）」が正しく表示
- [ ] ロールプレイ全シナリオ（哲学シリーズ含む）が無料で開けること
- [ ] 復習・誤答リストカードが無料でも表示されること
- [ ] プレミアムテーマと Lesson 英語注釈モードは有料限定のままロックされていること

### D-2. 既存課金ユーザーの動作確認（テスト購読者がいれば）

- [ ] legacy plan（standard_monthly 等）の既存購読者が起動 → `getPremiumStatus()` で正しく paid 扱いになるか
- [ ] サブスクリプション管理画面で正しいプラン名が表示されるか

---

## Phase E. 本番 rollout

内部テスト → クローズドテスト → 製品版の3段ロールアウト。

1. Internal testing track へ AAB アップロード（自動配信される設定）
2. 1〜3日テスター実機検証
3. 問題なければ Closed testing → Open testing → Production と段階公開
4. Production は最初 10% → 50% → 100% の段階リリース推奨

---

## ロールバック手順

万一の問題発生時：

1. Play Console > リリース > 製品版 > **段階公開を停止**
2. 旧 product ID の非アクティブ化を解除（Activate base plan）
3. 必要なら Supabase migration をロールバック（ただし plan データの逆方向マッピングは不可逆 — 事前にバックアップ取得を推奨）

### バックアップコマンド（本番適用前に実行推奨）

```bash
# subscriptions テーブルのバックアップ
npx supabase db dump --linked --data-only --table subscriptions > backup/subscriptions_$(date +%Y%m%d).sql
```

---

## チェックリスト（リリース当日）

- [ ] Phase A: 新 product ID `logic_paid_monthly` / `logic_paid_yearly` 作成済み
- [ ] Phase A: Introductory Offer（年額7日無料）設定済み
- [ ] Phase B: 旧 product 6種を非アクティブ化済み
- [ ] Phase C: Supabase migration 011 適用済み、plan 分布を SQL 検証済み
- [ ] バックアップ取得済み
- [ ] Phase D: AAB ビルド完了、内部テスター実機検証完了
- [ ] Phase E: 段階公開（10% → 50% → 100%）の rollout 計画確認
- [ ] アプリ内アナウンス（任意）: 既存ユーザーへの料金体系変更のお知らせ

---

## 補足: iOS リリース時の追加作業（将来）

- App Store Connect で同 product ID（`logic_paid_monthly` / `logic_paid_yearly`）を作成
- Subscription Group は `logic_paid` で揃える（クロスプラットフォームでの管理が楽になる）
- Introductory Offer は App Store Connect 側で同様に設定
- StoreKit 2 の実装が必要（Capacitor の IAP プラグインが iOS 対応版を出していれば流用可能）
