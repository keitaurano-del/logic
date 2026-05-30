# UI 刷新アセット — 手描きアクセント素材 & 見出し書体（T9 / B1）

作成: 2026-05-29 / 担当: designer（凜）
ステータス: 試作・提案（実装は dev-logic。アプリコードには未反映）
親方針: `docs/UI_RENEWAL_DIRECTION_20260529.md`（推奨方針 A = エディトリアル × 手描き図解）
関連: feedback_logic_course_thumbnails（手書き+図解トーン）、feedback_logic_lesson_visual_hybrid（本文の視覚化）

Figma マスター: https://www.figma.com/design/JygulLqSk3hbZum4Y2mkdP
- ページ1 「1 · Handdrawn Accents」= 手描きアクセント素材セット（16種）
- ページ2 「2 · Display Type Sample」= 見出し書体サンプル（Shippori Mincho + Noto Sans JP）

このドキュメントが実装用 SVG の正本。Figma はビジュアル承認・トーン確認用。dev-logic は下記 path をそのまま `src/icons` / `public/images` に展開してよい。

---

## (1) 手描きアクセント素材セット（T9）

### 設計方針

- すべて単色 stroke のみ（fill なし）。実装時は SVG の `stroke` を `currentColor` に置換し、CSS の `color: var(--accent)` 等でテーマ追従させる。
- 直書き hex（`#F36356` coral）は「素材定義の source」としてのみ使う。アプリに載せるときは hex を残さず currentColor 化する（方針の制約: 色は CSS 変数追従、直書き hex 禁止）。
- 線は `stroke-width="5"`（marker 風）、`stroke-linecap="round"` `stroke-linejoin="round"`。サイズ調整は viewBox 維持のまま CSS width/height で。本文インラインに使う小サイズでは線が太く見えるので、その用途では stroke-width を 3〜3.5 に下げたバリアントを用意する。
- bezier を意図的に不均一にして手描きの揺れを出す（直線・正円は使わない）。コースサムネの Caveat + coral 下線トーンと同じ世界観。
- 子供っぽくならないよう、装飾過多な星・ハートは不採用。star は4点 sparkle に崩した。

### 素材一覧（16種）

カテゴリ別。`name` は実装時のファイル名/キー候補（小文字+ハイフン、feedback_logic_lesson_visual_hybrid のアイコン命名規則に合わせる）。

#### 下線系（見出し強調・キーワード強調）

`underline-single` — 見出し直下の基本下線。一番出番が多い。
```svg
<svg viewBox="0 0 240 40" xmlns="http://www.w3.org/2000/svg"><path d="M8 26 C 60 18, 110 30, 162 22 S 220 18, 232 24" stroke="currentColor" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
```

`underline-double` — 二重下線。より強い強調・章タイトル向け。
```svg
<svg viewBox="0 0 240 48" xmlns="http://www.w3.org/2000/svg"><path d="M8 20 C 60 13, 120 25, 232 17" stroke="currentColor" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 34 C 70 29, 130 39, 226 31" stroke="currentColor" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
```

`underline-scribble` — 走り書き下線。カジュアルな強調・空状態の見出し向け。
```svg
<svg viewBox="0 0 240 44" xmlns="http://www.w3.org/2000/svg"><path d="M10 30 C 50 18, 70 34, 110 22 S 170 34, 200 22 220 28 232 24" stroke="currentColor" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
```

#### 囲み系（要素の囲み・強調枠）

`frame-circle` — 手描きの楕円囲み。1単語・1数字を丸で囲む強調。
```svg
<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg"><path d="M40 22 C 90 8, 165 12, 182 48 C 196 80, 150 108, 96 108 C 40 108, 8 86, 12 54 C 15 30, 30 22, 60 18" stroke="currentColor" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
```

`frame-box` — 手描きの四角囲み。短いフレーズ・ラベルの囲み。
```svg
<svg viewBox="0 0 220 120" xmlns="http://www.w3.org/2000/svg"><path d="M16 24 C 80 16, 150 20, 206 18 M204 16 C 210 50, 208 80, 206 102 M208 100 C 150 110, 70 104, 18 106 M16 104 C 10 70, 12 46, 14 22" stroke="currentColor" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
```

#### 矢印系（誘導・関係づけ・ロードマップ）

`arrow-right` — 横方向の手描き矢印。「A → B」の関係、CTA 誘導。
```svg
<svg viewBox="0 0 220 80" xmlns="http://www.w3.org/2000/svg"><path d="M12 44 C 70 36, 130 50, 196 40" stroke="currentColor" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M176 22 C 188 30, 196 38, 200 40 C 194 46, 186 56, 178 66" stroke="currentColor" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
```

`arrow-curved` — 曲がる矢印。注釈から要素を指す・補足の引き出し。
```svg
<svg viewBox="0 0 200 120" xmlns="http://www.w3.org/2000/svg"><path d="M24 22 C 14 64, 60 100, 150 92" stroke="currentColor" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M128 76 C 140 84, 150 90, 156 92 C 148 98, 140 106, 134 114" stroke="currentColor" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
```

`arrow-down` — 縦方向の矢印。ロードマップのステップ降下・縦の流れ。
```svg
<svg viewBox="0 0 80 120" xmlns="http://www.w3.org/2000/svg"><path d="M40 14 C 36 50, 44 80, 40 104" stroke="currentColor" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M20 84 C 30 94, 36 100, 40 106 C 46 100, 54 92, 62 82" stroke="currentColor" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
```

#### マーク系（チェック・印・装飾）

`mark-check` — 手描きチェック。完了・正解・良い例マーカー（本文 good 用の手描きバリアント）。
```svg
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M22 54 C 30 62, 36 70, 44 80 C 56 56, 70 34, 86 18" stroke="currentColor" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
```

`mark-cross` — 手描きバツ。誤り・悪い例マーカー（check と対で使う）。
```svg
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M24 22 C 40 40, 58 60, 78 80" stroke="currentColor" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M78 22 C 60 42, 42 60, 22 80" stroke="currentColor" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
```

`mark-circle-dot` — 手描きの小さな丸。箇条書きの bullet・チェックリストの○。
```svg
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M40 16 C 70 14, 90 36, 84 60 C 78 84, 44 90, 26 74 C 10 60, 16 26, 46 18" stroke="currentColor" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
```

`mark-sparkle` — 4点の手描ききらめき。達成・新着・ハイライト（旧 🎉✨ 絵文字の SVG 置換候補。方針 A5 / T5）。
```svg
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M50 14 C 54 36, 58 44, 80 50 C 58 56, 54 64, 50 86 C 46 64, 42 56, 20 50 C 42 44, 46 36, 50 14 Z" stroke="currentColor" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
```

#### 区切り・補助系

`wave-divider` — 波線の区切り。セクション間の hairline 代替・装飾区切り。
```svg
<svg viewBox="0 0 240 40" xmlns="http://www.w3.org/2000/svg"><path d="M8 22 C 28 8, 48 36, 68 22 C 88 8, 108 36, 128 22 C 148 8, 168 36, 188 22 C 208 8, 228 16, 232 20" stroke="currentColor" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
```

`bracket-heading-tick` — 見出し左肩の鉤括弧。セクション見出しの前置きマーク。
```svg
<svg viewBox="0 0 240 56" xmlns="http://www.w3.org/2000/svg"><path d="M14 12 C 12 24, 13 36, 16 44" stroke="currentColor" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/><path d="M14 12 C 60 8, 130 9, 226 7" stroke="currentColor" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
```

`lines-list-hint` — 3本の手描き線。空状態の「ここに項目が並びます」プレースホルダ挿絵。
```svg
<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M16 30 C 40 26, 70 24, 88 26 M16 50 C 40 46, 64 45, 80 47 M16 70 C 36 67, 52 66, 64 68" stroke="currentColor" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
```

`callout-speech` — 手描きの吹き出し。ヒント・気づきの装飾枠（本文 :::tip の挿絵的アクセント）。
```svg
<svg viewBox="0 0 200 130" xmlns="http://www.w3.org/2000/svg"><path d="M28 18 C 100 10, 178 14, 184 50 C 188 78, 160 92, 96 92 L70 92 L48 116 L52 90 C 24 84, 12 66, 14 46 C 16 28, 18 22, 34 18" stroke="currentColor" stroke-width="5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>
```

---

## (2) 見出し書体 — 推奨1案

### 推奨: 和文セリフ系 = Shippori Mincho（見出し）+ Noto Sans JP（本文）

「欧文ディスプレイ + 和文サンセリフ」ではなく「和文セリフ（明朝）見出し」を推奨する。

#### 根拠

1. 日本語見出しが主役。Logic の見出し（ホーム挨拶・画面タイトル・セクション見出し・コース/レッスン title）はほぼ日本語。欧文ディスプレイを足しても、肝心の日本語が Noto Sans 700 のまま＝抑揚が出ない。効くのは和文側を変えること。
2. 明朝の縦横コントラストが「読み物・教科書・知的」のトーンを直接作る。これは方針 A の「教科書の余白メモのような知的で親しみある空気感」、サムネ路線と同じ世界観。
3. 手描きアクセント（coral）と役割が分かれる。手描き＝余白の人間味、明朝＝本文の品格。両方を別レイヤーで効かせるので画面が散らからない。欧文ディスプレイ見出し＋手描き＋本文だと装飾が三つ巴になり過剰。
4. 現状の課題（Noto Sans JP 700 一辺倒＝SaaS/AI 感）に最短で効く。フォント1本の追加で見出し全体のトーンが変わる。

代替として「欧文ディスプレイ（Fraunces 等）+ Noto Sans JP」も検討したが、(a) 日本語見出しに効かない、(b) サムネの Caveat と用途が被り世界観が割れる、(c) 英数字だけ浮く、の3点で非推奨。Caveat（手書き）はサムネ専用に閉じ、アプリ UI 見出しには使わない（手描きはアクセント素材で担保する）。

#### 書体選定

- 見出し: Shippori Mincho（しっぽり明朝）Bold / Medium。Google Fonts。現代的で線が締まった明朝で、Noto Serif JP より UI で軽快・親しみがある。Zen Old Mincho はより古典的で円茶会寄り、Logic には Shippori がちょうど良い。
- 本文: Noto Sans JP Regular / Bold（既存のまま）。本文は読みやすさ優先で sans 維持。
- 英数字: 見出し内の英数字も Shippori Mincho に含まれるが、必要なら Inter Tight を併用可（既存資産）。

#### type scale（提案）

| 役割 | 書体 | サイズ | 用途 |
|---|---|---|---|
| Display | Shippori Mincho Bold | 30px | ホーム挨拶・最上位見出し |
| Title | Shippori Mincho Bold | 24px | 画面タイトル（ロードマップ等） |
| Section | Shippori Mincho Medium | 20px | セクション見出し |
| Body | Noto Sans JP Regular | 16px | 本文 |
| Caption | Noto Sans JP Regular | 13px | 補足・キャプション |

現状の greeting 20px/700 → カード見出し 19px/700 の「差が無く平坦」（方針 1-2 指摘）を、Display 30px 明朝 → Section 20px 明朝 → Body 16px sans の明確な階層に置き換える。

#### Web フォント読み込みコスト（モバイル専用なので軽さ重視）

- 和文フルセットは重い（Shippori Mincho 全ウェイトで数 MB）。見出し限定運用なので以下で抑える:
  1. ウェイトは Bold + Medium の2つだけ読む（Regular は本文 sans が担うので不要）。
  2. Google Fonts の `&text=` サブセット、または使用文字を抽出した self-host サブセットを作る。見出しに出る文字種は限られる（title 群・挨拶バリエーション）ので、動的文言（ユーザー名等）が見出しに無ければ静的サブセットが現実的。
  3. `font-display: swap` で FOIT 回避。明朝が落ちたら Noto Sans JP にフォールバック（見た目は崩れるが読める）。
  4. 段階導入: まず Display / Title（数の少ない最上位見出し）だけ明朝化し、効果と体重を見てから Section へ広げる。方針ロードマップの「第1弾は装飾削減＋タイポから、手描きは段階導入」と整合。
- CSS 変数 `--font-display: 'Shippori Mincho', 'Noto Serif JP', serif;` を tokens.css に定義（B1 = T6）。本文は既存の sans 変数のまま。

---

## (3) 実装時の使い方（dev-logic 向け）

### 手描きアクセント SVG

- 配置先候補:
  - 単独アイコン的に使うもの（mark-check / mark-cross / mark-sparkle / mark-circle-dot / lines-list-hint）→ `src/icons/index.tsx` に React コンポーネントとして追加。`stroke="currentColor"` にして `color` で着色。
  - 見出し装飾・大きめの線（underline-* / frame-* / arrow-* / wave-divider / bracket-heading-tick / callout-speech）→ `public/images/accents/*.svg` に置き、`background-image` や `<img>`/`mask` で使うか、装飾用 React コンポーネント化。
- currentColor 運用: SVG の `stroke="currentColor"` を維持し、親要素で `color: var(--accent)`（or `--brand` 等テーマ変数）を当てる。直書き hex は残さない。
- 下線の当て方: 見出し要素に `position: relative`、下線 SVG を `::after` 相当の絶対配置 or 直後の装飾 span に。幅は見出し幅に追従させる（SVG は viewBox なので `width: 100%` で伸縮可、preserveAspectRatio に注意）。
- インライン小サイズ用: 本文に混ぜる場合は stroke-width を 3〜3.5 に落としたバリアントを別途用意（5px だと小さい時に潰れる）。feedback_logic_lesson_visual_hybrid の `[icon:name]` 記法に乗せるなら正準名（good/bad/point 等）との対応を決める。
- UI chrome の絵文字置換（方針 T5 / A5）: `🎉`→`mark-sparkle`、`✨`→`mark-sparkle`、`🔥`(streak)→既存 FlameIcon 維持 or 手描き化は別途検討、`★`→`mark-sparkle` or 既存 star icon。

### 見出し書体

- `tokens.css` に `--font-display` を追加（T6 / B1）。`@font-face` or Google Fonts link で Shippori Mincho Bold/Medium を読む（サブセット必須）。
- 見出しコンポーネント（画面タイトル・section heading）の `font-family` を `--font-display` に。本文は触らない。
- type scale を token 化（`--fs-display: 30px` 等）し、各画面の inline `fontSize:20/700` 直書きを置換（HomeScreenV3 の inline style 移管 = T8 と同時にやると効率的）。

### 注意・制約遵守

- UI chrome は絵文字不可・SVG のみ（レッスン本文のみハイブリッド例外）。手描きアクセントはこの SVG 化の受け皿になる。
- 色は CSS 変数追従・直書き hex 禁止。SVG は currentColor、本ドキュメントの hex は source のみ。
- モバイル専用。和文明朝はサブセット化で軽量に。段階導入。
- これは試作・提案。実機展開はサンプル承認フロー（feedback_logic_course_thumbnails）に従い、Keita 承認後にカテゴリ/画面単位で。

---

## 確定パラメータ（再現用）

- accent stroke color source: `#F36356`（coral / アプリでは currentColor 化）
- stroke-width: 5（大）/ 3〜3.5（インライン小）、linecap/linejoin: round
- 見出し書体: Shippori Mincho（Bold 30/24・Medium 20）/ 本文: Noto Sans JP（Regular 16・Caption 13）
- font 変数案: `--font-display: 'Shippori Mincho', 'Noto Serif JP', serif;`
- Figma マスター: https://www.figma.com/design/JygulLqSk3hbZum4Y2mkdP（P1=アクセント16種, P2=書体サンプル）
