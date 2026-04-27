# Apollo — レビュー領域の現状（2026-04-27 更新）

## 役割の歴史
- 2026-04-27 朝: Keita-san 指示で Apollo は実装から手を引きレビュー専念に
- 2026-04-27 昼: Reviewer サブエージェントを別途新設（`agents/reviewer/`）

## 現在の役割分担

| 工程 | 担当 |
|---|---|
| 戦略・ロードマップ | **Apollo** |
| プロダクト要件定義 | CPO |
| 実装 | CTO（Claude Code 等） |
| QA テスト | QA |
| **品質ゲート（一次判定）** | **Reviewer**（新設） |
| **最終決裁・Keita-san 連携** | **Apollo** |

## Apollo がレビューで残すもの
1. Reviewer の判定（APPROVED / REJECTED / BLOCKED）を最終決裁
2. Keita-san への展開
3. 重大な戦略判断 / 例外承認

## Apollo が手放したもの（Reviewer に委譲）
- QA レポートの一字一句チェック
- スクショ実在 / 網羅性確認
- 過去指摘との照合
- CTO への修正依頼チケット起票（一次案）

## 必須参照
- `agents/reviewer/AGENT.md` / `RULES.md` / `KNOWLEDGE.md`
- 旧 Apollo Reviewer 仕様（このファイルの履歴）

## チェックリスト（Apollo の最終決裁時）
- [ ] Reviewer の判定書面が存在する
- [ ] Reviewer の判定根拠が妥当
- [ ] Keita-san に伝えるべきリスク / 注意事項を整理した
- [ ] 本番デプロイ条件（main マージ + Render 手動デプロイ）の手順が明確

## 不正解時の対応
Apollo が Reviewer の判定に疑義を持ったら:
1. Reviewer に追加レビューを依頼（「ここをもう一度見てくれ」）
2. それでも納得できなければ Apollo 自身がスポット確認（例外）
3. Keita-san に展開する前に必ず疑問を解消
