# inventory — AGENTS.md

inventory is the stock-keeping library for a small warehouse (Node.js 20+, standard library only, ES modules, in memory). Exact rules and exact error codes rank above convenience: stock errors cost money.

This file is deliberately light. The documents below are the source of truth. Area rules load by path: `.claude/rules/<area>.md` names the ADR or NFR to read before touching that code (agents without path loading open the file whose `paths:` match).

## Document map

| Read this | When you are |
|---|---|
| `docs/BRD.md` / `docs/PRD.md` | Questioning scope or behaviour — every rule has an ID and an error code |
| `docs/ENGINEERING_DESIGN.md` | Starting any work — non-negotiables NN-1..NN-6 |
| `docs/IMPLEMENTATION_PLAN.md` | Picking up work — current phase, scope, exit gates |
| `docs/LLD.md` | Writing code — module, validators, per-method steps |
| `docs/ARCHITECTURE.md` | Making structural choices |
| `docs/adr/` | Wondering "why?" — index plus Open decisions awaiting the founder |
| `docs/NFR.md` | Writing tests — targets and verification methods |
| `docs/COMMANDS.md` | Running anything |
| `CHANGELOG.md` | "What shipped?" |
| `docs/keel-transcript.md` | Checking where a requirement or `[ASSUMPTION]` came from |
| Stubs: `docs/HLD.md` · `DESIGN.md` · `DEPLOYMENT.md` · `RUNBOOK.md` · `FEEDBACK_ROUNDS.md` · `COMPLIANCE.md` · `THREAT_MODEL.md` · `CONTRACT_SPEC.md` · `almanac/README.md` *(not needed yet)* | Wondering whether one now applies — each says why not and when |

## Hard invariants (rationale: `docs/ENGINEERING_DESIGN.md` §3)

| # | Rule | Enforced by | Gap | Source |
|---|---|---|---|---|
| 1 | Every rule violation throws `InventoryError` with the specified `code` | `test/errors.test.js` (Phase 1) | Not built yet: Phase 1 | NN-1, ADR-002 |
| 2 | Every input is validated before state is read or changed | `test/input-safety.test.js` | Not built yet: Phase 1 | NN-2, ADR-003 |
| 3 | A failed call changes nothing (stock, reservations, movements, `seq`) | `test/atomicity.test.js` | Not built yet: Phase 1 | NN-3, ADR-003 |
| 4 | On hand ≥ reserved always; ship and reserve use available only | `test/reservation-property.test.js` | Not built yet: Phase 2 | NN-4 |
| 5 | State is per instance; returned values are copies; inputs not retained | `test/input-safety.test.js` | Not built yet: Phase 1 | NN-5 |
| 6 | No dependencies, no I/O, only `node:` imports | `test/maintainability.test.js` | Not built yet: Phase 1 | NN-6, ADR-001 |

## Git & working workflow (mandatory — the build loop)

0. **Git from commit one:** commit the generated docs before any feature work.
1. **Two units of work:** a Phase runs on `phase-N-<slug>` (`/keel phase new <slug>`); a Change on `chg/<slug>` (`/keel change <slug>`). Never commit to `main`.
2. **Run the phase script:** `claude --workflow .claude/workflows/phase-N-<slug>.js` (mechanics: `.claude/workflows/README.md`).
3. **Tests ship with the code;** every rule is proven by a test.
4. **Done per change:** `node --test` green · README examples and error table pass · doc-sync commit present.
5. **Doc sync before the completing commit:** inline when only status lines change, else delegate to doc-sync (`.claude/agents/doc-sync.md`; `doc-sync.js`, ≤3 rounds, then deferred items).
6. **Merge** only with gates green and the doc-sync commit present. Nothing is deployed (library).
7. **Decisions → `docs/adr/` before merge** (no addenda; open questions in `docs/adr/README.md`).
8. **Claims carry evidence:** no `✅` without a level (`code-read` < … < `prod-live`) and an artefact.

Rules and rationale: IMPLEMENTATION_PLAN "Standing rules". Delegation: `.claude/workflows/README.md`.

## Stops and end-of-run report

**Stop and ask** before: adding any dependency or non-`node:` import; changing an error code or the check order; resolving an Open decision in `docs/adr/README.md` by guessing; starting the next phase before the current one's gates are `✅`; or when two docs disagree on something the task depends on.
**End every run with four lines:** Blocked on me · Changed · Found · Could not confirm.

## Current status

| | What | Deploy state | Evidence |
|---|---|---|---|
| **Last completed** | Foundation docs generated (no phase built) | on-branch | `CHANGELOG.md` |
| **Now** | Phase 1 — Items and stock (not started) | — | — |

## Working agreements

- One phase per session; finish tests and README before the next phase (CON-004).
- Open `[ASSUMPTION]`s (BRD A-04..A-08) stay as built until the founder answers; then write the ADR.
- Negative results are recorded ("confirmed not a bug" is a row, not silence).
- When this file and a referenced doc disagree, **the referenced doc wins** — fix the pointer, not the doc.

## Pre-PR checklist

- [ ] (1) every new rule violation throws `InventoryError` with its specified code
- [ ] (2) every new argument is validated before state is touched
- [ ] (3) every new failing path leaves state and `seq` unchanged
- [ ] (4) ship/reserve use available quantity only
- [ ] (5) returned objects are copies; passed-in objects are not retained
- [ ] (6) no new dependency or non-`node:` import
- [ ] `docs/COMMANDS.md` updated if a command changed
