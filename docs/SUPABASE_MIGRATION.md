# Supabase Migration

This app is now configured for PostgreSQL-compatible Prisma usage so it can run on Supabase.

## What changed

- Prisma datasource provider is now `postgresql`
- Azure/VPS startup no longer depends on a local SQLite database file
- Schema sync mode is configurable with `PRISMA_SCHEMA_SYNC_MODE`
- Deployment defaults to `prisma db push` for the first Supabase cutover because the existing historical SQL migrations are SQLite-specific

## Required Supabase values

Create a Supabase project and collect:

- `Project URL`
- `Database password`
- `Connection string`

Use the pooled Postgres connection string in `DATABASE_URL` and the direct migration/admin connection in `DIRECT_URL`, for example:

```bash
DATABASE_URL="postgresql://postgres.<project-ref>:<password>@aws-1-<region>.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&schema=public"
DIRECT_URL="postgresql://postgres.<project-ref>:<password>@aws-1-<region>.pooler.supabase.com:5432/postgres?schema=public"
```

Prisma will use `DIRECT_URL` for schema operations and `DATABASE_URL` for runtime connections.

## First-time schema setup

Because the earlier Prisma SQL migrations were generated for SQLite, the safest first Supabase bootstrap is:

```bash
cd backend
npx prisma generate
npx prisma db push
```

After the first cutover, future schema changes should be managed with PostgreSQL-native Prisma migrations.

## Local development

1. Start a local Postgres-compatible database or Supabase local stack.
2. Set `DATABASE_URL` and `DIRECT_URL` in `backend/.env`
3. Run:

```bash
npm --prefix backend ci
npm --prefix backend run prisma:generate
npm --prefix backend run prisma:push
npm --prefix backend run build
```

## Azure App Service

Set these app settings:

```bash
DATABASE_URL=<supabase-postgres-url>
DIRECT_URL=<supabase-direct-url>
PRISMA_SCHEMA_SYNC_MODE=dbpush
INITIAL_ADMIN_NAME=<initial-admin-name>
INITIAL_ADMIN_USERNAME=<initial-admin-username>
INITIAL_ADMIN_PASSWORD=<initial-admin-password>
UPLOAD_DIR_PATH=/home/site/uploads
LOG_DIR=/home/site/logs
```

After the first successful boot and schema sync, you can change:

```bash
PRISMA_SCHEMA_SYNC_MODE=none
```

That avoids schema work on every restart.

## VPS deployment

Example:

```bash
PRISMA_SCHEMA_SYNC_MODE=dbpush \
APP_BRANCH=main \
APP_DOMAIN=www.kansalt.com \
APP_BASE_PATH=/hms/sims/ \
./deployment/scripts/deploy-vps.sh
```

## Fresh empty database note

If you are starting with a fresh empty Supabase database, no legacy data import is required.

For a clean bootstrap:

1. Point `DATABASE_URL` and `DIRECT_URL` to Supabase
2. Set `INITIAL_ADMIN_USERNAME` and `INITIAL_ADMIN_PASSWORD`
3. Boot the app with `PRISMA_SCHEMA_SYNC_MODE=dbpush`
4. Sign in with the initial admin and change the password
5. Verify `/api/health`
6. Change `PRISMA_SCHEMA_SYNC_MODE=none`
