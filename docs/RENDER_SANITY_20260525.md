# Render Production サニティテスト レポート (2026-05-25)

**対象環境**: https://logic-u5wn.onrender.com/
**検証日時**: 2026-05-25 (UTC+9)
**目的**: リリース可否判断用の軽量サニティチェック (主要 8 ユースケースの happy path)
**実行コマンド**: `node node_modules/.bin/playwright test -c playwright.sanity.config.ts`
**ビューポート**: Pixel 5 (mobile, 360x800 相当)
**ワーカー**: 1 (順次実行、Render に過剰負荷を掛けないため)
**所要時間**: 約 1 分 6 秒 (目標 5 分以内をクリア)

## サマリ

- **8 件中 OK 8 / 異常 0**
- 主要画面はすべて描画成功
- 認証なし guest mode で確認できる範囲は問題なし
- リリース可否: GO 判定相当

## 確認したユースケース

| # | ユースケース | スクリーンショット | 確認した要素 | 判定 |
|---|---|---|---|---|
| 1 | ホーム表示 | `1-home.png` | Hero recommend ボタン / StudyTimeCard / AI 問題生成カード / Daily Fermi カード が全て描画 | OK |
| 2 | レッスン詳細 | `2-lesson-detail.png` | カテゴリタイル → レッスンタップで遷移、進行ボタン (次へ / 始める 等) が 1 つ以上存在 | OK |
| 3 | プロフィール | `3-profile.png` | 表示名 / レベル表示 (Lv.) / stats-grid (3 カード) / 学習サマリー (曜日表示) / 称号ボタン | OK |
| 4 | 称号モーダル | `4-title-badge-sheet.png` | プロフィールから称号ボタンタップで dialog 開く。基礎章 Lv.1-100 の grid が描画 | OK |
| 5 | AI 問題生成 | `5-ai-problem-gen.png` | ホームの AI カードクリックで AIProblemGenScreen 遷移、テーマプリセット領域が描画 | OK |
| 6 | ランキング | `6-ranking.png` | タブバーから ranking タブクリックで FermiRankingScreen 描画、ランキング関連文言表示 | OK |
| 7 | ジャーナル | `7-journal.png` | `?preview=journal` で JournalScreen 描画 (guest 状態のため login prompt が表示) | OK |
| 8 | 設定 | `8-settings.png` | プロフィール画面の設定セクションにプロフィール編集 / 通知 / 言語ボタン存在 | OK |

## 各ケースの所感

### 1. ホーム表示
挨拶 (「こんにちは、サニティ太郎さん」) と「今日の1問」が最上段に配置され、おすすめレッスン (Test It / claim) のカードが続く。レッスン開始 CTA、診断・復習・学習時間カード、AI Problems の大カードまで縦スクロールで揃っとる。タブバーも 5 タブ (ホーム / トレーニング / ランキング / ジャーナル / プロフィール) 全表示。

### 2. レッスン詳細
カテゴリタイル一覧から 1 つ目を選択 → ロードマップ画面 → レッスン本体の遷移チェーンが動いとる。進行ボタンは少なくとも 1 つ検出 (「次へ」「クイズを解く」「始める」等のいずれか)。

### 3. プロフィール
`profile-hero-name` で名前、`Lv.` プレフィックスでレベル、`stats-grid` で 3 カード (連続日数 / 完了レッスン数 / 総 XP)、曜日カレンダー、称号ボタン (`aria-label="称号の道のり"`) が揃って描画。

### 4. 称号モーダル
プロフィールの称号バッジまたはレベルバーをタップで `[role="dialog"]` が開く。スクショ確認では「基礎章 (Lv.1-100)」の grid が描画され、現在の称号「ロジック見習い」と次の称号「探究者」へのプログレスが表示。50 段の grid 仕様は称号道のりの一部として確認できる。

### 5. AI 問題生成
ホームの AI 大カード (`aria-label="AIで自分だけの問題を作る..."`) クリックで AIProblemGenScreen に遷移。`main-inner` 描画 + テーマ関連テキスト (テーマ / 問題を作る / お任せ 等) を検出。ProblemGenLoader 演出は実 API 呼び出し前段階のため未起動 (指示通り UI 入口のみ確認)。

### 6. ランキング
タブバー 3 番目をタップ → FermiRankingScreen 描画。ランキング関連文言 (ランキング / 順位 / フェルミ / 合計 / あなた / まだ / 参加 のいずれか) を検出。Mock データ含むデイリーランキング画面の表示確認 OK。

### 7. ジャーナル
`?preview=journal` 直接アクセスで JournalScreen に到達。guest user 状態のため login prompt が表示される (JournalLoginPrompt)。ログイン後の本体表示は別途認証付き E2E が必要だが、guest 動線として正常。

### 8. 設定
プロフィール画面下部の設定セクションに「プロフィール編集」「通知」「言語」「テーマ」「プラン」「フィードバック」「利用規約」「プライバシーポリシー」「特定商取引法に基づく表記」が並ぶ。プロフィール編集ボタンが SettingRow 形式で描画されていることを確認。

## CSS / ルーティング / preview パラメータ補足

- `?preview=home / lessons / profile / fermi / journal` などはサポート済 (AppV3.tsx L141 周辺の `getInitialScreen`)
- `?preview=ai-gen / ranking / settings` は無く、それぞれ home の AI カード / tabbar / profile 経由で到達する設計
- 認証不要画面のみで完結するため、サニティ用途として十分カバー可能

## 異常 / 注意事項

なし。8 ケースすべて pass、スクショ 8 枚 (合計 12.7 MB) 取得済。

## リリース可否判断

**GO 判定**。主要動線がすべて生きており、ユーザー初回起動 → 各タブ巡回の happy path に問題なし。詳細挙動の確認は機能テスト (#88) / 単体テスト (#89) に委譲。

## 関連ファイル

- テスト本体: `e2e/render-sanity-20260525.spec.ts`
- 専用 Playwright 設定: `playwright.sanity.config.ts`
- スクリーンショット 8 枚: `docs/render-screenshots/sanity/*.png`
- 並走スモークレポート: `docs/RENDER_SMOKE_20260525.md`
