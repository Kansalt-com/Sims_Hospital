#!/usr/bin/env sh
set -eu

APP_ROOT="/home/site/wwwroot"
PERSIST_ROOT="/home/site"
RUNTIME_DB_PATH="/tmp/sims.db"
MARKER_FILE="${PERSIST_ROOT}/.backend_deps_ready"
LOCK_HASH_FILE="${PERSIST_ROOT}/.backend_lock_hash"
RUNTIME_BACKEND_ROOT="${PERSIST_ROOT}/backend-runtime"
STARTUP_LOG="${PERSIST_ROOT}/logs/startup.log"

mkdir -p "${PERSIST_ROOT}/data" "${PERSIST_ROOT}/uploads" "${PERSIST_ROOT}/logs"

log() {
  printf '%s %s\n' "$(date -u +"%Y-%m-%dT%H:%M:%SZ")" "$1" | tee -a "${STARTUP_LOG}"
}

log "startup.begin"

if [ ! -d "${APP_ROOT}/frontend-dist" ] && [ -d "${APP_ROOT}/frontend/dist" ]; then
  cp -R "${APP_ROOT}/frontend/dist" "${APP_ROOT}/frontend-dist"
  log "startup.seeded_frontend_dist"
fi

if [ -f "${APP_ROOT}/backend/data/sims.db" ] && [ ! -f "${PERSIST_ROOT}/data/sims.db" ]; then
  cp "${APP_ROOT}/backend/data/sims.db" "${PERSIST_ROOT}/data/sims.db"
  log "startup.seeded_database"
fi

if [ -f "${PERSIST_ROOT}/data/sims.db" ]; then
  cp "${PERSIST_ROOT}/data/sims.db" "${RUNTIME_DB_PATH}"
  export DATABASE_URL="file:${RUNTIME_DB_PATH}"
  log "startup.prepared_runtime_database"
fi

if [ -d "${APP_ROOT}/backend/uploads" ] && [ -z "$(find "${PERSIST_ROOT}/uploads" -mindepth 1 -print -quit 2>/dev/null)" ]; then
  cp -R "${APP_ROOT}/backend/uploads/." "${PERSIST_ROOT}/uploads/" 2>/dev/null || true
  log "startup.seeded_uploads"
fi

CURRENT_LOCK_HASH="$(sha256sum "${APP_ROOT}/backend/package-lock.json" | awk '{print $1}')"
PREVIOUS_LOCK_HASH="$(cat "${LOCK_HASH_FILE}" 2>/dev/null || true)"
APP_NODE_MODULES="${RUNTIME_BACKEND_ROOT}/node_modules"

rm -rf "${RUNTIME_BACKEND_ROOT}"
mkdir -p "${RUNTIME_BACKEND_ROOT}"
cp -R "${APP_ROOT}/backend/." "${RUNTIME_BACKEND_ROOT}/"
rm -rf "${RUNTIME_BACKEND_ROOT}/node_modules"
log "startup.prepared_runtime_backend"

log "startup.installing_backend_dependencies"
npm ci --prefix "${RUNTIME_BACKEND_ROOT}" --include=dev 2>&1 | tee -a "${STARTUP_LOG}"
(
  cd "${RUNTIME_BACKEND_ROOT}"
  log "startup.building_backend"
  npm run build 2>&1 | tee -a "${STARTUP_LOG}"
  log "startup.generating_prisma_client"
  npx prisma generate 2>&1 | tee -a "${STARTUP_LOG}"
)
printf '%s' "${CURRENT_LOCK_HASH}" > "${LOCK_HASH_FILE}"
touch "${MARKER_FILE}"
log "startup.backend_dependencies_ready"

cd "${RUNTIME_BACKEND_ROOT}"
log "startup.launching_server"
exec node dist/src/server.js
