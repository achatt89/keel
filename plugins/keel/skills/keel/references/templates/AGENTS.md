<!--
  Keel template — AGENTS.md (the keystone index — CANONICAL)
  WHAT: The entry point every coding agent (Claude Code, Codex, Cursor, …) and every new
        contributor reads first. A LIGHT file: one-line description, a document-map table,
        the hard-invariants table, the working workflow, a two-row status table, and the
        pre-PR checklist. `CLAUDE.md` is `@AGENTS.md` plus Claude-only sections — never a copy.
  INCLUDE WHEN: Always — every Keel-generated suite has exactly one AGENTS.md.
  DEPENDS ON: Everything; written last so it indexes only docs that actually exist.
  OWNS: No IDs. References every other doc. When this file and a referenced doc
        disagree, the doc wins — fix the pointer here, not the doc.
  BYTE BUDGET: 12 KB, hard. It is loaded into every session. The budget lives in
        `.keel/meta.json` ("budgets"); doc-sync measures it and auto-archives on breach
        (conventions.md "Byte budgets & auto-archive"). Narrative never lives here — status
        is two table rows; history is CHANGELOG.md / PHASE_ARCHIVE.md.
  Delete all <!-- Keel guidance --> comments (and this block) when filling this in.
-->

# {{PROJECT_NAME}} — AGENTS.md

<!-- Keel guidance: one or two sentences. What the project is, the stack in a clause,
     and the single overriding value (e.g. "security and auditability rank above
     feature velocity"). No marketing. No detail that lives elsewhere. -->
{{PROJECT_NAME}} is {{ONE_LINE_DESCRIPTION}} ({{STACK_SUMMARY}}). {{OVERRIDING_PRINCIPLE}}.

This file is deliberately light. The documents below are the source of truth — read the
relevant one *before* touching code.

## Document map

<!-- Keel guidance: list ONLY docs that exist on disk (conventions traceability rule).
     One row per doc. "When you are…" is the trigger that sends a reader there. Drop
     rows for docs the project doesn't warrant; add rows for ones it does. -->

| Read this | When you are |
|---|---|
| `docs/{{ENGINEERING_DESIGN}}` | Starting any work — design pillars, the core domain model, data classification, **non-negotiables** |
| `docs/{{DESIGN_DOC}}` | Building UI — the design system: tokens, components, patterns, multi-interface rules |
| `docs/{{IMPLEMENTATION_PLAN}}` | Picking up work — current phase, scope, and the exit gates that block the next phase |
| `docs/{{LLD}}` | Writing code — module map, interfaces, schemas, security-module implementations |
| `docs/{{ARCHITECTURE}}` | Making structural choices — components, schema, trust boundaries, controls by threat category, accepted risks |
| `docs/{{EXTENSION_SPEC}}` | Adding or changing a {{EXTENSION_POINT}} — the authoritative contract |
| `docs/adr/` | Wondering "why is it like this?" — one file per decision; `docs/adr/README.md` is the index + open questions |
| `docs/{{NFR}}` | Writing tests/gates — acceptance criteria, CI build gates, perf budgets |
| `docs/{{COMPLIANCE}}` | Touching personal/regulated data — data classes, consent, retention, erasure/export |
| `docs/{{BRD}}` / `docs/{{PRD}}` | Questioning scope or product behaviour |
| `{{COMMANDS}}` | Running anything — dev/test commands, seed/test-data tooling, env-var reference |
| `{{DEPLOYMENT}}` | Shipping — environment matrix, promotion path, build-time vs runtime config, post-deploy checks, deploy log |
| `CHANGELOG.md` | Asking "what shipped, and is it live?" — every change/phase with its deploy state |
| `{{RUNBOOK}}` | Operating, responding to an incident, or reading a postmortem |
| `docs/FEEDBACK_ROUNDS.md` *(if clients/stakeholders review builds)* | Tracing a client request to the phase/change that answered it |
| `docs/SPIKE_<slug>.md` · `docs/AUDIT_<date>.md` · `docs/COST_ANALYSIS.md` *(optional, on demand)* | Reading an investigation, a dated audit snapshot, or a measured cost model |
| `docs/PHASE_ARCHIVE.md` *(only once `/keel archive` has run)* | Revisiting finished or superseded work — relocated detail, nothing deleted |

## Hard invariants (full list + rationale: {{ENGINEERING_DESIGN}} §{{NONNEG_SECTION}})

<!-- Keel guidance: a SHORT table — the rules that must never be violated. "Enforced by" is a
     mechanism (lint rule, DB trigger, CI gate, typed interface), never "code review". "Gap" is
     the honest state: "—" when the mechanism is live, otherwise what is NOT yet enforced and
     where that gap is tracked (deferred item / phase). A rule with a Gap is still a rule; a
     reader must know it isn't airtight before relying on it. Keep to the load-bearing few. -->

| # | Rule | Enforced by | Gap | Source |
|---|---|---|---|---|
| 1 | {{INVARIANT_ISOLATION}} — every {{SCOPED_QUERY}} carries its scope key | {{access layer + {{BACKSTOP}} backstop}} | — | {{ENGINEERING_DESIGN}} §{{n}} |
| 2 | {{INVARIANT_TRUST_BOUNDARY}} — untrusted input crosses {{BOUNDARY}} only through {{GUARD}} | CI-failing lint rule `{{rule}}` | — | ADR-{{xxx}} |
| 3 | {{INVARIANT_APPEND_ONLY}} — {{APPEND_ONLY_TABLES}} never UPDATE/DELETE | DB trigger | — | {{ARCHITECTURE}} §{{n}} |
| 4 | {{INVARIANT_SINGLE_PATH}} — {{SENSITIVE_OPERATION}} only via {{CANONICAL_MODULE}} | {{typed interface / lint}} | {{e.g. "not yet linted — deferred item #n"}} | {{LLD}} §{{n}} |
| 5 | {{INVARIANT_RBAC}} — authorization checks live only in {{RBAC_MODULE}} | CI-failing lint rule | — | ADR-{{xxx}} |
| 6 | {{INVARIANT_OTHER}} | {{MECHANISM}} | {{—}} | {{DOC}} |

## Git & working workflow (mandatory — the build loop)

<!-- Keel guidance: these are non-negotiables, not suggestions. The workflow scripts in
     .claude/workflows/ encode this loop — use them to run every phase. Detail and rationale
     in IMPLEMENTATION_PLAN "Standing rules". -->

0. **Version control from commit one.** If this folder isn't a git repo yet, `git init` and make an initial commit (the generated docs are the first commit) before any feature work.
1. **Two units of work.** A **Phase** (gated milestone) runs its workflow script on `phase-N-<slug>` off `main` — the single integration branch for everything in that phase. A **Change** (`CHG-xxx`: hotfix, copy/config fix, client-feedback item) is `/keel change <slug>` → `chg/<slug>` off `main`, a Changes-table row and a CHANGELOG line — no phase block, no script. Never commit directly to `main`. New phases are scoped with `/keel phase new <slug>`.
2. **Run the phase workflow script** for any planned phase of work:
   `claude --workflow .claude/workflows/phase-N-<slug>.js`
   Or invoke via the Workflow tool inside a Claude Code session. The script reserves this phase's ADR IDs, checks out the phase branch, then fans out divisible tasks as parallel agents in separate `git worktree`s branched off it — one worktree per task, agents never share a working copy. Each task agent opens with `/goal` (code, tests, lint, `verify`, and a manual `claude-in-chrome` pass for UI work — it won't stop early); exit-strategy-when-stuck policy is in IMPLEMENTATION_PLAN "Standing rules". Task branches merge back into the phase branch, never straight to `main`. A **Verify** stage then writes `.keel/evidence/phase-N.json` (gate → evidence level → artefact) — only the phase branch, carrying every task plus the evidence file plus the doc-sync commit, ever merges to `main`.
3. **Write tests with the code, never after.** Unit tests for logic/edge paths; integration tests for cross-module behaviour; smoke tests for wiring. Security- and isolation-critical behaviour is *proven by a test*. "No test needed" is a stated judgement, not a default.
4. **Definition of done per change:** {{DOD_GATES}} (details: IMPLEMENTATION_PLAN "Standing rules").
5. **Doc sync before every merge to `main`** — run `.claude/workflows/doc-sync.js` on the branch (phase scripts do this automatically, after Verify). It updates: this file's status table · IMPLEMENTATION_PLAN tables · `docs/adr/` · CHANGELOG `[Unreleased]` — citing the evidence file, never re-deriving it — and auto-archives if this file breaches its 12 KB budget. Wording is state-neutral (no "merged"/"deployed" pre-written). A branch without the doc-sync commit is not done, whatever its tests say.
6. **Merge to `main`** only after gates pass and the doc-sync commit is present. **Deploy** per `{{DEPLOYMENT}}`; the deploy step stamps CHANGELOG + the deploy log (`deployed vNN` → `live-verified` after the post-deploy checklist). Deploy state is written there and nowhere else.
7. **Decisions captured without fail.** Any decision made during work — including "we chose X over Y because Z" — becomes a `docs/adr/ADR-xxx-<slug>.md` before merge (ID reserved at scope or taken at Integrate, never in a worktree). ADRs get no addenda: one `Build deviation` row, else a superseding ADR. Incidents → RUNBOOK postmortems. `[NEEDS DECISION]` markers resolved during work are removed and converted to ADRs; open ones are one row per question in `docs/adr/README.md`.
8. **Claims carry evidence.** Nothing is `✅` without an evidence level (`code-read` < `unit` < `integration` < `local-browser` < `staging` < `prod-live`) and an artefact. Overclaiming is a defect.

## Current status

<!-- Keel guidance: EXACTLY two rows, each cell one line. Overwritten (never appended) by doc-sync
     and the deploy step. Narrative goes to CHANGELOG.md; history to PHASE_ARCHIVE.md. -->

| | What | Deploy state | Evidence |
|---|---|---|---|
| **Last completed** | {{Phase N / CHG-xxx — one line}} | {{on-branch / merged / deployed vNN / live-verified}} | {{`.keel/evidence/phase-N.json` / CHANGELOG link}} |
| **Now** | {{Phase N+1 / CHG-xxx — one line}} | {{on-branch}} | — |

## Working agreements

<!-- Keel guidance: 3–5 bullets of standing rules that aren't workflow steps — the
     conventions a contributor must hold. Keep terse; point to docs for detail. -->

- Definition of done per change: {{DOD_SUMMARY}} (details: {{IMPLEMENTATION_PLAN}}).
- New {{SCOPED_RESOURCE}} gets its scope key + {{ISOLATION_CONTROL}} before its first migration merges; new decisions become `docs/adr/` entries; new accepted risks go to {{ARCHITECTURE}}.
- Migrations are timestamp-named; registries with uniqueness rules have a uniqueness test that runs at Integrate (parallel worktrees collide on sequential IDs).
- Negative results are recorded ("confirmed not a bug" is a row, not silence).
- When this file and a referenced doc disagree, **the referenced doc wins** — fix the pointer, not the doc.

## Pre-PR checklist

<!-- Keel guidance: one line per hard invariant above (same numbering) plus the standing gates.
     Derived, not authored — if an invariant changes, this changes with it. -->

- [ ] (1) every new {{SCOPED_QUERY}} carries its scope key
- [ ] (2) no untrusted input crosses {{BOUNDARY}} outside {{GUARD}}
- [ ] (3) no UPDATE/DELETE against {{APPEND_ONLY_TABLES}}
- [ ] (4) {{SENSITIVE_OPERATION}} only via {{CANONICAL_MODULE}}
- [ ] (5) no inline role checks outside {{RBAC_MODULE}}
- [ ] tests ship with the code; security/isolation behaviour proven by a test
- [ ] new decision → `docs/adr/`; new punt → deferred items (with owner + revisit trigger)
- [ ] `{{COMMANDS}}` / `{{DEPLOYMENT}}` / `{{RUNBOOK}}` updated if a command, env var, or procedure changed
- [ ] doc-sync commit present; this file under 12 KB

<!-- Claude-only sections (Active skills, Workflow-tool notes) live in CLAUDE.md, which starts with `@AGENTS.md`. -->
