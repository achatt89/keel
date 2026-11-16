# invoices — AGENTS.md

invoices is the invoicing core for a two-person Berlin consultancy: a Node.js 20+ ES-module library, standard library only, no UI/HTTP/CLI, in memory until Phase 3. Correctness to the cent and gapless numbering outrank speed and convenience.

This file is deliberately light. The documents below are the source of truth — read the relevant one *before* touching code.

## Document map

| Read this | When you are |
|---|---|
| `docs/ENGINEERING_DESIGN.md` | Starting any work — pillars, domain model, **non-negotiables N-01..N-11** |
| `docs/IMPLEMENTATION_PLAN.md` | Picking up work — phase status, scope, exit gates, deferred items |
| `docs/LLD.md` | Writing code — API, validation table, VAT worked examples, CSV spec + byte-exact example |
| `docs/ARCHITECTURE.md` | Structural choices — components, trust boundary, controls, accepted risks |
| `docs/adr/` | Asking "why?" — one file per decision; `docs/adr/README.md` = index + **open decisions OD-01..OD-09** |
| `docs/NFR.md` | Writing tests/gates — measurable targets and how each is verified |
| `docs/COMPLIANCE.md` | Touching German invoicing/VAT/retention rules |
| `docs/THREAT_MODEL.md` | Touching input handling, the CSV writer, or storage |
| `docs/BRD.md` / `docs/PRD.md` | Questioning scope or behaviour (requirement and feature IDs) |
| `docs/COMMANDS.md` | Running tests or the module |
| `docs/RUNBOOK.md` | Operating the partners' script; error-code meanings; postmortems |
| `CHANGELOG.md` | "What changed, and in what state?" |
| `docs/keel-transcript.md` | Where an `[ASSUMPTION]` came from |
| `docs/README.md` | Full index and reading order |

## Hard invariants (rationale: `docs/ENGINEERING_DESIGN.md` §4)

No code or tests exist yet, so every row's gap is the same: the enforcing test is planned in Phase 1 (OD-04).

| # | Rule | Enforced by | Gap | Source |
|---|---|---|---|---|
| 1 | Money is integer cents; no float math, `toFixed` or `toLocaleString` on amounts | NFR-COR-003 source-scan test | test not written (Phase 1) | ENGINEERING_DESIGN N-01 |
| 2 | VAT: one half-up rounding on the net total; `net + vat = gross` | NFR-COR-001/002 tests | not written (Phase 1) | ADR-002 |
| 3 | Numbers/ids are generated only by the ledger, after validation, never reused or caller-supplied | NFR-COR-004, NFR-SEC-002/004 tests | not written (Phase 1) | ADR-003, ADR-006 |
| 4 | Issued invoices are never edited or deleted; void flips status only | no such API + NFR-SEC-003 test | not written (Phase 1) | N-04, N-06 |
| 5 | Validate every input before changing state; failures are `InvoiceError` with a closed `code` | NFR-SEC-001, NFR-MNT-001 tests | not written (Phase 1) | ADR-005, LLD §3 |
| 6 | CSV is byte-exact to ADR-008 and locale-independent | NFR-COR-006 tests | not written (Phase 2) | ADR-008 |
| 7 | Standard library only; zero dependencies | NFR-SEC-005 test | not written (Phase 1) | ADR-007 |

## Git & working workflow (mandatory — the build loop)

0. **Version control.** The folder is a git repo with no commits yet; make the docs the first commit before feature work.
1. **Two units of work.** A **Phase** runs its workflow script on `phase-N-<slug>` off `main`. A **Change** (`CHG-xxx`: hotfix, small fix) is `/keel change <slug>` → `chg/<slug>`, a Changes-table row and a CHANGELOG line. Never commit directly to `main`. New phases: `/keel phase new <slug>` (Phase 3 is unscoped).
2. **Run the phase script:** `claude --workflow .claude/workflows/phase-N-<slug>.js` (or the Workflow tool). It reserves ADR IDs, branches the phase branch, fans tasks out as parallel agents in separate `git worktree`s (each opens with `/goal`), merges them into the phase branch, then **Verify** writes `.keel/evidence/phase-N.json`. Only the phase branch merges to `main`. Exit strategy when stuck: IMPLEMENTATION_PLAN "Standing rules".
3. **Tests ship with the code** (`node:test`). Money, numbering, validation and export behaviour is proven by a test; "no test needed" is a stated judgement.
4. **Definition of done:** `node --test` green · no dependency added · touched NFR gates green · doc-sync commit present.
5. **Doc sync before the commit that completes any work.** Delegate to the **doc-sync** subagent (`.claude/agents/doc-sync.md`): it updates this file's status · IMPLEMENTATION_PLAN tables · `docs/adr/` · CHANGELOG `[Unreleased]` · touched docs, citing the evidence file, and returns a Report. Check the Report against `git log` / `git diff main --name-only` / the evidence file; send back specific gaps. **Cap: 3 rounds**, then record leftovers as Deferred items and proceed. `.claude/workflows/doc-sync.js` runs this loop and enforces byte budgets. A branch without the doc-sync commit is not done.
6. **Merge to `main`** only after gates pass and the doc-sync commit exists. A library has no deploy; deploy state is written in CHANGELOG only.
7. **Decisions captured without fail** as `docs/adr/ADR-xxx-<slug>.md` before merge (ID reserved at scope or taken at Integrate, never in a worktree). No addenda: one `Build deviation` row, else a superseding ADR. Incidents → RUNBOOK postmortems. Open questions → one row each in `docs/adr/README.md`.
8. **Claims carry evidence.** Nothing is `✅` without a level (`code-read` < `unit` < `integration` < `local-browser` < `staging` < `prod-live`) and an artefact.

No security or design reviewer is configured (declined at generation); security reasoning lives in THREAT_MODEL and the NFR-SEC gates.

## Delegation (callers supervise their subagents)

The agent doing the work is the **caller**; the doc-sync subagent works for it, returns a fixed `## Report` (role · caller · scope · status · changed · checked · findings · evidence · not verified · needs from caller), and never commits, pushes or messages anyone but its caller. The caller decides next steps and commits.

## Current status

| | What | Deploy state | Evidence |
|---|---|---|---|
| **Last completed** | Foundational docs generated (no code) | on-branch | `CHANGELOG.md` |
| **Now** | Phase 1 — resolve OD-04 (Phase 1 code absent from repo), then adopt and verify; Phase 2 CSV export next | — | — |

## Working agreements

- **Do not issue real invoices** with this module until Phase 3 storage exists (OD-07): a restart reuses `INV-<year>-0001`.
- Do not invent answers to open decisions OD-01..OD-09; implement the recommended default only when `docs/adr/README.md` says it is decided.
- Negative results are recorded ("confirmed not a bug" is a row, not silence).
- When this file and a referenced doc disagree, **the referenced doc wins** — fix the pointer, not the doc.

## Pre-PR checklist

- [ ] (1) no float arithmetic / `toFixed` / `toLocaleString` on money
- [ ] (2) VAT only via the one rounding function; `net + vat = gross`
- [ ] (3) ids/numbers generated by the ledger only, after validation
- [ ] (4) no API edits or deletes an issued invoice
- [ ] (5) inputs validated before state change; errors are `InvoiceError` with a known code
- [ ] (6) CSV byte-exact tests green (Phase 2+)
- [ ] (7) `package.json` has no dependencies
- [ ] tests ship with the code; new decision → `docs/adr/`; new punt → deferred items (owner + revisit trigger)
- [ ] `docs/COMMANDS.md` / `docs/RUNBOOK.md` updated if a command or procedure changed
- [ ] doc-sync Report reviewed; gaps fixed or (after 3 rounds) logged as deferred items
- [ ] doc-sync commit present; `node .keel/doc-size.mjs` passes (this file under 12 KB; split docs linked both ways)
