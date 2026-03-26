#!/usr/bin/env sh
set -eu

APP_ROOT="/home/site/wwwroot"
PERSIST_ROOT="/home/site"
MARKER_FILE="${PERSIST_ROOT}/.backend_deps_ready"
LOCK_HASH_FILE="${PERSIST_ROOT}/.backend_lock_hash"
PERSIST_NODE_MODULES="${PERSIST_ROOT}/backend_node_modules"
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

CURRENT_LOCK_HASH="$(sha256sum "${APP_ROOT}/backend/package-lock.json" | awk '{print $1}')"
PREVIOUS_LOCK_HASH="$(cat "${LOCK_HASH_FILE}" 2>/dev/null || true)"

if [ -d "${PERSIST_NODE_MODULES}" ] && [ ! -e "${APP_ROOT}/backend/node_modules" ]; then
  ln -s "${PERSIST_NODE_MODULES}" "${APP_ROOT}/backend/node_modules"
  log "startup.linked_cached_node_modules"
fi

if [ ! -f "${MARKER_FILE}" ] || [ "${CURRENT_LOCK_HASH}" != "${PREVIOUS_LOCK_HASH}" ] || [ ! -d "${PERSIST_NODE_MODULES}" ]; then
  log "startup.installing_backend_dependencies"
  rm -rf "${PERSIST_NODE_MODULES}"
  npm ci --prefix "${APP_ROOT}/backend" --include=dev 2>&1 | tee -a "${STARTUP_LOG}"
  if [ -d "${APP_ROOT}/backend/node_modules" ]; then
    mv "${APP_ROOT}/backend/node_modules" "${PERSIST_NODE_MODULES}"
    ln -s "${PERSIST_NODE_MODULES}" "${APP_ROOT}/backend/node_modules"
  fi
  (
    cd "${APP_ROOT}/backend"
    log "startup.generating_prisma_client"
    npx prisma generate 2>&1 | tee -a "${STARTUP_LOG}"
  )
  printf '%s' "${CURRENT_LOCK_HASH}" > "${LOCK_HASH_FILE}"
  touch "${MARKER_FILE}"
  log "startup.backend_dependencies_ready"
fi

cd "${APP_ROOT}/backend"
log "startup.launching_server"
exec node dist/src/server.js
