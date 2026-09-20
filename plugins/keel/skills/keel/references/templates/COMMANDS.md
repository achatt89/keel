<!--
  Keel template — COMMANDS.md (command & env reference)
  WHAT: Copy-paste-ready dev/test/deploy/seed/data commands and the environment-variable
        reference. The operational command surface — commands only; per-environment
        values and procedures live in DEPLOYMENT.md.
  INCLUDE WHEN: anything that is actually run, built, or deployed.
  DEPENDS ON: Architect + Delivery/Ops interview rounds.
  OWNS: nothing (no IDs). References config/ADR decisions where a command's
        behaviour is non-obvious.
  CROSS-REF: ADR-<nnn> for the "why" behind a non-obvious command or env var;
        DEPLOYMENT.md §1/§3 for what each env var is set to, per environment.
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

<!-- Keel guidance: COMMANDS ONLY. Per-environment values, the promotion path, checklists,
     rollback and the deploy log are OWNED by DEPLOYMENT.md — link, never restate. -->

```bash
# Migrate the target env (privileged connection) — ALWAYS before new app code
{{PROD_MIGRATE_CMD --env <env>}}

# Deploy (all build-time values passed explicitly — see DEPLOYMENT.md §3)
{{DEPLOY_CMD --env <env> [--no-cache]}}

# Roll back one component
{{ROLLBACK_CMD <component> <version>}}

# Confirm
curl -fsS https://{{HOST}}/health
```

> Before running any of these: `DEPLOYMENT.md §4`. After: `DEPLOYMENT.md §5`, then a `§7` deploy-log row.

---

## Seed & test data

<!-- Keel guidance: how a working dataset gets into an env, which personas exist, and how test
     data is removed without touching real rows. Test data in production is a compliance
     finding, not a tidiness issue — the cleanup command must be prod-safe by construction
     (matches a marker column / email domain / tenant flag, never a hand-written WHERE). -->

```bash
# Seed a full local dataset (idempotent — safe to re-run)
{{SEED_CMD}}

# Seed one persona / scenario
{{SEED_CMD --persona {{pro-monthly-user}}}}

# List seeded test personas and their credentials source
{{SEED_LIST_CMD}}

# Remove test data — prod-safe: matches only rows tagged {{is_test = true / @example.test}}
{{TEST_DATA_CLEANUP_CMD --env <env> --dry-run}}
{{TEST_DATA_CLEANUP_CMD --env <env>}}
```

| Persona | Purpose | Lives in |
|---|---|---|
| `{{free-user}}` | {{gating / paywall paths}} | local, staging |
| `{{pro-monthly-user}}` | {{paid features, billing webhooks}} | local, staging |
| `{{tenant-b-admin}}` | {{cross-tenant isolation tests}} | local only |

> ⚠️ Seeds never run against production. The cleanup command refuses `--env prod` without `{{--i-know}}` and always prints the row count it would delete first.

---

## Local ↔ remote data reconciliation

<!-- Keel guidance: the commands for pulling a real dataset down, pushing a curated one up,
     and rebaselining a drifted local/dev DB. State what NEVER runs against prod. Every
     project that ships eventually needs these under pressure — write them before then. -->

```bash
# Snapshot a remote DB (anonymised where COMPLIANCE.md requires) → local file
{{DUMP_CMD --env staging --anonymise > dumps/{{YYYY-MM-DD}}.sql}}

# Restore a snapshot into local (drops and recreates the local DB)
{{RESTORE_LOCAL_CMD dumps/{{YYYY-MM-DD}}.sql}}

# Rebaseline a drifted dev/staging DB to the migrations on trunk
{{REBASELINE_CMD --env dev}}

# Run a one-off data script against an env (script must be idempotent + logged)
{{RUN_SCRIPT_CMD --env <env> scripts/{{name}}.ts --dry-run}}
{{RUN_SCRIPT_CMD --env <env> scripts/{{name}}.ts}}

# Diff schema between two envs (catches "migration ran locally, never on prod")
{{SCHEMA_DIFF_CMD --from staging --to prod}}
```

| Never against production | Why |
|---|---|
| `{{RESTORE_LOCAL_CMD}}` / any drop-and-recreate | destroys the system of record |
| `{{db:push / schema-sync tools}}` | diff-based tools drop what migrations added and the ORM schema omits |
| `{{SEED_CMD}}` | seeds are test data |
| Un-dry-run data scripts | one-off scripts get a `--dry-run` first, then a `DEPLOYMENT.md §7` note |

---

## Environment Variables

<!-- Keel guidance: one row per var. Required? = yes/no/prod-only. Mark secrets. Put the
     non-obvious "why" in the purpose cell or cross-ref an ADR. Group by concern. -->

All env vars are validated at startup ({{Zod in src/config}}). A missing required var causes a **hard startup failure** with a clear message. Secrets live in the {{secret store}} — never in committed files. **Kind** marks build-time values (baked into the artefact — `DEPLOYMENT.md §3`) vs runtime; per-environment values are in `DEPLOYMENT.md §1/§3`, not here.

| Variable | Kind | Required? | Purpose | Default |
|---|---|---|---|---|
| `{{DATABASE_URL}}` | runtime | yes | {{app connection — must be the non-privileged role}} | — |
| `{{DATABASE_ADMIN_URL}}` | runtime | {{migrate-only}} | {{privileged connection for migrations / provisioning}} | — |
| `{{REDIS_URL / REDIS_HOST}}` | runtime | {{yes}} | {{queue + cache}} | — |
| `{{REDIS_TLS}}` | runtime | prod | must be `true` in deployed envs | `false` |
| `{{AUTH_SECRET}}` | runtime | yes (secret) | {{auth provider key}} | — |
| `{{AUTH_ISSUER_URL}}` | runtime | prod | {{pinned JWT issuer}} | — |
| `{{NEXT_PUBLIC_API_URL}}` | **build-time** | yes | {{API origin baked into the web bundle}} | — |
| `{{NEXT_PUBLIC_PAYMENT_PUBLISHABLE_KEY}}` | **build-time** | yes | {{must pair with the runtime secret's mode — DEPLOYMENT.md §3}} | — |
| `{{LLM_API_KEY}}` | runtime | {{yes (secret)}} | {{provider key}} | — |
| `{{LLM_MODEL}}` | runtime | no | {{default model — the one home for model strings}} | `{{...}}` |
| `{{WEBHOOK_SECRET}}` | runtime | {{yes (secret)}} | {{HMAC signature validation}} | — |
| `{{OBSERVABILITY_TOKEN}}` | runtime | no (secret) | {{telemetry — scoped per environment}} | — |
| `{{ADMIN_ALLOWLIST}}` | runtime | no | {{comma-separated admin user IDs}} | empty |
| `LOG_LEVEL` | runtime | no | `info` \| `debug` \| `warn` \| `error` | `info` |
| `PORT` | runtime | no | server port | `{{3000}}` |
| `NODE_ENV` | runtime | no | `development` \| `production` \| `test` | `development` |
| `{{POSTGRES_HOST_PORT}}` | runtime | no | compose-only host-port override | `{{5432}}` |

> ⚠️ {{Any pairing rule, e.g. "DATABASE_URL and DATABASE_ADMIN_URL must point at different roles."}}

---

*End of COMMANDS.md — {{PROJECT_NAME}}*
