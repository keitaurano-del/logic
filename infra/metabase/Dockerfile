# Metabase analytics dashboard for Logic
#
# 本家公式 image `metabase/metabase` をそのまま使う薄いラッパー。
# Render の Web Service として deploy する想定。
#
# 環境変数（Render Dashboard で設定）:
#   MB_DB_TYPE=postgres
#   MB_DB_HOST=<supabase-pooler-host>
#   MB_DB_PORT=6543
#   MB_DB_DBNAME=postgres
#   MB_DB_USER=metabase_app          # Metabase 自身のメタデータ保存用 (read-only ではない)
#   MB_DB_PASS=<password>
#   MB_SITE_URL=https://logic-metabase.onrender.com
#   MB_ENCRYPTION_SECRET_KEY=<random 32+ chars>
#   JAVA_TIMEZONE=Asia/Tokyo
#
# 注意:
#   - Metabase 自身が使う app DB (MB_DB_*) と、ダッシュボードが読む analytics DB は別物。
#     analytics DB の接続は Metabase 初回ログイン後に Admin > Databases から `metabase_readonly`
#     ロールで追加する。
#   - Render free tier は 15 分アイドルでスリープするので、初回アクセスに 30 秒程度かかる。
#     業務利用が増えたら starter プラン (USD 7/mo) への昇格を検討。
#   - 公式 image は内部で 3000 番ポートを listen する。Render はそれを自動検出する。

FROM metabase/metabase:v0.50.20

ENV MB_JETTY_PORT=3000 \
    JAVA_TIMEZONE=Asia/Tokyo \
    MB_SEND_NEW_SSO_USER_ADMIN_EMAIL=false

EXPOSE 3000

# 公式 image のデフォルト ENTRYPOINT (/app/run_metabase.sh) をそのまま使う
