# プロダクト設計たたき台
Apollo (CEO) 提案 — 2026-04-29

---

## SCRUM-181: ログイン必須前提の導線見直し

### 現状
- ログインなしでほぼ全機能が使える
- 「ゲスト」状態でもレッスン・AI問題生成・ロールプレイにアクセス可能
- フォールバック名「ゲスト」で動作

### Apollo提案: ゲートキーパー方式

#### 方針
「使わせてからログインさせる」ではなく「価値を見せてからログインを求める」

#### 導線設計案
```
初回起動
  └→ オンボーディング（スキップ不可）
       └→ 3ステップ: プロダクト価値説明 → 機能紹介 → アカウント作成/スキップ
            ├→ アカウント作成: 全機能解放
            └→ スキップ: 「体験モード」で一部のみ利用可
```

#### 機能制限（体験モード = 未ログイン）
| 機能 | 体験モード | ログイン済み |
|------|-----------|-------------|
| レッスン（初級のみ） | ✅ 3レッスンまで | ✅ 無制限 |
| 1問チャレンジ | ✅ | ✅ |
| AI問題生成 | ❌ → ログイン誘導 | プランによる |
| ロールプレイ | ❌ → ログイン誘導 | プランによる |
| 学習記録保存 | ❌（ローカルのみ） | ✅ クラウド同期 |

#### 実装イメージ
```tsx
// AppV3.tsx でログインゲートを設ける
if (!currentUser && screen.requiresLogin) {
  return <LoginGateScreen onLogin={...} onBack={...} message={screen.gateMessage} />
}
```

#### 受け入れ条件
- [ ] 未ログインでAI問題生成・ロールプレイに入ろうとするとログイン誘導画面が表示される
- [ ] 誘導画面に「今すぐ登録（無料）」ボタン + 「あとで」リンクあり
- [ ] ログイン後、元のページに自動遷移する

---

## SCRUM-182: 料金プラン設計（たたき台）

### Apollo提案: 3プラン構成

#### プラン概要
| 機能 | フリー（無料） | スタンダード（¥980/月） | プレミアム（¥1,980/月） |
|------|-------------|---------------------|---------------------|
| 初級レッスン | ✅ 全件 | ✅ 全件 | ✅ 全件 |
| 中〜上級レッスン | ❌ | ✅ | ✅ |
| 1問チャレンジ | ✅ 毎日1問 | ✅ 無制限 | ✅ 無制限 |
| AI問題生成 | ❌ | ✅ 月50問 | ✅ 月300問 |
| ロールプレイ | ❌ | ✅ 月5回 | ✅ 月無制限 |
| 学習記録 | ✅ 30日 | ✅ 1年 | ✅ 無期限 |
| 偏差値・分析 | ❌ | ✅ | ✅ |

#### 未確定論点（Keita-sanに判断お願いしたい項目）
1. **「フリープランをなくして全プラン有料化」** vs **「フリーあり」**
   - Apollo意見: フリーを残す。ファネルの入口として機能するし、App Storeランキングにも影響する
2. **スタンダードの月額**: ¥980 or ¥780?
   - Apollo意見: ¥980（価値に見合う価格。安すぎるとプレミアムとの差別化が難しい）
3. **1問チャレンジのフリー制限**: 毎日1問 or 週3問?
   - Apollo意見: 毎日1問（継続習慣を作るための核。制限しすぎると離脱率が上がる）
4. **年払い割引**: 2ヶ月分無料（16%割引）で統一

#### 実装変更点
- `subscription.ts`: `isBasicPlan()` 等の関数を追加
- `PricingScreen.tsx`: プランカード3枚表示に更新
- `AppV3.tsx`: 機能ごとのプランゲート条件を更新

---

## SCRUM-183: 決済テスト環境の構築

### Apollo提案: Stripeテストモード整備

#### 現状
- Stripe本番環境は設定済み（VITE_STRIPE_PUBLISHABLE_KEY等）
- テスト用のPrice IDが未設定

#### 整備内容

##### Step 1: Stripeダッシュボードでテスト商品作成
```
テスト Price IDs（Stripeダッシュボードで作成必要）:
- test_standard_monthly: ¥980/月
- test_standard_yearly: ¥9,800/年
- test_premium_monthly: ¥1,980/月
- test_premium_yearly: ¥19,800/年
```

##### Step 2: .env.test追加
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_XXXXXXXX
VITE_STRIPE_STANDARD_MONTHLY_PRICE=price_test_XXXXXXXX
VITE_STRIPE_PREMIUM_MONTHLY_PRICE=price_test_XXXXXXXX
```

##### Step 3: テストカード
```
成功:          4242 4242 4242 4242
認証必要:       4000 0025 0000 3155
残高不足:       4000 0000 0000 9995
期限切れ:       4000 0000 0000 0069
```

##### Step 4: Webhook（ローカルテスト）
```bash
stripe listen --forward-to localhost:3001/api/stripe-webhook
```

#### ブロッカー
- Stripeダッシュボードへのアクセス権が必要（Keita-san）
- テストPrice IDの作成はKeita-sanまたは権限共有が必要

---

## SCRUM-186: フィードバック送信時のJira起票・チーム通知自動化

### Apollo提案: Supabase Edge Function経由で自動化

#### フロー
```
ユーザー送信
  └→ Supabase feedback テーブルに insert（既実装）
       └→ Supabase Edge Function (on-insert trigger)
            ├→ Jira API: issue作成（バグ or 改善提案）
            └→ Teams webhook: 🐛バグ報告 or 💡プロダクト に通知
```

#### Feedback.tsx 改善
```tsx
// 送信フォームに説明文を追加
const CATEGORY_DESCRIPTIONS = {
  'バグ報告': 'どの画面で、どのような問題が発生しましたか？再現手順があれば教えてください',
  '機能追加': 'どんな機能があると嬉しいですか？なぜ必要ですか？',
  'UI改善': 'どの画面のどこが使いにくいですか？',
  'その他': 'お気軽にご記入ください',
}
```

#### Supabase Edge Function (trigger)
```typescript
// supabase/functions/on-feedback-insert/index.ts
import { serve } from 'https://deno.land/std/http/server.ts'

serve(async (req) => {
  const { record } = await req.json()
  
  // Jira起票
  const issueType = record.category === 'バグ報告' ? '10007' : '10008'
  await fetch(`${JIRA_URL}/rest/api/3/issue`, {
    method: 'POST',
    headers: { Authorization: `Basic ${btoa(`${JIRA_EMAIL}:${JIRA_TOKEN}`)}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      fields: {
        project: { key: 'SCRUM' },
        issuetype: { id: issueType },
        summary: `[${record.category}] ${record.message.slice(0, 50)}...`,
        description: { type: 'doc', version: 1, content: [{ type: 'paragraph', content: [{ type: 'text', text: record.message }] }] },
      }
    })
  })
  
  // Teams通知
  const channelId = record.category === 'バグ報告'
    ? '19:a154de427130436e9e58df0a84491e6a@thread.tacv2'  // 🐛バグ報告
    : '19:901b1112f7a94cd29e4e14c7a566e4fd@thread.tacv2'  // 💡プロダクト
  
  await fetch(`${TEAMS_WEBHOOK_URL}`, { /* ... */ })
  
  return new Response('ok')
})
```

#### 実装ステップ
1. `Feedback.tsx` に説明文追加（今すぐできる）
2. Supabase Edge Function作成
3. Supabase webhook（DB trigger）設定
4. Jira API キーをSupabase Secretsに登録

#### ブロッカー
- Supabase Edge Functions有効化（無料プランで利用可能）
- JIra API Tokenをsupabase secretsに登録（Keita-san）

---

## 実装優先順位（Apollo推奨）

| 優先度 | チケット | 理由 |
|--------|---------|------|
| 🔴 即着手 | SCRUM-186（フィードバック文言改善） | フォームへの説明文追加はすぐできる |
| 🔴 即着手 | SCRUM-182（プラン方針確定） | 他チケットに影響するため先に議論 |
| 🟡 Keita-san判断後 | SCRUM-181（ログイン導線） | プラン設計と連動 |
| 🟡 Keita-sanアクション必要 | SCRUM-183（決済テスト） | Stripeダッシュボードアクセス必要 |
| 🟢 中期 | SCRUM-186（Jira起票自動化） | Edge Function実装が必要 |
