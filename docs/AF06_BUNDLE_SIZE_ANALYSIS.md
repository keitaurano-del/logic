# AF-06 アプリバンドルサイズ分析 / オンデマンド画像取得 設計案

> **本書は AF-06 の (a) 計測フェーズ + (b) 設計案ドラフトの成果物です。これは調査・設計フェーズの成果物であり、実装は Keita 承認後（AF-06 スコープ (c) ゲート）に着手します。本書作成時点でコード変更・commit・push・deploy は一切行っていません（working tree に本ドキュメントを 1 枚追加するのみ）。**

- 担当: dev-logic
- 日付: 2026-06-01
- 対象リポジトリ: `/home/dev/projects/logic`
- 背景: Keita 実機報告（2026-06-01）。アプリ DL が約 300MB と大きい。レッスン画像が大半なら、DL 時に同梱せずレッスン開始時にオンデマンド読込（Netflix 方式）にしたい。

---

## 凡例: 実測と推定の区別

本書では各数値に以下を明記します。

- **【実測】** … 実コマンド出力に基づく確定値（ソースアセット / dist の実ファイルサイズ）。
- **【推定】** … 実測値から論理的に見積もった値。実機 AAB ビルドでの確証は未取得。

---

## (a) 計測フェーズ

### A-1. `public/` 全体と `public/images/v3/` の内訳【実測】

`du -sh` および `find ... -printf` による実測値です。

| 対象 | サイズ |
|---|---|
| `public/` 全体 | **282 MB** |
| `public/images/v3/`（後述カテゴリの母体） | **278 MB（= public の 98.6%）** |
| `public/images/`（v3 含む全画像） | 278 MB |
| `public/ranks/`（PNG 10 枚） | 2.4 MB |
| `public/review-pyramid.png` / `review-mece.png` | 0.33 MB / 0.31 MB |
| `public/preview/` | 0.17 MB |
| `public/silent.wav`（TTS keep-alive 用無音） | 28 KB |
| その他（HTML / SVG / アイコン群） | 合計 1 MB 未満 |

`public/` の重量はほぼ全量が `images/v3/` の PNG 群です。

### A-2. `public/images/v3/` のファイル種別・カテゴリ別内訳【実測】

ファイル種別別（375 ファイル合計 277.1 MB）:

| 種別 | 枚数 | 合計サイズ | 平均1枚 |
|---|---|---|---|
| **PNG** | **222** | **283.9 MB（実バイト和）** | **約 1,249 KB** |
| WebP | 124 | 6.1 MB | 約 50 KB |
| SVG | 29 | 0.2 MB | 約 7 KB |

> 注: `du` ベースの v3 合計は 278 MB、`find -printf '%s'`（実バイト和）ベースの PNG 合計は 283.9 MB。差はファイルシステムのブロックアロケーションと集計手法の違いによるもので、桁感は一致します。

カテゴリ別（PNG）:

| カテゴリ | 枚数 | 合計サイズ | 備考 |
|---|---|---|---|
| **レッスン画像 `lesson-*.png`** | **127** | **162.6 MB** | レッスン詳細のヒーロー/スライド画像。最大カテゴリ |
| **コースサムネ `course-*.png`** | 41 | 54.6 MB | コース/キャリアのサムネ |
| **バッジ `badges/*.png`** | 50 | 50.1 MB | 称号/ランクバッジ |
| フェルミ `fermi-card.png` | 1 | 1.9 MB | 単体最大ファイル |
| その他トップレベル PNG | 3 | 1.5 MB | `hero-deduction` / `home-daily-*` |
| **PNG 計** | **222** | **283.9 MB** | |

最大の数枚【実測】:

| ファイル | サイズ |
|---|---|
| `fermi-card.png` | 1,957 KB |
| `badges/badge-zenith.png` | 1,667 KB |
| `lesson-40.png` | 1,504 KB |
| `badges/badge-divine-3.png` | 1,503 KB |
| `course-case-01.png` | 1,457 KB |
| `lesson-613.png` | 1,452 KB |
| `course-cognitive-01.png` | 1,449 KB |

レッスン PNG は概ね 1.3〜1.5 MB に密集しており、平均約 1,249 KB です。

### A-3. その他 public 配下の大物【実測】

- フォント: `public/` 配下に独自 Web フォントの同梱は確認されず（バンドルへの寄与なし、または OS/CSS フォント依存）。
- 音声: `silent.wav` 28 KB のみ（TTS は端末内蔵エンジン利用、音声アセット同梱なし）。
- その他画像: `ranks/`（2.4 MB）, `review-*.png`（0.6 MB）, ロゴ/アイコン（合計 < 0.1 MB）。

→ **v3 PNG 以外に「大物」は存在しません。バンドル肥大の原因は v3 PNG 群に局在しています。**

### A-4. `dist`（ビルド成果物）の内訳【実測】

既存 `dist/`（最終ビルド `2026-05-31 20:13` の vite 出力、`dist/index.html` と `dist/assets/*.js` を確認）を実測しました。`build` スクリプトは `tsc -b && vite build`。`vite.config.ts` に `publicDir` のカスタム設定はなく、Vite 既定動作で `public/` の中身は **無変換でそのまま `dist/` 直下にコピー**されます。

| dist 配下 | サイズ | 内訳 |
|---|---|---|
| **`dist/` 全体** | **287 MB** | |
| `dist/images/` | **278 MB** | `public/images/` をそのままコピー（PNG 群）。dist の 96.9% |
| `dist/assets/` | 4.9 MB | アプリ本体。JS 4.2 MB（103 ファイル）+ CSS 0.4 MB（10 ファイル） |
| `dist/ranks/` | 2.4 MB | ランク PNG |
| その他 | < 1 MB | HTML / アイコン等 |

`du -sh dist/images public/images` がともに 278 MB で一致 → **dist/images は public/images の単純コピー**であることを確認。

> ビルド再実行について: 既存 dist が現行 `public/` を反映した正規の vite 出力であり、画像は無変換コピーされる構成（`publicDir` 未カスタマイズ）が `vite.config.ts` で確認できたため、新規フルビルドを走らせなくてもアセット内訳は確定できます。JS/CSS バンドルサイズも既存 dist の実測値（JS 4.2 MB / CSS 0.4 MB）を採用しました。

**dist 結論【実測】**: ビルド成果物 287 MB のうち、**画像 278 MB（96.9%）に対し、JS+CSS のアプリ本体は約 4.6 MB（1.6%）**。圧倒的に画像が支配的。

### A-5. Android バンドル（APK/AAB）に同梱される範囲【実測 + 推定】

- `capacitor.config.ts`: `webDir: 'dist'`【実測】。→ Capacitor は **`dist/` 全体を Android アプリの `assets/public/` に同梱**します。dist には画像 278 MB が含まれるため、**v3 PNG 群はそのまま APK/AAB に入ります**。
- `android/app/src/main/assets/` は現時点で**存在しません**【実測】。`npx cap sync`（または `cap copy`）未実行の状態で、同期すると dist がここへコピーされます。
- `android/app/build/` 等の既存 APK/AAB 生成物は**存在しません**【実測】。→ headless 環境では実 AAB サイズの直接実測は不可。

**AAB への寄与の見積もり【推定】**:

| 構成要素 | 圧縮前 | AAB/APK 内での見立て | 根拠 |
|---|---|---|---|
| v3 PNG 群（画像） | 278 MB | **≈ 270〜278 MB** | PNG は既に圧縮済みフォーマット。APK の zip 二重圧縮はほぼ効かず、ダウンロードサイズ ≈ 原寸 |
| JS/CSS バンドル | 4.6 MB | ≈ 1.5〜2.5 MB | テキストは zip 圧縮が効く（概ね 1/2〜1/3） |
| Capacitor ランタイム + ネイティブ依存 + リソース | — | **≈ 10〜25 MB【推定】** | WebView は OS 提供のため非同梱。Capacitor コア/プラグイン、mipmap/drawable、ネイティブライブラリの一般的レンジ |

### A-6. 「300MB のうち画像が占める割合」と 300MB の妥当性検証

**画像の占有割合【実測ベース + 推定】**:

- ソース/ビルド成果物の実測では、**バンドル可搬部（dist 287 MB）の 96.9% が画像**。
- AAB ダウンロードサイズ換算でも、PNG は圧縮が効かないため **画像が約 270〜278 MB を占め、全体の 90% 超**と見積もられます【推定】。

**300MB の妥当性【検証結果】**:

- ソース同梱画像だけで 278 MB は実在します【実測】。これに Capacitor ランタイム・ネイティブリソース 10〜25 MB【推定】を足すと、**合計 290〜305 MB 程度**となり、Keita 実機報告の「約 300MB」と**整合します**。
- したがって「300MB は妥当」かつ「その大半は v3 PNG 画像」と結論できます。ネイティブ依存/Capacitor ランタイムの寄与は全体の 1 割未満で、**削減レバーは画像一択**です。

> 未確証点【推定の限界】: 実 AAB のダウンロードサイズ（Play Console 表示値）、および Android App Bundle の分割配信（density split 等）の効きは headless では確認できていません。確定には実機/CI での `./gradlew bundleRelease` 実行が必要です（後述「未確証事項」）。

### A-7. 画像参照の構造（設計に直結する事実）【実測】

参照は **public ルート相対の絶対パス文字列**で記述されており、リモート URL への差し替えが容易です。

| ファイル | 参照数（png） | 形式 |
|---|---|---|
| `src/lessonSlides.ts` | 143 | `LESSON_IMAGES` マップ: `20: '/images/v3/lesson-20.png'` 形式 |
| `src/courseData.ts` | 42 | `image: '/images/v3/course-logic-01.png'` 形式 |
| `src/screens/HomeScreenV3.tsx` | 28 | `${IMG}/lesson-${id}.png`（`IMG = '/images/v3'`）動的構築 |
| `src/screens/RoadmapScreenV3.tsx` | — | ロードマップは既に **`.webp`** 使用: `src={`/images/v3/lesson-${lessonId}.webp`}` |

**重要な既存事実**:
- レッスン画像は用途で **2 系統**: ロードマップ一覧 = 軽量 `.webp`（平均 50 KB、計 6.1 MB）/ レッスン詳細ヒーロー・ホーム = 重量 `.png`（平均 1,249 KB）。**バンドル肥大の主因は後者の PNG**。
- `lesson-*` は png 127 枚に対し webp 87 枚。webp 未整備の png が存在。

---

## (b) 設計案ドラフト — オンデマンド画像取得

### B-1. 取得方式: Supabase Storage を推奨

Logic は既に Supabase Storage を利用中（`src/components/journal/journalImages.ts` で `supabase.storage.from(BUCKET).upload/remove/createSignedUrls` を使用済み）。**新規 CDN を導入せず、既存 Supabase Storage に専用バケット（例 `lesson-images`、public バケット）を切る**のが筋です。

- **公開バケット推奨**: レッスン画像は機密でないため public バケットにし、`getPublicUrl()` で安定 URL を得る。署名 URL（TTL 失効・キャッシュ無効化要因）より、public + 端末キャッシュの方が CDN/キャッシュ親和性が高い。
- **コスト明記**: Supabase Storage は (1) ストレージ容量課金（278 MB は小さい）と (2) **転送量（egress）課金**が発生。オンデマンド化は「全員が初回 DL で全画像取得」から「閲覧分のみ取得 + 端末キャッシュ」に変わり、**egress は閲覧実態に比例**。端末キャッシュ（B-3）で再取得を抑えれば、ユーザーあたり egress はおおむね「実際に見たレッスン数 × 画像サイズ」に収束。容量・転送の見積りは移行カテゴリ確定後に算出する。
- 代替: 将来 egress が増えたら Supabase 前段に CDN（Cloudflare 等）を挟む拡張余地あり。初手は Supabase 単体で可。

### B-2. 取得タイミング（段階的 prefetch + lazy）

| 画面 | 方式 | 理由 |
|---|---|---|
| ロードマップ初期表示 | 既存 `.webp`（50 KB 級）はバンドル同梱維持を推奨 | 一覧は軽量。リモート化の費用対効果が低く、初期表示のオフライン退行リスクを避ける |
| コース画面表示時 | そのコースの先頭数レッスン画像を **prefetch** | 体感速度確保。見えている範囲のみ先読み |
| レッスン開始時 | ヒーロー/スライド PNG を **lazy 取得** | Netflix 方式の本命。重い PNG はここで取る |

初期は「ロードマップ初期表示分の webp は同梱維持、重い PNG のみリモート lazy」を基本線とします。

### B-3. キャッシュ戦略（端末ローカル、再取得回避）

二層を推奨:

1. **HTTP キャッシュ層（第一選択・実装軽量）**: public URL に長期 `Cache-Control`（`max-age` 大 + immutable）を付与。WebView/ブラウザの HTTP キャッシュに乗る。ファイル名にバージョン（後述 B-6 の v4 等）を含め、内容変更時はファイル名で破棄。
2. **永続キャッシュ層（オフライン強化・任意）**: `@capacitor/filesystem` を追加し、取得済み画像を端末 FS に保存 → 次回は `Filesystem.readFile` でローカル供給。
   - **注意**: `@capacitor/filesystem` は**現状未依存**（`package.json` 未掲載）【実測】。採用時は依存追加が必要。
   - 軽量代替として、まず HTTP キャッシュ + Service Worker / Cache API でも相当のオフライン耐性が得られる。第一弾は FS なしで HTTP キャッシュ、第二弾で FS 永続化、という段階導入が安全。

再取得回避: ファイル名バージョニング + immutable で、同一バージョンは初回のみ取得。

### B-4. プログレス表示・placeholder・アクセシビリティ

- 読込中は **同色系の placeholder（スケルトン/ブラー）** を表示。レイアウトシフト防止のため幅高は予約。
- `<img>` は必ず `alt`（レッスン名/語ラベル）を維持。既存参照箇所が `alt` 未付与なら付与する。スクリーンリーダー利用者は画像未取得でもラベルで内容把握可能。
- 取得失敗時は再試行ボタン or 自動リトライ + テキストフォールバック。

### B-5. オフライン挙動（退行防止）

- **キャッシュ済み**: ローカルから即表示（オンライン同等）。
- **未取得 + オフライン**: placeholder + 「オフラインのため画像を取得できません」表示 + オンライン復帰時の再取得。**機能自体は継続**（画像はあくまで補助、レッスンテキスト/スライドは表示）。
- 退行ガード: ロードマップ一覧の webp を同梱維持することで、最頻出画面のオフライン体験は現状維持。

### B-6. 既存サムネ方針との両立

`feedback-logic-course-thumbnails` 方針（`.png` 参照維持・`.svg` 巻き戻し禁止、手書き+図解 v4 PNG マスター維持）を**壊しません**。本設計で変わるのは**参照先がバンドル相対パス（`/images/v3/...png`）→ リモート URL（`https://<project>.supabase.co/storage/v1/object/public/lesson-images/...png`）に変わるだけ**で、拡張子・マスター画像・ビジュアル方針は不変です。

参照箇所の変更は集中型を推奨: `src/lessonSlides.ts`（`LESSON_IMAGES`）/ `src/courseData.ts` / `src/screens/RoadmapScreenV3.tsx` / `src/screens/HomeScreenV3.tsx`。`const IMG = '/images/v3'` のような基底定数を「`REMOTE_IMG = <storage base>`」に切り替え、ヘルパー（取得 + キャッシュ + placeholder）で包む形にすれば差分は局所化できます。

### B-7. 段階移行案と初回 DL 削減見込み（(a) の実測値ベース）

同梱に残す分（webp）を維持しつつ、重い PNG カテゴリから順にリモート化します。

| 段階 | リモート化対象 | 削減量【実測ベース】 | 累積削減 | 残バンドル画像（目安） |
|---|---|---|---|---|
| 現状 | — | — | — | 278 MB |
| 第1段 | レッスン PNG `lesson-*.png`（127枚） | **−162.6 MB** | 162.6 MB | 約 115 MB |
| 第2段 | コースサムネ `course-*.png`（41枚） | −54.6 MB | 217.2 MB | 約 61 MB |
| 第3段 | バッジ `badges/*.png`（50枚）+ fermi 等 | −53.5 MB | 270.7 MB | 約 7 MB（webp+svg のみ） |

- **第1段だけで初回 DL 約 162 MB 削減（バンドル画像の 58%減）**。アプリ DL は概算 300MB → **約 140MB 級**に。
- **全段完了で画像同梱は約 7 MB（webp 6.1 + svg 0.2）まで縮小**。アプリ全体は **Capacitor ランタイム等 + JS 込みで 30〜50MB 級**【推定】に収まる見込み。

推奨初手: **第1段（レッスン PNG）**。単一カテゴリで最大の削減効果（−162 MB）が得られ、参照が `src/lessonSlides.ts` に集中していて差分も局所的、かつレッスン開始時 lazy という Netflix 方式の本命用途に一致するため。

### B-8. 並行の軽量化余地（同梱のまま効く圧縮/解像度最適化）【推定・当たりのみ】

オンデマンド化と独立して、同梱維持でも以下で削減可能（designer 領域。数値は概算の当たり）:

- **PNG → WebP 化**: 既存 webp 実測で **png 1,249 KB → webp 50 KB（約 1/25）**。仮に全 PNG を同水準 webp 化すると、222 枚 × 約 50 KB ≈ **11 MB（現 284 MB から約 96% 減）**。ただし webp 50 KB はロードマップ用の小サイズ。ヒーロー用に解像度を保つなら 1 枚 150〜300 KB 程度を想定し、**222 枚で 35〜70 MB（現状比 75〜88% 減）**が現実的な当たり【推定】。
- **解像度最適化**: PNG が表示寸法より過大な可能性大（平均 1.2 MB は端末表示には過剰）。表示実寸 + 2x DPR にリサイズするだけで大幅減が見込める。
- 注: これは「リモート化前にソース PNG を webp/最適化してからリモート保存」する形で**オンデマンド化と併用が最も効果的**（リモートでも軽い方が egress も小さい）。

---

## 未確証事項（実機/CI ビルドが必要）

| 項目 | 状態 |
|---|---|
| 実 AAB ダウンロードサイズ（Play Console 値） | **未確証**。`./gradlew bundleRelease` 実機/CI 実行が必要 |
| App Bundle density split / 圧縮の実効き | **未確証（推定）**。PNG は zip 圧縮が効きにくいとの一般則ベース |
| Capacitor ランタイム + ネイティブの実寸 | **推定 10〜25 MB**。実 AAB で確定要 |
| Supabase Storage の容量/転送コスト実額 | **未算出**。移行カテゴリ確定 + 想定 MAU/閲覧率で要試算 |

実測で確証済み: public/dist の実ファイルサイズ内訳、カテゴリ別画像サイズ、`webDir: dist` 構成、画像参照の記述形式、Supabase Storage の既存利用、`@capacitor/filesystem` 未依存。

---

## 次アクション（Keita 承認後 = (c) ゲート）

1. 第1段（レッスン PNG）リモート化の PoC: Supabase 公開バケット作成 → 画像アップロード → `lessonSlides.ts` の基底切替 + 取得/キャッシュ/placeholder ヘルパー実装。
2. 実 AAB ビルドで削減実額を確証。
3. 並行で designer に PNG→WebP/解像度最適化を依頼（egray 削減にも寄与）。
