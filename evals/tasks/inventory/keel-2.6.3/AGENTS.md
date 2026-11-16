# inventory — AGENTS.md

inventory is the stock-keeping library for a small warehouse (Node.js 20+, stdlib only, in-memory, ES modules). Exact rules and error codes rank above everything else.

This file is deliberately light; the documents below are the source of truth. Area rules load by path: `.claude/rules/inventory-core.md` names the ADR or NFR to read before touching `src/` or `test/`.

## Document map

| Read this | When you are |
|---|---|
| `docs/ENGINEERING_DESIGN.md` | Starting any work — pillars, domain model, **non-negotiables** |
| `docs/IMPLEMENTATION_PLAN.md` | Picking up work — current phase, scope, exit gates |
| `docs/LLD.md` | Writing code — signatures, validation order, error codes |
| `docs/ARCHITECTURE.md` | Making structural choices — components, input-trust controls |
| `docs/adr/` | Asking "why is it like this?" — index + open decisions (`README.md`) |
| `docs/NFR.md` | Writing tests — targets and verification methods |
| `docs/BRD.md` / `docs/PRD.md` | Questioning scope or behaviour — requirement IDs, features, assumptions |
| `docs/COMMANDS.md` | Running anything |
| `CHANGELOG.md` | What shipped, in what state |
| Stubs: `docs/HLD.md` · `DESIGN.md` · `DEPLOYMENT.md` · `RUNBOOK.md` · `FEEDBACK_ROUNDS.md` · `COMPLIANCE.md` · `THREAT_MODEL.md` · `CONTRACT_SPEC.md` · `almanac/README.md` *(not needed yet)* | Wondering whether one now applies — each states its trigger |
| `docs/keel-transcript.md` · `docs/README.md` | Intent behind a requirement · the docs index |

## Hard invariants (rationale: ENGINEERING_DESIGN §4)

| # | Rule | Enforced by | Gap | Source |
|---|---|---|---|---|
| 1 | `0 ≤ reserved ≤ onHand`; reserved stock is never shipped | `test/invariant.test.js` | not built yet (Phase 2) | NN-1, ADR-003 |
| 2 | Every failure is an `InventoryError` with a LLD §5 `code` | per-row tests | not built yet (Phase 1) | NN-2, ADR-002 |
| 3 | A failed call mutates nothing and consumes no `seq` | `test/atomicity.test.js` | not built yet (Phase 1) | NN-3 |
| 4 | Stock decreases only via the one internal helper | code structure + invariant test | not built yet (Phase 2) | NN-4 |
| 5 | Inputs validated; `Map` storage; copy in/out | `test/hostile-input.test.js`, `test/aliasing.test.js` | not built yet (Phase 1–2) | NN-5, NN-7 |
| 6 | No dependencies, no I/O | `test/package.test.js` | not built yet (Phase 1) | NN-6 |

## Git & working workflow (mandatory)

0. **Git from commit one:** commit the generated docs before feature work.
1. **Two units of work:** a Phase on `phase-N-<slug>` (`/keel phase new <slug>`); a Change on `chg/<slug>` (`/keel change <slug>`). Never commit to `main`.
2. **Run the phase script:** `claude --workflow .claude/workflows/phase-N-<slug>.js` (mechanics: `.claude/workflows/README.md`).
3. **Tests ship with the code;** every rule is proven by a test of its exact `code`.
4. **Done per change:** `node --test` green, no dependency added, `node .keel/doc-size.mjs` clean.
5. **Doc sync before the completing commit:** inline when only status lines change, else delegate to doc-sync (`.claude/agents/doc-sync.md`; `doc-sync.js`, ≤3 rounds, then deferred items).
6. **Merge** only with gates green and the doc-sync commit present; there is no deploy.
7. **Decisions → `docs/adr/` before merge** (no addenda; open questions in `docs/adr/README.md`).
8. **Claims carry evidence:** no `✅` without a level (`code-read` < … < `prod-live`) and an artefact.

Rules and rationale: IMPLEMENTATION_PLAN "Standing rules". Delegation: `.claude/workflows/README.md`.

## Stops and end-of-run report

**Stop and ask** before: adding any dependency · changing a public signature or error code · resolving an open decision (OD-xx) · adding persistence or I/O; or when two docs disagree on something the task depends on.
**End every run with four lines:** Blocked on me · Changed · Found · Could not confirm.

## Current status

| | What | Deploy state | Evidence |
|---|---|---|---|
| **Last completed** | Documentation suite generated | on-branch | CHANGELOG `[Unreleased]` |
| **Now** | Phase 1 — Items and stock (not started) | — | — |

## Working agreements

- Definition of done per change: tests green, docs synced (IMPLEMENTATION_PLAN "Standing rules").
- One phase per session; finish tests and README before the next phase starts.
- README statements are under test (`examples/`, error table with `keel:asserts`).
- Negative results are recorded ("confirmed not a bug" is a row, not silence).
- When this file and a referenced doc disagree, **the referenced doc wins**.

## Pre-PR checklist

- [ ] (1) invariant `0 ≤ reserved ≤ onHand` still tested; nothing ships reserved stock
- [ ] (2) every new failure path throws `InventoryError` with a documented code
- [ ] (3) every new failure path leaves state and `seq` untouched
- [ ] (4) stock decreases go through the one helper
- [ ] (5) new inputs validated; no plain-object keyed by caller ids; copies in/out
- [ ] (6) `package.json` has no dependencies
- [ ] `docs/COMMANDS.md` updated if a command changed
