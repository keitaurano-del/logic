#!/usr/bin/env python3
from PIL import Image, ImageDraw
import os

# Create app icon based on reference design
# L character made thicker
# Size: 512×512px

width = height = 512

# Create image with transparent background
img = Image.new('RGBA', (width, height), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)

# Colors
primary_accent = (108, 142, 245)  # #6C8EF5 (Slate Blue)
secondary_accent = (0, 212, 255)  # #00D4FF (Cyan)
dark_bg = (26, 31, 46)  # #1A1F2E

center_x, center_y = width // 2, height // 2

# Draw circular background
draw.ellipse(
    [center_x - 220, center_y - 220, center_x + 220, center_y + 220],
    fill=primary_accent,
    outline=None
)

# Inner dark circle
draw.ellipse(
    [center_x - 210, center_y - 210, center_x + 210, center_y + 210],
    fill=dark_bg,
    outline=None
)

# Draw thick "L" character
# Vertical part - THICKER
l_x = center_x - 65
l_y = center_y - 85
l_width = 60  # Much thicker than before
l_height = 170

# Vertical bar
draw.rectangle(
    [l_x, l_y, l_x + l_width, l_y + l_height],
    fill=primary_accent
)

# Horizontal bar - THICKER
l_horizontal_height = 60  # Thicker
draw.rectangle(
    [l_x, l_y + l_height - l_horizontal_height, l_x + 110, l_y + l_height],
    fill=secondary_accent
)

# Smooth corner with rounded effect
corner_x = l_x + l_width
corner_y = l_y + l_height - l_horizontal_height
draw.ellipse(
    [corner_x - 20, corner_y - 20, corner_x + 20, corner_y + 20],
    fill=secondary_accent
)

# Save as PNG
output_path = "/home/work/.openclaw/workspace/logic/play_store_assets/app_icon_512.png"
img.save(output_path, "PNG", quality=95)

file_size = os.path.getsize(output_path)
file_size_mb = file_size / (1024 * 1024)

print(f"✅ App icon created (L character thicker)")
print(f"   Path: {output_path}")
print(f"   Size: 512×512 pixels")
print(f"   Vertical bar width: 60px (thicker)")
print(f"   Horizontal bar height: 60px (thicker)")
print(f"   File size: {file_size_mb:.3f} MB")
