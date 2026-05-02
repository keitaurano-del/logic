#!/usr/bin/env python3
from PIL import Image, ImageDraw, ImageFont
import math
import os

# Create Logic app icon with "L" as base
# Based on reference icon, with Logic app colors
# Size: 512×512px

width = height = 512
bg_color = (26, 31, 46)  # #1A1F2E (Dark Navy - no outer black border)

# Create image
img = Image.new('RGBA', (width, height), (0, 0, 0, 0))  # Transparent background
draw = ImageDraw.Draw(img)

# Colors
primary_accent = (108, 142, 245)  # #6C8EF5 (Slate Blue)
secondary_accent = (0, 212, 255)  # #00D4FF (Cyan)
dark_bg = (26, 31, 46)  # #1A1F2E

center_x, center_y = width // 2, height // 2

# Draw circular background with gradient effect
# Outer circle - large
draw.ellipse(
    [center_x - 220, center_y - 220, center_x + 220, center_y + 220],
    fill=primary_accent,
    outline=None
)

# Inner circle - slightly darker
draw.ellipse(
    [center_x - 210, center_y - 210, center_x + 210, center_y + 210],
    fill=dark_bg,
    outline=None
)

# Draw "L" shape using rectangles and curves
# Vertical part of L
l_x = center_x - 50
l_y = center_y - 80
l_width = 40
l_height = 160

# Vertical bar of L
draw.rectangle(
    [l_x, l_y, l_x + l_width, l_y + l_height],
    fill=primary_accent
)

# Horizontal bar of L
l_horizontal_height = 40
draw.rectangle(
    [l_x, l_y + l_height - l_horizontal_height, l_x + 100, l_y + l_height],
    fill=secondary_accent
)

# Add accent circle at the corner of L (intersection point)
corner_x = l_x + l_width
corner_y = l_y + l_height - l_horizontal_height
draw.ellipse(
    [corner_x - 15, corner_y - 15, corner_x + 15, corner_y + 15],
    fill=secondary_accent,
    outline=primary_accent,
    width=2
)

# Add small decorative dots (logic nodes)
dot_radius = 8
# Top right dot
draw.ellipse(
    [center_x + 80 - dot_radius, center_y - 60 - dot_radius, center_x + 80 + dot_radius, center_y - 60 + dot_radius],
    fill=primary_accent
)

# Bottom right dot
draw.ellipse(
    [center_x + 80 - dot_radius, center_y + 60 - dot_radius, center_x + 80 + dot_radius, center_y + 60 + dot_radius],
    fill=secondary_accent
)

# Save as PNG
output_path = "/home/work/.openclaw/workspace/logic/play_store_assets/app_icon_512.png"
img.save(output_path, "PNG", quality=95)

# Verify
file_size = os.path.getsize(output_path)
file_size_mb = file_size / (1024 * 1024)

print(f"✅ App icon created (L-based design)")
print(f"   Path: {output_path}")
print(f"   Size: 512×512 pixels")
print(f"   Format: PNG (transparent background)")
print(f"   File size: {file_size_mb:.2f} MB")
print(f"   Colors: #6C8EF5 (Primary) + #00D4FF (Secondary)")
print(f"   Design: L-shaped logic element with accent dots")
