# Logic アプリ 要件変更：実装計画 (2026-05-19)

> たたき台 v2。元の `logic-v3.jsx` 前提の v1 を実態と合わせて作り直したもの。
> ブランチ: `claude/update-quiz-feature-yPD3l`
> 関連 memory: `feedback_logic_course_thumbnails` / `project_logic_mobile_only` / `feedback_logic_auth_magiclink_only`

## 背景

現状 `src/AppV3.tsx`（React 19 + Vite 8 + TypeScript 5.9）と `src/screens/*.tsx` 30+ 本に分割された構成をベースに、以下 3 点を加える。

**重要な実態（元たたき台と差分があった点）**：

- アプリは `logic-v3.jsx` 単一ファイルではなく、`src/screens/*.tsx` に画面ごとに分割済み。今回の変更も「コンポーネント単位で分割しない」前提は撤回し、既存方針 (screens 配下に追加・編集) に従う
- ボトムタブは 5 本 = `home / lessons / ranking / journal / profile`。「クイズ」「ロールプレイ」は独立タブではなく、Home などからの導線で開く別画面（`AIProblemGenScreen` / `RoleplaySelectScreen`）
- 本番リリースは Android Play Store。Render Web は backend / Capacitor 用に維持するだけで、Web 単体のマーケはしない方針 (`project_logic_mobile_only`)
- カラー: `#3D5FC4` は `var(--brand)` として `tokens.css` で定義済み。スペーシングは golden ratio ではなく 4px ベース (`--s-1` ～ `--s-8`)
- 「ロジー（マスコット）」は存在しない。元たたき台の記述は誤り

---

## 変更 1：クイズ機能の挙動変更（ワンクッション追加）

### 対象画面

`src/screens/AIProblemGenScreen.tsx`（元たたき台で言う「クイズ機能」）

### 現状

- `tab='create'` で 3 種の生成導線が並ぶ：
  1. 「あなたにあった問題を自動生成」（弱点ベースのワンタップ生成）
  2. 自由テキスト入力 → 生成
  3. **16 種のテーマプリセットボタン**（フェルミ / ロジック / ケース / クリティカル / 仮説 / MECE / イシュー / 論点 / ラテラル / アナロジー / システム / デザイン / 戦略 / 提案 / フレームワーク / データ） → **押下で即 AI 問題生成 → そのまま `AIProblemScreen` へ遷移**
- 「カテゴリ押下 → 即生成」はテーマプリセットボタンの挙動を指す

### 変更後

テーマプリセットボタン押下時にワンクッション挟む。

```
[テーマプリセット] 押下
  → サンプル問題リスト画面（同一画面内のステート切替）
    ├ サンプル問題 5〜8 件（タイトル + 難易度バッジ）
    ├ 「AI におまかせ生成」ボタン（従来の即生成挙動を維持）
    └ 戻るボタン
  → 問題選択
    → 既存 `onPlay(problem)` → `AIProblemScreen` へ
```

その他の導線（「あなたにあった〜」「自由テキスト」「履歴タブ」）は**変更なし**。

### 実装仕様

- `AIProblemGenScreen` 内に新規 state：`selectedTheme: ThemePreset | null`
- `selectedTheme !== null` のときは現在のテーマプリセット一覧の代わりに「テーマ別サンプル問題リスト」を描画
- サンプル問題のデータ構造（同ファイル内にハードコード、後でデータ化想定）：
  ```ts
  type SampleProblem = {
    id: string                    // 'fermi-01' 等
    title: string                 // 「東京のコンビニ件数を推定せよ」
    difficulty: 'beginner' | 'intermediate' | 'advanced'
    seedPrompt: string            // 既存 generateAIProblems に渡すプロンプト
  }
  const SAMPLE_PROBLEMS: Record<string, SampleProblem[]> = {
    fermi: [...],
    logic: [...],
    // 16 テーマ分。1テーマあたり 5〜8 件
  }
  ```
- 難易度バッジ色は既存 `DIFF_COLOR`（RoleplaySelectScreen と同じ：`beginner=#34D399 / intermediate=#D97706 / advanced=var(--md-sys-color-error)`）に揃える
- サンプル問題タップ時の挙動：`handleGenerate(sample.seedPrompt)` を呼ぶ（既存 generate ロジック流用）。これで履歴・rating popup・XP 付与すべて動く
- 「AI におまかせ生成」ボタンは `handleGenerate(themePreset.prompt)`（**従来の即生成挙動を残す**）
- ベータ版表示：ヘッダー（`<Header>` の `trailing` 領域）に「BETA」バッジを追加
  - 既存の `aiGen.unlimited` / `aiGen.upgradeRequired` トレイラーと併存させるか、置き換えるかは要相談。**併存案を推奨**（既存 UX を壊さない）
  - スタイル：`background: color-mix(in srgb, var(--brand) 15%, transparent)`, `color: var(--brand)`, `border-radius: 99px`, `padding: 2px 8px`, `font-size: 11px`, `font-weight: 800`

### i18n

新規キー（ja / en 両方必須）：
- `aiGen.sample.heading` … "サンプル問題から選ぶ" / "Pick a sample problem"
- `aiGen.sample.aiGenerate` … "AI におまかせ生成" / "Let AI generate"
- `aiGen.sample.back` … "戻る" / "Back"
- `aiGen.beta` … "BETA"（共通でいい）

---

## 変更 2：ロールプレイ機能の刷新（キャラ軸に全面リプレース）

### 方向性確定

**Keita 判断 (2026-05-19)**：現状の「シチュエーション軸」（`why-so-report` / `mece-meeting` 等 7 本）は**廃止**し、**キャラ軸の自由会話**に全面リプレース。Live2D 化を見据えた Phase 1（立ち絵 + 表情差分 + 簡易アニメ）として実装する。

### 影響範囲（既存資産の扱い）

- `src/screens/RoleplaySelectScreen.tsx` … **全面書き換え**（シナリオ一覧 → キャラ一覧へ）
- `src/screens/RoleplayChatScreen.tsx` … **書き換え**（システムプロンプトに渡す対象がシチュエーション → キャラ設定に変わる）
- `src/situations.ts` … 不要化、削除候補（要確認）
- `public/images/v3/roleplay-*.png`（7 枚） … 不要化、削除候補
- `src/savedItemsStore.ts` で `type: 'roleplay'` として保存された `refId='why-so-report'` 等のユーザー保存データ … **マイグレーション課題**。既存ユーザーの保存項目が dangling になる
  - 案 A：起動時に旧 ID の保存項目を一括削除
  - 案 B：旧 ID を保持しつつ表示時にフォールバック（「このシナリオは廃止されました」）
  - 推奨：A（プロトタイプ段階かつデータ量小さい想定）
- `server/index.ts` のロールプレイ API … リクエスト bodyの形が変わる可能性。エンドポイント名 (`/api/roleplay/*`) は維持

### キャラクター表示

- 画面**上半分**にキャラ立ち絵を大きく表示
- 表情差分は 3 種（`neutral` / `smile` / `troubled`）。画像は仮の placeholder（`/public/characters/<id>_<expr>.png`）でディレクトリだけ用意。**画像生成は別タスク**（Gemini Nano Banana 案件、`reference_gemini_api` 参照）
- CSS animation でまばたき（4〜6 秒間隔で `opacity` を 100ms 程度 0.3 に落とす）
- メッセージ送信時：立ち絵を `transform: translateY(-4px)` で軽くバウンド（`transition: transform 180ms`）

### キャラデータ構造

新規ファイル `src/roleplayCharacters.ts`：

```ts
export type CharacterExpression = 'neutral' | 'smile' | 'troubled'

export interface Character {
  id: string
  name: { ja: string; en: string }
  role: { ja: string; en: string }
  personality: { ja: string; en: string }
  catchphrase: { ja: string; en: string }
  systemPromptHint: { ja: string; en: string }  // Anthropic API に流し込む追加指示
  images: Record<CharacterExpression, string>   // /characters/<id>_<expr>.png
}

export const CHARACTERS: Character[] = [
  {
    id: 'senior-consultant',
    name: { ja: '田中先輩', en: 'Tanaka-senpai' },
    role: { ja: '入社5年目のシニアコンサル', en: 'Senior consultant, 5th year' },
    personality: { ja: '論理的で厳しいが面倒見が良い', en: 'Logical, demanding, but caring' },
    catchphrase: { ja: 'で、結論は？', en: 'So, what\'s the bottom line?' },
    systemPromptHint: { ja: '...', en: '...' },
    images: {
      neutral: '/characters/senior-consultant_neutral.png',
      smile: '/characters/senior-consultant_smile.png',
      troubled: '/characters/senior-consultant_troubled.png',
    },
  },
  // 計 3 キャラを Phase 1 に含める。残り 2 キャラの案：
  //  - 'kindly-mentor' … 「鈴木部長」温厚な部長、ソフトに論点を引き出す
  //  - 'sharp-client' … 「佐藤クライアント」厳しいクライアント役、突っ込んだ質問
]
```

### 会話 UI

- 画面**下半分**にチャット UI（既存 `RoleplayChatScreen` の吹き出しスタイル流用、LINE 風）
- AI 応答中：キャラ立ち絵の**下**に「考え中...」のドット 3 つアニメーション（既存のローディング UI と統一）
- Anthropic API 呼び出し時、`systemPromptHint` をシステムプロンプトに連結
- ベータ版表示：ヘッダー右に「BETA」バッジ + 画面下部に注釈
  - 注釈文 (ja)：「※キャラクターアニメーションは今後 Live2D に進化予定です」
  - 注釈文 (en)：「* Character animation will evolve to Live2D in a future update.」

### 画像 placeholder の扱い

- `public/characters/` ディレクトリは作成、3 キャラ × 3 表情 = 9 枚の placeholder 画像を配置（透明 PNG or 仮の単色イラスト）
- 本番画像生成は Gemini Nano Banana で別タスク（Logic で実績あり、`feedback_gemini_prompt_tricks`）。今回の PR では placeholder のままでビルドが通ることを優先

### 既存 RoleplaySelectScreen からの遷移先変更

- `AppV3.tsx` の `Screen` union から `roleplay-chat` の `situationId: string` を `characterId: string` に変更
- `RoleplaySelectScreen` の `onStart` シグネチャを `(situationId: string) => void` → `(characterId: string) => void` に変更

---

## 変更 3：ボトムナビアイコンを絵文字化

### 方針確定

**Keita 判断 (2026-05-19)**：CLAUDE.md および memory `feedback_logic_course_thumbnails` の「UI で絵文字不使用」方針は**ボトムナビについて再評価し、絵文字採用に倒す**。memory 更新は本タスクの一部として実施。

### 影響範囲

- `src/components/AppShell.tsx` の `getTabs()` 関数内、`icon: (active) => <svg>...</svg>` の SVG ブロックを絵文字版に置き換え
- 既存の SVG アイコンコンポーネントは**コメントアウトで残す**（ロールバック容易化）
- メモリ更新（agent-config 同期付き）：
  - `feedback_logic_course_thumbnails` … 「コースサムネ・レッスンサムネは手書きフォント+図解で SVG/PNG」の本筋は維持。**ボトムナビは例外として絵文字 OK**を追記
  - CLAUDE.md `Common gotchas` の「**Icons** — use SVG from src/icons/index.tsx, never emoji in UI」のセクション … ボトムナビとジャーナルを例外として明記

### ボトムタブと絵文字マッピング

| Tab id | label key | 絵文字 |
|---|---|---|
| `home` | `nav.home` | 🏠 |
| `lessons` | `nav.training` | 📖 |
| `ranking` | `nav.ranking` | 🏆 |
| `journal` | `nav.journal` | 📓 |
| `profile` | `nav.profile` | 👤 |

> 元たたき台の「クイズ ✏️ / ロールプレイ 💬」は実タブが存在しないので不採用。Ranking と Journal を採用。

### スタイル仕様

- 非選択時：`font-size: 24px`, `filter: grayscale(100%) opacity(0.5)`
- 選択時：`font-size: 28px`, `filter: none`, **加えて色味を `#3D5FC4` 寄せに**したいが、絵文字は色を CSS で変えられない。代替で**選択時のみ背景に `var(--brand-soft)` の丸を敷く**などで強調する案を推奨
- アクセシビリティ：`aria-label={tab.label}` は既存の通り維持（VoiceOver / TalkBack で絵文字単独だと読み上げが不安定なため必須）
- iOS / Android の絵文字レンダリング差異が出るが、Phase 1 では許容

### ロールバック容易化

```tsx
// SVG 版（旧）— ロールバック用に残す
// icon: (active) => <svg ...>...</svg>

// 絵文字版（新）
icon: (active) => (
  <span
    role="img"
    aria-hidden="true"
    style={{
      fontSize: active ? 28 : 24,
      filter: active ? 'none' : 'grayscale(100%) opacity(0.5)',
      transition: 'font-size 120ms',
    }}
  >🏠</span>
),
```

---

## 制約・注意事項

- 既存デザインシステム（`tokens.css` の `--brand: #3D5FC4`、`--s-1`〜`--s-8`、`--radius-sm/md/lg/full`）は維持
- カラーパレットは `var(--brand)` を主軸に維持。ハードコード hex は新規導入しない
- 認証フローは触らない（マジックリンクのみ、`feedback_logic_auth_magiclink_only`）
- Supabase 連携は今回触らない（ロールプレイ AI 呼び出しは backend `/api/roleplay/*` 経由のまま）
- i18n は **ja / en 両方必須**（`src/i18n.ts`）
- アプリ UI 文言は中立的な丁寧体 (`feedback_app_copy_neutral`)。凜トーン NG
- モバイル優先 (`project_logic_mobile_only`)。Capacitor で Android ビルドが通ることを完了条件に含める
- BETA バッジの色は `var(--brand)` 派生（`color-mix(in srgb, var(--brand) 15%, transparent)` 背景 + `var(--brand)` 文字）で統一

## 完了条件

1. **クイズ（変更 1）**：`AIProblemGenScreen` でテーマプリセット押下 → サンプル問題リスト表示 → 選択 or「AI におまかせ生成」のフローが動く。既存の「あなたにあった〜」「自由テキスト」「履歴」は引き続き動く
2. **ロールプレイ（変更 2）**：`RoleplaySelectScreen` がキャラ一覧（3 キャラ）に変わり、キャラ立ち絵 + まばたき + 表情差分 + 会話が動く。既存シチュエーション資産の削除またはマイグレーションが完了
3. **ボトムナビ（変更 3）**：5 タブとも絵文字表示になり、選択時の拡大 + 強調が効いている。SVG 版がコメントアウトで残っている
4. **BETA バッジ**：クイズ画面ヘッダー + ロールプレイ画面ヘッダーに表示
5. **方針メモリ更新**：`feedback_logic_course_thumbnails` と CLAUDE.md の Icons セクションに「ボトムナビ絵文字 OK」例外を追記。agent-config 側にも同期 push
6. **型チェック + lint パス**：`node node_modules/.bin/tsc -b --noEmit` と v3 ファイルの ESLint がエラー 0
7. **Android ビルド通過**：`npm run build && npx cap sync android` がエラーなく完走（main マージで自動 internal track 配信、`project_logic_android_deploy`）
8. **i18n ja/en 完備**：新規キーすべて両方の locale に追加済み

## 段階分けの提案

このスコープを 1 PR で全部やると diff が大きすぎてレビューしづらいので、3 PR に分けたい：

| Phase | Scope | 想定 PR |
|---|---|---|
| Phase 1 | 変更 1（クイズ・ワンクッション） + BETA バッジ + i18n | PR #A |
| Phase 2 | 変更 3（ボトムナビ絵文字化）+ メモリ更新 | PR #B |
| Phase 3 | 変更 2（ロールプレイ全面リプレース）+ 既存資産削除 + placeholder 画像 | PR #C |

Phase 2 が一番ロールバック簡単で副作用少、Phase 3 が一番影響範囲大。**まず Phase 1 から着手して、レビュー通ったら順に進める案**を推奨。
