# Logic アプリ 要件変更：実装計画 v4 (2026-05-19)

> たたき台 v1 → v2（実態合わせ） → v3（変更3撤回） → **v4（キャラ哲学者化）**
> ブランチ: `claude/update-quiz-feature-yPD3l` / Draft PR #206
> 関連 memory: `feedback_logic_course_thumbnails` / `project_logic_mobile_only` / `feedback_logic_auth_magiclink_only` / `reference_gemini_api` / `feedback_gemini_prompt_tricks`

## 背景

現状 `src/AppV3.tsx`（React 19 + Vite 8 + TypeScript 5.9）と `src/screens/*.tsx` 30+ 本に分割された構成をベースに、以下 2 点を加える。

**重要な実態（元たたき台と差分があった点）**：

- アプリは `logic-v3.jsx` 単一ファイルではなく、`src/screens/*.tsx` に画面ごとに分割済み。今回の変更も「コンポーネント単位で分割しない」前提は撤回し、既存方針 (screens 配下に追加・編集) に従う
- ボトムタブは 5 本 = `home / lessons / ranking / journal / profile`。「クイズ」「ロールプレイ」は独立タブではなく、Home などからの導線で開く別画面（`AIProblemGenScreen` / `RoleplaySelectScreen`）
- 本番リリースは Android Play Store。Render Web は backend / Capacitor 用に維持するだけで、Web 単体のマーケはしない方針 (`project_logic_mobile_only`)
- カラー: `#3D5FC4` は `var(--brand)` として `tokens.css` で定義済み。スペーシングは golden ratio ではなく 4px ベース (`--s-1` ～ `--s-8`)
- 「ロジー（マスコット）」は存在しない。元たたき台の記述は誤り

**Keita 判断 (2026-05-19)**：

- ボトムナビ絵文字化は**やらない**（SVG 方針維持、`feedback_logic_course_thumbnails` の例外追記不要）
- ロールプレイのキャラは**哲学者**（外国人ベース、日本名は不採用）
- キャラ画像生成は**Gemini Nano Banana**で別タスク化

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

### BETA バッジ

- ヘッダー（`<Header>` の `trailing` 領域）に「BETA」バッジを追加
- 既存の `aiGen.unlimited` / `aiGen.upgradeRequired` トレイラーと**併存案を推奨**（既存 UX を壊さない）
- スタイル：
  - `background: color-mix(in srgb, var(--brand) 15%, transparent)`
  - `color: var(--brand)`
  - `border-radius: 99px`
  - `padding: 2px 8px`
  - `font-size: 11px`
  - `font-weight: 800`

### i18n

新規キー（ja / en 両方必須）：
- `aiGen.sample.heading` … "サンプル問題から選ぶ" / "Pick a sample problem"
- `aiGen.sample.aiGenerate` … "AI におまかせ生成" / "Let AI generate"
- `aiGen.sample.back` … "戻る" / "Back"
- `aiGen.beta` … "BETA"（共通でいい）

---

## 変更 2：ロールプレイ機能の刷新（哲学者キャラ軸に全面リプレース）

### 方向性確定

現状の「シチュエーション軸」（`why-so-report` / `mece-meeting` 等 7 本）は**廃止**し、**哲学者キャラ軸の自由会話**に全面リプレース。Live2D 化を見据えた Phase 1（立ち絵 + 表情差分 + 簡易アニメ）として実装。

### キャラクター 3 体（哲学者）

| id | 名前 | 役柄 | catchphrase | systemPromptHint 方向性 |
|---|---|---|---|---|
| `socrates` | Socrates / ソクラテス | 古代ギリシャの哲学者、対話の元祖 | 「で、それはどういう意味だ？」 | 産婆術。質問で前提を引き出し矛盾を炙り出す。ユーザーのビジネス課題に対し「定義の明確化」「前提の疑問視」を駆使 |
| `descartes` | Descartes / デカルト | 近代哲学の父、方法的懐疑 | 「本当にそうか？まず疑ってみよう」 | 方法的懐疑。明晰判明な根拠を求める。曖昧な主張に「それは本当に確かか？」と問い返す |
| `nietzsche` | Nietzsche / ニーチェ | 価値の転倒を説いた 19 世紀の哲学者 | 「その『正解』、誰が決めた？」 | 既存価値観の批判。「常識」を疑わせ、力への意志に基づく独自の判断を促す |

既存 `src/situations.ts` の philosophy 群（`socrates-dialog` / `descartes-doubt` / `nietzsche-values`）に既に存在する人物描写・i18n 翻訳テキストを `systemPromptHint` の素材として再利用する。

### 影響範囲（既存資産の扱い）

- `src/screens/RoleplaySelectScreen.tsx` … **全面書き換え**（シナリオ一覧 → 哲学者キャラ一覧）
- `src/screens/RoleplayChatScreen.tsx` … **書き換え**（システムプロンプトに渡す対象がシチュエーション → キャラ設定に変わる）
- `src/situations.ts` … **削除**（philosophy 翻訳テキストは `roleplayCharacters.ts` に移植してから削除）
- `public/images/v3/roleplay-*.png`（7 枚） … **削除**
- `src/savedItemsStore.ts` で `type: 'roleplay'` として保存された `refId='why-so-report'` 等のユーザー保存データ … **マイグレーション課題**。既存ユーザーの保存項目が dangling になる
  - **案 A**：起動時に旧 ID の保存項目を一括削除 ← **推奨**
  - 案 B：旧 ID を保持しつつ表示時にフォールバック（「このシナリオは廃止されました」）
- `server/index.ts` のロールプレイ API … リクエスト bodyの形が変わる可能性。エンドポイント名 (`/api/roleplay/*`) は維持

### キャラクター表示

- 画面**上半分**にキャラ立ち絵を大きく表示
- 表情差分は 3 種（`neutral` / `smile` / `troubled`）
- CSS animation でまばたき（4〜6 秒間隔で `opacity` を 100ms 程度 0.3 に落とす）
- メッセージ送信時：立ち絵を `transform: translateY(-4px)` で軽くバウンド（`transition: transform 180ms`）

### キャラデータ構造

新規ファイル `src/roleplayCharacters.ts`：

```ts
export type CharacterExpression = 'neutral' | 'smile' | 'troubled'

export interface Character {
  id: 'socrates' | 'descartes' | 'nietzsche'
  name: { ja: string; en: string }
  role: { ja: string; en: string }
  era: { ja: string; en: string }
  catchphrase: { ja: string; en: string }
  systemPromptHint: { ja: string; en: string }
  images: Record<CharacterExpression, string>
}

export const CHARACTERS: Character[] = [
  {
    id: 'socrates',
    name: { ja: 'ソクラテス', en: 'Socrates' },
    role: { ja: '対話の哲学者', en: 'The philosopher of dialogue' },
    era: { ja: '紀元前 5 世紀・古代ギリシャ', en: '5th century BC, Ancient Greece' },
    catchphrase: { ja: 'で、それはどういう意味だ？', en: "And what do you mean by that?" },
    systemPromptHint: {
      ja: 'あなたはソクラテス。産婆術で相手のビジネス課題の前提を質問で引き出し、矛盾を炙り出す。直接答えを与えず、相手に考えさせる。',
      en: "You are Socrates. Use Socratic dialogue to draw out the user's business assumptions, expose contradictions, never give direct answers.",
    },
    images: {
      neutral: '/characters/socrates_neutral.png',
      smile: '/characters/socrates_smile.png',
      troubled: '/characters/socrates_troubled.png',
    },
  },
  // descartes / nietzsche も同じ構造で
]
```

### 会話 UI

- 画面**下半分**にチャット UI（既存 `RoleplayChatScreen` の吹き出しスタイル流用、LINE 風）
- AI 応答中：キャラ立ち絵の**下**に「考え中...」のドット 3 つアニメーション（既存のローディング UI と統一）
- Anthropic API 呼び出し時、`systemPromptHint` をシステムプロンプトに連結

### BETA バッジ

- ヘッダー右に「BETA」バッジ（変更 1 と同スタイル）
- 画面下部に小さく注釈
  - 注釈文 (ja)：「※キャラクターアニメーションは今後 Live2D に進化予定です」
  - 注釈文 (en)：「* Character animation will evolve to Live2D in a future update.」

### キャラ画像生成（Gemini Nano Banana）

- モデル: `gemini-2.5-flash-image`（Nano Banana、$0.039/枚 × 9 = 約 ¥55）
- スタイル方向: 肖像画タッチ + Caveat フォント風手書きトーン（`feedback_logic_course_thumbnails` の世界観踏襲）
- スペル崩し対策（`feedback_gemini_prompt_tricks`）：
  - 名前は確実な綴り `SOCRATES` / `DESCARTES` / `NIETZSCHE` のみ
  - 長文プロンプトは NG、5 語以下の英語に統一
  - `spell` フィールドにキャラ名と表情キーワードを列挙
- 9 枚（3 キャラ × neutral/smile/troubled）を 1 セッションで生成、各画像が概念的に正しいかチェック必須（Gemini は ≠ や否定を勝手にポジ化することあり）
- 新規スクリプト：
  - `scripts/generate-character-art.ts` — 一括生成
  - `scripts/characterPrompts.ts` — プロンプト定義
- API キーは既存 `.env` の `GEMINI_API_KEY`（`reference_gemini_api`）
- 生成完了までは `/public/characters/_placeholder.png` で繋ぐ（透明 PNG or グレー単色）

### 既存 RoleplaySelectScreen からの遷移先変更

- `AppV3.tsx` の `Screen` union から `roleplay-chat` の `situationId: string` を `characterId: string` に変更
- `RoleplaySelectScreen` の `onStart` シグネチャを `(situationId: string) => void` → `(characterId: string) => void` に変更

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
- **ボトムナビは現状の SVG を維持**（変更 3 は撤回）

## 完了条件

1. **クイズ（変更 1）**：`AIProblemGenScreen` でテーマプリセット押下 → サンプル問題リスト表示 → 選択 or「AI におまかせ生成」のフローが動く。既存の「あなたにあった〜」「自由テキスト」「履歴」は引き続き動く
2. **ロールプレイ（変更 2）**：`RoleplaySelectScreen` が哲学者 3 体（Socrates / Descartes / Nietzsche）の一覧になり、キャラ立ち絵 + まばたき + 表情差分 + 会話が動く。既存シチュエーション資産の削除またはマイグレーションが完了
3. **BETA バッジ**：クイズ画面ヘッダー + ロールプレイ画面ヘッダーに表示
4. **キャラ画像**：Gemini Nano Banana で 9 枚生成、`public/characters/` に配置（生成は Phase 2 の並行タスク、placeholder でビルド通過 OK）
5. **型チェック + lint パス**：`node node_modules/.bin/tsc -b --noEmit` と v3 ファイルの ESLint がエラー 0
6. **Android ビルド通過**：`npm run build && npx cap sync android` がエラーなく完走（main マージで自動 internal track 配信、`project_logic_android_deploy`）
7. **i18n ja/en 完備**：新規キーすべて両方の locale に追加済み

## 段階分けの提案（2 PR 構成）

| Phase | Scope | 想定 PR |
|---|---|---|
| Phase 1 | 変更 1（クイズ・ワンクッション） + BETA バッジ + i18n | PR #A |
| Phase 2 | 変更 2（ロールプレイ哲学者リプレース）+ Gemini 画像生成 + 既存資産削除 | PR #B |

Phase 1 は副作用が小さく完結性高い、Phase 2 は影響範囲大かつ画像生成タスクと並行。**まず Phase 1 から着手して、レビュー通ったら Phase 2 に進む案**を推奨。
