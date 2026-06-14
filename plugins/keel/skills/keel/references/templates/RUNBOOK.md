<!--
  Keel template — RUNBOOK.md (operations & incident response)
  WHAT: The on-call playbook — environments, first-time setup, standard deploy,
        rollback paths, incident-response playbooks, monitoring (dashboards/SLOs/
        alerts), backup & recovery, security-review cadence, pre-launch checklist.
  INCLUDE WHEN: the system is deployed and operated. Skip for weekend prototypes
        and libraries that ship to a registry only.
  DEPENDS ON: NFR.md (alert thresholds), COMMANDS.md (commands), ARCHITECTURE.md.
  OWNS: incident playbooks and the pre-launch checklist.
  CROSS-REF: NFR-<AREA>-xxx for thresholds; COMMANDS.md for the underlying command;
        ADR-<nnn> for the "why".
  KEY RULE: command-first, terse. If a procedure here is wrong, fix it in the same
        PR as the change that broke it.
  Delete all <!-- Keel guidance --> comments when filling this in.
-->

# {{PROJECT_NAME}} — RUNBOOK.md

> Operational playbook for running {{PROJECT_NAME}} in production. Command-first; keep current.

---

## Environments

| Environment | URL | Notes |
|---|---|---|
| Local | `http://localhost:{{PORT}}` | Docker Compose — {{Postgres + Redis}} |
| {{Staging}} | `https://{{staging.HOST}}` | {{...}} |
| Production | `https://{{HOST}}` | {{host/platform; separate api / workers services?}} |

---

## First-time setup (new environment)

<!-- Keel guidance: ordered, because infra has dependency order (network → secrets →
     DB → cache → storage → compute → CDN). Include seed verification + first admin. -->

```bash
# 1. Provision infrastructure in dependency order
{{PROVISION_CMDS — e.g. terraform apply -target=... in order}}

# 2. Run migrations + seed, then verify
{{MIGRATE_CMD}}
{{SEED_VERIFY_CMD}}
```

3. **First admin user:** {{how the first privileged user is created/promoted}}.

---

## Standard deployment

<!-- Keel guidance: describe the trigger (push to trunk?), the pipeline steps, the
     deployment topology (blue-green? rolling?), and the SLOs to watch during rollout. -->

**Trigger:** {{push to trunk runs the deploy workflow / manual command}}.

Pipeline: {{build → push image → migrate → deploy → wait-stable → smoke → repeat for prod}}.

**SLOs to watch during a deploy:**

| Signal | Target | Where |
|---|---|---|
| {{API p95 latency}} | {{< 500 ms}} | {{dashboard}} |
| {{5xx rate}} | {{< 0.1%}} | {{dashboard}} |
| {{Queue depth}} | {{< N steady-state}} | {{dashboard}} |

{{If an SLO breaches during rollout, the deploy auto-rolls back (circuit breaker) / page on-call.}}

---

## Rollback

<!-- Keel guidance: offer MULTIPLE independent paths; pick the smallest that fits.
     Code-only revert · forward-only DB compensating migration · feature-flag kill. -->

Three independent rollback paths. Pick the smallest one that fits.

**A. Code-only revert** (regression, schema + data fine):
```bash
{{REVERT_TO_PREVIOUS_RELEASE_CMD}}
```

**B. Database** (migrations are forward-only): write a compensating migration `{{V<n+1>__revert_<thing>}}`, test against a clone of prod, ship via the normal pipeline. For data (not schema) damage, restore affected rows from {{point-in-time backup}}.

**C. Feature-flag kill switch:** {{for flag-gated features, toggle off in the flag console — no deploy. Effects propagate within ~Ns.}}

---

## Incident response

### First 5 minutes
1. Acknowledge the page.
2. Open {{the overview dashboard}}; identify the broken dimension ({{5xx / latency / queue depth}}).
3. Check {{service events + logs}} for the same window.

<!-- ============================================================ -->
<!-- Copy this block per incident type: symptom → investigate → resolve. -->
<!-- ============================================================ -->

### {{Incident type — e.g. High query latency}}

**Symptom / alert:** {{the alert condition, e.g. "P95 > Nms over 5 min"}}.

**Investigate** (in order):
1. {{First thing to check — dashboard / query}}.
2. {{Next — upstream dependency / provider status}}.
3. {{Next — saturation: pool, queue, concurrency}}.

**Resolve:** {{action for transient cause (often none — fallback handles it) vs structural cause (the fix command/procedure)}}.

<!-- ============================================================ -->

### {{Security incident — e.g. Suspected cross-boundary data leak}}

**Symptom:** {{...}}.

**Investigate / contain:**
1. {{Immediately revoke/disable the affected actor's access}}.
2. {{Run the isolation/critical suite against the affected environment}}.
3. {{Pull audit log for the relevant window}}.

**Resolve:** {{if confirmed: notify within the regulatory window ({{72h GDPR}}), escalate to {{owner/legal}}, root-cause, patch, re-run the suite, re-enable.}}

---

## Monitoring

<!-- Keel guidance: dashboards table + alert-thresholds table. Thresholds are OWNED by
     NFR.md — reference the NFR ID; don't restate the number's rationale here. -->

### Dashboards

| Dashboard | What it shows | Normal range |
|---|---|---|
| {{Overview}} | {{p50/p95/p99 latency; error rate}} | {{p95 < Nms; errors < N%}} |
| {{Jobs / queue}} | {{queue depth; failure rate; DLQ}} | {{DLQ = 0}} |
| {{Cost}} | {{daily spend by tenant; projection vs ceiling}} | {{< $N / mo}} |

### Alert thresholds (targets owned by NFR.md)

| Alert | Condition | Action |
|---|---|---|
| {{Latency degraded}} | {{P95 > Nms over 5 min}} | investigate ({{NFR-PERF-xxx}}) |
| {{Latency critical}} | {{P95 > Nms over 5 min}} | page on-call |
| {{DLQ growth}} | {{depth > N}} | investigate error codes before retrying |
| {{Critical-suite failure in CI}} | {{isolation test fails}} | block deploy immediately |

Page on-call for Critical; investigate async (within {{2h}}) for Warning.

---

## Backup & recovery

<!-- Keel guidance: per durable store — backup cadence/retention, restore procedure,
     and what is regenerable (not backed up). Name the system of record. -->

### {{Primary datastore — e.g. Postgres}}
{{Backup cadence + retention.}} **Restore:**
```bash
{{RESTORE_CMDS}}
```

### {{Cache / queue — e.g. Redis}}
{{Not the system of record — all durable state lives in {{Postgres}}.}} On loss: {{waiting jobs lost → re-enqueue stale rows; cache regenerable, no action.}}

```bash
{{REQUEUE_STALE_CMD}}
```

---

## Security review cadence

<!-- Keel guidance: when the security architecture must be re-reviewed, plus the
     scheduled date that gets updated after each review. -->

Review the security architecture ({{ARCHITECTURE.md §n; NFR-SEC}}):
- Before every major feature launch.
- When {{new attack surface is added — connectors, providers, integrations}}.
- Quarterly, as hygiene.

Scope: trust boundaries, build-time gates, residual/accepted risks, {{baseline checks}}.

**Next scheduled review: {{YYYY-MM-DD}}.** Update after each completed review.

---

## Pre-launch checklist

<!-- Keel guidance: grouped by domain; every box must be ticked, signed, and dated before
     public launch. Drop groups that don't apply; keep the sign-off block. -->

Walk top-to-bottom before opening to the public. Every box ticked, signed, dated.

### Infrastructure
- [ ] {{IaC applied to prod with zero plan diff}}
- [ ] {{Datastore: HA / replica / PITR retention ≥ N days}}
- [ ] {{Storage buckets: versioning + access controls}}

### Auth & secrets
- [ ] {{Production auth tenant configured (not dev)}}
- [ ] {{All prod secrets populated in the secret store}}
- [ ] {{Admin MFA enabled}}

### Database
- [ ] {{All migrations applied; seeds verified}}
- [ ] {{Critical indexes present}}

### Observability
- [ ] {{Logs + dashboards rendering for every service}}
- [ ] {{On-call alerting receives a test 5xx}}
- [ ] {{Saturation alarms set}}

### App & compliance
- [ ] {{Pricing / billing accurate (live keys, webhook signing secret)}}
- [ ] {{Privacy policy + ToS live and dated}}
- [ ] {{Data-subject-rights (erasure/export) flow works end-to-end}}
- [ ] {{Rate limits + plan/feature gates enforced (covered by named tests)}}

### Final dry run
- [ ] {{Full smoke suite passes against staging}}
- [ ] {{End-to-end purchase / core-flow completed by someone outside the team}}
- [ ] {{Pre-launch security review complete (cadence above)}}

### Sign-off
- [ ] Engineering lead: _______________ date: _______
- [ ] {{Founder / owner}}: _______________ date: _______

---

*End of RUNBOOK.md — {{PROJECT_NAME}}*
