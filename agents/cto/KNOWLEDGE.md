# CTO KNOWLEDGE

## 技術スタック

- フロントエンド: React + TypeScript + Vite
- モバイル: Capacitor（Android/iOS）
- バックエンド: Express（Node.js）+ Supabase（PostgreSQL）
- 認証: Supabase Auth（現在: メール/パスワード → Google OAuthへ移行予定）
- 決済: Stripe
- AI: Anthropic Claude API
- ホスティング: Render（SIT: logic-sit, 本番: logic）

## 環境構成

| 環境 | URL | ブランチ | autoDeploy |
|------|-----|---------|-----------|
| SIT | https://logic-sit.onrender.com | develop | on |
| 本番 | https://logic-u5wn.onrender.com | main | off |

## 既知の技術課題（2026-04-18）

- `android/` フォルダ未生成（Mac上で npx cap add android が必要）
- Google認証未実装（Supabase Google OAuth設定から着手）
- SMTP未設定（メール通知が動かない）
- Stripe本番コンプライアンス3件未対応

## コーディング規約

- 画面ファイル: `src/screens/FooScreen.tsx`（フラット構造）
- アイコン: `src/icons/index.tsx`（SVG）のみ使用。絵文字禁止
- CSS: カスタムプロパティ（vars）のみ。Tailwind/shadcn禁止
- i18n: `src/i18n.ts` に ja/en 両キー必須

---

## UIリデザイン レビュー（2026-04-18）

### CTO意見：UI_REDESIGN_PROPOSAL.md への回答

**工数見積もり（現実的に修正）**
- Phase 1（トークン基盤）: 0.5日 → 変数名の変更は `sed` で機械的に処理可能
- Phase 2（HomeScreen）: 2日 → 100箇所のインラインstyle撤廃は思ったより工数かかる
- Phase 3（学習画面）: 1日
- Phase 4（残画面）: 0.5日
- 合計: 約4日（現実的には5日）

**技術的リスク**
1. **既存CSSとの競合**: `tokens.css` のリファクタで変数名が変わると、`index.css`内のハードコード値と衝突する可能性。移行期間は旧変数にaliasを貼る
2. **インラインstyle撤廃の副作用**: 動的なstyle（色や幅の計算）はクラスで代替できないケースがある。`data-state` attributeパターンを使う
3. **デスクトップ/モバイル両対応**: HomeScreenはモバイル用・デスクトップ用で2つのreturnが分かれている。リデザイン時に統一するか検討

**推奨実装順序**
1. まず `Screen.tsx` `Section.tsx` `Stack.tsx` だけ作る（影響範囲ゼロ）
2. 新コンポーネントを使って HomeScreen を新規で書き直す（既存は残したままブランチ切る）
3. ビルドが通ったら既存を置き換え
4. フェーズごとに develop push → SIT確認 → 次フェーズ

**`data-state` パターン（動的styleの代替）**
```tsx
// Before（インラインstyle）
<button style={{ background: isSelected ? '#EEF2FE' : '#FFF' }}>

// After（CSS + data-state）
<button data-selected={isSelected}>
// CSS: button[data-selected="true"] { background: var(--color-action-surface); }
```
