# shortlinks — AGENTS.md

shortlinks is a small URL-shortener HTTP service (Node.js 20+, `node:http` only, in-memory storage). Every endpoint must behave exactly as specified in `docs/PRD.md`, rate limit included.

This file is deliberately light. The documents below are the source of truth. Area rules load by path: `.claude/rules/service.md` names the ADR to read before touching `src/` or `test/` (agents without path loading open the file whose `paths:` match).

## Document map

| Read this | When you are |
|---|---|
| `docs/PRD.md` | Building anything — the endpoint contract, every status and error code, each `[ASSUMPTION]` |
| `docs/IMPLEMENTATION_PLAN.md` | Picking up work — current phase, scope, exit gates |
| `docs/ARCHITECTURE.md` | Making structural choices — components, module contracts, data model, controls, accepted risks |
| `docs/adr/` | Wondering "why is it like this?" — one file per decision; `docs/adr/README.md` is the index + open questions |
| `docs/BRD.md` | Questioning scope — objectives, requirement IDs, constraints, risks |
| `docs/COMMANDS.md` | Running anything — run/test commands, env vars |
| `CHANGELOG.md` | Asking "what shipped, and is it live?" |
| `docs/keel-transcript.md` | Disputing intent — the interview and the source of every `[ASSUMPTION]` |
| `docs/README.md` | Finding a doc — index and reading order |

## Hard invariants (rationale: `docs/ARCHITECTURE.md` §1, §6)

| # | Rule | Enforced by | Gap | Source |
|---|---|---|---|---|
| 1 | Standard library only: no npm dependency, no framework | review of `package.json` (none expected) | no automated check yet | ADR-001 |
| 2 | `createServer(options)` returns a server that is not listening; `options.now` defaults to `Date.now` and is the only clock | tests construct servers without listening | — | ADR-001, ARCH P-02/P-03 |
| 3 | Only `http`/`https` URLs of ≤2048 chars are stored; every input is validated before state changes | validation tests | — | PRD §3.1 |
| 4 | Every error body is exactly `{"error":"<code>"}` via `src/errors.js` | envelope tests | — | PRD §3.8 |
| 5 | At most 5 creates per client IP per rolling 60 s; `X-Forwarded-For` ignored | limiter tests with a fake clock | not built until Phase 1 | ADR-003 |
| 6 | State is per-server `Map`s, never plain objects keyed by user input | store tests (`__proto__` code) | — | ADR-002 |

## Git & working workflow (mandatory — the build loop)

0. **Git from commit one:** the repo is initialised; commit the generated docs before any feature work.
1. **Two units of work:** a Phase runs on `phase-N-<slug>`; a Change on `chg/<slug>` (`/keel change <slug>`). Never commit to `main`.
2. **Run the phase script:** `claude --workflow .claude/workflows/phase-N-<slug>.js` (mechanics: `.claude/workflows/README.md`).
3. **Tests ship with the code** (`node --test`); each PRD §3 behaviour is proven by a test.
4. **Done per change:** `node --test` green, no dependency added, doc-sync commit present.
5. **Doc sync before the completing commit:** inline when only status lines change, else delegate to doc-sync (`.claude/agents/doc-sync.md`; `doc-sync.js`, ≤3 rounds, then deferred items).
6. **Merge** only with gates green and the doc-sync commit present. No deploy pipeline exists (`node src/main.js` on a dev box or VM); deploy state stays `merged`.
7. **Decisions → `docs/adr/` before merge** (no addenda; open questions in `docs/adr/README.md`).
8. **Claims carry evidence:** no `✅` without a level (`code-read` < … < `prod-live`) and an artefact.
9. **Review before done:** no security or design reviewer is installed; do a `code-read` pass against `.claude/rules/service.md`.

Rules and rationale: IMPLEMENTATION_PLAN "Standing rules". Delegation: `.claude/workflows/README.md`.

## Stops and end-of-run report

**Stop and ask** before: adding any dependency · adding persistence · changing a status/error code or a default marked `[ASSUMPTION]` · or when two docs disagree on something the task depends on.

**End every run with four lines:** Blocked on me · Changed · Found · Could not confirm.

## Current status

| | What | Deploy state | Evidence |
|---|---|---|---|
| **Last completed** | Docs generated (no code) | on-branch | `CHANGELOG.md` [Unreleased] |
| **Now** | Phase 0 — Core API (not started) | — | — |

## Working agreements

- Definition of done per change: see Git workflow step 4 (details: `docs/IMPLEMENTATION_PLAN.md`).
- New decisions become `docs/adr/` entries; new accepted risks go to `docs/ARCHITECTURE.md` §7.
- Negative results are recorded ("confirmed not a bug" is a row, not silence).
- When this file and a referenced doc disagree, **the referenced doc wins** — fix the pointer, not the doc.

## Pre-PR checklist

- [ ] (1) no dependency added
- [ ] (2) `createServer` still does not listen; no direct `Date.now()` outside the default
- [ ] (3) new input is validated before it touches state
- [ ] (4) errors go through `src/errors.js`
- [ ] (5) rate-limit tests still pass
- [ ] `docs/COMMANDS.md` updated if a command or env var changed
