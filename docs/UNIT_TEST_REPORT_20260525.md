# Unit Test 拡張レポート (2026-05-25)

## 概要

Logic アプリのフロントエンド主要ロジックに対して vitest ベースの unit test を新設。
既存テストは Playwright (E2E) のみで unit 層がゼロだったため、`src/__tests__/` 配下に
7 ファイル / 100 テストを追加した。

## 追加・変更

### 新規依存 (devDependencies)

- `vitest@^2.1.9`
- `@vitest/coverage-v8@^2.1.9`
- `@testing-library/react@^16.3.2`
- `@testing-library/jest-dom@^6.9.1`
- `jsdom@^25.0.1`

### 新規ファイル

| ファイル | 概要 |
|---|---|
| `vitest.config.ts` | jsdom 環境 / `src/**/*.{test,spec}.{ts,tsx}` を拾う / e2e は exclude |
| `src/__tests__/setup.ts` | `@testing-library/jest-dom` 読み込み + localStorage/fetch 共通リセット |
| `src/__tests__/stats.test.ts` | 18 tests |
| `src/__tests__/completionCountDb.test.ts` | 10 tests |
| `src/__tests__/homeHelpers.test.ts` | 18 tests |
| `src/__tests__/featureFlags.test.ts` | 11 tests |
| `src/__tests__/lessonNames.test.ts` | 12 tests |
| `src/__tests__/lessonSlides.test.ts` | 22 tests |
| `src/__tests__/CompletionBadge.test.tsx` | 9 tests |

### package.json への scripts 追加

```json
"test": "vitest run",
"test:watch": "vitest",
"test:coverage": "vitest run --coverage"
```

## 結果

```
Test Files  7 passed (7)
     Tests  100 passed (100)
  Duration  ~12s (warm) / ~46s (with coverage)
```

## カバレッジ (対象ファイルのみ)

| ファイル | Stmts | Branch | Funcs | Lines |
|---|---:|---:|---:|---:|
| `src/featureFlags.ts` | 91.46% | 63.88% | 100% | 91.46% |
| `src/lessonSlides.ts` | 90.00% | 63.63% | 100% | 90.00% |
| `src/stats.ts` | 61.62% | 73.33% | 48.38% | 61.62% |
| `src/components/CompletionBadge.tsx` | 100% | 100% | 100% | 100% |
| `src/db/completionCountDb.ts` | 42.99% | 91.66% | 75% | 42.99% |
| `src/screens/homeHelpers.ts` | 76.22% | 88.23% | 40% | 76.22% |
| `src/screens/lessonNames.ts` | 84.15% | 88.00% | 100% | 84.15% |
| 合計 | 77.17% | 72.27% | 61.42% | 77.17% |

### 未カバー領域 (意図的)

- `stats.ts` の XP 関連 / Journal XP / displayName 同期 — 別 PR で追加可能。今回は localDateStr / streak / studyDaily / recordCompletion / addStudyTime に焦点
- `completionCountDb.ts` の `syncCompletionCounts` / `pushCompletionCountsToDB` — Supabase クライアントを実体で呼ぶ統合テストになるため除外
- `homeHelpers.ts` の `RANK_TIERS` 関連 helper と greeting — 表示文言中心で純粋関数の検証が薄いため見送り
- `lessonSlides.ts` の `case` / `think` / `example` 分岐 — 主要パス (explain / quiz / visual / outro) は押さえている

## テスト戦略のポイント

1. **依存切り離し**: `stats.ts` は `syncService` を巻き込むので `vi.mock('../syncService', ...)` で stub。`lessonNames.ts` は `lessonData` (大量) を最小固定マップでモック
2. **時刻の固定**: streak / 日別ログのテストは `vi.setSystemTime(new Date(YYYY, M, D))` でローカル時刻基準を完全制御
3. **localStorage / sessionStorage**: jsdom が標準で持つので `beforeEach` で `clear()` するだけで十分
4. **fetch モック**: `vi.stubGlobal('fetch', vi.fn(...))` で `Response` を直接返す方式。`refreshDeviceSyncFlag` は 5 ケース (success / fail / throw / empty userId / cache hit) を網羅
5. **コンポーネントテスト**: `@testing-library/react` で `screen.getByLabelText` ベース。count=0/1/2/3/9/10/42 の境界を全部叩く

## 失敗テスト

なし。

## 今後の拡張余地

- `progressStore.ts` / `roadmapStore.ts` (localStorage バックの状態管理) は同じパターンで足せる
- `useStudyTimer` カスタムフックは `@testing-library/react-hooks` か `renderHook` で時計モック必須
- 主要 screen コンポーネント (`HomeScreenV3.tsx` 等) のレンダリングテストは Capacitor / Supabase mock が大量に必要で初期コスト高
- カバレッジ 80% 超を狙うなら `stats.ts` の XP / Journal XP 系を追加するのがコスパ最高

## 実行コマンド

```bash
# 全テスト
npm run test

# watch モード (開発時)
npm run test:watch

# カバレッジ込み
npm run test:coverage
```
