# SIMS Hospital VPS Deployment

This guide deploys the current React frontend + Node/Express backend + Prisma app to an Ubuntu 24.04 Hostinger VPS.

## Runtime Summary

- Frontend build output: `frontend/dist`
- Backend runtime: `backend/dist/src/server.js`
- Backend port: `4000`
- Static uploads served by backend: `/uploads`
- Database: PostgreSQL via `DATABASE_URL` and `DIRECT_URL`

## 1. Server Preparation

SSH to the server:

```bash
ssh root@147.93.104.13
```

Update packages and install base tools:

```bash
apt update && apt upgrade -y
apt install -y git nginx curl build-essential ca-certificates
```

## 2. Install Node.js 20 LTS

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs
node -v
npm -v
```

## 3. Install PM2

```bash
npm install -g pm2
pm2 startup systemd
pm2 save
```

Run the command printed by `pm2 startup systemd` if PM2 asks for it.

## 4. Clone the GitHub Organization Repo

```bash
mkdir -p /var/www
cd /var/www
git clone https://github.com/Kansalt-com/Sims_Hospital.git sims-hospital
cd sims-hospital
git checkout main
```

## 5. Backend Environment

Create the backend environment file:

```bash
cp backend/.env.example backend/.env
nano backend/.env
```

Recommended production values:

```env
NODE_ENV=production
PORT=4000
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=8h
DATABASE_URL=postgresql://postgres.project-ref:password@aws-1-region.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&schema=public
DIRECT_URL=postgresql://postgres.project-ref:password@aws-1-region.pooler.supabase.com:5432/postgres?schema=public
CORS_ORIGIN=https://www.kansalt.com
UPLOAD_DIR_PATH=./uploads
UPLOAD_URL_PATH=uploads
LOG_DIR=./logs
ENABLE_FILE_LOGGING=true
FRONTEND_DIST_DIR=../frontend/dist
INITIAL_ADMIN_NAME=Initial Administrator
INITIAL_ADMIN_USERNAME=admin
INITIAL_ADMIN_PASSWORD=replace-with-a-strong-admin-password
```

If you are serving directly by IP only for testing, use:

```env
CORS_ORIGIN=http://147.93.104.13
```

## 6. Frontend Environment

```bash
cp frontend/.env.example frontend/.env.production
nano frontend/.env.production
```

Recommended production values:

```env
VITE_APP_BASE_PATH=/sims/
VITE_API_BASE_URL=https://www.kansalt.com/sims/api
VITE_UPLOAD_BASE_URL=https://www.kansalt.com/sims
```

If testing by IP only:

```env
VITE_API_BASE_URL=http://147.93.104.13/api
VITE_UPLOAD_BASE_URL=http://147.93.104.13
```

## 7. Install and Build Backend

```bash
cd /var/www/sims-hospital/backend
npm ci
npx prisma generate
npx prisma db push
npm run build
```

For later schema changes after PostgreSQL-native migrations are added, switch back to `npx prisma migrate deploy`. On the first fresh bootstrap, keep `PRISMA_SCHEMA_SYNC_MODE=none` after the initial successful start.

Start backend with PM2:

```bash
pm2 start ecosystem.config.cjs --env production
pm2 save
pm2 status
```

The backend should now respond on:

```bash
curl http://127.0.0.1:4000/api/health
```

If there is no health route, validate the app by opening:

```bash
curl -I http://127.0.0.1:4000/api/auth/me
```

An auth response such as `401` still confirms the server is reachable.

## 8. Install and Build Frontend

```bash
cd /var/www/sims-hospital/frontend
npm ci
npm run build
```

## 9. Configure Nginx

Copy the prepared config:

```bash
cp /var/www/sims-hospital/deployment/nginx/sims-hospital.conf /etc/nginx/sites-available/sims-hospital
ln -sf /etc/nginx/sites-available/sims-hospital /etc/nginx/sites-enabled/sims-hospital
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
```

This config serves:

- frontend from `/var/www/sims-hospital/frontend/dist`
- backend API through `/api/`
- backend uploads through `/uploads/`

For `www.kansalt.com/sims`, use the ready-made domain template:

```bash
cp /var/www/sims-hospital/deployment/nginx/sims-hospital.domain.conf /etc/nginx/sites-available/sims-hospital
ln -sf /etc/nginx/sites-available/sims-hospital /etc/nginx/sites-enabled/sims-hospital
rm -f /etc/nginx/sites-enabled/default
nginx -t
systemctl restart nginx
```

That config:

- redirects `/` to `/sims/`
- redirects `/sims` to `/sims/`
- serves the frontend under `/sims/`
- proxies the API through `/sims/api/`
- proxies uploads through `/sims/uploads/`

The deployment script renders this template automatically for the live domain:

```bash
APP_BRANCH=main APP_DOMAIN=www.kansalt.com APP_BASE_PATH=/sims/ ./deployment/scripts/deploy-vps.sh
```

For a different domain, update:

```nginx
server_name yourdomain.com www.yourdomain.com;
```

## 10. Enable HTTPS

Install Certbot:

```bash
apt install -y certbot python3-certbot-nginx
```

Issue the certificate:

```bash
certbot --nginx -d kansalt.com -d www.kansalt.com
```

Test renewal:

```bash
certbot renew --dry-run
```

## 11. GitHub Actions Auto Deployment

The repo now includes:

- `.github/workflows/deploy.yml`

Required GitHub repository secrets:

- `SERVER_HOST` = `147.93.104.13`
- `SERVER_USER` = `root`
- `SERVER_SSH_KEY` = private SSH key
- `SERVER_PORT` = `22` (optional)

Workflow behavior on push to `main`:

1. SSH into VPS
2. Run the idempotent server script `deployment/scripts/deploy-vps.sh`
3. Reset code to `origin/main`
4. Install backend deps
5. Run `prisma generate`
6. Run Prisma schema sync for first bootstrap or deploy migrations after PostgreSQL-native migrations are in use
7. Build backend
8. Reload PM2
9. Install frontend deps
10. Build frontend
11. Reload Nginx

Current production workflow values:

```bash
APP_BRANCH=main APP_DOMAIN=www.kansalt.com APP_BASE_PATH=/sims/ ./deployment/scripts/deploy-vps.sh
```

## 12. Verification Commands

Check Nginx:

```bash
systemctl status nginx
nginx -t
```

Check PM2:

```bash
pm2 status
pm2 logs sims-backend --lines 100
```

Check backend locally:

```bash
curl http://127.0.0.1:4000/api/auth/me
```

Check frontend locally:

```bash
curl -I http://127.0.0.1
```

Check public app:

```bash
curl -I http://147.93.104.13
curl -I http://147.93.104.13/api/auth/me
```

After SSL:

```bash
curl -I https://www.kansalt.com/sims/
curl -I https://www.kansalt.com/sims/api/auth/me
```

## 13. Notes

- This deployment expects PostgreSQL-compatible `DATABASE_URL` and `DIRECT_URL` values.
- Make sure `/uploads` and `/logs` are backed up.
- PM2 process definition lives in `backend/ecosystem.config.cjs`.
- The deployment script lives in `deployment/scripts/deploy-vps.sh`.
