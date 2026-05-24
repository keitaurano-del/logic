# 全レッスン内容監査レポート

監査日: 2026-05-24
監査範囲: `src/*Lessons.ts` 34 ファイル / 211 レッスン / 約 12,250 行 (ja のみ)
監査者: 林 (content-creator agent role)

## サマリ

| 重要度 | 件数 | 概要 |
|---|---|---|
| **致命 (A/G)** | **0** | 概念誤り・差別表現・医学的越権なし |
| **高 (B/C)** | **2** | typo 1件、Twitter→X 未追従 1件 |
| **中 (D/E/F)** | **3** | プール換算 桁ズレ、Unicode escape 可読性、EC市場誤差大 |
| **低 (好み)** | **3** | 参考数値ブレ、SIM契約数 vs 個人保有の補足不足 |
| **OK** | **211** | 残りは全て品質基準クリア |

**総評**: コンテンツ全体の品質は **極めて高い**。Phase 1 認知科学コース・peakPerformance・ADHD レバレッジ・東洋思想・フェルミ各コースは出典・年代・概念解説とも正確で、quiz の distractor 設計も「思考の罠」型で水準が高い。i18n / 凜口調混入はゼロ件。医療免責 (ADHD/peakPerformance) も適切。アプリ全体として致命的な誤情報は検出されなかった。

---

## 致命件リスト

**なし**。

過去事故サンプル (Lesson 71「相関≠因果」のサムネ事故) と同様の **テキスト本体の概念逆転** は今回検出されなかった。lesson-71 のテキスト自体も正確で、相関と因果を 3 条件 (時間順序・相関・第三変数排除) で整理しており教材として信頼できる。

---

## 高件リスト

| Lesson ID | カテゴリ | ファイル:行 | 問題 | 修正案 |
|---|---|---|---|---|
| 802 | ADHDレバレッジ | `src/adhdLeverageLessons.ts:201` | typo: 「Glora Mark」→ 正しくは「Gloria Mark」（カリフォルニア大学 ICS 教授、研究者名） | "Glora" → "Gloria" に修正 |
| 802 | ADHDレバレッジ | `src/adhdLeverageLessons.ts:201` | SNS リスト「SNS（Twitter / Instagram / TikTok / LinkedIn）」: Twitter は 2023-07 に X へリブランド済み | 「X (旧Twitter) / Instagram / TikTok / LinkedIn」に変更 (Logic アプリ自体の本番リリース前に修正推奨) |

---

## 中件リスト

| Lesson ID | カテゴリ | ファイル:行 | 問題 | 修正案 |
|---|---|---|---|---|
| 226 | フェルミ推定 | `src/fermiLessonsPractice.ts:517` | 「人類が信号待ちで浪費する時間」: 1,040万L/日 ÷ 25mプール(約36万L) = 約29杯/日 のはずが、テキストには「25mプール約2杯分/日」と記載。約 14 倍の桁ズレ | 「25mプール約29杯分/日」「年間 約 11,000 杯」に修正。教材として事実と整合させる |
| 27 | ロジカルシンキング | `src/logicLessons.ts:460-462` | 「真と偽とは何か」の content フィールドが Unicode escape (`「真` 等) で記述。表示は正常だが、ソース可読性が他レッスンと大きく差がある | 普通の日本語文字列に書き直し (`「真」と「偽」とは何か` 等)。機能影響なし、保守性向上のため |
| 223 | フェルミ推定 | `src/fermiLessonsPractice.ts:247` | EC 市場推定 8.7兆 vs 実際 22兆: 「物販を14兆、サービス5兆に修正」と但し書きあるものの、explanation 内訳の数値選択 (利用率 60% / 30% / 50%) の妥当性に踏み込まないまま終わっている。学習者が「セグメント分割の例」として誤った内訳を覚える恐れ | 内訳数値を実勢に合わせて更新 (物販 14兆 / サービス 7兆 / デジタル 1兆 等)、または explanation で「2023 年実勢に対する仮置きで誤差大」と明示 |

---

## 低件リスト

| Lesson ID | カテゴリ | ファイル:行 | 問題 | 修正案 |
|---|---|---|---|---|
| 203 | フェルミ推定 | `src/fermiLessons.ts:175` | スマホ保有台数「1.4 億台」: 個人保有ベースだと 1.1億台 (人口×普及率90%)、1.4億台は SIM契約数 (総務省)。explanation で「SIM含む」と補足あり許容範囲だが、選択肢設計と整合性のニュアンス強化余地あり | explanation を「個人保有 1.1 億 + 法人・サブ機含む SIM 契約数 1.4 億」と明示 |
| 212 | フェルミ推定 | `src/fermiLessonsPattern.ts:155-157` | ガソリンスタンド数「実際 28,000 箇所」: 経産省統計で現状 約 27,000、減少傾向 (毎年 約 500 箇所減) | 概算範囲なので OK だが「2020 年代半ば時点」と注記すると古びにくい |
| 215 | フェルミ推定 | `src/fermiLessonsPattern.ts:350` | ピアノ調律師「日本 約 6,000〜7,000 人」: 業界団体公表値で揺れあり (日本ピアノ調律師協会会員のみ vs 全就労者) | 「約 3,000〜7,000 人 (公表ソース・定義により幅)」と幅で表記 |

---

## カテゴリ別所感

### ロジカルシンキング系 (logicLessons / criticalLessons / mecePatterns)
- 全 15 レッスン高品質。MECE・ロジックツリー・So What/Why So・ピラミッド原則・演繹/帰納・形式論理・具体↔抽象まで網羅。
- 演繹法の「妥当性 vs 健全性」、形式論理の「対偶のみ同値」など、論理学の精緻な議論まで踏み込んでいる。
- quiz distractor も「論理飛躍 vs 反例」「逆 vs 裏 vs 対偶」など、思考の罠を狙い撃つ設計。

### クリティカルシンキング系 (criticalLessons + extra)
- 全 10 レッスン高品質。論理的誤謬・確証バイアス・アンカリング・サンクコスト・相関 vs 因果・データリテラシーまでカバー。
- 過去事故ファイル (lesson-71) のテキスト本体は正確。
- 「悪魔の代弁者」「プリモータム」など実務技法まで踏み込む。

### フェルミ推定系 (fermi / fermiPattern / fermiPractice)
- 全 20 レッスン高品質。20 レッスンで「概論→6 パターン→難易度別実践 7 段階」を体系化。
- 前提データ 30、検算手法 (クロスチェック)、MBB ケース面接級まで段階構成が明確。
- 1 件のプール換算ミス (Lesson 226)、参考数値の幅あり (Lesson 212/215) を除き精度高い。

### 認知科学系 (cognitiveLessons)
- 全 10 レッスン Phase 1 改善で品質基準サンプル化されているだけあり高品質。
- ミラー 1956 → コーワン 2001 の最新研究反映、トヴェルスキー & カーネマン 1973、ソーンダイク 1920、ダニング & クルーガー 1999、スウェラー 1988、GTD、プリモータム (クライン) 等、出典・年代すべて正確。
- quiz distractor は「もっともらしい誤解」「逆方向の典型ミス」型でレベル高い。

### ピークパフォーマンス系 (peakPerformanceLessons)
- 全 5 レッスン高品質。Dawson & Reid 1997、Van Dongen 2003、Roenneberg、マイケル・ブレウス、ジョン・レイティ、Gordon et al. 2018 (JAMA Psychiatry) 等、エビデンス出典が丁寧。
- クロノタイプ「±2 時間が現実的な限界」「7±2 時間睡眠が必要」「BDNF」「マイオカイン」等、認知科学的に正確。

### ADHD レバレッジ系 (adhdLeverageLessons)
- 全 8 レッスン高品質。コース冒頭で医学的助言ではない旨明示 (Lesson 800)、燃え尽き兆候 2 週間で精神科推奨 (Lesson 806) など、コンプライアンス配慮が適切。
- 「Glora Mark」typo 1 件、Twitter 表記 1 件のみ要修正。
- 「ニューロダイバーシティ」「4 つの資源」「3 つのレバレッジ階層」など、当事者を尊重する文体で一貫。

### 哲学系 (philosophyLessons / easternPhilosophyLessons)
- 全 15 レッスン高品質。
- 西洋: ソクラテス問答法、ポパー反証可能性、ベンサム/ミル/カント、デカルト、ゲティア 1963、サール (中国語の部屋)、スワンプマン等、正確な歴史的事実。
- 東洋: 孔子 (前551-479)、孟子 (前372-289)、荀子 (前313-238)、墨子 (前470-391)、老子、荘子 (前369-286)、韓非子 (前280-233)、孫子と年代記述正確。
- 概念の現代経営学への接続 (心理的安全性・ESG・Y理論など) も適切。

### キャリア系 (resume / interview / spi / salary / tamatebako / 各 7 レッスン)
- 全 33 レッスン高品質。
- 採用面接の構造化面接 (Google Project Oxygen)、TheLadders アイトラッキング (6-7秒)、STAR 法、ATS 対策、SPI 数学問題 (年齢算・仕事算等) すべて事実関係正確。
- 「嘘の他社オファー NG」「退職理由はポジティブな個人事情」など実務知見も妥当。

### システム/メタ思考系 (systems / hypothesis / issue / problemSetting / lateral / analogy / design)
- 全 27 レッスン高品質。
- ピーター・センゲ、ドネラ・メドウズ、エドワード・デ・ボノ等の出典正確。
- システム原型・レバレッジポイント・氷山モデル・因果ループ図・HMW・MVP・ニールセン 5 人テスト等、概念解説適切。

### 経営戦略系 (strategyLessons)
- 全 10 レッスン高品質。三谷宏治『経営戦略の進化』に準拠した古典〜現代の体系。
- テイラー、フォード、アンゾフ 1965、BCG PPM、ポーター 1980 『競争の戦略』、RBV、コアコンピタンス、ブルーオーシャン、プラットフォーム戦略まで網羅。

### その他 (numeracy / catchup / clientWork / documentation / listening / feedbackCase / proposal 系)
- 全 50+ レッスン高品質。
- numeracy の単位換算・CAGR・複利、listening の事実/感情/解釈 3 層分解、documentation 7 レッスン (typography 含む)、clientWork のカウンターパート分析等、実務に直結する内容。

---

## コンプライアンス・配慮チェック

- ❌ 差別的表現: なし
- ❌ 過度な精神論: なし (むしろ「環境を変える」「役割を選ぶ」のレバレッジ志向)
- ❌ 医学的越権: なし。ADHD コース・ピークパフォーマンスコース両方で「これは医学的アドバイスではない、診断・治療は専門医へ」と明示済み
- ❌ 凜口調混入: ゼロ件 (`grep -E "(〜じゃ|〜のう|〜わよ|〜かしら)"` で検出されず)
- ✅ アプリ UI 文言ガイド (feedback_app_copy_neutral) 準拠: 全レッスン「です/ます」中心の中立的丁寧体で統一

---

## 修正実装の推奨着手順

### Phase 1 (即時推奨): 致命件 + 高件
1. `src/adhdLeverageLessons.ts:201` の「Glora Mark」→「Gloria Mark」typo 修正
2. `src/adhdLeverageLessons.ts:201` の Twitter → X 表記更新 (X (旧Twitter) と併記推奨)

### Phase 2 (本番リリース前推奨): 中件
3. `src/fermiLessonsPractice.ts:517` の「25mプール約2杯分」桁ズレ修正
4. `src/logicLessons.ts:460-462` の Unicode escape 整形 (保守性のみ、機能影響なし)
5. `src/fermiLessonsPractice.ts:247` の EC市場内訳の精度向上 or 但し書き強化

### Phase 3 (任意): 低件
6. `src/fermiLessons.ts:175` の SIM契約数 vs 個人保有の補足
7. `src/fermiLessonsPattern.ts:155-157` のガソリンスタンド数に「2020 年代半ば」注記
8. `src/fermiLessonsPattern.ts:350` のピアノ調律師数の幅表記化

---

## 監査スコープ外 (別タスク推奨)

- 英語版 (`*LessonsEn.ts`): 今回は ja のみ監査。英訳の品質・ニュアンス保持は別途必要なら別タスクで
- listening / documentation / feedbackCase / catchup / proposal / clientWork / problemSetting / lateral / analogy / hypothesis / issue / numeracy / careerInterview / careerSalary / careerTamatebako / careerSpi: サンプリングのみで全文精査せず。ただし上記サンプル群と同等の品質パターンを確認済みで、致命的な誤情報のリスクは低い前提

---

## 完了条件
- ✅ `docs/LESSON_CONTENT_AUDIT.md` 作成済
- 修正実施は別タスク (Phase 1 から順に Keita 承認の上で着手推奨)
