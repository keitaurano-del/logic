# Play Console — App Content チェックリスト & 回答案

> **目的:** Internal Test を draft → completed に戻すために、Play Console「App content」セクション 13 項目を全部完了させる。
> **対象アプリ:** `com.logicalthinking.app` (v1.5.2 / versionCode 21)
> **凜による下調べ:** privacy.html / CLAUDE.md / HIG_MATERIAL_AUDIT_20260504.md / コードベース現状を踏まえた回答案
> **作成日:** 2026-05-11

---

## クイックステータス

| # | 項目 | 状態 | 必須アクション |
|---|---|---|---|
| 1 | プライバシーポリシー | ✅ 準備済 | URL 入力のみ |
| 2 | アプリのアクセス | ⚠️ 要対応 | **テストアカウント作成** |
| 3 | 広告 | ✅ 即答可 | 「広告なし」 |
| 4 | コンテンツのレーティング | ⚠️ 要対応 | アンケート回答（5分程度） |
| 5 | 対象ユーザー層と年齢 | ✅ 即答可 | 「13歳以上」 |
| 6 | ニュースアプリ | ✅ 即答可 | いいえ |
| 7 | 政府アプリ | ✅ 即答可 | いいえ |
| 8 | 金融機能 | ✅ 即答可 | いいえ |
| 9 | 健康関連 | ✅ 即答可 | いいえ |
| 10 | **データセーフティ** | ⚠️ **要対応** | フォーム入力（最重要・10分） |
| 11 | アプリのカテゴリ | ✅ 設定済の可能性 | 教育 |
| 12 | タグ | ✅ 設定済の可能性 | listing.md 参照 |
| 13 | (リジリエンス系任意項目) | — | スキップ可 |

---

## 1. プライバシーポリシー

**Play Console フィールド:** Privacy policy URL

**回答:**
```
https://logic-u5wn.onrender.com/privacy.html
```

**確認済 (2026-05-11 by 凜):**
- ✅ `https://logic-u5wn.onrender.com/privacy.html` → HTTP 200、コンテンツは Logic 本物（最終更新日 2026年5月4日）
- ✅ `https://logic-u5wn.onrender.com/terms.html` → HTTP 200

**⚠️ 将来対応 (任意):**
- `logic-m.com/privacy.html` は現在 Squarespace の「近日中に公開」状態。長期運用ではカスタムドメイン側で privacy/terms を公開して URL を差し替えるのが理想
- 内部テストを通すだけなら Render URL で十分

---

## 2. アプリのアクセス

**Play Console フィールド:** All or some functionality is restricted

**回答:** 「**一部の機能が制限されている**」を選択

**理由:** Email / Google OAuth ログインがあり、未ログインでも一部機能（プレースメントテスト、レッスン閲覧）は使えるが、進捗保存・ロールプレイ等はログイン必須。

**Play Console 提供用テストアカウント:**

| Field | Value |
|---|---|
| Username | `play-review@logic-m.com` |
| Password | (要発行 — 強パスワード) |
| Instructions | "Sign in with email/password from welcome screen. All features unlocked after sign-in." |
| Any other | "Optional: sign in with Google OAuth using a personal Google account works identically." |

**アクション:**
- [ ] Supabase で `play-review@logic-m.com` アカウントを作成
- [ ] 該当ユーザーに `subscriptions.plan = 'premium'` (または最上位プラン) を付与して全機能 unlock
- [ ] Play Console > App content > App access に上記情報を入力

---

## 3. 広告

**Play Console フィールド:** Does your app contain ads?

**回答:** **No, my app does not contain ads.**

**根拠:** AdMob / AdSense / 任意の広告 SDK は未導入。コードベース確認済み。

---

## 4. コンテンツのレーティング (IARC アンケート)

**Play Console フィールド:** Content rating questionnaire

**カテゴリ選択:** Reference, News, or Educational

**主要質問への回答:**

| 質問 | 回答 |
|---|---|
| Violence (any kind) | No |
| Sexuality / Nudity | No |
| Profanity / Crude humor | No |
| Controlled substances | No |
| Gambling / Simulated gambling | No |
| User-generated content shared between users | No（AI 対話はユーザー間共有ではない） |
| Real-money transactions | Yes（サブスク課金あり）|
| Location sharing | No |
| Personal info sharing | No（社内利用のみ） |
| Web browsing (unrestricted) | No |
| Digital purchases | Yes（Google Play 課金） |

**想定取得レーティング:**
- IARC: 3+
- ESRB: Everyone
- PEGI: 3
- USK: 0

---

## 5. 対象ユーザー層と年齢

**Play Console フィールド:** Target audience and content

**回答:**
- **Target age groups:** `18 and over` を選択（メインターゲット）
  - もしくは `13-15, 16-17, 18 and over` 複数選択（より広く）
- **Is your app appealing to children?** No
- **Family Policy:** Does NOT apply（子供向けではない）

**根拠:** ビジネスパーソン・就活生向け。privacy.html で「13歳以上対象」と明記。

---

## 6. ニュースアプリ

**回答:** **No**

---

## 7. 政府アプリ

**回答:** **No**

---

## 8. 金融機能

**回答:** **No**

(サブスク課金は Google Play 課金で処理。Logic 自体は金融サービスを提供しない)

---

## 9. 健康関連

**回答:** **No**

---

## 10. データセーフティ (最重要)

**Play Console フィールド:** Data safety form

### 10-1. データ収集の有無

**Does your app collect or share any of the required user data types?** → **Yes**

### 10-2. データタイプ別申告

| カテゴリ | データ種別 | 収集 | 共有 | 必須/任意 | 用途 | 暗号化 | 削除可 |
|---|---|---|---|---|---|---|---|
| **Personal info** | Email address | ✅ | ❌ | 必須 | アカウント機能、本人確認 | ✅ | ✅ |
| **Personal info** | Name | ✅ | ❌ | 任意 | アカウント機能 | ✅ | ✅ |
| **Personal info** | User IDs | ✅ | ❌ | 必須 | アカウント機能 | ✅ | ✅ |
| **App activity** | App interactions | ✅ | ❌ | 必須 | アプリ機能、分析 | ✅ | ✅ |
| **App activity** | In-app search history | ❌ | — | — | — | — | — |
| **App activity** | Other user-generated content | ✅ | ❌ | 必須 | アプリ機能（フェルミ回答・ロールプレイ会話を Anthropic API で処理） | ✅ | ✅ |
| **App info & performance** | Crash logs | ✅ | ❌ | 任意 | アプリ機能、分析 | ✅ | ❌ |
| **App info & performance** | Diagnostics | ✅ | ❌ | 任意 | アプリ機能、分析 | ✅ | ❌ |
| **Device or other IDs** | Device or other IDs | ❌ | — | — | — | — | — |

❗ **重要:** 「Sharing（共有）」は「広告・分析等のため第三者にデータを渡すこと」を指す。Logic では Supabase / Anthropic / Google Play は**データ処理委託先（processor）**なので「共有」ではなく「収集（自社用途）」扱い。Google の定義に従い、**Sharing はすべて No** で正解。

### 10-3. セキュリティ慣行

| 質問 | 回答 |
|---|---|
| Is all of the user data collected by your app encrypted in transit? | **Yes** (HTTPS / TLS) |
| Do you provide a way for users to request that their data be deleted? | **Yes** (`support@logic-m.com` で受付 — privacy.html 第5条) |

### 10-4. 子供のデータ

**Yes / No: Does the data collection meet families policy requirements?** → アプリは子供向けではないので **N/A**（Section 5 で「子供向けではない」と申告するため）

---

## 11. アプリのカテゴリ

**Play Console フィールド:** App category

**回答:** Education

---

## 12. タグ / ストアリスティング

詳細は `docs/play-store-listing.md` 参照。

---

## 完了後のフロー

1. ✅ 全 13 項目を Play Console で **Completed** にする
2. ✅ Play Console > Internal testing > Releases で **Promote / Resume** または新リリース作成
3. ✅ `app/build.gradle` の versionCode が衝突しないことを確認（現在 21）
4. ✅ Internal Test トラックの Tester リストにレビュー対象アカウントが含まれているか確認
5. ⚠️ 直近のコミット `6796327 revert: status を draft に戻す` を **再リバート**するのではなく、新規リリースを `completed` で作成する方が安全（git history のクリーンさのため）

---

## 未確定事項（Keita 確認必要）

- [x] ~~`logic-m.com/privacy.html` が本番で公開済みか~~ → ❌ Squarespace で未公開。代わりに `logic-u5wn.onrender.com/privacy.html` を採用（2026-05-11 確認）
- [ ] Play Console の Internal Test トラックに既に登録済みのテスター email リスト
- [ ] テスト用アカウント `play-review@logic-m.com` のメールが受信可能か（Email login で使う）
- [ ] サブスクの IAP（in-app product）登録が Play Console 側で完了しているか（4-real-money-transactions の補強情報）

---

## テスト用アカウント作成手順（Section 2 用）

**Keita 作業:**

1. Supabase Studio (`https://supabase.com/dashboard/project/yctlelmlwjwlcpcxvmgx`) を開く
2. Authentication → Users → **"Add user"** → "Create new user"
   - Email: `play-review@logic-m.com`
   - Password: 強パスワード生成（Play Console にも記載する）
   - **Auto Confirm User**: ✅ ON（メール確認スキップ）
3. 作成後の User UID をコピー
4. SQL Editor で以下を実行（`{UUID}` を置換）:

```sql
-- profiles に追加（auth.users 作成時に自動生成されない場合の保険）
INSERT INTO public.profiles (id, nickname, language)
VALUES ('{UUID}', 'Play Reviewer', 'ja')
ON CONFLICT (id) DO NOTHING;

-- admin_overrides で premium 付与（最もクリーン）
INSERT INTO public.admin_overrides (user_id, plan, granted_by, note)
VALUES (
  '{UUID}',
  'premium',
  'rin',
  'Google Play Console review account — full access for store review'
)
ON CONFLICT (user_id) DO UPDATE SET plan = 'premium';
```

**なぜ `admin_overrides` を使うか:** Logic は subscriptions テーブルとは別に `admin_overrides`（003 migration）で plan 強制付与する仕組みがある。Stripe/IAP のステータスと矛盾しない安全な方法。

---

## 参考リンク

- [Google Play Console help: App content](https://support.google.com/googleplay/android-developer/answer/10787469)
- [Data safety form: Google overview](https://support.google.com/googleplay/android-developer/answer/10787469#data_safety)
- 既存ドキュメント:
  - `docs/play-store-listing.md` (掲載文・スクショ説明)
  - `docs/HIG_MATERIAL_AUDIT_20260504.md` (Data Safety Form 更新タスクの記載元)
  - `docs/BETA_TO_GA.md` (privacy 更新日チェック項目)
  - `public/privacy.html` (本番プライバシーポリシー実体)
