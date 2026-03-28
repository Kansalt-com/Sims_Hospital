# SIMS Hospital Enterprise HMS

Productionized hospital management platform for OPD, IPD, billing, prescriptions, reporting, and deployment readiness.

## Stack

- `frontend/`: React + Vite + TypeScript
- `backend/`: Express + TypeScript + Prisma
- `backend/prisma/`: relational schema, migrations, seed data
- `deployment/`: Docker, Azure, and CI/CD assets
- `docs/`: architecture and operating guides

## Key Upgrades

- Enterprise hospital domain model with `rooms`, `beds`, `payments`, `permissions`, and `audit logs`
- Real OPD to IPD workflow with bed-aware admission and discharge handling
- Split-payment billing with `Cash`, `UPI`, `Card`, and `Insurance`
- Auto-generated prescription sheet after bill clearance
- Dashboard and analytics endpoints for revenue, occupancy, and doctor-wise volumes
- Role-aware navigation for admin, reception, doctor, billing, pharmacy, and lab teams
- Cloud-ready packaging for Docker, GitHub Actions, and Azure pipelines

## Local Development

```powershell
cd backend
npm ci
Copy-Item .env.example .env

cd ..\frontend
npm ci
Copy-Item .env.example .env
```

Run services:

```powershell
cd backend
npm run dev

cd ..\frontend
npm run dev
```

## Tests

```powershell
cd backend
npm test
```

The integration suite covers:

- patient registration
- OPD visit creation
- billing and payment capture
- prescription generation
- OPD to IPD admission
- discharge with bed release

## Production Build

```powershell
cd backend
npm run build

cd ..\frontend
npm run build
```

For VPS deployment under `https://www.kansalt.com/sims/`, use:

```bash
APP_BRANCH=main APP_DOMAIN=www.kansalt.com APP_BASE_PATH=/sims/ ./deployment/scripts/deploy-vps.sh
```

Container build:

```powershell
docker build -t sims-hospital .
docker run -p 4000:4000 -e JWT_SECRET=replace-me sims-hospital
```

## First Admin Bootstrap

Use environment variables on first startup for a fresh empty database:

- `INITIAL_ADMIN_NAME`
- `INITIAL_ADMIN_USERNAME`
- `INITIAL_ADMIN_PASSWORD`

The app will create that administrator once, require a password change on first login, and then stop seeding users automatically.

## Documentation

- [Architecture](./docs/ARCHITECTURE.md)
- [Production Runbook](./docs/PRODUCTION_RUNBOOK.md)
- [Install Guide](./INSTALL.md)
- [User Guide](./docs/USER_GUIDE.md)
