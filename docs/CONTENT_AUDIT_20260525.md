# Logic コンテンツ大規模監査キャンペーン（2026-05-25）

林がオーケストレーション。Keita 不在中に各 subagent が並列監査 → 林が triage → 実装連携 → reviewer/test 検証 → PR（main merge=本番反映は Keita 帰宅後の目視確認待ち）。

push ゲート方針（ceo 助言採用）: 今日は main を触らない。全成果は作業ブランチ + PR 止まり。merge は Keita 確認後。
全フェーズ共通ルール: lesson/course ID は不変（進捗データ孤児化防止）。ja/en は必ずペアで修正。title は「〜する」Doing 形維持。UI/コンテンツ文言は中立丁寧体。

---

## Phase1: カテゴリ/グループ再編（dev-logic 実装中）

7グループ構成へ。issue-01→problem-solving / client-02,04→business / self-management 新設(focus,peak,adhd) / カテゴリ「数字に強くなる」→「数値感覚」(title不変) / 未定義3カテゴリ i18n 追加 / フェルミ pinned フラグ化 / level 昇順ソート / コメント更新。
→ 実装結果待ち。

---

## Phase2: レッスン↔コース適合（完了 / logic-coach）

総数: 7グループ・35コース・約200レッスン。論理品質 4/5。

重大度 高:
- B-1 / C-2: client-01「数字で〜読み解く」と client-02「論点を定め引き出す」が title↔中身ほぼ入れ替わり。
  - client-01 中身=論点/ヒアリング/情報読解/FB受け（数字は89の1本だけ）
  - client-02 中身=構造化/伝え方/ストーリー/報告/ピッチ（論点・傾聴ゼロ）
  - 推奨: client-01→「論点を定め、深く引き出す」(インプット系)、client-02→「分析を整理し、伝わる形にする」(アウトプット系) に組み直し。business 集約済の今が好機。
- B-2: client の伝え方/ストーリーが proposal-01・proposal-course-01・logical-writing-01 と重複。description で文脈差別化を。

重大度 中:
- B-3 / C-1: バイアス系が critical-01(69)・critical-02(71,300-303)・cognitive-02(710-714) に三重分散。69を critical-02 先頭へ移し「総覧→個別」に。MECE 宿題、コース数とのトレードオフあり Keita 方針待ち。
- B-5: client 91ヒアリング と listening-01(731-736) が重複。description で役割明示。

重大度 低:
- B-6: 23ピラミッドが logic-01/logic-02 両属（再掲意図か要確認）
- B-7: numeracy-01 lessonIds が表示順=意図的逆順、コメント1行追加推奨

新コース/分割:
- C-3: client-04（4本=最小）に 97FB受けを移し5本化（B-1 と同時に）
- C-4: 8本コース・7本コースは分割不要（テーマ一貫）

要追加調査: career-spi/tamatebako の計算解答精度、fermi-02/03 の式前提、eastern 原典解釈、en 側用語整合。

---

## Phase3: レッスン内 Visual 整合（完了 / designer）

ja 全239 explain ステップ網羅。default 表示141件を全件突合。中間データ /tmp/audit-recs.json。

重大度 最高（概念事故）:
- lesson-304「アブダクション」が DeductionDiagram（演繹三段論法・固定描画）を表示 → 意味逆転。lesson-71 系の事故。アブダクション専用 Visual 新規作成が必要。

重大度 高（visualProps 追加で解消・新規コンポ不要）:
- ThreePillarsDiagram default 流用14件（市場価値3要素/交渉3構成/ATS3原則/質問3レベル/報告3要素/対策優先/HMW/PMI/FB対応337-339/ステークホルダー/時間ブロック 等）。図が全部「ケース面接の3柱」のまま。各 lesson に visualProps(sectionLabel+pillars3+hint) 追加。※lesson-28 のみ default 正当。
- LogicTreeDiagram default 流用12件（利益構造29/論点502/課題ツリー86/9観点336/自己紹介631/定量化602/オファー比較643/二語関係615/逆算621/チャンキング701/図解703）。図が「朝起きられない」例のまま。data を visualProps で。ただし自己紹介4段・二語関係はツリー不適→別Visual or visual外す。
- PyramidDiagram: STAR法(601/634)は4要素でピラミッド構造不一致→別Visual。95/87 は visualProps で差替。

重大度 中（props差替 or 別図）:
- IcebergModel default 流用 lesson-730/910、LeveragePoints lesson-800/807、WhereWhyHow lesson-311/316、Two2Matrix lesson-804/714/353（軸ラベル不一致）。

残課題: en 版 *LessonsEn.ts は未走査。visualProps 指定済98件の細部整合は未精読。

---

## Phase4: コース内レッスン順序（完了 / logic-coach）

致命0・高0・中6・低3。中6件は同一構造の問題＝extra レッスン(3xx)を「実践＋まとめ」レッスンの後ろに後置してしまった順序逆転。修正は courseData.ts の lessons 配列並べ替えのみ・本文改訂ゼロ・ID 不変。低コスト高効果。

中（並べ替え推奨。各コース「まとめ step を持つレッスンを末尾へ」）:
- design-01: 56→57→307(HMW)→308(試す)→58(実践まとめ)
- systems-01: 65→66→313(原型で罠)→314(レバレッジ)→67(実践まとめ)  ※66→313 の基礎→応用の依存対が67で分断されてる
- lateral-01: 59→60→309(PMI)→310(ランダム入力)→61(実践まとめ)
- analogy-01: 62→63→311(構造マッピング)→312(異分野転用)→64(実践まとめ)  ※311は前提中の前提
- hypothesis-01: 50→51→70(検証設計)→304(アブダクション)→52(仮説ドリブン応用)
- problem-01: 53→54→305(ダブルループ)→306(リフレーム)→55(実践WSまとめ)

低（Phase2/別途へ申し送り）:
- logic-02: description が「So What/Why So」に言及するが該当 lesson-22 は logic-01 側。文言修正 or 構成変更（Phase2範疇）
- client-01 / client-02: 順序単体は許容だが title↔中身ズレが根（Phase2 B-1/C-2 と一体で）

運用ルール提案: 今後 extra レッスン追加時は「まとめ step を持つレッスンより前に挿す」。
変更不要と判定: logic-01/critical-01/02/issue-01/whywhy-01/strategy/proposal/case/fermi/numeracy/cognitive/peak/documentation/listening/focus/logical-writing/adhd/philosophy/career系5本 ほか多数（intro→基礎→応用→統合の勾配成立）。

---

## Phase5: レッスン単位の内容/スライド精査（4バッチ）

### 5-B problem-solving + creative（完了 / logic-coach）— 26レッスン
高: なし。論理品質高。
中: design-thinking lesson-56(en) intro の visual `DesignThinkingCycleDiagram`+outro 欠落（ja にはある）。lateral lesson-59(en) intro の visual `VerticalVsLateralDiagram`+outro 欠落。
低: problem-setting lesson-55(en) クイズが "problem" 訳でコース用語体系(Problem/Issue 区別)と不整合 → "issue" へ。
※クイズ正解フラグ ja/en 完全一致・各4択1正解を機械確認済。

### 5-A foundations（完了 / logic-coach）— 5コース×ja/en 全step精読
高: なし（致命事故ゼロ・品質高）。
即修正級（ja タイポ）:
- lesson-22「会話がスッキり」→「スッキリ」(logicLessons.ts:158)
- lesson-68「たとえば？で抜き下げる」→「掘り下げる」(logicLessons.ts:583)
中:
- lesson-69(en) Visual icon が4文字 "Conf/Anch/Sunk" でバッジ溢れ懸念 → "C/A/S" 等に短縮（ja は1文字「確/錨/沈」で正）。他 en 共有レッスンの icon も同基準点検推奨。
- lesson-69(en) intro explain の outro 欠落（ja にはある→まとめスライドが en だけ出ない）
構造論点（要 Keita 判断）:
- 5-A最大: logicLessons が ja簡易版 / en拡張版 で非対称（quiz 29 vs 44、SCR/SDS/modus ponens 等が en のみ）。同一 id で学習内容量が違う。どちらを正とするか方針決定 → content-creator に片寄せ改稿。
低: lesson-26 帰納 explanation が「測定できている」と言い過ぎ / lesson-704 「ミス率2倍」のみ出典なし / lesson-714 「プロセスバイアス」は正式バイアス名でなくタイトル誤読 / lesson-23 title が名詞止めでコース内 Doing 形と不統一（サムネ整合コストとセットで判断）。
※critical/philosophy/eastern/cognitive の ja/en パリティは良好。

### 5-C communication + self-management（完了 / content-creator）— 72レッスン全step精読
重大度 高（focus コースの Visual props 不整合＝本文と無関係の default 図が出る実害バグ。visualProps が Record<string,unknown> 型で tsc 素通り）:
- focus L239/L748 FeedbackLoopDiagram: `edges`+文字列ID → 正しくは `arrows`+数値index。default「貯金が貯金を呼ぶ」にフォールバック。正例=feedbackCaseLessons.ts L466-484
- focus L341/L437 PyramidDiagram: `layers` → 正しくは conclusion/claims/evidence。RAIN/5-4-3-2-1 はピラミッド構造と意味不一致 → 別Visual差替を designer と相談
- focus L782 LeveragePointsDiagram: `points`(3要素) → 正しくは `tiers`(4要素 label/name/desc)。default Tier1-4 にフォールバック
中:
- clientWork L94 quiz(ja/en): explanation が「社内は専門用語OK」と述べつつ専門用語を避けた選択肢を正解に → 論理矛盾。explanation 修正要
- caseLessonsEn outro 欠落×4 (28/29/35/36)、peakPerformanceLessonsEn outro 欠落×3 (125/197/290) → en でまとめスライドが出ない
- documentationLessonsEn visualProps 欠落×5 (Pyramid L50/Scr L69/Triad L174/Two2Matrix L365 等) → en で図の具体例がズレ or 日本語default
低: proposalLessonsEn L198 タイポ "Lisitng"→"Listing" / logicalWriting L650 語句重複「声に出す」/ peakPerformance L78-79 誌名 `*Sleep*` のアスタリスクが生表示 / adhd L804 quiz が5択（他は4択）
パリティ既知事実: listening/logicalWriting/focus は en 無し＝意図的 ja-fallback（英訳後フェーズ）。今回対象外、将来タスク。
※系統的リスク: visualProps が Record<string,unknown> で型チェック効かず、キー誤りが silent fallback する。Visual props の型強化 or 実機スクショ検証が再発防止策（logic-coach 成長メモ + 別フォローアップ候補）。
### 5-D business + career + fermi（完了 / content-creator）— 102レッスン精読
高（計算/設問の誤り）:
- fermi-224 医療事務員(ja): 推定22,000人 vs 実際25-30万を「10〜30%過小」と誤記。実際は約10倍ずれ。en は正しく "10-15x low"。ja を en に合わせる（最優先・修正容易）
- fermi-225 航空機需要 phase1(ja/en): 提示式(80億×0.5÷64万=6,250機)だと正解25,000機に届かない設問破綻。前提式に複数機運用を組み込むか正解を整合させる
中:
- fermi-203(男性年6回) vs fermi-216(男性年8回) で美容室来店回数がコース横断不整合 → 統一 or 幅注記
- extraLessonsEn の visual フィールド全欠落（304/307/308/309/311/313/314/316 の8件、英語ユーザーに図が出ない）→ ja と同じ visual 追加
- fermi-223 EC市場の「学習用仮値」注記が en で欠落 → en に補う
低: fermi-201(11兆)/fermi-205(12兆) コンビニ基準ゆらぎ / fermi-211 法人数端数(280万=278万+大1.2万に) / extra-304 アブダクションに演繹図(Phase3と一致) / careerSalary-646 失業給付「2-3か月」は古い(現行2か月) / catchup-335 ガント図がDay8欠け
パリティ: career系5ファイル(Resume/Spi/Tamatebako/Interview/Salary 計35)は en 無し＝ja のみ（多言語展開時は新規翻訳要）。issue/strategy/numeracy/fermi本体/pattern/catchup はパリティ良好。
※numeracy/SPI/玉手箱の純計算問題は全件検算済みで正確。fermi-02「6分解パターン」も N=6 網羅を本文確認済み。

---

## 林の triage（実装連携の指示書）

### Bucket 1 — 自律実装（客観バグ/タイポ/事実誤り。低リスク・高確度）
dev-logic 担当（同 branch）:
- タイポ: lesson-22「スッキり→スッキリ」/ lesson-68「抜き下げる→掘り下げる」/ proposalLessonsEn L198「Lisitng→Listing」/ logicalWriting L650 重複「声に出す」整理 / peakPerformance L78-79 `*Sleep*`等アスタリスク除去(ja/en)
- 計算: fermi-224(ja)「10〜30%過小」→ en に合わせ「約10倍過小」/ fermi-211 法人数 280万→278万端数整合
- 事実更新: careerSalary-646 失業給付「2-3か月」→現行「2か月」
- 数値統一: 美容室 男性来店 fermi-203/216 を統一 / コンビニ市場 fermi-201/205 を11兆 or 12兆に統一
- Visual props 実害バグ(focus): #1 FeedbackLoop `edges`→`arrows`+数値index(正例 feedbackCaseLessons L466) / #3 LeveragePoints `points`→`tiers`(4要素化)
- 順序並べ替え(Phase4 中6件): design-01/systems-01/lateral-01/analogy-01/hypothesis-01/problem-01 の lessons 配列を「まとめ末尾」に。order 変更のみ・ID 不変。※受講中ユーザーの「次レッスン」が変わる点は PR に明記
- クイズ explanation: clientWork L94(ja/en) explanation を選択肢整合に修正

content-creator 担当（dev-logic コミット後に同 branch）:
- en パリティ backfill（ja の visual/outro/visualProps を en へ複製＋英訳。ID/構造不変）:
  - lesson-69(en) outro 追加 + icon "Conf/Anch/Sunk"→"C/A/S"
  - caseLessonsEn outro×4(28/29/35/36) / peakPerformanceLessonsEn outro×3(125/197/290)
  - documentationLessonsEn visualProps×5 / extraLessonsEn visual×8(304/307/308/309/311/313/314/316)
  - designThinkingLessonsEn-56 visual+outro / lateralThinkingLessonsEn-59 visual+outro
  - problemSettingLessonsEn-55 quiz "problem"→"issue"
  - fermi-223(en) 学習用仮値の注記を ja 同等に補う
- visualProps 追加（default 流用解消・Visual は差替不要なもの）: ThreePillars14件(640/642/605/636/96/610/620/307/309/337/338/339/354/802) + Two2Matrix(804/714/353) + Pyramid(95/87) + LogicTree のツリー適合分(29/502/86/336/602/643/621/701/703) + Iceberg(730/910) + WhereWhyHow(311/316) に sectionLabel/pillars 等を各本文に合わせて付与

### Bucket 2 — 要 Keita 判断（構造/主観・PR には載せず提案として集約）
- client-01/02 組み直し（B-1/C-2）: title 変更＋レッスン再配置＋サムネ整合。インプット系/アウトプット系へ。97 を client-04 へ(C-3)
- バイアス三重分散の再編（B-3/C-1）: 69 を critical-02 先頭へ 等。コース数トレードオフ
- logicLessons ja/en 非対称（5-A 5）: en 拡張版 / ja 簡易版 のどちらを正とするか。片寄せ改稿は大仕事
- title Doing 形統一（lesson-23 等）/ lesson-714 タイトル: サムネ再生成コストとセット
- fermi-225 航空機 phase1 の設問再設計（提示式と正解の乖離）: 教育設計判断要。暫定で「複数機運用前提」を式に注記する案を併記

### Bucket 3 — デザイン案件（designer）
- アブダクション専用 Visual 新規（lesson-304、現状 DeductionDiagram 誤用）
- focus RAIN/5-4-3-2-1 の Pyramid 不適（5-C #2）→ 別 Visual
- STAR法 601/634 の Pyramid 不適 → 別 Visual
- LogicTree 不適題材（自己紹介4段631/二語関係615）→ 別 Visual or visual 外す

### Bucket 4 — 別トラック・フォローアップ（今回 PR 外）
- en 未翻訳コースの本格英訳: listening-01 / logical-writing-01 / focus-now-01 / career系5本（ja-fallback 状態）
- visualProps の型強化（Record<string,unknown> で silent fallback する系統的リスク）＝再発防止リファクタ
- 計算系の継続検算体制（fermi 式の前提監査を定例化）
- 運用ルール: extra レッスン追加時は「まとめ step を持つレッスンより前に挿す」
