#!/usr/bin/env bash
set -euo pipefail

APP_ROOT="${APP_ROOT:-/var/www/sims-hospital}"
APP_BRANCH="${APP_BRANCH:-main}"
APP_DOMAIN="${APP_DOMAIN:-}"
APP_BASE_PATH="${APP_BASE_PATH:-/}"

normalize_base_path() {
  local value="${1:-/}"

  if [[ -z "${value}" || "${value}" == "/" ]]; then
    echo "/"
    return
  fi

  if [[ "${value}" != /* ]]; then
    value="/${value}"
  fi

  if [[ "${value}" != */ ]]; then
    value="${value}/"
  fi

  echo "${value}"
}

echo "Deploying SIMS Hospital from branch: ${APP_BRANCH}"

cd "${APP_ROOT}"
git fetch origin
git checkout "${APP_BRANCH}"
git reset --hard "origin/${APP_BRANCH}"

mkdir -p backend/uploads backend/logs
APP_BASE_PATH="$(normalize_base_path "${APP_BASE_PATH}")"
APP_BASE_PREFIX="${APP_BASE_PATH%/}"
if [[ "${APP_BASE_PREFIX}" == "" ]]; then
  APP_BASE_PREFIX="/"
fi

if [[ -n "${APP_DOMAIN}" ]]; then
  APP_ORIGIN="https://${APP_DOMAIN}"
  FRONTEND_BASE_PREFIX="${APP_BASE_PATH%/}"
  if [[ "${FRONTEND_BASE_PREFIX}" == "" ]]; then
    FRONTEND_BASE_PREFIX=""
  fi

  cat > frontend/.env.production <<EOF
VITE_APP_BASE_PATH=${APP_BASE_PATH}
VITE_API_BASE_URL=${APP_ORIGIN}${FRONTEND_BASE_PREFIX}/api
VITE_UPLOAD_BASE_URL=${APP_ORIGIN}${FRONTEND_BASE_PREFIX}
EOF

  if [[ -f backend/.env ]]; then
    if grep -q '^CORS_ORIGIN=' backend/.env; then
      sed -i "s|^CORS_ORIGIN=.*|CORS_ORIGIN=${APP_ORIGIN}|" backend/.env
    else
      echo "CORS_ORIGIN=${APP_ORIGIN}" >> backend/.env
    fi
  fi
fi

cd backend
npm ci
npx prisma generate
if [[ "${PRISMA_SCHEMA_SYNC_MODE:-dbpush}" == "migrate" ]]; then
  npx prisma migrate deploy
else
  npx prisma db push
fi
npm run build
pm2 startOrReload ecosystem.config.cjs --env production
pm2 save

cd ../frontend
npm ci
npm run build

if [[ -n "${APP_DOMAIN}" ]]; then
  sed \
    -e "s|__SIMS_SERVER_NAME__|${APP_DOMAIN} kansalt.com|g" \
    -e "s|__SIMS_CANONICAL_HOST__|${APP_DOMAIN}|g" \
    -e "s|__SIMS_BASE_PATH__|${APP_BASE_PATH}|g" \
    -e "s|__SIMS_BASE_PREFIX__|${APP_BASE_PREFIX}|g" \
    "${APP_ROOT}/deployment/nginx/sims-hospital.domain.conf" > /etc/nginx/sites-available/sims-hospital
else
  cp "${APP_ROOT}/deployment/nginx/sims-hospital.conf" /etc/nginx/sites-available/sims-hospital
fi

sudo nginx -t
sudo systemctl reload nginx

echo "Deployment completed successfully."
