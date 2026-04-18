# Logic UI Redesign — 設計提案書
**作成: Apollo / 2026-04-18**
**ステータス: 各CXOレビュー待ち → 実装前**

---

## 現状の診断

### 根本問題
1. **インラインstyleの氾濫** — HomeScreen 100箇所、全画面合計400+箇所。デザインシステムが無効化されている
2. **コンポーネントの欠如** — `<Card>`, `<Section>`, `<Stat>` などのUIパーツがなく、各画面が独自実装
3. **トークンの不整合** — `tokens.css` に変数はあるが、実際のコンポーネントで使われていない（`--brand`より`#3D5FC4`が直書きされているケースも）
4. **参照ブランドとのギャップ** — Brilliant/Linearを目指しているが、実態はBootstrap的な「作った感」

### ベンチマーク分析
| アプリ | 強み | Logicが学ぶべき点 |
|--------|------|-----------------|
| Duolingo | 感情的報酬・習慣ループ | ストリーク演出・正解アニメーション |
| Brilliant | 洗練されたUI・インタラクティブ | 余白設計・タイポグラフィ |
| Linear | デザインシステムの完成度 | コンポーネント粒度・一貫性 |
| Headway | 読みやすさ・コンパクト性 | カード設計・情報密度 |

---

## 新デザインシステム設計案

### 1. デザイン哲学（変更なし、より徹底）

```
Less chrome, more content.
感情的報酬 > 情報量
余白は「空き」ではなく「呼吸」
```

### 2. カラーシステム（リファクタ）

**問題**: 現在 `--brand`, `--accent`, `--primary` など似た変数が乱立

**新トークン体系（意味ベース）**:
```css
/* Intent-based tokens（何に使うかで命名）*/
--color-action:        #3D5FC4  /* ボタン・リンク・選択状態 */
--color-action-hover:  #2E4BA8
--color-action-surface:#EEF2FE  /* アクション要素の背景 */

--color-surface-0:     #FFFFFF  /* カード */
--color-surface-1:     #F8F9FC  /* ページ背景 */
--color-surface-2:     #F0F2F8  /* セクション背景 */

--color-text-primary:  #0D1220
--color-text-secondary:#4A5068
--color-text-muted:    #9CA3AF

--color-success:       #059669
--color-warning:       #D97706  /* ストリークのみ */
--color-danger:        #DC2626

--color-border:        #E2E5F0
```

**廃止**: `--cat-boki3`, `--cat-boki2`, `--cat-pm` など簿記カテゴリカラー（Logicには不要）

### 3. タイポグラフィ（強化）

**現状**: Inter + Inter Tight（Google Fonts）→ 悪くないが「使いこなせていない」

**新方針**:
```
Display（h1/数値）: Inter Tight 800 / letter-spacing -0.03em
Heading（h2/h3）:  Inter 700    / letter-spacing -0.02em
Body:              Inter 400/500 / letter-spacing -0.005em
Label/Eyebrow:     Inter 700    / letter-spacing 0.10em / uppercase
```

**サイズスケール（8px base）**:
```
xs: 11px  → ラベル・eyebrow
sm: 13px  → 補助テキスト
md: 15px  → 本文（基準）
lg: 17px  → 強調本文
xl: 20px  → h3相当
2xl: 24px → h2相当
3xl: 32px → h1相当
4xl: 48px → 大数値（スコア等）
```

### 4. スペーシング（統一）

**現状**: `var(--s-3)`, `var(--s-4)` は定義されているが「px何個分？」が不明確

**新スケール（4px base）**:
```
--space-1:  4px
--space-2:  8px
--space-3:  12px
--space-4:  16px
--space-5:  20px
--space-6:  24px
--space-8:  32px
--space-10: 40px
--space-12: 48px
```

### 5. コンポーネント体系（新設）

**現在ないもの → 作るもの**:

```
src/components/
├── layout/
│   ├── Screen.tsx       ← ページラッパー（padding, animation）
│   ├── Section.tsx      ← セクションラッパー（見出し + children）
│   └── Stack.tsx        ← 縦並びflexbox（gap prop）
├── ui/
│   ├── Card.tsx         ← 既存を強化（variant: default/soft/outline）
│   ├── StatCard.tsx     ← ストリーク・ポイント等の数値カード
│   ├── Badge.tsx        ← ラベル・タグ
│   ├── ProgressBar.tsx  ← 既存を独立コンポーネント化
│   └── EmptyState.tsx   ← 空状態の統一UI
├── Button.tsx           ← 既存（整理）
└── IconButton.tsx       ← 既存（整理）
```

### 6. HomeScreen リデザイン（最重要）

**現状の問題**: 情報が多すぎ・グリッドが汚い・スクロールが長い

**新レイアウト案**:
```
┌─────────────────────────┐
│ Header（Logo + 設定）    │
├─────────────────────────┤
│ Hero Card               │
│ 「今日のフェルミ」        │ ← 毎日開く理由・最重要
│ [チャレンジする →]       │
├─────────────────────────┤
│ Stats Row（3つのみ）     │
│ 🔥7日 │ ⭐420pt │ 📈68  │ ← ストリーク・ポイント・偏差値
├─────────────────────────┤
│ 学習パス（カテゴリ選択）  │
│ [フェルミ] [ロジック]    │
│ [ケース]                │
├─────────────────────────┤
│ 練習メニュー（2つ）      │
│ [ロールプレイ] [AI生成]  │
└─────────────────────────┘
```

**削除・格納するもの**:
- ランキング → 別タブ or 非表示
- 偏差値詳細 → タップで展開
- 週次グラフ → プロフィール画面

### 7. アニメーション設計

**現状**: keyframeはあるが、使用が散発的で統一感なし

**新方針（3原則）**:
1. **Purposeful** — 状態変化の「理由」があるアニメのみ
2. **Fast** — 200ms以下。待たせない
3. **Physical** — ease-out基調。「落ちる・着く」感

```css
--ease-out:   cubic-bezier(0.0, 0, 0.2, 1)   /* 標準 */
--ease-spring: cubic-bezier(0.34, 1.56, 0.64, 1) /* 弾性（正解演出等） */
--duration-fast: 150ms
--duration-base: 250ms
--duration-slow: 400ms
```

---

## 実装フェーズ計画

### Phase 1（1日）: 基盤整備
- `tokens.css` リファクタ（意味ベーストークンに統一）
- `Screen.tsx`, `Section.tsx`, `Stack.tsx` 作成
- `StatCard.tsx` 作成

### Phase 2（1〜2日）: HomeScreen刷新
- インラインstyle撲滅
- 新レイアウト適用
- モバイル/デスクトップ両対応

### Phase 3（1日）: 学習画面刷新
- LessonScreen, FermiScreen, DailyFermiScreen
- クイズ選択肢アニメーション強化

### Phase 4（0.5日）: 残画面整理
- RoadmapScreen, LoginScreen, FeedbackScreen

---

## 未決事項（各CXOへの質問）

**→ CPO**: HomeScreenのHero Cardに「今日のフェルミ」を最上部に持ってくることに同意するか？ユーザーの「毎日開く理由」として最優先と考えているが
**→ CTO**: Phase1〜4の順序・工数見積もりに問題はあるか？特にトークンリファクタ時の既存画面への影響範囲
**→ CMO**: 新デザインはStripeやApple Storeのレビュー審査に影響するか？スクリーンショットが変わるため
**→ COO**: デプロイ後にSIT確認→本番反映のサイクルをどう回すか。1フェーズごとにSITリリースか、まとめてか
