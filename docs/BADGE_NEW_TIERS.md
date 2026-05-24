# BADGE_NEW_TIERS.md — Lv 101-500 新称号バッジ画像

## サマリー

Lv 101-500 拡張帯 (2026-05-24 commit `e9ee131`) の 34 称号に対応する**専用バッジ画像 34 枚を新規生成**し、`public/images/v3/badges/` に配置完了。

これまで `src/screens/homeHelpers.ts` の `BADGE_FALLBACK_MAP` で旧 16 種を循環再利用していたが、**全帯に実画像が揃った**ため fallback は不要になった。dev-logic 引き継ぎ前提でこの doc を残す。

## 生成パイプライン

- スクリプト: `scripts/generate-badge-set-v1.ts`
- プロンプト定義: `scripts/badgePromptsV1.ts` (34 件、band 別パレット + motif 設計)
- 生成モデル: `gemini-2.5-flash-image` (Nano Banana)
- スタイル: heraldic emblem (heater shield + laurel wreath, photoreal metallic, 透明背景 PNG)
- 出力先: `public/images/v3/badges/badge-<key>.png` (1024×1024)
- 単価: $0.039/枚 × 34 = 約 $1.33
- 生成成功率: 34/34 (全て 1 試行で成功、リトライ 0 回)

## 帯設計 mapping

| Band | Lv 範囲 | サブ帯 | パレット |
|---|---|---|---|
| 奥義 (apex) | 101-136 | apex-2, 3, 4 | 黒鉄 + 金 (Lv100 apex 継承) |
| 叡智 (wisdom) | 137-184 | wisdom-1, 2, 3, 4 | プラチナ + 薄紫エナメル |
| 巨匠 (virtuoso) | 185-232 | virtuoso-1, 2, 3, 4 | プラチナ + シアン |
| 悟達 (enlightened) | 233-280 | enlightened-1, 2, 3, 4 | 金 + 琥珀アンバー |
| 黎明 (luminary) | 281-328 | luminary-1, 2, 3, 4 | プラチナ + ロイヤルパープル |
| 覇者 (sovereign) | 329-376 | sovereign-1, 2, 3, 4 | プラチナ + インディゴ |
| 超越 (transcend) | 377-424 | transcend-1, 2, 3, 4 | プラチナ + 翡翠グリーン |
| 神格 (divine) | 425-472 | divine-1, 2, 3, 4 | プラチナ + ピンクパープル |
| 永遠 (eternal) | 473-496 | eternal-1, 2 | ピュアゴールド + クリーム |
| 極致 (zenith) | 497-500 | zenith (unique) | 純白プラチナ + 虹色光輝 |

## 称号 ⇄ ファイル名 mapping

```
apex-2         → public/images/v3/badges/badge-apex-2.png         (Lv 101-112, 静観の達人)
apex-3         → public/images/v3/badges/badge-apex-3.png         (Lv 113-124, 究理の徒)
apex-4         → public/images/v3/badges/badge-apex-4.png         (Lv 125-136, 不動の論士)
wisdom-1       → public/images/v3/badges/badge-wisdom-1.png       (Lv 137-148, 思考の練達)
wisdom-2       → public/images/v3/badges/badge-wisdom-2.png       (Lv 149-160, 知慮の士)
wisdom-3       → public/images/v3/badges/badge-wisdom-3.png       (Lv 161-172, 達観の賢者)
wisdom-4       → public/images/v3/badges/badge-wisdom-4.png       (Lv 173-184, 玲瓏の智者)
virtuoso-1     → public/images/v3/badges/badge-virtuoso-1.png     (Lv 185-196, 論考の名手)
virtuoso-2     → public/images/v3/badges/badge-virtuoso-2.png     (Lv 197-208, 思索の巨匠)
virtuoso-3     → public/images/v3/badges/badge-virtuoso-3.png     (Lv 209-220, 智慧の巨匠)
virtuoso-4     → public/images/v3/badges/badge-virtuoso-4.png     (Lv 221-232, 論理の名工)
enlightened-1  → public/images/v3/badges/badge-enlightened-1.png  (Lv 233-244, 目覚めの賢者)
enlightened-2  → public/images/v3/badges/badge-enlightened-2.png  (Lv 245-256, 透徹の智者)
enlightened-3  → public/images/v3/badges/badge-enlightened-3.png  (Lv 257-268, 静謐の悟人)
enlightened-4  → public/images/v3/badges/badge-enlightened-4.png  (Lv 269-280, 識見の達人)
luminary-1     → public/images/v3/badges/badge-luminary-1.png     (Lv 281-292, 智慧の燈)
luminary-2     → public/images/v3/badges/badge-luminary-2.png     (Lv 293-304, 啓蒙の士)
luminary-3     → public/images/v3/badges/badge-luminary-3.png     (Lv 305-316, 黎明の賢者)
luminary-4     → public/images/v3/badges/badge-luminary-4.png     (Lv 317-328, 知の灯火)
sovereign-1    → public/images/v3/badges/badge-sovereign-1.png    (Lv 329-340, 思索の覇王)
sovereign-2    → public/images/v3/badges/badge-sovereign-2.png    (Lv 341-352, 論理の宗師)
sovereign-3    → public/images/v3/badges/badge-sovereign-3.png    (Lv 353-364, 知の盟主)
sovereign-4    → public/images/v3/badges/badge-sovereign-4.png    (Lv 365-376, 智慧の王者)
transcend-1    → public/images/v3/badges/badge-transcend-1.png    (Lv 377-388, 超然の論士)
transcend-2    → public/images/v3/badges/badge-transcend-2.png    (Lv 389-400, 達人の境地)
transcend-3    → public/images/v3/badges/badge-transcend-3.png    (Lv 401-412, 無我の智者)
transcend-4    → public/images/v3/badges/badge-transcend-4.png    (Lv 413-424, 円通の賢者)
divine-1       → public/images/v3/badges/badge-divine-1.png       (Lv 425-436, 神算の士)
divine-2       → public/images/v3/badges/badge-divine-2.png       (Lv 437-448, 神慮の賢者)
divine-3       → public/images/v3/badges/badge-divine-3.png       (Lv 449-460, 智慧の権化)
divine-4       → public/images/v3/badges/badge-divine-4.png       (Lv 461-472, 思索の神格)
eternal-1      → public/images/v3/badges/badge-eternal-1.png      (Lv 473-484, 不滅の論士)
eternal-2      → public/images/v3/badges/badge-eternal-2.png      (Lv 485-496, 永遠の賢者)
zenith         → public/images/v3/badges/badge-zenith.png         (Lv 497-500, 叡智の極致)
```

## dev-logic 引き継ぎ TODO

### 1. `BADGE_FALLBACK_MAP` 削除

`src/screens/homeHelpers.ts` の以下を削除:

- `BADGE_FALLBACK_MAP` 定数 (line 388-437 付近)
- `REAL_BADGE_KEYS` 定数 (line 439-447 付近)
- `getBadgeImagePath()` の循環マッピングロジック (line 449-455 付近)

差し替え後の `getBadgeImagePath()` はシンプルに:

```typescript
export function getBadgeImagePath(key: TitleKey): string {
  return `/images/v3/badges/badge-${key}.png`
}
```

### 2. 動作確認

- プロフィール画面の Lv 100 / 137 / 200 / 300 / 500 で正しいバッジが表示されること
- `src/components/TitleBadgeSheet.tsx` の bottom sheet で全 50 帯を縦スクロールしてバッジ崩れがないこと
- E2E (`npx playwright test --project=chromium`) が pass

### 3. (任意) 旧スクリプト整理

`scripts/badgePrompts.ts` / `scripts/generate-badge-set.ts` は v0 (Lv 1-100) 用、`scripts/badgePromptsV1.ts` / `scripts/generate-badge-set-v1.ts` は v1 (Lv 101-500) 用。残しておけば再生成可能。

## 再生成手順

何らかの理由で個別差し替えが必要になった場合:

```bash
# 単一帯のみ
npx tsx scripts/generate-badge-set-v1.ts --only=zenith

# 既存ファイルを上書き
npx tsx scripts/generate-badge-set-v1.ts --only=zenith --force

# 全帯 (既存はスキップ)
npx tsx scripts/generate-badge-set-v1.ts
```

`.env` に `GEMINI_API_KEY` が必要。Paid plan tier 必須 ([[reference-gemini-api]] 参照)。

## 関連

- 旧 16 帯 (Lv 1-100): `scripts/badgePrompts.ts` + `scripts/generate-badge-set.ts`
- 新 34 帯 (Lv 101-500): `scripts/badgePromptsV1.ts` + `scripts/generate-badge-set-v1.ts`
- 称号テーブル: `src/screens/homeHelpers.ts` の `TITLE_TIERS`
- i18n: `src/i18n.ts` の `profile.title.<key>` (key の `-` は `_` に置換)
- Lv 101-500 拡張 commit: `e9ee131` (2026-05-24)
