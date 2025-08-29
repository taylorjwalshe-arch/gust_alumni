#!/usr/bin/env bash
set -euo pipefail
pnpm dev & 
DEV_PID=$!
sleep 4
echo "----- GET /api/debug/prisma-models"
curl -s http://localhost:3000/api/debug/prisma-models || true
echo
echo "----- GET /api/mentors (first 500 chars)"
curl -s http://localhost:3000/api/mentors | head -c 500 || true
echo
kill $DEV_PID >/dev/null 2>&1 || true
