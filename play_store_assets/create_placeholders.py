#!/usr/bin/env python3
from PIL import Image, ImageDraw, ImageFont
import os

# Create placeholder screenshots with text
sizes = [
    ("screenshot_phone_1080x1920.png", 1080, 1920, "Logic\nPhone Screenshot\n1080×1920px"),
    ("screenshot_tablet_7inch_1440x1600.png", 1440, 1600, "Logic\n7\" Tablet\n1440×1600px"),
    ("screenshot_tablet_10inch_2560x1600.png", 2560, 1600, "Logic\n10\" Tablet\n2560×1600px")
]

for filename, width, height, text in sizes:
    # Create image with Logic brand colors
    img = Image.new('RGB', (width, height), color=(26, 31, 46))  # #1A1F2E
    draw = ImageDraw.Draw(img)
    
    # Try to load a font, fallback to default
    try:
        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 100)
    except:
        font = ImageFont.load_default()
    
    # Center text
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    x = (width - text_width) // 2
    y = (height - text_height) // 2
    
    text_color = (108, 142, 245)  # #6C8EF5
    draw.text((x, y), text, fill=text_color, font=font)
    img.save(filename)
    print(f"Created: {filename} ({width}×{height}px)")

print("\nPlaceholder images created.")
print("Note: Replace these with actual screenshots from SIT https://logic-sit.onrender.com")
