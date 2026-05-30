#!/usr/bin/env node
/**
 * DF-F2 第3弾: CSS ファイルの本文系 font-size を px → rem 化する codemod。
 *
 * 基準は 15px（1rem = 15px、src/index.css の html font-size と整合）。
 * 前段の inline rem 化（codemod-fontsize-rem.cjs）と同じ除数 15 で統一。
 *
 * 対象は本文・UIテキスト系の CSS ファイルのみ（引数で明示指定）。
 * SVG 図解（src/visuals/*）・固定レイアウト寸法・html 基準値は対象外なので
 * このスクリプトに渡さない（呼び出し側でファイルを絞る）。
 *
 * 使い方:
 *   node scripts/codemod-css-fontsize-rem.cjs <file.css> [<file.css> ...]
 *   node scripts/codemod-css-fontsize-rem.cjs --check <file.css>   # 変換せず件数だけ表示
 */
const fs = require('fs');

const BASE = 15;
const RE = /font-size:\s*([0-9]+(?:\.[0-9]+)?)px/g;

function toRem(px) {
  const rem = Number(px) / BASE;
  // 小数 4 桁に丸め、末尾 0 を落とす
  let s = rem.toFixed(4);
  s = s.replace(/0+$/, '').replace(/\.$/, '');
  return `${s}rem`;
}

const args = process.argv.slice(2);
const check = args.includes('--check');
const files = args.filter((a) => a !== '--check');

let grand = 0;
for (const file of files) {
  const src = fs.readFileSync(file, 'utf8');
  let count = 0;
  const out = src.replace(RE, (_m, px) => {
    count += 1;
    return `font-size: ${toRem(px)}`;
  });
  grand += count;
  if (!check && count > 0) fs.writeFileSync(file, out);
  console.log(`${check ? '[check] ' : ''}${file}: ${count} 件${check ? '（未変更）' : ' 変換'}`);
}
console.log(`合計: ${grand} 件`);
