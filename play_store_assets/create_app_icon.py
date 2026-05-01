#!/usr/bin/env python3
from PIL import Image, ImageDraw, ImageFont
import os

# Create Logic app icon (512×512px)
# Google Play specifications:
# - PNG or JPEG format
# - 512×512 pixels
# - Under 1 MB
# - Follows Google design guidelines

width = height = 512
bg_color = (26, 31, 46)  # #1A1F2E (Dark Navy)

# Create base image
img = Image.new('RGBA', (width, height), bg_color + (255,))
draw = ImageDraw.Draw(img)

# Define colors
accent_primary = (108, 142, 245)  # #6C8EF5 (Slate Blue)
accent_secondary = (0, 212, 255)  # #00D4FF (Cyan)
white = (255, 255, 255)

# Draw gradient-like effect using circles
center_x, center_y = width // 2, height // 2

# Background circle with accent
draw.ellipse(
    [center_x - 200, center_y - 200, center_x + 200, center_y + 200],
    fill=accent_primary,
    outline=accent_secondary,
    width=3
)

# Inner circle
draw.ellipse(
    [center_x - 180, center_y - 180, center_x + 180, center_y + 180],
    fill=bg_color,
    outline=accent_primary,
    width=2
)

# Draw logic tree nodes
node_radius = 20
line_width = 3

# Top node
top_y = center_y - 60
draw.ellipse(
    [center_x - node_radius, top_y - node_radius, center_x + node_radius, top_y + node_radius],
    fill=accent_primary
)

# Bottom left node
bottom_left_x = center_x - 80
bottom_left_y = center_y + 60
draw.ellipse(
    [bottom_left_x - node_radius, bottom_left_y - node_radius, bottom_left_x + node_radius, bottom_left_y + node_radius],
    fill=accent_secondary
)

# Bottom center node
bottom_center_y = center_y + 60
draw.ellipse(
    [center_x - node_radius, bottom_center_y - node_radius, center_x + node_radius, bottom_center_y + node_radius],
    fill=accent_primary
)

# Bottom right node
bottom_right_x = center_x + 80
bottom_right_y = center_y + 60
draw.ellipse(
    [bottom_right_x - node_radius, bottom_right_y - node_radius, bottom_right_x + node_radius, bottom_right_y + node_radius],
    fill=accent_secondary
)

# Draw connecting lines
draw.line([center_x, top_y, bottom_left_x, bottom_left_y], fill=accent_primary, width=line_width)
draw.line([center_x, top_y, center_x, bottom_center_y], fill=accent_primary, width=line_width)
draw.line([center_x, top_y, bottom_right_x, bottom_right_y], fill=accent_secondary, width=line_width)

# Save as PNG
output_path = "/home/work/.openclaw/workspace/logic/play_store_assets/app_icon_512.png"
img.save(output_path, "PNG", quality=95)

# Verify file size
file_size = os.path.getsize(output_path)
file_size_mb = file_size / (1024 * 1024)

print(f"✅ App icon created: {output_path}")
print(f"   Size: 512×512 pixels")
print(f"   Format: PNG")
print(f"   File size: {file_size_mb:.2f} MB (limit: 1 MB)")
print(f"   Status: {'✅ OK' if file_size_mb < 1 else '❌ Exceeds 1 MB'}")
