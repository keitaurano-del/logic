# Capacitor — iOS / Android アプリ化 手順

このドキュメントは、Logic を iOS / Android のネイティブアプリとしてビルド・配信するための **Mac での手順**をまとめたものです。

## 前提

- macOS (Xcode 必須 / Android Studio はクロスプラットフォーム可)
- Node.js 20+ / npm
- Apple Developer Program 登録済み (iOS の場合 / $99/年)
- Google Play Developer 登録済み (Android の場合 / $25 一回限り)
- Xcode 15+ (App Store Connect の最新要件に合わせる)
- Android Studio (最新版)
- CocoaPods (`brew install cocoapods` または `sudo gem install cocoapods`)

---

## 初回セットアップ (Mac で 1 回だけ)

```bash
# 1. リポジトリクローン
git clone https://github.com/keitaurano-del/logic.git
cd logic

# 2. 依存インストール (Capacitor を含む)
npm install

# 3. Web ビルド
npm run build

# 4. iOS / Android プラットフォーム追加
npx cap add ios
npx cap add android

# 5. 同期 (dist/ → ネイティブプロジェクトへコピー)
npx cap sync

# 6. アイコン + スプラッシュを assets/ から自動生成
npm run cap:assets
```

`npx cap add ios` で `ios/` ディレクトリ、`npx cap add android` で `android/` ディレクトリが生成されます。これらは `.gitignore` の対象外なので、必要なら後で git に追加してください (大容量ファイルが多いので一般的には git LFS かまたは別ブランチで管理)。

---

## 日常の開発フロー

### Web で確認 (一番速い)
```bash
npm run dev
# → http://localhost:5173
```

### iOS シミュレータで確認
```bash
npm run build
npx cap sync ios
npm run cap:open:ios   # Xcode が開く
# Xcode で ▶ ボタンを押す
```

### Android エミュレータで確認
```bash
npm run build
npx cap sync android
npm run cap:open:android  # Android Studio が開く
# Android Studio で Run ▶ ボタンを押す
```

---

## アイコン・スプラッシュの再生成

`assets/` 配下の SVG を編集したら:

```bash
npm run cap:assets
```

これで全サイズの PNG が自動生成され、`ios/App/App/Assets.xcassets/` と `android/app/src/main/res/` に配置されます。

ソース SVG:
- `assets/icon-only.svg` — iOS 用 + Android legacy icon (1024×1024)
- `assets/icon-foreground.svg` — Android adaptive icon foreground (透過、25% safe area)
- `assets/icon-background.svg` — Android adaptive icon background (オレンジグラデ)
- `assets/splash.svg` — ライトモード splash (2732×2732)
- `assets/splash-dark.svg` — ダークモード splash

---

## ビルド設定の場所

| 設定 | ファイル |
|---|---|
| Bundle ID / App Name | [capacitor.config.ts](capacitor.config.ts) |
| iOS 表示名 / バージョン | `ios/App/App/Info.plist` |
| iOS 署名 | Xcode → Signing & Capabilities |
| Android 表示名 | `android/app/src/main/res/values/strings.xml` |
| Android バージョン | `android/app/build.gradle` (`versionCode`, `versionName`) |
| Android 署名 | `android/app/build.gradle` + キーストア |

---

## 通知 (Local Notifications)

「今日の1問リマインダー」は **`@capacitor/local-notifications`** を使ってデバイス側で完結します (FCM サーバー不要)。

実装は [src/notifications.ts](src/notifications.ts)。Web では no-op、ネイティブ実機でのみ通知が予約されます。

iOS 追加設定:
- `ios/App/App/Info.plist` に通知関連のパーミッション説明文を追加

Android 追加設定:
- Android 13+ では実行時の通知許可リクエストが必要 (プラグインが自動処理)

---

## App Store / Play Store 申請の流れ

### iOS (TestFlight ベータ)
1. Xcode でアーカイブ作成 (Product → Archive)
2. Organizer ウィンドウで「Distribute App」→ App Store Connect
3. アップロード後、App Store Connect に行き TestFlight タブで配信
4. 内部テスター (最大 100 名) に即配信 / 外部テスターは Apple のレビューが必要 (24-48 時間)

### Android (Play Console 内部テスト)
1. Android Studio で「Generate Signed Bundle / APK」→ Android App Bundle (.aab)
2. Play Console に行き「テスト」→「内部テスト」→ 新しいリリース
3. .aab をアップロード → 内部テスター (メアド指定) に即配信
4. 公開トラックに移行する前に Play Store 審査 (数時間〜数日)

---

## トラブルシューティング

### `pod install` が失敗する
```bash
cd ios/App
pod repo update
pod install
```

### Xcode で "No team selected" エラー
Xcode → Signing & Capabilities → Team で Apple Developer アカウントを選択

### Android で "Could not find google-services.json"
FCM (push) を使う場合のみ必要。ローカル通知だけなら不要。

### Splash screen が表示されない
`npm run cap:assets` を再実行し、`npx cap sync` を続けて実行

---

## バージョンアップの流れ

```bash
# 1. コード修正 + commit
# 2. バージョン番号上げる
#    iOS:   ios/App/App/Info.plist → CFBundleShortVersionString
#    Android: android/app/build.gradle → versionCode (整数+1) と versionName
# 3. ビルド
npm run cap:sync
# 4. Xcode / Android Studio でアーカイブ作成 → アップロード
```
