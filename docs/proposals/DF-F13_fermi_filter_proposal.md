# DF-F13: デイリーフェルミ 難易度／分野フィルタ 設計案

担当: content-creator（編 詠子） / ステータス: 設計案（Keita 承認待ち、実装未着手）
課題: デイリーフェルミが残数表示のみで上級者の手応えが薄い。難易度・分野フィルタを足して「自分に合った問題を選んで解ける」状態にしたい。

---

## 0. 結論サマリ

- 問題プールは ja 50問・en 50問。**en はすでに難易度・分野の機械可読タグを持っている**（`scripts/dogfood/f19_final.json` の `difficulty` / `theme`、pool 順と 1:1 対応）。**ja はタグが無く、セクションコメントの非機械可読な分類だけ**。ここが最大のギャップ。
- まず両ロケールの 50問に `difficulty`（3段）と `domain`（分野）を**データとして付与**するのが土台。en は既存タグを移植するだけ、ja は新規分類（本書 §2 に全50問の割り当て案を提示）。
- フィルタ UI は「問題カードの上に難易度チップ＋分野チップを置き、絞り込み条件に合う未完了プールから出題」。1日1問制限（DF-F18）との整合と日次シード（`getDailyFermiIndex`）の整合が論点。**フィルタは「今日出す1問の母集合を絞る」だけにして、1日1問の本数ルールは変えない**のを推奨案とする（§3）。
- correctness 観点: en の `difficulty` 3段（basic/standard/advanced）と ja のセクション分けは粒度が違う。**両ロケールで同一の3段スキーマに揃える**こと（混在は学習者を混乱させる誤り）。

---

## 1. 現状の棚卸し（実ソース根拠）

### 1-A. 問題プールの実体

- `src/fermiData.ts`
  - `FERMI_POOL_JA`（fermiData.ts:14-76）: ja 50問。`{ question, hint }` のみ。**難易度・分野フィールドなし**。
  - `FERMI_POOL_EN`（fermiData.ts:78-131）: en 50問。同じく `{ question, hint }` のみ。**難易度・分野フィールドなし**（コメント先頭 fermiData.ts:79 に「basic10/standard23/advanced17」と記録は残るがコードには無い）。
  - `FERMI_STATS_JA` / `FERMI_STATS_EN`（fermiData.ts:159-365）: index 対応の参考データ `{ label, value }[]`。問題1問につき1配列。
  - 出題 index は `getDailyFermiIndex()`（fermiData.ts:147-149）= `floor(Date.now()/86400000) % POOL.length` の日付シード。`findFermiPoolIndex`（:140-144）は履歴→再挑戦の逆引き。
- つまり**現状、問題は属性を一切持たず、index と日付シードだけで回っている**。難易度・分野での選別はコード上不可能。

### 1-B. en は外部ソースにタグがある（移植可能）

- `scripts/dogfood/f19_final.json`（50件）に構造化タグが存在し、`FERMI_POOL_EN` と**並び順が一致**（`n:1` = pool index 0）。
  - フィールド: `n` / `question_en` / `hint_en` / `referenceStats` / `anchor` / `theme` / `difficulty`
  - `difficulty` 分布: `basic 10 / standard 23 / advanced 17`
  - `theme` 分布: `market-sizing 7 / platform-supply-demand 3 / unit-economics 6 / national-sizing 6 / platform-concurrency 3 / industry-throughput 12 / stock-flow 5 / global-tam 6 / cost-ops 2`
  - 例: n1 basic/market-sizing（coffee-chain café）, n2 standard/platform-supply-demand（ride-hailing drivers）, n4 advanced/national-sizing（haircut & salon）。
- en の `theme` は「推定の型（解き方の構造）」で切られており（市場規模／需給／ユニットエコノミクス／同時接続数 …）、学習者が「どの分解パターンを練習するか」で選べる良い軸。ただし 9 カテゴリは UI フィルタには多すぎる（後述 §2-B で集約案）。

### 1-C. デイリーフェルミ画面の現状 UI

- `src/screens/DailyFermiScreen.tsx`
  - 出題 index 決定（:521-533）: replay 指定 → `getHomeFermiIndex()`（ホームと共有の未完了プール＋日次シード）→ `getDailyFermiIndex()` の順。
  - 問題カード（:677-736）に出るのは `t('fermi.questionTag')`（「問題」ラベル）と question 本文のみ。**難易度・分野の表示は一切なし**＝「残数表示のみで手応えが薄い」の実態。
  - 残数表示は :756-769。有料は `dailyFermi.paidCapNote`「1日10問まで（あと {count} 問）」、上限到達で `dailyFermi.dailyLimit`。
  - 「別の問題を選ぶ」(reroll, :570-592, :739-755): 除外 index 以外から**ランダム**に1問。ここに難易度・分野の絞り込みは無い。reroll は有料のみ（rerollLimit = 有料9/無料0）。
- `src/screens/dailyFermiState.ts`
  - `pickHomeFermiIndexPure()`（:79-109）: 未完了プール（done セット除外）から日次シードで決定的に1問選ぶ純関数。ホーム／Daily の単一真実源。**フィルタを足すならここに「許可 index 集合」を一つ引数で渡すのが最小改修**。
  - done 集合は当日のみ（日跨ぎで自動リセット、:36-39）。

### 1-D. プラン別の本数ルール（DF-F18「1日1問」の実態）

- `DailyFermiScreen.tsx:41-48`
  - `getDailyFermiLimit()`: 有料 10 / 無料 1（提出できる本数）。
  - `getDailyRerollLimit()`: 有料 9 / 無料 0（別問題への振り直し回数。SIT のみ 999）。
- 提出時 `incrementDailyCount()`（:613）で当日カウント加算。上限で `canAnswer=false`。
- **「1日1問」は無料プランの本数制限**。有料は実質「1日10問（初回＋reroll 9）」。フィルタ追加で論点になるのはこの本数ルールとの兼ね合い（§3-論点1）。

### 1-E. ランキング・履歴との結合（フィルタ追加時の波及）

- スコア記録（`DailyFermiScreen.tsx:625-640`）は `questionIndex: currentPoolIndex` を送る。`FermiRankingScreen` / `FermiHistoryScreen` は index 基準。
- **フィルタは「どの index を出すか」を変えるだけで、index 体系・記録形式は不変**にできる → ランキング／履歴の互換は保てる（破壊的変更なし）。これは設計上の強い制約として守る。

---

## 2. 難易度タグ付け 設計案

### 2-A. 難易度スキーマ（両ロケール共通の3段）

`difficulty: 'basic' | 'standard' | 'advanced'`（en の既存 3 値をそのまま正準にする。UI 表示は i18n で出し分け）。

- basic（初級）: 単一〜2段の分解で概算が立つ日常的事象。アンカー値（人口・世帯数等）を覚えていれば素直に解ける。
- standard（中級）: 3〜4段の分解、複数項目の合算、回転率や稼働率など「率」を1〜2個挟む。
- advanced（上級）: top-down と bottom-up の照合が要る／時系列・ストックフロー（保有台数÷買い替え周期）／同時接続・ピーク係数など、分解の設計自体に判断が要るもの。

UI 表示ラベル（i18n、中立丁寧体）案:
- ja: 初級 / 中級 / 上級
- en: Basic / Standard / Advanced

### 2-B. 分野スキーマ（en の 9 theme を UI 向けに 5 へ集約）

en の `theme` 9 種はフィルタには細かすぎるので、学習者が選びやすい 5 ドメインへ集約する。`domain` フィールドを新設し、内部の `theme`（en 由来）はメタとして温存可。

| domain（UI） | ja ラベル案 | en ラベル案 | 集約元 en theme | 主旨 |
|---|---|---|---|---|
| `market` | 市場規模 | Market Size | market-sizing, global-tam | 「○○市場は年間何円か」型 |
| `unit` | 売上・単価 | Unit Economics | unit-economics | 1店舗／1施設の売上を積み上げる型 |
| `volume` | 数量・流通 | Volume & Flow | industry-throughput, stock-flow, national-sizing | 「年間何個／何台」保有・買い替え・生産量 |
| `flow` | 需給・同時接続 | Demand & Peak | platform-supply-demand, platform-concurrency | 同時接続・ピーク係数・需給バランス |
| `cost` | コスト・運用 | Cost & Ops | cost-ops | 運用コスト・電力費などの費用推定 |

注: `volume` がやや大きい（national-sizing/throughput/stock-flow を束ねる）。Keita が「数量系をもっと割る」判断をするなら national-sizing を `market` 寄りに移す等の調整余地あり（§4-論点3）。

### 2-C. ja 50問の割り当て案（実問題で当てはめ）

en は f19_final.json から `difficulty` 移植（basic10/standard23/advanced17）＋上表で `theme→domain` 変換するだけ。**ja は新規分類が必要**なので全50問の割り当て案を提示する（index は fermiData.ts:14-76 の出現順 0始まり）。

難易度の判定基準（再掲の運用）: 分解段数と「率」の個数、top-down/bottom-up 照合や時系列の有無で 3 段に振る。

| idx | 問題（要約） | difficulty | domain |
|---|---|---|---|
| 0 | SaaS市場の年間売上 | advanced | market |
| 1 | スタバ全店の1日売上 | standard | unit |
| 2 | 居酒屋300店の1日売上 | standard | unit |
| 3 | EC市場GMV | standard | market |
| 4 | 年間M&A件数 | advanced | volume |
| 5 | 中小企業の年間オフィス賃料 | basic | cost |
| 6 | コンサル年間受注PJ数 | advanced | volume |
| 7 | 会社員の年間ハンコ数 | standard | volume |
| 8 | 「お疲れ様です」総回数 | standard | volume |
| 9 | 「了解です」チャット総数 | standard | volume |
| 10 | オフィスコーヒー総杯数 | basic | volume |
| 11 | 「マイクミュート」全国回数 | advanced | flow |
| 12 | 経費精算の領収書総枚数 | standard | volume |
| 13 | 眠る名刺の総枚数 | advanced | volume |
| 14 | ゴルフ市場の年間規模 | standard | market |
| 15 | ペットフード市場 | basic | market |
| 16 | 都内ジム会員数 | standard | volume |
| 17 | 結婚式市場の規模 | standard | market |
| 18 | オンライン広告市場 | advanced | market |
| 19 | メガネ市場 | standard | market |
| 20 | 宅配便の年間取扱個数 | standard | volume |
| 21 | 動画サブスク市場 | standard | market |
| 22 | ドラッグストア業界売上 | basic | unit |
| 23 | プロ野球年間観客動員 | basic | volume |
| 24 | ラーメン店の年間総売上 | basic | unit |
| 25 | コンビニ3社の1日合計売上 | basic | unit |
| 26 | タクシー業界の年間売上 | standard | unit |
| 27 | カラオケ市場 | basic | unit |
| 28 | 漫画市場（紙＋電子） | standard | market |
| 29 | スマホゲーム業界売上 | advanced | market |
| 30 | 保険業界の総保険料収入 | advanced | market |
| 31 | 中古車市場の年間流通台数 | standard | volume |
| 32 | 宅配ピザ業界の総売上 | basic | unit |
| 33 | スマホ年間出荷台数 | standard | volume |
| 34 | レンタカー業界の総売上 | standard | unit |
| 35 | 自販機の年間総売上 | basic | unit |
| 36 | 通信費の年間総支出 | standard | market |
| 37 | 英会話スクール業界売上 | standard | market |
| 38 | スーパー銭湯の年間入場者 | basic | volume |
| 39 | 不動産仲介業界の総売上 | advanced | market |
| 40 | 電子書籍市場 | standard | market |
| 41 | スマートウォッチ出荷台数 | standard | volume |
| 42 | ホテル業界の年間客室稼働 | standard | flow |
| 43 | コピー機待ち時間の年間総和 | standard | volume |
| 44 | 「お世話になっております」総数 | standard | volume |
| 45 | 「先方都合の時間変更」件数 | advanced | flow |
| 46 | 1日の印刷紙総枚数 | standard | volume |
| 47 | 年賀状の年間発送枚数 | basic | volume |
| 48 | Enterキー年間総押下 | standard | volume |
| 49 | 駅の自販機コーヒー1日本数 | advanced | volume |

ja 分布（この案）: basic 12 / standard 27 / advanced 11 ／ domain は market 15・unit 10・volume 21・flow 3・cost 1（合計50）。

correctness 注記:
- ja は `cost` が 1問（idx5）・`flow` が 3問しかない。en は cost-ops 2・flow 系 6。**「分野×難易度」で絞った時に 0件になる組み合わせが出る**。ja の 5分野×3難易度=15セルを実集計すると 0件セルは4つ: `basic × flow` / `standard × cost` / `advanced × unit` / `advanced × cost`（特に cost 系と advanced×unit が薄い）。これはバグではなく在庫の薄さ。UI 側で「該当0件」フォールバック（§3-B）が必須。
- ja idx49（駅の自販機コーヒー）は階層が深い（駅数×台数×本数×コーヒー比率）ので advanced に置いた。idx10（オフィスコーヒー）は2段＋率1個で basic。同じ「コーヒー」でも難易度が割れる点は分類の妥当性チェックとして良い目安。

### 2-D. データ構造案（dev-logic 実装前提）

`FermiQuestion` を拡張（後方互換: 既存参照は question/hint のみ使うので破壊しない）:

```ts
export type FermiDifficulty = 'basic' | 'standard' | 'advanced'
export type FermiDomain = 'market' | 'unit' | 'volume' | 'flow' | 'cost'

export type FermiQuestion = {
  question: string
  hint: string
  difficulty: FermiDifficulty   // 追加（必須化は移植完了後）
  domain: FermiDomain           // 追加
  theme?: string                // en 由来の細分類をメタとして温存（任意）
}
```

移植手順の推奨（dev-logic 向け）:
1. en: `scripts/dogfood/f19_final.json` の `difficulty` をそのまま、`theme` を §2-B の表で `domain` へ機械変換して `FERMI_POOL_EN` の各要素に付与。pool 順と n 順が一致することを `findFermiPoolIndex` ではなく index 直対応で検証（ズレ検知のテストを1本足す）。
2. ja: §2-C の表をデータ化して `FERMI_POOL_JA` に付与。
3. 既存テスト（`__tests__/dailyFermiState.test.ts` 等）が pool 形状変更で割れないか確認。
4. 付与後、`difficulty`/`domain` 別の件数を吐く軽い検算スクリプトで §2-C / §2-B の分布と一致を確認（タグ付けミスの早期検知）。

---

## 3. フィルタ UI／挙動 仕様骨子

### 3-A. UI（DailyFermiScreen 上部）

- 問題カードの**上**に絞り込みバーを1段追加（submitPhase==='idle' のときだけ表示）。
  - 難易度チップ: 全て / 初級 / 中級 / 上級（単一選択、デフォルト「全て」）。
  - 分野チップ: 全て / 市場規模 / 売上・単価 / 数量・流通 / 需給・同時接続 / コスト・運用（単一選択、デフォルト「全て」）。
  - 各チップに残数バッジ（その条件の未完了在庫数）。「上級だけまだ豊富」が一目で分かる＝上級者の手応え不足への直接の回答。
- 問題カード内に**現在の問題の難易度・分野チップを常時表示**（残数表示しか無かった所に「いま解いてるのが何か」を足す）。これだけでも手応え改善に効く。
- アクセシビリティ: チップは `aria-pressed`、選択状態は色だけでなくテキスト（選択中ラベル）でも判別可能に。

### 3-B. 出題ロジック（最小改修）

- `pickHomeFermiIndexPure()`（dailyFermiState.ts:79-109）に「許可 index 集合」を1引数追加し、`available` を done 除外に加えてフィルタ条件でも絞る。
- フィルタ選択は localStorage に保持（キー案 `logic-daily-fermi-filter`、`{difficulty, domain}`）。日跨ぎでも保持（学習者の好み）。
- **該当0件フォールバック**（必須）: 選択条件の未完了在庫が0なら、(a) チップに「0」を出して選べないようにする or (b) 「この条件の問題は今日ぶんを解き終えました／在庫がありません」を中立丁寧体で表示し、条件緩和を促す。§2-C の通り 0件組み合わせは実在する。
- reroll（別の問題, :570-592）も同じ許可集合から選ぶよう統一（今はフィルタ無視のランダム）。

### 3-C. 日次シード（getDailyFermiIndex）との整合

- 日次シードは「未完了プールの中で当日決定的に1問を選ぶ」ために使われている（dailyFermiState.ts:107 で `available.length` の剰余）。**フィルタで `available` を絞っても、剰余ベースの決定的選択はそのまま機能する**（母集合が変わるだけ）。
- 整合の肝: フィルタ条件を変えた瞬間に「今日の1問」が別 index に切り替わる。これは仕様として許容（ユーザーが能動的に条件を変えた結果）。ただし**未提出の問題を解いている最中にフィルタを変えると問題がすり替わる**ので、UI は submitPhase==='idle' かつ入力途中なら確認するか、入力があるうちはフィルタを disable する（§4-論点2）。

### 3-D. DF-F18「1日1問」との整合（推奨案）

- **推奨: フィルタは「母集合の絞り込み」専用にし、本数ルール（無料1／有料10）は一切変えない。**
  - 無料: 1日1問のまま。フィルタは「その1問を初級／市場規模から出す」等の選択肢を与えるだけ。reroll は引き続き無料0なので、無料は「条件を選んで1問」。
  - 有料: 1日10問のまま。フィルタ＋reroll で「上級だけ10問」のような集中練習が可能になる＝上級者の手応え不足の本丸の解決。
- この切り分けなら DF-F18 の本数仕様と矛盾しない（フィルタは直交概念）。「フィルタすると本数が増える／上級は複数解ける」といった本数連動は**入れない**のを推奨（課金境界が曖昧になり、無料で上級無制限の抜け道を生みやすい）。
- もし「上級者にもっと解かせたい」を本数で解くなら、それは DF-F18 の本数改定（別タスク）として Keita 判断にすべきで、フィルタ機能に混ぜない。

---

## 4. Keita が決めるべき論点

1. 本数連動の可否（最重要）: フィルタは母集合の絞り込みだけ（推奨）か、それとも「上級を選んだら本数を増やす／上級は無料でも複数解ける」など本数ルールに踏み込むか。後者は DF-F18 改定を伴い、課金境界の再設計が必要。
2. フィルタ変更時の挙動: 解答入力中にフィルタ変更を許すか（問題すり替わり）。「入力中は disable」か「確認ダイアログ」か。
3. 分野スキーマの粒度: §2-B の 5 ドメイン集約でよいか。`volume` が大きいので割るか、逆に 5 でも多いと感じるなら難易度フィルタのみ先行リリースか。
4. ja の難易度割り当て（§2-C）の承認: 編の一次案。特に basic/advanced の境界（idx10 vs 49 のコーヒー2問など）を見て微調整指示があれば。
5. 在庫の薄い組み合わせ（ja advanced×cost=0 等）を許容するか、それとも問題プールを増やして全 5×3=15 セルに最低N問を保証しに行くか（後者は新規問題作成タスク＝編の出番、別 DF として起票）。
6. フィルタ選好の永続範囲: 日跨ぎで保持（推奨）か、毎日リセットか。

---

## 5. i18n（ja / en、中立丁寧体）への影響

新規キー（`src/i18n.ts` に ja / en 両方必須）。文言はすべて中立丁寧体（[[feedback-app-copy-neutral]] 準拠、凛口調・キャラ性なし）。

| キー案 | ja | en |
|---|---|---|
| `dailyFermi.filterDifficulty` | 難易度 | Difficulty |
| `dailyFermi.filterDomain` | 分野 | Topic |
| `dailyFermi.filterAll` | すべて | All |
| `dailyFermi.diffBasic` | 初級 | Basic |
| `dailyFermi.diffStandard` | 中級 | Standard |
| `dailyFermi.diffAdvanced` | 上級 | Advanced |
| `dailyFermi.domainMarket` | 市場規模 | Market Size |
| `dailyFermi.domainUnit` | 売上・単価 | Unit Economics |
| `dailyFermi.domainVolume` | 数量・流通 | Volume & Flow |
| `dailyFermi.domainFlow` | 需給・同時接続 | Demand & Peak |
| `dailyFermi.domainCost` | コスト・運用 | Cost & Ops |
| `dailyFermi.filterEmpty` | この条件の問題は見つかりませんでした。条件を変えてお試しください。 | No problems match this filter. Try changing the conditions. |
| `dailyFermi.filterRemain` | 残り {count} 問 | {count} left |
| `dailyFermi.filterChangeWhileEditing` | 入力中の内容は破棄されます。条件を変更しますか？ | Your current input will be discarded. Change the filter? |
| `dailyFermi.filterStockNote` | 上級の問題はまだ多く残っています。 | Plenty of advanced problems remain. |

注:
- en は `domain` ラベルを `Topic` と呼ぶ（`Domain` は技術用語的なので学習者には Topic が自然）。ja は「分野」。
- 既存 `dailyFermi.*` 文言（i18n.ts:963 以降 / 2870 以降）はそのまま流用。難易度・分野は純粋な追加キーで、既存文言の改変は不要。
- en の表示順・大文字小文字は既存スタイル（Title Case ラベル）に揃える。

---

## 6. 受け入れ条件（実装完了の DoD・参考）

- 両ロケール全50問に `difficulty` / `domain` が付与され、§2-C / §2-B の分布と一致する検算が通る。
- 難易度・分野フィルタ UI が出て、選択に応じて出題母集合が絞られる（ランキング／履歴の index 体系は不変）。
- 該当0件時にフォールバック文言が出る（クラッシュしない）。
- 無料1問／有料10問の本数ルールが変わっていない（DF-F18 不変）。
- ja / en 両方で i18n キーが揃い、中立丁寧体。
- `tsc -b --noEmit` / `eslint .` / 既存 fermi 系テスト green。

---

参照ファイル:
- `/home/dev/projects/logic/src/fermiData.ts`（プール本体・難易度/分野フィールド追加先）
- `/home/dev/projects/logic/scripts/dogfood/f19_final.json`（en の difficulty/theme 既存タグ・移植元）
- `/home/dev/projects/logic/src/screens/DailyFermiScreen.tsx`（フィルタ UI 追加先・本数ルール）
- `/home/dev/projects/logic/src/screens/dailyFermiState.ts`（pickHomeFermiIndexPure に許可集合引数追加）
- `/home/dev/projects/logic/src/i18n.ts`（dailyFermi.* 新規キー ja/en）
</content>
</invoke>
