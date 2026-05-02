#!/usr/bin/env python3
"""
Play Store用スクリーンショット生成スクリプト
Pillow でモックアップを直接描画する（ブラウザに依存しない）
"""
from PIL import Image, ImageDraw, ImageFont
import os

OUTPUT_DIR = os.path.dirname(os.path.abspath(__file__)) + "/screenshots"
os.makedirs(OUTPUT_DIR, exist_ok=True)

W, H = 1080, 1920
BG_DARK = (15, 18, 32)
BG_CARD = (26, 31, 48)
ACCENT = (108, 142, 245)
ACCENT2 = (99, 202, 183)
TEXT = (255, 255, 255)
TEXT2 = (160, 170, 200)
TEXT3 = (100, 110, 140)
WARM = (244, 162, 97)
RED = (255, 77, 109)

def make_base(draw, bg=BG_DARK):
    draw.rectangle([0, 0, W, H], fill=bg)

def rounded_rect(draw, xy, fill, radius=24):
    x0, y0, x1, y1 = xy
    draw.rounded_rectangle([x0, y0, x1, y1], radius=radius, fill=fill)

def draw_bottom_nav(draw, active="home"):
    nav_h = 120
    nav_y = H - nav_h
    draw.rectangle([0, nav_y, W, H], fill=(20, 24, 40))
    draw.line([0, nav_y, W, nav_y], fill=(50, 60, 90), width=1)
    
    tabs = [
        ("ホーム", "home"),
        ("トレーニング", "training"),
        ("ランキング", "ranking"),
        ("プロフィール", "profile"),
    ]
    tab_w = W // len(tabs)
    for i, (label, key) in enumerate(tabs):
        cx = tab_w * i + tab_w // 2
        color = ACCENT if key == active else TEXT3
        # シンプルな丸でアイコン代替
        draw.ellipse([cx-18, nav_y+18, cx+18, nav_y+54], fill=color)
        # ラベル（フォントなしで省略）

def try_font(size):
    """フォント取得（なければデフォルト）"""
    paths = [
        "/usr/share/fonts/opentype/noto/NotoSansCJK-Regular.ttc",
        "/usr/share/fonts/truetype/noto/NotoSansCJK-Regular.ttc",
        "/usr/share/fonts/noto-cjk/NotoSansCJK-Regular.ttc",
    ]
    for p in paths:
        if os.path.exists(p):
            try:
                return ImageFont.truetype(p, size)
            except:
                pass
    return ImageFont.load_default()

def text_center(draw, text, y, font, fill=TEXT, max_w=W-80):
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    x = (W - tw) // 2
    draw.text((x, y), text, font=font, fill=fill)

print("フォント確認中...")
f32 = try_font(42)
f24 = try_font(34)
f18 = try_font(28)
f14 = try_font(22)
f12 = try_font(18)
print("フォント準備OK")

# ───────────────────────────────────────────
# 1. ホーム画面
# ───────────────────────────────────────────
def gen_home():
    img = Image.new("RGB", (W, H), BG_DARK)
    d = ImageDraw.Draw(img)
    
    # ステータスバー
    d.rectangle([0, 0, W, 80], fill=(10, 13, 26))
    d.text((60, 24), "Logic.", font=f24, fill=TEXT)
    
    # Hero Card（グラデーション風）
    rounded_rect(d, [40, 100, W-40, 520], fill=(30, 45, 90), radius=32)
    d.text((80, 140), "今日のフェルミ問題", font=f18, fill=ACCENT2)
    d.text((80, 195), "日本のコンビニの数は", font=f32, fill=TEXT)
    d.text((80, 255), "何店舗？", font=f32, fill=TEXT)
    rounded_rect(d, [80, 360, W-80, 430], fill=ACCENT, radius=20)
    text_center(d, "今日の1問を解く", 374, f18)
    
    # 診断カード
    rounded_rect(d, [40, 540, W-40, 700], fill=BG_CARD, radius=24)
    d.ellipse([70, 575, 130, 635], fill=(*ACCENT, 40))
    d.text((150, 580), "あなたの実力を診断しましょう", font=f18, fill=TEXT)
    d.text((150, 625), "8問・約3分で現在の実力がわかります", font=f14, fill=TEXT2)
    rounded_rect(d, [70, 650, 420, 695], fill=ACCENT, radius=16)
    text_center(d, "診断を受ける", 658, f14)
    
    # AIカード
    rounded_rect(d, [40, 720, W-40, 920], fill=BG_CARD, radius=24)
    d.text((80, 760), "AIで自分だけの問題を作る", font=f24, fill=TEXT)
    d.text((80, 815), "テーマ別のオリジナル問題で練習", font=f14, fill=TEXT2)
    d.text((80, 855), "BETA", font=f12, fill=ACCENT)
    
    # BottomNav
    draw_bottom_nav(d, "home")
    
    img.save(f"{OUTPUT_DIR}/01_home.png")
    print("✅ 01_home.png")

# ───────────────────────────────────────────
# 2. トレーニングメニュー
# ───────────────────────────────────────────
def gen_training():
    img = Image.new("RGB", (W, H), BG_DARK)
    d = ImageDraw.Draw(img)
    
    d.rectangle([0, 0, W, 80], fill=(10, 13, 26))
    d.text((60, 24), "トレーニング", font=f24, fill=TEXT)
    d.text((60, 100), "今日、どのスキルを鍛える？", font=f18, fill=TEXT2)
    
    categories = [
        ("ロジカルシンキング", "クリティカルシンキング"),
        ("仮説思考", "課題設定"),
        ("デザインシンキング", "ラテラルシンキング"),
        ("アナロジー思考", "システムシンキング"),
        ("提案・伝える技術", "提案書作成"),
        ("哲学・思考の原理", "クライアントワーク"),
        ("ケース面接", "フェルミ推定"),
    ]
    
    card_w = (W - 100) // 2
    card_h = 140
    start_y = 160
    gap = 20
    
    for row, (left, right) in enumerate(categories):
        y = start_y + row * (card_h + gap)
        # 左カード
        rounded_rect(d, [40, y, 40+card_w, y+card_h], fill=BG_CARD, radius=20)
        d.text((60, y+20), left[:7], font=f14, fill=ACCENT)
        d.text((60, y+55), left[7:] if len(left)>7 else "", font=f14, fill=TEXT)
        # 右カード
        rounded_rect(d, [60+card_w, y, 60+card_w*2, y+card_h], fill=BG_CARD, radius=20)
        d.text((80+card_w, y+20), right[:7], font=f14, fill=ACCENT)
        d.text((80+card_w, y+55), right[7:] if len(right)>7 else "", font=f14, fill=TEXT)
    
    draw_bottom_nav(d, "training")
    img.save(f"{OUTPUT_DIR}/02_training.png")
    print("✅ 02_training.png")

# ───────────────────────────────────────────
# 3. フェルミ問題
# ───────────────────────────────────────────
def gen_fermi():
    img = Image.new("RGB", (W, H), BG_DARK)
    d = ImageDraw.Draw(img)
    
    d.rectangle([0, 0, W, 80], fill=(10, 13, 26))
    d.text((60, 24), "今日のフェルミ問題", font=f24, fill=TEXT)
    
    rounded_rect(d, [40, 110, W-40, 420], fill=BG_CARD, radius=32)
    d.text((80, 155), "難易度 ★★★", font=f14, fill=ACCENT)
    d.text((80, 210), "日本のコンビニの", font=f32, fill=TEXT)
    d.text((80, 270), "総数は何店舗？", font=f32, fill=TEXT)
    d.text((80, 340), "#流通 #市場規模 #フェルミ推定", font=f12, fill=TEXT3)
    
    # 入力エリア
    rounded_rect(d, [40, 440, W-40, 700], fill=BG_CARD, radius=24)
    d.text((80, 470), "あなたの推定プロセス...", font=f18, fill=TEXT3)
    
    # ボタン
    rounded_rect(d, [40, 720, 480, 790], fill=(30, 45, 70), radius=20)
    text_center(d, "参考データを確認する", 737, f14)
    
    rounded_rect(d, [520, 720, W-40, 790], fill=(30, 45, 70), radius=20)
    text_center(d, "ヒントを聞く", 737, f14)
    
    rounded_rect(d, [40, 810, W-40, 900], fill=ACCENT, radius=24)
    text_center(d, "回答する", 838, f24)
    
    draw_bottom_nav(d, "home")
    img.save(f"{OUTPUT_DIR}/03_fermi.png")
    print("✅ 03_fermi.png")

# ───────────────────────────────────────────
# 4. ランキング
# ───────────────────────────────────────────
def gen_ranking():
    img = Image.new("RGB", (W, H), BG_DARK)
    d = ImageDraw.Draw(img)
    
    d.rectangle([0, 0, W, 80], fill=(10, 13, 26))
    d.text((60, 24), "ランキング", font=f24, fill=TEXT)
    
    # TOP3
    podium_data = [
        (2, "田中 花子", "2,480 pt", 600, H//2 - 180),
        (1, "山田 太郎", "3,250 pt", W//2 - 80, H//2 - 280),
        (3, "鈴木 一郎", "1,920 pt", W - 280, H//2 - 120),
    ]
    
    colors_podium = {1: (255, 215, 0), 2: (192, 192, 192), 3: (205, 133, 63)}
    
    for rank, name, score, cx, cy in podium_data:
        c = colors_podium[rank]
        d.ellipse([cx-60, cy-60, cx+60, cy+60], fill=BG_CARD, outline=c, width=4)
        d.text((cx-20, cy-20), str(rank), font=f32, fill=c)
        d.text((cx-80, cy+75), name[:4], font=f14, fill=TEXT)
        d.text((cx-70, cy+110), score, font=f12, fill=ACCENT)
    
    # リスト
    list_start = H // 2 + 80
    for i, (name, score) in enumerate([
        ("佐藤 美咲", "1,580 pt"),
        ("伊藤 健二", "1,340 pt"),
        ("渡辺 さくら", "1,120 pt"),
        ("中村 拓也", "980 pt"),
        ("小林 由美", "870 pt"),
    ]):
        y = list_start + i * 100
        rounded_rect(d, [40, y, W-40, y+85], fill=BG_CARD, radius=20)
        d.text((80, y+22), f"{i+4}位  {name}", font=f18, fill=TEXT)
        d.text((W-200, y+22), score, font=f18, fill=ACCENT)
    
    draw_bottom_nav(d, "ranking")
    img.save(f"{OUTPUT_DIR}/04_ranking.png")
    print("✅ 04_ranking.png")

# ───────────────────────────────────────────
# 5. プロフィール
# ───────────────────────────────────────────
def gen_profile():
    img = Image.new("RGB", (W, H), BG_DARK)
    d = ImageDraw.Draw(img)
    
    d.rectangle([0, 0, W, 80], fill=(10, 13, 26))
    d.text((60, 24), "プロフィール", font=f24, fill=TEXT)
    
    # アバター
    d.ellipse([W//2-80, 110, W//2+80, 270], fill=ACCENT)
    d.text((W//2-20, 165), "U", font=f32, fill=TEXT)
    text_center(d, "ユーザー名", 300, f24)
    text_center(d, "user@example.com", 355, f14, fill=TEXT2)
    
    # XPバッジ
    rounded_rect(d, [W//2-120, 400, W//2+120, 460], fill=(*ACCENT, 30), radius=20)
    text_center(d, "⚡ 1,250 XP", 412, f18)
    
    # プランバッジ
    rounded_rect(d, [40, 490, W-40, 570], fill=(30, 50, 30), radius=20)
    d.text((80, 510), "スタンダードプラン", font=f18, fill=(100, 220, 100))
    d.text((80, 548), "Google Playで管理", font=f14, fill=TEXT2)
    
    # メニュー
    menus = ["料金プランを変更", "学習統計", "通知設定", "お問い合わせ", "ログアウト"]
    for i, m in enumerate(menus):
        y = 600 + i * 100
        rounded_rect(d, [40, y, W-40, y+85], fill=BG_CARD, radius=20)
        d.text((80, y+25), m, font=f18, fill=TEXT)
        d.text((W-80, y+28), "›", font=f24, fill=TEXT3)
    
    draw_bottom_nav(d, "profile")
    img.save(f"{OUTPUT_DIR}/05_profile.png")
    print("✅ 05_profile.png")

# ───────────────────────────────────────────
# 6. コース一覧（ロジカルシンキング）
# ───────────────────────────────────────────
def gen_course():
    img = Image.new("RGB", (W, H), BG_DARK)
    d = ImageDraw.Draw(img)
    
    d.rectangle([0, 0, W, 80], fill=(10, 13, 26))
    d.text((60, 24), "ロジカルシンキング", font=f24, fill=TEXT)
    d.text((60, 85), "今日、どのスキルを鍛える？", font=f14, fill=TEXT2)
    
    courses = [
        ("ロジカルに考えて、整理する", "初級", 2, 5),
        ("論理を組み立て、相手を動かす", "中級", 0, 5),
    ]
    
    y = 140
    for title, level, done, total in courses:
        rounded_rect(d, [40, y, W-40, y+340], fill=BG_CARD, radius=28)
        # ラベル
        rounded_rect(d, [70, y+20, 230, y+60], fill=(30,40,70), radius=12)
        d.text((85, y+28), "ロジカルシンキング", font=f12, fill=TEXT3)
        rounded_rect(d, [245, y+20, 340, y+60], fill=(*ACCENT,40), radius=12)
        d.text((260, y+28), level, font=f12, fill=ACCENT)
        # タイトル
        d.text((70, y+80), title[:10], font=f24, fill=TEXT)
        d.text((70, y+130), title[10:], font=f24, fill=TEXT)
        # プログレスバー
        d.text((70, y+195), f"{done}/{total} レッスン完了", font=f14, fill=TEXT2)
        rounded_rect(d, [70, y+240, W-70, y+260], fill=(40,50,80), radius=8)
        if done > 0:
            rounded_rect(d, [70, y+240, 70+int((W-140)*(done/total)), y+260], fill=ACCENT, radius=8)
        # レッスン一覧
        for li in range(min(3, total)):
            ly = y + 280 + li * 0
            pass  # 省略
        y += 360 + 24
    
    draw_bottom_nav(d, "training")
    img.save(f"{OUTPUT_DIR}/06_course.png")
    print("✅ 06_course.png")

# ───────────────────────────────────────────
# 7. 料金プラン
# ───────────────────────────────────────────
def gen_pricing():
    img = Image.new("RGB", (W, H), BG_DARK)
    d = ImageDraw.Draw(img)
    
    d.rectangle([0, 0, W, 80], fill=(10, 13, 26))
    d.text((60, 24), "料金プラン", font=f24, fill=TEXT)
    
    # キャンペーンバナー
    rounded_rect(d, [40, 110, W-40, 220], fill=(180,40,80), radius=24)
    d.text((80, 130), "期間限定キャンペーン中！", font=f18, fill=TEXT)
    d.text((80, 175), "スタンダード年払いが今だけ ¥1,980", font=f14, fill=TEXT)
    
    # タブ
    tab_w = (W - 80) // 3
    tabs = [("FREE", TEXT3, BG_CARD), ("STD", ACCENT, (30,45,90)), ("PRE", WARM, BG_CARD)]
    for i, (label, color, bg) in enumerate(tabs):
        tx = 40 + i * tab_w
        rounded_rect(d, [tx, 240, tx+tab_w-10, 310], fill=bg, radius=16)
        text_center(d, label, 260, f18)
    
    # プラン内容（STD選択中）
    rounded_rect(d, [40, 330, W-40, 650], fill=BG_CARD, radius=28)
    text_center(d, "¥390", 370, f32, fill=ACCENT)
    text_center(d, "/月", 430, f14, fill=TEXT2)
    text_center(d, "年払い ¥2,730（5ヶ月お得）", 480, f14, fill=ACCENT)
    
    features = ["全レッスン", "AI問題生成 日3問", "ロールプレイ 月5回", "フェルミ問題 日5問"]
    for i, feat in enumerate(features):
        y = 540 + i * 0
        pass
    
    # CTA
    rounded_rect(d, [40, 670, W-40, 760], fill=ACCENT, radius=24)
    text_center(d, "スタンダードプランではじめる", 697, f24)
    rounded_rect(d, [40, 780, W-40, 860], fill=(0,0,0,0), radius=24)
    d.rounded_rectangle([40, 780, W-40, 860], radius=24, outline=WARM, width=3)
    text_center(d, "プレミアムプランではじめる", 807, f24, fill=WARM)
    text_center(d, "無料で始める", 900, f14, fill=TEXT3)
    
    draw_bottom_nav(d, "profile")
    img.save(f"{OUTPUT_DIR}/07_pricing.png")
    print("✅ 07_pricing.png")


if __name__ == "__main__":
    gen_home()
    gen_training()
    gen_fermi()
    gen_ranking()
    gen_profile()
    gen_course()
    gen_pricing()
    print(f"\n✅ 全7枚生成完了！ → {OUTPUT_DIR}")
