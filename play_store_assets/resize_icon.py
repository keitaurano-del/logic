#!/usr/bin/env python3
from PIL import Image
import os

# Resize icon to exact 512×512px
input_path = "/home/work/.openclaw/workspace/logic/play_store_assets/app_icon_512.png"
output_path = "/home/work/.openclaw/workspace/logic/play_store_assets/app_icon_512_final.png"

# Open image
img = Image.open(input_path)

# Resize to 512×512 with high quality (LANCZOS)
img_resized = img.resize((512, 512), Image.Resampling.LANCZOS)

# Save
img_resized.save(output_path, "PNG", quality=95)

file_size = os.path.getsize(output_path)
file_size_mb = file_size / (1024 * 1024)

print(f"✅ Icon resized to 512×512px")
print(f"   Path: {output_path}")
print(f"   File size: {file_size_mb:.3f} MB")
print(f"   Status: Ready")

# Rename to final version
import shutil
shutil.move(output_path, input_path)
print(f"   ✅ Updated: {input_path}")
