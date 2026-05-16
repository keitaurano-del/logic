#!/usr/bin/env node
/* eslint-disable no-console */
/**
 * Supabase migration runner
 *
 * supabase/migrations/*.sql を sort 順に走査し、未適用のものを順番に apply する。
 * 適用済みは `_migrations` テーブル（初回実行時に自動作成）で追跡するので、
 * 何度実行しても同じ migration を 2 回走らせない。
 *
 * Usage:
 *   SUPABASE_DB_URL=... node scripts/run-migration.js              # 未適用を全部 apply
 *   SUPABASE_DB_URL=... node scripts/run-migration.js --dry-run    # 何を流すか表示するだけ
 *   SUPABASE_DB_URL=... node scripts/run-migration.js --list       # 適用済み / 未適用の一覧
 *   SUPABASE_DB_URL=... node scripts/run-migration.js --file 014_journal_goal_categories.sql
 *
 * 接続文字列の取り方:
 *   Supabase Dashboard → Project Settings → Database → Connection string
 *   "URI" タブの pooler URL (port 6543, mode=transaction) を推奨。
 *   例: postgres://postgres.<ref>:<password>@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres
 *
 * 前提:
 *   - `npm install --save-dev pg` 済み
 */

import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let Client
try {
  ;({ Client } = await import('pg'))
} catch {
  console.error('ERROR: "pg" package is not installed.')
  console.error('  Run: npm install --save-dev pg')
  process.exit(1)
}

const MIGRATIONS_DIR = path.join(__dirname, '..', 'supabase', 'migrations')
const TRACKING_TABLE = '_migrations'

function parseArgs(argv) {
  const out = { dryRun: false, list: false, file: null }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--dry-run') out.dryRun = true
    else if (a === '--list') out.list = true
    else if (a === '--file') out.file = argv[++i]
    else if (a === '--help' || a === '-h') {
      const lines = fs.readFileSync(__filename, 'utf8').split('\n').slice(2, 22)
      console.log(lines.join('\n'))
      process.exit(0)
    } else {
      console.error(`Unknown argument: ${a}`)
      process.exit(1)
    }
  }
  return out
}

function readSqlFiles() {
  if (!fs.existsSync(MIGRATIONS_DIR)) {
    console.error(`ERROR: migrations dir not found: ${MIGRATIONS_DIR}`)
    process.exit(1)
  }
  return fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort()
}

function checksum(text) {
  return crypto.createHash('sha256').update(text).digest('hex').slice(0, 16)
}

async function ensureTrackingTable(client) {
  await client.query(`
    create table if not exists ${TRACKING_TABLE} (
      filename text primary key,
      applied_at timestamptz not null default now(),
      checksum text
    );
  `)
}

async function getAppliedMap(client) {
  const { rows } = await client.query(
    `select filename, checksum from ${TRACKING_TABLE} order by filename`,
  )
  const map = new Map()
  for (const r of rows) map.set(r.filename, r.checksum)
  return map
}

async function applyOne(client, filename) {
  const sqlPath = path.join(MIGRATIONS_DIR, filename)
  const sql = fs.readFileSync(sqlPath, 'utf8')
  const sum = checksum(sql)
  console.log(`\n→ applying ${filename}  (${sql.length} bytes, sha=${sum})`)
  await client.query('begin')
  try {
    await client.query(sql)
    await client.query(
      `insert into ${TRACKING_TABLE} (filename, checksum) values ($1, $2)
       on conflict (filename) do update set checksum = excluded.checksum, applied_at = now()`,
      [filename, sum],
    )
    await client.query('commit')
    console.log(`  ✓ ok`)
  } catch (err) {
    await client.query('rollback')
    console.error(`  ✗ failed: ${err.message}`)
    throw err
  }
}

async function main() {
  const opts = parseArgs(process.argv.slice(2))

  const dbUrl = process.env.SUPABASE_DB_URL || process.env.DATABASE_URL
  if (!dbUrl) {
    console.error('ERROR: SUPABASE_DB_URL (or DATABASE_URL) not set.')
    console.error(
      '  Supabase Dashboard → Project Settings → Database → Connection string (URI tab) で取得。',
    )
    console.error('  Pooler URL (port 6543, mode=transaction) 推奨。')
    process.exit(1)
  }

  const client = new Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false },
  })

  try {
    await client.connect()
  } catch (err) {
    console.error(`ERROR: failed to connect to database: ${err.message}`)
    process.exit(1)
  }

  await ensureTrackingTable(client)

  const all = readSqlFiles()
  const applied = await getAppliedMap(client)
  const pending = all.filter((f) => !applied.has(f))

  if (opts.list) {
    console.log('Applied:')
    for (const f of all.filter((f) => applied.has(f))) {
      const stored = applied.get(f)
      const current = checksum(fs.readFileSync(path.join(MIGRATIONS_DIR, f), 'utf8'))
      const drift = stored && stored !== current ? '  ⚠ file changed since apply' : ''
      console.log(`  ✓ ${f}${drift}`)
    }
    console.log('Pending:')
    if (pending.length === 0) console.log('  (none)')
    for (const f of pending) console.log(`  ○ ${f}`)
    await client.end()
    return
  }

  let target
  if (opts.file) {
    if (!all.includes(opts.file)) {
      console.error(`ERROR: file not found in ${MIGRATIONS_DIR}: ${opts.file}`)
      console.error(`Available:\n  ${all.join('\n  ')}`)
      await client.end()
      process.exit(1)
    }
    target = [opts.file]
  } else {
    target = pending
  }

  if (target.length === 0) {
    console.log('Nothing to apply. All migrations are up to date.')
    await client.end()
    return
  }

  console.log(opts.dryRun ? 'DRY RUN — would apply:' : 'Will apply:')
  for (const f of target) {
    const note = applied.has(f) ? '  (re-apply, already tracked)' : ''
    console.log(`  - ${f}${note}`)
  }

  if (opts.dryRun) {
    await client.end()
    return
  }

  for (const f of target) {
    await applyOne(client, f)
  }

  await client.end()
  console.log('\nDone.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
