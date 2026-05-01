#!/usr/bin/env python3
"""
Logic - Feature Graphic Generator
1024 x 500 px (Play Store Banner)
"""

from PIL import Image, ImageDraw, ImageFont
import os

# Canvas
width, height = 1024, 500
bg_color = (26, 31, 46)  # #1A1F2E (Logic dark)
accent_color = (108, 142, 245)  # #6C8EF5 (Slate Blue)
text_color = (255, 255, 255)  # White

img = Image.new('RGB', (width, height), bg_color)
draw = ImageDraw.Draw(img)

# Simple shapes for visual appeal (left side)
# Gradient area - left 60%
for x in range(0, int(width * 0.6)):
    # Gradient from dark to slightly lighter
    ratio = x / (width * 0.6)
    r = int(26 + (50 - 26) * ratio)
    g = int(31 + (60 - 31) * ratio)
    b = int(46 + (80 - 46) * ratio)
    draw.line([(x, 0), (x, height)], fill=(r, g, b))

# Accent elements
# Top-left corner accent
draw.rectangle([0, 0, 150, 150], outline=accent_color, width=3)

# Bottom-right corner accent (right side)
draw.rectangle([width - 150, height - 150, width, height], outline=accent_color, width=3)

# Add circles (nodes)
circle_positions = [
    (200, 120, 40),
    (400, 300, 50),
    (600, 150, 35),
]
for x, y, r in circle_positions:
    draw.ellipse([x - r, y - r, x + r, y + r], outline=accent_color, width=2)

# Right side: Text area
text_x_start = int(width * 0.55)

# Main heading
try:
    # Try to load system font
    heading_font = ImageFont.truetype("/usr/share/fonts/truetype/noto/NotoSansCJK-Regular.ttc", 48, index=1)
    body_font = ImageFont.truetype("/usr/share/fonts/truetype/noto/NotoSansCJK-Regular.ttc", 32, index=1)
except Exception as e:
    print(f"Font loading failed: {e}, using default")
    heading_font = ImageFont.load_default()
    body_font = ImageFont.load_default()

# Heading: "毎日3分で"
heading_text = "毎日3分で"
bbox = draw.textbbox((0, 0), heading_text, font=heading_font)
text_width = bbox[2] - bbox[0]
heading_y = 80
draw.text(
    (text_x_start + (width - text_x_start - text_width) // 2, heading_y),
    heading_text,
    fill=text_color,
    font=heading_font
)

# Subheading: "論理的思考を鍛える"
subheading_text = "論理的思考を鍛える"
bbox = draw.textbbox((0, 0), subheading_text, font=body_font)
text_width = bbox[2] - bbox[0]
subheading_y = 160
draw.text(
    (text_x_start + (width - text_x_start - text_width) // 2, subheading_y),
    subheading_text,
    fill=accent_color,
    font=body_font
)

# Tagline: "ビジネス現場で使える思考スキル"
tagline_text = "ビジネス現場で使える思考スキル"
small_font_size = 24
try:
    small_font = ImageFont.truetype("/usr/share/fonts/truetype/noto/NotoSansCJK-Regular.ttc", small_font_size, index=1)
except:
    small_font = body_font

bbox = draw.textbbox((0, 0), tagline_text, font=small_font)
text_width = bbox[2] - bbox[0]
tagline_y = 280
draw.text(
    (text_x_start + (width - text_x_start - text_width) // 2, tagline_y),
    tagline_text,
    fill=(200, 200, 200),  # Light gray
    font=small_font
)

# Bottom CTA: "Google Play で今すぐダウンロード"
cta_text = "Google Play で"
cta2_text = "今すぐダウンロード"
cta_font_size = 20
try:
    cta_font = ImageFont.truetype("/usr/share/fonts/truetype/noto/NotoSansCJK-Regular.ttc", cta_font_size, index=1)
except:
    cta_font = small_font

bbox = draw.textbbox((0, 0), cta_text, font=cta_font)
text_width = bbox[2] - bbox[0]
cta_y = 380
draw.text(
    (text_x_start + (width - text_x_start - text_width) // 2, cta_y),
    cta_text,
    fill=accent_color,
    font=cta_font
)

bbox = draw.textbbox((0, 0), cta2_text, font=cta_font)
text_width = bbox[2] - bbox[0]
cta_y2 = 415
draw.text(
    (text_x_start + (width - text_x_start - text_width) // 2, cta_y2),
    cta2_text,
    fill=accent_color,
    font=cta_font
)

# Save
output_path = "/home/work/.openclaw/workspace/logic/play_store_assets/feature_graphic_1024x500.png"
img.save(output_path, "PNG")
print(f"✅ Feature Graphic created: {output_path}")
print(f"   Size: 1024 x 500 px")
