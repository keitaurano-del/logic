# Logic 手書きスタイル ガイド

**最終更新:** 2026-05-13
**担当:** designer (凜)
**目的:** Logic アプリの全画像を「手書き感のある親しみやすい教科書ノート風」スタイルに統一する
**現行マスター:** `public/images/v3/course-*.png`（v4、Figma 製、PR #140）

---

## 0. 全体方針 — Why this style

Logic は「論理思考を学ぶ・身につける」というやや堅いテーマを扱う学習アプリ。
ターゲット（若手ビジネスパーソン）に対して、ビジュアルが堅すぎると教科書臭くなり、
派手すぎると軽く見えて信頼を失う。

そこで採用するのが **「賢い人が大事な概念を自分のノートにメモした 1 ページ」** のメタファー。

- **教科書ノートの 1 ページ** = 学びの主体性が伝わる
- **手書き図解** = 概念を「自分で噛み砕いて整理した」感
- **ペン書きの揺らぎ** = AI 生成丸投げではない、人の手による知性

このスタイルは **2026-05-13 に v4 PNG（Figma 製、26 コース）として確立** した（PR #140）。
本ドキュメントは その方向性をさらに洗練・体系化して **全画像（コース / レッスン / ホーム / ヒーロー / マーケ素材）に適用** するためのリファレンス。

> ⚠️ **legacy `course-*.svg`（インライン SVG + turbulence filter）は参照しない。**
> 新規制作は必ず Figma マスター → PNG 書き出しで行うこと。
> SVG 直書きパイプラインは v3 まで。v4 以降は Figma 制作が標準。

---

## 1. やる / やらない

### ✅ やる
- 生成りのクリーム色 (`#FDF8E9`) ベースの「紙」背景
- 細い罫線（ノート風）+ 紙テクスチャ overlay
- 手描き図解（ロジックツリー / 虫眼鏡 / 付箋 / フローチャート など）
- ペン書きの揺らぎ（SVG `feTurbulence + feDisplacementMap`、Figma だと `Draw> Vector` を手で揺らす）
- ブランドブルー `#3D5FC4` を主軸に、朱赤 `#C8634B` をアクセント
- 手書き系 webfont（英字: Caveat / Patrick Hand、日本語: Klee One / Yuji Mai）
- 余白を多めに取る（紙の余白感）

### ❌ やらない
- **ダーク背景（紺・黒・ティール）** ← 既存 lesson-*.webp / hero-*.webp の最大の問題
- 写実的な人物写真・室内写真（既存 course-business.webp 等）
- パーフェクトに整ったベクター線（CAD っぽい）
- 蛍光ネオン / グラデーション
- 写真合成 + AI イラストのチグハグ感
- 画像内に長文の英語ラベル（読まれない、装飾になりがち）

---

## 2. カラーパレット

```
背景 (紙)             #FDF8E9   生成りクリーム
紙テクスチャ overlay  rgba(140, 115, 82, 0.18)
罫線                  #D9CDB0   ベージュ
左マージン縦罫        #C8634B   朱赤 (薄め、opacity 0.78)
本文テキスト           #1F2A44   濃紺グレー (純黒は使わない)

主役カラー (ブランド)  #3D5FC4   ロイヤルブルー (= var(--brand))
                      #EEF2FE   薄いブルー (図解 fill 用、= var(--brand-soft))
アクセント            #C8634B   朱赤 (ハンコ・強調)

サブカラー (限定使用)
- 付箋イエロー         #FFE383
- 付箋シャドウ         #B89421
- 黄土色アクセント     #E8A000
- 鉛筆スケッチ         #5B5340  (鉛筆色)
- 補助線・ダッシュ     #C9BFA7

❌ 避ける色
- 純黒 #000000
- 純白 #FFFFFF (背景・カード fill 含む)
- ネオン緑 / 蛍光ピンク
- ダーク背景 #0F1B2A / #1A2940 系
```

カテゴリ別アクセント色（コースサムネで「色の温度感」を分けたい場合のオプション）:

| カテゴリ | アクセント色 | 使用シーン |
|---|---|---|
| 論理 (logic / critical) | `#3D5FC4` ブルー | 構造化・論理 |
| 課題解決 (problem / design / systems / hypothesis) | `#6B9B7A` 抹茶緑 | 探究・解決 |
| 発想 (lateral / analogy) | `#E8A000` 黄土色 | 創造・発想 |
| 相手を動かす (proposal / client / case) | `#C8634B` 朱赤 | 説得・行動 |
| 哲学・思想 (philosophy / eastern) | `#5B4A6B` 紫紺 | 思想・深み |
| 数字 (fermi / numeracy) | `#D17A4A` テラコッタ | 計算・実用 |

**運用ルール:** 1 画像内のアクセント色は 1 つまで。地色 + テキスト + アクセント 1 色 で 3 色構成を保つ。

---

## 3. 線の質感

```
ペン書き (主役)
  stroke-width: 2.0 - 2.4 px
  filter: inkBleed (baseFrequency 0.9, scale 1.0)
  stroke-linecap: round
  例: 図解の輪郭、☑ チェックマーク

罫線・補助線 (脇役)
  stroke-width: 0.65 - 1.4 px
  filter: jitterFine (baseFrequency 0.04, scale 1.6)
  opacity: 0.4 - 0.6
  例: ノート罫線、リスト下線、中央仕切り線

図形輪郭 (中)
  stroke-width: 2.0 - 3.0 px
  filter: jitterMed (baseFrequency 0.035, scale 2.8)
  例: 矩形ノード、虫眼鏡レンズ、ボタン枠
```

**SVG フィルター 3 種テンプレ:** `docs/handdrawn-pilot/course-logic-01-v2.svg` の `<defs>` を参照。

**Figma で実現する場合:**
1. Pen tool で線を引く
2. `Effects > Layer blur 0.4px` で微ボケ
3. Vector network → 各 point を ±2px ジッターさせる（手動 or Plugin "Wonky" 等）
4. Stroke を `Pencil` brush（Figma 標準）に変更し、`Pressure variation: 0.3` 程度

---

## 4. フォント

### 英字
- **第一候補:** [Caveat](https://fonts.google.com/specimen/Caveat) (Google Fonts、無料)
- **第二候補:** Patrick Hand
- **第三候補:** Bradley Hand / Segoe Print (システム fallback)

### 日本語 — 重要
日本語の「ペン書き感」が出る webfont は限定的:

- **第一候補:** [Klee One](https://fonts.google.com/specimen/Klee+One) (Google Fonts、無料、楷書ペン体)
- **第二候補:** [Yuji Mai](https://fonts.google.com/specimen/Yuji+Mai) (Google Fonts、筆ペン風、見出し向き)
- **第三候補:** Hiragino Maru Gothic / Yu Gothic UI (システム fallback、ゴシックの丸み)

### フォントスタック（CSS / SVG `font-family`）

```css
/* 見出し */
font-family: 'Caveat', 'Yuji Mai', 'Klee One', 'Patrick Hand',
             'Bradley Hand', 'Segoe Print', cursive;

/* 本文・ラベル */
font-family: 'Caveat', 'Klee One', 'Patrick Hand',
             'Bradley Hand', 'Segoe Print', cursive;
```

### 適用ガイドライン
- 画像内の **日本語タイトルは 20pt 以上** で配置（小さいと手書き感が読み取れない）
- 英字ラベル（"So What?" "Why So?" 等）は `Caveat` で 14-22pt が最も「ノートメモ感」が出る
- 画像内の本文は最大 5 行・1 行 14 字程度まで（読ませる用ではないので過剰に詰めない）

### 既知の制約 & 推奨対応
- 画像（PNG/WebP）に焼き付けた日本語は、レンダリング環境（サーバー sharp 等）に Klee One / Yuji Mai が無いと sans-serif フォールバックする
- → 画像化する場合は **Figma 上でフォントを ベクターアウトライン化** してから書き出す
- → SVG のままアプリで使う場合は、`index.css` で `@font-face` 経由で webfont を読み込む（既に Logic は webfont 読込パイプラインあり）

### 設計上の指針 (重要)
画像内に日本語タイトルを焼き込むと「フォント環境依存」「i18n 対応困難」が発生する。
**推奨:** 画像は「図解・モチーフ・余白」だけにして、**コース名・レッスン名は UI コード側でカードに重ねる** 構成にする。

これは Phase 1 着手前に Keita と方針合意した方が良いポイント（後述）。

---

## 5. 構図ルール

### 5.1 コースサムネ (`course-*.svg`, viewBox 800×400, 2:1)

```
+--------------------------------------------------+
| マージン 72px                                       |
| ●左マージン縦罫 (朱赤)                              |
|   ┌─ タイトル (32pt 手書き)                        |
|   ├─ サブタイトル (16pt ブランド色)                  |
|   ├─ 波線下線                                       |
|   │                                                |
|   │   [左ブロック]      │ [右ブロック]               |
|   │   手描き図解        │ ✓ 学ぶこと/視点リスト       |
|   │   (主役モチーフ)    │ (5 項目まで)               |
|   │                     │                          |
|   └─                    │                          |
|              中央仕切り (ダッシュ)                    |
|                                                    |
|                              [Logic スタンプ・右下]   |
+--------------------------------------------------+
```

ベース実装: `docs/handdrawn-pilot/course-logic-01-v2.svg`

### 5.2 レッスンサムネ (1:1 推奨、viewBox 800×800 か 1024×1024)

レッスンサムネはより シンプルに。
- 中央に主役モチーフ 1 つ（=そのレッスンを象徴するもの）
- 紙背景 + 軽い罫線
- 文字は最小限（数字 or 1 単語の英字ラベルのみ）

### 5.3 ホーム / ヒーロー (フリーサイズ、横長 or 縦長)

- 紙背景は省略可（カードと馴染ませる）
- モチーフ + 周囲に余白を大きく取る
- 文字なし、純粋にビジュアルだけ

---

## 6. カテゴリ別モチーフ集

| カテゴリ | モチーフ候補 |
|---|---|
| 論理 (logic) | ロジックツリー、ピラミッド、ブロック積み木 |
| 批判的思考 (critical) | 虫眼鏡、？マーク、天秤 |
| 仮説思考 (hypothesis) | 矢印 → ターゲット、雲 → 種 |
| 課題設定 (problem / issue) | パズル、的、糸玉 |
| デザイン思考 (design) | 付箋 (ポストイット)、共感マップ |
| システム思考 (systems) | 氷山、循環矢印、ネットワーク図 |
| ラテラル思考 (lateral) | 横向き矢印、リンゴ → ピーマン、電球 |
| アナロジー (analogy) | 鏡像、橋、テンプレート |
| 提案 (proposal) | 巻物、便箋、書類フォルダ |
| クライアントワーク (client) | グラフ、デスク、PC |
| ケース面接 (case) | 4 象限、フレームワーク |
| 戦略 (strategy) | 将棋盤、地図、星座図 |
| フェルミ (fermi) | 紙メモに分数、東京タワー、地球儀 |
| 数値 (numeracy) | そろばん、グラフ、定規 |
| 哲学 (philosophy) | 古典書、羽根ペン、コラム |
| 東洋思想 (eastern) | 巻物、印鑑、墨絵 |

**運用ルール:** モチーフは「概念の比喩」として 1 画像 1 モチーフが基本。複数並べる場合は主役 + 脇役 1 つまで。

---

## 7. ツール使い分けパイプライン

### 7.1 全体像

```
┌───────────────────────────────────────────────────────────────┐
│  STAGE 1: Concept (1-2 分/枚)                                  │
│  - カテゴリ → モチーフ確定                                       │
│  - カラー → カテゴリ別アクセント色決定                            │
│  - コピー文言 (学ぶこと 5 項目 等)                                │
└───────────────────────────────────────────────────────────────┘
                          ↓
┌───────────────────────────────────────────────────────────────┐
│  STAGE 2: Generation — どのツールを使う？                       │
│  ┌─────────────────┬─────────────────┬─────────────────────┐  │
│  │ A. SVG 直書き    │ B. Figma 手作業 │ C. Gemini → 仕上げ  │  │
│  │ (現在主流)       │ (テンプレ運用)   │ (ベースのみ生成)    │  │
│  └─────────────────┴─────────────────┴─────────────────────┘  │
└───────────────────────────────────────────────────────────────┘
                          ↓
┌───────────────────────────────────────────────────────────────┐
│  STAGE 3: Polish & Export                                      │
│  - Figma で配置調整・テキスト合成                                │
│  - PNG/WebP 書き出し or SVG そのまま                            │
└───────────────────────────────────────────────────────────────┘
                          ↓
┌───────────────────────────────────────────────────────────────┐
│  STAGE 4: Deploy                                               │
│  - public/images/v3/ に配置                                    │
│  - 既存ファイルを上書き or 新 path + courseData.ts 更新         │
│  - dev-logic に PR 引き継ぎ                                    │
└───────────────────────────────────────────────────────────────┘
```

### 7.2 各ツールの強み・弱み

| ツール | 強み | 弱み | 適用シーン |
|---|---|---|---|
| **SVG 直書き** (現在主流) | 完全コントロール / 再現性 100% / ファイル軽量 / アプリ内で webfont 反映 / 編集容易 | 凜の作業時間 / 複雑モチーフは大変 | コースサムネ (カード化済み)、図解中心レッスン |
| **Figma 手作業** | テンプレ化で量産可 / デザイナー以外も触れる / 共有しやすい | ベクター手書き感を出すのに workaround 必要 / フォントアウトライン化必須 | レッスンサムネ大量生産、A/B 用バリエーション |
| **Gemini (Nano Banana / Imagen)** | リッチなテクスチャ・自然な手書き感 / 高速生成 | 完全再現性なし / 日本語焼き込み困難 / ブランド色精密制御困難 / API クレジット消費 | モチーフ素材（虫眼鏡・付箋・古典書 etc）の生成 → Figma で配置 |
| **Canva** | 大量のテンプレ・素材 / SNS サイズ展開楽 | 手書き感の素材が薄い / カスタマイズ自由度低 | SNS 投稿画像、ストア素材、季節バナー |

### 7.3 推奨パイプライン (コースサムネ 1 枚あたり) — **v4 以降は Figma 中心**

**ベスト構成: Figma 制作 → PNG 書き出し**

```
1. (Concept, 2分)
   モチーフとコピー確定（カテゴリ別アクセント色 + 図解タイプ決定）

2. (Layout, 10-20分) ← Figma マスターで制作
   v4 マスター (https://www.figma.com/design/2SJYbSyMbBlSOyd3DJzbUc) を複製
   - クリーム notebook 背景 + ruled lines はマスターから継承
   - タイトル: Caveat 手書き英字 + 朱赤下線
   - サブタイトル: Noto Sans JP Light 日本語
   - 中央〜右に図解（カテゴリに応じた 23 種から選定）
   - 右上に手書き電球アイコン

3. (Export, 1分)
   Figma → Export PNG, 800×400px, 2x scale で書き出し

4. (Place & Reference, 2分)
   public/images/v3/course-{ID}.png に配置
   courseData.ts の image refs を .png で更新
```

**所要時間:** 1 枚 15-25 分（マスターから複製ベース）

> ⚠️ legacy パイプライン（SVG 直書き + turbulence filter + Gemini 素材生成）は v3 まで。
> v4 以降は Figma マスターからの複製が標準。Gemini / Pixa は使用しない（[[feedback-no-pixa]]）。

### 7.4 Gemini プロンプトテンプレ

```
[ベース]
hand-drawn ink illustration of {MOTIF},
single object centered, transparent PNG background,
thin pen strokes, slight wobble in lines (hand-drawn feel),
no shading or gradients, minimal detail,
muted color palette: ink black {#1F2A44}, accent {ACCENT_HEX},
illustration style similar to vintage scientific notebooks,
--ar 1:1 --no text, letters, numbers, watermark, signature, frame, border

[論理ツリー]
{MOTIF} = a simple branching tree diagram with one parent box and three child boxes,
connected by thin lines, all hand-drawn

[虫眼鏡]
{MOTIF} = an old-fashioned magnifying glass with a wooden handle,
held at a slight angle, simple ink outlines only

[付箋]
{MOTIF} = a square sticky note with one folded corner,
slightly tilted, just the paper shape (no text on it)

[巻物]
{MOTIF} = an unrolled ancient scroll with rolled ends,
lying flat, blank surface, hand-drawn ink lines

[電球]
{MOTIF} = a simple lightbulb with visible filament inside,
no glow effect, just outlines

[氷山]
{MOTIF} = an iceberg with visible underwater portion,
cross-section view, simple outlines, water surface line

[羽根ペン]
{MOTIF} = a quill pen leaning against an inkwell,
side view, hand-drawn outlines

NG キーワード (毎回含める):
no text, no letters, no numbers, no watermark, no signature,
no frame, no border, no shading, no gradients, no 3D, no photo,
no people, no faces, no hands
```

### 7.5 Figma マスターファイル

**v4 マスター（現行・コースサムネ）:** https://www.figma.com/design/2SJYbSyMbBlSOyd3DJzbUc
**用途:** 26 コース v4 PNG の制作元。新コース追加時はここから複製。

**v2 パイロット（legacy・参照のみ）:** https://www.figma.com/design/WWW1jdNEe90B01jo4Myo2t
**file_key:** `WWW1jdNEe90B01jo4Myo2t`
**名称:** "Logic Handdrawn Style — Master Pilot"
**状態:** v4 で置き換え済。新規制作には使わない。履歴参照のみ。

v4 マスターには以下を順次追加していく:
- ページ 1: スタイルガイド・カラーパレット・フォントサンプル
- ページ 2: コースサムネテンプレ（コンポーネント化済 / 26 枚）
- ページ 3: レッスンサムネテンプレ（Phase 2 で追加予定）
- ページ 4: ホーム/ヒーローテンプレ（Phase 3 で追加予定）
- ページ 5: 素材ライブラリ（モチーフ）

### 7.6 legacy SVG テンプレ運用（参照のみ・新規利用禁止）

> ⚠️ 以下は v3 までのパイプライン。v4 以降は Figma 制作が標準。
> 新規サムネ作成時は §7.3 を参照すること。

旧パイプライン (v3 まで):
```bash
# 旧: SVG 直書き
cp docs/handdrawn-pilot/course-logic-01-v2.svg \
   public/images/v3/course-{ID}.svg
# feTurbulence の seed 値で偶然性を出していた
node scripts/svg2png.mjs public/images/v3/course-{ID}.svg
```

---

## 8. NG 例（既存画像の問題点）

### NG 1: `lesson-20.webp` 系（lesson-*.webp 約 50 枚）
- 問題: ダーク背景 (`#0F2A2A` ティール) + 完全クリーンなベクター
- 影響: 手書きスタイルと完全に逆行、カード一覧で雰囲気がチグハグ
- 対応: Phase 2 で全件差し替え

### NG 2: `course-business.webp` 系 (course-*.webp 6 枚)
- 問題: 写実的人物写真、夜景オフィス、暗い照明
- 影響: 「教科書ノート」メタファーから完全に逸脱
- 対応: Phase 1 で SVG 版に差し替え（既に SVG 版あり、参照を切り替えるだけ）

### NG 3: `home-roleplay.webp` / `hero-deduction.webp`
- 問題: ダーク背景 + AI 生成感の強い盛り盛り図解 / 写実人物
- 影響: ホーム画面の第一印象がブランドと不一致
- 対応: Phase 3 で差し替え（優先度高）

---

## 9. 確認が必要な Keita 判断ポイント

1. **画像内に日本語タイトルを焼き込むか？**
   - 案 A: 焼き込む（現状） → フォント環境依存・i18n NG
   - 案 B: 図解だけにして UI 側でタイトル重ねる → クリーンだが大改修

2. **既存 SVG コースサムネ（25 枚、course-*-01.svg 等）の扱い**
   - 案 A: そのまま維持（既に手書き+図解スタイル）
   - 案 B: v2 テンプレに刷新（紙テクスチャ強化版）

3. **Gemini 利用予算**
   - 1 枚あたり 1-5 generation × 約 0.04 USD = 数十円
   - 約 90 枚の総入れ替えだと 10-30 USD 程度

4. **ロールアウトのタイミング**
   - 一気に全部入れ替え (PR 1 本) vs Phase ごとに分割
