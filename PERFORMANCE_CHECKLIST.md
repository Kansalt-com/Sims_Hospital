# Performance Checklist

## Database

- Keep PostgreSQL statistics fresh with routine `ANALYZE` and normal autovacuum health checks.
- Monitor index usage for patient search, visits, invoices, and reports after deploy.
- Avoid adding new `%contains%` search patterns without checking index support first.
- Prefer exact, prefix, or bounded-range filters for high-traffic endpoints.

## API design

- Default every list endpoint to page size `20` unless there is a strong reason not to.
- Cap page size at `100`.
- Keep list endpoints lightweight and reserve deep relations for detail endpoints.
- Avoid `include` trees in table/list APIs unless every nested field is truly needed.

## Caching

- Keep cacheable data limited to safe read-mostly responses.
- Invalidate cache on every write path that changes dashboards, reports, or master data.
- Move cache and request rate limits to Redis before scaling horizontally.

## Search

- Use exact/prefix matches first for phone, MRN, invoice number, and IDs.
- Use trigram-backed text search for patient or doctor name discovery.
- Always paginate search responses.
- Debounce search requests in the UI and avoid firing on every keystroke without delay.

## Auth

- Keep JWT session version tied to `updatedAt` or equivalent revocation state.
- Cache role permissions and user session snapshots.
- Avoid extra DB reads in middleware whenever a trusted token already contains the needed identity fields.

## Reporting

- Prefer aggregate queries and grouped reads over loading full transaction history into memory.
- Split summary reads from detail/export reads.
- Rate-limit export endpoints separately from normal analytics endpoints.

## Observability

- Watch `/api/metrics` for slow-request and slow-query growth after release.
- Tune `SLOW_REQUEST_MS` and `SLOW_QUERY_MS` based on real production latency.
- Capture log samples for the slowest routes after each major release.

## Deployment

- Run `npm run prisma:migrate:deploy` before starting the new backend build.
- Roll out during a low-traffic window if the patient and billing tables are already large.
- Verify `/api/health` and a few hot endpoints after deployment:
  - `/api/patients`
  - `/api/patients/search?q=...`
  - `/api/reports/dashboard`
  - `/api/invoices?compact=true`

## Future upgrades

- Add Redis for shared caching and shared rate limiting.
- Add background jobs for heavy exports if report volume grows.
- Consider a dedicated search strategy if patient records grow into very large datasets.
