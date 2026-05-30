#!/usr/bin/env node
/*
 * DF-F2 codemod: inline の fontSize 数値リテラル(px 想定)を rem 基準へ変換する。
 *
 * 基準: 1rem = 15px (src/index.css の html { font-size: 15px })
 *   fontSize: 24  ->  fontSize: '1.6rem'   (24 / 15)
 *
 * 厳密に「PropertyAssignment / JsxAttribute の名前が fontSize で、値が NumericLiteral」
 * のものだけを対象にする。ternary 等の中の NumericLiteral も、その式が fontSize 配下に
 * あるものだけ変換する。letterSpacing / lineHeight / padding / margin / gap / width /
 * height / borderRadius / size 変数渡し等は一切触らない（fontSize 以外の名前は無視、
 * 数値以外の値=変数/関数も無視）。
 *
 * Usage:
 *   node scripts/codemod-fontsize-rem.cjs          # apply
 *   node scripts/codemod-fontsize-rem.cjs --dry     # report only
 */
const fs = require('fs')
const path = require('path')
const ts = require('typescript')

const BASE = 15
const DRY = process.argv.includes('--dry')

function toRem(px) {
  const rem = px / BASE
  // 4桁に丸め、末尾0を除去。整数なら整数表記。
  let s = rem.toFixed(4).replace(/0+$/, '').replace(/\.$/, '')
  return `${s}rem`
}

function walkFiles(dir, acc) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) {
      if (!/node_modules|dist|build/.test(p)) walkFiles(p, acc)
    } else if (/\.tsx?$/.test(e.name)) acc.push(p)
  }
  return acc
}

const files = walkFiles('src', [])
let totalEdits = 0
const perFile = []

for (const file of files) {
  const src = fs.readFileSync(file, 'utf8')
  const sf = ts.createSourceFile(file, src, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)

  // 収集: fontSize 配下にある NumericLiteral ノードの [start,end,value]
  const targets = []

  function isFontSizeName(nameNode) {
    if (!nameNode) return false
    if (ts.isIdentifier(nameNode)) return nameNode.text === 'fontSize'
    if (ts.isStringLiteral(nameNode)) return nameNode.text === 'fontSize'
    return false
  }

  // fontSize 値の式ツリーから NumericLiteral を全部拾う（ternary / paren を貫通）
  function collectNumerics(node) {
    if (ts.isNumericLiteral(node)) {
      targets.push({ start: node.getStart(sf), end: node.getEnd(), text: node.getText(sf) })
      return
    }
    // 文字列リテラルやテンプレート/変数/プロパティアクセスはそのまま（対象外）
    if (
      ts.isStringLiteral(node) ||
      ts.isNoSubstitutionTemplateLiteral(node) ||
      ts.isTemplateExpression(node) ||
      ts.isIdentifier(node) ||
      ts.isPropertyAccessExpression(node) ||
      ts.isElementAccessExpression(node) ||
      ts.isCallExpression(node)
    ) {
      return
    }
    // ternary: condition は fontSize の値ではない（比較対象の数値等）ので無視し、
    // whenTrue / whenFalse の枝だけを再帰する。
    if (ts.isConditionalExpression(node)) {
      collectNumerics(node.whenTrue)
      collectNumerics(node.whenFalse)
      return
    }
    // paren / その他の合成式は子を再帰（数値リテラルだけ置換）
    node.forEachChild(collectNumerics)
  }

  function visit(node) {
    // style={{ fontSize: <expr> }} 等の object property
    if (ts.isPropertyAssignment(node) && isFontSizeName(node.name)) {
      collectNumerics(node.initializer)
    }
    // <X fontSize={<expr>} /> 形式の JSX 属性（保険。現状は無いが安全側）
    if (ts.isJsxAttribute(node) && isFontSizeName(node.name) && node.initializer) {
      if (ts.isJsxExpression(node.initializer) && node.initializer.expression) {
        collectNumerics(node.initializer.expression)
      }
    }
    node.forEachChild(visit)
  }
  visit(sf)

  if (targets.length === 0) continue

  // 後ろから置換（オフセットずれ防止）
  targets.sort((a, b) => b.start - a.start)
  let out = src
  for (const t of targets) {
    const px = Number(t.text)
    const rem = `'${toRem(px)}'`
    out = out.slice(0, t.start) + rem + out.slice(t.end)
  }
  totalEdits += targets.length
  perFile.push({ file, count: targets.length })
  if (!DRY) fs.writeFileSync(file, out)
}

perFile.sort((a, b) => b.count - a.count)
for (const r of perFile) console.log(`${r.count}\t${r.file}`)
console.log(`\n${DRY ? '[DRY] ' : ''}files changed: ${perFile.length}, fontSize literals converted: ${totalEdits}`)
