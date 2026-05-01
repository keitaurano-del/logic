# Keita-san への共有URL・ファイル管理

## 📝 今回のタスク

### 1. 色味調整
- **問題**: Hero card（推奨レッスン）の背景色が濃いティール色で、他の Slate Blue パレットと統一されていない
- **修正**: `linear-gradient(140deg, #1A3A39 0%, #2C5856 100%)` → Slate Blue グラデーションに変更
- **ファイル**: `/home/work/.openclaw/workspace/logic/src/screens/HomeScreenV3.tsx` 
  - 121行目付近の Hero カード背景色グラデーション

### 2. レッスン表示改善
- **現状**: レッスン一覧が1つずつ縦表示
- **改善案**: 
  - 2つずつ表示（グリッド）
  - カテゴリごとに分け隔表示（展開可能）
  - ファイル修正予定

## 📂 関連ファイル

```
/home/work/.openclaw/workspace/logic/src/screens/HomeScreenV3.tsx
├─ 119行目: Hero Recommend カード（濃いティール色 ← 修正対象）
└─ 180-200行: CourseCard コンポーネント（色統一が必要）

/home/work/.openclaw/workspace/logic/src/styles/tokensV3.ts
├─ bg: '#1A1F2E' (背景)
├─ card: '#252C40' (カード)
├─ accent: '#6C8EF5' (Slate Blue)
└─ warm: '#F4A261' (温かみのあるアクセント)
```

## ✅ チェックリスト

- [ ] Hero カード背景色を Slate Blue グラデーションに統一
- [ ] レッスンカードを2列グリッド表示に変更
- [ ] カテゴリ分け表示実装
- [ ] SIT でブラウザ確認
- [ ] コミット

---

**作業開始**
