# コースサムネイル生成マニフェスト

Logicアプリのコース・レッスン用サムネイル画像生成の進捗を記録するマニフェスト。

## 生成済みサムネイル

すべてPixa（Ideogram v3、16:9、1312×736 PNG）で生成。スタイル：シンプル・モダン、内容に沿ったコンセプト。

### Notion DB

「Logic素材」DB: <https://www.notion.so/38555f3f86db4fa0b4aff5d907af5395>

### 完了済み（13コース・17ファイル）

| コースID | コース名 | カテゴリ | Asset ID | ファイル名 |
|---|---|---|---|---|
| logic-01 | ロジカルに考えて、整理する | 論理的に考える | asset_6e18deace7b04e0096430058a8abf219 | logic_logic-01_1.png |
| logic-01 | ロジカルに考えて、整理する | 論理的に考える | asset_497a89a4f9874b1893fc55d3ed581d9b | logic_logic-01_2.png |
| logic-01 | ロジカルに考えて、整理する | 論理的に考える | asset_b1388f5678ec4dc3a1168aa68e88f392 | logic_logic-01_3.png |
| logic-01 | ロジカルに考えて、整理する | 論理的に考える | asset_accaed58e9904a8f9a901400ac539f2f | logic_logic-01_4.png |
| logic-01 | ロジカルに考えて、整理する | 論理的に考える | asset_b7215a8fabd64d488d51f705a9611ce3 | logic_logic-01_5.png |
| logic-02 | 論理を組み立て、相手を動かす | 論理的に考える | asset_bd6013eb7b2146ed9d29b962337481b2 | logic_logic-02_1.png |
| critical-01 | 思い込みを疑い、正しく判断する | 論理的に考える | asset_1438749ac21a45f9bf1361911d4b2abf | logic_critical-01_1.png |
| critical-02 | バイアスを外し、客観的に見る | 論理的に考える | asset_7c20b71d6e6b49db81f01c955fc839d3 | logic_critical-02_1.png |
| hypothesis-01 | 仮説を立ててから、調べる | 課題を解決する | asset_105a6ae2b3eb405a80774ed50a5d4c30 | logic_hypothesis-01_1.png |
| problem-01 | 本当の問題を見極め、定義する | 課題を解決する | asset_533cdf99e9534beb8d0b536a4148df20 | logic_problem-01_1.png |
| design-01 | ユーザーの本音を掘り下げ、解決する | 課題を解決する | asset_59be76ec8dda45ce8caa8a1f6e1efbfa | logic_design-01_1.png |
| systems-01 | 全体を俯瞰し、根本から変える | 課題を解決する | asset_a500fbd9d76a4086af2d2ff02c359a2f | logic_systems-01_1.png |
| lateral-01 | 常識を疑い、突破口を開く | 発想を広げる | asset_cbc1fb86472a4049983ac4405017cdac | logic_lateral-01_1.png |
| analogy-01 | 別分野の知恵を借りて、応用する | 発想を広げる | asset_3f3c9bb7aff2453db7a5ac8e9488c595 | logic_analogy-01_1.png |
| philosophy-01 | 哲学の問いで、思考を深める | 論理的に考える | asset_de2b5d185d784e129595ad78dce9ed85 | logic_philosophy-01_1.png |
| eastern-01 | 古代中国思想で、人と組織を見る | 論理的に考える | asset_2759c8368b924c65a9f2ebc6db43df69 | logic_eastern-01_1.png |
| eastern-02 | 古代中国思想で、戦略と決断を見る | 論理的に考える | asset_06d6acccde944a3eab33ed0c52eec51f | logic_eastern-02_1.png |

合計: 12コース x 1枚 + logic-01 x 5枚 = 17ファイル（消費306クレジット）

## 未生成（10コース）

Pixaクレジット不足により以下が未生成。クレジット追加後に生成予定。

| コースID | コース名 | カテゴリ |
|---|---|---|
| proposal-01 | 相手が動く提案をつくる | 相手を動かす |
| proposal-course-01 | 仮説と検証で、提案書を仕上げる | 相手を動かす |
| client-01 | 数字で状況を素早く読み解く | 現場で実践する |
| client-02 | 論点を定め、深く引き出す | 相手を動かす |
| client-03 | 未経験の業界で、短期間で立ち上がる | 現場で実践する |
| case-01 | ケース面接で、論理力を証明する | 相手を動かす |
| strategy-01 | 戦略の源流と競争戦略を学ぶ | 現場で実践する |
| strategy-02 | 資源・能力・共進化の戦略へ | 現場で実践する |
| fermi-01 | 概算で、世界の規模を掴む | 現場で実践する |
| numeracy-01 | 数字に強くなる | 現場で実践する |

## レッスン用画像（未着手）

各レッスンの最初の画像（合計約119レッスン分）。コース全件完了後に着手予定。

## ダウンロード手順

ネットワーク制限（`assets.pixelcut.app`がClaudeのallowlist外）のため、現状はリポジトリに画像ファイルを保存できない。手順：

1. Notion DB「Logic素材」の各レコードの「ダウンロードURL」から画像をダウンロード
2. `public/images/v3/` に上記「ファイル名」で保存
3. `src/courseData.ts` の各コース定義に `image: '/images/v3/logic_<id>_1.png'` を追加

または、Claudeのネットワーク許可ホストに `assets.pixelcut.app` と `mcp.pixa.com` を追加すれば、自動でダウンロード・コード反映が可能。

## 生成プロンプトの方針

各コースのテーマ・キーワードを反映。パステル系ソフトカラー、フラットデザイン、テキストなし、16:9。

例：
- **logic-01**: ロジックツリー / MECE / 整理された脳 / 散らかり→整理 / ピラミッド階層
- **systems-01**: 氷山モデル + フィードバックループ
- **eastern-01**: 中国の巻物 + 階層的人物 + 朱と墨

## 関連リソース

- コース定義: `src/courseData.ts`
- 既存サムネイル: `public/images/v3/course-*.{svg,webp}`
- Notion DB: 「Logic素材」（38555f3f-86db-4fa0-b4af-f5d907af5395）
