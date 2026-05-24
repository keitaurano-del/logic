# Logic 直近大型変更 独立レビュー (2026-05-24)

レビュー対象範囲: 直近の TTS 大型拡張 / Device Sync Phase 1〜3 / ジャーナル AI 推薦 / Visual props 機構 / バッジ 34 種生成 + Lv 100→500 拡張 / 通知バグ修正 / Visual 中低 36 件 + ADHD コース改善 / Visual A 案 Phase 3 など、約 30 commit (9aa9b89 以降〜HEAD `3a1271c`)。

レビュー方針: 動作の安全性 / 既存アーキテクチャ整合性 / UX を上位優先で評価し、好み判定や微小最適化は低位に置いた。装飾記号・凛口調混入は機械的に grep して 0 件確認済み。

---

## サマリ

| 区分 | 件数 | コメント |
|------|------|---------|
| 致命 (リリースブロッカー) | 0 | 該当なし |
| 高 (リリース前修正推奨) | 4 | データ整合性 1 / セキュリティ 1 / 状態管理 2 |
| 中 (時間あれば改善) | 8 | 副作用クリーンアップ・bundle・dangerouslySetInnerHTML 等 |
| 低 (任意改善) | 6 | コード重複・JSDoc・色マッピング |

総合所感: TTS 拡張 (488 行追加の LessonStoriesScreen) と Device Sync Phase 1〜3 はいずれも段階公開・OFF デフォルト・Promise.allSettled・サーバー側 token 検証など防御設計が効いており、致命的なリリースブロッカーは検出されなかった。型チェック / Lint v3 / build / migration ファイル整合性も問題なし。高ランクは将来の本番展開でユーザーが踏みやすい順に挙げた。dev-logic 並走中ファイル (TitleBadgeSheet / fermi) には触れていない。

---

## 1. コード品質

### 1.1 高 (リリース前修正推奨)

なし。型安全性は許容範囲、命名規則も一貫。

### 1.2 中

- `src/flashcardData.ts:166,186,205,225` で `db as any` キャスト 5 箇所。eslint-disable コメントで意図的だが、`SupabaseClient` 型を import すれば剥がせる箇所もある。次フェーズで `db.ts` に型付き wrapper を作る案を `docs/DEVICE_SYNC_DESIGN.md` に補記しておくのが理想。同様に `src/progressStore.ts:244,269` `src/roadmapStore.ts:354` も同パターン。
- `src/screens/LessonStoriesScreen.tsx` が 1427 行。TTS モード関連 useEffect が 5 ヶ所 (133-167, 385-420, 423-426) に散在しており、custom hook (`useTtsLessonReader`) で外出しする余地あり。
- `src/ttsService.ts:135-160` `VOICE_GENDER_HINTS` の `'hattori'` が female / male 両方に入っており、コメントで「`some` の最後勝ちで male が勝つ」と説明しているが、実装では female ブランチで `if (male.some)` 再判定する読みづらいフォールバックになっている。male/female の優先順位を hint テーブルに一本化して、`some` ロジックは一回だけ呼ぶ方がデバッグしやすい。

### 1.3 低

- `src/screens/homeHelpers.ts:241-267` `LEVEL_COLORS` 配列は要素 25 個ある (Lv 1-20 から Lv 481-499 まで)。Lv 481-500 は 1 個分しか定義していないので `Math.floor((level - 1) / 20)` の戻り値 24 がそのまま使われ、Lv 500 だけ `LEVEL_MAX_COLOR` に切替わる。コメント記述で「Lv 461-499」「Lv 481-499」と帯境界がズレている (実際は 481-500 が同じ色帯、500 のみ純白)。コメントを修正するか境界を直す程度。
- `src/visuals/index.ts:102` `Record<string, ComponentType<any>>` の `any` は JSDoc で説明済みなので妥当。
- `src/ttsService.ts` 全体 (453 行) は 1 ファイルで Web / Capacitor / 設定永続化 / 列挙 / pause-resume の 5 関心事を抱えている。将来 PiP やバックグラウンド再生を追加するなら分割を検討。

---

## 2. アーキテクチャ整合性

### 2.1 高

- (高#1) `src/syncService.ts:412-433` `syncOnLogout` の KEEP_KEYS に **通知設定キー (`logic-reminder` / `logic-notif-extra` / `logic-journal-reminder`) が無い**。一方で `cancelAllReminders()` も呼ばれないため、ログアウトすると次のような不整合が出る:
  - OS 側に scheduled の通知は残り続ける
  - クライアント側 pref は消えるので、NotificationSettingsScreen は OFF 表示
  - 次回ログインしても自動再 schedule されない (`rescheduleAllReminders()` は bootstrap 時のみ)
  
  結果: 「通知が来るのに UI 上は OFF」というユーザー視点での不整合が発生する。修正案 2 択 — (a) KEEP_KEYS に 3 つの通知 pref キーを追加して保持、(b) syncOnLogout 内で `cancelAllReminders()` を await してから pref を消す。`feedback_journal_emoji` 等の方針から見て (a) が自然。

### 2.2 中

- `src/screens/LessonStoriesScreen.tsx:152-167` `sessionStorage.getItem('logic-tts-mode-continue')` でレッスン間 TTS モード継続を制御している。しかし `LessonCompleteScreen.tsx:316` で「ホームに戻る」を押した場合のみ remove しており、`onNext()` で次レッスンに進むパス (自動遷移含む) では「logic-tts-mode-continue が消費されたら removeItem」を信頼している。`autoAdvance` フローでユーザーが 2.2 秒以内に何も操作しないと自動 onNext が走り、`LessonStoriesScreen` 側 useEffect で `removeItem` する。ここで `clearTimeout` が確実に走ることは確認済 (line 89-95)。ただし、現在のレッスンが「同コース内に次レッスンが無い最終レッスン」だった場合、`logic-tts-mode-continue=1` のフラグが session 限り保持されてしまい、ユーザーが別コースの別レッスンを開くと予期せず TTS モードで起動する可能性がある。`stopTtsMode` / `handleStartQuiz` 内で removeItem を入れる方が安全。
- `src/featureFlags.ts:79-109` `refreshDeviceSyncFlag` は sessionStorage に 1 回しか fetch しない設計。Phase 3 で rolloutPct を 25→50→100 に上げたとき、既ログインユーザーは次のセッション再起動まで反映されない。Capacitor アプリのモバイルセッション長 (端末再起動するまでバックグラウンド維持) を考えると、ログアウト〜ログイン or アプリ kill 後の再起動が必要。設計書 (`docs/DEVICE_SYNC_DESIGN.md`) に「rollout 反映は次セッションから」と明記しておくと運用上の事故を防げる。

### 2.3 低

- `src/syncService.ts:262-396` `syncOnLogin` の責務が肥大化 (135 行)。Phase 1 / Phase 3 telemetry / heavy-user warn が同関数内に混ざっている。中期的に `syncCoreOnLogin` / `syncDeviceDataOnLogin` / `sendLoginTelemetry` の 3 関数に分けるとテストしやすい。

---

## 3. 潜在バグ

### 3.1 高

- (高#2) `src/flashcardData.ts:34,59,71,78,85,103,136` で SRS の `nextReview` を `new Date().toISOString().slice(0, 10)` で算出している。`src/stats.ts:40` のコメント で「`toISOString().slice(0, 10)` を使うと UTC 基準で日付がズレる」「`localDateStr()` を使う」とプロジェクト方針が明記されているにも関わらず、SRS 側はこの方針が反映されていない。実害例: JST 00:00-08:59 にカードを review すると、UTC ベースでは前日扱い → `nextReview = today` が **JST の前日になり** 翌朝 9 時まで due として再表示されない、もしくは逆にすぐ due に戻る。getDueCards / getCardStats も同じ問題で、深夜の due 集計が 1 日ズレる。修正は `import { localDateStr } from './stats'` して全 7 箇所を差し替える単純な作業。

### 3.2 中

- `src/screens/LessonStoriesScreen.tsx:343-377` `handleChangeRate` / `handleChangeVoice` の dep に `ttsPlaying` が含まれていない (`ttsModeActive && ttsPlaying && !ttsPaused`)。`ttsPlaying` 状態は `tts.subscribe(setTtsPlaying)` で更新されるが、useCallback の dep に入ってないため stale closure を踏む可能性がある。React は `ttsPlaying` が変わるたび callback を再生成しないので、状態判定が古い値で行われる。一発で再生中の rate 変更が反映されないケースを生む程度の影響度。dep array に追加するか、`tts.isPlaying()` を直接呼ぶ方がよい。
- `src/featureFlags.ts:79-109` `refreshDeviceSyncFlag` は `userId` を URL クエリパラメータに渡すだけで認証なし。`server/routes/feature-flags.ts` 側でも認証なしの意図的設計 (line 18 コメント参照)。ただし、これは「他人の userId を投げてその enabled 判定を盗み見できる」ことを意味する。enabled 状態は機密ではないが、ユーザー uuid が外部から推測可能なら「特定ユーザーの sync 有効化状況」が漏れる。実害は小さいが、Phase 3 完了後はサーバー側でも `auth.uid()` 検証を入れる方が筋がよい。
- `src/screens/LessonStoriesScreen.tsx:1008` `<p dangerouslySetInnerHTML={{ __html: slide.body }}>` — レッスンデータは静的だが、AI 生成 lesson（generated_problems 系）が将来同じ kind を使う場合 XSS リスクが顕在化する。当面 OK だが、`sanitize-html` ないし DOMPurify を通すコメントを TODO で残しておくとよい。

### 3.3 低

- `src/screens/LessonStoriesScreen.tsx:152-167` `try { sessionStorage.getItem... } catch {}` の catch ブロックがある一方で、167 行で `setLessonId` 系の deps が `lessonId` のみで sessionStorage 操作には影響しない。`sessionStorage disabled` 環境では何もしない設計と読めるが、コメントで明示してあるので OK。

---

## 4. パフォーマンス

### 4.1 中

- `dist/assets/AppV3-CpglVeDb.js` が 461 kB (gzip 107 kB)。前回 visualProps 機構導入 + TTS で +30 kB 程度の肥大化が想定される。Vite build の chunk-size warning が出ている。`LessonStoriesScreen` (TTS ロジック) を `React.lazy` 化する余地あり。
- `src/screens/LessonStoriesScreen.tsx:186-191` `readableIndices` を毎レンダー `useMemo` で計算しているが、`slides` 依存だけで十分。問題なし。

### 4.2 低

- `src/ttsService.ts:178-247` `voiceCache` は global module-level だがロケール切替時 reload するため (`i18n.ts:setLocale` で reload) 実害なし。明記しておくと良い。

---

## 5. セキュリティ

### 5.1 高

- (高#3) `server/routes/sync-telemetry.ts:79-103` で Supabase access token を Authorization header から `supabase.auth.getUser(token)` で検証している。これは正しい設計。ただし migration 028 のテレメトリ insert は **クライアント側で直接 supabase.from('sync_telemetry').insert** することもポリシー上可能 (RLS で `auth.uid() = user_id` のみ insert 許可)。`syncService.ts:80-108` `sendSyncTelemetry` は API 経由のみ呼んでいるが、別実装パスがあると検証ロジックを 2 重メンテになる。意図的に「API 経由のみ」にしたいならドキュメントに明記するか、テーブルにサーバーのみ insert できる検証 token 列を入れる方がよい。

### 5.2 中

- `server/routes/feature-flags.ts:62` `userId` は length チェック (1-256) のみで内容検証なし。SHA-256 ハッシュなので任意文字列で動くが、ログ・将来分析で混ざるとノイズになる。`isUuid(userId)` 検証 or guest-id プレフィックス検証を入れるとよい。

### 5.3 低

- `server/routes/journal.ts:97-105` `sanitizeAssistantName` でプロンプトインジェクション対策済み。OK。

---

## 6. UX / アクセシビリティ

### 6.1 高

- (高#4) `src/screens/LessonStoriesScreen.tsx:548-567` 「誤りを報告」ボタン (32px × 32px) が **44×44 推奨を下回る**。HIG / Material タッチターゲット推奨 44×44 を下回ると Apple App Store の指摘対象になりやすい。同じヘッダー内の TTS ヘッドホンボタン (line 534) も 32×32。隣の保存・×ボタンは 44×44 になっているので比較しても小さい。タップ範囲だけ padding で広げるか、サイズを 44×44 に統一する。

### 6.2 中

- `src/components/TtsControlPanel.tsx:189-217` 速度ボタンが `minWidth: 52, height: 36` で 44×44 を下回る。横スクロール許可されているのでデスクトップ閲覧では問題ないが、モバイルでは隣のボタンを誤タップしやすい。
- ESLint warning 13 件 (うち 9 件 `jsx-a11y/click-events-have-key-events`、3 件 `jsx-a11y/no-static-element-interactions`)。`TitleBadgeSheet.tsx:96,109` `LevelUpModal.tsx:95,114` `RankUpModal.tsx:138,157` `ConfirmSheet.tsx:44,51` で、モーダル外周クリックでの閉じる挙動にキーボードリスナーが付いていない。Escape キー対応を 1 行追加するだけで warning が消える。
- `src/components/TtsControlPanel.tsx:249-255` ボイス選択メニューを開いたとき、`position: fixed; inset: 0; background: transparent` のフルスクリーン invisible button (line 250-255) を表示してメニュー外タップで閉じる仕組み。これ自体は OK だが `aria-label={t('common.close')}` のボタンがフォーカスに乗ると、SR ユーザーが「閉じる」を 2 回連続で見ることになる。`aria-hidden=true` を追加するか、`role='presentation'` で誤魔化す方がよい。

### 6.3 低

- `src/screens/LessonCompleteScreen.tsx:211` の `<div style={{ fontSize: 30, lineHeight: 1, marginBottom: 6 }}></div>` が **空 div**。学習時間ブロックのアイコン枠としてマージン目的なら明示コメントを残すか、`<div aria-hidden />` の方が掃除されない。

---

## 7. テストカバレッジ

### 7.1 中

- TTS 拡張・device sync・featureFlags・sync-telemetry に対する Playwright / Vitest テストが追加されていない。少なくとも:
  - `e2e/flows/lesson-tts-mode.spec.ts` (TTS モード開始 → クイズスキップ → 「クイズを解く」遷移)
  - `e2e/backend/feature-flags.spec.ts` (rolloutPct=0 / =100 / forced=true の各分岐)
  - `e2e/backend/sync-telemetry.spec.ts` (auth header 欠落で 401 / userId mismatch で 403)
  
  以上 3 系列はサーバーが新規 endpoint なので単体テスト想定。

### 7.2 低

- `journal.ts` の `buildLessonCatalogText` / `parseRecommendedLessons` は pure function で unit test が書きやすい。テストないなら追加する余地あり。

---

## 8. i18n / 文言

### 8.1 確認結果 (機械的 grep)

- ja / en キー総数一致: `ja:1548 / en:1548`、差分ゼロ。`feedback_app_copy_neutral` の遵守 OK。
- 装飾記号 `**...**` が **i18n 文字列内に 0 件**。 `feedback_no_markdown_emphasis` 遵守 OK。
- 凛口調 (「〜わ」「〜のよ」「〜かしら」「〜のじゃ」) も `src/i18n.ts` 内に確認できず。OK。
- 文体: `tts.completeDesc='理解度をクイズで確認してみましょう'` `tts.nextLessonHint='次のレッスンへ進みます'` 等、丁寧体「〜です/〜ます」で統一されている。

### 8.2 中

- `src/i18n.ts:1750` ja `tts.completeDesc='理解度をクイズで確認してみましょう'` と en `tts.completeDesc='Let's check your understanding with a quiz'` (line 3450 周辺) はトーン揃ってる。en の「Let's check」は中立丁寧体で問題ない。
- `server/routes/journal.ts:285` 「コンサル1年目固定の前提を撤廃」と書いてあり、コメントとプロンプトの実装が整合。en 側 phase 判定ロジック (line 309-314) も同等。

### 8.3 低

- `tts.skipNextLesson='ホームに戻る'` の i18n key 名と表示文字列がやや乖離 (skipNextLesson と読めるが実は「ホームに戻る」)。重大ではないが将来別文脈で再利用したい場合に混乱する。

---

## 9. ドキュメント

### 9.1 中

- `docs/DEVICE_SYNC_DESIGN.md` は Phase 1 設計書として詳細 (376 行)。Phase 3 段階公開分の補記が欲しい — 「rolloutPct 変更は次セッション反映」「force user id override の使い分け」など。
- `docs/VISUAL_DESIGN_GUIDE.md` は Phase 3 完了済リストが追記されている (commit `d78f339`)。OK。
- `docs/BADGE_NEW_TIERS.md` に「dev-logic 引き継ぎ TODO: BADGE_FALLBACK_MAP 廃止」が記載されており、commit `9ace30a` で実施済み。整合性 OK。
- TTS 拡張に対する設計メモが見当たらない。`docs/TTS_DESIGN.md` ないし `CLAUDE.md` の「Common gotchas」に「Web は pause/resume が API レベルで実装、native (Capacitor) は pause が stop と同義で resume は再 speak 必要」のメモを追記しておくと、次の人が引っかからない。

### 9.2 低

- `src/featureFlags.ts` `src/syncService.ts` 共に JSDoc は手厚い。
- `server/routes/feature-flags.ts` `server/routes/sync-telemetry.ts` 共に JSDoc は十分。

---

## 検証結果サマリ

| 項目 | 結果 |
|------|------|
| `tsc -b --noEmit` | EXIT 0 (エラーなし) |
| `eslint src/AppV3.tsx src/screens/ src/components/ src/hooks/ src/icons/` | 0 errors / 13 warnings (既存 pre-existing が多い) |
| `npm run build` | 成功 (4.80s)。chunk size warning 出るが既存通り |
| migration ファイル整合性 | 022〜028 順序正常、RLS 適用済、本番反映済の commit メッセージ確認 |
| i18n ja/en キー一致 | 1548 / 1548 完全一致 |
| 装飾記号 `**` 残存 | 0 件 |
| 凛口調混入 | 0 件 |

---

## 高ランク 4 件まとめ (リリース前修正推奨)

1. **(動作・状態管理)** `src/syncService.ts:412-433` syncOnLogout で通知 pref キーを保持しない → OS スケジュールと UI 表示の不整合。修正案: KEEP_KEYS に `logic-reminder` / `logic-notif-extra` / `logic-journal-reminder` を追加。
2. **(データ整合性)** `src/flashcardData.ts` 全 7 箇所で `toISOString().slice(0, 10)` を使用 → JST 0-9 時で SRS due 判定が 1 日ズレる。修正案: `localDateStr()` (stats.ts) に差し替え。
3. **(セキュリティ運用)** `sync_telemetry` テーブルへの insert ルートが「API 経由」と「クライアント直接 RLS」の 2 重存在。意図と運用を docs に明記、または検証 token 列を追加。
4. **(UX / a11y)** `LessonStoriesScreen` のヘッダー TTS / 誤り報告ボタンが 32×32 で 44×44 推奨を下回る。修正案: padding 拡張 or サイズ統一。

---

## 全体所感

- TTS 大型拡張と Device Sync Phase 1〜3 はいずれも防御設計が効いており、致命的なリリースブロッカーは検出されなかった。
- Device Sync は OFF デフォルト + hash ベース段階公開 + Promise.allSettled の組合せで、運用時の事故リスクは抑えられている。telemetry も RLS + auth token 二重検証で堅い。
- TTS は Web / Capacitor 両対応の wrapper としてうまく整理されており、UX 上もヘッドホンアイコン → 自動進行 → クイズ遷移の動線が論理的に組まれている。
- 一方で SRS の JST 日付バグ (高#2) は既存コードに長く眠っていた可能性が高く、TTS / Device Sync の commit と直接関係はないが今回のレビューで発見できた価値あり。
- 通知設定が syncOnLogout で消える件 (高#1) は別端末同期と一見無関係に見えるが、Phase 2-3 で device sync を本格展開するとログアウト→ログインフローが増えるため、今のうちに直す方が筋がよい。
- バッジ 34 種生成 + Lv 100→500 拡張は schema 変更を伴わず getBadgeImagePath をワンライナー化しただけなので、後方互換性問題なし。
- Visual props 機構 (ee5e2b3) と中低 36 件改善 (8988b40 / 5048186) は registry 設計が `Record<string, ComponentType<any>>` で型互換問題を吸収していて、各 Visual の Props 型は内部で default 値に依存する形なので妥当。

---

## 次回 PR 推奨事項 (TODO)

- 高ランク 4 件を別 PR で対応 (1 PR 1 テーマ推奨)
- Phase 3 段階公開を 25% に上げる前に、Render env に `DEVICE_SYNC_ROLLOUT_PCT=5` で内部観測 1 週間
- `e2e/flows/lesson-tts-mode.spec.ts` 等の追加テスト
- `docs/DEVICE_SYNC_DESIGN.md` に Phase 3 補記を追加
- `LessonStoriesScreen.tsx` の TTS ロジックを custom hook に分離 (リファクタ、機能変更なし)

