# VISUAL AUDIT — レッスン内容と Visual Diagram の整合性監査

調査日: 2026-05-24
調査範囲: 全 *Lessons.ts（ja 30 ファイル）の `step.visual` 紐付け
照合候補: **184 件**（en 側は同一構造のため省略、同じ修正が機械的に適用可能）
担当: content-creator

---

## 重要な構造的発見（先に共有）

このレポートで挙がる不一致の大半は、**個別レッスンのミスではなく Visual レンダリングの仕組みそのものに原因がある**。

### 仕組み
- `src/lessonSlides.ts:288-294`: `step.visual` (文字列) → `{ kind: 'visual', visualId }` slide に変換
- `src/screens/LessonStoriesScreen.tsx:790`: `renderVisual(slide.visualId)` を呼ぶ
- `src/visuals/index.ts:162-165`: `renderVisual` は `createElement(Comp)` で **props 無し** で生成

→ 結果: **全 Visual は default props の固定内容で表示される**。レッスン側は visualId 文字列しか渡せず、props で内容を差し替えられない。

### 影響の具体例
- `ThreePillarsVisual` の default は「ケース面接で問われる 3 つの思考の柱（仮説思考 / MECE / 優先度づけ）」
- L77（ソクラテスの問答法、3 ステップ）の step に `ThreePillarsDiagram` を付けても、画面には「ケース面接の 3 つの柱」がそのまま出る
- L633（志望動機 3 層）の step も同じく「ケース面接の 3 つの柱」が出る

### Visual ドキュメントとの食い違い
複数の Visual コンポーネントが先頭 JSDoc に「lesson-XX, lesson-YY, lesson-ZZ で流用」と書いており、**本来は props 切り替えで multi-lesson 共有する設計だった可能性が高い**。たとえば:

- `ThreePillarsVisual.tsx`: `lesson-28, lesson-72, lesson-89, lesson-96, lesson-315, lesson-358 など 6 レッスン以上で流用`
- `Two2MatrixVisual.tsx`: `lesson-54, lesson-86, lesson-321, lesson-322, lesson-412 ほか 6 レッスン以上で流用される基幹コンポーネント`
- `FermiFormulaVisual.tsx`: `lesson-201, lesson-202, lesson-203, lesson-89 で流用`

しかし現在の `renderVisual` は props を渡さないため、これらの「流用先」は **すべて default 内容のまま** 表示されている。

### 修正方針の選択肢（content-creator から dev-logic への提案）
1. **コード側修正**: `step.visualProps?: Record<string, unknown>` を追加し、`lessonSlides.ts` で slide に持たせ、`renderVisual(id, props)` に拡張。各レッスン側で props を埋める
2. **データ側修正**: 流用を諦め、Visual ごとに 1 レッスンだけ紐付けるルールに統一。default 内容に合わないレッスンからは `visual` フィールドを外す
3. **Visual 増設**: ThreePillars → ThreePillarsCareerPath / ThreePillarsListening / ... と派生 Visual を増やす（重複多くなる）

content-creator のおすすめは **1 番（props 化）+ 2 番（明らかに合わないものは visual 削除）の併用**。

---

## サマリ

| 重要度 | 件数 | 説明 |
|---|---|---|
| 致命 | 24 | 内容と Visual default が完全に違う。修正必須 |
| 高 | 38 | 流用前提だが default のまま。props 注入 or 削除が必要 |
| 中 | 26 | 概念は近いがズレあり |
| 低 | 16 | 微妙な好み |
| OK | 80 | 内容と default が一致 |
| **合計** | **184** |  |

致命件は **L728〜L736 のリスニングコース** と **fermiLessonsPattern.ts** に集中。

---

## 致命件（24 件、即修正候補）

レッスン内容と Visual default が完全に異なるもの。学習者に明白に「図と話が違う」と認識される水準。

### リスニング系（listeningLessons.ts）— 12 件

このコースは visual の紐付けが他の lesson の visual を借りる形になっており、内容のテーマと default 図が一切一致しない。

| Lesson | Step | 現状 Visual (default 内容) | Step 内容 | 推奨 |
|---|---|---|---|---|
| L730 | 2 | ThreePillarsDiagram (ケース面接 3 柱) | 「聴く」は受信ではなく構造化 | Visual 削除 or 新規 `StructuredListeningDiagram` |
| L730 | 4 | WhereWhyHowDiagram (Where→Why→How) | なぜマネージャー・営業に必須か | Visual 削除 |
| L731 | 0 | ThreePillarsDiagram (ケース面接 3 柱) | 相手の発言は 3 層に混ざっている（事実/感情/解釈） | 新規 `FactEmotionInterpretationDiagram` or ThreePillars props 化 |
| L731 | 2 | AbstractionLadderDiagram (具体↔抽象はしご) | 分解の手順 — メモを書き分ける | Visual 削除 |
| L731 | 4 | Two2MatrixDiagram (インパクト×実行容易性) | 対応の使い分け — 各層に何を返すか | Visual 削除（マトリクスではない） |
| L732 | 0 | PyramidDiagram (結論→主張→根拠) | 要約 = 「聴いた」の証明 | Visual 削除（ピラミッドでは無い） |
| L732 | 4 | GoodBadSlideDiagram (良/悪スライド対比) | 誤要約は信頼を失う — 3 つの落とし穴 | Visual 削除（スライド設計の話ではない） |
| L733 | 4 | GoodBadSlideDiagram (良/悪スライド対比) | やってはいけない質問 — 4 つのアンチパターン | Visual 削除 |
| L734 | 0 | FeedbackLoopDiagram (強化/バランスループ) | 沈黙は「次の質問」の場所 | Visual 削除 |
| L734 | 2 | Two2MatrixDiagram (インパクト×実行容易性) | 沈黙の 4 種類を見分ける | Visual 削除（マトリクスではない一覧） |
| L734 | 4 | AbstractionLadderDiagram (具体↔抽象はしご) | 沈黙を作る側 — 自分が話しすぎないコツ | Visual 削除 |
| L736 | 0 | ScrStructureDiagram (Situation/Complication/Resolution) | 営業ヒアリング = 顧客の意思決定構造の解読 | Visual 削除（SCR ではない） |
| L736 | 4 | WhereWhyHowDiagram (Where→Why→How) | 意思決定構造を聴き出す — BANT に踏み込む | Visual 削除（BANT は別概念） |
| L735 | 0 | WhereWhyHowDiagram (Where→Why→How) | 1on1 の目的を整理する | Visual 削除 |
| L735 | 2 | PyramidDiagram (結論→主張→根拠) | 30 分 1on1 のテンプレ — 階層を上る設計 | Visual 削除（時系列フローでありピラミッドではない） |
| L735 | 4 | GoodBadSlideDiagram (良/悪スライド対比) | よくある 1on1 の失敗ケース 3 つ | Visual 削除 |
| L736 | 2 | PyramidDiagram (結論→主張→根拠) | 本音を引き出す質問の型 — SPIN を構造化 | Visual 削除（SPIN は別構造） |

→ listeningLessons.ts は **22 件中ほぼ全件が visual ミスマッチ**。コース内容（事実/感情/解釈の 3 層、沈黙の 4 種類、SPIN/BANT、1on1 テンプレ）は専用 visual がないと表現できない。最短対応は **visual フィールド全削除**。

### Documentation 系（documentationLessons.ts）— 4 件

| Lesson | Step | 現状 | 内容 | 推奨 |
|---|---|---|---|---|
| L721 | 4 | MecePatternsDiagram (MECE 4 切り口) | 情報密度の上限を知る（文字数 200-400/Bullet 5 以下 etc） | Visual 削除 or ChartTypeGuide |
| L723 | 4 | MeceVennDiagram (MECE ベン図) | 揃える・繰り返す（整列・反復） | Visual 削除 or LayoutDiagram に変更 |
| L724 | 4 | Two2MatrixDiagram (インパクト×実行容易性) | コントラストと行間 | Visual 削除 or TypographyDiagram |
| L725 | 4 | MecePatternsDiagram (MECE 4 切り口) | カラーユニバーサルデザイン | Visual 削除 or ColorPaletteDiagram |

→ 同コース内に既に最適な visual（TypographyDiagram、ColorPaletteDiagram、LayoutDiagram、ChartTypeGuideDiagram）があるのに、なぜか別 step の MECE/Two2Matrix を使っている。**同コース内の正しい visual に張り替えるだけで解決**。

### その他致命 — 8 件

| Lesson | Step | 現状 | 内容 | 推奨 |
|---|---|---|---|---|
| L93 | 1 | MecePatternsDiagram (MECE 4 切り口) | 因果関係と並列関係を見分ける | Visual 削除（MECE ではない） |
| L97 | 3 | DesignThinkingCycleDiagram (共感→定義→…) | フィードバックを改善サイクルに落とし込む | FeedbackLoopDiagram に変更 |
| L71 | 2 | Two2MatrixDiagram (インパクト×実行容易性) | 因果推論の実践（A/Bテスト、反事実） | Visual 削除（マトリクスではない） |
| L58 | 0 | ThreePillarsDiagram (ケース面接 3 柱) | How Might We — 創造的な問いの立て方 | Visual 削除 |
| L80 | 1 | MeceVennDiagram (MECE 漏れ/ダブり) | 知識の 3 条件 — 正当化された真の信念 | TriadDiagram の方が近い |
| L412 | 1 | Two2MatrixDiagram (インパクト×実行容易性) | 運動の最適投与量（週 150 分・中強度） | Visual 削除（数値ガイドラインで 2×2 ではない） |
| L412 → L411 等の peakPerformance ほか軽微多数 | | | | |
| L501 | 2 | MecePatternsDiagram (MECE 4 切り口) | 5W1H で視点を変える | 専用「5W1H グリッド」が無いので Visual 削除 |
| L321 | 1 | Two2MatrixDiagram (インパクト×実行容易性) | アンゾフのマトリクス（製品×市場） | Two2Matrix props 化対応（軸を「製品×市場」に） |

---

## 高（38 件）

流用前提で同じ Visual を貼っているが、default 内容が違うため学習者には「他レッスンの図がそのまま出ている」状態。props 化されれば解決するもの。

### ThreePillarsDiagram の流用ミスマッチ（21 件 — L28 を除く全て）

`ThreePillarsVisual` の default は **「ケース面接で問われる 3 つの思考の柱（仮説思考 / MECE / 優先度づけ）」**。L28（ケース面接入門）以外で使うと、すべて他レッスンの図が出る。

| Lesson | Step | 本来表示したい 3 要素 |
|---|---|---|
| L77 | 1 | 問答法の構造（定義 / 反例 / 再定義） |
| L52 | 2 | Quick & Dirty 検証の 3 技術 |
| L69 | 0 | 認知バイアス導入（3 要素） |
| L83 | 3 | 課題 / 原因 / 打ち手 |
| L72 | 0 | 提案書の 3 目的（承認 / 共感 / 行動依頼） |
| L73 | 0 | 読み手の 3 軸（誰 / 関心 / 懸念） |
| L85 | 0 | 仮説の更新 3 パターン（支持 / 修正 / 棄却） |
| L96 | 0 | 報告の 3 要素 |
| L204 | 0 | フェルミの罠 3 種 |
| L411 | 4 | 入眠を整える 3 つの実践 |
| L413 | 3 | 仕事の 3 種類（深い / 反応 / 創造） |
| L600 | 2 | 採用評価軸 3 つ（Can / Will keep / Fit） |
| L633 | 0 | 志望動機の 3 層（業界 × 企業 × 職種） |
| L330 | 1 | キャッチアップ 3 層（表層 / 構造 / 力学） |
| L700 | 0 | マジカルナンバー 7±2 を 3 要素で分解 |
| L702 | 0 | 認知負荷の 3 タイプ |
| L721 | 2 | タイトル / ボディ / 一致 |
| L730 | 2 | （致命に再掲） |
| L731 | 0 | （致命に再掲） |
| L802 | 3 | 時間ブロック 3 原則 |
| L58 | 0 | （致命に再掲） |

→ **推奨対応: dev-logic に `step.visualProps` の追加を依頼**。各 step が固有の 3 要素 props を渡せるようにする。短期対応は visual フィールド削除。

### Two2MatrixDiagram の流用ミスマッチ（5 件）

default は「インパクト × 実行容易性」。

| Lesson | Step | 本来表示したいマトリクス |
|---|---|---|
| L322 | 1 | PPM（成長性 × 市場シェア） |
| L86 | 4 | 打ち手評価（実現可能性 × 効果） |
| L321 | 1 | アンゾフ（製品 × 市場） |
| L35 | 0 | 市場参入判断（魅力度 × 競争優位）— ※ 3 軸あり |
| L714 | 2 | 結果 vs プロセス（次元が違う） |

### FermiFormulaDiagram の流用ミスマッチ（6 件）

default は「ファミレス市場規模 = 人口 × 利用率 × 頻度 × 単価」。

| Lesson | Step | 本来表示したい公式 |
|---|---|---|
| L210 | 1 | 日本のピアノ台数 = 世帯数 × 保有率 × 1 世帯台数 |
| L210 | 2 | エアコン台数 = 世帯数 × 保有率 × 1 世帯台数 |
| L211 | 1 | 複合機台数 = 法人数 × 設置率 × 1 拠点台数 |
| L213 | 1 | 駅の自販機 = 駅数 × 1 駅あたり台数 |
| L213 | 2 | スーパーレジ = 店舗数 × 1 店レジ数 |
| L222 | 1 | ペットフード市場 = ペット数 × 年間支出 |

→ Pattern 系レッスン（個人/世帯/法人/ユニットベース）は FermiFormula default が「市場規模 = ファミレス」を出すので、別公式の step では明らかにズレる。

### Triad/Leverage/その他流用（6 件）

| Lesson | Step | 現状 | 内容 |
|---|---|---|---|
| L36 | 0 | TriadDiagram (default: 法・術・勢) | M&A 評価の 3 軸（戦略 / 財務 / 統合） |
| L324 | 0 | TriadDiagram (default: 法・術・勢) | 3 つの基本戦略（コスト / 差別化 / 集中） |
| L722 | 0 | TriadDiagram (default: 法・術・勢) | いつ図解すべきか（3 条件） |
| L800 | 2 | LeveragePointsDiagram (default: Meadows 4 段) | ADHD 特性 4 つの資源 |
| L807 | 4 | LeveragePointsDiagram (default: Meadows 4 段) | コースまとめ（5 ステップ処方箋） |
| L805 | 3 | EmpathyMapDiagram (default: ユーザー 4 象限) | チーム設計 — 自分の弱みを補完する人を組み込む |

---

## 中（26 件、概念は近いがズレ）

主要なテーマは合致しているが、図の具体例 / 構造が違うため没入感を欠くもの。学習に致命的影響は無いが改善の余地あり。

| Lesson | Step | 現状 | 評価 |
|---|---|---|---|
| L800 | 3 | LeveragePointsDiagram | Level 1/2/3 のレバレッジ階層 — Meadows 4 段と近いが ADHD 用語で違う |
| L804 | 3 | Two2MatrixDiagram | 4 軸の自己診断、マトリクスっぽくはある |
| L52 | 4 | LogicTreeDiagram | イシューツリーで仮説を構造化（ツリー概念は合致） |
| L51 | 4 | LogicTreeDiagram | 同上 |
| L89 | 6 | FermiFormulaDiagram | 市場規模を概算（公式は近いが具体例違う） |
| L202 | 0 | FermiFormulaDiagram | 地下鉄延長距離（距離系で市場規模公式と違う） |
| L213 | 0 | FermiPatternMatrixDiagram | ユニットベース型解説（パターン表は近い） |
| L210 | 0 | FermiPatternMatrixDiagram | 個人/世帯ベース型解説（パターン表は近い） |
| L211 | 0 | FermiPatternMatrixDiagram | 法人ベース型解説（パターン表は近い） |
| L222 | 0 | FermiFormulaDiagram | 業界規模を 5 分で出す技術 |
| L223 | 0 | FermiMacroMicroSplitDiagram | セグメント分割の概念解説 |
| L223 | 1 | FermiMacroMicroSplitDiagram | EC 市場のカテゴリ別積み上げ |
| L221 | 0,1,2 | FermiFormulaDiagram | 店舗売上系（公式は同じパターン） |
| L212 | 2 | FermiAreaApproachDiagram | 信号機数 — 面積アプローチで近い |
| L723 | 0 | LayoutDiagram | 余白の話、レイアウトと近い |
| L724 | 0 | TypographyDiagram | フォント選び — タイポグラフィ |
| L720 | 0 | WhereWhyHowDiagram | まず何を伝えるか（WWH 構造に部分一致） |
| L720 | 4 | ScrStructureDiagram | ストーリーラインを先に書く（SCR と近い） |
| L730 | 0 | IcebergModelDiagram | 「うなずく」だけでは聴いていない（氷山の比喩は使える） |
| L402 | 3 | ExponentialCurveDiagram | % 変化の連鎖（指数のニュアンス） |
| L406 | 6 | GraphPitfallsDiagram | 数字の疑いリスト |
| ほか少数 | | | |

---

## 低（16 件、好みの問題）

OK 判定との中間。学習者には特に違和感なし。

省略。詳細は `/tmp/audit.json` 参照。

---

## OK（80 件、本来通り）

主に **以下の単一レッスン専用 Visual**（流用していない場合）と、**コンセプトと内容が直接対応する step**。これらはそのままで問題なし。

例:
- L20 step.0 MeceVennDiagram（MECE 概念導入）
- L20 step.4 MecePatternsDiagram（MECE 4 切り口）
- L21 step.0 LogicTreeDiagram（ロジックツリー導入）
- L22 step.0 SoWhatDiagram（So What 導入）
- L23 step.0 PyramidDiagram（ピラミッド原則導入）
- L23 step.1 PrepDiagram（PREP 法導入）
- L24 step.0 CaseStudyDiagram（ケーススタディ）
- L25 演繹 / L26 帰納 / L27 対偶 / L28 ケース面接
- L40-42, L50, L53-57, L59-60, L65-67, L69-71, L74, L79
- L201, L205, L210-216 のフェルミ各タイプ専用 visual
- L313-314, L321-323, L325, L342-348 など Phase 3-B 専用
- L400-406 numeracy
- L501 step.0-3, L721 step.0 (GoodBadSlide), L723 step.0 (Layout), L725 step.0 (ColorPalette), L726 step.0 (ChartTypeGuide)
- L800-807 ADHD 専用 IgnitionMap / TraitEnvironmentMatrix
- whyWhy 系全 8 visual

---

## カテゴリ別の状況サマリ

| カテゴリ | ファイル | 致命 | 高 | 中 | OK |
|---|---|---|---|---|---|
| リスニング | listeningLessons.ts | 12 | 4 | 1 | 5 |
| Documentation | documentationLessons.ts | 4 | 1 | 4 | 12 |
| Fermi (Pattern) | fermiLessonsPattern.ts | 0 | 5 | 3 | 12 |
| Fermi (Practice) | fermiLessonsPractice.ts | 0 | 1 | 6 | 3 |
| Fermi (基礎) | fermiLessons.ts | 0 | 1 | 1 | 6 |
| ロジカル基礎 | logicLessons.ts | 0 | 0 | 0 | 10 |
| 提案 | proposalLessons.ts | 0 | 2 | 0 | 1 |
| 提案コース | proposalCourseLessons.ts | 0 | 2 | 1 | 3 |
| ADHD | adhdLeverageLessons.ts | 0 | 3 | 2 | 3 |
| ケース面接 | caseLessons.ts | 1 | 1 | 0 | 3 |
| Critical | criticalLessons.ts | 1 | 1 | 1 | 4 |
| ハイポセシス | hypothesisLessons.ts | 0 | 1 | 1 | 2 |
| デザイン思考 | designThinkingLessons.ts | 1 | 0 | 0 | 3 |
| 哲学 | philosophyLessons.ts | 0 | 1 | 1 | 1 |
| 戦略 | strategyLessons.ts | 0 | 2 | 0 | 3 |
| Issue | issueLessons.ts | 1 | 0 | 0 | 3 |
| Catchup | catchupLessons.ts | 0 | 1 | 0 | 0 |
| Career Interview | careerInterviewLessons.ts | 0 | 1 | 0 | 0 |
| Career Resume | careerResumeLessons.ts | 0 | 1 | 0 | 0 |
| Cognitive | cognitiveLessons.ts | 0 | 2 | 0 | 3 |
| Client Work | clientWorkLessons.ts | 2 | 1 | 1 | 4 |
| Peak Performance | peakPerformanceLessons.ts | 1 | 1 | 0 | 1 |
| Problem Setting | problemSettingLessons.ts | 0 | 0 | 0 | 2 |
| Systems Thinking | systemsThinkingLessons.ts | 0 | 0 | 0 | 4 |
| Why-Why | whyWhyLessons.ts | 0 | 0 | 0 | 8 |
| Lateral Thinking | lateralThinkingLessons.ts | 0 | 0 | 0 | 3 |
| Eastern Philosophy | easternPhilosophyLessons.ts | 0 | 0 | 0 | 1 |
| Numeracy | numeracyLessons.ts | 0 | 1 | 1 | 4 |
| Analogy Thinking | analogyThinkingLessons.ts | 0 | 0 | 0 | 1 |
| Extra | extraLessons.ts | 0 | 1 | 0 | 7 |
| Feedback Case | feedbackCaseLessons.ts | 0 | 0 | 0 | 0 |
| Career Salary/SPI/玉手箱 | careerSalary/Spi/Tamatebako | 0 | 0 | 0 | 0 |

---

## 修正アクションの優先順位

### Priority 1 — listeningLessons.ts の visual 一括見直し（致命 12 件）
これだけで致命件の半分が消える。**短期**: 22 件全部の `visual` フィールドを一旦削除。**中期**: dev-logic に専用 visual 5 種程度（FactEmotionInterpretation / SilenceTypes / SPINStructure / OneOnOneFlow / BANTGrid）を発注。

### Priority 2 — documentationLessons.ts の visual 張り替え（致命 4 件）
同コース内に最適な visual が既存。`MecePatterns/MeceVenn/Two2Matrix` → `Typography/ColorPalette/Layout/ChartTypeGuide` に張り替えるだけ。

### Priority 3 — dev-logic に `step.visualProps` 追加を依頼（高 38 件）
- `src/lessonSlides.ts:288-294` で `visualProps` を slide に渡す
- `src/visuals/index.ts:renderVisual(id, props)` を拡張
- ThreePillars / Two2Matrix / FermiFormula / Triad / LeveragePoints / EmpathyMap の流用 21+5+6+3+2+1 = 38 件が一気に正しい内容で表示できるようになる

### Priority 4 — 中件の改善（26 件）
コードコメントの「lesson-XX, lesson-YY で流用」記述に従って props 注入。インパクト小さいので Priority 3 と同時実施可。

### Priority 5 — fermi 系 visual の整理（中 10 件）
Fermi Pattern / Practice コースは専用 visual が 6 種あるが、Practice 側（L221-223 など）で `FermiFormulaDiagram` の汎用版を貼っている。Pattern 系の専用 visual が既にあるので、Practice の例題は **そのレッスンの公式に合った Visual に張り替え** が望ましい。

---

## 既存 55 種 Visual のレッスン適合状況

### 単独使用で完結している Visual（流用問題なし）— 36 種
MeceVennDiagram, ContrapositiveDiagram, JtbdDiagram, MvpTestDesignDiagram, HypothesisFlowDiagram, IcebergModelDiagram, SystemArchetypeDiagram, CausalLoopDiagram, EmpathyMapDiagram, DesignThinkingCycleDiagram, AbstractionLadderDiagram, ClaimReasonAssumptionDiagram, ScamperDiagram, SixHatsDiagram, VerticalVsLateralDiagram, FiveForcesDiagram, VrioDiagram, WhyWhy 系 8 種, Fermi 系 6 種, Documentation 5 種, ADHD 2 種, DeductionDiagram, InductionDiagram, GraphPitfallsDiagram, CorrelationCausationDiagram, DistributionShapeDiagram, ExponentialCurveDiagram, AbsoluteVsRelativeDiagram, FallacyGridDiagram, TrolleyProblemDiagram, MentalMathDecisionTreeDiagram, PrepDiagram

### 流用前提だが props 切り替えできない Visual — 7 種（最優先修正）
1. **ThreePillarsDiagram** — 22 レッスンで使用、内 21 件が default ズレ
2. **Two2MatrixDiagram** — 14 レッスンで使用、内 7 件が default ズレ
3. **FermiFormulaDiagram** — 16 レッスンで使用、内 6 件が default ズレ
4. **WhereWhyHowDiagram** — 8 レッスンで使用、内 4 件が default ズレ
5. **PyramidDiagram** — 9 レッスンで使用、内 4 件が default ズレ
6. **TriadDiagram** — 4 レッスンで使用、内 3 件が default ズレ
7. **LeveragePointsDiagram** — 4 レッスンで使用、内 3 件が default ズレ

### 新規 Visual が必要な領域 — 5 種（listening course 想定）
- `FactEmotionInterpretationDiagram` — 3 層の発言分解
- `SilenceTypesDiagram` — 沈黙の 4 種類グリッド
- `SPINStructureDiagram` — Situation/Problem/Implication/Need-payoff の 4 段
- `BANTGridDiagram` — Budget/Authority/Need/Timing の 4 マス
- `OneOnOneFlowDiagram` — 1on1 30 分テンプレの時系列フロー

---

## 補足

- 本 audit は ja 側 30 ファイルを対象。en 側は同一構造のため、ja で修正したものは en も同じ visualId を置き換える機械的修正で済む（全 62 ファイル）
- 修正実施は別タスク（content-creator は読み取り+ docs 書き出しのみ完了）
- 詳細データ: `/tmp/audit.json`（184 件の判定結果）
- 抽出スクリプト: `/tmp/extract_v2.mjs` / `/tmp/audit.mjs`

---

## props 化 TODO（2026-05-24 dev-logic）

### 完了済（このコミットで対応）

`renderVisual()` が `createElement(Comp)` で props 無し呼び出しになっていた構造的バグを根本解決：

- `src/lessonData.ts` の `ExplainStep` に `visualProps?: Record<string, unknown>` を追加
- `src/visuals/index.ts` の `renderVisual(id, props?)` を props 受け取り対応に拡張
- `src/lessonSlides.ts` の `convertLessonToSlides` で `step.visualProps` を slide に伝搬
- `src/screens/LessonStoriesScreen.tsx` の `renderVisual(slide.visualId, slide.visualProps)` 化
- **Top 5 Visual の props 受け取り対応**:
  - ThreePillarsDiagram — 既に props 対応済、JSDoc に props スキーマ明記
  - FermiFormulaDiagram — 既に props 対応済、JSDoc に props スキーマ明記
  - Two2MatrixDiagram — 既に props 対応済、JSDoc に props スキーマ明記
  - LogicTreeDiagram — 既に props 対応済、JSDoc に props スキーマ明記
  - PyramidDiagram — **新規 props 対応**（conclusion / claims / evidence / hint）

これで lesson データ側で `step.visualProps` を埋めれば multi-lesson 共有が正しく動く状態になった。

### 残作業（content-creator 担当領域）

- **致命 24 件 + 高 38 件**の lesson データ側 `visualProps` 定義（`*Lessons.ts`）
  - listening 系 12 件は `Visual 削除` か新規 Visual 増設なので props 化対象外
  - その他の流用前提 lesson は `visualProps` を埋めれば即解消

### 残作業（dev-logic 担当領域）

- 残り **50 種 Visual** の props 化（現状 default のみで multi-lesson 共有不可）
  - 優先度高: WhereWhyHowDiagram (8 lesson 中 4 件ズレ), TriadDiagram (4 中 3 件), LeveragePointsDiagram (4 中 3 件)
  - 単独使用 36 種は props 化不要（流用予定なし）
  - 各 Visual の Props 型は `src/visuals/<Name>Visual.tsx` で個別定義する設計を踏襲
- 新規 Visual 5 種（listening course 想定）
  - FactEmotionInterpretationDiagram / SilenceTypesDiagram / SPINStructureDiagram / BANTGridDiagram / OneOnOneFlowDiagram
