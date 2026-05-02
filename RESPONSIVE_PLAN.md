# Responsive Design 対応 - 実装計画

## 📋 タスク概要

Logic アプリを **Responsive Design** に対応させる

### 対応デバイス
- **スマートフォン** (360px - 768px)
- **7インチタブレット** (768px - 1024px)
- **10インチタブレット** (1024px+)

---

## 🎯 実装方針

### 1. **CSS Breakpoints 定義**
```css
/* Mobile First */
--bp-sm: 360px  /* スマートフォン */
--bp-md: 768px  /* タブレット（7インチ） */
--bp-lg: 1024px /* タブレット（10インチ） */
--bp-xl: 1280px /* デスクトップ */
```

### 2. **レイアウト調整対象**

#### ホーム画面 (HomeScreenV3.tsx)
- **スマートフォン**: 1列（現行通り）
- **タブレット**: 2列グリッド（レッスンカード）
- **グリッド**: `gridTemplateColumns: repeat(auto-fit, minmax(200px, 1fr))`

#### レッスン画面 (Lesson.tsx)
- **スマートフォン**: フルスクリーン
- **タブレット**: サイドバー + コンテンツ（2列）
- **最大幅**: 1200px（中央寄せ）

#### ナビゲーション (AppShell.tsx)
- **スマートフォン**: ボトムタブ（現行）
- **タブレット**: サイドバー OR トップナビ
- **判定**: `max-width: 768px ? bottom : side`

### 3. **メディアクエリの追加場所**

**優先度順:**
1. `src/styles/tokensV3.ts` - ブレークポイント定義
2. `src/screens/HomeScreenV3.tsx` - ホーム画面レイアウト
3. `src/screens/Lesson.tsx` - レッスン画面
4. `src/components/AppShell.tsx` - ナビゲーション
5. `src/screens/ProfileScreenV3.tsx` - プロフィール画面

---

## 💾 実装ファイル

### 新規作成
- `src/styles/responsive.ts` - レスポンシブ定義・Hook

### 修正対象
- `src/styles/tokensV3.ts` (ブレークポイント追加)
- `src/screens/HomeScreenV3.tsx` (2列グリッド)
- `src/screens/LessonGrid.tsx` (グリッド対応)
- `src/components/AppShell.tsx` (ナビゲーション対応)

---

## 🛠️ 実装の流れ

1. ✅ ブレークポイント定義
2. ✅ useWindowSize Hook 作成
3. ✅ ホーム画面の 2列表示 (タブレット対応)
4. ✅ レッスン画面の 2列表示 (タブレット対応)
5. ✅ AppShell ナビゲーション対応
6. ✅ SIT テスト
7. ✅ QA/Reviewer 確認

---

## 📐 CSS 設計

**CSS-in-JS (inline styles)** を使用（現行通り）

例:
```typescript
const isTablet = windowWidth >= 768;

<div style={{
  display: isTablet ? 'grid' : 'flex',
  gridTemplateColumns: isTablet ? 'repeat(2, 1fr)' : undefined,
  flexDirection: isTablet ? undefined : 'column',
  gap: 16,
}}>
  {/* content */}
</div>
```

---

## 📱 レスポンシブ仕様（案）

### ホーム画面
| デバイス | 幅 | レッスン表示 | グリッド |
|---------|-----|----------|---------|
| スマートフォン | <768px | 1列 | 1列 |
| 7インチタブレット | 768px-1024px | 2列 | 2列 |
| 10インチタブレット | >1024px | 3列 | 3列 + サイドバー可 |

---

## ⏳ 今後の流れ

1. 実装開始
2. developブランチへ push
3. SIT テスト
4. QA/Reviewer 確認
5. Keita-san 承認後、本番デプロイ
