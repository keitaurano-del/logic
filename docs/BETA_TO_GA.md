# BETA → GA 切替 チェックリスト

ベータ期間 (`BETA_MODE = true`) から正式公開・課金 ON へ移行する際の手順。
**順番通りに実施し、各ステップで動作確認**してください。

---

## 前提条件 (チェック)

- [ ] クローズドベータで最低 10 人のフィードバックが集まっている
- [ ] AI 利用回数の 1 日上限 (10/日) で実際にユーザーが詰まっていないか確認済み
- [ ] Render の API コスト実績が想定範囲内 (週 ¥2,000 未満を目安)
- [ ] 致命的なバグが直近 2 週間で報告されていない
- [ ] iOS/Android ストア審査の準備完了 ([store-metadata.md](../store-metadata.md))

---

## Step 1: Stripe 本番環境セットアップ

### 1.1 Stripe ダッシュボード (https://dashboard.stripe.com/)

- [ ] 右上のトグルを **本番環境 (Live mode)** に切替
- [ ] **商品** タブで以下を作成:
  - [ ] 商品名: `Logic Premium 月額` / 価格: `¥500` / 課金タイプ: `継続` / 請求間隔: `毎月`
  - [ ] 商品名: `Logic Premium 年額` / 価格: `¥3,500` / 課金タイプ: `継続` / 請求間隔: `毎年`
- [ ] それぞれの **価格 ID** (`price_xxx...`) を記録

### 1.2 Stripe API キー取得

- [ ] **開発者 → API キー**
- [ ] **Live mode** の `Secret key` (`sk_live_...`) を記録
  - ⚠ Secret key は **絶対に Git に入れない**

### 1.3 (将来) Stripe Webhook 設定

> **Phase B 実装後に対応** (今は不要)。
> サブスクリプションキャンセル・支払い失敗を自動検知できないため、当面は手動運用。

- [ ] **開発者 → Webhook** で `https://logic-u5wn.onrender.com/api/stripe/webhook` を追加
- [ ] イベント: `customer.subscription.deleted`, `invoice.payment_failed`, `customer.subscription.updated`
- [ ] **署名シークレット** (`whsec_...`) を記録

---

## Step 2: Render 環境変数を更新

[Render Dashboard](https://dashboard.render.com) → Logic サービス → **Environment**:

- [ ] `STRIPE_SECRET_KEY` を `sk_live_...` に更新 (旧: `sk_test_...`)
- [ ] `STRIPE_PRICE_MONTHLY` を Step 1.1 で作った月額の `price_xxx` に更新
- [ ] `STRIPE_PRICE_YEARLY` を Step 1.1 で作った年額の `price_xxx` に更新
- [ ] (Phase B 後) `STRIPE_WEBHOOK_SECRET` を `whsec_...` に更新
- [ ] **Save changes** → Render が自動再デプロイ

> 環境変数の保存後、Render は自動的にビルド+デプロイを開始します。3〜5 分待機。

---

## Step 3: 特商法・法務の最終整備

[public/tokushoho.html](../public/tokushoho.html) を開き、プレースホルダを実際の値に置換:

- [ ] `[YOUR_NAME]` → 販売事業者名 (個人なら本名、屋号があれば屋号)
- [ ] `[YOUR_ADDRESS]` → 住所 (個人住所を晒したくない場合は **バーチャルオフィス契約**: 月¥300〜¥1,000、例: NAWABARI / GMO お名前ドットコム / DMM バーチャルオフィス)
- [ ] `[YOUR_PHONE]` → 電話番号 (個人携帯でも可。「請求があった場合に開示」と既に表記済)
- [ ] `[YOUR_EMAIL]` → 連絡用メールアドレス
- [ ] [public/privacy.html](../public/privacy.html) 末尾の `最終更新日` を更新
- [ ] [public/terms.html](../public/terms.html) 末尾の `最終更新日` を更新

---

## Step 4: BETA_MODE フラグを OFF

[src/subscription.ts:65](../src/subscription.ts) を編集:

```ts
// 変更前
export const BETA_MODE = true

// 変更後
export const BETA_MODE = false
```

これにより:
- `isPremium()` がトライアル/月額/年額の購読状態を実際に判定するように戻る
- Pricing UI が Profile から再表示される (BETA 中は隠している)
- Roleplay の premium シチュエーション、Theme の premium モードがロックされる
- 7 日間トライアルが新規ユーザーに対して開始される

---

## Step 5: 動作確認 (Stripe テストモードで先にリハーサル推奨)

### リハーサル: テストモード

⚠ **本番切替の前に**、Render を一時的に Test mode に戻して以下を試す:

- [ ] テスト用カード番号 `4242 4242 4242 4242` (有効期限・CVC は何でも OK) で月額決済
- [ ] 決済完了後、`isPremium()` が true を返すこと
- [ ] AI 機能の利用上限が解除されること
- [ ] Profile → プラン に「月額プラン (¥500/月)」と表示されること
- [ ] 同様に年額プランも検証

### 本番モード切替

- [ ] Render 環境変数を Live キーに更新 (Step 2)
- [ ] 自分自身で実際のクレジットカードで月額 ¥500 を購入 → 動作確認 → 即解約
  - → Stripe ダッシュボードで "refund" して全額返金
  - → 自分自身でのテスト購入は監査ログとして残しておく

---

## Step 6: コミュニケーション

- [ ] クローズドベータテスター 10 人へ事前通知メール (X/メール):
  - 「ベータが終了し、◯月◯日から正式公開します」
  - 「現在の学習データはそのまま引き継がれます」
  - 「ベータ期間中は全機能無料でしたが、◯月◯日以降は月額¥500/年額¥3,500の課金が必要になります」
  - 「ベータ参加特典として ◯ヶ月無料クーポンを発行します」 ← 余裕があれば
- [ ] X (旧 Twitter) でリリース告知投稿
- [ ] App Store Connect / Play Console のアプリ説明文を「ベータ版」表記から正式版に更新
- [ ] ストア審査メモに「課金 ON 切替」を明記

---

## Step 7: モニタリング

切替後 24-72 時間は集中監視:

- [ ] Render Logs を 1 日 2 回チェック
- [ ] Stripe ダッシュボードで決済成功/失敗を監視
- [ ] Anthropic API コストを毎日 monitor
- [ ] レート制限の 429 が大量発生していないかログで確認 (`grep "429" Render-logs`)
- [ ] フィードバックフォームへの問い合わせを毎日確認

---

## ロールバック手順 (緊急時)

致命的な問題が発生した場合、即座にベータ状態へ戻す:

1. [src/subscription.ts:65](../src/subscription.ts) の `BETA_MODE` を `true` に戻す
2. `git commit -m "Emergency rollback to BETA_MODE"` → push
3. Render 自動デプロイ完了を待つ (3-5 分)
4. 既存購入者への対応:
   - Stripe ダッシュボードで全アクティブサブスクをキャンセル
   - 該当ユーザーへ謝罪+全額返金通知
5. ロールバック原因の調査と再発防止策をドキュメント化

---

## 関連ドキュメント

- [store-metadata.md](../store-metadata.md) — App Store / Play Store 向けメタデータ
- [ANDROID-RELEASE.md](../ANDROID-RELEASE.md) — Android 配信手順
- [CAPACITOR.md](../CAPACITOR.md) — iOS/Android アプリ化手順
- [src/subscription.ts](../src/subscription.ts) — サブスクリプション管理コード
- [public/tokushoho.html](../public/tokushoho.html) — 特商法表記
