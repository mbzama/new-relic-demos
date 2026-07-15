# NestJS + New Relic Demo

A NestJS REST API that demonstrates New Relic APM features including custom metrics, distributed tracing, error tracking, and custom events.

## Features demonstrated

| New Relic Feature | How it's used |
|---|---|
| APM Transactions | All HTTP endpoints auto-instrumented |
| Custom Attributes | Product/order metadata attached to transactions |
| Custom Metrics | `newrelic.recordMetric()` on every business action |
| Custom Events | `ProductCreated`, `OrderPlaced`, `OrderStatusChanged` queryable in NRQL |
| Distributed Tracing | `startSegment()` wraps payment and inventory steps in orders |
| Error Tracking | Handled errors via `noticeError()` + automatic 500 capture |
| Transaction Traces | Slow transaction segments visible in APM trace detail |
| Log Forwarding | Structured logs shipped to New Relic Logs |

## Prerequisites

- Node.js 20+
- A New Relic account and license key ([sign up free](https://newrelic.com/signup))
- Docker (optional, for containerized local run)
- kubectl + EKS cluster (optional, for Kubernetes deployment)

## Project structure

```
src/
  products/      CRUD endpoints — custom attributes, metrics, events
  orders/        Order flow — traced payment & inventory segments
  health/        Liveness check used by k8s probes
  simulate/      Controllable scenarios for NR demos
newrelic.js      New Relic agent configuration (env-aware)
scripts/         Traffic generation helper
k8s/
  base/          Shared Kubernetes manifests
  overlays/
    dev/         Dev namespace — 1 replica, info logging
    qa/          QA namespace  — 1 replica, info logging
    uat/         UAT namespace — 2 replicas, warn logging
    prod/        Prod namespace — 3 replicas, warn logging, higher resources
```

---

## Environments

Each environment has its own `.env` file and maps to a distinct app name in New Relic APM so they appear as separate services.

| Environment | `.env` file | New Relic app name | NR log level | k8s replicas |
|---|---|---|---|---|
| Dev | `.env.dev` | `NestJS-Demo-Dev` | info | 1 |
| QA | `.env.qa` | `NestJS-Demo-QA` | info | 1 |
| UAT | `.env.uat` | `NestJS-Demo-UAT` | warn | 2 |
| Prod | `.env.prod` | `NestJS-Demo-Prod` | warn | 3 |

`newrelic.js` also adjusts transaction thresholds and sample rates per environment:
- **Dev/QA** — 200ms threshold, 100% sampling, full SQL recording
- **UAT** — 500ms threshold, 50% sampling
- **Prod** — Apdex_f threshold, 10% sampling, reduced event storage

---

## Local setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment files

```bash
cp .env.example .env.dev
cp .env.example .env.qa
cp .env.example .env.uat
cp .env.example .env.prod
```

Edit each file and set `NEW_RELIC_LICENSE_KEY`. The `NEW_RELIC_APP_NAME` is pre-filled per environment.

> **Where to get the license key:** New Relic UI → Administration → API Keys → key of type `INGEST - LICENSE` (40 characters). Do NOT use a User API key (starts with `NRAK-`).

### 3. Build

```bash
npm run build
```

### 4. Run for a specific environment

```bash
npm run start:dev    # NODE_ENV=development → NestJS-Demo-Dev in NR
npm run start:qa     # NODE_ENV=qa          → NestJS-Demo-QA in NR
npm run start:uat    # NODE_ENV=uat         → NestJS-Demo-UAT in NR
npm run start:prod   # NODE_ENV=production  → NestJS-Demo-Prod in NR
```

The agent connects within a few seconds. Look for this line in the logs:

```
Agent state changed from connected to started.
Reporting to: https://one.newrelic.com/redirect/entity/...
```

### 5. Run in watch mode (no New Relic)

```bash
npm run start:watch
```

---

## Docker (local)

```bash
# Build image
docker build -t nestjs-newrelic-demo .

# Run with your license key
docker-compose up
```

`docker-compose.yml` reads `NEW_RELIC_LICENSE_KEY` from your `.env` file automatically.

---

## Generate demo traffic

Use the included script to populate the New Relic APM dashboard with realistic traffic (runs for 5 minutes):

```bash
bash scripts/generate-traffic.sh
```

What it sends every ~2 seconds:

- `GET /api/products` and `GET /api/health` — baseline throughput
- `GET /api/products/:id` — includes deliberate 404s
- `POST /api/orders` — traced multi-segment transactions
- `GET /api/simulate/slow?ms=500–3000` — slow transaction traces
- `GET /api/simulate/error` — handled error via `noticeError()`
- `GET /api/simulate/crash` — automatic 500 error capture
- `GET /api/simulate/metric?value=N` — custom metric data points
- `GET /api/simulate/load?count=10` — throughput burst

---

## API endpoints

### Products

```
GET    /api/products              List all products (optional ?category=)
GET    /api/products/:id          Get single product
POST   /api/products              Create product
PUT    /api/products/:id          Update product
DELETE /api/products/:id          Delete product
```

### Orders

```
GET    /api/orders                List orders (optional ?customerId=)
GET    /api/orders/:id            Get single order
POST   /api/orders                Place order (simulates payment + inventory)
PATCH  /api/orders/:id/status     Update order status
```

### Health

```
GET    /api/health                Liveness check — returns uptime and memory
```

### Simulate (New Relic demos)

```
GET    /api/simulate/slow?ms=2000          Slow transaction trace
GET    /api/simulate/error?type=handled    Handled error via noticeError()
GET    /api/simulate/crash                 HTTP 500 — auto-captured by NR
GET    /api/simulate/metric?value=42       Custom metric
GET    /api/simulate/load?count=20         Throughput burst
GET    /api/simulate/custom-transaction    Named transaction
```

---

## What to look at in New Relic

After generating traffic, navigate to **one.newrelic.com → APM & Services → `nestjs-demo-local`**:

| Section | What you'll see |
|---|---|
| Overview | Throughput, response time, error rate charts |
| Transactions | Endpoints ranked by time — `POST /api/orders` slowest |
| Transaction Traces | Slow calls showing payment + inventory segments |
| Errors Inbox | Two groups: handled errors and 500 crashes |
| Logs | Structured NestJS logs with trace context |

**NRQL queries to try in Query Builder:**

```sql
-- Order revenue over time
SELECT sum(total) FROM OrderPlaced SINCE 30 minutes ago TIMESERIES

-- Orders by customer
SELECT count(*) FROM OrderPlaced FACET customerId SINCE 30 minutes ago

-- Products created
SELECT * FROM ProductCreated SINCE 30 minutes ago

-- Custom metric
SELECT average(newrelic.timeslice.value) FROM Metric
WHERE metricTimesliceName = 'Custom/Simulate/ManualMetric' SINCE 30 minutes ago TIMESERIES
```

---

## EKS deployment

Manifests use [Kustomize](https://kustomize.io/) overlays — one per environment. Each overlay sets the correct namespace, replica count, New Relic app name, and log level on top of a shared base.

### 1. Create namespaces

```bash
kubectl create namespace dev
kubectl create namespace qa
kubectl create namespace uat
kubectl create namespace prod
```

### 2. Create the license key secret in each namespace

```bash
for NS in dev qa uat prod; do
  kubectl create secret generic newrelic-secret \
    --from-literal=license-key=YOUR_NEW_RELIC_LICENSE_KEY \
    --namespace $NS
done
```

### 3. Build and push image

```bash
docker build -t YOUR_ECR_REPO/nestjs-newrelic-demo:latest .
docker push YOUR_ECR_REPO/nestjs-newrelic-demo:latest
```

Update the image reference in `k8s/base/deployment.yaml`.

### 4. Deploy to an environment

```bash
# Dev
kubectl apply -k k8s/overlays/dev

# QA
kubectl apply -k k8s/overlays/qa

# UAT
kubectl apply -k k8s/overlays/uat

# Prod
kubectl apply -k k8s/overlays/prod
```

### 5. Verify

```bash
kubectl get pods -n dev -l app=nestjs-newrelic-demo
kubectl logs -n dev -l app=nestjs-newrelic-demo --tail=20
```

Each environment appears as a **separate service** in New Relic APM (`NestJS-Demo-Dev`, `NestJS-Demo-QA`, etc.). Pod metadata — cluster, namespace, node, pod name — is automatically attached to all transactions via `NEW_RELIC_METADATA_KUBERNETES_*` env vars.

---

## npm scripts

| Command | Description |
|---|---|
| `npm run build` | Compile TypeScript |
| `npm run start:dev` | Watch mode (New Relic disabled) |
| `npm run start:nr` | Run compiled app with New Relic enabled |
| `npm run start:prod` | Run compiled app (no env loading) |
| `npm test` | Unit tests |
