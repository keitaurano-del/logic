# 実装計画 — Keita-sanフィードバック対応 (2026-04-27)

## 背景
Keita-sanからのフィードバック6項目への対応 + Apolloの判断で「ユーザー獲得・継続率」観点を追加。
「アポロのプロダクトだからね、好きなようにやって」と任されているので、CEOとしての優先順位で実行する。

## CEO判断: Why これを今やるか
Logicが「論理思考といえばLogic」になるためには:
1. **離脱要因を潰す** (ログインできない・通知不足) ← P0
2. **継続インセンティブを強化** (偏差値・ランキング復活) ← P0
3. **ファーストインプレッション改善** (カード差別化) ← P1
4. **ユーザー理解を深める** (オンボ質問) ← P1 (将来の分析・パーソナライズ基盤)

---

## 実装スコープ

### P0 — 今日中に着手・SITデプロイ目標

#### SCRUM-148: 認証バグ修正 (Google/メールログイン)
- **症状**: AccountSettingsScreen の "Googleでログイン" "メールアドレスでログイン" がどちらも同じ `onOpenLogin` を呼ぶだけ。LoginScreenには Googleボタンしか実装されておらず、メールログインのUIが存在しない。
- **対応**:
  - LoginScreen にメールアドレス + パスワードのフォームを追加（Supabase Email Auth: `signInWithPassword` / `signUp`）
  - パスワードリセットリンク追加（`resetPasswordForEmail`、SMTPは後でOK、リンクだけ用意）
  - Googleログイン (`loginWithGoogle`) が Web で動作するか、`isSupabaseConfigured()` が false 時のエラー表示が分かりやすいか確認
  - AccountSettingsScreen の2ボタンを統一（または LoginScreen 内でタブ切替）
- **受け入れ基準**:
  - SIT で Email/Password 新規登録 → ログイン → ログアウト の往復が成功
  - Google ログイン: Web では Supabase OAuth リダイレクトで動く / Capacitor は既知の制約として「ネイティブビルドでは未対応」と表示

#### SCRUM-149: 偏差値・ランキング機能の復活（記録画面）
- **症状**: 過去 (2026-04-19 commit `950f8c7`) で「Top X%」を「偏差値」に置き換えた。HomeScreen には残ってるが、独立した「記録」画面が無く、ランキング表示も薄い。
- **対応**:
  - `RecordScreen.tsx` を新設（または既存 RankingScreen をベースに統合）
  - 表示要素:
    - 自分の偏差値（大きく表示・推移グラフ）
    - 全ユーザー中の順位（X位 / Y人中、上位X%）
    - 直近7日のXP/正答率の折れ線グラフ
    - 完了レッスン数・連続学習日数・総XP の3カードグリッド（プロフィールから移動）
  - HomeScreen 最下部の「レベル」セクションは削除（SCRUM-150）して、その動線を「記録を見る」CTA に置き換え
  - ボトムナビに「記録」タブを追加 or 既存タブに統合（要モックアップ判断）
- **受け入れ基準**:
  - SIT で `/record` または記録タブから偏差値・順位・グラフが見える
  - Supabase の placement テーブルに deviation 値が保存されているユーザーで正常表示

#### SCRUM-150: ホーム最下部「レベル」セクション削除
- **対応**: HomeScreen.tsx の Level セクション（〜L660あたり）を削除。`type: 'rank'` 遷移を撤去。
- **代替**: 同位置に「記録を見る →」のシンプルなCTAボタンを置く
- **受け入れ基準**: SIT のホームをスクロール最下部まで見て、レベル表示が無い

---

### P1 — 続けて対応・1〜2日内

#### SCRUM-151: ホームカード画像の差別化
- **症状**: 「今日の1問」「コース一覧」「ロールプレイ」など各カードが同じビジュアル（or イラスト不在）で目に入らない。
- **対応**:
  - 既存 `public/images/v3/` に `course-*.webp` 系列があるが、ホームのトップカード用は不足
  - 必要画像（gskで生成・PNG→WebP変換）:
    - `home-daily-question.webp`（電球＋朝日のメタファー）
    - `home-daily-fermi.webp`（フェルミ推定 = 地球＋計算尺）
    - `home-flashcards.webp`（カード反転モチーフ）
    - `home-roleplay.webp`（対話バブル）
    - `home-streak.webp`（炎 + カレンダー）
    - `home-record.webp`（グラフ + 矢印）
  - HomeScreen の各カードに固有画像を背景 or 右側アイコンとして配置
  - スタイル統一: Duolingo/Headspace 風モダンフラット、ブルー基調 (`#3B5BDB`)、半透過オーバーレイ
- **参考**: Keita-san共有の動画（mp4 28MB）で見られる「Awarefy系」UIの差別化感
- **受け入れ基準**: ホーム画面をスクロールして、各カードがひと目で違う機能と分かる

#### SCRUM-152: 通知機能の項目復活
- **症状**: 過去にあった通知項目が減っている。
- **対応**:
  - NotificationSettingsScreen.tsx の項目を再点検
  - 必要項目（推定）:
    - [既存] 学習リマインダー（時刻指定）
    - [既存] 連続学習通知
    - [復活/新設] 新レッスン公開通知
    - [復活/新設] ランキング更新通知（週次）
    - [復活/新設] 偏差値変動通知
    - [復活/新設] フレンド/ソーシャル通知（将来）
    - [新設] AI添削完了通知
  - Capacitor Local Notifications との連携確認
  - Supabase の `notification_preferences` テーブル拡張
- **受け入れ基準**: 通知設定画面で6項目以上のトグルが見える、各設定が永続化される

#### SCRUM-153: オンボーディング属性質問追加
- **対応**:
  - OnboardingScreen.tsx に新ステップ追加（既存のフロー後半に挿入）
  - 質問項目:
    1. **年齢レンジ**: 〜18 / 19-24 / 25-34 / 35-44 / 45-54 / 55+
    2. **職業**: ビジネスパーソン / 学生 / 経営者・起業家 / コンサルタント / エンジニア / 教育関係 / その他
    3. **目的（複数選択可）**: 仕事の意思決定力UP / 面接・選考対策 / 試験対策（公務員・MBA等） / コンサル転職 / 趣味・自己研鑽 / 子供への教育
    4. **論理思考の自己評価**: 5段階（弱い〜強い） ← プレースメントテストの代替フォールバック
  - Supabase `profiles` テーブルにカラム追加:
    ```sql
    ALTER TABLE profiles ADD COLUMN age_range TEXT;
    ALTER TABLE profiles ADD COLUMN occupation TEXT;
    ALTER TABLE profiles ADD COLUMN purposes TEXT[]; -- 配列
    ALTER TABLE profiles ADD COLUMN self_assessment SMALLINT;
    ALTER TABLE profiles ADD COLUMN onboarded_at TIMESTAMPTZ;
    ```
  - 新規ユーザーは必須、既存ユーザーは「あとで」スキップ可（後日アンケート的に再通知）
- **受け入れ基準**:
  - SIT で新規登録 → 4ステップの質問画面通過 → Supabase に書き込み確認
  - データはダッシュボード分析用に集計可能な形で保存

---

## 実装順序（Claude Code への指示）

1. **Phase A (今日)**: SCRUM-150 (削除) → SCRUM-148 (ログイン) → SCRUM-149 (偏差値復活) の順
2. **Phase B (明日)**: SCRUM-153 (オンボ拡張) + Supabase migration
3. **Phase C**: SCRUM-151 (画像生成) + SCRUM-152 (通知)

各 Phase 完了ごとに:
- developブランチへ push → SIT 自動デプロイ
- Slackへデプロイ通知 (`D0ATBB2S4AX`)
- Keita-san に進捗報告（Apollo 経由）

---

## 守るべきルール（再確認）
- 本番マージは Keita-san の明示的承認後のみ
- 各実装で型エラーゼロ・lint通過
- 既存テストがあれば壊さない
- コミットは Conventional Commits + 日本語要約
- 重要な仕様変更は MEMORY.md / memory/2026-04-27.md に追記

---

## バックログ追加 (2026-04-27 22:46 JST) — Keita-sanフィードバック

### BL-01: レッスン解説スライドのナビゲーション改善
**要望**: クイズ解説が出た後、「次へ」ボタンを表示 or タップで次へ進む
- 右半分タップ → 次スライドへ
- 左半分タップ → 前スライドへ戻る
- 現状: 解説が短時間で自動消えてしまう？ → 確認必要
**対象ファイル**: `src/screens/LessonStoriesScreen.tsx`
**Priority**: P1

### BL-02: クイズ正解選択肢のシャッフル
**要望**: 正解が2番目 (B or 2) に偏りすぎている → ランダムにシャッフル
**対象ファイル**: `src/lessonSlides.ts` の `convertLessonToSlides()` でクイズ選択肢をシャッフル
**Priority**: P1

### BL-03: レッスン完了後「次のレッスンへ」ボタンの動線
**要望**: コース終了 → 次のレッスンへ進む、を押したら実際に次のレッスンに遷移する（現状: ホームに戻るだけ）
**対象ファイル**: `src/screens/LessonStoriesScreen.tsx` の完了画面、`src/AppV3.tsx` の遷移ロジック
**Priority**: P1

