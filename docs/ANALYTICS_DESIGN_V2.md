# Analytics Design v2 — 売上向上のための計測設計

Phase 1 の Metabase ダッシュボード（`docs/ANALYTICS_DASHBOARD.md`）が「既存 Supabase データの可視化」までを担うのに対し、本 v2 は **売上向上（Churn 低減・MRR 拡大）を目的に、新規イベント計測・ユーザー要望吸い上げ・改善ループまで含めた中長期設計** を扱います。

> ステータス: ドラフト（2026-05-24）。Phase 1 は実装着手前提、Phase 2 以降は Keita 判断待ち。

---

## 1. 目的階層と KPI ツリー

```
[大目標] 売上向上（Churn 率低減 / MRR 拡大）
   │
   ├─ [中目標 1] UI 改善 ───────── 離脱ポイント特定 → 改修
   ├─ [中目標 2] コンテンツ質向上 ── スライド単位の読まれ率・離脱率 → 改善
   └─ [中目標 3] 要望吸い上げ ───── 機能要望・不満の構造化 → 開発優先度
```

### 1.1 大目標 KPI

| 指標 | 定義 | 目標値（初期） | 計測元 |
|---|---|---|---|
| MRR | Paid 月額換算合計（1480 × monthly + 9800/12 × yearly） | — | Supabase `subscriptions` |
| Churn 率 | 月初 active のうち月末に解約・期限切れ・revoked になった割合 | < 8% / 月 | Supabase + Play RTDN |
| LTV | 平均継続月数 × ARPU | ARPU × 12 を初期暫定 | 上記 2 つから算出 |
| ARPU | MRR ÷ paying users | — | 同上 |
| 課金転換率 | 新規登録 → 課金開始の割合（30 日窓） | — | `profiles.created_at` × `subscriptions.created_at` |

レポート粒度: 週次（毎週月曜 Metabase 自動更新）/ 月次（月初に手動レビュー）。

### 1.2 中目標 KPI（要約）

| 中目標 | 主要 KPI | 良いとされる水準 |
|---|---|---|
| UI 改善 | ファネル離脱率 / 主要画面の遷移時間 | 課金ページ到達 → 完了 30%+ |
| コンテンツ | スライド完読率 / レッスン完了率 | 完読率 60%+ |
| 要望吸い上げ | NPS / 月次 feedback 件数 | NPS 30+ / 月 20 件以上 |

---

## 2. 中目標 1 — UI 改善のための計測設計

### 2.1 計測したいイベント

| イベント名 | プロパティ | 用途 |
|---|---|---|
| `screen_view` | screen_name, prev_screen, locale, plan | 画面遷移ファネル |
| `tap` | element_id, screen, plan | ボタン到達率 |
| `scroll_depth` | screen, max_depth_pct（25/50/75/100） | 縦長画面の読了度 |
| `session_start` / `session_end` | duration_sec, platform | 滞在時間 |
| `checkout_step` | step（start / select_plan / native_purchase / verify / success / fail）, error_code | 課金ファネル |
| `paywall_view` | trigger（lesson_lock / banner / settings）, plan_shown | 課金露出効率 |

### 2.2 ツール選定

採用候補: **PostHog (self-host or Cloud EU)**。

| ツール | 月額目安（10k MAU） | Session Recording | Funnel | A/B | Self-host |
|---|---|---|---|---|---|
| PostHog | $0〜$200（OSS 自由枠） | ○ | ○ | ○ | ○ |
| Mixpanel | $25〜$833 | × | ○ | ○ | × |
| Amplitude | $0〜$995 | × | ○ | △ | × |
| Firebase Analytics | 無料 | × | △ | △（Remote Config 経由） | × |

採用理由: (a) Session Recording で実操作を観察できる、(b) Self-host で個人情報の越境を回避可、(c) Feature Flag / A/B が同一ツール内で完結、(d) 無料枠が広い。

### 2.3 主要ファネル

1. **オンボーディングファネル**: `app_launch` → `signup_start` → `magic_link_sent` → `magic_link_opened` → `first_lesson_view`
2. **学習着手ファネル**: `home_view` → `lesson_detail_view` → `lesson_start` → `lesson_complete`
3. **課金ファネル**: `paywall_view` → `checkout_step:start` → `checkout_step:native_purchase` → `checkout_step:verify` → `checkout_step:success`

各ステップの離脱率を毎週レビューし、最大離脱ステップを 1 つだけ翌週の改善対象にします。

### 2.4 Session Recording 運用ルール

- 課金ファネル離脱ユーザーの直近 1 セッションのみ recording 対象（コスト・プライバシーの両面）
- メールアドレス・氏名・自由記述テキスト入力フィールドは **mask 必須**（PostHog の `data-ph-mask` 属性）
- 保持期間 30 日、その後自動削除

---

## 3. 中目標 2 — コンテンツ質計測

### 3.1 計測したいイベント

| イベント名 | プロパティ | 用途 |
|---|---|---|
| `slide_view` | lesson_id, slide_id, slide_index, total_slides | 露出 |
| `slide_dwell` | lesson_id, slide_id, dwell_sec | 滞在時間 |
| `slide_complete` | lesson_id, slide_id, scroll_pct | 完読 |
| `lesson_complete` | lesson_id, duration_sec, slides_viewed | レッスン全体 |
| `quiz_answer` | lesson_id, quiz_id, correct, attempt_count | 理解度 |

### 3.2 集計指標

- **スライド完読率** = `slide_complete` / `slide_view`
- **スライド離脱率** = 1 − （次の slide_view が同セッションで発生した率）
- **平均滞在時間** = `slide_dwell.dwell_sec` の中央値（外れ値が大きいため median 採用）
- **Quiz 正答率** = `quiz_answer.correct = true` の割合（初回試行のみ）

しきい値（暫定）:
- 完読率 < 40% のスライド → 文章長さ・難易度を見直し
- 離脱率 > 50% のスライド → 順序入れ替えまたは導入の見直し
- Quiz 正答率 < 30% → 設問再設計、>= 90% → 簡単すぎる

### 3.3 A/B テスト基盤

PostHog Feature Flag を使い、同一スライドに対し variant_a / variant_b を出し分けます。

- 割当: ユーザー ID hash で 50/50
- 評価指標: 完読率 + Quiz 正答率（複合）
- サンプルサイズ: 各 variant 200 ユーザー以上に達した時点で評価
- 期間: 最低 2 週間（曜日変動の影響を吸収）

### 3.4 既存テーブル拡張

```sql
-- study_sessions に粒度を追加（既存テーブル拡張）
ALTER TABLE study_sessions
  ADD COLUMN slide_id TEXT,
  ADD COLUMN dwell_sec INTEGER,
  ADD COLUMN scroll_pct INTEGER;

CREATE INDEX idx_study_sessions_lesson_slide
  ON study_sessions(lesson_id, slide_id);
```

PostHog がメインの計測層ですが、長期分析向けに **同イベントを Supabase の `study_sessions` にも複製** します（PostHog の保持期間に依存しないため）。複製は server 側で行い、クライアントから両方に送らないようにします。

---

## 4. 中目標 3 — ユーザー要望吸い上げ

### 4.1 既存チャネルの整理

| チャネル | 現状 | 強み | 弱み |
|---|---|---|---|
| アプリ内「誤りを報告」 | 実装済（`reports` テーブル） | 文脈付き（lesson_id 紐付け） | コンテンツ誤りに限定 |
| Play Store レビュー | 自然発生 | 公開で他ユーザーにも見える | 量が少ない・端末問題と混在 |
| Email サポート | サポート窓口 | 詳細書いてもらえる | 件数少なめ |
| Discord / X mention | ad-hoc | 熱量高いユーザー | 散在・追跡漏れ |

### 4.2 新規追加するチャネル

1. **アプリ内 NPS（四半期に 1 回）**
   - 起動 N 回到達かつ前回 NPS から 90 日経過したユーザーに表示
   - 「0–10 で評価」+ 自由記述 1 問
   - 新規 `user_feedback` テーブルに保存

2. **機能要望フォーム（設定画面常設）**
   - カテゴリ選択（バグ / 機能要望 / コンテンツ / その他）+ 自由記述
   - 同じ `user_feedback` テーブル、`category` カラムで分類

3. **ジャーナル傾向分析（プライバシー配慮版）**
   - ユーザーのジャーナル本文は **個別解析しない**
   - ジャーナルの「タグ・mood・週次集計」のみを匿名で集計し、共通する悩み傾向を把握
   - 本文への AI アクセスは「ユーザーが明示的に同意した範囲内のみ」運用とし、当面 v2 では実装しない

4. **Store レビュー定期集約**
   - 月次で Play / App Store レビューを CSV 取得
   - 簡易テキストマイニング（頻出キーワード抽出）で要望集計

### 4.3 新規テーブル `user_feedback`

```sql
CREATE TABLE user_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  source TEXT NOT NULL,            -- 'nps' | 'feature_request' | 'report' | 'store_review' | 'email'
  category TEXT,                   -- 'bug' | 'feature' | 'content' | 'other'
  nps_score SMALLINT,              -- 0..10, NPS のみ
  body TEXT,
  app_version TEXT,
  platform TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_user_feedback_source_created
  ON user_feedback(source, created_at DESC);
```

RLS: ユーザー自身は自分のレコードのみ insert/read 可、admin は全件 read 可。

---

## 5. 必要 DB スキーマ・テーブル一覧

| テーブル | 用途 | 新規/拡張 |
|---|---|---|
| `events`（or PostHog 専属） | 全行動イベント主台帳 | 新規 / PostHog 利用なら不要 |
| `study_sessions` | スライド粒度の学習履歴 | 拡張（slide_id 等追加） |
| `user_feedback` | NPS・要望・自由記述 | 新規 |
| `ab_test_assignments` | variant 割当履歴 | 新規（PostHog Feature Flag で代替可） |
| `subscriptions`（既存） | 課金状態 | 変更なし |

PostHog を導入する場合、`events` テーブルは PostHog 側に持たせ、Supabase 側は集計済みデータと feedback だけを保持する構成が運用負荷低めです。

---

## 6. 実装ロードマップ

| Phase | 期間 | 内容 | 完了条件 |
|---|---|---|---|
| **Phase 1** | 完了済 | Metabase で既存データ可視化 | `docs/ANALYTICS_DASHBOARD.md` 参照 |
| **Phase 2** | 2 週間 | PostHog 導入 + 画面遷移計測 | screen_view / tap / checkout_step が PostHog で見える |
| **Phase 3** | 4 週間 | スライドレベル計測 + A/B 基盤 | slide_view / slide_complete / Feature Flag 動作 |
| **Phase 4** | 継続運用 | NPS + 要望吸い上げ + 月次改善ループ | NPS 月次取得、`user_feedback` データ収集 |

各 Phase 終了時に「投資コストと得られた学習」を 1 ページで振り返り、次 Phase 実行可否を Keita 判断します。

---

## 7. プライバシー・倫理配慮

| 観点 | 対応 |
|---|---|
| 個人情報 mask | PostHog の `data-ph-mask`、メール・氏名・自由記述は録画対象外 |
| ジャーナル本文 | v2 では AI 解析対象外。集計はタグ・mood・頻度のみ |
| APPI（日本） | プライバシーポリシーに「行動ログ取得」「第三者ツール（PostHog）利用」を明記 |
| GDPR | EU 向けは PostHog EU リージョン使用 + Cookie/同意取得 |
| 保持期間 | Session Recording 30 日 / events 1 年 / feedback は本人削除要請で削除 |
| ユーザー削除要請 | サポート受付 → Supabase `user_feedback` + PostHog `delete-person` API で対応 |

プライバシーポリシー更新は計測実装と同タイミング（Phase 2 前）に必須です。

---

## 8. ツール選定の根拠（要約）

採用: **PostHog (Cloud EU or Self-host)**

- Open source / Self-host 可で月額固定化できる
- Funnel・Session Recording・Feature Flag・A/B が同一ツール
- 無料枠が 1M events/月で初期は十分
- Capacitor / React で公式 SDK あり

非採用理由メモ:
- Mixpanel: Session Recording なし、価格上昇カーブが急
- Amplitude: A/B が別プロダクト課金、UI が重い
- Firebase Analytics: 無料だが Funnel UI が貧弱、Session Recording なし

---

## 9. 林の推奨着手順

| 期間 | やること | 期待アウトプット |
|---|---|---|
| 短期（1–2 週） | Phase 2 の PostHog 導入 + 課金ファネル計測 | 「課金ページ離脱率」が初めて数値で見える |
| 中期（1 か月） | スライド計測 + 完読率トップ/ワースト 10 の特定 | 改善すべきレッスン 3 件が確定 |
| 長期（3 か月） | A/B 1 サイクル完走 + NPS 取得開始 + Churn 率の月次トラッキング | 改善施策の効果が定量で比較できる |

最初の 1 か月で「課金ファネル離脱率」と「ワースト 10 スライド」が見えれば、その後の改善は数値ドリブンで回せます。

---

## 10. ROI 試算（粗算）

### 10.1 投資コスト

| 項目 | 月額 | 一時 |
|---|---|---|
| PostHog Cloud（〜100k events/月想定） | $0〜$50 | — |
| 実装工数 Phase 2 | — | 約 2 週間（林＋dev-logic） |
| 実装工数 Phase 3 | — | 約 4 週間 |
| Metabase（既存） | $7（Render Starter） | — |

### 10.2 期待リターン（仮定: 課金ユーザー 100 人、ARPU 1200 円、Churn 月 10%）

| 改善後 Churn | 月 MRR | 12 か月 LTV/人 | 差分 |
|---|---|---|---|
| 10%（現状） | 12 万円 | 12,000 円 | 基準 |
| 8%（−2pt） | 12 万円 | 15,000 円 | +25% LTV |
| 6%（−4pt） | 12 万円 | 20,000 円 | +67% LTV |

Churn を 2pt 下げられれば LTV が 25% 上がる試算。PostHog の年間 $600 程度の投資は 1 人あたり 3,000 円の LTV 改善で回収できる計算です。

---

## 11. 既存ドキュメント・関連メモ

- `docs/ANALYTICS_DASHBOARD.md` — Phase 1 Metabase の現況
- `supabase/migrations/021_metabase_readonly.sql` — readonly role 設定
- memory: `project_metabase_setup` / `project_logic_mobile_only` / `project_logic_play_billing_gaps`

---

## 12. 次のアクション（Keita 判断待ち）

1. Phase 2 着手承認（PostHog 導入 + 課金ファネル）
2. PostHog Cloud EU を使うか Self-host か選択
3. プライバシーポリシー改訂を法務観点でレビューするか
4. NPS UI のデザインを designer subagent に依頼するか

判断材料が揃わない箇所があれば、その項目だけ別途調査して追補します。
