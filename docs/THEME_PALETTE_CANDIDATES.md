# Logic 背景テーマ（背景モード）追加候補 — designer 提案

作成: 2026-05-28 / 提案者: designer (Rin orchestration)
ステータス: 提案のみ。実装なし。Keita が最終的に 3 種選別する前提。

## 背景

Keita 要望「テーマをもっと増やして。今のは AI っぽい（量産っぽい）から垢抜けさせて」。
既存 5 モード（`src/theme.ts` の `MODES` + `src/styles/tokens.css` の `body.theme-v3.mode-{id}`）と
被らない方向で、彩度を盛りすぎないグラデ感や「紫グラデ/ネオン」を避けた、性格のある配色を提案する。

ブランド色 `--brand` は `#3D5FC4`。各候補は `--brand` と必ずしも揃えず、テーマごとの個性を持たせている。

## アクセシビリティ基準

- text on bg / text on card: WCAG AA（本文 4.5:1）を全候補で満たす。実測は下表参照。
- accent on card: UI 要素・ボタン・見出し用途で 3:1 以上を確保。本文文字色に accent を使う場合は 4.5:1 を満たす HEX を選定済み。
- 数値は WCAG 2.x relative luminance で実計算（推測値ではない）。算出スクリプトは本ドキュメント末尾参照。

---

## 候補一覧（6 案）

| # | テーマ名 (ja / en) | tier | 系統 | bg | card | text | accent | コンセプト |
|---|---|---|---|---|---|---|---|---|
| 1 | 古紙 / Sepia | premium | light | `#F4ECDD` | `#FBF6EC` | `#3A2F23` | `#B25C3A` | セピアの紙に赤茶インク。教科書の余白の質感 |
| 2 | 深緑 / Forest | premium | dark | `#10221B` | `#173026` | `#E4EDE6` | `#6FB89A` | 夜の書斎、落ち着いた深緑。集中モード向き |
| 3 | 霞青 / Dusty Blue | free | light | `#E7ECF0` | `#F6F8FA` | `#1F2D38` | `#3F6B86` | くすんだ青鼠。彩度を抑えた知的で静かな青 |
| 4 | 墨白 / Monochrome | free | light | `#F2F2F0` | `#FFFFFF` | `#1A1A1A` | `#C0392B` | モノクロ＋朱の差し色一点。引き算の品格 |
| 5 | 紺夜 / Midnight | premium | dark | `#141526` | `#1E2038` | `#E6E6F0` | `#9A8CE0` | 夜の紺。藤色アクセントを淡く一点だけ（ネオン回避） |
| 6 | 鼠墨 / Ink + Amber | premium | dark | `#17181A` | `#232427` | `#ECECEE` | `#E0A84E` | 炭グレーのモノトーン＋琥珀。男前で渋い |

注: ja 名は雰囲気重視の当て字。`i18n.ts` の `theme.mode.{id}.name` に入れる正式名は Keita 確定後に調整。en 名も叩き台。

---

## コントラスト比（WCAG 実測）

合格基準: 本文 text は 4.5:1 以上、accent は UI/ボタン用途 3:1 以上（本文色に使うなら 4.5:1 以上）。

| # | テーマ | text/bg | text/card | accent/card | accent/bg | 判定 |
|---|---|---|---|---|---|---|
| 1 | 古紙 Sepia | 11.11:1 | 12.10:1 | 4.35:1 | 3.99:1 | text=AAA / accent=AA(本文可)・UI余裕 |
| 2 | 深緑 Forest | 13.86:1 | 11.80:1 | 6.05:1 | 7.10:1 | 全項目 AA、text AAA |
| 3 | 霞青 Dusty Blue | 11.84:1 | 13.23:1 | 5.39:1 | 4.83:1 | 全項目 AA、text AAA |
| 4 | 墨白 Monochrome | 15.53:1 | 17.40:1 | 5.44:1 | 4.85:1 | 全項目 AA、text AAA |
| 5 | 紺夜 Midnight | 14.54:1 | 12.85:1 | 5.46:1 | 6.18:1 | 全項目 AA、text AAA |
| 6 | 鼠墨 Ink+Amber | 15.06:1 | 13.15:1 | 7.30:1 | 8.36:1 | 全項目 AA、text AAA |

参考: 既存 startup/custom は accent/card が 2.5〜2.6:1 で本文サイズ AA 未達（大きい見出し・装飾用途で運用中）。
今回の 6 案は全て accent/card 4.35:1 以上で、その弱点も改善している。

### 用途上の注意（候補 1 のみ）

候補 1（古紙 Sepia）の accent `#B25C3A` は accent/card 4.35:1。本文文字サイズの AA（4.5:1）を僅かに下回るので、
accent は「ボタン背景・アイコン・見出し・下線」に使う運用なら全く問題ない（UI/large text の 3:1 を大きく超える）。
小さい本文リンク色に accent をそのまま使う設計にする場合のみ、`#A8542F`（card 比 4.9:1）に寄せると本文 AA も満たす。

---

## スウォッチ視覚

`docs/theme-candidates-swatches.svg` を併設（本ドキュメントと同じフォルダ）。
各テーマの bg / card / text / accent を横並びにしたカラーチップ。Keita が並べて選別しやすい形。

---

## 既存 5 モードとの差別化マップ

| 既存 | 系統/色相 | 今回どう差別化したか |
|---|---|---|
| light | 青系 light（クール） | 3 Dusty Blue はより低彩度・青鼠寄りで別物。1/4/6 は別色相 |
| dark | 紺系 dark（青ナビ） | 2 Forest は緑、6 Ink は無彩色、5 Midnight は紺だが藤色アクセントで差別化 |
| enterprise | 濃紺＋グレー accent | 5 Midnight が一番近いが、accent を藤色にして無機質さを脱した |
| startup | 暖白＋緑 accent | 緑は 2 Forest に集約（dark 側へ移動して別キャラ化） |
| custom | ベージュ＋オレンジ | 1 Sepia がベージュ系だが、より紙寄り＋赤茶でレトロな性格 |

「AI っぽさ脱却」の効かせどころ:
- グラデ多用・高彩度をやめ、各テーマ 1 アクセント色だけに性格を集約
- 無彩色ベース（4 墨白・6 鼠墨）で引き算の品を出す
- 紙・墨・森・夜という素材感のある名前と色で量産テンプレ感を消す

---

## 実装メモ（dev-logic 引き継ぎ用・実装は承認後）

- `src/theme.ts` の `ModeId` union と `MODES` 配列に追加（`preview: {bg,card,text,accent}`）。
- `src/styles/tokens.css` に `body.theme-v3.mode-{id}` ブロックを追加。
  bg/card/text/accent の 4 色だけでなく、既存モードと同様に派生トークン
  （`--bg-secondary` `--bg-elevated` `--text-secondary` `--text-muted` `--border` `--accent-soft`
  `--accent-glow` `--accent-dark` `--accent-fg` `--shadow-*` 等）を埋める必要がある。
  4 色は基準点で、派生色は各 bg/text からトーン段階で生成する。
- `applyTheme()` の `theme-color` meta 同期（`src/theme.ts` 末尾）は現状 light/dark の 2 値ハードコード。
  新モード追加時は各モードの bg を返すよう分岐拡張が望ましい（モバイルの URL バー/ステータス色整合）。
- i18n: `theme.mode.{id}.name` / `.desc` を `ja`/`en` 両方に追加（必須）。
- tier 付与（free/premium）は上表の想定値。Keita 判断で変更可。

---

## 算出スクリプト（再現用）

`/tmp/contrast.mjs` 相当。WCAG 2.x relative luminance + contrast ratio。

```js
function lum(hex){
  const h=hex.replace('#','');
  const c=[0,2,4].map(i=>{
    let v=parseInt(h.slice(i,i+2),16)/255;
    return v<=0.03928? v/12.92 : Math.pow((v+0.055)/1.055,2.4);
  });
  return 0.2126*c[0]+0.7152*c[1]+0.0722*c[2];
}
function ratio(a,b){
  const la=lum(a),lb=lum(b),hi=Math.max(la,lb),lo=Math.min(la,lb);
  return (hi+0.05)/(lo+0.05);
}
```
