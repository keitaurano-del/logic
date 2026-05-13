# Logic 全画像 手書きスタイル化 — ロールアウト計画

**最終更新:** 2026-05-13
**担当:** designer (凜)
**前提:** `docs/HANDDRAWN_STYLE_GUIDE.md` を読んでいること
**現行マスター:** `public/images/v3/course-*.png`（Figma v4 製、26 コース分）

---

## ⚠️ 旧版（2026-05-12）からの大幅修正

旧版（2026-05-12 作成、PR #154）には以下の誤った前提があった:

> - 既存 25 枚の SVG コースサムネ = 「手書きスタイル化済み」
> - パイプラインは SVG 直書き＋紙テクスチャ強化版（v2 SVG）に順次差し替え

これに基づいた PR #156（`courseData.ts` の `.png → .svg` 巻き戻し）が
**コースサムネ 26 枚を旧スタイルにデグレさせる事故** を起こし、本 PR で revert + 計画見直し。

**修正後の正解:**
- コースサムネのマスターは **Figma 制作 → PNG 書き出し**（PR #140 で v4 として確立）
- 既存の `course-*.svg`（インラインで turbulence filter 使用）は **legacy。新規制作には使わない**
- 「Phase 1 = 既存 SVG を v2 SVG に再生成」は **不要 / 廃止**（v4 PNG で目的達成済み）

---

## TL;DR (Keita が戻った時に最初に読む)

- **Logic アプリの画像は 89 ファイル**（`public/images/v3/` 配下）。
- うち **手書きスタイル化済みは 26 枚**（v4 PNG コースサムネ、PR #140 で投入）。
- 残り **約 60 枚** が方針外スタイル（ダーク背景レッスンサムネ・写実 webp ヒーロー）。Phase 2-3 で差し替え。
- **コースサムネ Phase 1 は実質完了**（v4 PNG として）。再生成不要。
- **Figma マスターファイル:** https://www.figma.com/design/2SJYbSyMbBlSOyd3DJzbUc （v4 制作時に使用）
- **推奨パイプライン:** Figma 制作 → PNG/WebP 書き出し → `public/images/v3/` 配置 → `courseData.ts` / `lessonSlides.ts` で参照
- **次のアクション:** Phase 2（レッスンサムネ）が最大ボリューム。着手前に Keita 承認 + サンプル 1 枚確認。

---

## 1. 現状インベントリ

`public/images/v3/` 配下、合計 **89 ファイル**。

| 種別 | ファイル数 | フォーマット | 現状スタイル | 評価 |
|---|---|---|---|---|
| **コースサムネ (v4 PNG)** | **26** | **PNG** | **Figma 手書き notebook + 図解** | **✅ マスター（現行）** |
| コースサムネ (legacy SVG) | 26 | SVG | インライン手書き風 + filter 揺らぎ | ⚠️ legacy、参照しない |
| コースサムネ (WebP) | 6 | WebP | 写実的人物写真・夜景オフィス | ❌ 方針外（v4 PNG にリダイレクト済） |
| レッスンサムネ (numeric) | 41 | WebP | ダーク背景 + クリーンベクター | ❌ 方針外 |
| レッスンサムネ (named) | 8 | WebP | 同上 | ❌ 方針外 |
| ホーム / ヒーロー | 4 | WebP | ダーク背景 + 写実写真 | ❌ 方針外 |
| その他 (fermi-card.png) | 1 | PNG | レガシー、要確認 | ⚠️ 個別判断 |
| ストア / アプリアイコン | 別管理 | PNG | — | ⚠️ Phase 4 で別途検討 |

**新規制作が必要なファイル数: 約 53 枚** = 41 (numeric) + 8 (named) + 4 (home/hero)

### 1.1 コースサムネ — マスター v4 PNG 一覧（編集禁止 / 再生成は Figma 経由）

```
course-analogy-01.png        course-case-01.png
course-client-01.png         course-client-02.png
course-client-03.png         course-client-04.png
course-critical-01.png       course-critical-02.png
course-design-01.png         course-eastern-01.png
course-eastern-02.png        course-fermi-01.png
course-hypothesis-01.png     course-lateral-01.png
course-logic-01.png          course-logic-02.png
course-numeracy-01.png       course-peak-performance-01.png
course-philosophy-01.png     course-problem-01.png
course-proposal-01.png       course-proposal-course-01.png
course-strategy-01.png       course-strategy-02.png
course-systems-01.png        course-whywhy-01.png
```

**スタイル:** クリーム notebook 背景 + ruled lines、Caveat 手書き英字タイトル + 朱赤下線、
Noto Sans JP Light 日本語サブタイトル、カテゴリ別 23 種の図解（logic-tree / pyramid /
5-whys / iceberg / fermi-eq / dialectic / 4 sages / 5 forces / bar-chart 等）、
右上に手書き電球アイコン。

**判断:** 26 枚すべて方針内。**再生成不要**。
新コース追加時は Figma マスターから複製 → PNG 書き出しで生成。

### 1.2 legacy SVG（参照しない）

`course-*.svg` は #140 以前の暫定スタイル。インライン SVG で turbulence filter による
擬似手書き感 + 文字情報詰め込みすぎ。`courseData.ts` 等から参照しないこと。
ファイル自体は履歴参照のため残置するが、削除候補。

### 1.3 差し替え必須 レッスンサムネ (41 + 8 = 49 枚)

数字 ID 付き (現存):
```
lesson-20, 21, 22, 23, 24, 25, 26, 27, 28, 29,
lesson-35, 36, 40, 41, 42, 43,
lesson-50, 51, 52, 53, 54, 55, 56, 57, 58, 59,
lesson-60, 61, 62, 63, 64, 65, 66, 67, 68, 69,
lesson-70, 71, 72, 73, 74, 75, 76, 77
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

### Phase 1: コースサムネ統一 — ✅ **完了（PR #140）**

v4 PNG として 26 コース分をマスターに昇格。`courseData.ts` の参照は全て `.png`。
**追加作業不要**（PR #156 のような巻き戻しを再発させないこと）。

### Phase 2: レッスンサムネ全差し替え (3 日、最大ボリューム)
**目的:** ダーク背景レッスンサムネ 49 枚を撲滅

サブ Phase:
- **Phase 2a (8 枚):** 名前付きレッスン (lesson-analogy 等) — 各カテゴリ代表画像、優先度高
- **Phase 2b (10-15 枚):** Phase 2a と類似のカテゴリ代表（lesson-20 系 = MECE / ツリー / So What 等）
- **Phase 2c (残り):** 個別レッスンサムネ

**所要:** 49 × 18 分（レッスンサムネは 1:1 でシンプルなので速い）= **約 15 時間 (2 日)**

**運用方針:**
- v4 コースサムネと同じ notebook トーンで統一（クリーム背景・Caveat・図解）
- 1 カテゴリ 1 モチーフでまとめる（例: 仮説思考 = 全部「矢印 → ターゲット」のバリエーション）
- 文字焼き込みなし、図解のみで OK
- 数字 ID は廃止して named ファイル (`lesson-mece.png` 等) に統一する案も検討

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

**所要:** Phase 2-3 完了後に詳細スコープ確定。ストア素材は別 OS 要件があるので注意。

---

## 3. 工数 & コスト見積

| Phase | 枚数 | 所要時間 | 状態 |
|---|---|---|---|
| Phase 1 (コースサムネ) | 26 | — | ✅ 完了 (#140) |
| Phase 2 (レッスンサムネ) | 49 | 約 15h | 未着手 |
| Phase 3 (ホーム / ヒーロー) | 4 | 2h | 未着手 |
| **小計 (Phase 2-3)** | **53** | **約 17h** | — |
| Phase 4 (ストア / アプリアイコン) | 別途 | 別途 | スコープ未確定 |

---

## 4. リスク & 対策

| リスク | 影響 | 対策 |
|---|---|---|
| **計画書と実態のズレで巻き戻しが発生** | 過去マージのデグレ事故 | 本ファイルを **Figma 制作物の更新時に必ず追従更新**。docs と現実を乖離させない |
| 日本語タイトルのフォントが環境依存で崩れる | 画像の手書き感が出ない | Figma でアウトライン化して書き出す or 画像から日本語を抜く |
| 量産で同じ図解パターンが多用される | 単調に見える | カテゴリ別モチーフ表 (スタイルガイド §6) で意図的に変化を付ける |
| 方針が固まる前に量産してまた作り直し | 過去 23 枚作り直し事例の再発 | **Phase 2 着手前に Keita 承認を必ず取る**（サンプル 1-2 枚で OK 出すか確認） |
| webp → png で表示サイズが変わる | レイアウト崩れ | viewBox 比率を既存 webp と揃える、CSS で `object-fit` 制御 |

---

## 5. 凜の次のアクション

1. **Phase 2a サンプル 1 枚** を Figma で制作（lesson-analogy 等）
2. Keita 承認後、**Phase 2 を順次着手**
3. Phase 2 完了後に Phase 3 → Phase 4 の順で進める

---

## 6. 参考リンク

- スタイルガイド: `docs/HANDDRAWN_STYLE_GUIDE.md`
- v4 マスター Figma: https://www.figma.com/design/2SJYbSyMbBlSOyd3DJzbUc
- v4 PNG: `public/images/v3/course-*.png`（26 枚）
- legacy SVG: `public/images/v3/course-*.svg`（参照しない）
- 古い THUMBNAILS_MANIFEST: `docs/THUMBNAILS_MANIFEST.md` (Pixa 時代、要更新)
- 関連 PR: #140 (v4 PNG 投入), #156 (誤巻き戻し), #157 (#156 の revert)
