# inventory — AGENTS.md

inventory is the stock-keeping library for a small warehouse (Node.js 20+, standard library only, ES modules, pure in-memory). Stock errors cost money: correctness outranks convenience.

This file is deliberately light. The documents below are the source of truth. Area rules load by path: `.claude/rules/<area>.md` names the ADR or NFR to read before touching that code (agents without path loading open the file whose `paths:` match).

## Document map

| Read this | When you are |
|---|---|
| `docs/ENGINEERING_DESIGN.md` | Starting any work — pillars, domain model, **non-negotiables** N-1..N-6 |
| `docs/IMPLEMENTATION_PLAN.md` | Picking up work — the three phases, scope, exit gates, standing rules |
| `docs/LLD.md` | Writing code — API, types, **error codes and validation order**, movements |
| `docs/ARCHITECTURE.md` | Making structural choices — state, trust boundary, accepted risks |
| `docs/adr/README.md` | Wondering "why is it like this?" — ADR-001..005 and the open decisions OD-01..OD-04 |
| `docs/NFR.md` | Writing tests/gates — correctness, input-trust and doc targets with verification |
| `docs/BRD.md` / `docs/PRD.md` | Questioning scope or behaviour — requirement IDs (ITM, RSV, HST, ROP, GEN, SEC, DOC), features F-xx |
| `docs/COMMANDS.md` | Running anything — `npm test` etc. |
| `CHANGELOG.md` | Asking "what shipped, and is it live?" |
| `docs/keel-transcript.md` | Disputing the intent of a requirement or an `[ASSUMPTION]` |
| Stubs: `docs/HLD.md` · `docs/DESIGN.md` · `docs/DEPLOYMENT.md` · `docs/RUNBOOK.md` · `docs/FEEDBACK_ROUNDS.md` · `docs/COMPLIANCE.md` · `docs/THREAT_MODEL.md` · `docs/CONTRACT_SPEC.md` · `almanac/README.md` *(not needed yet)* | Wondering whether one now applies — each says why not yet and when to write it in full |

## Hard invariants (full list + rationale: `docs/ENGINEERING_DESIGN.md` §4)

| # | Rule | Enforced by | Gap | Source |
|---|---|---|---|---|
| 1 | on hand ≥ 0 and reserved ≤ on hand after every call; reserved stock is never shipped | invariant test (NFR-COR-002) | not built yet — Phases 1–2 | ENGINEERING_DESIGN §4 N-1, N-2 |
| 2 | A throwing call leaves no trace (no stock, reservation, movement or `seq` change) | before/after snapshot tests (NFR-COR-003) | not built yet — Phases 1–3 | ADR-005 |
| 3 | Every broken rule throws `InventoryError` with the stated `code`, in the LLD §4 order | `test/errors.test.js` (NFR-COR-001) | not built yet — Phases 1–3 | LLD §4, ADR-002 |
| 4 | Caller data is validated, never aliased; hostile ids are inert | aliasing + hostile-id tests (NFR-SEC-001/002) | not built yet — Phase 1 | ADR-002 |
| 5 | Standard library only; no dependencies | `package.json` gate (NFR-MNT-001) | not built yet — Phase 1 | CON-002 |
| 6 | README examples and error table are under test | `test/examples.test.js` (NFR-DOC-001) | not built yet — Phase 1 | conventions "Docs under test" |

## Git & working workflow (mandatory — the build loop)

0. **Git from commit one:** commit the generated docs before any feature work.
1. **Two units of work:** a Phase runs on `phase-N-<slug>` (`/keel phase new <slug>`); a Change on `chg/<slug>` (`/keel change <slug>`). Never commit to `main`.
2. **Run the phase script:** `claude --workflow .claude/workflows/phase-N-<slug>.js` (mechanics: `.claude/workflows/README.md`). Phases 1, 2, 3 in order; one per session.
3. **Tests ship with the code;** every error code and invariant is proven by a test.
4. **Done per change:** `node --test` green, no skipped test, no dependency added, README current.
5. **Doc sync before the completing commit:** inline when only status lines change, else delegate to doc-sync (`.claude/agents/doc-sync.md`; `doc-sync.js`, ≤3 rounds, then deferred items).
6. **Merge** only with gates green and the doc-sync commit present. Nothing deploys; there is no deploy state beyond `merged`.
7. **Decisions → `docs/adr/` before merge** (no addenda; open questions in `docs/adr/README.md`).
8. **Claims carry evidence:** no `✅` without a level (`code-read` < `unit` < … < `prod-live`) and an artefact.

Rules and rationale: IMPLEMENTATION_PLAN "Standing rules". Delegation: `.claude/workflows/README.md`.

## Stops and end-of-run report

**Stop and ask** before: adding any dependency · changing a documented error code or the validation order · adding persistence, async, or I/O · starting a phase before the previous one is finished; or when two docs disagree on something the task depends on.
**End every run with four lines:** Blocked on me · Changed · Found · Could not confirm.

## Current status

| | What | Deploy state | Evidence |
|---|---|---|---|
| **Last completed** | Keel documentation suite generated | on-branch | CHANGELOG `[Unreleased]` |
| **Now** | Phase 1 — Items and stock (not started) | — | — |

## Working agreements

- Definition of done per change: tests green, README current, docs synced (details: `docs/IMPLEMENTATION_PLAN.md`).
- Four open decisions (OD-01..OD-04) were defaulted as `[ASSUMPTION]`; confirm with the founder before the phase that builds each.
- Negative results are recorded ("confirmed not a bug" is a row, not silence).
- When this file and a referenced doc disagree, **the referenced doc wins** — fix the pointer, not the doc.

## Pre-PR checklist

- [ ] (1) on hand ≥ 0 and reserved ≤ on hand; `ship` uses available only
- [ ] (2) failing calls change nothing and consume no `seq`
- [ ] (3) every error code has a test and the LLD §4 order is kept
- [ ] (4) caller input copied, returns copied/frozen, `Map` for caller-keyed state
- [ ] (5) no import outside `node:` built-ins
- [ ] (6) README examples/error table updated and under test
- [ ] `docs/COMMANDS.md` updated if a command changed
