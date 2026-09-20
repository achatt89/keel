<!--
  Keel template — RUNBOOK.md (operations & incident response)
  WHAT: The on-call playbook — incident-response playbooks (Symptom · Check · Fix ·
        Escalate), monitoring (dashboards/SLOs/alerts), backup & recovery, security-review
        cadence, routine operations, POSTMORTEMS, and the pre-launch checklist.
  INCLUDE WHEN: the system is deployed and operated. Skip for weekend prototypes
        and libraries that ship to a registry only.
  DEPENDS ON: NFR.md (alert thresholds), COMMANDS.md (commands), DEPLOYMENT.md (the
        environment matrix, promotion path, rollback and deploy log — NOT repeated here),
        ARCHITECTURE.md.
  OWNS: incident playbooks, PM-xxx postmortems, the pre-launch checklist.
  CROSS-REF: NFR-<AREA>-xxx for thresholds; COMMANDS.md for the underlying command;
        DEPLOYMENT.md §6 for rollback, §8 for gotchas; ADR-<nnn> for the "why".
  KEY RULE: command-first, terse, tables over prose. If a procedure here is wrong, fix it
        in the same PR as the change that broke it. Anything that happened AFTER a decision
        was made (an incident, a regression, a surprise in production) is a postmortem row
        here — never an addendum to the ADR.
  Delete all <!-- Keel guidance --> comments when filling this in.
-->

# {{PROJECT_NAME}} — RUNBOOK.md

> Operational playbook for running {{PROJECT_NAME}}. Command-first; keep current.
> Environments, promotion path, rollback, and the deploy log live in `DEPLOYMENT.md`.

---

## Incident response

### First 5 minutes
1. Acknowledge the page.
2. Open {{the overview dashboard}}; identify the broken dimension ({{5xx / latency / queue depth}}).
3. Check {{service events + logs}} for the same window, and `DEPLOYMENT.md §7` for a deploy in the last {{24h}}.
4. If a deploy is implicated: roll back first (`DEPLOYMENT.md §6`), diagnose second.

### Playbooks

<!-- Keel guidance: one table per incident type. Rows are ordered — the first Check that
     explains the Symptom stops the walk. "Escalate" names a role and a condition, never
     "if unsure". Copy the block per incident type. -->

#### {{High query latency}}

**Alert:** {{P95 > Nms over 5 min}} ({{NFR-PERF-xxx}})

| Symptom | Check | Fix | Escalate |
|---|---|---|---|
| {{P95 up, error rate flat}} | {{slow-query dashboard: any statement > 1s?}} | {{kill the runaway; add index via normal pipeline}} | {{DB owner if > 30 min}} |
| {{P95 up, pool saturated}} | `{{POOL_STATS_CMD}}` | {{scale API replicas `{{SCALE_CMD}}`; raise pool cap only with ADR}} | {{on-call lead if scaling doesn't clear in 10 min}} |
| {{P95 up, upstream provider slow}} | {{provider status page; `{{PROVIDER_LATENCY_QUERY}}`}} | {{none — fallback handles it; confirm fallback engaged}} | {{provider ticket if > 1h}} |

#### {{Queue backlog / DLQ growth}}

**Alert:** {{DLQ depth > N}}

| Symptom | Check | Fix | Escalate |
|---|---|---|---|
| {{DLQ growing, same error code}} | `{{DLQ_INSPECT_CMD}}` — read the error, don't retry blind | {{fix the cause; `{{DLQ_REPLAY_CMD}}`}} | {{owner of the failing job type}} |
| {{queue deep, workers idle}} | `{{WORKER_STATUS_CMD}}` | {{restart workers `{{RESTART_CMD}}`}} | {{if restarts loop: page}} |

#### {{Suspected cross-boundary data leak}} (security)

**Trigger:** {{report / audit-log anomaly / failing isolation test in prod}}

| Symptom | Check | Fix | Escalate |
|---|---|---|---|
| {{user sees another tenant's rows}} | {{revoke the actor's access NOW; pull audit log for the window; run the isolation suite against prod}} | {{patch; re-run suite; re-enable}} | **immediately**: {{owner + legal}}; regulatory clock ({{72h GDPR / PDPL}}) starts at confirmation — see `COMPLIANCE.md` |

#### {{Third-party integration dark}} (e.g. payments webhook, analytics beacon)

| Symptom | Check | Fix | Escalate |
|---|---|---|---|
| {{orders paid, status not updating}} | {{provider dashboard → webhook deliveries; our endpoint returning 4xx?}} | {{fix signature / raw-body handling; replay from provider}} | {{finance if > N orders affected}} |
| {{analytics shows zero events}} | `DEPLOYMENT.md §5` beacon check; {{public config endpoint says enabled?}} | {{set the deployment-managed value; redeploy}} | — |

---

## Monitoring

<!-- Keel guidance: dashboards table + alert-thresholds table. Thresholds are OWNED by
     NFR.md — reference the NFR ID; don't restate the number's rationale here. -->

### Dashboards

| Dashboard | What it shows | Normal range |
|---|---|---|
| {{Overview}} | {{p50/p95/p99 latency; error rate}} | {{p95 < Nms; errors < N%}} |
| {{Jobs / queue}} | {{queue depth; failure rate; DLQ}} | {{DLQ = 0}} |
| {{Cost}} | {{daily spend by tenant; projection vs ceiling}} | {{< $N / mo}} (`COST_ANALYSIS.md` if present) |

### Alert thresholds (targets owned by NFR.md)

| Alert | Condition | Action |
|---|---|---|
| {{Latency degraded}} | {{P95 > Nms over 5 min}} | investigate ({{NFR-PERF-xxx}}) |
| {{Latency critical}} | {{P95 > Nms over 5 min}} | page on-call |
| {{DLQ growth}} | {{depth > N}} | investigate error codes before retrying |
| {{Critical-suite failure in CI}} | {{isolation test fails}} | block deploy immediately |
| {{Cost anomaly}} | {{daily spend > 2× 7-day mean}} | investigate; kill switch if runaway ({{NFR-COST-xxx}}) |

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
**Verify the backup actually restores:** {{cadence, e.g. monthly}} — `{{RESTORE_DRILL_CMD}}` against a scratch DB; record the date in Routine operations below.

### {{Cache / queue — e.g. Redis}}
{{Not the system of record — all durable state lives in {{Postgres}}.}} On loss: {{waiting jobs lost → re-enqueue stale rows; cache regenerable, no action.}}

```bash
{{REQUEUE_STALE_CMD}}
```

---

## Routine operations

<!-- Keel guidance: recurring, scheduled, boring. Each row: what, cadence, command, last done.
     "Last done" is updated in place — it is the one living cell in this doc. -->

| Operation | Cadence | Command / procedure | Last done |
|---|---|---|---|
| {{Rotate third-party token}} | {{60 days}} | `{{ROTATE_CMD}}` | {{YYYY-MM-DD}} |
| {{Backup restore drill}} | {{monthly}} | see Backup & recovery | {{YYYY-MM-DD}} |
| {{Dependency audit}} | {{weekly / CI}} | `{{AUDIT_CMD}}` | CI |
| {{Secrets rotation — prod DB password}} | {{90 days or on exposure}} | `{{ROTATE_DB_CMD}}` + `DEPLOYMENT.md §4` | {{YYYY-MM-DD}} |
| {{Data-subject-request log review}} | {{monthly}} | `COMPLIANCE.md §n` | {{YYYY-MM-DD}} |

---

## Data-subject rights procedures

<!-- Keel guidance: only if COMPLIANCE.md exists. The procedure is HERE (operational steps);
     the legal basis, classes, and SLAs are OWNED by COMPLIANCE.md — reference, don't restate. -->

| Request | Steps | SLA (COMPLIANCE.md) | Log |
|---|---|---|---|
| Export | {{verify identity → `{{EXPORT_CMD user_id}}` → deliver via {{channel}} → log}} | {{§n}} | `{{location}}` |
| Erasure | {{verify identity → `{{ERASE_CMD user_id}}` → confirm cascade ({{stores}}) → confirm to user → log}} | {{§n}} | `{{location}}` |

---

## Security breach response

1. Contain (revoke, rotate, isolate) — within {{1h}}.
2. Preserve evidence: audit log export, request logs for the window.
3. Assess scope: which data classes (`ENGINEERING_DESIGN.md` §{{n}} C0–C3), how many subjects.
4. Notify: {{supervisory authority + affected users}} within {{72h}} per `COMPLIANCE.md §{{n}}` — {{owner}} decides, {{legal}} reviews.
5. Postmortem row below within {{5 working days}}.

---

## Postmortems

<!-- Keel guidance: ONE ROW PER INCIDENT, append-only, newest first. This is the home for
     everything that used to be written as "ADR-0xx Addendum N": a regression after a deploy,
     a silent config drop, a key baked into the wrong build, a webhook that never fired. The
     ADR records the DECISION; this table records what HAPPENED. "Prevention" names where the
     learning landed — a DEPLOYMENT.md §8 gotcha, a §5 check, a test, a lint rule, a checklist
     tick — so the same incident cannot recur silently. Blameless: roles, not names. -->

| PM | Date | Trigger (how noticed) | Root cause | Fix (commit) | Prevention (where it landed) | Related |
|---|---|---|---|---|---|---|
| PM-{{003}} | {{YYYY-MM-DD}} | {{client reported no ad events}} | {{origin allowlist dropped beacons from `www.`}} | `{{abc1234}}` | `DEPLOYMENT.md §8` gotcha + §5 beacon check | ADR-{{0xx}} |
| PM-{{002}} | {{YYYY-MM-DD}} | {{checkout failing for real customers, 4 days}} | {{test publishable key baked into prod build from local `.env`}} | `{{abc1234}}` | `DEPLOYMENT.md §3` pairing rule + §4 tick + §5 `pk_live_` grep | — |
| PM-{{001}} | {{YYYY-MM-DD}} | {{migration ran twice on staging}} | {{two worktrees allocated the same migration number}} | `{{abc1234}}` | timestamp migration names (`conventions.md`) | ADR-{{0xx}} |

Full write-ups (when a row isn't enough): `docs/PHASE_ARCHIVE.md#postmortems` — one heading per PM, relocated by `/keel archive`.

---

## Security review cadence

Review the security architecture ({{ARCHITECTURE.md §n; NFR-SEC}}):
- Before every major feature launch.
- When {{new attack surface is added — connectors, providers, integrations}}.
- Quarterly, as hygiene.

Scope: trust boundaries, build-time gates, residual/accepted risks, {{baseline checks}}, open PM rows without a Prevention entry.

**Next scheduled review: {{YYYY-MM-DD}}.** Update after each completed review.

---

## Pre-launch checklist

<!-- Keel guidance: grouped by domain; every box must be ticked, signed, and dated before
     public launch. Drop groups that don't apply; keep the sign-off block. Deploy-specific
     items (build-args, migrations) are DEPLOYMENT.md §4 — reference, don't duplicate. -->

Walk top-to-bottom before opening to the public. Every box ticked, signed, dated.

### Infrastructure
- [ ] {{IaC applied to prod with zero plan diff}}
- [ ] {{Datastore: HA / replica / PITR retention ≥ N days}}; restore drill done ({{date}})
- [ ] {{Storage buckets: versioning + access controls}}
- [ ] `DEPLOYMENT.md §1` matrix matches what is actually running (region, DB, services)

### Auth & secrets
- [ ] {{Production auth tenant configured (not dev)}}
- [ ] {{All prod secrets populated in the secret store}}; no secret is a build-time value (`DEPLOYMENT.md §3`)
- [ ] {{Admin MFA enabled}}

### Database
- [ ] {{All migrations applied; seeds verified}}; no test data in prod (`COMMANDS.md` prod-safe cleanup)
- [ ] {{Critical indexes present}}

### Observability
- [ ] {{Logs + dashboards rendering for every service}}
- [ ] {{On-call alerting receives a test 5xx}}
- [ ] {{Saturation + cost alarms set}}

### App & compliance
- [ ] {{Pricing / billing accurate (live keys, webhook signing secret) — a real charge completed and refunded}}
- [ ] {{Privacy policy + ToS live and dated}}
- [ ] {{Data-subject-rights (erasure/export) flow works end-to-end}}
- [ ] {{Rate limits + plan/feature gates enforced (covered by named tests)}}

### Final dry run
- [ ] `DEPLOYMENT.md §5` post-deploy checklist passed on the production domain
- [ ] {{End-to-end purchase / core-flow completed by someone outside the team}}
- [ ] {{Pre-launch security review complete (cadence above)}}

### Sign-off
- [ ] Engineering lead: _______________ date: _______
- [ ] {{Founder / owner}}: _______________ date: _______

---

*End of RUNBOOK.md — {{PROJECT_NAME}}*
