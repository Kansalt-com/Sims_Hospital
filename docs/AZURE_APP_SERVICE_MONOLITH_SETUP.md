# Azure App Service Monolith Setup

## Final Structure

```text
/app
  /dist
    /backend
      /dist
      /public
      /prisma
      /node_modules
    start-appservice.sh
    manifest.json
/backend
/frontend
```

The source code stays in `backend/` and `frontend/`.
The production-ready runtime artifact is generated in `app/dist/`.

## Build Flow

1. `frontend` builds directly into `backend/public`
2. `backend` compiles TypeScript into `backend/dist`
3. `npm prune --omit=dev` removes backend dev dependencies
4. `scripts/package-monolith.mjs` assembles a ready-to-run runtime in `app/dist`

## Azure App Service Settings

Use Linux App Service, Node.js LTS, Basic `B1`, `2` instances.

Required app settings:

```text
NODE_ENV=production
PORT=8080
JWT_SECRET=<strong-random-secret>
DATABASE_URL=<supabase pooled postgres url>
DIRECT_URL=<supabase direct postgres url>
SUPABASE_URL=<project url>
SUPABASE_KEY=<service or anon key only if backend needs it>
CORS_ORIGIN=<your app url>
UPLOAD_DIR_PATH=/home/site/uploads
UPLOAD_URL_PATH=uploads
ENABLE_FILE_LOGGING=true
LOG_DIR=/home/site/logs
PRISMA_SCHEMA_SYNC_MODE=none
```

Recommended:

```text
WEBSITE_HEALTHCHECK_PATH=/api/health
SCM_DO_BUILD_DURING_DEPLOYMENT=false
```

Startup command:

```text
sh start-appservice.sh
```

## GitHub Secrets

Add these repository secrets:

```text
AZURE_WEBAPP_NAME
AZURE_CREDENTIALS
JWT_SECRET
DATABASE_URL
DIRECT_URL
CORS_ORIGIN
```

`AZURE_CREDENTIALS` should contain the full JSON output from:

```text
az ad sp create-for-rbac --sdk-auth ...
```

Optional if the backend will use Supabase APIs directly:

```text
SUPABASE_URL
SUPABASE_KEY
```

## Deployment Steps

1. Push to `main`
2. GitHub Actions builds frontend and backend
3. GitHub Actions packages a ZIP artifact
4. GitHub deploys the ZIP to App Service
5. App Service only runs `sh start-appservice.sh`
6. Node starts immediately with `backend/dist/src/server.js`

## Why This Is Stable

- no `npm install` at runtime
- no frontend build at runtime
- no TypeScript compile at runtime
- one monolith process
- health check stays on `/api/health`
