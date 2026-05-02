# Logic — Android リリースガイド (ベータ版)

iOS より先に Android をベータ配信するための完全手順。Mac は不要、Windows / Linux / Mac どれでも OK。

---

## 必要なもの

| 項目 | 入手方法 | 費用 |
|---|---|---|
| Android Studio | https://developer.android.com/studio (公式) | 無料 |
| JDK 17+ | Android Studio に同梱 | 無料 |
| Google Play Developer アカウント | https://play.google.com/console/signup | **$25 (一回払い)** |
| Logic ソースコード | このリポジトリ | 既存 |

合計: **$25 (約 ¥3,800)**

---

## ステップ 1: Google Play Developer 登録

1. https://play.google.com/console/signup にアクセス
2. Google アカウントでログイン
3. **個人開発者** または **組織** を選択(個人で OK)
4. $25 支払い (クレジットカード)
5. 本人確認 (身分証明書アップロード) — ここで **数日かかる場合あり**ので、**まず最初にやっておく**のが吉
6. 開発者プロフィール記入

> ⚠ 2023年以降 Google は本人確認を厳しくしており、登録から審査完了まで 1〜3 営業日かかることがあります。先にやっておきましょう。

---

## ステップ 2: Android Studio セットアップ

1. https://developer.android.com/studio から DL → インストール
2. 起動 → Setup Wizard で「Standard」を選んで全部 Next
3. SDK Manager で以下を入れる (デフォルトで入るはず):
   - Android SDK Platform 34 以上
   - Android SDK Build-Tools
   - Android SDK Platform-Tools

---

## ステップ 3: Logic を Android プロジェクト化

ターミナルを開いて:

```bash
cd /path/to/logic   # logic リポジトリのルート
git pull            # 最新を取得 (Capacitor 設定が入っている)
npm install         # 依存ぜんぶ入る
npm run build       # Vite で dist/ を生成
npx cap add android # android/ ディレクトリが自動生成される
npx cap sync android
npm run cap:assets  # アイコン/スプラッシュが android/app/src/main/res/ に自動配置
```

ここまでで `android/` ディレクトリが出来上がります。

---

## ステップ 4: Android Studio で開く

```bash
npm run cap:open:android
```

または手動で Android Studio → **File → Open** → `logic/android` フォルダを選択。

初回は Gradle のダウンロードで **5〜15 分**かかります(ネットワーク次第)。Bottom bar の進捗を待つ。

### エミュレータで動作確認 (任意)

1. Android Studio 上部 → **Device Manager** → **Create Device** → Pixel 7 など選択
2. 上部の ▶(Run)ボタン → エミュレータ起動 → アプリインストール
3. オンボーディング → プレイスメントテスト → ホームと一通り動くか確認

---

## ステップ 5: アプリ署名 (キーストア生成)

**これは絶対 1 回しかできない超大事な作業**。生成したキーストアファイルとパスワードを失うと、今後 Play Store のアプリを更新できなくなります。

### Android Studio で生成

1. メニュー: **Build → Generate Signed Bundle / APK...**
2. **Android App Bundle** を選んで Next
3. **Key store path** の右の **Create new...** をクリック
4. キーストアファイルの保存先を選ぶ — 例: `~/keystores/logic.keystore`
   - **このファイルは git に絶対 commit しない**
   - クラウドストレージ + パスワードマネージャに**バックアップ必須**
5. 入力項目:
   - **Key store password**: 強力なパスワード(例: 16字 ランダム) — パスワードマネージャに保存
   - **Key alias**: `logic` (任意)
   - **Key password**: 同上(別パスワードでも OK)
   - **Validity (years)**: `25` 以上(Play Store は 25 年以上必須)
   - **Certificate**:
     - First and Last Name: あなたの名前
     - Organizational Unit: 個人なら空でも OK
     - Organization: 個人なら空でも OK
     - City / State / Country Code (例: `JP`)
6. **OK** → キーストア作成完了
7. **次に進む前に** キーストアファイルとパスワードをバックアップ:
   ```bash
   # iCloud Drive / Google Drive / 1Password などへ
   cp ~/keystores/logic.keystore /path/to/secure/backup/
   ```

### ステップ 5.5: `android/keystore.properties` を作成 (ローカルビルド用)

`android/app/build.gradle` は `android/keystore.properties` を読んで署名するようになっています。git にはコミットされません (.gitignore 済み)。

```bash
cp android/keystore.properties.example android/keystore.properties
# 開いてパスを実物に合わせて編集
#   storeFile=../keystores/logic-release.keystore
#   storePassword=<実際のパスワード>
#   keyAlias=logic
#   keyPassword=<実際のパスワード>
```

`storeFile` は `android/` (= rootProject) からの相対パスです。

---

## ステップ 6: AAB ビルド

### 推奨: コマンドラインで一発ビルド

```bash
npm run cap:sync             # Web ビルド + Capacitor sync
cd android
./gradlew bundleRelease
```

成果物: `android/app/build/outputs/bundle/release/app-release.aab`

これを Play Console にアップロードします。

### Android Studio の GUI でビルドする場合

1. **Build → Generate Signed Bundle / APK...**
2. **Android App Bundle** を選んで Next
3. キーストア情報を入力 (ステップ 5 で作ったもの)
4. **Build Variants** で **release** を選択
5. **Create** → 完了通知で **locate** をクリック → `app-release.aab` を取得

---

## CI 経由のリリース (GitHub Actions)

`.github/workflows/android-deploy.yml` が main ブランチへの push (または手動 dispatch) で自動的に AAB をビルドし、Play Console の内部テストトラックに配信します。

必要な GitHub Actions secrets:

| Secret 名 | 内容 |
|---|---|
| `ANDROID_KEYSTORE_BASE64` | キーストアファイルを `base64 -w0` した文字列 |
| `ANDROID_KEYSTORE_PASSWORD` | キーストアのパスワード |
| `ANDROID_KEY_ALIAS` | 鍵のエイリアス (例: `logic`) |
| `ANDROID_KEY_PASSWORD` | 鍵のパスワード |
| `PLAY_STORE_SERVICE_ACCOUNT_JSON` | Play Console API のサービスアカウント JSON 全文 |
| `VITE_API_BASE` | Web ビルド時の API ベース URL |

CI 側ではキーストアを base64 secret から復号 → `android/keystore.properties` を secrets から書き出し → `./gradlew bundleRelease` という流れ。`build.gradle` はローカルと CI で同じものが使えます。

---

## ステップ 7: Play Console でアプリ作成

1. https://play.google.com/console を開く
2. **アプリを作成**
3. 入力:
   - アプリ名: `Logic`
   - デフォルトの言語: 日本語
   - アプリ or ゲーム: **アプリ**
   - 無料 or 有料: **無料**
   - 利用規約に同意 → 作成

---

## ステップ 8: ストア掲載情報の入力

Play Console 左サイドバーから順番に。[store-metadata.md](store-metadata.md) からコピペできます。

### メインストア掲載情報
- **アプリ名**: Logic
- **簡単な説明** (80字): `MECE・ロジックツリー・演繹/帰納をAIで実践練習。3分から学べる論理思考アプリ。`
- **詳細な説明**: store-metadata.md の「詳細説明」をコピー
- **アプリのアイコン**: `assets/icon-only.svg` を https://appicon.co/ などで PNG 化、または Android Studio で生成された `android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png` を使う
- **フィーチャーグラフィック** (1024×500): 別途デザインが必要(後述)
- **電話のスクリーンショット**: 最低 2 枚(後述)

### アプリのコンテンツ
- **プライバシーポリシー URL**: `https://logic-u5wn.onrender.com/privacy.html`
- **広告**: 含まない
- **アプリのアクセス**: すべての機能が制限なしで利用できる
- **コンテンツのレーティング** (質問票):
  - すべて「いいえ」を選択
  - → **すべてのユーザー (Everyone)** が結果
- **ターゲット ユーザーと広告**:
  - 対象年齢: 13〜17 歳, 18 歳以上 (子供向けアプリではない)
- **ニュース アプリ**: いいえ
- **新型コロナアプリ**: いいえ
- **データセーフティ** (重要・後述)
- **政府機関アプリ**: いいえ
- **金融機関アプリ**: いいえ
- **健康アプリ**: いいえ

### データセーフティの回答 (Logic の場合)

**収集または共有するユーザーデータはありますか?** → **はい**

| データの種類 | 収集 | 共有 | 用途 |
|---|---|---|---|
| **デバイス ID または他の ID** | はい | いいえ | アプリの機能(ランキング識別) |
| **アプリ内のアクションやコンテンツ** | はい | いいえ | アプリの機能(学習履歴) |
| **メッセージ・他のアプリ内テキスト** | はい | はい (Anthropic 社へ) | アプリの機能(AI 応答生成) |

- **データの暗号化**: はい (転送中)
- **ユーザーのデータ削除をリクエストできるか**: はい (アプリ内から削除可能)

---

## ステップ 9: 内部テスト配信

1. Play Console 左サイド → **テスト** → **内部テスト**
2. **新しいリリースを作成**
3. **App Bundle をアップロード** → ステップ 6 で作った `app-release.aab` をドラッグ&ドロップ
4. **リリース名**: `0.1.0-beta` など
5. **リリースノート**: store-metadata.md の「ベータテスター向け案内文」をコピー
6. **保存** → **次へ** → **公開を確認**
7. **テスター** タブ:
   - **テスターのリスト** → **メーリング リストを作成** → Gmail アドレスを追加
   - 自分の Google アカウントを必ず入れる
   - 他のベータテスターのメアドも入れる(最大 100 名)
8. **テスト リンクをコピー** → 自分やテスターに送信
9. リンクを Android 端末で開く → Play Store でインストール

> 🚨 内部テストは Play Store の審査を**通らずに即配信**されます。早い。

---

## ステップ 10: 動作確認

1. Android 端末でテストリンクを開く
2. Google アカウントが「テスター」リストに入っているか確認 (入ってないとリンクが無効)
3. インストール → 起動
4. 確認項目:
   - [ ] スプラッシュスクリーンが表示される
   - [ ] オンボーディング 3 画面が表示される
   - [ ] プレイスメントテスト 8 問が動く
   - [ ] ホームに偏差値おすすめカードが出る
   - [ ] レッスン (MECE) が起動する
   - [ ] ロールプレイ → 1 ターンだけプレイ
   - [ ] 「🔔 リマインダー」を ON にして通知許可ダイアログが出る
   - [ ] プロフィール → プライバシーポリシー / 利用規約が開く
   - [ ] プロフィール → 全データを削除 が動く

---

## トラブルシューティング

### `npx cap add android` でエラー
- Android Studio がインストールされてない可能性 → 先にインストール
- `JAVA_HOME` 環境変数が必要な場合がある → Android Studio の bundled JDK パスを設定

### Android Studio で Gradle Sync エラー
- ネット接続を確認
- メニュー: **File → Invalidate Caches and Restart**
- それでもダメなら `android/` フォルダごと削除して `npx cap add android` をやり直す

### "App not signed by the same certificate" エラー
- 署名キーストアが違う/紛失している → 同じキーストアで再ビルドする必要あり
- **このため Step 5 のキーストアバックアップが超重要**

### Play Console に AAB をアップロードできない
- ターゲット SDK が古い → Capacitor 6 はデフォルトで API 34 (要件満たす)
- 署名がない → Step 5 のキーストアで署名し直す

### 通知が届かない
- Android 13+ は通知許可がないと届かない → アプリ初回にダイアログ出るはず
- 設定 → Logic → 通知 で許可されているか確認

---

## フィーチャーグラフィック (1024×500) を作る

Play Store のアプリページ上部に表示される横長画像。必須項目です。

簡単な作り方:
1. https://www.figma.com (無料) で 1024×500 のフレーム作成
2. 背景にクリーム色 `#F5F1E8` のグラデ
3. 中央に Logic のロゴ + アプリ名「Logic」 + キャッチコピー「論理思考を3分から」
4. PNG エクスポート

または **Canva** (https://canva.com) のテンプレートでサクッと作れます。

---

## 次のアクション

**今すぐやること** (順番に):
1. ✋ Google Play Developer アカウント登録 ($25 + 本人確認 1〜3 日)
2. Android Studio をインストール
3. ターミナルで Step 3 のコマンドを順番に実行
4. Android Studio で `android/` を開く
5. エミュレータで動作確認
6. 詰まったら遠慮なく聞いてください 🙋
