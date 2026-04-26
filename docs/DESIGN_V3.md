# Logic v3 — Design Specification
> 正式版 リデザイン仕様書（2026-04-26）
> Awarefyテイスト × 実写ヒーロー画像 × Storiesスタイルレッスン

---

## 0. ドキュメント目的

業務要求書（BR-01〜05、FR-01〜04、UX-01〜05、NFR-01〜03）に対する**実装仕様**を定義する。
モックアップ（`https://bqggwcso.gensparkclaw.com/mockup/lv3-*.html`）を正とし、コード実装はこの仕様に従う。

実装範囲：
- 全主要画面（ホーム・コース・レッスン・記録・プロフィール・完了）
- レッスン体験のStories型再構成（全48レッスン）
- 配色・タイポ・コンポーネントの全面刷新

---

## 1. デザイン基本方針

### 1.1 コアコンセプト
**「論理思考を、もっと優しく」**
Awarefyの「メンタルケアを温かく支える」世界観をベースに、Logicは「論理思考の習慣化」を優しい没入感のあるダークテーマで実現する。

### 1.2 5つの形容詞
- Immersive（没入感）
- Gentle（優しい）
- Systematic（整然）
- Serene（穏やか）
- Supportive（支える）

### 1.3 業務要求対応
| 要求ID | 対応 |
|---|---|
| BR-01 配色刷新 | ライト青→**ダークティール+ミント**へ全面変更 |
| BR-02 参考踏襲 | Awarefyの色温度・カード階層をベース |
| BR-03 レッスン再設計 | **Stories型（1画面1ポイント、タップ遷移）** |
| BR-04 可読性 | 1画面=1要点、figura分離、要点強調 |
| BR-05 差別化 | 実写シネマティック画像 + Stories体験 |

---

## 2. デザインシステム

### 2.1 カラーパレット

```css
:root {
  /* Background tiers */
  --bg:        #082121;  /* 最暗、ベース背景 */
  --card:      #1A3A39;  /* カード（背景より明るい） */
  --card-2:    #234D4B;  /* ヒーロー強調カード */
  --card-soft: #163938;  /* 中間 */

  /* Accents */
  --accent:       #70D8BD;  /* ミント（PrimaryCTA） */
  --accent-soft:  rgba(112,216,189,.16);
  --accent-glow:  rgba(112,216,189,.25);
  --warm:         #F4A261;  /* サーモン（暖色アクセント） */
  --warm-soft:    rgba(244,162,97,.16);

  /* Text */
  --text:    #F2F7F6;  /* 本文 */
  --text-2:  #A3B8B7;  /* 補助 */
  --text-3:  #7A8E8D;  /* 弱 */

  /* UI */
  --line:    rgba(255,255,255,.05);
  --r-card:  20px;
  --r-pill:  99px;
  --gap:     14px;
}
```

### 2.2 タイポグラフィ

| 種類 | フォント | サイズ | weight | 用途 |
|---|---|---|---|---|
| ロゴ | Inter Tight | 24px | 800 | アプリロゴ |
| 大見出し | Noto Sans JP | 22px | 700 | 画面タイトル、ヒーロー |
| 中見出し | Noto Sans JP | 18px | 700 | カードタイトル |
| 本文 | Noto Sans JP | 14-15px | 500-600 | 一般 |
| 補助 | Noto Sans JP | 12-13px | 500 | サブテキスト |
| 数値 | Inter Tight | 全サイズ | 700-800 | XP・Lv・割合 |
| ラベル | Noto Sans JP | 11px | 600 | タグ・キャプション |

`font-feature-settings: "palt"` を全体に適用（日本語の詰め）。

### 2.3 コンポーネント仕様

#### Card
- border-radius: 20px
- background: `--card` (#1A3A39)
- inset highlight: `inset 0 1px 0 rgba(255,255,255,.04)`
- padding: 18px

#### Hero Card (with image)
- border-radius: 20px
- background: linear-gradient(140deg, #1A3A39 0%, #2C5856 100%)
- 上部に画像（height: 130-160px、object-fit: cover）
- 下部にコンテンツ
- box-shadow: `0 4px 24px rgba(0,0,0,.3), inset 0 1px 0 rgba(255,255,255,.06)`

#### Primary Button
- background: `--accent` (#70D8BD)
- color: `--bg` (#082121)
- border-radius: 99px (pill)
- padding: 13px 18px
- font-weight: 700
- box-shadow: `0 4px 16px rgba(112,216,189,.25)`

#### Secondary Button
- background: transparent
- border: 1px solid `--card`
- color: `--text`
- border-radius: 99px

#### Bottom Nav
- background: `--bg`
- border-top: 1px solid `--line`
- padding: 8px 0 28px (safe area)
- アクティブ: アイコンを `--accent` でfill、ラベル `--accent`

### 2.4 アニメーション

```css
.tappable { transition: transform .12s ease, opacity .12s ease; }
.tappable:active { transform: scale(.98); opacity: .92; }
```

スクロール: `-webkit-overflow-scrolling: touch`、水平スクロール `scroll-snap-type: x mandatory`。

### 2.5 画像アセット

実写シネマティック画像（AI生成、moody dark + teal-amber調）。
公開URL: `/var/www/html/{name}.jpg` → `https://bqggwcso.gensparkclaw.com/mockup/{name}.jpg`

| 用途 | ファイル名 |
|---|---|
| ヒーロー（演繹法/帰納法） | `hero-deduction.jpg` |
| ロジカルシンキング | `course-logical.jpg` |
| ケース面接 | `course-business.jpg` |
| 思考法 | `course-thinking.jpg` |
| 哲学・思考の原理 | `course-philosophy.jpg` |
| AI問題生成 | `ai-bot.jpg` |
| ロールプレイ | `ai-chat.jpg` |

**実装時の格納先**: `logic/public/images/v3/*.jpg` に置いて React `<img src="/images/v3/xxx.jpg" />` で参照。

---

## 3. 画面仕様

### 3.1 ホーム画面（HomeScreen.tsx 改修）

#### レイアウト（上から順）
1. **Status bar** (system)
2. **Navbar** : Logo + Streak Pill (`14日`) + Avatar
3. **Greeting** : "こんにちは、{name} さん" / "今日も論理を、ひとつ深めましょう。"
4. **Hero Recommend Card** : 画像 + タグ + タイトル + メタ + CTA
5. **Routine Card** : 進捗バー + 2チェック項目
6. **Week Card** : "今週はN日学習しました" + 月〜日のドット
7. **Courses 水平スクロール** : 4コースカード（画像ヘッダー付き）
8. **AI 2カラムグリッド** : AI問題生成 / ロールプレイ
9. **Lv/XP Card** : Lv番号 + XPバー + "次のLvまで残りXP"

#### コンポーネント分割
- `<HomeGreeting />`
- `<RecommendHero lessonId={number} />`
- `<TodayRoutine />`
- `<WeekCalendar />`
- `<CoursesScroll />`
- `<AIPracticeGrid />`
- `<XpCard />`

### 3.2 コース画面（RoadmapScreen.tsx 改修）

#### レイアウト
1. Navbar : "レッスン" + Search button
2. Intro : "どこから / はじめましょうか。" + 説明文
3. Section : "ラーニングパス"
   - 入門コース（mint, 推奨badge, 画像）
   - ビジネス強化コース（amber, 画像）
   - 哲学・深掘りコース（purple, 画像）
4. Section : "すべてのカテゴリ" → 全12カテゴリのリスト
   - 各行: アイコン枠 + 名称 + メタ + 進捗（"3/5"）

タップでカテゴリ詳細（同形式の画面、レッスン一覧表示）へ遷移。

### 3.3 レッスン画面（**完全新規 LessonStoriesScreen.tsx**）

#### 既存LessonScreenを廃止し、Stories型に置き換える

**画面構造**:
```
┌─────────────────┐
│ statusbar       │
├─────────────────┤
│ ▰▰▱▱▱  進捗バー  │ ← スライド数分
├─────────────────┤
│ ◯ カテゴリ      │ ← topbar
│   レッスン名 [×]│
├─────────────────┤
│                 │
│   1 / 5         │ ← slide-num
│                 │
│   [タグ]        │
│                 │
│   見出し        │
│   (大きく)      │
│                 │
│   本文          │
│   要点強調b     │
│                 │
│   [図解 box]    │
│                 │
│                 │
│  タップで次へ → │ ← tap hint
└─────────────────┘
   ←─────│─────→
     L     R    タップゾーン
```

#### スライド型定義

```typescript
type LessonSlide =
  | { kind: 'intro'; tag: string; title: string; body: string }
  | { kind: 'concept'; tag: string; title: string; body: string; example?: string }
  | { kind: 'diagram'; title: string; nodes: { label: string; kind: 'premise' | 'conclusion' }[] }
  | { kind: 'compare'; title: string; left: { label: string; body: string }; right: { label: string; body: string } }
  | { kind: 'quote'; author: string; quote: string }
  | { kind: 'quiz'; question: string; choices: string[]; correctIndex: number; explain: string }
  | { kind: 'summary'; title: string; points: string[] }

type Lesson = {
  id: number
  category: Category
  title: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  durationMin: number
  slides: LessonSlide[]
  xp: number
}
```

#### インタラクション仕様

| 操作 | 動作 |
|---|---|
| 画面右側タップ | 次のスライドへ |
| 画面左側タップ | 前のスライドへ |
| 上部 [×] タップ | 確認ダイアログ後、退出 |
| 進捗バー自動進行 | OFF（タップ駆動）。長押しで一時停止は将来 |
| 最終スライド+次タップ | 完了画面へ遷移 |

クイズスライドは特例：選択肢タップ → 即時正誤判定（Duolingo式、SCRUM-122準拠）→ 自動で次へ。

### 3.4 完了画面（**完全新規 LessonCompleteScreen.tsx**）

#### レイアウト
1. ミントの大きなチェックマーク（120×120, scale-in animation）
2. "レッスン完了" タグ
3. "よく学べました、{name} さん"
4. "{lessonTitle}を理解できました"
5. ステータス3列：獲得XP / 学習時間 / 連続日数
6. レベルアップ通知（条件: Lv up時のみ表示）
7. CTA：[次のレッスンへ進む] / [ホームに戻る]

#### XP付与処理
- 通常レッスン: +50 XP
- 最終クイズ全問正解: +20 XP（合計+70）
- ストリーク維持: +10 XP

完了時に `addXp('lesson')` を呼び、レベルアップ判定 → アニメーション。

### 3.5 記録画面（StatsScreen.tsx 改修）

#### 構成（既存3タブ廃止し、シンプルに統合）
1. Navbar : "記録"
2. Period selector : 日 / 週 / 月（Pill形式）
3. Calendar Card : 月カレンダー（学習日にミントドット）
4. AI Weekly Report Card : 週1更新の自動生成サマリー
5. Timeline Card : 日付別ログ（最新7日）

### 3.6 プロフィール画面（ProfileScreen.tsx 改修）

#### 構成
1. Hero : アバター + 名前 + Lv表示 + XPバー + "次まで残り"
2. Stats grid (3列) : 連続学習日 / 完了レッスン / 総XP
3. Summary Card : "今週は5日学習" + ミニグラフ
4. Settings list : アカウント / 通知 / プラン / フィードバック
5. Logout button (赤系)

---

## 4. レッスン再構成計画

### 4.1 既存48レッスンを**全てStories型に変換**

各レッスンを **5〜8スライド**に分割。基本パターン：
1. **Intro slide** : "今日学ぶこと" — 1文
2. **Concept slide** : 主要概念A
3. **Diagram slide** : 図解で見る
4. **Concept slide** : 主要概念B
5. **Compare slide** : 違い・対比
6. **Quiz slide** : 確認問題1問
7. **Summary slide** : 要点まとめ

### 4.2 データ移行ルール

既存レッスンの構造（`logicLessons.ts` 等の `steps` 配列）から自動変換可能なもの：
- `step.kind === 'explanation'` → `slide.kind === 'concept'`
- `step.kind === 'quiz'` → `slide.kind === 'quiz'`
- `step.kind === 'example'` → `slide.kind === 'concept'` (with example)

### 4.3 段階的実装
- Phase 1: 既存LessonScreenを残しつつ、新LessonStoriesScreenを並行追加
- Phase 2: 1カテゴリずつStories対応（ロジカル→論理学→ケース→…）
- Phase 3: 全レッスンStory化が完了したら旧LessonScreen削除

---

## 5. 実装フェーズ計画

### Phase 1: 基盤（1〜2日）
- [ ] **SCRUM-150**: デザイントークン定義（`src/styles/tokens.ts`）
- [ ] **SCRUM-151**: 画像アセット格納 + ImageOptimizer（`logic/public/images/v3/`）
- [ ] **SCRUM-152**: 共通コンポーネント `<Card />` `<HeroCard />` `<PillButton />`

### Phase 2: 主要画面 (3〜4日)
- [ ] **SCRUM-153**: HomeScreen.tsx 全面刷新
- [ ] **SCRUM-154**: RoadmapScreen.tsx 全面刷新（コース画面）
- [ ] **SCRUM-155**: StatsScreen.tsx 改修（記録画面）
- [ ] **SCRUM-156**: ProfileScreen.tsx 改修

### Phase 3: Stories型レッスン (5〜7日)
- [ ] **SCRUM-157**: LessonStoriesScreen.tsx 新規作成
- [ ] **SCRUM-158**: LessonCompleteScreen.tsx 新規作成
- [ ] **SCRUM-159**: スライドデータ型定義 + 変換ユーティリティ
- [ ] **SCRUM-160**: ロジカルシンキング5レッスンをStories型に変換
- [ ] **SCRUM-161**: 論理学・ケース面接レッスンをStories型に変換
- [ ] **SCRUM-162**: クリティカルシンキング・仮説思考をStories型に変換
- [ ] **SCRUM-163**: 思考法系レッスンをStories型に変換
- [ ] **SCRUM-164**: 提案・哲学レッスンをStories型に変換
- [ ] **SCRUM-165**: 旧LessonScreen削除 + ルーティング切り替え

### Phase 4: 検証 (1〜2日)
- [ ] **SCRUM-166**: ハーネスエンジニアリング（ブラウザ検証 mobile + desktop）
- [ ] **SCRUM-167**: 全画面・全コース挙動確認
- [ ] **SCRUM-168**: 画像最適化（loading="lazy" / WebP変換）

合計: 10〜15日（CXOチーム並行作業）

---

## 6. 受け入れ基準（業務要求書 §9）

| 基準 | 検証方法 |
|---|---|
| 現行案と比較してデザイン変更のインパクトが明確 | v2 vs v3 スクショ比較、Keita-san承認 |
| レッスンが分割表示 | 全レッスンが`LessonStoriesScreen`で表示される |
| タップ中心でテンポよく進める | 左右タップで前後遷移できる |
| 見やすく、理解しやすい | 1スライドあたり140文字以下を目安 |
| 類似アプリとの差別化が説明できる | Awarefy参考×Stories体験×ダークモード |
| ユーザーが「変更に意味あり」と感じる | Keita-sanの最終承認 |

---

## 7. ハーネスエンジニアリング検証ルール

各SCRUM完了時：
1. `develop` ブランチに push
2. Render SIT auto deploy 待機（〜3分）
3. ブラウザツールでSITを開く
4. mobile（390×844）+ desktop（1280×900）両方でスクショ
5. 仕様通りに表示されているか確認
6. 不具合あれば即修正、Keita-sanには問題なしと確認できてから報告

---

## 8. リスク・前提

- **画像アセットサイズ**: 7枚で計約3.5MB → WebP化必須
- **Stories変換工数**: 48レッスン手動変換は時間かかる → 既存ステップを変換する自動スクリプトを作る
- **既存進捗保持**: localStorage の `completedLessons` キーを維持、互換性確保
- **BETA_MODE = true**: 検証期間中は全機能開放のままで良い

---

*作成: Apollo (CEO) - 2026-04-26 22:15 JST*
*承認待ち: Keita-san*
