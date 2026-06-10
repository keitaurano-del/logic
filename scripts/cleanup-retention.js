#!/usr/bin/env node
/**
 * cleanup-retention.js — 保持期間（retention TTL）・orphan データのクリーンアップ（LR-5）
 *
 * アカウント削除（POST /api/account/delete）は admin.deleteUser + FK CASCADE で
 * 認証ユーザーの所有データを即時 hard-delete する。本スクリプトはそれを補完する
 * 「期限切れ／orphan（FK CASCADE が効かない guest 系・匿名化済み）データ」の
 * 定期クリーンアップ雛形である。
 *
 * 対象（supabase/migrations/ を実調査して決定。実在テーブル/列のみ）:
 *   1. fermi_scores       — user_id が TEXT で auth.users への FK 無し。guest 形式
 *                           (例: 'guest' / 'g_xxxx') の古い行を TTL で削除する。
 *                           認証ユーザー(UUID)の行は account/delete 側で明示削除済み。
 *   2. placement_results  — user_id IS NULL（= guest 投稿）かつ古い行を TTL で削除。
 *                           user_id 付きの行は profiles 経由 CASCADE で削除されるので対象外。
 *   3. reports            — user_id ON DELETE SET NULL（匿名化保持）。匿名化済み
 *                           (user_id IS NULL) かつ retention を超えた行を削除する。
 *
 * 安全装置:
 *   - デフォルトは DRY RUN（件数を数えるだけ）。実削除は --apply を付けたときのみ。
 *   - TTL は環境変数で上書き可能。デフォルトは下記 DEFAULT_TTL_DAYS。
 *
 * Usage:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/cleanup-retention.js
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/cleanup-retention.js --apply
 *
 * Render cron 設定（本スクリプトを定期実行する場合）:
 *   - render.yaml に cron サービスを追加するか、Render Dashboard で Cron Job を作成。
 *   - Command: node scripts/cleanup-retention.js --apply
 *   - Schedule 例: "0 3 * * *"（毎日 03:00 UTC）
 *   - 環境変数 SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY を設定すること（service-role）。
 *   ※ cron 設定自体は env/ダッシュボード作業のため本コードには含めない。
 */

import { createClient } from '@supabase/supabase-js'

// 保持期間（日）。env で上書き可能。
const DEFAULT_TTL_DAYS = {
  // guest フェルミスコア: ランキング用の匿名データ。90 日で十分。
  fermiGuest: Number(process.env.RETENTION_FERMI_GUEST_DAYS || 90),
  // guest 偏差値ランキング投稿: 同上。
  placementGuest: Number(process.env.RETENTION_PLACEMENT_GUEST_DAYS || 90),
  // 匿名化済み（user 削除で SET NULL になった）報告: 監査目的で長め。
  reportsAnonymized: Number(process.env.RETENTION_REPORTS_DAYS || 180),
}

function parseArgs(argv) {
  const out = { apply: false }
  for (const a of argv) {
    if (a === '--apply') out.apply = true
    else if (a === '--help' || a === '-h') {
      console.log('Usage: node scripts/cleanup-retention.js [--apply]')
      console.log('  (default is dry-run; --apply performs the deletes)')
      process.exit(0)
    } else {
      console.error(`Unknown argument: ${a}`)
      process.exit(1)
    }
  }
  return out
}

function cutoffIso(days) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
}

/**
 * 1 つのクリーンアップ対象を処理する。
 * applyFilters(query) で where 句を組み立て、dry-run なら head:true で件数のみ取得、
 * apply なら delete を実行する。
 */
async function processTarget(supabase, { label, table, applyFilters, apply }) {
  // 件数を取得（dry-run / apply 双方で削除前にログ用に数える）。
  const countRes = await applyFilters(
    supabase.from(table).select('*', { count: 'exact', head: true }),
  )
  if (countRes.error) {
    console.error(`  ✗ ${label}: count failed: ${countRes.error.message}`)
    return
  }
  const n = countRes.count ?? 0

  if (!apply) {
    console.log(`  [dry-run] ${label}: ${n} row(s) would be deleted`)
    return
  }

  if (n === 0) {
    console.log(`  ${label}: nothing to delete`)
    return
  }

  const delRes = await applyFilters(supabase.from(table).delete())
  if (delRes.error) {
    console.error(`  ✗ ${label}: delete failed: ${delRes.error.message}`)
    return
  }
  console.log(`  ✓ ${label}: deleted ${n} row(s)`)
}

async function main() {
  const opts = parseArgs(process.argv.slice(2))

  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    console.error('ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set (service-role).')
    process.exit(1)
  }

  const supabase = createClient(url, key)

  console.log(opts.apply ? 'Running cleanup (APPLY)…' : 'Running cleanup (DRY RUN — no deletes)…')
  console.log('TTL (days):', JSON.stringify(DEFAULT_TTL_DAYS))

  // 1. guest フェルミスコア（user_id が UUID でない = guest）かつ TTL 超過。
  //    UUID 形式の行（認証ユーザー）は誤って消さないよう除外する。
  await processTarget(supabase, {
    label: 'fermi_scores (guest, expired)',
    table: 'fermi_scores',
    apply: opts.apply,
    applyFilters: (q) =>
      q
        .lt('created_at', cutoffIso(DEFAULT_TTL_DAYS.fermiGuest))
        // 認証ユーザー UUID 形式を除外（guest 値: 'guest' / 'g_xxxx' のみ対象）。
        .not('user_id', 'like', '________-____-____-____-____________'),
  })

  // 2. guest 偏差値投稿（user_id IS NULL）かつ TTL 超過。
  await processTarget(supabase, {
    label: 'placement_results (guest, expired)',
    table: 'placement_results',
    apply: opts.apply,
    applyFilters: (q) =>
      q
        .is('user_id', null)
        .lt('completed_at', cutoffIso(DEFAULT_TTL_DAYS.placementGuest)),
  })

  // 3. 匿名化済み報告（user 削除で user_id が SET NULL 済み）かつ TTL 超過。
  await processTarget(supabase, {
    label: 'reports (anonymized, expired)',
    table: 'reports',
    apply: opts.apply,
    applyFilters: (q) =>
      q
        .is('user_id', null)
        .lt('created_at', cutoffIso(DEFAULT_TTL_DAYS.reportsAnonymized)),
  })

  console.log('Done.')
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
