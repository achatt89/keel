# filestore — AGENTS.md

filestore is the in-memory metadata core of a small file-storage service for freelancers (Node.js 20+, standard library only, ES modules, `node:test`). **Correctness of limits and numbers outranks feature velocity: every limit, message and number must match the pricing page.**

This file is deliberately light. The documents below are the source of truth — read the relevant one *before* touching code.

## Document map

| Read this | When you are |
|---|---|
| `docs/ENGINEERING_DESIGN.md` | Starting any work — pillars, domain model, data classes, **non-negotiables** (NN-1..NN-11) |
| `docs/IMPLEMENTATION_PLAN.md` | Picking up work — phases, scope, exit gates, deferred items, Changes |
| `docs/LLD.md` | Writing code — module map, API contract, quota algorithm, validation rules |
| `docs/ARCHITECTURE.md` | Structural choices — components, trust boundary, controls, accepted risks |
| `docs/adr/` | Wondering "why?" — one file per decision; `README.md` = index + **open decisions** |
| `docs/NFR.md` | Writing tests/gates — targets and how each is verified |
| `docs/BRD.md` / `docs/PRD.md` | Questioning scope or behaviour — requirement IDs, acceptance criteria AC-1..AC-13 |
| `docs/COMMANDS.md` | Running anything |
| `CHANGELOG.md` | "What shipped, in what state?" |
| `docs/keel-transcript.md` | Disputing the intent of a requirement — the interview and every `[ASSUMPTION]`'s origin |
| `docs/README.md` | The docs index, reading order, deliberate omissions and their triggers |

## Hard invariants (full list + rationale: `docs/ENGINEERING_DESIGN.md` §6)

| # | Rule | Enforced by | Gap | Source |
|---|---|---|---|---|
| 1 | Limits live only in `plans.js`, decimal GB (1 GB = 10^9 B); `units.js` (binary) never feeds a limit | `test/plans.test.js` literals + `test/boundaries.test.js` | Phase 2: not built yet | NN-1, NN-9 · `ADR-003` |
| 2 | Write allowed iff `delta <= 0` or `used + delta <= limit`; limit is inclusive | `test/quota.test.js` (AC-1..AC-13) | Phase 2: not built yet | NN-2 · `ADR-004` |
| 3 | A refused write changes nothing; decide, then mutate | `test/quota.test.js` AC-13 | Phase 2: not built yet | NN-3 |
| 4 | Check order: unknown user → bad input → quota, in every method | `test/errors.test.js` matrix | Phase 1 part unverified (`OD-07`) | NN-4 · `ADR-002` |
| 5 | Never trust callers: ids are store-issued (own-key lookup only), paths confined (no `..`), sizes non-negative safe integers | `test/validation.test.js` | Unverified until Phase 1 code is in the repo (`OD-07`) | NN-7, NN-8 · `SEC-001..004` |
| 6 | `usedBytes` changes only in one internal function; equals Σ file sizes | `test/invariant.test.js` | Phase 2: not built yet | NN-5 · `ADR-006` (Proposed) |
| 7 | Percent is `floor` via BigInt, never rounded up | `test/usage.test.js` | Phase 2: not built yet | NN-6 · `ADR-005` |
| 8 | Standard library only; no dependencies | `test/boundaries.test.js` | Phase 2: not built yet | NN-10 · `ADR-001` |

## Git & working workflow (mandatory — the build loop)

0. **Version control.** The folder is a git repo with no commits yet; the generated docs are the first commit (the user commits — Keel did not).
1. **Two units of work.** A **Phase** runs its script on `phase-N-<slug>` off `main`. A **Change** (`CHG-xxx`: hotfix, small fix) is `/keel change <slug>` → `chg/<slug>` off `main`, a Changes row and a CHANGELOG line. Never commit directly to `main`. New phases: `/keel phase new <slug>`.
2. **Run the phase script:** `claude --workflow .claude/workflows/phase-N-<slug>.js` (Phase 2: `phase-2-storage-quotas.js`). It reserves ADR IDs, fans tasks out to parallel `git worktree`s (one per task, never shared), each opening with `/goal`; task branches merge into the phase branch only; Verify writes `.keel/evidence/phase-N.json`; only the phase branch (tasks + evidence + doc-sync commit) merges to `main`. Exit strategy: bounded retries (3), then escalate — see IMPLEMENTATION_PLAN "Standing rules".
3. **Tests with the code, never after.** Limits, boundaries, order and atomicity are *proven by a test*; "no test needed" is a stated judgement.
4. **Definition of done:** `node --test` green · `node --check src/*.js` clean · no dependency added · doc-sync commit present.
5. **Doc sync before the commit that completes any piece of work.** Delegate to the **doc-sync** subagent (`.claude/agents/doc-sync.md`): it updates this file's status table · IMPLEMENTATION_PLAN tables · `docs/adr/` · CHANGELOG `[Unreleased]` · any doc touched — citing the evidence file, never re-deriving it — and returns a Report. Check the Report against `git log`, `git diff main --name-only` and the evidence file; send gaps back. **Hard cap: 3 rounds**; then record each remaining gap as a Deferred items row and proceed. `.claude/workflows/doc-sync.js` runs this loop, then auto-archives/splits on a budget breach. Wording is state-neutral. No doc-sync commit = not done.
6. **Merge to `main`** only after gates pass and the doc-sync commit is present. There is no deploy before Phase 3; deploy state is authored only in `CHANGELOG.md` (and `DEPLOYMENT.md` once it exists).
7. **Decisions captured without fail.** Any decision → `docs/adr/ADR-xxx-<slug>.md` before merge (reserved at scope or taken at Integrate, never in a worktree). No addenda: one `Build deviation` row, else a superseding ADR. `[NEEDS DECISION]`/open questions are one row each in `docs/adr/README.md`.
8. **Claims carry evidence.** Nothing is `✅` without a level (`code-read` < `unit` < `integration` < `local-browser` < `staging` < `prod-live`) and an artefact. Overclaiming is a defect.

No security or design reviewer is set up (security-audit skill declined; no UI), so there is no "Review before done" step.

## Delegation (callers supervise their subagents)

The agent doing the work is the **caller**; its role subagent (doc-sync) works for it. The subagent returns a fixed `## Report` (role · caller · scope · status · changed · checked · findings · evidence · not verified · needs from caller) and never commits, pushes or messages anyone but its caller. The caller reads the Report, sends specific follow-up (max 3 rounds), and commits. A caller with its own supervisor reports upward as before.

## Current status

| | What | Deploy state | Evidence |
|---|---|---|---|
| **Last completed** | Docs suite generated (BRD…IMPLEMENTATION_PLAN, ADR-001..006); Phase 1 claimed built by the founder but **absent from this tree, unverified** | on-branch | CHANGELOG `[Unreleased]` |
| **Now** | Phase 2 — Storage quotas: scoped, not started (precondition: Phase 1 code in repo, `OD-07`) | — | — |

## Working agreements

- Never write a limit number outside `plans.js`; never import `units.js` into quota code.
- Anything unconfirmed is `[ASSUMPTION]` or an open decision (`docs/adr/README.md`); do not close one by guessing — ask the founder.
- Negative results are recorded ("confirmed not a bug" is a row, not silence).
- When this file and a referenced doc disagree, **the referenced doc wins** — fix the pointer, not the doc.

## Pre-PR checklist

- [ ] (1) no limit or GB literal outside `plans.js`; `units.js` not imported by quota code
- [ ] (2)(3) quota change keeps the delta rule, inclusive limit, decide-then-mutate; AC tests updated
- [ ] (4) check order unchanged in every method
- [ ] (5) every new input validated; no caller value used as a property key outside a `Map`
- [ ] (6)(7) `usedBytes` only via the one mutation function; percent via BigInt floor
- [ ] (8) no dependency added
- [ ] tests ship with the code; new decision → `docs/adr/`; new punt → deferred items (owner + revisit trigger)
- [ ] `docs/COMMANDS.md` updated if a command changed
- [ ] doc-sync Report reviewed; gaps fixed or (after 3 rounds) logged as deferred items
- [ ] doc-sync commit present; `node .keel/doc-size.mjs` passes (this file under 12 KB)
