# Logic 新規 42 Visual + Lesson 紐付け コードレビュー

**対象:** `src/visuals/*.tsx` 新規 42 件 + `src/visuals/visuals-{whywhy,phase2,phase3a,phase3b,phase3c}.css` 5 ファイル + `src/*Lessons.ts` 24 ファイル（en 除外）の visual 紐付け 95 件
**実施日:** 2026-05-21
**実施:** 凜（メインセッション、dev-logic 経由）
**ベース成果物:** 既存 10 件（`MecePatterns`, `LogicTree`, `SoWhat`, `Pyramid`, `Prep`, `CaseStudy`, `Deduction`, `Induction`, `Contrapositive`, `AbstractionLadder`）+ `visuals.css`
**事前確認:** `tsc -b --noEmit` ✅ pass / `eslint src/visuals/` ✅ pass

---

## 1. 総評

5 agent 並列実装のわりに **大枠の構造は崩れていない** — 全 49 visualId が registry と完全一致、全 95 件の lesson 紐付けが探索可能、すべて type=`explain` 上で正しく宣言されており、未マッチ／quiz・think への紛れ込みもゼロ。CSS プレフィックスも phase ごとに重複なく分離されていて、TypeScript も `any`／`as` キャストの使用ゼロでクリーン。

ただし**規約適合性は全方向でブレている**：
- 既存 10 件で先行採用された「絵文字 hint pill」「ハードコード hex グラデ」を 42 件全部が踏襲（規約違反だが既存準拠）
- Phase 2 の 6 件だけ `var(--serif)` 未定義変数を使用（描画フォントが OS デフォルトにフォールバックして見た目崩れる）
- Phase 2 の 6 件だけ `Props` を export 型に昇格、他 36 件は内部 `type Props` で命名がバラバラ
- Phase 3-A だけ side-effect CSS import を画面側 (`LessonStoriesScreen.tsx`) に出している不整合
- registry の `Record<string, ComponentType>` 型では props 付き visual に props を渡せず、せっかく `Two2MatrixProps`／`FermiFormulaProps` 等を export しても**実際の lesson 描画では default 値しか使われない**（最大の構造的負債）

優先度の高い修正は #2 Critical 4 件と、props 渡し設計の見直し。それ以外は段階的に整理可能。

---

## 2. Critical Issue（動作・型・a11y に直接影響）

### C1. `var(--serif)` を 6 箇所で参照（未定義変数）

CLAUDE.md L176 で `var(--serif)` は **defined されていない** ことが明記されているにもかかわらず Phase 2 で使用されている。Vite ビルドは通るがランタイムでは fallback して font-family 指定が無効化される。

| ファイル | 行 | 該当 |
|---|---|---|
| `src/visuals/FeedbackLoopVisual.tsx` | 165 | `style={{ fontFamily: 'var(--serif)' }}` (中央 ↻ / ⇌ グリフ) |
| `src/visuals/visuals-phase2.css` | 222 | `.vz-ff-factor .value` |
| `src/visuals/visuals-phase2.css` | 239 | `.vz-ff-times` |
| `src/visuals/visuals-phase2.css` | 256 | `.vz-ff-equals .symbol` |
| `src/visuals/visuals-phase2.css` | 284 | `.vz-ff-result .value` |
| `src/visuals/visuals-phase2.css` | 369 | `.vz-fbl-badge .glyph` |

**改修案:** すべて削除（system-ui fallback で十分）。数式の見栄えを変えたければ `font-family: 'Inter Tight', Inter, sans-serif;` のように具体名を指定する（`visuals.css` L382 で前例あり）。

---

### C2. registry が props を渡せないので props 付き visual の汎用性が無効化されている

`src/visuals/index.ts:63` の `visualRegistry: Record<string, ComponentType>` と `renderVisual(id: string) → createElement(Comp)` は**引数なし生成**しかしない。Phase 2 で「6 レッスン以上で流用される基幹コンポーネント」として丁寧に作り込まれた以下の visual はすべて lesson 描画では default 値しか出ない:

| Visual | 想定流用 lesson |
|---|---|
| `Two2MatrixVisual` (`Two2MatrixProps`) | lesson-54 / 86 / 321 / 322 / 412 ほか — caseLessons/criticalLessons/peakPerformance/problemSetting/proposalCourse/strategy で計 7 回登録 |
| `FermiFormulaVisual` (`FermiFormulaProps`) | lesson-89 / 201-203 — fermi/clientWork で 4 回登録 |
| `FeedbackLoopVisual` (`FeedbackLoopProps`) | lesson-65 / 66 / 67 / 313 — systemsThinking で 1 回登録 |
| `ThreePillarsVisual` (`ThreePillarsProps`) | 28/72/89/96/315/358 ほか — 13 回登録（最多） |
| `CausalLoopDiagramVisual` (props nodes/edges) | lesson-67 ほか |
| `AbstractionLadderVisual` (props rungs) | lesson-68 / 507 — 2 回登録 |
| `LogicTreeVisual` (props data) | logic/case/hypothesis/issue/proposalCourse — 6 回登録 |
| 他 props 化された `Tier[]` `Hat[]` `Force` 等 |

**改修案 (2 段階):**

1. **短期:** `LessonSlide` に `visualProps?: Record<string, unknown>` を追加し、`renderVisual(id, props?)` で `createElement(Comp, props)` に変える。`step.visual` を `{ id: string, props?: object }` 形式に拡張するか、別フィールド `visualProps` を持たせる。
2. **長期:** registry を `Record<string, { Comp: ComponentType<any>; PropsSchema?: ZodType }>` にして、lesson 側からの props を validate する。

現状の lesson は default 値で困らない設計なので**機能不全ではない**が、設計意図と実装が乖離している = 将来の差別化に効かない死に金になっている状態。優先度は高い。

---

### C3. SVG に role/aria 指定がバラバラ — 装飾 svg にも screen reader 経由で記号が読み上げられる

`aria-hidden="true"` を付けてある svg と、付け忘れている装飾 svg が混在している。**装飾目的の svg はすべて `aria-hidden="true"`、意味ある svg は `role="img"` + `aria-label` が原則。**

`aria-hidden` を付け忘れている装飾 svg:

| ファイル | 行 |
|---|---|
| `src/visuals/MecePatternsVisual.tsx` | 15 (mini-tree 線) |
| `src/visuals/CausalLoopDiagramVisual.tsx` | 66 (CLD path 群) |
| `src/visuals/DistributionShapeVisual.tsx` | 22, 53 (分布曲線) |
| `src/visuals/ExponentialCurveVisual.tsx` | 44 (指数グラフ — これは意味ある図) |
| `src/visuals/TrolleyProblemVisual.tsx` | 20 (線路図) |
| `src/visuals/CorrelationCausationVisual.tsx` | 21 (因果図) |
| `src/visuals/DesignThinkingCycleVisual.tsx` | 39 (5 ステップ円環) |
| `src/visuals/LogicTreeVisual.tsx` | 88 (これは `aria-hidden` 付いてた) |
| `src/visuals/WhyWhyParallelVisual.tsx` | 30 (これも `aria-hidden` 付いてた) |
| `src/visuals/WhyWhyVsLogicTreeVisual.tsx` | 36 (`aria-hidden` 付いてた) |

**改修案:** `ExponentialCurveVisual` の指数グラフだけは `role="img" aria-label="20年で複利は線形の6.7倍に達する"` の形にして他はすべて `aria-hidden="true"` を補う。

---

### C4. インタラクティブ要素のアクセシビリティが部分的に欠落

- `SystemArchetypeVisual.tsx:104` の tab ボタンは `role="tablist"` 親 + `role="tab"` + `aria-selected` 付き ✅
- `AbstractionLadderVisual.tsx:75` の rung ボタンは `aria-pressed` 付き ✅
- `LogicTreeVisual.tsx:118-128` の展開ボタンは aria 状態なし ❌（`aria-expanded` か `aria-controls` 推奨）

`AbstractionLadderVisual` `LogicTreeVisual` `SystemArchetypeVisual` の 3 つだけが state を持つインタラクティブ visual。LogicTree だけ aria 状態が抜けている。

**改修案:** `LogicTreeVisual.tsx:118` の「← 戻す」「次の層を開く →」ボタン群に `aria-label="ツリーの第 N 層に縮小"` 等を付ける。または親 div に `role="region" aria-label="ロジックツリー（現在 N 層展開中）"` を付与。

---

## 3. Major Issue（規約違反・一貫性崩壊）

### M1. 絵文字を hint pill で 38 ファイルが使用 — `feedback_app_copy_neutral` & 「UI に emoji 不使用」規約違反

CLAUDE.md L204 に「**Icons** — use SVG from `src/icons/index.tsx`, never emoji in UI. Exception: ジャーナル機能 (4 箇所のみ)」と明記。`💡` `⚠` `✓` `✗` が 42 visual のほぼ全部の hint pill 末尾に入っている (38 ファイル、計 41 箇所)。

**問題点:**
- 既存 10 件 (`MecePatternsVisual` `LogicTreeVisual` `Deduction` `Induction` `CaseStudy`) で先行採用されたパターンを Phase 1/2/3a/3b/3c の新規 32 件が踏襲してしまった
- iOS/Android のシステム絵文字フォントが OS バージョンで化けたり色味が違ったりして、デザインの一貫性が崩れる
- スクリーンリーダーが「light bulb」「warning sign」と読み上げる

**改修案 (3 つから選択):**
1. **絵文字を SVG icon 置換**: `src/icons/index.tsx` の `LightbulbIcon` `AlertTriangleIcon` `CheckIcon` `XIcon` を hint pill 先頭に置く（既存 `WhyWhyStopRuleVisual` がアイコン使用の良い前例）
2. **絵文字を全削除**: hint text のみ。情報量は維持される
3. **既存 10 件の絵文字も一括剥がし**: 規約一貫性を優先するならこちら

優先度: 既存仕様との整合を考えると #1（アイコン置換）が手戻り最小。

---

### M2. Props 型の export 規約がバラバラ

| 命名規約 | ファイル数 | 例 |
|---|---|---|
| `export type XxxProps = {...}` (公開) | 6 件 | `FermiFormulaProps`, `Two2MatrixProps`, `FeedbackLoopProps`, `MeceVennProps`, `GraphPitfallsProps`, `ThreePillarsProps` |
| `type Props = {...}` (内部のみ) | 15 件 | `ScrStructureVisual`, `SixHatsVisual`, `ScamperVisual` ほか |
| props なし | 27 件 | `EmpathyMapVisual` `JtbdVisual` ほか |

**問題:** Phase 2 (6 件) だけ「外部に再利用される型として export」、他 Phase は「内部 only」というブレ。

**改修案:** Two2Matrix / FeedbackLoop / ThreePillars / FermiFormula など、複数 lesson で props 違いを使い分ける想定（C2 で実現すべき）の visual は `export` で公開、本当に 1 lesson 専用の visual は `type Props` で内部に閉じる、というルールを `docs/VISUAL_AUTHORING.md`（新設）に書く。命名は **`<ComponentName>Props`** 一本化を推奨。

---

### M3. CSS 取り込み方式の不整合（Phase 3-A だけ画面側 import）

| Phase | CSS ファイル | import 場所 |
|---|---|---|
| 既存 | `visuals.css` | `LessonStoriesScreen.tsx:22`（画面側） |
| Phase 1 | `visuals-whywhy.css` | 各 `WhyWhy*.tsx` 先頭で side-effect import |
| Phase 2 | `visuals-phase2.css` | 各 `*.tsx` 先頭 |
| **Phase 3-A** | `visuals-phase3a.css` | **`LessonStoriesScreen.tsx:23` のみ**（画面側） |
| Phase 3-B | `visuals-phase3b.css` | 各 `*.tsx` 先頭 |
| Phase 3-C | `visuals-phase3c.css` | 各 `*.tsx` 先頭 |

Phase 3-A の visual (`IcebergModelVisual`, `SystemArchetypeVisual`, `CausalLoopDiagramVisual`, `EmpathyMapVisual`, `JtbdVisual`, `DesignThinkingCycleVisual`, `HypothesisFlowVisual`, `MvpTestDesignVisual`) は自分で CSS を import していない。

**問題:**
- `LessonStoriesScreen.tsx` 以外の場所で Phase 3-A visual を使うと **CSS が読み込まれず崩れる**（StoryBook 的な使い方や、将来 Roadmap プレビュー画面に流用したら即バグ）
- 既存 `visuals.css` も画面側 import なので**既存 10 件 + Phase 3-A の 8 件、合計 18 件が画面依存**

**改修案 (2 択):**
1. **統一案 A (推奨)**: Phase 3-A visual に `import './visuals-phase3a.css'` を各ファイル先頭に追加し、`LessonStoriesScreen.tsx:23` の import を削除。同じく `visuals.css` も既存 10 件の各 tsx 側に分散させる（or `visuals/index.ts` で side-effect 一括 import） → 全 phase が「visual ファイル単独で完結」原則
2. **統一案 B**: 全 phase の CSS import を `LessonStoriesScreen.tsx` に集約 → 「画面側で一括ロード」原則。但し Phase 1/2/3b/3c の各 visual 側 import も全部消して回る必要があるので変更量大

A 案が拡張性で勝るので推奨。

---

### M4. ハードコード hex が CSS + tsx で 100 箇所超

`grep -E "#[0-9A-Fa-f]{6}" src/visuals/*.css` で **116 件**、tsx 側でも複数。CLAUDE.md L176「**Do not hardcode hex colors** — use CSS vars」違反。代表例:

- `#6C8EF5`, `#2E45A8`, `#5478E8` (brand 系) → `var(--brand)`, `var(--brand-dark)`, `var(--brand-light)` で完全代替可能
- `#DB2777` (ピンク系) → tokens に `--danger-pink` 等を追加するか、`var(--danger)` で統合
- `#059669` (緑) → `var(--success)` 代替
- `#DC2626` `#92400E` → `var(--danger)` `var(--warning)` 代替

特にひどい箇所:

| ファイル | 行 | 内容 |
|---|---|---|
| `VerticalVsLateralVisual.tsx` | 69 | `style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #4C1D95 100%)' }}` (新規 hex 直書き) |
| `PyramidVisual.tsx` | 59, 63 | `background: 'rgba(245, 191, 160, 0.20)'`, `color: '#92400E'` |
| `DistributionShapeVisual.tsx` | 87 | `color: '#92400E'` |
| `AbsoluteVsRelativeVisual.tsx` | 50 | `color: '#92400E'` |
| `FallacyGridVisual.tsx` | 70 | `color: '#92400E'` |
| `CorrelationCausationVisual.tsx` | 28-30 | `<linearGradient><stop stopColor="#6C8EF5"/>` |

**改修案:** 段階対応。
1. (今すぐ) `tokens.css` に `--brand-grad: linear-gradient(135deg, #6C8EF5 0%, #2E45A8 100%);` `--danger-pink: #DB2777;` 等を追加して、新規 phase ファイルの hex を順次置換
2. 既存 `visuals.css` の brand グラデは `var(--brand-grad)` で一掃
3. `#92400E` のような warning 系暗色は `--warning-dark` を tokens に足す

---

### M5. props 設計のばらつき — default 値定義パターンが 3 種類

```tsx
// パターン A (Two2Matrix, FeedbackLoop, ThreePillars, ...) — DEFAULT_PROPS オブジェクト方式
const DEFAULT_PROPS: Required<ThreePillarsProps> = {...}
export function ThreePillarsVisual(props: ThreePillarsProps = {}) {
  const { ... } = { ...DEFAULT_PROPS, ...props }
}

// パターン B (ScrStructureVisual, WhereWhyHowVisual, SixHatsVisual, ...) — 個別 default 定数 + 分割代入
const defaultSituation: ScrStep = {...}
export function ScrStructureVisual({ situation = defaultSituation, ... }: Props) {}

// パターン C (FermiStepsVisual, DesignThinkingCycleVisual, ...) — モジュールトップに const として埋め込み（props 化なし）
const steps: Step[] = [...]
export function FermiStepsVisual() {...}
```

**改修案:** 「props 化する visual はパターン B」「props 化しない（lesson 専用固定図解）はパターン C」の 2 原則に統一。パターン A は Required 型と二重定義になりやすく避けるべき。

---

### M6. FeedbackLoopVisual L220 に冗長な optional chaining + non-null 連発

```tsx
{nodes[i]?.label.length && nodes[i]!.label.length > 5
  ? nodes[i]!.label.slice(0, 5) + '…'
  : nodes[i]?.label}
```

`nodes` は length に基づいて positions を作っているので `nodes[i]` は必ず存在する。`!.` も `?.` も不要。

**改修案:**
```tsx
const node = nodes[i]
if (!node) return null
return <text ...>{node.label.length > 5 ? node.label.slice(0, 5) + '…' : node.label}</text>
```

---

### M7. `var(--warning-mid)` `var(--warning-soft)` は OK だが `var(--warning)` ≠ tokens 定義位置

`tokens.css:73-76` で `--warning: #D97706` `--warning-soft: rgba(217, 119, 6, 0.10)` 定義あり = OK。**ただし `var(--warning)` を文字色に使うと WCAG コントラスト比 4.5:1 を割る可能性**（白背景上で 3.8:1）。

特に `WhyWhyEvidenceVisual.tsx:48` `DistributionShapeVisual.tsx:87` `AbsoluteVsRelativeVisual.tsx:50` `FallacyGridVisual.tsx:70` で `color: 'var(--warning)'` または `#92400E` に背景 `var(--warning-soft)` の組み合わせ。`#92400E` (warning-dark 系) の方は十分なコントラスト確保できているが、`var(--warning)` の方はちょっと薄い。

**改修案:** `tokens.css` に `--warning-dark: #92400E;` を追加し、AAA レベルが必要な hint pill では `color: var(--warning-dark)` を使うルールにする。

---

### M8. `type Node` がグローバル `Node` (DOM) と衝突

`TriadVisual.tsx:9`
```tsx
type Node = {
  label?: string
  name: string
}
```

TypeScript はモジュールスコープなので実害は出ないが、IDE のホバーで DOM `Node` がサジェストされたり、後の作業者が混乱する。

**改修案:** `type TriadNode = {...}` に rename。同様の懸念は `type Step` (3 ファイル独立定義) `type Branch` (2 ファイル) `type Side` `type Hat` `type Force` 等にもある — 全部 prefix 化推奨。

---

### M9. WhyWhyPitfallsVisual の `IconType` 自家製定義

```tsx
type IconType = ComponentType<SVGProps<SVGSVGElement> & { width?: number; height?: number }>
```

`src/icons/index.tsx` の icon が既に同じシグネチャ前提なので、icons 側で `export type IconComponent = ...` を出して共有すべき。

---

## 4. Minor Issue（スタイル・命名・コメント）

### m1. 41 ファイルで同じ inline hint pill コードがコピペ

```tsx
<div style={{
  marginTop: 12, padding: '8px 10px', background: 'var(--brand-soft)',
  borderRadius: 8, fontSize: 11, fontWeight: 600, color: 'var(--brand)', textAlign: 'center',
}}>💡 ...</div>
```

**改修案:** `src/visuals/VisualHint.tsx` を新設して共通化:

```tsx
type Props = { tone?: 'brand' | 'warning'; icon?: ReactNode; children: ReactNode }
export function VisualHint({ tone = 'brand', icon, children }: Props) {
  return <div className={`vz-hint vz-hint--${tone}`}>{icon}{children}</div>
}
```

対応 CSS 1 ブロックを `visuals.css` に追加すれば、全 42 visual の hint 6-7 行が `<VisualHint tone="warning"><LightbulbIcon/>...</VisualHint>` 1 行に。

---

### m2. JSDoc コメントの「lesson-N step.X」が古い／誤参照のリスク

各 visual の冒頭 comment に `lesson-340 step.visual=...` 等が書いてあるが、lesson 側を変更したときに同期が取れない。

**改修案:** lesson ID は書かず、「**Used by:** `whyWhyLessons.ts`」程度に留める。あるいは Vitest で「visual に書かれた lessonId と実 lessonId が一致」を assert する snapshot を作る。

---

### m3. `LogicTreeVisual.tsx:55` の hint default に `💡` 文字埋め込み

```tsx
hint = '💡 Why（なぜ？）と How（どうすれば？）は混ぜない',
```

絵文字を default 文字列に焼き付けると、`hint={null}` で消す以外で剥がせない。**propsに icon は分離して default `<LightbulbIcon/>`**、text は別 prop が望ましい (m1 と合わせて解消可)。

---

### m4. data-testid が全 visual で 0 件

```bash
$ grep -n "data-testid" src/visuals/*.tsx → 0
```

Playwright E2E で「特定 visual の出現」を確認したい時、現状は SVG クラス名や text content の seek に頼るしかない。

**改修案:** `VisualSlide` wrapper に `data-testid={`visual-${visualId}`}` を付与（visualId を prop で受け取る）。すると 1 箇所の修正で全 visual に testid が付く。

---

### m5. `FermiStepsVisual.tsx:77` の hint pill に「。」終端

他の hint pill (40 件以上) は句点なし、ここだけ「STEP 4 の検算がフェルミ推定の質を決める。一発回答で終わらせない。」と 2 文 + 句点。**文体ガイドラインを書く（feedback_app_copy_neutral 派生）べき**。

同様に `WhyWhyChainVisual.tsx:54` 「3回前後で「直接原因」、5回前後で「打ち手が打てる構造」に届く」のような「読点で繋いだ長文」もあって、トーンが揺れている。

---

### m6. `DesignThinkingCycleVisual.tsx:96` の小さい en ラベル `fontSize: 8`

英字 8px は iOS Safari で読めない領域。最小 9-10px 推奨。同様の極小 fontSize 利用:

- `EmpathyMapVisual` 9px
- `JtbdVisual.tsx:14-16` `fontSize: 9` でカッコ書き
- `MeceVennDiagram` SVG text `fontSize: 8`
- `GraphPitfallsVisual` SVG text `fontSize: 6` (流石に小さすぎ)
- `TrolleyProblemVisual` SVG text `fontSize: 7-8`

**改修案:** SVG `<text>` の viewBox 内 font-size と CSS px は別物だが、最終レンダリングで実 7-9px 相当になる場合は要修正。`fontSize: 6` の `GraphPitfallsVisual` は viewBox=84x60 で実 px が小さく出る可能性高。

---

### m7. comment の前提が間違ってる箇所

`FeedbackLoopVisual.tsx:8` `// default: lesson-65 step.1「貯金が貯金を呼ぶ強化ループ」`
→ `systemsThinkingLessons.ts:35` で `lesson-65` に紐付くのは step.0 で `visual: 'FeedbackLoopDiagram'`、step.1 ではない。
（jsdoc の lesson 番号と実 lesson の対応はずれているケースが他にも複数ありそう）

---

### m8. `WhyWhyPitfallsVisual.tsx:54,60` の `aria-label="bad"` `aria-label="good"` は英単語のまま

スクリーンリーダーが「bad」「good」とそのまま読み上げる。日本語環境では違和感。

**改修案:** `aria-label="悪い例"` `aria-label="良い例"`。

---

### m9. `VerticalVsLateralVisual.tsx:69` で props を無視した hex 直書きグラデ

```tsx
<span className="vz-vvl-pill top" style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #4C1D95 100%)' }}>
```

紫グラデを style で上書き。`.vz-vvl-pill.top` がデフォで brand 青グラデなので、ここだけ「水平思考 = 紫」を強調したかった意図と思われる。**`.vz-vvl-pill.top.lateral-summary`** のような CSS 修飾子に逃がす。

---

### m10. PyramidVisual の hint pill だけ「↓ Why So? / ↑ So What?」記号 + 既存パターン外

`PyramidVisual.tsx:56-67` のフッターは他 visual の hint pill フォーマットと違って、↓↑ 矢印で説明を兼ねる独自スタイル。`💡` がない代わりに `rgba(245, 191, 160, 0.20)` + `#92400E` のオレンジ系。これは Pyramid 固有でも OK だが、共通化するなら `<VisualHint tone="warning">` で吸収可。

---

## 5. Lesson 紐付けの妥当性（95 件）

### 5-1. visualId の整合性

`src/visuals/index.ts` の registry 登録 49 件と、`src/*Lessons.ts` の使用 ID 49 種類が**完全一致**。未マッチ ID なし。

```
registry: 49 種類
使用 ID:  49 種類
集合差:    なし
```

### 5-2. step type の整合性

`type=quiz/think/case` の step に `visual:` フィールドが紛れ込んでいるケース: **0 件**。すべて `type=explain` のみで 95 件正しく宣言されている。

### 5-3. 1 step に複数 visual: 0 件

`visual:` は同一 step オブジェクトに 1 つだけ。

### 5-4. lesson ファイルごとの紐付け数（上位）

| ファイル | 紐付け数 |
|---|---|
| `logicLessons.ts` | 10 |
| `whyWhyLessons.ts` | 8 |
| `clientWorkLessons.ts` | 7 |
| `criticalLessons.ts` | 7 |
| `extraLessons.ts` | 7 |
| `numeracyLessons.ts` | 6 |
| `fermiLessons.ts` | 5 |
| `proposalCourseLessons.ts` | 5 |
| `strategyLessons.ts` | 5 |
| 計 24 ファイル | **95 件** |

### 5-5. 偏り注意

| visualId | 使用回数 | 用途偏り |
|---|---|---|
| `ThreePillarsDiagram` | **13** | 「3 つあれば何でも」感が強く、別 visual で適合する lesson もあるはず。例: `extraLessons.ts:118` HMW (How Might We) で ThreePillars は微妙、`WhereWhyHowDiagram` の方が概念合致 |
| `Two2MatrixDiagram` | 7 | OK |
| `LogicTreeDiagram` | 6 | OK |
| `FermiFormulaDiagram` | 4 | OK |

**改修案:** `extraLessons.ts:118` (HMW) と `extraLessons.ts:149` (PMI 法) の `ThreePillarsDiagram` は再検討候補。HMW は専用 visual 新規作成、PMI は Plus/Minus/Interesting の 3 列なので ThreePillars でも妥当。

### 5-6. en 版 lesson に visual 18 件

`logicLessonsEn.ts` 10 件、`whyWhyLessonsEn.ts` 8 件で日本語版 visualId を使い回している。registry に存在するので動作はする。**ただし en 用の翻訳・文字幅対応が visual 側に入っていないため、英語ラベルで描画したときに layout 崩れの可能性**（visual 内の日本語固定文字列は そのまま日本語で表示される）。

**改修案:** 当面は問題なしだが、将来 i18n 対応するなら `useTranslation` を visual 側にも入れる必要がある。

---

## 6. 推奨リファクタ案（共通化・統合の余地）

### R1. `<VisualHint />` 共通コンポーネント新設

42 ファイル × 平均 8 行の inline hint pill を 1 行化。同時に M1（絵文字→アイコン）解決。

```tsx
// src/visuals/VisualHint.tsx
import type { ReactNode } from 'react'
import { LightbulbIcon, AlertTriangleIcon, CheckIcon } from '../icons'

type Tone = 'brand' | 'warning' | 'success'
type Props = { tone?: Tone; children: ReactNode }

const ICON: Record<Tone, typeof LightbulbIcon> = {
  brand: LightbulbIcon, warning: AlertTriangleIcon, success: CheckIcon,
}

export function VisualHint({ tone = 'brand', children }: Props) {
  const Icon = ICON[tone]
  return (
    <div className={`vz-hint vz-hint--${tone}`}>
      <Icon width={14} height={14} aria-hidden="true" />
      <span>{children}</span>
    </div>
  )
}
```

`visuals.css` に対応する `.vz-hint` 系を追加して、42 ファイルから inline style を一掃。

### R2. CSS 5 ファイル統合 → `visuals.css` 1 本化（または phase 別 import を index.ts に集約）

phase ファイルを分けたメリットは小さく、合計 8 ファイル import が分散している現状はコスト超過。

**統合案:** `src/visuals/index.ts` の先頭で
```ts
import './visuals.css'
import './visuals-whywhy.css'
import './visuals-phase2.css'
import './visuals-phase3a.css'
import './visuals-phase3b.css'
import './visuals-phase3c.css'
```
を一括宣言し、各 visual ファイル先頭の `import './visuals-*.css'` 全 32 件を削除。`LessonStoriesScreen.tsx` の 2 行 import も削除可能。

**M3 (Phase 3-A 不整合) もこれで解消**。

### R3. props 渡し基盤の整備（C2 解決の前提）

`src/lessonSlides.ts` の `VisualSlide` type に `visualProps?: Record<string, unknown>` を足し、`renderVisual(id, props?)` に拡張。これで `ThreePillarsVisual` を lesson 個別の `pillars` で呼べる。

### R4. `<TwoSideCompare />` `<NumberedStack />` `<TriadGrid />` のようなレイアウト原型を抽出

新規 42 件のうち以下は**ほぼ同じレイアウトの組み合わせ**:

- 左右 2 カラム比較 (10 件): `WhyWhySymptomVsRoot` `WhyWhyVsLogicTree` `HypothesisFlow` `VerticalVsLateral` `MentalMathDecisionTree`(片側 3 分岐) ほか
- 縦並び 4-5 ステップ Stack (7 件): `FermiSteps` `MvpTestDesign` `Scamper` `WhyWhyChain` `Vrio` `WhyWhyToyota` `WhereWhyHow`
- 3 列カード (6 件): `ThreePillars` `WhyWhyPitfalls` `Triad` `GraphPitfalls` `MeceVenn` `FiveForces`(変形)

これらを `<CompareTwo left={...} right={...} />` `<NumberedStack items={...} />` 等にレイアウト原型化すれば、新規 visual 追加コストが下がる。

### R5. `docs/VISUAL_AUTHORING.md` の新設

以下を成文化:
- 命名規約（`*Visual.tsx` / `<VisualName>Props` export）
- 絵文字禁止・アイコン使用
- CSS 変数のみ（hex 禁止）
- props は内部固定 or 公開 props のどちらか明示
- a11y: 装飾 svg は `aria-hidden`、意味ある svg は `role="img"` + `aria-label`
- comment は lesson 番号を埋め込まない
- 共通 `<VisualHint>` 使用

5 agent 並列実装の規約ブレを避けるための保険。

---

## 7. 修正優先順位

### Phase 0（今すぐ）: 動作影響が出る修正
1. **C1**: `var(--serif)` 6 箇所削除（5 分作業、確実な視覚バグ修正）
2. **C3**: SVG `aria-hidden` 補強（30 分、a11y）
3. **M6**: `FeedbackLoopVisual.tsx:220` 冗長 nullable 整理（10 分）

### Phase 1（次のスプリント）: 規約整合と保守性
4. **R5**: `docs/VISUAL_AUTHORING.md` 作成（次の visual 追加時の事故防止）
5. **R1** + **M1**: `<VisualHint>` 共通化 + 絵文字→アイコン置換（半日、42 ファイル touch だが mechanical）
6. **M3** + **R2**: CSS import を `index.ts` 集約 (1 時間)
7. **C4**: LogicTree ボタン aria 強化 (10 分)
8. **m4**: `VisualSlide` に `data-testid` 追加 (5 分)

### Phase 2（次々スプリント）: 構造改善
9. **C2** + **R3**: registry に props 渡し対応 — `LessonSlide.visualProps` 拡張 (半日 + lesson データ拡張作業)
10. **M2**: Props 型 export 規約統一 (半日、命名 rename)
11. **M5**: default 値定義パターン B 統一 (半日)
12. **M4**: ハードコード hex を tokens 経由に置換 (1 日、大量 grep-replace + tokens 拡張)

### Phase 3（バックログ）: 仕上げ
13. **M8** **M9**: `type Node` 等 prefix 化、`IconType` 共通化
14. **m1-m10**: 小粒スタイル統一
15. **5-5**: `ThreePillars` 偏り解消（lesson 側で別 visual に振り直し）
16. **R4**: レイアウト原型抽出（visual 増えてきたら）

---

## 付記: 計測値サマリ

| 指標 | 値 |
|---|---|
| 新規 visual ファイル数 | 42 |
| 既存 visual ファイル数 | 10 + VisualSlide wrapper |
| visual CSS ファイル数 | 6 (visuals.css + phase 5 ファイル) |
| 全 visualId 登録数 | 49 |
| lesson 紐付け数（日本語版） | 95 |
| lesson 紐付け数（英語版） | 18 |
| `type=quiz/think/case` 混入数 | 0 ✅ |
| 未マッチ visualId | 0 ✅ |
| `any` 使用 | 0 ✅ |
| `as` キャスト | 0 ✅ |
| 絵文字使用 (💡⚠✓✗) | 38 ファイル / 41 箇所 ❌ |
| ハードコード hex (CSS) | 116 件 ❌ |
| `var(--serif)` 参照（未定義） | 6 件 ❌ |
| SVG `aria-hidden` 欠落 | 7 件以上 ❌ |
| `data-testid` 設置 | 0 ❌ |
| Hint pill コピペ | 41 箇所 ⚠ |
| `tsc -b --noEmit` | ✅ pass |
| `eslint src/visuals/` | ✅ pass |
