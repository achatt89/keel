<!--
  Keel template — COMMANDS.md (command & env reference)
  WHAT: Copy-paste-ready dev/test/deploy commands and the environment-variable
        reference. The operational command surface.
  INCLUDE WHEN: anything that is actually run, built, or deployed.
  DEPENDS ON: Architect + Delivery/Ops interview rounds.
  OWNS: nothing (no IDs). References config/ADR decisions where a command's
        behaviour is non-obvious.
  CROSS-REF: ADR-<nnn> for the "why" behind a non-obvious command or env var.
  Delete all <!-- Keel guidance --> comments when filling this in.
-->

# {{PROJECT_NAME}} — COMMANDS.md

> Dev/ops command reference. All commands assume the repo root unless noted.
> Replace `{{...}}` placeholders with real values; never commit secrets.

---

## Setup

```bash
# Install dependencies
{{PKG_MANAGER}} install

# Copy environment config
cp .env.example .env
# Edit .env — fill in the REQUIRED vars (see the Environment Variables table below).

# Start local infrastructure ({{Postgres, Redis, ...}}) via Docker Compose.
# Host ports are overridable so the stack coexists with other local containers.
docker compose up -d

# Run database migrations
{{MIGRATE_CMD}}

# Seed development data (optional)
{{SEED_CMD}}
```

<!-- Keel guidance: if a setup step has a foot-gun (e.g. two DB roles that MUST differ,
     or a privileged-vs-app connection split), call it out with a ⚠️ note. -->

> ⚠️ **{{Foot-gun, e.g. role split}}:** {{the rule, and what silently breaks if violated — e.g. "the app and migration connections MUST be different roles, or RLS is a no-op".}}

---

## Development

```bash
# Start the app (hot reload)
{{DEV_CMD}}

# Start background workers (if any)
{{DEV_WORKERS_CMD}}

# Start everything together
{{DEV_ALL_CMD}}
```

The app starts on `http://localhost:{{PORT}}`. `{{/health}}` confirms it is up.

---

## Database

```bash
# Apply pending migrations
{{MIGRATE_CMD}}

# Inspect schema / data (read-only)
{{DB_STUDIO_CMD}}
```

<!-- Keel guidance: note any operation that differs in production (e.g. index builds
     run CONCURRENTLY outside a transaction). ⚠️ the locking ones. -->

> ⚠️ {{Production-only difference, e.g. "rebuild large indexes CONCURRENTLY (outside a transaction) to avoid a table lock".}}

---

## Testing

```bash
# Run all tests
{{TEST_CMD}}

# Unit only (no external dependencies)
{{TEST_UNIT_CMD}}

# Integration (requires live {{Postgres + Redis}} — run `docker compose up -d` first)
{{TEST_INTEGRATION_CMD}}

# A single test file
{{TEST_FILE_CMD}}
```

Integration tests run against {{the test database}}. Set `{{DATABASE_URL_TEST}}` or the runner {{defaults to ...}}.

---

## Security checks

<!-- Keel guidance: list the CI-failing gates a contributor can run locally — lint rules,
     dependency audit, baseline checks, the isolation/critical suite. -->

```bash
# Lint — includes the security rules, all of which fail CI on violation:
#   {{rule-1}} — {{what it enforces}}
#   {{rule-2}} — {{...}}
{{LINT_CMD}}

# Supply-chain audit (CI gate — fails on high/critical vulnerabilities)
{{AUDIT_CMD}}

# {{Baseline check, e.g. ADMIN_BYPASS count must match the committed baseline}}
{{BASELINE_CMD}}

# {{Isolation / critical suite (runs on every PR)}}
{{ISOLATION_CMD}}
```

> ⚠️ **{{Hard deploy gate, e.g. ZDR-endpoint assertion}}:** {{what it asserts and that deploy is blocked on failure}}.

---

## Deployment

```bash
# Deploy
{{DEPLOY_CMD}}

# Run migrations against the target environment (privileged connection).
# Always run migrations BEFORE deploying new app code.
{{PROD_MIGRATE_CMD}}

# Confirm health
curl https://{{HOST}}/health
```

> ⚠️ Set `NODE_ENV=production` and all required env vars in the {{secret store}} before deploying. {{If workers are a separate service, deploy both.}}

---

## Environment Variables

<!-- Keel guidance: one row per var. Required? = yes/no/prod-only. Mark secrets. Put the
     non-obvious "why" in the purpose cell or cross-ref an ADR. Group by concern. -->

All env vars are validated at startup ({{Zod in src/config}}). A missing required var causes a **hard startup failure** with a clear message. Secrets live in the {{secret store}} — never in committed files.

| Variable | Required? | Purpose | Default |
|---|---|---|---|
| `{{DATABASE_URL}}` | yes | {{app connection — must be the non-privileged role}} | — |
| `{{DATABASE_ADMIN_URL}}` | {{migrate-only}} | {{privileged connection for migrations / provisioning}} | — |
| `{{REDIS_URL / REDIS_HOST}}` | {{yes}} | {{queue + cache}} | — |
| `{{REDIS_TLS}}` | prod | must be `true` in deployed envs | `false` |
| `{{AUTH_SECRET}}` | yes (secret) | {{auth provider key}} | — |
| `{{AUTH_ISSUER_URL}}` | prod | {{pinned JWT issuer}} | — |
| `{{LLM_API_KEY}}` | {{yes (secret)}} | {{provider key}} | — |
| `{{LLM_MODEL}}` | no | {{default model — the one home for model strings}} | `{{...}}` |
| `{{WEBHOOK_SECRET}}` | {{yes (secret)}} | {{HMAC signature validation}} | — |
| `{{OBSERVABILITY_TOKEN}}` | no (secret) | {{telemetry — scoped per environment}} | — |
| `{{ADMIN_ALLOWLIST}}` | no | {{comma-separated admin user IDs}} | empty |
| `LOG_LEVEL` | no | `info` \| `debug` \| `warn` \| `error` | `info` |
| `PORT` | no | server port | `{{3000}}` |
| `NODE_ENV` | no | `development` \| `production` \| `test` | `development` |
| `{{POSTGRES_HOST_PORT}}` | no | compose-only host-port override | `{{5432}}` |

> ⚠️ {{Any pairing rule, e.g. "DATABASE_URL and DATABASE_ADMIN_URL must point at different roles."}}

---

*End of COMMANDS.md — {{PROJECT_NAME}}*
