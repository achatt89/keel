# shortlinks — AGENTS.md

shortlinks is a small URL-shortener HTTP service (Node.js 20+, `node:http` only, in-memory storage, JSON API). Exact conformance to the specified API — including the rate limit — ranks above features and polish.

This file is deliberately light. The documents below are the source of truth — read the relevant one *before* touching code.

## Document map

| Read this | When you are |
|---|---|
| `docs/PRD.md` | Writing or testing any endpoint — the full HTTP contract, validation order, rate-limit semantics, edge-case defaults |
| `docs/IMPLEMENTATION_PLAN.md` | Picking up work — current phase, scope, exit gates |
| `docs/ARCHITECTURE.md` | Making structural choices — components, data flow, controls, accepted risks |
| `docs/adr/` | Wondering "why is it like this?" — `README.md` is the index + open founder questions |
| `docs/BRD.md` | Questioning scope — requirements (`LNK/RDR/ABU/VAL/DLV`), constraints, risks |
| `docs/COMMANDS.md` | Running anything — run, test, curl, env vars |
| `CHANGELOG.md` | Asking "what shipped, in what state?" |
| `docs/README.md` | Orientation — docs index and reading order |
| `docs/keel-transcript.md` | Checking where an `[ASSUMPTION]` came from |

## Hard invariants

| # | Rule | Enforced by | Gap | Source |
|---|---|---|---|---|
| 1 | No npm dependencies; `src/` imports only `node:` modules or relative files | Phase 0 guardrail test (reads `package.json` and `src/`) | not built — Phase 0 | ADR-001 |
| 2 | Every error body is exactly `{"error":"<code>"}`, written only by `src/errors.js` | Phase 0 error-shape test + routing matrix | not built — Phase 0 | PRD §3, P-04 |
| 3 | `createServer(options)` returns a non-listening server; time is read only via `options.now` (default `Date.now`) | Phase 0 factory test; fake-clock tests (rate limit, `createdAt`) | not built — Phase 0/2 | CON-004, P-02, P-03 |
| 4 | Only absolute `http`/`https` URLs, ≤ 2048 chars, printable ASCII, are stored — one validator module | Phase 1 validator boundary tests | not built — Phase 1 | PRD §5, ADR-004 |
| 5 | A creation is rate-checked after validation and recorded in the same synchronous step as the store write (no `await` between) | Phase 2 rate-limit suite | not built — Phase 2 | ADR-002, ADR-004 |
| 6 | Client IP is the socket peer address; forwarded headers are never read; IPs are never logged | Phase 2 limiter tests; no-logging review | not built — Phase 2 | ADR-003 |

## Git & working workflow (mandatory — the build loop)

0. **Version control from commit one.** The folder is a git repo with no commits yet: commit the generated docs on `main` before any phase runs (phase scripts branch off `main`).
1. **Two units of work.** A **Phase** runs its workflow script on `phase-N-<slug>` off `main`. A **Change** (`CHG-xxx`: hotfix, small fix) is `/keel change <slug>` → `chg/<slug>`. Never commit directly to `main`. New phases: `/keel phase new <slug>`.
2. **Run the phase workflow script:** `claude --workflow .claude/workflows/phase-N-<slug>.js` (or the Workflow tool). It checks out the phase branch, fans out divisible tasks to parallel agents in separate `git worktree`s (one per task, never shared), each opening with `/goal`; task branches merge into the phase branch; **Verify** writes `.keel/evidence/phase-N.json`; only the phase branch (tasks + evidence + doc-sync commit) merges to `main`. Exit strategy when stuck: bounded retries (3), then escalate — see IMPLEMENTATION_PLAN "Standing rules".
3. **Write tests with the code, never after** (`node:test`). Spec behaviour is *proven by a test*.
4. **Definition of done:** `node --test` green · invariants 1–6 hold · doc-sync commit · `node .keel/doc-size.mjs` passes.
5. **Doc sync before the commit that completes any piece of work.** Delegate to the **doc-sync** subagent (`.claude/agents/doc-sync.md`): it updates this file's status · IMPLEMENTATION_PLAN tables · `docs/adr/` · CHANGELOG `[Unreleased]` · touched docs, citing the evidence file, and returns a Report. Check the Report against `git log` / `git diff main --name-only` / the evidence file; send gaps back as specific feedback. **Hard cap: 3 rounds**, then record leftovers as Deferred items rows and proceed. `.claude/workflows/doc-sync.js` runs this loop and the byte-budget check. State-neutral wording only.
6. **Merge to `main`** only after gates pass and the doc-sync commit exists. Deploy state (running on the team machine, post-run check) is written in `CHANGELOG.md` only.
7. **Decisions captured without fail:** any decision → `docs/adr/ADR-xxx-<slug>.md` before merge (number reserved at scope or taken at Integrate, never in a worktree). No addenda: one `Build deviation` row, else a superseding ADR. Open founder questions stay one row each in `docs/adr/README.md`.
8. **Claims carry evidence.** No `✅` without a level (`code-read` < `unit` < `integration` < `local-browser` < `staging` < `prod-live`) and an artefact. Here `integration` is the ceiling (no staging/prod). Overclaiming is a defect.

(No security/design reviewer roles: both skills declined; no UI.)

## Delegation (callers supervise their subagents)

The agent doing the work is the **caller**; the `doc-sync` subagent works for it. It returns a fixed **Report** (role · caller · scope · status · changed · checked · findings · evidence · not verified · needs from caller) and never commits, pushes, merges or messages anyone but its caller. The caller reads the Report, decides (accept / specific follow-up, max 3 rounds / escalate) and commits; upward reporting is unchanged.

## Current status

| | What | Deploy state | Evidence |
|---|---|---|---|
| **Last completed** | Documentation suite generated (no code) | on-branch | — |
| **Now** | Phase 0 — Skeleton & Guardrails (not started) | — | — |

## Working agreements

- Definition of done per change: see workflow step 4 (details: `docs/IMPLEMENTATION_PLAN.md`).
- Where the spec is silent, follow PRD §7 / the ADRs; do not invent. Anything new is an ADR or an Open decision.
- Negative results are recorded ("confirmed not a bug" is a row, not silence).
- When this file and a referenced doc disagree, **the referenced doc wins** — fix the pointer.

## Pre-PR checklist

- [ ] (1) no dependency added; no non-`node:` import in `src/`
- [ ] (2) no error body written outside `src/errors.js`
- [ ] (3) no `Date.now()`/`new Date()` in `src/` except the `options.now` default
- [ ] (4) URL/code validation only via `src/validate.js`
- [ ] (5) limiter check + record + store write in one synchronous step, after validation
- [ ] (6) no `X-Forwarded-For` use; no IP logging
- [ ] tests ship with the code; `node --test` green
- [ ] new decision → `docs/adr/`; new punt → deferred items (owner + revisit trigger)
- [ ] `docs/COMMANDS.md` / `README.md` updated if a command or env var changed
- [ ] doc-sync Report reviewed; gaps fixed or logged after 3 rounds
- [ ] doc-sync commit present; `node .keel/doc-size.mjs` passes (this file under 12 KB)
