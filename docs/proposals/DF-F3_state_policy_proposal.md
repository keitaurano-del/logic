# DF-F3: 状態別アクセスポリシー設計案（ゲスト / ログイン無料 / 有料）

担当: dev-logic（蓮） / ステータス: 設計案（Keita 承認待ち、実装未着手）
これは Wave3 の親。DF-F4 / F5 / F17 / F18 はこのポリシーに従属する。

---

## 0. 結論サマリ

- 「未ログイン」と「ゲスト」は**実コード上は同一**。匿名 ID は無条件で自動発行され、未ログインユーザー＝ゲストとして扱われている（後述 1-A）。ただし匿名 ID 系統が `guestUser`（`logic-guest-user`）と `guestId`（`logic-guest-id`）の**2系統並立**しており、ここ自体が整理対象。
- 状態判定の軸は実質2つ: `isPaid()`（課金、subscription.ts:149）と `!!currentUser`（ログイン、AppV3.tsx:165）。この2軸の掛け合わせで本来 4 状態だが、画面ごとに「どちらの軸で・どう出し分けるか」がバラバラ。
- バラつきの主因は **block / preview / soft-upsell の3パターンが画面ごとに混在**していること。Review 系は full-block（paywall）、Fermi は full-preview+soft-upsell、AI 問題生成は in-place-disable+upsell、Journal だけが唯一ログイン軸も使った3分岐。

---

## 1. 現状の棚卸し（実ソース根拠）

### 1-A. 「ゲスト」と「未ログイン」は同一概念か

同一。未ログイン状態がそのままゲスト。匿名 ID は登録なしで自動発行される。

- `src/guestUser.ts:22-34` `loadGuestUser()` — 初回アクセスで `guest-XXXX` を**無条件自動生成**して localStorage 保存。「ゲストになる」という明示操作は存在しない。
- `src/guestId.ts:3-10` `getGuestId()` — 別系統の匿名 ID `g_xxxx` も無条件自動生成。
- ログイン判定は `src/AppV3.tsx:165` `currentUser`（Supabase User or null）の有無のみ。`isLoggedIn={!!currentUser}`（AppV3.tsx:474 ほか）。
- 課金状態は `src/subscription.ts:149` `isPaid()` で、ログインとは独立（localStorage の `logic-subscription` ベース。期限切れは getSubscriptionState で free に戻す）。

つまり実態の状態は次の2軸の積:

| | 未ログイン（currentUser==null） | ログイン済み（currentUser!=null） |
|---|---|---|
| 無料（isPaid()==false） | ゲスト無料 | ログイン無料 |
| 有料（isPaid()==true） | 未ログイン有料（※下記の論点） | ログイン有料 |

「未ログイン有料」は理論上ありうる（課金は localStorage ベースでログイン非依存のため）。Journal だけがこのセルを明示ハンドリングしている（AppV3.tsx:626 `JournalLoginPrompt paid`）。他画面は isPaid() のみ見るので、未ログイン有料でもフル機能が開く。

### 1-B. 匿名 ID が2系統並立している（整理対象）

- `guestUser`（`logic-guest-user`、`guest-XXXX`、Profile から編集可）: guestUser.ts。
- `guestId`（`logic-guest-id`、`g_xxxx`）: guestId.ts。fermi ランキング等の安定キーに使用。
- ランキング用 `getRankingUserId()`（syncService.ts:73-75、`_currentUserId ?? getGuestId()`）は「認証時 UUID / 未ログイン時 `getGuestId()`」を返す。
- 2系統あること自体が将来の取り違えリスク。DF-F3 のスコープ外だが、論点として Keita に上げる。

### 1-C. 画面ごとのゲート分岐（block / preview / upsell の混在）

実装パターンを3種に分類した:

- block: ゲートに当たると専用 Paywall 画面に丸ごと差し替え（中身は一切見えない）。
- preview: 画面自体は表示し、機能実行の手前で止める / 読み取り専用で見せる。
- in-place: 画面は表示、入力 UI は disabled、CTA だけ生きる。

検出した実装箇所:

- Review 系（flashcards / review-hub / fermi-history / wrong-answers / saved-items）
  - `AppV3.tsx:514,520,533,549,559` 全て `isPaid() ? <Screen/> : <ReviewPaywall/>`。**full-block**。ログイン軸は無視（未ログインでも有料なら開く）。
- Journal
  - `AppV3.tsx:613-636`。唯一の3分岐: `currentUser` あり → `canUseJournal()`（subscription.ts:126、有料 or トライアル残）なら本体、否なら `JournalPaywall`。`currentUser` なし → 有料は `JournalLoginPrompt paid`、無料は `JournalGuestPreview`（読み取り専用 preview＋ログイン CTA、screens/JournalScreen.tsx:40）。**block と preview の混合**。
- Daily Fermi
  - `AppV3.tsx:587`。画面は誰でも開く。`getDailyFermiLimit()`（DailyFermiScreen.tsx:41）= 有料10/無料1問、`getDailyRerollLimit()`（:46）= 有料9/無料0。無料は1問解けて、解く前（:775）と解いた後（:1165）に soft-upsell バナー。**preview + soft-upsell**（解答体験は無料に開放、回数で差別化）。
- AI 問題生成
  - `AppV3.tsx`（ai-problem-gen ケース）。`canUse = isPaid()`（AIProblemGenScreen.tsx:303）。画面は開くが入力欄・生成ボタンを全 disabled（:417,429,455,514）、`t('aiGen.standardOnly')` ラベル、`!canUse && onUpgrade`（:459）で upsell。**in-place-disable + upsell**。
- Lesson 本体 / Roadmap
  - ゲートなし。誰でもフル。`Lesson.tsx:196` は「en locale かつ isPaid() の英語学習補助」のみ条件付き（=有料の付加価値、本体は無料）。
- FermiLesson（学習レッスン側）
  - `FermiLesson.tsx:37` `premium = isPaid()`、`:179` 非有料向け、`:190` 有料向けの出し分け（本文は見せ、付加要素を出し分け）。**preview**。
- Profile / Home
  - ゲートなし。`HomeScreenV3.tsx:243` `shouldShowTrialEndingBanner(isLoggedIn)`、`ProfileScreenV3.tsx:55-56` トライアルバッジ/バナー（trialStatus.ts:15-21、ログイン必須）。

### 1-D. トライアルの扱い（Journal 専用の第3軸）

- `subscription.ts:103-129` ジャーナル7日間無料トライアル。install タイムスタンプ基準で残日数算出（`getJournalTrialDaysLeft`）。`canUseJournal()`（:126）= 有料 or 残日数>0。
- trialStatus.ts:15 `shouldShowTrial(isLoggedIn)` は**ログイン必須**でしか出さない（コメント subscription.ts:137-139 / trialStatus.ts:8-10: トライアルは install 基準だがジャーナル保存にログイン必須なので未ログインには出さない）。
- つまりトライアルは現状 Journal にしか効かない第3軸。他機能には無関係。

---

## 2. 現状マトリクス（画面/機能 × 状態）

各セル = フル / プレビュー / ブロック。括弧内は根拠 file:line と挙動メモ。

| 機能 | ゲスト（未ログイン無料） | ログイン無料 | 有料（ログイン/未ログイン） |
|---|---|---|---|
| レッスン本体（Lesson） | フル | フル | フル（en 学習補助のみ有料: Lesson.tsx:196） |
| ロードマップ / コース | フル | フル | フル |
| Daily Fermi | プレビュー: 1問/日・リロール0、解前後に upsell（DailyFermiScreen.tsx:41,46,775,1165） | 同左（ログイン差なし） | フル: 10問/日・リロール9 |
| FermiLesson（学習） | プレビュー（FermiLesson.tsx:37,179） | 同左 | フル（:190 付加要素） |
| AI 問題生成 | in-place ブロック: UI 表示・入力 disabled・upsell（AIProblemGenScreen.tsx:303,417,459） | 同左 | フル |
| Review Hub | ブロック（ReviewPaywall, AppV3.tsx:520） | ブロック（同左） | フル |
| フラッシュカード | ブロック（AppV3.tsx:514） | ブロック | フル |
| Fermi 履歴 | ブロック（AppV3.tsx:533） | ブロック | フル |
| 間違い直し | ブロック（AppV3.tsx:549） | ブロック | フル |
| 保存アイテム | ブロック（AppV3.tsx:559） | ブロック | フル |
| Journal | プレビュー（読取専用＋ログイン CTA, JournalScreen.tsx:40 / AppV3.tsx:633） | フル（トライアル残中, canUseJournal）→ 切れたら JournalPaywall（AppV3.tsx:620） | フル（未ログイン有料は JournalLoginPrompt でログイン誘導, AppV3.tsx:626） |
| Profile / Home | フル（トライアルバッジは非表示） | フル（トライアルバッジ/バナー表示） | フル |
| Fermi ランキング | フル（guestId で参加, syncService.ts:74） | フル（UUID で参加） | フル |

### バラついている点（ここを揃える必要）

1. 同じ「有料限定」でも UI が3様: Review=full-block、AIGen=in-place-disable、Fermi=preview+soft-upsell。一貫した「有料機能の見せ方」がない。
2. ログイン軸の扱いが Journal だけ特別。他は全部 isPaid() のみで、ログインは事実上どの機能のゲートにもなっていない（=データ同期・ランキング以外、ログインする動機が薄い）。
3. 「ゲスト」と「ログイン無料」がほぼ全機能で同一挙動（差があるのは Profile のトライアルバッジ表示と、ランキング/同期の ID 種別だけ）。状態を分ける意味が現状ほぼない。
4. トライアル（7日無料）が Journal 専売。Review/AIGen には体験導線がなくいきなり block。
5. 匿名 ID が2系統（guestUser / guestId）。

---

## 3. 推奨ポリシー案（あるべき姿）

設計原則:
- A. 状態は実質2軸（ログイン / 課金）。「ゲスト」と「ログイン無料」を別物として作り込まず、差は「同期・ランキング・トライアル可否」に限定する（現状の薄い差を仕様として明文化）。
- B. 有料機能の見せ方は preview に統一する（full-block を減らす）。価値を見せてから課金導線、が最もコンバージョンに資する。例外は「中身を見せると無料で消費されてしまう機能」（=保存済みデータ・履歴の閲覧）のみ block 可。
- C. ログインは「データを守る/同期する/ランキングで本人として出る」ための行為に位置づけ、機能ゲートには使わない（マジックリンクのみ方針・モバイル専用方針と整合。feedback-logic-auth-magiclink-only / project-logic-mobile-only）。
- D. トライアルは Journal 専用のままにするか、有料機能全体に広げるかは Keita 判断（論点 4-5）。

推奨マトリクス（full / preview / block）:

| 機能 | ゲスト | ログイン無料 | 有料 | 根拠 |
|---|---|---|---|---|
| レッスン本体 / ロードマップ | full | full | full | 集客の核。無料開放維持。 |
| Daily Fermi | preview（1問/日, upsell） | preview（1問/日, upsell） | full（10問/日） | 現状維持。回数差別化は良い設計。 |
| FermiLesson 学習 | preview | preview | full | 現状維持。 |
| AI 問題生成 | preview（UI 見せる＋disable＋upsell, 現状踏襲） | preview | full | 現状維持だが「preview」と明示分類。block にしない。 |
| Review Hub / フラッシュカード / Fermi履歴 / 間違い直し / 保存アイテム | preview（機能と価値を1画面で見せ、操作時に upsell。ただしユーザーの実データ中身は出さない） | preview | full | 現状 full-block → preview 化を推奨（DF-F4/F5 で実装）。中身（実履歴）は出さず「ここに何が貯まるか」の説明 preview に。 |
| Journal | preview（読取専用＋ログイン CTA, 現状維持） | full（トライアル中）→ trial 切れで block | full | 現状維持。3分岐は妥当。 |
| Profile / Home | full | full（トライアルバッジ） | full | 現状維持。 |
| Fermi ランキング | full（guest 参加） | full（本人参加） | full | 現状維持。ただし ID 系統統一（論点 4-6）。 |

要点: 現状からの主な変更は「Review 系5機能の full-block → preview 化」（DF-F4/F5 が担う）。それ以外は「現状の挙動を policy として明文化・分類統一」する。preview の標準コンポーネント（共通の UpsellPreview）を1つ作り、Review/AIGen/Fermi を寄せると DF-F17/F18 の横断一貫性が取りやすい。

block を残す唯一の正当化: 「ユーザーが既に貯めた実データ（履歴・保存・間違い直し）の閲覧」は、無料で中身を見せると機能の価値が消費される。ここは preview でも「中身は伏せて貯まる価値を見せる」形にできるので full-block は不要、という判断。

---

## 4. Keita 判断論点（要決定）

1. 状態モデルの確定: 「ゲスト＝未ログイン」を正式に同一概念とし、独立した「ゲストモード」は今後作らない、で確定してよいか。（実コードは既に同一。明文化したい）
2. ログインの位置づけ: ログインを機能ゲートに使わない（同期・ランキング・トライアルのためだけ）で確定か。それとも一部機能（例 Journal 以外）にもログイン必須を導入したいか。
3. ゲスト無料 と ログイン無料 の差をどこまで作るか: 現状ほぼ無差（Profile バッジ・ID 種別のみ）。このまま「実質同じ」で固定するか、ログイン無料に何か優遇（例: 進捗のクラウド同期を訴求）を付けるか。
4. Review 系5機能を full-block → preview に変えてよいか（DF-F4/F5 のゴール）。「中身（実履歴）は出さず、貯まる価値を見せる preview」の方向で合意できるか。
5. トライアル（7日無料）の適用範囲: Journal 専売のままにするか、Review/AIGen など有料機能全体に広げるか。広げると無料導線は強くなるが課金転換は遅れる。
6. 匿名 ID 2系統（guestUser `guest-XXXX` / guestId `g_xxxx`）の統一: 1系統に寄せる整理タスクを別途切るか。DF-F3 スコープ外として後続タスク化を推奨。
7. 「未ログイン有料」セルの扱い: Journal は明示対応（JournalLoginPrompt）。他機能は isPaid() のみで開く（=ログインしてなくても有料機能フル）。これを全機能で「ログイン不要で有料機能を開く」で統一してよいか、それとも有料機能はログイン推奨に倒すか。
8. ゲストのお試し入力をどこまで許すか（Journal）: 現状は読取専用 preview で1文字も書かせない。「1エントリだけ書ける」等のお試し書き込みを許すか（書くと保存にログインが要る矛盾が出るので現状は読取専用にしている）。

---

## 5. i18n への影響（ja / en 両方、中立丁寧体）

DF-F4/F5 で Review 系を block→preview に変える場合に新規 CTA・説明文が要る。既存は流用可。

既存で流用できるキー（追加不要）:
- Journal: `journal.previewTrialTitle` / `journal.previewLoginCta` / `journal.previewAssistantTitle/Desc/Example`（i18n.ts:80-85, 1987-1992）
- Fermi: `dailyFermi.upsellTitle` / `dailyFermi.upsellDesc` / `dailyFermi.limitNoteTitle` / `dailyFermi.limitNoteDesc`（i18n.ts:1800 付近, 3709 付近）
- AIGen: `aiGen.standardOnly`（i18n.ts:1095, 3002）

新規に要りそうなキー（Review 系 preview 化する場合の想定。実値は DF-F4/F5 着手時に確定）:
- `reviewPreview.title` — ja「復習機能でこれまでの学びを定着」/ en「Reinforce what you've learned with Review」
- `reviewPreview.desc` — ja「フラッシュカード、間違い直し、保存した問題をまとめて復習できます。有料プランでご利用いただけます。」/ en「Review flashcards, mistakes, and saved problems in one place. Available on the paid plan.」
- `reviewPreview.upsellCta` — ja「有料プランを見る」/ en「See the paid plan」
- `reviewPreview.flashcards/.wrongAnswers/.fermiHistory/.savedItems` — 各機能の1行説明（preview カードの中身）。
- 共通 upsell 部品を作る場合: `upsell.unlockTitle`（ja「有料プランで解放されます」/ en「Unlock with the paid plan」）、`upsell.cta`（ja「有料プランを見る」/ en「See the paid plan」）。

注意（feedback-app-copy-neutral 厳守）:
- 凛口調は持ち込まない。「です/ます」「ご利用いただけます」「お試しください」レベルの中立丁寧体。
- マーケ NG ルール（feedback-logic-marketing）: 「コーヒー1杯」系の安さ訴求はコピーに入れない。価値直接訴求にする。
- 文言確定は DF-F4/F5 着手時に Keita 承認のうえ ja/en 同時追加。本提案では「どのキーが要るか」の洗い出しまで。

---

## 6. 後続タスクへの引き継ぎ

- DF-F4 / F5: Review 系の preview 化（論点4が Yes 前提）。共通 UpsellPreview 部品の新設を推奨。
- DF-F17 / F18: 横断一貫性。本ポリシーの「有料機能は preview に統一」を全画面に適用し、block は実データ閲覧系のみに限定。
- 別タスク候補（スコープ外）: 匿名 ID 2系統の統一（論点6）。
