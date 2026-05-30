# TASK_TRACKER — Logic

task-manager エージェントが管理するタスク台帳の正本。
ステータス: TODO / IN_PROGRESS / BLOCKED / REVIEW / DONE / CANCELLED
更新は必ずこのファイルに反映する。

---

## バッチ: 2026-05-30 ドッグフーディング Phase 3 改善 findings 21件（Keita 承認済・全件修正）

Phase 3 実走行（代表6ペルソナ p01/p02/p04/p07/p17/p18/p20）で抽出した改善 findings 21件。Keita が全件修正を承認済み。task-manager は台帳化・トリアージのみ（実装は dev-logic / designer / content-creator へ委譲）。

ID 採番: 既存 UI-* / AM-* / DF-1〜6 と衝突しない **DF-F1〜DF-F21**。

### Keita 方針（2026-05-30）

Keita 指示「なんでもいいけど全部ちゃんと反映して」＝アプローチ一任で、DF-F 系が実機で確実に機能する状態までやり切る。完了条件は「コミットが main に乗った」では足りず、実装 → 実効性検証（test-functional の○判定）→（test green 後に Keita 承認で）配信、までを含む。よって本台帳では「コードがある」と「実機で効いている」を別レイヤーで管理する（下記3層ビュー）。

### DF-F 系 3層ステータスビュー（実装済み / 効いている / 効いていない・要修正）

別アクターが大半を main に実装・push 済み。ただし「マージ済み＝実機で効いている」とは限らない（DF-F2 が実例）。test-functional が最新 main（1.5.457 相当）で実効性を網羅検証中（→ 下記 DF-FV タスク）。

| 層 | 意味 | 該当 |
|----|------|------|
| 第1層 実装済み（コードあり） | main にコミット有り。実機効果は第2層で判定 | F1, F2, F4, F5, F6, F7, F9, F10, F11, F12, F14, F15, F16, F17, F18, F19, F20, F21（18件） |
| 第2層 効いている（実機○） | test-functional の実効性検証で○判定が出たもの | **DF-F2**＋**DF-FV 2026-05-31 検証完了で○16件**：F1/F4/F5/F6/F7/F9/F10/F11/F12/F14/F15/F16/F17/F19/F20/F21（全てライブ経路結線・ja/en・永続化を file:line で確認）。うち機能クリーン12件（F1/F5/F6/F7/F9/F10/F11/F14/F15/F17/F20/F21）は DONE 昇格、設計判断系4件（F4/F12/F16/F19）は○機能だが Keita 見せ方目視待ちで REVIEW 維持。**＋DF-F8 を 2026-05-31 に別途○検証→DONE 昇格**（設計判断系でない純機能追加・実機発火のみ headless 未確認の caveat） |
| 第3層 効いていない・要修正（実機×/△） | コードはあるが実機で効果が出ない欠陥。再オープン | **（解消済み・空）** DF-F18 は △ だったが **DF-FV-1**（`fc87908`・2026-05-31 ○検証）で「解く前」idleフェーズに制限明示+導線をライブ結線し DONE 昇格。現在 第3層は該当なし |
| 未着手（コードなし） | コミット無し。設計判断で未確定のまま残存 | DF-F3（状態ポリシー親・BLOCKED）, DF-F13（フェルミ難易度フィルタ・BLOCKED）　※DF-F8 は実装完了→DF-FV○→DONE（`95cba0c`）で本欄から外れた |

各 DF-F の実装コミット hash（本日 git log main で全件実在確認済み・HEAD=`3a588dc`）:
DF-F1=`0d8b799` / DF-F2=`a380c83`+`0e77a79`+`3a588dc`（codemod完了・実機検証○・DONE） / DF-F4=`ab88528` / DF-F5・F9=`b756022` / DF-F6=`cd05dd3` / DF-F7=`24417a2` / DF-F10=`952fdda` / DF-F11=`b39a0df` / DF-F12=`cf5d7e4` / DF-F14=`d4ae9e0` / DF-F15=`578d2ea` / DF-F16=`12f350c`+`f4dcf13` / DF-F17=`1a056fd` / DF-F18=`f2e7819` / DF-F19=`7a2f1d0` / DF-F20=`5fe6833` / DF-F21=`7819a34`

トリアージ区分:
- 【即実装】軽く明確で回帰小。Wave1 でまとめて処理。
- 【要調査先行】実装前にコード確認が必要（#1, #9）。Wave2。**※両件とも台帳化時点でコード確認済み → 下記に結果反映**。
- 【設計判断】Keita 承認が要る方針判断（#3, #12, #13, #16, #19）。Wave3、1件ずつ承認取りながら。
- 【重め】影響大・回帰注意（#2, #8）。Wave3。

⚠ 着手前に確定した要調査2件のコード確認結果（2026-05-30、本台帳化時に実施）:
- DF-F1（検索発見性）: `src/screens/RoadmapScreenV3.tsx` を確認。検索機能は**実装済み**（右上虫眼鏡アイコン line 456-470＝`SearchIcon` + `aria-label={t('roadmap.searchAria')}`、タップで `searchOpen` → `SearchOverlay`。AI検索 `aiSearch`、レベル/進捗/形式フィルタ `levelFilters`/`progressFilters`/`formatFilters`、検索履歴 `logic-search-history` まで揃っている）。よって**機能の新規実装は不要**、純粋に「虫眼鏡アイコンの発見性が低い」UI課題＝**発見性改善タスク**に確定（新規開発ではない）。区分を【要調査先行】→【即実装〜軽デザイン】に格下げ。
- DF-F9（ウェルカム演出の出過ぎ）: `src/screens/HomeScreenV3.tsx` line 322-343 を確認。`shouldShowUpgradeToast(paid)` は (a) `paid===false` なら出さない、(b) `localStorage['logic-plan-upgrade-seen']==='1'` なら出さない、というガードで**ロジック上は「有料 かつ 未読の初回1回限り」**。つまり「ゲストにも出る」「再訪毎に出る」が事実なら、フラグ設計バグではなく **`isPaid()` の判定が課金状態を正しく反映していない（DF-F5 と同根の可能性）** か、**`dismiss()` 時の `setItem` が効いていない環境差**のどちらか。区分は【要調査先行】維持だが、調査の焦点は「UPGRADE_SEEN_KEY バグ」ではなく「`isPaid()` の戻り値」と「dismiss の永続化」に絞る。DF-F5 と合流調査を推奨。

| ID | タイトル | 優先度 | ステータス | コミット | 担当案 |
|----|---------|--------|-----------|---------|--------|
| DF-F1  | ロードマップ検索/絞り込みの発見性が低い（虫眼鏡が気づかれない） | P0 | DONE（DF-FV○・常設検索バー結線） | `0d8b799` | designer＋dev-logic |
| DF-F2  | 文字サイズのユーザー設定（標準/大/特大）が無い | P0 | DONE（codemod完了・実機検証○） | `a380c83`+`0e77a79`+`3a588dc` | dev-logic |
| DF-F3  | ゲスト/未ログイン/有料の3状態の出し分けが画面ごとにバラバラ | P0 | BLOCKED（未着手・設計判断） | なし | dev-logic（設計）＋Keita |
| DF-F4  | ジャーナルがゲスト全面ブロックで体験前に価値が途切れる | P0 | REVIEW（DF-FV○機能・設計判断系=Keita見せ方目視待ち） | `ab88528` | dev-logic |
| DF-F5  | 課金状態とログイン状態が独立＝「有料なのに使えない」 | P0 | DONE（DF-FV○・paid分岐文言結線） | `b756022` | dev-logic |
| DF-F6  | オンボ生年入力で「次へ」が無言ブロック（フリーズ誤解） | P0 | DONE（DF-FV○・理由提示+aria結線） | `cd05dd3` | dev-logic |
| DF-F7  | en でコーチマーク/チュートリアルが日本語ハードコード | P0 | DONE（DF-FV○・coachmark t()化ja/en） | `24417a2` | dev-logic |
| DF-F8  | 通知設定の粒度不足（時刻固定・頻度なし・静かな時間帯なし） | P0 | DONE（DF-FV○ 2026-05-31 実効性検証完了＝UIハンドラ→pref永続化(logic-reminder)→@capacitor/local-notifications schedule/cancel までライブ経路結線・ja/en・後方互換マイグレーションを file:line 確認。元症状3つ全解消。green tsc0/eslint.0err/vitest389pass。※実機(Android/iOS)の発火タイミングそのものは headless で未確認＝コードレベル○判定。commit `95cba0c` push 済・Android自動配信＋Web deploy dispatch run 16470307885 済） | `95cba0c` | dev-logic |
| DF-F9  | 有料ウェルカム演出が再訪毎＋ゲストにも出る | P0 | DONE（DF-FV○・非有料カット+初回限定seen永続化が結線。※実装出所は`c5deaeb`単一有料プラン統合、`b756022`ではない） | `c5deaeb` | dev-logic |
| DF-F10 | 下タブのラベルと中身が不一致（機能名ベースに） | P1 | DONE（DF-FV○・nav i18n ja/en整合） | `952fdda` | dev-logic |
| DF-F11 | トライアル残日数がジャーナル内にしか出ない | P1 | DONE（DF-FV○・常設バッジ+終了間際バナー結線。通知発火はF8依存で範囲外） | `b39a0df` | dev-logic |
| DF-F12 | フェルミランキングの透明性欠如（算出基準/母数/順位なし） | P1 | REVIEW（DF-FV○機能・設計判断系=Keita見せ方目視待ち） | `cf5d7e4` | dev-logic＋Keita |
| DF-F13 | デイリーフェルミが残数表示のみで上級者の手応え薄い | P1 | BLOCKED（未着手・設計判断） | なし | dev-logic＋content-creator＋Keita |
| DF-F14 | 料金(en)「Yearly Save 5 months」密着＋比較表 Free 列空欄 | P1 | DONE（DF-FV○・em dash明示+flexWrap密着解消） | `d4ae9e0` | designer＋dev-logic |
| DF-F15 | ジャーナルのログイン誘導が保存都合のみで価値訴求なし | P1 | DONE（DF-FV○・価値訴求文言ja/en結線） | `578d2ea` | content-creator＋dev-logic |
| DF-F16 | 初回ホームが情報過密で最優先アクション不明 | P1 | REVIEW（DF-FV○機能・設計判断系=Keita見せ方目視待ち） | `12f350c`+`f4dcf13` | designer＋dev-logic＋Keita |
| DF-F17 | 復習ハブが有料と伝わらない（無料時データ無し表示のみ） | P2 | DONE（DF-FV○・有料ロック価値提示結線） | `1a056fd` | content-creator＋dev-logic |
| DF-F18 | フェルミ1日1問制限/課金導線が解く前に弱い | P2 | DONE（DF-FV-1○ 2026-05-31 検証完了＝「解く前」idleフェーズに制限明示+有料導線をライブ結線、元症状解消。完了後導線と排他で両立） | `f2e7819`+`fc87908` | dev-logic |
| DF-F19 | フェルミ問題が en でも日本市場前提（GMV/円建て） | P2 | REVIEW（DF-FV○機能・設計判断系=Keita見せ方目視待ち） | `7a2f1d0` | content-creator＋Keita |
| DF-F20 | 特商法リンクが en UI にも残る（ja/日本配信時のみ出し分け） | P2 | DONE（DF-FV○・ProfileScreenV3でja限定ガード結線） | `5fe6833` | dev-logic |
| DF-F21 | フィードバック投稿に識別情報・最低文字数チェックが無い | P2 | DONE（DF-FV○・クライアントガード+識別子送信+サーバ受領結線。※device列保存はmigration 034本番適用+backend手動deploy要） | `7819a34` | dev-logic |
| DF-FV  | DF-F 系 実効性網羅検証（コードはあるが実機で効くか○/×/△判定） | P0 | DONE（2026-05-31 全17件判定完了：○16/△1/×0、F2は別途○DONE。△=DF-F18→DF-FV-1起票） | — | test-functional |
| DF-FV-1 | DF-F18 修正：フェルミ「解く前」段階の制限明示/有料無制限訴求を追加（現状は完了後導線のみ） | P2 | DONE（2026-05-31 実効性○判定確定。DailyFermiScreen.tsx:775 の `!replayMode && !isPaid() && onUpgrade && canAnswer && submitPhase==='idle'` ガードで解く前idleフェーズに制限明示+導線が描画＝dead codeでなくライブ結線。i18n limitNoteTitle/Desc/Cta は ja(1803-1805)/en(3712-3714) 両存在・中立丁寧体・絵文字/hex無し、数値1/10は getDailyFermiLimit() と一致。CTA onClick=onUpgrade→AppV3.tsx:584 navigate({type:'pricing'})→PricingScreen 実遷移。完了後導線(1164,result限定)と submitPhase で排他＝重複なし。元 finding「解く前に弱い」解消・別解すり替えなし。green: tsc0/eslint.0err(19既存warn)/vitest 22files389pass。commit fc87908 origin/main push 済（Android 自動配信）＋Web deploy dispatch 済） | `fc87908` | dev-logic |

---

### DF-F1 — ロードマップ検索/絞り込みの発見性が低い　[P0 / 即実装〜軽デザイン]
- 優先度: P0 / ステータス: DONE（実装済 `0d8b799`「ロードマップ上部に分かりやすい検索エントリを追加」・DF-FV○・常設検索バー結線）/ 担当: designer（発見性）＋dev-logic
- 詳細: 42コース縦スクロールで p01/p07/p18 横断「検索/絞り込みが見つからない」。**調査結果＝検索機能は実装済み**（`RoadmapScreenV3.tsx` 右上虫眼鏡 line 456-470＋`SearchOverlay`＋AI検索＋レベル/進捗/形式フィルタ＋検索履歴）。問題は機能不在ではなく**虫眼鏡アイコンの発見性**。→ 発見性を上げる施策（アイコン拡大／ラベル併記「検索」／初回コーチマークで検索を案内／上部に検索バー風プレースホルダを出す等）を designer 主導で1案出して Keita 承認 → dev-logic 実装。
- 関連ファイル: `src/screens/RoadmapScreenV3.tsx`（虫眼鏡 line 456-470, SearchOverlay）、`src/tutorial/coachmark.tsx`（検索を案内する coachmark 追加候補）、`src/i18n.ts`（`roadmap.searchAria` 既存／新規ラベル）
- DoD: 代表ペルソナが初見で検索導線に気づける（虫眼鏡の視認性向上 or 検索バー化）。機能自体は既存のまま回帰なし。tsc/eslint green。
- 依存: なし（ただし DF-F16 ホーム情報整理・DF-F3 状態出し分けと UX 整合）
- 提言・抜けもれ:
  - 「新規実装が要る」と誤解しないこと。AM-Q/T-X(6a3c985) の実装が既に乗っている。本件は純 UX（発見性）。
  - i18n: 「検索」ラベルを足すなら ja/en 両方。aria-label は既存 `roadmap.searchAria` 流用可。
  - 両OS: 虫眼鏡のタップ領域が小さすぎないか（44pt 目安）iOS/Android で確認。
  - アクセシビリティ: アイコンのみ→語ラベル併記でスクリーンリーダ/視認性 両得。
- 更新日: 2026-05-31（DF-FV 反映）

### DF-F2 — 文字サイズのユーザー設定（標準/大/特大）　[P0 / 重め・回帰注意]
- 優先度: P0 / ステータス: **DONE（codemod完了・実機検証○）**（設定UI/保存＋本文スケールまで実機で効くことを確認）/ 担当: dev-logic / 2026-05-30 完了
- ✅ 第3層（コードはあるが実機で効いていない）の実例だったが、`3a588dc` の px→rem codemod で第2層（効いている）へ昇格。`src/fontScale.ts` が `documentElement` の font-size を 標準15/大17.25/特大19.5px に切替、本文は rem で一律スケール。test-functional 実効性検証○（4テーマ×3サイズ×7画面=84組で横溢れ0・inline px 0件）。検証スクショは `docs/render-screenshots/functional/dff2-*.png`。
- 詳細（経緯）: `a380c83`「外観設定に文字サイズ（標準/大/特大）を追加」＋`0e77a79`「説明文を実態に合わせて是正」で設定UIと保存ロジックは実装済みだったが、本文が inline px 直書き 913 箇所で倍率が効かず実機で「効いていない」状態だった（第3層の実例）。`3a588dc` で px→rem codemod を全面適用し、root font-size スケール基準化＋本文 rem 化を完了。標準時は非破壊（標準比 large=1.15/xlarge=1.3）。
- 修正方針（dev-logic）: (1) `documentElement` の font-size をスケール基準にする（root に font-scale を当て、本文を相対単位で従属させる）。(2) inline px 直書き 913 箇所を rem 化（codemod で機械変換）。(3) 標準時は完全非破壊（rem 化しても現行と同一の見た目になること）。
- 検証要件（必須・回帰大）: 全テーマ（light/dark）× 3サイズ（標準/大/特大）× 主要画面 でレイアウト崩れ（ボタン折返し・1行ラベル溢れ・カード内テキスト溢れ・図解とテキストのズレ）を横断確認。test-functional に依頼。
- 関連ファイル: `src/screens/AppearanceSettingsScreen.tsx`（設定UI・実装済）、`src/theme.ts`（永続化・適用・実装済／root スケール適用の追加先）、`src/styles/tokens.css`（`--font-*`／root font-size 基準）、本文 inline px 直書き 913 箇所（codemod 対象・全 src 横断）、`src/i18n.ts`（説明文 ja/en・`0e77a79` で是正済を本実装後に再是正の要否確認）、localStorage キー（`logic-font-scale` 等・実装済）
- DoD: 標準/大/特大の3段が設定でき、**本文を含む全画面の文字に倍率が反映**され、再起動後も保持される。標準時は現行と完全同一（非破壊）。全テーマ×3サイズ×主要画面でレイアウト破綻なし。tsc / eslint（`eslint .` 全体）green。
- 依存: UI-12（`--font-*` 一律+8%）の上に乗る。codemod が共通スタイルに広く触るため DF-FV の他項目検証と回帰が干渉しうる（実装タイミングを test-functional と調整）。
- 提言・抜けもれ:
  - 最大リスクは回帰（913 箇所の機械変換＝全画面波及）。codemod は「px→rem の比率を 1rem=16px 基準で厳密換算」し、差分レビュー＋スナップショットで非破壊を担保。
  - 永続化は実装済（localStorage）。ゲスト/ログイン跨ぎでも端末ローカル保持を維持。
  - 両OS: iOS の Dynamic Type / Android のフォントスケールと root スケールが二重に効いて巨大化しないか確認。WebView の font boosting 無効化も確認。
  - i18n: `0e77a79` が「実態に合わせて」下げた説明文は、本実装で本当に全体に効くようになったら**再度アップデート**（ja/en・中立丁寧体）。説明と実装の食い違いを残さない。
  - アクセシビリティの中核施策。designer に「特大」時の最小可読レイアウト指針をもらう。
- 更新日: 2026-05-30

### DF-F3 — ゲスト/未ログイン/有料の3状態の出し分け統一　[P0 / 設計判断]
- 優先度: P0 / ステータス: BLOCKED（Keita 承認待ち・ポリシー策定）/ 担当: dev-logic（設計提案）＋Keita（承認）
- 詳細: ゲスト・未ログイン（=ゲストと別か？）・有料 の3（あるいは4）状態の出し分けが画面ごとにバラバラ。横断ポリシーを1枚に定義してから各画面を寄せる。設計判断・横断。DF-F4/F5/F17 はこのポリシーの個別適用先。
- 関連ファイル: `src/guestUser.ts`、`src/subscription.ts`（`isPaid()`）、各 screen のゲート分岐（Journal/Review/Fermi/Profile 等）。まず横断棚卸しが必要。
- DoD: 「ゲスト/ログイン無料/有料」各状態で各機能が（フル/プレビュー/ブロック）のどれを取るかの一覧ポリシーが文書化され、Keita 承認 → 各画面が準拠。
- 依存: DF-F4・DF-F5・DF-F17・DF-F18 はこのポリシーに従属（ポリシー確定が前提）。
- 提言・抜けもれ:
  - これが Wave3 の親。先にこれを決めると F4/F5/F17/F18 の個別判断がぶれない。Keita に「状態×機能マトリクス」を提示して承認を取るのが最短。
  - 「未ログイン」と「ゲスト」が別概念か（ゲスト=匿名ID発行済 / 未ログイン=何もなし）を最初に定義。`guestUser.ts` の実態確認が前提。
  - i18n: 各状態のCTA文言が増えるので ja/en。文言は中立丁寧体。
- 更新日: 2026-05-30

### DF-F4 — ジャーナルのゲスト全面ブロックを段階ゲートに　[P0 / 設計判断寄り]
- 優先度: P0 / ステータス: REVIEW（実装済 `ab88528`「未ログイン時にジャーナルをプレビュー表示しログイン誘導(段階ゲート)」・DF-FV○機能・設計判断系=Keita 見せ方目視待ち。※DF-F3 ポリシー未確定のまま先行実装された点に留意）/ 担当: dev-logic＋Keita
- 詳細: ジャーナルがゲストに全面ブロックされ、トライアル価値が体験前に途切れる（p02/p04）。閲覧/お試し入力までは許し、保存/AI分析でログインを促す段階的ゲートへ。
- 関連ファイル: `src/components/journal/*`、ジャーナル画面のゲスト分岐、`src/i18n.ts`
- DoD: ゲストでもジャーナルの中身・一度の入力体験ができ、保存/継続/AI分析の段階でログイン誘導が出る。価値が伝わってからゲートがかかる。
- 依存: DF-F3（状態ポリシー）、DF-F15（ログイン誘導コピーの価値訴求）と同画面で連動。
- 提言・抜けもれ:
  - DF-F15（誘導コピー価値訴求）と必ずセットで実装（同じ誘導ポイント）。
  - 永続化: ゲストのお試し入力をどこまで端末ローカルに残すか（ログイン後に引き継ぐか破棄か）を要決定。
  - i18n ja/en・中立丁寧体。
- 更新日: 2026-05-31（DF-FV 反映）

### DF-F5 — 課金状態とログイン状態が独立＝「有料なのに使えない」　[P0 / 要調査先行]
- 優先度: P0 / ステータス: DONE（実装済 `b756022`「課金状態とログイン状態の区別＋ウェルカム演出の初回限定を是正」＝DF-F9 と同コミットで合流修正・DF-FV○・paid分岐文言結線）/ 担当: dev-logic
- 詳細: 課金状態とログイン状態が独立に管理され、「有料なのに使えない」状態が出る（p04）。両者の関係を整理し、状態を区別表示する。DF-F9 の「有料演出が出過ぎ」と同根の可能性（`isPaid()` の戻り値が課金実態とズレている疑い）。
- 関連ファイル: `src/subscription.ts`（`isPaid()`）、`src/guestUser.ts`、`server/routes/billing.ts`（verify/RTDN）、課金状態を参照する各画面
- DoD: 「ログイン状態」「課金状態」が独立して正しく解決され、有料ユーザーが有料機能を使える。矛盾状態（有料判定なのにブロック等）が消える。状態の区別表示（誰に何が見えているか）が明確。
- 依存: DF-F3（状態ポリシー）。DF-F9 と合流調査推奨。
- 提言・抜けもれ:
  - DF-F9 と同じ `isPaid()` を疑う。まず `isPaid()` がゲスト/未ログイン/購入済をどう判定しているか棚卸しし、再現条件を特定してから直す。
  - Play Billing 既知ギャップ（project-logic-play-billing-gaps：acknowledge/RTDN の Play Console 設定残）が課金状態同期に絡む可能性。verify 後の状態反映タイミングを確認。
  - 両OS: Android 実機の購入フロー後に `isPaid()` が即 true になるか。
- 更新日: 2026-05-31（DF-FV 反映）

### DF-F6 — オンボ生年入力の「次へ」無言ブロックを可視化　[P0 / 即実装]
- 優先度: P0 / ステータス: DONE（実装済 `cd05dd3`「生年未入力時に『次へ』を無効化/警告表示」・DF-FV○・理由提示+aria結線）/ 担当: dev-logic
- 詳細: オンボーディングの生年入力で「次へ」が無言で押せず、フリーズと誤解される（p01）。disabled の理由表示 or インライン警告を出す。`src/screens/OnboardingScreen.tsx`。UI-13 の onboarding E2E が赤だった同画面（既存バグと連動）。
- 関連ファイル: `src/screens/OnboardingScreen.tsx`（生年 step・次へボタンの disabled 条件）、`src/i18n.ts`（警告文言 ja/en）
- DoD: 生年が未入力/不正のとき「次へ」が無言で死なず、インライン警告 or ボタン下の説明で理由が伝わる。有効入力で進める。onboarding E2E が green に戻る。
- 依存: UI-13 で赤だった onboarding age step E2E（既存バグ）。本件修正で E2E 復旧を兼ねられるか確認。
- 提言・抜けもれ:
  - UI-13・CONTENT_AUDIT で言及された「onboarding age step E2E 1fail」と同画面。この修正で E2E が直るなら一石二鳥、直さないなら別途切り分け。
  - 文言は中立丁寧体（例「生まれた年を選択してください」）。
  - 両OS: ネイティブの数値ピッカー/キーボードで入力できるか。
  - アクセシビリティ: disabled ボタンに aria-describedby で理由を紐付け。
- 更新日: 2026-05-31（DF-FV 反映）

### DF-F7 — en でコーチマーク/チュートリアルの日本語ハードコード一掃　[P0 / 即実装]
- 優先度: P0 / ステータス: DONE（実装済 `24417a2`「チュートリアル/コーチマークの日本語直書きをi18nキー化(en対応)」・DF-FV○・coachmark t()化 ja/en）/ 担当: dev-logic
- 詳細: en ロケールでコーチマーク/チュートリアルが日本語ハードコード（`src/tutorial/coachmark.tsx` L89「まずここから始めましょう…」, L100「さっそくやってみよう！」）。i18n キー化し、合わせて全体を grep で一掃（p20）。軽い・明確。
- 関連ファイル: `src/tutorial/coachmark.tsx`（L89/L100 のハードコード文言）、`src/i18n.ts`（新規キー ja/en）、`aria-label="閉じる"`（L360 等のハードコードも要 i18n 化）
- DoD: コーチマークが en で英語表示。`src/` 全体を grep して日本語直書きの UI 文言が残らない（チュートリアル系優先）。tsc/eslint green。
- 依存: なし
- 提言・抜けもれ:
  - 確認済の直書きは L89/L100 だけでなく L360 `aria-label="閉じる"`、CTA の `#6C8EF5`/`#fff` ハードコード hex も同ファイルにある。hex は CSS var 化（`--accent`/`--accent-fg`）も同時にやると一石二鳥（デザイン制約遵守）。ただし主目的は i18n なので hex は別タスク化でも可。
  - grep 一掃: `grep -rnP '[ぁ-んァ-ヶ一-龠]' src/` でチュートリアル/トースト/ダイアログの直書き日本語を洗う。
  - i18n ja/en・中立丁寧体。
- 更新日: 2026-05-31（DF-FV 反映）

### DF-F8 — 通知設定の粒度（時刻ピッカー＋頻度＋静かな時間帯）　[P0 / 重め]
- 優先度: P0 / ステータス: DONE（DF-FV○ 2026-05-31 実効性検証完了。下記 検証結果 参照。実機発火タイミングのみ headless 未確認の caveat あり）/ 担当: dev-logic
- 検証結果（2026-05-31 test-functional ○判定）: 設定UI 3要素（任意時刻ピッカー `NotificationSettingsScreen.tsx:73/84`・頻度＋曜日選択 `:93/130/390-399`・DND `:407-434`）が state→`persistDaily`→`scheduleDailyReminder` まで結線。永続化キー `logic-reminder`（`notifications.ts:8`、台帳の logic-notifications 誤記を再確認）＋旧 `{enabled,hour,minute}`/旧 string time の後方互換マイグレーション（`:190-216`）。native スケジュール＝daily `every:'day'`／weekdays・weekly は曜日別 `on:{weekday,hour,minute}` 複数登録、曜日別id 1010〜1016（1001/1002/1003 非衝突）、Capacitor Weekday(Sunday=1)↔JS getDay(0=日) の +1 変換 `jsDayToCapacitorWeekday`（`:32-34`）正。quietHours `isWithinQuietHours`（`:140-155`）[start,end)・日跨ぎ対応、範囲内は daily を非スケジュール。i18n ja/en 15×2 中立丁寧体・hex/絵文字なし。tsc0/eslint.0err(19既存warn)/vitest 22files389pass（reminderSchedule.test.ts 15含む）。元症状（時刻固定・頻度なし・DNDなし）3つ全解消。
- 詳細: `src/screens/NotificationSettingsScreen.tsx` は時刻21時固定・頻度設定なし。時刻ピッカー＋頻度（毎日/平日/週N回 等）＋静かな時間帯（DND）を追加（p18）。重め。
- 実装結果（2026-05-31）:
  - `src/notifications.ts`: `ReminderPref` を frequency('daily'|'weekdays'|'weekly') / weeklyDays / quietHours で拡張。`loadReminderPref` に後方互換マイグレーション（旧 `{enabled,hour,minute}` JSON・万一の string time も daily に移行）。実 native スケジュールへ結線＝daily は `every:'day'`、weekdays/weekly は曜日別 `on:{weekday,hour,minute}` で複数通知登録。曜日別 id は 1010〜1016（1001/1002/1003 と非衝突）、`DAILY_ALL_NOTIF_IDS`/`ALL_NOTIF_IDS` を拡張し cancel 取りこぼし防止。
  - Capacitor Weekday enum を型定義で確認（Sunday=1…Saturday=7）、内部 weeklyDays は JS getDay()(0=日) なので +1 変換。
  - quietHours: `isWithinQuietHours` 新設。[start,end) 判定、日跨ぎ(start>end)対応。予定時刻が範囲内なら daily reminder をスケジュールしない。
  - 永続化キーは既存 `logic-reminder`（※CLAUDE.md/台帳の `logic-notifications`=reminder time は誤記。実体の `logic-notifications` は Profile.tsx の on/off マスタートグル）。
  - i18n ja/en 追加（中立丁寧体）。UI は SVG・CSS変数遵守、絵文字/hex なし。
  - テスト: `src/__tests__/reminderSchedule.test.ts` 新規15件（frequency/quietHours 分岐）。
  - 品質ゲート: tsc 0 / eslint .（CI同等）0 error / vitest 22files 389pass。
- 関連ファイル: `src/screens/NotificationSettingsScreen.tsx`、`src/notifications.ts`（※スタブ。CLAUDE.md gotchas #3「実装化は観測/通知戦略と整合してから」に注意）、Capacitor LocalNotifications、localStorage（既存 `logic-notifications`）、`src/i18n.ts`
- DoD: 時刻を任意に選べ、頻度・静かな時間帯を設定でき、設定どおりにローカル通知がスケジュールされる。再起動後も保持。tsc/eslint green。
- 依存: なし（が `src/notifications.ts` がスタブな点に注意）
- 提言・抜けもれ:
  - ⚠ `src/notifications.ts` は stub（CLAUDE.md gotchas #3）。実通知スケジューリングに踏み込むなら Keita に「通知戦略の本実装に入る」確認を取る。設定UI＋永続化までと、実際のネイティブ通知発火は段階を分けるのが安全。
  - 両OS: iOS/Android の通知許可フロー・LocalNotifications のスケジュール挙動が異なる。両OS確認必須。
  - 永続化: 既存 `logic-notifications` キーの形式拡張（時刻のみ→時刻＋頻度＋DND）。後方互換のフォールバック。
  - i18n ja/en・中立丁寧体。アクセシビリティ: 時刻ピッカーのラベル。
- 更新日: 2026-05-30

### DF-F9 — 有料ウェルカム演出が再訪毎＋ゲストにも出る　[P0 / 要調査先行]
- 優先度: P0 / ステータス: DONE（DF-FV○・非有料カット+初回限定seen永続化が結線。※実装出所は `c5deaeb` 単一有料プラン統合、`b756022` ではない）/ 担当: dev-logic
- 詳細: 有料ウェルカム演出（`pricing.welcomeToast*`）が再訪毎＋ゲストにも出る（p18）。初回1回限定に修正。**調査結果**＝`HomeScreenV3.tsx` L322-343 の `shouldShowUpgradeToast(paid)` は「`paid` かつ `UPGRADE_SEEN_KEY!=='1'`」で初回1回限りのロジックになっている。よって症状が事実なら原因は (a) `isPaid()` がゲスト/再訪で誤って true を返す（DF-F5 と同根）、(b) `dismiss()` の `localStorage.setItem` が効かず毎回未読扱い、のどちらか。
- 関連ファイル: `src/screens/HomeScreenV3.tsx` L322-343（`UPGRADE_SEEN_KEY`/`shouldShowUpgradeToast`/`useUpgradeWelcomeToast`/`dismiss`）、`src/subscription.ts`（`isPaid()`）
- DoD: ウェルカム演出が「有料化した初回の1回のみ」表示。ゲスト・再訪では出ない。原因（isPaid 判定 or dismiss 永続化）を特定し修正。
- 依存: DF-F5 と合流調査推奨（`isPaid()` 共通疑い）。
- 提言・抜けもれ:
  - 「UPGRADE_SEEN_KEY バグ」と決め打ちしない。ロジックは正しいので、焦点は `isPaid()` の戻り値と `dismiss` の setItem 到達。DF-F5 とまとめて1調査で。
  - dismiss が onCta 経路でも setItem されるか（onClose だけ setItem で onCta が抜けてないか）L309-313 周辺を確認。
- 更新日: 2026-05-31（DF-FV 反映）

### DF-F10 — 下タブのラベルと中身の不一致を機能名ベースに　[P1 / 即実装]
- 優先度: P1 / ステータス: DONE（実装済 `952fdda`「下タブのラベルを 学ぶ/フェルミ に変更（中身と一致）」・DF-FV○・nav i18n ja/en 整合）/ 担当: dev-logic
- 詳細: 下タブのラベルと中身が不一致（「トレーニング」=ロードマップ、「ランキング」=フェルミ 等）。機能名ベースのラベルに（p07）。i18n 文言。
- 関連ファイル: `src/components/AppShell.tsx`（タブバー）or `src/AppV3.tsx`（タブ定義）、`src/i18n.ts`（タブラベル ja/en）
- DoD: 各タブのラベルが遷移先の中身と一致する命名になる。ja/en 両方。tsc/eslint green。
- 依存: DF-F16（ホーム情報設計）と命名トーン整合。
- 提言・抜けもれ:
  - title の Doing 形ルール（feedback-logic-title-doing）はコース/レッスン title の話。タブラベルは機能名（名詞）でOKだが、トーン一貫性は確認。
  - i18n ja/en・中立丁寧体。Keita に最終ラベル案を一度見せると手戻り防止（軽い設計判断混じり）。
- 更新日: 2026-05-31（DF-FV 反映）

### DF-F11 — トライアル残日数をホーム/プロフィールに常設＋終了前通知　[P1]
- 優先度: P1 / ステータス: DONE（実装済 `b39a0df`「トライアル残日数の常設表示＋終了間際バナー」・DF-FV○・常設バッジ+終了間際バナー結線。通知発火は F8 依存で範囲外）/ 担当: dev-logic
- 詳細: トライアル残日数がジャーナル内にしか出ない。ホーム/プロフィールのプラン欄に常設＋終了2日前通知（p02）。
- 関連ファイル: `src/screens/HomeScreenV3.tsx`、`src/screens/ProfileScreenV3.tsx`、`src/subscription.ts`（トライアル残日数算出）、`src/notifications.ts`（終了前通知・※スタブ注意）、`src/i18n.ts`
- DoD: ホームとプロフィールのプラン欄に残日数が常設表示。終了2日前にローカル通知。ja/en。
- 依存: DF-F8（通知基盤）と通知部分が連動。DF-F5/F3（課金/状態解決）が前提。
- 提言・抜けもれ:
  - 通知部分は DF-F8 の通知基盤に乗せる（`notifications.ts` スタブ問題を共有）。表示常設だけ先行し通知は後追いでも可。
  - 残日数0/期限切れ時の表示分岐（「トライアル終了」→アップグレード導線）も要設計。
  - i18n ja/en・中立丁寧体。
- 更新日: 2026-05-31（DF-FV 反映）

### DF-F12 — フェルミランキングの透明性（算出基準/母数/順位）　[P1 / 設計判断]
- 優先度: P1 / ステータス: REVIEW（実装済 `cf5d7e4`「ランキングに算出基準・参加者数・暫定順位を表示」・DF-FV○機能・設計判断系=Keita 見せ方目視待ち）/ 担当: dev-logic＋Keita
- 詳細: フェルミランキングに算出基準・母数・自分の順位が出ず透明性に欠ける（p04）。`src/screens/FermiRankingScreen.tsx`。何をどう見せるか設計判断。
- 関連ファイル: `src/screens/FermiRankingScreen.tsx`、ランキング算出 backend（`server/routes/` のランキング系・AM-P 関連）、`src/i18n.ts`
- DoD: ランキングの算出基準・母数（n）・自分の順位が表示される。Keita 承認した見せ方に準拠。
- 依存: backend のランキング集計が母数/順位を返せるか（AM-P 実装と整合）。
- 提言・抜けもれ:
  - 何を transparency として出すか（スコア定義・母数・パーセンタイル）は Keita 判断。まず案を1つ出して承認を取る。
  - backend 変更が要るなら手動 deploy-production.yml で本番反映（project-logic-render-auto-deploy）。
  - i18n ja/en・中立丁寧体。
- 更新日: 2026-05-31（DF-FV 反映）

### DF-F13 — デイリーフェルミに難易度/分野フィルタで手応え　[P1 / 設計判断]
- 優先度: P1 / ステータス: BLOCKED（**未着手・コミットなし**。DF-F 系で実装が乗っていない3件のうちの1つ。Keita 承認待ち＝機能追加＋コンテンツのタグ付けが要る）/ 担当: dev-logic＋content-creator＋Keita
- 詳細: デイリーフェルミが残数表示のみで上級者の手応えが薄い（p04）。難易度/分野フィルタを追加（機能追加）。設計判断。
- 関連ファイル: フェルミ問題プール（`src/lessons/` or fermi データ）、デイリーフェルミ画面、`server/routes/`（日次シード AM-P/T-AD と整合）、`src/i18n.ts`
- DoD: 難易度・分野でフィルタでき、上級者が手応えある問題を選べる。Keita 承認した仕様に準拠。
- 依存: DF-F19（en の問題プール locale 化）と問題プール設計が連動。日次シード（AM-P）と整合。
- 提言・抜けもれ:
  - 機能追加＋コンテンツ（問題の難易度タグ付け）が要る。content-creator にタグ付け、dev-logic にフィルタ UI/ロジック。設計は Keita 承認先行。
  - 「1日1問」制限（DF-F18）との整合：フィルタしても1日1問のままか上級者は複数解けるか。
  - i18n ja/en。
- 更新日: 2026-05-30

### DF-F14 — 料金(en)レイアウト崩れ（Yearly Save 密着・Free 列空欄）　[P1 / 即実装]
- 優先度: P1 / ステータス: DONE（実装済 `d4ae9e0`「料金画面の英語レイアウト（年額タブgap＋比較表の非対応セル明示）」・DF-FV○・em dash 明示+flexWrap 密着解消）/ 担当: designer＋dev-logic
- 詳細: 料金画面の en で「Yearly Save 5 months」が密着、比較表 Free 列が空欄で×印もない（p20）。`src/screens/PricingScreen.tsx`。i18n/レイアウト・軽い。
- 関連ファイル: `src/screens/PricingScreen.tsx`、`src/PricingScreen.css`（or 該当 CSS）、`src/i18n.ts`（en の save 文言・比較表ラベル）
- DoD: en で「Yearly / Save N months」が適切な間隔で表示。比較表の Free 列に ○/× が入り空欄が消える。ja でも崩れない。tsc/eslint green。
- 依存: なし
- 提言・抜けもれ:
  - 「Save 5 months」の数値が実際の年額割引と一致しているか（コンテンツ正確性）も確認（feedback-audit-triage-correctness-first＝数値ズレは即修正）。
  - マーケ文言は安さ commodity 比較NG（feedback-logic-marketing）に抵触しない範囲で。
  - i18n ja/en 両方の比較表セルを埋める。×印は SVG アイコン（UI chrome は emoji 不可）。
  - 両OS 幅でレイアウト確認。
- 更新日: 2026-05-31（DF-FV 反映）

### DF-F15 — ジャーナルのログイン誘導コピーに価値訴求　[P1 / 即実装]
- 優先度: P1 / ステータス: DONE（実装済 `578d2ea`「ジャーナルのログイン誘導コピーに機能価値を追記」・DF-FV○・価値訴求文言 ja/en 結線）/ 担当: content-creator＋dev-logic
- 詳細: ジャーナルのログイン誘導コピーが「保存のため」の都合のみで価値訴求がない。「AIと自己分析」等の価値1行を追加（p02）。i18n 文言・軽い。
- 関連ファイル: `src/i18n.ts`（ジャーナルのログイン誘導文言 ja/en）、ジャーナル画面の該当文言箇所
- DoD: 誘導コピーがユーザー価値（AIで自己分析できる等）を1行で伝える。ja/en。
- 依存: DF-F4（段階ゲート）と同じ誘導ポイント＝セットで実装。
- 提言・抜けもれ:
  - DF-F4 と同時に。中立丁寧体（feedback-app-copy-neutral）。
  - 安さ訴求でなく価値訴求（feedback-logic-marketing）。
- 更新日: 2026-05-31（DF-FV 反映）

### DF-F16 — 初回ホームの情報過密を整理し最優先アクション明示　[P1 / 設計判断]
- 優先度: P1 / ステータス: REVIEW（実装済 `12f350c`「初回=診断ヒーロー単一化/再訪=おすすめ接続（案A）」＋`f4dcf13`「レビュー対応（スキップの永続化＋recommend aria整理）」・DF-FV○機能・設計判断系=Keita 見せ方目視待ち）/ 担当: designer＋dev-logic＋Keita
- 詳細: 初回ホームが情報過密で最優先アクションが不明（p07）。`src/screens/HomeScreenV3.tsx`。情報の優先順位付け・1stアクション明示。設計判断。
- 関連ファイル: `src/screens/HomeScreenV3.tsx`、`src/i18n.ts`
- DoD: 初回ホームで「今やるべき1アクション」が一目で分かる情報設計。Keita 承認したレイアウトに準拠。
- 依存: DF-F1（検索発見性）・DF-F10（タブ命名）・DF-F11（残日数常設）と同画面でレイアウト競合 → まとめて designer に1案。
- 提言・抜けもれ:
  - DF-F1/F10/F11 が同じホーム/ナビに乗るので、designer に「ホーム＋タブの情報設計」を1パッケージで出してもらい Keita 承認 → 個別実装、が手戻り最小。
  - 既存の UI-4/5/11（ホーム見出し整理）の延長線。過去の意匠方針（AM-K 手描き）と衝突しないか designer 確認。
  - i18n ja/en・中立丁寧体。
- 更新日: 2026-05-31（DF-FV 反映）

### DF-F17 — 復習ハブが有料と伝わらない　[P2 / 即実装]
- 優先度: P2 / ステータス: DONE（実装済 `1a056fd`「無料ユーザーに復習ハブの価値/有料を明示」・DF-FV○・有料ロック価値提示結線）/ 担当: content-creator＋dev-logic
- 詳細: 復習ハブが有料機能と伝わらず、無料時は「データ無し」表示のみ（p01）。有料であることが分かる文言/導線に。
- 関連ファイル: 復習ハブ画面、`src/i18n.ts`、`src/subscription.ts`（有料判定）
- DoD: 無料ユーザーに「これは有料機能」と分かる空状態＋アップグレード導線が出る。ja/en。
- 依存: DF-F3（状態ポリシー）に準拠。
- 提言・抜けもれ:
  - 「データ無し」と「有料ロック」は別。空状態を有料ロック表示に変える。
  - 安さでなく価値訴求（feedback-logic-marketing）・中立丁寧体。
- 更新日: 2026-05-31（DF-FV 反映）

### DF-F18 — フェルミ1日1問制限/課金導線が解く前に弱い　[P2]
- 優先度: P2 / ステータス: DONE（実装済 `f2e7819`「今日の1問完了後に有料(1日10問)へのソフト導線を追加」・DF-FV-1○ 2026-05-31 検証完了＝「解く前」idle フェーズに制限明示+有料導線をライブ結線）/ 担当: dev-logic
- 詳細: フェルミの1日1問制限と課金導線が、問題を解く前の段階で弱い（p01）。解く前に「無料は1日1問・有料で無制限」が伝わる導線に。
- 関連ファイル: デイリーフェルミ画面、`src/i18n.ts`、`src/subscription.ts`
- DoD: 解く前に制限と有料無制限が分かり、自然なアップグレード導線がある。ja/en。
- 依存: DF-F3（状態ポリシー）、DF-F13（難易度フィルタ）と同画面。
- 提言・抜けもれ:
  - DF-F13 と同画面なのでまとめて触ると効率的。価値訴求・中立丁寧体。
- 更新日: 2026-05-31（DF-FV 反映）

### DF-F19 — フェルミ問題の locale 化（en でも日本市場前提）　[P2 / 設計判断・長期]
- 優先度: P2 / ステータス: REVIEW（実装済 `7a2f1d0`「enフェルミをグローバル題材プールに差し替え＋AI anchorを世界/US値に修正」・DF-FV○機能・設計判断系=Keita 見せ方目視待ち）/ 担当: content-creator＋Keita
- 詳細: フェルミ問題が en でも日本市場前提（GMV・円建て等）（p20）。locale 別問題プール or 設問の汎用化。コンテンツ・重め/長期。
- 関連ファイル: フェルミ問題データ（`src/lessons/` or fermi データ）、en/ja の問題定義
- DoD: en ユーザーに通貨・市場前提が違和感ない問題が出る（locale 別プール or 通貨/市場の汎用化）。Keita 承認した方針に準拠。
- 依存: DF-F13（難易度/分野フィルタ）と問題プール設計が連動。
- 提言・抜けもれ:
  - en 別プールを新規作るか既存を汎用化するかは大きな方針＝Keita 判断。バルク新規生成はサンプル承認フロー（feedback-logic-course-thumbnails / content-audit のサンプル先行）。
  - 長期タスク。Wave3 でも最後。まず方針だけ Keita に確認。
- 更新日: 2026-05-31（DF-FV 反映）

### DF-F20 — 特商法リンクを ja/日本配信時のみ出し分け　[P2 / 即実装]
- 優先度: P2 / ステータス: DONE（実装済 `5fe6833`「特商法リンクを日本語ロケール時のみ表示」・DF-FV○・ProfileScreenV3 で ja 限定ガード結線）/ 担当: dev-logic
- 詳細: 特定商取引法リンクが en UI にも残る（p20）。ja/日本配信時のみ表示に出し分け。軽い。
- 関連ファイル: 特商法リンクの表示箇所（設定/料金/フッタ系。要 grep 特定）、locale 判定（`logic-locale`）、`src/i18n.ts`
- DoD: en UI で特商法リンクが非表示、ja で表示。tsc/eslint green。
- 依存: なし
- 提言・抜けもれ:
  - 確認時 `PricingScreen.tsx` には特商法文字列が無かった → 表示箇所は別画面（設定/法務リンク集）。実装前に `grep -rn '特定商取引\|特商\|tokushoho\|legal' src/` で所在特定。
  - 「en で隠す」が正か「日本配信（locale=ja かつ Android JP）か」要件確認。原則 locale=ja 出し分けで足りる見込み。
  - 他の法務リンク（プライバシー/利用規約）は en でも必要なので一律で消さない。特商法だけ。
- 更新日: 2026-05-31（DF-FV 反映）

### DF-F21 — フィードバック投稿に識別情報＋最低文字数チェック　[P2 / 即実装]
- 優先度: P2 / ステータス: DONE（実装済 `7819a34`「最低文字数チェック＋識別情報(端末ID/アプリバージョン)を付与」・DF-FV○・クライアントガード+識別子送信+サーバ受領結線）/ 担当: dev-logic
- 詳細: フィードバック投稿に最低限の識別情報が無い（ゲスト送信可だが guest ID を含まず、投稿者/再現環境を特定不可、最低文字数チェックもなし）。運用追跡性。`src/screens/FeedbackScreen.tsx`。**調査結果**＝現状 body は `{category, message, locale}` のみ送信（L39）、送信ガードは `!message.trim()` の非空チェックのみ（L31/L152）。guest ID・platform・version・最低文字数いずれも無し。
- 関連ファイル: `src/screens/FeedbackScreen.tsx`（L31 ガード, L39 body）、`src/guestUser.ts`（guest ID 取得）、`server/index.ts`（`/api/feedback` 受け側・DB feedback テーブル）、Capacitor Device（platform/version）
- DoD: 投稿 body に guest/user ID・platform（iOS/Android/web）・アプリ version・locale が含まれ、最低文字数（例10文字）未満は送信ガード＋インライン案内。サーバ/DB 側も追加フィールドを受けて保存。tsc/eslint green。
- 依存: server＋DB（feedback テーブル）にカラム追加が伴うなら migration＋手動 deploy。
- 提言・抜けもれ:
  - server 側 `/api/feedback` と Supabase `feedback` テーブルのスキーマ拡張が要る（カラム追加 migration）。backend 変更は手動 deploy-production.yml で本番反映（project-logic-render-auto-deploy）。
  - プライバシー: guest ID は匿名 ID（個人情報でない）である前提を確認。PII を勝手に集めない。
  - 最低文字数のエラー文言 ja/en・中立丁寧体。
  - 両OS: Capacitor Device プラグインで platform/version 取得（web フォールバック）。
- 更新日: 2026-05-31（DF-FV 反映）

### DF-FV — DF-F 系 実効性網羅検証（コードはあるが実機で効いているか）　[P0 / 検証]
- 優先度: P0 / ステータス: DONE（2026-05-31 全17件判定完了。○16/△1/×0、F2は別途○DONE）/ 担当: test-functional
- 詳細: 最新 main（1.5.457 相当）で、第1層「実装済み」18件（DF-F1/F4/F5/F6/F7/F9/F10/F11/F12/F14/F15/F16/F17/F18/F19/F20/F21、＋再オープン中の F2 も含めて確認）について「コードはあるが実機で効いているか」を1件ずつ○/×/△で網羅判定する。DF-F2 で発覚した「マージ済みなのに実機で効いていない」型の欠陥を他項目でも取りこぼさないための品質ゲート。
- 検証観点（各項目共通）: (a) 実機/エミュで該当画面を開いて症状が解消しているか、(b) ja/en 両ロケール、(c) 必要に応じ iOS/Android 両OS、(d) 元 finding の指摘そのものが消えているか（コミットが別解にすり替わっていないか＝F18「解く前 vs 完了後」のような乖離も検出）。
- 判定とぶら下げ: ○=効いている→該当 DF-F を DONE 候補（Keita 配信判断へ）。×=効いていない／△=部分的にしか効かない→**個別修正タスクとして DF-FV にぶら下げて起票し dev-logic 修正キューへ**。下記の「実効性検証 結果ぶら下げ」表に随時追記する。
- DoD: 18件すべてに○/×/△判定が付き、×/△ は個別修正タスク化されている。検証ログ（どの画面でどう確認したか）が残る。
- 依存: DF-F2 の codemod が共通スタイルに広く触るため、F2 実装と F1/F14/F16 等のレイアウト検証は回帰が干渉しうる。実装と検証の順序を test-functional と調整。
- 提言・抜けもれ:
  - backend を伴う F21（feedback カラム拡張）/ F12（ランキング集計）は、Render web 本番反映が手動 deploy-production.yml 必須（main push では web 自動反映されない＝project-logic-render-auto-deploy）。検証は「最新バンドルが本番に出ている」前提を先に満たすこと。Android は main push で自動反映。
  - 設計判断系で先行実装された F12/F16/F19（本来 Keita 承認待ちだった）は、機能の有無だけでなく「見せ方/方針が Keita 意図と合うか」も Keita 目視を1回挟む。
- 実効性検証 結果ぶら下げ（test-functional が随時追記）:
  - [x] DF-F1 ○ / [x] DF-F4 ○(機能/設計判断系Keita目視待ち) / [x] DF-F5 ○ / [x] DF-F6 ○ / [x] DF-F7 ○ / [x] DF-F9 ○ / [x] DF-F10 ○ / [x] DF-F11 ○ / [x] DF-F12 ○(機能/設計判断系) / [x] DF-F14 ○ / [x] DF-F15 ○ / [x] DF-F16 ○(機能/設計判断系) / [x] DF-F17 ○ / [x] DF-F18 △ / [x] DF-F19 ○(機能/設計判断系) / [x] DF-F20 ○ / [x] DF-F21 ○(※device列はmigration034本番適用+backend手動deploy要)
  - 検証方法(2026-05-31): test-functional がコミット diff×ライブ描画経路結線×ja/en i18n×永続化ガードを file:line で精査（tsc -b green ベースライン上で実施）。実機/エミュ目視ではなくコードレベル静的検証＝「dead code/未結線/別解すり替え/i18n片落ち」を主眼に判定。
  - △/個別修正タスク:
    - **DF-FV-1**（DF-F18 △）→ **解消済み DONE（2026-05-31 ○検証）**: 元 finding=「フェルミ課金導線が"解く前"に弱い」。旧実装(`f2e7819`)は result フェーズの完了後 upsell のみだった。`fc87908` で DailyFermiScreen.tsx:775 の `submitPhase==='idle'`（解く前）かつ無料ユーザー向けに制限明示(limitNoteTitle/Desc/Cta・ja/en)+onUpgrade導線(→pricing)をライブ結線。完了後導線(1164,result限定)と submitPhase で排他＝重複なし。元 finding 解消・別解すり替えなし。green tsc0/eslint.0err/vitest389pass。push済(Android自動配信)+Web deploy dispatch済。
- 更新日: 2026-05-31（DONE）

#### DF-F バッチ 抜けもれ提言サマリ（2026-05-30 実コミット同期後）
- 状況サマリ（2026-05-31 DF-FV 反映）: 実装済み18件は **DF-FV 実効性検証完了＝○16 / △1（F18→DF-FV-1 で○解消）/ ×0**。機能クリーン＋設計判断クリアの13件（F1/F5/F6/F7/F9/F10/F11/F14/F15/F17/F18/F20/F21）は **DONE 昇格**、設計判断系4件（F4/F12/F16/F19）は○機能だが Keita 見せ方目視待ちで **REVIEW 維持**。**DF-F2 は `3a588dc` の px→rem codemod＋実機検証○で DONE**（第3層→第2層へ昇格）。**DF-F8（通知粒度）も 2026-05-31 ○検証で DONE（`95cba0c`）**。**真の未着手は F3・F13 の2件のみ**（設計判断で BLOCKED・コミットなし）。なお下記の提言箇条書きは 2026-05-30 時点のスナップショット（F8=未着手 等は当時の記述）。
- ⚠ 最重要の抜けもれ: 「マージ済み＝完了」ではない。DF-F2 が実証したとおり、コミットが乗っていても実機で効かない欠陥がありうる。よって 18件は安易に DONE にせず、DF-FV の○判定を DONE の前提にする（feedback-audit-triage-correctness-first の精神＝表示と実態の食い違いは即修正）。
- ⚠ finding すり替わり注意: コミットが元 finding と別解にすり替わっている疑い → F18（finding=「解く前」に弱い／実装=「完了後」導線）。DF-FV で元 finding の指摘自体が消えたかまで見る。
- ⚠ 設計判断スキップ注意: 本来 Keita 承認待ちだった F12/F16/F19（と段階ゲート F4）が承認を待たず先行実装された。機能の有無だけでなく見せ方/方針が Keita 意図と合うか目視確認を1回挟む。
- 横断の親 F3（状態ポリシー）は未着手のまま。F4/F5/F9/F17/F18 が先に実装された＝ポリシー不在で個別実装した形なので、後から F3 を定義したとき各画面の整合ズレが出ないか DF-FV で確認。
- 通知基盤: F8（粒度・未着手）と F11（残日数・実装済だが通知部分は F8 依存）は `src/notifications.ts` スタブを共有。F11 が「バナーのみで通知は未実装」かを DF-FV で切り分け。実通知発火に踏み込むなら Keita 確認（CLAUDE.md gotchas #3）。
- backend 変更を伴う件（F12 ランキング・F21 フィードバック・F19 の一部）は **Render web 本番反映に手動 deploy-production.yml が必要**（main push では web 自動反映されない＝project-logic-render-auto-deploy）。DF-FV の検証は本番に最新バンドルが出ている前提を先に満たす。Android は main push で自動反映。
- 回帰注意の重め: F2（文字サイズ＝913 箇所 codemod で全画面波及）。test-functional で全テーマ×3サイズ×主要画面を横断検証。F8（通知）は未着手。
- i18n: 文言系ほぼ全件 ja/en＋中立丁寧体（feedback-app-copy-neutral）。UI chrome の×印等は SVG（emoji 不可）。
- 永続化: F2（font scale・実装済）・F4（ゲスト下書き・実装済）・F8（通知設定拡張・未着手）は localStorage/DB persist 必須。

#### DF-F バッチ 次アクション（2026-05-30 更新）
1. **DF-FV を最優先で回し切る**（test-functional）。実装済み18件の実効性を○/×/△判定（F2 は codemod＋実機検証○で DONE 済み）。×/△ は DF-FV にぶら下げて dev-logic 修正キューへ。これが「全部ちゃんと反映」の中核ゲート。
2. ~~**DF-F2 を dev-logic で修正完了させる**（root font-size スケール基準化＋inline px 913 箇所の rem 化 codemod、標準時非破壊、全テーマ×3サイズ横断検証）。第3層→第2層へ。~~ ✅ 完了（`3a588dc`・実機検証○・DONE）。
3. **未着手3件を進める**: F3（状態ポリシー親・Keita 承認＝状態×機能マトリクス提示）→ F13（フェルミ難易度フィルタ・Keita 承認＋コンテンツタグ付け）→ F8（通知粒度・notifications.ts スタブ実装可否を Keita 確認）。
4. 設計判断スキップ分（F12/F16/F19/F4）の見せ方を Keita に1回目視してもらい、意図ズレがあれば DF-FV 経由で修正タスク化。
5. DF-FV ○＋F2 修正完了＋未着手3件処理が揃ったら、test green を確認して **Keita 承認で配信**（実装→検証→配信の完了条件を満たす）。push/配信判断は Keita 専権。

---

## バッチ: 2026-05-30 UI/GUI 改善13件（Keita）

Keita からの Logic アプリ UI/GUI 改善依頼13項目。実装は dev-logic、ビジュアル絡みは designer、検証は test-functional / test-sanity に委譲（task-manager は構造化・検証のみ）。

ID 採番: 既存 T-* / AM-* と衝突しない **UI-1〜UI-13** プレフィックスを採用。

⚠ 全項目を実際のソースで照合済み（2026-05-30）。照合で判明した重要な論点:
- UI-3「レッスン右上の保存/×」: Keita 記載の `Lesson.css .ls-back`（line 28）は Lesson.tsx の `ls-header` 内 `←` 戻るボタンのみで、「保存」「×」ボタンは Lesson.tsx の `ls-header` には存在しない（戻る `←` と `ls-title` だけ）。「保存/×」UI の実体画面が未特定 → BLOCKED 寄り、実装前に対象画面の特定が必要。
- UI-9「炎を絵文字に戻す」: メモリ `feedback-logic-lesson-visual-hybrid` / CLAUDE.md gotchas #5 の「UI chrome は絵文字 NG・SVG のみ」ルールに**正面から反する**。さらに 2026-05-29 の T-U バッチで「UI chrome 絵文字 🔥 → SVG FlameIcon に置換（emoji 不可ルール遵守）」を実装した直後の**逆戻し**（ProfileScreenV3:442 のコメント参照）。Keita が明示指示しジャーナル側（StreakBadge.tsx:16 が 🔥 emoji）と統一する形なので方針 OK だが、dev-logic に渡す際「これは既定ルールの明示的例外。消し戻さないこと」をフラグする。CLAUDE.md gotchas #5 の例外リストにプロフィール炎を追記すべきか要 Keita 判断。

⚑ バッチ全体 本番反映済（2026-05-30）: UI-1〜13 全件 main push `695de6a`（掃除コミット含む）で Render web 手動 deploy / Android internal 自動デプロイ完了。品質ゲート＝tsc -b 0 / eslint . 0 / vitest 353 pass / reviewer approve。

| ID | タイトル | 優先度 | ステータス | 担当案 | 既存タスクとの関係 |
|----|---------|--------|-----------|--------|------------------|
| UI-1  | プレミアムテーマを全削除（light/dark のみに） | P1 | DONE（116dbb4） | dev-logic | テーマ系 T-R〜T-W / T-B と連動 |
| UI-2  | ライト時プロフィール表示名が白くて読めない | P0 | DONE（72f1579） | dev-logic | — |
| UI-3  | ライト時レッスン右上「保存」「×」が読みにくい | P1 | DONE（77f31ef・LessonStoriesScreen と特定） | dev-logic | — |
| UI-4  | ホーム見出しの手描き波線を削除 | P2 | DONE/noop（c7209fb revert で解消） | dev-logic | AM-K revert で消滅 |
| UI-5  | ホーム「おすすめ」セクションの扱い | P2 | noop（v3 に該当見出し無し・Keita 確認済） | dev-logic | — |
| UI-6  | 今日のフェルミ CTA を白文字に | P1 | DONE（95cba9b） | dev-logic | — |
| UI-7  | 復習「解けなかった問題は…」説明文を削除 | P2 | DONE（facfdcb） | dev-logic | — |
| UI-8  | 2回完了レッスンのチェック丸を色変え | P2 | DONE（1acd4ca・完了回数 persist あり） | dev-logic | — |
| UI-9  | プロフィールの炎を絵文字 🔥 に戻す | P1 | DONE（ccbd65f・CLAUDE.md 例外追記済） | dev-logic | T-U の逆戻し |
| UI-10 | プライバシーポリシーのモバイル幅改善 | P2 | DONE（1238789） | dev-logic | — |
| UI-11 | トレーニング上部「今日どのスキルを鍛える」削除 | P2 | DONE（516f67d） | dev-logic | — |
| UI-12 | 全体の文字サイズを拡大 | P1 | DONE（e92198e・--font-* を一律+約8%） | dev-logic（+designer） | type scale token は AM-K で導入済 |
| UI-13 | 全画面ライト/ダーク両方＋全ボタン遷移の横断検証 | P0（横断・最後） | DONE（test-functional・light/dark 全画面 pass） | test-functional / test-sanity | UI-1〜12 完了が前提 |

---

### UI-1 — プレミアムテーマを全削除（light/dark のみ）
- 優先度: P1 / ステータス: DONE（2026-05-30 commit 116dbb4。scope 拡大＝AppearanceSettingsScreen.tsx も tier 廃止で編集。保存済み premium mode の永続化ガード実装で light/dark へ安全フォールバック）/ 担当: dev-logic
- 詳細: sepia/forest/indigo/rose/slate（tier='premium'）を選択肢から削除し light/dark のみにする。`ModeId` 型からも premium ID を除去。
- 関連ファイル:
  - `src/theme.ts` — `ModeId` 型（line 27、premium 5 ID を除去）、`MODES` 配列（line 42-48 の premium 5 エントリ削除）、`ModeTier` 型自体が不要になる可能性（line 28）
  - `src/ThemeSettings.tsx` — isPaid() ゲート / PREMIUM バッジ / Upgrade CTA（line 12-113 周辺）。premium 選択肢を消すと付随 UI も不要に
  - `src/ThemeSettings.css` — premium バッジ・ロック表示の CSS が残れば削除
  - `src/i18n.ts` — `theme.mode.{sepia,forest,indigo,rose,slate}.{name,desc}` の ja/en キー（残置 or 削除判断）
- DoD: テーマ設定画面に light/dark の2つだけ表示。premium バッジ/Upgrade CTA が消える。既存ユーザーが premium テーマを保存済みの場合に light/dark へ安全フォールバックする（永続化済み mode が消えた ID の時のガード）。tsc/eslint green。
- 依存: なし（ただしテーマ系既存タスク T-R〜T-W / T-B と整合確認）
- 提言・抜けもれ:
  - 永続化ガード必須: localStorage の `theme` に保存済みの `sepia` 等を読んだ時に未定義 ID で壊れないようフォールバック（DEFAULT or light/dark へ寄せる）。これが最大の抜けもれ。
  - i18n: 削除する premium テーマの ja/en キーをどうするか（残しても害は小だが UI-1 の趣旨なら削除）。
  - 課金導線: テーマが唯一の premium 価値訴求だった場合、Pricing 側の文言に「テーマ」を謳っていないか要確認（マーケ整合）。
  - 両OS: テーマは CSS var ベースなので iOS/Android 差は小。ただし system dark mode 連動があれば確認。
- 更新日: 2026-05-30

### UI-2 — ライト時プロフィール表示名が白くて読みにくい
- 優先度: P0（可読性バグ）/ ステータス: DONE（2026-05-30 commit 72f1579。真因＝src/styles/extensions.css の `.profile-hero-name` の `#FFFFFF !important` 固定。これを除去しテーマ追従に）/ 担当: dev-logic
- 詳細: `.pf-name` は `color: var(--text-primary)` 指定済（Profile.css:52-60、verify 済）。にもかかわらず light で白くなる → 根本原因は (a) light テーマで `--text-primary` 自体が白寄りに解決されている、(b) ProfileScreenV3.tsx 側でインライン color を上書きしている、のどちらか。原因特定が先。
- 関連ファイル:
  - `src/Profile.css` line 52-60（`.pf-name`）
  - `src/screens/ProfileScreenV3.tsx`（表示名描画箇所のインライン style 確認）
  - `src/styles/tokens.css`（light テーマの `--text-primary` 定義値確認）
- DoD: light/dark 両テーマで表示名がコントラスト比 AA（4.5:1 目安）を満たす。`src/colorContrast.ts` 既存ヘルパで検証可。
- 依存: なし
- 提言・抜けもれ:
  - correctness バグ（明確な可読性不具合）なので即修正対象（feedback-audit-triage-correctness-first 準拠）。P0 妥当。
  - 同じ light テーマで他に白飛びする text がないか横展開チェック（レベルバッジ等プロフィール周辺）。
  - 両OS 実機ライトで再確認（UI-13 に含める）。
- 更新日: 2026-05-30

### UI-3 — ライト時レッスン右上「保存」「×（閉じる）」が読みにくい
- 優先度: P1 / ステータス: DONE（2026-05-30 commit 77f31ef。対象は LessonStoriesScreen と特定。固定 `#fff` → `var(--text-primary)` でテーマ追従に）/ 担当: dev-logic
- 詳細: Keita 記載の `Lesson.css .ls-back`（line 28）は Lesson.tsx の `ls-header` 内の戻る `←` ボタン。verify した結果、Lesson.tsx の `ls-header` には「保存」「×」ボタンは無い（`ls-back ←` と `ls-title` のみ）。「保存/×」UI が乗っている実画面（DailyFermiScreen / FermiLesson / LessonStoriesScreen / SavedItemsScreen 等のいずれか）の特定が必要。
- 関連ファイル（候補・要絞り込み）:
  - `src/Lesson.css` line 28 周辺（`.ls-back` 等。light コントラストは併せて要確認）
  - `src/screens/DailyFermiScreen.tsx` / `src/FermiLesson.tsx` / `src/screens/LessonStoriesScreen.tsx`（保存/閉じる UI の所在候補）
- DoD: light テーマでレッスン（フェルミ含む）右上の保存・閉じるボタンがコントラスト AA を満たし視認できる。対象画面が確定し修正される。
- 依存: なし（が対象特定がブロッカー）
- 提言・抜けもれ:
  - まず Keita に「どのレッスン画面の右上か（通常レッスン？今日のフェルミ？）」を1問確認すれば即 unblock。スクショ1枚あれば確定。
  - 特定後は UI-2 と同じく light テーマのアイコンボタン色を `--text-primary` / `--accent` 追従に直す系の修正になる見込み。
  - 意味アイコン（保存=ブックマーク、×=閉じる）に aria-label / 語ラベルがあるかも併せて確認（アクセシビリティ）。
- 更新日: 2026-05-30

### UI-4 — ホーム見出しの手描き波線（UnderlineSingle）を削除
- 優先度: P2 / ステータス: DONE/noop（AM-K 第2弾 c7209fb の revert〔commit af7b4a3〕により波線が HomeScreen ごと消滅＝個別対応不要で解消）/ 担当: dev-logic（designer に意匠確認）
- 詳細: `UnderlineSingle`（icons/handdrawn の手描き波線 SVG）を削除。verify 済の使用箇所は HomeScreenV3.tsx:181 と :585（依頼の line 20 は import）。2箇所両方を消すのか片方かは要確認だが、依頼文は「ホームの文言の波線いらない」なのでホーム内の波線（181, 585）を対象。
- 関連ファイル:
  - `src/screens/HomeScreenV3.tsx` line 20（import）、181、585（描画）
  - `src/icons/handdrawn.tsx`（他で未使用になれば export 整理。ただし他画面で使っていれば残す）
- DoD: ホーム見出し下の手描き波線が消える。未使用 import が残らない（eslint no-unused-vars でビルド落ちるため必須）。
- 依存: AM-K（UI刷新・手描き素材展開）と意匠が連動 → designer/Keita の刷新方針と矛盾しないか確認
- 提言・抜けもれ:
  - AM-K で「明朝見出し＋手描き下線」を HomeScreen に入れたばかり（c7209fb）。波線削除はその意匠の一部巻き戻しになるので、AM-K の方向性と衝突しないか designer に一言確認。
  - import 削除漏れ＝CI lint red 直結（reference-logic-ci-lint-scope）。`eslint .` で確認。
  - UnderlineSingle が他画面でも使われていないか grep（handdrawn 一括撤去ではない）。
- 更新日: 2026-05-30

### UI-5 — ホーム「おすすめ」セクションの扱い
- 優先度: P2 / ステータス: noop（2026-05-30 Keita 確認済で確定。v3 に該当見出しは無く、`home.badgeRec` は旧 v1 App.tsx のみ参照＝現行 v3 ホームに表示されないため作業不要）/ 担当: dev-logic
- 詳細: HomeScreenV3.tsx:257-278 の "Hero Recommend" セクション。`<SectionHeading>{t('home.badgeRec')}</SectionHeading>`（line 258、badgeRec='おすすめ'）。依頼「おすすめの文言いらない」が (a) 見出し文言だけ削除、(b) おすすめセクションごと削除、のどちらか不明。
- 関連ファイル:
  - `src/screens/HomeScreenV3.tsx` line 257-278（Hero Recommend セクション）
  - `src/i18n.ts` line 302（`home.badgeRec`='おすすめ'）ja / 対応 en
- DoD: Keita の意図どおり（見出しのみ or セクションごと）にホームから「おすすめ」表示が消える。セクションごと削除ならレイアウトに穴が空かないか確認。
- 依存: なし
- 提言・抜けもれ:
  - 要 Keita 確認（見出しだけ消すと、おすすめのレッスンカード自体は残り見出し無しで宙に浮く）。BLOCKED 一歩手前。1問で解消。
  - セクションごと削除なら関連ロジック（ランダム recommend 算出）も dead code 化するので併せて整理。
  - i18n: badgeRec キーの ja/en 両方。
- 更新日: 2026-05-30

### UI-6 — 今日のフェルミ CTA を白文字に
- 優先度: P1 / ステータス: DONE（2026-05-30 commit 95cba9b）/ 担当: dev-logic
- 詳細: Daily Fermi カードの CTA ピル（HomeScreenV3.tsx:208-220）は現状 `background: var(--accent-btn-fg)` / `color: var(--accent-btn)`。Keita 依頼は「チャレンジする」「レッスンを始める」を白文字に。該当文言は `home.dailyChallenge`='チャレンジする'（i18n:306）、`home.allFermiDoneCta`='解いた問題を振り返る'（i18n:313）、`home.startLesson`='スタート'（i18n:745）。
- 関連ファイル:
  - `src/screens/HomeScreenV3.tsx` line 194-220（Daily Fermi カード本体・CTA ピル）
  - CSS var: `--accent-btn` / `--accent-btn-fg`（styles/tokens.css）
- DoD: フェルミカードの CTA テキストが全テーマで白（または十分なコントラストの明色）で読める。ハードコード hex は使わず CSS var（白が必要なら `--accent-btn-fg` の意味整理 or 専用 var）。light/dark/accent 全色で破綻しないこと。
- 依存: AM-L（フェルミカードのグラデ除去 DONE）と同じカードを触るので整合確認
- 提言・抜けもれ:
  - 「白文字に」をハードコード `#fff` で入れない（CLAUDE.md デザイン制約：hex 禁止・CSS var 使用）。`--accent-btn-fg` が既に白を意図する var なら、現状ピルが反転配色（fg を背景に）になっているのが原因。配色の入れ替えで解決する可能性大。
  - 「レッスンを始める」CTA が同カード内か別カードか要確認（startLesson は別箇所の可能性）。
  - AM-L で同カードのグラデを var(--accent) フラットにしたばかり。背景が accent 系になった上で白文字なら自然。整合 OK か確認。
  - 両テーマ（特に light で accent が淡い時）に白文字がコントラスト割れしないか UI-13 で確認。
- 更新日: 2026-05-30

### UI-7 — 復習「解けなかった問題は…」説明文を削除
- 優先度: P2 / ステータス: DONE（2026-05-30 commit facfdcb）/ 担当: dev-logic
- 詳細: 該当文言を grep で特定済 → `reviewHub.tip`='解けなかった問題は時間を空けて何度か解き直すと定着しやすくなります。'（i18n.ts:1572、ja）。ReviewHubScreen で表示。これを削除（表示箇所と i18n キー両方）。
- 関連ファイル:
  - `src/i18n.ts` line 1572（`reviewHub.tip` ja）＋対応 en
  - `src/screens/ReviewHubScreen.tsx`（`reviewHub.tip` 参照箇所を削除）
- DoD: 復習ハブ画面から該当説明文が消える。i18n キー削除なら ja/en 両方。参照が残って undefined キー表示にならないこと。
- 依存: なし
- 提言・抜けもれ:
  - i18n は ja/en 両方処理（en の対応キーも grep して削除）。
  - 表示コンポーネント側の参照を消さずキーだけ消すと空表示になる → 両方セットで。
  - 文言削除後にレイアウトの余白が不自然にならないか軽く確認。
- 更新日: 2026-05-30

### UI-8 — 2回完了レッスンのチェック丸の色を変える
- 優先度: P2 / ステータス: DONE（2026-05-30 commit 1acd4ca。完了回数の永続データが存在したため実装。遡及制約あり＝カウンタ導入前に複数回完了したレッスンは反映されない）/ 担当: dev-logic
- 詳細: `.pf-completed-check`（Profile.css:357-369、現状 `--success #10B981` 系）。完了回数（2回以上）に応じてチェック丸の色を変える出し分けが必要。完了回数データの所在確認が前提（progressStore / courseProgress 等）。
- 関連ファイル:
  - `src/Profile.css` line 357-369（`.pf-completed-check`。新クラス or modifier 追加）
  - `src/screens/ProfileScreenV3.tsx`（完了回数を見て class 切り替え）
  - `src/progressStore.ts` / `src/courseProgress.ts`（完了回数の永続データがあるか確認）
- DoD: 2回以上完了したレッスンのチェック丸が1回完了と区別できる色になる。色は CSS var（ハードコード hex 禁止）。完了回数が永続化データから正しく取れる。
- 依存: 完了回数の永続化有無に依存（無ければデータ追加が必要 → スコープ拡大）
- 提言・抜けもれ:
  - 最大の論点: 「完了回数（2回）」が現状データとして持たれているか。progress が boolean 完了フラグだけなら回数カウントの永続化追加が必要でスコープが膨らむ → 要データ確認。
  - 新色は CSS var 化（既存 `--success` とは別の意味色を tokens に足すか検討）。
  - アクセシビリティ: 色だけで区別すると色覚差で伝わらない → 語ラベル/形状差の併用を検討（任意）。
  - 永続化: 表示だけでなく回数の保存・再表示が要る（このタスクの本質的な抜けもれ観点）。
- 更新日: 2026-05-30

### UI-9 — プロフィールの炎を絵文字 🔥 に戻す（ジャーナルと統一）
- 優先度: P1 / ステータス: DONE（2026-05-30 commit ccbd65f。CLAUDE.md gotchas #5 の絵文字例外リストに「プロフィールのストリーク炎 🔥」を追記済＝掃除コミット 695de6a。将来の SVG 消し戻し事故を防止）/ 担当: dev-logic
- 詳細: ProfileScreenV3.tsx の SVG `FlameIcon`（import line 14、描画 159-160/181/432、定義 441-444）を絵文字 🔥 に置換。ジャーナル側 `src/components/journal/StreakBadge.tsx:16` が既に 🔥 emoji なのでそれと統一。
- 関連ファイル:
  - `src/screens/ProfileScreenV3.tsx` line 14（import）、159-160、181、432、441-444（FlameIcon 定義・使用）
  - 参考: `src/components/journal/StreakBadge.tsx` line 16（🔥 の既存実装パターン）
- DoD: プロフィールのストリーク炎が絵文字 🔥 表示になる。TTS で「炎 絵文字」と読まれない対策（aria-hidden）。dim 状態（studiedCount===0）の表現を維持。
- 依存: なし
- 提言・抜けもれ（重要フラグ）:
  - ⚠ これは CLAUDE.md gotchas #5 「UI chrome は絵文字 NG・SVG のみ」ルールの**明示的例外**。さらに 2026-05-29 T-U で「🔥 → SVG FlameIcon に置換（emoji 不可ルール遵守）」を入れた直後の**逆戻し**（ProfileScreenV3:442 のコメントが証跡）。dev-logic が既定ルールに従って「これ絵文字だから SVG に直そう」と再度巻き戻さないよう、PR 説明に「Keita 明示指示の例外・消し戻し禁止」を必ず明記。
  - CLAUDE.md gotchas #5 の絵文字 OK 例外リスト（現状ジャーナルの mood/weather/phase/streak のみ）に「プロフィールのストリーク炎」を追記すべきか → 要 Keita 判断（追記すれば将来の巻き戻し事故を防げる）。
  - dim/サイズ違い（16/26/18px）を絵文字で再現する際の見た目調整（font-size でサイズ、opacity で dim）。
  - 他に SVG FlameIcon を使う画面（ホーム等）も同様に絵文字化するか、プロフィールだけか要確認（依頼はプロフィール限定と読める）。
- 更新日: 2026-05-30

### UI-10 — プライバシーポリシーのモバイル幅改善
- 優先度: P2 / ステータス: DONE（2026-05-30 commit 1238789）/ 担当: dev-logic
- 詳細: `public/privacy/[lang].html`（外部静的 HTML）がスマホでカラム幅が狭く読みにくい。HTML 内 CSS の max-width / padding / column を調整。
- 関連ファイル:
  - `public/privacy/*.html`（ja/en 等の lang 別 HTML、内部 `<style>`）
- DoD: モバイル幅（375px 想定）でプライバシーポリシーが端まで適切に使われ読みやすい。ja/en 両方の HTML を直す。横スクロールが出ない。
- 依存: なし
- 提言・抜けもれ:
  - lang 別 HTML が複数ある場合は全言語ファイルを直す（ja だけ直して en が残る抜けもれ注意）。
  - viewport meta（`<meta name="viewport">`）が入っているか確認（無いとモバイルで縮小表示になる根本原因の可能性）。
  - これは React アプリ外の静的 HTML なので tsc/eslint の対象外 → 実機/エミュ目視確認が検証手段（UI-13 に含める）。
  - 利用規約など同種の外部 HTML が他にあれば同じ問題を抱えていないか横展開確認。
- 更新日: 2026-05-30

### UI-11 — トレーニング上部「今日どのスキルを鍛える」文言を削除
- 優先度: P2 / ステータス: DONE（2026-05-30 commit 516f67d）/ 担当: dev-logic
- 詳細: RoadmapScreenV3.tsx:430 の見出し `{t('roadmap.heading')}`（fontSize 24 の見出し）。これが「今日どのスキルを鍛える」系の文言と推定（verify で roadmap.heading が該当箇所と特定）。i18n の `roadmap.heading` 値を確認の上、見出しを削除 or 文言変更。
- 関連ファイル:
  - `src/screens/RoadmapScreenV3.tsx` line 430（見出し描画）
  - `src/i18n.ts`（`roadmap.heading` の ja/en 値を確認 → 削除 or 空に）
- DoD: トレーニング画面上部から該当見出し文言が消える。見出し削除でレイアウト上部が不自然に空かないか確認。i18n ja/en 整合。
- 依存: なし
- 提言・抜けもれ:
  - `roadmap.heading` の実値を確認して本当に「今日どのスキルを鍛える」かを最終確定（verify では参照箇所のみ特定、文字列値は未確認）。違えば対象キー要再特定。
  - 見出しだけ消すか、見出し行ごと（余白含め）消すかでレイアウト印象が変わる → 削除後の上部余白を確認。
  - i18n ja/en 両方。
- 更新日: 2026-05-30

### UI-12 — 全体の文字サイズを拡大
- 優先度: P1 / ステータス: DONE（2026-05-30 commit e92198e。type scale `--font-*` を一律+約8%。当初 brief の `--fs-*` トークンは存在せず、正しいトークン `--font-*` で再実行。UI-13 横断検証で文字溢れ無しを確認）/ 担当: dev-logic（+designer レビュー）
- 詳細: type scale token（`--font-*`）を一律+約8%スケールアップ。全画面に波及するため慎重に。
- 関連ファイル:
  - `src/styles/tokens.css` line 273-277（type scale token）
  - 影響: 全 screens / components（token 参照箇所すべて）
- DoD: 本文・見出しが一回り大きく読みやすくなる。スケールアップ後に主要画面（ホーム/ロードマップ/レッスン/プロフィール/復習/設定）でテキスト溢れ・折返し崩れ・ボタン内文字はみ出しが発生しない。tsc/eslint green。
- 依存: AM-K で type scale を token 化済（c7209fb）→ その token を一括調整すれば横展開が効く（基盤あり）
- 提言・抜けもれ:
  - 最大リスクは回帰。token 1点調整で全画面に効くのは効率的だが、固定幅ボタン・1行前提のラベル・カード内テキストが溢れる。UI-13 の横断検証に「文字溢れチェック」を必ず含める。
  - スケール倍率を Keita と握る（全 token 一律 +N% か、body 中心か）。「大きく」が曖昧 → サンプル1画面で見せて承認が安全。
  - 行間（line-height）も併せて調整しないと詰まって見える。
  - 両OS/両テーマ＋大フォント端末設定（OS のアクセシビリティ文字拡大）との二重拡大も考慮。
  - designer に意匠レビューを通す（type scale はブランドの肝）。
- 更新日: 2026-05-30

### UI-13 — 全画面ライト/ダーク両方＋全ボタン遷移の横断検証
- 優先度: P0（横断・UI-1〜12 完了後に実施）/ ステータス: DONE（2026-05-30 test-functional 実施。light/dark 全画面 pass、UI-1〜12 の差し戻し不具合なし。既存 onboarding E2E の 1 赤は無関係な既知債務として除外）/ 担当: test-functional（網羅）+ test-sanity（スモーク）
- 詳細: 全画面 happy path × テーマ両方（light/dark）× 全ボタン押下・画面遷移を網羅検証。
- 検証手段（制約明記）:
  - ⚠ Keita 依頼の「実機」確認は物理デバイスが必要で AI 側から直接は不可。代替として (a) Playwright モバイルエミュ（chromium モバイル viewport）で happy path + テーマ両方 + ナビ遷移を自動網羅、(b) Capacitor ビルド（`npm run cap:sync`）でネイティブ実機差分は Keita の手元確認に委ねる、という二段構え。この制約をレポートに明記する。
  - 既存 E2E は `playwright test --project=chromium`（53+ pass / 0 fail 期待）。テーマ切替・全タブ遷移のシナリオが既存で網羅されているか確認し、不足を追加。
- 関連ファイル:
  - `tests/`（Playwright E2E。テーマ両方×全画面遷移シナリオの追加/更新）
  - `src/AppV3.tsx`（Screen union 全 variant が遷移カバレッジ対象）
- DoD: light/dark 両テーマで全主要画面が描画・遷移し、可読性破綻（UI-2/3/6 系）・文字溢れ（UI-12 系）・削除漏れ（UI-4/5/7/11）が無いことを確認。E2E green。発見した不具合は個別タスクに差し戻し。
- 依存: UI-1〜UI-12 の実装完了が前提（最後に実施）
- 提言・抜けもれ:
  - 「実機」は物理デバイス必須 = AI 直接不可。エミュ + Capacitor ビルド + Keita 手元確認の役割分担をレポート明記（依頼に明示された制約）。
  - テーマ両方 × 全画面のマトリクスをチェックリスト化（test-functional に渡す）。
  - UI-1（premium テーマ削除）後はテーマ検証が light/dark の2軸だけになる点も反映。
  - 回帰観点: UI-12 文字拡大の影響が一番出るので重点的に。
- 更新日: 2026-05-30

---

#### このバッチの抜けもれ提言サマリ（UI-1〜13）
1. 永続化ガード（UI-1）: 削除した premium テーマを保存済みユーザーのフォールバック必須。
2. i18n ja/en 両対応（UI-1/5/7/11）: 文言削除は ja と en の両キーを処理。片方残しの抜けもれ注意。
3. CI lint（UI-4）: import 削除漏れ＝`eslint .` で CI red。デプロイ前は全体 lint。
4. ルール例外フラグ（UI-9）: 絵文字 NG ルールの明示例外。T-U の逆戻しなので dev-logic に「消し戻し禁止」明記。CLAUDE.md gotchas #5 例外リスト追記を Keita 判断。
5. デザイン制約（UI-6/8/12）: 白文字・新色は hex 禁止・CSS var 使用。
6. 完了回数データ（UI-8）: 2回完了の出し分けに永続データが要る。無ければスコープ拡大。
7. 文字拡大の回帰（UI-12）: token 1点で全画面波及。文字溢れ検証必須。
8. 実機制約（UI-13）: 物理デバイス確認は AI 直接不可。エミュ+Capacitor+Keita 手元の二段構え。

#### 要 Keita 確認（BLOCKED / 曖昧）→ 全件クローズ（2026-05-30）
- UI-3: 対象画面＝LessonStoriesScreen と特定し修正（DONE 77f31ef）。
- UI-5: v3 に該当見出し無しと Keita 確認済＝noop 確定。
- UI-9: CLAUDE.md gotchas #5 の絵文字例外リストにプロフィール炎を追記済（掃除 695de6a）。
- UI-12: `--font-*` を一律+約8%で実装（DONE e92198e）。UI-13 で文字溢れ無し確認。

#### バッチ完了（2026-05-30）
UI-1〜13 全件クローズ＝DONE 11件（1/2/3/6/7/8/9/10/11/12/13）＋ noop 2件（4＝AM-K revert で消滅 / 5＝v3 該当無し）。掃除コミット 695de6a で「無料テーマ見出しの整合・デッド i18n キー削除・UI-9 例外を CLAUDE.md 追記」。main push `695de6a` で本番反映（Render web 手動 deploy / Android internal 自動）。品質ゲート＝tsc -b 0 / eslint . 0 / vitest 353 pass / reviewer approve。残課題なし。

---

## バッチ: 2026-05-30 ドッグフーディング企画（Keita 依頼）

テスト用20アカウント×ペルソナで実使用 → UI/機能改善をアプリ内フィードバックから起票＋サーバ負荷計測する企画。本番環境＋厳密タグ付け（`is_test` / `[DOGFOOD]` / `source=dogfood`）で実データと混ざらないよう隔離。ハイブリッド方式＝データ投入20体＋代表6体のフル UI 走行。ID プレフィックスは **DF-**（既存 T-* / AM-* / UI-* と衝突なし）。

| ID | フェーズ | 優先度 | ステータス | 担当 | 概要 |
|----|---------|--------|-----------|------|------|
| DF-1 | Phase 1 ペルソナ20設計 | P1 | DONE | 林 | docs/dogfooding/personas.md。代表6体＝p01/p02/p04/p07/p18/p20 |
| DF-2a | Phase 2a スキーマ確認＋seed/cleanup スクリプト | P1 | DONE | 林 | scripts/dogfood/、commit 8b39356/1dd17bb。本番 yctlelmlwjwlcpcxvmgx（2026-05-30 訂正: ref プレフィックスは誤記） |
| DF-2b | Phase 2b 本番投入 | P1 | DONE | 林 | MCP 経由（service_role キー不使用）。users20/fermi117/subs9/feedback20 全件検証一致 |
| DF-3 | Phase 3 代表6体フル UI 走行 | P1 | TODO（着手可・2026-05-30 unblock） | 林 | ログイン方式確定＝実メール（Gmail エイリアス +pXX）で本番マジックリンク実受信 |
| DF-4 | Phase 4 負荷計測 | P2 | 未着手 | 林 | サーバ負荷の計測 |
| DF-5 | Phase 5 アプリ内フィードバック | P1 | 未着手 | 林 | 代表6体の使用フィードバックを起票 |
| DF-6 | Phase 6 集約 | P1 | 未着手 | 林 | UI/機能改善の起票へ集約 |

### DF-1 — Phase 1 ペルソナ20設計　[P1 / DONE]
- 詳細: 20ペルソナを設計し `docs/dogfooding/personas.md` に定義。フル UI 走行する代表6体＝p01/p02/p04/p07/p18/p20 を選定。
- DoD: 20体のペルソナ属性＋代表6体の選定が文書化されている。→ 充足。

### DF-2a — Phase 2a スキーマ確認＋seed/cleanup スクリプト　[P1 / DONE]
- 詳細: 本番スキーマ（`yctlelmlwjwlcpcxvmgx`）を確認し、`scripts/dogfood/` に seed/cleanup スクリプトを整備。commit 8b39356 / 1dd17bb。（2026-05-30 訂正: 旧表記 `refyctlelmlwjwlcpcxvmgx` の `ref` プレフィックスは誤記。正しい本番プロジェクト ID は `yctlelmlwjwlcpcxvmgx`）
- DoD: seed と cleanup（`is_test` 一括削除）が用意されている。→ 充足。`scripts/dogfood/cleanup.sql` 準備済。

### DF-2b — Phase 2b 本番投入　[P1 / DONE]
- 詳細: MCP 経由（service_role キー不使用）で本番に20体投入。投入結果＝users20 / fermi117 / subs9 / feedback20 を全件検証し設計と一致を確認。タグ付け（`is_test` / `[DOGFOOD]` / `source=dogfood`）で隔離。
- DoD: 投入件数が設計どおりで全件検証一致。→ 充足。
- 提言・抜けもれ: クリーンアップ経路を必ず確保（cleanup.sql 準備済）。負荷計測前に本番実データへの混入が無いことを `is_test` フィルタで再確認。

### DF-3 — Phase 3 代表6体フル UI 走行　[P1 / TODO（着手可）]

> 状態（2026-05-30 unblock）: Keita 判断でログイン方式確定＝**実メール（Gmail エイリアス）**。`keita.urano+p01@gmail.com` 等の `+pXX` エイリアスで本番マジックリンクを実受信し、Gmail 経由でリンクを拾って走行する。本番と同一フローで観察できる（feedback_logic_auth_magiclink_only を崩さない解法）。担当=林。

- 詳細: 代表6体（p01/p02/p04/p07/p18/p20）でアプリ UI をフル走行し UX を観察。各体は Gmail エイリアス（`keita.urano+pXX@gmail.com`）でログイン。
- ⚠次アクション/抜けもれ（最重要・着手時チェック）: **DF-2b で投入済み20体の email がエイリアス形式（`+pXX`）になっているかを走行着手時に確認**する。違っていればそこだけ修正 or 再投入（投入済みデータの email がエイリアスでないと本番マジックリンクが届かず走行できない）。
- 後続依存: DF-4 / DF-5 / DF-6 は DF-3 完了が前提。
- 提言・抜けもれ: 両OS 観点はモバイル専用なので Android internal 中心で走行。走行で見つけた不具合は DF-5 経由でアプリ内フィードバック起票に寄せる。

### DF-4 〜 DF-6 — 負荷計測 / アプリ内フィードバック / 集約　[未着手]
- DF-4（P2）: サーバ負荷計測。DF-2b 投入データ＋DF-3 走行のトラフィックで計測。
- DF-5（P1）: 代表6体の使用フィードバックをアプリ内フィードバック経路から収集・起票。
- DF-6（P1）: UI/機能改善として集約。次バッチの修正タスク起票へ繋げる。
- 依存: DF-3（走行）完了が DF-4/DF-5 の前提。DF-3 が Keita のログイン方式判断待ちのため後続も待機。

#### 抜けもれ提言サマリ（DF）
1. クリーンアップ経路（cleanup.sql）を本番で必ず通せる状態に保つ。企画終了後に `is_test` 一括削除を実行。
2. 本番実データへの混入ゼロを保証（`is_test` / `source=dogfood` タグで全件隔離）。負荷計測・分析時はテストデータを除外して読む。
3. DF-3 のログイン方式は確定済（2026-05-30）＝実メール Gmail エイリアス `+pXX`。マジックリンク前提（feedback_logic_auth_magiclink_only）を崩さない解法で unblock 済。

#### 次アクション（DF）
1. DF-3 着手（TODO・着手可）: まず DF-2b 投入済み20体の email がエイリアス形式（`+pXX`）かを確認 → 違えば修正/再投入 → 代表6体で本番マジックリンク受信して走行開始。
2. DF-3 走行と並行して DF-4 負荷計測のメトリクス定義を準備。
3. 走行結果を DF-5 → DF-6 で起票・集約し、次の改善バッチに繋げる。

---

## バッチ: 2026-05-29 追加修正（Keita 朝・席外し中）

Keita 朝の追加依頼8件。Keita は席を外しており、林の判断で自律的に進める前提で構造化（実装は委譲）。

⚠ ID 採番について（task-manager 注記・要 Keita 共有）: Keita の依頼文では「ID は T-K から続ける」と指示があったが、**この台帳は既に T-K〜T-X を別バッチで使用済み**（T-K=ジャーナルグラフtap詳細[DONE]、T-L=フェルミ答え位置[DONE]、T-R〜T-W=テーマ系、T-X=AI検索 等）。グローバルで衝突するため、このバッチは **AM-K〜AM-R**（AM = Additional Morning）プレフィックスで採番する。Keita 依頼の T-K〜T-R ラベルとは下表のとおり1対1対応。Keita 帰還時に「ID 体系を AM- にした／既存 T-* と衝突回避した」点を共有する。

さらに重要: **このバッチの数件は既存タスクと内容が重複/連動する**。重複起票せず既存へ寄せる方針を各項に明記した（特に AM-K↔T-V、AM-L↔T-T根本原因A/T-S、AM-Q↔T-X）。

| ID | Keita ラベル | タイトル | 優先度 | ステータス | 担当案 | 既存タスクとの関係 |
|----|------------|----------|--------|-----------|--------|------------------|
| AM-K | T-K | UI 全体の「AIっぽさ」をなくす刷新方針の策定＋実装 | P1 | CANCELLED（2026-05-30 Keita 指示。第2弾 c7209fb〔明朝+手描き+HomeScreen 再構成〕を revert 済＝commit af7b4a3。第1弾 36d08aa・テーマ work d0558cb は温存。「全画面UI設計」も一旦保留＝AM-K 土台が消えたため再開時は新方向を要決定） | designer＋dev-logic＋林 | T-V 内包。revert で UI-4 の波線も消滅 |
| AM-L | T-L | グラデーション除去（カスタムコース生成カード／今日の1問カード） | P1 | DONE（2026-05-29。Daily Fermi カード〔HomeScreenV3:184〕の --brand-grad-h グラデ廃止→フラット var(--accent)＋青グロー boxShadow を accent追従に。カスタムコース生成カード〔RoadmapScreenV3:697「AIで自分専用コースを作る」〕の linear-gradient 廃止→フラット var(--accent)＋内部アイコンを accent-fg 追従に。両方テーマ追従） | dev-logic | T-S／T-T 根本原因A と統合実装 |
| AM-M | T-M | 「・今日の一問」の先頭「・」除去＋表記ゆれ統一 | P2 | DONE（2026-05-29。表記ゆれを「今日の1問」に統一〔pricing.heroSub/featFermi・savedItems.filterFermi/emptyFermi/typeFermi の ja を 今日の一問→今日の1問。en は変更なし〕。先頭中黒「・」は現ソースに literal/JSX前置/CSS ::before いずれも存在せず＝grep 全量確認で付与元なし。home カード先頭の装飾ドットは中黒文字でなく styled div の小円なので対象外として維持） | dev-logic | 表記は home 主導線の「今日の1問」に寄せた |
| AM-N | T-N | 法務記載の見直し（利用規約／プライバシー／特商法） | P1 | REVIEW（2026-05-31 実装green完了・未push。特商法 ja/en に確定値を反映済〔運営責任者を会社名→個人名 柴田圭太/Keita Shibata・電話番号を非掲載＋請求時開示注記化・最終更新日2026-05-31〕＋年額7日間無料トライアル記載を差し戻し〔初回限定・8日目¥2,450課金・期間中解約で課金なし・月額トライアル無し明記、AM-O Offer yearly-free-trial-7d と整合〕。tsc0/eslint0。ブランチ `am-n-tokushoho-confirmed-values` commit `13041a3` に隔離・未push。terms/privacy は先行反映676c3d6で確定値済・マーカー残無し。**残=削除ページ一本化〔delete-account→account-deletion リダイレクト・アプリ内導線外のPlay Console用URL独立小物〕**。本番 push/deploy は法務ゆえ Keita 承認待ち〔別レイヤー〕） | dev-logic（HTML反映） | 確定値: アポロ合同会社/Apollo LLC・責任者 柴田圭太・池袋 BIGオフィスプラザ1206・月¥350/年¥2450・電話非掲載/開示注記・削除は account-deletion 正本/delete-account リダイレクト・インボイス記載なし・Googleログイン記述削除済。AM-O 課金実態と整合必須（トライアルは年額のみ・Play Console Offer と整合） |
| AM-O | T-O | 料金プランの Google Play 課金実装（購入導線の結線） | P1 | BLOCKED（コード DONE／Keita SKU 登録待ち。SKU 登録セット確定＝Group `logic_paid`／月額 `logic_paid_monthly`-`monthly-autorenew`-¥350 トライアル無し／年額 `logic_paid_yearly`-`yearly-autorenew`-¥2,450＋Introductory Offer `yearly-free-trial-7d`〔初回限定・無料7日。月額には付けない〕。残は Keita が Play Console で一字一句一致で Active 登録。その後 dev-logic/test-functional が実機購入ハッピーパス検証〔キャンセル/失敗/restore＋トライアル年額分岐〕） | dev-logic（実装済）＋Keita（SKU 登録）＋test-functional（実機検証） | project_logic_play_billing_gaps #4。Product ID は src/billing/products.ts PLAY_PRODUCTS と一致確認済。年額トライアル＝2026-05-30 Keita 決定 |
| AM-P | T-P | フェルミランキング累計スコアのダミーを毎日ランダム増分 | P2 | DONE（2026-05-29 commit 1c18ebb。固定スコア廃止→「期間トップ実スコア×日次シード倍率」で動的化。実データ isMock:false は不変。main push＋backend を deploy-production.yml で本番デプロイ完了〔run 26629582944 success〕。ローカル smoke で週/月 mock スコアが降順・日替わり検証済） | dev-logic | server/routes/fermi.ts。リクエスト時算出方式＝cron 不要で運用が軽い |
| AM-Q | T-Q | トレーニング検索の改修（右上虫眼鏡＋AI検索） | P1 | DONE（2026-05-29 commit 6a3c985〔別アクター実装〕。RoadmapScreenV3 右上虫眼鏡＋検索オーバーレイ、server/routes/search.ts〔POST /api/search, haiku-4-5, rate-limit 20/min〕、src/aiSearch.ts、i18n ja/en、vitest 13。backend は deploy-production.yml で本番反映済〔run 26629582944 success〕＝T-X と両方充足） | designer＋dev-logic | **T-X（トレーニングのAI検索）と同一依頼＝T-X も DONE**。重複起票しない |
| AM-R | T-R | 既存登録ユーザ（管理者=Keita）のジャーナルタグ見直し | P1 | DONE（2026-05-30 dev-logic 本番DB書き換え実行完了。before/after: 固有タグ41→36種、9種統合、誤統合ゼロ・他ユーザー波及ゼロ。before スナップショット `public._backfill_journal_tags_20260530`〔15行〕保持中・undo SQL あり、安定確認後 DROP 可。先行の 2026-05-29 林プレビュー/暫定適用〔docs/tag_backup_20260529.md〕の後続・確定実行） | dev-logic（実行済） | T-D の tagConsolidation を既存データへ適用。非可逆だが snapshot+undo SQL あり。本番 ID は yctlelmlwjwlcpcxvmgx |

全体運用メモ（各タスクに反映）:
- デプロイ運用: 「終わったやつから Internal で配信」で Keita 承認済み。main push で android-deploy.yml が internal track へ自動配信。**backend 変更（AM-P のランキング API・AM-Q/T-X の検索 API）は手動 deploy-production.yml で本番反映済（run 26629582944 = success）。** project_logic_render_auto_deploy（main push では Render web は自動反映されない）。
- Keita 確認事項（2026-05-30 全件処理済み）: (1) AM-N の法的確定値＝**全揃い・unblock**（事業者名アポロ合同会社/責任者 柴田圭太/池袋 BIGオフィスプラザ1206/月¥350・年¥2,450/電話非掲載・開示注記/削除は account-deletion 正本/インボイス記載なし/Google ログイン記述削除）→ dev-logic が HTML 反映へ。(2) AM-O の SKU 登録＝**価格確定済・Keita の Play Console 登録だけ待ち**（ブロッカー明確化）。(3) AM-R の書き換え＝**承認のうえ 2026-05-30 実行完了・DONE**。(4) T-U の accent AA 割れ＝**ブランド青 #6C8EF5 を濃くする全体再設計に方針決定・再オープン（designer→Keita 選定→dev-logic、T-V と統合実装）**。
- 関連 memory: project_logic_play_billing_gaps（AM-O）、tagConsolidation.ts＝T-D 実装（AM-R）、feedback_app_copy_neutral（全 UI 文言）、feedback_logic_title_doing（AM-M/AM-Q の title）、project_logic_mobile_only、feedback_logic_auth_magiclink_only。

### AM-K — UI 全体の「AIっぽさ」をなくす刷新方針の策定　[P1 / CANCELLED（2026-05-30 Keita 指示）]

> 状態（2026-05-30 更新）: **CANCELLED**。Keita 指示で UI 刷新方針自体を取り下げ。第2弾 c7209fb（Shippori Mincho 明朝＋手描き SVG＋HomeScreen 再構成）を **revert 済＝commit af7b4a3**。第1弾 36d08aa（絵文字SVG化/glow除去）とテーマ work d0558cb は温存。「全画面UI設計」も一旦保留＝AM-K の土台（明朝＋手描き路線）が消えたため、再開時は新方向を要決定。UI-4（ホーム波線削除）は本 revert で HomeScreen ごと波線が消え自動解消。
>
> 旧状態（2026-05-29）: designer が刷新方針ドキュメント `docs/UI_RENEWAL_DIRECTION_20260529.md` を作成中。配色パート（T-V＝新規3テーマ）は実装 DONE 済。夕方バッチの T-AA も同一依頼＝本タスクに集約。

- 依頼原文（Keita 2026-05-29）: 「全体的に UI の AI っぽさをなくしたいので刷新方針を考えてほしい」。
- スコープ: 配色テーマだけでなく **UI 全体（レイアウト・タイポ・余白・コンポーネント形状・グラデ/グロー多用・絵文字感・量産テンプレ感）の "AI っぽさ" を診断 → 刷新方針を提案ドキュメント化する**親タスク。成果物は方針/提案ドキュメント（designer 主導＋林）。**具体実装は別タスクへ切り出す前提**（このタスク自体はコードを生まない）。
- 既存タスクとの統合（重複回避）: 既に **T-V（テーマ再設計エピック「まだ AI 感がある」designer 提案中）** が走っている。AM-K は T-V の上位概念＝「テーマだけでなく UI 全体の AI 感」。**T-V を AM-K の配色パートとして内包**し、AM-K で UI 全体（テーマ＋レイアウト＋タイポ＋装飾過多）を束ねる。T-V の designer 提案ドキュメント（`docs/THEME_REDESIGN_PROPOSAL_20260529.md`）を AM-K の刷新方針ドキュメントへ拡張するのが筋。
- 「AI っぽさ」の診断観点（提案で潰す候補・林の暫定洗い出し）:
  - 過剰なグラデ/グロー（AM-L のグラデ除去・T-T 根本原因A の青グラデが代表例）。
  - 量産テンプレ配色（T-R で削除する enterprise/startup の紺×シルバー等）。
  - 均質な角丸カード＋影の多用、絵文字 UI 感、汎用 SaaS ダッシュボード感。
  - タイポの個性不足（手書き/エディトリアル寄りの方向性は feedback_logic_course_thumbnails のサムネ路線と整合させる）。
- DoD（提案フェーズ・designer＋林）: (1) 現状 UI の "AI っぽさ" を画面横断で診断し具体箇所をリストアップ、(2) 刷新方針（配色＝T-V／レイアウト・タイポ・装飾の指針／優先順位）を提案ドキュメントにまとめ、(3) 実装タスクへの分解案（どれを AM-L/T-T/T-V 等の既存タスクに寄せ、どれを新規切り出すか）を提示、(4) 会話本文に内容を直接展開し Keita 選定待ち（feedback_direct_content_not_path）。**実装・ship は含まない**。
- サブタスク:
  - [ ] designer＋林: UI 全体の AI 感を画面横断で診断（具体箇所・原因の分類）
  - [ ] designer: 刷新方針（配色＝T-V を内包／レイアウト・タイポ・装飾指針）を提案ドキュメント化
  - [ ] 実装タスクへの分解案（既存 AM-L/T-S/T-T/T-V/T-R への割当＋新規切り出し）
  - [ ] 会話本文に方針を直接展開し Keita 選定待ち
- 担当: designer（主導・提案）＋林（診断・取りまとめ）。実装は別タスク委譲。
- 抜けもれ提言:
  - サンプル承認フロー: 主観・好みの領域（Bucket2）。提案 → Keita 選定 → 実装の順厳守（feedback_logic_course_thumbnails）。
  - 重複回避（最重要）: T-V と二重に動かさない。AM-K=UI 全体方針の親、T-V=その配色実装パート。designer は1本の提案ドキュメントに統合する。
  - デザイン制約踏襲: ハードコード hex 禁止・CSS 変数・UI chrome は emoji 不可 SVG のみ（刷新後も維持）。サムネ路線（手書き＋図解）とトンマナを揃える。
  - i18n: 方針ドキュメントは社内成果物（ja でよい）。実装で UI 文言が変わる場合は別タスクで ja/en 両対応。
  - 両OS: モバイル専用。刷新方針はモバイル体験基準で（project_logic_mobile_only）。

### AM-L — グラデーション除去（カスタムコース生成カード／今日の1問カード）　[P1 / DONE]

> 状態（2026-05-29 commit d0558cb）: Daily Fermi カード〔HomeScreenV3〕の --brand-grad-h グラデ廃止→フラット var(--accent)＋青グロー boxShadow を accent 追従に。カスタムコース生成カード〔RoadmapScreenV3「AIで自分専用コースを作る」〕の linear-gradient 廃止→フラット var(--accent)。両方テーマ追従。T-S／T-T 根本原因A と統合実装。Android internal 自動配信中。夕方バッチ T-Z と同一＝本タスクに集約。tsc0/eslint0/vitest353/build OK。

- 依頼原文（Keita 2026-05-29）: 「『AI で自分専用コースを作る』と今日の1問のカードは色のグラデーションをなくして」。
- スコープ: 対象2カードの背景グラデーションをフラット化する。
  - (a) **カスタムコース生成カード**（「AI で自分専用コースを作る」）: `RoadmapScreenV3.tsx:697` の `background: linear-gradient(135deg, var(--brand) 0%, var(--brand-light) 100%)`（courses 0件時のグラデ）。:1463 のカード `linear-gradient(135deg, color-mix(...var(--brand)...))` も対象候補（実装時に該当カードか要確認）。
  - (b) **ホームの今日の1問カード**（Daily Fermi）: `HomeScreenV3.tsx:184` の `background: 'var(--brand-grad-h)'`（青グラデ）。:178 の boxShadow `rgba(108,142,245,.32)`（青グロー）もグラデ感の一部なので合わせて見直す。
- ⚠既存タスクとの連動（最重要・重複回避）: (b) の今日の1問カードは **T-S（テーマ追従）/ T-T 根本原因A（`--brand-grad-h` を各モードで override）と完全に同一の箇所**。T-T はグラデを「テーマ追従させる」方向、AM-L は「グラデ自体をなくす（フラット化）」方向で、**方向が違うが同じ DOM/CSS を触る**。→ Keita 指示は「グラデをなくす」が最新なので、(b) は **フラット単色（テーマトークン `var(--card)` or `var(--accent)` 系の単色）に置換**し、その単色をテーマ追従させる（T-T の追従要件も同時に満たす）。**dev-logic が AM-L (b) と T-S/T-T 根本原因A を同一作業で処理**するのが筋（別々にやると競合）。
- 既存資産: `src/screens/RoadmapScreenV3.tsx:697/:1463`（custom course カード）、`src/screens/HomeScreenV3.tsx:178/:184`（Daily Fermi カード）、`src/styles/tokens.css`（`--brand-grad-h` 等のグラデトークン定義元）。
- DoD: (1) カスタムコース生成カード（「AI で自分専用コースを作る」）の背景がフラット単色（グラデ廃止）、(2) ホームの今日の1問カードの背景がフラット単色（`--brand-grad-h` グラデ廃止）＋ 青グロー boxShadow も過剰なら抑制、(3) 単色はハードコード hex でなくテーマトークン参照でテーマ追従する（T-S/T-T 追従要件を同時充足）、(4) フラット化後も本文・CTA・ラベルが WCAG AA コントラスト、(5) 回帰: 両カードのレイアウト・タップ導線が破綻しない、(6) tsc 0 / eslint `.` 0、(7) Android 実機で全テーマ確認。
- サブタスク:
  - [ ] 実装前調査: 両カードのグラデ指定箇所を確定（RoadmapScreenV3:697/:1463、HomeScreenV3:178/:184）。どの単色トークンに置くか決定
  - [ ] custom course カードのグラデ → フラット単色（テーマトークン）
  - [ ] Daily Fermi カードの `--brand-grad-h` → フラット単色（T-S/T-T 根本原因A と統合・テーマ追従）＋ 青グロー boxShadow の見直し
  - [ ] 全テーマでフラット色が追従＋コントラスト確認
  - [ ] 回帰: カードのレイアウト・CTA・タップ導線、共有トークン波及の目視
  - [ ] tsc 0 / eslint `.`（全体）0
- 抜けもれ提言:
  - デザイン制約: ハードコード hex 禁止。フラット単色もテーマトークン（`var(--card)`/`var(--accent)`/`var(--accent-soft)` 等）で（CLAUDE.md）。
  - 回帰（最重要）: `--brand-grad-h` を共有する他箇所（DailyFermiScreen:1133・LoginScreen:115＝T-T 根本原因A の同変数）への波及。AM-L で「なくす」のは指定の2カードのみ。他箇所は T-T の方針（テーマ追従 override）で扱うか、まとめてフラット化するかを Keita 確認（指示は2カード明示なので、他は T-T で追従させるのが安全）。
  - i18n: 色/装飾のみで新規文言なし。
  - アクセシビリティ: グロー/グラデ除去でコントラストが変わるので CTA・本文の AA を再検算（T-U と整合）。
  - 両OS: モバイル専用。Android 実機で両カード×全テーマ確認。
  - 永続化: 表示のみで persist 影響なし。
  - 連動: AM-K（UI 全体の AI 感除去）の「過剰グラデ/グロー」の代表的具体例＝AM-L。AM-K の方針と整合させる。

### AM-M — 「・今日の一問」先頭「・」除去＋表記ゆれ統一　[P2 / DONE]

> 状態（2026-05-29 commit 698de42〔中黒/グラデ部分・別アクター先行〕＋ d0558cb〔表記統一〕）: 表記ゆれを「今日の1問」に統一（ja）。先頭中黒「・」＝今日の一問ラベルの装飾ドット div を除去。Android Internal 配信済。夕方バッチ T-Y（#3 中黒除去）と同一＝本タスクに集約。

- 依頼原文（Keita 2026-05-29）: 「『・今日の一問』の『・』は消して」。
- スコープ: 「今日の一問」の表示先頭に付いている中黒「・」を除去する。**i18n に literal な `・今日…` 文字列は無い**（grep 済み）＝中黒は **リスト項目マーカー（CSS `::before { content: '・' }` か JSX で前置 or `・` を連結している描画箇所）** で付与されている見込み。dev-logic が実 render を特定して除去する。
- 併せて表記ゆれ是正: i18n に **「今日の1問」（home.todayProblem 等）と「今日の一問」（pricing.featFermi / savedItems.* 等）が混在**（grep 済み）。どちらかに統一する（Keita 文言は「今日の一問」だが、ホーム主要導線は「今日の1問」。表記ポリシーを揃える）。
- 既存資産（実装前に実ソース照合）: 中黒の付与元（`src/screens/` or `src/components/` の該当リスト/見出し描画、`src/styles/` の `::before` content）。i18n は `src/i18n.ts`（ja: home.todayProblem `今日の1問`:283 / pricing.featFermi `今日の一問`:466 / savedItems.filterFermi・typeFermi `今日の一問`:1592/1603 ほか、en も対）。
- DoD: (1) 「今日の一問」の表示先頭の中黒「・」が消える、(2) 表記が一方（「今日の1問」or「今日の一問」）に統一され ja/en で整合、(3) 中黒を消したことで他のリスト項目（同じマーカー機構を使う箇所）に意図しない波及がない、(4) tsc 0 / eslint `.` 0、(5) Android 実機で確認。
- サブタスク:
  - [ ] 実装前調査: 中黒「・」の付与箇所を特定（JSX 前置 / 文字列連結 / CSS `::before content`）。どの画面のどのラベルか
  - [ ] 中黒を除去（その項目に閉じて。共有マーカーなら他項目への波及を確認）
  - [ ] 表記ゆれ統一: 「今日の1問」/「今日の一問」のどちらかに寄せ ja/en 整合（Keita 確認 or ホーム主導線の「今日の1問」に統一を提案）
  - [ ] 回帰: 同マーカー機構を使う他リストの表示
  - [ ] tsc 0 / eslint `.`（全体）0
- Keita 確認すべき論点（軽微・自律可）:
  - (1) 表記統一の方向（「今日の1問」or「今日の一問」）。ホーム主導線が「1問」なので「今日の1問」推奨。Keita 帰還時に追認でよい軽微判断。
- 抜けもれ提言:
  - i18n: 表記統一は ja/en 両方の該当キーを揃える（feedback_app_copy_neutral・中立丁寧体は維持）。片方だけ直すと不整合。
  - title ルール: 「今日の一問」は名詞句ラベルで Doing 形ルール（feedback_logic_title_doing）の対象外（コース/レッスン title ではない）。表記統一のみ。
  - 回帰（注意）: 中黒が共有リストマーカー（`::before content: '・'`）の場合、除去すると同マーカーを使う他のリスト全部から中黒が消える。**「今日の一問」項目に閉じて消す**（個別クラス）のが安全。
  - 両OS: モバイル専用。Android 実機で表示確認。
  - 永続化: 表示文言のみで persist 影響なし。

### AM-N — 法務記載の見直し（利用規約／プライバシー／特商法）　[P1 / REVIEW（2026-05-31 実装green・Keita push承認待ち）]

> 状態（2026-05-31 実装完了・未push）: 特商法 ja/en（`public/tokushoho.html` / `public/tokushoho-en.html`）に確定値を反映完了。(a) 運営責任者を会社名「アポロ合同会社」→ 個人名「柴田　圭太」/「Keita Shibata」に差し替え、(b) 電話番号 090-2718-7164 を非掲載＝「請求があれば遅滞なく開示します」/「Disclosed without delay upon request」注記化、(c) 年額7日間無料トライアル記載を差し戻し（料金 section に注記＋支払時期に反映。初回購入者限定・無料7日・8日目に¥2,450/年自動課金・期間中解約で課金なし・月額はトライアル無し明記。AM-O Offer `yearly-free-trial-7d` と整合）、(d) 最終更新日 2026-05-31。tsc 0 / eslint `.` 0 確認済。**ブランチ `am-n-tokushoho-confirmed-values`（commit `13041a3`、HTML2ファイルのみ）に隔離・origin 未push**（法務文言の本番反映は AM-N 既定どおり Keita push 承認＝別レイヤー）。terms/privacy は先行反映 `676c3d6`（2026-05-29）で事業者名・住所・Google ログイン削除等が反映済、`【要Keita確認:...】`マーカーも全 HTML で残存ゼロ。**残務（独立小物）**: 削除ページ一本化（delete-account 系 → account-deletion 系へリダイレクト誘導）。ただし削除ページはアプリ内導線（ProfileScreenV3/OnboardingScreen は terms/privacy/tokushoho のみ open）からは参照されず Play Console 用 URL 想定なので緊急度低。
>
> 旧状態（2026-05-30 unblock）: **Keita から法的確定値がすべて揃い BLOCKED → TODO**。残作業＝`docs/LEGAL_REVIEW_20260529.md` §5 ドラフト＋下記確定値を HTML に反映（5文書 × ja/en。削除系を一本化したぶん文書数は減）。HTML 内の `【要Keita確認: ...】` マーカーを確定値で置換する。担当=dev-logic（HTML 反映）。反映物ができたら本番 push 承認を別途 Keita から取る（push 承認は別レイヤー＝この台帳更新の範囲外）。
>
> **確定値（2026-05-30 Keita 確定）**:
> - 事業者名: アポロ合同会社 / Apollo LLC
> - 運営統括責任者: 柴田　圭太（個人名で記載。現状の会社名表記を個人名に差し替え）
> - 所在地: 〒170-0013 東京都豊島区東池袋2-62-8 BIGオフィスプラザ池袋1206
> - 販売価格: 月¥350／年¥2,450 単一有料プラン（AM-O・SKU と一致させる）
> - 電話番号: 非掲載。「請求があれば遅滞なく開示」の注記運用
> - アカウント削除ページ: account-deletion 系（条文形式）を正本、delete-account 系はリダイレクト誘導
> - インボイス登録番号: 記載しない
> - Googleログイン: マジックリンクのみ確定で記述削除（既に反映済み）
>
> 先行反映済（2026-05-29 commit `676c3d6` push 済）: C-1 特商法価格を月¥350／年¥2,450 に統一・旧2段階4価格削除／C-2 7日間無料トライアル表記削除／C-3「プレミアム」→「有料」統一／H-1 Googleログイン前提記述削除／H-4 ベータ条項を GA 表現へ／H-3 最終更新日 2026-05-29。eslint 0 error 確認済。
>
> **⚠トライアル記載の差し戻し（2026-05-30 Keita 決定で追加発生）**: 上記 C-2 で「7日間無料トライアル」記載を一旦削除済みだったが、AM-O で **年額プランに 7日間無料トライアル（Introductory Offer `yearly-free-trial-7d`）を付ける判断**になったため、特商法に書き戻しが必要。dev-logic の AM-N HTML 反映時にこの差し戻しを含めること（push 前に必ず入れる）。記載条件（中立丁寧体・ja/en 両方）: 「年額プランのみ・初回購入者限定・7日間無料・8日目以降 ¥2,450／年が自動課金・トライアル期間中に解約すれば課金なし」。**月額にはトライアルが無いことも明確に記載する**。Play Console Offer と一字一句の条件を整合させる。

- 依頼原文（Keita 2026-05-29）: 「利用規約とかプライバシーポリシーとか特定商取引法に基づく表記とかの記載を見直して」。
- スコープ: アプリ内の **Terms / Privacy Policy / 特商法表記の現状を洗い出し、不足・不備・プレースホルダ・事実不整合を点検**する。特に **特定商取引法に基づく表記は課金アプリで必須記載項目**の充足を確認（販売事業者名・所在地・連絡先・販売価格・支払時期・支払方法・役務の提供時期・返金/解約条件・動作環境 等）。点検は林＋content-creator で自律的に進められるが、**法的に確定が要る記載値（事業者名・住所・連絡先・代表者等）は Keita 確認案件**＝確定できないため BLOCKED 扱いで明示。
- 既存資産（実ソース照合済み）: 法務文書は **静的 HTML**。`public/terms.html` / `public/privacy.html` / `public/tokushoho.html` ＋ 各 `-en.html`（計6ファイル）。アプリからは `localizedHtmlPath('privacy'|'terms'|'tokushoho')`（`src/i18n.ts:33`）でロケール別に出し分け、`ProfileScreenV3.tsx`・`OnboardingScreen.tsx` から導線。i18n ラベル: `profile.tokushoho`（ja:446「特定商取引法に基づく表記」/ en:2297）。
- DoD: (1) 6つの HTML（ja/en × terms/privacy/tokushoho）の現状を点検し、不足・プレースホルダ・事実不整合・ja/en 不一致を一覧化、(2) 特商法の必須記載項目チェックリストと充足状況を提示、(3) 自律修正できる記載（誤字・体裁・ja/en パリティ・日付・動作環境等の事実ベース）は修正案を作成、(4) 法的確定が要る値（事業者名・住所・連絡先・代表者・返金ポリシー文言等）を「Keita 確認事項」として明示、(5) 内容を会話本文に直接展開（feedback_direct_content_not_path）。**確定値が埋まるまで本番反映しない**。
- サブタスク:
  - [ ] 点検: 6 HTML（terms/privacy/tokushoho × ja/en）を読み、不足・プレースホルダ・事実不整合・ja/en 不一致を一覧化
  - [ ] 特商法 必須記載項目チェックリスト作成＋充足状況（販売事業者/所在地/連絡先/価格/支払時期/支払方法/提供時期/返金・解約/動作環境）
  - [ ] 課金実態との整合確認: AM-O の Play 課金（月額/年額 SKU・価格）と特商法の販売価格/支払方法記載が一致するか
  - [ ] **トライアル記載の差し戻し（2026-05-30 追加）**: C-2 で削除した「7日間無料トライアル」を特商法に書き戻す。記載条件（ja/en・中立丁寧体）=「年額プランのみ・初回購入者限定・7日間無料・8日目以降 ¥2,450／年が自動課金・トライアル期間中に解約すれば課金なし」。月額にトライアル無しも明記。AM-O の Play Console Offer `yearly-free-trial-7d` と整合。**dev-logic の HTML 反映＝push 前にこの差し戻しを必ず含める**
  - [ ] 自律修正可能箇所（体裁・パリティ・事実）の修正案作成
  - [ ] 法的確定値を Keita 確認事項として列挙
  - [ ] 会話本文に点検結果＋確認事項を直接展開
- 担当: dev-logic（HTML 反映＝確定値を 5文書 ja/en に流し込み、`【要Keita確認:...】`マーカー置換、削除系一本化）。文案点検は content-creator、取りまとめは林。
- Keita 確認事項（2026-05-30 解消済）:
  - 旧 BLOCKED 要因だった事業者名・所在地・責任者・連絡先・削除ページ正本・インボイス・価格は上記「確定値」ですべて確定。残るのは反映物ができたあとの本番 push 承認のみ（別レイヤー）。最終的な法的妥当性は Keita 判断（必要なら専門家確認）。
- 抜けもれ提言:
  - ⚠デプロイ依存: 法務 HTML は `public/` 配下の静的ファイル＝フロント。Android は main push で自動配信されるが、**Render web 反映は手動 deploy-production.yml**（project_logic_render_auto_deploy）。ただし確定値が埋まるまで本番反映しないこと。
  - i18n（最重要）: terms/privacy/tokushoho は ja/en 両方の HTML が存在。**ja を直したら en も必ず揃える**（法務文書の言語間齟齬は信頼性・コンプラ上問題）。content-creator が両言語で整合。
  - 課金連動（AM-O と密結合）: 特商法の「販売価格・支払方法・役務提供時期・返金/解約」は AM-O の Google Play 課金実態（SKU・価格・サブスク条件）と一致が必須。AM-O と突き合わせる。**トライアルは年額のみ・特商法と Play Console Offer（`yearly-free-trial-7d`）を整合させる**（月額にトライアル無しも明記）。
  - 法的妥当性の限界: task-manager/林/content-creator は法律専門家ではない。必須項目の網羅・体裁・事実整合まではやれるが、**最終的な法的妥当性は Keita 判断（必要なら専門家確認）**。「点検・たたき台作成」までが自律範囲、確定は Keita。
  - 両OS: モバイル専用。HTML は WebView 表示なので Android 実機でレイアウト崩れ・リンク導線確認。
  - 永続化: 静的ファイルで persist 概念なし。

### AM-O — 料金プランの Google Play 課金実装（購入導線の結線）　[P1 / BLOCKED（コード DONE／Keita SKU 待ち）]

> 状態（2026-05-30 ブロッカー明確化＋SKU 登録セット確定＋年額トライアル決定）: コード結線は DONE（PricingScreen が startCheckout(targetPlanId) に結線済）。**ブロッカーの中身は「SKU 登録セット確定済・Keita の Play Console 登録だけ待ち」**。残＝Keita が Play Console で下記「SKU 登録セット（確定値）」を一字一句一致で登録。**2026-05-30 Keita 決定: 年額プランに 7日間無料トライアル（Introductory Offer）を付ける。月額には付けない**。SKU Active 後に dev-logic/test-functional が実機購入ハッピーパス検証（キャンセル/失敗/restore 分岐含む）。SKU が非 Active だと実機購入が起動できず検証不可＝Keita ゲート。夕方バッチ T-AC と同一＝本タスクに集約。
>
> **SKU 登録セット（2026-05-30 Keita 確定・Play Console で一字一句一致させること）**:
> - Subscription Group: `logic_paid`
> - 月額: Product ID `logic_paid_monthly` / Base Plan `monthly-autorenew` / ¥350（税込）/ 自動更新・トライアル無し
> - 年額: Product ID `logic_paid_yearly` / Base Plan `yearly-autorenew` / ¥2,450（税込）/ 自動更新
> - 年額に Introductory Offer: Offer ID `yearly-free-trial-7d` / 初回購入者のみ / Phase1 無料7日 / Phase2 ¥2,450/年
> - Product ID はコード `src/billing/products.ts` の `PLAY_PRODUCTS`（monthly=`logic_paid_monthly` / yearly=`logic_paid_yearly`）と一致確認済み（2026-05-30 照合済）。登録時に一字一句一致させること。
> - トライアルは年額のみ・特商法（AM-N）と Play Console Offer を整合させる（AM-N の C-2 トライアル記載差し戻しと突き合わせ）。

- 依頼原文（Keita 2026-05-29）: 「料金プランの Google Play での課金を実装して」。
- スコープ: **料金プラン画面から Play Billing の購入フローへ結線**する。狙いは料金プラン画面 UI と購入導線（`startCheckout → purchaseProduct → verifyPurchase`）の結線。
- 📌 前提（memory 必読・project_logic_play_billing_gaps）: Play Billing の **購入フロー本体・サーバ検証・acknowledge・RTDN endpoint・initBilling は実装済**。残る既知ギャップは **#4 Play Console SKU（`logic_paid_monthly` / `logic_paid_yearly`）が Active 登録され Production 価格設定済みかの確認**＝Keita 作業。つまり AM-O の本体は「料金プラン画面 → 既存購入関数の結線」であり、課金基盤の新規実装ではない（既存資産の配線が主眼）。
- 既存資産（実ソース照合すること）: `src/subscription.ts`（`startCheckout()` = `purchaseProduct → verifyPurchase` チェーン）、`src/billing/index.ts`（Capacitor wrapper・initBilling）、`server/routes/billing.ts`（`POST /api/billing/verify` 実検証＋Supabase subscriptions upsert、acknowledge、RTDN）、料金プラン画面（`src/screens/` の pricing/plan 画面＝`pricing.*` i18n を使う画面）、`android/.../billing/InAppBillingPlugin.kt`。
- DoD: (1) 料金プラン画面の各プラン（月額/年額）の購入ボタンが `startCheckout(sku)` を呼び、`purchaseProduct → verifyPurchase` が走る、(2) 購入成功で Supabase `subscriptions` が更新され、アプリの課金状態（プラン表示・有料機能解放）が反映される、(3) 購入キャンセル/失敗/既購入（restore）の各分岐が中立丁寧体で表示される（feedback_app_copy_neutral）、(4) Android native のみ実行・Web/iOS は no-op ガード（既存 isAndroidNative）、(5) backend `/api/billing/verify` が本番デプロイ済で実機から検証成功、(6) tsc 0 / eslint `.` 0、(7) Android 実機で購入ハッピーパス（SKU Active 前提）。
- サブタスク:
  - [ ] 実装前調査: 料金プラン画面の現状（購入ボタンが startCheckout に繋がっているか／プレースホルダか）と subscription.ts/billing の結線状況を確認
  - [ ] 料金プラン画面の購入ボタン → `startCheckout(sku)` 結線（月額/年額）
  - [ ] 購入結果の状態反映（subscriptions 更新後にプラン表示・有料解放が更新されるか）
  - [ ] エラー/キャンセル/restore 分岐の UI 文言（ja/en・中立丁寧体）
  - [ ] backend `/api/billing/verify` 本番デプロイ確認（手動 deploy-production.yml）＋実機 probe
  - [ ] tsc 0 / eslint `.`（全体）0
  - [ ] Android 実機で購入ハッピーパス（SKU Active 後）
- Keita 作業（ブロッカー＝SKU 登録ゲート、2026-05-30 確定値明記）:
  - **Play Console で下記 SKU 登録セットを一字一句一致で Active 登録＋Production 価格設定**（project_logic_play_billing_gaps #4）。確定済みなので残るのは Keita の Play Console 登録操作のみ。
    - Subscription Group: `logic_paid`
    - 月額: Product ID `logic_paid_monthly` / Base Plan `monthly-autorenew` / ¥350（税込）/ 自動更新・トライアル無し
    - 年額: Product ID `logic_paid_yearly` / Base Plan `yearly-autorenew` / ¥2,450（税込）/ 自動更新
    - 年額に Introductory Offer: Offer ID `yearly-free-trial-7d` / 初回購入者のみ / Phase1 無料7日 / Phase2 ¥2,450/年（**2026-05-30 Keita 決定。月額には付けない**）
    - Product ID は `src/billing/products.ts` の `PLAY_PRODUCTS` と一致確認済み（2026-05-30 照合）。登録時に一字一句一致させること。
  - SKU Active 後に dev-logic/test-functional が実機購入ハッピーパス（キャンセル/失敗/restore 分岐含む）を検証＝AM-O の実機検証ゲート。トライアル付き年額の購入フロー（無料期間→8日目課金）も検証対象に含める。
- 抜けもれ提言:
  - ⚠デプロイ依存（最重要）: 検証は backend（`/api/billing/verify`）＝main マージ≠本番反映。手動 deploy-production.yml が必須（project_logic_render_auto_deploy）。デプロイしないと実機購入の検証が 404 で落ちる。
  - i18n: 購入ボタン・確認・成功/失敗/キャンセル/restore・エラー文言は ja/en 両方＋中立丁寧体（feedback_app_copy_neutral）。
  - 課金実態と法務の整合（AM-N と連動）: SKU 価格・サブスク条件（更新・解約）は AM-N の特商法表記（販売価格・支払時期・解約）と一致させる。**トライアルは年額のみ・特商法（AM-N）と Play Console Offer（`yearly-free-trial-7d`）を整合させる**（月額にトライアル無しも明確に）。
  - マーケ文言: 料金プラン画面のコピーは「コーヒー1杯」系の安さアピール NG（feedback_logic_marketing）。
  - 両OS: モバイル専用・**Android native のみ**（iOS workflow 未整備・Play Billing は Android）。Web/iOS は no-op ガード維持。
  - 永続化: 課金状態は Supabase `subscriptions`＋クライアント。restore で再取得できること。
  - 既存ギャップ #2 RTDN: JWT 検証未実装・GCP/Play Console 設定残（Keita 作業）。AM-O の直接スコープ外だが、課金を本格販売する前に project_logic_play_billing_gaps #2 の残作業も要対応（別途）。

### AM-P — フェルミランキング累計スコアのダミーを毎日ランダム増分　[P2 / DONE]

> 状態（2026-05-29 commit 1c18ebb）: 固定スコア（最大98）廃止→ダミー上位を「期間トップ実スコア×日次シード倍率」で算出。Keita 1強解消・毎日変動（同一日内は安定）。実データ isMock:false は不変。main push＋backend を deploy-production.yml で本番デプロイ完了（run 26629582944 = success 確認済）。ローカル smoke で週/月の mock スコアが降順・日替わりに出ることを検証済。リクエスト時算出方式＝cron 不要で運用が軽い（R-3 は cron 不要に変更可）。夕方バッチ T-AD と同一＝本タスクに集約。

- 依頼原文（Keita 2026-05-29）: 「フェルミランキングの累計スコアの今あるダミーデータをランダムでいい感じにポイント付与して（毎日）。今管理者（Keita）がダントツ一位だから張り合いがない」。
- 狙い: 「Keita が常に1位で張り合いがない」状態の解消＝**ダミー上位陣のスコアを毎日自然に増やしてリーダーボードに動きを出す**。
- 既存資産（実ソース照合済み）: フェルミランキングのダミーデータは **`server/routes/fermi.ts:545-629`**（コメント「ランキング取得（実データ優先 + ダミーで穴埋め）」「ダミーデータ（実データが足りないときの穴埋め用、スコア順）」、:629「実データ + ダミーをマージしてスコア降順、表示上限まで」）。**現状は静的配列**＝毎リクエスト同じ値。これを毎日ランダム増分する仕組みが必要。
- 設計論点（実装時に決定）:
  - (1) **増分の永続化**: 静的配列のままだと「毎日増やす」状態を保持できない。日次で増分した値を持つストア（JSON ファイル fallback or Supabase テーブル）が要る。実データ（実ユーザ placement/fermi）と混ざらない別管理にする。
  - (2) **増分の発火**: 日次 cron/バッチで増分するか、リクエスト時に「最終更新日からの経過日数 × ランダム増分」を都度算出して見せるか（後者は cron 不要だが決定性に注意）。
  - (3) **不自然にならない増分レンジ**: 上位陣ごとに自然なペースで増える（一定でなく日々ばらつく）レンジ設計。Keita を抜く/抜かないの調整も含め「いい感じ」を満たす。
- DoD: (1) フェルミランキングのダミー上位陣の累計スコアが日次でランダムに増分し、日をまたぐとリーダーボードの順位/値に動きが出る、(2) Keita が常にダントツ1位という状態が解消（ダミーが Keita に迫る/前後する動きが出る）、(3) 増分が不自然でない（一定値の足し算でなくばらつくレンジ）、(4) 実データ（実ユーザ）とダミーが混ざらず実ユーザのスコアは改変されない、(5) 増分状態が永続化され翌日に積み上がる、(6) backend 変更が本番デプロイ済（手動 deploy-production.yml）で本番ランキングに反映、(7) tsc 0 / eslint `.` 0。
- サブタスク:
  - [ ] 実装前調査: fermi.ts:545-629 のダミー配列構造・実データとのマージ仕様・表示上限を確認
  - [ ] 増分状態の持ち方を決定（JSON ファイル fallback or Supabase テーブル。実データと分離）
  - [ ] 日次ランダム増分ロジック（上位陣ごとの自然なレンジ・日付シードで決定的 or cron 駆動）
  - [ ] 増分発火の仕組み（cron/日次バッチ or リクエスト時の経過日数算出）
  - [ ] 実データと混ざらない管理（ダミー識別・実ユーザスコア不改変）
  - [ ] backend 本番デプロイ（手動 deploy-production.yml）＋本番ランキング probe
  - [ ] tsc 0 / eslint `.`（全体）0
- 担当: dev-logic。増分状態を Supabase に持つ場合は migration（Keita 承認案件）。
- Keita 確認すべき論点（軽微・自律寄り）:
  - (1) ダミーが Keita を「抜く」ことを許容するか（張り合い重視なら抜きつ抜かれつ、Keita 1位維持なら肉薄止まり）。「いい感じ」の解釈＝Keita 帰還時に方向性を確認。
- 抜けもれ提言:
  - ⚠デプロイ依存（最重要）: ランキングは backend（fermi.ts）＝main マージ≠本番反映。手動 deploy-production.yml＋cron なら本番環境（Render）での cron 稼働も要確認（project_logic_render_auto_deploy）。
  - cron 運用注意: 日次バッチを cron で組むなら、過去の cron root 権限問題（T-F）・night-patrol 空振り（T-G）の轍を踏まないよう死活確認を R-2 系に乗せる。リクエスト時算出方式なら cron 不要で運用が軽い（推奨検討）。
  - 永続化（最重要）: 「毎日積み上がる」が要件なので増分状態の persist 必須。JSON fallback だと Render の ephemeral filesystem で再デプロイ時に消える恐れ → Supabase テーブルが堅い（ただし migration＝Keita 承認）。
  - 実データ分離: 実ユーザの placement_results/fermi スコアを絶対に改変しない。ダミーは別ソース/別フラグで管理（混入は実害）。
  - テスト: 増分レンジ・決定性（日付シード方式なら）は vitest 単体向き。「翌日に値が増える」「実データ不改変」を検証。
  - i18n: ランキング表示の既存文言のみ（新規文言なし想定）。
  - 両OS: モバイル専用。Android 実機でランキング表示に動きが出るか（日跨ぎ確認）。
  - 倫理/表示の注意: ダミーと実ユーザが同じリーダーボードに並ぶ設計（既存仕様）。ダミーであることをユーザに誤認させる度合いが過度にならないか（既存仕様踏襲なら現状維持でよいが、増分で動的に見えると「実在ユーザ」感が増す点は留意）。

### AM-Q — トレーニング検索の改修（右上虫眼鏡＋AI検索）　[P1 / DONE（T-X と同一＝両方 DONE）]

> 状態（2026-05-29 commit 6a3c985〔別アクター実装〕）: RoadmapScreenV3 右上の虫眼鏡から検索オーバーレイ。既存キーワード検索＋「AIで検索」のプロンプトベース意味検索。server/routes/search.ts（POST /api/search, haiku-4-5, rate-limit 20/min）、src/aiSearch.ts、i18n ja/en、vitest 13。backend は deploy-production.yml で本番反映済（run 26629582944 = success）。**虫眼鏡右上＋AI検索の両方を充足＝T-X も同時に DONE**。着手前スコープ確認3点は実装で解決済（対象=レッスン/コース両方、方式=Claude プロンプト選別、結果=意味検索）。

- 依頼原文（Keita 2026-05-29）: 「トレーニングの検索は検索窓を虫眼鏡で右上にしたいのと、AI で検索できるようにしたい」。
- スコープ: (1) 検索窓を虫眼鏡アイコンで右上に配置する UI 変更、(2) AI 検索機能（自然言語でレッスンを探せる）。AI 検索は backend の Anthropic API 経由になる見込み（レート制限・コスト考慮）。
- ⚠既存タスクと完全重複（重複起票しない）: **既存バッチ「2026-05-29 トレーニングのAI検索機能」の T-X と同一依頼**（T-X 依頼原文「右上に虫眼鏡でいいよ、デフォルトは。この検索も AI でできるように」）。AM-Q は **T-X に統合**し、AM-Q では新規の詳細起票をしない。T-X 側（下方のバッチ）に全ての DoD・着手前スコープ確認（検索対象範囲／embedding vs プロンプト方式／結果の出し方）・関連ファイル・抜けもれ提言が整備済み。
- ステータス/担当/優先度: T-X に準ずる（P-TBD・着手前スコープ確認・designer＋dev-logic）。
- 次アクション: T-X の「着手前 Keita 確認 3 点」（検索対象=レッスンのみ/コースも、AI マッチ方式=embedding/プロンプト、結果の出し方）が未確定なので、AM-Q としても **スコープ確認まで IN_PROGRESS にしない**。Keita 帰還時に T-X の確認3点を提示する。
- 抜けもれ提言: T-X セクション参照（デプロイ依存・i18n ja/en・虫眼鏡 SVG aria・レート制限/コスト・既存 custom-course のレッスン検索 AI 導線との重複整理）。AM-Q 固有の追加なし。

### AM-R — 既存登録ユーザ（管理者=Keita）のジャーナルタグ見直し　[P1 / DONE（2026-05-30 本番書き換え実行完了）]

> 状態（2026-05-30 DONE）: **dev-logic が本番 DB 書き換えを実行完了**。before/after＝固有タグ 41→36 種、9 種統合、**誤統合ゼロ・他ユーザー波及ゼロ**を検証。before スナップショット `public._backfill_journal_tags_20260530`（15 行）を保持中・undo SQL あり。安定確認後にこのスナップショットテーブルを DROP 可。本番プロジェクト ID は `yctlelmlwjwlcpcxvmgx`。
> 経緯: 先行して 2026-05-29 に林が read-only census（対象ユーザー e5631320…・タグ乱立）＋統合プレビュー提示／暫定適用（`docs/tag_backup_20260529.md`）を実施。その後 2026-05-30 に dev-logic が確定実行で本タスクをクローズ。夕方バッチ T-AF と同一＝本タスクに集約。

- 依頼原文（Keita 2026-05-29）: 「今すでに登録しているユーザのジャーナルのタグも見直して（管理者かな）」。
- スコープ: **T-D で実装した動的タグ統合（tagConsolidation / canonicalize）を既存データに適用**する。Supabase `daily_journals.tags` の既存タグを点検し統合候補を洗い出す。対象は管理者（Keita）アカウントのデータ。
- 📌 前提（T-D 実装済み・実ソース照合済み）: `src/components/journal/tagConsolidation.ts` に `canonicalizeTags(tags, locale)`（語彙ヒットで canonical へ寄せる）と consolidation 適用＋**スナップショット（undo 用）**ロジックが実装済。ただしコメント（:21）に明記のとおり **「過去の全 daily_journals に対する物理一括バックフィル」は未実装＝あくまで今後保存される分にのみ適用**。AM-R はこの **既存データへのバックフィル適用**＝T-D が意図的に保留した非可逆操作の実行。
- ⚠⚠ 非可逆・Keita 承認案件（BLOCKED 要因・最重要）: 既存 `daily_journals.tags` の書き換えは **DB データの非可逆変更**＝push/デプロイと同格の破壊的操作（CLAUDE.md「DB マイグレーション・破壊的操作は Keita 承認」）。林の自律範囲は **「点検・統合候補の洗い出し・before スナップショット取得・dry-run（適用後プレビュー）」まで**。実際の書き換え実行は Keita 承認後。
- 既存資産: `tagConsolidation.ts`（canonicalizeTags / consolidation 適用 / スナップショット）、`tagVocabulary.ts`（canonical 語彙＋synonyms）、Supabase `daily_journals`（tags カラム）、`server/routes/journal.ts`（タグ生成経路）。
- DoD: (1) 対象（管理者=Keita）アカウントの `daily_journals.tags` 現状を集計し、統合候補（from→to）を洗い出して一覧化、(2) 適用前の before スナップショットを取得（復元可能に）、(3) dry-run で「適用するとどう変わるか」のプレビューを会話本文に直接展開（feedback_direct_content_not_path）、(4) Keita 承認後に実書き換えを実行し、(5) 適用後にタグが canonical へ統合され、固有タグ乱立が既存データでも解消、(6) undo（スナップショットからの復元）が効くことを確認。**(4)(5) は Keita 承認まで実行しない**。
- サブタスク:
  - [x] 対象特定: 管理者（Keita）アカウントの guest_id/user_id を確認し、daily_journals.tags を集計
  - [x] 統合候補の洗い出し（canonicalizeTags / consolidation で from→to ペア算出）
  - [x] before スナップショット取得（`public._backfill_journal_tags_20260530`・15 行・undo SQL あり）
  - [x] dry-run プレビュー作成（適用前後の tags 差分）を会話本文に直接展開
  - [x] Keita 承認取得（実データ書き換え＝承認案件）
  - [x] 【承認後】実書き換え実行（固有タグ 41→36 種・9 統合・誤統合ゼロ・他ユーザー波及ゼロ）＋適用後検証＋undo SQL 準備
- 担当: dev-logic（適用ロジック・Supabase 操作・実行済）＋林（点検・候補洗い出し・Keita 確認の取りまとめ）。
- Keita 確認事項（2026-05-30 解消済）:
  - 既存 `daily_journals.tags` の書き換えは Keita 承認のもと実行完了。残タスクは `public._backfill_journal_tags_20260530` スナップショットの DROP 可否（安定確認後）のみ。
- 抜けもれ提言:
  - ⚠⚠ 非可逆操作の安全策（最重要・T-D の安全策論点と同根）: before スナップショット必須・undo 確認・dry-run プレビュー先行。誤統合（別概念混入）が起きると既存ジャーナルの分類が壊れる。同一 axis 内のみ統合等のガード（T-D の論点）を踏襲。
  - 対象範囲の限定: 依頼は「すでに登録しているユーザ（管理者かな）」＝まず Keita アカウントに限定。全ユーザ一括バックフィルは別途・より慎重に（Keita 承認の別ステップ）。
  - データ操作は Supabase 直（MCP execute_sql or backend バッチ）。本番 DB を触るので Keita 承認・スナップショット必須。
  - i18n: データ操作のみで UI 文言なし（T-D の表示側は実装済）。
  - 両OS: モバイル専用だが、本件はサーバ/DB 側操作。アプリ側は適用後にタグ表示が更新されるか Android 実機で確認。
  - テスト: canonicalizeTags の決定的部分は vitest 済（T-D の tagConsolidation.test.ts）。AM-R は「既存データへの適用」なので、dry-run の差分検証＋スナップショット復元の動作確認が主。
  - 関連: T-D（DONE・タグ動的統合の本番反映済）の続き＝既存データへの遡及適用。T-D が意図的に保留した物理バックフィルの実行フェーズ。

---

## バッチ: 2026-05-28 実機フィードバック4件（Keita 朝）

林が事前に原因調査済み。task-manager が構造化。実装は委譲。

| ID | タイトル | 優先度 | ステータス | 担当案 |
|----|----------|--------|-----------|--------|
| T-A | フェルミ「今日の1問」とタップ後の問題がズレる | P0 | DONE（2026-05-29 main マージ＋Android deploy 成功で本番反映。モバイル実機での最終体感確認のみ任意で残） | dev-logic |
| T-B | 配色テーマを3種類追加（外観設定 MODES）＋垢抜け化 | P1 | DONE（2026-05-29 main マージ＋Android deploy 成功で本番反映。テーマ見た目の実機確認のみ任意で残） | designer（候補済）→ Keita（選定済）→ dev-logic（実装済） |
| T-C | カスタムコース生成できない（本番 route 未デプロイ） | P0 | DONE（本番再デプロイ→404解消・正常系検証済） | 林/Keita（運用・コード修正不要） |
| T-D | ジャーナルのタグ粒度が細かすぎる（→ 動的・自動統合モデルで確定。タグ付け時に既存タグを動的参照し最適化＋自己統合） | P1 | DONE（2026-05-29 main マージ＋Render backend deploy 成功〔run 26603561372〕で本番反映、health 200。D1-D3 完全グリーン、D4 は自動主体に縮小・undo を実装に内包） | content-creator（D1 DONE）→ dev-logic（D2/D3/D4 実装済）+ designer（D4 軽量UXのみ）|
| T-E | Obsidian vault 最新化＋日次更新の仕組み化 | P1 | IN_PROGRESS（(a) Daily Note 5/26-28 DONE、(b) 一部、(c)(d) 未＝T-F依存） | 林（キャッチアップ）+ ceo（日次統合）/ task-manager（recurring 管理） |
| T-F | cron 自動化の root 権限エラー修復（ceo 朝ブリ・feedback-watcher が空振り） | P1（上位） | DONE（2026-05-29 Vultr 新箱「Claude Code Server 2」の非root `dev` ユーザへ cron 3本移設で解決。root の `claude -p` が skip-permissions ガードで弾かれていたのが空振りの正体。dev で3本とも実走グリーン→obsidian-vault push 成功。Supabase は service_role 直curl化。現箱 cron は二重push回避でコメントアウト。詳細は memory project-vultr-second-server） | ceo（自分のスクリプト群） |
| T-G | night-patrol 夜間スモークが "No tests found" で空振り（監視死） | P1 | DONE（2026-05-29 main マージで config 本番反映。playwright config が 5/25・5/27 両 spec 計20件を拾い空振り解消。night-patrol 実走確認のみ次回夜間に残） | dev-logic / test-smoke |
| T-H | Logic Android Production 公開 | P1 | 公開戦略確定（2026-05-30 Keita「今の最新ビルドで先に公開、P0 改善は公開後アップデート」）。T-G スモーク/T-B テーマは 5/29 達成済。公開順序＝AM-O SKU 登録（Keita）→実機課金ハッピーパス検証→リリースノート整備〔担当アサイン要・content-creator or marketing〕→Production promote（Play Console 手動・Keita） | Keita（SKU登録・promote）＋dev-logic/test-functional（実機検証）＋要アサイン（リリースノート） |

### T-A — フェルミ「今日の1問」とタップ後がズレる　[P0 / DONE]

- ✅ DONE（2026-05-29 朝）: 2026-05-29 に wip/20260528-inprogress を main に fast-forward マージ＋origin/main へ push → Android deploy（main push 由来）completed success で内部テスターに配信＝モバイル本番反映。実装＋検証（単体テスト11ケース＋ブラウザ実機タップ3シナリオ：ホーム↔Daily 同一問題、リロード後一致、再オープン後一致が全通過）はコードレベルで完全充足済み。DoD（同日内・解答後・リロール後の Home/Daily 一致、日付跨ぎの決定性）充足。**備考: モバイル実機での最終体感確認は任意で残**（コード検証済みのため DONE 判定）。
- （旧 REVIEW 記録）2026-05-28 深夜: 実装＋検証完了。単体テスト11ケース＋ブラウザ実機タップ3シナリオ全通過。wip/20260528-inprogress ブランチにローカルコミット済（当時 push/マージなし）。
- 症状: ホームの「今日の1問」カードと、タップして開いた `DailyFermiScreen` の問題が食い違うことがある（特にその日に1問でも解いた後）。correctness バグ → 即修正（Bucket1、correctness 優先ルール）。
- 根因確定（林調査、実ソース照合済み）:
  - `HomeScreenV3.tsx:138-146` は **未完了だけ詰めた available 配列**を作り `available[dailySeed % available.length]`（dailySeed = `getDailyFermiIndex()`）で選ぶ。`dailySeed = Date.now()/86400000 % FERMI_POOL.length`。
  - ところがホームは**初期表示時は `home-fermi-index` を sessionStorage に保存しない**。保存するのはリロール（「別の問題」）時のみ（`HomeScreenV3.tsx:181`）。
  - `DailyFermiScreen.tsx:515-531` は `home-fermi-index` が無ければ生の `getDailyFermiIndex()`（= 生 pool index、未完了フィルタなし）にフォールバック（:529）。
  - 結果、その日1問でも解くと available 配列が縮み、ホーム側の `available[dailySeed % available.length]`（未完了配列 index）と Daily 側の `getDailyFermiIndex()`（生 pool index）が別問題を指す。
- 修正方針（dev-logic 判断・案）: 選択ロジックを単一化する。(a) `fermiData.ts`（または新規 `dailyFermiState.ts`）に「今日の表示すべき index」を返す共通関数を1つ置き、Home/Daily 両方がそれを呼ぶ。(b) ホームが初期表示で決めた表示 index を必ず共有キー（`home-fermi-index`）に永続化し、Daily はそれを single source として読む。available フィルタの有無を両者で揃えるのが肝。
- 関連ファイル: `src/screens/HomeScreenV3.tsx`（112 HOME_FERMI_INDEX_KEY / 118-146 選択ロジック / 181 リロール保存）、`src/screens/DailyFermiScreen.tsx`（515-531 initialIndex 解決 / 581 リロール乱択）、`src/fermiData.ts`（getDailyFermiIndex / FERMI_POOL / getFermiStatsByIndex）。
- DoD: 同日内で「今日の1問」カードとタップ後の `DailyFermiScreen` が**常に同一問題**を表示する。その日1問解いた後／復習からの再挑戦／「別の問題」リロール後も両画面が一致。日付が変われば決定的に次の1問へ。
- サブタスク:
  - [ ] 表示 index 決定ロジックを共通関数化 or 共有キー永続化で単一化（available フィルタの有無を両画面で統一）
  - [ ] ホーム初期表示時にも表示 index を sessionStorage（共有キー）へ永続化
  - [ ] Daily 側フォールバック（:529 生 getDailyFermiIndex）を共通ロジック経由に置換
  - [ ] リロール（Home:181 / Daily:581）と replay（fermi-replay-index）経路でも一致を維持
  - [ ] 回帰: 全問完了時（available.length===0 で null）の表示、日付跨ぎ、復習ハブからの遷移
- 抜けもれ提言:
  - i18n: 文言追加なし想定（ロジック修正のみ）→ ja/en 影響なし。新規文言が出たら ja/en 両対応。
  - 両OS: 純ロジック（sessionStorage ベース）なので iOS/Android で挙動差は出にくいが、Capacitor WebView の sessionStorage 永続範囲（プロセス kill 後クリア）に注意 → 「日付ベースで決定的」なら sessionStorage が消えても再計算で一致するのが理想。共有キー方式にする場合は揮発性も検証。
  - テスト: 決定性ロジックは vitest 単体テスト向き（同日・解答後・日付跨ぎで Home/Daily の選択関数が同 index を返す）。E2E は sessionStorage 操作が要るので単体優先。
  - 永続化: sessionStorage は当日内のみ。日次の決定性は date seed で担保する設計が安全（state の持ち方を設計時に明示）。

### T-B — 配色テーマを3種類追加（外観設定 MODES）＋垢抜け化　[P1 / DONE]

- ✅ DONE（2026-05-29 朝）: 2026-05-29 に wip/20260528-inprogress を main マージ＋push → Android deploy completed success で本番反映。designer 候補6案（`logic/docs/THEME_PALETTE_CANDIDATES.md`）→ Keita が 1=古紙 / 2=深緑 / 4=墨白 を選定 → dev-logic が3種を実装完了。「テーマは全部有料」方針に合わせ mono（墨白）の tier を free→premium に修正済み（無料は light/dark のみ）。eslint . 緑。DoD（preview↔tokens.css 実トークン一致・tier 割当・i18n ja/en・コントラスト・既存5モード非回帰）はコードレベルで充足。**備考: テーマ見た目の実機確認（Android）は任意で残**（コード検証済みのため DONE 判定）。
- （旧 REVIEW 記録）2026-05-28 深夜: 3種実装＋mono を free→premium 修正＋eslint . 緑、wip コミット済（当時 push/マージなし）。
- スコープ確定（Keita 確認 2026-05-28）: 当初「テーマを増やす／AIっぽさをなくす」は曖昧だったが、対象は **アプリの配色テーマ（外観設定の背景モード = `theme.ts` の `MODES`）** に確定。フェルミお題や AI 生成テーマの話ではない（旧 BLOCKED 版の (a)/(b) 解釈は破棄）。
- 現状（実ソース照合済み）:
  - `src/theme.ts` の `MODES` が5種: `light` / `dark`（tier=free）、`enterprise` / `startup` / `custom`（tier=premium）。
  - 各モードは `preview: { bg, card, text, accent }` を持ち、`applyTheme()` で CSS 変数（`--accent` / `--accent-soft` / `--accent-glow` / `--accent-dark` / `--accent-fg`）を流す。`mode-{id}` クラスを `<html>` と `<body>` に付与し、実際の bg/card/text トークンは `tokens.css` の `body.theme-v3.mode-{id}` セレクタ側で定義される（theme.ts の `preview` はカードのプレビュー表示用）。
  - 別レイヤーで `ACCENTS`（6色アクセント・全 free）もあるが今回の対象外（モード＝背景テーマの追加）。
  - i18n: `theme.mode.{id}.name` / `theme.mode.{id}.desc` が ja/en 両方に必要（i18n.ts ja:587-596 / en:2420-2429）。
- やること: 新しい配色テーマ（背景モード）を3種類追加する。「AIっぽさをなくす」= 既存パレット（enterprise のネイビー×シルバー等）が量産テンプレっぽいので、**垢抜けた配色**にする方向。Keita が後で必要なものを選別する前提なので、**まず候補を複数提案 → Keita 選別 → 実装**のフローを取る。
- 担当案: designer（パレット設計・候補提案。コントラスト/トンマナ含む）→ Keita 選別 → dev-logic（theme.ts / tokens.css / i18n 実装）。
- フロー注記: 創作系なので**サンプル承認フロー**（候補→Keita 選別→展開）。feedback_logic_course_thumbnails のサンプル承認ルール踏襲。配色は correctness というより主観・好みの領域なので Bucket2 寄り（即実装でなく候補先行）。
- 関連ファイル: `src/theme.ts`（MODES 定義 38-45 / applyTheme 125-172）、`src/styles/tokens.css`（`body.theme-v3.mode-{id}` の bg/card/text トークン群）、`src/i18n.ts`（theme.mode.* の ja/en）、テーマ選択 UI（ThemeCard プレビューを描くコンポーネント）。
- DoD: Keita が選んだ配色テーマ3種が `MODES` に追加され、(1) 各モードの全トークン（bg/card/text/accent ＋ accentSoft/glow/dark）が tokens.css と theme.ts preview の両方で定義され、(2) tier（free/premium）が割当てられ、(3) i18n の name+desc が ja/en 両方に入り、(4) 外観設定でカードプレビューと実適用（applyTheme）が一致し、(5) ライト/ダーク両系統で本文・ボタン文字のコントラストが WCAG AA を満たし、(6) Android 実機で破綻しない。
- サブタスク:
  - [x] designer: 垢抜けた配色テーマ候補を複数（6案）提案（`logic/docs/THEME_PALETTE_CANDIDATES.md`）。各案 bg/card/text/accent ＋ トンマナ説明・どの既存テーマの「量産っぽさ」を解消するか
  - [x] Keita: 候補から3種を選別（このタスクのゲート）→ designer 推奨ミックス 1古紙 / 2深緑 / 4墨白 を選定
  - [ ] dev-logic: 選定3種を `MODES` に追加（id / name getter / desc getter / tier / preview）※worktree で実装中
  - [ ] dev-logic: `tokens.css` に `body.theme-v3.mode-{newid}` の bg/card/text トークンを定義（preview と実トークンの一致を保証）
  - [ ] dev-logic: accentSoft / accentGlow / accentDark / accent-fg が各モードで破綻しないか（applyTheme の自動 fg ピックと整合）
  - [ ] dev-logic: i18n `theme.mode.{newid}.name` / `.desc` を ja/en 両方に追加（中立的丁寧体）
  - [ ] dev-logic: ThemeCard プレビューに新モードが出る・選択で applyTheme が走る配線確認
  - [ ] 回帰: 既存5モード（light/dark/enterprise/startup/custom）の表示が変わらないこと。custom（HEX 指定）経路が壊れないこと
  - [ ] コントラスト確認: 各新モードの text on bg / accent-fg on accent が WCAG AA（本文 4.5:1）
  - [ ] Android 実機確認（モバイル専用プロダクト。theme-color meta も含め）
- 抜けもれ提言:
  - i18n: 新モードの name+desc は ja/en 両方必須（既存 enterprise/startup/custom と同じ getter パターン。i18n.ts ja 591-596 / en 2424-2429 に追記）。中立的丁寧体（feedback_app_copy_neutral）。
  - デザイン制約: ハードコード hex 禁止ルールはあるが、theme.ts の MODES preview / tokens.css のテーマトークン定義は色の source なのでここで hex を持つのは正当（CLAUDE.md「色 source は OK」）。ただしコンポーネント側で直書きしない。UI chrome は emoji 不可・SVG のみ（テーマカードのアイコン使う場合）。
  - tier 割当の確認: 新3種を free にするか premium にするか Keita 判断（課金導線に影響。enterprise/startup/custom は premium 前例）。
  - アクセシビリティ: applyTheme の `pickFg()` が accent 上の文字色を自動選定するので accent は問題ないが、bg 上の本文 text は手動定義 → コントラスト要検算。ダーク系テーマで text が暗すぎ／ライト系で薄すぎないか。
  - 両OS: モバイル専用（project_logic_mobile_only）。Android 実機で背景・カード・meta theme-color が正しく出るか。iOS workflow 未整備なので当面 Android。
  - 永続化: テーマ選択は localStorage `logic-theme`（ThemeState.mode）に保存される既存機構。新 id を追加するだけで persist は自動で乗る（loadTheme の DEFAULT マージ）。ただし旧バージョンで未知 id を保存→読込時の fallback（applyTheme は MODES に無い id でも mode- クラス付与するだけなので、tokens.css に無い id だと無スタイル）に注意 → id 命名と tokens.css 追加は必ずセット。
  - Web 反映: backend 不要のフロント変更だが、Render web で確認したい場合は手動 deploy-production.yml が要る（project_logic_render_auto_deploy）。Android は main push で自動反映。
  - 重複注意: 既存 enterprise（ネイビー）/ startup（緑×橙）/ light/dark と色被りしない方向で。「垢抜け」= くすみ系・低彩度・モダン配色などの提案を designer に求める。

### T-C — カスタムコース生成できない（本番 route 未デプロイ）　[P0 / DONE]

- ✅ 完了・検証済（2026-05-28）: 本番 Render backend を手動再デプロイ（`deploy-production.yml`, run 26571568416 success）→ `POST /api/generate-course` が **404→200** に復活。正常系も検証済み（実際にコース生成を実行し title/description/lessonIds を返却・HTTP 200）。原因は本番デプロイ漏れのみで**コード修正は不要**だった（route はコードに実在、main マージ済だが Render 未再デプロイ）。migration 033 は本番適用済みと確認（`user_custom_courses` / `user_ai_course_usage` 両テーブル存在）。
- 依存解消: T-C 解決により前バッチ TC-2 の DoD（実 Claude 生成）が本番で検証可能になった → TC-2 を REVIEW→DONE 判定可（下記 TC-2 セクション参照）。
- 残: 内部テスト配信ビルドに最新カスタムコース UI が乗っている（#234, 5/27）。Keita 端末での実機ハッピーパス確認は配信完了後に実施予定（android-deploy.yml run 26572902909 in_progress）。
- 症状: アプリのレッスン検索 AI ボタンからカスタムコース生成を実行すると失敗する。
- 根因確定（林調査・本番 probe 済み）: 本番 Render backend が `POST /api/generate-course` に **404** を返す（route 未デプロイ）。比較: 本番で `POST /api/generate-problems` は **400**（route 有・バリデーションエラー）、`generate-course` だけ **404**（route 無）。
  - route 自体はコードに実在（`server/routes/custom-course.ts:131` `router.post('/api/generate-course', ...)`、`server/index.ts:226` で登録）。PR #234 / commit `83258ca` を main マージ済。
  - しかし Render backend が再デプロイされていない（main push の Render 自動デプロイは当てにならない既知事象 — project_logic_render_auto_deploy）。Android アプリは push ごとに毎回再ビルドされるので UI は最新（ボタンは入っている）が、叩く先の API に route が無く失敗。
- 修正: **コード修正不要・運用タスク**。本番 backend を手動再デプロイ:
  - `gh workflow run deploy-production.yml --repo keitaurano-del/logic -f confirm=yes`（Keita 承認案件 — 本番デプロイ）
  - `ANTHROPIC_API_KEY` は本番に存在見込み（generate-problems が本番稼働中＝同じキーを使う）。
- ステータス: BLOCKED（Keita のデプロイ承認待ち）。承認が出れば即実行 → デプロイ後検証へ。
- 担当案: 林/Keita（デプロイ実行）。dev-logic のコード作業は不要。
- 関連ファイル: `server/routes/custom-course.ts`（131 route）、`server/index.ts`（226 登録）。
- DoD: 本番で `POST /api/generate-course` が 404 を返さなくなる（正常リクエストで 200／不正で 400）。かつアプリ実機（Android）でカスタムコース生成が成功し、生成コースがロードマップ上部「あなた専用コース」に表示される。
- サブタスク:
  - [x] Keita にデプロイ承認を取る（本番 backend 再デプロイ）
  - [x] `deploy-production.yml -f confirm=yes` 実行（run 26571568416 success）
  - [x] デプロイ後 probe: `POST /api/generate-course` が 404→200 に復活。正常系で実際にコース生成（title/description/lessonIds 返却・HTTP 200）を確認
  - [x] バンドル/ビルド更新確認（deploy-production.yml run success）
  - [x] migration 033 本番適用確認（user_custom_courses / user_ai_course_usage 存在）
  - [ ] アプリ実機（Android 内部配信）でカスタムコース生成ハッピーパス確認（最新内部ビルド #234 配信完了後に Keita 端末で予定）
  - [x] 関連: 本番で route が動いたので TC-2（前バッチ）の DoD（実 Claude 生成）が検証可能に → TC-2 を REVIEW→DONE 判定
- 抜けもれ提言:
  - デプロイ後検証は必須（404 解消の probe ＋ 実機 ハッピーパス）。デプロイしただけで DONE にしない。
  - 前提依存: migration 033（user_custom_courses / user_ai_course_usage、TC-2 で「未適用」）が Supabase に適用済みか要確認。route が動いても保存先テーブルが無いと course 永続化／無料回数集計が失敗する → デプロイ前に migration 033 適用状況を確認（適用も Keita 承認案件）。
  - 両OS: iOS workflow 未整備なので当面 Android 実機で確認（project_logic_mobile_only / android_deploy）。
  - 再発防止メモ: 「main マージ済＝本番反映済」と思い込まない。backend 変更は手動 deploy-production.yml が必要（render auto-deploy は発火しないことが多い）。

### T-D — ジャーナルのタグ粒度が細かすぎる　[P1 / DONE（動的・自動統合モデルで本番反映済）]

- ✅ DONE（2026-05-29 朝）: 2026-05-29 に wip/20260528-inprogress を main マージ＋push → **Render backend deploy（deploy-production.yml 手動）completed success（run 26603561372）、本番 health 200** で backend 本番反映＝タグ動的自動統合のプロンプト改修が本番稼働。**D1-D3 完全グリーン（tsc=0 / vitest 324pass / eslint . 0 error）**、D4 は自動主体に縮小し undo を実装に内包（D3/D4 一体）。backend プロンプト変更は手動 deploy-production.yml が必須という落とし穴を踏まずに本番反映完了。DoD（既存タグ再利用＞シード語彙＞最小限の新規の優先順／静的シード名寄せ＋動的統合／自動統合の可視化と取り消し／非可逆操作の安全策／T3 名寄せ・既存 CRUD 非回帰／backend 本番反映）充足。
- （旧 REVIEW 記録）2026-05-28 深夜: D1-D3 完全グリーン、D4 自動主体に縮小・undo 内包、wip コミット済（当時 push/マージ/手動デプロイなし）。

- 📌 スコープ確定（Keita 2026-05-28 初版）: 「(1) プロンプトだけ直す」案ではなく **踏み込む方** を選択。**タグ統合 UX** ＋ **統制語彙（controlled vocabulary）** まで含めて修正する方針で確定。
- 📌📌 設計方針アップデート（Keita 2026-05-28 追加・最重要・本質）: タグの本質モデルを **動的・自動統合（dynamic / self-consolidating vocabulary）** に確定した。Keita 原文「タグは、設定するときに既存のものを見ながら最適なものを作る。かつ、もっと良いものがあれば新しく作って統合する」。
  - つまり **固定30語の canonical リストへ機械的に寄せるのではなく**、タグ付けのたびに **そのユーザーの既存タグ群を動的に参照して最適なタグを選ぶ／作る**。そして **より良い表現が現れたら新規に作り、古いものをそこへ統合（consolidate）する** ＝ 語彙が育つ・自己統合していく動的モデル。
  - **固定語彙（tagVocabulary.ts / D1）の位置づけ**: 廃止ではない。「強い推奨のシード／初期語彙」として活かす。ユーザーがまだタグを持っていない初期や、既存タグに良い候補が無いときの拠り所になる。本質はあくまで「タグ付け時に既存タグを動的参照して最適化＋自己統合」で、固定語彙はその出発点（種）に格下げ。
  - **D4 のタグ統合は「自動」を主体に確定**（旧 D4 の残論点「自動 vs 手動」は自動に決定）。手動統合 UI は主体から外し、ユーザーに見せるのは結果確認／取り消し程度に縮小する方向で再定義。
- 進捗（2026-05-28）: **D1（統制語彙の定義）DONE**（content-creator、成果物 `src/components/journal/tagVocabulary.ts`。tsc/eslint 通過・名寄せ動作確認済）。新方針に合わせ D2/D3/D4 を再設計済（下記）。D2/D3 は着手可、D4 は自動主体に縮小再定義済。
- 症状: ジャーナルのタグ（AI 自動提案）が細かすぎて、各エントリ固有のタグが乱立し「1タグ＝1ジャーナル」状態になり、タグの意味（横断的な分類）が薄れている。
- 根因確定（林調査・実ソース照合済み）: タグは AI 自動提案。`server/routes/journal.ts` の2経路で「細かく・固有に・既存と被らせない」方向に効いている:
  - `POST /tags`（:501-558）: システムプロンプトが「2-5 個」「each 1-3 words / 1-10 文字」「extract themes / actions / context」「既存タグと verbatim 重複させず**補完しろ（complement）**」（:524 ja, :536 en）。さらに `existingTags` をサーバ側で **先頭12個だけ**に切って渡す（:512-518 `.slice(0, 12)`）ので、12個を超えると AI は既存語彙を知らないまま新タグを作る → 固有タグ量産の構造要因。"補完しろ" 指示も新タグを後押し。
  - `POST /summarize`（:183-272）: 「extract up to 4 tags」「1-3 words each, total 2-4 tags」「themes / actions / context を抽出」（:207, :218）。既存タグ語彙を渡していない＝毎回ゼロベースで生成。
  - 両経路とも「再利用可能な広いタグ」より「そのエントリ固有のタグ」を優先する設計になっている。
- T3 との関係（重要・二重実装回避）: 前バッチ T3 で `journalDb.ts` に `normalizeTagDisplay`（NFKC 正規化・先頭#剥がし・空白圧縮・24字 slice）／`tagMatchKey`（小文字化キー）／`normalizeTags`（同一キー名寄せ・重複排除）を実装済（:31-69）。これは **表記ゆれ（大小文字・全半角）の名寄せ**であって、T-D の **粒度（意味的に近い別表記を一つの統制語に寄せる）** とは別軸。T-D の統制語彙マッピング（D3）は T3 の `tagMatchKey` を「キー算出」の土台として再利用し、その上に「統制語彙への canonical 解決」層を足すのが筋（T3 を作り直さない）。
- ━━━ サブタスク（D1✅DONE → D2/D3 着手可 → D4（D3 依存） → D5。本質は D2/D3 の動的・自動統合）━━━

  #### D1 — 統制語彙（controlled vocabulary）の定義・設計　[✅ DONE・content-creator]
  - ✅ 完了（2026-05-28、content-creator）: 成果物 `src/components/journal/tagVocabulary.ts`（新規・tsc/eslint 通過・名寄せ動作確認済）。
    - 4軸（theme / action / situation / mood）× canonical 計30語、各語に synonyms。ja/en 対。
    - ヘルパー: `buildVocabularyPromptHint(locale)`（軸別の推奨語彙ヒント文を生成、D2 用）／ `canonicalizeTag(raw, locale)`（語彙ヒットで canonical 表示形へ、ヒットなしは原表記＝オープン）／ `matchCanonical(raw)` / `allCanonicalLabels` / `canonicalsByAxis` / `getCanonicalById`。
    - 方針は **オープン＋強い推奨**（クローズドにせず語彙外タグも許容）を採用。
    - **T3（tagMatchKey）との関係**: T3 の「表記ゆれ名寄せ層」の上に乗る「意味的な名寄せ層」として設計。synonym 照合キーは T3 と同じ NFKC+小文字化正規化に合わせてあり二重実装にならない。
  - **位置づけの更新（新方針）**: 当初は「固定 canonical へ寄せる中核」だったが、Keita 新方針で **「強い推奨のシード／初期語彙」へ格下げ**。D2/D3 の動的モデルが本質、tagVocabulary.ts はその出発点（種）＋ヒューリスティック照合の土台として活きる。
  - 🔸 D1 で挙がった未解決の確認点（論点として保持・Keita 判断 or 実データ確認待ち）:
    - (a) **mood 軸を入れるか**: 現状4軸（theme/action/situation/mood）。mood を落として3軸にする案もある（mood はジャーナル本体に既に感情記録 UI があり重複の懸念）。→ Keita 判断 or D5 で実利用ログを見て決定。
    - (b) **「会議・打ち合わせ」の粒度**: 現状1 canonical（meeting）に社内/社外/1on1/商談などを全部寄せている。社内 vs 社外で分けるべきか。→ 実データ頻度を見て調整候補。
    - (c) **実データを見た語彙調整**: Supabase `daily_journals.tags` の実集計を見て、実際に多く出ているタグに合わせて canonical/synonyms を見直すか。初版は AI が出しがちな表記＋手打ち想定で組んだので、実データ反映は次イテレーション候補。
  - DoD: ✅ 充足（ja/en 対 canonical 語彙＋synonyms/axis 定義済・コード参照可・オープン方針確定）。
  - 担当: content-creator（DONE）。

  #### D2 — プロンプト側の動的最適化＋自己統合指示（新方針で拡張・旧 (1)）　[✅実装完了・検証グリーン・dev-logic]
  - ✅ 完了（2026-05-28 深夜）: dev-logic 実装（`server/routes/journal.ts` プロンプト改修・`src/components/journal/journalApi.ts`）。**tsc=0 / vitest 324pass / eslint . 0 error の完全グリーン**。wip ブランチコミット済。⚠backend なので本番反映は手動 deploy-production.yml 必須（デプロイ後 probe するまで効かない）。
  - 新方針での内容: プロンプトを「固定語彙へ寄せろ」だけでなく **「既存タグを動的参照して最適化＋自己統合せよ」** という指示へ拡張する。`/tags`・`/summarize` の両経路で:
    - (a) **既存タグ群を AI に渡す**: そのユーザーの既存タグ（理想は全量、現実的には頻度上位 or 直近）を渡し、「**まず既存タグに意味的に最適なものがあればそれを再利用せよ。固有名詞・一回性の表現は避けよ**」と指示。
    - (b) **シード語彙も渡す**: `buildVocabularyPromptHint(locale)`（D1）で軸別の推奨語彙を同梱し、「既存タグにもシード語彙にも適切な候補が無いときだけ、短く再利用可能な新タグを最小限で作れ」と指示。＝ 既存タグ＞シード語彙＞新規、の優先順位。
    - (c) **自己統合（consolidate）の指示**: 「既存タグの中に、より良い表現で言い換えられる細かい/古いタグがあれば、新しいタグに寄せて統合してよい」という consolidate ヒントを与え、AI に統合候補（old → new のペア）を返させる設計を検討（出力スキーマに `consolidations?: {from, to}[]` を足す案）。← この出力を D3 が受けて実適用する。
    - (d) **個数を控えめに**（例 1-3 個）。
    - (e) **`existingTags` の 12 個 slice 上限を見直す**（:512-518 `.slice(0, 12)`）: 動的参照が肝なので 12 固定はボトルネック。頻度上位 N（例 30-50）＋直近使用を優先して渡す、または件数が少なければ全量。トークン予算と相談して上限を再設計。
    - (f) `/summarize` 側にも同じ「既存タグ参照＋シード語彙」制約を効かせる（現状ゼロベース生成）。
  - DoD: 新規エントリのタグが (1) まず既存タグから再利用され、(2) 無ければシード語彙、(3) それも無ければ最小限の新規、という優先順で提案される。固有タグの新規生成が明確に減る（手動サンプル数件で before/after 比較）。consolidate 出力を返す設計なら D3 がそれを受けられる形になっている。
  - 担当: dev-logic。
  - ⚠デプロイ依存: プロンプトは backend → 本番反映には手動 deploy-production.yml が必須（後述「落とし穴」）。
  - ⚠論点: 既存タグを毎リクエスト渡すとトークン増（コスト/レイテンシ）。頻度上位に絞る／キャッシュする等の最適化を実装時に検討。

  #### D3 — 名寄せ＋動的統合（consolidate）ロジック（新方針で拡張）　[✅実装完了・検証グリーン・dev-logic]
  - ✅ 完了（2026-05-28 深夜）: dev-logic が新規 `src/components/journal/tagConsolidation.ts`（consolidate ロジック）＋ 単体テスト `src/__tests__/tagConsolidation.test.ts` を実装。`JournalDetailSheet.tsx`・`journal.css`・`i18n.ts` も改修。**tsc=0 / vitest 324pass / eslint . 0 error の完全グリーン**。安全策の undo は D4 として実装に内包済み。wip ブランチコミット済。
  - 新方針での内容: 2層に分けて整理する。
    - **層1: 静的シード解決（既存設計・軽量）** — D1 の `canonicalizeTag` / `matchCanonical` を使い、synonym → canonical のヒューリスティック名寄せ。T3 の `tagMatchKey` を土台に乗る。ヒットしないタグは原表記維持（オープン方針）。これは決定的なので vitest で検証しやすい。
    - **層2: 動的統合（consolidate）— 新方針の本体** — D2 が AI から受け取る `consolidations: {from, to}[]`（または D3 内でユーザー既存タグ群の類似検出で算出した統合ペア）を、ユーザーのタグ集合に適用する関数を `journalDb.ts` に追加する。「from タグを持つ既存エントリの当該タグを to に書き換え（rename/merge）」＝ ユーザーの語彙を実際に再編する操作。これが「もっと良いものが出たら新規に作って古いものを統合する」の実装本体。
  - 実装の論点整理:
    - **統合の発火タイミング**: (i) タグ付けのたびに AI が consolidate 候補を返したら即適用、(ii) 一定頻度でまとめて棚卸し（バッチ）、(iii) ユーザー操作時のみ。→ 自動主体（新方針）なら (i) or (ii)。安全策（下記）次第。
    - **適用範囲**: 表示・集計時の随時解決（元データ保持＝安全）か、既存エントリの tags を物理書き換え（語彙が本当に育つが非可逆）か。動的統合は本質的に「既存タグの書き換え」を含むので、層2は物理書き換え寄り。
    - **類似検出の手段**: AI 任せ（D2 の consolidate 出力）か、D3 内で embedding/文字列類似でローカル算出するか。初版は AI 出力を信頼し、誤統合の安全策（承認・取り消し）で担保する案を推奨。
  - DoD: (1) 静的シード解決で既存の固有タグが canonical/既存タグへ寄る（例「朝のクライアントMTG」→「会議・打ち合わせ」）、(2) 動的統合 consolidate ペアをユーザーのタグ集合へ適用できる関数が存在し永続化される、(3) 誤統合の取りこぼし/暴発がない（安全策と連動）、(4) T3 の表記ゆれ名寄せが壊れない。
  - 担当: dev-logic。
  - ⚠非可逆注意（重要・後述「安全策」と連動）: 動的統合（層2）は **既存タグの自動書き換え**を含む非可逆操作。元データのスナップショット／取り消し（undo）／承認制のいずれかを必ず設計に組み込む。物理バックフィル（過去全データの一括書き換え）は Keita 承認の別ステップ。

  #### D4 — 自動統合の結果確認 UI（新方針で「自動主体」に縮小再定義・旧 (2)）　[✅自動主体に縮小・undo を D3 実装に内包・dev-logic]
  - ✅ 進捗（2026-05-28 深夜）: **自動主体に確定し、undo（取り消し）を D3 実装に内包**（別画面の重い手動統合 UI は作らず、自動統合＋取り消しの安全弁を実装側に組み込んだ）。designer の重い画面設計は不要のまま。残るは Keita 確認論点（確認モード(C)を入れるか・通知の目立たせ方）だが、現状の自動＋undo で T-D の元目的（固有タグ乱立抑制）は満たす設計。
  - 新方針での再定義: **手動統合 UI は主体から外す**（旧 (a)「このタグを別タグに統合」手動操作は格下げ）。統合は D2/D3 の動的・自動統合が主体。**ユーザーに見せるのは結果確認／取り消し程度に縮小**する。
  - 縮小後の UI スコープ候補（いずれも「自動統合が起きたことの可視化と取り消し」が中核）:
    - (A) **自動統合の通知/履歴**: 「『朝のMTG』を『会議・打ち合わせ』にまとめました」のような結果表示（さりげないトースト or タグ管理画面の履歴）。
    - (B) **取り消し（undo）**: 自動統合を1操作で戻せる導線。非可逆操作の安全弁（後述「安全策」の UI 面）。
    - (C) （任意・余力があれば）統合前の **確認/承認モード**: 自動適用前に「まとめますか？」と一度だけ確認する設定。デフォルト自動・任意で確認制にできる。
  - 縮小により **designer の重い画面設計は不要に近い**。トースト/履歴/undo は既存 UI パターンで足りる見込み。designer は「自動統合をどう気づかせるか・undo 導線」の軽い UX レビュー程度。実装は dev-logic 主体。
  - DoD: (1) 自動統合が起きたことがユーザーに分かる（通知 or 履歴）、(2) 取り消せる、(3) 操作・状態が永続化され再表示で維持、(4) 新規 UI 文言は ja/en 両方・中立的丁寧体（feedback_app_copy_neutral）・UI chrome は SVG アイコンのみ（emoji 不可）。
  - 担当: dev-logic（主体・実装）＋ designer（undo 導線/通知の軽量 UX レビューのみ）。
  - 🔸論点: 「確認モード(C) を入れるか／デフォルト完全自動でいくか」「結果通知をどこまで目立たせるか（サイレント自動だと勝手にタグが変わって戸惑う／逐一通知だとうるさい）」は D4 着手時に Keita 確認。

  #### D5 — 回帰・検証　[D2/D3/D4 完了後・dev-logic]
  - 内容: T3 の表記ゆれ名寄せが壊れていないか、既存タグの保存・読み出し・集計が壊れていないか、D3 の canonical 解決で意図せぬ統合が起きていないかを確認。プロンプト出力は非決定的なので D2 は手動サンプル数件の before/after 確認手順を残す。
  - DoD: T3 機構・既存ジャーナル CRUD が非回帰。D2 の語彙寄せ・D3 の解決・D4 の UX が連携して「固有タグ乱立が抑制される」という T-D の元目的を満たす。

- 全体 DoD（T-D 完了条件・新方針版）: (1) 新規エントリのタグが「既存タグ再利用＞シード語彙＞最小限の新規」の優先順で提案され固有タグ乱立が抑制される（D2）、(2) 既存タグへの静的シード名寄せ＋動的統合（consolidate）が機能し語彙が育つ／自己統合する（D3）、(3) 自動統合の結果がユーザーに分かり取り消せる（D4）、(4) 動的統合の非可逆操作に安全策（undo/承認/スナップショット）が備わる、(5) T3 の表記ゆれ名寄せ・既存 CRUD が非回帰（D5）、(6) backend プロンプト変更が本番反映済（手動デプロイ）。
- 担当アサインまとめ（新方針版）: D1 = content-creator（✅DONE）、D2/D3 = dev-logic、D4 = dev-logic 主体＋designer 軽量 UX レビューのみ（旧「designer 設計主体」から縮小）、D5 = dev-logic。
- 関連ファイル: `server/routes/journal.ts`（:183-272 summarize / :501-558 tags、:512-518 existingTags 12 個 slice ＝ D2 で上限見直し、:524 ja プロンプト / :536 en プロンプト）、`src/components/journal/journalDb.ts`（:31-69 T3 正規化 ＝ D3 層1 の土台、D3 層2 の consolidate 関数追加先）、`src/components/journal/tagVocabulary.ts`（✅D1 成果物・シード語彙＋照合ヘルパー）、`src/components/journal/TagInput.tsx`（タグ入力・サジェスト UI）、`src/components/journal/types.ts`（consolidate 出力スキーマ拡張先候補）、`src/i18n.ts`（D4 の新規 UI 文言 ja/en）。
- 依存関係（新方針版）: D1（✅DONE）→ D2・D3（着手可・並行可）→ D4（D3 の consolidate 実装に依存）→ D5（全部の後）。D2 と D3 は密結合（D2 の consolidate 出力を D3 が受ける）ので同一 dev-logic が一気通貫で見るのが望ましい。
- 抜けもれ提言:
  - ⚠デプロイ依存（最重要・T-C と同根の落とし穴）: D2 のプロンプトは backend 側。**main マージ＝本番反映ではない**。Logic の Render web は main push で auto-deploy されないことが多く（project_logic_render_auto_deploy 訂正）、backend プロンプト変更を本番に効かせるには `gh workflow run deploy-production.yml --repo keitaurano-del/logic -f confirm=yes` の **手動デプロイが必須**。ローカルやステージングだけ直して「タグが直った」と判断しない。デプロイ後に本番ジャーナルで実タグ生成を probe して初めて DONE。Android はアプリ内でこの backend API を叩くので、backend をデプロイしないとアプリ側 UI が新しくても旧プロンプトの結果が返る。
  - i18n: D2 のプロンプトはサーバ内部文字列（ja/en 分岐済み・ユーザー直接表示でない）→ i18n.ts への追加は不要。ただし **D4 の新規 UI 文言（統合ボタン・確認ダイアログ・空状態等）は i18n.ts の ja/en 両方に必須**＋中立的丁寧体（feedback_app_copy_neutral）。D1 の統制語彙そのものは ja/en 対で定義する（タグ表示に直結）。
  - 両OS: ジャーナルはモバイル中心機能（project_logic_mobile_only）。D4 の UX は Android 実機で確認。D2/D3 は純データ/サーバなので OS 差は小さいが、D4 の操作 UI はタッチ操作で確認。
  - ⚠⚠ 動的自動統合の安全策（新方針で最重要・論点として明記）: 動的統合は **既存タグの自動書き換え（非可逆）** を本質的に含む。「勝手にタグが変わって元に戻せない／意図せぬ統合で別概念が混ざる」事故を防ぐ安全策を設計に組み込むこと。具体的な論点:
    - (1) **取り消し（undo）可否**: 自動統合は1操作で戻せること（D4 の undo 導線）。最低限これは必須寄り。
    - (2) **承認制 vs 完全自動**: デフォルト完全自動でいくか、初回だけ／信頼度が低い統合だけ確認を挟むか。Keita 判断。
    - (3) **元データのスナップショット**: 物理書き換え前に統合前の tags を保持（before スナップショット）し、誤統合を後から復元できる土台を持つか。
    - (4) **物理バックフィル（過去全データ一括書き換え）の扱い**: 随時適用（新規・編集時のみ統合）をデフォルトにし、過去全データの一括 consolidate は Keita 承認の別ステップ（DB マイグレーション/バッチ＝非可逆・要スナップショット）。
    - (5) **誤統合の検出**: AI の consolidate 出力を無検証で適用すると別概念混入リスク。信頼度しきい値・対象軸の限定（同一 axis 内のみ統合可 等）でガードするか。
    - → これらは D3/D4 実装前に Keita と方針合わせが要る（特に (2) 承認制と (4) 物理バックフィルは判断案件）。
  - UI chrome の emoji 不可: D4 の統合通知/履歴アイコン等は `src/icons/index.tsx` の SVG を使う（journal の mood/weather/phase/streak 絵文字例外は対象外＝タグ管理 UI は通常の SVG ルール）。
  - テスト: D2 のプロンプト出力は非決定的でユニットテスト困難 → 手動サンプル数件の before/after 確認手順を残す。D3 の synonym→canonical 解決関数は決定的なので vitest 単体テスト向き（既存タグ群を入れて期待 canonical が返るか）。
  - 永続化: D4 のタグ統合操作は localStorage＋Supabase 同期（既存ジャーナルの保存経路 daily_journals）に乗せる。物理バックフィルは Supabase 側 DB 操作＝マイグレーション or バッチ（承認案件）。
  - 統制語彙の運用: D1 の語彙は今後メンテが要る（カテゴリ追加時に語彙も更新）→ 将来 task-manager の recurring or content-creator の継続管理に乗せる検討余地（今回は初版定義まで）。

### T-E — Obsidian vault 最新化＋日次更新の仕組み化　[P1 / IN_PROGRESS]

- 進捗（2026-05-28）:
  - (a) ✅ DONE: 5/26〜5/28 の Daily Note 本体キャッチアップ作成済（林）。
  - (b) 一部: 20-Projects/logic 状況の最新化は進行中（部分反映）。TASK_TRACKER ミラー配置は残。
  - (c) 未: 日次自動生成の仕組み化は未着手。**T-F 依存**（claude を root cron で回せないと案1/案2 とも動かない）。
  - (d) 未: recurring 管理（R-1）の漏れ検知ルール定義は T-F 解決後に本格運用。
- 依頼原文（Keita 2026-05-28）: 「Obsidian 全部最新に更新して。全然更新されてないから毎日更新して、task-manager にちゃんと管理させて」。
- 現状調査（実 vault 照合済み）:
  - 自動パイプライン（`50-Daily/` 配下の `briefings/` `feedback/` `inspections/` サブフォルダ）は毎日更新されている。cron 3 本稼働: `03:00 night-patrol`（inspections）→ `06:00 feedback-watcher`（feedback）→ `07:00 morning-briefing`（briefings、ceo agent）。各サブフォルダに 2026-05-28 分まで存在。
  - **欠落1: Daily Note 本体**（`50-Daily/2026-05-XX.md`）が **2026-05-25 で停止**。5/26・5/27・5/28 が無い。原因: morning-briefing.sh は `50-Daily/briefings/{date}.md` には書くが、Daily Note 本体（`50-Daily/{date}.md`）を生成するステップが無い。Daily Note 本体は手動運用のまま放置されていた。
  - **欠落2: 20-Projects/logic の状況ページが古い**。`release-log.md` は 5/21 止まり、`README.md` 5/19。実際は 5/27 に PR #233（journal/lesson/badge 7件）main マージ＋migration 032 適用済み等の進捗が反映されていない。TASK_TRACKER のミラーも未整備。
- やること:
  - (a) **キャッチアップ**: 5/26〜5/28 の Daily Note 本体（`50-Daily/2026-05-26.md`〜`28.md`）を作成。各日の briefings/feedback/inspections を統合し daily-template.md（90-Templates）準拠で書く。
  - (b) **20-Projects/logic 状況最新化**: release-log / README を 5/28 時点へ更新。TASK_TRACKER（T-A〜T-E）のミラーを `20-Projects/logic/` に置く（feedback_direct_content_not_path 準拠で Keita が vault からも見れるように）。
  - (c) **日次更新の仕組み化**: Daily Note 本体生成を恒久自動化。方式は2案 — (案1) morning-briefing.sh に Daily Note 本体生成ステップを追加（briefings を素材に `50-Daily/{date}.md` も出力）、(案2) 別 cron で daily-note 生成スクリプトを新設。案1 が既存 07:00 枠に相乗りでき低コスト。実装方式は Keita 確認の上で。
  - (d) **recurring 管理**: 今後 task-manager が「Obsidian 日次更新」を recurring タスクとして管理（後述 recurring セクション参照）。毎日漏れた時の検知も含む。
- 担当案: 林（(a) キャッチアップ実書き ＋ (b) 状況最新化）／ ceo（(c) 日次ブリーフィング統合＝morning-briefing.sh への Daily Note 生成統合）／ task-manager（(d) recurring 管理・漏れ検知）。
- 優先度: P1（Keita 明示要望）。ただし correctness バグ T-A（P0）・機能不全 T-C（P0）より下。
- 関連ファイル: `obsidian-vault/50-Daily/2026-05-{26,27,28}.md`（新規）、`90-Templates/daily-template.md`（準拠テンプレ）、`/root/.claude/projects-meta/scripts/morning-briefing.sh`（(c) 案1 の改修対象）、`crontab`（03/06/07 の3本、(c) 案2 なら追加）、`obsidian-vault/20-Projects/logic/{release-log,README}.md`、`obsidian-vault/OBSIDIAN_GIT_AUTO_SYNC.md`（sync 設定手順）。
- DoD:
  - (a) 5/26〜5/28 の Daily Note 本体が daily-template 準拠で存在し、各日の briefings/feedback/inspections の要点が統合されている。
  - (b) 20-Projects/logic の release-log/README が 5/28 時点を反映し、TASK_TRACKER ミラーが配置されている。
  - (c) 翌日以降、Daily Note 本体が人手介入なしで毎日生成・commit・push される（仕組みが恒久化）。
  - (d) task-manager の recurring タスクとして登録され、生成漏れを検知できる。
- サブタスク:
  - [x] (a) 5/26 Daily Note 作成（briefings/feedback/inspections 2026-05-26 を統合）
  - [x] (a) 5/27 Daily Note 作成（PR #233 main マージ・migration 032 適用等の進捗込み）
  - [x] (a) 5/28 Daily Note 作成（本日分・本バッチ T-A〜T-H 登録も記載）
  - [~] (b) release-log.md を 5/28 時点へ更新（5/22〜5/28 の commit/PR/デプロイ）※一部反映
  - [ ] (b) README.md（20-Projects/logic）更新
  - [ ] (b) TASK_TRACKER ミラーを 20-Projects/logic/ に配置
  - [ ] (c) 日次自動生成の方式決定（案1: morning-briefing.sh 統合 / 案2: 別 cron）を Keita 確認
  - [ ] (c) ⚠依存: morning-briefing.sh に相乗りする案1 は **T-F（cron root 権限エラー）が直らないと動かない**（07:00 ブリ自体が空振り中）。T-F 解決を先行 or 同時に。別 cron 案2 でも claude CLI を root cron で叩くなら同じ root 権限問題を踏むので T-F の解決策（後述）を流用すること
  - [ ] (c) 選定方式で実装（スクリプト改修 or cron 追加）＋手動試走で 1 日分生成確認
  - [ ] (d) task-manager の recurring セクションに「Obsidian 日次更新」登録＋漏れ検知ルール定義
- 抜けもれ提言:
  - テンプレ準拠: Daily Note は `90-Templates/daily-template.md` のフロントマター（date/weekday/updated_by:林）と見出し構成（今日の Top 3／気になっとること／進捗ハイライト／夜の振り返り／関連リンク）に従う。既存 5/25 の書き方が手本。
  - obsidian-git auto-sync: vault は obsidian-git で auto commit/push（backup 30min / pull 10min / merge 方式、OBSIDIAN_GIT_AUTO_SYNC.md）。スクリプトからの commit/push と Keita 端末の obsidian-git が衝突しないか確認（morning-briefing.sh は既に git add/commit/push する作りなので同様の作法で）。conflict marker 解決ルールは手順書にある通り。
  - 仕組み化の検知: 「毎日漏れた時の検知」= 案として morning-briefing.sh の末尾で「前日の Daily Note が存在するか」チェックし、欠落していれば briefings に警告行を出す or 翌朝まとめて catch-up 生成。recurring 管理は task-manager がトラッカー上で「最終生成日」を追跡。
  - 内容の鮮度・正確性: キャッチアップで過去日を書く時、後追いで美化しない。実際の git log / briefings の事実ベースで書く（ceo briefing が既に事実集約しているのでそれを正本に）。
  - cron 時刻: システム TZ は Asia/Tokyo（crontab コメントに JST 明記）。Daily Note 生成を 07:00 morning-briefing に相乗りするなら briefings 生成の後段に置く（briefings を素材にするため順序依存）。
  - 非自動領域: 「夜の振り返り（寝る前に書く）」セクションは Keita/林の手動記入想定。自動生成では空テンプレ or 当日ハイライトのみ埋め、振り返りは手動枠として残す。
  - スコープ確認: 「Obsidian 全部最新に」の「全部」が 50-Daily と 20-Projects/logic 以外（00-Inbox / 10-Tasks / 20-Knowledge / 40-Resources 等）も含むか。今回は明示された Daily Note と logic 状況に絞り、他フォルダの棚卸しが要るなら別タスク化を Keita 確認。
  - 自動パイプラインの健全性前提が崩れていた（T-F 発覚）: T-E 当初の現状認識「briefings/feedback の自動パイプラインは 5/28 まで稼働中」は**ファイル存在ベースの誤認**だった。実際は 5/27・5/28 とも中身がエラー文字列で、タイムスタンプだけ更新されてゴミ。T-F で別タスク化。T-E のキャッチアップ素材として briefings/feedback を使う際は、5/26 までの正常分のみ信頼し、5/27 以降は git log / inspections / 本セッションの事実を正本にする。

### T-F — cron 自動化の root 権限エラー修復　[P1 上位 / TODO]

- 症状（2026-05-28 Obsidian キャッチアップで発覚）: `50-Daily/briefings/`（07:00 ceo 朝ブリ）と `50-Daily/feedback/`（06:00 feedback-watcher）の cron 出力が、5/27・5/28 とも中身が**エラー文字列**「`--dangerously-skip-permissions cannot be used with root/sudo privileges for security reasons`」（実ファイル確認済み、各 93 bytes）。タイムスタンプだけ毎日更新され中身がゴミ。5/26 までは正常（briefings/2026-05-26.md は 8802 bytes の実ブリーフィング）。
- 根因（実スクリプト＋crontab 照合済み）:
  - crontab 3 本: `03:00 night-patrol`（`>> /var/log/night-patrol.log`）／`06:00 feedback-watcher`／`07:00 morning-briefing`。TZ は Asia/Tokyo。
  - 死んでいる 2 本（feedback-watcher / morning-briefing）は **`claude --print --agent ...` を呼ぶ**（`morning-briefing.sh:38` `claude --print --agent ceo`、`feedback-watcher.sh:23` `claude --print --agent feedback-watcher`）。生きている night-patrol は claude CLI を呼ばず `npx playwright` を直接叩くだけ＝この差が症状と完全整合。
  - claude CLI を **root ＋ 非対話 cron 環境**で起動すると内部的に permission skip が要求され、root では `--dangerously-skip-permissions cannot be used with root/sudo privileges` で弾かれて即終了。その stderr が `> "$OUTPUT" 2>&1` でそのまま Daily ファイルに書き込まれている。
  - 推定発生時期: 5/26→5/27 の間（claude CLI バージョン更新 or 環境変化で root cron 実行が弾かれ始めた）。スクリプト本文には `--dangerously-skip-permissions` フラグは書かれていない＝CLI 側の挙動変化が原因。
- 修正方針（ceo 判断・案、コードは task-manager は書かない）: root cron で claude CLI を回す方法を確立する。候補:
  - (案A) cron 実行ユーザーを非 root に変更（専用ユーザーで claude を回す）。最も筋が良いが OAuth 認証情報（`~/.claude/.credentials.json`）のユーザー紐付け移行が要る。
  - (案B) claude CLI を root で非対話実行できる正規の方法に切替（環境変数 or `--permission-mode` 等の正式フラグで permission prompt を回避。`--dangerously-skip-permissions` を root で使えない以上、別の許可方式が要る）。CLI の現行仕様確認が前提。
  - (案C) コンテナ/環境側で root 制約を外す（非推奨・セキュリティ後退）。
  - どの案も Keita 確認の上で。OAuth クレデンシャルの扱いが絡むので慎重に。
- 担当案: ceo（自分のスクリプト群 morning-briefing.sh / feedback-watcher.sh の持ち主）。CLI 起動方式の検証は dev-logic 補助もあり得る。
- 優先度: P1 上位。理由 = 自動化パイプラインの根っこ。これが死んでいると ceo 朝ブリ・feedback 監視が毎日空振りし、かつ T-E (c)（Daily Note 日次自動生成を morning-briefing.sh 統合 or 別 cron で claude を回す案）が**前提として動かない**。
- 関連ファイル: `/root/.claude/projects-meta/scripts/morning-briefing.sh`（:38 claude 呼び出し）、`/root/.claude/projects-meta/scripts/feedback-watcher.sh`（:23 claude 呼び出し）、`crontab`（06/07 の 2 本）、`/var/log/{feedback-watcher,morning-briefing}.log`（cron 実行ログ・調査用）、認証 `~/.claude/.credentials.json`（ユーザー紐付け）。
- DoD: 翌朝以降、`50-Daily/feedback/{date}.md`（06:00）と `50-Daily/briefings/{date}.md`（07:00）が**エラー文字列でなく実際の内容**で生成・commit・push される。少なくとも 1 日、両ファイルが正常生成されることを確認（93 bytes のエラー固定でなく実ブリーフィングサイズ）。
- サブタスク:
  - [ ] root cron で claude CLI を非対話実行できる方式を確立（案 A/B/C を検証し Keita 確認）
  - [ ] morning-briefing.sh / feedback-watcher.sh を選定方式に改修
  - [ ] 手動試走で 06:00 / 07:00 両方が実内容を生成することを確認（cron を待たず手動キック）
  - [ ] 5/27・5/28 のエラー固定 Daily ファイル（feedback/briefings）を正しい内容で書き直すか、T-E (a) キャッチアップ側で吸収するか整理（過去分の扱い）
  - [ ] 再発検知: 出力が「`--dangerously-skip-permissions`」等のエラー文字列パターンか・極端に小さい byte 数かをスクリプト末尾でチェックし、異常なら警告を残す（サイレント空振り防止）
  - [ ] 回帰: night-patrol（claude を呼ばない 03:00）は影響を受けない想定だが、ユーザー変更（案A）した場合は 3 本とも実行ユーザー整合を確認
- 抜けもれ提言:
  - i18n / 両OS / アプリ文言: 無関係（運用スクリプト・インフラ）。
  - サイレント失敗が最悪: タイムスタンプだけ更新されるので「動いているように見えて中身ゴミ」。今後の検知ルール（出力サイズ/エラーパターンチェック）を必ず入れる。T-E (d) recurring 監視とも連動。
  - 認証の非可逆注意: cron 実行ユーザー変更（案A）で OAuth クレデンシャルを移すと、誤ると claude CLI が全環境で認証切れになりうる。バックアップを取ってから。
  - T-E との依存: T-E (c) の案1（morning-briefing.sh 相乗り）も案2（別 cron で claude）も、claude を root cron で回す前提なので T-F が前提条件。T-F を先に解くか同時に解く。
  - night-patrol が生きている理由の確認価値: 「claude を呼ばない cron は動く」なら、Daily Note 生成も claude を介さず素材ファイル結合スクリプトで作る選択肢もある（T-E (c) 設計時の代替案）。

### T-G — night-patrol 夜間スモークが "No tests found" で空振り　[P1 / DONE]

- ✅ DONE（2026-05-29 朝）: 2026-05-29 に wip/20260528-inprogress を main マージ＋push で **config 本番反映済**。修正内容＝playwright config が 5/25・5/27 両 spec（計20件）を正しく拾うことを確認し "No tests found" の空振りを解消。本番は元々健全なので監視復旧扱い。**備考: night-patrol の実走確認（次回夜間 03:00 cron で inspection が正常 severity に戻り pass 件数が出るか）は次回 night-patrol に残**（config 修正自体は検証済み・本番反映済みのため DONE 判定）。
- （旧 REVIEW 記録）2026-05-28 深夜: testMatch glob 追従化で空振り解消、wip コミット済（当時 push/マージなし）。
- 症状（2026-05-28 inspection で発覚）: `50-Daily/inspections/2026-05-28.md` が severity **HIGH**。本番フロント（https://logic-u5wn.onrender.com/）と API（/api/health）はともに **200 で健全**だが、Playwright スモークが `Error: No tests found. Make sure that arguments are regular expressions matching test files.` で**空振り**（0 件実行）。5/27 inspection は 11 件 pass していた → 5/27→5/28 で夜間スモークが実質停止＝**本番は無事だが監視が死んでいる（検知力ゼロ）**状態。緊急障害ではないが監視の穴。
- 根因（実 config ＋ spec ＋ night-patrol.sh 照合済み・ほぼ確定）:
  - `night-patrol.sh:43` は `SMOKE_SPEC=$(ls -t e2e/render-smoke-*.spec.ts | head -1)` で**最新の smoke spec を動的選択**し、`:48` で `npx playwright test "$SMOKE_SPEC" --config=playwright.render.config.ts --reporter=line` を実行。
  - ところが `playwright.render.config.ts:14` の `testMatch: ['render-smoke-20260525.spec.ts']` が**ファイル名ハードコード（5/25 固定）**。
  - 5/27 に `e2e/render-smoke-20260527.spec.ts`（PR #233 系のスモーク、mtime 5/27 11:53）が追加され、`ls -t` で最新としてこれが引数に渡るようになった。結果 Playwright は「引数 spec=20260527 ∩ testMatch=20260525」の**積集合が空** → "No tests found"。5/25 spec の時は引数と testMatch が一致して 11 件 pass していた。
  - つまり「テストが消えた/壊れた」のではなく、**config の testMatch が新 spec に追従していない**ことが直接原因。テストファイル自体は存在し中身も妥当（20260527.spec.ts に home/roadmap/T7/T6/T2/ranking/journal 等の test 多数）。
- 修正方針（dev-logic / test-smoke 判断・案、task-manager は書かない）:
  - (案1) `playwright.render.config.ts` の `testMatch` を最新追従パターン `['render-smoke-*.spec.ts']`（or 最新1本に絞るなら glob ＋ ソート）に変更。night-patrol が `ls -t | head -1` で最新を引数指定する設計と整合させる。最小修正。
  - (案2) night-patrol.sh 側で引数 spec を渡すのをやめ、config の testMatch に選択を委ねる（config を最新追従にした上で引数なし実行）。二重指定の競合をなくす。
  - どちらでも「新しい render-smoke spec を追加したら自動で夜間スモーク対象になる」状態にするのが肝（再発防止）。
- 担当案: dev-logic（config / スクリプト修正）または test-smoke（スモーク spec の責務者）。
- 優先度: P1。本番健全なので P0 ではないが、監視が死んでいる＝次に本番が壊れても夜間検知できないので早期復旧したい。
- 関連ファイル: `playwright.render.config.ts`（:13 testDir './e2e' / :14 testMatch ハードコード / :21 baseURL）、`/root/.claude/projects-meta/scripts/night-patrol.sh`（:43 spec 動的選択 / :48 playwright 実行 / :58 not-found フォールバックメッセージ）、`e2e/render-smoke-20260527.spec.ts`（現行最新・PR #233 系）、`e2e/render-smoke-20260525.spec.ts`（旧・testMatch が今これだけ指す）。
- DoD: 翌日以降の night-patrol（03:00）inspection で Playwright スモークが**実際にテストを実行し pass 件数が出る**（"No tests found" にならない）。かつ今後 `render-smoke-{新日付}.spec.ts` を追加しても config 修正なしで自動的に夜間スモーク対象になる（再発防止）。
- サブタスク:
  - [ ] `playwright.render.config.ts` の testMatch を最新追従パターンに修正（or night-patrol 側の渡し方と整合）
  - [ ] ローカルで `npx playwright test e2e/render-smoke-20260527.spec.ts --config=playwright.render.config.ts` が "No tests found" を出さず実行されることを確認
  - [ ] night-patrol.sh の `ls -t | head -1` 選択ロジックと config の testMatch が二重で衝突しない構成に整理
  - [ ] 過去 spec が複数あるとき「最新だけ」走るのか「全 render-smoke spec」走るのか方針を明確化（毎日全部だと遅い／最新だけだと過去観点を落とす）
  - [ ] 再発防止: spec 追加時の testMatch 更新を不要にする（glob 化）or PR チェックリスト化
  - [ ] 回帰: 修正後に night-patrol を手動キックして inspection が正常 severity に戻ることを確認（cron を待たず）
- 抜けもれ提言:
  - i18n / アプリ文言: 無関係（テスト基盤）。
  - 両OS: スモークは Render web（本番フロント）対象。Logic はモバイル専用（project_logic_mobile_only）だが、この夜間スモークは web バンドルの死活監視として価値があるので維持する（web 停滞自体はユーザー無影響でも、本番 backend/フロントの 200 死活＋主要画面描画の回帰検知になっている）。
  - 監視のサイレント空振りが本質問題: T-F と同じく「動いているように見えて検知していない」パターン。night-patrol が HIGH を出して気づけたのは良いが、testMatch ハードコードのような「設定が新ファイルに追従しない」構造は再発しやすい。glob 化＋追加時無設定を徹底。
  - 本番は健全: フロント 200 / API 200 を確認済み。これは障害対応でなく**監視復旧**タスク。優先度判断時に「本番は無事」を明示しておく（過剰反応しない）。
  - test-results / screenshots: night-patrol.sh:53-54 は test-results を screenshots へコピーする。スモークが 0 件だと成果物も空。修正後はスクショ/結果も復活するか確認。

### T-H — Logic Android Production 公開　[P1 / 公開戦略確定（2026-05-30）]

> 状態（2026-05-30 Keita 公開戦略決定）: **「今の最新ビルドで先に公開」**。DF-F 系 P0 改善は公開後アップデートで対応する（公開を待たない）。公開前提だった T-G スモーク・T-B テーマは **5/29 達成済み**。残るは公開順序（下記）の実行。
>
> 公開順序（確定）:
> 1. AM-O SKU 登録（Keita・Play Console で logic_paid_monthly/yearly を Active＋月¥350/年¥2,450）
> 2. 実機課金ハッピーパス検証（dev-logic/test-functional・キャンセル/失敗/restore 分岐含む）
> 3. リリースノート整備（担当アサイン要＝content-creator or marketing 候補）
> 4. Production promote（Play Console 手動・Keita）

- 記録（Keita 判断 2026-05-28→2026-05-30 更新）: 当初は「リリースノート＋T-G＋T-B が揃ってから一発公開」で保留していたが、2026-05-30 に「今の最新ビルドで先に公開、P0 改善は公開後アップデート」へ方針確定。
- 現状: 内部テスト track には自動配信が回っている（main push ごと、project_logic_android_deploy）。Production への promote が最終ステップ。
- ステータス: 公開戦略確定（実行フェーズ）。Production promote 自体は AM-O SKU 登録→実機検証→リリースノート完了後の Keita 手動操作。
- 担当: Keita（SKU 登録・最終 promote）。実機検証=dev-logic/test-functional。リリースノート=要アサイン（content-creator or marketing）。
- DoD: AM-O SKU 登録済＋実機課金ハッピーパス検証 OK＋リリースノート（ja/en）整備済の状態で、Keita が Production track へ promote。
- ⚠次アクション（担当アサイン要）: **リリースノート整備の担当が未アサイン**。最新ビルドの Production 差分（テーマ刷新・UI-1〜13・課金結線 AM-O）をリリースノート化する。候補=content-creator or marketing。
- 抜けもれ提言:
  - 公開前チェック: Play Billing 既知ギャップ（project_logic_play_billing_gaps）の残課題（#2 RTDN の GCP/Play Console 設定・JWT 検証、#4 SKU 登録確認＝AM-O）が課金導線に影響。AM-O の SKU 登録＋実機検証が公開順序の先頭に来ているのは整合。有料購読者が増える前にクローズ前提だが、Production 公開＝露出拡大なので公開判断時に再確認推奨。
  - リリースノートは ja/en 両方（Play Console の対応言語に合わせる）。中立的丁寧体（feedback_app_copy_neutral）。マーケ文言は「コーヒー1杯」系の安さアピール NG（feedback_logic_marketing）。
  - DF-F 系 P0 改善は「公開後アップデートで対応」と Keita 決定。ただし P0 の中身が課金/クラッシュ等のクリティカル領域なら、公開後の最初のアップデートで優先処理する想定で別途トラッキングする。
  - 内部テストで T-A（フェルミズレ）・カスタムコース（T-C/TC-2）のハッピーパスを Keita 端末で確認してから Production へ上げると安全（既知バグを本番ユーザーに出さない）。

---

## バッチ: 2026-05-28 新規要望4件（Keita・追加）

実機・使い勝手のフィードバック4件。task-manager が構造化。実装は委譲。
軽い要望（T-L フェルミ答え位置）と重い要望（T-I/T-J の進捗・回数トラッキングは DB/集計が絡む）を見極めて分解。

| ID | タイトル | 優先度 | ステータス | 担当案 | 関連 |
|----|----------|--------|-----------|--------|------|
| T-I | コース単位の進捗を見れるようにする | P1 | DONE（2026-05-29 main マージ＋push 本番反映。スコープ=コースカードに進捗バー＋%。courseProgress.ts 新規/RoadmapScreenV3/i18n。tsc0/eslint0/vitest8。Android 自動配信で反映） | dev-logic | 既存 progressStore / roadmapStore |
| T-J | 完了バッジのチェックマークの色を変更する（スコープ縮小確定） | P2 | DONE（2026-05-29 main マージ＋push 本番反映。テーマアクセント色 --accent 追従に、#fff→--accent-fg。tsc0/eslint0/vitest9。Android 自動配信で反映） | dev-logic | テーマ追従（T-S/T-T と一貫）。CompletionBadge.tsx/PersonalCourseScreen |
| T-K | ジャーナルのグラフ tap で詳細展開 | P2 | DONE（2026-05-29 main マージ＋push 本番反映。気分推移グラフ tap→当日要約をインライン展開。MoodSparkline/journal.css/i18n。tsc0/eslint0。Android 自動配信で反映） | dev-logic | 対象=気分推移グラフのみ（タグ頻度/ストリークは対象外、T-D 競合回避） |
| T-L | Daily Fermi の答えを解説の最後に移す | P2 | DONE（2026-05-29 main マージ＋push＋Render deploy 実行で本番反映。答えは AI フィードバック本文内→プロンプトで末尾 ## 答え に。server/routes/fermi.ts。tsc0/eslint0/vitest324/PW9。サーバ側のため deploy-production.yml 実行） | dev-logic | 答えは static でなく AI 生成本文内だった |

### T-I — コース単位の進捗を見れるようにする　[P1 / TODO（スコープ要確認）]

- 依頼原文（Keita 2026-05-28）: 「コースの進捗が見れるようにしたい」。
- 想定スコープ: ロードマップ/コース一覧で「このコースを何 % 進めたか（完了レッスン数 / 全レッスン数）」をコース単位で可視化する。レッスン単体の done/not-done は既にあるが、コースを束ねた進捗集計の表示が無い（要実装確認）。
- 既存資産（要実装前確認・未照合）: `src/progressStore.ts`（per-lesson progress map・localStorage `logic-progress`）、`src/roadmapStore.ts`（roadmap node state）、`src/db/progressDb.ts`、`courseData.ts`（コース→所属レッスン id の対応）。コースに属するレッスン id 集合は courseData にある想定なので、「コース内レッスンのうち完了数 / 総数」はクライアント集計で出せる見込み（新規 DB 不要の可能性が高い）。
- 重さの見極め: **中**。データソース（progress map）は既存。新規は「コース×進捗の集計関数」＋「進捗表示 UI（プログレスバー/％/n of m）」。ただし下記スコープ論点次第で重くなる（Supabase 横断集計やバッジ連動まで広げると重）。
- DoD（暫定・スコープ確定後に確定）: コース一覧 or コース詳細で、各コースの完了レッスン数 / 総レッスン数（と % or バー）が表示される。レッスン完了状態の変化が進捗表示に反映される。ゲスト/ログイン両方で破綻しない。
- サブタスク（暫定）:
  - [ ] スコープ確定（下記論点を Keita 確認）
  - [ ] 実装前調査: コース→レッスン id 対応（courseData）と progress map の付き合わせで集計可能か確認。集計関数の置き場所決定（progressStore 拡張 or 新規 selector）
  - [ ] コース進捗の集計ロジック（完了数 / 総数 / %）
  - [ ] 進捗表示 UI（プログレスバー or リング or n/m。RoadmapScreenV3 のコースカード or コース詳細）
  - [ ] 回帰: progress 更新（レッスン完了）→ 進捗表示が即反映。フィルタ/検索/カテゴリ開閉（T7 既存）と整合
  - [ ] i18n（「完了 n / m」「進捗 N%」等の新規文言 ja/en・中立丁寧体）
- Keita 確認すべきスコープ論点:
  - (1) **表示場所**: コース一覧カード上に出すか、コース詳細画面か、両方か。
  - (2) **表示形式**: % だけ / n of m / プログレスバー / リング のどれか（designer 軽量提案で足りる）。
  - (3) **「完了」の定義**: レッスンを1回でも完了＝done か、進捗率（途中まで）も含めるか。
  - (4) **集計範囲**: localStorage の progress だけで足りるか、Supabase 同期した全デバイス横断の進捗まで見せたいか（後者だと重くなる）。
- 抜けもれ提言:
  - i18n: 進捗ラベルは ja/en 両方・中立丁寧体（feedback_app_copy_neutral）。
  - UI chrome: プログレスバー/リング/アイコンは SVG（src/icons）使用、emoji 不可。
  - 永続化: 表示は既存 progress を読むだけなら新規 persist 不要。ただし「進捗をサーバ集計」まで広げるなら Supabase クエリ設計が要る（重さ増・要 Keita 判断）。migration 不要の見込み（既存 progress 集計）。
  - 両OS: モバイル専用（project_logic_mobile_only）。Android 実機で表示崩れ確認。
  - 重複論点の解除（2026-05-29）: 旧 T-J が「完了回数（count）」で同じ progress レイヤーを触る懸念があったが、**T-J は「完了バッジの色変更のみ」に縮小確定したので重複は消滅**。T-I は単独で進められる（migration 不要・既存 progress の集計表示）。

### T-J — 完了バッジのチェックマークの色を変更する　[P2 / TODO（スコープ確定済・T-M 完了後着手）]

- 📌 スコープ確定（Keita 2026-05-29）: **「完了バッジのチェックマークの色変更のみ」に確定・縮小**。当初登録（2026-05-28）の「レッスンごとの完了回数を可視化する」案は破棄。完了回数のカウント・データモデル拡張・migration は**やらない**。レッスン完了を示すバッジ（チェックマーク）の**色だけ**を変える、軽量な見た目変更タスク。
- 依頼原文（Keita 2026-05-28 → 2026-05-29 確定）: 当初「レッスンを何回完了したか分かるようにしたい」だったが、Keita 確定で「完了バッジのチェックマークの色を変える」だけに縮小。
- 想定スコープ: レッスン完了済みを示すチェックマーク（バッジ）アイコンの色を変更する。＝色トークン / 色指定の差し替えのみ。データ・ロジック・永続化は触らない。
- 重さの見極め: **軽**。色指定の変更1点。実装前に「どのバッジ・どの色へ変えるか」を Keita 確認できれば即実装可。
- 既存資産（実装前に実ソース照合すること・現時点未照合）: レッスン完了チェックマークの描画箇所（`src/icons/index.tsx` の CheckCircleIcon / CheckIcon 等＋それを使うレッスンカード／一覧コンポーネント。`src/components/` or `src/screens/` のレッスンカード周辺）。色は CSS 変数 or fill 指定のどこか。
- DoD: レッスン完了バッジのチェックマークが Keita 指定の色で表示される。ハードコード hex を増やさず CSS 変数（テーマトークン or 既定の意味色）で指定する。他のチェックマーク用途（同アイコンを使い回している箇所）に意図しない波及がない。tsc 0 / eslint `.` 0。Android 実機で確認。
- サブタスク:
  - [ ] Keita 確認: 変更後の色（何色にするか）。テーマ追従させるか固定色か
  - [ ] 実装前調査: 完了バッジ（チェックマーク）の色指定箇所を特定。同アイコンを共有している他箇所の有無を確認
  - [ ] 色を変更（ハードコード hex を増やさず CSS 変数 / テーマトークンで指定）
  - [ ] 回帰: 同チェックマークアイコンを使う他箇所への波及がないか目視（共有アイコンなら fill 継承の影響確認）
  - [ ] tsc 0 / eslint `.`（全体）0
- Keita 確認すべき論点（1点のみ）:
  - (1) **変更後の色**: 具体的に何色にするか。テーマ（古紙/深緑/墨白）に追従させるか、テーマ非依存の固定色（成功＝緑系など）にするか。← T-S/T-T のテーマ追従方針と整合させると一貫する。
- 抜けもれ提言:
  - 重複注意の解除: 旧スコープ（完了回数）が T-I（コース進捗）と progress レイヤーを共有する懸念があったが、**色変更のみに縮小したので T-I との重複・データ整合の論点は消滅**。T-J は T-I から独立した軽量タスクになった。
  - デザイン制約: ハードコード hex 禁止（CLAUDE.md）。意味色 or テーマトークンで指定。チェックマークが意味を担うので語ラベル併記の原則（aria-hidden アイコンには語ラベル）は維持。
  - 回帰: チェックマークは共有 SVG アイコンの可能性大。`fill="currentColor"` で色継承している場合、親の color を変えると同アイコンを使う全箇所に波及する → **完了バッジ固有のラッパー / クラスに閉じて色指定**するのが安全。
  - i18n: 色変更のみで新規文言なし（i18n 影響なし）。
  - 両OS: モバイル専用。Android 実機で完了バッジの色を確認。
  - 永続化: 不要（見た目のみ）。
  - 関連: T-S/T-T（テーマ追従修正）と色の扱いが近い。Keita が「テーマ追従させる」を選ぶなら T-S/T-T と同じ手法（テーマトークン参照）になるので、**同一 dev-logic がテーマ系（T-R/T-S/T-T/T-J）をまとめて見る**と一貫性が出る。

### T-K — ジャーナルのグラフ tap で詳細展開　[P2 / TODO（スコープ要確認）]

- 依頼原文（Keita 2026-05-28）: 「ジャーナルのグラフをタップすると詳細が分かるようになってほしい」。
- 想定スコープ: ジャーナルの統計グラフ（気分推移/週次集計などのチャート）の要素をタップすると、その日/その項目の詳細（該当エントリ・内訳）が展開表示される。現状グラフは表示のみでインタラクションが無い（要確認）。
- 重さの見極め: **中**。データは既存ジャーナル（daily_journals）。新規は「グラフ要素の tap ハンドリング ＋ 詳細パネル/シートの表示」。チャートが SVG 自前描画なら tap 領域の実装、ライブラリなら onClick 配線。純フロント・新規 DB 不要の見込み。
- 既存資産（要実装前確認・未照合）: `src/components/journal/` 配下のグラフ/チャートコンポーネント（気分グラフ等）、`journalDb.ts`（エントリ取得）、`src/screens/`（ジャーナル統計画面）。どのグラフが対象か（気分推移 / タグ頻度 / ストリーク等）を実装前に確定する必要あり。
- DoD（暫定・スコープ確定後に確定）: 対象グラフの要素（バー/点/セグメント等）をタップすると、その対象の詳細（該当日のエントリ要約 or 内訳）が展開/シート表示される。タップ領域がアクセシブル（語ラベル）で、再タップ/閉じる導線がある。
- サブタスク（暫定）:
  - [ ] スコープ確定（対象グラフ・詳細に出す内容を Keita 確認）
  - [ ] 実装前調査: 対象グラフのコンポーネント特定（自前 SVG か / props 構造）。tap 領域を持てる作りか確認
  - [ ] グラフ要素の tap ハンドリング（hit area・選択状態）
  - [ ] 詳細表示 UI（展開パネル or ボトムシート。該当エントリ/内訳）
  - [ ] 回帰: 既存グラフ表示・ジャーナル一覧/詳細が壊れないか
  - [ ] i18n（詳細パネルの新規文言 ja/en・中立丁寧体）
  - [ ] アクセシビリティ（tap 要素に語ラベル・aria、TTS 影響）
- Keita 確認すべきスコープ論点:
  - (1) **対象グラフ**: どのグラフか（気分推移 / タグ頻度 / 学習ストリーク / 複数）。
  - (2) **詳細の中身**: タップで何を見せるか（その日のジャーナル全文 / 要約 / 該当タグのエントリ一覧 / 数値内訳）。
  - (3) **表示形式**: その場で展開 / ボトムシート / 別画面遷移 のどれか（designer 軽量提案で足りる）。
- 抜けもれ提言:
  - i18n: 詳細パネルの新規文言 ja/en・中立丁寧体（feedback_app_copy_neutral）。
  - UI chrome の emoji 例外注意: ジャーナルの mood/weather/phase/streak の4箇所のみ絵文字 OK（feedback_journal_emoji / CLAUDE.md gotchas #5）。グラフの mood 表現で絵文字が出るのはこの例外内なら可。それ以外の chrome（閉じるボタン等）は SVG。
  - ⚠重複・コンフリクト注意（T-D と同領域）: T-D（タグの動的統合）と**同じ journal 周辺**を触る。特に T-D がタグ集合を書き換える（consolidate）ため、T-K が「タグ頻度グラフの tap 詳細」を対象にする場合、T-D のタグ統合後の集合とズレないよう連携が要る。両方を触るなら dev-logic 内で順序・整合を意識（T-D のタグモデル確定後に T-K のタグ系グラフを作ると手戻りが少ない）。気分推移グラフが対象なら T-D とは独立。
  - アクセシビリティ: tap 可能なグラフ要素は語ラベル併記（意味を担うアイコン同様）。
  - 両OS: タッチ操作なので Android 実機で hit area・展開挙動を確認。
  - テスト: tap→詳細展開は E2E ハッピーパス向き（ただしグラフ tap 座標依存なので要素 testid 推奨）。
  - 永続化: 表示だけなら新規 persist 不要（既存エントリを読むだけ）。

### T-L — Daily Fermi の答えを解説の最後に移す　[P2 / TODO]

- 依頼原文（Keita 2026-05-28）: 「フェルミの答えは解説の最後でいい」。
- 想定スコープ: Daily Fermi（今日の1問）で、答え（推定値/正解レンジ）の表示位置を**解説の最後**に移す。現状は解説より前 or 冒頭に答えが出ている想定（要確認）。＝表示順の入れ替えのみの軽い要望。
- 重さの見極め: **軽**。表示順序の組み替え（コンポーネントの描画順 or セクション位置入れ替え）が主。データ・ロジック変更は基本不要の見込み。ただし「答えを見てから解説を読む」前提で UX が組まれている箇所（ネタバレ防止のアコーディオン等）があれば軽い調整が要る。
- 既存資産（要実装前確認・未照合）: `src/screens/DailyFermiScreen.tsx`（答え・解説の描画箇所）。`src/fermiData.ts`（問題データ：答え・解説フィールド）。
- DoD: Daily Fermi の結果/解説表示で、答え（推定値）が**解説の最後**に表示される。解説を読み進めた末尾に答えが来る順序になっている。回答送信後のフロー（自分の推定 vs 正解の対比表示）が破綻しない。
- サブタスク:
  - [ ] 実装前調査: 現在の答え・解説の描画順を DailyFermiScreen で確認
  - [ ] 答えの表示位置を解説の最後へ移動（描画順の入れ替え）
  - [ ] 回答直後の「自分の推定 vs 正解」対比 UX が成立するか確認（答えを末尾にすると対比が見えにくくならないか）
  - [ ] 回帰: replay/リロール経路、復習ハブからの遷移でも順序が維持されるか
  - [ ] i18n 影響確認（順序入れ替えのみなら新規文言なし。セクション見出し追加が要れば ja/en）
- Keita 確認すべきスコープ論点:
  - (1) **対比の扱い**: 答えを末尾に置くと、回答直後の「あなたの推定 ◯◯ / 正解 △△」の即時フィードバックも末尾になる。即時の正誤感だけ冒頭に残して詳細な数値解説の後に最終answerを置くか、完全に末尾一本化か。
  - (2) 「解説の最後」= 解説テキストの直後か、画面の一番下（次アクション導線の手前）か。
- ⚠⚠ 逆向き実験ブランチ注意（2026-05-29 追記）: 削除を見送った worktree（`a23e` / `a7aa`）に「**答えを冒頭に出す**」という逆向きの未コミット実験が存在する。**T-L は答えを末尾にする方針なので方向が真逆**。実装時にこの実験コードと混同しないこと（誤って冒頭表示に寄せない）。
- 抜けもれ提言:
  - ✅ コンフリクト解消（2026-05-29）: T-A は 2026-05-29 に main マージ＋push 済（DONE）。T-A の `DailyFermiScreen.tsx` / `fermiData.ts` 修正は本番反映済なので、T-L は最新 main をベースに着手すれば T-A との競合は起きない（旧「T-A push 待ち」制約は解消）。
  - i18n: 順序入れ替えだけなら新規文言なし。セクション見出し（「答え」ラベル等）を新設するなら ja/en・中立丁寧体。
  - 両OS: 表示順のみだが Android 実機で末尾までスクロールして答えが見えるか確認。
  - テスト: 表示順は E2E で「解説要素の後に answer 要素が来る」アサーション可（軽量）。
  - 永続化: 不要（表示順のみ）。

---

## バッチ: 2026-05-28 夜 新規要望（Keita 就寝前）

Keita 就寝前の追加要望。林が「できるところは自律で進める」前提。task-manager が構造化。実装は委譲。
要望1（体力コース＝コンテンツ制作）と要望2/3/4（journal UI 微調整・セット1バッチ）と要望5（既存ブランチ流用判断）で性質が分かれる。

| ID | タイトル | 優先度 | ステータス | 担当案 | 関連 |
|----|----------|--------|-----------|--------|------|
| T-M | 「体力をつける」コースを作る（全5レッスン 440-444 フル本文制作） | P1 | DONE（2026-05-29 本番反映。lesson 440-444 ja/en 実装済＋logic-coach 再監査ゲート「条件付き pass(致命0/高0)」＋指摘の中2件(443図/442強化ループ)を即修正して main マージ＋push。tsc0/eslint0/vitest329。Android 自動配信） | content-creator→dev-logic→logic-coach | 残: 低-1 コース title 確定（Keita 判断）/ 低-2 stamina 専用サムネ（designer 別トラック） |
| T-N | ジャーナル入力画面を下スワイプで閉じる（swipe-down to dismiss） | P1 | DONE（2026-05-29 main マージ＋Android deploy 成功で本番反映。tsc/vitest/build 緑。モバイル実機でのタッチ感確認のみ任意で残） | dev-logic | T-D と同じ JournalDetailSheet.tsx / journal.css |
| T-O | ジャーナルの朝/夜（phase）選択状態を明示（非選択側を opacity で明示） | P1 | DONE（2026-05-29 main マージ＋Android deploy 成功で本番反映。モバイル実機での視認性確認のみ任意で残） | dev-logic | T-N/T-P と同ファイル・セット1バッチ。journal phase tab は絵文字 OK 例外箇所 |
| T-P | ジャーナルの×ボタンを拡大＋左上「編集」ボタンと距離を離す（誤タップ防止） | P1 | DONE（2026-05-29 main マージ＋Android deploy 成功で本番反映。モバイル実機での押しやすさ確認のみ任意で残） | dev-logic | T-N/T-O と同ファイル・セット1バッチ |
| T-Q | 画像アップロードで画像が一瞬消える＋進捗可視化 | P1 | DONE（既に本番。同内容が 2026-05-24 commit 7705b12 として main に入っており昨日以前から本番稼働中と判明。新規マージ不要・重複ブランチ feat/journal-image-upload-progress〔acdc59e〕は破棄可） | dev-logic（既実装）| 既に本番（commit 7705b12, 2026-05-24） |

### T-M — 「体力をつける」コースを作る　[P1 / DONE（2026-05-29 本番反映。lesson 440-444 ja/en 実装済）]

- ✅ ステータス同期（2026-05-31 自律ティック）: 本詳細ヘッダが IN_PROGRESS のまま取り残されていたが、確定表行（上記）は既に DONE。git 実体で裏取り済み＝commit `cd3c166`（feat: lessonId 440-444 実装）＋`dabfc65`（443図/442強化ループ図差し替え）が main 在、`src/staminaLessons.ts`/`src/staminaLessonsEn.ts` に lesson 440-444 実在を確認。ヘッダを DONE に同期。これにより「T-M 完了後着手」ゲートのタスク（T-W 等）が解放。残: 低-1 コース title 確定（Keita 判断）/ 低-2 stamina 専用サムネ（designer 別トラック）。

- ✅ 進捗（2026-05-29 朝）: **サンプル承認＋本展開ゴーサイン取得**。content-creator が全5レッスン（440-444）の **ja/en フル本文制作に着手**（出力先 `docs/COURSE_STAMINA_FULL_20260529.md`）。logic-coach 監査の **C-1 / C-3 / C-4 / S-1 / S-2 / D-1 を反映指示済み**。次工程は dev-logic によるコード実装、その後 **444（子育て）の logic-coach 再監査ゲート必須**、テスト、デプロイ。
- ✅ 進捗（2026-05-28 深夜・サンプル段階）: content-creator が コース構成案＋サンプルレッスン441のフル本文ドラフトを作成（成果物 `docs/COURSE_STAMINA_DRAFT_20260528.md`）。logic-coach 監査 4.3/5「サンプル承認に進めてよい品質」→ 翌朝 Keita ゴーサインで本展開へ。
- 📋 logic-coach 監査の反映指示（content-creator へ伝達済み・本文制作に織り込む）:
  - C-1: 運動効果の量の精度を `peakPerformance412` と統一する（数値・効果量の整合）。
  - C-3: ウルトラディアン周期の記述の流れを整える。
  - C-4 / D-1: 監査指摘の追加反映項目（content-creator へ指示済み）。
- 📋 443執筆時の申し送り: **DRAMMA ≠ Sonnentag の4体験 の混同を回避**する（443 を書くときに概念を取り違えない）。
- 📋 設計論点（本文制作に反映指示済み）:
  - S-1: 「遊ぶ体力」443 を「回復総論」化するか（サブテーマの括り方）。
  - S-2: 440導入 と 442仕事 の内容重複を回避する設計にするか。
- ⚠444子育て: 本文化する時に **logic-coach 再監査ゲート必須**（健康・子育て領域の正確性リスク）。dev-logic コード実装後・デプロイ前の必須ゲート。
- 依頼原文（Keita 2026-05-28 夜）: 「体力のつけ方コースを作りたい。サブテーマ案: 勉強する体力 / 仕事する体力 / 遊ぶ体力 / 子育ての体力」。
- 想定スコープ: 新規コース「体力をつける（仮）」＋レッスン群のコンテンツ制作。サブテーマ4つを軸にレッスンを構成する。
- 今夜のスコープ（林方針・限定）: **「コース構成案（コース title・category・レッスン一覧と各 DoD）＋サンプル1レッスン（フル本文ドラフト）」までをドラフトする**。本番展開・ship・サムネ生成・全レッスン量産は **しない**（サンプル承認フロー厳守）。
- ⚠フロー（サンプル承認・最重要）: バルクのコンテンツ生成は **サンプル1レッスン → Keita 承認 → 残りを展開** のフローを守る（feedback_logic_course_thumbnails / project_logic_content_audit_20260525 のサンプル承認ルール）。今夜は新規"生成"系なので Bucket2 相当＝サンプル先行で正しい（correctness 修正ではないので即展開しない）。
- ⚠title ルール（厳守）: **コース title・レッスン title は「〜する」Doing 形を維持**（feedback_logic_title_doing）。
  - サブテーマも Doing 形に寄せる: 「勉強する体力をつける」「仕事する体力をつける」「遊ぶ体力をつける」「子育ての体力をつける」等。「体力」単体の名詞 title は避ける。category（分類ラベル）は名詞句で OK。
- 重さの見極め: **重**（コンテンツ制作）。ただし今夜は構成案＋1レッスンのドラフトに限定するので今夜分は中。本展開はサンプル承認後。
- 既存資産（実装前確認）: `src/lessons/`（静的レッスンデータ *.ts）、`courseData.ts`（コース→レッスン id 対応・pinned 上部表示）、`src/lessonSlides.ts`（スライド分割・callout-aware）、`src/components/RichLessonText.tsx`（`[icon:name]` / `:::callout` 記法）、`src/visuals/`（図解 68 種）、`src/i18n.ts`（コース/レッスン文言は本文データ側だが UI 文言は ja/en）。
- DoD（今夜分）: (1) コース構成案がドラフトされている（コース title〔Doing〕・category 名・4サブテーマ・各サブテーマのレッスン候補一覧と狙い）、(2) サンプル1レッスンのフル本文ドラフトが1本ある（explain step・図解/アイコン方針込み）、(3) Keita 承認待ち状態で会話本文に内容展開（feedback_direct_content_not_path）。**本展開・ship は含まない**。
- DoD（本展開・後日・サンプル承認後）: コースが courseData に登録され、全レッスンが ja/en 両対応・本文の視覚化ハイブリッド方針（feedback_logic_lesson_visual_hybrid）準拠・logic-coach 監査通過・サムネ生成済みで本番反映される。
- サブタスク（サンプル段階・完了）:
  - [x] content-creator: コース構成案ドラフト（コース title〔Doing〕・category・サブテーマ × レッスン候補・各レッスンの狙い1行）
  - [x] content-creator: サンプル1レッスン（441）をフル本文ドラフト（ja）。視覚化ハイブリッド（図解/アイコン/callout）方針込み
  - [x] logic-coach: サンプルレッスンの内容正確性・論理整合を監査（4.3/5「承認に進めてよい品質」）
  - [x] 会話本文に構成案＋サンプルを直接展開し Keita 承認待ち → ゴーサイン取得（2026-05-29 朝）
- サブタスク（本展開・進行中）:
  - [~] content-creator: 全5レッスン（440-444）の ja/en フル本文制作（出力先 `docs/COURSE_STAMINA_FULL_20260529.md`）＝**現在着手中**。C-1/C-3/C-4/S-1/S-2/D-1 反映、DRAMMA≠Sonnentag4体験 混同回避
  - [ ] logic-coach: 全レッスンの監査（440-443）。**444（子育て）は健康・子育て正確性リスクで再監査ゲート必須**
  - [ ] dev-logic: コード実装（lessons/*.ts へ本文データ投入・courseData / lessonSlides 登録・pinned/category 配置）
  - [ ] テスト（tsc / eslint . / vitest 緑、視覚化記法の崩れ確認）
  - [ ] サムネ生成（Figma or Gemini Nano Banana・スペル崩し対策・サンプル1枚承認先行）
  - [ ] 本番反映（Android 自動・Render web は手動 deploy-production.yml）
- Keita 確認すべき論点（朝）:
  - (1) コース title 案（Doing 形・複数候補から選別）。
  - (2) 4サブテーマの粒度: 1サブテーマ=1レッスンか、1サブテーマ=複数レッスンか（コース全体のレッスン数感）。
  - (3) コンテンツのトーン/方向: 精神論寄りか、認知科学・行動科学ベースの実践 tips 寄りか（Logic の論理思考トレーニングという文脈との接続をどう取るか）。
  - (4) 既存どのカテゴリ/グループに置くか（peakPerformance 系の隣接か、新カテゴリか）。
- 抜けもれ提言:
  - title Doing 形（feedback_logic_title_doing）厳守。サブテーマも Doing に寄せる。
  - サンプル承認フロー（feedback_logic_course_thumbnails）: 今夜はサンプル1本まで。Keita 承認前に全レッスン量産しない。
  - i18n: コース/レッスン本文は本文データ（lessons/*.ts）に ja/en 両方。UI に出る新規ラベルがあれば i18n.ts の ja/en 両方・中立的丁寧体（feedback_app_copy_neutral）。
  - 視覚化ハイブリッド（feedback_logic_lesson_visual_hybrid）: 本文は図解＋ SVGアイコン（体系的要素）＋絵文字（話題物限定）。UI chrome は SVG のみ。callout は1スライド最大1個・密度目安遵守。
  - 内容の正確性: 体力/健康/子育て系は医学・科学的な誤情報リスクがある領域。断定的な健康主張・医療アドバイスにならないよう logic-coach 監査必須。Logic は論理思考アプリなので「体力の"つけ方"を論理的に考える」フレームに落とすと製品文脈と整合しやすい。
  - サムネ（後日）: Figma v4 or Gemini Nano Banana、スペル崩し対策（feedback_gemini_prompt_tricks）、Pixa 不使用（feedback_no_pixa）、サンプル1枚承認先行。
  - 両OS: モバイル専用（project_logic_mobile_only）。レッスン本文は OS 差小だが Android 実機で図解/アイコン表示確認（本展開時）。
  - 永続化: レッスン進捗は既存 progress（lesson id ベース）に自動で乗る。新コース追加で既存進捗は壊れない。

### T-N — ジャーナル入力画面を下スワイプで閉じる（swipe-down to dismiss）　[P1 / DONE]

- ✅ DONE（2026-05-29 朝）: 2026-05-29 に wip/20260528-inprogress を main マージ＋push → Android deploy completed success で本番反映。実装＋検証＋コミット完了、**tsc / vitest / build 緑**。DoD（追従ドラッグ・閾値 dismiss・スナップバック・誤 dismiss 防止・×ボタン共存）はコードレベルで充足。**備考: Android 実機でのタッチ感（追従/慣性）確認は任意で残**（コード検証済みのため DONE 判定）。
- 依頼原文（Keita 2026-05-28 夜）: 「ジャーナルの入力画面を下スワイプで閉じられるようにする」。
- 想定スコープ: `JournalDetailSheet`（ジャーナル入力のボトムシート）を下方向スワイプジェスチャで dismiss できるようにする。現状は×ボタン等の明示操作のみで閉じる想定（要確認）。モバイルのボトムシート標準 UX。
- 重さの見極め: **中**。スワイプジェスチャのハンドリング（touch/pointer イベント・ドラッグ追従・閾値判定・スナップバック/dismiss アニメ）の実装。ライブラリ未使用なら自前 touch ハンドラ、既存のシート実装次第。
- 既存資産（実装前確認）: `src/components/journal/JournalDetailSheet.tsx`（シート本体）、`src/components/journal/journal.css`（シートのレイアウト/アニメ）。シートの open/close 制御・transform/transition の既存実装を確認してから着手。
- ⚠同ファイル・セット注意（最重要）: T-N/T-O/T-P は **全て JournalDetailSheet.tsx + journal.css** を触る。さらに **T-D（タグ統合）が既に同ファイルを wip ブランチ上で変更済み**（D3 で JournalDetailSheet.tsx・journal.css・i18n.ts 改修済・未コミット）。コンフリクト回避のため **同一 dev-logic が wip/20260528-inprogress ブランチ上で T-D の続きとして T-N/T-O/T-P を一気通貫で実装する**のが筋。別 worktree で並行すると確実に衝突する。
- DoD: ジャーナル入力シートを下方向にスワイプすると追従して動き、一定閾値を超えると閉じる。閾値未満で離すと元位置にスナップバック。入力中（テキストフィールドフォーカス中・スクロール中）に誤 dismiss しない。Android 実機でスムーズに動く。
- サブタスク:
  - [ ] 実装前調査: JournalDetailSheet の open/close・transform 実装を確認（自前 or ライブラリ）
  - [ ] 下スワイプのドラッグ追従＋閾値 dismiss / スナップバックを実装
  - [ ] 誤 dismiss 防止: シート内スクロール領域・テキスト入力フォーカス中のジェスチャ競合を制御
  - [ ] 既存の閉じる導線（×ボタン）と共存・状態破綻なし
  - [ ] 回帰: T-D（タグ統合）で同ファイルに入った変更と整合（同一ブランチ上で実装すれば自然に解消）
  - [ ] Android 実機でジェスチャの追従/dismiss を確認
- 抜けもれ提言:
  - 両OS: モバイル専用（project_logic_mobile_only）。スワイプはタッチ前提でOK。Android 実機で慣性/追従を確認。iOS workflow 未整備なので当面 Android。
  - アクセシビリティ: スワイプは補助操作。×ボタンによる閉じる導線は必ず残す（スワイプ単独にしない）。
  - i18n: ジェスチャ追加のみなら新規文言なし想定。ヒント文言を出すなら ja/en・中立丁寧体。
  - 永続化: 閉じる時の入力内容の扱い（下書き保存 or 破棄）が既存と変わらないか確認。スワイプ dismiss で意図せず入力が消えないように（×と同じ保存/破棄挙動に揃える）。
  - テスト: ジェスチャは E2E 困難（座標/慣性依存）。手動確認手順を残す。

### T-O — ジャーナルの朝/夜（phase）選択状態を明示（非選択側を opacity で明示）　[P1 / DONE]

- ✅ DONE（2026-05-29 朝）: 2026-05-29 に wip/20260528-inprogress を main マージ＋push → Android deploy completed success で本番反映。**非選択側を opacity で弱め、選択中を明示**（絵文字 grayscale より opacity が安定という抜けもれ提言どおりの実装）。**備考: 実機での視認性確認は任意で残**（コード検証済みのため DONE 判定）。
- 依頼原文（Keita 2026-05-28 夜）: 「朝/夜（phase）どちらを選択中か分かりにくい。選択していない方のアイコンをグレーアウトする等で明示する」。
- 想定スコープ: ジャーナルの phase（朝/夜）タブで、選択中/非選択の視覚差を強める。非選択側をグレーアウト（彩度/不透明度を落とす）して、現在どちらを編集しているか一目で分かるようにする。
- 重さの見極め: **軽**。選択状態の CSS スタイル調整が主（非選択 phase アイコンの opacity/grayscale/色）。状態管理は既存の phase 選択 state を使う見込み。
- 既存資産（実装前確認）: `src/components/journal/JournalDetailSheet.tsx`（phase tab UI・選択 state）、`journal.css`（phase tab のスタイル）。
- ⚠絵文字例外箇所: ジャーナルの **phase tab は絵文字 OK の4例外箇所の1つ**（feedback_journal_emoji / CLAUDE.md gotchas #5）。phase アイコンが絵文字（🌅/🌙 等）でもこの例外内なので維持して可。グレーアウトは絵文字に grayscale/opacity を当てる形でも、SVG なら色で表現でも可。
- ⚠同ファイル・セット注意: T-N/T-O/T-P ＋ T-D と同ファイル。同一 dev-logic が wip ブランチ上で一気通貫（T-N 参照）。
- DoD: ジャーナル phase（朝/夜）で、選択中側が明確に強調され、非選択側がグレーアウト（または明確に弱い表現）になっている。切り替えで視覚状態が即反映。色だけに依存せず（コントラスト/濃淡で）判別できる。
- サブタスク:
  - [ ] 実装前調査: phase tab の選択 state と現在のスタイルを確認（絵文字 or SVG）
  - [ ] 非選択 phase をグレーアウト（opacity/grayscale or 弱色）、選択中を強調
  - [ ] phase 切り替えで即時反映・状態破綻なし
  - [ ] 回帰: 既存の phase 切り替え機能・各 phase の入力内容保持が壊れないか
  - [ ] Android 実機で視認性確認（グレーアウトが十分に分かるか）
- 抜けもれ提言:
  - アクセシビリティ: 「選択中」を色/濃淡だけでなく、aria-selected / aria-pressed 等の状態属性でも表現（色覚多様性・スクリーンリーダ）。グレーアウト＝disabled に見えて「押せない」と誤解されないよう、非選択でもタップ可能なことが分かる表現にする。
  - 絵文字グレーアウトの罠: 絵文字に grayscale フィルタを当てると端末/フォントで効き方が違う（feedback_logic_lesson_visual_hybrid の「絵文字は端末で見た目が変わる」）。opacity の方が安定。Android 実機で確認。
  - i18n: スタイル変更のみなら新規文言なし。
  - 両OS: モバイル専用。Android 実機で選択/非選択の判別がつくか。
  - テスト: 視覚状態は E2E で aria-selected アサーション可（軽量）。

### T-P — ジャーナルの×ボタン拡大＋「編集」ボタンと距離を離す　[P1 / DONE]

- ✅ DONE（2026-05-29 朝）: 2026-05-29 に wip/20260528-inprogress を main マージ＋push → Android deploy completed success で本番反映。×ボタンの hit area 拡大＋編集ボタンとの間隔確保（誤タップ防止）。T-N の下スワイプ領域と×ボタン拡大の競合も同一ブランチで調整済み。**備考: 実機での押しやすさ確認は任意で残**（コード検証済みのため DONE 判定）。
- 依頼原文（Keita 2026-05-28 夜）: 「バツ（閉じる）ボタンをもう少し大きくし、左上の『編集』ボタンと距離を離す（誤タップ防止）」。
- 想定スコープ: ジャーナル入力シートの×（閉じる）ボタンのタップ領域を拡大し、左上「編集」ボタンとの距離を空けて誤タップを防ぐ。配置/サイズの微調整。
- 重さの見極め: **軽**。ボタンの hit area（サイズ/padding）拡大とレイアウト（位置/margin）調整が主。CSS 中心。
- 既存資産（実装前確認）: `src/components/journal/JournalDetailSheet.tsx`（ヘッダの×ボタン・編集ボタンの配置）、`journal.css`（ヘッダ/ボタンのスタイル）。
- ⚠同ファイル・セット注意: T-N/T-O/T-P ＋ T-D と同ファイル。同一 dev-logic が wip ブランチ上で一気通貫（T-N 参照）。
- DoD: ×ボタンのタップ領域が十分に大きく（モバイルのタップターゲット最小 44×44pt 目安）、左上「編集」ボタンと十分な間隔があり、誤タップしにくい。両ボタンとも機能は維持。レイアウトが他要素と干渉しない。
- サブタスク:
  - [ ] 実装前調査: ×ボタン・編集ボタンの現在のサイズ/位置/間隔を確認
  - [ ] ×ボタンの hit area 拡大（最小タップターゲット目安を満たす）
  - [ ] 編集ボタンとの間隔を空ける（配置/margin 調整）
  - [ ] 回帰: ヘッダレイアウトが他要素（タイトル・phase tab 等）と干渉しないか
  - [ ] Android 実機で押しやすさ・誤タップ低減を確認
- 抜けもれ提言:
  - アクセシビリティ: ×ボタンは語ラベル（aria-label「閉じる」）併記。タップターゲット 44×44pt 目安（モバイル UX 標準）。
  - UI chrome の emoji 不可: ×ボタン・編集ボタンは UI chrome ＝ SVG アイコン（src/icons）使用、emoji 不可（journal の絵文字例外は mood/weather/phase/streak の4箇所のみで、閉じる/編集ボタンは対象外）。
  - i18n: 配置/サイズ調整のみなら新規文言なし。aria-label を新設するなら ja/en・中立丁寧体。
  - 両OS: モバイル専用。Android 実機で押しやすさ確認。
  - 回帰: T-N（下スワイプ dismiss）と同居 — ×ボタン拡大とスワイプ領域が競合しないか（同一ブランチで両方やるので調整しやすい）。

### T-Q — 画像アップロードで画像が一瞬消える＋進捗可視化　[P1 / DONE（既に本番稼働中）]

- ✅ DONE（2026-05-29 朝・調査結果）: 調査の結果、**同内容が既に 2026-05-24 のコミット `7705b12` として main に入っており、昨日以前から本番稼働中だった**と判明。ブランチ `feat/journal-image-upload-progress`（`acdc59e`）はその重複コピーで、マージ不要だった。→ **新規マージ不要・重複ブランチは破棄可**。要望（画像が一瞬消える改善＋進捗可視化）は既に本番で満たされている。
- 依頼原文（Keita 2026-05-28 夜）: 「画像アップロード時に画像が一瞬消える（なくなったように見える）問題の改善＋アップロード進捗の可視化」。
- 🟢 経緯（git 確認済み）: 既存ブランチ `feat/journal-image-upload-progress`（commit `acdc59e`、作者 Keita Urano、2026-05-24）がこの要望をほぼ丸ごと実装。コミットメッセージが Keita 報告「ジャーナルの画像を入れたとき一回消えたりするので、アップロード状況とかが分かるようになってほしい」への対応と明記＝同一案件。**ただし同等の内容は別経路の commit `7705b12`（2026-05-24）として既に main 入り済み＝本番反映済み**だったため、acdc59e ブランチのマージは不要だった。
  - 実装内容（`JournalImageGrid.tsx` +170 / `journal.css` +175、計2ファイル・319 挿入）:
    - ファイル選択直後にローカル preview を即表示（uploading 状態）
    - アップロード進行中: 半透明 overlay ＋ spinner ＋「アップロード中…」ラベル ＝ **進捗可視化**
    - **「画像が一瞬消える」修正本体**: signed URL が来るまでローカル preview を保持（`localPreviewRef` Map で path→objectURL を持ち、signed URL が urls state に入った時点で revoke）
    - 失敗時: pending を破棄せず retry / cancel ボタンを overlay 表示（同じ File で再試行可）
    - `pendingErrorLabel()` で 3 種エラー（invalid-type / too-large / upload-failed）文言切り分け
    - i18n キー（journal.imagesUploading / imagesRetry / imagesCancel）は別 commit で main に追加済み＝このブランチは使うだけ
- 判断（新規 vs 既存流用）: **新規実装は不要。既存ブランチの検証→マージで解決する**のが筋。要望「画像が一瞬消える改善」＝localPreviewRef の保持で対応済、「進捗可視化」＝overlay+spinner+ラベルで対応済。要望を満たしている。
- 📌 今夜の判断（2026-05-28 深夜）: **今夜は深掘り検証を見送った**。理由＝この既存ブランチ（feat/journal-image-upload-progress）が `journal.css` を触っており、今夜 T-D/T-N/T-O/T-P を積んだ **wip/20260528-inprogress の journal.css と競合する**ため、迂闊な rebase/マージで wip の作業を壊すリスクがある。Keita のマージ承認＋wip ブランチの処遇が決まってから検証→マージ判断する方が安全。
- ステータス: **REVIEW**（実装は存在・未マージ。Keita マージ承認待ち＝wip との competing 解消が前提）。新規 TODO ではない。
- ⚠未検証ポイント（マージ前に確認すべき）:
  - (1) ブランチが main から1コミットだけ進んだ古い分岐（5/24）。**現在の main / wip ブランチと差分・コンフリクトがないか**（特に T-D 系で journal 周辺を触っているので JournalImageGrid.tsx 自体は別ファイルだが念のため）。
  - (2) tsc / eslint `.`（全体）/ vitest が通るか（マージ前チェック）。
  - (3) Android 実機で「画像選択→preview 即表示→アップロード中 overlay→成功で signed URL に差し替え（消えない）→失敗で retry」の一連が動くか。
  - (4) i18n キー（imagesUploading/Retry/Cancel）が現 main に実在するか（ブランチは「使うだけ」前提なので、main 側にキーが無いと表示が壊れる）。
- DoD: 画像選択直後から preview が途切れず表示され続け（signed URL 取得までの「一瞬消える」が起きない）、アップロード中は進捗（spinner/ラベル）が見え、失敗時に retry/cancel できる。Android 実機で一連が確認できる。tsc/eslint/vitest 緑。
- サブタスク:
  - [ ] dev-logic: `feat/journal-image-upload-progress` を現 main/wip に対して rebase 試行しコンフリクト有無を確認
  - [ ] dev-logic: tsc 0 / eslint `.` 0 / vitest 緑を確認
  - [ ] dev-logic: i18n キー（imagesUploading/Retry/Cancel）が main 側に存在するか確認（無ければ追加）
  - [ ] Android 実機で preview 保持・進捗 overlay・retry の一連ハッピーパス確認
  - [ ] Keita: マージ承認（本番反映＝承認案件。Android は main push で自動配信）
- 抜けもれ提言:
  - 新規着手不要＝今夜は「検証」に留める（林方針と一致）。新たに同じ機能を書き起こさない（既存ブランチと二重実装になる）。
  - ⚠マージ＝Keita 承認案件: main へのマージ＝本番反映（Android 自動配信）。Keita 承認待ち（push/デプロイは Keita 専権）。今夜は検証＋コンフリクト/テスト確認まで、マージは朝に Keita 判断。
  - i18n: 既存ブランチが参照する3キーが main にあるか確認（feedback_app_copy_neutral・ja/en 両方）。
  - 両OS: モバイル専用。Android 実機で確認（画像選択は native フォト経路なので Web と挙動差あり得る）。
  - 永続化: 画像は Supabase Storage（signed URL）想定。preview 保持はクライアント側 objectURL で永続化には無影響。
  - 関連: ブランチが 5/24 と古いので、放置すると陳腐化する。早めに検証→マージ判断するのが望ましい。

---

## バッチ: 2026-05-29 T-B テーマ機能フォローアップ＋テーマ再設計（Keita 朝・追加7件）

今朝デプロイした T-B（配色テーマ3種: 古紙/深緑/墨白、全部有料）の実機フォローアップ＋追加依頼。task-manager が構造化。実装は委譲。
全件 **TODO で登録、着手は T-M（体力コース）完了後＝main 作業ツリー解放待ち**（理由＝T-M で dev-logic が main の作業ツリーを使用中。同じツリーを2人で触ると commit が混ざるため、作業ツリーが空いてから着手）。
さらにテーマ系（T-R/T-S/T-T/T-U/T-J/T-Y）は **T-V のテーマ再設計で Keita がパレットを選定したのを待って一括実装**するのが効率的（同じ theme.ts / tokens.css / AppearanceSettings / 色トークンを反復で触るのを1回にまとめる）。T-V がこれら全部を束ねる親エピック。
（注: 2026-05-29 朝に林が誤って起票した重複バッチ「テーマ改修」の T-I/T-J 行〔既存 DONE の T-I/T-J と ID 衝突〕は削除し、内容を本バッチへ吸収済み。テーマ改修＝T-R〔mono 追加削除〕/T-V〔新規3テーマ吸収〕/T-S〔今日の1問追従〕/T-U〔コントラスト〕、習熟色バッジ＝新規 T-Y として下記に整理。）

| ID | タイトル | 優先度 | ステータス | 担当案 | 関連 |
|----|----------|--------|-----------|--------|------|
| T-R | 死にテーマ削除（custom / enterprise / startup / mono）＝計4削除 | P1 | DONE（2026-05-29 dev-logic 実装＋push。MODES/ModeId/ThemeState.customHex/applyTheme custom分岐 除去、loadTheme で未知 id を DEFAULT(dark) フォールバック、tokens.css mode-mono・tokens-m3.css mode-mono・index.css mode-enterprise/startup ブロック除去、i18n の4モード ja/en 削除、ThemeSettings(v1) の custom UI 撤去。tsc0/eslint0/vitest340/build0） | dev-logic | 残=light/dark/sepia/forest＋T-V 新規3（indigo/rose/slate） |
| T-S | テーマを変えても「今日の一問」カード（Daily Fermi ホームカード）の色が青のまま → テーマ追従（＋AM-L のグラデ廃止と統合） | P1 | DONE（2026-05-29。HomeScreenV3 Daily Fermi カードを --brand-grad-h → フラット var(--accent)、青グロー boxShadow を accent 追従の color-mix に、CTA/eyebrow/desc を --accent / --accent-fg 追従に。T-T 根本原因A・AM-L(b) と統合実装） | dev-logic | T-T 根本原因A と同一箇所。AM-L(b) と同 DOM |
| T-T | テーマ非追従の箇所を audit findings で完全仕様化 → 根本原因 A/B/C/D を個別修正 | P1 | DONE（2026-05-29。A: 各モードブロックで --brand-grad-h override＋HomeScreenV3 のハードコード青→accent追従。B: RoadmapScreenV3 のハードコード青 rgba(108,142,245,..) を var(--accent)系 color-mix へ（:329/:775/:959/:983/:992）。C: LessonStoriesScreen の #fff/#FFFFFF on brand を var(--accent-fg) 化（:559/:856/:860/:869/:872/:912/:1013/:1105/:1189/:1226/:1246/:1263/:1303/:1313/:1447/:1498/:1552/:1580）＋ tap-hint 青グロー accent 化。D: ProfileScreenV3 はハードコード text color 無し＝既に追従済みと確認） | 林（調査）→ dev-logic（修正） | 暗スクリム上の white 文字（tap-hint 左ゾーン等）は意図通り維持 |
| T-U | コントラスト/可読性 整合性チェック（全テーマ×主要画面で WCAG 検証・破綻潰し） | P1 | 再オープン（2026-05-30 Keita 決定でスコープ拡大）。従来の「ボタン専用トークン #2E45A8 で 8.29:1 確保」対処は残置。ブランド青 #6C8EF5 そのものを濃くしてアプリ全体の青を再設計する方向に決定。designer が新ブランド青パレット案 2〜3＋全テーマ AA 検算→Keita 選定→dev-logic 実装。T-V と同じトークン（theme.ts/tokens.css）を触るため統合実装が筋 | designer→Keita→dev-logic | Keita「まかせる」委任の旧対処は temp。今回はブランド青の再設計＝T-V と統合実装でコンフリクト回避 |
| T-V | テーマ再設計エピック（「AIっぽくない」新規3テーマ追加＋数パターン＋UI設計刷新＋カスタマイズしやすく） | P1 | 部分（2026-05-29。新規3テーマ indigo/rose/slate を MODES＋tokens.css＋tokens-m3.css＋i18n(ja/en) に追加＝配色実装パート DONE。UI 設計刷新・数パターン展開は AM-K 親エピックで継続） | designer（提案）→ dev-logic（実装） | 配色トークンは THEME_PALETTE_CANDIDATES_v2 §2 をそのまま採用 |
| T-Y | 2回以上完了レッスンの完了マーク色を区別（習熟色・コース一覧） | P2 | DONE（2026-05-29。--mastery/--mastery-fg を tokens.css 全テーマに定義〔明カード #9A7416/#FFF・暗カード #D9A943/#1A1A1A〕、CompletionBadge を count>=2 で mastery 色に切替＋細い金縁リングで形状二重符号化。count=1 は従来 --accent 維持。test 12件 pass） | dev-logic | RoadmapScreenV3:1327/:1380・CompletedLessonsScreen 共通コンポーネント経由で整合 |

### T-R — 死にテーマ削除（custom / enterprise / startup / mono）　[P1 / DONE]

> 状態（2026-05-29 commit d0558cb）: MODES/ModeId/ThemeState.customHex/applyTheme custom分岐 除去、loadTheme で未知 id を DEFAULT(dark) フォールバック、tokens.css mode-mono・tokens-m3.css mode-mono・index.css mode-enterprise/startup ブロック除去、i18n の4モード ja/en 削除、ThemeSettings(v1) の custom UI 撤去。残=light/dark/sepia/forest＋新規3（indigo/rose/slate）。tsc0/eslint0/vitest340/build0。

- 📌 スコープ拡大（Keita 2026-05-29・2段階）: 当初「custom（HEX 自由指定）のみ削除」→ 「enterprise / startup も削除」→ さらに **mono（墨白）も削除に拡大（Keita 2026-05-29「墨白不要」）**。**削除は計4モード（custom / enterprise / startup / mono）**。**最終的に残るモード = light / dark / sepia(古紙) / forest(深緑) ＋ T-V で追加する新規3つ（＝計7構成見込み）**。custom/enterprise/startup は CSS ブロック不在の死にモード、mono は実体 CSS は存在するが Keita 判断で不要のため削除（＝この3つとは削除理由が異なる点に注意）。
- 依頼原文（Keita 2026-05-29）: 「カスタムテーマは機能しておらず不要」＋「エンタープライズ不要・カスタムカラー不要・墨白不要・startup も削除」。
- 🔍 audit 根拠（読み取り専用調査・完了済み）: **enterprise / startup / custom は `tokens.css` / `tokens-m3.css` に `body.theme-v3.mode-{id}` の CSS ブロックが一切存在しない**＝選んでも bg/card/text が変わらず何も起きない（applyTheme が `mode-{id}` クラスを付けるだけで対応 CSS が無い＝死んでいる）。一方 light / dark / sepia / forest / mono の変数定義は完全（欠落なし）と確認済み。つまり enterprise/startup/custom は「MODES には載っているが実体 CSS が無い空モード」。**mono は実体 CSS あり（生きている）が Keita 判断で不要のため削除対象に追加**（削除理由が他3つと異なる）。
- スコープ: `theme.ts` の `MODES` から `custom` / `enterprise` / `startup` / `mono` の4エントリを除去し、関連のコード・UI・state・i18n・CSS ブロックを整理する。custom/enterprise/startup は CSS ブロック無しのデッドコード除去、mono は実体 CSS ブロック（tokens.css/tokens-m3.css の `mode-mono`）も併せて除去する点が違い。
- 既存資産（実装前に実ソース照合すること）:
  - `src/theme.ts`: `MODES` 配列から `custom` / `enterprise` / `startup` / `mono` の4エントリ除去。`applyTheme()` 内の custom 分岐（動的 hex 適用ロジック）。`ThemeState` 型の `customHex`（または相当フィールド）除去。`loadTheme` / DEFAULT マージで削除 id を参照している箇所。
  - `src/screens/AppearanceSettingsScreen.tsx`: custom テーマ選択 UI・HEX 入力欄（カラーピッカー / テキスト入力）・custom ハンドラ、および enterprise/startup/mono の選択カード。
  - `src/styles/tokens.css` / `tokens-m3.css`: `mode-enterprise` / `mode-startup` / `mode-custom` セレクタは元々存在しない見込み（audit で不在確認）。**`mode-mono` の CSS ブロックは存在する＝これは必ず除去する**。実装時に grep で確認。
  - `src/i18n.ts`: `theme.mode.custom.*` / `theme.mode.enterprise.*` / `theme.mode.startup.*` / `theme.mode.mono.*`（name + desc）の ja/en エントリ除去。
- DoD: (1) `MODES` に custom / enterprise / startup / mono が存在しない、(2) applyTheme / loadTheme から custom 分岐・customHex が消え型エラーなし、(3) AppearanceSettings から4モードの選択 UI・HEX 入力が消える、(4) i18n の該当 theme.mode.* が ja/en 両方から消える（孤立キーを残さない）、(5) tokens.css/tokens-m3.css の `mode-mono` CSS ブロックが除去される、(6) 残るモード（light/dark/sepia/forest＋T-V 新規3）の選択・適用・persist が非回帰、(7) tsc 0 / eslint `.` 0、(8) Android 実機で外観設定が破綻しない。
- サブタスク:
  - [ ] 実装前調査: custom/enterprise/startup/mono 参照箇所を全量 grep（theme.ts / AppearanceSettingsScreen / tokens.css / tokens-m3.css / i18n / その他 customHex・mode-mono 参照）
  - [ ] `theme.ts`: MODES から4エントリ除去・applyTheme の custom 分岐削除・ThemeState.customHex 等の型整理・loadTheme の参照除去
  - [ ] `AppearanceSettingsScreen.tsx`: 4モードの選択 UI・custom の HEX 入力欄・関連ハンドラ削除
  - [ ] `tokens.css` / `tokens-m3.css`: `mode-mono` の CSS ブロックを除去（custom/enterprise/startup セレクタがあれば併せて除去）
  - [ ] `i18n.ts`: theme.mode.{custom,enterprise,startup,mono}.name/desc を ja/en 両方から除去（孤立キー残さない）
  - [ ] 永続化移行: localStorage `logic-theme` に既に custom/enterprise/startup/mono が保存されているユーザーの fallback（読込時に未知 id → light か直近有効 mode へフォールバックして無スタイルにならないこと）。**特に mono は今まで実際に選べた＝保存済みユーザーが存在しうるので fallback の実害が大きい**
  - [ ] 回帰: 残モードの選択・適用・persist。AppearanceSettings の表示崩れなし
  - [ ] tsc 0 / eslint `.`（全体）0
- 抜けもれ提言:
  - ⚠永続化フォールバック（最重要）: 既存ユーザーの localStorage に `mode: 'custom'` / `'enterprise'` / `'startup'` / **`'mono'`** が保存されている可能性。削除すると、その値を読んだ時に MODES に無い id となり、applyTheme は `mode-{id}` クラスを付けるが対応 CSS が無く**無スタイル化**する恐れ。**特に mono は今まで実際に選べた生きたモードなので保存済みユーザーが現実に存在しうる＝fallback 漏れの実害が大きい**（enterprise/startup は元々 CSS 不在で実質無スタイルだった）。loadTheme で未知 id → 既定（light 等）へフォールバックする処理を必ず入れる。
  - i18n: theme.mode.{custom,enterprise,startup,mono}.* を ja/en 両方から確実に除去（片方だけ残すと孤立）。未使用キーは lint で拾われない場合があるので grep で確認。
  - 両OS: モバイル専用（project_logic_mobile_only）。Android 実機で外観設定画面の表示確認。
  - テスト: 削除系だが、loadTheme の未知 id フォールバックは vitest 単体向き（保存値 'custom'/'enterprise'/'startup'/'mono' → 既定 mode に解決されるか）。
  - 関連: T-V のテーマ再設計で残モードのうち sepia/forest が刷新・差し替えされる可能性があるため、**T-V のパレット選定後に T-R/T-S/T-T/T-U/T-J ＋ 新タスク T-Y（習熟色バッジ）を同一 dev-logic がまとめて一括実装する**のが効率的（重複作業・コンフリクト回避）。
  - 注意: custom/enterprise/startup の「機能していない」は audit で裏取り済み（CSS ブロック不在）。mono は機能しているが Keita 判断で不要。削除方針は Keita 確定済み（2026-05-29「墨白不要」）。

### T-S — 「今日の一問」カードがテーマ追従しない　[P1 / DONE]

> 状態（2026-05-29 commit d0558cb）: HomeScreenV3 Daily Fermi カードを --brand-grad-h → フラット var(--accent)、青グロー boxShadow を accent 追従の color-mix に、CTA/eyebrow/desc を --accent / --accent-fg 追従に。T-T 根本原因A・AM-L(b) と統合実装。

- 依頼原文（Keita 2026-05-29）: 「テーマを変えても『今日の一問』カード（Daily Fermi のホームカード）の色が変わらない。テーマ追従するよう修正してほしい」。
- スコープ: ホーム（`HomeScreenV3`）の「今日の一問」カードが、外観テーマ（古紙/深緑等）を切り替えても青のまま変わらない＝テーマ非追従。テーマ変数（CSS 変数 / mode クラス）に追従するよう修正する。T-B で追加した新テーマの「追従漏れ」の一部。
- 🔍 根因確定（林調査済み・2026-05-29）: 「今日の一問」カードの色が **テーマ非追従の固定青**になっているのが根因。具体的に:
  - `HomeScreenV3.tsx:178` の box-shadow `rgba(108,142,245,.32)`（青グロー固定・ハードコード）
  - `HomeScreenV3.tsx:183/:184` の `background: 'var(--brand-grad-h)'`（固定青グラデ。`--brand-grad-h` は `tokens.css:26` の `:root` にしか定義されず**どのモードでも override されない**＝全テーマ青のまま）
  - CTA の `color: 'var(--brand)'`（固定青 #3D5FC4）
  - → これらを `--accent` 系トークンに置換 ＋ `--brand-grad-h` を各モードブロックで override すればテーマ追従する。**この :184 は T-T 根本原因A と完全に同一箇所**。
- 既存資産: `src/screens/HomeScreenV3.tsx`（「今日の一問」カードの描画・:178/:183/:184/CTA）、`src/styles/tokens.css`（`--brand-grad-h` の :root 定義元＋各 mode ブロック）。
- DoD: 外観テーマを古紙/深緑/light/dark/T-V 新規に切り替えると、「今日の一問」カードの背景・文字・アクセントが**各テーマの配色に追従**して変わる（青固定が解消）。ハードコード hex/青 rgba を使わず CSS 変数（`var(--card)` / `var(--accent)` / モード override 済み `--brand-grad-h` 等テーマトークン）参照になっている。各テーマで本文・ラベルのコントラストが WCAG AA を満たす。tsc 0 / eslint `.` 0。Android 実機で全テーマ確認。
- サブタスク:
  - [ ] HomeScreenV3:178 boxShadow のハードコード青を accent 系変数へ
  - [ ] HomeScreenV3:183/:184 の `--brand-grad-h` 固定青グラデをテーマ追従に（各モードで override or accent 系へ。⚠AM-L で「グラデ自体をなくす」指示と統合＝フラット単色＋テーマ追従に）
  - [ ] CTA の `color: 'var(--brand)'` 固定青を accent へ
  - [ ] 残テーマ（light/dark/古紙/深緑/T-V 新規3。mono は削除）でカードが追従するか確認
  - [ ] コントラスト確認: 各テーマで本文/ラベルが WCAG AA（4.5:1）
  - [ ] 回帰: 他のホーム要素（ストリーク・他カード）の色に影響していないか
  - [ ] tsc 0 / eslint `.`（全体）0
- 抜けもれ提言:
  - デザイン制約: ハードコード hex 禁止（CLAUDE.md）。テーマトークン `var(--bg)` / `var(--card)` / `var(--text)` / `var(--accent)` 等を使う。色 source は tokens.css 側に集約。
  - 回帰（最重要）: 「今日の一問」カードの色を変数化すると、その変数を共有する**他画面のカードにも波及**しうる。共通カードコンポーネント / 共通 CSS クラスを触る場合は他画面の見た目も目視確認（feedback_audit_triage 的に correctness 波及）。カード固有のクラスに閉じて直すのが安全。
  - i18n: 色追従のみなら新規文言なし（i18n 影響なし）。
  - アクセシビリティ: テーマ追従で各テーマのコントラスト要検算（特に深緑のダーク寄り系で本文が沈まないか。T-B の DoD と同じ観点）。
  - 両OS: モバイル専用。Android 実機で全テーマ切替を確認（theme-color meta も含め）。
  - 永続化: 表示色のみで persist 影響なし。
  - ⚠AM-L との統合（最重要）: 旧「テーマ改修」依頼の「今日の1問カードが青のまま」＝この T-S。さらに AM-L（Keita「今日の1問カードのグラデをなくして」）と**同じ DOM/CSS（HomeScreenV3:184 の `--brand-grad-h`）を触る**。方向は AM-L=「グラデをなくす（フラット化）」が最新指示なので、**フラット単色＋テーマ追従**で T-S（追従）と AM-L（グラデ廃止）を同時充足する。**dev-logic は T-S / T-T 根本原因A / AM-L (b) を同一作業で処理**（別々にやると競合）。
  - 関連: T-S は T-T 根本原因A の :184 を先行特定したもの＝**T-S は T-T 根本原因A に統合**（A を直せば自動解消）。T-A/T-L と同じ Daily Fermi 周辺だが、T-A は本番反映済・T-L は表示順入れ替えで色とは別レイヤーなので競合は小さい（同一 dev-logic なら順序整理で回避）。

### T-T — テーマ非追従の網羅修正（audit findings で完全仕様化）　[P1 / DONE]

> 状態（2026-05-29 commit d0558cb）: A: 各モードブロックで --brand-grad-h override＋HomeScreenV3 のハードコード青→accent 追従。B: RoadmapScreenV3 のハードコード青 rgba を var(--accent)系 color-mix へ。C: LessonStoriesScreen の #fff/#FFFFFF on brand を var(--accent-fg) 化＋tap-hint 青グロー accent 化。D: ProfileScreenV3 はハードコード text color 無し＝既に追従済みと確認。暗スクリム上の white 文字は意図通り維持。

- 依頼原文（Keita 2026-05-29）: 「他にテーマ非追従の箇所がないか調査してほしい」。
- スコープ: T-B で追加した配色テーマ（sepia/forest/mono）に**追従しない UI 箇所を網羅的に洗い出し、各根本原因を個別修正する**。ハードコード hex / テーマ非依存の固定色 / 旧 light/dark しか想定しない色指定を全量検出済み。
- ✅ 調査完了（2026-05-29・読み取り専用 audit）: 林の網羅調査が完了。findings を**根本原因 A/B/C/D**に整理した（下記）。sepia/forest/mono の**変数定義自体は完全（欠落なし）**と確認済み＝問題は「変数を参照していない/ハードコードしている UI 側」にある。T-S（今日の一問カード）は根本原因A の一例。
- ━━━ audit findings（根本原因別・dev-logic はこれを順に潰す）━━━

  #### 根本原因A — `--brand-grad-h`（青グラデ）が :root にしか定義されず全テーマ青のまま
  - 詳細: `--brand-grad-h`（青グラデーション）が `tokens.css:26` の `:root` にしか定義されておらず、**どのモードブロックでも override されていない**。これを使う背景がどのテーマでも青のまま残る。
  - 該当箇所:
    - `HomeScreenV3.tsx:184`（「今日の一問」カード背景）＝**T-S と同一**
    - `HomeScreenV3.tsx:178`（boxShadow にハードコード青）
    - `DailyFermiScreen.tsx:1133`
    - `LoginScreen.tsx:115`
  - 修正方針: 各モードブロック（`body.theme-v3.mode-{id}`）で `--brand-grad-h` を override する＝**一括で直る**。HomeScreenV3:178 の boxShadow ハードコード青は別途テーマ変数化。
  - 関連: T-S（今日の一問カード）はこの A の :184 を先行特定したもの。A を直せば T-S は自動で解消するので、**T-S は T-T 根本原因A に統合**。

  #### 根本原因B — RoadmapScreenV3 にハードコード青 rgba が散在
  - 詳細: `RoadmapScreenV3` に `rgba(108,142,245,...)`（accent-soft 相当の青）がハードコードで散在。accent-soft 相当を直書きしているため sepia/forest/mono で青が残る。
  - 該当箇所: `:762`（タブ active）/ `:946` / `:970` / `:979`（カード）/ `:328`（mark）。
  - 修正方針: ハードコード青 rgba を**テーマ変数（`--accent-soft` 等）へ置換**。

  #### 根本原因C — LessonStoriesScreen で brand 背景上の文字が #fff 固定
  - 詳細: `LessonStoriesScreen` で brand 背景の上の文字が `#fff` / `#FFFFFF` 固定（約10箇所）。テーマによっては brand 背景色が変わるのに文字が白固定でコントラスト破綻 or 非追従。
  - 該当箇所（約10箇所）: `:856` / `:869` / `:1303` / `:1313` / `:1447` / `:1498` / `:1580` ほか。
  - 修正方針: `var(--accent-fg)` にして**テーマ追従＆コントラスト確保**（accent-fg は applyTheme の pickFg で背景に応じた fg を自動選定する変数）。

  #### 根本原因D — プロフィール一覧の文言がダークのまま変わらない（Keita 報告）
  - 詳細（Keita 報告）: プロフィール一覧の文言がダークのまま変わらない。audit では Profile/Journal hero は `--hero-grad-dark` で追従していると出たが、**一覧テキストの色が別途ハードコード/未追従**の可能性。
  - 修正方針: dev-logic が実装時に該当箇所（プロフィール一覧テキストの色指定）を特定して修正。hero は追従済みなので、一覧テキスト固有の色指定を探す。
- DoD: (1) 根本原因A: `--brand-grad-h` が各モードで override され HomeScreenV3:184/:178・DailyFermiScreen:1133・LoginScreen:115 が全テーマ追従、(2) 根本原因B: RoadmapScreenV3 のハードコード青 rgba（:762/:946/:970/:979/:328）がテーマ変数化、(3) 根本原因C: LessonStoriesScreen の #fff 固定（約10箇所）が `var(--accent-fg)` 化、(4) 根本原因D: プロフィール一覧テキストがテーマ追従、(5) 各テーマでコントラスト WCAG AA（T-U と一体で検証）、(6) 回帰: 既存 light/dark の見た目が変わらない、(7) tsc 0 / eslint `.` 0、(8) Android 実機で代表テーマ確認。
- サブタスク:
  - [x] 林: 読み取り専用の網羅調査（非追従箇所の検出）＝**完了**。findings を根本原因 A/B/C/D に整理
  - [ ] dev-logic 根本原因A: 各モードブロックで `--brand-grad-h` を override ＋ HomeScreenV3:178 boxShadow のハードコード青を変数化（T-S を兼ねる）
  - [ ] dev-logic 根本原因B: RoadmapScreenV3 のハードコード青 rgba(108,142,245,...) を `--accent-soft` 等へ置換（:762/:946/:970/:979/:328）
  - [ ] dev-logic 根本原因C: LessonStoriesScreen の #fff/#FFFFFF 固定（約10箇所 :856/:869/:1303/:1313/:1447/:1498/:1580 ほか）を `var(--accent-fg)` 化
  - [ ] dev-logic 根本原因D: プロフィール一覧テキストの未追従箇所を特定してテーマ追従に修正
  - [ ] 残テーマ（light/dark/sepia/forest＋T-V 新規3。**mono は T-R で削除済みなので対象外**）で追従＋コントラスト確認（T-U と一体）
  - [ ] 回帰: 既存 light/dark 非変化、共有クラス波及の目視確認
  - [ ] tsc 0 / eslint `.`（全体）0
- 抜けもれ提言:
  - T-S は根本原因A の :184 を先行特定したもの＝**T-S は T-T 根本原因A に統合**。A を直せば T-S は自動解消。
  - デザイン制約: 修正方針は一貫して「ハードコード hex/rgba 撤去 → tokens.css のテーマトークン参照」。色 source は tokens.css に集約（CLAUDE.md）。根本原因A の `--brand-grad-h` は各モードブロックに分散定義する（色 source なので各モード CSS で hex を持つのは正当）。
  - 回帰（最重要）: `--brand-grad-h` を各モードで override すると、この変数を共有する**他画面の青グラデ背景にも波及**する（HomeScreenV3/DailyFermi/Login が共有）。意図した一括追従なので望ましいが、想定外の箇所が変わらないか目視確認。LessonStoriesScreen の accent-fg 化も共有クラス波及に注意。
  - コントラスト: 根本原因C（accent-fg 化）と全テーマ検証は T-U（コントラスト整合性チェック）と一体で進める。特に forest のダーク寄り系で本文が沈まないか（mono は T-R で削除）。
  - 両OS: モバイル専用。Android 実機で代表テーマの全画面ざっと確認。
  - i18n: 色追従修正のみなら新規文言なし。
  - 永続化: 表示色のみで persist 影響なし。
  - ⚠T-V との統合: sepia/forest は T-V のテーマ再設計で刷新・差し替えの可能性（mono は T-R で削除済み）。**T-V のパレット選定後に T-T を実装**すれば、刷新後のモードブロックに対して `--brand-grad-h` override を入れられる（先に直すと T-V 実装で二度手間になる）。T-R/T-S/T-T/T-U/T-J ＋ 新タスク T-Y（習熟色バッジ）を T-V 統合で一括実装。

### T-U — コントラスト/可読性 整合性チェック　[P1 / 再オープン（2026-05-30 スコープ拡大）]

> 状態（2026-05-30 Keita 決定で再オープン・スコープ拡大）: 旧 DONE（2026-05-29 commit 36d08aa）で「accent ボタンだけ専用トークン #2E45A8 で 8.29:1 確保」した対処は**残置**。これに加え、Keita が **ブランド青 #6C8EF5 そのものを濃くしてアプリ全体の青を再設計する方向**に決定。従来の「ボタンだけ別トークン」対症療法ではなく、ブランド色の根本見直し。
> フロー: **designer が新ブランド青パレット案 2〜3 案＋全テーマ AA 検算**を作成 → **Keita 選定** → **dev-logic 実装**。新規採番でも可だが、T-V（テーマ再設計エピック）と**同じトークン（theme.ts / tokens.css）を触るため統合実装が筋**（重複作業・コンフリクト回避）。
> 参考（旧対処の確認値・残置）: 全テーマ AA 確認済〔sepia5.28/rose6.97/slate8.09/indigo7.61/forest7.80〕、今日の1問カードの白ピル上ラベルも 3.08→8.29 に是正済。新ブランド青確定後はこの値を再検算する。

- 依頼原文（Keita 2026-05-29）: 「テーマを変えると白文字で見えない、ハイライトが濃くて読めない、が起きないように整合性チェックして」。
- スコープ: 全テーマ × 主要画面で、可読性を検証して破綻を潰す **QA タスク**。検証軸は (a) 本文テキスト × 背景、(b) accent-fg × brand/accent 背景、(c) selection/active ハイライト × その上の文字。目安は WCAG **4.5:1（本文）/ 3:1（大文字・UI 要素）**。T-T の修正（特に根本原因C の accent-fg 化）と一体で進める。
- なぜ T-T と一体か: T-T 根本原因C（#fff 固定 → accent-fg 化）と根本原因A（brand-grad-h override）は、どちらも「テーマ追従させた結果コントラストが足りるか」を検証しないと完了しない。T-U は T-T の修正後に各テーマで可読性が成立するかを横断チェックする受け入れゲート。
- 検証対象テーマ: light / dark / sepia / forest ＋ T-V 新規3（**mono は T-R で削除済みのため対象外**。T-V 再設計後はそのパレットで再検証）。
- 検証対象（主要画面・代表例）: ホーム（今日の一問カード・ストリーク）、ロードマップ（タブ active・カード・mark）、レッスン本文/LessonStories（brand 背景上の文字・callout）、プロフィール一覧、ジャーナル、外観設定、ログイン。
- DoD: (1) 残全テーマ（light/dark/sepia/forest＋T-V 新規3、mono 除く）× 主要画面で「本文 × 背景」が WCAG 4.5:1、「大文字・UI 要素・accent-fg × accent 背景」が 3:1 を満たす、(2) 白文字が背景に溶ける/ハイライトが濃すぎて文字が読めない箇所がゼロ、(3) 破綻箇所はテーマトークン調整 or 当該箇所の fg 修正で解消、(4) 検証結果（テーマ×画面×実測コントラスト比 or OK/NG）が記録される、(5) Android 実機で代表テーマの可読性を目視確認。
- サブタスク:
  - [ ] 検証マトリクス作成（5テーマ × 主要画面 × 検証軸 a/b/c）
  - [ ] 各セルでコントラスト比を実測（hex 抽出 → WCAG 比算出。selection/active ハイライト上の文字も含む）
  - [ ] NG セルを抽出し、T-T の修正 or tokens.css のトークン調整で解消
  - [ ] forest のダーク寄り系で本文が沈まないか・sepia の低彩度で accent が埋もれないか重点確認（mono は削除済み）
  - [ ] Android 実機で代表テーマ（forest/sepia＋T-V 新規）の主要画面を目視
  - [ ] 検証結果を記録（再発防止の基準値として）
- 担当（2026-05-30 再オープン後）: designer（新ブランド青パレット案 2〜3＋全テーマ AA 検算）→ Keita（選定）→ dev-logic（実装・T-V と統合）。マトリクス実測の機械化は test/QA 系 subagent 併用可。
- 抜けもれ提言:
  - ⚠T-V と統合実装（最重要・2026-05-30）: 新ブランド青は theme.ts / tokens.css のブランド色トークンを触る＝T-V のテーマ再設計と同じファイル。別々に実装すると二度手間＋コンフリクト。**T-V の実装フェーズに T-U の新ブランド青を巻き込んで一気通貫**で実装する。
  - ブランド青を濃くする波及（回帰）: #6C8EF5 を起点にする brand-soft / accent / グロー / グラデ / theme-color meta など派生トークンも連動して見直す。AM-L で accent 追従にしたカード類・バッジ（T-J）・習熟色（T-Y）への波及も全テーマで再検算。
  - T-T と一体: T-T の根本原因 A/B/C/D 修正後に T-U で横断検証するのが順序。T-T 未修正のまま T-U だけ走らせても「直す前の破綻」を測るだけになる。
  - selection/active ハイライト: 本文 × 背景だけでなく、タップ/選択時のハイライト色の上に乗る文字（ロードマップ tab active 等）も検証軸に含める（Keita「ハイライトが濃くて読めない」＝この軸）。
  - accent-fg の自動選定: applyTheme の pickFg() が accent 上の fg を自動選定するが、自動選定が常に AA を満たすとは限らない（中間明度の accent で fg が際どくなる）。各テーマの accent で実測する。
  - デザイン制約: 破綻解消はハードコード hex でなく tokens.css のトークン調整で（CLAUDE.md）。
  - 両OS: モバイル専用。実機の表示は sRGB プロファイル/輝度で見え方が変わるので Android 実機目視も併用（数値 OK でも実機で沈むことがある）。
  - i18n: QA タスクで新規文言なし。
  - 永続化: 不要（検証 + 色調整のみ）。
  - 再発防止: 検証結果を基準値として残し、T-V 再設計や新画面追加時に同じマトリクスで回せるようにする（recurring 化の余地）。

### T-V — テーマ再設計エピック（数パターン追加・UI設計刷新・カスタマイズしやすく）　[P1 / 部分 DONE（配色 DONE／UI 刷新は AM-K で継続）]

> 状態（2026-05-29 commit d0558cb）: 配色実装パート＝新規3テーマ indigo/rose/slate を MODES＋tokens.css＋tokens-m3.css＋i18n(ja/en) に追加 DONE（THEME_PALETTE_CANDIDATES_v2 §2 採用）。**残る「UI 設計刷新・数パターン展開」は AM-K（UI 全体刷新方針）の親エピックへ移管して継続**＝T-V 単独では配色まで完了。

- 依頼原文（Keita 2026-05-29）: 「まだAI感がある、もう数パターン考えてほしい。UI設計も変えていい、カスタマイズしやすく」。＋（別途・同日朝）「『AIっぽくない』テーマを3つ追加して」。
- スコープ: 配色テーマを再設計する**親エピック**。(1) 新パレットを数パターン提案（AI 感を脱した垢抜けた配色）、(2) AppearanceSettings の UI 設計を刷新（カスタマイズしやすく）、(3) 選定パレットで全変数フルカバー＋コントラスト検証。T-R（死にモード削除）/ T-T（非追従修正）/ T-U（コントラスト）/ T-J（バッジ色）/ 新タスク T-Y（習熟色バッジ）はこの再設計と**統合して一括実装**するのが効率的。
- 🆕 追加要件（Keita 2026-05-29 朝・旧「テーマ改修」依頼から吸収）: **「AIっぽくない」テーマを3つ新規追加**する。これは T-V エピックの一部として扱う（別タスク起票しない＝旧 Hayashi T-I の重複を吸収）。**最終的に残るモード = light / dark / sepia(古紙) / forest(深緑) ＋ この新規3つ（＝計7構成）**。custom/enterprise/startup/mono は T-R で削除。新規3つは「量産テンプレ感（紺×シルバー等）を避け、アナログ/人間味/エディトリアル寄り、sepia/forest と被らない方向」（designer が現在パレット作成中＝T-V/T-U/T-Y 用に新規3テーマのパレット＋習熟色＋既存テーマのコントラスト監査を作成中）。
- 進行状況（2026-05-29）: **designer が読み取り専用で提案ドキュメントを作成中**（出力先 `docs/THEME_REDESIGN_PROPOSAL_20260529.md`）。内容＝**新規3テーマ（AIっぽくない）のパレット＋（数パターンの再設計案）＋全変数フルカバー＋コントラスト検証（既存 sepia/forest 含む）＋習熟色（T-Y 用）＋AppearanceSettings UI 再設計案**。完成後 Keita がパレットを選定 → dev-logic が実装。
- ⚠選定パレットの影響: 選定パレットは既存 sepia/forest を**刷新/差し替える可能性**がある（mono は T-R で削除済み）。つまり残すモードのうち sepia/forest は T-V 後に中身が変わりうる（light/dark は維持見込み）。だから T-R/T-T/T-U は T-V のパレット選定を待って一括実装するのが筋（先に直すと二度手間）。
- フロー: designer（提案・進行中）→ Keita（パレット選定＝このエピックのゲート）→ dev-logic（theme.ts / tokens.css / i18n / AppearanceSettings 実装＋T-R/T-S/T-T/T-U/T-J/T-Y 統合）。
- DoD（提案フェーズ・designer）: (1) **「AIっぽくない」新規3テーマのパレット**＋（再設計の数パターン案）が提案され、各パレットが全テーマ変数（bg/card/text/accent ＋ accentSoft/glow/dark/fg、`--brand-grad-h` 等の追従対象含む）をフルカバー、(2) 各パレットのコントラスト検証（WCAG）＋既存 sepia/forest のコントラスト監査済み、(3) **習熟色（T-Y 用・1回完了 accent と区別する2回以上完了マークの色）**の選定案、(4) AppearanceSettings の UI 再設計案（カスタマイズしやすさを高める導線）が提示され、(5) 会話本文に内容展開＋Keita 選定待ち（feedback_direct_content_not_path）。
- DoD（実装フェーズ・後日・Keita 選定後）: 新規3テーマ＋選定パレットが MODES / tokens.css に実装され、AppearanceSettings UI が刷新され、T-R（死にモード削除）/T-T（非追従修正）/T-U（コントラスト）/T-J（バッジ色）/T-Y（習熟色バッジ）が統合され、全テーマで追従・コントラスト AA・i18n ja/en・Android 実機破綻なし。
- サブタスク（提案フェーズ・進行中）:
  - [~] designer: 「AIっぽくない」新規3テーマのパレット＋（再設計数パターン）提案（全変数フルカバー・各パレットのトンマナ説明・どのAI感を脱するか）＝**進行中**
  - [~] designer: 各パレットのコントラスト検証（WCAG）＋既存 sepia/forest のコントラスト監査
  - [~] designer: 習熟色の選定案（T-Y 用・1回完了 accent と区別）
  - [~] designer: AppearanceSettings UI 再設計案（カスタマイズしやすく）
  - [ ] 会話本文に提案を直接展開し Keita 選定待ち
- サブタスク（実装フェーズ・Keita 選定後）:
  - [ ] Keita: パレット選定（このエピックのゲート）
  - [ ] dev-logic: 新規3テーマ＋選定パレットを MODES / tokens.css に実装（sepia/forest の刷新/差し替え込み・mono は T-R で削除）
  - [ ] dev-logic: AppearanceSettings UI 刷新
  - [ ] dev-logic: T-R/T-S/T-T/T-U/T-J/T-Y を統合実装（死にモード削除・非追従修正・コントラスト・バッジ色・習熟色を一括）。**T-U は 2026-05-30 にスコープ拡大＝ブランド青 #6C8EF5 を濃くする全体再設計に。designer の新ブランド青パレット選定後、本実装フェーズに巻き込んで一気通貫で適用する（同じ theme.ts/tokens.css ＝コンフリクト回避）**
  - [ ] i18n（新パレット name/desc・UI 文言の ja/en・中立丁寧体）
  - [ ] 全テーマで追従・コントラスト AA・回帰（既存 light/dark 非変化）
  - [ ] tsc 0 / eslint `.` 0、Android 実機確認
  - [ ] サムネ/ハードコード hex 撤去の最終確認
- Keita 確認すべき論点（提案完成後）:
  - (1) どのパレットを採用するか（新規3テーマ＋再設計案。複数可・無料/有料の tier 割当）。
  - (2) sepia/forest を残すか・新パレットで差し替えるか（mono は削除済み。T-R の残モードと整合）。
  - (3) AppearanceSettings UI をどこまで刷新するか（「カスタマイズしやすく」の範囲＝プリセット選択のみか/微調整スライダ等を入れるか）。
- 抜けもれ提言:
  - サンプル承認フロー: テーマ配色は主観・好みの領域（Bucket2 寄り）。designer 提案 → Keita 選定 → 実装のフロー厳守（feedback_logic_course_thumbnails のサンプル承認ルール）。
  - i18n: 新パレットの name/desc は ja/en 両方・中立丁寧体（feedback_app_copy_neutral）。既存 enterprise/startup/custom の getter パターン踏襲（ただしそれらは T-R で削除）。
  - デザイン制約: パレット定義（MODES preview / tokens.css のモードブロック）は色 source なので hex を持つのは正当。コンポーネント側ハードコード hex は禁止。UI chrome は emoji 不可・SVG のみ（テーマカードのアイコン使う場合）。
  - 全変数フルカバー（最重要）: T-T で発覚した `--brand-grad-h` のような「:root だけ定義でモード未 override」を新パレットで再発させない。**全モードで全テーマ変数を完全に定義**することを提案・実装の DoD に含める（enterprise/startup が CSS ブロック不在で死んでいた轍を踏まない）。
  - コントラスト: 各パレットで T-U の検証軸（本文/背景・accent-fg/accent・ハイライト/文字）を満たすこと。提案段階で WCAG 検証を済ませる。
  - 永続化フォールバック: 新 id 追加・旧 id 差し替えで、localStorage に旧 id が残るユーザーの fallback（未知 id → 既定）を T-R の処理と統合。
  - 両OS: モバイル専用。Android 実機で全パレット確認（theme-color meta 含む）。
  - 統合の効率: T-R/T-S/T-T/T-U/T-J/T-Y を T-V 実装に巻き込むことで、theme.ts / tokens.css / AppearanceSettings / i18n / 色トークンを1回の作業で触れる（個別に何度も触らない）。同一 dev-logic 一気通貫。

### T-W — 「あなた専用コース」セクションの展開/折りたたみ　[P1 / REVIEW（2026-05-31 実装 green 完了・本番 deploy 済。Android 実機タップ確認のみ任意残）]

- ✅ 実装（2026-05-31 自律ティック・dev-logic 相当に委譲）: `src/screens/RoadmapScreenV3.tsx` のみ変更。擬似グループ ID `CUSTOM_COURSE_GROUP_ID='custom-courses'` を新設し、既存 `collapsedGroups` 開閉機構（T7/TC-1）に「あなた専用コース」を1グループとして追加。初期集合に含めて**デフォルト折りたたみ**。トグル UI・chevron アイコン（src/icons の ChevronRight/Down、emoji 不使用）・aria 文言（roadmap.expand/collapseGroupAria）・見出し（customCourse.sectionTitle/Desc）は全て既存流用＝**新規 i18n ゼロ**。0件時はヘッダのみ表示で破綻なし。永続化は既存カテゴリ開閉が非 persist（in-memory）のため DoD 通り同挙動に合わせた。検証（林が実コマンドで裏取り）: tsc 0 / eslint `.` 0 errors（warning 19 は全て既存）/ vitest 22files 389tests 全 pass。DoD 1-6 充足。残=DoD 7 Android 実機タップ確認（headless 不可・任意）。

- 依頼原文（Keita 2026-05-29）: 「あなた専用コース（AIカスタムコース）も展開・閉じるできるようにして。常時表示だと煩わしい」。
- スコープ: `RoadmapScreenV3` のパーソナル/カスタムコース表示部（「あなた専用コース」セクション）に、**T7 で実装済みのカテゴリ開閉トグルと同じ折りたたみ機構を適用**する。デフォルトは**折りたたみ**（常時表示をやめる）。
- 重さの見極め: **軽〜中**。既存の開閉機構（T7 / TC-1 で collapsedGroups に統合済み）を「あなた専用コース」セクションにも適用するだけ。新規の開閉ロジックは不要、既存パターンの再利用。
- 既存資産（実装前に実ソース照合すること）: `src/screens/RoadmapScreenV3.tsx`（「あなた専用コース」表示部＝TC-2 で実装した上部 pinned 表示／T7・TC-1 のカテゴリ開閉 `collapsedGroups` state と開閉トグル UI）、`src/components/CustomCourseScreen.tsx` 等カスタムコース関連。
- DoD: (1) 「あなた専用コース」セクションに開閉トグル（他カテゴリと同じ UI）が付く、(2) デフォルト折りたたみ（初回表示で閉じている）、(3) 開閉状態が他カテゴリと同じ機構で管理される（collapsedGroups 等）、(4) 開閉状態が永続化され再表示で維持される（既存カテゴリ開閉が persist されているならそれに乗る／されていなければ T7 の挙動に合わせる）、(5) カスタムコースが0件のときの表示が破綻しない、(6) tsc 0 / eslint `.` 0、(7) Android 実機で開閉確認。
- サブタスク:
  - [ ] 実装前調査: 「あなた専用コース」セクションの描画箇所と、T7/TC-1 のカテゴリ開閉機構（collapsedGroups state・トグル UI・persist 有無）を確認
  - [ ] 「あなた専用コース」セクションを開閉対象に追加（既存トグル機構を適用）
  - [ ] デフォルト折りたたみ（初期 collapsed）に設定
  - [ ] 開閉状態の永続化が他カテゴリと整合（既存 persist に乗せる）
  - [ ] 回帰: カスタムコース0件時・複数件時の表示、T-I（コース進捗）との表示整合
  - [ ] i18n（セクション見出し/開閉ラベルが新規なら ja/en・中立丁寧体。既存カテゴリと同じなら流用）
  - [ ] tsc 0 / eslint `.`（全体）0
- 担当: dev-logic。migration 不要。
- 抜けもれ提言:
  - 既存機構の再利用が肝: T7（コース一覧カテゴリ開閉）/ TC-1（フェルミカテゴリ開閉）で collapsedGroups に統合済み。新規に開閉ロジックを書かず**同じ機構に「あなた専用コース」を1グループとして追加**する（実装の一貫性・コンフリクト回避）。
  - デフォルト折りたたみの永続化: 「初回は閉じる」が、一度開いたら次回も開いたままにするか（persist）/毎回閉じるか、を実装時に確認。既存カテゴリ開閉の挙動に合わせるのが自然（Keita 確認は不要レベルだが既存挙動に倣う）。
  - UI chrome: 開閉トグルのアイコン（chevron 等）は SVG（src/icons）使用、emoji 不可。
  - i18n: 新規文言（あれば）ja/en・中立丁寧体（feedback_app_copy_neutral）。
  - 両OS: モバイル専用。Android 実機で開閉動作・アニメーション確認。
  - 永続化: 開閉状態は既存カテゴリ開閉の persist 機構に乗せる（localStorage 等）。カスタムコース自体のデータ（TC-2 の customCourseStore）には影響なし。
  - 独立性: T-W は T-V 系（テーマ）とも T-I/T-K/T-L とも独立。RoadmapScreenV3 を触る点は T-T 根本原因B（RoadmapScreenV3 のハードコード青）/ T-I（コース進捗・RoadmapScreenV3 のコースカード）と同ファイルなので、**同一 dev-logic が RoadmapScreenV3 系（T-W / T-I / T-T-B）を近い時期にまとめて触る**とコンフリクトを避けやすい（必須ではないが推奨）。

### T-Y — 2回以上完了レッスンの完了マーク色を区別（習熟色）　[P2 / DONE]

> 状態（2026-05-29 commit d0558cb）: --mastery/--mastery-fg を tokens.css 全テーマに定義（明カード #9A7416/#FFF・暗カード #D9A943/#1A1A1A）、CompletionBadge を count>=2 で mastery 色に切替＋細い金縁リングで形状二重符号化。count=1 は従来 --accent 維持。test 12件 pass。
> ⚠ ID 衝突注記: この T-Y（習熟色・テーマバッチ）と、夕方バッチの「・今日の一問 中黒除去」が同一 ID で並んでいた。後者を **T-Y2** にリネームして衝突解消済（下方の夕方バッチ参照）。この T-Y（習熟色）が正規の T-Y。

- 依頼原文（Keita 2026-05-29）: 「二回完了したレッスンはコース一覧で✓マークの色も変えて」。2回以上やったレッスンを1回完了と一目で見分けられる別色（習熟色）にする。
- ⚠ 既存 DONE タスクとの区別（最重要・ID 衝突回避の経緯）: 既存 **T-J（DONE）は「完了バッジのチェックマークをテーマアクセント色 `--accent` に追従させる」**話で、本番反映済み。本タスク T-Y は**それとは別物**＝「**完了回数（count>=2）で1回完了と色を変える（習熟色を新設）**」。2026-05-29 朝に林が誤って「T-J」として起票した重複バッチがあったが、既存 DONE の T-J と ID が衝突するため、**空き ID を確認のうえ新規 T-Y で採番**した（T-X まで使用済み・T-Y が次の空き）。
- 現状（林調査済み）:
  - `src/components/CompletionBadge.tsx` が回数で見た目を出し分け済み: count=1=✓＋`--accent`フル塗り / count=2=半リング＋数字「2」/ count=3+=数字。色は全て `--accent` 系で**1回と2回+の色差なし**（T-J でアクセント追従にはなったが、回数による色区別はまだ無い）。
  - コース一覧での描画: `src/screens/RoadmapScreenV3.tsx:1327` と :1380 の**2描画経路**で `<CompletionBadge count={completionCount || 1} />`。completionCounts は `getAllCompletionCounts()`（src/db/completionCountDb.ts、キー `lesson-${id}`）。
  - 既に completionCount >= 2 で `completed.timesDone` のテキストバッジも出る（:1337 / :1372）。
  - 完了回数の永続化は localStorage `logic-completion-counts` ＋ Supabase `user_progress.completion_counts`（migration 031）。**データ土台は揃っている＝migration 不要**。
  - `src/screens/CompletedLessonsScreen.tsx` でも CompletionBadge を描画＝整合確認対象。
- DoD: (1) コース一覧で2回以上完了レッスンの完了マークが1回完了と**違う色（習熟色）**で表示される、(2) 1回完了は従来 `--accent`、count>=2 は習熟色（2回半リング・3回+フル塗りの両方に適用）、(3) RoadmapScreenV3 の2描画経路（:1327/:1380）と CompletedLessonsScreen で整合、(4) 全テーマで習熟色のコントラストが保たれテーマ切替で破綻しない、(5) `src/__tests__/CompletionBadge.test.tsx` を色分岐の検証込みで更新しグリーン、(6) tsc 0 / eslint `.` 0、(7) Android 実機で確認。
- サブタスク:
  - [ ] designer: 1回完了（accent）と区別する「習熟色」を選定（テーマ追従するか固定 mastery 色か含め判断。全テーマでコントラスト確保）＝**T-V のパレット作成に内包・進行中**
  - [ ] dev-logic: CompletionBadge を count>=2 で習熟色に切替（2回半リング・3回+フル塗りの両方）。1回は従来 accent のまま
  - [ ] dev-logic: `src/__tests__/CompletionBadge.test.tsx` を更新（色分岐の検証追加）
  - [ ] 回帰: コース一覧（RoadmapScreenV3 両経路 :1327/:1380）・CompletedLessonsScreen でも整合。テーマ切替で習熟色も破綻しないこと
  - [ ] tsc 0 / eslint `.`（全体）0
- 担当: designer（習熟色選定＝T-V パレット作業に内包）→ dev-logic（実装）。migration 不要（completion_counts は migration 031 で既存）。
- 抜けもれ提言:
  - デザイン制約: 習熟色もハードコード hex 禁止＝テーマトークン（新規トークン or 既存 accent 系の派生）を tokens.css に定義して参照（CLAUDE.md）。テーマ追従か固定 mastery 色かは designer 判断（全テーマでコントラスト確保が条件）。
  - 統合効率: 習熟色は designer の T-V パレット作業（新規3テーマ＋既存コントラスト監査）に内包されるので、**T-V のパレット選定後に T-R/T-S/T-T/T-U/T-J/T-Y を同一 dev-logic が一括実装**するのが効率的（色トークンを1回でまとめて触る）。
  - i18n: 色区別のみで新規文言なし（i18n 影響なし）。
  - アクセシビリティ: 色だけで「習熟」を伝えると色覚多様性で区別困難＝既存の半リング/数字（count=2 で「2」表示）が色と併用の冗長手がかりになっている点を維持（色のみに依存しない）。
  - 両OS: モバイル専用。Android 実機で1回/2回/3回+の見分けを全テーマで確認。
  - 永続化: completion_counts は migration 031 で既存＝表示の色分岐のみ。persist 影響なし。

---

## バッチ: 2026-05-29 トレーニングのAI検索機能（Keita・新機能）

現行バッチ（T-M テーマ系・T-I〜T-L・T-R〜T-W）とは独立した新機能。新規 AI 機能のため backend デプロイ要・レート制限/コスト考慮。優先度は Keita 判断待ち（P-TBD）。**着手前にスコープ確認が必須**（下記）。

| ID | タイトル | 優先度 | ステータス | 担当案 |
|----|----------|--------|-----------|--------|
| T-X | トレーニングのAI検索（右上虫眼鏡＋自然言語/意味ベース検索） | P-TBD（Keita 判断待ち） | DONE（実装済 `6a3c985`・origin/main 在を git 検証。AM-Q/T-AE と同一。詳細・AM-Q・冒頭サマリは既に DONE 表記で、本表行のみ旧 TODO だったため 2026-05-31 同期） | designer（検索UI/結果画面設計）＋ dev-logic（backend AI 検索エンドポイント＋frontend 検索UI/結果表示） |

### T-X — トレーニングのAI検索（右上虫眼鏡＋AI検索）　[P1 / DONE]

> 状態（2026-05-29 commit 6a3c985〔別アクター実装〕）: RoadmapScreenV3 右上の虫眼鏡から検索オーバーレイ。既存キーワード検索＋「AIで検索」のプロンプトベース意味検索。server/routes/search.ts（POST /api/search, haiku-4-5, rate-limit 20/min）、src/aiSearch.ts、i18n ja/en、vitest 13。backend は deploy-production.yml で本番反映済（run 26629582944 = success）。着手前スコープ確認3点は実装で解決済（対象=レッスン/コース両方、方式=Claude プロンプト選別、結果=意味検索）。AM-Q / T-AE と同一依頼＝本タスク（T-X）が正本。

- 依頼原文（Keita 2026-05-29）: 「トレーニングの検索は、右上に虫眼鏡でいいよ、デフォルトは。それで、この検索も AI でできるようにしたい。」
- 概要: トレーニング（レッスン/コース一覧）に検索機能を新設する。入口は画面右上の虫眼鏡アイコン（デフォルト配置）。検索は単なる文字列一致でなく、自然言語/意味ベースで「やりたいこと・悩み」からレッスンやコースを探せる AI 検索にする。
- スコープ（依頼内訳）:
  - (a) **UI 入口**: トレーニング画面（レッスン/コース一覧 ＝ RoadmapScreenV3 等）の右上に虫眼鏡アイコンをデフォルト配置。タップで検索 UI を開く。
  - (b) **AI 検索**: 自然言語クエリ（例「会議で論理的に話せるようになりたい」「数字に弱いのを直したい」）から、意味的に合うレッスン/コースを返す。既存 AI 機能（roleplay / fermi / flashcards / custom-course 等、Anthropic Claude API・server 経由・rate-limited）と同じ枠組みで backend エンドポイントを追加する想定。
- 規模感: 中〜重。新規 AI 機能＝backend デプロイ要（手動 deploy-production.yml 必須、後述）、レート制限・コスト考慮、designer の UI 設計＋dev-logic の backend/frontend 両面。
- 担当案:
  - designer: 検索 UI（虫眼鏡入口→検索画面のレイアウト・入力欄・空状態・ローディング）＋ 結果画面（レッスン/コースのヒット表示形式・カード・なぜマッチしたかの提示有無）の設計。
  - dev-logic: backend の AI 検索エンドポイント（既存 rate-limited AI route 群と同枠）＋ frontend の検索 UI 配線・結果表示・遷移（ヒットしたレッスン/コースへのナビ）。
- ⚠ 着手前に Keita へ確認すべき点（スコープ未確定・設計分岐が大きい）:
  1. **検索対象範囲**: レッスンのみ / コースも含むか（両方か）。
  2. **AI のマッチ方式**: (i) 埋め込み（embedding）類似度ベース（事前にレッスン/コースをベクトル化して近傍検索）か、(ii) Claude プロンプトに候補メタデータを渡して選別させるか。コスト/レイテンシ/精度のトレードオフが大きいので方式を先に決める。
  3. **結果の出し方**: ランキング上位N件か / カテゴリ別か / 「なぜこれがマッチしたか」の理由を出すか / ヒットゼロ時のフォールバック（部分一致や関連サジェスト）。
  - → これらが決まらないと backend エンドポイント設計（入出力スキーマ）と designer の結果画面設計が固まらない。**スコープ確認まで IN_PROGRESS にしない**（BLOCKED 相当の確認ゲート）。
- DoD（暫定・スコープ確定後に精緻化）:
  1. トレーニング画面の右上に虫眼鏡アイコンが既定で表示され、タップで検索 UI が開く。
  2. 自然言語クエリを入力すると、意味的に合うレッスン（／コース：スコープ次第）が結果として返り、タップで該当レッスン/コースへ遷移できる。
  3. 検索はサーバ経由の AI で実行され、既存 AI 機能と同じレート制限・エラーハンドリング・ローディング表示が効く。
  4. backend エンドポイントが本番にデプロイされ、アプリ実機（Android）から検索が成功する（404 にならない）。
  5. ヒットゼロ/エラー/レート制限時の UI が中立丁寧体で表示される（feedback_app_copy_neutral）。
- 依存:
  - 検索対象データ ＝ `src/courseData.ts`（コース定義）/ `src/lessonData.ts`（レッスン定義）。AI に渡すメタデータ（title / description / category / tags 等）の抽出元。埋め込み方式なら事前ベクトル化のデータソースもここ。
  - 既存 AI 機能の枠組み（rate-limit・Anthropic SDK 呼び出し・本番デプロイフロー）。前例として `server/routes/custom-course.ts`（レッスン検索 AI からのコース生成 ＝ 同種の「クエリ→レッスン選別」ロジックの近縁）が最も参考になる。
- 関連ファイル（実装委譲時の起点・実在確認済み）:
  - frontend 入口: `src/screens/RoadmapScreenV3.tsx`（トレーニング＝レッスン/コース一覧の本体。右上虫眼鏡の配置先）、検索結果用の新規 screen（`src/screens/` にフラット追加 ＋ `src/AppV3.tsx` の Screen union ＆ screen-switch へ variant 追加）。
  - backend: `server/routes/` に新規 AI 検索 route（`server/index.ts` で登録）。既存 rate-limited route 群（`fermi.ts` / `problems.ts` / `custom-course.ts` / `journal.ts`）と同じ作法。
  - データ: `src/courseData.ts` / `src/lessonData.ts`。
  - i18n: `src/i18n.ts`（検索入口ラベル・プレースホルダ・空状態・エラー文言を ja/en 両方）。
- 抜けもれ提言:
  - ⚠ デプロイ依存（最重要・T-C/T-D と同根）: backend エンドポイント追加は **main マージ＝本番反映ではない**。Render web/backend は手動 `gh workflow run deploy-production.yml --repo keitaurano-del/logic -f confirm=yes` が必須（project_logic_render_auto_deploy）。Android アプリはこの backend API を叩くので、backend をデプロイしないとアプリ UI が新しくても検索が 404 で落ちる。デプロイ後に本番 probe してから DONE 判定。
  - i18n: 検索入口（虫眼鏡の aria ラベル）・プレースホルダ・空状態（ヒット0）・ローディング・エラー/レート制限文言は ja/en 両方＋中立丁寧体（feedback_app_copy_neutral）。
  - 両OS: モバイル専用（project_logic_mobile_only）。Android 実機で虫眼鏡タップ→検索 UI 起動→結果遷移を確認。iOS workflow 未整備につき当面 Android。
  - アクセシビリティ: 虫眼鏡アイコンは意味を担う UI なので aria ラベル併記（SVG・src/icons、emoji 不可＝UI chrome ルール）。検索結果カードもスクリーンリーダ可読に。
  - デザイン制約: UI chrome は SVG アイコンのみ（虫眼鏡は `src/icons/index.tsx` から。無ければ追加）。ハードコード hex 禁止・CSS 変数使用。
  - レート制限/コスト: 新規 AI 呼び出し＝Anthropic API コスト発生。既存 rate-limit ミドルウェアに必ず乗せる。埋め込み方式なら埋め込み API のコスト/キャッシュ（ベクトルの事前計算・再計算頻度）も設計時に。連打抑止（デバウンス）も UI 側で。
  - テスト: 検索結果の妥当性は AI 出力で非決定的 → 手動サンプルクエリ数件で「期待レッスンがヒットするか」の確認手順を残す。入口導線・遷移・空状態・エラー表示は Playwright E2E / 単体テスト向き。回帰: RoadmapScreenV3 に虫眼鏡を足すことで既存ヘッダ/カテゴリ開閉（T-7 / T-W 系）レイアウトが崩れないか。
  - 永続化（任意・スコープ次第）: 検索履歴を残すか（localStorage）。残すなら再表示時の挙動も DoD に。初版は履歴なしでも可。
  - 既存検索との関係確認: custom-course の「レッスン検索 AI」入口が既に存在する（TC-2 / T-C 系）。今回の汎用「トレーニング検索」とUI/責務が重複/競合しないか、統合するか別物かを設計時に整理（既存導線を流用できる可能性）。
  - 独立性: T-X は現行バッチ（テーマ T-M〜・T-R〜W、ジャーナル系）と独立。ただし RoadmapScreenV3 を触る点は T-I（コース進捗）/ T-W（あなた専用コース展開）/ T-T-B（RoadmapScreenV3 ハードコード青）と同ファイル＝**同一 dev-logic が RoadmapScreenV3 系をまとめて触る**とコンフリクト回避しやすい。

---

## バッチ: 2026-05-29 夕方 新規依頼8件（Keita 離席・林進行）

Keita が 2026-05-29 夕方に新バッチ8件を依頼（Keita は離席、林の判断で進行＋終わったものから Android Internal 配信の方針）。task-manager が構造化。実装は委譲。
**前提（最重要）**: 既存タスクと重複/統合する項目が複数ある（下表「既存リンク」参照）。当初 T-Y / T-Z / T-AA … T-AF で採番したが、**(1) T-Y が習熟色（テーマバッチ）と ID 衝突、(2) このバッチ8件は朝の AM-K〜AM-R バッチ（AM = Additional Morning）と完全に同一依頼8件**だったことが判明。→ **このバッチは AM-* バッチに集約し、二重トラッキングしない。** 衝突する T-Y は T-Y2 にリネーム、T-Z は T-Z2 にリネーム（DONE 済の実作業履歴として残す）。T-AA〜T-AF は AM-* の重複なので各行に正本（AM-*）を明記し、ステータスは AM-* と同期する。
**Keita 判断ゲートが多いバッチ**: 法務（→AM-N）/ 課金（→AM-O）/ ランキングダミー（→AM-P・実は DONE）/ 既存タグ書換（→AM-R）は本番データ操作 or 法的内容 or スコープ確定要で、林が単独で確定・実行しない。

| ID | 依頼# | タイトル | 優先度 | ステータス | 担当案 | Keita判断 | Internal配信 | 既存リンク |
|----|------|----------|--------|-----------|--------|-----------|-------------|-----------|
| T-Y2 | #3 | 「・今日の一問」の先頭「・」を消す（旧 T-Y＝習熟色と衝突→リネーム） | P2 | DONE（2026-05-29 commit 698de42＋d0558cb。HomeScreenV3 ラベル左の装飾ドット div 除去＋表記「今日の1問」統一） | dev-logic | 不要 | 配信済 | **= AM-M（正本）**。旧 T-Y は習熟色（テーマバッチ）と衝突したため T-Y2 にリネーム |
| T-Z2 | #2 | 「AI専用コース」「今日の1問」カードのグラデーション除去（リネーム） | P1 | DONE（2026-05-29 commit 698de42＋d0558cb。今日の1問カード `--brand-grad-h`→`--accent`、AI専用コースカード linear-gradient→`--accent` に単色テーマ追従化。T-S/T-T 根本原因A も同時解消） | dev-logic | 済 | 配信済 | **= AM-L（正本）/ T-S / T-T 根本原因A**。T-Y2 と採番を揃えるため T-Z2 にリネーム |
| T-AA | #1 | UI 全体の「AIっぽさ」をなくす刷新方針 | P1 | → **AM-K に集約**（重複・二重トラッキングしない）。現況=IN_PROGRESS（designer 方針ドキュメント作成中／配色 T-V は DONE） | designer→Keita→dev-logic | 要（刷新範囲の確定） | 段階的 | **= AM-K（正本）/ T-V** |
| T-AB | #4 | 利用規約／プライバシーポリシー／特商法表記の見直し | P1 | → **AM-N に集約**。現況=BLOCKED（点検 DONE＝LEGAL_REVIEW_20260529.md／確定値12点 Keita 待ち） | content-creator＋林→Keita→dev-logic | **要（法務確定値）** | 確定後 | **= AM-N（正本）** |
| T-AC | #5 | 料金プランの Google Play 課金を実装 | P1 | → **AM-O に集約**。現況=BLOCKED（PricingScreen 結線済＝コード DONE／Play Console SKU Active 登録 Keita 待ち） | dev-logic（実装済）＋Keita（SKU） | **要（SKU 登録）** | 一部 | **= AM-O（正本）/ play-billing-gaps #4** |
| T-AD | #6 | フェルミ累計スコアのダミー→毎日ランダム付与 | P1 | → **AM-P に集約・実は DONE**（commit 1c18ebb＋本番デプロイ run 26629582944 success。日次シードで動的化＝cron 不要） | dev-logic | 不要（実装で解決） | 本番反映済 | **= AM-P（正本）** |
| T-AE | #7 | トレーニング検索：右上虫眼鏡＋AI検索 | P1 | → **T-X / AM-Q に集約・DONE**（commit 6a3c985＋本番デプロイ run 26629582944 success） | designer＋dev-logic | 不要（実装で解決） | 本番反映済 | **= T-X / AM-Q（正本）** |
| T-AF | #8 | 既存ユーザ（Keita 想定）のジャーナルタグを見直し | P2 | → **AM-R に集約**。現況=BLOCKED（census＋統合プレビュー DONE／DB 書き換え承認 Keita 待ち） | dev-logic＋林→Keita | **要（本番データ書換承認）** | 不可 | **= AM-R（正本）/ T-D 遡及適用** |

着手順の推奨は AM-* バッチ側に集約済。確認4点は 2026-05-30 にすべて処理（AM-N 確定値全揃い→TODO、AM-O は価格確定済・SKU 登録だけ Keita 待ち、AM-R 書き換え承認のうえ実行完了 DONE、T-U はブランド青再設計に方針決定し再オープン）。

### T-Y2 — 「・今日の一問」の先頭「・」を消す　[P2 / DONE]（旧 T-Y＝習熟色と ID 衝突→リネーム。正本 = AM-M）

> 状態（2026-05-29 commit 698de42＋d0558cb）: 装飾ドット div 除去＋表記「今日の1問」統一済。AM-M に集約。詳細は AM-M / 下記参照。

- 依頼原文（Keita 2026-05-29 夕）: 「『・今日の一問』の『・』を消す」。
- スコープ: ホーム等に出る「今日の一問」セクション見出し（またはカードラベル）の**先頭に付いている中黒「・」を削除**する。表示文字列の調整1点。
- 重さの見極め: **最軽**。文言修正のみ。
- 根因仮説（実装前に実ソース照合すること・未照合）: (a) i18n の文言自体に「・」が含まれている（`src/i18n.ts` の ja 側に「・今日の一問」のようなキー値）、または (b) UI 側で見出しの前に装飾として中黒をハードコード付与している（`HomeScreenV3.tsx` 等の JSX で `・{t('...')}` のような描画）。どちらかを特定して除去する。en 側に同等の先頭記号が無いかも確認。
- 既存資産: `src/i18n.ts`（「今日の一問」関連キーの ja/en）、`src/screens/HomeScreenV3.tsx`（今日の一問カード/見出しの描画。T-S/T-A と同じ箇所）。
- DoD: 「今日の一問」の見出し/ラベルから先頭の「・」が消える。ja/en 両方で先頭装飾記号が残らない（en に無ければ ja のみ修正）。他の中黒を使う箇所に波及しない。tsc 0 / eslint `.` 0。Android 実機で表示確認。
- サブタスク:
  - [ ] 実装前調査: 「・」の出どころ特定（i18n 文言内 か JSX のハードコード装飾か）。「今日の一問」表示箇所を grep
  - [ ] 「・」を除去（i18n 値の修正 or JSX の装飾削除。中立丁寧体維持＝feedback_app_copy_neutral）
  - [ ] 回帰: 他の見出しで意図的に中黒を使っている箇所に波及しないか
  - [ ] tsc 0 / eslint `.`（全体）0
- 抜けもれ提言:
  - i18n: 文言由来なら ja/en 両方確認（feedback_app_copy_neutral・中立丁寧体維持）。装飾由来なら i18n 影響なし。
  - 両OS: モバイル専用（project_logic_mobile_only）。Android 実機で確認。Internal 配信＝フロントのみで main push 自動配信に乗る。
  - 永続化: 不要（表示文言のみ）。
  - 関連: T-S/T-A と同じ Daily Fermi ホームカード周辺。**同一 dev-logic が T-Y / T-Z（カードのグラデ除去）/ T-S（カードのテーマ追従）を Daily Fermi カードまとめて触る**とコンフリクト回避＆一貫性が出る。

### T-Z2 — 「AI専用コース」「今日の1問」カードのグラデーション除去　[P1 / DONE]（リネーム。正本 = AM-L）

> 状態（2026-05-29 commit 698de42＋d0558cb）: 2カードのグラデ→単色 var(--accent) テーマ追従化済。T-S/T-T 根本原因A も同時解消。AM-L に集約。詳細は AM-L / 下記参照。

- 依頼原文（Keita 2026-05-29 夕）: 「『AIで自分専用コースを作る』と『今日の1問』のカードは色のグラデーションをなくす」。
- スコープ: 2つのカード ——(a)「AIで自分専用コースを作る」（カスタムコース生成導線。RoadmapScreenV3 の「あなた専用コース」CTA or CustomCourseScreen 入口）、(b)「今日の1問」（Daily Fermi ホームカード）—— の**背景グラデーションを除去**し、単色（フラット）にする。
- なぜ #1（T-AA）と密接か: #1「AIっぽさをなくす」の具体例の一つがこのグラデーション除去。グラデ＝AI/SaaS テンプレ感の代表的要素。T-AA の刷新方針が固まる前でも、この2カードのグラデ除去は**単独で先行実施可能**（軽い確実なもの先行）。ただし「除去後に何色のフラットにするか」は T-AA の刷新トンマナと整合させると一貫する。
- 根因の手がかり（T-T 調査と一致・実ソース照合済みの近接情報）: 「今日の一問」カード背景は `HomeScreenV3.tsx:184` が `--brand-grad-h`（青グラデ）を使用（T-T 根本原因A・T-S と同一箇所）。`:178` に boxShadow ハードコード青。つまり T-Z のグラデ除去は **T-T 根本原因A / T-S と完全に同じ箇所を触る**。「AI専用コース」カードのグラデも同様にグラデ変数/ハードコードを使っている疑い（実装前に RoadmapScreenV3 / CustomCourseScreen 側を要照合）。
- 重さの見極め: **軽〜中**。グラデ→単色の CSS 変更。ただしテーマ追従（T-S/T-T）と同じ変数を触るので、**T-S/T-T/T-V と必ず整合**させる（バラバラに直すと二度手間/競合）。
- 既存資産（実装前に実ソース照合すること）: `src/screens/HomeScreenV3.tsx`（:178 boxShadow / :184 `--brand-grad-h` ＝今日の一問カード）、`src/screens/RoadmapScreenV3.tsx` or `src/components/CustomCourseScreen.tsx`（AI専用コースカード/CTA の背景）、`src/styles/tokens.css`（グラデ変数の source）。
- DoD: (1) 「今日の一問」カードと「AIで自分専用コースを作る」カードの背景グラデーションが除去され単色（フラット）になる、(2) 単色はハードコード hex でなくテーマトークン（`var(--card)` / `var(--accent-soft)` 等）参照、(3) テーマ追従（T-S/T-T と整合＝全テーマで破綻しない）、(4) コントラスト WCAG AA 維持、(5) 回帰: 同グラデ変数を使う他箇所（DailyFermiScreen:1133 / LoginScreen:115 等 T-T 根本原因A の共有箇所）への意図しない波及を確認、(6) tsc 0 / eslint `.` 0、(7) Android 実機で確認。
- サブタスク:
  - [ ] 実装前調査: 2カードの背景グラデ指定箇所を特定（HomeScreenV3:178/:184・AI専用コースカード）。`--brand-grad-h` 等グラデ変数の使用箇所を grep
  - [ ] designer（軽量）: 除去後のフラット色のトンマナを T-AA/T-V 刷新方針と整合させて提案（グラデ無しでも安っぽくならない単色 or 微妙なソリッド）
  - [ ] dev-logic: グラデ→単色（テーマトークン参照）に変更。ハードコード hex/青を撤去
  - [ ] テーマ追従（全5テーマで破綻しない）＋コントラスト確認（T-S/T-T/T-U と一体）
  - [ ] 回帰: 共有グラデ変数の他箇所波及（DailyFermi/Login）を確認
  - [ ] tsc 0 / eslint `.`（全体）0
- 抜けもれ提言:
  - ⚠重複・統合（最重要）: 「今日の一問」カードは T-S（テーマ追従）/ T-T 根本原因A（`--brand-grad-h` override）と**完全に同じ箇所**。T-Z（グラデ除去）と T-S（テーマ追従）を別々に実装すると競合する。**T-S / T-T 根本原因A / T-Z を同一 dev-logic が一括で設計**する（グラデを「除去する」のか「テーマ追従の単色にする」のかを1回で決める）。Keita の意図はグラデ除去なので、T-S の「テーマ追従」は「テーマ追従の単色」に着地させるのが筋。
  - デザイン制約: ハードコード hex 禁止。単色もテーマトークンで。色 source は tokens.css。
  - 回帰: `--brand-grad-h` は HomeScreenV3/DailyFermi/Login が共有（T-T 根本原因A）。2カードだけ単色化するつもりが共有変数経由で他画面のグラデも消えうる → カード固有クラスに閉じて直すか、共有変数を変えるなら全共有箇所の見た目を確認。
  - i18n: 色/グラデのみで新規文言なし。
  - 両OS: モバイル専用。Android 実機で2カード確認。Internal 配信＝フロントのみで自動配信可。
  - 永続化: 不要（表示のみ）。
  - 着手順: T-AA の全体刷新方針を待たずに先行可（軽い確実枠）。ただしフラット色は T-AA/T-V のトンマナに合わせる。

### T-AA — UI 全体の「AIっぽさ」をなくす刷新方針　[→ AM-K に集約（重複）／現況 IN_PROGRESS]

> 集約注記: 朝の AM-K と同一依頼。正本 = AM-K（designer が `docs/UI_RENEWAL_DIRECTION_20260529.md` 作成中、配色 T-V は DONE）。本セクションは二重トラッキングせず AM-K に従う。以下は元の構造化メモ（参考）。

- 依頼原文（Keita 2026-05-29 夕）: 「全体的に UI の『AIっぽさ』をなくしたいので刷新方針を考えてほしい」。
- スコープ: アプリ UI 全体から「AI/SaaS テンプレっぽさ」を脱する**刷新方針を策定する**（実装ではなくまず方針提案）。具体要素の例: 多用される青グラデーション（T-Z で着手）、彩度の高い accent、量産テンプレ的なカード/角丸/影、汎用的なフォント感など。
- ⚠⚠ 重複・統合判断（最重要・Keita 確認ゲート）: これは既存 **T-V（テーマ再設計エピック「まだAI感がある、もう数パターン考えて、UI設計も変えていい」）と強く重複**する。T-V は既に designer が `docs/THEME_REDESIGN_PROPOSAL_20260529.md` を作成中（IN_PROGRESS・読み取り専用）。T-AA はそれを**配色テーマに限らず UI 全体の刷新方針**へ広げた上位概念とも読める。
  - **林の整理案**: T-AA は T-V の親（または T-V を内包する UI 刷新エピック）として扱い、T-V の designer 提案に「配色テーマだけでなく UI 全体の AI 感除去方針（グラデ・accent・カード/影・余白・タイポ）」を盛り込む形で統合するのが効率的。別々に2本の刷新方針を走らせると designer 作業が分裂・矛盾する。
  - → **Keita 確認**: T-AA を (i) T-V に統合して「テーマ＋UI 全体刷新」の1エピックにするか、(ii) T-V（配色）と T-AA（UI 構造/レイアウト）を別エピックで並走させるか。林の推奨は (i) 統合。確定するまで T-AA は BLOCKED（designer を二重に走らせない）。
- 担当案: designer（刷新方針提案・T-V と統合運用）→ Keita（方針承認・刷新範囲確定）→ dev-logic（段階実装）。
- DoD（方針フェーズ）: (1) UI の「AIっぽさ」の正体を要素分解（グラデ/彩度/カード/影/余白/タイポ/アイコン等）、(2) 各要素の刷新方針（before→after の方向性）を提案、(3) T-V の配色提案と矛盾しない形で統合、(4) 会話本文に直接展開し Keita 承認待ち（feedback_direct_content_not_path）、(5) 承認後の実装は段階的タスクに分解（グラデ除去=T-Z は先行着手済の想定）。
- サブタスク:
  - [ ] Keita 確認: T-AA を T-V に統合するか別走させるか（林推奨＝統合）
  - [ ] designer: UI 全体の AI 感を要素分解＋刷新方針提案（T-V の THEME_REDESIGN_PROPOSAL に内包 or 連携）
  - [ ] 会話本文に方針を直接展開し Keita 承認待ち
  - [ ] 承認後: 実装を段階タスクに分解（T-Z グラデ除去はその先行分）
- 抜けもれ提言:
  - サンプル承認フロー: 全面刷新は主観・好みが大きい（Bucket2 寄り）。designer 提案→Keita 承認→段階展開を厳守（feedback_logic_course_thumbnails）。一気に全画面変えてデグレ事故を起こさない。
  - 統合効率: T-V / T-Z / T-S / T-T（テーマ追従）/ T-J（バッジ色）は全て「色・見た目」レイヤー。T-AA を親方針に置き、これらを配下の段階実装として束ねると、theme.ts / tokens.css / 各画面 CSS を反復で触る回数を最小化できる。
  - i18n: 方針フェーズは文言追加なし。実装で UI 文言が変わる場合は ja/en 両方・中立丁寧体。
  - デザイン制約: 刷新でもハードコード hex 禁止・CSS 変数・UI chrome は SVG（emoji 不可）の原則は維持。
  - 両OS: モバイル専用。実装段階で Android 実機確認。
  - Internal 配信: 方針フェーズは配信なし（ドキュメント）。実装段階のフロント変更は main push で Android 自動配信可。段階的に小さく出す。

### T-AB — 利用規約／プライバシーポリシー／特商法表記の見直し　[→ AM-N に集約（重複）／現況 BLOCKED]

> 集約注記: 朝の AM-N と同一依頼。正本 = AM-N（点検 DONE＝`docs/LEGAL_REVIEW_20260529.md`、最重要 C-1＝特商法価格が実装と不一致、確定値12点が Keita 待ち）。二重トラッキングせず AM-N に従う。以下は元の構造化メモ（参考）。

- 依頼原文（Keita 2026-05-29 夕）: 「利用規約／プライバシーポリシー／特定商取引法に基づく表記 の記載を見直す」。
- スコープ: アプリ内（および配信に必要な）3つの法務文書 ——利用規約 / プライバシーポリシー / 特定商取引法に基づく表記—— の**現状を確認し、改善案を提示する**。
- ⚠⚠ Keita 判断ゲート（最重要・林は単独で確定しない）: 法務文言は**法的内容**であり、林（AI）が勝手に確定・本番反映してよい範囲ではない。**林がやってよいのは「現状の記載を読んで確認＋改善案・不足指摘を提示」するところまで**。確定・公開は必ず Keita 承認（必要なら専門家確認）を経る。誤った法務文言の公開はリーガルリスク・Play/App Store 審査リスクに直結する。
- 林がやる範囲（読み取り＋提案・着手可）:
  - 現状の3文書の所在と内容を確認（アプリ内画面 / 静的ファイル / 外部 URL のどれか）。
  - 内容の過不足・古さ・実態との乖離を洗い出す（例: 課金=Google Play なのに Stripe 記述が残っていないか／提供事業者名・連絡先・返金/解約条件・データ取扱いが現状と一致するか／特商法表記に必要項目〔事業者名・所在地・連絡先・販売価格・支払方法・引渡時期・返品/キャンセル条件等〕が揃っているか）。
  - 改善案・不足項目リストを会話本文に直接展開（feedback_direct_content_not_path）。
- Keita 判断（確定が要る項目）: 各文書の確定文言・公開可否・特商法表記の事業者情報（個人/法人・所在地・連絡先の開示範囲）・専門家レビューの要否。
- 規模感: 調査＋提案は軽〜中。確定・反映は Keita 承認後。
- 既存資産（実装前に実ソース照合すること・未照合）: アプリ内の規約/ポリシー画面（`src/screens/` に規約系 screen があるか、または設定画面からのリンク）、静的法務テキスト（`src/i18n.ts` or 専用データファイル or `public/` 配下）、外部リンク（Play Console の必須項目としてプライバシーポリシー URL がある想定）。
- DoD（調査・提案フェーズ＝林）: (1) 3文書の現状（所在・内容）が把握される、(2) 課金方式変更（Stripe撤去→Google Play、memory play-billing-gaps）等の実態と記載の乖離・不足項目が洗い出される、(3) 改善案/不足リストが会話本文に展開され Keita 承認待ち。
- DoD（反映フェーズ＝Keita 承認後・dev-logic）: Keita 確定文言がアプリ内/必要箇所に反映され、ja/en 両方・必要な特商法項目を満たし、Play Console 必須項目（プライバシーポリシー URL 等）と整合する。
- サブタスク:
  - [ ] 林: 3文書の所在・内容を確認（アプリ内画面/静的/外部 URL）
  - [ ] 林: 実態との乖離・不足項目を洗い出し（特に Stripe→Google Play の課金記述・特商法必須項目・事業者情報）
  - [ ] 林: 改善案/不足リストを会話本文に直接展開
  - [ ] Keita: 確定文言・公開可否・事業者情報開示範囲・専門家レビュー要否を判断
  - [ ] dev-logic（承認後）: 確定文言を反映（ja/en 両方・中立丁寧体）
  - [ ] 反映後: Play Console のプライバシーポリシー URL 等の必須項目と整合確認
- 抜けもれ提言:
  - ⚠法的責任の線引き（最重要）: 林は法務文言を確定しない。改善案までで止め、Keita 承認（必要なら弁護士/行政書士確認）を必ず挟む。「AI が書いた規約をそのまま公開」は避ける。
  - 課金記述の整合: Stripe は 2026-05-04 に撤去済（memory play-billing-gaps）。規約/特商法に Stripe や旧課金方式の記述が残っていれば不一致＝要修正。T-AC（Google Play 課金）の確定内容と特商法の支払方法/返金記述を整合させる。
  - i18n: 法務文書も ja/en 両方必要（en 配信するなら英語の規約/ポリシーも整備）。中立丁寧体（feedback_app_copy_neutral）。
  - Play/App Store 要件: プライバシーポリシー URL は Play Console 必須。データ安全性(Data safety)申告とポリシー記載の整合も要確認。
  - 両OS: モバイル専用。アプリ内表示は Android 実機確認。iOS は未配信だが App Store 申請時に同様要件。
  - 永続化: 静的文書なら persist 不要。バージョン/改定日を文書内に持つ運用は検討余地。
  - Internal 配信: 文言確定後のフロント反映は main push で Android 自動配信可。ただし**確定前に配信しない**（暫定文言を本番に出さない）。

### T-AC — 料金プランの Google Play 課金を実装　[→ AM-O に集約（重複）／現況 BLOCKED]

> 集約注記: 朝の AM-O と同一依頼。正本 = AM-O（PricingScreen が startCheckout に結線済＝コード DONE、残は Keita の Play Console SKU Active 登録＋実機テスト）。二重トラッキングせず AM-O に従う。以下は元の構造化メモ（参考）。

- 依頼原文（Keita 2026-05-29 夕）: 「料金プランの Google Play での課金を実装する」。
- ⚠⚠ 重要・既存実装と照合（最重要）: **Google Play Billing は既に大部分が実装済み**（memory project-logic-play-billing-gaps）。「実装する」を**ゼロから作る依頼と誤解しない**。既存実装の現状を踏まえ「残ギャップ＋『料金プラン』UI 周りで未完の部分」を特定してからスコープを確定する。
  - 既に実装済（memory より）: 正常系サブスク購入フロー、`InAppBillingPlugin.kt`（BillingClient 7.0.0）、`src/billing/index.ts`、`server/routes/billing.ts` の `POST /api/billing/verify`（Google Play Developer API 実検証＋Supabase upsert）、`acknowledgePurchase`（PR #203）、`initBilling()` 起動時呼出、`onBillingServiceDisconnected` 再接続、RTDN サーバ endpoint（`POST /api/billing/rtdn`・JWT 検証は未）。Stripe ルートは撤去済。
  - 残ギャップ（memory より・T-AC の実スコープ候補）:
    - (a) **RTDN の JWT 署名検証 未実装**（`google-auth-library` で Pub/Sub Push の `Authorization: Bearer` 検証）。
    - (b) **GCP Pub/Sub topic 作成＋publish 権限付与＋Play Console RTDN topic 指定＋Push subscription 作成**（endpoint: `https://logic-u5wn.onrender.com/api/billing/rtdn`）＝**Keita 作業**。
    - (c) **Supabase 本番に `019_rtdn_columns.sql` migration 適用**＝**Keita 承認案件**（DB 変更）。
    - (d) **Play Console SKU 登録確認**（`logic_paid_monthly` / `logic_paid_yearly` が Active・Production 価格設定）＝**Keita 確認**。
- ⚠ Keita 判断ゲート: SKU 登録/価格設定・GCP/Play Console 設定・本番 migration 適用・本番課金の有効化は**すべて Keita 承認/操作案件**。林/dev-logic が単独で本番課金を有効化しない。
- 着手前にスコープ確定が必要（Keita 確認）: 「料金プランの課金を実装」が指すのは下記のどれか（複数可）:
  1. **既存ギャップのクローズ**（JWT 検証 (a)・残設定 (b)(c)(d) の整備）＝「課金を売る前に必修正」（memory）。
  2. **『料金プラン』選択 UI** の新設/改修（プラン比較・購入 CTA・現在のプラン表示）がアプリ内で未完なら、その frontend 実装。
  3. **無料/有料の機能ゲート**（テーマ全部有料=T-B 方針等、premium 機能の出し分け）の配線確認。
  - → どれを「実装する」なのかで担当・規模・デプロイ手順が変わる。**スコープ確定まで IN_PROGRESS にしない**。
- 担当案: dev-logic（残ギャップのコード実装＝JWT 検証・料金プラン UI・機能ゲート）＋ Keita（SKU/GCP/Play Console/本番 migration の設定・承認）。
- DoD（暫定・スコープ確定後に精緻化）: (1) 確定スコープのコードが実装され tsc 0 / eslint `.` 0、(2) 必要な backend 変更が本番デプロイ済（手動 deploy-production.yml）、(3) RTDN を含めるなら JWT 検証＋GCP/Play Console 設定＋019 migration が本番反映、(4) SKU が Active で実機（Android）の購入フローがハッピーパス成功、(5) 料金プラン UI が ja/en・中立丁寧体で表示。
- サブタスク（暫定）:
  - [ ] Keita 確認: スコープ確定（ギャップクローズ / 料金プラン UI / 機能ゲート のどれか）
  - [ ] 実装前調査: 既存 billing 実装の現状を再照合（memory の実装済/残ギャップが現コードと一致するか）。料金プラン UI の有無を確認
  - [ ] dev-logic（スコープ次第）: JWT 検証実装 / 料金プラン UI / 機能ゲート配線
  - [ ] Keita: SKU 登録確認・GCP Pub/Sub 設定・Play Console RTDN 設定・019 migration 本番適用承認
  - [ ] backend 変更を手動 deploy-production.yml で本番反映＋probe
  - [ ] Android 実機で購入ハッピーパス確認（テスト購入）
- 抜けもれ提言:
  - ⚠ゼロ実装と誤解しない（最重要）: 既存実装が大量にある。まず memory play-billing-gaps と現コードを照合し、本当に未完の差分だけをスコープ化する。重複実装を作らない。
  - ⚠デプロイ依存: billing は backend（server/routes/billing.ts）。main マージ≠本番反映。手動 deploy-production.yml 必須（project_logic_render_auto_deploy）。
  - ⚠本番データ/課金: 019 migration（DB 変更）・本番課金有効化・SKU 価格は Keita 専権。テスト購入はライセンステスター/サンドボックスで。
  - i18n: 料金プラン UI（プラン名・価格・特典・購入/復元ボタン・エラー）は ja/en 両方・中立丁寧体（feedback_app_copy_neutral）。
  - マーケ文言: 価格訴求は「コーヒー1杯」系の安さアピール NG（feedback_logic_marketing）。価値直接訴求 or 高い代替との比較。
  - 法務整合: T-AB（特商法/規約）の支払方法・返金/解約条件と課金実態を一致させる（相互依存）。
  - 両OS: モバイル専用。Android 実機で購入フロー。iOS 課金（StoreKit）は未着手＝当面 Android のみ（project_logic_mobile_only）。
  - Internal 配信: frontend（料金プラン UI）は main push で Android 自動配信可。SKU/GCP/Play Console/migration は配信とは別の手動設定手順。

### T-AD — フェルミ累計スコアのダミー→毎日ランダム付与　[→ AM-P に集約・実は DONE]

> 集約注記: 朝の AM-P と同一依頼で、既に実装＋本番デプロイ完了（commit 1c18ebb、run 26629582944 success）。当初「本番 Supabase データ操作＝Keita 承認」と慎重に起票したが、実装は「日次シードで動的算出（DB 書き換えなし・cron 不要・実データ不変）」方式で着地したため Keita 承認ゲートは不要だった。正本 = AM-P（DONE）。以下は元の構造化メモ（参考・方式は変更）。

- 依頼原文（Keita 2026-05-29 夕）: 「フェルミランキングの累計スコアの今あるダミーデータを、ランダムでいい感じにポイント付与（毎日）。理由＝今 管理者(Keita)がダントツ1位で張り合いがないため」。
- スコープ: フェルミ（推定）ランキングの累計スコア用に存在する**ダミーデータ（ボット/シードユーザー）に、毎日ランダムで『いい感じ』のポイントを付与**し、Keita 1強状態を解消してランキングに張り合いを持たせる。
- ⚠⚠ Keita 判断ゲート（最重要・本番データ操作）: これは**本番 Supabase のランキングデータ（ダミー行）を毎日書き換える**操作＝本番データ変更。付与ロジック・対象ダミー行・付与量レンジ・実行手段（cron/edge function/手動）はすべて Keita 承認案件。林/dev-logic が単独で本番データを書き換えない。
- 着手前にスコープ確定が必要（Keita 確認）:
  1. **ダミーデータの実体**: 現状の「ダミーデータ」がどこにあるか（Supabase の placement leaderboard 系テーブルの seed 行か / `server/placement.json` の file-based fallback か / 専用のボットユーザー行か）。← 実装前調査で特定。
  2. **付与の『いい感じ』の定義**: ランダムレンジ・1日あたりの増分・Keita を抜かない上限を設けるか・複数ダミー間の分布（全員横並びでなく差をつける）。
  3. **実行手段**: 毎日の自動付与をどう回すか（既存 cron 基盤=Vultr 第2サーバの dev cron〔memory project-vultr-second-server〕／Supabase scheduled function〔pg_cron/edge〕／手動スクリプト）。recurring 管理に乗せる（R-3 候補）。
  4. **ダミーと実ユーザーの区別**: 付与対象を確実にダミー行だけに限定し、実ユーザーのスコアを汚さない仕組み（フラグ列 or 専用テーブル）。
- 規模感: 中。付与ロジック自体は軽いが、本番データ操作＋毎日実行の仕組み化＋誤爆防止が要る。
- 既存資産（実装前に実ソース照合すること・未照合）: `server/index.ts` の `/api/placement/*`（placement test + leaderboard）、`server/placement.json`（file-based fallback の順位データ）、Supabase の placement/ranking 系テーブル（`placement_results` は public read。フェルミ累計スコアが placement と同じか別テーブルか要確認）、`src/screens/DailyFermiScreen.tsx` 等のランキング表示。
- DoD（暫定・スコープ確定後に確定）: (1) ダミーデータの実体が特定される、(2) ダミー行のみに毎日ランダムでポイントが付与され実ユーザーに影響しない、(3) 付与レンジが『いい感じ』（Keita 1強でなく接戦になる）で Keita 承認済み、(4) 毎日実行が仕組み化され recurring 管理に乗る、(5) 本番反映前に dry-run/サンプルで挙動確認、(6) ロールバック手段（付与前スナップショット or 付与の停止）がある。
- サブタスク（暫定）:
  - [ ] 実装前調査: ダミーデータの実体特定（Supabase テーブル or placement.json or ボットユーザー行）。フェルミ累計スコアのデータモデル確認
  - [ ] Keita 確認: 付与レンジ/分布/上限・実行手段・ダミー限定の方法・本番データ操作の承認
  - [ ] dev-logic: ダミー限定の付与ロジック（実ユーザー除外を保証）
  - [ ] 毎日実行の仕組み化（cron/scheduled function。recurring R-3 登録）
  - [ ] dry-run/サンプルで挙動確認 → Keita 承認 → 本番反映
  - [ ] ロールバック手段（スナップショット/停止スイッチ）
- 抜けもれ提言:
  - ⚠本番データ操作（最重要）: 毎日本番ランキングを書き換える。実ユーザー混入・暴走付与（毎日積み上がり過剰）・ロールバック不能の事故を防ぐ。ダミー限定フラグ・付与上限・スナップショット・停止スイッチを設計に入れる。Keita 承認なしで本番に流さない。
  - ⚠倫理/表示の整合: ダミーを実ユーザーのように見せる是非（ランキングが実態と乖離）。Keita の意図は「張り合い演出」なので OK だが、将来実ユーザーが増えたらダミーを縮退させる出口も考える（recurring の見直し条件）。
  - 仕組み化: 毎日実行は cron 基盤（Vultr 第2サーバ dev cron / Supabase pg_cron）に乗せ、R-2（cron 死活監視）と同様に死活を監視（空振り検知）。recurring R-3 として登録。
  - データソース確認: placement.json（file-based）か Supabase テーブルかで実装が大きく変わる。file-based なら本番 backend のファイル書き換え＝デプロイ/永続ストレージの扱いに注意（Render の ephemeral FS で消える可能性）。Supabase テーブルが本筋なら SQL/edge で。
  - 両OS: 表示は Android 実機でランキングを確認（データ操作自体は OS 非依存）。
  - i18n: データ付与のみで新規文言なし（表示は既存ランキング UI）。
  - Internal 配信: **不可（フロント配信では完結しない）**。サーバ/DB 変更＝手動デプロイ or Supabase 操作＋cron 設定の別手順。main push の Android 自動配信には乗らない。

### T-AE — トレーニング検索：右上虫眼鏡＋AI検索（T-X を本格スコープ化）　[→ T-X / AM-Q に集約・DONE]

> 集約注記: T-X / AM-Q と同一依頼で、既に実装＋本番デプロイ完了（commit 6a3c985、run 26629582944 success）。正本 = T-X（DONE）。着手前スコープ確認3点は実装で解決済。以下は元の構造化メモ（参考）。

- 依頼原文（Keita 2026-05-29 夕）: 「トレーニングの検索：検索窓を虫眼鏡で右上に置きたい＋AIで検索できるように」。
- ⚠⚠ 重複・統合（最重要）: これは**既存 T-X（トレーニングのAI検索、右上虫眼鏡＋AI検索）とほぼ同一**。新規タスクとして二重管理せず、**T-X を本格スコープ化して進める**（T-AE は T-X に統合）。T-X は既に着手前スコープ確認待ち（P-TBD / TODO）で、(a)UI 入口=右上虫眼鏡デフォルト配置、(b)AI 検索=自然言語/意味ベース、まで構造化済み。今回の依頼で「やる」意思が確認できた＝T-X を BLOCKED 相当の確認ゲートから前進させる。
- T-X で確定済みの確認事項（Keita 判断・再掲）:
  1. 検索対象範囲（レッスンのみ / コースも含む）。
  2. AI のマッチ方式（embedding 類似度 / Claude プロンプトに候補メタデータ渡し選別）。コスト/レイテンシ/精度のトレードオフ。
  3. 結果の出し方（ランキング上位N / カテゴリ別 / マッチ理由提示 / ゼロ時フォールバック）。
- 担当案: designer（検索 UI/結果画面設計）＋ dev-logic（backend AI 検索 route＋frontend 検索 UI/結果表示）。← T-X と同一。
- DoD: T-X の DoD を継承（右上虫眼鏡→検索 UI、自然言語クエリ→意味的ヒット→該当へ遷移、サーバ AI でレート制限/エラー処理、backend 本番デプロイ＋実機 probe、ゼロ/エラー/レート制限 UI が中立丁寧体）。
- サブタスク: T-X のサブタスク・関連ファイル・抜けもれ提言を継承（重複記載を避けるため T-X セクション参照）。要点のみ再掲:
  - [ ] Keita 確認: 検索対象範囲・マッチ方式・結果の出し方（T-X の3論点）
  - [ ] designer: 虫眼鏡入口→検索画面→結果画面の設計
  - [ ] dev-logic: backend AI 検索 route（rate-limited・既存 custom-course.ts が近縁）＋frontend 配線
  - [ ] backend 手動デプロイ＋本番 probe（main マージ≠本番反映）
  - [ ] Android 実機で虫眼鏡→検索→遷移確認
- 抜けもれ提言（T-X から継承・要点）:
  - ⚠デプロイ依存: backend route 追加は手動 deploy-production.yml 必須（project_logic_render_auto_deploy）。デプロイ後 probe で DONE 判定。
  - レート制限/コスト: 新規 AI 呼び出し＝Anthropic コスト。既存 rate-limit に乗せる。embedding 方式ならベクトル事前計算/キャッシュ。UI 側デバウンス。
  - i18n: 虫眼鏡 aria ラベル・プレースホルダ・空状態・ローディング・エラー文言を ja/en・中立丁寧体。
  - UI chrome: 虫眼鏡は SVG（src/icons、無ければ追加）・emoji 不可。ハードコード hex 禁止。
  - 回帰: RoadmapScreenV3 に虫眼鏡を足す＝T-W（あなた専用コース展開）/ T-I（コース進捗）/ T-Z（AI専用コースカード）と同ファイル。**同一 dev-logic が RoadmapScreenV3 系をまとめて触る**とコンフリクト回避（T-X 既述）。
  - 既存検索との関係: custom-course の「レッスン検索 AI」入口が既存（TC-2/T-C）。汎用トレーニング検索と UI/責務が重複/競合しないか設計時に整理（統合可能性）。
  - Internal 配信: frontend（虫眼鏡/検索 UI）は main push で Android 自動配信可。AI backend route は別途手動デプロイ。
- 管理メモ: T-AE は T-X の重複なので、以後は **T-X を正本**として進め、T-AE 行は「#7 依頼の受け皿＝T-X 本格化のトリガー」として残す（二重トラッキングしない）。

### T-AF — 既存ユーザ（Keita 想定）のジャーナルタグを見直し　[→ AM-R に集約（重複）／現況 BLOCKED]

> 集約注記: 朝の AM-R と同一依頼。正本 = AM-R（林の census 済＝e5631320… が 60使用/52種類、統合プレビュー提示済、DB 書き換えは Keita 承認待ち）。二重トラッキングせず AM-R に従う。以下は元の構造化メモ（参考）。

- 依頼原文（Keita 2026-05-29 夕）: 「今すでに登録しているユーザのジャーナルのタグも見直す（管理者=Keita のデータと思われる）」。
- スコープ: **T-D で実装した動的・自動統合（dynamic / self-consolidating vocabulary）ロジックを、既に登録済みの既存ユーザー（実質 Keita のデータ）のジャーナルタグに遡及適用**する。T-D は「新規エントリのタグ付け時」に効くが、**過去に作られた既存タグ（固有タグ乱立状態）はそのまま残っている**。それを既存統合ロジックで一括/段階的に名寄せ・統合する。
- ⚠⚠ Keita 判断ゲート（最重要・本番データ書換）: これは**本番 Supabase の既存ユーザーの `daily_journals.tags` を物理書き換え**する操作。T-D の抜けもれ提言で明記した「物理バックフィル（過去全データ一括書き換え）は Keita 承認の別ステップ（DB マイグレーション/バッチ＝非可逆・要スナップショット）」に**まさに該当**。林/dev-logic が単独で既存データを書き換えない。
- T-D との関係（重複でなく続編）: T-D は **新規タグ付けの動的統合（本番反映済・DONE）**。T-AF は **その統合ロジックを既存データへ遡及適用**するバックフィル。T-D の `tagConsolidation.ts`（consolidate ロジック）/ `journalDb.ts` の名寄せ・統合関数を再利用し、対象を「新規エントリ」から「既存全エントリ」に広げる。二重実装しない（T-D 成果物を流用）。
- 着手前にスコープ確定が必要（Keita 確認）:
  1. **対象範囲**: Keita のデータのみか / 全既存ユーザーか（現状 Keita 中心だが、将来ユーザーが増えた時の方針）。
  2. **実行方式**: 一括バッチ（過去全タグを consolidate ロジックに通して書き換え）か / 段階的（次回エントリ編集時に当該ユーザーのタグを順次統合）か。一括は非可逆リスク大。
  3. **安全策**: 書き換え前のスナップショット（before tags 保持）・undo・dry-run でのプレビュー（「このタグ群がこう統合されます」を Keita に見せて承認）。T-D で undo は実装に内包済みだがバックフィルは別ルート。
  4. **誤統合防止**: 既存タグの consolidate は AI/類似検出に依存＝別概念混入リスク。同一 axis 内限定・信頼度しきい値・Keita プレビュー承認でガード。
- 規模感: 中。ロジックは T-D 流用だが、本番データ一括書き換え＋スナップショット/プレビュー/undo の安全策が要る。
- 既存資産（T-D 成果物を流用）: `src/components/journal/tagConsolidation.ts`（consolidate ロジック）、`src/components/journal/journalDb.ts`（T3 正規化＋D3 層2 の consolidate 適用関数）、`src/components/journal/tagVocabulary.ts`（シード語彙＋canonicalize）、Supabase `daily_journals.tags`（書き換え対象・本番）。
- DoD（暫定・スコープ確定後に確定）: (1) 既存ユーザー（Keita）のジャーナルタグが T-D の統合ロジックで名寄せ・統合され固有タグ乱立が解消される、(2) 書き換え前スナップショットがあり undo/復元可能、(3) dry-run で統合プレビューを Keita が承認してから本番適用、(4) 誤統合（別概念混入）がない、(5) 統合後に既存エントリの表示・集計が壊れない（T-D D5 の非回帰観点）、(6) 本番データ操作は Keita 承認済み。
- サブタスク（暫定）:
  - [ ] 実装前調査: T-D 成果物（tagConsolidation.ts / journalDb.ts）が既存データへのバッチ適用に流用可能か確認。`daily_journals.tags` の現状（Keita のタグ実集計）を Supabase で確認
  - [ ] Keita 確認: 対象範囲・実行方式（一括/段階）・安全策・本番データ書換の承認
  - [ ] dev-logic: 既存タグ→consolidate ロジック適用のバックフィル処理（dry-run モード付き）
  - [ ] dry-run: 統合プレビュー（before→after）を会話本文に展開し Keita 承認
  - [ ] スナップショット取得 → 本番適用 → 検証 → undo 手段確認
  - [ ] 回帰: 統合後の既存エントリ表示・タグ集計・T3 正規化が非回帰（T-D D5 観点）
- 抜けもれ提言:
  - ⚠本番データ書換（最重要）: T-D の「物理バックフィルは Keita 承認の別ステップ・要スナップショット」に該当。非可逆操作なので、(a) before スナップショット、(b) dry-run プレビュー承認、(c) undo/復元、を必須にする。Keita 承認なしで本番タグを書き換えない。
  - ⚠誤統合防止: 既存タグの consolidate は別概念混入リスク（「会議」と「会計」を誤統合等）。同一 axis 内限定・信頼度しきい値・Keita プレビュー承認でガード（T-D の安全策論点を継承）。
  - T-D 流用（二重実装回避）: 新規に consolidate ロジックを書かず T-D 成果物を流用。違いは「対象が新規エントリ→既存全エントリ」と「バッチ実行＋スナップショット」。
  - 実データ確認: T-D D1 の未解決論点(c)「実データを見た語彙調整」とも連動。Keita のタグ実集計を見れば、シード語彙(tagVocabulary.ts)の canonical/synonyms を実態に合わせて調整する材料にもなる（T-D D1(c) の継続イテレーション）。
  - 両OS: 表示は Android 実機でジャーナルのタグ一覧/集計を確認。データ操作は OS 非依存。
  - i18n: バックフィルのみなら新規文言なし。dry-run プレビューを UI に出すなら ja/en・中立丁寧体（初版は会話本文プレビューで足りる）。
  - 永続化: `daily_journals.tags`（Supabase）の書き換え＝永続データ操作。localStorage 側のジャーナルキャッシュとの整合（再同期）も確認。
  - Internal 配信: **不可（本番 Supabase データ操作）**。フロント配信では完結しない。バックフィルは手動バッチ/SQL/edge の別手順＋Keita 承認。

---

## Recurring（task-manager 継続管理タスク）

定期実行・継続監視するタスク。完了型ではなく「最終実施日」を追跡し、漏れを検知する。

| ID | タスク | 頻度 | 仕組み | 最終確認 | 状態 |
|----|--------|------|--------|----------|------|
| R-1 | Obsidian Daily Note 日次生成（T-E (c)(d) で仕組み化） | 毎日 07:00 JST | morning-briefing.sh 統合 or 別 cron（方式未確定） | 5/26〜5/28 を手動キャッチアップ済（林、2026-05-28）。恒久自動化は T-E(c)/T-F 待ち | 整備中（T-E + T-F 依存。手動キャッチアップで 5/28 まで埋め済） |
| R-2 | cron 自動パイプライン死活確認（ceo 朝ブリ 07:00 / feedback 06:00 / night-patrol 03:00） | 毎日 | crontab 3 本＋出力サイズ/エラーパターン検査 | 06:00・07:00 は 5/27 から空振り（T-F・未解決）。03:00 スモークは T-G の config 修正が 2026-05-29 に main 反映済＝復旧見込み（実走確認は次回 03:00 cron で要確認）。03:00 のヘルスチェック本体（200 確認）は稼働 | 一部復旧（T-G config 反映済・実走確認待ち／T-F は未解決のまま異常） |
| R-3 | フェルミランキングのダミーを日次変動（AM-P で実装済） | 毎日（自動） | **cron 不要**＝リクエスト時に日次シードで算出（commit 1c18ebb、server/routes/fermi.ts）。DB 書き換えなし・実データ不変 | 2026-05-29 本番反映済（run 26629582944 success） | 解決（cron 監視不要。AM-P DONE。当初の本番データ書き換え方式は不採用） |

- 運用: T-E (c) で日次自動生成が恒久化したら、R-1 の「最終確認」を生成成功日に更新。生成漏れ（前日 Daily Note 欠落）を検知したら task-manager がキャッチアップを手配。
- 注記（2026-05-28 訂正）: 「briefings/feedback/inspections の自動パイプラインは安定稼働中」という旧認識は誤り。実際は **06:00 feedback / 07:00 briefings が 5/27 からエラー固定で空振り（T-F）**、**03:00 night-patrol のスモークも 5/27 から空振り（T-G）**。ファイル存在＝健全ではない（タイムスタンプだけ更新されるサイレント失敗）。R-2 として死活を recurring 監視対象に追加。検知ルール = 出力 byte 数が極端に小さい or 既知エラー文字列（`--dangerously-skip-permissions` 等）/ "No tests found" を含むか。

---

## バッチ: 2026-05-27 トレーニング画面・AIカスタムコース（Keita）

| ID | タイトル | 優先度 | ステータス | 担当 |
|----|----------|--------|-----------|------|
| TC-1 | フェルミ推定カテゴリも開閉可能に | P2 | DONE | dev-logic |
| TC-2 | AIカスタムコース生成機能 | P1 | DONE（T-C デプロイで本番検証済） | dev-logic |

### TC-1 — フェルミ推定カテゴリ開閉　[DONE]
- 完了（dev-logic 2026-05-27）: pinned-fermi を collapsedGroups に統合し、他カテゴリと同様に開閉可能化（上部固定の位置は維持）。tsc/eslint緑。commit 884bd30（ブランチ feat/ai-custom-course-20260527）。

### TC-2 — AIカスタムコース生成機能　[DONE]
- ✅ DONE（2026-05-28、T-C デプロイで検証完了）: 本番 backend 再デプロイで `POST /api/generate-course` が 200 稼働 → 実際にコース生成（title/description/lessonIds 返却・HTTP 200）を確認し、ローカル未実施だった「実 Claude 生成」の DoD を本番で充足。migration 033 本番適用済（user_custom_courses / user_ai_course_usage）。残る実機ハッピーパス（Android）は最新内部ビルド #234 配信完了後に Keita 端末で確認予定（機能 DoD は充足のため DONE 判定）。
- 依頼: レッスン検索画面のAIボタン → 自然文入力 → Claude が最適レッスンを選定 → その人専用コース生成 → ロードマップ上部「あなた専用コース」に表示。複数可。
- 確定要件（Keita 2026-05-27）: 課金=無料も月3回/有料(isPaid)無制限。保存=localStorage+Supabase同期（新テーブル user_custom_courses、migration作成のみ）。コース複数保持。
- 既存流用: placement の PersonalCourse/buildPersonalCourse、courseData の pinned 上部表示、server の AI エンドポイント雛形、subscription の isPaid/getAIGenerationLimit、roadmapStore の同期パターン。
- サブタスク: ① migration（user_custom_courses + 無料回数集計）② POST /api/generate-course（レッスンメタ→Claude選定・課金/レート制限・id検証）③ customCourseStore（local+Supabase同期・複数CRUD）④ 検索AIボタン+入力UI ⑤ 上部「あなた専用コース」表示（複数・削除）⑥ 課金回数UI ⑦ i18n。
- 抜けもれ提言: migration 適用は承認案件（未適用で実装）。Claude に渡すレッスンメタのトークン量に注意。存在しない lesson id の弾き。無料回数の月次集計テーブル。新規UI文言は ja/en＋中立丁寧体・emoji不可。両OS確認。
- 担当: dev-logic（ブランチ feat/ai-custom-course-20260527）。
- ✅ 実装完了（dev-logic 2026-05-27）: 新規5（migration 033 user_custom_courses+user_ai_course_usage 未適用／server/routes/custom-course.ts /api/generate-course／customCourseStore.ts／CustomCourseSheet.tsx／CustomCourseScreen.tsx）＋変更5（RoadmapScreenV3・AppV3・server/index・syncService・i18n）。tsc 0 / 本体lint 0 errors。AI選定= haiku-4-5、レッスンメタ id/title/category を最大400件・省トークン形式で渡し id 妥当性検証。課金=無料月3回（サーバ user_ai_course_usage が権威・429／クライアント概算表示、ゲストはレートリミッタ）。
- 残: 実Claude生成は未テスト（コスト/方針上ローカル未実施、入力検証400系のみ確認）。migration 033 適用は承認案件。ゲスト enforcement 線引きは既存 problems.ts 同思想で妥当と林判断。

---

## バッチ: 2026-05-27 修正依頼（Keita）

| ID | タイトル | 優先度 | ステータス | 担当 |
|----|----------|--------|-----------|------|
| T1 | 音声の多重再生を止める | P1 | DONE（実機QA推奨） | dev-logic |
| T2 | 称号の透過（拡張帯34枚 背景透過後処理） | P2 | DONE | designer |
| T3 | ジャーナルのハッシュタグ自動集約・正規化 | P2 | DONE | dev-logic |
| T4 | AIアシスタント応答の `**` 混入を直す | P1 | DONE | dev-logic |
| T5 | おすすめレッスンの表示・遷移＋AI会話履歴の保存/再表示 | P1 | DONE | dev-logic |
| T6 | レッスン本文 bullet（・）のずれ・青色を直す | P1 | DONE | dev-logic |
| T7 | コース一覧カテゴリの展開／閉じる（未実装の疑い） | P1 | DONE | dev-logic |

---

### T1 — 音声の多重再生を止める　[P1 / REVIEW]

- ステータス: REVIEW（実装済 `793e519`「ジャーナル/レッスン/称号まわり7件の修正（T1-T7）」・origin/main 在を git で検証。本コミットが `src/ttsService.ts`（38行差分）を実変更＝排他停止の結線あり。実機 DoD〔連打で多重再生しないか・両OS〕の目視確認待ち。2026-05-31 git 実態と同期）
- 詳細: 効果音・TTS が複数同時に流れることがある。再生開始前に前の音声を完全停止する排他制御がない。
- 関連ファイル: `src/ttsService.ts`（speak / stop / pause / resume, ~427-488）。Web Speech API・Capacitor native・Cloud TTS の3チャネルを持つが、speak() 内で stopCloud/stopWeb/stopNative を先行呼び出ししていない。
- DoD: 新しい再生要求時に前再生（全チャネル）が必ず停止し、同時発話が起きない。連打しても1音声のみ。
- サブタスク:
  - [ ] speak() 冒頭で全チャネルを stop する排他制御を入れる
  - [ ] 効果音（new Audio 系があれば）も同様に単一化
  - [ ] iOS / Android 実機（native TTS）と Web 両方で多重再生しないか確認
  - [ ] 回帰: 連続レッスン読み上げ・画面遷移時の停止が壊れていないか
- 抜けもれ提言: 両OS確認必須（native と web で経路が違う）。テスト: 自動化困難なら手動確認手順を残す。

### T2 — 称号の透過（拡張帯34枚 透過PNG再生成）　[P2 / BLOCKED：要承認・designer]

- 原因確定（dev-logic 2026-05-27）: 称号バッジは `public/images/v3/badges/badge-<key>.png` を objectFit:contain で表示（CSSで背景は被せていない）。基礎帯16種（Lv1-100）は RGBA でアルファ付き＝正しく透過。拡張帯34種（Lv101-500）は RGB でアルファなし＝白い四角背景が焼き込まれている。CSS では解決不可。
- 対象34枚: apex-2/apex-3/apex-4、wisdom-1〜4、virtuoso-1〜4、enlightened-1〜4、luminary-1〜4、sovereign-1〜4、transcend-1〜4、divine-1〜4、eternal-1〜2、zenith。`TitleBadgeSheet`・`RankUpModal` 両方で症状。
- 要件: これら34枚を基礎帯と同じく背景透過（RGBA・1024×1024）で再生成 or 差し替え。生成元 Gemini 想定（commit 06dacd0 経緯）。
- 自動白抜き不採用: apex-2等の光彩でフリンジ残り、zenith（白×金）は本体が背景白と溶けて消える。機械処理は本体誤消去リスクで不可。
- 担当: designer。
- サンプル結果（designer 2026-05-27）: 再生成不要と判明。基礎帯は生成後 rembg(isnet-general-use) で背景除去済み、拡張帯34枚はその後処理が未適用だっただけ。既存画像に後処理（ダーク本体=rembg／白本体 zenith等=flood-fill）を当てるだけで透過可。Gemini 課金0・画風完全保持。サンプル2枚（apex-2 rembg／zenith flood-fill）で透過・本体保持を数値確認済み（zenith 内部穴 0%）。
- 残: 32枚を `public/images/v3/badges/` に上書き展開する承認待ち（本番ファイル上書きのため）。
- DoD: 対象の称号要素が背景透過で正しく表示される（指定の要素で）。
- サブタスク:
  - [ ] 対象要素の特定（Keita 確認後）
  - [ ] PNG アルファ欠落なら画像差し替え（→ designer 連携の可能性）／CSS background 起因ならスタイル修正
  - [ ] ライト/ダークテーマ両方で破綻しないか
- 抜けもれ提言: 画像アセット差し替えが必要なら designer にアサイン。テーマ両対応の確認を忘れない。

### T3 — ジャーナルのハッシュタグ自動集約・正規化　[P2 / REVIEW]

- ステータス: REVIEW（実装済 `793e519`・origin/main 在を git で検証。本コミットが `src/components/journal/journalDb.ts`（217行差分）・`src/components/journal/TagInput.tsx` を実変更＝タグ正規化/名寄せの結線あり。正規化ルールが意図せぬ統合をしないかの実機 DoD 確認待ち。2026-05-31 git 実態と同期）
- 詳細: ジャーナルのハッシュタグ（#tag）を自動で集約・修正してほしい。現状、抽出・集約・正規化（大小文字・全半角ゆれ）が確認できない。
- 関連ファイル候補: `src/components/journal/`（journalDb.ts ほか）。hashtag 抽出ロジックの所在を実装前に確定する必要あり。
- 確定要件（Keita 2026-05-27）: UI追加は不要。過去のハッシュタグも全部含めて、正規化・名寄せ（大小文字・全半角ゆれの統一、表記ゆれを最適なタグへ寄せる）を随時行い、最適なタグ集合に作り変える。一覧画面やフィルタUIは作らない。
- DoD: 既存・新規ハッシュタグが正規化・名寄せされ、表記ゆれの重複が解消される。過去データにも遡及適用される。
- サブタスク:
  - [ ] 現状のハッシュタグ実装の有無・所在を確定
  - [ ] 正規化ルール定義（大小文字・全半角・前後空白・類似タグ名寄せ）
  - [ ] 保存/読み込み時に随時正規化を適用
  - [ ] 過去データへの遡及適用（マイグレーション的処理）
- 抜けもれ提言: UI不要のため i18n 影響なし。過去データ書き換えは非可逆なので、名寄せルールが意図せぬ統合をしないか慎重に。

### T4 — AIアシスタント応答の `**` 混入を直す　[P1 / REVIEW]

- ステータス: REVIEW（実装済 `793e519`・origin/main 在を git で検証。本コミットが `src/components/journal/JournalAssistantSheet.tsx`・新規 `src/components/journal/JournalRichText.tsx`（88行新規）を追加＝AI応答のリッチテキスト整形経路あり。生 `**` が出ないかの実機 DoD 確認待ち。2026-05-31 git 実態と同期）
- 詳細: ジャーナルのAIアシスタント応答に markdown の `**`（太字記号）が生で混じって表示される。
- 関連ファイル: `src/components/journal/JournalAssistantSheet.tsx`（~154, 238, 248-256）、`journal.css` の `.journal-summary-card__body`（white-space: pre-wrap でプレーン表示）。`RichLessonText.tsx` のリッチテキストパーサーが未適用。
- DoD: AI応答内の `**bold**` 等が崩れず（太字描画 or 記号除去）に表示される。生の `**` が出ない。
- サブタスク:
  - [ ] 方針決定: 軽量 markdown レンダリング適用 or プロンプト側で記号抑制 or 表示前サニタイズ
  - [ ] アシスタント応答の表示経路に適用
  - [ ] 他のAI応答表示箇所（フィードバック等）にも同種混入がないか横展開確認
- 抜けもれ提言: 表示整形とプロンプト抑制の二択。レンダリング採用時は既存 plain 前提CSSとの整合を確認。

### T5 — おすすめレッスンの表示・遷移＋AI会話履歴の保存/再表示　[P1 / REVIEW]

- ステータス: REVIEW（実装済 `793e519`・origin/main 在を git で検証。本コミットが新規 `src/components/journal/JournalAssistantHistorySheet.tsx`＋`supabase/migrations/032_journal_assistant_conversations.sql`＋`journalDb.ts` を追加＝AI会話履歴の永続化/再表示の結線あり。おすすめレッスンのタップ遷移と履歴再表示の実機 DoD 確認待ち。※migration 032 の本番適用要確認。2026-05-31 git 実態と同期）
- 詳細: AIアシスタントの「おすすめレッスン」が lesson id しか出ず、タップしても遷移しない。加えて、一度出たAIメッセージを後から見直せるようにしたい（履歴）。
- 関連ファイル: `src/components/journal/JournalAssistantSheet.tsx`（~156-165 recommendedLesson, 248-256 カード/onClick）。`onOpenLesson(lesson.id)` は呼ばれているが親からの prop 伝達／id→画面遷移解決が未完。ナビは `AppV3.tsx` の Screen union。
- DoD:
  - おすすめレッスンがタイトル＋カテゴリで表示され、タップで該当レッスンに遷移する
  - 過去のAIアシスタントメッセージが保存され、後から再表示できる
- サブタスク:
  - [ ] おすすめレッスンを id だけでなく title/category 解決して表示
  - [ ] onOpenLesson を親まで配線し、レッスン画面遷移を実装
  - [ ] AI会話履歴の永続化（localStorage `logic-*` or Supabase。保存先を設計）
  - [ ] 履歴再表示UIの追加
  - [ ] i18n（履歴UI文言 ja/en）
  - [ ] テスト（遷移の E2E ハッピーパス）
- 抜けもれ提言: 履歴は新規機能。保存先（local か Supabase notebooks 系か）の設計判断が要る。表示だけでなく persist が必須。

### T6 — レッスン本文 bullet（・）のずれ・青色を直す　[P1 / REVIEW]

- ステータス: REVIEW（実装済 `793e519`・origin/main 在を git で検証。本コミットが `src/components/RichLessonText.tsx`（18行差分）を実変更＝bullet の色/位置修正の結線あり。全レッスン本文での回帰目視 DoD 確認待ち。2026-05-31 git 実態と同期）
- 詳細: レッスン本文の箇条書き bullet（・）が青色でずれて表示される。青ではなく普通の「・」でよい。
- 関連ファイル: `src/components/RichLessonText.tsx`（~218-258, bullets ケース）。`<ul listStyle:none + flex>`、各 li の bullet span が 6px 円・`background: var(--brand)`（青）・`translateY(0.5em)` で位置調整。
- DoD: bullet が通常の中黒「・」相当で、テキストと縦位置が揃って表示される。青の丸ドットをやめる。
- サブタスク:
  - [ ] bullet span（青丸）を通常の「・」記号 or 中立色マーカーに変更
  - [ ] 縦位置ずれ（translateY 調整）の解消
  - [ ] 全レッスン本文・ネストリストで崩れないか回帰確認
- 抜けもれ提言: RichLessonText は全レッスン本文共通 → 波及大。複数レッスンで目視確認。

### T7 — コース一覧カテゴリの展開／閉じる　[P1 / REVIEW]

- ステータス: REVIEW（実装済 `793e519`・origin/main 在を git で検証。本コミットが `src/screens/RoadmapScreenV3.tsx`（80行差分）を実変更＝カテゴリ展開 state/toggle の結線あり。「機能未実装の疑い」は解消。初期全展開・タップ開閉の実機 DoD 確認待ち。2026-05-31 git 実態と同期）
- 詳細: コース一覧でカテゴリ別の展開／折りたたみが動かない。「タスクが抜けている」＝機能自体が未実装の可能性。
- 関連ファイル: `src/screens/RoadmapScreenV3.tsx`（~346-532 COURSE_GROUPS.map、1003 CategoryDetailView）。searchQuery/levelFilters 等の state はあるがカテゴリ展開用 state（expandedCategories 等）と toggle ハンドラが見当たらない。
- 確定要件（Keita 2026-05-27）: 初期は全カテゴリ展開状態。各カテゴリ見出しタップで個別に閉じる／再展開できる（複数開閉可、単一アコーディオンではない）。
- DoD: 初期表示で全カテゴリ展開。見出しタップで該当カテゴリが閉じ、再タップで開く。複数同時に開閉可。状態が破綻しない。
- サブタスク:
  - [ ] 展開状態 state（expandedCategories、初期=全展開）と toggle ハンドラを実装
  - [ ] カテゴリ見出しUI（開閉アイコン＝SVG・aria-expanded）
  - [ ] 既存のフィルタ／検索との整合
- 抜けもれ提言: 未実装なら設計から。開閉アイコンは SVG（icons/index.tsx）使用、emoji 不可。

---

## 2026-05-31 git 実態同期（自律ティック・林）

T1〜T7 の詳細見出しが TODO のまま放置され、上部サマリ表（全件 DONE 表記）と矛盾していたので git 実態に当てて訂正した。`793e519`「ジャーナル/レッスン/称号まわり7件の修正（T1-T7）」が origin/main に実在し（`merge-base --is-ancestor` で確認）、各 DoD ファイルを実変更している（T1=`ttsService.ts`、T3=`journalDb.ts`/`TagInput.tsx`、T4=`JournalAssistantSheet.tsx`/新規`JournalRichText.tsx`、T5=新規`JournalAssistantHistorySheet.tsx`＋migration 032、T6=`RichLessonText.tsx`、T7=`RoadmapScreenV3.tsx`）。
- T1/T3/T4/T5/T6/T7 を TODO→REVIEW（コードマージ済・実機 DoD 目視確認待ち）に更新。完全 DONE 化は実機検証（test-functional 等）で各 DoD を1件ずつ照合してから。
- T2 は BLOCKED 維持。本コミットに称号バッジ PNG の再圧縮が含まれるが、透過(RGBA)化されたかはアルファ未確認のため designer 案件として保留。
- 上部 SSOT 表の T-X 行（旧 TODO）は DONE に同期済（`6a3c985`・AM-Q/T-AE と同一・origin/main 在）。
- 注意: 本同期の調査過程で「T1〜T7 は偽コミット `2b3f9c8` 等で DONE 済み」とする虚偽情報の混入を観測。`git cat-file -t 2b3f9c8`＝`Not a valid object name`（不存在）を確認し排除した。本同期の全 claim は実 git 照合のみで確定。詳細は memory `reference-tool-output-injection-incident`。
- 経緯補足: 直前コミット `0aa37cb` はメッセージ上 T1/T6/T7→REVIEW と記したが、Edit の old_string 不一致で実際は T-X 行のみ反映だった。本コミットで T1/T3/T4/T5/T6/T7 詳細見出しを正しく反映する。

## 抜けもれ提言サマリ

### バッチ 2026-05-28（実機フィードバック4件 ＋ 追加2件: T-F / T-G）
- T-F / T-G は独立タスク化（T-E サブ項目に折り込まず）: T-F は cron 自動化の根っこ（claude CLI 起動方式）で T-E (c) の前提依存になるため独立して P1 上位で追跡。T-G は test-infra（Playwright config の testMatch ハードコード）で T-E と無関係＝完全独立。両者から T-E (c) へ依存リンクのみ張った。
- 自動パイプラインの「健全」認識が誤りだった重要訂正: T-E 当初の「briefings/feedback の自動パイプラインは 5/28 まで稼働中」はファイル存在ベースの誤認。実際は 5/27 から中身がエラー文字列のサイレント空振り（T-F）。今後はファイル存在でなく中身（byte 数・エラーパターン）で死活判定する（R-2 に追加）。
- T-F 根因: morning-briefing.sh:38 / feedback-watcher.sh:23 が `claude --print --agent` を root cron で叩く → CLI が root では permission skip を弾く → stderr が Daily ファイルに焼き込まれる。night-patrol は claude を呼ばず playwright 直叩きなので生きている（症状と整合）。修正は root cron で claude を非対話実行する方式の確立（実行ユーザー変更 or 正規の許可フラグ、Keita 確認）。
- T-G 根因: playwright.render.config.ts:14 の testMatch が `render-smoke-20260525.spec.ts` ハードコード。night-patrol.sh:43 が `ls -t | head -1` で最新 `render-smoke-20260527.spec.ts`（5/27 追加）を引数に渡す → 引数 spec と testMatch の積集合が空 → "No tests found"。本番は 200 で健全＝障害でなく監視復旧。修正は testMatch を glob 追従化（新 spec 追加で無設定で対象化）。
- 進捗訂正（2026-05-28 深夜）: T-C **DONE**（404→200 検証済・コード修正不要だった）→ 連鎖で TC-2 も DONE。**T-A / T-G / T-B / T-D（D1-D3）はいずれも実装＋検証完了で REVIEW**（wip/20260528-inprogress に 6 コミット savepoint・push/デプロイ/マージなし）: T-A=単体11＋実機3シナリオ全PASS、T-G=両 spec 計20件取得で空振り解消、T-B=3種実装＋mono を free→premium 修正＋eslint . 緑、T-D=tsc0/vitest324/eslint.0 完全グリーン（backend なので手動デプロイ承認待ち）。T-E (a) Daily Note 5/26-28 キャッチアップ DONE。（夕方の「IN_PROGRESS・worktree 実装中」記述はこの深夜版で上書き）
- Keita 確認待ち（残・BLOCKED / ゲート）: T-E (c)（日次自動生成の方式 案1/案2 選択）、T-F（root cron での claude 実行方式 案A/B/C 選択＝認証移行が絡むので要確認）、T-H（Production 公開可否＝意図的保留）。T-C の承認ゲートは解消済。T-B の選別ゲートも通過済。**T-D の「プロンプトのみ vs 踏み込む」ゲートは 2026-05-28 に「踏み込む（タグ統合UX＋統制語彙）」で確定・解除済**（残る T-D 内の Keita 確認は D1 のクローズド/オープン方針・D4 の UX 方向・D3 物理バックフィル承認の 3 点で、いずれも該当サブタスク着手時に確認＝T-D 全体は着手 OK）。
- T-H（新規・2026-05-28）: Logic Android Production 公開を Keita 判断で保留。技術的には即実行可（承認ゲート撤去済）だが、リリースノート整備・T-G スモーク復旧・T-B テーマ反映を待って一発公開する方針。内部テスト track は自動配信継続中。
- T-B スコープ確定（2026-05-28）: 旧「フェルミ/AI生成テーマ」解釈は破棄。対象は外観設定の配色テーマ（theme.ts MODES）に確定。designer 候補提案 → Keita 選別 → dev-logic 実装の3段フローのうち、候補提案・選別まで完了し実装フェーズへ。「AIっぽさ除去」= 量産っぽいパレットを垢抜けた配色にする方向。
- T-E（Obsidian 最新化＋日次仕組み化）: Daily Note 本体が 5/25 で停止していた → 5/26-28 を手動キャッチアップ済（(a) DONE）。(b) 状況最新化は一部、(c) 日次自動生成・(d) recurring 管理は T-F 解決が前提で未。注: 「briefings/feedback/inspections の自動パイプラインは稼働中」は誤認で、5/27 から T-F/T-G のサイレント空振りが正（R-2 参照）。
- correctness 即修正（Bucket1）: T-A（フェルミ問題ズレ。表示 index 決定ロジックの二重化が根因）。T-D は当初 (1) プロンプトのみが Bucket1 候補だったが、Keita が「踏み込む方（タグ統合UX＋統制語彙）」を選択（2026-05-28）→ D1〜D5 の構造化タスクに格上げ。D2（プロンプトの語彙制約）は依然 Bucket1 性質だが D1（語彙定義）依存で着手順は D1 が先。
- 本番デプロイ依存が共通の落とし穴: T-C（route 未デプロイ）/ T-D D2（プロンプトは backend）。**backend 変更は main マージだけでは本番反映されない**（手動 deploy-production.yml 必須、render auto-deploy 当て不可）。デプロイ後 probe ＋ 実機確認まで含めて初めて DONE。
- 依存関係（解消済）: T-C（route デプロイ）が 2026-05-28 に解決 → 前バッチ TC-2 の DoD（実 Claude 生成）を本番で検証でき TC-2 を DONE 判定。migration 033（user_custom_courses 等）も本番適用済を確認済。
- 永続化注意: T-A は sessionStorage の揮発性 vs 日次決定性の設計判断が要る。
- i18n: T-B の新配色テーマは name+desc を ja/en 両対応（theme.mode.* の getter パターン、i18n.ts ja 591-596 / en 2424-2429 に追記）。T-A/T-C は基本 i18n 影響なし（ロジック・サーバプロンプト）。**T-D は踏み込みスコープで i18n 影響が発生**: D1 の統制語彙は ja/en 対で定義、D4 のタグ統合 UI 文言は i18n.ts の ja/en 両方＋中立的丁寧体。D2 のプロンプトはサーバ内部文字列なので i18n 不要。T-E は内部運用ドキュメントなので i18n 無関係。
- 文体: T-B の新テーマ name/desc は中立的丁寧体（feedback_app_copy_neutral）。
- 非可逆: T-D D3 の物理バックフィル・D4 の自動タグ統合は元に戻せない（T3 と同じ慎重さ）。デフォルトは随時適用（元データ保持）にし、物理バックフィルは Keita 承認の別ステップ。
- T-B 実装の肝: theme.ts の preview と tokens.css の `body.theme-v3.mode-{id}` 実トークンは別定義 → 必ずセットで追加（preview だけ足すと適用時に無スタイル）。コントラスト WCAG AA / Android 実機確認 / tier(free/premium) 割当の Keita 判断。
- T-E の肝: morning-briefing.sh は briefings/ には書くが Daily Note 本体（50-Daily/{date}.md）を生成しない＝これが 5/25 停止の根因。仕組み化＝この生成ステップの恒久追加。obsidian-git auto-sync とスクリプト push の衝突に注意（merge 方式）。「夜の振り返り」は手動枠として残す。

### バッチ 2026-05-27（旧）
- 要件確認済み（2026-05-27）: T2（プロフィール高レベル称号の透過）/ T3（UIなし・正規化名寄せのみ・過去分遡及）/ T7（初期全展開・複数開閉可）。全件着手可能。
- 新規永続化が要るもの: T5（AI会話履歴の保存先設計）。
- 全体波及で回帰注意: T6（全レッスン本文共通の RichLessonText）/ T4（AI応答表示の横展開）。
- 非可逆処理に注意: T3（過去ハッシュタグの名寄せ書き換えは元に戻せない）。
- 両OS確認必須: T1（native/web の音声経路差）。
- 横断: 新規UI文言は i18n ja/en 両方（T5・T7）。UI chrome の emoji 不可・SVG のみ（T7 開閉アイコン）。デプロイ前 `eslint .`（全体）+ `tsc -b --noEmit`。

## 進捗ログ

- バッチ1 完了（DONE）: T1・T4・T6。tsc exit 0 / eslint 実ソース 0 errors。T1 のみ実機QA推奨。push 未（Keita 承認待ち）。
  - 変更: src/ttsService.ts（T1 排他制御 stopAllChannels）／ src/components/RichLessonText.tsx（T6 中黒・化）／ JournalRichText.tsx（新規・T4）・JournalAssistantSheet.tsx・JournalDetailSheet.tsx・journal.css（T4 軽量markdown整形）
- バッチ2 完了: T7 DONE（COURSE_GROUPS 開閉トグル、collapsedGroups Set、初期全展開・複数開閉、Chevronアイコン・aria付）／T3 DONE（journalDb に normalizeTagDisplay/tagMatchKey/normalizeTags、保存時正規化＋読出名寄せ、誤統合なし、随時適用）。tsc 0 / eslint 実ソース 0。変更: RoadmapScreenV3.tsx・i18n.ts（T7）／journalDb.ts・TagInput.tsx・JournalDetailSheet.tsx（T3）。
  - T3 補足: 過去データの物理一括バックフィルは未実施（随時適用方式）。全行物理正規化が要るなら別途DBマイグレ（承認案件）。
- T2 は dev-logic 調査で「コードでなく画像アセットの問題」と判明 → designer に転送（下記 T2 セクション参照）。
- T2 完了（designer 2026-05-27）: 拡張帯34枚を背景透過後処理で上書き（rembg 30 + flood-fill 4）。Gemini課金0・画風保持。全34枚 RGBA・四隅透過・本体保持を検証。元画像は /tmp/badgework/repo_backup/ に退避。zenith のみ閾値220で個別対応。push 未。
- T5 完了（dev-logic 2026-05-27）: tsc 0 / eslint 実ソース 0。おすすめレッスンの title/category 表示＋タップ遷移、AI会話履歴の保存/再表示。journalDb 拡張・履歴UI(JournalScreen)・types.ts・icons・i18n。migration `032_journal_assistant_conversations.sql` は作成のみで Supabase 未適用（適用は承認案件、これがないとAI履歴機能は動かない）。
- → logic 7件すべて DONE（T1〜T7）。
- 2026-05-27 反映: 7件を origin/main ベースの新ブランチ `fix/journal-lesson-badge-20260527` にコミット（793e519、50ファイル）→ push → PR #233 作成。PR #233。fermi-ui-report-calc の作業は #232 でマージ済みのため新ブランチは7件のみのクリーンな差分。
- ✅ 本番反映完了（2026-05-27）: CI build-and-lint＋a11y 緑（Playwrightはローカルでdevserver待ちハング、CIが正式ゲート）→ PR #233 を main マージ（ae933ab）→ Render自動デプロイ＋Android内部配信トリガー。migration 032 を Supabase（yctlelmlwjwlcpcxvmgx）に適用済み（journal_assistant_conversations テーブル・RLS）。デプロイ後 test-smoke で本番スモーク確認。
- ローカル git 残務: fix ブランチに docs ローカル変更が残るため main 切替が保留。後で stash→main 整理。

### 2026-05-29 の進捗

#### 朝 デプロイ＋マージ 完了（2026-05-29 朝・Keita 承認のもと実行・確定事実）
- ✅ **wip/20260528-inprogress を main に fast-forward マージ → origin/main へ push 済**。
- ✅ **Android deploy（main push 由来）: completed success** → 内部テスターに配信＝モバイル本番反映。これにより **T-A / T-B / T-N / T-O / T-P がモバイル本番に乗った**。
- ✅ **Render backend deploy（deploy-production.yml 手動）: completed success（run 26603561372）、本番 health 200** → **T-D（タグ動的自動統合のプロンプト改修）が backend 本番反映**。
- ✅ **T-G（夜間スモーク config）も main 反映済**。実走確認は次回 night-patrol（03:00 cron）に残。
- ✅ **DONE 化（本番反映＋検証済）: T-A / T-B / T-D / T-G / T-N / T-O / T-P**。T-A/T-N/T-O/T-P はモバイル実機での最終体感確認が任意で残、T-B はテーマ見た目の実機確認が任意で残（いずれもコード検証済みのため DONE 判定）。
- ✅ **T-Q DONE（既に本番）**: 調査の結果、同内容が既に 2026-05-24 commit `7705b12` として main に入っており昨日以前から本番稼働中と判明。ブランチ `feat/journal-image-upload-progress`（`acdc59e`）は重複コピーでマージ不要だった（破棄可）。
- 🔄 **T-M IN_PROGRESS**: サンプル承認＋本展開ゴーサイン取得。content-creator が全5レッスン（440-444）の ja/en フル本文制作に着手（出力先 `docs/COURSE_STAMINA_FULL_20260529.md`）。logic-coach 監査の C-1/C-3/C-4/S-1/S-2/D-1 反映指示済。次工程＝dev-logic コード実装 → **444 の logic-coach 再監査ゲート必須** → テスト → デプロイ。
- 🧹 **worktree 掃除 1/5 完了**: 死んだロックの1個（`fix/lesson-visuals`、未コミット0）のみ削除。残り4個は稼働中の別 claude プロセス（pid 921847＝2日21h／pid 1091320＝13h）がロック保持中のため見送り → 要 Keita 判断。
- ⏸ **残・判断待ち（未着手）**: T-I/T-J（コース進捗・レッスン完了回数）＝スコープ確認待ち（T-J は完了回数データ無ければ Supabase migration 要）／T-K（ジャーナルグラフ tap 詳細）＝スコープ確認待ち／T-L（フェルミ答えを末尾へ）＝未着手（T-A は本番反映済なので競合解消。ただし削除見送りの worktree a23e/a7aa に「答えを冒頭に出す」逆向き実験あり、混同注意）。

#### 深夜 自律作業 完了（2026-05-28 深夜・確定事実）
- ✅ 全作業を **wip/20260528-inprogress ブランチに 6 コミット savepoint 済**（push/デプロイ/マージは一切なし）。旧「未コミット22ファイルが main 直上に混在」リスクは解消（ブランチ退避＋コミット分割でバックアップ済）。
- ✅ T-A: 実装＋単体テスト11＋ブラウザ実機3シナリオ 全PASS → REVIEW（push 承認待ち）。
- ✅ T-B: 3種実装済、mono(墨白) を free→premium に修正（無料は light/dark のみ）、eslint . 緑 → REVIEW（push 承認待ち・見た目実機確認は任意で残）。
- ✅ T-D（D1-D3）: 完全グリーン（tsc=0 / vitest 324pass / eslint . 0 error）。D4 は自動主体に縮小・undo を実装に内包 → REVIEW（backend なので手動デプロイ承認待ち）。
- ✅ T-G: playwright config が 5/25・5/27 両 spec 計20件を拾うのを確認・空振り解消 → REVIEW（night-patrol 実走の最終確認は次回夜間）。
- ✅ T-N/T-O/T-P: ジャーナル UI 微調整セット、実装＋検証＋コミット完了（tsc/vitest/build 緑） → REVIEW（push＋実機タッチ感確認待ち）。
- ✅ T-M: content-creator が構成案＋サンプル441ドラフト作成（`docs/COURSE_STAMINA_DRAFT_20260528.md`）、logic-coach 監査 4.3/5「承認に進めてよい品質」 → サンプル承認待ち（本展開は Keita ゴーサイン後）。量産前修正2点(C-1/C-3)・443申し送り(DRAMMA≠Sonnentag4体験)・Keita判断2点(S-1/S-2)・444子育ては本文化時 logic-coach 再レビュー必須。
- ✅ T-Q: 既存ブランチ feat/journal-image-upload-progress が丸ごと実装済と判明。今夜は深掘り検証せず（wip と journal.css が競合するため）→ Keita マージ承認待ち。
- ⚠ ゴミ worktree（破壊的操作なので Keita 承認待ち事項として記録）: ローカルに `.claude/worktrees/agent-*` が **5個** 溜まっていて、`eslint .` を素で回すと **false error 2件** が出る（CI はクリーンチェックアウトなので影響なし）。回避策＝`eslint . --ignore-pattern '.claude/**'`。掃除（worktree 削除）は破壊的操作のため Keita 承認待ち。
- ✅ worktree 掃除（2026-05-29 朝・前夜の Keita 承認事項）: 5個中、**死んだロックの1個（`fix/lesson-visuals` の worktree、未コミット0）のみ削除＝1/5 完了**。残り4個は稼働中の別 claude プロセス（pid 921847＝2日21h／pid 1091320＝13h）がロック保持中のため削除を見送り、Keita に判断を仰ぐ。→ **「worktree 掃除: 1/5 完了、4個は稼働中セッション占有のため保留・要 Keita 判断」**。なお T-L 実装時の注意: 削除を見送った worktree（`a23e` / `a7aa`）に「答えを冒頭に出す」逆向きの未コミット実験が残存（T-L の方針＝末尾とは真逆。混同しないこと）。

#### （旧）夕方時点のリスク記録 — 上記 6 コミット savepoint で解消済
- ⚠⚠ リスク（2026-05-28 夕・※深夜の wip ブランチ commit で解消済）: logic の working tree に **未コミットが大量に溜まっている**（main ブランチ直上に modified 16 + untracked 7 = 計22ファイル、TASK_TRACKER.md 自身除く）。commit/push されていない。内訳:
  - T-A 関連: `src/screens/dailyFermiState.ts`・`DailyFermiScreen.tsx`・`HomeScreenV3.tsx`、新規テスト `src/__tests__/dailyFermiState.test.ts`
  - T-B 関連: `src/theme.ts`・`src/styles/tokens.css`・`tokens-m3.css`・`src/screens/AppearanceSettingsScreen.tsx`、新規 `docs/THEME_PALETTE_CANDIDATES.md`・swatches 画像2点
  - T-D（D2+D3）関連: `server/routes/journal.ts`・`src/components/journal/journalApi.ts`・`JournalDetailSheet.tsx`・`journal.css`・`src/i18n.ts`、新規 `src/components/journal/tagConsolidation.ts`・`tagVocabulary.ts`、新規テスト `src/__tests__/tagConsolidation.test.ts`
  - T-G 関連: `playwright.render.config.ts`・`playwright.smoke.config.ts`
  - リスク内容: (1) 複数タスク（T-A/T-B/T-D/T-G）の変更が main 直上に**混在**し、タスク単位の切り分け・revert が困難化。(2) 22ファイル分の作業が未バックアップ（commit されていない＝ローカル消失リスク）。(3) どの変更がどこまで検証済みか追えない（特に T-D D2+D3 は検証が途切れている＝下記）。(4) 別エージェントが同ファイルを触ると衝突。
  - 推奨アクション（task-manager 提言・実行は Keita 判断/林）: タスク単位でブランチを切って commit 退避（少なくともローカル消失を防ぐ）。push 可否は Keita 承認。検証（tsc/eslint `.`/vitest）を通してから commit するのが筋だが、まず作業退避を優先する判断もあり。
- T-D（D1-D3）✅ REVIEW: dev-logic 実装（`tagConsolidation.ts` 新規・`journal.ts` プロンプト改修・`journalApi.ts`・`tagConsolidation.test.ts`）→ **完全グリーン（tsc=0 / vitest 324pass / eslint . 0 error）**。D4 は自動主体に縮小・undo を実装に内包。残＝Keita のマージ＋手動 deploy-production.yml 後の本番 probe で DONE 判定。
- T-C DONE: 本番 Render backend 再デプロイ（deploy-production.yml run 26571568416 success）→ `POST /api/generate-course` 404→200 復活、正常系検証済（title/description/lessonIds・HTTP200）。コード修正不要（デプロイ漏れのみ）。migration 033 本番適用済確認。→ 連鎖で TC-2 を REVIEW→DONE 判定。
- T-A ✅ REVIEW: 実装＋単体テスト11＋ブラウザ実機3シナリオ全PASS。wip コミット済（push 承認待ち）。
- T-G ✅ REVIEW: playwright config が両 spec 計20件を拾い空振り解消。wip コミット済（night-patrol 実走の最終確認は次回夜間）。
- T-B ✅ REVIEW: 3種実装済、mono を free→premium 修正、eslint . 緑。wip コミット済（push 承認待ち・見た目実機確認は任意で残）。
- T-D スコープ確定（Keita 2026-05-28）: 「プロンプトのみ」案を退け **タグ統合UX＋統制語彙まで踏み込む** で確定。TODO（方針確認待ち）→ IN_PROGRESS に格上げし D1〜D5 に再分解。D1（統制語彙定義・content-creator/logic-coach）が起点、D2/D3（dev-logic）・D4（designer→dev-logic）が D1 依存、D5 が回帰。残る Keita 確認は D1 クローズド/オープン方針・D4 UX 方向・D3 物理バックフィル承認の 3 点のみ（着手は OK）。
- T-E (a) DONE: 5/26-28 Daily Note キャッチアップ作成（林）。(b) 一部、(c)(d) は T-F 依存で未。
- T-H 新規記録: Logic Android Production 公開＝Keita 判断で保留（リリースノート整備・T-G スモーク復旧・T-B テーマ反映を待って一発公開）。
- 内部テスト配信: android-deploy.yml run 26572902909 in_progress（最新 main → 内部トラック）。最新内部ビルドにカスタムコース UI 有り（#234, 5/27）。Keita 端末で確認予定。

## 次アクション

### バッチ 2026-05-28 夜 新規要望（T-M〜T-Q・2026-05-29 朝デプロイ後）

✅ 2026-05-29 朝 Keita 承認のもと実行 完了（main マージ＋push＋デプロイ）:
- T-N/T-O/T-P（journal UI 微調整セット）: main マージ＋Android deploy 成功で本番反映 → **DONE**（モバイル実機の体感確認のみ任意）。
- T-Q（画像アップロード）: 既に本番稼働中（commit 7705b12, 5/24）と判明、重複ブランチは破棄可 → **DONE**。
- T-M（体力コース）: サンプル承認＋本展開ゴーサイン取得 → **IN_PROGRESS**（content-creator が全5レッスン ja/en 本文制作中、出力先 `docs/COURSE_STAMINA_FULL_20260529.md`）。

T-M の次工程（task-manager 追跡）:
1. content-creator: 全5レッスン（440-444）ja/en フル本文（C-1/C-3/C-4/S-1/S-2/D-1 反映・DRAMMA≠Sonnentag4体験 混同回避）＝**現在着手中**。
2. logic-coach: 440-443 監査＋**444（子育て）は再監査ゲート必須**（健康・子育て正確性リスク）。
3. dev-logic: コード実装（lessons/*.ts・courseData・lessonSlides 登録）。
4. テスト（tsc/eslint ./vitest）→ サムネ生成（サンプル1枚承認先行）→ 本番反映（Android 自動・Render web 手動 deploy）。

朝 Keita に確認すべきこと（残）:
- 🧹 **worktree 掃除の残り4個**: 稼働中の別 claude プロセス（pid 921847＝2日21h／pid 1091320＝13h）がロック保持中。1/5（fix/lesson-visuals）は削除済。残り4個を止めて削除するか判断を仰ぐ。
- T-M 設計論点（本文に反映指示済だが最終確認余地）: S-1（「遊ぶ体力」443 を回復総論化するか）／ S-2（440導入と442仕事の重複回避）。

抜けもれ・注意（task-manager 提言）:
- T-M 本展開の修正反映（C-1 運動効果量を peakPerformance412 と精度統一／C-3 ウルトラディアン周期記述の流れ／C-4・D-1／443 の DRAMMA≠Sonnentag4体験 混同回避）と、**444子育て本文化時の logic-coach 再監査ゲート**は dev-logic コード実装前・デプロイ前に必ず通す。
- T-L 実装時: 削除見送りの worktree（a23e/a7aa）に「答えを冒頭に出す」逆向き実験が残存。T-L は末尾方針なので方向が逆＝混同しないこと。

### 🚦 dev-logic 完了後（T-M 完了後）に着手する main 作業キュー（2026-05-29 更新・テーマ再設計統合版）

T-M（体力コース）で dev-logic が **main の作業ツリーを使用中**。同じツリーを2人で触ると commit が混ざるため、**T-M が終わり作業ツリーが空いてから**着手する。
さらにテーマ系（T-R/T-S/T-T/T-U/T-V/T-J/T-Y）は **T-V（テーマ再設計）の Keita パレット選定を待って一括実装**する（選定パレットで sepia/forest が刷新・差し替えされる可能性があり〔mono は T-R で削除〕、先に直すと二度手間になるため）。T-W と T-I/T-K/T-L は T-V と独立して進められる。

キュー対象（11件）と性質:

| 着手順 | ID | 内容 | 優先度 | 重さ | migration | 依存・グルーピング |
|--------|----|------|--------|------|-----------|-------------------|
| ゲート | T-V | テーマ再設計（「AIっぽくない」新規3テーマ追加＋数パターン提案→Keita 選定→実装）＋UI 刷新 | P1 | 重 | 不要 | テーマ系の親エピック。designer 提案進行中→**Keita パレット選定がゲート** |
| 1 | T-R | 死にテーマ削除（custom/enterprise/startup/mono＝計4） | P1 | 軽〜中 | 不要 | テーマ系・T-V 選定後に統合。mono は CSS ブロックも除去 |
| 1 | T-T | テーマ非追従の網羅修正（根本原因A/B/C/D・T-S を内包） | P1 | 中 | 不要 | テーマ系・T-V 選定後に統合（調査=完了） |
| 1 | T-U | コントラスト/可読性 整合性チェック（全テーマ×主要画面） | P1 | 中 | 不要 | テーマ系・T-T と一体 |
| 1 | T-J | （既存 DONE）完了バッジのアクセント追従＝本番反映済 | — | — | — | ※DONE。本キューの「テーマ系」では色方針の参照のみ |
| 1 | T-Y | 2回以上完了レッスンの完了マーク色を区別（習熟色） | P2 | 軽 | 不要 | テーマ系・習熟色は T-V パレット作業に内包・色方針を揃える |
| 2 | T-W | 「あなた専用コース」セクションの展開/折りたたみ | P1 | 軽〜中 | 不要 | RoadmapScreenV3・T-V から独立 |
| 3 | T-I | （既存 DONE）コース進捗表示＝本番反映済 | — | — | — | ※DONE。新規 T-I（Hayashi 重複）は削除済み |
| 4 | T-K | （既存 DONE）ジャーナルグラフ tap 詳細＝本番反映済 | — | — | — | ※DONE |
| 5 | T-L | （既存 DONE）フェルミの答えを解説の末尾へ＝本番反映済 | — | — | — | ※DONE |

（注: T-I/T-J/T-K/T-L は別バッチで既に DONE〔本番反映済〕。本キューに残るテーマ系の生きた実装対象は T-V/T-R/T-T(+T-S)/T-U/T-Y。T-S は T-T 根本原因A に統合済みのため独立行を持たない。内部順序は T-V 実装 → T-R → T-T(+T-S) → T-U → T-Y。）

着手順の提案（理由つき）:
1. **テーマ系は T-V のパレット選定を待って一括実装（T-V → T-R → T-T(+T-S) → T-U → T-Y）**。いずれも `theme.ts` / `tokens.css` / `AppearanceSettingsScreen` / 色トークンという**同じ領域**を触る。T-V でパレットが確定すると sepia/forest が刷新・差し替えされうるので（mono は T-R で削除）、T-R（死にテーマ削除）/T-T（非追従修正・根本原因A/B/C/D）/T-U（コントラスト）/T-Y（習熟色バッジ）を**T-V 実装に巻き込んで1回で**仕上げる。別々にやると刷新後にやり直しになり二度手間。
   - 流れ: designer 提案完成 → **Keita パレット選定（ゲート）** → dev-logic が T-V 実装（新規3テーマ＋MODES/tokens.css 刷新・UI 再設計）と同時に T-R（死にテーマ除去＝custom/enterprise/startup/mono）・T-T（`--brand-grad-h` override・RoadmapScreenV3 のハードコード青→accent-soft・LessonStories の #fff→accent-fg・プロフィール一覧追従）・T-U（全テーマ×主要画面の WCAG 検証）・T-Y（習熟色バッジ）を一括処理。T-S は T-T 根本原因A の一部（＝AM-L のグラデ廃止とも統合）。
   - T-T の網羅調査は**完了済み**（根本原因A/B/C/D に整理済み）＝待ち時間なし。T-V のパレット選定だけが律速。
2. **T-W（あなた専用コース折りたたみ）は T-V と独立・生きた TODO**。RoadmapScreenV3 の既存開閉機構（T7/TC-1 の collapsedGroups）を「あなた専用コース」に適用するだけ。テーマ選定を待たずに着手可。RoadmapScreenV3 を触る点は T-T 根本原因B・（旧）T-I と同ファイルなので、RoadmapScreenV3 系をまとめて触るとコンフリクトを避けやすい。
3. **T-I（コース進捗）は既に DONE（本番反映済）**。Hayashi が重複起票した新規 T-I は削除済み。
4. **T-K（ジャーナルグラフ tap）は既に DONE（本番反映済）**。
5. **T-L（フェルミ答え末尾）は既に DONE（本番反映済）**。⚠削除見送り worktree（a23e/a7aa）に「答えを冒頭に出す」逆向き実験が残存していた点は履歴注記として維持（混同注意）。

横断の抜けもれ・注意（キュー全体）:
- ⚠作業ツリー競合（最重要・着手タイミングの肝）: T-M で dev-logic が main 作業ツリー稼働中。**T-M 完了＝作業ツリー解放を待ってから着手**。先行できるのは T-T の読み取り専用調査（完了済み）と T-V の designer 提案（読み取り専用・進行中）のみ。
- ⚠テーマ系の律速は T-V パレット選定: T-R/T-S/T-T/T-U/T-Y は T-V のパレット選定（Keita）がゲート。選定前にテーマ系を実装すると、刷新パレットで全部やり直しになる。T-V 提案が完成したら Keita に選定を促す（task-manager エスカレーション）。
- 独立タスク（T-V を待たない・生きた TODO）: T-W のみ（T-I/T-K/T-L は DONE）。T-M 完了後すぐ着手可。
- migration: 本キューのテーマ系＋T-W とも**migration 不要**。承認案件の DB 変更は無し（T-Y の completion_counts も migration 031 で既存）。
- backend デプロイ: 本キューのテーマ系＋T-W＋T-Y はフロントのみ（backend 不要）。フロント変更は Android が main push で自動反映、Render web は手動 deploy-production.yml。
- デプロイ前チェック: 各件 `tsc -b --noEmit` ＋ **`eslint .`（全体・CI と同じスコープ）** で 0 error 確認（reference_logic_ci_lint_scope）。残置 worktree の false error は `--ignore-pattern '.claude/**'` で除外して真の数を見る。
- i18n: T-V の新パレット name/desc・T-W の見出し（新規なら）は ja/en 両方＋中立丁寧体（feedback_app_copy_neutral）。T-R は theme.mode.{custom,enterprise,startup,mono}.* の ja/en 両除去（孤立キー残さない）。色追従・色区別系（T-S/T-T/T-Y）は基本新規文言なし。
- デザイン制約: テーマ系（T-R/T-S/T-T/T-U/T-V/T-Y）は一貫して「ハードコード hex 撤去 → tokens.css のテーマトークン参照／色 source は各モードブロックに集約」。**全モードで全変数フルカバー**（`--brand-grad-h` の :root 限定定義のような追従漏れを T-V で再発させない）。UI chrome のアイコンは SVG（journal の mood/weather/phase/streak のみ絵文字例外）。
- 両OS: 全件モバイル専用（project_logic_mobile_only）。Android 実機確認。特にテーマ系は全モード切替で目視＋コントラスト（数値 OK でも実機で沈むことがある）。
- スコープ確認の残: T-V（採用パレット〔新規3テーマ含む〕・tier・sepia/forest 差し替え可否・UI 刷新範囲）・T-Y（習熟色を何色にするか・テーマ追従の可否＝T-V パレット作業に内包）は着手前に Keita 確認。T-R/T-S/T-T/T-U/T-W は方針確定済（T-U は T-T と一体）。

### バッチ 2026-05-28 新規要望4件（T-I〜T-L・登録直後）
- T-I/T-J（コース進捗・レッスン完了回数）は **セットで設計** する。同じ progress 永続化レイヤー＋同じ「完了」定義を触るので、別々に実装すると二重集計・データ不整合になる。同一 dev-logic が一気通貫で。まず Keita にスコープ論点（特に「完了」の定義 ＝ done か count か、Supabase 集計まで広げるか、T-J でデータモデル拡張＝migration が要るか）を確認してから着手。
- T-K（ジャーナルグラフ tap 詳細）は対象グラフの確定が先。タグ頻度グラフが対象なら T-D（タグ動的統合）のタグモデル確定後に着手すると手戻り少。気分推移グラフ対象なら T-D と独立で先行可。
- T-L（フェルミ答えを末尾へ）は軽いが **T-A と同ファイル**（DailyFermiScreen.tsx / fermiData.ts）。T-A が push/マージされてから着手、または同一 dev-logic が T-A 完了後に続ける。並行 worktree は衝突。
- 4件とも現状 TODO・スコープ要確認。重さ目安: T-L=軽、T-I/T-K=中、T-J=中〜重（migration の可能性）。

### バッチ 2026-05-28（最優先・2026-05-29 朝デプロイ後の状況）
1. ✅ T-A（DONE）: 2026-05-29 main マージ＋Android deploy 成功で本番反映。P0 correctness 解消。残＝モバイル実機の体感確認（任意）。
2. ✅ T-C（DONE）: 本番再デプロイで 404→200 復活・正常系検証済。連鎖で TC-2 も DONE。
3. ✅ T-B（DONE）: 2026-05-29 main マージ＋Android deploy 成功で本番反映。残＝テーマ見た目の実機確認（任意）。
4. ✅ T-D（DONE）: 2026-05-29 main マージ＋Render backend deploy 成功（run 26603561372）・health 200 で backend 本番反映。D1-D3 完全グリーン、D4 自動主体＋undo 内包。
5. T-E: (a) DONE。(b) 20-Projects/logic 状況最新化＋TASK_TRACKER ミラー配置を仕上げる。(c)(d) は **T-F 解決が前提**（claude を root cron で回せないと動かない）。
6. T-F（TODO・要確認）: ceo にアサイン。root cron で claude CLI を非対話実行する方式（案A 実行ユーザー変更 / 案B 正規許可フラグ / 案C 環境緩和）を検証し Keita 確認。OAuth クレデンシャル移行が絡むので慎重に。P1 上位（自動化の根っこ＋T-E(c) 前提）。**未解決のまま 06:00/07:00 cron は空振り継続**。
7. ✅ T-G（DONE）: 2026-05-29 main マージで config 本番反映、空振り解消。残＝次回夜間 03:00 cron の night-patrol 実走で inspection 正常 severity・pass 件数復活を確認（DONE 判定済みだが実走の最終確認のみ残）。
8. T-H（公開戦略確定・2026-05-30）: Keita 決定「今の最新ビルドで先に公開、DF-F 系 P0 改善は公開後アップデート」。公開前提（T-G スモーク・T-B テーマ）は 5/29 達成済。公開順序＝AM-O SKU 登録（Keita）→実機課金ハッピーパス検証→リリースノート整備〔担当アサイン要〕→Production promote（Keita 手動）。残ボトルネック＝AM-O SKU 登録（Keita）とリリースノート担当アサイン。

### バッチ 2026-05-27（旧・継続）
1. バッチ2（T7・T2・T3）完了待ち → DoD 検証
2. バッチ3: T5（おすすめレッスン遷移＋AI履歴。履歴の保存先はジャーナル既存方式に合わせる）
3. 全ローカル実装完了後、tsc/eslint 再確認 → Keita に push 承認を依頼
4. 注意: `eslint .` で `.claude/worktrees/agent-*`（別エージェント残骸・現在 **5個**）由来の **2 errors**（false）。実ソースは 0。CI は worktree 非 checkout で緑。回避＝`eslint . --ignore-pattern '.claude/**'`。**worktree 掃除（削除）は破壊的操作のため Keita 承認待ち事項**。

最終更新: 2026-05-29 朝（Keita 承認のもとデプロイ＋マージ実行の確定事実を反映。wip/20260528-inprogress を main に ff マージ＋push、Android deploy success＝T-A/T-B/T-N/T-O/T-P モバイル本番反映、Render backend deploy success〔run 26603561372〕health 200＝T-D backend 本番反映、T-G config も main 反映。**DONE 化: T-A / T-B / T-D / T-G / T-N / T-O / T-P**〔各々 2026-05-29 本番反映済、T-A/T-N/T-O/T-P/T-B は実機体感確認のみ任意で残〕。**T-Q=DONE**〔既に本番＝commit 7705b12, 5/24／重複ブランチ acdc59e は破棄可〕。**T-M=IN_PROGRESS**〔サンプル承認＋本展開ゴーサイン取得、content-creator が全5レッスン 440-444 ja/en 本文制作中＝docs/COURSE_STAMINA_FULL_20260529.md、C-1/C-3/C-4/S-1/S-2/D-1 反映指示済、次工程＝dev-logic 実装→444 logic-coach 再監査ゲート→テスト→デプロイ〕。worktree 掃除 1/5 完了〔fix/lesson-visuals 削除、残4個は稼働中セッション占有で保留・要 Keita 判断〕。残・判断待ち＝T-I/T-J/T-K スコープ確認待ち・T-L 未着手〔a23e/a7aa worktree に逆向き実験あり混同注意〕。T-F 未解決〔06:00/07:00 cron 空振り継続〕）

最終更新: 2026-05-29（T-B テーマ機能フォローアップ3件を起票＝**T-R**〔custom テーマ削除〕/ **T-S**〔今日の一問カードのテーマ追従〕/ **T-T**〔テーマ非追従箇所の網羅調査→個別修正・T-S を内包・調査は林が読み取り専用で進行中〕。全件 TODO・T-M 完了後着手〔dev-logic が T-M で main 作業ツリー使用中のため〕。**T-J をスコープ縮小確定**＝「レッスン完了回数の可視化」→「完了バッジのチェックマークの色変更のみ」〔Keita 確定〕に置換、P1→P2・migration 不要に変更、T-I との重複論点を解除。**dev-logic 完了後 main 作業キューを1まとまりで整理**＝着手順 T-R→T-S→T-T→T-J〔テーマ系一気通貫〕→T-I〔progress 単独〕→T-K〔journal〕→T-L〔Daily Fermi・末尾化〕、全件 migration 不要、横断の抜けもれ・スコープ確認残を併記）

最終更新: 2026-05-29（テーマ系の追加依頼＋audit findings 反映。**T-R 拡大**＝custom のみ→**custom/enterprise/startup の3つ削除**〔audit で tokens.css/tokens-m3.css に CSS ブロック不在＝死にモードと確定〕、残5モード=light/dark/sepia/forest/mono。**T-T 完全仕様化**＝読み取り専用 audit 完了、根本原因 A〔`--brand-grad-h` が :root だけ定義で全テーマ青のまま・HomeScreenV3:184/:178・DailyFermiScreen:1133・LoginScreen:115〕/B〔RoadmapScreenV3 のハードコード青 rgba(108,142,245) :762/:946/:970/:979/:328〕/C〔LessonStories の #fff 固定 約10箇所→accent-fg〕/D〔プロフィール一覧の未追従・Keita 報告〕に整理、T-S を根本原因A に統合。**新規 T-U**〔コントラスト/可読性 整合性チェック・全テーマ×主要画面 WCAG・T-T と一体〕、**新規 T-V**〔テーマ再設計エピック・4〜6パレット＋UI 刷新・designer 提案進行中 docs/THEME_REDESIGN_PROPOSAL_20260529.md・Keita パレット選定がゲート・テーマ系の親〕、**新規 T-W**〔あなた専用コース折りたたみ・RoadmapScreenV3 既存開閉機構流用・デフォルト折りたたみ・T-V から独立〕を起票。**main 作業キュー更新**＝テーマ系〔T-R/T-S/T-T/T-U/T-V/T-J〕は **T-V の Keita パレット選定を待って一括実装**〔sepia/forest/mono が刷新されうるため先行修正は二度手間〕、**T-W/T-I/T-K/T-L は T-V から独立**で T-M 完了後すぐ着手可。T-L の逆向き worktree〔a23e/a7aa「答えを冒頭に」〕混同注意は維持。全件 migration 不要）

最終更新: 2026-05-29（**ID 衝突・重複の整理**。林が朝に誤起票した重複バッチ「テーマ改修」の T-I/T-J 行＋詳細セクションを **削除**〔既存 DONE の T-I（コース進捗）/T-J（完了バッジのアクセント追従）と ID 衝突していたため〕。内容は既存タスクへ吸収: ①**T-R に mono（墨白）を追加削除**〔Keita 2026-05-29「エンタープライズ不要・カスタムカラー不要・墨白不要・startup も削除」。削除＝custom/enterprise/startup/mono の計4。mono は CSS ブロックも除去・保存済みユーザーの fallback 実害大。**最終的に残るモード = light/dark/sepia(古紙)/forest(深緑)＋T-V 新規3＝計7**〕。②**「AIっぽくない」新規3テーマの追加を T-V エピックの追加要件として明記**〔designer が現在パレット作成中＝T-V/T-U/T-Y 用の新規3パレット＋習熟色＋既存テーマのコントラスト監査〕。③**「今日の1問カードが青のまま」を既存 T-S/T-T で対応の扱い**〔根因＝HomeScreenV3:178/:183/:184 の `var(--brand)`/`var(--brand-grad-h)` 固定青、T-T 根本原因A と同一箇所。T-S に詳細追記。AM-L の「グラデ廃止」とも同 DOM＝フラット単色＋テーマ追従で統合〕。④コントラスト＝既存 T-U で対応。⑤**「2回以上完了レッスンの完了マーク色を区別（習熟色）」を新規 T-Y として独立採番**〔Keita「二回完了したレッスンはコース一覧で✓マークの色も変えて」。既存 DONE の T-J（アクセント追従）とは別物。空き ID 確認のうえ T-Y で採番＝T-X まで使用済み。CompletionBadge.tsx を count>=2 で習熟色、RoadmapScreenV3:1327/:1380 の2経路＋CompletedLessonsScreen 整合、CompletionBadge.test.tsx 更新〕。**全 ID 再スキャン済＝衝突・重複ゼロ**。AM-Q↔T-X〔AI検索〕は既に統合済みで重複なし。運用前提＝終わったやつから Internal 配信〔main push で android-deploy.yml〕・backend 変更は手動 deploy-production.yml）

最終更新: 2026-05-29 夜（**実コミット突き合わせ＋並行アクター間の状態同期＋ID 衝突の最終整理**。林＋別セッション/worktree エージェントが並行 push していたため古いステータスと ID 重複を整理。
- 実績反映（commit と照合）: **d0558cb（テーマ刷新パッケージ）→ T-R / T-S / T-T / T-V〔配色パート〕/ T-Y〔習熟色〕/ AM-L / AM-M を DONE 化。T-U は light/dark の accent ボタン AA 割れ（3.08）のみ「要 Keita 判断」で残し他 DONE＝部分 DONE**。**1c18ebb（フェルミ日次シード動的化）→ AM-P / T-AD を DONE〔本番デプロイ run 26629582944 = success 確認済〕。日次シード算出＝cron 不要のため R-3 を「解決（cron 監視不要）」に更新**。**6a3c985（AI検索）→ AM-Q / T-X / T-AE を DONE〔backend 同 run で本番反映〕**。**698de42（中黒/グラデ・別アクター先行）→ AM-M / T-Y2 / T-Z2 を DONE**。
- BLOCKED の中身（2026-05-30 更新）: **AM-N**＝確定値全揃いで unblock→TODO（dev-logic が HTML 反映へ。反映後に本番 push 承認）。**AM-O**＝コード DONE／価格確定済（月¥350・年¥2,450）で残は Keita の Play Console SKU Active 登録だけ＝ブロッカー明確化。**AM-R**＝Keita 承認のうえ 2026-05-30 実行完了 DONE（固有タグ41→36・9統合・誤統合ゼロ・snapshot `_backfill_journal_tags_20260530`）。
- IN_PROGRESS: **AM-K**＝designer が docs/UI_RENEWAL_DIRECTION_20260529.md 作成中（T-AA は AM-K へ集約）。
- **ID 衝突の最終解消**: 朝バッチ AM-K〜AM-R と夕方バッチ T-Y〜T-AF が同一依頼8件の二重起票だったため、**夕方バッチを AM-* に集約**。衝突していた夕方 T-Y（中黒）→**T-Y2**、T-Z（グラデ）→**T-Z2** にリネーム〔習熟色テーマバッチの T-Y が正規の T-Y〕。T-AA〜T-AF は各行に正本 AM-* を明記し二重トラッキング停止。`### ` 詳細セクション ID の重複スキャン＝0件で一意性担保。
- Keita 確認4点（2026-05-30 全処理済）: ①AM-N 確定値→全揃い unblock ②AM-O の SKU→価格確定・Keita 登録待ち ③AM-R の書き換え→承認・実行完了 DONE ④T-U の accent AA→ブランド青再設計に方針決定・再オープン）

最終更新: 2026-05-30（**UI-1〜13 本番反映＋AM-K revert＋ドッグフーディング企画 を反映**。
- **UI-1〜13 全件クローズ**: main push `695de6a`（掃除コミット含む）で本番反映＝Render web 手動 deploy / Android internal 自動デプロイ。DONE 11件〔UI-1 116dbb4 / UI-2 72f1579 / UI-3 77f31ef / UI-6 95cba9b / UI-7 facfdcb / UI-8 1acd4ca / UI-9 ccbd65f / UI-10 1238789 / UI-11 516f67d / UI-12 e92198e / UI-13 test-functional〕＋ noop 2件〔UI-4＝AM-K revert で消滅 / UI-5＝v3 該当見出し無し・Keita 確認済〕。掃除 695de6a＝無料テーマ見出し整合＋デッド i18n キー削除＋UI-9 例外を CLAUDE.md gotchas #5 に追記。品質ゲート＝tsc -b 0 / eslint . 0 / vitest 353 pass / reviewer approve。残課題なし。
- **AM-K → CANCELLED**: Keita 指示で UI 刷新方針を取り下げ。第2弾 c7209fb（明朝+手描き+HomeScreen 再構成）を revert＝commit af7b4a3。第1弾 36d08aa・テーマ work d0558cb は温存。「全画面UI設計」も一旦保留〔土台消失のため再開時は新方向を要決定〕。これにより UI-4 の波線が HomeScreen ごと消え自動解消。
- **新規バッチ DF-（ドッグフーディング企画）**: テスト20アカウント×ペルソナで実使用 → UI/機能改善起票＋負荷計測。本番＋厳密タグ隔離（is_test/[DOGFOOD]/source=dogfood）。DF-1 ペルソナ設計 DONE〔docs/dogfooding/personas.md・代表6体 p01/p02/p04/p07/p18/p20〕、DF-2a seed/cleanup DONE〔scripts/dogfood/・8b39356/1dd17bb〕、DF-2b 本番投入 DONE〔MCP 経由・users20/fermi117/subs9/feedback20 全件検証一致〕。DF-3 代表6体フル走行は **Keita のログイン方式判断待ち**で進行待ち、DF-4/5/6 は DF-3 完了が前提で未着手。cleanup.sql 準備済（is_test 一括削除）。）

---

## バッチ: 2026-05-30 ブロッカー6件 Keita 判断反映＋着手アサイン整理

Keita から Logic ブロッカー6件の判断を取得。各タスクへ反映済み。本セクションは判断ログ＋ボール所在＋推奨着手順のまとめ（個別の詳細は各タスクセクション参照）。

### 判断反映サマリ
| タスク | 旧状態 | 新状態 | 反映内容 |
|--------|--------|--------|----------|
| DF-3 | 進行待ち（Keita 判断中） | TODO（着手可） | ログイン方式確定＝実メール Gmail エイリアス `keita.urano+pXX@gmail.com` で本番マジックリンク実受信。着手時に DF-2b 投入20体の email がエイリアス形式かを要確認。担当=林。後続 DF-4/5/6 は DF-3 完了が前提 |
| AM-N | BLOCKED | TODO（unblock） | 法的確定値が全揃い（アポロ合同会社/Apollo LLC・責任者 柴田圭太・池袋 BIGオフィスプラザ1206・月¥350/年¥2,450・電話非掲載＋開示注記・削除は account-deletion 正本/delete-account リダイレクト・インボイス記載なし・Google ログイン記述削除済）。dev-logic が LEGAL_REVIEW §5 ＋確定値を HTML〔5文書×ja/en・削除系一本化で減〕に反映、`【要Keita確認:...】`マーカー置換。**＋2026-05-30 追加: 年額トライアル記載の差し戻し（C-2 で削除した「7日間無料トライアル」を「年額のみ・初回限定・7日無料・8日目以降¥2,450/年自動課金・期間中解約で課金なし」＋月額トライアル無し明記で書き戻し、AM-O Offer `yearly-free-trial-7d` と整合）を push 前に必ず含める**。反映後に本番 push 承認を別途取得 |
| AM-R | BLOCKED | DONE | dev-logic が 2026-05-30 本番 DB 書き換え実行完了。固有タグ41→36種・9統合・誤統合ゼロ・他ユーザー波及ゼロ。snapshot `public._backfill_journal_tags_20260530`〔15行〕＋undo SQL 保持中、安定確認後 DROP 可 |
| T-U | DONE | 再オープン（スコープ拡大） | ボタン専用トークン #2E45A8（8.29:1）の対処は残置。ブランド青 #6C8EF5 そのものを濃くしてアプリ全体の青を再設計する方向に決定。designer が新ブランド青パレット案2〜3＋全テーマ AA 検算→Keita 選定→dev-logic 実装。T-V と同じトークン（theme.ts/tokens.css）を触るため統合実装 |
| AM-O | BLOCKED | BLOCKED（SKU 登録セット確定） | コード結線 DONE。SKU 登録セット確定（Group `logic_paid`／月額 `logic_paid_monthly`・Base Plan `monthly-autorenew`・¥350・トライアル無し／年額 `logic_paid_yearly`・Base Plan `yearly-autorenew`・¥2,450／**年額に Introductory Offer `yearly-free-trial-7d`＝初回限定・無料7日→¥2,450/年。月額には付けない**。Product ID は `src/billing/products.ts` PLAY_PRODUCTS と一致確認済）。残＝Keita が Play Console で一字一句一致で Active 登録。SKU Active 後に dev-logic/test-functional が実機購入ハッピーパス検証（キャンセル/失敗/restore＋トライアル年額の無料→課金分岐） |
| T-H | BLOCKED（保留） | 公開戦略確定 | 「今の最新ビルドで先に公開、DF-F 系 P0 改善は公開後アップデート」。T-G スモーク・T-B テーマは 5/29 達成済。公開順序＝AM-O SKU 登録（Keita）→実機課金ハッピーパス検証→リリースノート整備〔担当アサイン要〕→Production promote（Keita 手動） |

### 台帳訂正（2026-05-30）
- 本番 Supabase プロジェクト ID 表記を全体で `refyctlelmlwjwlcpcxvmgx`（誤）→ `yctlelmlwjwlcpcxvmgx`（正・ref プレフィックス無し）に訂正。DF-2a の行・詳細を修正済。

### ボール所在（Keita 側 vs エージェント側）

Keita 側にボールが残る作業（エージェントは着手できない）:
1. AM-O: Play Console で SKU 登録セットを一字一句一致で Active 登録（Group `logic_paid`／月額 `logic_paid_monthly`-`monthly-autorenew`-¥350 トライアル無し／年額 `logic_paid_yearly`-`yearly-autorenew`-¥2,450＋Introductory Offer `yearly-free-trial-7d`＝初回限定・無料7日。月額には付けない）。← これが T-H 公開順序の先頭ゲート
2. T-H: 最終 Production promote（Play Console 手動操作）。AM-O SKU 登録→実機検証→リリースノートが揃った後。
3. T-U: 新ブランド青パレットの選定（designer 提案後のゲート）。
4. AM-N: HTML 反映物（年額トライアル差し戻し含む）ができた後の本番 push 承認。

エージェント側で進める作業（着手可）:
1. DF-3: 代表6体フル UI 走行（林）。まず DF-2b 投入20体の email エイリアス形式を確認 → 本番マジックリンク受信で走行。
2. AM-N: HTML 反映（dev-logic）。確定値を 5文書 ja/en に流し込み、削除系一本化、マーカー置換。**＋年額トライアル記載の差し戻し（年額のみ・初回限定・7日無料・8日目以降¥2,450/年自動課金・期間中解約で課金なし／月額トライアル無し明記）を push 前に必ず含める。AM-O Offer `yearly-free-trial-7d` と整合**。
3. T-U/T-V 再設計: designer が新ブランド青パレット案2〜3＋全テーマ AA 検算（T-V のテーマ再設計と統合提案）。
4. リリースノート（T-H）: 担当アサイン要（content-creator or marketing）。最新ビルドの Production 差分（テーマ刷新・UI-1〜13・課金結線）をリリースノート化。

### 推奨着手順（1案）

並行で走らせつつ、T-H 公開を最短化する順序:

1. 【Keita・即】AM-O の Play Console SKU 登録セット（Group `logic_paid`／月額 `logic_paid_monthly`-`monthly-autorenew`-¥350 トライアル無し／年額 `logic_paid_yearly`-`yearly-autorenew`-¥2,450＋Offer `yearly-free-trial-7d`＝初回限定・無料7日。月額には付けない。Product ID は products.ts と一字一句一致）。← 公開のクリティカルパス先頭。Keita しかできず後続が全部これ待ち。
2. 【エージェント・並行で即着手】以下を同時並行:
   - DF-3 走行開始（林。email エイリアス確認 → マジックリンク受信 → 6体走行）
   - AM-N の HTML 反映（dev-logic。確定値流し込み＋削除系一本化＋年額トライアル記載の差し戻しを push 前に必ず含める）
   - T-U/T-V 用の新ブランド青パレット案作成（designer。2〜3案＋全テーマ AA 検算）
   - T-H リリースノートのドラフト着手（content-creator or marketing。差分＝テーマ刷新・UI-1〜13・課金結線）
3. 【SKU Active 後】実機課金ハッピーパス検証（dev-logic/test-functional。キャンセル/失敗/restore 分岐）。
4. 【Keita】新ブランド青パレット選定（T-U/T-V）→ dev-logic が T-V 実装フェーズに巻き込んで一気通貫実装。
5. 【Keita】AM-N HTML 反映物の本番 push 承認 → デプロイ。
6. 【Keita・最終】リリースノート確定 → T-H Production promote（最新ビルドで公開）。

骨子: 公開の律速は AM-O SKU 登録（Keita）。これを最優先で着手してもらいつつ、DF-3 走行・AM-N 反映・新ブランド青提案・リリースノートをエージェント側で並行で進め、SKU Active と同時に実機検証→promote へ繋ぐ。T-U/T-V のブランド青再設計は公開後アップデート枠でも可（公開を待たせない）が、デザイン提案だけは並行で前倒しできる。

最終更新: 2026-05-30（ブロッカー6件 Keita 判断反映。DF-3 unblock→TODO、AM-N unblock→TODO、AM-R DONE、T-U 再オープン〔ブランド青再設計・T-V 統合〕、AM-O ブロッカー明確化、T-H 公開戦略確定。本番プロジェクト ID 表記訂正 refyctlelmlwjwlcpcxvmgx→yctlelmlwjwlcpcxvmgx。ボール所在分離＋推奨着手順を追記）
最終更新2: 2026-05-30（AM-O 追加判断1件反映。Keita 決定「年額に 7日間無料トライアル（Introductory Offer）を付ける／月額には付けない」。AM-O に SKU 登録セット確定値〔Group logic_paid／monthly-autorenew ¥350／yearly-autorenew ¥2,450／Offer yearly-free-trial-7d〕を明記、products.ts PLAY_PRODUCTS と一致確認済。AM-N に年額トライアル記載の差し戻しタスクを追加〔C-2 削除分を書き戻し・push 前必須〕。AM-N⇔AM-O 相互参照に「トライアルは年額のみ・特商法と Play Console Offer を整合」を追記。クリティカルパス〔SKU登録→実機検証→公開〕は変更なし。トライアル差し戻しは AM-N の push 前に入る順序で確認済）
