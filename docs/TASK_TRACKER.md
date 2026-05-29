# TASK_TRACKER — Logic

task-manager エージェントが管理するタスク台帳の正本。
ステータス: TODO / IN_PROGRESS / BLOCKED / REVIEW / DONE / CANCELLED
更新は必ずこのファイルに反映する。

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
| T-F | cron 自動化の root 権限エラー修復（ceo 朝ブリ・feedback-watcher が空振り） | P1（上位） | TODO（要 Keita 方式確認） | ceo（自分のスクリプト群） |
| T-G | night-patrol 夜間スモークが "No tests found" で空振り（監視死） | P1 | DONE（2026-05-29 main マージで config 本番反映。playwright config が 5/25・5/27 両 spec 計20件を拾い空振り解消。night-patrol 実走確認のみ次回夜間に残） | dev-logic / test-smoke |
| T-H | Logic Android Production 公開（保留） | P1 | BLOCKED（Keita 判断で保留・技術的には即実行可） | Keita（公開判断） |

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

### T-H — Logic Android Production 公開（保留）　[P1 / BLOCKED：Keita 判断で保留]

- 記録（Keita 判断 2026-05-28）: Logic Android の **Production track 公開を保留**する。GitHub Production 環境の承認ゲートは撤去済（project_logic_render_auto_deploy）で技術的には即実行可能だが、**リリースノート整備・スモーク復旧（T-G）・テーマ反映（T-B）が揃ってから一発で公開する**方針。
- 現状: 内部テスト track には自動配信が回っている（main push ごと、project_logic_android_deploy）。Production への promote だけが保留。
- ステータス: BLOCKED（Keita の公開判断待ち＝意図的保留。緊急性なし）。
- 担当: Keita（公開タイミング判断）。準備タスク（リリースノート / T-G / T-B）は各担当が進行。
- DoD: リリースノート整備済 ＋ T-G（夜間スモーク復旧）DONE ＋ T-B（テーマ反映）本番反映済の状態で、Keita 判断のもと Production track へ promote される。
- 依存（公開の前提条件）:
  - T-G: 夜間スモークが復旧して本番死活監視が効いている
  - T-B: 新配色テーマが Android 実機で反映・破綻なし
  - リリースノート: Play Console 用のリリースノート整備（担当未アサイン → 公開前に手配）
- 抜けもれ提言:
  - 公開前チェック: Play Billing 既知ギャップ（project_logic_play_billing_gaps）の残課題（#2 RTDN の GCP/Play Console 設定・JWT 検証、#4 SKU 登録確認）が課金導線に影響。有料購読者が増える前にクローズ前提だが、Production 公開＝露出拡大なので公開判断時に再確認推奨。
  - リリースノートは ja/en 両方（Play Console の対応言語に合わせる）。中立的丁寧体（feedback_app_copy_neutral）。
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

### T-M — 「体力をつける」コースを作る　[P1 / IN_PROGRESS（サンプル承認＋本展開ゴーサイン取得・全5レッスン制作中）]

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

## バッチ: 2026-05-29 T-B テーマ機能フォローアップ＋テーマ再設計（Keita 朝・追加6件）

今朝デプロイした T-B（配色テーマ3種: 古紙/深緑/墨白、全部有料）の実機フォローアップ＋追加依頼。task-manager が構造化。実装は委譲。
全件 **TODO で登録、着手は T-M（体力コース）完了後＝main 作業ツリー解放待ち**（理由＝T-M で dev-logic が main の作業ツリーを使用中。同じツリーを2人で触ると commit が混ざるため、作業ツリーが空いてから着手）。
さらにテーマ系（T-R/T-S/T-T/T-U/T-J）は **T-V のテーマ再設計で Keita がパレットを選定したのを待って一括実装**するのが効率的（同じ theme.ts / tokens.css / AppearanceSettings を反復で触るのを1回にまとめる）。T-V がこれら全部を束ねる親エピック。

| ID | タイトル | 優先度 | ステータス | 担当案 | 関連 |
|----|----------|--------|-----------|--------|------|
| T-R | 死んでいるテーマ（custom / enterprise / startup）を削除（CSS ブロック不在＝選んでも無変化） | P1 | TODO（T-V パレット選定後に一括実装） | dev-logic | T-B と同じ theme.ts / AppearanceSettingsScreen。デッドコード除去。残5モード=light/dark/sepia/forest/mono |
| T-S | テーマを変えても「今日の一問」カード（Daily Fermi ホームカード）の色が変わらない → テーマ追従 | P1 | TODO（T-V パレット選定後に一括実装） | dev-logic | T-B の theme 追従漏れ。HomeScreenV3。T-T 根本原因A の一例。T-A/T-L と同じ Daily Fermi 周辺 |
| T-T | テーマ非追従の箇所を audit findings で完全仕様化 → 根本原因 A/B/C/D を個別修正 | P1 | TODO（調査=完了／修正=T-V パレット選定後に一括実装） | 林（調査・完了）→ dev-logic（個別修正） | T-S の親。T-B の追従漏れ全量。audit findings 確定済み |
| T-U | コントラスト/可読性 整合性チェック（全テーマ×主要画面で WCAG 検証・破綻潰し） | P1 | TODO（T-V パレット選定後・T-T 修正と一体） | dev-logic（＋必要なら test/QA 系） | Keita「白文字で見えない/ハイライト濃すぎを起こさない」。T-T と一体の QA |
| T-V | テーマ再設計エピック（数パターン追加・UI設計刷新・カスタマイズしやすく） | P1 | IN_PROGRESS（designer 提案ドキュメント作成中・読み取り専用） | designer（提案）→ Keita（パレット選定）→ dev-logic（実装） | Keita「まだAI感がある」。T-R/T-S/T-T/T-U/T-J を統合して一括実装する親エピック |

### T-R — 死んでいるテーマ（custom / enterprise / startup）を削除　[P1 / TODO（T-V パレット選定後に一括実装）]

- 📌 スコープ拡大（Keita 2026-05-29）: 当初「custom（HEX 自由指定）のみ削除」だったが、**enterprise / startup も削除に拡大**。残すモードは **light / dark / sepia / forest / mono の5つ**（ただし下記 T-V のテーマ再設計で sepia/forest/mono は刷新・差し替えの可能性あり）。
- 依頼原文（Keita 2026-05-29）: 「カスタムテーマは機能しておらず不要」＋「エンタープライズ不要・スタートアップ不要」。
- 🔍 audit 根拠（読み取り専用調査・完了済み）: **enterprise / startup / custom は `tokens.css` / `tokens-m3.css` に `body.theme-v3.mode-{id}` の CSS ブロックが一切存在しない**＝選んでも bg/card/text が変わらず何も起きない（applyTheme が `mode-{id}` クラスを付けるだけで対応 CSS が無い＝死んでいる）。一方 light / dark / sepia / forest / mono の変数定義は完全（欠落なし）と確認済み。つまり削除対象3つは「MODES には載っているが実体 CSS が無い空モード」。
- スコープ: `theme.ts` の `MODES` から `custom` / `enterprise` / `startup` の3エントリを除去し、関連のコード・UI・state・i18n を整理する。T-B で「テーマは全部有料」方針が固まり、実体のある5モードに整理した今、CSS ブロックの無い3モードは不要なデッドコード。
- 既存資産（実装前に実ソース照合すること）:
  - `src/theme.ts`: `MODES` 配列から `custom` / `enterprise` / `startup` の3エントリ除去。`applyTheme()` 内の custom 分岐（動的 hex 適用ロジック）。`ThemeState` 型の `customHex`（または相当フィールド）除去。`loadTheme` / DEFAULT マージで削除 id を参照している箇所。
  - `src/screens/AppearanceSettingsScreen.tsx`: custom テーマ選択 UI・HEX 入力欄（カラーピッカー / テキスト入力）・custom ハンドラ、および enterprise/startup の選択カード。
  - `src/styles/tokens.css` / `tokens-m3.css`: `mode-enterprise` / `mode-startup` / `mode-custom` セレクタは元々存在しない見込み（audit で不在確認）。実装時に念のため grep で確認し、あれば除去。
  - `src/i18n.ts`: `theme.mode.custom.*` / `theme.mode.enterprise.*` / `theme.mode.startup.*`（name + desc）の ja/en エントリ除去。
- DoD: (1) `MODES` に custom / enterprise / startup が存在しない、(2) applyTheme / loadTheme から custom 分岐・customHex が消え型エラーなし、(3) AppearanceSettings から3モードの選択 UI・HEX 入力が消える、(4) i18n の該当 theme.mode.* が ja/en 両方から消える（孤立キーを残さない）、(5) 残る5モード（light/dark/sepia/forest/mono）の選択・適用・persist が非回帰、(6) tsc 0 / eslint `.` 0、(7) Android 実機で外観設定が破綻しない。
- サブタスク:
  - [ ] 実装前調査: custom/enterprise/startup 参照箇所を全量 grep（theme.ts / AppearanceSettingsScreen / tokens.css / tokens-m3.css / i18n / その他 customHex 参照）
  - [ ] `theme.ts`: MODES から3エントリ除去・applyTheme の custom 分岐削除・ThemeState.customHex 等の型整理・loadTheme の参照除去
  - [ ] `AppearanceSettingsScreen.tsx`: 3モードの選択 UI・custom の HEX 入力欄・関連ハンドラ削除
  - [ ] `tokens.css` / `tokens-m3.css`: mode-{custom,enterprise,startup} セレクタがあれば除去（audit では不在見込み）
  - [ ] `i18n.ts`: theme.mode.{custom,enterprise,startup}.name/desc を ja/en 両方から除去（孤立キー残さない）
  - [ ] 永続化移行: localStorage `logic-theme` に既に custom/enterprise/startup が保存されているユーザーの fallback（読込時に未知 id → light か直近有効 mode へフォールバックして無スタイルにならないこと）
  - [ ] 回帰: 残5モードの選択・適用・persist。AppearanceSettings の表示崩れなし
  - [ ] tsc 0 / eslint `.`（全体）0
- 抜けもれ提言:
  - ⚠永続化フォールバック（最重要）: 既存ユーザーの localStorage に `mode: 'custom'` / `'enterprise'` / `'startup'` が保存されている可能性。削除すると、その値を読んだ時に MODES に無い id となり、applyTheme は `mode-{id}` クラスを付けるが対応 CSS が無く**無スタイル化**する恐れ（元々 enterprise/startup は CSS 不在で実質無スタイルだったが、明示的に弾く方が安全）。loadTheme で未知 id → 既定（light 等）へフォールバックする処理を必ず入れる。
  - i18n: theme.mode.{custom,enterprise,startup}.* を ja/en 両方から確実に除去（片方だけ残すと孤立）。未使用キーは lint で拾われない場合があるので grep で確認。
  - 両OS: モバイル専用（project_logic_mobile_only）。Android 実機で外観設定画面の表示確認。
  - テスト: 削除系だが、loadTheme の未知 id フォールバックは vitest 単体向き（保存値 'custom'/'enterprise'/'startup' → 既定 mode に解決されるか）。
  - 関連: T-V のテーマ再設計で残5モードのうち sepia/forest/mono が刷新・差し替えされる可能性があるため、**T-V のパレット選定後に T-R/T-S/T-T/T-U/T-J を同一 dev-logic がまとめて一括実装する**のが効率的（重複作業・コンフリクト回避）。
  - 注意: 「機能していない」は audit で裏取り済み（CSS ブロック不在）。削除方針は Keita 確定済み。

### T-S — 「今日の一問」カードがテーマ追従しない　[P1 / TODO（T-M 完了後着手）]

- 依頼原文（Keita 2026-05-29）: 「テーマを変えても『今日の一問』カード（Daily Fermi のホームカード）の色が変わらない。テーマ追従するよう修正してほしい」。
- スコープ: ホーム（`HomeScreenV3`）の「今日の一問」カードが、外観テーマ（古紙/深緑/墨白等）を切り替えても色が変わらない＝テーマ非追従。テーマ変数（CSS 変数 / mode クラス）に追従するよう修正する。T-B で追加した新テーマの「追従漏れ」の一部。
- 根因仮説（実装前に実ソース照合すること・現時点未照合）: 「今日の一問」カードの背景/文字/アクセント色が **ハードコード hex** か、テーマ非依存の固定色（`var(--brand)` 等の固定ブランド色をテーマ追従させたい箇所で使用、または旧 light/dark しか想定しない色指定）になっている疑い。`tokens.css` の `body.theme-v3.mode-{id}` で定義される bg/card/text/accent 変数を参照していない可能性。
- 既存資産: `src/screens/HomeScreenV3.tsx`（「今日の一問」カードの描画・className/style）、対応する CSS（カードのスタイル定義。`src/styles/` 配下か HomeScreenV3 近傍）、`src/styles/tokens.css`（テーマ別トークンの正）。
- DoD: 外観テーマを古紙/深緑/墨白/light/dark に切り替えると、「今日の一問」カードの背景・文字・アクセントが**各テーマの配色に追従**して変わる。ハードコード hex を使わず CSS 変数（`var(--card)` / `var(--accent)` 等テーマトークン）参照になっている。各テーマで本文・ラベルのコントラストが WCAG AA を満たす。tsc 0 / eslint `.` 0。Android 実機で全テーマ確認。
- サブタスク:
  - [ ] 実装前調査: 「今日の一問」カードの色指定箇所を特定（HomeScreenV3 の inline style / className / 対応 CSS）。ハードコード hex かテーマ非依存変数か確認
  - [ ] 色指定をテーマトークン（CSS 変数）参照に置換（ハードコード hex 撤去）
  - [ ] 全5テーマ（light/dark/古紙/深緑/墨白）でカードが追従するか確認
  - [ ] コントラスト確認: 各テーマで本文/ラベルが WCAG AA（4.5:1）
  - [ ] 回帰: 他のホーム要素（ストリーク・他カード）の色に影響していないか
  - [ ] tsc 0 / eslint `.`（全体）0
- 抜けもれ提言:
  - デザイン制約: ハードコード hex 禁止（CLAUDE.md）。テーマトークン `var(--bg)` / `var(--card)` / `var(--text)` / `var(--accent)` 等を使う。色 source は tokens.css 側に集約。
  - 回帰（最重要）: 「今日の一問」カードの色を変数化すると、その変数を共有する**他画面のカードにも波及**しうる。共通カードコンポーネント / 共通 CSS クラスを触る場合は他画面の見た目も目視確認（feedback_audit_triage 的に correctness 波及）。カード固有のクラスに閉じて直すのが安全。
  - i18n: 色追従のみなら新規文言なし（i18n 影響なし）。
  - アクセシビリティ: テーマ追従で各テーマのコントラスト要検算（特に墨白/深緑のダーク寄り系で本文が沈まないか。T-B の DoD と同じ観点）。
  - 両OS: モバイル専用。Android 実機で全テーマ切替を確認（theme-color meta も含め）。
  - 永続化: 表示色のみで persist 影響なし。
  - 関連: T-T（網羅調査）の findings に「今日の一問カード」が含まれる＝T-S は T-T の一項目を先行特定したもの。T-T の調査結果が出たら、同種の追従漏れ箇所をまとめて T-S と同じ手法で直す（同一 dev-logic 推奨）。T-A/T-L と同じ Daily Fermi 周辺だが、T-A は本番反映済・T-L は表示順入れ替えで色とは別レイヤーなので競合は小さい（同一 dev-logic なら順序整理で回避）。

### T-T — テーマ非追従の網羅修正（audit findings で完全仕様化）　[P1 / TODO（調査=完了／修正=T-V パレット選定後に一括実装）]

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
  - [ ] 全5テーマ（light/dark/sepia/forest/mono）で追従＋コントラスト確認（T-U と一体）
  - [ ] 回帰: 既存 light/dark 非変化、共有クラス波及の目視確認
  - [ ] tsc 0 / eslint `.`（全体）0
- 抜けもれ提言:
  - T-S は根本原因A の :184 を先行特定したもの＝**T-S は T-T 根本原因A に統合**。A を直せば T-S は自動解消。
  - デザイン制約: 修正方針は一貫して「ハードコード hex/rgba 撤去 → tokens.css のテーマトークン参照」。色 source は tokens.css に集約（CLAUDE.md）。根本原因A の `--brand-grad-h` は各モードブロックに分散定義する（色 source なので各モード CSS で hex を持つのは正当）。
  - 回帰（最重要）: `--brand-grad-h` を各モードで override すると、この変数を共有する**他画面の青グラデ背景にも波及**する（HomeScreenV3/DailyFermi/Login が共有）。意図した一括追従なので望ましいが、想定外の箇所が変わらないか目視確認。LessonStoriesScreen の accent-fg 化も共有クラス波及に注意。
  - コントラスト: 根本原因C（accent-fg 化）と全テーマ検証は T-U（コントラスト整合性チェック）と一体で進める。特に mono/forest のダーク寄り系で本文が沈まないか。
  - 両OS: モバイル専用。Android 実機で代表テーマの全画面ざっと確認。
  - i18n: 色追従修正のみなら新規文言なし。
  - 永続化: 表示色のみで persist 影響なし。
  - ⚠T-V との統合: sepia/forest/mono は T-V のテーマ再設計で刷新・差し替えの可能性。**T-V のパレット選定後に T-T を実装**すれば、刷新後のモードブロックに対して `--brand-grad-h` override を入れられる（先に直すと T-V 実装で二度手間になる）。T-R/T-S/T-T/T-U/T-J を T-V 統合で一括実装。

### T-U — コントラスト/可読性 整合性チェック　[P1 / TODO（T-V パレット選定後・T-T 修正と一体）]

- 依頼原文（Keita 2026-05-29）: 「テーマを変えると白文字で見えない、ハイライトが濃くて読めない、が起きないように整合性チェックして」。
- スコープ: 全テーマ × 主要画面で、可読性を検証して破綻を潰す **QA タスク**。検証軸は (a) 本文テキスト × 背景、(b) accent-fg × brand/accent 背景、(c) selection/active ハイライト × その上の文字。目安は WCAG **4.5:1（本文）/ 3:1（大文字・UI 要素）**。T-T の修正（特に根本原因C の accent-fg 化）と一体で進める。
- なぜ T-T と一体か: T-T 根本原因C（#fff 固定 → accent-fg 化）と根本原因A（brand-grad-h override）は、どちらも「テーマ追従させた結果コントラストが足りるか」を検証しないと完了しない。T-U は T-T の修正後に各テーマで可読性が成立するかを横断チェックする受け入れゲート。
- 検証対象テーマ: light / dark / sepia / forest / mono の5モード（T-V 再設計後はそのパレットで再検証）。
- 検証対象（主要画面・代表例）: ホーム（今日の一問カード・ストリーク）、ロードマップ（タブ active・カード・mark）、レッスン本文/LessonStories（brand 背景上の文字・callout）、プロフィール一覧、ジャーナル、外観設定、ログイン。
- DoD: (1) 全5テーマ × 主要画面で「本文 × 背景」が WCAG 4.5:1、「大文字・UI 要素・accent-fg × accent 背景」が 3:1 を満たす、(2) 白文字が背景に溶ける/ハイライトが濃すぎて文字が読めない箇所がゼロ、(3) 破綻箇所はテーマトークン調整 or 当該箇所の fg 修正で解消、(4) 検証結果（テーマ×画面×実測コントラスト比 or OK/NG）が記録される、(5) Android 実機で代表テーマの可読性を目視確認。
- サブタスク:
  - [ ] 検証マトリクス作成（5テーマ × 主要画面 × 検証軸 a/b/c）
  - [ ] 各セルでコントラスト比を実測（hex 抽出 → WCAG 比算出。selection/active ハイライト上の文字も含む）
  - [ ] NG セルを抽出し、T-T の修正 or tokens.css のトークン調整で解消
  - [ ] mono/forest のダーク寄り系で本文が沈まないか・sepia の低彩度で accent が埋もれないか重点確認
  - [ ] Android 実機で代表テーマ（mono/forest/sepia）の主要画面を目視
  - [ ] 検証結果を記録（再発防止の基準値として）
- 担当: dev-logic（主体）＋必要なら test/QA 系 subagent（マトリクス実測の機械化）。
- 抜けもれ提言:
  - T-T と一体: T-T の根本原因 A/B/C/D 修正後に T-U で横断検証するのが順序。T-T 未修正のまま T-U だけ走らせても「直す前の破綻」を測るだけになる。
  - selection/active ハイライト: 本文 × 背景だけでなく、タップ/選択時のハイライト色の上に乗る文字（ロードマップ tab active 等）も検証軸に含める（Keita「ハイライトが濃くて読めない」＝この軸）。
  - accent-fg の自動選定: applyTheme の pickFg() が accent 上の fg を自動選定するが、自動選定が常に AA を満たすとは限らない（中間明度の accent で fg が際どくなる）。各テーマの accent で実測する。
  - デザイン制約: 破綻解消はハードコード hex でなく tokens.css のトークン調整で（CLAUDE.md）。
  - 両OS: モバイル専用。実機の表示は sRGB プロファイル/輝度で見え方が変わるので Android 実機目視も併用（数値 OK でも実機で沈むことがある）。
  - i18n: QA タスクで新規文言なし。
  - 永続化: 不要（検証 + 色調整のみ）。
  - 再発防止: 検証結果を基準値として残し、T-V 再設計や新画面追加時に同じマトリクスで回せるようにする（recurring 化の余地）。

### T-V — テーマ再設計エピック（数パターン追加・UI設計刷新・カスタマイズしやすく）　[P1 / IN_PROGRESS（designer 提案ドキュメント作成中・読み取り専用）]

- 依頼原文（Keita 2026-05-29）: 「まだAI感がある、もう数パターン考えてほしい。UI設計も変えていい、カスタマイズしやすく」。
- スコープ: 配色テーマを再設計する**親エピック**。(1) 新パレットを数パターン提案（AI 感を脱した垢抜けた配色）、(2) AppearanceSettings の UI 設計を刷新（カスタマイズしやすく）、(3) 選定パレットで全変数フルカバー＋コントラスト検証。T-R（死にモード削除）/ T-T（非追従修正）/ T-U（コントラスト）/ T-J（バッジ色）はこの再設計と**統合して一括実装**するのが効率的。
- 進行状況（2026-05-29）: **designer が読み取り専用で提案ドキュメントを作成中**（出力先 `docs/THEME_REDESIGN_PROPOSAL_20260529.md`）。内容＝**4〜6パレット＋全変数フルカバー＋コントラスト検証＋AppearanceSettings UI 再設計案**。完成後 Keita がパレットを選定 → dev-logic が実装。
- ⚠選定パレットの影響: 選定パレットは既存 sepia/forest/mono を**刷新/差し替える可能性**がある。つまり T-R で残す5モードのうち sepia/forest/mono は T-V 後に中身が変わりうる（light/dark は維持見込み）。だから T-R/T-T/T-U は T-V のパレット選定を待って一括実装するのが筋（先に直すと二度手間）。
- フロー: designer（提案・進行中）→ Keita（パレット選定＝このエピックのゲート）→ dev-logic（theme.ts / tokens.css / i18n / AppearanceSettings 実装＋T-R/T-S/T-T/T-U/T-J 統合）。
- DoD（提案フェーズ・designer）: (1) 4〜6パレットが提案され各パレットが全テーマ変数（bg/card/text/accent ＋ accentSoft/glow/dark/fg、`--brand-grad-h` 等の追従対象含む）をフルカバー、(2) 各パレットのコントラスト検証（WCAG）済み、(3) AppearanceSettings の UI 再設計案（カスタマイズしやすさを高める導線）が提示され、(4) 会話本文に内容展開＋Keita 選定待ち（feedback_direct_content_not_path）。
- DoD（実装フェーズ・後日・Keita 選定後）: 選定パレットが MODES / tokens.css に実装され、AppearanceSettings UI が刷新され、T-R（死にモード削除）/T-T（非追従修正）/T-U（コントラスト）/T-J（バッジ色）が統合され、全テーマで追従・コントラスト AA・i18n ja/en・Android 実機破綻なし。
- サブタスク（提案フェーズ・進行中）:
  - [~] designer: 4〜6パレット提案（全変数フルカバー・各パレットのトンマナ説明・どのAI感を脱するか）＝**進行中**
  - [~] designer: 各パレットのコントラスト検証（WCAG）
  - [~] designer: AppearanceSettings UI 再設計案（カスタマイズしやすく）
  - [ ] 会話本文に提案を直接展開し Keita 選定待ち
- サブタスク（実装フェーズ・Keita 選定後）:
  - [ ] Keita: パレット選定（このエピックのゲート）
  - [ ] dev-logic: 選定パレットを MODES / tokens.css に実装（sepia/forest/mono の刷新/差し替え込み）
  - [ ] dev-logic: AppearanceSettings UI 刷新
  - [ ] dev-logic: T-R/T-S/T-T/T-U/T-J を統合実装（死にモード削除・非追従修正・コントラスト・バッジ色を一括）
  - [ ] i18n（新パレット name/desc・UI 文言の ja/en・中立丁寧体）
  - [ ] 全テーマで追従・コントラスト AA・回帰（既存 light/dark 非変化）
  - [ ] tsc 0 / eslint `.` 0、Android 実機確認
  - [ ] サムネ/ハードコード hex 撤去の最終確認
- Keita 確認すべき論点（提案完成後）:
  - (1) どのパレットを採用するか（複数可・無料/有料の tier 割当）。
  - (2) sepia/forest/mono を残すか・新パレットで差し替えるか（T-R の残5モードと整合）。
  - (3) AppearanceSettings UI をどこまで刷新するか（「カスタマイズしやすく」の範囲＝プリセット選択のみか/微調整スライダ等を入れるか）。
- 抜けもれ提言:
  - サンプル承認フロー: テーマ配色は主観・好みの領域（Bucket2 寄り）。designer 提案 → Keita 選定 → 実装のフロー厳守（feedback_logic_course_thumbnails のサンプル承認ルール）。
  - i18n: 新パレットの name/desc は ja/en 両方・中立丁寧体（feedback_app_copy_neutral）。既存 enterprise/startup/custom の getter パターン踏襲（ただしそれらは T-R で削除）。
  - デザイン制約: パレット定義（MODES preview / tokens.css のモードブロック）は色 source なので hex を持つのは正当。コンポーネント側ハードコード hex は禁止。UI chrome は emoji 不可・SVG のみ（テーマカードのアイコン使う場合）。
  - 全変数フルカバー（最重要）: T-T で発覚した `--brand-grad-h` のような「:root だけ定義でモード未 override」を新パレットで再発させない。**全モードで全テーマ変数を完全に定義**することを提案・実装の DoD に含める（enterprise/startup が CSS ブロック不在で死んでいた轍を踏まない）。
  - コントラスト: 各パレットで T-U の検証軸（本文/背景・accent-fg/accent・ハイライト/文字）を満たすこと。提案段階で WCAG 検証を済ませる。
  - 永続化フォールバック: 新 id 追加・旧 id 差し替えで、localStorage に旧 id が残るユーザーの fallback（未知 id → 既定）を T-R の処理と統合。
  - 両OS: モバイル専用。Android 実機で全パレット確認（theme-color meta 含む）。
  - 統合の効率: T-R/T-S/T-T/T-U/T-J を T-V 実装に巻き込むことで、theme.ts / tokens.css / AppearanceSettings / i18n を1回の作業で触れる（個別に何度も触らない）。同一 dev-logic 一気通貫。

### T-W — 「あなた専用コース」セクションの展開/折りたたみ　[P1 / TODO（T-M 完了後着手・T-V 系から独立）]

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

---

## バッチ: 2026-05-29 トレーニングのAI検索機能（Keita・新機能）

現行バッチ（T-M テーマ系・T-I〜T-L・T-R〜T-W）とは独立した新機能。新規 AI 機能のため backend デプロイ要・レート制限/コスト考慮。優先度は Keita 判断待ち（P-TBD）。**着手前にスコープ確認が必須**（下記）。

| ID | タイトル | 優先度 | ステータス | 担当案 |
|----|----------|--------|-----------|--------|
| T-X | トレーニングのAI検索（右上虫眼鏡＋自然言語/意味ベース検索） | P-TBD（Keita 判断待ち） | TODO（着手前スコープ確認） | designer（検索UI/結果画面設計）＋ dev-logic（backend AI 検索エンドポイント＋frontend 検索UI/結果表示） |

### T-X — トレーニングのAI検索（右上虫眼鏡＋AI検索）　[P-TBD / TODO（着手前スコープ確認）]

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

## Recurring（task-manager 継続管理タスク）

定期実行・継続監視するタスク。完了型ではなく「最終実施日」を追跡し、漏れを検知する。

| ID | タスク | 頻度 | 仕組み | 最終確認 | 状態 |
|----|--------|------|--------|----------|------|
| R-1 | Obsidian Daily Note 日次生成（T-E (c)(d) で仕組み化） | 毎日 07:00 JST | morning-briefing.sh 統合 or 別 cron（方式未確定） | 5/26〜5/28 を手動キャッチアップ済（林、2026-05-28）。恒久自動化は T-E(c)/T-F 待ち | 整備中（T-E + T-F 依存。手動キャッチアップで 5/28 まで埋め済） |
| R-2 | cron 自動パイプライン死活確認（ceo 朝ブリ 07:00 / feedback 06:00 / night-patrol 03:00） | 毎日 | crontab 3 本＋出力サイズ/エラーパターン検査 | 06:00・07:00 は 5/27 から空振り（T-F・未解決）。03:00 スモークは T-G の config 修正が 2026-05-29 に main 反映済＝復旧見込み（実走確認は次回 03:00 cron で要確認）。03:00 のヘルスチェック本体（200 確認）は稼働 | 一部復旧（T-G config 反映済・実走確認待ち／T-F は未解決のまま異常） |

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

### T1 — 音声の多重再生を止める　[P1 / TODO]

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

### T3 — ジャーナルのハッシュタグ自動集約・正規化　[P2 / TODO]

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

### T4 — AIアシスタント応答の `**` 混入を直す　[P1 / TODO]

- 詳細: ジャーナルのAIアシスタント応答に markdown の `**`（太字記号）が生で混じって表示される。
- 関連ファイル: `src/components/journal/JournalAssistantSheet.tsx`（~154, 238, 248-256）、`journal.css` の `.journal-summary-card__body`（white-space: pre-wrap でプレーン表示）。`RichLessonText.tsx` のリッチテキストパーサーが未適用。
- DoD: AI応答内の `**bold**` 等が崩れず（太字描画 or 記号除去）に表示される。生の `**` が出ない。
- サブタスク:
  - [ ] 方針決定: 軽量 markdown レンダリング適用 or プロンプト側で記号抑制 or 表示前サニタイズ
  - [ ] アシスタント応答の表示経路に適用
  - [ ] 他のAI応答表示箇所（フィードバック等）にも同種混入がないか横展開確認
- 抜けもれ提言: 表示整形とプロンプト抑制の二択。レンダリング採用時は既存 plain 前提CSSとの整合を確認。

### T5 — おすすめレッスンの表示・遷移＋AI会話履歴の保存/再表示　[P1 / TODO]

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

### T6 — レッスン本文 bullet（・）のずれ・青色を直す　[P1 / TODO]

- 詳細: レッスン本文の箇条書き bullet（・）が青色でずれて表示される。青ではなく普通の「・」でよい。
- 関連ファイル: `src/components/RichLessonText.tsx`（~218-258, bullets ケース）。`<ul listStyle:none + flex>`、各 li の bullet span が 6px 円・`background: var(--brand)`（青）・`translateY(0.5em)` で位置調整。
- DoD: bullet が通常の中黒「・」相当で、テキストと縦位置が揃って表示される。青の丸ドットをやめる。
- サブタスク:
  - [ ] bullet span（青丸）を通常の「・」記号 or 中立色マーカーに変更
  - [ ] 縦位置ずれ（translateY 調整）の解消
  - [ ] 全レッスン本文・ネストリストで崩れないか回帰確認
- 抜けもれ提言: RichLessonText は全レッスン本文共通 → 波及大。複数レッスンで目視確認。

### T7 — コース一覧カテゴリの展開／閉じる　[P1 / TODO（機能未実装の疑い）]

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
さらにテーマ系（T-R/T-S/T-T/T-U/T-V/T-J）は **T-V（テーマ再設計）の Keita パレット選定を待って一括実装**する（選定パレットで sepia/forest/mono が刷新・差し替えされる可能性があり、先に直すと二度手間になるため）。T-W と T-I/T-K/T-L は T-V と独立して進められる。

キュー対象（10件）と性質:

| 着手順 | ID | 内容 | 優先度 | 重さ | migration | 依存・グルーピング |
|--------|----|------|--------|------|-----------|-------------------|
| ゲート | T-V | テーマ再設計（4〜6パレット提案→Keita 選定→実装）＋UI 刷新 | P1 | 重 | 不要 | テーマ系の親エピック。designer 提案進行中→**Keita パレット選定がゲート** |
| 1 | T-R | 死にモード削除（custom/enterprise/startup） | P1 | 軽〜中 | 不要 | テーマ系・T-V 選定後に統合 |
| 1 | T-T | テーマ非追従の網羅修正（根本原因A/B/C/D・T-S を内包） | P1 | 中 | 不要 | テーマ系・T-V 選定後に統合（調査=完了） |
| 1 | T-U | コントラスト/可読性 整合性チェック（全テーマ×主要画面） | P1 | 中 | 不要 | テーマ系・T-T と一体 |
| 1 | T-J | 完了バッジのチェックマーク色変更のみ | P2 | 軽 | 不要 | テーマ系・色方針を T-V/T-T と揃える |
| 2 | T-W | 「あなた専用コース」セクションの展開/折りたたみ | P1 | 軽〜中 | 不要 | RoadmapScreenV3・T-V から独立 |
| 3 | T-I | コース進捗表示（完了 n/m・%） | P1 | 中 | 不要 | progress 系・独立（RoadmapScreenV3 同ファイル） |
| 4 | T-K | ジャーナルグラフ tap で詳細展開（対象グラフ未確定） | P2 | 中 | 不要 | journal 系・独立 |
| 5 | T-L | フェルミの答えを解説の末尾へ（表示順） | P2 | 軽（backend デプロイ要の可能性） | 不要 | Daily Fermi 系・独立 |

（注: T-S は T-T 根本原因A に統合済みのため独立行を持たない。表の「着手順 1」はテーマ系を T-V 選定後に1まとめで実装する意味で、内部順序は T-V 実装 → T-R → T-T(+T-S) → T-U → T-J。）

着手順の提案（理由つき）:
1. **テーマ系は T-V のパレット選定を待って一括実装（T-V → T-R → T-T(+T-S) → T-U → T-J）**。6件とも `theme.ts` / `tokens.css` / `AppearanceSettingsScreen` / 色トークンという**同じ領域**を触る。T-V でパレットが確定すると sepia/forest/mono が刷新・差し替えされうるので、T-R（死にモード削除）/T-T（非追従修正・根本原因A/B/C/D）/T-U（コントラスト）/T-J（バッジ色）を**T-V 実装に巻き込んで1回で**仕上げる。別々にやると刷新後にやり直しになり二度手間。
   - 流れ: designer 提案完成 → **Keita パレット選定（ゲート）** → dev-logic が T-V 実装（MODES/tokens.css 刷新・UI 再設計）と同時に T-R（死にモード除去）・T-T（`--brand-grad-h` override・RoadmapScreenV3 のハードコード青→accent-soft・LessonStories の #fff→accent-fg・プロフィール一覧追従）・T-U（全テーマ×主要画面の WCAG 検証）・T-J（バッジ色）を一括処理。T-S は T-T 根本原因A の一部。
   - T-T の網羅調査は**完了済み**（根本原因A/B/C/D に整理済み）＝待ち時間なし。T-V のパレット選定だけが律速。
2. **T-W（あなた専用コース折りたたみ）は T-V と独立**。RoadmapScreenV3 の既存開閉機構（T7/TC-1 の collapsedGroups）を「あなた専用コース」に適用するだけ。テーマ選定を待たずに着手可。RoadmapScreenV3 を触る点は T-T 根本原因B・T-I と同ファイルなので、**RoadmapScreenV3 系（T-W/T-I/T-T-B）を近い時期にまとめて触る**とコンフリクトを避けやすい。
3. **T-I（コース進捗）は独立**。progress 集計の表示で migration 不要。RoadmapScreenV3 のコースカードを触るので T-W と同ファイル＝近い時期にまとめると良い。
4. **T-K（ジャーナルグラフ tap）は独立**。journal 周辺・対象グラフ未確定（着手前に Keita 確認）。T-D（タグ動的統合）は本番反映済なので、気分推移グラフ対象なら T-D と独立。タグ頻度グラフ対象なら T-D のタグモデルと整合確認。
5. **T-L（フェルミ答え末尾）は独立・最後 or 隙間で**。表示順入れ替えだけならフロントのみ。プロンプト改修なら backend デプロイ要（手動 deploy-production.yml＝T-D と同じ落とし穴）。T-A は本番反映済なので Daily Fermi の競合は解消済。⚠削除見送り worktree（a23e/a7aa）に「答えを冒頭に出す」逆向き実験が残存＝**末尾方針と真逆なので混同注意**（この注記は維持）。

横断の抜けもれ・注意（キュー全体）:
- ⚠作業ツリー競合（最重要・着手タイミングの肝）: T-M で dev-logic が main 作業ツリー稼働中。**T-M 完了＝作業ツリー解放を待ってから着手**。先行できるのは T-T の読み取り専用調査（完了済み）と T-V の designer 提案（読み取り専用・進行中）のみ。
- ⚠テーマ系の律速は T-V パレット選定: T-R/T-S/T-T/T-U/T-J は T-V のパレット選定（Keita）がゲート。選定前にテーマ系を実装すると、刷新パレットで全部やり直しになる。T-V 提案が完成したら Keita に選定を促す（task-manager エスカレーション）。
- 独立タスク（T-V を待たない）: T-W / T-I / T-K / T-L はテーマ選定と無関係。T-M 完了後すぐ着手可。
- migration: キュー10件とも**migration 不要**。承認案件の DB 変更は無し。
- backend デプロイ: T-L のみ backend 依存の可能性（フェルミ解説プロンプトを末尾化する実装なら）。表示順入れ替えだけならフロントのみで backend 不要。実装方針確定時に切り分け。フロント変更は Android が main push で自動反映、Render web は手動 deploy-production.yml。
- デプロイ前チェック: 各件 `tsc -b --noEmit` ＋ **`eslint .`（全体・CI と同じスコープ）** で 0 error 確認（reference_logic_ci_lint_scope）。残置 worktree の false error は `--ignore-pattern '.claude/**'` で除外して真の数を見る。
- i18n: T-V の新パレット name/desc・T-I の進捗ラベル・T-K の詳細パネル文言・T-W の見出し（新規なら）は ja/en 両方＋中立丁寧体（feedback_app_copy_neutral）。T-R は theme.mode.{custom,enterprise,startup}.* の ja/en 両除去（孤立キー残さない）。色追従・表示順系（T-S/T-T/T-J/T-L）は基本新規文言なし。
- デザイン制約: テーマ系（T-R/T-S/T-T/T-U/T-V/T-J）は一貫して「ハードコード hex 撤去 → tokens.css のテーマトークン参照／色 source は各モードブロックに集約」。**全モードで全変数フルカバー**（`--brand-grad-h` の :root 限定定義のような追従漏れを T-V で再発させない）。UI chrome のアイコンは SVG（journal の mood/weather/phase/streak のみ絵文字例外）。
- 両OS: 全件モバイル専用（project_logic_mobile_only）。Android 実機確認。特にテーマ系は全モード切替で目視＋コントラスト（数値 OK でも実機で沈むことがある）。
- スコープ確認の残: T-V（採用パレット・tier・sepia/forest/mono 差し替え可否・UI 刷新範囲）・T-I（表示場所/形式/完了定義/集計範囲）・T-K（対象グラフ/詳細内容/表示形式）・T-J（色を何色にするか・テーマ追従の可否）は着手前に Keita 確認。T-R/T-T/T-U/T-W/T-L は方針確定済（T-U は T-T と一体）。

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
8. T-H（BLOCKED・保留）: Keita 判断待ち。公開前提のうち **T-G スモーク復旧・T-B テーマ反映は 2026-05-29 に達成**。残はリリースノート整備＋公開可否判断。準備が整ったので Keita に公開可否を再提起できる状態。リリースノート担当のアサインが要る。

### バッチ 2026-05-27（旧・継続）
1. バッチ2（T7・T2・T3）完了待ち → DoD 検証
2. バッチ3: T5（おすすめレッスン遷移＋AI履歴。履歴の保存先はジャーナル既存方式に合わせる）
3. 全ローカル実装完了後、tsc/eslint 再確認 → Keita に push 承認を依頼
4. 注意: `eslint .` で `.claude/worktrees/agent-*`（別エージェント残骸・現在 **5個**）由来の **2 errors**（false）。実ソースは 0。CI は worktree 非 checkout で緑。回避＝`eslint . --ignore-pattern '.claude/**'`。**worktree 掃除（削除）は破壊的操作のため Keita 承認待ち事項**。

最終更新: 2026-05-29 朝（Keita 承認のもとデプロイ＋マージ実行の確定事実を反映。wip/20260528-inprogress を main に ff マージ＋push、Android deploy success＝T-A/T-B/T-N/T-O/T-P モバイル本番反映、Render backend deploy success〔run 26603561372〕health 200＝T-D backend 本番反映、T-G config も main 反映。**DONE 化: T-A / T-B / T-D / T-G / T-N / T-O / T-P**〔各々 2026-05-29 本番反映済、T-A/T-N/T-O/T-P/T-B は実機体感確認のみ任意で残〕。**T-Q=DONE**〔既に本番＝commit 7705b12, 5/24／重複ブランチ acdc59e は破棄可〕。**T-M=IN_PROGRESS**〔サンプル承認＋本展開ゴーサイン取得、content-creator が全5レッスン 440-444 ja/en 本文制作中＝docs/COURSE_STAMINA_FULL_20260529.md、C-1/C-3/C-4/S-1/S-2/D-1 反映指示済、次工程＝dev-logic 実装→444 logic-coach 再監査ゲート→テスト→デプロイ〕。worktree 掃除 1/5 完了〔fix/lesson-visuals 削除、残4個は稼働中セッション占有で保留・要 Keita 判断〕。残・判断待ち＝T-I/T-J/T-K スコープ確認待ち・T-L 未着手〔a23e/a7aa worktree に逆向き実験あり混同注意〕。T-F 未解決〔06:00/07:00 cron 空振り継続〕）

最終更新: 2026-05-29（T-B テーマ機能フォローアップ3件を起票＝**T-R**〔custom テーマ削除〕/ **T-S**〔今日の一問カードのテーマ追従〕/ **T-T**〔テーマ非追従箇所の網羅調査→個別修正・T-S を内包・調査は林が読み取り専用で進行中〕。全件 TODO・T-M 完了後着手〔dev-logic が T-M で main 作業ツリー使用中のため〕。**T-J をスコープ縮小確定**＝「レッスン完了回数の可視化」→「完了バッジのチェックマークの色変更のみ」〔Keita 確定〕に置換、P1→P2・migration 不要に変更、T-I との重複論点を解除。**dev-logic 完了後 main 作業キューを1まとまりで整理**＝着手順 T-R→T-S→T-T→T-J〔テーマ系一気通貫〕→T-I〔progress 単独〕→T-K〔journal〕→T-L〔Daily Fermi・末尾化〕、全件 migration 不要、横断の抜けもれ・スコープ確認残を併記）

最終更新: 2026-05-29（テーマ系の追加依頼＋audit findings 反映。**T-R 拡大**＝custom のみ→**custom/enterprise/startup の3つ削除**〔audit で tokens.css/tokens-m3.css に CSS ブロック不在＝死にモードと確定〕、残5モード=light/dark/sepia/forest/mono。**T-T 完全仕様化**＝読み取り専用 audit 完了、根本原因 A〔`--brand-grad-h` が :root だけ定義で全テーマ青のまま・HomeScreenV3:184/:178・DailyFermiScreen:1133・LoginScreen:115〕/B〔RoadmapScreenV3 のハードコード青 rgba(108,142,245) :762/:946/:970/:979/:328〕/C〔LessonStories の #fff 固定 約10箇所→accent-fg〕/D〔プロフィール一覧の未追従・Keita 報告〕に整理、T-S を根本原因A に統合。**新規 T-U**〔コントラスト/可読性 整合性チェック・全テーマ×主要画面 WCAG・T-T と一体〕、**新規 T-V**〔テーマ再設計エピック・4〜6パレット＋UI 刷新・designer 提案進行中 docs/THEME_REDESIGN_PROPOSAL_20260529.md・Keita パレット選定がゲート・テーマ系の親〕、**新規 T-W**〔あなた専用コース折りたたみ・RoadmapScreenV3 既存開閉機構流用・デフォルト折りたたみ・T-V から独立〕を起票。**main 作業キュー更新**＝テーマ系〔T-R/T-S/T-T/T-U/T-V/T-J〕は **T-V の Keita パレット選定を待って一括実装**〔sepia/forest/mono が刷新されうるため先行修正は二度手間〕、**T-W/T-I/T-K/T-L は T-V から独立**で T-M 完了後すぐ着手可。T-L の逆向き worktree〔a23e/a7aa「答えを冒頭に」〕混同注意は維持。全件 migration 不要）
