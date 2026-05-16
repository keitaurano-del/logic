#!/usr/bin/env bash
# Update the Supabase Auth "Magic Link" email template so that the login email
# delivers a 6-digit OTP code (rendered from {{ .Token }}) instead of a magic
# link. The Logic app already calls `verifyOtp({ type: 'email' })`, so the only
# missing piece is the email body.
#
# Usage:
#   SUPABASE_ACCESS_TOKEN=sbp_xxx ./scripts/update-auth-email-template.sh
#
# Optional:
#   SUPABASE_PROJECT_REF   default: yctlelmlwjwlcpcxvmgx (Logic prod)
#   TEMPLATE_FILE          default: docs/auth-email-template-otp.html
#   SUBJECT_JA             default: "Logic 認証コード"
#
# Issue a Personal Access Token from:
#   https://supabase.com/dashboard/account/tokens

set -euo pipefail

: "${SUPABASE_ACCESS_TOKEN:?SUPABASE_ACCESS_TOKEN is required (see https://supabase.com/dashboard/account/tokens)}"

PROJECT_REF="${SUPABASE_PROJECT_REF:-yctlelmlwjwlcpcxvmgx}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
TEMPLATE_FILE="${TEMPLATE_FILE:-${SCRIPT_DIR}/../docs/auth-email-template-otp.html}"
SUBJECT="${SUBJECT_JA:-Logic 認証コード}"

if [[ ! -f "$TEMPLATE_FILE" ]]; then
  echo "ERROR: template file not found: $TEMPLATE_FILE" >&2
  exit 1
fi

if ! command -v jq >/dev/null 2>&1; then
  echo "ERROR: jq is required (brew install jq / apt-get install jq)" >&2
  exit 1
fi

CONTENT="$(cat "$TEMPLATE_FILE")"

PAYLOAD="$(jq -n \
  --arg subject "$SUBJECT" \
  --arg content "$CONTENT" \
  '{
    mailer_subjects_magic_link: $subject,
    mailer_templates_magic_link_content: $content
  }')"

echo "Updating Auth email template for project: ${PROJECT_REF}"
echo "Template source: ${TEMPLATE_FILE}"

HTTP_STATUS="$(curl -sS -o /tmp/supabase-auth-update.json -w '%{http_code}' \
  -X PATCH \
  -H "Authorization: Bearer ${SUPABASE_ACCESS_TOKEN}" \
  -H "Content-Type: application/json" \
  --data "$PAYLOAD" \
  "https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth")"

if [[ "$HTTP_STATUS" != "200" ]]; then
  echo "ERROR: Supabase API returned ${HTTP_STATUS}" >&2
  cat /tmp/supabase-auth-update.json >&2
  echo >&2
  exit 1
fi

echo "OK — Magic Link template now delivers the 6-digit OTP code ({{ .Token }})."
echo "Verify in: https://supabase.com/dashboard/project/${PROJECT_REF}/auth/templates"
