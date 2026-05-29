# UI 刷新方針 — 「AIっぽさ」を抜く (AM-K / T-V エピック)

作成: 2026-05-29 / 担当: designer (凜)
ステータス: 方針提案（実装は dev-logic へ。Keita 選択待ち）

依頼: 「全体的に UI の AI ぽさをなくしたいので刷新方針を考えてほしい」(Keita)

前提（本日すでに入った変更）:
- テーマ刷新済み（enterprise/startup/custom/mono 廃止 → light/dark/sepia(古紙)/forest(深緑)＋indigo/rose/slate）。配色レベルの「量産 SaaS / AI 感」はテーマ層で対処済み。
- 今日の1問カード・カスタムコース生成カードのグラデは廃止済み（フラット単色テーマ追従）。
- → 本エピックは「配色テーマ以外」が主眼。レイアウト/タイポ/コンポーネント/装飾/コピー/アイコン運用/モーションの診断と刷新。

---

## 0. TL;DR（結論）

「AIっぽさ」の正体は、配色ではなく主に次の4つに集約される:

1. 装飾の過剰 — 残存する 62 個の装飾グラデ token、glow blob（`filter: blur(36px)`）、backdrop-blur、リッチすぎる多段 shadow scale。テーマ表層をフラットにしても token 層と画面の inline style に「テックっぽい光り物」が残っている。
2. タイポの汎用性 — `Noto Sans JP + Inter Tight` という「いかにも自動生成 SaaS」のフォント組み合わせ＋均質なウェイト運用。エディトリアルな抑揚（serif 見出し・字間・サイズ階層の個性）が無い。
3. カード地獄 — すべてが角丸＋影付きカードに乗っており、画面の階層が「全部同じ高さの箱の羅列」になっている。
4. 仕上げの雑味 — UI chrome の絵文字（🎉✨🔥）、HomeScreenV3 の全面 inline style（hex/rgba 直書き含む）、汎用コピー。

推奨方針: 「エディトリアル × 手描き図解」路線。コースサムネの手書き＋図解の世界観（feedback_logic_course_thumbnails）をアプリ本体まで一気通貫させ、紙・余白・タイポ・線で個性を出す。光り物・ガラス・ネオモーフィズムはゼロに寄せる。

代替方針も後述（B: ミニマル・スイス / C: 現状微修正）。推奨は A。

---

## 1. 診断 — Logic のどこが「AI生成アプリっぽい」か

### 1-1. 装飾の過剰（最大の犯人）

定量（全 src 走査）:
- CSS gradient: 119 箇所 / inline gradient: 62 箇所
- box-shadow: 165 箇所 / blur・backdrop-filter: 34 箇所 / glow: 29 箇所
- border-radius: 635 箇所（＝ほぼ全要素が角丸）

具体箇所:
- `src/styles/tokens.css` に装飾グラデ token が 62 個も生き残っている。例: `--brand-grad`, `--hero-grad`(L30 `linear-gradient(135deg,#6C8EF5→#1E2D5C→#120D2E)` ＝紫青テックグラデの典型), `--brand-grad-pop`(L100 `#7C3AED→#4C1D95` 紫), `--campaign-grad`(L169 オレンジ→ピンク), カテゴリ別グラデ 9 種, メダルグラデ 3 種。テーマ表層は直したが、この token を参照している画面は依然テックグラデで光る。
- `src/screens/HomeScreenV3.tsx` L188: 今日の1問カードに `filter: blur(36px)` の白い glow blob を絶対配置。L187: `mixBlendMode: 'overlay'` で画像を被せる。L241: reroll ピルに `backdropFilter: blur(4px)`（ガラス風）。→ いずれも「AIアプリ感」の典型。
- shadow scale が過剰にリッチ: `tokens.css` L218-231 に sm/md/lg/cta/cta-pop/card/card-hover/elevated/hero/float/v3-card-inset/v3-hero と 12 段。`--shadow-hero`(L226) は `0 24px 64px` ＋ブランド色付き影。`--shadow-cta`(L221) は色付きグロー影。色付き影＝テック SaaS の常套。
- `--bg-app-grad`（背景の薄いグラデ, L58/301/364/416）も「のっぺりした自動生成感」を足している。

### 1-2. タイポグラフィの汎用性

- フォントは `Noto Sans JP`（本文 61 箇所）＋`Inter Tight`（見出し/ロゴ 28 箇所）の2本柱。これは「AI が無難に選ぶ日本語 SaaS フォント」そのもの。serif（`var(--serif)` 42 箇所）は visuals/docs 系に閉じており、UI 本体の見出しはほぼ sans のみ。
- ウェイト運用が `fontWeight: 700/800` の多用で均質。サイズ階層・字間（letter-spacing）・行間で「読み物としての抑揚」を作れていない。HomeScreenV3 の greeting(L172 fontSize:20/700) → カード見出し(L194 19/700) と差が無く、視線誘導が平坦。
- 結果として「機能は並んでいるが、誰が作ったか分からない」無個性なタイポになっている。

### 1-3. カード地獄（レイアウトの均質さ）

- `Card.tsx` は良い抽象（a11y 対応済み button 化）だが、画面が「角丸＋影カードの縦積み」一辺倒。HomeScreenV3 は greeting → 今日の1問カード → Hero recommend カード → … と全部独立カードで、紙面の強弱・グルーピング・区切り線（rule）による情報設計が無い。
- すべて `--radius-lg`(16px) 前後で角丸が揃いすぎ、紙やエディトリアルの「角のある余白」が無い。
- モバイル専用なのに 1 カラム箱積みのままで、雑誌・教科書的な「見出し＋本文＋欄外メモ」のような構造が無い。

### 1-4. 仕上げの雑味

- UI chrome に絵文字: `AppV3.tsx` L917 `🎉` / L987 `✨`、`ProfileScreenV3.tsx` L454 `🔥`（streak）。制約では UI chrome は絵文字不可・SVG アイコン運用のはず → 違反。SVG アイコン（src/icons）へ置換すべき。`★` 文字も TitleBadge/Profile で使用、これも SVG 化候補。
- `HomeScreenV3.tsx`(580行) はほぼ全面 inline style で、`rgba(255,255,255,0.18)` 等の色直書きが散在（制約「色は CSS 変数・直書き hex 禁止」に抵触）。スタイルが token を経由しないので、刷新が効きにくく一貫性も崩れる。
- コピーは中立丁寧体で方針通りだが、「今日の1問」「おすすめ」等が汎用的で、論理思考トレーニングというプロダクト固有の声が薄い（※コピーは marketing と要連携。本エピックでは構造優先）。

---

## 2. ありたい姿 — 「人間が作った感／エディトリアル／個性」の定義

Logic のブランド（論理思考トレーニング・若手ビジネスパーソン・手書き＋図解のサムネ路線）に整合させる。

原則（A: 推奨 = エディトリアル × 手描き図解）:
1. 紙と余白で語る — 背景はフラット単色（テーマ追従）。光らせない・ぼかさない・グラデで誤魔化さない。区切りは影でなく hairline rule（1px の線）と余白で。
2. タイポに個性を — 見出しに serif もしくは特徴あるディスプレイ書体を導入し、本文 sans とのコントラストで「読み物」の抑揚を作る。サイズ階層・字間を設計し、教科書の余白メモのような知的で親しみある空気感（サムネ路線と同じトーン）。
3. 手描きの線をアクセントに — コースサムネで使っている手描きライン/下線/囲み/矢印を、アプリ本体のアクセント（見出し下線・強調・区切り）に少量だけ転用。これが最も安く「人間が作った感」を出せ、かつサムネとアプリの世界観を一気通貫にできる。
4. 装飾はゼロ基調、要素は線とタイポで — カードは「影で浮かせる」から「線で区切る／地色を薄く変える」へ。glow・glass・neumorphism は全廃。
5. アイコンは SVG 一貫運用 — 絵文字を chrome から排除し、手描きトーンに寄せた線アイコン（src/icons）で統一。

NG（＝AIっぽさの源を作らない）:
- 紫×青テックグラデ、色付きグロー影、backdrop-blur ガラス、中央寄せ巨大グラデ見出し、全要素角丸＋影、絵文字乱用、均質ウェイト。

代替方針:
- B（ミニマル・スイス）: 手描き要素を入れず、タイポ＋グリッド＋線だけで構成。最も安全で外しにくいが、サムネ路線との連動が弱く「個性」はやや薄い。手描き素材の準備が間に合わない場合の保険。
- C（現状微修正）: 装飾削減と絵文字排除だけ行い、構造・タイポは触らない。最小コストだが「無個性さ」は残るため、根治にはならない。

推奨は A。ただし A は手描き素材（下線/囲み/矢印 SVG）の用意が前提になるので、第1弾は A の「装飾削減＋タイポ」部分から入り、手描きアクセントは素材が揃い次第 段階導入する（ロードマップ参照）。

---

## 3. 刷新ロードマップ（低コストで効く順）

### (a) すぐ直せる小修正 — 装飾トーンダウン（高 ROI・低リスク）

A1. 装飾グラデ token の棚卸し: `tokens.css` の 62 グラデのうち UI 本体で参照されているものを洗い出し、フラット単色 or `--accent`/`--bg-card` に置換。残すのはメダル等「意味のある」最小限のみ。
  - 対象: `src/styles/tokens.css`(L22-169), 参照側 `src/index.css`, `src/App.css`, `src/styles/extensions.css`。
A2. 背景グラデ廃止: `--bg-app-grad` をフラット `--bg-app` に。対象: `tokens.css` L58/301/364/416 と参照箇所。
A3. glow / blur 除去: HomeScreenV3 の blur blob(L188)・mixBlend overlay(L187)・backdropFilter(L241) を削除。`glow` 29 箇所を順次除去（`levelup.css`, `index.css`, `Flashcards.css` 中心）。
A4. shadow scale 簡素化: 12 段 → 3 段（rest / raised / overlay）程度に集約。色付き影（cta/hero）は色を抜くか廃止。対象: `tokens.css` L218-231 と全参照。
A5. UI chrome の絵文字を SVG へ: `AppV3.tsx` L917 🎉 / L987 ✨、`ProfileScreenV3.tsx` L454 🔥、`★` 文字。src/icons の SVG に差し替え。

### (b) コンポーネント単位の作り替え（中コスト）

B1. タイポトークン整備: 見出し用ディスプレイ/serif 書体を1本追加し、`--font-display`・サイズ/字間/行間の type scale を `tokens.css` に定義。見出しを sans 700 一辺倒から脱却。対象: `tokens.css`, `index.css`, 各画面の見出し。
B2. Card の脱・影化: `Card`(`Card.tsx` + card クラスの CSS) に variant 追加（`flat`＝線区切り/`subtle`＝薄地色）。デフォルトを flat 寄りに。影依存を減らす。
B3. HomeScreenV3 の inline style を CSS/token へ移管: 580 行の inline を `HomeScreenV3.css`（or 既存 App.css の section）に切り出し、色直書きを CSS 変数化（制約遵守）。これで以降の刷新が token 経由で効くようになる。
B4. 手描きアクセント素材の作成（designer 担当）: 見出し下線・囲み・矢印・チェックの手描き SVG セットを Figma で作成→`src/icons` or `public/images` に配置。サムネ路線と同じインク/鉛筆トーン。

### (c) 画面レイアウト再設計（高コスト・最後）

C1. HomeScreenV3 をエディトリアル構成へ: 「箱の縦積み」から「見出し＋rule＋本文＋欄外」の紙面構成に。今日の1問を主役、その他を従に、視覚階層を明確化。
C2. RoadmapScreenV3(1748 行) の見直し: 残存グラデ(L1709)・backdrop-blur(L1441) 除去とカードの線区切り化。ロードマップは「手描きの道のり」表現がサムネ路線と相性◎（中長期）。
C3. PricingScreen / Onboarding のトーン統一: 装飾を抜き、タイポと余白で「説得力ある読み物」に。

---

## 4. dev-logic 着手用タスク候補（実装単位）

優先度 P0=即着手推奨 / P1=次 / P2=後

- [P0] T1: `tokens.css` のグラデ token 棚卸し表を作り、UI 本体参照分をフラット化（A1）。grep `var(--*-grad)` で参照箇所列挙→置換。
- [P0] T2: `--bg-app-grad` → フラット背景化（A2）。light/dark/sepia/forest/indigo/rose/slate 全テーマ分。
- [P0] T3: HomeScreenV3 の glow blob / mixBlend / backdropFilter 除去（A3, L187-188, L241）。
- [P0] T4: shadow scale を 3 段に集約、色付き影の色抜き（A4）。
- [P0] T5: UI chrome 絵文字 🎉✨🔥 を src/icons の SVG へ置換（A5）。
- [P1] T6: type scale + display 書体 token 追加、主要見出しに適用（B1）。
- [P1] T7: Card に flat/subtle variant 追加、デフォルト見直し（B2）。
- [P1] T8: HomeScreenV3 inline style → CSS/token 移管・色変数化（B3）。
- [P1] T9: 手描きアクセント SVG セット作成（designer）→配置（B4）。
- [P2] T10: HomeScreenV3 エディトリアル再構成（C1）。
- [P2] T11: RoadmapScreenV3 のグラデ/blur 除去＋線区切り化（C2）。
- [P2] T12: Pricing / Onboarding トーン統一（C3）。

依存: T9（手描き素材）は T10/C 系の前提。T8 完了後は以降の HomeScreen 改修が token 経由で楽になる。

---

## 5. 制約チェック（遵守事項）

- UI chrome は絵文字不可・src/icons の SVG（レッスン本文のみハイブリッド例外）→ T5 で是正。
- アプリ文言は中立的丁寧体 → コピー変更は構造優先・marketing 連携で別途。
- 色は CSS 変数・直書き hex 禁止 → T8 で HomeScreenV3 の直書きを是正。
- 手描き＋図解のサムネ路線と整合 → 推奨方針 A の核に据えた。
- Logic はモバイル専用 → 全診断・再設計はモバイル基準。

---

## 6. designer から Keita への確認事項

1. 方針は A（エディトリアル×手描き）/ B（ミニマル・スイス）/ C（微修正のみ）のどれで進めるか。推奨は A、第1弾は装飾削減＋タイポから。
2. 見出し用の display/serif 書体の方向性（和文セリフ系 / 欧文ディスプレイ＋和文サンセリフ 等）。サンプル提示が必要なら designer で1案出す。
3. 手描きアクセント素材（T9）に着手してよいか（Figma で下線/囲み/矢印/チェックの線素材セットを試作）。
