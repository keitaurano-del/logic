import sharp from 'sharp';
import { readFileSync, writeFileSync } from 'fs';

const inputs = process.argv.slice(2);
if (inputs.length === 0) {
  console.error('Usage: node svg2png.mjs <input.svg> [<input2.svg> ...]');
  process.exit(1);
}

for (const input of inputs) {
  const out = input.replace(/\.svg$/i, '.png');
  const svg = readFileSync(input);
  const buf = await sharp(svg, { density: 200 })
    .resize({ width: 1600 })
    .png()
    .toBuffer();
  writeFileSync(out, buf);
  console.log(`${input} -> ${out} (${buf.length} bytes)`);
}
