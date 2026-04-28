# Logic モバイル配信システム 運用設計書

> Version: 1.0 | 作成日: 2026-04-28 | 担当: Apollo (AI CEO)

---

## 1. 全体方針の要約

| 項目 | 方針 |
|------|------|
| **配信方式** | Capacitor Wrapper (既存Web資産を最大活用) |
| **優先プラットフォーム** | Android 先行 → iOS |
| **指示窓口** | Microsoft Teams |
| **主担当エージェント** | Genspark Claw |
| **定型処理** | Genspark Workflows |
| **複雑処理** | Advanced Workflows |
| **クレジット節約** | 最優先。毎回ゼロから調査しない |
| **第1目標** | ストア配信可能な初版到達 |

---

## 2. 推奨技術方針（1案）

### 採用案: Capacitor Wrapper（現行構成を継続・強化）

**理由**: Logic は既に Capacitor 6 実装済み。`android/` ディレクトリ、`.aab` ファイル (v1.2.0)、`capacitor.config.ts` も揃っている。ゼロから構築する必要は一切ない。

```
現在地: Capacitor v6 実装済み / .aab ビルド済み
次のステップ: Google Play Console に内部テスト配信 → iOS 準備
```

**比較検討した案（却下）**:
- React Native 移行: Web資産を捨てることになる。クレジット・工数ともに高コスト。不採用。

**Android 現状**:
- `logic-v1.2.0-vc11.aab` → Play Console にアップロード可能な状態
- Keystore: `/home/work/.openclaw/workspace/keystores/` に保管済み
- Bundle ID: `io.logic.app`

**iOS 現状**:
- `ios/` ディレクトリは要セットアップ（Mac + Xcode 必須）
- Apple Developer Program 登録要確認

---

## 3. Teams起点の運用アーキテクチャ

### グループチャット構成

| グループチャット名 | 用途 | 受信者 |
|---------|------|-------|
| 「🔨 Logic ビルド管理」 | ビルド依頼・ビルド結果通知 | Claw + 開発担当 |
| 「🚀 Logic リリース」 | リリース候補・ストア提出・承認フロー | Keita-san + Claw |
| 「🐛 Logic バグ報告」 | バグ報告・トリアージ結果 | Claw + Keita-san |
| 「💡 Logic プロダクト」 | 機能依頼・ロードマップ・意思決定 | Keita-san + Claw |

### メッセージの流れ

```
Keita-san (Teams)
    │
    ▼
「🔨 Logic ビルド管理」 / 「💡 Logic プロダクト」 / 「🐛 Logic バグ報告」
    │
    ▼
Claw が受信・分類・計画化
    │
    ├── 定型タスク → Genspark Workflows (自動実行)
    ├── 複雑タスク → Advanced Workflows (分岐・承認)
    └── 実装タスク → Claude Code / Codex に委譲
    │
    ▼
結果 → Teams 各チャネルに通知
```

---

## 4. 役割分担

### Genspark Claw の担当

| 役割 | 具体的な作業 |
|------|------------|
| 要件整理 | Teams メッセージを読み、意図を要約・分類 |
| 差分設計 | コード差分の特定、影響範囲の提示 |
| ドキュメント作成 | 運用設計書・テンプレート・チェックリスト更新 |
| バグ要約 | バグ報告の分類・重要度判定・対応案提示 |
| 実装支援 | Claude Code への具体的タスク委譲 |
| リリース調整 | ビルド番号管理・ストア提出確認 |

**Claw がやらないこと**:
- 毎回フルコードリード（既知情報は再利用）
- 毎回Webリサーチ（前提知識を蓄積して使い回す）
- ストア審査（人間作業）
- iOS ビルド（Mac必要）

### Genspark Workflows の担当

| ワークフロー名 | トリガー | アクション |
|--------------|---------|---------|
| `logic-classify-request` | Teams 「💡 Logic プロダクト」 メッセージ | 依頼分類 → Claw に渡す |
| `logic-build-notify` | ビルド完了イベント | ビルド結果を 「🔨 Logic ビルド管理」 に通知 |
| `logic-bug-intake` | 「🐛 Logic バグ報告」 への投稿 | バグテンプレート自動返信 |
| `logic-release-candidate` | バージョンタグ push | リリース候補を 「🚀 Logic リリース」 に通知 |

### Advanced Workflows の担当

| ワークフロー名 | 用途 |
|--------------|------|
| `logic-prerelease-check` | リリース前チェックリスト実行・結果集約 |
| `logic-store-submit-approval` | ストア提出前の Keita-san 承認待ちフロー |
| `logic-bug-escalation` | 重大バグ時の自動エスカレーション |
| `logic-exception-handler` | ビルド失敗・例外時の分岐処理 |

### Teams の役割

- **指示受付**: Keita-sanが依頼を投稿する場所
- **承認窓口**: リリース・ストア提出の Go/No-go
- **通知受信**: ビルド結果・バグ要約・配信状況が届く場所
- **意思決定ログ**: 承認履歴が残る

---

## 5. 実装依頼フロー

```
[Keita-san] Teams 「💡 Logic プロダクト」 に投稿
    │  テンプレート: → 「実装依頼テンプレート」参照
    ▼
[Claw] 受信・解析（30秒以内）
    ├── 実装範囲を特定（差分ベース）
    ├── 影響ファイルを列挙
    └── 見積もり（Small/Medium/Large）を返信
    │
    ▼ Keita-sanが「Go」と返信
    │
[Claw → Claude Code] 実装タスクを委譲
    │  ・差分コードのみ生成
    │  ・テスト実行
    │  ・SIT にデプロイ (develop branch)
    ▼
[Workflows] ビルド結果を 「🔨 Logic ビルド管理」 に通知
    │
    ▼
[Keita-san] SIT で動作確認 → 「本番OK」と返信
    │
[Claw] main マージ + Render 本番デプロイ
```

**所要時間目安**:
- Small (1ファイル変更): 15〜30分
- Medium (3ファイル以内): 1〜2時間
- Large (設計変更): 要計画書作成 → 別フロー

---

## 6. リリース準備フロー

```
[トリガー] Keita-san が 「🚀 Logic リリース」 に「リリース準備」と投稿
    │
    ▼
[Claw] リリース前チェックリスト実行（自動）
    ├── [ ] SIT で全機能動作確認済み？
    ├── [ ] バグ未対応の P0/P1 はないか？
    ├── [ ] versionCode / versionName は上がっているか？
    ├── [ ] store-metadata.md は最新か？
    └── [ ] Keystore は利用可能か？
    │
    ▼ チェックOK
[Advanced Workflows] ストア提出前確認フロー起動
    ├── AAB ビルド自動実行
    ├── ビルド成功 → 「🚀 Logic リリース」 に結果通知
    └── ビルド失敗 → 「🔨 Logic ビルド管理」 にエラー詳細
    │
    ▼
[Keita-san] 「🚀 Logic リリース」 で「提出承認」
    │
[Claw] Play Console / App Store Connect へ提出手順を提示
（実際の提出操作は Keita-san が実施 または 委任）
    │
    ▼
[Workflows] 配信状況を 「🚀 Logic リリース」 に定期通知
```

**Android AAB ビルドコマンド（自動化済み）**:
```bash
cd /home/work/.openclaw/workspace/logic
git pull
npm run build
node scripts/bump-android-version.js
npx cap sync android
# → android/app/release/app-release.aab が生成される
```

---

## 7. バグトリアージフロー

```
[誰でも] 「🐛 Logic バグ報告」 にバグ報告を投稿
    │  テンプレート: → 「バグ報告テンプレート」参照
    ▼
[Workflows] 自動受付確認メッセージ返信
    │
    ▼
[Claw] トリアージ実行（1時間以内）
    ├── 重要度判定: P0(即時対応) / P1(24h) / P2(次スプリント) / P3(バックログ)
    ├── 影響範囲: プラットフォーム・機能・ユーザー数
    ├── 原因仮説: コードを差分で確認
    └── 対応案: 修正方針を簡潔に提示
    │
    ▼ P0/P1 の場合
[Advanced Workflows] エスカレーション
    ├── Keita-san に即時通知
    └── 緊急対応フロー起動
    │
    ▼ P2/P3 の場合
[Claw] Jira バックログに自動登録
    └── 次スプリントで対応
```

**重要度定義**:
| 優先度 | 定義 | 対応時間 |
|--------|------|---------|
| P0 | ストア評価1星・クラッシュ・認証不能 | 即時 |
| P1 | 主要機能が動かない | 24時間以内 |
| P2 | 一部機能の不具合 | 次スプリント |
| P3 | UI微調整・要望 | バックログ |

---

## 8. クレジット節約ルール

### 基本原則

1. **プロジェクト前提文を毎回使う** → 下記「前提文」をコピペして依頼冒頭に貼る
2. **差分単位で依頼する** → 「このファイルのこの関数を変更」という粒度
3. **1回の依頼 = 成果物1〜2個まで**
4. **再試行は最大2回** → 3回目は設計を見直す
5. **不明点は推測範囲を明示してから聞く** → 「〇〇と仮定して進めていい？」
6. **ビルド/テスト/デプロイは自動化** → 手動は承認操作のみ

### プロジェクト前提文（依頼冒頭にコピペ）

```
【Logic プロジェクト前提】
- アプリ: Logic (論理思考トレーニング)
- 技術: React + Vite + Capacitor v6 + Supabase
- SIT: https://logic-sit.onrender.com/ (develop branch)
- 本番: https://logic-u5wn.onrender.com/ (main branch)
- Bundle ID: io.logic.app
- Android: AAB ビルド済み (v1.2.0-vc11)
- Keystore: /home/work/.openclaw/workspace/keystores/ に保管
- デプロイルール: SIT確認→Keita-san承認→本番デプロイ
```

### 1回の依頼で扱う作業量の上限

| サイズ | 変更ファイル数 | 所要時間 | 例 |
|--------|-------------|---------|---|
| Small | 1〜2ファイル | 〜30分 | テキスト修正・スタイル変更 |
| Medium | 3〜5ファイル | 1〜2時間 | 機能追加・API連携 |
| Large | 6ファイル以上 | 要分割 | 設計変更は必ず分割依頼 |

### 毎回やらないこと

- ❌ SITのコード全体読み直し（前回の差分情報を使う）
- ❌ Supabaseスキーマ全体確認（変更点だけ確認）
- ❌ 関係ない画面のテスト実行（影響範囲だけテスト）
- ❌ 毎回のWebリサーチ（ドキュメントはキャッシュを使う）

---

## 9. MVP成果物一覧

### Phase 1: 今すぐ完成している（本ドキュメントセット）

| # | 成果物 | 場所 | ステータス |
|---|--------|------|---------|
| 1 | 運用設計書 | `docs/MOBILE-DELIVERY-SYSTEM.md` | ✅ 本書 |
| 2 | Teams指示テンプレート | `docs/templates/TEAMS-TEMPLATES.md` | ✅ 作成済み |
| 3 | Build/Releaseチェックリスト | `docs/templates/BUILD-RELEASE-CHECKLIST.md` | ✅ 作成済み |
| 4 | バグ報告テンプレート | `docs/templates/BUG-REPORT.md` | ✅ 作成済み |
| 5 | ストア提出準備テンプレート | `docs/templates/STORE-SUBMISSION.md` | ✅ 作成済み |
| 6 | ワークフロー仕様書 | `docs/WORKFLOW-SPEC.md` | ✅ 作成済み |

### Phase 2: 次7日以内に作る

| # | 成果物 | 担当 |
|---|--------|------|
| 7 | Teams Webhook 設定 | Keita-san + Claw |
| 8 | Workflows 実装（4本） | Genspark Workflows |
| 9 | Play Console 内部テスト配信 | Keita-san (AABアップロード) |
| 10 | iOS 開発者アカウント確認 | Keita-san |

---

## 10. 不足確認事項（最大5個）

以下のみ確認が必要。推測で進められないもの限定。

| # | 質問 | 重要度 | 用途 |
|---|------|--------|------|
| 1 | Google Play Developer アカウントは登録済み？（$25支払い + 本人確認完了）| 🔴 最重要 | Android配信に必須 |
| 2 | Apple Developer Program は登録済み？（$99/年）| 🟡 重要 | iOS配信に必須 |
| 3 | Microsoft Teams の Webhook URL または Bot Token はある？| 🟡 重要 | 通知システム構築に必要 |
| 4 | Fiverr自動化・円茶会への横展開は、いつ頃を想定している？| 🟢 中 | 設計の汎用化優先度判断 |
| 5 | iOS は Android と同時配信を目指す？それとも Android 先行？| 🟢 中 | ロードマップのスコープ調整 |

---

## 11. 直近7日でやるべきこと

### Day 1-2: Android 配信を確定させる

```
Keita-san作業（30分）:
□ Play Console https://play.google.com/console を開く
□ logic-v1.2.0-vc11.aab を内部テストにアップロード
□ 自分の Gmail でテスト配信を受け取る
□ Android 実機で動作確認（チェックリスト参照）

Claw作業:
□ build-ops チャネル向け通知テンプレート準備
□ Jira タスク登録スクリプト確認
```

### Day 3-4: Teams 通知基盤を整える

```
Keita-san作業（15分）:
□ Teams に以下チャネルを作成:
  - 「🔨 Logic ビルド管理」
  - 「🚀 Logic リリース」
  - 「🐛 Logic バグ報告」
  - 「💡 Logic プロダクト」
□ 各チャネルの Incoming Webhook URL を Claw に渡す

Claw作業:
□ Slack Webhook と同様に Teams Webhook を組み込む
□ ビルド通知スクリプトを更新
```

### Day 5-6: バグトリアージ体制を稼働

```
Claw作業:
□ 「🐛 Logic バグ報告」 へのバグ報告フォーマットを周知
□ トリアージ自動化スクリプト（Claw → Jira連携）確認
□ P0バグ発生時の緊急対応フロー文書化
```

### Day 7: iOS 準備開始

```
Keita-san確認:
□ Apple Developer Program の状況確認
□ Mac環境でのXcodeビルド計画を立てる

Claw作業:
□ iOS ビルド・TestFlight 手順書の更新
□ App Store メタデータ準備
```

---

## 横展開設計（Fiverr / 円茶会への応用）

本システムの以下要素は汎用化してある:

| 要素 | Fiverr自動化への転用 | 円茶会への転用 |
|------|---------------------|-------------|
| Teams 通知基盤 | 新規注文通知 → #fiverr-orders | 予約確認 → #chakai-bookings |
| Workflowsの分類ロジック | 依頼タイプ判定 | イベントタイプ判定 |
| バグトリアージフロー | サポート対応フロー | クレーム対応フロー |
| クレジット節約ルール | 同じルールをそのまま適用 | 同じルールをそのまま適用 |
| 前提文テンプレート | Fiverrプロジェクト用に差し替え | 円茶会プロジェクト用に差し替え |

---

*このドキュメントは Claw が管理します。変更は差分ベースで更新。*
