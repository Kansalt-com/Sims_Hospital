# Production Runbook

## Required Environment Variables

Backend:

- `JWT_SECRET`
- `DATABASE_URL`
- `PORT`
- `CORS_ORIGIN`
- `UPLOAD_DIR_PATH`
- `LOG_DIR`

Frontend:

- `VITE_API_BASE_URL`
- `VITE_UPLOAD_BASE_URL`

Reference files:

- [`backend/.env.example`](/d:/Hospital management/backend/.env.example)
- [`frontend/.env.example`](/d:/Hospital management/frontend/.env.example)

## Startup Order

1. Build frontend and backend.
2. Start backend with `FRONTEND_DIST_DIR` pointing to the built frontend.
3. On first startup the backend:
   - syncs or applies schema changes based on `PRISMA_SCHEMA_SYNC_MODE`
   - creates the permission catalog if missing
   - creates hospital settings
   - creates the initial admin only if `INITIAL_ADMIN_USERNAME` and `INITIAL_ADMIN_PASSWORD` are provided and no active admin exists
   - seeds default room and bed inventory if missing

## Operational Checks

- `GET /api/health` should return `ok: true`
- Dashboard must load without 5xx errors
- `rooms` endpoint should expose available beds
- Invoice creation should produce `Payment` rows
- Audit events should appear in `AuditLog`

## Azure Guidance

- Use Azure App Service for the application container
- Store uploads in persistent storage or extend to Azure Blob Storage
- Use Azure PostgreSQL or another managed PostgreSQL-compatible service for multi-instance production
- Forward logs to Azure Application Insights using the existing structured backend log path

## Recommended Next Step For Multi-Hospital SaaS

The current refactor productionizes the hospital workflow on a single-tenant data model. For full multi-hospital SaaS rollout, add:

- tenant isolation on every major table
- SSO or Azure AD
- external object storage
- managed relational database
- queue-backed background jobs for exports, notifications, and long reports
