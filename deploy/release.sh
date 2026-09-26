#!/usr/bin/env bash
# Release NordicRate on the server, from the server.
#
# The Windows machine is not part of the deploy path: this pulls `main` from
# GitHub (the repository is public, so no key is needed), installs, builds,
# reloads pm2 and checks that the site answers. If it does not, the previous
# commit and the previous build are put back.
#
#   /var/www/nordicrate/deploy/release.sh           # release main if it moved
#   /var/www/nordicrate/deploy/release.sh --force   # rebuild at the same commit
#   /var/www/nordicrate/deploy/release.sh --check   # say what would happen
#
# Exit codes: 0 released or already current, 1 nothing to do under --check,
# 2 install/build failed (previous release restored), 3 unhealthy after reload
# (previous release restored), 4 another release is already running.
#
# Known limitation: `next build` writes into .next in place, so during a build
# the running process can serve a missing chunk for a few seconds. That is the
# same behaviour the manual redeploy had; fixing it needs a standalone build
# swapped atomically, which is a separate change.

set -Eeuo pipefail

ROOT=/var/www/nordicrate
BRANCH=main
APP=nordicrate
# Overridable so the rollback path can be exercised on purpose:
#   HEALTH_URL=http://localhost:9/ HEALTH_TRIES=1 deploy/release.sh --force
HEALTH_URL=${HEALTH_URL:-http://localhost:3001/}
LOCK=/var/lock/nordicrate-release.lock
BUILD_MEM=${BUILD_MEM:-1536}   # MB; the box has 3.8 GB and seven pm2 apps
HEALTH_TRIES=${HEALTH_TRIES:-10}
HEALTH_WAIT=${HEALTH_WAIT:-3}

log() { printf '%s  %s\n' "$(date '+%Y-%m-%d %H:%M:%S')" "$*"; }
die() { log "ERROR: $*"; exit "${2:-1}"; }

FORCE=0
CHECK=0
for arg in "$@"; do
  case "$arg" in
    --force) FORCE=1 ;;
    --check) CHECK=1 ;;
    *) die "unknown argument: $arg" ;;
  esac
done

# One release at a time. A second run while a build is in flight would corrupt .next.
exec 9>"$LOCK"
flock -n 9 || { log "another release is running; nothing done"; exit 4; }

cd "$ROOT"

git fetch --quiet origin "$BRANCH"
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse "origin/$BRANCH")

if [ "$LOCAL" = "$REMOTE" ] && [ "$FORCE" -eq 0 ]; then
  log "already at ${LOCAL:0:7}; nothing to do"
  [ "$CHECK" -eq 1 ] && exit 1
  exit 0
fi

if [ "$CHECK" -eq 1 ]; then
  log "would release ${LOCAL:0:7} -> ${REMOTE:0:7}"
  git --no-pager log --oneline "$LOCAL..$REMOTE" | head -20
  exit 0
fi

log "releasing ${LOCAL:0:7} -> ${REMOTE:0:7}"

# Keep the last good build so a failed release can be undone without a rebuild.
rm -rf .next.prev
[ -d .next ] && cp -a .next .next.prev

restore() {
  log "restoring ${LOCAL:0:7}"
  git reset --hard --quiet "$LOCAL"
  if [ -d .next.prev ]; then
    rm -rf .next
    mv .next.prev .next
  fi
  pm2 restart "$APP" --update-env >/dev/null 2>&1 || true
}

git reset --hard --quiet "$REMOTE"

if ! npm install --no-audit --no-fund; then
  restore
  die "npm install failed" 2
fi

if ! NODE_OPTIONS="--max-old-space-size=$BUILD_MEM" nice -n 10 npm run build; then
  restore
  die "build failed" 2
fi

pm2 reload "$APP" --update-env >/dev/null

healthy=0
for i in $(seq 1 "$HEALTH_TRIES"); do
  if curl -sf -o /dev/null --max-time 10 "$HEALTH_URL"; then
    healthy=1
    break
  fi
  log "health check $i/$HEALTH_TRIES failed; retrying in ${HEALTH_WAIT}s"
  sleep "$HEALTH_WAIT"
done

if [ "$healthy" -ne 1 ]; then
  restore
  die "unhealthy after reload" 3
fi

rm -rf .next.prev
log "released ${REMOTE:0:7} — healthy"
