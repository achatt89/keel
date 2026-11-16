# booking — AGENTS.md

booking is a meeting-room booking library (Node.js 20+, standard library only, pure in-memory, no I/O). Correctness first: no room or person is ever double-booked, and every rule holds exactly as specified.

This file is deliberately light. The documents below are the source of truth. Area rules load by path: `.claude/rules/<area>.md` names the ADR or requirement to read before touching that code (agents without path loading open the file whose `paths:` match).

## Document map

| Read this | When you are |
|---|---|
| `docs/PRD.md` | Implementing anything — the public contract (§2) and the behaviour table, one row per test (§3) |
| `docs/BRD.md` | Questioning scope — objectives, constraints `CON-xxx`, requirements, assumptions `A-xx`, risks |
| `docs/ARCHITECTURE.md` | Making structural choices — components, data model, principles |
| `docs/adr/` | Wondering "why is it like this?" — `docs/adr/README.md` is the index + open decisions |
| `docs/IMPLEMENTATION_PLAN.md` | Picking up work — current phase, scope, exit gates |
| `README.md` *(written in Phase 2)* | Using the library or running the tests |
| `CHANGELOG.md` | Asking "what shipped, and is it on `main`?" |
| `docs/keel-transcript.md` | Asking where an `[ASSUMPTION]` came from |
| `docs/README.md` | The full doc index |

## Hard invariants

| # | Rule | Enforced by | Gap | Source |
|---|---|---|---|---|
| 1 | No two bookings overlap in a room, and none overlap for one person; times are half-open | `book` check order + conflict tests | not built yet (Phase 1) | ADR-003, ADR-005 |
| 2 | Failed `book` changes nothing; callers never hold live records | validate-then-write + atomicity tests | not built yet (Phase 1) | ADR-005 |
| 3 | Standard library only; no I/O, clock or environment randomness in `src/` | `package.json` has no dependencies; review | code-read only (Phase 0 gate); no automated scan | CON-002, CON-003 |
| 4 | Times are parsed only by `src/time.js` (strict, no `Date` rollover) | single parser + time tests | not built yet (Phase 0) | ADR-002 |
| 5 | Ids are minted internally; a caller-supplied id is only a lookup key | `Map` lookup + cancel tests | not built yet (Phase 1) | ADR-004 |
| 6 | Only `BookingError` with a documented `code` is thrown for a rule break | API test over every rule | not built yet (Phase 0–2) | BRD §3 |

## Git & working workflow (mandatory — the build loop)

0. **Git from commit one:** commit the generated docs on `main` before any feature work.
1. **Two units of work:** a Phase runs on `phase-N-<slug>` (`/keel phase new <slug>`); a Change on `chg/<slug>` (`/keel change <slug>`). Never commit to `main`.
2. **Run the phase script:** `claude --workflow .claude/workflows/phase-N-<slug>.js` (mechanics: `.claude/workflows/README.md`).
3. **Tests ship with the code;** every PRD §3 row is proven by a `node --test` test.
4. **Done per change:** `node --test` green, no dependencies added, doc-sync commit present.
5. **Doc sync before the completing commit:** inline when only status lines change, else delegate to doc-sync (`.claude/agents/doc-sync.md`; `doc-sync.js`, ≤3 rounds, then deferred items).
6. **Merge** only with gates green and the doc-sync commit present. There is no deployment.
7. **Decisions → `docs/adr/` before merge** (no addenda; open questions in `docs/adr/README.md`).
8. **Claims carry evidence:** no `✅` without a level (`code-read` < `unit` < … < `prod-live`) and an artefact.

Rules and rationale: IMPLEMENTATION_PLAN "Standing rules". Delegation: `.claude/workflows/README.md`. No security or design reviewer (declined / no UI).

## Stops and end-of-run report

**Stop and ask** before: adding any dependency or file/network/clock use; changing an error code, the check order or the time format; or when two docs disagree on something the task depends on.
**End every run with four lines:** Blocked on me · Changed · Found · Could not confirm.

## Current status

| | What | Deploy state | Evidence |
|---|---|---|---|
| **Last completed** | Documentation suite generated | on-branch | CHANGELOG `[Unreleased]` |
| **Now** | Phase 0 — Foundations & validation (not started) | — | — |

## Working agreements

- Open founder questions: `docs/adr/README.md` OD-01, OD-02 (defaults assumed, marked `[ASSUMPTION]`).
- New decisions become `docs/adr/` entries; new accepted risks go to `docs/ARCHITECTURE.md` §5.
- Negative results are recorded ("confirmed not a bug" is a row, not silence).
- When this file and a referenced doc disagree, **the referenced doc wins** — fix the pointer, not the doc.

## Pre-PR checklist

- [ ] (1) conflict checks run before every state write
- [ ] (2) `book` mutates only after all checks pass; nothing returned is a live record
- [ ] (3) no `require` outside `node:` builtins/local files; no I/O
- [ ] (4) no `new Date(string)` / `Date.parse` on caller input
- [ ] (5) no caller id used as anything but a `Map` key
- [ ] (6) only `BookingError` (documented `code`) thrown for rule breaks
