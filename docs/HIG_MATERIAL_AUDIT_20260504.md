# Logic — iOS HIG / Material 3 完全準拠 設計書

> **Status**: Final v1.0 — 実装着手可能
> **Scope**: 全44画面 + 共通コンポーネント + プラットフォーム分岐レイヤー + ストア審査チェックリスト
> **Brand**: Slate Blue ダーク固定。OS のライト/ダーク追従はしない
> **Conflict policy**: iOS HIG ⨯ Material 3 が衝突する箇所は `Capacitor.getPlatform()` で分岐
> **Total effort**: 約 204 時間（≒ 5.1 人週、1名で約 1.3 ヶ月）。Android 先行 / iOS 後追いリリース前提で Native IAP 移行（旧 8h）を Phase 0 から削除。

---

## 実装ステータス（2026-05-05 Phase 3 第2-6波完了 / Phase 4-4 axe-core / V2 cleanup）

| Phase | 計画 | 実装累計 | 状態 |
|---|---|---|---|
| **Phase 0** リリースブロッカー | 8h | ~8h | ✅ 100% |
| **Phase 1** デザインシステム土台 | 32h | ~28h | ✅ 88% |
| **Phase 2** 全画面 HIG/M3 適合 | 60h | ~58h | ✅ 100%（構造的タスク完了） |
| **Phase 3** 個別最適化 | 80h | ~46h | 🟡 58%（機械的置換 + dead code 大量削除 + 未使用 icons 整理） |
| **Phase 4** 仕上げ・検証 | 24h | ~16h | 🟡 axe-core 8 画面 blocking + 全 input/textarea/icon button に aria-label 補完 |

**累計 ~156h / 204h ≒ 76%**

### Phase 3 進捗（2026-05-05 セッション）
- ✅ 第1波: prefers-reduced-motion + Lesson 系 a11y 強化 (#96)
- ✅ 第2波: `<select>` → ActionSheet 化（カテゴリ系 4 箇所）。時刻ピッカーは OS ホイール優先で `<select>` 維持
- ✅ 第3波: CSS の `font-size px → rem` 一括変換 (593 件 / 31 ファイル)。`:root { font-size: 15px }` を base に維持
- ✅ 第4波: `index.css` dead patch 削除 (-34 行)。空 body の catch-all、重複 RGB ブロックを整理
- ✅ 第5波: V3 活躍画面のハードコード色 → セマンティック token 置換（91 件 / 11 ファイル）
- ✅ 第6波: `index.css` の dead `[style*=...]` パッチ群を完全 retire（-185 行 / 734→549）

### Phase 4 進捗（2026-05-05 セッション）
- ✅ CI の `npm run lint` を `continue-on-error: true` から blocking に昇格（lint clean 達成済のため）
- ✅ Phase 4-4: axe-core a11y 自動チェックを CI に追加（`e2e/a11y.spec.ts`、6 主要画面、WCAG 2.1 A/AA、`color-contrast` 除外）。初回 CI で違反 0 を確認 → **blocking に昇格済**
- ✅ Phase 3 続: 未使用 V2 スクリーン 3 本 削除（JournalInput / Worksheet / Notebook、-860 行 / -28KB）
- ✅ Phase 3 続: vite manualChunks で vendor chunk を分離（react / supabase / capacitor / sentry）。chunkSizeWarning も解消
- ✅ Phase 3 続: dead V3 系 screens 4 本削除（HomeScreen / LessonScreen / LessonGrid / StatsScreenV3、-1719 行）
- ✅ Phase 3 続: dead components 4 本削除（Confetti / Eyebrow / ProgressBar / TextField、-278 行）
- ✅ Phase 3 続: dead v3 components dir 全削除（Card / PillButton / Section、-144 行）
- ✅ Phase 3 続: dead 型定義 + 未使用 v3 画像 cleanup（speech.d.ts / lessonGuide.tsx / Firebase 型 / 2 枚 webp）

> **Phase 2 クローズ判断（2026-05-05）**: Phase 2 の構造タスク（Header 統一 22 画面、`<div onClick>` 撤廃、旧画面削除 5 本、Switch / LoadingIndicator 化、触覚 12 画面、`#6C8EF5` 完全除去、jsx-a11y 警告化、TS lint cleanup）は完了。残る純粋な機械的置換タスク（font-size px→rem 1451 箇所、ハードコード色 995 箇所のうちカテゴリ色を除く ~400 件、`<select>` → `<ActionSheet>`、`index.css` legacy patch ~130 件）は **実機での visual regression 確認が前提**になるため、画面単位で進める Phase 3 に統合する。

### 本セッション完了 PR (18 本マージ)
- #72 監査文書 (1625 行)
- #73 Phase 0/1 + Stripe 削除 (51 files)
- #74 Phase 2 第1波 (V3 div→button、Switch、触覚)
- #75 旧画面 5 削除 + Header 5 + 色 sweep
- #76 Header 10 追加
- #77 V3 ヘッダー 6 + RGBA sweep
- #78 RoleplayChat + 赤色統一
- #79 #6C8EF5 完全除去
- #80 jsx-a11y + QA チェックリスト + CI
- #81 lint error 19 件解消
- #82 V3 div onClick 完全除去
- #83 dark mode brand color regression fix
- #84 dead patch selectors -50 行
- #85 legacy jsx-a11y warning 抑制 -85
- #86 audit doc セッション完了サマリー
- #87 catch (e: unknown) 化 (-4 errors)
- #88 TS lint error 51 → 31 (-20)
- #89 AppV3 不要な as any 削除 (-3)

### Phase 0 完了項目
- ✅ `capacitor.config.ts` StatusBar `LIGHT` + `#1A1F2E` + `overlaysWebView`
- ✅ `configureStatusBar()` / `configureKeyboard()` 起動配線
- ✅ `hideSplash()` 配線（auth ready / 1500ms timeout）
- ✅ Android `enableOnBackInvokedCallback` (Predictive Back)
- ✅ `MainActivity.kt` `WindowCompat.setDecorFitsSystemWindows(window, false)` (Edge-to-Edge)
- ✅ 5 プラグイン (`@capacitor/{haptics,dialog,share,keyboard,action-sheet}`) install + sync
- ✅ `setHtmlPlatformAttr()` 配線
- ✅ input font-size 14→16 (5 ファイル)
- ✅ Stripe 残存コード削除
- ⚪ iOS 関連 (PrivacyInfo, StoreKit, Sign in with Apple) は iOS リリース直前へ

### Phase 1 完了項目
- ✅ `src/styles/tokens-m3.css` 新規（M3 Color Roles 33 種 + iOS HIG alias + Elevation/Shape/Motion/State）
- ✅ `tokensV3.ts` `m3` セクション追加
- ✅ `src/platform/` 一式（platform/dialog/haptics/share/keyboard/statusBar/splash/actionSheet/motion/index）
- ✅ `<Header>` 新規（プラットフォーム分岐）
- ✅ `<ConfirmDialog>` 新規 + `window.confirm` 3 件置換
- ✅ `<Snackbar>` + `SnackbarProvider` + `useSnackbar()`
- ✅ Button / IconButton / Card / Badge / ProgressBar M3 リライト（haptic 自動付加 / aria / focus-visible / 44/48dp tap）
- ✅ AppShell TabBar プラットフォーム分岐（iOS=ドット / Android=`secondaryContainer` pill, role=tablist, haptic）
- ✅ `<ActionSheet>` 新規 + `selectFromActionSheet()` ヘルパー
- ✅ `<LoadingIndicator>` 新規（iOS 8-bar / M3 indeterminate arc）
- ✅ `<Switch>` 新規（iOS 風 / M3 風）
- ✅ `<TextField>` 新規（filled/outlined, font-size 16px 強制）
- ✅ `Confetti` `prefers-reduced-motion` 対応
- ✅ ブランド色 `#3D5FC4`/`#3B5BDB` → `var(--md-sys-color-primary)` (16 ファイル, 87+ 件)

### Phase 2 着手済項目
- ✅ 5 画面の 36×36 戻るボタン → 44×44 + `aria-label="戻る"` + `<button>` 化
  - `AccountSettingsScreen.tsx:78` (was `<div onClick>`)
  - `AIProblemGenScreen.tsx:249`
  - `OnboardingScreen.tsx:556`
  - `PricingScreen.tsx:133`
  - `RoadmapScreenV3.tsx:714` (was `<div onClick>`)
- ✅ 触覚フィードバック挿入
  - `LessonScreen.tsx` 正解 → `haptic.success()` / 不正解 → `haptic.warning()`
  - `LessonCompleteScreen.tsx` 表示時 `haptic.success()`
  - `DailyFermiScreen.tsx` `handleSubmit` → `haptic.medium()`
  - `DailyProblemScreen.tsx` `handleSelect` 正誤判定で success/warning
  - `AIProblemScreen.tsx` 同上
  - `PlacementTestScreen.tsx` `handleAnswer` → `haptic.selection()`
  - `FlashcardsScreen.tsx` `handleReview` (again→warning, good/easy→selection)
  - `RoleplayChatScreen.tsx` `pickScriptChoice` / `pickApiChoice` → `haptic.light()`
  - `AppShell.tsx` Tab 切替 → `haptic.light()`（既存）
- ✅ `<div onClick>` → `<button>` 化 (約 25 箇所)
  - HomeScreenV3 の 2 箇所 + `AILargeCard` 内 1 箇所
  - RoadmapScreenV3 の 5 箇所（`CourseResultCard`, `LessonResultCard`, `CategoryCard`, レッスン行 2 種）
  - ProfileScreenV3 の 3 箇所（実力診断テスト, ログアウトボタン, `SettingRow`）
  - PersonalCourseScreen の 3 箇所（戻るボタン 2, レッスン行）
  - LessonStoriesScreen の 3 箇所（multi-select / single-select / 単純選択肢, role=radio/checkbox）
  - AccountSettingsScreen の 3 箇所（変更ボタン, Google ログイン, メールログイン）
  - OnboardingScreen の 2 箇所（スライド ドット, キャンペーンバナー）
- ✅ ローディング表示を `<LoadingIndicator label>` に置換 (4 画面)
  - FermiRankingScreen, FeedbackDashboardScreen, RankingScreen, PlacementTestScreen
- ✅ `Switch` 共通コンポーネント採用 (2 画面)
  - SettingsScreen の `Toggle` を Switch wrapper に
  - NotificationSettingsScreen の `Toggle` を Switch wrapper に
- ✅ 触覚追加 (Phase 2 第 3 波 / 3 画面)
  - ReportProblemScreen `handleSubmit` → `haptic.light()`
  - WorksheetScreen `handleSubmit` → `haptic.light()`
  - FeedbackScreen `handleSubmit` → `haptic.light()`

- ✅ Header コンポーネント統一 (22 画面累計)
  - LanguageScreen, RankScreen, StreakScreen, CompletedLessonsScreen, StudyTimeScreen,
    FlashcardsScreen, SettingsScreen, RoleplayChatScreen (空状態+メイン両方),
    FeedbackScreen, JournalInputScreen, ReportProblemScreen, AIProblemScreen,
    DailyFermiScreen, DailyProblemScreen, DeviationScreen, WorksheetScreen,
    FermiScreen (Mobile/Desktop), PlacementTestScreen, NotificationSettingsScreen,
    AccountSettingsScreen, PersonalCourseScreen, PricingScreen, AIProblemGenScreen,
    RoadmapScreenV3
  - `screen-header` div + IconButton+ArrowLeftIcon パターン → `<Header title onBack>` に
  - V3 風カスタムヘッダー (44pt 戻る + タイトル + 副題/バッジ) → `<Header trailing>` で対応
  - HomeScreenV3 / OnboardingScreen / LoginScreen / ProfileScreenV3 はタブルート/特殊レイアウトのため Header 化対象外
- ✅ 旧画面削除 (5 ファイル, ~1700 行削減)
  - `RoadmapScreen.tsx` / `ProfileScreen.tsx` / `StatsScreen.tsx` / `PricingV3.tsx` / `ThemeSettingsScreen.tsx`
  - すべて V3 系で代替済み、import なしを確認した上で削除
- ✅ ハードコード色値 sweep (累計 ~70 件)
  - `'#6C8EF5'` (legacy accent) → `'var(--md-sys-color-primary)'`
  - `'#F87171'` / `'#FCA5A5'` / `'#DC2626'` / `'#F04438'` / `'#EF4444'` (red destructive) → `'var(--md-sys-color-error)'`
  - `rgba(108,142,245, ...)` (legacy accent alpha) → `rgba(168,192,255, ...)` (新 M3 primary RGB)

### Phase 3 へ移管（実機検証ベース）
> Phase 2 のクローズに伴い、以下は画面単位で実機確認しながら進める Phase 3 に統合した。

- 全 px → rem 化（font-size の px リテラル 1451 箇所。inline style 含む）
- ハードコード色値 残 ~400 件の CSS 変数化（カテゴリ色は意図的に残す）
- 既存 `<select>` 10 箇所を `<ActionSheet>` 系に置換（OS native picker でも実用的なため低優先）
- `index.css` のレガシー patch selectors 残 ~130 件の整理（ハードコード色値を完了させた後）

### 検証
- ✅ `npm run build` (TypeScript + Vite)
- ✅ `npx cap sync` (10 plugins for android)
- ✅ `npx eslint` 新規ファイルはクリーン (jsx-a11y 警告化)
- ✅ `eslint-plugin-jsx-a11y` 導入 (146 件の warning が可視化, 順次解消)
- ✅ `docs/QA_CHECKLIST_HIG_M3.md` 作成 (Phase 4 manual テスト用)
- ✅ `.github/workflows/ci.yml` 作成 (PR 毎に build + lint 自動実行)
- ⚪ Android 実機検証 (要 user)
- ⚪ iOS シミュレータ (iOS リリース時)
- ⚪ TalkBack / VoiceOver 全画面ナビ (要 user)
- ✅ axe-core CI 化 (`e2e/a11y.spec.ts`, 6 主要画面 / WCAG 2.1 A/AA / blocking)
- ⚪ Lighthouse CI 化 (将来追加 — 現状は bundle size 制約あり)

---

## 0. Context — なぜこの設計書を書くのか

Logic は Capacitor + React + TypeScript で構築された iOS / Android ネイティブ配布の学習アプリ。現状コードベースには次の構造的問題があり、**App Store / Google Play 両方の審査基準と UX 期待値を同時に満たすための統一設計書が存在しない**。

### 現状の問題（実測値）
| カテゴリ | 件数 / 状態 |
|---|---|
| ハードコード色値（`#XXXXXX` リテラル） | **704 件**（旧 brand `#3B5BDB` だけで 87 件） |
| `tokensV3.*` 参照と `var(--*)` 参照の二重トラック | 684 件 vs 469 件 |
| `Capacitor.getPlatform()` による iOS/Android 明示分岐 | **0 件** |
| `StatusBar.setStyle` / `SplashScreen.hide` 等の JS API 呼び出し | **0 件**（プラグインは入っているのに未使用） |
| Haptics / Dialog / Share / Keyboard プラグイン | 未導入 |
| `window.confirm` / `alert` の本番使用 | 4 箇所 |
| 36×36 px の戻るボタン（HIG 44pt / M3 48dp 違反） | 4 画面以上 |
| `<input>` で `font-size < 16px`（iOS 強制ズーム発火） | 複数画面 |
| `prefers-reduced-motion` メディアクエリ | 0 件 |
| `aria-label` 総数 | 51 件のみ（44画面に対して圧倒的不足） |
| `<div onClick>` のクリッカブル div | 多数（VoiceOver/TalkBack 不能） |
| ダークモード強制 `!important` | `index.css:443-449` 他 |
| AppV3 ⇆ App.tsx の二重ルート | 並走中、本番判別不能 |

### この設計書のゴール
1. **App Store / Google Play 両方の審査を 1 発通過** できる UI 仕様の明文化
2. **44 画面それぞれ**で「iOS でこう見える / Android でこう見える」が決定論的に決まる
3. ブランド体験（Slate Blue ダーク）を維持しつつ、各 OS のネイティブ感を必要十分に注入
4. 実装者が **画面ファイルと節を1対1**で参照しながら直せる粒度

---

## 1. 設計原則

1. **ブランド優先・OS 機能のみ分岐**
   ビジュアル（色・タイポ・形・モーション）は両 OS 共通の Slate Blue ダーク。OS が握るインタラクション（ダイアログ・触覚・アクションシート・戻る・キーボード等）のみ `Capacitor.getPlatform()` で分岐。

2. **デザイントークンは単一ソース**
   `tokensV3.ts` を **M3 Color Roles 互換**に拡張し、CSS 変数 `--md-sys-*` と JS 定数 `v3.*` を **同一値の双方向ミラー**にする。リテラル色値はゼロを目標。

3. **アクセシビリティはコンプライアンスではなく前提**
   タップ最小 44pt、コントラスト WCAG AA 以上、VoiceOver / TalkBack 完全対応、`prefers-reduced-motion` 尊重を全画面で必達。

4. **ダーク固定はユーザー選択を上書きしない実装で**
   `prefers-color-scheme` を読みに行かないだけで、`!important` での強制上書きはしない。OS 側の High Contrast / Bold Text などのアクセシビリティ設定は尊重。

5. **修正の単位は「画面 × 観点」**
   Phase ごとに観点（ヘッダー / ダイアログ / 入力 …）で横串、画面ごとに節立て。レビュアー・実装者・QA が同じ単位でチェックできる。

---

## 2. デザインシステム

### 2.1 カラートークン（M3 Color Roles × Slate Blue ダーク）

#### 2.1.1 設計方針
- M3 Color Roles をフルセットで採用（primary/secondary/tertiary/error/neutral/neutralVariant）
- iOS では同じトークンを Tint Color / Background Color へマッピングし HIG semantic color を satisfy
- 既存 `tokensV3.color.*` は **deprecated 互換 alias** として残し、新規は M3 命名へ寄せる
- 旧 brand `#3D5FC4` (87件残存) は Phase 1 で `var(--md-sys-color-primary)` に置換

#### 2.1.2 Slate Blue ダーク × M3 マッピング（決定値）

| M3 Role | 値 | 用途 | 旧トークン互換 |
|---|---|---|---|
| `primary` | `#A8C0FF` | FAB / Primary Button on dark | `tokensV3.color.accent` |
| `onPrimary` | `#0A1F4D` | Primary 上の text/icon | new |
| `primaryContainer` | `#2E45A8` | Filled chip | new |
| `onPrimaryContainer` | `#DDE5FF` | text on primaryContainer | new |
| `secondary` | `#BCC6DC` | secondary actions | new |
| `onSecondary` | `#26314A` | text on secondary | new |
| `secondaryContainer` | `#3C4661` | low-emphasis filled containers | new |
| `onSecondaryContainer` | `#D8E2F9` | text on secondaryContainer | new |
| `tertiary` | `#F5BFA0` | accent (warm), streak hero | `tokensV3.color.warm` |
| `onTertiary` | `#4A2510` | text on tertiary | new |
| `tertiaryContainer` | `#643C24` | warm container | `tokensV3.color.warmSoft` 系 |
| `onTertiaryContainer` | `#FFDCC4` | text on tertiaryContainer | new |
| `error` | `#FFB4AB` | destructive / validation | `--danger` |
| `onError` | `#690005` | text on error | new |
| `errorContainer` | `#93000A` | destructive container | new |
| `onErrorContainer` | `#FFDAD6` | text on errorContainer | new |
| `surface` | `#1A1F2E` | App background | `tokensV3.color.bg` |
| `onSurface` | `#E8ECF4` | primary text | `tokensV3.color.text` |
| `surfaceVariant` | `#252C40` | Card background | `tokensV3.color.card` |
| `onSurfaceVariant` | `#8FA3C8` | secondary text | `tokensV3.color.text2` |
| `surfaceContainerLowest` | `#13182A` | deepest surface | new |
| `surfaceContainerLow` | `#1E2438` | subtle layer | `tokensV3.color.cardSoft` |
| `surfaceContainer` | `#252C40` | default container | `tokensV3.color.card` |
| `surfaceContainerHigh` | `#2E3652` | elevated container | `tokensV3.color.card2` |
| `surfaceContainerHighest` | `#37405F` | highest elevation | new |
| `outline` | `#8FA3C8` | dividers | new |
| `outlineVariant` | `rgba(255,255,255,.09)` | subtle dividers | `tokensV3.color.line` |
| `inverseSurface` | `#E8ECF4` | snackbar background | new |
| `inverseOnSurface` | `#1A1F2E` | snackbar text | new |
| `inversePrimary` | `#3E59B0` | snackbar action | new |
| `scrim` | `rgba(0,0,0,.55)` | modal backdrop | new |
| `surfaceTint` | `#A8C0FF` | M3 elevation tint | new |

**WCAG AA 検証**
- onSurface (#E8ECF4) on surface (#1A1F2E) = **12.6:1 AAA**
- onSurfaceVariant (#8FA3C8) on surface = **6.8:1 AA**
- primary (#A8C0FF) on surface = **9.4:1 AAA**
- onPrimary (#0A1F4D) on primary = **8.1:1 AAA**
- error (#FFB4AB) on surface = **7.9:1 AAA**

#### 2.1.3 CSS 変数発行（新ファイル `src/styles/tokens-m3.css`）

```css
:root {
  --md-sys-color-primary:                  #A8C0FF;
  --md-sys-color-on-primary:               #0A1F4D;
  --md-sys-color-primary-container:        #2E45A8;
  --md-sys-color-on-primary-container:     #DDE5FF;
  --md-sys-color-secondary:                #BCC6DC;
  --md-sys-color-on-secondary:             #26314A;
  --md-sys-color-secondary-container:      #3C4661;
  --md-sys-color-on-secondary-container:   #D8E2F9;
  --md-sys-color-tertiary:                 #F5BFA0;
  --md-sys-color-on-tertiary:              #4A2510;
  --md-sys-color-tertiary-container:       #643C24;
  --md-sys-color-on-tertiary-container:    #FFDCC4;
  --md-sys-color-error:                    #FFB4AB;
  --md-sys-color-on-error:                 #690005;
  --md-sys-color-error-container:          #93000A;
  --md-sys-color-on-error-container:       #FFDAD6;
  --md-sys-color-surface:                  #1A1F2E;
  --md-sys-color-on-surface:               #E8ECF4;
  --md-sys-color-surface-variant:          #252C40;
  --md-sys-color-on-surface-variant:       #8FA3C8;
  --md-sys-color-surface-container-lowest: #13182A;
  --md-sys-color-surface-container-low:    #1E2438;
  --md-sys-color-surface-container:        #252C40;
  --md-sys-color-surface-container-high:   #2E3652;
  --md-sys-color-surface-container-highest:#37405F;
  --md-sys-color-outline:                  #8FA3C8;
  --md-sys-color-outline-variant:          rgba(255,255,255,.09);
  --md-sys-color-inverse-surface:          #E8ECF4;
  --md-sys-color-inverse-on-surface:       #1A1F2E;
  --md-sys-color-inverse-primary:          #3E59B0;
  --md-sys-color-scrim:                    rgba(0,0,0,.55);
  --md-sys-color-surface-tint:             #A8C0FF;

  /* iOS HIG semantic alias */
  --ios-tint:           var(--md-sys-color-primary);
  --ios-system-bg:      var(--md-sys-color-surface);
  --ios-secondary-bg:   var(--md-sys-color-surface-variant);
  --ios-grouped-bg:     var(--md-sys-color-surface-container-low);
  --ios-label:          var(--md-sys-color-on-surface);
  --ios-secondary-label:var(--md-sys-color-on-surface-variant);
  --ios-separator:      var(--md-sys-color-outline-variant);
  --ios-destructive:    var(--md-sys-color-error);

  /* Legacy alias (Phase 2 で削除目標) */
  --brand:        var(--md-sys-color-primary);
  --bg-primary:   var(--md-sys-color-surface);
  --bg-card:      var(--md-sys-color-surface-container);
  --text-primary: var(--md-sys-color-on-surface);
}

html[data-platform="ios"]    { /* iOS overrides */ }
html[data-platform="android"]{ /* Android overrides */ }
```

`<html data-platform="...">` 属性は起動時に `setHtmlPlatformAttr()` で書き込む（§3 参照）。

### 2.2 タイポグラフィ

#### 2.2.1 フォントファミリー

```css
:root { --font-display: 'Inter Tight', 'Inter', system-ui, sans-serif; }
html[data-platform="ios"] {
  --font-ui:   -apple-system, BlinkMacSystemFont, 'SF Pro Text',
               'Hiragino Sans', sans-serif;
  --font-mono: ui-monospace, 'SF Mono', Menlo, monospace;
}
html[data-platform="android"] {
  --font-ui:   'Roboto', 'Noto Sans JP', system-ui, sans-serif;
  --font-mono: 'Roboto Mono', monospace;
}
html[data-platform="web"] {
  --font-ui:   'Inter', 'Noto Sans JP', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}
```

#### 2.2.2 M3 Type Scale × iOS HIG 対応表

| Token | size/weight/lh/tracking | iOS HIG 対応 | 用途 |
|---|---|---|---|
| `display-large` | 57/400/64/-0.25 | (iOS未使用) | 巨大 hero |
| `display-medium` | 45/400/52/0 | Large Title (34) | hero |
| `headline-large` | 32/700/40/0 | Title 1 (28) | section hero |
| `headline-medium` | 28/700/36/0 | Title 1 (28) | screen title |
| `headline-small` | 24/700/32/0 | Title 2 (22) | card hero |
| `title-large` | 22/700/28/0 | Title 3 (20) | page title |
| `title-medium` | 16/600/24/0.15 | Headline (17) | card title |
| `title-small` | 14/600/20/0.10 | Subhead (15) | small section |
| `body-large` | 16/400/24/0.50 | Body (17) | 本文 |
| `body-medium` | 14/400/20/0.25 | Callout (16) | secondary text |
| `body-small` | 12/400/16/0.40 | Footnote (13) | caption |
| `label-large` | 14/600/20/0.10 | Subhead (15) | button label |
| `label-medium` | 12/600/16/0.50 | Caption 1 (12) | chip label |
| `label-small` | 11/600/16/0.50 | Caption 2 (11) | tab label |

iOS では本文は **17pt 以上**が HIG 標準 → `body-large` を 17px に bump up。

```css
html[data-platform="ios"] {
  --md-sys-typescale-body-large-size:  17px;
  --md-sys-typescale-body-medium-size: 16px;
  --md-sys-typescale-label-large-size: 15px;
}
```

#### 2.2.3 Dynamic Type / fontScale 対応

- 全 font-size は **px → rem** に Phase 2 で置換 (現状 275 件)
- `html { font-size: 100% }` 維持で OS 倍率を反映
- Settings に「文字サイズ」(Small/Default/Large/XL) スライダーを Phase 3 で追加

### 2.3 エレベーション（M3 Level 0-5）

ダークテーマでは shadow を弱め、surfaceTint overlay で階層表現するのが M3 推奨。

| Level | dp | 合成色 | shadow |
|---|---|---|---|
| 0 | 0  | `surface` | none |
| 1 | 1  | `surfaceContainerLow` | `0 1px 2px rgba(0,0,0,.30)` |
| 2 | 3  | `surfaceContainer` | `0 1px 2px rgba(0,0,0,.30), 0 2px 6px rgba(0,0,0,.15)` |
| 3 | 6  | `surfaceContainerHigh` | `0 1px 3px rgba(0,0,0,.30), 0 4px 8px rgba(0,0,0,.15)` |
| 4 | 8  | `surfaceContainerHighest` | `0 2px 3px rgba(0,0,0,.30), 0 6px 10px rgba(0,0,0,.15)` |
| 5 | 12 | `surfaceContainerHighest`+tint | `0 4px 4px rgba(0,0,0,.30), 0 8px 12px rgba(0,0,0,.15)` |

```css
:root {
  --elev-0: none;
  --elev-1: 0 1px 2px rgba(0,0,0,.30);
  --elev-2: 0 1px 2px rgba(0,0,0,.30), 0 2px 6px rgba(0,0,0,.15);
  --elev-3: 0 1px 3px rgba(0,0,0,.30), 0 4px 8px rgba(0,0,0,.15);
  --elev-4: 0 2px 3px rgba(0,0,0,.30), 0 6px 10px rgba(0,0,0,.15);
  --elev-5: 0 4px 4px rgba(0,0,0,.30), 0 8px 12px rgba(0,0,0,.15);
}
/* iOS は影を 1 ランク弱める */
html[data-platform="ios"] {
  --elev-1: 0 1px 1px rgba(0,0,0,.20);
  --elev-2: 0 1px 2px rgba(0,0,0,.25);
  --elev-3: 0 2px 4px rgba(0,0,0,.25);
  --elev-4: 0 4px 8px rgba(0,0,0,.30);
  --elev-5: 0 6px 16px rgba(0,0,0,.35);
}
```

### 2.4 形状（Shape）

| Token | 値 | 用途 | iOS override |
|---|---|---|---|
| `--shape-xs` | 4px | Snackbar | 6px |
| `--shape-sm` | 8px | Chip / TextField | 10px |
| `--shape-md` | 12px | Card (compact) | 14px |
| `--shape-lg` | 16px | Card / Button (large) | 16px |
| `--shape-xl` | 28px | BottomSheet 上端 / Dialog | 14px |
| `--shape-full` | 9999px | Pill / FAB | 9999 |

既存 `tokensV3.radius.card: 20` は両 OS で違和感 → `--shape-lg: 16px` に統一。

### 2.5 モーション

#### 2.5.1 トークン

| Token | 値 | 用途 |
|---|---|---|
| `--motion-easing-standard` | `cubic-bezier(0.2, 0, 0, 1)` | 一般遷移 |
| `--motion-easing-emphasized-decelerate` | `cubic-bezier(0.05, 0.7, 0.1, 1)` | 入場 |
| `--motion-easing-emphasized-accelerate` | `cubic-bezier(0.3, 0, 0.8, 0.15)` | 退場 |
| `--motion-duration-short1` | 50ms | hover/tap |
| `--motion-duration-short2` | 100ms | small change |
| `--motion-duration-short4` | 200ms | snackbar in |
| `--motion-duration-medium2` | 300ms | sheet open (default) |
| `--motion-duration-medium4` | 400ms | screen route |

iOS 分岐: `--motion-duration-medium2: 350ms`（iOS sheet 既定）。

#### 2.5.2 `prefers-reduced-motion`

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 1ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 1ms !important;
  }
}
```

`src/platform/motion.ts` に `usePrefersReducedMotion()` hook を提供。

### 2.6 状態レイヤー（M3 State Layers）

```css
:root {
  --state-hover-opacity:   0.08;
  --state-focus-opacity:   0.10;
  --state-pressed-opacity: 0.12;
  --state-dragged-opacity: 0.16;
  --state-disabled-content-opacity:   0.38;
  --state-disabled-container-opacity: 0.12;
}
```

iOS では State Layer を使わず `transform: scale(0.97)` + `opacity: 0.85` で Pressed を表現。Android は Material Ripple（`::after` 擬似要素 + opacity 遷移、§4 で実装）。

---

## 3. プラットフォーム分岐レイヤー

### 3.1 ディレクトリ構成（新設）

```
src/
├── platform/
│   ├── index.ts          // 一括 export
│   ├── platform.ts       // isIOS / isAndroid / isNative / isWeb
│   ├── statusBar.ts      // wraps @capacitor/status-bar
│   ├── splash.ts         // wraps @capacitor/splash-screen
│   ├── haptics.ts        // wraps @capacitor/haptics (NEW)
│   ├── dialog.ts         // wraps @capacitor/dialog (NEW)
│   ├── share.ts          // wraps @capacitor/share (NEW)
│   ├── keyboard.ts       // wraps @capacitor/keyboard (NEW)
│   ├── actionSheet.ts    // wraps @capacitor/action-sheet (NEW)
│   ├── safeArea.ts       // env(safe-area-inset-*) helpers
│   ├── motion.ts         // usePrefersReducedMotion etc.
│   ├── backGesture.ts    // iOS edge-swipe + Android predictive back
│   └── typeScale.ts      // type scale platform offset
└── components/
    └── platform/         // Header / ConfirmDialog / ActionSheet
```

### 3.2 `platform.ts` ユーティリティ

```ts
// src/platform/platform.ts
import { Capacitor } from '@capacitor/core'

export type PlatformId = 'ios' | 'android' | 'web'

export function getPlatform(): PlatformId {
  return Capacitor.getPlatform() as PlatformId
}
export const isIOS     = () => getPlatform() === 'ios'
export const isAndroid = () => getPlatform() === 'android'
export const isWeb     = () => getPlatform() === 'web'
export const isNative  = () => isIOS() || isAndroid()

export function setHtmlPlatformAttr(): void {
  if (typeof document === 'undefined') return
  document.documentElement.setAttribute('data-platform', getPlatform())
}

export function pickByPlatform<T>(opts: { ios: T; android: T; web?: T }): T {
  if (isIOS()) return opts.ios
  if (isAndroid()) return opts.android
  return opts.web ?? opts.android
}
```

`src/main.tsx` で起動時最初に `setHtmlPlatformAttr()` を呼ぶ。

### 3.3 追加必要 Capacitor プラグイン

| パッケージ | 用途 |
|---|---|
| `@capacitor/haptics` ^6 | UIImpactFeedback / HapticFeedbackConstants |
| `@capacitor/dialog` ^6 | OS native confirm/alert/prompt |
| `@capacitor/share` ^6 | UIActivityViewController / Share Intent |
| `@capacitor/keyboard` ^6 | キーボード avoidance / 高さ通知 |
| `@capacitor/action-sheet` ^6 | iOS 風 Action Sheet |

`npm i @capacitor/haptics @capacitor/dialog @capacitor/share @capacitor/keyboard @capacitor/action-sheet && npx cap sync`

### 3.4 ラッパー API I/F

#### 3.4.1 `dialog.ts`

```ts
import { Dialog } from '@capacitor/dialog'
import { isNative } from './platform'

export async function alert(title: string, message?: string): Promise<void> {
  if (isNative()) await Dialog.alert({ title, message: message ?? '' })
  else window.alert(`${title}\n\n${message ?? ''}`)
}

export async function confirm(opts: {
  title: string; message?: string; okText?: string; cancelText?: string; destructive?: boolean
}): Promise<boolean> {
  if (isNative()) {
    const res = await Dialog.confirm({
      title: opts.title, message: opts.message ?? '',
      okButtonTitle: opts.okText ?? 'OK',
      cancelButtonTitle: opts.cancelText ?? 'キャンセル',
    })
    return res.value
  }
  return window.confirm(`${opts.title}\n\n${opts.message ?? ''}`)
}
```

OS native dialog は **iOS=UIAlertController / Android=Material AlertDialog** を自動描画 → 明示分岐コード不要。破壊的操作は §4 のカスタム `<ConfirmDialog>` で表現。

#### 3.4.2 `haptics.ts`

```ts
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics'
import { isNative } from './platform'

export const haptic = {
  light:   () => isNative() && Haptics.impact({ style: ImpactStyle.Light }).catch(()=>{}),
  medium:  () => isNative() && Haptics.impact({ style: ImpactStyle.Medium }).catch(()=>{}),
  heavy:   () => isNative() && Haptics.impact({ style: ImpactStyle.Heavy }).catch(()=>{}),
  selection: () => isNative() && Haptics.selectionStart().then(() => Haptics.selectionEnd()).catch(()=>{}),
  success: () => isNative() && Haptics.notification({ type: NotificationType.Success }).catch(()=>{}),
  warning: () => isNative() && Haptics.notification({ type: NotificationType.Warning }).catch(()=>{}),
  error:   () => isNative() && Haptics.notification({ type: NotificationType.Error }).catch(()=>{}),
}
```

**使い分け**: ボタン → `light`、レッスン正解 → `success`、不正解 → `warning`、削除 → `medium`、トグル → `selection`、ネットワークエラー → `error`。

#### 3.4.3 `share.ts`

```ts
import { Share } from '@capacitor/share'
import { isNative } from './platform'

export async function openShareSheet(opts: {
  title?: string; text: string; url?: string; dialogTitle?: string
}): Promise<void> {
  if (isNative()) {
    await Share.share({ ...opts, dialogTitle: opts.dialogTitle ?? '共有' })
    return
  }
  if (typeof navigator.share === 'function') await navigator.share(opts)
  else { await navigator.clipboard.writeText([opts.title, opts.text, opts.url].filter(Boolean).join('\n')) }
}
```

#### 3.4.4 `keyboard.ts`

```ts
import { Keyboard, KeyboardResize } from '@capacitor/keyboard'
import { isNative, isIOS } from './platform'

export async function configureKeyboard(): Promise<void> {
  if (!isNative()) return
  await Keyboard.setResizeMode({ mode: isIOS() ? KeyboardResize.Native : KeyboardResize.Body })
  await Keyboard.setAccessoryBarVisible({ isVisible: true }).catch(() => {})
}

export function useKeyboardHeight(): number {
  const [h, setH] = useState(0)
  useEffect(() => {
    if (!isNative()) return
    const showSub = Keyboard.addListener('keyboardWillShow', e => setH(e.keyboardHeight))
    const hideSub = Keyboard.addListener('keyboardWillHide', () => setH(0))
    return () => { showSub.then(s => s.remove()); hideSub.then(s => s.remove()) }
  }, [])
  return h
}
```

#### 3.4.5 `statusBar.ts`

```ts
import { StatusBar, Style } from '@capacitor/status-bar'
import { isNative, isAndroid } from './platform'

const SURFACE = '#1A1F2E'

export async function configureStatusBar(): Promise<void> {
  if (!isNative()) return
  await StatusBar.setStyle({ style: Style.Light })  // 白アイコン
  if (isAndroid()) {
    await StatusBar.setBackgroundColor({ color: SURFACE })
    await StatusBar.setOverlaysWebView({ overlay: true }) // edge-to-edge
  }
}
```

`capacitor.config.ts` の StatusBar 既存設定 (`style: 'DARK'`, `backgroundColor: '#F5F1E8'`) は **誤り（旧 light テーマ色）**。Phase 0 で `style: 'LIGHT'` + `backgroundColor: '#1A1F2E'` + `overlaysWebView: true` に修正。

#### 3.4.6 `splash.ts`

```ts
import { SplashScreen } from '@capacitor/splash-screen'
import { isNative } from './platform'
export async function hideSplash(): Promise<void> {
  if (!isNative()) return
  await SplashScreen.hide({ fadeOutDuration: 200 }).catch(() => {})
}
```

`AppV3.tsx` の `authReady=true` 時 or 1500ms timeout で必ず呼ぶ（**現状未呼び出し → スプラッシュが消えない可能性**）。

#### 3.4.7 `actionSheet.ts`

```ts
import { ActionSheet, ActionSheetButtonStyle } from '@capacitor/action-sheet'
import { isNative } from './platform'

export async function presentActionSheet(opts: {
  title?: string; message?: string;
  options: { title: string; destructive?: boolean; cancel?: boolean }[]
}): Promise<number> {
  if (isNative()) {
    const res = await ActionSheet.showActions({
      ...opts,
      options: opts.options.map(o => ({
        title: o.title,
        style: o.destructive ? ActionSheetButtonStyle.Destructive
             : o.cancel ? ActionSheetButtonStyle.Cancel
             : ActionSheetButtonStyle.Default,
      })),
    })
    return res.index
  }
  return -1 // Web は <ActionSheet> コンポーネントで代替
}
```

#### 3.4.8 `backGesture.ts`

```ts
import { App as CapApp } from '@capacitor/app'
import { isAndroid, isIOS } from './platform'

export function registerBackHandler(handler: () => boolean): () => void {
  if (isAndroid()) {
    const sub = CapApp.addListener('backButton', ({ canGoBack }) => {
      const handled = handler()
      if (!handled && !canGoBack) CapApp.exitApp()
    })
    return () => { sub.then(s => s.remove()) }
  }
  // iOS: WKWebView の allowsBackForwardNavigationGestures が popstate を発火
  // Web: popstate 同上
  const onPop = () => { handler() }
  window.addEventListener('popstate', onPop)
  return () => window.removeEventListener('popstate', onPop)
}
```

iOS edge-swipe は WKWebView の native 機能で popstate が自動発火 → **追加実装不要**。Android Predictive Back は `AndroidManifest.xml` `<application android:enableOnBackInvokedCallback="true">` を Phase 0 で追加。

### 3.5 分岐すべき UI 要素 完全対応表

| 要素 | iOS | Android | 共通 |
|---|---|---|---|
| **戻るアイコン** | chevron.left 細線 (strokeWidth 1.5)、ラベル「戻る」省略可 | arrow_back 太線 (strokeWidth 2)、ラベルなし | tap target ≥ 44pt/48dp |
| **アラート/確認** | 中央寄せ、ボタン縦並び（破壊操作）/ 横 2 分割 | 左寄せ、ボタン右下水平 | scrim 0.55 |
| **アクションシート** | 下スライド・最下段に取消 | M3 Modal Bottom Sheet ハンドル付き | scrim 0.55 |
| **触覚** | UIImpactFeedback (Capacitor 抽象) | HapticFeedbackConstants (同上) | ボタン=light、成功=success |
| **押下フィードバック** | scale 0.97 + opacity 0.85、ripple なし | Material Ripple (state layer 12%) | `-webkit-tap-highlight-color: transparent` |
| **戻るジェスチャー** | 左端 0–20px から swipe (OS native, popstate 発火) | OS 戻るボタン + Predictive Back (API 35+) | popstate で React 状態同期 |
| **ローディング** | iOS spinner (8 線, CSS) | M3 CircularProgress (4dp 弧, 回転+伸縮) | size sm/md/lg |
| **TabBar** | 下部, blur, active=primary ドット, icon 22pt, label 11pt | M3 Bottom Nav, active pill (`secondaryContainer`) | safe-area-inset-bottom |
| **Header** | 中央タイトル, bg=surface 透過 | 左寄せ, bg=surfaceContainer | 高さ 44pt/64dp |
| **TextField** | underlined or rounded box | M3 Filled/Outlined + float label | font-size ≥ 16px |
| **Switch** | iOS 風 track 31×51, thumb 27 round | M3 Switch track 32×52, thumb 24 with state | minTouch 44/48 |
| **Date/Time Picker** | iOS Wheel | M3 Date/Time Picker | localized format |
| **Snackbar** | 上部 Banner | M3 Snackbar 下部, action 右 | 4s auto dismiss |
| **Sheet** | iOS sheet (peek/full) ハンドル | M3 BottomSheet ハンドル | drag-to-dismiss |
| **FAB** | 通常 button または小型 | M3 FAB 56dp, `primaryContainer` bg | 右下, safe-bottom + 16 |
| **Divider** | hairline 0.5px | 1dp `outlineVariant` | `outline-variant` 色 |

---

## 4. 共通コンポーネント仕様

凡例: ⭐ 新規 / 🔧 修正 / ✅ 維持

### 4.1 AppShell 🔧

**変更点**:
- 背景を `var(--md-sys-color-surface)` に（現状 `#1A1F2E` 直書き）
- TabBar の `padding-bottom: calc(env(safe-area-inset-bottom) + 12px)`
- Active tab indicator: iOS=ドット / Android=`secondaryContainer` pill 背景
- 高さ: iOS=49pt + safe-bottom / Android=80dp + system gesture inset
- iOS では「スクロールで TabBar を隠す」既存挙動 (`navHidden`) を **disable**（HIG では非標準）。Android のみ維持
- Tab 押下時 `haptic.light()`、`role="tablist" / role="tab" / aria-selected`

### 4.2 Header ⭐ (`src/components/platform/Header.tsx`)

```tsx
export interface HeaderProps {
  title?: string
  largeTitle?: boolean   // iOS 風 Large Title
  onBack?: () => void
  trailing?: ReactNode
}
```

- iOS: chevron.left strokeWidth 1.5 + ラベル「戻る」（任意）、タイトル中央
- Android: arrow_back strokeWidth 2、タイトル左寄せ
- 高さ: iOS=44pt / Android=64dp
- `padding-top: env(safe-area-inset-top, 0px)` 必須
- 全 44 画面の自前ヘッダーをこれに置換 (Phase 2)

### 4.3 Button 🔧

**M3 5 variants**: `filled` / `tonal` / `outlined` / `text` / `elevated`
（既存 `default/primary/ghost/dark/danger` は alias で残し Phase 1 で deprecation warning）

```tsx
interface Props {
  variant?: 'filled' | 'tonal' | 'outlined' | 'text' | 'elevated'
  size?: 'sm' | 'md' | 'lg'
  block?: boolean
  destructive?: boolean
}
```

- 最低 `min-height: 44px`（iOS HIG）/ Android では 48dp
- iOS: `:active { transform: scale(0.97); opacity: 0.85 }`、ripple なし
- Android: Material Ripple を `::after` 擬似要素 + opacity 遷移で表現
- `.btn-primary { transform: translateY(-2px) }` のような hover で持ち上がる動作は iOS で違和感 → 削除
- `:focus-visible { outline: 2px solid var(--md-sys-color-primary); outline-offset: 2px }`
- 押下時 `haptic.light()` を自動付加

### 4.4 IconButton 🔧

- サイズ: iOS=44×44、Android=48×48（`data-platform` で分岐）
- destructive prop で `--md-sys-color-error` 着色
- 押下時 `haptic.light()` 自動

### 4.5 Card 🔧

- M3 Card variants: `filled` / `outlined` / `elevated`
- 角丸 `var(--shape-lg)` (16px) に統一（旧 `tokensV3.radius.card: 20` 廃止）
- `interactive` または `onClick` 指定時は `<button>` ベースに変更（現状 `<div onClick>` 34 件）
- インタラクティブ時に M3 State Layer (8/12%) 適用

### 4.6 Badge / ProgressBar 🔧

**Badge**:
- 色を M3 Role に置換（`success/warning/danger/accent` → `tertiary/error/primary/secondary` Container）
- font-size を `var(--md-sys-typescale-label-small-size)`

**ProgressBar**:
- M3 Linear Progress: track 4dp、active 4dp、indeterminate 対応
- `role="progressbar" + aria-valuenow/min/max` 必須
- transition を `var(--motion-easing-emphasized-decelerate)` に
- iOS では UIProgressView 風に角丸 2px

### 4.7 ConfirmDialog 🔧 (プラットフォーム分岐)

`window.confirm` 6 箇所を完全置換する新版。`src/components/platform/ConfirmDialog.tsx`。

```tsx
export interface ConfirmDialogProps {
  open: boolean
  title: string
  message?: string
  okText?: string
  cancelText?: string
  destructive?: boolean
  onConfirm: () => void
  onCancel: () => void
}
```

**iOS スタイル**:
- 中央寄せ、max-width 270px
- ボタン横 2 分割（border-right 0.5px hairline）
- ボタン高さ 44pt、ボタン押下時 background 微変化

**Android スタイル**:
- 左寄せ、max-width 320px
- ボタン右下水平、TextButton スタイル
- 上下 padding 24px、border-radius 28px (`--shape-xl`)

**共通**:
- scrim `var(--md-sys-color-scrim)` 0.55 不透明
- Focus trap + Escape で cancel
- destructive=true の場合は確認ボタンを `error` 色に

### 4.8 Snackbar ⭐ (`src/components/Snackbar.tsx`)

- M3 Snackbar 仕様: bottom: `calc(env(safe-area-inset-bottom) + 96px)` (TabBar の上)
- inverseSurface bg, inverseOnSurface text
- 4s auto dismiss、action ボタン右に optional
- `role="status" aria-live="polite"`
- `SnackbarProvider` で root に Portal、`useSnackbar()` hook 提供

### 4.9 ActionSheet ⭐ (プラットフォーム分岐)

- iOS: `presentActionSheet()`（§3.4.7）でネイティブ呼び出し → OS UI
- Android / Web: カスタム `<ActionSheet>` コンポーネント (M3 Modal Bottom Sheet)
- ハンドル付き、`safe-area-inset-bottom` 反映、ドラッグ閉じ対応
- destructive オプションは `error` 色

### 4.10 Sheet / BottomSheet ⭐

ActionSheet と同じ basecontainer、任意 children を入れる generic 用途。

ドラッグ閉じ実装:
- ハンドル領域に touchstart/move/end を attach
- 移動 dy > 120px で `onDismiss()`
- それ以外は `transform: ''` でリセット
- reduced-motion 時は drag を無効化

### 4.11 TextField / Input 🔧 (`src/components/TextField.tsx`)

**重要変更**:
- `font-size: 16px 必須`（iOS Safari の auto-zoom 回避）。現状 14px 箇所（`.pt-nick-input`, `.rp-input`）を全修正
- M3 Filled / Outlined variants
- Float label（Android）/ Static label（iOS）
- `enterKeyHint` / `inputMode` / `autoComplete` を必ず指定
- `min-height: 44px`、focus 時 border 2px primary

### 4.12 LoadingIndicator ⭐ (プラットフォーム分岐)

- iOS: 8 線スピナー（CSS keyframes でフェード回転）、UIActivityIndicatorView 風
- Android: M3 CircularProgress、4dp 線幅、半弧が回転 + 弧の長さが伸縮
- size: `sm` (16px) / `md` (24px) / `lg` (40px)
- `role="status" aria-label="読み込み中"`

### 4.13 Switch ⭐ (Settings の Toggle を昇格)

- iOS: track 31×51、thumb 27 round、ON=`primary`
- Android: M3 Switch track 32×52、thumb 24（state size 変化）、ON=`primary` + thumb=`onPrimary`
- minTouch 44/48 を確保するため周辺に padding

### 4.14 Toast ⭐

軽量版 Snackbar — action なし、3 秒自動消滅、`useToast()` hook 提供。

### 4.15 ESLint カスタムルール

```js
// eslint.config.js (追加)
'no-restricted-globals': ['error',
  { name: 'confirm', message: 'Use platform/dialog.ts confirm() instead.' },
  { name: 'alert',   message: 'Use platform/dialog.ts alert() instead.' },
  { name: 'prompt',  message: 'Use platform/dialog.ts prompt() instead.' },
],
'no-restricted-syntax': ['warn',
  { selector: "Literal[value=/^#[0-9A-Fa-f]{6}$/]",
    message: 'Use --md-sys-color-* token instead of hex literal.' },
  { selector: "JSXOpeningElement[name.name='div'] > JSXAttribute[name.name='onClick']",
    message: 'Replace <div onClick> with <button>.' },
],
```

---

## 5. 全44画面 個別仕様

### 5.0 画面インベントリ
44 画面 = 43 `.tsx` (`src/screens/`) + 1 `OnboardingScreen` 経路（実体は `src/screens/OnboardingScreen.tsx` で重複なし）。`LessonGrid.tsx` はサブコンポーネントだが画面遷移先として使われる場面があるため独立節として扱う。

| # | 画面ファイル | カテゴリ | 主要ヘッダーパターン | 緊急度 |
|---|---|---|---|---|
| 1 | `HomeScreen.tsx` (旧) | ホーム | カスタム | 削除候補 |
| 2 | `HomeScreenV3.tsx` ★ | ホーム | カスタム（戻る無し・ロゴ） | 高 |
| 3 | `RoadmapScreen.tsx` (旧) | レッスン一覧 | カスタム | 削除候補 |
| 4 | `RoadmapScreenV3.tsx` ★ | レッスン一覧 | 36×36戻る | 高 |
| 5 | `LessonScreen.tsx` | レッスン本体 | ProgressBar | 高 |
| 6 | `LessonStoriesScreen.tsx` | カテゴリ詳細 | カスタム | 高 |
| 7 | `LessonCompleteScreen.tsx` | 完了画面 | なし（フルスクリーン） | 中 |
| 8 | `LessonGrid.tsx` | グリッド | 親に依存 | 低 |
| 9 | `CompletedLessonsScreen.tsx` | 完了一覧 | IconButton戻る | 中 |
| 10 | `PersonalCourseScreen.tsx` | コース詳細 | 36×36戻る | 中 |
| 11 | `FlashcardsScreen.tsx` | 復習 | カスタム | 中 |
| 12 | `FermiScreen.tsx` | フェルミ推定 | カスタム | 中 |
| 13 | `FermiRankingScreen.tsx` | フェルミランキング | safe-area対応済 | 中 |
| 14 | `DailyFermiScreen.tsx` | 今日の1問 | カスタム | 中 |
| 15 | `DailyProblemScreen.tsx` | 今日の問題 | カスタム | 中 |
| 16 | `JournalInputScreen.tsx` | ジャーナル入力 | テキストエリア中心 | 中 |
| 17 | `WorksheetScreen.tsx` | ワークシート | カスタム | 中 |
| 18 | `RoleplaySelectScreen.tsx` | ロールプレイ選択 | カスタム | 中 |
| 19 | `RoleplayChatScreen.tsx` | ロールプレイ会話 | チャットUI・キーボード | 高 |
| 20 | `AIProblemGenScreen.tsx` | AI問題生成 | 36×36戻る・bottom-sheet | 高 |
| 21 | `AIProblemScreen.tsx` | AI問題回答 | カスタム | 中 |
| 22 | `PlacementTestScreen.tsx` | 診断テスト | カスタム | 中 |
| 23 | `RankingScreen.tsx` | ランキング | safe-area対応済 | 中 |
| 24 | `RankScreen.tsx` | ランク | カスタム | 中 |
| 25 | `StreakScreen.tsx` | 連続記録 | カスタム | 中 |
| 26 | `StatsScreen.tsx` (旧) | 統計 | カスタム | 削除候補 |
| 27 | `StatsScreenV3.tsx` ★ | 統計 | カスタム | 中 |
| 28 | `DeviationScreen.tsx` | 偏差値 | カスタム | 中 |
| 29 | `StudyTimeScreen.tsx` | 学習時間 | カスタム | 低 |
| 30 | `ProfileScreen.tsx` (旧) | プロフィール | カスタム | 削除候補 |
| 31 | `ProfileScreenV3.tsx` ★ | プロフィール | グラデヘッダー | 高 |
| 32 | `SettingsScreen.tsx` | 設定 | IconButton戻る・stack | 高 |
| 33 | `AccountSettingsScreen.tsx` | アカウント | 36×36戻る・window.confirm | 高 |
| 34 | `NotificationSettingsScreen.tsx` | 通知設定 | カスタム | 中 |
| 35 | `LanguageScreen.tsx` | 言語選択 | カスタム | 低 |
| 36 | `ThemeSettingsScreen.tsx` | テーマ設定 | カスタム | 低（廃止候補） |
| 37 | `PricingScreen.tsx` ★ | 課金 | 36×36戻る | 高（審査直撃） |
| 38 | `PricingV3.tsx` (未使用) | 課金 | — | 削除候補 |
| 39 | `LoginScreen.tsx` | ログイン | フルスクリーン | 高 |
| 40 | `OnboardingScreen.tsx` | オンボーディング | 36×36戻る | 高 |
| 41 | `BetaCodeScreen.tsx` | ベータコード | カスタム | 低 |
| 42 | `FeedbackScreen.tsx` | フィードバック投稿 | カスタム | 中 |
| 43 | `FeedbackDashboardScreen.tsx` | フィードバック閲覧 | safe-area対応済 | 低（管理画面） |
| 44 | `ReportProblemScreen.tsx` | 問題報告 | カスタム | 中 |

★ = 本番採用画面。旧版（HomeScreen / RoadmapScreen / StatsScreen / ProfileScreen / PricingV3）は削除前提。

### 5.1 ホーム — `HomeScreenV3.tsx`

**役割**: アプリ起動後のメインハブ。今日の1問・おすすめレッスン・診断・復習・AI機能への導線。

**ヘッダー**
- ロゴ `Logic.` 左寄せ、右側はアクションなし
- `padding-top`: `calc(env(safe-area-inset-top, 44px) + 4px)` — 既に対応済み
- ステータスバー: `Style.Light` (透過、白文字)

**ステータスバー / セーフエリア**
- iOS: `StatusBar.setStyle({ style: Style.Light })`、`StatusBar.setOverlaysWebView({ overlay: true })`
- Android: 同上 + `StatusBar.setBackgroundColor({ color: '#1A1F2E' })`、edge-to-edge 有効

**iOS 固有**
- 今日の1問カード長押し → コンテキストメニュー（共有 / 後で）
- カードタップ時 `Haptics.impact(Light)`

**Android 固有**
- カードに Material Ripple
- カードタップ時 `Haptics.impact(Light)`（Capacitor 抽象）
- 戻るボタン押下で「もう一度押すと終了」スナックバー

**アクセシビリティ**
- 全 `<div onClick>` を `<button>` 化
- カードに `aria-label="今日の1問: <質問文>"` 等の合成ラベル
- ストリーク数値を `aria-live="polite"`

**修正項目**
- L100 `fontFamily: "'Noto Sans JP', sans-serif"` → 共通 `--font-ui` に
- L121, L146, L224, L286 の `<div onClick>` → `<button>`
- L296 `'rgba(0,0,0,.55)'` リテラル → `var(--md-sys-color-scrim)` 相当
- カード周りに M3 State Layer (8/12%) を追加

### 5.2 ホーム（旧） — `HomeScreen.tsx`
**処遇**: AppV3 で未使用。**削除**。

### 5.3 ロードマップ — `RoadmapScreenV3.tsx`

**役割**: カテゴリ別レッスン一覧、進捗ビジュアル

**ヘッダー**
- 左: 戻るボタン（**現状 36×36 → 44×44 に**）
- 中央: タイトル
- 右: 共有ボタン（新規）

**ステータスバー / セーフエリア**
- `padding-top: calc(env(safe-area-inset-top, 44px) + 4px)` 対応済み（L238, L707）

**iOS 固有**
- ヘッダー戻るアイコン: SF Symbols 風 chevron.left（細線、サイズ 17pt 相当）
- 左端スワイプバック対応

**Android 固有**
- ヘッダー戻るアイコン: arrow_back（線太め、24dp）
- カード長押しでコンテキストメニュー

**修正項目**
- 戻るボタンを `Header` コンポーネント（5.x で新設）に置換
- カード一覧に `role="list"` / `role="listitem"`

### 5.4 ロードマップ（旧） — `RoadmapScreen.tsx`
**処遇**: V3 採用済み。**削除**。

### 5.5 レッスン本体 — `LessonScreen.tsx`

**役割**: 設問・選択・解説。アプリの中核体験。

**ヘッダー**
- 左: 閉じる（×）ボタン — 戻るではなく **dismiss**（中断確認モーダル）
- 中央: ProgressBar（小さく）
- 右: ヘルプ／一時停止

**iOS 固有**
- 閉じる時に `ConfirmDialog` (中央モーダル, タイトル＋メッセージ＋[キャンセル][中断する])
- 正解: `Haptics.notification(Success)`、不正解: `Haptics.notification(Error)`
- 選択肢タップ: scale 0.97 アニメーション

**Android 固有**
- 閉じる時に Material Dialog（タイトル左寄せ、ボタン右下、TextButton スタイル）
- 同上 Haptics
- 選択肢タップ: Material Ripple

**アクセシビリティ**
- 設問本文に `aria-live="polite"`
- 選択肢に `role="radio"` / `aria-checked`
- 結果に `aria-live="assertive"`
- ProgressBar に `role="progressbar"` + `aria-valuenow`

**修正項目**
- `answer-bounce`/`answer-shake` アニメに reduced-motion フォールバック
- 選択肢の最小高 56px
- 「次へ」CTA を画面下端 fixed、`safe-area-inset-bottom` 反映

### 5.6 レッスン完了 — `LessonCompleteScreen.tsx`

**役割**: 称賛・XP獲得・ストリーク継続表示

**iOS 固有**
- 表示時 `Haptics.notification(Success)` を 1 回のみ
- Confetti は `prefers-reduced-motion` 時に無効化

**Android 固有**
- 同上 Haptics
- 「次へ」FAB（Extended FAB） を画面右下に置く（M3 規約）。iOS は通常ボタン

**修正項目**
- `Confetti.tsx` に `prefers-reduced-motion: reduce` ガード
- XP バッジアニメに duration トークン採用

### 5.7 レッスン カテゴリ詳細 — `LessonStoriesScreen.tsx`

**役割**: カテゴリ内のレッスン一覧 + 紹介

**修正項目**
- L431 のインライン色値 `v3.color.accent` 等は OK だが、padding `'14px'` などをトークン化

### 5.8 完了レッスン一覧 — `CompletedLessonsScreen.tsx`

**役割**: 完了済みレッスンの履歴

**修正項目**
- リスト要素を `<button>` 化、`aria-label="<タイトル> 完了済み"`
- 空状態に絵文字でなく M3 Empty State パターン

### 5.9 パーソナルコース — `PersonalCourseScreen.tsx`

**役割**: 診断結果から組まれた推奨レッスン

**修正項目**
- L25, L49 の戻るボタン 36×36 → 44×44

### 5.10 フラッシュカード復習 — `FlashcardsScreen.tsx`

**役割**: SRS ベースの復習カード

**iOS 固有**
- カード左右スワイプで「覚えた / もう一度」（既存 UX 維持）
- 反転時 `Haptics.impact(Light)`

**Android 固有**
- 同上 + Material Ripple
- スワイプの dismiss 動作は Material Motion (FastOutSlowIn)

**修正項目**
- スワイプ閾値: 画面幅の 30% で確定（HIG / M3 共通推奨）
- カードに `aria-label` でテキストを読み上げ

### 5.11 フェルミ推定 — `FermiScreen.tsx`

**役割**: フェルミ問題ハブ

**修正項目**
- カード CTA の最小高 44px

### 5.12 フェルミランキング — `FermiRankingScreen.tsx`

**修正項目**
- safe-area 対応済（L65）
- リストの仮想スクロール検討（100件以上時）

### 5.13 今日の1問 — `DailyFermiScreen.tsx`

**役割**: 毎日更新のフェルミ問題

**iOS 固有**
- 解答送信時 `Haptics.notification(Success)`
- 終了時の Share Sheet（iOS UIActivityViewController） — `@capacitor/share`

**Android 固有**
- 同上 + Android 標準共有インテント

**修正項目**
- 数値入力欄 `inputMode="numeric"`, `enterKeyHint="done"`
- 入力 `font-size: 16px` 以上

### 5.14 今日の問題 — `DailyProblemScreen.tsx`

**役割**: AI 生成の今日の問題

**修正項目**
- LessonScreen と同じヘッダー仕様

### 5.15 ジャーナル入力 — `JournalInputScreen.tsx`

**役割**: ロジカル・シンキング演習の記述入力

**iOS 固有**
- キーボード上に「完了」ツールバー (`@capacitor/keyboard` の `setAccessoryBarVisible`)
- フォーカス時 `Keyboard.setResizeMode({ mode: KeyboardResize.Body })`

**Android 固有**
- IME action: `enterKeyHint="done"` で次/完了切替
- `windowSoftInputMode: adjustResize`（`AndroidManifest.xml`）

**修正項目**
- `<textarea>` の `font-size: 16px` 必須
- 文字数カウンタを `aria-live="polite"`

### 5.16 ワークシート — `WorksheetScreen.tsx`

**役割**: 印刷・ダウンロード用ワーク

**iOS 固有**
- 共有 Sheet で PDF 出力（UIActivityViewController）

**Android 固有**
- 共有インテント + Storage Access Framework

### 5.17 ロールプレイ選択 — `RoleplaySelectScreen.tsx`

**役割**: シナリオ一覧

**修正項目**
- L166-241 の大量インライン `fontSize: 14` を sub フォントトークンに
- カードを `<button>` 化

### 5.18 ロールプレイ会話 — `RoleplayChatScreen.tsx`

**役割**: AI とのチャット

**iOS 固有**
- キーボード表示時の自動スクロール（`Keyboard.addListener('keyboardWillShow')`）
- メッセージ送信時 `Haptics.impact(Light)`

**Android 固有**
- IME 表示時の `windowSoftInputMode: adjustResize`
- 送信時 Haptics

**修正項目**
- メッセージ入力欄 `font-size: 16px` 強制
- 入力欄を `safe-area-inset-bottom` で持ち上げ

### 5.19 AI 問題生成 — `AIProblemGenScreen.tsx`

**役割**: ユーザー入力からAI問題を生成

**修正項目**
- L249 の戻るボタン 36×36 → 44×44
- L124 bottom-sheet にドラッグハンドル追加（HIG / M3 共通）
- bottom-sheet を新コンポーネント `<BottomSheet>` (5.x) に置換

### 5.20 AI 問題回答 — `AIProblemScreen.tsx`

**役割**: 生成された問題への回答

**修正項目**
- LessonScreen と同じヘッダー仕様

### 5.21 診断テスト — `PlacementTestScreen.tsx`

**役割**: 初回 / 任意の能力診断

**修正項目**
- 進捗 ProgressBar に aria 属性
- 中断ジェスチャに ConfirmDialog

### 5.22 ランキング — `RankingScreen.tsx`

**修正項目**
- safe-area 対応済（L117）
- 自分の順位を sticky で常時表示（HIG / M3 共通推奨）

### 5.23 ランク — `RankScreen.tsx`

**役割**: 自分のランク詳細

**修正項目**
- バッジ画像に `alt` 属性必須

### 5.24 連続記録 — `StreakScreen.tsx`

**役割**: ストリーク詳細

**iOS 固有**
- ストリーク到達時 `Haptics.notification(Success)`

**Android 固有**
- 同上

### 5.25 統計（旧） — `StatsScreen.tsx`
**処遇**: V3 採用済み。**削除**。

### 5.26 統計 — `StatsScreenV3.tsx`

**修正項目**
- RadarChart に `role="img"` + `aria-label`（既存対応済み: L65）
- グラフのタッチ拡大対応

### 5.27 偏差値 — `DeviationScreen.tsx`

**役割**: 学力偏差値表示

**修正項目**
- 数値アニメに reduced-motion フォールバック

### 5.28 学習時間 — `StudyTimeScreen.tsx`

**修正項目**
- グラフに aria-label
- 軽微（緊急度低）

### 5.29 プロフィール（旧） — `ProfileScreen.tsx`
**処遇**: V3 採用済み。**削除**。

### 5.30 プロフィール — `ProfileScreenV3.tsx`

**役割**: ユーザー名・統計・設定への入口

**修正項目**
- L57 グラデーションヘッダーに safe-area 対応済
- リスト項目を SettingsRow パターンに統一
- L312, L403 の `alert()` を Snackbar に置換
- L403 の削除確認を `ConfirmDialog`（プラットフォーム分岐版）に

### 5.31 設定 — `SettingsScreen.tsx`

**役割**: アプリ全般の設定

**iOS 固有**
- セクション見出しは UIKit Settings 風 (uppercase, 小文字, leading inset)
- セパレータは leading 16pt から
- `<select>` を `<ActionSheet>` に置換（iOS 標準は picker / action sheet）

**Android 固有**
- セクション見出しは M3 Section Header（accent color, sentence case）
- セパレータは full-bleed
- `<select>` は M3 Dropdown Menu

**修正項目**
- L119 `window.confirm(...)` → 新 `<ConfirmDialog>` 経由
- L207, L222 の `<select fontSize: 18>` は OK だが iOS では `<ActionSheet>` 推奨
- Toggle コンポーネント（L60-77）を `Switch` 共通コンポーネントへ
- `useLayoutEffect` での setState 警告（L84-90）対応

### 5.32 アカウント設定 — `AccountSettingsScreen.tsx`

**役割**: アカウント情報管理

**修正項目**
- L37 `window.confirm('ログアウトしますか？')` → `<ConfirmDialog>`
- L70 戻るボタン 36×36 → 44×44
- L108 ボタンの `fontSize: 14` → 16+ (タイポトークン)

### 5.33 通知設定 — `NotificationSettingsScreen.tsx`

**役割**: ローカル通知の時刻設定

**iOS 固有**
- 時刻 picker は iOS UIDatePicker 風（ホイール）
- 通知権限拒否時のディープリンク `App.openUrl` で iOS 設定アプリへ

**Android 固有**
- 時刻 picker は Material Time Picker
- API 33+ の `POST_NOTIFICATIONS` runtime permission ハンドリング

### 5.34 言語選択 — `LanguageScreen.tsx`

**役割**: ja / en 切替

**修正項目**
- ラジオボタンに `role="radiogroup"`
- 軽微（緊急度低）

### 5.35 テーマ設定 — `ThemeSettingsScreen.tsx`

**処遇**: ブランド = ダーク固定の方針により **廃止候補**。
- 移行期間中は読み取り専用で「ダーク固定 (Slate Blue)」と表示
- v1.x の次マイナーで削除

### 5.36 課金 — `PricingScreen.tsx`

**役割**: サブスクリプション販売（**App Store / Google Play 審査の最重要画面**）

**iOS 固有**
- 「復元購入」ボタン必須（HIG + Apple ガイドライン）
- 価格表示は `Intl.NumberFormat` でロケール準拠
- 購入フローは StoreKit 2 (Capacitor 経由)
- 契約条件・自動更新明記必須（Apple 4.0 ガイドライン）

**Android 固有**
- Google Play Billing 経由（既存実装）
- 「復元購入」 = Play 仕様では不要だが「購入を確認」リンクは置く

**修正項目**
- L132-133 ヘッダー戻る 36×36 → 44×44
- 利用規約・プライバシーへのリンク必須（両 OS）
- 解約手順を画面内で説明（Apple 審査でリジェクトされやすい）

### 5.37 課金（旧） — `PricingV3.tsx`
**処遇**: AppV3 で未使用。**削除**。

### 5.38 ログイン — `LoginScreen.tsx`

**役割**: Google / メールアドレス認証

**iOS 固有**
- **Sign in with Apple 必須**（Apple の「他社認証あるなら Apple も」ルール）
- Apple Sign-In ボタンは Apple HIG のスペック（高さ 44pt 以上、SF Pro Bold）に従う
- AutoFill 対応：`autocomplete="email"`, `passwordrules` 属性
- `textContentType` 相当（Capacitor では native プラグイン）

**Android 固有**
- Smart Lock for Passwords 連携検討（Credential Manager API）
- Google Sign-In の連続タップ防止

**修正項目**
- L154-174 の `<input>` `font-size: 16px` 維持（OK）
- 既に良くできている画面、Apple Sign-In 追加が最大の課題

### 5.39 オンボーディング — `OnboardingScreen.tsx`

**役割**: 初回起動時のフロー（最大 7 ステップ）

**iOS 固有**
- ページインジケータは UIPageControl 風（小ドット）
- 戻る = ナビゲーションスタックでなくページ戻し

**Android 固有**
- ページインジケータは M3 Tabs / Indicator
- バックボタンで前ページに戻る

**修正項目**
- L556 戻るボタン 36×36 → 44×44
- L412 `fontSize: 15` → 16
- L841, L851 `autoComplete` 既設（OK）
- 各ステップに `aria-label="ステップ X / 7"`

### 5.40 ベータコード — `BetaCodeScreen.tsx`

**役割**: ベータプログラムへの参加コード入力

**修正項目**
- L187 `autoComplete="off"` 維持（OK）
- 入力欄 `font-size: 16px` 確認

### 5.41 フィードバック投稿 — `FeedbackScreen.tsx`

**役割**: ユーザーフィードバック送信

**修正項目**
- `<textarea>` `font-size: 16px` 必須
- 送信成功時 Snackbar 表示

### 5.42 フィードバックダッシュボード — `FeedbackDashboardScreen.tsx`

**役割**: 管理者用閲覧画面

**修正項目**
- safe-area 対応済（L101）
- 緊急度低（管理画面）

### 5.43 問題報告 — `ReportProblemScreen.tsx`

**役割**: レッスン内容の問題報告

**修正項目**
- `<select>` を ActionSheet に
- `<textarea>` `font-size: 16px`

### 5.44 LessonGrid — `LessonGrid.tsx`

**役割**: 親画面に埋め込まれるレッスンタイル

**修正項目**
- グリッドに `role="list"`
- 各タイルを `<button>` に
- 最小高 88px（カード型）

---

## 6. アクセシビリティ要件

### 6.1 スクリーンリーダー（VoiceOver / TalkBack）

| 項目 | 要件 |
|---|---|
| `aria-label` | icon-only ボタン全件必須（51 件 → 100+ 件目標） |
| `<button>` 化 | `<div onClick>` 34 件を排除 |
| `role="dialog" + aria-modal="true" + aria-labelledby` | 全モーダル |
| `role="status"` / `role="alert"` | Snackbar / Toast / エラー |
| `role="tablist" + role="tab" + aria-selected` | TabBar |
| `role="progressbar" + aria-valuenow/min/max` | ProgressBar |
| `role="img" + aria-label` | 装飾的でない SVG |
| Focus order | tab 順序が視覚順序と一致 |
| Live region | 「正解！」「不正解…」表示は `aria-live="polite"`、結果は `aria-live="assertive"` |
| 装飾的要素 | `aria-hidden="true"` で SR から除外 |

### 6.2 Dynamic Type / fontScale

- 全 font-size を **px → rem** に Phase 2 で置換 (現状 275 件)
- `html { font-size: 100% }` 維持で OS 全体倍率を反映
- レイアウト: `min-height: max(44px, 2.75rem)` 等で倍率対応
- Hero テキストは `clamp(28px, 5vw + 1rem, 48px)` で過大化防止
- Settings に「文字サイズ」(Small 87.5% / Default 100% / Large 112.5% / XL 125%) スライダーを Phase 3 で追加
- iOS Dynamic Type は OS Settings → 一般 → アクセシビリティ → 表示とテキストサイズ
- Android fontScale は `WebSettings.setTextZoom()` がデフォルトで反映（Capacitor 6 標準）

### 6.3 コントラスト（WCAG AA / 4.5:1）

§2.1.2 で全 Role を AA 以上に設定済み。CI で自動チェック追加（Phase 3）:
- `pa11y-ci` で Lighthouse Accessibility ≥ 95
- `axe-core` で violations = 0
- カスタム script `npm run check:contrast` で全 token ペアを検証

### 6.4 `prefers-reduced-motion`

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 1ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 1ms !important;
  }
}
```

- 画面遷移 300ms → 1ms
- TabBar 隠し 300ms → 即時切替
- Sheet / Dialog 入出 → opacity のみ
- Confetti / 数値カウントアップ → 完全 disable
- `usePrefersReducedMotion()` hook で JS 側でも参照

### 6.5 フォーカスインジケーター

```css
:focus-visible {
  outline: 2px solid var(--md-sys-color-primary);
  outline-offset: 2px;
  border-radius: inherit;
}
```

`outline: none` の既存箇所は全廃。`tabindex` を持つ全要素に上記を当てる。

### 6.6 最小タップターゲット

- iOS: **44×44pt** 以上 (HIG)
- Android: **48×48dp** 以上 (M3)
- 旧 36×36 戻るボタン（4 箇所）→ Phase 0 で 44/48 に
- 全 button に `min-height: 44px; min-width: 48px` を強制

### 6.7 その他必須

- `<html lang="ja">` 設定、OS 言語に応じて切替
- 画像 `alt=""`（装飾） / alt="実体"（情報）を厳格に
- `<form>` の Submit Enter は `enterKeyHint="go|search|send|done"` 必須
- ハードウェアキーボード操作（外部 Bluetooth キーボード）でも全画面操作可能

---

## 7. ストア審査チェックリスト

### 7.1 iOS App Store
- [ ] **Privacy Manifest** (`PrivacyInfo.xcprivacy`) — 2024/5以降必須
- [ ] **App Tracking Transparency** — 不要（Logic はトラッキングなし）が宣言は必要
- [ ] **Sign in with Apple** — Google ログイン併用なら必須（5.38 参照）
- [ ] **Status Bar / Splash 整合性** — `capacitor.config.ts` の背景色をダークに統一
- [ ] **Safe Area 全画面対応** — ノッチ・Dynamic Island・ホームインジケータ
- [ ] **44pt タップ最小** — 全画面で達成
- [ ] **44pt 戻るボタン** — `Header` コンポーネントで一括対応
- [ ] **Sign in with Apple Button HIG** — 高さ・色・SF Pro
- [ ] **購入の復元** — PricingScreen に必須
- [ ] **解約手順の明記** — 同上
- [ ] **利用規約・プライバシーのアプリ内リンク** — PricingScreen / Settings
- [ ] **クラッシュフリー** — Sentry 監視（既存）
- [ ] **3rd Party SDK Privacy** — Sentry / Supabase / Google Auth の SDK 申告（Stripe は 2026-05 削除済み）
- [ ] **スクリーンショット** — Slate Blue ダーク統一（旧 light テーマが混入していないか確認）

### 7.2 Google Play
- [ ] **Edge-to-Edge (API 35+ 必須)** — `MainActivity` で `WindowCompat.setDecorFitsSystemWindows(window, false)` 確認
- [ ] **Predictive Back Gesture (API 33+)** — `android:enableOnBackInvokedCallback="true"`
- [ ] **POST_NOTIFICATIONS Runtime Permission (API 33+)** — `notifications.ts` にダイアログ実装
- [ ] **Adaptive Icon** — foreground / background レイヤー
- [ ] **Splash API (API 31+)** — Material Splash Screen API
- [ ] **48dp タップ最小**
- [ ] **Data Safety Form** — Play Console 上で更新
- [ ] **Target API Level** — 最新2世代以内
- [ ] **In-App Review API** — レビュー誘導
- [ ] **Material You 推奨だが必須でない** — Slate Blue 固定で OK
- [ ] **アプリ署名・アップロード鍵** — `keystores/` 確認
- [ ] **Play Integrity API** — 不正対策（任意）

---

## 8. 移行ロードマップ

### Phase 0 — リリースブロッカー（Week 1 / 8h）

Android 先行リリース（iOS は後追い）の前提に修正。ストア審査通過のための必須修正のみ。

| # | タスク | 対象ファイル | 工数 |
|---|---|---|---|
| 0-1 | StatusBar 設定修正 (`LIGHT` + `#1A1F2E` + `overlaysWebView: true`) | `capacitor.config.ts` | 0.5h |
| 0-2 | `configureStatusBar()` を起動時呼び出し配線 | `src/main.tsx` (新規 entry hook), `src/platform/statusBar.ts` | 1h |
| 0-3 | `hideSplash()` 呼び出し配線 (`authReady` 時 / 1500ms timeout) | `src/AppV3.tsx`, `src/platform/splash.ts` | 1h |
| 0-4 | Android Edge-to-Edge + Predictive Back 有効化 | `android/app/src/main/AndroidManifest.xml`, `MainActivity.java` | 2h |
| 0-5 | 5 プラグインインストール + sync | `package.json`, `npx cap sync` | 1h |
| 0-6 | `setHtmlPlatformAttr()` を `main.tsx` で呼び出し | `src/main.tsx` | 0.5h |
| 0-7 | input font-size を 14px → 16px (iOS auto-zoom 回避) | `src/PlacementTest.css`, `src/Roleplay.css`, `src/styles/primitives.css` | 1h |
| 0-8 | Stripe 残存コード削除（server billing ルート、PLANS、Pricing 文言、`stripe` dep） | `server/index.ts`, `server/routes/billing.ts`, `src/Pricing.tsx`, `package.json` | 1h |

**Android 課金は既済**: `src/billing/index.ts` で Native Google Play Billing (`InAppBillingPlugin`) 化、`subscription.ts:startCheckout()` も Native 専用（Web 版 2026-05-01 廃止）。Phase 0 では Stripe 残存コード削除のみで課金フロー本体は変更不要。

**iOS 関連の Phase 0 タスクは iOS リリース直前のフェーズへ移動**:
- iOS Privacy Manifest (`ios/App/App/PrivacyInfo.xcprivacy`)
- iOS StoreKit 課金実装（`src/billing/index.ts` を Android/iOS 両対応に拡張）
- Sign in with Apple ボタン
- iOS シミュレータ全画面チェック

### Phase 1 — デザインシステム土台（Week 2-3 / 32h）

| # | タスク | 対象 | 工数 |
|---|---|---|---|
| 1-1 | `src/styles/tokens-m3.css` 新規作成（CSS 変数 全 Role） | `src/styles/tokens-m3.css` | 2h |
| 1-2 | `tokensV3.ts` 拡張（`m3` セクション追加、旧 alias 維持） | `src/styles/tokensV3.ts` | 1h |
| 1-3 | `src/platform/` 一式作成（platform/dialog/haptics/share/keyboard/statusBar/splash/safeArea/motion/backGesture/typeScale） | 上記 | 8h |
| 1-4 | `<Header>` 新規 + 全画面の戻るボタン置換 | `src/components/platform/Header.tsx` + 約 30 画面 | 6h |
| 1-5 | `<ConfirmDialog>` 新規 + `window.confirm/alert` 6 件置換 | `Profile.tsx`, `AIProblemGenScreen.tsx`, `SettingsScreen.tsx`, `AccountSettingsScreen.tsx`, `AIProblemGen.tsx` | 4h |
| 1-6 | `<Snackbar>` + `<SnackbarProvider>` + `useSnackbar()` | `src/components/Snackbar.tsx` | 3h |
| 1-7 | Button / IconButton / Card / Badge / ProgressBar リライト + 旧 API alias | `src/components/{Button,IconButton,Card,Badge,ProgressBar}.tsx` + CSS | 4h |
| 1-8 | TabBar 修正（タップターゲット 44/48、active indicator 分岐、haptic 配線） | `src/components/AppShell.tsx` | 3h |
| 1-9 | Slate Blue M3 化（旧 `#3D5FC4` 87 件 → `var(--md-sys-color-primary)`） | grep 全ファイル | 1h |

### Phase 2 — 全画面 HIG/M3 適合（Week 4-6 / 60h）

| # | タスク | 対象 | 工数 |
|---|---|---|---|
| 2-1 | 44 画面の Header を `<Header>` 化 | 全 `src/screens/*.tsx` | 12h |
| 2-2 | `<div onClick>` 34 件を `<button>` 化 + role/aria | screens 全般 | 6h |
| 2-3 | TextField / Input を `<TextField>` 化（font-size 16px 化含む） | 全フォーム画面 | 8h |
| 2-4 | ハードコード色 704 件を CSS 変数化（codemod） | 全 `.tsx`/`.ts`/`.css` | 12h |
| 2-5 | `<ActionSheet>` + `<Sheet>` 新規 + 既存「メニュー」相当を置換 | 7-8 画面 | 6h |
| 2-6 | `<LoadingIndicator>` 新規 + 既存 spinner 置換 | 全画面 | 3h |
| 2-7 | 全 px → rem 化（font-size のみ、275 箇所） | 全 CSS / 全 inline style | 6h |
| 2-8 | 触覚 (`haptic.*`) を主要操作に挿入（Tab 切替、Submit、削除確認、レッスン正誤） | 主要画面 | 4h |
| 2-9 | 旧 `tokensV3.color.accent` (`#6C8EF5` 直書き) を `m3.primary` 経由に | `tokensV3.ts` + 参照 100+ 箇所 | 3h |

### Phase 3 — 各画面個別最適化（Week 7-9 / 80h）

§5 に記述した 44 画面個別仕様を、画面 1-2 時間 × 44 画面 = 約 80h で実装。

優先順位:
1. **高優先 10 画面**（HomeV3 / RoadmapV3 / Lesson / LessonStories / RoleplayChat / AIGen / Pricing / Settings / Login / ProfileV3）— Week 7
2. **中優先 20 画面** — Week 8
3. **低優先 + 旧画面削除 14 画面**（HomeScreen, RoadmapScreen, StatsScreen, ProfileScreen, PricingV3, ThemeSettingsScreen 等）— Week 9 前半

### Phase 4 — 仕上げ・検証（Week 10 / 24h）

| # | タスク | 工数 |
|---|---|---|
| 4-1 | iOS シミュレータ全画面チェック（iPhone SE / 15 / 15 Pro Max / iPad） | 6h |
| 4-2 | Android エミュレータ全画面チェック（Pixel 4a / Pixel 8 / タブレット） | 6h |
| 4-3 | 実機チェック（iPhone, Pixel, Galaxy） | 4h |
| 4-4 | axe-core / Lighthouse 自動チェック CI 化 | 2h |
| 4-5 | VoiceOver / TalkBack 全画面ナビゲーション | 3h |
| 4-6 | ストア submission 用スクショ撮り直し | 3h |

**合計工数**: 約 **204 時間** ≒ 5.1 人週（1 名 / 約 1.3 ヶ月）。
※ Android 先行 / iOS 後追いリリース前提。iOS StoreKit 化（旧 Phase 0-6, 8h）は iOS リリース直前のフェーズに移動。

---

## 9. 検証手順

### 9.1 自動チェック
- `npm run lint` — ESLint
- `npm run build` — TypeScript 型 + ビルド
- `npx playwright test` — E2E（既存）
- `axe-core` — アクセシビリティ（CI 追加）
- Lighthouse CLI — Performance / Accessibility / Best Practices

### 9.2 iOS シミュレータ
- iPhone SE (3rd gen) 4.7" — 小画面でタップ崩れ確認
- iPhone 15 Pro Max — Dynamic Island / 大画面
- iPad (10th gen) — タブレット崩れ確認
- ダークモード ON / OFF — アプリは固定で揺れないか
- Dynamic Type Largest — フォント拡大時の崩れ
- VoiceOver で全画面をフォーカス順送り
- 設定 > アクセシビリティ > 動きを減らす ON

### 9.3 Android エミュレータ
- Pixel 4a (API 30) — 古めの Android
- Pixel 8 (API 35) — Edge-to-Edge / Predictive Back
- タブレット (API 35) — 大画面崩れ
- Dark / Light テーマ — 固定で揺れないか
- TalkBack で全画面フォーカス順送り
- Bold Text / Large Font

### 9.4 実機チェックリスト
- iPhone 13 / 15 — ホームインジケータ被り、Dynamic Island
- Pixel 7 / Galaxy S23 — ジェスチャナビ、3 ボタンナビ
- Haptics の強度確認
- Splash → 起動の color flash がないか
- StatusBar の文字色が背景と同化していないか
- スワイプバック・OS 戻るボタンが意図通りか

### 9.5 ストア提出前
- App Store Connect: TestFlight 配布で内部 5 名以上が 1 週間使用
- Play Console: Internal Testing → Closed Testing → Production
- スクリーンショット撮り直し（全画面 Slate Blue 統一確認）
- Privacy Manifest / Data Safety Form 更新

---

## 10. 関連ファイル一覧（修正対象）

### 中核
- `src/styles/tokens.css`
- `src/styles/tokensV3.ts`
- `src/styles/primitives.css`
- `src/styles/layout.css`
- `src/styles/extensions.css`
- `src/index.css`

### 共通コンポーネント
- `src/components/AppShell.tsx`
- `src/components/Button.tsx`
- `src/components/IconButton.tsx`
- `src/components/Card.tsx`
- `src/components/Badge.tsx`
- `src/components/ProgressBar.tsx`
- `src/ConfirmDialog.tsx`, `src/ConfirmDialog.css`

### 新規ディレクトリ
- `src/platform/` （新設）
  - `platform.ts`
  - `dialog.ts`
  - `haptic.ts`
  - `share.ts`
  - `actionSheet.ts`
  - `keyboard.ts`
  - `statusBar.ts`
- `src/components/Header.tsx` （新設）
- `src/components/BottomSheet.tsx` （新設）
- `src/components/Snackbar.tsx` （新設）
- `src/components/ActionSheet.tsx` （新設）
- `src/components/LoadingIndicator.tsx` （新設）
- `src/components/Switch.tsx` （新設、Settings の Toggle を昇格）

### 全44画面（§5 参照）

### Capacitor 設定
- `capacitor.config.ts`
- `android/app/src/main/AndroidManifest.xml`
- `android/app/src/main/res/values/styles.xml`
- `ios/App/App/Info.plist`
- `ios/App/App/PrivacyInfo.xcprivacy` （新規）

### `package.json`
追加: `@capacitor/haptics`, `@capacitor/dialog`, `@capacitor/share`, `@capacitor/keyboard`, `@capacitor/action-sheet`

---

---

## 11. 付録

### 11.1 主要 grep / codemod コマンド

```bash
# 旧 brand 色（87件）
grep -rn "#3D5FC4\|#3B5BDB" src/

# 旧 v3 accent（新 primary に置換）
grep -rn "#6C8EF5\|tokensV3\.color\.accent" src/

# window.confirm / alert / prompt
grep -rn "window\.confirm\|window\.alert\|window\.prompt" src/

# div onClick (34件)
grep -rn 'div[^>]*onClick' src/

# 14px 入力（auto-zoom 違反）
grep -rn 'font-size:\s*14\|fontSize:\s*14\b' src/

# ハードコード hex（704 → 0 が目標）
grep -rE '#[0-9A-Fa-f]{6}\b' src/ | wc -l

# popstate 経路
grep -rn 'popstate' src/
```

### 11.2 Web Vitals / Lighthouse 期待値

| Metric | 目標 |
|---|---|
| Performance | ≥ 90 |
| Accessibility | ≥ 95 |
| Best Practices | ≥ 90 |
| LCP | < 2.5s |
| INP | < 200ms |

### 11.3 重要修正対象ファイル (Top 5)

実装時に最も重要な 5 ファイル（絶対パス）:

1. `/home/user/logic/src/styles/tokensV3.ts` — M3 Color Roles を新規追加し、全コンポーネントの色源として再構築する中核
2. `/home/user/logic/capacitor.config.ts` — StatusBar/SplashScreen のリリースブロッカー設定が現状誤値（`#F5F1E8` / `style: 'DARK'`）。Phase 0 で必ず修正
3. `/home/user/logic/src/components/AppShell.tsx` — TabBar のプラットフォーム分岐・タップターゲット・haptic 配線の起点。ここを直さないと全画面に波及
4. `/home/user/logic/src/AppV3.tsx` — popstate / 戻るジェスチャー / Splash hide / `setHtmlPlatformAttr()` の起動配線箇所
5. `/home/user/logic/src/styles/primitives.css` — `.btn` / `.input` / `.card` / `.badge` の M3 化、`var(--md-sys-color-*)` 移行の中心

新規作成すべき重要ファイル:

- `/home/user/logic/src/platform/` 一式（platform/dialog/haptics/share/keyboard/statusBar/splash/backGesture/safeArea/motion/typeScale）
- `/home/user/logic/src/styles/tokens-m3.css`
- `/home/user/logic/src/components/platform/Header.tsx`
- `/home/user/logic/src/components/platform/ConfirmDialog.tsx`
- `/home/user/logic/src/components/Snackbar.tsx`
- `/home/user/logic/ios/App/App/PrivacyInfo.xcprivacy`

---

> **設計書ステータス**: 完成。Phase 0-4 ロードマップ、44 画面個別仕様、デザインシステム、プラットフォーム分岐、共通コンポーネント、アクセシビリティ、ストア審査チェックリスト、検証手順すべて記述済み。実装着手可能。
