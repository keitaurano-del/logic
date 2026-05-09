# コース・レッスン画像生成ガイド

Gemini で各コース／レッスンのイラストを生成し、 `public/images/v3/` 以下に
規約のファイル名で保存すれば `npm run wire:images` で自動的に
`courseData.ts` / `lessonSlides.ts` の参照が更新される。

> このドキュメントは `scripts/imagePrompts.ts` から自動生成されています。
> 編集する場合は `imagePrompts.ts` を直して `npm run prompts:md` を実行してください。

## 手順

1. Gemini を開く（推奨: Imagen 4 が使えるモード）
2. 最初に「共通スタイル指示」を一度送る
3. 各コース／レッスンのプロンプトを順次送り、生成された画像を保存先のファイル名でダウンロード
4. `public/images/v3/` 以下に保存
5. リポジトリで `npm run wire:images` を実行 → `courseData.ts` / `lessonSlides.ts` の参照が PNG に切り替わる

## 共通スタイル指示（最初に Gemini に送る）

```text
これから複数の画像を生成してもらいます。
全画像とも以下の共通スタイルを必ず守ってください:

3D isometric illustration, clean modern minimalist style, deep navy blue gradient background (#101729 to #1F2942), subtle warm golden glow accent in upper area, soft pastel highlights, professional educational app thumbnail, centered composition, cinematic lighting, octane render style, no text, no captions, no watermarks, no logos, no letters, no numbers

アスペクト比は 16:9。各回ひとつだけ画像を生成してください。
```

## コース (24枚)

| ID | タイトル | 保存ファイル |
|----|---------|-------------|
| `logic-01` | ロジカルに考えて、整理する | `course-logic-01.png` |
| `logic-02` | 論理を組み立て、相手を動かす | `course-logic-02.png` |
| `critical-01` | 思い込みを疑い、正しく判断する | `course-critical-01.png` |
| `critical-02` | バイアスを外し、客観的に見る | `course-critical-02.png` |
| `hypothesis-01` | 仮説を立ててから、調べる | `course-hypothesis-01.png` |
| `problem-01` | 本当の問題を見極め、定義する | `course-problem-01.png` |
| `design-01` | ユーザーの本音を掘り下げ、解決する | `course-design-01.png` |
| `systems-01` | 全体を俯瞰し、根本から変える | `course-systems-01.png` |
| `lateral-01` | 常識を疑い、突破口を開く | `course-lateral-01.png` |
| `analogy-01` | 別分野の知恵を借りて、応用する | `course-analogy-01.png` |
| `philosophy-01` | 哲学の問いで、思考を深める | `course-philosophy-01.png` |
| `eastern-01` | 古代中国思想で、人と組織を見る | `course-eastern-01.png` |
| `eastern-02` | 古代中国思想で、戦略と決断を見る | `course-eastern-02.png` |
| `proposal-01` | 相手が動く提案をつくる | `course-proposal-01.png` |
| `proposal-course-01` | 仮説と検証で、提案書を仕上げる | `course-proposal-course-01.png` |
| `client-01` | 数字で状況を素早く読み解く | `course-client-01.png` |
| `client-02` | 論点を定め、深く引き出す | `course-client-02.png` |
| `client-03` | 未経験の業界で、短期間で立ち上がる | `course-client-03.png` |
| `case-01` | ケース面接で、論理力を証明する | `course-case-01.png` |
| `strategy-01` | 戦略の源流と競争戦略を学ぶ | `course-strategy-01.png` |
| `strategy-02` | 資源・能力・共進化の戦略へ | `course-strategy-02.png` |
| `fermi-01` | 概算で、世界の規模を掴む | `course-fermi-01.png` |
| `numeracy-01` | 数字に強くなる | `course-numeracy-01.png` |
| `peak-performance-01` | 自分史上最高のパフォーマンスで働く | `course-peak-performance-01.png` |

### logic-01 — ロジカルに考えて、整理する
**保存先**: `public/images/v3/course-logic-01.png`  
**種別**: コース

```text
four colorful 3D isometric cubes arranged in a 2x2 grid (red, blue, gold, green) representing MECE classification, with a separate floating isometric tree of connected cube nodes branching outward like a logic tree, subtle floating papers with checkmarks
```

### logic-02 — 論理を組み立て、相手を動かす
**保存先**: `public/images/v3/course-logic-02.png`  
**種別**: コース

```text
a 3D isometric three-tier pyramid built from stacked cubes, with bidirectional vertical arrows on the side representing So What going up and Why So going down, a small figure presenting the pyramid to an audience
```

### critical-01 — 思い込みを疑い、正しく判断する
**保存先**: `public/images/v3/course-critical-01.png`  
**種別**: コース

```text
a 3D isometric scene of a giant magnifying glass examining a floating document, with question marks transforming into green checkmarks, broken chain links representing logical fallacies floating around
```

### critical-02 — バイアスを外し、客観的に見る
**保存先**: `public/images/v3/course-critical-02.png`  
**種別**: コース

```text
a 3D isometric translucent human brain with several glass filter panels being lifted away, releasing colored prismatic fragments representing cognitive biases drifting off
```

### hypothesis-01 — 仮説を立ててから、調べる
**保存先**: `public/images/v3/course-hypothesis-01.png`  
**種別**: コース

```text
a 3D isometric scene with a floating hypothesis card connected by an arrow loop to a laboratory beaker and a magnifying glass, representing hypothesis-then-verify cycle
```

### problem-01 — 本当の問題を見極め、定義する
**保存先**: `public/images/v3/course-problem-01.png`  
**種別**: コース

```text
a 3D isometric iceberg cut in half showing a small visible tip above the water and a massive submerged base with glowing root cause spheres inside, target marker on the deep core
```

### design-01 — ユーザーの本音を掘り下げ、解決する
**保存先**: `public/images/v3/course-design-01.png`  
**種別**: コース

```text
a 3D isometric central persona figure surrounded by an empathy map split into four quadrants on the floor, sticky notes floating, prototype paper shapes, journey path lines
```

### systems-01 — 全体を俯瞰し、根本から変える
**保存先**: `public/images/v3/course-systems-01.png`  
**種別**: コース

```text
a 3D isometric circular feedback loop diagram with connected nodes, large circular arrow flowing through them, an iceberg model integrated below the loop
```

### lateral-01 — 常識を疑い、突破口を開く
**保存先**: `public/images/v3/course-lateral-01.png`  
**種別**: コース

```text
a 3D isometric glowing lightbulb breaking out of a cube box, with sideways arrows pointing in unconventional directions, prism splitting white light into colors
```

### analogy-01 — 別分野の知恵を借りて、応用する
**保存先**: `public/images/v3/course-analogy-01.png`  
**種別**: コース

```text
a 3D isometric bridge connecting two distinct floating islands - left island shaped like a tree of nature, right island shaped like a business chart - with a glowing lightbulb hovering above the bridge
```

### philosophy-01 — 哲学の問いで、思考を深める
**保存先**: `public/images/v3/course-philosophy-01.png`  
**種別**: コース

```text
a 3D isometric ancient Greek stone column with a contemplative thinker silhouette sitting beside it, an open scroll, abstract thought clouds with question marks above
```

### eastern-01 — 古代中国思想で、人と組織を見る
**保存先**: `public/images/v3/course-eastern-01.png`  
**種別**: コース

```text
a 3D isometric Chinese pavilion roof with a wise sage figure seated inside, traditional scrolls, glowing networked relationship lines connecting smaller figures around it, soft mist
```

### eastern-02 — 古代中国思想で、戦略と決断を見る
**保存先**: `public/images/v3/course-eastern-02.png`  
**種別**: コース

```text
a 3D isometric bamboo grove garden with a floating yin-yang symbol, abstract tao-flow lines like flowing water around stones, strategy chess pieces on a low platform
```

### proposal-01 — 相手が動く提案をつくる
**保存先**: `public/images/v3/course-proposal-01.png`  
**種別**: コース

```text
a 3D isometric professional document with a small presenter figure beside it, golden impact arrows radiating from the document toward a small target, audience silhouettes in front
```

### proposal-course-01 — 仮説と検証で、提案書を仕上げる
**保存先**: `public/images/v3/course-proposal-course-01.png`  
**種別**: コース

```text
a 3D isometric workflow from a small hypothesis card on the left to a polished bound proposal document on the right, with checkmark verification steps in between
```

### client-01 — 数字で状況を素早く読み解く
**保存先**: `public/images/v3/course-client-01.png`  
**種別**: コース

```text
a 3D isometric floating spreadsheet panel with bar charts and large numerical figures, a calculator, a business person reading the data with a confident posture
```

### client-02 — 論点を定め、深く引き出す
**保存先**: `public/images/v3/course-client-02.png`  
**種別**: コース

```text
a 3D isometric scene with two figures across a small table, one extracting information through a glowing question stream, structured cards organizing the answers
```

### client-03 — 未経験の業界で、短期間で立ち上がる
**保存先**: `public/images/v3/course-client-03.png`  
**種別**: コース

```text
a 3D isometric figure climbing a steeply rising learning curve graph, stacked books on the path, expert silhouettes guiding from above
```

### case-01 — ケース面接で、論理力を証明する
**保存先**: `public/images/v3/course-case-01.png`  
**種別**: コース

```text
a 3D isometric profit equation tree splitting into revenue and cost branches with sub-cubes, a small interview chair scene, structured framework boards
```

### strategy-01 — 戦略の源流と競争戦略を学ぶ
**保存先**: `public/images/v3/course-strategy-01.png`  
**種別**: コース

```text
a 3D isometric vintage industrial factory with conveyor belts on a circular platform, surrounded by five large arrows pointing inward representing five forces, a classic strategy book
```

### strategy-02 — 資源・能力・共進化の戦略へ
**保存先**: `public/images/v3/course-strategy-02.png`  
**種別**: コース

```text
a 3D isometric calm blue ocean with a small sailing ship, glowing resource gems on the seabed, mechanical capability gears interlocking, platform hub with radiating connections
```

### fermi-01 — 概算で、世界の規模を掴む
**保存先**: `public/images/v3/course-fermi-01.png`  
**種別**: コース

```text
a 3D isometric small earth globe with floating numerical figures around it, calculator, decomposition arrows breaking the globe into smaller cube estimates
```

### numeracy-01 — 数字に強くなる
**保存先**: `public/images/v3/course-numeracy-01.png`  
**種別**: コース

```text
a 3D isometric scene with floating percentage symbol, yen currency sign, bar chart and pie chart, calculator, a person confidently reading numbers, scale balance
```

### peak-performance-01 — 自分史上最高のパフォーマンスで働く
**保存先**: `public/images/v3/course-peak-performance-01.png`  
**種別**: コース

```text
a 3D isometric morning scene with a moon-to-sun cycle arc, an energy graph rising and falling with peaks, an athletic figure stretching, a glowing focus zone marker
```

## レッスン (44枚)

| ID | タイトル | 保存ファイル |
|----|---------|-------------|
| `20` | MECE | `lesson-20.png` |
| `21` | ロジックツリー | `lesson-21.png` |
| `22` | So What / Why So | `lesson-22.png` |
| `23` | ピラミッド原則 | `lesson-23.png` |
| `24` | ケーススタディ | `lesson-24.png` |
| `25` | 演繹法 | `lesson-25.png` |
| `26` | 帰納法 | `lesson-26.png` |
| `27` | 形式論理 | `lesson-27.png` |
| `68` | 具体と抽象 | `lesson-68.png` |
| `28` | ケース面接入門 | `lesson-28.png` |
| `29` | プロフィタビリティ | `lesson-29.png` |
| `35` | 新市場参入 | `lesson-35.png` |
| `36` | M&A | `lesson-36.png` |
| `40` | クリティカルシンキング入門 | `lesson-40.png` |
| `41` | 論理的誤謬 | `lesson-41.png` |
| `42` | データを読む | `lesson-42.png` |
| `43` | 問いを立てる | `lesson-43.png` |
| `69` | 認知バイアス | `lesson-69.png` |
| `71` | 相関と因果 | `lesson-71.png` |
| `50` | 仮説思考入門 | `lesson-50.png` |
| `51` | 仮説の立て方 | `lesson-51.png` |
| `52` | 仮説ドリブン | `lesson-52.png` |
| `70` | 仮説の検証設計 | `lesson-70.png` |
| `53` | 課題設定入門 | `lesson-53.png` |
| `54` | イシュー分析 | `lesson-54.png` |
| `55` | 課題設定実践 | `lesson-55.png` |
| `56` | デザインシンキング入門 | `lesson-56.png` |
| `57` | 共感マップ | `lesson-57.png` |
| `58` | デザインシンキング実践 | `lesson-58.png` |
| `59` | ラテラルシンキング入門 | `lesson-59.png` |
| `60` | ラテラル技法 | `lesson-60.png` |
| `61` | ラテラル実践 | `lesson-61.png` |
| `62` | アナロジー思考入門 | `lesson-62.png` |
| `63` | アナロジー技法 | `lesson-63.png` |
| `64` | アナロジー実践 | `lesson-64.png` |
| `65` | システムシンキング入門 | `lesson-65.png` |
| `66` | システム原型 | `lesson-66.png` |
| `67` | システム実践 | `lesson-67.png` |
| `72` | 提案書の目的 | `lesson-72.png` |
| `73` | 相手の立場 | `lesson-73.png` |
| `74` | ストーリーライン | `lesson-74.png` |
| `75` | メッセージを磨く | `lesson-75.png` |
| `76` | 反論を先読み | `lesson-76.png` |
| `77` | ソクラテス | `lesson-77.png` |

### 20 — MECE
**保存先**: `public/images/v3/lesson-20.png`  
**種別**: レッスン

```text
a 3D isometric 2x2 grid of four large colored cubes (red, blue, gold, green) showing MECE classification, no overlap no gap
```

### 21 — ロジックツリー
**保存先**: `public/images/v3/lesson-21.png`  
**種別**: レッスン

```text
a 3D isometric tree diagram with a single root cube branching into mid-level cubes and leaf cubes
```

### 22 — So What / Why So
**保存先**: `public/images/v3/lesson-22.png`  
**種別**: レッスン

```text
a 3D isometric pair of vertical arrows side by side, one pointing up and one pointing down, between layered cube stacks, representing So What and Why So
```

### 23 — ピラミッド原則
**保存先**: `public/images/v3/lesson-23.png`  
**種別**: レッスン

```text
a 3D isometric three-tier pyramid built from stacked cubes, conclusion on top supported by reason cubes below
```

### 24 — ケーススタディ
**保存先**: `public/images/v3/lesson-24.png`  
**種別**: レッスン

```text
a 3D isometric briefcase opening with documents flying out, case study notebook, charts
```

### 25 — 演繹法
**保存先**: `public/images/v3/lesson-25.png`  
**種別**: レッスン

```text
a 3D isometric flow from general principle cube down to specific conclusion cube, deduction arrow
```

### 26 — 帰納法
**保存先**: `public/images/v3/lesson-26.png`  
**種別**: レッスン

```text
a 3D isometric flow from many small specific data cubes converging upward into a general pattern cube, induction arrow
```

### 27 — 形式論理
**保存先**: `public/images/v3/lesson-27.png`  
**種別**: レッスン

```text
a 3D isometric formal logic gate diagram with truth state cubes glowing in a connected pattern
```

### 68 — 具体と抽象
**保存先**: `public/images/v3/lesson-68.png`  
**種別**: レッスン

```text
a 3D isometric ladder of abstraction with concrete object cubes at the bottom and abstract idea cubes at the top, vertical arrow
```

### 28 — ケース面接入門
**保存先**: `public/images/v3/lesson-28.png`  
**種別**: レッスン

```text
a 3D isometric interview room with two chairs across a small table, structured frameworks floating between them
```

### 29 — プロフィタビリティ
**保存先**: `public/images/v3/lesson-29.png`  
**種別**: レッスン

```text
a 3D isometric profit equation tree with revenue branch and cost branch breaking into smaller cubes
```

### 35 — 新市場参入
**保存先**: `public/images/v3/lesson-35.png`  
**種別**: レッスン

```text
a 3D isometric arrow pointing from a small island to a larger market continent, decision flowchart cubes around the arrow
```

### 36 — M&A
**保存先**: `public/images/v3/lesson-36.png`  
**種別**: レッスン

```text
a 3D isometric two companies represented as separate cube clusters merging into one larger cluster, M&A handshake
```

### 40 — クリティカルシンキング入門
**保存先**: `public/images/v3/lesson-40.png`  
**種別**: レッスン

```text
a 3D isometric magnifying glass examining a checklist document, question marks turning into checkmarks
```

### 41 — 論理的誤謬
**保存先**: `public/images/v3/lesson-41.png`  
**種別**: レッスン

```text
a 3D isometric set of broken chain links labeled as logical fallacies, with a corrected solid chain link beside them
```

### 42 — データを読む
**保存先**: `public/images/v3/lesson-42.png`  
**種別**: レッスン

```text
a 3D isometric data dashboard with floating bar charts and a person carefully reading numbers, hidden patterns highlighted
```

### 43 — 問いを立てる
**保存先**: `public/images/v3/lesson-43.png`  
**種別**: レッスン

```text
a 3D isometric large question mark cube being polished, surrounded by smaller question marks being filtered into a clearer one
```

### 69 — 認知バイアス
**保存先**: `public/images/v3/lesson-69.png`  
**種別**: レッスン

```text
a 3D isometric brain with translucent biased glasses being removed, prismatic fragments drifting
```

### 71 — 相関と因果
**保存先**: `public/images/v3/lesson-71.png`  
**種別**: レッスン

```text
a 3D isometric two correlated wave lines diverging where one is a true cause arrow and the other is just correlation
```

### 50 — 仮説思考入門
**保存先**: `public/images/v3/lesson-50.png`  
**種別**: レッスン

```text
a 3D isometric thought bubble with a hypothesis card pointing forward to a verification path
```

### 51 — 仮説の立て方
**保存先**: `public/images/v3/lesson-51.png`  
**種別**: レッスン

```text
a 3D isometric figure drafting hypothesis cards on a desk, multiple options floating up
```

### 52 — 仮説ドリブン
**保存先**: `public/images/v3/lesson-52.png`  
**種別**: レッスン

```text
a 3D isometric arrow loop from hypothesis card to data verification beaker and back
```

### 70 — 仮説の検証設計
**保存先**: `public/images/v3/lesson-70.png`  
**種別**: レッスン

```text
a 3D isometric experimental setup with measurement instruments, control versus test cubes
```

### 53 — 課題設定入門
**保存先**: `public/images/v3/lesson-53.png`  
**種別**: レッスン

```text
a 3D isometric target board with concentric rings, an arrow finding the true bullseye among decoys
```

### 54 — イシュー分析
**保存先**: `public/images/v3/lesson-54.png`  
**種別**: レッスン

```text
a 3D isometric large issue card being decomposed downward into smaller sub-issue cubes
```

### 55 — 課題設定実践
**保存先**: `public/images/v3/lesson-55.png`  
**種別**: レッスン

```text
a 3D isometric workspace with multiple problem cards being prioritized into a focused single card
```

### 56 — デザインシンキング入門
**保存先**: `public/images/v3/lesson-56.png`  
**種別**: レッスン

```text
a 3D isometric design thinking cycle with five connected stage cubes (empathize, define, ideate, prototype, test)
```

### 57 — 共感マップ
**保存先**: `public/images/v3/lesson-57.png`  
**種別**: レッスン

```text
a 3D isometric empathy map quadrants on the floor surrounding a central persona figure
```

### 58 — デザインシンキング実践
**保存先**: `public/images/v3/lesson-58.png`  
**種別**: レッスン

```text
a 3D isometric prototype paper model being tested by a user figure with feedback bubbles
```

### 59 — ラテラルシンキング入門
**保存先**: `public/images/v3/lesson-59.png`  
**種別**: レッスン

```text
a 3D isometric lightbulb breaking out of a cube box, sideways arrows in unconventional directions
```

### 60 — ラテラル技法
**保存先**: `public/images/v3/lesson-60.png`  
**種別**: レッスン

```text
a 3D isometric prism splitting a single light beam into multiple colorful diverging directions
```

### 61 — ラテラル実践
**保存先**: `public/images/v3/lesson-61.png`  
**種別**: レッスン

```text
a 3D isometric flipped perspective scene where a problem cube is rotated to reveal a different unexpected facet
```

### 62 — アナロジー思考入門
**保存先**: `public/images/v3/lesson-62.png`  
**種別**: レッスン

```text
a 3D isometric bridge connecting two distinct floating islands with different visual themes
```

### 63 — アナロジー技法
**保存先**: `public/images/v3/lesson-63.png`  
**種別**: レッスン

```text
a 3D isometric structural pattern card being lifted from one domain and placed onto another domain
```

### 64 — アナロジー実践
**保存先**: `public/images/v3/lesson-64.png`  
**種別**: レッスン

```text
a 3D isometric two parallel scenes side by side with matching structural arrows showing analogy mapping
```

### 65 — システムシンキング入門
**保存先**: `public/images/v3/lesson-65.png`  
**種別**: レッスン

```text
a 3D isometric circular feedback loop with connected node cubes flowing in a circle
```

### 66 — システム原型
**保存先**: `public/images/v3/lesson-66.png`  
**種別**: レッスン

```text
a 3D isometric system archetype diagram with reinforcing and balancing loops shown as gears
```

### 67 — システム実践
**保存先**: `public/images/v3/lesson-67.png`  
**種別**: レッスン

```text
a 3D isometric iceberg model with events on top, patterns mid, structures and mental models at the deep base
```

### 72 — 提案書の目的
**保存先**: `public/images/v3/lesson-72.png`  
**種別**: レッスン

```text
a 3D isometric professional bound proposal document with a clear target arrow above it
```

### 73 — 相手の立場
**保存先**: `public/images/v3/lesson-73.png`  
**種別**: レッスン

```text
a 3D isometric two figures facing a document, one offering and one receiving, perspective lines aligning their viewpoints
```

### 74 — ストーリーライン
**保存先**: `public/images/v3/lesson-74.png`  
**種別**: レッスン

```text
a 3D isometric storyline path with sequential narrative cube panels leading to a conclusion
```

### 75 — メッセージを磨く
**保存先**: `public/images/v3/lesson-75.png`  
**種別**: レッスン

```text
a 3D isometric message card being polished and sharpened on a workbench with sparkles
```

### 76 — 反論を先読み
**保存先**: `public/images/v3/lesson-76.png`  
**種別**: レッスン

```text
a 3D isometric shield deflecting incoming counter-argument arrows, behind it a strong document
```

### 77 — ソクラテス
**保存先**: `public/images/v3/lesson-77.png`  
**種別**: レッスン

```text
a 3D isometric ancient Greek stone column with a Socrates-like silhouette and a scroll, question marks rising
```

## 紐付け（自動）

```bash
# 何が更新されるかプレビュー
npm run wire:images -- --dry-run

# 実行（src/courseData.ts と src/lessonSlides.ts を書き換え）
npm run wire:images
```

`public/images/v3/course-{id}.png` または `lesson-{id}.png` が見つかった ID
についてのみ、それぞれの参照を `.png` パスに更新する。
保存していないコース／レッスンの参照は変更されない。

## 自動 API 経由で一括生成したい場合

```bash
export GEMINI_API_KEY=AIza...
npm run gen:images -- --target=courses        # コース 24 枚
npm run gen:images -- --target=all            # コース + レッスン 全 68 枚
npm run gen:images -- --only=logic-01,fermi-01 # 特定だけ
```
