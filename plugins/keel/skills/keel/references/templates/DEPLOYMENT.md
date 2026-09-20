<!--
  Keel template — DEPLOYMENT.md (environments, promotion path, deploy log)
  WHAT: The single home for every environment the system runs in and how a change
        travels between them: the environment matrix, the promotion path and its gates,
        build-time vs runtime config, pre/post-deploy checklists, rollback per component,
        the deploy log, and learned gotchas.
  INCLUDE WHEN: the system is deployed anywhere beyond a laptop — even one remote env.
        Skip for libraries that ship to a registry only.
  DEPENDS ON: COMMANDS.md (the commands themselves), NFR.md (SLOs watched during a
        rollout), conventions.md (evidence + deploy-state ladders), RUNBOOK.md (what
        happens when a deploy goes wrong — postmortems live there, not here).
  OWNS: the environment matrix, the promotion path, the deploy log. Deploy state
        (on-branch → merged → deployed vNN → live-verified) is recorded HERE and in
        CHANGELOG.md — never in an ADR, never in CLAUDE.md prose.
  CROSS-REF: COMMANDS.md for the command; CHANGELOG.md for what shipped; RUNBOOK.md
        PM-xxx for what broke; ADR-xxx for why the topology is what it is.
  KEY RULE: ONE document for ALL environments. Never split into DEPLOYMENT_PROD.md /
        DEPLOYMENT_STAGING.md — split docs are how a suite ends up saying "AWS" in one
        file while the live target has been Fly.io for months. One matrix, one path.
  Delete all <!-- Keel guidance --> comments when filling this in.
-->

# {{PROJECT_NAME}} — DEPLOYMENT.md

> Where {{PROJECT_NAME}} runs, how a change gets there, and the log of what went where.
> If a row here is wrong, fix it in the same PR as the change that made it wrong.

---

## §1 Environment matrix

<!-- Keel guidance: one row per environment that actually exists. "Config source" is where
     the env's runtime values come from (secret store / platform env / .env file). "Who may
     deploy" is a role, not a name. Drop Dev if there is no shared dev env; never invent one. -->

| Env | URL | Host + region | Database | Secrets store | Who may deploy | Deploy command | Config source |
|---|---|---|---|---|---|---|---|
| Local | `http://localhost:{{PORT}}` | laptop / Docker Compose | `{{compose postgres}}` | `.env` (gitignored) | anyone | `{{DEV_CMD}}` | `.env.example` → `.env` |
| {{Dev}} | `https://{{dev.HOST}}` | {{platform}} · `{{region}}` | `{{dev DB}}` | `{{platform secrets}}` | {{any engineer}} | `{{DEPLOY_CMD --env dev}}` | `{{platform env}}` |
| Staging | `https://{{staging.HOST}}` | {{platform}} · `{{region}}` | `{{staging DB — prod-shaped, anonymised}}` | `{{platform secrets}}` | {{any engineer}} | `{{DEPLOY_CMD --env staging}}` | `{{platform env}}` |
| Production | `https://{{HOST}}` | {{platform}} · `{{region}}` | `{{prod DB}}` | `{{platform secrets}}` | {{release owner}} | `{{DEPLOY_CMD --env prod}}` | `{{platform env}}` |

<!-- Keel guidance: if any component deploys separately (api / worker / storefront), add a
     second table: Component · Env · Service name · Image/build · Version now. -->

| Component | Service name (per env) | Built from | Current version |
|---|---|---|---|
| `{{api}}` | `{{project-api}}` / `{{project-api-staging}}` | `{{apps/api/Dockerfile}}` | see §7 |
| `{{worker}}` | `{{project-worker}}` | `{{apps/worker/Dockerfile}}` | see §7 |
| `{{web}}` | `{{project-web}}` | `{{apps/web/Dockerfile}}` | see §7 |

---

## §2 Promotion path

<!-- Keel guidance: each hop names the gate that must be green BEFORE the hop, using the
     evidence ladder from conventions (code-read < unit < integration < local-browser <
     staging < prod-live). A hop with no gate is a hop you'll regret. -->

```
local ──▶ {{dev}} ──▶ staging ──▶ production
```

| Hop | Gate (must be green before) | Evidence level required | Who signs |
|---|---|---|---|
| local → {{dev}} | lint · unit · integration green | `integration` | author |
| {{dev}} → staging | phase / change merged to trunk with doc-sync commit · migrations applied on staging first | `local-browser` | author |
| staging → production | staging smoke suite green · §4 pre-deploy checklist ticked · {{founder / release owner}} approval for {{user-visible or billing changes}} | `staging` | {{release owner}} |
| production → *live-verified* | §5 post-deploy checklist ticked and recorded in §7 | `prod-live` | deployer |

**Trunk is `main`.** Only trunk deploys to staging and production. A feature branch never deploys past {{dev}}.

---

## §3 Build-time vs runtime config

<!-- Keel guidance: THIS TABLE PREVENTS A WHOLE CLASS OF INCIDENT. Build-time values
     (NEXT_PUBLIC_*, VITE_*, --build-arg) are baked into the artefact at build; runtime values
     are read at process start. The classic failure: a test payment publishable key from a
     local .env baked into a production build and shipping unnoticed for days, because the
     backend (runtime, live key) looked healthy. List every var that differs per env, mark
     which kind it is, and where each env's value comes from. "Public?" = safe in a browser
     bundle. Secrets are NEVER build-time. -->

| Variable | Kind | Local | Staging | Production | Public? |
|---|---|---|---|---|---|
| `{{NEXT_PUBLIC_API_URL}}` | build-time | `http://localhost:{{PORT}}` | `https://api.{{staging.HOST}}` | `https://api.{{HOST}}` | yes |
| `{{NEXT_PUBLIC_PAYMENT_PUBLISHABLE_KEY}}` | build-time | `pk_test_…` (`.env`) | `pk_test_…` ({{secret store}}) | `pk_live_…` ({{secret store}}) | yes |
| `{{DATABASE_URL}}` | runtime | `.env` | {{platform secrets}} | {{platform secrets}} | **no** |
| `{{PAYMENT_SECRET_KEY}}` | runtime | `.env` (test) | {{platform secrets}} (test) | {{platform secrets}} (live) | **no** |
| `{{ANALYTICS_ID}}` | {{build-time / runtime}} | blank (off) | blank (off) | `{{id}}` | yes |

> ⚠️ **Build-time values must be passed explicitly per environment** (`{{--build-arg / platform build secrets}}`), never inherited from a local `.env`. The §4 checklist makes this a tick, not a memory.
> ⚠️ **Pairing rule:** a build-time key and its runtime counterpart must be from the same mode (`test`↔`test`, `live`↔`live`). A mismatch fails silently at the user, not in the logs.

---

## §4 Pre-deploy checklist

<!-- Keel guidance: run top to bottom for staging AND production. Keep it short enough to
     actually run; move rarely-needed items to §8 gotchas. -->

- [ ] Deploying from trunk (`git branch --show-current` = `main`), doc-sync commit present for this work
- [ ] Pending migrations listed and reviewed: `{{MIGRATIONS_STATUS_CMD}}` — apply to the target env **before** new app code
- [ ] Every build-time value in §3 set for the target env (not inherited from `.env`)
- [ ] Any new runtime var added to the target env's secret store (check COMMANDS.md env table)
- [ ] Build cache: if no source changed since the last build but config did, force a rebuild (`{{NO_CACHE_FLAG}}`)
- [ ] Data scripts to run against the target env named here: {{none / script name}} — and a rollback for each
- [ ] Production only: {{founder / release owner}} approval recorded for user-visible or billing changes

---

## §5 Post-deploy live-verification checklist

<!-- Keel guidance: these checks are what earn the `live-verified` state. Concrete commands
     and URLs, with the expected result — never "check it works". Add one line per feature
     that has bitten before. Record the outcome in the §7 deploy log. -->

| Check | Command / action | Expected |
|---|---|---|
| Health | `curl -fsS https://{{HOST}}/health` | `200` + version `{{vNN}}` |
| Version deployed | `curl -fsS https://{{HOST}}/{{version-endpoint}}` | commit matches the deploy log row |
| Runtime config | `curl -fsS https://{{HOST}}/{{public-config-endpoint}}` | `{{feature.enabled: true}}`, live-mode ids present |
| Build-time config | view page source of `https://{{HOST}}/{{checkout}}` → grep `pk_` | `pk_live_`, never `pk_test_` |
| Migrations | `{{MIGRATIONS_STATUS_CMD --env prod}}` | none pending |
| Core flow | browser: {{sign in → core action → result}} on the real domain | completes; no console errors |
| {{Third-party beacon}} | browser devtools → Network → `{{tracker.example/tr}}` | request fires with the prod id |
| Workers | `{{QUEUE_DEPTH_CMD}}` | draining; DLQ = 0 |
| SLOs (15 min) | {{dashboard}} | within NFR targets (`{{NFR-PERF-xxx}}`) |

---

## §6 Rollback per component

<!-- Keel guidance: multiple independent paths; pick the smallest that fits. Code-only revert ·
     forward-only compensating migration · feature-flag kill. State the blast radius of each. -->

| Component | Path | Command | Blast radius / caveat |
|---|---|---|---|
| `{{api}}` | redeploy previous release | `{{ROLLBACK_CMD api vN-1}}` | none if schema unchanged |
| `{{web}}` | redeploy previous release | `{{ROLLBACK_CMD web vN-1}}` | build-time config of the OLD build comes back with it |
| Database (schema) | forward-only compensating migration `{{V<n+1>__revert_<thing>}}` | normal pipeline | test against a prod clone first |
| Database (data) | point-in-time restore of affected rows | `{{PITR_CMD}}` | see RUNBOOK.md backup & recovery |
| Flag-gated feature | kill switch | `{{FLAG_OFF_CMD}}` | no deploy; propagates in ~{{N}}s |

---

## §7 Deploy log

<!-- Keel guidance: APPEND-ONLY, newest first. One row per deploy per env. "Evidence" is the
     §5 checks run (or "none — not verified", which is an honest row, not a missing one). This
     table is the ONLY place deploy state lives besides CHANGELOG.md; ADRs and CLAUDE.md link
     here. `/keel archive` trims rows older than {{N}} releases into PHASE_ARCHIVE.md. -->

| Version | Date | Commit | Env | Deployed by | Evidence (§5 checks) | Notes |
|---|---|---|---|---|---|---|
| `{{v1}}` | {{YYYY-MM-DD}} | `{{abc1234}}` | production | {{role}} | health ✓ · version ✓ · core flow ✓ (browser) | {{first prod deploy; Phase N}} |
| `{{v1}}` | {{YYYY-MM-DD}} | `{{abc1234}}` | staging | {{role}} | smoke suite ✓ | — |

---

## §8 Known gotchas

<!-- Keel guidance: learned findings that a checklist item alone doesn't explain. Each row
     points at the postmortem (RUNBOOK.md PM-xxx) or ADR that produced it. Add a row the day
     you learn it — this is the section that saves the next deployer an afternoon. -->

| Gotcha | What happens | Do this instead | Source |
|---|---|---|---|
| {{Container build cache reused}} | {{a redeploy with no source change reuses the cached image, so new build-args are silently ignored}} | {{pass `--no-cache` when only config changed}} | {{PM-001}} |
| {{Platform region availability}} | {{managed DB not offered in the intended region; deploy silently went to another}} | {{pin region in config; verify with `{{REGION_CMD}}`}} | {{ADR-0xx}} |
| {{Origin allowlist}} | {{`www.` and apex both serve; beacons from the non-canonical origin are dropped}} | {{redirect to one canonical origin; allowlist both until then}} | {{PM-00x}} |

---

*End of DEPLOYMENT.md — {{PROJECT_NAME}}*
