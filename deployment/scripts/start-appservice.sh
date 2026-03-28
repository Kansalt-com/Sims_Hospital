#!/usr/bin/env sh
set -eu

APP_ROOT="/home/site/wwwroot"
PERSIST_ROOT="/home/site"
STARTUP_LOG="${PERSIST_ROOT}/logs/startup.log"
PRISMA_SCHEMA_SYNC_MODE="${PRISMA_SCHEMA_SYNC_MODE:-none}"
BACKEND_ROOT="${APP_ROOT}/backend"

mkdir -p "${PERSIST_ROOT}/uploads" "${PERSIST_ROOT}/logs"

log() {
  printf '%s %s\n' "$(date -u +"%Y-%m-%dT%H:%M:%SZ")" "$1" | tee -a "${STARTUP_LOG}"
}

log "startup.begin"

if [ ! -d "${APP_ROOT}/frontend-dist" ] && [ -d "${APP_ROOT}/frontend/dist" ]; then
  cp -R "${APP_ROOT}/frontend/dist" "${APP_ROOT}/frontend-dist"
  log "startup.seeded_frontend_dist"
fi

if [ -d "${BACKEND_ROOT}/uploads" ] && [ -z "$(find "${PERSIST_ROOT}/uploads" -mindepth 1 -print -quit 2>/dev/null)" ]; then
  cp -R "${BACKEND_ROOT}/uploads/." "${PERSIST_ROOT}/uploads/" 2>/dev/null || true
  log "startup.seeded_uploads"
fi

if [ ! -d "${BACKEND_ROOT}/node_modules" ]; then
  log "startup.missing_backend_node_modules"
  exit 1
fi

if [ ! -f "${BACKEND_ROOT}/dist/src/server.js" ]; then
  log "startup.missing_backend_dist"
  exit 1
fi

if [ "${PRISMA_SCHEMA_SYNC_MODE}" = "dbpush" ]; then
  (
    cd "${BACKEND_ROOT}"
    log "startup.syncing_schema_via_dbpush"
    npx prisma db push --skip-generate 2>&1 | tee -a "${STARTUP_LOG}"
  )
elif [ "${PRISMA_SCHEMA_SYNC_MODE}" = "migrate" ]; then
  (
    cd "${BACKEND_ROOT}"
    log "startup.applying_prisma_migrations"
    npx prisma migrate deploy 2>&1 | tee -a "${STARTUP_LOG}"
  )
fi

cd "${BACKEND_ROOT}"
log "startup.launching_server"
exec node dist/src/server.js
