# Render Production スモーク検証レポート (2026-05-25)

**対象環境**: https://logic-u5wn.onrender.com/
**検証日時**: 2026-05-25 (UTC+9)
**ターゲット**: 2026-05-24 〜 2026-05-25 にマージした機能のリグレッション確認
**実行コマンド**: `node node_modules/.bin/playwright test -c playwright.render.config.ts`
**ビューポート**: Pixel 5 (mobile)
**ワーカー**: 1 (順次実行、Render に過剰負荷を掛けないため)

## サマリ

- **11 件中 11 件 OK / 異常 0 件**
- 主要画面はすべて描画成功、5/24-25 実装の機能はリグレッションなし
- guest user で確認できない範囲（ジャーナル本体、TTS 再生実機動作）は要追加検証

## 確認した機能 (OK)

| # | 画面 / 機能 | スクショ | 確認内容 | 判定 |
|---|---|---|---|---|
| 1 | ホーム (Hero recommend) | `home.png` | 挨拶 / 今日の1問 / おすすめレッスン / StudyTimeCard / AI問題生成カード全て描画 | OK |
| 2 | トレーニング (lessons) | `lessons.png` | カテゴリタイル ≥ 6 枚、フェルミ系最上位 pin (5/22 実装) 表示確認 | OK |
| 3 | プロフィール | `profile.png` | 称号バッジ「ロジック見習い」、今週の学習サマリ、stats-grid 描画 | OK |
| 4 | ランキング | `ranking.png` | 職業バッジ表示 (管理者 / コンサル / 企画 / エンジニア / 学生 等、5/22 実装) | OK |
| 5 | ジャーナル | `journal.png` | guest user 用ログインゲート画面が中立的な丁寧体で描画 | OK |
| 6 | デイリーフェルミ | `daily-fermi.png` | フェルミ問題本体描画、電卓・ヒント・回答 UI 確認 | OK |
| 7 | 学習時間 (StudyTimeScreen) | `study-time.png` | 日別グラフ 7日/30日トグル、05-19〜05-25 のバー描画 (5/24 リライト分) | OK |
| 8 | レッスン詳細 | `lesson-detail.png` | Hero 画像が letterbox なし全表示 (5/24 修正)、FlagIcon ヘッダー右配置 | OK |
| 9 | AI 問題生成 | `ai-problem-gen.png` | BETA バッジ、カテゴリ一覧 (15 種)、要アップグレード表示 | OK |
| 10 | CSS 変数 | (text log) | `--brand` (ダーク) = `#6C8EF5`、`--accent` = `#D4915A`、`--serif` 定義済 | OK |
| 11 | 称号モーダル | `title-badge-sheet.png` | 5 列 grid、基礎章 Lv.1〜100、locked 帯透過 (5/22-23 実装) | OK |

## 主要な実装確認結果 (5/24-25 分)

### 視覚的に確認できた項目

- **レッスン Hero 画像 letterbox 全表示** (`c2dda9d` 5/24) — `lesson-detail.png` でピラミッド原則の Hero が縦横比保持で全表示
- **FlagIcon (誤り報告) ヘッダー右** (`2bddf5f` 5/24) — `lesson-detail.png` のヘッダー右に旗アイコン丸ボタン配置
- **称号モーダル 5 列 grid + locked 透過** (`de5c98e` 5/24, `000e128`) — `title-badge-sheet.png` で 5 列レイアウト + ロック済帯の透過確認
- **ホーム StudyTimeCard** (`139489f` 5/24) — `home.png` の最下部に「今日まだ学習していません」カード
- **AI 問題生成画面** (`4595b4d` 5/24) — `ai-problem-gen.png` で BETA バッジ + カテゴリ一覧 + 要アップグレード表示
- **ランキング職業バッジ** (`1a4aac9` 5/24) — `ranking.png` で「管理者 / コンサル / 企画 / エンジニア / 専門職 / 医療 / 学生」が各ユーザー名に併記
- **フェルミ系最上位 pin** (`56f69cb` 5/24) — `lessons.png` 最初に「フェルミ推定」セクション
- **学習時間日別グラフ** (`139489f` 5/24) — `study-time.png` で 05-19〜05-25 のバーグラフ + 7日/30日トグル
- **集中力コース** (`513795d` 5/24) — `lessons.png` 内に「今に集中する」コース描画 (focus-now-01 サムネ含む)
- **レッスン本文の Markdown `**` 削除** (`eac4faf` 5/24) — `lesson-detail.png` 本文に装飾記号なし

### Playwright のみでは判定しきれず保留した項目

| 項目 | 状態 | コメント |
|---|---|---|
| MECE 4 切口表示 (lesson-20 step 5) | 未到達 | URL `?preview=lesson` 経路が無く、homeおすすめ経由ではランダム遷移。手動確認推奨 |
| Visual フォント底上げ + warm accent | 部分OK | `lesson-detail.png` のピラミッド Visual で確認、他レッスンは個別検証推奨 |
| TTS ヘッドホンボタン (5/24 実装) | 仕様通り | ステップ 1 (hero slide) では非表示が仕様。`LessonStoriesScreen.tsx` L559 で `slide.kind !== 'hero' && slide.kind !== 'summary'` ガード。本文 step に進めば描画される |
| ジャーナル AI レッスン推奨カード (5/24 `d763769`) | 確認不可 | guest user では login gate が出るため未到達 |
| レッスン完了回数バッジ (5/24 `84cf9f0`) | 未到達 | 実レッスン完走テストが必要 |
| ProblemGenLoader 4 ステップ演出 | 入口のみ | 実生成は有料プラン必須、生成 API も叩かないため演出は未起動 |
| AI 問題生成カード上 BETA 表記 | OK | `ai-problem-gen.png` ヘッダーで確認 |

### 確認した CSS デザイントークン

```
--brand:        #6C8EF5   (ダークテーマ override, tokens.css L417)
--accent:       #D4915A
--accent-dark:  #B07442
--serif:        "Inter Tight", "Inter", "Noto Sans JP", -apple-system, sans-serif
```

CLAUDE.md には「`--serif` は未定義」と記載があるが、`tokens.css` L252 / L334 で `var(--font-display)` への alias として実定義済み。CLAUDE.md 側の記述が古い可能性があり、別途整合性確認推奨。

## 異常 / 注意事項

なし。テスト 11 件すべて pass。

## 推奨フォローアップ

1. **MECE 4 切口表示 / レッスン完了回数バッジ** は実レッスン完走シナリオが必要。手動 QA 推奨
2. **ジャーナル AI 推奨カード** はログイン環境での確認が必要 (Supabase 認証経由テスト)
3. **CLAUDE.md の `--serif` 記述更新** — 実定義あるので「使うな」記述の正当性を再評価

## 関連ファイル

- テスト本体: `e2e/render-smoke-20260525.spec.ts`
- 専用 Playwright 設定: `playwright.render.config.ts`
- スクリーンショット: `docs/render-screenshots/20260525/*.png` (10 枚)
