-- 029_sync_telemetry_api_only.sql
-- 2026-05-24: sync_telemetry の insert 経路を API 経由のみに統一
--
-- 背景 (REVIEW_REPORT_20260524 高#3):
--   028 では「本人 (auth.uid() = user_id) なら insert OK」という RLS policy で、
--   クライアント直接 insert と /api/sync-telemetry 経由の二重経路が許容されていた。
--   現状クライアントコードは API 経由のみだが、policy が残っていると
--   将来直接 insert する経路が増えた際に検証ロジックを二重メンテすることになる。
--
-- 方針:
--   - 通常 user (auth.uid() で動く anon / authenticated) からの insert は禁止する
--   - サーバー側の /api/sync-telemetry は service_role key で動くため RLS bypass で動作継続
--   - これで「insert は API 経由のみ」という運用が DB レベルで強制される
--
-- 影響:
--   - クライアント (browser, Capacitor) からの supabase.from('sync_telemetry').insert は失敗するようになる
--     (現状そのような経路は存在しないので無影響)
--   - サーバー (/api/sync-telemetry) からの insert はそのまま通る (service_role bypass)
--
-- ロールバック: 028 の policy を再作成すれば戻せる。

DROP POLICY IF EXISTS "Users can insert own telemetry" ON public.sync_telemetry;

-- 明示的な insert ポリシーは作らず、RLS デフォルト deny で
-- service_role 以外からの insert を全拒否する。

COMMENT ON TABLE public.sync_telemetry IS
  'Device sync telemetry. One row per /api/sync-telemetry call (sync attempt completion). '
  'Insert は API 経由 (service_role) のみ。クライアントから直接 insert は不可 (029 migration)。';
