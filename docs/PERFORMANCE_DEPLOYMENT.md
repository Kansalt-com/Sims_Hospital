# Performance And Zero-Downtime Deployment

## What changed

- Added patient list caching for 5 minutes
- Added paginated and capped search
- Added gzip compression
- Added metrics endpoint at `/api/metrics`
- Added Excel bulk upload API at `POST /api/patients/bulk-upload`
- Added code-split frontend routes
- Added DB index migration at `backend/prisma/migrations/202603270001_performance_indexes/migration.sql`

## Bulk upload

Endpoint:

```bash
POST /api/patients/bulk-upload
Content-Type: multipart/form-data
field name: file
```

Required columns:

- `name`
- `age`
- `phone`

Optional columns:

- `gender`
- `address`
- `idProof`

## Deploy steps

### 1. Apply DB migration

```bash
cd backend
npx prisma migrate deploy
```

### 2. Build app

```bash
npm --prefix backend ci
npm --prefix backend run build
npm --prefix frontend ci
npm --prefix frontend run build
```

### 3. PM2 zero-downtime restart

```bash
npm install -g pm2
pm2 start ecosystem.config.cjs
pm2 reload sims-hms
```

### 4. Docker image

```bash
docker build -t sims-hms:latest .
```

### 5. Rolling deployment

- Run at least 2 app instances behind a reverse proxy/load balancer
- Deploy one instance at a time
- Wait for `/api/health` to return `200`
- Then rotate traffic to the updated instance

## Monitoring

- Health: `/api/health`
- Metrics: `/api/metrics`
- Request timings are logged in backend logs
- Requests slower than 500ms should be reviewed from logs and metrics
