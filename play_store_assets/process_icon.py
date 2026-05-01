#!/usr/bin/env python3
from PIL import Image
import os

# Load the reference icon
input_path = "/home/work/.openclaw/workspace/upload/2449.png"
output_path = "/home/work/.openclaw/workspace/logic/play_store_assets/app_icon_512.png"

# Open image
img = Image.open(input_path)

# Convert to RGBA if needed
if img.mode != 'RGBA':
    img = img.convert('RGBA')

# Get image dimensions
width, height = img.size

# Create new image with transparent background
new_img = Image.new('RGBA', (width, height), (0, 0, 0, 0))

# Copy only the circular icon part (remove black background)
# Find the bounding box of the blue circle
pixels = img.load()

# Scan for dark pixels (black/brown background) and remove them
# Keep only the bright blue circle and white L
for y in range(height):
    for x in range(width):
        r, g, b, a = pixels[x, y]
        
        # If pixel is close to black/dark brown (background), make it transparent
        if r < 50 and g < 50 and b < 50:
            new_img.putpixel((x, y), (0, 0, 0, 0))
        else:
            # Keep the pixel (blue circle + white L)
            new_img.putpixel((x, y), (r, g, b, a))

# Save as PNG
new_img.save(output_path, "PNG", quality=95)

file_size = os.path.getsize(output_path)
file_size_mb = file_size / (1024 * 1024)

print(f"✅ App icon created (background removed)")
print(f"   Input: {input_path}")
print(f"   Output: {output_path}")
print(f"   Size: {width}×{height} pixels")
print(f"   Format: PNG (transparent background)")
print(f"   File size: {file_size_mb:.3f} MB")
print(f"   Status: Ready for Play Store upload")
