# Optimization Report

## Scope

This pass focused on production-safe backend performance work for the hospital management application running on Express, Prisma, and PostgreSQL.

## Top Bottlenecks Found

- Patient search was using broad `contains` filters without strong search-specific indexing.
- List endpoints were inconsistent on pagination and some returned unnecessarily heavy nested payloads.
- Auth reloaded user state and role permissions from the database on every request.
- Cache invalidation was inconsistent, and some cache keys did not match the prefixes being cleared.
- Dashboard and analytics paths were loading more invoice/report data into memory than necessary.
- Slow requests and slow database calls were not surfaced clearly enough in production logs.
- Expensive endpoints had little protection against bursty repeated calls.

## Fixes Applied

### Query and API optimization

- Standardized pagination defaults to `20` and max page size to `100`.
- Normalized search input handling for patient, visit, invoice, IPD, doctor, user, and prescription list flows.
- Added paginated responses to doctor, user, and prescription list endpoints.
- Tightened list queries to prefer selected fields over wide `include` trees where possible.
- Improved patient search behavior to prioritize exact/prefix matching for phone and MRN, while keeping flexible text search for names.
- Improved invoice, visit, and IPD search filters to use safer and more index-friendly matching patterns.

### Caching

- Rebuilt the in-memory cache utility to support:
  - cache reads
  - cache writes
  - deduplicated in-flight fetches
  - prefix-based invalidation
- Added cache prefix helpers and centralized invalidation for:
  - auth/user cache
  - patient cache
  - doctor cache
  - settings cache
  - room cache
  - prescription cache
  - dashboard/report cache
- Cached:
  - role permissions
  - authenticated user snapshots
  - doctor lists
  - room master data
  - settings/public settings
  - prescription lists
  - patient list/search results
  - dashboard snapshots
  - analytics reports

### Auth and concurrency

- Reduced auth overhead by caching validated user snapshots keyed by `userId + sessionVersion`.
- Cached role permissions instead of re-querying them on every request.
- Preserved session invalidation behavior because the cache key includes the user `updatedAt` version embedded in the token.

### Reporting and billing paths

- Optimized dashboard recent collection reads to fetch only needed fields.
- Reduced analytics overfetching by splitting invoice summary reads from invoice item reads.
- Added transaction-side report cache invalidation on:
  - visit creation/status updates
  - invoice create/payment/item update/cancel
  - IPD create/update/discharge
  - payment creation

### Abuse protection and hardening

- Added lightweight in-memory rate limiting for:
  - patient search/list endpoints
  - dashboard and analytics endpoints
  - analytics export endpoint
- Kept validation on request query/body/params and tightened list handling around sanitized search input.

### Observability

- Added slow request visibility with structured logging and metrics.
- Added Prisma query event monitoring with slow-query logging and metric capture.
- Added request/slow-request and query/slow-query snapshots to `/api/metrics`.

## Endpoints Optimized

- `/api/patients`
- `/api/patients/search`
- `/api/doctors`
- `/api/users`
- `/api/prescriptions`
- `/api/reports/dashboard`
- `/api/reports/analytics`
- `/api/reports/analytics/export`
- Internal list/search logic for visits, invoices, and IPD services
- Auth login/session validation path

## Indexes Added

### Prisma-managed indexes

- `User(role, active)`
- `User(updatedAt)`
- `Patient(active, createdAt)`
- `Patient(active, updatedAt)`
- `Visit(createdAt)`
- `Visit(status, scheduledAt)`
- `Visit(doctorId, status, scheduledAt)`
- `Visit(patientId, createdAt)`
- `Prescription(doctorId, createdAt)`
- `Prescription(patientId, createdAt)`
- `Invoice(invoiceType, createdAt)`
- `Invoice(patientId, paymentStatus, createdAt)`
- `DoctorProfile(specialization)`
- `IPDAdmission(attendingDoctorId, status, admittedAt)`
- `IPDAdmission(patientId, status, admittedAt)`
- `Payment(receivedAt)`
- `Payment(paymentMode, receivedAt)`
- `AuditLog(action, createdAt)`
- `AuditLog(invoiceId, createdAt)`
- `AuditLog(visitId, createdAt)`

### PostgreSQL trigram indexes

- `Patient(name)` GIN trigram
- `Patient(phone)` GIN trigram
- `Patient(mrn)` GIN trigram
- `Invoice(invoiceNo)` GIN trigram

## Files Added

- `backend/prisma/migrations/202603290001_backend_optimization/migration.sql`
- `backend/src/middleware/requestRateLimit.ts`
- `backend/src/services/cache.service.ts`
- `backend/src/utils/search.ts`
- `OPTIMIZATION_REPORT.md`
- `PERFORMANCE_CHECKLIST.md`

## Expected Impact

- Patient search should return materially faster under moderate data volume because it now combines:
  - exact/prefix matching for phone and MRN
  - indexed trigram-backed text matching for names
  - strict pagination
- Authenticated API traffic should place less load on PostgreSQL because user/permission lookups are cached.
- Doctor/user/prescription/master-data screens should be cheaper to load repeatedly due to caching and pagination.
- Dashboard and analytics endpoints should produce less DB and memory pressure, especially under repeated refreshes.
- Slow requests and slow queries are now visible without adding an external APM dependency.

## Migration Notes

- Apply the new Prisma migration before deploying the backend:
  - `npm run prisma:migrate:deploy`
- The migration enables `pg_trgm`, which is supported on PostgreSQL/Supabase-style installations.

## Env Additions

- `SLOW_REQUEST_MS`
- `SLOW_QUERY_MS`
- `AUTH_CACHE_TTL_MS`
- `LOOKUP_CACHE_TTL_MS`
- `DASHBOARD_CACHE_TTL_MS`

## Backward Compatibility

- Existing response shapes were preserved where practical.
- New list endpoints still return `data`, with added `pagination` metadata where missing.
- Search/list contracts remain compatible with current frontend usage.

## Remaining Follow-up Worth Doing

- Move the in-memory cache and rate limiter to Redis if you scale to multiple App Service instances.
- Add route-level benchmarks or seeded load tests against patient search and billing paths.
- Consider frontend chunk-splitting for the large invoice print bundle reported by Vite.
