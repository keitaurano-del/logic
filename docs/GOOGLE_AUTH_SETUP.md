# Google認証 ネイティブ化 セットアップ手順

## Keitaがやること（Google Cloud Console）

### 1. Google Cloud Console を開く
```
https://console.cloud.google.com
```

### 2. Supabaseプロジェクトに紐づくGCPプロジェクトを確認
- Supabase Dashboard → Authentication → Providers → Google
- 「Google Client ID」「Google Client Secret」が設定されてるはず
- そのClient IDが所属するGCPプロジェクトを使う

### 3. Android用 OAuth クライアントIDを作成
- GCP Console → 「APIとサービス」→「認証情報」
- 「認証情報を作成」→「OAuthクライアントID」
- アプリケーションの種類: **Android**
- パッケージ名: `io.logic.app`
- SHA-1 証明書フィンガープリント: `85:6C:96:01:D9:14:24:6B:DF:E1:76:CD:41:FC:26:FA:D7:34:5D:45`
- 作成ボタン

### 4. Web用のClient IDをメモ
- 同じページにある「ウェブ アプリケーション」タイプのClient IDをコピー
- 形式: `xxxxxxxxxxxx-xxxxxxxxxxxxxxxx.apps.googleusercontent.com`

### 5. 私（Apollo）に教えてほしい値
- **Web Client ID**（serverClientId として設定する）
- Android Client IDは作成するだけでOK（コードには不要）

## Apolloがやること（コード設定）

### capacitor.config.ts
```typescript
GoogleAuth: {
  scopes: ['profile', 'email'],
  serverClientId: '<上記のWeb Client ID>',
  forceCodeForRefreshToken: true,
},
```

### android/app/build.gradle
google-servicesプラグインが必要な場合:
```gradle
apply plugin: 'com.google.gms.google-services'
```

### google-services.json
GCP ConsoleからダウンロードしたJSONを `android/app/` に配置

## 確認方法
1. `npm run build && npx cap sync android`
2. AABビルド → 実機テスト
3. Googleログインボタン → ネイティブのGoogleアカウント選択画面が出ればOK
