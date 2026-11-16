<!--
  Keel template — AGENTS.md (the keystone index — CANONICAL)
  WHAT: The entry point every coding agent (Claude Code, Codex, Cursor, …) and every new
        contributor reads first. A LIGHT file: one-line description, a document-map table,
        the hard-invariants table, the workflow as one line per step, a two-row status table,
        and the pre-PR checklist (invariants only).
  PLACEMENT: each instruction has one home (references/conventions.md "Placement rule"). The
        keystone holds pointers and one-line rules; detail lives in the doc or script it names. `CLAUDE.md` is `@AGENTS.md` plus Claude-only sections — never a copy.
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

<!-- Keel guidance: one line per step; the keystone loads every session. The detail lives once:
     IMPLEMENTATION_PLAN "Standing rules" (the rules) and `.claude/workflows/README.md` (the
     mechanics, stages, delegation). Never expand a step here — fix its home instead.
     Placeholders: owner = `doc-sync`/`security`/`design` subagent (.claude/agents/<role>.md) or the
     full-time agent named in .keel/meta.json "agents". Drop step 9 only if neither role is set up. -->

0. **Git from commit one:** `git init` and commit the generated docs before any feature work.
1. **Two units of work:** a Phase runs on `phase-N-<slug>` (`/keel phase new <slug>`); a Change on `chg/<slug>` (`/keel change <slug>`). Never commit to `main`.
2. **Run the phase script:** `claude --workflow .claude/workflows/phase-N-<slug>.js` (mechanics: `.claude/workflows/README.md`).
3. **Tests ship with the code;** security and isolation behaviour is proven by a test.
4. **Done per change:** {{DOD_GATES}}.
5. **Doc sync before the completing commit:** inline when only status lines change, else delegate to doc-sync ({{DOC_SYNC_OWNER}}; `doc-sync.js`, ≤3 rounds, then deferred items).
6. **Merge** only with gates green and the doc-sync commit present; **deploy** per `{{DEPLOYMENT}}`, which alone writes deploy state.
7. **Decisions → `docs/adr/` before merge** (no addenda; open questions in `docs/adr/README.md`).
8. **Claims carry evidence:** no `✅` without a level (`code-read` < … < `prod-live`) and an artefact.
9. **Review before done:** security reviewer ({{SECURITY_REVIEWER}}) on every code-changing diff, design reviewer ({{DESIGN_REVIEWER}}) for UI; high/critical or P0/P1 means not done.

Rules and rationale: IMPLEMENTATION_PLAN "Standing rules". Delegation (callers supervise their subagents, read the `## Report`, commit themselves): `.claude/workflows/README.md`.

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

<!-- Keel guidance: one line per hard invariant above (same numbering). The standing gates
     (size + link check, doc-sync commit, reviews) are steps 5–9 and the `keel-gates` Stop hook,
     not boxes here. -->

- [ ] (1) every new {{SCOPED_QUERY}} carries its scope key
- [ ] (2) no untrusted input crosses {{BOUNDARY}} outside {{GUARD}}
- [ ] (3) no UPDATE/DELETE against {{APPEND_ONLY_TABLES}}
- [ ] (4) {{SENSITIVE_OPERATION}} only via {{CANONICAL_MODULE}}
- [ ] (5) no inline role checks outside {{RBAC_MODULE}}
- [ ] `{{COMMANDS}}` / `{{DEPLOYMENT}}` / `{{RUNBOOK}}` updated if a command, env var, or procedure changed

<!-- Claude-only lines (workflow tooling, review roles, UI-skills pointer) live in CLAUDE.md, which starts with `@AGENTS.md`. -->
