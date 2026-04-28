# Build / Release チェックリスト

> Logic モバイル配信プロジェクト | 毎回のビルド・リリース前に確認

---

## Android AAB ビルドチェックリスト

### 事前確認
- [ ] `develop` ブランチが最新か (`git pull`)
- [ ] SIT で主要機能が動作することを確認済み
- [ ] P0/P1 バグが未対応のまま残っていないか確認
- [ ] `android/app/build.gradle` の `versionCode` が前回より大きいか
- [ ] `android/app/build.gradle` の `versionName` が正しいか
- [ ] Keystore ファイルが `/home/work/.openclaw/workspace/keystores/` に存在するか

### ビルド手順

```bash
# 1. 最新取得
cd /home/work/.openclaw/workspace/logic
git pull

# 2. Webビルド
npm run build

# 3. バージョン番号を上げる（必要なら）
node scripts/bump-android-version.js

# 4. Capacitor 同期
npx cap sync android

# 5. AABビルド（Android Studio で実施）
# Build → Generate Signed Bundle / APK → Android App Bundle → release
```

### ビルド後確認
- [ ] `android/app/release/app-release.aab` が生成されているか
- [ ] ファイルサイズが妥当か（前回比で極端に変化していないか）
- [ ] ビルドエラー・警告が出ていないか

---

## Play Console アップロードチェックリスト

### 内部テスト配信
- [ ] Play Console にログイン
- [ ] アプリ → テスト → 内部テスト → 新しいリリースを作成
- [ ] AABをアップロード
- [ ] リリースノートを記入（日本語・英語）
- [ ] テスターリストに自分のアカウントが入っているか
- [ ] 内部テスト配信を開始

### 動作確認（実機）
- [ ] スプラッシュスクリーンが表示される
- [ ] オンボーディング 3 画面が表示される
- [ ] プレイスメントテスト 8 問が動く
- [ ] ホームに偏差値おすすめカードが出る
- [ ] レッスン (MECE) が起動する
- [ ] ロールプレイ → 1 ターンプレイできる
- [ ] リマインダー通知許可ダイアログが出る
- [ ] プライバシーポリシー / 利用規約が開く
- [ ] 全データ削除が動く

---

## 本番公開チェックリスト

### Keita-san 承認前に確認
- [ ] 内部テストで全チェック項目クリア済み
- [ ] store-metadata.md の内容が最新
- [ ] フィーチャーグラフィック (1024×500) 準備済み
- [ ] スクリーンショット (最低2枚) 準備済み
- [ ] プライバシーポリシー URL が有効: `https://logic-u5wn.onrender.com/privacy.html`
- [ ] データセーフティの回答が最新
- [ ] コンテンツレーティング完了済み

### Keita-san 承認（`#logic-release` で）
```
承認 ✅ → リリース提出してOK
```

### 提出後
- [ ] 審査ステータスを確認（数時間〜数日）
- [ ] 審査結果を `#logic-release` に報告
- [ ] 承認された場合、本番公開ボタンを押す前に最終確認

---

## iOS チェックリスト（参考）

### 前提（Macが必要）
- [ ] Apple Developer Program 登録済み ($99/年)
- [ ] Xcode 最新版がインストール済み
- [ ] CocoaPods インストール済み

### ビルド手順
```bash
npm run build
npx cap sync ios
npm run cap:open:ios  # → Xcode が開く
# Xcode: Product → Archive → Distribute App → App Store Connect
```

### TestFlight 配信確認
- [ ] App Store Connect にアーカイブがアップロードされているか
- [ ] TestFlight で内部テスターに配信済みか
- [ ] 実機 (iPhone) で動作確認完了か

---

*更新日: 2026-04-28 | 管理: Claw*
