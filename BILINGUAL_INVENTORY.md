# バイリンガル対応状況 一覧 (英語版リリース準備)

> 日本語版 Android リリース後に英語版をリリースするための準備資料。
> 現時点で「日本語+英語」両対応になっているもの / 日本語のみのもの を棚卸しする。
> 調査日: 2026-05-06 / 対象ブランチ: `claude/prepare-bilingual-list-VG8vV`

---

## サマリ

| 区分 | 完了 | 未対応 | 補足 |
|------|------|--------|------|
| UI ラベル (i18n キー) | ✅ ja/en 365 キーずつ完全一致 | — | `src/i18n.ts` |
| レッスン本体 | 2 ファイル (logic / coffeeBreak) | 23+ ファイル | 下表 §2 参照 |
| ロールプレイ シナリオ | — | `src/situations.ts` (JA のみ) | サーバ側 (`server/roleplay.ts`) も JA |
| AI プロンプト (サーバ) | — | `server/` 配下 5 ファイル | locale 切替の仕組み未実装 |
| ストア説明文 | ✅ `STORE_LISTING.md` に EN セクション有 | `store-metadata.md` は JA のみ | |
| ランディング | — | `landing/index.html` (`lang="ja"`) | EN ページ未作成 |
| Play Store スクショ | — | `play_store_assets/` の画像は JA UI | |

---

## 1. UI ラベル (i18n.ts)

| 項目 | 件数 | 状態 |
|------|------|------|
| `ja` キー | 365 | ✅ |
| `en` キー | 365 | ✅ キー一致 |

`src/i18n.ts` の `STRINGS` 定数で `t('key')` 経由で参照されるラベルは **すべて両言語そろっている**。
新規キーを追加する場合は ja/en の両方に追加すること。

---

## 2. レッスン・コンテンツ データファイル

### 2-1. 既に英語版あり

| ファイル | JA 件数 | EN ファイル | EN 件数 | 状態 |
|---------|--------|-------------|--------|------|
| `src/logicLessons.ts` | 10 レッスン | `src/logicLessonsEn.ts` | 9 レッスン | ⚠️ 1 レッスン分の差分あり (要確認) |
| `src/coffeeBreakScenarios.ts` | 5 シナリオ | `src/coffeeBreakScenariosEn.ts` | 5 シナリオ | ✅ 件数一致 |

> ID は揃えてあるので完了状態の同期は OK。中身の差分は EN リリース前に diff を取って揃える。

### 2-2. 英語版なし (要翻訳)

カテゴリ系レッスン:

| ファイル | 件数 | 内容 |
|---------|------|------|
| `src/fermiLessons.ts` | 6 | フェルミ推定 |
| `src/lateralThinkingLessons.ts` | 4 | ラテラルシンキング |
| `src/criticalLessons.ts` | 7 | クリティカルシンキング |
| `src/strategyLessons.ts` | 1 | 経営戦略 基礎 |
| `src/numeracyLessons.ts` | 8 | 数的思考 |
| `src/analogyThinkingLessons.ts` | 4 | アナロジー思考 |
| `src/hypothesisLessons.ts` | 5 | 仮説思考 |
| `src/caseLessons.ts` | 5 | ケース面接 |
| `src/problemSettingLessons.ts` | 4 | 課題設定 |
| `src/proposalLessons.ts` | 6 | 提案・コミュニケーション |
| `src/proposalCourseLessons.ts` | — | 提案コース (要件数確認) |
| `src/designThinkingLessons.ts` | 4 | デザイン思考 |
| `src/systemsThinkingLessons.ts` | 4 | システム思考 |
| `src/easternPhilosophyLessons.ts` | 1 | 東洋哲学 |
| `src/philosophyLessons.ts` | 1 | 哲学・思考原理 |
| `src/extraLessons.ts` | 18 | 追加・特別レッスン |
| `src/catchupLessons.ts` | 7 | キャッチアップ |
| `src/clientWorkLessons.ts` | 10 | クライアントワーク |
| `src/peakPerformanceLessons.ts` | — | ピークパフォーマンス (要件数確認) |

問題 / データ系:

| ファイル | 内容 |
|---------|------|
| `src/fermiData.ts` | フェルミ推定の問題プール (~20 問) |
| `src/placementData.ts` | 実力診断テスト 10 問 |
| `src/flashcardData.ts` | 復習用フラッシュカード セット |
| `src/situations.ts` | ロールプレイの全シナリオ・会話テキスト (約 5,300 文字の JA) |
| `src/roadmapData.ts` | 学習ロードマップのパス定義 |
| `src/lessonSlides.ts` | レッスンスライドのテンプレ文字列 |
| `src/courseData.ts` | コース定義 |
| `src/aiProblemStore.ts` | AI 生成問題の保存ロジック (UI 文字列を含む可能性あり) |

> 推奨対応: `xxxEn.ts` を新設して同じ ID で英訳を配置 (logicLessons の方式に統一)。

---

## 3. UI 画面ファイル (`src/*.tsx`, `src/screens/*.tsx`)

`t('key')` を経由していないハードコード日本語が **104 ファイル** に残っている。

英訳が必要な日本語文字数の多い順 トップ 15:

| ファイル | JA 文字数 | 用途 |
|---------|----------|------|
| `src/situations.ts` | 5,299 | ロールプレイ会話・質問 |
| `src/Profile.tsx` | 1,879 | 旧プロフィール画面 |
| `src/LessonDiagrams.tsx` | 1,654 | レッスン図解・解説 |
| `src/components/LessonThumbnail.tsx` | 1,229 | レッスンサムネ ラベル |
| `src/screens/homeHelpers.ts` | 1,121 | ホーム画面 ヘルパー |
| `src/screens/RoadmapScreenV3.tsx` | 1,114 | ロードマップ v3 |
| `src/App.tsx` | 1,106 | 旧アプリシェル |
| `src/screens/OnboardingScreen.tsx` | 1,017 | オンボーディング |
| `src/AppV3.tsx` | 865 | アプリシェル v3 |
| `src/screens/HomeScreenV3.tsx` | 864 | ホーム v3 |
| `src/screens/JournalInputScreen.tsx` | 772 | ジャーナル入力 |
| `src/screens/LessonStoriesScreen.tsx` | 770 | レッスンストーリー |
| `src/screens/AIProblemGenScreen.tsx` | 753 | AI 問題生成 |
| `src/lessonSlides.ts` | 671 | スライドテンプレ |
| `src/screens/DailyFermiScreen.tsx` | 547 | デイリーフェルミ |

合計 約 **12,000 文字** 以上のハードコード日本語が UI に残存。

> 推奨対応: 新規追加分は最初から `t('key')` 経由で書く。既存はトップ画面 → 高頻度画面の順で i18n キー化。

---

## 4. サーバ側 (`server/`)

| ファイル | JA 文字数 | 内容 |
|---------|----------|------|
| `server/roleplay.ts` | 3,307 | ロールプレイの AI システムプロンプト・サンプル会話 |
| `server/fermi.ts` | 2,297 | フェルミ推定問題テキスト・ヒント・採点プロンプト |
| `server/index.ts` | 1,247 | コメント / 一部メッセージ |
| `server/problems.ts` | 1,131 | AI 問題生成プロンプト・定数 |
| `server/billing.ts` | 140 | コメント |

クライアント側の `localeBody()` 経由で `locale` がサーバに送られる仕組みは既にある (`src/i18n.ts`)。
**サーバ側で `req.body.locale` を見て JA/EN プロンプトを切り替える分岐の実装が必要**。

---

## 5. ストア・マーケティング資材

| 資材 | JA | EN |
|------|----|----|
| `STORE_LISTING.md` | ✅ | ✅ (同ファイル内に EN セクション有) |
| `store-metadata.md` | ✅ | ❌ |
| `play_store_assets/screenshots/*.png` | ✅ JA UI スクショ | ❌ |
| `play_store_assets/feature_graphic_1024x500.png` | JA テキスト入り | ❌ |
| `landing/index.html` | ✅ (`lang="ja"`) | ❌ |
| `landing/logo.svg` | 共通 | 共通 |

---

## 6. 英語版リリースに向けて 必要なアクション (推奨順)

1. **サーバ側の locale 分岐実装** — クライアントから送られる `locale` を AI プロンプト切替に反映 (`server/roleplay.ts`, `fermi.ts`, `problems.ts`)。
2. **UI のハードコード JA を i18n キー化** — トップ 15 ファイル中心に `t()` 経由へ移行。新規キーは `i18n.ts` の ja/en 両方に追加。
3. **レッスン EN ファイル生成** — `xxxLessons.ts` ごとに `xxxLessonsEn.ts` を作成 (logicLessons 方式)。優先度は カテゴリ別レッスンの利用頻度順。
4. **Roleplay (situations.ts) の EN 化** — 文字数最大、かつコア機能。`situationsEn.ts` を新設して selector で切替。
5. **Placement / Fermi / Flashcard データの EN 化** — オンボーディング体験で必須。
6. **ストア資材 EN 化** — `landing/` の英語版ページ、Play Store の英語スクショ・feature graphic、`store-metadata.md` の英語セクション追加。
7. **`logicLessonsEn.ts` の差分埋め** — JA 側との 1 レッスン差を確認・解消。

---

## 7. 既存の仕組み (再利用可)

- `src/i18n.ts` — `t(key, params)` / `getLocale()` / `setLocale(loc)` / `localeBody(body)` 完備。
- ロケール検出: `localStorage` に `logic-locale` 永続化。デフォルト `ja`。
- 切替時: `window.location.reload()` で全画面再描画 (副作用なし)。
- 完了状態の共有: EN ファイルは JA と同じ ID を使うことで `progressStore` を変更不要にする方針 (logic / coffeeBreak で実証済み)。
