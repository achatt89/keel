<!--
  Keel template — IMPLEMENTATION_PLAN.md (build plan & phase gates)
  WHAT: The master build sequence — phases 0..N with goal, scope (cross-refs),
        deliverables, and an exit-gate TABLE (gate · evidence level · artefact); a
        phase-status table with deploy state; standing rules; a Changes table for
        hotfix-weight work (CHG-xxx); deferred items; and a requirement-coverage map.
  INCLUDE WHEN: always. Short checklist for a prototype; full gated sequence for
        a platform (adaptivity: scales with ambition tier).
  DEPENDS ON: all requirement + technical docs; Delivery/Ops interview round.
  OWNS: Phase 0..N and CHG-xxx. References BRD/PRD/ADR/NFR per phase. This is the doc the
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

Two units of work exist (conventions.md "Two work units"): a **Phase** is a gated milestone with
its own block, script and evidence file; a **Change** (`CHG-xxx`) is hotfix-weight work with no
gate of its own — it gets a row in the Changes table and a CHANGELOG line, never a phase block.
Phases are inserted as `N.1`, split as `N.1/N.2`; never renumbered.

### Phase status

> Updated by doc-sync on the phase branch (state-neutral) and by the deploy step. Markers: ⬜ not
> started · 🔄 in progress · ✅ complete (every gate ✅ with evidence). Deploy state:
> `on-branch` → `merged` → `deployed vNN` → `live-verified` (conventions.md "Deploy-state ladder").

| Phase | Status | Deploy state | Exit gate (one line) | Evidence | Last update |
|---|---|---|---|---|---|
| 0 — {{Guardrails First}} | ⬜ | — | {{the enforcement machinery demonstrably blocks a violating PR}} | — | — |
| 1 — {{Core boundary}} | ⬜ | — | {{the isolation/trust suite is green and required}} | — | — |
| 2 — {{...}} | ⬜ | — | {{...}} | — | — |
| {{N}} — {{Hardening & Launch}} | ⬜ | — | {{every NFR target met; pen-test criticals = 0}} | — | — |
| {{N+1}} — {{v2 line}} | ⬜ | — | — | — | — |

<!-- Keel guidance: "Evidence" is a link to `.keel/evidence/phase-N.json` once the Verify stage
     has written it; "Deploy state" is copied from CHANGELOG.md / DEPLOYMENT.md deploy log, the
     only places it is authored. -->

### Standing rules (apply to every phase, every commit)

- **Workflow-first, branch-per-phase.** Every **phase** is executed by running its workflow script: `claude --workflow .claude/workflows/phase-N-{{slug}}.js` (or invoke via the Workflow tool). The script creates one **phase branch** off trunk as the phase's integration point, then fans out divisible tasks as parallel agents in separate `git worktree`s branched off it — one per task, never shared. Task worktrees merge back into the phase branch after gates pass; only the phase branch — carrying every task plus the doc-sync commit — ever merges to trunk. No direct commits to trunk, and no task branch merges to trunk directly. For hotfix-weight work — a **Change** (`CHG-xxx`): branch-per-change off trunk (`chg/<slug>`), the worktree is still the working copy, a row in the Changes table + a CHANGELOG line replace the phase block and script.
- **Goal-directed, self-contained tasks.** Every worktree agent opens its task with `/goal` — its own completion condition (implementation done, tests pass, lint clean, `verify` confirms the behavior end-to-end, manual `claude-in-chrome` pass for UI work) that blocks it from ending its turn early. Exit strategy when the goal isn't met: {{GOAL_EXIT_STRATEGY — one of: "bounded retries (N=3), then `/goal clear` + commit + deferred-items row for human review" / "no retry cap — keep fixing until the condition holds; `/goal clear` only if provably impossible as specified" / "no self-retry — stop and report on first failed check"}}.
- **Tests ship with the code.** Every unit of work carries the tests its risk demands — unit for pure logic/edge paths, integration for cross-module behaviour, smoke for wiring. Security- and isolation-critical behaviour is **proven by a test**, never asserted in prose. "No test was necessary" is a stated judgement, not a default.
- **Doc sync is mandatory before merge.** After every unit of work, run `.claude/workflows/doc-sync.js` before merging to trunk. It updates: AGENTS.md current status · this phase table (state-neutral — deploy state is flipped by the deploy step, never pre-written) · `docs/adr/` for any new decisions · deferred-items / Changes tables · CHANGELOG `[Unreleased]` · byte budgets (auto-archive on breach). A merge without the doc-sync commit is incomplete. Docs never lag code.
- **Decisions captured without fail.** Any architectural decision made during the work — even a "we chose X over Y because Z" in a PR comment — becomes a `docs/adr/ADR-xxx-<slug>.md` before the merge commit, using an ID reserved at scope or taken at Integrate (never in a worktree). `[NEEDS DECISION]` markers resolved during the phase are removed from docs and converted to ADRs; unresolved ones stay as one row per question in `docs/adr/README.md`. Deferred items state WHY and WHEN they will be revisited, not just WHAT. Negative results ("confirmed not a bug") are recorded too.
- **Definition of done per PR:** {{lint green (incl. custom security rules) · unit + integration tests green · isolation/critical suite green · `npm audit` (or equivalent) clean · doc-sync commit present}}.
- **Claims carry evidence.** A gate, phase, deferred item or status line is `✅` only with an evidence level (`code-read` < `unit` < `integration` < `local-browser` < `staging` < `prod-live`) and an artefact (commit, CI URL, test report, browser transcript). The phase script's **Verify** stage writes `.keel/evidence/phase-N.json`; doc-sync cites it and does not re-run suites. Evidence inherited from an earlier phase is cited as inherited. "Mechanism tested, outcome not observed" is `⬜`, not `✅`. Overclaiming is a defect, not a style issue.

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

| Gate | Evidence level | Artefact | Verified by | Status |
|---|---|---|---|---|
| A test PR that {{violates each core rule}} **fails CI** — one per rule | `integration` | {{CI run URL}} | {{agent / human}} | ⬜ |
| {{Telemetry/sanitiser unit tests prove disallowed keys are dropped}} | `unit` | {{test file}} | — | ⬜ |
| {{Config startup-failure and error-serialisation tests green}} | `unit` | {{test file}} | — | ⬜ |
| Doc-sync commit present on the phase branch | `code-read` | {{commit}} | doc-sync | ⬜ |

**Workflow:** `.claude/workflows/phase-0-guardrails.js` · **Evidence:** `.keel/evidence/phase-0.json`
**ADRs reserved at scope:** {{ADR-xxx, ADR-xxx}}

---

<!-- ============================================================ -->
<!-- Copy this block per phase. Keep the same four headings.       -->
<!-- Once a phase ships (✅), `/keel archive` can relocate this     -->
<!-- whole block to PHASE_ARCHIVE.md, leaving a one-line outcome   -->
<!-- + link here — the phase-status table row stays either way.    -->
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

**Exit gates:** <!-- concrete and runnable — name the suite or the measurable target, never "review". The
   "Evidence level" column states the MINIMUM level that closes the gate; Verify records the level
   actually reached. A gate is ✅ only at or above its minimum, with an artefact. -->

| Gate | Evidence level | Artefact | Verified by | Status |
|---|---|---|---|---|
| {{Specific suite green, e.g. "isolation suite: two tenants, zero cross-visibility across every tenant-scoped table"}} | `integration` | — | — | ⬜ |
| {{Specific measurable target met, e.g. "P95 ≤ Ns at normal load"}} | `staging` | — | — | ⬜ |
| *UI:* `/impeccable audit {{UI_PATH}}` zero P0/P1; `/impeccable critique` findings addressed | `local-browser` | — | — | ⬜ |
| *UI:* `modern-web-guidance search` consulted per new pattern (queries listed in PR) | `code-read` | — | — | ⬜ |
| *UI:* golden path driven in-browser (`claude-in-chrome`) | `local-browser` | {{transcript path}} | — | ⬜ |
| Doc-sync commit present on the phase branch | `code-read` | — | doc-sync | ⬜ |

**Traceability:** {{BRD/PRD IDs this phase satisfies}}.
**Workflow:** `.claude/workflows/phase-{{N}}-{{slug}}.js` · **Evidence:** `.keel/evidence/phase-{{N}}.json`
**ADRs reserved at scope:** {{ADR-xxx — planned topic; "none" if the phase is expected to make no decisions}}

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

**Exit gates:** <!-- same table shape; the launch gate's minimum level is `staging` or `prod-live`, never lower -->

| Gate | Evidence level | Artefact | Verified by | Status |
|---|---|---|---|---|
| Every {{NFR}} target measured and met or formally re-negotiated | `staging` | — | — | ⬜ |
| {{Pen-test criticals = 0; compliance sign-off recorded}} | `prod-live` | — | human | ⬜ |
| DEPLOYMENT.md post-deploy live-verification checklist green on prod | `prod-live` | — | human | ⬜ |

**This is the launch gate.**

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
     "Deferred" is not "forgotten" — each item has a reason, an owner and a revisit trigger.
     Negative results land here too ("re-benchmarked {{date}}, still deferred: {{why}}").
     Items resolved in a later phase are marked ✅ with a note.
     This table is updated by the doc-sync workflow (.claude/workflows/doc-sync.js).
     `/keel archive` relocates ✅-resolved rows to PHASE_ARCHIVE.md, keeping this table
     down to open items only. -->

| Item | Deferred from | Reason | Owner | Revisit trigger | Target | Status |
|---|---|---|---|---|---|---|
| *(none yet — items added by doc-sync workflow as work progresses)* | — | — | — | — | — | ⬜ |

<!-- Keel guidance: Owner is founder / engineering / legal — who can close it. Revisit trigger is
     the observable condition, not a date. When the table exceeds {{K}} open rows, `/keel closeout`
     scopes a closeout phase. -->

---

## Changes

<!-- Keel guidance: the hotfix-weight unit (conventions.md "Two work units"). One row per
     `CHG-xxx`, added by `/keel change <slug>` and closed by doc-sync. No phase block, no script.
     Deploy state is copied from CHANGELOG.md. Rows for resolved changes are relocated to
     PHASE_ARCHIVE.md by `/keel archive`. -->

| CHG | Date | Branch | Summary | ADR | Evidence | Deploy state |
|---|---|---|---|---|---|---|
| *(none yet)* | — | — | — | — | — | — |

---

## Workflow scripts

<!-- Keel guidance: these scripts are generated by Keel into .claude/workflows/ alongside
     the docs. Each phase script fans out divisible work as parallel worktree agents, runs
     a mandatory doc-sync step, then merges. Run them via the Workflow tool or:
       claude --workflow .claude/workflows/<script>.js -->

| Script | Purpose |
|---|---|
| `.claude/workflows/doc-sync.js` | Mandatory pre-merge: update AGENTS.md status, this file's tables, `docs/adr/`, CHANGELOG `[Unreleased]`; cite `.keel/evidence/`; auto-archive on budget breach. Run after every unit of work. |
| `.claude/workflows/phase-0-guardrails.js` | Phase 0 — Guardrails: scaffold repo, lint rules, CI, auth/role framework. |
| `.claude/workflows/phase-{{N}}-{{slug}}.js` | Phase N — {{PHASE_NAME}}: Setup (reserve ADR IDs) → parallel worktree agents → Integrate → Verify (writes evidence file) → doc-sync → merge. |
| *(one script per phase — generated by Keel from the phase template)* | |

---

*End of IMPLEMENTATION_PLAN.md — {{PROJECT_NAME}}*
