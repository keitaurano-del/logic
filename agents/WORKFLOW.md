# Logic 開発ワークフロー — 実装 → QA → レビュー フロー

## 概要

「直す人」と「レビューする人」を分離したサブエージェント構成。
Apollo（私）はオーケストレーターとして各サブエージェントを起動・管理する。

```
Keita-san
   ↓ タスク指示
Apollo (CEO / オーケストレーター)
   ↓ 実装依頼
[実装サブエージェント: Claude Code]
   ↓ commit + push 完了報告
Apollo
   ↓ QA依頼 (SIT URL + 変更内容)
[QAサブエージェント: Claude Code]
   ↓ QAレポート (docs/QA_REPORT_YYYYMMDD.md)
Apollo
   ↓ レビュー依頼 (QAレポートパス + commitHash)
[レビューサブエージェント: Claude Code]
   ↓ APPROVED / REJECTED / BLOCKED
Apollo
   ↓ APPROVED → Keita-san に報告
   ↓ REJECTED → QA に差し戻し (ループ)
   ↓ BLOCKED → 実装サブエージェントに修正依頼 (ループ)
```

## ループ終了条件

Reviewer が **APPROVED** を返すまでループを継続する。
Apollo は絶対に Reviewer のゲートをスキップして Keita-san に報告しない。

---

## 各サブエージェントのシステムプロンプト

### 実装サブエージェント
→ `agents/cto/RULES.md` + `agents/cto/KNOWLEDGE.md` をプロンプトに渡す
→ タスク: コード修正 + `npm run build` でビルド確認 + develop ブランチへ commit/push

### QAサブエージェント
→ `agents/qa/RULES.md` + `agents/qa/KNOWLEDGE.md` をプロンプトに渡す
→ タスク: ブラウザ起動 → SIT確認 → `docs/QA_REPORT_YYYYMMDD.md` 作成 + スクショ保存

### レビューサブエージェント
→ `agents/reviewer/RULES.md` + `agents/reviewer/KNOWLEDGE.md` + `agents/qa/KNOWLEDGE.md` をプロンプトに渡す
→ タスク: QAレポートとスクショを精査 → APPROVED / REJECTED / BLOCKED を返す

---

## Apollo が守ること

1. 実装完了後は **必ず** QA → Reviewer の順に通す
2. Reviewer の APPROVED なしに「SIT確認済み」を Keita-san に報告しない
3. REJECTED / BLOCKED の場合は理由を実装/QAに伝えて再ループ
4. 最大3ループしても APPROVED にならない場合は Keita-san にエスカレーション
