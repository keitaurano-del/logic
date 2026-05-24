# Logic Visual Design Guide — レッスン内図解の全コース横断指針

**最終更新:** 2026-05-24
**担当:** designer (凜)
**対象:** `src/visuals/*.tsx` で作るレッスン内「概念図解（concept visual）」
**目的:** 150+ レッスン全体に図解を展開するためのビジュアル言語を統一する

---

## 0. このガイドの位置づけ

Logic アプリには **2 系統のビジュアル** が存在する。混同しないこと。

| 系統 | 媒体 | スタイル | 主担当ガイド |
|---|---|---|---|
| **A. 画像アセット** | コースサムネ・レッスンサムネ・ヒーロー画像（PNG/WebP） | 手書き紙ノート風（Caveat + クリーム背景 + ペン書き図解） | `HANDDRAWN_STYLE_GUIDE.md` |
| **B. レッスン内 visual** | レッスンスライドに埋め込む React コンポーネント（`src/visuals/*.tsx`） | アプリ本体トーン（Inter + Slate Blue + Card + クリーン） | **本ガイド** |

> 画像アセットは「カード一覧で目を引く・概念を象徴する」役割。
> レッスン内 visual は「学習中に概念構造を理解させる」役割。
> 役割が違うのでスタイルも分ける。レッスン内 visual に手書きペン書きは持ち込まない。

なぜか？レッスン内 visual はアプリ UI の一部であり、本体の token / カード / ボタンと並んで描画される。ここに紙ノート風を混ぜると UI が分裂する。読みやすさ・タップ性・i18n・darkmode 切替の観点でも、本体トーン継承が安全。

---

## 1. コア原則（5 つ）

### 1.1 「構造を見せる」ためだけに使う
visual は装飾ではなく **概念の構造**（要素・関係・順序・対立・階層）を可視化する道具。
- 装飾目的（華やかさ、文字を埋める、間を持たせる）では使わない
- そのレッスンの中心概念が「構造」を持たないなら visual は不要、本文と例だけで十分

### 1.2 一画面に要素 5 個まで
モバイル縦長スライド（320–400px 幅）で読まれる前提。情報密度の上限：
- 第一階層ノード：**最大 5 個**（ピラミッド頂点、ツリーの主分岐、フェーズ数など）
- 全要素合計：**最大 12 個**（葉ノード・データ点含む）
- 1 ノード内の文字：**最大 12 字（日本語）/ 18 字（英字）**
- これを超えるなら 2 枚に分割するか、stagger アニメで段階開示する

**例外条項：フレームワーク固有要素は元概念の数を尊重する**
- 概念そのものが固定要素数を持つフレームワーク（Six Thinking Hats: 6 要素、SCAMPER: 7 要素、5W1H: 6 要素、OODA Loop: 4 要素 等）は元概念の要素数を維持してよい
- ただし「フラグメント分割」「折り畳み（4 + 3 等）」「横スクロール chip リスト」「視覚的優先度の調整（メイン要素を主役・その他をラベル）」のいずれかで縦の情報密度を下げる工夫を必須とする
- 恣意的に「ちょっと多い方が映えるから」と要素を増やすのは NG。元概念に根拠があるかが判断基準

### 1.3 矢印は必ず意味を持つ
線・矢印は「装飾の繋ぎ」ではなく「関係性の宣言」。タイプは 4 つに限定：
- **下向き矢印 ↓** = 演繹・展開・So What?
- **上向き矢印 ↑** = 帰納・抽象化・Why So?
- **横矢印 →** = 時系列・フロー
- **双方向 ⇔ / ↔** = 等価・対偶・対立

その他の曲線・斜め線・装飾アローは使わない（意味が読めなくなる）。

### 1.4 色は意味カテゴリで使い分ける
カラーは「綺麗だから」ではなく「**この色は前提**」「**この色は結論**」と意味と紐付ける（§2 参照）。1 visual 内のカテゴリ色は最大 3 種。

### 1.5 インタラクションは「理解を深める時だけ」追加する
タップで段階展開・スライダーで切替などは強力だが、**「タップしないと核が分からない」設計はやらない**。第一表示で概念の 80% が伝わるのが前提。
- 段階展開してよい例：抽象ラダー（具体↔抽象の動きそのものが学び）、ツリー深掘り（深さの体感が学び）
- 過剰な例：単純な PREP 法を 4 段階タップで開示（最初から全部見せた方が早い）

---

## 2. カラーシステム

### 2.1 ベースは本体 tokens を使う（ハードコード禁止）

`src/styles/tokens.css` のトークンを参照する。`visuals.css` の `.vz-*` クラスは既にそうなっている。新規 visual も同じ規約を守ること。

```css
/* surfaces */
var(--bg-card)        /* #FFFFFF — ノード fill のデフォルト */
var(--bg-secondary)   /* #F0F2F8 — サブノード / 下層 */
var(--bg-tertiary)    /* #E5E8F2 — 抑えた背景 */

/* text */
var(--text-primary)   /* #0D1220 — 主要文字 */
var(--text-secondary) /* #4A5068 — 説明文 */
var(--text-muted)     /* #6B7280 — ラベル */

/* borders */
var(--border)         /* #E2E5F0 — 通常 */
var(--border-light)   /* #EEF0F8 — 薄め */

/* brand */
var(--brand)          /* #6C8EF5 — Slate Blue */
var(--brand-soft)     /* #EEF2FE — chip 背景 */
var(--brand-hover)    /* #2E45A8 — gradient end */
```

### 2.2 意味カテゴリ別カラーパレット

概念の役割で色を振る。以下は固定ルールとして全 visual で揃える。

| 役割 | 色 | tokens / hex | 使用シーン |
|---|---|---|---|
| **結論 / メッセージ / 主役** | Slate Blue gradient | `var(--brand-cta-grad)` (= `linear-gradient(135deg, #6C8EF5 0%, #2E45A8 100%)`) + 白文字 + `var(--brand-cta-shadow)` | ピラミッド頂点・三段論法の結論・So What? の結論ブロック |
| **前提 / 中間ノード** | white card + brand border | `var(--bg-card)` + `border: 1.5px solid var(--brand)` | 大前提・小前提・ロジックツリーの葉 |
| **データ / 根拠 / 観察** | secondary card | `var(--bg-secondary)` + `border: 1px solid var(--border)` | 帰納サンプル・ピラミッド底面・補足データ |
| **対立 / 反証** | warm rose | `var(--rose)` (`#DB2777`) / `var(--rose-soft)` (背景) | MECE 対立ペア、二項対立、論理的逆 |
| **正 / 成立 / Tr** | success | `var(--success)` `#059669` / 本文文字は `var(--success-deep)` (`#065F46`) | 真理値 T、肯定、検証通過 |
| **誤 / 不成立 / Fa** | danger | `var(--danger)` `#DC2626` / 本文文字は `var(--danger-deep)` (`#B91C1C`) | 真理値 F、否定、反例 |
| **注意 / 限界** | warning | `var(--warning)` `#D97706` + `var(--warning-soft)` 背景 / 本文文字は `var(--warning-deep)` (`#92400E`) | 帰納の限界 warn、認知バイアス警告 |
| **特殊 (AI 思考・特異点)** | violet pop | `var(--brand-pop)` `#7C3AED` / 強調 gradient は `var(--brand-grad-pop)` | AI、メタ認知、再帰など特殊概念のみ |

**追加トークン（2026-05-21 拡張、`src/styles/tokens.css` 定義済み）:**
- `--rose: #DB2777` / `--rose-soft` / `--rose-deep: #9D174D` — 対立・反証専用色（warning と意味分離）
- `--warning-deep: #92400E`（alias: `--warning-dark`） — warning-soft 背景上の本文文字色（WCAG AA 担保）
- `--success-deep: #065F46` — success-soft 背景上の本文文字色
- `--danger-deep: #B91C1C` — danger 背景上の本文文字色
- `--brand-cta-grad: linear-gradient(135deg, #6C8EF5 0%, #2E45A8 100%)` — concept visual の結論ブロック用 gradient（既存 `--brand-grad` は別用途で #6C8EF5→#9BB3FA を維持しているため別名で導入）
- `--brand-cta-shadow: 0 6px 20px rgba(108, 142, 245, 0.30)` — 上記 gradient の組合せ shadow
- `--brand-grad-pop: linear-gradient(135deg, #7C3AED 0%, #4C1D95 100%)` — 特殊概念（AI / 横方向思考）の強調 gradient

**色を直接使うときは必ず token 名で参照。hex 直書きは禁止（§8.6）。**

### 2.3 運用ルール
- 1 visual 内：**主役色 1 + 補助色 1 + ニュートラル（白/グレー）** の 3 系統まで
- 鮮やかな色（rose, violet, orange）は **アクセント 1 箇所のみ**
- 純黒 `#000` / 純白 `#FFF` は使わない。必ず token 経由
- ダークモード対応：トークンが自動で切り替わるので、`var(--bg-card)` 等を使えば追加対応不要。`#FFFFFF` ハードコードはダークで破綻する

**例外条項：フレームワーク固有色は元概念に従う**
- 概念そのものが固有色定義を持つフレームワーク（Six Thinking Hats の 6 色帽、信号機の 3 色、5 色マーケミックス、7 色虹 等）は元概念の色を尊重してよい
- ただし「色のサイズを縮小（18 → 14px 等）」「色をアイコンではなくラベル先頭の細いラインに格下げ」など、視覚的優先度を「色」から「ラベル/形」に振り替える工夫を必須とする
- 「もう 1 色欲しい時の汎用カラー」として `--brand-pop` (violet) を消費するのは禁止（§8.9）

### 2.4 Warm accent（2026-05-24 追加）— AI ぽさ軽減用の温度感色

既存の Slate Blue ベース（cool blue 単色支配）は教科書的で正確だが、モバイル実機で「AI が量産した感じがする」「冷たく感じる」フィードバックが出た。
これを軽減するため、**全 visual ベースは Slate Blue を維持しつつ、矢印・強調アイコンなど 1 箇所のみ warm accent を差す**運用を追加する。

| 役割 | token | hex | 使用シーン |
|---|---|---|---|
| Terracotta（土系・暖色アクセント） | `var(--visual-warm-primary)` | `#C4753A` | 「動きを示す矢印」「最重要 step の枠線」「強調アイコン」など 1 visual 内 1 箇所のみ |
| Terracotta soft | `var(--visual-warm-primary-soft)` | rgba(196,117,58,0.10) | 上記アクセント要素の背景 |
| Terracotta deep | `var(--visual-warm-primary-deep)` | `#8C4F22` | soft 背景上の本文文字色（WCAG AA 確保） |
| Mustard（黄土系・補助暖色） | `var(--visual-warm-secondary)` | `#D4A82F` | terracotta より弱い 2 段目アクセント。通常は使わず、terracotta が他構造で塞がっているときの代替 |
| Mustard soft / deep | 同上 | rgba / `#8C6E14` | 同上 |

**使用ルール（厳守）:**
- **1 visual あたり warm accent は 1 箇所のみ**。複数差すと「ベースが何色なのか」が読めなくなり、AI ぽさ軽減の目的を逸れる
- **基本ベースは Slate Blue のまま**。warm を主役色に格上げしない（ベース色変更は別議論）
- **意味づけ**：「動き・最重要・触発」のいずれかを示す箇所に使う。装飾目的では使わない（§8.10）
- **手書きフォント / クリーム背景 / コーラル下線は併用しない**。それらはサムネ画像アセット側のスタイルであり、本ガイド §0 でレッスン内 visual には持ち込まないと定めている
- ダークモードでは terracotta が背景と馴染みすぎる場合があるため、soft / deep バリアントを併用し、コントラストを最低 4.5:1 確保すること

---

## 3. タイポグラフィ

レッスン内 visual はアプリ UI と同じフォントスタック（Inter / Inter Tight / Noto Sans JP）を使う。**手書き系 webfont は使わない**。

### 3.1 サイズ階層（A 案 2026-05-24 底上げ）

モバイル実機で「文字が小さくて読み疲れする」フィードバックを受け、全段階を 2–3px 引き上げ。
旧基準は 2026-05-20 まで採用、新基準は本 §3.1 が最新。

| 役割 | size | weight | 用途 |
|---|---|---|---|
| ノード主文字 | **16px** | 700 | ロジックツリーのルート、結論ブロック、主役ノード |
| ノード本文 | **14px** | 600 | 中間ノード、フェーズタイトル、説明文 |
| 補助文字 | **13px** | 600 | フェーズ body、データ、補足 |
| ラベル (UPPERCASE) | **12px** | 700 | 「結論」「前提」「PHASE 1」 + `letter-spacing: 0.06–0.08em` |
| section ラベル | **12px** | 700 | visual 全体の見出し（`vz-section-label`） |

**旧基準（互換参考、2026-05-20 まで）:** 13 / 12 / 11 / 9–10 / 10。新規実装は新基準を使い、既存 visual は §11 の段階適用手順で順次更新する。

**11px 以下は使わない**：モバイル小型端末（iPhone SE）で可読性が落ちる。脚注的な極小は 12px を下限とする。

### 3.2 文字数の上限
- ノード内 1 行：日本語 12 字 / 英字 18 字
- ノード内最大 2 行
- visual 全体の総文字数：300 字以内（モバイル 1 画面で読み切れる量）

### 3.3 強調規則
- 太字（700）は主役ノードと結論のみ
- 斜体は使わない
- アンダーラインは使わない（リンクと誤認）
- 「→」「↓」「⇔」「∴」「¬」などの論理記号は OK（むしろ積極的に使う）
- 絵文字：**💡（hint）と ⚠（warn）のみ許可**、それ以外は不可

---

## 4. 構図プリミティブ（既存 10 種から抽出した再利用可能パターン）

新規 visual を作るときは、まずこの 8 種から構図を選ぶ。0 から構図を考えない。

### 4.1 Tree（ツリー）— 階層分岐
- ルート 1 → 子 2–3 → 孫 2 まで
- 既存: `LogicTreeVisual`
- 使いどころ：原因分解、Why ツリー、組織構造、選択肢ツリー、So Why ?
- バリエーション：横倒し（左→右、原因→結果のフロー的階層）

### 4.2 Pyramid（ピラミッド）— 結論集約
- 3 層固定：頂点 1 / 中間 3 / 底面 6
- 既存: `PyramidVisual`
- 使いどころ：ピラミッド原則、結論→主張→根拠、抽象→具体の集約構造
- 注意：4 層以上は情報過多

### 4.3 Stack（スタック）— 順序フロー
- 縦に積む。各ブロックに番号 / ラベル / タイトル / body
- 既存: `CaseStudyVisual`（フェーズパネル）、`PrepVisual`
- 使いどころ：プロセス（PREP, OODA, AIDA, ケース 4 フェーズ）、手順、チェックリスト
- 仕切り：左 4px ボーダー（`vz-phase` パターン）で各段の独立性を示す

### 4.4 Syllogism（縦並び 3 段 + 結論）— 演繹的論証
- 前提 → 前提 → 結論。各段の間に矢印
- 既存: `DeductionVisual`, `SoWhatVisual`
- 使いどころ：三段論法、論理的導出、So What?/Why So?、論証の連鎖
- 結論は gradient + white で他段と差別化

### 4.5 Samples → Generalization（観察 → 法則）— 帰納型
- 下に複数サンプル、上に統合結論。`flexDirection: column-reverse` で実装可能
- 既存: `InductionVisual`
- 使いどころ：帰納法、データ→洞察、事例→パターン
- 必ず限界ラベル（warn）をセットで添える

### 4.6 Equivalence（等価対比）— 2 ブロック横並び + ⇔
- `vz-contra-flow`（1fr / auto / 1fr）パターン
- 既存: `ContrapositiveVisual`
- 使いどころ：対偶、論理的等価、対立、Before/After、Old vs New
- 等価側に薄い緑背景で「真」を示す

### 4.7 Grid 2×2 / 3-Circle（マトリクス・ベン図）— 切り口の網羅
- 4 セル + 各セル内にミニ図解
- 既存: `MecePatternsVisual`
- 使いどころ：MECE 4 切り口、2 軸マトリクス（重要度×緊急度等）、3C, 4P, SWOT
- 各セルは 1 ノードに「ミニツリー」「ペア」「3 円」など別構図を埋め込んで OK

### 4.8 Ladder / Meter（階段・メーター）— 連続量の階層
- 左にメーター（縦バー + pin）、右に rung リスト
- 既存: `AbstractionLadderVisual`
- 使いどころ：抽象度、難易度、習熟度、温度感、優先度スケール
- ピンの位置を state で動かせるとインタラクション付きで強い

### 4.9 構図カタログ（今後追加予定）
以下は 150 レッスン横展開時に使いそうな構図。実装は需要に応じて。

| 構図 | 用途 | 典型レッスン |
|---|---|---|
| **Cycle（循環矢印）** | フィードバックループ、PDCA、システム思考 | システム思考、組織学習 |
| **Funnel（漏斗）** | 段階絞り込み、検索→検討→購入 | マーケファネル、仮説検証 |
| **Quadrant（4 象限）** | 2 軸マトリクス | 重要度×緊急度、Eisenhower、Boston Matrix |
| **Venn（ベン図）** | 集合の重なり | 3C、共通点抽出 |
| **Timeline（時系列横帯）** | 時間軸の進行 | 歴史的展開、計画 |
| **Causal Map（因果連鎖）** | 矢印で原因→結果を連ねる | 因果推論、構造的問題分析 |
| **Comparison Card（対比カード 2 枚）** | A vs B 詳細対比 | 演繹 vs 帰納、定性 vs 定量 |
| **Iceberg（氷山）** | 表層 / 深層構造 | システム思考、メンタルモデル |
| **Hierarchy List（階層リスト）** | ネスト構造（インデント表現） | 分類、組織、taxonomy |
| **Matrix Table（縦横表）** | クロス分析 | フレームワーク比較、真理値表 |

---

## 5. カテゴリ別トーンガイド

各レッスンカテゴリで「どの構図が合うか」「どこまでインタラクションを入れるか」を示す。dev-logic が抽出する候補と照合して使う。

### 5.1 ロジカルシンキング（基礎構造化）
- **主な構図**：Tree, Pyramid, Stack, Grid 2×2, Syllogism
- **トーン**：構造そのものが主役。ノードと矢印で骨格を見せる
- **色**：brand 主体、対立で rose、結論で gradient
- **密度**：中（要素 6–10）
- **インタラクション**：基本静的。深掘りツリーのみタップ可

### 5.2 ケース面接 / コンサル思考
- **主な構図**：Stack（フェーズ）, Tree（イシュー分解）, Quadrant
- **トーン**：プロフェッショナル、手順感、抜け漏れない網羅性
- **色**：brand + secondary、warning でリスク表示
- **密度**：高（要素 10–12）。ただし stagger で段階表示
- **インタラクション**：フェーズタップで詳細展開は OK

### 5.3 クリティカルシンキング（思考の罠・バイアス）
- **主な構図**：Equivalence（命題対比）, Comparison Card, Causal Map
- **トーン**：注意喚起、間違いを示す対比、検証感
- **色**：success（正） / danger（誤） / warning（注意）を併用
- **密度**：低〜中（罠 1 つ＋反例 1 つで完結）
- **インタラクション**：トグルで「誤った推論 ↔ 正しい推論」切替が効く

### 5.4 仮説思考 / 検証思考
- **主な構図**：Samples→Generalization, Cycle, Funnel, Stack
- **トーン**：探究感、反復、検証を回す動き
- **色**：brand（仮説） + success（検証 OK） + warning（限界）
- **密度**：中
- **インタラクション**：仮説 → 検証 → 結果 の流れを段階タップ展開

### 5.5 フェルミ推定 / 数値思考
- **主な構図**：Tree（要素分解 ×）, Stack（手順）, Matrix Table（積算表）
- **トーン**：分解＝掛け算の可視化。数字とアイコンを並べる
- **色**：brand 中心、× 記号は強調色
- **密度**：高（数字 + 単位 + 推定根拠）
- **インタラクション**：分解段階を順次開示すると数字の妥当性が伝わる

### 5.6 構造化思考 / 整理術
- **主な構図**：Tree, Pyramid, Grid 2×2, Hierarchy List
- **トーン**：MECE、網羅、漏れなく重複なく
- **色**：brand 単色＋カテゴリ色を 1 軸だけ
- **密度**：中〜高
- **インタラクション**：基本静的、Grid セルのホバー説明程度

### 5.7 数学 / 論理 / 形式論理
- **主な構図**：Syllogism, Equivalence, Matrix Table（真理値表）, Causal Map
- **トーン**：厳密、記号的。`∴` `¬` `⇔` `→` を使う
- **色**：success / danger を真理値で使う、brand は前提・結論ハイライト
- **密度**：低（記号化されてるので少なくて伝わる）
- **インタラクション**：真理値表は静的で十分

### 5.8 デザイン思考 / 共感 / ラテラル
- **主な構図**：Cycle, Iceberg, Comparison Card, Venn
- **トーン**：人間中心、探究、横方向の発想
- **色**：brand-pop violet（#7C3AED）を controlled に入れて「特殊・創造」感
- **密度**：低〜中
- **インタラクション**：トグルで「ユーザー視点 / 自社視点」切替

### 5.9 提案 / コミュニケーション / プレゼン
- **主な構図**：Pyramid, Stack（PREP/SDS）, Syllogism
- **トーン**：相手に伝える、整理されたメッセージ
- **色**：brand 主体、結論を gradient + shadow で目立たせる
- **密度**：低（言葉が主役、図解は補助）
- **インタラクション**：基本静的

### 5.10 哲学 / 東洋思想 / 古典
- **主な構図**：Equivalence, Comparison Card, Cycle, Iceberg
- **トーン**：抑えた色、余白多め、深い概念をシンプルに
- **色**：brand-dark `#1E2D5C` 主体、補助色は最小限
- **密度**：最低（概念 1 つを大きく見せる）
- **インタラクション**：なし

---

## 6. 新規 visual を作る時のテンプレート

### 6.1 ファイル配置と命名

```
src/visuals/
  XxxVisual.tsx        # PascalCase + "Visual" suffix 必須
  index.ts             # visualRegistry に登録（必須）
  visuals.css          # 共通 CSS、追加クラスは末尾に追記
```

### 6.2 コンポーネント雛形

```tsx
/**
 * <概念名> — <1 行説明>
 * lesson-XX step.visual='XxxDiagram'
 */
export function XxxVisual() {
  return (
    <div className="vz-stagger">
      <div className="vz-section-label" style={{ marginBottom: 10 }}>
        <セクションタイトル>
      </div>

      {/* 主構図 — §4 のプリミティブから選ぶ */}
      <div className="vz-<pattern>">
        {/* ... */}
      </div>

      {/* 最後に hint or warn 1 行 */}
      <div style={{
        marginTop: 12,
        padding: '8px 10px',
        background: 'var(--brand-soft)',
        borderRadius: 8,
        fontSize: 11,
        fontWeight: 600,
        color: 'var(--brand)',
        textAlign: 'center',
      }}>
        💡 <key insight 1 行>
      </div>
    </div>
  )
}
```

### 6.3 必須要素

- **`vz-stagger`** クラスで子要素の入場アニメ
- **`vz-section-label`** で visual の見出し
- **hint or warn ブロック** を末尾に置く（学習者が「で、結局何？」を取りこぼさないため）
- **ハードコード色禁止** — 全部 `var(--...)` 経由
- **インライン style は OK** だが、再利用される構造は `visuals.css` に追加してクラス化

### 6.4 props 構造（再利用 visual 向け）

将来「同じ構図で違うデータ」を出したい時のため、データを props で受け取れる設計を推奨。

```tsx
type StackItem = {
  label: string       // 'PHASE 1'
  title: string       // '情報を集める'
  body: string        // 説明文
}

type Props = {
  sectionLabel: string
  items: StackItem[]
  hint?: string
}

export function StackVisual({ sectionLabel, items, hint }: Props) {
  /* ... */
}
```

ただし **最初の 1 個目は props なしの直書きで作って OK**。2 回目以降に同じ構図が出たら props 化して共通化する（YAGNI）。

### 6.5 アクセシビリティ

- **コントラスト比 4.5:1 以上**：text-primary on bg-card は OK、薄い色 on 薄い背景は注意
- **タップ領域 44×44px 以上**：インタラクティブ要素（rung, button）は最低この大きさ
- **キーボード操作**：button 要素を使う（div + onClick はダメ）。`AbstractionLadderVisual` の rung が正しい実装例
- **`aria-label` / `aria-pressed`**：トグル系は必ず付ける
- **disabled 状態**：opacity 0.4 + cursor not-allowed
- **アニメーション**：`prefers-reduced-motion` メディアクエリは未対応。今後対応するなら `vz-stagger` を上書きする CSS を visuals.css に追加

### 6.6 i18n

visual 内の文字列は **基本ハードコード OK**（教材コンテンツとして lessonData 側で多言語化される前提）。
ただし将来 i18n する場合は props 化しておけば差し替え容易。

### 6.7 登録手順（必須）

```ts
// src/visuals/index.ts
import { XxxVisual } from './XxxVisual'

export const visualRegistry: Record<string, ComponentType> = {
  // ...
  XxxDiagram: XxxVisual,  // 末尾に追加
}
```

lessonData 側の `step.visual = 'XxxDiagram'` でこの文字列が解決される。

---

## 7. 既存 10 visual の評価

| Visual | 構図 | 強み | 弱み | 改修余地 |
|---|---|---|---|---|
| **MecePatternsVisual** | Grid 2×2 | 4 切り口を一望できる密度感が秀逸。各セル内に別構図（ミニツリー・ペア・3 円）を埋め込んで Information rich | 文字情報多めでモバイルでギリギリ。3C 円が小さくラベル読みづらい | 3C をやや拡大、ミニ図解の文字サイズ +1px |
| **LogicTreeVisual** | Tree + Stage Control | 深さを段階展開する設計が学びと合致。タップで Why が深まる体感 | サンプル例（「朝起きられない」）が個人寄り、ビジネス例も並べたい | depth 4 まで対応 / props 化して別データで使い回し |
| **SoWhatVisual** | Syllogism（上下双方向） | ↑So What? / ↓Why So? の双方向矢印が概念をズバリ表現 | 結論ブロックが上、根拠が下で「上に行く」So What? の方向が直感と逆 | A/B：結論を下、データを上に置く版も試す価値あり |
| **PyramidVisual** | Pyramid 3 層 | 結論→主張→根拠の正統構造。色階調で重みが伝わる | 9 ノードはモバイルでやや密。文字 9px の根拠は読みにくい | r3 の根拠を「主張ごとに 1 行ずつ」3 ノードに減らす案 |
| **PrepVisual** | Stack（letter + 説明） | P/R/E/P の頭文字バッジが視覚的アンカーとして機能 | 静的で動きがない。インタラクション余地未活用 | タップで例文を展開、または A/B で「PREP 法の悪い例 ↔ 良い例」切替 |
| **CaseStudyVisual** | Stack（フェーズ） | フェーズ番号 + タイトル + body の構造が明快 | 4 フェーズが全部 brand 色で単調。フェーズごとに色や記号で差別化したい | フェーズアイコン化（虫眼鏡 / 電球 / フラスコ / 矢印）、Cycle 構図への進化 |
| **DeductionVisual** | Syllogism | 三段論法の古典例（ソクラテス）で学習文脈と一致。結論 gradient で締まる | 例が古典的すぎる。現代ビジネス例も欲しい | props 化して 2–3 例切替（古典 / ビジネス / 日常） |
| **InductionVisual** | Samples→Generalization | column-reverse で「下→上」の動きを表現できてる。warn ラベルで限界も明示 | サンプルが 4 つ並ぶがすべて同パターン。「反例 1 つで覆る」の体感が薄い | 5 つ目に「白いカラス」追加で warn を実体化、トグルで反例を出す |
| **ContrapositiveVisual** | Equivalence + 真理値表 | 命題 ⇔ 対偶を視覚で見せ、表で論理を裏付ける構成は完璧 | 真理値表が小さい・モバイルで読みづらい | テーブルを縦スクロール許容、または各行をカード化 |
| **AbstractionLadderVisual** | Ladder + State | ピン移動の即時フィードバックが秀逸。具体↔抽象の体感そのものが学び | rung が 7 階で多い。モバイルで縦長に伸びる | 5 階に絞る案、または横スクロール対応 |

**総評**：10 種すべて高品質。これをベースに同質のものを **量産していけば 150 レッスンは十分カバー** できる。新規 visual は §4 のプリミティブを参考に、まず構図を真似て当てはめ、その後に固有のひねりを加える順序で進める。

---

## 8. 避けるべきアンチパターン

### 8.1 ❌ 手書きペン書きスタイルをレッスン内 visual に持ち込む
画像アセット（サムネ）と混同して、`Caveat` フォント・クリーム背景・ペン書き線・SVG turbulence filter をレッスン内 visual に使うのは NG。
- 理由：アプリ UI 本体（カード / ボタン / 文字）と分裂する。ダークモード切替で破綻する
- 正しい使い分け：手書きは画像書き出し（PNG）でサムネ・ヒーローのみ

### 8.2 ❌ 装飾目的の図解
そのレッスンに概念構造がないのに「視覚的に華やかにするため」visual を入れる。
- 例：「相手の話を聞こう」というレッスンに 4 象限マトリクスを無理矢理当てる
- 結果：構造を読もうとした学習者が意味を取れず混乱
- 対応：構造がないレッスンには visual を作らない（イラスト素材だけで OK）

### 8.3 ❌ 情報過多
- 要素 15+ のツリー、6 層ピラミッド、12 セルマトリクス
- 1 ノードに長文（30 字以上の日本語）
- 結果：モバイルで読めない、スクロール前提になる、概念のシャープさが失われる
- 対応：要素 5 / 階層 3 / ノード 12 字の上限を厳守

### 8.4 ❌ 意味のない矢印・装飾線
「なんとなくつなぐ」「空白を埋めるための波線」など意味のない線を引く。
- 結果：学習者が「この矢印は何を意味する？」と考え込んで本筋を見失う
- 対応：矢印は §1.3 の 4 タイプに限定。装飾はゼロ

### 8.5 ❌ 1 画面に色のカテゴリが 4 種以上
brand + rose + success + warning + violet を全部入れる。
- 結果：色の意味が読めず、ただの「カラフルな絵」になる
- 対応：1 visual 内のカテゴリ色は最大 3 種。色のルールは §2.2 の意味カテゴリに従う

### 8.6 ❌ ハードコード色 / `#FFFFFF` / `#000000`
`background: '#fff'` `color: '#000'` などのハードコード。
- 結果：ダークモード切替で破綻、トークン更新時に追従しない
- 対応：必ず `var(--bg-card)` `var(--text-primary)` 等のトークン経由

### 8.7 ❌ 過剰なインタラクション
タップしないと核が分からない、5 段階タップで初めて完成する、ホバーで初めて読める。
- 結果：「タップしない学習者」が概念を理解できない
- 対応：第一表示で 80% が伝わる設計。インタラクションは「深掘りの楽しさ」のみに使う

### 8.8 ❌ `mix-blend-mode` を使う
ベン図やオーバーラップ表現を「重ねるだけで自動でいい感じの色になる」と期待して `mix-blend-mode: multiply / screen / overlay` を CSS で当てる。
- 結果：
  - ダークモードで背景色が反転すると blend 結果が真っ黒 or 真っ白になり読めなくなる
  - 中央バッジ・キャプション等の上に乗る要素の color が混色で予測不能化
  - SVG/PNG export 時に blend が無視されて見た目が壊れる
- 対応：重なり表現は `color-mix(in srgb, var(--token) 18%, transparent)` か `rgba()` の半透明 background で明示的に作る。中央バッジは別レイヤー (`z-index`) で上に乗せて blend の影響を受けないようにする

### 8.9 ❌ `--brand-pop` (violet) を「もう 1 色欲しい時」の汎用カラーとして消費する
カラーシステム §2.2 で `--brand-pop` は「AI・メタ認知・再帰など特殊概念のみ」と定義されているにもかかわらず、ただ「brand と差をつけたい」「もう 1 色欲しい」という理由で violet を投入する。
- 結果：意味カテゴリが希薄化し、学習者は「violet = 何を意味する色？」が読めなくなる。次回のレッスンで本来の violet（AI / 特殊概念）が出てきても識別力が落ちる
- 対応：差をつけたいだけなら brand の濃淡（`--brand-light` / `--brand` / `--brand-hover`）でグラデを作る。本当に「特殊・創造・横方向」の意味があるときだけ violet を使い、その理由をコード comment に書く

### 8.10 ❌ 「AI ぽい」見た目に直結する装飾を入れる（2026-05-24 追加）

実機ユーザーから「テンプレ AI 出力に見える」フィードバックが出やすい装飾パターン。本ガイドでは **下記すべて NG**。

| NG | 理由 | 正しい対応 |
|---|---|---|
| **派手な多色 gradient**（紫→ピンク→オレンジなど 3 色以上の長距離 gradient） | 「Midjourney / Stable Diffusion 量産画像」を連想させる | brand の 2 色（`--brand` → `--brand-hover`）に止める。`--brand-cta-grad` が標準 |
| **ネオン / glow shadow を主役要素に乗せる** | ゲーム UI / AI tool 感が出る | 影は `--shadow-card` / `--brand-cta-shadow` のみ。色付き glow は禁止 |
| **glass morphism（半透明 + blur 背景）** | 2020 年代 AI tool の定番デザインで陳腐化 | 本ガイドの card（白 + border + 控えめ shadow）を使う |
| **emoji を主役アイコンに使う**（🚀 ✨ 🎯 等を node 内に並べる） | LLM 出力テンプレ感が強い | §3.3 通り 💡 ⚠ のみ許可、それ以外は SVG icon を使うか言葉で表現 |
| **冷色 1 色支配（Slate Blue 単色のみ）** | 教科書として正確だが「AI 出力感」と「無機質さ」が出る | §2.4 の warm accent を 1 箇所だけ差す |
| **角丸 24px+ + soft shadow + 中央寄せの単純構図** | Notion / Figma AI テンプレ感 | radius は §付録 A / B の 8–12px、構図は §4 のプリミティブから選ぶ |

**判断軸:** 「これを Pinterest で見たら『AI generator で作った画像』と思うか？」を 1 visual 完成ごとに自問する。Yes が頭をよぎったら、warm accent 投入 or 構図見直し or 装飾削減で対処する。

---

## 9. 運用フロー（dev-logic との連携）

### 9.1 新規 visual 制作の標準フロー

```
1. dev-logic がレッスンスキャンで「ここに visual 候補」リスト出力
   → lesson-id / 概念名 / 推奨構図 / 推定 props
   
2. 凜（designer）がリストをレビュー
   - 本ガイド §4 のプリミティブに当てはまるか確認
   - §5 のカテゴリトーンと整合するか確認
   - 不要 / 過剰な候補を削る
   
3. 優先順位付け
   - 高：基礎概念で多くのレッスンから参照される（ピラミッド・三段論法 級）
   - 中：特定カテゴリの代表概念
   - 低：固有レッスン専用、汎用性低
   
4. サンプル 1 個を凜が実装（高優先のもの 1 つ）
   - Keita に Figma スクショ or ローカル起動で見せて承認取る
   
5. 承認後、dev-logic に並列実装依頼
   - 本ガイド §6 のテンプレートを必ず使う
   - PR レビューで凜がスタイル整合性チェック
```

### 9.2 既存 visual の品質改修

§7 の「改修余地」リストを優先順にチケット化。dev-logic に振る。

### 9.3 visual を増やさない判断

以下のレッスンは visual 不要：
- 概念が「物語・例・対話」中心（visual で構造化すると逆に陳腐）
- 文字数が少なく本文だけで完結
- ロールプレイ・ライティング演習中心のインタラクションレッスン

---

## 10. このガイドの更新ルール

- **新しい構図プリミティブを追加した場合**：§4.9 → §4 本体に昇格
- **既存 visual を改修した場合**：§7 の評価を更新
- **新しい NG パターンを発見した場合**：§8 に追記
- **カテゴリトーンが追加された場合**：§5 に追加

更新は凜（designer）が判断 → Keita に簡潔報告 → コミット。
大きな方針変更（手書きスタイルをレッスン内 visual にも展開する等）は **Keita 承認必須**。

---

## 付録 A：構図プリミティブ早見表

| 構図 | CSS クラス基底 | 適用構造 | 推奨レッスン例 |
|---|---|---|---|
| Tree | `vz-tree-root / -node / -children / -leaf` | 階層分岐 | Why ツリー、原因分解 |
| Pyramid | `vz-pyramid / -row / -cell` | 結論集約 3 層 | ピラミッド原則、結論→根拠 |
| Stack | `vz-phase-stack / vz-phase / vz-prep-row` | 順序フロー | PREP、ケース 4 フェーズ |
| Syllogism | `vz-syllogism / vz-premise-card / vz-arrow-down` | 縦並び論証 | 演繹、So What? |
| Samples→General | `vz-induction-samples / vz-induction-sample` | 観察→法則 | 帰納法 |
| Equivalence | `vz-contra-flow / vz-contra-block / vz-contra-arrow` | 等価対比 | 対偶、論理的等価 |
| Grid 2×2 | `vz-mece-grid / vz-mece-card` | 切り口網羅 | MECE、SWOT |
| Ladder | `vz-ladder / -meter / -pin / -rungs / -rung` | 連続階層 | 抽象ラダー、習熟度 |
| Truth Table | `vz-truth-table` | クロス検証 | 真理値、フレーム比較 |

---

## 付録 B：色チートシート（コピペ用）

すべて token 経由で書く。hex 直書きはレビュー時に検出する（§8.6）。

```tsx
// 結論ブロック（gradient + shadow）
style={{
  background: 'var(--brand-cta-grad)',
  color: '#fff',
  boxShadow: 'var(--brand-cta-shadow)',
  borderRadius: 12,
  padding: '12px 14px',
}}

// 前提・中間ノード
style={{
  background: 'var(--bg-card)',
  border: '1.5px solid var(--brand)',
  color: 'var(--text-primary)',
  borderRadius: 10,
  padding: '10px 12px',
}}

// データ・根拠
style={{
  background: 'var(--bg-secondary)',
  border: '1px solid var(--border)',
  color: 'var(--text-secondary)',
  borderRadius: 8,
  padding: '6px 8px',
}}

// 対立 / 反証（rose）
style={{
  border: '1.5px solid var(--rose)',
  color: 'var(--rose)',
  background: 'var(--bg-card)',
}}

// hint ボックス（brand）
style={{
  marginTop: 12, padding: '8px 10px',
  background: 'var(--brand-soft)',
  color: 'var(--brand)',
  borderRadius: 8,
  fontSize: 11, fontWeight: 600, textAlign: 'center',
}}

// warn ボックス（warning）
style={{
  marginTop: 12, padding: '8px 10px',
  background: 'var(--warning-soft)',
  color: 'var(--warning-deep)',
  borderRadius: 8,
  fontSize: 11, fontWeight: 600, textAlign: 'center',
}}

// success ボックス
style={{
  marginTop: 12, padding: '8px 10px',
  background: 'var(--success-soft)',
  color: 'var(--success-deep)',
  borderRadius: 8,
  fontSize: 11, fontWeight: 600, textAlign: 'center',
}}

// danger ボックス
style={{
  marginTop: 12, padding: '8px 10px',
  background: 'color-mix(in srgb, var(--danger) 10%, transparent)',
  color: 'var(--danger-deep)',
  borderRadius: 8,
  fontSize: 11, fontWeight: 600, textAlign: 'center',
}}

// 特殊 / 創造（violet pop） — AI・メタ認知・横方向思考のみ
style={{
  background: 'var(--brand-grad-pop)',
  color: '#fff',
  boxShadow: '0 4px 12px rgba(124, 58, 237, 0.28)',
}}
```

---

## 付録 C：dev-logic への引き継ぎ用テンプレ

```
## レッスン横断 visual 候補スキャン依頼

参照ガイド: docs/VISUAL_DESIGN_GUIDE.md

出力フォーマット（各候補 1 行）:
lesson-XX | <概念名> | <推奨構図 §4.x> | <カテゴリ §5.x> | <優先度 高/中/低> | <props 概略>

ルール:
- 1 レッスン 1 visual まで
- 構図は §4 / §4.9 のプリミティブから選ぶ（独自構図禁止、必要なら本ガイド §4.9 に追加提案）
- カテゴリは §5 の 10 種から選ぶ
- 既存 10 種で代用できるなら新規作成せず再利用 (props 化)
- 概念構造がないレッスンは候補から除外
```

---

## 11. 全 Visual A 案展開手順（2026-05-24 追加）

A 案（フォント底上げ + warm accent）を全 64 visual に段階適用するための手順。
サンプル 1 件（`WhereWhyHowVisual`）の承認後に start する。

### 11.1 適用範囲と優先順位

64 visual を以下 3 グループに分けて段階適用：

| グループ | 件数 (目安) | 例 | 優先度 |
|---|---|---|---|
| **A. 高頻度コア構図** | 〜15 件 | Pyramid / LogicTree / Syllogism / Stack / SCR / WhereWhyHow / PREP / SoWhat / Deduction / Induction | 高 — Phase 1 |
| **B. カテゴリ代表構図** | 〜25 件 | MecePatterns / FiveForces / SixHats / SCAMPER / Iceberg / AbstractionLadder / Empathy / Quadrant 系 | 中 — Phase 2 |
| **C. 個別概念専用** | 〜24 件 | DistributionShape / FallacyGrid / GraphPitfalls / Fermi 系 / 領域特化のもの | 低 — Phase 3 |

### 11.2 1 ファイルあたりの作業手順（チェックリスト）

```
□ 1. 対象 visual の CSS（visuals.css or visuals-phase3b.css 等）を開く
□ 2. font-size 一括上げ（旧 → 新基準）
     - 13px / 13.5px → 14px
     - 12px / 12.5px → 14px (本文 weight 600 の場合) or 13px (補助)
     - 11px → 12px (ラベル / 補助)
     - 9 / 10px → 12px (ラベル)
     - 既に 14px+ のものはそのまま
□ 3. warm accent 投入箇所を 1 つ選ぶ
     - 矢印（vz-*-arrow）→ color を var(--visual-warm-primary) に
     - もしくは「最重要 step の左 4px ボーダー」を terracotta に
     - もしくは hint / 強調ピルを terracotta soft 背景に
     - **どれか 1 箇所だけ**。複数差さない
□ 4. tsc -b --noEmit で型エラーがないことを確認
□ 5. 該当 lesson を起動してモバイル幅で目視確認
     - 文字が読みやすくなったか
     - warm accent が浮かず、Slate Blue ベースを邪魔していないか
     - ダークモードに切り替えてもコントラスト維持できているか
□ 6. コミット 1 件 / visual 1 件 を原則とする（差分追跡しやすくするため）
```

### 11.3 token 一括置換ガイド（参考）

font-size の一括置換は **必ず手動で 1 ファイルずつ確認**する。理由は同じ px 値でも意味（ラベル / 本文 / 補助）が違うため、機械的 sed では誤った upgrade が混入する。

参考 sed パターン（**目視確認用、直接実行しない**）:

```bash
# 旧 13px / 13.5px のうち、ノード本文相当を確認するためのリストアップ
grep -n "font-size: 13" src/visuals/visuals-phase3b.css

# 旧 11px → 12px へ（ラベル相当のみ）
grep -n "font-size: 11px" src/visuals/visuals.css
```

### 11.4 Phase 進捗管理

```
Phase 0: サンプル WhereWhyHowVisual 完成・承認 ← 現在
Phase 1: グループ A 15 件適用（〜2 セッション）
  → 完了時に再度 Keita 目視レビュー（モバイル幅、ライト/ダーク両方）
Phase 2: グループ B 25 件適用
Phase 3: グループ C 24 件適用
Phase 4: HANDDRAWN_ROLLOUT_PLAN.md との整合性レビュー（サムネ系と矛盾していないか）
```

各 Phase 完了時に：
1. `docs/VISUAL_DESIGN_GUIDE.md` §7 の評価表に新スコア（フォント・warm accent 適用済の印）を追記
2. 適用済 visual の list を本 §11 末尾に「Phase X 完了済リスト」として追加
3. Keita に進捗報告（適用件数 / 残件数 / スクショ）

### 11.5 完了済リスト

- **Phase 0 (2026-05-24):** `WhereWhyHowVisual`（サンプル、A 案リファレンス実装）
- **Phase 1 (2026-05-24):** 高頻度 15 件適用済
  - Group A (フェルミ系 6 件):
    - `FermiFormulaVisual` — warm accent: = 記号 (terracotta)
    - `FermiMacroMicroSplitVisual` — warm accent: 「上下で桁が一致 ✓」バッジ (terracotta soft+deep)
    - `FermiDemandDivSupplyVisual` — warm accent: ÷ / = の divider .op (terracotta)
    - `FermiPatternMatrixVisual` — warm accent: detail-num (terracotta-deep)
    - `FermiCrossCheckVisual` — warm accent: verdict ✓ icon (terracotta 背景 + 白)
    - `FermiAreaApproachVisual` — warm accent: フォーカスセル「1 店舗」 (terracotta)
  - Group B (ロジカル/MECE 系 6 件):
    - `ThreePillarsVisual` — warm accent: 3 番目の柱の num (terracotta)
    - `Two2MatrixVisual` — warm accent: axis-label (terracotta-deep)
    - `PyramidVisual` — warm accent: top セル label (mustard)
    - `LogicTreeVisual` — warm accent: leaf の left-border 3px (terracotta)
    - `MecePatternsVisual` — warm accent: ① 要素分解 root (terracotta)
    - `TriadVisual` — warm accent: triad-line 3 辺 (terracotta soft)
  - Group C (その他 2 件):
    - `GraphPitfallsVisual` — warm accent: hint ボックス (terracotta soft 背景)
    - `ScrStructureVisual` — warm accent: Complication step left-border 4px (terracotta)
- Phase 2 / 3: 承認後に追記

---

**End of Visual Design Guide.**
