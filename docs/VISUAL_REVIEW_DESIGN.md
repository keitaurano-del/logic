# Logic Visual Review — Phase 1〜3-C 横断デザインレビュー

**レビュー対象:** `src/visuals/` に 2026-05-20 までに追加された 42 件の concept visual
**評価基準:** `docs/VISUAL_DESIGN_GUIDE.md`（§0〜§8）+ `src/visuals/visuals.css`（既存基準）+ `MecePatternsVisual` / `PrepVisual`（トーン基準）
**レビュー日:** 2026-05-21
**レビュー担当:** designer（凜）

---

## 1. 総評

凜のオーケストで dev-logic 5 並列で量産された 42 件は、**全体としては「同じアプリの一部」に収まる視覚言語を共有できている**。`vz-` プレフィックス、`vz-stagger` フェードアップ、`vz-section-label`、末尾 hint/warn ブロックといった共通の足回りはほぼ全件守られており、構図プリミティブ（Stack / Pyramid / Grid / Syllogism / Cycle）からの逸脱も少ない。

ただし**「微妙にデザインルールから外れた小さなズレが全体に分散している」**のが今回の典型的な失敗パターン。具体的には:

1. **ハードコード hex の蔓延**: 新規 CSS 4 ファイル + tsx 12 ファイルで `#DB2777` `#6C8EF5` `#2E45A8` `#92400E` `#065F46` `#B91C1C` `#7C3AED` `#4C1D95` 等が **計 70 箇所以上**で生 hex 指定されている。token 経由原則違反（§8.6）。ダークモード対応が破綻する潜在リスク。
2. **「色 4 種以上」アンチパターン違反が 5 件**: WhyWhyEvidence（5 色）、WhyWhyParallel（4 色）、SixHats（6 色 + 白黒）、ArchetypeNode（brand/rose/violet/warning）、Trolley（brand/danger/warning + 線）。
3. **要素 5 個上限違反 が 3 件**: SCAMPER（7 個）、SixHats（6 個）、FallacyGrid（5 個 + 装飾 glyph）。
4. **意味と紐づかない violet 使用**: `--brand-pop` (#7C3AED) は設計ガイド §2.2 で「AI・メタ認知・再帰など特殊概念のみ」と明記されているが、WhyWhyVsLogicTree（横ツリー）/ VerticalVsLateral（水平思考）/ JTBD（モチベ）で **「ただの色違い」として消費**されている。意味カテゴリが希薄化する。
5. **構図プリミティブから外れた独自レイアウト**が 4 件: Iceberg（4 層スタックの台形）/ JTBD（3 ベン円の絶対配置）/ Empathy Map（中央バッジ付き 2×2）/ Trolley（線路図）。Iceberg / Venn / Map は §4.9 で予告されてた構図なので OK、Trolley は唯一の純イラスト寄りで他と浮く。
6. **ペアの似た visual が複数ある**: なぜなぜ系 8 件は密度が高すぎる（同コース内で図解疲れ）、Causal Loop と Feedback Loop は構造ほぼ同じで統合余地、Iceberg と Claim-Reason-Assumption は氷山メタファー重複。

総じて、**「即リリース可能なクオリティ」ではあるが、§3 のカラーシステムと §1.2 の要素上限を満たすには 7 件ほどの修正が必要**。修正コスト自体は軽い（CSS の hex → var 置換と要素削減）ので、Phase 4 着手前にここを片付けるのが推奨。

---

## 2. 同一視覚言語性チェック（グループ評価）

### 2.1 共通言語として揃っているもの

- ルート構造 (`vz-stagger` + `vz-section-label` + 主構図 + hint/warn box) は 42 件全てで遵守
- gradient ブロック（結論・主役）の hex は全件 `#6C8EF5 → #2E45A8` で統一（ただし var ではなく hex 直書きが散乱）
- フォントは Inter / Inter Tight、手書き webfont 混入なし → §8.1 OK
- アニメーションは `vz-stagger` の cubic-bezier 統一 → 動きの揃いは良好

### 2.2 グループとして見たときの分裂ポイント

| 観点 | 現状 | 影響 |
|---|---|---|
| **CSS 設計の二重管理** | Phase1 (whywhy), Phase2, Phase3-B, Phase3-C は各 tsx で `import './visuals-XX.css'`、Phase 3-A だけ `LessonStoriesScreen.tsx` で global import | tree-shake が効かず、メンテナンス時に「どこで CSS が効いているか分かりにくい」。Phase 3-A の規約を他に揃えるか、全部 global にするか決め打ち推奨 |
| **対立色の選び方** | rose `#DB2777` を pair-b、bad、relative-card、minus arrow、archetype-node.problem、jtbd-motivation など **「対立 / 反証 / 警告 / 違いの強調」全部**に使い回し | rose が意味過多。本来は「論理的対立・反証」専用色で、警告は warning に振り分けるべき |
| **violet 使用の意味希薄化** | brand-pop (#7C3AED) を「特殊・AI」専用ではなく「色をもう 1 種類欲しいから」的に投入 | カラーシステム §2.2 の規律が崩れる。Trolley・WhyWhyVsLogicTree・VerticalVsLateral で目的不明 |
| **アイコン / ベース要素のスタイル差** | Trolley は線路 + トロッコの SVG イラスト、Iceberg は CSS グラデの層、SixHats は CSS 円 (純色)、Hat だけ純黒 #1F2937 がアプリ全体で唯一の使用 | 「アプリ UI として均質」感がやや弱まる。SixHats を Triad 風のラベル + アイコン色に置き換える検討余地 |

### 2.3 浮いて見える visual トップ 3

1. **TrolleyProblemVisual** — 唯一の写実イラスト寄り構図。線路・トロッコ・棒人間の SVG。他は全部「概念ブロック + 矢印」なので、ここだけ絵本のページが入った感じになる
2. **SixHatsVisual** — 純色円（白/赤/黒/黄/緑/青）6 個の並びで、設計ガイドの「カテゴリ色 3 種まで」を **6 色 + 白 + 黒 = 8 色** で大幅突破
3. **JtbdVisual** — 円が 3 つ重なる配置自体は良いが、`mix-blend-mode: multiply` で「ぼやっと重なる」絵画的表現。他の visual は全てフラットな token カードなので、ここだけ印象が独特

---

## 3. NG / 要改修リスト

### Critical（リリース前修正推奨）

#### C-1. ハードコード hex の token 化（42 件にまたがる横断課題）

**該当箇所:**
- `visuals-phase2.css` で `#DB2777`、`#6C8EF5`、`#2E45A8` を多用
- `visuals-phase3b.css` で `#059669`、`#D97706`、`#FFFFFF`、`#DC2626`、`#1F2937`、`#F59E0B`、`#2E45A8`、`#7C3AED`、`#4C1D95`、`#065F46`、`#B91C1C` を多用
- `visuals-phase3a.css`、`visuals-phase3c.css`、`visuals-whywhy.css` でも `#DB2777` `#6C8EF5` `#2E45A8` `#5B21B6` `#92400E` `#065F46` 等
- tsx 側でも `MeceVennDiagram` (6 箇所)、`CausalLoopDiagramVisual` (3)、`DesignThinkingCycleVisual` (2)、`CorrelationCausationVisual` (2)、`MecePatternsVisual` (2)、`VerticalVsLateralVisual` (1)、`DistributionShapeVisual` (1)、`AbsoluteVsRelativeVisual` (1)、`FallacyGridVisual` (1)、`PyramidVisual` (1)、`CaseStudyVisual` (1)、`DeductionVisual` (1)

**違反:** §8.6「ハードコード色 / `#FFFFFF` / `#000000`」

**改修案:**
- `#DB2777` → `var(--rose, #DB2777)` を tokens.css に新規定義（既存ガイドで使われているのに token 化されていない）
- `#6C8EF5` / `#2E45A8` → 既存 `var(--brand)` / `var(--brand-hover)` に置換、もしくは `var(--brand-grad)` 経由
- `#7C3AED` → 既存 `var(--brand-pop)` がある、必ずそれを使う
- `#92400E` / `#065F46` / `#B91C1C` → warning/success/danger の濃色変種として `--warning-deep` `--success-deep` `--danger-deep` を tokens.css に追加して参照
- `#FFFFFF` → `var(--bg-card)` に置き換え（SixHats の白帽以外）

**理由:** ダークモード切替で破綻する。token 一括変更時に追従できない。`src/visuals/visuals.css` の既存 10 種は token 経由を遵守できているので、Phase 1〜3 だけ規律が緩んでいる状態。

---

#### C-2. WhyWhyEvidenceVisual — 1 visual に 5 カテゴリ色（§8.5 違反）

**該当:** `visuals-whywhy.css` `.vz-ww-evidence-row.t-1〜t-5` の layer 色が brand-light（青）/ brand-mid（青）/ warning（橙）/ success（緑）/ brand-pop（紫）の 5 色

**違反:**
- §1.4「1 visual 内のカテゴリ色は最大 3 種」
- §8.5「1 画面に色のカテゴリが 4 種以上」アンチパターン
- §2.3「主役色 1 + 補助色 1 + ニュートラル」原則
- さらに色と「層の意味」の対応が直感的でない（事象=青、構造=紫 という意味付けが学習者に伝わらない）

**改修案:**
- 5 層全てを `var(--brand)` 系の濃淡（brand-light → brand → brand-hover）の 3 段グラデで揃える
- 色のカテゴリ意味を出したい場合は「層の番号 (Why 1〜5)」ラベルで深さを示し、色は brand 1 系統に統一
- どうしても深さを色で出すなら brand-light（浅い）→ brand（中）→ brand-hover（深い）の 3 段までに圧縮

---

#### C-3. WhyWhyParallelVisual — 4 ブランチに 4 色（§8.5 違反）

**該当:** `visuals-whywhy.css` `.vz-ww-parallel-branch.tone-a〜d` が brand / brand-pop / warning / success

**違反:** §1.4「カテゴリ色は最大 3 種」/ §2.3 主役色ルール

**改修案:**
- 4 ブランチを全部 `var(--brand)` で統一し、番号バッジ (1, 2, 3, 4) で個別性を出す
- もしくは brand-light（淡） を 1 系統で各ブランチに使い、強調枠だけ brand
- 「各ブランチは並列・等価」という設計思想を色で表現したいなら、むしろ **全部同じ色**が正しい（差をつけると「優劣がある」誤読を生む）

---

#### C-4. SixHatsVisual — 6 色（白＋赤＋黒＋黄＋緑＋青）

**該当:** `visuals-phase3b.css` `.vz-hat-icon` の 6 色固定

**違反:**
- §1.2 要素 5 個まで（6 個ある）
- §1.4 色カテゴリ 3 種まで（6 色 + 白 + 黒 = 8 色）
- §8.3 情報過多
- §8.5 色 4 種以上

**ジレンマ:** Six Thinking Hats は概念そのものが「6 色の帽子」なので、色を統一すると概念を壊す。

**改修案 A（推奨）:** 6 色は概念固有として **例外的に認める**が、設計ガイド §2.3 に「概念固有の色定義を持つフレームワーク（Six Hats、信号機等）は例外」と明記して追加する。代わりに以下のガードを入れる:
- 色サイズを 18px → 14px に縮小（情報密度を下げる）
- 視覚的優先度を「帽子 = アイコン」ではなく「帽子 = ラベル」に振り替え、色は補助に
- hat 名前を主役・色は左サイドの細いラインだけに

**改修案 B:** 6 帽子を 3 + 3 に分割（事実系: 白・赤・青 / 評価系: 黒・黄・緑）の 2 画面構成にしてそれぞれ §1.2 を守る

→ Keita 判断要請。簡単なのは案 A の「フレームワーク固有色は例外」ルール明記。

---

#### C-5. ScamperVisual — 7 要素並列（§1.2 違反）

**該当:** SCAMPER の頭文字 7 要素 (S/C/A/M/P/E/R) をスタック表示

**違反:** §1.2「第一階層ノード最大 5 個」（7 個ある）

**ジレンマ:** SCAMPER も概念固有 7 要素なので削れない。

**改修案 A:** 7 件を 4 + 3 に折り畳む。最初は 4 件だけ表示、タップで「+3 more」展開
**改修案 B:** 横スクロール chip リスト（モバイル前提）にして縦の情報密度を下げる
**改修案 C:** §1.2 を「フレームワーク固有要素は最大 7 個まで例外」に緩和（SixHats と一緒に例外条項化）

→ こちらも Keita 判断。コンテキスト的には案 C が最も低コスト。

---

### Major（次の余裕があるイテレーションで修正）

#### M-1. CausalLoopDiagramVisual — Feedback Loop と概念重複・統合余地

**該当:** `CausalLoopDiagramVisual` と `FeedbackLoopVisual` は **同じ概念（フィードバックループ）の図解**。前者は SVG 4 ノード絶対配置、後者は円周配置で +/- 符号付き。両方ともシステム思考コースで使う想定。

**改修案:**
- 2 つを統合し、props で「ノード配置（円周 / 自由）」「+/- 表示の ON/OFF」「ループ種別 R/B」を切り替える単一 `CausalLoopVisual` にする
- 統合後は 1 コンポーネント / 1 CSS ブロックで保守性が上がる
- Phase 3-A 移植時、`CausalLoopDiagram` と `FeedbackLoopDiagram` のレッスン参照を 1 つに寄せる必要あり（dev-logic 工数 1〜2h）

→ 統合提案として §6 で詳述。

---

#### M-2. JtbdVisual — `mix-blend-mode: multiply` で色味が予測不能

**該当:** `visuals-phase3a.css` `.vz-jtbd-circle` の `mix-blend-mode: multiply`

**問題:**
- ダークモードで blend が逆転して読めなくなる可能性大（ダーク背景で multiply は黒に近づく）
- 3 円の重なり色が brand × rose × success の混色になり「真のジョブ」中央バッジとの色相関が崩れる
- 中央バッジが gradient + shadow なのに、輪郭の円が水彩風で「世界観の二重化」

**改修案:**
- `mix-blend-mode` を外し、各円の `background: rgba(...., 0.18)` のみで重なりを表現
- もしくは MeceVennDiagram と同じ「SVG での円 + 各円ストロークのみ」スタイルに統一
- 中央バッジは現状の gradient を維持

---

#### M-3. TrolleyProblemVisual — 浮いた写実イラスト構図

**該当:** トロッコ・線路・棒人間の SVG イラスト

**問題:**
- 他 41 visual は全て「概念ブロック + 矢印」の構造図解。Trolley だけ場面描写の絵
- §1.1「装飾ではなく構造の可視化」原則に微妙に抵触（線路と棒人間は装飾寄り）
- レッスン内容（功利主義 vs 義務論の対立）は「2 つの選択肢カード」だけで十分伝わる

**改修案:**
- イラスト部分を削除し、「Equivalence」プリミティブ（A ↔ B カード対比）に切り替え
  - A: 何もしない / 5 人犠牲 / 義務論
  - B: レバーを引く / 1 人犠牲 / 功利主義
  - 中央に「あなたなら？」のクエスチョンマーク
- イラストが欲しい場合はレッスンサムネ（PNG, 手書き）側でカバーする方が役割分担として正しい

---

#### M-4. EmpathyMapVisual — 中央バッジが「USER」固定文字

**該当:** `EmpathyMapVisual.tsx` `vz-empathy-center` に `USER` ハードコード

**問題:**
- i18n が効かない（英語固定）
- 「中央 = 観察対象のユーザー」の意味が「USER」だけだとやや抽象的
- 他 visual は全部日本語ベース（vz-section-label, hint, body）。ここだけ大文字英語

**改修案:**
- 中央バッジを「ユーザー」or props で渡せるようにする
- もしくは MeceVennDiagram の中央 dot 表現（小さい点）に置き換え、上のラベルだけで「ユーザー」と明示

---

#### M-5. CausalLoopDiagramVisual — `aspect-ratio: 1.1 / 1` で正方形に近い大きな visual がスクロール下に飛ぶ

**該当:** `visuals-phase3a.css` `.vz-cld` `aspect-ratio: 1.1 / 1`

**問題:**
- 320px 幅 × 290px 高（aspect 1.1:1）で 1 画面の上部を埋める
- モバイル縦長スライドで他要素（section-label + hint）と合わせると 380〜400px 高、1 スライド 1 visual で詰まる
- §1.2 「モバイル縦長スライド前提」の密度感としてはギリギリだが、矢印 SVG が小さいフォント (10px) なので可読性も微妙

**改修案:**
- aspect を 1.3 / 1 〜 1.5 / 1 に変えて横長にする
- ノード文字を 11px → 12px、矢印 strokeWidth を 1.2 → 1.6 に上げる

---

#### M-6. SystemArchetypeVisual — タブ切替の必要性

**該当:** `SystemArchetypeVisual` が `useState<ArchetypeKey>('fixes')` で 3 種類のタブ切替

**問題:** §1.5 「インタラクションは理解を深める時だけ追加」「タップしないと核が分からない設計はやらない」

- archetype は 3 種類とも「異なるシステム原型」なので、最初に開いたタブの 1 個しか見えない学習者は他 2 個を見逃す
- レッスン進行上、3 種類全部を「順に説明する」のが本来。タブで切り替える必要性が薄い

**改修案:**
- タブ式 → 縦スタック（3 archetype を全部上から並べる）に変更
- もしくは「3 ⌘ swipe」のような左右スワイプで全部見せる
- 1 archetype 当たりの情報が多いなら、レッスンステップ自体を 3 つに分割する

---

### Minor（時間あるとき直す）

#### m-1. `var(--serif)` 使用箇所が 5 つの新規 CSS で点在

**該当:**
- `FeedbackLoopVisual.tsx:165` SVG `style={{ fontFamily: 'var(--serif)' }}`
- `visuals-phase2.css` で `font-family: var(--serif)` が 5 箇所（ff-formula, ff-times, ff-equals, ff-result）

**注:** CLAUDE.md には「`var(--serif)` は定義されていない」と書かれているが、実は `tokens.css:43` で `--serif: var(--font-display)` と定義されており動く。ただし `--font-display` は `Inter Tight` であって serif ではない（命名が虚偽）。

**改修案:**
- 数字を強調したいだけなら `font-family: 'Inter Tight', Inter, sans-serif` を直接書く
- もしくは tokens.css の `--serif` 命名を `--font-display` に揃え、`--serif` エイリアスは削除（プロジェクト全体での対応事項）

---

#### m-2. `DistributionShapeVisual` の warn ボックス色がハードコード `#92400E`

**該当:** `DistributionShapeVisual.tsx:87` `color: '#92400E'`、同様に `AbsoluteVsRelativeVisual:50` `FallacyGridVisual:70` `PyramidVisual:63` `CaseStudyVisual:35` `DeductionVisual:36`

**改修案:** `#92400E` → 新規 `--warning-deep`、`#065F46` → `--success-deep` を tokens.css に追加し置換。デザインガイド付録 B のチートシートも更新する。

---

#### m-3. FermiFormulaVisual の `vz-ff-result` が画面下端で見切れやすい

**該当:** `Two2MatrixVisual` の cell items がリスト形式で、cell 1 つに 2〜3 行の本文が入ると 320px 幅で改行が崩れる

**改修案:** cell items を最大 2 個に絞り、長い文は省略表示で本文側に逃がす props 設計に変更

---

#### m-4. SCRStructureVisual / WhereWhyHowVisual / HypothesisFlowVisual — 構造が酷似

**該当:** 3 件とも「3 ステップ縦スタック + ↓ 矢印 + 最終ブロックを結論色」の同じ構図

**コメント:** 統合まではしなくていいが、CSS を共通化する余地あり。`vz-step-stack` ベースクラスを 1 つ作って、上の 3 つを継承スタイルにできる。

---

#### m-5. `MentalMathDecisionTreeVisual` の root 文字がやや煩雑

**該当:** ルート「数字を見たら、まず形を判別する」が長く、3 分岐との階層感が弱い

**改修案:**
- ルート文字を「数字の形を見る」程度に短縮
- 各分岐のタイトル `cond / tech / example` の 3 段を `tech` 主役（gradient ブロック）→ `cond` (label) + `example` (補助) の階層に整理

---

#### m-6. `LeveragePointsVisual` のピラミッド構造が見えにくい

**該当:** Tier 1〜4 が縦並びの普通の Stack で、「上に行くほど大きな変化」というピラミッド構造が視覚化されていない

**改修案:**
- 上に行くほど card width を広げる（または padding 増）
- もしくは `PyramidVisual` の 4 層版に置き換え、Tier ラベル + 名称をピラミッドセル内に

---

#### m-7. CSS import 規約が二重管理

**該当:**
- Phase 1, 2, 3-B, 3-C: 各 tsx で `import './visuals-XX.css'` を個別宣言
- Phase 3-A: `LessonStoriesScreen.tsx` で global import `import '../visuals/visuals-phase3a.css'`

**改修案:** どちらかに統一。tree-shake と保守性を考えると **個別 tsx で import するパターン**に揃えるのが推奨（global は本体起動時に常時ロードされてしまう）。

---

#### m-8. CorrelationCausationVisual のラベル「真の原因」が線上に被る

**該当:** 矢印に沿った `rotate(60 86 92)` のテキストが、回転位置によって SVG 外に飛んだり線と重なったりする可能性

**改修案:** 矢印中点に円形バッジ + 内側に小さく「真因」と置き、回転テキストは廃止

---

## 4. OK リスト（問題なし or 軽微）

以下 21 件は設計指針に概ね準拠しており、現状でリリース可能:

| Visual | 構図 | コメント |
|---|---|---|
| **WhyWhySymptomVsRootVisual** | Equivalence (bad vs good) | success/danger 2 色のみで対比、構造シンプル |
| **WhyWhyChainVisual** | Stack 5 段 | 色は brand-light → mid → hover の濃淡 3 階調、模範例 |
| **WhyWhyVsLogicTreeVisual** | Comparison (2 列) | ⚠ ただし右列の violet hroot は意味希薄、brand に統一推奨 |
| **WhyWhyToyotaVisual** | Stack 6 段 | 6 行は §1.2 上限超過だが Q&A 形式で許容範囲 |
| **WhyWhyStopRuleVisual** | Stack 3 ゾーン | bad/ok/deep の 3 色は意味が明確、warning 色の使い方適切 |
| **WhyWhyPitfallsVisual** | Stack 3 カード + bad/good 対比 | アイコン整合、対比構造良好 |
| **Two2MatrixVisual** | Grid 2×2 | 汎用性 6+ レッスンで再利用、props 設計優秀 |
| **FermiFormulaVisual** | Stack（式表現） | 4 因子 × = 結果 の数式構造が明快、再利用性高 |
| **MeceVennDiagram** | Grid 3 (bad/bad/good) | ⚠ #DB2777 ハードコード以外は構造良好 |
| **ThreePillarsVisual** | Grid 3 列 | 最もシンプル、6 レッスン以上で流用可能 |
| **GraphPitfallsVisual** | Grid 3 列 (NG ①②③) | 3 つの罠の比較として最適、各 SVG コンパクト |
| **IcebergModelVisual** | Stack 4 層（水面ライン付き） | §4.9 で予告された Iceberg、構造良好 |
| **DesignThinkingCycleVisual** | Cycle（円周配置） | §4.9 Cycle の正しい実装、中央バッジで「人間中心」 |
| **HypothesisFlowVisual** | Comparison 2 列 | bottom-up vs hypothesis、recommended で誘導 |
| **MvpTestDesignVisual** | Stack 4 ステップ | 番号バッジ + カードの定石、再利用候補 |
| **ScrStructureVisual** | Stack 3 段 + 矢印 | SCR の定石、props 化済み |
| **WhereWhyHowVisual** | Stack 3 段 | SCR と類似だが用途明確に分離されている |
| **ClaimReasonAssumptionVisual** | Iceberg variant | 主張・根拠（水面上）/ 前提（水面下）の構造が秀逸 |
| **VrioVisual** | Stack + Yes/No | フローチャート構造、Yes/No 表現適切 |
| **TriadVisual** | Triangle（3 ノード + ライン） | 3 要素関係の汎用、props で any concept に応用可 |
| **FiveForcesVisual** | Cross (上下左右 + 中央) | Porter 5F の伝統的レイアウト、5 ノード上限ジャストフィット |
| **FermiStepsVisual** | Stack 4 段 | 最終ステップ final hightlight が結論色、定石 |
| **MentalMathDecisionTreeVisual** | Tree 1 → 3 | シンプル、Phase 5+ で同形拡張可 |
| **DistributionShapeVisual** | Comparison 2 列 + SVG | 平均・中央値の位置差を SVG で示す表現が秀逸 |
| **ExponentialCurveVisual** | Chart + Points | グラフ + 数値の組み合わせ、複利の体感が伝わる |
| **AbsoluteVsRelativeVisual** | Fact + Split (2 解釈) | 同事実 → 2 つの見せ方の構造化が見事 |
| **FallacyGridVisual** | Stack 5 カード | 5 要素はギリギリだが密度許容範囲、glyph アイコン記号統一 |
| **CorrelationCausationVisual** | Causal Map (3 ノード) | 第三変数の概念が SVG で明快、ラベル位置だけ要調整 (m-8) |
| **LeveragePointsVisual** | Stack 4 Tier | Pyramid 構造に置き換えると更に良い (m-6) |

合計 **OK: 29 件 / Major 要改修: 6 件 / Critical: 5 件 / Minor: 2 件** （単純加算は重複あり）

実際の内訳:
- **Critical 5 件** (C-1 は横断、C-2 C-3 C-4 C-5 が個別)
- **Major 6 件** (M-1 〜 M-6)
- **Minor 10 件以上** (m-1 〜 m-8 + ほか CSS 整理)
- **OK 21 件** (上記表)
- **要改修だが緊急度低い** 5 件 (WhyWhyVsLogicTreeVisual の violet 等)

---

## 5. 改修優先順位

### Step 1: 即着手（リリース前 1〜2h）

1. **C-1 ハードコード hex 一括 token 化**
   - 一括 sed / awk で `#DB2777` → `var(--rose)` 等に置換、まず tokens.css に `--rose: #DB2777`, `--success-deep: #065F46`, `--warning-deep: #92400E`, `--danger-deep: #B91C1C` を追加
   - これだけで Phase 1〜3 の 70 箇所が一気に解消し、ダークモード潜在バグも消える
   - 工数 30 分

2. **C-2 WhyWhyEvidenceVisual の 5 色 → 3 色化**
   - `visuals-whywhy.css` `.vz-ww-evidence-row.t-1〜t-5` を brand 系 3 段グラデに変更
   - 工数 15 分

3. **C-3 WhyWhyParallelVisual の 4 色 → 1 色化**
   - `.vz-ww-parallel-branch.tone-a〜d` を全部 brand 単色に
   - 工数 10 分

4. **m-7 CSS import 規約統一**
   - Phase 3-A の 8 tsx に `import './visuals-phase3a.css'` を追加、`LessonStoriesScreen.tsx` の global import を削除
   - 工数 15 分

### Step 2: Phase 4 着手前（1〜2 日）

5. **C-4 SixHats / C-5 SCAMPER のフレームワーク固有色例外ルール明記**
   - DESIGN_GUIDE.md §2.3 と §1.2 に「フレームワーク固有 (Six Hats, SCAMPER, OODA, etc) は例外」項を追加
   - SixHats のサイズ縮小 (18 → 14px) と Hat ラベルの主役化
   - SCAMPER は折り畳み or 横スクロール対応
   - 工数 1〜2h

6. **M-1 CausalLoop と FeedbackLoop の統合**
   - 2 件を 1 件にマージ、props で円周/自由配置と R/B を切替
   - lessonData の参照を更新（dev-logic 工数 1h）

7. **M-2 JtbdVisual の `mix-blend-mode` 除去**
   - MeceVennDiagram と同じ SVG 円形に揃える、世界観統一
   - 工数 30 分

8. **M-3 TrolleyProblemVisual の Equivalence 構図化**
   - 線路 SVG 削除、A ↔ B カード対比に変更
   - 工数 30 分

9. **M-6 SystemArchetypeVisual のタブ → スタック化**
   - 3 archetype を縦並びに、全部一画面で見せる
   - 工数 30 分

### Step 3: 余裕がある時（中長期）

10. m-1〜m-8 の細部修正、ガイドの付録 B 更新、`--rose` 系 token の design system 取り込み

---

## 6. 追加・統合提案

### 6.1 統合候補

| 統合対象 | 統合後 | 理由 |
|---|---|---|
| **CausalLoopDiagram + FeedbackLoop** | 単一 `CausalLoopVisual`（props で R/B、ノード配置を切替） | 概念ほぼ同一、CSS / TSX を二重保守する利点なし |
| **ScrStructure + WhereWhyHow + HypothesisFlow** | 共通の `vz-step-stack` ベース CSS を作って継承 | 構造同じ（3 段 + ↓ + 結論強調）、まるごと統合は不要だが CSS 共通化で 200 行削減可能 |
| **Iceberg + ClaimReasonAssumption** | 別 visual のまま維持 | 構造は似ているが用途は別（システム思考 vs 議論分析）。統合すると意味が崩れる |

### 6.2 新規追加が欲しい構図

42 件をレビューしたが、150 レッスン展開を見据えると以下の構図がまだ不足:

1. **Funnel（漏斗）** — マーケファネル、検索→検討→購入、仮説検証段階。SCR と Stack の中間 ニーズ
2. **Timeline（時系列横帯）** — 歴史的展開、計画ガント。Stack の横倒し版
3. **Matrix Table（縦横表）** — 真理値表、フレームワーク比較。`ContrapositiveVisual` の真理値表をベースに汎用化
4. **Comparison Card (大判 2 枚)** — `HypothesisFlowVisual` の 2 列対比をもっと情報リッチに、Phase 5 の「定性 vs 定量」「演繹 vs 帰納」レッスンで需要

→ Phase 4 で dev-logic 並列実装時の優先候補。

### 6.3 削減提案

統合・廃止しても問題ない visual:

- **TrolleyProblemVisual** — Equivalence プリミティブで代替可（M-3 参照）
- **MentalMathDecisionTreeVisual** — Two2Matrix or Tree の派生で代替可（独自 CSS `vz-mmd-*` を新規追加する価値が薄い）

ただしどちらもレッスン参照済みのため、削除より「既存プリミティブで作り直し」が良い。

---

## 7. デザインガイド更新提案

レビューを通じて発見した、ガイド自体への加筆が必要な項目:

1. **§2.3 に「フレームワーク固有色は例外」項を追加**
   - Six Thinking Hats、信号機、5W1H 等の概念固有色を許容する条文
   - ただし色数は元概念に従う（恣意的に増やさない）

2. **§1.2 の要素上限に例外項追加**
   - フレームワーク固有要素（SCAMPER 7, 5W1H, OODA 4 等）は元概念の要素数を尊重
   - ただし折り畳み or 横スクロールで縦の情報密度を確保すること

3. **§2.2 カラーパレットに追加 token**
   - `--rose` (#DB2777) — 対立・反証
   - `--warning-deep` (#92400E) — 警告本文文字
   - `--success-deep` (#065F46) — 成功本文文字
   - `--danger-deep` (#B91C1C) — 危険本文文字
   - これらを tokens.css に正式定義し、ガイドにも追記

4. **§8 アンチパターンに追加**
   - 「§8.8 ❌ `mix-blend-mode` を使う」— ダークモード破綻リスク
   - 「§8.9 ❌ violet (`--brand-pop`) を「もう 1 色欲しい時」の汎用カラーとして消費する」— 意味カテゴリ厳守

5. **§9 運用フローに追加**
   - 「新規 visual PR 時、凜が `--serif` `#XXXXXX` `mix-blend-mode` `color: ('#' or 'rgb)` の grep チェックを必ず通す」

---

## 8. まとめ

42 件は **「概ね合格、ただし規律ゆるみが分散」** という状態。完全削除や根本構造変更が必要な visual は 1 件もないが、ハードコード hex の token 化と色数制限違反 4 件の修正は **Phase 4 着手前に必ず実施**したほうがいい。

修正の **Critical 部分は 1〜2 時間で全部終わる軽工数**。次のレッスン展開（150+ 規模）で「揃ったビジュアル言語」を維持するためには、ここで一度きっちり締め直すのが投資対効果が最も高い。

---

**End of Visual Review.**
