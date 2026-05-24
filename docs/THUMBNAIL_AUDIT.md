# Logic レッスンサムネイル監査レポート

**実施日**: 2026-05-24
**対象**: `public/images/v3/lesson-*.png` のうち `src/lessonSlides.ts` の `LESSON_IMAGES` に紐付いた 89 枚
**目的**: レッスン本体（タイトル・概要）とサムネイル（タイトル文字・図解）の不一致を全数照合
**実施方法**: 全 89 枚を `Read` ツールで視覚確認 → レッスン定義テキスト（`*Lessons.ts`）と照合 → 重要度 4 段階で分類
**変更**: なし。調査と報告のみ

---

## サマリ

| 重要度 | 件数 | 内訳 |
|---|---|---|
| **致命** | 0 | (過去事故の lesson-71 は 2026-05-19 commit `376f008` で解消済) |
| **高** | 5 | スペル致命崩し・矢印方向真逆・概念ズレが顕著 |
| **中** | 9 | スペル小崩し・図解と prompt の小不一致・象徴性弱め |
| **低** | 6 | 装飾的なズレ・好みの問題 |
| **OK** | 69 | レッスン題と図解が整合 |

**総計**: 89 枚確認

過去に Keita が見つけた致命事例（lesson-71 「相関≠因果」が `LINK = CAUSE` で生成された件）は既に修正済。今回の監査では「致命」レベルは検出されなかった。
ただし **「高」5 件**にスペルミスや矢印方向誤りなど即修正候補があり、「中」9 件もユーザー目線で違和感を生む小崩れが残っている。

---

## 高（要修正候補）

| ID | カテゴリ | レッスン題 | サムネで読める文字 | 不一致内容 | 修正方針 |
|---|---|---|---|---|---|
| 41 | クリティカル | 論理的誤謬を見破る | `LOGICAL FALLACIES` / **`atack person`** / `straw man` / `bad cause` / `good logic` | 「attack」が `atack` とスペル崩し（t 抜け）。誤謬の例として致命的にカッコ悪い | 再生成（prompt の spell に `attack person` が含まれているので強化 or 再試行） |
| 600 | キャリア履歴書 | 採用担当者の頭の中 | `6 Seconds` / **`How recuriters scan a resume.`** | subtitle で `recruiters` が `recuriters` に。文字列順入れ替え | 再生成（spell list に `recruiters` 追加 or 短縮句に） |
| 701 | 認知科学 | チャンキングで容量を増やす | `Chunking` / **`Group items into meanngful sets`** | subtitle で `meaningful` が `meanngful` に（i 抜け） | 再生成（spell list 強化） |
| 736 | 構造化リスニング | 営業ヒアリングで本音を引き出す | `Sales Listen` / funnel 内に **`P / I / N`** / `BANT` | SPIN の `S` が funnel 上部リング欠落、PIN のみ。営業フレームワーク誤伝達 | 再生成（spell に S, P, I, N を個別エントリとして強化済だが効いてない、配置説明明確化） |
| 630 | キャリア面接 | 構造化面接とは | `Interview` / clipboard 内に **`fit ad fit / fft ability / ft drive`** | clipboard 上のスペルが崩れ（fit, ability, drive のはずが冗長文字付着） | 再生成（spell list 強化、もしくは clipboard 内ラベル数を 3 個に減らす） |

---

## 中（好みで直したい）

| ID | カテゴリ | レッスン題 | 不一致内容 | 修正方針 |
|---|---|---|---|---|
| 26 | ロジカル | 帰納法 — 個別事例から法則を見つける | 矢印が `Pattern → cases` の下向き。本来「個別 → 一般」なので `cases → Pattern` 上向きが望ましい。教科書定義と逆 | 再生成（diagram で arrow direction 明示） |
| 28 | ケース面接 | ケース面接入門 | `Profit = Revenue − Cost` の下に `×` 記号 + `Price Volume + Fixed Variable`。Revenue が Price×Volume、Cost が Fixed+Variable のツリー構造のはずだが、`×` で結ばれて「(Price×Volume) × (Fixed+Variable)」のように誤読される | 再生成（diagram をはっきり2分岐ツリーに） |
| 51 | 仮説思考 | 仮説の立て方と検証 | プロンプトでは「Idea 2 を best one」だが画像は「Idea 3」を強調。レッスン本文との関係性に致命影響なし、prompt との差分 | 再生成 or 許容 |
| 52 | 仮説思考 | 仮説ドリブンの課題解決 | ループ図に `Idea / Test / Refine / Test`（Test が 2 つ）。冗長で見栄え悪い | 再生成 |
| 55 | 課題設定 | 課題設定の実践ワークショップ | 5枚カードに `data / team / cost / cost / risk`（cost 重複、data が 1 枚目になってる） | 再生成 |
| 59 | ラテラル | ラテラルシンキング入門 | 電球の上に意味不明な `gege` のような文字ゴミ | 再生成（spell に余分要素禁止追加） |
| 64 | アナロジー | アナロジー思考の実践 | 下段 flow が `X → Y ← Z` で Z への矢印が逆向き | 再生成 |
| 67 | システム | システムシンキング実践 | Iceberg 図のはずが、山型シルエットで全要素が水面上。氷山の本質（水面下に大部分）が表現できていない | 再生成（waterline 強調 + 水面下構造） |
| 622 | キャリア玉手箱 | 計数②：図表の読み取り | 矢印方向が `chart → Question?`。プロンプト指定「`question → chart`」と逆。「設問先読み」の主張表現が逆になる | 再生成 |

---

## 低（改善余地、緊急性なし）

| ID | カテゴリ | レッスン題 | 内容 | 修正方針 |
|---|---|---|---|---|
| 36 | ケース面接 | M&Aケース | `Company A + Company B = A + B` の `+` と `=` の配置がやや変、Company B が Company A の下にスタック | 許容 or 再生成 |
| 60 | ラテラル | ラテラルシンキングの技法 | プロンプトは 3 本アローだが画像は 4 本（赤・青・緑・黄）。実害なし | 許容 |
| 603 | キャリア履歴書 | 自己PRの組み立て方 | タイトル `Self-Pr`（PR 本来大文字、画像は `Pr` 小文字化） | 再生成（spell list に `Self-PR` 明示 + acronym 扱い） |
| 614 | キャリアSPI | 非言語④推論 | truth table の T/F 行の中身が崩れ（`A T T / A F T / F F T / F F T`）、A 列が値ではなくラベル A になってる | 再生成 |
| 624 | キャリア玉手箱 | 言語：論理的読解・趣旨判定 | 上部ラベル `main idea / tone / fact` が散らかった配置で `what is the author saying` が中央でかい。読み取り辛い | 再生成 |
| 713 | 認知科学 | ダニング・クルーガー効果 | `peak of fool` 表記。本来は "Peak of Mt. Stupid" or "Peak of Stupid"。やや子供っぽい言い回し | 許容 or 再生成 |

---

## OK（69 枚）

| ID 範囲 | カテゴリ | 件数 | コメント |
|---|---|---|---|
| 20, 22, 23, 24, 25, 27, 68 | ロジカル | 7 | MECE, So What/Why So, Pyramid, Case Study, Deduction, Formal Logic, Concrete & Abstract — すべて整合 |
| 21 | ロジカル | 1 | Logic Tree — Issue / Why A,B,C / leaf 構造 OK |
| 29, 35 | ケース面接 | 2 | Profitability, New Market Entry — 整合 |
| 40, 42, 43, 69, 71 | クリティカル | 5 | Critical Thinking, Reading Data, Ask Better, Bias, **Link is NOT Cause（過去事故修正済確認）** — 整合 |
| 50, 70 | 仮説思考 | 2 | Hypothesis, Test Design — 整合 |
| 53, 54 | 課題設定 | 2 | Aim True, Issue Analysis — 整合 |
| 56, 57, 58 | デザインシンキング | 3 | Design (5-stage cycle: Feel/Frame/Ideas/Make/Test), User Lens (Says/Thinks/Does/Feels), Build & Test — 整合 |
| 61, 62, 63 | ラテラル / アナロジー | 3 | Lateral Practice, Analogy, Borrow — 整合 |
| 65, 66 | システム | 2 | Systems (loop A/B/C), System Archetypes (R/B) — 整合 |
| 72-77 | 提案・哲学 | 6 | Ask for Action, Their Shoes, Storyline, Polish the Message, Pre-Empt, Socrates — 整合 |
| 200-205 | フェルミ | 6 | FERMI, Break Down, City Scale, Market Size, Fermi Traps, Base Data — 整合 |
| 700, 702-704 | 認知科学01 | 4 | Working Memory, Cognitive Load, External Memory, Task Switch — 整合 |
| 710-712, 714 | 認知科学02 | 4 | Recall Bias, Halo Effect, Knew It Bias, Result vs Process — 概ね整合 |
| 720-726 | ドキュメンテーション | 7 | Structure First, One Message, Text to Visual, White Space, Type Basics, Three Colors, Chart Choice — 整合 |
| 730-735 | 構造化リスニング | 6 | Structured Listening, Fact Feel View, Paraphrase, Open vs Closed, Silence, One on One — 整合 |
| 800-807 | ADHD レバレッジ | 8 | Reframe, Ignition Map, Desk Setup, Task Shape, Role Fit, Partner Up, Burn Proof, Role Models — すべて整合（ADHD コースは肯定的トーンも保持） |
| 601, 602, 604, 605, 606 | キャリア履歴書 | 5 | STAR Method, Use Numbers, Why Us, Pass ATS, Case Practice — 整合 |
| 610-613, 615, 616 | キャリアSPI | 6 | SPI 101, Ratios, Speed Math, Combinatorics, Verbal, Personality — 整合 |
| 620, 621, 623, 625 | キャリア玉手箱 | 4 | Tamatebako, Inverse Math, Fill the Blank, English Read — 整合 |
| 631-637 | キャリア面接 | 7 | Opening 90, Why I Left, Why You, STAR Reply, Weakness, Your Questions, Final Round — 整合 |
| 640-646 | キャリア給与 | 7 | Market Value, Offer Meeting, Ask for More, Accept or Decline, Give Notice, Counter-Offer, Handover — 整合 |

---

## 個別画像が未割当のレッスン群（参考）

`LESSON_IMAGES` に登録なし → `getHeroImage()` のカテゴリフォールバックで `course-*.png` または別の汎用画像を流用。
今回の監査範囲外だが、将来的に個別サムネ整備の検討対象になり得る:

- 論点思考コース (issue): 500-506（7 件）
- 経営戦略コース (strategy): 320-329（10 件）
- クライアントワーク: 89-97（9 件）
- フェルミ追加: 206 以降（pattern / practice 系）
- 哲学追加: 78-81（4 件）
- 東洋思想: 350-359（10 件）
- 提案書コース: 82-88（7 件）
- 数字感覚: 400-403（4 件）
- ピークパフォーマンス: 410-414（5 件）
- なぜなぜ: whyWhyLessons.ts 配下
- 補足コース: catchup 330-335 / extras 300-316 / feedbackCase 336-339

これらは個別サムネがないため「内容との不一致」検出は対象外（カテゴリ画像が汎用化されている）。

---

## 補足ルール再確認

- **画像は変更しない**（このレポートのみ）
- **修正実施は別タスク**: 上記「高」「中」を別の Gemini 再生成バッチで対応
- **ADHD（800-807）はすべて OK** で、肯定的トーン継続を確認
- 過去事故 lesson-71 は完全解消されている（マスター prompt の `NOT` 強調指示が効いている）

---

## TODO（次セッション以降）

1. **高 5 件の再生成優先**: 41, 600, 701, 730 (×SPIN→PIN), 630（スペル全般強化、acronym whitelist の見直し）
2. **中 9 件のバッチ再生成**: 26, 28, 51, 52, 55, 59, 64, 67, 622
3. **個別未割当群の個別サムネ整備**: issue / strategy / client / philosophy 追加など。優先度は ceo / Keita 判断
4. `lessonPromptsV2.ts` の改善案:
   - `attack` / `recruiters` / `meaningful` / `Self-PR` を short-circuit な短縮単語に置換するか、spell strict 化
   - SPIN は単一語 `SPIN` で扱う方が安定（個別文字に分解すると逆効果）
