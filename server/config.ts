/**
 * config.ts — AI モデル ID の集約（LR-25 #47「採点・添削だけ上位モデル化」）
 *
 * 目的:
 *  - これまで各ルート（writing-score / fermi / problems / journal …）に
 *    `model: 'claude-haiku-4-5-20251001'` がハードコードで散在していたのを 1 か所に集約する。
 *  - 「採点・添削」だけ品質に直結するので上位モデル（Sonnet）に振り、
 *    それ以外の軽タスク（問題生成・ヒント・チャット・要約 等）は従来どおり Haiku のまま据え置く。
 *
 * モデル ID の実在性:
 *  - 既定値はいずれも同梱の @anthropic-ai/sdk(0.82.0) の `Model` 型 union に含まれる実在 ID。
 *    （node_modules/@anthropic-ai/sdk/resources/messages/messages.d.ts の `export type Model` 参照）
 *  - 軽タスク既定 = 既存コードと同じ `claude-haiku-4-5-20251001`（挙動を変えない）。
 *  - 採点/添削既定 = `claude-sonnet-4-5-20250929`（Haiku と同世代 4.5 の上位 Sonnet。
 *    日付固定 ID で SDK 公式サンプルにも載っている＝勝手なモデルローテーションを避ける）。
 *
 * env で上書き可（本番は Render の env で差し替える流儀。tts.ts / aiQuota.ts と同じ）:
 *  - AI_MODEL_LIGHT    … 軽タスク用モデル ID
 *  - AI_MODEL_GRADING  … 採点・添削用モデル ID
 * env 未設定/空文字なら既定値にフォールバックする（壊す方に倒さない）。
 *
 * コスト注意: 採点・添削は上位モデルなので原価が上がる。月次ハードキャップ
 * （aiQuota.ts: profiles.ai_gen_count）でカウントされる既存経路はそのまま。
 * モデルを上げても無制限経路は新設しない。
 */

/** 軽タスク（問題生成・ヒント・チャット・要約 等）の既定モデル。現状維持の Haiku。 */
export const DEFAULT_AI_MODEL_LIGHT = 'claude-haiku-4-5-20251001'

/**
 * 採点・添削の既定モデル。Haiku と同世代(4.5)の上位 Sonnet（日付固定 ID）。
 * Keita 確認ポイント: 採点用モデル ID。原価とのトレードオフで別モデル（例 claude-sonnet-4-6）に
 * したい場合は env `AI_MODEL_GRADING` で上書きするか、この既定値を差し替える。
 */
export const DEFAULT_AI_MODEL_GRADING = 'claude-sonnet-4-5-20250929'

/** env 値を読み、未設定/空白のみなら既定値にフォールバックする小ヘルパー。 */
function readModel(raw: string | undefined, fallback: string): string {
  if (typeof raw !== 'string') return fallback
  const trimmed = raw.trim()
  return trimmed.length > 0 ? trimmed : fallback
}

/** 軽タスク用モデル ID を返す（env AI_MODEL_LIGHT、未設定なら Haiku 既定）。 */
export function aiModelLight(env: NodeJS.ProcessEnv = process.env): string {
  return readModel(env.AI_MODEL_LIGHT, DEFAULT_AI_MODEL_LIGHT)
}

/** 採点・添削用モデル ID を返す（env AI_MODEL_GRADING、未設定なら Sonnet 既定）。 */
export function aiModelGrading(env: NodeJS.ProcessEnv = process.env): string {
  return readModel(env.AI_MODEL_GRADING, DEFAULT_AI_MODEL_GRADING)
}
