/**
 * Dogfooding Phase 2a — seed スクリプト
 *
 * 20 ペルソナ（personas.ts）を本番 Supabase に投入する。
 *   (a) auth ユーザー作成（admin.createUser・user_metadata に is_test/persona/batch）
 *   (b) profiles + ペルソナ相応の user_progress / fermi_answers / user_placement
 *   (c) 有料ペルソナの subscriptions + admin_overrides 擬似投入（実決済なし）
 *   (d) アプリ内フィードバック1件（本文に [DOGFOOD:pNN] prefix）
 *
 * 特徴:
 *   - 冪等: email で既存ユーザーを探し、いれば再利用（重複作成しない）。各テーブルは
 *     onConflict upsert または「既存削除→再投入」で重複を防ぐ。
 *   - dry-run (--dry): 一切書き込まず、投入予定の内容をログ出力するだけ。
 *   - --limit N: 先頭 N 体だけ処理（まず1件試す用）。
 *
 * 実行:
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx tsx scripts/dogfood/seed.ts --dry
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx tsx scripts/dogfood/seed.ts --limit 1
 *   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx tsx scripts/dogfood/seed.ts
 *
 * 注意: service role key は環境変数からのみ取得。ハードコード禁止。
 */

import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import {
  PERSONAS,
  DOGFOOD_BATCH,
  type Persona,
  personaEmail,
  personaMetadata,
} from './personas.ts'

// ---- 引数パース ----
const args = process.argv.slice(2)
const DRY = args.includes('--dry') || args.includes('--dry-run')
const limitArg = args.find((a) => a === '--limit')
const limitIdx = args.indexOf('--limit')
const LIMIT = limitArg && limitIdx >= 0 ? parseInt(args[limitIdx + 1] ?? '', 10) : NaN
const targets = Number.isFinite(LIMIT) && LIMIT > 0 ? PERSONAS.slice(0, LIMIT) : PERSONAS

const SUPABASE_URL = process.env.SUPABASE_URL || ''
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

function log(...a: unknown[]) {
  console.log(...a)
}
function planLog(action: string, detail: string) {
  console.log(`  ${DRY ? '[DRY] would' : '[RUN] did '} ${action.padEnd(22)} ${detail}`)
}

// ---- 日付ヘルパー: 今日から過去 n 日ぶんの YYYY-MM-DD 配列 ----
function recentDates(n: number): string[] {
  const out: string[] = []
  for (let i = 0; i < n; i++) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    out.push(d.toISOString().slice(0, 10))
  }
  return out
}

interface PlanRow {
  plan: string
  status: string
  isPaid: boolean
  trial: boolean
}
function resolvePlan(p: Persona): PlanRow {
  switch (p.plan) {
    case 'paid_monthly':
      return { plan: 'standard', status: 'active', isPaid: true, trial: false }
    case 'paid_yearly':
      return { plan: 'standard', status: 'active', isPaid: true, trial: false }
    case 'trial':
      return { plan: 'standard', status: 'trialing', isPaid: true, trial: true }
    default:
      return { plan: 'free', status: 'inactive', isPaid: false, trial: false }
  }
}

// 冪等: email -> 既存 user_id を探す（admin.listUsers をページング）
async function findUserIdByEmail(sb: SupabaseClient, email: string): Promise<string | null> {
  let page = 1
  // perPage 上限は 1000。テスト規模では1ページで足りるが念のためループ。
  for (;;) {
    const { data, error } = await sb.auth.admin.listUsers({ page, perPage: 1000 })
    if (error) throw error
    const hit = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase())
    if (hit) return hit.id
    if (data.users.length < 1000) return null
    page++
  }
}

async function seedPersona(sb: SupabaseClient | null, p: Persona) {
  const email = personaEmail(p.id)
  const meta = personaMetadata(p)
  const planRow = resolvePlan(p)
  log(`\n── ${p.id} ${p.nickname} (${p.locale}, ${p.plan}, ${p.level}) ${email}`)

  // (a) auth user
  let userId = 'dry-run-uuid'
  if (DRY || !sb) {
    planLog('createUser', `metadata=${JSON.stringify(meta)}`)
  } else {
    const existing = await findUserIdByEmail(sb, email)
    if (existing) {
      userId = existing
      // メタデータを最新に更新（冪等・タグの取りこぼし防止）
      await sb.auth.admin.updateUserById(userId, { user_metadata: meta })
      planLog('createUser', `reuse existing ${userId}`)
    } else {
      const { data, error } = await sb.auth.admin.createUser({
        email,
        email_confirm: true,
        user_metadata: meta,
        password: cryptoRandom(),
      })
      if (error) throw new Error(`createUser ${p.id}: ${error.message}`)
      userId = data.user.id
      planLog('createUser', `new ${userId}`)
    }
  }

  // (b1) profiles（profiles.id == auth.users.id）
  const profileRow = {
    id: userId,
    nickname: p.nickname,
    language: p.locale,
    occupation: p.occupation,
    birth_year: p.birthYear,
    onboarded_at: new Date().toISOString(),
  }
  if (DRY || !sb) {
    planLog('upsert profiles', `nickname=${p.nickname} occ=${p.occupation} by=${p.birthYear}`)
  } else {
    const { error } = await sb.from('profiles').upsert(profileRow, { onConflict: 'id' })
    if (error) throw new Error(`profiles ${p.id}: ${error.message}`)
    planLog('upsert profiles', `ok`)
  }

  // (b2) user_progress（完了レッスン数・学習日・学習時間）
  const completedLessonIds = Array.from({ length: p.completedLessons }, (_, i) => i + 1)
  const studyDates = recentDates(p.streakDays)
  const progressRow = {
    user_id: userId,
    completed_lessons: completedLessonIds,
    study_dates: studyDates,
    study_time_ms: p.completedLessons * 4 * 60 * 1000, // 1レッスン≒4分換算
    category_progress: {},
    completion_counts: {},
    updated_at: new Date().toISOString(),
  }
  if (DRY || !sb) {
    planLog('upsert user_progress', `${p.completedLessons} lessons / ${p.streakDays}d streak`)
  } else {
    const { error } = await sb.from('user_progress').upsert(progressRow, { onConflict: 'user_id' })
    if (error) throw new Error(`user_progress ${p.id}: ${error.message}`)
    planLog('upsert user_progress', `ok`)
  }

  // (b3) user_placement（配置診断結果）
  if (p.deviation != null) {
    const placementRow = {
      user_id: userId,
      deviation: p.deviation,
      correct_count: Math.round((p.deviation / 100) * 20),
      total_count: 20,
      recommended_lesson_ids: completedLessonIds.slice(0, 5),
      completed_at: new Date().toISOString(),
    }
    if (DRY || !sb) {
      planLog('upsert user_placement', `deviation=${p.deviation}`)
    } else {
      const { error } = await sb.from('user_placement').upsert(placementRow, { onConflict: 'user_id' })
      if (error) throw new Error(`user_placement ${p.id}: ${error.message}`)
      planLog('upsert user_placement', `ok`)
    }
  }

  // (b4) fermi_answers（冪等のため既存 dogfood 分を消してから入れ直す）
  if (DRY || !sb) {
    planLog('insert fermi_answers', `${p.fermiCount} rows (delete+insert)`)
  } else {
    await sb.from('fermi_answers').delete().eq('user_id', userId)
    const fermiRows = Array.from({ length: p.fermiCount }, (_, i) => ({
      user_id: userId,
      question_date: studyDates[i % Math.max(studyDates.length, 1)] ?? recentDates(1)[0],
      question_text: `[DOGFOOD:${p.id}] サンプルフェルミ問題 #${i + 1}`,
      user_input: `${(i + 1) * 1000}`,
      hint_used: i % 3 === 0,
      elapsed_sec: 60 + i * 10,
      score: 40 + ((i * 7) % 50),
      locale: p.locale,
      app_version: 'dogfood',
    }))
    if (fermiRows.length > 0) {
      const { error } = await sb.from('fermi_answers').insert(fermiRows)
      if (error) throw new Error(`fermi_answers ${p.id}: ${error.message}`)
    }
    planLog('insert fermi_answers', `${fermiRows.length} rows`)
  }

  // (c) 有料ペルソナの subscriptions + admin_overrides（実決済なし）
  if (planRow.isPaid) {
    const periodEnd = new Date()
    periodEnd.setDate(periodEnd.getDate() + (p.plan === 'trial' ? 7 : 30))
    const subRow = {
      user_id: userId,
      plan: planRow.plan,
      status: planRow.status,
      stripe_customer_id: `dogfood_${p.id}`,
      stripe_subscription_id: `dogfood_sub_${p.id}`,
      current_period_end: periodEnd.toISOString(),
      updated_at: new Date().toISOString(),
    }
    if (DRY || !sb) {
      planLog('upsert subscriptions', `plan=${planRow.plan} status=${planRow.status} (no real charge)`)
    } else {
      const { error } = await sb.from('subscriptions').upsert(subRow, { onConflict: 'user_id' })
      if (error) throw new Error(`subscriptions ${p.id}: ${error.message}`)
      planLog('upsert subscriptions', `ok`)
    }

    // admin_overrides で有料機能をアンロック（本番の有料判定経路に合わせる）
    const overrideRow = {
      user_id: userId,
      plan: 'premium',
      granted_by: 'dogfood-seed',
      note: `[DOGFOOD:${p.id}] ${DOGFOOD_BATCH}`,
    }
    if (DRY || !sb) {
      planLog('upsert admin_override', `plan=premium`)
    } else {
      const { error } = await sb.from('admin_overrides').upsert(overrideRow, { onConflict: 'user_id' })
      if (error) throw new Error(`admin_overrides ${p.id}: ${error.message}`)
      planLog('upsert admin_override', `ok`)
    }
  }

  // (d) フィードバック1件（[DOGFOOD:pNN] prefix、source=dogfood で本番KPI除外）
  const fbMessage = `[DOGFOOD:${p.id}] ${p.feedback.message}`
  if (DRY || !sb) {
    planLog('insert feedback', `${p.feedback.category}: ${fbMessage.slice(0, 50)}…`)
  } else {
    // 冪等: 同 prefix の既存 dogfood feedback を消してから入れ直す
    await sb.from('feedback').delete().like('message', `[DOGFOOD:${p.id}]%`)
    const { error } = await sb.from('feedback').insert({
      category: p.feedback.category,
      message: fbMessage,
      locale: p.locale,
      source: 'dogfood',
    })
    if (error) throw new Error(`feedback ${p.id}: ${error.message}`)
    planLog('insert feedback', `ok`)
  }
}

function cryptoRandom(): string {
  // 32 byte のランダム文字列（パスワードはログイン用途では使わない＝マジックリンク方針）
  const bytes = new Uint8Array(24)
  globalThis.crypto.getRandomValues(bytes)
  return Buffer.from(bytes).toString('base64url') + 'Aa1!'
}

async function main() {
  log(`Logic Dogfooding seed — batch=${DOGFOOD_BATCH}`)
  log(`mode: ${DRY ? 'DRY-RUN (no writes)' : 'LIVE WRITE'} / targets: ${targets.length}/${PERSONAS.length}`)

  let sb: SupabaseClient | null = null
  if (!DRY) {
    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      console.error('ERROR: SUPABASE_URL と SUPABASE_SERVICE_ROLE_KEY が必要です（ライブ書き込み時）。')
      console.error('       --dry なら不要です。')
      process.exit(1)
    }
    sb = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
    // 投入先プロジェクトの取り違え防止: URL に Logic の ref を含むか軽くチェック
    if (!SUPABASE_URL.includes('yctlelmlwjwlcpcxvmgx')) {
      console.warn(`[WARN] SUPABASE_URL が Logic 本番(yctlelmlwjwlcpcxvmgx)と一致しません: ${SUPABASE_URL}`)
    }
  }

  let ok = 0
  for (const p of targets) {
    try {
      await seedPersona(sb, p)
      ok++
    } catch (e) {
      console.error(`  ✗ ${p.id} failed:`, e instanceof Error ? e.message : e)
      // 1体失敗しても続行（部分投入の許容）。冪等なので再実行で復旧可能。
    }
  }

  log(`\n完了: ${ok}/${targets.length} 体を処理${DRY ? '（DRY）' : ''}。`)
  if (DRY) log('実投入は --dry を外して再実行（要 SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY）。')
}

main().catch((e) => {
  console.error('FATAL:', e)
  process.exit(1)
})
