# Play Store グラフィックアセット 仕様書

## 必要な4つのグラフィック

### 1. アプリアイコン (512×512px)
- **形式**: PNG（背景透明）
- **サイズ**: 512×512 px
- **色**: Slate Blue パレット
  - BG/Circle: #1A1F2E (dark bg)
  - Accent: #6C8EF5 (primary accent)
  - Secondary: #00D4FF (cyan)
- **デザイン要素**:
  - Logic ロゴテキスト
  - 論理的思考を表す幾何学的シンボル（ツリー、ピラミッド、または相互接続ノード）
  - 虹色グラデーション（オプション）
- **スタイル**: モダン、ミニマル、プロフェッショナル

### 2. フィーチャーグラフィック (1024×500px)
- **形式**: PNG または JPG
- **サイズ**: 1024×500 px
- **レイアウト**:
  - 左側（30%）: Logic アプリの視覚的表現またはロゴ
  - 右側（70%）: テキストメッセージ
- **テキスト内容**:
  - 行1: 「Logic」（大きく、ブランドカラー）
  - 行2: 「毎日3分で」（中サイズ、アクセントカラー）
  - 行3: 「論理的思考を鍛える」（大きく、白色）
- **背景**: グラデーション（#1A1F2E → #2D3A52）
- **アクセント**: Slate Blue / Cyan グラデーション

### 3. 携帯電話版スクリーンショット (1080×1920px)
- **形式**: PNG
- **表示内容**:
  - Logic ホーム画面
  - デイリーチャレンジ表示
  - レッスンカテゴリ
  - ストリーク・進捗表示
  - ボトムナビゲーション（ホーム・レッスン・ランキング・プロフィール）
- **取得方法**: SIT https://logic-sit.onrender.com をブラウザで 1080×1920px 表示でスクリーンショット

### 4. タブレット版スクリーンショット（7インチ & 10インチ）
- **7インチ版**: 1440×1600px
- **10インチ版**: 2560×1600px
- **表示内容**: 携帯電話版と同じ（レイアウトは自動スケール）
- **取得方法**: SIT をブラウザで指定サイズで表示してスクリーンショット

---

## 納品形式

すべてのファイルを以下に保存：
```
/home/work/.openclaw/workspace/logic/play_store_assets/
  ├── app_icon_512.png
  ├── feature_graphic_1024x500.png
  ├── screenshot_phone_1080x1920.png
  ├── screenshot_tablet_7inch_1440x1600.png
  └── screenshot_tablet_10inch_2560x1600.png
```

---

## Play Console への登録手順

1. **グラフィック** セクション
   - アプリアイコン: `app_icon_512.png` をアップロード
   - フィーチャーグラフィック: `feature_graphic_1024x500.png` をアップロード

2. **電話** セクション
   - 携帯電話版スクリーンショット: `screenshot_phone_1080x1920.png` をアップロード

3. **タブレット** セクション
   - 7インチ版: `screenshot_tablet_7inch_1440x1600.png` をアップロード

4. **10 インチ タブレット版** セクション
   - 10インチ版: `screenshot_tablet_10inch_2560x1600.png` をアップロード

---

## デザインガイドライン

- **カラーパレット**:
  - Background: #1A1F2E (Dark Navy)
  - Accent Primary: #6C8EF5 (Slate Blue)
  - Accent Secondary: #00D4FF (Cyan)
  - Text Primary: #FFFFFF (White)
  - Text Secondary: #A0B0D8 (Light Gray)

- **フォント**: San-serif（Arial, Helvetica 推奨）

- **スタイル**: モダン、ミニマリスト、プロフェッショナル

- **グラデーション**: Slate Blue から Cyan へのグラデーションを活用

---

## 次のアクション

1. デザイナーに上記仕様を共有
2. 4つのグラフィックを作成
3. すべてのファイルを `play_store_assets/` に保存
4. Play Console にアップロード
