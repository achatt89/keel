# booking — AGENTS.md

booking is a meeting-room booking library (Node.js 20+, standard library only, pure in-memory, no I/O). Rule exactness and "no double booking, ever" rank above convenience or features.

This file is deliberately light. The documents below are the source of truth — read the relevant one *before* touching code.

## Document map

| Read this | When you are |
|---|---|
| `docs/BRD.md` | Questioning scope or behaviour — requirement IDs (BKG/QRY/PKG/SEC), constraints, `[ASSUMPTION]`s (§8), risks |
| `docs/ARCHITECTURE.md` | Writing code — module shape, public contract, the `book` check order, invariants I-1…I-4, security controls |
| `docs/adr/` | Wondering "why is it like this?" — one file per decision; `docs/adr/README.md` is the index + open questions |
| `docs/IMPLEMENTATION_PLAN.md` | Picking up work — phases 0–2, scope, exit gates, Changes, deferred items |
| `docs/COMMANDS.md` | Running anything — `node --test`, doc tooling |
| `CHANGELOG.md` | Asking "what shipped?" — every change with its state tag |
| `docs/keel-transcript.md` | Tracing where a decision or `[ASSUMPTION]` came from |
| `docs/README.md` | A map of everything in `docs/` |

## Hard invariants (rationale: `docs/ARCHITECTURE.md` §1, §6, §7)

Nothing is built yet, so every "Gap" is open until its phase closes.

| # | Rule | Enforced by | Gap | Source |
|---|---|---|---|---|
| 1 | No two live bookings overlap in a room, nor for one person (half-open intervals) | single `commit` path after checks; property test over random `book`/`cancel` | not built — Phase 1 (logic), Phase 2 (property test) | ARCHITECTURE §6 I-1 |
| 2 | Every public input is validated before use; each caller property is read once; bad input throws only `BookingError` | typeof checks + hostile-input test matrix | not built — Phase 1 | ARCHITECTURE §7, SEC-001 |
| 3 | Errors are `BookingError` with `code` ∈ the 7 specified names, in the fixed check order (overlap before person_busy) | one pipeline function; precedence tests | not built — Phase 1 | ADR-003 |
| 4 | A rejected `book`/`cancel` changes nothing; returned objects are copies | no writes before last check; mutation test | not built — Phases 1–2 | ARCHITECTURE §6 I-2, P-05 |
| 5 | Ids are library-generated (`randomUUID`), looked up in a `Map` after a `typeof` check; never trusted | ADR-004; hostile-id tests | not built — Phase 1 | ADR-004, SEC-002 |
| 6 | Standard library only; no I/O; `package.json` has no dependencies | test asserting no deps; Verify checks `require`s | not built — Phase 0 | BRD CON-001..003 |

## Git & working workflow (mandatory — the build loop)

0. **Version control from commit one.** The folder is a git repo; commit the generated docs first, before any feature work.
1. **Two units of work.** A **Phase** runs its workflow script on `phase-N-<slug>` off `main`. A **Change** (`CHG-xxx`) is `/keel change <slug>` → `chg/<slug>` off `main`, a Changes-table row and a CHANGELOG line. Never commit directly to `main`. New phases: `/keel phase new <slug>`.
2. **Run the phase workflow script:** `claude --workflow .claude/workflows/phase-N-<slug>.js` (or the Workflow tool). It checks out the phase branch, fans out divisible tasks as parallel agents in separate `git worktree`s, each opening with `/goal`; task branches merge into the phase branch, never straight to `main`. **Verify** then writes `.keel/evidence/phase-N.json`; only the phase branch (tasks + evidence + doc-sync commit) merges to `main`. Exit strategy when stuck: IMPLEMENTATION_PLAN "Standing rules".
3. **Write tests with the code, never after** (`node:test`). The no-double-booking property and every error code are *proven by a test*.
4. **Definition of done:** `node --test` green on Node ≥ 20 · no dependencies in `package.json` · doc-sync commit present.
5. **Doc sync before the commit that completes any piece of work.** Delegate to the **doc-sync** role (`doc-sync` subagent, `.claude/agents/doc-sync.md`): it updates this file's status table · IMPLEMENTATION_PLAN tables · `docs/adr/` · CHANGELOG `[Unreleased]` · any doc the work touched — citing the evidence file, never re-deriving it — and returns a Report. Check the Report against `git log` and `git diff main --name-only`; send gaps back as specific feedback. **Hard cap: 3 rounds**, then record remaining gaps as Deferred items rows and proceed. Then commit. `.claude/workflows/doc-sync.js` runs this loop, auto-archives if a doc breaches its budget, and prunes old evidence. A branch without the doc-sync commit is not done.
6. **Merge to `main`** only after gates pass and the doc-sync commit is present. There is no deploy: state stops at `[merged]` (BRD A-14).
7. **Decisions captured without fail.** Any decision (even "X over Y because Z") becomes `docs/adr/ADR-xxx-<slug>.md` before merge (ID taken at Integrate, never in a worktree). No addenda: one `Build deviation` row, else a superseding ADR. Open questions are one row each in `docs/adr/README.md`.
8. **Claims carry evidence.** Nothing is `✅` without an evidence level (`code-read` < `unit` < `integration` < `local-browser` < `staging` < `prod-live`) and an artefact. Overclaiming is a defect.

(No security or design reviewer is set up — both skills were declined; `/keel upgrade` re-offers the security skill.)

## Delegation (callers supervise their subagents)

The agent doing a piece of work is the **caller**; the doc-sync subagent works for it. It returns a **Report** (fixed format in `.claude/agents/doc-sync.md`), never commits, pushes or merges, and messages only its caller. The caller reads the Report, decides (accept / specific follow-up, max 3 rounds / escalate) and commits. If the caller has its own supervisor, that relationship is unchanged.

## Current status

| | What | Deploy state | Evidence |
|---|---|---|---|
| **Last completed** | Foundational docs generated (BRD, ARCHITECTURE, ADR-001..004, plan, workflows) | on-branch | `CHANGELOG.md` |
| **Now** | Phase 0 — Foundation & time primitives (not started) | — | — |

## Working agreements

- Definition of done per change: see workflow step 4 (details: `docs/IMPLEMENTATION_PLAN.md`).
- New decisions become `docs/adr/` entries; new accepted risks go to `docs/ARCHITECTURE.md` §8.
- Never add a public method, a dependency, or any I/O without a founder decision (BRD CON-001..003, CON-005).
- Negative results are recorded ("confirmed not a bug" is a row, not silence).
- When this file and a referenced doc disagree, **the referenced doc wins** — fix the pointer, not the doc.

## Pre-PR checklist

- [ ] (1) no path accepts a booking that overlaps in room or for a person; property test still green
- [ ] (2) every new input is typeof-checked and read once; hostile matrix still throws only `BookingError`
- [ ] (3) check order and codes unchanged unless ADR-003 was superseded
- [ ] (4) failures leave state untouched; nothing returns internal references
- [ ] (5) ids only from `randomUUID`, looked up via `Map` after a string check
- [ ] (6) no dependency, I/O or non-`node:` import added
- [ ] tests ship with the code; new decision → `docs/adr/`; new punt → deferred items (owner + revisit trigger)
- [ ] `docs/COMMANDS.md` updated if a command changed
- [ ] doc-sync Report reviewed against the work; gaps fixed or (after 3 rounds) logged as deferred items
- [ ] doc-sync commit present; `node .keel/doc-size.mjs` passes (this file under 12 KB)
