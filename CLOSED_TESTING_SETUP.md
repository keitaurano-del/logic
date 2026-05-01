# クローズドテスト (SCRUM-249/250) セットアップ

## 概要
Logic アプリの Play Store リリース前クローズドテストの実施要領

## クローズドテスト対象

### SCRUM-249: 基本機能クローズドテスト
**テスト対象:**
- ホーム画面表示 (デイリーフェルミ、レッスンカテゴリ)
- ロジカルシンキングレッスン (演繹法・帰納法など)
- フェルミ推定問題出題・採点
- ユーザープロフィール・ストリーク表示
- Google OAuth ログイン
- トライアル 7日間表示

**テスト期間:** Keita-san 指示後、実施

**テスト方法:**
1. Play Console で Internal Testing Track へビルドアップロード
2. テスターを招待 (keita.urano@gmail.com など)
3. Google Play で「Logic」を検索 → インストール
4. 各機能を実機で 確認

---

### SCRUM-250: メディアテスト
**テスト対象:**
- スクリーンショット表示品質 (1080×1920px)
- 説明文・キャプション 日本語表示
- アプリアイコン表示 (512×512px)
- フィーチャーグラフィック (1024×500px)

**テスト方法:**
1. Play Console で メディア画面を確認
2. アプリ説明文が正常に表示されるか確認
3. スクリーンショットが正しいアスペクト比で表示されるか確認

---

## Play Console 設定手順

### 1. Internal Testing Track にアップロード

```bash
# ビルド確認
ls -la /home/work/.openclaw/workspace/logic/android/app/build/outputs/bundle/
```

**手動でアップロード:**
1. Play Console → Logic アプリ
2. 左メニュー: Release → Internal testing
3. "新しいリリースを作成" ボタン
4. Android App Bundle (`.aab` ファイル) をアップロード
5. リリースノート記入: 「クローズドテスト v1.0」
6. 確認 → 保存

### 2. テスターを招待

```
Play Console → Internal testing → テスターを追加
招待メール: keita.urano@gmail.com
```

### 3. テスター側: アプリをインストール

1. 招待メールを受け取る
2. Google Play ストアで「Logic」を検索
3. インストール → ログイン (Google OAuth)
4. 各機能をテスト

---

## チェックリスト (SCRUM-249)

- [ ] UI改善 Reviewer APPROVED 確認
- [ ] Android App Bundle (.aab) ビルド完了
- [ ] Play Console Internal Testing Track にアップロード
- [ ] テスター招待メール送信完了
- [ ] テスター側: アプリインストール完了
- [ ] ホーム画面: フェルミ・レッスンカテゴリ 表示確認
- [ ] ログイン: Google OAuth 動作確認
- [ ] トライアル 7日間: 正常表示確認
- [ ] ストリーク表示: 正常確認
- [ ] テスト報告: Keita-san に提出

---

## チェックリスト (SCRUM-250)

- [ ] スクリーンショット (7枚) 1080×1920px 確認
- [ ] Play Console メディア画面 へアップロード
- [ ] スクリーンショット表示品質: 正常確認
- [ ] アプリアイコン 512×512px: 表示確認
- [ ] フィーチャーグラフィック 1024×500px: 表示確認
- [ ] 説明文: 日本語で正常表示確認
- [ ] メディアテスト報告: Keita-san に提出

---

## 次ステップ

1. Reviewer APPROVED → クローズドテスト開始
2. テスト完了 → SCRUM-253 (製品版申請) へ移行
3. 本番リリース: Play Store 認可待ち (通常 1-3時間)

**実施予定:**
- SCRUM-249/250 完了後 → Keita-san に報告
- 本番申請判断: Keita-san 指示待ち
