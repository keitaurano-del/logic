# Visual Mapping — 全レッスン横断 図解設計マップ

**作成日**: 2026-05-20
**対象**: `/root/projects/logic` 全 27 カテゴリ・約 160 レッスン
**目的**: 各 step に対する「図解 vs 文章」判定、既存 visual 流用案、新規 visual 提案を 1 枚に集約

---

## 0. 設計原則

### 0.1 図解にするべき step の条件 (＝「図解 ON」)

以下のいずれかを **2つ以上** 満たす step は図解化推奨。

| # | 条件 | 図解で得られる効果 |
|---|---|---|
| C1 | 2つ以上の要素の関係性が固定されている (ツリー・マトリクス・フロー) | 構造を一目で把握できる |
| C2 | 順序・段階・サイクルがある | 時系列方向の理解が早くなる |
| C3 | 上下・対比など空間メタファーで理解が直感的になる | テキストでは長くなる説明を 1 図で済む |
| C4 | 数式・比率・桁を扱う | 数字の桁感が文字より伝わる |
| C5 | 複数レッスンで再利用できる汎用概念 | コンポーネント投資の ROI が高い |
| C6 | 抽象概念 (具体↔抽象、視点切替、心の層など) | 図がメンタルモデルを支える |

### 0.2 文章のままが良い step の条件 (＝「図解 OFF」)

| # | 条件 | 理由 |
|---|---|---|
| T1 | 単なる定義・用語解説で要素 1〜2 個 | 図にすると冗長、文章で十分 |
| T2 | エピソード・事例の物語 | ナラティブの自然な流れを切ってしまう |
| T3 | クイズ・think 系 step (回答前) | 図はネタバレ回避の文脈で出す方が良い |
| T4 | ケース問題の中盤 (情報提示) | 状況の臨場感を保ったほうが思考に集中できる |
| T5 | 1 レッスン固有のニッチ概念 | 専用 visual の投資対効果が低い |
| T6 | 哲学・東洋思想で著者の言葉そのものに価値がある引用部 | 図解は引用の重みを薄める |

### 0.3 全体カテゴリの図解密度方針

| カテゴリ | 図解密度 | 理由 |
|---|---|---|
| ロジカルシンキング (lesson 20-27, 68) | **高** | 構造系の概念ばかりで、既に visual 完備 |
| なぜなぜ分析 (340-346) | **高** | LessonDiagrams.tsx に専用 visual を作成済 (registry 未統合) |
| ケース面接 (28-36) | 中 | フレームワーク中心、case step は図解 OFF |
| クリティカルシンキング (40-43, 69, 71, 300-303) | 中 | 思考プロセス・対比は図解、誤謬例は文章 |
| 仮説思考 (50-52, 70, 83-85, 304) | 中 | サイクル・ループは図解、事例は文章 |
| 課題設定・論点設定 (53-55, 305-306, 500-506) | 中〜高 | ツリー・マトリクスが効く |
| デザインシンキング (56-58, 307-308) | 中 | 共感マップ・JTBD・HMWは図解効果大 |
| ラテラルシンキング (59-61, 309-310) | 低〜中 | 思考の自由さを図で縛りすぎない |
| アナロジー思考 (62-64, 311-312) | 中 | 構造マッピングは図解必須 |
| システムシンキング (65-67, 313-314) | **高** | フィードバックループ・氷山・原型は図解前提 |
| 提案・伝える技術 (72-76) | 中 | SCR・PREP は図解、QA対応は文章 |
| 提案書作成 (82-88) | 中 | ストーリーラインは図解 |
| 経営戦略 (320-329) | 中 | フレームワーク (2x2マトリクス) は図解 |
| 哲学 (77-81) | **低** | 思考実験・対話は文章の方が深まる |
| 東洋思想 (350-359) | 低 | 引用と解釈中心、ごく一部のみ図解 |
| クライアントワーク (89-97, 330-339) | 中 | 観点リスト・桁感は図解、ヒアリング技法は文章 |
| フェルミ推定 (200-204) | **高** | 数式分解・桁感は図解前提 |
| 数字に強くなる (400-406) | **高** | 計算パターン・グラフ罠は図解効果大 |
| ピークパフォーマンス習慣 (410-414) | 中 | クロノタイプ・集中の波は図解 |
| 経営戦略 extra (315-316) | 中 | 単発レッスン中心 |
| 履歴書 (600-606) | 低 | テキスト主体 (STAR フォーマット中心) |
| SPI / 玉手箱 / 面接 / 給与交渉 (610-646) | 低 | 解説テキスト主体、ごく一部のみ図解 |

---

## 1. 既存 Visual の Registry (10 種)

| Visual ID | コンポーネント | 担当概念 | 現使用レッスン |
|---|---|---|---|
| `MecePatternsDiagram` | MecePatternsVisual | MECE の 4 切り口 (要素分解/時系列/対立/フレームワーク) | lesson-20 step.3 |
| `LogicTreeDiagram` | LogicTreeVisual | Why ツリー段階展開 | lesson-21 step.0 |
| `SoWhatDiagram` | SoWhatVisual | 結論↔根拠の双方向 (So What/Why So) | lesson-22 step.0 |
| `PyramidDiagram` | PyramidVisual | ピラミッド原則 3 層構造 | lesson-23 step.0 |
| `PrepDiagram` | PrepVisual | PREP 法 4 ステップ | lesson-23 step.1 |
| `CaseStudyDiagram` | CaseStudyVisual | ケース思考 4 フェーズ | lesson-24 step.0 |
| `DeductionDiagram` | DeductionVisual | 三段論法 (大前提・小前提・結論) | lesson-25 step.0 |
| `InductionDiagram` | InductionVisual | 個別観察→法則化 | lesson-26 step.0 |
| `ContrapositiveDiagram` | ContrapositiveVisual | 命題 ⇔ 対偶 + 真理値表 | lesson-27 step.3 |
| `AbstractionLadderDiagram` | AbstractionLadderVisual | 抽象ラダー (具体↔抽象を上下移動) | lesson-68 step.0 |

### 1.1 別系統で存在する diagram (LessonDiagrams.tsx 内、v3 registry には未統合)

`src/LessonDiagrams.tsx` に下記コンポーネントが存在し、whyWhyLessons.ts で `visual:` キーに指定されているが、`src/visuals/index.ts` の `visualRegistry` には未登録。v3 では `<Lesson.tsx>` の旧コードからのみ参照される模様。

- `MeceCaseDiagram` (3C 分析)
- `LogicTreeCaseDiagram` (離職率 Why ツリー)
- `WhyWhySymptomVsRootDiagram` (対症療法 vs 根本治療)
- `WhyWhyChainDiagram` (なぜなぜ 5 階層)
- `WhyWhyVsLogicTreeDiagram` (なぜなぜ vs Why ツリー)
- `WhyWhyToyotaDiagram` (トヨタ古典事例)
- `WhyWhyStopRuleDiagram` (止めどき)
- `WhyWhyPitfallsDiagram` (3 つの落とし穴)
- `WhyWhyParallelDiagram` (並行ループ)
- `WhyWhyEvidenceDiagram` (層ごとの裏付け)

**対応案**: `src/visuals/` 配下の v3 スタイル (`vz-*` クラス) に移植して registry に登録する。新規開発でなく移植なので工数は中程度。

---

## 2. 全レッスン一覧表

凡例: **Vis済** = 現状 visual 指定あり / **要追加** = 図解候補あり / **不要** = 文章で十分

| ID | カテゴリ | タイトル | 既存visual | 図解候補step数 | 図解判定理由 (簡潔) |
|---|---|---|---|---|---|
| 20 | ロジカルシンキング | MECE — 漏れなくダブりなく | MecePatternsDiagram | 1 | step.0 (定義) に「漏れ/ダブり」ベン図を追加すると効果大 |
| 21 | ロジカルシンキング | ロジックツリー — 問題を分解する | LogicTreeDiagram | 1 | step.2 「粒度を揃える」に粒度比較図を追加検討 |
| 22 | ロジカルシンキング | So What / Why So — 論理の検証 | SoWhatDiagram | 0 | 既に十分 |
| 23 | ロジカルシンキング | ピラミッド原則 — 伝わる話し方 | PyramidDiagram, PrepDiagram | 0 | 既に十分 |
| 24 | ロジカルシンキング | ケーススタディ — 総合演習 | CaseStudyDiagram | 1 | ケース 1 (3C風) に MeceCaseDiagram 流用候補 |
| 25 | ロジカルシンキング | 演繹法 — 一般から個別へ | DeductionDiagram | 0 | 既に十分 |
| 26 | ロジカルシンキング | 帰納法 — 個別から一般へ | InductionDiagram | 0 | 既に十分 |
| 27 | ロジカルシンキング | 形式論理 — 「A ならば B」 | ContrapositiveDiagram | 1 | step.1「A→B 真理値」表が独立で効く |
| 28 | ケース面接 | ケース面接入門 | - | 1 | step.1「3 つの思考の柱」を 3 列カード図解 |
| 29 | ケース面接 | プロフィタビリティケース | - | 1 | step.0「利益構造ツリー」を visualize |
| 35 | ケース面接 | 新市場参入ケース | - | 1 | step.0「3 軸 (魅力度/優位性/実行可能性)」マトリクス |
| 36 | ケース面接 | M&A ケース | - | 1 | step.0「3 軸 (戦略適合/シナジー/価格)」三角形 |
| 40 | クリティカル | クリティカルシンキング入門 | - | 1 | step.2「主張/根拠/前提」3 層図 |
| 41 | クリティカル | 論理的誤謬を見破る | - | 1 | step.0「5 つの誤謬」アイコン付きグリッド |
| 42 | クリティカル | データを正しく読む | - | 2 | step.0「グラフの罠」3 種、step.2「相対 vs 絶対」 |
| 43 | クリティカル | 問いを立てる力 | - | 1 | step.0「問いのレベル 1→4」階段図 |
| 50 | 仮説思考 | 仮説思考入門 | - | 1 | step.0「ボトムアップ vs 仮説思考」2 列比較 |
| 51 | 仮説思考 | 仮説の立て方と検証 | - | 1 | step.2「イシューツリー」(LogicTree 流用) |
| 52 | 仮説思考 | 仮説ドリブンの課題解決 | - | 1 | step.2「Quick & Dirty 検証」3 技法カード |
| 53 | 課題設定 | 課題設定入門 | - | 2 | step.2「問題 vs 課題」、step.3「Where→Why→How」フロー |
| 54 | 課題設定 | イシュー分析 | - | 1 | step.1「インパクト × 実行容易性」2×2 マトリクス |
| 55 | 課題設定 | 課題設定実践 | - | 0 | ケース中心、文章で十分 |
| 56 | デザインシンキング | デザインシンキング入門 | - | 1 | step.0「5 ステップサイクル」円環図 |
| 57 | デザインシンキング | 共感マップとペルソナ | - | 2 | step.0「共感マップ 4 象限」、step.2「JTBD トライアド」 |
| 58 | デザインシンキング | デザインシンキング実践 | - | 1 | step.0「HMW テンプレ」フィルター図 |
| 59 | ラテラル | ラテラルシンキング入門 | - | 1 | step.0「垂直 vs 水平」上下/左右図 |
| 60 | ラテラル | ラテラルシンキング技法 | - | 2 | step.1「SCAMPER 7 視点」、step.2「6 帽子」 |
| 61 | ラテラル | ラテラルシンキング実践 | - | 0 | 事例中心、文章で十分 |
| 62 | アナロジー | アナロジー思考入門 | - | 1 | step.1「表面 vs 構造の類似」比較図 |
| 63 | アナロジー | アナロジーの技法 | - | 1 | step.1「抽象化↔具体化」サイクル (Abstraction Ladder 拡張) |
| 64 | アナロジー | アナロジー思考実践 | - | 0 | ワーク中心、文章で十分 |
| 65 | システム | システムシンキング入門 | - | 2 | step.1「強化 vs バランスループ」、step.2「氷山モデル」 |
| 66 | システム | システム原型 | - | 2 | step.0「Fixes that Fail」、step.2「成長の限界」 |
| 67 | システム | システムシンキング実践 | - | 1 | step.0「因果ループ図」テンプレ |
| 68 | ロジカル | 具体と抽象 | AbstractionLadderDiagram | 0 | 既に十分 |
| 69 | クリティカル | 認知バイアスを外す | - | 1 | step.0「3 大バイアス」アイコン付きカード |
| 70 | 仮説思考 | 仮説の検証設計 | - | 1 | step.1「MVP テスト設計 4 ステップ」フロー |
| 71 | クリティカル | 相関と因果を見分ける | - | 2 | step.0「相関 ≠ 因果」第三変数図、step.2「A/B vs 前後比較」 |
| 72 | 提案 | 提案書の目的を定める | - | 1 | step.0「3 つの目的 (承認/共感/行動)」3 列 |
| 73 | 提案 | 相手の立場で考える | - | 1 | step.0「ステークホルダー 3 軸 (CFO/現場/経営層)」 |
| 74 | 提案 | ストーリーラインの設計 | - | 1 | step.0「SCR 構造」3 ボックス縦並び |
| 75 | 提案 | メッセージを磨く | - | 1 | step.0「トピック vs メッセージ」タイトル比較 |
| 76 | 提案 | 反論を先読みする | - | 1 | step.1「タイミング 4 軸 (市場/コスト/社内/規制)」 |
| 77 | 哲学 | ソクラテスの問答法 | - | 1 | step.1「問答 3 ステップ」 |
| 78 | 哲学 | 反証可能性 | - | 0 | 文章で深まる |
| 79 | 哲学 | 功利主義と義務論 | - | 1 | step.1「トロッコ問題」シーン (図解必須) |
| 80 | 哲学 | 認識論入門 | - | 1 | step.1「知識の 3 条件 (真・信念・正当化)」ベン図 |
| 81 | 哲学 | 思考実験 | - | 0 | 文章で深まる |
| 82 | 提案書作成 | コース導入 | - | 0 | 文章で十分 |
| 83 | 提案書作成 | 仮説思考の基礎 | - | 1 | step.2「課題→原因→打ち手」3 階層 |
| 84 | 提案書作成 | 調査設計 | - | 1 | step.3「調査設計シート (4 項目)」 |
| 85 | 提案書作成 | 仮説検証プロセス | - | 1 | step.0「仮説支持/修正/棄却」3 分岐フロー |
| 86 | 提案書作成 | 課題構造化と打ち手設計 | - | 2 | step.0「課題ツリー」、step.3「効果 × 実現可能性」2×2 |
| 87 | 提案書作成 | 提案書骨子作成 | - | 1 | step.0「As-Is → Why → To-Be → How → So What」フロー |
| 88 | 提案書作成 | 提案書作成演習 | - | 0 | 通し演習、文章中心 |
| 89 | クライアントワーク | 大きい数字の捉え方・概算力 | - | 2 | step.1「桁→単位対応表」、step.2「桁数判定フロー」 |
| 90 | クライアントワーク | 論点を定める | - | 1 | step.1「So What / Why So 往復」(既存 SoWhatDiagram 流用可) |
| 91 | クライアントワーク | ヒアリングの技術 | - | 1 | step.1「オープン vs クローズド」対比 |
| 92 | クライアントワーク | 情報の読み解き方 | - | 1 | step.1「主張/根拠/具体例」3 層 (lesson-40 と共通) |
| 93 | クライアントワーク | 構造化思考 | - | 1 | step.1「因果関係 vs 並列関係」対比 |
| 94 | クライアントワーク | 伝え方・文章化 | - | 1 | step.0「PREP 法」(既存 PrepDiagram 流用) |
| 95 | クライアントワーク | ストーリーライン設計 | - | 1 | step.3「ピラミッドストラクチャー」(既存 PyramidDiagram 流用) |
| 96 | クライアントワーク | レポーティング | - | 1 | step.0「事実/解釈/アクション」3 段 |
| 97 | クライアントワーク | フィードバックの受け方 | - | 1 | step.3「改善サイクル 4 ステップ」 |
| 200 | フェルミ推定 | フェルミ推定とは何か | - | 1 | step.1「4 ステップフロー」 |
| 201 | フェルミ推定 | 分解の技術：数式を作る | - | 2 | step.0「市場規模公式」、step.1「3 つの分解パターン」 |
| 202 | フェルミ推定 | 実践①都市・インフラ | - | 1 | step.0「分解 → 概算」フロー |
| 203 | フェルミ推定 | 実践②ビジネス規模 | - | 1 | 同上テンプレ流用 |
| 204 | フェルミ推定 | よくある罠と対策 | - | 1 | step.0「3 つの罠」アイコン付きカード |
| 300 | クリティカル | 確証バイアスから抜け出す | - | 1 | step.0「確証バイアスの罠」(lesson-69 と統合可) |
| 301 | クリティカル | アンカリング効果に気づく | - | 1 | step.0「最初の数字に引きずられる」イラスト |
| 302 | クリティカル | フレーミング効果を見破る | - | 1 | step.0「同じ事実、違う見え方」対比 |
| 303 | クリティカル | サンクコストの罠 | - | 1 | step.0「過去コスト無視」概念図 |
| 304 | 仮説思考 | アブダクション | - | 1 | step.0「演繹/帰納/アブダクション」3 列比較 (lesson-25/26 と統合) |
| 305 | 課題設定 | 「解き方」より「問い方」を変える | - | 1 | step.0「ダブルループ学習」サイクル |
| 306 | 課題設定 | 問いをリフレームして突破口 | - | 0 | 事例中心 |
| 307 | デザイン | HMW で問いを立てる | - | 1 | step.0「HMW テンプレ」(lesson-58 と統合) |
| 308 | デザイン | 素早く試して速く学ぶ | - | 1 | step.0「Build-Measure-Learn」サイクル |
| 309 | ラテラル | PMI 法 | - | 1 | step.0「Plus/Minus/Interesting」3 列 |
| 310 | ラテラル | ランダム入力 | - | 0 | テクニック中心 |
| 311 | アナロジー | 構造マッピング | - | 1 | step.0「構造 → 翻訳」フロー |
| 312 | アナロジー | 異分野転用 | - | 0 | 事例中心 |
| 313 | システム | システム原型 | - | 1 | step.0 (lesson-66 と統合) |
| 314 | システム | レバレッジポイント | - | 1 | step.0「介入階層 (パラメータ→ルール→目標→パラダイム)」 |
| 315 | クライアントワーク | エレベーターピッチ | - | 1 | step.0「30 秒構成 (状況/問題/提案)」3 段 |
| 316 | ケース面接 | 分析を統合して提言 | - | 1 | step.0「分析 → 統合 → 提言」フロー |
| 320 | 経営戦略 | 戦略の起源 | - | 0 | 歴史的経緯、文章で十分 |
| 321 | 経営戦略 | アンゾフのマトリクス | - | 1 | step.1「2×2 マトリクス」(汎用 visual 候補) |
| 322 | 経営戦略 | PPM | - | 1 | step.1「4 象限 (花形/金のなる木/問題児/負け犬)」 |
| 323 | 経営戦略 | ポーターの 5 フォース | - | 1 | step.0「5 力構造図」(中央 + 4 周辺) |
| 324 | 経営戦略 | 3 つの基本戦略 | - | 1 | step.0「コストリーダーシップ/差別化/集中」3 軸 |
| 325 | 経営戦略 | RBV と VRIO | - | 1 | step.0「VRIO フレーム」4 段チェック |
| 326 | 経営戦略 | コアコンピタンス | - | 0 | 文章で十分 |
| 327 | 経営戦略 | ブルーオーシャン戦略 | - | 1 | step.0「ERRC グリッド」 |
| 328 | 経営戦略 | ダイナミックケイパビリティ | - | 0 | 文章で十分 |
| 329 | 経営戦略 | プラットフォーム戦略 | - | 1 | step.0「ネットワーク効果」ハブ図 |
| 330-335 | クライアントワーク | キャッチアップ系 | - | 0 | プロセス解説中心、文章で十分 |
| 336 | クライアントワーク | 考える観点を増やす | - | 1 | step.1「9 観点リスト」グリッド |
| 337-339 | クライアントワーク | フィードバック対応ケース | - | 0 | ケース問題中心、case step は図解 OFF |
| 340 | なぜなぜ分析 | なぜなぜ分析入門 | WhyWhySymptomVsRootDiagram, WhyWhyChainDiagram, WhyWhyVsLogicTreeDiagram | 0 | 既に十分 (registry 統合のみ要対応) |
| 341 | なぜなぜ分析 | トヨタ生産方式 | WhyWhyToyotaDiagram | 0 | 既に十分 |
| 342 | なぜなぜ分析 | 基本ステップと止めどき | WhyWhyStopRuleDiagram | 0 | 既に十分 |
| 343 | なぜなぜ分析 | 落とし穴 | WhyWhyPitfallsDiagram | 0 | 既に十分 |
| 344 | なぜなぜ分析 | 横展開と並行ループ | WhyWhyParallelDiagram | 0 | 既に十分 |
| 345 | なぜなぜ分析 | 仮説検証で各層を裏付ける | WhyWhyEvidenceDiagram | 0 | 既に十分 |
| 346 | なぜなぜ分析 | 実践ケース | - | 0 | ケース問題中心 |
| 350-359 | 東洋思想 | 孔子・孟子・荀子・墨子・老子・荘子・韓非子・孫子 | - | 各 0〜1 | 引用と解釈中心、ごく一部のみ図解 (例: 韓非子「法・術・勢」3 角形) |
| 400 | 数字に強くなる | 暗算力を鍛える | - | 1 | step.9「使い分け早見表」フローチャート |
| 401 | 数字に強くなる | 数字で正しく伝える | - | 1 | step.x「絶対値 vs 相対値」グラフ罠 |
| 402 | 数字に強くなる | 割合・前年比・成長率 | - | 1 | step.x「単利 vs 複利」曲線 |
| 403 | 数字に強くなる | 単位換算とスケール感覚 | - | 1 | step.x「桁スケール (μ→m→k→M→G)」 |
| 404 | 数字に強くなる | CAGR・複利・指数的成長 | - | 1 | step.x「指数曲線 vs 直線」 |
| 405 | 数字に強くなる | 平均・中央値・分布 | - | 2 | step.x「正規分布 vs 歪み分布」、外れ値の影響 |
| 406 | 数字に強くなる | 数字の落とし穴を見抜く | - | 1 | step.x「Y軸ゼロカット」例 |
| 410 | ピークパフォーマンス | クロノタイプ | - | 1 | step.0「朝型/夜型/中間型」3 種カーブ |
| 411 | 〃 | 睡眠が思考の質を決める | - | 1 | step.0「睡眠時間 vs 認知パフォーマンス」グラフ |
| 412 | 〃 | 運動で脳をブースト | - | 1 | step.0「強度 × 頻度」マトリクス |
| 413 | 〃 | 集中の波を仕事に合わせる | - | 1 | step.0「ピーク時間と作業の振り分け」タイムライン |
| 414 | 〃 | 自分の体調を計測する | - | 0 | 文章で十分 |
| 500-506 | 論点設定 | 論点設定コース | - | 各 1〜2 | step によって ツリー / マトリクス / フェルミ感度分析 |
| 600-606 | 履歴書 | 履歴書・職務経歴書 | - | 各 0〜1 | STAR フォーマットのみ図解候補、その他は文章 |
| 610-616 | SPI | SPI 対策 | - | 各 0〜1 | 公式の図解 (速度算など) は可、その他は文章 |
| 620-625 | 玉手箱 | 玉手箱対策 | - | 各 0 | 解説テキスト中心 |
| 630-637 | 面接対策 | 面接 | - | 各 0〜1 | 構造化面接の評価軸のみ図解候補 |
| 640-646 | 給与交渉 | 給与交渉・退職実務 | - | 各 0 | フロー解説中心、文章で十分 |

合計: 約 **75 step** が新規図解候補 (既存 visual 18 step を除く)

---

## 3. Step 単位の図解候補リスト (詳細)

### 3.1 ロジカルシンキング系の補強

#### lesson-20 (MECE) / step.0 「MECEって何？」
- 概念: 漏れ × ダブり の 2 軸
- 推奨 visualId: `MeceVennDiagram` (新規)
- 理由: 「漏れあり / ダブりあり / MECE」を 3 つのベン図で並べると一発で違いが分かる
- 流用可: lesson-501 step.0 (MECEで漏れなくダブりなく) でも使用可能 → 高優先

#### lesson-21 (LogicTree) / step.2 「粒度を揃える」
- 概念: 同じ階層に並ぶ要素の粒度比較
- 推奨 visualId: `GranularityCompareVisual` (新規)
- 理由: NG例 vs OK例を視覚的に対比すると「揃ってない感」が直感で伝わる
- 流用可: lesson-93 step.1, lesson-502 step.1 → 中優先

#### lesson-27 (形式論理) / step.1 「A→B 条件文」
- 概念: 4 通り (T/F) × 2 の真理値表
- 推奨 visualId: `ConditionTruthTableVisual` (新規) — または `ContrapositiveVisual` を分離して再利用
- 理由: 言語のみだと「A 偽で B 真でも真」が腑に落ちにくい
- 優先度: 低 (lesson-27 step.3 で既に対偶+真理値表は visual 化済)

### 3.2 ケース面接系

#### lesson-28 / step.1 「3 つの思考の柱」
- 概念: 仮説思考 / MECE / 優先度づけ
- 推奨 visualId: `ThreePillarsVisual` (新規・汎用)
- 流用可: lesson-89 step.2「桁感」3 軸、lesson-72 step.0「3 つの目的」など → **高優先・汎用**

#### lesson-29 / step.0 「利益構造の分解」
- 概念: 利益ツリー (売上 × 数量 × 単価 / コスト × 固定費 × 変動費)
- 推奨 visualId: `ProfitTreeVisual` (新規) または `LogicTreeVisual` の汎用化
- 流用可: lesson-86 step.0「課題ツリー」、lesson-93 step.1 → 中優先

#### lesson-35 / step.0 「市場参入 3 軸」
- 概念: 市場魅力度 × 競争優位性 × 実行可能性 の 3 軸評価
- 推奨 visualId: `ThreeAxisRadarVisual` (新規)
- 流用可: lesson-36 (M&A 3 軸)、lesson-89 (桁感 × 重要性) → 中優先

### 3.3 クリティカルシンキング系

#### lesson-40 / step.2 「主張・根拠・前提」
- 概念: 3 層構造 (主張は氷山の上、前提は水面下)
- 推奨 visualId: `ClaimReasonAssumptionVisual` (新規)
- 流用可: lesson-92 step.1「主張/根拠/具体例」(似ているが要素が違うのでバリエーション展開) → 高優先

#### lesson-41 / step.0 「5 つの誤謬」
- 概念: 権威/人身攻撃/多数決/藁人形/因果の誤り
- 推奨 visualId: `FallacyGridVisual` (新規) または既存 `MecePatternsVisual` の汎用化版
- 理由: 5 種を 1 枚で並べると印象に残る
- 優先度: 中

#### lesson-42 / step.0 「グラフの罠」
- 概念: Y軸ゼロカット / 相関≠因果 / サンプル偏り
- 推奨 visualId: `GraphPitfallsVisual` (新規)
- 流用可: lesson-406 step.x → **高優先** (数字系で多用)

#### lesson-42 / step.2 「絶対値 vs 相対値」
- 概念: 同じ事実が見せ方で印象激変
- 推奨 visualId: `AbsoluteVsRelativeVisual` (新規)
- 流用可: lesson-401 → 中優先

#### lesson-71 / step.0 「相関 ≠ 因果」
- 概念: 第三変数 (気温 → アイス & 溺死) の図
- 推奨 visualId: `CorrelationCausationVisual` (新規)
- 理由: 「アイス と 溺死」の有名な例を絵で示すと記憶に残る
- 流用可: lesson-42 step.0 と共通化可能 → 高優先

### 3.4 仮説思考系

#### lesson-50 / step.0 「ボトムアップ vs 仮説思考」
- 概念: 矢印の向きが逆 (情報 → 結論 vs 仮説 → 検証 → 結論)
- 推奨 visualId: `HypothesisFlowVisual` (新規)
- 流用可: lesson-83 step.1, lesson-85 step.0 → 高優先

#### lesson-51 / step.2 「イシューツリー」
- 概念: 既存 `LogicTreeVisual` の汎用化で対応可能
- 推奨対応: `LogicTreeVisual` に prop を追加して任意の階層構造を受け取れるよう拡張
- 流用可: lesson-86 step.0, lesson-502 step.0 → **高優先**

#### lesson-70 / step.1 「MVP 検証 4 ステップ」
- 概念: Key Assumption → KPI → 最小テスト → 判定基準
- 推奨 visualId: `MvpTestDesignVisual` (新規)
- 流用可: lesson-84 step.3 → 中優先

### 3.5 課題設定系

#### lesson-53 / step.3 「Where → Why → How」
- 概念: 3 段フロー
- 推奨 visualId: `WhereWhyHowVisual` (新規)
- 流用可: lesson-95 step.0 (ストーリーライン) → 中優先

#### lesson-54 / step.1 「インパクト × 実行容易性」2×2
- 概念: 最優先 / Quick Win / 戦略的計画 / 後回し
- 推奨 visualId: `ImpactEffortMatrixVisual` (新規・汎用)
- 流用可: lesson-86 step.3, lesson-321 (アンゾフ) と組み合わせて 2×2 マトリクス汎用化 → **高優先**

### 3.6 デザインシンキング系

#### lesson-56 / step.0 「5 ステップサイクル」
- 概念: 共感→定義→発想→試作→検証 の円環
- 推奨 visualId: `DesignThinkingCycleVisual` (新規)
- 流用可: lesson-308「Build-Measure-Learn」と統合 → 中優先

#### lesson-57 / step.0 「共感マップ 4 象限」
- 概念: Think&Feel / See / Hear / Say&Do
- 推奨 visualId: `EmpathyMapVisual` (新規)
- 理由: フレームワーク図解の定番、これは図解必須
- 優先度: 高

#### lesson-57 / step.2 「JTBD トライアド」
- 概念: 状況 + 動機 + ジョブ
- 推奨 visualId: `JtbdVisual` (新規)
- 優先度: 中

### 3.7 ラテラル系

#### lesson-59 / step.0 「垂直 vs 水平」
- 概念: 矢印の向き (下向き深掘り vs 横方向リフレーミング)
- 推奨 visualId: `VerticalVsLateralVisual` (新規)
- 優先度: 中

#### lesson-60 / step.1 「SCAMPER 7 視点」
- 概念: 7 つの変換アイコン
- 推奨 visualId: `ScamperVisual` (新規)
- 優先度: 中

#### lesson-60 / step.2 「6 つの帽子」
- 概念: 色付き帽子アイコン 6 つ
- 推奨 visualId: `SixHatsVisual` (新規)
- 理由: 視覚的アイデンティティが強い概念、図解効果大
- 優先度: 高

### 3.8 アナロジー系

#### lesson-62 / step.1 「表面類似 vs 構造類似」
- 概念: 2 つの矢印図 (片方は見た目だけ、もう片方はメカニズム)
- 推奨 visualId: `SurfaceVsStructureVisual` (新規)
- 優先度: 中

#### lesson-63 / step.1 「抽象化↔具体化」
- 概念: 既存 `AbstractionLadderVisual` を流用可能
- 優先度: 既存流用なので追加開発不要

### 3.9 システムシンキング系 (高優先)

#### lesson-65 / step.1 「強化 vs バランスループ」
- 概念: 円環の矢印 (R = 強化, B = バランス)
- 推奨 visualId: `FeedbackLoopVisual` (新規)
- 流用可: lesson-66, lesson-67, lesson-313 すべて → **超高優先**

#### lesson-65 / step.2 「氷山モデル」
- 概念: 4 層 (できごと/パターン/構造/メンタルモデル) 氷山図
- 推奨 visualId: `IcebergModelVisual` (新規)
- 理由: メタファーが強烈、文章で説明するより一発で伝わる
- 優先度: 高

#### lesson-66 / step.0 「Fixes that Fail (応急処置の失敗)」
- 概念: 短期改善 → 副作用 → 悪化 のループ
- 推奨 visualId: `SystemArchetypeVisual` (新規) — 複数のシステム原型 (Fixes that Fail / Limits to Growth / Tragedy of the Commons 等) を切替表示
- 優先度: 高

#### lesson-67 / step.0 「因果ループ図」
- 概念: 任意のループを描くテンプレ
- 推奨 visualId: `CausalLoopDiagramVisual` (新規・汎用)
- 流用可: 多数 → 高優先

#### lesson-314 / step.0 「介入階層」
- 概念: パラメータ → ルール → 目標 → パラダイム の 4 段ピラミッド
- 推奨 visualId: `LeveragePointsVisual` (新規)
- 優先度: 中

### 3.10 提案・伝える系

#### lesson-72 / step.0 「3 つの目的」
- 概念: 承認 / 共感 / 行動 の 3 列
- 推奨 visualId: 汎用 `ThreePillarsVisual` 流用
- 優先度: 中

#### lesson-74 / step.0 「SCR 構造」
- 概念: Situation → Complication → Resolution の 3 段
- 推奨 visualId: `ScrStructureVisual` (新規)
- 優先度: 中

#### lesson-75 / step.0 「トピック vs メッセージタイトル」
- 概念: 2 列対比
- 推奨 visualId: `TitleCompareVisual` (新規・小さめ)
- 優先度: 低

### 3.11 フェルミ推定系 (高優先)

#### lesson-200 / step.1 「フェルミ 4 ステップ」
- 概念: 問い定義 → 分解 → 推定 → 統合検算
- 推奨 visualId: `FermiStepsVisual` (新規)
- 優先度: 高

#### lesson-201 / step.0 「市場規模公式」
- 概念: 対象人口 × 利用率 × 頻度 × 単価
- 推奨 visualId: `FermiFormulaVisual` (新規)
- 流用可: lesson-202, lesson-203, lesson-89 → **超高優先**

#### lesson-201 / step.1 「3 つの分解パターン」
- 概念: ストック型 / フロー型 / 人口ベース型
- 推奨 visualId: `FermiPatternsVisual` (新規)
- 優先度: 中

### 3.12 数字に強くなる系 (高優先)

#### lesson-400 / step.9 「使い分け早見表」
- 概念: 数字パターン → 適切な暗算ワザ のフローチャート
- 推奨 visualId: `MentalMathDecisionTreeVisual` (新規)
- 優先度: 高

#### lesson-401 系 グラフ表現の罠
- すでに lesson-42 で挙げた `GraphPitfallsVisual` を流用可能 → **超高優先で汎用化**

#### lesson-404 / step.x 「指数曲線 vs 直線」
- 概念: CAGR の力を曲線で示す
- 推奨 visualId: `ExponentialCurveVisual` (新規)
- 優先度: 中

#### lesson-405 / step.x 「正規分布 vs 歪み分布」
- 概念: 平均と中央値の違いをグラフで
- 推奨 visualId: `DistributionShapeVisual` (新規)
- 優先度: 中

### 3.13 経営戦略系

#### lesson-321 (アンゾフ)
- 推奨 visualId: 汎用 `Two2MatrixVisual` (新規) — 2×2 マトリクスを任意のラベルで描けるコンポーネント
- 流用可: lesson-54 (インパクト×実行容易性)、lesson-322 (PPM)、lesson-412 (運動強度×頻度)、lesson-86 step.3 → **超高優先・最も汎用性高い**

#### lesson-323 (5 フォース)
- 推奨 visualId: `FiveForcesVisual` (新規・専用)
- 優先度: 中 (戦略コースの中核)

#### lesson-325 (VRIO)
- 推奨 visualId: `VrioVisual` (新規・専用)
- 優先度: 中

#### lesson-327 (ERRC グリッド)
- 推奨 visualId: `ErrcGridVisual` (新規)
- 優先度: 低 (1 レッスン専用)

### 3.14 哲学・東洋思想

#### lesson-79 (トロッコ問題)
- 概念: 線路の絵 (5 人と 1 人とレバー)
- 推奨 visualId: `TrolleyProblemVisual` (新規・1 レッスン専用、ただしインパクト大)
- 優先度: 中

#### lesson-80 (知識の 3 条件)
- 概念: 真 / 信念 / 正当化 のベン図
- 推奨 visualId: `JtbDiagramVisual` (新規) — または `MeceVennDiagram` 汎用化で対応
- 優先度: 低

#### lesson-358 (韓非子の法・術・勢)
- 概念: 三角形 (3 要素のバランス)
- 推奨 visualId: 汎用 `TriadVisual` (新規)
- 流用可: lesson-72 (3 つの目的) など → 中優先

---

## 4. 既存 Visual 流用マップ

### 4.1 既存 10 visual の追加流用候補

| 既存 Visual | 現状利用 | 追加流用候補 |
|---|---|---|
| `MecePatternsDiagram` | lesson-20 | lesson-501 (MECE 漏れダブり), lesson-93 (構造化思考) |
| `LogicTreeDiagram` | lesson-21 | lesson-29 (利益ツリー), lesson-51 (イシューツリー), lesson-86 (課題ツリー), lesson-502 (論点ツリー) ※ 汎用化が必要 |
| `SoWhatDiagram` | lesson-22 | lesson-90 (論点を定める), lesson-503 (論点に仮説を当てる) |
| `PyramidDiagram` | lesson-23 | lesson-95 (ストーリーライン), lesson-87 (提案書骨子) |
| `PrepDiagram` | lesson-23 | lesson-94 (伝え方・文章化) |
| `CaseStudyDiagram` | lesson-24 | lesson-28 (ケース面接入門) ※ 4 フェーズ汎用化 |
| `DeductionDiagram` | lesson-25 | lesson-304 (アブダクション) |
| `InductionDiagram` | lesson-26 | lesson-304 (アブダクション) |
| `ContrapositiveDiagram` | lesson-27 | (専用) |
| `AbstractionLadderDiagram` | lesson-68 | lesson-63 (アナロジー — 抽象化↔具体化) |

### 4.2 既存 LessonDiagrams.tsx を v3 registry に移植する対応

| 旧 Diagram | 使用レッスン | 移植優先度 |
|---|---|---|
| `WhyWhySymptomVsRootDiagram` | lesson-340 | **高** (なぜなぜコース全体に影響) |
| `WhyWhyChainDiagram` | lesson-340 | 高 |
| `WhyWhyVsLogicTreeDiagram` | lesson-340 | 高 |
| `WhyWhyToyotaDiagram` | lesson-341 | 高 |
| `WhyWhyStopRuleDiagram` | lesson-342 | 高 |
| `WhyWhyPitfallsDiagram` | lesson-343 | 高 |
| `WhyWhyParallelDiagram` | lesson-344 | 高 |
| `WhyWhyEvidenceDiagram` | lesson-345 | 高 |
| `MeceCaseDiagram` | (未使用) | 中 — lesson-24 ケース1 で再活用可 |
| `LogicTreeCaseDiagram` | (未使用) | 低 |

---

## 5. 新規 Visual 提案リスト (使い回し優先)

### 5.1 超高優先 (汎用性高、複数レッスンで利用)

| 命名案 | 概念 | 使用レッスン候補 | 優先度 |
|---|---|---|---|
| `Two2MatrixVisual` | 任意の 2×2 マトリクス (汎用コンポーネント) | lesson-54, lesson-86, lesson-321, lesson-322, lesson-412 | **最高** |
| `FeedbackLoopVisual` | 強化ループ / バランスループ (任意のループ図) | lesson-65, lesson-66, lesson-67, lesson-313 | 高 |
| `CausalLoopDiagramVisual` | 因果ループ図 (汎用) | lesson-67, lesson-65 step.0 派生 | 高 |
| `FermiFormulaVisual` | 市場規模公式 (人口 × 率 × 頻度 × 単価) | lesson-201, lesson-202, lesson-203, lesson-89 | 高 |
| `ThreePillarsVisual` | 3 つの柱 / 列 (汎用 3 列カード) | lesson-28, lesson-72, lesson-89, lesson-96, lesson-315, lesson-358 | 高 |
| `MeceVennDiagram` | MECE / 漏れ / ダブり の 3 ベン図 | lesson-20, lesson-501, lesson-80 (JTB) 派生 | 高 |
| `GraphPitfallsVisual` | グラフの罠 (Y軸ゼロカット / 相関≠因果 / 偏り) | lesson-42, lesson-401, lesson-406 | 高 |
| `EmpathyMapVisual` | 共感マップ 4 象限 | lesson-57 | 中 (1 レッスンだが視覚的アイデンティティ強) |

### 5.2 高優先 (中程度の汎用性)

| 命名案 | 概念 | 使用レッスン候補 | 優先度 |
|---|---|---|---|
| `HypothesisFlowVisual` | ボトムアップ vs 仮説思考 (フロー比較) | lesson-50, lesson-83, lesson-85 | 高 |
| `IcebergModelVisual` | 氷山モデル (4 層) | lesson-65, lesson-67 派生 | 高 |
| `SystemArchetypeVisual` | システム原型 (切替式) | lesson-66, lesson-313 | 高 |
| `FermiStepsVisual` | フェルミ 4 ステップ | lesson-200 | 中 |
| `ClaimReasonAssumptionVisual` | 主張/根拠/前提 3 層 | lesson-40, lesson-92 (バリエーション) | 中 |
| `MentalMathDecisionTreeVisual` | 暗算ワザの早見表 | lesson-400 | 中 |
| `ImpactEffortMatrixVisual` | インパクト × 実行容易性 (Two2MatrixVisual の 1 インスタンス) | lesson-54, lesson-86 | Two2MatrixVisual に統合 |

### 5.3 中優先 (特定コース内で複数利用)

| 命名案 | 概念 | 使用レッスン候補 | 優先度 |
|---|---|---|---|
| `ScrStructureVisual` | SCR (Situation/Complication/Resolution) | lesson-74 | 中 |
| `WhereWhyHowVisual` | Where → Why → How フロー | lesson-53, lesson-95 | 中 |
| `JtbdVisual` | Jobs to be Done トライアド | lesson-57 | 中 |
| `SixHatsVisual` | 6 つの帽子思考法 | lesson-60 | 中 |
| `ScamperVisual` | SCAMPER 7 視点 | lesson-60 | 中 |
| `TriadVisual` | 3 要素三角形 (汎用) | lesson-358 (法・術・勢), lesson-72 (3 目的) | 中 |
| `FiveForcesVisual` | ポーター 5 フォース | lesson-323 | 中 |
| `VrioVisual` | VRIO 4 段チェック | lesson-325 | 中 |
| `DistributionShapeVisual` | 平均 vs 中央値 (歪み分布) | lesson-405 | 中 |
| `ExponentialCurveVisual` | 指数 vs 直線 | lesson-404 | 中 |
| `LeveragePointsVisual` | 介入階層 4 段 | lesson-314 | 中 |
| `MvpTestDesignVisual` | MVP テスト設計 4 ステップ | lesson-70, lesson-84 | 中 |
| `DesignThinkingCycleVisual` | 5 ステップ円環 | lesson-56, lesson-308 | 中 |
| `VerticalVsLateralVisual` | 垂直 vs 水平思考 | lesson-59 | 中 |

### 5.4 低優先 (1 レッスン専用、インパクト依存)

| 命名案 | 概念 | 使用レッスン | 採否目安 |
|---|---|---|---|
| `TrolleyProblemVisual` | トロッコ問題シーン | lesson-79 | インパクト大なら作る価値あり |
| `ErrcGridVisual` | ブルーオーシャン ERRC | lesson-327 | 戦略コースを深掘る時に追加 |
| `CorrelationCausationVisual` | アイス×溺死×気温の 3 角 | lesson-71 | GraphPitfallsVisual と統合可 |
| `FallacyGridVisual` | 5 つの誤謬 | lesson-41 | アイコン整備が前提 |
| `SurfaceVsStructureVisual` | 表面類似 vs 構造類似 | lesson-62 | アナロジーコース内のみ |
| `AbsoluteVsRelativeVisual` | 絶対値 vs 相対値 | lesson-42, lesson-401 | 数字系コースを深掘る時に |
| `GranularityCompareVisual` | 粒度 OK/NG 対比 | lesson-21, lesson-502 | LogicTreeVisual の汎用化で代替可 |
| `TitleCompareVisual` | トピック vs メッセージタイトル | lesson-75 | 文章で十分かも |

---

## 6. 文章のままが良い step の判定理由

「全部図解しない」という判断の根拠を以下にまとめる。

### 6.1 ケース問題 (case step) は基本図解 OFF
- `phases[].info` は状況の段階開示で、読み手の思考をテキストで誘導する設計
- そこに静的な図解を挟むと「考える前にネタバレ」になる
- 例: lesson-29 (プロフィタビリティ case), lesson-336-339 (フィードバック対応 case) は意図的に図解を入れない

### 6.2 think step (自由記述) は図解 OFF
- modelAnswer 開示までは図を出さない
- 開示後に「答え合わせ用」visual は許容範囲 (lesson-71 step.3 など)

### 6.3 哲学コース (lesson-77〜81) は文章主体
- ソクラテス問答・反証可能性・思考実験など、テキストの引用と思索プロセスそのものに価値がある
- 図解は「具体イメージが要る場面 (トロッコ問題、中国語の部屋)」だけに絞る

### 6.4 東洋思想 (lesson-350-359) は文章主体
- 孔子・老子の原文と現代解釈のリズムを断ち切らない
- 例外: 韓非子「法・術・勢」など 3 要素フレームは Triad で図解 OK

### 6.5 履歴書・SPI・面接系 (lesson-600-646) は文章主体
- 「STAR フォーマット」「逆質問の作法」など、テキスト例文を読ませる設計
- 図解化すると「文章の質感」を奪う
- 例外: 構造化面接の評価軸、SPI 公式 (速度算など) は図解 OK

### 6.6 「定義のみ」「事例のみ」の step は文章で十分
- step.0 や step.1 で用語定義だけしている場合、図解はオーバースペック
- 例: lesson-326 (コアコンピタンス) など

### 6.7 ナラティブ重視のケース解説
- 例: lesson-24 ケース 1 (新規市場参入) の解説テキストは「読み物」として完結している
- 図解を入れると逆に冗長になるケース

---

## 7. 全体設計の所見 (実装ロードマップ)

### 7.1 Phase 1: 既存資産の汎用化 (工数小・インパクト大)

1. **`LogicTreeVisual` の汎用化** — props で任意の `{ label, children }` ツリーを受け取れるよう改修
   - 影響レッスン: 5 件 (lesson-21, 29, 51, 86, 502)
2. **`AbstractionLadderVisual` の汎用化** — rungs を props で受け取れるよう
   - 影響レッスン: 2 件 (lesson-68, 63)
3. **whyWhy 系 8 visual の v3 移植** — LessonDiagrams.tsx → src/visuals/ に移植して registry 登録
   - 影響レッスン: 6 件 (lesson-340〜345)

### 7.2 Phase 2: 高汎用性 visual の新規追加 (工数中・インパクト最大)

1. **`Two2MatrixVisual`** — 6 レッスン以上で流用可。最重要
2. **`FeedbackLoopVisual`** — システムシンキングコース全体を底上げ
3. **`FermiFormulaVisual`** — フェルミ推定コース + クライアントワーク 89
4. **`MeceVennDiagram`** — MECE 系・ベン図系の基礎部品
5. **`ThreePillarsVisual`** — 6 レッスン以上で流用可
6. **`GraphPitfallsVisual`** — 数字系コース + クリティカル 42

### 7.3 Phase 3: コース単位の補強 (工数中・インパクト中)

1. システムシンキング: `IcebergModelVisual`, `SystemArchetypeVisual`, `CausalLoopDiagramVisual`
2. デザインシンキング: `EmpathyMapVisual`, `JtbdVisual`, `DesignThinkingCycleVisual`
3. ラテラル: `SixHatsVisual`, `ScamperVisual`
4. 提案: `ScrStructureVisual`, `WhereWhyHowVisual`
5. 戦略: `FiveForcesVisual`, `VrioVisual`, `LeveragePointsVisual`

### 7.4 Phase 4: 1 レッスン専用 visual (工数小・インパクト局所)

優先順位は需要に応じて: `TrolleyProblemVisual`, `ErrcGridVisual`, `FallacyGridVisual` 等

### 7.5 難易度カーブを意識した配置

- **beginner レッスン** (難易度設定がある場合) は図解密度を高めに
- **advanced レッスン** は文章中心で、図解は要所のみ
- 入門系の最初の 1〜2 step は **必ず 1 visual 入れる** ことで「絵で覚える」入口にする
- ケース問題 (think / case step) は文章で集中させ、解説 step で図解で締める

### 7.6 デザイントーン統一

- 全 visual で `src/visuals/visuals.css` の `vz-*` クラスを使う
- `VisualSlide` wrapper を必ず通す (見出し「図解で理解する」+ caption 表示)
- `var(--brand)`, `var(--accent-soft)`, `var(--text-primary)` 等の CSS 変数のみ使用 (ハードコード hex 禁止)
- 既存の MecePatternsVisual / PrepVisual と同じテンション (フランク、絵文字「💡」入りヒント) を踏襲

### 7.7 i18n 対応

- visual 内のテキスト (例: 「MECE の便利な 4 切り口」) は今は日本語ハードコード
- 将来的に i18n 化する場合は props で title/labels を受け取る設計に切り替え
- 当面は ja のみで OK、本格的に en に移行するタイミングで `t('visuals.mece.title')` 系に置換

### 7.8 工数見積もり (ざっくり)

| Phase | 内容 | 想定工数 |
|---|---|---|
| Phase 1 | 既存汎用化 + whyWhy 移植 | 1.5 日 |
| Phase 2 | 高汎用 visual 6 種新規 | 3 日 |
| Phase 3 | コース別 visual 15 種 | 5 日 |
| Phase 4 | 専用 visual (需要次第) | 任意 |

**合計**: 9〜10 日で約 75 step に新規図解を投入可能。これでロジカル・なぜなぜ・システムシンキング・フェルミ・クライアントワーク・戦略の主要 6 コースが図解充実となる。

---

## 8. 補足: visual を追加する際の手順 (実装者向け)

1. `src/visuals/MyNewVisual.tsx` を作成
2. `VisualSlide` を import せず、コンポーネント本体だけ書く (wrapper は `Lesson.tsx` 側で付与)
3. `src/visuals/index.ts` の `visualRegistry` に `MyNewVisualDiagram: MyNewVisual` を追加
4. レッスンデータの `step.visual = 'MyNewVisualDiagram'` を指定
5. 必要に応じて `src/visuals/visuals.css` に `vz-mynew-*` クラスを追加
6. Playwright テスト (`tests/e2e/lessons.spec.ts` 系) で表示確認

---

## 9. まとめ

- **既存 10 visual** + **whyWhy 系 8 visual の移植** + **新規 30 種程度** で、ほぼ全コースの図解候補をカバー可能
- **最優先は `Two2MatrixVisual` と `FeedbackLoopVisual` と `FermiFormulaVisual`** (汎用性で工数効率が圧倒的)
- **哲学・東洋思想・履歴書・SPI / 面接系は文章主体を維持** する方が UX として正解
- ケース問題 (`case` / `think` step) は基本図解 OFF、解説 step で図解 ON のリズムを守る
- 段階展開 (Phase 1 → 4) で進めれば、9〜10 日で主要 6 コースが図解充実状態になる

