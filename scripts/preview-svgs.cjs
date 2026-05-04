const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, '..', 'public', 'images', 'v3');
const outDir = '/tmp/svg-previews';

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const svgs = [
  'course-logic-02.svg',
  'course-critical-02.svg',
  'course-client-02.svg',
  'course-client-03.svg',
  'course-strategy-02.svg',
  'course-numeracy.svg',
];

(async () => {
  for (const name of svgs) {
    const inPath = path.join(baseDir, name);
    const outPath = path.join(outDir, name.replace('.svg', '.png'));
    await sharp(inPath, { density: 200 })
      .resize(1000, 500)
      .png()
      .toFile(outPath);
    console.log('written', outPath);
  }
})();
