# Enterprise Deployment Architecture

## Overview

This repository now includes a branch-based multi-environment deployment architecture built for a single Hostinger VPS using:

- Docker
- k3s
- Kubernetes namespaces
- Helm
- GitHub Actions
- GitHub Container Registry

Application business logic is unchanged. This layer only adds deployment infrastructure.

## VPS Kubernetes Model

The cluster runs as a single-node `k3s` installation on the existing VPS.

Environment isolation is provided by namespaces:

- `hms-dev`
- `hms-test`
- `hms-prod`

This is a cost-efficient architecture for now, but it is still a single-server platform. If the VPS fails, all environments fail together.

## Recommended DNS

Use subdomains instead of path-based routing:

- `dev.kansalt.com`
- `test.kansalt.com`
- `hms.kansalt.com`

Why:

- cleaner ingress routing
- simpler frontend asset paths
- easier TLS management
- clearer environment separation

## Branch Flow

- `dev`
  - run CI
  - build and test
  - push Docker images to GHCR
  - deploy to `hms-dev`
  - promote the same build to `hms-test`

- `main`
  - run CI
  - build and test
  - push production images to GHCR
  - deploy to `hms-prod`

## Folder Structure

```text
deploy/
  docker/
    backend.Dockerfile
    frontend.Dockerfile
    frontend.nginx.conf
  helm/
    hms/
      Chart.yaml
      values.yaml
      values-dev.yaml
      values-test.yaml
      values-prod.yaml
      templates/
  k8s/
    namespaces/
  scripts/
    bootstrap-k3s-vps.sh
    configure-k3s-host-nginx.sh
deployment/
  nginx/
    k3s-subdomains.conf
docs/
  DEPLOYMENT.md
.github/
  workflows/
    ci.yml
    dev-deploy.yml
    prod-deploy.yml
```

## Runtime Layout

### On the VPS

- host Nginx terminates TLS
- host Nginx proxies `dev/test/hms` subdomains to ingress-nginx NodePort
- ingress-nginx inside k3s routes traffic to namespace-specific services

### In Kubernetes

Each environment has:

- frontend `Deployment`
- backend `Deployment`
- frontend `Service`
- backend `Service`
- shared `Ingress`
- PVCs for backend data, uploads, and logs

## Container Strategy

### Frontend

- multi-stage Docker build
- static Vite bundle
- lightweight Nginx runtime

### Backend

- multi-stage Docker build
- Prisma generated during build
- Node 22 Alpine runtime
- persistent volume mounts for:
  - `/app/data`
  - `/app/uploads`
  - `/app/logs`

## GitHub Actions Model

### Shared CI

[ci.yml](../.github/workflows/ci.yml)

- runs on `dev` and `main`
- installs backend/frontend dependencies
- runs backend tests
- builds backend and frontend

### Dev/Test Deployment

[dev-deploy.yml](../.github/workflows/dev-deploy.yml)

- triggers on push to `dev`
- builds images
- pushes:
  - `dev-<sha>`
  - `latest-dev`
  - `test-<sha>`
  - `latest-test`
- deploys to `hms-dev`
- then deploys to `hms-test`

### Production Deployment

[prod-deploy.yml](../.github/workflows/prod-deploy.yml)

- triggers on push to `main`
- builds images
- pushes:
  - `prod-<sha>`
  - `latest-prod`
- deploys to `hms-prod`

## Image Tagging Strategy

Implemented tags:

- `dev-<short-sha>`
- `test-<short-sha>`
- `prod-<short-sha>`
- `latest-dev`
- `latest-test`
- `latest-prod`

Recommendation:

- deploy immutable `<env>-<sha>` tags
- keep `latest-*` for operator visibility only

## Kubernetes Secrets

Backend runtime secrets are stored per namespace in `hms-backend-secrets`:

- `JWT_SECRET`
- `DATABASE_URL`

GHCR pull credentials are stored per namespace in `ghcr-pull-secret`.

## GitHub Secrets Required

### Shared kubeconfig

This VPS k3s setup uses one cluster, so GitHub Actions uses one shared kubeconfig:

- `KUBE_CONFIG_VPS`

Store `/etc/rancher/k3s/k3s.yaml` as base64.

### GHCR pull secret

- `GHCR_PULL_USERNAME`
- `GHCR_PULL_TOKEN`

### Backend secrets

- `HMS_DEV_JWT_SECRET`
- `HMS_TEST_JWT_SECRET`
- `HMS_PROD_JWT_SECRET`
- `HMS_DEV_DATABASE_URL`
- `HMS_TEST_DATABASE_URL`
- `HMS_PROD_DATABASE_URL`

## VPS Bootstrap

Install k3s and ingress-nginx:

```bash
chmod +x /var/www/sims-hospital/deploy/scripts/bootstrap-k3s-vps.sh
/var/www/sims-hospital/deploy/scripts/bootstrap-k3s-vps.sh
```

Configure host Nginx to proxy subdomains into the cluster:

```bash
chmod +x /var/www/sims-hospital/deploy/scripts/configure-k3s-host-nginx.sh
/var/www/sims-hospital/deploy/scripts/configure-k3s-host-nginx.sh
```

## Manual Deploy Commands

Dev:

```bash
kubectl apply -f deploy/k8s/namespaces/hms-dev.yaml
helm upgrade --install hms-dev deploy/helm/hms \
  --namespace hms-dev \
  --values deploy/helm/hms/values.yaml \
  --values deploy/helm/hms/values-dev.yaml
```

Test:

```bash
kubectl apply -f deploy/k8s/namespaces/hms-test.yaml
helm upgrade --install hms-test deploy/helm/hms \
  --namespace hms-test \
  --values deploy/helm/hms/values.yaml \
  --values deploy/helm/hms/values-test.yaml
```

Prod:

```bash
kubectl apply -f deploy/k8s/namespaces/hms-prod.yaml
helm upgrade --install hms-prod deploy/helm/hms \
  --namespace hms-prod \
  --values deploy/helm/hms/values.yaml \
  --values deploy/helm/hms/values-prod.yaml
```

## Rollback

Release history:

```bash
helm history hms-dev -n hms-dev
helm history hms-test -n hms-test
helm history hms-prod -n hms-prod
```

Rollback:

```bash
helm rollback hms-dev <revision> -n hms-dev
helm rollback hms-test <revision> -n hms-test
helm rollback hms-prod <revision> -n hms-prod
```

## Health Checks

Configured:

- frontend liveness/readiness on `/`
- backend liveness/readiness on `/api/settings/public`
- rolling updates for frontend/backend

## Important Note About SQLite

This app still defaults to SQLite. On a single-node VPS k3s cluster, this is workable for lower scale using persistent volumes, but the long-term enterprise move should still be a managed PostgreSQL or MySQL service.
