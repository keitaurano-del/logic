# iOS リリース手順 — iPad で完結ガイド

このドキュメントは **Mac を持たずに iPad だけで iOS 版を申請・運用する**手順をまとめたものです。
ビルドは GitHub Actions の macOS ランナーで実行し、署名は fastlane match で自動化、
申請は fastlane deliver でプログラム送信します。

> Android 版の運用 ([android-deploy.yml](.github/workflows/android-deploy.yml)) と
> 同じ思想で、Mac を一切触らずに iPad の Safari と GitHub アプリだけで完結できます。

---

## 全体構成

```
iPad (Safari + GitHub アプリ)
   │
   ├─ コード編集 / PR レビュー / マージ
   │
   ▼
GitHub Actions (macos-14)
   │
   ├─ ios-beta.yml   → main push or 手動トリガーで TestFlight 配信
   └─ ios-release.yml → ios-v* タグ push or 手動トリガーで本番審査提出
   │
   ▼
fastlane (ios/App/fastlane/)
   │
   ├─ match  : 証明書 / Provisioning Profile を Git 暗号化保管庫から取得
   ├─ build  : xcodebuild archive → ipa
   ├─ pilot  : TestFlight アップロード
   └─ deliver: メタデータ + ipa を App Store Connect へ
   │
   ▼
App Store Connect (TestFlight アプリ / Safari で確認)
```

---

## 初回セットアップ (1 回だけ / iPad の Safari で完了)

### 1. Apple Developer Program 加入 ($99/年)

iPad の **Apple Developer アプリ** を開いて Enroll → アポロ合同会社の法人 D-U-N-S 番号を入力 → 支払い。

- 法人として登録すると審査に数日〜2 週間かかる場合あり
- 完了後 `Team ID` (10 文字) が割り当てられる → これが `DEVELOPER_TEAM_ID` Secret になる

### 2. App Store Connect で App 作成

[appstoreconnect.apple.com](https://appstoreconnect.apple.com) にアクセス →
**マイ App** → **+** → **新規 App**

| 項目 | 値 |
|---|---|
| プラットフォーム | iOS |
| 名前 | Logic - 論理的思考トレーニング |
| プライマリ言語 | 日本語 |
| Bundle ID | `io.logic.app` (Capacitor 設定と一致) |
| SKU | `logic-ios-2026` (任意の固有 ID) |

`ITC_TEAM_ID` (App Store Connect チーム ID) はアカウント設定 → メンバーシップで確認。

### 3. App Store Connect API キーを発行

[App Store Connect → ユーザーとアクセス → キー](https://appstoreconnect.apple.com/access/api) →
**+** → 名前: `GitHub Actions`, アクセス: **App Manager** → 生成。

| 取得するもの | 用途 |
|---|---|
| **Issuer ID** | `ASC_ISSUER_ID` Secret |
| **Key ID** | `ASC_KEY_ID` Secret |
| **AuthKey_XXXXXXXXXX.p8** ファイル | base64 化して `ASC_KEY_CONTENT` Secret |

`.p8` ファイルは **再ダウンロード不可**。Files アプリに保存しておく。

base64 変換は iPad の Working Copy / a-Shell / Pythonista で:
```bash
base64 -i AuthKey_XXXXXXXXXX.p8 | pbcopy
```
または a-Shell で `base64 AuthKey_XXXXXXXXXX.p8` の出力をコピー。

### 4. fastlane match 用の証明書保管庫リポジトリを作成

GitHub で **プライベートリポジトリ** を新規作成 (例: `keitaurano-del/ios-certificates`)。
中身は空で OK。fastlane が暗号化された証明書 / Provisioning Profile をここに保管する。

| Secret | 値 |
|---|---|
| `MATCH_GIT_URL` | `https://github.com/keitaurano-del/ios-certificates.git` |
| `MATCH_PASSWORD` | 任意の強いパスフレーズ (Bitwarden 等で生成・保管) |
| `MATCH_GIT_BASIC_AUTHORIZATION` | base64(`username:personal_access_token`) — リポへの書き込み権限を持つ PAT |

PAT は GitHub → Settings → Developer settings → Personal access tokens (classic) → `repo` スコープ。
base64: `printf "USERNAME:ghp_xxx" | base64`

### 5. GitHub リポジトリに Secrets を登録

`keitaurano-del/logic` の Settings → Secrets and variables → Actions → New repository secret。

| Secret | 内容 |
|---|---|
| `APPLE_ID` | Apple Developer 登録メアド |
| `DEVELOPER_TEAM_ID` | Apple Developer Team ID (10 文字) |
| `ITC_TEAM_ID` | App Store Connect Team ID |
| `ASC_KEY_ID` | API キーの Key ID |
| `ASC_ISSUER_ID` | API キーの Issuer ID |
| `ASC_KEY_CONTENT` | `.p8` ファイルを base64 化した文字列 |
| `MATCH_GIT_URL` | 証明書保管庫リポジトリ URL |
| `MATCH_PASSWORD` | match の暗号化パスフレーズ |
| `MATCH_GIT_BASIC_AUTHORIZATION` | base64(`user:pat`) |
| `VITE_API_BASE` | 本番 API のベース URL (Android と同じ値) |

---

## 初回ビルド (iPad から手動トリガー)

iPad の **GitHub アプリ** または Safari で `keitaurano-del/logic` を開く →
**Actions** → **iOS → TestFlight (Beta)** → **Run workflow** → ブランチ `main` を選択して実行。

初回は次の流れで自動的に進む:

1. `npm ci` + `npm run build` + `npx cap sync ios`
2. `bundle install` で fastlane / cocoapods をインストール
3. `pod install` で iOS ネイティブ依存を解決
4. `fastlane match` が証明書保管庫リポジトリに **新規証明書 + Provisioning Profile を作成して暗号化保存**
   - 既に証明書がある場合は再利用 (CI モードでは `readonly: false` なので新規発行も可能)
5. `xcodebuild archive` で ipa 生成
6. `pilot` (`upload_to_testflight`) で TestFlight にアップロード
7. App Store Connect 側で 5〜10 分の処理 → TestFlight 内部テスターに即配信

iPad の **TestFlight アプリ**にビルドが届けば成功。

---

## 通常のリリースフロー

### TestFlight ベータ (機能追加 / バグ修正のたび)

1. iPad の Working Copy / GitHub web エディタでコード修正
2. `main` にマージ → **ios-beta.yml が自動実行**
3. 数分後 TestFlight に新ビルドが届く
4. iPad / iPhone の TestFlight アプリで動作確認

ビルド番号は fastlane が App Store Connect の最新ビルド番号 + 1 を自動取得して設定する
([Fastfile](ios/App/fastlane/Fastfile) の `bump_build` lane)。

### App Store 本番審査提出

1. iPad で `npm run ios:bump` 相当の操作 — Safari の GitHub web エディタで
   `ios/App/App/Info.plist` の `CFBundleShortVersionString` を `1.5.3` などに更新してコミット
   (または **ios-release.yml** を `version_name=1.5.3` で手動実行すれば自動 bump)
2. リリースノートを `ios/App/fastlane/metadata/ja/release_notes.txt` と
   `ios/App/fastlane/metadata/en-US/release_notes.txt` で更新
3. Git タグを切る:
   ```bash
   git tag ios-v1.5.3
   git push origin ios-v1.5.3
   ```
   または GitHub web の Releases → Draft a new release で `ios-v1.5.3` タグを作成
4. **ios-release.yml が自動実行** → ipa アップロード + メタデータ送信 + 審査提出
5. 24〜48 時間で審査完了 (`automatic_release: true` なので承認後すぐ公開)

### 緊急時: 任意のブランチでビルドだけしたい

GitHub Actions → ios-beta.yml → Run workflow で対象ブランチを選んで実行。

---

## スクリーンショット

App Store のスクリーンショットは **App Store Connect の Web UI から手動アップロード**を推奨
(Deliverfile で `skip_screenshots(true)` 設定済み)。

理由:
- iOS は 6.7" / 6.5" / 5.5" / iPad の最低 4 サイズが必要
- 既存の `store-screenshots/` (Android 1080×1920) は iPad で再撮影が必要
- 一度アップロードすれば次回以降そのまま使われる

将来的に自動化するなら fastlane snapshot を別途追加。

---

## トラブルシューティング

### `fastlane match` が証明書を見つけられない

初回は `readonly: false` で **新規発行**を試みる。GitHub Actions のログで
`Creating certificate...` が出ているか確認。失敗する場合は:

1. Apple Developer ポータルで既存の Distribution 証明書を確認
2. App Store Connect で App ID `io.logic.app` が登録済みか確認
3. `MATCH_GIT_BASIC_AUTHORIZATION` の PAT に `repo` 権限があるか確認

### "No profiles for 'io.logic.app' were found"

App Store Connect で App を先に作成してから match を実行する必要がある (上記初回セットアップ手順 2)。

### `pod install` が失敗

`ios/App/Podfile.lock` を削除して再実行 (CI ではキャッシュをクリアして再 run)。

### TestFlight ビルドが "Invalid Binary"

Xcode 側で署名できていない or Bundle ID が App Store Connect と一致しない。
`capacitor.config.ts` の `appId` と App Store Connect の Bundle ID と
`APP_BUNDLE_ID` 環境変数がすべて `io.logic.app` で一致している必要がある。

### Sentry / Google Auth が動かない

- Sentry: Web ビルド時に `VITE_SENTRY_DSN` を Secret に追加
- Google Auth: `Info.plist` の `GIDClientID` と `CFBundleURLSchemes` が
  Capacitor の Google Cloud Console で発行した iOS クライアント ID と一致しているか確認

---

## 参考: 各ファイルの役割

| ファイル | 役割 |
|---|---|
| `ios/App/fastlane/Fastfile` | ビルド lane の定義 (`beta`, `release`) |
| `ios/App/fastlane/Appfile` | Bundle ID / Apple ID / Team ID |
| `ios/App/fastlane/Matchfile` | 証明書保管庫リポジトリ設定 |
| `ios/App/fastlane/Deliverfile` | App Store メタデータ送信設定 |
| `ios/App/fastlane/metadata/{ja,en-US}/` | App Store 表示文言 (説明・キーワード等) |
| `ios/App/Gemfile` | Ruby 依存 (fastlane / cocoapods) |
| `ios/App/Podfile` | iOS ネイティブ依存 (Capacitor が自動生成) |
| `ios/App/App/Info.plist` | iOS 表示名 / バージョン / URL スキーム |
| `.github/workflows/ios-beta.yml` | TestFlight 配信 |
| `.github/workflows/ios-release.yml` | App Store 審査提出 |
| `scripts/bump-ios-version.js` | マーケティングバージョン上げ |

---

## コスト目安

| 項目 | 月額 |
|---|---|
| Apple Developer Program | $99/年 ÷ 12 ≒ $8.25 |
| GitHub Actions macOS runner | 月 8〜10 ビルドまで無料、超過 1 ビルド ≒ $1.5〜2 |
| 合計 (通常運用) | **月 $10〜$20** |
