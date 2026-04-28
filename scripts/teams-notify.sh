#!/bin/bash
# Teams 通知スクリプト
# 使い方: ./scripts/teams-notify.sh <channel> <message>
# channel: build | release | bugs | product

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/../.env.teams"

CHANNEL="$1"
CONTENT="$2"
IMPORTANCE="${3:-normal}"

case "$CHANNEL" in
  build)   CHANNEL_ID="$TEAMS_CHANNEL_BUILD" ;;
  release) CHANNEL_ID="$TEAMS_CHANNEL_RELEASE" ;;
  bugs)    CHANNEL_ID="$TEAMS_CHANNEL_BUGS" ;;
  product) CHANNEL_ID="$TEAMS_CHANNEL_PRODUCT" ;;
  *)
    echo "Error: unknown channel '$CHANNEL'. Use: build | release | bugs | product"
    exit 1
    ;;
esac

gsk teams send \
  --channel_type teams_channel \
  --team_id "$TEAMS_TEAM_ID" \
  --channel_id "$CHANNEL_ID" \
  --content "$CONTENT" \
  --importance "$IMPORTANCE"
