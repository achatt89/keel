<!--
  Keel template — IMPLEMENTATION_PLAN.md (build plan & phase gates)
  WHAT: The master build sequence — phases 0..N with goal, scope (cross-refs),
        deliverables, and concrete exit gates; a phase-status table; standing
        rules; and a requirement-coverage map.
  INCLUDE WHEN: always. Short checklist for a prototype; full gated sequence for
        a platform (adaptivity: scales with ambition tier).
  DEPENDS ON: all requirement + technical docs; Delivery/Ops interview round.
  OWNS: Phase 0..N. References BRD/PRD/ADR/NFR per phase. This is the doc the
        builder touches most — phase status is updated as the build progresses.
  CROSS-REF: requirements/decisions by ID ("AUTH-002", "ADR-014"); structure by
        doc+section ("ARCHITECTURE.md §6").
  KEY RULE: Phase 0 is foundations/guardrails. Order phases so a guardrail exists
        BEFORE anything that could flow through and violate it. Exit gates are
        specific, runnable test suites — never "review" or "looks done".
  Delete all <!-- Keel guidance --> comments when filling this in.
-->

# {{PROJECT_NAME}} — Implementation Plan

**Version:** {{VERSION}}
**Status:** {{STATUS}}
**References:** {{ENGINEERING_DESIGN.md, BRD.md, ARCHITECTURE.md, LLD.md, NFR.md — whichever exist}}

---

## How to read this plan

<!-- Keel guidance: state the ordering RULE (guardrails before what flows through them),
     then how each phase is structured, then which phases deliver the launchable line. -->

Work is broken into phases ordered by one rule: **the core trust/isolation boundary and its guardrails are built before anything that could leak through them.** Each phase lists scope (with the doc that specifies it), deliverables, and **exit gates** — the criteria that must be green in CI before the next phase starts. Gates are not advisory: a phase is open until its gates pass.

Phases 0–{{N}} deliver {{v1 / the launchable line}}. Phase {{N+1}} is {{the post-launch line}}.

### Phase status

> Updated immediately after every merge to the trunk. Markers: ⬜ not started · 🔄 in progress · ✅ complete.

| Phase | Status | Exit gate (one line) | Last update |
|---|---|---|---|
| 0 — {{Guardrails First}} | ⬜ | {{the enforcement machinery demonstrably blocks a violating PR}} | — |
| 1 — {{Core boundary}} | ⬜ | {{the isolation/trust suite is green and required}} | — |
| 2 — {{...}} | ⬜ | {{...}} | — |
| {{N}} — {{Hardening & Launch}} | ⬜ | {{every NFR target met; pen-test criticals = 0}} | — |
| {{N+1}} — {{v2 line}} | ⬜ | — | — |

### Standing rules (apply to every phase, every commit)

- **Workflow-first.** Every phase is executed by running its workflow script: `claude --workflow .claude/workflows/phase-N-{{slug}}.js` (or invoke via the Workflow tool). Divisible tasks fan out as parallel agents in separate `git worktree`s — one per task, never shared. Worktrees merge back to the feature branch after gates pass; only then to trunk. No direct commits to trunk. For undivisible work (single-file refactors, hotfixes), branch-per-feature off trunk is still required; the worktree is still the working copy.
- **Tests ship with the code.** Every unit of work carries the tests its risk demands — unit for pure logic/edge paths, integration for cross-module behaviour, smoke for wiring. Security- and isolation-critical behaviour is **proven by a test**, never asserted in prose. "No test was necessary" is a stated judgement, not a default.
- **Doc sync is mandatory before merge.** After every unit of work, run `.claude/workflows/doc-sync.js` before merging to trunk. It updates: CLAUDE.md current status · IMPLEMENTATION_PLAN phase table · ADR.md for any new decisions · deferred-items table for anything punted. A merge without the doc-sync commit is incomplete. Docs never lag code.
- **Decisions captured without fail.** Any architectural decision made during the work — even a "we chose X over Y because Z" in a PR comment — becomes an ADR entry before the merge commit. `[NEEDS DECISION]` markers resolved during the phase are removed from docs and converted to ADR entries. Deferred items state WHY and WHEN they will be revisited, not just WHAT.
- **Definition of done per PR:** {{lint green (incl. custom security rules) · unit + integration tests green · isolation/critical suite green · `npm audit` (or equivalent) clean · doc-sync commit present}}.

---

<!-- Keel guidance: PHASE 0 is special — it builds the empty app in which it is already
     structurally impossible to violate the core rules. Lint rules, CI gates, config,
     auth/role scaffolding. Its exit gate is "a violating PR fails CI", demonstrated. -->

## Phase 0 — {{Guardrails First}}

**Goal:** {{an empty application in which it is already structurally impossible to violate the core rules — one sentence}}.

**Scope** ({{ADR-xxx; NFR-BUILD; LLD §n; COMMANDS.md}}):
- Repo scaffolding: {{language/runtime, framework skeleton with `/health`, local stack (compose), CI pipeline}}.
- {{Custom lint rules / enforcement machinery wired as CI failures from the first commit}}.
- CI gates: {{dependency audit, baseline checks, no-skip checks on critical suites}}.
- {{Config: validated env (hard startup failure on missing vars); the one home of {{model strings / secrets schema}}}}.
- {{Auth / role registry scaffolding — the only legal home of role checks}}.
- {{Error hierarchy + global handler; observability wiring + telemetry allowlist}}.

**Exit gates:**
- A test PR that {{violates each core rule}} **fails CI** — demonstrated for each rule.
- {{Telemetry/sanitiser unit tests prove disallowed keys are dropped}}.
- {{Config startup-failure and error-serialisation tests green}}.

**Workflow:** `.claude/workflows/phase-0-guardrails.js`
**Doc-sync gate:** `.claude/workflows/doc-sync.js` completes and the doc-sync commit is present before any merge to trunk.

---

<!-- ============================================================ -->
<!-- Copy this block per phase. Keep the same four headings.       -->
<!-- ============================================================ -->

## Phase {{N}} — {{Phase name}}

**Goal:** {{one sentence — what becomes true and provable when this phase closes}}.

**Scope** ({{ARCHITECTURE.md §n; LLD §n; ADR-xxx; the specifying docs}}):
- {{Deliverable area 1 — what, with the contract it implements}}.
- {{Deliverable area 2}}.
- {{Deliverable area 3}}.

**Deliverables:**
- [ ] {{concrete artefact / module / endpoint}}
- [ ] {{...}}
- [ ] tests: {{which suites this phase adds}}

**Exit gates:** <!-- concrete and runnable — name the test suite or the measurable target, never "review" -->
- {{Specific suite green, e.g. "isolation suite: two tenants, zero cross-visibility across every tenant-scoped table"}}.
- {{Specific measurable target met, e.g. "P95 ≤ Ns at normal load"}}.
- *If this phase includes UI work:* `/impeccable audit {{UI_PATH}}` passes with zero P0 or P1 findings. `/impeccable critique {{UI_PATH}}` complete and findings addressed.
- *If this phase includes new UI patterns:* `modern-web-guidance search` was consulted for each new pattern before implementation (record in PR description which queries were run).
- **Doc-sync gate:** `.claude/workflows/doc-sync.js` completes — CLAUDE.md updated, IMPLEMENTATION_PLAN phase status updated, decisions → ADR, deferred items recorded.
- Traceability: {{BRD/PRD IDs this phase satisfies}}.

**Workflow:** `.claude/workflows/phase-{{N}}-{{slug}}.js`

<!-- ============================================================ -->

---

## Phase {{N}} — {{Hardening, Sign-off, Launch}}

<!-- Keel guidance: the launch phase proves, not asserts. Full regression suite as a
     single required stage; perf vs every NFR target; ops drills; external review. -->

**Goal:** prove, don't assert.

**Scope** ({{NFR.md; RUNBOOK.md; COMPLIANCE.md if present}}):
- Full {{security/critical}} regression suite green as one required CI stage.
- Load/perf verification against every {{NFR-PERF}} target; cost model vs {{BO-xx}}.
- Runbook drills: {{recovery, outage degradation, restore-from-backup}}.
- {{External pen test / compliance review}}; findings triaged to fix-or-ADR.
- {{Pre-launch security review (RUNBOOK cadence) — launch is blocked on it}}.

**Exit gates:** every {{NFR}} target measured and met or formally re-negotiated; {{pen-test criticals = 0; compliance sign-off recorded}}. **This is the launch gate.**

---

## Requirement coverage map

<!-- Keel guidance: every BRD/PRD requirement GROUP maps to the phase(s) that satisfy it.
     A requirement with no phase is unbuilt; a phase touching no requirement is suspect. -->

| Requirement group | Phase(s) |
|---|---|
| {{AUTH-xxx (the core boundary)}} | 1 |
| {{<GROUP>-xxx}} | {{2}} |
| {{<GROUP>-xxx}} | {{3}} |
| {{Deferred / Should-Have}} | {{Deferred to v1.5 (ADR-xxx)}} |
| {{SEC-xxx, BO-xx (proof + launch)}} | 0–{{N}} (gates) + {{N}} |

---

## Deferred items

<!-- Keel guidance: every item punted during any phase lands here before the phase closes.
     "Deferred" is not "forgotten" — each item has a reason and a revisit trigger.
     Items resolved in a later phase are marked ✅ with a note.
     This table is updated by the doc-sync workflow (.claude/workflows/doc-sync.js). -->

| Item | Deferred from | Reason | Target phase | Status |
|---|---|---|---|---|
| *(none yet — items added by doc-sync workflow as work progresses)* | — | — | — | ⬜ |

---

## Workflow scripts

<!-- Keel guidance: these scripts are generated by Keel into .claude/workflows/ alongside
     the docs. Each phase script fans out divisible work as parallel worktree agents, runs
     a mandatory doc-sync step, then merges. Run them via the Workflow tool or:
       claude --workflow .claude/workflows/<script>.js -->

| Script | Purpose |
|---|---|
| `.claude/workflows/doc-sync.js` | Mandatory pre-merge: update CLAUDE.md status, IMPLEMENTATION_PLAN phase table, ADR, deferred items. Run after every unit of work. |
| `.claude/workflows/phase-0-guardrails.js` | Phase 0 — Guardrails: scaffold repo, lint rules, CI, auth/role framework. |
| `.claude/workflows/phase-{{N}}-{{slug}}.js` | Phase N — {{PHASE_NAME}}: parallel worktree agents + doc-sync + merge. |
| *(one script per phase — generated by Keel from the phase template)* | |

---

*End of IMPLEMENTATION_PLAN.md — {{PROJECT_NAME}}*
