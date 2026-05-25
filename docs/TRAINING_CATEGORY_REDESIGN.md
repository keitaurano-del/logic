# トレーニング画面 カテゴリ構成 再設計ドラフト

作成日: 2026-05-25
作成: 林（dev-logic 経由）
ステータス: Keita 確認待ち（Step 1 ドラフト）

---

## 1. 背景

トレーニング画面（`src/screens/RoadmapScreenV3.tsx`）のコースは現在「6 グループ × 30 カテゴリ × 41 コース」で表示されている。
増設を繰り返した結果、グループ間の粒度がバラついており、ユーザーから見て「フェルミ推定」「論理的に考える」のような並びが散らかって見える。

加えて、現状は全グループが常時展開されているため、画面が縦に長くスクロール疲れする。

要望:
1. カテゴリ構成を再設計する
2. 各カテゴリをアコーディオン（開閉式）に変更する

---

## 2. 現状把握

### 2.1 現在のグループ別コース分布（41 コース）

| Group ID | 表示ラベル (ja) | コース数 | 偏り |
|---|---|---|---|
| foundations | 論理的に考える | 9 | 多 |
| problem-solving | 課題を解決する | 5 | 適 |
| business | 現場で実践する | 12 | 過多 |
| creative | 発想を広げる | 2 | 過少 |
| communication | 相手を動かす | 8 | 多 |
| career | キャリアを築く | 5 | 適 |

### 2.2 課題

- business が 12 で肥大化（フェルミ系 3 / 経営戦略 2 / クライアントワーク 2 / 数字 1 / 集中 1 / ADHD 1 / ピークパフォーマンス 1 / 論点 1）— ジャンルが混在
- creative が 2 のみ（ラテラル / アナロジー）— 区切る価値が薄い
- ADHD / 集中の技術 / ピークパフォーマンス習慣 / 認知科学 がメンタル・自己管理系で散らばっている
- クライアントワーク 4 コースが business 2 / communication 2 に分裂している
- 「フェルミ推定」最上位ピン留め（#77 / commit `56f69cb`）は維持必須

### 2.3 現在の表示順序（コード上）

1. パーソナルコース（診断結果ベース）
2. フェルミ推定（ピン留め、3 コース）
3. foundations → problem-solving → business → creative → communication → career（フェルミ除外）

---

## 3. 再設計案（Keita 確認用）

### 3.1 新カテゴリ階層案

7 グループ構成を提案する。アコーディオンの初期開閉状態は「フェルミ推定 + 思考力の基礎」のみ開く。それ以外は閉じる。

| 新 Group ID | 表示ラベル (ja) | 表示ラベル (en) | コース数 | 含まれる現カテゴリ |
|---|---|---|---|---|
| `pinned-fermi` | フェルミ推定 | Fermi Estimation | 3 | フェルミ推定（ピン留め維持） |
| `foundations` | 思考力の基礎 | Thinking Foundations | 8 | ロジカルシンキング / クリティカルシンキング / 哲学・思考の原理 / 東洋思想 / ラテラルシンキング / アナロジー思考 |
| `problem-solving` | 課題発見と解決 | Problem Solving | 7 | 仮説思考 / 課題設定 / 論点設定 / デザインシンキング / システムシンキング / なぜなぜ分析 |
| `numbers` | 数字と推定 | Numbers and Estimation | 1 | 数字に強くなる（フェルミは pinned 側） |
| `communication` | 表現と伝達 | Communication and Delivery | 8 | 提案・伝える技術 / 提案書作成 / クライアントワーク（4 本全部統合）/ ケース面接 / ドキュメンテーション / 構造化リスニング / ロジカルライティング |
| `mind` | メンタルと集中 | Mind and Focus | 5 | ADHDレバレッジ / 集中の技術 / ピークパフォーマンス習慣 / 認知科学（2 本） |
| `business` | ビジネス戦略 | Business Strategy | 2 | 経営戦略（2 本） |
| `career` | キャリアを築く | Build Your Career | 5 | 履歴書 / SPI / 玉手箱 / 面接 / 給与交渉（既存維持） |

合計: 3 + 8 + 7 + 1 + 8 + 5 + 2 + 5 = 39 コース（フェルミ 3 は pinned 側にカウント、business 表示時除外で全 41 マッピング完了）

### 3.2 個別マッピング変更点（既存からの差分）

#### foundations（9 → 8）
- 認知科学 2 コース（`cognitive-01`, `cognitive-02`）→ **mind** へ移動
- ラテラルシンキング `lateral-01`, アナロジー思考 `analogy-01` → **foundations** へ統合（creative グループ廃止）

#### problem-solving（5 → 7）
- 論点設定 `issue-01` → business から **problem-solving** へ移動

#### business（12 → 2）
- フェルミ 3 本 → pinned 維持（変更なし）
- 数字に強くなる `numeracy-01` → **numbers** に分離
- クライアントワーク 2 本 → **communication** に統合
- 集中の技術 `focus-now-01`, ADHDレバレッジ `adhd-leverage-01`, ピークパフォーマンス習慣 `peak-performance-01` → **mind** へ
- 論点設定 → **problem-solving** へ
- 残り: 経営戦略 2 本のみ

#### communication（8 → 8）
- クライアントワーク 4 本を business 側から統合（business 内 client-01, client-03 を移動）
- 既存の client-02, client-04 と合流

#### career（5 → 5）— 変更なし

#### creative（廃止）
- 2 コースを foundations に統合（粒度が薄いため）

### 3.3 アコーディオン仕様

- 各グループのヘッダー（タイトル + 説明）はクリック可能
- ヘッダー右端に chevron アイコン（`>` 閉時, `v` 開時）— `src/icons/index.tsx` の SVG を使用
- 初期表示: pinned-fermi + foundations のみ open、それ以外 closed
- 開閉状態は `localStorage` に `logic-training-accordion` キーで保存
- 構造: `{ [groupId: string]: boolean }` （true = open）
- 閉じている時はヘッダーのみ表示、開いている時はコースグリッドを展開
- アニメーション: CSS `max-height` トランジション 200ms（パフォーマンス重視）

---

## 4. 既存ユーザーへの影響

- コース ID (`logic-01` 等) は変更しないため、進捗データ（`logic-progress` localStorage）は完全互換
- 完了済みレッスンの履歴も無影響
- 内部的に `group` フィールドの値だけ書き換える（DB マイグレーション不要）
- `CategoryDetailView` 経由のディープリンクも変更なし（`category` フィールドは維持）

---

## 5. 実装ステップ（Step 1 承認後の作業）

1. `src/courseData.ts` の `CourseGroupId` 型に `numbers`, `mind` を追加、`creative` を削除
2. `COURSE_GROUPS_JA` / `COURSE_GROUPS_EN` を新構成に書き換え
3. 各コースの `group` 値を新マッピングで更新
4. `src/screens/RoadmapScreenV3.tsx` に `AccordionGroupSection` コンポーネントを新設
5. `localStorage` 永続化のための hook（`useAccordionState`）を `src/hooks/` に追加
6. `src/i18n.ts` に新グループラベル `roadmap.groupNumbers`, `roadmap.groupMind` 等を追加
7. 型チェック → lint → Playwright（53 件 pass）→ Android sync 動作確認
8. PR 作成、Keita レビュー、push

---

## 6. Keita 判断ポイント

以下、確認をお願いしたい点:

1. **新グループ案 7 つでよいか？** 別案: business / mind を統合して「ビジネスとメンタル」1 つにする、など
2. **creative 廃止の是非**: ラテラル + アナロジーを foundations に統合してよいか、それとも独立維持か
3. **数字と推定 (numbers)** を独立グループにするか、business に残すか
4. **アコーディオン初期 open** を pinned-fermi + foundations の 2 つに絞ってよいか
5. **「メンタルと集中」というラベル** は適切か（代案: 「自己管理」「コンディション」など）

---

## 7. 参考

- 直近関連 commit:
  - `56f69cb` feat(roadmap): フェルミ系をトレーニング画面の最上位に表示
  - `cc24f1b` feat(lessons): ロジカルライティングコース新設
  - `513795d` feat(lessons): 「今に集中する」コース新設
  - `f06facf` fix(career): キャリアカテゴリのカードクリックがルーティングしない問題を修正
- 関連メモリ: `feedback_app_copy_neutral.md`（UI 文言は中立的丁寧体）, `project_logic_mobile_only.md`（モバイル前提）
