// F19: f19_final.json から FERMI_POOL_EN / FERMI_STATS_EN の TS リテラルを生成する。
// anchor の各セミコロン断片を {label,value} チップ化し、referenceStats を末尾チップで保持。
const fs = require('fs');
const path = require('path');
const data = require('./f19_final.json');

function esc(s) {
  // TS シングルクォート文字列用エスケープ（\ と ' のみ）
  return String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

// anchor 断片 → {label, value}
function fragToChip(frag) {
  const i = frag.indexOf('~');
  if (i > 0) {
    // "US population ~330M" 型
    const label = frag.slice(0, i).trim().replace(/[:：,]+$/, '').trim();
    const value = frag.slice(i).trim();
    if (label) return { label, value };
  }
  // "~250M adults" / "~5B internet users"（~先頭・数値+名詞句）型
  // → label=名詞句, value=~数値 に分離して既存EN STATS の形に揃える。
  const m = frag.match(/^(~[\d.,$–\-]+[%A-Za-z/]*)\s+(.+)$/);
  if (m) {
    const value = m[1].trim();
    const label = m[2].trim().replace(/^(of|the)\s+/i, '');
    const Label = label.charAt(0).toUpperCase() + label.slice(1);
    return { label: Label, value };
  }
  // それ以外で ~ を含むもの（複雑な断片）はそのまま value 化
  if (frag.includes('~')) {
    return { label: 'Reference', value: frag };
  }
  // 定性記述
  return { label: 'Context', value: frag };
}

const poolLines = [];
const statsLines = [];

for (const q of data) {
  poolLines.push(
    `  { question: '${esc(q.question_en)}', hint: '${esc(q.hint_en)}' },`
  );

  const frags = q.anchor.split(';').map((s) => s.trim()).filter(Boolean);
  const chips = frags.map(fragToChip);
  // referenceStats を末尾に保持
  chips.push({ label: 'Worked estimate', value: q.referenceStats });

  // label ユニーク化（React key=s.label 対策）
  const seen = new Map();
  for (const c of chips) {
    const n = (seen.get(c.label) || 0) + 1;
    seen.set(c.label, n);
    if (n > 1) c.label = `${c.label} ${n}`;
  }

  const inner = chips
    .map((c) => `{ label: '${esc(c.label)}', value: '${esc(c.value)}' }`)
    .join(', ');
  // index は n-1（0始まり）
  statsLines.push(`  // ${q.n - 1}: ${esc(q.theme)} (${q.difficulty})`);
  statsLines.push(`  [${inner}],`);
}

const out = {
  pool: poolLines.join('\n'),
  stats: statsLines.join('\n'),
};
fs.writeFileSync(
  path.join(__dirname, 'f19_gen_out.json'),
  JSON.stringify(out, null, 0)
);
console.log('pool entries:', poolLines.length);
console.log('stats entries (problems):', data.length);
console.log('\n--- POOL preview (first 3) ---');
console.log(poolLines.slice(0, 3).join('\n'));
console.log('\n--- STATS preview (first 2 problems) ---');
console.log(statsLines.slice(0, 4).join('\n'));
