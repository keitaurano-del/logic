# QA Checklist — iOS HIG / Material 3 適合検証

> **対象**: Logic Android アプリ (iOS は後追いリリース)
> **基準**: docs/HIG_MATERIAL_AUDIT_20260504.md §9 検証手順
> **更新日**: 2026-05-04
> **形式**: Phase 4「仕上げ・検証」のリリース前検証チェックリスト

---

## 0. 自動チェック (CI で実行)

| 項目 | コマンド | 合格基準 | 状態 |
|---|---|---|---|
| TypeScript 型チェック | `npm run build` | exit 0、エラー 0 | ✅ blocking |
| ESLint | `npm run lint` | error 0、warning 0 | ✅ blocking |
| jsx-a11y | `npm run lint` (上記に含む) | error 0 | ✅ blocking |
| axe-core (13 主要画面) | `npx playwright test e2e/a11y.spec.ts` | violation 0 (WCAG 2.1 A/AA) | ✅ blocking |
| Capacitor sync | `npx cap sync` | exit 0、10 plugins 認識 | ⚪ ローカル実行 |

---

## 1. ビルド & ネイティブ確認

### 1.1 Android Build
- [ ] `npm run build` で `dist/` が生成される（warning は許容）
- [ ] `npx cap sync android` で 10 plugins が認識される
  - `@capacitor/{action-sheet, app, dialog, haptics, keyboard, local-notifications, share, splash-screen, status-bar}` + `google-auth`
- [ ] `npx cap open android` で Android Studio が開ける
- [ ] Android Studio で Gradle Build が成功する

### 1.2 Capacitor 設定
- [ ] `capacitor.config.ts` の `StatusBar.style` は `LIGHT`
- [ ] `capacitor.config.ts` の `StatusBar.backgroundColor` は `#1A1F2E`
- [ ] `capacitor.config.ts` の `StatusBar.overlaysWebView` は `true`
- [ ] `capacitor.config.ts` の `SplashScreen.launchAutoHide` は `false`（手動 hide）
- [ ] `AndroidManifest.xml` に `android:enableOnBackInvokedCallback="true"`
- [ ] `MainActivity.kt` に `WindowCompat.setDecorFitsSystemWindows(window, false)`

---

## 2. Android エミュレータ / 実機チェック (Pixel 4a / Pixel 8)

### 2.1 起動 & スプラッシュ
- [ ] スプラッシュ画面の背景色が `#1A1F2E` (Slate Blue)
- [ ] スプラッシュは 1.5s 以内に消える（auth 解決時 or タイムアウト）
- [ ] スプラッシュが消えてもコンテンツが暗転しない
- [ ] Status Bar の文字色が白
- [ ] Status Bar の背景が暗く、コンテンツとシームレス

### 2.2 Edge-to-Edge / Predictive Back (API 35+)
- [ ] コンテンツが Status Bar / Navigation Bar の領域まで広がっている
- [ ] safe-area-inset-top でノッチ被りがない
- [ ] safe-area-inset-bottom で TabBar が Navigation Bar に被らない
- [ ] OS 戻るボタンを長押しで Predictive Back の予告アニメが出る
- [ ] OS 戻るボタンで前画面に戻れる
- [ ] Home でのみ「もう一度押すと終了」（あるいは終了確定）動作

### 2.3 タップターゲット
- [ ] すべての `<button>` / `<Header>` 戻るボタンが 48dp 以上
- [ ] TabBar の各タブが 48dp 以上
- [ ] IconButton は 48dp 以上
- [ ] Switch は周辺余白込みで 48dp 以上

### 2.4 触覚フィードバック
- [ ] タブ切替で軽い触覚 (`haptic.light`)
- [ ] レッスン正解で成功触覚 (`haptic.success`)
- [ ] レッスン不正解で警告触覚 (`haptic.warning`)
- [ ] レッスン完了画面表示時に成功触覚
- [ ] フラッシュカード「もう一度」で警告触覚
- [ ] AI問題回答で正誤に応じた触覚
- [ ] 主要 Submit ボタンで触覚

### 2.5 ダイアログ / アラート
- [ ] ログアウト確認 → OS native Material 3 Dialog（左寄せ、ボタン右下）
- [ ] キャッシュクリア確認 → OS native Material 3 Dialog
- [ ] 学習データリセット確認 → OS native Material 3 Dialog（destructive）
- [ ] `window.confirm` / `window.alert` が画面内に出ない（全て platform/dialog 経由）

### 2.6 入力 (TextField / textarea)
- [ ] 入力欄フォーカス時に WebView がリサイズしてキーボードと被らない
- [ ] 入力欄の `font-size` が 16px 以上（Safari auto-zoom 回避だが Android にも有効）
- [ ] 入力欄が`-webkit-tap-highlight-color: transparent` でフラッシュなし

### 2.7 アニメーション / モーション
- [ ] 設定 > アクセシビリティ > アニメーションの設定 OFF で:
  - [ ] 画面遷移アニメが消える
  - [ ] TabBar スクロール隠しが即時切替
  - [ ] Confetti（レッスン完了演出）が出ない
- [ ] 通常モードでアニメが滑らか（300ms motion-medium2）

### 2.8 TabBar
- [ ] active tab indicator が pill (secondaryContainer) で表示される
- [ ] active アイコンが primary 色
- [ ] タブ切替が即時反応（300ms 以内）
- [ ] スクロール時に TabBar が隠れる（Android のみの挙動）

### 2.9 戻るボタン (Header)
- [ ] arrow_back アイコンが太線 (strokeWidth 2)
- [ ] タイトルが左寄せ
- [ ] タップで前画面に戻る
- [ ] `aria-label="戻る"` 設定済み（TalkBack で「戻る、ボタン」と読まれる）

### 2.10 ローディング (LoadingIndicator)
- [ ] M3 円弧 indeterminate progress が回転 + 弧の長さが伸縮
- [ ] 4dp 線幅
- [ ] primary 色

---

## 3. iOS シミュレータ / 実機チェック (iPhone SE / 15 / 15 Pro)

iOS リリース時に追加対応する項目:
- [ ] `ios/` プロジェクト初期化 (`npx cap add ios`)
- [ ] `PrivacyInfo.xcprivacy` 追加（Required Reason API 4 種）
- [ ] StoreKit IAP 実装（`src/billing/index.ts` に iOS 分岐追加）
- [ ] Sign in with Apple ボタン追加（`LoginScreen.tsx`）
- [ ] iOS シミュレータで全画面チェック
  - [ ] Status Bar 文字色 白
  - [ ] スプラッシュ表示 → 消滅
  - [ ] 左端スワイプで戻る（WKWebView native）
  - [ ] タップターゲット 44pt
  - [ ] Header chevron アイコン（細線、`戻る` ラベル）
  - [ ] 中央寄せタイトル
  - [ ] active tab indicator が dot
  - [ ] iOS 風 8-bar スピナー
  - [ ] Dynamic Type 最大時のレイアウト崩れなし
  - [ ] VoiceOver で全要素フォーカス可能

---

## 4. アクセシビリティ (TalkBack / VoiceOver)

### 4.1 TalkBack (Android)
- [ ] アプリ起動時に TalkBack でホーム画面の各カードがフォーカス可能
- [ ] 各カードに `aria-label` で意味のあるラベル
- [ ] 戻るボタンが「戻る、ボタン」と読まれる
- [ ] TabBar の各タブが「ホーム、タブ、選択中」のように読まれる
- [ ] レッスン中に正誤判定が `aria-live` で読まれる
- [ ] ProgressBar の進捗が `role="progressbar"` で読まれる
- [ ] Switch の状態が「オン/オフ、トグル」で読まれる
- [ ] ダイアログが modal として認識される

### 4.2 VoiceOver (iOS) — iOS リリース時
- [ ] 同上の項目を VoiceOver で確認

### 4.3 キーボード操作 (外部 Bluetooth キーボード)
- [ ] Tab で全 button / link をフォーカス可能
- [ ] フォーカス時に primary 色の outline 表示
- [ ] Enter / Space で button 起動
- [ ] Escape でダイアログ閉じる

### 4.4 文字サイズ
- [ ] OS 設定 > 表示とテキストサイズ で文字を大きくしてもレイアウトが崩れない
- [ ] 重要テキストが切れない

---

## 5. ストア提出前

### 5.1 Google Play
- [ ] `applicationId` が `io.logic.app` で固定
- [ ] `versionCode` / `versionName` を bump (`scripts/bump-android-version.js`)
- [ ] 署名済み AAB 生成
- [ ] Internal Testing にアップロード
- [ ] Closed Testing にプロモート
- [ ] スクリーンショット 8 枚（Slate Blue ダーク統一確認）
- [ ] Data Safety Form 更新（Sentry / Supabase / Google Auth の収集データ申告、Stripe は **削除済み**）
- [ ] Adaptive Icon (foreground / background) が両方表示される

### 5.2 iOS App Store (リリース時)
- [ ] Apple Developer Program 加入確認
- [ ] Bundle Identifier が `io.logic.app`
- [ ] PrivacyInfo.xcprivacy 提出
- [ ] StoreKit 2 経由の課金フロー動作確認
- [ ] Sign in with Apple 動作確認
- [ ] App Store Connect スクリーンショット 5 枚（iPhone 6.7" / 6.5" / 5.5"）
- [ ] App Review Information 入力
- [ ] App Privacy 申告

---

## 6. Lighthouse / axe-core 自動 a11y チェック (将来 CI 化)

### 6.1 Lighthouse
- [ ] Mobile performance ≥ 90
- [ ] Accessibility ≥ 95
- [ ] Best Practices ≥ 90
- [ ] LCP < 2.5s
- [ ] INP < 200ms

### 6.2 axe-core (将来 CI に組み込み)
- [ ] critical violations = 0
- [ ] serious violations = 0
- [ ] moderate violations < 5

---

## 7. リグレッション

新機能追加 / 既存修正時の最低限の確認:

- [ ] アプリ起動 → ホーム画面表示
- [ ] レッスン 1 つを最後まで完了 → 完了演出 → ホームに戻る
- [ ] 設定 → アカウント → ログアウト確認ダイアログ表示
- [ ] フラッシュカード復習を 3 枚処理
- [ ] 課金画面を開く → 戻る
- [ ] OS 戻るボタンで TabBar に戻れる

---

## 8. 既知の制約 / 既知の Issue

- iOS 環境は未初期化（Android 先行リリース方針）
- `index.css` に レガシー patch selector が 130 件残る（順次削除予定）
- `<div onClick>` 残存 70+ 件（jsx-a11y 警告として可視化済み、優先度低の画面に集中）
- `<select>` ネイティブピッカーは ActionSheet に未置換（OS native でも UX 良好のため優先度低）
