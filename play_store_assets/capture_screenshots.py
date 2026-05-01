#!/usr/bin/env python3
"""
Logic アプリ SIT スクリーンショット取得スクリプト
"""
import subprocess
import json
import time

# Puppeteer を使って各サイズでスクリーンショット取得
puppeteer_script = """
const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const sizes = [
    { width: 1080, height: 1920, name: 'phone_1080x1920', desc: 'Smartphone' },
    { width: 1440, height: 1600, name: 'tablet_7inch_1440x1600', desc: '7-inch Tablet' },
    { width: 2560, height: 1600, name: 'tablet_10inch_2560x1600', desc: '10-inch Tablet' }
  ];
  
  const page = await browser.newPage();
  
  for (const size of sizes) {
    console.log(`Taking screenshot for ${size.desc} (${size.width}x${size.height})...`);
    
    await page.setViewport({
      width: size.width,
      height: size.height,
      deviceScaleFactor: 1
    });
    
    await page.goto('https://logic-sit.onrender.com', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });
    
    // Wait for content to fully load
    await page.waitForTimeout(2000);
    
    const filename = `screenshot_${size.name}.png`;
    await page.screenshot({
      path: filename,
      fullPage: false
    });
    
    console.log(`✅ Saved: ${filename}`);
  }
  
  await browser.close();
  console.log('\\nAll screenshots captured successfully!');
})();
"""

# スクリプトをファイルに保存して実行
with open('/tmp/capture_screenshots.js', 'w') as f:
    f.write(puppeteer_script)

print("📸 SIT スクリーンショット取得開始...")
print("場所: /home/work/.openclaw/workspace/logic/play_store_assets/")
print()

try:
    result = subprocess.run(
        ['node', '/tmp/capture_screenshots.js'],
        cwd='/home/work/.openclaw/workspace/logic/play_store_assets/',
        capture_output=True,
        text=True,
        timeout=120
    )
    
    print(result.stdout)
    if result.stderr:
        print("Errors:", result.stderr)
    
    if result.returncode == 0:
        print("\n✅ すべてのスクリーンショット取得完了!")
    else:
        print(f"\n❌ エラー（code: {result.returncode}）")
        
except subprocess.TimeoutExpired:
    print("❌ タイムアウト：スクリーンショット取得に時間がかかりすぎています")
except Exception as e:
    print(f"❌ エラー: {e}")
