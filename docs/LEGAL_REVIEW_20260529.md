# Logic 法務記載レビュー (2026-05-29)

Keita 依頼「利用規約とかプライバシーポリシーとか特定商取引法に基づく表記とかの記載を見直して」への点検結果と修正ドラフト。

作業制約: dev-logic が i18n.ts / テーマ系を編集中のため、本レビューでは **ソースコード（i18n.ts / 法務 HTML 本体）を一切編集していない**。点検と修正案の作成までに留め、成果はこのドキュメントにのみ記載する。実際のソース反映は後続の別タスクで行う。

---

## 1. 法務記載の在処一覧

法務文書はすべて `public/*.html` の静的 HTML として配置され、アプリからは Profile 画面の SettingRow → `window.open(localizedHtmlPath(slug))` で開く。`localizedHtmlPath`（src/i18n.ts:33）が locale に応じて `/<slug>.html`（ja）か `/<slug>-en.html`（en）を返す。

| 文書 | ja | en | アプリからのリンク元 |
|---|---|---|---|
| 利用規約 | `public/terms.html` | `public/terms-en.html` | ProfileScreenV3.tsx:242（`profile.terms`） |
| プライバシーポリシー | `public/privacy.html` | `public/privacy-en.html` | ProfileScreenV3.tsx:243（`profile.privacy`） |
| 特定商取引法に基づく表記 | `public/tokushoho.html` | `public/tokushoho-en.html` | ProfileScreenV3.tsx:244 / Profile.tsx:378（`profile.tokushoho`） |
| アカウント削除（詳細版） | `public/account-deletion.html` | `public/account-deletion-en.html` | privacy.html 等から導線（Play Console データ削除 URL 候補） |
| アカウント削除（簡易版） | `public/delete-account.html` | `public/delete-account-en.html` | 同上（重複ページ。下記 H-2 参照） |

補足:
- 法務本文に i18n.ts のキーは使っていない（HTML にハードコード）。i18n.ts 側の法務関連は (a) `localizedHtmlPath` のルーティング、(b) `profile.terms` / `profile.privacy` / `profile.tokushoho` のメニュー見出し、(c) `pricing.*` の価格文言、のみ。
- HTML は計 10 ファイル（5 文書 × ja/en）。task-manager が言及した「6 HTML」は terms/privacy/tokushoho × ja/en の中核 6 枚を指していたと思われる。実際は削除系を含めて 10 枚ある。

---

## 2. 検出した不備（重大度つき）

重大度: 重大 = 法令必須・課金実態と矛盾・本番で誤情報、中 = 整合性/信頼性に影響、低 = 文言・体裁。

### 重大

C-1. 特商法の価格がアプリの実装価格と完全に食い違っている【最重要】

`public/tokushoho.html` / `tokushoho-en.html` は2段階プラン（スタンダード＋プレミアム）で4つの価格を掲示している:
- スタンダード月額 ¥390 / 年額 ¥2,730
- プレミアム月額 ¥760 / 年額 ¥5,320

しかし現行アプリの実装は **単一有料プラン**で、価格は次のとおり（src/subscription.ts:19-22）:
```
export const PLAN_PRICES = { monthly: 350, yearly: 2450 } as const
```
- 月額 ¥350 / 年額 ¥2,450
- SKU は `logic_paid_monthly` / `logic_paid_yearly`（src/billing/products.ts:10-13）の2つだけ
- `subscription.ts` のコメントに「2026-05-15 単一有料プラン化」と明記されており、スタンダード/プレミアムの2段階構成は**廃止済み**。`mapProductIdToPlan` でも旧 SKU（standard_*, premium_*, basic_*, campaign_*）はレガシー正規化用に残しているだけで新規購入には使われない。
- i18n.ts の価格文言もすべて ¥350 / ¥2,450 で統一されている（`pricing.heroHeadline` で「月 ¥350」、`fermi.upsellBody` で「月¥350／年¥2,450」）。

つまり特商法ページだけが「廃止済みの2段階プラン × どの時点とも一致しない価格」を掲示している。特商法表記は課金アプリで法的に必須かつ「実際の販売条件」を正確に書く義務があるため、これは最優先で是正が必要。

参考: 旧 `PRICING_PLAN_FINAL_V2.md` はスタンダード ¥390/¥2,730（プレミアム無し）。特商法の ¥390/¥2,730 はこの旧プランの残骸、プレミアム ¥760/¥5,320 はさらに別の旧構想の残骸と推定。いずれも現行と不一致。

C-2. 無料トライアルの記載が課金実態と一致しているか要確認

特商法・privacy・onboarding に「7日間無料トライアル」の記載がある:
- tokushoho.html「新規ユーザーは登録から7日間、プレミアム機能を無料で試用可能」
- i18n.ts `onboarding.step3.title`「7日間、無料で試せます」/ en「Try free for 7 days」

一方、トライアルの実体はコード上に見当たらない:
- `PricingScreen.tsx` / `Pricing.tsx` には 7 日トライアルの文言・ロジックなし
- `subscription.ts` に freeTrialDays / introductoryPrice 等のトライアル定義なし（trial はレガシープラン正規化の分岐として残るのみ）
- Google Play 側の無料試用は Play Console の base plan/offer 設定に依存する。コードには現れないため、Play Console 側で実際に7日 free trial offer が設定されているかは Keita 確認が必要。

リスク: もし Play Console に7日トライアルが設定されていないのに特商法・onboarding で「7日間無料」と謳っていると、優良誤認・不実告知に当たる。逆に設定済みなら記載は妥当だが「プレミアム機能」という旧プラン用語が残っている（C-1 と同根、単一プランなので「プレミアム機能」→「有料機能」に直すべき）。

C-3. 「プレミアム機能」という廃止済みプラン名がアプリ実態と矛盾

tokushoho.html の複数箇所に「プレミアム機能が有効化」「プレミアム機能を利用できない期間」等。単一有料プラン化後は「プレミアム」というプラン区分は存在しない（free / paid のみ）。i18n では `pricing.planPaid`=「有料」で統一済み。特商法だけ旧用語。

### 中

H-1. Google ログインの記載がマジックリンク専用方針と矛盾

privacy.html / privacy-en.html / account-deletion.html に「Google アカウント情報（Google ログイン利用時）」「Google account information (when using Google Sign-In)」「Google アカウント連携情報」の記載がある。しかし Logic の認証は **マジックリンクのみ**（メモリ feedback-logic-auth-magiclink-only、Google ログインは UI・関数とも削除方針）。Google ログインを提供していないなら、これらの記載は実態にない情報を集めると誤認させるため削除または「（過去に提供していた場合）」等の整理が必要。要 Keita 確認（Play Console 上で Google ログインを完全に廃止済みか）。

H-2. アカウント削除ページが2系統あり内容が食い違う

`account-deletion.html`（詳細版・条文形式・第1〜5条）と `delete-account.html`（簡易版・手順カード形式・削除完了通知の文言）が併存し、内容・トーン・更新日が異なる（diff で別物）。en も同様に2系統。どちらを正とするか統一し、もう一方は削除するか正へリダイレクトすべき。二重メンテはズレの温床。Play Console の「アカウント削除 URL」がどちらを指しているかも要確認（齟齬があると審査・ユーザー混乱の原因）。

H-3. 最終更新日が古い・文書間でバラバラ

- terms / privacy / tokushoho: 2026年5月4日
- account-deletion: 2026年5月11日
- delete-account: 日付記載なし（「データの削除および退会について」のみ）

C-1（5/15 の単一プラン化）より前の日付のまま。価格・プラン改定を反映する以上、更新日も改める必要がある。文書間で更新日が揃っていないのも体裁として不統一。

H-4. ベータ版条項が Production リリース後も残存

terms.html「2. ベータ版について」が、機能変更・データ消失・サービス全停止・端末間でデータ引き継ぎ不可、を列挙。Logic は既に 1.0.0 Production リリース済み（Play Console Production 公開済み、メモリ参照）。GA 後も「ベータ版」「データ消失あり」を前面に出すのはユーザー信頼・ストア審査の観点で要再検討。デバイス同期は実装状況に合わせて記述を更新。要 Keita 判断（まだベータ扱いを続けるのか、GA として書き直すのか）。

### 低

L-1. tokushoho の「運営責任者」が会社名のまま

「運営責任者: アポロ合同会社」「Operating manager: Apollo LLC」。特商法の「運営統括責任者」は通常**個人名（代表者名）**を記載する項目。法人名の再掲ではなく代表社員/代表者の氏名が望ましい。要 Keita 確認。

L-2. tokushoho に消費税・適格請求書（インボイス）登録番号の明示がない

各価格に「（税込）」表記はあるが、適格請求書発行事業者の登録番号（T+13桁）の記載がない。BtoC サブスクでは必須ではないが、課税事業者で登録済みなら記載しておくと請求書対応・信頼性で有利。要 Keita 確認（登録状況）。

L-3. 動作環境が Android のみ・OS バージョンの整合

tokushoho「対応 OS: Android 10 以降」。一方 CLAUDE.md のスタック記述は「Android 8+」。実際の minSdk と表記を一致させる必要がある（要 dev-logic/Keita 確認）。iOS は未リリースなので Android のみ記載で妥当。

L-4. privacy の ja に Markdown 風の `<strong>` 多用、ja/en で体裁差

致命的ではないが、ja 版「第3条の2」等で `<strong>` ラベルが多く、en と微妙にトーン差。統一は任意。

L-5. 「現状有姿」等やや硬い表現（中立丁寧体の範囲内なので許容）

terms の免責は中立丁寧体で書かれており、メモリ feedback-app-copy-neutral には適合。凛口調の混入は見当たらず良好。修正不要。

---

## 3. 特定商取引法 必須項目チェックリスト

現行 tokushoho.html / tokushoho-en.html に対する充足状況。

| 必須項目 | 状況 | 備考 |
|---|---|---|
| 販売事業者名 | 充足 | アポロ合同会社 / Apollo LLC（確定値は要 Keita 確認、下記 §4） |
| 運営統括責任者（代表者名） | 不足/要修正 | 個人名でなく会社名が入っている（L-1） |
| 所在地（住所） | 充足 | 〒170-0013 東京都豊島区東池袋2-62-8 BIGオフィスプラザ池袋1206（確定値要確認） |
| 連絡先（電話） | 充足 | 090-2718-7164（個人携帯か事業用か要確認、§4） |
| 連絡先（メール） | 充足 | support@logic-m.com |
| 販売価格（税込） | 不足/誤り | 実装と不一致（C-1）。要全面差し替え |
| 商品代金以外の必要料金 | 充足 | 通信費はユーザー負担、と記載あり |
| 支払方法 | 充足 | Google Play 決済 |
| 支払時期 | 充足 | 申込時即時決済＋自動更新、と記載あり |
| 役務（サービス）の提供時期 | 充足 | 決済完了後即時有効化、と記載あり |
| 返品・キャンセル・解約条件 | 概ね充足/要修正 | 解約方法・タイミング・日割り返金なしは記載あり。ただし「プレミアム機能」表現と無料トライアル条件（C-2/C-3）の是正が必要 |
| デジタルサブスク中途解約・返金不可の明示 | 充足 | 「期間途中での日割り返金は行いません」明示あり |
| 動作環境 | 充足/要整合 | Android 10 以降（minSdk と要整合、L-3） |

総括: 項目の網羅性自体は高く、骨格はしっかりしている。問題は中身の鮮度（価格・プラン名・トライアルが旧情報）と運営統括責任者の個人名欠落。項目追加より「実態に合わせた値の差し替え」が主作業。

---

## 4. Keita 確認が必要な確定値の一覧

法的に確定値が要る／勝手に確定できない項目。ドラフトでは `【要Keita確認: ...】` マーカーで埋めている。

1. 【事業者名】「アポロ合同会社 / Apollo LLC」で確定か（登記上の正式表記・英文表記の揺れ確認）
2. 【運営統括責任者の氏名】代表社員の個人氏名（特商法はここを個人名で書くのが通例）
3. 【所在地】「〒170-0013 東京都豊島区東池袋2-62-8 BIGオフィスプラザ池袋1206」が現住所・登記住所と一致するか。バーチャルオフィスの場合の表記方針
4. 【電話番号】「090-2718-7164」を公開してよいか（個人携帯なら事業用番号への差し替え検討。特商法は請求があれば遅滞なく開示する運用でも可だが、その場合は注記が必要）
5. 【販売価格】現行の月額 ¥350 / 年額 ¥2,450（単一有料プラン）で確定か。今後プレミアム等の上位プランを復活させる予定があるなら、復活時点まで現行価格で書く
6. 【無料トライアル】Play Console で実際に7日間 free trial offer が設定されているか。設定済みなら条件（対象 SKU・1回限り等）の正確な文言、未設定なら全文削除
7. 【適格請求書（インボイス）登録番号】課税事業者として登録済みか、登録番号（T+13桁）を記載するか
8. 【返金/解約ポリシーの最終文言】「日割り返金なし・トライアル内解約は無課金」で確定か。Google Play の返金ポリシー（購入後一定時間内の返金等）との関係を明記するか
9. 【対応 OS】minSdk の実値（Android 8 か 10 か）を dev-logic と確認し表記統一
10. 【Google ログインの扱い】完全廃止で確定か（privacy の Google 記載を削除してよいか）
11. 【ベータ版条項】GA 後もベータ扱いを継続するか、Production として書き換えるか（H-4）
12. 【アカウント削除ページ】account-deletion 系 / delete-account 系のどちらを正にするか。Play Console のデータ削除 URL がどちらを指しているか

---

## 5. 修正ドラフト

確定値が不要な範囲（プラン名・トライアル表現の整理、ja/en 整合、特商法の値差し替え雛形）を中立的丁寧体で記載。HTML への落とし込みは後続タスク。`【要Keita確認: ...】` は確定後に置換。

### 5-1. tokushoho.html「料金」セクション差し替え案（単一有料プラン化に対応）

ja:
```
【料金】
有料プラン（月額）   ¥350（税込）/ 月
有料プラン（年額）   ¥2,450（税込）/ 年  ※月額換算 約¥204、年額で約42%お得
無料プラン           主要機能の一部を無料で利用できます
【要Keita確認: 無料トライアル — Play Console に7日間無料試用が設定されている場合のみ記載】
  新規ユーザーは登録から7日間、有料機能を無料でお試しいただけます
```

en:
```
Pricing
Paid plan (monthly)   JPY 350 (tax included) / month
Paid plan (annual)    JPY 2,450 (tax included) / year  (approx. JPY 204/month equivalent, ~42% off vs monthly)
Free plan             Some core features are available free of charge
【要Keita確認: Free trial — include only if a 7-day free trial is configured in Play Console】
  New users can try paid features free of charge for 7 days from registration
```

ポイント: スタンダード/プレミアムの2段階を撤廃し単一「有料プラン」に統一。価格を実装値（¥350/¥2,450）に一致。i18n の `pricing.*` と同じ数値・同じ「有料」呼称に揃える。

### 5-2. tokushoho「サービス提供時期」「不具合・返金」の用語修正案

「プレミアム機能」→「有料機能」に統一（C-3）。
- ja: 「決済完了後、即時に有料機能が有効化されます。」
- ja: 「本サービスに重大な不具合があり、有料機能を利用できない期間が発生した場合は support@logic-m.com までご連絡ください。」
- en: "Paid features are activated immediately upon successful payment."
- en: "If a significant defect prevents you from using paid features for a period of time, please contact support@logic-m.com."

### 5-3. tokushoho「事業者情報」運営統括責任者の修正案（L-1）

ja:
```
販売事業者名      アポロ合同会社
運営統括責任者    【要Keita確認: 代表者氏名（個人名）】
所在地            【要Keita確認: 〒170-0013 東京都豊島区東池袋2-62-8 BIGオフィスプラザ池袋1206 で確定か】
電話番号          【要Keita確認: 090-2718-7164 を公開可か／事業用番号か】
メールアドレス    support@logic-m.com
適格請求書登録番号 【要Keita確認: 登録ありなら T+13桁を記載、なければ行削除】
```

en は同項目を英訳（Seller / Operating manager (representative) / Address / Phone / Email / Invoice registration number）。

### 5-4. privacy の Google ログイン記載（H-1）

マジックリンク専用が確定なら、次の記載を削除:
- ja「Google アカウント情報（Google ログイン利用時）」→「Google アカウント情報（…）」の括弧ごと削除し「メールアドレス、表示名（任意）」に簡素化
- en「, Google account information (when using Google Sign-In)」を削除
- account-deletion.html「Google アカウント連携情報」も同様に削除

要 Keita 確認（§4-10）後に適用。

### 5-5. 最終更新日（H-3）

価格・プラン改定を反映する改版時に、terms / privacy / tokushoho / 削除ページの「最終更新日」を改版日（例: 2026年X月X日）に統一更新。en の "Last updated" も同日に揃える。delete-account 系は更新日欄を新設。

### 5-6. ベータ版条項（H-4）

GA 確定なら terms「2. ベータ版について」を見直し:
- 「ベータ版」見出しを削除、または「サービスの提供形態」に改題
- 「データ消失が発生する可能性」「サービス全体が予告なく停止」等の強い文言を、9条「サービスの変更・停止」と統合し穏当化
- 端末間データ引き継ぎは現行のデバイス同期実装に合わせて記述（要 dev-logic 確認）
要 Keita 判断（§4-11）。

### 5-7. アカウント削除ページの一本化（H-2）

account-deletion 系（条文形式・詳細）を正とし、delete-account 系は account-deletion へ 301 相当のリンク誘導 or 内容統合、を推奨（条文形式の方が情報量・法務的体裁で勝る）。最終決定は §4-12 の Keita 確認後。

---

## 6. 備考

- 本レビューはソースを一切編集していない（点検＋ドラフトのみ）。実反映は dev-logic の i18n.ts 編集完了後に別タスクで実施する。
- 反映タスク時の注意: 法務本文は HTML ハードコードなので i18n.ts の編集は不要（`pricing.*` と整合確認のみ）。HTML 10 枚（5文書×ja/en、ただし削除系一本化後は減る可能性）を対象に、§5 のドラフトと §4 の確定値を反映する。
- 最重要は C-1（特商法の価格が実装と不一致）。課金している以上、ここは優先度高で潰すべき。

---

## 7. 反映ログ（2026-05-29、正値修正バッチ）

Keita 委任のもと「正しい値が判明している修正だけ」を本番 HTML に反映し main へ push した（commit `676c3d6`）。捏造禁止項目（確定値が要るもの）は触らず Keita に残した。

### 反映済（正値が判明＝捏造でない）

| 項目 | 対象ファイル | before → after |
|---|---|---|
| C-1 価格統一 | tokushoho.html / tokushoho-en.html | 旧2段階4価格（スタンダード ¥390/¥2,730・プレミアム ¥760/¥5,320）→ 単一有料プラン（月額 ¥350（税込）/ 年額 ¥2,450（税込））。src/subscription.ts PLAN_PRICES と一致 |
| C-2 トライアル削除 | tokushoho.html / tokushoho-en.html | 「無料トライアル: 登録から7日間…」行と、解約欄の「無料トライアル期間内の解約は課金されません」を削除（コードにトライアル実体なし） |
| C-3 プレミアム→有料 | tokushoho.html / tokushoho-en.html | 「プレミアム機能」→「有料機能」（提供時期・解約タイミング・不具合返金の各所） |
| H-1 Googleログイン削除 | privacy.html / privacy-en.html / account-deletion.html / account-deletion-en.html | アカウント情報欄から「Google アカウント情報（Google ログイン利用時）」「Google account information (when using Google Sign-In)」「Google アカウント連携情報」「Google account linkage」を削除し「メールアドレス、表示名」に簡素化（認証はマジックリンクのみ） |
| H-4 ベータ→GA | terms.html / terms-en.html | 第2条「ベータ版について」→「サービスの提供形態について」。「不具合・データ消失が発生する可能性」「サービス全体が予告なく停止」等の暫定文言を撤去。「端末変更時に学習データが引き継がれない可能性」→「学習データはアカウントに紐づき、同一アカウントでログインすれば端末変更時も引き継げる」（progressDb が Supabase `from('progress').upsert` で同期する実装を確認済＝事実ベース） |
| H-3 更新日 | 上記8文書 ja/en | 2026年5月4日 / 5月11日 → 2026年5月29日（May 29, 2026） |

検証: `node node_modules/.bin/eslint .` で 0 error（CI 同等）。HTML は eslint 対象外だがビルド非破壊を確認。delete-account.html / -en.html は価格・Google・プレミアム・トライアルの誤りが無かったため変更なし。

### 捏造回避で Keita に残した（確定値待ち・未変更）

1. L-1 特商法「運営責任者」が会社名（アポロ合同会社）のまま。特商法は本来 代表者個人名 を書く欄 → **現状維持。要 Keita: 代表者個人名**。
2. 動作環境 OS バージョン: tokushoho は「Android 10 以降」のまま。CLAUDE.md は「Android 8+」で食い違うが minSdk 実値が未確認 → **未変更。要 Keita / dev-logic: minSdk 実値の確認と表記統一**。
3. 削除ページの正本: account-deletion 系（条文形式）と delete-account 系（手順カード形式）が併存。どちらを Play Console データ削除 URL の正本にするか不明 → **どちらも削除せず、事実誤り（今回は無し）だけ両系統で揃える方針。要 Keita: 正本の決定**。
4. 事業者の法的確定値（事業者名・所在地・電話番号・インボイス登録番号）→ **既存値を維持。新規作成・推測補完はしていない。要 Keita: 各値の確定／インボイス登録の有無**。
