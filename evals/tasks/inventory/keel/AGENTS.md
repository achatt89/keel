# inventory — AGENTS.md

inventory is the stock-keeping library for a small warehouse (Node.js 20+, standard library only, ES modules, in memory, `node:test`). Every rule holds exactly as specified, with the stated `InventoryError` codes: stock errors cost money.

This file is deliberately light. The documents below are the source of truth — read the relevant one *before* touching code.

## Document map

| Read this | When you are |
|---|---|
| `docs/ENGINEERING_DESIGN.md` | Starting any work — pillars, domain model, **non-negotiables** |
| `docs/IMPLEMENTATION_PLAN.md` | Picking up work — current phase, scope, exit gates |
| `docs/LLD.md` | Writing code — API, check order, error codes per method, semantics |
| `docs/ARCHITECTURE.md` | Structural choices — components, state, controls by threat, accepted risks |
| `docs/adr/` | Asking "why?" — one file per decision; `docs/adr/README.md` is index + **open decisions** |
| `docs/NFR.md` | Writing tests — correctness, input-handling and build targets with verification |
| `docs/BRD.md` / `docs/PRD.md` | Questioning scope or behaviour — requirement IDs, features, journeys |
| `docs/COMMANDS.md` | Running anything |
| `CHANGELOG.md` | Asking "what changed, in what state?" |
| `docs/keel-transcript.md` | Finding the provenance of an `[ASSUMPTION]` |
| `docs/README.md` | Reading order and doc index |

## Hard invariants (rationale: `docs/ENGINEERING_DESIGN.md` §4)

| # | Rule | Enforced by | Gap | Source |
|---|---|---|---|---|
| 1 | Every input validated before any state change; callers' ids, arrays, objects, numbers are never trusted | Validators + table-driven bad-input tests (NFR-SEC-001) | Not built — Phase 1 | ENGINEERING_DESIGN NN-1 |
| 2 | Validate-then-commit: a failed call changes nothing and consumes no `seq` | Snapshot-before/after tests (NFR-COR-002) | Not built — Phase 1 | ADR-003 |
| 3 | Only `InventoryError` with a spec-named `code`; tests assert `code`, not message | `error.code` assertions (NFR-TST-002) | Not built — Phase 1 | ADR-002 |
| 4 | `ship` and `reserve` use the **available** quantity; reserved stock is never shipped twice | Invariant `0 ≤ reserved ≤ onHand` random test (NFR-COR-001/003) | Not built — Phase 2 | RSV-006, ADR-004 |
| 5 | Copy at every boundary; no internal object is handed out | Mutation-after-call tests (NFR-SEC-003) | Not built — Phase 1 | ADR-005 |
| 6 | Stdlib only, ESM, `node:` imports only, no I/O | `test/build.test.js` (NFR-BLD-001/002) | Not built — Phase 1 | ADR-001 |
| 7 | One gapless `seq` per inventory | Seq tests (NFR-COR-004) | Not built — Phase 3 | ADR-006 |

## Git & working workflow (mandatory — the build loop)

0. **Version control from commit one.** The folder is a git repo; the generated docs are the first commit (the user commits; Claude commits only when asked).
1. **Two units of work.** A **Phase** runs its workflow script on `phase-N-<slug>` off `main`. A **Change** (`CHG-xxx`) is `/keel change <slug>` → `chg/<slug>`. Never commit directly to `main`. New phases: `/keel phase new <slug>`.
2. **Run the phase script:** `claude --workflow .claude/workflows/phase-N-<slug>.js`. One phase per session, in order 1 → 2 → 3; a phase is finished (tests, README, doc-sync) before the next starts. Task agents open with `/goal`; stuck policy is in IMPLEMENTATION_PLAN "Standing rules". Verify writes `.keel/evidence/phase-N.json`.
3. **Write tests with the code, never after.** `node --test`; assert `error.code`.
4. **Definition of done:** `node --test` green · in-scope requirement IDs named by tests · README matches the API · no dependency added.
5. **Doc sync before the completing commit.** Delegate to the **doc-sync** subagent (`.claude/agents/doc-sync.md`): it updates this file's status, IMPLEMENTATION_PLAN tables, `docs/adr/`, CHANGELOG `[Unreleased]` and touched docs, citing the evidence file, and returns a Report. Check the Report against `git log` / `git diff main --name-only` / the evidence file; send gaps back. **Cap: 3 rounds**, then record leftovers as Deferred items. Then commit. `.claude/workflows/doc-sync.js` runs this loop.
6. **Merge to `main`** only after gates pass and the doc-sync commit is present. No deployment exists; state stops at `merged` (CHANGELOG).
7. **Decisions captured without fail.** Any decision becomes `docs/adr/ADR-xxx-<slug>.md` before merge. No addenda: one `Build deviation` row, else a superseding ADR. Spec gaps stay `[ASSUMPTION]` + an Open decision row — never silently resolved.
8. **Claims carry evidence.** Nothing is `✅` without an evidence level (`code-read` < `unit` < `integration` < `local-browser` < `staging` < `prod-live`) and an artefact.

## Delegation (callers supervise their subagents)

The agent doing the work is the **caller**; doc-sync works for it. A subagent returns a fixed **Report** (role · caller · scope · status · changed · checked · findings · evidence · not verified · needs from caller), never commits, pushes or messages anyone but its caller. The caller reads it, decides the next step (max 3 doc-sync rounds), and commits. If the caller has a supervisor, it reports upward as before.

## Current status

| | What | Deploy state | Evidence |
|---|---|---|---|
| **Last completed** | Foundation docs generated (no phase built) | on-branch | `CHANGELOG.md` |
| **Now** | Phase 1 — Items and stock (not started) | — | — |

## Working agreements

- Definition of done per change: see step 4 and IMPLEMENTATION_PLAN "Standing rules".
- Phase 1 creates `package.json`, `src/inventory.js`, `test/`, `README.md`; do not add them earlier or add dependencies ever (CON-001).
- New decisions → `docs/adr/`; new punts → Deferred items with owner and revisit trigger.
- Negative results are recorded ("confirmed not a bug" is a row, not silence).
- When this file and a referenced doc disagree, **the referenced doc wins** — fix the pointer.

## Pre-PR checklist

- [ ] (1) every input validated before state changes
- [ ] (2) failed calls change nothing and consume no `seq`
- [ ] (3) errors are `InventoryError` with the spec `code`, asserted by `code`
- [ ] (4) `ship`/`reserve` use available quantity (Phase 2+)
- [ ] (5) inputs snapshotted, outputs are copies
- [ ] (6) no dependency, only `node:` imports
- [ ] (7) `seq` gapless (Phase 3)
- [ ] tests ship with the code; README matches the API and says how to run tests
- [ ] new decision → `docs/adr/`; new punt → Deferred items
- [ ] `docs/COMMANDS.md` updated if a command changed
- [ ] doc-sync Report reviewed; gaps fixed or logged as Deferred items after 3 rounds
- [ ] doc-sync commit present; `node .keel/doc-size.mjs` passes
