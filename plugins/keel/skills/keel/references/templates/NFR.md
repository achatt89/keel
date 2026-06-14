<!--
  Keel template — NFR.md (Non-Functional Requirements)

  WHAT THIS DOC IS: The measurable "-ilities" — performance, scale, availability, security,
  cost, observability, data governance, maintainability — each with a TARGET and a
  VERIFICATION METHOD. Plus the build-time gates that make controls un-skippable. These
  targets drive RUNBOOK alert thresholds and IMPLEMENTATION_PLAN exit gates.

  WHEN TO INCLUDE: Product tier and up. The security group scales heavily with data
  sensitivity. (document-catalog.md)

  DEPENDS ON: ARCHITECTURE.md (components, trust boundaries), ENGINEERING_DESIGN.md (data
  classes, non-negotiables); all interview rounds.

  IDS THIS DOC OWNS: NFR-<AREA>-xxx, grouped and numbered per area
  (NFR-PERF-001, NFR-SEC-003, ...). Use the same prefix set below. Stable once assigned.

  SIBLING CROSS-REFS: NFR-SEC controls map to THREAT_MODEL.md THR-xxx and ARCHITECTURE.md §6
  (controls by threat category); NFR-RESIDUAL mirrors BRD RSK-xxx and ARCHITECTURE.md §9.

  GOLDEN RULE: every requirement needs a MEASURABLE target AND a verification method. A
  target with no "how verified" is a wish. OMIT any group the project does not warrant —
  do not pad. The security group GROWS with data sensitivity; for a PII/regulated system it
  is the largest section by far.

  Delete all <!-- Keel guidance --> comments when filling this in.
-->

# Non-Functional Requirements
## {{PROJECT_NAME}}

**Version:** {{x.y}}
**Date:** {{YYYY-MM-DD}}
**Status:** {{Draft | Active}}
**References:** BRD {{vX}}, CON-xxx, ARCHITECTURE.md §{{n}}, THREAT_MODEL.md (THR-xxx), ADR-xxx, RUNBOOK.md

---

## NFR-PERF — Performance

<!-- Keel guidance: latency and throughput budgets. Prefer percentiles (P95/P99) over
     averages. Where an end-to-end budget decomposes into stages, give each stage its own
     row so a breach is attributable. Target must be a number with a unit. -->

| ID | Requirement | Target | How Verified |
|----|-------------|--------|--------------|
| PERF-001 | End-to-end {{primary operation}} latency (P95) | ≤{{N}}ms | {{trace percentiles at the API boundary}} |
| PERF-002 | {{Sub-stage}} latency budget (P95) | ≤{{N}}ms | {{span on that stage}} |
| PERF-003 | {{Background job}} throughput per worker | ≥{{N}}/minute | {{job completion metrics; CI benchmark}} |

---

## NFR-SCALE — Scalability

<!-- Keel guidance: the ceilings before architecture changes are forced. Concurrency, data
     volume per tenant/entity, horizontal-scale statelessness, connection pooling. -->

| ID | Requirement | Target | How Verified |
|----|-------------|--------|--------------|
| SCALE-001 | Concurrent {{tenants/users}} at launch without P95 regression | ≥{{N}} | {{load test: N simulated clients, assert P95 ≤ target}} |
| SCALE-002 | {{Data volume}} per {{tenant}} before migration required | ≥{{N}} | {{benchmark at target volume; results in BENCHMARKS.md}} |
| SCALE-003 | Worker / API statelessness | No shared in-process state; replicas interchangeable | {{code review; kill-a-pod test}} |

---

## NFR-AVAIL — Availability

<!-- Keel guidance: uptime SLA, delivery guarantees, redundancy, graceful degradation /
     fallback. State what happens when a dependency fails, not just the happy path. -->

| ID | Requirement | Target | How Verified |
|----|-------------|--------|--------------|
| AVAIL-001 | {{Service}} monthly uptime | ≥{{99.x}}% | {{external uptime monitor; monthly report}} |
| AVAIL-002 | {{Pipeline}} delivery guarantee | At-least-once; every job completes or lands in DLQ; zero silent drops | {{retry config + DLQ alert; chaos test kills worker mid-job}} |
| AVAIL-003 | {{Dependency}} graceful degradation | On {{dependency}} failure: {{degraded result}}; no hard error to client | {{integration test: mock dependency 5xx; assert degraded response}} |

---

## NFR-SEC — Security

<!-- Keel guidance: THE LARGEST GROUP for any system holding sensitive data — expand it in
     proportion to data sensitivity, and trim it hard for a low-stakes tool. Cover, as the
     project warrants: encryption (transit/rest), authn, authz/RBAC, tenant/data isolation,
     input validation (schema + size limits), file/upload safety, injection defences,
     audit-log immutability, rate limiting, secrets management, webhook auth, outbound-
     request/SSRF safety, observability data hygiene. Each control row should be testable:
     the "How Verified" is an actual test or scan, ideally one that runs in CI on every PR.
     Map controls to THREAT_MODEL THR-xxx and ARCHITECTURE §6 where they exist. -->

| ID | Requirement | Target | How Verified |
|----|-------------|--------|--------------|
| SEC-001 | Encryption in transit | TLS {{1.2}}+ on all external and inter-service connections | {{TLS scan pre-launch; provider config reviewed}} |
| SEC-002 | Encryption at rest | {{Datastore}} volume encrypted at rest | {{provider encryption config verified}} |
| SEC-003 | {{Tenant/data}} isolation at DB layer | Isolation enforced in every query; no application-layer bypass | {{automated cross-{{tenant}} isolation test in CI: query A against B's data → 0 rows}} |
| SEC-004 | Authn on every request | All routes except {{/health}} require a valid token; expired/tampered → 401 | {{integration test: unauthenticated → 401; expired → 401; tampered → 401}} |
| SEC-005 | Authorization / RBAC | {{Roles}} enforced at the API layer through a single permission registry | {{integration matrix: each role × each operation; assert 403 for every unauthorised combo}} |
| SEC-006 | Audit-log immutability | App DB role has INSERT only on the audit log; no UPDATE/DELETE | {{DB grant inspection in CI; attempt to UPDATE raises permission error}} |
| SEC-007 | Input validation — schema | All request bodies validated; unknown keys stripped before handlers run | {{unit tests on route schemas; invalid payload → 400}} |
| SEC-008 | Input validation — size limits | Body/upload size caps enforced at the framework layer | {{oversized request → 413 before parsing}} |
| SEC-009 | {{Injection}} defence | {{User content reaches {{LLM/SQL/shell}} only through {{guard/parameterisation}}; no raw interpolation}} | {{static-analysis rule + unit test on the guard}} |
| SEC-010 | Rate limiting | Per-{{tenant}} request limits; breach → 429 | {{load test exceeds the limit; assert 429; counters are per-tenant}} |
| SEC-011 | Secrets management | Zero secrets in source or image layers; injected at runtime | {{secret-pattern scan in CI; image history shows no secrets}} |
| SEC-012 | Outbound-request safety (SSRF) | User-supplied URLs validated before fetch; private ranges blocked; redirects re-validated | {{unit tests with private IPs and file:// URLs; redirect-to-private aborts}} |
| SEC-013 | Webhook authentication | Timing-safe signature comparison; replay + staleness rejected | {{unit test asserts timing-safe compare; replay → idempotent reject; stale timestamp → 400}} |

---

## NFR-COST — Cost

<!-- Keel guidance: only if the project has a real cost envelope or per-unit economics.
     Infra ceiling, per-call unit cost, per-tenant quotas/alerts, and any cost-accounting
     ledger. Omit entirely for a project with no meaningful cost surface. -->

| ID | Requirement | Target | How Verified |
|----|-------------|--------|--------------|
| COST-001 | Monthly infrastructure cost ceiling | ≤${{N}}/month at {{scale point}} | {{cloud billing report; budget alert at {{threshold}}}} |
| COST-002 | Per-{{tenant}} usage quota | {{soft N / hard N}}; over hard limit → reject with {{QUOTA_EXCEEDED}} | {{integration test: exhaust quota; assert next request rejected, no upstream call}} |
| COST-003 | Cost-accounting ledger integrity | 100% of {{billable calls}} write exactly one append-only ledger row; cost derived at read time | {{integration test: one row per call; monthly reconciliation within ±{{N}}%}} |

---

## NFR-OBS — Observability

<!-- Keel guidance: tracing, structured-log field contract, exported metrics, alert
     thresholds, liveness/readiness endpoints. Alert thresholds here become RUNBOOK alerts. -->

| ID | Requirement | Target | How Verified |
|----|-------------|--------|--------------|
| OBS-001 | Distributed tracing | Spans on every stage of {{the main pipeline}}; one parent span per request | {{trace-completeness test asserts all stages present with correct parentage}} |
| OBS-002 | Structured logging — required fields | Every log line is JSON with {{request_id, operation, duration_ms, status}} | {{log-schema validation in CI over sampled lines}} |
| OBS-003 | Latency breach alert | Fires when {{operation}} P95 exceeds {{N}}ms over a {{5}}-min window | {{alert configured; tested by injecting artificial latency}} |
| OBS-004 | Liveness / readiness | `/health` → 200 regardless of deps; `/ready` → 503 when a dependency is down | {{kill a dependency; assert /ready 503 while /health 200}} |

---

## NFR-DATA — Data Governance

<!-- Keel guidance: retention, erasure SLA + cascade integrity, portability/export,
     backups, cross-boundary access prevention, storage exclusions. If the project holds
     personal data, these pair with COMPLIANCE.md (which owns the retention SCHEDULE and
     data inventory; this section owns the verifiable targets). -->

| ID | Requirement | Target | How Verified |
|----|-------------|--------|--------------|
| DATA-001 | Retention default | {{Retained until explicit deletion / TTL = N}} | {{schema review: expiry columns / scheduled jobs match the rule}} |
| DATA-002 | Right-to-erasure SLA | Full deletion across all {{tenant}} tables within {{N}} hours of request | {{integration test: submit deletion; assert 0 rows across all tables; erasure receipt logged}} |
| DATA-003 | Deletion cascade integrity | Deletion cascades; zero orphan rows | {{insert full data graph; delete; COUNT(*) across tables asserts 0 orphans}} |
| DATA-004 | Data portability / export | Full export on demand in {{machine-readable format}} | {{export test: N records in → N records out with correct fields}} |
| DATA-005 | Backups | Automated {{daily}} snapshots; {{N}}-day retention; restore tested {{quarterly}} | {{backup config verified; restore drill documented in RUNBOOK.md}} |

---

## NFR-MAINT — Maintainability

<!-- Keel guidance: deploy mechanics, migration discipline, CI required checks, language/
     type strictness, containerisation. The CI-required-checks row is the gate every PR
     passes — keep it the single source of truth for "definition of done". -->

| ID | Requirement | Target | How Verified |
|----|-------------|--------|--------------|
| MAINT-001 | CI required checks | Every PR passes: {{lint, typecheck, unit, integration, isolation}}; branch protection enforces all green | {{CI config + branch-protection settings reviewed; no merge with any check red}} |
| MAINT-002 | Zero-downtime deploys | Rolling deploy; zero deploy-attributed non-2xx in continuous-traffic test | {{continuous-traffic test during deploy asserts 0 deploy-attributed errors}} |
| MAINT-003 | Schema changes via migrations | All schema changes ship as committed migration files; no manual prod SQL | {{CI gate: schema-altering PR must include a migration file}} |

---

## NFR-BUILD — Build-Time Enforcement

<!-- Keel guidance: controls too easy to miss in review are made CI-FAILING instead. List
     each lint rule / scan / gate, what it forbids, and the ADR that mandates it. Include
     only the gates the project actually wires up. These are the teeth behind NFR-SEC. -->

Security and correctness controls that could be omitted in review are enforced at the build
level, making a violation a CI failure rather than a review miss.

| ID | Requirement | Target | How Verified |
|----|-------------|--------|--------------|
| BUILD-001 | Lint rule — {{no-bare-db-import}} | {{All DB access via the tenant-scoped client; bare imports fail the build}} (ADR-xxx) | {{rule enforced in CI; rule unit tests flag the bad pattern}} |
| BUILD-002 | Lint rule — {{no-raw-llm-interpolation / no-raw-fetch-url}} | {{User content reaches {{sink}} only through the guard}} (ADR-xxx) | {{rule enforced in CI on every PR over the relevant directories}} |
| BUILD-003 | Supply-chain audit gate | `{{audit command}}` gates CI; flagged dependencies pinned exactly; bot watches them | {{CI fails on high/critical vuln; lockfile pins verified}} |
| BUILD-004 | Critical test suite cannot be silenced | Any skipped test in `{{tests/isolation/}}` fails CI | {{CI grep over the suite; tested by introducing a skipped test on a throwaway branch}} |

---

## NFR-RESIDUAL — Accepted Residual Risks

<!-- Keel guidance: deliberate, recorded acceptances — NOT open action items. Each mirrors
     a BRD RSK-xxx and the full rationale in ARCHITECTURE.md §9. State the acceptance
     boundary (the condition under which it stays acceptable) and the revisit trigger.
     Omit this section if there are no accepted risks. -->

| ID | Accepted Risk | Acceptance Boundary | Revisit Trigger / Reference |
|----|---------------|---------------------|-----------------------------|
| RES-001 | {{Residual risk, e.g. metadata exposure on telemetry breach}} | {{Accepted because {{only C0 metadata is exposed}}}} | {{Condition that reopens it}} (ARCHITECTURE.md §9; ADR-xxx) |

---

## NFR-GOV — Security Governance

<!-- Keel guidance: review cadence and the gate that enforces it. Include only if the
     project commits to a recurring security review. -->

| ID | Requirement | Target | How Verified |
|----|-------------|--------|--------------|
| GOV-001 | Security review cadence | {{ARCHITECTURE §security, NFR-SEC/BUILD/RESIDUAL}} reviewed before each major launch and {{quarterly}}; next: {{YYYY-MM-DD}} | {{review completion recorded per RUNBOOK.md; checked in the release checklist}} |

---

*End of NFR {{vX}} — {{PROJECT_NAME}}*
