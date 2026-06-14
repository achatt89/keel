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

### Standing rules (apply to every phase)

<!-- Keel guidance: git workflow, tests-with-code, post-merge doc sync, definition-of-done.
     These mirror CLAUDE.md — state them once here as the home, reference elsewhere. -->

- **Git workflow:** every feature starts on a fresh branch cut from the trunk; divisible work runs as parallel agents in separate worktrees; worktrees merge back to the feature branch; commit there with gates green; only then merge to trunk. No direct commits to trunk.
- **Tests ship with the code:** every unit of work carries the tests its risk demands — unit for pure logic/edge paths, integration for cross-module behaviour, smoke for wiring. Security- and isolation-critical behaviour is **proven by a test**, never asserted in prose. "No test was necessary" is a stated judgement, not a default.
- **Post-merge doc sync:** immediately after a merge, update the Phase status table above, the current-status line in CLAUDE.md, and any docs the work touched (ADRs, README index, RUNBOOK). A merge is incomplete until docs reflect reality.
- **Definition of done per PR:** {{lint green (incl. custom security rules) · unit + integration tests green · isolation/critical suite green · `npm audit` (or equivalent) clean}}.

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
- Traceability: {{BRD/PRD IDs this phase satisfies}}.

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

*End of IMPLEMENTATION_PLAN.md — {{PROJECT_NAME}}*
