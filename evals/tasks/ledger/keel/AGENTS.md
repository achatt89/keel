# ledger — AGENTS.md

ledger is a command-line tool that splits shared expenses in a small group (Node.js 20+, standard library only, one JSON file). Exact money to the cent ranks above convenience.

This file is deliberately light. The documents below are the source of truth — read the relevant one *before* touching code.

## Document map

| Read this | When you are |
|---|---|
| `docs/BRD.md` | Asking "what must it do?" — objectives, constraints, every requirement by ID (the command contract lives here; no PRD) |
| `docs/ARCHITECTURE.md` | Writing code — principles, data file format, module contracts (§4), error/exit contract (§5) |
| `docs/adr/README.md` | Wondering "why is it like this?" — decision index + open decisions (OD-01..06, all defaulted `[ASSUMPTION]`) |
| `docs/IMPLEMENTATION_PLAN.md` | Picking up work — phases 0–2, exit gates, standing rules, changes, deferred items |
| `CHANGELOG.md` | Asking "what shipped, in what state?" |
| `README.md` | Running the tool or its tests |
| `docs/keel-transcript.md` | Tracing where a requirement or `[ASSUMPTION]` came from |

Deliberately omitted (tier = Prototype, CLI only, no remote environment): PRD, ENGINEERING_DESIGN, HLD, LLD (module contracts are ARCHITECTURE §4), NFR, DESIGN/PRODUCT (no UI), COMPLIANCE, THREAT_MODEL (no personal data, no network; stance in BRD §7), DEPLOYMENT, RUNBOOK, COMMANDS (README + this file), FEEDBACK_ROUNDS, almanac. Bring one back when its trigger appears (e.g. DEPLOYMENT if it is ever hosted; NFR if performance matters).

## Hard invariants (rationale: `docs/ARCHITECTURE.md` §1)

| # | Rule | Enforced by | Gap | Source |
|---|---|---|---|---|
| 1 | Money is integer cents everywhere; no floats in any amount, share, balance or transfer | `src/money.js` is the only parse/format/split code; unit + property tests | Not yet built (Phase 0); no lint — `parseFloat`/`Number(` on amounts is review-enforced until a test greps for it | ADR-001, MNY-001 |
| 2 | Shares always sum to the amount; leftover cents go one each to participants in alphabetical order | `splitCents` unit + property tests | Not yet built (Phase 0) | MNY-002 |
| 3 | Every invalid input → `error: …` on stderr, empty stdout, exit 2; success exit 0; no other exit codes | single top-level handler in `cli.js`; spawned-CLI tests | Not yet built (Phase 0) | VAL-002, ARCH §5 |
| 4 | Validate before any write; a failed command never changes the data file | order of operations in `commands/*`; tests assert file unchanged | Not yet built (Phase 1) | ARCH P-04 |
| 5 | Ids are positive integers from 1, never reused (persisted `nextId`) | `store.js` + round-trip test | Not yet built (Phase 0/1) | ADD-003, ADR-002 |
| 6 | Standard library only — no npm dependencies, no network | no `dependencies` in `package.json`; Phase 2 gate | Not yet built | CON-001, CON-004 |
| 7 | Tests never touch the real `./ledger.json` — always a temp `LEDGER_FILE` | test helper creates a temp dir | Not yet built (Phase 0) | IMPLEMENTATION_PLAN Standing rules |

## Git & working workflow (mandatory — the build loop)

0. **Version control from commit one.** This folder is a git repo with no commits yet: make an initial commit (the generated docs) on `main` before any feature work.
1. **Two units of work.** A **Phase** (gated milestone) runs its workflow script on `phase-N-<slug>` off `main`. A **Change** (`CHG-xxx`: hotfix, small fix) is `/keel change <slug>` → `chg/<slug>` off `main`, a Changes-table row and a CHANGELOG line. Never commit directly to `main`. New phases: `/keel phase new <slug>`.
2. **Run the phase workflow script:** `claude --workflow .claude/workflows/phase-N-<slug>.js` (or the Workflow tool). It reserves ADR IDs, branches `phase-N-<slug>`, fans divisible tasks out as parallel agents in separate `git worktree`s (one per task, never shared), each opening with `/goal`; task branches merge back into the phase branch; **Verify** writes `.keel/evidence/phase-N.json`; only the phase branch (tasks + evidence + doc-sync commit) merges to `main`. Exit strategy when stuck: bounded retries (3), then escalate (IMPLEMENTATION_PLAN Standing rules).
3. **Write tests with the code, never after** (`node --test`). "No test needed" is a stated judgement, not a default.
4. **Definition of done:** `node --test` green · no new dependency · every new error path tested (stderr prefix + exit 2 + empty stdout) · doc-sync commit (IMPLEMENTATION_PLAN Standing rules).
5. **Doc sync before the commit that completes any piece of work.** Delegate to the **doc-sync** subagent (`.claude/agents/doc-sync.md`): it updates this file's status · IMPLEMENTATION_PLAN tables · `docs/adr/` · CHANGELOG `[Unreleased]` · touched docs, citing the evidence file, and returns a Report. Check the Report against `git log` / `git diff main --name-only` / the evidence file; send gaps back. **Hard cap: 3 rounds**, then record leftovers as Deferred items rows and proceed. `.claude/workflows/doc-sync.js` runs this loop, then auto-archives/splits on budget breach.
6. **Merge to `main`** only after gates pass and the doc-sync commit is present. There is no deploy; `merged` is the final deploy state, recorded in CHANGELOG only.
7. **Decisions captured without fail.** Any decision → `docs/adr/ADR-xxx-<slug>.md` before merge (reserved ID or taken at Integrate; never in a worktree). No addenda: one `Build deviation` row, else a superseding ADR. Open questions are rows in `docs/adr/README.md`.
8. **Claims carry evidence.** Nothing is `✅` without a level (`code-read` < `unit` < `integration` < `local-browser` < `staging` < `prod-live`) and an artefact. Only a deploy can write `prod-live` — this project has none, so it never will. Overclaiming is a defect.

(No security or design reviewer: the security-audit skill was declined and there is no UI. Add the role and the "Review before done" step if that changes.)

## Delegation (callers supervise their subagents)

The agent doing the work is the **caller**; the doc-sync subagent works for it. It returns a fixed `## Report` (role · caller · scope · status · changed · checked · findings · evidence · not verified · needs from caller), never commits, pushes or messages anyone but its caller. The caller reads the Report, decides the next step (accept / specific follow-up, max 3 rounds / escalate) and commits.

## Current status

| | What | Deploy state | Evidence |
|---|---|---|---|
| **Last completed** | Keel documentation suite generated (docs only, no code) | on-branch | `CHANGELOG.md` |
| **Now** | Phase 0 — Foundations (not started) | — | — |

## Working agreements

- Definition of done per change: see Git workflow step 4.
- New decisions → `docs/adr/`; new accepted risks → `docs/ARCHITECTURE.md` §7; new assumptions → `[ASSUMPTION]` + a row in `docs/adr/README.md` Open decisions.
- Negative results are recorded ("confirmed not a bug" is a row, not silence).
- When this file and a referenced doc disagree, **the referenced doc wins** — fix the pointer, not the doc.

## Pre-PR checklist

- [ ] (1) no floats on money; all cents math via `src/money.js`
- [ ] (2) shares sum to the amount; leftover cents alphabetical
- [ ] (3) every new error path: `error:` on stderr, empty stdout, exit 2
- [ ] (4) validation happens before any write
- [ ] (5) ids never reused
- [ ] (6) no dependency, no network
- [ ] (7) tests use a temp `LEDGER_FILE`
- [ ] new decision → `docs/adr/`; new punt → deferred items (owner + revisit trigger)
- [ ] `README.md` updated if a command or env var changed
- [ ] doc-sync Report reviewed; gaps fixed or (after 3 rounds) logged as deferred items
- [ ] doc-sync commit present; `node .keel/doc-size.mjs` passes (this file under 12 KB)
