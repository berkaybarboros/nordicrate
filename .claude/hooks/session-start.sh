#!/bin/bash
# Prepares a Claude Code on the web session: installs dependencies so lint,
# tests and build work from the first prompt. Local checkouts (Windows) are
# left alone.
set -euo pipefail

if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "${CLAUDE_PROJECT_DIR:-$(dirname "$0")/../..}"

# The web environment ships Chromium under PLAYWRIGHT_BROWSERS_PATH; never download another.
export PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1

# Not `npm ci`: the container is cached after this hook and a plain install
# reuses that cache. CI still enforces the lockfile.
npm install --no-audit --no-fund --prefer-offline

echo 'export NEXT_TELEMETRY_DISABLED=1' >> "${CLAUDE_ENV_FILE:-/dev/null}"
