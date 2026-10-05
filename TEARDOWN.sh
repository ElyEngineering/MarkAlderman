#!/usr/bin/env bash
# Tear down temporary preview for Quiet Counsel
set -euo pipefail
ROOT="$(cd "$(dirname "$0")" && pwd)"
kill "$(cat "$ROOT/tunnel.pid")" 2>/dev/null || true
kill "$(cat "$ROOT/server.pid")" 2>/dev/null || pkill -f 'serve -l 4173' || true
pkill -f 'cloudflared tunnel --url http://127.0.0.1:4173' 2>/dev/null || true
echo "Stopped server + tunnel."
