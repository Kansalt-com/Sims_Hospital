#!/usr/bin/env sh
set -eu

APP_ROOT="/home/site/wwwroot"
PERSIST_ROOT="/home/site"
MARKER_FILE="${PERSIST_ROOT}/.backend_deps_ready"
STARTUP_LOG="${PERSIST_ROOT}/logs/startup.log"

mkdir -p "${PERSIST_ROOT}/data" "${PERSIST_ROOT}/uploads" "${PERSIST_ROOT}/logs"

log() {
  printf '%s %s\n' "$(date -u +"%Y-%m-%dT%H:%M:%SZ")" "$1" | tee -a "${STARTUP_LOG}"
}

log "startup.begin"

if [ -f "${APP_ROOT}/backend/data/sims.db" ] && [ ! -f "${PERSIST_ROOT}/data/sims.db" ]; then
  cp "${APP_ROOT}/backend/data/sims.db" "${PERSIST_ROOT}/data/sims.db"
  log "startup.seeded_database"
fi

if [ -d "${APP_ROOT}/backend/uploads" ] && [ -z "$(find "${PERSIST_ROOT}/uploads" -mindepth 1 -print -quit 2>/dev/null)" ]; then
  cp -R "${APP_ROOT}/backend/uploads/." "${PERSIST_ROOT}/uploads/" 2>/dev/null || true
  log "startup.seeded_uploads"
fi

if [ ! -f "${MARKER_FILE}" ] || [ "${APP_ROOT}/backend/package-lock.json" -nt "${MARKER_FILE}" ] || [ ! -d "${APP_ROOT}/backend/node_modules" ]; then
  log "startup.installing_backend_dependencies"
  npm ci --prefix "${APP_ROOT}/backend" --include=dev 2>&1 | tee -a "${STARTUP_LOG}"
  (
    cd "${APP_ROOT}/backend"
    log "startup.generating_prisma_client"
    npx prisma generate 2>&1 | tee -a "${STARTUP_LOG}"
  )
  touch "${MARKER_FILE}"
  log "startup.backend_dependencies_ready"
fi

cd "${APP_ROOT}/backend"
log "startup.launching_server"
exec node dist/src/server.js
