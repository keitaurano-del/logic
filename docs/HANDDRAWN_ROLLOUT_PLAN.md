# Logic 全画像 手書きスタイル化 — ロールアウト計画

**最終更新:** 2026-05-12
**担当:** designer (凜)
**前提:** `docs/HANDDRAWN_STYLE_GUIDE.md` を読んでいること
**パイロット:** `docs/handdrawn-pilot/course-{logic,critical}-01-v2.{svg,png}`

---

## TL;DR (Keita が戻った時に最初に読む)

- **Logic アプリの画像は 89 ファイル**（`public/images/v3/` 配下）。うち **手書きスタイル化済みは 25 枚（既存 SVG コースサムネ）**。
- 残り **64 枚** が方針外スタイル（ダーク背景 / 写実写真 / クリーンベクター）。優先順位順に Phase 1-3 で差し替え予定。
- パイロット 2 枚 を `docs/handdrawn-pilot/` に作成済み（`course-logic-01-v2.svg`、`course-critical-01-v2.svg`）。既存 SVG を「紙テクスチャ + ペン揺らぎ + 手書き✓」で強化した v2。
- **Figma マスターファイル作成済み:** https://www.figma.com/design/WWW1jdNEe90B01jo4Myo2t
- **推奨パイプライン:** SVG 直書き（凜）+ Gemini で素材生成（モチーフ）+ Figma で組版 のハイブリッド。1 枚あたり 20-35 分。
- **総工数見積:** 64 枚 × 25 分平均 = **約 26 時間 (3-4 日)** + Gemini 費用 **約 15-25 USD**。
- **次のアクション (Keita 判断必要):** 下記「決めてほしい 4 点」を確認 → 承認後、凜が Phase 1 から着手。

---

## 1. 現状インベントリ

`public/images/v3/` 配下、合計 **89 ファイル**。

| 種別 | ファイル数 | フォーマット | 現状スタイル | 評価 |
|---|---|---|---|---|
| コースサムネ (SVG) | 25 | SVG | 手書き + 図解 + 紙背景 | ✅ 方針に合致 |
| コースサムネ (WebP) | 6 | WebP | 写実的人物写真・夜景オフィス | ❌ 方針外 |
| レッスンサムネ (numeric) | 41 | WebP | ダーク背景 + クリーンベクター | ❌ 方針外 |
| レッスンサムネ (named) | 8 | WebP | 同上 | ❌ 方針外 |
| ホーム / ヒーロー | 4 | WebP | ダーク背景 + 写実写真 | ❌ 方針外 |
| その他 (fermi-card.png) | 1 | PNG | レガシー、要確認 | ⚠️ 個別判断 |
| ストア / アプリアイコン (assets/, store-screenshots/) | 別管理 | PNG | — | ⚠️ Phase 4 で別途検討 |

**新規作成が必要なファイル数: 約 64 枚** (= 6 + 41 + 8 + 4 + アプリアイコン等の Phase 4 分は別)

### 1.1 既存 SVG コースサムネ (継続使用) 一覧

```
course-analogy-01.svg, course-case-01.svg,
course-client-01.svg, course-client-02.svg, course-client-03.svg,
course-critical-01.svg, course-critical-02.svg,
course-design-01.svg, course-eastern-01.svg, course-eastern-02.svg,
course-fermi-01.svg, course-hypothesis-01.svg, course-lateral-01.svg,
course-logic-01.svg, course-logic-02.svg, course-numeracy.svg,
course-philosophy-01.svg, course-problem-01.svg,
course-proposal-01.svg, course-proposal-course-01.svg,
course-proposal-writing.svg, course-strategy-01.svg, course-strategy-02.svg,
course-strategy.svg, course-systems-01.svg, course-whywhy-01.svg
```

**判断:** これらは現方針に合致しているため、**そのまま継続使用**。
オプションで v2 紙テクスチャ強化版に差し替え可能（パイロット 2 枚済）。

### 1.2 差し替え必須 WebP コースサムネ

```
course-business.webp     → 既存 SVG (course-strategy-01.svg 等) で代替 or 新規作成
course-client.webp       → 既存 SVG (course-client-01.svg) で代替
course-logical.webp      → 既存 SVG (course-logic-01.svg) で代替
course-philosophy.webp   → 既存 SVG (course-philosophy-01.svg) で代替
course-thinking.webp     → 既存 SVG (course-critical-01.svg) で代替
```

参照箇所: `src/lessonSlides.ts` 等で直接 path 参照されている。

**最速対応案:** `courseData.ts` / `lessonSlides.ts` の参照を既存 SVG に切り替えるだけで Phase 1 のうち 5 枚は新規制作不要。1-2 時間で完了。

### 1.3 差し替え必須 レッスンサムネ (41 + 8 = 49 枚)

数字 ID 付き (現存):
```
lesson-20, 21, 22, 23, 24, 25, 26, 27, 28, 29,
lesson-35, 36, 40, 41, 42, 43,
lesson-50, 51, 52, 53, 54, 55, 56, 57, 58, 59,
lesson-60, 61, 62, 63, 64, 65, 66, 67, 68, 69,
lesson-70, 71, 72, 73, 74
```

名前付き:
```
lesson-analogy, lesson-critical-thinking, lesson-design-thinking,
lesson-hypothesis, lesson-issue-setting, lesson-lateral-thinking,
lesson-proposal, lesson-systems-thinking
```

### 1.4 差し替え必須 ホーム / ヒーロー

```
hero-deduction.webp        (ヒーロー演繹法、写実人物)
home-daily-fermi.webp      (ホーム DailyFermi カード)
home-daily-question.webp   (ホーム 問題生成カード)
home-roleplay.webp         (ホーム ロールプレイカード)
```

---

## 2. Phase 別ロールアウト計画

### Phase 0: クイックウィン (即実行可、1-2 時間)
**目的:** 最も目立つ方針外画像を 1 日以内に消す

| タスク | 所要 | 担当 | 影響 |
|---|---|---|---|
| `course-*.webp` 6 枚を既存 SVG への参照に置き換え (`courseData.ts` / `lessonSlides.ts`) | 1h | 凜 (dev-logic PR) | 最も目立つ写実写真コースサムネが消える |
| 古い `THUMBNAILS_MANIFEST.md` を新方針版に更新 or アーカイブ | 30min | 凜 | docs 整合性 |
| パイロット v2 SVG 2 枚 を `public/images/v3/` に配置 (course-logic-01.svg 上書き or `-v2.svg` で並走) | 30min | 凜 | Keita 承認後 |

**完了基準:** アプリ起動 → コース一覧画面に写実写真が 1 枚もない状態

### Phase 1: コースサムネ完全統一 (1 日)
**目的:** 全コースサムネを v2 紙テクスチャ強化版に揃える

- 既存 25 枚の SVG を v2 テンプレ (`course-logic-01-v2.svg`) ベースで再生成
- カテゴリ別アクセント色を適用（スタイルガイド §2 の表参照）
- 全 25 枚: 25 × 15 分 = **6-7 時間**

オプション (Keita 判断):
- 現行 25 枚は既に方針内なので、**スキップして Phase 2 へ進む**ことも可

### Phase 2: レッスンサムネ全差し替え (3 日、最大ボリューム)
**目的:** ダーク背景レッスンサムネ 49 枚を撲滅

サブ Phase:
- **Phase 2a (8 枚):** 名前付きレッスン (lesson-analogy 等) — 各カテゴリ代表画像、優先度高
- **Phase 2b (10-15 枚):** Phase 2a と類似のカテゴリ代表（lesson-20 系 = MECE / ツリー / So What 等）
- **Phase 2c (残り):** 個別レッスンサムネ

**所要:** 49 × 18 分（レッスンサムネは 1:1 でシンプルなので速い）= **15 時間 (2 日)**

**運用方針:**
- 1 カテゴリ 1 モチーフでまとめる（例: 仮説思考 = 全部「矢印 → ターゲット」のバリエーション）
- 文字焼き込みなし、図解のみで OK
- 数字 ID は廃止して named ファイル (`lesson-mece.svg` 等) に統一する案も検討

### Phase 3: ホーム / ヒーロー (半日)
**目的:** ホーム画面の第一印象を整える

| 画像 | モチーフ案 |
|---|---|
| `home-daily-fermi.webp` | 紙メモに分数 + 鉛筆 |
| `home-daily-question.webp` | クエスチョン記号 + 巻紙 |
| `home-roleplay.webp` | 2 つの吹き出し + テーブル |
| `hero-deduction.webp` | ピラミッド + ペン |

**所要:** 4 × 30 分 = **2 時間**（ホーム/ヒーローは凝るのでやや長め）

### Phase 4: アプリアイコン / ストア素材 / マーケ素材 (1-2 日、別途要検討)
- `assets/app-icon-*.png`
- `docs/play-store/`
- `docs/store-screenshots/`
- `docs/templates/`
- 他

**所要:** Phase 1-3 完了後に詳細スコープ確定。ストア素材は別 OS 要件があるので注意。

---

## 3. 工数 & コスト見積

| Phase | 枚数 | 所要時間 | Gemini 費用 | 累計 |
|---|---|---|---|---|
| Phase 0 | 5 + テンプレ | 2h | $0 | 2h / $0 |
| Phase 1 (任意) | 25 | 6-7h | $5 | 9h / $5 |
| Phase 2 | 49 | 15h | $10-15 | 24h / $20 |
| Phase 3 | 4 | 2h | $2 | 26h / $22 |
| **小計 (Phase 0-3)** | **約 80** | **約 26h** | **約 $22** | **約 26 時間 / $22** |
| Phase 4 | 別途 | 別途 | 別途 | — |

**前提:**
- 1 セッション 4 時間で 10-15 枚生産（テンプレ整備後）
- Gemini Imagen API: 1 generation 約 $0.04、平均 1 枚あたり 1-2 generation
- Keita のレビュー時間は含まず

---

## 4. リスク & 対策

| リスク | 影響 | 対策 |
|---|---|---|
| 日本語タイトルのフォントが環境依存で崩れる | 画像の手書き感が出ない | Figma でアウトライン化して書き出す or 画像から日本語を抜く |
| 量産で同じ図解パターンが多用される | 単調に見える | カテゴリ別モチーフ表 (スタイルガイド §6) で意図的に変化を付ける |
| Gemini 生成素材のスタイルが微妙にズレる | 統一感が崩れる | プロンプトを固定 (スタイルガイド §7.4)、Figma で線・色を後工程で揃える |
| 方針が固まる前に量産してまた作り直し | 過去 23 枚作り直し事例の再発 | **Phase 1 着手前に Keita 承認を必ず取る**（パイロット 2 枚で OK 出すか確認） |
| webp → svg で表示サイズが変わる | レイアウト崩れ | viewBox 比率を既存 webp と揃える (2:1 / 1:1)、CSS で `object-fit` 制御 |

---

## 5. ✅ Keita に決めてほしい 4 点

1. **【優先度: 高】 画像内に日本語タイトルを焼き込むか？**
   - 案 A (現状維持): 焼き込む → フォント依存・i18n 困難だが実装は楽
   - 案 B (推奨): 図解だけにして UI 側でタイトル重ねる → クリーンだが画像生成と UI 両方の調整が必要
   - 凜のおすすめ: **案 B** だが、Phase 0-1 は **案 A** で進めて、Phase 2 以降で案 B 検証

2. **【優先度: 高】 既存 SVG コースサムネ 25 枚を v2 に再生成するか？**
   - 案 A: そのまま維持 (現状で方針内) → Phase 1 スキップで時短
   - 案 B: v2 紙テクスチャ強化版に揃える → 統一感アップだが工数 +7h
   - 凜のおすすめ: **Phase 0 → Phase 2 → Phase 3 を先に終わらせて、Phase 1 は最後に判断**

3. **【優先度: 中】 ロールアウトの PR 戦略**
   - 案 A: Phase ごとに PR 1 本 (4 本) → レビュー単位が明確、安全
   - 案 B: 大きく 1-2 本にまとめる → マージ・デプロイ回数少
   - 凜のおすすめ: **Phase 0 と Phase 2 は別 PR**（Phase 2 は大きいので分割）

4. **【優先度: 中】 Phase 4 (アプリアイコン / ストア素材) を含めるか？**
   - アプリアイコンは別検討必要（iOS / Android 両方のサイズ要件、影なし背景必須等）
   - ストア素材も別レビュー必要（説明文との整合性）
   - 凜のおすすめ: **Phase 0-3 完了後に Phase 4 を別 task で起票**

---

## 6. 凜の次のアクション（Keita 承認待ち）

1. パイロット 2 枚を確認してもらう (`docs/handdrawn-pilot/course-{logic,critical}-01-v2.png` を Keita に見せる)
2. 「決めてほしい 4 点」の回答を待つ
3. 承認後、**Phase 0 から順次着手**（凜が SVG / Figma / Gemini を組み合わせて作業 → dev-logic に PR 引き継ぎ）

---

## 7. 参考リンク

- スタイルガイド: `docs/HANDDRAWN_STYLE_GUIDE.md`
- パイロット SVG: `docs/handdrawn-pilot/course-logic-01-v2.svg`, `course-critical-01-v2.svg`
- パイロット PNG: `docs/handdrawn-pilot/*.png`
- Figma マスター: https://www.figma.com/design/WWW1jdNEe90B01jo4Myo2t
- 既存スタイル参考: `public/images/v3/course-logic-01.svg`, `course-critical-01.svg`
- 古い THUMBNAILS_MANIFEST: `docs/THUMBNAILS_MANIFEST.md` (Pixa 時代、要更新)
