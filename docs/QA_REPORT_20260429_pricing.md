# QA テストレポート — 価格改定 (2026-04-29)

## 変更内容
- スタンダード月額: ¥450 → ¥650
- プレミアム月額: ¥980 → ¥1,400
- お得感バッジ: 「2ヶ月分お得」→「5ヶ月分お得」

## テスト環境
- URL: https://logic-sit.onrender.com
- mobile: 390×844
- desktop: 1280×900

---

## テスト結果

### 期待値チェック

| 確認項目 | 期待値 | 結果 |
|---|---|---|
| スタンダード月額 | ¥650/月 | ✅ OK |
| スタンダード年額 | ¥4,500/年（月々約¥375） | ✅ OK |
| プレミアム月額 | ¥1,400/月 | ✅ OK |
| プレミアム年額 | ¥9,800/年（月々約¥817） | ✅ OK |
| 年払いバッジ | 「5ヶ月分お得」 | ✅ OK |
| 旧価格残存なし | ¥450・¥980・「2ヶ月分お得」なし | ✅ OK |

---

### 画面別テスト結果

| # | 画面 | デバイス | 判定 | スクリーンショット |
|---|---|---|---|---|
| 1 | 料金プラン（月払い） | mobile 390×844 | ✅ OK | `05_pricing_monthly_mobile_FINAL.jpg` |
| 2 | 料金プラン（年払い） | mobile 390×844 | ✅ OK | `04_pricing_yearly_mobile_FINAL.jpg` |
| 3 | 料金プラン（月払い） | desktop 1280×900 | ✅ OK | `08_pricing_monthly_desktop.jpg` |
| 4 | 料金プラン（年払い） | desktop 1280×900 | ✅ OK | `07_pricing_yearly_desktop.jpg` |
| 5 | オンボーディング（プラン選択） | mobile 390×844 | ✅ OK | `01_onboarding_plan_mobile.jpg` |
| 6 | オンボーディング（プラン選択） | desktop 1280×900 | ✅ OK | `11_onboarding_plan_desktop.jpg` |
| 7 | プロフィール画面 | mobile 390×844 | ✅ OK | `03_profile_mobile.jpg` |
| 8 | プロフィール画面 | desktop 1280×900 | ✅ OK | `06_profile_desktop.jpg` |

---

### スクリーンショット証跡（確認済み）

**mobile 料金プラン（月払い）**
- `05_pricing_monthly_mobile_FINAL.jpg`
- STANDARD ¥650/月 ✅、PREMIUM ¥1,400/月 ✅ を実機確認

**mobile 料金プラン（年払い）**
- `04_pricing_yearly_mobile_FINAL.jpg`
- STANDARD ¥4,500/年・月々¥375・5ヶ月分お得 ✅
- PREMIUM ¥9,800/年・月々¥817・5ヶ月分お得 ✅

---

## 🟢 総合判定: APPROVED

全画面・全デバイスで価格表示が期待値通りに更新されていることを確認。
旧価格（¥450、¥980、「2ヶ月分お得」）の残存なし。
mobile料金プラン画面のスクショ差し替え完了（Reviewer指摘対応済み）。
