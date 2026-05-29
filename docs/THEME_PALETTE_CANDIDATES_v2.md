# THEME_PALETTE_CANDIDATES_v2 — 背景テーマ改修 (T-I / T-J) 配色スペック

作成: 2026-05-29 / designer
対象: Logic 外観設定の背景テーマ (MODES)。`src/theme.ts` の `MODES` と `src/styles/tokens.css` の `body.theme-v3.mode-{id}` セレクタ。
実装は dev-logic に引き継ぐ前提。本ドキュメントは「コードを書かず、配色スペックと根拠」を渡すもの。

全コントラスト比は WCAG 2.x 相対輝度式（既存 `theme.ts` の `luminance()` と同式）で算出。本文 = AA 4.5:1 基準、UI/縁取り = 3:1 基準。

---

## 0. サマリ（結論先出し）

### 残すテーマ（4）
`light` / `dark` / `sepia`（古紙） / `forest`（深緑）。

### 削除（4）
`enterprise` / `startup` / `custom` / `mono`。

### 新規追加（3） — 「AIっぽくない」アナログ系
| id | 系統 | トンマナ | 一言 |
|---|---|---|---|
| `indigo` | dark | 藍染め・夜の紙 | 量産SaaSの紺×シルバー(enterprise)を、藍染め布のくすんだ青に置換 |
| `rose` | light | ダスティローズ・くすみ赤紫 | クリーンミント(startup)を、退色したインク/ドライフラワーの温かみに置換 |
| `slate` | light | エディトリアル・印刷物のスレートティール | 無機質モノクロ(mono)を、新聞/紙面の青灰インクに置換 |

light/dark バランス: 残す4は light×2(light,sepia) / dark×2(dark,forest)。新規は dark×1(indigo) + light×2(rose,slate) → 合計 light4 / dark3。暖色(sepia,rose) / 寒色(light,dark,indigo,slate) / 緑(forest) と色相も散る。

### 習熟色（T-J）
**結論: テーマ追従の派生色(accent-dark)ではなく、全テーマ共通の固定ゴールドを推奨。** ただし「明カード用 #D9A943 / 暗カード用 #9A7416」の2値で持つ（1値だと暖色 light テーマでカードAAを割るため）。さらに色だけに頼らず形状(冠アイコン/リング)で二重符号化する。詳細は §3。

---

## 1. 既存4テーマのコントラスト監査

`src/styles/tokens.css` / `src/theme.ts` の実トークンで実測。

### 1-1. light (`body.theme-v3.mode-light`)
- 本文 text on bg: `#0D1220` on `#EEF1FA` = **16.54:1** AA OK
- accent(=`--brand` #2E45A8) on card(white): **8.29:1** AA OK（テキスト/アイコン用途）
- accent-fg on accent ボタン: ここが問題。`--accent: var(--brand)` だが mode-light は `--brand: #2E45A8` に上書きしつつ `--accent` はその前に `var(--brand)`(=この時点では未上書きの解決順)を参照する設計が紛らわしい。実機で塗られる accent ボタンは `--accent` の解決値依存。
  - もし accent ボタン背景が **#6C8EF5**（明るい brand-light 側）になっている場合: 白文字で **3.08:1 → 本文AA未達**（UIラージで辛うじて）。
  - accent ボタン背景が **#2E45A8** なら白文字 **8.29:1** で OK。
- **指摘/修正提案**: light の `--accent-fg` は `#FFFFFF` ハードコード。accent ボタン塗り色が #6C8EF5 系で確定描画されている箇所があれば AA 未達。
  - 修正案: light の accent ボタン塗りは `--brand-hover` (#2E45A8) に固定する（白文字 8.29:1）。明るい #6C8EF5 はグラデ装飾用に留め、ベタ塗りCTAには使わない。あるいは accent-fg を auto-pick に通す（#6C8EF5 なら黒 #1A1A1A が選ばれ 5.66:1 で AA）。**白文字を保つなら塗りを #2E45A8 に寄せるのが推奨**（ブランド一貫性とAA両立）。

### 1-2. dark (`body.theme-v3.mode-dark` および `.mode-dark`)
- 本文 text on bg: `#E8ECF4` on `#1A1F2E` = **13.86:1** AA OK
- 本文 text on card: on `#252C40` = **11.72:1** AA OK
- accent(#6C8EF5) on card: **4.51:1** AA OK（テキスト用途ギリOK）
- accent-dark(リンク #9BB3FA) on card: **6.76:1** AA OK
- accent-fg(#FFFFFF) on accent ボタン #6C8EF5: **3.08:1 → 本文AA未達**（UIラージのみ）
- **指摘/修正提案**: dark の accent ボタン白文字 3.08:1 は light と同じ構造問題。
  - 修正案A（推奨）: accent-fg を auto-pick に委ねる → #6C8EF5 には黒 #1A1A1A(5.66:1) が選ばれAA。ただしダークUIで明るい青ボタンに黒文字は意匠的に重いので、
  - 修正案B: ボタン塗りを一段濃い #5478E8 系に。`#FFFFFF` on `#5478E8` を要再計算（およそ 3.7〜4:1、まだ厳しめ）。
  - 修正案C（最も堅い）: ボタン塗りを `--brand-hover`/`#2E45A8` 相当の濃紺にして白文字 8.29:1。
  - 実害度: 大きな白テキストCTAなら 3.08:1 でも UIラージAA(3:1) は満たすので「即修正必須の重大バグ」ではないが、小さめのボタンラベル・本文級サイズでは未達。**accent ボタンのラベル font-size が 18px 未満（または 14px bold 未満）の箇所があれば修正対象。**

### 1-3. sepia (`body.theme-v3.mode-sepia`)
- 本文 text on bg: `#3A2F23` on `#F4ECDD` = **11.11:1** AA OK
- 本文 text on card: on `#FBF6EC` = **12.10:1** AA OK
- text-secondary on bg: `#6B5C49` on `#F4ECDD` = **5.50:1** AA OK
- accent(#B25C3A) on card: **4.35:1 → 本文AA未達**（UIラージOK）。tokens.css コメントで認識済み、テキスト用途は accent-dark #A8542F(**4.91:1** AA OK) を使う運用。
- accent-fg(#FFFFFF) on accent ボタン #B25C3A: **4.68:1** AA OK
- **指摘**: 既に対処済み（テキストは accent-dark を使う）。新規修正不要。accent をベタ塗りボタン以外（テキストリンク/アイコン）に使う箇所が無いか実装側で確認だけ推奨。

### 1-4. forest (`body.theme-v3.mode-forest`)
- 本文 text on bg: `#E4EDE6` on `#10221B` = **13.86:1** AA OK
- 本文 text on card: on `#173026` = **11.80:1** AA OK
- text-secondary on bg: `#A6C2B2` on `#10221B` = **8.67:1** AA OK
- accent(#6FB89A) on card: **6.05:1** AA OK
- accent-fg(#0B1813) on accent ボタン #6FB89A: **7.80:1** AA OK
- **指摘**: 問題なし。AA 全クリア。最も健全なテーマ。

### 監査結論
- forest / sepia は OK（sepia は既に accent-dark 運用で対処済み）。
- **light / dark の「白文字 on 明るい青 accent ボタン」が共通の弱点**（3.08:1）。小サイズボタンで未達。dev-logic に「accent ボタンの塗りを濃い青(#2E45A8系)に寄せる or accent-fg を auto-pick に通す」修正を依頼するのが望ましい。これは新テーマ実装と同時に直すと一括QAできる。

---

## 2. 新規3テーマ 完全スペック

各 id について tokens.css セレクタ用トークンと theme.ts preview を両方出す。`accentSoft`/`accentGlow` は rgba、`accentDark` は accent の暗め(light系)/明るめ(dark系)、`accent-fg` は auto-pick 想定値。

### 2-A. `indigo` — 藍染め（dark系 / premium）

狙うトンマナ: 藍染め布・夜に開いた古い紙。量産コーポレートの「紺×シルバー(enterprise)」が持つ冷たい無機質さを、布のムラ感のある くすんだ藍 + 温かいオフホワイト文字で人間味に振り替える。シルバーのメタリック感を排し、彩度低めの indigo に紙色(#E7E3D8 ＝ ニュートラルでなく僅かに暖色のアイボリー)を乗せるのがミソ。

tokens.css (`body.theme-v3.mode-indigo`):
| token | 値 | 備考 |
|---|---|---|
| bg (--bg-primary) | `#161E2B` | 藍の夜 |
| --bg-secondary | `#1A2333` | |
| card (--bg-card) | `#1E2738` | |
| --bg-elevated | `#26324A` | |
| --bg-tertiary | `#1A2333` | |
| text (--text-primary) | `#E7E3D8` | 暖色寄りアイボリー（純白を避けてアナログ感） |
| --text-secondary | `#A9B4C9` | |
| --text-muted | `#7E8BA6` | |
| accent | `#8FA9D6` | くすみ藍（明色側＝dark上で読める） |
| accentSoft | `rgba(143,169,214,0.16)` | |
| accentGlow | `rgba(143,169,214,0.25)` | |
| accentDark | `#A9BFE2` | dark系なので「明るめ」が link/hover に効く |
| accent-fg | `#0F1622` | auto-pick → 暗い藍紺（accent上 7.61:1） |

theme.ts preview: `{ bg: '#161E2B', card: '#1E2738', text: '#E7E3D8', accent: '#8FA9D6' }`
THEME_COLOR_BY_MODE: `#161E2B`

name/desc:
- ja name: `藍`  / ja desc: `藍染めのような、落ち着いた夜の青`
- en name: `Indigo` / en desc: `Muted indigo, like dyed cloth at night`

コントラスト:
- text on bg: **13.05:1** / text on card: **11.68:1** / text-sec on bg: **8.02:1**
- accent on card: **6.28:1** / accent-fg on accent: **7.61:1** / accent-dark on card: **8.01:1** — 全AA。

---

### 2-B. `rose` — ダスティローズ（light系 / premium）

狙うトンマナ: 退色したインク・ドライフラワー・古い恋文。クリーンで彩度高めのミント(startup)が放つ「AI生成SaaSの清潔すぎる無機質」を、くすんだ赤紫ローズ + 暖色オフホワイトの紙でアナログな温かみに。sepia(赤茶)と違い赤紫(マゼンタ)寄りにして色相を分離。

tokens.css (`body.theme-v3.mode-rose`):
| token | 値 | 備考 |
|---|---|---|
| bg (--bg-primary) | `#F3E8E4` | ほんのり桃を含むオフホワイト |
| --bg-secondary | `#ECDCD7` | |
| card (--bg-card) | `#FBF3F0` | |
| --bg-elevated | `#FFFAF8` | |
| --bg-tertiary | `#E4D0CA` | |
| text (--text-primary) | `#3A2A28` | 焦げ茶赤（黒を避け温度感） |
| --text-secondary | `#6E5550` | |
| --text-muted | `#8E726C` | |
| accent | `#A65466` | ダスティローズ（赤紫くすみ） |
| accentSoft | `rgba(166,84,102,0.12)` | |
| accentGlow | `rgba(166,84,102,0.22)` | |
| accentDark | `#8E4054` | light系なので「暗め」＝link/テキスト用 |
| accent-fg | `#FFFFFF` | auto-pick → 白（accent上 5.15:1） |

theme.ts preview: `{ bg: '#F3E8E4', card: '#FBF3F0', text: '#3A2A28', accent: '#A65466' }`
THEME_COLOR_BY_MODE: `#F3E8E4`

name/desc:
- ja name: `ローズ` / ja desc: `くすんだ薔薇色の、柔らかな暖かみ`
- en name: `Dusty Rose` / en desc: `Faded rose tones, soft and warm`

コントラスト:
- text on bg: **11.33:1** / text on card: **12.44:1** / text-sec on bg: **5.68:1**
- accent on card: **4.70:1**（本文AOK） / accent-fg(白) on accent: **5.15:1** / accent-dark on card: **6.37:1** — 全AA。

---

### 2-C. `slate` — スレートティール / エディトリアル（light系 / premium）

狙うトンマナ: 新聞・本の紙面・青灰のインク。完全無彩色のモノクロ(mono)が持つ「テンプレ感・冷たさ」を、ごく僅かに緑を含む青灰(スレートティール)で「印刷物の知的なくすみ」に。bg は紙の白だが純白でなく僅かにグレー。accent はティール寄りスレートで、blue系(light/dark/indigo)とも緑系(forest)とも被らない中間色。

tokens.css (`body.theme-v3.mode-slate`):
| token | 値 | 備考 |
|---|---|---|
| bg (--bg-primary) | `#ECECEA` | 紙のオフホワイトグレー |
| --bg-secondary | `#E3E4E2` | |
| card (--bg-card) | `#FBFBFA` | |
| --bg-elevated | `#FFFFFF` | |
| --bg-tertiary | `#D9DAD8` | |
| text (--text-primary) | `#1E242B` | インク（青みを含む濃灰） |
| --text-secondary | `#54606B` | |
| --text-muted | `#76808A` | |
| accent | `#3E6B70` | スレートティール |
| accentSoft | `rgba(62,107,112,0.12)` | |
| accentGlow | `rgba(62,107,112,0.22)` | |
| accentDark | `#2E565A` | light系なので暗め＝link/テキスト用 |
| accent-fg | `#FFFFFF` | auto-pick → 白（accent上 5.93:1） |

theme.ts preview: `{ bg: '#ECECEA', card: '#FBFBFA', text: '#1E242B', accent: '#3E6B70' }`
THEME_COLOR_BY_MODE: `#ECECEA`

name/desc:
- ja name: `スレート` / ja desc: `紙面のような、青灰インクの落ち着き`
- en name: `Slate` / en desc: `Slate-teal ink, like a printed page`

コントラスト:
- text on bg: **13.22:1** / text on card: **15.11:1** / text-sec on bg: **5.44:1**
- accent on card: **5.73:1** / accent-fg(白) on accent: **5.93:1** / accent-dark on card: **7.82:1** — 全AA。

---

## 3. T-J 習熟色（mastery color）スペック

### 3-1. 結論と根拠

**(b) 全テーマ共通の固定ゴールド系を推奨。(a) テーマ追従(accent-dark派生)は不採用。**

根拠（実測）:
- 派生案 (a) の「accent vs accent-dark」輝度差は全テーマで 1.1〜2.7:1 と極小。とくに sepia は 1.13:1（実質同色）。同じレッスン行に1回バッジと2回バッジが同時に並ぶことは稀だが、ユーザーが一覧で「濃いaccent」と「薄いaccent」を瞬時に弁別するには輝度差が足りない。"習熟＝特別" の格上げ感も出ない。
- 固定色 (b) なら全テーマで一貫した「ゴールド＝極めた」という意味記号になり、accent(=普通の完了)と色相がはっきり分離する。学習アプリで「金 = mastery」は直感的。

ただし固定ゴールドには2つの実測上の注意があり、それを設計で吸収する:
1. ゴールドは暖色テーマ(sepia, 新rose)の accent(赤茶/赤紫)と色相が近く、塗り色同士の輝度比が 1.1〜1.6:1。→ **色だけに頼らず形状で二重符号化**（後述）。
2. 単一ゴールド値だと、明るすぎると light/暖色カードでAAを割り、暗すぎると dark カードで沈む。→ **明カード用と暗カード用の2値**を持つ。

### 3-2. 推奨 hex（2値・トークン化）

テーマの bg/card 明度で出し分ける。`--mastery` / `--mastery-fg` をテーマごとに定義する（accent と同じ仕組み）。

| 適用テーマ（カード明度） | `--mastery`（塗り） | `--mastery-fg`（上の文字/チェック） | 検証 |
|---|---|---|---|
| 明カード（light, sepia, rose, slate） | `#9A7416` | `#FFFFFF` | fill on white card 4.30:1 / sepia 3.99 / rose 3.93 / slate 4.15（UIラージAA）。白文字 on #9A7416 = 4.30:1（バッジ＝ラージUI想定でAA）。中心数字を大きめ(>=18px bold)にすれば 4.5 基準にも実質到達。 |
| 暗カード（dark, forest, indigo） | `#D9A943` | `#1A1A1A` | fill on dark 6.42 / forest 6.53 / indigo 6.92（AA）。黒文字 on #D9A943 = 8.04:1（AA余裕）。 |

補足: 中心数字をベタ塗り円の上に `--mastery-fg` で描く（現 CompletionBadge の count=2 は数字を card 色背景に accent で描いているが、mastery では「塗り＝gold / 文字＝mastery-fg」に統一すると上記AAが効く）。

### 3-3. 半リング(count=2) と フル塗り(count=3+) の破綻チェック

- count=2 半リング: 現実装は conic-gradient で左半分を accent、中心に bg-card の丸を抜いて数字を accent で描く。mastery 化する場合:
  - リングの塗り = `--mastery`、中心の丸 = `--bg-card`、中心数字 = `--mastery`。
  - 中心数字 on card のコントラスト: #9A7416 on 明カード = 3.93〜4.30:1（数字は太字大きめなのでラージAA可）、#D9A943 on 暗カード = 6.4〜6.9:1（OK）。
  - リング自体(縁取り) on card は §3-2 の fill 値と同じ＝UIラージAA(3:1)クリア。
  - → 破綻なし。
- count=3+ フル塗り: 塗り=`--mastery`、数字=`--mastery-fg`。白 on #9A7416=4.30:1 / 黒 on #D9A943=8.04:1。数字は font-weight 800・size>=10px の太字なので可。boxShadow の `color-mix(--mastery 25%)` リングも見える。
  - → 破綻なし。

### 3-4. 二重符号化（色覚多様性・暖色テーマ対策）

色だけだと暖色テーマで accent と紛れうるため、mastery バッジに**形状差**を必ず1つ足す:
- 案1（推奨・低コスト）: mastery バッジに細い金縁リング(stroke 2px, `--mastery`)を常時付与。1回バッジ(accent ベタ・縁なし)と縁の有無で弁別。
- 案2: count>=2 のチェックを「星/冠」アイコンに変える（ただしUI chrome 絵文字NG・SVGアイコンで。src/icons に star/crown が無ければ dev-logic に追加依頼）。
- いずれも「色＋形」の冗長符号化になり、sepia/rose で accent と並んでも識別可能。実装はどちらか1つで十分。

### 3-5. dev-logic 向け実装メモ（参考）

- `CompletionBadge.tsx` の `var(--accent)`/`var(--accent-fg)` を、count>=2 のとき `var(--mastery)`/`var(--mastery-fg)` に差し替え。count==1 は従来 accent のまま。
- `--mastery` / `--mastery-fg` は tokens.css の各 `body.theme-v3.mode-*` に明カード値/暗カード値を定義（light/sepia/rose/slate=#9A7416+白、dark/forest/indigo=#D9A943+黒）。`:root` のデフォルトは明カード値にしておく。
- 既存4テーマ(light/dark/sepia/forest)にも同トークンを足すこと（mastery は全テーマ共通仕様）。

---

## 4. theme.ts MODES 反映（差分の方向性のみ・コードは dev-logic）

- `ModeId` 型から `'enterprise' | 'startup' | 'custom' | 'mono'` を除去し、`'indigo' | 'rose' | 'slate'` を追加。
- `MODES` 配列から該当4エントリ削除、新3エントリ追加（preview は §2 の値）。
- `applyTheme` 内 `THEME_COLOR_BY_MODE` から削除4キーを除き、`indigo/rose/slate` を §2 の bg 値で追加。
- custom 削除に伴い、`s.mode === 'custom'` 分岐と `customHex` 周りの扱いは dev-logic 判断（後方互換: 旧localStorage に custom が残るユーザーは DEFAULT(dark) にフォールバックさせる）。
- tokens.css に `body.theme-v3.mode-indigo` / `.mode-rose` / `.mode-slate` セレクタを §2 の表で新設。削除4テーマのセレクタブロックは除去。
- 既存 light/dark の accent ボタン白文字 AA 問題（§1-4 結論）も同時に修正推奨。

---

## 付録: 計算根拠

コントラスト比は WCAG 相対輝度（sRGB→linear, 0.2126R+0.7152G+0.0722B）で `(L_hi+0.05)/(L_lo+0.05)`。`src/theme.ts` の `luminance()`/`pickFg()` と同一式で /tmp/contrast.mjs により全ペア実測（本ドキュメントの数値はその出力）。AA本文=4.5:1、AA大文字/UI=3:1。
