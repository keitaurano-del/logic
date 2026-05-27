# TASK_TRACKER — Logic

task-manager エージェントが管理するタスク台帳の正本。
ステータス: TODO / IN_PROGRESS / BLOCKED / REVIEW / DONE / CANCELLED
更新は必ずこのファイルに反映する。

---

## バッチ: 2026-05-27 修正依頼（Keita）

| ID | タイトル | 優先度 | ステータス | 担当 |
|----|----------|--------|-----------|------|
| T1 | 音声の多重再生を止める | P1 | DONE（実機QA推奨） | dev-logic |
| T2 | 称号の透過（拡張帯34枚 背景透過後処理） | P2 | DONE | designer |
| T3 | ジャーナルのハッシュタグ自動集約・正規化 | P2 | DONE | dev-logic |
| T4 | AIアシスタント応答の `**` 混入を直す | P1 | DONE | dev-logic |
| T5 | おすすめレッスンの表示・遷移＋AI会話履歴の保存/再表示 | P1 | DONE | dev-logic |
| T6 | レッスン本文 bullet（・）のずれ・青色を直す | P1 | DONE | dev-logic |
| T7 | コース一覧カテゴリの展開／閉じる（未実装の疑い） | P1 | DONE | dev-logic |

---

### T1 — 音声の多重再生を止める　[P1 / TODO]

- 詳細: 効果音・TTS が複数同時に流れることがある。再生開始前に前の音声を完全停止する排他制御がない。
- 関連ファイル: `src/ttsService.ts`（speak / stop / pause / resume, ~427-488）。Web Speech API・Capacitor native・Cloud TTS の3チャネルを持つが、speak() 内で stopCloud/stopWeb/stopNative を先行呼び出ししていない。
- DoD: 新しい再生要求時に前再生（全チャネル）が必ず停止し、同時発話が起きない。連打しても1音声のみ。
- サブタスク:
  - [ ] speak() 冒頭で全チャネルを stop する排他制御を入れる
  - [ ] 効果音（new Audio 系があれば）も同様に単一化
  - [ ] iOS / Android 実機（native TTS）と Web 両方で多重再生しないか確認
  - [ ] 回帰: 連続レッスン読み上げ・画面遷移時の停止が壊れていないか
- 抜けもれ提言: 両OS確認必須（native と web で経路が違う）。テスト: 自動化困難なら手動確認手順を残す。

### T2 — 称号の透過（拡張帯34枚 透過PNG再生成）　[P2 / BLOCKED：要承認・designer]

- 原因確定（dev-logic 2026-05-27）: 称号バッジは `public/images/v3/badges/badge-<key>.png` を objectFit:contain で表示（CSSで背景は被せていない）。基礎帯16種（Lv1-100）は RGBA でアルファ付き＝正しく透過。拡張帯34種（Lv101-500）は RGB でアルファなし＝白い四角背景が焼き込まれている。CSS では解決不可。
- 対象34枚: apex-2/apex-3/apex-4、wisdom-1〜4、virtuoso-1〜4、enlightened-1〜4、luminary-1〜4、sovereign-1〜4、transcend-1〜4、divine-1〜4、eternal-1〜2、zenith。`TitleBadgeSheet`・`RankUpModal` 両方で症状。
- 要件: これら34枚を基礎帯と同じく背景透過（RGBA・1024×1024）で再生成 or 差し替え。生成元 Gemini 想定（commit 06dacd0 経緯）。
- 自動白抜き不採用: apex-2等の光彩でフリンジ残り、zenith（白×金）は本体が背景白と溶けて消える。機械処理は本体誤消去リスクで不可。
- 担当: designer。
- サンプル結果（designer 2026-05-27）: 再生成不要と判明。基礎帯は生成後 rembg(isnet-general-use) で背景除去済み、拡張帯34枚はその後処理が未適用だっただけ。既存画像に後処理（ダーク本体=rembg／白本体 zenith等=flood-fill）を当てるだけで透過可。Gemini 課金0・画風完全保持。サンプル2枚（apex-2 rembg／zenith flood-fill）で透過・本体保持を数値確認済み（zenith 内部穴 0%）。
- 残: 32枚を `public/images/v3/badges/` に上書き展開する承認待ち（本番ファイル上書きのため）。
- DoD: 対象の称号要素が背景透過で正しく表示される（指定の要素で）。
- サブタスク:
  - [ ] 対象要素の特定（Keita 確認後）
  - [ ] PNG アルファ欠落なら画像差し替え（→ designer 連携の可能性）／CSS background 起因ならスタイル修正
  - [ ] ライト/ダークテーマ両方で破綻しないか
- 抜けもれ提言: 画像アセット差し替えが必要なら designer にアサイン。テーマ両対応の確認を忘れない。

### T3 — ジャーナルのハッシュタグ自動集約・正規化　[P2 / TODO]

- 詳細: ジャーナルのハッシュタグ（#tag）を自動で集約・修正してほしい。現状、抽出・集約・正規化（大小文字・全半角ゆれ）が確認できない。
- 関連ファイル候補: `src/components/journal/`（journalDb.ts ほか）。hashtag 抽出ロジックの所在を実装前に確定する必要あり。
- 確定要件（Keita 2026-05-27）: UI追加は不要。過去のハッシュタグも全部含めて、正規化・名寄せ（大小文字・全半角ゆれの統一、表記ゆれを最適なタグへ寄せる）を随時行い、最適なタグ集合に作り変える。一覧画面やフィルタUIは作らない。
- DoD: 既存・新規ハッシュタグが正規化・名寄せされ、表記ゆれの重複が解消される。過去データにも遡及適用される。
- サブタスク:
  - [ ] 現状のハッシュタグ実装の有無・所在を確定
  - [ ] 正規化ルール定義（大小文字・全半角・前後空白・類似タグ名寄せ）
  - [ ] 保存/読み込み時に随時正規化を適用
  - [ ] 過去データへの遡及適用（マイグレーション的処理）
- 抜けもれ提言: UI不要のため i18n 影響なし。過去データ書き換えは非可逆なので、名寄せルールが意図せぬ統合をしないか慎重に。

### T4 — AIアシスタント応答の `**` 混入を直す　[P1 / TODO]

- 詳細: ジャーナルのAIアシスタント応答に markdown の `**`（太字記号）が生で混じって表示される。
- 関連ファイル: `src/components/journal/JournalAssistantSheet.tsx`（~154, 238, 248-256）、`journal.css` の `.journal-summary-card__body`（white-space: pre-wrap でプレーン表示）。`RichLessonText.tsx` のリッチテキストパーサーが未適用。
- DoD: AI応答内の `**bold**` 等が崩れず（太字描画 or 記号除去）に表示される。生の `**` が出ない。
- サブタスク:
  - [ ] 方針決定: 軽量 markdown レンダリング適用 or プロンプト側で記号抑制 or 表示前サニタイズ
  - [ ] アシスタント応答の表示経路に適用
  - [ ] 他のAI応答表示箇所（フィードバック等）にも同種混入がないか横展開確認
- 抜けもれ提言: 表示整形とプロンプト抑制の二択。レンダリング採用時は既存 plain 前提CSSとの整合を確認。

### T5 — おすすめレッスンの表示・遷移＋AI会話履歴の保存/再表示　[P1 / TODO]

- 詳細: AIアシスタントの「おすすめレッスン」が lesson id しか出ず、タップしても遷移しない。加えて、一度出たAIメッセージを後から見直せるようにしたい（履歴）。
- 関連ファイル: `src/components/journal/JournalAssistantSheet.tsx`（~156-165 recommendedLesson, 248-256 カード/onClick）。`onOpenLesson(lesson.id)` は呼ばれているが親からの prop 伝達／id→画面遷移解決が未完。ナビは `AppV3.tsx` の Screen union。
- DoD:
  - おすすめレッスンがタイトル＋カテゴリで表示され、タップで該当レッスンに遷移する
  - 過去のAIアシスタントメッセージが保存され、後から再表示できる
- サブタスク:
  - [ ] おすすめレッスンを id だけでなく title/category 解決して表示
  - [ ] onOpenLesson を親まで配線し、レッスン画面遷移を実装
  - [ ] AI会話履歴の永続化（localStorage `logic-*` or Supabase。保存先を設計）
  - [ ] 履歴再表示UIの追加
  - [ ] i18n（履歴UI文言 ja/en）
  - [ ] テスト（遷移の E2E ハッピーパス）
- 抜けもれ提言: 履歴は新規機能。保存先（local か Supabase notebooks 系か）の設計判断が要る。表示だけでなく persist が必須。

### T6 — レッスン本文 bullet（・）のずれ・青色を直す　[P1 / TODO]

- 詳細: レッスン本文の箇条書き bullet（・）が青色でずれて表示される。青ではなく普通の「・」でよい。
- 関連ファイル: `src/components/RichLessonText.tsx`（~218-258, bullets ケース）。`<ul listStyle:none + flex>`、各 li の bullet span が 6px 円・`background: var(--brand)`（青）・`translateY(0.5em)` で位置調整。
- DoD: bullet が通常の中黒「・」相当で、テキストと縦位置が揃って表示される。青の丸ドットをやめる。
- サブタスク:
  - [ ] bullet span（青丸）を通常の「・」記号 or 中立色マーカーに変更
  - [ ] 縦位置ずれ（translateY 調整）の解消
  - [ ] 全レッスン本文・ネストリストで崩れないか回帰確認
- 抜けもれ提言: RichLessonText は全レッスン本文共通 → 波及大。複数レッスンで目視確認。

### T7 — コース一覧カテゴリの展開／閉じる　[P1 / TODO（機能未実装の疑い）]

- 詳細: コース一覧でカテゴリ別の展開／折りたたみが動かない。「タスクが抜けている」＝機能自体が未実装の可能性。
- 関連ファイル: `src/screens/RoadmapScreenV3.tsx`（~346-532 COURSE_GROUPS.map、1003 CategoryDetailView）。searchQuery/levelFilters 等の state はあるがカテゴリ展開用 state（expandedCategories 等）と toggle ハンドラが見当たらない。
- 確定要件（Keita 2026-05-27）: 初期は全カテゴリ展開状態。各カテゴリ見出しタップで個別に閉じる／再展開できる（複数開閉可、単一アコーディオンではない）。
- DoD: 初期表示で全カテゴリ展開。見出しタップで該当カテゴリが閉じ、再タップで開く。複数同時に開閉可。状態が破綻しない。
- サブタスク:
  - [ ] 展開状態 state（expandedCategories、初期=全展開）と toggle ハンドラを実装
  - [ ] カテゴリ見出しUI（開閉アイコン＝SVG・aria-expanded）
  - [ ] 既存のフィルタ／検索との整合
- 抜けもれ提言: 未実装なら設計から。開閉アイコンは SVG（icons/index.tsx）使用、emoji 不可。

---

## 抜けもれ提言サマリ

- 要件確認済み（2026-05-27）: T2（プロフィール高レベル称号の透過）/ T3（UIなし・正規化名寄せのみ・過去分遡及）/ T7（初期全展開・複数開閉可）。全件着手可能。
- 新規永続化が要るもの: T5（AI会話履歴の保存先設計）。
- 全体波及で回帰注意: T6（全レッスン本文共通の RichLessonText）/ T4（AI応答表示の横展開）。
- 非可逆処理に注意: T3（過去ハッシュタグの名寄せ書き換えは元に戻せない）。
- 両OS確認必須: T1（native/web の音声経路差）。
- 横断: 新規UI文言は i18n ja/en 両方（T5・T7）。UI chrome の emoji 不可・SVG のみ（T7 開閉アイコン）。デプロイ前 `eslint .`（全体）+ `tsc -b --noEmit`。

## 進捗ログ

- バッチ1 完了（DONE）: T1・T4・T6。tsc exit 0 / eslint 実ソース 0 errors。T1 のみ実機QA推奨。push 未（Keita 承認待ち）。
  - 変更: src/ttsService.ts（T1 排他制御 stopAllChannels）／ src/components/RichLessonText.tsx（T6 中黒・化）／ JournalRichText.tsx（新規・T4）・JournalAssistantSheet.tsx・JournalDetailSheet.tsx・journal.css（T4 軽量markdown整形）
- バッチ2 完了: T7 DONE（COURSE_GROUPS 開閉トグル、collapsedGroups Set、初期全展開・複数開閉、Chevronアイコン・aria付）／T3 DONE（journalDb に normalizeTagDisplay/tagMatchKey/normalizeTags、保存時正規化＋読出名寄せ、誤統合なし、随時適用）。tsc 0 / eslint 実ソース 0。変更: RoadmapScreenV3.tsx・i18n.ts（T7）／journalDb.ts・TagInput.tsx・JournalDetailSheet.tsx（T3）。
  - T3 補足: 過去データの物理一括バックフィルは未実施（随時適用方式）。全行物理正規化が要るなら別途DBマイグレ（承認案件）。
- T2 は dev-logic 調査で「コードでなく画像アセットの問題」と判明 → designer に転送（下記 T2 セクション参照）。
- T2 完了（designer 2026-05-27）: 拡張帯34枚を背景透過後処理で上書き（rembg 30 + flood-fill 4）。Gemini課金0・画風保持。全34枚 RGBA・四隅透過・本体保持を検証。元画像は /tmp/badgework/repo_backup/ に退避。zenith のみ閾値220で個別対応。push 未。
- T5 完了（dev-logic 2026-05-27）: tsc 0 / eslint 実ソース 0。おすすめレッスンの title/category 表示＋タップ遷移、AI会話履歴の保存/再表示。journalDb 拡張・履歴UI(JournalScreen)・types.ts・icons・i18n。migration `032_journal_assistant_conversations.sql` は作成のみで Supabase 未適用（適用は承認案件、これがないとAI履歴機能は動かない）。
- → logic 7件すべて DONE（T1〜T7）。push＋migration 適用は Keita 承認待ち。

## 次アクション

1. バッチ2（T7・T2・T3）完了待ち → DoD 検証
2. バッチ3: T5（おすすめレッスン遷移＋AI履歴。履歴の保存先はジャーナル既存方式に合わせる）
3. 全ローカル実装完了後、tsc/eslint 再確認 → Keita に push 承認を依頼
4. 注意: `eslint .` で `.claude/worktrees/agent-*`（別エージェント残骸）由来の 2 errors。実ソースは 0。CI は worktree 非checkout で緑見込みだが、worktree 残骸の掃除は別途検討

最終更新: 2026-05-27
