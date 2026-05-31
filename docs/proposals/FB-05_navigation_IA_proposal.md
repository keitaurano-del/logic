# FB-05 — ナビゲーション / 情報設計 (IA) 再設計案

担当: designer (紺野 蒼) / 2026-05-31
関連: Issue #235、クラスタ4件 / 隣接タスク DF-F1 (検索発見性・DONE)、DF-F16 (初回ホーム情報設計・REVIEW)
種別: IA 設計提案（実装はまだしない。IA 決定は Keita ゲート、かつ他 UI 変更の前提）

注: 本ドキュメントは設計提案であり、本文の文言はあくまで案。アプリ実装時の UI 文言は中立的な丁寧体に揃える前提。

---

## 0. 結論サマリ

現状のナビは「タブ5本 + History API による画面スタック」のハイブリッドだが、3つの構造的欠陥がある。

1. 戻り先が「History に積まれたか / ROOT 判定か / tab state か」の3系統で決まり、入口によって戻り先が変わる（横断遷移で破綻）。
2. `lessons` タブと `roadmap`（カテゴリ詳細）が別 Screen 型なのに、`lessons` 起点で開いたカテゴリ詳細の戻り先が tab に依存し、ホームから開いたカテゴリ詳細は History 依存、と分岐する。
3. 離脱→復帰時、画面状態は揮発（in-memory state のみ）。アプリ再起動後は常に `home` に戻り、深い画面・コース再生途中・モーダル状態は失われる。

再設計の柱は「(a) タブを各々独立スタックとして扱う標準的なタブ+スタック・モデルへ整理」「(b) 戻る・横断・復帰の3ルールを明文化」「(c) DF-F16 の『今やる1アクション』ホームを起点に動線を一本化」。

---

## 1. 現状の遷移構造（実コード棚卸し）

### 1.1 画面定義とナビの実体

- `Screen` 判別共用体: `src/AppV3.tsx:90-126`（36 variant）。全画面が1つの union で、画面遷移は `setScreen` + History API。
- タブ定義: `src/components/AppShell.tsx:8`（`type Tab = 'home' | 'lessons' | 'ranking' | 'journal' | 'profile'`）。タブは5本。
- ROOT 判定: `src/AppV3.tsx:157`
  `const ROOT_SCREENS = new Set(['home','lessons','fermi-ranking','journal','profile'])`
  ここで `Tab` の `'ranking'` は Screen 型 `'fermi-ranking'` に対応するという暗黙のマッピングがある（`AppV3.tsx:156` のコメントが明記）。タブ ID と Screen 型がズレている唯一の箇所で、`handleTabChange`/`popstate`/`handleBack` の3箇所で都度マッピングし直している。

### 1.2 navigate / push の仕組み

- `navigate()`: `src/AppV3.tsx:218-226`
  - `replace=true` または `ROOT_SCREENS.has(next.type)` なら `history.replaceState`、それ以外は `pushState`。
  - つまり ROOT 画面（タブ）はスタックに積まれず、常に1枚に潰れる。タブ間は「履歴的に並列」で前後関係を持たない。
- popstate: `src/AppV3.tsx:229-255`
  - 戻る/バックスワイプで `e.state.screen` を復元。state が無ければ強制的に `home` へ（`AppV3.tsx:244-248`）。
  - 復元時にタブ state も Screen 型から逆算（`fermi-ranking→ranking`, `journal→journal`, ROOT は同名タブ）。

### 1.3 「戻る」の3系統（バラつきの中心）

`handleBack()`: `src/AppV3.tsx:375-386`
```
if (history.state?.screen && !ROOT_SCREENS.has(現在画面)) history.back()   // ① History を戻す
else if (tab === 'ranking') navigate(fermi-ranking, replace)              // ② tab 由来のフォールバック
else if (tab === 'journal') navigate(journal, replace)
else navigate(tab, replace)                                              // ③ 現在 tab のルートへ
```
戻り先が「History に前画面が積まれているか」と「今アクティブな tab は何か」の両方に依存する。同じ画面でも入口によって戻り先が変わる。

### 1.4 どこで破綻するか（file:line）

破綻A — 横断遷移で戻り先が「来た道」と一致しない
- ホーム → `onOpenCategory` → `roadmap` カテゴリ詳細（`AppV3.tsx:473-476`、push される）。
  ここで `handleBack` は History を戻すのでホームに戻る（正しい）。
- だが `lessons` タブ → カテゴリカード → `roadmap`（`RoadmapScreenV3` の `onOpenCategory`、`AppV3.tsx:493`）も同じ `roadmap` 画面に push される。戻ると `lessons` ではなく「History 上の前画面」に戻る。タブ移動を挟んでいると前画面が `home` のままで、`lessons` に戻れない。
- さらに `lessons` タブ本体（`RoadmapScreenV3` の一覧）には `onBack` が渡っていない（`AppV3.tsx:490-500`）＝ヘッダー戻るボタン自体が無い。`roadmap` 詳細にだけ `onBack={handleBack}` がある（`AppV3.tsx:507`）。一覧と詳細で戻る UI の有無が非対称。

破綻B — saved-items / journal / wrong-answers からの横断ジャンプで階層が消える
- `saved-items` → `onOpenCourse` → `roadmap`（`AppV3.tsx:560`）、`onOpenLesson` → `lesson`（`AppV3.tsx:559`）。
- これらは push されるので「戻る」で saved-items に戻れるが、`lesson` を完了すると `lesson-complete`(`AppV3.tsx:420`) → `onHome`/`onNext` で `home` に `replace` 遷移（`AppV3.tsx:762-764`）。つまり「復習で開いたレッスン」を終えると saved-items でなく home に着地し、復習の連続作業が途切れる。
- `journal` の `onOpenCourse`/`onOpenLesson`（`AppV3.tsx:616-617`）も同様に、ジャーナルから飛んだレッスンを終えると home に落ちてジャーナルに戻れない。

破綻C — 離脱→復帰でスタックも深い画面も失われる
- 初期画面は常に `getInitialScreen`（`AppV3.tsx:130-153`）で決まり、ログイン済みは無条件 `home`（`AppV3.tsx:146`）。
- 画面状態は React state のみで永続化なし。アプリ kill → 再起動で、コース再生途中・カテゴリ詳細・設定の深い階層・ジャーナル編集途中はすべて失われ home に戻る。
- 通知タップも常に `home` へ deep link（`AppV3.tsx:323-326`）。レッスンリマインダーから「続きのレッスン」に直接戻れない。

破綻D — tab state と Screen の二重管理によるズレ
- タブ state (`tab`) と画面 (`screen`) が別 useState（`AppV3.tsx:160-161`）。`onOpenStats`（home→profile, `AppV3.tsx:478`）や `onOpenRoadmap`（home→lessons, `AppV3.tsx:480`）は `setTab` を手動で呼んでから navigate するが、`onOpenCategory` で `roadmap` に飛ぶ時は `setTab` を呼ばない（`AppV3.tsx:473`）。結果、`roadmap` 詳細を見ている間タブのハイライトは直前のまま（home なら home が光り続ける）。どのタブ配下にいるかが視覚的に一致しない。

破綻E — lesson-complete の「次へ」が同カテゴリ内に閉じる
- `onNext`（`AppV3.tsx:745-763`）は「同 category の次 ID レッスン」へ。コース（category）をまたぐ導線が無く、コース完了後は home に戻るだけ。「次に学ぶべきコース」へのブリッジが無い（DF-F16 のおすすめ接続と本来繋ぐべき所）。

### 1.5 現状を図にすると

```
[Tabs: home | lessons | ranking(=fermi-ranking) | journal | profile]   ← 全部 replaceState（並列・スタック無し）
        │
        ├─ home ──onOpenCategory──▶ roadmap(詳細)   ← push、戻る=History（home）
        │         onOpenRoadmap──▶ lessons(setTab)  ← replace
        │         onOpenStats────▶ profile(setTab)  ← replace
        │
        ├─ lessons ──onOpenCategory──▶ roadmap(詳細) ← push、戻る=History（だが tab は lessons のまま光らない=破綻D）
        │
        ├─ roadmap(詳細) ──onOpenLesson──▶ lesson ──complete──▶ lesson-complete ──▶ home(replace)  ← 階層消滅(破綻B/E)
        │
        ├─ saved-items / journal ──onOpenLesson──▶ lesson ──complete──▶ home  ← 復習/ジャーナルに戻れない(破綻B)
        │
        └─ (どの深さでも) アプリ再起動 ──▶ home  ← 復帰でスタック全消失(破綻C)
```

---

## 2. IA 再設計案

### 2.1 画面階層ツリー（タブ=独立スタックモデル）

5タブは維持（タブ構成の是非は §3 論点1で別途確認）。各タブが独立した「戻るスタック」を持つ標準的なタブ+スタック・モデルに整理する。横断ジャンプは「飛び先タブのスタックに積む」のではなく「現在スタックに modal/push で積み、戻るで元のタブ・元の文脈に必ず帰る」を原則にする。

```
ROOT（タブバー常設）
├─ ホーム (home)                         [スタック深さ0 = タブルート]
│   └─ ※ホームは「今やる1アクション」起点。深い画面は基本ここから modal-push
│
├─ トレーニング (lessons)                 [タブルート]
│   └─ コース詳細 (roadmap: category)      ← lessons スタックに push
│       └─ レッスン (lesson)               ← フルスクリーン（タブバー hide）
│           └─ レッスン完了 (lesson-complete) ← フルスクリーン
│               ├─ [次のレッスン] → 同コース内 lesson（スタック置換）
│               └─ [次のコース]   → おすすめコース roadmap（DF-F16連携・新規導線）
│       └─ 検索/絞り込み (SearchOverlay)    ← modal（DF-F1・実装済）
│       └─ パーソナル/カスタムコース         ← lessons スタックに push
│
├─ ランキング (ranking → fermi-ranking)    [タブルート]
│   └─ デイリーフェルミ等                   ← ranking スタックに push
│
├─ ジャーナル (journal)                    [タブルート]
│   └─ レッスン/コースへの横断ジャンプ        ← §2.3 横断ルールで処理（戻るで journal に帰る）
│
├─ プロフィール (profile)                  [タブルート]
│   └─ アカウント / 表示名編集 / 通知 / 外観 / 言語 / 学習時間 / フィードバック / プラン
│       （いずれも profile スタックに push、戻るで profile に帰る）
│
└─ 横断的オーバーレイ（タブ非依存・modal-push、戻る/閉じるで呼び出し元に必ず帰る）
    ├─ 復習ハブ (review-hub) → flashcards / wrong-answers / fermi-history / saved-items
    ├─ 料金 (pricing) / アップグレード
    ├─ 問題報告 (report-problem)
    ├─ AI問題生成 (ai-problem-gen) → ai-problem
    └─ 診断テスト (placement-test) → personal-course

フルスクリーン（タブバー無し・AppShell外）
├─ オンボーディング (onboarding)
├─ ログイン (login)
└─ ウェルカム (welcome)
```

### 2.2 戻る・横断・離脱復帰の遷移ルール案

ルール1 — 戻る（Back / バックスワイプ / Android 物理戻る）
- 戻るは「現在のタブスタックを1枚 pop する」を第一原則にする。tab state を見て分岐する現行の②③（`AppV3.tsx:379-385`）を廃し、各画面の `onBack`/`onClose` は一律「スタックを1枚戻す」だけにする。
- タブルート（スタック深さ0）で戻るを押した場合:
  - ホーム以外のタブ → ホームタブへ（標準的なモバイル挙動。Android 物理戻るも同様）。
  - ホームタブ → アプリ終了確認 / 何もしない（プラットフォーム標準に委ねる）。
- 横断ジャンプ（別タブの文脈へ modal-push したもの）からの戻るは、飛び先タブに居着かせず「呼び出し元スタックの呼び出し元画面」に帰す（§2.3）。
- 実装インパクト: tab と screen の二重管理（破綻D）を解消するため、状態を「アクティブタブ + タブごとのスタック配列」に正規化する（dev-logic 実装範囲。本提案ではモデルのみ規定）。

ルール2 — 横断遷移（コース横断 / 復習・ジャーナルからのジャンプ）
- 横断ジャンプは「現在のタブスタックに push（または modal）」する。飛び先のタブには切り替えない。
  - 例: ジャーナル → レッスン → レッスン完了 → 戻る/完了で ジャーナルに帰る（破綻B解消）。
  - 例: 復習ハブ(saved-items) → レッスン → 完了 → 復習ハブに帰る。
- ただし「コースを本格的に始める」意図のジャンプ（ホームのおすすめ → コース詳細 → 学習開始）は、トレーニングタブの文脈として扱い、トレーニングタブをアクティブにしてそのスタックに積む。「ちょっと見る/復習する」ジャンプ（saved-items・journal・検索結果からの単発レッスン）は呼び出し元スタックに積んで必ず元に帰す。この2モードを設計上明確に分ける（下記 論点4）。
- lesson-complete の「次へ」（破綻E）:
  - 同コース内に次があれば「次のレッスン」（現行維持）。
  - コース末尾なら「次のおすすめコース」CTA を出し、トレーニングタブのコース詳細へ送る（DF-F16 のおすすめ接続と同一データ源を使う）。

ルール3 — 離脱復帰（アプリ kill → 再起動 / バックグラウンド復帰 / 通知タップ）
- 直近のナビ状態（アクティブタブ + 各タブスタックの軽量スナップショット）を localStorage に永続化し、再起動時に復元する。
  - 復元する: タブ位置、コース詳細の category、コース再生の進行（既存 `isCoursePlayCurrent`/`clearCoursePlay` と整合）。
  - 復元しない（=安全側でリセット）: モーダル（pricing/report-problem/welcome/name-popup）、課金途中、ログイン途中、レッスン回答の途中入力。これらは復帰時に1階層上（コース詳細 or ホーム）へ。
  - 既存の「揮発オブジェクト参照を持つ」画面（`ai-problem` は `problem` オブジェクトを Screen に直接持つ・`AppV3.tsx:107`）は復元対象外。ID 参照に正規化できない限り復帰時はハブ画面に戻す。
- 通知タップ（`AppV3.tsx:323-326`）: 「学習リマインダー」は現行の home 固定ではなく、可能なら「最後に学んでいたコース詳細 or 続きのレッスン」へ deep link する（復帰スナップショットを再利用）。通知種別ごとに deep link 先を分ける（リマインダー→続き、お知らせ→home 等）。
- アプリ起動時の初期画面（`getInitialScreen`・`AppV3.tsx:130-153`）: 「ログイン済みは復帰スナップショットがあればそれを復元、無ければ home」に変更（未ログイン・オンボーディング分岐は現行維持）。

### 2.3 横断ジャンプの戻り先決定（呼び出し元保持）

横断元を Screen に持たせず、各タブスタックが自前で「呼び出し元」を保持する。modal-push されたオーバーレイ（review-hub, pricing, report-problem, ai-problem-gen 等）は、閉じる時に「push 直前のスタック先頭」へ戻る。現行の `handleBack` が tab state で戻り先を当てる方式（破綻A）を、スタック構造そのものが戻り先を持つ方式に置き換える。これにより「同じ画面でも入口で戻り先が変わる」を排除する。

### 2.4 DF-F16 ホーム情報設計との整合

DF-F16（`12f350c`+`f4dcf13`、REVIEW）は「初回=診断ヒーロー単一化 / 再訪=おすすめ接続（案A）」。本 IA はこれを前提に動線を一本化する。

- ホームは「今やる1アクション」起点。`onOpenLesson`/`onOpenCategory`/`onOpenReviewHub`/`onOpenPlacementTest`（`AppV3.tsx:472-485`）は IA 上「ホームスタックからの modal-push（戻るでホームに帰る）」または「トレーニングタブ起動（コース本格開始時）」のどちらかに分類する（論点4）。
- 再訪時の「おすすめコース接続」と lesson-complete の「次のコース」CTA（ルール2）を同一データ源・同一遷移ルールで繋ぎ、「ホームのおすすめ → コース → 完了 → 次のおすすめ」が一筆書きで回るようにする。これが DF-F16 の狙い「最優先アクションが一目」をナビ側から補強する。
- DF-F1（検索）は実装済みオーバーレイ。IA 上は「トレーニングタブのスタック内 modal」に位置づけ（タブを離れない）。発見性改善（DF-F1 の残課題）は本 IA と独立して進めてよい。
- DF-F10（タブ命名）/ DF-F11（残日数常設）も同じタブバー/ホームに乗るため、本 IA 確定後に同一パッケージでレイアウト調整する（手戻り最小）。

---

## 3. Keita が決めるべき論点

論点1 — タブ構成を変えるか（現状5本: ホーム/トレーニング/ランキング/ジャーナル/プロフィール）
- 「ランキング」タブは中身が fermi-ranking 単独で、フェルミ機能群の入口としては弱い（タブ ID と Screen 型のズレ＝破綻Dの一因でもある）。
- 選択肢: (a) 5本維持で内部整理だけ、(b) ランキングを「フェルミ/腕試し」タブに格上げ、(c) ランキングをホーム or 復習ハブに畳んで4本化。DF-F10（タブ命名）と一体で判断。

論点2 — 戻る挙動のポリシー（ルール1）
- 「タブルートで戻る → ホームタブへ」を採用するか（標準的だが、Android 物理戻るで即終了を期待する人もいる）。
- バックスワイプ（iOS）と Android 物理戻るで挙動を完全一致させてよいか。

論点3 — 離脱復帰でどこまで復元するか（ルール3）
- 「再起動で最後の画面に戻す」を採用するか、「常にホームに戻す（現行）」を維持するか。前者は復帰が速い反面、ユーザーが「リセットされた気持ち」を期待する場面と衝突しうる。
- 復元の粒度: タブ位置だけ / コース詳細まで / レッスン進行まで、のどこまで永続化するか（実装コストとトレードオフ。dev-logic 見積もり必要）。

論点4 — 横断ジャンプの2モード分け（ルール2 / §2.3）
- 「コース本格開始」と「単発の復習/参照ジャンプ」を designer 案どおり明確に分けるか。分けると挙動は直感的になるが、画面ごとに「どっちのモードか」の定義が必要。
- 特にホームの `onOpenLesson`/`onOpenCategory` をどちらに倒すか（DF-F16 のおすすめ動線に直結）。

論点5 — lesson-complete「次のコース」CTA（ルール2 / 破綻E）
- コース完了後に「次のおすすめコース」を出すか。出す場合のおすすめ源（placement 結果 / 進捗 / 固定カリキュラム順）をどれにするか。logic-coach とカリキュラム順序の整合確認が要る。

論点6 — 実装の段階導入か一括か
- スタックモデルへの正規化（tab+screen 二重管理の解消）は AppV3.tsx の中核改修。FB-05 全体の前提（他 UI 変更がこの上に乗る）なので、段階導入（まず戻るルール統一 → 次に復帰永続化）か、一括設計実装かを Keita 判断。

---

## 4. 意匠方針との衝突チェック

- AM-K 手描きトーン / コースサムネ手書き+図解スタイル（feedback_logic_course_thumbnails）: 本提案はナビゲーションの構造（遷移ルール・スタック・永続化）に閉じており、ビジュアルトーン・サムネ・配色・フォントには一切手を入れない。衝突なし。
- タブバー/ヘッダーのアイコンは既存 SVG（AppShell.tsx・Header.tsx）を流用する前提。絵文字導入や新規ビジュアル言語の追加はしない（UI chrome は SVG のみ、の方針を維持）。
- 「足すな、削れ」の方針とも整合: 本提案は画面や要素を増やすのではなく、戻り先の分岐（3系統）を1系統に削り、二重管理を1管理に削る方向。情報設計としてはホームの「1アクション起点」を強める＝動線の削減。
- DF-F16 の REVIEW 中レイアウト（診断ヒーロー単一化）と矛盾しない。むしろおすすめ接続を遷移ルール側で裏打ちする補完関係。

---

## 5. 次アクション（提案）

1. 本提案を Keita レビュー → §3 論点1〜6 を決定（IA ゲート）。
2. 決定後、dev-logic に「tab+スタック正規化 + 戻るルール統一 + 復帰永続化」のスコープ見積もりを依頼（段階導入の単位を確定）。
3. DF-F16 / DF-F10 / DF-F11 を同一パッケージとして、確定 IA の上にレイアウトを乗せる。
4. 回帰検証は test-functional で「全タブ × 横断ジャンプ × 戻る × 離脱復帰」のマトリクスを横断確認（破綻A〜Eの再現が解消されているかを受け入れ条件に）。

（本提案の実装は IA 決定後。本ドキュメントは設計のみ。）
