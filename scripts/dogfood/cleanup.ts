/**
 * Dogfooding Phase 2a — cleanup スクリプト
 *
 * is_test=true（user_metadata）のドッグフーディングユーザーと、その従属データを
 * 安全に削除する。auth.users 削除で大半は FK CASCADE で連鎖削除されるが、
 * 一部は SET NULL / FK 無しのため明示削除する。
 *
 * FK delete rule（実スキーマ確認済み・2026-05-30）:
 *   CASCADE  : profiles, user_progress, user_placement, daily_journals, goals,
 *              goal_reviews, journal_assistant_conversations, sync_telemetry,
 *              user_ai_*, user_custom_courses, user_flashcards, user_wrong_answers,
 *              user_saved_items, user_roadmap_goals, user_settings,
 *              （profiles 経由）progress, notebooks, placement_results,
 *              roadmap_progress, subscriptions, admin_overrides
 *   SET NULL : fermi_answers.user_id（→auth.users）, reports.user_id（→profiles）
 *              → user 削除では行が残る。fermi_answers は本文 [DOGFOOD:] で明示削除する。
 *   FK 無し   : feedback（user_id 列なし）→ message の [DOGFOOD:] prefix で明示削除。
 *              user_stats / fermi_scores は guest_id ベース・dogfood では未投入。
 *
 * dry-run (--dry): 削除対象の件数を出すだけで一切消さない。
 *
 * 実行:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx tsx scripts/dogfood/cleanup.ts --dry
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx tsx scripts/dogfood/cleanup.ts
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { EMAIL_PREFIX, EMAIL_DOMAIN } from './personas.ts'

const args = process.argv.slice(2)
const DRY = args.includes('--dry') || args.includes('--dry-run')

const SUPABASE_URL = process.env.SUPABASE_URL || ''
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

function log(...a: unknown[]) {
  console.log(...a)
}

// is_test=true もしくは dogfood メール のテストユーザー id を集める
async function collectTestUserIds(sb: SupabaseClient): Promise<string[]> {
  const ids: string[] = []
  let page = 1
  for (;;) {
    const { data, error } = await sb.auth.admin.listUsers({ page, perPage: 1000 })
    if (error) throw error
    for (const u of data.users) {
      const isTest = (u.user_metadata as Record<string, unknown> | undefined)?.is_test === true
      const isDogfoodEmail = u.email?.endsWith(`@${EMAIL_DOMAIN}`) && u.email?.startsWith(EMAIL_PREFIX)
      if (isTest || isDogfoodEmail) ids.push(u.id)
    }
    if (data.users.length < 1000) break
    page++
  }
  return ids
}

async function main() {
  log(`Logic Dogfooding cleanup`)
  log(`mode: ${DRY ? 'DRY-RUN (no deletes)' : 'LIVE DELETE'}`)

  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    // listUsers すら service role が要るので、dry でも key が無ければ件数は出せない。
    console.error('ERROR: SUPABASE_URL と SUPABASE_SERVICE_ROLE_KEY が必要です（dry-run でもユーザー列挙に必要）。')
    process.exit(1)
  }

  const sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
  if (!SUPABASE_URL.includes('yctlelmlwjwlcpcxvmgx')) {
    console.warn(`[WARN] SUPABASE_URL が Logic 本番(yctlelmlwjwlcpcxvmgx)と一致しません: ${SUPABASE_URL}`)
  }

  const userIds = await collectTestUserIds(sb)
  log(`\nテストユーザー: ${userIds.length} 件`)
  if (userIds.length === 0) {
    log('対象なし。終了。')
    return
  }

  // FK 無し / SET NULL のテーブルを先に明示削除（残骸防止）
  // feedback: prefix で削除（user_id 列なし）
  if (DRY) {
    const { count } = await sb
      .from('feedback')
      .select('*', { count: 'exact', head: true })
      .like('message', '[DOGFOOD:%')
    log(`  [DRY] would delete feedback   : ${count ?? '?'} 行（message like [DOGFOOD:%）`)
  } else {
    const { error } = await sb.from('feedback').delete().like('message', '[DOGFOOD:%')
    if (error) console.warn('  feedback delete warning:', error.message)
    else log('  deleted feedback (prefix [DOGFOOD:)')
  }

  // fermi_answers: SET NULL なので user 削除では残る。user_id でまとめて消す。
  if (DRY) {
    const { count } = await sb
      .from('fermi_answers')
      .select('*', { count: 'exact', head: true })
      .in('user_id', userIds)
    log(`  [DRY] would delete fermi_answers: ${count ?? '?'} 行（user_id in test users）`)
  } else {
    const { error } = await sb.from('fermi_answers').delete().in('user_id', userIds)
    if (error) console.warn('  fermi_answers delete warning:', error.message)
    else log('  deleted fermi_answers (test user_ids)')
  }

  // reports: SET NULL（→profiles）。dogfood では reports を投入しないが、念のため
  // user_id in test users で消しておく（投入前は0件）。
  if (DRY) {
    const { count } = await sb
      .from('reports')
      .select('*', { count: 'exact', head: true })
      .in('user_id', userIds)
    log(`  [DRY] would delete reports     : ${count ?? '?'} 行（user_id in test users）`)
  } else {
    const { error } = await sb.from('reports').delete().in('user_id', userIds)
    if (error) console.warn('  reports delete warning:', error.message)
    else log('  deleted reports (test user_ids)')
  }

  // 最後に auth.users を削除 → profiles 含む CASCADE 系が連鎖削除される
  if (DRY) {
    log(`  [DRY] would delete auth users  : ${userIds.length} 件（→ CASCADE で従属データ連鎖削除）`)
    log('\nDRY 完了。実削除は --dry を外して再実行。')
    return
  }

  let deleted = 0
  for (const id of userIds) {
    const { error } = await sb.auth.admin.deleteUser(id)
    if (error) console.warn(`  deleteUser ${id} warning:`, error.message)
    else deleted++
  }
  log(`  deleted auth users: ${deleted}/${userIds.length}（CASCADE で profiles 等も連鎖削除）`)
  log('\nクリーンアップ完了。')
}

main().catch((e) => {
  console.error('FATAL:', e)
  process.exit(1)
})
